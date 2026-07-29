import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

type PillarSpec = {
  x: number;
  height: number;
  start: number;
  hue: string;
  bright: string;
  deep: string;
};

const BASELINE = 800;
const PILLAR_WIDTH = 112;

const PILLARS: readonly PillarSpec[] = [
  {
    x: 316,
    height: 138,
    start: 104,
    hue: "#7868ff",
    bright: "#c8c2ff",
    deep: "#4932cf",
  },
  {
    x: 538,
    height: 205,
    start: 190,
    hue: "#4b91ff",
    bright: "#b9dcff",
    deep: "#1762d0",
  },
  {
    x: 760,
    height: 280,
    start: 276,
    hue: "#25c9e8",
    bright: "#bdf8ff",
    deep: "#0783ac",
  },
  {
    x: 982,
    height: 357,
    start: 362,
    hue: "#30e0b1",
    bright: "#c7ffe9",
    deep: "#079875",
  },
  {
    x: 1204,
    height: 438,
    start: 448,
    hue: "#91e86b",
    bright: "#e7ffd5",
    deep: "#4aaf4f",
  },
  {
    x: 1426,
    height: 526,
    start: 534,
    hue: "#ffd35b",
    bright: "#fff2b4",
    deep: "#e18a22",
  },
] as const;

const smooth = (frame: number, range: readonly [number, number]) =>
  interpolate(frame, range, [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const seeded = (index: number) => {
  const value = Math.sin(index * 87.177 + 16.423) * 43758.5453;
  return value - Math.floor(value);
};

const Background: React.FC<{
  phase: number;
  opacity: number;
  energy: number;
}> = ({phase, opacity, energy}) => {
  const stars = Array.from({length: 42}, (_, index) => {
    const x = 60 + seeded(index + 3) * 1800;
    const y = 48 + seeded(index + 57) * 820;
    const radius = 0.7 + seeded(index + 103) * 2.1;
    const driftX = Math.sin(phase + index * 0.61) * (2 + seeded(index + 19) * 5);
    const driftY = Math.cos(phase * 0.73 + index * 0.43) * (2 + seeded(index + 31) * 4);
    const twinkle = 0.1 + Math.max(0, Math.sin(phase * 1.4 + index * 1.27)) * 0.24;

    return (
      <circle
        key={index}
        cx={x + driftX}
        cy={y + driftY}
        r={radius}
        fill={index % 4 === 0 ? "#d8d2ff" : index % 4 === 1 ? "#a8f7ff" : "#ffffff"}
        opacity={twinkle}
      />
    );
  });

  return (
    <AbsoluteFill style={{opacity}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 76% 16%,rgba(255,183,77,.12),transparent 27%), radial-gradient(circle at 18% 32%,rgba(113,79,255,.20),transparent 33%), radial-gradient(circle at 58% 76%,rgba(20,221,190,.11),transparent 39%), linear-gradient(145deg,#08091c 0%,#10102f 48%,#071824 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 45 + Math.sin(phase) * 18,
          top: 108 + Math.cos(phase) * 10,
          width: 720,
          height: 430,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse,rgba(105,70,255,.21),rgba(88,65,226,.035) 51%,transparent 73%)",
          filter: "blur(46px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 8 + Math.cos(phase) * 20,
          top: 45 + Math.sin(phase) * 12,
          width: 620,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse,rgba(255,192,75,.13),rgba(255,148,45,.02) 53%,transparent 75%)",
          filter: "blur(54px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 520 + Math.sin(phase * 0.7) * 12,
          bottom: -170,
          width: 980,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,rgba(40,238,203,${
            0.1 + energy * 0.055
          }),rgba(26,153,190,.02) 56%,transparent 75%)`,
          filter: "blur(48px)",
        }}
      />

      <svg width="1920" height="1080" style={{position: "absolute", inset: 0}}>
        <defs>
          <filter id="star-glow" x="-250%" y="-250%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="horizon-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8f82ff" stopOpacity="0" />
            <stop offset="28%" stopColor="#8f82ff" stopOpacity=".12" />
            <stop offset="67%" stopColor="#83fff0" stopOpacity=".13" />
            <stop offset="100%" stopColor="#83fff0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g filter="url(#star-glow)">{stars}</g>
        <path
          d={`M85 ${887 + Math.sin(phase) * 2.5}H1835`}
          stroke="url(#horizon-fade)"
          strokeWidth="1"
          opacity=".6"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(113deg,transparent 22%,rgba(255,255,255,.025) 35%,transparent 47%)",
          transform: `translateX(${Math.sin(phase * 0.62) * 24}px)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

const AuroraPillar: React.FC<{
  spec: PillarSpec;
  index: number;
  frame: number;
  energy: number;
}> = ({spec, index, frame, energy}) => {
  const growth = interpolate(frame, [spec.start, spec.start + 104], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const h = Math.max(2, spec.height * growth);
  const top = BASELINE - h;
  const appear = interpolate(growth, [0, 0.08], [0, 1], clamp);
  const ringProgress = interpolate(frame, [spec.start + 10, spec.start + 80], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const coreProgress = interpolate(frame, [spec.start + 18, spec.start + 112], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const localPulse =
    0.5 +
    0.5 * Math.sin(frame * 0.034 + index * 0.8);
  const glint = interpolate(
    frame,
    [660 + index * 8, 696 + index * 8, 748 + index * 8],
    [0, 1, 0],
    clamp,
  );
  const shimmerY =
    top -
    90 +
    interpolate(frame, [spec.start + 16, spec.start + 128], [0, h + 190], clamp);
  const capFloat = Math.sin(frame * 0.024 + index * 0.72) * 2.2 * growth;
  const dashOffset = (1 - ringProgress) * 255 - frame * 0.18;

  return (
    <g opacity={appear}>
      <defs>
        <linearGradient id={`body-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".28" />
          <stop offset="13%" stopColor={spec.bright} stopOpacity=".54" />
          <stop offset="46%" stopColor={spec.hue} stopOpacity=".31" />
          <stop offset="84%" stopColor={spec.deep} stopOpacity=".5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".17" />
        </linearGradient>
        <linearGradient id={`core-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.bright} stopOpacity=".86" />
          <stop offset="28%" stopColor={spec.hue} stopOpacity=".54" />
          <stop offset="100%" stopColor={spec.deep} stopOpacity=".08" />
        </linearGradient>
        <linearGradient id={`edge-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".88" />
          <stop offset="29%" stopColor={spec.bright} stopOpacity=".68" />
          <stop offset="70%" stopColor={spec.hue} stopOpacity=".76" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".22" />
        </linearGradient>
        <radialGradient id={`cap-${index}`} cx="34%" cy="25%" r="78%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="18%" stopColor={spec.bright} stopOpacity=".83" />
          <stop offset="57%" stopColor={spec.hue} stopOpacity=".64" />
          <stop offset="100%" stopColor={spec.deep} stopOpacity=".88" />
        </radialGradient>
        <radialGradient id={`halo-${index}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={spec.hue} stopOpacity=".34" />
          <stop offset="55%" stopColor={spec.hue} stopOpacity=".1" />
          <stop offset="100%" stopColor={spec.hue} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`reflection-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.hue} stopOpacity=".28" />
          <stop offset="100%" stopColor={spec.hue} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`shimmer-${index}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="47%" stopColor="#ffffff" stopOpacity=".72" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`pillar-clip-${index}`}>
          <rect
            x={spec.x}
            y={top}
            width={PILLAR_WIDTH}
            height={h}
            rx={PILLAR_WIDTH / 2}
          />
        </clipPath>
        <filter id={`soft-${index}`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id={`edge-glow-${index}`} x="-100%" y="-50%" width="300%" height="200%">
          <feGaussianBlur stdDeviation={1.7 + energy * 1.6 + glint * 1.4} result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`cap-shadow-${index}`} x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow
            dx="0"
            dy="9"
            stdDeviation="13"
            floodColor={spec.deep}
            floodOpacity=".55"
          />
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation={3 + energy * 2}
            floodColor={spec.bright}
            floodOpacity=".48"
          />
        </filter>
      </defs>

      <ellipse
        cx={spec.x + PILLAR_WIDTH / 2}
        cy={BASELINE + 18}
        rx={91 + energy * 8}
        ry={31 + energy * 3}
        fill={`url(#halo-${index})`}
        filter={`url(#soft-${index})`}
        opacity={0.58 * growth}
      />

      <path
        d={`M${spec.x + 10} ${BASELINE + 10}H${spec.x + PILLAR_WIDTH - 10}L${
          spec.x + PILLAR_WIDTH + 26
        } ${BASELINE + Math.min(154, h * 0.32)}H${spec.x - 15}Z`}
        fill={`url(#reflection-${index})`}
        opacity={0.4 * growth}
        filter={`url(#soft-${index})`}
      />

      <ellipse
        cx={spec.x + PILLAR_WIDTH / 2}
        cy={BASELINE + 4}
        rx={72 * ringProgress}
        ry={22 * ringProgress}
        fill="none"
        stroke={spec.bright}
        strokeWidth="2"
        strokeOpacity={0.18 + energy * 0.12}
        strokeDasharray="9 8"
        strokeDashoffset={dashOffset}
      />
      <ellipse
        cx={spec.x + PILLAR_WIDTH / 2}
        cy={BASELINE + 4}
        rx={54 * ringProgress}
        ry={15 * ringProgress}
        fill={spec.deep}
        fillOpacity=".24"
        stroke={spec.hue}
        strokeWidth="2.2"
        strokeOpacity={0.58 + energy * 0.17}
      />

      <rect
        x={spec.x}
        y={top}
        width={PILLAR_WIDTH}
        height={h}
        rx={PILLAR_WIDTH / 2}
        fill={`url(#body-${index})`}
        stroke={`url(#edge-${index})`}
        strokeWidth={2.2 + energy * 0.6}
        filter={`url(#edge-glow-${index})`}
      />

      <rect
        x={spec.x + 20}
        y={top + 36}
        width={PILLAR_WIDTH - 40}
        height={Math.max(0, h - 56) * coreProgress}
        rx={(PILLAR_WIDTH - 40) / 2}
        fill={`url(#core-${index})`}
        opacity={0.63}
      />
      <rect
        x={spec.x + 13}
        y={top + 39}
        width="9"
        height={Math.max(0, h - 76)}
        rx="5"
        fill="#ffffff"
        opacity={0.24 + localPulse * 0.05}
      />
      <rect
        x={spec.x + 27}
        y={top + 51}
        width="2"
        height={Math.max(0, h - 96)}
        fill="#ffffff"
        opacity=".2"
      />

      <g clipPath={`url(#pillar-clip-${index})`} opacity={0.28 + glint * 0.42}>
        <rect
          x={spec.x - 38}
          y={shimmerY}
          width={PILLAR_WIDTH + 76}
          height="74"
          fill={`url(#shimmer-${index})`}
          transform={`rotate(-17 ${spec.x + PILLAR_WIDTH / 2} ${shimmerY + 37})`}
        />
      </g>

      <ellipse
        cx={spec.x + PILLAR_WIDTH / 2}
        cy={top + 38 + capFloat}
        rx="36"
        ry="28"
        fill={`url(#cap-${index})`}
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeOpacity={0.72 + glint * 0.25}
        filter={`url(#cap-shadow-${index})`}
      />
      <ellipse
        cx={spec.x + PILLAR_WIDTH / 2 - 10}
        cy={top + 28 + capFloat}
        rx="10"
        ry="6"
        fill="#ffffff"
        opacity=".62"
      />
      <circle
        cx={spec.x + PILLAR_WIDTH - 12}
        cy={top + 12 + capFloat}
        r={2.5 + glint * 5.5}
        fill="#ffffff"
        opacity={0.36 + glint * 0.64}
        filter={`url(#edge-glow-${index})`}
      />
    </g>
  );
};

const RisingSystem: React.FC<{
  frame: number;
  opacity: number;
  energy: number;
}> = ({frame, opacity, energy}) => {
  const stage = smooth(frame, [18, 98]);
  const track = smooth(frame, [46, 130]);
  const pathProgress = interpolate(frame, [620, 724], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const pathPulse = interpolate(frame, [706, 748, 790], [0, 1, 0], clamp);
  const sweepX = interpolate(frame, [650, 770], [-360, 2200], clamp);
  const sweepOpacity = interpolate(frame, [642, 674, 742, 780], [0, 0.62, 0.46, 0], clamp);

  const topPoints = PILLARS.map(
    (spec) => `${spec.x + PILLAR_WIDTH / 2},${BASELINE - spec.height + 18}`,
  );
  const risingPath = `M${topPoints[0]} C${438},${650} ${488},${620} ${topPoints[1]} S${680},${553} ${topPoints[2]} S${902},${477} ${topPoints[3]} S${1124},${395} ${topPoints[4]} S${1346},${308} ${topPoints[5]}`;

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: "absolute", inset: 0, opacity}}
    >
      <defs>
        <radialGradient id="platform-fill" cx="50%" cy="42%" r="64%">
          <stop offset="0%" stopColor="#89fff0" stopOpacity=".1" />
          <stop offset="43%" stopColor="#7c71ff" stopOpacity=".065" />
          <stop offset="100%" stopColor="#15162e" stopOpacity=".02" />
        </radialGradient>
        <linearGradient id="platform-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8e80ff" stopOpacity="0" />
          <stop offset="18%" stopColor="#9b90ff" stopOpacity=".44" />
          <stop offset="53%" stopColor="#a5fff1" stopOpacity=".63" />
          <stop offset="82%" stopColor="#ffd76d" stopOpacity=".38" />
          <stop offset="100%" stopColor="#ffd76d" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rise-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9f8cff" />
          <stop offset="32%" stopColor="#68bfff" />
          <stop offset="62%" stopColor="#66f1c0" />
          <stop offset="100%" stopColor="#ffe07c" />
        </linearGradient>
        <linearGradient id="sweep-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="44%" stopColor="#ffffff" stopOpacity=".03" />
          <stop offset="51%" stopColor="#ffffff" stopOpacity=".6" />
          <stop offset="60%" stopColor="#bafff2" stopOpacity=".09" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="platform-shadow" x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="platform-glow" x="-30%" y="-400%" width="160%" height="900%">
          <feGaussianBlur stdDeviation={2 + energy * 2.8} result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="rise-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={3.5 + pathPulse * 3} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="stage-clip">
          <rect x="110" y="86" width="1700" height="850" rx="58" />
        </clipPath>
      </defs>

      <ellipse
        cx="960"
        cy="830"
        rx={770 * stage}
        ry={128 * stage}
        fill="#050718"
        opacity=".66"
        filter="url(#platform-shadow)"
      />
      <ellipse
        cx="960"
        cy="807"
        rx={775 * stage}
        ry={121 * stage}
        fill="url(#platform-fill)"
        stroke="url(#platform-edge)"
        strokeWidth="1.6"
        strokeOpacity=".76"
      />
      <ellipse
        cx="960"
        cy="807"
        rx={730 * track}
        ry={90 * track}
        fill="none"
        stroke="#a8fff1"
        strokeWidth="1"
        strokeOpacity={0.12 + energy * 0.06}
        strokeDasharray="4 14"
        strokeDashoffset={-frame * 0.24}
      />
      <ellipse
        cx="960"
        cy="805"
        rx={657 * track}
        ry={62 * track}
        fill="none"
        stroke="#a49cff"
        strokeWidth="1"
        strokeOpacity=".1"
        strokeDasharray="2 11"
        strokeDashoffset={frame * 0.15}
      />
      <path
        d="M220 807H1700"
        stroke="url(#platform-edge)"
        strokeWidth="2"
        strokeDasharray="1480"
        strokeDashoffset={(1 - track) * 1480}
        filter="url(#platform-glow)"
      />

      {PILLARS.map((spec, index) => (
        <AuroraPillar
          key={index}
          spec={spec}
          index={index}
          frame={frame}
          energy={energy}
        />
      ))}

      <path
        d={risingPath}
        fill="none"
        stroke="url(#rise-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - pathProgress}
        opacity={0.52 + pathPulse * 0.24}
        filter="url(#rise-glow)"
      />
      <path
        d={risingPath}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray=".018 .075"
        strokeDashoffset={1 - pathProgress + frame * -0.0007}
        opacity={pathProgress * (0.25 + pathPulse * 0.36)}
      />

      <g clipPath="url(#stage-clip)" opacity={sweepOpacity} style={{mixBlendMode: "screen"}}>
        <rect
          x={sweepX}
          y="48"
          width="330"
          height="900"
          fill="url(#sweep-gradient)"
          transform={`skewX(-13) translate(${-sweepX * 0.013} 0)`}
        />
      </g>
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const finalFrame = durationInFrames - 1;
  const phase = (frame / finalFrame) * Math.PI * 2;

  const enter = smooth(frame, [0, 48]);
  const exit = interpolate(frame, [838, finalFrame], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity = enter * exit;
  const energy = interpolate(frame, [625, 690, 748, 810], [0, 1, 0.5, 0], clamp);

  const camera = interpolate(
    frame,
    [0, 120, 610, 740, finalFrame],
    [0, 0.05, 1, 0.7, 0],
    clamp,
  );
  const cameraScale = 1 + camera * 0.021;
  const cameraX = interpolate(frame, [90, 620], [-7, 8], clamp) * opacity;
  const cameraY = -camera * 8 + Math.cos(phase) * 1.8 * opacity;

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: "#08091c"}}>
      <Background phase={phase} opacity={opacity} energy={energy} />

      <div
        style={{
          position: "absolute",
          inset: -28,
          transform: `translate3d(${cameraX}px,${cameraY}px,0) scale(${cameraScale})`,
          transformOrigin: "50% 54%",
        }}
      >
        <RisingSystem frame={frame} opacity={opacity} energy={energy} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 52% 53%,transparent 38%,rgba(4,4,17,.22) 72%,rgba(3,3,13,.67) 100%)",
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px)",
          backgroundSize: "100% 4px",
          mixBlendMode: "soft-light",
          opacity: opacity * 0.18,
        }}
      />
    </AbsoluteFill>
  );
};
