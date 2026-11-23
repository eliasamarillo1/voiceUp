import { useEffect, useRef, useState } from 'react';

/**
 * Título principal que se deshace en píxeles alrededor de un foco.
 *
 * - El texto real va en un <h1> (seleccionable y legible por lectores de pantalla y buscadores);
 *   el lienzo de encima es decorativo (aria-hidden).
 * - En reposo el foco pasea despacio por la palabra; al pasar el ratón lo sigue con un radio mayor
 *   y deja una estela de píxeles que en ~1 s vuelven a ser letras nítidas; al pulsar, los píxeles
 *   estallan hacia fuera un momento. Hay una retícula cuadrada y un indicador del tamaño de bloque.
 * - Cerca del foco los bloques crecen de 8 a 64 px (escalados al tamaño de la letra);
 *   los más grandes se vuelven de color, se desplazan un poco y algunos desaparecen.
 * - Se pausa fuera de pantalla o con la pestaña oculta, limita la resolución y nunca parpadea
 *   más de ~1 vez por segundo. Con «reducir movimiento» se muestra el título quieto.
 */

type Palette = { ink: string; a: string; b: string; grid: string; ui: string };
const PALETTES: Record<string, Palette> = {
  // la descrita: negro, azul eléctrico y rosa intenso
  pixel: { ink: '#111114', a: '#1F3DFF', b: '#FF2E88', grid: 'rgba(17,17,20,0.06)', ui: '#111114' },
  // a juego con la vidriera: tinta, lirio y ámbar
  vidriera: {
    ink: '#23213A',
    a: '#4650AE',
    b: '#E8A93A',
    grid: 'rgba(35,33,58,0.06)',
    ui: '#2F6F6A',
  },
};

const LEVELS = [64, 32, 16, 8];
const FONT = 'Inter_700Bold, Inter, system-ui, sans-serif';

function paletteFromUrl(fallback: string) {
  try {
    const t = new URLSearchParams(window.location.search).get('titulo');
    if (t && t in PALETTES) return t;
  } catch {}
  return fallback;
}

// número pseudoaleatorio estable por celda
const hash = (x: number, y: number, s: number) => {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

export function PixelTitle({
  text,
  maxSize,
  palette = 'pixel',
}: {
  text: string;
  maxSize: number;
  palette?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [reduced, setReduced] = useState(false);
  const pal = PALETTES[paletteFromUrl(palette)] ?? PALETTES.pixel;

  // líneas: en una si cabe, si no en dos mitades por palabras
  const words = text.split(' ');
  const [layout, setLayout] = useState<{ lines: string[]; size: number }>({
    lines: [text],
    size: maxSize,
  });

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setReduced(!!mq?.matches);
    const on = () => setReduced(!!mq?.matches);
    mq?.addEventListener?.('change', on);
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => {
      ro.disconnect();
      mq?.removeEventListener?.('change', on);
    };
  }, []);

  // tamaño fluido: el mayor que quepa sin pasar de maxSize (de móviles de 360 px a escritorio)
  useEffect(() => {
    if (!width) return;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return;
    const measure = (lines: string[], size: number) => {
      ctx.font = `700 ${size}px ${FONT}`;
      return Math.max(...lines.map((l) => ctx.measureText(l).width));
    };
    const half = Math.ceil(words.length / 2);
    const options = [[text], [words.slice(0, half).join(' '), words.slice(half).join(' ')]];
    let best = { lines: options[1], size: 12 };
    for (const lines of options) {
      const size = Math.min(maxSize, Math.floor((maxSize * (width - 4)) / measure(lines, maxSize)));
      // preferimos una línea solo si la letra no queda mucho más pequeña
      if (lines.length === 1 ? size >= maxSize * 0.9 : size > best.size) best = { lines, size };
      if (lines.length === 1 && size >= maxSize * 0.9) break;
    }
    setLayout(best);
  }, [width, text, maxSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const lineH = Math.round(layout.size * 1.08);
  const boxH = lineH * layout.lines.length + Math.round(layout.size * 0.16);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !width || reduced) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1); // resolución moderada
    const W = width;
    const H = boxH;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    const fs = layout.size;
    const unit = Math.max(0.35, fs / 110); // los 8–64 px están pensados para un título de ~110 px

    // máscara con las letras
    const mask = document.createElement('canvas');
    mask.width = cv.width;
    mask.height = cv.height;
    const mctx = mask.getContext('2d')!;
    const drawText = (c: CanvasRenderingContext2D, color: string) => {
      c.save();
      c.scale(dpr, dpr);
      c.fillStyle = color;
      c.font = `700 ${fs}px ${FONT}`;
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      layout.lines.forEach((l, i) => c.fillText(l, W / 2, lineH * i + fs * 0.94));
      c.restore();
    };
    drawText(mctx, '#000');
    const alpha = mctx.getImageData(0, 0, mask.width, mask.height).data;
    const covered = (x: number, y: number) => {
      const px = Math.min(mask.width - 1, Math.max(0, Math.round(x * dpr)));
      const py = Math.min(mask.height - 1, Math.max(0, Math.round(y * dpr)));
      return alpha[(py * mask.width + px) * 4 + 3] > 110;
    };
    // cobertura por celda para cada tamaño de bloque (muestreo en 5 puntos)
    const cells = new Map<number, Uint8Array>();
    for (const L of LEVELS) {
      const s = L * unit;
      const cols = Math.ceil(W / s);
      const rows = Math.ceil(H / s);
      const g = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = c * s;
          const y = r * s;
          let n = 0;
          for (const [u, v] of [
            [0.5, 0.5],
            [0.2, 0.2],
            [0.8, 0.2],
            [0.2, 0.8],
            [0.8, 0.8],
          ])
            if (covered(x + u * s, y + v * s)) n++;
          g[r * cols + c] = n >= (L >= 32 ? 1 : 2) ? 1 : 0;
        }
      cells.set(L, g);
    }

    // estado del foco
    let hovering = false;
    let px = W / 2;
    let py = H / 2;
    const trail: { x: number; y: number; t: number }[] = [];
    let burstAt = -1e9;
    let fx = W / 2;
    let fy = H / 2;
    let rad = fs * 0.75;

    const onMove = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      px = e.clientX - b.left;
      py = e.clientY - b.top;
      hovering = true;
      const now = performance.now();
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(last.x - px, last.y - py) > fs * 0.12)
        trail.push({ x: px, y: py, t: now });
      if (trail.length > 40) trail.shift();
    };
    const onLeave = () => (hovering = false);
    const onDown = () => (burstAt = performance.now());
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerleave', onLeave);
    cv.addEventListener('pointerdown', onDown);

    let raf = 0;
    let visible = true;
    let running = false;
    const start = performance.now();

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      const t = (now - start) / 1000;
      // en reposo el foco pasea despacio con radio pequeño; con el ratón lo sigue con radio mayor
      const tx = hovering ? px : W / 2 + W * 0.36 * Math.sin(t * 0.23) * Math.cos(t * 0.07);
      const ty = hovering ? py : H / 2 + H * 0.3 * Math.sin(t * 0.41 + 1);
      fx += (tx - fx) * (hovering ? 0.25 : 0.05);
      fy += (ty - fy) * (hovering ? 0.25 : 0.05);
      rad += ((hovering ? fs * 1.25 : fs * 0.75) - rad) * 0.08;

      // focos: el principal y la estela, que se encoge en ~1 s
      const foci: { x: number; y: number; r: number; k: number }[] = [
        { x: fx, y: fy, r: rad, k: 1 },
      ];
      while (trail.length && now - trail[0].t > 1000) trail.shift();
      for (const p of trail) {
        const k = 1 - (now - p.t) / 1000;
        foci.push({ x: p.x, y: p.y, r: rad * 0.7 * k, k: k * 0.8 });
      }
      const burst = Math.max(0, 1 - (now - burstAt) / 450);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      // rejilla de píxeles tenue
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1 / dpr;
      const gs = 8 * unit * 2;
      ctx.beginPath();
      for (let x = (W / 2) % gs; x < W; x += gs) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, H);
      }
      for (let y = 0; y < H; y += gs) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(W, Math.round(y) + 0.5);
      }
      ctx.stroke();

      // letras nítidas, con huecos donde están los focos
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawText(ctx, pal.ink);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const f of foci) {
        if (f.r < 2) continue;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // bloques: el tamaño crece con la cercanía al foco
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const influence = (x: number, y: number) => {
        let best = 0;
        for (const f of foci) {
          if (f.r < 2) continue;
          const d = Math.hypot(x - f.x, y - f.y);
          if (d < f.r) best = Math.max(best, f.k * (1 - d / f.r) + 0.001);
        }
        return best;
      };
      const levelOf = (I: number) => (I > 0.72 ? 64 : I > 0.48 ? 32 : I > 0.24 ? 16 : 8);
      let centerLevel = 8;
      for (const L of LEVELS) {
        const s = L * unit;
        const cols = Math.ceil(W / s);
        const g = cells.get(L)!;
        // solo las celdas dentro de la caja de algún foco
        for (const f of foci) {
          if (f.r < 2) continue;
          const c0 = Math.max(0, Math.floor((f.x - f.r) / s));
          const c1 = Math.min(cols - 1, Math.floor((f.x + f.r) / s));
          const r0 = Math.max(0, Math.floor((f.y - f.r) / s));
          const r1 = Math.min(Math.ceil(H / s) - 1, Math.floor((f.y + f.r) / s));
          for (let r = r0; r <= r1; r++)
            for (let c = c0; c <= c1; c++) {
              if (!g[r * cols + c]) continue;
              const cx = (c + 0.5) * s;
              const cy = (r + 0.5) * s;
              const I = influence(cx, cy);
              if (I <= 0 || levelOf(I) !== L) continue;
              // evita pintar dos veces la misma celda desde focos solapados
              if (f !== foci.find((q) => q.r >= 2 && Math.hypot(cx - q.x, cy - q.y) < q.r))
                continue;
              const h = hash(c, r, L);
              let x = c * s;
              let y = r * s;
              let fill = pal.ink;
              if (L === 64) {
                fill = h < 0.5 ? pal.a : pal.b;
                // algunos bloques grandes se caen; cambian como mucho ~1 vez por segundo
                if (hash(c, r, Math.floor(t * 0.9 + h * 7)) < 0.22) continue;
                x += Math.sin(t * 1.3 + h * 9) * s * 0.06;
                y += Math.cos(t * 1.1 + h * 5) * s * 0.06;
              } else if (L === 32 && h < 0.18) {
                fill = h < 0.09 ? pal.a : pal.b;
              }
              if (burst > 0) {
                const dx = cx - fx;
                const dy = cy - fy;
                const d = Math.hypot(dx, dy) || 1;
                x += (dx / d) * burst * s * 1.6;
                y += (dy / d) * burst * s * 1.6;
              }
              ctx.fillStyle = fill;
              ctx.fillRect(x, y, s - Math.max(0.6, s * 0.06), s - Math.max(0.6, s * 0.06));
            }
        }
      }
      centerLevel = levelOf(influence(fx, fy));

      // retícula y lectura del tamaño de bloque
      const rs = 12;
      ctx.strokeStyle = pal.ui;
      ctx.lineWidth = 1.25;
      ctx.strokeRect(Math.round(fx - rs / 2) + 0.5, Math.round(fy - rs / 2) + 0.5, rs, rs);
      ctx.fillStyle = pal.ui;
      ctx.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 2, 2);
      ctx.font = `600 ${Math.max(10, Math.round(fs * 0.11))}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const label = `${centerLevel}px`;
      const lx = Math.min(W - 40, fx + rs);
      const ly = Math.min(H - 14, fy + rs * 0.6);
      ctx.fillText(label, lx, ly);

      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!running && visible && !document.hidden) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    // se pausa fuera de pantalla
    const io = new IntersectionObserver((es) => {
      visible = es[0]?.isIntersecting ?? true;
      if (visible) kick();
    });
    io.observe(cv);
    const onVis = () => kick();
    document.addEventListener('visibilitychange', onVis);
    // no bloquea la carga: empieza cuando el navegador está libre
    const idle = (window as any).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 60));
    idle(kick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      running = false;
      visible = false;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerleave', onLeave);
      cv.removeEventListener('pointerdown', onDown);
    };
  }, [width, boxH, layout, reduced, pal, lineH]);

  return (
    <div ref={wrap} style={{ position: 'relative', width: '100%', height: boxH }}>
      <h1
        style={{
          margin: 0,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: layout.size,
          lineHeight: `${lineH}px`,
          textAlign: 'center',
          color: reduced ? pal.ink : 'transparent',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {layout.lines.map((l, i) => (
          <span key={i} style={{ display: 'block' }}>
            {l}
          </span>
        ))}
      </h1>
      {!reduced && (
        <canvas
          ref={canvas}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: boxH,
            touchAction: 'pan-y',
            cursor: 'crosshair',
          }}
        />
      )}
    </div>
  );
}
