import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  bg: "#020812",
  panel: "rgba(6, 16, 30, 0.92)",
  panelSoft: "rgba(8, 22, 39, 0.78)",
  border: "#18334c",
  borderBright: "#24506c",
  text: "#ecf8ff",
  muted: "#7690a5",
  dim: "#405b70",
  cyan: "#28d9e7",
  mint: "#55f2c0",
  violet: "#9b78ff",
  amber: "#ffbd66",
  red: "#ff6f7d",
};

const FONT =
  "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const enter = (frame: number, start: number, duration = 34) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const fadeWindow = (
  frame: number,
  start: number,
  end: number,
  feather = 16,
) => {
  if (frame < start || frame > end) return 0;
  const fadeIn = interpolate(frame, [start, start + feather], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [end - feather, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
};

const seeded = (value: number) => {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const linePath = (
  width: number,
  height: number,
  count: number,
  phase: number,
  seed: number,
  amplitude = 0.3,
) => {
  const points = Array.from({length: count}, (_, index) => {
    const t = index / (count - 1);
    const baseline =
      0.5 +
      Math.sin(t * Math.PI * 3.4 + phase + seed) * amplitude * 0.62 +
      Math.sin(t * Math.PI * 7.2 - phase * 0.57 + seed * 2.1) *
        amplitude *
        0.26 +
      Math.cos(t * Math.PI * 1.45 + phase * 0.32) * amplitude * 0.2;
    return {
      x: t * width,
      y: clamp01(baseline) * height,
    };
  });

  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(
          2,
        )}`,
    )
    .join(" ");
};

const Panel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  eyebrow?: string;
  accent?: string;
  delay?: number;
  uiOpacity: number;
  children: React.ReactNode;
}> = ({
  x,
  y,
  width,
  height,
  title,
  eyebrow,
  accent = C.cyan,
  delay = 0,
  uiOpacity,
  children,
}) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, delay, 34);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        overflow: "hidden",
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        background: `linear-gradient(145deg, ${C.panelSoft}, ${C.panel})`,
        boxShadow:
          "0 18px 48px rgba(0,0,0,0.24), inset 0 1px 0 rgba(150,220,255,0.035)",
        opacity: uiOpacity * progress,
        transform: `translateY(${(1 - progress) * 16}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 48,
          borderBottom: `1px solid ${C.border}`,
          background:
            "linear-gradient(90deg, rgba(38,217,231,0.055), transparent 42%, rgba(155,120,255,0.035))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 14,
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: accent,
          boxShadow: `0 0 14px ${accent}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 38,
          top: 11,
          color: C.text,
          fontFamily: FONT,
          fontSize: 16,
          lineHeight: "20px",
          fontWeight: 700,
          letterSpacing: 2.1,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>
      {eyebrow ? (
        <div
          style={{
            position: "absolute",
            right: 18,
            top: 13,
            color: accent,
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: "18px",
            fontWeight: 700,
            letterSpacing: 1.45,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 78,
          height: 2,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 52,
          height: 2,
          background: `linear-gradient(270deg, ${accent}, transparent)`,
          opacity: 0.5,
        }}
      />
      {children}
    </div>
  );
};

const TinySparkline: React.FC<{
  width: number;
  height: number;
  color: string;
  seed: number;
  phase: number;
  filled?: boolean;
}> = ({width, height, color, seed, phase, filled = false}) => {
  const path = linePath(width, height, 30, phase, seed, 0.24);
  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const id = `spark-${seed.toString().replace(".", "-")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled ? <path d={fillPath} fill={`url(#${id})`} /> : null}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const WorkflowsPanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = (frame / fps) * 0.8;
  const items = [
    ["Incident triage", 82, C.cyan],
    ["Knowledge retrieval", 74, C.mint],
    ["Policy verification", 96, C.violet],
    ["Response drafting", 68, C.cyan],
    ["Risk assessment", 91, C.mint],
    ["Action execution", 79, C.cyan],
    ["Outcome review", 64, C.violet],
  ] as const;

  return (
    <Panel
      x={40}
      y={116}
      width={356}
      height={594}
      title="Live workflows"
      eyebrow={frame > 410 && frame < 930 ? "08 active" : "03 active"}
      delay={10}
      uiOpacity={uiOpacity}
    >
      <div style={{position: "absolute", left: 22, right: 22, top: 64}}>
        {items.map(([label, base, color], index) => {
          const itemIn = enter(frame, 30 + index * 7, 26);
          const value = Math.round(
            Math.max(
              18,
              Math.min(
                99,
                base +
                  Math.sin(phase * 0.72 + index * 1.13) * 3.2 +
                  Math.sin(phase * 0.31 + index) * 1.5,
              ),
            ),
          );
          return (
            <div
              key={label}
              style={{
                height: 67,
                opacity: itemIn,
                transform: `translateX(${(1 - itemIn) * -12}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 11,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: C.text,
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                  />
                  {label}
                </div>
                <div
                  style={{
                    color,
                    fontFamily: FONT,
                    fontSize: 15,
                    fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {value.toString().padStart(2, "0")}%
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 5,
                  marginLeft: 17,
                  borderRadius: 9,
                  backgroundColor: "rgba(88,120,145,0.14)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${value}%`,
                    height: "100%",
                    borderRadius: 9,
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    boxShadow: `0 0 12px ${color}66`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 19,
          height: 42,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.4,
          }}
        >
          TASKS TODAY
        </span>
        <span
          style={{
            color: C.mint,
            fontFamily: FONT,
            fontSize: 22,
            lineHeight: "24px",
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(1248 + Math.sin(phase * 0.7) * 18)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      </div>
    </Panel>
  );
};

type AgentNode = {
  label: string;
  sub: string;
  x: number;
  y: number;
  start: number;
  color: string;
};

const nodes: AgentNode[] = [
  {label: "REQUEST", sub: "mission ingest", x: 28, y: 178, start: 100, color: C.cyan},
  {label: "ROUTER", sub: "intent classify", x: 198, y: 72, start: 180, color: C.cyan},
  {label: "PLANNER", sub: "12-step plan", x: 394, y: 26, start: 260, color: C.mint},
  {label: "RESEARCH", sub: "ground context", x: 390, y: 166, start: 360, color: C.violet},
  {label: "CONTEXT", sub: "memory sync", x: 194, y: 292, start: 450, color: C.cyan},
  {label: "POLICY", sub: "guardrail check", x: 586, y: 76, start: 555, color: C.violet},
  {label: "ACTION", sub: "tool execution", x: 590, y: 260, start: 660, color: C.cyan},
  {label: "VALIDATOR", sub: "evidence review", x: 770, y: 130, start: 765, color: C.mint},
  {label: "RESPONSE", sub: "verified output", x: 800, y: 294, start: 870, color: C.mint},
];

const edgePairs: Array<[number, number, number]> = [
  [0, 1, -10],
  [1, 2, -8],
  [1, 4, 14],
  [2, 3, 8],
  [3, 4, 15],
  [2, 5, -10],
  [3, 6, 12],
  [4, 6, 20],
  [5, 7, -12],
  [6, 7, 12],
  [7, 8, 16],
];

const quadraticPoint = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  t: number,
) => {
  const mt = 1 - t;
  return {
    x: mt * mt * ax + 2 * mt * t * bx + t * t * cx,
    y: mt * mt * ay + 2 * mt * t * by + t * t * cy,
  };
};

const MissionBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const phases = [
    {
      start: 54,
      end: 112,
      title: "READY FOR MISSION",
      detail: "Secure baseline synchronized",
      color: C.cyan,
    },
    {
      start: 112,
      end: 228,
      title: "NEW MISSION RECEIVED",
      detail: "Resolve priority service incident",
      color: C.amber,
    },
    {
      start: 228,
      end: 412,
      title: "PLAN GENERATED",
      detail: "12 steps · 3 specialist agents",
      color: C.cyan,
    },
    {
      start: 412,
      end: 712,
      title: "EXECUTING WORKFLOW",
      detail: "Context grounded · tools active",
      color: C.cyan,
    },
    {
      start: 712,
      end: 902,
      title: "POLICY VERIFIED",
      detail: "Risk level low · action approved",
      color: C.mint,
    },
    {
      start: 902,
      end: 1082,
      title: "MISSION COMPLETE",
      detail: "Priority incident resolved",
      color: C.mint,
    },
    {
      start: 1082,
      end: 1199,
      title: "READY FOR MISSION",
      detail: "Secure baseline synchronized",
      color: C.cyan,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 22,
        right: 22,
        top: 62,
        height: 82,
        borderRadius: 9,
        border: `1px solid ${C.borderBright}`,
        background:
          "linear-gradient(90deg, rgba(24,53,74,0.40), rgba(6,18,32,0.72))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: C.cyan,
          boxShadow: `0 0 16px ${C.cyan}`,
        }}
      />
      {phases.map((phase) => {
        const opacity = fadeWindow(frame, phase.start, phase.end, 18);
        const move = interpolate(
          frame,
          [phase.start, phase.start + 18, phase.end - 18, phase.end],
          [10, 0, 0, -8],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          },
        );
        return (
          <div
            key={`${phase.start}-${phase.title}`}
            style={{
              position: "absolute",
              inset: 0,
              opacity,
              transform: `translateY(${move}px)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 13,
                color: phase.color,
                fontFamily: FONT,
                fontSize: 21,
                lineHeight: "26px",
                fontWeight: 850,
                letterSpacing: 1.4,
              }}
            >
              {phase.title}
            </div>
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 44,
                color: C.text,
                fontFamily: FONT,
                fontSize: 17,
                lineHeight: "22px",
                fontWeight: 600,
              }}
            >
              {phase.detail}
            </div>
            <div
              style={{
                position: "absolute",
                right: 22,
                top: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: phase.color,
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: phase.color,
                  boxShadow: `0 0 14px ${phase.color}`,
                }}
              />
              LIVE
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WorkflowGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const graphWidth = 978;
  const graphHeight = 404;
  const nodeWidth = 150;
  const nodeHeight = 64;
  const reset = interpolate(frame, [1080, 1144], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const success = interpolate(frame, [900, 948], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 25,
        top: 160,
        width: graphWidth,
        height: graphHeight,
      }}
    >
      <svg
        width={graphWidth}
        height={graphHeight}
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <filter id="agent-path-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="core-aura">
            <stop offset="0" stopColor={C.cyan} stopOpacity="0.12" />
            <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="492"
          cy="212"
          rx={220 + success * 22}
          ry={128 + success * 12}
          fill="url(#core-aura)"
          opacity={0.45 + success * 0.28}
        />
        {edgePairs.map(([from, to, bend], index) => {
          const a = nodes[from];
          const b = nodes[to];
          const ax = a.x + nodeWidth / 2;
          const ay = a.y + nodeHeight / 2;
          const cx = b.x + nodeWidth / 2;
          const cy = b.y + nodeHeight / 2;
          const bx = (ax + cx) / 2;
          const by = (ay + cy) / 2 + bend;
          const complete = clamp01((frame - b.start) / 36) * reset;
          const signalT =
            ((frame / fps) * 0.44 + index * 0.137) % 1;
          const point = quadraticPoint(ax, ay, bx, by, cx, cy, signalT);
          const color = b.color;
          return (
            <g key={`${from}-${to}`}>
              <path
                d={`M ${ax} ${ay} Q ${bx} ${by} ${cx} ${cy}`}
                fill="none"
                stroke="#1e4059"
                strokeWidth={1.4}
                strokeDasharray="4 8"
                opacity={0.65}
              />
              <path
                d={`M ${ax} ${ay} Q ${bx} ${by} ${cx} ${cy}`}
                fill="none"
                stroke={color}
                strokeWidth={2.1}
                pathLength={1}
                strokeDasharray={`${complete} 1`}
                opacity={0.38 + complete * 0.52}
                filter="url(#agent-path-glow)"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={2.8 + complete * 1.3}
                fill={color}
                opacity={(0.22 + complete * 0.78) * reset}
                filter="url(#agent-path-glow)"
              />
            </g>
          );
        })}
      </svg>
      {nodes.map((node, index) => {
        const complete = clamp01((frame - node.start) / 32) * reset;
        const nextStart = nodes[index + 1]?.start ?? 940;
        const isCurrent =
          frame >= node.start && frame < nextStart && frame < 920;
        const pulse =
          0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2.2 + index);
        const successBoost = frame >= 900 ? success * reset : 0;
        const borderOpacity = 0.22 + complete * 0.6 + successBoost * 0.18;
        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: nodeWidth,
              height: nodeHeight,
              borderRadius: 10,
              border: `1px solid ${node.color}${Math.round(
                borderOpacity * 255,
              )
                .toString(16)
                .padStart(2, "0")}`,
              background: `linear-gradient(145deg, ${node.color}10, rgba(4,14,27,0.96))`,
              boxShadow:
                isCurrent || successBoost > 0.5
                  ? `0 0 ${18 + pulse * 11}px ${node.color}38, inset 0 0 18px ${node.color}12`
                  : "inset 0 1px 0 rgba(255,255,255,0.025)",
              opacity: 0.5 + complete * 0.5,
              transform: `scale(${1 + (isCurrent ? pulse * 0.012 : 0)})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 18,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 12,
                width: 3,
                height: 38,
                borderRadius: "0 3px 3px 0",
                background: node.color,
                opacity: 0.35 + complete * 0.65,
                boxShadow: `0 0 12px ${node.color}`,
              }}
            />
            <div
              style={{
                color: complete > 0.25 ? C.text : C.muted,
                fontFamily: FONT,
                fontSize: 17,
                lineHeight: "21px",
                fontWeight: 800,
                letterSpacing: 1.1,
              }}
            >
              {node.label}
            </div>
            <div
              style={{
                color: node.color,
                fontFamily: FONT,
                fontSize: 12,
                lineHeight: "16px",
                fontWeight: 650,
                letterSpacing: 0.6,
                marginTop: 2,
              }}
            >
              {node.sub}
            </div>
            <div
              style={{
                position: "absolute",
                right: 12,
                top: 13,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: complete > 0.2 ? node.color : C.dim,
                boxShadow:
                  complete > 0.2 ? `0 0 11px ${node.color}` : "none",
              }}
            />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 404,
          bottom: 4,
          width: 174,
          height: 32,
          borderRadius: 18,
          border: `1px solid ${C.borderBright}`,
          color:
            frame >= 1082 ? C.cyan : frame >= 900 ? C.mint : C.cyan,
          backgroundColor: "rgba(5,18,31,0.82)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1.2,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor:
              frame >= 1082 ? C.cyan : frame >= 900 ? C.mint : C.cyan,
            boxShadow: `0 0 10px ${
              frame >= 1082 ? C.cyan : frame >= 900 ? C.mint : C.cyan
            }`,
          }}
        />
        {frame >= 1082
          ? "READY STATE"
          : frame >= 900
            ? "SYNC COMPLETE"
            : "LIVE EXECUTION"}
      </div>
    </div>
  );
};

const MainWorkflowPanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => (
  <Panel
    x={412}
    y={116}
    width={1028}
    height={594}
    title="Agent workflow / live mission"
    eyebrow="trace 7F-A2"
    accent={C.cyan}
    delay={18}
    uiOpacity={uiOpacity}
  >
    <MissionBanner />
    <WorkflowGraph />
  </Panel>
);

const CapacityPanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = frame / fps;
  const cols = 12;
  const rows = 6;

  return (
    <Panel
      x={1456}
      y={116}
      width={424}
      height={286}
      title="Regional capacity"
      eyebrow="balanced"
      accent={C.violet}
      delay={24}
      uiOpacity={uiOpacity}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: 66,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 22px)`,
          gap: 6,
        }}
      >
        {Array.from({length: cols * rows}, (_, index) => {
          const signal =
            0.52 +
            Math.sin(phase * 1.25 + index * 0.77) * 0.24 +
            (seeded(index + 4) - 0.5) * 0.28;
          const hueColor =
            index % 5 === 0
              ? C.violet
              : index % 7 === 0
                ? C.mint
                : C.cyan;
          return (
            <div
              key={index}
              style={{
                borderRadius: 3,
                backgroundColor: hueColor,
                opacity: 0.18 + clamp01(signal) * 0.76,
                boxShadow:
                  signal > 0.72 ? `0 0 9px ${hueColor}55` : "none",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 18,
          display: "flex",
          justifyContent: "space-between",
          color: C.muted,
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        <span>NORTH AMERICA</span>
        <span>EUROPE</span>
        <span>ASIA PACIFIC</span>
      </div>
    </Panel>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  color: string;
  phase: number;
  seed: number;
}> = ({label, value, color, phase, seed}) => (
  <div
    style={{
      position: "relative",
      height: 88,
      borderRadius: 9,
      border: `1px solid ${C.border}`,
      backgroundColor: "rgba(9,24,41,0.62)",
      padding: "12px 13px",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        color: C.muted,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 750,
        letterSpacing: 1.05,
      }}
    >
      {label}
    </div>
    <div
      style={{
        color,
        fontFamily: FONT,
        fontSize: 25,
        lineHeight: "31px",
        fontWeight: 850,
        fontVariantNumeric: "tabular-nums",
        marginTop: 4,
      }}
    >
      {value}
    </div>
    <div style={{position: "absolute", right: 10, bottom: 12}}>
      <TinySparkline
        width={68}
        height={28}
        color={color}
        seed={seed}
        phase={phase}
      />
    </div>
  </div>
);

const AssurancePanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = frame / fps;
  const verified = interpolate(frame, [690, 850], [78, 99], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <Panel
      x={1456}
      y={418}
      width={424}
      height={292}
      title="Decision assurance"
      eyebrow="secure"
      accent={C.mint}
      delay={30}
      uiOpacity={uiOpacity}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 62,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <MetricCard
          label="SUCCESS RATE"
          value={`${(98.5 + Math.sin(phase * 0.72) * 0.2).toFixed(1)}%`}
          color={C.mint}
          phase={phase}
          seed={1.1}
        />
        <MetricCard
          label="AVG RESPONSE"
          value={`${(1.8 + Math.sin(phase * 0.53 + 1) * 0.08).toFixed(1)}s`}
          color={C.cyan}
          phase={phase * 0.82}
          seed={2.4}
        />
        <MetricCard
          label="ACTIVE AGENTS"
          value={frame > 410 && frame < 930 ? "08" : "03"}
          color={C.violet}
          phase={phase * 0.9}
          seed={3.2}
        />
        <MetricCard
          label="ERRORS"
          value="00"
          color={C.mint}
          phase={phase * 0.68}
          seed={4.7}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 17,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 750,
            letterSpacing: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          POLICY VERIFIED
        </span>
        <div
          style={{
            flex: 1,
            height: 5,
            borderRadius: 9,
            overflow: "hidden",
            backgroundColor: "rgba(88,120,145,0.15)",
          }}
        >
          <div
            style={{
              width: `${verified}%`,
              height: "100%",
              borderRadius: 9,
              background: `linear-gradient(90deg, ${C.cyan}, ${C.mint})`,
              boxShadow: `0 0 12px ${C.mint}66`,
            }}
          />
        </div>
        <span
          style={{
            color: C.mint,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 850,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(verified)}%
        </span>
      </div>
    </Panel>
  );
};

const SignalsPanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = frame / fps;
  const signals = [
    ["REASONING", "14.2K", C.cyan, 1.2],
    ["CONTEXT", "98.4", C.mint, 2.4],
    ["TOOLS", "0.08", C.violet, 3.6],
    ["TRUST", "99.1", C.amber, 4.8],
  ] as const;

  return (
    <Panel
      x={40}
      y={726}
      width={356}
      height={314}
      title="Agent signals"
      eyebrow="stable"
      accent={C.cyan}
      delay={36}
      uiOpacity={uiOpacity}
    >
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: 62,
          bottom: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {signals.map(([label, value, color, seed]) => (
          <div
            key={label}
            style={{
              position: "relative",
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              background: "rgba(6,18,32,0.62)",
              padding: "12px 12px 10px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 750,
                letterSpacing: 1.1,
              }}
            >
              {label}
            </div>
            <div
              style={{
                color,
                fontFamily: FONT,
                fontSize: 20,
                lineHeight: "25px",
                fontWeight: 850,
                marginTop: 3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </div>
            <div style={{position: "absolute", left: 10, right: 10, bottom: 8}}>
              <TinySparkline
                width={132}
                height={40}
                color={color}
                seed={seed}
                phase={phase * (0.6 + seed * 0.04)}
                filled
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

const ActivityPanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const activities = [
    {at: 120, time: "09:42:08", text: "Mission payload normalized", color: C.cyan},
    {at: 260, time: "09:42:09", text: "Plan decomposed into 12 steps", color: C.cyan},
    {at: 430, time: "09:42:11", text: "Knowledge context synchronized", color: C.violet},
    {at: 610, time: "09:42:13", text: "Policy guardrail passed", color: C.mint},
    {at: 760, time: "09:42:15", text: "Priority action approved", color: C.mint},
    {at: 900, time: "09:42:17", text: "Response delivered successfully", color: C.mint},
  ];

  return (
    <Panel
      x={412}
      y={726}
      width={628}
      height={314}
      title="Live activity"
      eyebrow="event trace"
      accent={C.violet}
      delay={42}
      uiOpacity={uiOpacity}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: 61,
          bottom: 18,
        }}
      >
        {activities.map((activity, index) => {
          const progress = enter(frame, activity.at, 24);
          const activeIndex = Math.max(
            0,
            activities.filter((item) => frame >= item.at).length - 1,
          );
          const isLatest = index === activeIndex;
          return (
            <div
              key={activity.text}
              style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom:
                  index < activities.length - 1
                    ? `1px solid rgba(24,51,76,0.62)`
                    : "none",
                opacity: 0.18 + progress * 0.82,
                transform: `translateX(${(1 - progress) * 16}px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: progress > 0.5 ? activity.color : C.dim,
                  boxShadow:
                    isLatest && progress > 0.5
                      ? `0 0 12px ${activity.color}`
                      : "none",
                  flex: "0 0 auto",
                }}
              />
              <div
                style={{
                  width: 78,
                  color: C.muted,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {activity.time}
              </div>
              <div
                style={{
                  flex: 1,
                  color: progress > 0.5 ? C.text : C.dim,
                  fontFamily: FONT,
                  fontSize: 16,
                  lineHeight: "20px",
                  fontWeight: isLatest ? 700 : 550,
                }}
              >
                {activity.text}
              </div>
              <div
                style={{
                  color: activity.color,
                  fontFamily: FONT,
                  fontSize: 12,
                  fontWeight: 850,
                  letterSpacing: 1.1,
                }}
              >
                {progress > 0.72 ? "DONE" : "WAIT"}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

const PerformancePanel: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = frame / fps;
  const w = 766;
  const h = 154;
  const cyanPath = linePath(w, h, 58, phase * 0.48, 1.3, 0.24);
  const violetPath = linePath(w, h, 58, phase * 0.39 + 1.4, 3.6, 0.22);
  const mintPath = linePath(w, h, 58, phase * 0.31 + 2.7, 5.1, 0.18);
  const fillPath = `${cyanPath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <Panel
      x={1056}
      y={726}
      width={824}
      height={314}
      title="Outcome velocity"
      eyebrow="predictive"
      accent={C.mint}
      delay={48}
      uiOpacity={uiOpacity}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 62,
          width: w,
          height: h,
        }}
      >
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <linearGradient id="outcome-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.cyan} stopOpacity="0.2" />
              <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
            </linearGradient>
            <filter id="chart-glow" x="-20%" y="-30%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[0, 1, 2, 3].map((index) => (
            <line
              key={index}
              x1={0}
              x2={w}
              y1={(index / 3) * h}
              y2={(index / 3) * h}
              stroke={C.border}
              strokeWidth={1}
              strokeDasharray="3 8"
              opacity={0.52}
            />
          ))}
          <path d={fillPath} fill="url(#outcome-area)" />
          <path
            d={cyanPath}
            fill="none"
            stroke={C.cyan}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#chart-glow)"
          />
          <path
            d={violetPath}
            fill="none"
            stroke={C.violet}
            strokeWidth={2.1}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.88}
          />
          <path
            d={mintPath}
            fill="none"
            stroke={C.mint}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 20,
          display: "flex",
          gap: 12,
        }}
      >
        {[
          ["RESOLUTION", "92%", C.cyan],
          ["CONFIDENCE", "98%", C.violet],
          ["EFFICIENCY", "84%", C.mint],
        ].map(([label, value, color]) => (
          <div
            key={label}
            style={{
              flex: 1,
              height: 54,
              borderTop: `2px solid ${color}`,
              background: `linear-gradient(180deg, ${color}0c, transparent)`,
              padding: "10px 12px 0",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: C.muted,
                fontFamily: FONT,
                fontSize: 12,
                lineHeight: "20px",
                fontWeight: 750,
                letterSpacing: 1.15,
              }}
            >
              {label}
            </span>
            <span
              style={{
                color,
                fontFamily: FONT,
                fontSize: 20,
                lineHeight: "22px",
                fontWeight: 850,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

const Header: React.FC<{uiOpacity: number}> = ({uiOpacity}) => {
  const frame = useCurrentFrame();
  const progress = enter(frame, 2, 34);
  const {fps} = useVideoConfig();
  const phase = frame / fps;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 28,
        width: 1840,
        height: 70,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        background:
          "linear-gradient(90deg, rgba(8,22,39,0.88), rgba(5,15,28,0.95), rgba(8,22,39,0.88))",
        opacity: uiOpacity * progress,
        transform: `translateY(${(1 - progress) * -10}px)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {[C.cyan, C.mint, C.violet].map((color) => (
          <span
            key={color}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        ))}
        <div
          style={{
            width: 86,
            height: 3,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${C.cyan}, transparent)`,
            opacity: 0.55,
          }}
        />
        <div
          style={{
            color: C.mint,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.35,
          }}
        >
          NETWORK ONLINE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 10,
          transform: "translateX(-50%)",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            color: C.text,
            fontFamily: FONT,
            fontSize: 28,
            lineHeight: "31px",
            fontWeight: 850,
            letterSpacing: 4.1,
          }}
        >
          AUTONOMOUS AI OPERATIONS
        </div>
        <div
          style={{
            color: C.muted,
            fontFamily: FONT,
            fontSize: 11,
            lineHeight: "18px",
            fontWeight: 700,
            letterSpacing: 2.25,
          }}
        >
          ENTERPRISE AGENT ORCHESTRATION / SECURE WORKFLOW CONTROL
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div style={{textAlign: "right"}}>
          <div
            style={{
              color: C.muted,
              fontFamily: FONT,
              fontSize: 11,
              lineHeight: "16px",
              fontWeight: 750,
              letterSpacing: 1.2,
            }}
          >
            SYSTEM HEALTH
          </div>
          <div
            style={{
              color: C.mint,
              fontFamily: FONT,
              fontSize: 17,
              lineHeight: "22px",
              fontWeight: 850,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {(99.97 + Math.sin(phase * 0.42) * 0.01).toFixed(2)}%
          </div>
        </div>
        <div
          style={{
            height: 34,
            width: 1,
            backgroundColor: C.border,
          }}
        />
        <div
          style={{
            height: 34,
            borderRadius: 18,
            padding: "0 14px",
            border: `1px solid ${C.mint}66`,
            color: C.mint,
            background: `${C.mint}0d`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 850,
            letterSpacing: 1.1,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: C.mint,
              boxShadow: `0 0 10px ${C.mint}`,
            }}
          />
          SECURE MODE
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "30%",
          right: "30%",
          bottom: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
          opacity: 0.7,
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 14, 64], [0, 0.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outro = interpolate(frame, [1120, 1199], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const uiOpacity = intro * outro;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(17,64,88,0.20), transparent 46%), radial-gradient(circle at 83% 22%, rgba(79,49,146,0.11), transparent 33%), radial-gradient(circle at 12% 78%, rgba(22,126,122,0.08), transparent 36%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.16 * uiOpacity,
          backgroundImage:
            "linear-gradient(rgba(74,129,157,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(74,129,157,0.11) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.11,
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(160,220,255,0.06) 4px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <Header uiOpacity={uiOpacity} />
      <WorkflowsPanel uiOpacity={uiOpacity} />
      <MainWorkflowPanel uiOpacity={uiOpacity} />
      <CapacityPanel uiOpacity={uiOpacity} />
      <AssurancePanel uiOpacity={uiOpacity} />
      <SignalsPanel uiOpacity={uiOpacity} />
      <ActivityPanel uiOpacity={uiOpacity} />
      <PerformancePanel uiOpacity={uiOpacity} />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 150px rgba(0,0,0,0.58), inset 0 0 24px rgba(41,144,184,0.06)",
        }}
      />
    </AbsoluteFill>
  );
};
