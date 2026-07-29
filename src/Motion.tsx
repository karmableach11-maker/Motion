import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type StepSpec = {
  number: string;
  accent: string;
  accentBright: string;
  x: number;
  start: number;
  orbitDirection: 1 | -1;
};

const STEPS: StepSpec[] = [
  {
    number: '01',
    accent: '#074B60',
    accentBright: '#1282A0',
    x: 400,
    start: 42,
    orbitDirection: 1,
  },
  {
    number: '02',
    accent: '#F01846',
    accentBright: '#FF4C6D',
    x: 960,
    start: 252,
    orbitDirection: -1,
  },
  {
    number: '03',
    accent: '#74BEC9',
    accentBright: '#9DD9E0',
    x: 1520,
    start: 462,
    orbitDirection: 1,
  },
];

const CENTER_Y = 540;
const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};
const softEase = Easing.bezier(0.22, 1, 0.36, 1);
const smoothEase = Easing.bezier(0.65, 0, 0.35, 1);

const reveal = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: softEase,
  });

const polar = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const Background: React.FC<{frame: number; durationInFrames: number}> = ({
  frame,
  durationInFrames,
}) => {
  const cycle = frame / durationInFrames;
  const drift = Math.sin(cycle * Math.PI * 2);
  const specks = [
    {x: 170, y: 206, r: 2.2, phase: 0.1},
    {x: 316, y: 878, r: 1.7, phase: 0.8},
    {x: 596, y: 162, r: 1.6, phase: 1.4},
    {x: 772, y: 900, r: 2.4, phase: 2},
    {x: 1090, y: 152, r: 2.1, phase: 2.5},
    {x: 1272, y: 914, r: 1.8, phase: 3.1},
    {x: 1608, y: 188, r: 2.3, phase: 3.8},
    {x: 1770, y: 842, r: 1.7, phase: 4.4},
  ];

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#F3F6F5',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 12% 24%, rgba(8,75,96,0.055), transparent 31%), radial-gradient(circle at 50% 52%, rgba(240,24,70,0.035), transparent 28%), radial-gradient(circle at 88% 72%, rgba(116,190,201,0.075), transparent 34%), linear-gradient(135deg, #F8FAF9 0%, #F0F4F3 52%, #F7F9F8 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.28,
          backgroundImage:
            'linear-gradient(rgba(8,75,96,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(8,75,96,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse at center, black 0%, rgba(0,0,0,0.45) 46%, transparent 78%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          left: 580 + drift * 24,
          top: 166 - drift * 12,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.92), rgba(255,255,255,0.18) 46%, transparent 70%)',
          filter: 'blur(18px)',
        }}
      />
      {specks.map((speck, index) => {
        const phase = cycle * Math.PI * 2 + speck.phase;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: speck.x + Math.sin(phase) * 12,
              top: speck.y + Math.cos(phase) * 8,
              width: speck.r * 2,
              height: speck.r * 2,
              borderRadius: '50%',
              background: index % 3 === 1 ? '#F01846' : '#74BEC9',
              opacity: 0.16 + (Math.sin(phase * 2) + 1) * 0.08,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 150px rgba(14,52,61,0.045)',
        }}
      />
    </AbsoluteFill>
  );
};

const Connector: React.FC<{
  frame: number;
  x1: number;
  x2: number;
  start: number;
  fromColor: string;
  toColor: string;
  index: number;
}> = ({frame, x1, x2, start, fromColor, toColor, index}) => {
  const progress = reveal(frame, start, 116);
  const portProgress = reveal(frame, start - 18, 34);
  const receiverProgress = reveal(frame, start + 76, 40);
  const lineLength = x2 - x1;
  const energyProgress =
    frame < start + 116
      ? progress
      : (Math.sin((frame - start - 116) * 0.035) + 1) / 2;
  const energyX = x1 + lineLength * energyProgress;
  const gradientId = `connector-gradient-${index}`;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <filter
          id={`connector-glow-${index}`}
          x="-40%"
          y="-500%"
          width="180%"
          height="1100%"
        >
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1={x1}
        y1={CENTER_Y}
        x2={x2}
        y2={CENTER_Y}
        stroke="#C9D5D6"
        strokeWidth={2}
        strokeDasharray="5 9"
        opacity={0.7 * portProgress}
      />
      <line
        x1={x1}
        y1={CENTER_Y}
        x2={x2}
        y2={CENTER_Y}
        stroke={`url(#${gradientId})`}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={lineLength}
        strokeDashoffset={lineLength * (1 - progress)}
        filter={`url(#connector-glow-${index})`}
        opacity={0.82}
      />
      <circle
        cx={x1}
        cy={CENTER_Y}
        r={12 * portProgress}
        fill="#F7FAF9"
        stroke={fromColor}
        strokeWidth={2.5}
      />
      <circle
        cx={x1}
        cy={CENTER_Y}
        r={4.2 * portProgress}
        fill={fromColor}
      />
      <circle
        cx={x2}
        cy={CENTER_Y}
        r={12 * receiverProgress}
        fill="#F7FAF9"
        stroke={toColor}
        strokeWidth={2.5}
      />
      <circle
        cx={x2}
        cy={CENTER_Y}
        r={4.2 * receiverProgress}
        fill={toColor}
      />
      <circle
        cx={energyX}
        cy={CENTER_Y}
        r={5.5 * progress}
        fill="#FFFFFF"
        stroke={toColor}
        strokeWidth={2}
        opacity={0.95 * progress}
        style={{
          filter: `drop-shadow(0 0 7px ${toColor})`,
        }}
      />
    </svg>
  );
};

const StepNode: React.FC<{step: StepSpec; frame: number; fps: number}> = ({
  step,
  frame,
  fps,
}) => {
  const {number, accent, accentBright, x, start, orbitDirection} = step;
  const entrance = spring({
    frame: frame - start,
    fps,
    config: {damping: 16, stiffness: 108, mass: 0.9},
    durationInFrames: 74,
  });
  const ringProgress = reveal(frame, start + 18, 104);
  const detailProgress = reveal(frame, start + 72, 64);
  const typeProgress = reveal(frame, start + 88, 48);
  const settlePulse = interpolate(
    frame,
    [start + 112, start + 132, start + 154],
    [0, 1, 0],
    clamp,
  );
  const continuousPulse =
    frame > start + 154
      ? 0.5 + 0.5 * Math.sin((frame - start) * 0.027)
      : 0;
  const orbitAngle =
    orbitDirection * ((frame - start) * 0.085 + (number === '02' ? 158 : 18));
  const primaryOrbiter = polar(200, 200, 171, orbitAngle);
  const secondaryOrbiter = polar(200, 200, 171, orbitAngle + 152);
  const radiusMain = 132;
  const radiusFine = 162;
  const radiusDots = 174;
  const mainCircumference = Math.PI * 2 * radiusMain;
  const fineCircumference = Math.PI * 2 * radiusFine;
  const nodeOpacity = interpolate(entrance, [0, 0.15, 1], [0, 1, 1], clamp);
  const lift = interpolate(entrance, [0, 1], [20, 0]);
  const scale = interpolate(entrance, [0, 0.62, 1], [0.72, 1.035, 1], clamp);
  const gradientId = `ring-gradient-${number}`;
  const glowId = `ring-glow-${number}`;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 200,
        top: CENTER_Y - 200,
        width: 400,
        height: 400,
        opacity: nodeOpacity,
        transform: `translateY(${lift}px) scale(${scale})`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 50,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 42% 34%, #FFFFFF 0%, #FDFEFE 52%, #F0F5F4 100%)',
          boxShadow: `0 28px 48px rgba(28,55,61,0.12), 0 7px 14px rgba(28,55,61,0.08), inset 0 0 0 1px rgba(255,255,255,0.95), 0 0 ${18 + settlePulse * 18}px ${accent}1F`,
        }}
      />
      <svg
        width={400}
        height={400}
        viewBox="0 0 400 400"
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accentBright} />
            <stop offset="48%" stopColor={accent} />
            <stop offset="100%" stopColor={accentBright} />
          </linearGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={200}
          cy={200}
          r={radiusMain}
          fill="none"
          stroke="#DCE6E5"
          strokeWidth={24}
          opacity={0.9 * entrance}
        />
        <circle
          cx={200}
          cy={200}
          r={radiusMain}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={mainCircumference}
          strokeDashoffset={mainCircumference * (1 - ringProgress)}
          transform="rotate(-90 200 200)"
          filter={`url(#${glowId})`}
        />
        <circle
          cx={200}
          cy={200}
          r={radiusFine}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${fineCircumference * 0.235} ${fineCircumference}`}
          strokeDashoffset={fineCircumference * (1 - detailProgress)}
          transform={`rotate(${22 + orbitAngle * 0.22} 200 200)`}
          opacity={0.84}
        />
        <circle
          cx={200}
          cy={200}
          r={radiusFine}
          fill="none"
          stroke={accentBright}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${fineCircumference * 0.12} ${fineCircumference}`}
          strokeDashoffset={fineCircumference * (1 - detailProgress)}
          transform={`rotate(${220 - orbitAngle * 0.18} 200 200)`}
          opacity={0.66}
        />
        <circle
          cx={200}
          cy={200}
          r={radiusDots}
          fill="none"
          stroke={accent}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray="1 12"
          transform={`rotate(${orbitAngle * 0.3} 200 200)`}
          opacity={0.58 * detailProgress}
        />
        <circle
          cx={primaryOrbiter.x}
          cy={primaryOrbiter.y}
          r={6.5 * detailProgress}
          fill="#FFFFFF"
          stroke={accent}
          strokeWidth={3}
          style={{filter: `drop-shadow(0 0 5px ${accent})`}}
        />
        <circle
          cx={secondaryOrbiter.x}
          cy={secondaryOrbiter.y}
          r={3.2 * detailProgress}
          fill={accentBright}
          opacity={0.82}
        />
        <circle
          cx={200}
          cy={200}
          r={151 + continuousPulse * 2.5}
          fill="none"
          stroke={accentBright}
          strokeWidth={1.5}
          opacity={(0.08 + continuousPulse * 0.09) * detailProgress}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4,
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#273337',
          opacity: typeProgress,
          transform: `translateY(${interpolate(
            typeProgress,
            [0, 1],
            [13, 0],
          )}px) scale(${interpolate(typeProgress, [0, 1], [0.92, 1])})`,
        }}
      >
        <div
          style={{
            fontSize: 68,
            lineHeight: 0.8,
            fontWeight: 800,
            letterSpacing: -3,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {number}
        </div>
        <div
          style={{
            marginTop: 15,
            fontSize: 17,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: 5.5,
            color: accent,
          }}
        >
          STEP
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const globalOpacity = interpolate(
    frame,
    [0, 24, durationInFrames - 72, durationInFrames - 1],
    [0, 1, 1, 0],
    clamp,
  );
  const cameraScale = interpolate(
    frame,
    [0, 150, 610, durationInFrames - 1],
    [1.035, 1.012, 1, 1.018],
    {...clamp, easing: smoothEase},
  );
  const cameraY = interpolate(
    frame,
    [0, 150, 610, durationInFrames - 1],
    [10, 2, 0, -3],
    {...clamp, easing: softEase},
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#F3F6F5'}}>
      <Background frame={frame} durationInFrames={durationInFrames} />
      <AbsoluteFill
        style={{
          opacity: globalOpacity,
          transform: `translateY(${cameraY}px) scale(${cameraScale})`,
          transformOrigin: '50% 50%',
        }}
      >
        <Connector
          frame={frame}
          x1={590}
          x2={770}
          start={170}
          fromColor={STEPS[0].accent}
          toColor={STEPS[1].accent}
          index={0}
        />
        <Connector
          frame={frame}
          x1={1150}
          x2={1330}
          start={380}
          fromColor={STEPS[1].accent}
          toColor={STEPS[2].accent}
          index={1}
        />
        {STEPS.map((step) => (
          <StepNode key={step.number} step={step} frame={frame} fps={fps} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
