import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const QUERY = "AI tools for business growth";
const CONTROL_SIZE = 116;
const FULL_SEARCH_WIDTH = 1232;
const CARD_REVEAL_START = 340;
const CARD_REVEAL_STAGGER = 60;
const CARD_FOCUS_START = 570;
const CARD_FOCUS_DURATION = 50;
const RESULT_EXIT_START = 770;
const RESULT_EXIT_END = 800;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const easeOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const SearchGlyph: React.FC<{spinning?: boolean}> = ({spinning = false}) => (
  <svg viewBox="0 0 64 64" style={{width: "58%", height: "58%", overflow: "visible"}}>
    {spinning ? (
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="72 48"
        style={{
          transformOrigin: "32px 32px",
          animation: "none",
        }}
      />
    ) : (
      <>
        <circle cx="27" cy="27" r="15" fill="none" stroke="white" strokeWidth="5" />
        <path d="M38 38L53 53" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const Pointer: React.FC<{frame: number}> = ({frame}) => {
  const progress = smooth(frame, 42, 94);
  const p0 = {x: 1332, y: 697};
  const p1 = {x: 1248, y: 808};
  const p2 = {x: 1004, y: 565};
  const inverse = 1 - progress;
  const x = inverse * inverse * p0.x + 2 * inverse * progress * p1.x + progress * progress * p2.x;
  const y = inverse * inverse * p0.y + 2 * inverse * progress * p1.y + progress * progress * p2.y;
  const opacity = smooth(frame, 42, 53) * (1 - smooth(frame, 111, 121));
  const press = interpolate(frame, [92, 99, 106], [1, 0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      viewBox="0 0 64 84"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 58,
        height: 76,
        opacity,
        transform: `translate(-8px, -8px) scale(${press})`,
        transformOrigin: "8px 8px",
        filter: "drop-shadow(0 7px 8px rgba(23,31,51,0.20))",
        zIndex: 30,
      }}
    >
      <path
        d="M8 5L54 47L34 51L44 73L31 79L21 56L8 70Z"
        fill="#ffffff"
        stroke="#182238"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
};

type VisualKind = "automation" | "insights" | "content" | "security";

const CardVisual: React.FC<{
  kind: VisualKind;
  frame: number;
  accent: string;
  index: number;
}> = ({kind, frame, accent, index}) => {
  const local = Math.max(
    0,
    frame - (CARD_REVEAL_START + index * CARD_REVEAL_STAGGER),
  );
  const cycle = ((local + index * 19) % 192) / 96;
  const phase = cycle <= 1 ? cycle : 2 - cycle;

  if (kind === "automation") {
    const pulseX = 18 + phase * 112;
    return (
      <svg viewBox="0 0 148 94" style={{width: "100%", height: "100%"}}>
        <path d="M18 47H130" stroke="#dfe5ef" strokeWidth="5" strokeLinecap="round" />
        {[18, 74, 130].map((x, nodeIndex) => (
          <g key={x}>
            <circle cx={x} cy="47" r="13" fill="#f7f9fc" stroke={accent} strokeWidth="3" />
            <circle cx={x} cy="47" r="4" fill={accent} opacity={0.65 + nodeIndex * 0.12} />
          </g>
        ))}
        <circle cx={pulseX} cy="47" r="5" fill={accent} opacity="0.94" />
        <circle cx={pulseX} cy="47" r="11" fill="none" stroke={accent} strokeWidth="2" opacity="0.24" />
      </svg>
    );
  }

  if (kind === "insights") {
    const bars = [31, 48, 66, 43];
    return (
      <svg viewBox="0 0 148 94" style={{width: "100%", height: "100%"}}>
        <path d="M10 82H138" stroke="#e0e5ee" strokeWidth="2" />
        {bars.map((height, barIndex) => {
          const breathe = 0.94 + Math.sin((frame + barIndex * 13) * 0.055) * 0.06;
          return (
            <rect
              key={height}
              x={18 + barIndex * 31}
              y={82 - height * breathe}
              width="18"
              height={height * breathe}
              rx="6"
              fill={accent}
              opacity={0.36 + barIndex * 0.15}
            />
          );
        })}
        <path d="M20 66C50 58 58 50 80 45C103 40 115 25 134 18" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="134" cy="18" r="5" fill={accent} />
      </svg>
    );
  }

  if (kind === "content") {
    const shimmer = 0.55 + 0.45 * Math.sin(frame * 0.045);
    return (
      <svg viewBox="0 0 148 94" style={{width: "100%", height: "100%"}}>
        <rect x="22" y="10" width="92" height="74" rx="12" fill="#f8f9fc" stroke="#dfe5ef" strokeWidth="2" />
        {[31, 43, 55, 67].map((y, lineIndex) => (
          <rect key={y} x="38" y={y} width={52 - lineIndex * 5} height="4" rx="2" fill={accent} opacity={0.25 + lineIndex * 0.1} />
        ))}
        <g transform={`translate(112 19) rotate(${frame * 0.35})`} opacity={shimmer}>
          <path d="M0-12L4-4L12 0L4 4L0 12L-4 4L-12 0L-4-4Z" fill={accent} />
        </g>
      </svg>
    );
  }

  const dashOffset = -((frame + index * 11) % 80);
  return (
    <svg viewBox="0 0 148 94" style={{width: "100%", height: "100%"}}>
      <circle cx="74" cy="47" r="38" fill="#f8f9fc" stroke="#e2e7f0" strokeWidth="2" />
      <circle
        cx="74"
        cy="47"
        r="33"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeDasharray="34 18"
        strokeDashoffset={dashOffset}
        opacity="0.45"
      />
      <path d="M74 21L96 31V47C96 61 87 72 74 78C61 72 52 61 52 47V31Z" fill={accent} opacity="0.18" stroke={accent} strokeWidth="2.5" />
      <rect x="65" y="44" width="18" height="17" rx="4" fill={accent} />
      <path d="M68 44V39C68 31 80 31 80 39V44" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

type Result = {
  title: string;
  category: string;
  description: string;
  match: string;
  accent: string;
  pale: string;
  kind: VisualKind;
};

const RESULTS: Result[] = [
  {
    title: "Workflow Automation",
    category: "OPERATIONS",
    description: "Automate repetitive workflows and scale daily operations.",
    match: "98% MATCH",
    accent: "#315cf5",
    pale: "#eef2ff",
    kind: "automation",
  },
  {
    title: "Customer Insights",
    category: "ANALYTICS",
    description: "Turn customer signals into clear growth opportunities.",
    match: "96% MATCH",
    accent: "#06a89c",
    pale: "#eafaf7",
    kind: "insights",
  },
  {
    title: "Content Assistant",
    category: "MARKETING",
    description: "Create consistent campaigns with intelligent assistance.",
    match: "94% MATCH",
    accent: "#7b55e8",
    pale: "#f3efff",
    kind: "content",
  },
  {
    title: "Secure Data",
    category: "GOVERNANCE",
    description: "Protect business data with governance-ready infrastructure.",
    match: "92% MATCH",
    accent: "#e1793c",
    pale: "#fff3e9",
    kind: "security",
  },
];

const ResultCard: React.FC<{
  item: Result;
  index: number;
  frame: number;
  fps: number;
  exit: number;
}> = ({item, index, frame, fps, exit}) => {
  const start = CARD_REVEAL_START + index * CARD_REVEAL_STAGGER;
  const focusStart = CARD_FOCUS_START + index * CARD_FOCUS_DURATION;
  const focus =
    smooth(frame, focusStart, focusStart + 10) *
    (1 - smooth(frame, focusStart + 40, focusStart + CARD_FOCUS_DURATION));
  const settle = clamp01(
    spring({
      frame: frame - start,
      fps,
      config: {damping: 21, stiffness: 150, mass: 0.75},
    }),
  );
  const visibility = settle * exit;
  const drift = (1 - settle) * 42 + (1 - exit) * 28 - focus * 8;
  const accentLine = easeOut(frame, start + 8, start + 44);

  return (
    <div
      style={{
        position: "relative",
        height: 220,
        borderRadius: 24,
        border: "1px solid rgba(111,126,155,0.18)",
        background: "rgba(255,255,255,0.94)",
        boxShadow: `0 ${22 + focus * 8}px ${50 + focus * 18}px rgba(33,49,78,${0.09 + focus * 0.035}), 0 0 ${focus * 34}px ${item.accent}24, inset 0 1px 0 rgba(255,255,255,0.94)`,
        overflow: "hidden",
        opacity: visibility,
        transform: `translateY(${drift}px) scale(${0.985 + settle * 0.015 + focus * 0.012})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          borderRadius: 23,
          border: `2px solid ${item.accent}`,
          opacity: focus * 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${accentLine * 100}%`,
          height: 4,
          background: `linear-gradient(90deg, ${item.accent}, transparent 88%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 26,
          width: 56,
          height: 56,
          borderRadius: 17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: item.pale,
          color: item.accent,
          fontSize: 25,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div style={{position: "absolute", left: 101, top: 28, right: 130}}>
        <div style={{fontSize: 13, letterSpacing: 2.1, fontWeight: 800, color: item.accent}}>{item.category}</div>
        <div style={{marginTop: 7, fontSize: 27, lineHeight: 1.08, fontWeight: 750, letterSpacing: -0.7, color: "#182238"}}>
          {item.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 25,
          padding: "8px 11px",
          borderRadius: 999,
          background: item.pale,
          color: item.accent,
          fontSize: 11,
          letterSpacing: 1.25,
          fontWeight: 800,
        }}
      >
        {item.match}
      </div>
      <div style={{position: "absolute", left: 27, top: 112, width: 335, color: "#6a7488", fontSize: 18, lineHeight: 1.45}}>
        {item.description}
      </div>
      <div style={{position: "absolute", right: 24, bottom: 18, width: 156, height: 98}}>
        <CardVisual kind={item.kind} frame={frame} accent={item.accent} index={index} />
      </div>
    </div>
  );
};

const ResultGrid: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const enter = smooth(frame, 328, 350);
  const exit = 1 - smooth(frame, RESULT_EXIT_START, RESULT_EXIT_END);
  const headingOpacity = enter * exit;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 327,
        width: 1232,
        transform: "translateX(-50%)",
        zIndex: 8,
      }}
    >
      <div
        style={{
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: headingOpacity,
          transform: `translateY(${(1 - enter) * 12}px)`,
          color: "#627087",
        }}
      >
        <div style={{fontSize: 14, fontWeight: 800, letterSpacing: 3.2}}>4 SOLUTIONS FOUND</div>
        <div style={{display: "flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 700, color: "#3c4a63"}}>
          <span style={{width: 8, height: 8, borderRadius: 99, background: "#14b8a6", boxShadow: "0 0 0 5px rgba(20,184,166,0.10)"}} />
          BEST MATCH
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 28, marginTop: 8}}>
        {RESULTS.map((item, index) => (
          <ResultCard key={item.title} item={item} index={index} frame={frame} fps={fps} exit={exit} />
        ))}
      </div>
    </div>
  );
};

const SearchShell: React.FC<{frame: number}> = ({frame}) => {
  const expanded = smooth(frame, 118, 162);
  const collapsed = smooth(frame, RESULT_EXIT_END, 846);
  const open = expanded * (1 - collapsed);
  const width = CONTROL_SIZE + open * (FULL_SEARCH_WIDTH - CONTROL_SIZE);
  const lift =
    smooth(frame, 306, 344) *
    (1 - smooth(frame, RESULT_EXIT_START, RESULT_EXIT_END));
  const centerY = 540 - lift * 310;
  const clear = smooth(frame, 852, 899);
  const shellScale = 1 - clear * 0.82;
  const shellOpacity = 1 - clear;
  const pointerClick = interpolate(frame, [90, 98, 106], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const submitClick = interpolate(frame, [300, 307, 315], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const buttonScale = Math.min(pointerClick, submitClick);
  const typedCount = Math.min(
    QUERY.length,
    Math.max(
      0,
      Math.floor(
        interpolate(frame, [172, 300], [0, QUERY.length + 0.99], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      ),
    ),
  );
  const typed = QUERY.slice(0, typedCount);
  const caretVisible = frame >= 168 && frame < 302 && Math.floor((frame - 168) / 15) % 2 === 0;
  const processing = frame >= 306 && frame < 334;
  const focusGlow = smooth(frame, 96, 122) * (1 - smooth(frame, 154, 172));

  return (
    <div
      style={{
        position: "absolute",
        left: WIDTH / 2,
        top: centerY,
        width,
        height: CONTROL_SIZE,
        opacity: shellOpacity,
        transform: `translate(-50%, -50%) scale(${shellScale})`,
        transformOrigin: "50% 50%",
        borderRadius: 24,
        background: "rgba(255,255,255,0.97)",
        border: `1.5px solid rgba(83,101,136,${0.30 + focusGlow * 0.2})`,
        boxShadow: `0 18px 48px rgba(41,56,86,${0.10 + open * 0.04}), 0 0 0 ${focusGlow * 7}px rgba(49,92,245,${focusGlow * 0.07})`,
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: CONTROL_SIZE,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          paddingLeft: 38,
          paddingRight: 25,
          opacity:
            smooth(frame, 150, 170) *
            (1 - smooth(frame, RESULT_EXIT_END, 826)),
          whiteSpace: "nowrap",
          color: "#182238",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 37,
          letterSpacing: -0.7,
          fontWeight: 500,
        }}
      >
        <span>{typed}</span>
        <span
          style={{
            width: 2,
            height: 43,
            marginLeft: 4,
            borderRadius: 4,
            background: "#315cf5",
            opacity: caretVisible ? 1 : 0,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: CONTROL_SIZE,
          height: CONTROL_SIZE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${buttonScale})`,
          transformOrigin: "center",
          borderRadius: open > 0.98 ? "0 23px 23px 0" : 23,
          background: "linear-gradient(135deg, #315cf5 0%, #2879ec 52%, #18a6b8 135%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
        }}
      >
        <div style={{width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", transform: processing ? `rotate(${frame * 9}deg)` : undefined}}>
          <SearchGlyph spinning={processing} />
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 35%, #ffffff 0%, #f8fafc 42%, #eef2f7 100%)",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(120deg, rgba(49,92,245,0.025), transparent 35%, transparent 66%, rgba(6,168,156,0.025))",
        }}
      />
      <ResultGrid frame={frame} fps={fps} />
      <SearchShell frame={frame} />
      <Pointer frame={frame} />
    </AbsoluteFill>
  );
};
