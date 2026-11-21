import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, SvgXml } from 'react-native-svg';
import { colors } from '../theme';
import { irisClumpLeft, irisClumpRight } from './irisClumps';

// Piezas decorativas del estilo vidriera Art Nouveau: el ventanal de lirios, los adornos de
// las esquinas y el marco doble (verde azulado por fuera, plomo dorado por dentro).

/** Mata de lirios que crece desde abajo (para los laterales de la portada). */
export function IrisClump({ side, width }: { side: 'left' | 'right'; width: number }) {
  const ratio = 340 / 240;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SvgXml
        xml={side === 'left' ? irisClumpLeft : irisClumpRight}
        width={width}
        height={width * ratio}
      />
    </View>
  );
}

/** Adorno curvo dorado para una esquina (látigo modernista). */
export function CornerOrnament({ flip, size = 90 }: { flip?: boolean; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 90 90"
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}
      accessibilityElementsHidden
    >
      <G fill="none" stroke={colors.gold} strokeWidth={2} strokeLinecap="round">
        <Path d="M4,86 C4,40 20,10 70,6" />
        <Path d="M14,86 C16,52 30,26 58,20 C72,17 80,26 72,34 C64,42 52,34 58,26" />
        <Path d="M4,60 C18,58 26,48 24,36" />
        <Circle cx={30} cy={30} r={3} fill={colors.frameLight} />
      </G>
    </Svg>
  );
}

/** Pequeño lirio dorado que separa o encabeza secciones. */
export function Fleuron({ size = 18, color = colors.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" accessibilityElementsHidden>
      <G fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
        <Path d="M10,2 C7,6 7,9 10,11 C13,9 13,6 10,2Z" />
        <Path d="M10,11 C6,10 3,12 2,15 C6,16 8,14 10,11Z" />
        <Path d="M10,11 C14,10 17,12 18,15 C14,16 12,14 10,11Z" />
        <Path d="M10,11 L10,19" />
      </G>
    </Svg>
  );
}

/**
 * Marco de vidriera: borde verde azulado por fuera y un hilo de plomo dorado por dentro.
 * `arch` redondea la parte de arriba como un ventanal.
 */
export function Frame({
  children,
  arch,
  style,
  innerStyle,
  color = colors.frame,
  corner = 16,
}: {
  children: ReactNode;
  arch?: boolean;
  /** Radio de las esquinas cuando no es un arco. */
  corner?: number;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  color?: string;
}) {
  const r = arch ? 120 : corner;
  const bottom = arch ? 16 : corner;
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 3,
          borderColor: color,
          borderRadius: r,
          borderBottomLeftRadius: bottom,
          borderBottomRightRadius: bottom,
          padding: 3,
        },
        style,
      ]}
    >
      <View
        style={[
          {
            flex: 1,
            borderWidth: 1.5,
            borderColor: colors.gold,
            borderRadius: r - 4,
            borderBottomLeftRadius: bottom - 4,
            borderBottomRightRadius: bottom - 4,
            padding: 16,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
