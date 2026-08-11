import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const FINAL_MOTION_FRAME = 630;

const COLORS = {
  background: '#02040C',
  backgroundBlue: '#07142A',
  silver: '#F7FAFF',
  silverLow: '#B8C9DE',
  cyan: '#39DDFB',
  cyanLow: '#168DB7',
  violet: '#8A67FF',
  blue: '#4B8FFF',
  warm: '#F1C36B',
  muted: '#7189A8',
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.out(Easing.cubic),
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const triangular = (frame: number, start: number, peak: number, end: number) =>
  interpolate(frame, [start, peak, end], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

type Accent = 'silver' | 'cyan' | 'violet' | 'blue' | 'muted';

const accentColor: Record<Accent, string> = {
  silver: '#F2F7FF',
  cyan: '#42E4FA',
  violet: '#9A7CFF',
  blue: '#639CFF',
  muted: '#7F93AE',
};

const accentGlow: Record<Accent, string> = {
  silver: 'rgba(216,235,255,0.62)',
  cyan: 'rgba(57,221,251,0.62)',
  violet: 'rgba(138,103,255,0.56)',
  blue: 'rgba(75,143,255,0.52)',
  muted: 'rgba(100,134,172,0.30)',
};

const PremiumBackground: React.FC<{frame: number}> = ({frame}) => {
  const atmosphere = reveal(frame, 0, 160, Easing.out(Easing.quad));
  const depth = reveal(frame, 80, 520, Easing.inOut(Easing.cubic));

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 68% 72% at 50% 49%, rgba(36,50,113,0.82) 0%, rgba(12,25,62,0.66) 33%, rgba(3,8,25,0.92) 68%, #02040C 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.30 + atmosphere * 0.36,
          background:
            'radial-gradient(circle at 25% 47%, rgba(48,95,255,0.21), transparent 34%), radial-gradient(circle at 75% 50%, rgba(115,55,255,0.18), transparent 31%), radial-gradient(circle at 51% 60%, rgba(30,204,255,0.10), transparent 40%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.11 + depth * 0.10,
          backgroundImage:
            'linear-gradient(rgba(112,170,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(112,170,255,0.035) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage:
            'radial-gradient(ellipse 70% 66% at 50% 50%, black 0%, rgba(0,0,0,0.52) 54%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 66% at 50% 50%, black 0%, rgba(0,0,0,0.52) 54%, transparent 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 190,
          right: 190,
          top: 540,
          height: 1,
          opacity: 0.18 + atmosphere * 0.22,
          background:
            'linear-gradient(90deg, transparent, rgba(75,143,255,0.45) 22%, rgba(232,247,255,0.58) 50%, rgba(138,103,255,0.44) 78%, transparent)',
          boxShadow: '0 0 28px rgba(76,157,255,0.25)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 110% 95% at 50% 50%, transparent 42%, rgba(0,1,8,0.34) 70%, rgba(0,1,7,0.82) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

type BeamSpec = {
  x: number;
  width: number;
  color: string;
  opacity: number;
  start: number;
  drift: number;
  blur: number;
};

const BEAMS: BeamSpec[] = [
  {x: 250, width: 24, color: '77,132,255', opacity: 0.30, start: 18, drift: 16, blur: 18},
  {x: 475, width: 10, color: '72,221,255', opacity: 0.20, start: 54, drift: -10, blur: 12},
  {x: 720, width: 34, color: '132,76,255', opacity: 0.31, start: 92, drift: 22, blur: 24},
  {x: 958, width: 58, color: '109,87,255', opacity: 0.29, start: 28, drift: -8, blur: 34},
  {x: 1195, width: 28, color: '40,215,255', opacity: 0.23, start: 112, drift: 12, blur: 22},
  {x: 1435, width: 16, color: '153,76,255', opacity: 0.25, start: 70, drift: -18, blur: 16},
  {x: 1680, width: 8, color: '241,195,107', opacity: 0.23, start: 138, drift: 8, blur: 10},
];

const LightColumns: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
    {BEAMS.map((beam, index) => {
      const entrance = reveal(frame, beam.start, beam.start + 100, Easing.out(Easing.quad));
      const settle = reveal(frame, beam.start + 80, 600, Easing.inOut(Easing.cubic));
      const x = beam.x + beam.drift * settle;
      return (
        <React.Fragment key={`${beam.x}-${index}`}>
          <div
            style={{
              position: 'absolute',
              left: x - beam.width / 2,
              top: -100,
              width: beam.width,
              height: 1280,
              opacity: beam.opacity * (0.12 + entrance * 0.88),
              filter: `blur(${beam.blur}px)`,
              background: `linear-gradient(180deg, transparent 2%, rgba(${beam.color},0.10) 18%, rgba(${beam.color},0.86) 48%, rgba(${beam.color},0.14) 78%, transparent 98%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: x,
              top: 130,
              width: 1,
              height: 820,
              opacity: beam.opacity * (0.10 + entrance * 0.90) * 0.72,
              background: `linear-gradient(180deg, transparent, rgba(${beam.color},0.88), transparent)`,
              boxShadow: `0 0 16px rgba(${beam.color},0.54)`,
            }}
          />
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);

type ParticleSpec = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  dx: number;
  dy: number;
  start: number;
  color: string;
};

const PARTICLES: ParticleSpec[] = [
  {x: 116, y: 226, size: 2, opacity: 0.45, dx: 18, dy: -8, start: 30, color: COLORS.cyan},
  {x: 205, y: 742, size: 3, opacity: 0.38, dx: 12, dy: -16, start: 112, color: COLORS.blue},
  {x: 315, y: 124, size: 2, opacity: 0.42, dx: -10, dy: 11, start: 74, color: COLORS.violet},
  {x: 402, y: 930, size: 2, opacity: 0.30, dx: 16, dy: -12, start: 164, color: COLORS.cyan},
  {x: 524, y: 185, size: 4, opacity: 0.27, dx: 11, dy: 7, start: 202, color: COLORS.blue},
  {x: 612, y: 864, size: 2, opacity: 0.48, dx: -8, dy: -13, start: 96, color: COLORS.cyan},
  {x: 706, y: 116, size: 2, opacity: 0.32, dx: 14, dy: 9, start: 244, color: COLORS.violet},
  {x: 798, y: 926, size: 3, opacity: 0.25, dx: -12, dy: -8, start: 270, color: COLORS.blue},
  {x: 892, y: 170, size: 2, opacity: 0.42, dx: 7, dy: 13, start: 136, color: COLORS.cyan},
  {x: 1034, y: 932, size: 3, opacity: 0.30, dx: 9, dy: -16, start: 210, color: COLORS.violet},
  {x: 1120, y: 130, size: 2, opacity: 0.40, dx: -11, dy: 10, start: 54, color: COLORS.cyan},
  {x: 1230, y: 900, size: 2, opacity: 0.36, dx: 12, dy: -10, start: 296, color: COLORS.blue},
  {x: 1322, y: 178, size: 4, opacity: 0.26, dx: -15, dy: 8, start: 188, color: COLORS.violet},
  {x: 1425, y: 936, size: 2, opacity: 0.43, dx: 10, dy: -14, start: 118, color: COLORS.cyan},
  {x: 1518, y: 126, size: 2, opacity: 0.36, dx: -9, dy: 12, start: 338, color: COLORS.blue},
  {x: 1612, y: 840, size: 3, opacity: 0.34, dx: 14, dy: -11, start: 224, color: COLORS.violet},
  {x: 1724, y: 212, size: 2, opacity: 0.40, dx: -13, dy: 8, start: 148, color: COLORS.cyan},
  {x: 1810, y: 726, size: 2, opacity: 0.32, dx: -16, dy: -6, start: 318, color: COLORS.blue},
];

const AtmosphereParticles: React.FC<{frame: number}> = ({frame}) => {
  const travel = reveal(frame, 0, 610, Easing.linear);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {PARTICLES.map((particle, index) => {
        const visible = reveal(frame, particle.start, particle.start + 70, Easing.out(Easing.quad));
        return (
          <div
            key={`${particle.x}-${particle.y}-${index}`}
            style={{
              position: 'absolute',
              left: particle.x + particle.dx * travel,
              top: particle.y + particle.dy * travel,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              opacity: particle.opacity * visible,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 5}px ${particle.color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

type GlintSpec = {
  x: number;
  y: number;
  size: number;
  dx: number;
  start: number;
  duration: number;
  opacity: number;
  color: string;
};

const GLINTS: GlintSpec[] = [
  {x: -120, y: 48, size: 2, dx: 1420, start: 0, duration: 410, opacity: 0.44, color: COLORS.cyan},
  {x: 170, y: 68, size: 3, dx: 1320, start: 56, duration: 420, opacity: 0.34, color: COLORS.blue},
  {x: 610, y: 38, size: 2, dx: 1220, start: 136, duration: 400, opacity: 0.40, color: COLORS.violet},
  {x: 1060, y: 58, size: 2, dx: 980, start: 224, duration: 395, opacity: 0.38, color: COLORS.cyan},
  {x: -190, y: 1028, size: 3, dx: 1510, start: 78, duration: 430, opacity: 0.36, color: COLORS.violet},
  {x: 280, y: 1042, size: 2, dx: 1390, start: 150, duration: 420, opacity: 0.42, color: COLORS.cyan},
  {x: 780, y: 1022, size: 2, dx: 1180, start: 220, duration: 400, opacity: 0.34, color: COLORS.blue},
  {x: 42, y: 310, size: 2, dx: 1650, start: 104, duration: 430, opacity: 0.30, color: COLORS.cyan},
  {x: 76, y: 760, size: 3, dx: 1580, start: 186, duration: 420, opacity: 0.28, color: COLORS.violet},
];

const MovingGlints: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
    {GLINTS.map((glint, index) => {
      const end = Math.min(glint.start + glint.duration, FINAL_MOTION_FRAME);
      const progress = reveal(frame, glint.start, end, Easing.linear);
      const enter = reveal(frame, glint.start, glint.start + 22, Easing.out(Easing.quad));
      const exitStart = Math.max(glint.start + 300, end - 62);
      const exit = reveal(frame, exitStart, end, Easing.in(Easing.quad));
      const opacity = glint.opacity * enter * (1 - exit);
      const x = glint.x + glint.dx * progress;

      return (
        <div
          key={`${glint.x}-${glint.y}-${index}`}
          style={{
            position: 'absolute',
            left: x,
            top: glint.y,
            width: 22 + glint.size * 4,
            height: glint.size,
            opacity,
            borderRadius: 999,
            background: `linear-gradient(90deg, transparent, ${glint.color}, #FFFFFF)`,
            boxShadow: `0 0 ${glint.size * 7}px ${glint.color}`,
            transform: 'translate(-100%, -50%)',
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const LensFlare: React.FC<{
  frame: number;
  x: number;
  y: number;
  start: number;
  color: string;
  scale?: number;
}> = ({frame, x, y, start, color, scale = 1}) => {
  const show = reveal(frame, start, start + 90, Easing.out(Easing.quad));
  const settle = reveal(frame, start + 90, 610, Easing.inOut(Easing.cubic));
  const intensity = show * (1 - settle * 0.18);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 1,
        height: 1,
        opacity: intensity,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -220 * scale,
          top: -1,
          width: 440 * scale,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          filter: 'blur(1px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -1,
          top: -150 * scale,
          width: 2,
          height: 300 * scale,
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          filter: 'blur(1px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6 * scale,
          top: -6 * scale,
          width: 12 * scale,
          height: 12 * scale,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: `0 0 ${18 * scale}px ${8 * scale}px ${color}, 0 0 ${70 * scale}px ${20 * scale}px ${color}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 78 * scale,
          top: -10 * scale,
          width: 20 * scale,
          height: 20 * scale,
          borderRadius: '50%',
          border: `1px solid ${color}`,
          opacity: 0.20,
        }}
      />
    </div>
  );
};

type WordSpec = {
  text: string;
  x: number;
  y: number;
  size: number;
  weight: number;
  rotation?: number;
  accent: Accent;
  start: number;
  duration?: number;
  fromX: number;
  fromY: number;
  opacity?: number;
  tracking?: number;
};

const WORDS: WordSpec[] = [
  {text: 'METRICS', x: 880, y: 336, size: 76, weight: 760, accent: 'cyan', start: 38, fromX: 360, fromY: -44, tracking: 0.4},
  {text: 'MEASURE', x: 520, y: 672, size: 46, weight: 650, accent: 'cyan', start: 52, fromX: -330, fromY: 20},
  {text: 'PROCESS', x: 900, y: 688, size: 70, weight: 720, accent: 'silver', start: 66, fromX: 370, fromY: 26},
  {text: 'BUSINESS', x: 462, y: 397, size: 55, weight: 690, accent: 'cyan', start: 84, fromX: -360, fromY: -18},
  {text: 'DATA', x: 1350, y: 674, size: 67, weight: 760, accent: 'cyan', start: 98, fromX: 380, fromY: 0},
  {text: 'GROWTH', x: 630, y: 235, size: 48, weight: 690, rotation: -90, accent: 'silver', start: 112, fromX: 0, fromY: -300},
  {text: 'STRATEGY', x: 1270, y: 354, size: 57, weight: 700, accent: 'silver', start: 126, fromX: 310, fromY: -22},
  {text: 'RESULTS', x: 1690, y: 455, size: 47, weight: 720, rotation: 90, accent: 'cyan', start: 140, fromX: 0, fromY: -310},
  {text: 'KPI', x: 705, y: 420, size: 48, weight: 760, accent: 'blue', start: 154, fromX: -300, fromY: 0},
  {text: 'ANALYTICS', x: 650, y: 798, size: 48, weight: 700, accent: 'cyan', start: 168, fromX: -350, fromY: 36},
  {text: 'TECHNOLOGY', x: 985, y: 803, size: 46, weight: 660, accent: 'silver', start: 182, fromX: 360, fromY: 34},
  {text: 'SUCCESS', x: 1208, y: 750, size: 44, weight: 720, rotation: 90, accent: 'silver', start: 196, fromX: 0, fromY: 330},
  {text: 'INNOVATION', x: 960, y: 230, size: 42, weight: 700, accent: 'cyan', start: 210, fromX: 35, fromY: -320},
  {text: 'PRODUCTIVITY', x: 1275, y: 260, size: 29, weight: 620, accent: 'muted', start: 224, fromX: 300, fromY: -50, tracking: 1.3},
  {text: 'INSIGHT', x: 450, y: 340, size: 32, weight: 690, accent: 'silver', start: 238, fromX: -310, fromY: 0, tracking: 1.0},
  {text: 'VALUE', x: 1530, y: 674, size: 34, weight: 620, accent: 'muted', start: 252, fromX: 300, fromY: 10, tracking: 1.0},
  {text: 'ROI', x: 340, y: 670, size: 34, weight: 760, accent: 'blue', start: 266, fromX: -290, fromY: 0, tracking: 1.2},
  {text: 'QUALITY', x: 330, y: 287, size: 29, weight: 650, accent: 'silver', start: 278, fromX: -270, fromY: -80, tracking: 1.0},
  {text: 'OPTIMIZE', x: 277, y: 535, size: 39, weight: 700, rotation: -90, accent: 'cyan', start: 290, fromX: 0, fromY: 330},
  {text: 'REVENUE', x: 1460, y: 798, size: 41, weight: 700, accent: 'cyan', start: 314, fromX: 340, fromY: 40},
  {text: 'FORECAST', x: 520, y: 888, size: 32, weight: 650, accent: 'silver', start: 326, fromX: -320, fromY: 60, tracking: 1.0},
  {text: 'SCALE', x: 1082, y: 896, size: 38, weight: 720, accent: 'blue', start: 338, fromX: 0, fromY: 280, tracking: 1.0},
  {text: 'MARKET', x: 1515, y: 282, size: 29, weight: 660, accent: 'cyan', start: 350, fromX: 300, fromY: -58, tracking: 1.1},
  {text: 'DECISIONS', x: 810, y: 897, size: 27, weight: 620, accent: 'muted', start: 362, fromX: -250, fromY: 70, tracking: 1.2},
  {text: 'EFFICIENCY', x: 1370, y: 893, size: 29, weight: 640, accent: 'silver', start: 374, fromX: 260, fromY: 68, tracking: 1.1},
  {text: 'CUSTOMER', x: 1638, y: 230, size: 25, weight: 620, accent: 'muted', start: 384, duration: 48, fromX: 270, fromY: -40, tracking: 1.4},
  {text: 'LEADERSHIP', x: 1392, y: 198, size: 25, weight: 640, accent: 'silver', start: 394, duration: 46, fromX: 40, fromY: -250, tracking: 1.2},
  {text: 'OUTCOME', x: 1610, y: 855, size: 28, weight: 680, accent: 'cyan', start: 404, duration: 44, fromX: 270, fromY: 60, tracking: 1.2},
  {text: 'TEAM', x: 300, y: 338, size: 26, weight: 680, accent: 'muted', start: 414, duration: 41.5, fromX: -250, fromY: -40, tracking: 1.4},
];

const WordItem: React.FC<{word: WordSpec; frame: number}> = ({word, frame}) => {
  const duration = word.duration ?? 54;
  const progress = reveal(frame, word.start, word.start + duration, Easing.out(Easing.cubic));
  const trail = triangular(frame, word.start, word.start + duration * 0.42, word.start + duration);
  const x = word.x + word.fromX * (1 - progress);
  const y = word.y + word.fromY * (1 - progress);
  const rotation = word.rotation ?? 0;
  const opacity = (word.opacity ?? 1) * progress;
  const blur = lerp(15, 0, progress);
  const scale = lerp(0.955, 1, progress);
  const echoDistance = Math.max(18, Math.min(64, Math.abs(word.fromX) * 0.14 + Math.abs(word.fromY) * 0.08));

  const textStyle: React.CSSProperties = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: word.size,
    fontWeight: word.weight,
    letterSpacing: word.tracking ?? 0,
    lineHeight: 0.92,
    whiteSpace: 'nowrap',
    color: accentColor[word.accent],
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center',
        opacity,
        filter: blur > 0.05 ? `blur(${blur}px)` : 'none',
        zIndex: word.accent === 'silver' ? 4 : 3,
      }}
    >
      {trail > 0.01 ? (
        <>
          <div
            style={{
              ...textStyle,
              position: 'absolute',
              left: word.fromX === 0 ? 0 : -Math.sign(word.fromX) * echoDistance,
              top: word.fromY === 0 ? 0 : -Math.sign(word.fromY) * echoDistance * 0.65,
              opacity: trail * 0.18,
              filter: 'blur(7px)',
            }}
          >
            {word.text}
          </div>
          <div
            style={{
              ...textStyle,
              position: 'absolute',
              left: word.fromX === 0 ? 0 : -Math.sign(word.fromX) * echoDistance * 0.48,
              top: word.fromY === 0 ? 0 : -Math.sign(word.fromY) * echoDistance * 0.31,
              opacity: trail * 0.26,
              filter: 'blur(3px)',
            }}
          >
            {word.text}
          </div>
        </>
      ) : null}
      <div
        style={{
          ...textStyle,
          position: 'relative',
          textShadow: `0 0 9px ${accentGlow[word.accent]}`,
        }}
      >
        {word.text}
      </div>
    </div>
  );
};

const CentralAnchor: React.FC<{frame: number}> = ({frame}) => {
  const entrance = reveal(frame, 6, 36, Easing.out(Easing.cubic));
  const cloudScale = reveal(frame, 36, 455.5, Easing.inOut(Easing.cubic));
  const trail = triangular(frame, 6, 20, 42);
  const titleScale = lerp(0.84, 1, cloudScale);
  const x = 960 - 760 * (1 - entrance);
  const blur = lerp(19, 0, entrance);
  const bloom = reveal(frame, 72, 456, Easing.out(Easing.quad));

  const textStyle: React.CSSProperties = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 160,
    fontWeight: 790,
    letterSpacing: -3.5,
    lineHeight: 0.88,
    whiteSpace: 'nowrap',
    color: COLORS.silver,
    WebkitTextStroke: '0.6px rgba(255,255,255,0.35)',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 540,
        transform: `translate(-50%, -50%) scale(${titleScale})`,
        transformOrigin: 'center',
        opacity: entrance,
        filter: blur > 0.05 ? `blur(${blur}px)` : 'none',
        zIndex: 10,
      }}
    >
      <div
        style={{
          ...textStyle,
          position: 'absolute',
          left: 0,
          top: 0,
          opacity: 0.18 + bloom * 0.20,
          filter: 'blur(22px)',
          color: '#D9F2FF',
          WebkitTextStroke: 0,
          textShadow: '0 0 50px rgba(69,171,255,0.72)',
        }}
      >
        PERFORMANCE
      </div>
      {trail > 0.01 ? (
        <>
          <div style={{...textStyle, position: 'absolute', left: -92, top: 0, opacity: trail * 0.18, filter: 'blur(8px)'}}>
            PERFORMANCE
          </div>
          <div style={{...textStyle, position: 'absolute', left: -44, top: 0, opacity: trail * 0.25, filter: 'blur(3px)'}}>
            PERFORMANCE
          </div>
        </>
      ) : null}
      <div
        style={{
          ...textStyle,
          position: 'relative',
          textShadow:
            '0 0 8px rgba(255,255,255,0.64), 0 0 24px rgba(71,179,255,0.32)',
        }}
      >
        PERFORMANCE
      </div>
    </div>
  );
};

const FinishingSweep: React.FC<{frame: number}> = ({frame}) => {
  const intensity = triangular(frame, 474, 540, 622);
  const travel = reveal(frame, 474, 622, Easing.inOut(Easing.cubic));
  const x = lerp(-280, 2200, travel);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: 80,
          width: 82,
          height: 920,
          opacity: intensity * 0.18,
          transform: 'skewX(-8deg)',
          filter: 'blur(24px)',
          background:
            'linear-gradient(90deg, transparent, rgba(194,244,255,0.88), rgba(98,185,255,0.55), transparent)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x + 35,
          top: 535,
          width: 8,
          height: 8,
          borderRadius: '50%',
          opacity: intensity,
          background: '#FFFFFF',
          boxShadow:
            '0 0 14px 5px rgba(255,255,255,0.92), 0 0 52px 18px rgba(62,212,255,0.65)',
          mixBlendMode: 'screen',
          zIndex: 21,
        }}
      />
    </>
  );
};

const InnerComposition: React.FC = () => {
  const rawFrame = useCurrentFrame();
  const frame = Math.min(rawFrame, FINAL_MOTION_FRAME);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.background, overflow: 'hidden'}}>
      <PremiumBackground frame={frame} />
      <LightColumns frame={frame} />
      <AtmosphereParticles frame={frame} />
      <MovingGlints frame={frame} />

      <LensFlare frame={frame} x={176} y={540} start={20} color="rgba(80,156,255,0.82)" scale={0.86} />
      <LensFlare frame={frame} x={1748} y={540} start={126} color="rgba(134,91,255,0.80)" scale={0.88} />
      <LensFlare frame={frame} x={960} y={540} start={56} color="rgba(80,218,255,0.68)" scale={0.62} />

      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 118,
          width: 1580,
          height: 820,
          borderRadius: '50%',
          opacity: 0.12 + reveal(frame, 120, 500) * 0.15,
          background:
            'radial-gradient(ellipse at center, rgba(44,123,255,0.15), rgba(92,51,214,0.07) 48%, transparent 72%)',
          filter: 'blur(36px)',
          pointerEvents: 'none',
        }}
      />

      {WORDS.map((word) => (
        <WordItem key={word.text} word={word} frame={frame} />
      ))}
      <CentralAnchor frame={frame} />
      <FinishingSweep frame={frame} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 30,
          boxShadow:
            'inset 0 0 190px rgba(0,0,0,0.62), inset 0 0 38px rgba(4,10,28,0.55)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const {width, height} = useVideoConfig();
  const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.background, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <InnerComposition />
      </div>
    </AbsoluteFill>
  );
};
