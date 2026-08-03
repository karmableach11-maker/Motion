import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;

const BAR_X = 350;
const BAR_Y = 566;
const BAR_WIDTH = 1220;
const BAR_HEIGHT = 122;
const INNER_X = 370;
const INNER_Y = 592;
const INNER_WIDTH = 1180;
const INNER_HEIGHT = 70;
const BAR_CENTER_Y = INNER_Y + INNER_HEIGHT / 2;
const ENDPOINT_X = INNER_X + INNER_WIDTH;

const FILL_END = 540;
const IGNITION_END = 585;
const BURST_PEAK = 694;

const FONT =
  '"Helvetica Neue", "Liberation Sans", Arial, ui-sans-serif, sans-serif';

const GOLD = ['#E89520', '#F7B42C', '#FFD65E', '#FFECA0', '#FFF8D7'];

const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value: number): number => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const fixed = (value: number): string => value.toFixed(2);

const circleSubpath = (x: number, y: number, radius: number): string => {
  const r = Math.max(0.24, radius);
  return (
    'M ' +
    fixed(x - r) +
    ' ' +
    fixed(y) +
    ' a ' +
    fixed(r) +
    ' ' +
    fixed(r) +
    ' 0 1 0 ' +
    fixed(r * 2) +
    ' 0 a ' +
    fixed(r) +
    ' ' +
    fixed(r) +
    ' 0 1 0 ' +
    fixed(-r * 2) +
    ' 0'
  );
};

const OPACITY_BUCKETS = 5;

const getOpacityBucket = (opacity: number): number =>
  Math.min(
    OPACITY_BUCKETS - 1,
    Math.max(0, Math.floor(clamp(opacity) * OPACITY_BUCKETS)),
  );

const getBucketOpacity = (bucket: number): number =>
  (bucket + 0.58) / OPACITY_BUCKETS;

const createRng = (initialSeed: number): (() => number) => {
  let seed = initialSeed | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

type HeadSpark = {
  xOffset: number;
  yOffset: number;
  drift: number;
  phase: number;
  size: number;
  opacity: number;
  speed: number;
  color: string;
};

const headRng = createRng(9443);
const HEAD_SPARKS: HeadSpark[] = Array.from({length: 42}, () => ({
  xOffset: -18 - Math.pow(headRng(), 0.7) * 170,
  yOffset: (headRng() - 0.5) * 116,
  drift: 7 + headRng() * 34,
  phase: headRng() * Math.PI * 2,
  size: 1.4 + Math.pow(headRng(), 2) * 5.8,
  opacity: 0.28 + headRng() * 0.7,
  speed: 0.9 + headRng() * 2.4,
  color: GOLD[Math.floor(headRng() * GOLD.length)],
}));



const buildStarTile = (
  seed: number,
  count: number,
  energetic: boolean,
): string => {
  const rng = createRng(seed);
  const tileWidth = energetic ? 320 : 300;
  const tileHeight = energetic ? 260 : 240;
  let body = '';

  for (let index = 0; index < count; index++) {
    const x = rng() * tileWidth;
    const y = rng() * tileHeight;
    const radius =
      (energetic ? 0.9 : 0.48) +
      Math.pow(rng(), 1.8) * (energetic ? 4.8 : 1.95);
    const color = GOLD[Math.floor(rng() * GOLD.length)];
    const opacity = (energetic ? 0.34 : 0.26) + rng() * 0.66;
    body +=
      '<circle cx="' +
      fixed(x) +
      '" cy="' +
      fixed(y) +
      '" r="' +
      fixed(radius) +
      '" fill="' +
      color +
      '" opacity="' +
      opacity.toFixed(3) +
      '"/>';

    if (energetic && index % 3 === 0) {
      body +=
        '<circle cx="' +
        fixed(x) +
        '" cy="' +
        fixed(y) +
        '" r="' +
        fixed(radius * 2.45) +
        '" fill="' +
        color +
        '" opacity="' +
        (opacity * 0.115).toFixed(3) +
        '"/>';
    }

  }

  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        tileWidth +
        ' ' +
        tileHeight +
        '">' +
        body +
        '</svg>',
    )
  );
};

const AMBIENT_STAR_TILES = [
  buildStarTile(4117, 178, false),
  buildStarTile(8459, 164, false),
  buildStarTile(17021, 96, false),
  buildStarTile(26839, 76, false),
];

const BURST_STAR_TILES = [
  buildStarTile(3907, 270, true),
  buildStarTile(12211, 282, true),
  buildStarTile(23131, 76, true),
  buildStarTile(40193, 72, true),
];

const getProgress = (frame: number): number =>
  interpolate(frame, [0, FILL_END], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Backdrop: React.FC<{frame: number}> = ({frame}) => {
  const completionLight = interpolate(
    frame,
    [FILL_END, IGNITION_END, BURST_PEAK, 899],
    [0, 0.56, 0.34, 0.09],
    {
      easing: Easing.inOut(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 78% 92% at 50% 9%, #213142 0%, #111F2B 22%, #07131C 58%, #030A10 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.78,
          background:
            'linear-gradient(112deg, rgba(65,87,105,0.14) 0%, transparent 26%, transparent 70%, rgba(14,34,45,0.20) 100%), radial-gradient(ellipse 58% 34% at 51% 52%, rgba(18,42,55,0.28) 0%, transparent 75%), radial-gradient(ellipse 60% 28% at 50% 58%, rgba(201,119,24,0.10) 0%, transparent 76%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: completionLight,
          background:
            'radial-gradient(circle 28% at 81% 58%, rgba(255,185,54,0.46) 0%, rgba(244,136,27,0.16) 36%, transparent 78%)',
        }}
      />
    </>
  );
};

const AmbientVortex: React.FC<{
  frame: number;
  fps: number;
  front: boolean;
}> = ({frame, fps, front}) => {
  const time = frame / fps;
  const burstLift = interpolate(
    frame,
    [FILL_END, BURST_PEAK, 899],
    [0, 0.085, 0.035],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const tiles = front
    ? AMBIENT_STAR_TILES.slice(2, 4)
    : AMBIENT_STAR_TILES.slice(0, 2);

  return (
    <>
      {tiles.map((tile, index) => {
        const phase = index * 2.17 + (front ? 0.85 : 0);
        const depth = front ? 1.22 : 0.82;
        const x =
          Math.sin(time * (0.48 + index * 0.07) + phase) *
          (18 + index * 7) *
          depth;
        const y =
          Math.cos(time * (0.37 + index * 0.055) + phase) *
          (9 + index * 4.5) *
          depth;
        const rotation =
          Math.sin(time * (0.31 + index * 0.055) + phase) *
            (1.35 + index * 0.5) +
          (front ? 1 : -1) * time * (0.08 + index * 0.025);
        const scale =
          1 +
          burstLift * (0.16 + index * 0.045) +
          Math.sin(time * 0.22 + phase) * (front ? 0.009 : 0.006);
        const opacity = clamp(
          (front ? 0.56 : 0.82) *
            (0.86 + 0.14 * Math.sin(time * (1.18 + index * 0.21) + phase)),
        );

        return (
          <AbsoluteFill
            key={(front ? 'front-' : 'back-') + index}
            style={{
              backgroundImage: 'url("' + tile + '")',
              backgroundRepeat: 'repeat',
              backgroundSize:
                300 + index * 27 + 'px ' + (240 + index * 19) + 'px',
              backgroundPosition:
                index * 71 + (front ? 37 : 0) + 'px ' +
                (index * 43 + (front ? 19 : 0)) + 'px',
              mixBlendMode: 'screen',
              clipPath:
                front
                  ? index === 0
                    ? 'ellipse(46% 28% at 50% 58%)'
                    : 'ellipse(49% 31% at 50% 58%)'
                  : index === 1
                    ? 'ellipse(44% 25% at 50% 58%)'
                    : 'ellipse(49% 32% at 50% 58%)',
              transformOrigin: '50% 58%',
              transform:
                'translate(' +
                x.toFixed(2) +
                'px, ' +
                y.toFixed(2) +
                'px) rotate(' +
                rotation.toFixed(3) +
                'deg) scale(' +
                scale.toFixed(4) +
                ')',
              opacity,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

const HeadSparkles: React.FC<{
  frame: number;
  fps: number;
  headX: number;
}> = ({frame, fps, headX}) => {
  const time = frame / fps;
  const fade = interpolate(frame, [FILL_END, IGNITION_END + 50], [1, 0.16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const dotPaths = Array.from(
    {length: GOLD.length * OPACITY_BUCKETS},
    () => [] as string[],
  );
  const haloPaths = Array.from({length: GOLD.length}, () => [] as string[]);

  HEAD_SPARKS.forEach((spark) => {
    const travel = ((time * spark.speed * 44 + spark.phase * 19) % 86) - 43;
    const x =
      headX +
      spark.xOffset +
      travel +
      Math.sin(time * spark.speed + spark.phase) * spark.drift * 0.2;
    const y =
      BAR_CENTER_Y +
      spark.yOffset +
      Math.cos(time * spark.speed * 1.3 + spark.phase) * 10;
    const pulse =
      0.42 +
      0.58 *
        Math.pow(0.5 + 0.5 * Math.sin(time * 5.1 + spark.phase), 4);
    const opacity = spark.opacity * pulse;
    const colorIndex = Math.max(0, GOLD.indexOf(spark.color));
    dotPaths[colorIndex * OPACITY_BUCKETS + getOpacityBucket(opacity)].push(
      circleSubpath(x, y, spark.size),
    );
    if (spark.size > 4) {
      haloPaths[colorIndex].push(circleSubpath(x, y, spark.size * 2.3));
    }
  });

  return (
    <g style={{mixBlendMode: 'screen'}} opacity={fade}>
      {haloPaths.map((parts, colorIndex) =>
        parts.length ? (
          <path
            key={'head-halo-' + colorIndex}
            d={parts.join(' ')}
            fill={GOLD[colorIndex]}
            opacity={0.11}
          />
        ) : null,
      )}
      {dotPaths.map((parts, bucketIndex) =>
        parts.length ? (
          <path
            key={'head-dot-' + bucketIndex}
            d={parts.join(' ')}
            fill={GOLD[Math.floor(bucketIndex / OPACITY_BUCKETS)]}
            opacity={getBucketOpacity(bucketIndex % OPACITY_BUCKETS)}
          />
        ) : null,
      )}
    </g>
  );
};

const ProgressCapsule: React.FC<{
  frame: number;
  fps: number;
  progress: number;
}> = ({frame, fps, progress}) => {
  const fillWidth = INNER_WIDTH * progress;
  const headX = INNER_X + fillWidth;
  const time = frame / fps;
  const headPulse =
    0.86 + 0.14 * Math.sin(time * 4.2) + 0.08 * Math.sin(time * 9.7);
  const trackPulse = 0.78 + 0.12 * Math.sin(time * 1.8);
  const postDim = interpolate(
    frame,
    [IGNITION_END, BURST_PEAK, 899],
    [0, 0.36, 0.72],
    {
      easing: Easing.inOut(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const headVisibility = interpolate(
    frame,
    [FILL_END, IGNITION_END, BURST_PEAK],
    [1, 0.62, 0],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT}
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="track-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE49A" />
          <stop offset="18%" stopColor="#F4B63C" />
          <stop offset="51%" stopColor="#7A4316" />
          <stop offset="78%" stopColor="#E49B2B" />
          <stop offset="100%" stopColor="#FFF0A8" />
        </linearGradient>
        <linearGradient id="track-cavity" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#251B14" stopOpacity="0.84" />
          <stop offset="46%" stopColor="#392010" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#0E1112" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient
          id="fill-gold"
          gradientUnits="userSpaceOnUse"
          x1={INNER_X}
          x2={headX}
          y1={0}
          y2={0}
        >
          <stop offset="0%" stopColor="#F6A51C" />
          <stop offset="34%" stopColor="#FFC93B" />
          <stop offset="68%" stopColor="#FFE068" />
          <stop offset="91%" stopColor="#FFF1A0" />
          <stop offset="100%" stopColor="#FFFCE0" />
        </linearGradient>
        <clipPath id="fill-clip">
          <rect
            x={INNER_X}
            y={INNER_Y}
            width={Math.max(0, fillWidth)}
            height={INNER_HEIGHT}
            rx={INNER_HEIGHT / 2}
          />
        </clipPath>
        <radialGradient id="head-core">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFF9CC" stopOpacity="0.98" />
          <stop offset="60%" stopColor="#FFD34B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E98C14" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect
        x={BAR_X - 14}
        y={BAR_Y - 14}
        width={BAR_WIDTH + 28}
        height={BAR_HEIGHT + 28}
        rx={(BAR_HEIGHT + 28) / 2}
        fill="none"
        stroke="#E48C20"
        strokeWidth={12}
        opacity={0.08 * trackPulse}
      />
      <rect
        x={BAR_X - 7}
        y={BAR_Y - 7}
        width={BAR_WIDTH + 14}
        height={BAR_HEIGHT + 14}
        rx={(BAR_HEIGHT + 14) / 2}
        fill="none"
        stroke="#FFB52E"
        strokeWidth={9}
        opacity={0.17 * trackPulse}
      />
      <rect
        x={BAR_X}
        y={BAR_Y}
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        rx={BAR_HEIGHT / 2}
        fill="#120F0D"
        fillOpacity={0.9}
        stroke="url(#track-gold)"
        strokeWidth={11}
      />
      <rect
        x={BAR_X + 12}
        y={BAR_Y + 12}
        width={BAR_WIDTH - 24}
        height={BAR_HEIGHT - 24}
        rx={(BAR_HEIGHT - 24) / 2}
        fill="url(#track-cavity)"
        stroke="#4B260F"
        strokeWidth={4}
      />

      <g clipPath="url(#fill-clip)">
        <rect
          x={INNER_X}
          y={INNER_Y}
          width={fillWidth}
          height={INNER_HEIGHT}
          rx={INNER_HEIGHT / 2}
          fill="url(#fill-gold)"
        />
        <rect
          x={INNER_X}
          y={INNER_Y}
          width={fillWidth}
          height={INNER_HEIGHT}
          rx={INNER_HEIGHT / 2}
          fill="#7C3C0B"
          opacity={postDim * 0.58}
        />
        <ellipse
          cx={headX - 10}
          cy={BAR_CENTER_Y}
          rx={82 * headPulse}
          ry={54 * headPulse}
          fill="url(#head-core)"
          opacity={0.8 * headVisibility}
        />
      </g>

      <ellipse
        cx={headX}
        cy={BAR_CENTER_Y}
        rx={104 * headPulse}
        ry={76 * headPulse}
        fill="url(#head-core)"
        opacity={0.28 * headVisibility}
        style={{mixBlendMode: 'screen'}}
      />
      <HeadSparkles frame={frame} fps={fps} headX={headX} />
    </svg>
  );
};

const LoadingTitle: React.FC<{frame: number; fps: number}> = ({
  frame,
  fps,
}) => {
  const time = frame / fps;
  const glow =
    0.84 + 0.08 * Math.sin(time * 2.2) + 0.05 * Math.sin(time * 8.4);

  return (
    <div
      style={{
        position: 'absolute',
        top: 300,
        left: 0,
        width: WIDTH,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 116,
        fontWeight: 300,
        letterSpacing: 7.5,
        lineHeight: 1,
        color: '#FFEBA6',
        transform: 'scaleX(1.06)',
        transformOrigin: '50% 50%',
        textShadow:
          '0 0 3px #FFF7D5, 0 0 10px rgba(255,220,109,0.98), 0 0 28px rgba(255,174,38,0.72), 0 0 58px rgba(231,124,20,0.32)',
        opacity: glow,
        whiteSpace: 'nowrap',
      }}
    >
      LOADING
    </div>
  );
};


const EndpointFlare: React.FC<{frame: number; fps: number}> = ({
  frame,
  fps,
}) => {
  const time = frame / fps;
  const ignition = interpolate(
    frame,
    [FILL_END, FILL_END + 4, FILL_END + 18, IGNITION_END],
    [0.18, 0.5, 0.88, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const decay = interpolate(frame, [BURST_PEAK, 805, 899], [1, 0.34, 0.09], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const strength = ignition * decay;
  const pulse = 0.92 + 0.08 * Math.sin(time * 13.2);

  if (strength <= 0.001) {
    return null;
  }

  const rayScale = interpolate(
    frame,
    [FILL_END, IGNITION_END, BURST_PEAK],
    [0.08, 0.48, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible',
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="completion-core">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="18%" stopColor="#FFF7C4" stopOpacity="0.98" />
          <stop offset="48%" stopColor="#FFD14A" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#E88918" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={ENDPOINT_X}
        cy={BAR_CENTER_Y}
        rx={(120 + 250 * rayScale) * pulse}
        ry={(72 + 156 * rayScale) * pulse}
        fill="url(#completion-core)"
        opacity={strength * 0.58}
      />
      <circle
        cx={ENDPOINT_X}
        cy={BAR_CENTER_Y}
        r={(38 + 104 * rayScale) * pulse}
        fill="url(#completion-core)"
        opacity={strength}
      />
    </svg>
  );
};

const BurstParticles: React.FC<{frame: number; fps: number}> = ({
  frame,
  fps,
}) => {
  const time = frame / fps;

  if (frame < FILL_END) {
    return null;
  }

  return (
    <>
      {BURST_STAR_TILES.slice(0, 2).map((tile, index) => {
        const start = [FILL_END, FILL_END + 2][index];
        const expand = interpolate(
          frame,
          [start, start + 8, start + 70, 899],
          [0.06, 0.3, 1, 1.18 + index * 0.018],
          {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );
        const appear = smoothstep((frame - start + 2) / 6);
        const decay = interpolate(frame, [710, 899], [1, 0.62], {
          easing: Easing.inOut(Easing.quad),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const rotation =
          (index === 0 ? -5.2 : 6.8) +
          Math.sin(time * (0.31 + index * 0.025) + index * 0.91) * 1.8;
        const plumeDrift = interpolate(
          frame,
          [start, start + 92, 899],
          [0, 14 + index * 8, 45 + index * 15],
          {
            easing: Easing.out(Easing.quad),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );
        const plumeLift = interpolate(
          frame,
          [start, BURST_PEAK, 899],
          [0, index === 0 ? -22 : 18, index === 0 ? -58 : 42],
          {
            easing: Easing.inOut(Easing.quad),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );
        const plumeWidth = index === 0 ? 600 : 520;
        const plumeHeight = index === 0 ? 1420 : 1660;
        const anchorInset = index === 0 ? 86 : 52;
        const textureAge = Math.max(0, frame - start);
        const textureX =
          index * 83 + textureAge * (index === 0 ? 0.9 : 0.64);
        const textureY =
          index * 57 + 23 + textureAge * (index === 0 ? -0.46 : 0.6);

        return (
          <div
            key={'burst-texture-' + index}
            style={{
              position: 'absolute',
              left: ENDPOINT_X - anchorInset,
              top: BAR_CENTER_Y - plumeHeight / 2,
              width: plumeWidth,
              height: plumeHeight,
              borderRadius: '50%',
              backgroundImage: 'url("' + tile + '")',
              backgroundRepeat: 'repeat',
              backgroundSize:
                320 + index * 29 + 'px ' + (260 + index * 23) + 'px',
              backgroundPosition:
                textureX.toFixed(2) + 'px ' + textureY.toFixed(2) + 'px',
              mixBlendMode: 'screen',
              overflow: 'hidden',
              transformOrigin: anchorInset + 'px 50%',
              transform:
                'translate(' +
                plumeDrift.toFixed(2) +
                'px, ' +
                plumeLift.toFixed(2) +
                'px) rotate(' +
                rotation.toFixed(3) +
                'deg) scale(' +
                expand.toFixed(4) +
                ')',
              opacity: appear * decay,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

const OpticalFinishing: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.22,
        background:
          'linear-gradient(180deg, rgba(91,119,139,0.10) 0%, transparent 25%, transparent 76%, rgba(0,0,0,0.24) 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 78% 82% at 50% 50%, transparent 42%, rgba(0,4,8,0.16) 72%, rgba(0,3,7,0.68) 100%)',
      }}
    />
  </>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const safeFrame = Math.min(frame, durationInFrames - 1);
  const progress = getProgress(safeFrame);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#030A10',
      }}
    >
      <Backdrop frame={safeFrame} />
      <AmbientVortex frame={safeFrame} fps={fps} front={false} />
      <ProgressCapsule frame={safeFrame} fps={fps} progress={progress} />
      <LoadingTitle frame={safeFrame} fps={fps} />
      <AmbientVortex frame={safeFrame} fps={fps} front />
      <EndpointFlare frame={safeFrame} fps={fps} />
      <BurstParticles frame={safeFrame} fps={fps} />
      <OpticalFinishing />
    </AbsoluteFill>
  );
};
