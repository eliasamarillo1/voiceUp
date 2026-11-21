import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import { PixelBee } from './PixelBee';
import { fonts, colors, radius } from '../theme';

type Page = 'inicio' | 'cancion' | 'recurso' | 'recursos' | 'calentamiento';

// Pequeñas aclaraciones de Abi para cada pantalla.
const TIPS: Record<Page, string[]> = {
  inicio: [
    '¡Hola! Soy Abi, tu ayudante. Busca una canción por su título, su artista o un trozo de la letra.',
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

/** Abi, la abejita ayudante: flota en una esquina y da pequeñas aclaraciones sobre la pantalla. */
export function BeeHelper() {
  const page = pageFor(usePathname());
  const tips = TIPS[page];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    // La primera vez que visitas una pantalla, Abi saluda sola. Después, solo si la tocas.
    setOpen(!seenBefore(page));
  }, [page]);

  // En la canción hay una barra de reproducción abajo: Abi se coloca encima.
  const bottom = page === 'cancion' ? 92 : 20;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      {open && (
        <View style={styles.bubble} accessibilityLiveRegion="polite">
          <Text style={styles.name}>Abi</Text>
          <Text style={styles.tip}>{tips[index]}</Text>
          <View style={styles.actions}>
            <Text style={styles.count}>
              {index + 1}/{tips.length}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                style={styles.btnGhost}
              >
                <Text style={styles.btnGhostText}>Cerrar</Text>
              </Pressable>
              <Pressable
                onPress={() => (index < tips.length - 1 ? setIndex(index + 1) : setOpen(false))}
                accessibilityRole="button"
                style={styles.btn}
              >
                <Text style={styles.btnText}>
                  {index < tips.length - 1 ? 'Otro consejo' : '¡Entendido!'}
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.tail} />
        </View>
      )}
      <Pressable
        onPress={() => {
          if (!open) setIndex(0);
          setOpen(!open);
        }}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Cerrar la ayuda de Abi' : 'Abrir la ayuda de Abi, la abejita'}
        style={({ pressed }) => [styles.beeBtn, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <PixelBee size={3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
    maxWidth: 320,
    zIndex: 50,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: 14,
    outlineWidth: 3,
    outlineStyle: 'solid',
    outlineColor: colors.frame,
    outlineOffset: 3,
    marginBottom: 10,
    shadowColor: '#1D1828',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  name: { color: colors.frameDark, fontSize: 14, fontFamily: fonts.heavy, letterSpacing: 0.5 },
  tip: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.regular,
    lineHeight: 20,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  count: { color: colors.faint, fontSize: 14, fontFamily: fonts.bold },
  btn: {
    backgroundColor: colors.frame,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  btnText: { color: '#FFFFFF', fontSize: 15, fontFamily: fonts.heavy },
  btnGhost: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  btnGhostText: { color: colors.muted, fontSize: 15, fontFamily: fonts.bold },
  tail: {
    position: 'absolute',
    right: 24,
    bottom: -7,
    width: 12,
    height: 12,
    backgroundColor: colors.surface,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.gold,
    transform: [{ rotate: '45deg' }],
  },
  beeBtn: {
    width: 84,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
