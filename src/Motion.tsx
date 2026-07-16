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
// CLOUD DOWNLOAD — CLEAN / PREMIUM-GRADE
// Glowing cloud above, folder below, documents descending
// from the cloud into the folder pocket; the progress ring
// runs counter-clockwise and resolves into a checkmark.
// 15s • 60fps • 1920x1080 • deterministic
// ============================================================

const W = 1920;
const H = 1080;

// ---- Timeline (frames @60fps) ------------------------------
const T_START = 90;
const T_END = 780;
const DOC_COUNT = 12;
const DOC_TRAVEL = 104;
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
  cloudHi: '#F2F6FD',
  cloudLo: '#C3CEE2',
  slate: '#33415C',
};

// ---- Geometry ----------------------------------------------
const CLOUD = {x: 960, y: 352};
const RING_R = 232;
const PATH_TOP = 452; // docs emerge from the cloud here
const PATH_BOTTOM = 822; // inside the folder pocket (hidden by front panel)

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

// ============================================================
// Folder — layered SVG with gradient body, inner lip, papers
// ============================================================
// Rendered in two layers so flying documents can pass BETWEEN
// the folder's back panel and its front pocket — documents rise
// out of the folder opening instead of appearing behind it.
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
  const done = frame > T_END;

  // ---------------- entrances ----------------
  const inFolder = spring({frame: frame - 8, fps, config: {damping: 14, mass: 0.9}});
  const inCloud = spring({frame: frame - 24, fps, config: {damping: 13, mass: 0.9}});
  const inRing = interpolate(frame, [50, 84], [0, 1], {
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
  const cloudBob = Math.sin((frame / fps) * Math.PI * 0.66) * 7;

  // ---------------- emit (cloud) / arrive (folder) pulses ----------------
  let emitPulse = 0; // cloud releases a document
  let absorbPulse = 0; // folder receives a document
  for (let i = 0; i < DOC_COUNT; i++) {
    const emit = T_START + i * DOC_STAGGER;
    const arrive = emit + DOC_TRAVEL;
    emitPulse += interpolate(frame - emit, [0, 5, 26], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    absorbPulse += interpolate(frame - arrive, [0, 5, 30], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  emitPulse = Math.min(1, emitPulse);
  absorbPulse = Math.min(1, absorbPulse);

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
  const ringFlash = interpolate(frame - T_END, [0, 6, 44], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- global fade out ----------------
  const fadeOut = interpolate(frame, [872, 900], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- ring geometry ----------------
  const RING_C = 2 * Math.PI * RING_R;
  // counter-clockwise sweep for download
  const tipAngle = -Math.PI / 2 - progress * Math.PI * 2;
  const tip = {
    x: CLOUD.x + Math.cos(tipAngle) * RING_R,
    y: CLOUD.y + cloudBob * 0.3 + Math.sin(tipAngle) * RING_R,
  };

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

  // Two mirrored guide curves, defined cloud -> folder (downward)
  const guideL = `M ${960} ${PATH_TOP} Q ${810} ${(PATH_BOTTOM + PATH_TOP) / 2} ${960} ${PATH_BOTTOM}`;
  const guideR = `M ${960} ${PATH_TOP} Q ${1110} ${(PATH_BOTTOM + PATH_TOP) / 2} ${960} ${PATH_BOTTOM}`;

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
          <line x1={480} y1={922} x2={1440} y2={922} stroke={COL.line} strokeWidth={2} strokeLinecap="round" />
        </svg>

        {/* ---------- guide curves + rising data dots ---------- */}
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
          {[guideL, guideR].map((d, i) => (
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
          {Array.from({length: 6}, (_, i) => {
            const t = ((frame * 0.012 + i * 0.167) % 1 + 1) % 1;
            const side = i % 2 === 0 ? -150 : 150;
            const pos = bezier(
              t,
              {x: 960, y: PATH_TOP},
              {x: 960 + side, y: (PATH_BOTTOM + PATH_TOP) / 2},
              {x: 960, y: PATH_BOTTOM}
            );
            const op = Math.sin(t * Math.PI);
            return (
              <circle key={i} cx={pos.x} cy={pos.y} r={4} fill={COL.amber1} opacity={op * 0.7} filter="url(#dotGlow)" />
            );
          })}
        </svg>

        {/* ---------- folder BACK layer (behind documents) ---------- */}
        <div
          style={{
            position: 'absolute',
            left: 960 - 170,
            top: 660,
            transform: `scale(${inFolder * (1 + absorbPulse * 0.05 + (done ? (1 - Math.abs(1 - doneSpring)) * 0.04 : 0))}) translateY(${breathe * -4}px)`,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder
            id="fSb"
            layer="back"
            flap={activity * (0.45 + absorbPulse * 0.55)}
            paperLift={Math.min(1, progress * 0.6 + absorbPulse * 0.4)}
          />
        </div>

        {/* ---------- descending documents (with ghost trail) ---------- */}
        {Array.from({length: DOC_COUNT}, (_, i) => {
          const emit = T_START + i * DOC_STAGGER;
          const local = (frame - emit) / DOC_TRAVEL;
          if (local <= 0 || local >= 1) return null;
          const side = i % 2 === 0 ? -150 : 150;
          const p0 = {x: 960, y: PATH_TOP};
          const p1 = {x: 960 + side, y: (PATH_BOTTOM + PATH_TOP) / 2};
          const p2 = {x: 960, y: PATH_BOTTOM};
          const renderAt = (tRaw: number, opMul: number, key: string) => {
            if (tRaw <= 0 || tRaw >= 1) return null;
            const t = easeFlight(tRaw);
            const pos = bezier(t, p0, p1, p2);
            const op =
              interpolate(tRaw, [0, 0.12, 0.82, 1], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }) * opMul;
            const sc = interpolate(tRaw, [0, 0.22, 0.8, 1], [0.38, 0.88, 0.9, 0.62], {
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
          return (
            <React.Fragment key={i}>
              {renderAt(local - 0.1, 0.1, `g2-${i}`)}
              {renderAt(local - 0.05, 0.22, `g1-${i}`)}
              {renderAt(local, 1, `m-${i}`)}
            </React.Fragment>
          );
        })}

        {/* ---------- folder FRONT layer (covers documents inside pocket) ---------- */}
        <div
          style={{
            position: 'absolute',
            left: 960 - 170,
            top: 660,
            transform: `scale(${inFolder * (1 + absorbPulse * 0.05 + (done ? (1 - Math.abs(1 - doneSpring)) * 0.04 : 0))}) translateY(${breathe * -4}px)`,
            transformOrigin: '50% 90%',
          }}
        >
          <Folder
            id="fSf"
            layer="front"
            flap={activity * (0.45 + absorbPulse * 0.55)}
            paperLift={Math.min(1, progress * 0.6 + absorbPulse * 0.4)}
          />
        </div>

        {/* ---------- cloud (destination, top center) ---------- */}
        <div
          style={{
            position: 'absolute',
            left: CLOUD.x - 230,
            top: CLOUD.y - 140 + cloudBob,
            transform: `scale(${inCloud * (1 - emitPulse * 0.03 + (done ? (1 - Math.abs(1 - doneSpring)) * 0.05 : 0))})`,
            transformOrigin: '50% 60%',
          }}
        >
          <svg width={460} height={300} viewBox="0 0 460 300">
            <defs>
              <linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.cloudHi} />
                <stop offset="1" stopColor={COL.cloudLo} />
              </linearGradient>
              <linearGradient id="cloudRim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="0.5" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="cloudGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="14" result="b1" />
                <feGaussianBlur in="b1" stdDeviation="20" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                </feMerge>
              </filter>
              <filter id="checkGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="5" result="b1" />
                <feGaussianBlur in="b1" stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* halo behind cloud — warms up as data is absorbed */}
            <path
              d="M120 242 A 24 24 0 0 1 96 218 A 62 62 0 0 1 100 112 A 92 92 0 0 1 272 76 A 74 74 0 0 1 368 218 A 24 24 0 0 1 344 242 Z"
              fill={COL.amber1}
              opacity={0.12 + emitPulse * 0.22 + ringFlash * 0.25 + breathe * 0.04}
              filter="url(#cloudGlow)"
            />

            {/* cloud body */}
            <path
              d="M120 242 A 24 24 0 0 1 96 218 A 62 62 0 0 1 100 112 A 92 92 0 0 1 272 76 A 74 74 0 0 1 368 218 A 24 24 0 0 1 344 242 Z"
              fill="url(#cloudFill)"
            />
            <path
              d="M120 242 A 24 24 0 0 1 96 218 A 62 62 0 0 1 100 112 A 92 92 0 0 1 272 76 A 74 74 0 0 1 368 218 A 24 24 0 0 1 344 242 Z"
              fill="none"
              stroke="url(#cloudRim)"
              strokeWidth="3"
            />

            {/* percentage inside cloud */}
            <text
              x="232"
              y="196"
              textAnchor="middle"
              fontSize="64"
              fontWeight="600"
              fill={COL.slate}
              opacity={inRing * numberOut}
              style={{fontVariantNumeric: 'tabular-nums'}}
            >
              {pct}
              <tspan fontSize="36" fontWeight="500" fill="rgba(51,65,92,0.6)">
                %
              </tspan>
            </text>

            {/* sync checkmark */}
            <path
              d="M 192 178 l 30 30 l 52 -60"
              fill="none"
              stroke={COL.amber2}
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={180}
              strokeDashoffset={180 * (1 - checkDraw)}
              opacity={done ? 1 : 0}
              filter="url(#checkGlow)"
            />
          </svg>
        </div>

        {/* ---------- orbit progress ring around cloud ---------- */}
        <svg
          width={W}
          height={H}
          style={{
            position: 'absolute',
            opacity: inRing,
            transform: `scale(${0.92 + inRing * 0.08})`,
            transformOrigin: `${CLOUD.x}px ${CLOUD.y}px`,
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

          <circle
            cx={CLOUD.x}
            cy={CLOUD.y + cloudBob * 0.3}
            r={RING_R}
            fill="none"
            stroke="rgba(234,240,250,0.09)"
            strokeWidth={7}
            strokeDasharray="1 14"
            strokeLinecap="round"
          />

          {/* mirrored horizontally so the arc sweeps counter-clockwise */}
          <g transform={`translate(${2 * CLOUD.x} 0) scale(-1 1)`}>
          <circle
            cx={CLOUD.x}
            cy={CLOUD.y + cloudBob * 0.3}
            r={RING_R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
            transform={`rotate(-90 ${CLOUD.x} ${CLOUD.y + cloudBob * 0.3})`}
            filter="url(#ringGlow)"
          />
          </g>

          {/* glowing tip satellite */}
          {progress > 0.002 && !done ? (
            <circle cx={tip.x} cy={tip.y} r={9} fill={COL.amber1} filter="url(#ringGlow)" />
          ) : null}

          {/* completion flash */}
          <circle
            cx={CLOUD.x}
            cy={CLOUD.y + cloudBob * 0.3}
            r={RING_R}
            fill="none"
            stroke={COL.amber1}
            strokeWidth={13}
            opacity={ringFlash * 0.55}
            filter="url(#ringGlow)"
          />
        </svg>

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
