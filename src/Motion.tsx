import React from "react";
// Active Motion27: Aisha Noor to Diego Alvarez money transfer.
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const LEFT_ANCHOR = {x: 520, y: 355};
const HUB = {x: 960, y: 320};
const RIGHT_ANCHOR = {x: 1400, y: 355};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const hash = (value: number) => {
  const result = Math.sin(value * 127.1 + 411.9) * 43758.5453123;
  return result - Math.floor(result);
};

const leftCurve = (progress: number) => {
  const t = clamp(progress);
  const u = 1 - t;
  const control = {x: 715, y: 150};
  return {
    x:
      u * u * LEFT_ANCHOR.x +
      2 * u * t * control.x +
      t * t * HUB.x,
    y:
      u * u * LEFT_ANCHOR.y +
      2 * u * t * control.y +
      t * t * HUB.y,
  };
};

const rightCurve = (progress: number) => {
  const t = clamp(progress);
  const u = 1 - t;
  const control = {x: 1205, y: 150};
  return {
    x:
      u * u * HUB.x +
      2 * u * t * control.x +
      t * t * RIGHT_ANCHOR.x,
    y:
      u * u * HUB.y +
      2 * u * t * control.y +
      t * t * RIGHT_ANCHOR.y,
  };
};

const routePoint = (progress: number) => {
  if (progress <= 0.5) {
    return leftCurve(progress * 2);
  }
  return rightCurve((progress - 0.5) * 2);
};

const specks = Array.from({length: 76}, (_, index) => ({
  x: hash(index + 11) * WIDTH,
  y: hash(index + 101) * HEIGHT,
  radius: 0.6 + hash(index + 211) * 1.8,
  opacity: 0.06 + hash(index + 321) * 0.2,
  phase: hash(index + 431) * Math.PI * 2,
}));

const successParticles = Array.from({length: 34}, (_, index) => ({
  angle: (index / 34) * Math.PI * 2 + hash(index + 77) * 0.15,
  distance: 72 + hash(index + 177) * 126,
  size: 2 + hash(index + 277) * 4.5,
  delay: Math.round(hash(index + 377) * 12),
  color:
    index % 3 === 0
      ? "#C9FF72"
      : index % 3 === 1
        ? "#69E5FF"
        : "#F3FFF8",
}));

const CircuitBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const breath =
    0.9 + Math.sin((frame / durationInFrames) * Math.PI * 2) * 0.06;
  const lateSweep =
    reveal(frame, 600, 630) * (1 - reveal(frame, 678, 708));
  const sweepX = interpolate(frame, [600, 708], [-520, 1760], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 31%, #243352 0%, #11192D 37%, #090D1B 68%, #040610 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: breath,
          background:
            "radial-gradient(ellipse at 18% 38%, rgba(255,111,73,0.20) 0%, rgba(154,54,62,0.07) 34%, transparent 65%), radial-gradient(ellipse at 82% 35%, rgba(57,203,244,0.18) 0%, rgba(28,111,159,0.06) 36%, transparent 66%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.34,
          backgroundImage:
            "linear-gradient(120deg, rgba(137,162,205,0.05) 1px, transparent 1px), linear-gradient(30deg, rgba(137,162,205,0.035) 1px, transparent 1px)",
          backgroundSize: "82px 82px",
          maskImage:
            "radial-gradient(ellipse at 50% 42%, black 0%, rgba(0,0,0,.82) 44%, transparent 86%)",
        }}
      />
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <g opacity="0.2">
          <path
            d="M-70 170C320 30 620 94 900 232S1470 432 1990 198"
            fill="none"
            stroke="#8DA4D2"
            strokeOpacity="0.13"
            strokeWidth="1"
            strokeDasharray="3 16"
            strokeDashoffset={-frame * 0.18}
          />
          <path
            d="M-120 830C290 1002 650 918 960 790S1510 616 2030 850"
            fill="none"
            stroke="#8DA4D2"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
          <ellipse
            cx="960"
            cy="420"
            rx="742"
            ry="358"
            fill="none"
            stroke="#8297BE"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        </g>
        {specks.map((speck, index) => {
          const pulse =
            0.52 +
            Math.sin(frame / 72 + speck.phase) * 0.32;
          return (
            <circle
              key={index}
              cx={speck.x}
              cy={speck.y + Math.sin(frame / 105 + speck.phase) * 4}
              r={speck.radius}
              fill={index % 4 === 0 ? "#8DEBFF" : "#C9D7F1"}
              fillOpacity={speck.opacity * pulse}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: sweepX,
          top: -370,
          width: 350,
          height: 1700,
          transform: "rotate(24deg)",
          opacity: lateSweep,
          filter: "blur(38px)",
          mixBlendMode: "screen",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(112,222,255,0.03) 20%, rgba(181,243,255,0.20) 50%, rgba(255,152,104,0.04) 80%, transparent 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 190px rgba(0,0,0,0.62)",
          background:
            "linear-gradient(180deg, rgba(1,3,10,0.04) 0%, transparent 40%, rgba(1,3,10,0.46) 100%)",
        }}
      />
    </>
  );
};

const IdentityCard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly startFrame: number;
  readonly accent: string;
  readonly accentDark: string;
  readonly initials: string;
  readonly name: string;
  readonly role: string;
  readonly side: "left" | "right";
  readonly success?: number;
}> = ({
  x,
  y,
  startFrame,
  accent,
  accentDark,
  initials,
  name,
  role,
  side,
  success = 0,
}) => {
  const frame = useCurrentFrame();
  const enter = reveal(frame, startFrame, startFrame + 22);
  const direction = side === "left" ? -1 : 1;
  const offsetX = (1 - enter) * 42 * direction;
  const scale = interpolate(enter, [0, 0.78, 1], [0.92, 1.018, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const float = Math.sin(frame / 82 + (side === "left" ? 0 : 1.7)) * 2.4;
  const alignRight = side === "right";
  const avatarX = alignRight ? 126 : -126;
  const textX = alignRight ? 71 : -71;

  return (
    <g
      transform={`translate(${x + offsetX} ${y + float}) scale(${scale})`}
      opacity={enter}
      filter="url(#identityShadow)"
    >
      <rect
        x="-202"
        y="-87"
        width="404"
        height="174"
        rx="32"
        fill="#11192C"
        fillOpacity="0.95"
        stroke={success > 0.1 ? "#AFFF78" : accent}
        strokeOpacity={0.24 + success * 0.5}
        strokeWidth={1.5 + success * 1.2}
      />
      <rect
        x="-190"
        y="-75"
        width="380"
        height="150"
        rx="24"
        fill={`url(#identity-${side})`}
      />
      <path
        d={
          alignRight
            ? "M-190-75H-20C42-75 82-30 112 75H-190Z"
            : "M190-75H20C-42-75-82-30-112 75H190Z"
        }
        fill="#FFFFFF"
        fillOpacity="0.025"
      />
      <g transform={`translate(${avatarX} 0)`}>
        <path
          d="M0-56L48-28V28L0 56L-48 28V-28Z"
          fill={accentDark}
          stroke={accent}
          strokeOpacity="0.78"
          strokeWidth="2"
        />
        <path
          d="M0-47L40-23V23L0 47L-40 23V-23Z"
          fill={accent}
          fillOpacity="0.19"
        />
        <text
          y="9"
          fill="#F9FCFF"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="29"
          fontWeight="850"
          letterSpacing="1"
          textAnchor="middle"
        >
          {initials}
        </text>
        <circle
          cx="37"
          cy="39"
          r="13"
          fill="#0B1522"
          stroke={success > 0.15 ? "#B8FF78" : accent}
          strokeWidth="2"
        />
        {success > 0.15 ? (
          <path
            d="M31 39L35 43L43 34"
            fill="none"
            stroke="#DFFFF1"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle cx="37" cy="39" r="4" fill={accent} />
        )}
      </g>
      <text
        x={textX}
        y="-8"
        fill="#F5F8FF"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="28"
        fontWeight="780"
        letterSpacing="0.2"
        textAnchor={alignRight ? "end" : "start"}
      >
        {name}
      </text>
      <text
        x={textX}
        y="24"
        fill="#8FA2BF"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="15"
        fontWeight="650"
        letterSpacing="1.6"
        textAnchor={alignRight ? "end" : "start"}
      >
        {role.toUpperCase()}
      </text>
      <g transform={`translate(${textX} 51)`}>
        <circle
          cx={alignRight ? -10 : 10}
          r="4"
          fill={success > 0.2 ? "#B6FF78" : accent}
        />
        <text
          x={alignRight ? -22 : 22}
          y="5"
          fill={success > 0.2 ? "#CFFFAC" : "#AAB8CE"}
          fontFamily="Inter, Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1.2"
          textAnchor={alignRight ? "end" : "start"}
        >
          {success > 0.2 ? "RECEIVED" : "VERIFIED"}
        </text>
      </g>
    </g>
  );
};

const RouteSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = reveal(frame, 34, 69);
  const success = reveal(frame, 324, 356);
  const dash = -frame * 1.55;
  const pathLeft = `M${LEFT_ANCHOR.x} ${LEFT_ANCHOR.y}Q715 150 ${HUB.x} ${HUB.y}`;
  const pathRight = `M${HUB.x} ${HUB.y}Q1205 150 ${RIGHT_ANCHOR.x} ${RIGHT_ANCHOR.y}`;

  return (
    <g opacity={enter}>
      {[pathLeft, pathRight].map((path, index) => (
        <g key={path}>
          <path
            d={path}
            fill="none"
            stroke={index === 0 ? "#FF744F" : "#4CD8FF"}
            strokeOpacity="0.13"
            strokeWidth="22"
            filter="url(#routeBloom)"
          />
          <path
            d={path}
            fill="none"
            stroke={index === 0 ? "url(#routeLeft)" : "url(#routeRight)"}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - enter)}
          />
          <path
            d={path}
            fill="none"
            stroke="#E7F8FF"
            strokeOpacity={0.24 + success * 0.12}
            strokeWidth="1"
            strokeDasharray="3 20"
            strokeDashoffset={dash + index * 9}
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
};

const VerificationHub: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = reveal(frame, 24, 52);
  const success = reveal(frame, 324, 354);
  const settle = 1 - reveal(frame, 390, 430) * 0.26;

  return (
    <g
      transform={`translate(${HUB.x} ${HUB.y}) scale(${interpolate(
        enter,
        [0, 0.75, 1],
        [0.7, 1.06, 1],
        {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
      )})`}
      opacity={enter * settle}
      filter="url(#hubShadow)"
    >
      <circle
        r="84"
        fill="#0B1426"
        fillOpacity="0.9"
        stroke={success > 0.4 ? "#B6FF75" : "#8CA9D5"}
        strokeOpacity={0.28 + success * 0.55}
        strokeWidth="2"
      />
      <circle
        r="70"
        fill="url(#hubSurface)"
        stroke="#E4F2FF"
        strokeOpacity="0.12"
      />
      <path
        d="M0-60L52-30V30L0 60L-52 30V-30Z"
        fill="none"
        stroke={success > 0.4 ? "#BEFF8A" : "#89B9FF"}
        strokeOpacity="0.32"
        strokeWidth="1.4"
        strokeDasharray="5 10"
        transform={`rotate(${frame * 0.12})`}
      />
      <path
        d="M0-49L42-24V24L0 49L-42 24V-24Z"
        fill="none"
        stroke={success > 0.4 ? "#D4FFB4" : "#FF9A74"}
        strokeOpacity="0.38"
        transform={`rotate(${-frame * 0.16})`}
      />
      {success > 0.45 ? (
        <path
          d="M-24 0L-7 18L27-22"
          fill="none"
          stroke="#E2FFC8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={success}
        />
      ) : (
        <>
          <path
            d="M-28-8H22M12-20L26-8L12 4"
            fill="none"
            stroke="#F6FAFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28 13H-22M-12 1L-26 13L-12 25"
            fill="none"
            stroke="#8CE7FF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <text
        y="111"
        fill={success > 0.4 ? "#CFFFAD" : "#91A6C4"}
        fontFamily="Inter, Arial, sans-serif"
        fontSize="13"
        fontWeight="750"
        letterSpacing="2.4"
        textAnchor="middle"
      >
        {success > 0.4 ? "SETTLED" : "SECURE LINK"}
      </text>
    </g>
  );
};

const TransferChip: React.FC<{readonly index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const start = 70;
  const stop = 324;
  const period = 100;
  const local = frame - start + index * 25;
  const wrapped = ((local % period) + period) % period;
  const progress = wrapped / period;
  const point = routePoint(progress);
  const active =
    reveal(frame, start + index * 3, start + 15 + index * 3) *
    (1 - reveal(frame, stop - 16, stop));
  const endpoint = clamp(Math.min(progress / 0.09, (1 - progress) / 0.09));
  const beforeHub = progress < 0.5;
  const spin = frame * 1.3 + index * 31;
  const color = beforeHub ? "#FF9169" : "#67E2FF";

  return (
    <g
      transform={`translate(${point.x} ${point.y + Math.sin(frame / 7 + index) * 2.2}) rotate(${45 + spin * 0.18})`}
      opacity={active * endpoint}
    >
      <rect
        x="-25"
        y="-25"
        width="50"
        height="50"
        rx="10"
        fill={color}
        fillOpacity="0.16"
        filter="url(#chipBloom)"
      />
      <rect
        x="-18"
        y="-18"
        width="36"
        height="36"
        rx="8"
        fill={beforeHub ? "url(#chipWarm)" : "url(#chipCool)"}
        stroke="#F7FDFF"
        strokeOpacity="0.65"
        strokeWidth="1.4"
      />
      <g transform={`rotate(${-45 - spin * 0.18})`}>
        <text
          y="7"
          fill="#F8FDFF"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="20"
          fontWeight="900"
          textAnchor="middle"
        >
          €
        </text>
      </g>
    </g>
  );
};

const SettlementPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = reveal(frame, 38, 68);
  const success = reveal(frame, 324, 352);
  const oldStatus = 1 - reveal(frame, 324, 334);
  const newStatus = reveal(frame, 338, 352);
  const delivered = newStatus > 0.5;
  const float = Math.sin(frame / 96) * 2.5;
  const y = 585 + (1 - enter) * 34 + float;
  const progress = interpolate(frame, [74, 318], [0.1, 0.92], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g
      transform={`translate(960 ${y}) scale(${interpolate(
        enter,
        [0, 0.8, 1],
        [0.94, 1.012, 1],
        {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
      )})`}
      opacity={enter}
      filter="url(#panelShadow)"
    >
      <rect
        x="-360"
        y="-124"
        width="720"
        height="248"
        rx="34"
        fill="#0B1222"
        fillOpacity="0.96"
        stroke="url(#panelBorder)"
        strokeWidth="2"
      />
      <rect
        x="-345"
        y="-109"
        width="690"
        height="218"
        rx="25"
        fill="url(#panelSurface)"
      />
      <path
        d="M-345-109H124C213-109 279-64 345 20V-109Z"
        fill="#FFFFFF"
        fillOpacity="0.026"
      />
      <text
        x="-304"
        y="-70"
        fill="#8497B5"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="14"
        fontWeight="750"
        letterSpacing="2.4"
      >
        INTERNATIONAL TRANSFER
      </text>
      <g transform="translate(304 -72)">
        <rect
          x="-150"
          y="-17"
          width="150"
          height="34"
          rx="17"
          fill={delivered ? "#263D24" : "#25213A"}
          stroke={delivered ? "#A9FF74" : "#A796FF"}
          strokeOpacity="0.38"
        />
        <circle
          cx="-128"
          r="4"
          fill={delivered ? "#B7FF79" : "#B1A6FF"}
        />
        <text
          x="-62"
          y="5"
          fill={delivered ? "#D8FFBC" : "#CFC9FF"}
          fontFamily="Inter, Arial, sans-serif"
          fontSize="12"
          fontWeight="800"
          letterSpacing="1.1"
          textAnchor="middle"
        >
          {delivered ? "DELIVERED" : "IN TRANSIT"}
        </text>
      </g>
      <line
        x1="-304"
        y1="-42"
        x2="304"
        y2="-42"
        stroke="#91A6C8"
        strokeOpacity="0.12"
      />
      <g transform="translate(-304 0)">
        <text
          y="0"
          fill="#7F91AD"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1.7"
        >
          AMOUNT
        </text>
        <text
          y="44"
          fill={success > 0.4 ? "#D7FFC0" : "#F7FAFF"}
          fontFamily="Inter, Arial, sans-serif"
          fontSize="39"
          fontWeight="820"
          letterSpacing="-0.6"
        >
          €1,840.75
        </text>
      </g>
      <g transform="translate(66 0)">
        <text
          y="0"
          fill="#7F91AD"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1.7"
        >
          TRANSFER FEE
        </text>
        <text
          y="42"
          fill="#D7E0EF"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="28"
          fontWeight="750"
        >
          €0.00
        </text>
      </g>
      <g transform="translate(304 0)">
        <text
          y="0"
          fill="#7F91AD"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1.7"
          textAnchor="end"
        >
          REFERENCE
        </text>
        <text
          y="42"
          fill="#D7E0EF"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="25"
          fontWeight="750"
          letterSpacing="1.2"
          textAnchor="end"
        >
          AN-4829
        </text>
      </g>
      <rect
        x="-304"
        y="73"
        width="608"
        height="5"
        rx="2.5"
        fill="#647491"
        fillOpacity="0.22"
      />
      <rect
        x="-304"
        y="73"
        width={608 * (success > 0.1 ? 1 : progress)}
        height="5"
        rx="2.5"
        fill={success > 0.1 ? "url(#barSuccess)" : "url(#barProgress)"}
      />
      <g opacity={oldStatus} transform={`translate(-304 ${99 - (1 - oldStatus) * 5})`}>
        <circle r="7" fill="none" stroke="#FF9C78" strokeWidth="1.8" />
        <path
          d="M0-7A7 7 0 0 1 7 0"
          fill="none"
          stroke="#FFE2D6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <text
          x="18"
          y="5"
          fill="#9EADC3"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="14"
          fontWeight="680"
          letterSpacing="1.2"
        >
          VERIFYING DELIVERY
        </text>
      </g>
      <g opacity={newStatus} transform={`translate(-304 ${99 + (1 - newStatus) * 6})`}>
        <circle r="8" fill="#B4FF79" fillOpacity="0.16" />
        <path
          d="M-4 0L-1 4L5-4"
          fill="none"
          stroke="#CFFFAB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="18"
          y="5"
          fill="#C5FFA0"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="14"
          fontWeight="780"
          letterSpacing="1.2"
        >
          DELIVERY CONFIRMED
        </text>
      </g>
    </g>
  );
};

const SuccessMoment: React.FC = () => {
  const frame = useCurrentFrame();
  const burst = reveal(frame, 326, 352);
  const fade = 1 - reveal(frame, 382, 420);
  const label =
    reveal(frame, 336, 358) * (1 - reveal(frame, 390, 424));

  return (
    <g>
      {successParticles.map((particle, index) => {
        const local = reveal(
          frame,
          326 + particle.delay,
          353 + particle.delay,
        );
        const x =
          RIGHT_ANCHOR.x +
          Math.cos(particle.angle) * particle.distance * local;
        const y =
          RIGHT_ANCHOR.y +
          Math.sin(particle.angle) * particle.distance * local;
        return (
          <g
            key={index}
            transform={`translate(${x} ${y}) rotate(${index * 17})`}
            opacity={burst * fade * (1 - local * 0.45)}
          >
            {index % 3 === 0 ? (
              <path
                d={`M${-particle.size * 1.5} 0H${particle.size * 1.5}M0 ${-particle.size * 1.5}V${particle.size * 1.5}`}
                stroke={particle.color}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <rect
                x={-particle.size / 2}
                y={-particle.size / 2}
                width={particle.size}
                height={particle.size}
                rx={particle.size * 0.22}
                fill={particle.color}
                filter="url(#particleBloom)"
              />
            )}
          </g>
        );
      })}
      <g
        transform={`translate(${RIGHT_ANCHOR.x} ${RIGHT_ANCHOR.y - 130 - (1 - label) * 18})`}
        opacity={label}
      >
        <rect
          x="-104"
          y="-27"
          width="208"
          height="54"
          rx="27"
          fill="#152A2B"
          fillOpacity="0.94"
          stroke="#B3FF78"
          strokeOpacity="0.52"
        />
        <circle cx="-75" r="5" fill="#B9FF7E" />
        <text
          x="8"
          y="8"
          fill="#D9FFC0"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="21"
          fontWeight="820"
          letterSpacing="0.2"
          textAnchor="middle"
        >
          +€1,840.75
        </text>
      </g>
    </g>
  );
};

const ClosingCopy: React.FC = () => {
  const frame = useCurrentFrame();
  const title = reveal(frame, 398, 434);
  const line = reveal(frame, 424, 454);
  const sub = reveal(frame, 446, 480);

  return (
    <g>
      <text
        x="960"
        y={890 + (1 - title) * 24}
        fill="#F4F8FF"
        fillOpacity={title}
        fontFamily="Inter, Arial, sans-serif"
        fontSize="47"
        fontWeight="820"
        letterSpacing="7.5"
        textAnchor="middle"
      >
        PAYMENT RECEIVED
      </text>
      <g opacity={line}>
        <line
          x1={960 - 148 * line}
          y1="915"
          x2={960 + 148 * line}
          y2="915"
          stroke="url(#closingLine)"
          strokeWidth="2"
        />
        <path
          d="M0-5L5 0L0 5L-5 0Z"
          fill="#FF8C67"
          transform={`translate(${960 - 152 * line} 915)`}
        />
        <path
          d="M0-5L5 0L0 5L-5 0Z"
          fill="#68E5FF"
          transform={`translate(${960 + 152 * line} 915)`}
        />
      </g>
      <text
        x="960"
        y={958 + (1 - sub) * 13}
        fill="#91A3BE"
        fillOpacity={sub}
        fontFamily="Inter, Arial, sans-serif"
        fontSize="17"
        fontWeight="650"
        letterSpacing="2"
        textAnchor="middle"
      >
        END-TO-END DELIVERY VERIFIED
      </text>
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = reveal(frame, 0, 18);
  const success =
    reveal(frame, 324, 354) * (1 - reveal(frame, 398, 438) * 0.28);

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#050711",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <CircuitBackground />
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0, opacity: intro}}
      >
        <defs>
          <linearGradient id="identity-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#392235" stopOpacity="0.82" />
            <stop offset="55%" stopColor="#1C1C31" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="identity-right" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#153447" stopOpacity="0.86" />
            <stop offset="56%" stopColor="#172336" stopOpacity="0.93" />
            <stop offset="100%" stopColor="#101827" stopOpacity="0.97" />
          </linearGradient>
          <linearGradient
            id="routeLeft"
            x1={LEFT_ANCHOR.x}
            y1={LEFT_ANCHOR.y}
            x2={HUB.x}
            y2={HUB.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF6D4A" />
            <stop offset="100%" stopColor="#FFBE85" />
          </linearGradient>
          <linearGradient
            id="routeRight"
            x1={HUB.x}
            y1={HUB.y}
            x2={RIGHT_ANCHOR.x}
            y2={RIGHT_ANCHOR.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#9BEFFF" />
            <stop offset="100%" stopColor="#3ECDF4" />
          </linearGradient>
          <radialGradient id="hubSurface" cx="38%" cy="30%" r="74%">
            <stop offset="0%" stopColor="#304C6B" />
            <stop offset="45%" stopColor="#17283E" />
            <stop offset="100%" stopColor="#0B1423" />
          </radialGradient>
          <linearGradient id="panelBorder" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9E7B" stopOpacity="0.5" />
            <stop offset="42%" stopColor="#9BAED2" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#68E4FF" stopOpacity="0.48" />
          </linearGradient>
          <linearGradient id="panelSurface" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1B273C" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#101827" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="barProgress" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF7452" />
            <stop offset="48%" stopColor="#FFC08A" />
            <stop offset="52%" stopColor="#9CEFFF" />
            <stop offset="100%" stopColor="#43D5F7" />
          </linearGradient>
          <linearGradient id="barSuccess" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8EDF6A" />
            <stop offset="100%" stopColor="#D2FF8D" />
          </linearGradient>
          <linearGradient id="closingLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF815F" stopOpacity="0" />
            <stop offset="24%" stopColor="#FF815F" />
            <stop offset="76%" stopColor="#5DDEFF" />
            <stop offset="100%" stopColor="#5DDEFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="chipWarm" cx="33%" cy="26%" r="74%">
            <stop offset="0%" stopColor="#FFD5BE" />
            <stop offset="43%" stopColor="#FF956E" />
            <stop offset="100%" stopColor="#B33B31" />
          </radialGradient>
          <radialGradient id="chipCool" cx="33%" cy="26%" r="74%">
            <stop offset="0%" stopColor="#E4FBFF" />
            <stop offset="43%" stopColor="#63DCF7" />
            <stop offset="100%" stopColor="#167FA7" />
          </radialGradient>
          <filter id="identityShadow" x="-50%" y="-70%" width="200%" height="240%">
            <feDropShadow
              dx="0"
              dy="20"
              stdDeviation="22"
              floodColor="#01050C"
              floodOpacity="0.68"
            />
          </filter>
          <filter id="routeBloom" x="-40%" y="-220%" width="180%" height="540%">
            <feGaussianBlur stdDeviation="17" />
          </filter>
          <filter id="hubShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow
              dx="0"
              dy="14"
              stdDeviation="18"
              floodColor="#02050D"
              floodOpacity="0.74"
            />
          </filter>
          <filter id="chipBloom" x="-220%" y="-220%" width="540%" height="540%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="panelShadow" x="-60%" y="-80%" width="220%" height="260%">
            <feDropShadow
              dx="0"
              dy="28"
              stdDeviation="28"
              floodColor="#01040B"
              floodOpacity="0.74"
            />
          </filter>
          <filter id="particleBloom" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        <RouteSystem />
        <IdentityCard
          x={350}
          y={355}
          startFrame={8}
          accent="#FF805E"
          accentDark="#5A2630"
          initials="AN"
          name="Aisha Noor"
          role="Personal account"
          side="left"
        />
        <IdentityCard
          x={1570}
          y={355}
          startFrame={17}
          accent="#52D9F8"
          accentDark="#17445B"
          initials="DA"
          name="Diego Alvarez"
          role="Verified recipient"
          side="right"
          success={success}
        />
        <VerificationHub />
        {[0, 1, 2, 3].map((index) => (
          <TransferChip key={index} index={index} />
        ))}
        <SettlementPanel />
        <SuccessMoment />
        <ClosingCopy />
      </svg>
    </AbsoluteFill>
  );
};
