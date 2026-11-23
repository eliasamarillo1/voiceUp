import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

/** En móvil nativo, el SVG de la vidriera se pinta con react-native-svg. */
export function GlassArt({ svg }: { svg: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SvgXml xml={svg} width="100%" height="100%" />
    </View>
  );
}
