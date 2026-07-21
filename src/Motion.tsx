import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  random,
} from 'remotion';

/**
 * HOLOGRAPHIC RING HUD — DATA CORE (PREMIUM)
 * A sci-fi holographic core: a tumbling gyroscope of rings around a hot pulsing
 * center, wrapped by radial waveform + radial-bar rings, rotating tick / dashed /
 * segmented HUD rings, orbiting numeric data nodes, a sweeping radar wedge, data
 * streams, and a corner-bracket HUD frame with live readouts. Cyan→violet glow.
 * SEAMLESS LOOP: every motion is periodic in t = frame / durationInFrames, so the
 * last frame matches the first exactly. Deterministic. IP-safe. 1920x1080.
 */

const BG = '#04050d';
const INK = '#eaf6ff';
const SUB = '#7fa8d4';
const CYAN = '#22d3ee';
const TEAL = '#2dd4bf';
const BLUE = '#3b82f6';
const VIOLET = '#8b5cf6';
const PURPLE = '#a855f7';
const HUD = 'rgba(120,200,255,0.85)';
const TAU = Math.PI * 2;
const CXP = 960;
const CYP = 540;

const lsin = (t: number, k: number, ph = 0) => Math.sin(TAU * k * t + ph);
const pol = (r: number, a: number): number[] => [CXP + r * Math.cos(a), CYP + r * Math.sin(a)];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number): string => {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
  const [x1, y1] = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

const NODE_LABELS = ['98.4', '1024', '0.72', '512', '64%', '2.4K', 'SYNC', 'A7F'];
const READ_L = [
  { l: 'CORE TEMP', u: '°K', b: 3120, a: 40, k: 2 },
  { l: 'THROUGHPUT', u: 'GB/s', b: 84.2, a: 6, k: 3 },
  { l: 'INTEGRITY', u: '%', b: 99.4, a: 0.5, k: 1 },
];
const READ_R = [
  { l: 'LATENCY', u: 'ms', b: 3.4, a: 0.6, k: 3 },
  { l: 'NODES', u: 'ACTIVE', b: 2048, a: 12, k: 2 },
  { l: 'POWER', u: 'PF', b: 12.8, a: 0.7, k: 1 },
];

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const t = (((frame % durationInFrames) + durationInFrames) % durationInFrames) / durationInFrames;

  const corePulse = 0.5 + 0.5 * lsin(t, 2);
  const haloPulse = 0.5 + 0.5 * lsin(t, 1);

  /* gyroscope tumbling rings */
  const gyro = [
    { R: 176, freq: 1, ph: 0.0, tilt: 16, spd: 1, col: CYAN },
    { R: 236, freq: 2, ph: 1.0, tilt: -26, spd: -2, col: TEAL },
    { R: 300, freq: 1, ph: 2.1, tilt: 62, spd: 1, col: VIOLET },
    { R: 300, freq: 2, ph: 0.6, tilt: -70, spd: -1, col: BLUE },
  ];

  /* radial waveform ring */
  let wave = '';
  for (let i = 0; i <= 128; i++) {
    const th = (i / 128) * TAU;
    const r = 350 + 16 * Math.sin(6 * th + TAU * t * 2) + 10 * Math.sin(11 * th - TAU * t * 3) + 6 * Math.sin(3 * th + TAU * t);
    const [x, y] = pol(r, th);
    wave += (i ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  wave += ' Z';

  /* radial bars */
  const NB = 44;
  const bars = [];
  for (let i = 0; i < NB; i++) {
    const th = (i / NB) * TAU;
    const base = 396;
    const len = 14 + (0.5 + 0.5 * random(`b${i}`)) * 26 * (0.55 + 0.45 * Math.abs(lsin(t, 2, i * 0.5)));
    const [x0, y0] = pol(base, th);
    const [x1, y1] = pol(base + len, th);
    bars.push(<line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={i % 3 === 0 ? VIOLET : CYAN} strokeWidth="3.4" strokeLinecap="round" opacity={0.55 + 0.4 * random(`bo${i}`)} />);
  }

  /* orbiting nodes */
  const nodeR = 470;
  const nodes = NODE_LABELS.map((lab, i) => {
    const a = (i / NODE_LABELS.length) * TAU + TAU * t;
    const [x, y] = pol(nodeR, a);
    const [ix, iy] = pol(nodeR - 34, a);
    const [ox, oy] = pol(nodeR + 4, a);
    return { lab, x, y, ix, iy, ox, oy, i };
  });

  /* tick ring marks */
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const th = (i / 72) * TAU;
    const big = i % 6 === 0;
    const [x0, y0] = pol(430, th);
    const [x1, y1] = pol(430 + (big ? 16 : 8), th);
    ticks.push(<line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={HUD} strokeWidth={big ? 2.2 : 1.2} opacity={big ? 0.8 : 0.4} />);
  }

  /* particles / data streams */
  const parts = [];
  for (let i = 0; i < 40; i++) {
    const a = random(`pa${i}`) * TAU + TAU * t * (random(`ps${i}`) > 0.5 ? 1 : -1);
    const rr = 520 + random(`pr${i}`) * 340;
    const [x, y] = pol(rr + 20 * lsin(t, 1 + (i % 2), i), a);
    const s = 1.4 + random(`pz${i}`) * 3;
    parts.push(<circle key={i} cx={x} cy={y} r={s} fill={random(`pc${i}`) > 0.5 ? CYAN : VIOLET} opacity={0.2 + random(`po${i}`) * 0.4} />);
  }
  const streams = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + TAU * t * 0.5;
    const prog = (t * 2 + i / 8) % 1;
    const r0 = 560 - prog * 120;
    const [x0, y0] = pol(r0, a);
    const [x1, y1] = pol(r0 + 46, a);
    streams.push(<line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={CYAN} strokeWidth="2.4" strokeLinecap="round" opacity={0.5 * Math.sin(Math.PI * prog)} />);
  }

  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 6) * TAU;
    return `${(CXP + 34 * Math.cos(a)).toFixed(1)},${(CYP + 34 * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

  const sweepA = TAU * t;
  const [swx, swy] = pol(560, sweepA);
  const [swx2, swy2] = pol(560, sweepA + 0.7);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg width={width} height={height} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="hbg" cx="50%" cy="50%" r="62%">
            <stop offset="0" stopColor="#0d1630" />
            <stop offset="0.5" stopColor="#080d1e" />
            <stop offset="1" stopColor="#04050d" />
          </radialGradient>
          <radialGradient id="coreHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.55" />
            <stop offset="0.4" stopColor={BLUE} stopOpacity="0.2" />
            <stop offset="1" stopColor={VIOLET} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coreFill" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor={CYAN} />
            <stop offset="1" stopColor={VIOLET} />
          </radialGradient>
          <linearGradient id="sweepG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.32" />
            <stop offset="1" stopColor={CYAN} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={CYAN} />
            <stop offset="0.5" stopColor={BLUE} />
            <stop offset="1" stopColor={PURPLE} />
          </linearGradient>
          <filter id="g1" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="g2" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gbig" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="hgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
          </filter>
          <radialGradient id="hvig" cx="50%" cy="50%" r="72%">
            <stop offset="0.52" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.62" />
          </radialGradient>
          <pattern id="hgrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0H0V60" fill="none" stroke="rgba(90,140,210,0.06)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#hbg)" />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#hgrid)" />

        {/* core halo */}
        <circle cx={CXP} cy={CYP} r={260 + 30 * haloPulse} fill="url(#coreHalo)" opacity={0.7 + 0.3 * haloPulse} filter="url(#gbig)" />

        {/* radar sweep */}
        <path d={`M ${CXP} ${CYP} L ${swx.toFixed(1)} ${swy.toFixed(1)} A 560 560 0 0 1 ${swx2.toFixed(1)} ${swy2.toFixed(1)} Z`} fill="url(#sweepG)" opacity="0.5" filter="url(#g2)" />

        {/* particles + streams */}
        <g filter="url(#g1)">{parts}</g>
        <g filter="url(#g1)">{streams}</g>

        {/* outer HUD rings */}
        <g transform={`rotate(${(360 * t).toFixed(2)} ${CXP} ${CYP})`}>
          <circle cx={CXP} cy={CYP} r="524" fill="none" stroke={HUD} strokeWidth="1.4" strokeDasharray="2 14" opacity="0.5" />
        </g>
        <g transform={`rotate(${(-360 * t).toFixed(2)} ${CXP} ${CYP})`} filter="url(#g1)">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={arc(CXP, CYP, 500, (i / 4) * TAU + 0.12, (i / 4) * TAU + TAU / 4 - 0.12)} fill="none" stroke={i % 2 ? VIOLET : CYAN} strokeWidth="3" opacity="0.7" />
          ))}
        </g>
        {/* cardinal brackets on outer ring */}
        {[0, 1, 2, 3].map((i) => {
          const a = i * (TAU / 4) - Math.PI / 2;
          const [x, y] = pol(500, a);
          return <g key={i} transform={`rotate(${(i * 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`}><path d={`M ${(x - 14).toFixed(1)} ${(y - 10).toFixed(1)} L ${(x - 14).toFixed(1)} ${(y - 22).toFixed(1)} L ${(x + 14).toFixed(1)} ${(y - 22).toFixed(1)} L ${(x + 14).toFixed(1)} ${(y - 10).toFixed(1)}`} fill="none" stroke={CYAN} strokeWidth="2.4" filter="url(#g1)" /></g>;
        })}
        <g transform={`rotate(${(180 * t).toFixed(2)} ${CXP} ${CYP})`}>{ticks}</g>

        {/* orbiting numeric nodes */}
        <g filter="url(#g1)">
          {nodes.map((n) => (
            <g key={n.i}>
              <line x1={n.ix} y1={n.iy} x2={n.ox} y2={n.oy} stroke={HUD} strokeWidth="1.4" opacity="0.5" />
              <circle cx={n.x} cy={n.y} r="4.5" fill={n.i % 2 ? VIOLET : CYAN} />
              <text x={n.x} y={n.y - 14} fontSize="17" fill={INK} fontWeight="700" textAnchor="middle" fontFamily="'DejaVu Sans Mono', ui-monospace, monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>{n.lab}</text>
            </g>
          ))}
        </g>

        {/* radial waveform ring */}
        <path d={wave} fill="none" stroke="url(#waveG)" strokeWidth="2.6" opacity="0.9" filter="url(#g2)" />

        {/* radial bars */}
        <g transform={`rotate(${(60 * t).toFixed(2)} ${CXP} ${CYP})`} filter="url(#g1)">{bars}</g>

        {/* gyroscope tumbling rings */}
        {gyro.map((g, k) => {
          const ry = g.R * (0.14 + 0.86 * Math.abs(Math.cos(TAU * t * g.freq + g.ph)));
          const da = TAU * t * g.spd;
          const [dx, dy] = [CXP + g.R * Math.cos(da), CYP + ry * Math.sin(da)];
          const [dx2, dy2] = [CXP + g.R * Math.cos(da + Math.PI), CYP + ry * Math.sin(da + Math.PI)];
          return (
            <g key={k} transform={`rotate(${g.tilt} ${CXP} ${CYP})`} filter="url(#g2)">
              <ellipse cx={CXP} cy={CYP} rx={g.R} ry={ry.toFixed(1)} fill="none" stroke={g.col} strokeWidth="2.4" opacity="0.85" />
              <circle cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="5.5" fill="#ffffff" />
              <circle cx={dx2.toFixed(1)} cy={dy2.toFixed(1)} r="4" fill={g.col} />
            </g>
          );
        })}

        {/* core */}
        <g filter="url(#g2)">
          <circle cx={CXP} cy={CYP} r={78 + 8 * corePulse} fill="none" stroke={CYAN} strokeWidth="1.6" strokeDasharray="3 9" opacity="0.55" />
          <g transform={`rotate(${(-120 * t).toFixed(2)} ${CXP} ${CYP})`}>
            <circle cx={CXP} cy={CYP} r="60" fill="none" stroke={VIOLET} strokeWidth="2" strokeDasharray="40 220" opacity="0.8" />
          </g>
          <polygon points={hexPts} fill="url(#coreFill)" opacity={0.9} transform={`rotate(${(90 * t).toFixed(2)} ${CXP} ${CYP})`} />
          <circle cx={CXP} cy={CYP} r={14 + 4 * corePulse} fill="#ffffff" />
        </g>

        {/* ---- HUD frame overlay ---- */}
        {/* corner brackets */}
        {[[70, 70, 1, 1], [1850, 70, -1, 1], [70, 1010, 1, -1], [1850, 1010, -1, -1]].map((c, i) => (
          <path key={i} d={`M ${c[0]} ${c[1] + 46 * c[3]} L ${c[0]} ${c[1]} L ${c[0] + 46 * c[2]} ${c[1]}`} fill="none" stroke={HUD} strokeWidth="2.4" opacity="0.7" filter="url(#g1)" />
        ))}

        {/* title */}
        <text x={CXP} y="112" fontSize="30" fill={INK} fontWeight="800" textAnchor="middle" letterSpacing="10" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">DATA CORE</text>
        <text x={CXP} y="140" fontSize="15" fill={SUB} fontWeight="600" textAnchor="middle" letterSpacing="5" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">NEURAL SYNC · ONLINE</text>
        <line x1={CXP - 90} y1="122" x2={CXP - 60} y2="122" stroke={CYAN} strokeWidth="2" opacity="0.7" />
        <line x1={CXP + 60} y1="122" x2={CXP + 90} y2="122" stroke={CYAN} strokeWidth="2" opacity="0.7" />

        {/* left readouts */}
        {READ_L.map((r, i) => {
          const y = 400 + i * 96;
          const val = r.b + r.a * lsin(t, r.k, i);
          const barW = 150 * (0.55 + 0.45 * (0.5 + 0.5 * lsin(t, r.k, i)));
          return (
            <g key={i}>
              <text x="96" y={y} fontSize="14" fill={SUB} fontWeight="700" letterSpacing="2" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">{r.l}</text>
              <text x="96" y={y + 30} fontSize="28" fill={INK} fontWeight="800" fontFamily="'DejaVu Sans Mono', ui-monospace, monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>{val.toFixed(r.a < 1 ? 1 : 0)}</text>
              <text x={val >= 1000 ? 232 : 190} y={y + 30} fontSize="14" fill={SUB} fontWeight="600" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">{r.u}</text>
              <rect x="96" y={y + 44} width="150" height="4" rx="2" fill="rgba(120,160,220,0.16)" />
              <rect x="96" y={y + 44} width={barW} height="4" rx="2" fill={CYAN} filter="url(#g1)" />
            </g>
          );
        })}
        {/* right readouts */}
        {READ_R.map((r, i) => {
          const y = 400 + i * 96;
          const val = r.b + r.a * lsin(t, r.k, i + 2);
          const barW = 150 * (0.55 + 0.45 * (0.5 + 0.5 * lsin(t, r.k, i + 2)));
          return (
            <g key={i}>
              <text x="1824" y={y} fontSize="14" fill={SUB} fontWeight="700" letterSpacing="2" textAnchor="end" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">{r.l}</text>
              <text x="1824" y={y + 30} fontSize="28" fill={INK} fontWeight="800" textAnchor="end" fontFamily="'DejaVu Sans Mono', ui-monospace, monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>{val.toFixed(r.a < 1 ? 1 : 0)}</text>
              <text x="1824" y={y + 52} fontSize="14" fill={SUB} fontWeight="600" textAnchor="end" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">{r.u}</text>
              <rect x="1674" y={y + 44} width="150" height="4" rx="2" fill="rgba(120,160,220,0.16)" />
              <rect x={1824 - barW} y={y + 44} width={barW} height="4" rx="2" fill={VIOLET} filter="url(#g1)" />
            </g>
          );
        })}

        {/* bottom status */}
        <text x={CXP} y="1000" fontSize="15" fill={SUB} fontWeight="600" textAnchor="middle" letterSpacing="4" fontFamily="'DejaVu Sans Mono', ui-monospace, monospace">
          {`■ ENCRYPTED   ◆ ${Math.round(60 + 5 * lsin(t, 3)).toString()}fps   ▲ STABLE   ● ${(2048 + Math.round(16 * lsin(t, 2))).toString()} NODES`}
        </text>

        {/* grain + vignette */}
        <rect x="0" y="0" width="1920" height="1080" filter="url(#hgrain)" opacity="0.04" style={{ mixBlendMode: 'overlay' }} />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#hvig)" />
      </svg>
    </AbsoluteFill>
  );
};
