import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius } from '../theme';

// En iOS y Android el reproductor oficial de YouTube se carga dentro de un WebView.
export function YouTubeEmbed({ videoId }: { videoId: string; title: string }) {
  return (
    <View style={styles.frame}>
      <WebView
        source={{ uri: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1` }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
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
