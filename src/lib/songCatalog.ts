// Buscar cualquier canción y pedir su ficha automática.
//
// La búsqueda usa el catálogo de Deezer, que es gratuito y no necesita clave. Si la función
// song-analysis de Supabase está configurada, todo pasa por ella; si no, la web pregunta a Deezer
// directamente (en la web con JSONP, porque Deezer no permite otras webs con fetch).
// La ficha (estructura, tonalidades, recursos vocales) solo existe con la función configurada,
// porque necesita la clave de Claude, que vive en Supabase y nunca en la web.
import { Platform } from 'react-native';
import type { SectionType, SourceLink } from '../data/types';

/** Dirección de la función song-analysis. Se puede cambiar al compilar con EXPO_PUBLIC_SONG_ANALYSIS_URL. */
export const SONG_ANALYSIS_URL: string = process.env.EXPO_PUBLIC_SONG_ANALYSIS_URL ?? '';
export const analysisOnline = () => SONG_ANALYSIS_URL.length > 0;

export interface CatalogTrack {
  /** Id de Deezer. */
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  /** Segundos. */
  duration?: number;
  /** Fragmento de 30 s (mp3). */
  preview?: string;
  releaseDate?: string;
}

export interface AutoTechnique {
  techniqueId: string;
  section: string;
  where: string;
  note: string;
  confidence: number;
}

/** Ficha generada por la IA. Todos los datos son estimaciones. */
export interface SongAnalysis {
  version: number;
  track: CatalogTrack;
  releaseDate: string | null;
  deezerBpm: number | null;
  model: string;
  generatedAt: string;
  known: boolean;
  genre: string;
  year: string;
  language: string;
  mainKey: string;
  keys: { key: string; start: number; end: number; note: string }[];
  bpm: number;
  timeSignature: string;
  vocalRange: { low: string; high: string };
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  about: string;
  sections: { type: SectionType; label: string; start: number; end: number }[];
  techniques: AutoTechnique[];
  sources: SourceLink[];
  notes: string;
  confidence: number;
}

// Objeto de Deezer → nuestra forma.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDeezer(t: any): CatalogTrack {
  return {
    id: String(t.id),
    title: t.title,
    artist: t.artist?.name ?? '',
    album: t.album?.title,
    cover: t.album?.cover_medium,
    duration: t.duration,
    preview: t.preview || undefined,
    releaseDate: t.release_date,
  };
}

let jsonpCounter = 0;
/** Pide un JSON a Deezer desde la web sin pasar por el servidor (JSONP). */
function jsonp<T>(url: string, timeoutMs = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const name = `__voiceupDeezer${++jsonpCounter}`;
    const script = document.createElement('script');
    const w = window as unknown as Record<string, unknown>;
    const done = () => {
      clearTimeout(timer);
      delete w[name];
      script.remove();
    };
    const timer = setTimeout(() => {
      done();
      reject(new Error('timeout'));
    }, timeoutMs);
    w[name] = (data: T) => {
      done();
      resolve(data);
    };
    script.onerror = () => {
      done();
      reject(new Error('network'));
    };
    script.src = `${url}${url.includes('?') ? '&' : '?'}output=jsonp&callback=${name}`;
    document.head.appendChild(script);
  });
}

function deezer<T>(path: string): Promise<T> {
  const url = `https://api.deezer.com${path}`;
  if (Platform.OS === 'web') return jsonp<T>(url);
  return fetch(url).then((r) => r.json());
}

async function callFunction<T>(body: unknown): Promise<T> {
  const r = await fetch(SONG_ANALYSIS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? `Error ${r.status}`);
  return data as T;
}

/** Busca canciones en todo el catálogo. */
export async function searchCatalog(query: string): Promise<CatalogTrack[]> {
  const q = query.trim();
  if (!q) return [];
  if (analysisOnline()) {
    const { results } = await callFunction<{ results: CatalogTrack[] }>({ action: 'search', q });
    return results;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await deezer<{ data?: any[] }>(`/search?limit=12&q=${encodeURIComponent(q)}`);
  return (data.data ?? []).map(fromDeezer);
}

/** Datos de una canción por su id de Deezer (para abrir la ficha desde un enlace). */
export async function getTrack(id: string): Promise<CatalogTrack | undefined> {
  if (!/^\d+$/.test(id)) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await deezer<any>(`/track/${id}`);
  if (!t || t.error) return undefined;
  return fromDeezer(t);
}

/** Dirección del fragmento de 30 s que la web puede descargar para escucharlo y analizarlo. */
export function previewAudioUrl(track: CatalogTrack) {
  if (analysisOnline()) return `${SONG_ANALYSIS_URL}?preview=${encodeURIComponent(track.id)}`;
  return track.preview;
}

const memory = new Map<string, SongAnalysis>();
const storageKey = (id: string) => `voiceup.ficha.${id}`;

function readSaved(id: string): SongAnalysis | undefined {
  if (memory.has(id)) return memory.get(id);
  try {
    const raw = Platform.OS === 'web' ? window.localStorage.getItem(storageKey(id)) : null;
    if (raw) return JSON.parse(raw);
  } catch {
    // sin almacenamiento local: no pasa nada
  }
  return undefined;
}

function save(a: SongAnalysis) {
  memory.set(a.track.id, a);
  try {
    if (Platform.OS === 'web') window.localStorage.setItem(storageKey(a.track.id), JSON.stringify(a));
  } catch {
    // sin almacenamiento local: no pasa nada
  }
}

export function savedAnalysis(id: string) {
  return readSaved(id);
}

/** Pide la ficha automática. La primera vez la genera la IA; después sale guardada. */
export async function requestAnalysis(track: CatalogTrack): Promise<SongAnalysis> {
  const saved = readSaved(track.id);
  if (saved) return saved;
  const { analysis } = await callFunction<{ analysis: SongAnalysis }>({ action: 'analyze', track });
  save(analysis);
  return analysis;
}

// Enlaces externos. Ninguno necesita clave.
export const geniusSearchUrl = (t: CatalogTrack) =>
  `https://genius.com/search?q=${encodeURIComponent(`${t.artist} ${t.title}`)}`;
export const musixmatchSearchUrl = (t: CatalogTrack) =>
  `https://www.musixmatch.com/search/${encodeURIComponent(`${t.artist} ${t.title}`)}`;
export const deezerTrackUrl = (t: CatalogTrack) => `https://www.deezer.com/track/${t.id}`;
