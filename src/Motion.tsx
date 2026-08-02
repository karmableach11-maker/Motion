import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FPS = 60;
const DURATION_SECONDS = 15;
const COMPLETION_SECONDS = 12.1;

const COLORS = {
  black: '#010402',
  deepGreen: '#021109',
  glass: '#03130B',
  green: '#00F56A',
  greenBright: '#56FF9A',
  greenWhite: '#D8FFE7',
  emerald: '#00B94F',
  muted: '#0A6635',
};

const HUD = {
  left: 380,
  top: 332,
  width: 1160,
  height: 416,
};

const TRACK = {
  left: 80,
  top: 196,
  width: 1000,
  height: 96,
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

type CurvePoint = readonly [seconds: number, value: number];

const PERCENT_SAMPLES = [
  [0, 0],
  [0.4, 1.7],
  [0.9, 4],
  [1.45, 8.3],
  [2, 13.1],
  [2.5, 17.8],
  [3, 22.2],
  [4.2, 29.8],
  [4.7, 31.5],
  [6, 45.7],
  [7.2, 53.5],
  [8.45, 62.2],
  [9, 71],
  [10.2, 83.2],
  [11.2, 90],
  [11.9, 99],
  [COMPLETION_SECONDS, 100],
] as const satisfies readonly CurvePoint[];

const FILL_SAMPLES = [
  [0, 0],
  [3, 0.172],
  [6, 0.324],
  [9, 0.624],
  [11.9, 0.985],
  [COMPLETION_SECONDS, 1],
] as const satisfies readonly CurvePoint[];

const buildSlopes = (samples: readonly CurvePoint[]) => {
  const widths = Array.from(
    {length: samples.length - 1},
    (_, index) => samples[index + 1][0] - samples[index][0],
  );
  const secants = widths.map(
    (width, index) =>
      (samples[index + 1][1] - samples[index][1]) / width,
  );
  const slopes = Array.from({length: samples.length}, () => 0);
  slopes[0] = secants[0];
  slopes[slopes.length - 1] = secants[secants.length - 1];

  for (let index = 1; index < slopes.length - 1; index++) {
    const before = secants[index - 1];
    const after = secants[index];
    if (before <= 0 || after <= 0) {
      slopes[index] = 0;
      continue;
    }
    const beforeWidth = widths[index - 1];
    const afterWidth = widths[index];
    const weightA = 2 * afterWidth + beforeWidth;
    const weightB = afterWidth + 2 * beforeWidth;
    slopes[index] =
      (weightA + weightB) / (weightA / before + weightB / after);
  }

  return slopes;
};

const PERCENT_SLOPES = buildSlopes(PERCENT_SAMPLES);
const FILL_SLOPES = buildSlopes(FILL_SAMPLES);

const monotoneAt = (
  seconds: number,
  samples: readonly CurvePoint[],
  slopes: readonly number[],
) => {
  if (seconds <= samples[0][0]) return samples[0][1];
  const final = samples[samples.length - 1];
  if (seconds >= final[0]) return final[1];

  let segment = 0;
  while (
    segment < samples.length - 2 &&
    seconds > samples[segment + 1][0]
  ) {
    segment++;
  }

  const [x0, y0] = samples[segment];
  const [x1, y1] = samples[segment + 1];
  const width = x1 - x0;
  const t = clamp((seconds - x0) / width);
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return (
    h00 * y0 +
    h10 * width * slopes[segment] +
    h01 * y1 +
    h11 * width * slopes[segment + 1]
  );
};

// Original, generic data alphabet: hexadecimal characters, operators and
// geometric sigils only. No franchise-specific typography or assets.
const DATA_GLYPHS = '0123456789ABCDEF+-*/=<>[]{}()|:.;_△◇○□⌁⌗';

const hash = (value: number) => {
  let result = value | 0;
  result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
  result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
  return (result ^ (result >>> 16)) >>> 0;
};

const makeGlyphString = (length: number, seed: number) =>
  Array.from({length}, (_, index) => {
    const value = hash(seed + index * 4099);
    return DATA_GLYPHS[value % DATA_GLYPHS.length];
  }).join('\n');

type StreamConfig = {
  x: number;
  speed: number;
  offset: number;
  fontSize: number;
  lineHeight: number;
  opacity: number;
  length: number;
  seed: number;
  accent: boolean;
};

const makeStreams = (
  count: number,
  seed: number,
  minSpeed: number,
  maxSpeed: number,
  minFont: number,
  maxFont: number,
  opacity: number,
): readonly StreamConfig[] =>
  Array.from({length: count}, (_, index) => {
    const a = hash(seed + index * 811);
    const b = hash(seed + index * 2029 + 17);
    const c = hash(seed + index * 4079 + 31);
    const fontSize = minFont + (a % Math.max(1, maxFont - minFont + 1));
    return {
      x: (index + 0.18 + ((b % 65) / 100)) * (1920 / count),
      speed: minSpeed + (c % Math.max(1, maxSpeed - minSpeed + 1)),
      offset: a % 1800,
      fontSize,
      lineHeight: Math.round(fontSize * 1.16),
      opacity: opacity * (0.7 + (b % 31) / 100),
      length: 18 + (c % 23),
      seed: seed + index * 131,
      accent: index % 11 === 3,
    };
  });

const FAR_STREAMS = makeStreams(58, 1307, 42, 86, 13, 18, 0.32);
const MID_STREAMS = makeStreams(42, 7309, 76, 138, 18, 25, 0.58);
const NEAR_STREAMS = makeStreams(24, 19009, 118, 205, 24, 34, 0.78);

const DataStream: React.FC<{frame: number; stream: StreamConfig}> = ({
  frame,
  stream,
}) => {
  const text = makeGlyphString(stream.length, stream.seed);
  const loopHeight = stream.length * stream.lineHeight + 420;
  const travel =
    ((frame * (stream.speed / FPS) + stream.offset) % loopHeight) - 340;
  const pulse = 0.88 + 0.12 * Math.sin(frame * 0.071 + stream.seed * 0.013);
  const gradient = stream.accent
    ? 'linear-gradient(180deg, #F0FFF5 0%, #8CFFB3 6%, #13F071 24%, rgba(0,179,79,0.68) 66%, rgba(0,91,43,0.08) 100%)'
    : 'linear-gradient(180deg, #C9FFDA 0%, #52FF91 7%, #00D864 28%, rgba(0,155,72,0.62) 68%, rgba(0,65,31,0.06) 100%)';

  const renderCopy = (copy: number, top: number) => (
    <div
      key={copy}
      style={{
        position: 'absolute',
        top,
        left: 0,
        whiteSpace: 'pre',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: stream.fontSize,
        fontWeight: stream.accent ? 760 : 560,
        lineHeight: `${stream.lineHeight}px`,
        textAlign: 'center',
        color: 'transparent',
        backgroundImage: gradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        textShadow: stream.accent
          ? '0 0 5px rgba(130,255,174,0.82), 0 0 14px rgba(0,232,104,0.48)'
          : '0 0 4px rgba(0,238,108,0.38)',
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: stream.x,
        top: 0,
        width: stream.fontSize * 1.25,
        height: 1080,
        overflow: 'hidden',
        opacity: stream.opacity * pulse,
        transform: `translate3d(0, ${travel}px, 0)`,
        maskImage:
          'linear-gradient(180deg, transparent 0%, #000 5%, #000 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, transparent 0%, #000 5%, #000 92%, transparent 100%)',
      }}
    >
      {renderCopy(0, -loopHeight)}
      {renderCopy(1, 0)}
      {renderCopy(2, loopHeight)}
    </div>
  );
};

const StreamLayer: React.FC<{
  frame: number;
  streams: readonly StreamConfig[];
  blur: number;
  scale: number;
}> = ({frame, streams, blur, scale}) => (
  <AbsoluteFill
    style={{
      transform: `scale(${scale})`,
      filter: blur > 0 ? `blur(${blur}px)` : undefined,
      transformOrigin: '50% 50%',
    }}
  >
    {streams.map((stream) => (
      <DataStream key={stream.seed} frame={frame} stream={stream} />
    ))}
  </AbsoluteFill>
);

const DigitalRainField: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill
    style={{
      zIndex: 0,
      isolation: 'isolate',
      overflow: 'hidden',
      backgroundColor: COLORS.black,
      backgroundImage: [
        'radial-gradient(ellipse 52% 62% at 50% 50%, rgba(0,245,106,0.105) 0%, rgba(0,94,44,0.045) 46%, transparent 78%)',
        'linear-gradient(115deg, #010403 0%, #021009 48%, #010604 100%)',
      ].join(','),
    }}
  >
    <StreamLayer frame={frame} streams={FAR_STREAMS} blur={0.7} scale={0.99} />
    <StreamLayer frame={frame} streams={MID_STREAMS} blur={0.2} scale={1} />
    <StreamLayer frame={frame} streams={NEAR_STREAMS} blur={0} scale={1.015} />
    <AbsoluteFill
      style={{
        backgroundImage: [
          'linear-gradient(90deg, rgba(0,0,0,0.44) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.42) 100%)',
          'radial-gradient(ellipse 72% 72% at 50% 50%, transparent 40%, rgba(0,0,0,0.52) 100%)',
          'repeating-linear-gradient(180deg, rgba(0,255,112,0.025) 0px, rgba(0,255,112,0.025) 1px, transparent 1px, transparent 4px)',
        ].join(','),
      }}
    />
  </AbsoluteFill>
);

const FillTexture: React.FC<{frame: number}> = ({frame}) => {
  const symbols = '101101  DATA  010011  LINK  111000  ';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity: 0.18,
        color: '#004922',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontWeight: 800,
        fontSize: 13,
        lineHeight: '22px',
        letterSpacing: 2.4,
        transform: `translate3d(${(frame / FPS) * 8}px, ${(frame / FPS) * 3}px, 0)`,
      }}
    >
      {Array.from({length: 7}, (_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: -140 + (index % 2) * 28,
            top: -30 + index * 22,
            whiteSpace: 'nowrap',
          }}
        >
          {symbols.repeat(5)}
        </div>
      ))}
    </div>
  );
};

const HudPanel: React.FC<{
  frame: number;
  percent: number;
  fill: number;
}> = ({frame, percent, fill}) => {
  const fillWidth = TRACK.width * clamp(fill);
  const percentage = `${percent.toFixed(1)}%`;
  const completionFrame = COMPLETION_SECONDS * FPS;
  const completionAge = frame - completionFrame;
  const complete = completionAge >= 0;
  const completionEase = complete
    ? 1 - Math.pow(1 - clamp(completionAge / 24), 3)
    : 0;
  const completionPulse = complete ? clamp(1 - completionAge / 54) : 0;
  const glowBreath = 0.82 + 0.18 * Math.sin(frame * 0.045);
  const scanX = ((frame * 4.2) % (TRACK.width + 180)) - 180;
  const statusLabel = complete ? 'TRANSFER COMPLETE' : 'SECURE DATA TRANSFER';

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        isolation: 'isolate',
        left: HUD.left,
        top: HUD.top,
        width: HUD.width,
        height: HUD.height,
        filter: `drop-shadow(0 0 ${26 + completionPulse * 18}px rgba(0,245,106,${0.18 + completionPulse * 0.22}))`,
      }}
    >
      <svg
        width={HUD.width}
        height={HUD.height}
        viewBox={`0 0 ${HUD.width} ${HUD.height}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id="premiumPanelGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#061B10" stopOpacity="0.96" />
            <stop offset="52%" stopColor="#010704" stopOpacity="0.93" />
            <stop offset="100%" stopColor="#04170D" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="premiumPanelStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00A84B" stopOpacity="0.58" />
            <stop offset="48%" stopColor="#8CFFB6" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#00CB5B" stopOpacity="0.62" />
          </linearGradient>
          <filter id="premiumPanelGlow" x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M31 5 H1129 L1155 31 V385 L1129 411 H31 L5 385 V31 Z"
          fill="url(#premiumPanelGlass)"
          stroke="rgba(0,245,106,0.22)"
          strokeWidth="14"
          filter="url(#premiumPanelGlow)"
        />
        <path
          d="M31 5 H1129 L1155 31 V385 L1129 411 H31 L5 385 V31 Z"
          fill="none"
          stroke="url(#premiumPanelStroke)"
          strokeWidth="3"
        />
        <path
          d="M5 97 V31 L31 5 H236"
          fill="none"
          stroke="rgba(216,255,231,0.62)"
          strokeWidth="2"
        />
        <path
          d="M924 411 H1129 L1155 385 V319"
          fill="none"
          stroke="rgba(86,255,154,0.52)"
          strokeWidth="2"
        />
        <path
          d="M80 163 H1080"
          fill="none"
          stroke="rgba(0,245,106,0.15)"
          strokeWidth="1"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 62,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            borderRadius: '50%',
            background: complete ? COLORS.greenWhite : COLORS.green,
            boxShadow: `0 0 8px rgba(86,255,154,0.95), 0 0 ${18 + completionPulse * 16}px rgba(0,245,106,0.68)`,
            opacity: complete ? 1 : glowBreath,
          }}
        />
        <div
          style={{
            color: complete ? COLORS.greenWhite : COLORS.greenBright,
            fontFamily: 'Arial Narrow, Inter, Arial, sans-serif',
            fontSize: 27,
            lineHeight: 1,
            fontWeight: 760,
            letterSpacing: 4.8,
            textShadow: '0 0 12px rgba(0,245,106,0.52)',
          }}
        >
          {statusLabel}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 113,
          color: 'rgba(153,255,190,0.58)',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 13,
          fontWeight: 650,
          letterSpacing: 2.6,
        }}
      >
        ENCRYPTED CHANNEL&nbsp;&nbsp;•&nbsp;&nbsp;DATA STREAM 04
      </div>

      <div
        style={{
          position: 'absolute',
          right: 78,
          top: 51,
          width: 310,
          textAlign: 'right',
          color: COLORS.greenWhite,
          fontFamily: 'Arial Narrow, Inter, Arial, sans-serif',
          fontSize: 76,
          lineHeight: 1,
          fontWeight: 820,
          letterSpacing: -2.6,
          fontVariantNumeric: 'tabular-nums',
          textShadow: [
            '0 0 7px rgba(216,255,231,0.92)',
            '0 0 22px rgba(0,245,106,0.72)',
            '0 0 48px rgba(0,185,79,0.34)',
          ].join(','),
        }}
      >
        {percentage}
      </div>

      <div
        style={{
          position: 'absolute',
          left: TRACK.left,
          top: TRACK.top,
          width: TRACK.width,
          height: TRACK.height,
          overflow: 'hidden',
          clipPath: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
          background: 'rgba(0,16,8,0.88)',
          border: `2px solid rgba(86,255,154,${0.24 + completionPulse * 0.5})`,
          boxShadow: [
            'inset 0 0 24px rgba(0,0,0,0.82)',
            'inset 0 0 10px rgba(0,245,106,0.10)',
            `0 0 ${18 + completionPulse * 34}px rgba(0,245,106,${0.12 + completionPulse * 0.42})`,
          ].join(','),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: fillWidth,
            height: '100%',
            overflow: 'hidden',
            background: [
              'linear-gradient(180deg, rgba(203,255,222,0.98) 0%, rgba(61,255,132,0.98) 12%, rgba(0,235,98,0.96) 58%, rgba(0,145,62,0.98) 100%)',
              'repeating-linear-gradient(100deg, transparent 0px, transparent 24px, rgba(255,255,255,0.14) 24px, rgba(255,255,255,0.14) 27px)',
            ].join(','),
            boxShadow: [
              '0 0 34px rgba(0,245,106,0.66)',
              '0 0 76px rgba(0,245,106,0.24)',
              'inset 0 3px 1px rgba(255,255,255,0.52)',
              'inset 0 -8px 18px rgba(0,74,31,0.25)',
            ].join(','),
          }}
        >
          <FillTexture frame={frame} />
          <div
            style={{
              position: 'absolute',
              left: scanX,
              top: 0,
              width: 170,
              height: '100%',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(235,255,243,0.03) 28%, rgba(255,255,255,0.42) 50%, rgba(235,255,243,0.03) 72%, transparent 100%)',
              transform: 'skewX(-14deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 3,
              background: 'rgba(236,255,243,0.92)',
              boxShadow: '0 0 14px rgba(216,255,231,0.86)',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: Math.max(0, fillWidth - 6),
            top: 0,
            width: 6,
            height: '100%',
            background: COLORS.greenWhite,
            boxShadow:
              '0 0 10px rgba(216,255,231,0.98), 0 0 30px rgba(0,245,106,0.96), 0 0 58px rgba(0,245,106,0.50)',
            opacity: fillWidth < 8 ? 0 : 1,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(90deg, transparent 0px, transparent 49px, rgba(0,0,0,0.21) 49px, rgba(0,0,0,0.21) 51px)',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: TRACK.left,
          top: 314,
          width: TRACK.width,
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(138,255,179,0.50)',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          fontWeight: 650,
          letterSpacing: 1.4,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {[0, 25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: mark === 0 ? 'flex-start' : mark === 100 ? 'flex-end' : 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 1,
                height: 10,
                background: 'rgba(86,255,154,0.42)',
                boxShadow: '0 0 5px rgba(0,245,106,0.34)',
              }}
            />
            <span>{mark.toString().padStart(3, '0')}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: TRACK.left,
          bottom: 30,
          color: 'rgba(122,255,170,0.42)',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 11,
          fontWeight: 620,
          letterSpacing: 2.2,
        }}
      >
        PACKET INTEGRITY&nbsp;&nbsp;•&nbsp;&nbsp;VERIFIED STREAM
      </div>

      <div
        style={{
          position: 'absolute',
          right: TRACK.left,
          bottom: 30,
          color: complete
            ? `rgba(216,255,231,${0.52 + completionEase * 0.36})`
            : 'rgba(122,255,170,0.42)',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.2,
          textShadow: complete ? '0 0 10px rgba(0,245,106,0.54)' : undefined,
        }}
      >
        {complete ? 'READY FOR DEPLOYMENT' : 'LIVE TRANSFER'}
      </div>

      {complete ? (
        <div
          style={{
            position: 'absolute',
            left: TRACK.left - 8,
            top: TRACK.top - 8,
            width: TRACK.width + 16,
            height: TRACK.height + 16,
            clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)',
            border: '2px solid rgba(216,255,231,0.88)',
            boxShadow:
              '0 0 18px rgba(86,255,154,0.72), inset 0 0 18px rgba(0,245,106,0.26)',
            opacity: completionPulse,
            transform: `scale(${1 + completionEase * 0.018})`,
          }}
        />
      ) : null}
    </div>
  );
};

const Finish: React.FC = () => (
  <AbsoluteFill
    style={{
      zIndex: 20,
      pointerEvents: 'none',
      background: [
        'radial-gradient(ellipse 68% 64% at 52% 52%, transparent 44%, rgba(0,0,0,0.40) 78%, rgba(0,0,0,0.76) 100%)',
        'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 16%, transparent 83%, rgba(0,0,0,0.34) 100%)',
      ].join(','),
    }}
  />
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const percent = monotoneAt(
    Math.min(seconds, COMPLETION_SECONDS),
    PERCENT_SAMPLES,
    PERCENT_SLOPES,
  );
  const fill = monotoneAt(
    Math.min(seconds, COMPLETION_SECONDS),
    FILL_SAMPLES,
    FILL_SLOPES,
  );

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        backgroundColor: COLORS.black,
      }}
    >
      <DigitalRainField frame={frame} />
      <HudPanel frame={frame} percent={percent} fill={fill} />
      <Finish />
    </AbsoluteFill>
  );
};

void DURATION_SECONDS;
