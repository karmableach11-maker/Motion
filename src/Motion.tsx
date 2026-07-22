import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  random,
  delayRender,
  continueRender,
} from 'remotion';

/* ============================================================================
   SEARCH ENGINE — TYPE & RESULTS REVEAL
   Premium microstock motion graphic. 1920x1080 @ 60fps, 900 frames (15s).
   Self-contained: core Remotion + SVG + CSS only.
   ========================================================================== */

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const QUERY = 'Artificial Intelligence';

// [bold matched root, light descriptor]
const SUGGESTIONS: [string, string][] = [
  ['artificial intelligence', ''],
  ['artificial intelligence', ' background'],
  ['artificial intelligence', ' technology'],
  ['artificial intelligence', ' robot'],
  ['artificial intelligence', ' data visualization'],
];

// ---- Colours -------------------------------------------------------------
const C = {
  ink: '#141B2E',
  sub: '#8A93A8',
  faint: '#AEB6C7',
  line: '#E7EBF3',
  panel: '#FFFFFF',
  blue: '#2F6BFF',
  blueDeep: '#1E54E6',
  blueSoft: '#EAF1FF',
};

// Curated premium duotone gradients for result thumbnails.
const CARD_GRADIENTS = [
  ['#6D5EF6', '#22D3EE'],
  ['#FF7AC6', '#7A5CFF'],
  ['#22C1E8', '#2F6BFF'],
  ['#FBA43A', '#FF5E7E'],
  ['#2DD4BF', '#3B82F6'],
  ['#A78BFA', '#F472B6'],
  ['#3E7BFA', '#173A8F'],
  ['#34D399', '#22C1E8'],
  ['#FB7185', '#F59E0B'],
];

// ---- Easings -------------------------------------------------------------
const eOut = Easing.out(Easing.cubic);
const eInOut = Easing.inOut(Easing.cubic);
const eExpo = Easing.bezier(0.16, 1, 0.3, 1);

// ---- Keyframe helper -----------------------------------------------------
type KF = {f: number; v: number; e?: (t: number) => number};
const kf = (frame: number, pts: KF[]): number => {
  if (frame <= pts[0].f) return pts[0].v;
  const last = pts[pts.length - 1];
  if (frame >= last.f) return last.v;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = (frame - a.f) / (b.f - a.f);
      const e = b.e ? b.e(t) : t;
      return a.v + (b.v - a.v) * e;
    }
  }
  return last.v;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const withCommas = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ============================================================================
   TIMELINE (frames @ 60fps)
   ========================================================================== */
const T = {
  barIn: 8,
  cursorIn: 66,
  focusClick: 120,
  typeStart: 140,
  typePerChar: 8.4,
  autoIn: 226,
  submitMove: 344,
  submitClick: 382,
  barMove: 400,
  barMoveEnd: 486,
  headerIn: 462,
  countStart: 468,
  countEnd: 648,
  cardsStart: 486,
  cardStagger: 5.5,
  sweep: 760,
  hoverMove: 561,
};

const typeEnd = T.typeStart + QUERY.length * T.typePerChar;

/* ============================================================================
   LAYOUT — bar interpolates between centred and header states
   ========================================================================== */
const barState = (frame: number, fps: number) => {
  const p = spring({
    frame: frame - T.barMove,
    fps,
    config: {damping: 200, mass: 1.1, stiffness: 90},
    durationInFrames: T.barMoveEnd - T.barMove,
  });
  const x = lerp(470, 210, p);
  const y = lerp(438, 92, p);
  const w = lerp(980, 760, p);
  const h = lerp(96, 76, p);
  const r = h / 2;
  return {x, y, w, h, r, p};
};

/* ============================================================================
   BACKGROUND
   ========================================================================== */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(155deg,#FCFDFF 0%,#F1F5FF 46%,#E9F0FF 100%)',
        }}
      />
      {[
        {c: '#4C8DFF', s: 900, bx: 220, by: 180, a: 0.3, sp: 1},
        {c: '#7A5CFF', s: 820, bx: 1560, by: 300, a: 0.26, sp: 1.4},
        {c: '#22C1E8', s: 760, bx: 1360, by: 940, a: 0.22, sp: 0.9},
        {c: '#FF8FC7', s: 640, bx: 420, by: 980, a: 0.18, sp: 1.7},
      ].map((b, i) => {
        const dx = Math.sin(frame / (150 * b.sp) + i) * 60;
        const dy = Math.cos(frame / (170 * b.sp) + i * 1.7) * 46;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.bx - b.s / 2 + dx,
              top: b.by - b.s / 2 + dy,
              width: b.s,
              height: b.s,
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, rgba(255,255,255,0) 68%)`,
              opacity: b.a,
              filter: 'blur(18px)',
            }}
          />
        );
      })}
      <AbsoluteFill style={{opacity: 0.05}}>
        <svg width="1920" height="1080">
          <defs>
            <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="#2A3757" />
            </pattern>
            <radialGradient id="dotmask" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="dm">
              <rect width="1920" height="1080" fill="url(#dotmask)" />
            </mask>
          </defs>
          <rect width="1920" height="1080" fill="url(#dots)" mask="url(#dm)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

/* ============================================================================
   ICON
   ========================================================================== */
const Magnifier: React.FC<{size: number; color: string; stroke: number}> = ({
  size,
  color,
  stroke,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6.6" stroke={color} strokeWidth={stroke} />
    <line
      x1="15.4"
      y1="15.4"
      x2="20.2"
      y2="20.2"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </svg>
);

/* ============================================================================
   SEARCH BAR
   ========================================================================== */
const SearchBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const springIn = spring({
    frame: frame - T.barIn,
    fps,
    config: {damping: 14, mass: 0.9, stiffness: 120},
  });
  const introScale = interpolate(springIn, [0, 1], [0.7, 1]);
  const introOpacity = interpolate(frame, [T.barIn, T.barIn + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const b = barState(frame, fps);

  const typedCount = clamp(
    Math.floor((frame - T.typeStart) / T.typePerChar) + 1,
    0,
    QUERY.length
  );
  const typed = frame < T.typeStart ? '' : QUERY.slice(0, typedCount);

  const focused = frame >= T.focusClick && frame < T.submitClick + 6;
  const caretBlink = focused ? (Math.floor(frame / 16) % 2 === 0 ? 1 : 0.15) : 0;
  const caretAlpha =
    frame >= typeEnd - 2 && frame < T.submitClick ? caretBlink : focused ? 1 : 0;

  const placeholderAlpha = interpolate(
    frame,
    [T.focusClick - 8, T.focusClick + 8],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const press = spring({
    frame: frame - T.submitClick,
    fps,
    config: {damping: 9, mass: 0.5, stiffness: 200},
  });
  const btnScale = frame >= T.submitClick ? interpolate(press, [0, 0.5, 1], [1, 0.86, 1]) : 1;

  const t = b.p;
  const fontSize = lerp(40, 26, t);
  const iconPad = lerp(38, 30, t);
  const leftIcon = lerp(26, 22, t);
  const btnD = b.h - lerp(20, 16, t);
  const btnCx = b.x + b.w - btnD / 2 - 10;
  const btnCy = b.y + b.h / 2;

  const ring = interpolate(
    frame,
    [T.focusClick, T.focusClick + 20, T.submitClick, T.submitClick + 30],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const fr = frame - T.focusClick;
  const focusRipple = fr >= 0 && fr < 34;

  return (
    <div
      style={{
        position: 'absolute',
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        transform: `scale(${introScale})`,
        transformOrigin: 'center',
        opacity: introOpacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: b.r,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(6px)',
          border: `1.5px solid ${
            ring > 0 ? `rgba(47,107,255,${0.25 + ring * 0.45})` : 'rgba(220,227,240,0.9)'
          }`,
          boxShadow: `0 2px 4px rgba(20,30,60,0.04), 0 24px 60px -18px rgba(30,52,120,${lerp(
            0.28,
            0.18,
            t
          )}), inset 0 1px 0 rgba(255,255,255,0.9)${
            ring > 0 ? `, 0 0 0 ${6 * ring}px rgba(47,107,255,${0.1 * ring})` : ''
          }`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: iconPad,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.55,
        }}
      >
        <Magnifier size={leftIcon} color="#7C8598" stroke={2.1} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: iconPad + leftIcon + 18,
          right: btnD + 26,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            fontFamily: FONT,
            fontSize,
            color: C.faint,
            fontWeight: 400,
            opacity: placeholderAlpha,
            whiteSpace: 'nowrap',
          }}
        >
          Search millions of assets
        </span>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <span
            style={{
              fontFamily: FONT,
              fontSize,
              color: C.ink,
              fontWeight: 600,
              letterSpacing: -0.3,
              whiteSpace: 'nowrap',
            }}
          >
            {typed}
          </span>
          <div
            style={{
              width: Math.max(2, fontSize * 0.06),
              height: fontSize * 1.15,
              marginLeft: 4,
              borderRadius: 2,
              background: C.blue,
              opacity: caretAlpha,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: btnCx - btnD / 2 - b.x,
          top: btnCy - btnD / 2 - b.y,
          width: btnD,
          height: btnD,
          borderRadius: '50%',
          transform: `scale(${btnScale})`,
          background: `linear-gradient(145deg,#3E7BFF,${C.blueDeep})`,
          boxShadow: '0 10px 22px -6px rgba(31,84,230,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Magnifier size={btnD * 0.42} color="#fff" stroke={2.4} />
      </div>

      {focusRipple ? (
        <div
          style={{
            position: 'absolute',
            left: iconPad + leftIcon + 24,
            top: '50%',
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            borderRadius: '50%',
            border: '2px solid rgba(47,107,255,0.5)',
            transform: `scale(${interpolate(fr, [0, 34], [0.3, 7], {
              extrapolateRight: 'clamp',
            })})`,
            opacity: interpolate(fr, [0, 34], [0.6, 0], {extrapolateRight: 'clamp'}),
          }}
        />
      ) : null}

      {frame >= T.submitClick && frame < T.submitClick + 40 ? (
        <div
          style={{
            position: 'absolute',
            left: btnCx - b.x,
            top: btnCy - b.y,
            width: btnD,
            height: btnD,
            marginLeft: -btnD / 2,
            marginTop: -btnD / 2,
            borderRadius: '50%',
            border: '2.5px solid rgba(47,107,255,0.5)',
            transform: `scale(${interpolate(frame - T.submitClick, [0, 40], [1, 2.4], {
              extrapolateRight: 'clamp',
            })})`,
            opacity: interpolate(frame - T.submitClick, [0, 40], [0.7, 0], {
              extrapolateRight: 'clamp',
            }),
          }}
        />
      ) : null}
    </div>
  );
};

/* ============================================================================
   AUTOCOMPLETE
   ========================================================================== */
const Autocomplete: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const appear = spring({
    frame: frame - T.autoIn,
    fps,
    config: {damping: 16, mass: 0.7, stiffness: 130},
  });
  const close = interpolate(frame, [T.submitClick - 12, T.submitClick + 4], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vis = appear * close;
  if (vis <= 0.001) return null;

  const barX = 470;
  const barW = 980;
  const top = 438 + 96 + 14;
  const rowH = 62;

  const active = 0; // top exact-match suggestion stays selected

  return (
    <div
      style={{
        position: 'absolute',
        left: barX + 8,
        top,
        width: barW - 16,
        transformOrigin: 'top center',
        transform: `translateY(${interpolate(vis, [0, 1], [-14, 0])}px) scale(${interpolate(
          vis,
          [0, 1],
          [0.98, 1]
        )})`,
        opacity: vis,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 26,
          border: `1px solid ${C.line}`,
          boxShadow: '0 30px 70px -24px rgba(30,52,120,0.35), 0 4px 12px rgba(20,30,60,0.05)',
          padding: '14px 0',
          overflow: 'hidden',
        }}
      >
        {SUGGESTIONS.map((s, i) => {
          const rowReveal = interpolate(
            frame,
            [T.autoIn + i * 4, T.autoIn + i * 4 + 16],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          const isActive = i === active;
          const head = s[0];
          const tail = s[1];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: rowH,
                padding: '0 30px',
                background: isActive ? C.blueSoft : 'transparent',
                opacity: rowReveal,
                transform: `translateX(${interpolate(rowReveal, [0, 1], [10, 0])}px)`,
              }}
            >
              <div style={{opacity: 0.5, marginRight: 20, display: 'flex'}}>
                <Magnifier size={22} color={isActive ? C.blue : '#98A1B4'} stroke={2.1} />
              </div>
              <span style={{fontFamily: FONT, fontSize: 25, color: C.sub, fontWeight: 400}}>
                <span style={{color: C.ink, fontWeight: 600}}>{head}</span>
                {tail}
              </span>
              {isActive ? (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontFamily: FONT,
                    fontSize: 15,
                    letterSpacing: 1.5,
                    color: C.blue,
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  ↵ ENTER
                </div>
              ) : (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontFamily: FONT,
                    fontSize: 14,
                    color: C.faint,
                  }}
                >
                  {withCommas(Math.round(900000 + random('s' + i) * 900000))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   RESULT-CARD MOTIFS
   ========================================================================== */
const Motif: React.FC<{type: number; frame: number; seed: string}> = ({type, frame, seed}) => {
  const W = 477;
  const H = 286;
  const drift = Math.sin(frame / 40 + random(seed) * 6) * 6;

  if (type === 0) {
    const nodes = Array.from({length: 7}, (_, i) => ({
      x: 60 + random(seed + 'x' + i) * (W - 120),
      y: 50 + random(seed + 'y' + i) * (H - 100),
    }));
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{opacity: 0.9}}>
        <g transform={`translate(${drift},0)`}>
          {nodes.map((n, i) =>
            nodes.slice(i + 1).map((m, j) => {
              const d = Math.hypot(n.x - m.x, n.y - m.y);
              if (d > 190) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={n.x}
                  y1={n.y}
                  x2={m.x}
                  y2={m.y}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1.4}
                />
              );
            })
          )}
          {nodes.map((n, i) => {
            const pulse = 0.6 + 0.4 * Math.sin(frame / 16 + i);
            return (
              <circle key={i} cx={n.x} cy={n.y} r={5 + pulse * 3} fill="rgba(255,255,255,0.95)" />
            );
          })}
        </g>
      </svg>
    );
  }
  if (type === 1) {
    const mk = (off: number, amp: number, yb: number) => {
      let d = `M -20 ${yb}`;
      for (let x = -20; x <= W + 20; x += 20) {
        d += ` L ${x} ${yb + Math.sin(x / 46 + frame / 22 + off) * amp}`;
      }
      return d;
    };
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0, 1, 2, 3].map((k) => (
          <path
            key={k}
            d={mk(k * 1.1, 20 - k * 2, 70 + k * 45)}
            stroke={`rgba(255,255,255,${0.5 - k * 0.09})`}
            strokeWidth={2.4}
            fill="none"
          />
        ))}
      </svg>
    );
  }
  if (type === 2) {
    const cx = W / 2;
    const cy = H / 2;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[40, 74, 108].map((r, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={r}
            ry={r * 0.5}
            transform={`rotate(${frame / 3 + i * 30} ${cx} ${cy})`}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1.6}
            fill="none"
          />
        ))}
        <circle cx={cx} cy={cy} r={16} fill="rgba(255,255,255,0.95)" />
        {[0, 1, 2].map((i) => {
          const a = frame / 20 + (i * Math.PI * 2) / 3;
          const rr = [40, 74, 108][i];
          return (
            <circle
              key={i}
              cx={cx + Math.cos(a) * rr}
              cy={cy + Math.sin(a) * rr * 0.5}
              r={6}
              fill="rgba(255,255,255,0.95)"
            />
          );
        })}
      </svg>
    );
  }
  if (type === 3) {
    const n = 12;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from({length: n}, (_, i) => {
          const bw = 22;
          const gap = (W - 80 - n * bw) / (n - 1);
          const x = 40 + i * (bw + gap);
          const h = 40 + (0.5 + 0.5 * Math.sin(frame / 12 + i * 0.7)) * 120;
          return (
            <rect
              key={i}
              x={x}
              y={H / 2 - h / 2}
              width={bw}
              height={h}
              rx={7}
              fill={`rgba(255,255,255,${0.45 + (i % 3) * 0.12})`}
            />
          );
        })}
      </svg>
    );
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{opacity: 0.8}}>
      <g transform={`translate(${drift},0)`}>
        {Array.from({length: 9}, (_, i) => (
          <line
            key={'v' + i}
            x1={(W / 8) * i}
            y1={0}
            x2={W / 2 + ((W / 8) * i - W / 2) * 0.25}
            y2={H}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.3}
          />
        ))}
        {Array.from({length: 6}, (_, i) => (
          <line
            key={'h' + i}
            x1={0}
            y1={(H / 5) * i}
            x2={W}
            y2={(H / 5) * i}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1.2}
          />
        ))}
      </g>
    </svg>
  );
};

/* ============================================================================
   RESULT CARD
   ========================================================================== */
const GX = 210;
const CARD_W = 477;
const CARD_H = 286;
const COL_GAP = 34.5;
const ROW_GAP = 32;
const GY0 = 252;

const cardPos = (i: number) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return {
    x: GX + col * (CARD_W + COL_GAP),
    y: GY0 + row * (CARD_H + ROW_GAP),
    col,
    row,
  };
};

const ResultCard: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pos = cardPos(index);
  const seed = 'card' + index;

  const start = T.cardsStart + index * T.cardStagger;
  const appear = spring({
    frame: frame - start,
    fps,
    config: {damping: 18, mass: 0.8, stiffness: 110},
  });
  const y = interpolate(appear, [0, 1], [42, 0]);
  const sc = interpolate(appear, [0, 1], [0.9, 1]);
  const op = interpolate(appear, [0, 1], [0, 1]);

  const float = Math.sin(frame / 46 + index * 0.9) * 4;

  const isHover = index === 4;
  const hoverP = isHover
    ? spring({frame: frame - (T.hoverMove + 34), fps, config: {damping: 20, stiffness: 120}})
    : 0;
  const hoverLift = hoverP * -10;
  const hoverScale = 1 + hoverP * 0.03;

  const [g1, g2] = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const motifType = index % 5;
  const isVideo = index % 2 === 0;
  const dur = ['0:14', '0:22', '0:09', '0:30', '0:17'][index % 5];

  const shadow = isHover
    ? `0 40px 80px -20px rgba(30,52,120,${0.36 + hoverP * 0.14})`
    : '0 22px 48px -22px rgba(30,52,120,0.34)';

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: CARD_W,
        height: CARD_H,
        opacity: op,
        transform: `translateY(${y + float + hoverLift}px) scale(${sc * hoverScale})`,
        transformOrigin: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 22,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`,
          boxShadow: shadow,
        }}
      >
        <div style={{position: 'absolute', inset: 0}}>
          <Motif type={motifType} frame={frame} seed={seed} />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 90% at 20% 0%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 55%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'rgba(10,16,34,0.34)',
            backdropFilter: 'blur(6px)',
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          {isVideo ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2 1.5 L10.5 6 L2 10.5 Z" fill="#fff" />
              </svg>
              VIDEO
            </>
          ) : (
            <>4K PHOTO</>
          )}
        </div>
        {isVideo ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 62,
                height: 62,
                marginLeft: -31,
                marginTop: -31,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(4px)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${1 + Math.sin(frame / 18 + index) * 0.05})`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M6 3.5 L16 10 L6 16.5 Z" fill="#fff" />
              </svg>
            </div>
            <div
              style={{
                position: 'absolute',
                right: 14,
                bottom: 14,
                padding: '4px 10px',
                borderRadius: 8,
                background: 'rgba(10,16,34,0.42)',
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              {dur}
            </div>
          </>
        ) : null}

        {isHover && hoverP > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 96,
              opacity: hoverP,
              background: 'linear-gradient(0deg, rgba(6,10,26,0.72) 0%, rgba(6,10,26,0) 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 18,
            }}
          >
            <div style={{flex: 1}}>
              <div
                style={{
                  height: 12,
                  width: '70%',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.9)',
                  marginBottom: 9,
                }}
              />
              <div
                style={{
                  height: 9,
                  width: '45%',
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.5)',
                }}
              />
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.16)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20s-7-4.5-7-9.5A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.5C19 15.5 12 20 12 20Z"
                  stroke="#fff"
                  strokeWidth="1.8"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ============================================================================
   RESULTS HEADER
   ========================================================================== */
const ResultsHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [T.headerIn, T.headerIn + 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (appear <= 0.001) return null;

  const countProg = interpolate(frame, [T.countStart, T.countEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: eExpo,
  });
  const count = withCommas(countProg * 1284930);

  const chips = ['All', 'Photos', 'Videos', 'Vectors', '3D'];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: GX,
          top: 196,
          opacity: appear,
          transform: `translateY(${interpolate(appear, [0, 1], [10, 0])}px)`,
          fontFamily: FONT,
          fontSize: 27,
          color: C.sub,
          fontWeight: 400,
        }}
      >
        <span style={{color: C.ink, fontWeight: 700}}>{count}</span> results for{' '}
        <span style={{color: C.blue, fontWeight: 600}}>“Artificial Intelligence”</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 1040,
          top: 104,
          height: 52,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {chips.map((ch, i) => {
          const cr = interpolate(
            frame,
            [T.headerIn + 6 + i * 5, T.headerIn + 22 + i * 5],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          const activeChip = i === 0;
          return (
            <div
              key={ch}
              style={{
                opacity: cr,
                transform: `translateY(${interpolate(cr, [0, 1], [8, 0])}px)`,
                padding: '11px 22px',
                borderRadius: 22,
                fontFamily: FONT,
                fontSize: 19,
                fontWeight: 600,
                color: activeChip ? '#fff' : C.sub,
                background: activeChip
                  ? `linear-gradient(145deg,#3E7BFF,${C.blueDeep})`
                  : 'rgba(255,255,255,0.8)',
                border: activeChip ? 'none' : `1.5px solid ${C.line}`,
                boxShadow: activeChip ? '0 8px 18px -6px rgba(31,84,230,0.5)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {ch}
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ============================================================================
   RESULTS GRID
   ========================================================================== */
const Results: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.cardsStart - 4) return null;
  return (
    <>
      {Array.from({length: 9}, (_, i) => (
        <ResultCard key={i} index={i} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 190,
          background: 'linear-gradient(0deg,#EAF0FF 8%,rgba(234,240,255,0) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

/* ============================================================================
   LOADING SHIMMER
   ========================================================================== */
const Loading: React.FC = () => {
  const frame = useCurrentFrame();
  const on = frame >= T.submitClick + 4 && frame < T.headerIn + 6;
  if (!on) return null;
  const p = interpolate(frame, [T.submitClick + 4, T.headerIn + 6], [0, 1]);
  const opacity = interpolate(
    frame,
    [T.submitClick + 4, T.submitClick + 16, T.headerIn - 8, T.headerIn + 6],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const b = barState(frame, 60);
  return (
    <div
      style={{
        position: 'absolute',
        left: b.x + 24,
        top: b.y + b.h + 10,
        width: b.w - 48,
        height: 4,
        borderRadius: 4,
        overflow: 'hidden',
        background: 'rgba(47,107,255,0.12)',
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${-40 + p * 120}%`,
          top: 0,
          width: '40%',
          height: '100%',
          borderRadius: 4,
          background: `linear-gradient(90deg,rgba(47,107,255,0),${C.blue},rgba(47,107,255,0))`,
        }}
      />
    </div>
  );
};

/* ============================================================================
   CURSOR
   ========================================================================== */
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();

  const x = kf(frame, [
    {f: T.cursorIn, v: 1480, e: eOut},
    {f: T.focusClick, v: 706, e: eExpo},
    {f: T.focusClick + 20, v: 706},
    {f: 250, v: 1168, e: eInOut},
    {f: T.submitMove, v: 1168},
    {f: T.submitClick, v: 1402, e: eExpo},
    {f: 470, v: 1402},
    {f: 595, v: 960, e: eExpo},
  ]);
  const y = kf(frame, [
    {f: T.cursorIn, v: 1010, e: eOut},
    {f: T.focusClick, v: 486, e: eExpo},
    {f: T.focusClick + 20, v: 486},
    {f: 250, v: 556, e: eInOut},
    {f: T.submitMove, v: 556},
    {f: T.submitClick, v: 486, e: eExpo},
    {f: 470, v: 486},
    {f: 595, v: 712, e: eExpo},
  ]);

  const opacity = interpolate(
    frame,
    [T.cursorIn - 10, T.cursorIn + 8, 860, 895],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const dip = (cf: number) => {
    const d = frame - cf;
    if (d < 0 || d > 18) return 1;
    return interpolate(d, [0, 6, 18], [1, 0.82, 1], {extrapolateRight: 'clamp'});
  };
  const clickScale = Math.min(dip(T.focusClick), dip(T.submitClick), dip(T.hoverMove + 34));

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${clickScale})`,
        transformOrigin: 'top left',
        opacity,
        filter: 'drop-shadow(0 6px 10px rgba(20,30,60,0.32))',
      }}
    >
      <svg width="34" height="42" viewBox="0 0 24 30" fill="none">
        <path
          d="M4 2 L4 24 L10 18.5 L13.6 26.5 L17 25 L13.4 17 L21 17 Z"
          fill="#fff"
          stroke="#1A2440"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* ============================================================================
   LIGHT SWEEP
   ========================================================================== */
const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const on = frame >= T.sweep && frame < T.sweep + 90;
  if (!on) return null;
  const p = interpolate(frame, [T.sweep, T.sweep + 90], [-30, 130]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 240,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: `${p}%`,
          width: '22%',
          height: '140%',
          transform: 'rotate(14deg)',
          background:
            'linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.5) 50%,rgba(255,255,255,0) 100%)',
          filter: 'blur(6px)',
          opacity: 0.7,
        }}
      />
    </div>
  );
};

/* ============================================================================
   MAIN
   ========================================================================== */
export const Motion: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading Inter font'));

  useEffect(() => {
    const id = 'motion-inter-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    const anyDoc = document as unknown as {
      fonts: {load: (s: string) => Promise<unknown>; ready: Promise<unknown>};
    };
    Promise.all([
      anyDoc.fonts.load('400 1em Inter'),
      anyDoc.fonts.load('500 1em Inter'),
      anyDoc.fonts.load('600 1em Inter'),
      anyDoc.fonts.load('700 1em Inter'),
      anyDoc.fonts.load('800 1em Inter'),
    ])
      .then(() => anyDoc.fonts.ready)
      .then(finish)
      .catch(finish);
    const t = setTimeout(finish, 3000);
    return () => clearTimeout(t);
  }, [handle]);

  return (
    <AbsoluteFill style={{background: '#EAF0FF', fontFamily: FONT}}>
      <Background />
      <Results />
      <ResultsHeader />
      <Loading />
      <Autocomplete />
      <SearchBar />
      <LightSweep />
      <Cursor />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 260px rgba(40,60,120,0.10)',
        }}
      />
    </AbsoluteFill>
  );
};
