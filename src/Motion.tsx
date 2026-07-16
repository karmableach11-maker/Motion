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
// WRONG PASSWORD → ACCESS DENIED → GRANTED — CLEAN / PREMIUM
// Attempt 1: password typed, rejected — the panel shakes, the
// ring flashes red with a drawn X and drains. Attempt 2: typed
// again, verified — the ring fills, turns green and resolves
// into a shield check; the panel unlocks.
// 15s • 60fps • 1920x1080 • deterministic
// ============================================================

const W = 1920;
const H = 1080;

// ---- Timeline (frames @60fps) ------------------------------
const T1 = 110; // attempt 1 typing starts
const DOT_STAGGER = 20;
const DOT_COUNT = 8;
const SUBMIT1 = 280;
const DENY = 300; // rejection moment
const CLEAR = 355; // dots clear + ring drains
const RESET_END = 415;
const T2 = 435; // attempt 2 typing starts
const SUBMIT2 = 600;
const GRANT = 660; // access granted
const T_FADE = 872;

// ---- Palette -----------------------------------------------
const COL = {
  bgTop: '#101726',
  bgBottom: '#070B14',
  amber1: '#FFC24B',
  amber2: '#F98A1F',
  red1: '#F87171',
  red2: '#EF4444',
  green1: '#4ADE80',
  green2: '#10B981',
  ink: '#EAF0FA',
  dim: 'rgba(234,240,250,0.55)',
  faint: 'rgba(234,240,250,0.22)',
  line: 'rgba(234,240,250,0.14)',
  card: 'rgba(35,48,84,0.72)',
  cardEdge: 'rgba(234,240,250,0.18)',
  slate: '#1A2440',
};

// ---- Geometry ----------------------------------------------
const PANEL = {x: 960, y: 596, w: 460, h: 400};
const RING = {x: 960, y: 226, r: 104};

// security shield silhouette, centered on the RING anchor
const SHIELD_D = `M ${RING.x} ${RING.y - 74} L ${RING.x + 62} ${RING.y - 50} V ${RING.y + 6} c 0 46 -34 68 -62 78 c -28 -10 -62 -32 -62 -78 V ${RING.y - 50} Z`;

// ============================================================
// Main composition
// ============================================================
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ---------------- ring progress across the two attempts ----------------
  const progress = interpolate(
    frame,
    [T1, SUBMIT1, CLEAR, RESET_END, T2, SUBMIT2 - 10, SUBMIT2, GRANT - 6],
    [0, 0.62, 0.62, 0, 0, 0.78, 0.78, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sin),
    }
  );
  const pct = Math.min(100, Math.round(progress * 100));
  const granted = frame > GRANT;

  // ---------------- entrances ----------------
  const inPanel = spring({frame: frame - 8, fps, config: {damping: 14, mass: 0.9}});
  const inRing = interpolate(frame, [46, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const breathe = Math.sin((frame / fps) * Math.PI * 0.8) * 0.5 + 0.5;

  // ---------------- typing (two attempts) ----------------
  const dotsA = Array.from({length: DOT_COUNT}, (_, i) =>
    spring({frame: frame - (T1 + i * DOT_STAGGER), fps, config: {damping: 10, mass: 0.6}})
  );
  const dotsB = Array.from({length: DOT_COUNT}, (_, i) =>
    spring({frame: frame - (T2 + i * DOT_STAGGER), fps, config: {damping: 10, mass: 0.6}})
  );
  const dotsAOut = interpolate(frame, [CLEAR, CLEAR + 28], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const typing1 = frame >= T1 - 16 && frame < SUBMIT1;
  const typing2 = frame >= T2 - 16 && frame < SUBMIT2;
  const caretOn = Math.sin((frame / fps) * Math.PI * 2 * 1.4) > 0;
  let keyPulse = 0;
  for (let i = 0; i < DOT_COUNT; i++) {
    keyPulse += interpolate(frame - (T1 + i * DOT_STAGGER), [0, 3, 14], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    keyPulse += interpolate(frame - (T2 + i * DOT_STAGGER), [0, 3, 14], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  keyPulse = Math.min(1, keyPulse);

  // ---------------- denial ----------------
  // damped shake, deterministic
  const shakeAge = frame - DENY;
  const shakeX =
    shakeAge >= 0 && shakeAge < 34
      ? Math.sin(shakeAge * 1.15) * 16 * Math.exp(-shakeAge / 9)
      : 0;
  const redness = interpolate(frame, [DENY, DENY + 8, CLEAR + 20, RESET_END], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const xDraw = interpolate(frame, [DENY + 2, DENY + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const denyFlash = interpolate(frame - DENY, [0, 5, 40], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // button press pulses
  const press1 = interpolate(frame - SUBMIT1, [0, 4, 16], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const press2 = interpolate(frame - SUBMIT2, [0, 4, 16], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- grant ----------------
  const doneSpring = spring({frame: frame - (GRANT + 10), fps, config: {damping: 11, mass: 0.8}});
  const shieldIn = spring({frame: frame - (GRANT + 8), fps, config: {damping: 12, mass: 0.8}});
  const checkDraw = interpolate(frame, [GRANT + 16, GRANT + 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const numberOut = interpolate(frame, [GRANT + 2, GRANT + 16], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const grantFlash = interpolate(frame - GRANT, [0, 6, 44], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const greenIn = interpolate(frame, [GRANT, GRANT + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- global fade out ----------------
  const fadeOut = interpolate(frame, [T_FADE, 900], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const RING_C = 2 * Math.PI * RING.r;

  // ---------------- ambient particles ----------------
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

  // panel edge color across states
  const panelStroke = granted
    ? `rgba(74,222,128,${0.35 + greenIn * 0.35})`
    : redness > 0.01
    ? `rgba(248,113,113,${0.3 + redness * 0.45})`
    : COL.cardEdge;
  const fieldStroke = (active: boolean) =>
    redness > 0.01 ? COL.red1 : granted ? COL.green1 : active ? COL.amber1 : COL.faint;

  // ring arc color layers
  const showRed = redness;
  const showGreen = greenIn;

  const caretIndex = (t0: number) =>
    Math.min(DOT_COUNT, Math.max(0, Math.floor((frame - t0) / DOT_STAGGER) + 1));

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
          <line x1={420} y1={880} x2={1500} y2={880} stroke={COL.line} strokeWidth={2} strokeLinecap="round" />
        </svg>

        {/* ---------- state-tinted vignette pulses ---------- */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(1100px 700px at 50% 45%, rgba(239,68,68,${denyFlash * 0.12}) 0%, rgba(0,0,0,0) 60%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background: `radial-gradient(1100px 700px at 50% 45%, rgba(16,185,129,${grantFlash * 0.12}) 0%, rgba(0,0,0,0) 60%)`,
          }}
        />

        {/* ---------- login panel ---------- */}
        <div
          style={{
            position: 'absolute',
            left: PANEL.x - PANEL.w / 2,
            top: PANEL.y - PANEL.h / 2,
            transform: `translateX(${shakeX}px) scale(${inPanel * (1 + keyPulse * 0.006 + (granted ? (1 - Math.abs(1 - doneSpring)) * 0.03 : 0))}) translateY(${breathe * -3}px)`,
            transformOrigin: '50% 80%',
          }}
        >
          <svg width={PANEL.w} height={PANEL.h} viewBox={`0 0 ${PANEL.w} ${PANEL.h}`}>
            <defs>
              <linearGradient id="btnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.amber1} />
                <stop offset="1" stopColor={COL.amber2} />
              </linearGradient>
              <linearGradient id="btnRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.red1} />
                <stop offset="1" stopColor={COL.red2} />
              </linearGradient>
              <linearGradient id="btnGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.green1} />
                <stop offset="1" stopColor={COL.green2} />
              </linearGradient>
              <filter id="cardSoft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>

            {/* shadow + card */}
            <rect x="26" y="34" width="408" height="346" rx="26" fill="rgba(0,0,0,0.45)" filter="url(#cardSoft)" />
            <rect x="20" y="20" width="420" height="360" rx="24" fill={COL.card} stroke={panelStroke} strokeWidth="2.5" />

            {/* avatar */}
            <circle cx="230" cy="88" r="30" fill="none" stroke={granted ? COL.green1 : redness > 0.01 ? COL.red1 : COL.amber1} strokeWidth="5" />
            <circle cx="230" cy="80" r="10" fill={granted ? COL.green1 : redness > 0.01 ? COL.red1 : COL.amber1} />
            <path d="M212 102 a18 12 0 0 1 36 0" fill={granted ? COL.green1 : redness > 0.01 ? COL.red1 : COL.amber1} />

            {/* username field (static) */}
            <rect x="56" y="150" width="348" height="46" rx="12" fill="rgba(12,18,36,0.6)" stroke={COL.faint} strokeWidth="2" />
            <circle cx="82" cy="173" r="8" fill="none" stroke={COL.dim} strokeWidth="3" />
            <line x1="102" y1="173" x2="240" y2="173" stroke={COL.dim} strokeWidth="6" strokeLinecap="round" opacity="0.5" />

            {/* password field */}
            <rect
              x="56"
              y="212"
              width="348"
              height="46"
              rx="12"
              fill="rgba(12,18,36,0.6)"
              stroke={fieldStroke(typing1 || typing2)}
              strokeWidth="2.5"
            />
            <rect x="72" y="230" width="14" height="11" rx="3" fill="none" stroke={COL.dim} strokeWidth="2.5" />
            <path d="M75 230 v-4 a4 4 0 0 1 8 0 v4" fill="none" stroke={COL.dim} strokeWidth="2.5" />

            {/* attempt 1 dots (turn red, then clear) */}
            {dotsA.map((s, i) => (
              <circle
                key={`a${i}`}
                cx={106 + i * 26}
                cy={235}
                r={6.5 * Math.min(1, s)}
                fill={redness > 0.01 ? COL.red1 : COL.ink}
                opacity={(s > 0.02 ? 0.95 : 0) * dotsAOut}
              />
            ))}
            {/* attempt 2 dots */}
            {dotsB.map((s, i) => (
              <circle
                key={`b${i}`}
                cx={106 + i * 26}
                cy={235}
                r={6.5 * Math.min(1, s)}
                fill={granted ? COL.green1 : COL.ink}
                opacity={s > 0.02 ? 0.95 : 0}
              />
            ))}
            {/* caret */}
            {(typing1 || typing2) && caretOn ? (
              <rect
                x={106 + caretIndex(typing1 ? T1 : T2) * 26 - 8}
                y={222}
                width={3}
                height={26}
                fill={COL.amber1}
              />
            ) : null}

            {/* deny cross on the field */}
            <g
              stroke={COL.red1}
              strokeWidth="4.5"
              strokeLinecap="round"
              opacity={redness}
            >
              <line x1="376" y1="226" x2="394" y2="244" />
              <line x1="394" y1="226" x2="376" y2="244" />
            </g>
            {/* grant check on the field */}
            <path
              d="M372 236 l8 8 l16 -18"
              fill="none"
              stroke={COL.green1}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={greenIn}
            />

            {/* action button */}
            <g style={{transformOrigin: '230px 318px', transform: `scale(${1 - (press1 + press2) * 0.04})`}}>
              <rect x="56" y="296" width="348" height="44" rx="12" fill="url(#btnGrad)" />
              <rect x="56" y="296" width="348" height="44" rx="12" fill="url(#btnRed)" opacity={redness} />
              <rect x="56" y="296" width="348" height="44" rx="12" fill="url(#btnGreen)" opacity={greenIn} />
              {/* padlock, closed -> open on grant */}
              <g opacity={1 - greenIn}>
                <rect x="219" y="314" width="22" height="16" rx="4" fill={COL.slate} />
                <path d="M224 314 v-6 a6 6 0 0 1 12 0 v6" fill="none" stroke={COL.slate} strokeWidth="3.5" />
              </g>
              <g opacity={greenIn}>
                <rect x="219" y="314" width="22" height="16" rx="4" fill={COL.slate} />
                {/* open shackle */}
                <path d="M224 314 v-6 a6 6 0 0 1 12 0" fill="none" stroke={COL.slate} strokeWidth="3.5" />
              </g>
            </g>
          </svg>
        </div>

        {/* ---------- security shield emblem (neutral -> denied -> granted) ---------- */}
        <svg
          width={W}
          height={H}
          style={{
            position: 'absolute',
            opacity: inRing,
            transform: `translateX(${shakeX * 0.4}px) scale(${0.9 + inRing * 0.1})`,
            transformOrigin: `${RING.x}px ${RING.y}px`,
          }}
        >
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COL.amber1} />
              <stop offset="1" stopColor={COL.amber2} />
            </linearGradient>
            <linearGradient id="ringRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COL.red1} />
              <stop offset="1" stopColor={COL.red2} />
            </linearGradient>
            <linearGradient id="ringGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COL.green1} />
              <stop offset="1" stopColor={COL.green2} />
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

          {/* state glow behind the shield */}
          <path
            d={SHIELD_D}
            fill={COL.red1}
            opacity={denyFlash * 0.4}
            filter="url(#ringGlow)"
          />
          <path
            d={SHIELD_D}
            fill={COL.green1}
            opacity={grantFlash * 0.4}
            filter="url(#ringGlow)"
          />

          <g
            filter="url(#ringGlow)"
            style={{
              transformOrigin: `${RING.x}px ${RING.y}px`,
              transform: `scale(${1 + denyFlash * 0.04 + grantFlash * 0.05 + breathe * 0.01})`,
            }}
          >
            {/* dark body */}
            <path d={SHIELD_D} fill="rgba(18,26,46,0.9)" strokeLinejoin="round" />
            {/* state-tinted rim (amber base, red / green overlays) */}
            <path
              d={SHIELD_D}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={7}
              strokeLinejoin="round"
              opacity={(1 - Math.min(1, redness * 1.4)) * (1 - greenIn)}
            />
            <path
              d={SHIELD_D}
              fill="none"
              stroke="url(#ringRed)"
              strokeWidth={7}
              strokeLinejoin="round"
              opacity={redness}
            />
            <path
              d={SHIELD_D}
              fill="none"
              stroke="url(#ringGreen)"
              strokeWidth={7}
              strokeLinejoin="round"
              opacity={greenIn}
            />

            {/* neutral padlock glyph */}
            <g opacity={(1 - Math.min(1, redness * 1.6)) * (1 - greenIn)}>
              <rect x={RING.x - 17} y={RING.y - 6} width={34} height={27} rx={6} fill={COL.amber1} />
              <path
                d={`M ${RING.x - 11} ${RING.y - 6} v -9 a 11 11 0 0 1 22 0 v 9`}
                fill="none"
                stroke={COL.amber1}
                strokeWidth={5}
              />
              <circle cx={RING.x} cy={RING.y + 6} r={4.5} fill={COL.slate} />
            </g>

            {/* red X when denied */}
            <g stroke={COL.red1} strokeWidth={11} strokeLinecap="round" opacity={redness}>
              <line
                x1={RING.x - 22}
                y1={RING.y - 24}
                x2={RING.x - 22 + 44 * xDraw}
                y2={RING.y - 24 + 44 * xDraw}
              />
              {xDraw > 0.5 ? (
                <line
                  x1={RING.x + 22}
                  y1={RING.y - 24}
                  x2={RING.x + 22 - 44 * ((xDraw - 0.5) * 2)}
                  y2={RING.y - 24 + 44 * ((xDraw - 0.5) * 2)}
                />
              ) : null}
            </g>

            {/* green check when granted */}
            {granted ? (
              <path
                d={`M ${RING.x - 22} ${RING.y - 2} l 16 16 l 28 -32`}
                fill="none"
                stroke={COL.green1}
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={110}
                strokeDashoffset={110 * (1 - checkDraw)}
              />
            ) : null}
          </g>
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
