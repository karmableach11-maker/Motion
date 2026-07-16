import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Point = {
  x: number;
  y: number;
};

type PacketSpec = {
  delay: number;
  lane: number;
  scale: number;
  hue: "cyan" | "violet";
  tilt: number;
};

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const smooth = (value: number) => easeInOut(clamp01(value));

const flightEase = (value: number) => {
  const t = clamp01(value);
  if (t < 0.16) {
    return easeOut(t / 0.16) * 0.16;
  }
  if (t > 0.84) {
    return 0.84 + smooth((t - 0.84) / 0.16) * 0.16;
  }
  return t;
};

const cubicPoint = (
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point => {
  const u = 1 - t;
  return {
    x:
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x,
    y:
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y,
  };
};

const cubicTangent = (
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
): Point => {
  const u = 1 - t;
  return {
    x:
      3 * u * u * (p1.x - p0.x) +
      6 * u * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * u * u * (p1.y - p0.y) +
      6 * u * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  };
};

const route = {
  p0: { x: 444, y: 652 },
  p1: { x: 700, y: 675 },
  p2: { x: 1215, y: 342 },
  p3: { x: 1502, y: 395 },
};

const routePath = "M 444 652 C 700 675, 1215 342, 1502 395";

const hexagonPoints = (radius: number) =>
  Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
  }).join(" ");

const SvgDefinitions: React.FC = () => (
  <defs>
    <linearGradient id="bgBase" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#030611" />
      <stop offset="0.52" stopColor="#071326" />
      <stop offset="1" stopColor="#030712" />
    </linearGradient>
    <radialGradient id="bgAtmosphere" cx="50%" cy="48%" r="66%">
      <stop offset="0" stopColor="#174B6A" stopOpacity="0.36" />
      <stop offset="0.34" stopColor="#132A55" stopOpacity="0.22" />
      <stop offset="0.68" stopColor="#081329" stopOpacity="0.08" />
      <stop offset="1" stopColor="#02040B" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cyanBloom">
      <stop offset="0" stopColor="#38E7FF" stopOpacity="0.4" />
      <stop offset="0.36" stopColor="#1684B8" stopOpacity="0.18" />
      <stop offset="1" stopColor="#06101D" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="violetBloom">
      <stop offset="0" stopColor="#9A6BFF" stopOpacity="0.36" />
      <stop offset="0.38" stopColor="#5531B7" stopOpacity="0.16" />
      <stop offset="1" stopColor="#070817" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="routeGradient" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stopColor="#32D9FF" />
      <stop offset="0.5" stopColor="#B278FF" />
      <stop offset="1" stopColor="#5CF2C7" />
    </linearGradient>
    <linearGradient id="glassFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#D8F7FF" stopOpacity="0.18" />
      <stop offset="0.45" stopColor="#4B7CA0" stopOpacity="0.08" />
      <stop offset="1" stopColor="#091427" stopOpacity="0.28" />
    </linearGradient>
    <linearGradient id="glassEdge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#C8F7FF" stopOpacity="0.78" />
      <stop offset="0.34" stopColor="#3ADCF9" stopOpacity="0.36" />
      <stop offset="0.65" stopColor="#8B5CF6" stopOpacity="0.26" />
      <stop offset="1" stopColor="#5CF2C7" stopOpacity="0.65" />
    </linearGradient>
    <linearGradient id="panelFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#143052" stopOpacity="0.52" />
      <stop offset="1" stopColor="#081529" stopOpacity="0.82" />
    </linearGradient>
    <linearGradient id="cardFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F5FDFF" stopOpacity="0.98" />
      <stop offset="0.55" stopColor="#C7E7EF" stopOpacity="0.95" />
      <stop offset="1" stopColor="#82B7C8" stopOpacity="0.9" />
    </linearGradient>
    <linearGradient id="successGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#38E7FF" />
      <stop offset="0.58" stopColor="#7D6CFF" />
      <stop offset="1" stopColor="#5CF2C7" />
    </linearGradient>
    <pattern
      id="microGrid"
      width="56"
      height="56"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 56 0 L 0 0 0 56"
        fill="none"
        stroke="#75DDF6"
        strokeOpacity="0.055"
        strokeWidth="1"
      />
      <circle cx="0" cy="0" r="1.25" fill="#8BEAFF" fillOpacity="0.12" />
    </pattern>
    <filter id="glowSoft" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="5" result="blur1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glowStrong" x="-180%" y="-180%" width="460%" height="460%">
      <feGaussianBlur stdDeviation="18" result="wide" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="mid" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="tight" />
      <feMerge>
        <feMergeNode in="wide" />
        <feMergeNode in="mid" />
        <feMergeNode in="tight" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="vaultShadow" x="-80%" y="-100%" width="260%" height="300%">
      <feDropShadow
        dx="0"
        dy="28"
        stdDeviation="24"
        floodColor="#000612"
        floodOpacity="0.82"
      />
      <feDropShadow
        dx="0"
        dy="0"
        stdDeviation="6"
        floodColor="#36DFFF"
        floodOpacity="0.18"
      />
    </filter>
    <filter id="cardShadow" x="-100%" y="-100%" width="300%" height="300%">
      <feDropShadow
        dx="0"
        dy="12"
        stdDeviation="12"
        floodColor="#01030A"
        floodOpacity="0.7"
      />
      <feDropShadow
        dx="0"
        dy="0"
        stdDeviation="7"
        floodColor="#52E6FF"
        floodOpacity="0.56"
      />
    </filter>
    <filter id="noiseOverlay" x="0" y="0" width="100%" height="100%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.78"
        numOctaves="2"
        seed="27"
        stitchTiles="stitch"
      />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <clipPath id="progressClip">
      <rect x="456" y="952" width="1006" height="10" rx="5" />
    </clipPath>
  </defs>
);

const AmbientParticles: React.FC<{
  frame: number;
  fps: number;
  opacity: number;
}> = ({ frame, fps, opacity }) => {
  const particles = Array.from({ length: 58 }, (_, index) => ({
    x: random(`ambient-x-${index}`) * DESIGN_WIDTH,
    y: random(`ambient-y-${index}`) * DESIGN_HEIGHT,
    radius: 0.7 + random(`ambient-r-${index}`) * 2.1,
    speed: 4 + random(`ambient-s-${index}`) * 14,
    drift: 4 + random(`ambient-d-${index}`) * 12,
    alpha: 0.12 + random(`ambient-a-${index}`) * 0.42,
    phase: random(`ambient-p-${index}`) * Math.PI * 2,
  }));

  return (
    <g opacity={opacity}>
      {particles.map((particle, index) => {
        const y =
          ((particle.y - (frame / fps) * particle.speed + DESIGN_HEIGHT + 40) %
            (DESIGN_HEIGHT + 40)) -
          20;
        const x =
          particle.x +
          Math.sin((frame / fps) * 0.28 + particle.phase) * particle.drift;
        const twinkle =
          0.52 + 0.48 * Math.sin((frame / fps) * 0.8 + particle.phase);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={particle.radius}
            fill={index % 4 === 0 ? "#9B75FF" : "#8BEAFF"}
            opacity={particle.alpha * twinkle}
          />
        );
      })}
    </g>
  );
};

const Vault: React.FC<{
  x: number;
  y: number;
  label: string;
  sublabel: string;
  kind: "source" | "destination";
  intro: number;
  transfer: number;
  complete: number;
  frame: number;
  fps: number;
}> = ({
  x,
  y,
  label,
  sublabel,
  kind,
  intro,
  transfer,
  complete,
  frame,
  fps,
}) => {
  const isDestination = kind === "destination";
  const nodeColor = isDestination ? "#5CF2C7" : "#38E7FF";
  const fillLevel = isDestination
    ? 0.12 + transfer * 0.88
    : 1 - transfer * 0.76;
  const hover = Math.sin((frame / fps) * 1.1 + (isDestination ? 1.8 : 0)) * 5;
  const ringRotation =
    (frame / fps) * (isDestination ? -7 : 8) + (isDestination ? 24 : -16);
  const scale = 0.92 + intro * 0.08 + complete * (isDestination ? 0.018 : 0);
  const haloOpacity = 0.2 + (isDestination ? complete * 0.65 : 0);

  return (
    <g
      transform={`translate(${x} ${y + hover}) scale(${scale})`}
      opacity={intro}
      filter="url(#vaultShadow)"
    >
      <ellipse
        cx="0"
        cy="122"
        rx="172"
        ry="32"
        fill={nodeColor}
        opacity={0.08 + complete * (isDestination ? 0.12 : 0)}
        filter="url(#glowStrong)"
      />
      <circle
        r={150 + complete * (isDestination ? 18 : 0)}
        fill="none"
        stroke={nodeColor}
        strokeWidth="1.4"
        opacity={haloOpacity}
        strokeDasharray="3 13"
        transform={`rotate(${ringRotation})`}
      />
      <circle
        r="130"
        fill={`url(#${isDestination ? "violetBloom" : "cyanBloom"})`}
        opacity={0.64 + complete * 0.25}
      />
      <polygon
        points={hexagonPoints(118)}
        fill="url(#glassFill)"
        stroke="url(#glassEdge)"
        strokeWidth="2"
      />
      <polygon
        points={hexagonPoints(98)}
        fill="#07162A"
        fillOpacity="0.72"
        stroke={nodeColor}
        strokeOpacity="0.2"
        strokeWidth="1.2"
      />

      {Array.from({ length: 5 }, (_, index) => {
        const slotY = -58 + index * 28;
        const threshold = (index + 0.35) / 5;
        const lit = clamp01((fillLevel - threshold + 0.2) * 5);
        const width = 102 - Math.abs(index - 2) * 7;
        return (
          <g key={index} transform={`translate(0 ${slotY})`}>
            <rect
              x={-width / 2}
              y="-8"
              width={width}
              height="16"
              rx="8"
              fill="#10253E"
              stroke="#7FEAFF"
              strokeOpacity="0.18"
            />
            <rect
              x={-width / 2 + 4}
              y="-4"
              width={(width - 8) * lit}
              height="8"
              rx="4"
              fill={isDestination && complete > 0.1 ? "#5CF2C7" : nodeColor}
              opacity={0.32 + lit * 0.68}
              filter={lit > 0.7 ? "url(#glowSoft)" : undefined}
            />
          </g>
        );
      })}

      <g transform="translate(0 0)">
        <circle
          r="31"
          fill="#07111F"
          stroke={nodeColor}
          strokeOpacity="0.58"
          strokeWidth="2"
        />
        <circle
          r={8 + (isDestination ? complete * 4 : 0)}
          fill={nodeColor}
          opacity="0.96"
          filter="url(#glowStrong)"
        />
        <path
          d="M -15 0 H -7 M 7 0 H 15 M 0 -15 V -7 M 0 7 V 15"
          stroke="#D9FBFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.74"
        />
      </g>

      <path
        d="M -102 -58 L -78 -100 L 60 -100"
        fill="none"
        stroke="#E8FCFF"
        strokeWidth="1.4"
        strokeOpacity="0.32"
      />
      <circle
        cx="64"
        cy="-100"
        r="3"
        fill={nodeColor}
        filter="url(#glowSoft)"
      />

      <g transform="translate(0 178)">
        <text
          fill="#EAF8FF"
          fontSize="22"
          fontWeight="700"
          letterSpacing="4.6"
          textAnchor="middle"
        >
          {label}
        </text>
        <text
          y="29"
          fill="#7890AD"
          fontSize="13"
          fontWeight="600"
          letterSpacing="3.2"
          textAnchor="middle"
        >
          {sublabel}
        </text>
      </g>
    </g>
  );
};

const EncryptionGate: React.FC<{
  x: number;
  y: number;
  intro: number;
  pulse: number;
  frame: number;
  fps: number;
}> = ({ x, y, intro, pulse, frame, fps }) => {
  const rotation = (frame / fps) * 18;
  const reverseRotation = -(frame / fps) * 11;
  const pulseScale = 1 + pulse * 0.075;

  return (
    <g
      transform={`translate(${x} ${y}) scale(${(0.84 + intro * 0.16) * pulseScale})`}
      opacity={intro}
    >
      <circle
        r={138 + pulse * 18}
        fill="url(#violetBloom)"
        opacity={0.24 + pulse * 0.3}
        filter="url(#glowStrong)"
      />
      <circle
        r="112"
        fill="#071326"
        fillOpacity="0.62"
        stroke="#58E6FF"
        strokeOpacity={0.32 + pulse * 0.42}
        strokeWidth="1.5"
      />
      <circle
        r="96"
        fill="none"
        stroke="url(#routeGradient)"
        strokeWidth="3"
        strokeDasharray="10 12 2 9"
        strokeLinecap="round"
        transform={`rotate(${rotation})`}
        opacity={0.72 + pulse * 0.28}
        filter="url(#glowSoft)"
      />
      <circle
        r="75"
        fill="none"
        stroke="#A78BFA"
        strokeWidth="1.4"
        strokeDasharray="2 11"
        transform={`rotate(${reverseRotation})`}
        opacity="0.7"
      />
      <polygon
        points={hexagonPoints(52)}
        fill="#0A1A30"
        fillOpacity="0.92"
        stroke="url(#routeGradient)"
        strokeWidth="2"
        filter="url(#glowSoft)"
      />
      <g opacity={0.68 + pulse * 0.32}>
        <rect x="-22" y="-22" width="44" height="9" rx="4.5" fill="#38E7FF" />
        <rect x="-22" y="-4.5" width="30" height="9" rx="4.5" fill="#8B5CF6" />
        <rect x="-22" y="13" width="38" height="9" rx="4.5" fill="#5CF2C7" />
        <circle cx="26" cy="0" r="5" fill="#EAF8FF" filter="url(#glowSoft)" />
      </g>

      {Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6 + (rotation * Math.PI) / 180;
        return (
          <circle
            key={index}
            cx={Math.cos(angle) * 126}
            cy={Math.sin(angle) * 126}
            r={index % 2 === 0 ? 4 : 2.6}
            fill={index % 2 === 0 ? "#38E7FF" : "#A78BFA"}
            opacity="0.86"
            filter="url(#glowSoft)"
          />
        );
      })}

      <g transform="translate(0 155)">
        <rect
          x="-104"
          y="-16"
          width="208"
          height="32"
          rx="16"
          fill="#071426"
          stroke="#5CDFF4"
          strokeOpacity="0.18"
        />
        <circle
          cx="-82"
          cy="0"
          r="3.5"
          fill="#5CF2C7"
          filter="url(#glowSoft)"
        />
        <text
          x="10"
          y="1"
          fill="#A7C5D9"
          fontSize="12"
          fontWeight="700"
          letterSpacing="2.8"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ENCRYPTION GATE
        </text>
      </g>
    </g>
  );
};

const DataPacket: React.FC<{
  spec: PacketSpec;
  index: number;
  frame: number;
  durationInFrames: number;
}> = ({ spec, index, frame, durationInFrames }) => {
  const flightDuration = durationInFrames * 0.185;
  const raw = (frame - spec.delay) / flightDuration;
  if (raw <= -0.03 || raw >= 1.03) {
    return null;
  }

  const local = clamp01(raw);
  const t = flightEase(local);
  const point = cubicPoint(t, route.p0, route.p1, route.p2, route.p3);
  const tangent = cubicTangent(t, route.p0, route.p1, route.p2, route.p3);
  const tangentLength = Math.max(1, Math.hypot(tangent.x, tangent.y));
  const normal = {
    x: -tangent.y / tangentLength,
    y: tangent.x / tangentLength,
  };
  const centerConvergence = 1 - Math.exp(-Math.pow((t - 0.5) / 0.18, 2));
  const laneOffset = spec.lane * centerConvergence;
  const x = point.x + normal.x * laneOffset;
  const y = point.y + normal.y * laneOffset;
  const baseAngle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
  const floatTilt = Math.sin(t * Math.PI * 2 + index * 1.7) * spec.tilt;
  const angle = baseAngle * 0.28 + floatTilt;
  const portalAmount = clamp01(1 - Math.abs(t - 0.5) / 0.145);
  const visibility = Math.min(
    clamp01(local / 0.055),
    clamp01((1 - local) / 0.06),
  );
  const depthScale = spec.scale * (0.94 + Math.sin(t * Math.PI) * 0.13);
  const cardWidth = mix(84, 46, portalAmount);
  const cardHeight = mix(108, 30, portalAmount);
  const accent = spec.hue === "cyan" ? "#38E7FF" : "#9B75FF";
  const trailLength = 58 + portalAmount * 58;

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle}) scale(${depthScale})`}
      opacity={visibility}
      filter="url(#cardShadow)"
    >
      <line
        x1={-trailLength - cardWidth / 2}
        y1="0"
        x2={-cardWidth / 2 - 8}
        y2="0"
        stroke={accent}
        strokeWidth={2 + portalAmount * 2}
        strokeLinecap="round"
        opacity={0.2 + portalAmount * 0.48}
        filter="url(#glowSoft)"
      />

      {Array.from({ length: 4 }, (_, shard) => {
        const shardOffset = 16 + shard * 16;
        return (
          <rect
            key={shard}
            x={-cardWidth / 2 - shardOffset - portalAmount * shard * 7}
            y={-3 - ((shard % 2) * 8 - 4) * portalAmount}
            width={7 + portalAmount * 7}
            height={6}
            rx="3"
            fill={shard % 2 === 0 ? accent : "#5CF2C7"}
            opacity={(0.14 + portalAmount * 0.72) * (1 - shard * 0.14)}
            filter="url(#glowSoft)"
          />
        );
      })}

      <rect
        x={-cardWidth / 2}
        y={-cardHeight / 2}
        width={cardWidth}
        height={cardHeight}
        rx={8 + portalAmount * 7}
        fill={portalAmount > 0.64 ? accent : "url(#cardFill)"}
        fillOpacity={0.94}
        stroke="#E7FCFF"
        strokeOpacity={0.78}
        strokeWidth="1.4"
      />
      <path
        d={`M ${cardWidth / 2 - 24} ${-cardHeight / 2} L ${cardWidth / 2} ${-cardHeight / 2 + 24} L ${cardWidth / 2 - 24} ${-cardHeight / 2 + 24} Z`}
        fill="#82E9FA"
        opacity={0.55 * (1 - portalAmount)}
      />
      <g opacity={1 - portalAmount * 0.9}>
        <rect
          x={-cardWidth / 2 + 13}
          y={-cardHeight / 2 + 18}
          width={cardWidth * 0.37}
          height="7"
          rx="3.5"
          fill={accent}
        />
        <rect
          x={-cardWidth / 2 + 13}
          y={-8}
          width={cardWidth - 26}
          height="5"
          rx="2.5"
          fill="#37627A"
          opacity="0.52"
        />
        <rect
          x={-cardWidth / 2 + 13}
          y="5"
          width={(cardWidth - 26) * 0.72}
          height="5"
          rx="2.5"
          fill="#37627A"
          opacity="0.42"
        />
        <rect
          x={-cardWidth / 2 + 13}
          y="18"
          width={(cardWidth - 26) * 0.84}
          height="5"
          rx="2.5"
          fill="#37627A"
          opacity="0.32"
        />
      </g>
      <rect
        x={-cardWidth / 2 + 4}
        y={-cardHeight / 2 + 4}
        width={cardWidth - 8}
        height="2"
        rx="1"
        fill="#FFFFFF"
        opacity="0.64"
      />
    </g>
  );
};

const TransferRoute: React.FC<{
  frame: number;
  fps: number;
  intro: number;
  transfer: number;
}> = ({ frame, fps, intro, transfer }) => {
  const dashOffset = -(frame / fps) * 0.11;
  return (
    <g opacity={intro}>
      <path
        d={routePath}
        fill="none"
        stroke="#38E7FF"
        strokeOpacity="0.08"
        strokeWidth="32"
        strokeLinecap="round"
        filter="url(#glowStrong)"
      />
      <path
        d={routePath}
        pathLength="1"
        fill="none"
        stroke="url(#routeGradient)"
        strokeWidth="2.2"
        strokeOpacity="0.52"
        strokeDasharray="0.012 0.024"
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        filter="url(#glowSoft)"
      />
      <path
        d="M 430 686 C 704 718, 1226 376, 1518 430"
        pathLength="1"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="1"
        strokeOpacity="0.18"
        strokeDasharray="0.004 0.034"
        strokeDashoffset={dashOffset * 0.72}
      />
      <path
        d="M 458 618 C 702 628, 1200 310, 1486 360"
        pathLength="1"
        fill="none"
        stroke="#5CF2C7"
        strokeWidth="1"
        strokeOpacity="0.14"
        strokeDasharray="0.002 0.044"
        strokeDashoffset={-dashOffset * 0.55}
      />

      {Array.from({ length: 7 }, (_, index) => {
        const p = (frame / (fps * 4.8) + index / 7) % 1;
        const point = cubicPoint(p, route.p0, route.p1, route.p2, route.p3);
        const dotOpacity = (0.16 + transfer * 0.42) * Math.sin(Math.PI * p);
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={2.4 + (index % 3)}
            fill={index % 2 === 0 ? "#38E7FF" : "#A78BFA"}
            opacity={dotOpacity}
            filter="url(#glowSoft)"
          />
        );
      })}
    </g>
  );
};

const Header: React.FC<{
  intro: number;
  complete: number;
}> = ({ intro, complete }) => {
  const y = mix(25, 0, intro);
  return (
    <g transform={`translate(0 ${y})`} opacity={intro}>
      <g transform="translate(158 134)">
        <rect
          x="0"
          y="0"
          width="44"
          height="4"
          rx="2"
          fill="url(#routeGradient)"
          filter="url(#glowSoft)"
        />
        <text
          x="64"
          y="5"
          fill="#86A8BF"
          fontSize="14"
          fontWeight="700"
          letterSpacing="4.4"
        >
          SECURE INFRASTRUCTURE
        </text>
        <text
          x="0"
          y="69"
          fill="#EDF9FF"
          fontSize="52"
          fontWeight="760"
          letterSpacing="7.8"
        >
          ENCRYPTED DATA CORRIDOR
        </text>
        <text
          x="2"
          y="105"
          fill="#7890AD"
          fontSize="16"
          fontWeight="500"
          letterSpacing="2.1"
        >
          PACKET-LEVEL MIGRATION • VERIFIED END TO END
        </text>
      </g>

      <g transform="translate(1548 144)">
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="#0D2037"
          stroke="#5CF2C7"
          strokeOpacity="0.45"
        />
        <circle
          cx="0"
          cy="0"
          r={5 + complete * 2}
          fill="#5CF2C7"
          filter="url(#glowSoft)"
        />
        <text
          x="40"
          y="-5"
          fill="#7890AD"
          fontSize="12"
          fontWeight="700"
          letterSpacing="2.4"
        >
          CHANNEL STATUS
        </text>
        <text
          x="40"
          y="18"
          fill="#DFFCF5"
          fontSize="16"
          fontWeight="700"
          letterSpacing="2.1"
        >
          {complete > 0.55 ? "SYNCHRONIZED" : "ENCRYPTED"}
        </text>
      </g>
    </g>
  );
};

const ProgressPanel: React.FC<{
  intro: number;
  transfer: number;
  complete: number;
  frame: number;
  fps: number;
}> = ({ intro, transfer, complete, frame, fps }) => {
  const percent = Math.min(100, Math.round(transfer * 100));
  const panelY = mix(30, 0, intro);
  const sweepX = 456 + ((frame / fps) % 2.6) * (1006 / 2.6);

  return (
    <g transform={`translate(0 ${panelY})`} opacity={intro}>
      <rect
        x="300"
        y="876"
        width="1320"
        height="126"
        rx="28"
        fill="url(#panelFill)"
        stroke="#78DDF3"
        strokeOpacity="0.2"
        strokeWidth="1.3"
      />
      <path
        d="M 328 906 H 392 L 412 886 H 590"
        fill="none"
        stroke="#7CE8FF"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />
      <circle cx="328" cy="906" r="3" fill="#38E7FF" filter="url(#glowSoft)" />

      <g transform="translate(348 942)">
        <circle
          r="24"
          fill={complete > 0.5 ? "#123C38" : "#102C46"}
          stroke={complete > 0.5 ? "#5CF2C7" : "#38E7FF"}
          strokeOpacity="0.64"
          strokeWidth="1.5"
        />
        {complete > 0.5 ? (
          <path
            d="M -9 0 L -2 7 L 11 -8"
            fill="none"
            stroke="#A8FFE7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M -10 -7 H 3 M -10 0 H 10 M -10 7 H 5"
            fill="none"
            stroke="#BFF6FF"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </g>

      <text
        x="394"
        y="927"
        fill="#EAF8FF"
        fontSize="17"
        fontWeight="700"
        letterSpacing="2.5"
      >
        {complete > 0.58 ? "TRANSFER COMPLETE" : "MIGRATING ENCRYPTED PACKETS"}
      </text>
      <text
        x="394"
        y="976"
        fill="#6F8AA3"
        fontSize="12"
        fontWeight="650"
        letterSpacing="2.1"
      >
        INTEGRITY 100% • CHECKSUM VERIFIED • PRIVATE CHANNEL
      </text>

      <rect
        x="456"
        y="952"
        width="1006"
        height="10"
        rx="5"
        fill="#17304B"
        opacity="0.9"
      />
      <g clipPath="url(#progressClip)">
        <rect
          x="456"
          y="952"
          width={1006 * transfer}
          height="10"
          rx="5"
          fill="url(#successGradient)"
          filter="url(#glowSoft)"
        />
        <rect
          x={sweepX - 70}
          y="949"
          width="76"
          height="16"
          fill="#FFFFFF"
          opacity={transfer > 0.02 && transfer < 0.995 ? 0.32 : 0}
          transform={`skewX(-22)`}
          filter="url(#glowSoft)"
        />
      </g>

      <text
        x="1536"
        y="958"
        fill={complete > 0.5 ? "#85FFD9" : "#EAF8FF"}
        fontSize="38"
        fontWeight="740"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {String(percent).padStart(3, "0")}%
      </text>
    </g>
  );
};

const CompletionHalo: React.FC<{
  complete: number;
  frame: number;
  fps: number;
}> = ({ complete, frame, fps }) => {
  const pulse = complete * (0.78 + Math.sin((frame / fps) * 3.1) * 0.08);
  return (
    <g transform="translate(1502 395)" opacity={complete}>
      <circle
        r={166 + pulse * 28}
        fill="none"
        stroke="#5CF2C7"
        strokeWidth={1.5 + complete}
        strokeOpacity={0.36 * (1 - complete * 0.18)}
        filter="url(#glowSoft)"
      />
      <circle
        r={190 + pulse * 35}
        fill="none"
        stroke="#5CF2C7"
        strokeWidth="1"
        strokeOpacity="0.16"
      />
      <g transform="translate(0 -210)">
        <rect
          x="-121"
          y="-21"
          width="242"
          height="42"
          rx="21"
          fill="#0B292A"
          fillOpacity="0.9"
          stroke="#5CF2C7"
          strokeOpacity="0.4"
        />
        <circle cx="-93" cy="0" r="5" fill="#5CF2C7" filter="url(#glowSoft)" />
        <text
          x="12"
          y="1"
          fill="#CBFFF0"
          fontSize="13"
          fontWeight="750"
          letterSpacing="2.2"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          FILES SYNCHRONIZED
        </text>
      </g>
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const intro = interpolate(frame, [0, durationInFrames * 0.085], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const outro = interpolate(
    frame,
    [durationInFrames * 0.92, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut },
  );
  const nodeIntro = spring({
    frame: frame - durationInFrames * 0.055,
    fps,
    config: { damping: 18, stiffness: 105, mass: 0.9 },
    durationInFrames: Math.max(1, Math.round(durationInFrames * 0.13)),
  });
  const gateIntro = spring({
    frame: frame - durationInFrames * 0.095,
    fps,
    config: { damping: 20, stiffness: 92, mass: 0.95 },
    durationInFrames: Math.max(1, Math.round(durationInFrames * 0.13)),
  });
  const transfer = interpolate(
    frame,
    [durationInFrames * 0.16, durationInFrames * 0.79],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut },
  );
  const complete = interpolate(
    frame,
    [durationInFrames * 0.79, durationInFrames * 0.845],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
  );
  const routeIntro = interpolate(
    frame,
    [durationInFrames * 0.09, durationInFrames * 0.18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
  );

  const packetSpecs: PacketSpec[] = Array.from({ length: 9 }, (_, index) => ({
    delay: durationInFrames * (0.145 + index * 0.057),
    lane: mix(-58, 58, random(`packet-lane-${index}`)),
    scale: 0.76 + random(`packet-scale-${index}`) * 0.32,
    hue: index % 3 === 1 ? "violet" : "cyan",
    tilt: 3 + random(`packet-tilt-${index}`) * 7,
  }));

  const portalPulse = Math.max(
    0,
    ...packetSpecs.map((spec) => {
      const raw = (frame - spec.delay) / (durationInFrames * 0.185);
      if (raw < 0 || raw > 1) {
        return 0;
      }
      return Math.exp(-Math.pow((flightEase(raw) - 0.5) / 0.065, 2));
    }),
  );

  const cameraScale = 1 + intro * 0.016 + transfer * 0.012;
  const cameraX = Math.sin((frame / fps) * 0.22) * 4;
  const cameraY = Math.cos((frame / fps) * 0.18) * 3;
  const globalOpacity = intro * outro;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040B",
        fontFamily:
          'Inter, Manrope, "Helvetica Neue", Arial, ui-sans-serif, sans-serif',
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <SvgDefinitions />
        <rect width={DESIGN_WIDTH} height={DESIGN_HEIGHT} fill="url(#bgBase)" />
        <g opacity={globalOpacity}>
          <rect
            width={DESIGN_WIDTH}
            height={DESIGN_HEIGHT}
            fill="url(#bgAtmosphere)"
          />
          <ellipse
            cx="360"
            cy="690"
            rx="620"
            ry="520"
            fill="url(#cyanBloom)"
            opacity="0.34"
          />
          <ellipse
            cx="1560"
            cy="320"
            rx="650"
            ry="520"
            fill="url(#violetBloom)"
            opacity="0.38"
          />
          <rect
            x="0"
            y="242"
            width={DESIGN_WIDTH}
            height="730"
            fill="url(#microGrid)"
            opacity="0.52"
            transform="skewY(-4)"
          />
          <AmbientParticles frame={frame} fps={fps} opacity={0.82} />

          <g
            transform={`translate(960 540) scale(${cameraScale}) translate(-960 -540) translate(${cameraX} ${cameraY})`}
          >
            <Header intro={routeIntro} complete={complete} />
            <TransferRoute
              frame={frame}
              fps={fps}
              intro={routeIntro}
              transfer={transfer}
            />
            <CompletionHalo complete={complete} frame={frame} fps={fps} />

            <Vault
              x={420}
              y={645}
              label="SOURCE VAULT"
              sublabel="LOCAL DATA NODE"
              kind="source"
              intro={nodeIntro}
              transfer={transfer}
              complete={complete}
              frame={frame}
              fps={fps}
            />
            <Vault
              x={1515}
              y={395}
              label="TARGET VAULT"
              sublabel="SECURE ARCHIVE"
              kind="destination"
              intro={nodeIntro}
              transfer={transfer}
              complete={complete}
              frame={frame}
              fps={fps}
            />

            {packetSpecs.map((spec, index) => (
              <DataPacket
                key={index}
                spec={spec}
                index={index}
                frame={frame}
                durationInFrames={durationInFrames}
              />
            ))}

            <EncryptionGate
              x={960}
              y={505}
              intro={gateIntro}
              pulse={portalPulse}
              frame={frame}
              fps={fps}
            />

            <ProgressPanel
              intro={routeIntro}
              transfer={transfer}
              complete={complete}
              frame={frame}
              fps={fps}
            />
          </g>

          <rect
            width={DESIGN_WIDTH}
            height={DESIGN_HEIGHT}
            fill="#00030A"
            opacity="0.15"
            filter="url(#noiseOverlay)"
          />
          <rect
            width={DESIGN_WIDTH}
            height={DESIGN_HEIGHT}
            fill="none"
            stroke="#00040D"
            strokeWidth="110"
            opacity="0.5"
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
