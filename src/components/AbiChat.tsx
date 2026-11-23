import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from 'react-native';
import { router } from 'expo-router';
import { abiOnline, askAbi, splitLinks, type ChatTurn } from '../lib/abi';
import { PixelBee } from './PixelBee';
import { colors, fonts, radius } from '../theme';

// Preguntas de ejemplo para quien no sabe por dónde empezar.
const SUGGESTIONS: Record<string, string[]> = {
  cancion: [
    '¿Qué recursos tiene esta canción?',
    '¿Cómo practico la parte más difícil?',
    '¿Qué significa «Automático · 86 %»?',
  ],
  recurso: ['Explícamelo más fácil', 'Dame un ejercicio de 5 minutos', '¿Qué error es el más común?'],
  calentamiento: ['¿Qué rutina me conviene?', '¿Para qué sirve el lip trill?', '¿Cuánto debo calentar?'],
  otras: ['¿Cómo funciona esta página?', '¿Qué es el vibrato?', '¿Cómo respiro al cantar?'],
};

function suggestionsFor(path: string) {
  if (path.includes('/cancion/')) return SUGGESTIONS.cancion;
  if (path.includes('/recurso/')) return SUGGESTIONS.recurso;
  if (path.includes('/calentamiento')) return SUGGESTIONS.calentamiento;
  return SUGGESTIONS.otras;
}

/** Texto de Abi con los recursos convertidos en enlaces a su ficha. */
function AbiText({ text, onLink }: { text: string; onLink: () => void }) {
  return (
    <Text style={styles.msgText}>
      {splitLinks(text).map((p, i) =>
        'id' in p ? (
          <Text
            key={i}
            onPress={() => {
              onLink();
              router.push({ pathname: '/recurso/[id]', params: { id: p.id } });
            }}
            accessibilityRole="link"
            style={[styles.link, { color: p.color }]}
          >
            {p.name}
          </Text>
        ) : (
          <Text key={i}>{p.text}</Text>
        ),
      )}
    </Text>
  );
}

/** Ventana de chat con Abi. La conversación vive en quien la abre, para no perderla al navegar. */
export function AbiChat({
  path,
  turns,
  setTurns,
  onClose,
  bottomSpace,
}: {
  path: string;
  turns: ChatTurn[];
  setTurns: (t: ChatTurn[]) => void;
  onClose: () => void;
  bottomSpace: number;
}) {
  const { width, height } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const online = abiOnline();

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [turns, busy, error]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: ChatTurn[] = [...turns, { role: 'user', content: q }];
    setTurns(next);
    setDraft('');
    setError(null);
    setBusy(true);
    try {
      const reply = await askAbi(next, path);
      setTurns([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Abi no ha podido responder.');
    } finally {
      setBusy(false);
    }
  };

  const narrow = width < 520;
  const panelW = narrow ? width - 16 : 380;
  const panelH = Math.min(540, height - bottomSpace - (narrow ? 70 : 90));

  return (
    <View
      style={[
        styles.panel,
        { width: panelW, height: panelH, right: narrow ? 8 : 20, bottom: bottomSpace },
      ]}
      accessibilityRole="none"
      accessibilityLabel="Chat con Abi"
    >
      <View style={styles.header}>
        <PixelBee size={1.6} frame="idle" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Pregúntale a Abi 👑</Text>
          <Text style={styles.subtitle}>Dudas de la página y de técnica vocal</Text>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar el chat"
          hitSlop={8}
          style={styles.close}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={styles.list}>
        <View style={[styles.msg, styles.abi]}>
          <Text style={styles.msgText}>
            {online
              ? 'Hola, estrella ✨ Soy Abi, la reina de esta colmena. Pregúntame lo que quieras sobre cantar o sobre esta página: recursos vocales, ejercicios, calentamiento… Vamos a hacer que tu voz sirva. 👑'
              : 'Una reina no se presenta sin ensayar: muy pronto podré responder tus preguntas. Mientras, tócame y te doy consejos sobre cada pantalla. 👑'}
          </Text>
        </View>
        {turns.map((t, i) => (
          <View
            key={i}
            style={[styles.msg, t.role === 'user' ? styles.user : styles.abi]}
            accessibilityLiveRegion={t.role === 'assistant' ? 'polite' : undefined}
          >
            {t.role === 'user' ? (
              <Text style={[styles.msgText, { color: '#FFFFFF' }]}>{t.content}</Text>
            ) : (
              <AbiText text={t.content} onLink={narrow ? onClose : () => {}} />
            )}
          </View>
        ))}
        {busy && (
          <View style={[styles.msg, styles.abi, { flexDirection: 'row', gap: 8 }]}>
            <ActivityIndicator size="small" color={colors.frame} />
            <Text style={[styles.msgText, { color: colors.muted }]}>Abi se está retocando la corona…</Text>
          </View>
        )}
        {error && (
          <View style={styles.error} accessibilityLiveRegion="assertive">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {online && turns.length === 0 && !busy && (
          <View style={styles.chips}>
            {suggestionsFor(path).map((s) => (
              <Pressable
                key={s}
                onPress={() => send(s)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => send(draft)}
          placeholder={online ? 'Escribe tu pregunta…' : 'Abi aún no puede chatear'}
          placeholderTextColor={colors.faint}
          editable={online && !busy}
          maxLength={800}
          returnKeyType="send"
          accessibilityLabel="Tu pregunta para Abi"
          style={styles.input}
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={!online || busy || !draft.trim()}
          accessibilityRole="button"
          accessibilityLabel="Enviar pregunta"
          style={({ pressed }) => [
            styles.sendBtn,
            (!online || busy || !draft.trim()) && { opacity: 0.4 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.sendText}>Enviar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    zIndex: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    overflow: 'hidden',
    shadowColor: '#2C2A44',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.frameDark, fontSize: 15, fontFamily: fonts.heavy },
  subtitle: { color: colors.muted, fontSize: 12, fontFamily: fonts.regular, marginTop: 1 },
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.muted, fontSize: 16, fontFamily: fonts.bold },
  list: { padding: 12, gap: 8 },
  msg: { maxWidth: '88%', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 9 },
  abi: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  user: { alignSelf: 'flex-end', backgroundColor: colors.frame, borderBottomRightRadius: 4 },
  msgText: { color: colors.text, fontSize: 15, lineHeight: 21, fontFamily: fonts.regular },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  error: {
    alignSelf: 'stretch',
    backgroundColor: '#FBE9E7',
    borderRadius: radius.md,
    padding: 10,
  },
  errorText: { color: '#9A3412', fontSize: 14, fontFamily: fonts.medium },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    borderWidth: 1,
    borderColor: colors.frameLight,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { color: colors.frameDark, fontSize: 14, fontFamily: fonts.bold },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.regular,
    backgroundColor: '#FFFFFF',
  },
  sendBtn: {
    backgroundColor: colors.frame,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
});
