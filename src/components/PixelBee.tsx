import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Abi, la abeja reina de VoiceUp, en pixel art (vista de 3/4) y con actitud de diva:
// corona con joyas, mirada altiva con pestañas, labios rosas, gola de pelo crema con collar
// dorado y brillos que titilan. Las alas nacen del tórax, detrás de la gola. Cada carácter es un píxel. El dibujo tiene más detalle que la
// cuadrícula de pantalla (DETAIL píxeles por cada «píxel» de BeeHelper), para que se vea fino.

const FRAMES = {
  idle: [
    '.......................................................',
    '......................O.....O.....O....................',
    '................s....OgO...OgO...OgO...................',
    '................z...OgZgO.OgZgO.OgGgO..................',
    '..............szZzs.OGGGOOOGGGOOOGGGO...OO.............',
    '.........LLL....z....OGGGgOgGGGgOgGGGO.O..O............',
    '........LAAaLL..s....OGGGGgGGGGGgGGGGOO................',
    '........LAAAaaL......OGgGGGGGGGGGGGgGOO......OOO.......',
    '........LAAAAaaL......OGRRGGGVVVGGGRRkO.....O...O......',
    '.........LAAvvaL......OGrRGGVXXVGGGrRkOO...O....O......',
    '......s..LAAvvaaL.....OkkkkkkKKKKKKKKKYYOOO............',
    '......z...LAAvvaaL.....OOOOOOHHHHHHHHHHYYYO............',
    '....szZzs.LAAAvvaL.........OHHHHHHHHHHHYYYYO.......s...',
    '......z....LAAvvAaL.......OHHHHHHHHHHHYYYYYyO......z...',
    '......s.....LAAvvaaL.....OHHHHHHHHHHuuuYYYYuuO...szZzs.',
    '.............LAAvAaL....OHHHHHHHHHHuYYYYYYyyyO.....z...',
    '.............LAAAvAaL...OHHHHHHHHHHYYYYYYEyyyO.E...s...',
    '..............LAAvvaL...OHHHHHHHHHYYYYYEEyyyyuE........',
    '...............LAAvAaL.OYHHHHHHHYYYEEEEEyyyEEEO........',
    '................LAAvAL.OYHHHHYYYYYYYEEeyyyyuEe.........',
    '.................LAAvaL.OYYYYYYYYYYYEEEyyyuuEO.........',
    '......LLL.........LAvvL.OYYYYYYYYYYYyyyyyuuuuO.........',
    '.....LAaaLLLL......LAvL.OYYYYYYYYyyyPPPyuuuuR..........',
    '.....LAAvvvvaLLL....LLvOOOUYYYyyyyyyyyuuuuRR...........',
    '......LLAAvvvvAaLL....OwwwwUyyyyyyyyuuuuuull...........',
    '........LLLAAvvvvvLLOOOwwwwwUUyyyyuuuuUUUOO.......z....',
    '...........LLLLLAvvOwwwwwwwwwwUUUUUUUUCCCccO...........',
    '..........OHHHBBLLOQwwwwwwwwwwwwwwCcCCcCCCccO..........',
    '........OOHHHHHBBBBBQwwwwwwwwwwwCCCCCCCCcccO...........',
    '.......OBBBHHHHHBBQwwwwwwwwwwwwCCCCCCCCccccqO..........',
    '......OBBBBBHHHHHBQwwwwwwwwwwCcCCcCCckGZccqqO..........',
    '.....OHHBBBBHHHHHBQwwwwwwwCCCCCCCCCCcccccqqqO..........',
    '.....OHHBBBBBHHHHHBQCCkGZkGZCCCkGZkGZccCqqOO...........',
    '....OHHHHBBBBBHHHYQcCCcCCcCCkGZcCcccccqqqqqO...........',
    '....OHHHHHBBBBHHYYYQQCCCCCCCCccGccccqqqqqqO............',
    '...ODBHHHHBBBBYYYYYDDQCCCcccnnrRRcqqnBnOOO.............',
    '...ODBHHHHHDDDDYYYYDDQQQcccnnncrqqqnDnqO...............',
    '...ODDDYYYYDDDDYYYYYddddQcCcQQnnDDDODDO................',
    '...ODDDYYYYDDDDYYYYyddddyQQQuuQqnDDDOO.................',
    '...ODDDYYYYDDDDYYyyydddduuuuuOOOOOOO...................',
    '....ODDDYYYYDDddyyyydddnuuuuuO.........................',
    '...OOdDDYYYyddddyyyydnnnuuuuO..........................',
    '..OnnOddyyyyddddyyyunnnnuuuO...........................',
    '.OnnO.OdyyyydddyyuuunnnnuOO............................',
    '..OO...OyyyyddnuuuunnnnnOO...O.........................',
    '........OOunnnnuuuunnOOOOdO.OdO........................',
    '..........OOOOOOOOOOO...OdO.OdO........................',
    '.......................OdO...OdO.......................',
    '......................OddO...OddO......................',
    '.......................OO.....OO.......................',
    '.......................................................',
  ],
  flap: [
    '.......................................................',
    '................L.....O.....O.....O....................',
    '...............LALL..OgO...OgO...OgO...................',
    '...............LAAaLOgZgO.OgZgO.OgGgO..................',
    '............s..LAAaLOGGGOOOGGGOOOGGGO...OO.............',
    '............z..LAAAaLOGGGgOgGGGgOgGGGO.O..O............',
    '..........szZzsLAvvaLOGGGGgGGGGGgGGGGOO................',
    '............z..LAAvvaOGgGGGGGGGGGGGgGOO......OOO.......',
    '............s..LAAvvaLOGRRGGGVVVGGGRRkO.....O...O......',
    '...............LAAvvaLOGrRGGVXXVGGGrRkOO...O....O..s...',
    '................LAAvaaOkkkkkkKKKKKKKKKYYOOO........z...',
    '................LAAvAaLOOOOOOHHHHHHHHHHYYYO......szZzs.',
    '................LAAvvaL....OHHHHHHHHHHHYYYYO.......z...',
    '.................LAAvaL...OHHHHHHHHHHHYYYYYyO......s...',
    '.................LAAvaL..OHHHHHHHHHHuuuYYYYuuO.........',
    '....s............LAAvAaLOHHHHHHHHHHuYYYYYYyyyO.........',
    '....z..LLLLL......LAvvaLOHHHHHHHHHHYYYYYYEyyyO.E.......',
    '..szZzsLAAAaL.....LAAvaLOHHHHHHHHHYYYYYEEyyyyuE........',
    '....z...LAvvaLL....LAvaOYHHHHHHHYYYEEEEEyyyEEEO........',
    '....s....LAvvaaL...LAvAOYHHHHYYYYYYYEEeyyyyuEe.........',
    '..........LAvvvaL...LAvLOYYYYYYYYYYYEEEyyyuuEO.........',
    '...........LAAvvaL..LAvLOYYYYYYYYYYYyyyyyuuuuO.........',
    '............LLAvvaL..LvLOYYYYYYYYyyyPPPyuuuuR..........',
    '..............LAvvaL..LOOOUYYYyyyyyyyyuuuuRR...........',
    '...............LLAvaL.OwwwwUyyyyyyyyuuuuuull...........',
    '..............OOOLLvOOOwwwwwUUyyyyuuuuUUUOO............',
    '...........OOOBBBBBOwwwwwwwwwwUUUUUUUUCCCccO...........',
    '..........OHHHBBBBBQwwwwwwwwwwwwwwCcCCcCCCccO...z......',
    '........OOHHHHHBBBBBQwwwwwwwwwwwCCCCCCCCcccO...........',
    '.......OBBBHHHHHBBQwwwwwwwwwwwwCCCCCCCCccccqO..........',
    '......OBBBBBHHHHHBQwwwwwwwwwwCcCCcCCckGZccqqO..........',
    '.....OHHBBBBHHHHHBQwwwwwwwCCCCCCCCCCcccccqqqO..........',
    '.....OHHBBBBBHHHHHBQCCkGZkGZCCCkGZkGZccCqqOO...........',
    '....OHHHHBBBBBHHHYQcCCcCCcCCkGZcCcccccqqqqqO...........',
    '....OHHHHHBBBBHHYYYQQCCCCCCCCccGccccqqqqqqO............',
    '...ODBHHHHBBBBYYYYYDDQCCCcccnnrRRcqqnBnOOO.............',
    '...ODBHHHHHDDDDYYYYDDQQQcccnnncrqqqnDnqO...............',
    '...ODDDYYYYDDDDYYYYYddddQcCcQQnnDDDODDO................',
    '...ODDDYYYYDDDDYYYYyddddyQQQuuQqnDDDOO.................',
    '...ODDDYYYYDDDDYYyyydddduuuuuOOOOOOO...................',
    '....ODDDYYYYDDddyyyydddnuuuuuO.........................',
    '...OOdDDYYYyddddyyyydnnnuuuuO..........................',
    '..OnnOddyyyyddddyyyunnnnuuuO...........................',
    '.OnnO.OdyyyydddyyuuunnnnuOO............................',
    '..OO...OyyyyddnuuuunnnnnOO...O.........................',
    '........OOunnnnuuuunnOOOOdO.OdO........................',
    '..........OOOOOOOOOOO...OdO.OdO........................',
    '.......................OdO...OdO.......................',
    '......................OddO...OddO......................',
    '.......................OO.....OO.......................',
    '.......................................................',
  ],
  blink: [
    '.......................................................',
    '......................O.....O.....O....................',
    '................s....OgO...OgO...OgO...................',
    '................z...OgZgO.OgZgO.OgGgO..................',
    '..............szZzs.OGGGOOOGGGOOOGGGO...OO.............',
    '.........LLL....z....OGGGgOgGGGgOgGGGO.O..O............',
    '........LAAaLL..s....OGGGGgGGGGGgGGGGOO................',
    '........LAAAaaL......OGgGGGGGGGGGGGgGOO......OOO.......',
    '........LAAAAaaL......OGRRGGGVVVGGGRRkO.....O...O......',
    '.........LAAvvaL......OGrRGGVXXVGGGrRkOO...O....O......',
    '......s..LAAvvaaL.....OkkkkkkKKKKKKKKKYYOOO............',
    '......z...LAAvvaaL.....OOOOOOHHHHHHHHHHYYYO............',
    '....szZzs.LAAAvvaL.........OHHHHHHHHHHHYYYYO.......s...',
    '......z....LAAvvAaL.......OHHHHHHHHHHHYYYYYyO......z...',
    '......s.....LAAvvaaL.....OHHHHHHHHHHuuuYYYYuuO...szZzs.',
    '.............LAAvAaL....OHHHHHHHHHHuYYYYYYyyyO.....z...',
    '.............LAAAvAaL...OHHHHHHHHHHYYYYYYEyyyO.E...s...',
    '..............LAAvvaL...OHHHHHHHHHYYYYYEEyyyyuE........',
    '...............LAAvAaL.OYHHHHHHHYYYYYYYYyyyyuuO........',
    '................LAAvAL.OYHHHHYYYYYYEEEEEyyyEEE.........',
    '.................LAAvaL.OYYYYYYYYYYYYyyyyyuuuO.........',
    '......LLL.........LAvvL.OYYYYYYYYYYYyyyyyuuuuO.........',
    '.....LAaaLLLL......LAvL.OYYYYYYYYyyyPPPyuuuuR..........',
    '.....LAAvvvvaLLL....LLvOOOUYYYyyyyyyyyuuuuRR...........',
    '......LLAAvvvvAaLL....OwwwwUyyyyyyyyuuuuuull...........',
    '........LLLAAvvvvvLLOOOwwwwwUUyyyyuuuuUUUOO.......z....',
    '...........LLLLLAvvOwwwwwwwwwwUUUUUUUUCCCccO...........',
    '..........OHHHBBLLOQwwwwwwwwwwwwwwCcCCcCCCccO..........',
    '........OOHHHHHBBBBBQwwwwwwwwwwwCCCCCCCCcccO...........',
    '.......OBBBHHHHHBBQwwwwwwwwwwwwCCCCCCCCccccqO..........',
    '......OBBBBBHHHHHBQwwwwwwwwwwCcCCcCCckGZccqqO..........',
    '.....OHHBBBBHHHHHBQwwwwwwwCCCCCCCCCCcccccqqqO..........',
    '.....OHHBBBBBHHHHHBQCCkGZkGZCCCkGZkGZccCqqOO...........',
    '....OHHHHBBBBBHHHYQcCCcCCcCCkGZcCcccccqqqqqO...........',
    '....OHHHHHBBBBHHYYYQQCCCCCCCCccGccccqqqqqqO............',
    '...ODBHHHHBBBBYYYYYDDQCCCcccnnrRRcqqnBnOOO.............',
    '...ODBHHHHHDDDDYYYYDDQQQcccnnncrqqqnDnqO...............',
    '...ODDDYYYYDDDDYYYYYddddQcCcQQnnDDDODDO................',
    '...ODDDYYYYDDDDYYYYyddddyQQQuuQqnDDDOO.................',
    '...ODDDYYYYDDDDYYyyydddduuuuuOOOOOOO...................',
    '....ODDDYYYYDDddyyyydddnuuuuuO.........................',
    '...OOdDDYYYyddddyyyydnnnuuuuO..........................',
    '..OnnOddyyyyddddyyyunnnnuuuO...........................',
    '.OnnO.OdyyyydddyyuuunnnnuOO............................',
    '..OO...OyyyyddnuuuunnnnnOO...O.........................',
    '........OOunnnnuuuunnOOOOdO.OdO........................',
    '..........OOOOOOOOOOO...OdO.OdO........................',
    '.......................OdO...OdO.......................',
    '......................OddO...OddO......................',
    '.......................OO.....OO.......................',
    '.......................................................',
  ],
  happy: [
    '.......................................................',
    '................L.....O.....O.....O....................',
    '...............LALL..OgO...OgO...OgO...................',
    '...............LAAaLOgZgO.OgZgO.OgGgO..................',
    '............s..LAAaLOGGGOOOGGGOOOGGGO...OO.............',
    '............z..LAAAaLOGGGgOgGGGgOgGGGO.O..O............',
    '..........szZzsLAvvaLOGGGGgGGGGGgGGGGOO................',
    '............z..LAAvvaOGgGGGGGGGGGGGgGOO......OOO.......',
    '............s..LAAvvaLOGRRGGGVVVGGGRRkO.....O...O......',
    '...............LAAvvaLOGrRGGVXXVGGGrRkOO...O....O..s...',
    '................LAAvaaOkkkkkkKKKKKKKKKYYOOO........z...',
    '................LAAvAaLOOOOOOHHHHHHHHHHYYYO......szZzs.',
    '................LAAvvaL....OHHHHHHHHHHHYYYYO.......z...',
    '.................LAAvaL...OHHHHHHHHHHHYYYYYyO......s...',
    '.................LAAvaL..OHHHHHHHHHHuuuYYYYuuO.........',
    '....s............LAAvAaLOHHHHHHHHHHuYYYYYYyyyO.........',
    '....z..LLLLL......LAvvaLOHHHHHHHHHHYYYYYYEyyyO.E.......',
    '..szZzsLAAAaL.....LAAvaLOHHHHHHHHHYYYEYEEyyyyuE........',
    '....z...LAvvaLL....LAvaOYHHHHHHHYYYYEYEYyyyyEuO........',
    '....s....LAvvaaL...LAvAOYHHHHYYYYYYEYYYEyyyEuE.........',
    '..........LAvvvaL...LAvLOYYYYYYYYYYYYyyyyyuuuO.........',
    '...........LAAvvaL..LAvLOYYYYYYYYYYYyyyyyuuuuO.........',
    '............LLAvvaL..LvLOYYYYYYYYyyyPPPyuuuuR..........',
    '..............LAvvaL..LOOOUYYYyyyyyyyyuuuuRR...........',
    '...............LLAvaL.OwwwwUyyyyyyyyuuuuuull...........',
    '..............OOOLLvOOOwwwwwUUyyyyuuuuUUUOO............',
    '...........OOOBBBBBOwwwwwwwwwwUUUUUUUUCCCccO...........',
    '..........OHHHBBBBBQwwwwwwwwwwwwwwCcCCcCCCccO...z......',
    '........OOHHHHHBBBBBQwwwwwwwwwwwCCCCCCCCcccO...........',
    '.......OBBBHHHHHBBQwwwwwwwwwwwwCCCCCCCCccccqO..........',
    '......OBBBBBHHHHHBQwwwwwwwwwwCcCCcCCckGZccqqO..........',
    '.....OHHBBBBHHHHHBQwwwwwwwCCCCCCCCCCcccccqqqO..........',
    '.....OHHBBBBBHHHHHBQCCkGZkGZCCCkGZkGZccCqqOO...........',
    '....OHHHHBBBBBHHHYQcCCcCCcCCkGZcCcccccqqqqqO...........',
    '....OHHHHHBBBBHHYYYQQCCCCCCCCccGccccqqqqqqO............',
    '...ODBHHHHBBBBYYYYYDDQCCCcccnnrRRcqqnBnOOO.............',
    '...ODBHHHHHDDDDYYYYDDQQQcccnnncrqqqnDnqO...............',
    '...ODDDYYYYDDDDYYYYYddddQcCcQQnnDDDODDO................',
    '...ODDDYYYYDDDDYYYYyddddyQQQuuQqnDDDOO.................',
    '...ODDDYYYYDDDDYYyyydddduuuuuOOOOOOO...................',
    '....ODDDYYYYDDddyyyydddnuuuuuO.........................',
    '...OOdDDYYYyddddyyyydnnnuuuuO..........................',
    '..OnnOddyyyyddddyyyunnnnuuuO...........................',
    '.OnnO.OdyyyydddyyuuunnnnuOO............................',
    '..OO...OyyyyddnuuuunnnnnOO...O.........................',
    '........OOunnnnuuuunnOOOOdO.OdO........................',
    '..........OOOOOOOOOOO...OdO.OdO........................',
    '.......................OdO...OdO.......................',
    '......................OddO...OddO......................',
    '.......................OO.....OO.......................',
    '.......................................................',
  ],
};

export type BeeFrame = keyof typeof FRAMES;

const PALETTE: Record<string, string> = {
  A: '#F5FBFE',
  B: '#8A5A3A',
  C: '#F6EBD2',
  D: '#5E3B27',
  E: '#1C120C',
  G: '#EBB63A',
  H: '#FFEDB0',
  K: '#5C3B0F',
  L: '#7E9FCF',
  O: '#2A1B14',
  P: '#F2A2A8',
  Q: '#8E6B3D',
  R: '#E8628C',
  U: '#7A4A1C',
  V: '#7B84DA',
  X: '#4A4FB0',
  Y: '#F6C850',
  Z: '#FFFFFF',
  a: '#DDECF4',
  c: '#E5D1A6',
  d: '#3E2619',
  e: '#FFFFFF',
  g: '#FFE68E',
  k: '#B07A1E',
  l: '#D94F78',
  n: '#2A180F',
  q: '#C7AA78',
  r: '#B8406A',
  s: '#F6D77A',
  u: '#B9792A',
  v: '#BCD5E7',
  w: '#FFFCF2',
  y: '#E2A43A',
  z: '#FFE9A0',
};

/** Píxeles de dibujo por cada píxel de pantalla que usa BeeHelper. */
const DETAIL = 1.5;
const COLS = FRAMES.idle[0].length;
const ROWS = FRAMES.idle.length;

/** Tamaño de Abi en «píxeles» de BeeHelper (cada uno mide `size` puntos en pantalla). */
export const BEE_COLS = COLS / DETAIL;
export const BEE_ROWS = ROWS / DETAIL;

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

/** Dibuja a Abi. `size` es el tamaño de cada píxel de BeeHelper. */
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
      viewBox={`0 0 ${COLS} ${ROWS}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {RUNS[frame].map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />
      ))}
    </Svg>
  );
});
