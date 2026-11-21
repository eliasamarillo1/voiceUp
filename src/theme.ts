// Tema visual de VoiceUp: claro y cálido, con acentos vivos.
// Cada recurso vocal tiene su propio color (ver data/techniques.ts).
export const colors = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EEE6',
  border: '#E8E1D6',
  text: '#1D1828',
  muted: '#5C566B',
  faint: '#8E879C',
  accent: '#EE4B57',
  accentSoft: 'rgba(238,75,87,0.12)',
};

// Colores de los bloques de la estructura (fondos suaves) y su versión intensa para textos.
export const sectionColors: Record<string, string> = {
  intro: '#E4DFEE',
  estrofa: '#CFE0F7',
  preestribillo: '#E2D4F5',
  estribillo: '#FAD1DA',
  puente: '#CDEDE7',
  final: '#E4DFEE',
};

export const sectionInk: Record<string, string> = {
  intro: '#6B6480',
  estrofa: '#2F5E9E',
  preestribillo: '#6A3FB0',
  estribillo: '#C02E55',
  puente: '#1F7F70',
  final: '#6B6480',
};

export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};
