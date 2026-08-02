import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

const CARD = {
  left: 436,
  top: 208,
  width: 1048,
  height: 664,
  radius: 76,
};

const RAIL = {
  left: 176,
  top: 370,
  width: 702,
  height: 58,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const MicroTick: React.FC<{index: number; active: boolean}> = ({
  index,
  active,
}) => (
  <div
    style={{
      position: "relative",
      flex: 1,
      height: index % 5 === 0 ? 7 : 4,
      borderRadius: 4,
      background: active
        ? "linear-gradient(90deg, rgba(58,232,255,0.64), rgba(108,116,255,0.58))"
        : "rgba(139,177,208,0.15)",
      boxShadow: active ? "0 0 9px rgba(58,210,255,0.18)" : undefined,
    }}
  />
);

const Background: React.FC<{frame: number}> = ({frame}) => {
  // The 10-second reference completes five broad-glow cycles. The target is
  // proportionally stretched to 15 seconds, so one cycle lasts 180 frames.
  const phase = (frame / 180) * Math.PI * 2;
  const topLeftPulse = 0.5 + 0.5 * Math.sin(phase);
  const bottomRightPulse = 0.5 + 0.5 * Math.cos(phase);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 48%, #091b3d 0%, #050d25 36%, #020718 68%, #01030c 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(118deg, rgba(31,74,136,0.13) 0%, transparent 31%, transparent 68%, rgba(34,23,105,0.16) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 34,
          top: -54,
          width: 690,
          height: 520,
          borderRadius: "48%",
          transform: `scale(${0.94 + topLeftPulse * 0.08})`,
          opacity: 0.02 + topLeftPulse * 0.7,
          background:
            "radial-gradient(ellipse at 45% 45%, rgba(27,237,255,0.70) 0%, rgba(16,160,215,0.35) 18%, rgba(13,82,162,0.13) 44%, transparent 72%)",
          filter: "blur(24px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 18,
          bottom: -94,
          width: 720,
          height: 560,
          borderRadius: "48%",
          transform: `scale(${0.95 + bottomRightPulse * 0.07})`,
          opacity: 0.08 + bottomRightPulse * 0.55,
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(35,226,255,0.68) 0%, rgba(19,150,213,0.34) 20%, rgba(27,83,169,0.13) 48%, transparent 74%)",
          filter: "blur(27px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 552,
          top: 86,
          width: 820,
          height: 760,
          borderRadius: "50%",
          opacity: 0.19,
          background:
            "radial-gradient(circle, rgba(52,79,180,0.20) 0%, rgba(24,40,107,0.08) 45%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.34,
          backgroundImage:
            "linear-gradient(rgba(132,188,223,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(132,188,223,0.022) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage:
            "radial-gradient(ellipse 66% 72% at 50% 51%, #000 0%, rgba(0,0,0,0.56) 55%, transparent 94%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(174,220,255,0.018) 4px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow:
            "inset 0 0 220px rgba(0,0,0,0.72), inset 0 -130px 180px rgba(0,0,0,0.28)",
        }}
      />
    </AbsoluteFill>
  );
};

const OpticalBorder: React.FC = () => (
  <svg
    width={CARD.width}
    height={CARD.height}
    viewBox={`0 0 ${CARD.width} ${CARD.height}`}
    style={{position: "absolute", inset: 0, overflow: "visible"}}
  >
    <defs>
      <linearGradient id="outer-border" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8df4ff" stopOpacity="0.40" />
        <stop offset="0.28" stopColor="#e8fbff" stopOpacity="0.92" />
        <stop offset="0.59" stopColor="#9ab7ff" stopOpacity="0.38" />
        <stop offset="0.82" stopColor="#f5fbff" stopOpacity="0.96" />
        <stop offset="1" stopColor="#76e8ff" stopOpacity="0.48" />
      </linearGradient>
      <linearGradient id="inner-border" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#58dfff" stopOpacity="0.20" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#9e91ff" stopOpacity="0.24" />
      </linearGradient>
      <filter id="border-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>

    <rect
      x="2"
      y="2"
      width={CARD.width - 4}
      height={CARD.height - 4}
      rx={CARD.radius - 2}
      fill="none"
      stroke="url(#outer-border)"
      strokeWidth="2.3"
    />
    <rect
      x="13"
      y="13"
      width={CARD.width - 26}
      height={CARD.height - 26}
      rx={CARD.radius - 12}
      fill="none"
      stroke="url(#inner-border)"
      strokeWidth="1"
    />
    <path
      d={`M70 3 H310 M${CARD.width - 305} ${CARD.height - 3} H${CARD.width - 70}`}
      stroke="#e8fdff"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.48"
      filter="url(#border-glow)"
    />
  </svg>
);

const ProgressRail: React.FC<{progress: number; percentage: number}> = ({
  progress,
  percentage,
}) => {
  const fillWidth = RAIL.width * progress;
  const endpointOpacity = clamp01(progress * 24);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: RAIL.left,
          top: RAIL.top - 42,
          width: RAIL.width,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "rgba(199,230,246,0.58)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 3.2,
        }}
      >
        <span>SECURE DELIVERY CHANNEL</span>
        <span
          style={{
            color: "rgba(219,247,255,0.86)",
            fontSize: 18,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: 1.2,
            minWidth: 70,
            textAlign: "right",
          }}
        >
          {String(percentage).padStart(3, "0")}%
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: RAIL.left,
          top: RAIL.top,
          width: RAIL.width,
          height: RAIL.height,
          borderRadius: RAIL.height / 2,
          background:
            "linear-gradient(180deg, rgba(3,9,27,0.95) 0%, rgba(7,18,45,0.86) 100%)",
          border: "1px solid rgba(133,189,224,0.30)",
          boxShadow:
            "inset 0 2px 8px rgba(0,0,0,0.68), inset 0 -1px 0 rgba(180,220,255,0.09), 0 13px 28px rgba(0,0,0,0.24)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: fillWidth,
            overflow: "hidden",
            borderRadius: RAIL.height / 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: RAIL.width,
              height: RAIL.height,
              borderRadius: RAIL.height / 2,
              background:
                "linear-gradient(90deg, #36e8ff 0%, #27bdf5 31%, #347dff 68%, #7258ff 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(238,255,255,0.58), inset 0 -8px 18px rgba(21,32,122,0.24)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 3,
              right: 3,
              top: 4,
              height: 14,
              borderRadius: 10,
              background:
                "linear-gradient(90deg, rgba(234,255,255,0.28), rgba(234,255,255,0.08) 58%, rgba(255,255,255,0.20))",
              filter: "blur(0.5px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 156,
              height: RAIL.height,
              opacity: endpointOpacity,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(43,192,255,0.05) 24%, rgba(73,221,255,0.18) 56%, rgba(177,249,255,0.46) 82%, rgba(244,255,255,0.76) 100%)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: 0,
              top: 7,
              bottom: 7,
              width: 3,
              borderRadius: 3,
              opacity: endpointOpacity,
              background:
                "linear-gradient(180deg, transparent 0%, rgba(224,255,255,0.74) 24%, rgba(248,255,255,0.96) 50%, rgba(190,247,255,0.78) 76%, transparent 100%)",
              boxShadow:
                "-16px 0 24px rgba(86,230,255,0.34), -48px 0 42px rgba(52,142,255,0.18)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        </div>

        {Array.from({length: 22}).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: 9,
              bottom: 9,
              left: `${((index + 1) / 23) * 100}%`,
              width: 1,
              background: "rgba(222,246,255,0.08)",
              mixBlendMode: "screen",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: RAIL.left + fillWidth,
          top: RAIL.top + RAIL.height / 2,
          width: 172,
          height: 40,
          transform: "translate(-91%, -50%)",
          opacity: endpointOpacity,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(43,140,255,0.05) 24%, rgba(55,202,255,0.13) 54%, rgba(131,239,255,0.28) 78%, rgba(224,255,255,0.34) 91%, transparent 100%)",
          filter: "blur(9px)",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: RAIL.left,
          top: RAIL.top + RAIL.height + 26,
          width: RAIL.width,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {Array.from({length: 20}).map((_, index) => (
          <MicroTick
            key={index}
            index={index}
            active={(index + 1) / 20 <= progress}
          />
        ))}
      </div>
    </>
  );
};

const GlassCard: React.FC<{progress: number; percentage: number}> = ({
  progress,
  percentage,
}) => (
  <div
    style={{
      position: "absolute",
      left: CARD.left,
      top: CARD.top,
      width: CARD.width,
      height: CARD.height,
      borderRadius: CARD.radius,
      background:
        "linear-gradient(142deg, rgba(21,45,75,0.50) 0%, rgba(5,13,38,0.78) 44%, rgba(8,10,37,0.76) 71%, rgba(21,38,75,0.50) 100%)",
      boxShadow:
        "0 54px 140px rgba(0,0,0,0.46), 0 18px 42px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
      backdropFilter: "blur(24px) saturate(135%)",
      WebkitBackdropFilter: "blur(24px) saturate(135%)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: CARD.radius,
        background:
          "radial-gradient(ellipse at 15% 2%, rgba(105,234,255,0.18) 0%, transparent 35%), radial-gradient(ellipse at 92% 100%, rgba(79,96,255,0.16) 0%, transparent 38%)",
      }}
    />

    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        top: 48,
        height: 1,
        background:
          "linear-gradient(90deg, transparent, rgba(215,249,255,0.17), transparent)",
      }}
    />

    <div
      style={{
        position: "absolute",
        left: 84,
        top: 68,
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "rgba(171,211,232,0.55)",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 3.4,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#53e7ff",
          boxShadow: "0 0 13px rgba(83,231,255,0.72)",
        }}
      />
      SYSTEM INTEGRITY / LIVE
    </div>

    <div
      style={{
        position: "absolute",
        right: 84,
        top: 66,
        color: "rgba(162,193,217,0.38)",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 3,
      }}
    >
      BUILD 24.08
    </div>

    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 245,
        textAlign: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          color: "#f4fbff",
          fontSize: 64,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: -1.4,
          transform: "scale(1.056, 1.28)",
          transformOrigin: "center center",
          textShadow:
            "0 2px 0 rgba(255,255,255,0.10), 0 10px 32px rgba(26,170,255,0.10)",
        }}
      >
        SYSTEM UPDATE
      </div>
    </div>

    <ProgressRail progress={progress} percentage={percentage} />

    <div
      style={{
        position: "absolute",
        left: RAIL.left,
        right: RAIL.left,
        bottom: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "rgba(137,180,207,0.40)",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2.7,
      }}
    >
      <span>PACKET SIGNATURE VALID</span>
      <span>END-TO-END ENCRYPTED</span>
    </div>

    <OpticalBorder />

    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: CARD.radius,
        opacity: 0.23,
        pointerEvents: "none",
        backgroundImage:
          "repeating-linear-gradient(112deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 10px)",
        maskImage:
          "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.12) 64%, transparent)",
      }}
    />
  </div>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const lastFrame = Math.max(1, durationInFrames - 1);
  const progress = clamp01(
    interpolate(frame, [0, lastFrame], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const percentage = Math.floor(progress * 100);

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: "#01030c",
        overflow: "hidden",
      }}
    >
      <Background frame={frame} />

      <div
        style={{
          position: "absolute",
          left: CARD.left - 96,
          top: CARD.top - 80,
          width: CARD.width + 192,
          height: CARD.height + 160,
          borderRadius: CARD.radius + 92,
          background:
            "radial-gradient(ellipse at center, rgba(59,134,218,0.12) 0%, rgba(20,59,133,0.05) 44%, transparent 72%)",
          filter: "blur(34px)",
        }}
      />

      <GlassCard progress={progress} percentage={percentage} />
    </AbsoluteFill>
  );
};
