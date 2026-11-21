// Qué buscar en YouTube para cada recurso vocal y cómo reconocer un vídeo que trata de él.
//
// - es / en: lo que se busca en español y en inglés.
// - keywords: el título del vídeo tiene que contener al menos una (sin tildes ni mayúsculas).
// - pin: vídeos que Elias quiere fijar arriba siempre, en este orden.
// - block: vídeos que no deben salir aunque puntúen bien.

export const TECHNIQUES = {
  vibrato: { es: 'vibrato canto', en: 'vibrato singing', keywords: ['vibrato'] },
  glissando: {
    es: 'glissando canto',
    en: 'glissando singing',
    keywords: ['glissando', 'gliss', 'deslizamiento'],
  },
  portamento: { es: 'portamento canto', en: 'portamento singing', keywords: ['portamento'] },
  melisma: { es: 'melismas canto', en: 'melisma singing', keywords: ['melisma', 'agilidad'] },
  falsete: { es: 'falsete canto', en: 'falsetto singing', keywords: ['falsete', 'falsetto'] },
  riffs: {
    es: 'riffs y runs canto',
    en: 'riffs and runs singing',
    keywords: ['riff', 'run', 'agilidad'],
  },
  'voz-pecho': {
    es: 'voz de pecho canto',
    en: 'chest voice singing',
    keywords: ['pecho', 'chest'],
  },
  'voz-cabeza': {
    es: 'voz de cabeza canto',
    en: 'head voice singing',
    keywords: ['cabeza', 'head voice'],
  },
  'voz-mixta': { es: 'voz mixta canto', en: 'mixed voice singing', keywords: ['mixta', 'mix'] },
  quiebre: {
    es: 'quiebre voz ranchera falsete',
    en: 'mariachi voice break singing',
    keywords: ['quiebre', 'ranchera', 'mariachi', 'yodel'],
  },
  belting: { es: 'belting canto', en: 'belting singing', keywords: ['belt'] },
  twang: { es: 'twang canto', en: 'twang singing', keywords: ['twang'] },
  'voz-aireada': {
    es: 'voz aireada canto',
    en: 'breathy voice singing',
    keywords: ['aireada', 'airosa', 'breathy', 'aire'],
  },
  'vocal-fry': { es: 'vocal fry canto', en: 'vocal fry singing', keywords: ['fry'] },
  'voz-rasgada': {
    es: 'voz rasgada canto',
    en: 'raspy voice singing distortion',
    keywords: ['rasgada', 'raspada', 'rasp', 'distorsion', 'distortion', 'grit', 'rota'],
  },
  sollozo: {
    es: 'sollozo canto técnica',
    en: 'cry singing technique',
    keywords: ['sollozo', 'llanto', 'cry'],
  },
  legato: { es: 'legato canto', en: 'legato singing', keywords: ['legato'] },
  staccato: { es: 'staccato canto', en: 'staccato singing', keywords: ['staccato', 'stacatto'] },
  'messa-di-voce': { es: 'messa di voce canto', en: 'messa di voce', keywords: ['messa di voce'] },
};

/** Cuántos vídeos se guardan por recurso: primero en español y luego en inglés. */
export const PICK = { es: 5, en: 3 };

/** Filtros mínimos que tiene que pasar un vídeo para entrar en la lista. */
export const LIMITS = {
  minSeconds: 90,
  maxSeconds: 15 * 60,
  minViews: 3000,
};
