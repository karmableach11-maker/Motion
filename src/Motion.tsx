import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  random,
} from 'remotion';

/**
 * AURA — Neural AI Inference Console
 * Direction: PREMIUM. A dark, glassmorphic AI/ML console laid on a floating
 * perspective plane, flown over by a slow cinematic parallax camera. Centerpiece
 * is a live inference network whose edges and nodes light up as activation waves
 * flow left→right; supported by an attention heatmap, output-confidence bars, a
 * streaming token belt, throughput and inference-pipeline panels.
 * Fully deterministic + seamless loop: every time value is periodic in t∈[0,1).
 */

const TAU = Math.PI * 2;

const C = {
  ink: '#eaf2ff',
  sub: 'rgba(196,214,248,0.66)',
  faint: 'rgba(150,182,238,0.34)',
  cyan: '#37e7ff',
  teal: '#2af0c2',
  blue: '#4f8bff',
  violet: '#9a74ff',
  magenta: '#ff5fd0',
  amber: '#ffcf6b',
  grid: 'rgba(120,170,255,0.07)',
  gridHi: 'rgba(120,180,255,0.16)',
};

// ---------- helpers ----------
const hexA = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(s, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const nf = (v: number, d = 0) =>
  v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d});

type Comp = {f: number; h: number; a: number; p: number};

// value of a loopable multi-sine field at normalized position fx∈[0,1]
const waveVal = (fx: number, comps: Comp[], base: number, t: number) => {
  let v = base;
  for (const c of comps) v += c.a * Math.sin(TAU * (c.f * fx + c.h * t + c.p));
  return clamp(v, 0.05, 0.95);
};

// sampled points mapped into [x0,x1]×[bottom..top]
const wavePts = (
  n: number,
  x0: number,
  x1: number,
  yTop: number,
  yBot: number,
  comps: Comp[],
  base: number,
  t: number
): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const fx = i / (n - 1);
    const v = waveVal(fx, comps, base, t);
    pts.push([x0 + fx * (x1 - x0), yBot - v * (yBot - yTop)]);
  }
  return pts;
};

// Catmull-Rom → cubic bezier for silky curves
const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

// linear blend between two rgb triplets → css rgb()
const mix = (a: [number, number, number], b: [number, number, number], f: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;

const FONT =
  '"Inter","SF Pro Display","Helvetica Neue",Arial,system-ui,sans-serif';
const MONO =
  '"SF Mono","JetBrains Mono","Roboto Mono",ui-monospace,Menlo,monospace';

// reusable layered glow filter
const Glow: React.FC<{id: string; b1?: number; b2?: number}> = ({id, b1 = 2.4, b2 = 7}) => (
  <filter id={id} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation={b2} result="g2" />
    <feGaussianBlur in="SourceGraphic" stdDeviation={b1} result="g1" />
    <feMerge>
      <feMergeNode in="g2" />
      <feMergeNode in="g1" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

const PulseDot: React.FC<{color: string; t: number; size?: number}> = ({color, t, size = 7}) => {
  const p = 0.5 + 0.5 * Math.sin(TAU * (2 * t));
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${6 + p * 8}px ${hexA(color, 0.7 + p * 0.3)}, 0 0 2px ${color}`,
        opacity: 0.65 + p * 0.35,
        display: 'inline-block',
      }}
    />
  );
};

const Brackets: React.FC<{accent: string}> = ({accent}) => {
  const col = hexA(accent, 0.55);
  const s: React.CSSProperties = {position: 'absolute', width: 15, height: 15, pointerEvents: 'none'};
  return (
    <>
      <span style={{...s, left: 12, top: 12, borderLeft: `1.5px solid ${col}`, borderTop: `1.5px solid ${col}`, borderTopLeftRadius: 4}} />
      <span style={{...s, right: 12, bottom: 12, borderRight: `1.5px solid ${col}`, borderBottom: `1.5px solid ${col}`, borderBottomRightRadius: 4}} />
    </>
  );
};

const cardStyle = (accent: string): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 20,
  overflow: 'hidden',
  background:
    'linear-gradient(155deg, rgba(28,44,80,0.60) 0%, rgba(13,22,44,0.66) 52%, rgba(9,15,32,0.74) 100%)',
  boxShadow: `inset 0 1px 0 rgba(196,222,255,0.16), inset 0 0 70px rgba(24,46,92,0.30), 0 36px 74px -32px rgba(0,0,0,0.82), 0 0 0 1px rgba(122,170,255,0.16), 0 0 48px ${hexA(accent, 0.14)}`,
});

const Frame: React.FC<{
  x: number; y: number; w: number; h: number; z: number;
  accent: string; title: string; tag?: string; t: number;
  children: (cw: number, ch: number) => React.ReactNode;
}> = ({x, y, w, h, z, accent, title, tag = 'LIVE', t, children}) => {
  const PADX = 22, HEADER = 52, PADB = 20;
  const cw = w - PADX * 2, ch = h - HEADER - PADB;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateZ(${z}px)`, backfaceVisibility: 'hidden'}}>
      <div style={cardStyle(accent)}>
        <div style={{position: 'absolute', left: PADX, right: PADX, top: 0, height: HEADER, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{fontFamily: FONT, fontSize: 12.5, letterSpacing: 2.4, fontWeight: 600, color: C.ink, textTransform: 'uppercase', opacity: 0.92}}>{title}</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <PulseDot color={accent} t={t} />
            <span style={{fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6, color: C.faint, fontWeight: 500}}>{tag}</span>
          </span>
        </div>
        <div style={{position: 'absolute', left: PADX, right: PADX, top: HEADER - 1, height: 1, background: `linear-gradient(90deg, ${hexA(accent, 0.42)}, rgba(120,170,255,0.05))`}} />
        <Brackets accent={accent} />
        <div style={{position: 'absolute', left: PADX, top: HEADER, width: cw, height: ch}}>
          {children(cw, ch)}
        </div>
      </div>
    </div>
  );
};

// ---------- HERO: inference network ----------
const LAYERS = [5, 7, 7, 5, 3];
const PAL_LAYER = [C.teal, C.cyan, C.cyan, C.violet, C.magenta];

type Node = {x: number; y: number; layer: number};

const NeuralGraph: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const padL = 60, padR = 60, padT = 96, padB = 46;
  const xL = padL, xR = cw - padR, yT = padT, yB = ch - padB;
  const nL = LAYERS.length;

  // node positions per layer
  const cols: Node[][] = [];
  for (let l = 0; l < nL; l++) {
    const count = LAYERS[l];
    const x = xL + (l / (nL - 1)) * (xR - xL);
    const col: Node[] = [];
    for (let i = 0; i < count; i++) {
      const y = count === 1 ? (yT + yB) / 2 : yT + (i / (count - 1)) * (yB - yT);
      col.push({x, y, layer: l});
    }
    cols.push(col);
  }

  // activation wave travelling L→R through layers (seamless, sharpened)
  const layerAct = (l: number) => {
    const v = 0.5 + 0.5 * Math.sin(TAU * (t - (l / (nL - 1)) * 0.85));
    return v * v * v;
  };

  // edges (pruned for clarity)
  type Edge = {a: Node; b: Node; w: number; packet: boolean; phase: number; mid: number};
  const edges: Edge[] = [];
  for (let l = 0; l < nL - 1; l++) {
    for (let i = 0; i < cols[l].length; i++) {
      for (let j = 0; j < cols[l + 1].length; j++) {
        const w = random(`w${l}-${i}-${j}`);
        if (w < 0.2) continue;
        edges.push({
          a: cols[l][i],
          b: cols[l + 1][j],
          w,
          packet: random(`pk${l}-${i}-${j}`) > 0.6,
          phase: random(`ph${l}-${i}-${j}`),
          mid: 0.5 * (layerAct(l) + layerAct(l + 1)),
        });
      }
    }
  }

  const conf = 0.94 + 0.032 * Math.sin(TAU * t) + 0.008 * Math.sin(TAU * 3 * t + 1);
  const labels = ['INPUT', 'H1', 'H2', 'H3', 'OUT'];

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Glow id="ng_node" b1={2.2} b2={8} />
          <Glow id="ng_pkt" b1={1.4} b2={4.5} />
        </defs>

        {/* edges */}
        {edges.map((e, k) => {
          const toOut = e.b.layer === nL - 1;
          const col = toOut ? C.violet : C.cyan;
          const op = 0.05 + e.w * 0.09 + e.mid * (0.22 + e.w * 0.34);
          const sw = 0.55 + e.w * 0.7 + e.mid * 0.9;
          return (
            <line
              key={'e' + k}
              x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y}
              stroke={hexA(col, op)} strokeWidth={sw} strokeLinecap="round"
              filter={e.mid > 0.55 ? 'url(#ng_pkt)' : undefined}
            />
          );
        })}

        {/* travelling signal packets */}
        {edges.map((e, k) => {
          if (!e.packet) return null;
          const s = (t * 2 + e.phase) % 1;
          const env = Math.sin(Math.PI * s);
          const op = env * (0.18 + 0.82 * e.mid) * (0.55 + 0.45 * e.w);
          if (op < 0.04) return null;
          const px = e.a.x + (e.b.x - e.a.x) * s;
          const py = e.a.y + (e.b.y - e.a.y) * s;
          const toOut = e.b.layer === nL - 1;
          return (
            <circle key={'p' + k} cx={px} cy={py} r={2.4 + env * 1.1} fill={toOut ? C.magenta : C.teal} opacity={op} filter="url(#ng_pkt)" />
          );
        })}

        {/* nodes */}
        {cols.map((col, l) =>
          col.map((nd, i) => {
            const act = layerAct(l);
            const base = PAL_LAYER[l];
            const r = 6.5 + act * 3.2;
            const on = act > 0.32;
            return (
              <g key={`n${l}-${i}`}>
                {act > 0.5 && (
                  <circle cx={nd.x} cy={nd.y} r={r + 6 + act * 8} fill="none" stroke={hexA(base, 0.16 * act)} strokeWidth={1.2} />
                )}
                <circle cx={nd.x} cy={nd.y} r={r + 4} fill={hexA(base, 0.10 + 0.18 * act)} />
                <circle cx={nd.x} cy={nd.y} r={r} fill={hexA(base, 0.5 + 0.5 * act)} filter={on ? 'url(#ng_node)' : undefined} />
                <circle cx={nd.x} cy={nd.y} r={r * 0.42} fill="#ffffff" opacity={0.4 + 0.55 * act} />
              </g>
            );
          })
        )}

        {/* layer captions */}
        {cols.map((col, l) => (
          <text key={'lab' + l} x={col[0].x} y={ch - 14} fill={C.faint} fontFamily={MONO} fontSize={10.5} letterSpacing={1.4} textAnchor="middle">{labels[l]}</text>
        ))}
      </svg>

      {/* corner readout */}
      <div style={{position: 'absolute', left: 2, top: 0}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
          <span style={{fontFamily: MONO, fontSize: 44, fontWeight: 600, color: C.ink, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 26px ${hexA(C.cyan, 0.45)}`}}>{conf.toFixed(3)}</span>
          <span style={{fontFamily: MONO, fontSize: 14, color: C.teal, letterSpacing: 0.5}}>▲ softmax</span>
        </div>
        <div style={{fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: C.faint, textTransform: 'uppercase', marginTop: 2}}>output confidence · forward pass</div>
      </div>
      <div style={{position: 'absolute', right: 2, top: 2, textAlign: 'right', fontFamily: MONO, fontSize: 11, letterSpacing: 1.2, color: C.faint, lineHeight: 1.7}}>
        <div>HEADS 16 · DIM 1024</div>
        <div>32 LAYERS · fp16</div>
      </div>
    </div>
  );
};

// ---------- attention heatmap ----------
const AttentionHeatmap: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const N = 12, gap = 2;
  const side = Math.min(cw, ch) - 28;
  const ox = (cw - side) / 2;
  const oy = 18;
  const cell = (side - gap * (N - 1)) / N;

  const qc = t * N; // query row sweep (0..N), seamless
  const wdist = (a: number, b: number) => {
    const d = Math.abs(a - b);
    return Math.min(d, N - d);
  };
  const dark: [number, number, number] = [22, 44, 82];
  const midc: [number, number, number] = [55, 231, 255];
  const hot: [number, number, number] = [224, 252, 255];

  const cells = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let v = 0.1;
      v += Math.exp(-Math.pow(i - j, 2) / (2 * 1.4 * 1.4)) * 0.68; // diagonal self-attn
      if (j === 0) v += 0.2; // attention-sink column
      if (j === i - 1) v += 0.12; // local previous-token
      v += random(`att${i}-${j}`) * 0.1; // static texture
      const rb = Math.exp(-Math.pow(wdist(i, qc), 2) / 2); // active query glow
      v = v * (0.72 + 0.5 * rb);
      v *= 0.9 + 0.12 * Math.sin(TAU * (t * 2 - (i + j) * 0.06)); // shimmer
      v = clamp(v, 0, 1);
      const fill = v < 0.5 ? mix(dark, midc, v / 0.5) : mix(midc, hot, (v - 0.5) / 0.5);
      cells.push(
        <rect
          key={`c${i}-${j}`}
          x={ox + j * (cell + gap)} y={oy + i * (cell + gap)}
          width={cell} height={cell} rx={2}
          fill={fill} opacity={0.12 + v * 0.86}
        />
      );
    }
  }
  const ai = Math.round(qc) % N;

  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      {cells}
      {/* active query row highlight */}
      <rect x={ox - 2} y={oy + ai * (cell + gap) - 2} width={side + 4} height={cell + 4} rx={3} fill="none" stroke={hexA(C.teal, 0.65)} strokeWidth={1.4} />
      <text x={ox - 8} y={oy + ai * (cell + gap) + cell / 2 + 3} fill={C.teal} fontFamily={MONO} fontSize={11} textAnchor="end">▸</text>
      {/* axis captions */}
      <text x={ox} y={oy - 8} fill={C.faint} fontFamily={MONO} fontSize={10} letterSpacing={1}>KEYS →</text>
      <text x={ox - 10} y={oy + side + 4} fill={C.faint} fontFamily={MONO} fontSize={10} letterSpacing={1} transform={`rotate(-90 ${ox - 10} ${oy + side + 4})`}>QUERIES →</text>
    </svg>
  );
};

// ---------- output confidence bars ----------
const CONF_BASE = [0.41, 0.22, 0.15, 0.1, 0.07, 0.05];

const ConfidenceBars: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const n = CONF_BASE.length;
  const rowH = ch / n;
  const barX = 120, barW = cw - barX - 68;
  const raw = CONF_BASE.map((b, i) => b * (1 + 0.05 * Math.sin(TAU * (t + i * 0.23))));
  const sum = raw.reduce((a, b) => a + b, 0);
  const p = raw.map((v) => v / sum);
  const scale = (barW * 0.99) / Math.max(...p);
  const sweep = t * cw;
  const sheenOp = 0.4 * Math.sin(Math.PI * t);

  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="cb_f" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.blue} stopOpacity="0.55" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="cb_hot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.violet} stopOpacity="0.6" />
          <stop offset="1" stopColor={C.magenta} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="cb_sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <Glow id="cb_glow" b1={2} b2={6} />
        <clipPath id="cb_clip"><rect x={0} y={0} width={cw} height={ch} /></clipPath>
      </defs>
      {p.map((val, i) => {
        const cy = i * rowH + rowH / 2;
        const bw = Math.max(6, val * scale);
        const hot = i === 0;
        const bh = 15;
        return (
          <g key={i}>
            <circle cx={6} cy={cy} r={3.4} fill={hot ? C.magenta : C.cyan} opacity={hot ? 1 : 0.75} filter={hot ? 'url(#cb_glow)' : undefined} />
            <text x={20} y={cy + 4} fill={hot ? C.ink : C.sub} fontFamily={MONO} fontSize={13} fontWeight={hot ? 600 : 400} letterSpacing={0.8}>{'LABEL ' + String(i + 1).padStart(2, '0')}</text>
            <rect x={barX} y={cy - bh / 2} width={barW} height={bh} rx={bh / 2} fill="rgba(120,160,230,0.12)" />
            <g filter={hot ? 'url(#cb_glow)' : undefined}>
              <rect x={barX} y={cy - bh / 2} width={bw} height={bh} rx={bh / 2} fill={hot ? 'url(#cb_hot)' : 'url(#cb_f)'} />
              <rect x={barX} y={cy - bh / 2} width={bw} height={bh / 2} rx={bh / 2} fill="url(#cb_sheen)" />
            </g>
            <text x={cw} y={cy + 4} fill={hot ? C.magenta : C.sub} fontFamily={MONO} fontSize={14} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{(val * 100).toFixed(1)}%</text>
          </g>
        );
      })}
      {/* scan shimmer */}
      <g clipPath="url(#cb_clip)">
        <rect x={sweep - 34} y={0} width={68} height={ch} fill="url(#cb_sheen)" opacity={sheenOp} />
      </g>
    </svg>
  );
};

// ---------- token stream ----------
const TOKPOOL = ['ne', 'ur', 'al', 'in', 'fer', 'att', 'en', 'va', 'lu', 'io', 'st', 're', 'ct', 'em', 'dd', 'pa', 'ss', 'de', 'co', '▁', '##', 'se', 'qk', 'ff'];
const TOK_PAL = [C.cyan, C.teal, C.violet, C.blue];

const TokenStream: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const period = 24; // seamless content period in slots
  const visible = 6;
  const pitch = cw / visible;
  const gap = 16;
  const chipW = pitch - gap;
  const chipH = 48;
  const rowY = ch * 0.30;
  const caretX = cw * 0.72;

  const off = t * period; // slots advanced; integer at t=1 → seamless
  const start = Math.floor(off) - 1;
  const count = visible + 3;

  const chips = [];
  for (let s = 0; s < count; s++) {
    const k = start + s;
    const slot = ((k % period) + period) % period;
    const x = (k - off) * pitch;
    const cx = x + chipW / 2;
    const accent = TOK_PAL[slot % 4];
    const frag = TOKPOOL[(slot * 7) % TOKPOOL.length];
    const frag2 = slot % 3 === 0 ? TOKPOOL[(slot * 5 + 3) % TOKPOOL.length] : '';
    const prob = 0.3 + random('tp' + slot) * 0.68;
    const prox = Math.max(0, 1 - Math.abs(cx - caretX) / (pitch * 0.85));
    const fade = clamp(Math.min(cx + chipW / 2, cw - (cx - chipW / 2)) / 60, 0, 1);
    const op = fade * (0.42 + 0.5 * prox);
    if (op < 0.02) continue;
    chips.push(
      <div key={s} style={{position: 'absolute', left: x, top: rowY - chipH / 2, width: chipW, height: chipH, opacity: op}}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 11,
          background: prox > 0.5
            ? `linear-gradient(160deg, ${hexA(accent, 0.32)}, ${hexA(accent, 0.12)})`
            : 'linear-gradient(160deg, rgba(40,58,98,0.5), rgba(16,26,50,0.5))',
          border: `1px solid ${hexA(accent, 0.3 + 0.5 * prox)}`,
          boxShadow: prox > 0.4 ? `0 0 ${10 + prox * 20}px ${hexA(accent, 0.35 * prox)}, inset 0 1px 0 rgba(210,230,255,0.14)` : 'inset 0 1px 0 rgba(210,230,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{fontFamily: MONO, fontSize: 16, fontWeight: 600, letterSpacing: 0.5, color: prox > 0.4 ? C.ink : C.sub}}>{frag + frag2}</span>
        </div>
        {/* per-token confidence bar */}
        <div style={{position: 'absolute', left: chipW * 0.12, top: chipH + 8, width: chipW * 0.76, height: 4, borderRadius: 2, background: 'rgba(120,160,230,0.14)'}}>
          <div style={{width: `${prob * 100}%`, height: '100%', borderRadius: 2, background: accent, boxShadow: `0 0 6px ${hexA(accent, 0.6)}`}} />
        </div>
      </div>
    );
  }

  const caretBlink = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(TAU * (t * 4)));

  return (
    <div style={{position: 'relative', width: cw, height: ch, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, fontFamily: MONO, fontSize: 11, letterSpacing: 1.6, color: C.faint}}>CONTEXT WINDOW</div>
      <div style={{position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: 7}}>
        <PulseDot color={C.magenta} t={t} size={7} />
        <span style={{fontFamily: MONO, fontSize: 11, letterSpacing: 1.6, color: C.sub}}>GENERATING</span>
      </div>
      {chips}
      {/* generation caret */}
      <div style={{position: 'absolute', left: caretX + chipW / 2 + 4, top: rowY - chipH / 2 + 6, width: 2.5, height: chipH - 12, background: C.magenta, borderRadius: 2, opacity: caretBlink, boxShadow: `0 0 10px ${hexA(C.magenta, 0.8)}`}} />
      {/* baseline */}
      <div style={{position: 'absolute', left: 0, right: 0, top: rowY + chipH / 2 + 26, height: 1, background: 'linear-gradient(90deg, transparent, rgba(120,170,255,0.18), transparent)'}} />
    </div>
  );
};

// ---------- throughput time-series ----------
const THRU: Comp[] = [
  {f: 1.1, h: 1, a: 0.15, p: 0.3},
  {f: 2.4, h: 2, a: 0.08, p: 1.1},
  {f: 3.9, h: 1, a: 0.04, p: 2.0},
];

const Throughput: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const gx0 = 6, gx1 = cw - 6, gTop = 58, gBot = ch - 26;
  const gw = gx1 - gx0;
  const pts = wavePts(96, gx0, gx1, gTop, gBot, THRU, 0.52, t);
  const area = `${smooth(pts)} L ${gx1} ${gBot} L ${gx0} ${gBot} Z`;
  const fx = t;
  const dv = waveVal(fx, THRU, 0.52, t);
  const dx = gx0 + fx * gw;
  const dy = gBot - dv * (gBot - gTop);
  const edge = interpolate(Math.min(fx, 1 - fx), [0, 0.06], [0, 1], {extrapolateRight: 'clamp'});
  const val = 1284 + 60 * Math.sin(TAU * t) + 16 * Math.sin(TAU * 3 * t + 1);

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="th_area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.teal} stopOpacity="0.4" />
            <stop offset="0.6" stopColor={C.cyan} stopOpacity="0.12" />
            <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="th_line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
          <Glow id="th_glow" b1={2.2} b2={7} />
        </defs>
        {[0.33, 0.66, 1].map((r) => (
          <line key={r} x1={gx0} y1={gBot - r * (gBot - gTop)} x2={gx1} y2={gBot - r * (gBot - gTop)} stroke={C.grid} strokeWidth={1} />
        ))}
        <path d={area} fill="url(#th_area)" />
        <path d={smooth(pts)} fill="none" stroke="url(#th_line)" strokeWidth={2.6} strokeLinecap="round" filter="url(#th_glow)" />
        {edge > 0.02 && (
          <>
            <circle cx={dx} cy={dy} r={8} fill={hexA(C.cyan, 0.16 * edge)} />
            <circle cx={dx} cy={dy} r={3.6} fill={C.ink} opacity={edge} filter="url(#th_glow)" />
          </>
        )}
      </svg>
      <div style={{position: 'absolute', left: 2, top: 0, display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(C.cyan, 0.4)}`}}>{nf(val, 0)}</span>
        <span style={{fontFamily: FONT, fontSize: 13, color: C.sub, letterSpacing: 0.5}}>tok/s</span>
      </div>
      <div style={{position: 'absolute', left: 3, top: 40, fontFamily: FONT, fontSize: 10.5, letterSpacing: 2, color: C.faint, textTransform: 'uppercase'}}>throughput · 60s</div>
    </div>
  );
};

// ---------- inference pipeline ----------
const Pipeline: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const rows = [
    {label: 'EMBEDDING', sub: 'token → vector', base: 0.82, accent: C.cyan},
    {label: 'SELF-ATTENTION', sub: 'q · kᵀ softmax', base: 0.66, accent: C.teal},
    {label: 'FEED-FORWARD', sub: 'mlp · gelu', base: 0.58, accent: C.violet},
    {label: 'DECODE', sub: 'sample · argmax', base: 0.7, accent: C.blue},
  ];
  const rh = ch / rows.length;
  const trackX = 190;
  const trackW = cw - trackX - 74;
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <Glow id="pp_glow" b1={1.6} b2={5} />
        {rows.map((r, i) => (
          <linearGradient key={i} id={`pp_g${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={hexA(r.accent, 0.5)} />
            <stop offset="1" stopColor={r.accent} />
          </linearGradient>
        ))}
      </defs>
      {rows.map((r, i) => {
        const cy = i * rh + rh / 2;
        const val = clamp(r.base + 0.09 * Math.sin(TAU * (t + i * 0.22)), 0.05, 0.98);
        return (
          <g key={i}>
            {i > 0 && <line x1={0} y1={i * rh} x2={cw} y2={i * rh} stroke={C.grid} strokeWidth={1} />}
            <text x={0} y={cy - 3} fill={C.ink} fontFamily={FONT} fontSize={13.5} fontWeight={600} letterSpacing={1.2}>{r.label}</text>
            <text x={0} y={cy + 14} fill={C.faint} fontFamily={MONO} fontSize={10.5} letterSpacing={0.4}>{r.sub}</text>
            <rect x={trackX} y={cy - 5} width={trackW} height={10} rx={5} fill="rgba(120,160,230,0.12)" />
            <rect x={trackX} y={cy - 5} width={Math.max(10, val * trackW)} height={10} rx={5} fill={`url(#pp_g${i})`} filter="url(#pp_glow)" />
            <circle cx={trackX + Math.max(10, val * trackW)} cy={cy} r={4} fill={C.ink} filter="url(#pp_glow)" />
            <text x={cw} y={cy + 5} fill={r.accent} fontFamily={MONO} fontSize={16} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round(val * 100)}%</text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- KPI cards ----------
type Kpi = {label: string; val: number; unit: string; dec: number; delta: string; accent: string; amp: number; seed: string};
const KPIS: Kpi[] = [
  {label: 'TOKENS / SEC', val: 1284, unit: '', dec: 0, delta: '▲ 3.2%', accent: C.cyan, amp: 34, seed: 'k1'},
  {label: 'LATENCY', val: 8.4, unit: 'ms', dec: 1, delta: '▼ 0.6%', accent: C.teal, amp: 0.5, seed: 'k2'},
  {label: 'GPU UTIL', val: 87, unit: '%', dec: 0, delta: '▲ 1.4%', accent: C.violet, amp: 2, seed: 'k3'},
];

const KpiChart: React.FC<{cw: number; ch: number; t: number; d: Kpi}> = ({cw, ch, t, d}) => {
  const ph = random(d.seed) * 3;
  const comps: Comp[] = [
    {f: 1.5, h: 1, a: 0.18, p: ph},
    {f: 3.0, h: 2, a: 0.09, p: ph * 1.7},
  ];
  const spTop = ch * 0.5, spBot = ch - 4;
  const pts = wavePts(30, 2, cw - 2, spTop, spBot, comps, 0.5, t);
  const area = `${smooth(pts)} L ${cw - 2} ${spBot} L 2 ${spBot} Z`;
  const val = d.val + d.amp * Math.sin(TAU * (t + ph * 0.1));
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(d.accent, 0.4)}`}}>{nf(val, d.dec)}</span>
        {d.unit && <span style={{fontFamily: FONT, fontSize: 13, color: C.sub}}>{d.unit}</span>}
      </div>
      <span style={{fontFamily: MONO, fontSize: 12.5, color: C.teal, letterSpacing: 0.5}}>{d.delta}</span>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', left: 0, bottom: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={`ksp_${d.seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={d.accent} stopOpacity="0.4" />
            <stop offset="1" stopColor={d.accent} stopOpacity="0" />
          </linearGradient>
          <Glow id={`kspg_${d.seed}`} b1={1.4} b2={4} />
        </defs>
        <path d={area} fill={`url(#ksp_${d.seed})`} />
        <path d={smooth(pts)} fill="none" stroke={d.accent} strokeWidth={2} strokeLinecap="round" filter={`url(#kspg_${d.seed})`} />
      </svg>
    </div>
  );
};

// ---------- world plane ----------
const World: React.FC<{t: number}> = ({t}) => {
  const W = 2600, H = 1500;
  const rotX = 15 + 3 * Math.sin(TAU * t + 0.2);
  const rotY = 12 * Math.sin(TAU * t + 0.7);
  const rotZ = 1.0 * Math.sin(TAU * t + 1.9);
  const tx = 120 * Math.sin(TAU * t + 0.15);
  const ty = 26 * Math.sin(TAU * t + 1.25);
  const tz = 215 + 70 * Math.sin(TAU * t + 2.1);

  const GW = 3400, GH = 2100, gStep = 92;
  const vlines = Math.ceil(GW / gStep), hlines = Math.ceil(GH / gStep);

  return (
    <div style={{position: 'absolute', width: W, height: H, transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translate3d(${tx}px,${ty}px,${tz}px)`, transformOrigin: '50% 50%', backfaceVisibility: 'hidden'}}>
      {/* holographic floor grid */}
      <div style={{position: 'absolute', left: '50%', top: '50%', width: GW, height: GH, transform: 'translate(-50%,-50%) translateZ(-175px)'}}>
        <svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`}>
          <defs>
            <radialGradient id="wg_fade" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="wg_mask"><rect width={GW} height={GH} fill="url(#wg_fade)" /></mask>
          </defs>
          <g mask="url(#wg_mask)">
            {Array.from({length: vlines + 1}).map((_, i) => (
              <line key={'v' + i} x1={i * gStep} y1={0} x2={i * gStep} y2={GH} stroke={i % 5 === 0 ? C.gridHi : C.grid} strokeWidth={i % 5 === 0 ? 1.4 : 1} />
            ))}
            {Array.from({length: hlines + 1}).map((_, i) => (
              <line key={'h' + i} x1={0} y1={i * gStep} x2={GW} y2={i * gStep} stroke={i % 5 === 0 ? C.gridHi : C.grid} strokeWidth={i % 5 === 0 ? 1.4 : 1} />
            ))}
          </g>
        </svg>
      </div>

      {/* header strip */}
      <div style={{position: 'absolute', left: 110, top: 128, width: 2400, height: 60, transform: 'translateZ(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backfaceVisibility: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{width: 16, height: 16, transform: 'rotate(45deg)', border: `2px solid ${C.cyan}`, boxShadow: `0 0 16px ${hexA(C.cyan, 0.7)}`, borderRadius: 3, display: 'inline-block'}} />
          <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: 5, color: C.ink, textTransform: 'uppercase'}}>Neural Inference Engine</span>
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: C.faint, marginLeft: 6}}>/ REAL-TIME</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <PulseDot color={C.teal} t={t} size={8} />
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2.5, color: C.sub}}>MODEL · ONLINE</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 190, width: 2400, height: 1, transform: 'translateZ(12px)', background: 'linear-gradient(90deg, rgba(120,180,255,0.35), rgba(120,180,255,0.03))'}} />

      {/* panels */}
      <Frame x={110} y={250} w={1250} h={690} z={0} accent={C.cyan} title="Inference Network" tag="FWD" t={t}>
        {(cw, ch) => <NeuralGraph cw={cw} ch={ch} t={t} />}
      </Frame>

      {KPIS.map((d, i) => (
        <Frame key={d.seed} x={1420 + i * 397} y={250} w={i === 2 ? 300 : 380} h={205} z={80 - i * 22} accent={d.accent} title={d.label} tag="LIVE" t={t}>
          {(cw, ch) => <KpiChart cw={cw} ch={ch} t={t} d={d} />}
        </Frame>
      ))}

      <Frame x={1420} y={485} w={455} h={455} z={120} accent={C.teal} title="Attention Map" tag="LAYER 7" t={t}>
        {(cw, ch) => <AttentionHeatmap cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1905} y={485} w={460} h={455} z={35} accent={C.magenta} title="Output Confidence" tag="TOP-6" t={t}>
        {(cw, ch) => <ConfidenceBars cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={110} y={980} w={780} h={430} z={62} accent={C.violet} title="Token Stream" tag="DECODE" t={t}>
        {(cw, ch) => <TokenStream cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={915} y={980} w={560} h={430} z={-32} accent={C.cyan} title="Throughput" tag="tok/s" t={t}>
        {(cw, ch) => <Throughput cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1500} y={980} w={1010} h={430} z={86} accent={C.blue} title="Inference Pipeline" tag="STREAM" t={t}>
        {(cw, ch) => <Pipeline cw={cw} ch={ch} t={t} />}
      </Frame>
    </div>
  );
};

// ---------- atmosphere ----------
const Bokeh: React.FC<{t: number; count: number; seedp: string; front?: boolean}> = ({t, count, seedp, front}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    {Array.from({length: count}).map((_, i) => {
      const s = seedp + i;
      const bx = random('bx' + s) * 100;
      const by = random('by' + s) * 100;
      const sz = (front ? 90 : 44) + random('bs' + s) * (front ? 200 : 150);
      const k = random('bk' + s) > 0.5 ? 1 : 2;
      const dx = (random('bdx' + s) - 0.5) * (front ? 3 : 6);
      const dy = (random('bdy' + s) - 0.5) * (front ? 3 : 6);
      const px = bx + dx * Math.sin(TAU * (k * t + random('bp' + s)));
      const py = by + dy * Math.cos(TAU * (k * t + random('bq' + s)));
      const pulse = 0.5 + 0.5 * Math.sin(TAU * (t + random('bo' + s)));
      const col = random('bc' + s) > 0.5 ? C.cyan : random('bc2' + s) > 0.5 ? C.violet : C.teal;
      const op = (front ? 0.05 : 0.12) + pulse * (front ? 0.05 : 0.1);
      return (
        <div key={i} style={{position: 'absolute', left: `${px}%`, top: `${py}%`, width: sz, height: sz, marginLeft: -sz / 2, marginTop: -sz / 2, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(col, 0.9)} 0%, ${hexA(col, 0)} 70%)`, opacity: op, filter: `blur(${front ? 14 : 8}px)`}} />
      );
    })}
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = (frame % durationInFrames) / durationInFrames;

  const g1x = 26 + 6 * Math.sin(TAU * t);
  const g1y = 22 + 5 * Math.cos(TAU * t + 1);
  const g2x = 74 + 6 * Math.sin(TAU * t + 2);
  const g2y = 78 + 5 * Math.cos(TAU * t);

  const scanY = t;
  const scanEdge = interpolate(Math.min(scanY, 1 - scanY), [0, 0.08], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill style={{background: 'radial-gradient(130% 100% at 50% 28%, #0c1834 0%, #081124 42%, #050a17 72%, #03060f 100%)', fontFamily: FONT}}>
      <AbsoluteFill style={{mixBlendMode: 'screen'}}>
        <div style={{position: 'absolute', left: `${g1x}%`, top: `${g1y}%`, width: 1100, height: 1100, marginLeft: -550, marginTop: -550, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.cyan, 0.16)} 0%, ${hexA(C.cyan, 0)} 66%)`}} />
        <div style={{position: 'absolute', left: `${g2x}%`, top: `${g2y}%`, width: 1200, height: 1200, marginLeft: -600, marginTop: -600, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(C.violet, 0.14)} 0%, ${hexA(C.violet, 0)} 66%)`}} />
        <div style={{position: 'absolute', left: '50%', top: '46%', width: 1500, height: 900, marginLeft: -750, marginTop: -450, borderRadius: '50%', background: `radial-gradient(ellipse, ${hexA(C.blue, 0.10)} 0%, ${hexA(C.blue, 0)} 70%)`}} />
      </AbsoluteFill>

      <Bokeh t={t} count={26} seedp="bg" />

      <AbsoluteFill style={{perspective: '1400px', perspectiveOrigin: '50% 42%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <World t={t} />
      </AbsoluteFill>

      <Bokeh t={t} count={7} seedp="fg" front />

      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.5 * scanEdge}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: `${scanY * 100}%`, height: 140, marginTop: -70, background: `linear-gradient(180deg, transparent, ${hexA(C.cyan, 0.10)} 50%, transparent)`}} />
      </AbsoluteFill>

      <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(120% 120% at 50% 44%, transparent 52%, rgba(2,4,10,0.55) 82%, rgba(1,3,8,0.9) 100%)'}} />

      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.05}}>
        <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none">
          <filter id="mn_noise" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
          </filter>
          <rect width="960" height="540" filter="url(#mn_noise)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Motion;
