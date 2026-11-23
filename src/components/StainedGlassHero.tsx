import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassArt } from './GlassArt';
import { GLASS_NARROW, GLASS_WIDE } from './stainedGlassArt';

/** Ancho mínimo del contenedor para usar la vidriera apaisada. */
const WIDE_FROM = 760;
/** La versión vertical no crece más de esto, para que no se haga enorme. */
const NARROW_MAX = 440;

/**
 * Portada en forma de vidriera de lirios. Los hijos (título, texto y buscador)
 * se colocan sobre el cristal crema del centro.
 */
export function StainedGlassHero({
  children,
}: {
  children: (wide: boolean, paneWidth: number) => ReactNode;
}) {
  const [w, setW] = useState(0);
  const wide = w >= WIDE_FROM;
  const art = wide ? GLASS_WIDE : GLASS_NARROW;
  const width = wide ? w : Math.min(w, NARROW_MAX);
  const scale = width / art.width;
  const { x0, y0, x1, y1 } = art.window;
  // el cristal del texto tiene un marco dorado de 12 px (9 en móvil) que hay que respetar
  const inset = (wide ? 12 : 9) * scale + 4;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.outer}>
      {w > 0 && (
        <View style={[styles.glass, { width, height: art.height * scale }]}>
          <GlassArt svg={art.svg} />
          <View
            style={[
              styles.pane,
              {
                left: x0 * scale + inset,
                top: y0 * scale + inset,
                width: (x1 - x0) * scale - inset * 2,
                height: (y1 - y0) * scale - inset * 2,
                paddingHorizontal: wide && (x1 - x0) * scale > 320 ? 24 : 12,
              },
            ]}
          >
            {children(wide, (x1 - x0) * scale - inset * 2)}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center', marginTop: 12 },
  glass: {
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(35,33,58,.08), 0 14px 34px rgba(35,33,58,.12)',
  },
  pane: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
