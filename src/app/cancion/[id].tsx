import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { songById, spotifySearchUrl, youtubeSearchUrl } from '../../data/songs';
import { techniqueById } from '../../data/techniques';
import type { Occurrence, Song } from '../../data/types';
import { usePlaybackClock } from '../../lib/usePlaybackClock';
import { tokenizeLine, transposeKey, transposeNote } from '../../lib/music';
import { SongMap } from '../../components/SongMap';
import { Frame } from '../../components/Nouveau';
import { SheetMusic } from '../../components/SheetMusic';
import { YouTubeEmbed } from '../../components/YouTubeEmbed';
import { Body, Card, LinkButton, Page, Pill } from '../../components/ui';
import { fonts, colors, formatTime, radius, sectionColors, sectionInk } from '../../theme';

const TABS = [
  { id: 'letra', label: 'Letra' },
  { id: 'recursos', label: 'Recursos vocales' },
  { id: 'estructura', label: 'Estructura' },
  { id: 'tonos', label: 'Tonalidades' },
  { id: 'partitura', label: 'Partitura' },
  { id: 'info', label: 'Información' },
  { id: 'escuchar', label: 'Escuchar y fuentes' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function SongScreen() {
  const params = useLocalSearchParams<{ id: string; t?: string; tab?: string }>();
  const song = songById(params.id);
  if (!song) {
    return (
      <Page style={{ paddingTop: 48 }}>
        <Text style={styles.title}>No encontramos esta canción</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.back}>← Volver a la búsqueda</Text>
        </Pressable>
      </Page>
    );
  }
  return (
    <SongFolder song={song} initialTime={Number(params.t) || 0} initialTab={params.tab as TabId} />
  );
}

function SongFolder({
  song,
  initialTime,
  initialTab,
}: {
  song: Song;
  initialTime: number;
  initialTab?: TabId;
}) {
  const clock = usePlaybackClock(song.duration, initialTime);
  const [tab, setTab] = useState<TabId>(
    TABS.some((t) => t.id === initialTab) ? initialTab! : 'letra',
  );

  const section = song.sections.find((s) => clock.time >= s.start && clock.time < s.end);
  const openOccurrence = (o: Occurrence) =>
    router.push({ pathname: '/recurso/[id]', params: { id: o.techniqueId, song: song.id } });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Page>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <Text style={styles.back}>← Biblioteca</Text>
          </Pressable>

          <Text style={styles.kicker}>{song.genre}</Text>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.artist}</Text>

          <View style={styles.stats}>
            <Stat label="Tonalidad" value={song.mainKey} />
            <Stat label="Tempo" value={`${song.bpm} BPM`} />
            <Stat label="Compás" value={song.timeSignature} />
            <Stat label="Rango" value={`${song.vocalRange.low}–${song.vocalRange.high}`} />
            <Stat label="Nivel" value={song.difficulty} />
          </View>

          <View style={styles.listen}>
            <View style={styles.listenVideo}>
              <YouTubeEmbed videoId={song.video.videoId} title={song.video.title} />
            </View>
            <View style={styles.listenText}>
              <Text style={styles.listenTitle}>Escucha la canción</Text>
              <Text style={styles.listenSub}>{song.video.title}</Text>
              <Text style={styles.listenHint}>
                Dale al play en el vídeo para oírla. Mientras, sigue la letra y los recursos vocales
                aquí debajo.
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  router.push({ pathname: '/calentamiento', params: { song: song.id } })
                }
                style={({ pressed }) => [styles.warmBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.warmBtnText}>Calentar antes de cantar →</Text>
              </Pressable>
            </View>
          </View>

          <Frame style={{ marginTop: 24 }}>
            <Text style={styles.mapTitle}>Mapa de la canción</Text>
            <SongMap
              song={song}
              time={clock.time}
              onSeek={clock.seek}
              onOccurrence={openOccurrence}
            />
            <Text style={styles.mapHint}>
              Toca el mapa para saltar a una parte. Los puntos de colores son los recursos vocales.
            </Text>
          </Frame>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20 }}>
            <View style={styles.tabs}>
              {TABS.map((t) => (
                <Pill
                  key={t.id}
                  label={t.label}
                  active={tab === t.id}
                  onPress={() => setTab(t.id)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={{ marginTop: 20 }}>
            {tab === 'letra' && (
              <LyricsTab
                song={song}
                time={clock.time}
                onSeek={clock.seek}
                onOccurrence={openOccurrence}
              />
            )}
            {tab === 'recursos' && (
              <TechniquesTab
                song={song}
                onPlay={(t) => {
                  clock.seek(t);
                  clock.play();
                  setTab('letra');
                }}
              />
            )}
            {tab === 'estructura' && (
              <StructureTab song={song} time={clock.time} onSeek={clock.seek} />
            )}
            {tab === 'tonos' && <KeysTab song={song} />}
            {tab === 'partitura' && <SheetTab song={song} />}
            {tab === 'info' && <InfoTab song={song} />}
            {tab === 'escuchar' && <ListenTab song={song} />}
          </View>
        </Page>
      </ScrollView>

      <View style={styles.player}>
        <Page style={styles.playerInner}>
          <Pressable
            onPress={clock.toggle}
            accessibilityRole="button"
            accessibilityLabel={clock.playing ? 'Pausar' : 'Reproducir'}
            style={styles.playBtn}
          >
            <Text style={styles.playIcon}>{clock.playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerTitle} numberOfLines={1}>
              {section?.label ?? 'Fin'} · {formatTime(clock.time)} / {formatTime(song.duration)}
            </Text>
            <Text style={styles.playerHint} numberOfLines={1}>
              Modo letra: avanza la letra sin sonido. El sonido está en el vídeo de arriba.
            </Text>
          </View>
        </Page>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function LyricsTab({
  song,
  time,
  onSeek,
  onOccurrence,
}: {
  song: Song;
  time: number;
  onSeek: (t: number) => void;
  onOccurrence: (o: Occurrence) => void;
}) {
  // Partir cada verso en palabras solo cuando cambia la canción, no en cada avance del reloj.
  const tokenized = useMemo(
    () =>
      song.lyrics.map((line, i) =>
        tokenizeLine(
          line.text,
          song.occurrences.filter((o) => o.line === i),
        ),
      ),
    [song],
  );
  let lastSection = '';
  return (
    <View style={{ gap: 4 }}>
      {song.lyrics.map((line, i) => {
        const active = time >= line.start && time < line.end;
        const past = time >= line.end;
        const sec = song.sections.find((s) => line.start >= s.start && line.start < s.end);
        const showSection = sec && sec.label + sec.start !== lastSection;
        if (sec) lastSection = sec.label + sec.start;
        const tokens = tokenized[i];
        return (
          <View key={i}>
            {showSection && (
              <Text style={[styles.lyricSection, { color: sectionInk[sec.type] }]}>
                {sec.label}
              </Text>
            )}
            <Pressable
              onPress={() => onSeek(line.start)}
              style={[styles.lyricLine, active && styles.lyricActive]}
            >
              <Text
                style={[
                  styles.lyricText,
                  past && { color: colors.faint },
                  active && { color: colors.text },
                ]}
              >
                {tokens.map((tk, j) => {
                  const sp = j < tokens.length - 1 ? ' ' : '';
                  if (!tk.mark) return tk.raw + sp;
                  const tech = techniqueById(tk.mark.techniqueId);
                  if (!tech) return tk.raw + sp;
                  const now = time >= tk.mark.start && time < tk.mark.end;
                  return (
                    <Text key={j}>
                      <Text
                        onPress={() => onOccurrence(tk.mark!)}
                        accessibilityRole="link"
                        accessibilityLabel={`${tk.raw}: ${tech.name}`}
                        style={[
                          styles.markWord,
                          { color: tech.color, textDecorationColor: tech.color },
                          now && { backgroundColor: `${tech.color}33` },
                        ]}
                      >
                        {tk.raw}
                      </Text>
                      {sp}
                    </Text>
                  );
                })}
              </Text>
            </Pressable>
          </View>
        );
      })}
      <Text style={styles.footNote}>
        Las palabras de color tienen un recurso vocal. Tócalas para ver qué es y cómo practicarlo.
      </Text>
    </View>
  );
}

function TechniquesTab({ song, onPlay }: { song: Song; onPlay: (t: number) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of song.occurrences)
      map.set(o.techniqueId, [...(map.get(o.techniqueId) ?? []), o]);
    return [...map.entries()];
  }, [song]);

  return (
    <View style={{ gap: 14 }}>
      {groups.map(([id, list]) => {
        const t = techniqueById(id);
        if (!t) return null;
        return (
          <Card key={id} style={{ borderLeftWidth: 4, borderLeftColor: t.color }}>
            <Pressable
              onPress={() =>
                router.push({ pathname: '/recurso/[id]', params: { id, song: song.id } })
              }
              accessibilityRole="link"
              style={styles.techHead}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.techName, { color: t.color }]}>{t.name}</Text>
                <Text style={styles.techSummary}>{t.summary}</Text>
              </View>
              <Text style={styles.techCta}>Ejercicios y vídeos →</Text>
            </Pressable>
            <View style={{ marginTop: 12, gap: 8 }}>
              {list.map((o, i) => (
                <Pressable key={i} onPress={() => onPlay(o.start)} style={styles.moment}>
                  <Text style={styles.momentTime}>▶ {formatTime(o.start)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.momentWord}>"{o.word}"</Text>
                    <Text style={styles.momentNote}>{o.note}</Text>
                  </View>
                  <Text style={styles.badge}>
                    {o.origin === 'revisado'
                      ? 'Revisado'
                      : `Automático · ${Math.round(o.confidence * 100)} %`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        );
      })}
      <Text style={styles.footNote}>
        "Automático" indica que el recurso lo detecta el análisis automático, con su nivel de
        fiabilidad. En este prototipo los datos son de ejemplo.
      </Text>
    </View>
  );
}

function StructureTab({
  song,
  time,
  onSeek,
}: {
  song: Song;
  time: number;
  onSeek: (t: number) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      {song.sections.map((s, i) => {
        const active = time >= s.start && time < s.end;
        const count = song.occurrences.filter((o) => o.start >= s.start && o.start < s.end).length;
        return (
          <Pressable
            key={i}
            onPress={() => onSeek(s.start)}
            style={[styles.structRow, active && { borderColor: sectionColors[s.type] }]}
          >
            <View style={[styles.structSwatch, { backgroundColor: sectionColors[s.type] }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.structName}>{s.label}</Text>
              <Text style={styles.structMeta}>
                {formatTime(s.start)} – {formatTime(s.end)} · {Math.round(s.end - s.start)} s
              </Text>
            </View>
            <Text style={styles.structCount}>
              {count} recurso{count === 1 ? '' : 's'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function KeysTab({ song }: { song: Song }) {
  const [shift, setShift] = useState(0);
  return (
    <View style={{ gap: 14 }}>
      {song.keys.map((k, i) => (
        <Card key={i}>
          <Text style={styles.keyName}>{transposeKey(k.key, shift)}</Text>
          <Text style={styles.structMeta}>
            {formatTime(k.start)} – {formatTime(k.end)}
          </Text>
          {k.note && <Text style={[styles.techSummary, { marginTop: 6 }]}>{k.note}</Text>}
        </Card>
      ))}
      <Card>
        <Text style={styles.cardHeading}>Adáptala a tu voz</Text>
        <Body>
          Si la canción te queda alta o baja, súbela o bájala por semitonos y mira cómo cambian la
          tonalidad y el rango.
        </Body>
        <View style={styles.transposer}>
          <Pill label="− 1" onPress={() => setShift(shift - 1)} />
          <Text style={styles.shift}>
            {shift === 0
              ? 'Original'
              : `${shift > 0 ? '+' : ''}${shift} semitono${Math.abs(shift) === 1 ? '' : 's'}`}
          </Text>
          <Pill label="+ 1" onPress={() => setShift(shift + 1)} />
        </View>
        <Text style={styles.rangeText}>
          Rango: {transposeNote(song.vocalRange.low, shift)} –{' '}
          {transposeNote(song.vocalRange.high, shift)}
        </Text>
      </Card>
    </View>
  );
}

function SheetTab({ song }: { song: Song }) {
  if (!song.sheetMusic) {
    return (
      <Card>
        <Text style={styles.cardHeading}>Partitura en preparación</Text>
        <Body>
          La partitura de la voz se generará a partir de la melodía detectada. En este prototipo
          solo "Amazing Grace" tiene un fragmento de ejemplo.
        </Body>
      </Card>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.cardHeading}>{song.sheetMusic.title}</Text>
      <SheetMusic musicXml={song.sheetMusic.musicXml} />
    </View>
  );
}

function InfoTab({ song }: { song: Song }) {
  const rows: [string, string][] = [
    ['Autoría', song.authors],
    ['Año', song.year],
    ['Género', song.genre],
    ['Idioma', song.language],
    ['Tempo', `${song.bpm} BPM`],
    ['Compás', song.timeSignature],
    ['Duración de referencia', formatTime(song.duration)],
    ['Rango vocal', `${song.vocalRange.low} – ${song.vocalRange.high}`],
    ['Dificultad', song.difficulty],
  ];
  return (
    <View style={{ gap: 14 }}>
      <Card>
        <Body>{song.about}</Body>
      </Card>
      <Card style={{ gap: 10 }}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.infoRow}>
            <Text style={styles.infoKey}>{k}</Text>
            <Text style={styles.infoVal}>{v}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function ListenTab({ song }: { song: Song }) {
  return (
    <View style={{ gap: 14 }}>
      <Card style={{ gap: 12 }}>
        <Text style={styles.cardHeading}>Escucha la canción completa</Text>
        <View style={styles.row}>
          <LinkButton
            label="Abrir en Spotify"
            url={spotifySearchUrl(song.listenQuery)}
            tone="spotify"
          />
          <LinkButton
            label="Abrir en YouTube"
            url={youtubeSearchUrl(song.listenQuery)}
            tone="youtube"
          />
        </View>
      </Card>
      <Card style={{ gap: 12 }}>
        <Text style={styles.cardHeading}>Fuentes de la información</Text>
        <View style={styles.row}>
          {song.sources.map((s) => (
            <LinkButton key={s.url} label={s.label} url={s.url} />
          ))}
        </View>
        <Text style={styles.footNote}>
          El análisis de esta canción es un ejemplo para el prototipo: los tiempos y los recursos
          son ilustrativos.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  mapTitle: { color: colors.frameDark, fontSize: 22, fontFamily: fonts.display, marginBottom: 8 },
  back: {
    color: colors.muted,
    fontSize: 16,
    fontFamily: fonts.bold,
    paddingTop: 24,
    paddingBottom: 16,
  },
  kicker: {
    color: colors.accent,
    fontSize: 15,
    fontFamily: fonts.heavy,
    letterSpacing: 1,
  },
  title: { color: colors.text, fontSize: 38, fontFamily: fonts.display, marginTop: 6 },
  artist: { color: colors.muted, fontSize: 18, fontFamily: fonts.regular, marginTop: 4 },
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
  statValue: { color: colors.text, fontSize: 16, fontFamily: fonts.bold, marginTop: 2 },
  listen: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  listenVideo: { flexGrow: 1, flexBasis: 320, maxWidth: 520 },
  listenText: { flexGrow: 1, flexBasis: 220, justifyContent: 'center', padding: 8 },
  listenTitle: { color: colors.text, fontSize: 20, fontFamily: fonts.display },
  listenSub: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, marginTop: 4 },
  listenHint: {
    color: colors.faint,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 19,
    marginTop: 10,
  },
  warmBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  warmBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: fonts.heavy },
  mapHint: { color: colors.faint, fontSize: 14, fontFamily: fonts.regular, marginTop: 8 },
  tabs: { flexDirection: 'row', gap: 8 },
  lyricSection: {
    fontSize: 14,
    fontFamily: fonts.heavy,
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 4,
  },
  lyricLine: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md },
  lyricActive: { backgroundColor: colors.surfaceAlt },
  lyricText: { color: colors.muted, fontSize: 22, fontFamily: fonts.display, lineHeight: 32 },
  markWord: { textDecorationLine: 'underline', textDecorationStyle: 'solid', borderRadius: 4 },
  footNote: {
    color: colors.faint,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 19,
    marginTop: 12,
  },
  techHead: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  techName: { fontSize: 20, fontFamily: fonts.display },
  techSummary: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 20,
    marginTop: 2,
  },
  techCta: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  moment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 10,
  },
  momentTime: { color: colors.text, fontSize: 15, fontFamily: fonts.heavy, minWidth: 54 },
  momentWord: { color: colors.text, fontSize: 16, fontFamily: fonts.bold },
  momentNote: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, marginTop: 2 },
  badge: { color: colors.faint, fontSize: 13, fontFamily: fonts.bold },
  structRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  structSwatch: { width: 14, height: 40, borderRadius: 4 },
  structName: { color: colors.text, fontSize: 17, fontFamily: fonts.heavy },
  structMeta: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, marginTop: 2 },
  structCount: { color: colors.faint, fontSize: 15, fontFamily: fonts.bold },
  keyName: { color: colors.text, fontSize: 26, fontFamily: fonts.display },
  cardHeading: { color: colors.text, fontSize: 18, fontFamily: fonts.heavy, marginBottom: 6 },
  transposer: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  shift: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.heavy,
    minWidth: 120,
    textAlign: 'center',
  },
  rangeText: { color: colors.muted, marginTop: 12, fontSize: 15, fontFamily: fonts.regular },
  infoRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  infoKey: { color: colors.faint, fontSize: 15, fontFamily: fonts.regular, width: 170 },
  infoVal: { color: colors.text, fontSize: 15, fontFamily: fonts.bold, flex: 1, minWidth: 160 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  player: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  playerInner: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 18, fontFamily: fonts.heavy },
  playerTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.heavy },
  playerHint: { color: colors.faint, fontSize: 14, fontFamily: fonts.regular, marginTop: 2 },
});
