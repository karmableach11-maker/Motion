import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;
const TAU = Math.PI * 2;

const ROWS = 29;
const COLS = 42;
const PITCH_X = 50;
const PITCH_Y = 41.5;
const COIN_RADIUS = 34;

type Coin = {
  readonly id: number;
  readonly row: number;
  readonly col: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly startX: number;
  readonly startY: number;
  readonly spawnFrame: number;
  readonly settleFrame: number;
  readonly flightFrames: number;
  readonly scale: number;
  readonly finalAngle: number;
  readonly finalSquash: number;
  readonly startAngle: number;
  readonly spinTurns: number;
  readonly spinPhase: number;
  readonly bounceHeight: number;
  readonly slideDistance: number;
  readonly wobble: number;
  readonly tone: 0 | 1 | 2;
  readonly opacity: number;
  readonly depthBias: number;
};

type CoinState = {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly squashX: number;
  readonly opacity: number;
  readonly airborne: boolean;
};

type Dust = {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly opacity: number;
  readonly phase: number;
  readonly rate: number;
};

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const hash01 = (input: number): number => {
  let value = input | 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
};

const COINS: readonly Coin[] = Array.from(
  { length: ROWS * COLS },
  (_, id): Coin => {
    const row = Math.floor(id / COLS);
    const col = id % COLS;
    const visibleRow = Math.max(0, row - 2);
    const rowProgress = visibleRow / (ROWS - 3);
    const centerDistance =
      Math.abs(col - (COLS - 1) * 0.5) / ((COLS - 1) * 0.5);
    const settleJitter = (hash01(id * 7919 + 17) - 0.5) * 28;
    const settleFrame = Math.round(
      Math.min(
        758,
        104 + rowProgress * 700 + centerDistance * 58 + settleJitter,
      ),
    );
    const desiredFlightFrames = Math.round(76 + hash01(id * 104729 + 29) * 42);
    const spawnFrame = Math.max(44, settleFrame - desiredFlightFrames);
    const flightFrames = Math.max(1, settleFrame - spawnFrame);
    const rowOffset = row % 2 === 0 ? 0 : PITCH_X * 0.5;
    const targetX =
      -66 + col * PITCH_X + rowOffset + (hash01(id * 31337 + 43) - 0.5) * 18;
    const targetY = 1066 - row * PITCH_Y + (hash01(id * 65537 + 61) - 0.5) * 16;
    const startX =
      targetX + (hash01(id * 49999 + 79) - 0.5) * (190 + rowProgress * 90);
    const startY = -92 - hash01(id * 22343 + 97) * 360;
    const tone = Math.floor(hash01(id * 40507 + 109) * 3) as 0 | 1 | 2;

    return {
      id,
      row,
      col,
      targetX,
      targetY,
      startX,
      startY,
      spawnFrame,
      settleFrame,
      flightFrames,
      scale: 0.9 + hash01(id * 27127 + 127) * 0.2,
      finalAngle: (hash01(id * 8837 + 149) - 0.5) * 84,
      finalSquash: 0.86 + hash01(id * 19391 + 167) * 0.14,
      startAngle: (hash01(id * 92821 + 181) - 0.5) * 180,
      spinTurns: 3 + Math.floor(hash01(id * 8191 + 199) * 5),
      spinPhase: hash01(id * 68917 + 211) * TAU,
      bounceHeight: 10 + hash01(id * 49957 + 229) * 22,
      slideDistance: 3 + hash01(id * 10909 + 251) * 10,
      wobble: 4 + hash01(id * 28657 + 269) * 13,
      tone,
      opacity: 0.87 + hash01(id * 65521 + 283) * 0.13,
      depthBias: (hash01(id * 41761 + 331) - 0.5) * 16,
    };
  },
).sort(
  (a, b) => a.targetY + a.depthBias - (b.targetY + b.depthBias) || a.id - b.id,
);

const DUST: readonly Dust[] = Array.from({ length: 76 }, (_, id) => ({
  id,
  x: hash01(id * 29989 + 401) * WIDTH,
  y: hash01(id * 45161 + 419) * HEIGHT,
  radius: 0.6 + hash01(id * 65539 + 433) * 1.8,
  opacity: 0.06 + hash01(id * 79193 + 449) * 0.2,
  phase: hash01(id * 31397 + 463) * TAU,
  rate: 1 + Math.floor(hash01(id * 10163 + 479) * 3),
}));

const getCoinState = (coin: Coin, frame: number): CoinState => {
  // Two bottom overflow rows only seal the frame edge. Keeping them below
  // the floor during flight prevents a visible coin from passing through it.
  if (coin.row < 2) {
    const reveal = smoothstep(coin.settleFrame, coin.settleFrame + 12, frame);
    return {
      x: coin.targetX,
      y: coin.targetY,
      rotation: coin.finalAngle,
      squashX: coin.finalSquash,
      opacity: reveal,
      airborne: false,
    };
  }

  if (frame < coin.spawnFrame) {
    return {
      x: coin.startX,
      y: coin.startY,
      rotation: coin.startAngle,
      squashX: 0.96,
      opacity: 0,
      airborne: false,
    };
  }

  const rawFall = (frame - coin.spawnFrame) / coin.flightFrames;
  const fall = clamp(rawFall);
  const gravity = fall * fall;
  const horizontalEase = 1 - Math.pow(1 - fall, 1.7);
  const drift = Math.sin(fall * TAU * 1.15 + coin.spinPhase) * (1 - fall) * 15;
  const fallingX = mix(coin.startX, coin.targetX, horizontalEase) + drift;
  const fallingY = mix(coin.startY, coin.targetY, gravity);
  const landingRotation = coin.finalAngle + coin.spinTurns * 360;
  const fallingRotation = mix(
    coin.startAngle,
    landingRotation,
    Easing.inOut(Easing.cubic)(fall),
  );
  const spinFace =
    0.16 +
    Math.abs(Math.cos(coin.spinPhase + fall * coin.spinTurns * Math.PI)) * 0.84;
  const faceLock = smoothstep(0.76, 1, fall);
  const fallingSquash = mix(spinFace, coin.finalSquash, faceLock);
  const entrance = smoothstep(0, 8, frame - coin.spawnFrame);

  if (rawFall < 1) {
    return {
      x: fallingX,
      y: fallingY,
      rotation: fallingRotation,
      squashX: fallingSquash,
      opacity: entrance,
      airborne: true,
    };
  }

  const settleAge = Math.max(0, frame - coin.settleFrame);
  const decay = Math.exp(-settleAge / 16);
  const bounce =
    -Math.abs(Math.sin(settleAge * 0.32)) * coin.bounceHeight * decay;
  const slide = Math.sin(settleAge * 0.27) * coin.slideDistance * decay;
  const rotationWobble = Math.sin(settleAge * 0.3) * coin.wobble * decay;
  const squashPulse =
    Math.sin(settleAge * 0.42) * 0.06 * Math.exp(-settleAge / 11);

  return {
    x: coin.targetX + slide,
    y: coin.targetY + bounce,
    rotation: coin.finalAngle + rotationWobble,
    squashX: clamp(coin.finalSquash + squashPulse, 0.78, 1),
    opacity: 1,
    airborne: false,
  };
};

// DejaVu Sans Bold dollar glyph converted to an SVG path. Embedding the
// outline keeps the symbol identical on every render host and preserves the
// familiar closed "S" silhouette with one centered vertical stroke.
const DOLLAR_GLYPH =
  "M795 -301H633L632 0Q507 5 390 28Q273 51 162 92V354Q277 295 394.5 263.5Q512 232 633 228V539L600 545Q361 587 260.5 677Q160 767 160 936Q160 1115 282.5 1215.5Q405 1316 632 1325L633 1556H795V1329Q895 1321 995 1304Q1095 1287 1196 1260V1006Q1096 1048 996 1071.5Q896 1095 795 1100V813L827 807Q1081 767 1183.5 673.5Q1286 580 1286 397Q1286 213 1164 114.5Q1042 16 795 2ZM633 836V1097Q562 1093 519.5 1058.5Q477 1024 477 971Q477 912 516 878.5Q555 845 633 836ZM795 510V232Q882 233 925.5 266Q969 299 969 365Q969 433 929 466.5Q889 500 795 510Z";

const CoinSymbol: React.FC<{
  id: string;
  light: string;
  mid: string;
  dark: string;
}> = ({ id, light, mid, dark }) => (
  <g id={`m23-coin-${id}`}>
    <defs>
      <radialGradient id={`m23-face-${id}`} cx="29%" cy="22%" r="78%">
        <stop offset="0" stopColor={light} />
        <stop offset="0.28" stopColor={mid} />
        <stop offset="0.76" stopColor="#e9910a" />
        <stop offset="1" stopColor={dark} />
      </radialGradient>
      <linearGradient id={`m23-rim-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff0a1" />
        <stop offset="0.25" stopColor="#f7bc32" />
        <stop offset="0.63" stopColor="#b96502" />
        <stop offset="0.86" stopColor="#ffcf4e" />
        <stop offset="1" stopColor="#834000" />
      </linearGradient>
    </defs>

    <circle cx="1.9" cy="3.4" r="33.5" fill="#6b3600" opacity="0.82" />
    <circle cx="0.8" cy="2.1" r="33.5" fill="#a45a02" />
    <circle
      r="33.5"
      fill={`url(#m23-face-${id})`}
      stroke="#7a3d00"
      strokeWidth="1.6"
    />
    <circle
      r="29.2"
      fill="none"
      stroke={`url(#m23-rim-${id})`}
      strokeWidth="3.4"
    />
    <circle
      r="25"
      fill="rgba(255, 198, 54, 0.14)"
      stroke="#a85a03"
      strokeWidth="1.25"
    />
    <circle
      r="22.1"
      fill="none"
      stroke="#9f5707"
      strokeWidth="1.25"
      strokeDasharray="2.4 3.2"
      opacity="0.9"
    />
    <path
      d={DOLLAR_GLYPH}
      transform="translate(1.45 1.7) scale(0.026 -0.026) translate(-712.5 -627.5)"
      fill="#5d2b00"
      stroke="#4d2200"
      strokeWidth="24"
      strokeLinejoin="round"
    />
    <path
      d={DOLLAR_GLYPH}
      transform="scale(0.026 -0.026) translate(-712.5 -627.5)"
      fill="#8f5008"
      stroke="#6e3600"
      strokeWidth="20"
      strokeLinejoin="round"
    />
    <path
      d="M -20 -20 A 28 28 0 0 1 12 -29"
      fill="none"
      stroke="#fff6bd"
      strokeWidth="3.2"
      strokeLinecap="round"
      opacity="0.72"
    />
    <path
      d="M -27 13 A 31 31 0 0 0 -13 27"
      fill="none"
      stroke="#ffcf4d"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle cx="-18" cy="-6" r="1.8" fill="#ffe586" opacity="0.72" />
    <circle cx="18" cy="7" r="1.45" fill="#8d4d05" opacity="0.68" />
  </g>
);

const coinHref = (tone: 0 | 1 | 2): string =>
  tone === 0
    ? "#m23-coin-bright"
    : tone === 1
      ? "#m23-coin-warm"
      : "#m23-coin-deep";

const coinTransform = (coin: Coin, state: CoinState): string =>
  `translate(${state.x.toFixed(3)} ${state.y.toFixed(3)}) rotate(${state.rotation.toFixed(3)}) scale(${(
    coin.scale * state.squashX
  ).toFixed(4)} ${coin.scale.toFixed(4)})`;

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = (frame / TOTAL_FRAMES) * TAU;
  const fillProgress = smoothstep(70, 758, frame);
  const resetProgress = smoothstep(870, 899, frame);
  const coinFade = 1 - resetProgress;
  const stageFill = fillProgress * (1 - resetProgress);
  const floorOpacity = Math.max(1 - smoothstep(120, 560, frame), resetProgress);
  const fullHold =
    smoothstep(756, 782, frame) * (1 - smoothstep(852, 878, frame));
  const sweepProgress = interpolate(frame, [780, 850], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const sweepOpacity =
    smoothstep(776, 795, frame) * (1 - smoothstep(836, 855, frame));
  const coinStates = COINS.map((coin) => ({
    coin,
    state: getCoinState(coin, frame),
  }));

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#020711",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(ellipse 56% 64% at 50% 32%, rgba(24, 46, 76, 0.62) 0%, rgba(7, 18, 35, 0.52) 48%, transparent 82%), radial-gradient(ellipse 64% 24% at 50% 92%, rgba(205, 117, 14, 0.19) 0%, rgba(80, 46, 11, 0.08) 46%, transparent 78%), linear-gradient(180deg, #071120 0%, #030914 55%, #02060e 100%)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <defs>
          <radialGradient id="m23-stage-glow">
            <stop offset="0" stopColor="#ffc642" stopOpacity="0.34" />
            <stop offset="0.42" stopColor="#d87909" stopOpacity="0.13" />
            <stop offset="1" stopColor="#9c4f00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="m23-floor-line" x1="0" x2="1">
            <stop offset="0" stopColor="#a67b32" stopOpacity="0" />
            <stop offset="0.22" stopColor="#d7b86b" stopOpacity="0.26" />
            <stop offset="0.5" stopColor="#ffe19a" stopOpacity="0.54" />
            <stop offset="0.78" stopColor="#d7b86b" stopOpacity="0.26" />
            <stop offset="1" stopColor="#a67b32" stopOpacity="0" />
          </linearGradient>
          <filter
            id="m23-wide-blur"
            x="-30%"
            y="-220%"
            width="160%"
            height="540%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="32" />
          </filter>
          <CoinSymbol
            id="bright"
            light="#fff7bf"
            mid="#ffd75d"
            dark="#ad5900"
          />
          <CoinSymbol id="warm" light="#ffe998" mid="#ffc43d" dark="#9d4c00" />
          <CoinSymbol id="deep" light="#ffdc72" mid="#eda21a" dark="#813b00" />
          <linearGradient id="m23-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff8d3" stopOpacity="0" />
            <stop offset="0.42" stopColor="#fff8d3" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fffbe7" stopOpacity="0.55" />
            <stop offset="0.58" stopColor="#fff8d3" stopOpacity="0" />
            <stop offset="1" stopColor="#fff8d3" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g>
          {DUST.map((dust) => {
            const twinkle =
              0.58 + 0.42 * Math.sin(phase * dust.rate + dust.phase);
            return (
              <circle
                key={`dust-${dust.id}`}
                cx={dust.x}
                cy={dust.y}
                r={dust.radius}
                fill="#d6e4ff"
                opacity={dust.opacity * twinkle}
              />
            );
          })}
        </g>

        <ellipse
          cx={WIDTH * 0.5}
          cy={1032}
          rx={390 + stageFill * 560}
          ry={25 + stageFill * 42}
          fill="url(#m23-stage-glow)"
          filter="url(#m23-wide-blur)"
          opacity={0.5 + stageFill * 0.5}
        />
        <rect
          x={158}
          y={1007}
          width={WIDTH - 316}
          height={1.5}
          fill="url(#m23-floor-line)"
          opacity={floorOpacity}
        />

        <g opacity={coinFade}>
          {coinStates.map(({ coin, state }) => {
            if (state.opacity <= 0) return null;
            return (
              <use
                key={`coin-${coin.id}`}
                href={coinHref(coin.tone)}
                transform={coinTransform(coin, state)}
                opacity={state.opacity * coin.opacity}
              />
            );
          })}
        </g>

        <g
          opacity={sweepOpacity * 0.62}
          style={{ mixBlendMode: "screen" }}
          transform={`translate(${mix(-980, 980, sweepProgress)} 0) rotate(-13 960 540)`}
        >
          <rect
            x={420}
            y={-280}
            width={1080}
            height={1640}
            fill="url(#m23-sweep)"
          />
        </g>

        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="#ffcf55"
          opacity={fullHold * 0.025}
          style={{ mixBlendMode: "screen" }}
        />
      </svg>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(95,130,180,0.009) 0px, rgba(95,130,180,0.009) 1px, transparent 1px, transparent 5px)",
          mixBlendMode: "soft-light",
          opacity: 0.55,
        }}
      />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 76% 70% at 50% 48%, transparent 47%, rgba(0, 3, 9, 0.25) 75%, rgba(0, 2, 7, 0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
