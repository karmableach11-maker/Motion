import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";

const FPS = 60;
const TOTAL_FRAMES = 20 * FPS;
const FONT = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Helvetica Neue', Arial, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

const C = {
  bg: "#060806",
  bgWarm: "#0d0f0b",
  paper: "#e9eadf",
  paperSoft: "#cdd1c6",
  ink: "#13201b",
  white: "#f5f7ed",
  muted: "#77867d",
  faint: "#3d4942",
  line: "rgba(177, 199, 184, 0.18)",
  green: "#69e19f",
  greenDeep: "#1a7850",
  cyan: "#69d8d1",
  amber: "#f2bb62",
  red: "#f27468",
};

type StageKey = "intake" | "fraud" | "sanctions" | "policy" | "human" | "final";

type Stage = {
  key: StageKey;
  number: string;
  title: string;
  short: string;
  start: number;
  end: number;
  color: string;
};

const STAGES: Stage[] = [
  {
    key: "intake",
    number: "01",
    title: "TRANSACTION INTAKE",
    short: "DATA NORMALIZED",
    start: 110,
    end: 270,
    color: C.cyan,
  },
  {
    key: "fraud",
    number: "02",
    title: "FRAUD BEHAVIOR",
    short: "ANOMALY SCREEN",
    start: 245,
    end: 455,
    color: C.amber,
  },
  {
    key: "sanctions",
    number: "03",
    title: "SANCTIONS SCREEN",
    short: "WATCHLIST MATCH",
    start: 430,
    end: 660,
    color: C.cyan,
  },
  {
    key: "policy",
    number: "04",
    title: "POLICY CONTROLS",
    short: "RULE VALIDATION",
    start: 635,
    end: 845,
    color: C.green,
  },
  {
    key: "human",
    number: "05",
    title: "HUMAN REVIEW",
    short: "EVIDENCE CHECK",
    start: 820,
    end: 1035,
    color: C.amber,
  },
  {
    key: "final",
    number: "06",
    title: "CONTROL DECISION",
    short: "AUDIT RECORDED",
    start: 1005,
    end: 1150,
    color: C.green,
  },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

const linear = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const rangeOpacity = (
  frame: number,
  start: number,
  fadeInEnd: number,
  fadeOutStart: number,
  end: number,
) =>
  Math.min(
    smooth(frame, start, fadeInEnd),
    interpolate(frame, [fadeOutStart, end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }),
  );

const rgba = (hex: string, opacity: number) => {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const seeded = (index: number) => {
  const value = Math.sin(index * 917.17 + 41.73) * 43758.5453;
  return value - Math.floor(value);
};

const activeStage = (frame: number) => {
  if (frame >= 1005) return STAGES[5];
  if (frame >= 820) return STAGES[4];
  if (frame >= 635) return STAGES[3];
  if (frame >= 430) return STAGES[2];
  if (frame >= 245) return STAGES[1];
  return STAGES[0];
};

const ShieldIcon: React.FC<{size?: number; color?: string}> = ({
  size = 30,
  color = C.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path
      d="M18 3.8 31 8.6v8.8c0 7.8-5 12.7-13 15.5C10 30.1 5 25.2 5 17.4V8.6L18 3.8Z"
      stroke={color}
      strokeWidth="1.7"
    />
    <path
      d="m11.7 18.1 4.2 4.2 8.7-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon: React.FC<{size?: number; color?: string}> = ({
  size = 18,
  color = C.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="m4.7 12.5 4.3 4.4L19.5 6.7"
      stroke={color}
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon: React.FC<{size?: number; color?: string}> = ({
  size = 30,
  color = C.amber,
}) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="11.5" r="5.6" stroke={color} strokeWidth="1.7" />
    <path
      d="M7.2 31.2c1.2-7.2 4.8-10.8 10.8-10.8s9.6 3.6 10.8 10.8"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const GlobeIcon: React.FC<{size?: number; color?: string}> = ({
  size = 32,
  color = C.cyan,
}) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="14.2" stroke={color} strokeWidth="1.4" />
    <ellipse cx="18" cy="18" rx="6.8" ry="14.2" stroke={color} strokeWidth="1.1" />
    <path d="M4 18h28M7 11.2h22M7 24.8h22" stroke={color} strokeWidth="1.1" />
  </svg>
);

const WaveIcon: React.FC<{size?: number; color?: string}> = ({
  size = 32,
  color = C.amber,
}) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path
      d="M3 23.5h5l3.5-10 5 14 4.3-19 4.8 15 3.3-7H33"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LedgerBackground: React.FC<{frame: number}> = ({frame}) => {
  const drift = (frame * 0.18) % 44;
  const glowX = 52 + Math.sin(frame / 140) * 3;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at ${glowX}% 49%, rgba(64, 122, 89, .18), transparent 31%),
          radial-gradient(circle at 70% 42%, rgba(105, 216, 209, .07), transparent 29%),
          linear-gradient(145deg, ${C.bgWarm}, ${C.bg} 58%, #030403)
        `,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-100px -180px",
          opacity: 0.45,
          transform: "perspective(900px) rotateX(64deg) translateY(390px)",
          transformOrigin: "50% 50%",
          backgroundImage: `
            linear-gradient(${C.line} 1px, transparent 1px),
            linear-gradient(90deg, ${C.line} 1px, transparent 1px)
          `,
          backgroundSize: `78px 44px`,
          backgroundPosition: `0 ${drift}px`,
          maskImage:
            "linear-gradient(to bottom, transparent 4%, rgba(0,0,0,.75) 30%, black 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 102,
          bottom: 80,
          opacity: 0.13,
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 53px, rgba(166,196,177,.22) 54px)",
          backgroundPositionY: `${-(frame * 0.08) % 54}px`,
        }}
      />
      {Array.from({length: 30}).map((_, index) => {
        const x = seeded(index * 3) * 1920;
        const y = seeded(index * 3 + 1) * 1080;
        const pulse = 0.22 + 0.34 * Math.sin(frame / 26 + index * 1.7);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: index % 5 === 0 ? 3 : 2,
              height: index % 5 === 0 ? 3 : 2,
              borderRadius: "50%",
              background: index % 3 === 0 ? C.cyan : C.green,
              boxShadow: `0 0 12px ${rgba(index % 3 === 0 ? C.cyan : C.green, pulse)}`,
              opacity: Math.max(0.08, pulse),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255,255,255,.014) 4px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{frame: number}> = ({frame}) => {
  const appear = smooth(frame, 50, 150);
  const titleSlide = (1 - appear) * 26;

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        top: 38,
        height: 94,
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${C.line}`,
        opacity: appear,
        transform: `translateY(${titleSlide}px)`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          display: "grid",
          placeItems: "center",
          border: `1px solid ${rgba(C.green, 0.46)}`,
          background: rgba(C.green, 0.06),
          boxShadow: `0 0 36px ${rgba(C.green, 0.12)}`,
        }}
      >
        <ShieldIcon size={34} />
      </div>
      <div style={{marginLeft: 18}}>
        <div
          style={{
            color: C.white,
            fontFamily: FONT,
            fontSize: 33,
            fontWeight: 780,
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          AI FINANCIAL COMPLIANCE REVIEW
        </div>
        <div
          style={{
            color: C.green,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.19em",
            marginTop: 10,
          }}
        >
          AUTOMATED SCREENING • HUMAN OVERSIGHT • TRACEABLE DECISION
        </div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <div style={{textAlign: "right"}}>
          <div
            style={{
              color: C.muted,
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.17em",
            }}
          >
            CASE REFERENCE
          </div>
          <div
            style={{
              color: C.white,
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.12em",
              marginTop: 7,
            }}
          >
            TXN–2748–A9
          </div>
        </div>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: C.green,
            boxShadow: `0 0 ${14 + 6 * Math.sin(frame / 15)}px ${C.green}`,
          }}
        />
      </div>
    </div>
  );
};

const StageRail: React.FC<{frame: number}> = ({frame}) => {
  const appear = smooth(frame, 95, 190);

  return (
    <div
      style={{
        position: "absolute",
        left: 76,
        top: 190,
        width: 350,
        height: 730,
        opacity: appear,
        zIndex: 20,
      }}
    >
      <div
        style={{
          color: C.muted,
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          marginBottom: 29,
        }}
      >
        REVIEW SEQUENCE
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 58,
          width: 1,
          height: 590,
          background: `linear-gradient(${rgba(C.cyan, 0.1)}, ${rgba(C.green, 0.44)})`,
        }}
      />
      {STAGES.map((stage, index) => {
        const inProgress = smooth(frame, stage.start, stage.start + 45);
        const completed = frame >= stage.end - 25;
        const active = frame >= stage.start && frame < stage.end;
        const stageColor = completed ? C.green : active ? stage.color : C.faint;
        const rowY = index * 99;
        const rowOpacity = 0.35 + inProgress * 0.65;

        return (
          <div
            key={stage.key}
            style={{
              position: "absolute",
              left: 0,
              top: 55 + rowY,
              width: 346,
              height: 74,
              display: "flex",
              alignItems: "center",
              opacity: rowOpacity,
              transform: `translateX(${(1 - inProgress) * -18}px)`,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 42,
                height: 42,
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
                borderRadius: "50%",
                border: `1px solid ${rgba(stageColor, active ? 0.84 : 0.42)}`,
                background: active ? rgba(stageColor, 0.12) : C.bg,
                boxShadow: active ? `0 0 25px ${rgba(stageColor, 0.25)}` : "none",
                color: stageColor,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {completed ? <CheckIcon size={18} /> : stage.number}
              {active ? (
                <div
                  style={{
                    position: "absolute",
                    inset: -7,
                    borderRadius: "50%",
                    border: `1px solid ${rgba(stageColor, 0.17)}`,
                    transform: `scale(${1 + Math.sin(frame / 14) * 0.045})`,
                  }}
                />
              ) : null}
            </div>
            <div style={{marginLeft: 18}}>
              <div
                style={{
                  color: active || completed ? C.white : C.muted,
                  fontFamily: FONT,
                  fontSize: active ? 21 : 17,
                  fontWeight: active ? 760 : 650,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                }}
              >
                {stage.title}
              </div>
              <div
                style={{
                  color: stageColor,
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  marginTop: 8,
                }}
              >
                {completed ? "CHECK COMPLETE" : active ? stage.short : "PENDING"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrbitRings: React.FC<{frame: number; stage: Stage}> = ({frame, stage}) => {
  const reveal = smooth(frame, 125, 260);
  const rotation = frame * 0.13;
  const secondaryRotation = -frame * 0.085;
  const pulse = 1 + Math.sin(frame / 25) * 0.009;

  return (
    <div
      style={{
        position: "absolute",
        left: 438,
        top: 154,
        width: 970,
        height: 790,
        opacity: reveal,
        transform: `scale(${0.93 + reveal * 0.07})`,
        transformOrigin: "50% 50%",
        zIndex: 4,
      }}
    >
      <svg width="970" height="790" viewBox="0 0 970 790" fill="none">
        <defs>
          <radialGradient id="chamberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={stage.color} stopOpacity="0.16" />
            <stop offset="58%" stopColor={stage.color} stopOpacity="0.035" />
            <stop offset="100%" stopColor={stage.color} stopOpacity="0" />
          </radialGradient>
          <filter id="orbitBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <ellipse cx="485" cy="394" rx="420" ry="344" fill="url(#chamberGlow)" />
        <ellipse
          cx="485"
          cy="394"
          rx="388"
          ry="319"
          stroke={rgba(C.white, 0.07)}
          strokeWidth="1"
          strokeDasharray="2 15"
          transform={`rotate(${rotation} 485 394) scale(${pulse})`}
        />
        <ellipse
          cx="485"
          cy="394"
          rx="350"
          ry="286"
          stroke={rgba(stage.color, 0.32)}
          strokeWidth="1.4"
          strokeDasharray="150 46 7 28"
          transform={`rotate(${secondaryRotation} 485 394)`}
        />
        <ellipse
          cx="485"
          cy="394"
          rx="303"
          ry="250"
          stroke={rgba(C.white, 0.12)}
          strokeWidth="1"
          strokeDasharray="3 9"
          transform={`rotate(${rotation * 0.45} 485 394)`}
        />
        <path
          d="M100 394h94M776 394h94M485 44v68M485 676v68"
          stroke={rgba(stage.color, 0.38)}
          strokeWidth="1"
        />
        <path
          d="M165 188 229 240M741 548l64 53M165 600l64-53M741 240l64-52"
          stroke={rgba(C.white, 0.08)}
          strokeWidth="1"
        />
        <ellipse
          cx="485"
          cy="394"
          rx="352"
          ry="288"
          stroke={rgba(stage.color, 0.16)}
          strokeWidth="9"
          strokeDasharray="42 170"
          filter="url(#orbitBloom)"
          transform={`rotate(${rotation * 1.4} 485 394)`}
        />
      </svg>
      {[
        {label: "RISK MODEL", x: 110, y: 160},
        {label: "ENTITY GRAPH", x: 736, y: 160},
        {label: "POLICY ENGINE", x: 95, y: 612},
        {label: "AUDIT LEDGER", x: 739, y: 612},
      ].map((item, index) => (
        <div
          key={item.label}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            color: index % 2 === 0 ? stage.color : C.muted,
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.17em",
            opacity: 0.54 + Math.sin(frame / 29 + index) * 0.18,
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

const DocumentRows: React.FC<{frame: number}> = ({frame}) => {
  const rows = [
    ["ORIGINATOR", "NORTHRIDGE EXPORTS LTD."],
    ["BENEFICIARY", "MERIDIAN SUPPLY GROUP"],
    ["PAYMENT RAIL", "INTERNATIONAL WIRE"],
    ["PURPOSE", "INVOICE SETTLEMENT"],
  ];

  return (
    <div style={{marginTop: 20}}>
      {rows.map(([label, value], index) => {
        const show = smooth(frame, 156 + index * 18, 206 + index * 18);
        return (
          <div
            key={label}
            style={{
              height: 48,
              display: "grid",
              gridTemplateColumns: "118px 1fr",
              alignItems: "center",
              borderTop: `1px solid ${rgba(C.ink, 0.14)}`,
              opacity: show,
              transform: `translateX(${(1 - show) * 14}px)`,
            }}
          >
            <span
              style={{
                color: rgba(C.ink, 0.52),
                fontFamily: MONO,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.13em",
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: C.ink,
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const TransactionDocument: React.FC<{frame: number; stage: Stage}> = ({
  frame,
  stage,
}) => {
  const entrance = spring({
    frame: frame - 95,
    fps: FPS,
    config: {damping: 18, stiffness: 105, mass: 0.9},
    durationInFrames: 100,
  });
  const final = smooth(frame, 995, 1080);
  const human = rangeOpacity(frame, 815, 855, 980, 1035);
  const tiltX = Math.sin(frame / 96) * 1.4;
  const tiltY = Math.cos(frame / 83) * 1.6;
  const scanLocal = ((frame - stage.start) % 105) / 105;
  const scanY = -18 + scanLocal * 610;
  const status =
    stage.key === "final"
      ? "CLEARED"
      : stage.key === "human"
        ? "ANALYST REVIEW"
        : "SCREENING";

  return (
    <div
      style={{
        position: "absolute",
        left: 676,
        top: 221,
        width: 500,
        height: 620,
        opacity: entrance,
        transform: `
          perspective(1300px)
          translateY(${(1 - entrance) * 95 - final * 4}px)
          rotateX(${tiltX * (1 - final)}deg)
          rotateY(${tiltY * (1 - final)}deg)
          scale(${0.86 + entrance * 0.14 + final * 0.035})
        `,
        transformOrigin: "50% 50%",
        zIndex: 12,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: `linear-gradient(145deg, ${C.white}, ${C.paper} 65%, ${C.paperSoft})`,
          border: `1px solid ${rgba(C.white, 0.62)}`,
          boxShadow: `
            0 38px 110px rgba(0,0,0,.56),
            0 0 65px ${rgba(stage.color, 0.12)},
            inset 0 1px 0 rgba(255,255,255,.9)
          `,
          clipPath: "polygon(0 0, 94% 0, 100% 5%, 100% 100%, 0 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 30,
            height: 30,
            background: `linear-gradient(225deg, ${rgba(C.ink, 0.16)} 0 49%, transparent 50%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 28,
            width: 432,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${rgba(C.ink, 0.24)}`,
            }}
          >
            <ShieldIcon size={24} color={C.ink} />
          </div>
          <div style={{marginLeft: 12}}>
            <div
              style={{
                color: C.ink,
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.12em",
              }}
            >
              TRANSACTION DOSSIER
            </div>
            <div
              style={{
                color: rgba(C.ink, 0.5),
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: "0.14em",
                marginTop: 4,
              }}
            >
              CASE TXN–2748–A9 • UTC 14:28
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              height: 28,
              padding: "0 11px",
              display: "grid",
              placeItems: "center",
              color: stage.key === "final" ? C.greenDeep : C.ink,
              background:
                stage.key === "final" ? rgba(C.green, 0.23) : rgba(stage.color, 0.16),
              border: `1px solid ${rgba(
                stage.key === "final" ? C.greenDeep : C.ink,
                0.28,
              )}`,
              fontFamily: MONO,
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.12em",
            }}
          >
            {status}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 94,
            right: 34,
          }}
        >
          <div
            style={{
              color: rgba(C.ink, 0.48),
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            TRANSFER VALUE
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 7,
              color: C.ink,
              fontFamily: BODY,
              fontSize: 54,
              fontWeight: 760,
              letterSpacing: "-0.055em",
              lineHeight: 1,
            }}
          >
            <span style={{fontSize: 25, marginRight: 8, fontWeight: 650}}>USD</span>
            248,750
          </div>
          <div
            style={{
              width: "100%",
              height: 2,
              marginTop: 19,
              background: rgba(C.ink, 0.13),
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, linear(frame, 125, 1010) * 100)}%`,
                height: "100%",
                background: stage.color,
                boxShadow: `0 0 10px ${stage.color}`,
              }}
            />
          </div>
          <DocumentRows frame={frame} />
          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              ["RISK SCORE", stage.key === "fraud" ? "18 / 100" : "LOW"],
              ["WATCHLIST", stage.key === "sanctions" ? "0 MATCH" : "CLEAR"],
              ["POLICY", stage.key === "policy" ? "6 / 6" : "VALID"],
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{
                  height: 66,
                  padding: "10px 10px 0",
                  border: `1px solid ${rgba(C.ink, 0.13)}`,
                  background: rgba(index === 0 ? C.amber : C.green, 0.045),
                }}
              >
                <div
                  style={{
                    color: rgba(C.ink, 0.46),
                    fontFamily: MONO,
                    fontSize: 7,
                    fontWeight: 700,
                    letterSpacing: "0.11em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: C.ink,
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    marginTop: 10,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 3,
            opacity: stage.key === "final" ? 0 : 0.8,
            background: `linear-gradient(90deg, transparent, ${stage.color}, transparent)`,
            boxShadow: `0 0 18px 4px ${rgba(stage.color, 0.38)}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY - 70,
            height: 72,
            opacity: stage.key === "final" ? 0 : 0.18,
            background: `linear-gradient(to bottom, transparent, ${stage.color})`,
            mixBlendMode: "multiply",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: human,
            background: `radial-gradient(circle at 78% 77%, ${rgba(C.amber, 0.14)}, transparent 22%)`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

const MetricBar: React.FC<{
  frame: number;
  start: number;
  label: string;
  value: string;
  percent: number;
  color: string;
}> = ({frame, start, label, value, percent, color}) => {
  const reveal = smooth(frame, start, start + 48);
  return (
    <div
      style={{
        marginTop: 19,
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * 20}px)`,
      }}
    >
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <span
          style={{
            color: C.muted,
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.11em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            color,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 3,
          marginTop: 9,
          background: rgba(C.white, 0.075),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent * reveal}%`,
            height: "100%",
            background: color,
            boxShadow: `0 0 12px ${rgba(color, 0.7)}`,
          }}
        />
      </div>
    </div>
  );
};

const FraudEvidence: React.FC<{frame: number}> = ({frame}) => {
  const waveProgress = smooth(frame, 255, 390);
  const points = Array.from({length: 34}).map((_, index) => {
    const x = index * 8.9;
    const base = 44 + Math.sin(index * 0.78) * 9 + Math.cos(index * 0.31) * 5;
    const spike = index === 23 ? -25 : index === 24 ? -14 : 0;
    return `${x},${base + spike}`;
  });

  return (
    <>
      <div
        style={{
          height: 95,
          marginTop: 23,
          borderLeft: `1px solid ${rgba(C.amber, 0.32)}`,
          borderBottom: `1px solid ${rgba(C.white, 0.08)}`,
          overflow: "hidden",
        }}
      >
        <svg width="306" height="95" viewBox="0 0 306 95" fill="none">
          <path
            d={`M${points.join(" L")}`}
            stroke={C.amber}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - waveProgress}
          />
          <line
            x1={207}
            y1={0}
            x2={207}
            y2={95}
            stroke={rgba(C.red, 0.35)}
            strokeDasharray="3 4"
          />
        </svg>
      </div>
      <MetricBar
        frame={frame}
        start={285}
        label="AMOUNT ANOMALY"
        value="LOW"
        percent={18}
        color={C.green}
      />
      <MetricBar
        frame={frame}
        start={315}
        label="DEVICE VELOCITY"
        value="NORMAL"
        percent={31}
        color={C.green}
      />
      <MetricBar
        frame={frame}
        start={345}
        label="BENEFICIARY RISK"
        value="18 / 100"
        percent={18}
        color={C.amber}
      />
    </>
  );
};

const SanctionsEvidence: React.FC<{frame: number}> = ({frame}) => {
  const spin = (frame - 430) * 0.55;
  const matchProgress = smooth(frame, 455, 610);
  return (
    <>
      <div
        style={{
          height: 148,
          marginTop: 18,
          position: "relative",
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width="180" height="146" viewBox="0 0 180 146" fill="none">
          <ellipse
            cx="90"
            cy="73"
            rx="64"
            ry="53"
            stroke={rgba(C.cyan, 0.42)}
            strokeWidth="1.2"
          />
          <ellipse
            cx="90"
            cy="73"
            rx="29"
            ry="53"
            stroke={rgba(C.cyan, 0.25)}
            strokeWidth="1"
          />
          <path
            d="M27 73h126M38 45h104M38 101h104"
            stroke={rgba(C.cyan, 0.22)}
            strokeWidth="1"
          />
          <ellipse
            cx="90"
            cy="73"
            rx="71"
            ry="59"
            stroke={rgba(C.cyan, 0.5)}
            strokeDasharray="15 41 2 24"
            transform={`rotate(${spin} 90 73)`}
          />
          <path
            d="M90 73 141 40"
            stroke={rgba(C.cyan, 0.7)}
            strokeWidth="1.4"
            transform={`rotate(${spin * 1.8} 90 73)`}
          />
          {[
            [52, 56],
            [120, 47],
            [67, 104],
            [131, 87],
          ].map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={3}
              fill={index === 1 ? C.amber : C.cyan}
              opacity={0.45 + 0.45 * Math.sin(frame / 14 + index)}
            />
          ))}
        </svg>
      </div>
      <MetricBar
        frame={frame}
        start={470}
        label="GLOBAL ENTITIES"
        value={`${(7.4 * matchProgress).toFixed(1)}M`}
        percent={100}
        color={C.cyan}
      />
      <MetricBar
        frame={frame}
        start={510}
        label="NAME SIMILARITY"
        value="0.02%"
        percent={2}
        color={C.green}
      />
      <MetricBar
        frame={frame}
        start={550}
        label="CONFIRMED MATCH"
        value="NONE"
        percent={4}
        color={C.green}
      />
    </>
  );
};

const PolicyEvidence: React.FC<{frame: number}> = ({frame}) => {
  const rules = [
    ["PAYMENT PURPOSE", "VERIFIED"],
    ["COUNTRY EXPOSURE", "PERMITTED"],
    ["SOURCE OF FUNDS", "DOCUMENTED"],
    ["DUAL APPROVAL", "REQUIRED"],
  ];

  return (
    <div style={{marginTop: 25}}>
      {rules.map(([label, value], index) => {
        const check = smooth(frame, 655 + index * 38, 705 + index * 38);
        return (
          <div
            key={label}
            style={{
              height: 57,
              display: "grid",
              gridTemplateColumns: "30px 1fr",
              alignItems: "center",
              borderBottom: `1px solid ${rgba(C.white, 0.075)}`,
              opacity: 0.35 + check * 0.65,
              transform: `translateX(${(1 - check) * 16}px)`,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                display: "grid",
                placeItems: "center",
                border: `1px solid ${rgba(C.green, 0.45)}`,
                background: rgba(C.green, 0.07),
                transform: `scale(${0.7 + check * 0.3})`,
              }}
            >
              <CheckIcon size={14} />
            </div>
            <div>
              <div
                style={{
                  color: C.white,
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  color: C.green,
                  fontFamily: MONO,
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  marginTop: 5,
                }}
              >
                {value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HumanEvidence: React.FC<{frame: number}> = ({frame}) => {
  const signature = smooth(frame, 860, 960);
  return (
    <>
      <div
        style={{
          height: 88,
          marginTop: 25,
          display: "flex",
          alignItems: "center",
          border: `1px solid ${rgba(C.amber, 0.24)}`,
          background: rgba(C.amber, 0.045),
          padding: "0 17px",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: `1px solid ${rgba(C.amber, 0.52)}`,
            background: rgba(C.amber, 0.08),
          }}
        >
          <UserIcon size={31} />
        </div>
        <div style={{marginLeft: 15}}>
          <div
            style={{
              color: C.white,
              fontFamily: FONT,
              fontSize: 17,
              fontWeight: 760,
              letterSpacing: "0.08em",
            }}
          >
            COMPLIANCE ANALYST
          </div>
          <div
            style={{
              color: C.amber,
              fontFamily: MONO,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.12em",
              marginTop: 7,
            }}
          >
            ID VERIFIED • SESSION SECURE
          </div>
        </div>
      </div>
      {[
        "SOURCE DOCUMENTS REVIEWED",
        "BENEFICIAL OWNER CONFIRMED",
        "ENHANCED MONITORING APPLIED",
      ].map((label, index) => {
        const show = smooth(frame, 875 + index * 31, 925 + index * 31);
        return (
          <div
            key={label}
            style={{
              height: 45,
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: `1px solid ${rgba(C.white, 0.07)}`,
              opacity: show,
            }}
          >
            <CheckIcon size={16} color={C.amber} />
            <span
              style={{
                color: C.white,
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.085em",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 18,
          color: C.amber,
          fontFamily: MONO,
          fontSize: 12,
          fontStyle: "italic",
          letterSpacing: "0.08em",
          clipPath: `inset(0 ${(1 - signature) * 100}% 0 0)`,
          whiteSpace: "nowrap",
        }}
      >
        digitally reviewed / control officer 04
      </div>
    </>
  );
};

const FinalEvidence: React.FC<{frame: number}> = ({frame}) => {
  const reveal = spring({
    frame: frame - 1015,
    fps: FPS,
    durationInFrames: 90,
    config: {damping: 16, stiffness: 115, mass: 0.9},
  });

  return (
    <div
      style={{
        marginTop: 26,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px)`,
      }}
    >
      <div
        style={{
          width: 192,
          height: 192,
          margin: "0 auto",
          position: "relative",
          display: "grid",
          placeItems: "center",
          transform: `rotate(${(1 - reveal) * -22}deg) scale(${0.72 + reveal * 0.28})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${C.green}`,
            boxShadow: `0 0 36px ${rgba(C.green, 0.25)}, inset 0 0 32px ${rgba(
              C.green,
              0.08,
            )}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: `1px dashed ${rgba(C.green, 0.62)}`,
          }}
        />
        <ShieldIcon size={78} />
      </div>
      <div
        style={{
          marginTop: 18,
          textAlign: "center",
          color: C.green,
          fontFamily: FONT,
          fontSize: 25,
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}
      >
        DECISION RECORDED
      </div>
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          color: C.muted,
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.13em",
        }}
      >
        IMMUTABLE AUDIT ID • 9F2A–84C1
      </div>
    </div>
  );
};

const EvidenceColumn: React.FC<{frame: number; stage: Stage}> = ({frame, stage}) => {
  const appear = smooth(frame, 165, 250);
  const stageProgress = clamp01((frame - stage.start) / Math.max(1, stage.end - stage.start));
  const icon =
    stage.key === "fraud" ? (
      <WaveIcon size={34} color={stage.color} />
    ) : stage.key === "sanctions" ? (
      <GlobeIcon size={34} color={stage.color} />
    ) : stage.key === "human" ? (
      <UserIcon size={34} color={stage.color} />
    ) : (
      <ShieldIcon size={34} color={stage.color} />
    );

  return (
    <div
      style={{
        position: "absolute",
        right: 74,
        top: 196,
        width: 344,
        height: 665,
        opacity: appear,
        transform: `translateX(${(1 - appear) * 24}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 17,
          borderBottom: `1px solid ${rgba(stage.color, 0.35)}`,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${rgba(stage.color, 0.42)}`,
            background: rgba(stage.color, 0.06),
            boxShadow: `0 0 26px ${rgba(stage.color, 0.1)}`,
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              color: stage.color,
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
            }}
          >
            ACTIVE CONTROL {stage.number}
          </div>
          <div
            style={{
              color: C.white,
              fontFamily: FONT,
              fontSize: 23,
              fontWeight: 780,
              letterSpacing: "0.075em",
              marginTop: 8,
            }}
          >
            {stage.title}
          </div>
        </div>
      </div>
      <div
        style={{
          height: 4,
          marginTop: 12,
          background: rgba(C.white, 0.065),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${stageProgress * 100}%`,
            height: "100%",
            background: stage.color,
            boxShadow: `0 0 14px ${rgba(stage.color, 0.8)}`,
          }}
        />
      </div>
      <div key={stage.key}>
        {stage.key === "fraud" ? <FraudEvidence frame={frame} /> : null}
        {stage.key === "sanctions" ? <SanctionsEvidence frame={frame} /> : null}
        {stage.key === "policy" || stage.key === "intake" ? (
          <PolicyEvidence frame={frame} />
        ) : null}
        {stage.key === "human" ? <HumanEvidence frame={frame} /> : null}
        {stage.key === "final" ? <FinalEvidence frame={frame} /> : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 15,
          borderTop: `1px solid ${C.line}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: C.muted,
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.13em",
          }}
        >
          AI CONFIDENCE
        </span>
        <span
          style={{
            color: stage.color,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.1em",
          }}
        >
          {stage.key === "human" ? "HUMAN VERIFIED" : stage.key === "final" ? "100%" : "98.7%"}
        </span>
      </div>
    </div>
  );
};

const ControlTransition: React.FC<{frame: number}> = ({frame}) => {
  const boundaries = [245, 430, 635, 820, 1005];
  const event = boundaries.find((boundary) => frame >= boundary - 10 && frame <= boundary + 18);

  if (event === undefined) {
    return null;
  }

  const nextStage = activeStage(event);
  const travel = linear(frame, event - 10, event + 18);
  const opacity = interpolate(frame, [event - 10, event, event + 18], [0, 0.72, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const x = interpolate(travel, [0, 1], [430, 1885]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 27,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x - 74,
          top: 145,
          width: 150,
          height: 760,
          opacity: opacity * 0.34,
          background: `linear-gradient(90deg, transparent, ${nextStage.color}, transparent)`,
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: 152,
          width: 2,
          height: 742,
          opacity,
          background: nextStage.color,
          boxShadow: `0 0 18px 4px ${rgba(nextStage.color, 0.52)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: opacity * 0.045,
          background: nextStage.color,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

const FinalDecision: React.FC<{frame: number}> = ({frame}) => {
  const reveal = spring({
    frame: frame - 1015,
    fps: FPS,
    durationInFrames: 100,
    config: {damping: 17, stiffness: 105, mass: 0.88},
  });
  const hold = smooth(frame, 1040, 1100);

  return (
    <div
      style={{
        position: "absolute",
        left: 542,
        top: 862,
        width: 768,
        height: 112,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 30}px) scale(${0.96 + reveal * 0.04})`,
        zIndex: 28,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent, ${rgba(C.green, 0.16)}, transparent)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          borderTop: `1px solid ${rgba(C.green, 0.48)}`,
          borderBottom: `1px solid ${rgba(C.green, 0.48)}`,
          background: rgba(C.bg, 0.88),
        }}
      >
        <div
          style={{
            color: C.green,
            fontFamily: FONT,
            fontSize: 39,
            fontWeight: 820,
            letterSpacing: "0.13em",
            textShadow: `0 0 24px ${rgba(C.green, 0.22)}`,
          }}
        >
          CLEARED WITH CONTROLS
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 13,
            color: rgba(C.white, 0.62),
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.15em",
            opacity: hold,
          }}
        >
          ENHANCED MONITORING ACTIVE • HUMAN APPROVAL RECORDED
        </div>
      </div>
    </div>
  );
};

const AuditFooter: React.FC<{frame: number; stage: Stage}> = ({frame, stage}) => {
  const appear = smooth(frame, 150, 250);
  const percent = Math.min(100, Math.round(linear(frame, 120, 1080) * 100));
  const events = [
    {x: 5, frame: 170, color: C.cyan},
    {x: 21, frame: 320, color: C.amber},
    {x: 41, frame: 505, color: C.cyan},
    {x: 61, frame: 690, color: C.green},
    {x: 79, frame: 860, color: C.amber},
    {x: 95, frame: 1030, color: C.green},
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 74,
        right: 74,
        bottom: 31,
        height: 54,
        display: "flex",
        alignItems: "center",
        opacity: appear,
        borderTop: `1px solid ${C.line}`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 235,
          color: C.muted,
          fontFamily: MONO,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.16em",
        }}
      >
        TRACEABLE COMPLIANCE LEDGER
      </div>
      <div
        style={{
          position: "relative",
          width: 1040,
          height: 2,
          background: rgba(C.white, 0.08),
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`,
            boxShadow: `0 0 12px ${rgba(stage.color, 0.55)}`,
          }}
        />
        {events.map((event, index) => {
          const show = smooth(frame, event.frame, event.frame + 30);
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${event.x}%`,
                top: -4,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: event.color,
                border: `2px solid ${C.bg}`,
                boxShadow: `0 0 12px ${rgba(event.color, 0.65)}`,
                opacity: show,
                transform: `scale(${show})`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          marginLeft: "auto",
          textAlign: "right",
        }}
      >
        <div
          style={{
            color: stage.color,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
          }}
        >
          {percent}% REVIEWED
        </div>
        <div
          style={{
            color: C.muted,
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.1em",
            marginTop: 5,
          }}
        >
          IMMUTABLE EVENT LOG
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const stage = activeStage(frame);
  const opening = smooth(frame, 0, 110);
  const blur = interpolate(frame, [0, 75, 150], [34, 11, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outro = smooth(frame, 1110, TOTAL_FRAMES - 1);
  const cameraPush = linear(frame, 130, 1080);
  const cameraX = Math.sin(frame / 180) * 3.5;
  const cameraY = Math.cos(frame / 210) * 2.2;

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        overflow: "hidden",
        fontFamily: BODY,
      }}
    >
      <LedgerBackground frame={frame} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: opening * (1 - outro),
          filter: `blur(${blur + outro * 9}px)`,
          transform: `
            translate(${cameraX}px, ${cameraY}px)
            scale(${1.025 - cameraPush * 0.025 + outro * 0.015})
          `,
          transformOrigin: "50% 50%",
        }}
      >
        <Header frame={frame} />
        <StageRail frame={frame} />
        <OrbitRings frame={frame} stage={stage} />
        <TransactionDocument frame={frame} stage={stage} />
        <EvidenceColumn frame={frame} stage={stage} />
        <AuditFooter frame={frame} stage={stage} />
        {frame >= 995 ? <FinalDecision frame={frame} /> : null}
        <ControlTransition frame={frame} />
      </div>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `
            linear-gradient(90deg, rgba(0,0,0,.25), transparent 17%, transparent 82%, rgba(0,0,0,.29)),
            radial-gradient(circle at center, transparent 57%, rgba(0,0,0,.50) 100%)
          `,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: outro,
          background: "#000",
        }}
      />
    </AbsoluteFill>
  );
};
