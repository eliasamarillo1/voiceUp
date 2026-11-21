import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// En la web usamos el reproductor oficial de YouTube en un iframe: el vídeo se ve dentro de la app.
export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <View style={styles.frame}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        style={{ border: 0, width: '100%', height: '100%' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
});
