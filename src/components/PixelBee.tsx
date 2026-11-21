import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

// Abi, la abejita de VoiceUp, dibujada en pixel art: cada carácter es un píxel.
const ART = [
  '...WWW..WWW.....',
  '..WHHWW.WHWW....',
  '..WHWWW.WWWW..K.',
  '...WWW..WWW..K..',
  '....KKKKKKKKK...',
  '...KYYBBYYBYYK..',
  '..KYYYBBYYBYYYK.',
  '..KYYYBBYYBYEYK.',
  'KKKYYYBBYYBYYPK.',
  '..KYYYBBYYBYKYK.',
  '...KYYBBYYBYYK..',
  '....KKKKKKKKK...',
];

const PALETTE: Record<string, string> = {
  W: '#CDEBFF',
  H: '#FFFFFF',
  K: '#3A2C2C',
  Y: '#FFC93C',
  B: '#3A2C2C',
  E: '#1D1828',
  P: '#FF8FA3',
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
