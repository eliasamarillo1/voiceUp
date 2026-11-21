import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { searchSongs, songs, spotifySearchUrl, youtubeSearchUrl } from '../data/songs';
import { categories, techniqueById, techniques } from '../data/techniques';

// Recursos que se muestran sin desplegar la lista completa.
const FEATURED = [
  'vibrato',
  'falsete',
  'belting',
  'melisma',
  'voz-mixta',
  'portamento',
  'sollozo',
  'twang',
];
import type { Song } from '../data/types';
import { Card, LinkButton, Page, Pill, SectionTitle } from '../components/ui';
import { colors, radius, sectionColors } from '../theme';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | undefined>();
  const [showAll, setShowAll] = useState(false);
  const results = useMemo(() => searchSongs(query, filter), [query, filter]);
  const countFor = (id: string) =>
    songs.filter((s) => s.occurrences.some((o) => o.techniqueId === id)).length;

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

        <View style={styles.filterHead}>
          <Text style={styles.filterLabel}>
            {filter
              ? `Canciones con ${techniqueById(filter)?.name.toLowerCase()}`
              : `Filtra por recurso vocal (${techniques.length})`}
          </Text>
          <Pressable onPress={() => setShowAll(!showAll)} accessibilityRole="button">
            <Text style={styles.toggle}>{showAll ? 'Ver menos' : 'Ver todos'}</Text>
          </Pressable>
        </View>
        {(showAll ? categories : [undefined]).map((cat) => {
          const list = cat
            ? techniques.filter((t) => t.category === cat)
            : techniques.filter((t) => FEATURED.includes(t.id) || t.id === filter);
          return (
            <View key={cat ?? 'featured'} style={{ marginBottom: 10 }}>
              {cat && <Text style={styles.catLabel}>{cat}</Text>}
              <View style={styles.pills}>
                {list.map((t) => (
                  <Pill
                    key={t.id}
                    label={`${t.name} · ${countFor(t.id)}`}
                    color={t.color}
                    dot
                    active={filter === t.id}
                    onPress={() => setFilter(filter === t.id ? undefined : t.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}
        {filter && (
          <Pressable onPress={() => setFilter(undefined)} accessibilityRole="button">
            <Text style={styles.toggle}>✕ Quitar filtro</Text>
          </Pressable>
        )}

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

        {results.length === 0 && filter && !query && (
          <Card style={{ gap: 12 }}>
            <Text style={styles.emptyTitle}>
              Aún no hay canciones de ejemplo con {techniqueById(filter)?.name.toLowerCase()}
            </Text>
            <Text style={styles.emptyText}>
              Cuando el análisis automático esté listo, aquí aparecerán todas las canciones que lo
              usan. Mientras tanto, puedes aprender qué es y cómo practicarlo.
            </Text>
            <View style={styles.row}>
              <Pill
                label={`Ver ${techniqueById(filter)?.name} →`}
                active
                color={techniqueById(filter)?.color}
                onPress={() => router.push({ pathname: '/recurso/[id]', params: { id: filter } })}
              />
            </View>
          </Card>
        )}

        {results.length === 0 && !!query && (
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
        {used.slice(0, 5).map((id) => {
          const t = techniqueById(id)!;
          return (
            <View key={id} style={[styles.techTag, { backgroundColor: `${t.color}1A` }]}>
              <View style={[styles.techDot, { backgroundColor: t.color }]} />
              <Text style={[styles.techTagText, { color: t.color }]}>{t.name}</Text>
            </View>
          );
        })}
        {used.length > 5 && <Text style={styles.more}>+{used.length - 5} más</Text>}
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
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    paddingVertical: 16,
    outlineStyle: 'none',
  } as never,
  filterHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  filterLabel: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  toggle: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  catLabel: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
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
  more: { color: colors.faint, fontSize: 12, fontWeight: '700', alignSelf: 'center' },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
