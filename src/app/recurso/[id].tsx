import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { songById, songs } from '../../data/songs';
import { techniqueById } from '../../data/techniques';
import type { Technique } from '../../data/types';
import { YouTubeEmbed } from '../../components/YouTubeEmbed';
import { Body, Card, LinkButton, Page, SectionTitle } from '../../components/ui';
import { colors, formatTime, radius } from '../../theme';

export default function TechniqueScreen() {
  const { id, song: songId } = useLocalSearchParams<{ id: string; song?: string }>();
  const t = techniqueById(id);
  if (!t) {
    return (
      <Page style={{ paddingTop: 48 }}>
        <Text style={styles.title}>No encontramos este recurso</Text>
      </Page>
    );
  }
  const fromSong = songId ? songById(songId) : undefined;
  return <TechniqueDetail t={t} fromSongId={fromSong?.id} />;
}

function TechniqueDetail({ t, fromSongId }: { t: Technique; fromSongId?: string }) {
  const [open, setOpen] = useState(0);
  const fromSong = fromSongId ? songById(fromSongId) : undefined;
  const inSong = fromSong?.occurrences.filter((o) => o.techniqueId === t.id) ?? [];
  const others = songs.filter(
    (s) => s.id !== fromSongId && s.occurrences.some((o) => o.techniqueId === t.id),
  );

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <View style={[styles.hero, { backgroundColor: `${t.color}22` }]}>
        <Page>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <Text style={styles.back}>← {fromSong ? fromSong.title : 'Volver'}</Text>
          </Pressable>
          <Text style={[styles.kicker, { color: t.color }]}>Recurso vocal · {t.level}</Text>
          <Text style={styles.title}>{t.name}</Text>
          <Text style={styles.summary}>{t.summary}</Text>
        </Page>
      </View>

      <Page>
        {fromSong && inSong.length > 0 && (
          <>
            <SectionTitle hint="Toca un momento para escucharlo en la letra">
              En «{fromSong.title}»
            </SectionTitle>
            <View style={{ gap: 8 }}>
              {inSong.map((o, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    router.push({
                      pathname: '/cancion/[id]',
                      params: { id: fromSong.id, t: String(o.start), tab: 'letra' },
                    })
                  }
                  style={[styles.moment, { borderLeftColor: t.color }]}
                >
                  <Text style={styles.momentTime}>{formatTime(o.start)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.momentLine}>{fromSong.lyrics[o.line]?.text}</Text>
                    <Text style={styles.momentNote}>
                      «{o.word}»: {o.note}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <SectionTitle>Qué es</SectionTitle>
        <Body>{t.whatIs}</Body>

        <SectionTitle>Cómo se hace</SectionTitle>
        <View style={{ gap: 10 }}>
          {t.howTo.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={[styles.stepNum, { backgroundColor: t.color }]}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <SectionTitle hint="Elige uno y practícalo unos minutos cada día">Ejercicios para practicarlo</SectionTitle>
        <View style={{ gap: 10 }}>
          {t.exercises.map((ex, i) => {
            const isOpen = open === i;
            return (
              <Card key={i} style={isOpen ? { borderColor: t.color } : undefined}>
                <Pressable
                  onPress={() => setOpen(isOpen ? -1 : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  style={styles.exHead}
                >
                  <Text style={styles.exTitle}>{ex.title}</Text>
                  <Text style={[styles.exToggle, { color: t.color }]}>{isOpen ? '−' : '+'}</Text>
                </Pressable>
                {isOpen && (
                  <View style={{ gap: 8, marginTop: 12 }}>
                    {ex.steps.map((s, j) => (
                      <Text key={j} style={styles.exStep}>
                        {j + 1}. {s}
                      </Text>
                    ))}
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        <SectionTitle hint="Se reproducen aquí mismo, sin salir de la app">Vídeos tutoriales</SectionTitle>
        <View style={styles.videos}>
          {t.tutorials.map((v) => (
            <View key={v.videoId} style={styles.video}>
              <YouTubeEmbed videoId={v.videoId} title={v.title} />
              <Text style={styles.videoTitle}>{v.title}</Text>
              <Text style={styles.videoMeta}>{v.language === 'es' ? 'En español' : 'En inglés'}</Text>
            </View>
          ))}
        </View>

        <SectionTitle>Errores típicos</SectionTitle>
        <View style={{ gap: 8 }}>
          {t.commonMistakes.map((m, i) => (
            <Text key={i} style={styles.mistake}>
              ✕ {m}
            </Text>
          ))}
        </View>

        {others.length > 0 && (
          <>
            <SectionTitle>{fromSong ? 'También aparece en' : 'Canciones donde aparece'}</SectionTitle>
            <View style={{ gap: 8 }}>
              {others.map((s) => {
                const first = s.occurrences.find((o) => o.techniqueId === t.id)!;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() =>
                      router.push({ pathname: '/recurso/[id]', params: { id: t.id, song: s.id } })
                    }
                    style={styles.songRow}
                  >
                    <Text style={styles.songTitle}>{s.title}</Text>
                    <Text style={styles.momentNote}>
                      {s.occurrences.filter((o) => o.techniqueId === t.id).length} veces · primera en «
                      {first.word}»
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <SectionTitle>Fuentes</SectionTitle>
        <View style={styles.row}>
          {t.sources.map((s) => (
            <LinkButton key={s.url} label={s.label} url={s.url} />
          ))}
          {t.tutorials.map((v) => (
            <LinkButton key={v.videoId} label={`YouTube: ${v.title}`} url={`https://www.youtube.com/watch?v=${v.videoId}`} />
          ))}
        </View>
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 28 },
  back: { color: colors.muted, fontSize: 15, fontWeight: '600', paddingTop: 24, paddingBottom: 20 },
  kicker: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 44, fontWeight: '900', letterSpacing: -1, marginTop: 6 },
  summary: { color: colors.text, fontSize: 18, lineHeight: 26, marginTop: 8, maxWidth: 640, opacity: 0.85 },
  moment: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 4,
  },
  momentTime: { color: colors.text, fontWeight: '800', minWidth: 44 },
  momentLine: { color: colors.text, fontWeight: '700', fontSize: 15 },
  momentNote: { color: colors.muted, fontSize: 13, marginTop: 2 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: colors.bg, fontWeight: '900' },
  stepText: { color: colors.muted, fontSize: 15, lineHeight: 22, flex: 1, paddingTop: 2 },
  exHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  exTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  exToggle: { fontSize: 24, fontWeight: '800' },
  exStep: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  videos: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  video: { flexGrow: 1, flexBasis: 280, maxWidth: '100%' },
  videoTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 8 },
  videoMeta: { color: colors.faint, fontSize: 12, marginTop: 2 },
  mistake: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  songRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 },
  songTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
