import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const FILL_END = 852;
const SIZE = 960;
const CENTER = SIZE / 2;
const ARC_RADIUS = 325;
const TRACK_RADIUS = 380;
const ARC_STROKE = 105;
const ARC_CIRCUMFERENCE = Math.PI * 2 * ARC_RADIUS;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const NeonBackdrop: React.FC<{pulse: number}> = ({pulse}) => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #0d031c 0%, #05000d 18%, #010004 46%, #000000 78%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 560,
          height: 560,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(130,42,255,0.18) 0%, rgba(238,29,255,0.085) 28%, rgba(255,25,177,0.035) 50%, rgba(0,0,0,0) 74%)",
          filter: `blur(${22 + pulse * 5}px)`,
          opacity: 0.8 + pulse * 0.14,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.32) 64%, rgba(0,0,0,0.86) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const RingHalo: React.FC<{
  dash: number;
  progress: number;
  pulse: number;
  isComplete: boolean;
}> = ({dash, progress, pulse, isComplete}) => {
  const headAngle = -Math.PI / 2 + progress * Math.PI * 2;
  const headX = CENTER + ARC_RADIUS * Math.cos(headAngle);
  const headY = CENTER + ARC_RADIUS * Math.sin(headAngle);
  const headOpacity = interpolate(progress, [0, 0.012, 0.985, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arcDash = isComplete ? undefined : `${dash} ${ARC_CIRCUMFERENCE}`;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        position: "absolute",
        width: 440,
        height: 440,
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="neonArc" x1="18%" y1="8%" x2="85%" y2="92%">
          <stop offset="0%" stopColor="#6538FF" />
          <stop offset="38%" stopColor="#A62CFF" />
          <stop offset="72%" stopColor="#F117FF" />
          <stop offset="100%" stopColor="#FF2FAF" />
        </linearGradient>
        <linearGradient id="neonCore" x1="18%" y1="8%" x2="85%" y2="92%">
          <stop offset="0%" stopColor="#D9C9FF" />
          <stop offset="40%" stopColor="#F3D5FF" />
          <stop offset="74%" stopColor="#FFD5FA" />
          <stop offset="100%" stopColor="#FFE1EF" />
        </linearGradient>
        <linearGradient id="neonTrack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#835DFF" />
          <stop offset="48%" stopColor="#C866FF" />
          <stop offset="100%" stopColor="#FF45BD" />
        </linearGradient>
        <radialGradient id="innerDisc" cx="44%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#13072B" />
          <stop offset="58%" stopColor="#080116" />
          <stop offset="100%" stopColor="#020007" />
        </radialGradient>
        <filter id="wideBloom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={46 + pulse * 5} />
        </filter>
        <filter id="midBloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={18 + pulse * 2} />
        </filter>
        <filter id="tightBloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={5 + pulse * 0.8} />
        </filter>
        <filter id="headBloom" x="-500%" y="-500%" width="1000%" height="1000%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      <circle
        cx={CENTER}
        cy={CENTER}
        r={ARC_RADIUS}
        fill="none"
        stroke="#9A27FF"
        strokeWidth={ARC_STROKE + 52}
        strokeDasharray={arcDash}
        strokeLinecap="butt"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        opacity={0.13 + pulse * 0.045}
        filter="url(#wideBloom)"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={275}
        fill="url(#innerDisc)"
        stroke="rgba(182,107,255,0.14)"
        strokeWidth={2}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={TRACK_RADIUS}
        fill="none"
        stroke="#8A3EFF"
        strokeWidth={26}
        opacity={0.28 + pulse * 0.045}
        filter="url(#midBloom)"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={TRACK_RADIUS}
        fill="none"
        stroke="url(#neonTrack)"
        strokeWidth={7}
        opacity={0.98}
      />

      <circle
        cx={CENTER}
        cy={CENTER}
        r={ARC_RADIUS}
        fill="none"
        stroke="#E317FF"
        strokeWidth={ARC_STROKE + 24}
        strokeDasharray={arcDash}
        strokeLinecap="butt"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        opacity={0.36 + pulse * 0.07}
        filter="url(#midBloom)"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={ARC_RADIUS}
        fill="none"
        stroke="url(#neonArc)"
        strokeWidth={ARC_STROKE}
        strokeDasharray={arcDash}
        strokeLinecap="butt"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={ARC_RADIUS}
        fill="none"
        stroke="url(#neonCore)"
        strokeWidth={10}
        strokeDasharray={arcDash}
        strokeLinecap="butt"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        opacity={0.72 + pulse * 0.08}
        filter="url(#tightBloom)"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={ARC_RADIUS}
        fill="none"
        stroke="url(#neonCore)"
        strokeWidth={3.2}
        strokeDasharray={arcDash}
        strokeLinecap="butt"
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        opacity={0.94}
      />

      <circle
        cx={headX}
        cy={headY}
        r={25}
        fill="#FFE1FA"
        opacity={headOpacity * (0.28 + pulse * 0.06)}
        filter="url(#headBloom)"
      />
      <line x1={CENTER} y1={213} x2={CENTER} y2={245} stroke="#F2DFFF" strokeWidth={3} opacity={0.18} />
      <line x1={CENTER} y1={715} x2={CENTER} y2={747} stroke="#F2DFFF" strokeWidth={3} opacity={0.13} />
    </svg>
  );
};

const PercentageLabel: React.FC<{value: number; pulse: number}> = ({value, pulse}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        color: "#FFF7FF",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 62,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: -2.6,
        lineHeight: 1,
        whiteSpace: "nowrap",
        textShadow: `0 0 4px rgba(255,255,255,0.72), 0 0 ${13 + pulse * 4}px rgba(228,157,255,${0.55 + pulse * 0.09}), 0 0 ${28 + pulse * 6}px rgba(219,38,255,${0.18 + pulse * 0.05})`,
      }}
    >
      {value}%
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = clamp(
    interpolate(frame, [0, FILL_END], [0, 1], {
      easing: Easing.linear,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    0,
    1,
  );
  const isComplete = frame >= FILL_END;
  const percentage = isComplete ? 100 : Math.min(99, Math.floor(progress * 100));
  const pulse = 0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 1.28);
  const dash = ARC_CIRCUMFERENCE * progress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        color: "white",
        overflow: "hidden",
      }}
    >
      <NeonBackdrop pulse={pulse} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RingHalo
          dash={dash}
          progress={progress}
          pulse={pulse}
          isComplete={isComplete}
        />
        <PercentageLabel value={percentage} pulse={pulse} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
