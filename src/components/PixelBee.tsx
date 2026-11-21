import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Abi, la abeja reina de VoiceUp, en pixel art (vista de 3/4) y con actitud de diva:
// corona alta con joyas, pestañas, labios rosas, mirada altiva, gola de pelo crema con
// collar dorado y brillos que titilan. Cada carácter es un píxel.

const FRAMES = {
  idle: [
    '......g......g.....................',
    '......z..OgOOGO.OgO.....OO.........',
    '....gzZzgOGgOGGOOGgO...O.O.........',
    '......z.OOGGgGGgOGGO...O...OOOO....',
    '......gOgGGGGGGgGGOOOOO...O...O....',
    '.......OGGRGGVGGRGOHHHOOOO.........',
    '.......OGRRGVvVGRkHHHYYYYO.........',
    '......LOkkkkkkkkkkHHYYYYYYO.....g..',
    '....LLAAOOOOOOHHHHYYYYYYYYYK....z..',
    '...LAAAAAAAAaOHHHYYYYYYKYYKO..gzZzg',
    '..LAAAAAAAaaLOHYYYYKKKKYKKYO....z..',
    '..LAAAAAAaaaLOYYYYYYEeYYYEyO....g..',
    '.LAAAAAaaaaL.OYYYYYYYYPyyyyO.......',
    '.LAAAAaaaLL..OccYcccYyyyRRO........',
    '.LAAaaaaAL.OOOwccccccccyyO.........',
    '.LAAAAAAALOwwwwwcccccccOO..........',
    'LAAAAAAOOOOwwwwwCCccccwCCO.........',
    'LAAAAOOHHDwwwwwcCCCCwCCCO..........',
    'LaaOOHHHHDwwwCCCCCwCCcCCCO.........',
    '.LODDDHHHDwCCCcCwCCCCCCccO.........',
    '.OHDDDHYYYCCCCwCCCCGZGZOO..........',
    '.OHDDDYYYYDDwGZGZGZccccO...........',
    'OHHDDDDYYYDDZCCCCccccOO............',
    'OYYYDDDYYYYDDDYccYOOO..............',
    'ODYYDDDYYYYDDDYyyyO................',
    'ODYYDDDDYYYDdddyyO.................',
    'ODYYYDDDYyyydddyyOO................',
    '.ODYYDddyyyyddddOOdO...............',
    '.ODYyddddyyyddOdOOdOO..............',
    '..OOyddddyyyOO.OdOOddO.............',
    '....OOOOOOOO....O..OO..............',
  ],
  flap: [
    '.............g.....................',
    '.........OgOOGO.OgO.....OO.........',
    '...g.....OGgOGGOOGgO...O.O.........',
    '...z...LOOGGgGGgOGGO...O...OOOO....',
    '.gzZzgLOgGGGGGGgGGOOOOO...O...O.g..',
    '...z.LAOGGRGGVGGRGOHHHOOOO......z..',
    '...gLAAOGRRGVvVGRkHHHYYYYO....gzZzg',
    '....LAAOkkkkkkkkkkHHYYYYYYO.....z..',
    '...LAAAAOOOOOOHHHHYYYYYYYYYK....g..',
    '...LAAAAaaaL.OHHHYYYYYYKYYKO.......',
    '...LAAAAaaL..OHYYYYKKKKYKKYO.......',
    '..LAAAAaaaL..OYYYYYYEeYYYEyO.......',
    '..LAAAAaaL...OYYYYYYYYPyyyyO.......',
    '.LAAAAaaL....OccYcccYyyyRRO........',
    '.LAAAAaaL..OOOwccccccccyyO.........',
    'LAAAAaaL..OwwwwwcccccccOO..........',
    'LAAaaaLOOOOwwwwwCCccccwCCO.........',
    '.LLLLOOHHDwwwwwcCCCCwCCCO..........',
    '...OOHHHHDwwwCCCCCwCCcCCCO.........',
    '..ODDDHHHDwCCCcCwCCCCCCccO.........',
    '.OHDDDHYYYCCCCwCCCCGZGZOO..........',
    '.OHDDDYYYYDDwGZGZGZccccO...........',
    'OHHDDDDYYYDDZCCCCccccOO............',
    'OYYYDDDYYYYDDDYccYOOO..............',
    'ODYYDDDYYYYDDDYyyyO................',
    'ODYYDDDDYYYDdddyyO.................',
    'ODYYYDDDYyyydddyyOO................',
    '.ODYYDddyyyyddddOOdO...............',
    '.ODYyddddyyyddOdOOdOO..............',
    '..OOyddddyyyOO.OdOOddO.............',
    '....OOOOOOOO....O..OO..............',
  ],
  blink: [
    '......g......g.....................',
    '......z..OgOOGO.OgO.....OO.........',
    '....gzZzgOGgOGGOOGgO...O.O.........',
    '......z.OOGGgGGgOGGO...O...OOOO....',
    '......gOgGGGGGGgGGOOOOO...O...O....',
    '.......OGGRGGVGGRGOHHHOOOO.........',
    '.......OGRRGVvVGRkHHHYYYYO.........',
    '......LOkkkkkkkkkkHHYYYYYYO.....g..',
    '....LLAAOOOOOOHHHHYYYYYYYYYK....z..',
    '...LAAAAAAAAaOHHHYYYYYYKYYKO..gzZzg',
    '..LAAAAAAAaaLOHYYYYYYYYYYYYO....z..',
    '..LAAAAAAaaaLOYYYYYKKKKYKKyO....g..',
    '.LAAAAAaaaaL.OYYYYYYYYPyyyyO.......',
    '.LAAAAaaaLL..OccYcccYyyyRRO........',
    '.LAAaaaaAL.OOOwccccccccyyO.........',
    '.LAAAAAAALOwwwwwcccccccOO..........',
    'LAAAAAAOOOOwwwwwCCccccwCCO.........',
    'LAAAAOOHHDwwwwwcCCCCwCCCO..........',
    'LaaOOHHHHDwwwCCCCCwCCcCCCO.........',
    '.LODDDHHHDwCCCcCwCCCCCCccO.........',
    '.OHDDDHYYYCCCCwCCCCGZGZOO..........',
    '.OHDDDYYYYDDwGZGZGZccccO...........',
    'OHHDDDDYYYDDZCCCCccccOO............',
    'OYYYDDDYYYYDDDYccYOOO..............',
    'ODYYDDDYYYYDDDYyyyO................',
    'ODYYDDDDYYYDdddyyO.................',
    'ODYYYDDDYyyydddyyOO................',
    '.ODYYDddyyyyddddOOdO...............',
    '.ODYyddddyyyddOdOOdOO..............',
    '..OOyddddyyyOO.OdOOddO.............',
    '....OOOOOOOO....O..OO..............',
  ],
  happy: [
    '.............g.....................',
    '.........OgOOGO.OgO.....OO.........',
    '...g.....OGgOGGOOGgO...O.O.........',
    '...z...LOOGGgGGgOGGO...O...OOOO....',
    '.gzZzgLOgGGGGGGgGGOOOOO...O...O.g..',
    '...z.LAOGGRGGVGGRGOHHHOOOO......z..',
    '...gLAAOGRRGVvVGRkHHHYYYYO....gzZzg',
    '....LAAOkkkkkkkkkkHHYYYYYYO.....z..',
    '...LAAAAOOOOOOHHHHYYYYYYYYYK....g..',
    '...LAAAAaaaL.OHHHYYYYYYKYYKO.......',
    '...LAAAAaaL..OHYYYYYKKYYYKYO.......',
    '..LAAAAaaaL..OYYYYYKYYKYKyyO.......',
    '..LAAAAaaL...OYYYYYYYYPyyyyO.......',
    '.LAAAAaaL....OccYcccYyyyRRO........',
    '.LAAAAaaL..OOOwccccccccyyO.........',
    'LAAAAaaL..OwwwwwcccccccOO..........',
    'LAAaaaLOOOOwwwwwCCccccwCCO.........',
    '.LLLLOOHHDwwwwwcCCCCwCCCO..........',
    '...OOHHHHDwwwCCCCCwCCcCCCO.........',
    '..ODDDHHHDwCCCcCwCCCCCCccO.........',
    '.OHDDDHYYYCCCCwCCCCGZGZOO..........',
    '.OHDDDYYYYDDwGZGZGZccccO...........',
    'OHHDDDDYYYDDZCCCCccccOO............',
    'OYYYDDDYYYYDDDYccYOOO..............',
    'ODYYDDDYYYYDDDYyyyO................',
    'ODYYDDDDYYYDdddyyO.................',
    'ODYYYDDDYyyydddyyOO................',
    '.ODYYDddyyyyddddOOdO...............',
    '.ODYyddddyyyddOdOOdOO..............',
    '..OOyddddyyyOO.OdOOddO.............',
    '....OOOOOOOO....O..OO..............',
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
  K: '#1E140F',
  L: '#7C9CCB',
  O: '#2A1B14',
  P: '#E9A0A6',
  R: '#E56A8E',
  V: '#6E78CF',
  Y: '#F4C64F',
  Z: '#FFFFFF',
  a: '#CFE3EE',
  c: '#D6C095',
  d: '#3B2418',
  e: '#FFFFFF',
  g: '#FFE48C',
  k: '#A8711C',
  v: '#3B43A0',
  w: '#FFFBEF',
  y: '#CF912F',
  z: '#FFE9A0',
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
