import type { ReactNode } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { fonts, colors, radius } from '../theme';
import { Fleuron } from './Nouveau';

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
        {
          borderColor: active ? c : colors.goldLight,
          backgroundColor: active ? c : colors.surface,
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: active ? colors.surface : c }]} />}
      <Text style={[styles.pillText, active && { color: '#FFFFFF' }]}>{label}</Text>
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
  const bg = tone === 'spotify' ? '#14833B' : tone === 'youtube' ? '#D92D20' : colors.surfaceAlt;
  const fg = tone === 'default' ? colors.text : '#FFFFFF';
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => openUrl(url)}
      style={({ pressed }) => [
        styles.linkBtn,
        { backgroundColor: bg },
        tone === 'default' && { borderWidth: 1.5, borderColor: colors.goldLight },
        pressed && { opacity: 0.8 },
      ]}
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
    <View style={{ marginTop: 36, marginBottom: 14 }}>
      <View style={styles.titleRow}>
        <Fleuron size={20} />
        <Text style={styles.sectionTitle}>{children}</Text>
      </View>
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
    borderWidth: 1.5,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  linkBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill },
  linkText: { fontSize: 15, fontFamily: fonts.bold },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { color: colors.frameDark, fontSize: 26, fontFamily: fonts.display, flexShrink: 1 },
  hint: {
    color: colors.muted,
    fontSize: 16,
    fontFamily: fonts.regular,
    marginTop: 4,
    marginLeft: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    padding: 16,
  },
  body: { color: colors.muted, fontSize: 17, fontFamily: fonts.regular, lineHeight: 23 },
});
