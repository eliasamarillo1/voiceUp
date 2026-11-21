import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reloj de reproducción del prototipo. Todavía no hay audio propio (la canción completa se abre en
 * Spotify o YouTube), así que este reloj simula el avance para sincronizar letra, estructura y recursos.
 * En la versión final se sustituye por el tiempo real del reproductor.
 */
export function usePlaybackClock(duration: number, initial = 0) {
  const [time, setTimeState] = useState(initial);
  const [playing, setPlaying] = useState(false);
  // Guardamos el tiempo también en una referencia para calcular el siguiente valor sin
  // actualizar un estado desde dentro de la actualización de otro.
  const timeRef = useRef(initial);
  const last = useRef<number | null>(null);

  const setTime = useCallback((t: number) => {
    timeRef.current = t;
    setTimeState(t);
  }, []);

  useEffect(() => {
    if (!playing) return;
    last.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - (last.current ?? now)) / 1000;
      last.current = now;
      const next = timeRef.current + dt;
      if (next >= duration) {
        setTime(duration);
        setPlaying(false);
      } else {
        setTime(next);
      }
    }, 100);
    return () => clearInterval(id);
  }, [playing, duration, setTime]);

  const seek = useCallback(
    (t: number) => setTime(Math.max(0, Math.min(duration, t))),
    [duration, setTime],
  );
  const toggle = useCallback(() => {
    if (!playing && timeRef.current >= duration) setTime(0);
    setPlaying(!playing);
  }, [playing, duration, setTime]);
  const play = useCallback(() => setPlaying(true), []);

  return { time, playing, toggle, play, seek };
}
