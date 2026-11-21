import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Piano, type PianoHandle } from '../components/Piano';
import { Page, Pill } from '../components/ui';
import {
  keyLabel,
  mainChords,
  midiFreq,
  midiLetter,
  midiName,
  type Mode,
  type MusicKey,
  NOTE_NAMES,
  parseKey,
  prefersFlats,
  scaleNames,
  scaleOf,
} from '../lib/notes';
import { colors, fonts, radius } from '../theme';

// Piano virtual para buscar notas: toca una tecla y te dice qué nota es. Si eliges una tonalidad
// (o llegas desde una canción), marca las notas de su escala y puede tocarla para cantar encima.

export default function PianoScreen() {
  const { tono } = useLocalSearchParams<{ tono?: string }>();
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const octaves = wide ? 2 : 1;

  const [musicKey, setMusicKey] = useState<MusicKey | null>(() => parseKey(tono));
  useEffect(() => {
    const k = parseKey(tono);
    if (k) setMusicKey(k);
  }, [tono]);

  // Primer Do visible: Do3 en pantallas anchas, Do4 (el central) en móvil.
  const [start, setStart] = useState(wide ? 48 : 60);
  useEffect(() => setStart(wide ? 48 : 60), [wide]);
  const shift = useCallback(
    (dir: 1 | -1) => setStart((s) => Math.max(24, Math.min(84 - octaves * 12, s + dir * 12))),
    [octaves],
  );

  const [last, setLast] = useState<number | null>(null);
  const piano = useRef<PianoHandle>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const flats = musicKey ? prefersFlats(musicKey) : false;

  const playScale = () => {
    if (!musicKey) return;
    timers.current.forEach(clearTimeout);
    // Escala desde la tónica dentro del teclado visible, subiendo una octava completa.
    const base = start + musicKey.tonic;
    const steps = [
      ...scaleOf(musicKey).map((pc) => base + ((pc - musicKey.tonic + 12) % 12)),
      base + 12,
    ];
    const seq = [...steps, ...steps.slice(0, -1).reverse()];
    timers.current = seq.map((m, i) => setTimeout(() => piano.current?.strike(m, 300), i * 380));
  };

  const setTonic = (tonic: number) => setMusicKey((k) => ({ tonic, mode: k?.mode ?? 'mayor' }));
  const setMode = (mode: Mode) => setMusicKey((k) => ({ tonic: k?.tonic ?? 0, mode }));

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <Page>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Text style={styles.back}>← Volver</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">
          Piano
        </Text>
        <Text style={styles.sub}>
          Toca una tecla para oír la nota y ver cómo se llama. Elige una tonalidad para ver qué
          notas tiene su escala.
        </Text>

        <View style={styles.readout} accessibilityLiveRegion="polite">
          {last === null ? (
            <Text style={styles.readoutHint}>
              {wide && Platform.OS === 'web'
                ? 'Toca una tecla o usa el teclado del ordenador (A, W, S, E, D…)'
                : 'Toca una tecla'}
            </Text>
          ) : (
            <>
              <Text style={styles.readoutNote}>{midiName(last, flats)}</Text>
              <Text style={styles.readoutMeta}>
                {midiLetter(last)} · {midiFreq(last).toFixed(1).replace('.', ',')} Hz
                {last === 60 ? ' · Do central' : ''}
              </Text>
            </>
          )}
        </View>

        <View style={styles.octaveRow}>
          <OctaveButton dir={-1} disabled={start <= 24} onPress={() => shift(-1)} />
          <Text style={styles.octaveText}>
            {midiName(start)} – {midiName(start + octaves * 12)}
          </Text>
          <OctaveButton dir={1} disabled={start + octaves * 12 >= 84} onPress={() => shift(1)} />
        </View>

        <Piano
          ref={piano}
          start={start}
          octaves={octaves}
          musicKey={musicKey}
          showComputerKeys={wide && Platform.OS === 'web'}
          onNote={setLast}
          onShiftOctave={shift}
        />
        {wide && Platform.OS === 'web' ? (
          <Text style={styles.kbdHint}>Teclas Z y X: bajar o subir una octava.</Text>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Tonalidad</Text>
          <View style={styles.row}>
            <Pill
              label="Mayor"
              active={musicKey?.mode === 'mayor'}
              onPress={() => setMode('mayor')}
            />
            <Pill
              label="Menor"
              active={musicKey?.mode === 'menor'}
              onPress={() => setMode('menor')}
            />
            <Pill label="Ninguna" active={!musicKey} onPress={() => setMusicKey(null)} />
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            {NOTE_NAMES.map((n, i) => {
              const k: MusicKey = { tonic: i, mode: musicKey?.mode ?? 'mayor' };
              return (
                <Pill
                  key={n}
                  label={keyLabel(k).split(' ')[0]}
                  active={musicKey?.tonic === i}
                  onPress={() => setTonic(i)}
                />
              );
            })}
          </View>

          {musicKey ? (
            <View style={styles.keyInfo}>
              <Text style={styles.keyName}>{keyLabel(musicKey)}</Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Escala: </Text>
                {scaleNames(musicKey).join(' · ')}
              </Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Acordes principales: </Text>
                {mainChords(musicKey).join(' · ')}
              </Text>
              <Text style={styles.legend}>
                El círculo grande marca la tónica y los pequeños, el resto de notas de la escala.
              </Text>
              <View style={[styles.row, { marginTop: 12 }]}>
                <Pressable
                  onPress={playScale}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.action,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <Text style={styles.actionText}>▶ Tocar la escala</Text>
                </Pressable>
                <Pressable
                  onPress={() => piano.current?.strike(start + musicKey.tonic, 900)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.action,
                    styles.actionGhost,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <Text style={[styles.actionText, { color: colors.frameDark }]}>
                    Dame la tónica
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Page>
    </ScrollView>
  );
}

function OctaveButton({
  dir,
  disabled,
  onPress,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={dir < 0 ? 'Bajar una octava' : 'Subir una octava'}
      style={({ pressed }) => [
        styles.octBtn,
        disabled && { opacity: 0.35 },
        pressed && { transform: [{ scale: 0.94 }] },
      ]}
    >
      <Text style={styles.octBtnText}>{dir < 0 ? '‹' : '›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.bold,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: { color: colors.text, fontSize: 38, fontFamily: fonts.display },
  sub: {
    color: colors.muted,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 23,
    marginTop: 6,
    maxWidth: 620,
  },
  readout: {
    marginTop: 22,
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    paddingVertical: 12,
  },
  readoutHint: { color: colors.faint, fontSize: 15, fontFamily: fonts.medium, textAlign: 'center' },
  readoutNote: {
    color: colors.frameDark,
    fontSize: 36,
    fontFamily: fonts.display,
    fontVariant: ['tabular-nums'],
  },
  readoutMeta: {
    color: colors.muted,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  octaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 16,
    marginBottom: 10,
  },
  octaveText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
    minWidth: 90,
    textAlign: 'center',
  },
  octBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
  },
  octBtnText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 26,
    fontFamily: fonts.bold,
    marginTop: -2,
  },
  kbdHint: {
    color: colors.faint,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 8,
    textAlign: 'center',
  },
  panel: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    padding: 18,
  },
  panelTitle: { color: colors.text, fontSize: 18, fontFamily: fonts.heavy, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyInfo: { marginTop: 18, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  keyName: { color: colors.frameDark, fontSize: 22, fontFamily: fonts.display },
  infoLine: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.regular,
    marginTop: 6,
    lineHeight: 22,
  },
  infoLabel: { fontFamily: fonts.bold },
  legend: { color: colors.faint, fontSize: 13, fontFamily: fonts.regular, marginTop: 8 },
  action: {
    backgroundColor: colors.frame,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionGhost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.frame },
  actionText: { color: '#FFFFFF', fontSize: 15, fontFamily: fonts.bold },
});
