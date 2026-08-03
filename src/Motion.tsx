import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';

const SEGMENT_COUNT = 61;
const TRACK_WIDTH = 840;
const TRACK_HEIGHT = 54;

const COMPLETION_FRAME = 420;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const mix = (a: number, b: number, amount: number) =>
  Math.round(a + (b - a) * amount);

const mixRgb = (
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  amount: number,
) =>
  `rgb(${mix(from[0], to[0], amount)}, ${mix(from[1], to[1], amount)}, ${mix(from[2], to[2], amount)})`;

const segmentColor = (index: number) => {
  const position = index / (SEGMENT_COUNT - 1);
  const champagne = [245, 196, 111] as const;
  const coral = [255, 108, 139] as const;
  const violet = [177, 105, 255] as const;

  if (position <= 0.52) {
    return mixRgb(champagne, coral, position / 0.52);
  }

  return mixRgb(coral, violet, (position - 0.52) / 0.48);
};

const StaticBackdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'linear-gradient(132deg, #07070c 0%, #11091a 42%, #080711 74%, #05060a 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          background: [
            'radial-gradient(ellipse 44% 48% at 50% 48%, rgba(151, 80, 183, 0.21) 0%, rgba(98, 50, 139, 0.08) 44%, transparent 76%)',
            'radial-gradient(circle at 78% 24%, rgba(255, 125, 121, 0.10) 0%, transparent 28%)',
            'radial-gradient(circle at 18% 80%, rgba(105, 76, 176, 0.12) 0%, transparent 31%)',
          ].join(', '),
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.3,
          background:
            'linear-gradient(101deg, transparent 0%, rgba(255,255,255,0.016) 35%, transparent 35.18%, transparent 63%, rgba(255,255,255,0.012) 63.12%, transparent 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1180,
          height: 340,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(218, 144, 194, 0.085) 0%, rgba(109, 63, 142, 0.035) 48%, transparent 75%)',
          filter: 'blur(24px)',
        }}
      />

      <AbsoluteFill
        style={{
          boxShadow:
            'inset 0 0 250px rgba(0,0,0,0.73), inset 0 0 70px rgba(0,0,0,0.36)',
        }}
      />
    </AbsoluteFill>
  );
};

const LoadingTrack: React.FC<{progress: number}> = ({progress}) => {
  const segmentProgress = progress * SEGMENT_COUNT;
  const innerWidth = TRACK_WIDTH - 12;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 89,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -24,
          borderRadius: 40,
          background:
            'linear-gradient(90deg, rgba(245,196,111,0.10), rgba(255,108,139,0.12), rgba(177,105,255,0.11))',
          filter: 'blur(25px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(255, 239, 227, 0.68)',
          borderRadius: 14,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.016))',
          boxShadow: [
            'inset 0 0 0 1px rgba(255,255,255,0.045)',
            'inset 0 10px 24px rgba(255,255,255,0.018)',
            '0 0 22px rgba(196,132,233,0.10)',
          ].join(', '),
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 6,
          display: 'grid',
          gridTemplateColumns: `repeat(${SEGMENT_COUNT}, minmax(0, 1fr))`,
          gap: 3,
        }}
      >
        {Array.from({length: SEGMENT_COUNT}, (_, index) => {
          const activation = interpolate(
            segmentProgress,
            [index, index + 1],
            [0, 1],
            clamp,
          );
          const active = activation > 0;
          const leading = activation > 0 && activation < 1;
          const color = segmentColor(index);

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid rgba(244, 232, 255, 0.075)',
                background: 'rgba(235, 224, 255, 0.085)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: -1,
                  borderRadius: 2,
                  transformOrigin: 'left center',
                  transform: `scaleX(${activation})`,
                  background: `linear-gradient(180deg, rgba(255,253,244,0.98) 0%, ${color} 36%, ${color} 100%)`,
                  boxShadow: active ? `inset 0 0 5px rgba(255,255,255,0.28)` : 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 1,
                    right: 1,
                    top: 1,
                    height: '34%',
                    borderRadius: 2,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.74), transparent)',
                  }}
                />
              </div>

              {leading ? (
                <div
                  style={{
                    position: 'absolute',
                    left: `${activation * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    transform: 'translateX(-1px)',
                    background: 'rgba(255,255,255,0.9)',
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {progress > 0 && progress < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 6,
            width: progress * innerWidth,
            height: TRACK_HEIGHT - 12,
            overflow: 'hidden',
            borderRadius: 8,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 46,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,219,198,0.10) 58%, rgba(255,255,255,0.34) 100%)',
              filter: 'blur(2px)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const Interface: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, COMPLETION_FRAME], [0, 1], clamp);
  const complete = frame >= COMPLETION_FRAME;
  const numericProgress = complete ? 100 : Math.min(99, progress * 100);
  const showActiveStatus = frame <= COMPLETION_FRAME;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: TRACK_WIDTH,
        height: 240,
        transform: 'translate(-50%, -50%)',
        color: '#f8f1e8',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -80,
          right: -80,
          top: 50,
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(255,222,206,0.055) 24%, rgba(213,153,240,0.09) 50%, rgba(255,222,206,0.055) 76%, transparent)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 28,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 33,
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: 6.2,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          textShadow: '0 0 18px rgba(230, 181, 219, 0.16)',
        }}
      >
        {complete ? 'UPDATE COMPLETE' : 'SYSTEM UPDATE'}
      </div>

      <LoadingTrack progress={progress} />

      {showActiveStatus ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 174,
            textAlign: 'center',
            fontSize: 12,
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: 3.8,
            color: 'rgba(242, 229, 240, 0.62)',
            textTransform: 'uppercase',
          }}
        >
          Secure sync
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 203,
          textAlign: 'center',
          fontSize: 19,
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: 2.6,
          color: complete ? '#f4c984' : 'rgba(248, 239, 235, 0.88)',
          fontVariantNumeric: 'tabular-nums',
          textShadow: complete
            ? '0 0 16px rgba(244, 201, 132, 0.22)'
            : 'none',
        }}
      >
        {Math.floor(numericProgress)}%
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#07070c'}}>
      <StaticBackdrop />
      <Interface />
    </AbsoluteFill>
  );
};
