import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { usePathname } from 'expo-router';
import { BEE_COLS, BEE_ROWS, PixelBee, type BeeFrame } from './PixelBee';
import { fonts, colors, radius } from '../theme';

type Page = 'inicio' | 'cancion' | 'recurso' | 'recursos' | 'calentamiento';

// Pequeñas aclaraciones de Abi para cada pantalla.
const TIPS: Record<Page, string[]> = {
  inicio: [
    '¡Hola! Soy Abi. Vuelo por aquí: tócame cuando quieras un consejo. Busca una canción por su título, su artista o un trozo de la letra.',
    'Las etiquetas de colores de cada canción son sus recursos vocales. Cada recurso tiene siempre el mismo color en toda la app.',
    'Si una canción sale como «todavía no está analizada», es que aún no tenemos su estudio. En la versión final se analizará sola; mientras, puedes escucharla en Spotify o YouTube.',
    'Los tres accesos de arriba te llevan a las canciones, a los recursos vocales o al calentamiento.',
    'Antes de cantar, calienta la voz: toca «Calentar la voz», arriba.',
  ],
  cancion: [
    'Esta es la carpeta de la canción. Arriba tienes el vídeo para escucharla.',
    'La barra de colores es el mapa de la canción: cada bloque es una parte (estrofa, estribillo…) y cada punto, un recurso vocal. Tócala para saltar.',
    'En la letra, las palabras de colores llevan un recurso vocal. Tócalas para aprender a hacerlo.',
    'El botón redondo de abajo hace avanzar la letra sin sonido, para que la sigas a tu ritmo.',
    '«Automático · 86 %» significa que lo detectó el análisis automático y lo seguro que está. «Revisado» quiere decir que lo comprobó una persona.',
    'En «Tonalidades» puedes subir o bajar la canción para adaptarla a tu voz.',
  ],
  recurso: [
    'Aquí aprendes un recurso: qué es, cómo se hace y ejercicios. Toca un ejercicio para ver sus pasos.',
    'Los vídeos se reproducen aquí mismo, sin salir de la app.',
    'Si vienes de una canción, arriba tienes los momentos exactos donde aparece este recurso.',
  ],
  recursos: [
    'Elige una categoría y toca un recurso para ver su ficha rápida.',
    'El nivel (básico, intermedio o avanzado) te ayuda a saber por dónde empezar.',
  ],
  calentamiento: [
    'Elige la rutina rápida si vas con prisa, o la completa antes de una clase.',
    'Pulsa «Empezar» y sigue el temporizador: pasa solo al siguiente ejercicio.',
    'Si algo te molesta o duele, para. Calentar nunca debe doler.',
  ],
};

function pageFor(path: string): Page {
  if (path.includes('/cancion/')) return 'cancion';
  if (path.includes('/recurso/')) return 'recurso';
  if (path.includes('/recursos')) return 'recursos';
  if (path.includes('/calentamiento')) return 'calentamiento';
  return 'inicio';
}

// Recuerda en este navegador qué pantallas ya ha explicado Abi, para no insistir.
function seenBefore(page: Page) {
  if (Platform.OS !== 'web') return false;
  try {
    const key = `voiceup-abi-${page}`;
    const seen = window.localStorage.getItem(key) === '1';
    window.localStorage.setItem(key, '1');
    return seen;
  } catch {
    return false;
  }
}

const PX = 3; // tamaño de cada píxel de Abi
const CONTENT_W = 920; // ancho máximo de la columna de contenido (ver Page en ui.tsx)
const PEEK = 0.6; // en móvil, parte de Abi que se asoma desde el borde
const BEE_W = BEE_COLS * PX;
const BEE_H = BEE_ROWS * PX;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Abi, la abejita mascota: vuela libre por la pantalla. Si la tocas, da un saltito, suelta
 * corazones y te cuenta un consejo sobre la pantalla en la que estás.
 */
export function BeeHelper() {
  const page = pageFor(usePathname());
  const tips = TIPS[page];
  const { width, height } = useWindowDimensions();

  const pos = useRef(
    new Animated.ValueXY({ x: width - BEE_W - 24, y: height - BEE_H - 130 }),
  ).current;
  const bob = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0)).current;
  const hearts = useRef(new Animated.Value(0)).current;
  const current = useRef({ x: width - BEE_W - 24, y: height - BEE_H - 130 });

  const [frame, setFrame] = useState<BeeFrame>('idle');
  const [facing, setFacing] = useState<1 | -1>(-1);
  const [flying, setFlying] = useState(false);
  const [happy, setHappy] = useState(false);
  const [tip, setTip] = useState<number | null>(null);
  const [beePos, setBeePos] = useState(current.current);
  const [reduceMotion, setReduceMotion] = useState(false);
  const nextTip = useRef(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => {});
  }, []);

  // Límites por donde puede volar (encima de la barra de reproducción en la canción).
  const bottomSpace = page === 'cancion' ? 110 : 24;
  const bounds = {
    minX: 8,
    maxX: Math.max(8, width - BEE_W - 8),
    minY: 70,
    maxY: Math.max(70, height - BEE_H - bottomSpace),
  };

  // Abi vuela solo por los laterales, nunca por encima de los textos. El contenido de cada
  // pantalla ocupa una columna central de hasta CONTENT_W px; Abi se queda en el margen de su lado.
  // Si no hay margen (móvil), se asoma desde el borde derecho y solo sube y baja.
  const gutter = (width - Math.min(CONTENT_W, width)) / 2 + 8;
  const wide = gutter >= BEE_W + 8;
  const onRightSide = current.current.x + BEE_W / 2 >= width / 2;
  const lane = !wide
    ? { minX: width - BEE_W * PEEK, maxX: width - BEE_W * PEEK }
    : onRightSide
      ? { minX: width - gutter, maxX: width - BEE_W - 8 }
      : { minX: 8, maxX: gutter - BEE_W };

  // Aleteo y parpadeo.
  useEffect(() => {
    let tick = 0;
    const id = setInterval(
      () => {
        tick++;
        if (happy) return setFrame(tick % 2 ? 'happy' : 'flap');
        if (!flying && tick % 18 === 0) return setFrame('blink');
        setFrame(tick % 2 ? 'flap' : 'idle');
      },
      flying || happy ? 110 : 240,
    );
    return () => clearInterval(id);
  }, [flying, happy]);

  // Flota arriba y abajo suavemente.
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, reduceMotion]);

  const flyTo = useCallback(
    (x: number, y: number, done?: () => void) => {
      const from = current.current;
      const dist = Math.hypot(x - from.x, y - from.y);
      current.current = { x, y };
      setFlying(true);
      if (Math.abs(x - from.x) > 4) setFacing(x < from.x ? -1 : 1);
      Animated.timing(tilt, {
        toValue: Math.sign(x - from.x),
        duration: 250,
        useNativeDriver: false,
      }).start();
      Animated.timing(pos, {
        toValue: { x, y },
        duration: Math.max(900, (dist / 110) * 1000),
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }).start(({ finished }) => {
        setFlying(false);
        setBeePos({ x, y });
        Animated.timing(tilt, { toValue: 0, duration: 300, useNativeDriver: false }).start();
        if (finished) done?.();
      });
    },
    [pos, tilt],
  );

  // Paseo libre por la pantalla mientras no está hablando.
  useEffect(() => {
    if (reduceMotion || tip !== null) return;
    let timer: ReturnType<typeof setTimeout>;
    const wander = () => {
      flyTo(rand(lane.minX, lane.maxX), rand(bounds.minY, bounds.maxY), () => {
        timer = setTimeout(wander, rand(2500, 5500));
      });
    };
    timer = setTimeout(wander, rand(1500, 3000));
    return () => {
      clearTimeout(timer);
      pos.stopAnimation((v) => {
        current.current = v;
        setBeePos(v);
      });
    };
  }, [reduceMotion, tip, flyTo, pos, lane.minX, lane.maxX, bounds.minY, bounds.maxY]);

  // Si cambia el tamaño de la ventana, que vuelva a su lateral y no se quede fuera.
  useEffect(() => {
    const { x, y } = current.current;
    if (x < lane.minX || x > lane.maxX || y > bounds.maxY) {
      const nx = Math.min(Math.max(x, lane.minX), lane.maxX);
      const ny = Math.min(y, bounds.maxY);
      current.current = { x: nx, y: ny };
      pos.setValue({ x: nx, y: ny });
      setBeePos({ x: nx, y: ny });
    }
  }, [lane.minX, lane.maxX, bounds.maxY, pos]);

  // La primera vez que visitas una pantalla, Abi se acerca y te saluda.
  useEffect(() => {
    nextTip.current = 0;
    setTip(null);
    if (!seenBefore(page)) {
      const t = setTimeout(() => {
        nextTip.current = 1;
        setTip(0);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [page]);

  // El consejo se va solo al cabo de un rato.
  useEffect(() => {
    if (tip === null) return;
    const t = setTimeout(() => setTip(null), 9000);
    return () => clearTimeout(t);
  }, [tip]);

  const onTouch = () => {
    pos.stopAnimation((v) => {
      current.current = v;
      setBeePos(v);
    });
    setFlying(false);
    setHappy(true);
    jump.setValue(0);
    hearts.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(jump, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(jump, {
          toValue: 2,
          duration: 420,
          easing: Easing.bounce,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(hearts, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => setHappy(false));
    const i = nextTip.current % tips.length;
    nextTip.current = i + 1;
    setTip(i);
  };

  const translateY = Animated.add(
    bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
    jump.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -22, 0] }),
  );
  const rotate = Animated.add(
    tilt.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] }),
    jump.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 180, 360] }),
  ).interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] });

  // El consejo aparece al lado de Abi, hacia el centro de la pantalla.
  const onRight = beePos.x > width / 2;
  const cardW = Math.min(280, width - 32);
  const cardLeft = Math.max(
    16,
    Math.min(width - cardW - 16, onRight ? beePos.x - cardW - 8 : beePos.x + BEE_W + 8),
  );
  const cardTop = Math.max(16, Math.min(height - bottomSpace - 190, beePos.y - 20));

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {tip !== null && (
        <View
          style={[styles.card, { left: cardLeft, top: cardTop, width: cardW }]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.name}>Abi</Text>
          <Text style={styles.tip}>{tips[tip]}</Text>
          <View style={styles.actions}>
            <Text style={styles.count}>
              {tip + 1}/{tips.length}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => setTip(null)}
                accessibilityRole="button"
                style={styles.btnGhost}
              >
                <Text style={styles.btnGhostText}>Cerrar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const n = (tip + 1) % tips.length;
                  nextTip.current = n + 1;
                  setTip(n);
                }}
                accessibilityRole="button"
                style={styles.btn}
              >
                <Text style={styles.btnText}>Otro consejo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.bee,
          { transform: [...pos.getTranslateTransform(), { translateY }, { rotate }] },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.hearts,
            {
              opacity: hearts.interpolate({
                inputRange: [0, 0.15, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                { translateY: hearts.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
              ],
            },
          ]}
        >
          <Text style={[styles.heart, { marginTop: 8 }]}>♥</Text>
          <Text style={styles.heart}>♥</Text>
          <Text style={[styles.heart, { marginTop: 12 }]}>♥</Text>
        </Animated.View>
        <Pressable
          onPress={onTouch}
          accessibilityRole="button"
          accessibilityLabel="Abi, la abejita. Tócala para que te dé un consejo"
          hitSlop={8}
        >
          <View style={{ transform: [{ scaleX: facing }] }}>
            <PixelBee size={PX} frame={frame} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bee: { position: 'absolute', left: 0, top: 0, zIndex: 50 },
  hearts: {
    position: 'absolute',
    top: -14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  heart: { color: '#E86A92', fontSize: 16, fontFamily: fonts.bold },
  card: {
    position: 'absolute',
    zIndex: 51,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 14,
    shadowColor: '#2C2A44',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  name: { color: colors.frameDark, fontSize: 13, fontFamily: fonts.heavy },
  tip: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 21,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  count: { color: colors.faint, fontSize: 13, fontFamily: fonts.bold },
  btn: {
    backgroundColor: colors.frame,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  btnText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  btnGhost: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  btnGhostText: { color: colors.muted, fontSize: 14, fontFamily: fonts.bold },
});
