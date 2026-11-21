import type { ReactNode } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

export function openUrl(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
}

/** Centra el contenido y limita el ancho en pantallas grandes. */
export function Page({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.page, style]}>{children}</View>;
}

export function Pill({
  label,
  color,
  active,
  onPress,
  dot,
}: {
  label: string;
  color?: string;
  active?: boolean;
  onPress?: () => void;
  dot?: boolean;
}) {
  const c = color ?? colors.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!active } : undefined}
      style={({ pressed }) => [
        styles.pill,
        { borderColor: active ? c : colors.border, backgroundColor: active ? `${c}2E` : colors.surface },
        pressed && { opacity: 0.75 },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: c }]} />}
      <Text style={[styles.pillText, active && { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({
  label,
  url,
  icon,
  tone = 'default',
}: {
  label: string;
  url: string;
  icon?: string;
  tone?: 'default' | 'spotify' | 'youtube';
}) {
  const bg = tone === 'spotify' ? '#1DB954' : tone === 'youtube' ? '#FF3D3D' : colors.surfaceAlt;
  const fg = tone === 'default' ? colors.text : '#0B0B0B';
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => openUrl(url)}
      style={({ pressed }) => [styles.linkBtn, { backgroundColor: bg }, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.linkText, { color: fg }]}>
        {icon ? `${icon}  ` : ''}
        {label} ↗
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <View style={{ marginTop: 28, marginBottom: 12 }}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 920, alignSelf: 'center', paddingHorizontal: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  linkBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill },
  linkText: { fontWeight: '700', fontSize: 14 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  hint: { color: colors.muted, fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23 },
});
