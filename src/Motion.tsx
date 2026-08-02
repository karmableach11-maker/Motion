import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

const PALETTE = {
  void: '#010106',
  blackPlum: '#05040D',
  obsidian: '#090718',
  indigo: '#171433',
  violet: '#7469D7',
  lavender: '#BDB7FF',
  ice: '#EDF5FF',
  white: '#FFFFFF',
};

const clamp = (
  value: number,
  input: readonly number[],
  output: readonly number[],
  easing = Easing.linear,
) =>
  interpolate(value, input, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const bell = (frame: number, start: number, peak: number, end: number) => {
  if (frame <= start || frame >= end) return 0;
  if (frame <= peak) {
    return clamp(
      frame,
      [start, peak],
      [0, 1],
      Easing.inOut(Easing.cubic),
    );
  }
  return clamp(
    frame,
    [peak, end],
    [1, 0],
    Easing.inOut(Easing.cubic),
  );
};

type Speck = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  cadence: number;
  phase: number;
  driftPhase: number;
  driftPeriod: number;
  color: string;
};

const SPECKS: Speck[] = Array.from({length: 900}, (_, index) => {
  const sizeSelector = hash01(index * 4.91 + 6.2);
  const hueSelector = hash01(index * 7.17 + 18.4);
  const rawX = hash01(index * 3.71 + 1.1) * 100;
  const rawY = hash01(index * 5.43 + 4.7) * 100;
  return {
    x: rawX,
    y:
      rawX < 22 && rawY < 24
        ? 26 + hash01(index * 11.3 + 6.7) * 18
        : rawY,
    radius:
      sizeSelector > 0.86
        ? 4.65 + hash01(index * 8.1 + 2.8) * 2.07
        : 1.5 + hash01(index * 3.33 + 7.4) * 2.15,
    opacity: 0.04 + hash01(index * 9.3 + 3.6) * 0.127,
    cadence: 9 + Math.floor(hash01(index * 4.2 + 21.2) * 4),
    phase: Math.floor(hash01(index * 9.9 + 5.5) * 9),
    driftPhase: hash01(index * 13.7 + 4.2) * Math.PI * 2,
    driftPeriod: 52 + Math.floor(hash01(index * 6.8 + 12.9) * 16),
    color:
      hueSelector > 0.91
        ? '#C6B8FF'
        : hueSelector > 0.72
          ? '#9DBBFF'
          : '#F2F3FF',
  };
});

type Bokeh = {
  x: number;
  y: number;
  radius: number;
  blur: number;
  opacity: number;
  phase: number;
  tint: string;
};

const BOKEH: Bokeh[] = Array.from({length: 32}, (_, index) => {
  const cluster = index % 3;
  const baseX = cluster === 0 ? 17 : cluster === 1 ? 68 : 49;
  const baseY = cluster === 0 ? 25 : cluster === 1 ? 55 : 46;
  const spreadX = cluster === 2 ? 48 : 25;
  const spreadY = cluster === 2 ? 42 : 30;
  const hue = hash01(index * 5.3 + 13.4);
  return {
    x: baseX + (hash01(index * 3.7 + 2.1) - 0.5) * spreadX,
    y: baseY + (hash01(index * 6.1 + 7.3) - 0.5) * spreadY,
    radius: 13 + hash01(index * 8.7 + 1.8) * 54,
    blur: 7 + hash01(index * 2.9 + 11.2) * 25,
    opacity: 0.03 + hash01(index * 4.3 + 9.7) * 0.15,
    phase: hash01(index * 7.9 + 6.4) * Math.PI * 2,
    tint: hue > 0.7 ? '#9CB9FF' : hue > 0.38 ? '#8C76F0' : '#E0DCFF',
  };
});

type Fragment = {
  points: string;
  opacity: number;
  strokeOpacity: number;
};

const FRAGMENTS: Fragment[] = Array.from({length: 72}, (_, index) => {
  const x = hash01(index * 3.17 + 1.4) * 1920;
  const y = hash01(index * 5.27 + 7.2) * 1080;
  const width = 28 + hash01(index * 8.31 + 4.9) * 150;
  const height = 22 + hash01(index * 4.71 + 2.5) * 105;
  const skewA = (hash01(index * 9.03 + 8.1) - 0.5) * width * 0.34;
  const skewB = (hash01(index * 6.93 + 3.1) - 0.5) * width * 0.3;
  return {
    points: `${x + skewA},${y} ${x + width},${y + height * 0.18} ${
      x + width + skewB
    },${y + height} ${x - width * 0.12},${y + height * 0.76}`,
    opacity: 0.014 + hash01(index * 7.6 + 5.8) * 0.04,
    strokeOpacity: 0.018 + hash01(index * 11.1 + 3.9) * 0.045,
  };
});

const OrganicTexture: React.FC<{opacity: number}> = ({opacity}) => (
  <AbsoluteFill style={{opacity, pointerEvents: 'none'}}>
    <svg width="100%" height="100%" viewBox="0 0 1920 1080">
      <defs>
        <filter id="aurora-noise" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.012"
            numOctaves="4"
            seed="19"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0.20 0 0 0 0.15  0 0.16 0 0 0.12  0 0 0.38 0 0.33  0 0 0 0.52 0"
          />
        </filter>
        <radialGradient id="fragment-fill" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#8175D8" />
          <stop offset="100%" stopColor="#18142E" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" filter="url(#aurora-noise)" />
      <g>
        {FRAGMENTS.map((fragment, index) => (
          <polygon
            key={`fragment-${index}`}
            points={fragment.points}
            fill="url(#fragment-fill)"
            fillOpacity={fragment.opacity}
            stroke="#BDB7FF"
            strokeOpacity={fragment.strokeOpacity}
            strokeWidth="1"
          />
        ))}
      </g>
    </svg>
  </AbsoluteFill>
);

const StationarySpecks: React.FC<{
  frame: number;
  envelope: number;
}> = ({frame, envelope}) => (
  <AbsoluteFill style={{overflow: 'hidden', pointerEvents: 'none'}}>
    {SPECKS.map((speck, index) => {
      const bucket = Math.floor((frame + speck.phase) / speck.cadence);
      const active = hash01(index * 41.3 + bucket * 13.7) > 0.59 ? 1 : 0;
      const microFlicker =
        0.975 + 0.025 * Math.sin(frame * 0.82 + index * 1.73);
      const opacity = active * speck.opacity * envelope * microFlicker;
      const orbitRadius = speck.radius > 3.1 ? 2 : 5;
      const driftAngle =
        (frame / speck.driftPeriod) * Math.PI * 2 + speck.driftPhase;
      const driftX = Math.round((Math.cos(driftAngle) * orbitRadius) / 2) * 2;
      const driftY = Math.round((Math.sin(driftAngle) * orbitRadius) / 2) * 2;
      return (
        <div
          key={`speck-${index}`}
          style={{
            position: 'absolute',
            left: `${speck.x}%`,
            top: `${speck.y}%`,
            width: speck.radius * 2,
            height: speck.radius * 2,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px)`,
            backgroundColor: speck.color,
            opacity,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const AtmosphericBackdrop: React.FC<{
  frame: number;
  envelope: number;
  earlyPulse: number;
  latePulse: number;
}> = ({frame, envelope, earlyPulse, latePulse}) => {
  const lightEnergy = Math.min(
    1,
    0.295 + earlyPulse * 0.38 + latePulse * 0.76,
  );

  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.void, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          opacity: envelope,
          backgroundImage: [
            'radial-gradient(ellipse 58% 56% at 50% 48%, rgba(44,38,91,0.72) 0%, rgba(19,16,43,0.43) 38%, rgba(2,2,9,0) 78%)',
            'radial-gradient(ellipse 34% 23% at 9% 16%, rgba(133,145,255,0.47) 0%, rgba(74,64,166,0.19) 31%, rgba(0,0,0,0) 74%)',
            'radial-gradient(ellipse 28% 28% at 73% 54%, rgba(116,133,237,0.28) 0%, rgba(72,57,143,0.12) 43%, rgba(0,0,0,0) 76%)',
            `linear-gradient(118deg, ${PALETTE.blackPlum} 0%, ${PALETTE.obsidian} 43%, #080716 72%, ${PALETTE.void} 100%)`,
          ].join(','),
        }}
      />

      <OrganicTexture opacity={envelope * (0.42 + lightEnergy * 0.28)} />

      <AbsoluteFill style={{opacity: envelope, pointerEvents: 'none'}}>
        {BOKEH.map((disc, index) => {
          const opacity =
            disc.opacity * (0.62 + lightEnergy * 1.2) * envelope;
          return (
            <div
              key={`bokeh-${index}`}
              style={{
                position: 'absolute',
                left: `${disc.x}%`,
                top: `${disc.y}%`,
                width: disc.radius * 2,
                height: disc.radius * 2,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${disc.tint} 0%, ${disc.tint}66 35%, transparent 74%)`,
                filter: `blur(${disc.blur}px)`,
                mixBlendMode: 'screen',
                opacity,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: '-8%',
          top: '5%',
          width: '54%',
          height: '17%',
          borderRadius: '50%',
          background:
            'linear-gradient(90deg, rgba(205,221,255,0.74), rgba(131,122,255,0.36) 34%, rgba(40,31,100,0.05) 74%, transparent)',
          filter: 'blur(45px)',
          transform: 'rotate(-2deg)',
          mixBlendMode: 'screen',
          opacity: envelope * (0.1 + earlyPulse * 0.34 + latePulse * 0.55),
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '57%',
          top: '38%',
          width: '30%',
          height: '38%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(231,240,255,0.76) 0%, rgba(145,143,255,0.38) 18%, rgba(84,64,168,0.13) 43%, transparent 74%)',
          filter: 'blur(34px)',
          mixBlendMode: 'screen',
          opacity: envelope * (0.14 + earlyPulse * 0.5 + latePulse * 0.85),
        }}
      />

      <AbsoluteFill
        style={{
          background: `rgba(208,206,255,${
            envelope * (earlyPulse * 0.13 + latePulse * 0.42)
          })`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      <StationarySpecks
        frame={frame}
        envelope={envelope}
      />
    </AbsoluteFill>
  );
};

const TitleLine: React.FC<{
  children: React.ReactNode;
  size: number;
  tracking: number;
  weight: number;
  opacity?: number;
  shimmerPosition: number;
}> = ({children, size, tracking, weight, opacity = 1, shimmerPosition}) => (
  <div
    style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1,
      letterSpacing: tracking,
      paddingLeft: tracking,
      whiteSpace: 'nowrap',
      color: 'transparent',
      backgroundImage:
        'linear-gradient(108deg, #AAA8CA 0%, #D7D8F2 28%, #FFFFFF 47%, #BDB7FF 62%, #9290BB 100%)',
      backgroundSize: '220% 100%',
      backgroundPosition: `${shimmerPosition}% 50%`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      opacity,
      transform: 'scaleY(1.15)',
    }}
  >
    {children}
  </div>
);

const ThankYouTitle: React.FC<{
  frame: number;
  earlyPulse: number;
  latePulse: number;
}> = ({frame, earlyPulse, latePulse}) => {
  const reveal = clamp(
    frame,
    [6, 74],
    [0, 1],
    Easing.out(Easing.cubic),
  );
  const exit = clamp(
    frame,
    [537, 598],
    [1, 0],
    Easing.inOut(Easing.cubic),
  );
  const enterBlur = clamp(
    frame,
    [6, 74],
    [18, 0],
    Easing.out(Easing.cubic),
  );
  const exitBlur = clamp(
    frame,
    [537, 598],
    [0, 30],
    Easing.inOut(Easing.cubic),
  );
  const shimmerPosition =
    -80 + (positiveModulo(frame - 82, 250) / 250) * 260;
  const exposureBrightness = 1 + earlyPulse * 0.17 + latePulse * 0.38;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '51.3%',
        width: 1080,
        height: 430,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 45,
        opacity: reveal * exit,
        filter: `blur(${enterBlur + exitBlur}px) brightness(${exposureBrightness}) drop-shadow(0 9px 10px rgba(0,0,0,0.76)) drop-shadow(0 0 ${
          13 + latePulse * 30
        }px rgba(184,178,255,${0.18 + latePulse * 0.24}))`,
        pointerEvents: 'none',
      }}
    >
      <TitleLine
        size={140}
        tracking={14}
        weight={500}
        shimmerPosition={shimmerPosition}
      >
        THANK YOU
      </TitleLine>
      <TitleLine
        size={62}
        tracking={26}
        weight={400}
        opacity={0.78}
        shimmerPosition={shimmerPosition - 12}
      >
        FOR
      </TitleLine>
      <TitleLine
        size={130}
        tracking={13}
        weight={500}
        opacity={0.9}
        shimmerPosition={shimmerPosition - 24}
      >
        WATCHING
      </TitleLine>
    </div>
  );
};

const OpticalFinish: React.FC<{envelope: number; latePulse: number}> = ({
  envelope,
  latePulse,
}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 60% 67% at 50% 49%, transparent 28%, rgba(2,1,8,0.26) 68%, rgba(0,0,4,0.9) 100%)',
        opacity: envelope,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(180,190,255,0.12) 0%, transparent 16%, transparent 83%, rgba(0,0,0,0.38) 100%)',
        opacity: envelope * (0.32 + latePulse * 0.32),
        mixBlendMode: 'screen',
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const revealEnvelope = clamp(
    frame,
    [4, 74],
    [0, 1],
    Easing.out(Easing.cubic),
  );
  const exitEnvelope = clamp(
    frame,
    [537, 599],
    [1, 0],
    Easing.inOut(Easing.cubic),
  );
  const envelope = revealEnvelope * exitEnvelope;

  const earlyPulse = bell(frame, 80, 112, 159);
  const latePulseA = bell(frame, 424, 450, 468);
  const latePulseB = bell(frame, 466, 484, 499);
  const latePulse = Math.min(1, latePulseA * 0.88 + latePulseB);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PALETTE.void,
        overflow: 'hidden',
      }}
    >
      <AtmosphericBackdrop
        frame={frame}
        envelope={envelope}
        earlyPulse={earlyPulse}
        latePulse={latePulse}
      />
      <ThankYouTitle
        frame={frame}
        earlyPulse={earlyPulse}
        latePulse={latePulse}
      />
      <OpticalFinish envelope={envelope} latePulse={latePulse} />
    </AbsoluteFill>
  );
};
