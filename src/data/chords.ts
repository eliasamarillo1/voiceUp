// Acordes básicos de las canciones de ejemplo (todas de dominio público).
// Versión sencilla para acompañar con guitarra, piano o ukelele, en la tonalidad de la ficha.
// Cada "|" separa un compás.

export interface ChordPart {
  label: string;
  bars: string[];
  note?: string;
}

export const chordsBySong: Record<string, { key: string; parts: ChordPart[]; tip?: string }> = {
  'amazing-grace': {
    key: 'Sol mayor',
    tip: 'Compás de 3/4: cuenta 1-2-3 y marca fuerte el 1. Con rasgueo lento o arpegio.',
    parts: [
      {
        label: 'Cada estrofa',
        bars: ['Sol', 'Sol7', 'Do', 'Sol', 'Sol', 'Mim', 'Re', 'Re7', 'Sol', 'Sol7', 'Do', 'Sol', 'Sol', 'Re7', 'Sol', 'Sol'],
      },
    ],
  },
  'cielito-lindo': {
    key: 'Re mayor',
    tip: 'Compás de 3/4, estilo vals ranchero: bajo en el 1 y dos golpes cortos en el 2 y el 3.',
    parts: [
      { label: 'Estrofa', bars: ['Re', 'Re', 'La7', 'La7', 'La7', 'La7', 'Re', 'Re'] },
      { label: 'Estribillo («Ay, ay, ay, ay»)', bars: ['La7', 'Re', 'Re7', 'Sol', 'Sol', 'Re', 'La7', 'Re'] },
    ],
  },
  'la-llorona': {
    key: 'La menor',
    tip: 'Compás de 3/4, lento y con mucho sentimiento. Puedes arpegiar en vez de rasguear.',
    parts: [
      { label: 'Estrofa', bars: ['Lam', 'Lam', 'Mi7', 'Mi7', 'Mi7', 'Mi7', 'Lam', 'Lam'] },
      { label: 'Estribillo («¡Ay de mí, Llorona!»)', bars: ['Lam', 'Rem', 'Lam', 'Mi7', 'Lam', 'Rem', 'Mi7', 'Lam'] },
    ],
  },
};
