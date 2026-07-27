import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#eef2f0",
  paperWarm: "#f7f4ec",
  glass: "#fbfdfb",
  navy: "#102b3a",
  navySoft: "#2f5363",
  slate: "#6b828b",
  line: "#c8d5d4",
  lineDark: "#a8b9b9",
  cyan: "#32acd1",
  cyanDark: "#137a9b",
  mint: "#26c98d",
  mintDark: "#13835e",
  amber: "#f2aa38",
  coral: "#f05e69",
  coralDark: "#ae303e",
  white: "#ffffff",
};

const FONT =
  "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

const progress = (
  frame: number,
  start: number,
  end: number,
  easing = Easing.out(Easing.cubic),
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

const windowOpacity = (
  frame: number,
  start: number,
  end: number,
  feather = 18,
) => {
  if (frame < start || frame > end) return 0;
  const fadeIn = interpolate(frame, [start, start + feather], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [end - feather, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return Math.min(fadeIn, fadeOut);
};

const seeded = (value: number) => {
  const x = Math.sin(value * 91.731 + 17.13) * 43758.5453;
  return x - Math.floor(x);
};

type Point = {x: number; y: number};

const cubicPoint = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
) => {
  const mt = 1 - t;
  return {
    x:
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x,
    y:
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y,
  };
};

const polar = (cx: number, cy: number, r: number, degrees: number) => {
  const angle = ((degrees - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle)};
};

const annularSegmentPath = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
) => {
  const a = polar(cx, cy, outer, start);
  const b = polar(cx, cy, outer, end);
  const c = polar(cx, cy, inner, end);
  const d = polar(cx, cy, inner, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${a.x} ${a.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y}`,
    `L ${c.x} ${c.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y}`,
    "Z",
  ].join(" ");
};

const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 48%, #ffffff 0%, #f4f6f2 34%, #e5ecea 72%, #dce5e4 100%)",
        overflow: "hidden",
      }}
    >
      <svg width="1920" height="1080" style={{position: "absolute", inset: 0}}>
        <defs>
          <pattern
            id="micro-grid"
            width="44"
            height="44"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M44 0H0V44"
              fill="none"
              stroke={C.navy}
              strokeOpacity={0.055}
              strokeWidth={1}
            />
            <circle cx={0} cy={0} r={1.3} fill={C.navy} opacity={0.09} />
          </pattern>
          <radialGradient id="floor-light" cx="50%" cy="48%" r="57%">
            <stop offset="0%" stopColor={C.white} stopOpacity={0.9} />
            <stop offset="62%" stopColor={C.cyan} stopOpacity={0.035} />
            <stop offset="100%" stopColor={C.navy} stopOpacity={0.025} />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#micro-grid)" />
        <rect width="1920" height="1080" fill="url(#floor-light)" />
        <circle
          cx={960}
          cy={552}
          r={430}
          fill="none"
          stroke={C.navy}
          strokeOpacity={0.045}
          strokeWidth={1}
        />
        <circle
          cx={960}
          cy={552}
          r={500}
          fill="none"
          stroke={C.navy}
          strokeOpacity={0.028}
          strokeWidth={1}
          strokeDasharray="5 12"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: 15,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.mint}, ${C.amber}, ${C.coral})`,
          opacity: 0.82,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 80,
          background:
            "linear-gradient(180deg, rgba(16,43,58,0), rgba(16,43,58,0.055))",
        }}
      />
    </AbsoluteFill>
  );
};

const Avatar: React.FC<{
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity?: number;
}> = ({cx, cy, r, color, opacity = 1}) => {
  return (
    <g opacity={opacity}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeOpacity={0.55}
        strokeWidth={2}
      />
      <circle cx={cx} cy={cy - r * 0.25} r={r * 0.25} fill={color} />
      <path
        d={`M ${cx - r * 0.5} ${cy + r * 0.5} C ${cx - r * 0.46} ${
          cy + r * 0.08
        }, ${cx + r * 0.46} ${cy + r * 0.08}, ${cx + r * 0.5} ${
          cy + r * 0.5
        } Z`}
        fill={color}
      />
    </g>
  );
};

const Lock: React.FC<{
  x: number;
  y: number;
  size: number;
  closed: number;
  color: string;
}> = ({x, y, size, closed, color}) => {
  const shackleY = interpolate(closed, [0, 1], [size * 0.18, size * 0.34]);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M ${size * 0.25} ${size * 0.46} V ${shackleY} C ${
          size * 0.25
        } ${-size * 0.06}, ${size * 0.75} ${-size * 0.06}, ${
          size * 0.75
        } ${shackleY} V ${size * 0.46}`}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.11}
        strokeLinecap="round"
      />
      <rect
        x={size * 0.12}
        y={size * 0.42}
        width={size * 0.76}
        height={size * 0.56}
        rx={size * 0.13}
        fill={color}
      />
      <circle
        cx={size * 0.5}
        cy={size * 0.67}
        r={size * 0.075}
        fill={C.white}
        opacity={0.94}
      />
      <rect
        x={size * 0.465}
        y={size * 0.69}
        width={size * 0.07}
        height={size * 0.15}
        rx={size * 0.035}
        fill={C.white}
        opacity={0.94}
      />
    </g>
  );
};

type ResourceKind = "cloud" | "mail" | "finance" | "admin";

const ResourceIcon: React.FC<{
  kind: ResourceKind;
  x: number;
  y: number;
  color: string;
}> = ({kind, x, y, color}) => {
  if (kind === "cloud") {
    return (
      <g
        transform={`translate(${x} ${y})`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 43 C2 39, 3 25, 14 22 C17 7, 38 5, 45 18 C58 15, 66 24, 64 34 C63 42, 56 47, 46 47 H15 C13 47, 11 46, 10 43" />
      </g>
    );
  }
  if (kind === "mail") {
    return (
      <g
        transform={`translate(${x} ${y})`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x={4} y={10} width={60} height={44} rx={8} />
        <path d="M8 16 L34 36 L60 16" />
      </g>
    );
  }
  if (kind === "finance") {
    return (
      <g
        transform={`translate(${x} ${y})`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 21 L34 7 L63 21 Z" />
        <path d="M10 25 H58 M12 53 H56 M18 27 V51 M34 27 V51 M50 27 V51" />
      </g>
    );
  }
  return (
    <g
      transform={`translate(${x} ${y})`}
      fill="none"
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={7} y={8} width={55} height={48} rx={8} />
      <path d="M23 24 L15 32 L23 40 M46 24 L54 32 L46 40 M31 44 L39 20" />
    </g>
  );
};

type Resource = {
  x: number;
  y: number;
  label: string;
  kind: ResourceKind;
  side: "left" | "right";
  path: [Point, Point, Point, Point];
};

const RESOURCES: Resource[] = [
  {
    x: 105,
    y: 266,
    label: "CLOUD FILES",
    kind: "cloud",
    side: "left",
    path: [
      {x: 435, y: 341},
      {x: 590, y: 341},
      {x: 660, y: 410},
      {x: 785, y: 438},
    ],
  },
  {
    x: 105,
    y: 736,
    label: "EMAIL SERVICE",
    kind: "mail",
    side: "left",
    path: [
      {x: 435, y: 811},
      {x: 590, y: 811},
      {x: 660, y: 692},
      {x: 785, y: 660},
    ],
  },
  {
    x: 1485,
    y: 266,
    label: "FINANCE DATA",
    kind: "finance",
    side: "right",
    path: [
      {x: 1485, y: 341},
      {x: 1325, y: 341},
      {x: 1255, y: 410},
      {x: 1135, y: 438},
    ],
  },
  {
    x: 1485,
    y: 736,
    label: "ADMIN CONSOLE",
    kind: "admin",
    side: "right",
    path: [
      {x: 1485, y: 811},
      {x: 1325, y: 811},
      {x: 1255, y: 692},
      {x: 1135, y: 660},
    ],
  },
];

const ResourceCard: React.FC<{
  resource: Resource;
  index: number;
  frame: number;
}> = ({resource, index, frame}) => {
  const enter = progress(frame, 48 + index * 13, 138 + index * 13);
  const risk = progress(frame, 344, 500);
  const revoked = progress(
    frame,
    650 + index * 34,
    730 + index * 34,
    Easing.inOut(Easing.cubic),
  );
  const settle = progress(frame, 790, 900);
  const yOffset = interpolate(enter, [0, 1], [26, 0]);
  const xOffset =
    interpolate(enter, [0, 1], [resource.side === "left" ? -38 : 38, 0]) *
    (1 - enter);
  const outline = interpolateColors(
    Math.max(risk * (1 - revoked), revoked),
    [0, 0.55, 1],
    [C.mint, C.amber, C.navy],
  );
  const iconColor = interpolateColors(
    revoked,
    [0, 0.72, 1],
    [risk > 0.55 ? C.coral : C.cyanDark, C.coral, C.navy],
  );
  const flash =
    revoked > 0 && revoked < 1
      ? 0.5 + 0.5 * Math.sin(frame * 0.32 + index)
      : 0;
  const connectedOpacity = interpolate(revoked, [0, 0.24], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lockedOpacity = interpolate(revoked, [0.48, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelFontSize =
    resource.label.length >= 13
      ? 20
      : resource.label.length >= 12
        ? 22
        : 24;

  return (
    <g
      transform={`translate(${resource.x + xOffset} ${
        resource.y + yOffset
      })`}
      opacity={enter}
    >
      <rect
        x={8}
        y={14}
        width={330}
        height={150}
        rx={25}
        fill={C.navy}
        opacity={0.12}
        filter="url(#card-shadow)"
      />
      <rect
        x={0}
        y={0}
        width={330}
        height={150}
        rx={25}
        fill={C.glass}
        fillOpacity={0.94}
        stroke={outline}
        strokeWidth={interpolate(revoked, [0, 0.5, 1], [2.5, 5, 3])}
      />
      <rect
        x={15}
        y={15}
        width={94}
        height={120}
        rx={18}
        fill={iconColor}
        fillOpacity={0.09 + flash * 0.06}
      />
      <ResourceIcon kind={resource.kind} x={28} y={42} color={iconColor} />
      <text
        x={126}
        y={62}
        fill={C.navy}
        fontFamily={FONT}
        fontSize={labelFontSize}
        fontWeight={800}
        letterSpacing={0.1}
      >
        {resource.label}
      </text>
      <g opacity={connectedOpacity}>
        <circle cx={137} cy={103} r={6} fill={risk > 0.62 ? C.amber : C.mint} />
        <text
          x={153}
          y={110}
          fill={risk > 0.62 ? C.coralDark : C.mintDark}
          fontFamily={FONT}
          fontSize={19}
          fontWeight={800}
          letterSpacing={1.4}
        >
          {risk > 0.62 ? "CHECKING" : "CONNECTED"}
        </text>
      </g>
      <g opacity={lockedOpacity}>
        <Lock
          x={270}
          y={78}
          size={44}
          closed={lockedOpacity}
          color={C.navy}
        />
        <circle cx={137} cy={103} r={6} fill={C.navy} />
        <text
          x={153}
          y={110}
          fill={C.navy}
          fontFamily={FONT}
          fontSize={19}
          fontWeight={900}
          letterSpacing={1.7}
        >
          LOCKED
        </text>
      </g>
      <rect
        x={4}
        y={4}
        width={322}
        height={142}
        rx={21}
        fill="none"
        stroke={C.white}
        strokeOpacity={0.72 - settle * 0.18}
        strokeWidth={1.5}
      />
    </g>
  );
};

const ConnectionRibbon: React.FC<{
  resource: Resource;
  index: number;
  frame: number;
}> = ({resource, index, frame}) => {
  const [p0, p1, p2, p3] = resource.path;
  const path = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
  const draw = progress(frame, 92 + index * 14, 188 + index * 14);
  const risk = progress(frame, 350, 510);
  const revoked = progress(
    frame,
    650 + index * 34,
    730 + index * 34,
    Easing.inOut(Easing.cubic),
  );
  const visible = Math.max(0.0001, draw * (1 - revoked));
  const tokenOpacity = draw * (1 - revoked) * (1 - progress(frame, 510, 610));
  const t1 = (frame * 0.008 + index * 0.22) % 1;
  const t2 = (t1 + 0.42) % 1;
  const token1 = cubicPoint(p0, p1, p2, p3, t1);
  const token2 = cubicPoint(p0, p1, p2, p3, t2);
  const activeColor = interpolateColors(risk, [0, 0.62, 1], [
    C.mint,
    C.amber,
    C.coral,
  ]);
  const cutT = Math.max(0, 0.96 - revoked * 0.82);
  const cutPoint = cubicPoint(p0, p1, p2, p3, cutT);
  const cutOpacity = Math.sin(Math.PI * revoked);

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={C.lineDark}
        strokeOpacity={0.48 * draw}
        strokeWidth={19}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={C.white}
        strokeOpacity={0.72 * draw}
        strokeWidth={13}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${visible} 1`}
      />
      <path
        d={path}
        fill="none"
        stroke={activeColor}
        strokeOpacity={0.96}
        strokeWidth={8}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${visible} 1`}
      />
      {[token1, token2].map((point, tokenIndex) => (
        <g
          key={tokenIndex}
          opacity={tokenOpacity}
          transform={`translate(${point.x} ${point.y})`}
        >
          <circle r={11} fill={C.white} opacity={0.95} />
          <circle r={7} fill={activeColor} />
          <circle r={17} fill="none" stroke={activeColor} strokeOpacity={0.2} />
        </g>
      ))}
      <g
        opacity={cutOpacity}
        transform={`translate(${cutPoint.x} ${cutPoint.y}) rotate(45)`}
      >
        <circle r={22} fill={C.white} stroke={C.coral} strokeWidth={3} />
        <path
          d="M-9 0 H9 M0 -9 V9"
          stroke={C.coralDark}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

const Iris: React.FC<{frame: number}> = ({frame}) => {
  const appear = progress(frame, 36, 150);
  const risk = progress(frame, 350, 510);
  const check = progress(frame, 500, 640, Easing.inOut(Easing.cubic));
  const revoke = progress(frame, 640, 820, Easing.inOut(Easing.cubic));
  const inner = interpolate(check, [0, 1], [328, 253]);
  const rotation = interpolate(frame, [0, 1200], [0, 36]);
  const segmentColor = interpolateColors(Math.max(risk * 0.84, revoke), [
    0,
    0.52,
    1,
  ], [C.cyan, C.amber, C.coral]);
  const ringPulse = risk > 0.1 && revoke < 1
    ? 0.5 + 0.5 * Math.sin(frame * 0.22)
    : 0;

  return (
    <g opacity={appear}>
      <circle
        cx={960}
        cy={548}
        r={373}
        fill={C.white}
        fillOpacity={0.23}
        stroke={C.white}
        strokeOpacity={0.8}
        strokeWidth={2}
      />
      <circle
        cx={960}
        cy={548}
        r={356}
        fill="none"
        stroke={segmentColor}
        strokeOpacity={0.25 + ringPulse * 0.18}
        strokeWidth={2 + ringPulse * 2}
      />
      {Array.from({length: 12}, (_, index) => {
        const start = index * 30 + 3;
        const end = index * 30 + 27;
        const stagger = progress(frame, 44 + index * 3, 125 + index * 3);
        const localRotate =
          rotation + index * 0.18 + Math.sin(frame * 0.012 + index) * 0.45;
        return (
          <path
            key={index}
            d={annularSegmentPath(960, 548, 348, inner, start, end)}
            fill={segmentColor}
            fillOpacity={0.085 + risk * 0.13 + revoke * 0.11}
            stroke={segmentColor}
            strokeOpacity={0.34 + risk * 0.34}
            strokeWidth={1.8}
            opacity={stagger}
            transform={`rotate(${localRotate} 960 548)`}
          />
        );
      })}
      <circle
        cx={960}
        cy={548}
        r={inner - 10}
        fill="none"
        stroke={segmentColor}
        strokeOpacity={0.24 + check * 0.43}
        strokeWidth={2}
        strokeDasharray="7 11"
        transform={`rotate(${-rotation * 2} 960 548)`}
      />
      {risk > 0 ? (
        <>
          <circle
            cx={960}
            cy={548}
            r={interpolate(check, [0, 1], [420, 282])}
            fill="none"
            stroke={segmentColor}
            strokeWidth={3}
            strokeOpacity={(1 - check) * 0.42}
          />
          <circle
            cx={960}
            cy={548}
            r={interpolate(check, [0, 1], [465, 302])}
            fill="none"
            stroke={segmentColor}
            strokeWidth={1.5}
            strokeOpacity={(1 - check) * 0.24}
          />
        </>
      ) : null}
    </g>
  );
};

/*
 * FingerprintPattern paths from Lucide Static v1.27.0.
 * Source: https://lucide.dev/icons/fingerprint-pattern
 * ISC License — Copyright (c) 2026 Lucide Icons and Contributors.
 * Permission to use, copy, modify, and/or distribute for any purpose with or
 * without fee is granted when this copyright and permission notice is kept.
 */
const FingerprintPattern: React.FC<{
  x: number;
  y: number;
  risk: number;
}> = ({x, y, risk}) => {
  const color = interpolateColors(risk, [0, 0.55, 1], [
    C.cyanDark,
    C.amber,
    C.coral,
  ]);
  return (
    <g
      transform={`translate(${x} ${y}) scale(2.65)`}
      fill="none"
      stroke={color}
      strokeWidth={1.28}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
      <path d="M8.65 22c.21-.66.45-1.32.57-2" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </g>
  );
};

const CredentialCard: React.FC<{frame: number}> = ({frame}) => {
  const enter = progress(frame, 50, 145);
  const risk = progress(frame, 350, 505, Easing.inOut(Easing.cubic));
  const check = progress(frame, 500, 640, Easing.inOut(Easing.cubic));
  const revoke = progress(frame, 640, 820, Easing.inOut(Easing.cubic));
  const settled = progress(frame, 820, 910);
  const score = Math.round(interpolate(risk, [0, 1], [12, 94]));
  const cardStroke = interpolateColors(Math.max(risk, revoke), [0, 0.55, 1], [
    C.cyan,
    C.amber,
    C.coral,
  ]);
  const scale = interpolate(enter, [0, 1], [0.88, 1]);
  const tilt = interpolate(enter, [0, 1], [-5, 0]);
  const scanY = 40 + ((frame * 2.35) % 330);
  const statusColor = interpolateColors(risk, [0, 0.55, 1], [
    C.mint,
    C.amber,
    C.coral,
  ]);
  const stamp = progress(frame, 760, 835, Easing.out(Easing.back(1.4)));
  const detailOpacity = 1 - progress(frame, 778, 824);

  return (
    <g
      opacity={enter}
      transform={`translate(960 548) scale(${scale}) rotate(${tilt}) translate(-960 -548)`}
    >
      <rect
        x={792}
        y={344}
        width={360}
        height={430}
        rx={34}
        fill={C.navy}
        opacity={0.16}
        filter="url(#card-shadow)"
      />
      <rect
        x={780}
        y={330}
        width={360}
        height={430}
        rx={34}
        fill={C.glass}
        fillOpacity={0.965}
        stroke={cardStroke}
        strokeWidth={interpolate(check, [0, 1], [3, 6])}
      />
      <rect
        x={796}
        y={346}
        width={328}
        height={398}
        rx={25}
        fill="none"
        stroke={C.white}
        strokeWidth={2}
        strokeOpacity={0.86}
      />
      <rect
        x={780}
        y={330}
        width={360}
        height={79}
        rx={34}
        fill={C.navy}
      />
      <rect x={780} y={376} width={360} height={33} fill={C.navy} />
      <circle cx={818} cy={370} r={7} fill={statusColor} />
      <text
        x={840}
        y={377}
        fill={C.white}
        fontFamily={FONT}
        fontSize={14}
        fontWeight={800}
        letterSpacing={1.1}
      >
        IDENTITY CREDENTIAL
      </text>
      <rect
        x={1064}
        y={352}
        width={58}
        height={35}
        rx={11}
        fill={C.white}
        fillOpacity={0.1}
        stroke={C.white}
        strokeOpacity={0.22}
      />
      <text
        x={1093}
        y={375.5}
        fill={C.white}
        fillOpacity={0.78}
        fontFamily={FONT}
        fontSize={14}
        fontWeight={850}
        textAnchor="middle"
        letterSpacing={0.8}
      >
        7A41
      </text>

      <Avatar
        cx={852}
        cy={484}
        r={49}
        color={risk > 0.62 ? C.coral : C.cyanDark}
      />
      <text
        x={920}
        y={467}
        fill={C.slate}
        fontFamily={FONT}
        fontSize={12.8}
        fontWeight={800}
        letterSpacing={0.85}
      >
        WORKFORCE IDENTITY
      </text>
      <text
        x={920}
        y={506}
        fill={C.navy}
        fontFamily={FONT}
        fontSize={31}
        fontWeight={900}
      >
        USER 7A41
      </text>
      <text
        x={920}
        y={537}
        fill={C.slate}
        fontFamily={FONT}
        fontSize={16.5}
        fontWeight={650}
      >
        PRIVILEGED ACCESS
      </text>

      <rect
        x={813}
        y={568}
        width={294}
        height={88}
        rx={18}
        fill={statusColor}
        fillOpacity={0.09}
        stroke={statusColor}
        strokeOpacity={0.42}
        strokeWidth={2}
      />
      <text
        x={835}
        y={600}
        fill={C.slate}
        fontFamily={FONT}
        fontSize={16}
        fontWeight={800}
        letterSpacing={1.4}
      >
        IDENTITY RISK
      </text>
      <text
        x={835}
        y={638}
        fill={statusColor}
        fontFamily={FONT}
        fontSize={risk >= 0.5 && risk < 0.88 ? 30 : 35}
        fontWeight={900}
      >
        {risk < 0.5 ? "LOW" : risk < 0.88 ? "ELEVATED" : "CRITICAL"}
      </text>
      <text
        x={1082}
        y={634}
        fill={statusColor}
        fontFamily={FONT}
        fontSize={44}
        fontWeight={900}
        textAnchor="end"
      >
        {score}
      </text>

      <g opacity={detailOpacity}>
        <rect
          x={812}
          y={666}
          width={92}
          height={72}
          rx={17}
          fill={statusColor}
          fillOpacity={0.075}
          stroke={statusColor}
          strokeOpacity={0.2}
          strokeWidth={1.5}
        />
        <FingerprintPattern x={826} y={670} risk={risk} />
        <g transform="translate(914 682)">
          {[
            ["DEVICE", risk < 0.55 ? "MANAGED" : "UNKNOWN"],
            ["LOCATION", risk < 0.55 ? "VERIFIED" : "MISMATCH"],
            ["TOKEN", risk < 0.55 ? "VALID" : "REUSED"],
          ].map(([label, value], index) => (
            <g key={label} transform={`translate(0 ${index * 29})`}>
              <text
                x={0}
                y={0}
                fill={C.slate}
                fontFamily={FONT}
                fontSize={12.5}
                fontWeight={750}
                letterSpacing={0.85}
              >
                {label}
              </text>
              <text
                x={196}
                y={0}
                fill={risk < 0.55 ? C.mintDark : C.coralDark}
                fontFamily={FONT}
                fontSize={13.2}
                fontWeight={900}
                textAnchor="end"
                letterSpacing={0.55}
              >
                {value}
              </text>
            </g>
          ))}
        </g>
      </g>

      <g opacity={(1 - check) * 0.075}>
        <rect
          x={786}
          y={scanY + 330}
          width={348}
          height={3}
          rx={2}
          fill={C.cyan}
        />
      </g>

      <g
        opacity={stamp}
        transform={`translate(960 552) rotate(-8) scale(${interpolate(
          stamp,
          [0, 1],
          [1.22, 1],
        )}) translate(-960 -552)`}
      >
        <rect
          x={806}
          y={515}
          width={308}
          height={92}
          rx={15}
          fill={C.white}
          fillOpacity={0.94}
          stroke={C.coral}
          strokeWidth={6}
        />
        <text
          x={960}
          y={575}
          fill={C.coralDark}
          fontFamily={FONT}
          fontSize={42}
          fontWeight={950}
          letterSpacing={2.8}
          textAnchor="middle"
        >
          REVOKED
        </text>
      </g>

      <g opacity={settled * 0.78}>
        <rect
          x={800}
          y={704}
          width={320}
          height={42}
          rx={21}
          fill={C.navy}
        />
        <text
          x={960}
          y={732}
          fill={C.white}
          fontFamily={FONT}
          fontSize={17}
          fontWeight={900}
          letterSpacing={1.8}
          textAnchor="middle"
        >
          IDENTITY QUARANTINED
        </text>
      </g>
    </g>
  );
};

const EvidencePill: React.FC<{
  frame: number;
  start: number;
  end: number;
  x: number;
  y: number;
  label: string;
  icon: string;
}> = ({frame, start, end, x, y, label, icon}) => {
  const opacity = windowOpacity(frame, start, end, 18);
  const enter = progress(frame, start, start + 28, Easing.out(Easing.back(1.25)));
  const yOffset = interpolate(enter, [0, 1], [18, 0]);
  const isLongLabel = label.length > 14;
  const pillWidth = isLongLabel ? 280 : 246;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y + yOffset})`}>
      <rect
        x={6}
        y={9}
        width={pillWidth}
        height={64}
        rx={20}
        fill={C.navy}
        opacity={0.12}
        filter="url(#card-shadow)"
      />
      <rect
        x={0}
        y={0}
        width={pillWidth}
        height={64}
        rx={20}
        fill={C.white}
        stroke={C.coral}
        strokeWidth={2.5}
      />
      <circle cx={32} cy={32} r={18} fill={C.coral} fillOpacity={0.12} />
      <text
        x={32}
        y={40}
        fill={C.coralDark}
        fontFamily={FONT}
        fontSize={22}
        fontWeight={900}
        textAnchor="middle"
      >
        {icon}
      </text>
      <text
        x={62}
        y={40}
        fill={C.navy}
        fontFamily={FONT}
        fontSize={isLongLabel ? 16.5 : 18}
        fontWeight={900}
        letterSpacing={isLongLabel ? 0.45 : 0.75}
      >
        {label}
      </text>
    </g>
  );
};

type Phase = {
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  color: string;
};

const PHASES: Phase[] = [
  {
    start: 80,
    end: 318,
    eyebrow: "AUTONOMOUS ZERO-TRUST",
    title: "CONTINUOUS ACCESS VERIFIED",
    subtitle: "Every request is evaluated before protected resources respond",
    color: C.mintDark,
  },
  {
    start: 330,
    end: 498,
    eyebrow: "BEHAVIOR ANALYTICS",
    title: "RISK SIGNAL DETECTED",
    subtitle: "Unfamiliar device  •  impossible travel  •  token reuse",
    color: C.coralDark,
  },
  {
    start: 510,
    end: 635,
    eyebrow: "REAL-TIME POLICY ENGINE",
    title: "ZERO-TRUST POLICY CHECK",
    subtitle: "Trust is never assumed — each signal is verified",
    color: C.amber,
  },
  {
    start: 650,
    end: 838,
    eyebrow: "AUTONOMOUS RESPONSE",
    title: "REVOKING EVERY ACTIVE SESSION",
    subtitle: "Permissions retract while access tokens are invalidated",
    color: C.coralDark,
  },
  {
    start: 850,
    end: 1004,
    eyebrow: "SELECTIVE CONTAINMENT",
    title: "HEALTHY WORKFORCE UNAFFECTED",
    subtitle: "Only the compromised identity is isolated",
    color: C.mintDark,
  },
];

const PhaseHeader: React.FC<{frame: number}> = ({frame}) => {
  return (
    <>
      {PHASES.map((phase) => {
        const opacity = windowOpacity(frame, phase.start, phase.end, 16);
        const enter = progress(frame, phase.start, phase.start + 28);
        const y = interpolate(enter, [0, 1], [16, 0]);
        return (
          <div
            key={phase.title}
            style={{
              position: "absolute",
              left: 420,
              top: 50 + y,
              width: 1080,
              textAlign: "center",
              opacity,
            }}
          >
            <div
              style={{
                color: phase.color,
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 4.2,
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {phase.eyebrow}
            </div>
            <div
              style={{
                color: C.navy,
                fontFamily: FONT,
                fontSize: 53,
                fontWeight: 950,
                letterSpacing: -1.5,
                lineHeight: 1.02,
              }}
            >
              {phase.title}
            </div>
            <div
              style={{
                color: C.slate,
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 650,
                letterSpacing: 0.2,
                lineHeight: 1.25,
                marginTop: 12,
              }}
            >
              {phase.subtitle}
            </div>
          </div>
        );
      })}
    </>
  );
};

const HealthyAccessBanner: React.FC<{frame: number}> = ({frame}) => {
  const opacity = windowOpacity(frame, 842, 1000, 24);
  const width = 790;
  const healthyPulse = 0.5 + 0.5 * Math.sin(frame * 0.08);
  return (
    <g opacity={opacity}>
      <rect
        x={960 - width / 2}
        y={936}
        width={width}
        height={86}
        rx={30}
        fill={C.white}
        fillOpacity={0.96}
        stroke={C.mint}
        strokeWidth={3}
        filter="url(#card-shadow)"
      />
      {[0, 1, 2].map((index) => (
        <Avatar
          key={index}
          cx={662 + index * 52}
          cy={979}
          r={22}
          color={C.mintDark}
          opacity={0.72 + healthyPulse * 0.18}
        />
      ))}
      <text
        x={842}
        y={971}
        fill={C.navy}
        fontFamily={FONT}
        fontSize={23}
        fontWeight={900}
        letterSpacing={0.3}
      >
        142 HEALTHY SESSIONS CONTINUE
      </text>
      <text
        x={842}
        y={999}
        fill={C.mintDark}
        fontFamily={FONT}
        fontSize={18}
        fontWeight={800}
        letterSpacing={1.6}
      >
        BUSINESS ACCESS REMAINS AVAILABLE
      </text>
      <circle cx={1330} cy={978} r={19} fill={C.mint} />
      <path
        d="M1321 978 L1327 984 L1340 970"
        fill="none"
        stroke={C.white}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

const FinalPayoff: React.FC<{frame: number}> = ({frame}) => {
  const opacity = windowOpacity(frame, 1008, 1152, 22);
  const enter = progress(frame, 1008, 1045, Easing.out(Easing.back(1.1)));
  const titleScale = interpolate(enter, [0, 1], [0.92, 1]);
  const metrics = [
    ["04", "PERMISSIONS REMOVED"],
    ["03", "SESSIONS ENDED"],
    ["00", "ACTIVE TOKENS"],
  ];
  return (
    <g opacity={opacity}>
      <rect
        x={310}
        y={52}
        width={1300}
        height={175}
        rx={38}
        fill={C.white}
        fillOpacity={0.97}
        stroke={C.navy}
        strokeOpacity={0.13}
        strokeWidth={2}
        filter="url(#card-shadow)"
      />
      <g
        transform={`translate(960 129) scale(${titleScale}) translate(-960 -129)`}
      >
        <circle cx={535} cy={132} r={42} fill={C.mint} />
        <path
          d="M515 132 L529 146 L556 116"
          fill="none"
          stroke={C.white}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={600}
          y={141}
          fill={C.navy}
          fontFamily={FONT}
          fontSize={78}
          fontWeight={950}
          letterSpacing={-2.2}
        >
          ACCESS REVOKED
        </text>
      </g>
      <text
        x={960}
        y={192}
        fill={C.slate}
        fontFamily={FONT}
        fontSize={23}
        fontWeight={700}
        textAnchor="middle"
        letterSpacing={0.3}
      >
        Compromised identity contained • protected resources secured
      </text>

      <rect
        x={420}
        y={880}
        width={1080}
        height={132}
        rx={32}
        fill={C.navy}
        filter="url(#card-shadow)"
      />
      {metrics.map(([value, label], index) => {
        const x = 600 + index * 360;
        const stagger = progress(frame, 1028 + index * 14, 1070 + index * 14);
        return (
          <g key={label} opacity={stagger}>
            {index > 0 ? (
              <line
                x1={x - 180}
                y1={906}
                x2={x - 180}
                y2={986}
                stroke={C.white}
                strokeOpacity={0.16}
              />
            ) : null}
            <text
              x={x}
              y={946}
              fill={index === 2 ? C.mint : C.white}
              fontFamily={FONT}
              fontSize={46}
              fontWeight={950}
              textAnchor="middle"
            >
              {value}
            </text>
            <text
              x={x}
              y={978}
              fill={C.white}
              fillOpacity={0.7}
              fontFamily={FONT}
              fontSize={16}
              fontWeight={850}
              textAnchor="middle"
              letterSpacing={1.55}
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const CornerLabel: React.FC<{frame: number}> = ({frame}) => {
  const opacity = windowOpacity(frame, 40, 1158, 30);
  return (
    <div
      style={{
        position: "absolute",
        left: 74,
        top: 64,
        display: "flex",
        alignItems: "center",
        gap: 13,
        opacity,
      }}
    >
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: C.cyan,
          boxShadow: `0 0 0 7px rgba(50,172,209,0.12)`,
        }}
      />
      <div
        style={{
          color: C.navy,
          fontFamily: FONT,
          fontSize: 19,
          fontWeight: 900,
          letterSpacing: 2.1,
        }}
      >
        IDENTITY SECURITY
      </div>
    </div>
  );
};

const DecorativeDots: React.FC<{frame: number}> = ({frame}) => {
  return (
    <svg width="1920" height="1080" style={{position: "absolute", inset: 0}}>
      {Array.from({length: 24}, (_, index) => {
        const angle = seeded(index + 2) * Math.PI * 2;
        const radius = 440 + seeded(index + 91) * 340;
        const x = 960 + Math.cos(angle) * radius;
        const y = 550 + Math.sin(angle) * radius * 0.58;
        const drift = Math.sin(frame * 0.018 + index) * 6;
        return (
          <circle
            key={index}
            cx={x}
            cy={y + drift}
            r={1.8 + seeded(index + 55) * 2.1}
            fill={index % 4 === 0 ? C.cyan : C.navy}
            opacity={0.08 + seeded(index + 10) * 0.1}
          />
        );
      })}
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const globalOpacity = windowOpacity(frame, 0, durationInFrames - 1, 38);
  const riskPush = progress(frame, 335, 520, Easing.inOut(Easing.cubic));
  const pullBack = progress(frame, 850, 1005, Easing.inOut(Easing.cubic));
  const stageScale = interpolate(
    riskPush - pullBack,
    [-1, 0, 1],
    [0.988, 1, 1.034],
  );
  const finalDim = progress(frame, 1008, 1044) * 0.56;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{opacity: globalOpacity}}>
        <DecorativeDots frame={frame} />
        <svg width="1920" height="1080" style={{position: "absolute", inset: 0}}>
          <defs>
            <filter
              id="card-shadow"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="13" />
            </filter>
            <filter
              id="soft-shadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="24" />
            </filter>
          </defs>

          <g
            opacity={1 - finalDim}
            transform={`translate(960 555) scale(${stageScale}) translate(-960 -555)`}
          >
            <ellipse
              cx={960}
              cy={918}
              rx={350}
              ry={47}
              fill={C.navy}
              opacity={0.08}
              filter="url(#soft-shadow)"
            />
            {RESOURCES.map((resource, index) => (
              <ConnectionRibbon
                key={`ribbon-${resource.label}`}
                resource={resource}
                index={index}
                frame={frame}
              />
            ))}
            <Iris frame={frame} />
            {RESOURCES.map((resource, index) => (
              <ResourceCard
                key={resource.label}
                resource={resource}
                index={index}
                frame={frame}
              />
            ))}
            <CredentialCard frame={frame} />

            <EvidencePill
              frame={frame}
              start={348}
              end={632}
              x={570}
              y={278}
              label="NEW DEVICE"
              icon="!"
            />
            <EvidencePill
              frame={frame}
              start={378}
              end={632}
              x={1104}
              y={278}
              label="IMPOSSIBLE TRAVEL"
              icon="↗"
            />
            <EvidencePill
              frame={frame}
              start={408}
              end={632}
              x={837}
              y={817}
              label="TOKEN REUSE"
              icon="×"
            />
          </g>

          <HealthyAccessBanner frame={frame} />
          <FinalPayoff frame={frame} />
        </svg>
        <CornerLabel frame={frame} />
        <PhaseHeader frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
