import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Abi, la abeja reina de VoiceUp, en pixel art (vista de 3/4): corona dorada con un lirio,
// gola de pelo crema, cuerpo rechoncho a rayas y mirada un poco altiva.
// Cada carácter es un píxel. Hay fotogramas para aletear, parpadear y ponerse contenta.

const FRAMES = {
  idle: [
    '............O..O..O...........',
    '...........OgOOgOOgO....OO....',
    '...........OGgOGOgGO...O.O....',
    '...........OGGgGgGGO...O...OOO',
    '.......LLLLOGGGVGGkOOOO...O..O',
    '......LAAAAOkGVvVGkHHHOOOO....',
    '....LLAAAAAAOkkkkkHHYYYYOO....',
    '...LAAAAAAAAaOHHHHHYYYYYYYO...',
    '..LAAAAAAAaaLOHHHYYYYYYYYYO...',
    '..LAAAAAAaaaLOHYYYEEEEYEEYO...',
    '.LAAAAAaaaaL.OYYccYEeYYEyyO...',
    '.LAAAAaaaLL.OwccccccccyyyyO...',
    '.LAAaaaaAL.OwwccccccccPPyO....',
    '.LAAAAAAALOOwwwcccccccccO.....',
    'LAAAAAAOOOwwwwwCccccccccO.....',
    'LAAAAOOHHDwwwwCcCCCccCCCO.....',
    'LaaOOHHHHDDwCCCCCCwCCcCcO.....',
    '.LODDDHHHDDCCCcCwCCCCCcO......',
    '.OHDDDHYYYDCCCwCCCCCcccO......',
    '.OHDDDYYYYDDDcCCCCccccO.......',
    'OHHDDDDYYYDDDDCYcccOOO........',
    'OYYYDDDYYYYDDDYYYYO...........',
    'ODYYDDDYYYYDDDYyyyO...........',
    'ODYYDDDDYYYDdddyyO............',
    'ODYYYDDDYyyydddyyOO...........',
    '.ODYYDddyyyyddddOOdO..........',
    '.ODYyddddyyyddOdOOdOO.........',
    '..OOyddddyyyOO.OdOOddO........',
    '....OOOOOOOO....O..OO.........',
  ],
  flap: [
    '............O..O..O...........',
    '.......LLLLOgOOgOOgO....OO....',
    '......LAAAAOGgOGOgGO...O.O....',
    '.....LAAAAAOGGgGgGGO...O...OOO',
    '....LAAAAAaOGGGVGGkOOOO...O..O',
    '....LAAAAAaOkGVvVGkHHHOOOO....',
    '...LAAAAAaaLOkkkkkHHYYYYOO....',
    '...LAAAAaaaL.OHHHHHYYYYYYYO...',
    '...LAAAAaaL..OHHHYYYYYYYYYO...',
    '..LAAAAaaaL..OHYYYEEEEYEEYO...',
    '..LAAAAaaL...OYYccYEeYYEyyO...',
    '.LAAAAaaL...OwccccccccyyyyO...',
    '.LAAAAaaL..OwwccccccccPPyO....',
    'LAAAAaaL..OOwwwcccccccccO.....',
    'LAAaaaLOOOwwwwwCccccccccO.....',
    '.LLLLOOHHDwwwwCcCCCccCCCO.....',
    '...OOHHHHDDwCCCCCCwCCcCcO.....',
    '..ODDDHHHDDCCCcCwCCCCCcO......',
    '.OHDDDHYYYDCCCwCCCCCcccO......',
    '.OHDDDYYYYDDDcCCCCccccO.......',
    'OHHDDDDYYYDDDDCYcccOOO........',
    'OYYYDDDYYYYDDDYYYYO...........',
    'ODYYDDDYYYYDDDYyyyO...........',
    'ODYYDDDDYYYDdddyyO............',
    'ODYYYDDDYyyydddyyOO...........',
    '.ODYYDddyyyyddddOOdO..........',
    '.ODYyddddyyyddOdOOdOO.........',
    '..OOyddddyyyOO.OdOOddO........',
    '....OOOOOOOO....O..OO.........',
  ],
  blink: [
    '............O..O..O...........',
    '...........OgOOgOOgO....OO....',
    '...........OGgOGOgGO...O.O....',
    '...........OGGgGgGGO...O...OOO',
    '.......LLLLOGGGVGGkOOOO...O..O',
    '......LAAAAOkGVvVGkHHHOOOO....',
    '....LLAAAAAAOkkkkkHHYYYYOO....',
    '...LAAAAAAAAaOHHHHHYYYYYYYO...',
    '..LAAAAAAAaaLOHHHYYYYYYYYYO...',
    '..LAAAAAAaaaLOHYYYYYYYYYYYO...',
    '.LAAAAAaaaaL.OYYccYEEEYEEyO...',
    '.LAAAAaaaLL.OwccccccccyyyyO...',
    '.LAAaaaaAL.OwwccccccccPPyO....',
    '.LAAAAAAALOOwwwcccccccccO.....',
    'LAAAAAAOOOwwwwwCccccccccO.....',
    'LAAAAOOHHDwwwwCcCCCccCCCO.....',
    'LaaOOHHHHDDwCCCCCCwCCcCcO.....',
    '.LODDDHHHDDCCCcCwCCCCCcO......',
    '.OHDDDHYYYDCCCwCCCCCcccO......',
    '.OHDDDYYYYDDDcCCCCccccO.......',
    'OHHDDDDYYYDDDDCYcccOOO........',
    'OYYYDDDYYYYDDDYYYYO...........',
    'ODYYDDDYYYYDDDYyyyO...........',
    'ODYYDDDDYYYDdddyyO............',
    'ODYYYDDDYyyydddyyOO...........',
    '.ODYYDddyyyyddddOOdO..........',
    '.ODYyddddyyyddOdOOdOO.........',
    '..OOyddddyyyOO.OdOOddO........',
    '....OOOOOOOO....O..OO.........',
  ],
  happy: [
    '............O..O..O...........',
    '.......LLLLOgOOgOOgO....OO....',
    '......LAAAAOGgOGOgGO...O.O....',
    '.....LAAAAAOGGgGgGGO...O...OOO',
    '....LAAAAAaOGGGVGGkOOOO...O..O',
    '....LAAAAAaOkGVvVGkHHHOOOO....',
    '...LAAAAAaaLOkkkkkHHYYYYOO....',
    '...LAAAAaaaL.OHHHHHYYYYYYYO...',
    '...LAAAAaaL..OHHHYYYYYYYYYO...',
    '..LAAAAaaaL..OHYYYYYEYYYEYO...',
    '..LAAAAaaL...OYYccYEYEYEEyO...',
    '.LAAAAaaL...OwccccccccyyyyO...',
    '.LAAAAaaL..OwwccccccccPPyO....',
    'LAAAAaaL..OOwwwcccccccccO.....',
    'LAAaaaLOOOwwwwwCccccccccO.....',
    '.LLLLOOHHDwwwwCcCCCccCCCO.....',
    '...OOHHHHDDwCCCCCCwCCcCcO.....',
    '..ODDDHHHDDCCCcCwCCCCCcO......',
    '.OHDDDHYYYDCCCwCCCCCcccO......',
    '.OHDDDYYYYDDDcCCCCccccO.......',
    'OHHDDDDYYYDDDDCYcccOOO........',
    'OYYYDDDYYYYDDDYYYYO...........',
    'ODYYDDDYYYYDDDYyyyO...........',
    'ODYYDDDDYYYDdddyyO............',
    'ODYYYDDDYyyydddyyOO...........',
    '.ODYYDddyyyyddddOOdO..........',
    '.ODYyddddyyyddOdOOdOO.........',
    '..OOyddddyyyOO.OdOOddO........',
    '....OOOOOOOO....O..OO.........',
  ],
} as const;

export type BeeFrame = keyof typeof FRAMES;

const PALETTE: Record<string, string> = {
  A: '#EEF6FA',
  C: '#F5EAD0',
  D: '#5B3A28',
  E: '#1E140F',
  G: '#E9B437',
  H: '#FFE7A3',
  L: '#7C9CCB',
  O: '#2A1B14',
  P: '#E9A0A6',
  V: '#6E78CF',
  Y: '#F4C64F',
  a: '#CFE3EE',
  c: '#D6C095',
  d: '#3B2418',
  e: '#FFFFFF',
  g: '#FFE48C',
  k: '#A8711C',
  v: '#3B43A0',
  w: '#FFFBEF',
  y: '#CF912F',
};

export const BEE_COLS = FRAMES.idle[0].length;
export const BEE_ROWS = FRAMES.idle.length;

// Une los píxeles seguidos del mismo color en un solo rectángulo para dibujar menos piezas.
const RUNS = Object.fromEntries(
  Object.entries(FRAMES).map(([name, rows]) => {
    const runs: { x: number; y: number; w: number; c: string }[] = [];
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const c = row[x];
        let w = 1;
        while (x + w < row.length && row[x + w] === c) w++;
        if (c !== '.') runs.push({ x, y, w, c: PALETTE[c] });
        x += w;
      }
    });
    return [name, runs];
  }),
) as Record<BeeFrame, { x: number; y: number; w: number; c: string }[]>;

/** Dibuja a Abi. `size` es el tamaño de cada píxel. */
export const PixelBee = memo(function PixelBee({
  size = 3,
  frame = 'idle',
}: {
  size?: number;
  frame?: BeeFrame;
}) {
  return (
    <Svg
      width={BEE_COLS * size}
      height={BEE_ROWS * size}
      viewBox={`0 0 ${BEE_COLS} ${BEE_ROWS}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {RUNS[frame].map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />
      ))}
    </Svg>
  );
});
