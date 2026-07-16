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
// PASSWORD / 2FA VERIFICATION — CLEAN / PREMIUM-GRADE
// Generic login panel: password dots type in, a generic phone
// receives a one-time code, the digits fly into the panel,
// and the progress ring resolves into a green shield check.
// 15s • 60fps • 1920x1080 • deterministic
// ============================================================

const W = 1920;
const H = 1080;

// ---- Timeline (frames @60fps) ------------------------------
const T_TYPE = 120; // password typing starts
const DOT_COUNT = 8;
const DOT_STAGGER = 24;
const T_REQUEST = 330; // panel asks the phone for a code
const T_PHONE = 368; // phone wakes, code card slides up
const DIGIT_SHOW = 404; // OTP digits appear on the phone
const DIGIT_SHOW_STAGGER = 14;
const T_FLY = 490; // digits fly to the panel
const FLY_STAGGER = 30;
const FLY_TRAVEL = 46;
const T_END = 700; // verified
const OTP_COUNT = 6;

// ---- Palette -----------------------------------------------
const COL = {
  bgTop: '#101726',
  bgBottom: '#070B14',
  amber1: '#FFC24B',
  amber2: '#F98A1F',
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
const PANEL = {x: 620, y: 590, w: 460, h: 440}; // world center + size
const PHONE = {x: 1310, y: 585, w: 250, h: 500};
const RING = {x: 960, y: 232, r: 104};

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

// deterministic OTP digits
const OTP = Array.from({length: OTP_COUNT}, (_, i) =>
  Math.floor(random(`otp-${i}`) * 10)
);

// OTP box centers inside the panel viewBox (460x440)
const otpBoxX = (i: number) => 70 + i * 64;
const OTP_BOX_Y = 302;

// ============================================================
// Main composition
// ============================================================
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ---------------- progress (per-phase eased segments) ----------------
  const progress = interpolate(
    frame,
    [90, T_REQUEST, T_FLY, T_END],
    [0, 0.4, 0.7, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sin),
    }
  );
  const pct = Math.min(100, Math.round(progress * 100));
  const done = frame > T_END;

  // ---------------- entrances ----------------
  const inPanel = spring({frame: frame - 8, fps, config: {damping: 14, mass: 0.9}});
  const inPhone = spring({frame: frame - 22, fps, config: {damping: 14, mass: 0.9}});
  const inRing = interpolate(frame, [50, 84], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const breathe = Math.sin((frame / fps) * Math.PI * 0.8) * 0.5 + 0.5;

  // ---------------- password dots ----------------
  const dots = Array.from({length: DOT_COUNT}, (_, i) => {
    const t0 = T_TYPE + i * DOT_STAGGER;
    return spring({frame: frame - t0, fps, config: {damping: 10, mass: 0.6}});
  });
  const typingActive = frame >= T_TYPE - 20 && frame < T_REQUEST;
  const caretOn = Math.sin((frame / fps) * Math.PI * 2 * 1.4) > 0;
  let keyPulse = 0;
  for (let i = 0; i < DOT_COUNT; i++) {
    keyPulse += interpolate(frame - (T_TYPE + i * DOT_STAGGER), [0, 3, 14], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  keyPulse = Math.min(1, keyPulse);

  // ---------------- request pulse (panel -> phone) ----------------
  const reqT = interpolate(frame, [T_REQUEST, T_REQUEST + 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const guideOn = interpolate(frame, [T_REQUEST - 10, T_REQUEST + 10, T_END - 20, T_END + 20], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const G0 = {x: 862, y: 520};
  const G1 = {x: 1010, y: 392};
  const G2 = {x: 1168, y: 470};
  const reqPos = bezier(easeFlight(reqT), G0, G1, G2);

  // ---------------- phone wake + code card ----------------
  const phoneWake = spring({frame: frame - T_PHONE, fps, config: {damping: 12, mass: 0.8}});
  const phoneBump = interpolate(frame - (T_REQUEST + 38), [0, 5, 26], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- OTP digits on phone ----------------
  const digitIn = Array.from({length: OTP_COUNT}, (_, i) =>
    spring({frame: frame - (DIGIT_SHOW + i * DIGIT_SHOW_STAGGER), fps, config: {damping: 10, mass: 0.6}})
  );

  // ---------------- digits flying to panel ----------------
  const flyLaunch = (i: number) => T_FLY + i * FLY_STAGGER;
  const arriveAt = (i: number) => flyLaunch(i) + FLY_TRAVEL;
  let boxPulse = 0;
  for (let i = 0; i < OTP_COUNT; i++) {
    boxPulse += interpolate(frame - arriveAt(i), [0, 4, 22], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  boxPulse = Math.min(1, boxPulse);

  // world position of an OTP box center
  const boxWorld = (i: number) => ({
    x: PANEL.x - PANEL.w / 2 + otpBoxX(i),
    y: PANEL.y - PANEL.h / 2 + OTP_BOX_Y,
  });

  // ---------------- completion ----------------
  const doneSpring = spring({frame: frame - (T_END + 10), fps, config: {damping: 11, mass: 0.8}});
  const shieldIn = spring({frame: frame - (T_END + 8), fps, config: {damping: 12, mass: 0.8}});
  const checkDraw = interpolate(frame, [T_END + 16, T_END + 42], [0, 1], {
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
  const greenIn = interpolate(frame, [T_END, T_END + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------- global fade out ----------------
  const fadeOut = interpolate(frame, [872, 900], [1, 0], {
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

  const panelStroke = done
    ? `rgba(74,222,128,${0.35 + greenIn * 0.35})`
    : COL.cardEdge;

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
          <line x1={300} y1={898} x2={1620} y2={898} stroke={COL.line} strokeWidth={2} strokeLinecap="round" />
        </svg>

        {/* ---------- request guide + traveling pulse ---------- */}
        <svg width={W} height={H} style={{position: 'absolute', opacity: guideOn}}>
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
            d={`M ${G0.x} ${G0.y} Q ${G1.x} ${G1.y} ${G2.x} ${G2.y}`}
            fill="none"
            stroke={COL.line}
            strokeWidth={2.5}
            strokeDasharray="3 15"
            strokeDashoffset={-frame * 1.5}
            strokeLinecap="round"
          />
          {reqT > 0.01 && reqT < 0.99 ? (
            <circle cx={reqPos.x} cy={reqPos.y} r={7} fill={COL.amber1} filter="url(#dotGlow)" />
          ) : null}
        </svg>

        {/* ---------- login panel ---------- */}
        <div
          style={{
            position: 'absolute',
            left: PANEL.x - PANEL.w / 2,
            top: PANEL.y - PANEL.h / 2,
            transform: `scale(${inPanel * (1 + keyPulse * 0.006 + (done ? (1 - Math.abs(1 - doneSpring)) * 0.03 : 0))}) translateY(${breathe * -3}px)`,
            transformOrigin: '50% 80%',
          }}
        >
          <svg width={PANEL.w} height={PANEL.h} viewBox={`0 0 ${PANEL.w} ${PANEL.h}`}>
            <defs>
              <linearGradient id="btnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.amber1} />
                <stop offset="1" stopColor={COL.amber2} />
              </linearGradient>
              <linearGradient id="btnGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COL.green1} />
                <stop offset="1" stopColor={COL.green2} />
              </linearGradient>
              <filter id="cardSoft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
            </defs>

            {/* drop shadow + card */}
            <rect x="26" y="34" width="408" height="386" rx="26" fill="rgba(0,0,0,0.45)" filter="url(#cardSoft)" />
            <rect x="20" y="20" width="420" height="400" rx="24" fill={COL.card} stroke={panelStroke} strokeWidth="2.5" />

            {/* avatar */}
            <circle cx="230" cy="82" r="30" fill="none" stroke={COL.amber1} strokeWidth="5" />
            <circle cx="230" cy="74" r="10" fill={COL.amber1} />
            <path d="M212 96 a18 12 0 0 1 36 0" fill={COL.amber1} />

            {/* username field (static) */}
            <rect x="56" y="134" width="348" height="46" rx="12" fill="rgba(12,18,36,0.6)" stroke={COL.faint} strokeWidth="2" />
            <circle cx="82" cy="157" r="8" fill="none" stroke={COL.dim} strokeWidth="3" />
            <line x1="102" y1="157" x2="240" y2="157" stroke={COL.dim} strokeWidth="6" strokeLinecap="round" opacity="0.5" />

            {/* password field */}
            <rect
              x="56"
              y="196"
              width="348"
              height="46"
              rx="12"
              fill="rgba(12,18,36,0.6)"
              stroke={typingActive ? COL.amber1 : COL.faint}
              strokeWidth="2"
              opacity={typingActive ? 0.9 : 1}
            />
            {/* lock glyph in field */}
            <rect x="72" y="214" width="14" height="11" rx="3" fill="none" stroke={COL.dim} strokeWidth="2.5" />
            <path d="M75 214 v-4 a4 4 0 0 1 8 0 v4" fill="none" stroke={COL.dim} strokeWidth="2.5" />
            {/* typed dots */}
            {dots.map((s, i) => (
              <circle
                key={i}
                cx={106 + i * 26}
                cy={219}
                r={6.5 * Math.min(1, s)}
                fill={COL.ink}
                opacity={s > 0.02 ? 0.95 : 0}
              />
            ))}
            {/* caret */}
            {typingActive && caretOn ? (
              <rect
                x={106 + Math.min(DOT_COUNT, Math.max(0, Math.floor((frame - T_TYPE) / DOT_STAGGER) + 1)) * 26 - 8}
                y={206}
                width={3}
                height={26}
                fill={COL.amber1}
              />
            ) : null}

            {/* OTP boxes */}
            {Array.from({length: OTP_COUNT}, (_, i) => {
              const arrived = frame >= arriveAt(i);
              const pop = spring({frame: frame - arriveAt(i), fps, config: {damping: 10, mass: 0.6}});
              const stroke = done
                ? `rgba(74,222,128,${0.5 + greenIn * 0.5})`
                : arrived
                ? COL.amber1
                : COL.faint;
              return (
                <g key={i}>
                  <rect
                    x={otpBoxX(i) - 26}
                    y={OTP_BOX_Y - 30}
                    width={52}
                    height={60}
                    rx={10}
                    fill="rgba(12,18,36,0.6)"
                    stroke={stroke}
                    strokeWidth="2.5"
                  />
                  {arrived ? (
                    <text
                      x={otpBoxX(i)}
                      y={OTP_BOX_Y + 12}
                      textAnchor="middle"
                      fontSize={34 * Math.min(1.15, pop)}
                      fontWeight="700"
                      fontFamily="Consolas, Menlo, monospace"
                      fill={done ? COL.green1 : COL.ink}
                    >
                      {OTP[i]}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {/* action button */}
            <rect x="56" y="356" width="348" height="44" rx="12" fill="url(#btnGrad)" />
            <rect x="56" y="356" width="348" height="44" rx="12" fill="url(#btnGreen)" opacity={greenIn} />
            {/* padlock / check on button */}
            <g opacity={1 - greenIn}>
              <rect x="219" y="374" width="22" height="16" rx="4" fill={COL.slate} />
              <path d="M224 374 v-6 a6 6 0 0 1 12 0 v6" fill="none" stroke={COL.slate} strokeWidth="3.5" />
            </g>
            <path
              d="M218 378 l8 8 l16 -18"
              fill="none"
              stroke={COL.slate}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={greenIn}
            />
          </svg>
        </div>

        {/* ---------- generic phone ---------- */}
        <div
          style={{
            position: 'absolute',
            left: PHONE.x - PHONE.w / 2,
            top: PHONE.y - PHONE.h / 2,
            transform: `rotate(-5deg) scale(${inPhone * (1 + phoneBump * 0.03)}) translateY(${(1 - breathe) * -4}px)`,
            transformOrigin: '50% 85%',
          }}
        >
          <svg width={PHONE.w} height={PHONE.h} viewBox={`0 0 ${PHONE.w} ${PHONE.h}`}>
            <defs>
              <linearGradient id="phoneBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2A3550" />
                <stop offset="1" stopColor="#151E33" />
              </linearGradient>
              <linearGradient id="phoneScreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0E1730" />
                <stop offset="1" stopColor="#0A1122" />
              </linearGradient>
              <filter id="phoneSoft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" />
              </filter>
              <filter id="cardGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="6" result="b1" />
                <feGaussianBlur in="b1" stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* shadow + body + screen */}
            <rect x="26" y="30" width="204" height="450" rx="38" fill="rgba(0,0,0,0.45)" filter="url(#phoneSoft)" />
            <rect x="20" y="16" width="210" height="456" rx="36" fill="url(#phoneBody)" stroke="rgba(234,240,250,0.2)" strokeWidth="2.5" />
            <rect x="32" y="28" width="186" height="432" rx="26" fill="url(#phoneScreen)" />
            {/* screen wake tint */}
            <rect x="32" y="28" width="186" height="432" rx="26" fill={COL.amber1} opacity={0.05 * phoneWake + 0.04 * phoneBump} />
            {/* notch */}
            <rect x="103" y="38" width="44" height="9" rx="4.5" fill="#0A0F1E" />

            {/* idle clock lines */}
            <g opacity={1 - phoneWake * 0.85}>
              <line x1="90" y1="120" x2="160" y2="120" stroke={COL.faint} strokeWidth="8" strokeLinecap="round" />
              <line x1="105" y1="142" x2="145" y2="142" stroke={COL.faint} strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* OTP code card slides up */}
            <g
              opacity={phoneWake}
              style={{
                transform: `translateY(${(1 - phoneWake) * 46}px)`,
              }}
            >
              <rect x="44" y="180" width="162" height="128" rx="16" fill="rgba(38,52,90,0.95)" stroke={COL.amber1} strokeWidth="2" filter="url(#cardGlow)" />
              {/* mini lock */}
              <rect x="115" y="200" width="20" height="15" rx="4" fill="none" stroke={COL.amber1} strokeWidth="3" />
              <path d="M119.5 200 v-5.5 a5.5 5.5 0 0 1 11 0 V200" fill="none" stroke={COL.amber1} strokeWidth="3" />
              {/* digits */}
              {Array.from({length: OTP_COUNT}, (_, i) => {
                const launched = frame >= flyLaunch(i);
                const s = digitIn[i];
                return (
                  <text
                    key={i}
                    x={64 + i * 25}
                    y={262}
                    textAnchor="middle"
                    fontSize={26 * Math.min(1.15, s)}
                    fontWeight="700"
                    fontFamily="Consolas, Menlo, monospace"
                    fill={COL.ink}
                    opacity={launched ? 0.18 : s > 0.02 ? 1 : 0}
                  >
                    {OTP[i]}
                  </text>
                );
              })}
              {/* hint bar */}
              <line x1="70" y1="288" x2="180" y2="288" stroke={COL.faint} strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* ---------- flying OTP digit chips ---------- */}
        {Array.from({length: OTP_COUNT}, (_, i) => {
          const local = (frame - flyLaunch(i)) / FLY_TRAVEL;
          if (local <= 0 || local >= 1) return null;
          // phone card digit position (approx, in world space)
          const p0 = {x: PHONE.x - 60 + i * 22, y: PHONE.y - 8};
          const p1 = {x: (PHONE.x + PANEL.x) / 2, y: 330};
          const p2 = boxWorld(i);
          const renderAt = (tRaw: number, opMul: number, key: string) => {
            if (tRaw <= 0 || tRaw >= 1) return null;
            const t = easeFlight(tRaw);
            const pos = bezier(t, p0, p1, p2);
            const op =
              interpolate(tRaw, [0, 0.12, 0.9, 1], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }) * opMul;
            const sc = interpolate(tRaw, [0, 0.2, 0.85, 1], [0.5, 1, 0.95, 0.55], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  left: pos.x - 25,
                  top: pos.y - 30,
                  width: 50,
                  height: 60,
                  borderRadius: 12,
                  background: `linear-gradient(180deg, ${COL.amber1}, ${COL.amber2})`,
                  boxShadow: '0 0 22px rgba(255,178,58,0.55), 0 6px 18px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: 'Consolas, Menlo, monospace',
                  color: COL.slate,
                  opacity: op,
                  transform: `scale(${sc}) rotate(${Math.sin(tRaw * Math.PI * 2 + i) * 7}deg)`,
                }}
              >
                {OTP[i]}
              </div>
            );
          };
          return (
            <React.Fragment key={i}>
              {renderAt(local - 0.08, 0.18, `g-${i}`)}
              {renderAt(local, 1, `m-${i}`)}
            </React.Fragment>
          );
        })}

        {/* ---------- progress ring -> green shield check ---------- */}
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
            <linearGradient id="ringGreen" x1="0" y1="0" x2="1" y2="1">
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

          <circle cx={RING.x} cy={RING.y} r={RING.r} fill="none" stroke="rgba(234,240,250,0.1)" strokeWidth={10} />

          {/* amber progress arc, crossfades to green when verified */}
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
            opacity={1 - greenIn}
          />
          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.r}
            fill="none"
            stroke="url(#ringGreen)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - progress)}
            transform={`rotate(-90 ${RING.x} ${RING.y})`}
            filter="url(#ringGlow)"
            opacity={greenIn}
          />

          {/* completion flash */}
          <circle
            cx={RING.x}
            cy={RING.y}
            r={RING.r}
            fill="none"
            stroke={COL.green1}
            strokeWidth={14}
            opacity={ringFlash * 0.5}
            filter="url(#ringGlow)"
          />

          {/* green shield + drawn check */}
          {done ? (
            <g
              filter="url(#ringGlow)"
              style={{
                transformOrigin: `${RING.x}px ${RING.y}px`,
                transform: `scale(${Math.min(1.08, shieldIn)})`,
              }}
            >
              <path
                d={`M ${RING.x} ${RING.y - 58} L ${RING.x + 46} ${RING.y - 40} V ${RING.y + 2} c 0 34 -26 50 -46 57 c -20 -7 -46 -23 -46 -57 V ${RING.y - 40} Z`}
                fill="rgba(16,42,36,0.85)"
                stroke="url(#ringGreen)"
                strokeWidth={6}
                strokeLinejoin="round"
                opacity={shieldIn}
              />
              <path
                d={`M ${RING.x - 20} ${RING.y - 2} l 15 15 l 27 -30`}
                fill="none"
                stroke={COL.green1}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={100}
                strokeDashoffset={100 * (1 - checkDraw)}
              />
            </g>
          ) : null}
        </svg>

        {/* ---------- percentage counter ---------- */}
        <div
          style={{
            position: 'absolute',
            left: RING.x - 150,
            top: RING.y - 40,
            width: 300,
            textAlign: 'center',
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: COL.ink,
            fontVariantNumeric: 'tabular-nums',
            opacity: inRing * numberOut,
          }}
        >
          {pct}
          <span style={{fontSize: 36, fontWeight: 500, color: COL.dim, marginLeft: 6}}>%</span>
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
