import { Text } from 'react-native';
import { colors, fonts } from '../theme';

/** En móvil nativo el título es texto normal; la animación de píxeles es solo para la web. */
export function PixelTitle({ text, maxSize }: { text: string; maxSize: number; palette?: string }) {
  return (
    <Text
      accessibilityRole="header"
      style={{
        color: colors.text,
        fontFamily: fonts.display,
        fontSize: maxSize,
        lineHeight: maxSize * 1.08,
        textAlign: 'center',
      }}
    >
      {text}
    </Text>
  );
}
