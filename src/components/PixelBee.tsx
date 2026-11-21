import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

// Abi, la abejita de VoiceUp, en pixel art: cada carácter es un píxel.
// Alas de cristal verde agua unidas con plomo dorado, como la vidriera, y lirios en las antenas.
const ART = [
  '......VV......VV......',
  '.LLL...O......O...LLL.',
  'LAAAL...O....O...LAAAL',
  'LAALSL..OOOOOO..LSLAAL',
  'LASLSLOOYYHHYYOOLSLSAL',
  'LSSLAOYYYYHYYYYYOALSSL',
  '.LSAAOYYYYYYYYYYOAASL.',
  '..LLLOYEeYYYYEeYOLLL..',
  '.....OYEEYYYYEEYO.....',
  '.....OPYYYMMYYYPO.....',
  '.....OBBBBBBBBBBO.....',
  '.....OYYYYYYYYYYO.....',
  '.....OBBBBBBBBBBO.....',
  '......OyYYYYYYyO......',
  '.......OOOOOOOO.......',
  '.......OO....OO.......',
];

const PALETTE: Record<string, string> = {
  O: '#2C2A44',
  B: '#2C2A44',
  E: '#2C2A44',
  Y: '#E9B84E',
  y: '#D49634',
  H: '#FBE3A6',
  e: '#FFFFFF',
  P: '#E39AA8',
  M: '#7A3A3A',
  A: '#CBE7DF',
  S: '#79B9AD',
  L: '#B8975A',
  V: '#6E78CF',
};

export function PixelBee({ size = 3, still = false }: { size?: number; still?: boolean }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (still) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, still]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 1.5] });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ transform: [{ translateY }] }}
    >
      {ART.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.split('').map((c, x) => (
            <View
              key={x}
              style={{
                width: size,
                height: size,
                backgroundColor: PALETTE[c] ?? 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}
