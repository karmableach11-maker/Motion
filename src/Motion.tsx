import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================
// SECURE FILE ENCRYPTION — CLEAN / PREMIUM-GRADE
// Plain documents leave the source folder, pass through a
// glowing security shield, and emerge encrypted (binary +
// lock badge) into the destination folder. Progress ring
// resolves into a locked padlock.
// 15s • 60fps • 1920x1080 • deterministic
// ============================================================

const W = 1920;
const H = 1080;

// ---- Timeline (frames @60fps) ------------------------------
const T_START = 90;
const T_END = 780;
const DOC_COUNT = 12;
const DOC_STAGGER = 50;
const LEG = 52; // frames per flight leg (in / out)
const PROCESS = 16; // frames inside the shield

// ---- Palette -----------------------------------------------
const COL = {
  bgTop: '#101726',
  bgBottom: '#070B14',
  amber1: '#FFC24B',
  amber2: '#F98A1F',
  amberDeep: '#C05E10',
  lip: '#FFE0B0',
  ink: '#EAF0FA',
  dim: 'rgba(234,240,250,0.55)',
  line: 'rgba(234,240,250,0.14)',
  encHi: '#26345A',
  encLo: '#131D38',
};

// ---- Geometry ----------------------------------------------
const SHIELD = {x: 960, y: 588};
const RING = {x: 960, y: 288, r: 114};

// left pocket -> shield
const A0 = {x: 430, y: 662};
const A1 = {x: 640, y: 462};
const A2 = {x: SHIELD.x, y: SHIELD.y};
// shield -> right pocket
const B0 = {x: SHIELD.x, y: SHIELD.y};
const B1 = {x: 1280, y: 462};
const B2 = {x: 1490, y: 662};

const bezier = (
  t: number,
  p0: {x: number; y: number},
  p1: {x: number; y: number},
  p2: {x: number; y: number}
) => {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
};

const easeFlight = Easing.inOut(Easing.cubic);

const SHIELD_PATH =
  'M130 14 L238 56 V148 c0 82 -62 122 -108 138 C84 270 22 230 22 148 V56 Z';

// ============================================================
// Folder — two layers so documents pass through the pocket
// ============================================================
const Folder: React.FC<{
  id: string;
  flap: number;
  paperLift: number;
  layer: 'back' | 'front';
}> = ({id, flap, paperLift, layer}) => {
  const lift = paperLift * 26;
  return (
    <svg width={340} height={280} viewBox="0 0 340 280">
      <defs>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COL.amber2} />
          <stop offset="1" stopColor={COL.amberDeep} />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COL.amber1} />
          <stop offset="1" stopColor={COL.amber2} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="0.45" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {layer === 'back' ? (
        <>
          <ellipse
            cx="170"
            cy="262"
            rx="128"
            ry="16"
            fill="rgba(0,0,0,0.5)"
            filter={`url(#${id}-soft)`}
          />
          <path
            d="M36 70 q0 -12 12 -12 h74 l24 -20 q5 -4 12 -4 h62 q12 0 12 12 v24 h60 q12 0 12 12 v140 q0 12 -12 12 H48 q-12 0 -12 -12 Z"
            fill={`url(#${id}-back)`}
          />
          <g transform={`translate(0 ${-lift})`}>
            <rect x="82" y="86" width="104" height="120" rx="8" fill="#F4F7FC" transform="rotate(-5 134 146)" />
            <rect x="150" y="80" width="110" height="126" rx="8" fill="#FFFFFF" transform="rotate(4 205 143)" />
            <g stroke="#C9D4E6" strokeWidth="5" strokeLinecap="round" transform="rotate(4 205 143)">
              <line x1="166" y1="104" x2="244" y2="104" />
              <line x1="166" y1="122" x2="232" y2="122" />
              <line x1="166" y1="140" x2="240" y2="140" />
            </g>
          </g>
        </>
      ) : (
        <>
          <rect x="36" y="118" width="268" height="16" rx="8" fill={COL.lip} />
          <g
            style={{
              transformOrigin: '170px 234px',
              transform: `scaleY(${1 - flap * 0.14}) skewX(${-flap * 5}deg)`,
            }}
          >
            <path
              d="M40 132 q0 -12 12 -12 h236 q12 0 12 12 v90 q0 12 -12 12 H52 q-12 0 -12 -12 Z"
              fill={`url(#${id}-front)`}
            />
            <path
              d="M40 132 q0 -12 12 -12 h236 q12 0 12 12 v90 q0 12 -12 12 H52 q-12 0 -12 -12 Z"
              fill={`url(#${id}-sheen)`}
            />
          </g>
        </>
      )}
    </svg>
  );
};

// ============================================================
// Plain document — glassy white sheet
// ============================================================
const Doc: React.FC<{glow?: boolean}> = ({glow = true}) => (
  <svg width={92} height={112} viewBox="0 0 92 112">
    <defs>
      <linearGradient id="docFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="rgba(255,255,255,0.26)" />
        <stop offset="1" stopColor="rgba(255,255,255,0.09)" />
      </linearGradient>
      <filter id="docGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="5" result="b1" />
        <feGaussianBlur in="b1" stdDeviation="6" result="b2" />
        <feMerge>
          <feMergeNode in="b2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter={glow ? 'url(#docGlow)' : undefined}>
      <path
        d="M16 8 h40 l20 20 v76 a8 8 0 0 1 -8 8 H16 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 Z"
        fill="url(#docFill)"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M56 8 v14 a6 6 0 0 0 6 6 h14" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
      <g stroke={COL.dim} strokeWidth="3.5" strokeLinecap="round">
        <line x1="22" y1="52" x2="62" y2="52" />
        <line x1="22" y1="66" x2="70" y2="66" />
        <line x1="22" y1="80" x2="54" y2="80" />
      </g>
      <line x1="22" y1="38" x2="48" y2="38" stroke={COL.amber1} strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// ============================================================
// Encrypted document — dark sheet, binary rows, lock badge
// ============================================================
const EncDoc: React.FC = () => (
  <svg width={92} height={112} viewBox="0 0 92 112">
    <defs>
      <linearGradient id="encFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={COL.encHi} />
        <stop offset="1" stopColor={COL.encLo} />
      </linearGradient>
      <linearGradient id="encBadge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={COL.amber1} />
        <stop offset="1" stopColor={COL.amber2} />
      </linearGradient>
      <filter id="encGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="5" result="b1" />
        <feGaussianBlur in="b1" stdDeviation="6" result="b2" />
        <feMerge>
          <feMergeNode in="b2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#encGlow)">
      <path
        d="M16 8 h40 l20 20 v76 a8 8 0 0 1 -8 8 H16 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 Z"
        fill="url(#encFill)"
        stroke={COL.amber1}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M56 8 v14 a6 6 0 0 0 6 6 h14" fill="none" stroke={COL.amber1} strokeWidth="4" strokeLinejoin="round" />
      {/* binary rows */}
      <text x="20" y="46" fontFamily="Consolas, Menlo, monospace" fontSize="13" fontWeight="700" fill={COL.amber1} opacity="0.9">
        101101
      </text>
      <text x="20" y="63" fontFamily="Consolas, Menlo, monospace" fontSize="13" fontWeight="700" fill={COL.dim} opacity="0.8">
        011010
      </text>
      <text x="20" y="80" fontFamily="Consolas, Menlo, monospace" fontSize="13" fontWeight="700" fill={COL.amber1} opacity="0.65">
        110011
      </text>
      {/* lock badge */}
      <circle cx="66" cy="90" r="14" fill="url(#encBadge)" />
      <rect x="60" y="88" width="12" height="9" rx="2.5" fill={COL.encLo} />
      <path d="M62.5 88 v-3.5 a3.5 3.5 0 0 1 7 0 V88" fill="none" stroke={COL.encLo} strokeWidth="2.5" />
    </g>
  </svg>
);

// ============================================================
// Main composition
// ============================================================
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ---------------- global progress ----------------
  const progress = interpolate(frame, [T_START, T_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const pct = Math.min(100, Math.round(progress * 100));
  const done = frame > T_END;

  // ---------------- entrances ----------------
  const inL = spring({frame: frame - 8, fps, config: {damping: 14, mass: 0.9}});
  const inR = spring({frame: frame - 20, fps, config: {damping: 14, mass: 0.9}});
  const inShield = spring({frame: frame - 32, fps, config: {damping: 12, mass: 0.9}});
  const inRing = interpolate(frame, [52, 86], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ---------------- activity envelope ----------------
  const activity = interpolate(
    frame,
    [T_START - 24, T_START + 12, T_END - 6, T_END + 30],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)}
  );
  const breathe = Math.sin((frame / fps) * Math.PI * 0.8) * 0.5 + 0.5;

  // ---------------- pulses ----------------
  let emitPulse = 0;
  let processPulse = 0;
  let arrivePulse = 0;
  let scanT = -1; // 0..1 within the most recent process window
  for (let i = 0; i < DOC_COUNT; i++) {
    const emit = T_START + i * DOC_STAGGER;
    const absorb = emit + LEG;
    const arrive = absorb + PROCESS + LEG;
    emitPulse += interpolate(frame - emit, [0, 5, 26], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    processPulse += interpolate(frame - absorb, [0, 4, PROCESS + 10], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    arrivePulse += interpolate(frame - arrive, [0, 5, 28], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    if (frame >= absorb && frame <= absorb + PROCESS) {
      scanT = (frame - absorb) / PROCESS;
    }
  }
  emitPulse = Math.min(1, emitPulse);
  processPulse = Math.min(1, processPulse);
  arrivePulse = Math.min(1, arrivePulse);

  // ---------------- completion ----------------
  const doneSpring = spring({frame: frame - (T_END + 10), fps, config: {damping: 10, mass: 0.8}});
  const lockDraw = interpolate(frame, [T_END + 6, T_END + 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const shackleClose = spring({frame: frame - (T_END + 34), fps, config: {damping: 13, mass: 0.7}});
  const numberOut = interpolate(frame, [T_END + 2, T_END + 16], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringFlash = interpolate(frame - T_END, [0, 6, 44], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clickFlash = interpolate(frame - (T_END + 38), [0, 4, 26], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- global fade out ----------------
  const fadeOut = interpolate(frame, [872, 900], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- ring geometry ----------------
  const RING_C = 2 * Math.PI * RING.r;

  // ---------------- ambient particles + binary drift ----------------
  const particles = Array.from({length: 24}, (_, i) => {
    const px = random(`px${i}`) * W;
    const py = random(`py${i}`) * H;
    const pr = 1.5 + random(`pr${i}`) * 3;
    const ph = random(`ph${i}`) * Math.PI * 2;
    const sp = 0.15 + random(`ps${i}`) * 0.35;
    const dx = Math.sin((frame / fps) * sp * 2 + ph) * 26;
    const dy = Math.cos((frame / fps) * sp * 1.6 + ph) * 18;
    const op = 0.04 + random(`po${i}`) * 0.1;
    return {x: px + dx, y: py + dy, r: pr, op};
  });
  const binics = Array.from({length: 14}, (_, i) => {
    const bx = 120 + random(`bx${i}`) * (W - 240);
    const by = 100 + random(`by${i}`) * (H - 200);
    const ph = random(`bh${i}`) * Math.PI * 2;
    const dy = Math.sin((frame / fps) * 0.5 + ph) * 30;
    const op = (0.03 + random(`bo${i}`) * 0.05) * (0.6 + 0.4 * Math.sin((frame / fps) * 0.9 + ph));
    const glyph = random(`bg${i}`) > 0.5 ? '1' : '0';
    return {x: bx, y: by + dy, op: Math.max(0, op), glyph, size: 20 + random(`bs${i}`) * 16};
  });

  const folderLTransform = `scale(${inL * (1 - emitPulse * 0.035)}) translateY(${breathe * -4}px)`;
  const folderRTransform = `scale(${inR * (1 + arrivePulse * 0.05 + (done ? (1 - Math.abs(1 - doneSpring)) * 0.04 : 0))}) translateY(${(1 - breathe) * -4}px)`;

  const guideA = `M ${A0.x} ${A0.y - 60} Q ${A1.x} ${A1.y} ${A2.x} ${A2.y}`;
  const guideB = `M ${B0.x} ${B0.y} Q ${B1.x} ${B1.y} ${B2.x} ${B2.y - 60}`;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at 50% 36%, ${COL.bgTop} 0%, ${COL.bgBottom} 100%)`,
        fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <AbsoluteFill style={{opacity: fadeOut}}>
        {/* ---------- ambient dust + drifting binary ---------- */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {particles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={COL.ink} opacity={p.op} />
          ))}
          {binics.map((b, i) => (
            <text
              key={`b${i}`}
              x={b.x}
              y={b.y}
              fontFamily="Consolas, Menlo, monospace"
              fontSize={b.size}
              fill={COL.ink}
              opacity={b.op}
            >
              {b.glyph}
            </text>
          ))}
          <line x1={300} y1={912} x2={1620} y2={912} stroke={COL.line} strokeWidth={2} strokeLinecap="round" />
        </svg>

        {/* ---------- guide curves ---------- */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: activity}}>
          {[guideA, guideB].map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={COL.line}
              strokeWidth={2.5}
              strokeDasharray="3 15"
              strokeDashoffset={-frame * 1.5}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* ---------- folders BACK layers ---------- */}
        <div
          style={{
            position: 'absolute',
            left: 430 - 170,
            top: 620 - 140,
            transform: folderLTransform,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder id="fLb" layer="back" flap={activity * (0.55 + emitPulse * 0.45)} paperLift={activity * (0.4 + breathe * 0.3)} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1490 - 170,
            top: 620 - 140,
            transform: folderRTransform,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder id="fRb" layer="back" flap={activity * (0.4 + arrivePulse * 0.6)} paperLift={Math.min(1, progress * 0.5 + arrivePulse * 0.5)} />
        </div>

        {/* ---------- flying documents ---------- */}
        {Array.from({length: DOC_COUNT}, (_, i) => {
          const emit = T_START + i * DOC_STAGGER;
          const absorb = emit + LEG;
          const exit = absorb + PROCESS;

          const nodes: React.ReactNode[] = [];

          // leg A: plain doc, folder pocket -> shield
          const renderPlain = (tRaw: number, opMul: number, key: string) => {
            if (tRaw <= 0 || tRaw >= 1) return null;
            const t = easeFlight(tRaw);
            const pos = bezier(t, A0, A1, A2);
            const op =
              interpolate(tRaw, [0, 0.1, 0.8, 1], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }) * opMul;
            const sc = interpolate(tRaw, [0, 0.16, 0.75, 1], [0.55, 0.95, 0.9, 0.4], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const rot = Math.sin(tRaw * Math.PI * 2 + i) * 6;
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  left: pos.x - 46,
                  top: pos.y - 56,
                  opacity: op,
                  transform: `scale(${sc}) rotate(${rot}deg)`,
                }}
              >
                <Doc glow={opMul === 1} />
              </div>
            );
          };

          // leg B: encrypted doc, shield -> folder pocket
          const renderEnc = (tRaw: number, opMul: number, key: string) => {
            if (tRaw <= 0 || tRaw >= 1) return null;
            const t = easeFlight(tRaw);
            const pos = bezier(t, B0, B1, B2);
            const op =
              interpolate(tRaw, [0, 0.14, 0.9, 1], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }) * opMul;
            const sc = interpolate(tRaw, [0, 0.22, 0.8, 1], [0.4, 0.95, 0.9, 0.6], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const rot = Math.sin(tRaw * Math.PI * 2 + i + 2) * 6;
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  left: pos.x - 46,
                  top: pos.y - 56,
                  opacity: op,
                  transform: `scale(${sc}) rotate(${rot}deg)`,
                }}
              >
                <EncDoc />
              </div>
            );
          };

          const localA = (frame - emit) / LEG;
          nodes.push(renderPlain(localA - 0.1, 0.1, `pa2-${i}`));
          nodes.push(renderPlain(localA - 0.05, 0.22, `pa1-${i}`));
          nodes.push(renderPlain(localA, 1, `pa-${i}`));

          const localB = (frame - exit) / LEG;
          nodes.push(renderEnc(localB - 0.1, 0.1, `pb2-${i}`));
          nodes.push(renderEnc(localB - 0.05, 0.22, `pb1-${i}`));
          nodes.push(renderEnc(localB, 1, `pb-${i}`));

          return <React.Fragment key={i}>{nodes}</React.Fragment>;
        })}

        {/* ---------- security shield (center) ---------- */}
        <div
          style={{
            position: 'absolute',
            left: SHIELD.x - 130,
            top: SHIELD.y - 150,
            transform: `scale(${inShield * (1 + processPulse * 0.05)}) translateY(${breathe * -5}px)`,
            transformOrigin: '50% 50%',
          }}
        >
          <svg width={260} height={300} viewBox="0 0 260 300">
            <defs>
              <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(38,52,90,0.92)" />
                <stop offset="1" stopColor="rgba(16,24,46,0.92)" />
              </linearGradient>
              <linearGradient id="shieldRim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.amber1} />
                <stop offset="1" stopColor={COL.amber2} />
              </linearGradient>
              <filter id="shieldGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="8" result="b1" />
                <feGaussianBlur in="b1" stdDeviation="14" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                </feMerge>
              </filter>
              <clipPath id="shieldClip">
                <path d={SHIELD_PATH} />
              </clipPath>
            </defs>

            {/* halo — intensifies while processing */}
            <path
              d={SHIELD_PATH}
              fill={COL.amber2}
              opacity={0.14 + processPulse * 0.3 + breathe * 0.04}
              filter="url(#shieldGlow)"
            />

            {/* body */}
            <path d={SHIELD_PATH} fill="url(#shieldFill)" />
            <path d={SHIELD_PATH} fill="none" stroke="url(#shieldRim)" strokeWidth="5" strokeLinejoin="round" />

            {/* keyhole glyph */}
            <circle cx="130" cy="128" r="26" fill="none" stroke={COL.amber1} strokeWidth="9" opacity={0.9 + processPulse * 0.1} />
            <path
              d="M130 146 l-11 46 h22 Z"
              fill={COL.amber1}
              opacity={0.9 + processPulse * 0.1}
            />

            {/* scanline sweep while a document is being encrypted */}
            {scanT >= 0 ? (
              <g clipPath="url(#shieldClip)">
                <rect
                  x="0"
                  y={20 + scanT * 240 - 14}
                  width="260"
                  height="28"
                  fill={COL.amber1}
                  opacity={0.3 * Math.sin(scanT * Math.PI)}
                />
                <rect
                  x="0"
                  y={20 + scanT * 240 - 2}
                  width="260"
                  height="4"
                  fill="#FFFFFF"
                  opacity={0.8 * Math.sin(scanT * Math.PI)}
                />
              </g>
            ) : null}
          </svg>
        </div>

        {/* ---------- folders FRONT layers ---------- */}
        <div
          style={{
            position: 'absolute',
            left: 430 - 170,
            top: 620 - 140,
            transform: folderLTransform,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder id="fLf" layer="front" flap={activity * (0.55 + emitPulse * 0.45)} paperLift={activity * (0.4 + breathe * 0.3)} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 1490 - 170,
            top: 620 - 140,
            transform: folderRTransform,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder id="fRf" layer="front" flap={activity * (0.4 + arrivePulse * 0.6)} paperLift={Math.min(1, progress * 0.5 + arrivePulse * 0.5)} />
        </div>

        {/* ---------- progress ring -> locked padlock ---------- */}
        <svg
          width={W}
          height={H}
          style={{
            position: 'absolute',
            opacity: inRing,
            transform: `scale(${0.9 + inRing * 0.1})`,
            transformOrigin: `${RING.x}px ${RING.y}px`,
          }}
        >
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={COL.amber1} />
              <stop offset="1" stopColor={COL.amber2} />
            </linearGradient>
            <filter id="ringGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="b1" />
              <feGaussianBlur in="b1" stdDeviation="10" result="b2" />
              <feMerge>
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={RING.x} cy={RING.y} r={RING.r} fill="none" stroke="rgba(234,240,250,0.1)" strokeWidth={10} />

          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
            transform={`rotate(-90 ${RING.x} ${RING.y})`}
            filter="url(#ringGlow)"
          />

          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.r}
            fill="none"
            stroke={COL.amber1}
            strokeWidth={14}
            opacity={ringFlash * 0.55 + clickFlash * 0.4}
            filter="url(#ringGlow)"
          />

          {/* locked padlock (drawn after 100%) */}
          {done ? (
            <g
              filter="url(#ringGlow)"
              style={{
                transformOrigin: `${RING.x}px ${RING.y}px`,
                transform: `scale(${0.9 + (1 - Math.abs(1 - doneSpring)) * 0.1 + clickFlash * 0.04})`,
              }}
            >
              {/* shackle — closes with a click */}
              <path
                d={`M ${RING.x - 26} ${RING.y - 6} v -20 a 26 26 0 0 1 52 0 v 20`}
                fill="none"
                stroke={COL.amber1}
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={130}
                strokeDashoffset={130 * (1 - lockDraw)}
                transform={`translate(0 ${-14 + shackleClose * 14})`}
              />
              {/* body */}
              <rect
                x={RING.x - 42}
                y={RING.y - 6}
                width={84}
                height={64}
                rx={12}
                fill="url(#ringGrad)"
                opacity={lockDraw}
              />
              <circle cx={RING.x} cy={RING.y + 20} r={9} fill={COL.encLo} opacity={lockDraw} />
              <rect x={RING.x - 3.5} y={RING.y + 22} width={7} height={16} rx={3.5} fill={COL.encLo} opacity={lockDraw} />
            </g>
          ) : null}
        </svg>

        {/* ---------- percentage counter ---------- */}
        <div
          style={{
            position: 'absolute',
            left: RING.x - 150,
            top: RING.y - 44,
            width: 300,
            textAlign: 'center',
            fontSize: 72,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: COL.ink,
            fontVariantNumeric: 'tabular-nums',
            opacity: inRing * numberOut,
          }}
        >
          {pct}
          <span style={{fontSize: 40, fontWeight: 500, color: COL.dim, marginLeft: 6}}>%</span>
        </div>

        {/* ---------- subtle vignette ---------- */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(1400px 900px at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
