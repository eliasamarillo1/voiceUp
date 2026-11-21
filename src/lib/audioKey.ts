// Estima la tonalidad y el tempo escuchando un fragmento de audio (solo en la web).
//
// Tonalidad: se mide cuánta energía tiene cada una de las 12 notas (cromagrama) y se compara con
// los perfiles de tonalidad de Krumhansl y Kessler, un método clásico de la psicología musical.
// Tempo: se buscan los golpes de energía (ataques) y la distancia que más se repite entre ellos.
// Con 30 segundos es una estimación: no ve los cambios de tono que pasen fuera del fragmento.

const NOTES = ['Do', 'Do#', 'Re', 'Mib', 'Mi', 'Fa', 'Fa#', 'Sol', 'Lab', 'La', 'Sib', 'Si'];
const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export interface AudioEstimate {
  key: string;
  /** 0 a 1: cuánto destaca la tonalidad elegida frente a la siguiente. */
  keyConfidence: number;
  bpm: number;
  bpmConfidence: number;
}

const RATE = 11025;

/** FFT in situ (radix 2). re e im tienen longitud potencia de 2. */
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

function spectrum(samples: Float32Array, start: number, size: number, window: Float64Array) {
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  for (let i = 0; i < size; i++) re[i] = (samples[start + i] ?? 0) * window[i];
  fft(re, im);
  const mag = new Float64Array(size / 2);
  for (let i = 0; i < size / 2; i++) mag[i] = Math.hypot(re[i], im[i]);
  return mag;
}

const hann = (n: number) => {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
  return w;
};

function pearson(a: number[], b: number[]) {
  const ma = a.reduce((s, x) => s + x, 0) / a.length;
  const mb = b.reduce((s, x) => s + x, 0) / b.length;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db || 1);
}

/** Tonalidad a partir de muestras mono a 11 025 Hz. */
export function estimateKey(samples: Float32Array) {
  const size = 4096;
  const w = hann(size);
  const chroma = new Array(12).fill(0);
  // Para cada cubeta de la FFT, la nota que le corresponde (entre 65 Hz y 2 kHz).
  const pc = new Int8Array(size / 2).fill(-1);
  for (let k = 1; k < size / 2; k++) {
    const f = (k * RATE) / size;
    if (f < 65 || f > 2000) continue;
    const midi = 69 + 12 * Math.log2(f / 440);
    pc[k] = ((Math.round(midi) % 12) + 12) % 12;
  }
  for (let start = 0; start + size <= samples.length; start += size / 2) {
    const mag = spectrum(samples, start, size, w);
    const frame = new Array(12).fill(0);
    for (let k = 0; k < mag.length; k++) if (pc[k] >= 0) frame[pc[k]] += Math.log1p(mag[k]);
    const max = Math.max(...frame) || 1;
    for (let i = 0; i < 12; i++) chroma[i] += frame[i] / max;
  }
  const scores: { key: string; r: number }[] = [];
  for (let root = 0; root < 12; root++) {
    const rot = (p: number[]) => p.map((_, i) => p[(i - root + 12) % 12]);
    scores.push({ key: `${NOTES[root]} mayor`, r: pearson(chroma, rot(MAJOR)) });
    scores.push({ key: `${NOTES[root]} menor`, r: pearson(chroma, rot(MINOR)) });
  }
  scores.sort((a, b) => b.r - a.r);
  const [best, second] = scores;
  const confidence = Math.max(0, Math.min(1, (best.r - second.r) * 8 + best.r * 0.4));
  return { key: best.key, confidence, ranking: scores.slice(0, 3) };
}

/** Tempo a partir de muestras mono a 11 025 Hz. */
export function estimateTempo(samples: Float32Array) {
  const size = 1024;
  const hop = 256;
  const fps = RATE / hop;
  const w = hann(size);
  const flux: number[] = [];
  let prev: Float64Array | undefined;
  for (let start = 0; start + size <= samples.length; start += hop) {
    const mag = spectrum(samples, start, size, w);
    for (let i = 0; i < mag.length; i++) mag[i] = Math.log1p(mag[i] * 10);
    let f = 0;
    if (prev) for (let i = 0; i < mag.length; i++) f += Math.max(0, mag[i] - prev[i]);
    flux.push(f);
    prev = mag;
  }
  // Quitamos la tendencia lenta para quedarnos con los ataques.
  const env = flux.map((v, i) => {
    let s = 0;
    let c = 0;
    for (let j = Math.max(0, i - 8); j <= Math.min(flux.length - 1, i + 8); j++) {
      s += flux[j];
      c++;
    }
    return Math.max(0, v - s / c);
  });
  const minLag = Math.floor((60 * fps) / 190);
  const maxLag = Math.ceil((60 * fps) / 55);
  const ac: number[] = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < env.length; i++) s += env[i] * env[i + lag];
    ac.push(s);
  }
  let bestLag = minLag;
  let bestScore = -Infinity;
  let total = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = (60 * fps) / lag;
    // Preferencia suave por tempos cercanos a 110 BPM, como hace el oído humano.
    const weight = Math.exp(-0.5 * (Math.log2(bpm / 110) / 0.9) ** 2);
    const score = ac[lag] * weight;
    total += score;
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }
  // Interpolación parabólica para afinar entre dos retardos.
  const y0 = ac[bestLag - 1] ?? ac[bestLag];
  const y1 = ac[bestLag];
  const y2 = ac[bestLag + 1] ?? ac[bestLag];
  const d = y0 - 2 * y1 + y2 === 0 ? 0 : (0.5 * (y0 - y2)) / (y0 - 2 * y1 + y2);
  const bpm = (60 * fps) / (bestLag + Math.max(-0.5, Math.min(0.5, d)));
  const mean = total / (maxLag - minLag + 1);
  const confidence = Math.max(0, Math.min(1, (bestScore / (mean || 1) - 1) / 3));
  return { bpm: Math.round(bpm), confidence };
}

/** Descarga el fragmento, lo convierte a mono a 11 025 Hz y lo analiza. Solo funciona en la web. */
export async function analyzeAudio(url: string): Promise<AudioEstimate> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`audio ${res.status}`);
  const data = await res.arrayBuffer();
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(data);
  } finally {
    ctx.close();
  }
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * RATE), RATE);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const mono = (await offline.startRendering()).getChannelData(0);
  const key = estimateKey(mono);
  const tempo = estimateTempo(mono);
  return {
    key: key.key,
    keyConfidence: key.confidence,
    bpm: tempo.bpm,
    bpmConfidence: tempo.confidence,
  };
}
