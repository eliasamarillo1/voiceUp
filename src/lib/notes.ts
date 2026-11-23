// Notas, escalas y tonalidades en notación española (Do, Re, Mi…) para el piano.

export const NOTE_NAMES = [
  'Do',
  'Do#',
  'Re',
  'Re#',
  'Mi',
  'Fa',
  'Fa#',
  'Sol',
  'Sol#',
  'La',
  'La#',
  'Si',
];
/** Nombre alternativo de las teclas negras (bemoles). */
export const FLAT_NAMES: Record<number, string> = {
  1: 'Reb',
  3: 'Mib',
  6: 'Solb',
  8: 'Lab',
  10: 'Sib',
};
/** Nombre anglosajón, por si lo ves en partituras o tutoriales en inglés. */
export const LETTER_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ALIASES: Record<string, number> = {
  do: 0,
  'do#': 1,
  reb: 1,
  re: 2,
  're#': 3,
  mib: 3,
  mi: 4,
  fa: 5,
  'fa#': 6,
  solb: 6,
  sol: 7,
  'sol#': 8,
  lab: 8,
  la: 9,
  'la#': 10,
  sib: 10,
  si: 11,
};

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];

export type Mode = 'mayor' | 'menor';
export interface MusicKey {
  tonic: number; // 0 = Do … 11 = Si
  mode: Mode;
}

const isBlack = (pc: number) => [1, 3, 6, 8, 10].includes(pc);
export const isBlackKey = (midi: number) => isBlack(((midi % 12) + 12) % 12);

/** "La menor", "Mib mayor", "do# menor" → { tonic, mode }. Devuelve null si no se entiende. */
export function parseKey(text: string | undefined | null): MusicKey | null {
  if (!text) return null;
  const m = text
    .trim()
    .toLowerCase()
    .match(/^([a-z]+[#b]?)\s+(mayor|menor)/);
  if (!m) return null;
  const tonic = ALIASES[m[1]];
  if (tonic === undefined) return null;
  return { tonic, mode: m[2] as Mode };
}

/** Nombre de una nota de escala, usando bemoles en las tonalidades que los usan. */
function pcName(pc: number, preferFlats: boolean) {
  return preferFlats && FLAT_NAMES[pc] ? FLAT_NAMES[pc] : NOTE_NAMES[pc];
}

// Tonalidades que se escriben con bemoles (Fa, Sib, Mib… y sus relativas menores).
const FLAT_MAJORS = [5, 10, 3, 8, 1, 6];
export function prefersFlats(k: MusicKey) {
  const major = k.mode === 'mayor' ? k.tonic : (k.tonic + 3) % 12;
  return FLAT_MAJORS.includes(major);
}

export function keyLabel(k: MusicKey) {
  return `${pcName(k.tonic, prefersFlats(k))} ${k.mode}`;
}

/** Las 7 notas de la escala (clases de altura 0–11), empezando por la tónica. */
export function scaleOf(k: MusicKey) {
  return (k.mode === 'mayor' ? MAJOR : MINOR).map((i) => (k.tonic + i) % 12);
}

export function scaleNames(k: MusicKey) {
  const flats = prefersFlats(k);
  return scaleOf(k).map((pc) => pcName(pc, flats));
}

/** Acordes principales de la tonalidad (I, IV, V y el relativo). */
export function mainChords(k: MusicKey) {
  const flats = prefersFlats(k);
  const n = (pc: number) => pcName(((pc % 12) + 12) % 12, flats);
  if (k.mode === 'mayor') {
    return [n(k.tonic), n(k.tonic + 5), n(k.tonic + 7), `${n(k.tonic + 9)}m`];
  }
  return [`${n(k.tonic)}m`, `${n(k.tonic + 5)}m`, n(k.tonic + 7), n(k.tonic + 3)];
}

/** MIDI 60 = Do4 (el Do central). */
export function midiName(midi: number, preferFlats = false) {
  const pc = ((midi % 12) + 12) % 12;
  return `${pcName(pc, preferFlats)}${Math.floor(midi / 12) - 1}`;
}

export function midiLetter(midi: number) {
  const pc = ((midi % 12) + 12) % 12;
  return `${LETTER_NAMES[pc]}${Math.floor(midi / 12) - 1}`;
}

export function midiFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Todas las tonalidades, para el selector. */
export const ALL_KEYS: MusicKey[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap((tonic) => [
  { tonic, mode: 'mayor' as Mode },
  { tonic, mode: 'menor' as Mode },
]);
