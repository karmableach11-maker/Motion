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
 * PREMIUM — "Data Transfer Folders v2"
 * Tiga folder (biru, ungu, pink) di atas lantai gelap. Setiap folder
 * memancarkan jenis file berbeda: biru = dokumen teks, ungu = lembar kode,
 * pink = foto/gambar. File berpindah bergiliran antar ketiga folder.
 * Loop sempurna 15 s @ 60 fps (900 frames), deterministik penuh.
 */

const W = 1920;
const H = 1080;
const LOOP = 900;
const CYCLE = 150;
const ACTIVE = 170;
const N_DOCS = 6;
const FLOOR = 800;

type FolderDef = {
  cx: number;
  top: number;
  w: number;
  h: number;
  front: string;
  back: string;
  glow: string;
};

const FOLDERS: FolderDef[] = [
  {cx: 400, top: 470, w: 390, h: 295, front: 'gradFrontBlue', back: 'gradBackBlue', glow: 'glowBlue'},
  {cx: 960, top: 432, w: 360, h: 275, front: 'gradFrontPurple', back: 'gradBackPurple', glow: 'glowPurple'},
  {cx: 1520, top: 470, w: 390, h: 295, front: 'gradFrontPink', back: 'gradBackPink', glow: 'glowPink'},
];

// [asal, tujuan] — setiap folder mengirim & menerima secara bergiliran
const ROUTES: Array<[number, number]> = [
  [0, 1], // biru  -> ungu
  [1, 2], // ungu  -> pink
  [2, 0], // pink  -> biru
  [0, 2], // biru  -> pink
  [1, 0], // ungu  -> biru
  [2, 1], // pink  -> ungu
];

const clampOpt = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

const bump = (p: number, a: number, b: number) =>
  p <= a || p >= b ? 0 : Math.sin(((p - a) / (b - a)) * Math.PI);

// ---------- lintasan dokumen antar dua folder ----------
const docPose = (p: number, i: number) => {
  const [fi, ti] = ROUTES[i];
  const from = FOLDERS[fi];
  const to = FOLDERS[ti];

  const startX = from.cx + (random(`sx-${i}`) - 0.5) * 30;
  const endX = to.cx + (random(`ex-${i}`) - 0.5) * 24;
  const startY = from.top + from.h * 0.6;
  const riseTopY = from.top - 128 - random(`rt-${i}`) * 26;
  const dropStartY = to.top - 104;
  const endY = to.top + to.h * 0.62;

  const dx = endX - startX;
  const dir = dx >= 0 ? 1 : -1;
  const arcH = 60 + (Math.abs(dx) / 1120) * 95;

  const riseY = interpolate(p, [0, 0.24], [startY, riseTopY], {
    ...clampOpt,
    easing: Easing.out(Easing.cubic),
  });
  const ft = interpolate(p, [0.24, 0.76], [0, 1], {
    ...clampOpt,
    easing: Easing.inOut(Easing.cubic),
  });
  const flyX = interpolate(ft, [0, 1], [startX, endX]);
  const arcY =
    interpolate(ft, [0, 1], [riseTopY, dropStartY]) - Math.sin(Math.PI * ft) * arcH;
  const dropY = interpolate(p, [0.76, 1], [dropStartY, endY], {
    ...clampOpt,
    easing: Easing.in(Easing.cubic),
  });

  let x: number;
  let y: number;
  if (p < 0.24) {
    x = startX;
    y = riseY;
  } else if (p < 0.76) {
    x = flyX;
    y = arcY;
  } else {
    x = endX;
    y = dropY;
  }

  const rot =
    dir *
      interpolate(p, [0.08, 0.3, 0.5, 0.76, 0.92], [-3, 4.5, 7, 2, 0], clampOpt) +
    Math.sin(p * Math.PI * 3 + random(`wob-${i}`) * 6.28) * 1.4;
  const scale =
    0.88 * interpolate(p, [0.24, 0.8], [1, 0.94], clampOpt);
  return {x, y, rot, scale, fi, ti};
};

// ---------- tiga jenis lembar file (abstrak, generik, aman IP) ----------
const SheetText: React.FC<{i: number}> = ({i}) => (
  <g>
    <rect x={-150} y={-100} width={300} height={200} rx={7} fill="#f4f6f9" stroke="#ffffff" strokeWidth={2.5} />
    <rect x={-150} y={-100} width={300} height={200} rx={7} fill="url(#paperSheen)" />
    <rect x={-126} y={-84} width={92} height={9} rx={3} fill="#41506b" opacity={0.85} />
    <rect x={-24} y={-84} width={30} height={9} rx={3} fill="#c24e8e" opacity={0.7} />
    {Array.from({length: 7}, (_, r) => {
      const w1 = 40 + random(`t${i}-r${r}-a`) * 110;
      const w2 = 24 + random(`t${i}-r${r}-b`) * 70;
      const y = -62 + r * 21;
      return (
        <g key={r} opacity={0.55 + random(`t${i}-r${r}-o`) * 0.3}>
          <rect x={-126} y={y} width={w1} height={5.5} rx={2.5} fill="#7d8698" />
          <rect x={-126 + w1 + 10} y={y} width={w2} height={5.5} rx={2.5} fill="#7d8698" opacity={0.6} />
          {random(`t${i}-r${r}-c`) > 0.62 ? (
            <rect x={62 + random(`t${i}-r${r}-x`) * 48} y={y - 1} width={8} height={8} rx={1.5} fill="#3fa8e8" opacity={0.9} />
          ) : null}
        </g>
      );
    })}
    <rect x={-126} y={78} width={150} height={4.5} rx={2} fill="#7d8698" opacity={0.4} />
  </g>
);

const SheetCode: React.FC<{i: number}> = ({i}) => (
  <g>
    <rect x={-150} y={-100} width={300} height={200} rx={7} fill="#10151f" stroke="#2c3a52" strokeWidth={2.5} />
    <rect x={-150} y={-100} width={300} height={200} rx={7} fill="url(#paperSheen)" opacity={0.4} />
    <circle cx={-134} cy={-86} r={4} fill="#ff5f57" />
    <circle cx={-120} cy={-86} r={4} fill="#febc2e" />
    <circle cx={-106} cy={-86} r={4} fill="#28c840" />
    {Array.from({length: 8}, (_, r) => {
      const indent = [0, 16, 32, 16, 0, 16, 32, 0][r];
      const w1 = 30 + random(`c${i}-r${r}-a`) * 80;
      const w2 = 20 + random(`c${i}-r${r}-b`) * 60;
      const y = -66 + r * 19;
      const col1 = ['#5fd2c8', '#c792ea', '#82aaff'][r % 3];
      const col2 = ['#ffb454', '#89ddff', '#c3e88d'][(r + 1) % 3];
      return (
        <g key={r} opacity={0.8}>
          <rect x={-128 + indent} y={y} width={w1} height={5.5} rx={2.5} fill={col1} />
          <rect x={-128 + indent + w1 + 8} y={y} width={w2} height={5.5} rx={2.5} fill={col2} opacity={0.75} />
        </g>
      );
    })}
  </g>
);

const SheetPhoto: React.FC<{i: number}> = ({i}) => {
  const sunX = -30 + random(`ph${i}-sun`) * 80;
  return (
    <g>
      <rect x={-150} y={-100} width={300} height={200} rx={7} fill="#fdfdfd" stroke="#ffffff" strokeWidth={2.5} />
      <g>
        <rect x={-134} y={-84} width={268} height={140} rx={4} fill="url(#photoSky)" />
        <circle cx={sunX} cy={-46} r={16} fill="#ffd98a" opacity={0.95} />
        <path d={`M -134 56 L -70 -12 L -22 34 L 30 -24 L 92 42 L 134 8 L 134 56 Z`} fill="#3d6aa6" opacity={0.9} />
        <path d={`M -134 56 L -96 18 L -48 56 Z`} fill="#2b4d7e" opacity={0.9} />
        <rect x={-134} y={-84} width={268} height={140} rx={4} fill="none" stroke="#e2e6ec" strokeWidth={1.5} />
      </g>
      <rect x={-134} y={68} width={110 + random(`ph${i}-cap`) * 60} height={6} rx={3} fill="#9aa4b4" opacity={0.8} />
      <rect x={-134} y={82} width={70} height={5} rx={2.5} fill="#c3cad6" opacity={0.8} />
    </g>
  );
};

const SHEETS = [SheetText, SheetCode, SheetPhoto];

// ---------- folder ----------
const Folder: React.FC<{
  f: FolderDef;
  open: number;
  layer: 'back' | 'front';
}> = ({f, open, layer}) => {
  const x = f.cx - f.w / 2;
  if (layer === 'back') {
    return (
      <g>
        <rect x={x + 22} y={f.top - 26} width={f.w} height={f.h} rx={24} fill={`url(#${f.back})`} opacity={0.94} />
        <rect x={x + 16} y={f.top - 48 - open * 7} width={f.w * 0.4} height={62} rx={12} fill={`url(#${f.back})`} />
        <rect x={x + 6} y={f.top + 4} width={f.w - 12} height={f.h - 8} rx={22} fill="#0b1220" opacity={0.9} />
      </g>
    );
  }
  const pivotX = f.cx;
  const pivotY = f.top + f.h;
  return (
    <g transform={`rotate(${-open * 7} ${pivotX} ${pivotY})`}>
      <rect x={x} y={f.top} width={f.w} height={f.h} rx={26} fill="none" stroke="#cfe9ff" strokeWidth={9} opacity={0.28 + open * 0.22} filter="url(#blurWide)" />
      <rect x={x} y={f.top} width={f.w} height={f.h} rx={26} fill={`url(#${f.front})`} />
      <rect x={x} y={f.top} width={f.w} height={f.h} rx={26} fill="url(#frontSheen)" />
      <rect x={x} y={f.top} width={f.w} height={f.h} rx={26} fill="none" stroke="#eaf6ff" strokeWidth={1.6} opacity={0.45} />
      {open > 0.01 ? (
        <rect x={x} y={f.top} width={f.w} height={f.h} rx={26} fill="#ffffff" opacity={open * 0.12} />
      ) : null}
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  void fps;
  const t = frame;

  // ---------- status dokumen aktif ----------
  const docs = Array.from({length: N_DOCS}, (_, i) => {
    const local = ((t - i * CYCLE) % LOOP + LOOP) % LOOP;
    const active = local < ACTIVE;
    const p = active ? local / ACTIVE : -1;
    return {i, active, p};
  }).filter((d) => d.active);

  // keterbukaan flap per folder (mengirim penuh, menerima lebih halus)
  const opens = [0, 0, 0];
  for (const d of docs) {
    const [fi, ti] = ROUTES[d.i];
    opens[fi] = Math.max(opens[fi], bump(d.p, 0, 0.32));
    opens[ti] = Math.max(opens[ti], bump(d.p, 0.66, 1) * 0.6);
  }

  // gerak idle loop-perfect
  const ph = (k: number, off = 0) => Math.sin(((t / LOOP) * Math.PI * 2 * k) + off);
  const bobs = [ph(3) * 5, ph(3, Math.PI * 0.66) * 4.5, ph(3, Math.PI * 1.33) * 5];
  const camS = 1.03 + ph(1) * 0.012;
  const camX = ph(1, Math.PI / 2) * 10;

  // ---------- render dokumen + ghost trail ----------
  const renderDocs = docs.map((d) => {
    const pose = docPose(d.p, d.i);
    const Sheet = SHEETS[pose.fi];
    const ghosts =
      d.p > 0.28 && d.p < 0.78
        ? [1, 2].map((g) => {
            const gp = docPose(d.p - g * 0.02, d.i);
            return (
              <g
                key={g}
                transform={`translate(${gp.x} ${gp.y}) rotate(${gp.rot}) scale(${gp.scale})`}
                opacity={0.16 / g}
              >
                <rect x={-150} y={-100} width={300} height={200} rx={7} fill="#cfe6ff" />
              </g>
            );
          })
        : null;
    return (
      <g key={d.i}>
        {ghosts}
        <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.rot}) scale(${pose.scale})`}>
          <rect x={-150} y={-100} width={300} height={200} rx={7} fill="#9fdcff" opacity={0.32} filter="url(#blurSoft)" />
          <Sheet i={d.i} />
        </g>
      </g>
    );
  });

  // ---------- partikel ambient loop-perfect ----------
  const particles = Array.from({length: 14}, (_, i) => {
    const period = [300, 450, 900][i % 3];
    const p = (((t % period) / period) + random(`pp-${i}`)) % 1;
    const x = 200 + random(`px-${i}`) * 1520 + ph(2, i) * 14;
    const y = 840 - p * 560;
    const op = Math.sin(Math.PI * p) * (0.22 + random(`po-${i}`) * 0.28);
    const r = 2 + random(`pr-${i}`) * 3.5;
    const col = ['#7fd8ff', '#c58cff', '#ff7ad9'][i % 3];
    return <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={op} filter="url(#blurSoft)" />;
  });

  const scene = (
    <g>
      {FOLDERS.map((f, i) => (
        <g key={`b${i}`} transform={`translate(0 ${bobs[i]})`}>
          <Folder f={f} open={opens[i]} layer="back" />
        </g>
      ))}
      {renderDocs}
      {FOLDERS.map((f, i) => (
        <g key={`f${i}`} transform={`translate(0 ${bobs[i]})`}>
          <Folder f={f} open={opens[i]} layer="front" />
        </g>
      ))}
    </g>
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#07070c'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#181724" />
            <stop offset="55%" stopColor="#0d0d16" />
            <stop offset="100%" stopColor="#060609" />
          </radialGradient>
          <linearGradient id="gradFrontBlue" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#6fd4f7" />
            <stop offset="55%" stopColor="#3f9ae6" />
            <stop offset="100%" stopColor="#2a6fd0" />
          </linearGradient>
          <linearGradient id="gradBackBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b55c9" />
            <stop offset="100%" stopColor="#243a9e" />
          </linearGradient>
          <linearGradient id="gradFrontPurple" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#c084f5" />
            <stop offset="55%" stopColor="#9a4fe8" />
            <stop offset="100%" stopColor="#7430cf" />
          </linearGradient>
          <linearGradient id="gradBackPurple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a3ac9" />
            <stop offset="100%" stopColor="#54249c" />
          </linearGradient>
          <linearGradient id="gradFrontPink" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#ff8ed2" />
            <stop offset="55%" stopColor="#f24ba8" />
            <stop offset="100%" stopColor="#d62a8c" />
          </linearGradient>
          <linearGradient id="gradBackPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d13a9a" />
            <stop offset="100%" stopColor="#9c1f70" />
          </linearGradient>
          <linearGradient id="frontSheen" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="paperSheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#8fb0d8" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="photoSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fc6f2" />
            <stop offset="100%" stopColor="#d7ecfb" />
          </linearGradient>
          <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3f8cf0" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#2450b8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2450b8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowPurple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a35cf0" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#6c2fc0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6c2fc0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowPink" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5fc0" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#c22b90" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#c22b90" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="48%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="72%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>
          <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="reflMask">
            <rect x="0" y={FLOOR} width={W} height={H - FLOOR} fill="url(#reflFade)" />
          </mask>
          <filter id="blurSoft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="blurWide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.045 0"
            />
          </filter>
        </defs>

        {/* background + glow bawah tiap folder */}
        <rect width={W} height={H} fill="url(#bgGrad)" />
        {FOLDERS.map((f, i) => (
          <ellipse
            key={`g${i}`}
            cx={f.cx}
            cy={FLOOR + 40}
            rx={480}
            ry={125}
            fill={`url(#${f.glow})`}
            opacity={0.75 + opens[i] * 0.4}
          />
        ))}

        {/* refleksi lantai lembut */}
        <g transform={`translate(0 ${2 * FLOOR}) scale(1 -1)`} mask="url(#reflMask)" opacity={0.42}>
          {scene}
        </g>

        {/* scene utama + drift kamera halus */}
        <g transform={`translate(${W / 2 + camX} ${H / 2}) scale(${camS}) translate(${-W / 2} ${-H / 2})`}>
          {particles}
          {scene}
        </g>

        {/* finishing */}
        <rect width={W} height={H} fill="url(#vignette)" />
        <rect width={W} height={H} filter="url(#grain)" style={{mixBlendMode: 'overlay'}} opacity={0.7} />
      </svg>
    </AbsoluteFill>
  );
};
