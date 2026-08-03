import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const SOURCE_DURATION = 10.043367;
const READOUT_COMPLETE_TIME = 5.56;
const FILL_COMPLETE_TIME = 5.767;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const sigmoid = (time: number, center: number, steepness: number): number =>
  1 / (1 + Math.exp(-steepness * (time - center)));

const normalizedSigmoid = (
  time: number,
  center: number,
  steepness: number,
  endTime: number,
): number => {
  const start = sigmoid(0, center, steepness);
  const end = sigmoid(endTime, center, steepness);
  return clamp01((sigmoid(time, center, steepness) - start) / (end - start));
};

const StaticBackdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'linear-gradient(118deg, #030207 0%, #080310 28%, #10051D 57%, #08030F 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 66% 46% at 50% 52%, rgba(134, 39, 218, 0.19) 0%, rgba(79, 18, 132, 0.09) 42%, rgba(8, 3, 15, 0) 76%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.24,
          backgroundImage:
            'repeating-linear-gradient(118deg, rgba(255,255,255,0.020) 0px, rgba(255,255,255,0.020) 1px, transparent 1px, transparent 9px)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.018) 0%, transparent 23%, transparent 76%, rgba(0,0,0,0.34) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 68% at center, transparent 36%, rgba(0,0,0,0.28) 74%, rgba(0,0,0,0.78) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const StaticBloom: React.FC = () => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 540,
          width: 1510,
          height: 430,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(255, 50, 174, 0.22) 0%, rgba(166, 54, 255, 0.16) 29%, rgba(96, 24, 171, 0.07) 52%, transparent 74%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 532,
          width: 1190,
          height: 190,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(255, 94, 203, 0.18) 0%, rgba(186, 72, 255, 0.10) 44%, transparent 76%)',
        }}
      />
    </>
  );
};

type CapsuleProps = {
  fillProgress: number;
  sourceTime: number;
};

const NeonCapsule: React.FC<CapsuleProps> = ({fillProgress, sourceTime}) => {
  const trackWidth = 1060;
  const trackHeight = 64;
  const inset = 8;
  const innerWidth = trackWidth - inset * 2;
  const innerHeight = trackHeight - inset * 2;
  const fillWidth = innerHeight + fillProgress * (innerWidth - innerHeight);
  const coreActivation = clamp01(sourceTime / 0.24);
  const fillOpacity = 0.32 + coreActivation * 0.68;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 508,
        width: trackWidth,
        height: trackHeight,
        transform: 'translateX(-50%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -84,
          right: -84,
          top: -48,
          bottom: -48,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(255,68,184,0.30) 0%, rgba(167,59,255,0.17) 38%, rgba(106,35,190,0.06) 58%, transparent 74%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          padding: 3,
          background:
            'linear-gradient(100deg, #8B5CFF 0%, #E767FF 42%, #FF4BAE 72%, #FFB0DA 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 3,
            borderRadius: 999,
            overflow: 'hidden',
            background:
              'linear-gradient(180deg, rgba(8,3,18,0.94) 0%, rgba(24,7,38,0.88) 50%, rgba(6,2,14,0.96) 100%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: inset - 3,
              top: inset - 3,
              width: fillWidth,
              height: innerHeight,
              borderRadius: 999,
              opacity: fillOpacity,
              background:
                'linear-gradient(90deg, #FFF8FF 0%, #FDEBFF 40%, #FFE0F3 72%, #FFFFFF 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '3px 5px auto 5px',
                height: 9,
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.92), rgba(255,255,255,0.38))',
                filter: 'blur(1px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -3,
                top: -9,
                width: 72,
                height: 66,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,220,246,0.86) 30%, rgba(255,75,183,0.26) 65%, transparent 78%)',
                opacity: 0.18,
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.25)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          top: 8,
          height: 2,
          borderRadius: 999,
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.72), rgba(255,211,245,0.34), transparent)',
          opacity: 0.72,
        }}
      />
    </div>
  );
};

const PercentageReadout: React.FC<{value: number}> = ({value}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 388,
        height: 92,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFF7FC',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 76,
        lineHeight: 1,
        fontWeight: 760,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.018em',
        textShadow: '0 0 5px rgba(255,255,255,0.86), 0 0 18px rgba(255,92,205,0.66)',
      }}
    >
      {value}%
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const sourceTime = (frame / Math.max(1, durationInFrames - 1)) * SOURCE_DURATION;

  const readoutRaw = sigmoid(sourceTime, 2.95, 1.8);
  const readout =
    sourceTime >= READOUT_COMPLETE_TIME
      ? 100
      : sourceTime < 0.5
        ? 0
        : Math.min(99, Math.floor(readoutRaw * 100));

  const fillProgress =
    sourceTime >= FILL_COMPLETE_TIME
      ? 1
      : normalizedSigmoid(sourceTime, 3.35, 2, FILL_COMPLETE_TIME);

  return (
    <AbsoluteFill>
      <StaticBackdrop />
      <StaticBloom />
      <NeonCapsule fillProgress={fillProgress} sourceTime={sourceTime} />
      <PercentageReadout value={readout} />
    </AbsoluteFill>
  );
};
