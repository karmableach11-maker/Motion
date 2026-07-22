import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Vec3 = {x: number; y: number; z: number};
type IconKind =
  | "bit"
  | "folder"
  | "document"
  | "image"
  | "chart"
  | "cloud"
  | "profile"
  | "lock";

type WorldNode = Vec3 & {
  id: number;
  kind: IconKind;
  size: number;
  brightness: number;
  phase: number;
  hero?: boolean;
};

type Edge = {
  a: number;
  b: number;
  phase: number;
  energy: number;
};

type Camera = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
};

type Projected = {
  x: number;
  y: number;
  depth: number;
  scale: number;
  visible: boolean;
};

const W = 1920;
const H = 1080;
const FOCAL = 1040;
const NEAR = 115;
const FAR = 8800;
const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const fract = (value: number) => value - Math.floor(value);

const hash01 = (seed: number) => {
  let value = (seed + 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967296;
};

const HERO_NODES: Omit<WorldNode, "id">[] = [
  {x: -180, y: -88, z: 1235, kind: "folder", size: 92, brightness: 1, phase: 0.14, hero: true},
  {x: -185, y: 112, z: 1915, kind: "document", size: 88, brightness: 1, phase: 0.27, hero: true},
  {x: -205, y: 86, z: 2715, kind: "folder", size: 84, brightness: 0.96, phase: 0.39, hero: true},
  {x: 55, y: -142, z: 3075, kind: "document", size: 94, brightness: 1, phase: 0.45, hero: true},
  {x: -190, y: 54, z: 3390, kind: "image", size: 86, brightness: 0.94, phase: 0.51, hero: true},
  {x: -170, y: -82, z: 4265, kind: "chart", size: 88, brightness: 1, phase: 0.63, hero: true},
  {x: -188, y: 12, z: 4620, kind: "cloud", size: 90, brightness: 0.98, phase: 0.7, hero: true},
  {x: 185, y: 92, z: 5420, kind: "image", size: 96, brightness: 1, phase: 0.83, hero: true},
  {x: 172, y: -92, z: 6020, kind: "profile", size: 86, brightness: 0.96, phase: 0.92, hero: true},
  {x: -168, y: 94, z: 6420, kind: "lock", size: 90, brightness: 1, phase: 0.98, hero: true},
];

const GENERATED_NODES: WorldNode[] = Array.from({length: 270}, (_, index) => {
  const spread = 0.42 + Math.pow(hash01(index * 17 + 4), 0.7) * 0.72;
  const kindRoll = hash01(index * 41 + 9);
  const kind: IconKind =
    kindRoll < 0.1
      ? "bit"
      : kindRoll < 0.27
        ? "folder"
        : kindRoll < 0.52
          ? "document"
          : kindRoll < 0.68
            ? "image"
              : kindRoll < 0.8
              ? "profile"
              : kindRoll < 0.9
                ? "cloud"
                : kindRoll < 0.97
                  ? "chart"
                  : "lock";
  return {
    id: index + HERO_NODES.length,
    x: (hash01(index * 59 + 5) * 2 - 1) * 1180 * spread,
    y: (hash01(index * 73 + 7) * 2 - 1) * 650 * spread,
    z: 260 + hash01(index * 97 + 11) * 9700,
    kind,
    size: kind === "bit" ? 8 + hash01(index * 107 + 13) * 12 : 35 + hash01(index * 109 + 19) * 34,
    brightness: 0.58 + hash01(index * 127 + 23) * 0.42,
    phase: hash01(index * 131 + 29),
  };
});

const NODES: WorldNode[] = [
  ...HERO_NODES.map((node, id) => ({...node, id})),
  ...GENERATED_NODES,
].sort((a, b) => a.id - b.id);

const makeEdges = () => {
  const pairs = new Set<string>();
  const edges: Edge[] = [];
  const add = (a: number, b: number, energy: number) => {
    if (a === b) return;
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    const key = `${low}-${high}`;
    if (pairs.has(key)) return;
    pairs.add(key);
    edges.push({
      a: low,
      b: high,
      phase: hash01(low * 331 + high * 197 + 17),
      energy,
    });
  };

  NODES.forEach((node, index) => {
    const nearest = NODES
      .map((candidate, candidateIndex) => {
        if (candidateIndex === index) return {candidateIndex, distance: Number.POSITIVE_INFINITY};
        const dx = candidate.x - node.x;
        const dy = candidate.y - node.y;
        const dz = (candidate.z - node.z) * 0.64;
        return {candidateIndex, distance: Math.hypot(dx, dy, dz)};
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, node.kind === "bit" ? 2 : 3);

    nearest.forEach(({candidateIndex, distance}, rank) => {
      if (distance < 1450) add(index, candidateIndex, 0.76 + (2 - rank) * 0.12);
    });

    if (index % 9 === 0) {
      const target = (index + 13 + Math.floor(hash01(index * 181 + 3) * 17)) % NODES.length;
      if (Math.abs(NODES[target].z - node.z) < 1850) add(index, target, 0.72);
    }
  });

  return edges;
};

const EDGES = makeEdges();

const getCamera = (seconds: number): Camera => ({
  x:
    -60 +
    seconds * 8.5 +
    Math.sin(seconds * 0.31 + 0.4) * 92 +
    Math.sin(seconds * 0.097) * 38,
  y:
    18 +
    Math.sin(seconds * 0.27 + 1.1) * 68 +
    Math.sin(seconds * 0.11 + 0.2) * 30,
  z: seconds * 308,
  yaw: -0.036 + Math.sin(seconds * 0.2 + 0.3) * 0.045 + seconds * 0.0017,
  pitch: 0.018 + Math.sin(seconds * 0.17 + 1.4) * 0.032,
  roll: Math.sin(seconds * 0.14 - 0.8) * 0.022,
});

const project = (point: Vec3, camera: Camera): Projected => {
  const dx = point.x - camera.x;
  const dy = point.y - camera.y;
  const dz = point.z - camera.z;

  const cy = Math.cos(camera.yaw);
  const sy = Math.sin(camera.yaw);
  const xYaw = cy * dx - sy * dz;
  const zYaw = sy * dx + cy * dz;

  const cp = Math.cos(camera.pitch);
  const sp = Math.sin(camera.pitch);
  const yPitch = cp * dy - sp * zYaw;
  const zPitch = sp * dy + cp * zYaw;

  const cr = Math.cos(camera.roll);
  const sr = Math.sin(camera.roll);
  const xRoll = cr * xYaw - sr * yPitch;
  const yRoll = sr * xYaw + cr * yPitch;
  const scale = FOCAL / Math.max(zPitch, NEAR);
  const x = W / 2 + xRoll * scale;
  const y = H / 2 + yRoll * scale;

  return {
    x,
    y,
    depth: zPitch,
    scale,
    visible:
      zPitch > NEAR &&
      zPitch < FAR &&
      x > -700 &&
      x < W + 700 &&
      y > -520 &&
      y < H + 520,
  };
};

const depthOpacity = (depth: number) => {
  const nearFade = interpolate(depth, [NEAR, 245], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const farFade = interpolate(depth, [5600, FAR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return nearFade * farFade;
};

const nodePosition = (node: WorldNode, seconds: number): Vec3 => {
  const float = node.kind === "bit" ? 5 : 11;
  return {
    x: node.x + Math.sin(seconds * (0.23 + node.phase * 0.1) + node.phase * TAU) * float,
    y: node.y + Math.cos(seconds * (0.2 + node.phase * 0.11) + node.phase * TAU) * float * 0.74,
    z: node.z + Math.sin(seconds * 0.16 + node.phase * TAU) * float * 0.8,
  };
};

const Glyph: React.FC<{
  kind: IconKind;
  color: string;
  fill: string;
  strokeWidth: number;
}> = ({kind, color, fill, strokeWidth}) => {
  if (kind === "bit") {
    return (
      <g>
        <rect x={-5} y={-4} width={10} height={8} rx={1.8} fill={color} />
        <rect x={-3.2} y={-2.4} width={6.4} height={1.2} rx={0.6} fill="#d9fbff" opacity={0.62} />
      </g>
    );
  }

  if (kind === "folder") {
    return (
      <g strokeLinejoin="round">
        <path
          d="M-34-21h24l8 8h36v36a8 8 0 0 1-8 8h-52a8 8 0 0 1-8-8z"
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <path d="M-31-10h62" stroke="#d8fbff" strokeWidth={strokeWidth * 0.72} opacity={0.72} />
        <path d="M-29-18h17l5 5h-22z" fill="#b9f4ff" opacity={0.7} />
      </g>
    );
  }

  const filePath = "M-28-38h34l22 22v54h-56z";
  const common = (
    <>
      <path d={filePath} fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M6-38v22h22" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </>
  );

  if (kind === "document") {
    return (
      <g strokeLinecap="round">
        {common}
        <path d="M-16-9h28M-16 1h32M-16 11h32M-16 21h22" stroke={color} strokeWidth={strokeWidth * 0.86} />
      </g>
    );
  }

  if (kind === "image") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        {common}
        <rect x={-17} y={-8} width={34} height={30} rx={2} fill="none" stroke={color} strokeWidth={strokeWidth * 0.84} />
        <circle cx={8} cy={0} r={3.6} fill={color} />
        <path d="M-14 18l10-10 7 7 5-5 7 8" fill="none" stroke={color} strokeWidth={strokeWidth * 0.9} />
      </g>
    );
  }

  if (kind === "chart") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        {common}
        <path d="M-17 23V8h7v15M-4 23V-2h7v25M9 23V4h7v19" fill="none" stroke={color} strokeWidth={strokeWidth * 0.9} />
        <path d="M-18 25h35" stroke={color} strokeWidth={strokeWidth * 0.8} />
      </g>
    );
  }

  if (kind === "cloud") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        {common}
        <path
          d="M-15 18h29a8 8 0 0 0 1-16 12 12 0 0 0-23-3 9 9 0 0 0-7 19z"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 0.9}
        />
      </g>
    );
  }

  if (kind === "profile") {
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        {common}
        <circle cx={0} cy={-2} r={8} fill="none" stroke={color} strokeWidth={strokeWidth * 0.9} />
        <path d="M-16 24c2-10 9-15 16-15s14 5 16 15" fill="none" stroke={color} strokeWidth={strokeWidth * 0.9} />
      </g>
    );
  }

  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {common}
      <rect x={-14} y={4} width={28} height={21} rx={4} fill="none" stroke={color} strokeWidth={strokeWidth * 0.9} />
      <path d="M-8 4v-7a8 8 0 0 1 16 0v7" fill="none" stroke={color} strokeWidth={strokeWidth * 0.9} />
      <circle cx={0} cy={14} r={2.4} fill={color} />
    </g>
  );
};

const FileNode: React.FC<{
  node: WorldNode;
  projected: Projected;
  seconds: number;
}> = ({node, projected, seconds}) => {
  const depthFade = depthOpacity(projected.depth);
  const pulse = 0.82 + Math.sin(seconds * (1.1 + node.phase * 0.65) + node.phase * TAU) * 0.18;
  const brightness = clamp(node.brightness * pulse, 0.45, 1.12);
  const iconScale = projected.scale * (node.size / 72);
  const opacity = depthFade * (node.kind === "bit" ? 0.72 : 0.92) * brightness;
  const near = projected.depth < 430;
  const blurFilter = projected.depth < 235
    ? "url(#focusNearStrong)"
    : near
      ? "url(#focusNear)"
      : undefined;
  const color = node.hero ? "#4fe5ff" : "#31c9f4";
  const fill = `rgba(0, 35, 71, ${node.kind === "bit" ? 0 : 0.66})`;
  const beacon = node.hero || (node.id % 17 === 0 && node.kind !== "bit");
  const haloSize = node.kind === "bit" ? 22 : 92;

  return (
    <g
      transform={`translate(${projected.x.toFixed(2)} ${projected.y.toFixed(2)}) scale(${iconScale.toFixed(4)})`}
      opacity={opacity}
      filter={blurFilter}
    >
      {beacon ? (
        <g opacity={0.42 + brightness * 0.22}>
          <circle cx={0} cy={0} r={haloSize} fill="url(#nodeHalo)" />
          <path d={`M${-haloSize * 1.1} 0H${haloSize * 1.1}M0 ${-haloSize * 0.72}V${haloSize * 0.72}`} stroke="#67e9ff" strokeWidth={0.7} opacity={0.35} />
        </g>
      ) : null}
      {beacon || node.id % 4 === 0 ? (
        <g opacity={0.7} filter="url(#iconBloom)">
          <Glyph kind={node.kind} color={color} fill={fill} strokeWidth={2.5} />
        </g>
      ) : null}
      <Glyph kind={node.kind} color={color} fill={fill} strokeWidth={2.1} />
      {node.kind !== "bit" ? (
        <circle cx={0} cy={0} r={2.3} fill="#d9fbff" opacity={0.5 + brightness * 0.3} />
      ) : null}
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const camera = getCamera(seconds);
  const nodeWorld = NODES.map((node) => nodePosition(node, seconds));
  const projectedNodes = nodeWorld.map((node) => project(node, camera));
  const visibleNodes = NODES
    .map((node, index) => ({node, projected: projectedNodes[index]}))
    .filter(({projected}) => projected.visible)
    .sort((a, b) => b.projected.depth - a.projected.depth);

  const visibleEdges = EDGES.flatMap((edge, index) => {
    const start = projectedNodes[edge.a];
    const end = projectedNodes[edge.b];
    if (
      start.depth <= NEAR ||
      end.depth <= NEAR ||
      start.depth >= FAR ||
      end.depth >= FAR ||
      Math.hypot(start.x - end.x, start.y - end.y) < 0.8 ||
      (!start.visible && !end.visible)
    ) {
      return [];
    }
    const avgDepth = (start.depth + end.depth) / 2;
    const endpointFade = Math.min(depthOpacity(start.depth), depthOpacity(end.depth));
    const opacity = depthOpacity(avgDepth) * endpointFade * edge.energy;
    const width = clamp(2200 / avgDepth, 0.48, 9.5);
    return [{edge, index, start, end, avgDepth, opacity, width}];
  }).sort((a, b) => b.avgDepth - a.avgDepth);

  const driftX = Math.sin(seconds * 0.18 + 0.3) * 70;
  const driftY = Math.cos(seconds * 0.15 + 0.8) * 46;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#00162f",
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{display: "block"}}
      >
        <defs>
          <linearGradient id="bgDepth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#001128" />
            <stop offset="0.46" stopColor="#00224a" />
            <stop offset="1" stopColor="#00152e" />
          </linearGradient>
          <radialGradient id="tunnelFog" cx="50%" cy="48%" r="66%">
            <stop offset="0" stopColor="#06689a" stopOpacity="0.44" />
            <stop offset="0.35" stopColor="#034979" stopOpacity="0.25" />
            <stop offset="0.74" stopColor="#012645" stopOpacity="0.06" />
            <stop offset="1" stopColor="#001024" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nodeHalo">
            <stop offset="0" stopColor="#c9f9ff" stopOpacity="0.98" />
            <stop offset="0.07" stopColor="#4de7ff" stopOpacity="0.9" />
            <stop offset="0.26" stopColor="#13bfe9" stopOpacity="0.34" />
            <stop offset="0.64" stopColor="#087bae" stopOpacity="0.09" />
            <stop offset="1" stopColor="#087bae" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="flareHalo">
            <stop offset="0" stopColor="#ecfeff" stopOpacity="1" />
            <stop offset="0.08" stopColor="#80efff" stopOpacity="0.94" />
            <stop offset="0.3" stopColor="#20c9f4" stopOpacity="0.36" />
            <stop offset="1" stopColor="#0078ba" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="49%" r="72%">
            <stop offset="0" stopColor="#00040e" stopOpacity="0" />
            <stop offset="0.6" stopColor="#00040e" stopOpacity="0.08" />
            <stop offset="0.83" stopColor="#00030b" stopOpacity="0.36" />
            <stop offset="1" stopColor="#000208" stopOpacity="0.72" />
          </radialGradient>
          <filter id="lineBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
          <filter id="iconBloom" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
          <filter id="focusNear" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="focusNearStrong" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="5.2" />
          </filter>
          <filter id="fogBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="48" />
          </filter>
        </defs>

        <rect width={W} height={H} fill="url(#bgDepth)" />
        <ellipse
          cx={960 + driftX}
          cy={520 + driftY}
          rx={720}
          ry={520}
          fill="url(#tunnelFog)"
          opacity={0.88}
          filter="url(#fogBlur)"
        />
        <ellipse
          cx={1110 - driftX * 0.45}
          cy={370 - driftY * 0.55}
          rx={420}
          ry={310}
          fill="#055a8f"
          opacity={0.08}
          filter="url(#fogBlur)"
        />

        <g style={{mixBlendMode: "screen"}} filter="url(#lineBloom)">
          {visibleEdges.map(({index, start, end, avgDepth, opacity, width}) => {
            const nearBoost = interpolate(avgDepth, [180, 900, 5000], [1.7, 1, 0.55], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pulse = 0.78 + Math.sin(seconds * 0.75 + index * 0.91) * 0.22;
            return (
              <line
                key={`glow-${index}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#1fcff5"
                strokeWidth={width * 4.6}
                strokeLinecap="round"
                opacity={opacity * 0.2 * nearBoost * pulse}
              />
            );
          })}
        </g>

        <g>
          {visibleEdges.map(({index, start, end, avgDepth, opacity, width}) => {
            const nearBoost = interpolate(avgDepth, [180, 900, 5000], [1.45, 1, 0.65], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <line
                key={`edge-${index}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={avgDepth < 850 ? "#31d9fb" : "#1389bd"}
                strokeWidth={width}
                strokeLinecap="round"
                opacity={opacity * 0.72 * nearBoost}
              />
            );
          })}
        </g>

        <g style={{mixBlendMode: "screen"}}>
          {visibleEdges.flatMap(({edge, index}) => {
            if (index % 3 !== 0) return [];
            const startWorld = nodeWorld[edge.a];
            const endWorld = nodeWorld[edge.b];
            const speed = 0.17 + hash01(index * 239 + 7) * 0.16;
            const count = index % 13 === 0 ? 3 : 1;
            return Array.from({length: count}, (_, beadIndex) => {
              const q = fract(seconds * speed + edge.phase - beadIndex * 0.055);
              const world = {
                x: startWorld.x + (endWorld.x - startWorld.x) * q,
                y: startWorld.y + (endWorld.y - startWorld.y) * q,
                z: startWorld.z + (endWorld.z - startWorld.z) * q,
              };
              const p = project(world, camera);
              if (!p.visible) return null;
              const opacity = depthOpacity(p.depth) * Math.sin(Math.PI * q) * (1 - beadIndex * 0.18);
              const radius = clamp(p.scale * (3.2 - beadIndex * 0.45), 1.2, 8.5);
              return (
                <g key={`packet-${index}-${beadIndex}`} opacity={opacity}>
                  <circle cx={p.x} cy={p.y} r={radius * 3.8} fill="url(#flareHalo)" opacity={0.6} />
                  <circle cx={p.x} cy={p.y} r={radius} fill="#d9fbff" />
                </g>
              );
            });
          })}
        </g>

        {visibleNodes.map(({node, projected}) => (
          <FileNode key={node.id} node={node} projected={projected} seconds={seconds} />
        ))}

        <g style={{mixBlendMode: "screen"}}>
          {visibleNodes.flatMap(({node, projected}) => {
            if (node.id % 23 !== 0 || projected.depth < 230) return [];
            const pulse = 0.5 + 0.5 * Math.sin(seconds * 1.45 + node.phase * TAU);
            const r = clamp(projected.scale * 82, 18, 110);
            return [
              <g key={`flare-${node.id}`} opacity={depthOpacity(projected.depth) * (0.24 + pulse * 0.34)}>
                <circle cx={projected.x} cy={projected.y} r={r} fill="url(#flareHalo)" />
                <path d={`M${projected.x - r * 1.8} ${projected.y}H${projected.x + r * 1.8}`} stroke="#6eeeff" strokeWidth={1.1} opacity={0.55} />
              </g>,
            ];
          })}
        </g>

        <rect width={W} height={H} fill="url(#vignette)" pointerEvents="none" />
        <rect width={W} height={H} fill="#0a91c7" opacity={0.018 + Math.sin(seconds * 0.43) * 0.006} pointerEvents="none" />
      </svg>
    </AbsoluteFill>
  );
};
