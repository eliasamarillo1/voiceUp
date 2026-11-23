import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { router } from 'expo-router';
import { searchSongs } from '../data/songs';
import { techniqueById } from '../data/techniques';
import { TechniqueExplorer } from '../components/TechniqueExplorer';
import { CatalogResults } from '../components/CatalogResults';
import { PopularNow, RecentlyAnalyzed } from '../components/LibrarySections';
import { Fleuron, SOFT_SHADOW } from '../components/Nouveau';
import { StainedGlassHero } from '../components/StainedGlassHero';
import { PixelTitle } from '../components/PixelTitle';

import type { Song } from '../data/types';
import { Card, Page, Pill, SectionTitle } from '../components/ui';
import { fonts, colors, radius, sectionColors } from '../theme';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string | undefined>();
  const results = useMemo(() => searchSongs(query, filter), [query, filter]);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [libraryY, setLibraryY] = useState(0);
  const goToResults = () => scrollRef.current?.scrollTo({ y: libraryY, animated: true });
  const showSongsWith = (id: string) => {
    setFilter(id);
    scrollRef.current?.scrollTo({ y: libraryY, animated: true });
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 96 }}>
      <Page>
        <View style={styles.header}>
          <Text style={styles.logo}>VoiceUp</Text>
          <View style={styles.nav}>
            <Pressable onPress={() => router.push('/calentamiento')} accessibilityRole="link">
              <Text style={styles.headerLink}>Calentar</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/recursos')} accessibilityRole="link">
              <Text style={styles.headerLink}>Recursos</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/piano')} accessibilityRole="link">
              <Text style={styles.headerLink}>Piano</Text>
            </Pressable>
          </View>
        </View>

        <StainedGlassHero>
          {(wide, pane) => (
            <>
              <PixelTitle
                text="¿Qué quieres cantar hoy?"
                maxSize={pane >= 500 ? 64 : pane >= 320 ? 40 : 32}
              />
              <Text style={[styles.heroSub, pane < 320 && { fontSize: 15, lineHeight: 21 }]}>
                Busca una canción para ver cómo está hecha, o aprende a entrenar cada recurso vocal.
              </Text>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={goToResults}
                  placeholder={pane >= 290 ? 'Canción o artista' : 'Canción'}
                  placeholderTextColor={colors.faint}
                  style={[styles.input, !wide && { fontSize: 15 }]}
                  autoCorrect={false}
                  accessibilityLabel="Buscar canción"
                />
                <Pressable
                  onPress={goToResults}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.searchButton, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.searchButtonText}>Buscar</Text>
                </Pressable>
              </View>
            </>
          )}
        </StainedGlassHero>

        <View style={styles.doors}>
          <Door
            title="Canciones"
            text="Su estructura, sus tonos y los recursos que usa."
            onPress={() => scrollRef.current?.scrollTo({ y: libraryY, animated: true })}
          />
          <Door
            title="Recursos vocales"
            text="Qué es cada uno, ejercicios y vídeos."
            onPress={() => router.push('/recursos')}
          />
          <Door
            title="Calentar la voz"
            text="Rutina guiada de 6 o 10 minutos."
            onPress={() => router.push('/calentamiento')}
          />
        </View>

        <View onLayout={(e) => setLibraryY(e.nativeEvent.layout.y)} />
        {query ? (
          <>
            <SectionTitle hint="Toca una canción para abrir su análisis">Resultados</SectionTitle>
            <CatalogResults query={query} />
            {results.length > 0 && (
              <>
                <Text style={styles.subhead}>También entre los ejemplos</Text>
                <View style={styles.examples}>
                  {results.map((s) => (
                    <ExampleCard key={s.id} song={s} />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <RecentlyAnalyzed />
            <PopularNow />
          </>
        )}

        {!query && (
          <>
            <SectionTitle hint="Tres canciones de dominio público analizadas a mano, para ver cómo es un análisis completo">
              Prueba un ejemplo
            </SectionTitle>
            {filter && (
              <View style={styles.activeFilter}>
                <View style={[styles.techDot, { backgroundColor: techniqueById(filter)?.color }]} />
                <Text style={styles.activeFilterText}>
                  Canciones con {techniqueById(filter)?.name.toLowerCase()}
                </Text>
                <Pressable onPress={() => setFilter(undefined)} accessibilityRole="button">
                  <Text style={styles.toggle}>✕ Quitar</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.examples}>
              {results.map((s) => (
                <ExampleCard key={s.id} song={s} />
              ))}
            </View>
            {results.length === 0 && filter && !query && (
              <Card style={{ gap: 12 }}>
                <Text style={styles.emptyTitle}>
                  Aún no hay canciones de ejemplo con {techniqueById(filter)?.name.toLowerCase()}
                </Text>
                <Text style={styles.emptyText}>
                  Cuando el análisis automático esté listo, aquí aparecerán todas las canciones que
                  lo usan. Mientras tanto, puedes aprender qué es y cómo practicarlo.
                </Text>
                <View style={styles.row}>
                  <Pill
                    label={`Ver ${techniqueById(filter)?.name} →`}
                    active
                    color={techniqueById(filter)?.color}
                    onPress={() =>
                      router.push({ pathname: '/recurso/[id]', params: { id: filter } })
                    }
                  />
                </View>
              </Card>
            )}
          </>
        )}

        <SectionTitle hint="Elige un recurso para saber qué es, probar un ejercicio y entrenarlo con vídeos">
          Explora los recursos vocales
        </SectionTitle>
        <TechniqueExplorer onShowSongs={showSongsWith} />
      </Page>
    </ScrollView>
  );
}

function Door({ title, text, onPress }: { title: string; text: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.door,
        hovered && { backgroundColor: colors.surfaceAlt },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <Fleuron size={22} color={colors.frame} />
      <Text style={styles.doorTitle}>{title}</Text>
      <Text style={styles.doorText}>{text}</Text>
    </Pressable>
  );
}

function ExampleCard({ song }: { song: Song }) {
  const used = [...new Set(song.occurrences.map((o) => o.techniqueId))];
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(`/cancion/${song.id}`)}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.example,
        hovered && { backgroundColor: colors.surfaceAlt },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.demoRow}>
        <Text style={styles.demo}>EJEMPLO</Text>
        <Text style={styles.exampleMeta}>
          {song.mainKey} · {song.bpm} BPM
        </Text>
      </View>
      <Text style={styles.exampleTitle}>{song.title}</Text>
      <Text style={styles.exampleArtist}>{song.artist}</Text>
      <View style={styles.miniMap}>
        {song.sections.map((s, i) => (
          <View
            key={i}
            style={{ flex: s.end - s.start, backgroundColor: sectionColors[s.type], height: 10 }}
          />
        ))}
      </View>
      <View style={[styles.techRow, { justifyContent: 'flex-start', alignItems: 'center' }]}>
        {used.slice(0, 3).map((id) => {
          const t = techniqueById(id);
          if (!t) return null;
          return <View key={id} style={[styles.techDot, { backgroundColor: t.color }]} />;
        })}
        <Text style={styles.more}>{used.length} recursos vocales</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subhead: {
    color: colors.frameDark,
    fontSize: 18,
    fontFamily: fonts.heavy,
    marginTop: 24,
    marginBottom: 10,
  },
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  example: {
    flexGrow: 1,
    flexBasis: 240,
    gap: 4,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    backgroundColor: colors.surface,
  },
  demoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  demo: {
    color: colors.gold,
    fontSize: 12,
    fontFamily: fonts.heavy,
    letterSpacing: 1,
  },
  exampleMeta: { color: colors.faint, fontSize: 13, fontFamily: fonts.medium },
  exampleTitle: { color: colors.text, fontSize: 17, fontFamily: fonts.heavy },
  exampleArtist: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular },
  cornerL: { position: 'absolute', top: 0, left: 0 },
  cornerR: { position: 'absolute', top: 0, right: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  logo: { color: colors.frameDark, fontSize: 30, fontFamily: fonts.display, letterSpacing: 0.5 },
  headerLink: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  nav: { flexDirection: 'row', gap: 14 },
  panel: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 22,
    padding: 3,
    boxShadow: SOFT_SHADOW,
  },
  panelInner: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 10,
    borderColor: colors.frame,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  panelCornerL: { position: 'absolute', top: 6, left: 6 },
  panelCornerR: { position: 'absolute', top: 6, right: 6 },
  panelKnot: { position: 'absolute', top: 18 },
  clump: { position: 'absolute', bottom: 0 },
  heroWide: { flexDirection: 'row', gap: 40, justifyContent: 'center', marginTop: 24 },
  heroText: { alignItems: 'center', flexShrink: 1, maxWidth: 520, width: '100%' },
  hero: {
    color: colors.text,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: fonts.display,
    textAlign: 'center',
    marginTop: 8,
  },
  heroSub: {
    color: colors.muted,
    fontSize: 18,
    fontFamily: fonts.regular,
    lineHeight: 26,
    marginTop: 10,
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.gold,
    paddingLeft: 16,
    paddingRight: 5,
    marginTop: 20,
    maxWidth: 400,
    boxShadow: '0 4px 14px rgba(35,33,58,.08)',
  },
  searchIcon: { color: colors.frameDark, fontSize: 22, fontFamily: fonts.regular, marginRight: 10 },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.medium,
    paddingVertical: 13,
    minWidth: 0,
    outlineStyle: 'none',
  } as never,
  searchButton: {
    backgroundColor: colors.frame,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginLeft: 6,
  },
  searchButtonText: { color: '#fff', fontSize: 14, fontFamily: fonts.bold },
  doors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 32 },
  door: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    borderTopWidth: 4,
    borderTopColor: colors.frame,
    padding: 16,
    boxShadow: SOFT_SHADOW,
    gap: 4,
  },
  doorTitle: { color: colors.text, fontSize: 21, fontFamily: fonts.display, marginTop: 6 },
  doorText: { color: colors.muted, fontSize: 16, fontFamily: fonts.regular, lineHeight: 21 },
  toggle: { color: colors.frameDark, fontSize: 15, fontFamily: fonts.bold },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
  },
  activeFilterText: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  card: { flexGrow: 1, flexBasis: 270, maxWidth: 420 },
  miniMap: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 2,
    padding: 2,
    backgroundColor: colors.gold,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 14,
  },
  cardTitle: { color: colors.text, fontSize: 25, fontFamily: fonts.display, textAlign: 'center' },
  cardArtist: { color: colors.muted, fontSize: 16, fontFamily: fonts.medium, marginTop: 2 },
  cardMeta: { color: colors.faint, fontSize: 14, fontFamily: fonts.regular, marginTop: 4 },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  techTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    backgroundColor: '#FFFFFF',
  },
  techDot: { width: 8, height: 8, borderRadius: 4 },
  techTagText: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
  more: { color: colors.faint, fontSize: 14, fontFamily: fonts.bold, alignSelf: 'center' },
  beeNote: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyTitle: { color: colors.text, fontSize: 22, fontFamily: fonts.display, flexShrink: 1 },
  emptyText: { color: colors.muted, fontSize: 17, fontFamily: fonts.regular, lineHeight: 24 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
