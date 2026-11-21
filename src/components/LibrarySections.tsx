// Secciones de la biblioteca en la portada: populares ahora y analizadas recientemente.
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { popularTracks, recentAnalyses, type CatalogTrack } from '../lib/songCatalog';
import { SectionTitle } from './ui';
import { colors, fonts, radius } from '../theme';

function useTracks(load: () => Promise<CatalogTrack[]>) {
  const [state, setState] = useState<{ loading: boolean; error?: boolean; items: CatalogTrack[] }>({
    loading: true,
    items: [],
  });
  useEffect(() => {
    let alive = true;
    load()
      .then((items) => alive && setState({ loading: false, items }))
      .catch(() => alive && setState({ loading: false, error: true, items: [] }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

export function PopularNow() {
  const s = useTracks(() => popularTracks(12));
  if (s.error) return null;
  return (
    <>
      <SectionTitle hint="Lo más escuchado hoy en Deezer. Toca una para ver su análisis">
        Populares ahora
      </SectionTitle>
      {s.loading ? <ActivityIndicator color={colors.frame} /> : <TrackGrid items={s.items} />}
    </>
  );
}

/** Solo aparece cuando hay fichas guardadas en el servidor de análisis. */
export function RecentlyAnalyzed() {
  const s = useTracks(recentAnalyses);
  if (s.loading || s.error || s.items.length === 0) return null;
  return (
    <>
      <SectionTitle hint="Las últimas canciones que alguien ha analizado en VoiceUp">
        Analizadas recientemente
      </SectionTitle>
      <TrackGrid items={s.items} />
    </>
  );
}

export function TrackGrid({ items }: { items: CatalogTrack[] }) {
  const width = useWindowDimensions().width;
  const cols = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  return (
    <View style={styles.grid}>
      {items.map((t) => (
        <Pressable
          key={t.id}
          accessibilityRole="link"
          accessibilityLabel={`${t.title}, de ${t.artist}. Ver análisis`}
          onPress={() => router.push({ pathname: '/ficha/[id]', params: { id: t.id } })}
          style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
            styles.card,
            { width: `${100 / cols}%` },
            hovered && { transform: [{ translateY: -3 }] },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View style={styles.frame}>
            {t.cover ? (
              <Image source={{ uri: t.cover }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, { backgroundColor: colors.surfaceAlt }]} />
            )}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {t.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {t.artist}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -7 },
  card: { padding: 7, gap: 4 },
  frame: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 3,
    backgroundColor: colors.surface,
  },
  cover: { width: '100%', aspectRatio: 1, borderRadius: radius.sm },
  title: { color: colors.text, fontSize: 15, fontFamily: fonts.heavy, marginTop: 6 },
  artist: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular },
});
