// Conexión de Abi con su "cerebro" (la función abi-chat de Supabase, que habla con Claude).
// La dirección de la función no es secreta: la clave de Claude está guardada en Supabase,
// nunca aquí.
import { songById } from '../data/songs';
import { techniqueById, techniques } from '../data/techniques';
import { warmupRoutines, warmupSteps } from '../data/warmups';

/**
 * Dirección de la función abi-chat. Se puede cambiar al compilar con EXPO_PUBLIC_ABI_URL.
 * Mientras esté vacía, Abi solo da sus consejos de siempre y explica que aún no puede charlar.
 */
export const ABI_URL: string = process.env.EXPO_PUBLIC_ABI_URL ?? '';

export const abiOnline = () => ABI_URL.length > 0;

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

// Lista corta de recursos para que Abi sepa qué fichas existen y pueda enlazarlas.
const catalog = techniques
  .map((t) => `${t.id}: ${t.name} (${t.category}, ${t.level}) — ${t.summary}`)
  .join('\n');

/** Describe en texto la pantalla en la que está la persona, para que Abi entienda la pregunta. */
export function describePage(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const i = parts.findIndex((p) => p === 'cancion' || p === 'recurso');
  if (i >= 0 && parts[i] === 'cancion') {
    const s = songById(parts[i + 1]);
    if (s) {
      const used = [...new Set(s.occurrences.map((o) => techniqueById(o.techniqueId)?.name))]
        .filter(Boolean)
        .join(', ');
      return (
        `Ficha de la canción «${s.title}» (${s.artist}). Tonalidad: ${s.mainKey}; ` +
        `tesitura ${s.vocalRange.low}–${s.vocalRange.high}; dificultad ${s.difficulty}; ${s.bpm} BPM. ` +
        `Partes: ${s.sections.map((x) => x.label).join(', ')}. Recursos vocales que aparecen: ${used}. ` +
        'La pantalla tiene el vídeo arriba, el mapa de colores de la canción, la letra con las palabras ' +
        'marcadas por recurso, tonalidades (se puede transponer) y partitura del fragmento analizado.'
      );
    }
  }
  if (i >= 0 && parts[i] === 'recurso') {
    const t = techniqueById(parts[i + 1]);
    if (t) {
      return (
        `Ficha del recurso «${t.name}» [${t.id}]: ${t.whatIs} Ejercicios en la ficha: ` +
        `${t.exercises.map((e) => e.title).join('; ')}.`
      );
    }
  }
  if (path.includes('recursos')) {
    return 'Explorador de recursos vocales, organizados por categorías y por nivel.';
  }
  if (path.includes('calentamiento')) {
    return (
      'Pantalla de calentamiento vocal. Rutinas: ' +
      warmupRoutines.map((r) => `${r.name} (${r.description})`).join('; ') +
      '. Ejercicios: ' +
      warmupSteps.map((s) => `${s.name}: ${s.goal}`).join('; ') +
      '. Se pulsa «Empezar» y un temporizador pasa de un ejercicio al siguiente.'
    );
  }
  return (
    'Inicio: buscador de canciones (por título, artista o trozo de letra), tarjetas de canciones ' +
    'con etiquetas de colores de sus recursos vocales, y accesos a canciones, recursos y calentamiento.'
  );
}

/** Pregunta a Abi. Devuelve su respuesta o lanza un Error con un mensaje legible. */
export async function askAbi(messages: ChatTurn[], path: string): Promise<string> {
  if (!abiOnline()) throw new Error('Abi todavía no está conectada a su cerebro.');
  let res: Response;
  try {
    res = await fetch(ABI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-12), page: describePage(path), catalog }),
    });
  } catch {
    throw new Error('No hay conexión. Revisa tu internet y prueba otra vez.');
  }
  const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
  if (!res.ok || !data.reply) throw new Error(data.error ?? 'Abi no ha podido responder.');
  return data.reply;
}

/** Trocea una respuesta de Abi en texto y enlaces a recursos ([[vibrato]]). */
export function splitLinks(text: string): ({ text: string } | { id: string; name: string; color: string })[] {
  const out: ({ text: string } | { id: string; name: string; color: string })[] = [];
  const re = /\[\[([a-z0-9-]+)\]\]/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    const t = techniqueById(m[1]);
    out.push(t ? { id: t.id, name: t.name, color: t.color } : { text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}
