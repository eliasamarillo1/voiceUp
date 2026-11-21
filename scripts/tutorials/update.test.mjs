// Prueba sin red: simula las respuestas de YouTube y comprueba qué vídeos se eligen.
// Ejecutar con:  node --test scripts/tutorials/update.test.mjs

import assert from 'node:assert/strict';
import test from 'node:test';
import { collect } from './update.mjs';
import { parseDuration, scoreVideo } from './score.mjs';

const TECH = {
  vibrato: {
    es: 'vibrato canto',
    en: 'vibrato singing',
    keywords: ['vibrato'],
    block: ['blocked'],
  },
};

const VIDEOS = {
  goodEs: {
    title: 'Cómo hacer VIBRATO: 3 ejercicios',
    ch: 'c1',
    views: 200000,
    likes: 9000,
    dur: 'PT8M',
    lang: 'es',
  },
  popularEs: {
    title: 'Vibrato en 1 minuto',
    ch: 'c2',
    views: 2000000,
    likes: 8000,
    dur: 'PT4M',
    lang: 'es',
  },
  goodEn: {
    title: 'How to sing with vibrato',
    ch: 'c1',
    views: 500000,
    likes: 20000,
    dur: 'PT10M',
    lang: 'en',
  },
  tooLong: {
    title: 'Vibrato masterclass',
    ch: 'c1',
    views: 900000,
    likes: 50000,
    dur: 'PT1H2M',
    lang: 'en',
  },
  offTopic: {
    title: 'Mi canción favorita',
    ch: 'c1',
    views: 900000,
    likes: 50000,
    dur: 'PT5M',
    lang: 'es',
  },
  tiny: { title: 'Vibrato casero', ch: 'c3', views: 120, likes: 10, dur: 'PT5M', lang: 'es' },
  blocked: {
    title: 'Vibrato fácil',
    ch: 'c1',
    views: 900000,
    likes: 50000,
    dur: 'PT5M',
    lang: 'es',
  },
  noEmbed: {
    title: 'Vibrato pro',
    ch: 'c1',
    views: 900000,
    likes: 50000,
    dur: 'PT5M',
    lang: 'es',
    noEmbed: true,
  },
};

function fakeFetch() {
  const calls = [];
  const fetchJson = async (endpoint, params) => {
    calls.push(endpoint);
    if (endpoint === 'search') {
      const ids = Object.entries(VIDEOS)
        .filter(([, v]) => v.lang === params.relevanceLanguage)
        .map(([id]) => ({ id: { videoId: id } }));
      return { items: ids };
    }
    if (endpoint === 'videos') {
      return {
        items: params.id.split(',').map((id) => {
          const v = VIDEOS[id];
          return {
            id,
            snippet: {
              title: v.title,
              channelId: v.ch,
              channelTitle: `Canal ${v.ch}`,
              defaultAudioLanguage: v.lang,
            },
            statistics: { viewCount: String(v.views), likeCount: String(v.likes) },
            contentDetails: { duration: v.dur },
            status: { embeddable: !v.noEmbed },
          };
        }),
      };
    }
    if (endpoint === 'channels') {
      return {
        items: params.id.split(',').map((id) => ({
          id,
          statistics: { subscriberCount: id === 'c1' ? '500000' : '1000' },
        })),
      };
    }
    throw new Error(endpoint);
  };
  return { fetchJson, calls };
}

test('elige los vídeos buenos, en español primero, y descarta los que no valen', async () => {
  const { fetchJson, calls } = fakeFetch();
  const out = await collect({ fetchJson, techniques: TECH, pick: { es: 5, en: 3 } });
  const ids = out.vibrato.map((v) => v.videoId);
  assert.deepEqual(ids, ['goodEs', 'popularEs', 'goodEn']);
  assert.equal(out.vibrato[0].channel, 'Canal c1');
  assert.equal(out.vibrato[0].durationSec, 480);
  assert.deepEqual(calls, ['search', 'search', 'videos', 'channels']);
});

test('los fijados salen primero aunque puntúen menos', async () => {
  const { fetchJson } = fakeFetch();
  const techniques = { vibrato: { ...TECH.vibrato, pin: ['popularEs'] } };
  const out = await collect({ fetchJson, techniques, pick: { es: 5, en: 3 } });
  assert.equal(out.vibrato[0].videoId, 'popularEs');
});

test('premia la proporción de «me gusta» más que las vistas a secas', () => {
  const base = { language: 'es', subscribers: 1000, title: 'vibrato' };
  const liked = scoreVideo({ ...base, views: 200000, likes: 9000 });
  const viral = scoreVideo({ ...base, views: 2000000, likes: 8000 });
  assert.ok(liked > viral, `${liked} debería ser mayor que ${viral}`);
});

test('lee la duración de YouTube', () => {
  assert.equal(parseDuration('PT12M5S'), 725);
  assert.equal(parseDuration('PT1H'), 3600);
  assert.equal(parseDuration('P0D'), 0);
});
