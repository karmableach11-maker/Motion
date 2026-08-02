import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const COLORS = {
  ink: "#02050d",
  navy: "#071424",
  panel: "#0a1a2c",
  cyan: "#20f4ff",
  aqua: "#48ffd1",
  blue: "#5f7cff",
  violet: "#8b6cff",
  white: "#f4fbff",
  muted: "#91a8bd",
};

const PROGRESS_TRACK_WIDTH = 506;
const PROGRESS_TRACK_INSET = 1;
const PROGRESS_TRAVEL = PROGRESS_TRACK_WIDTH - PROGRESS_TRACK_INSET * 2;
const ANALYSIS_COMPLETE_FRAME = 719;
const VERIFICATION_RESPONSE_END_FRAME = 769;
const COMPLETION_SETTLE_FRAME = 791;
const SCAN_TOP_Y = 34;
const SCAN_BOTTOM_Y = 781;

const getAnalysisProgress = (frame: number) =>
  interpolate(frame, [0, ANALYSIS_COMPLETE_FRAME], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const getAnalysisPercent = (progress: number) =>
  progress >= 1 ? 100 : Math.floor(progress * 100);

const fract = (value: number) => value - Math.floor(value);
const seeded = (seed: number) =>
  fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);

const TechnicalBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const ambientPulse = 0.78 + Math.sin((frame / 240) * Math.PI * 2) * 0.05;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 75% 43%, rgba(11,93,126,0.20), transparent 31%), radial-gradient(circle at 14% 72%, rgba(69,55,160,0.12), transparent 34%), linear-gradient(118deg, #02050d 0%, #06101d 46%, #071827 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.19,
          backgroundImage:
            "linear-gradient(rgba(69,169,204,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(69,169,204,0.09) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage:
            "radial-gradient(circle at 62% 50%, black 0%, rgba(0,0,0,0.65) 44%, transparent 83%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 902,
          top: -110,
          width: 2,
          height: 1300,
          opacity: 0.24,
          transform: "rotate(18deg)",
          background:
            "linear-gradient(180deg, transparent, rgba(32,244,255,0.5), transparent)",
          boxShadow: "0 0 34px rgba(32,244,255,0.22)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 1030,
          top: 110,
          width: 840,
          height: 840,
          borderRadius: "50%",
          opacity: ambientPulse,
          border: "1px solid rgba(44,226,255,0.045)",
          boxShadow:
            "0 0 160px rgba(33,182,230,0.055), inset 0 0 120px rgba(29,169,218,0.025)",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.12), transparent 18%, transparent 82%, rgba(0,0,0,0.26)), linear-gradient(180deg, rgba(0,0,0,0.10), transparent 18%, transparent 78%, rgba(0,0,0,0.24))",
        }}
      />
    </AbsoluteFill>
  );
};

const DataParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const particles = React.useMemo(
    () =>
      Array.from({length: 50}, (_, index) => {
        const depth = seeded(index * 17.17 + 3.1);
        return {
          x: seeded(index * 31.91 + 8.7) * (CANVAS_W + 120) - 60,
          y: seeded(index * 49.33 + 2.4) * CANVAS_H,
          radius: 1.46 + Math.pow(seeded(index * 61.71 + 9.3), 2.6) * 5.96,
          speed: 11.9 + depth * 9.75,
          drift: (seeded(index * 71.19 + 1.8) - 0.5) * 7,
          opacity: 0.65 + seeded(index * 83.77 + 5.5) * 0.35,
          phase: seeded(index * 97.13 + 4.4) * Math.PI * 2,
          tone: seeded(index * 107.3 + 2.1),
        };
      }),
    [],
  );

  return (
    <svg
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      style={{position: "absolute", inset: 0}}
    >
      <defs>
        <filter id="particle-soft-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {particles.map((particle, index) => {
        const travel = (frame / fps) * particle.speed;
        const x = ((particle.x + travel + 60) % (CANVAS_W + 120)) - 60;
        const y =
          particle.y +
          Math.sin(frame * 0.012 + particle.phase) * particle.drift;
        const flicker =
          0.84 + 0.16 * Math.sin(frame * 0.18 + particle.phase * 1.7);
        const color =
          particle.tone < 0.54
            ? COLORS.cyan
            : particle.tone < 0.79
              ? COLORS.blue
              : COLORS.aqua;

        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={particle.radius}
            fill={color}
            opacity={particle.opacity * flicker}
            filter={particle.radius > 2.15 ? "url(#particle-soft-glow)" : undefined}
          />
        );
      })}
    </svg>
  );
};

const MiniTelemetry: React.FC<{frame: number}> = ({frame}) => {
  const values = [72, 42, 58, 86, 66, 92, 53, 78, 61, 88];
  return (
    <div
      style={{
        position: "absolute",
        left: 104,
        bottom: 76,
        display: "flex",
        alignItems: "flex-end",
        gap: 7,
        height: 34,
        opacity: 0.45,
      }}
    >
      {values.map((value, index) => {
        const active = (Math.floor(frame / 24) + index) % 5 === 0;
        return (
          <div
            key={index}
            style={{
              width: 3,
              height: `${value * 0.32}px`,
              borderRadius: 3,
              background: active ? COLORS.cyan : "rgba(94,139,174,0.4)",
              boxShadow: active ? "0 0 10px rgba(32,244,255,0.8)" : "none",
            }}
          />
        );
      })}
      <div
        style={{
          marginLeft: 10,
          marginBottom: 1,
          color: "rgba(155,188,211,0.56)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.17em",
        }}
      >
        SIGNAL STABLE
      </div>
    </div>
  );
};

const ProgressSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = getAnalysisProgress(frame);
  const percent = getAnalysisPercent(progress);
  const endpointX = PROGRESS_TRACK_INSET + progress * PROGRESS_TRAVEL;
  const isComplete = frame >= ANALYSIS_COMPLETE_FRAME;
  const successMix = interpolate(
    frame,
    [ANALYSIS_COMPLETE_FRAME, VERIFICATION_RESPONSE_END_FRAME],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const percentScale = interpolate(
    frame,
    [ANALYSIS_COMPLETE_FRAME, ANALYSIS_COMPLETE_FRAME + 12, ANALYSIS_COMPLETE_FRAME + 31],
    [1, 1.16, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const completionSheenX = interpolate(
    frame,
    [ANALYSIS_COMPLETE_FRAME + 3, VERIFICATION_RESPONSE_END_FRAME + 4],
    [-84, PROGRESS_TRAVEL + 84],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 472,
        width: 506,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            color: "#c8d9e7",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.18em",
          }}
        >
          <span
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: isComplete ? 18 : 8,
              height: isComplete ? 18 : 8,
              borderRadius: "50%",
              color: COLORS.ink,
              fontSize: 12,
              lineHeight: 1,
              background: isComplete ? COLORS.aqua : COLORS.cyan,
              boxShadow: `0 0 ${isComplete ? 25 : 18}px ${isComplete ? COLORS.aqua : COLORS.cyan}`,
            }}
          >
            {isComplete ? "✓" : null}
          </span>
          {isComplete ? "ANALYSIS COMPLETE" : "DOCUMENT ANALYSIS"}
        </div>

        <div
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 24,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.03em",
            minWidth: 76,
            textAlign: "right",
            color: isComplete ? COLORS.aqua : COLORS.white,
            transform: `scale(${percentScale})`,
            transformOrigin: "right center",
            textShadow: isComplete
              ? "0 0 24px rgba(72,255,209,0.72)"
              : "0 0 18px rgba(32,244,255,0.35)",
          }}
        >
          {percent}%
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: PROGRESS_TRACK_WIDTH,
          height: 12,
          borderRadius: 999,
          overflow: "visible",
          boxSizing: "border-box",
          background: "rgba(111,148,180,0.13)",
          border: "1px solid rgba(134,183,215,0.14)",
          boxShadow: "inset 0 1px 7px rgba(0,0,0,0.65)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: PROGRESS_TRACK_INSET,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: progress * PROGRESS_TRAVEL,
              height: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #20f4ff 0%, #4fc7ff 48%, #7e78ff 100%)",
              boxShadow:
                "0 0 10px rgba(32,244,255,0.8), 0 0 28px rgba(79,139,255,0.52)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: successMix,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(32,244,255,0.92), rgba(72,255,209,0.98))",
              boxShadow: "0 0 24px rgba(72,255,209,0.55)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: completionSheenX,
              top: -8,
              width: 74,
              height: 26,
              opacity: isComplete && frame <= VERIFICATION_RESPONSE_END_FRAME + 4 ? 0.82 : 0,
              transform: "skewX(-22deg)",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.92), transparent)",
              filter: "blur(2px)",
              mixBlendMode: "screen",
            }}
          />
        </div>
        {progress > 0.01 ? (
          <div
            style={{
              position: "absolute",
              left: endpointX,
              top: "50%",
              width: 10,
              height: 20,
              borderRadius: 999,
              transform: "translate(-50%, -50%)",
              background: isComplete ? "#eafff8" : "#eaffff",
              boxShadow: isComplete
                ? "0 0 10px rgba(255,255,255,1), 0 0 30px rgba(72,255,209,1)"
                : "0 0 8px rgba(255,255,255,0.92), 0 0 24px rgba(32,244,255,0.95)",
            }}
          />
        ) : null}
        {isComplete
          ? [0, 12].map((delay) => {
              const ringPhase = interpolate(
                frame,
                [ANALYSIS_COMPLETE_FRAME + delay, ANALYSIS_COMPLETE_FRAME + delay + 42],
                [0, 1],
                {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
              );
              const ringOpacity = interpolate(
                ringPhase,
                [0, 0.12, 1],
                [0, 0.82, 0],
                {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
              );
              return (
                <div
                  key={delay}
                  style={{
                    position: "absolute",
                    left: endpointX,
                    top: "50%",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "2px solid rgba(72,255,209,0.95)",
                    opacity: ringOpacity,
                    transform: `translate(-50%, -50%) scale(${0.45 + ringPhase * 3.1})`,
                    boxShadow: "0 0 16px rgba(72,255,209,0.55)",
                  }}
                />
              );
            })
          : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          marginTop: 13,
          color: "rgba(124,157,183,0.52)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        {["0", "25", "50", "75", "100"].map((tick, index) => (
          <span
            key={tick}
            style={{textAlign: index === 0 ? "left" : index === 4 ? "right" : "center"}}
          >
            {tick}
          </span>
        ))}
      </div>
    </div>
  );
};

const InformationColumn: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 104,
        top: 192,
        width: 560,
        height: 523,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          color: COLORS.cyan,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: "0.24em",
        }}
      >
        <span
          style={{
            width: 30,
            height: 1,
            background: COLORS.cyan,
            boxShadow: "0 0 11px rgba(32,244,255,0.8)",
          }}
        />
        NEURAL OCR / LIVE
      </div>

      <div
        style={{
          position: "relative",
          color: COLORS.white,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 86,
          lineHeight: 0.91,
          fontWeight: 800,
          letterSpacing: "-0.055em",
          textShadow: "0 12px 46px rgba(0,0,0,0.5)",
        }}
      >
        Document
        <br />
        Intelligence<span style={{color: COLORS.cyan}}>.</span>
      </div>

      <div
        style={{
          marginTop: 30,
          width: 485,
          color: COLORS.muted,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 21,
          fontWeight: 500,
          lineHeight: 1.52,
          letterSpacing: "0.025em",
        }}
      >
        Neural vision maps structure, entities, and context in real time—turning
        complex files into secure, actionable data.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 26,
        }}
      >
        {["OCR", "ENTITY MAP", "SECURE"].map((label, index) => (
          <div
            key={label}
            style={{
              borderRadius: 999,
              padding: "8px 13px",
              border: `1px solid ${index === 0 ? "rgba(32,244,255,0.34)" : "rgba(120,158,188,0.18)"}`,
              background:
                index === 0 ? "rgba(32,244,255,0.075)" : "rgba(50,83,109,0.08)",
              color: index === 0 ? COLORS.cyan : "#8299ad",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <ProgressSystem />
      <MiniTelemetry frame={frame} />
    </div>
  );
};

const CornerBracket: React.FC<{
  x: number;
  y: number;
  rotate: number;
}> = ({x, y, rotate}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 28,
      height: 28,
      borderLeft: `3px solid ${COLORS.cyan}`,
      borderTop: `3px solid ${COLORS.cyan}`,
      borderRadius: "5px 0 0 0",
      transform: `rotate(${rotate}deg)`,
      filter: "drop-shadow(0 0 8px rgba(32,244,255,0.65))",
      opacity: 0.88,
    }}
  />
);

const DocumentGlyph: React.FC = () => (
  <svg width="72" height="86" viewBox="0 0 72 86" fill="none">
    <path
      d="M14 5h29l15 15v57c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V9c0-2.2 1.8-4 4-4Z"
      fill="rgba(32,244,255,0.07)"
      stroke="#20f4ff"
      strokeWidth="2.2"
    />
    <path d="M43 5v16h15" stroke="#20f4ff" strokeWidth="2.2" />
    <path d="M20 37h28M20 48h28M20 59h20" stroke="#8aa9be" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="67" r="9" fill="#071827" stroke="#48ffd1" strokeWidth="2" />
    <path d="m46.5 67 2.3 2.4 4.7-5" stroke="#48ffd1" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DocumentCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cycleFrames = fps * 4;
  const phase = (frame % cycleFrames) / (cycleFrames - 1);
  const regularScanY = interpolate(
    phase,
    [0, 1],
    [SCAN_TOP_Y, SCAN_BOTTOM_Y],
  );
  const scanY =
    frame < ANALYSIS_COMPLETE_FRAME
      ? regularScanY
      : SCAN_BOTTOM_Y;
  const regularBeamOpacity = interpolate(
    phase,
    [0, 0.018, 1],
    [0.42, 1, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const beamOpacity =
    frame < ANALYSIS_COMPLETE_FRAME
      ? regularBeamOpacity
      : interpolate(
          frame,
          [
            ANALYSIS_COMPLETE_FRAME,
            ANALYSIS_COMPLETE_FRAME + 10,
            VERIFICATION_RESPONSE_END_FRAME,
            COMPLETION_SETTLE_FRAME,
          ],
          [1, 1, 0.72, 0.42],
          {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
        );
  const pulse = 0.68 + 0.32 * Math.sin((frame / 120) * Math.PI * 2);
  const verificationMix = interpolate(
    frame,
    [ANALYSIS_COMPLETE_FRAME, VERIFICATION_RESPONSE_END_FRAME],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const verificationFlash = interpolate(
    frame,
    [
      ANALYSIS_COMPLETE_FRAME,
      ANALYSIS_COMPLETE_FRAME + 10,
      VERIFICATION_RESPONSE_END_FRAME,
      COMPLETION_SETTLE_FRAME,
    ],
    [0, 1, 0.38, 0.16],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const isVerified = frame >= VERIFICATION_RESPONSE_END_FRAME;

  const textLines = [492, 448, 528, 414, 476, 340];

  return (
    <div
      style={{
        position: "absolute",
        left: 1164,
        top: 132,
        width: 645,
        height: 816,
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(145deg, rgba(21,52,73,0.47) 0%, rgba(6,17,31,0.74) 52%, rgba(7,18,32,0.9) 100%)",
        border: "1px solid rgba(94,219,244,0.24)",
        boxShadow:
          "0 42px 90px rgba(0,0,0,0.44), 0 0 80px rgba(26,188,226,0.08), inset 0 1px 0 rgba(207,249,255,0.09)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 27,
          border: "1px solid rgba(104,149,174,0.09)",
          background:
            "linear-gradient(105deg, rgba(255,255,255,0.025), transparent 32%, rgba(32,244,255,0.018) 70%, transparent)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.13,
          backgroundImage:
            "linear-gradient(rgba(77,164,193,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(77,164,193,0.08) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "linear-gradient(180deg, black, transparent 80%)",
        }}
      />

      <CornerBracket x={18} y={18} rotate={0} />
      <CornerBracket x={599} y={18} rotate={90} />
      <CornerBracket x={599} y={770} rotate={180} />
      <CornerBracket x={18} y={770} rotate={270} />

      <div
        style={{
          position: "absolute",
          left: 37,
          top: 37,
          right: 37,
          height: 142,
          borderRadius: 18,
          border: "1px solid rgba(86,216,240,0.29)",
          background:
            "linear-gradient(135deg, rgba(22,63,82,0.40), rgba(9,23,38,0.22))",
          boxShadow: "inset 0 0 32px rgba(32,244,255,0.035)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 27,
        }}
      >
        <div
          style={{
            width: 94,
            height: 104,
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(32,244,255,0.045)",
            border: "1px solid rgba(32,244,255,0.33)",
            boxShadow: "0 0 30px rgba(32,244,255,0.06)",
          }}
        >
          <DocumentGlyph />
        </div>

        <div style={{flex: 1}}>
          <div
            style={{
              color: "#dcebf5",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: "0.12em",
              marginBottom: 15,
            }}
          >
            DOCUMENT_0472.PDF
          </div>
          <div style={{display: "flex", gap: 9}}>
            {["12 PAGES", "ENCRYPTED", isVerified ? "VERIFIED" : "OCR READY"].map((label, index) => (
              <div
                key={label}
                style={{
                  borderRadius: 999,
                  padding: "7px 11px",
                  background: index === 2 ? "rgba(72,255,209,0.075)" : "rgba(101,132,157,0.08)",
                  border: `1px solid ${index === 2 ? "rgba(72,255,209,0.29)" : "rgba(121,159,184,0.15)"}`,
                  color: index === 2 ? COLORS.aqua : "#7f9bb0",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: "0.13em",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: COLORS.aqua,
            opacity: 0.7 + pulse * 0.3,
            boxShadow: "0 0 18px rgba(72,255,209,0.9)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 37,
          top: 202,
          right: 37,
          height: 286,
          borderRadius: 18,
          border: "1px solid rgba(77,185,214,0.23)",
          background:
            "linear-gradient(180deg, rgba(17,42,59,0.31), rgba(7,17,29,0.20))",
          padding: "30px 30px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            marginBottom: 25,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.cyan,
              boxShadow: "0 0 13px rgba(32,244,255,0.75)",
            }}
          />
          <div
            style={{
              color: "#7ddce8",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            SEMANTIC CONTENT MAP
          </div>
          <div
            style={{
              marginLeft: "auto",
              color: "#708b9e",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            {isVerified ? "VERIFIED" : "LIVE"}
          </div>
        </div>

        {textLines.map((width, index) => (
          <div
            key={index}
            style={{
              height: index === 0 ? 12 : 10,
              width,
              marginBottom: 17,
              borderRadius: 999,
              background:
                index === 0
                  ? "linear-gradient(90deg, rgba(126,164,188,0.36), rgba(83,117,140,0.12))"
                  : "linear-gradient(90deg, rgba(111,147,171,0.25), rgba(82,112,134,0.08))",
              boxShadow: index === 0 ? "0 0 14px rgba(118,180,208,0.04)" : "none",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            right: 25,
            bottom: 22,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: COLORS.blue,
            boxShadow: "0 0 16px rgba(95,124,255,0.85)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 37,
          right: 37,
          top: 518,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 13,
        }}
      >
        {[
          ["STRUCTURE", "VALID"],
          ["ENTITIES", "MAPPED"],
          ["RISK", "LOW"],
        ].map(([label, value], index) => (
          (() => {
            const statusPulse = interpolate(
              frame,
              [
                ANALYSIS_COMPLETE_FRAME + 10 + index * 7,
                ANALYSIS_COMPLETE_FRAME + 22 + index * 7,
                ANALYSIS_COMPLETE_FRAME + 38 + index * 7,
              ],
              [0, 1, 0],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
            );
            return (
              <div
                key={label}
                style={{
              height: 78,
              borderRadius: 14,
              border: `1px solid rgba(72,255,209,${0.14 + statusPulse * 0.44})`,
              background: `rgba(19,${44 + statusPulse * 24},${61 + statusPulse * 24},${0.17 + statusPulse * 0.12})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 17,
              boxShadow: `0 0 ${22 * statusPulse}px rgba(72,255,209,${0.34 * statusPulse})`,
                }}
              >
            <div
              style={{
                color: "#668094",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.14em",
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            <div
              style={{
                color: isVerified || index === 2 ? COLORS.aqua : "#b9d1df",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.10em",
              }}
            >
              {value}{isVerified ? "  ✓" : ""}
            </div>
              </div>
            );
          })()
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 37,
          right: 37,
          bottom: 52,
          height: 108,
          borderRadius: 18,
          border: "1px solid rgba(76,128,154,0.12)",
          background:
            "linear-gradient(90deg, rgba(13,34,48,0.17), rgba(21,55,72,0.10))",
          display: "flex",
          alignItems: "center",
          padding: "0 23px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 49,
            height: 49,
            borderRadius: "50%",
            border: "1px solid rgba(32,244,255,0.28)",
            display: "grid",
            placeItems: "center",
            color: COLORS.cyan,
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "inset 0 0 20px rgba(32,244,255,0.035)",
          }}
        >
          AI
        </div>
        <div style={{marginLeft: 18}}>
          <div
            style={{
              color: "#9fb8ca",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              marginBottom: 8,
            }}
          >
            CONTEXT ENGINE
          </div>
          <div
            style={{
              color: "#607d91",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            12 SIGNALS · 4 RELATIONS · {isVerified ? "VERIFIED" : "VALIDATING"}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            width: interpolate(
              frame,
              [ANALYSIS_COMPLETE_FRAME, VERIFICATION_RESPONSE_END_FRAME],
              [84, 120],
              {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
            ),
            height: 3,
            borderRadius: 99,
            background:
              "linear-gradient(90deg, rgba(32,244,255,0.15), rgba(72,255,209,0.85))",
            boxShadow: "0 0 14px rgba(72,255,209,0.32)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY - 56,
          height: 116,
          opacity: beamOpacity,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(32,244,255,0.015) 22%, rgba(32,244,255,0.12) 48%, rgba(32,244,255,0.025) 62%, transparent 100%)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 27,
          pointerEvents: "none",
          opacity: verificationFlash,
          border: "1px solid rgba(72,255,209,0.82)",
          boxShadow:
            "inset 0 0 42px rgba(72,255,209,0.10), 0 0 36px rgba(72,255,209,0.26)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: verificationMix * 0.12,
          background:
            "radial-gradient(circle at 50% 58%, rgba(72,255,209,0.36), transparent 58%)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY - 1,
          height: 3,
          opacity: beamOpacity,
          background:
            "linear-gradient(90deg, rgba(32,244,255,0.1), #77fbff 14%, #20f4ff 50%, #77fbff 86%, rgba(32,244,255,0.1))",
          boxShadow:
            "0 0 7px rgba(123,255,255,1), 0 0 22px rgba(32,244,255,0.9), 0 0 58px rgba(32,244,255,0.46)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 22,
          top: scanY - 5,
          width: 10,
          height: 10,
          transform: "rotate(45deg)",
          background: "#d7ffff",
          opacity: beamOpacity,
          boxShadow: "0 0 14px rgba(32,244,255,1)",
        }}
      />
    </div>
  );
};

const SideReadout: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = getAnalysisProgress(frame);
  const percent = getAnalysisPercent(progress);
  const isVerified = frame >= VERIFICATION_RESPONSE_END_FRAME;

  return (
    <div
      style={{
        position: "absolute",
        right: 54,
        top: 406,
        height: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "rgba(113,159,185,0.62)",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.16em",
      }}
    >
      <div
        style={{
          width: 1,
          height: 92,
          background: "linear-gradient(transparent, rgba(32,244,255,0.42))",
        }}
      />
      <div style={{writingMode: "vertical-rl", margin: "15px 0"}}>
        {isVerified ? "VERIFIED" : "SCAN"} / {String(percent).padStart(3, "0")}
      </div>
      <div
        style={{
          width: 1,
          flex: 1,
          background: "linear-gradient(rgba(32,244,255,0.42), transparent)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        overflow: "hidden",
      }}
    >
      <TechnicalBackdrop />
      <DataParticles />
      <InformationColumn />
      <DocumentCard />
      <SideReadout />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.42)",
        }}
      />
    </AbsoluteFill>
  );
};
