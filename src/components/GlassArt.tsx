import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

/** En móvil nativo, el SVG de la vidriera se pinta con react-native-svg. */
export function GlassArt({ svg }: { svg: string }) {
  // los filtros de textura (vetas del cristal) solo se ven en la web
  const xml = svg.replace(/ filter="url\(#[^)]*\)"/g, '');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <SvgXml xml={xml} width="100%" height="100%" />
    </View>
  );
}
