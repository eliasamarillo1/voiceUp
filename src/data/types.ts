// Modelo de datos de VoiceUp.
// Todos los tiempos están en segundos desde el inicio de la grabación de referencia.

export type SectionType = 'intro' | 'estrofa' | 'preestribillo' | 'estribillo' | 'puente' | 'final';

export interface Section {
  type: SectionType;
  label: string;
  start: number;
  end: number;
}

export interface KeySpan {
  key: string;
  start: number;
  end: number;
  note?: string;
}

export interface LyricLine {
  start: number;
  end: number;
  text: string;
}

/** Un recurso vocal que aparece en un momento concreto de la canción. */
export interface Occurrence {
  techniqueId: string;
  start: number;
  end: number;
  /** Índice de la línea de letra donde aparece. */
  line: number;
  /** Palabra (tal como aparece en la línea) donde se marca el recurso. */
  word: string;
  note: string;
  /** Cómo se obtuvo: detección automática o revisión humana. */
  origin: 'automatico' | 'revisado';
  /** Fiabilidad de la detección, de 0 a 1. */
  confidence: number;
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  authors: string;
  year: string;
  genre: string;
  language: string;
  bpm: number;
  timeSignature: string;
  duration: number;
  mainKey: string;
  keys: KeySpan[];
  vocalRange: { low: string; high: string };
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  about: string;
  sections: Section[];
  lyrics: LyricLine[];
  occurrences: Occurrence[];
  /** Partitura en MusicXML (solo el fragmento analizado). */
  sheetMusic?: { title: string; musicXml: string };
  /** Vídeo de YouTube con una interpretación de la canción, para escucharla dentro de la app. */
  video: { videoId: string; title: string };
  /** Consulta de búsqueda para abrir la canción en Spotify y YouTube. */
  listenQuery: string;
  sources: SourceLink[];
}

export interface Tutorial {
  videoId: string;
  title: string;
  channel?: string;
  language: 'es' | 'en';
}

export interface Exercise {
  title: string;
  steps: string[];
}

export type TechniqueCategory =
  | 'Adornos y afinación'
  | 'Registros'
  | 'Color y emisión'
  | 'Articulación y dinámica';

export interface Technique {
  id: string;
  name: string;
  category: TechniqueCategory;
  color: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  summary: string;
  whatIs: string;
  howTo: string[];
  commonMistakes: string[];
  exercises: Exercise[];
  tutorials: Tutorial[];
  sources: SourceLink[];
}
