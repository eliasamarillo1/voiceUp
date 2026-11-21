import auto from './tutorialsAuto.json';
import type { Technique, Tutorial } from './types';

// Los vídeos de cada recurso salen de tutorialsAuto.json, que actualiza cada semana una tarea de
// GitHub con la API de YouTube (scripts/tutorials). Si aún no hay datos para un recurso, se usa la
// selección hecha a mano que está en techniques.ts.

const autoByTechnique = (auto as { techniques: Record<string, Tutorial[]> }).techniques;

export const tutorialsUpdatedAt = (auto as { updatedAt: string | null }).updatedAt;

export function tutorialsFor(t: Technique): Tutorial[] {
  const list = autoByTechnique[t.id];
  return list && list.length > 0 ? list : t.tutorials;
}
