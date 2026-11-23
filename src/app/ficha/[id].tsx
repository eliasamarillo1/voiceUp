// Ficha automática de cualquier canción del catálogo (Deezer).
// Junta tres fuentes: los datos del catálogo, la tonalidad y el tempo calculados escuchando el
// fragmento de 30 s, y el análisis de la IA (estructura, tonalidades, recursos vocales).
// Todo lo calculado se marca como estimación.
import { createElement, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { spotifySearchUrl, youtubeSearchUrl } from '../../data/songs';
import { techniqueById } from '../../data/techniques';
import {
  analysisOnline,
  deezerTrackUrl,
  geniusSearchUrl,
  getTrack,
  musixmatchSearchUrl,
  previewAudioUrl,
  requestAnalysis,
  savedAnalysis,
  type CatalogTrack,
  type SongAnalysis,
} from '../../lib/songCatalog';
import { analyzeAudio, type AudioEstimate } from '../../lib/audioKey';
import { Frame } from '../../components/Nouveau';
import { Instrumental } from '../../components/Instrumental';
import { Body, Card, LinkButton, Page, Pill } from '../../components/ui';
import { colors, fonts, formatTime, radius, sectionColors, sectionInk } from '../../theme';

const TABS = [
  { id: 'recursos', label: 'Recursos vocales' },
  { id: 'estructura', label: 'Estructura' },
  { id: 'tonos', label: 'Tonalidades' },
  { id: 'letra', label: 'Letra' },
  { id: 'instrumental', label: 'Instrumental' },
  { id: 'info', label: 'Información y fuentes' },
] as const;
type TabId = (typeof TABS)[number]['id'];

type Load<T> = { state: 'idle' | 'loading' | 'ok' | 'error'; value?: T; error?: string };

export default function AutoSongScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? '');
  const [track, setTrack] = useState<Load<CatalogTrack>>({ state: 'loading' });
  const [tab, setTab] = useState<TabId>('recursos');
  const [audio, setAudio] = useState<Load<AudioEstimate>>({ state: 'idle' });
  const [ai, setAi] = useState<Load<SongAnalysis>>(() => {
    const saved = savedAnalysis(id);
    return saved ? { state: 'ok', value: saved } : { state: 'idle' };
  });

  useEffect(() => {
    let alive = true;
    setTrack({ state: 'loading' });
    getTrack(id)
      .then((t) => alive && setTrack(t ? { state: 'ok', value: t } : { state: 'error' }))
      .catch(() => alive && setTrack({ state: 'error' }));
    return () => {
      alive = false;
    };
  }, [id]);

  const t = track.value;

  // Tonalidad y tempo escuchando el fragmento (solo en la web).
  useEffect(() => {
    if (!t || Platform.OS !== 'web') return;
    const url = previewAudioUrl(t);
    if (!url) return;
    let alive = true;
    setAudio({ state: 'loading' });
    analyzeAudio(url)
      .then((v) => alive && setAudio({ state: 'ok', value: v }))
      .catch(() => alive && setAudio({ state: 'error' }));
    return () => {
      alive = false;
    };
  }, [t]);

  const generate = () => {
    if (!t) return;
    setAi({ state: 'loading' });
    requestAnalysis(t)
      .then((v) => setAi({ state: 'ok', value: v }))
      .catch((e: Error) => setAi({ state: 'error', error: e.message }));
  };

  // Análisis automático al abrir la ficha, si la función está configurada.
  useEffect(() => {
    if (t && analysisOnline() && ai.state === 'idle') generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const back = (
    <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
      <Text style={styles.back}>← Biblioteca</Text>
    </Pressable>
  );

  if (track.state === 'loading') {
    return (
      <Page style={{ paddingTop: 8 }}>
        {back}
        <ActivityIndicator color={colors.frame} />
      </Page>
    );
  }
  if (!t) {
    return (
      <Page>
        {back}
        <Text style={styles.title}>No encontramos esta canción</Text>
        <Body>Puede que el enlace esté mal o que el catálogo no responda. Prueba a buscarla otra vez.</Body>
      </Page>
    );
  }

  const a = ai.value;
  const query = `${t.title} ${t.artist}`;
  const year = a?.year || t.releaseDate?.slice(0, 4);
  const audioKey = audio.value?.key;
  const tempo = a?.deezerBpm
    ? { value: `${Math.round(a.deezerBpm)} BPM`, origin: 'Deezer' }
    : audio.value
      ? { value: `${audio.value.bpm} BPM`, origin: 'calculado del audio' }
      : a?.bpm
        ? { value: `${Math.round(a.bpm)} BPM`, origin: 'estimación de la IA' }
        : undefined;
  const mainKey = audioKey
    ? { value: audioKey, origin: 'calculada del audio' }
    : a?.mainKey
      ? { value: a.mainKey, origin: 'estimación de la IA' }
      : undefined;
  const duration = t.duration ?? 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <Page>
        {back}
        <View style={styles.head}>
          {t.cover && <Image source={{ uri: t.cover }} style={styles.cover} accessibilityIgnoresInvertColors />}
          <View style={{ flex: 1, minWidth: 220 }}>
            <Text style={styles.kicker}>{[a?.genre, year].filter(Boolean).join(' · ') || 'Ficha automática'}</Text>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.artist}>
              {t.artist}
              {t.album ? ` · ${t.album}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat
            label="Tonalidad"
            value={mainKey?.value}
            origin={mainKey?.origin}
            loading={!mainKey && (audio.state === 'loading' || ai.state === 'loading')}
          />
          <Stat
            label="Tempo"
            value={tempo?.value}
            origin={tempo?.origin}
            loading={!tempo && (audio.state === 'loading' || ai.state === 'loading')}
          />
          {a?.timeSignature ? <Stat label="Compás" value={a.timeSignature} origin="IA" /> : null}
          {a?.vocalRange ? (
            <Stat label="Rango" value={`${a.vocalRange.low}–${a.vocalRange.high}`} origin="IA" />
          ) : null}
          {a?.difficulty ? <Stat label="Nivel" value={a.difficulty} origin="IA" /> : null}
          {duration ? <Stat label="Duración" value={formatTime(duration)} /> : null}
        </View>

        <AiPanel state={ai} onRetry={generate} />

        <Card style={styles.listen}>
          <Text style={styles.cardTitle}>Escúchala</Text>
          {Platform.OS === 'web' && previewAudioUrl(t)
            ? createElement('audio', {
                controls: true,
                preload: 'none',
                src: previewAudioUrl(t),
                style: { width: '100%', marginTop: 4 },
                'aria-label': 'Fragmento de 30 segundos',
              })
            : null}
          <Text style={styles.small}>Fragmento de 30 segundos. La canción completa, aquí:</Text>
          <View style={styles.row}>
            <LinkButton label="Spotify" url={spotifySearchUrl(query)} tone="spotify" />
            <LinkButton label="YouTube" url={youtubeSearchUrl(query)} tone="youtube" />
            <LinkButton label="Deezer" url={deezerTrackUrl(t)} />
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 24 }}>
          <View style={styles.tabs}>
            {TABS.map((x) => (
              <Pill key={x.id} label={x.label} active={tab === x.id} onPress={() => setTab(x.id)} />
            ))}
          </View>
        </ScrollView>

        <View style={{ marginTop: 18 }}>
          {tab === 'recursos' &&
            (a ? (
              a.techniques?.length ? (
                <View style={{ gap: 10 }}>
                  <Text style={styles.small}>
                    Toca uno para ver qué es, cómo se hace y ejercicios para entrenarlo.
                  </Text>
                  {a.techniques.map((o, i) => {
                    const tech = techniqueById(o.techniqueId);
                    if (!tech) return null;
                    return (
                      <Pressable
                        key={i}
                        accessibilityRole="link"
                        onPress={() => router.push({ pathname: '/recurso/[id]', params: { id: tech.id } })}
                        style={({ pressed }) => [styles.tech, pressed && { transform: [{ scale: 0.98 }] }]}
                      >
                        <View style={[styles.techBar, { backgroundColor: tech.color }]} />
                        <View style={{ flex: 1, gap: 3 }}>
                          <Text style={styles.techName}>
                            {tech.name} <Text style={styles.small}>· {o.section}</Text>
                          </Text>
                          {o.where ? <Text style={styles.where}>«{o.where}»</Text> : null}
                          <Text style={styles.techNote}>{o.note}</Text>
                        </View>
                        <Text style={styles.techGo}>Ejercicios →</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Body>El análisis no encontró recursos vocales claros en esta canción.</Body>
              )
            ) : (
              <Pending
                state={ai.state}
                what="Aquí aparecerán los recursos vocales de esta canción (vibrato, falsete, belting…), en qué parte suena cada uno y un enlace a sus ejercicios y vídeos."
              />
            ))}

          {tab === 'estructura' &&
            (a?.sections?.length ? (
              <Frame>
                <StructureBar sections={a.sections} duration={duration || a.sections.at(-1)!.end} />
                <View style={{ gap: 6, marginTop: 14 }}>
                  {a.sections.map((s, i) => (
                    <View key={i} style={styles.sectionRow}>
                      <View style={[styles.dot, { backgroundColor: sectionColors[s.type] ?? colors.frame }]} />
                      <Text style={[styles.sectionLabel, { color: sectionInk[s.type] ?? colors.text }]}>
                        {s.label}
                      </Text>
                      <Text style={styles.small}>
                        {formatTime(s.start)}–{formatTime(s.end)}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.small, { marginTop: 10 }]}>
                  Momentos aproximados en la grabación original.
                </Text>
              </Frame>
            ) : (
              <Pending
                state={ai.state}
                what="Aquí aparecerá el mapa de la canción: intro, estrofas, estribillos y puente, con el minuto en que empieza cada parte."
              />
            ))}

          {tab === 'tonos' && (
            <Card style={{ gap: 8 }}>
              {audio.value ? (
                <View style={styles.sectionRow}>
                  <Text style={styles.keyName}>{audio.value.key}</Text>
                  <Text style={styles.small}>calculada escuchando el fragmento de 30 s · {audio.value.bpm} BPM</Text>
                </View>
              ) : audio.state === 'loading' ? (
                <Text style={styles.small}>Calculando la tonalidad del fragmento…</Text>
              ) : null}
              {a ? (
                (a.keys?.length ? a.keys : [{ key: a.mainKey, start: 0, end: duration, note: '' }]).map((k, i) => (
                  <View key={i} style={styles.sectionRow}>
                    <Text style={styles.keyName}>{k.key}</Text>
                    <Text style={styles.small}>
                      {formatTime(k.start)}–{formatTime(k.end)}
                      {k.note ? ` · ${k.note}` : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.small}>
                  Los cambios de tono de toda la canción llegarán con el análisis completo.
                </Text>
              )}
              {audioKey && a?.mainKey && !sameKey(audioKey, a.mainKey) && (
                <Text style={styles.small}>
                  Ojo: el cálculo del audio da {audioKey} y el análisis dice {a.mainKey}. Pueden ser
                  tonalidades relativas o un cambio de tono fuera del fragmento. Fíate de tu oído.
                </Text>
              )}
            </Card>
          )}

          {tab === 'letra' && (
            <Card style={{ gap: 12 }}>
              <Body>
                La letra tiene derechos de autor, así que no la copiamos aquí. Puedes leerla en webs que
                tienen licencia para mostrarla:
              </Body>
              <View style={styles.row}>
                <LinkButton label="Letra en Genius" url={geniusSearchUrl(t)} />
                <LinkButton label="Letra en Musixmatch" url={musixmatchSearchUrl(t)} />
              </View>
            </Card>
          )}

          {tab === 'instrumental' && (
            <Instrumental query={query} songKey={mainKey?.value} keyOrigin={mainKey?.origin} />
          )}

          {tab === 'info' && (
            <Card style={{ gap: 10 }}>
              {a?.about ? <Body>{a.about}</Body> : null}
              <Body>
                Título, artista, álbum y fragmento: catálogo de Deezer. Tonalidad y tempo: calculados
                escuchando el fragmento de 30 segundos, así que no ven cambios de tono fuera de él.
                {a
                  ? ` Estructura, tonalidades, rango y recursos vocales: análisis automático con IA (${a.model}), que puede equivocarse.`
                  : ' Estructura y recursos vocales: pendientes del análisis automático.'}
              </Body>
              {a?.notes ? <Text style={styles.small}>Nota del análisis: {a.notes}</Text> : null}
              <View style={styles.row}>
                {a?.sources
                  ?.filter((s) => /^https:\/\//.test(s.url))
                  .slice(0, 6)
                  .map((s, i) => <LinkButton key={i} label={s.label} url={s.url} />)}
              </View>
            </Card>
          )}
        </View>
      </Page>
    </ScrollView>
  );
}

const sameKey = (x: string, y: string) => x.toLowerCase().replace(/\s+/g, ' ') === y.toLowerCase().replace(/\s+/g, ' ');

function AiPanel({ state, onRetry }: { state: Load<SongAnalysis>; onRetry: () => void }) {
  if (state.state === 'ok') {
    const v = state.value!;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          ✦ Análisis vocal listo. Es automático, así que puede equivocarse
          {v.confidence < 0.5 || !v.known ? ' (poca seguridad en esta canción)' : ''}.
        </Text>
      </View>
    );
  }
  if (state.state === 'loading') {
    return (
      <Card style={{ marginTop: 20, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <ActivityIndicator color={colors.frame} />
        <Body>Analizando la canción: estructura, tonalidades y recursos vocales. Tarda unos segundos…</Body>
      </Card>
    );
  }
  if (state.state === 'error') {
    return (
      <Card style={{ marginTop: 20, gap: 10 }}>
        <Body>No se pudo hacer el análisis vocal. {state.error}</Body>
        <Pressable onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retry}>Intentar otra vez</Text>
        </Pressable>
      </Card>
    );
  }
  // Sin servidor de análisis todavía.
  return (
    <Frame style={{ marginTop: 20 }}>
      <Text style={styles.pendingKicker}>ANÁLISIS VOCAL</Text>
      <Text style={styles.cardTitle}>Pendiente de activar</Text>
      <Body>
        Ya tienes la tonalidad y el tempo, calculados escuchando la canción. La estructura y los recursos
        vocales los prepara el análisis automático, que todavía no está conectado. Cuando se active,
        aparecerán solos en las pestañas de abajo.
      </Body>
    </Frame>
  );
}

function Pending({ state, what }: { state: Load<SongAnalysis>['state']; what: string }) {
  return (
    <View style={styles.pending}>
      <View style={styles.sectionRow}>
        {state === 'loading' ? <ActivityIndicator color={colors.frame} size="small" /> : null}
        <Text style={styles.pendingKicker}>
          {state === 'loading' ? 'ANALIZANDO…' : 'ANÁLISIS PENDIENTE'}
        </Text>
      </View>
      <Body>{what}</Body>
    </View>
  );
}

function Stat({
  label,
  value,
  origin,
  loading,
}: {
  label: string;
  value?: string;
  origin?: string;
  loading?: boolean;
}) {
  if (!value && !loading) return null;
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value ?? 'Calculando…'}</Text>
      {origin ? <Text style={styles.statOrigin}>{origin}</Text> : null}
    </View>
  );
}

function StructureBar({ sections, duration }: { sections: SongAnalysis['sections']; duration: number }) {
  const total = Math.max(duration, 1);
  return (
    <View style={styles.bar} accessibilityLabel="Mapa de la estructura">
      {sections.map((s, i) => (
        <View
          key={i}
          style={{
            flex: Math.max(0.5, s.end - s.start) / total,
            backgroundColor: sectionColors[s.type] ?? colors.frame,
            borderRightWidth: i < sections.length - 1 ? 2 : 0,
            borderColor: colors.gold,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.muted, fontSize: 15, fontFamily: fonts.bold, paddingTop: 24, paddingBottom: 16 },
  head: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cover: { width: 120, height: 120, borderRadius: radius.md, borderWidth: 2, borderColor: colors.gold },
  kicker: { color: colors.accent, fontSize: 14, fontFamily: fonts.heavy, letterSpacing: 1 },
  title: { color: colors.text, fontSize: 34, fontFamily: fonts.display, marginTop: 6 },
  artist: { color: colors.muted, fontSize: 17, fontFamily: fonts.regular, marginTop: 4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  stat: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.faint, fontSize: 13, fontFamily: fonts.bold },
  statValue: { color: colors.text, fontSize: 15, fontFamily: fonts.bold, marginTop: 2 },
  statOrigin: { color: colors.faint, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
  listen: { marginTop: 20, gap: 10 },
  cardTitle: { color: colors.frameDark, fontSize: 18, fontFamily: fonts.heavy },
  small: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: { color: colors.frameDark, fontSize: 14, fontFamily: fonts.bold },
  tabs: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  pending: {
    gap: 8,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  pendingKicker: { color: colors.gold, fontSize: 13, fontFamily: fonts.heavy, letterSpacing: 1 },
  exampleBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.frameDark,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 12,
  },
  exampleBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: fonts.bold },
  retry: { color: colors.accent, fontSize: 15, fontFamily: fonts.heavy },
  bar: {
    flexDirection: 'row',
    height: 34,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  sectionLabel: { fontSize: 15, fontFamily: fonts.bold, minWidth: 110 },
  keyName: { color: colors.text, fontSize: 16, fontFamily: fonts.heavy, minWidth: 110 },
  tech: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    padding: 14,
  },
  techBar: { width: 6, alignSelf: 'stretch', borderRadius: 3 },
  techName: { color: colors.text, fontSize: 16, fontFamily: fonts.heavy },
  where: { color: colors.frameDark, fontSize: 14, fontFamily: fonts.medium, fontStyle: 'italic' },
  techNote: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, lineHeight: 21 },
  techGo: { color: colors.accent, fontSize: 14, fontFamily: fonts.heavy },
});
