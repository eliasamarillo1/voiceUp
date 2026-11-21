import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors, glass } from '../theme';

// Piezas decorativas del estilo vidriera Art Nouveau: el ventanal de lirios, los adornos de
// las esquinas y el marco doble (verde azulado por fuera, plomo dorado por dentro).

const STANDARD = 'M0,0 C-20,-8 -26,-46 -4,-64 C2,-70 8,-66 10,-58 C22,-40 18,-10 0,0Z';
const FALL = 'M0,0 C-24,6 -34,40 -16,60 C-6,70 10,68 16,56 C26,34 20,6 0,0Z';

function Iris({ x, y, s, id }: { x: number; y: number; s: number; id: string }) {
  const petal = (d: string, rot: number, fill: string, key: string) => (
    <Path
      key={key}
      d={d}
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      fill={fill}
      stroke={colors.gold}
      strokeWidth={1.6 / s}
      strokeLinejoin="round"
    />
  );
  return (
    <G>
      {[-28, 28, 0].map((a) => petal(STANDARD, a, `url(#std${id})`, `s${a}`))}
      {[-62, 62, 0].map((a) => petal(FALL, a, `url(#fall${id})`, `f${a}`))}
      {[-62, 62, 0].map((a) => {
        const r = ((a + 90) * Math.PI) / 180;
        return (
          <Line
            key={`b${a}`}
            x1={x}
            y1={y}
            x2={x + Math.cos(r) * 26 * s}
            y2={y + Math.sin(r) * 26 * s}
            stroke={glass.amber}
            strokeWidth={3.2 * s}
            strokeLinecap="round"
          />
        );
      })}
    </G>
  );
}

function Leaf({
  x0,
  y0,
  x1,
  y1,
  bend,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  bend: number;
}) {
  const w = 7;
  const mx = (x0 + x1) / 2 + bend;
  const my = (y0 + y1) / 2;
  return (
    <Path
      d={`M${x0 - w},${y0} Q${mx},${my} ${x1},${y1} Q${mx + w * 1.2},${my} ${x0 + w},${y0}Z`}
      fill="url(#leafGrad)"
      stroke={colors.gold}
      strokeWidth={1.2}
    />
  );
}

/** Ventanal ovalado con lirios, como la portada de una vidriera modernista. */
export function IrisWindow({ width = 250, height = 290 }: { width?: number; height?: number }) {
  const w = width;
  const h = height;
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - 10;
  const ry = h / 2 - 10;
  const id = `${w}x${h}`;
  const leaves: [number, number, number][] = [
    [cx - 80, h * 0.35, -20],
    [cx + 70, h * 0.3, 20],
    [cx - 20, h * 0.2, -10],
    [cx + 30, h * 0.45, 10],
    [cx - 50, h * 0.55, -30],
    [cx + 90, h * 0.6, 30],
  ];
  const stems: [number, number][] = [
    [-70, -40],
    [60, -30],
    [-40, 20],
    [40, 30],
  ];
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} accessibilityElementsHidden>
      <Defs>
        <LinearGradient id={`std${id}`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={glass.iris} />
          <Stop offset="1" stopColor={glass.irisLight} />
        </LinearGradient>
        <LinearGradient id={`fall${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={glass.irisLight} />
          <Stop offset="0.5" stopColor={glass.iris} />
          <Stop offset="1" stopColor={glass.irisDark} />
        </LinearGradient>
        <LinearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8CC2AC" />
          <Stop offset="1" stopColor={colors.frameDark} />
        </LinearGradient>
        <RadialGradient id={`glow${id}`} cx="0.5" cy="0.4" r="0.7">
          <Stop offset="0" stopColor={glass.cream} />
          <Stop offset="1" stopColor="#EDE1BF" />
        </RadialGradient>
        <ClipPath id={`clip${id}`}>
          <Ellipse cx={cx} cy={cy} rx={rx - 8} ry={ry - 8} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#clip${id})`}>
        <Rect width={w} height={h} fill={`url(#glow${id})`} />
        {stems.map(([a, b], i) => (
          <Path
            key={i}
            d={`M${cx + a},${h} C${cx + a * 1.4},${cy + 40} ${cx + b * 2},${cy - 40} ${cx + b * 2.4},30`}
            fill="none"
            stroke={colors.goldLight}
            strokeWidth={2}
          />
        ))}
        {leaves.map(([x1, y1, bend], i) => (
          <Leaf key={i} x0={cx + (x1 - cx) * 0.2} y0={h + 10} x1={x1} y1={y1} bend={bend} />
        ))}
        <Iris x={cx - 8} y={h * 0.36} s={(1.15 * w) / 250} id={id} />
        <Iris x={cx - w * 0.24} y={h * 0.62} s={(0.95 * w) / 250} id={id} />
        <Iris x={cx + w * 0.24} y={h * 0.58} s={(1.0 * w) / 250} id={id} />
      </G>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={colors.frame} strokeWidth={14} />
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx + 7}
        ry={ry + 7}
        fill="none"
        stroke={colors.gold}
        strokeWidth={1.6}
      />
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx - 7}
        ry={ry - 7}
        fill="none"
        stroke={colors.gold}
        strokeWidth={1.6}
      />
    </Svg>
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
}: {
  children: ReactNode;
  arch?: boolean;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  color?: string;
}) {
  const r = arch ? 120 : 16;
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 3,
          borderColor: color,
          borderRadius: r,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
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
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
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
