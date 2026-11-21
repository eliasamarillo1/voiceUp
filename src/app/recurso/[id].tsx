import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { songById, songs } from '../../data/songs';
import { techniqueById } from '../../data/techniques';
import type { Technique } from '../../data/types';
import { tutorialsFor } from '../../data/tutorials';
import { VideoCarousel } from '../../components/VideoCarousel';
import { Body, Card, LinkButton, Page, SectionTitle } from '../../components/ui';
import { fonts, colors, formatTime, radius } from '../../theme';

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
      <View style={[styles.hero, { backgroundColor: `${t.color}14` }]}>
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

        <SectionTitle hint="Elige uno y practícalo unos minutos cada día">
          Ejercicios para practicarlo
        </SectionTitle>
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

        <SectionTitle hint="Toca uno para verlo aquí mismo, sin salir de la app">
          Vídeos tutoriales
        </SectionTitle>
        <VideoCarousel
          videos={tutorialsFor(t)}
          searchQuery={`${t.name} canto tutorial`}
          accent={t.color}
        />

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
            <SectionTitle>
              {fromSong ? 'También aparece en' : 'Canciones donde aparece'}
            </SectionTitle>
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
                      {s.occurrences.filter((o) => o.techniqueId === t.id).length} veces · primera
                      en «{first.word}»
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {t.sources.length > 0 && (
          <>
            <SectionTitle>Fuentes</SectionTitle>
            <View style={styles.row}>
              {t.sources.map((s) => (
                <LinkButton key={s.url} label={s.label} url={s.url} />
              ))}
            </View>
          </>
        )}
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 28 },
  back: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.bold,
    paddingTop: 24,
    paddingBottom: 20,
  },
  kicker: { fontSize: 14, fontFamily: fonts.heavy, letterSpacing: 1 },
  title: { color: colors.text, fontSize: 44, fontFamily: fonts.display, marginTop: 6 },
  summary: {
    color: colors.muted,
    fontSize: 17,
    fontFamily: fonts.regular,
    lineHeight: 26,
    marginTop: 8,
    maxWidth: 640,
  },
  moment: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 4,
  },
  momentTime: { color: colors.text, fontFamily: fonts.heavy, minWidth: 44 },
  momentLine: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  momentNote: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular, marginTop: 2 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#FFFFFF', fontFamily: fonts.heavy },
  stepText: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 22,
    flex: 1,
    paddingTop: 2,
  },
  exHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  exTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.heavy, flex: 1 },
  exToggle: { fontSize: 24, fontFamily: fonts.display },
  exStep: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  mistake: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, lineHeight: 22 },
  songRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 },
  songTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.heavy },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
