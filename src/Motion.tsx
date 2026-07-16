import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const COLORS = {
  ink: "#02050d",
  cyan: "#2fe7ff",
  blue: "#1677ff",
  violet: "#7c3cff",
  magenta: "#ff28a8",
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

type FolderProps = {
  id: string;
  x: number;
  y: number;
  stacked?: boolean;
  floatY: number;
  reaction: number;
  glow: number;
  open?: number;
};

const backPanelPath =
  "M34 104 C31 82 47 66 70 66 H157 L183 31 C190 21 201 16 215 17 L325 22 C342 23 352 33 355 48 L359 66 H424 C448 66 462 83 459 105 L433 270 C430 291 415 303 394 303 H66 C44 303 31 289 31 267 Z";

const frontPanelPath =
  "M25 122 C22 98 39 84 64 87 L430 105 C453 106 465 123 461 146 L436 286 C432 307 417 319 395 319 H65 C41 319 28 305 27 283 Z";

const FolderBack: React.FC<FolderProps> = ({
  id,
  x,
  y,
  stacked = false,
  floatY,
  reaction,
  glow,
}) => {
  const layers = stacked
    ? [
        { dx: 31, dy: -38, a: "#ff2aa6", b: "#9c22e8", opacity: 0.94 },
        { dx: 18, dy: -23, a: "#aa45ff", b: "#4048de", opacity: 0.92 },
        { dx: 7, dy: -10, a: "#376fff", b: "#155db6", opacity: 0.96 },
      ]
    : [{ dx: 8, dy: -8, a: "#4653ec", b: "#164fb8", opacity: 0.96 }];

  return (
    <div
      style={{
        position: "absolute",
        left: x - 250,
        top: y - 190,
        width: 500,
        height: 360,
        transform: `translate3d(0, ${floatY + reaction * 5}px, 0) rotateZ(${reaction * 0.8}deg)`,
        transformOrigin: "50% 86%",
      }}
    >
      <svg width="500" height="360" viewBox="0 0 500 360" overflow="visible">
        <defs>
          <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
            <stop
              offset="0"
              stopColor={stacked ? COLORS.magenta : COLORS.cyan}
              stopOpacity="0.72"
            />
            <stop
              offset="0.42"
              stopColor={stacked ? COLORS.violet : COLORS.blue}
              stopOpacity="0.28"
            />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-main-back`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1acbe9" />
            <stop offset="0.5" stopColor="#1688cf" />
            <stop offset="1" stopColor="#173d85" />
          </linearGradient>
          {layers.map((layer, index) => (
            <linearGradient
              key={`${id}-gradient-${index}`}
              id={`${id}-layer-${index}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0" stopColor={layer.a} />
              <stop offset="1" stopColor={layer.b} />
            </linearGradient>
          ))}
          <filter
            id={`${id}-blur-strong`}
            x="-80%"
            y="-200%"
            width="260%"
            height="500%"
          >
            <feGaussianBlur stdDeviation="25" />
          </filter>
          <filter
            id={`${id}-blur-soft`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <ellipse
          cx="250"
          cy="310"
          rx={210 + glow * 35}
          ry={34 + glow * 8}
          fill={`url(#${id}-halo)`}
          opacity={0.5 + glow * 0.34}
          filter={`url(#${id}-blur-strong)`}
        />

        {layers.map((layer, index) => (
          <g
            key={`${id}-layer-shape-${index}`}
            transform={`translate(${layer.dx} ${layer.dy})`}
          >
            <path
              d={backPanelPath}
              fill={`url(#${id}-layer-${index})`}
              opacity={layer.opacity}
              stroke={index === 0 && stacked ? "#ff5fc2" : "#66ddff"}
              strokeOpacity="0.24"
              strokeWidth="1.5"
            />
            <path
              d="M60 78 H157 L183 43 H323"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.17"
              strokeWidth="2"
            />
          </g>
        ))}

        <path
          d={backPanelPath}
          fill={`url(#${id}-main-back)`}
          stroke="#6beeff"
          strokeOpacity="0.28"
          strokeWidth="1.4"
          transform="translate(0 3)"
        />
        <path
          d="M45 109 C124 92 350 95 448 112"
          fill="none"
          stroke="#7df2ff"
          strokeOpacity="0.35"
          strokeWidth="2"
          filter={`url(#${id}-blur-soft)`}
        />
      </svg>
    </div>
  );
};

const FolderFront: React.FC<FolderProps> = ({
  id,
  x,
  y,
  floatY,
  reaction,
  glow,
  open = 0,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 250,
        top: y - 190,
        width: 500,
        height: 360,
        transform: `perspective(1100px) translate3d(0, ${floatY - reaction * 6 + open * 17}px, 0) rotateX(${open * 8.5}deg) rotateZ(${-reaction * 1.15}deg) scaleX(${1 + Math.abs(reaction) * 0.008}) scaleY(${1 - Math.abs(reaction) * 0.012 - open * 0.025})`,
        transformOrigin: "50% 90%",
        filter: `brightness(${1 - open * 0.13}) saturate(${1 - open * 0.08})`,
      }}
    >
      <svg width="500" height="360" viewBox="0 0 500 360" overflow="visible">
        <defs>
          <linearGradient id={`${id}-front`} x1="0.02" y1="0" x2="0.95" y2="1">
            <stop offset="0" stopColor="#32def5" />
            <stop offset="0.36" stopColor="#18a9df" />
            <stop offset="0.72" stopColor="#1767b6" />
            <stop offset="1" stopColor="#173873" />
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d6fbff" stopOpacity="0.48" />
            <stop offset="0.38" stopColor="#5df1ff" stopOpacity="0.13" />
            <stop offset="1" stopColor="#1677ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-sheen`} cx="22%" cy="17%" r="85%">
            <stop offset="0" stopColor="#9cffff" stopOpacity="0.25" />
            <stop offset="0.48" stopColor="#4cd9ff" stopOpacity="0.05" />
            <stop offset="1" stopColor="#071938" stopOpacity="0" />
          </radialGradient>
          <filter
            id={`${id}-front-shadow`}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feDropShadow
              dx="0"
              dy="13"
              stdDeviation="16"
              floodColor="#01030a"
              floodOpacity="0.72"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation={7 + glow * 7}
              floodColor="#22d9ff"
              floodOpacity={0.18 + glow * 0.18}
            />
          </filter>
        </defs>

        <path
          d={frontPanelPath}
          fill={`url(#${id}-front)`}
          stroke="#4deaff"
          strokeOpacity={0.28 + glow * 0.25}
          strokeWidth="1.6"
          filter={`url(#${id}-front-shadow)`}
        />
        <path d={frontPanelPath} fill={`url(#${id}-sheen)`} />
        <path
          d="M42 125 C140 107 344 111 447 128"
          fill="none"
          stroke={`url(#${id}-rim)`}
          strokeWidth="2.4"
          opacity={0.7 + glow * 0.2}
        />
        <path
          d="M45 286 C153 300 330 300 420 285"
          fill="none"
          stroke="#081c44"
          strokeOpacity="0.62"
          strokeWidth="2"
        />
        <circle cx="69" cy="284" r="2.4" fill="#71f5ff" opacity="0.35" />
      </svg>
    </div>
  );
};

const FolderReflection: React.FC<{
  x: number;
  y: number;
  stacked?: boolean;
  floatY: number;
}> = ({ x, y, stacked = false, floatY }) => (
  <div
    style={{
      position: "absolute",
      left: x - 205,
      top: y + 137 - floatY * 0.25,
      width: 420,
      height: 230,
      opacity: 0.26,
      transform: `scaleY(-0.62) skewX(${stacked ? -2 : 2}deg)`,
      transformOrigin: "50% 50%",
      filter: "blur(4px)",
      WebkitMaskImage:
        "linear-gradient(to top, rgba(0,0,0,.88), transparent 88%)",
      maskImage: "linear-gradient(to top, rgba(0,0,0,.88), transparent 88%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "24px 28px 42px 42px",
        clipPath: "polygon(2% 14%, 98% 18%, 92% 92%, 9% 96%)",
        background: stacked
          ? "linear-gradient(110deg, #2de4ff 5%, #1475cb 50%, #eb28b6 100%)"
          : "linear-gradient(110deg, #35e5ff, #1263ba 72%, #2733a0)",
        boxShadow: `0 0 44px ${stacked ? "#ef28b9" : "#18bdf8"}`,
      }}
    />
  </div>
);

const TinyLabel: React.FC<{
  x: number;
  y: number;
  width: number;
  color: string;
}> = ({ x, y, width, color }) => (
  <rect x={x} y={y} width={width} height="3" rx="1.5" fill={color} />
);

const DocumentSurface: React.FC<{ variant: number; uid: string }> = ({
  variant,
  uid,
}) => {
  const wave = Array.from({ length: 28 }, (_, index) => {
    const x = 18 + index * 10.6;
    const base = variant === 0 ? 124 : 142;
    const y =
      base +
      Math.sin(index * 0.78 + random(`${uid}-wave-${index}`) * 1.6) *
        (variant === 0 ? 17 : 21) +
      (random(`${uid}-jitter-${index}`) - 0.5) * 9;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  if (variant === 0) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 330 220">
        <defs>
          <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f9fdff" />
            <stop offset="0.72" stopColor="#d9edf4" />
            <stop offset="1" stopColor="#a9c9d6" />
          </linearGradient>
          <pattern
            id={`${uid}-paper-grid`}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke="#4d7f91"
              strokeOpacity="0.12"
              strokeWidth="0.7"
            />
          </pattern>
          <filter
            id={`${uid}-paper-glow`}
            x="-20%"
            y="-40%"
            width="140%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="330" height="220" rx="8" fill={`url(#${uid}-paper)`} />
        <rect
          width="330"
          height="220"
          rx="8"
          fill={`url(#${uid}-paper-grid)`}
        />
        <rect
          x="15"
          y="14"
          width="68"
          height="8"
          rx="4"
          fill="#15384c"
          opacity="0.77"
        />
        <rect
          x="90"
          y="16"
          width="32"
          height="4"
          rx="2"
          fill="#4c7180"
          opacity="0.5"
        />
        <rect
          x="265"
          y="14"
          width="49"
          height="8"
          rx="4"
          fill="#1db6d1"
          opacity="0.56"
        />
        <line
          x1="15"
          y1="34"
          x2="315"
          y2="34"
          stroke="#2f6070"
          strokeOpacity="0.34"
        />
        {Array.from({ length: 9 }, (_, index) => (
          <g key={`${uid}-paper-row-${index}`}>
            <rect
              x="16"
              y={46 + index * 7.3}
              width={22 + random(`${uid}-a-${index}`) * 38}
              height="2.2"
              rx="1"
              fill="#416879"
              opacity="0.45"
            />
            <rect
              x="85"
              y={46 + index * 7.3}
              width={15 + random(`${uid}-b-${index}`) * 28}
              height="2.2"
              rx="1"
              fill="#8a5f83"
              opacity="0.36"
            />
            <rect
              x="133"
              y={46 + index * 7.3}
              width={18 + random(`${uid}-c-${index}`) * 37}
              height="2.2"
              rx="1"
              fill="#348a9e"
              opacity="0.44"
            />
          </g>
        ))}
        <rect
          x="207"
          y="44"
          width="107"
          height="68"
          rx="4"
          fill="#e7f2f5"
          stroke="#4f8191"
          strokeOpacity="0.35"
        />
        {Array.from({ length: 10 }, (_, index) => (
          <rect
            key={`${uid}-bar-${index}`}
            x={216 + index * 9.2}
            y={99 - random(`${uid}-bar-h-${index}`) * 40}
            width="5.5"
            height={8 + random(`${uid}-bar-h-${index}`) * 40}
            rx="1"
            fill={index % 3 === 0 ? "#d73586" : "#1ca8c6"}
            opacity="0.58"
          />
        ))}
        <rect
          x="15"
          y="118"
          width="300"
          height="82"
          rx="4"
          fill="#eaf5f7"
          fillOpacity="0.62"
          stroke="#3f7788"
          strokeOpacity="0.28"
        />
        <path
          d={wave}
          fill="none"
          stroke="#067f9b"
          strokeWidth="2.2"
          filter={`url(#${uid}-paper-glow)`}
        />
        <path
          d={`${wave} L 315 195 L 18 195 Z`}
          fill="#25bfd5"
          opacity="0.08"
        />
        <line
          x1="18"
          y1="176"
          x2="315"
          y2="176"
          stroke="#496f7c"
          strokeOpacity="0.2"
        />
        <TinyLabel x={19} y={205} width={47} color="#335b6b" />
        <TinyLabel x={72} y={205} width={26} color="#6d8a94" />
        <TinyLabel x={277} y={205} width={36} color="#2694a9" />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 330 220">
        <defs>
          <linearGradient id={`${uid}-aqua-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#143d58" />
            <stop offset="0.5" stopColor="#0d2e49" />
            <stop offset="1" stopColor="#08192f" />
          </linearGradient>
          <pattern
            id={`${uid}-aqua-grid`}
            width="17"
            height="17"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 17 0 L 0 0 0 17"
              fill="none"
              stroke="#65e9ff"
              strokeOpacity="0.1"
              strokeWidth="0.7"
            />
          </pattern>
          <filter
            id={`${uid}-cyan-glow`}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="330" height="220" rx="8" fill={`url(#${uid}-aqua-bg)`} />
        <rect width="330" height="220" rx="8" fill={`url(#${uid}-aqua-grid)`} />
        <rect
          x="13"
          y="13"
          width="304"
          height="20"
          rx="4"
          fill="#1e516b"
          opacity="0.8"
        />
        <circle cx="25" cy="23" r="3" fill="#50efff" opacity="0.75" />
        <circle cx="36" cy="23" r="3" fill="#6d70ff" opacity="0.7" />
        <rect
          x="51"
          y="20"
          width="70"
          height="5"
          rx="2.5"
          fill="#9ceeff"
          opacity="0.36"
        />
        <rect
          x="254"
          y="19"
          width="51"
          height="7"
          rx="3.5"
          fill="#2be7ff"
          opacity="0.38"
        />
        {Array.from({ length: 18 }, (_, index) => {
          const col = index % 6;
          const row = Math.floor(index / 6);
          const active = random(`${uid}-cell-${index}`) > 0.45;
          return (
            <rect
              key={`${uid}-cell-${index}`}
              x={18 + col * 31}
              y={47 + row * 25}
              width="23"
              height="16"
              rx="2"
              fill={active ? "#28d9ec" : "#2f5770"}
              opacity={
                active ? 0.2 + random(`${uid}-cell-o-${index}`) * 0.38 : 0.24
              }
              stroke="#6df2ff"
              strokeOpacity={active ? 0.38 : 0.09}
            />
          );
        })}
        <rect
          x="211"
          y="46"
          width="103"
          height="69"
          rx="4"
          fill="#081d31"
          stroke="#46dbee"
          strokeOpacity="0.38"
        />
        <circle
          cx="262"
          cy="80"
          r="25"
          fill="none"
          stroke="#2a5e76"
          strokeWidth="7"
        />
        <path
          d="M262 55 A25 25 0 0 1 284 91"
          fill="none"
          stroke="#39e8f6"
          strokeWidth="7"
          strokeLinecap="round"
          filter={`url(#${uid}-cyan-glow)`}
        />
        <circle
          cx="262"
          cy="80"
          r="4"
          fill="#9affff"
          filter={`url(#${uid}-cyan-glow)`}
        />
        <rect
          x="15"
          y="130"
          width="300"
          height="72"
          rx="4"
          fill="#071b2e"
          fillOpacity="0.78"
          stroke="#3ed9ec"
          strokeOpacity="0.28"
        />
        <path
          d={wave}
          fill="none"
          stroke="#3eefff"
          strokeWidth="1.8"
          filter={`url(#${uid}-cyan-glow)`}
        />
        <path
          d="M20 187 C55 180 70 194 103 181 S155 174 184 188 S242 190 267 177 S295 183 311 173"
          fill="none"
          stroke="#8366ff"
          strokeWidth="1.5"
          opacity="0.78"
        />
        <TinyLabel x={20} y={209} width={54} color="#50ddec" />
        <TinyLabel x={80} y={209} width={25} color="#657f99" />
        <TinyLabel x={260} y={209} width={48} color="#7663e8" />
      </svg>
    );
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 330 220">
      <defs>
        <linearGradient id={`${uid}-dark-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#101620" />
          <stop offset="0.62" stopColor="#080d15" />
          <stop offset="1" stopColor="#12101f" />
        </linearGradient>
        <filter
          id={`${uid}-terminal-glow`}
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur stdDeviation="2.4" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="330" height="220" rx="8" fill={`url(#${uid}-dark-bg)`} />
      <rect x="10" y="10" width="310" height="20" rx="4" fill="#171f2c" />
      <circle cx="22" cy="20" r="3" fill="#ff4baa" />
      <circle cx="33" cy="20" r="3" fill="#7c65ff" />
      <circle cx="44" cy="20" r="3" fill="#35e8ee" />
      <rect
        x="61"
        y="17"
        width="57"
        height="5"
        rx="2.5"
        fill="#718398"
        opacity="0.42"
      />
      <rect x="245" y="16" width="62" height="7" rx="3.5" fill="#204e61" />
      <rect
        x="11"
        y="40"
        width="72"
        height="169"
        rx="4"
        fill="#0b111a"
        stroke="#263343"
      />
      {Array.from({ length: 11 }, (_, index) => (
        <g key={`${uid}-menu-${index}`}>
          <circle
            cx="21"
            cy={54 + index * 13}
            r="2"
            fill={index % 4 === 1 ? "#40e6ef" : "#526174"}
            opacity={index % 4 === 1 ? 0.9 : 0.48}
          />
          <rect
            x="28"
            y={52.5 + index * 13}
            width={25 + random(`${uid}-menu-w-${index}`) * 20}
            height="3"
            rx="1.5"
            fill={index % 4 === 1 ? "#30aebd" : "#4b5868"}
            opacity="0.56"
          />
        </g>
      ))}
      <rect
        x="91"
        y="40"
        width="228"
        height="75"
        rx="4"
        fill="#0c141e"
        stroke="#273749"
      />
      <path
        d="M101 102 C121 83 134 97 151 73 S187 57 204 77 S233 96 249 67 S280 50 307 62"
        fill="none"
        stroke="#40e9ef"
        strokeWidth="2"
        filter={`url(#${uid}-terminal-glow)`}
      />
      <path
        d="M101 95 C124 104 139 82 161 94 S199 107 218 88 S260 92 277 76 S298 83 308 73"
        fill="none"
        stroke="#ff45ae"
        strokeWidth="1.5"
        opacity="0.82"
      />
      {Array.from({ length: 9 }, (_, index) => (
        <rect
          key={`${uid}-dash-bar-${index}`}
          x={105 + index * 21}
          y={108 - random(`${uid}-dash-height-${index}`) * 34}
          width="10"
          height={5 + random(`${uid}-dash-height-${index}`) * 34}
          rx="2"
          fill={index % 3 === 0 ? "#ff3faa" : "#25cddc"}
          opacity="0.36"
        />
      ))}
      <rect
        x="91"
        y="123"
        width="108"
        height="86"
        rx="4"
        fill="#0b121c"
        stroke="#273749"
      />
      <rect
        x="207"
        y="123"
        width="112"
        height="86"
        rx="4"
        fill="#0b121c"
        stroke="#273749"
      />
      {Array.from({ length: 8 }, (_, index) => (
        <g key={`${uid}-code-${index}`}>
          <rect
            x="101"
            y={135 + index * 8.2}
            width={10 + random(`${uid}-indent-${index}`) * 13}
            height="2.6"
            rx="1.3"
            fill="#765eff"
            opacity="0.55"
          />
          <rect
            x={118 + random(`${uid}-indent-${index}`) * 12}
            y={135 + index * 8.2}
            width={28 + random(`${uid}-code-w-${index}`) * 40}
            height="2.6"
            rx="1.3"
            fill="#5a7186"
            opacity="0.6"
          />
        </g>
      ))}
      {Array.from({ length: 14 }, (_, index) => {
        const col = index % 7;
        const row = Math.floor(index / 7);
        return (
          <rect
            key={`${uid}-matrix-${index}`}
            x={218 + col * 13}
            y={138 + row * 27}
            width="8"
            height={8 + random(`${uid}-matrix-h-${index}`) * 12}
            rx="1.5"
            fill={index % 5 === 0 ? "#f13da6" : "#2bdbe5"}
            opacity={0.24 + random(`${uid}-matrix-o-${index}`) * 0.5}
          />
        );
      })}
    </svg>
  );
};

type TransferSpec = {
  uid: string;
  start: number;
  duration: number;
  sourceX: number;
  targetX: number;
  direction: 1 | -1;
  variant: number;
};

const TransferDocument: React.FC<{
  spec: TransferSpec;
  frame: number;
  fps: number;
}> = ({ spec, frame, fps }) => {
  const localFrame = frame - spec.start;
  if (localFrame < 0 || localFrame > spec.duration) {
    return null;
  }

  const raw = clamp(localFrame / spec.duration);
  const horizontalProgress = interpolate(
    raw,
    [0, 0.18, 0.76, 1],
    [0, 0, 1, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const liftProgress = smoothstep(raw / 0.19);
  const dropProgress = smoothstep((raw - 0.75) / 0.25);
  const air = smoothstep(raw / 0.12) * (1 - smoothstep((raw - 0.84) / 0.16));
  const liftSpring = spring({
    fps,
    frame: Math.max(0, localFrame),
    durationInFrames: Math.max(1, spec.duration * 0.32),
    config: { damping: 16, mass: 0.7, stiffness: 145 },
  });
  const sourceY = 724;
  const targetY = sourceY - spec.variant * 13;
  const apexY = 278 + spec.variant * 12;
  const x = lerp(spec.sourceX, spec.targetX, horizontalProgress);
  const y =
    lerp(sourceY, apexY, liftProgress) +
    lerp(0, targetY - apexY, dropProgress) +
    Math.sin(raw * Math.PI * 4 + spec.variant * 0.8) * air * 7;
  const opacity = interpolate(raw, [0, 0.055, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const scale = 0.63 + air * 0.31 + (liftSpring - 1) * 0.018;
  const rotateZ =
    spec.direction * interpolate(raw, [0, 0.42, 1], [-10, 3, 11]) +
    (spec.variant - 1) * 1.5;
  const rotateX = interpolate(raw, [0, 0.18, 0.62, 1], [57, 14, 4, 60], {
    easing: Easing.inOut(Easing.cubic),
  });
  const rotateY = spec.direction * air * (10 + spec.variant * 3);
  const blur = interpolate(raw, [0, 0.09, 0.84, 1], [6, 0, 0, 7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {Array.from({ length: 5 }, (_, index) => {
        const trailDistance = 20 + index * 21;
        const trailOpacity = opacity * air * (0.3 - index * 0.045);
        return (
          <div
            key={`${spec.uid}-trail-${index}`}
            style={{
              position: "absolute",
              left: x - spec.direction * trailDistance,
              top: y + Math.sin(index * 1.8 + raw * 7) * 12,
              width: 4 + (index % 2) * 3,
              height: 4 + (index % 2) * 3,
              borderRadius: index % 2 === 0 ? 1 : 999,
              background: index % 3 === 0 ? COLORS.magenta : COLORS.cyan,
              opacity: trailOpacity,
              boxShadow: `0 0 ${12 + index * 3}px ${index % 3 === 0 ? COLORS.magenta : COLORS.cyan}`,
              transform: `rotate(${raw * 160 + index * 27}deg)`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 330,
          height: 220,
          opacity,
          transform: `translate(-50%, -50%) perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
          transformOrigin: "50% 58%",
          filter: `blur(${blur}px) drop-shadow(0 24px 24px rgba(0,0,0,.62)) drop-shadow(0 0 ${22 + air * 20}px ${spec.variant === 2 ? "rgba(255,40,168,.24)" : "rgba(47,231,255,.25)"})`,
          borderRadius: 8,
          overflow: "hidden",
          background: "#0c1722",
          border: `1px solid ${spec.variant === 2 ? "rgba(255,92,187,.55)" : "rgba(137,246,255,.65)"}`,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.12), inset 0 0 24px rgba(255,255,255,.04)",
        }}
      >
        <DocumentSurface variant={spec.variant} uid={spec.uid} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(112deg, rgba(255,255,255,.24) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,.08) 58%, rgba(255,255,255,0) 76%)",
            mixBlendMode: "screen",
            opacity: 0.48,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: x - 120,
          top: 865 + (865 - y) * 0.09,
          width: 240,
          height: 34,
          borderRadius: "50%",
          background:
            spec.variant === 2
              ? "radial-gradient(ellipse, rgba(255,38,168,.22), transparent 70%)"
              : "radial-gradient(ellipse, rgba(39,220,255,.22), transparent 70%)",
          opacity: opacity * (0.12 + (1 - air) * 0.38),
          filter: "blur(11px)",
          transform: `scaleX(${0.55 + scale * 0.45})`,
        }}
      />
    </>
  );
};

const DustField: React.FC<{ phase: number }> = ({ phase }) => (
  <>
    {Array.from({ length: 48 }, (_, index) => {
      const x = random(`dust-x-${index}`) * BASE_WIDTH;
      const y = 75 + random(`dust-y-${index}`) * 720;
      const size = 0.8 + random(`dust-size-${index}`) * 2.4;
      const wave = Math.sin(
        phase * Math.PI * 2 + random(`dust-phase-${index}`) * Math.PI * 2,
      );
      const bright = random(`dust-bright-${index}`);
      return (
        <div
          key={`dust-${index}`}
          style={{
            position: "absolute",
            left: x,
            top: y + wave * (4 + random(`dust-range-${index}`) * 12),
            width: size,
            height: size,
            borderRadius: "50%",
            background: index % 6 === 0 ? "#ff77c7" : "#8eeeff",
            opacity: 0.06 + bright * 0.21 + wave * 0.04,
            boxShadow:
              bright > 0.78
                ? `0 0 10px ${index % 6 === 0 ? "#ff37aa" : "#31dfff"}`
                : "none",
          }}
        />
      );
    })}
  </>
);

const reactionAt = (frame: number, events: number[], fps: number) =>
  events.reduce((sum, event) => {
    const delta = frame - event;
    if (delta < 0 || delta > fps * 0.34) return sum;
    const seconds = delta / fps;
    return (
      sum + Math.sin(seconds * Math.PI * 8.5) * Math.exp(-seconds * 8) * 1.05
    );
  }, 0);

const glowAt = (frame: number, events: number[], fps: number) =>
  clamp(
    events.reduce((sum, event) => {
      const delta = Math.abs(frame - event);
      if (delta > fps * 0.32) return sum;
      return sum + (1 - smoothstep(delta / (fps * 0.32)));
    }, 0),
  );

const mouthOpenAt = (frame: number, events: number[], fps: number) =>
  clamp(
    events.reduce((maximum, event) => {
      const opening = smoothstep((frame - (event - fps * 0.22)) / (fps * 0.11));
      const closing =
        1 - smoothstep((frame - (event + fps * 0.035)) / (fps * 0.12));
      return Math.max(maximum, opening * closing);
    }, 0),
  );

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const safeDuration = Math.max(1, durationInFrames || fps * 15);
  const loopFrame = ((frame % safeDuration) + safeDuration) % safeDuration;
  const phase = loopFrame / safeDuration;
  const cycleDuration = safeDuration / 4;
  const flightDuration = cycleDuration * 0.255;
  const offsets = [0.085, 0.385, 0.64];
  const leftX = 465;
  const rightX = 1455;
  const folderY = 718;

  const transfers: TransferSpec[] = [0, 1, 2, 3].flatMap((group) =>
    offsets.map((offset, index) => {
      const direction = -1 as const;
      return {
        uid: `transfer-${group}-${index}`,
        start: group * cycleDuration + offset * cycleDuration,
        duration: flightDuration,
        sourceX: rightX,
        targetX: leftX - 38 + index * 36,
        direction,
        variant: index,
      };
    }),
  );

  const leftLandings = transfers
    .filter((transfer) => transfer.direction === -1)
    .map((transfer) => transfer.start + transfer.duration);
  const rightLandings: number[] = [];
  const leftLaunches: number[] = [];
  const rightLaunches = transfers.map((transfer) => transfer.start);

  const leftReaction = reactionAt(loopFrame, leftLandings, fps);
  const rightReaction = reactionAt(loopFrame, rightLandings, fps);
  const cyclePhase = (loopFrame % cycleDuration) / cycleDuration;
  const sourceOpen =
    smoothstep((cyclePhase - 0.015) / 0.055) *
    (1 - smoothstep((cyclePhase - 0.885) / 0.08));
  const targetOpen = mouthOpenAt(loopFrame, leftLandings, fps);
  const leftGlow = glowAt(loopFrame, [...leftLandings, ...leftLaunches], fps);
  const rightGlow = glowAt(
    loopFrame,
    [...rightLandings, ...rightLaunches],
    fps,
  );
  const leftFloat = Math.sin(phase * Math.PI * 2) * 3.2;
  const rightFloat = Math.sin(phase * Math.PI * 2 + 1.15) * 3.2;
  const cameraScale = 1.006 + Math.sin(phase * Math.PI * 2 - 0.7) * 0.006;
  const cameraX = Math.sin(phase * Math.PI * 2) * 5;
  const cameraY = Math.cos(phase * Math.PI * 2) * 3;
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        overflow: "hidden",
        fontFamily: "Inter, ui-sans-serif, system-ui, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: "0 0",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 20% 31%, rgba(18,76,112,.18), transparent 31%), radial-gradient(circle at 78% 39%, rgba(89,20,91,.12), transparent 30%), linear-gradient(135deg, #07111b 0%, #030710 47%, #090611 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -30,
            opacity: 0.18,
            backgroundImage:
              "linear-gradient(rgba(78,171,205,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(78,171,205,.04) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            transform: `perspective(900px) rotateX(64deg) translateY(${185 + Math.sin(phase * Math.PI * 2) * 4}px) scale(1.32)`,
            transformOrigin: "50% 70%",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 44%, black 72%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 44%, black 72%, transparent 100%)",
          }}
        />
        <DustField phase={phase} />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 688,
            height: 392,
            background:
              "linear-gradient(to bottom, rgba(12,20,32,.48), rgba(2,4,10,.95)), radial-gradient(ellipse at 25% 0%, rgba(255,35,178,.16), transparent 34%), radial-gradient(ellipse at 76% 0%, rgba(30,183,255,.13), transparent 34%)",
            borderTop: "1px solid rgba(133,213,255,.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 684,
            height: 12,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(38,211,255,.1) 16%, rgba(255,49,179,.16) 49%, rgba(44,210,255,.1) 82%, transparent 100%)",
            filter: "blur(7px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -100,
            right: -100,
            top: 766,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(93,214,255,.16) 20%, rgba(255,44,181,.24) 50%, rgba(76,206,255,.12) 80%, transparent)",
            filter: "blur(1px)",
            opacity: 0.62,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${cameraScale})`,
            transformOrigin: "50% 58%",
          }}
        >
          <FolderReflection x={leftX} y={folderY} stacked floatY={leftFloat} />
          <FolderReflection x={rightX} y={folderY} floatY={rightFloat} />

          <FolderBack
            id="left-back"
            x={leftX}
            y={folderY}
            stacked
            floatY={leftFloat}
            reaction={leftReaction}
            glow={leftGlow}
          />
          <FolderBack
            id="right-back"
            x={rightX}
            y={folderY}
            floatY={rightFloat}
            reaction={rightReaction}
            glow={rightGlow}
          />

          {transfers.map((spec) => (
            <TransferDocument
              key={spec.uid}
              spec={spec}
              frame={loopFrame}
              fps={fps}
            />
          ))}

          <FolderFront
            id="left-front"
            x={leftX}
            y={folderY}
            floatY={leftFloat}
            reaction={leftReaction}
            glow={leftGlow}
            open={targetOpen * 0.7}
          />
          <FolderFront
            id="right-front"
            x={rightX}
            y={folderY}
            floatY={rightFloat}
            reaction={rightReaction}
            glow={rightGlow}
            open={sourceOpen}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow:
              "inset 0 0 150px rgba(0,0,0,.74), inset 0 -120px 180px rgba(0,0,0,.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.11,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.92%27 numOctaves=%272%27 seed=%278%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.36%27/%3E%3C/svg%3E")',
            mixBlendMode: "soft-light",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
