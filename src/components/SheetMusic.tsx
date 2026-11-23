import { Text, View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// En móvil la partitura se mostrará con un WebView en la siguiente fase; de momento solo en web.
export function SheetMusic(_: { musicXml: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>La partitura se puede ver en la versión web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 16 },
  text: { color: colors.muted },
});
