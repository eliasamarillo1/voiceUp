import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reloj de reproducción del prototipo. Todavía no hay audio propio (la canción completa se abre en
 * Spotify o YouTube), así que este reloj simula el avance para sincronizar letra, estructura y recursos.
 * En la versión final se sustituye por el tiempo real del reproductor.
 */
export function usePlaybackClock(duration: number, initial = 0) {
  const [time, setTime] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    last.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - (last.current ?? now)) / 1000;
      last.current = now;
      setTime((t) => {
        const next = t + dt;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, duration]);

  const seek = useCallback(
    (t: number) => setTime(Math.max(0, Math.min(duration, t))),
    [duration],
  );
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p) setTime((t) => (t >= duration ? 0 : t));
      return !p;
    });
  }, [duration]);
  const play = useCallback(() => setPlaying(true), []);

  return { time, playing, toggle, play, seek };
}
