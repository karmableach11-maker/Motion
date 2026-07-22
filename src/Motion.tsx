import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  night: "#06101D",
  nightSoft: "#0A1728",
  panel: "#0E2035",
  panelLift: "#142B45",
  white: "#F7FBFF",
  text: "#EAF3FC",
  muted: "#8EA2B7",
  faint: "#516A82",
  line: "#203A53",
  cyan: "#48D7FF",
  cyanSoft: "#A8EEFF",
  blue: "#4C78FF",
  violet: "#7A64FF",
  green: "#38E394",
  greenDeep: "#0BA96A",
  amber: "#FFC66D",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
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
      display: "flex",
      ...style,
    }}
  >
    {children}
  </div>
);

const LockIcon: React.FC<{size?: number; color?: string}> = ({
  size = 18,
  color = palette.cyanSoft,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="4" y="8" width="12" height="9" rx="3" stroke={color} strokeWidth="1.7" />
    <path
      d="M7 8V6.5C7 4.55 8.34 3 10 3s3 1.55 3 3.5V8"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle cx="10" cy="12.4" r="1.1" fill={color} />
  </svg>
);

const CheckIcon: React.FC<{
  size?: number;
  color?: string;
  progress?: number;
  strokeWidth?: number;
}> = ({size = 22, color = palette.white, progress = 1, strokeWidth = 2.7}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4.8 12.4L9.2 16.8L19.4 6.8"
      pathLength={1}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);

const ArrowIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = palette.cyanSoft,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="M14 7L19 12L14 17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = palette.cyan,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3L19 6V11.2C19 15.55 16.2 19.2 12 21C7.8 19.2 5 15.55 5 11.2V6L12 3Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8.7 12L11 14.25L15.5 9.75"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Background: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const reveal = phase(frame, fps, 0, 0.85);
  const drift = Math.sin(frame / 125) * 14;
  const scanX = interpolate(frame % (fps * 7), [0, fps * 7], [-400, 2200]);
  const particles = [
    {x: 148, y: 245, size: 4, delay: 0},
    {x: 302, y: 873, size: 3, delay: 31},
    {x: 519, y: 159, size: 5, delay: 63},
    {x: 1450, y: 170, size: 3, delay: 18},
    {x: 1672, y: 364, size: 5, delay: 81},
    {x: 1780, y: 824, size: 4, delay: 48},
    {x: 1215, y: 925, size: 3, delay: 108},
  ];

  return (
    <FullFrame
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 45%, #102B43 0%, #091929 38%, #06101D 74%, #040B14 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -80,
          opacity: reveal * 0.5,
          transform: `translate(${drift}px, ${-drift * 0.35}px) rotate(-1.2deg) scale(1.12)`,
          transformOrigin: "center 52%",
          backgroundImage:
            "linear-gradient(rgba(76,120,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(72,215,255,0.09) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          WebkitMaskImage:
            "radial-gradient(ellipse 58% 58% at 50% 50%, black 8%, transparent 73%)",
          maskImage:
            "radial-gradient(ellipse 58% 58% at 50% 50%, black 8%, transparent 73%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 960,
          top: 548,
          width: 1220,
          height: 590,
          transform: `translate(-50%, -50%) scale(${0.98 + Math.sin(frame / 78) * 0.018})`,
          borderRadius: "50%",
          opacity: 0.82 * reveal,
          background:
            "radial-gradient(ellipse, rgba(72,215,255,0.12) 0%, rgba(76,120,255,0.055) 43%, rgba(6,16,29,0) 73%)",
          filter: "blur(12px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: scanX,
          top: 0,
          width: 250,
          height: 1080,
          opacity: 0.12 * reveal,
          transform: "skewX(-18deg)",
          background:
            "linear-gradient(90deg, transparent, rgba(116,225,255,0.22), transparent)",
          filter: "blur(18px)",
        }}
      />

      {particles.map((particle, index) => {
        const floatY = Math.sin((frame + particle.delay) / 34) * 10;
        const floatX = Math.cos((frame + particle.delay) / 49) * 5;
        const opacity =
          reveal * (0.2 + (Math.sin((frame + particle.delay) / 28) + 1) * 0.08);
        return (
          <div
            key={`${particle.x}-${particle.y}`}
            style={{
              position: "absolute",
              left: particle.x + floatX,
              top: particle.y + floatY,
              width: particle.size,
              height: particle.size,
              borderRadius: index % 3 === 0 ? 2 : "50%",
              background: index % 2 === 0 ? palette.cyan : palette.blue,
              boxShadow: `0 0 ${particle.size * 5}px rgba(72,215,255,0.55)`,
              opacity,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 84,
          top: 78,
          width: 88,
          height: 88,
          borderLeft: "1px solid rgba(72,215,255,0.22)",
          borderTop: "1px solid rgba(72,215,255,0.22)",
          opacity: reveal,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 84,
          top: 78,
          width: 88,
          height: 88,
          borderRight: "1px solid rgba(72,215,255,0.22)",
          borderTop: "1px solid rgba(72,215,255,0.22)",
          opacity: reveal,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 84,
          bottom: 74,
          width: 88,
          height: 88,
          borderLeft: "1px solid rgba(72,215,255,0.16)",
          borderBottom: "1px solid rgba(72,215,255,0.16)",
          opacity: reveal,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 84,
          bottom: 74,
          width: 88,
          height: 88,
          borderRight: "1px solid rgba(72,215,255,0.16)",
          borderBottom: "1px solid rgba(72,215,255,0.16)",
          opacity: reveal,
        }}
      />
    </FullFrame>
  );
};

const Header: React.FC<{frame: number; fps: number; complete: number}> = ({
  frame,
  fps,
  complete,
}) => {
  const eyebrow = phase(frame, fps, 0.35, 1.05);
  const title = phase(frame, fps, 0.55, 1.3);
  const rule = phase(frame, fps, 0.75, 1.55);
  const initialOut = interpolate(complete, [0, 0.42], [1, 0], clamp);
  const finalTitle = phase(frame, fps, 8.15, 9.05);
  const finalCopy = phase(frame, fps, 8.45, 9.25);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 72,
        width: 1920,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, Arial, sans-serif",
        color: palette.text,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: initialOut,
          transform: `translateY(${-complete * 18}px)`,
        }}
      >
        <div
          style={{
            height: 29,
            padding: "0 13px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 750,
            letterSpacing: 2.4,
            color: palette.cyanSoft,
            background: "rgba(31,92,117,0.24)",
            border: "1px solid rgba(72,215,255,0.22)",
            opacity: eyebrow,
            transform: `translateY(${interpolate(eyebrow, [0, 1], [12, 0])}px)`,
          }}
        >
          <LockIcon size={14} />
          SECURE DIGITAL TRANSFER
        </div>
        <div
          style={{
            marginTop: 13,
            overflow: "hidden",
            display: "flex",
            padding: "0 10px 5px",
          }}
        >
          <div
            style={{
              fontSize: 52,
              lineHeight: 1.02,
              fontWeight: 720,
              letterSpacing: -1.9,
              opacity: title,
              transform: `translateY(${interpolate(title, [0, 1], [50, 0])}px)`,
            }}
          >
            Wallet-to-wallet
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            width: 470,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(72,215,255,0.65), transparent)",
            transform: `scaleX(${rule})`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: -4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{overflow: "hidden", padding: "0 18px 7px", display: "flex"}}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.02,
              fontWeight: 760,
              letterSpacing: -2.5,
              color: palette.white,
              opacity: finalTitle,
              transform: `translateY(${interpolate(finalTitle, [0, 1], [60, 0])}px)`,
            }}
          >
            Transfer complete
          </div>
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 20,
            lineHeight: 1.25,
            fontWeight: 480,
            letterSpacing: 0.1,
            color: palette.muted,
            opacity: finalCopy,
            transform: `translateY(${interpolate(finalCopy, [0, 1], [14, 0])}px)`,
          }}
        >
          Funds securely delivered to the recipient wallet
        </div>
      </div>
    </div>
  );
};

const WalletGlyph: React.FC<{
  side: "sender" | "receiver";
  arrival: number;
  frame: number;
}> = ({side, arrival, frame}) => {
  const receiver = side === "receiver";
  const accent = receiver
    ? interpolate(arrival, [0, 1], [0, 1]) > 0.55
      ? palette.green
      : palette.violet
    : palette.blue;
  const glowOpacity = receiver ? 0.28 + arrival * 0.42 : 0.28;
  const contactlessPulse = 0.54 + Math.sin(frame / 24) * 0.15;
  const gradientId = receiver ? "receiver-wallet" : "sender-wallet";
  const cardGradientId = receiver ? "receiver-card" : "sender-card";

  return (
    <div style={{position: "relative", width: 306, height: 208, display: "flex"}}>
      <svg width="306" height="208" viewBox="0 0 306 208" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="38" y1="36" x2="258" y2="188">
            <stop stopColor={receiver ? "#392E73" : "#173B83"} />
            <stop offset="0.54" stopColor={receiver ? "#273A6B" : "#185279"} />
            <stop offset="1" stopColor={receiver ? "#17384E" : "#12334D"} />
          </linearGradient>
          <linearGradient id={cardGradientId} x1="70" y1="16" x2="222" y2="101">
            <stop stopColor={receiver ? "#9B8BFF" : "#68DDFF"} />
            <stop offset="0.55" stopColor={receiver ? "#725CFF" : "#4C78FF"} />
            <stop offset="1" stopColor={receiver ? "#4566D9" : "#3453C8"} />
          </linearGradient>
          <linearGradient id={`${gradientId}-shine`} x1="58" y1="52" x2="189" y2="160">
            <stop stopColor="white" stopOpacity="0.20" />
            <stop offset="0.44" stopColor="white" stopOpacity="0.035" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id={`${gradientId}-shadow`} x="-30%" y="-30%" width="170%" height="190%">
            <feDropShadow
              dx="0"
              dy="18"
              stdDeviation="15"
              floodColor={accent}
              floodOpacity={glowOpacity}
            />
          </filter>
        </defs>

        <ellipse cx="153" cy="184" rx="112" ry="17" fill={accent} opacity={0.1 + arrival * 0.08} />

        <g filter={`url(#${gradientId}-shadow)`}>
          <rect x="52" y="19" width="182" height="92" rx="20" fill={`url(#${cardGradientId})`} />
          <path
            d="M72 42H118M72 58H96"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="183" y="39" width="29" height="23" rx="7" fill="rgba(255,255,255,0.22)" />
          <path d="M188 44H207M188 51H207M188 58H207" stroke="rgba(255,255,255,0.42)" strokeWidth="1.2" />

          <rect x="31" y="61" width="224" height="125" rx="29" fill={`url(#${gradientId})`} />
          <rect
            x="31.8"
            y="61.8"
            width="222.4"
            height="123.4"
            rx="28.2"
            stroke={receiver && arrival > 0.15 ? palette.green : "rgba(137,199,255,0.26)"}
            strokeWidth={receiver ? 1.4 + arrival * 1.3 : 1.4}
          />
          <path
            d="M42 80C80 54 139 54 184 69C132 71 91 87 55 120C43 109 38 95 42 80Z"
            fill={`url(#${gradientId}-shine)`}
          />
          <rect x="150" y="96" width="125" height="67" rx="19" fill="#10283F" />
          <rect
            x="150.8"
            y="96.8"
            width="123.4"
            height="65.4"
            rx="18.2"
            stroke={receiver && arrival > 0.2 ? palette.green : "rgba(120,196,235,0.34)"}
            strokeWidth="1.5"
          />
          <circle cx="177" cy="129.5" r="8" fill={accent} />
          <circle cx="177" cy="129.5" r="3" fill={palette.white} opacity="0.9" />
          <path d="M198 121H251M198 136H236" stroke="rgba(221,239,255,0.33)" strokeWidth="5" strokeLinecap="round" />
          <path d="M59 150H110" stroke="rgba(221,239,255,0.32)" strokeWidth="6" strokeLinecap="round" />
          <circle cx="124" cy="150" r="4" fill="rgba(221,239,255,0.35)" />
        </g>

        <g opacity={contactlessPulse} transform="translate(252 40)">
          <path d="M0 11C7 14 10 19 10 27" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M3 4C15 9 21 17 21 29" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>

      {receiver && (
        <div
          style={{
            position: "absolute",
            right: 7,
            top: 5,
            width: 62,
            height: 62,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(145deg, ${palette.green}, ${palette.greenDeep})`,
            border: "4px solid #10243A",
            boxShadow: "0 10px 28px rgba(56,227,148,0.34), 0 0 0 8px rgba(56,227,148,0.09)",
            opacity: arrival,
            transform: `scale(${interpolate(arrival, [0, 1], [0.42, 1])}) rotate(${interpolate(
              arrival,
              [0, 1],
              [-18, 0],
            )}deg)`,
          }}
        >
          <CheckIcon size={34} progress={arrival} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

const WalletCard: React.FC<{
  side: "sender" | "receiver";
  frame: number;
  fps: number;
  arrival: number;
}> = ({side, frame, fps, arrival}) => {
  const sender = side === "sender";
  const enter = spring({
    frame: Math.max(0, frame - (sender ? 0.65 : 0.9) * fps),
    fps,
    config: {damping: 19, mass: 0.86, stiffness: 124},
  });
  const detailIn = phase(frame, fps, sender ? 1.2 : 1.45, sender ? 2.05 : 2.25);
  const statusReady = phase(frame, fps, sender ? 2.05 : 2.25, sender ? 2.75 : 2.95);
  const receiverGlow = sender ? 0 : arrival;
  const idle = Math.sin((frame + (sender ? 0 : 35)) / 55) * 2.5;
  const cardX = sender ? 172 : 1314;

  return (
    <div
      style={{
        position: "absolute",
        left: cardX,
        top: 291,
        width: 434,
        height: 500,
        padding: "30px 32px 28px",
        boxSizing: "border-box",
        borderRadius: 34,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, Arial, sans-serif",
        color: palette.text,
        background: sender
          ? "linear-gradient(150deg, rgba(18,43,70,0.97), rgba(9,24,41,0.98))"
          : `linear-gradient(150deg, rgba(${interpolate(receiverGlow, [0, 1], [22, 15])},${interpolate(
              receiverGlow,
              [0, 1],
              [38, 48],
            )},${interpolate(receiverGlow, [0, 1], [70, 55])},0.98), rgba(8,25,40,0.98))`,
        border: `1px solid ${
          receiverGlow > 0.1
            ? `rgba(56,227,148,${0.25 + receiverGlow * 0.42})`
            : "rgba(124,187,230,0.22)"
        }`,
        boxShadow: `0 32px 65px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.055)${
          receiverGlow > 0.05 ? `, 0 0 44px rgba(56,227,148,${receiverGlow * 0.14})` : ""
        }`,
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [sender ? -110 : 110, 0])}px) translateY(${
          interpolate(enter, [0, 1], [18, 0]) + idle
        }px) rotate(${sender ? -1.4 : 1.4}deg) scale(${interpolate(enter, [0, 1], [0.93, 1]) *
          (sender ? 1 : 1 + arrival * 0.012)})`,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: detailIn,
        }}
      >
        <div style={{display: "flex", flexDirection: "column", gap: 5}}>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: 2.2,
              color: sender ? palette.cyanSoft : receiverGlow > 0.5 ? palette.green : "#C5BBFF",
            }}
          >
            {sender ? "SENDER" : "RECIPIENT"}
          </div>
          <div style={{fontSize: 22, lineHeight: 1.15, fontWeight: 680, letterSpacing: -0.45}}>
            {sender ? "Source wallet" : "Destination wallet"}
          </div>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: sender ? "rgba(72,215,255,0.09)" : "rgba(122,100,255,0.12)",
            border: `1px solid ${sender ? "rgba(72,215,255,0.20)" : "rgba(155,139,255,0.24)"}`,
          }}
        >
          {sender ? <LockIcon size={20} /> : <ShieldIcon size={21} color={receiverGlow > 0.5 ? palette.green : "#BFB6FF"} />}
        </div>
      </div>

      <div style={{height: 18}} />
      <WalletGlyph side={side} arrival={arrival} frame={frame} />

      <div
        style={{
          marginTop: 10,
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          opacity: detailIn,
          transform: `translateY(${interpolate(detailIn, [0, 1], [12, 0])}px)`,
        }}
      >
        <div style={{display: "flex", flexDirection: "column", gap: 6}}>
          <div style={{fontSize: 12, fontWeight: 750, letterSpacing: 1.65, color: palette.faint}}>
            WALLET ID
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 650,
              letterSpacing: 1.25,
              color: palette.text,
            }}
          >
            •••• {sender ? "2048" : "7316"}
          </div>
        </div>

        <div
          style={{
            height: 32,
            padding: "0 13px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${
              sender
                ? "rgba(72,215,255,0.20)"
                : arrival > 0.35
                  ? "rgba(56,227,148,0.28)"
                  : "rgba(155,139,255,0.20)"
            }`,
            background: sender
              ? "rgba(72,215,255,0.075)"
              : arrival > 0.35
                ? "rgba(56,227,148,0.09)"
                : "rgba(155,139,255,0.075)",
            color: sender ? palette.cyanSoft : arrival > 0.35 ? palette.green : "#C5BBFF",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.35,
            opacity: statusReady,
            transform: `scale(${interpolate(statusReady, [0, 1], [0.82, 1])})`,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: sender ? palette.cyan : arrival > 0.35 ? palette.green : palette.violet,
              boxShadow: `0 0 10px ${sender ? palette.cyan : arrival > 0.35 ? palette.green : palette.violet}`,
            }}
          />
          {sender ? "AUTHORIZED" : arrival > 0.35 ? "DELIVERED" : "AWAITING"}
        </div>
      </div>
    </div>
  );
};

type Point = {x: number; y: number};

const routePoints = {
  start: {x: 585, y: 541},
  control1: {x: 760, y: 430},
  control2: {x: 1152, y: 656},
  end: {x: 1335, y: 541},
};

const cubicPoint = (t: number): Point => {
  const mt = 1 - t;
  const {start, control1, control2, end} = routePoints;
  return {
    x:
      mt * mt * mt * start.x +
      3 * mt * mt * t * control1.x +
      3 * mt * t * t * control2.x +
      t * t * t * end.x,
    y:
      mt * mt * mt * start.y +
      3 * mt * mt * t * control1.y +
      3 * mt * t * t * control2.y +
      t * t * t * end.y,
  };
};

const cubicAngle = (t: number) => {
  const mt = 1 - t;
  const {start, control1, control2, end} = routePoints;
  const dx =
    3 * mt * mt * (control1.x - start.x) +
    6 * mt * t * (control2.x - control1.x) +
    3 * t * t * (end.x - control2.x);
  const dy =
    3 * mt * mt * (control1.y - start.y) +
    6 * mt * t * (control2.y - control1.y) +
    3 * t * t * (end.y - control2.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const checkpointData = [
  {t: 0.28, label: "ENCRYPT", icon: "lock" as const},
  {t: 0.52, label: "VERIFY", icon: "shield" as const},
  {t: 0.76, label: "ROUTE", icon: "arrow" as const},
];

const RouteLayer: React.FC<{
  frame: number;
  fps: number;
  routeProgress: number;
  arrival: number;
}> = ({frame, fps, routeProgress, arrival}) => {
  const routeIn = phase(frame, fps, 1.55, 2.7, easeInOut);
  const packetIn = phase(frame, fps, 3.0, 3.3);
  const packetOut = phase(frame, fps, 7.62, 7.96, easeInOut);
  const packet = cubicPoint(routeProgress);
  const packetAngle = cubicAngle(routeProgress);
  const activePulse = 0.82 + Math.sin(frame / 8) * 0.12;
  const scanDashOffset = -(frame * 0.0045);
  const routePath = `M ${routePoints.start.x} ${routePoints.start.y} C ${routePoints.control1.x} ${routePoints.control1.y}, ${routePoints.control2.x} ${routePoints.control2.y}, ${routePoints.end.x} ${routePoints.end.y}`;

  return (
    <FullFrame style={{pointerEvents: "none"}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" style={{position: "absolute", inset: 0}}>
        <defs>
          <linearGradient id="route-base" x1="585" y1="505" x2="1335" y2="590">
            <stop stopColor={palette.cyan} stopOpacity="0.28" />
            <stop offset="0.52" stopColor={palette.blue} stopOpacity="0.22" />
            <stop offset="1" stopColor={palette.violet} stopOpacity="0.30" />
          </linearGradient>
          <linearGradient id="route-active" x1="585" y1="480" x2="1335" y2="600">
            <stop stopColor={palette.cyanSoft} />
            <stop offset="0.48" stopColor={palette.cyan} />
            <stop offset="0.78" stopColor="#67A7FF" />
            <stop offset="1" stopColor={arrival > 0.2 ? palette.green : "#9D8BFF"} />
          </linearGradient>
          <filter id="route-glow" x="-25%" y="-75%" width="150%" height="250%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={routePath}
          pathLength={1}
          stroke="url(#route-base)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="0.012 0.016"
          strokeDashoffset={scanDashOffset}
          opacity={routeIn}
        />
        <path
          d={routePath}
          pathLength={1}
          stroke="rgba(72,215,255,0.13)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - routeProgress}
          opacity={packetIn * (1 - arrival * 0.45)}
          filter="url(#route-glow)"
        />
        <path
          d={routePath}
          pathLength={1}
          stroke="url(#route-active)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - routeProgress}
          opacity={packetIn}
          filter="url(#route-glow)"
        />

        <circle cx={routePoints.start.x} cy={routePoints.start.y} r="8" fill={palette.cyan} opacity={routeIn} />
        <circle
          cx={routePoints.end.x}
          cy={routePoints.end.y}
          r="8"
          fill={arrival > 0.15 ? palette.green : palette.violet}
          opacity={routeIn}
        />
      </svg>

      {checkpointData.map((checkpoint, index) => {
        const point = cubicPoint(checkpoint.t);
        const nodeIn = phase(frame, fps, 1.85 + index * 0.23, 2.45 + index * 0.23);
        const reached = interpolate(
          routeProgress,
          [checkpoint.t - 0.035, checkpoint.t + 0.045],
          [0, 1],
          {...clamp, easing: easeOut},
        );
        const pulse = reached < 0.98 ? 1 : 1 + Math.max(0, Math.sin((frame - checkpoint.t * 40) / 11)) * 0.04;
        return (
          <div
            key={checkpoint.label}
            style={{
              position: "absolute",
              left: point.x - 54,
              top: point.y - 54,
              width: 108,
              height: 108,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: nodeIn,
              transform: `scale(${interpolate(nodeIn, [0, 1], [0.76, 1]) * pulse})`,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 54,
                height: 54,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  reached > 0.45
                    ? "linear-gradient(145deg, #53DFFF, #315DCE)"
                    : "linear-gradient(145deg, rgba(25,56,83,0.98), rgba(11,29,48,0.98))",
                border: `1px solid ${reached > 0.45 ? "rgba(168,238,255,0.85)" : "rgba(99,171,218,0.35)"}`,
                boxShadow:
                  reached > 0.25
                    ? `0 0 ${18 + reached * 18}px rgba(72,215,255,${0.18 + reached * 0.22})`
                    : "0 10px 24px rgba(0,0,0,0.28)",
              }}
            >
              {reached > 0.62 ? (
                <CheckIcon size={25} progress={reached} />
              ) : checkpoint.icon === "lock" ? (
                <LockIcon size={22} />
              ) : checkpoint.icon === "shield" ? (
                <ShieldIcon size={23} color={palette.cyanSoft} />
              ) : (
                <ArrowIcon size={23} />
              )}
            </div>
            <div
              style={{
                marginTop: 12,
                padding: "5px 8px",
                borderRadius: 7,
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 12,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: 1.45,
                color: reached > 0.45 ? palette.cyanSoft : palette.muted,
                background: "rgba(5,15,26,0.72)",
                border: "1px solid rgba(87,150,192,0.15)",
              }}
            >
              {checkpoint.label}
            </div>
          </div>
        );
      })}

      {[5, 4, 3, 2, 1].map((trail) => {
        const trailT = Math.max(0, routeProgress - trail * 0.018);
        const point = cubicPoint(trailT);
        const visible = packetIn * (1 - packetOut) * interpolate(routeProgress, [0, trail * 0.019], [0, 1], clamp);
        return (
          <div
            key={trail}
            style={{
              position: "absolute",
              left: point.x - (8 - trail * 0.8),
              top: point.y - (8 - trail * 0.8),
              width: 16 - trail * 1.6,
              height: 16 - trail * 1.6,
              borderRadius: "50%",
              background: trail % 2 === 0 ? palette.cyan : palette.cyanSoft,
              filter: "blur(1px)",
              opacity: visible * (0.64 - trail * 0.085),
              boxShadow: "0 0 15px rgba(72,215,255,0.65)",
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: packet.x - 31,
          top: packet.y - 31,
          width: 62,
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: packetIn * (1 - packetOut),
          transform: `rotate(${packetAngle}deg) scale(${0.94 + activePulse * 0.065})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 82,
            height: 82,
            borderRadius: "50%",
            border: "1px solid rgba(72,215,255,0.32)",
            transform: `scale(${0.82 + activePulse * 0.17})`,
            opacity: 0.9 - activePulse * 0.48,
          }}
        />
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #B8F4FF 0%, #48D7FF 44%, #4C78FF 100%)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow: "0 0 12px rgba(168,238,255,0.92), 0 0 34px rgba(72,215,255,0.62)",
          }}
        >
          <ArrowIcon size={25} color="#08203A" />
        </div>
      </div>
    </FullFrame>
  );
};

const TransferValue: React.FC<{frame: number; fps: number; routeProgress: number; arrival: number}> = ({
  frame,
  fps,
  routeProgress,
  arrival,
}) => {
  const inProgress = phase(frame, fps, 2.45, 3.1);
  const finish = phase(frame, fps, 8.55, 9.35);
  const progressPercent = Math.round(routeProgress * 100);
  const travelingOpacity = inProgress * interpolate(arrival, [0, 0.5], [1, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 742,
        top: 727,
        width: 436,
        height: 122,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: travelingOpacity,
          transform: `translateY(${interpolate(inProgress, [0, 1], [12, 0])}px)`,
        }}
      >
        <div style={{fontSize: 12, fontWeight: 800, letterSpacing: 2, color: palette.faint}}>
          TRANSFER VALUE
        </div>
        <div
          style={{
            marginTop: 7,
            display: "flex",
            alignItems: "baseline",
            gap: 11,
            color: palette.text,
          }}
        >
          <span style={{fontSize: 35, lineHeight: 1, fontWeight: 730, letterSpacing: -1}}>1,280.00</span>
          <span style={{fontSize: 12, fontWeight: 780, letterSpacing: 1.6, color: palette.cyanSoft}}>
            UNITS
          </span>
        </div>
        <div
          style={{
            marginTop: 14,
            width: 316,
            height: 4,
            display: "flex",
            borderRadius: 999,
            overflow: "hidden",
            background: "rgba(96,145,184,0.18)",
          }}
        >
          <div
            style={{
              width: `${routeProgress * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #48D7FF, #4C78FF, #8D78FF)",
              boxShadow: "0 0 12px rgba(72,215,255,0.48)",
            }}
          />
        </div>
        <div
          style={{
            marginTop: 8,
            width: 316,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            fontWeight: 750,
            letterSpacing: 1.25,
            color: palette.faint,
          }}
        >
          <span>SECURE ROUTE</span>
          <span>{String(progressPercent).padStart(2, "0")}%</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 5,
          width: 390,
          height: 86,
          borderRadius: 25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: "linear-gradient(145deg, rgba(19,47,65,0.96), rgba(10,30,43,0.98))",
          border: "1px solid rgba(56,227,148,0.32)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.28), 0 0 35px rgba(56,227,148,0.08)",
          opacity: finish,
          transform: `translateY(${interpolate(finish, [0, 1], [18, 0])}px) scale(${interpolate(
            finish,
            [0, 1],
            [0.94, 1],
          )})`,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(145deg, ${palette.green}, ${palette.greenDeep})`,
            boxShadow: "0 0 24px rgba(56,227,148,0.30)",
          }}
        >
          <CheckIcon size={26} progress={finish} />
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 4}}>
          <div style={{fontSize: 12, fontWeight: 800, letterSpacing: 1.8, color: palette.green}}>
            DELIVERED
          </div>
          <div style={{fontSize: 20, fontWeight: 660, letterSpacing: -0.35, color: palette.text}}>
            1,280.00 units received
          </div>
        </div>
      </div>
    </div>
  );
};

const FooterMeta: React.FC<{frame: number; fps: number; arrival: number}> = ({frame, fps, arrival}) => {
  const metaIn = phase(frame, fps, 1.1, 1.9);
  const verified = phase(frame, fps, 8.0, 8.75);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: 12,
        lineHeight: 1,
        fontWeight: 760,
        letterSpacing: 1.7,
        color: palette.faint,
        opacity: metaIn,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 10}}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: arrival > 0.25 ? palette.green : palette.cyan,
            boxShadow: `0 0 11px ${arrival > 0.25 ? palette.green : palette.cyan}`,
          }}
        />
        END-TO-END SECURED
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          color: arrival > 0.25 ? palette.green : palette.faint,
        }}
      >
        <ShieldIcon size={17} color={arrival > 0.25 ? palette.green : palette.faint} />
          <span style={{opacity: 1 - verified, position: "absolute", right: 0}}>
          VERIFYING DELIVERY
        </span>
        <span style={{opacity: verified}}>DELIVERY VERIFIED</span>
      </div>
    </div>
  );
};

export const MotionCanvas: React.FC<{
  frame: number;
  fps: number;
  durationInFrames: number;
}> = ({frame, fps, durationInFrames}) => {
  const routeProgress = phase(frame, fps, 3.25, 7.72, easeInOut);
  const arrivalBase = phase(frame, fps, 7.65, 8.4);
  const arrivalSpring = spring({
    frame: Math.max(0, frame - 7.65 * fps),
    fps,
    config: {damping: 14, mass: 0.7, stiffness: 162},
  });
  const arrival = Math.min(1, arrivalBase * Math.max(0, arrivalSpring));
  const complete = phase(frame, fps, 7.75, 8.85, easeInOut);
  const transferEnvelope = Math.sin(routeProgress * Math.PI);
  const packet = cubicPoint(routeProgress);
  const cameraScale = 1 + transferEnvelope * 0.052;
  const cameraX = -(packet.x - 960) * transferEnvelope * 0.045;
  const cameraY = -transferEnvelope * 5;
  const fadeIn = phase(frame, fps, 0, 0.4, Easing.out(Easing.quad));
  const outroLength = Math.min(fps * 0.9, Math.max(1, durationInFrames * 0.12));
  const outroStart = Math.max(0, durationInFrames - outroLength);
  const fadeOut = interpolate(
    frame,
    [outroStart, Math.max(outroStart + 1, durationInFrames - 1)],
    [1, 0],
    {...clamp, easing: Easing.inOut(Easing.quad)},
  );
  const outroScale = interpolate(frame, [outroStart, durationInFrames - 1], [1, 0.985], clamp);

  return (
    <FullFrame
      style={{
        overflow: "hidden",
        background: palette.night,
        color: palette.text,
        opacity: fadeIn * fadeOut,
      }}
    >
      <Background frame={frame} fps={fps} />

      <FullFrame
        style={{
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale * outroScale})`,
          transformOrigin: "50% 52%",
        }}
      >
        <WalletCard side="sender" frame={frame} fps={fps} arrival={0} />
        <WalletCard side="receiver" frame={frame} fps={fps} arrival={arrival} />
        <RouteLayer
          frame={frame}
          fps={fps}
          routeProgress={routeProgress}
          arrival={arrival}
        />
        <TransferValue
          frame={frame}
          fps={fps}
          routeProgress={routeProgress}
          arrival={arrival}
        />
      </FullFrame>

      <Header frame={frame} fps={fps} complete={complete} />
      <FooterMeta frame={frame} fps={fps} arrival={arrival} />
    </FullFrame>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return <MotionCanvas frame={frame} fps={fps} durationInFrames={durationInFrames} />;
};
