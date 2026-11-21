import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { categories, techniques } from '../data/techniques';
import { songs } from '../data/songs';
import type { TechniqueCategory } from '../data/types';
import { Pill } from './ui';
import { fonts, colors, radius } from '../theme';

const songsWith = (id: string) =>
  songs.filter((s) => s.occurrences.some((o) => o.techniqueId === id)).length;

/**
 * Zona interactiva para explorar los recursos vocales: eliges una categoría y un recurso, y ves
 * al momento qué es, un ejercicio rápido y los enlaces a todos sus ejercicios, vídeos y canciones.
 */
export function TechniqueExplorer({ onShowSongs }: { onShowSongs?: (id: string) => void }) {
  const [category, setCategory] = useState<TechniqueCategory | 'todos'>('todos');
  const [selectedId, setSelectedId] = useState('vibrato');
  // En pantallas estrechas el panel va arriba, para que se vea al tocar un recurso.
  const narrow = useWindowDimensions().width < 720;

  const list =
    category === 'todos' ? techniques : techniques.filter((t) => t.category === category);
  const selected = techniques.find((t) => t.id === selectedId) ?? list[0];
  const quick = selected.exercises[0];
  const inSongs = songsWith(selected.id);

  const pickCategory = (c: TechniqueCategory | 'todos') => {
    setCategory(c);
    const first = c === 'todos' ? techniques[0] : techniques.find((t) => t.category === c);
    if (first && !(c === 'todos' || selected.category === c)) setSelectedId(first.id);
  };

  return (
    <View>
      <View style={styles.tabs}>
        <Pill label="Todos" active={category === 'todos'} onPress={() => pickCategory('todos')} />
        {categories.map((c) => (
          <Pill key={c} label={c} active={category === c} onPress={() => pickCategory(c)} />
        ))}
      </View>

      <View style={[styles.body, narrow && styles.bodyNarrow]}>
        <TilesWrap narrow={narrow}>
          {list.map((t) => {
            const active = t.id === selected.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedId(t.id)}
                style={({ pressed }) => [
                  styles.tile,
                  narrow && styles.tileNarrow,
                  active && { borderColor: t.color, backgroundColor: `${t.color}14` },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.tileBar, { backgroundColor: t.color }]} />
                <Text style={[styles.tileName, active && { color: t.color }]} numberOfLines={1}>
                  {t.name}
                </Text>
                <Text style={styles.tileMeta}>{t.level}</Text>
              </Pressable>
            );
          })}
        </TilesWrap>

        <View style={[styles.panel, { borderColor: selected.color }, narrow && styles.narrowChild]}>
          <View style={[styles.panelHead, { backgroundColor: `${selected.color}14` }]}>
            <Text style={[styles.panelKicker, { color: selected.color }]}>
              {selected.category} · {selected.level}
            </Text>
            <Text style={styles.panelName}>{selected.name}</Text>
            <Text style={styles.panelSummary}>{selected.summary}</Text>
          </View>

          <View style={styles.panelBody}>
            <Text style={styles.label}>Qué es</Text>
            <Text style={styles.text}>{selected.whatIs}</Text>

            {quick && (
              <>
                <Text style={styles.label}>Ejercicio rápido: {quick.title}</Text>
                {quick.steps.map((s, i) => (
                  <View key={i} style={styles.step}>
                    <View style={[styles.stepNum, { backgroundColor: selected.color }]}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{s}</Text>
                  </View>
                ))}
              </>
            )}

            <View style={styles.stats}>
              <Text style={styles.stat}>{selected.exercises.length} ejercicios</Text>
              <Text style={styles.stat}>{selected.tutorials.length} vídeos</Text>
              <Text style={styles.stat}>
                {inSongs} canci{inSongs === 1 ? 'ón' : 'ones'}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  router.push({ pathname: '/recurso/[id]', params: { id: selected.id } })
                }
                style={({ pressed }) => [
                  styles.primary,
                  { backgroundColor: selected.color },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.primaryText}>Ejercicios y vídeos →</Text>
              </Pressable>
              {onShowSongs && inSongs > 0 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onShowSongs(selected.id)}
                  style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.secondaryText}>Ver canciones que lo usan</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// En móvil las fichas forman una tira horizontal encima del panel; en pantallas anchas, una cuadrícula.
function TilesWrap({ narrow, children }: { narrow: boolean; children: ReactNode }) {
  if (!narrow) return <View style={styles.tiles}>{children}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
      <View style={styles.strip}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  body: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' },
  bodyNarrow: { flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch' },
  narrowChild: { flexBasis: 'auto', flexGrow: 0 },
  strip: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  tileNarrow: { flexGrow: 0, flexBasis: 'auto', width: 140 },
  tiles: {
    flexGrow: 1,
    flexBasis: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flexGrow: 1,
    flexBasis: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tileBar: { width: 22, height: 4, borderRadius: 2, marginBottom: 10 },
  tileName: { color: colors.text, fontSize: 15, fontFamily: fonts.heavy },
  tileMeta: { color: colors.faint, fontSize: 13, fontFamily: fonts.regular, marginTop: 2 },
  panel: {
    flexGrow: 1.3,
    flexBasis: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  panelHead: { padding: 18 },
  panelKicker: { fontSize: 13, fontFamily: fonts.heavy, letterSpacing: 0.8 },
  panelName: { color: colors.text, fontSize: 28, fontFamily: fonts.display, marginTop: 4 },
  panelSummary: {
    color: colors.muted,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginTop: 4,
  },
  panelBody: { padding: 18, paddingTop: 6 },
  label: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.heavy,
    marginTop: 14,
    marginBottom: 6,
  },
  text: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular, lineHeight: 21 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#FFFFFF', fontSize: 13, fontFamily: fonts.heavy },
  stepText: {
    color: colors.muted,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
    flex: 1,
    paddingTop: 1,
  },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  stat: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.bold,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  primary: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.pill },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.heavy },
  secondary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
});
