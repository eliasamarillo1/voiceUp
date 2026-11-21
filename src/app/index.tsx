import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { searchSongs, spotifySearchUrl, youtubeSearchUrl } from '../data/songs';
import { techniqueById, techniques } from '../data/techniques';
import type { Song } from '../data/types';
import { Card, LinkButton, Page, Pill, SectionTitle } from '../components/ui';
import { colors, radius, sectionColors } from '../theme';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | undefined>();
  const results = useMemo(() => searchSongs(query, filter), [query, filter]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 64 }}>
      <Page>
        <View style={styles.header}>
          <Text style={styles.logo}>
            Voice<Text style={{ color: colors.accent }}>Up</Text>
          </Text>
          <Pressable onPress={() => router.push('/recursos')} accessibilityRole="link">
            <Text style={styles.headerLink}>Recursos vocales</Text>
          </Pressable>
        </View>

        <Text style={styles.hero}>¿Qué quieres cantar hoy?</Text>
        <Text style={styles.heroSub}>
          Busca una canción y descubre su estructura, sus tonos y los recursos vocales que usa, con
          ejercicios para practicar cada uno.
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Canción, artista o un trozo de la letra"
            placeholderTextColor={colors.faint}
            style={styles.input}
            autoCorrect={false}
            accessibilityLabel="Buscar canción"
          />
        </View>

        <Text style={styles.filterLabel}>Filtrar por recurso vocal</Text>
        <View style={styles.pills}>
          {techniques.map((t) => (
            <Pill
              key={t.id}
              label={t.name}
              color={t.color}
              dot
              active={filter === t.id}
              onPress={() => setFilter(filter === t.id ? undefined : t.id)}
            />
          ))}
        </View>

        <SectionTitle
          hint={
            query || filter
              ? `${results.length} resultado${results.length === 1 ? '' : 's'}`
              : 'Canciones de ejemplo del prototipo'
          }
        >
          Biblioteca
        </SectionTitle>

        <View style={styles.grid}>
          {results.map((s) => (
            <SongCard key={s.id} song={s} />
          ))}
        </View>

        {results.length === 0 && (
          <Card style={{ gap: 12 }}>
            <Text style={styles.emptyTitle}>Esta canción todavía no está analizada</Text>
            <Text style={styles.emptyText}>
              En la versión final, VoiceUp analizará automáticamente cualquier canción que busques:
              estructura, tonalidad, letra sincronizada y recursos vocales. De momento puedes
              escucharla aquí:
            </Text>
            <View style={styles.row}>
              <LinkButton label="Buscar en Spotify" url={spotifySearchUrl(query)} tone="spotify" />
              <LinkButton label="Buscar en YouTube" url={youtubeSearchUrl(query)} tone="youtube" />
            </View>
          </Card>
        )}
      </Page>
    </ScrollView>
  );
}

function SongCard({ song }: { song: Song }) {
  const used = [...new Set(song.occurrences.map((o) => o.techniqueId))];
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(`/cancion/${song.id}`)}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.card,
        (hovered || pressed) && { borderColor: colors.accent, transform: [{ translateY: -2 }] },
      ]}
    >
      <View style={styles.miniMap}>
        {song.sections.map((s, i) => (
          <View
            key={i}
            style={{ flex: s.end - s.start, backgroundColor: sectionColors[s.type], height: 6 }}
          />
        ))}
      </View>
      <Text style={styles.cardTitle}>{song.title}</Text>
      <Text style={styles.cardArtist}>{song.artist}</Text>
      <Text style={styles.cardMeta}>
        {song.mainKey} · {song.bpm} BPM · {song.difficulty}
      </Text>
      <View style={styles.techRow}>
        {used.map((id) => {
          const t = techniqueById(id)!;
          return (
            <View key={id} style={[styles.techTag, { backgroundColor: `${t.color}26` }]}>
              <View style={[styles.techDot, { backgroundColor: t.color }]} />
              <Text style={[styles.techTagText, { color: t.color }]}>{t.name}</Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  logo: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerLink: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  hero: {
    color: colors.text,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 36,
  },
  heroSub: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: 12, maxWidth: 620 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    marginTop: 28,
  },
  searchIcon: { color: colors.muted, fontSize: 22, marginRight: 10 },
  input: { flex: 1, color: colors.text, fontSize: 17, paddingVertical: 16, outlineStyle: 'none' } as never,
  filterLabel: { color: colors.faint, fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  miniMap: { flexDirection: 'row', gap: 2, borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  cardArtist: { color: colors.muted, fontSize: 14, marginTop: 2 },
  cardMeta: { color: colors.faint, fontSize: 13, marginTop: 10 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  techTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  techDot: { width: 6, height: 6, borderRadius: 3 },
  techTagText: { fontSize: 12, fontWeight: '700' },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
