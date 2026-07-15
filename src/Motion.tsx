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
 * RELAY — Autonomous Agent Orchestration
 * Direction: PREMIUM. A dark, glassmorphic agent-ops console on a floating
 * perspective plane, flown over by a slow cinematic parallax camera. Centerpiece
 * is a live orchestration graph: a planner dispatches to worker agents that call
 * tools and read/write memory, with request/response messages flowing along
 * curved edges. Supported by a task queue, tool-call log, reasoning-budget gauge,
 * message-rate and per-agent load panels.
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

const cubic = (p0: number, p1: number, p2: number, p3: number, s: number) => {
  const u = 1 - s;
  return u * u * u * p0 + 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s * p3;
};

type Comp = {f: number; h: number; a: number; p: number};

const waveVal = (fx: number, comps: Comp[], base: number, t: number) => {
  let v = base;
  for (const c of comps) v += c.a * Math.sin(TAU * (c.f * fx + c.h * t + c.p));
  return clamp(v, 0.05, 0.95);
};

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

const FONT =
  '"Inter","SF Pro Display","Helvetica Neue",Arial,system-ui,sans-serif';
const MONO =
  '"SF Mono","JetBrains Mono","Roboto Mono",ui-monospace,Menlo,monospace';

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

// ---------- HERO: orchestration graph ----------
type GNode = {id: string; cx: number; cy: number; w: number; h: number; label: string; accent: string; depth: number; big?: boolean};
type GEdge = {a: string; b: string; kind: 'dispatch' | 'tool' | 'mem'; k: number; phase: number};

const AgentGraph: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  // node geometry (center-based)
  const AW = 156, AH = 46, RW = 150, RH = 44;
  const agentNames = ['RESEARCH', 'CODEGEN', 'ANALYSIS', 'WRITER'];
  const rightDefs: {id: string; label: string; accent: string}[] = [
    {id: 'search', label: 'SEARCH', accent: C.violet},
    {id: 'exec', label: 'EXEC', accent: C.violet},
    {id: 'http', label: 'HTTP', accent: C.violet},
    {id: 'memory', label: 'MEMORY', accent: C.magenta},
    {id: 'vector', label: 'VECTOR DB', accent: C.magenta},
  ];
  const rightYs = [0.12, 0.29, 0.46, 0.66, 0.84];

  const nodes: GNode[] = [];
  nodes.push({id: 'planner', cx: 560, cy: ch * 0.5, w: 160, h: 64, label: 'PLANNER', accent: C.cyan, depth: 0, big: true});
  agentNames.forEach((nm, i) => {
    nodes.push({id: 'agent' + i, cx: 800, cy: ch * [0.16, 0.38, 0.61, 0.84][i], w: AW, h: AH, label: nm, accent: C.teal, depth: 1});
  });
  rightDefs.forEach((r, i) => {
    nodes.push({id: r.id, cx: 1090, cy: ch * rightYs[i], w: RW, h: RH, label: r.label, accent: r.accent, depth: 2});
  });
  const byId = (id: string) => nodes.find((n) => n.id === id) as GNode;

  const edges: GEdge[] = [];
  for (let i = 0; i < 4; i++) edges.push({a: 'planner', b: 'agent' + i, kind: 'dispatch', k: 1 + Math.round(random('ek' + i)), phase: random('ep' + i)});
  const link = (a: string, b: string, kind: 'tool' | 'mem') =>
    edges.push({a, b, kind, k: 1 + Math.round(random('lk' + a + b)), phase: random('lp' + a + b)});
  link('agent0', 'search', 'tool'); link('agent0', 'http', 'tool'); link('agent0', 'memory', 'mem');
  link('agent1', 'exec', 'tool'); link('agent1', 'vector', 'mem');
  link('agent2', 'exec', 'tool'); link('agent2', 'memory', 'mem'); link('agent2', 'vector', 'mem');
  link('agent3', 'memory', 'mem');

  const dwave = (depth: number, off: number) => {
    const v = 0.5 + 0.5 * Math.sin(TAU * (t - depth * 0.28 + off));
    return v * v * v;
  };
  const nodeAct = (n: GNode, idx: number) => {
    if (n.depth === 0) return 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(TAU * (2 * t)));
    return dwave(n.depth, idx * 0.05);
  };

  // packet colour per message kind
  const pcol = (kind: string) => (kind === 'dispatch' ? C.cyan : kind === 'tool' ? C.teal : C.violet);

  // phase pips for the reasoning loop
  const phases = ['PLAN', 'ACT', 'OBSERVE', 'REFLECT'];
  const pf = t * 4;
  const pdist = (i: number) => {
    const d = Math.abs(i - pf);
    return Math.min(d, 4 - d);
  };

  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <Glow id="ag_edge" b1={1.4} b2={4.5} />
          <Glow id="ag_pkt" b1={1.6} b2={5} />
        </defs>

        {/* edges */}
        {edges.map((e, i) => {
          const a = byId(e.a), b = byId(e.b);
          const x1 = a.cx + a.w / 2, y1 = a.cy, x2 = b.cx - b.w / 2, y2 = b.cy;
          const dx = (x2 - x1) * 0.5;
          const mid = 0.5 * (dwave(a.depth, 0) + dwave(b.depth, 0));
          const col = pcol(e.kind);
          return (
            <path
              key={'ed' + i}
              d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
              fill="none" stroke={hexA(col, 0.1 + mid * 0.28)} strokeWidth={1 + mid * 1.1}
              filter={mid > 0.6 ? 'url(#ag_edge)' : undefined}
            />
          );
        })}

        {/* flowing messages */}
        {edges.map((e, i) => {
          const a = byId(e.a), b = byId(e.b);
          const x1 = a.cx + a.w / 2, y1 = a.cy, x2 = b.cx - b.w / 2, y2 = b.cy;
          const dx = (x2 - x1) * 0.5;
          const p0x = x1, p1x = x1 + dx, p2x = x2 - dx, p3x = x2;
          const mid = 0.5 * (dwave(a.depth, 0) + dwave(b.depth, 0));
          const out = [];
          // forward request
          const sf = (t * e.k + e.phase) % 1;
          const ef = Math.sin(Math.PI * sf);
          const opF = ef * (0.35 + 0.65 * mid);
          if (opF > 0.05) {
            out.push(
              <circle key={'f' + i} cx={cubic(p0x, p1x, p2x, p3x, sf)} cy={cubic(y1, y1, y2, y2, sf)} r={2.6 + ef * 1.2} fill={pcol(e.kind)} opacity={opF} filter="url(#ag_pkt)" />
            );
          }
          // response (return) — brighter on dispatch links
          if (e.kind === 'dispatch') {
            const sr = 1 - ((t * e.k + e.phase + 0.4) % 1);
            const er = Math.sin(Math.PI * sr);
            const opR = er * (0.3 + 0.6 * mid);
            if (opR > 0.05) {
              out.push(
                <circle key={'r' + i} cx={cubic(p0x, p1x, p2x, p3x, sr)} cy={cubic(y1, y1, y2, y2, sr)} r={2.4 + er * 1} fill={C.magenta} opacity={opR} filter="url(#ag_pkt)" />
              );
            }
          }
          return <g key={'pk' + i}>{out}</g>;
        })}
      </svg>

      {/* node modules */}
      {nodes.map((n, i) => {
        const act = nodeAct(n, i);
        const x = n.cx - n.w / 2, y = n.cy - n.h / 2;
        return (
          <div key={n.id} style={{
            position: 'absolute', left: x, top: y, width: n.w, height: n.h,
            borderRadius: 12,
            background: `linear-gradient(158deg, ${hexA(n.accent, 0.14 + 0.14 * act)}, rgba(13,22,44,0.72))`,
            border: `1px solid ${hexA(n.accent, 0.4 + 0.42 * act)}`,
            boxShadow: `0 0 ${10 + act * 26}px ${hexA(n.accent, 0.1 + 0.3 * act)}, inset 0 1px 0 rgba(210,230,255,0.14)`,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '0 13px',
          }}>
            <span style={{display: 'flex', alignItems: 'center', gap: 9}}>
              <span style={{width: 7, height: 7, borderRadius: '50%', background: n.accent, boxShadow: `0 0 ${5 + act * 9}px ${hexA(n.accent, 0.6 + 0.4 * act)}`, flexShrink: 0}} />
              <span style={{fontFamily: MONO, fontSize: n.big ? 15 : 13, fontWeight: 600, letterSpacing: 1.2, color: C.ink}}>{n.label}</span>
            </span>
            {n.big && <span style={{fontFamily: FONT, fontSize: 10, letterSpacing: 2, color: C.faint, textTransform: 'uppercase', marginTop: 3, marginLeft: 16}}>orchestrator</span>}
          </div>
        );
      })}

      {/* reasoning-loop readout */}
      <div style={{position: 'absolute', left: 496, top: -2}}>
        <div style={{fontFamily: FONT, fontSize: 10.5, letterSpacing: 2.4, color: C.faint, textTransform: 'uppercase', marginBottom: 7}}>reasoning loop</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 7}}>
          {phases.map((ph, i) => {
            const g = Math.exp(-Math.pow(pdist(i), 2) / 0.5);
            return (
              <React.Fragment key={ph}>
                <span style={{fontFamily: MONO, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.6, color: `rgba(234,242,255,${0.4 + 0.6 * g})`, textShadow: g > 0.4 ? `0 0 12px ${hexA(C.cyan, 0.7 * g)}` : 'none'}}>{ph}</span>
                {i < phases.length - 1 && <span style={{color: C.faint, fontSize: 11}}>▸</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', right: 0, top: 0, textAlign: 'right', fontFamily: MONO, fontSize: 11, letterSpacing: 1.2, color: C.faint, lineHeight: 1.7}}>
        <div>4 AGENTS · 3 TOOLS</div>
        <div>2 MEMORY · async</div>
      </div>
    </div>
  );
};

// ---------- reasoning-budget gauge ----------
const ReasoningGauge: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const cx = cw / 2, cy = ch / 2 + 4, R = Math.min(cw, ch) / 2 - 26;
  const circ = TAU * R;
  const budgetMax = 16.0; // k tokens — full reasoning budget
  // reasoning tokens are consumed over the take, so the ring drains (monotonic by design)
  const frac = clamp(0.9 - 0.56 * t + 0.012 * Math.sin(TAU * 4 * t), 0.03, 0.995);
  const tokens = budgetMax * frac; // ring level tracks the remaining token count
  const headAng = -90 + frac * 360; // bright head sits exactly at the arc's leading end
  const hr = (headAng * Math.PI) / 180;
  const headX = cx + R * Math.cos(hr);
  const headY = cy + R * Math.sin(hr);
  const ticks = 48;
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible', position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="rg_arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="0.5" stopColor={C.cyan} />
            <stop offset="1" stopColor={C.violet} />
          </linearGradient>
          <Glow id="rg_glow" b1={2.4} b2={8} />
        </defs>
        {Array.from({length: ticks}).map((_, i) => {
          const a = (i / ticks) * TAU - Math.PI / 2;
          const on = i / ticks < frac;
          const r1 = R + 8, r2 = R + (on ? 16 : 13);
          return (
            <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={on ? hexA(C.cyan, 0.8) : C.grid} strokeWidth={on ? 2 : 1.5} strokeLinecap="round" />
          );
        })}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(120,160,230,0.14)" strokeWidth={12} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#rg_arc)" strokeWidth={12} strokeLinecap="round" strokeDasharray={`${(frac * circ).toFixed(2)} ${circ.toFixed(2)}`} filter="url(#rg_glow)" />
        </g>
        <circle cx={headX} cy={headY} r={9} fill={hexA(C.cyan, 0.2)} />
        <circle cx={headX} cy={headY} r={5} fill={C.ink} filter="url(#rg_glow)" />
        <circle cx={headX} cy={headY} r={5} fill="none" stroke={C.cyan} strokeWidth={1.6} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
        <span style={{fontFamily: MONO, fontSize: 46, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 30px ${hexA(C.cyan, 0.5)}`, marginTop: 4}}>{tokens.toFixed(1)}<span style={{fontSize: 22, color: C.sub}}>k</span></span>
        <span style={{fontFamily: FONT, fontSize: 11, letterSpacing: 3, color: C.faint, textTransform: 'uppercase', marginTop: 2}}>reasoning tokens</span>
        <span style={{fontFamily: MONO, fontSize: 11.5, color: C.teal, letterSpacing: 1, marginTop: 6}}>BUDGET {Math.round(frac * 100)}%</span>
      </div>
    </div>
  );
};

// ---------- task queue ----------
type Task = {label: string; status: 'done' | 'run' | 'queued'};
const TASKS: Task[] = [
  {label: 'PLAN DECOMPOSITION', status: 'done'},
  {label: 'CONTEXT RETRIEVAL', status: 'done'},
  {label: 'TOOL EXECUTION', status: 'run'},
  {label: 'RESULT SYNTHESIS', status: 'queued'},
  {label: 'SELF-REVIEW', status: 'queued'},
  {label: 'FINALIZE OUTPUT', status: 'queued'},
];

const TaskQueue: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const n = TASKS.length;
  const rowH = ch / n;
  const barX = 26, barW = cw - barX - 74;
  const runPct = 0.62 + 0.04 * Math.sin(TAU * t);
  const shimmer = (t * 2) % 1; // position of indeterminate highlight
  const scanY = t * ch;
  const scanOp = 0.16 * Math.sin(Math.PI * t);
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="tq_run" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={hexA(C.cyan, 0.5)} />
          <stop offset="1" stopColor={C.cyan} />
        </linearGradient>
        <Glow id="tq_glow" b1={1.6} b2={5} />
        <clipPath id="tq_runclip"><rect x={barX} y={0} width={Math.max(6, runPct * barW)} height={ch} rx={3} /></clipPath>
      </defs>
      {/* scheduler scan */}
      <rect x={0} y={scanY - 16} width={cw} height={32} fill={hexA(C.cyan, scanOp)} />
      {TASKS.map((task, i) => {
        const cy = i * rowH + rowH / 2;
        const done = task.status === 'done';
        const run = task.status === 'run';
        const dotCol = done ? C.teal : run ? C.cyan : C.faint;
        const fillW = done ? barW : run ? runPct * barW : 0;
        const barCol = done ? C.teal : C.cyan;
        const right = done ? '100%' : run ? `${Math.round(runPct * 100)}%` : 'QUEUED';
        return (
          <g key={i}>
            {i > 0 && <line x1={0} y1={i * rowH} x2={cw} y2={i * rowH} stroke={C.grid} strokeWidth={1} />}
            {done
              ? <circle cx={7} cy={cy} r={5} fill={dotCol} filter="url(#tq_glow)" />
              : run
                ? <circle cx={7} cy={cy} r={5.5} fill="none" stroke={dotCol} strokeWidth={2} filter="url(#tq_glow)" />
                : <circle cx={7} cy={cy} r={4.5} fill="none" stroke={dotCol} strokeWidth={1.2} />}
            <text x={26} y={cy - 5} fill={done || run ? C.ink : C.sub} fontFamily={FONT} fontSize={13} fontWeight={600} letterSpacing={1}>{task.label}</text>
            <rect x={barX} y={cy + 8} width={barW} height={6} rx={3} fill="rgba(120,160,230,0.12)" />
            {fillW > 0 && <rect x={barX} y={cy + 8} width={fillW} height={6} rx={3} fill={done ? barCol : 'url(#tq_run)'} filter={run ? 'url(#tq_glow)' : undefined} opacity={done ? 0.9 : 1} />}
            {run && (
              <g clipPath="url(#tq_runclip)" transform={`translate(0 ${cy + 8})`}>
                <rect x={barX + shimmer * (runPct * barW) - 24} y={0} width={48} height={6} fill={hexA('#ffffff', 0.5)} />
              </g>
            )}
            <text x={cw} y={cy - 2} fill={done ? C.teal : run ? C.cyan : C.faint} fontFamily={MONO} fontSize={12} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{right}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------- tool-call log ----------
type Call = {fn: string; arg: string; st: string; col: string; stcol: string};
const CALLS: Call[] = [
  {fn: 'search', arg: '"…"', st: 'OK', col: C.cyan, stcol: C.teal},
  {fn: 'vector.query', arg: 'k=8', st: 'OK', col: C.violet, stcol: C.teal},
  {fn: 'http.get', arg: '…', st: '200', col: C.cyan, stcol: C.blue},
  {fn: 'exec', arg: 'sandbox', st: 'OK', col: C.teal, stcol: C.teal},
  {fn: 'memory.write', arg: 'ctx', st: 'OK', col: C.violet, stcol: C.teal},
  {fn: 'parse.json', arg: '…', st: 'OK', col: C.blue, stcol: C.teal},
  {fn: 'plan.step', arg: '', st: '…', col: C.amber, stcol: C.amber},
  {fn: 'tool.route', arg: '', st: 'OK', col: C.blue, stcol: C.teal},
];

const ToolCallLog: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const period = 18;
  const lineH = 29;
  const base = ch - 14;
  const off = t * period;
  const fl = Math.floor(off), fr = off - fl;
  // build visible log lines (newest at bottom, scrolling up)
  const items = [];
  for (let s = -1; s <= Math.ceil(ch / lineH) + 1; s++) {
    const k = fl - s;
    const y = base - (s - fr) * lineH;
    if (y < -lineH || y > ch + lineH) continue;
    const slot = ((k % period) + period) % period;
    const call = CALLS[(slot * 5) % CALLS.length];
    const ms = 20 + Math.floor(random('ms' + slot) * 380);
    const ss = String((slot * 7) % 60).padStart(2, '0');
    const newest = s === 0;
    const topFade = clamp((y - 4) / (lineH * 1.6), 0, 1);
    const op = newest ? 1 : 0.55 + 0.45 * topFade;
    items.push(
      <g key={k} opacity={op}>
        {newest && <rect x={-6} y={y - lineH + 8} width={cw + 12} height={lineH - 4} rx={5} fill={hexA(C.cyan, 0.08)} />}
        <text x={0} y={y} fill={C.faint} fontFamily={MONO} fontSize={12} letterSpacing={0.3}>{`12:04:${ss}`}</text>
        <text x={72} y={y} fill={call.col} fontFamily={MONO} fontSize={12}>▸</text>
        <text x={90} y={y} fill={newest ? C.ink : C.sub} fontFamily={MONO} fontSize={12.5}>{`${call.fn}(${call.arg})`}</text>
        <text x={cw} y={y} fill={call.stcol} fontFamily={MONO} fontSize={12} fontWeight={600} textAnchor="end" style={{fontVariantNumeric: 'tabular-nums'}}>{`${call.st} · ${ms}ms`}</text>
        {newest && <rect x={92 + (call.fn.length + call.arg.length + 2) * 7.4} y={y - 11} width={7} height={13} fill={C.cyan} opacity={0.4 + 0.6 * (0.5 + 0.5 * Math.sin(TAU * (t * 6)))} />}
      </g>
    );
  }
  return (
    <div style={{position: 'relative', width: cw, height: ch, overflow: 'hidden'}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0}}>
        {items}
      </svg>
      {/* top fade veil */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 46, background: 'linear-gradient(180deg, rgba(11,19,40,0.85), rgba(11,19,40,0))', pointerEvents: 'none'}} />
    </div>
  );
};

// ---------- message-rate time-series ----------
const MSG: Comp[] = [
  {f: 1.1, h: 1, a: 0.15, p: 0.3},
  {f: 2.4, h: 2, a: 0.08, p: 1.1},
  {f: 3.9, h: 1, a: 0.04, p: 2.0},
];

const MessageRate: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const gx0 = 6, gx1 = cw - 6, gTop = 58, gBot = ch - 26;
  const gw = gx1 - gx0;
  const pts = wavePts(96, gx0, gx1, gTop, gBot, MSG, 0.52, t);
  const area = `${smooth(pts)} L ${gx1} ${gBot} L ${gx0} ${gBot} Z`;
  const fx = t;
  const dv = waveVal(fx, MSG, 0.52, t);
  const dx = gx0 + fx * gw;
  const dy = gBot - dv * (gBot - gTop);
  const edge = interpolate(Math.min(fx, 1 - fx), [0, 0.06], [0, 1], {extrapolateRight: 'clamp'});
  const val = 246 + 12 * Math.sin(TAU * t) + 4 * Math.sin(TAU * 3 * t + 1);
  return (
    <div style={{position: 'relative', width: cw, height: ch}}>
      <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="mr_area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.teal} stopOpacity="0.4" />
            <stop offset="0.6" stopColor={C.cyan} stopOpacity="0.12" />
            <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mr_line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.teal} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
          <Glow id="mr_glow" b1={2.2} b2={7} />
        </defs>
        {[0.33, 0.66, 1].map((r) => (
          <line key={r} x1={gx0} y1={gBot - r * (gBot - gTop)} x2={gx1} y2={gBot - r * (gBot - gTop)} stroke={C.grid} strokeWidth={1} />
        ))}
        <path d={area} fill="url(#mr_area)" />
        <path d={smooth(pts)} fill="none" stroke="url(#mr_line)" strokeWidth={2.6} strokeLinecap="round" filter="url(#mr_glow)" />
        {edge > 0.02 && (
          <>
            <circle cx={dx} cy={dy} r={8} fill={hexA(C.cyan, 0.16 * edge)} />
            <circle cx={dx} cy={dy} r={3.6} fill={C.ink} opacity={edge} filter="url(#mr_glow)" />
          </>
        )}
      </svg>
      <div style={{position: 'absolute', left: 2, top: 0, display: 'flex', alignItems: 'baseline', gap: 8}}>
        <span style={{fontFamily: MONO, fontSize: 34, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 22px ${hexA(C.cyan, 0.4)}`}}>{nf(val, 0)}</span>
        <span style={{fontFamily: FONT, fontSize: 13, color: C.sub, letterSpacing: 0.5}}>msg/s</span>
      </div>
      <div style={{position: 'absolute', left: 3, top: 40, fontFamily: FONT, fontSize: 10.5, letterSpacing: 2, color: C.faint, textTransform: 'uppercase'}}>inter-agent · 60s</div>
    </div>
  );
};

// ---------- per-agent load ----------
const AgentLoad: React.FC<{cw: number; ch: number; t: number}> = ({cw, ch, t}) => {
  const rows = [
    {label: 'RESEARCH', sub: 'retrieval · web', base: 0.72, accent: C.cyan},
    {label: 'CODEGEN', sub: 'sandbox exec', base: 0.6, accent: C.teal},
    {label: 'ANALYSIS', sub: 'reasoning', base: 0.66, accent: C.violet},
    {label: 'WRITER', sub: 'synthesis', base: 0.54, accent: C.blue},
  ];
  const rh = ch / rows.length;
  const trackX = 190;
  const trackW = cw - trackX - 74;
  return (
    <svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`} style={{overflow: 'visible'}}>
      <defs>
        <Glow id="al_glow" b1={1.6} b2={5} />
        {rows.map((r, i) => (
          <linearGradient key={i} id={`al_g${i}`} x1="0" y1="0" x2="1" y2="0">
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
            <rect x={trackX} y={cy - 5} width={Math.max(10, val * trackW)} height={10} rx={5} fill={`url(#al_g${i})`} filter="url(#al_glow)" />
            <circle cx={trackX + Math.max(10, val * trackW)} cy={cy} r={4} fill={C.ink} filter="url(#al_glow)" />
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
  {label: 'ACTIVE AGENTS', val: 12, unit: '', dec: 0, delta: '▲ 2', accent: C.cyan, amp: 1.4, seed: 'k1'},
  {label: 'TASKS / MIN', val: 148, unit: '', dec: 0, delta: '▲ 4.1%', accent: C.teal, amp: 6, seed: 'k2'},
  {label: 'SUCCESS RATE', val: 98.6, unit: '%', dec: 1, delta: '▲ 0.3%', accent: C.violet, amp: 0.3, seed: 'k3'},
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
          <span style={{fontFamily: FONT, fontSize: 22, fontWeight: 600, letterSpacing: 5, color: C.ink, textTransform: 'uppercase'}}>Agent Orchestration</span>
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: C.faint, marginLeft: 6}}>/ AUTONOMOUS</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <PulseDot color={C.teal} t={t} size={8} />
          <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: 2.5, color: C.sub}}>ORCHESTRATOR · ONLINE</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, top: 190, width: 2400, height: 1, transform: 'translateZ(12px)', background: 'linear-gradient(90deg, rgba(120,180,255,0.35), rgba(120,180,255,0.03))'}} />

      {/* panels */}
      <Frame x={110} y={250} w={1250} h={690} z={0} accent={C.cyan} title="Agent Orchestration" tag="ReAct" t={t}>
        {(cw, ch) => <AgentGraph cw={cw} ch={ch} t={t} />}
      </Frame>

      {KPIS.map((d, i) => (
        <Frame key={d.seed} x={1420 + i * 397} y={250} w={i === 2 ? 300 : 380} h={205} z={80 - i * 22} accent={d.accent} title={d.label} tag="LIVE" t={t}>
          {(cw, ch) => <KpiChart cw={cw} ch={ch} t={t} d={d} />}
        </Frame>
      ))}

      <Frame x={1420} y={485} w={455} h={455} z={120} accent={C.teal} title="Reasoning Budget" tag="TOKENS" t={t}>
        {(cw, ch) => <ReasoningGauge cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1905} y={485} w={460} h={455} z={35} accent={C.violet} title="Task Queue" tag="SCHED" t={t}>
        {(cw, ch) => <TaskQueue cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={110} y={980} w={780} h={430} z={62} accent={C.cyan} title="Tool Calls" tag="STREAM" t={t}>
        {(cw, ch) => <ToolCallLog cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={915} y={980} w={560} h={430} z={-32} accent={C.teal} title="Message Rate" tag="msg/s" t={t}>
        {(cw, ch) => <MessageRate cw={cw} ch={ch} t={t} />}
      </Frame>

      <Frame x={1500} y={980} w={1010} h={430} z={86} accent={C.blue} title="Agent Load" tag="LIVE" t={t}>
        {(cw, ch) => <AgentLoad cw={cw} ch={ch} t={t} />}
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
