// Busca en YouTube los mejores tutoriales de cada recurso vocal y los guarda en
// src/data/tutorialsAuto.json, que es lo que la app muestra.
//
// Uso:  YOUTUBE_API_KEY=... node scripts/tutorials/update.mjs
//
// La clave nunca va en la web: este script solo se ejecuta en GitHub Actions (o en tu ordenador),
// y la app publicada solo recibe el JSON con los resultados.
//
// Coste por ejecución en la cuota diaria gratuita de YouTube (10.000 unidades):
// 19 recursos × 2 búsquedas × 100 unidades ≈ 3.800 unidades, más unas pocas de detalles.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { LIMITS, PICK, TECHNIQUES } from './config.mjs';
import { isEligible, parseDuration, pickVideos, scoreVideo } from './score.mjs';

const API = 'https://www.googleapis.com/youtube/v3';
const OUT = fileURLToPath(new URL('../../src/data/tutorialsAuto.json', import.meta.url));

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function chunks(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Hace todo el trabajo. `fetchJson(endpoint, params)` se inyecta para poder probarlo sin red. */
export async function collect({
  fetchJson,
  techniques = TECHNIQUES,
  limits = LIMITS,
  pick = PICK,
}) {
  // 1. Búsquedas: una en español y otra en inglés por recurso.
  const found = new Map(); // videoId -> { techniqueIds:Set, language }
  for (const [id, t] of Object.entries(techniques)) {
    for (const language of ['es', 'en']) {
      const res = await fetchJson('search', {
        part: 'snippet',
        type: 'video',
        q: t[language],
        maxResults: '25',
        relevanceLanguage: language,
        videoEmbeddable: 'true',
        safeSearch: 'strict',
      });
      for (const item of res.items ?? []) {
        const vid = item.id?.videoId;
        if (!vid) continue;
        const entry = found.get(vid) ?? { techniqueIds: new Set(), language };
        entry.techniqueIds.add(id);
        found.set(vid, entry);
      }
    }
    for (const vid of t.pin ?? []) {
      const entry = found.get(vid) ?? { techniqueIds: new Set(), language: 'es' };
      entry.techniqueIds.add(id);
      found.set(vid, entry);
    }
  }

  // 2. Detalles de cada vídeo (vistas, «me gusta», duración, canal), de 50 en 50.
  const details = new Map();
  for (const ids of chunks([...found.keys()], 50)) {
    const res = await fetchJson('videos', {
      part: 'snippet,statistics,contentDetails,status',
      id: ids.join(','),
    });
    for (const v of res.items ?? []) details.set(v.id, v);
  }

  // 3. Suscriptores de cada canal.
  const channelIds = [...new Set([...details.values()].map((v) => v.snippet.channelId))];
  const subs = new Map();
  for (const ids of chunks(channelIds, 50)) {
    const res = await fetchJson('channels', { part: 'statistics', id: ids.join(',') });
    for (const c of res.items ?? []) {
      subs.set(
        c.id,
        c.statistics.hiddenSubscriberCount ? 0 : Number(c.statistics.subscriberCount ?? 0),
      );
    }
  }

  // 4. Puntuar y elegir por recurso.
  const result = {};
  for (const [id, t] of Object.entries(techniques)) {
    const videos = [];
    for (const [vid, entry] of found) {
      if (!entry.techniqueIds.has(id)) continue;
      const d = details.get(vid);
      if (!d) continue;
      const audio = d.snippet.defaultAudioLanguage ?? d.snippet.defaultLanguage ?? '';
      const language = audio ? (audio.startsWith('es') ? 'es' : 'en') : entry.language;
      const video = {
        videoId: vid,
        title: decodeEntities(d.snippet.title),
        channel: decodeEntities(d.snippet.channelTitle),
        language,
        views: Number(d.statistics.viewCount ?? 0),
        likes: d.statistics.likeCount != null ? Number(d.statistics.likeCount) : null,
        durationSec: parseDuration(d.contentDetails.duration),
        embeddable: d.status?.embeddable !== false,
      };
      video.score = scoreVideo({ ...video, subscribers: subs.get(d.snippet.channelId) });
      video.eligible = isEligible(video, t, limits);
      videos.push(video);
    }
    result[id] = pickVideos(videos, t, pick).map(({ eligible, embeddable, ...v }) => v);
  }
  return result;
}

async function main() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error('Falta la variable YOUTUBE_API_KEY.');
    process.exit(1);
  }
  const fetchJson = async (endpoint, params) => {
    const url = `${API}/${endpoint}?${new URLSearchParams({ ...params, key })}`;
    const res = await fetch(url);
    if (!res.ok) {
      // No mostramos la URL: lleva la clave.
      throw new Error(`YouTube ${endpoint} respondió ${res.status}: ${await res.text()}`);
    }
    return res.json();
  };

  const techniques = await collect({ fetchJson });
  const previous = JSON.parse(await readFile(OUT, 'utf8').catch(() => '{}'));
  // Si algún recurso se queda sin vídeos (por ejemplo, la búsqueda falló), conservamos los de antes.
  for (const [id, list] of Object.entries(techniques)) {
    if (list.length === 0 && previous.techniques?.[id]?.length)
      techniques[id] = previous.techniques[id];
  }
  const out = { updatedAt: new Date().toISOString(), techniques };
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
  const total = Object.values(techniques).reduce((n, l) => n + l.length, 0);
  console.log(`Guardados ${total} vídeos de ${Object.keys(techniques).length} recursos en ${OUT}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
