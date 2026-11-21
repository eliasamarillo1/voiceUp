import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Occurrence, Song } from '../data/types';
import { techniqueById } from '../data/techniques';
import { colors, radius, sectionColors } from '../theme';

/**
 * "Mapa" de la canción: la estructura en bloques de colores, los recursos vocales como puntos
 * encima, y la línea de reproducción. Tocar el mapa salta a ese momento.
 */
export function SongMap({
  song,
  time,
  onSeek,
  onOccurrence,
}: {
  song: Song;
  time: number;
  onSeek: (t: number) => void;
  onOccurrence?: (o: Occurrence) => void;
}) {
  const [width, setWidth] = useState(1);
  const pct = (t: number) => `${(t / song.duration) * 100}%` as const;

  return (
    <View>
      <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)}>
        <View style={styles.markers}>
          {song.occurrences.map((o, i) => {
            const t = techniqueById(o.techniqueId);
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${t?.name} en "${o.word}"`}
                onPress={() => (onOccurrence ? onOccurrence(o) : onSeek(o.start))}
                hitSlop={6}
                style={[styles.marker, { left: pct(o.start), backgroundColor: t?.color }]}
              />
            );
          })}
        </View>
        <Pressable
          accessibilityRole="adjustable"
          accessibilityLabel="Mapa de la canción"
          onPress={(e) => onSeek((e.nativeEvent.locationX / width) * song.duration)}
          style={styles.bar}
        >
          {song.sections.map((s, i) => {
            const active = time >= s.start && time < s.end;
            return (
              <View
                key={i}
                pointerEvents="none"
                style={[
                  styles.block,
                  {
                    flex: s.end - s.start,
                    backgroundColor: sectionColors[s.type],
                    opacity: active ? 1 : 0.55,
                  },
                ]}
              >
                <Text numberOfLines={1} style={styles.blockText}>
                  {s.label}
                </Text>
              </View>
            );
          })}
          <View pointerEvents="none" style={[styles.playhead, { left: pct(time) }]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  markers: { height: 18, position: 'relative', marginBottom: 6 },
  marker: {
    position: 'absolute',
    top: 3,
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  bar: {
    flexDirection: 'row',
    height: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
    gap: 2,
    position: 'relative',
  },
  block: { justifyContent: 'center', paddingHorizontal: 6 },
  blockText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    marginLeft: -1.5,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
});
