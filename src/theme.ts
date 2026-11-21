// Tema visual de VoiceUp: fondo oscuro tipo "escenario" con acentos vivos.
// Cada recurso vocal tiene su propio color (ver data/techniques.ts).
export const colors = {
  bg: '#110F1A',
  surface: '#1B1828',
  surfaceAlt: '#242036',
  border: '#332E4A',
  text: '#F5F2FB',
  muted: '#A8A2BE',
  faint: '#6F6889',
  accent: '#FF6B5B',
  accentSoft: 'rgba(255,107,91,0.16)',
};

export const sectionColors: Record<string, string> = {
  intro: '#4B4566',
  estrofa: '#3D5A80',
  preestribillo: '#6A4C93',
  estribillo: '#C0476B',
  puente: '#2A9D8F',
  final: '#4B4566',
};

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};
