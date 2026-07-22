import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

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
      display: "flex",
      ...style,
    }}
  >
    {children}
  </div>
);

const palette = {
  canvas: "#F4F8F5",
  paper: "#FFFFFF",
  ink: "#13251C",
  muted: "#6E7C74",
  faint: "#A8B4AD",
  line: "#DCE6E0",
  green: "#12B76A",
  greenDark: "#087A49",
  greenSoft: "#DFF7EA",
  mint: "#89E4B5",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

const appear = (
  frame: number,
  fps: number,
  startSeconds: number,
  durationSeconds = 0.48,
) =>
  interpolate(
    frame,
    [startSeconds * fps, (startSeconds + durationSeconds) * fps],
    [0, 1],
    {...clamp, easing: easeOut},
  );

const miniCheckPath = "M 4.5 9.5 L 8 13 L 15.5 5.5";

const LockMark: React.FC<{size?: number; color?: string}> = ({
  size = 18,
  color = palette.greenDark,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect
      x="4"
      y="8"
      width="12"
      height="9"
      rx="3"
      stroke={color}
      strokeWidth="1.7"
    />
    <path
      d="M7 8V6.6C7 4.6 8.35 3 10 3s3 1.6 3 3.6V8"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle cx="10" cy="12.5" r="1" fill={color} />
  </svg>
);

const CornerBrackets: React.FC<{opacity: number}> = ({opacity}) => {
  const shared: React.CSSProperties = {
    position: "absolute",
    width: 78,
    height: 78,
    opacity,
    borderColor: "rgba(18, 183, 106, 0.22)",
  };

  return (
    <div style={{position: "absolute", inset: 0, display: "flex"}}>
      <div
        style={{
          ...shared,
          left: 170,
          top: 150,
          borderLeft: "1px solid",
          borderTop: "1px solid",
        }}
      />
      <div
        style={{
          ...shared,
          left: 1672,
          top: 150,
          borderRight: "1px solid",
          borderTop: "1px solid",
        }}
      />
      <div
        style={{
          ...shared,
          left: 170,
          top: 852,
          borderLeft: "1px solid",
          borderBottom: "1px solid",
        }}
      />
      <div
        style={{
          ...shared,
          left: 1672,
          top: 852,
          borderRight: "1px solid",
          borderBottom: "1px solid",
        }}
      />
    </div>
  );
};

const Background: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const build = appear(frame, fps, 0, 0.7);
  const drift = Math.sin(frame / 80) * 14;
  const glowPulse = 0.92 + Math.sin(frame / 33) * 0.04;

  const particles = [
    {x: 250, y: 300, r: 3, delay: 0},
    {x: 1660, y: 318, r: 4, delay: 16},
    {x: 205, y: 760, r: 5, delay: 34},
    {x: 1715, y: 730, r: 3, delay: 52},
    {x: 420, y: 166, r: 3, delay: 70},
    {x: 1510, y: 902, r: 4, delay: 88},
  ];

  return (
    <FullFrame
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(145deg, #F9FBF9 0%, #F2F8F4 48%, #EEF6F1 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.38 * build,
          backgroundImage:
            "radial-gradient(circle, rgba(39, 92, 65, 0.18) 1.15px, transparent 1.15px)",
          backgroundSize: "34px 34px",
          backgroundPosition: `${drift}px ${-drift * 0.45}px`,
          WebkitMaskImage:
            "radial-gradient(ellipse 58% 60% at 50% 50%, black 4%, transparent 74%)",
          maskImage:
            "radial-gradient(ellipse 58% 60% at 50% 50%, black 4%, transparent 74%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "49%",
          width: 1220,
          height: 760,
          transform: `translate(-50%, -50%) scale(${glowPulse})`,
          borderRadius: "50%",
          opacity: 0.66 * build,
          background:
            "radial-gradient(ellipse, rgba(95, 218, 153, 0.18) 0%, rgba(120, 225, 169, 0.07) 43%, rgba(244, 248, 245, 0) 73%)",
          filter: "blur(8px)",
        }}
      />

      <CornerBrackets opacity={0.85 * build} />

      {particles.map((particle, index) => {
        const float = Math.sin((frame + particle.delay) / 31) * 8;
        const particleOpacity =
          (0.22 + Math.sin((frame + particle.delay) / 27) * 0.08) * build;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: particle.x,
              top: particle.y + float,
              width: particle.r * 2,
              height: particle.r * 2,
              borderRadius: "50%",
              background: index % 2 === 0 ? palette.green : palette.mint,
              boxShadow: "0 0 16px rgba(18, 183, 106, 0.32)",
              opacity: particleOpacity,
            }}
          />
        );
      })}
    </FullFrame>
  );
};

const SuccessBadge: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const badgeSpring = spring({
    frame: Math.max(0, frame - 0.4 * fps),
    fps,
    config: {damping: 14, mass: 0.72, stiffness: 165},
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.42, 1]);
  const checkDraw = interpolate(
    frame,
    [0.68 * fps, 1.16 * fps],
    [0, 1],
    {...clamp, easing: easeOut},
  );
  const ringPhase = appear(frame, fps, 0.38, 0.72);
  const pulsePhase = interpolate(
    frame,
    [0.48 * fps, 1.38 * fps],
    [0, 1],
    clamp,
  );
  const orbitRotation = Math.min(Math.max(frame - 0.34 * fps, 0), fps * 1.1) * 3.25;

  const sparks = [
    {angle: -130, distance: 92, size: 7},
    {angle: -43, distance: 104, size: 5},
    {angle: 21, distance: 96, size: 6},
    {angle: 148, distance: 102, size: 5},
  ];

  return (
    <div
      style={{
        position: "relative",
        width: 172,
        height: 172,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${badgeScale})`,
        opacity: badgeSpring,
      }}
    >
      {[0, 1].map((ring) => {
        const local = Math.max(0, Math.min(1, pulsePhase * 1.45 - ring * 0.48));
        return (
          <div
            key={ring}
            style={{
              position: "absolute",
              width: 122,
              height: 122,
              borderRadius: "50%",
              border: `${ring === 0 ? 2 : 1}px solid rgba(18, 183, 106, ${
                ring === 0 ? 0.3 : 0.2
              })`,
              transform: `scale(${1 + local * (ring === 0 ? 0.56 : 0.88)})`,
              opacity: (1 - local) * (ring === 0 ? 0.9 : 0.6),
            }}
          />
        );
      })}

      <svg
        width="158"
        height="158"
        viewBox="0 0 158 158"
        fill="none"
        style={{position: "absolute", transform: `rotate(${orbitRotation}deg)`}}
      >
        <circle
          cx="79"
          cy="79"
          r="71"
          stroke="rgba(18, 183, 106, 0.22)"
          strokeWidth="2"
          strokeDasharray="10 15"
          strokeDashoffset={ringPhase * -14}
        />
        <circle cx="79" cy="8" r="4.5" fill={palette.green} opacity={ringPhase} />
      </svg>

      {sparks.map((spark, index) => {
        const sparkProgress = interpolate(
          frame,
          [(0.48 + index * 0.045) * fps, (0.94 + index * 0.045) * fps],
          [0, 1],
          {...clamp, easing: easeOut},
        );
        const rad = (spark.angle * Math.PI) / 180;
        const distance = spark.distance * (1 - sparkProgress * 0.33);
        return (
          <div
            key={spark.angle}
            style={{
              position: "absolute",
              left: 86 + Math.cos(rad) * distance - spark.size / 2,
              top: 86 + Math.sin(rad) * distance - spark.size / 2,
              width: spark.size,
              height: spark.size,
              borderRadius: index % 2 === 0 ? "50%" : 2,
              background: index % 2 === 0 ? palette.green : palette.mint,
              transform: `scale(${Math.sin(sparkProgress * Math.PI)}) rotate(${
                sparkProgress * 90
              }deg)`,
              opacity: Math.sin(sparkProgress * Math.PI),
            }}
          />
        );
      })}

      <svg width="122" height="122" viewBox="0 0 122 122" fill="none">
        <defs>
          <linearGradient id="badge-fill" x1="23" y1="12" x2="101" y2="112">
            <stop stopColor="#2AD17F" />
            <stop offset="0.58" stopColor={palette.green} />
            <stop offset="1" stopColor={palette.greenDark} />
          </linearGradient>
          <linearGradient id="badge-gloss" x1="36" y1="16" x2="79" y2="89">
            <stop stopColor="white" stopOpacity="0.42" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="badge-shadow" x="-40%" y="-40%" width="180%" height="190%">
            <feDropShadow dx="0" dy="13" stdDeviation="11" floodColor="#087A49" floodOpacity="0.22" />
          </filter>
        </defs>
        <circle cx="61" cy="61" r="52" fill="url(#badge-fill)" filter="url(#badge-shadow)" />
        <path
          d="M29 45C37 25 59 14 80 20C92 23 101 31 106 41C95 32 82 28 69 29C51 30 37 36 29 45Z"
          fill="url(#badge-gloss)"
        />
        <path
          d="M39 62.5L54 77L84.5 44.5"
          pathLength={1}
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - checkDraw}
        />
      </svg>
    </div>
  );
};

const VerificationRail: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const railAppear = appear(frame, fps, 1.14, 0.42);
  const fillProgress = interpolate(
    frame,
    [1.34 * fps, 2.34 * fps],
    [0, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const steps = [
    {label: "INITIATED", x: 18, delay: 1.28},
    {label: "VERIFIED", x: 280, delay: 1.72},
    {label: "RECEIVED", x: 542, delay: 2.14},
  ];

  return (
    <div
      style={{
        position: "relative",
        width: 560,
        height: 68,
        display: "flex",
        marginTop: 38,
        opacity: railAppear,
        transform: `translateY(${interpolate(railAppear, [0, 1], [12, 0])}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: 15,
          height: 3,
          display: "flex",
          borderRadius: 999,
          background: palette.line,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${fillProgress * 100}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${palette.mint}, ${palette.green})`,
            boxShadow: "0 0 13px rgba(18, 183, 106, 0.35)",
          }}
        />
      </div>

      {steps.map((step) => {
        const stepSpring = spring({
          frame: Math.max(0, frame - step.delay * fps),
          fps,
          config: {damping: 16, mass: 0.65, stiffness: 180},
        });
        return (
          <div
            key={step.label}
            style={{
              position: "absolute",
              left: step.x,
              top: 0,
              width: 112,
              transform: `translateX(-50%)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: stepSpring > 0.5 ? palette.green : palette.paper,
                border: `2px solid ${
                  stepSpring > 0.5 ? palette.green : palette.line
                }`,
                transform: `scale(${interpolate(stepSpring, [0, 1], [0.72, 1])})`,
                boxShadow:
                  stepSpring > 0.7 ? "0 5px 13px rgba(18, 183, 106, 0.18)" : "none",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d={miniCheckPath}
                  pathLength={1}
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={1}
                  strokeDashoffset={1 - stepSpring}
                />
              </svg>
            </div>
            <div
              style={{
                marginTop: 11,
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 15,
                lineHeight: 1,
                fontWeight: 750,
                letterSpacing: 1.35,
                color: stepSpring > 0.7 ? palette.ink : palette.faint,
                opacity: interpolate(stepSpring, [0, 1], [0.35, 1]),
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StatusCard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const cardSpring = spring({
    frame: Math.max(0, frame - 0.08 * fps),
    fps,
    config: {damping: 18, mass: 0.82, stiffness: 145},
  });
  const cardOpacity = appear(frame, fps, 0.05, 0.38);
  const labelIn = appear(frame, fps, 0.65, 0.35);
  const titleIn = appear(frame, fps, 0.82, 0.52);
  const copyIn = appear(frame, fps, 1.02, 0.5);
  const pillSpring = spring({
    frame: Math.max(0, frame - 2.16 * fps),
    fps,
    config: {damping: 17, mass: 0.72, stiffness: 175},
  });
  const sheen = interpolate(
    frame,
    [1.82 * fps, 2.82 * fps],
    [-28, 128],
    {...clamp, easing: Easing.inOut(Easing.quad)},
  );

  return (
    <div
      style={{
        position: "relative",
        width: 980,
        height: 650,
        borderRadius: 42,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 42,
        boxSizing: "border-box",
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.965) 58%, rgba(248,252,249,0.98) 100%)",
        border: "1px solid rgba(150, 180, 163, 0.28)",
        boxShadow:
          "0 38px 90px rgba(43, 81, 59, 0.12), 0 10px 30px rgba(55, 92, 70, 0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
        opacity: cardOpacity,
        transform: `translateY(${interpolate(cardSpring, [0, 1], [54, 0])}px) scale(${interpolate(
          cardSpring,
          [0, 1],
          [0.94, 1],
        )})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 6,
          background: `linear-gradient(90deg, transparent 8%, ${palette.mint} 34%, ${palette.green} 50%, ${palette.mint} 66%, transparent 92%)`,
          opacity: 0.74,
          transform: `scaleX(${interpolate(cardSpring, [0, 1], [0, 1])})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(108deg, transparent ${sheen - 18}%, rgba(255,255,255,0.78) ${sheen}%, transparent ${sheen + 18}%)`,
          opacity: 0.6,
        }}
      />

      <div
        style={{
          height: 30,
          padding: "0 15px",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: palette.greenDark,
          background: palette.greenSoft,
          border: "1px solid rgba(18, 183, 106, 0.14)",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 1.6,
          opacity: labelIn,
          transform: `translateY(${interpolate(labelIn, [0, 1], [8, 0])}px)`,
        }}
      >
        <LockMark size={15} />
        SECURE TRANSFER
      </div>

      <div style={{height: 11}} />
      <SuccessBadge frame={frame} fps={fps} />

      <div
        style={{
          overflow: "hidden",
          display: "flex",
          marginTop: 4,
          padding: "0 22px 4px",
        }}
      >
        <div
          style={{
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: 64,
            lineHeight: 1.06,
            fontWeight: 780,
            letterSpacing: -2.25,
            color: palette.ink,
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [42, 0])}px)`,
          }}
        >
          Payment received
        </div>
      </div>

      <div
        style={{
          marginTop: 13,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 24,
          lineHeight: 1.3,
          fontWeight: 450,
          letterSpacing: -0.2,
          color: palette.muted,
          opacity: copyIn,
          transform: `translateY(${interpolate(copyIn, [0, 1], [18, 0])}px)`,
        }}
      >
        Transaction completed successfully
      </div>

      <VerificationRail frame={frame} fps={fps} />

      <div
        style={{
          marginTop: 28,
          height: 38,
          padding: "0 17px",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "rgba(232, 247, 238, 0.9)",
          border: "1px solid rgba(18, 183, 106, 0.16)",
          color: palette.greenDark,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 1.45,
          opacity: pillSpring,
          transform: `translateY(${interpolate(pillSpring, [0, 1], [12, 0])}px) scale(${interpolate(
            pillSpring,
            [0, 1],
            [0.88, 1],
          )})`,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: palette.green,
            boxShadow: "0 0 0 5px rgba(18, 183, 106, 0.11)",
          }}
        />
        COMPLETED
      </div>
    </div>
  );
};

const MotionCanvas: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({frame, fps, durationInFrames}) => {
  const fadeIn = interpolate(frame, [0, Math.max(1, 0.12 * fps)], [0, 1], clamp);
  const outroLength = Math.min(0.72 * fps, Math.max(1, durationInFrames * 0.16));
  const outroStart = Math.max(0, durationInFrames - outroLength);
  const fadeOut = interpolate(
    frame,
    [outroStart, Math.max(outroStart + 1, durationInFrames - 1)],
    [1, 0],
    {...clamp, easing: Easing.inOut(Easing.quad)},
  );
  const endShift = interpolate(frame, [outroStart, durationInFrames - 1], [0, -12], clamp);
  const endScale = interpolate(frame, [outroStart, durationInFrames - 1], [1, 0.985], clamp);

  return (
    <FullFrame
      style={{
        background: palette.canvas,
        color: palette.ink,
        overflow: "hidden",
        opacity: fadeIn * fadeOut,
      }}
    >
      <Background frame={frame} fps={fps} />

      <FullFrame
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${endShift}px) scale(${endScale})`,
        }}
      >
        <StatusCard frame={frame} fps={fps} />
      </FullFrame>
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
