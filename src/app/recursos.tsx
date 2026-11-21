import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { songs } from '../data/songs';
import { categories, techniques } from '../data/techniques';
import { Page } from '../components/ui';
import { colors, radius } from '../theme';

// Biblioteca de recursos vocales: aprender un recurso y ver en qué canciones aparece.
export default function TechniquesLibrary() {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <Page>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Text style={styles.back}>← Biblioteca</Text>
        </Pressable>
        <Text style={styles.title}>Recursos vocales</Text>
        <Text style={styles.sub}>
          Cada recurso tiene su explicación, ejercicios para practicarlo y vídeos tutoriales.
        </Text>
        {categories.map((cat) => (
          <View key={cat} style={{ marginBottom: 28 }}>
            <Text style={styles.cat}>{cat}</Text>
            <View style={styles.grid}>
              {techniques
                .filter((t) => t.category === cat)
                .map((t) => {
                  const count = songs.filter((s) =>
                    s.occurrences.some((o) => o.techniqueId === t.id),
                  ).length;
                  return (
                    <Pressable
                      key={t.id}
                      accessibilityRole="link"
                      onPress={() =>
                        router.push({ pathname: '/recurso/[id]', params: { id: t.id } })
                      }
                      style={({ pressed }) => [
                        styles.card,
                        { borderTopColor: t.color },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={[styles.name, { color: t.color }]}>{t.name}</Text>
                      <Text style={styles.summary}>{t.summary}</Text>
                      <Text style={styles.meta}>
                        {t.level} · {t.exercises.length} ejercicios · {t.tutorials.length} vídeos ·
                        en {count} canciones
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </View>
        ))}
      </Page>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.muted, fontSize: 15, fontWeight: '600', paddingTop: 24, paddingBottom: 16 },
  title: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  sub: { color: colors.muted, fontSize: 16, marginTop: 8, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 22, fontWeight: '900' },
  cat: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  summary: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  meta: { color: colors.faint, fontSize: 12, marginTop: 12, fontWeight: '600' },
});
