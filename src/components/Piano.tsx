import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { isBlackKey, midiName, type MusicKey, prefersFlats, scaleOf } from '../lib/notes';
import { playNote } from '../lib/pianoSound';

// Teclado de piano: suena al tocarlo con el ratón, el dedo o el teclado del ordenador, y puede
// marcar las notas de una tonalidad (la tónica más fuerte que el resto de la escala).

/** Teclas del ordenador, desde el primer Do visible: fila de letras para blancas, la de arriba negras. */
const COMPUTER_KEYS = [
  'a',
  'w',
  's',
  'e',
  'd',
  'f',
  't',
  'g',
  'y',
  'h',
  'u',
  'j',
  'k',
  'o',
  'l',
  'p',
  'ñ',
];

export interface PianoHandle {
  /** Toca una nota y la marca un momento, como si alguien pulsara la tecla. */
  strike: (midi: number, ms?: number) => void;
}

export const Piano = forwardRef<
  PianoHandle,
  {
    /** Primera nota (MIDI) del teclado; debe ser un Do. */
    start: number;
    /** Número de octavas (se añade el Do final). */
    octaves: number;
    musicKey?: MusicKey | null;
    showComputerKeys?: boolean;
    onNote?: (midi: number) => void;
    onShiftOctave?: (dir: 1 | -1) => void;
  }
>(function Piano({ start, octaves, musicKey, showComputerKeys, onNote, onShiftOctave }, ref) {
  const [width, setWidth] = useState(0);
  const [down, setDown] = useState<Set<number>>(new Set());
  const releases = useRef(new Map<number, () => void>());

  const notes: number[] = [];
  for (let m = start; m <= start + octaves * 12; m++) notes.push(m);
  const whites = notes.filter((m) => !isBlackKey(m));
  const ww = width / whites.length;
  const bw = ww * 0.62;
  const flats = musicKey ? prefersFlats(musicKey) : false;
  const scale = musicKey ? new Set(scaleOf(musicKey)) : null;
  const pc = (m: number) => ((m % 12) + 12) % 12;

  const press = useCallback(
    (m: number) => {
      releases.current.get(m)?.();
      releases.current.set(m, playNote(m));
      setDown((s) => new Set(s).add(m));
      onNote?.(m);
    },
    [onNote],
  );
  const release = useCallback((m: number) => {
    setDown((s) => {
      const n = new Set(s);
      n.delete(m);
      return n;
    });
    // Dejamos que la nota se apague sola: suena más natural que cortarla al soltar.
  }, []);

  // En la web, un clic muy rápido a veces no dispara onPressIn: entonces tocamos en onPress.
  const pressedIn = useRef<number | null>(null);
  const keyHandlers = (m: number) => ({
    onPressIn: () => {
      pressedIn.current = m;
      press(m);
    },
    onPressOut: () => release(m),
    onPress: () => {
      if (pressedIn.current !== m) {
        press(m);
        setTimeout(() => release(m), 200);
      }
      pressedIn.current = null;
    },
  });

  useImperativeHandle(ref, () => ({
    strike: (m, ms = 320) => {
      press(m);
      setTimeout(() => release(m), ms);
    },
  }));

  // Teclado del ordenador (solo en la web).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const held = new Set<string>();
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' || k === 'x') {
        onShiftOctave?.(k === 'z' ? -1 : 1);
        return;
      }
      const i = COMPUTER_KEYS.indexOf(k);
      if (i < 0 || held.has(k)) return;
      const m = start + i;
      if (m > start + octaves * 12) return;
      held.add(k);
      e.preventDefault();
      press(m);
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!held.has(k)) return;
      held.delete(k);
      release(start + COMPUTER_KEYS.indexOf(k));
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [start, octaves, press, release, onShiftOctave]);

  const label = (m: number) => midiName(m, flats).replace(/-?\d+$/, '');

  return (
    <View style={styles.case}>
      <View style={styles.felt} />
      <View
        style={styles.keys}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessibilityRole="none"
      >
        {width > 0 &&
          whites.map((m, i) => {
            const inScale = scale?.has(pc(m));
            const tonic = musicKey && pc(m) === musicKey.tonic;
            const isDown = down.has(m);
            const ck = showComputerKeys ? COMPUTER_KEYS[m - start] : undefined;
            return (
              <Pressable
                key={m}
                {...keyHandlers(m)}
                accessibilityRole="button"
                accessibilityLabel={`Tecla ${midiName(m, flats)}`}
                style={[
                  styles.white,
                  { left: i * ww, width: ww + 0.5 },
                  inScale && styles.whiteScale,
                  tonic && styles.whiteTonic,
                  isDown && styles.whiteDown,
                ]}
              >
                {ck && ww > 34 ? <Text style={styles.ckWhite}>{ck.toUpperCase()}</Text> : null}
                {inScale ? <View style={[styles.dot, tonic && styles.dotTonic]} /> : null}
                <Text
                  style={[
                    styles.whiteName,
                    ww < 34 && { fontSize: 10 },
                    tonic && { color: colors.frameDark },
                  ]}
                  numberOfLines={1}
                >
                  {label(m)}
                </Text>
                {pc(m) === 0 ? <Text style={styles.octave}>{Math.floor(m / 12) - 1}</Text> : null}
              </Pressable>
            );
          })}
        {width > 0 &&
          notes.map((m) => {
            if (!isBlackKey(m)) return null;
            const whiteBefore = whites.filter((w) => w < m).length;
            const inScale = scale?.has(pc(m));
            const tonic = musicKey && pc(m) === musicKey.tonic;
            const isDown = down.has(m);
            const ck = showComputerKeys ? COMPUTER_KEYS[m - start] : undefined;
            return (
              <Pressable
                key={m}
                {...keyHandlers(m)}
                accessibilityRole="button"
                accessibilityLabel={`Tecla ${midiName(m, flats)}`}
                style={[
                  styles.black,
                  { left: whiteBefore * ww - bw / 2, width: bw },
                  isDown && styles.blackDown,
                ]}
              >
                {ck && ww > 34 ? <Text style={styles.ckBlack}>{ck.toUpperCase()}</Text> : null}
                {inScale ? (
                  <View style={[styles.dot, styles.dotOnBlack, tonic && styles.dotTonic]} />
                ) : null}
                {ww > 40 || inScale ? (
                  <Text style={[styles.blackName, ww < 40 && { fontSize: 8 }]} numberOfLines={1}>
                    {label(m)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
      </View>
    </View>
  );
});

const KEY_H = 190;

const styles = StyleSheet.create({
  case: {
    backgroundColor: colors.frameDark,
    borderRadius: 18,
    padding: 10,
    paddingTop: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    boxShadow:
      '0 1px 2px rgba(44,42,68,0.08), 0 10px 24px rgba(44,42,68,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  felt: {
    height: 4,
    backgroundColor: '#9C3D54',
    borderRadius: 2,
    marginBottom: 0,
    marginHorizontal: 2,
  },
  keys: { height: KEY_H, position: 'relative', userSelect: 'none' } as never,
  white: {
    position: 'absolute',
    top: 0,
    height: KEY_H,
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#CDBB92',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    gap: 4,
    boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.05)',
  },
  whiteScale: { backgroundColor: '#F0F7F4' },
  whiteTonic: { backgroundColor: '#DDEFE9' },
  whiteDown: {
    backgroundColor: colors.goldLight,
    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.08)',
    transform: [{ translateY: 2 }],
  },
  black: {
    position: 'absolute',
    top: 0,
    height: KEY_H * 0.62,
    backgroundColor: '#2C2A44',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    gap: 4,
    zIndex: 2,
    boxShadow: '0 3px 4px rgba(0,0,0,0.25), inset 0 -5px 0 rgba(255,255,255,0.08)',
  },
  blackDown: { backgroundColor: '#55507A', transform: [{ translateY: 2 }] },
  whiteName: { color: colors.text, fontSize: 13, fontFamily: fonts.bold },
  blackName: { color: '#F3ECD9', fontSize: 10, fontFamily: fonts.medium },
  octave: { color: colors.faint, fontSize: 10, fontFamily: fonts.medium, marginTop: -2 },
  ckWhite: {
    position: 'absolute',
    top: KEY_H * 0.56,
    color: colors.faint,
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  ckBlack: {
    color: '#8F8AAE',
    fontSize: 9,
    fontFamily: fonts.medium,
    position: 'absolute',
    top: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.frameLight },
  dotTonic: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.frame },
  dotOnBlack: { backgroundColor: colors.frameLight },
});
