import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  routineMinutes,
  stepById,
  warmupRoutines,
  warmupVideos,
  type WarmupRoutine,
} from '../data/warmups';
import { songById } from '../data/songs';
import { techniqueById } from '../data/techniques';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import { Card, Page, SectionTitle } from '../components/ui';
import { fonts, colors, formatTime, radius } from '../theme';

export default function WarmupScreen() {
  const { song: songId } = useLocalSearchParams<{ song?: string }>();
  const song = songId ? songById(songId) : undefined;
  const [routine, setRoutine] = useState<WarmupRoutine>(warmupRoutines[0]);

  // Recursos de la canción que más se repiten: se proponen para practicar al final.
  const songTechniques = song
    ? [...new Set(song.occurrences.map((o) => o.techniqueId))]
        .map((id) => ({ id, n: song.occurrences.filter((o) => o.techniqueId === id).length }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 3)
        .map((x) => techniqueById(x.id)!)
    : [];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <Page>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Text style={styles.back}>← {song ? song.title : 'Volver'}</Text>
        </Pressable>
        <Text style={styles.kicker}>
          {song ? `Antes de cantar «${song.title}»` : 'Antes de cantar'}
        </Text>
        <Text style={styles.title}>Calentamiento vocal</Text>
        <Text style={styles.sub}>
          Unos minutos de calentamiento protegen la voz y hacen que suene mejor desde la primera
          nota. Elige una rutina y sigue los pasos con el temporizador.
        </Text>

        <View style={styles.routines}>
          {warmupRoutines.map((r) => {
            const active = r.id === routine.id;
            return (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setRoutine(r)}
                style={[styles.routine, active && styles.routineActive]}
              >
                <Text style={[styles.routineName, active && { color: colors.accent }]}>
                  {r.name} · {routineMinutes(r)} min
                </Text>
                <Text style={styles.routineDesc}>
                  {r.description} {r.steps.length} ejercicios.
                </Text>
              </Pressable>
            );
          })}
        </View>

        <GuidedRoutine
          key={routine.id}
          routine={routine}
          onDone={song ? () => router.replace(`/cancion/${song.id}`) : undefined}
          doneLabel={song ? `Ir a «${song.title}» →` : undefined}
        />

        {songTechniques.length > 0 && (
          <>
            <SectionTitle hint="Los recursos que más aparecen en la canción">
              Después, prepara «{song!.title}»
            </SectionTitle>
            <View style={styles.prepRow}>
              {songTechniques.map((t) => (
                <Pressable
                  key={t.id}
                  accessibilityRole="link"
                  onPress={() =>
                    router.push({ pathname: '/recurso/[id]', params: { id: t.id, song: song!.id } })
                  }
                  style={[styles.prep, { borderTopColor: t.color }]}
                >
                  <Text style={[styles.prepName, { color: t.color }]}>{t.name}</Text>
                  <Text style={styles.prepText}>{t.exercises[0]?.title}</Text>
                  <Text style={styles.prepLink}>Practicar →</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <SectionTitle hint="Para hacer el calentamiento junto a un profesor">
          Calentamientos en vídeo
        </SectionTitle>
        <View style={styles.videos}>
          {warmupVideos.map((v) => (
            <View key={v.videoId} style={styles.video}>
              <YouTubeEmbed videoId={v.videoId} title={v.title} />
              <Text style={styles.videoTitle}>{v.title}</Text>
            </View>
          ))}
        </View>
      </Page>
    </ScrollView>
  );
}

function GuidedRoutine({
  routine,
  onDone,
  doneLabel,
}: {
  routine: WarmupRoutine;
  onDone?: () => void;
  doneLabel?: string;
}) {
  const steps = routine.steps.map(stepById);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(steps[0].seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const step = steps[index];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left > 0) return;
    if (index < steps.length - 1) {
      setIndex(index + 1);
      setLeft(steps[index + 1].seconds);
    } else {
      setRunning(false);
      setFinished(true);
    }
  }, [left, index, steps]);

  const goTo = (i: number) => {
    setIndex(i);
    setLeft(steps[i].seconds);
    setFinished(false);
  };
  const restart = () => {
    goTo(0);
    setRunning(false);
  };

  if (finished) {
    return (
      <Card style={styles.doneCard}>
        <Text style={styles.doneTitle}>¡Voz lista!</Text>
        <Text style={styles.routineDesc}>
          Has completado la rutina {routine.name.toLowerCase()}. Bebe un poco de agua y a cantar.
        </Text>
        <View style={styles.controls}>
          {onDone && (
            <Pressable onPress={onDone} style={styles.primary}>
              <Text style={styles.primaryText}>{doneLabel}</Text>
            </Pressable>
          )}
          <Pressable onPress={restart} style={styles.secondary}>
            <Text style={styles.secondaryText}>Repetir</Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  const progress = 1 - left / step.seconds;
  return (
    <View>
      <View style={[styles.player, { borderColor: step.color }]}>
        <View style={[styles.playerHead, { backgroundColor: `${step.color}14` }]}>
          <Text style={[styles.stepCount, { color: step.color }]}>
            Paso {index + 1} de {steps.length}
          </Text>
          <Text style={styles.stepName}>{step.name}</Text>
          <Text style={styles.stepGoal}>{step.goal}</Text>
        </View>
        <View style={styles.playerBody}>
          {step.instructions.map((ins, i) => (
            <View key={i} style={styles.ins}>
              <View style={[styles.insNum, { backgroundColor: step.color }]}>
                <Text style={styles.insNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.insText}>{ins}</Text>
            </View>
          ))}

          <Text style={styles.timer}>{formatTime(Math.max(left, 0))}</Text>
          <View style={styles.bar}>
            <View
              style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: step.color }]}
            />
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={() => index > 0 && goTo(index - 1)}
              disabled={index === 0}
              style={[styles.secondary, index === 0 && { opacity: 0.4 }]}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryText}>← Anterior</Text>
            </Pressable>
            <Pressable
              onPress={() => setRunning(!running)}
              style={[styles.primary, { backgroundColor: step.color }]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>
                {running ? 'Pausa' : index === 0 && left === step.seconds ? 'Empezar' : 'Seguir'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => (index < steps.length - 1 ? goTo(index + 1) : setFinished(true))}
              style={styles.secondary}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryText}>Siguiente →</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.stepList}>
        {steps.map((s, i) => (
          <Pressable
            key={s.id}
            onPress={() => goTo(i)}
            style={[styles.stepChip, i === index && { borderColor: s.color }]}
          >
            <View
              style={[styles.stepDot, { backgroundColor: i < index ? s.color : colors.border }]}
            />
            <Text style={[styles.stepChipText, i === index && { color: colors.text }]}>
              {s.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  sub: {
    color: colors.muted,
    fontSize: 17,
    fontFamily: fonts.regular,
    lineHeight: 23,
    marginTop: 8,
    maxWidth: 640,
  },
  routines: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24, marginBottom: 16 },
  routine: {
    flexGrow: 1,
    flexBasis: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
  },
  routineActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  routineName: { color: colors.text, fontSize: 18, fontFamily: fonts.heavy },
  routineDesc: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 20,
    marginTop: 4,
  },
  player: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  playerHead: { padding: 20 },
  stepCount: { fontSize: 14, fontFamily: fonts.heavy, letterSpacing: 0.8 },
  stepName: { color: colors.text, fontSize: 28, fontFamily: fonts.display, marginTop: 4 },
  stepGoal: {
    color: colors.muted,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginTop: 4,
  },
  playerBody: { padding: 20, paddingTop: 12 },
  ins: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  insNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insNumText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.heavy },
  insText: {
    color: colors.muted,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 22,
    flex: 1,
    paddingTop: 1,
  },
  timer: {
    color: colors.text,
    fontSize: 48,
    fontFamily: fonts.display,
    textAlign: 'center',
    marginTop: 12,
    fontVariant: ['tabular-nums'],
  },
  bar: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  barFill: { height: 8, borderRadius: 4 },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 18,
  },
  primary: {
    backgroundColor: colors.accent,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontFamily: fonts.heavy },
  secondary: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryText: { color: colors.text, fontSize: 16, fontFamily: fonts.bold },
  stepList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepChipText: { color: colors.muted, fontSize: 15, fontFamily: fonts.bold },
  doneCard: { alignItems: 'center', gap: 6, paddingVertical: 28 },
  doneTitle: { color: colors.text, fontSize: 30, fontFamily: fonts.display },
  prepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prep: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    padding: 16,
  },
  prepName: { fontSize: 18, fontFamily: fonts.heavy },
  prepText: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular, marginTop: 4 },
  prepLink: { color: colors.text, fontSize: 15, fontFamily: fonts.heavy, marginTop: 10 },
  videos: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  video: { flexGrow: 1, flexBasis: 280, maxWidth: '100%' },
  videoTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.bold, marginTop: 8 },
});
