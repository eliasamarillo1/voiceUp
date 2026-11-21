// Fichas automáticas de canciones de VoiceUp.
//
// Esta función vive en Supabase (Edge Function). Hace tres cosas:
//   1. Buscar cualquier canción en el catálogo de Deezer (gratis, sin clave).
//   2. Servir el fragmento de 30 segundos de Deezer a la web, para que la web calcule
//      la tonalidad y el tempo escuchándolo (Deezer no deja que la web lo descargue directamente).
//   3. Generar la ficha de la canción con Claude: estructura, tonalidades, tesitura y recursos
//      vocales. Todo sale marcado como estimación. Cada ficha se guarda en la tabla
//      song_analyses, así que cada canción se paga una sola vez.
//
// Secretos que usa (en Supabase: Edge Functions → Secrets):
//   ANTHROPIC_API_KEY          la misma clave de Claude que usa el chat de Abi.
//   SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY  los pone Supabase solo; no hay que crearlos.
//
// Peticiones (POST, cuerpo JSON):
//   { action: 'search', q }                      → { results: CatalogTrack[] }
//   { action: 'analyze', track: CatalogTrack }   → { analysis: SongAnalysis, cached: boolean }
// Petición GET:
//   ?preview=<id de Deezer>                      → audio mp3 de 30 s

import Anthropic from 'npm:@anthropic-ai/sdk@1';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Claude Opus 5.5: el que mejor conoce las canciones. Como cada ficha se guarda, se paga una vez.
const MODEL = 'claude-opus-5-5';
const ANALYSIS_VERSION = 1;

// Webs que pueden usar la función. Añade aquí tu dominio si algún día cambia.
const ALLOWED_ORIGINS = [
  'https://eliasamarillo1.github.io',
  'http://localhost:8081',
  'http://localhost:19006',
];

// Límites para que nadie gaste tu saldo: fichas nuevas por minuto y por persona, y en total al día.
const NEW_PER_MINUTE = 3;
const NEW_PER_DAY = 200;

// Recursos vocales que tienen ficha en la web (src/data/techniques.ts). Claude solo puede usar estos.
const TECHNIQUES = [
  'vibrato', 'glissando', 'portamento', 'melisma', 'falsete', 'riffs', 'voz-pecho',
  'voz-cabeza', 'voz-mixta', 'quiebre', 'belting', 'twang', 'voz-aireada', 'vocal-fry',
  'voz-rasgada', 'sollozo', 'legato', 'staccato', 'messa-di-voce',
];
const SECTION_TYPES = ['intro', 'estrofa', 'preestribillo', 'estribillo', 'puente', 'final'];

type CatalogTrack = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  duration?: number;
  isrc?: string;
};

const SYSTEM = `Eres una profesora de canto y musicóloga. Preparas fichas de canciones para VoiceUp, una web en español para aprender a cantar.

Para la canción que te pasen, rellena la ficha:
- Estructura: las partes en orden (intro, estrofas, preestribillo, estribillo, puente, final) con su segundo aproximado de inicio y fin en la grabación original.
- Tonalidad principal y cambios de tonalidad (modulaciones), en notación española (Do, Re, Mi, Fa, Sol, La, Si; "Do# menor", "Mib mayor").
- Tempo en BPM, compás y tesitura de la voz principal (nota más grave y más aguda, en notación científica española, por ejemplo "Fa3" y "Do5").
- Los recursos vocales más claros de la canción, con la parte donde aparecen y una frase que explique cómo se oyen ahí. Usa solo los ids de la lista.
- Dificultad para alguien que aprende a cantar, y un párrafo corto sobre la canción y su interpretación vocal.

Reglas:
- Si puedes, busca en la web (fichas de tonalidad y tempo, análisis musicales, entrevistas) para confirmar los datos. Prefiere fuentes fiables.
- No copies la letra. Como mucho, cita 3 a 6 palabras para señalar dónde está un recurso.
- Si no conoces la canción o no encuentras datos fiables, dilo en "notes", pon confidence bajo y no inventes.
- confidence es tu seguridad de 0 a 1 en cada dato.
- Escribe en español, claro y sin tecnicismos innecesarios.
- Devuelve solo la ficha en el formato pedido.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'known', 'genre', 'year', 'language', 'mainKey', 'keys', 'bpm', 'timeSignature',
    'vocalRange', 'difficulty', 'about', 'sections', 'techniques', 'sources', 'notes',
    'confidence',
  ],
  properties: {
    known: { type: 'boolean', description: 'true si conoces o encontraste datos fiables de la canción' },
    genre: { type: 'string' },
    year: { type: 'string' },
    language: { type: 'string' },
    mainKey: { type: 'string' },
    keys: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['key', 'start', 'end', 'note'],
        properties: {
          key: { type: 'string' },
          start: { type: 'number' },
          end: { type: 'number' },
          note: { type: 'string' },
        },
      },
    },
    bpm: { type: 'number' },
    timeSignature: { type: 'string' },
    vocalRange: {
      type: 'object',
      additionalProperties: false,
      required: ['low', 'high'],
      properties: { low: { type: 'string' }, high: { type: 'string' } },
    },
    difficulty: { type: 'string', enum: ['Principiante', 'Intermedio', 'Avanzado'] },
    about: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'label', 'start', 'end'],
        properties: {
          type: { type: 'string', enum: SECTION_TYPES },
          label: { type: 'string' },
          start: { type: 'number' },
          end: { type: 'number' },
        },
      },
    },
    techniques: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['techniqueId', 'section', 'where', 'note', 'confidence'],
        properties: {
          techniqueId: { type: 'string', enum: TECHNIQUES },
          section: { type: 'string', description: 'label de la parte donde aparece' },
          where: { type: 'string', description: 'pocas palabras de la letra o momento, sin copiar la letra' },
          note: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'url'],
        properties: { label: { type: 'string' }, url: { type: 'string' } },
      },
    },
    notes: { type: 'string' },
    confidence: { type: 'number' },
  },
} as const;

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
const db =
  Deno.env.get('SUPABASE_URL') && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    ? createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
        auth: { persistSession: false },
      })
    : null;

const hits = new Map<string, number[]>();
let today = '';
let todayCount = 0;
function tooMany(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  if (day !== today) {
    today = day;
    todayCount = 0;
  }
  if (todayCount >= NEW_PER_DAY) return true;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= NEW_PER_MINUTE) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  todayCount++;
  return false;
}

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    Vary: 'Origin',
  };
}

// deno-lint-ignore no-explicit-any
function toTrack(t: any): CatalogTrack {
  return {
    id: String(t.id),
    title: t.title,
    artist: t.artist?.name ?? '',
    album: t.album?.title,
    cover: t.album?.cover_medium,
    duration: t.duration,
    isrc: t.isrc,
  };
}

async function search(q: string) {
  const r = await fetch(`https://api.deezer.com/search?limit=12&q=${encodeURIComponent(q)}`);
  const data = await r.json();
  return ((data?.data ?? []) as unknown[]).map(toTrack);
}

async function analyze(track: CatalogTrack, ip: string) {
  if (db) {
    const { data } = await db
      .from('song_analyses')
      .select('analysis, version')
      .eq('deezer_id', track.id)
      .maybeSingle();
    if (data && data.version >= ANALYSIS_VERSION) return { analysis: data.analysis, cached: true };
  }
  if (tooMany(ip)) {
    return { error: 'Se han generado muchas fichas seguidas. Prueba otra vez en un minuto.', status: 429 };
  }

  // Datos reales de Deezer: fecha de publicación y tempo (cuando lo tiene).
  // deno-lint-ignore no-explicit-any
  let deezer: any = {};
  try {
    deezer = await (await fetch(`https://api.deezer.com/track/${encodeURIComponent(track.id)}`)).json();
  } catch {
    // seguimos sin esos datos
  }

  const prompt =
    `Canción: «${track.title}»\nArtista: ${track.artist}\n` +
    (track.album ? `Álbum: ${track.album}\n` : '') +
    (deezer.release_date ? `Fecha de publicación: ${deezer.release_date}\n` : '') +
    (track.duration ? `Duración de la grabación: ${track.duration} segundos\n` : '') +
    (deezer.bpm ? `Tempo según Deezer: ${deezer.bpm} BPM\n` : '') +
    (deezer.isrc ? `ISRC: ${deezer.isrc}\n` : '');

  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 }],
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });

  if (response.stop_reason === 'refusal') {
    return { error: 'No se pudo generar la ficha de esta canción.', status: 422 };
  }
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('');
  let ai;
  try {
    ai = JSON.parse(text);
  } catch {
    return { error: 'La ficha salió incompleta. Prueba otra vez.', status: 502 };
  }

  const analysis = {
    version: ANALYSIS_VERSION,
    track,
    releaseDate: deezer.release_date ?? null,
    deezerBpm: deezer.bpm || null,
    model: response.model,
    generatedAt: new Date().toISOString(),
    ...ai,
  };
  if (db) {
    await db.from('song_analyses').upsert({
      deezer_id: track.id,
      title: track.title,
      artist: track.artist,
      version: ANALYSIS_VERSION,
      analysis,
    });
  }
  return { analysis, cached: false };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = { ...cors(origin), 'Content-Type': 'application/json' };
  const send = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers });

  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  // El audio lo pide la propia web con fetch, así que también comprobamos el origen.
  if (req.method === 'GET') {
    const id = new URL(req.url).searchParams.get('preview');
    if (!id || !/^\d+$/.test(id)) return send(400, { error: 'Falta el id.' });
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return send(403, { error: 'Origen no permitido.' });
    const t = await (await fetch(`https://api.deezer.com/track/${id}`)).json();
    if (!t?.preview) return send(404, { error: 'Esta canción no tiene fragmento.' });
    const audio = await fetch(t.preview);
    return new Response(audio.body, {
      headers: { ...cors(origin), 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  if (req.method !== 'POST') return send(405, { error: 'Método no admitido.' });
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return send(403, { error: 'Esta web no puede usar la función.' });
  }

  let body: { action?: string; q?: string; track?: CatalogTrack };
  try {
    body = await req.json();
  } catch {
    return send(400, { error: 'Petición no válida.' });
  }

  try {
    if (body.action === 'search') {
      const q = (body.q ?? '').trim().slice(0, 120);
      if (!q) return send(200, { results: [] });
      return send(200, { results: await search(q) });
    }
    if (body.action === 'analyze') {
      const t = body.track;
      if (!t?.id || !/^\d+$/.test(t.id) || !t.title || !t.artist) {
        return send(400, { error: 'Falta la canción.' });
      }
      const track: CatalogTrack = {
        id: t.id,
        title: String(t.title).slice(0, 200),
        artist: String(t.artist).slice(0, 200),
        album: t.album ? String(t.album).slice(0, 200) : undefined,
        cover: typeof t.cover === 'string' && t.cover.startsWith('https://') ? t.cover : undefined,
        duration: Number(t.duration) || undefined,
      };
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
      const result = await analyze(track, ip);
      if ('error' in result) return send(result.status ?? 500, { error: result.error });
      return send(200, result);
    }
    return send(400, { error: 'Acción desconocida.' });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return send(429, { error: 'Hay mucha gente generando fichas. Prueba en un momento.' });
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return send(500, { error: 'La clave de Claude no es válida o falta.' });
    }
    if (e instanceof Anthropic.APIError) {
      return send(502, { error: `Claude no respondió (${e.status}).` });
    }
    console.error(e);
    return send(500, { error: 'Algo falló al generar la ficha.' });
  }
});
