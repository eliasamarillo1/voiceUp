// Resultados de búsqueda en todo el catálogo musical (cualquier canción).
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { searchCatalog, type CatalogTrack } from '../lib/songCatalog';
import { spotifySearchUrl, youtubeSearchUrl } from '../data/songs';
import { Card, LinkButton } from './ui';
import { colors, fonts, radius } from '../theme';

export function CatalogResults({ query }: { query: string }) {
  const [state, setState] = useState<{ q: string; loading: boolean; error?: boolean; items: CatalogTrack[] }>({
    q: '',
    loading: false,
    items: [],
  });
  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) {
      setState({ q, loading: false, items: [] });
      return;
    }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: false }));
    // Esperamos a que la persona deje de escribir para no buscar en cada letra.
    const timer = setTimeout(() => {
      searchCatalog(q)
        .then((items) => alive && setState({ q, loading: false, items }))
        .catch(() => alive && setState({ q, loading: false, error: true, items: [] }));
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [q]);

  if (q.length < 2) return null;

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.headRow}>
        <Text style={styles.head}>En todo el catálogo</Text>
        {state.loading && <ActivityIndicator color={colors.frame} size="small" />}
      </View>

      {state.items.map((t) => (
        <Pressable
          key={t.id}
          accessibilityRole="link"
          onPress={() => router.push({ pathname: '/ficha/[id]', params: { id: t.id } })}
          style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
            styles.item,
            hovered && { backgroundColor: colors.surfaceAlt },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          {t.cover ? (
            <Image source={{ uri: t.cover }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, { backgroundColor: colors.surfaceAlt }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {t.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {t.artist}
              {t.album ? ` · ${t.album}` : ''}
            </Text>
          </View>
          <Text style={styles.go}>Ver análisis →</Text>
        </Pressable>
      ))}

      {!state.loading && state.q === q && state.items.length === 0 && (
        <Card style={{ gap: 12 }}>
          <Text style={styles.title}>
            {state.error ? 'No pudimos buscar en el catálogo ahora mismo' : 'No encontramos esa canción'}
          </Text>
          <Text style={styles.artist}>
            {state.error
              ? 'Puede ser un problema de conexión. Mientras tanto, puedes buscarla aquí:'
              : 'Prueba con otro nombre o con el artista. También puedes buscarla aquí:'}
          </Text>
          <View style={styles.row}>
            <LinkButton label="Buscar en Spotify" url={spotifySearchUrl(q)} tone="spotify" />
            <LinkButton label="Buscar en YouTube" url={youtubeSearchUrl(q)} tone="youtube" />
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  head: { color: colors.frameDark, fontSize: 20, fontFamily: fonts.heavy },
  hint: { color: colors.muted, fontSize: 15, fontFamily: fonts.regular },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    padding: 10,
  },
  cover: { width: 52, height: 52, borderRadius: radius.sm },
  title: { color: colors.text, fontSize: 16, fontFamily: fonts.heavy },
  artist: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular, marginTop: 2 },
  go: { color: colors.accent, fontSize: 14, fontFamily: fonts.heavy },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
