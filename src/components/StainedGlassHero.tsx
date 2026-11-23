import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassArt } from './GlassArt';
import { GLASS_NARROW, GLASS_NARROW_SHORT, GLASS_WIDE } from './stainedGlassArt';
import { currentHour, lightDefs } from './glassLight';

/** Ancho mínimo del contenedor para usar la vidriera apaisada. */
const WIDE_FROM = 760;
/** La versión vertical no crece más de esto, para que no se haga enorme. */
const NARROW_MAX = 440;

/**
 * Dónde va el título con el buscador:
 * - 'debajo': la vidriera entera y el título justo debajo, fuera del cristal.
 * - 'integrado': una cartela pequeña de cristal esmerilado con marco dorado, encima de la vidriera.
 * Se puede previsualizar con ?cartel=debajo o ?cartel=integrado.
 */
export type HeroLayout = 'debajo' | 'integrado';

function layoutFromUrl(fallback: HeroLayout): HeroLayout {
  if (typeof window !== 'undefined' && window.location?.search) {
    const c = new URLSearchParams(window.location.search).get('cartel');
    if (c === 'debajo' || c === 'integrado') return c;
  }
  return fallback;
}

/**
 * Portada en forma de vidriera de lirios, con la luz de la hora local.
 * Los hijos (título, texto y buscador) van debajo o en la cartela, según el diseño.
 */
export function StainedGlassHero({
  layout = 'integrado',
  children,
}: {
  layout?: HeroLayout;
  children: (wide: boolean, paneWidth: number) => ReactNode;
}) {
  const [w, setW] = useState(0);
  const [mode] = useState(() => layoutFromUrl(layout));
  // la luz sigue la hora local, como una cristalera de verdad; se actualiza cada minuto
  const [hour, setHour] = useState(currentHour);
  useEffect(() => {
    const id = setInterval(() => setHour(currentHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  const wide = w >= WIDE_FROM;
  const art = wide ? GLASS_WIDE : mode === 'debajo' ? GLASS_NARROW_SHORT : GLASS_NARROW;
  const width = wide ? w : Math.min(w, NARROW_MAX);
  const lit = useMemo(
    () => art.svg.replace('%%LIGHT%%', lightDefs(art.uid, art.height, hour)),
    [art, hour],
  );
  const scale = width / art.width;
  const glassH = art.height * scale;

  // cartela: centrada sobre el cielo, entre los lirios
  const plaqueW = wide ? Math.min(400, width * 0.42) : width - 56;
  const plaqueTop = wide ? 64 * scale : 214 * scale;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={styles.outer}>
      {w > 0 && (
        <>
          <View style={[styles.glass, { width, height: glassH }]}>
            <GlassArt svg={lit} />
            {mode === 'integrado' && (
              <View style={[styles.plaque, { width: plaqueW, top: plaqueTop }]}>
                <View pointerEvents="none" style={styles.plaqueInner} />
                {[styles.cTL, styles.cTR, styles.cBL, styles.cBR].map((c, i) => (
                  <View key={i} pointerEvents="none" style={[styles.corner, c]} />
                ))}
                <View style={[styles.plaqueBody, !wide && { paddingHorizontal: 14 }]}>
                  {children(wide, plaqueW - (wide ? 56 : 28))}
                </View>
              </View>
            )}
          </View>
          {mode === 'debajo' && (
            <View style={[styles.below, { maxWidth: wide ? 620 : width }]}>
              {children(wide, Math.min(wide ? 620 : width, 620))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const GOLD = '#B39257';
const GOLD_LIGHT = '#D9C79C';

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center', marginTop: 12 },
  glass: {
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(35,33,58,.08), 0 14px 34px rgba(35,33,58,.12)',
  },
  plaque: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(252,248,238,0.84)',
    backdropFilter: 'blur(4px)',
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 3,
    boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 10px 28px rgba(20,18,40,.22)',
  } as never,
  plaqueInner: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: 1,
    borderColor: GOLD_LIGHT,
    borderRadius: 2,
  },
  corner: {
    position: 'absolute',
    width: 9,
    height: 9,
    backgroundColor: '#E8A93A',
    borderWidth: 1.5,
    borderColor: '#34323A',
    transform: [{ rotate: '45deg' }],
  },
  cTL: { top: -5, left: -5 },
  cTR: { top: -5, right: -5 },
  cBL: { bottom: -5, left: -5 },
  cBR: { bottom: -5, right: -5 },
  plaqueBody: { alignItems: 'center', paddingHorizontal: 28, paddingVertical: 26 },
  below: { width: '100%', alignItems: 'center', paddingTop: 30, paddingHorizontal: 8 },
});
