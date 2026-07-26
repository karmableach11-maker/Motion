import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const FPS = 60;
const TOTAL_FRAMES = 20 * FPS;
const FONT = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

const C = {
  bg: "#03090e",
  panel: "rgba(5, 17, 25, 0.88)",
  panelSoft: "rgba(8, 25, 34, 0.72)",
  line: "rgba(117, 193, 211, 0.20)",
  lineStrong: "rgba(117, 211, 230, 0.46)",
  text: "#e7f8fb",
  muted: "#71909b",
  cyan: "#63def2",
  cyanSoft: "#2796b0",
  amber: "#f4b860",
  amberSoft: "#9b662d",
  green: "#5fe0a2",
  red: "#f07070",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const progress = (frame: number, start: number, end: number) =>
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

const alpha = (hex: string, opacity: number) => {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const CheckIcon: React.FC<{size?: number; color?: string}> = ({
  size = 16,
  color = C.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12.5 9.3 17 19 7"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = C.cyan,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 3.5 27 7.8v7.5c0 6.7-4.3 10.9-11 13.3C9.3 26.2 5 22 5 15.3V7.8L16 3.5Z"
      stroke={color}
      strokeWidth="1.7"
    />
    <path d="m10.8 15.8 3.4 3.4 7.2-7.3" stroke={color} strokeWidth="1.8" />
  </svg>
);

const HumanIcon: React.FC<{size?: number; color?: string}> = ({
  size = 36,
  color = C.amber,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="13" r="6" stroke={color} strokeWidth="1.8" />
    <path
      d="M8.5 33c1.2-7.2 5-10.8 11.5-10.8S30.3 25.8 31.5 33"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const AiNodeIcon: React.FC<{size?: number}> = ({size = 52}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path
      d="M32 5 54.5 18v28L32 59 9.5 46V18L32 5Z"
      stroke={C.cyan}
      strokeWidth="1.5"
    />
    <path
      d="M32 14 46.8 22.5v19L32 50l-14.8-8.5v-19L32 14Z"
      stroke={alpha(C.cyan, 0.45)}
      strokeWidth="1.2"
    />
    {[
      [32, 22],
      [24, 31],
      [40, 31],
      [32, 41],
    ].map(([x, y], index) => (
      <circle key={index} cx={x} cy={y} r="2.5" fill={C.cyan} />
    ))}
    <path
      d="m32 22-8 9 8 10 8-10-8-9Zm-8 9h16"
      stroke={alpha(C.cyan, 0.66)}
      strokeWidth="1"
    />
  </svg>
);

const StatusPill: React.FC<{
  children: React.ReactNode;
  color: string;
  compact?: boolean;
}> = ({children, color, compact = false}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: compact ? 66 : 88,
      height: compact ? 24 : 28,
      padding: compact ? "0 9px" : "0 12px",
      borderRadius: 4,
      border: `1px solid ${alpha(color, 0.52)}`,
      background: alpha(color, 0.10),
      color,
      fontFamily: MONO,
      fontSize: compact ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.10em",
      whiteSpace: "nowrap",
      boxShadow: `0 0 16px ${alpha(color, 0.06)}`,
    }}
  >
    {children}
  </span>
);

const Panel: React.FC<{
  frame: number;
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({frame, delay = 0, children, style}) => {
  const appear = progress(frame, 155 + delay, 260 + delay);
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${C.line}`,
        background: `linear-gradient(155deg, ${C.panelSoft}, ${C.panel})`,
        boxShadow: `inset 0 1px 0 ${alpha(C.cyan, 0.07)}, 0 18px 70px rgba(0,0,0,.28)`,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 10}px)`,
        clipPath: `inset(0 ${100 - appear * 100}% 0 0)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, rgba(95,220,242,.025), transparent 33%, transparent 68%, rgba(244,184,96,.025))",
        }}
      />
      {children}
    </div>
  );
};

const PanelTitle: React.FC<{
  title: string;
  subtitle?: string;
  accent?: string;
  right?: React.ReactNode;
}> = ({title, subtitle, accent = C.cyan, right}) => (
  <div
    style={{
      height: 58,
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${C.line}`,
      position: "relative",
      zIndex: 2,
    }}
  >
    <div style={{display: "flex", alignItems: "center", gap: 11}}>
      <div
        style={{
          width: 4,
          height: 19,
          borderRadius: 2,
          background: accent,
          boxShadow: `0 0 14px ${alpha(accent, 0.7)}`,
        }}
      />
      <div>
        <div
          style={{
            color: C.text,
            fontFamily: FONT,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 5,
              color: C.muted,
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.12em",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
    {right}
  </div>
);

const Header: React.FC<{frame: number}> = ({frame}) => {
  const onlinePulse = 0.65 + Math.sin(frame / 19) * 0.25;
  return (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 24,
        width: 1824,
        height: 56,
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${C.line}`,
        zIndex: 10,
      }}
    >
      <div style={{display: "flex", alignItems: "center", width: 435}}>
        <div
          style={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${alpha(C.cyan, 0.36)}`,
            background: alpha(C.cyan, 0.05),
            boxShadow: `0 0 24px ${alpha(C.cyan, 0.12)}`,
          }}
        >
          <ShieldIcon size={29} />
        </div>
        <div style={{marginLeft: 14}}>
          <div
            style={{
              color: C.text,
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 750,
              letterSpacing: "0.11em",
              lineHeight: 1,
            }}
          >
            RESPONSIBLE AI
          </div>
          <div
            style={{
              color: C.cyan,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.20em",
              marginTop: 6,
            }}
          >
            HUMAN APPROVAL CENTER
          </div>
        </div>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 10}}>
        {["OVERVIEW", "AI DECISIONS", "HUMAN REVIEW", "AUDIT TRAIL"].map(
          (item, index) => (
            <div
              key={item}
              style={{
                height: 34,
                padding: "0 18px",
                display: "grid",
                placeItems: "center",
                color: index === 0 ? C.text : C.muted,
                background: index === 0 ? alpha(C.cyan, 0.08) : "transparent",
                border:
                  index === 0
                    ? `1px solid ${alpha(C.cyan, 0.22)}`
                    : "1px solid transparent",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.10em",
              }}
            >
              {item}
            </div>
          ),
        )}
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 11,
          color: C.green,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.13em",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.green,
            boxShadow: `0 0 ${9 + onlinePulse * 8}px ${alpha(C.green, onlinePulse)}`,
          }}
        />
        OVERSIGHT ONLINE
      </div>
    </div>
  );
};

const pipelineCases = [
  {
    id: "AP-2042",
    title: "Loan Application",
    detail: "Impact: High",
    risk: "HUMAN REVIEW",
    human: true,
    resolve: 760,
  },
  {
    id: "CL-8107",
    title: "Insurance Claim",
    detail: "Impact: Medium",
    risk: "APPROVED",
    human: false,
    resolve: 690,
  },
  {
    id: "TX-4931",
    title: "Wire Transfer",
    detail: "Impact: Critical",
    risk: "HUMAN REVIEW",
    human: true,
    resolve: 875,
  },
  {
    id: "CV-1180",
    title: "Candidate Screen",
    detail: "Impact: High",
    risk: "ADJUSTED",
    human: true,
    resolve: 950,
  },
  {
    id: "RX-6029",
    title: "Clinical Triage",
    detail: "Impact: Critical",
    risk: "APPROVED",
    human: true,
    resolve: 1010,
  },
];

const pipelineSteps = ["INPUT", "ANALYZE", "RISK", "POLICY", "DECISION"];

const PipelinePanel: React.FC<{frame: number}> = ({frame}) => (
  <Panel frame={frame} style={{width: 820, height: 646}}>
    <PanelTitle
      title="AI DECISION PIPELINE"
      subtitle="POLICY-GATED • TRACEABLE • EXPLAINABLE"
      right={<StatusPill color={C.cyan}>LIVE</StatusPill>}
    />
    <div
      style={{
        height: 41,
        padding: "0 18px",
        display: "grid",
        alignItems: "center",
        gridTemplateColumns: "238px 1fr",
        color: C.muted,
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: "0.12em",
        borderBottom: `1px solid ${alpha(C.cyan, 0.10)}`,
      }}
    >
      <div>CASE / BUSINESS IMPACT</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          textAlign: "center",
        }}
      >
        {pipelineSteps.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
    </div>
    <div style={{padding: "6px 16px 0"}}>
      {pipelineCases.map((item, rowIndex) => {
        const start = 220 + rowIndex * 72;
        const end = 640 + rowIndex * 58;
        const rowProgress = progress(frame, start, end);
        const resolved = progress(frame, item.resolve, item.resolve + 48);
        const rowAppear = progress(frame, 225 + rowIndex * 42, 300 + rowIndex * 42);
        const finalColor = item.risk === "ADJUSTED" ? C.amber : C.green;
        return (
          <div
            key={item.id}
            style={{
              height: 92,
              marginTop: 6,
              padding: "0 12px 0 14px",
              display: "grid",
              gridTemplateColumns: "224px 1fr",
              alignItems: "center",
              background:
                rowIndex % 2 === 0
                  ? "rgba(24,57,68,.16)"
                  : "rgba(3,11,17,.18)",
              border: `1px solid ${alpha(C.cyan, 0.07)}`,
              opacity: rowAppear,
              transform: `translateX(${(1 - rowAppear) * -18}px)`,
              position: "relative",
            }}
          >
            <div>
              <div style={{display: "flex", alignItems: "center", gap: 10}}>
                <span
                  style={{
                    color: C.cyan,
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.07em",
                  }}
                >
                  {item.id}
                </span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: item.human ? C.amber : C.green,
                    boxShadow: `0 0 12px ${alpha(
                      item.human ? C.amber : C.green,
                      0.55,
                    )}`,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 7,
                  color: C.text,
                  fontFamily: FONT,
                  fontWeight: 650,
                  fontSize: 18,
                  letterSpacing: "0.035em",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 5,
                  color: C.muted,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.08em",
                }}
              >
                {item.detail}
              </div>
            </div>
            <div style={{height: 54, position: "relative"}}>
              <div
                style={{
                  position: "absolute",
                  left: "9%",
                  right: "9%",
                  top: 18,
                  height: 2,
                  background: alpha(C.cyan, 0.16),
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "9%",
                  top: 18,
                  width: `${rowProgress * 82}%`,
                  height: 2,
                  background:
                    item.human && resolved < 0.5
                      ? `linear-gradient(90deg, ${C.cyan}, ${C.amber})`
                      : `linear-gradient(90deg, ${C.cyan}, ${C.green})`,
                  boxShadow: `0 0 9px ${alpha(C.cyan, 0.28)}`,
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  position: "relative",
                }}
              >
                {pipelineSteps.map((step, stepIndex) => {
                  const nodeAmount = clamp01(rowProgress * 5 - stepIndex);
                  const isLast = stepIndex === pipelineSteps.length - 1;
                  const nodeColor =
                    isLast && item.human && resolved < 0.5
                      ? C.amber
                      : isLast && resolved > 0.5
                        ? finalColor
                        : C.cyan;
                  const active =
                    nodeAmount > 0.05 &&
                    nodeAmount < 0.98 &&
                    rowProgress < 0.99;
                  return (
                    <div
                      key={step}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          border: `1px solid ${alpha(nodeColor, 0.8)}`,
                          background:
                            nodeAmount > 0.08
                              ? alpha(nodeColor, 0.18 + nodeAmount * 0.18)
                              : C.bg,
                          boxShadow:
                            active || nodeAmount > 0.98
                              ? `0 0 ${active ? 17 : 10}px ${alpha(
                                  nodeColor,
                                  active ? 0.55 : 0.27,
                                )}`
                              : "none",
                        }}
                      >
                        {nodeAmount > 0.95 ? (
                          <CheckIcon size={13} color={nodeColor} />
                        ) : (
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: nodeColor,
                              opacity: nodeAmount,
                            }}
                          />
                        )}
                      </div>
                      {isLast && rowProgress > 0.82 ? (
                        <div
                          style={{
                            marginTop: 7,
                            color:
                              resolved > 0.5
                                ? finalColor
                                : item.human
                                  ? C.amber
                                  : C.green,
                            fontFamily: MONO,
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {resolved > 0.5
                            ? item.risk
                            : item.human
                              ? "REVIEW"
                              : "AUTO"}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 13,
        height: 28,
        display: "flex",
        alignItems: "center",
        gap: 22,
        color: C.muted,
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: "0.09em",
      }}
    >
      <span>
        <b style={{color: C.cyan}}>05</b> ACTIVE CASES
      </span>
      <span>
        <b style={{color: C.amber}}>04</b> HUMAN CHECKS
      </span>
      <span>
        <b style={{color: C.green}}>100%</b> AUDIT LOGGED
      </span>
    </div>
  </Panel>
);

const handoffCards = [
  {
    id: "AP-2042",
    reason: "FAIRNESS CHECK",
    detail: "High-impact credit decision",
    start: 390,
    resolve: 760,
    result: "APPROVED",
  },
  {
    id: "TX-4931",
    reason: "POLICY EXCEPTION",
    detail: "Unusual transfer pattern",
    start: 520,
    resolve: 875,
    result: "APPROVED",
  },
  {
    id: "CV-1180",
    reason: "LOW CONFIDENCE",
    detail: "Human judgment required",
    start: 650,
    resolve: 950,
    result: "ADJUSTED",
  },
];

const HandoffBridge: React.FC<{frame: number}> = ({frame}) => {
  const activity = progress(frame, 285, 390) * (1 - progress(frame, 1030, 1110));
  const completed = progress(frame, 930, 1015);
  const heroIn = progress(frame, 330, 405);
  const approvedHero = progress(frame, 920, 990);
  return (
    <Panel frame={frame} delay={24} style={{width: 340, height: 646}}>
      <PanelTitle
        title="AI → HUMAN"
        subtitle="DECISION HANDOFF"
        accent={C.amber}
        right={
          <span
            style={{
              color: completed > 0.5 ? C.green : C.amber,
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.11em",
            }}
          >
            {completed > 0.5 ? "VERIFIED" : "LIVE"}
          </span>
        }
      />
      <div style={{position: "relative", height: 588}}>
        <svg
          width="340"
          height="588"
          viewBox="0 0 340 588"
          style={{position: "absolute", inset: 0}}
        >
          <path
            d="M170 94 C105 172 235 235 170 306 C108 374 231 431 170 505"
            fill="none"
            stroke={alpha(C.amber, 0.28)}
            strokeWidth="2"
            strokeDasharray="5 9"
            strokeDashoffset={-frame * 0.65}
          />
          <path
            d="M170 94 C105 172 235 235 170 306 C108 374 231 431 170 505"
            fill="none"
            stroke={alpha(C.cyan, 0.13)}
            strokeWidth="9"
            filter="blur(5px)"
          />
          {Array.from({length: 5}).map((_, index) => {
            const p = ((frame / 150 + index / 5) % 1 + 1) % 1;
            const x = 170 + Math.sin(p * Math.PI * 4) * 30;
            const y = 104 + p * 392;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={2.8 + (index % 2)}
                fill={index % 2 ? C.amber : C.cyan}
                opacity={activity * (0.38 + index * 0.1)}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 126,
            top: 18,
            width: 88,
            height: 88,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: `1px solid ${alpha(C.cyan, 0.38)}`,
            background: `radial-gradient(circle, ${alpha(C.cyan, 0.13)}, ${alpha(
              C.cyan,
              0.02,
            )} 66%, transparent 68%)`,
            boxShadow: `0 0 ${30 + Math.sin(frame / 22) * 5}px ${alpha(
              C.cyan,
              0.15,
            )}`,
          }}
        >
          <AiNodeIcon size={58} />
          <div
            style={{
              position: "absolute",
              top: 76,
              color: C.cyan,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
            }}
          >
            AI AGENT
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 112,
            width: 284,
            height: 78,
            border: `1px solid ${alpha(
              approvedHero > 0.5 ? C.green : C.amber,
              0.42,
            )}`,
            background: `linear-gradient(90deg, ${alpha(
              approvedHero > 0.5 ? C.green : C.amber,
              0.10,
            )}, rgba(3,12,17,.92))`,
            boxShadow: `0 0 24px ${alpha(
              approvedHero > 0.5 ? C.green : C.amber,
              0.08,
            )}`,
            opacity: heroIn,
            transform: `scale(${0.96 + heroIn * 0.04})`,
            zIndex: 6,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              color: C.amber,
              fontFamily: FONT,
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "0.09em",
              opacity: 1 - approvedHero,
            }}
          >
            HUMAN REVIEW
            <br />
            REQUIRED
          </div>
          <div
            style={{
              position: "absolute",
              color: C.green,
              fontFamily: FONT,
              fontSize: 19,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "0.075em",
              opacity: approvedHero,
            }}
          >
            APPROVED
            <br />
            WITH CONTROLS
          </div>
        </div>
        {handoffCards.map((card, index) => {
          const enter = progress(frame, card.start, card.start + 60);
          const resolved = progress(frame, card.resolve, card.resolve + 52);
          const cardColor = resolved > 0.5 ? C.green : C.amber;
          const xOffset = (index % 2 === 0 ? -42 : 42) * (1 - enter);
          return (
            <div
              key={card.id}
              style={{
                position: "absolute",
                left: 35,
                top: 204 + index * 86 + resolved * 5,
                width: 270,
                height: 67,
                padding: "9px 12px",
                boxSizing: "border-box",
                background: `linear-gradient(90deg, ${alpha(
                  cardColor,
                  0.12,
                )}, rgba(7,17,23,.95))`,
                border: `1px solid ${alpha(cardColor, 0.55)}`,
                boxShadow: `0 0 24px ${alpha(cardColor, 0.08)}`,
                opacity: enter,
                transform: `translateX(${xOffset}px) scale(${0.96 + enter * 0.04})`,
                zIndex: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: C.text,
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 750,
                    letterSpacing: "0.08em",
                  }}
                >
                  {card.reason}
                </span>
                <span
                  style={{
                    color: cardColor,
                    fontFamily: MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {resolved > 0.5 ? card.result : "REVIEW"}
                </span>
              </div>
              <div
                style={{
                  marginTop: 5,
                  color: C.muted,
                  fontFamily: FONT,
                  fontSize: 12,
                  letterSpacing: "0.025em",
                }}
              >
                {card.detail}
              </div>
              <div
                style={{
                  marginTop: 5,
                  height: 3,
                  background: alpha(cardColor, 0.13),
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(enter * 44, resolved * 100)}%`,
                    height: "100%",
                    background: cardColor,
                    boxShadow: `0 0 8px ${alpha(cardColor, 0.45)}`,
                  }}
                />
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 122,
            bottom: 18,
            width: 96,
            height: 96,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: `1px solid ${alpha(completed > 0.5 ? C.green : C.amber, 0.46)}`,
            background: `radial-gradient(circle, ${alpha(
              completed > 0.5 ? C.green : C.amber,
              0.14,
            )}, transparent 67%)`,
            boxShadow: `0 0 30px ${alpha(
              completed > 0.5 ? C.green : C.amber,
              0.14,
            )}`,
          }}
        >
          <HumanIcon size={47} color={completed > 0.5 ? C.green : C.amber} />
          <div
            style={{
              position: "absolute",
              bottom: -2,
              color: completed > 0.5 ? C.green : C.amber,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.11em",
              whiteSpace: "nowrap",
            }}
          >
            HUMAN REVIEWER
          </div>
        </div>
      </div>
    </Panel>
  );
};

const queueCases = [
  {
    id: "AP-2042",
    title: "Loan fairness review",
    owner: "REVIEWER A",
    start: 400,
    resolve: 760,
    result: "APPROVED",
    color: C.green,
  },
  {
    id: "TX-4931",
    title: "Transfer policy exception",
    owner: "REVIEWER B",
    start: 520,
    resolve: 875,
    result: "APPROVED",
    color: C.green,
  },
  {
    id: "CV-1180",
    title: "Candidate confidence check",
    owner: "REVIEWER C",
    start: 650,
    resolve: 950,
    result: "ADJUSTED",
    color: C.amber,
  },
  {
    id: "RX-6029",
    title: "Clinical triage validation",
    owner: "REVIEWER D",
    start: 750,
    resolve: 1010,
    result: "APPROVED",
    color: C.green,
  },
];

const ReviewerQueue: React.FC<{frame: number}> = ({frame}) => {
  const entered = queueCases.filter((item) => frame >= item.start).length;
  const resolvedCount = queueCases.filter((item) => frame >= item.resolve + 35).length;
  const pending = Math.max(0, entered - resolvedCount);
  return (
    <Panel frame={frame} delay={48} style={{width: 624, height: 646}}>
      <PanelTitle
        title="HUMAN REVIEW QUEUE"
        subtitle="HIGH-IMPACT DECISIONS ONLY"
        accent={C.amber}
        right={
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            <span
              style={{
                color: C.muted,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              {pending} PENDING
            </span>
            <StatusPill color={pending === 0 && entered > 0 ? C.green : C.amber}>
              {pending === 0 && entered > 0 ? "CLEARED" : "ACTIVE"}
            </StatusPill>
          </div>
        }
      />
      <div
        style={{
          height: 43,
          padding: "0 17px",
          display: "grid",
          gridTemplateColumns: "105px 1fr 100px 93px",
          alignItems: "center",
          borderBottom: `1px solid ${alpha(C.cyan, 0.10)}`,
          color: C.muted,
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: "0.12em",
        }}
      >
        <span>CASE ID</span>
        <span>REVIEW REASON</span>
        <span>OWNER</span>
        <span style={{textAlign: "right"}}>STATUS</span>
      </div>
      <div style={{padding: "8px 14px 0"}}>
        {queueCases.map((item, index) => {
          const enter = progress(frame, item.start, item.start + 54);
          const resolve = progress(frame, item.resolve, item.resolve + 50);
          const color = resolve > 0.5 ? item.color : C.amber;
          return (
            <div
              key={item.id}
              style={{
                height: 92,
                marginTop: 7,
                display: "grid",
                gridTemplateColumns: "102px 1fr 100px 104px",
                alignItems: "center",
                padding: "0 12px",
                boxSizing: "border-box",
                border: `1px solid ${alpha(color, 0.18 + resolve * 0.24)}`,
                background: `linear-gradient(90deg, ${alpha(
                  color,
                  0.06 + resolve * 0.05,
                )}, rgba(4,12,18,.24))`,
                opacity: enter,
                transform: `translateX(${(1 - enter) * 26}px)`,
                boxShadow:
                  resolve > 0.1 ? `inset 3px 0 0 ${alpha(color, resolve)}` : "none",
              }}
            >
              <div
                style={{
                  color: C.cyan,
                  fontFamily: MONO,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {item.id}
              </div>
              <div>
                <div
                  style={{
                    color: C.text,
                    fontFamily: FONT,
                    fontSize: 17,
                    fontWeight: 650,
                    letterSpacing: "0.025em",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    display: "flex",
                    gap: 12,
                    color: C.muted,
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                  }}
                >
                  <span>AI CONF. {91 - index * 6}%</span>
                  <span>IMPACT {index % 2 ? "HIGH" : "CRITICAL"}</span>
                </div>
              </div>
              <div
                style={{
                  color: C.muted,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.06em",
                }}
              >
                {item.owner}
              </div>
              <div style={{display: "flex", justifyContent: "flex-end"}}>
                <StatusPill color={color} compact>
                  {resolve > 0.5 ? item.result : "REVIEW"}
                </StatusPill>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          height: 82,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {[
          ["REVIEWED", `${resolvedCount}/4`, C.green],
          ["AVG. TIME", `${Math.max(0, 2.8 - resolvedCount * 0.25).toFixed(1)} min`, C.cyan],
          ["POLICY CATCHES", `${Math.min(4, entered)}`, C.amber],
          ["AUDIT COVERAGE", entered > 0 ? "100%" : "—", C.green],
        ].map(([label, value, color]) => (
          <div
            key={label}
            style={{
              padding: "13px 12px",
              border: `1px solid ${alpha(color, 0.16)}`,
              background: alpha(color, 0.035),
            }}
          >
            <div
              style={{
                color: C.muted,
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: "0.10em",
              }}
            >
              {label}
            </div>
            <div
              style={{
                marginTop: 9,
                color,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "0.04em",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

const SafeAutomationGauge: React.FC<{frame: number}> = ({frame}) => {
  const amount = linear(frame, 240, 744);
  const percent = Math.round(amount * 90);
  const circumference = Math.PI * 2 * 72;
  const dashOffset = circumference * (1 - amount * 0.9);
  return (
    <Panel
      frame={frame}
      delay={70}
      style={{position: "absolute", left: 48, top: 764, width: 398, height: 268}}
    >
      <PanelTitle
        title="SAFE AUTOMATION"
        subtitle="HUMAN OVERSIGHT ENFORCED"
        right={
          <span
            style={{
              color: C.green,
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.1em",
            }}
          >
            HEALTHY
          </span>
        }
      />
      <div style={{display: "flex", alignItems: "center", height: 208}}>
        <div style={{width: 194, height: 194, position: "relative"}}>
          <svg width="194" height="194" viewBox="0 0 194 194">
            <circle
              cx="97"
              cy="97"
              r="72"
              fill="none"
              stroke={alpha(C.cyan, 0.09)}
              strokeWidth="14"
            />
            <circle
              cx="97"
              cy="97"
              r="72"
              fill="none"
              stroke={C.cyan}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 97 97)"
              style={{filter: `drop-shadow(0 0 7px ${alpha(C.cyan, 0.55)})`}}
            />
            <circle
              cx="97"
              cy="97"
              r="51"
              fill={alpha(C.cyan, 0.025)}
              stroke={alpha(C.cyan, 0.13)}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                color: C.text,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 43,
                letterSpacing: "-0.03em",
              }}
            >
              {percent}
              <span style={{fontSize: 19, color: C.cyan}}>%</span>
            </div>
            <div
              style={{
                marginTop: 2,
                color: C.muted,
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: "0.12em",
              }}
            >
              POLICY SAFE
            </div>
          </div>
        </div>
        <div style={{flex: 1, paddingRight: 18}}>
          {([
            ["AUTO-APPROVED", Math.round(amount * 83), C.cyan],
            ["HUMAN REVIEWED", Math.round(amount * 16), C.amber],
            ["UNLOGGED", 0, C.green],
          ] as Array<[string, number, string]>).map(([label, value, color]) => (
            <div
              key={label}
              style={{
                height: 50,
                borderBottom: `1px solid ${alpha(C.cyan, 0.09)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: C.muted,
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  color,
                  fontFamily: FONT,
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {value}
                {label !== "UNLOGGED" ? "%" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

const timelineDots = Array.from({length: 34}, (_, index) => ({
  x: 25 + index * 37.2,
  y: 24 + ((Math.sin(index * 1.71) + 1) / 2) * 54 + (index % 3) * 4,
  type: index % 7 === 3 || index % 11 === 7 ? "human" : index % 5 === 1 ? "policy" : "auto",
}));

const AuditTimeline: React.FC<{frame: number}> = ({frame}) => {
  const amount = linear(frame, 220, 1030);
  const visibleCount = Math.floor(amount * timelineDots.length);
  const cursorX = 25 + amount * 1227;
  const areaPath =
    "M 25 100 " +
    timelineDots
      .map((dot, index) => `${index === 0 ? "L" : "L"} ${dot.x} ${86 - Math.sin(index * 0.61) * 11}`)
      .join(" ") +
    " L 1252 100 Z";
  const linePath =
    "M " +
    timelineDots
      .map((dot, index) => `${dot.x} ${86 - Math.sin(index * 0.61) * 11}`)
      .join(" L ");
  const completion = progress(frame, 930, 1025);
  return (
    <Panel
      frame={frame}
      delay={92}
      style={{position: "absolute", left: 466, top: 764, width: 1406, height: 268}}
    >
      <PanelTitle
        title="DECISION AUDIT TIMELINE"
        subtitle="EVERY AI ACTION • EVERY HUMAN OVERRIDE • IMMUTABLE LOG"
        right={
          <div style={{display: "flex", gap: 17, alignItems: "center"}}>
            {[
              [C.cyan, "AUTO"],
              [C.amber, "HUMAN"],
              [C.green, "VERIFIED"],
            ].map(([color, label]) => (
              <span
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: C.muted,
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                }}
              >
                <i
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 8px ${alpha(color, 0.4)}`,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        }
      />
      <div style={{padding: "6px 22px 0", position: "relative"}}>
        <svg width="100%" height="116" viewBox="0 0 1280 116" preserveAspectRatio="none">
          <defs>
            <linearGradient id="auditArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.cyan} stopOpacity="0.18" />
              <stop offset="1" stopColor={C.cyan} stopOpacity="0.01" />
            </linearGradient>
            <clipPath id="auditClip">
              <rect x="0" y="0" width={1280 * amount} height="116" />
            </clipPath>
          </defs>
          {[26, 52, 78, 104].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="1280"
              y2={y}
              stroke={alpha(C.cyan, 0.08)}
              strokeWidth="1"
            />
          ))}
          <g clipPath="url(#auditClip)">
            <path d={areaPath} fill="url(#auditArea)" />
            <path
              d={linePath}
              fill="none"
              stroke={C.cyan}
              strokeWidth="2"
              opacity="0.75"
            />
          </g>
          {timelineDots.map((dot, index) => {
            const visible = index < visibleCount;
            const color =
              dot.type === "human"
                ? C.amber
                : dot.type === "policy"
                  ? C.green
                  : C.cyan;
            return (
              <g key={index} opacity={visible ? 1 : 0}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.type === "human" ? 4 : 3}
                  fill={color}
                  opacity={0.92}
                />
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.type === "human" ? 9 : 6}
                  fill="none"
                  stroke={alpha(color, 0.18)}
                />
              </g>
            );
          })}
          <line
            x1={cursorX}
            y1="6"
            x2={cursorX}
            y2="108"
            stroke={alpha(C.text, 0.38)}
            strokeWidth="1"
          />
          <rect
            x={cursorX - 17}
            y="1"
            width="34"
            height="14"
            rx="2"
            fill={alpha(C.cyan, 0.14)}
            stroke={alpha(C.cyan, 0.30)}
          />
        </svg>
        <div
          style={{
            height: 67,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 8,
          }}
        >
          {([
            ["AI DECISIONS", Math.round(amount * 2486), C.cyan],
            ["HUMAN REVIEWS", Math.round(amount * 394), C.amber],
            ["OVERRIDES", Math.round(amount * 27), C.amber],
            ["POLICY BREACHES", "0", C.green],
            ["GOVERNANCE", completion > 0.5 ? "VERIFIED" : "MONITORING", C.green],
          ] as Array<[string, string | number, string]>).map(
            ([label, value, color]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 13px",
                border: `1px solid ${alpha(color, 0.13)}`,
                background: alpha(color, 0.025),
              }}
            >
              <span
                style={{
                  color: C.muted,
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  color,
                  fontFamily: FONT,
                  fontSize: typeof value === "number" ? 20 : 14,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {value}
              </span>
            </div>
            ),
          )}
        </div>
      </div>
    </Panel>
  );
};

const CompletionBanner: React.FC<{frame: number}> = ({frame}) => {
  const show = progress(frame, 955, 1010) * (1 - progress(frame, 1070, 1100));
  return (
    <div
      style={{
        position: "absolute",
        left: 680,
        top: 88,
        width: 560,
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        border: `1px solid ${alpha(C.green, 0.52)}`,
        background: "rgba(5,24,22,.93)",
        boxShadow: `0 0 34px ${alpha(C.green, 0.16)}`,
        color: C.green,
        fontFamily: FONT,
        fontSize: 22,
        fontWeight: 750,
        letterSpacing: "0.13em",
        whiteSpace: "nowrap",
        opacity: show,
        transform: `translateY(${(1 - show) * -14}px) scale(${0.96 + show * 0.04})`,
        zIndex: 20,
      }}
    >
      <CheckIcon size={25} color={C.green} />
      HUMAN OVERSIGHT VERIFIED
    </div>
  );
};

const Atmosphere: React.FC<{frame: number}> = ({frame}) => {
  const intro = progress(frame, 0, 110);
  const scanY = ((frame * 1.15) % 1160) - 40;
  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -100,
          opacity: intro,
          background: `
            radial-gradient(circle at 18% 45%, rgba(36,151,190,.23), transparent 38%),
            radial-gradient(circle at 81% 45%, rgba(220,139,50,.21), transparent 40%),
            radial-gradient(circle at 50% 72%, rgba(57,109,124,.09), transparent 45%),
            linear-gradient(180deg, #02070b, #041018 53%, #02070b)
          `,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.28 * intro,
          backgroundImage: `
            linear-gradient(${alpha(C.cyan, 0.05)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(C.cyan, 0.05)} 1px, transparent 1px)
          `,
          backgroundSize: "54px 54px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${alpha(
            C.cyan,
            0.22,
          )}, ${alpha(C.amber, 0.18)}, transparent)`,
          boxShadow: `0 0 22px ${alpha(C.cyan, 0.12)}`,
          opacity: 0.5 * intro,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(180deg, transparent 0, transparent 3px, rgba(0,0,0,.10) 4px)",
          opacity: 0.42,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 180px 82px rgba(0,0,0,.86)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const introOpacity = progress(frame, 18, 190);
  const introSharp = progress(frame, 65, 235);
  const outro = linear(frame, 1110, TOTAL_FRAMES - 1);
  const opacity = introOpacity * (1 - outro);
  const blur = (1 - introSharp) * 24 + outro * 13;
  const scale = 1.018 - introSharp * 0.018 + outro * 0.006;

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <Atmosphere frame={frame} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Header frame={frame} />
        <div
          style={{
            position: "absolute",
            left: 48,
            top: 98,
            width: 1824,
            height: 646,
            display: "grid",
            gridTemplateColumns: "820px 340px 624px",
            gap: 20,
          }}
        >
          <PipelinePanel frame={frame} />
          <HandoffBridge frame={frame} />
          <ReviewerQueue frame={frame} />
        </div>
        <SafeAutomationGauge frame={frame} />
        <AuditTimeline frame={frame} />
        <CompletionBanner frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 50,
          bottom: 18,
          color: C.muted,
          fontFamily: MONO,
          fontSize: 8,
          letterSpacing: "0.14em",
          opacity: opacity * 0.75,
        }}
      >
        RESPONSIBLE AI • HUMAN-IN-THE-LOOP • TRACEABLE DECISIONS
      </div>
      <div
        style={{
          position: "absolute",
          right: 50,
          bottom: 18,
          color: C.muted,
          fontFamily: MONO,
          fontSize: 8,
          letterSpacing: "0.14em",
          opacity: opacity * 0.75,
        }}
      >
        SYSTEM UTC 14:28:36 • LATENCY 24 MS • AUDIT ONLINE
      </div>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(circle at center, transparent 52%, rgba(0,0,0,${
            0.28 + outro * 0.48
          }) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundColor: `rgba(0,0,0,${outro})`,
        }}
      />
    </AbsoluteFill>
  );
};
