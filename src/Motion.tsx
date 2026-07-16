import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  random,
} from "remotion";

/**
 * NEON OTP CODE ENTRY
 * Six one-time-passcode boxes fill with digits one by one while a circular
 * countdown ticks down; a verification sweep runs across the code, the timer
 * morphs into a green checkmark with confirmation rings, then the scene
 * gracefully resets — a seamless narrative loop.
 * Original, generic, IP-safe motion-graphics loop for microstock.
 * 1920x1080 · 60fps · seamless loop over the full duration.
 * Fully deterministic (frame / fps / seeded random only).
 */

/* ------------------------------------------------------------------ *
 *  Palette & layout
 * ------------------------------------------------------------------ */

const CYAN: [number, number, number] = [86, 214, 255];
const GOLD: [number, number, number] = [255, 196, 92];
const EMER: [number, number, number] = [92, 255, 168];
const STEEL: [number, number, number] = [120, 168, 214];

const N_BOX = 6;
const BOX = { w: 112, h: 138, r: 20, gap: 40 };
const BOX_STEP = BOX.w + BOX.gap;
const BOX_Y = 610;
const CX = 960;
const TIMER = { x: 960, y: 286, r: 88 };
const TIMER_CIRC = 2 * Math.PI * TIMER.r;

/* ------------------------------------------------------------------ *
 *  Timeline (fractions of total duration)
 * ------------------------------------------------------------------ */

const T_DIGIT0 = 0.06;
const T_DIGIT_STEP = 0.055; // last digit lands at 0.335
const T_SWEEP = [0.4, 0.46] as const; // verification sweep across the code
const T_VERIFY = [0.46, 0.56] as const; // timer -> green check
const T_RESET = [0.84, 0.95] as const;

/* ------------------------------------------------------------------ *
 *  Helpers
 * ------------------------------------------------------------------ */

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const rgb = (c: [number, number, number], a = 1) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mixC = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

const seg = (
  t: number,
  a: number,
  b: number,
  easing: (v: number) => number = Easing.inOut(Easing.cubic)
) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

type Layer = {
  stroke: string;
  strokeWidth: number;
  filter?: string;
  opacity: number;
  fill: string;
};

const NeonShape: React.FC<{
  color: [number, number, number];
  coreW: number;
  glowW: number;
  opacity?: number;
  render: (p: Layer) => React.ReactNode;
}> = ({ color, coreW, glowW, opacity = 1, render }) => (
  <g opacity={opacity}>
    {render({ stroke: rgb(color, 0.9), strokeWidth: glowW, filter: "url(#blurBig)", opacity: 0.55, fill: "none" })}
    {render({ stroke: rgb(color, 1), strokeWidth: coreW * 2, filter: "url(#blurSmall)", opacity: 0.85, fill: "none" })}
    {render({ stroke: "rgba(255,255,255,0.96)", strokeWidth: coreW, opacity: 0.96, fill: "none" })}
  </g>
);

// neon text: three stacked passes (halo, glow, white core)
const NeonText: React.FC<{
  color: [number, number, number];
  size: number;
  children: string;
}> = ({ color, size, children }) => {
  const common = {
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
    fontFamily: "'Courier New', monospace",
    fontWeight: 700 as const,
    fontSize: size,
  };
  return (
    <g>
      <text {...common} fill={rgb(color, 0.85)} filter="url(#blurBig)" opacity={0.6}>{children}</text>
      <text {...common} fill={rgb(color, 1)} filter="url(#blurSmall)" opacity={0.9}>{children}</text>
      <text {...common} fill="rgba(255,255,255,0.96)">{children}</text>
    </g>
  );
};

const CHECK_D = "M -34 4 L -10 28 L 38 -24";
const CHECK_LEN = 105;

/* ------------------------------------------------------------------ *
 *  Main composition
 * ------------------------------------------------------------------ */

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const D = durationInFrames;
  const t = frame / D;
  const tau = Math.PI * 2;
  const cyc = (target: number) => Math.max(1, Math.round(D / target));
  const TICK_C = cyc(60); // one tick per second at 60fps
  const AMB_DY_C = cyc(300);
  const AMB_TW_C = cyc(180);
  const BREATH_C = cyc(420);
  const HALO_C = cyc(150);

  const breath = Math.sin(((frame * BREATH_C) / D) * tau);

  /* ---------------- state curves ---------------- */

  // digits: pop in one by one, pop out during reset
  const digits = Array.from({ length: N_BOX }).map((_, i) => {
    const tin = T_DIGIT0 + i * T_DIGIT_STEP;
    const pin = seg(t, tin, tin + 0.03, Easing.out(Easing.back(1.9)));
    const pout = 1 - seg(t, T_RESET[0] + 0.01 + i * 0.008, T_RESET[0] + 0.05 + i * 0.008);
    const vis = pin * pout;
    const value = Math.floor(random(`dg${i}`) * 10).toString();
    return { vis, value, tin };
  });

  // success level: rises at verify, falls at reset
  const success =
    seg(t, T_VERIFY[0], T_VERIFY[0] + 0.05) * (1 - seg(t, T_RESET[0], T_RESET[0] + 0.05));

  // verification sweep position (gated)
  const sweepT = seg(t, T_SWEEP[0], T_SWEEP[1], Easing.inOut(Easing.cubic));
  const sweepOn = t > T_SWEEP[0] && t < T_SWEEP[1] + 0.005 ? 1 : 0;
  const sweepX = mix(CX - 500, CX + 500, sweepT);

  // countdown arc: depletes while entering, freezes at verify, refills at reset
  const depl = seg(t, 0.0, T_VERIFY[0], Easing.linear); // linear countdown (cyclic-appropriate)
  const refill = seg(t, T_RESET[0], T_RESET[1], Easing.inOut(Easing.cubic));
  const arcProgress = mix(mix(1, 0.3, depl), 1, refill); // 1 -> 0.3 -> back to 1
  // urgency color: cyan -> gold as it depletes; green when verified
  const arcCol = mixC(mixC(CYAN, GOLD, 1 - (arcProgress - 0.3) / 0.7), EMER, success);

  // per-second tick pulse, only while counting
  const counting = (1 - seg(t, T_VERIFY[0] - 0.01, T_VERIFY[0])) + seg(t, T_RESET[1] - 0.015, T_RESET[1]);
  const countGate = Math.min(1, counting);
  const tickPhase = Math.pow(Math.max(0, Math.sin(((frame * TICK_C) / D) * tau)), 6);
  const tick = tickPhase * countGate;

  // timer -> check morph
  const morph = seg(t, T_VERIFY[0], T_VERIFY[1]) * (1 - seg(t, T_RESET[0], T_RESET[0] + 0.045));
  const checkDraw = seg(t, T_VERIFY[0] + 0.02, T_VERIFY[1] + 0.02, Easing.inOut(Easing.cubic));
  const checkScale = seg(t, T_VERIFY[0], T_VERIFY[1], Easing.out(Easing.back(1.6)));

  // confirmation rings from the timer at verify
  const rings = [0, 1, 2].map((i) => {
    const s = seg(t, T_VERIFY[0] + 0.015 + i * 0.03, T_VERIFY[0] + 0.16 + i * 0.03, Easing.out(Easing.cubic));
    return s > 0 && s < 1 ? s : null;
  });

  const halo = success * (0.75 + 0.25 * Math.sin(((frame * HALO_C) / D) * tau));

  /* ---------------- render ---------------- */

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 85% at 50% 44%, rgba(24,44,62,0.22) 0%, rgba(8,14,24,0.1) 42%, rgba(0,0,0,0) 72%)",
        }}
      />

      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="blurSmall" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blurBig" x="-140%" y="-140%" width="380%" height="380%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="blurHuge" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <clipPath id="boxRowClip">
            <rect x={CX - (N_BOX * BOX_STEP - BOX.gap) / 2 - 10} y={BOX_Y - BOX.h / 2 - 10}
              width={N_BOX * BOX_STEP - BOX.gap + 20} height={BOX.h + 20} rx={BOX.r} />
          </clipPath>
        </defs>

        {/* ambient dust */}
        {Array.from({ length: 42 }).map((_, i) => {
          const bx = random(`ax${i}`) * width;
          const by = 110 + random(`ay${i}`) * (height - 200);
          const dy = 14 * Math.sin(((frame * AMB_DY_C) / D) * tau + i);
          const tw = 0.05 + 0.12 * (0.5 + 0.5 * Math.sin(((frame * AMB_TW_C) / D) * tau + i * 1.3));
          return (
            <circle key={i} cx={bx} cy={by + dy} r={0.8 + random(`ar${i}`) * 1.5}
              fill={rgb(STEEL, tw)} filter="url(#blurSmall)" />
          );
        })}

        {/* halos */}
        <circle cx={TIMER.x} cy={TIMER.y} r={210} fill={rgb(EMER, 0.28 * halo)} filter="url(#blurHuge)" />
        <ellipse cx={CX} cy={BOX_Y} rx={560} ry={200}
          fill={rgb(mixC(STEEL, EMER, success), 0.09 + 0.09 * success)} filter="url(#blurHuge)" />

        {/* confirmation rings */}
        {rings.map((s, i) =>
          s === null ? null : (
            <circle key={i} cx={TIMER.x} cy={TIMER.y} r={TIMER.r + 10 + s * 280} fill="none"
              stroke={rgb(EMER, 0.55 * (1 - s))} strokeWidth={3 * (1 - s) + 0.6} filter="url(#blurSmall)" />
          )
        )}

        {/* ------- CIRCULAR COUNTDOWN / CHECK ------- */}
        <g transform={`translate(${TIMER.x} ${TIMER.y}) scale(${1 + 0.012 * breath + 0.05 * tick})`}>
          {/* base track */}
          <circle r={TIMER.r} fill="none" stroke={rgb(STEEL, 0.18)} strokeWidth={5} filter="url(#blurSmall)" />
          {/* tick marks */}
          <g opacity={0.5 + 0.3 * tick}>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (tau / 12) * i - Math.PI / 2;
              return (
                <line key={i}
                  x1={(TIMER.r + 12) * Math.cos(a)} y1={(TIMER.r + 12) * Math.sin(a)}
                  x2={(TIMER.r + 20) * Math.cos(a)} y2={(TIMER.r + 20) * Math.sin(a)}
                  stroke={rgb(arcCol, 0.8)} strokeWidth={2.2} strokeLinecap="round" filter="url(#blurSmall)" />
              );
            })}
          </g>
          {/* depleting arc (rotated so it drains from 12 o'clock, clockwise) */}
          <g transform="rotate(-90)" opacity={1 - 0.35 * morph}>
            <NeonShape color={arcCol} coreW={3} glowW={11}
              render={(p) => (
                <circle r={TIMER.r} strokeDasharray={TIMER_CIRC}
                  strokeDashoffset={TIMER_CIRC * (1 - arcProgress)} strokeLinecap="round" {...p} />
              )} />
          </g>
          {/* center: hourglass-style dot pulse while counting, check when verified */}
          <circle r={7 + 3 * tick} fill={rgb(arcCol, 0.9)} filter="url(#blurSmall)" opacity={(1 - morph) * countGate} />
          {morph > 0.01 ? (
            <g transform={`scale(${0.6 + 0.4 * checkScale})`} opacity={morph}>
              <circle r={TIMER.r - 22} fill={rgb(EMER, 0.1 + 0.08 * halo)} />
              <NeonShape color={EMER} coreW={3.2} glowW={11}
                render={(p) => (
                  <path d={CHECK_D} strokeLinejoin="round" strokeLinecap="round"
                    strokeDasharray={CHECK_LEN} strokeDashoffset={CHECK_LEN * (1 - checkDraw)} {...p} />
                )} />
            </g>
          ) : null}
        </g>

        {/* ------- OTP BOXES ------- */}
        {digits.map((d, i) => {
          const x = CX + (i - (N_BOX - 1) / 2) * BOX_STEP;
          const filled = d.vis > 0.02 ? 1 : 0;
          const boxCol = mixC(mixC(STEEL, CYAN, 0.55 * filled), EMER, success);
          // small pop of the box itself when its digit lands
          const boxPop = 1 + 0.05 * seg(t, d.tin, d.tin + 0.025, Easing.out(Easing.cubic)) *
            (1 - seg(t, d.tin + 0.025, d.tin + 0.08, Easing.inOut(Easing.cubic)));
          return (
            <g key={i} transform={`translate(${x} ${BOX_Y}) scale(${boxPop})`}>
              <rect x={-BOX.w / 2} y={-BOX.h / 2} width={BOX.w} height={BOX.h} rx={BOX.r}
                fill={rgb(boxCol, 0.05 + 0.04 * success)} />
              <NeonShape color={boxCol} coreW={2.2} glowW={8} opacity={0.9}
                render={(p) => (
                  <rect x={-BOX.w / 2} y={-BOX.h / 2} width={BOX.w} height={BOX.h} rx={BOX.r} {...p} />
                )} />
              {/* underline placeholder when empty */}
              <rect x={-26} y={34} width={52} height={4} rx={2}
                fill={rgb(boxCol, 0.5 * (1 - d.vis))} filter="url(#blurSmall)" />
              {/* digit */}
              {d.vis > 0.01 ? (
                <g transform={`scale(${d.vis})`} opacity={Math.min(1, d.vis)}>
                  <NeonText color={mixC(CYAN, EMER, success)} size={72}>{d.value}</NeonText>
                </g>
              ) : null}
            </g>
          );
        })}

        {/* verification sweep band across the boxes */}
        {sweepOn ? (
          <g clipPath="url(#boxRowClip)">
            <rect x={sweepX - 34} y={BOX_Y - BOX.h / 2 - 10} width={68} height={BOX.h + 20}
              fill={rgb(CYAN, 0.28)} filter="url(#blurBig)" />
            <rect x={sweepX - 4} y={BOX_Y - BOX.h / 2 - 10} width={8} height={BOX.h + 20}
              fill="rgba(255,255,255,0.75)" filter="url(#blurSmall)" />
          </g>
        ) : null}
      </svg>

      {/* grain against banding */}
      <svg width="100%" height="100%"
        style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.05, pointerEvents: "none" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" seed="17" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.5  0 0 0 0 0.62  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 90% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
