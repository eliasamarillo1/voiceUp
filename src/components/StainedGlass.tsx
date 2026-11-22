import { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors, glass } from '../theme';

// Fondo de vidriera para la portada: un ventanal de cristales emplomados en tonos suaves que llena
// el panel, con un óvalo claro en el centro donde va el texto. Se adapta al tamaño del panel.

const TINTS = [
  '#E7F1EE',
  '#EEF0FA',
  '#F6EFD9',
  '#E9E5F5',
  '#EAF3EC',
  '#F8F2E2',
  '#DDEBE7',
  '#ECE7F7',
];
const STRONG = ['#CFE3DD', '#D6D9F3', '#F1E1B8', '#DCD5EF'];
const CLEAR = '#FFFDF6';
const INSET = 12;
const INSET_Y = 78;

/** Números pseudoaleatorios repetibles, para que el dibujo no cambie en cada render. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function build(w: number, h: number) {
  const r = rng(7);
  const cols = Math.max(4, Math.round(w / 80));
  const rows = Math.max(4, Math.round(h / 74));
  const jx = (w / cols) * 0.22;
  const jy = (h / rows) * 0.2;
  const pts: [number, number][] = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const x = (i * w) / cols + (i > 0 && i < cols ? (r() * 2 - 1) * jx : 0);
      const y = (j * h) / rows + (j > 0 && j < rows ? (r() * 2 - 1) * jy : 0);
      pts.push([x, y]);
    }
  }
  const P = (i: number, j: number) => pts[j * (cols + 1) + i];

  const portrait = h > w * 0.9;
  const cx = w / 2;
  const cy = h / 2 + (portrait ? 0 : 8);
  const rx = portrait ? w * 0.47 : Math.min(w * 0.4, 440);
  const ry = portrait ? h * 0.4 : h * 0.45;

  const panes: { d: string; fill: string }[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const [a, b, c, d] = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      const mx = (a[0] + c[0]) / 2;
      const my = (a[1] + c[1]) / 2;
      // En vertical (móvil) el hueco claro es una ventana rectangular; en horizontal, un óvalo.
      const dist = portrait
        ? Math.max(Math.abs(mx - cx) / (w / 2 - INSET), Math.abs(my - cy) / (h / 2 - INSET_Y)) * 1.0
        : Math.hypot((mx - cx) / rx, (my - cy) / ry);
      let fill = CLEAR;
      if (dist >= 1) {
        fill = TINTS[Math.floor(r() * TINTS.length)];
        if (dist > 1.3 && r() < 0.35) fill = STRONG[Math.floor(r() * STRONG.length)];
      } else {
        r(); // mantiene la secuencia estable
      }
      const f = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
      panes.push({ d: `M${f(a)} L${f(b)} L${f(c)} L${f(d)}Z`, fill });
    }
  }
  const gems: [number, number][] = portrait
    ? [
        [cx, INSET_Y / 2],
        [cx, h - INSET_Y / 2],
      ]
    : [
        [70, 70],
        [w - 70, 70],
        [70, h - 70],
        [w - 70, h - 70],
        [cx, 22],
        [cx, h - 22],
      ];
  return { panes, cx, cy, rx, ry, gems, portrait, w, h };
}

export const StainedGlass = memo(function StainedGlass() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const art = useMemo(() => (size.w > 0 ? build(size.w, size.h) : null), [size.w, size.h]);
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (Math.abs(width - size.w) > 1 || Math.abs(height - size.h) > 1)
          setSize({ w: width, h: height });
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {art && (
        <Svg width={size.w} height={size.h}>
          {art.panes.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              fill={p.fill}
              stroke={colors.gold}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          ))}
          {art.portrait ? (
            <>
              <Rect
                x={INSET}
                y={INSET_Y}
                width={art.w - INSET * 2}
                height={art.h - INSET_Y * 2}
                rx={28}
                fill={CLEAR}
                stroke={colors.gold}
                strokeWidth={3}
              />
              <Rect
                x={INSET + 8}
                y={INSET_Y + 8}
                width={art.w - INSET * 2 - 16}
                height={art.h - INSET_Y * 2 - 16}
                rx={22}
                fill="none"
                stroke={colors.goldLight}
                strokeWidth={1.2}
              />
            </>
          ) : (
            <>
              <Ellipse
                cx={art.cx}
                cy={art.cy}
                rx={art.rx}
                ry={art.ry}
                fill={CLEAR}
                stroke={colors.gold}
                strokeWidth={3}
              />
              <Ellipse
                cx={art.cx}
                cy={art.cy}
                rx={art.rx - 12}
                ry={art.ry - 12}
                fill="none"
                stroke={colors.goldLight}
                strokeWidth={1.2}
              />
            </>
          )}
          {art.gems.map(([x, y], i) => (
            <G key={i}>
              <Circle
                cx={x}
                cy={y}
                r={9}
                fill={glass.irisLight}
                stroke={colors.gold}
                strokeWidth={2}
              />
              <Circle cx={x - 3} cy={y - 3} r={2.5} fill="#FFFFFF" opacity={0.8} />
            </G>
          ))}
        </Svg>
      )}
    </View>
  );
});
