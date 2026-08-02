import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type NoticeKind = "task" | "data" | "cloud" | "automation" | "agent";
type EntrySide = "left" | "right" | "top" | "bottom";

type NoticeSpec = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  start: number;
  kind: NoticeKind;
  title: string;
  detail: string;
  metric: string;
  status: string;
  side: EntrySide;
  z: number;
  progress: number;
};

const palette: Record<NoticeKind, {accent: string; pale: string; soft: string; label: string}> = {
  task: {
    accent: "#38e8ff",
    pale: "#d9fbff",
    soft: "rgba(56,232,255,0.22)",
    label: "TASK",
  },
  data: {
    accent: "#32f5ac",
    pale: "#dcfff2",
    soft: "rgba(50,245,172,0.22)",
    label: "DATA",
  },
  cloud: {
    accent: "#70b8ff",
    pale: "#e2f2ff",
    soft: "rgba(112,184,255,0.22)",
    label: "CLOUD",
  },
  automation: {
    accent: "#78ffd6",
    pale: "#e4fff8",
    soft: "rgba(120,255,214,0.22)",
    label: "AUTOMATION",
  },
  agent: {
    accent: "#8fffe8",
    pale: "#eafffb",
    soft: "rgba(143,255,232,0.23)",
    label: "AI AGENT",
  },
};

const notices: NoticeSpec[] = [
  {
    id: "n01",
    x: -28,
    y: -22,
    width: 514,
    height: 298,
    start: 176,
    kind: "task",
    title: "TASK QUEUE UPDATED",
    detail: "Product analysis pipeline added 24 priority tasks.",
    metric: "+24",
    status: "QUEUED",
    side: "left",
    z: 100,
    progress: 0.68,
  },
  {
    id: "n02",
    x: 455,
    y: -22,
    width: 514,
    height: 298,
    start: 286,
    kind: "data",
    title: "DATA SOURCE CONNECTED",
    detail: "Customer event stream is receiving live records.",
    metric: "8.4K",
    status: "INGESTING",
    side: "top",
    z: 101,
    progress: 0.84,
  },
  {
    id: "n03",
    x: 938,
    y: -22,
    width: 514,
    height: 298,
    start: 344,
    kind: "cloud",
    title: "CLOUD MODEL READY",
    detail: "Inference endpoint passed all availability checks.",
    metric: "99.9%",
    status: "ONLINE",
    side: "top",
    z: 102,
    progress: 0.96,
  },
  {
    id: "n04",
    x: 1421,
    y: -22,
    width: 527,
    height: 298,
    start: 386,
    kind: "automation",
    title: "AUTOMATION TRIGGERED",
    detail: "Revenue workflow launched across four regions.",
    metric: "04",
    status: "RUNNING",
    side: "right",
    z: 103,
    progress: 0.73,
  },
  {
    id: "n05",
    x: -28,
    y: 246,
    width: 514,
    height: 302,
    start: 220,
    kind: "agent",
    title: "AI AGENT DELEGATED",
    detail: "Research agent is comparing 126 verified sources.",
    metric: "126",
    status: "THINKING",
    side: "left",
    z: 104,
    progress: 0.58,
  },
  {
    id: "n06",
    x: 455,
    y: 246,
    width: 514,
    height: 302,
    start: 318,
    kind: "task",
    title: "BATCH COMPLETE",
    detail: "Document classification finished without exceptions.",
    metric: "742",
    status: "COMPLETE",
    side: "bottom",
    z: 105,
    progress: 1,
  },
  {
    id: "n07",
    x: 938,
    y: 246,
    width: 514,
    height: 302,
    start: 362,
    kind: "data",
    title: "VECTOR INDEX SYNC",
    detail: "Knowledge embeddings merged into production memory.",
    metric: "2.1M",
    status: "SYNCED",
    side: "right",
    z: 106,
    progress: 1,
  },
  {
    id: "n08",
    x: 1421,
    y: 246,
    width: 527,
    height: 302,
    start: 412,
    kind: "cloud",
    title: "COMPUTE SCALED",
    detail: "Additional neural workers are now accepting jobs.",
    metric: "32×",
    status: "SCALING",
    side: "right",
    z: 107,
    progress: 0.81,
  },
  {
    id: "n09",
    x: -28,
    y: 518,
    width: 514,
    height: 302,
    start: 262,
    kind: "automation",
    title: "WORKFLOW BRANCH CREATED",
    detail: "High-value events are routed to human review.",
    metric: "18",
    status: "ACTIVE",
    side: "left",
    z: 108,
    progress: 0.76,
  },
  {
    id: "n10",
    x: 455,
    y: 518,
    width: 514,
    height: 302,
    start: 342,
    kind: "agent",
    title: "AGENT RESPONSE READY",
    detail: "Strategic summary generated with verified citations.",
    metric: "94%",
    status: "REVIEW",
    side: "bottom",
    z: 109,
    progress: 0.94,
  },
  {
    id: "n11",
    x: 938,
    y: 518,
    width: 514,
    height: 302,
    start: 398,
    kind: "task",
    title: "PRIORITY ESCALATION",
    detail: "Concurrent tasks exceeded the preferred service window.",
    metric: "+68",
    status: "PRIORITY",
    side: "top",
    z: 110,
    progress: 0.88,
  },
  {
    id: "n12",
    x: 1421,
    y: 518,
    width: 527,
    height: 302,
    start: 446,
    kind: "data",
    title: "LIVE SIGNAL DETECTED",
    detail: "A new behavioral cluster is forming in the stream.",
    metric: "12.8K",
    status: "ANALYZING",
    side: "right",
    z: 111,
    progress: 0.66,
  },
  {
    id: "n13",
    x: -28,
    y: 790,
    width: 514,
    height: 312,
    start: 308,
    kind: "cloud",
    title: "REGION DEPLOYED",
    detail: "Low-latency model replica is serving live traffic.",
    metric: "18ms",
    status: "HEALTHY",
    side: "bottom",
    z: 112,
    progress: 0.92,
  },
  {
    id: "n14",
    x: 455,
    y: 790,
    width: 514,
    height: 312,
    start: 374,
    kind: "automation",
    title: "ACTION EXECUTED",
    detail: "Personalized campaign assets sent to approval.",
    metric: "240",
    status: "DELIVERED",
    side: "bottom",
    z: 113,
    progress: 1,
  },
  {
    id: "n15",
    x: 938,
    y: 790,
    width: 514,
    height: 312,
    start: 428,
    kind: "agent",
    title: "MULTI-AGENT HANDOFF",
    detail: "Three specialist agents accepted delegated work.",
    metric: "03",
    status: "COORDINATING",
    side: "bottom",
    z: 114,
    progress: 0.72,
  },
  {
    id: "n16",
    x: 1421,
    y: 790,
    width: 527,
    height: 312,
    start: 478,
    kind: "task",
    title: "QUEUE CAPACITY ALERT",
    detail: "New workflow volume is approaching system limits.",
    metric: "98%",
    status: "HIGH LOAD",
    side: "right",
    z: 115,
    progress: 0.98,
  },
  {
    id: "o01",
    x: 76,
    y: 68,
    width: 642,
    height: 254,
    start: 506,
    kind: "data",
    title: "KNOWLEDGE GRAPH UPDATED",
    detail: "New entity relationships are available to every agent.",
    metric: "+4.2K",
    status: "INDEXED",
    side: "left",
    z: 201,
    progress: 1,
  },
  {
    id: "o02",
    x: 655,
    y: 96,
    width: 620,
    height: 262,
    start: 530,
    kind: "automation",
    title: "AUTOMATION CASCADE",
    detail: "Twelve connected workflows launched simultaneously.",
    metric: "12×",
    status: "CASCADE",
    side: "top",
    z: 202,
    progress: 0.86,
  },
  {
    id: "o03",
    x: 1210,
    y: 62,
    width: 642,
    height: 268,
    start: 554,
    kind: "cloud",
    title: "GLOBAL CLOUD BURST",
    detail: "Inference traffic is balancing across nine regions.",
    metric: "9 GEO",
    status: "BALANCING",
    side: "right",
    z: 203,
    progress: 0.79,
  },
  {
    id: "o04",
    x: 46,
    y: 374,
    width: 716,
    height: 280,
    start: 578,
    kind: "task",
    title: "REAL-TIME TASK SURGE",
    detail: "Priority work is arriving faster than the active queue can resolve it.",
    metric: "+182",
    status: "SURGING",
    side: "left",
    z: 204,
    progress: 0.93,
  },
  {
    id: "o05",
    x: 612,
    y: 360,
    width: 696,
    height: 310,
    start: 606,
    kind: "agent",
    title: "AI ORCHESTRATION PEAK",
    detail: "Every autonomous agent is processing a live workflow.",
    metric: "128",
    status: "MAXIMUM LOAD",
    side: "bottom",
    z: 205,
    progress: 0.99,
  },
  {
    id: "o06",
    x: 1194,
    y: 382,
    width: 684,
    height: 282,
    start: 634,
    kind: "data",
    title: "STREAM VELOCITY PEAK",
    detail: "Incoming events reached a new sustained throughput record.",
    metric: "1.8M/s",
    status: "PEAK FLOW",
    side: "right",
    z: 206,
    progress: 1,
  },
  {
    id: "o07",
    x: 82,
    y: 730,
    width: 680,
    height: 280,
    start: 658,
    kind: "automation",
    title: "TRIGGER LIMIT REACHED",
    detail: "Automation capacity is reserved for critical actions only.",
    metric: "100%",
    status: "LIMIT",
    side: "bottom",
    z: 207,
    progress: 1,
  },
  {
    id: "o08",
    x: 646,
    y: 744,
    width: 642,
    height: 266,
    start: 680,
    kind: "cloud",
    title: "COMPUTE POOL SATURATED",
    detail: "All neural workers are operating at target capacity.",
    metric: "512/512",
    status: "SATURATED",
    side: "bottom",
    z: 208,
    progress: 1,
  },
  {
    id: "o09",
    x: 1216,
    y: 716,
    width: 650,
    height: 296,
    start: 702,
    kind: "task",
    title: "SYSTEM OVERLOAD",
    detail: "Workflow volume exceeds the active orchestration envelope.",
    metric: "OVERLOAD",
    status: "PREMIUM MODE",
    side: "right",
    z: 209,
    progress: 1,
  },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const enterProgress = (frame: number, start: number, duration = 22) =>
  Easing.out(Easing.cubic)(clamp01((frame - start) / duration));

const Icon: React.FC<{kind: NoticeKind; size?: number}> = ({kind, size = 34}) => {
  const color = palette[kind].pale;
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {kind === "task" && (
        <>
          <rect x="6" y="5" width="20" height="22" rx="4" {...common} />
          <path d="M11 12l2.6 2.5L19 9.5M11 20h10" {...common} />
        </>
      )}
      {kind === "data" && (
        <>
          <ellipse cx="16" cy="8" rx="9" ry="4" {...common} />
          <path d="M7 8v8c0 2.2 4 4 9 4s9-1.8 9-4V8M7 16v8c0 2.2 4 4 9 4s9-1.8 9-4v-8" {...common} />
        </>
      )}
      {kind === "cloud" && (
        <path d="M9.2 25h13.5a5.3 5.3 0 0 0 .7-10.6A8.2 8.2 0 0 0 7.8 12 6.6 6.6 0 0 0 9.2 25Z" {...common} />
      )}
      {kind === "automation" && (
        <>
          <circle cx="16" cy="16" r="5" {...common} />
          <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l3 3M21.5 21.5l3 3M24.5 7.5l-3 3M10.5 21.5l-3 3" {...common} />
        </>
      )}
      {kind === "agent" && (
        <>
          <path d="M16 4 6.5 9.5v11L16 26l9.5-5.5v-11L16 4Z" {...common} />
          <circle cx="12.5" cy="15" r="1.4" fill={color} />
          <circle cx="19.5" cy="15" r="1.4" fill={color} />
          <path d="M12 20h8" {...common} />
        </>
      )}
    </svg>
  );
};

const ScanReveal: React.FC<{
  frame: number;
  start: number;
  children: React.ReactNode;
  color: string;
}> = ({frame, start, children, color}) => {
  const amount = interpolate(frame, [start, start + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div style={{position: "relative", overflow: "hidden", minWidth: 0}}>
      <div style={{clipPath: `inset(0 ${(1 - amount) * 100}% 0 0)`}}>{children}</div>
      {amount > 0 && amount < 1 && (
        <div
          style={{
            position: "absolute",
            left: `${amount * 100}%`,
            top: -3,
            bottom: -3,
            width: 2,
            background: color,
            boxShadow: `0 0 10px ${color}, 0 0 24px ${color}`,
          }}
        />
      )}
    </div>
  );
};

const PremiumBackdrop: React.FC<{frame: number}> = ({frame}) => {
  const breathe = 0.82 + Math.sin(frame * 0.018) * 0.12;
  const sweepX = interpolate(frame % 300, [0, 300], [-420, 2200]);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 18% 18%, rgba(0,214,166,0.18), transparent 34%), radial-gradient(circle at 80% 76%, rgba(24,168,223,0.18), transparent 38%), linear-gradient(136deg, #020607 0%, #031317 45%, #06111d 72%, #02080c 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.26,
          backgroundImage:
            "linear-gradient(rgba(78,239,213,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(76,210,255,0.065) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(135,255,230,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(135,255,230,0.06) 1px, transparent 1px)",
          backgroundSize: "360px 360px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 170,
          top: 84,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(38,255,188,0.13), rgba(38,255,188,0.025) 48%, transparent 72%)",
          filter: "blur(22px)",
          opacity: breathe,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: -130,
          width: 950,
          height: 780,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(31,189,255,0.13), rgba(31,189,255,0.025) 46%, transparent 72%)",
          filter: "blur(26px)",
          opacity: 0.76 + Math.sin(frame * 0.014 + 1.4) * 0.12,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: sweepX,
          top: -420,
          width: 180,
          height: 1900,
          transform: "rotate(21deg)",
          background: "linear-gradient(90deg, transparent, rgba(157,255,238,0.06), transparent)",
          filter: "blur(18px)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 42%, rgba(0,4,8,0.36) 76%, rgba(0,3,6,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const MiniWave: React.FC<{frame: number; color: string; seed: number}> = ({frame, color, seed}) => {
  const points = Array.from({length: 9}, (_, index) => {
    const x = index * 24;
    const y = 20 + Math.sin(index * 1.12 + frame * 0.055 + seed) * 10 + Math.sin(index * 2.1 + seed) * 3;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="202" height="44" viewBox="0 0 202 44" style={{display: "block", overflow: "visible"}}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" opacity="0.72" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="7" opacity="0.12" />
    </svg>
  );
};

const WorkflowDashboard: React.FC<{frame: number}> = ({frame}) => {
  const intro = enterProgress(frame, -18, 50);
  const corePulse = 0.82 + Math.sin(frame * 0.045) * 0.18;
  const trace = (frame * 4.2) % 330;
  const headlineReveal = interpolate(frame, [28, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: intro,
        transform: `scale(${0.985 + intro * 0.015})`,
        color: "#dffefa",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 42,
          right: 42,
          top: 30,
          height: 66,
          border: "1px solid rgba(112,255,222,0.18)",
          borderRadius: 15,
          background: "linear-gradient(90deg, rgba(6,27,31,0.92), rgba(5,18,25,0.74))",
          boxShadow: "0 22px 80px rgba(0,0,0,0.26), 0 1px 0 rgba(255,255,255,0.05) inset",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 15}}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid rgba(127,255,225,0.65)",
              boxShadow: "0 0 26px rgba(37,247,188,0.32), 0 0 0 1px rgba(255,255,255,0.06) inset",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#baffeb",
              fontSize: 13,
              fontWeight: 760,
            }}
          >
            AI
          </div>
          <div>
            <div style={{fontSize: 18, fontWeight: 720, letterSpacing: 1.35}}>NEURAL OPERATIONS</div>
            <div style={{fontSize: 10, color: "rgba(171,235,229,0.48)", letterSpacing: 2.35, marginTop: 2}}>
              WORKFLOW ORCHESTRATION LAYER
            </div>
          </div>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 25}}>
          {["24 AGENTS", "128 FLOWS", "8.4K EVENTS/M"].map((item) => (
            <div key={item} style={{fontSize: 11, color: "rgba(204,247,242,0.6)", letterSpacing: 1.3}}>{item}</div>
          ))}
          <div
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: "#baffeb",
              fontSize: 11,
              fontWeight: 720,
              letterSpacing: 1.4,
              border: "1px solid rgba(61,246,183,0.34)",
              background: "rgba(36,216,163,0.08)",
            }}
          >
            <span style={{width: 7, height: 7, borderRadius: "50%", background: "#35f6aa", boxShadow: "0 0 14px #35f6aa"}} />
            SYSTEM HEALTHY
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 42,
          top: 116,
          bottom: 34,
          width: 82,
          borderRadius: 18,
          border: "1px solid rgba(112,255,222,0.16)",
          background: "linear-gradient(180deg, rgba(5,25,29,0.9), rgba(4,17,23,0.72))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 25,
          gap: 24,
        }}
      >
        {["agent", "task", "data", "cloud", "automation"].map((kind, index) => (
          <div
            key={kind}
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: index === 0 ? "1px solid rgba(88,255,214,0.55)" : "1px solid rgba(127,219,218,0.1)",
              background: index === 0 ? "rgba(38,238,181,0.12)" : "rgba(255,255,255,0.018)",
              boxShadow: index === 0 ? "0 0 25px rgba(36,235,177,0.18)" : "none",
              opacity: index === 0 ? 1 : 0.48,
            }}
          >
            <Icon kind={kind as NoticeKind} size={26} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 145,
          right: 340,
          top: 116,
          bottom: 34,
          borderRadius: 20,
          border: "1px solid rgba(105,245,222,0.15)",
          background: "linear-gradient(150deg, rgba(4,26,30,0.72), rgba(3,15,22,0.62))",
          overflow: "hidden",
        }}
      >
        <div style={{position: "absolute", left: 37, top: 31}}>
          <div
            style={{
              fontSize: 11,
              color: "#61f6c4",
              letterSpacing: 2.5,
              fontWeight: 720,
              clipPath: `inset(0 ${(1 - headlineReveal) * 100}% 0 0)`,
            }}
          >
            LIVE ORCHESTRATION MAP
          </div>
          <div style={{fontSize: 28, fontWeight: 550, letterSpacing: -0.5, marginTop: 8}}>One intelligent process, every workflow connected.</div>
        </div>

        <svg width="1435" height="930" viewBox="0 0 1435 930" style={{position: "absolute", inset: 0}}>
          <defs>
            <linearGradient id="traceGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2bf2a4" stopOpacity="0.14" />
              <stop offset="0.5" stopColor="#b7fff0" stopOpacity="0.95" />
              <stop offset="1" stopColor="#44dfff" stopOpacity="0.14" />
            </linearGradient>
          </defs>
          {[
            "M285 292 C430 292 443 414 578 414",
            "M285 652 C430 652 443 518 578 518",
            "M870 414 C1008 414 1018 290 1164 290",
            "M870 518 C1018 518 1020 652 1164 652",
          ].map((path, index) => (
            <g key={path}>
              <path d={path} fill="none" stroke="rgba(79,228,211,0.17)" strokeWidth="2" />
              <path
                d={path}
                fill="none"
                stroke="url(#traceGradient)"
                strokeWidth="3"
                strokeDasharray="54 276"
                strokeDashoffset={-trace - index * 82}
                opacity="0.82"
              />
            </g>
          ))}
        </svg>

        {[
          {x: 120, y: 220, label: "TASK INPUT", kind: "task" as NoticeKind, value: "24 QUEUED"},
          {x: 120, y: 580, label: "LIVE DATA", kind: "data" as NoticeKind, value: "8.4K / MIN"},
          {x: 1018, y: 220, label: "CLOUD MODEL", kind: "cloud" as NoticeKind, value: "ONLINE"},
          {x: 1018, y: 580, label: "AUTOMATION", kind: "automation" as NoticeKind, value: "18 ACTIVE"},
        ].map((node) => (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: 240,
              height: 118,
              borderRadius: 16,
              border: `1px solid ${palette[node.kind].soft}`,
              background: "linear-gradient(145deg, rgba(10,39,42,0.92), rgba(5,20,28,0.92))",
              boxShadow: `0 18px 50px rgba(0,0,0,0.24), 0 0 24px ${palette[node.kind].soft}`,
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              boxSizing: "border-box",
              gap: 18,
            }}
          >
            <Icon kind={node.kind} size={38} />
            <div>
              <div style={{fontSize: 11, color: palette[node.kind].accent, letterSpacing: 1.8, fontWeight: 720}}>{node.label}</div>
              <div style={{fontSize: 17, color: "rgba(229,255,250,0.8)", letterSpacing: 0.7, marginTop: 8}}>{node.value}</div>
            </div>
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            left: 578,
            top: 335,
            width: 292,
            height: 266,
            borderRadius: 34,
            border: "1px solid rgba(128,255,224,0.46)",
            background: "radial-gradient(circle at 45% 40%, rgba(67,255,199,0.2), rgba(7,34,38,0.96) 56%, rgba(3,17,24,0.98))",
            boxShadow: `0 0 ${58 + corePulse * 26}px rgba(41,244,182,${0.14 + corePulse * 0.07}), 0 30px 90px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 22,
              borderRadius: 26,
              border: "1px dashed rgba(87,243,209,0.26)",
              transform: `rotate(${Math.sin(frame * 0.01) * 1.5}deg)`,
            }}
          />
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 24,
              border: "1px solid rgba(191,255,241,0.74)",
              background: "linear-gradient(145deg, rgba(196,255,241,0.22), rgba(27,230,172,0.11))",
              boxShadow: `0 0 20px rgba(173,255,237,0.36), 0 0 ${52 * corePulse}px rgba(39,245,184,0.44)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon kind="agent" size={48} />
          </div>
          <div style={{fontSize: 12, letterSpacing: 2.6, color: "#73f9d0", fontWeight: 740, marginTop: 22}}>AI CORE PROCESS</div>
          <div style={{fontSize: 25, fontWeight: 560, marginTop: 8}}>Running</div>
          <div style={{display: "flex", alignItems: "center", gap: 7, marginTop: 10, fontSize: 10, color: "rgba(192,242,235,0.52)", letterSpacing: 1.5}}>
            <span style={{width: 6, height: 6, borderRadius: "50%", background: "#3bf4ad", boxShadow: "0 0 12px #3bf4ad"}} />
            24 ACTIVE AGENTS
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 42,
          top: 116,
          bottom: 34,
          width: 278,
          borderRadius: 20,
          border: "1px solid rgba(105,245,222,0.15)",
          background: "linear-gradient(180deg, rgba(5,25,30,0.88), rgba(4,15,23,0.82))",
          padding: "28px 24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{fontSize: 11, color: "#64f2c4", letterSpacing: 2.2, fontWeight: 720}}>LIVE ACTIVITY</div>
        <div style={{fontSize: 26, fontWeight: 560, marginTop: 10}}>System flow</div>
        <div style={{marginTop: 34}}>
          <MiniWave frame={frame} color="#41f2b2" seed={0.5} />
          <div style={{display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(188,235,231,0.45)", marginTop: 2}}>
            <span>THROUGHPUT</span><span>+18.4%</span>
          </div>
        </div>
        {["Agent response", "Cloud inference", "Data ingestion", "Automation"].map((label, index) => {
          const fill = 0.56 + index * 0.105 + Math.sin(frame * 0.018 + index) * 0.035;
          return (
            <div key={label} style={{marginTop: 32}}>
              <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(213,248,243,0.68)"}}>
                <span>{label}</span><span>{Math.round(fill * 100)}%</span>
              </div>
              <div style={{height: 5, borderRadius: 3, marginTop: 10, background: "rgba(137,226,217,0.09)", overflow: "hidden"}}>
                <div style={{height: "100%", width: `${fill * 100}%`, borderRadius: 3, background: index % 2 ? "#45dfff" : "#35f3ad", boxShadow: "0 0 13px rgba(54,244,178,0.45)"}} />
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 22,
            padding: "18px",
            borderRadius: 14,
            border: "1px solid rgba(77,244,191,0.17)",
            background: "rgba(40,223,168,0.045)",
          }}
        >
          <div style={{fontSize: 10, color: "rgba(191,239,233,0.5)", letterSpacing: 1.8}}>CURRENT STATE</div>
          <div style={{display: "flex", alignItems: "center", gap: 9, marginTop: 10, color: "#bffff0", fontSize: 13, fontWeight: 680}}>
            <span style={{width: 7, height: 7, borderRadius: "50%", background: "#38f5ad", boxShadow: "0 0 14px #38f5ad"}} />
            OPTIMAL
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const NotificationCard: React.FC<{spec: NoticeSpec; frame: number}> = ({spec, frame}) => {
  if (frame < spec.start) return null;

  const accent = palette[spec.kind];
  const entered = enterProgress(frame, spec.start, 20);
  const local = frame - spec.start;
  const entranceDistance = 120 * (1 - entered);
  const translateX = spec.side === "left" ? -entranceDistance : spec.side === "right" ? entranceDistance : 0;
  const translateY = spec.side === "top" ? -entranceDistance : spec.side === "bottom" ? entranceDistance : 0;
  const settle = Math.sin(Math.min(1, local / 22) * Math.PI) * 0.018;
  const overloadPulse = frame > 710 ? 0.5 + Math.sin(frame * 0.08 + spec.z) * 0.5 : 0;
  const scanY = ((frame - spec.start) * 2.4) % (spec.height + 60) - 30;
  const shimmerX = ((frame * 3.2 + spec.z * 11) % (spec.width + 220)) - 110;
  const compact = spec.height < 272;
  const metricFont = spec.metric.length > 7 ? 25 : spec.metric.length > 5 ? 29 : 36;

  return (
    <div
      style={{
        position: "absolute",
        left: spec.x,
        top: spec.y,
        width: spec.width,
        height: spec.height,
        zIndex: spec.z,
        opacity: entered,
        transform: `translate(${translateX}px, ${translateY}px) scale(${0.94 + entered * 0.06 + settle})`,
        transformOrigin: spec.side === "left" ? "left center" : spec.side === "right" ? "right center" : "center",
        filter: entered < 0.92 ? `blur(${(1 - entered) * 4}px)` : undefined,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: 17,
          color: "#eafffb",
          border: `1px solid ${accent.accent}55`,
          background:
            "linear-gradient(145deg, rgba(12,43,47,0.975) 0%, rgba(5,24,31,0.982) 56%, rgba(3,17,25,0.99) 100%)",
          boxShadow: `0 28px 86px rgba(0,0,0,0.58), 0 0 ${32 + overloadPulse * 14}px ${accent.soft}, 0 1px 0 rgba(255,255,255,0.08) inset`,
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: `linear-gradient(180deg, ${accent.pale}, ${accent.accent} 48%, transparent 100%)`,
            boxShadow: `0 0 18px ${accent.accent}, 0 0 42px ${accent.accent}88`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: shimmerX,
            top: -140,
            width: 82,
            height: spec.height + 280,
            transform: "rotate(18deg)",
            background: `linear-gradient(90deg, transparent, ${accent.accent}0d, transparent)`,
          }}
        />
        <div
          style={{
            height: compact ? 52 : 58,
            padding: "0 18px 0 22px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(145,235,224,0.12)",
            background: `linear-gradient(90deg, ${accent.soft}, rgba(8,31,38,0.72) 48%, rgba(5,21,29,0.78))`,
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            <span style={{width: 7, height: 7, borderRadius: "50%", background: accent.accent, boxShadow: `0 0 15px ${accent.accent}`}} />
            <span style={{fontSize: 10, color: accent.accent, letterSpacing: 2.1, fontWeight: 760}}>{accent.label}</span>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 13, color: "rgba(201,239,235,0.38)", fontSize: 10, letterSpacing: 1.1}}>
            <span>NOW</span>
            <span style={{fontSize: 19, lineHeight: 1, transform: "translateY(-3px)"}}>•••</span>
          </div>
        </div>

        <div style={{padding: compact ? "18px 22px" : "22px 24px", boxSizing: "border-box"}}>
          <ScanReveal frame={frame} start={spec.start + 5} color={accent.accent}>
            <div style={{fontSize: compact ? 15 : 17, fontWeight: 740, letterSpacing: 1.15, color: "rgba(235,255,251,0.96)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
              {spec.title}
            </div>
          </ScanReveal>

          <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: compact ? 14 : 18}}>
            <div
              style={{
                width: compact ? 52 : 58,
                height: compact ? 52 : 58,
                flex: `0 0 ${compact ? 52 : 58}px`,
                borderRadius: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${accent.accent}55`,
                background: `radial-gradient(circle at 35% 30%, ${accent.soft}, rgba(7,27,34,0.86))`,
                boxShadow: `0 0 22px ${accent.soft}, 0 1px 0 rgba(255,255,255,0.08) inset`,
              }}
            >
              <Icon kind={spec.kind} size={compact ? 30 : 34} />
            </div>
            <div style={{fontSize: compact ? 14 : 15, lineHeight: 1.42, color: "rgba(204,236,232,0.7)", maxWidth: spec.width - 176}}>{spec.detail}</div>
          </div>

          <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: compact ? 15 : 20}}>
            <div>
              <div style={{fontSize: 9, color: "rgba(181,226,221,0.38)", letterSpacing: 1.7}}>LIVE METRIC</div>
              <div style={{fontSize: metricFont, fontWeight: 520, color: accent.pale, letterSpacing: -0.7, marginTop: 2, textShadow: `0 0 20px ${accent.soft}`}}>{spec.metric}</div>
            </div>
            <div
              style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: accent.pale,
                background: `${accent.soft}`,
                border: `1px solid ${accent.accent}42`,
                fontSize: 9,
                fontWeight: 760,
                letterSpacing: 1.25,
              }}
            >
              <span style={{width: 5, height: 5, borderRadius: "50%", background: accent.accent, boxShadow: `0 0 10px ${accent.accent}`}} />
              {spec.status}
            </div>
          </div>

          <div style={{height: 5, borderRadius: 4, marginTop: compact ? 12 : 15, background: "rgba(125,218,211,0.08)", overflow: "hidden"}}>
            <div
              style={{
                height: "100%",
                width: `${spec.progress * 100}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${accent.accent}80, ${accent.pale})`,
                boxShadow: `0 0 14px ${accent.accent}99`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${accent.accent}66, rgba(224,255,249,0.58), transparent)`,
            opacity: 0.46,
            boxShadow: `0 0 8px ${accent.accent}66`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(218,255,248,0.62), transparent)",
          }}
        />
      </div>
    </div>
  );
};

const OverloadHUD: React.FC<{frame: number}> = ({frame}) => {
  const show = enterProgress(frame, 724, 28);
  if (show <= 0) return null;

  const pulse = 0.72 + Math.sin(frame * 0.12) * 0.22;
  const scan = interpolate(frame % 140, [0, 140], [-90, 730]);

  return (
    <div
      style={{
        position: "absolute",
        left: 598,
        top: 426,
        width: 724,
        height: 220,
        zIndex: 350,
        opacity: show,
        transform: `scale(${0.91 + show * 0.09})`,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(10,48,49,0.99), rgba(3,20,27,0.995))",
          border: "1px solid rgba(158,255,232,0.78)",
          boxShadow: `0 34px 120px rgba(0,0,0,0.72), 0 0 ${72 + pulse * 34}px rgba(33,246,180,0.27), 0 0 0 1px rgba(255,255,255,0.08) inset`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: scan,
            top: -90,
            width: 4,
            height: 420,
            transform: "rotate(14deg)",
            background: "#d9fff5",
            boxShadow: "0 0 12px #d9fff5, 0 0 35px #39f3b2, 0 0 70px rgba(56,232,255,0.55)",
            opacity: 0.68,
          }}
        />
        <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: "linear-gradient(#e2fff8, #35f2b0, #38e8ff)", boxShadow: "0 0 28px #38f0be"}} />
        <div style={{height: "100%", display: "flex", alignItems: "center", padding: "0 44px", gap: 32, boxSizing: "border-box"}}>
          <div
            style={{
              width: 98,
              height: 98,
              flex: "0 0 98px",
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 35% 30%, rgba(217,255,246,0.24), rgba(43,241,178,0.12) 46%, rgba(6,28,34,0.82))",
              border: "1px solid rgba(177,255,237,0.7)",
              boxShadow: `0 0 ${36 + pulse * 24}px rgba(52,244,180,0.44), 0 0 0 1px rgba(255,255,255,0.08) inset`,
            }}
          >
            <Icon kind="agent" size={58} />
          </div>
          <div style={{minWidth: 0}}>
            <div style={{fontSize: 11, color: "#56f8c0", letterSpacing: 3.1, fontWeight: 780}}>AI WORKFLOW STATUS</div>
            <ScanReveal frame={frame} start={730} color="#baffeb">
              <div style={{fontSize: 42, fontWeight: 610, letterSpacing: 1.6, color: "#effffa", marginTop: 10, textShadow: "0 0 18px rgba(133,255,228,0.22)"}}>
                SYSTEM OVERLOAD
              </div>
            </ScanReveal>
            <div style={{fontSize: 14, color: "rgba(197,239,233,0.6)", marginTop: 10, letterSpacing: 0.4}}>
              128 agents · 512 workers · 1.8M events per second
            </div>
          </div>
          <div style={{marginLeft: "auto", textAlign: "right"}}>
            <div style={{fontSize: 46, fontWeight: 480, color: "#caffef", textShadow: "0 0 22px rgba(65,243,181,0.4)"}}>100%</div>
            <div style={{fontSize: 9, color: "rgba(176,230,221,0.46)", letterSpacing: 1.9, marginTop: 5}}>CAPACITY</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fit = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
  const offsetX = (width - CANVAS_WIDTH * fit) / 2;
  const offsetY = (height - CANVAS_HEIGHT * fit) / 2;
  const camera = interpolate(frame, [0, 899], [1, 1.042], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const driftX = interpolate(frame, [0, 899], [0, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const driftY = Math.sin(frame * 0.006) * 3;
  const overloadShade = interpolate(frame, [620, 790], [0, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalScanY = (frame * 2.2) % 1180 - 50;

  return (
    <AbsoluteFill style={{backgroundColor: "#020708", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${fit})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(${camera})`,
            transformOrigin: "center center",
          }}
        >
          <PremiumBackdrop frame={frame} />
          <WorkflowDashboard frame={frame} />
          {notices.map((spec) => (
            <NotificationCard key={spec.id} spec={spec} frame={frame} />
          ))}
          <OverloadHUD frame={frame} />
          <AbsoluteFill
            style={{
              zIndex: 330,
              pointerEvents: "none",
              background: `rgba(0,6,8,${overloadShade * 0.16})`,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: globalScanY,
            height: 1,
            zIndex: 420,
            pointerEvents: "none",
            background: "linear-gradient(90deg, transparent 3%, rgba(64,245,190,0.08) 24%, rgba(165,255,236,0.24) 50%, rgba(60,215,255,0.08) 76%, transparent 97%)",
            boxShadow: "0 0 12px rgba(76,245,201,0.08)",
          }}
        />
        <AbsoluteFill
          style={{
            zIndex: 430,
            pointerEvents: "none",
            opacity: 0.11,
            backgroundImage: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(170,255,239,0.055) 4px)",
          }}
        />
        <AbsoluteFill
          style={{
            zIndex: 440,
            pointerEvents: "none",
            boxShadow: "0 0 150px rgba(0,4,7,0.58) inset",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
