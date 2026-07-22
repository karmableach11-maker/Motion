import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;

const COLORS = {
  ink: "#241B38",
  inkSoft: "#3B2948",
  navy: "#071A37",
  blue: "#0E315D",
  teal: "#2BB7A9",
  tealLight: "#7CE2CE",
  coral: "#F0835D",
  coralDark: "#B94846",
  coralLight: "#FFAE79",
  lining: "#291C38",
  liningLight: "#533452",
  gold: "#FFD45D",
  goldDark: "#E58C20",
  cream: "#FFF3D5",
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const phase = (
  frame: number,
  from: number,
  to: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const seeded = (seed: number, salt = 0) => {
  const value = Math.sin(seed * 91.733 + salt * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

const impactPulseAt = (frame: number, impact: number, duration = 38) => {
  if (frame < impact || frame > impact + duration) return 0;
  const age = (frame - impact) / duration;
  return Math.sin(age * Math.PI) * Math.exp(-age * 0.72);
};

type Deposit = {
  impact: number;
  startX: number;
  startY: number;
  rotation: number;
};

const DEPOSITS: Deposit[] = [
  { impact: 244, startX: 308, startY: 20, rotation: -18 },
  { impact: 334, startX: 510, startY: 28, rotation: 20 },
  { impact: 424, startX: 346, startY: 12, rotation: -12 },
  { impact: 514, startX: 478, startY: 25, rotation: 16 },
  { impact: 604, startX: 410, startY: 8, rotation: -8 },
];

const COIN_VALUE = 20;
const SLOT_X = 410;
const SLOT_Y = 316;

const AmbientBackground: React.FC<{
  frame: number;
  open: number;
  energy: number;
}> = ({ frame, open, energy }) => {
  const loopProgress = frame / (TOTAL_FRAMES - 1);
  const cycle = loopProgress * Math.PI * 2;
  const driftX = Math.sin(cycle) * 34;
  const driftY = Math.cos(cycle) * 24;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, #154A70 0%, #0C2B54 35%, #071A37 72%, #041127 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -240 + driftX,
          top: 95 + driftY,
          width: 650,
          height: 650,
          borderRadius: "50%",
          background: "#145376",
          opacity: 0.34,
          boxShadow: "inset -28px -22px 0 rgba(3,18,44,.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -265 - driftX,
          top: 185 - driftY,
          width: 610,
          height: 610,
          borderRadius: "50%",
          background: "#0F516D",
          opacity: 0.28,
          boxShadow: "inset 34px 20px 0 rgba(3,18,44,.2)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <radialGradient id="back-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#58DCC7" stopOpacity=".23" />
            <stop offset="54%" stopColor="#36B7AD" stopOpacity=".08" />
            <stop offset="100%" stopColor="#36B7AD" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="arch-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7CE2CE" stopOpacity=".12" />
            <stop offset=".5" stopColor="#FFD45D" stopOpacity=".34" />
            <stop offset="1" stopColor="#7CE2CE" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <ellipse
          cx="960"
          cy="610"
          rx={455 + open * 44 + energy * 24}
          ry={355 + open * 28 + energy * 12}
          fill="url(#back-halo)"
          opacity={0.68 + open * 0.2}
        />
        {[0, 1, 2].map((index) => (
          <ellipse
            key={index}
            cx="960"
            cy="630"
            rx={366 + index * 96 + open * 22}
            ry={252 + index * 63 + open * 14}
            fill="none"
            stroke="url(#arch-stroke)"
            strokeWidth={index === 0 ? 3 : 2}
            strokeDasharray={`${28 + index * 12} ${24 + index * 18}`}
            strokeDashoffset={
              (index % 2 === 0 ? -1 : 1) *
              loopProgress *
              (52 + index * 30) *
              (index + 1)
            }
            opacity={0.32 - index * 0.055 + open * 0.08}
            transform={`rotate(${index % 2 === 0 ? 4 : -5} 960 630)`}
          />
        ))}
      </svg>

      {Array.from({ length: 34 }).map((_, index) => {
        const x = 105 + seeded(index, 2) * 1710;
        const y = 94 + seeded(index, 5) * 820;
        const size = 2 + seeded(index, 8) * 4;
        const twinkle =
          0.18 +
          Math.pow(Math.sin(cycle + seeded(index, 12) * Math.PI * 2), 2) *
            0.46;
        const warm = index % 6 === 0;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x + Math.sin(cycle + index) * 7,
              top: y + Math.cos(cycle + index * 0.8) * 5,
              width: size,
              height: size,
              borderRadius: index % 5 === 0 ? 1 : "50%",
              background: warm ? COLORS.gold : COLORS.tealLight,
              opacity: twinkle * (0.7 + open * 0.24),
              transform: `rotate(${loopProgress * 360 + index * 17}deg)`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          bottom: 68,
          height: 210,
          background:
            "radial-gradient(ellipse at center, rgba(4,12,31,.54) 0%, rgba(4,12,31,.22) 45%, transparent 73%)",
          filter: "blur(8px)",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 47%, rgba(2,9,27,.18) 72%, rgba(2,7,21,.58) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BalanceCounter: React.FC<{
  amount: number;
  reveal: number;
  pulse: number;
}> = ({ amount, reveal, pulse }) => {
  const scale = 0.88 + reveal * 0.12 + pulse * 0.055;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 90,
        width: 390,
        height: 128,
        marginLeft: -195,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * -28}px) scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "14px -12px -14px 12px",
          borderRadius: 38,
          background: COLORS.ink,
          opacity: 0.44,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 38,
          background: COLORS.cream,
          border: `6px solid ${COLORS.ink}`,
          boxShadow: `0 0 ${34 + pulse * 30}px rgba(255,212,93,${0.08 + pulse * 0.22})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: COLORS.coralDark,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 4.8,
            lineHeight: 1,
            marginBottom: 5,
          }}
        >
          TOTAL SAVED
        </div>
        <div
          style={{
            color: COLORS.ink,
            fontSize: 62,
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 0.98,
            fontVariantNumeric: "tabular-nums",
            minWidth: 260,
            textAlign: "center",
          }}
        >
          ${amount}
        </div>
      </div>
    </div>
  );
};

const Coin: React.FC<{
  size: number;
  id: number;
  flip: number;
  shine: number;
}> = ({ size, id, flip, shine }) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    <defs>
      <linearGradient id={`coin-face-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF2A0" />
        <stop offset=".38" stopColor={COLORS.gold} />
        <stop offset="1" stopColor="#F19A2B" />
      </linearGradient>
      <clipPath id={`coin-clip-${id}`}>
        <circle cx="60" cy="56" r="44" />
      </clipPath>
    </defs>
    <ellipse cx="60" cy="68" rx="50" ry="43" fill="#9C4D26" opacity=".46" />
    <circle cx="60" cy="56" r="51" fill={COLORS.ink} />
    <circle
      cx="60"
      cy="54"
      r="45"
      fill={`url(#coin-face-${id})`}
      stroke="#FFE98C"
      strokeWidth="4"
    />
    <circle
      cx="60"
      cy="54"
      r="34"
      fill="none"
      stroke="#D47B20"
      strokeWidth="3"
      strokeDasharray="3 6"
      opacity=".76"
    />
    <text
      x="60"
      y="75"
      textAnchor="middle"
      fill={COLORS.inkSoft}
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="57"
      fontWeight="900"
      transform={`translate(60 54) scale(${0.82 + flip * 0.18} 1) translate(-60 -54)`}
    >
      $
    </text>
    <g clipPath={`url(#coin-clip-${id})`} opacity={shine}>
      <rect
        x="18"
        y="-15"
        width="18"
        height="135"
        rx="9"
        fill="#FFFFFF"
        opacity=".5"
        transform="rotate(26 27 50)"
      />
    </g>
  </svg>
);

const DepositCoin: React.FC<{
  frame: number;
  deposit: Deposit;
  index: number;
}> = ({ frame, deposit, index }) => {
  const appear = deposit.impact - 68;
  const hoverEnd = deposit.impact - 31;
  const visibilityIn = phase(
    frame,
    appear,
    appear + 12,
    Easing.out(Easing.cubic),
  );
  const visibilityOut = phase(
    frame,
    deposit.impact + 11,
    deposit.impact + 27,
    Easing.in(Easing.cubic),
  );
  const drop = phase(
    frame,
    hoverEnd,
    deposit.impact,
    Easing.in(Easing.cubic),
  );
  const after = phase(
    frame,
    deposit.impact,
    deposit.impact + 24,
    Easing.out(Easing.cubic),
  );
  const hover = phase(frame, appear, hoverEnd, Easing.out(Easing.cubic));
  const horizontal = Easing.inOut(Easing.cubic)(drop);
  const x = mix(deposit.startX, SLOT_X, horizontal);
  const hoverY = deposit.startY - Math.sin(hover * Math.PI) * 11;
  const y =
    frame <= deposit.impact
      ? mix(hoverY, SLOT_Y, drop)
      : SLOT_Y + after * 174;
  const rotation = deposit.rotation + drop * (index % 2 === 0 ? 172 : -164) + after * 65;
  const flip =
    0.24 +
    Math.abs(Math.cos((drop * 1.45 + after * 0.7 + index * 0.17) * Math.PI)) *
      0.76;
  const size = 116 + (index === 4 ? 8 : 0);
  const opacity = visibilityIn * (1 - visibilityOut);
  const scale = 0.78 + visibilityIn * 0.22 + (1 - flip) * 0.05;

  return (
    <>
      {drop > 0 && drop < 1 &&
        [0, 1, 2, 3].map((trailIndex) => {
          const delay = (trailIndex + 1) * 0.07;
          const trailProgress = clamp(drop - delay);
          const tx = mix(deposit.startX, SLOT_X, Easing.inOut(Easing.cubic)(trailProgress));
          const ty = mix(hoverY, SLOT_Y, Easing.in(Easing.cubic)(trailProgress));
          const dotSize = 13 - trailIndex * 2.2;
          return (
            <div
              key={trailIndex}
              style={{
                position: "absolute",
                left: tx - dotSize / 2,
                top: ty - dotSize / 2,
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                background: COLORS.gold,
                opacity: opacity * (0.3 - trailIndex * 0.045),
              }}
            />
          );
        })}
      <div
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          opacity,
          transform: `rotate(${rotation}deg) scale(${scale}) scaleX(${flip})`,
          transformOrigin: "50% 50%",
          filter: "drop-shadow(0 14px 10px rgba(16,11,32,.34))",
        }}
      >
        <Coin
          size={size}
          id={index}
          flip={flip}
          shine={0.48 + (1 - flip) * 0.35}
        />
      </div>
    </>
  );
};

const WalletFlap: React.FC<{
  open: number;
  opacity: number;
  unlock: number;
  face: "front" | "rear";
}> = ({ open, opacity, unlock, face }) => {
  const p = clamp(open);
  // Project a 180-degree hinge rotation into 2D. At p === 0.5 the flap is
  // genuinely edge-on, so it can move between the front and rear layers
  // without teleporting while it still has a visible surface area.
  const rawProjection = Math.cos(p * Math.PI);
  const projection =
    Math.sign(rawProjection) * Math.pow(Math.abs(rawProjection), 1.22);
  const frontProjection = Math.max(0, projection);
  const rearProjection = Math.max(0, -projection);
  const faceStrength = Math.abs(projection);
  const centerTipY =
    302 + frontProjection * 264 - rearProjection * 254;
  const sideTipY =
    302 + frontProjection * 170 - rearProjection * 214;
  const controlY =
    302 + frontProjection * 66 - rearProjection * 92;
  const centerControlY = centerTipY + projection * 28;
  const stitchSideY =
    sideTipY - frontProjection * 14 + rearProjection * 7;
  const stitchLineY =
    centerTipY - frontProjection * 20 + rearProjection * 17;
  const stitchControlY =
    centerControlY - frontProjection * 20 + rearProjection * 20;
  const stitchGuideY =
    302 + frontProjection * 51 - rearProjection * 93;
  const snapY =
    302 + frontProjection * 180 - rearProjection * 164;
  const stitchY =
    302 + frontProjection * 139 - rearProjection * 191;
  const stitchStartY = 302 + faceStrength * 9;
  const sideHandle = faceStrength * 28;
  const stitchHandle = faceStrength * 21;
  const flapD = `M 110 302 C 110 ${controlY} 142 ${sideTipY - sideHandle} 196 ${sideTipY} L 354 ${centerTipY - faceStrength * 2} Q 410 ${centerControlY} 466 ${centerTipY - faceStrength * 2} L 624 ${sideTipY} C 678 ${sideTipY - sideHandle} 710 ${controlY} 710 302 Z`;
  const stitchD = `M 136 ${stitchStartY} C 142 ${stitchGuideY} 170 ${stitchSideY - stitchHandle} 211 ${stitchSideY} L 359 ${stitchLineY} Q 410 ${stitchControlY} 461 ${stitchLineY} L 609 ${stitchSideY} C 650 ${stitchSideY - stitchHandle} 678 ${stitchGuideY} 684 ${stitchStartY}`;
  const gradientId = `flap-fill-${face}`;
  const clipId = `flap-clip-${face}`;

  return (
    <svg
      width="820"
      height="610"
      viewBox="0 0 820 610"
      style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.coralLight} />
          <stop offset=".42" stopColor={COLORS.coral} />
          <stop offset="1" stopColor={COLORS.coralDark} />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={flapD} />
        </clipPath>
      </defs>
      <path
        d={flapD}
        fill={COLORS.ink}
        transform={`translate(0 ${14 * faceStrength})`}
        opacity={0.38 * faceStrength}
      />
      <path
        d={flapD}
        fill={`url(#${gradientId})`}
        stroke={COLORS.ink}
        strokeWidth="11"
        strokeLinejoin="round"
      />
      <g clipPath={`url(#${clipId})`} opacity={0.5 * faceStrength}>
        <circle
          cx={280 - rearProjection * 28}
          cy={302 + frontProjection * 78 - rearProjection * 142}
          r={126 + rearProjection * 22}
          fill="#FFB987"
          opacity=".25"
        />
        <path
          d={`M 78 ${302 + frontProjection * 56 - rearProjection * 34} Q 330 ${302 + frontProjection * 151 - rearProjection * 146} 744 ${302 + frontProjection * 36 - rearProjection * 54}`}
          fill="none"
          stroke="#8F3F46"
          strokeWidth="18"
          opacity=".13"
        />
      </g>
      <path
        d={stitchD}
        fill="none"
        stroke="#FFD29F"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="7 12"
        opacity={0.78 * faceStrength}
      />
      <circle
        cx="410"
        cy={snapY + 6}
        r={29 + unlock * 4}
        fill={COLORS.ink}
        opacity={0.28 * faceStrength}
      />
      <circle
        cx="410"
        cy={snapY}
        r={27 + unlock * 3}
        fill={COLORS.goldDark}
        stroke={COLORS.ink}
        strokeWidth="7"
        opacity={faceStrength}
      />
      <circle
        cx="403"
        cy={snapY - 7}
        r="7"
        fill="#FFF1A0"
        opacity={0.88 * faceStrength}
      />
      <path
        d={`M 174 ${stitchY} Q 410 ${302 + frontProjection * 252 - rearProjection * 232} 646 ${stitchY}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        opacity={(0.08 + rearProjection * 0.08) * faceStrength}
        strokeLinecap="round"
      />
    </svg>
  );
};

const WalletBack: React.FC<{ open: number; pulse: number }> = ({ open, pulse }) => {
  const cavityRy = 7 + open * 53 + pulse * 4;
  return (
    <svg
      width="820"
      height="610"
      viewBox="0 0 820 610"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="back-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F79A68" />
          <stop offset=".58" stopColor={COLORS.coral} />
          <stop offset="1" stopColor={COLORS.coralDark} />
        </linearGradient>
        <radialGradient id="cavity" cx="50%" cy="34%" r="68%">
          <stop offset="0" stopColor={COLORS.liningLight} />
          <stop offset=".52" stopColor={COLORS.lining} />
          <stop offset="1" stopColor="#140F24" />
        </radialGradient>
      </defs>
      <path
        d="M 106 278 Q 106 246 143 239 L 677 239 Q 714 246 714 278 L 730 494 Q 733 555 669 568 L 151 568 Q 87 555 90 494 Z"
        fill={COLORS.ink}
        transform="translate(0 15)"
        opacity=".44"
      />
      <path
        d="M 106 278 Q 106 246 143 239 L 677 239 Q 714 246 714 278 L 730 494 Q 733 555 669 568 L 151 568 Q 87 555 90 494 Z"
        fill="url(#back-body)"
        stroke={COLORS.ink}
        strokeWidth="11"
        strokeLinejoin="round"
      />
      <path
        d={`M 98 309 Q 132 ${282 - open * 24} 181 294 L 183 499 Q 134 488 103 455 Z`}
        fill="#A84143"
        stroke={COLORS.ink}
        strokeWidth="8"
        opacity={0.42 + open * 0.58}
      />
      <path
        d={`M 722 309 Q 688 ${282 - open * 24} 639 294 L 637 499 Q 686 488 717 455 Z`}
        fill="#A84143"
        stroke={COLORS.ink}
        strokeWidth="8"
        opacity={0.42 + open * 0.58}
      />
      <ellipse
        cx="410"
        cy={303 - open * 3}
        rx={266 + open * 10}
        ry={cavityRy}
        fill="url(#cavity)"
        stroke={COLORS.ink}
        strokeWidth="10"
        opacity={0.18 + open * 0.82}
      />
      <ellipse
        cx="410"
        cy={287 - open * 8}
        rx={226 + open * 20}
        ry={3 + open * 31}
        fill="#8D5670"
        opacity={open * 0.22}
      />
      <path
        d="M 150 272 Q 410 229 670 272"
        fill="none"
        stroke="#FFBC88"
        strokeWidth="6"
        strokeLinecap="round"
        opacity={0.35 + open * 0.35}
      />
    </svg>
  );
};

const WalletFront: React.FC<{ open: number; pulse: number }> = ({ open, pulse }) => {
  const lipY = 327 + pulse * 5;
  return (
    <svg
      width="820"
      height="610"
      viewBox="0 0 820 610"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="front-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF9C69" />
          <stop offset=".46" stopColor={COLORS.coral} />
          <stop offset="1" stopColor="#C34C48" />
        </linearGradient>
      </defs>
      <path
        d={`M 94 ${lipY} Q 410 ${lipY + 49 - open * 26} 726 ${lipY} L 730 498 Q 730 556 669 568 L 151 568 Q 90 556 90 498 Z`}
        fill="url(#front-body)"
        stroke={COLORS.ink}
        strokeWidth="11"
        strokeLinejoin="round"
      />
      <path
        d={`M 121 ${lipY + 25} Q 410 ${lipY + 65 - open * 21} 699 ${lipY + 25}`}
        fill="none"
        stroke="#FFBB87"
        strokeWidth="5"
        opacity=".55"
        strokeLinecap="round"
      />
      <path
        d="M 122 392 L 122 490 Q 122 529 165 536 L 655 536 Q 698 529 698 490 L 698 392"
        fill="none"
        stroke="#FFD0A1"
        strokeWidth="4"
        strokeDasharray="7 12"
        strokeLinecap="round"
        opacity=".78"
      />
      <path
        d="M 117 431 Q 310 517 665 418 L 697 529 Q 666 563 614 568 L 169 568 Q 121 558 103 520 Z"
        fill="#8F3D45"
        opacity=".14"
      />
      <circle
        cx="410"
        cy="432"
        r="20"
        fill={COLORS.goldDark}
        stroke={COLORS.ink}
        strokeWidth="7"
        opacity={open}
      />
      <circle cx="404" cy="426" r="5" fill="#FFF0A2" opacity={open * 0.8} />
    </svg>
  );
};

const ImpactAccent: React.FC<{
  frame: number;
  impact: number;
  index: number;
}> = ({ frame, impact, index }) => {
  const age = phase(frame, impact, impact + 44, Easing.out(Easing.cubic));
  const visible =
    phase(frame, impact, impact + 3, Easing.out(Easing.cubic)) *
    (1 - phase(frame, impact + 17, impact + 44, Easing.in(Easing.cubic)));
  if (frame < impact || frame > impact + 45) return null;
  return (
    <>
      <svg
        width="820"
        height="610"
        viewBox="0 0 820 610"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {[0, 1].map((ring) => (
          <ellipse
            key={ring}
            cx={SLOT_X}
            cy={SLOT_Y + 6}
            rx={(32 + ring * 24) + age * (142 + ring * 28)}
            ry={(10 + ring * 5) + age * (30 + ring * 6)}
            fill="none"
            stroke={ring === 0 ? "#FFF3AB" : COLORS.gold}
            strokeWidth={5 - ring * 2}
            opacity={visible * (0.75 - ring * 0.18)}
          />
        ))}
      </svg>
      {Array.from({ length: 12 }).map((_, particle) => {
        const angle =
          -Math.PI * 0.92 +
          (particle / 11) * Math.PI * 0.84 +
          (seeded(particle, index) - 0.5) * 0.12;
        const radius = age * (70 + seeded(particle, index + 4) * 120);
        const x = SLOT_X + Math.cos(angle) * radius;
        const y = SLOT_Y + Math.sin(angle) * radius * 0.78;
        const size = 7 + seeded(particle, index + 8) * 8;
        return (
          <div
            key={particle}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: particle % 3 === 0 ? 2 : "50%",
              background: particle % 4 === 0 ? COLORS.tealLight : COLORS.gold,
              opacity: visible * (0.84 - particle * 0.02),
              transform: `rotate(${age * 180 + particle * 23}deg) scale(${1 - age * 0.28})`,
            }}
          />
        );
      })}
    </>
  );
};

const FloatingIncrement: React.FC<{
  frame: number;
  impact: number;
  index: number;
}> = ({ frame, impact, index }) => {
  const reveal = phase(frame, impact, impact + 8, Easing.out(Easing.back(1.7)));
  const exit = phase(frame, impact + 28, impact + 52, Easing.in(Easing.cubic));
  const travel = phase(frame, impact, impact + 52, Easing.out(Easing.cubic));
  return (
    <div
      style={{
        position: "absolute",
        left: SLOT_X + (index % 2 === 0 ? 72 : -164),
        top: SLOT_Y - 44 - travel * 80,
        width: 100,
        height: 46,
        borderRadius: 23,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.ink,
        background: COLORS.gold,
        border: `4px solid ${COLORS.ink}`,
        fontSize: 24,
        fontWeight: 900,
        opacity: reveal * (1 - exit),
        transform: `scale(${0.72 + reveal * 0.28}) rotate(${index % 2 === 0 ? -4 : 4}deg)`,
        boxShadow: "7px 9px 0 rgba(36,27,56,.22)",
      }}
    >
      +$20
    </div>
  );
};

const SnapAccent: React.FC<{ frame: number }> = ({ frame }) => {
  const impact = 796;
  const progress = phase(frame, impact, impact + 34, Easing.out(Easing.cubic));
  const opacity =
    phase(frame, impact, impact + 3) *
    (1 - phase(frame, impact + 14, impact + 34, Easing.in(Easing.cubic)));
  return (
    <svg
      width="820"
      height="610"
      viewBox="0 0 820 610"
      style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}
    >
      <circle
        cx="410"
        cy="482"
        r={30 + progress * 80}
        fill="none"
        stroke={COLORS.gold}
        strokeWidth={6 - progress * 3}
      />
      {[0, 1, 2, 3].map((ray) => {
        const angle = (ray * Math.PI) / 2 + Math.PI / 4;
        const inner = 42 + progress * 34;
        const outer = 74 + progress * 82;
        return (
          <line
            key={ray}
            x1={410 + Math.cos(angle) * inner}
            y1={482 + Math.sin(angle) * inner}
            x2={410 + Math.cos(angle) * outer}
            y2={482 + Math.sin(angle) * outer}
            stroke="#FFF0A0"
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const unlock = spring({
    frame: frame - 49,
    fps,
    durationInFrames: 33,
    config: { damping: 9, stiffness: 170, mass: 0.55 },
  });
  const opening = spring({
    frame: frame - 75,
    fps,
    durationInFrames: 84,
    config: { damping: 14, stiffness: 92, mass: 0.72 },
  });
  const closing = spring({
    frame: frame - 720,
    fps,
    durationInFrames: 78,
    config: { damping: 15, stiffness: 108, mass: 0.7 },
  });
  const open = clamp(opening * (1 - closing));
  const unlockState = clamp(unlock * (1 - closing));

  let amount = 0;
  for (let index = 0; index < DEPOSITS.length; index++) {
    const deposit = DEPOSITS[index];
    if (frame >= deposit.impact) {
      const roll = phase(
        frame,
        deposit.impact,
        deposit.impact + 18,
        Easing.out(Easing.cubic),
      );
      amount = Math.round(index * COIN_VALUE + roll * COIN_VALUE);
    }
  }

  const impactPulse = Math.max(
    0,
    ...DEPOSITS.map((deposit) => impactPulseAt(frame, deposit.impact)),
  );
  const walletJolt = DEPOSITS.reduce((sum, deposit) => {
    if (frame < deposit.impact) return sum;
    const age = frame - deposit.impact;
    return sum + Math.sin(age * 0.72) * Math.exp(-age / 13) * 6.5;
  }, 0);
  const closePulse = impactPulseAt(frame, 796, 42);
  const counterIn = phase(frame, 132, 174, Easing.out(Easing.back(1.35)));
  const counterOut = phase(frame, 682, 718, Easing.in(Easing.cubic));
  const counterReveal = counterIn * (1 - counterOut);
  const flapRearOpacity = phase(
    open,
    0.46,
    0.49,
    Easing.inOut(Easing.cubic),
  );
  const flapFrontOpacity =
    1 -
    phase(
      open,
      0.51,
      0.54,
      Easing.inOut(Easing.cubic),
    );
  const cycle = (frame / (TOTAL_FRAMES - 1)) * Math.PI * 2;
  const idleY = Math.sin(cycle) * 2.5;
  const cameraScale = interpolate(
    open,
    [0, 1],
    [1, 1.055],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const openingAnticipation =
    phase(frame, 48, 62, Easing.out(Easing.cubic)) *
    (1 - phase(frame, 62, 82, Easing.inOut(Easing.cubic)));
  const closingAnticipation =
    phase(frame, 696, 716, Easing.out(Easing.cubic)) *
    (1 - phase(frame, 716, 740, Easing.in(Easing.cubic)));
  const walletScaleX =
    1 + openingAnticipation * 0.018 + closingAnticipation * 0.012 + closePulse * 0.018;
  const walletScaleY =
    1 - openingAnticipation * 0.025 - closingAnticipation * 0.018 - closePulse * 0.026;

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        background: COLORS.navy,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <AmbientBackground frame={frame} open={open} energy={impactPulse} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraScale})`,
          transformOrigin: "50% 58%",
        }}
      >
        <BalanceCounter
          amount={amount}
          reveal={counterReveal}
          pulse={impactPulse}
        />

        <div
          style={{
            position: "absolute",
            left: 550,
            top: 300,
            width: 820,
            height: 610,
            transform: `translateY(${idleY + walletJolt + openingAnticipation * 8 + closingAnticipation * 6}px) scaleX(${walletScaleX}) scaleY(${walletScaleY + impactPulse * 0.005})`,
            transformOrigin: "50% 88%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 104,
              top: 526,
              width: 612,
              height: 86,
              borderRadius: "50%",
              background: "rgba(3,10,26,.52)",
              filter: "blur(14px)",
              transform: `scaleX(${0.94 + open * 0.08 - impactPulse * 0.035})`,
              opacity: 0.78,
            }}
          />

          <WalletBack open={open} pulse={impactPulse} />
          <WalletFlap
            open={open}
            opacity={flapRearOpacity}
            unlock={unlockState}
            face="rear"
          />

          {DEPOSITS.map((deposit, index) => (
            <DepositCoin
              key={index}
              frame={frame}
              deposit={deposit}
              index={index}
            />
          ))}

          <WalletFront open={open} pulse={impactPulse} />
          <WalletFlap
            open={open}
            opacity={flapFrontOpacity}
            unlock={unlockState}
            face="front"
          />

          {DEPOSITS.map((deposit, index) => (
            <React.Fragment key={index}>
              <ImpactAccent
                frame={frame}
                impact={deposit.impact}
                index={index}
              />
              <FloatingIncrement
                frame={frame}
                impact={deposit.impact}
                index={index}
              />
            </React.Fragment>
          ))}
          <SnapAccent frame={frame} />
        </div>
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.025), transparent 18%, transparent 82%, rgba(0,0,0,.12))",
        }}
      />
    </AbsoluteFill>
  );
};
