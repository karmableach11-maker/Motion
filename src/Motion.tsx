import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;

const COLORS = {
  background: '#041016',
  backgroundDeep: '#02080d',
  panel: '#091a22',
  panelSoft: '#0d2530',
  mint: '#77ffd4',
  green: '#24e39a',
  greenDeep: '#0dbb74',
  cyan: '#53d8ff',
  text: '#f3fbff',
  textSoft: '#a7bbc4',
  textDim: '#68818c',
  line: 'rgba(163, 229, 236, 0.16)',
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (value: number) => {
  const v = clamp01(value);
  return v * v * (3 - 2 * v);
};

const phase = (time: number, start: number, end: number) => {
  return smoothstep((time - start) / Math.max(0.0001, end - start));
};

const easeOutBack = (value: number) => {
  const v = clamp01(value);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2);
};

const formatAmount = (value: number) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const backgroundNodes = [
  {x: 110, y: 188, r: 3, delay: 0.1},
  {x: 264, y: 306, r: 2, delay: 0.4},
  {x: 412, y: 124, r: 3, delay: 0.8},
  {x: 584, y: 235, r: 2, delay: 0.2},
  {x: 786, y: 112, r: 2, delay: 0.7},
  {x: 1002, y: 206, r: 3, delay: 0.5},
  {x: 1214, y: 116, r: 2, delay: 0.9},
  {x: 1432, y: 232, r: 3, delay: 0.3},
  {x: 1664, y: 136, r: 2, delay: 0.6},
  {x: 1810, y: 314, r: 3, delay: 0.1},
  {x: 86, y: 716, r: 2, delay: 0.6},
  {x: 254, y: 884, r: 3, delay: 0.3},
  {x: 464, y: 762, r: 2, delay: 0.9},
  {x: 672, y: 946, r: 3, delay: 0.2},
  {x: 876, y: 818, r: 2, delay: 0.7},
  {x: 1076, y: 944, r: 3, delay: 0.4},
  {x: 1296, y: 824, r: 2, delay: 0.8},
  {x: 1508, y: 940, r: 3, delay: 0.1},
  {x: 1692, y: 772, r: 2, delay: 0.5},
  {x: 1834, y: 912, r: 3, delay: 0.9},
];

const networkLinks = [
  [0, 1],
  [1, 3],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [10, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 19],
] as const;

const Background: React.FC<{time: number; success: number}> = ({
  time,
  success,
}) => {
  const gridShift = (time * 23) % 96;
  const ambientPulse = 0.5 + Math.sin(time * 1.15) * 0.5;
  const networkPulse = clamp01(
    Math.max(0, 1 - Math.abs(time - 8.2) / 0.62) +
      Math.max(0, 1 - Math.abs(time - 10.0) / 0.62) +
      Math.max(0, 1 - Math.abs(time - 11.8) / 0.62),
  );

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 66% 44%, #0c3b3d 0%, #071c25 29%, #041016 60%, #02080d 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1050,
          height: 1050,
          left: 900,
          top: -120,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(38, 227, 154, 0.17) 0%, rgba(23, 172, 151, 0.06) 38%, rgba(3, 12, 18, 0) 70%)',
          transform: `scale(${0.96 + ambientPulse * 0.04 + success * 0.04})`,
          filter: 'blur(4px)',
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient
            id="gridFade"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            y2={HEIGHT}
          >
            <stop offset="0" stopColor="#5bd2d6" stopOpacity="0" />
            <stop offset="0.42" stopColor="#5bd2d6" stopOpacity="0.08" />
            <stop offset="1" stopColor="#5bd2d6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="nodeHalo">
            <stop offset="0" stopColor={COLORS.mint} stopOpacity="0.8" />
            <stop offset="1" stopColor={COLORS.mint} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="networkFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={COLORS.cyan} stopOpacity="0.05" />
            <stop offset="0.5" stopColor={COLORS.mint} stopOpacity="0.28" />
            <stop offset="1" stopColor={COLORS.cyan} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g opacity={0.56} transform={`translate(0 ${gridShift})`}>
          {Array.from({length: 15}).map((_, index) => (
            <path
              key={`horizontal-${index}`}
              d={`M 0 ${105 + index * 96} H ${WIDTH}`}
              stroke="url(#gridFade)"
              strokeWidth="1"
            />
          ))}
        </g>

        <g opacity={0.36}>
          {Array.from({length: 21}).map((_, index) => (
            <path
              key={`vertical-${index}`}
              d={`M ${index * 96} 0 V ${HEIGHT}`}
              stroke="url(#gridFade)"
              strokeWidth="1"
            />
          ))}
        </g>

        <g opacity={0.16 + success * 0.14 + networkPulse * 0.18}>
          {networkLinks.map(([start, end], index) => {
            const a = backgroundNodes[start];
            const b = backgroundNodes[end];
            const reveal = phase(time, 4.7 + index * 0.055, 5.6 + index * 0.055);
            return (
              <line
                key={`link-${index}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#networkFade)"
                strokeWidth="1.2"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - reveal}
              />
            );
          })}
        </g>

        {backgroundNodes.map((node, index) => {
          const twinkle = 0.5 + Math.sin(time * 2.2 + node.delay * 8) * 0.5;
          const activation = phase(time, 4.6 + node.delay, 5.6 + node.delay);
          return (
            <g key={`node-${index}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={16 + twinkle * 6 + networkPulse * 4}
                fill="url(#nodeHalo)"
                opacity={
                  (0.04 + activation * 0.1 + networkPulse * 0.05) *
                  (0.76 + success * 0.24)
                }
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r + activation * 0.8}
                fill={index % 3 === 0 ? COLORS.mint : COLORS.cyan}
                opacity={
                  0.16 +
                  twinkle * 0.14 +
                  success * activation * 0.18 +
                  networkPulse * 0.16
                }
              />
            </g>
          );
        })}

        <g
          fill="none"
          stroke={COLORS.mint}
          opacity={0.08 + success * 0.1}
          transform={`rotate(${time * 4.2} 1320 460)`}
        >
          <ellipse cx="1320" cy="460" rx="620" ry="290" strokeWidth="1" />
          <ellipse
            cx="1320"
            cy="460"
            rx="480"
            ry="430"
            strokeWidth="1"
            transform="rotate(38 1320 460)"
          />
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.02) 28%, rgba(0,0,0,0.01) 72%, rgba(0,0,0,0.35) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.018) 4px)',
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};

const Chip: React.FC = () => {
  return (
    <svg width="74" height="56" viewBox="0 0 74 56">
      <defs>
        <linearGradient id="chipGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe9a6" />
          <stop offset="0.48" stopColor="#cba451" />
          <stop offset="1" stopColor="#fff1bc" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="72"
        height="54"
        rx="12"
        fill="url(#chipGold)"
        opacity="0.95"
      />
      <g stroke="#7a642f" strokeWidth="2" opacity="0.65" fill="none">
        <path d="M 27 2 V 54 M 47 2 V 54 M 2 20 H 72 M 2 37 H 72" />
        <rect x="27" y="20" width="20" height="17" rx="3" />
      </g>
    </svg>
  );
};

const Contactless: React.FC<{pulse: number}> = ({pulse}) => {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      {[12, 20, 28].map((radius, index) => (
        <path
          key={radius}
          d={`M 16 ${26 - radius / 2.7} Q ${16 + radius * 0.72} 26 16 ${
            26 + radius / 2.7
          }`}
          fill="none"
          stroke="#efffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity={0.38 + index * 0.2 + pulse * 0.12}
        />
      ))}
    </svg>
  );
};

const DigitalCard: React.FC<{time: number; entrance: number}> = ({
  time,
  entrance,
}) => {
  const scanPosition = ((time * 138) % 560) - 100;
  const pulse = 0.5 + Math.sin(time * 4.5) * 0.5;
  const enter = easeOutBack(entrance);

  return (
    <div
      style={{
        position: 'absolute',
        left: 78,
        top: 154,
        width: 438,
        height: 272,
        borderRadius: 34,
        overflow: 'hidden',
        opacity: entrance,
        transform: `translate3d(${(1 - enter) * -120}px, ${(1 - enter) * 40}px, 0) rotateY(${
          (1 - enter) * 18
        }deg) rotateZ(${(1 - enter) * -4 + Math.sin(time * 1.2) * 0.55}deg)`,
        transformOrigin: '50% 50%',
        background:
          'linear-gradient(135deg, #183b53 0%, #0b2735 43%, #0b675c 100%)',
        border: '1px solid rgba(209, 255, 245, 0.32)',
        boxShadow:
          '0 28px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          left: -100,
          top: -130,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(97,229,255,0.31), rgba(97,229,255,0) 68%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          right: -170,
          bottom: -240,
          borderRadius: '50%',
          border: '1px solid rgba(137,255,216,0.28)',
          boxShadow: '0 0 60px rgba(35,227,154,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: scanPosition,
          top: -90,
          width: 78,
          height: 460,
          opacity: 0.38,
          transform: 'rotate(16deg)',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(196,255,244,0.34), rgba(255,255,255,0))',
          filter: 'blur(3px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 30,
          right: 30,
          top: 26,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              color: '#d6fff4',
              fontSize: 13,
              letterSpacing: 3.2,
              fontWeight: 700,
            }}
          >
            DIGITAL WALLET
          </div>
          <div
            style={{
              marginTop: 7,
              color: 'rgba(224,255,250,0.56)',
              fontSize: 11,
              letterSpacing: 1.8,
            }}
          >
            SECURE ACCOUNT
          </div>
        </div>
        <Contactless pulse={pulse} />
      </div>

      <div style={{position: 'absolute', left: 31, top: 101}}>
        <Chip />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 31,
          top: 178,
          color: '#f1fffc',
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 5.5,
          textShadow: '0 2px 14px rgba(0,0,0,0.35)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ••••&nbsp;&nbsp;4827
      </div>

      <div
        style={{
          position: 'absolute',
          left: 31,
          bottom: 24,
          display: 'flex',
          gap: 60,
          color: 'rgba(231,255,250,0.72)',
          fontSize: 13,
          lineHeight: 1.45,
          letterSpacing: 1.6,
        }}
      >
        <div>
          <span style={{opacity: 0.55}}>ACCOUNT</span>
          <br />
          PRIMARY
        </div>
        <div>
          <span style={{opacity: 0.55}}>VALID</span>
          <br />
          MM / YY
        </div>
      </div>
    </div>
  );
};

const ShieldIcon: React.FC<{scan: number; success: number}> = ({
  scan,
  success,
}) => {
  const checkDraw = phase(success, 0.08, 0.84);
  const shieldOpacity = 1 - phase(success, 0.05, 0.5);

  return (
    <svg width="130" height="142" viewBox="0 0 130 142">
      <defs>
        <linearGradient id="shieldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={COLORS.cyan} />
          <stop offset="1" stopColor={COLORS.mint} />
        </linearGradient>
        <linearGradient id="checkStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9fff8" />
          <stop offset="1" stopColor={COLORS.mint} />
        </linearGradient>
      </defs>

      <g opacity={shieldOpacity}>
        <path
          d="M65 8 C82 21 101 24 115 27 V62 C115 96 96 120 65 134 C34 120 15 96 15 62 V27 C29 24 48 21 65 8Z"
          fill="rgba(28, 224, 167, 0.04)"
          stroke="url(#shieldStroke)"
          strokeWidth="4"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - scan}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="45"
          y="66"
          width="40"
          height="34"
          rx="9"
          fill="rgba(5, 18, 24, 0.82)"
          stroke={COLORS.mint}
          strokeWidth="3"
          opacity={phase(scan, 0.55, 0.88)}
        />
        <path
          d="M53 67 V57 C53 42 77 42 77 57 V67"
          fill="none"
          stroke={COLORS.mint}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={phase(scan, 0.64, 1)}
        />
        <circle
          cx="65"
          cy="83"
          r="3.8"
          fill={COLORS.mint}
          opacity={phase(scan, 0.74, 1)}
        />
      </g>

      <circle
        cx="65"
        cy="71"
        r={52 + (1 - success) * 8}
        fill={`rgba(21, 215, 139, ${0.1 + success * 0.16})`}
        opacity={success}
      />
      <path
        d="M34 72 L56 94 L99 48"
        fill="none"
        stroke="url(#checkStroke)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - checkDraw}
        opacity={success}
      />
    </svg>
  );
};

const VerificationCore: React.FC<{
  time: number;
  scan: number;
  success: number;
}> = ({time, scan, success}) => {
  const coreIn = phase(time, 1.65, 2.6);
  const pulse = 0.5 + Math.sin(time * 4.2) * 0.5;
  const ringRotation = time * 31;

  return (
    <div
      style={{
        position: 'absolute',
        left: 755,
        top: 100,
        width: 350,
        height: 350,
        opacity: coreIn,
        transform: `scale(${0.78 + coreIn * 0.22 + success * 0.04})`,
      }}
    >
      {[0, 1, 2].map((index) => {
        const ripple = (time * 0.5 + index / 3) % 1;
        const visible = scan * (1 - ripple);
        return (
          <div
            key={`ripple-${index}`}
            style={{
              position: 'absolute',
              left: 175,
              top: 175,
              width: 178,
              height: 178,
              borderRadius: '50%',
              border: `1px solid rgba(80, 245, 203, ${0.3 * visible})`,
              transform: `translate(-50%, -50%) scale(${0.8 + ripple * 1.35})`,
              opacity: visible * (1 - success * 0.78),
            }}
          />
        );
      })}

      <svg
        width="350"
        height="350"
        viewBox="0 0 350 350"
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={COLORS.cyan} stopOpacity="0.18" />
            <stop offset="0.52" stopColor={COLORS.mint} stopOpacity="0.95" />
            <stop offset="1" stopColor={COLORS.green} stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="coreGlow">
            <stop offset="0" stopColor={COLORS.green} stopOpacity="0.25" />
            <stop offset="1" stopColor={COLORS.green} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="175" cy="175" r="156" fill="url(#coreGlow)" opacity={0.5 + success * 0.5} />
        <circle
          cx="175"
          cy="175"
          r="139"
          fill="rgba(4, 17, 23, 0.72)"
          stroke="rgba(140, 245, 220, 0.12)"
          strokeWidth="2"
        />
        <g transform={`rotate(${ringRotation} 175 175)`}>
          <circle
            cx="175"
            cy="175"
            r="151"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="3"
            strokeDasharray="28 18 4 16"
            strokeLinecap="round"
            opacity={0.42 + scan * 0.55}
          />
        </g>
        <g transform={`rotate(${-ringRotation * 0.62} 175 175)`}>
          <circle
            cx="175"
            cy="175"
            r="126"
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth="1.5"
            strokeDasharray="2 11"
            opacity={0.18 + pulse * 0.18}
          />
        </g>
        <circle
          cx="175"
          cy="175"
          r="112"
          fill="none"
          stroke={success > 0.5 ? COLORS.green : COLORS.cyan}
          strokeWidth={2 + success * 2}
          opacity={0.18 + success * 0.52}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 103,
          width: 130,
          height: 142,
          transform: `translateY(${(1 - scan) * 12}px)`,
        }}
      >
        <ShieldIcon scan={scan} success={success} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 277,
          textAlign: 'center',
          color: success > 0.5 ? COLORS.mint : COLORS.cyan,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 3.1,
          opacity: 0.72 + pulse * 0.2,
        }}
      >
        {success > 0.55 ? 'TRANSACTION VERIFIED' : 'SECURE VERIFICATION'}
      </div>
    </div>
  );
};

const DataBeam: React.FC<{
  time: number;
  activation: number;
  success: number;
}> = ({time, activation, success}) => {
  const path = 'M 482 394 C 610 394, 640 285, 785 285';
  return (
    <svg
      width="1160"
      height="700"
      viewBox="0 0 1160 700"
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <linearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={COLORS.cyan} stopOpacity="0.2" />
          <stop offset="0.5" stopColor={COLORS.mint} stopOpacity="0.95" />
          <stop offset="1" stopColor={COLORS.green} stopOpacity="0.2" />
        </linearGradient>
        <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="rgba(110, 217, 225, 0.12)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity={activation}
      />
      <path
        d={path}
        fill="none"
        stroke="url(#beamGradient)"
        strokeWidth="2.2"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - activation}
        filter="url(#beamGlow)"
        opacity={1 - success * 0.34}
      />
      {Array.from({length: 9}).map((_, index) => {
        const movement = (time * 0.38 + index / 9) % 1;
        const inverse = 1 - movement;
        const x =
          inverse * inverse * inverse * 482 +
          3 * inverse * inverse * movement * 610 +
          3 * inverse * movement * movement * 640 +
          movement * movement * movement * 785;
        const y =
          inverse * inverse * inverse * 394 +
          3 * inverse * inverse * movement * 394 +
          3 * inverse * movement * movement * 285 +
          movement * movement * movement * 285;
        const dotAlpha = Math.sin(movement * Math.PI) * activation;
        return (
          <g key={`beam-dot-${index}`} opacity={dotAlpha * (1 - success * 0.42)}>
            <circle cx={x} cy={y} r="10" fill={COLORS.mint} opacity="0.08" />
            <circle cx={x} cy={y} r={index % 3 === 0 ? 3.7 : 2.3} fill={COLORS.mint} />
          </g>
        );
      })}
    </svg>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string;
  progress: number;
  accent?: boolean;
}> = ({label, value, progress, accent}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
        borderBottom: '1px solid rgba(163, 229, 236, 0.11)',
        opacity: progress,
        transform: `translateY(${(1 - progress) * 12}px)`,
      }}
    >
      <div
        style={{
          color: COLORS.textDim,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2.2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: accent ? COLORS.mint : COLORS.textSoft,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.25,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  );
};

const StatusPill: React.FC<{
  label: string;
  delay: number;
  time: number;
  icon: 'bolt' | 'lock' | 'check';
}> = ({label, delay, time, icon}) => {
  const entrance = easeOutBack(phase(time, delay, delay + 0.65));
  const iconPath =
    icon === 'bolt'
      ? 'M10 1 L4 11 H9 L7 20 L16 8 H11 Z'
      : icon === 'lock'
        ? 'M5 9 V6 C5 1 15 1 15 6 V9 M4 9 H16 V19 H4 Z'
        : 'M2 10 L7 15 L18 3';

  return (
    <div
      style={{
        height: 38,
        padding: '0 14px 0 11px',
        borderRadius: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        background: 'rgba(27, 70, 73, 0.38)',
        border: '1px solid rgba(112, 255, 213, 0.16)',
        color: '#bfffe9',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.6,
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 20}px) scale(${0.8 + entrance * 0.2})`,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20">
        <path
          d={iconPath}
          fill={icon === 'bolt' ? COLORS.mint : 'none'}
          stroke={COLORS.mint}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </div>
  );
};

const TransactionDetails: React.FC<{time: number; success: number}> = ({
  time,
  success,
}) => {
  const title = phase(time, 4.55, 5.15);
  const amountProgress = phase(time, 2.3, 4.2);
  const finalAmount = Math.round(248000 * amountProgress) / 100;
  const subtitle = phase(time, 4.9, 5.45);

  return (
    <div
      style={{
        position: 'absolute',
        left: 710,
        top: 434,
        width: 440,
        height: 222,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          textAlign: 'center',
          opacity: phase(time, 1.95, 2.6) * (1 - phase(time, 4.18, 4.65)),
          transform: `translateY(${(1 - phase(time, 1.95, 2.6)) * 12}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.textDim,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 3.2,
          }}
        >
          AUTHORIZING PAYMENT
        </div>
        <div
          style={{
            marginTop: 11,
            color: COLORS.text,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 0.6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ${formatAmount(finalAmount)}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          textAlign: 'center',
          opacity: title,
          transform: `translateY(${(1 - title) * 22}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 42,
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: -0.45,
          }}
        >
          PAYMENT RECEIVED
        </div>
        <div
          style={{
            marginTop: 9,
            color: COLORS.textSoft,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.75,
            opacity: subtitle,
          }}
        >
          Transaction processed securely and instantly
        </div>
        <div
          style={{
            marginTop: 18,
            color: COLORS.mint,
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: -0.8,
            textShadow: '0 0 28px rgba(56, 237, 175, 0.22)',
            fontVariantNumeric: 'tabular-nums',
            opacity: success,
          }}
        >
          $2,480.00
        </div>
      </div>
    </div>
  );
};

const ReceiptPanel: React.FC<{time: number}> = ({time}) => {
  const panelIn = easeOutBack(phase(time, 5.45, 6.25));
  const shimmerActivity =
    phase(time, 8.55, 8.95) * (1 - phase(time, 12.75, 13.25));
  const shimmerTravel = ((Math.max(0, time - 8.65) % 2.15) / 2.15);
  return (
    <div
      style={{
        position: 'absolute',
        left: 78,
        top: 468,
        width: 438,
        height: 174,
        padding: '13px 22px 0',
        boxSizing: 'border-box',
        borderRadius: 22,
        background:
          'linear-gradient(135deg, rgba(15, 45, 56, 0.72), rgba(8, 28, 36, 0.54))',
        border: '1px solid rgba(172, 239, 236, 0.13)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
        overflow: 'hidden',
        opacity: panelIn,
        transform: `translateY(${(1 - panelIn) * 34}px) scale(${0.94 + panelIn * 0.06})`,
      }}
    >
      <DetailRow
        label="STATUS"
        value="COMPLETED"
        progress={phase(time, 5.72, 6.28)}
        accent
      />
      <DetailRow
        label="METHOD"
        value="DIGITAL WALLET"
        progress={phase(time, 5.97, 6.53)}
      />
      <DetailRow
        label="REFERENCE"
        value="TX-8435-2910"
        progress={phase(time, 6.22, 6.78)}
      />
      <div
        style={{
          position: 'absolute',
          top: -45,
          bottom: -45,
          left: -125 + shimmerTravel * 690,
          width: 76,
          opacity:
            shimmerActivity * Math.sin(shimmerTravel * Math.PI) * 0.48,
          transform: 'rotate(16deg)',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(135,255,221,0.28), rgba(255,255,255,0))',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

const PanelHeader: React.FC<{time: number; success: number}> = ({
  time,
  success,
}) => {
  const pulse = 0.5 + Math.sin(time * 3.8) * 0.5;
  return (
    <div
      style={{
        position: 'absolute',
        left: 33,
        right: 33,
        top: 24,
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(168, 230, 232, 0.1)',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
        <div
          style={{
            width: 31,
            height: 31,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #1fe0a0, #15977f)',
            boxShadow: '0 0 24px rgba(32, 224, 159, 0.23)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              d="M3 9.5 L7 13 L15 4"
              fill="none"
              stroke="#effff9"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div
            style={{
              color: COLORS.textSoft,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2.5,
            }}
          >
            SECURE PAYMENT
          </div>
          <div
            style={{
              marginTop: 2,
              color: COLORS.textDim,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.6,
            }}
          >
            DIGITAL TRANSACTION
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: success > 0.5 ? COLORS.mint : COLORS.cyan,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.8,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: success > 0.5 ? COLORS.green : COLORS.cyan,
            boxShadow: `0 0 ${8 + pulse * 8}px ${
              success > 0.5 ? COLORS.green : COLORS.cyan
            }`,
          }}
        />
        {success > 0.5 ? 'PAYMENT COMPLETE' : 'LIVE PROCESSING'}
      </div>
    </div>
  );
};

const SuccessBurst: React.FC<{time: number; success: number}> = ({
  time,
  success,
}) => {
  const burst = phase(time, 4.18, 4.5) * (1 - phase(time, 4.95, 5.38));
  const rays = Array.from({length: 16});

  return (
    <svg
      width="1160"
      height="700"
      viewBox="0 0 1160 700"
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      <defs>
        <radialGradient id="successFlash">
          <stop offset="0" stopColor={COLORS.mint} stopOpacity="0.24" />
          <stop offset="0.52" stopColor={COLORS.green} stopOpacity="0.08" />
          <stop offset="1" stopColor={COLORS.green} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="930"
        cy="275"
        r={70 + success * 280}
        fill="url(#successFlash)"
        opacity={burst}
      />
      <g transform="translate(930 275)" opacity={burst}>
        {rays.map((_, index) => {
          const angle = (index / rays.length) * Math.PI * 2;
          const inner = 117 + success * 16;
          const outer = 132 + success * (index % 2 === 0 ? 90 : 55);
          return (
            <line
              key={`ray-${index}`}
              x1={Math.cos(angle) * inner}
              y1={Math.sin(angle) * inner}
              x2={Math.cos(angle) * outer}
              y2={Math.sin(angle) * outer}
              stroke={index % 3 === 0 ? COLORS.cyan : COLORS.mint}
              strokeWidth={index % 2 === 0 ? 2.2 : 1.2}
              strokeLinecap="round"
              opacity={0.24 + (index % 4) * 0.1}
            />
          );
        })}
      </g>
    </svg>
  );
};

const MainPanel: React.FC<{time: number; outro: number}> = ({time, outro}) => {
  const panelEntrance = phase(time, 0.52, 1.62);
  const panelEase = easeOutBack(panelEntrance);
  const cardEntrance = phase(time, 0.95, 1.95);
  const scan = phase(time, 1.95, 4.25);
  const success = phase(time, 4.2, 4.95);
  const beam = phase(time, 2.0, 3.15) * (1 - success * 0.88);
  const scanLineProgress = clamp01((time - 2.15) / 2.85);
  const heroPush = phase(time, 7.7, 12.5);
  const floatY = Math.sin(time * 0.92) * 5;
  const floatX = Math.sin(time * 0.44) * 2.4;
  const rotationY = (1 - panelEase) * -11 + Math.sin(time * 0.35) * 0.45;
  const rotationX = (1 - panelEase) * 5 + Math.sin(time * 0.48) * 0.25;
  const outroScale = 1 - outro * 0.045;

  return (
    <div
      style={{
        position: 'absolute',
        left: 380,
        top: 185,
        width: 1160,
        height: 700,
        opacity: panelEntrance,
        transformStyle: 'preserve-3d',
        transform: `perspective(1700px) translate3d(${(1 - panelEase) * 80 + floatX}px, ${
          (1 - panelEase) * 68 + floatY + outro * 35
        }px, 0) rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${
          (0.91 + panelEase * 0.09) * outroScale * (1 + heroPush * 0.018)
        })`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 42,
          background:
            'linear-gradient(135deg, rgba(17, 47, 59, 0.91) 0%, rgba(5, 20, 28, 0.94) 52%, rgba(7, 31, 36, 0.93) 100%)',
          border: '1px solid rgba(185, 243, 239, 0.18)',
          boxShadow:
            '0 65px 150px rgba(0,0,0,0.56), 0 18px 54px rgba(15, 197, 157, 0.09), inset 0 1px 0 rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 650,
            height: 650,
            right: -220,
            top: -280,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(41, 230, 168, 0.14), rgba(41, 230, 168, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 566,
            top: 78,
            bottom: 36,
            width: 1,
            background:
              'linear-gradient(180deg, rgba(161,230,232,0), rgba(161,230,232,0.14), rgba(161,230,232,0))',
          }}
        />
        <PanelHeader time={time} success={success} />
        <DigitalCard time={time} entrance={cardEntrance} />
        <ReceiptPanel time={time} />
        <DataBeam time={time} activation={beam} success={success} />
        <VerificationCore time={time} scan={scan} success={success} />
        <TransactionDetails time={time} success={success} />
        <SuccessBurst time={time} success={success} />

        <div
          style={{
            position: 'absolute',
            right: 55,
            bottom: 30,
            display: 'flex',
            gap: 9,
          }}
        >
          <StatusPill label="INSTANT" icon="bolt" delay={6.15} time={time} />
          <StatusPill label="ENCRYPTED" icon="lock" delay={6.4} time={time} />
          <StatusPill label="VERIFIED" icon="check" delay={6.65} time={time} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 34,
            right: 34,
            top: 0,
            height: 2,
            opacity:
              phase(time, 2.15, 2.5) * (1 - phase(time, 4.72, 5.08)),
            transform: `translateY(${70 + scanLineProgress * 540}px)`,
            background:
              'linear-gradient(90deg, rgba(73,216,255,0), rgba(92,235,219,0.5), rgba(73,216,255,0))',
            boxShadow: '0 0 16px rgba(72, 226, 204, 0.25)',
          }}
        />
      </div>
    </div>
  );
};

const CornerCopy: React.FC<{time: number}> = ({time}) => {
  const entrance = phase(time, 0.7, 1.55);
  const progress = phase(time, 2.0, 4.2);
  const success = phase(time, 4.2, 4.95);
  const progressVisibility = 1 - phase(time, 7.08, 7.55);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 82,
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          opacity: entrance,
          transform: `translateX(${(1 - entrance) * -24}px)`,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: COLORS.green,
            boxShadow: '0 0 18px rgba(36, 227, 154, 0.7)',
          }}
        />
        <div
          style={{
            color: COLORS.textSoft,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 3.3,
          }}
        >
          FINTECH / PAYMENT CONFIRMATION
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 94,
          bottom: 78,
          width: 250,
          opacity: entrance * progressVisibility,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: COLORS.textDim,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          <span>TRANSACTION</span>
          <span style={{color: success > 0.5 ? COLORS.mint : COLORS.cyan}}>
            {success > 0.5 ? '100%' : `${Math.round(progress * 96)}%`}
          </span>
        </div>
        <div
          style={{
            marginTop: 11,
            height: 2,
            borderRadius: 2,
            overflow: 'hidden',
            background: 'rgba(167, 229, 231, 0.1)',
          }}
        >
          <div
            style={{
              width: `${success > 0.5 ? 100 : progress * 96}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.mint})`,
              boxShadow: '0 0 12px rgba(82, 231, 211, 0.5)',
            }}
          />
        </div>
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // The full animation is authored as a 15-second normalized timeline.
  // Normalization keeps every timing range valid if the host composition differs.
  const normalizedFrame = frame / Math.max(1, durationInFrames - 1);
  const time = clamp01(normalizedFrame) * 15;
  const intro = phase(time, 0, 0.52);
  const outro = phase(time, 13.85, 15);
  const success = phase(time, 4.2, 4.95);
  const globalOpacity = intro * (1 - outro);

  return (
    <AbsoluteFill
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: COLORS.backgroundDeep,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <Background time={time} success={success} />
      <div style={{position: 'absolute', inset: 0}}>
        <CornerCopy time={time} />
        <MainPanel time={time} outro={outro} />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 170px rgba(0,0,0,0.48)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 1 - globalOpacity,
          background: COLORS.backgroundDeep,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
