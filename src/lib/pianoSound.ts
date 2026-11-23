import { Platform } from 'react-native';
import { midiFreq } from './notes';

// Sonido de piano sintetizado con Web Audio (solo en la web). Mezcla varios armónicos con un ataque
// rápido y una caída larga, que es lo que hace que suene a cuerda golpeada y no a pitido.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

const PARTIALS = [
  { mult: 1, gain: 1 },
  { mult: 2, gain: 0.42 },
  { mult: 3, gain: 0.2 },
  { mult: 4, gain: 0.1 },
  { mult: 5.02, gain: 0.05 },
];

/** Toca una nota (número MIDI). Devuelve una función para soltarla antes de tiempo. */
export function playNote(midi: number): () => void {
  const ac = audio();
  if (!ac || !master) return () => {};
  const f = midiFreq(midi);
  const now = ac.currentTime;
  // Las notas graves duran más; las agudas se apagan antes, como en un piano real.
  const decay = Math.max(1.2, Math.min(4, 6 - (midi - 48) * 0.07));

  const voice = ac.createGain();
  voice.gain.setValueAtTime(0, now);
  voice.gain.linearRampToValueAtTime(0.32, now + 0.006);
  voice.gain.exponentialRampToValueAtTime(0.12, now + 0.25);
  voice.gain.exponentialRampToValueAtTime(0.0008, now + decay);

  const tone = ac.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.setValueAtTime(Math.min(9000, f * 9), now);
  tone.frequency.exponentialRampToValueAtTime(Math.max(600, f * 2.5), now + 0.8);
  tone.Q.value = 0.4;

  voice.connect(tone);
  tone.connect(master);

  const oscs = PARTIALS.map((p, i) => {
    const o = ac.createOscillator();
    o.type = i === 0 ? 'triangle' : 'sine';
    o.frequency.value = f * p.mult;
    const g = ac.createGain();
    // Los armónicos altos se apagan antes que la fundamental.
    g.gain.setValueAtTime(p.gain, now);
    g.gain.exponentialRampToValueAtTime(p.gain * 0.05 + 0.0001, now + decay / (1 + i * 0.8));
    o.connect(g);
    g.connect(voice);
    o.start(now);
    o.stop(now + decay + 0.05);
    return o;
  });

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const t = ac.currentTime;
    voice.gain.cancelScheduledValues(t);
    voice.gain.setValueAtTime(Math.max(voice.gain.value, 0.0008), t);
    voice.gain.exponentialRampToValueAtTime(0.0008, t + 0.35);
    oscs.forEach((o) => {
      try {
        o.stop(t + 0.4);
      } catch {
        // ya estaba parado
      }
    });
  };
}

export const pianoSoundAvailable = () => Platform.OS === 'web';
