import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const COLORS = {
  void: '#020006',
  plumBlack: '#08010E',
  ink: '#10051B',
  ultraviolet: '#713CFF',
  violet: '#9A4DFF',
  magenta: '#FF2BD6',
  hotPink: '#FF63E6',
  pearl: '#FFF2FD',
  white: '#FFFFFF',
};

const DOT_COUNT = 28;

const PROGRESS_SAMPLES = [
  [0.0, 0.0],
  [0.65, 0.01],
  [1.3, 0.05],
  [1.9, 0.09],
  [2.3, 0.13],
  [2.6, 0.17],
  [2.9, 0.2],
  [3.2, 0.24],
  [3.45, 0.28],
  [3.7, 0.31],
  [3.95, 0.35],
  [4.2, 0.38],
  [4.45, 0.42],
  [4.7, 0.46],
  [4.95, 0.5],
  [5.2, 0.53],
  [5.45, 0.57],
  [5.7, 0.6],
  [5.95, 0.64],
  [6.2, 0.68],
  [6.45, 0.71],
  [6.7, 0.75],
  [6.95, 0.78],
  [7.2, 0.81],
  [7.45, 0.84],
  [7.7, 0.87],
  [8.35, 0.93],
  [8.85, 0.96],
  [9.5, 0.99],
  [10.15, 1.0],
] as const;

const PROGRESS_SLOPES = (() => {
  const count = PROGRESS_SAMPLES.length;
  const intervalWidths = Array.from({length: count - 1}, (_, index) =>
    Math.max(0.0001, PROGRESS_SAMPLES[index + 1][0] - PROGRESS_SAMPLES[index][0]),
  );
  const secants = intervalWidths.map(
    (width, index) =>
      (PROGRESS_SAMPLES[index + 1][1] - PROGRESS_SAMPLES[index][1]) / width,
  );
  const slopes = Array.from({length: count}, () => 0);
  slopes[0] = secants[0];
  slopes[count - 1] = secants[secants.length - 1];

  for (let index = 1; index < count - 1; index++) {
    const before = secants[index - 1];
    const after = secants[index];
    if (before <= 0 || after <= 0) {
      slopes[index] = 0;
      continue;
    }
    const beforeWidth = intervalWidths[index - 1];
    const afterWidth = intervalWidths[index];
    const weightA = 2 * afterWidth + beforeWidth;
    const weightB = afterWidth + 2 * beforeWidth;
    slopes[index] =
      (weightA + weightB) / (weightA / before + weightB / after);
  }

  return slopes;
})();

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const hash01 = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

const positiveModulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const GRID_CHURN_DOTS = Array.from({length: 900}, (_, index) => {
  const slot = (index * 37) % (48 * 30);
  return {
    x: (slot % 48) * 48 + 1.5,
    y: Math.floor(slot / 48) * 48 + 1.5,
    phase: Math.floor(hash01(index * 9.17 + 4.8) * 8),
    size: 3.8 + hash01(index * 7.61 + 13.7) * 1.0,
  };
});

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const measuredProgressAt = (seconds: number) => {
  if (seconds <= PROGRESS_SAMPLES[0][0]) return PROGRESS_SAMPLES[0][1];
  const finalSample = PROGRESS_SAMPLES[PROGRESS_SAMPLES.length - 1];
  if (seconds >= finalSample[0]) return finalSample[1];

  let segment = 0;
  while (
    segment < PROGRESS_SAMPLES.length - 2 &&
    seconds > PROGRESS_SAMPLES[segment + 1][0]
  ) {
    segment++;
  }

  const [x0, y0] = PROGRESS_SAMPLES[segment];
  const [x1, y1] = PROGRESS_SAMPLES[segment + 1];
  const width = x1 - x0;
  const t = clamp01((seconds - x0) / width);
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return clamp01(
    h00 * y0 +
      h10 * width * PROGRESS_SLOPES[segment] +
      h01 * y1 +
      h11 * width * PROGRESS_SLOPES[segment + 1],
  );
};

const range = (
  value: number,
  input: readonly number[],
  output: readonly number[],
) =>
  interpolate(value, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Background: React.FC<{progress: number}> = ({progress}) => {
  const energy = 0.74 + progress * 0.26;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: COLORS.void,
        backgroundImage: [
          `radial-gradient(ellipse 78% 66% at 48% 54%, rgba(73,20,106,${
            0.12 * energy
          }) 0%, rgba(25,4,39,0.10) 42%, transparent 76%)`,
          'radial-gradient(ellipse 42% 36% at 13% 84%, rgba(255,43,214,0.07) 0%, transparent 72%)',
          'linear-gradient(135deg, #020006 0%, #08010E 52%, #030007 100%)',
        ].join(','),
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.025) 4px)',
          mixBlendMode: 'screen',
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 84% 86% at 50% 50%, transparent 30%, rgba(2,0,6,0.34) 68%, rgba(2,0,6,0.96) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const PerspectiveGrid: React.FC<{
  angle: number;
  progress: number;
  offsetX: number;
  offsetY: number;
  frame: number;
}> = ({angle, offsetX, offsetY, frame}) => {
  const aura = 0.72;

  return (
    <div
      style={{
        position: 'absolute',
        left: -190,
        top: -175,
        width: 2300,
        height: 1430,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '42% 57%',
        opacity: aura,
        WebkitMaskImage:
          'radial-gradient(ellipse 69% 64% at 44% 57%, black 0%, rgba(0,0,0,0.98) 37%, rgba(0,0,0,0.68) 68%, transparent 91%)',
        maskImage:
          'radial-gradient(ellipse 69% 64% at 44% 57%, black 0%, rgba(0,0,0,0.98) 37%, rgba(0,0,0,0.68) 68%, transparent 91%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'radial-gradient(circle at 50% 50%, rgba(255,99,230,0.34) 0px, rgba(255,43,214,0.25) 6.2px, rgba(113,60,255,0.11) 8.5px, transparent 10.5px)',
            'radial-gradient(circle at 50% 50%, rgba(255,99,230,0.68) 0px, rgba(255,43,214,0.50) 1.15px, transparent 2.3px)',
            'repeating-linear-gradient(90deg, rgba(180,80,255,0.12) 0px, rgba(180,80,255,0.12) 1px, transparent 1px, transparent 48px)',
            'repeating-linear-gradient(0deg, rgba(255,43,214,0.11) 0px, rgba(255,43,214,0.11) 1px, transparent 1px, transparent 48px)',
          ].join(','),
          backgroundSize:
            '144px 144px, 48px 48px, 48px 48px, 48px 48px',
          backgroundPosition: [
            `${offsetX}px ${offsetY}px`,
            `${offsetX}px ${offsetY}px`,
            `${offsetX}px ${offsetY}px`,
            `${offsetX}px ${offsetY}px`,
          ].join(','),
          boxShadow: 'inset 0 0 180px rgba(255,43,214,0.05)',
        }}
      />

      {GRID_CHURN_DOTS.map((dot, index) => {
        const effectiveFrame = Math.min(frame, 609);
        const bucket = Math.floor((effectiveFrame + dot.phase) / 2);
        const active = hash01(index * 41.3 + bucket * 13.7) > 0.5;
        if (!active) return null;
        return (
          <div
            key={`grid-churn-${index}`}
            style={{
              position: 'absolute',
              left: positiveModulo(dot.x + offsetX, 2300),
              top: positiveModulo(dot.y + offsetY, 1430),
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: COLORS.magenta,
              opacity: 0.31,
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: 180,
          top: 640,
          width: 1660,
          height: 250,
          borderRadius: '50%',
          transform: 'rotate(-1deg)',
          background:
            'radial-gradient(ellipse, rgba(255,43,214,0.15) 0%, rgba(113,60,255,0.08) 38%, transparent 74%)',
          filter: 'blur(42px)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};

const LoadingAura: React.FC<{
  width: number;
  progress: number;
}> = ({width, progress}) => {
  const activeWidth = 120 + progress * (width - 120);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: -80,
          top: -112,
          width: width + 160,
          height: 250,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(255,43,214,0.14) 0%, rgba(113,60,255,0.075) 42%, transparent 72%)',
          filter: 'blur(26px)',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: -18,
          top: -58,
          width: activeWidth,
          height: 154,
          borderRadius: 90,
          background:
            'linear-gradient(90deg, rgba(255,43,214,0.17), rgba(154,77,255,0.14) 70%, rgba(255,242,253,0.42))',
          filter: 'blur(30px)',
          mixBlendMode: 'screen',
          opacity: 0.62 + progress * 0.22,
        }}
      />
    </>
  );
};

const LoadingCells: React.FC<{
  width: number;
  height: number;
  progress: number;
}> = ({width, height, progress}) => {
  const sidePadding = 27;
  const travel = width - sidePadding * 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      {Array.from({length: DOT_COUNT}, (_, index) => {
        const slot = index / (DOT_COUNT - 1);
        const activation = smoothstep(progress * DOT_COUNT - index);
        const pulse = Math.max(
          0,
          1 - Math.abs(progress * DOT_COUNT - index - 0.42) / 1.15,
        );
        const diameter = 31 + pulse * 3;

        return (
          <div
            key={`loading-cell-${index}`}
            style={{
              position: 'absolute',
              left: sidePadding + slot * travel,
              top: height / 2,
              width: diameter,
              height: diameter,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) scale(${range(
                activation,
                [0, 1],
                [0.58, 1],
              )})`,
              opacity: activation,
              background:
                'radial-gradient(circle at 34% 30%, #FFFFFF 0%, #FFF2FD 28%, #FF9AEC 57%, #FF2BD6 100%)',
              boxShadow: [
                `0 0 ${8 + pulse * 6}px rgba(255,242,253,0.92)`,
                `0 0 ${18 + pulse * 15}px rgba(255,43,214,0.92)`,
                `0 0 ${34 + pulse * 18}px rgba(113,60,255,0.45)`,
              ].join(','),
            }}
          />
        );
      })}
    </div>
  );
};

const LoadingCapsule: React.FC<{
  progress: number;
  frame: number;
  fps: number;
  angle: number;
}> = ({progress, frame, fps, angle}) => {
  const width = 1385;
  const height = 48;
  const percentage = Math.round(progress * 100);
  const isComplete = progress >= 0.9999;
  const dotCycle = (Math.floor(frame / Math.max(1, fps * 0.62)) % 3) + 1;
  const status = `Loading ${'. '.repeat(dotCycle).trim()}`;
  const frontX = 27 + progress * (width - 54);

  return (
    <div
      style={{
        position: 'absolute',
        left: 75,
        top: 771,
        width,
        height,
        transform: `translateY(-${height / 2}px) rotate(${angle}deg)`,
        transformOrigin: `0px ${height / 2}px`,
      }}
    >
      <LoadingAura width={width} progress={progress} />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="neon-bar-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={COLORS.magenta} />
            <stop offset="53%" stopColor={COLORS.hotPink} />
            <stop offset="100%" stopColor={COLORS.violet} />
          </linearGradient>
          <linearGradient id="neon-bar-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1B0828" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#09020F" stopOpacity="0.96" />
          </linearGradient>
          <filter id="neon-bar-soft-glow" x="-20%" y="-400%" width="140%" height="900%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="neon-bar-tight-glow" x="-10%" y="-250%" width="120%" height="600%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
        </defs>

        <rect
          x="3"
          y="3"
          width={width - 6}
          height={height - 6}
          rx={(height - 6) / 2}
          fill="none"
          stroke={COLORS.magenta}
          strokeWidth="8"
          opacity="0.42"
          filter="url(#neon-bar-soft-glow)"
        />
        <rect
          x="3"
          y="3"
          width={width - 6}
          height={height - 6}
          rx={(height - 6) / 2}
          fill="none"
          stroke={COLORS.hotPink}
          strokeWidth="5"
          opacity="0.78"
          filter="url(#neon-bar-tight-glow)"
        />
        <rect
          x="3"
          y="3"
          width={width - 6}
          height={height - 6}
          rx={(height - 6) / 2}
          fill="url(#neon-bar-fill)"
          stroke="url(#neon-bar-stroke)"
          strokeWidth="3.6"
        />
        <path
          d={`M ${height / 2} 8 H ${width - height / 2}`}
          fill="none"
          stroke={COLORS.pearl}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.48"
        />
      </svg>

      <LoadingCells width={width} height={height} progress={progress} />

      {!isComplete && progress > 0.002 ? (
        <div
          style={{
            position: 'absolute',
            left: frontX,
            top: height / 2,
            width: 106,
            height: 92,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.78) 0%, rgba(255,43,214,0.34) 27%, rgba(113,60,255,0.12) 50%, transparent 72%)',
            filter: 'blur(8px)',
            mixBlendMode: 'screen',
            opacity: 0.76,
          }}
        />
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: 20,
          top: -63,
          color: COLORS.pearl,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 39,
          fontStyle: 'italic',
          fontWeight: 300,
          letterSpacing: 0.3,
          whiteSpace: 'nowrap',
          textShadow: [
            '0 0 8px rgba(255,242,253,0.92)',
            '0 0 20px rgba(255,43,214,0.88)',
            '0 0 42px rgba(113,60,255,0.58)',
          ].join(','),
        }}
      >
        {status}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 66,
          top: -68,
          minWidth: 128,
          textAlign: 'right',
          color: COLORS.pearl,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 42,
          fontWeight: 300,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 0.2,
          textShadow: [
            '0 0 8px rgba(255,242,253,0.94)',
            '0 0 22px rgba(255,43,214,0.90)',
            '0 0 46px rgba(113,60,255,0.62)',
          ].join(','),
        }}
      >
        {percentage}%
      </div>
    </div>
  );
};

const FilmFinish: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
    <AbsoluteFill
      style={{
        opacity: 0.17,
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.018) 3px)',
        mixBlendMode: 'screen',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 82% 88% at 50% 49%, transparent 34%, rgba(2,0,6,0.26) 66%, rgba(2,0,6,0.88) 100%)',
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = measuredProgressAt(frame / fps);
  const cameraX = progress * 282;
  const cameraY = progress * -151;
  const angle = range(progress, [0, 1], [-11.37, -12.48]);
  const analyzerPixel = 1920 / 700;
  const gridCameraX =
    Math.round((progress * 500) / analyzerPixel) * analyzerPixel;
  const gridAngle = -11.9;
  const gridRadians = (gridAngle * Math.PI) / 180;
  const gridPatternX = Math.cos(gridRadians) * gridCameraX;
  const gridPatternY = -Math.sin(gridRadians) * gridCameraX;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: COLORS.void,
      }}
    >
      <Background progress={progress} />

      <AbsoluteFill
        style={{willChange: 'contents'}}
      >
        <PerspectiveGrid
          angle={gridAngle}
          progress={progress}
          offsetX={gridPatternX}
          offsetY={gridPatternY}
          frame={frame}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          transform: `translate3d(${cameraX}px, ${cameraY}px, 0)`,
          willChange: 'transform',
        }}
      >
        <LoadingCapsule
          progress={progress}
          frame={frame}
          fps={fps}
          angle={angle}
        />
      </AbsoluteFill>

      <FilmFinish />
    </AbsoluteFill>
  );
};
