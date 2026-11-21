// Puntuación de un vídeo tutorial. Cuanto más alta, más arriba sale en la app.
//
//   idioma       +3 si es en español
//   calidad      hasta +3 según los «me gusta» por cada 100 vistas (4 % o más = máximo)
//   alcance      log10(vistas): 10 mil = 4, 100 mil = 5, 1 millón = 6
//   canal        hasta +3,5 según los suscriptores del canal (log10 × 0,5)
//   práctico     +1 si el título habla de ejercicios, pasos o «cómo»
//
// La idea es premiar los vídeos que gustan a quien los ve, no solo los que tienen muchas vistas.

export function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Convierte la duración ISO 8601 de YouTube (PT12M5S) a segundos. */
export function parseDuration(iso) {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? '');
  if (!m) return 0;
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  return d * 86400 + h * 3600 + min * 60 + s;
}

const PRACTICAL = /ejercicio|exercise|paso|step|como |how to|tutorial|aprende|learn/;

export function scoreVideo({ language, views, likes, subscribers, title }) {
  const ratio = views > 0 && likes != null ? likes / views : 0.02; // «me gusta» ocultos: valor medio
  const quality = Math.min(ratio / 0.04, 1) * 3;
  const reach = Math.log10(Math.max(views, 1));
  const channel = Math.min(Math.log10((subscribers ?? 0) + 1), 7) * 0.5;
  const lang = language === 'es' ? 3 : 0;
  const practical = PRACTICAL.test(normalize(title)) ? 1 : 0;
  return Math.round((lang + quality + reach + channel + practical) * 100) / 100;
}

/** ¿Pasa los filtros mínimos y trata del recurso? */
export function isEligible(video, technique, limits) {
  if (!video.embeddable) return false;
  if (video.durationSec < limits.minSeconds || video.durationSec > limits.maxSeconds) return false;
  if (video.views < limits.minViews) return false;
  if (technique.block?.includes(video.videoId)) return false;
  const title = normalize(video.title);
  return technique.keywords.some((k) => title.includes(normalize(k)));
}

/** Elige los mejores: fijados primero, luego los mejores en español y luego en inglés. */
export function pickVideos(videos, technique, pick) {
  const byId = new Map(videos.map((v) => [v.videoId, v]));
  const pinned = (technique.pin ?? []).map((id) => byId.get(id)).filter(Boolean);
  const taken = new Set(pinned.map((v) => v.videoId));
  const rest = videos
    .filter((v) => !taken.has(v.videoId) && v.eligible)
    .sort((a, b) => b.score - a.score);
  const es = rest.filter((v) => v.language === 'es').slice(0, pick.es);
  const en = rest.filter((v) => v.language !== 'es').slice(0, pick.en);
  // Si faltan en un idioma, se rellena con el otro para no quedarnos cortos.
  const missing = pick.es + pick.en - es.length - en.length;
  const extra = rest
    .filter((v) => !es.includes(v) && !en.includes(v))
    .slice(0, Math.max(missing, 0));
  return [...pinned, ...es, ...en, ...extra];
}
