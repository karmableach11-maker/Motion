import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type WorkflowNodeSpec = {
  index: string;
  label: string;
  caption: string;
  accent: string;
  accentSoft: string;
  x: number;
  y: number;
  start: number;
  metrics: string[];
  icon: 'input' | 'process' | 'output';
};

const WIDTH = 1920;
const HEIGHT = 1080;
const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const NODES: WorkflowNodeSpec[] = [
  {
    index: '01',
    label: 'INPUT',
    caption: 'DATA INGEST',
    accent: '#33D6FF',
    accentSoft: '#0F85B4',
    x: 430,
    y: 520,
    start: 42,
    metrics: ['TEXT', 'IMAGE', 'SIGNAL'],
    icon: 'input',
  },
  {
    index: '02',
    label: 'PROCESS',
    caption: 'AI ENGINE',
    accent: '#9F7CFF',
    accentSoft: '#6145D6',
    x: 960,
    y: 520,
    start: 222,
    metrics: ['LEARN', 'REASON', 'REFINE'],
    icon: 'process',
  },
  {
    index: '03',
    label: 'OUTPUT',
    caption: 'SMART RESULT',
    accent: '#55F2BD',
    accentSoft: '#18A979',
    x: 1490,
    y: 520,
    start: 402,
    metrics: ['INSIGHT', 'ACTION', 'VALUE'],
    icon: 'output',
  },
];

const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing = easeOut,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing,
  });

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const cubicPoint = (
  t: number,
  p0: {x: number; y: number},
  p1: {x: number; y: number},
  p2: {x: number; y: number},
  p3: {x: number; y: number},
) => {
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * p0.x +
      3 * inverse ** 2 * t * p1.x +
      3 * inverse * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      inverse ** 3 * p0.y +
      3 * inverse ** 2 * t * p1.y +
      3 * inverse * t ** 2 * p2.y +
      t ** 3 * p3.y,
  };
};

const tinyStars = Array.from({length: 42}, (_, index) => ({
  x: 70 + ((index * 167) % 1780),
  y: 44 + ((index * 113) % 944),
  radius: 0.8 + (index % 4) * 0.45,
  phase: (index * 0.61) % (Math.PI * 2),
}));

const dataRain = Array.from({length: 22}, (_, index) => ({
  x: 92 + ((index * 257) % 1740),
  y: 40 + ((index * 149) % 960),
  height: 18 + (index % 5) * 7,
  delay: (index * 31) % 180,
}));

const Background: React.FC<{frame: number}> = ({frame}) => {
  const ambient = Math.sin(frame / 95);
  const gridTravel = (frame * 0.55) % 80;
  const finalEnergy = reveal(frame, 520, 130, easeInOut);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#050912'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 14% 48%, rgba(34,181,232,0.17), transparent 31%), radial-gradient(circle at 51% 43%, rgba(117,78,232,0.17), transparent 34%), radial-gradient(circle at 86% 51%, rgba(44,210,157,0.13), transparent 32%), linear-gradient(145deg, #07111D 0%, #050913 48%, #07101B 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 170 + ambient * 25,
          top: -490,
          width: 1550,
          height: 900,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(89,144,255,0.08), rgba(22,50,92,0.025) 46%, transparent 72%)',
          filter: 'blur(40px)',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -460 + gridTravel,
          height: 920,
          transform: 'perspective(820px) rotateX(65deg)',
          transformOrigin: 'center bottom',
          backgroundImage:
            'linear-gradient(rgba(78,171,216,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(78,171,216,0.08) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage:
            'linear-gradient(to bottom, transparent 2%, rgba(0,0,0,0.88) 46%, black 100%)',
          opacity: 0.54,
        }}
      />
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <radialGradient id="ambient-vignette">
            <stop offset="52%" stopColor="#06101C" stopOpacity="0" />
            <stop offset="100%" stopColor="#01040A" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        {tinyStars.map((star, index) => {
          const twinkle =
            0.15 +
            ((Math.sin(frame / 29 + star.phase) + 1) / 2) * 0.42 +
            finalEnergy * 0.09;
          return (
            <circle
              key={index}
              cx={star.x + Math.sin(frame / 170 + star.phase) * 5}
              cy={star.y + Math.cos(frame / 155 + star.phase) * 4}
              r={star.radius}
              fill={index % 3 === 0 ? '#8F77FF' : '#6FE3FF'}
              opacity={twinkle}
            />
          );
        })}
        <rect width={WIDTH} height={HEIGHT} fill="url(#ambient-vignette)" />
      </svg>
      {dataRain.map((particle, index) => {
        const local = ((frame - particle.delay + 900) % 180) / 180;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y + local * 180,
              width: 1,
              height: particle.height,
              borderRadius: 2,
              background:
                'linear-gradient(to bottom, transparent, rgba(83,201,255,0.34), transparent)',
              opacity: Math.sin(local * Math.PI) * 0.35,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '4px 100%',
          opacity: 0.18,
        }}
      />
    </AbsoluteFill>
  );
};

const InputIcon: React.FC<{accent: string; progress: number; frame: number}> = ({
  accent,
  progress,
  frame,
}) => {
  const scan = ((frame - 80 + 140) % 140) / 140;
  return (
    <svg width="116" height="116" viewBox="0 0 116 116">
      <g
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={progress}
      >
        <ellipse cx="58" cy="31" rx="30" ry="12" />
        <path d="M28 31v21c0 6.6 13.4 12 30 12s30-5.4 30-12V31" />
        <path d="M28 52v21c0 6.6 13.4 12 30 12s30-5.4 30-12V52" />
        <path d="M28 73v12c0 6.6 13.4 12 30 12s30-5.4 30-12V73" />
      </g>
      <ellipse
        cx="58"
        cy={31 + scan * 52}
        rx={29 - scan * 3}
        ry="10"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        opacity={progress * Math.sin(scan * Math.PI) * 0.62}
      />
    </svg>
  );
};

const ProcessIcon: React.FC<{
  accent: string;
  progress: number;
  frame: number;
}> = ({accent, progress, frame}) => {
  const pulse = 0.94 + Math.sin(frame / 12) * 0.06;
  const nodes = [
    {x: 58, y: 25},
    {x: 31, y: 43},
    {x: 85, y: 43},
    {x: 35, y: 76},
    {x: 81, y: 76},
    {x: 58, y: 92},
  ];
  return (
    <svg width="116" height="116" viewBox="0 0 116 116">
      <g
        fill="none"
        stroke={accent}
        strokeWidth="2.2"
        opacity={progress * 0.78}
      >
        {nodes.map((node, index) => (
          <line
            key={index}
            x1="58"
            y1="58"
            x2={node.x}
            y2={node.y}
            strokeDasharray="3 4"
          />
        ))}
        <path d="M58 17 94 38v40L58 99 22 78V38Z" />
      </g>
      {nodes.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={4 + ((index + frame / 20) % 3) * 0.45}
          fill="#09111F"
          stroke={accent}
          strokeWidth="2"
          opacity={progress}
        />
      ))}
      <g transform={`translate(58 58) scale(${pulse}) translate(-58 -58)`}>
        <circle
          cx="58"
          cy="58"
          r="18"
          fill={accent}
          opacity={0.15 * progress}
        />
        <circle
          cx="58"
          cy="58"
          r="11"
          fill={accent}
          opacity={progress}
          style={{filter: `drop-shadow(0 0 9px ${accent})`}}
        />
        <circle cx="54" cy="54" r="3" fill="#FFFFFF" opacity={progress * 0.9} />
      </g>
    </svg>
  );
};

const OutputIcon: React.FC<{accent: string; progress: number; frame: number}> = ({
  accent,
  progress,
  frame,
}) => {
  const sweep = reveal(frame, 438, 78);
  return (
    <svg width="116" height="116" viewBox="0 0 116 116">
      <g
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={progress}
      >
        <path d="M24 88V34c0-5.5 4.5-10 10-10h48c5.5 0 10 4.5 10 10v54" />
        <path d="M18 91h80" />
        <path
          d="m36 72 14-14 11 8 21-26"
          strokeDasharray="78"
          strokeDashoffset={78 * (1 - sweep)}
        />
        <path
          d="m72 40 10 0 0 10"
          opacity={sweep}
          transform={`translate(${(1 - sweep) * -8} ${(1 - sweep) * 8})`}
        />
      </g>
      {[41, 58, 82].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={[67, 63, 40][index]}
          r="4"
          fill="#07101B"
          stroke={accent}
          strokeWidth="2"
          opacity={progress * sweep}
        />
      ))}
    </svg>
  );
};

const NodeIcon: React.FC<{
  type: WorkflowNodeSpec['icon'];
  accent: string;
  progress: number;
  frame: number;
}> = ({type, accent, progress, frame}) => {
  if (type === 'input') {
    return <InputIcon accent={accent} progress={progress} frame={frame} />;
  }
  if (type === 'process') {
    return <ProcessIcon accent={accent} progress={progress} frame={frame} />;
  }
  return <OutputIcon accent={accent} progress={progress} frame={frame} />;
};

const Node: React.FC<{
  spec: WorkflowNodeSpec;
  frame: number;
  isComplete: boolean;
}> = ({spec, frame, isComplete}) => {
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame: frame - spec.start,
    fps,
    config: {damping: 16, mass: 0.72, stiffness: 110},
    durationInFrames: 72,
  });
  const ringProgress = reveal(frame, spec.start + 10, 74);
  const content = reveal(frame, spec.start + 32, 50);
  const label = reveal(frame, spec.start + 54, 42);
  const metrics = reveal(frame, spec.start + 72, 48);
  const activePulse =
    frame >= spec.start + 96
      ? 0.5 + Math.sin((frame - spec.start) / 16) * 0.5
      : 0;
  const systemComplete = reveal(frame, 535, 90, easeInOut);
  const hover = Math.sin(frame / 34 + Number(spec.index) * 1.7) * 5;
  const nodeScale = 0.74 + entrance * 0.26;
  const coreRotation = (frame - spec.start) * 0.12;
  const circumference = 2 * Math.PI * 154;

  return (
    <div
      style={{
        position: 'absolute',
        left: spec.x - 205,
        top: spec.y - 235 + hover,
        width: 410,
        height: 510,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 54}px) scale(${nodeScale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 22,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${spec.accent}20 0%, ${spec.accent}08 47%, transparent 70%)`,
          filter: 'blur(18px)',
          opacity: 0.78 + activePulse * 0.18 + systemComplete * 0.16,
          transform: `scale(${1 + activePulse * 0.035})`,
        }}
      />

      <svg
        width="410"
        height="390"
        viewBox="0 0 410 390"
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id={`ring-${spec.index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.94" />
            <stop offset="22%" stopColor={spec.accent} />
            <stop offset="100%" stopColor={spec.accentSoft} />
          </linearGradient>
          <filter
            id={`glow-${spec.index}`}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="205"
          cy="180"
          r="171"
          fill="none"
          stroke={spec.accent}
          strokeWidth="1"
          strokeDasharray="2 12"
          opacity={ringProgress * 0.38}
          transform={`rotate(${coreRotation * -0.32} 205 180)`}
        />
        <circle
          cx="205"
          cy="180"
          r="154"
          fill="rgba(9,18,32,0.84)"
          stroke="rgba(174,221,255,0.12)"
          strokeWidth="18"
        />
        <circle
          cx="205"
          cy="180"
          r="154"
          fill="none"
          stroke={`url(#ring-${spec.index})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ringProgress)}
          transform="rotate(-90 205 180)"
          filter={`url(#glow-${spec.index})`}
        />
        <circle
          cx="205"
          cy="180"
          r="130"
          fill="none"
          stroke={spec.accent}
          strokeWidth="1.4"
          strokeDasharray="76 28 12 34"
          opacity={ringProgress * 0.5}
          transform={`rotate(${coreRotation} 205 180)`}
        />
        <circle
          cx="205"
          cy="180"
          r="117"
          fill="rgba(6,13,24,0.76)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        {Array.from({length: 20}, (_, index) => {
          const angle = (index / 20) * Math.PI * 2 - Math.PI / 2;
          const radius = 171;
          const x = 205 + Math.cos(angle) * radius;
          const y = 180 + Math.sin(angle) * radius;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index % 5 === 0 ? 3.5 : 1.8}
              fill={index % 5 === 0 ? '#FFFFFF' : spec.accent}
              opacity={
                ringProgress *
                (index % 5 === 0 ? 0.78 : 0.42) *
                (0.82 + activePulse * 0.18)
              }
            />
          );
        })}
        <path
          d="M126 286 C152 318 258 318 284 286"
          fill="none"
          stroke={spec.accent}
          strokeWidth="2"
          strokeDasharray="6 8"
          opacity={ringProgress * 0.38}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 132,
          top: 107,
          width: 146,
          height: 146,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 36% 28%, ${spec.accent}18, rgba(6,13,24,0.2) 54%, rgba(6,13,24,0.86))`,
          boxShadow: `inset 0 0 28px ${spec.accent}10, 0 0 42px ${spec.accent}0C`,
          opacity: content,
          transform: `scale(${0.78 + content * 0.22})`,
        }}
      >
        <NodeIcon
          type={spec.icon}
          accent={spec.accent}
          progress={content}
          frame={frame}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 22,
          top: 38,
          padding: '8px 11px 7px',
          borderRadius: 8,
          border: `1px solid ${spec.accent}45`,
          color: spec.accent,
          background: 'rgba(4,10,19,0.82)',
          boxShadow: `0 0 18px ${spec.accent}12`,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
          opacity: label,
          transform: `translateX(${(1 - label) * -16}px)`,
        }}
      >
        {spec.index}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 55,
          right: 55,
          top: 345,
          textAlign: 'center',
          opacity: label,
          transform: `translateY(${(1 - label) * 18}px)`,
        }}
      >
        <div
          style={{
            color: '#F5FAFF',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 34,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: 8,
            textShadow: `0 0 24px ${spec.accent}2B`,
          }}
        >
          {spec.label}
        </div>
        <div
          style={{
            marginTop: 12,
            color: spec.accent,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 4.4,
            opacity: 0.82,
          }}
        >
          {spec.caption}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 430,
          height: 44,
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          opacity: metrics,
          transform: `translateY(${(1 - metrics) * 12}px)`,
        }}
      >
        {spec.metrics.map((metric, index) => {
          const itemProgress = reveal(
            frame,
            spec.start + 72 + index * 8,
            26,
          );
          return (
            <div
              key={metric}
              style={{
                height: 28,
                padding: '0 11px',
                borderRadius: 14,
                border: '1px solid rgba(177,219,245,0.12)',
                background: 'rgba(12,24,40,0.72)',
                color: index === 1 ? spec.accent : 'rgba(215,235,249,0.68)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.5,
                opacity: itemProgress,
                transform: `scale(${0.88 + itemProgress * 0.12})`,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: spec.accent,
                  boxShadow: `0 0 7px ${spec.accent}`,
                }}
              />
              {metric}
            </div>
          );
        })}
      </div>

      {isComplete ? (
        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 500,
            width: 110,
            height: 2,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${spec.accent}, transparent)`,
            opacity: systemComplete * (0.6 + activePulse * 0.3),
            boxShadow: `0 0 12px ${spec.accent}`,
          }}
        />
      ) : null}
    </div>
  );
};

type ConnectorSpec = {
  start: number;
  end: number;
  colorA: string;
  colorB: string;
  yOffset: number;
  index: number;
};

const Connector: React.FC<ConnectorSpec & {frame: number}> = ({
  start,
  end,
  colorA,
  colorB,
  yOffset,
  index,
  frame,
}) => {
  const drawStart = index === 0 ? 154 : 334;
  const drawDuration = index === 0 ? 118 : 104;
  const progress = reveal(frame, drawStart, drawDuration, easeInOut);
  const p0 = {x: start, y: 520};
  const p1 = {x: start + 105, y: 520 + yOffset};
  const p2 = {x: end - 105, y: 520 - yOffset};
  const p3 = {x: end, y: 520};
  const path = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  const pathLength = 430;
  const finalLoop = reveal(frame, 532, 70);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <linearGradient
          id={`connector-gradient-${index}`}
          x1={start}
          y1="0"
          x2={end}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={colorA} />
          <stop offset="50%" stopColor="#F5FCFF" />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
        <filter
          id={`connector-glow-${index}`}
          x="-30%"
          y="-200%"
          width="160%"
          height="500%"
        >
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="rgba(124,179,215,0.13)"
        strokeWidth="16"
        strokeLinecap="round"
        opacity={progress * 0.65}
      />
      <path
        d={path}
        fill="none"
        stroke="rgba(145,199,229,0.22)"
        strokeWidth="1.4"
        strokeDasharray="4 10"
        opacity={progress}
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#connector-gradient-${index})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
        filter={`url(#connector-glow-${index})`}
        opacity={0.88}
      />

      {Array.from({length: 13}, (_, particleIndex) => {
        const initial = particleIndex / 13;
        const travelSpeed = frame < 530 ? 0.0062 : 0.0092;
        const travel =
          ((frame - drawStart) * travelSpeed + initial + 8) % 1;
        const visible =
          progress *
          (0.36 +
            0.64 *
              Math.sin(
                Math.max(0.001, Math.min(0.999, travel)) * Math.PI,
              ));
        const point = cubicPoint(travel, p0, p1, p2, p3);
        const size = particleIndex % 4 === 0 ? 4.8 : 2.5;
        return (
          <g key={particleIndex}>
            <circle
              cx={point.x}
              cy={point.y}
              r={size * (0.88 + finalLoop * 0.18)}
              fill={
                particleIndex % 3 === 0
                  ? '#FFFFFF'
                  : particleIndex % 2 === 0
                    ? colorA
                    : colorB
              }
              opacity={visible}
              style={{
                filter: `drop-shadow(0 0 ${size + 3}px ${
                  particleIndex % 2 === 0 ? colorA : colorB
                })`,
              }}
            />
            {particleIndex % 4 === 0 ? (
              <circle
                cx={point.x}
                cy={point.y}
                r={size + 6}
                fill="none"
                stroke={colorB}
                strokeWidth="1"
                opacity={visible * 0.24}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

const IncomingStream: React.FC<{frame: number}> = ({frame}) => {
  const progress = reveal(frame, 24, 82, easeInOut);
  const p0 = {x: -80, y: 520};
  const p1 = {x: 70, y: 470};
  const p2 = {x: 145, y: 566};
  const p3 = {x: 258, y: 520};
  const path = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: 'absolute', inset: 0}}
    >
      <path
        d={path}
        fill="none"
        stroke="#2FD3FF"
        strokeWidth="2"
        strokeDasharray="330"
        strokeDashoffset={330 * (1 - progress)}
        opacity={progress * 0.5}
      />
      {Array.from({length: 16}, (_, index) => {
        const travel = ((frame - 20) * 0.007 + index / 16 + 10) % 1;
        const point = cubicPoint(travel, p0, p1, p2, p3);
        return (
          <rect
            key={index}
            x={point.x - (index % 3 === 0 ? 3 : 1.8)}
            y={point.y - (index % 3 === 0 ? 3 : 1.8)}
            width={index % 3 === 0 ? 6 : 3.6}
            height={index % 3 === 0 ? 6 : 3.6}
            rx="1"
            fill={index % 4 === 0 ? '#FFFFFF' : '#3CDBFF'}
            opacity={progress * Math.sin(travel * Math.PI) * 0.86}
          />
        );
      })}
    </svg>
  );
};

const SystemStatus: React.FC<{frame: number}> = ({frame}) => {
  const progress = reveal(frame, 562, 74);
  const pulse = 0.5 + Math.sin(frame / 13) * 0.5;
  return (
    <div
      style={{
        position: 'absolute',
        left: 760,
        top: 892,
        width: 400,
        height: 46,
        borderRadius: 23,
        border: '1px solid rgba(108,230,194,0.22)',
        background: 'rgba(7,17,28,0.78)',
        boxShadow:
          'inset 0 0 20px rgba(53,235,181,0.04), 0 14px 42px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 13,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 16}px) scale(${0.94 + progress * 0.06})`,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#55F2BD',
          boxShadow: `0 0 ${8 + pulse * 8}px #55F2BD`,
        }}
      />
      <span
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: '#CDE9E4',
          letterSpacing: 3.4,
        }}
      >
        WORKFLOW ACTIVE
      </span>
      <span
        style={{
          width: 54,
          height: 3,
          overflow: 'hidden',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.08)',
        }}
      >
        <span
          style={{
            display: 'block',
            width: `${75 + pulse * 25}%`,
            height: '100%',
            borderRadius: 3,
            background: 'linear-gradient(90deg, #55F2BD, #33D6FF)',
            boxShadow: '0 0 8px #55F2BD',
          }}
        />
      </span>
    </div>
  );
};

const HUDCorners: React.FC<{frame: number}> = ({frame}) => {
  const progress = reveal(frame, 8, 70);
  const retreat = reveal(frame, 540, 130, easeInOut);
  const color = 'rgba(118,197,235,0.28)';
  const cornerStyle: React.CSSProperties = {
    position: 'absolute',
    width: 60,
    height: 60,
    opacity: progress * (0.76 + retreat * 0.24),
  };
  return (
    <>
      <div
        style={{
          ...cornerStyle,
          left: 90,
          top: 76,
          borderLeft: `1px solid ${color}`,
          borderTop: `1px solid ${color}`,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          right: 90,
          top: 76,
          borderRight: `1px solid ${color}`,
          borderTop: `1px solid ${color}`,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          left: 90,
          bottom: 76,
          borderLeft: `1px solid ${color}`,
          borderBottom: `1px solid ${color}`,
        }}
      />
      <div
        style={{
          ...cornerStyle,
          right: 90,
          bottom: 76,
          borderRight: `1px solid ${color}`,
          borderBottom: `1px solid ${color}`,
        }}
      />
    </>
  );
};

const cameraAt = (frame: number) => {
  const toProcess = reveal(frame, 142, 142, easeInOut);
  const toOutput = reveal(frame, 304, 142, easeInOut);
  const pullOut = reveal(frame, 516, 156, easeInOut);

  const focusX1 = mix(190, 25, toProcess);
  const focusX2 = mix(focusX1, -165, toOutput);
  const x = mix(focusX2, 0, pullOut);

  const focusScale1 = mix(1.03, 1.075, toProcess);
  const focusScale2 = mix(focusScale1, 1.105, toOutput);
  const scale = mix(focusScale2, 0.91, pullOut);

  const focusY = mix(18, 4, toOutput);
  const y = mix(focusY, -2, pullOut);

  return {x, y, scale};
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const camera = cameraAt(frame);
  const opening = reveal(frame, 0, 34, easeInOut);
  const closing = interpolate(
    frame,
    [durationInFrames - 42, durationInFrames - 1],
    [1, 0],
    {...clamp, easing: easeInOut},
  );
  const sceneOpacity = opening * closing;
  const completion = reveal(frame, 530, 90, easeInOut);
  const completionFlash = interpolate(
    frame,
    [532, 552, 586],
    [0, 0.8, 0],
    {...clamp, easing: easeOut},
  );

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#050912',
        opacity: sceneOpacity,
      }}
    >
      <Background frame={frame} />
      <HUDCorners frame={frame} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
          transformOrigin: '960px 520px',
          willChange: 'transform',
        }}
      >
        <IncomingStream frame={frame} />
        <Connector
          frame={frame}
          start={602}
          end={788}
          colorA={NODES[0].accent}
          colorB={NODES[1].accent}
          yOffset={-34}
          index={0}
        />
        <Connector
          frame={frame}
          start={1132}
          end={1318}
          colorA={NODES[1].accent}
          colorB={NODES[2].accent}
          yOffset={34}
          index={1}
        />

        {NODES.map((spec) => (
          <Node
            key={spec.index}
            spec={spec}
            frame={frame}
            isComplete={frame >= 530}
          />
        ))}

        <SystemStatus frame={frame} />
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 49%, rgba(184,246,255,0.13), transparent 29%)',
          opacity: completionFlash,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: `inset 0 0 ${130 + completion * 30}px rgba(0,0,0,0.56)`,
        }}
      />
    </AbsoluteFill>
  );
};
