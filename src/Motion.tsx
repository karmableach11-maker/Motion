import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const CX = 960;
const CY = 625;
const RADIUS = 540;
const SWEEP_END = 494;
const HIGH_ZONE_KEYS: Array<[number, number]> = [
  [494, 356.25],
  [530, 346.25],
  [586, 358.5],
  [648, 344.25],
  [705, 358.5],
  [746, 342.75],
  [807, 358.25],
  [849, 343],
  [895, 353.25],
  [899, 354.25],
];

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type Point = {
  x: number;
  y: number;
};

const polarPoint = (radius: number, angleDegrees: number): Point => {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: CX + Math.cos(radians) * radius,
    y: CY + Math.sin(radians) * radius,
  };
};

const arcPath = (
  radius: number,
  startDegrees: number,
  endDegrees: number,
) => {
  const start = polarPoint(radius, startDegrees);
  const end = polarPoint(radius, endDegrees);
  const sweep = endDegrees - startDegrees;
  return [
    `M ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x.toFixed(
      3,
    )} ${end.y.toFixed(3)}`,
  ].join(' ');
};

const segmentColors = [
  '#00D8FF',
  '#00B7FF',
  '#148CFF',
  '#5865FF',
  '#B62BFF',
  '#FF175F',
];

const whiteCoreColors = [
  '#F4FFFF',
  '#F3FDFF',
  '#F5FAFF',
  '#F8F7FF',
  '#FFF4FF',
  '#FFF4F7',
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const angularDistance = (a: number, b: number) =>
  Math.abs(((a - b + 180) % 360) - 180);

const getNeedleAngle = (frame: number) => {
  if (frame <= SWEEP_END) {
    return interpolate(frame, [0, SWEEP_END], [183.5, 356.25], clamp);
  }

  for (let index = 0; index < HIGH_ZONE_KEYS.length - 1; index++) {
    const [startFrame, startAngle] = HIGH_ZONE_KEYS[index];
    const [endFrame, endAngle] = HIGH_ZONE_KEYS[index + 1];
    if (frame <= endFrame) {
      const progress = interpolate(
        frame,
        [startFrame, endFrame],
        [0, 1],
        clamp,
      );
      const cosineEase = 0.5 - Math.cos(progress * Math.PI) * 0.5;
      const microJitter =
        Math.sin(frame * 0.31) * 0.18 * Math.sin(progress * Math.PI);
      return (
        startAngle + (endAngle - startAngle) * cosineEase + microJitter
      );
    }
  }

  return HIGH_ZONE_KEYS[HIGH_ZONE_KEYS.length - 1][1];
};

const StaticPremiumBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#03050B',
        backgroundImage: [
          'radial-gradient(ellipse 58% 56% at 50% 54%, rgba(35, 62, 100, 0.30) 0%, rgba(10, 18, 34, 0.16) 40%, rgba(3, 5, 11, 0) 72%)',
          'radial-gradient(circle at 50% 8%, rgba(86, 108, 165, 0.12), rgba(3, 5, 11, 0) 31%)',
          'linear-gradient(180deg, #050914 0%, #03050B 48%, #020309 100%)',
        ].join(','),
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.16,
          backgroundImage: [
            'repeating-linear-gradient(90deg, rgba(123, 177, 224, 0.08) 0px, rgba(123, 177, 224, 0.08) 1px, transparent 1px, transparent 96px)',
            'repeating-linear-gradient(0deg, rgba(123, 177, 224, 0.055) 0px, rgba(123, 177, 224, 0.055) 1px, transparent 1px, transparent 72px)',
          ].join(','),
          WebkitMaskImage:
            'radial-gradient(ellipse 59% 57% at 50% 55%, black 0%, rgba(0,0,0,0.65) 42%, transparent 79%)',
          maskImage:
            'radial-gradient(ellipse 59% 57% at 50% 55%, black 0%, rgba(0,0,0,0.65) 42%, transparent 79%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 88% 86% at 50% 52%, transparent 37%, rgba(0, 0, 0, 0.36) 72%, rgba(0, 0, 0, 0.88) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const GaugeStructure: React.FC<{angle: number; frame: number}> = ({
  angle,
  frame,
}) => {
  const sweepProgress = clamp01((angle - 183.5) / (356.25 - 183.5));
  const highZonePulse = angle > 330 ? 0.5 + Math.sin(frame * 0.16) * 0.5 : 0;

  const innerTicks = Array.from({length: 37}, (_, index) => {
    const ratio = index / 36;
    const tickAngle = 181 + ratio * 178;
    const isMajor = index % 6 === 0;
    const inner = polarPoint(isMajor ? 452 : 461, tickAngle);
    const outer = polarPoint(isMajor ? 486 : 480, tickAngle);
    const peak = ratio > 0.84;
    const upper = ratio > 0.66;
    const passed = clamp01((sweepProgress - ratio + 0.055) / 0.11);
    const proximity =
      1 - clamp01(angularDistance(tickAngle, angle) / 18);
    const tickOpacity =
      (isMajor ? 0.32 : 0.12) +
      passed * (isMajor ? 0.5 : 0.26) +
      proximity * 0.28;

    return (
      <React.Fragment key={index}>
        <line
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={peak ? '#FF3E72' : upper ? '#C65BFF' : '#24D9FF'}
          strokeWidth={isMajor ? 13 : 7}
          strokeLinecap="round"
          opacity={tickOpacity * 0.11}
        />
        <line
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={peak ? '#FF5B83' : upper ? '#D183FF' : '#63E8FF'}
          strokeWidth={isMajor ? 5 : 2.4}
          strokeLinecap="round"
          opacity={tickOpacity}
        />
      </React.Fragment>
    );
  });

  const tracer = polarPoint(RADIUS, angle);
  const tracerColor =
    angle > 330 ? '#FF4C79' : angle > 285 ? '#CB55FF' : '#5BEAFF';

  return (
    <g>
      <path
        d={arcPath(RADIUS, 180, 360)}
        fill="none"
        stroke="#081526"
        strokeWidth={48}
        strokeLinecap="round"
        opacity={0.9}
      />

      <g>
        {segmentColors.map((color, index) => {
          const start = 180 + index * 30 + 1.8;
          const end = start + 25.4;
          const center = (start + end) / 2;
          const proximity = 1 - clamp01(angularDistance(angle, center) / 42);
          const passed = clamp01((angle - start + 8) / 25);
          const active = 0.74 + passed * 0.14 + proximity * 0.12;
          const peakPulse = index === 5 ? highZonePulse * 0.1 : 0;
          const energy = Math.min(1, active + peakPulse);

          return (
            <React.Fragment key={`segment-${index}`}>
              <path
                d={arcPath(RADIUS, start, end)}
                fill="none"
                stroke={color}
                strokeWidth={104}
                strokeLinecap="round"
                opacity={0.07 + energy * 0.07}
              />
              <path
                d={arcPath(RADIUS, start, end)}
                fill="none"
                stroke={color}
                strokeWidth={70}
                strokeLinecap="round"
                opacity={0.12 + energy * 0.16}
              />
              <path
                d={arcPath(RADIUS, start, end)}
                fill="none"
                stroke={color}
                strokeWidth={52}
                strokeLinecap="round"
                opacity={0.22 + energy * 0.24}
              />
              <path
                d={arcPath(RADIUS, start, end)}
                fill="none"
                stroke={color}
                strokeWidth={34}
                strokeLinecap="round"
                opacity={0.9 + energy * 0.1}
              />
              <path
                d={arcPath(RADIUS, start + 0.18, end - 0.18)}
                fill="none"
                stroke={whiteCoreColors[index]}
                strokeWidth={22}
                strokeLinecap="round"
                opacity={0.9 + energy * 0.1}
              />
              <path
                d={arcPath(RADIUS, start + 0.45, end - 0.45)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={3.2}
                strokeLinecap="round"
                opacity={0.92}
              />
            </React.Fragment>
          );
        })}
      </g>

      <g>
        <circle
          cx={tracer.x}
          cy={tracer.y}
          r={30}
          fill={tracerColor}
          opacity={0.07}
        />
        <circle
          cx={tracer.x}
          cy={tracer.y}
          r={17}
          fill={tracerColor}
          opacity={0.16}
        />
        <circle cx={tracer.x} cy={tracer.y} r={7.5} fill="#FFFFFF" opacity={0.96} />
      </g>

      <path
        d={arcPath(500, 180, 360)}
        fill="none"
        stroke="url(#innerArcGradient)"
        strokeWidth={2}
        opacity={0.5 + sweepProgress * 0.22}
      />

      <g>{innerTicks}</g>

      <circle
        cx={CX}
        cy={CY}
        r={440}
        fill="none"
        stroke="#3BCEED"
        strokeWidth={1.4}
        strokeDasharray="2 20"
        opacity={0.12 + sweepProgress * 0.06}
      />
    </g>
  );
};

const BoostLabel: React.FC<{frame: number; angle: number}> = ({frame, angle}) => {
  const power = clamp01((angle - 183.5) / (356.25 - 183.5));
  const pulse =
    0.5 + Math.sin(frame * (angle > 330 ? 0.17 : 0.085)) * 0.5;
  const glow = 0.76 + power * 0.16 + pulse * 0.08;
  const scale = 1 + (angle > 330 ? pulse * 0.008 : 0);

  return (
    <g
      transform={`translate(${CX} 842) scale(${scale} ${
        1.2 * scale
      }) translate(${-CX} -842)`}
    >
      <text
        x={CX}
        y={850}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#5CEBFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={84}
        fontWeight={800}
        letterSpacing={18}
        opacity={0.13 * glow}
        stroke="#39DFFF"
        strokeWidth={18}
      >
        BOOST
      </text>
      <text
        x={CX}
        y={850}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#7AF2FF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={84}
        fontWeight={800}
        letterSpacing={18}
        opacity={0.36 * glow}
        stroke="#68E6F6"
        strokeWidth={9}
      >
        BOOST
      </text>
      <text
        x={CX}
        y={850}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="url(#labelGradient)"
        stroke="#FFFFFF"
        strokeWidth={1.2}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={84}
        fontWeight={800}
        letterSpacing={18}
        opacity={0.96 + pulse * 0.04}
      >
        BOOST
      </text>
    </g>
  );
};

const NeedleShape: React.FC<{
  angle: number;
  opacity?: number;
  trail?: boolean;
}> = ({angle, opacity = 1, trail = false}) => (
  <g transform={`rotate(${angle} ${CX} ${CY})`} opacity={opacity}>
    <line
      x1={CX + 22}
      y1={CY}
      x2={CX + 502}
      y2={CY}
      stroke={trail ? '#37DFFF' : '#21DFFF'}
      strokeWidth={trail ? 24 : 50}
      strokeLinecap="round"
      opacity={trail ? 0.14 : 0.075}
    />
    {!trail && (
      <line
        x1={CX + 28}
        y1={CY}
        x2={CX + 502}
        y2={CY}
        stroke="#50E8FF"
        strokeWidth={27}
        strokeLinecap="round"
        opacity={0.2}
      />
    )}
    <path
      d={`M ${CX + 4} ${CY - 12} L ${CX + 505} ${CY - 2.7} L ${
        CX + 505
      } ${CY + 2.7} L ${CX + 4} ${CY + 12} Z`}
      fill={trail ? '#41DFFF' : 'url(#needleGradient)'}
      opacity={trail ? 0.24 : 1}
    />
    {!trail && (
      <>
        <line
          x1={CX + 40}
          y1={CY - 2.2}
          x2={CX + 493}
          y2={CY - 2.2}
          stroke="#FFFFFF"
          strokeWidth={4.2}
          strokeLinecap="round"
          opacity={1}
        />
        <circle cx={CX + 505} cy={CY} r={17} fill="#59E8FF" opacity={0.12} />
        <circle cx={CX + 505} cy={CY} r={6.5} fill="#FFFFFF" opacity={1} />
      </>
    )}
  </g>
);

const NeedleAssembly: React.FC<{
  angle: number;
  trailAngles: number[];
  frame: number;
}> = ({angle, trailAngles, frame}) => {
  const rippleProgress = (frame % 72) / 72;
  const rippleOpacity = (1 - rippleProgress) * 0.22;

  return (
    <g>
      {trailAngles.map((trailAngle, index) => (
        <NeedleShape
          key={`${index}-${trailAngle.toFixed(3)}`}
          angle={trailAngle}
          opacity={(index + 1) * 0.18}
          trail
        />
      ))}
      <NeedleShape angle={angle} />

      <circle
        cx={CX}
        cy={CY}
        r={50 + rippleProgress * 56}
        fill="none"
        stroke="#42E8FF"
        strokeWidth={2.2}
        opacity={rippleOpacity}
      />
      <circle cx={CX} cy={CY} r={52} fill="#43DBF3" opacity={0.16} />
      <circle
        cx={CX}
        cy={CY}
        r={37}
        fill="url(#hubOuter)"
        stroke="#6CEBFA"
        strokeWidth={3.2}
      />
      <circle
        cx={CX}
        cy={CY}
        r={26}
        fill="url(#hubInner)"
        stroke="#DAFBFF"
        strokeWidth={2.1}
        opacity={0.98}
      />
      <circle cx={CX - 7} cy={CY - 8} r={5.5} fill="#FFFFFF" opacity={0.94} />
      <path
        d={arcPath(44, 208, 316)}
        fill="none"
        stroke="#ACF6FF"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.72}
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = getNeedleAngle(frame);
  const trailAngles = [7, 4, 2].map((offset) =>
    getNeedleAngle(Math.max(0, frame - offset)),
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#03050B', overflow: 'hidden'}}>
      <StaticPremiumBackground />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="innerArcGradient" x1="420" y1="625" x2="1500" y2="625">
            <stop offset="0" stopColor="#57E1F2" />
            <stop offset="0.55" stopColor="#728FFF" />
            <stop offset="0.82" stopColor="#BA7DFF" />
            <stop offset="1" stopColor="#FF315F" />
          </linearGradient>
          <linearGradient id="needleGradient" x1="960" y1="625" x2="1465" y2="625">
            <stop offset="0" stopColor="#E6FDFF" />
            <stop offset="0.62" stopColor="#79EDFA" />
            <stop offset="1" stopColor="#FFF4F8" />
          </linearGradient>
          <linearGradient id="labelGradient" x1="760" y1="810" x2="1160" y2="890">
            <stop offset="0" stopColor="#F8FEFF" />
            <stop offset="0.52" stopColor="#C6F8FF" />
            <stop offset="1" stopColor="#86DBFF" />
          </linearGradient>
          <radialGradient id="hubOuter" cx="36%" cy="30%">
            <stop offset="0" stopColor="#21445C" />
            <stop offset="0.55" stopColor="#0D2131" />
            <stop offset="1" stopColor="#050B12" />
          </radialGradient>
          <radialGradient id="hubInner" cx="35%" cy="28%">
            <stop offset="0" stopColor="#F8FFFF" />
            <stop offset="0.22" stopColor="#9AEFFC" />
            <stop offset="0.72" stopColor="#2B829A" />
            <stop offset="1" stopColor="#0B2734" />
          </radialGradient>
        </defs>

        <g>
          <GaugeStructure angle={angle} frame={frame} />
          <BoostLabel angle={angle} frame={frame} />
        </g>

        <NeedleAssembly angle={angle} trailAngles={trailAngles} frame={frame} />
      </svg>
    </AbsoluteFill>
  );
};
