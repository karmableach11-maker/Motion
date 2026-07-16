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
// FILE TRANSFER — CLEAN / PREMIUM-GRADE
// Two folders, documents flying across, circular progress ring.
// 15s • 60fps • 1920x1080 • deterministic
// ============================================================

const W = 1920;
const H = 1080;

// ---- Timeline (frames @60fps) ------------------------------
const T_START = 90; // transfer begins
const T_END = 780; // transfer completes (100%)
const DOC_COUNT = 12;
const DOC_TRAVEL = 110; // frames per document flight
const DOC_STAGGER = 52;

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
};

// ---- Path of flight (quadratic bezier) ---------------------
const P0 = {x: 600, y: 640};
const P1 = {x: 960, y: 508};
const P2 = {x: 1320, y: 640};

const bezier = (t: number) => {
  const mt = 1 - t;
  return {
    x: mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x,
    y: mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y,
  };
};

const easeFlight = Easing.inOut(Easing.cubic);

// ============================================================
// Folder — layered SVG with gradient body, inner lip, papers
// ============================================================
const Folder: React.FC<{
  id: string;
  flap: number; // 0..1 openness of front panel
  paperLift: number; // 0..1 papers peeking up
}> = ({id, flap, paperLift}) => {
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

      {/* grounded soft shadow */}
      <ellipse
        cx="170"
        cy="262"
        rx="128"
        ry="16"
        fill="rgba(0,0,0,0.5)"
        filter={`url(#${id}-soft)`}
      />

      {/* back panel with tab */}
      <path
        d="M36 70 q0 -12 12 -12 h74 l24 -20 q5 -4 12 -4 h62 q12 0 12 12 v24 h60 q12 0 12 12 v140 q0 12 -12 12 H48 q-12 0 -12 -12 Z"
        fill={`url(#${id}-back)`}
      />

      {/* papers inside */}
      <g transform={`translate(0 ${-lift})`}>
        <rect x="82" y="86" width="104" height="120" rx="8" fill="#F4F7FC" transform="rotate(-5 134 146)" />
        <rect x="150" y="80" width="110" height="126" rx="8" fill="#FFFFFF" transform="rotate(4 205 143)" />
        <g stroke="#C9D4E6" strokeWidth="5" strokeLinecap="round" transform="rotate(4 205 143)">
          <line x1="166" y1="104" x2="244" y2="104" />
          <line x1="166" y1="122" x2="232" y2="122" />
          <line x1="166" y1="140" x2="240" y2="140" />
        </g>
      </g>

      {/* inner lip */}
      <rect x="36" y="118" width="268" height="16" rx="8" fill={COL.lip} />

      {/* front panel — tilts open around its bottom edge */}
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
    </svg>
  );
};

// ============================================================
// Document icon — glassy sheet with folded corner
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
  const transferActive = frame >= T_START && frame <= T_END;
  const done = frame > T_END;

  // ---------------- entrances ----------------
  const inL = spring({frame: frame - 10, fps, config: {damping: 14, mass: 0.9}});
  const inR = spring({frame: frame - 24, fps, config: {damping: 14, mass: 0.9}});
  const inRing = interpolate(frame, [52, 84], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // ---------------- folder flap / paper activity ----------------
  const activity = interpolate(
    frame,
    [T_START - 24, T_START + 12, T_END - 6, T_END + 30],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)}
  );
  const breathe = Math.sin((frame / fps) * Math.PI * 0.8) * 0.5 + 0.5;

  // ---------------- emit / arrival pulses ----------------
  let emitPulse = 0;
  let arrivePulse = 0;
  for (let i = 0; i < DOC_COUNT; i++) {
    const emit = T_START + i * DOC_STAGGER;
    const arrive = emit + DOC_TRAVEL;
    emitPulse += interpolate(frame - emit, [0, 5, 26], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    arrivePulse += interpolate(frame - arrive, [0, 5, 28], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  emitPulse = Math.min(1, emitPulse);
  arrivePulse = Math.min(1, arrivePulse);

  // ---------------- completion ----------------
  const doneSpring = spring({frame: frame - (T_END + 8), fps, config: {damping: 11, mass: 0.8}});
  const checkDraw = interpolate(frame, [T_END + 6, T_END + 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const numberOut = interpolate(frame, [T_END + 2, T_END + 16], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringFlash = interpolate(frame - T_END, [0, 6, 40], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- global fade out ----------------
  const fadeOut = interpolate(frame, [872, 900], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- ring geometry ----------------
  const RING_R = 118;
  const RING_C = 2 * Math.PI * RING_R;
  const ringCx = 960;
  const ringCy = 300;

  // ---------------- guide line dash flow ----------------
  const dashOffset = -frame * 1.6;

  // ---------------- ambient particles ----------------
  const particles = Array.from({length: 26}, (_, i) => {
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

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at 50% 36%, ${COL.bgTop} 0%, ${COL.bgBottom} 100%)`,
        fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <AbsoluteFill style={{opacity: fadeOut}}>
        {/* ---------- ambient dust ---------- */}
        <svg width={W} height={H} style={{position: 'absolute'}}>
          {particles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={COL.ink} opacity={p.op} />
          ))}
          {/* faint floor line */}
          <line x1={300} y1={868} x2={1620} y2={868} stroke={COL.line} strokeWidth={2} strokeLinecap="round" />
        </svg>

        {/* ---------- flight path + data dots ---------- */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: activity}}>
          <defs>
            <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" result="b1" />
              <feGaussianBlur in="b1" stdDeviation="5" result="b2" />
              <feMerge>
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
            fill="none"
            stroke={COL.line}
            strokeWidth={2.5}
            strokeDasharray="3 16"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
          {/* small streaming data dots */}
          {Array.from({length: 5}, (_, i) => {
            const t = ((frame * 0.011 + i * 0.2) % 1 + 1) % 1;
            const pos = bezier(t);
            const op = Math.sin(t * Math.PI);
            return (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y - 6}
                r={4}
                fill={COL.amber1}
                opacity={op * 0.7}
                filter="url(#dotGlow)"
              />
            );
          })}
        </svg>

        {/* ---------- flying documents (with ghost trail) ---------- */}
        {Array.from({length: DOC_COUNT}, (_, i) => {
          const emit = T_START + i * DOC_STAGGER;
          const local = (frame - emit) / DOC_TRAVEL;
          if (local <= 0 || local >= 1) return null;
          const renderAt = (tRaw: number, opMul: number, key: string) => {
            if (tRaw <= 0 || tRaw >= 1) return null;
            const t = easeFlight(tRaw);
            const pos = bezier(t);
            const op =
              interpolate(tRaw, [0, 0.1, 0.88, 1], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }) * opMul;
            const sc = interpolate(tRaw, [0, 0.18, 0.85, 1], [0.55, 1, 1, 0.6], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const rot = Math.sin(tRaw * Math.PI * 2 + i) * 5;
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  left: pos.x - 46,
                  top: pos.y - 56 - 46,
                  opacity: op,
                  transform: `scale(${sc}) rotate(${rot}deg)`,
                }}
              >
                <Doc glow={opMul === 1} />
              </div>
            );
          };
          return (
            <React.Fragment key={i}>
              {renderAt(local - 0.1, 0.1, `g2-${i}`)}
              {renderAt(local - 0.05, 0.22, `g1-${i}`)}
              {renderAt(local, 1, `m-${i}`)}
            </React.Fragment>
          );
        })}

        {/* ---------- left folder (source) ---------- */}
        <div
          style={{
            position: 'absolute',
            left: 430 - 170,
            top: 620 - 140,
            transform: `scale(${inL * (1 - emitPulse * 0.035)}) translateY(${breathe * -4}px)`,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder id="fL" flap={activity * (0.55 + emitPulse * 0.45)} paperLift={activity * (0.4 + breathe * 0.3)} />
        </div>

        {/* ---------- right folder (destination) ---------- */}
        <div
          style={{
            position: 'absolute',
            left: 1490 - 170,
            top: 620 - 140,
            transform: `scale(${inR * (1 + arrivePulse * 0.05 + (done ? (1 - Math.abs(1 - doneSpring)) * 0.04 : 0))}) translateY(${(1 - breathe) * -4}px)`,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder
            id="fR"
            flap={activity * (0.4 + arrivePulse * 0.6)}
            paperLift={Math.min(1, progress * 0.5 + arrivePulse * 0.5)}
          />
        </div>

        {/* ---------- progress ring ---------- */}
        <svg
          width={W}
          height={H}
          style={{
            position: 'absolute',
            opacity: inRing,
            transform: `scale(${0.9 + inRing * 0.1})`,
            transformOrigin: `${ringCx}px ${ringCy}px`,
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

          {/* track */}
          <circle cx={ringCx} cy={ringCy} r={RING_R} fill="none" stroke="rgba(234,240,250,0.1)" strokeWidth={10} />

          {/* progress arc */}
          <circle
            cx={ringCx}
            cy={ringCy}
            r={RING_R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
            transform={`rotate(-90 ${ringCx} ${ringCy})`}
            filter="url(#ringGlow)"
          />

          {/* completion flash */}
          <circle
            cx={ringCx}
            cy={ringCy}
            r={RING_R}
            fill="none"
            stroke={COL.amber1}
            strokeWidth={14}
            opacity={ringFlash * 0.55}
            filter="url(#ringGlow)"
          />

          {/* checkmark */}
          <path
            d={`M ${ringCx - 52} ${ringCy + 4} l 38 38 l 66 -76`}
            fill="none"
            stroke={COL.amber1}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={220}
            strokeDashoffset={220 * (1 - checkDraw)}
            opacity={done ? 1 : 0}
            filter="url(#ringGlow)"
          />
        </svg>

        {/* ---------- percentage counter ---------- */}
        <div
          style={{
            position: 'absolute',
            left: ringCx - 150,
            top: ringCy - 44,
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
