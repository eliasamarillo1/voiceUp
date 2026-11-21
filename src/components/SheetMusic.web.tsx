import { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// Dibuja una partitura MusicXML con OpenSheetMusicDisplay (solo web en el prototipo).
export function SheetMusic({ musicXml }: { musicXml: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
        if (!ref.current || cancelled) return;
        ref.current.innerHTML = '';
        const osmd = new OpenSheetMusicDisplay(ref.current, {
          autoResize: true,
          drawTitle: false,
          drawPartNames: false,
        });
        await osmd.load(musicXml);
        if (!cancelled) osmd.render();
      } catch (e) {
        if (!cancelled) setError('No se pudo dibujar la partitura.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [musicXml]);

  return (
    <View style={styles.paper}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <div ref={ref} style={{ width: '100%' }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { color: colors.text },
});
