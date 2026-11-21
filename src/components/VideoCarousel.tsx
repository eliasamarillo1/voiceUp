import { useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import type { Tutorial } from '../data/types';
import { colors, fonts, radius } from '../theme';
import { SOFT_SHADOW } from './Nouveau';
import { YouTubeEmbed } from './YouTubeEmbed';
import { LinkButton } from './ui';

const GAP = 16;

/**
 * Lista horizontal deslizable de vídeos tutoriales. Cada tarjeta muestra la miniatura y solo
 * carga el reproductor de YouTube al tocarla, para que la página no cargue muchos vídeos a la vez.
 */
export function VideoCarousel({
  videos,
  searchQuery,
  accent,
}: {
  videos: Tutorial[];
  /** Búsqueda para el botón «Ver más en YouTube». */
  searchQuery: string;
  accent: string;
}) {
  const { width } = useWindowDimensions();
  const narrow = width < 720;
  const cardW = narrow ? Math.min(300, width * 0.78) : 300;
  const step = cardW + GAP;

  // Primero los vídeos en español, luego en inglés, manteniendo el orden de cada grupo.
  const sorted = [
    ...videos.filter((v) => v.language === 'es'),
    ...videos.filter((v) => v.language !== 'es'),
  ];

  const scroller = useRef<ScrollViewInstance>(null);
  const [x, setX] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [viewW, setViewW] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);

  const canPrev = x > 4;
  const canNext = x + viewW < contentW - 4;
  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollTo({
      x: Math.max(0, x + dir * step * (narrow ? 1 : 2)),
      animated: true,
    });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setX(e.nativeEvent.contentOffset.x);

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

  return (
    <View>
      <View style={styles.toolbar}>
        <Text style={styles.count}>{sorted.length} vídeos · desliza para ver más</Text>
        <View style={styles.toolbarRight}>
          {!narrow && (
            <>
              <ArrowButton dir={-1} disabled={!canPrev} onPress={() => scrollBy(-1)} />
              <ArrowButton dir={1} disabled={!canNext} onPress={() => scrollBy(1)} />
            </>
          )}
        </View>
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        snapToInterval={step}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={32}
        onLayout={(e) => setViewW(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentW(w)}
        contentContainerStyle={styles.track}
        style={styles.scroller}
      >
        {sorted.map((v) => (
          <View key={v.videoId} style={[styles.card, { width: cardW }]}>
            {playing === v.videoId ? (
              <YouTubeEmbed videoId={v.videoId} title={v.title} autoplay />
            ) : (
              <Pressable
                onPress={() => setPlaying(v.videoId)}
                accessibilityRole="button"
                accessibilityLabel={`Reproducir: ${v.title}`}
                style={({ pressed }) => [styles.thumb, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Image
                  source={{ uri: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View style={[styles.play, { backgroundColor: accent }]}>
                  <View style={styles.playTriangle} />
                </View>
              </Pressable>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>
                {v.title}
              </Text>
              <Text style={styles.meta}>
                {v.language === 'es' ? 'En español' : 'En inglés'}
                {v.channel ? ` · ${v.channel}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.more}>
        <LinkButton label="Ver más en YouTube" url={searchUrl} icon="▶" tone="youtube" />
      </View>
    </View>
  );
}

function ArrowButton({
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
      accessibilityLabel={dir < 0 ? 'Vídeos anteriores' : 'Vídeos siguientes'}
      style={({ pressed }) => [
        styles.arrow,
        disabled && { opacity: 0.35 },
        pressed && { transform: [{ scale: 0.94 }] },
      ]}
    >
      <Text style={styles.arrowText}>{dir < 0 ? '‹' : '›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  toolbarRight: { flexDirection: 'row', gap: 8 },
  count: { color: colors.faint, fontSize: 13, fontFamily: fonts.medium },
  scroller: { marginHorizontal: -4 },
  track: { gap: GAP, paddingHorizontal: 4, paddingBottom: 14, paddingTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 4,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    padding: 6,
    boxShadow: SOFT_SHADOW,
  },
  thumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
  },
  playTriangle: {
    marginLeft: 4,
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  cardBody: { paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 },
  title: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
    lineHeight: 20,
    minHeight: 40,
  },
  meta: { color: colors.faint, fontSize: 13, fontFamily: fonts.regular, marginTop: 4 },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
  },
  arrowText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 26,
    fontFamily: fonts.bold,
    marginTop: -2,
  },
  more: { flexDirection: 'row', marginTop: 4 },
});
