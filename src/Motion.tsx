import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const phase = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) => interpolate(frame, [start, end], [0, 1], {...clamp, easing});

const CobaltTruck: React.FC<{
  opacity: number;
  wheelRotation: number;
}> = ({opacity, wheelRotation}) => {
  return (
    <svg
      aria-label="Cobalt delivery truck"
      viewBox="0 0 300 132"
      width="300"
      height="141"
      style={{
        display: 'block',
        opacity,
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id="cargoBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3478f6" />
          <stop offset="1" stopColor="#1d5ed6" />
        </linearGradient>
        <linearGradient id="cabBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#266ce6" />
          <stop offset="1" stopColor="#1649aa" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8f5ff" />
          <stop offset="1" stopColor="#69c9f1" />
        </linearGradient>
      </defs>

      <path
        d="M14 15 Q14 7 22 7 H191 Q200 7 200 16 V89 H14 Z"
        fill="url(#cargoBlue)"
        stroke="#123a88"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M200 45 H237 Q245 45 250 51 L277 82 Q282 88 282 99 V103 Q282 110 275 110 H200 Z"
        fill="url(#cabBlue)"
        stroke="#123a88"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M228 53 H240 Q245 53 249 58 L267 80 H219 V61 Q219 53 228 53 Z"
        fill="url(#glass)"
        stroke="#123a88"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M203 84 H277"
        fill="none"
        stroke="#0d367e"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M16 91 H276 Q286 91 286 101 V108 H8 V98 Q8 91 16 91 Z"
        fill="#123a88"
      />
      <path
        d="M32 25 V80 M54 25 V80"
        fill="none"
        stroke="#6fa1ff"
        strokeWidth="3"
        opacity="0.42"
      />
      <rect x="150" y="29" width="32" height="8" rx="4" fill="#91d9ff" opacity="0.82" />
      <rect x="252" y="92" width="25" height="7" rx="3.5" fill="#43dcff" />
      <rect x="7" y="99" width="13" height="7" rx="3.5" fill="#ffb547" />

      <g transform={`rotate(${wheelRotation} 65 108)`}>
        <circle cx="65" cy="108" r="22" fill="#ffffff" />
        <circle cx="65" cy="108" r="18" fill="#0b1f46" />
        <circle cx="65" cy="108" r="9" fill="#ffffff" />
        <path
          d="M65 90 V126 M47 108 H83"
          fill="none"
          stroke="#7aa6d8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="65" cy="108" r="4" fill="#7aa6d8" />
      </g>
      <g transform={`rotate(${wheelRotation} 241 108)`}>
        <circle cx="241" cy="108" r="22" fill="#ffffff" />
        <circle cx="241" cy="108" r="18" fill="#0b1f46" />
        <circle cx="241" cy="108" r="9" fill="#ffffff" />
        <path
          d="M241 90 V126 M223 108 H259"
          fill="none"
          stroke="#7aa6d8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="241" cy="108" r="4" fill="#7aa6d8" />
      </g>
    </svg>
  );
};

const StatusLabel: React.FC<{reveal: number}> = ({reveal}) => {
  const headX = reveal * 308;
  const trailOpacity = interpolate(reveal, [0, 0.12, 0.82, 1], [0, 0.24, 0.16, 0], clamp);

  return (
    <div
      style={{
        position: 'relative',
        width: 310,
        height: 54,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: 500,
          transform: 'translateX(-50%) scaleX(0.62)',
          transformOrigin: '50% 50%',
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 50,
          fontWeight: 800,
          lineHeight: '54px',
          letterSpacing: 1,
          color: '#0c1525',
          textAlign: 'center',
        }}
      >
        ORDER SHIPPED
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: Math.max(0, headX - 62),
          top: 15,
          width: 78,
          height: 28,
          opacity: trailOpacity,
          filter: 'blur(9px)',
          background: 'linear-gradient(90deg, transparent, rgba(12,21,37,0.54), transparent)',
        }}
      />
    </div>
  );
};

const ProgressCapsule: React.FC<{
  outline: number;
  fill: number;
}> = ({outline, fill}) => {
  const percent = Math.round(fill * 100);

  return (
    <>
      <svg
        width="700"
        height="40"
        viewBox="0 0 700 40"
        style={{display: 'block', overflow: 'visible'}}
      >
        <defs>
          <clipPath id="progressInnerClip">
            <rect x="6" y="6" width="688" height="28" rx="14" />
          </clipPath>
        </defs>
        <rect
          x="2"
          y="2"
          width="696"
          height="36"
          rx="18"
          fill="none"
          stroke="#101827"
          strokeWidth="2.8"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - outline}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g clipPath="url(#progressInnerClip)">
          <rect
            x="6"
            y="6"
            width={688 * fill}
            height="28"
            rx="14"
            fill="#101827"
          />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: outline >= 0.99 ? 1 : 0,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 45,
          fontWeight: 800,
          lineHeight: '50px',
          letterSpacing: -0.3,
          color: '#0c1525',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {percent}%
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const truckEntry = phase(
    frame,
    0,
    48,
    Easing.out(Easing.cubic),
  );
  const truckExit = phase(
    frame,
    810,
    870,
    Easing.inOut(Easing.cubic),
  );
  const truckX = interpolate(truckEntry, [0, 1], [-1160, 0]) +
    interpolate(truckExit, [0, 1], [0, 1250]);
  const truckDistance = truckEntry * 1160 + truckExit * 1250;
  const wheelRotation = (truckDistance / (Math.PI * 36)) * 360;
  const labelReveal = phase(
    frame,
    45,
    72,
    Easing.inOut(Easing.cubic),
  );
  const outline = phase(
    frame,
    78,
    117,
    Easing.inOut(Easing.cubic),
  );
  const fill = phase(frame, 117, 810, Easing.linear);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 810,
          top: 334,
          width: 300,
          height: 141,
          transform: `translateX(${truckX}px)`,
        }}
      >
        <CobaltTruck opacity={1} wheelRotation={wheelRotation} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 805,
          top: 466,
          width: 310,
          height: 54,
        }}
      >
        <StatusLabel reveal={labelReveal} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 610,
          top: 629,
          width: 700,
          height: 100,
        }}
      >
        <ProgressCapsule outline={outline} fill={fill} />
      </div>
    </AbsoluteFill>
  );
};
