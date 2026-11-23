import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radius } from '../theme';
import { parseKey } from '../lib/notes';

/** Botón que abre el piano con las notas de una tonalidad marcadas (por ejemplo, «La menor»). */
export function PianoKeyLink({ keyName, label }: { keyName: string; label?: string }) {
  if (!parseKey(keyName)) return null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/piano', params: { tono: keyName } })}
      accessibilityRole="link"
      accessibilityLabel={`Ver ${keyName} en el piano`}
      style={({ pressed }) => [styles.btn, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <Text style={styles.text}>🎹 {label ?? 'Ver en el piano'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.frame,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  text: { color: colors.frameDark, fontSize: 14, fontFamily: fonts.bold },
});
