import React from "react";
import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * Original Remotion reconstruction of the supplied SEO-network reference.
 * Every visual is generated locally with SVG/CSS; there are no runtime assets,
 * logos, hotlinks, or non-deterministic values.
 */

const W = 1920;
const H = 1080;
export const MOTION_FPS = 60;
export const MOTION_DURATION_IN_FRAMES = 720;
export const MOTION_WIDTH = W;
export const MOTION_HEIGHT = H;
const FONT_CONDENSED =
  '"Arial Narrow", "Roboto Condensed", "Helvetica Neue Condensed", Impact, sans-serif';
const FONT_UI = 'Inter, "Helvetica Neue", Arial, sans-serif';

const palette = {
  black: "#010711",
  navy: "#02101E",
  navyLift: "#061B2D",
  cyan: "#34E0FA",
  cyanBright: "#BDF9FF",
  blue: "#249AF1",
  teal: "#34D8C9",
  white: "#FFFFFF",
  ice: "#D6E5EC",
  lavender: "#CBD1DE",
  magenta: "#D12778",
  lime: "#8BCB2C",
  amber: "#D7A82D",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const phase = (
  frame: number,
  fps: number,
  startSeconds: number,
  endSeconds: number,
  easing: (value: number) => number = easeOut,
) =>
  interpolate(
    frame,
    [startSeconds * fps, endSeconds * fps],
    [0, 1],
    {...clamp, easing},
  );

const FullFrame: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      display: "flex",
      ...style,
    }}
  >
    {children}
  </div>
);

const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

type MeshNode = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  bright: boolean;
};

type MeshEdge = {
  a: number;
  b: number;
  strength: number;
  accent: number;
};

const makeMesh = () => {
  const random = seededRandom(483123487);
  const nodes: MeshNode[] = [];
  const columns = 15;
  const rows = 10;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      nodes.push({
        x: -150 + column * 158 + (random() - 0.5) * 128,
        y: -110 + row * 142 + (random() - 0.5) * 112,
        depth: 0.35 + random() * 0.9,
        phase: random() * Math.PI * 2,
        bright: random() > 0.79,
      });
    }
  }

  const edges: MeshEdge[] = [];
  const addEdge = (a: number, b: number, strength: number) => {
    if (b < 0 || b >= nodes.length) return;
    edges.push({
      a,
      b,
      strength,
      accent: random(),
    });
  };

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column;
      if (column < columns - 1) addEdge(index, index + 1, 0.45 + random() * 0.5);
      if (row < rows - 1) addEdge(index, index + columns, 0.32 + random() * 0.5);
      if (row < rows - 1 && column < columns - 1 && random() > 0.23) {
        addEdge(index, index + columns + 1, 0.28 + random() * 0.52);
      }
      if (row < rows - 1 && column > 0 && random() > 0.58) {
        addEdge(index, index + columns - 1, 0.25 + random() * 0.44);
      }
    }
  }

  return {nodes, edges};
};

const mesh = makeMesh();

type MarkerType =
  | "square"
  | "diamond"
  | "triangle"
  | "hex"
  | "target"
  | "mail"
  | "brackets"
  | "bars";

type MarkerDatum = {
  x: number;
  y: number;
  size: number;
  color: string;
  type: MarkerType;
  phase: number;
  depth: number;
};

const makeMarkers = (): MarkerDatum[] => {
  const random = seededRandom(20260822);
  const types: MarkerType[] = [
    "square",
    "diamond",
    "triangle",
    "hex",
    "target",
    "mail",
    "brackets",
    "bars",
  ];
  const colors = [palette.magenta, palette.lime, palette.amber, palette.cyan];

  return Array.from({length: 52}, (_, index) => ({
    x: 30 + random() * 1860,
    y: 30 + random() * 1020,
    size: 12 + random() * 26,
    color: colors[index % colors.length],
    type: types[index % types.length],
    phase: random() * Math.PI * 2,
    depth: 0.35 + random() * 0.85,
  }));
};

const markers = makeMarkers();

const microWords = [
  "OPTIMIZATION",
  "STRATEGY",
  "SEARCH",
  "INDEXING",
  "CRAWLING",
  "CONTENT",
  "MARKETING",
  "RANKING",
  "RESULTS",
  "BOUNCE",
  "KEYWORDS",
  "LINK",
  "RELEVANCE",
  "VISIBILITY",
  "PAGE RANK",
  "SOCIAL MEDIA",
];

type MicroWord = {
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  opacity: number;
  phase: number;
  depth: number;
};

const makeMicroWords = (): MicroWord[] => {
  const random = seededRandom(31415926);
  const colors = [palette.blue, palette.cyan, palette.ice, palette.teal];
  return Array.from({length: 62}, (_, index) => ({
    x: -20 + random() * 1960,
    y: 20 + random() * 1040,
    text: microWords[index % microWords.length],
    size: 10 + random() * 17,
    color: colors[index % colors.length],
    opacity: 0.07 + random() * 0.15,
    phase: random() * Math.PI * 2,
    depth: 0.3 + random() * 0.9,
  }));
};

const backgroundWords = makeMicroWords();

const markerGlyph = (type: MarkerType, size: number) => {
  const half = size / 2;
  const inset = Math.max(2, size * 0.16);
  const r = size * 0.34;

  if (type === "square") {
    return <rect x={-half} y={-half} width={size} height={size} />;
  }
  if (type === "diamond") {
    return <rect x={-half * 0.72} y={-half * 0.72} width={size * 0.72} height={size * 0.72} transform="rotate(45)" />;
  }
  if (type === "triangle") {
    return <path d={`M0 ${-half} L${half} ${half} L${-half} ${half} Z`} />;
  }
  if (type === "hex") {
    return (
      <path
        d={`M${-r} ${-half} L${r} ${-half} L${half} 0 L${r} ${half} L${-r} ${half} L${-half} 0 Z`}
      />
    );
  }
  if (type === "target") {
    return (
      <>
        <circle cx="0" cy="0" r={half} />
        <circle cx="0" cy="0" r={half * 0.48} />
        <circle cx="0" cy="0" r={1.7} fill="currentColor" stroke="none" />
      </>
    );
  }
  if (type === "mail") {
    return (
      <>
        <rect x={-half} y={-half * 0.68} width={size} height={size * 0.68} />
        <path d={`M${-half} ${-half * 0.68} L0 ${inset} L${half} ${-half * 0.68}`} />
      </>
    );
  }
  if (type === "brackets") {
    return (
      <>
        <path d={`M${-inset} ${-half} H${-half} V${half} H${-inset}`} />
        <path d={`M${inset} ${-half} H${half} V${half} H${inset}`} />
      </>
    );
  }
  return (
    <>
      <path d={`M${-half} ${-half * 0.7} H${half * 0.15}`} />
      <path d={`M${-half * 0.2} 0 H${half}`} />
      <path d={`M${-half} ${half * 0.7} H${half * 0.45}`} />
    </>
  );
};

const NetworkField: React.FC<{
  frame: number;
  fps: number;
}> = ({frame, fps}) => {
  const time = frame / fps;
  const positions = mesh.nodes.map((node) => ({
    x:
      node.x +
      Math.sin(time * (0.27 + node.depth * 0.12) + node.phase) *
        16 *
        node.depth,
    y:
      node.y +
      Math.cos(time * (0.23 + node.depth * 0.1) + node.phase * 0.81) *
        12 *
        node.depth,
  }));

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "visible"}}
    >
      <defs>
        <filter id="nodeGlow" x="-250%" y="-250%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        {mesh.edges.map((edge, index) => {
          const a = positions[edge.a];
          const b = positions[edge.b];
          const pulse = 0.74 + Math.sin(time * 0.8 + index * 0.61) * 0.26;
          const colored = edge.accent > 0.94;
          return (
            <line
              key={`base-${edge.a}-${edge.b}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={
                colored
                  ? edge.accent > 0.97
                    ? palette.magenta
                    : palette.cyan
                  : "#90BCD0"
              }
              strokeWidth={0.55 + edge.strength * 1.2}
              opacity={(colored ? 0.17 : 0.08 + edge.strength * 0.19) * pulse}
            />
          );
        })}
      </g>

      <g opacity="0.72">
        {mesh.edges
          .filter((_, index) => index % 13 === 2)
          .map((edge, index) => {
            const a = positions[edge.a];
            const b = positions[edge.b];
            return (
              <line
                key={`flow-${edge.a}-${edge.b}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={index % 4 === 0 ? palette.cyan : palette.white}
                strokeWidth="1.5"
                strokeDasharray="2 17"
                strokeDashoffset={-(time * 24 + index * 9)}
                opacity="0.38"
              />
            );
          })}
      </g>

      <g>
        {mesh.nodes.map((node, index) => {
          const position = positions[index];
          const pulse = 0.45 + 0.55 * Math.max(0, Math.sin(time * 1.25 + node.phase));
          const radius = node.bright ? 2.3 + pulse * 2.2 : 0.8 + node.depth * 1.3;
          return (
            <g key={`node-${index}`}>
              {node.bright && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={6 + pulse * 7}
                  fill="none"
                  stroke={index % 5 === 0 ? palette.cyan : palette.white}
                  strokeWidth="0.65"
                  opacity={0.08 + pulse * 0.18}
                />
              )}
              <circle
                cx={position.x}
                cy={position.y}
                r={radius}
                fill={node.bright ? palette.white : "#8FC0D4"}
                opacity={node.bright ? 0.45 + pulse * 0.5 : 0.21 + pulse * 0.18}
                filter={node.bright ? "url(#nodeGlow)" : undefined}
              />
            </g>
          );
        })}
      </g>

      <g>
        {mesh.edges
          .filter((_, index) => index % 19 === 4)
          .map((edge, index) => {
            const a = positions[edge.a];
            const b = positions[edge.b];
            const progress = (time * (0.16 + (index % 4) * 0.026) + index * 0.17) % 1;
            const x = a.x + (b.x - a.x) * progress;
            const y = a.y + (b.y - a.y) * progress;
            return (
              <circle
                key={`signal-${edge.a}-${edge.b}`}
                cx={x}
                cy={y}
                r={2.1 + (index % 3)}
                fill={index % 4 === 0 ? palette.lime : palette.cyanBright}
                opacity={0.35 + Math.sin(progress * Math.PI) * 0.6}
                filter="url(#nodeGlow)"
              />
            );
          })}
      </g>
    </svg>
  );
};

const BackgroundWords: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const time = frame / fps;
  return (
    <FullFrame style={{pointerEvents: "none"}}>
      {backgroundWords.map((word, index) => {
        const x = word.x + Math.sin(time * 0.18 + word.phase) * 28 * word.depth;
        const y = word.y + Math.cos(time * 0.14 + word.phase) * 15 * word.depth;
        const flicker = 0.7 + Math.max(0, Math.sin(time * 0.95 + word.phase)) * 0.3;
        return (
          <div
            key={`${word.text}-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: y - word.size,
              color: word.color,
              opacity: word.opacity * flicker,
              fontFamily: FONT_CONDENSED,
              fontSize: word.size,
              fontWeight: 600,
              letterSpacing: 0.8,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {word.text}
          </div>
        );
      })}
    </FullFrame>
  );
};

const FloatingMarkers: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const time = frame / fps;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: "absolute", left: 0, top: 0, width: W, height: H}}
    >
      <defs>
        <filter id="markerGlow" x="-180%" y="-180%" width="360%" height="360%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {markers.map((marker, index) => {
        const pulse = 0.42 + Math.max(0, Math.sin(time * (0.9 + marker.depth * 0.22) + marker.phase)) * 0.58;
        const x = marker.x + Math.sin(time * 0.2 + marker.phase) * 22 * marker.depth;
        const y = marker.y + Math.cos(time * 0.16 + marker.phase) * 13 * marker.depth;
        const rotation = Math.sin(time * 0.13 + marker.phase) * 9;
        return (
          <g
            key={`marker-${index}`}
            transform={`translate(${x} ${y}) rotate(${rotation})`}
            color={marker.color}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25 + marker.depth * 0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.18 + pulse * 0.58}
            filter={pulse > 0.82 ? "url(#markerGlow)" : undefined}
          >
            {markerGlyph(marker.type, marker.size)}
          </g>
        );
      })}
    </svg>
  );
};

const GlitchData: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const time = frame / fps;
  const bars = Array.from({length: 22}, (_, index) => {
    const random = seededRandom(8888 + index * 71);
    return {
      x: random() * 1860,
      y: random() * 1050,
      w: 14 + random() * 78,
      color: index % 3 === 0 ? palette.magenta : index % 3 === 1 ? palette.lime : palette.cyan,
      phase: random() * 8,
    };
  });

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: "absolute", left: 0, top: 0, width: W, height: H}}
    >
      {bars.map((bar, index) => {
        const flicker = Math.sin(time * 5.7 + bar.phase) > 0.79 ? 1 : 0;
        const slide = ((time * (18 + (index % 4) * 5) + bar.phase * 10) % 56) - 28;
        return (
          <g key={`glitch-${index}`} opacity={flicker * (0.12 + (index % 4) * 0.055)}>
            <rect x={bar.x + slide} y={bar.y} width={bar.w} height="4" fill={bar.color} />
            <rect x={bar.x + slide + 8} y={bar.y + 7} width={bar.w * 0.58} height="2" fill={bar.color} />
          </g>
        );
      })}
    </svg>
  );
};

type PrimaryWordProps = {
  children: React.ReactNode;
  x: number;
  y: number;
  size: number;
  fill: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  tracking?: number;
  glow?: boolean;
  opacity?: number;
};

const PrimaryWord: React.FC<PrimaryWordProps> = ({
  children,
  x,
  y,
  size,
  fill,
  weight = 800,
  anchor = "start",
  tracking = 0.2,
  glow = false,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y - size * 0.84,
      color: fill,
      fontFamily: FONT_CONDENSED,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: tracking,
      lineHeight: 0.95,
      whiteSpace: "nowrap",
      opacity,
      transform:
        anchor === "middle"
          ? "translateX(-50%) scaleX(0.72)"
          : anchor === "end"
            ? "translateX(-100%) scaleX(0.72)"
            : "scaleX(0.72)",
      transformOrigin:
        anchor === "middle" ? "center center" : anchor === "end" ? "right center" : "left center",
      textShadow: glow
        ? `0 0 9px ${fill}, 0 0 22px ${fill}`
        : `0 0 4px ${fill}88`,
    }}
  >
    {children}
  </div>
);

const WordCloud: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const time = frame / fps;
  const breathe = 1 + Math.sin((time - 1) * 0.67) * 0.006;
  const yaw = phase(frame, fps, 1, 8.25, Easing.linear);
  const yawScaleX = 1 + yaw * 0.14;
  const x = Math.sin((time - 1) * 0.29) * 7 + Math.sin(time * 0.09) * 4;
  const y = Math.cos((time - 1) * 0.24) * 4 - yaw * 11;
  const shimmer = 0.965 + Math.sin(time * 2.8) * 0.025;

  return (
    <FullFrame
      style={{
        overflow: "visible",
        transform: `translate(${x}px, ${y}px) scaleX(${yawScaleX}) scaleY(${breathe})`,
        transformOrigin: "660px 540px",
        opacity: shimmer,
      }}
    >
        <PrimaryWord x={760} y={233} size={27} fill={palette.blue} weight={700} tracking={1.2}>
          SOCIAL MEDIA
        </PrimaryWord>

        <PrimaryWord x={422} y={351} size={77} fill={palette.teal} tracking={0.1}>
          LINK BUILDING
        </PrimaryWord>

        <PrimaryWord x={1000} y={306} size={70} fill={palette.lavender} tracking={0.3}>
          BOUNCE RATE
        </PrimaryWord>

        <PrimaryWord x={954} y={361} size={32} fill={palette.ice} weight={700} tracking={0.6}>
          VISIBILITY
        </PrimaryWord>

        <PrimaryWord x={370} y={470} size={67} fill={palette.blue} tracking={0.2}>
          ALGORITHM
        </PrimaryWord>

        <PrimaryWord x={414} y={541} size={47} fill={palette.cyan} weight={700} tracking={0.3}>
          RELEVANCE
        </PrimaryWord>

        <PrimaryWord x={520} y={592} size={28} fill={palette.lavender} weight={700} tracking={0.5} opacity={0.82}>
          PAGE RANK
        </PrimaryWord>

        <PrimaryWord x={1235} y={442} size={77} fill={palette.cyan} tracking={-0.2}>
          CONTENT
        </PrimaryWord>
        <PrimaryWord x={1235} y={516} size={77} fill={palette.cyan} tracking={-0.6}>
          MARKETING
        </PrimaryWord>

        <PrimaryWord x={1302} y={591} size={33} fill={palette.ice} weight={700} tracking={0.4}>
          INDEXING
        </PrimaryWord>

        <PrimaryWord x={1350} y={670} size={61} fill={palette.blue} tracking={0.1}>
          ANALYSIS
        </PrimaryWord>

        <PrimaryWord x={484} y={742} size={77} fill={palette.ice} tracking={-0.1}>
          KEYWORD
        </PrimaryWord>
        <PrimaryWord x={548} y={820} size={77} fill={palette.ice} tracking={-0.3}>
          DENSITY
        </PrimaryWord>

        <PrimaryWord x={856} y={738} size={26} fill={palette.cyan} weight={700} tracking={0.5}>
          SEARCH ENGINE OPTIMIZATION
        </PrimaryWord>

        <PrimaryWord x={1067} y={844} size={76} fill={palette.teal} tracking={0}>
          BACKLINKS
        </PrimaryWord>

        <div
          style={{
            position: "absolute",
            left: 925,
            top: 442,
            color: palette.cyan,
            opacity: 0.68,
            fontFamily: FONT_CONDENSED,
            fontSize: 247,
            fontWeight: 900,
            letterSpacing: -5,
            lineHeight: 0.9,
            whiteSpace: "nowrap",
            transform: "translateX(-50%) scaleX(0.74) scaleY(1.16)",
            transformOrigin: "center center",
            filter: "blur(13px)",
          }}
        >
          SEO
        </div>

        <div
          style={{
            position: "absolute",
            left: 925,
            top: 442,
            color: palette.white,
            fontFamily: FONT_CONDENSED,
            fontSize: 247,
            fontWeight: 900,
            letterSpacing: -5,
            lineHeight: 0.9,
            whiteSpace: "nowrap",
            transform: "translateX(-50%) scaleX(0.74) scaleY(1.16)",
            transformOrigin: "center center",
          }}
        >
          SEO
        </div>
    </FullFrame>
  );
};

const RadialStreaks: React.FC<{
  progress: number;
  opacity: number;
  reverse?: boolean;
}> = ({progress, opacity, reverse = false}) => {
  const random = seededRandom(17012026);
  const streaks = Array.from({length: 58}, (_, index) => {
    const angle = random() * Math.PI * 2;
    const inner = 45 + random() * 205;
    const length = 160 + random() * 620;
    const color =
      index % 7 === 0
        ? palette.magenta
        : index % 7 === 1
          ? palette.lime
          : index % 9 === 0
            ? palette.amber
            : index % 3 === 0
              ? palette.cyan
              : palette.ice;
    return {angle, inner, length, color, width: 0.8 + random() * 3};
  });

  const drive = reverse ? 1 - progress : progress;
  const span = reverse ? Math.sin(progress * Math.PI) : progress;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: "absolute", left: 0, top: 0, width: W, height: H, opacity, mixBlendMode: "screen"}}
    >
      <defs>
        <filter id="streakGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {streaks.map((streak, index) => {
        const startRadius = streak.inner * (0.55 + drive * 0.9);
        const endRadius = startRadius + streak.length * (0.12 + span * 0.88);
        const x1 = 960 + Math.cos(streak.angle) * startRadius;
        const y1 = 540 + Math.sin(streak.angle) * startRadius * 0.62;
        const x2 = 960 + Math.cos(streak.angle) * endRadius;
        const y2 = 540 + Math.sin(streak.angle) * endRadius * 0.62;
        return (
          <line
            key={`streak-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={streak.color}
            strokeWidth={streak.width}
            opacity={0.1 + (index % 5) * 0.09}
            filter={index % 6 === 0 ? "url(#streakGlow)" : undefined}
          />
        );
      })}
    </svg>
  );
};

const BlurredSphere: React.FC<{
  frame: number;
  durationInFrames: number;
  opacity: number;
  blur: number;
  scale: number;
}> = ({frame, durationInFrames, opacity, blur, scale}) => {
  const loopLength = Math.max(1, durationInFrames - 1);
  const time = ((frame % loopLength) / loopLength) * Math.PI * 2;
  const random = seededRandom(99551);
  const points = Array.from({length: 78}, (_, index) => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 365;
    return {
      x: 455 + Math.cos(angle) * radius,
      y: 455 + Math.sin(angle) * radius,
      color:
        index % 9 === 0
          ? palette.magenta
          : index % 7 === 0
            ? palette.lime
            : palette.cyan,
      phase: random() * Math.PI * 2,
      size: 2 + random() * 7,
    };
  });

  const animatedPoints = points.map((point) => ({
    ...point,
    x: point.x + Math.sin(time * 0.3 + point.phase) * 15,
    y: point.y + Math.cos(time * 0.23 + point.phase) * 10,
  }));

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 910,
        height: 910,
        marginLeft: -455,
        marginTop: -455,
        display: "flex",
        borderRadius: "50%",
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        background:
          "radial-gradient(circle at 43% 42%, rgba(45,171,216,.18) 0%, transparent 40%), radial-gradient(circle at 61% 59%, rgba(27,116,165,.14) 0%, transparent 44%), radial-gradient(circle at 51% 49%, rgba(28,119,166,.14) 0%, rgba(8,48,82,.46) 57%, rgba(3,22,41,.22) 73%, transparent 83%)",
        boxShadow:
          "inset 0 0 80px rgba(82,196,232,0.11), 0 0 110px rgba(11,76,119,0.2)",
      }}
    >
      <svg width={910} height={910} viewBox="0 0 910 910">
        <defs>
          <clipPath id="sphereClip">
            <circle cx="455" cy="455" r="370" />
          </clipPath>
          <filter id="sphereGlow" x="-180%" y="-180%" width="360%" height="360%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g clipPath="url(#sphereClip)" opacity="0.5">
          {animatedPoints.map((point, index) => {
            const next = animatedPoints[(index + 11) % animatedPoints.length];
            return (
              <g key={`sphere-point-${index}`}>
                <line
                  x1={point.x}
                  y1={point.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="#78AECB"
                  strokeWidth="1"
                  opacity="0.23"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.size}
                  fill={point.color}
                  opacity={0.3 + Math.max(0, Math.sin(time + point.phase)) * 0.5}
                  filter={index % 8 === 0 ? "url(#sphereGlow)" : undefined}
                />
              </g>
            );
          })}
          <ellipse cx="455" cy="455" rx="367" ry="140" fill="none" stroke="#4E9CBD" strokeWidth="1" opacity="0.08" />
          <ellipse cx="455" cy="455" rx="367" ry="255" fill="none" stroke="#5BA7C4" strokeWidth="0.8" opacity="0.06" />
          <ellipse cx="455" cy="455" rx="155" ry="367" fill="none" stroke="#5BA7C4" strokeWidth="0.8" opacity="0.06" />
          <ellipse cx="455" cy="455" rx="275" ry="367" fill="none" stroke="#5BA7C4" strokeWidth="0.8" opacity="0.045" />
        </g>
      </svg>
    </div>
  );
};

const BaseBackground: React.FC<{frame: number; durationInFrames: number}> = ({frame, durationInFrames}) => {
  const loopLength = Math.max(1, durationInFrames - 1);
  const drift = Math.sin(((frame % loopLength) / loopLength) * Math.PI * 2) * 9;
  return (
    <FullFrame
      style={{
        background:
          "radial-gradient(ellipse 82% 95% at 50% 48%, #08233A 0%, #031525 40%, #020C18 72%, #01050B 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -40,
          top: -40,
          width: W + 80,
          height: H + 80,
          transform: `translate(${drift}px, ${-drift * 0.32}px)`,
          opacity: 0.35,
          backgroundImage:
            "radial-gradient(circle, rgba(92,172,200,0.32) 1px, transparent 1.3px)",
          backgroundSize: "23px 23px",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 95% at 50% 50%, #000 18%, rgba(0,0,0,.75) 58%, transparent 94%)",
          maskImage:
            "radial-gradient(ellipse 85% 95% at 50% 50%, #000 18%, rgba(0,0,0,.75) 58%, transparent 94%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          opacity: 0.15,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(166,225,240,0.08) 0px, rgba(166,225,240,0.08) 1px, transparent 1px, transparent 4px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          background:
            "radial-gradient(ellipse 68% 76% at 50% 48%, transparent 34%, rgba(0,5,12,0.2) 68%, rgba(0,3,8,0.76) 100%)",
        }}
      />
    </FullFrame>
  );
};

export const MotionCanvas: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({frame, fps, durationInFrames}) => {
  const durationSeconds = durationInFrames / fps;
  const closeStart = Math.max(2.2, durationSeconds - 1.09);
  const opening = phase(frame, fps, 0.70, 1.01, easeInOut);
  const closing = phase(frame, fps, closeStart, closeStart + 0.22, easeOut);
  const sceneVisibility =
    phase(frame, fps, 0.66, 0.82, easeOut) *
    (1 - phase(frame, fps, closeStart + 0.15, closeStart + 0.35, easeOut));

  const sceneScale = closing > 0
    ? interpolate(closing, [0, 1], [1, 0.075], clamp)
    : interpolate(opening, [0, 1], [0.075, 1], clamp);
  const sceneBlur = closing > 0
    ? interpolate(closing, [0, 1], [0, 18], clamp)
    : interpolate(opening, [0, 1], [18, 0], clamp);
  const clipRadius = closing > 0
    ? interpolate(closing, [0, 1], [1500, 350], clamp)
    : interpolate(opening, [0, 1], [350, 1500], clamp);

  const introSphereOpacity = 1 - phase(frame, fps, 0.74, 1.04, easeOut);
  const outroSphereOpacity = phase(frame, fps, closeStart + 0.10, closeStart + 0.30, easeOut);
  const sphereOpacity = Math.max(introSphereOpacity, outroSphereOpacity);
  const sphereBlur = closing > 0
    ? interpolate(outroSphereOpacity, [0, 1], [3, 16], clamp)
    : interpolate(opening, [0, 1], [16, 3], clamp);
  const sphereScale = closing > 0
    ? interpolate(outroSphereOpacity, [0, 1], [1.08, 0.84], clamp)
    : interpolate(opening, [0, 1], [0.84, 1.08], clamp);

  const settledTime = Math.max(0, frame / fps - 1);
  const cameraX = Math.sin(settledTime * 0.27) * 24 + Math.sin(settledTime * 0.08) * 10;
  const cameraY = Math.cos(settledTime * 0.22) * 12;
  const cameraScale = 1.025 + Math.sin(settledTime * 0.31) * 0.012;

  const entranceBurst = phase(frame, fps, 0.73, 0.84, easeOut) *
    (1 - phase(frame, fps, 0.96, 1.08, easeOut));
  const exitBurst = phase(frame, fps, closeStart - 0.02, closeStart + 0.07, easeOut) *
    (1 - phase(frame, fps, closeStart + 0.08, closeStart + 0.20, easeOut));

  return (
    <FullFrame
      style={{
        width: W,
        height: H,
        backgroundColor: palette.black,
        fontFamily: FONT_UI,
      }}
    >
      <BaseBackground frame={frame} durationInFrames={durationInFrames} />

      {sphereOpacity > 0.0005 && (
        <BlurredSphere
          frame={frame}
          durationInFrames={durationInFrames}
          opacity={sphereOpacity}
          blur={sphereBlur}
          scale={sphereScale}
        />
      )}

      {sceneVisibility > 0.0005 && (
        <FullFrame
          style={{
            opacity: sceneVisibility,
            clipPath: `circle(${clipRadius}px at 50% 50%)`,
          }}
        >
          <FullFrame
            style={{
              transform: `scale(${sceneScale})`,
              transformOrigin: "50% 50%",
              filter: sceneBlur > 0.05 ? `blur(${sceneBlur}px)` : undefined,
            }}
          >
            <FullFrame
              style={{
                transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
                transformOrigin: "50% 50%",
              }}
            >
              <BackgroundWords frame={frame} fps={fps} />
              <NetworkField frame={frame} fps={fps} />
              <GlitchData frame={frame} fps={fps} />
              <FloatingMarkers frame={frame} fps={fps} />
            </FullFrame>

            <WordCloud frame={frame} fps={fps} />
          </FullFrame>
        </FullFrame>
      )}

      {entranceBurst > 0.001 && <RadialStreaks progress={opening} opacity={entranceBurst} />}
      {exitBurst > 0.001 && <RadialStreaks progress={closing} opacity={exitBurst} reverse />}

    </FullFrame>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return (
    <MotionCanvas
      frame={frame}
      fps={fps}
      durationInFrames={durationInFrames}
    />
  );
};
