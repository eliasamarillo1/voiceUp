// Tema visual de VoiceUp: vidriera Art Nouveau con lirios.
// Fondo crema como el cristal que deja pasar la luz, marcos verde azulado, plomo dorado y fino,
// y cristales en tonos suaves (lirio, verde agua, oro). Cada recurso vocal conserva su color propio
// (ver data/techniques.ts).
export const colors = {
  bg: '#F3ECD9',
  surface: '#FBF7EC',
  surfaceAlt: '#EFE6CF',
  border: '#DCCDA6',
  text: '#2C2A44',
  muted: '#5A566E',
  faint: '#8B8597',
  /** Marco verde azulado de la vidriera. */
  frame: '#3E8A84',
  frameDark: '#2C6763',
  frameLight: '#A8D0C6',
  /** Plomo dorado que une los cristales. */
  gold: '#B8975A',
  goldLight: '#D8C28E',
  accent: '#2C6763',
  accentSoft: 'rgba(62,138,132,0.12)',
};

/** Cristales de la vidriera. */
export const glass = {
  iris: '#4650AE',
  irisDark: '#2E3485',
  irisLight: '#97A0E0',
  teal: '#3E8A84',
  leaf: '#5F9C86',
  amber: '#D9A33A',
  lavender: '#B7AEDB',
  cream: '#FFFDF4',
};

// Color del cristal de cada parte de la canción.
export const sectionColors: Record<string, string> = {
  intro: glass.lavender,
  estrofa: '#7F89D2',
  preestribillo: '#8DB9B0',
  estribillo: glass.teal,
  puente: glass.amber,
  final: glass.lavender,
};

// Texto que va encima de cada cristal.
export const sectionText: Record<string, string> = {
  intro: '#2C2A44',
  estrofa: '#FFFFFF',
  preestribillo: '#2C2A44',
  estribillo: '#FFFFFF',
  puente: '#2C2A44',
  final: '#2C2A44',
};

// Versión de cada color para textos sobre fondo claro.
export const sectionInk: Record<string, string> = {
  intro: '#5E52A0',
  estrofa: '#3F4AA8',
  preestribillo: '#2C6763',
  estribillo: '#2C6763',
  puente: '#93650F',
  final: '#5E52A0',
};

/** Tipografías: Federo (Art Nouveau) para títulos y Alegreya Sans (humanista, caligráfica) para el texto. */
export const fonts = {
  display: 'Federo_400Regular',
  regular: 'AlegreyaSans_400Regular',
  medium: 'AlegreyaSans_500Medium',
  bold: 'AlegreyaSans_700Bold',
  heavy: 'AlegreyaSans_800ExtraBold',
};

export const radius = { sm: 6, md: 12, lg: 18, pill: 999, arch: 120 };

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};
