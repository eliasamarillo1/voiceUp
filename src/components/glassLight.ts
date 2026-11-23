/**
 * Luz de la vidriera según la hora, como una cristalera de verdad:
 * amanecer rosado, mañana clara, mediodía brillante, tarde dorada,
 * atardecer anaranjado, anochecer violeta y noche azul con estrellas.
 */

type Light = {
  /** Colores del cielo y del prado, de arriba abajo. */
  sky: string[];
  /** Posición del sol (en % del ancho y del alto) y brillo de su luz. */
  sun: [number, number];
  shine: number;
  /** Halo detrás de los lirios: color central, color exterior e intensidad. */
  glow: [string, string, number];
  /** Velo oscuro de la noche: color e intensidad (no toca el cristal del texto). */
  night: [string, number];
  /** Estrellas doradas: 0 invisibles, 1 encendidas. */
  stars: number;
};

const SKY_STOPS = [0, 0.28, 0.5, 0.66, 0.78, 1];

const NIGHT: Light = {
  sky: ['#141B45', '#1E2860', '#2B3A80', '#2A3F6E', '#1F4A43', '#173A35'],
  sun: [50, 8],
  shine: 0.06,
  glow: ['#E9EEFF', '#B9C6F2', 0.55],
  night: ['#0B1030', 0.34],
  stars: 1,
};

/** Momentos del día, por hora local (0 a 24). */
const KEYS: [number, Light][] = [
  [0, NIGHT],
  [5.3, NIGHT],
  [
    6.8,
    {
      sky: ['#7E86C8', '#D7A9C4', '#F6C9A0', '#F4D7A8', '#C9DFC2', '#A3CBAE'],
      sun: [6, 48],
      shine: 0.34,
      glow: ['#FFE9D0', '#F8C49A', 0.8],
      night: ['#1A1840', 0.1],
      stars: 0.1,
    },
  ],
  [
    9.5,
    {
      sky: ['#A9C4F0', '#CBDDF6', '#EEF1E4', '#E7EFD9', '#CFE6C6', '#AFD6B7'],
      sun: [18, 12],
      shine: 0.4,
      glow: ['#FFFDF0', '#FFF3CF', 0.6],
      night: ['#000000', 0],
      stars: 0,
    },
  ],
  [
    13.5,
    {
      sky: ['#B6CFF5', '#D6E4F8', '#F3F3E6', '#E9F0DD', '#D3EACB', '#B4DABB'],
      sun: [50, -4],
      shine: 0.5,
      glow: ['#FFFFFF', '#FFF8E0', 0.5],
      night: ['#000000', 0],
      stars: 0,
    },
  ],
  [
    17.3,
    {
      sky: ['#B3C2EE', '#D9D7F0', '#F8E8C2', '#F2DCA4', '#CFE6C6', '#A9D3B4'],
      sun: [78, 22],
      shine: 0.42,
      glow: ['#FFF3CF', '#FBD98E', 0.75],
      night: ['#000000', 0],
      stars: 0,
    },
  ],
  [
    19.6,
    {
      sky: ['#8E97D8', '#D6A7C8', '#F8C98A', '#F2B36E', '#BFD8B4', '#93BFA0'],
      sun: [96, 55],
      shine: 0.42,
      glow: ['#FFE2B0', '#F7A95C', 0.9],
      night: ['#2A1840', 0.06],
      stars: 0,
    },
  ],
  [
    21,
    {
      sky: ['#2F3577', '#58508F', '#A57A9A', '#6E6A8A', '#2F5A55', '#214A44'],
      sun: [92, 72],
      shine: 0.12,
      glow: ['#F5E6FF', '#C9B8F0', 0.6],
      night: ['#0E1236', 0.22],
      stars: 0.7,
    },
  ],
  [22.4, NIGHT],
  [24, NIGHT],
];

/** Nombres para previsualizar con ?luz=… en la dirección de la página. */
export const LIGHT_PRESETS: Record<string, number> = {
  amanecer: 6.8,
  manana: 9.5,
  mediodia: 13.5,
  tarde: 17.3,
  atardecer: 19.6,
  anochecer: 21,
  noche: 0,
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) =>
  '#' + v.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
const mixC = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return toHex(A.map((x, i) => x + (B[i] - x) * t));
};
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
// curva suave para que los cambios de luz no se noten a saltos
const ease = (t: number) => t * t * (3 - 2 * t);

export function lightAt(hour: number): Light {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const [h0, a] = KEYS[i];
  const [h1, b] = KEYS[i + 1];
  const t = ease(h1 === h0 ? 0 : (h - h0) / (h1 - h0));
  return {
    sky: a.sky.map((c, k) => mixC(c, b.sky[k], t)),
    sun: [mixN(a.sun[0], b.sun[0], t), mixN(a.sun[1], b.sun[1], t)],
    shine: mixN(a.shine, b.shine, t),
    glow: [
      mixC(a.glow[0], b.glow[0], t),
      mixC(a.glow[1], b.glow[1], t),
      mixN(a.glow[2], b.glow[2], t),
    ],
    night: [
      mixC(a.night[1] ? a.night[0] : b.night[0], b.night[1] ? b.night[0] : a.night[0], t),
      mixN(a.night[1], b.night[1], t),
    ],
    stars: mixN(a.stars, b.stars, t),
  };
}

/** Gradientes que pinta la luz; se insertan en el hueco %%LIGHT%% del SVG. */
export function lightDefs(uid: string, height: number, hour: number): string {
  const L = lightAt(hour);
  const sky = L.sky.map((c, k) => `<stop offset="${SKY_STOPS[k]}" stop-color="${c}"/>`).join('');
  const f = (n: number) => n.toFixed(3);
  return (
    `<linearGradient id="${uid}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}">${sky}</linearGradient>` +
    `<radialGradient id="${uid}light" cx="${f(L.sun[0])}%" cy="${f(L.sun[1])}%" r="95%">` +
    `<stop offset="0" stop-color="#fff" stop-opacity="${f(L.shine)}"/>` +
    `<stop offset=".55" stop-color="#fff" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#1c1a30" stop-opacity="${f(0.06 + L.night[1] * 0.3)}"/></radialGradient>` +
    `<radialGradient id="${uid}glow"><stop offset="0" stop-color="${L.glow[0]}" stop-opacity="${f(L.glow[2])}"/>` +
    `<stop offset=".5" stop-color="${L.glow[1]}" stop-opacity="${f(L.glow[2] * 0.45)}"/>` +
    `<stop offset="1" stop-color="${L.glow[1]}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${uid}night"><stop offset="0" stop-color="${L.night[0]}" stop-opacity="${f(L.night[1])}"/></linearGradient>` +
    `<linearGradient id="${uid}starf"><stop offset="0" stop-color="#F6C04A" stop-opacity="${f(L.stars)}"/></linearGradient>` +
    `<linearGradient id="${uid}starl"><stop offset="0" stop-color="#34323A" stop-opacity="${f(L.stars)}"/></linearGradient>`
  );
}

/** Hora que se usa: la de ?hora=20.5 o ?luz=atardecer si vienen en la dirección, o la hora local. */
export function currentHour(): number {
  if (typeof window !== 'undefined' && window.location?.search) {
    const q = new URLSearchParams(window.location.search);
    const luz = q.get('luz');
    if (luz && luz in LIGHT_PRESETS) return LIGHT_PRESETS[luz];
    const h = parseFloat(q.get('hora') ?? '');
    if (!Number.isNaN(h)) return h;
  }
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}
