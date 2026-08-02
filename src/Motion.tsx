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
  left: 645,
  top: 390,
  width: 730,
  height: 360,
};

const TRACK = {
  left: 25,
  top: 132,
  width: 659,
  height: 140,
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

type CurvePoint = readonly [seconds: number, value: number];

const PERCENT_SAMPLES = [
  [0, 1],
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
  [0, 0.0525],
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

const GLYPHS =
  '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-/:;<=>?@[]{}()ΞΛΣΩЖЯ中界数据';

const hash = (value: number) => {
  let result = value | 0;
  result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
  result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
  return (result ^ (result >>> 16)) >>> 0;
};

const makeCodeRows = (count: number, length: number, seed: number) =>
  Array.from({length: count}, (_, row) => {
    let line = '';
    for (let column = 0; column < length; column++) {
      const value = hash(seed + row * 4099 + column * 131);
      const separator = column % 11 === 10 ? ' ' : '';
      line += GLYPHS[value % GLYPHS.length] + separator;
    }
    return line;
  });

const LEFT_ROWS = makeCodeRows(74, 96, 1103);
const CENTER_ROWS = makeCodeRows(62, 94, 7301);
const RIGHT_ROWS = makeCodeRows(52, 72, 19001);

const CodePlane: React.FC<{
  frame: number;
  rows: readonly string[];
  left: number;
  top: number;
  width: number;
  height: number;
  rowHeight: number;
  fontSize: number;
  letterSpacing: number;
  opacity: number;
  transform: string;
  transformOrigin: string;
  speed: number;
  phase: number;
}> = ({
  frame,
  rows,
  left,
  top,
  width,
  height,
  rowHeight,
  fontSize,
  letterSpacing,
  opacity,
  transform,
  transformOrigin,
  speed,
  phase,
}) => {
  const travel = (frame / FPS) * speed;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        overflow: 'hidden',
        transform,
        transformOrigin,
        maskImage:
          'linear-gradient(180deg, transparent 0%, #000 4%, #000 95%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, transparent 0%, #000 4%, #000 95%, transparent 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${travel}px)`,
        }}
      >
        {rows.map((row, index) => {
          const pulse = Math.sin(
            frame * 0.1309 + index * 1.37 + phase * 0.61,
          );
          const redLevel = Math.round(40 + 25 * pulse);
          const greenLevel = Math.round(220 + 25 * pulse);
          const blueLevel = Math.round(95 + 45 * pulse);
          const rowColor =
            index % 9 === 0
              ? `rgb(${Math.min(255, redLevel + 22)}, ${Math.min(
                  255,
                  greenLevel + 18,
                )}, ${Math.min(255, blueLevel + 24)})`
              : `rgb(${redLevel}, ${greenLevel}, ${blueLevel})`;
          const xJitter = ((hash(index * 977 + phase * 31) % 13) - 6) * 2;
          const rowOpacity =
            index % 6 === 0
              ? 0.35 +
                0.65 *
                  (0.5 +
                    0.5 *
                      Math.sin(
                        frame * 0.2618 + index * 0.91 + phase * 0.77,
                      ))
              : 1;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: -180 + xJitter,
                top: -310 + index * rowHeight,
                width: width + 480,
                height: rowHeight,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                color: rowColor,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize,
                fontWeight: index % 7 === 0 ? 600 : 450,
                lineHeight: `${rowHeight}px`,
                letterSpacing,
                opacity: opacity * rowOpacity,
                textShadow: '0 0 3px rgba(0,245,106,0.42)',
                filter: index % 8 === 0 ? 'brightness(1.18)' : undefined,
              }}
            >
              {row}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MatrixCurtain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill
    style={{
      overflow: 'hidden',
      backgroundColor: COLORS.black,
      backgroundImage: [
        'radial-gradient(ellipse 56% 64% at 53% 52%, rgba(0,245,106,0.10) 0%, rgba(0,94,44,0.055) 42%, transparent 76%)',
        'linear-gradient(90deg, #010402 0%, #021008 42%, #010703 100%)',
      ].join(','),
      perspective: 1280,
      perspectiveOrigin: '53% 50%',
    }}
  >
    <CodePlane
      frame={frame}
      rows={LEFT_ROWS}
      left={-395}
      top={-190}
      width={1320}
      height={1480}
      rowHeight={22}
      fontSize={17}
      letterSpacing={2.5}
      opacity={1}
      transform="rotateY(47deg) rotateZ(0.45deg)"
      transformOrigin="94% 50%"
      speed={10.3}
      phase={1}
    />
    <CodePlane
      frame={frame}
      rows={CENTER_ROWS}
      left={325}
      top={-205}
      width={1260}
      height={1500}
      rowHeight={27}
      fontSize={21}
      letterSpacing={3.1}
      opacity={0.94}
      transform="rotateY(17deg) rotateZ(-0.2deg)"
      transformOrigin="68% 50%"
      speed={10.6}
      phase={4}
    />
    <CodePlane
      frame={frame}
      rows={RIGHT_ROWS}
      left={1110}
      top={-220}
      width={1060}
      height={1520}
      rowHeight={35}
      fontSize={29}
      letterSpacing={4.2}
      opacity={1}
      transform="rotateY(-19deg) rotateZ(-0.25deg)"
      transformOrigin="2% 50%"
      speed={10.9}
      phase={8}
    />
    <AbsoluteFill
      style={{
        backgroundImage: [
          'linear-gradient(90deg, rgba(0,0,0,0.48) 0%, transparent 20%, transparent 82%, rgba(0,0,0,0.32) 100%)',
          'radial-gradient(ellipse 72% 72% at 51% 50%, transparent 44%, rgba(0,0,0,0.46) 100%)',
          'repeating-linear-gradient(180deg, rgba(0,255,112,0.022) 0px, rgba(0,255,112,0.022) 1px, transparent 1px, transparent 4px)',
        ].join(','),
      }}
    />
  </AbsoluteFill>
);

const ChevronBracket: React.FC = () => (
  <svg
    width="158"
    height="244"
    viewBox="0 0 158 244"
    style={{
      position: 'absolute',
      left: 493,
      top: 437,
      overflow: 'visible',
      transform: 'rotate(-1deg)',
      filter: 'drop-shadow(0 0 14px rgba(0,245,106,0.25))',
    }}
  >
    <path
      d="M18 122 L72 22 L106 22 L56 122 L106 222 L72 222 Z"
      fill="rgba(0,28,14,0.68)"
      stroke="rgba(0,245,106,0.22)"
      strokeWidth="3"
    />
    <path
      d="M62 122 L111 43 L139 43 L96 122 L139 201 L111 201 Z"
      fill="rgba(0,48,23,0.62)"
      stroke="rgba(86,255,154,0.30)"
      strokeWidth="3"
    />
    <path
      d="M85 122 L112 73 L130 73 L105 122 L130 171 L112 171 Z"
      fill="rgba(0,245,106,0.18)"
    />
  </svg>
);

const FillTexture: React.FC<{frame: number}> = ({frame}) => {
  const symbols = '101101  SYSTEM  DATA  010011  LINK  111000  ';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity: 0.23,
        color: '#003B1B',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontWeight: 800,
        fontSize: 18,
        lineHeight: '28px',
        letterSpacing: 3,
        transform: `translateY(${(frame / FPS) * 5}px)`,
      }}
    >
      {Array.from({length: 8}, (_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: -80 + (index % 2) * 34,
            top: -70 + index * 28,
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

  return (
    <>
      <ChevronBracket />
      <div
        style={{
          position: 'absolute',
          left: HUD.left,
          top: HUD.top,
          width: HUD.width,
          height: HUD.height,
          transform: 'rotate(-1deg)',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(0 0 24px rgba(0,245,106,0.16))',
        }}
      >
        <svg
          width={HUD.width}
          height={HUD.height}
          viewBox={`0 0 ${HUD.width} ${HUD.height}`}
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          <defs>
            <linearGradient id="matrixPanelGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#04170C" stopOpacity="0.88" />
              <stop offset="52%" stopColor="#010905" stopOpacity="0.74" />
              <stop offset="100%" stopColor="#052111" stopOpacity="0.86" />
            </linearGradient>
            <filter id="matrixPanelGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points="4,12 726,2 726,346 4,358"
            fill="url(#matrixPanelGlass)"
            stroke="rgba(0,245,106,0.34)"
            strokeWidth="15"
            filter="url(#matrixPanelGlow)"
          />
          <polygon
            points="4,12 726,2 726,346 4,358"
            fill="none"
            stroke={COLORS.greenBright}
            strokeWidth="5"
          />
          <path
            d="M26 31 L198 28"
            fill="none"
            stroke="rgba(216,255,231,0.42)"
            strokeWidth="2"
          />
          <path
            d="M529 344 L704 341"
            fill="none"
            stroke="rgba(0,245,106,0.46)"
            strokeWidth="2"
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            left: TRACK.left,
            top: TRACK.top,
            width: TRACK.width,
            height: TRACK.height,
            overflow: 'hidden',
            clipPath: 'polygon(0 4%, 100% 0, 100% 96%, 0 100%)',
            background: 'rgba(0,37,18,0.38)',
            borderTop: '2px solid rgba(86,255,154,0.12)',
            borderBottom: '2px solid rgba(0,245,106,0.18)',
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
                'linear-gradient(180deg, rgba(216,255,231,0.96) 0%, rgba(86,255,154,0.96) 12%, rgba(0,245,106,0.92) 62%, rgba(0,185,79,0.94) 100%)',
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 22px)',
              ].join(','),
              boxShadow: [
                '0 0 36px rgba(0,245,106,0.72)',
                '0 0 78px rgba(0,245,106,0.30)',
                'inset 0 3px 1px rgba(255,255,255,0.46)',
              ].join(','),
            }}
          >
            <FillTexture frame={frame} />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 3,
                background: 'rgba(235,255,243,0.84)',
                boxShadow: '0 0 14px rgba(216,255,231,0.9)',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: Math.max(0, fillWidth - 7),
              top: 0,
              width: 7,
              height: '100%',
              background: 'rgba(216,255,231,0.82)',
              boxShadow: '0 0 20px rgba(86,255,154,0.92)',
              opacity: fillWidth < 10 ? 0 : 1,
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 57,
            width: 630,
            textAlign: 'center',
            color: COLORS.greenBright,
            fontFamily: 'Arial Narrow, Inter, Arial, sans-serif',
            fontSize: 29,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: 2.2,
            textShadow: [
              '0 0 6px rgba(86,255,154,0.82)',
              '0 0 18px rgba(0,245,106,0.46)',
            ].join(','),
          }}
        >
          DOWNLOADING
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 172,
            width: 630,
            textAlign: 'center',
            color: COLORS.greenWhite,
            fontFamily: 'Arial Narrow, Inter, Arial, sans-serif',
            fontSize: 59,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: -1.6,
            fontVariantNumeric: 'tabular-nums',
            textShadow: [
              '0 0 6px rgba(216,255,231,0.96)',
              '0 0 18px rgba(0,245,106,0.82)',
              '0 0 42px rgba(0,185,79,0.52)',
            ].join(','),
          }}
        >
          {percentage}
        </div>
      </div>
    </>
  );
};

const Finish: React.FC = () => (
  <AbsoluteFill
    style={{
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
      <MatrixCurtain frame={frame} />
      <HudPanel frame={frame} percent={percent} fill={fill} />
      <Finish />
    </AbsoluteFill>
  );
};

void DURATION_SECONDS;
