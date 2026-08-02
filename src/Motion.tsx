import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const INK = '#f5f0e7';
const INK_MUTED = '#c9c1b5';
const CHAMPAGNE = '#d7b977';
const VIOLET = '#8f7cff';
const COMPLETE_FRAME = 837;

type OrbSpec = {
  x: number;
  y: number;
  size: number;
  blur: number;
  opacity: number;
  hue: 'violet' | 'champagne' | 'slate';
  driftX: number;
  driftY: number;
  phase: number;
};

type ParticleSpec = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  phase: number;
  depth: number;
};

const ORBS: OrbSpec[] = [
  {x: 9, y: 13, size: 420, blur: 12, opacity: 0.12, hue: 'slate', driftX: 9, driftY: 5, phase: 0.4},
  {x: 29, y: 69, size: 530, blur: 18, opacity: 0.11, hue: 'violet', driftX: -7, driftY: 8, phase: 1.7},
  {x: 53, y: 23, size: 660, blur: 24, opacity: 0.14, hue: 'violet', driftX: 8, driftY: -5, phase: 2.6},
  {x: 75, y: 61, size: 470, blur: 15, opacity: 0.1, hue: 'champagne', driftX: -6, driftY: -7, phase: 4.1},
  {x: 92, y: 18, size: 340, blur: 14, opacity: 0.08, hue: 'slate', driftX: -9, driftY: 4, phase: 5.2},
  {x: 93, y: 87, size: 620, blur: 22, opacity: 0.07, hue: 'violet', driftX: 5, driftY: -8, phase: 0.9},
];

const orbBackground = (hue: OrbSpec['hue']) => {
  if (hue === 'champagne') {
    return 'radial-gradient(circle at 42% 38%, rgba(232,204,146,0.22) 0%, rgba(173,131,66,0.08) 34%, rgba(7,7,10,0) 70%)';
  }
  if (hue === 'slate') {
    return 'radial-gradient(circle at 42% 40%, rgba(147,158,181,0.16) 0%, rgba(59,67,86,0.06) 42%, rgba(7,7,10,0) 72%)';
  }
  return 'radial-gradient(circle at 42% 38%, rgba(133,108,255,0.23) 0%, rgba(72,52,166,0.08) 38%, rgba(7,7,10,0) 72%)';
};

const PremiumBackdrop: React.FC<{frame: number; duration: number}> = ({
  frame,
  duration,
}) => {
  const particles = useMemo<ParticleSpec[]>(() => {
    return Array.from({length: 24}, (_, index) => {
      const x = (index * 41.83 + Math.sin(index * 2.17) * 26 + 100) % 100;
      const y = (index * 67.11 + Math.cos(index * 1.43) * 21 + 100) % 100;
      const radius = 1.8 + ((index * 13) % 31) / 10;
      const alpha = 0.055 + ((index * 17) % 29) / 1000;
      return {
        x,
        y,
        radius,
        alpha,
        phase: index * 0.91,
        depth: 0.55 + (index % 4) * 0.24,
      };
    });
  }, []);

  const time = frame / Math.max(1, duration - 1);
  const orbit = time * Math.PI * 2;
  const gridShift = Math.sin(orbit * 0.72) * 26;
  const sweepProgress = (frame % 510) / 510;
  const sweepX = interpolate(sweepProgress, [0, 1], [-760, 2460], {
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 52% 43%, #151229 0%, #0a0a13 34%, #050507 69%, #030304 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(118deg, rgba(126,103,255,0.035) 0%, rgba(255,255,255,0) 42%, rgba(211,174,105,0.035) 75%, rgba(255,255,255,0) 100%)',
          opacity: 0.85,
          transform: `scale(1.07) translate3d(${Math.sin(orbit * 0.48) * 18}px, ${Math.cos(orbit * 0.41) * 12}px, 0)`,
        }}
      />

      {ORBS.map((orb, index) => {
        const depth = 2.4 + (index % 3) * 0.8;
        const driftX =
          Math.sin(orbit * (0.3 + index * 0.018) + orb.phase) *
          orb.driftX *
          depth;
        const driftY =
          Math.cos(orbit * (0.25 + index * 0.014) + orb.phase) *
          orb.driftY *
          depth;
        const breathe = 0.94 + Math.sin(orbit * 0.46 + orb.phase) * 0.075;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) translate3d(${driftX}px, ${driftY}px, 0) scale(${breathe})`,
              background: orbBackground(orb.hue),
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              boxShadow:
                orb.hue === 'champagne'
                  ? 'inset 0 0 0 1px rgba(225,196,134,0.12)'
                  : 'inset 0 0 0 1px rgba(158,147,255,0.08)',
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(112deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 78px)',
          maskImage:
            'radial-gradient(ellipse at 50% 48%, black 0%, rgba(0,0,0,0.7) 44%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 48%, black 0%, rgba(0,0,0,0.7) 44%, transparent 82%)',
          opacity: 0.55,
          transform: `scale(1.12) translate3d(${gridShift}px, ${-gridShift * 0.24}px, 0)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: sweepX,
          top: -610,
          width: 330,
          height: 2300,
          transform: 'rotate(23deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(146,123,255,0.025) 18%, rgba(190,174,255,0.13) 48%, rgba(239,211,153,0.06) 62%, transparent)',
          filter: 'blur(26px)',
          opacity:
            Math.sin(Math.min(1, sweepProgress * 1.05) * Math.PI) * 0.82,
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: -300 + Math.sin(orbit * 0.52 + 1.2) * 145,
          top: 785 + Math.cos(orbit * 0.38) * 34,
          width: 2520,
          height: 220,
          transform: 'rotate(-8deg)',
          background:
            'radial-gradient(ellipse at center, rgba(116,89,235,0.12), rgba(208,176,108,0.035) 38%, transparent 73%)',
          filter: 'blur(34px)',
          opacity: 0.72,
          mixBlendMode: 'screen',
        }}
      />

      {particles.map((particle, index) => {
        const driftX =
          Math.sin(frame * (0.009 + particle.depth * 0.002) + particle.phase) *
          34 *
          particle.depth;
        const driftY =
          Math.cos(frame * (0.006 + particle.depth * 0.0015) + particle.phase) *
          21 *
          particle.depth;
        const flicker = particle.alpha + Math.sin(frame * 0.045 + particle.phase) * 0.018;
        const particleScale = 0.86 + particle.depth * 0.18;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.radius * 5.2,
              height: particle.radius * 5.2,
              borderRadius: '50%',
              background: index % 9 === 0 ? '#d8c08b' : '#c5c0dc',
              opacity: Math.max(0.01, flicker),
              transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${particleScale})`,
              boxShadow:
                index % 9 === 0
                  ? '0 0 9px rgba(216,192,139,0.15)'
                  : '0 0 7px rgba(166,151,255,0.11)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const EnergyTrails: React.FC<{frame: number; progress: number}> = ({
  frame,
  progress,
}) => {
  const visibleWidth = Math.max(0, progress * 1320);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 92,
        width: visibleWidth,
        height: 83,
        overflow: 'hidden',
        opacity: 0.72,
        maskImage:
          'linear-gradient(90deg, transparent 0%, black 12%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent 0%, black 12%, black 92%, transparent 100%)',
      }}
    >
      {Array.from({length: 6}, (_, index) => {
        const laneY = 7 + index * 13;
        const travel = (frame * (4.2 + index * 0.38) + index * 213) % 1530;
        const length = 80 + (index % 3) * 42;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: travel - 150,
              top: laneY,
              width: length,
              height: index % 2 === 0 ? 2 : 1,
              borderRadius: 999,
              transform: `skewX(-28deg) translateY(${Math.sin(frame * 0.08 + index) * 2}px)`,
              background:
                index % 3 === 0
                  ? 'linear-gradient(90deg, transparent, rgba(242,217,164,0.82), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(164,144,255,0.74), transparent)',
              filter: 'blur(0.5px)',
              boxShadow:
                index % 3 === 0
                  ? '0 0 10px rgba(223,190,122,0.38)'
                  : '0 0 10px rgba(132,107,255,0.34)',
            }}
          />
        );
      })}
    </div>
  );
};

const ProgressRail: React.FC<{
  progress: number;
  frame: number;
  completed: boolean;
}> = ({progress, frame, completed}) => {
  const shimmerX = ((frame * 2.4) % 980) - 210;
  const headPulse = 0.5 + 0.5 * Math.sin(frame * 0.17);
  const completionPulse = completed
    ? interpolate(frame, [COMPLETE_FRAME, COMPLETE_FRAME + 28], [1.45, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 118,
        width: 1320,
        height: 30,
        borderRadius: 2,
        overflow: 'visible',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.045))',
        border: '1px solid rgba(246,238,222,0.24)',
        boxShadow:
          '0 16px 35px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.11), 0 0 42px rgba(116,91,255,0.08)',
        transform: `translateY(${Math.sin(frame * 0.045) * 1.2}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${progress * 100}%`,
          overflow: 'hidden',
          borderRadius: 1,
          background:
            'linear-gradient(90deg, #7464e7 0%, #a38ef8 38%, #d7b977 78%, #f4ead2 100%)',
          boxShadow: `0 0 ${28 * completionPulse}px rgba(159,131,255,0.38), 0 0 ${15 * completionPulse}px rgba(226,196,133,0.35)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: shimmerX,
            top: -22,
            width: 190,
            height: 78,
            transform: 'skewX(-24deg)',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)',
            filter: 'blur(5px)',
            opacity: 0.48,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1,
            height: 3,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.24), rgba(255,255,255,0.66), rgba(255,255,255,0.31))',
            opacity: 0.65,
          }}
        />
      </div>

      {progress > 0.004 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: `${progress * 100}%`,
              top: '50%',
              width: 30,
              height: 30,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) scale(${1 + headPulse * 0.7})`,
              border: '1px solid rgba(243,220,171,0.72)',
              opacity: 0.42 * (1 - headPulse * 0.55),
              boxShadow: '0 0 18px rgba(151,126,255,0.32)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${progress * 100}%`,
              top: '50%',
              width: 6,
              height: 45,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff7e9',
              filter: 'blur(3px)',
              opacity: 0.76,
              boxShadow:
                '0 0 22px rgba(255,240,208,0.86), 0 0 46px rgba(144,119,255,0.48)',
            }}
          />
        </>
      ) : null}
    </div>
  );
};

const UpdateInterface: React.FC<{frame: number; duration: number; fps: number}> = ({
  frame,
  duration,
  fps,
}) => {
  const rawProgress = interpolate(frame, [0, 834], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = Math.min(1, Math.max(0, rawProgress));
  const percent = Math.min(100, Math.round(progress * 100));
  const completed = frame >= COMPLETE_FRAME;
  const dotCount = Math.floor(frame / 18) % 4;
  const dots = '.'.repeat(dotCount);
  const textGlow = 0.32 + Math.sin(frame * 0.026) * 0.025;
  const cycle = frame / Math.max(1, duration - 1);
  const cameraX = Math.sin(cycle * Math.PI * 2 * 0.78 + 0.25) * 24;
  const cameraY = Math.cos(cycle * Math.PI * 2 * 0.62 + 0.9) * 13;
  const cameraScale = 1.012 + Math.sin(cycle * Math.PI * 2 * 0.48) * 0.012;
  const tiltX = -2.2 + Math.sin(cycle * Math.PI * 2 * 0.7) * 0.32;
  const tiltY = -3.8 + Math.cos(cycle * Math.PI * 2 * 0.64) * 0.62;
  const tiltZ = 10.5 + Math.sin(cycle * Math.PI * 2 * 0.56 + 1.2) * 0.32;
  const completionSpring = spring({
    frame: frame - COMPLETE_FRAME,
    fps,
    config: {damping: 13, mass: 0.58, stiffness: 125},
    durationInFrames: 44,
  });
  const completionKick = completed
    ? Math.sin(completionSpring * Math.PI) * 0.017
    : 0;

  const mono =
    '"SFMono-Regular", "Cascadia Mono", "Roboto Mono", "Liberation Mono", ui-monospace, monospace';

  return (
    <div
      style={{
        position: 'absolute',
        left: 235,
        top: 380,
        width: 1320,
        height: 420,
        transformOrigin: '50% 50%',
        transform: `translate3d(${cameraX}px, ${cameraY}px, 0) perspective(2200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${tiltZ}deg) skewX(-1.1deg) scale(${cameraScale + completionKick})`,
        color: INK,
        fontFamily: mono,
        fontWeight: 400,
        letterSpacing: 1.8,
        textRendering: 'geometricPrecision',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 3,
          fontSize: 70,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: INK,
          textShadow: `0 0 17px rgba(211,199,255,${textGlow}), 0 8px 24px rgba(0,0,0,0.48)`,
        }}
      >
        Installing Software Updates
      </div>

      <div
        style={{
          position: 'absolute',
          left: 690,
          top: -67,
          display: 'flex',
          alignItems: 'baseline',
          minWidth: 210,
          fontSize: 52,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: INK_MUTED,
          textShadow: '0 0 15px rgba(154,135,255,0.34)',
        }}
      >
        <span style={{minWidth: 142, textAlign: 'right'}}>{percent}</span>
        <span
          style={{
            marginLeft: 9,
            fontSize: 29,
            color: CHAMPAGNE,
            opacity: 0.94,
          }}
        >
          %
        </span>
      </div>

      <EnergyTrails frame={frame} progress={progress} />
      <ProgressRail progress={progress} frame={frame} completed={completed} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 188,
          width: 1320,
          textAlign: 'center',
          fontSize: 64,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: completed ? '#f5ead0' : INK,
          textShadow: completed
            ? '0 0 18px rgba(218,184,111,0.28), 0 9px 25px rgba(0,0,0,0.46)'
            : '0 0 16px rgba(170,156,255,0.28), 0 9px 25px rgba(0,0,0,0.46)',
        }}
      >
        {completed ? 'Update completed' : 'Updating in progress'}
        <span
          style={{
            display: 'inline-block',
            marginLeft: 20,
            width: 14,
            height: 14,
            borderRadius: '50%',
            verticalAlign: 'middle',
            background: completed ? CHAMPAGNE : VIOLET,
            opacity: 0.46 + Math.sin(frame * 0.12) * 0.25,
            boxShadow: completed
              ? '0 0 18px rgba(215,185,119,0.75)'
              : '0 0 17px rgba(143,124,255,0.75)',
          }}
        />
      </div>

      {!completed ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 278,
            width: 1320,
            textAlign: 'center',
            fontSize: 54,
            lineHeight: 1,
            whiteSpace: 'pre',
            color: '#ded8ce',
            textShadow: '0 0 14px rgba(150,132,255,0.23)',
          }}
        >
          Please wait
          <span
            style={{
              display: 'inline-block',
              width: 92,
              textAlign: 'left',
              color: VIOLET,
              textShadow: '0 0 13px rgba(143,124,255,0.65)',
            }}
          >
            {dots}
          </span>
        </div>
      ) : null}
    </div>
  );
};

const LensFinish: React.FC = () => {
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 49% 48%, transparent 0%, transparent 41%, rgba(0,0,0,0.28) 73%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          boxShadow:
            'inset 0 0 150px rgba(0,0,0,0.48), inset 0 0 380px rgba(0,0,0,0.34)',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.22), transparent 18%, transparent 82%, rgba(0,0,0,0.32))',
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: '#050507', overflow: 'hidden'}}>
      <PremiumBackdrop frame={frame} duration={durationInFrames} />
      <UpdateInterface frame={frame} duration={durationInFrames} fps={fps} />
      <LensFinish />
    </AbsoluteFill>
  );
};
