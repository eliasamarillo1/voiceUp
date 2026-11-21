// Utilidades musicales sencillas: transponer tonalidades y notas en notación española.

const NOTES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const FLATS: Record<string, string> = { Reb: 'Do#', Mib: 'Re#', Solb: 'Fa#', Lab: 'Sol#', Sib: 'La#' };

function indexOf(name: string) {
  const n = FLATS[name] ?? name;
  return NOTES.indexOf(n);
}

/** "Sol mayor" + 2 → "La mayor" */
export function transposeKey(key: string, semitones: number) {
  const [root, ...rest] = key.split(' ');
  const i = indexOf(root);
  if (i < 0) return key;
  const j = (((i + semitones) % 12) + 12) % 12;
  return [NOTES[j], ...rest].join(' ');
}

/** "Re4" + 2 → "Mi4" (con cambio de octava). */
export function transposeNote(note: string, semitones: number) {
  const m = note.match(/^([A-Za-z]+#?b?)(\d)$/);
  if (!m) return note;
  const i = indexOf(m[1]);
  if (i < 0) return note;
  const abs = Number(m[2]) * 12 + i + semitones;
  return `${NOTES[((abs % 12) + 12) % 12]}${Math.floor(abs / 12)}`;
}

const strip = (w: string) => w.replace(/[¡!¿?.,;:"']/g, '');

/** Parte una línea en palabras y marca cuáles tienen un recurso vocal. */
export function tokenizeLine<T extends { word: string }>(text: string, marks: T[]) {
  const tokens = text.split(' ').map((raw) => ({ raw, mark: undefined as T | undefined }));
  for (const m of marks) {
    let idx = tokens.findIndex((t) => !t.mark && strip(t.raw) === m.word);
    if (idx < 0) {
      idx = tokens.findIndex((t) => !t.mark && strip(t.raw).toLowerCase() === m.word.toLowerCase());
    }
    if (idx >= 0) tokens[idx].mark = m;
  }
  return tokens;
}
