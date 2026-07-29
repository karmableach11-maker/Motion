import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Step = {
  number: string;
  label: string;
  title: string;
  description: string;
  metric: string;
  metricRatio: number;
  metricLabel: string;
  accent: string;
  accentSoft: string;
  x: number;
  start: number;
  icon: 'compass' | 'layers' | 'growth';
};

const STEPS: Step[] = [
  {
    number: '01',
    label: 'DISCOVER',
    title: 'Set the vision',
    description: 'Turn market signals into a clear, focused direction.',
    metric: '100%',
    metricRatio: 1,
    metricLabel: 'CLARITY',
    accent: '#55E6FF',
    accentSoft: 'rgba(85, 230, 255, 0.18)',
    x: 160,
    start: 92,
    icon: 'compass',
  },
  {
    number: '02',
    label: 'DELIVER',
    title: 'Build the system',
    description: 'Connect people, process, and technology at scale.',
    metric: '3.2%',
    metricRatio: 0.032,
    metricLabel: 'VELOCITY',
    accent: '#A785FF',
    accentSoft: 'rgba(167, 133, 255, 0.18)',
    x: 740,
    start: 284,
    icon: 'layers',
  },
  {
    number: '03',
    label: 'GROW',
    title: 'Create impact',
    description: 'Measure momentum and compound every advantage.',
    metric: '+48%',
    metricRatio: 0.48,
    metricLabel: 'IMPACT',
    accent: '#FFB26B',
    accentSoft: 'rgba(255, 178, 107, 0.18)',
    x: 1320,
    start: 476,
    icon: 'growth',
  },
];

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const smooth = Easing.bezier(0.22, 1, 0.36, 1);
const decisive = Easing.bezier(0.65, 0, 0.35, 1);

const reveal = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: smooth,
  });

const fadeWindow = (frame: number) =>
  interpolate(frame, [18, 58, 820, 888], [0, 1, 1, 0], clamp);

const Background: React.FC<{frame: number; duration: number}> = ({
  frame,
  duration,
}) => {
  const cycle = frame / duration;
  const driftX = Math.sin(cycle * Math.PI * 2) * 34;
  const driftY = Math.sin(cycle * Math.PI * 4) * 18;
  const particles = [
    {x: 126, y: 178, r: 3, color: '#55E6FF', phase: 0.1},
    {x: 382, y: 910, r: 5, color: '#A785FF', phase: 0.7},
    {x: 612, y: 116, r: 2, color: '#55E6FF', phase: 1.2},
    {x: 876, y: 946, r: 3, color: '#FFB26B', phase: 1.8},
    {x: 1124, y: 154, r: 4, color: '#A785FF', phase: 2.4},
    {x: 1398, y: 932, r: 2, color: '#55E6FF', phase: 2.9},
    {x: 1652, y: 132, r: 5, color: '#FFB26B', phase: 3.4},
    {x: 1810, y: 826, r: 3, color: '#A785FF', phase: 4.1},
    {x: 1538, y: 330, r: 2, color: '#55E6FF', phase: 4.8},
    {x: 246, y: 458, r: 2, color: '#FFB26B', phase: 5.4},
  ];

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#050A13'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 16% 18%, rgba(36,110,142,0.24), transparent 34%), radial-gradient(circle at 86% 74%, rgba(111,62,151,0.22), transparent 38%), linear-gradient(135deg, #07101D 0%, #070B15 48%, #0A0D19 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          left: -280 + driftX,
          top: -310 + driftY,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(85,230,255,0.13), rgba(85,230,255,0.02) 52%, transparent 70%)',
          filter: 'blur(22px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 880,
          height: 880,
          right: -360 - driftX,
          bottom: -430 - driftY,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(167,133,255,0.16), rgba(167,133,255,0.02) 54%, transparent 72%)',
          filter: 'blur(26px)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage:
            'linear-gradient(rgba(132,190,218,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(132,190,218,0.11) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          transform: `perspective(900px) rotateX(64deg) scale(1.55) translateY(${160 + driftY * 0.18}px)`,
          transformOrigin: '50% 100%',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.18) 34%, black 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.025), transparent 18%, transparent 82%, rgba(255,255,255,0.025))',
        }}
      />
      {particles.map((particle, i) => {
        const loop = cycle * Math.PI * 2 + particle.phase;
        const pulse = 0.42 + (Math.sin(loop * 2) + 1) * 0.28;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: particle.x + Math.sin(loop) * 18,
              top: particle.y + Math.cos(loop) * 12,
              width: particle.r * 2,
              height: particle.r * 2,
              borderRadius: '50%',
              background: particle.color,
              opacity: pulse,
              boxShadow: `0 0 ${particle.r * 7}px ${particle.color}`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.07,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.55%27/%3E%3C/svg%3E")',
          mixBlendMode: 'soft-light',
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{frame: number}> = ({frame}) => {
  const eyebrow = reveal(frame, 24, 38);
  const title = reveal(frame, 42, 52);
  const subtitle = reveal(frame, 64, 48);
  const line = reveal(frame, 32, 62);

  return (
    <div
      style={{
        position: 'absolute',
        left: 160,
        right: 160,
        top: 88,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        opacity: fadeWindow(frame),
      }}
    >
      <div style={{width: 1120}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: eyebrow,
            transform: `translateX(${interpolate(eyebrow, [0, 1], [-22, 0])}px)`,
          }}
        >
          <div
            style={{
              width: 52 * line,
              height: 2,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #55E6FF, #A785FF)',
              boxShadow: '0 0 16px rgba(85,230,255,0.55)',
            }}
          />
          <div
            style={{
              color: '#89DBEB',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 6,
            }}
          >
            BUSINESS ROADMAP
          </div>
        </div>
        <div
          style={{
            marginTop: 26,
            color: '#F4F9FF',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 74,
            lineHeight: 0.94,
            fontWeight: 800,
            letterSpacing: -3.8,
            opacity: title,
            transform: `translateY(${interpolate(title, [0, 1], [34, 0])}px)`,
            textShadow: '0 10px 40px rgba(0,0,0,0.32)',
          }}
        >
          From idea to{' '}
          <span
            style={{
              background: 'linear-gradient(92deg, #79EEFF, #BCA7FF 52%, #FFC38A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            impact.
          </span>
        </div>
      </div>
      <div
        style={{
          width: 390,
          paddingBottom: 4,
          color: '#8796A9',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 22,
          lineHeight: 1.45,
          letterSpacing: 0.1,
          opacity: subtitle,
          transform: `translateY(${interpolate(subtitle, [0, 1], [26, 0])}px)`,
        }}
      >
        A focused framework for building
        <br />
        sustainable, measurable growth.
      </div>
    </div>
  );
};

const StepIcon: React.FC<{
  type: Step['icon'];
  progress: number;
  accent: string;
}> = ({type, progress, accent}) => {
  const common = {
    fill: 'none',
    stroke: accent,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: 220,
    strokeDashoffset: 220 * (1 - progress),
  };

  if (type === 'compass') {
    return (
      <svg viewBox="0 0 96 96" width={82} height={82}>
        <circle cx="48" cy="48" r="32" {...common} />
        <circle
          cx="48"
          cy="48"
          r="4"
          fill={accent}
          opacity={progress}
          style={{filter: `drop-shadow(0 0 7px ${accent})`}}
        />
        <path d="M58 38 52 52 38 58l6-14 14-6Z" {...common} />
        <path d="M48 10v8M48 78v8M10 48h8M78 48h8" {...common} />
      </svg>
    );
  }

  if (type === 'layers') {
    return (
      <svg viewBox="0 0 96 96" width={82} height={82}>
        <path d="m48 15 32 17-32 17-32-17 32-17Z" {...common} />
        <path d="m18 46 30 16 30-16M18 60l30 16 30-16" {...common} />
        <circle cx="48" cy="32" r="5" fill={accent} opacity={progress} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" width={82} height={82}>
      <path d="M18 76V60h14v16M41 76V47h14v29M64 76V32h14v44" {...common} />
      <path d="m19 44 20-17 16 9 23-22M65 14h13v13" {...common} />
      <path d="M12 76h72" {...common} />
    </svg>
  );
};

const MetricRing: React.FC<{
  value: string;
  ratio: number;
  label: string;
  revealProgress: number;
  accent: string;
}> = ({value, ratio, label, revealProgress, accent}) => {
  const radius = 41;
  const circumference = 2 * Math.PI * radius;
  const animatedRatio = Math.min(1, Math.max(0, ratio)) * revealProgress;
  return (
    <div
      style={{
        width: 108,
        height: 108,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg width={108} height={108} viewBox="0 0 108 108" style={{position: 'absolute'}}>
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="5"
        />
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animatedRatio)}
          transform="rotate(-90 54 54)"
          style={{filter: `drop-shadow(0 0 8px ${accent})`}}
        />
      </svg>
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'Arial, Helvetica, sans-serif',
          opacity: revealProgress,
        }}
      >
        <div
          style={{
            color: '#F4F9FF',
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: -0.8,
          }}
        >
          {value}
        </div>
        <div
          style={{
            color: '#718095',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.6,
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const StepCard: React.FC<{step: Step; frame: number; fps: number}> = ({
  step,
  frame,
  fps,
}) => {
  const outline = reveal(frame, step.start, 56);
  const panel = spring({
    frame: frame - step.start - 20,
    fps,
    config: {damping: 18, stiffness: 120, mass: 0.9},
    durationInFrames: 72,
  });
  const orb = spring({
    frame: frame - step.start - 42,
    fps,
    config: {damping: 13, stiffness: 165, mass: 0.72},
    durationInFrames: 62,
  });
  const icon = reveal(frame, step.start + 54, 52);
  const copy = reveal(frame, step.start + 76, 52);
  const metric = reveal(frame, step.start + 102, 58);
  const sweep = reveal(frame, step.start + 26, 78);
  const activePulse =
    0.72 +
    Math.sin((frame - step.start) * 0.035) *
      0.12 *
      interpolate(frame, [step.start + 100, step.start + 150], [0, 1], clamp);
  const exit = interpolate(frame, [824, 888], [1, 0], {
    ...clamp,
    easing: decisive,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: step.x,
        top: 390,
        width: 440,
        height: 392,
        opacity: exit,
        transform: `perspective(1100px) translateY(${interpolate(
          panel,
          [0, 1],
          [42, 0],
        )}px) rotateX(${interpolate(panel, [0, 1], [8, 0])}deg) scale(${interpolate(
          panel,
          [0, 1],
          [0.96, 1],
        )})`,
        transformOrigin: '50% 70%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 34,
          overflow: 'hidden',
          opacity: panel,
          background:
            'linear-gradient(145deg, rgba(25,38,56,0.86), rgba(10,17,29,0.78))',
          boxShadow: `0 28px 70px rgba(0,0,0,0.34), 0 0 52px ${step.accentSoft}`,
          backdropFilter: 'blur(18px)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 1,
            borderRadius: 33,
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.08), transparent 34%, rgba(255,255,255,0.015))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 180,
            height: 560,
            left: interpolate(sweep, [0, 1], [-250, 520]),
            top: -90,
            transform: 'rotate(18deg)',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.085), transparent)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 16% 4%, ${step.accentSoft}, transparent 36%)`,
            opacity: activePulse,
          }}
        />
      </div>

      <svg
        width={440}
        height={392}
        viewBox="0 0 440 392"
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <rect
          x="2"
          y="2"
          width="436"
          height="388"
          rx="32"
          fill="none"
          stroke={step.accent}
          strokeWidth="2.5"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - outline}
          opacity={0.86}
          style={{filter: `drop-shadow(0 0 9px ${step.accent})`}}
        />
        <path
          d="M28 2H155"
          stroke="rgba(255,255,255,0.78)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - outline}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 28,
          top: -34,
          width: 72,
          height: 72,
          borderRadius: 22,
          display: 'grid',
          placeItems: 'center',
          color: '#07101D',
          background: `linear-gradient(145deg, #F2FCFF, ${step.accent})`,
          boxShadow: `0 12px 30px rgba(0,0,0,0.34), 0 0 28px ${step.accentSoft}`,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 23,
          fontWeight: 900,
          letterSpacing: -0.7,
          opacity: orb,
          transform: `translateY(${interpolate(orb, [0, 1], [22, 0])}px) rotate(${interpolate(
            orb,
            [0, 1],
            [-8, 0],
          )}deg) scale(${orb})`,
        }}
      >
        {step.number}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 32,
          top: 58,
          width: 94,
          height: 94,
          borderRadius: 28,
          display: 'grid',
          placeItems: 'center',
          background: step.accentSoft,
          border: `1px solid ${step.accent}55`,
          boxShadow: `inset 0 0 30px ${step.accentSoft}`,
          opacity: icon,
          transform: `translateY(${interpolate(icon, [0, 1], [18, 0])}px) scale(${interpolate(
            icon,
            [0, 1],
            [0.82, 1],
          )})`,
        }}
      >
        <StepIcon type={step.icon} progress={icon} accent={step.accent} />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 28,
          top: 52,
          opacity: metric,
          transform: `translateX(${interpolate(metric, [0, 1], [22, 0])}px)`,
        }}
      >
        <MetricRing
          value={step.metric}
          ratio={step.metricRatio}
          label={step.metricLabel}
          revealProgress={metric}
          accent={step.accent}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          bottom: 34,
          opacity: copy,
          transform: `translateY(${interpolate(copy, [0, 1], [26, 0])}px)`,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            color: step.accent,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 4,
            marginBottom: 14,
          }}
        >
          {step.label}
        </div>
        <div
          style={{
            color: '#F2F7FD',
            fontSize: 34,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: -1.2,
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            marginTop: 16,
            width: 340,
            color: '#8391A4',
            fontSize: 17,
            lineHeight: 1.45,
            letterSpacing: 0.1,
          }}
        >
          {step.description}
        </div>
      </div>
    </div>
  );
};

const Connector: React.FC<{frame: number}> = ({frame}) => {
  const pathProgress = reveal(frame, 72, 558);
  const finalFade = interpolate(frame, [824, 888], [1, 0], clamp);
  const tracerProgress = interpolate(frame, [72, 630], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const tracerX = interpolate(tracerProgress, [0, 1], [0, 1920]);
  const color =
    tracerProgress < 0.42 ? '#55E6FF' : tracerProgress < 0.72 ? '#A785FF' : '#FFB26B';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 574,
        height: 22,
        opacity: finalFade,
      }}
    >
      <svg width="1920" height="22" viewBox="0 0 1920 22" style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="roadmap-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#55E6FF" />
            <stop offset="50%" stopColor="#A785FF" />
            <stop offset="100%" stopColor="#FFB26B" />
          </linearGradient>
        </defs>
        <path
          d="M0 11H1920"
          stroke="rgba(132,160,181,0.16)"
          strokeWidth="2"
          strokeDasharray="8 12"
        />
        <path
          d="M0 11H1920"
          stroke="url(#roadmap-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - pathProgress}
          style={{filter: 'drop-shadow(0 0 8px rgba(108,226,255,0.75))'}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: tracerX - 7,
          top: 4,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: color,
          opacity: interpolate(pathProgress, [0, 0.04, 0.98, 1], [0, 1, 1, 0], clamp),
          boxShadow: `0 0 10px ${color}, 0 0 28px ${color}, 0 0 54px ${color}`,
        }}
      />
    </div>
  );
};

const Footer: React.FC<{frame: number}> = ({frame}) => {
  const enter = reveal(frame, 650, 50);
  const fade = interpolate(frame, [824, 888], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 160,
        right: 160,
        bottom: 84,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: enter * fade,
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#65EEB8',
            boxShadow: '0 0 13px #65EEB8',
          }}
        />
        <div
          style={{
            color: '#8C9BAD',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2.8,
          }}
        >
          STRATEGY • DELIVERY • PERFORMANCE
        </div>
      </div>
      <div
        style={{
          color: '#607084',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 2.4,
        }}
      >
        A FRAMEWORK FOR SCALABLE GROWTH
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const cameraPush = interpolate(frame, [0, 120, 720, 899], [1.018, 1, 1, 0.992], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const cameraY = interpolate(frame, [0, 110, 720, 899], [10, 0, 0, -6], {
    ...clamp,
    easing: smooth,
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#050A13', overflow: 'hidden'}}>
      <Background frame={frame} duration={durationInFrames} />
      <AbsoluteFill
        style={{
          transform: `translateY(${cameraY}px) scale(${cameraPush})`,
          transformOrigin: '50% 50%',
        }}
      >
        <Header frame={frame} />
        <Connector frame={frame} />
        {STEPS.map((step) => (
          <StepCard key={step.number} step={step} frame={frame} fps={fps} />
        ))}
        <Footer frame={frame} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 150px rgba(0,0,0,0.42)',
        }}
      />
    </AbsoluteFill>
  );
};
