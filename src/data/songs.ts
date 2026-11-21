import type { Occurrence, Song } from './types';
import { amazingGraceXml } from './sheets/amazingGrace';

// Canciones de ejemplo. Se han elegido canciones de dominio público para poder mostrar la letra
// completa sin problemas de licencia. Los tiempos y el análisis son ILUSTRATIVOS: sirven para
// probar la interfaz, no salen de una grabación concreta.

const occ = (
  techniqueId: string,
  line: number,
  word: string,
  start: number,
  end: number,
  note: string,
  origin: Occurrence['origin'] = 'automatico',
  confidence = 0.8,
): Occurrence => ({ techniqueId, line, word, start, end, note, origin, confidence });

export const songs: Song[] = [
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'Himno tradicional',
    authors: 'Letra: John Newton (1779) · Melodía: "New Britain" (1829)',
    year: '1779',
    genre: 'Góspel / himno',
    language: 'Inglés',
    bpm: 72,
    timeSignature: '3/4',
    duration: 120,
    mainKey: 'Sol mayor',
    keys: [
      { key: 'Sol mayor', start: 0, end: 72 },
      { key: 'La mayor', start: 72, end: 120, note: 'Modulación de un tono hacia arriba en la tercera estrofa' },
    ],
    vocalRange: { low: 'Re4', high: 'Mi5' },
    difficulty: 'Principiante',
    about:
      'Uno de los himnos más cantados del mundo. Su melodía lenta y con notas largas lo convierte en una canción ideal para trabajar el vibrato, el legato y los adornos sencillos.',
    sections: [
      { type: 'intro', label: 'Intro', start: 0, end: 8 },
      { type: 'estrofa', label: 'Estrofa 1', start: 8, end: 40 },
      { type: 'estrofa', label: 'Estrofa 2', start: 40, end: 72 },
      { type: 'estrofa', label: 'Estrofa 3', start: 72, end: 104 },
      { type: 'final', label: 'Final', start: 104, end: 120 },
    ],
    lyrics: [
      { start: 8, end: 16, text: 'Amazing grace, how sweet the sound' },
      { start: 16, end: 24, text: 'That saved a wretch like me' },
      { start: 24, end: 32, text: 'I once was lost, but now am found' },
      { start: 32, end: 40, text: 'Was blind, but now I see' },
      { start: 40, end: 48, text: "'Twas grace that taught my heart to fear" },
      { start: 48, end: 56, text: 'And grace my fears relieved' },
      { start: 56, end: 64, text: 'How precious did that grace appear' },
      { start: 64, end: 72, text: 'The hour I first believed' },
      { start: 72, end: 80, text: 'Through many dangers, toils and snares' },
      { start: 80, end: 88, text: 'I have already come' },
      { start: 88, end: 96, text: "'Tis grace hath brought me safe thus far" },
      { start: 96, end: 104, text: 'And grace will lead me home' },
      { start: 104, end: 120, text: 'Was blind, but now I see' },
    ],
    occurrences: [
      occ('melisma', 0, 'Amazing', 9, 11, 'Dos notas ligadas sobre la sílaba "ma" (Sol-Si-Sol).', 'revisado', 1),
      occ('vibrato', 0, 'sound', 13.5, 16, 'Vibrato suave al final de la primera frase.', 'automatico', 0.86),
      occ('portamento', 1, 'me', 21.5, 23.5, 'Enlace corto entre "like" y "me".', 'automatico', 0.64),
      occ('vibrato', 3, 'see', 37, 40, 'Nota larga de cierre de estrofa.', 'automatico', 0.9),
      occ('portamento', 5, 'relieved', 53, 56, 'Caída suave hacia la nota final.', 'automatico', 0.58),
      occ('melisma', 6, 'appear', 61, 63, 'Adorno de tres notas.', 'automatico', 0.71),
      occ('glissando', 8, 'Through', 72, 73.5, 'Subida deslizada que prepara la modulación.', 'automatico', 0.67),
      occ('vibrato', 11, 'home', 100, 104, 'Vibrato amplio en la nota más aguda de la canción.', 'automatico', 0.88),
      occ('falsete', 12, 'see', 110, 116, 'Final suave y aireado en falsete.', 'automatico', 0.62),
    ],
    sheetMusic: { title: 'Primera frase (Estrofa 1)', musicXml: amazingGraceXml },
    listenQuery: 'Amazing Grace',
    sources: [
      { label: 'Amazing Grace en Wikipedia', url: 'https://es.wikipedia.org/wiki/Sublime_gracia' },
    ],
  },
  {
    id: 'cielito-lindo',
    title: 'Cielito Lindo',
    artist: 'Canción popular mexicana',
    authors: 'Quirino Mendoza y Cortés (1882)',
    year: '1882',
    genre: 'Huapango / mariachi',
    language: 'Español',
    bpm: 138,
    timeSignature: '3/4',
    duration: 150,
    mainKey: 'Re mayor',
    keys: [{ key: 'Re mayor', start: 0, end: 150 }],
    vocalRange: { low: 'La3', high: 'Re5' },
    difficulty: 'Intermedio',
    about:
      'Una de las canciones mexicanas más conocidas. El estribillo "¡Ay, ay, ay, ay!" es perfecto para practicar el quiebre entre voz de pecho y falsete típico del mariachi.',
    sections: [
      { type: 'intro', label: 'Intro', start: 0, end: 10 },
      { type: 'estrofa', label: 'Estrofa 1', start: 10, end: 40 },
      { type: 'estribillo', label: 'Estribillo', start: 40, end: 70 },
      { type: 'estrofa', label: 'Estrofa 2', start: 70, end: 100 },
      { type: 'estribillo', label: 'Estribillo', start: 100, end: 130 },
      { type: 'final', label: 'Final', start: 130, end: 150 },
    ],
    lyrics: [
      { start: 10, end: 17, text: 'De la Sierra Morena,' },
      { start: 17, end: 25, text: 'cielito lindo, vienen bajando' },
      { start: 25, end: 32, text: 'un par de ojitos negros,' },
      { start: 32, end: 40, text: 'cielito lindo, de contrabando' },
      { start: 40, end: 46, text: '¡Ay, ay, ay, ay!' },
      { start: 46, end: 52, text: 'Canta y no llores' },
      { start: 52, end: 61, text: 'porque cantando se alegran,' },
      { start: 61, end: 70, text: 'cielito lindo, los corazones' },
      { start: 70, end: 77, text: 'Ese lunar que tienes,' },
      { start: 77, end: 85, text: 'cielito lindo, junto a la boca' },
      { start: 85, end: 92, text: 'no se lo des a nadie,' },
      { start: 92, end: 100, text: 'cielito lindo, que a mí me toca' },
      { start: 100, end: 106, text: '¡Ay, ay, ay, ay!' },
      { start: 106, end: 112, text: 'Canta y no llores' },
      { start: 112, end: 121, text: 'porque cantando se alegran,' },
      { start: 121, end: 130, text: 'cielito lindo, los corazones' },
      { start: 130, end: 150, text: 'los corazones' },
    ],
    occurrences: [
      occ('vibrato', 1, 'bajando', 22, 25, 'Vibrato en la nota larga de final de verso.', 'automatico', 0.82),
      occ('vibrato', 3, 'contrabando', 37, 40, 'Mismo gesto que en "bajando".', 'automatico', 0.8),
      occ('falsete', 4, 'Ay', 40, 42, 'Quiebre de pecho a falsete, típico del mariachi.', 'revisado', 1),
      occ('portamento', 4, 'ay', 43, 46, 'Bajada ligada entre los "ay".', 'automatico', 0.7),
      occ('portamento', 5, 'llores', 49, 52, 'Caída expresiva al final de la palabra.', 'automatico', 0.6),
      occ('melisma', 7, 'corazones', 66, 70, 'Adorno sobre "zo".', 'automatico', 0.66),
      occ('glissando', 11, 'toca', 97, 100, 'Subida deslizada hacia el estribillo.', 'automatico', 0.55),
      occ('falsete', 12, 'Ay', 100, 102, 'Segundo quiebre a falsete.', 'automatico', 0.84),
      occ('vibrato', 16, 'corazones', 138, 150, 'Nota final larga con vibrato amplio.', 'automatico', 0.92),
    ],
    listenQuery: 'Cielito Lindo mariachi',
    sources: [
      { label: 'Quirino Mendoza en Wikipedia', url: 'https://es.wikipedia.org/wiki/Quirino_Mendoza' },
    ],
  },
  {
    id: 'la-llorona',
    title: 'La Llorona',
    artist: 'Canción popular mexicana',
    authors: 'Tradicional del istmo de Tehuantepec (Oaxaca)',
    year: 'Siglo XIX',
    genre: 'Son istmeño',
    language: 'Español',
    bpm: 60,
    timeSignature: '3/4',
    duration: 160,
    mainKey: 'La menor',
    keys: [{ key: 'La menor', start: 0, end: 160 }],
    vocalRange: { low: 'Mi3', high: 'Mi5' },
    difficulty: 'Avanzado',
    about:
      'Canción lenta y dramática, con muchas versiones famosas. Sus notas largas y sus adornos la hacen ideal para trabajar el melisma, el portamento y el vibrato expresivo.',
    sections: [
      { type: 'intro', label: 'Intro', start: 0, end: 12 },
      { type: 'estrofa', label: 'Estrofa 1', start: 12, end: 44 },
      { type: 'estribillo', label: 'Estribillo', start: 44, end: 76 },
      { type: 'estrofa', label: 'Estrofa 2', start: 76, end: 108 },
      { type: 'estribillo', label: 'Estribillo', start: 108, end: 140 },
      { type: 'final', label: 'Final', start: 140, end: 160 },
    ],
    lyrics: [
      { start: 12, end: 20, text: 'Todos me dicen el negro, Llorona,' },
      { start: 20, end: 28, text: 'negro pero cariñoso' },
      { start: 28, end: 36, text: 'Yo soy como el chile verde, Llorona,' },
      { start: 36, end: 44, text: 'picante pero sabroso' },
      { start: 44, end: 52, text: '¡Ay de mí, Llorona,' },
      { start: 52, end: 60, text: 'Llorona, Llorona de ayer y hoy!' },
      { start: 60, end: 68, text: 'Ayer maravilla fui, Llorona,' },
      { start: 68, end: 76, text: 'y ahora ni sombra soy' },
      { start: 76, end: 84, text: 'Salías del templo un día, Llorona,' },
      { start: 84, end: 92, text: 'cuando al pasar yo te vi' },
      { start: 92, end: 100, text: 'Hermoso huipil llevabas, Llorona,' },
      { start: 100, end: 108, text: 'que la Virgen te creí' },
      { start: 108, end: 116, text: '¡Ay de mí, Llorona,' },
      { start: 116, end: 124, text: 'Llorona, Llorona de ayer y hoy!' },
      { start: 124, end: 132, text: 'Ayer maravilla fui, Llorona,' },
      { start: 132, end: 140, text: 'y ahora ni sombra soy' },
      { start: 140, end: 160, text: 'ni sombra soy' },
    ],
    occurrences: [
      occ('melisma', 0, 'Llorona', 17, 20, 'Adorno descendente sobre "ro".', 'automatico', 0.74),
      occ('vibrato', 1, 'cariñoso', 25, 28, 'Vibrato lento y expresivo.', 'automatico', 0.85),
      occ('portamento', 4, 'Ay', 44, 46, 'Entrada deslizada al estribillo.', 'automatico', 0.69),
      occ('falsete', 4, 'mí', 46, 48, 'Quiebre a falsete en la nota aguda.', 'revisado', 1),
      occ('melisma', 5, 'hoy', 56, 60, 'Melisma largo de cinco notas.', 'revisado', 1),
      occ('vibrato', 7, 'soy', 72, 76, 'Final de frase con vibrato.', 'automatico', 0.88),
      occ('portamento', 9, 'vi', 89, 92, 'Caída expresiva.', 'automatico', 0.61),
      occ('glissando', 11, 'creí', 104, 108, 'Glissando descendente hacia el estribillo.', 'automatico', 0.57),
      occ('vibrato', 16, 'soy', 148, 160, 'Nota final sostenida.', 'automatico', 0.93),
    ],
    listenQuery: 'La Llorona canción',
    sources: [
      { label: 'La Llorona (canción) en Wikipedia', url: 'https://es.wikipedia.org/wiki/La_Llorona_(canci%C3%B3n)' },
    ],
  },
];

export const songById = (id: string) => songs.find((s) => s.id === id);

export const spotifySearchUrl = (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}`;
export const youtubeSearchUrl = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

/** Normaliza texto para buscar sin tildes ni mayúsculas. */
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function searchSongs(query: string, techniqueFilter?: string) {
  const q = normalize(query.trim());
  return songs.filter((s) => {
    const matchesText =
      !q ||
      [s.title, s.artist, s.genre, s.authors, ...s.lyrics.map((l) => l.text)].some((f) =>
        normalize(f).includes(q),
      );
    const matchesTechnique =
      !techniqueFilter || s.occurrences.some((o) => o.techniqueId === techniqueFilter);
    return matchesText && matchesTechnique;
  });
}
