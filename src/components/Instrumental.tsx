// Pestaña «Instrumental»: acordes para tocar la canción con un instrumento.
// Las canciones de ejemplo (dominio público) traen sus acordes aquí mismo. Para el resto,
// los acordes tienen licencia, así que enlazamos a webs especializadas con la búsqueda hecha.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChordPart } from '../data/chords';
import { Body, Card, LinkButton } from './ui';
import { colors, fonts, radius } from '../theme';

const NOTES = ['Do', 'Do#', 'Re', 'Mib', 'Mi', 'Fa', 'Fa#', 'Sol', 'Lab', 'La', 'Sib', 'Si'];
const ALIASES: Record<string, number> = {
  Do: 0, 'Do#': 1, Reb: 1, Re: 2, 'Re#': 3, Mib: 3, Mi: 4, Fa: 5, 'Fa#': 6, Solb: 6,
  Sol: 7, 'Sol#': 8, Lab: 8, La: 9, 'La#': 10, Sib: 10, Si: 11,
};

/** "Mim" + 2 → "Fa#m"; "Re7" − 2 → "Do7". */
export function transposeChord(chord: string, semitones: number) {
  const m = chord.match(/^(Do|Re|Mi|Fa|Sol|La|Si)(#|b)?(.*)$/);
  if (!m) return chord;
  const i = ALIASES[m[1] + (m[2] ?? '')];
  if (i === undefined) return chord;
  return NOTES[(((i + semitones) % 12) + 12) % 12] + m[3];
}

const ug = (q: string) =>
  `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(q)}`;
const chordify = (q: string) => `https://chordify.net/search/${encodeURIComponent(q)}`;
const tutorial = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} acordes tutorial`)}`;

export function Instrumental({
  query,
  songKey,
  keyOrigin,
  parts,
  tip,
}: {
  /** Título y artista, para las búsquedas. */
  query: string;
  songKey?: string;
  keyOrigin?: string;
  parts?: ChordPart[];
  tip?: string;
}) {
  const [shift, setShift] = useState(0);
  return (
    <View style={{ gap: 14 }}>
      {parts ? (
        <Card style={{ gap: 14 }}>
          <View style={styles.headRow}>
            <View style={{ flex: 1, minWidth: 180 }}>
              <Text style={styles.title}>Acordes</Text>
              <Text style={styles.small}>
                Versión sencilla
                {songKey ? ` en ${shift ? transposeChord(songKey, shift) : songKey}` : ''}. Canción de
                dominio público.
              </Text>
            </View>
            <View style={styles.shiftRow}>
              <ShiftBtn label="−" onPress={() => setShift((s) => s - 1)} a11y="Bajar medio tono" />
              <Text style={styles.shiftText}>{shift === 0 ? 'Tono original' : `${shift > 0 ? '+' : ''}${shift}`}</Text>
              <ShiftBtn label="+" onPress={() => setShift((s) => s + 1)} a11y="Subir medio tono" />
            </View>
          </View>
          {parts.map((p, i) => (
            <View key={i} style={{ gap: 8 }}>
              <Text style={styles.partLabel}>{p.label}</Text>
              <View style={styles.bars}>
                {p.bars.map((c, j) => (
                  <View key={j} style={styles.bar}>
                    <Text style={styles.chord}>{transposeChord(c, shift)}</Text>
                  </View>
                ))}
              </View>
              {p.note ? <Text style={styles.small}>{p.note}</Text> : null}
            </View>
          ))}
          {tip ? <Text style={styles.small}>Consejo: {tip}</Text> : null}
          <Text style={styles.small}>
            Usa − y + para cambiar el tono y que te quede cómodo al cantar. Cada cuadro es un compás.
          </Text>
        </Card>
      ) : (
        <Card style={{ gap: 10 }}>
          <Text style={styles.title}>Acordes</Text>
          {songKey ? (
            <Body>
              La canción está en <Text style={styles.strong}>{songKey}</Text>
              {keyOrigin ? ` (${keyOrigin})` : ''}. Los acordes de esta canción tienen derechos de autor,
              así que los puedes consultar en webs especializadas que tienen licencia:
            </Body>
          ) : (
            <Body>
              Los acordes de esta canción tienen derechos de autor, así que los puedes consultar en webs
              especializadas que tienen licencia:
            </Body>
          )}
        </Card>
      )}

      <View style={styles.links}>
        <LinkButton label="Acordes en Ultimate Guitar" url={ug(query)} />
        <LinkButton label="Acordes en Chordify" url={chordify(query)} />
        <LinkButton label="Tutorial en YouTube" url={tutorial(query)} tone="youtube" />
      </View>
      <Text style={styles.small}>
        Chordify saca los acordes del audio y deja tocar encima de la canción; Ultimate Guitar tiene
        versiones escritas por músicos, con tablaturas.
      </Text>
    </View>
  );
}

function ShiftBtn({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [styles.shiftBtn, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      <Text style={styles.shiftBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  title: { color: colors.frameDark, fontSize: 18, fontFamily: fonts.heavy },
  small: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
  strong: { color: colors.text, fontFamily: fonts.heavy },
  partLabel: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  bars: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bar: {
    minWidth: 64,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  chord: { color: colors.frameDark, fontSize: 17, fontFamily: fonts.heavy },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shiftBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.frameDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBtnText: { color: '#FFFFFF', fontSize: 20, fontFamily: fonts.heavy, marginTop: -2 },
  shiftText: { color: colors.text, fontSize: 14, fontFamily: fonts.bold, minWidth: 92, textAlign: 'center' },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
