import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const CYCLE_FRAMES = 300;

const RAIL_START_X = 340;
const RAIL_END_X = 1560;
const HEAD_END_X = 1537;
const RAIL_Y = 542;
const ARROW_BASE_X = 1440;
const ARROW_HALF_HEIGHT = 58;

const smoothstep = (value: number): number => {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
};

const PremiumStaticBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#09060D",
        backgroundImage: [
          "radial-gradient(ellipse 52% 25% at 50% 50%, rgba(141,74,105,0.25) 0%, rgba(84,34,67,0.13) 42%, rgba(13,8,17,0) 76%)",
          "linear-gradient(112deg, #07050A 0%, #160A18 43%, #1B0D19 56%, #08050B 100%)",
          "repeating-linear-gradient(118deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, rgba(0,0,0,0.018) 1px, rgba(0,0,0,0.018) 6px)",
        ].join(", "),
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 45% 9% at 50% 50.2%, rgba(250,184,92,0.105) 0%, rgba(190,109,60,0.035) 48%, transparent 78%)",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow:
            "inset 0 0 220px rgba(0,0,0,0.74), inset 0 0 70px rgba(0,0,0,0.42)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          top: "50.2%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,214,146,0.035) 22%, rgba(255,232,191,0.075) 50%, rgba(255,214,146,0.035) 78%, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

const ValueGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const cycleFrame = frame % CYCLE_FRAMES;
  const phase = cycleFrame / (CYCLE_FRAMES - 1);
  const headX = RAIL_START_X + (HEAD_END_X - RAIL_START_X) * phase;

  // The high-energy trail is about one third of the frame at peak. A longer,
  // much dimmer tail preserves the reference's slow luminance decay.
  const innerTailX = Math.max(RAIL_START_X, headX - 690);
  const outerTailX = Math.max(RAIL_START_X, headX - 1080);
  const innerGradientEnd = Math.max(innerTailX + 1, headX);
  const outerGradientEnd = Math.max(outerTailX + 1, headX);

  // The reference arrow remains energized through the positional wrap: a long
  // residual decay from the previous cycle overlaps the next approach.
  const residualArrow = 0.86 * Math.exp(-cycleFrame / 138);
  const approachArrow = smoothstep((phase - 0.8) / 0.2);
  const arrowEnergy = Math.min(1, residualArrow + approachArrow * 0.88);

  const arrowPath = `M ${ARROW_BASE_X} ${RAIL_Y - ARROW_HALF_HEIGHT} L ${RAIL_END_X} ${RAIL_Y} L ${ARROW_BASE_X} ${RAIL_Y + ARROW_HALF_HEIGHT}`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{position: "absolute", inset: 0}}
    >
      <defs>
        <linearGradient id="pearlText" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFDF7" />
          <stop offset="0.48" stopColor="#F8EEDC" />
          <stop offset="1" stopColor="#B99C74" />
        </linearGradient>

        <linearGradient
          id="railMetal"
          x1={RAIL_START_X}
          y1={RAIL_Y}
          x2={RAIL_END_X}
          y2={RAIL_Y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#54301E" />
          <stop offset="0.24" stopColor="#85502F" />
          <stop offset="0.52" stopColor="#A46D40" />
          <stop offset="0.82" stopColor="#7A472B" />
          <stop offset="1" stopColor="#4C2B1C" />
        </linearGradient>

        <linearGradient
          id="outerTrail"
          x1={outerTailX}
          y1={RAIL_Y}
          x2={outerGradientEnd}
          y2={RAIL_Y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#B64F31" stopOpacity="0" />
          <stop offset="0.34" stopColor="#C96736" stopOpacity="0.05" />
          <stop offset="0.7" stopColor="#E99446" stopOpacity="0.13" />
          <stop offset="1" stopColor="#FFD88D" stopOpacity="0.34" />
        </linearGradient>

        <linearGradient
          id="innerTrail"
          x1={innerTailX}
          y1={RAIL_Y}
          x2={innerGradientEnd}
          y2={RAIL_Y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#B9552D" stopOpacity="0" />
          <stop offset="0.18" stopColor="#C96D35" stopOpacity="0.08" />
          <stop offset="0.5" stopColor="#E89542" stopOpacity="0.35" />
          <stop offset="0.78" stopColor="#FFC967" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFF7DE" stopOpacity="1" />
        </linearGradient>

        <radialGradient id="ambientGold" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFD894" stopOpacity="0.22" />
          <stop offset="0.36" stopColor="#D98236" stopOpacity="0.11" />
          <stop offset="1" stopColor="#9A3F24" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="headHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFDF4" stopOpacity="0.9" />
          <stop offset="0.09" stopColor="#FFE9BA" stopOpacity="0.65" />
          <stop offset="0.3" stopColor="#F5A74F" stopOpacity="0.24" />
          <stop offset="1" stopColor="#B84A2C" stopOpacity="0" />
        </radialGradient>

        <filter
          id="textShadow"
          x="-30%"
          y="-60%"
          width="160%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur" />
          <feFlood floodColor="#D18A45" floodOpacity="0.19" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id="softGoldGlow"
          x="-30%"
          y="-420%"
          width="160%"
          height="940%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feFlood floodColor="#E87935" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter
          id="hotGoldGlow"
          x="-170%"
          y="-380%"
          width="440%"
          height="860%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="13" result="blurWide" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="blurTight" />
          <feFlood floodColor="#FFAA45" floodOpacity="0.88" result="colorWide" />
          <feFlood floodColor="#FFF4D4" floodOpacity="0.98" result="colorTight" />
          <feComposite in="colorWide" in2="blurWide" operator="in" result="wide" />
          <feComposite in="colorTight" in2="blurTight" operator="in" result="tight" />
          <feMerge>
            <feMergeNode in="wide" />
            <feMergeNode in="tight" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="950"
        cy={RAIL_Y}
        rx="735"
        ry="125"
        fill="url(#ambientGold)"
        opacity="0.28"
      />

      <text
        x="952"
        y="466"
        textAnchor="middle"
        fill="url(#pearlText)"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="110"
        fontWeight="900"
        letterSpacing="1"
        transform="translate(952 0) scale(0.64 1) translate(-952 0)"
        filter="url(#textShadow)"
      >
        VALUE
      </text>

      <text
        x="234"
        y="568"
        textAnchor="middle"
        fill="url(#pearlText)"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="70"
        fontWeight="500"
        letterSpacing="0.4"
        transform="translate(234 0) scale(0.75 1) translate(-234 0)"
        filter="url(#textShadow)"
      >
        −MIN
      </text>

      <text
        x="1676"
        y="568"
        textAnchor="middle"
        fill="url(#pearlText)"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="70"
        fontWeight="500"
        letterSpacing="0.4"
        transform="translate(1676 0) scale(0.75 1) translate(-1676 0)"
        filter="url(#textShadow)"
      >
        +MAX
      </text>

      <line
        x1={RAIL_START_X}
        y1={RAIL_Y}
        x2={RAIL_END_X}
        y2={RAIL_Y}
        stroke="#B26F3A"
        strokeWidth="18"
        strokeLinecap="round"
        opacity="0.05"
      />
      <line
        x1={RAIL_START_X}
        y1={RAIL_Y}
        x2={RAIL_END_X}
        y2={RAIL_Y}
        stroke="url(#railMetal)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.72"
      />
      <line
        x1={RAIL_START_X}
        y1={RAIL_Y - 1}
        x2={RAIL_END_X}
        y2={RAIL_Y - 1}
        stroke="#F3C487"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.2"
      />

      <path
        d={arrowPath}
        fill="none"
        stroke="#9D673D"
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.06 + arrowEnergy * 0.045}
      />
      <path
        d={arrowPath}
        fill="none"
        stroke="url(#railMetal)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.72 + arrowEnergy * 0.2}
        filter="url(#softGoldGlow)"
      />
      <path
        d={arrowPath}
        fill="none"
        stroke="#FFF1D0"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.36 + arrowEnergy * 0.5}
      />

      <line
        x1={outerTailX}
        y1={RAIL_Y}
        x2={headX}
        y2={RAIL_Y}
        stroke="url(#outerTrail)"
        strokeWidth="34"
        strokeLinecap="round"
        filter="url(#softGoldGlow)"
      />
      <line
        x1={innerTailX}
        y1={RAIL_Y}
        x2={headX}
        y2={RAIL_Y}
        stroke="url(#innerTrail)"
        strokeWidth="11"
        strokeLinecap="round"
        opacity="0.72"
        filter="url(#softGoldGlow)"
      />
      <line
        x1={innerTailX}
        y1={RAIL_Y}
        x2={headX}
        y2={RAIL_Y}
        stroke="url(#innerTrail)"
        strokeWidth="3.6"
        strokeLinecap="round"
        filter="url(#hotGoldGlow)"
      />
      <line
        x1={innerTailX}
        y1={RAIL_Y - 0.8}
        x2={headX}
        y2={RAIL_Y - 0.8}
        stroke="#FFF9EA"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.72"
      />

      <ellipse
        cx={headX}
        cy={RAIL_Y}
        rx="122"
        ry="54"
        fill="url(#headHalo)"
        opacity="0.78"
        style={{mixBlendMode: "screen"}}
      />
      <circle
        cx={headX}
        cy={RAIL_Y}
        r="6.2"
        fill="#FFF8E6"
        filter="url(#hotGoldGlow)"
      />
      <circle cx={headX} cy={RAIL_Y} r="2.1" fill="#FFFFFF" />

      <path
        d={arrowPath}
        fill="none"
        stroke="#F4A84D"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={arrowEnergy * 0.14}
        filter="url(#softGoldGlow)"
      />
      <path
        d={arrowPath}
        fill="none"
        stroke="#FFF3D1"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={arrowEnergy * 0.78}
        filter="url(#hotGoldGlow)"
      />
    </svg>
  );
};

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill>
      <PremiumStaticBackground />
      <ValueGraphic />
    </AbsoluteFill>
  );
};
