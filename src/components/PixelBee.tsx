import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Abi, la abejita de VoiceUp, en pixel art: cada carácter es un píxel.
// Cuerpo redondo, alas de cristal verde agua con plomo dorado (como la vidriera) y lirios en las antenas.
// Hay varios fotogramas para que aletee, parpadee y se ponga contenta.

const FRAMES = {
  idle: [
    '............V........V............',
    '...........VvV......VvV...........',
    '............G........G............',
    '............O........O............',
    '.............O......O.............',
    '.......LLLLL.O......O.LLLLL.......',
    '.....LLAAAAAL.OOOOOO.LAAAAALL.....',
    '....LAAAAAAAOOYYYYYYOOAAAAAAAL....',
    '...LAAAAAALOYHHYYYYYYYOLAAAAAAL...',
    '..LAAAALLLOYHHHHYYYYYYYOLLLAAAAL..',
    '.LAALLLLSOYYHeEYYYYYeEYYOSLLLLAAL.',
    '..LSLSSSSOYYYEEYYYYYEEYYOSSSSLSL..',
    '...L.LLLLOYYYEEYYYYYEEYYOLLLL.L...',
    '........OYYPPYYYMMYYYYPPYO........',
    '........OYYYYYYYYYYYYYYYYO........',
    '.........OYYYYYYYYYYYYYYO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '..........OYYYYYYYYyyyyO..........',
    '...........OBBBBBBBBBBO...........',
    '............OBBBBBBBBO............',
    '.............OOOyyOOO.............',
    '................OO................',
    '.................O................',
  ],
  flap: [
    '............V........V............',
    '..........LVvV......VvVL..........',
    '.......LLLALG........GLALLL.......',
    '......LAAAAAO........OAAAAAL......',
    '.....LAAAALSLO......OLSLAAAAL.....',
    '....LAAAALLSLO......OLSLLAAAAL....',
    '...LAAAALLSL..OOOOOO..LSLLAAAAL...',
    '...LAAALLSSLOOYYYYYYOOLSSLLAAAL...',
    '..LAAALLSSLOYHHYYYYYYYOLSSLLAAAL..',
    '..LAALSSLLOYHHHHYYYYYYYOLLSSLAAL..',
    '...LSSSL.OYYHeEYYYYYeEYYO.LSSSL...',
    '....LLL..OYYYEEYYYYYEEYYO..LLL....',
    '.........OYYYEEYYYYYEEYYO.........',
    '........OYYPPYYYMMYYYYPPYO........',
    '........OYYYYYYYYYYYYYYYYO........',
    '.........OYYYYYYYYYYYYYYO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '..........OYYYYYYYYyyyyO..........',
    '...........OBBBBBBBBBBO...........',
    '............OBBBBBBBBO............',
    '.............OOOyyOOO.............',
    '................OO................',
    '.................O................',
  ],
  blink: [
    '............V........V............',
    '...........VvV......VvV...........',
    '............G........G............',
    '............O........O............',
    '.............O......O.............',
    '.......LLLLL.O......O.LLLLL.......',
    '.....LLAAAAAL.OOOOOO.LAAAAALL.....',
    '....LAAAAAAAOOYYYYYYOOAAAAAAAL....',
    '...LAAAAAALOYHHYYYYYYYOLAAAAAAL...',
    '..LAAAALLLOYHHHHYYYYYYYOLLLAAAAL..',
    '.LAALLLLSOYYHYYYYYYYYYYYOSLLLLAAL.',
    '..LSLSSSSOYYYEEYYYYYEEYYOSSSSLSL..',
    '...L.LLLLOYYYYYYYYYYYYYYOLLLL.L...',
    '........OYYPPYYYMMYYYYPPYO........',
    '........OYYYYYYYYYYYYYYYYO........',
    '.........OYYYYYYYYYYYYYYO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '..........OYYYYYYYYyyyyO..........',
    '...........OBBBBBBBBBBO...........',
    '............OBBBBBBBBO............',
    '.............OOOyyOOO.............',
    '................OO................',
    '.................O................',
  ],
  happy: [
    '............V........V............',
    '..........LVvV......VvVL..........',
    '.......LLLALG........GLALLL.......',
    '......LAAAAAO........OAAAAAL......',
    '.....LAAAALSLO......OLSLAAAAL.....',
    '....LAAAALLSLO......OLSLLAAAAL....',
    '...LAAAALLSL..OOOOOO..LSLLAAAAL...',
    '...LAAALLSSLOOYYYYYYOOLSSLLAAAL...',
    '..LAAALLSSLOYHHYYYYYYYOLSSLLAAAL..',
    '..LAALSSLLOYHHHHYYYYYYYOLLSSLAAL..',
    '...LSSSL.OYYHeEYYYYYeEYYO.LSSSL...',
    '....LLL..OYYYEEYYYYYEEYYO..LLL....',
    '.........OYYYEEYYYYYEEYYO.........',
    '........OYYPPYYYMMYYYYPPYO........',
    '........OYYYYYYYTTYYYYYYYO........',
    '.........OYYYYYYYYYYYYYYO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '.........OBBBBBBBBBBBBBBO.........',
    '..........OYYYYYYYYyyyyO..........',
    '...........OBBBBBBBBBBO...........',
    '............OBBBBBBBBO............',
    '.............OOOyyOOO.............',
    '................OO................',
    '.................O................',
  ],
} as const;

export type BeeFrame = keyof typeof FRAMES;

const PALETTE: Record<string, string> = {
  A: '#D6EFE9',
  B: '#3A3552',
  E: '#1E1C30',
  G: '#5F9C86',
  H: '#FFEDB0',
  L: '#B8975A',
  M: '#8A3B45',
  O: '#2C2A44',
  P: '#F09AAE',
  S: '#8CC7BC',
  T: '#F07C95',
  V: '#7C86D6',
  Y: '#F4C553',
  e: '#FFFFFF',
  v: '#3B43A0',
  y: '#DC9A33',
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
