import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;

const PALETTE = {
  ink: '#02070d',
  navy: '#06131d',
  glass: '#0b2430',
  glassLight: '#153b48',
  cyan: '#55ddff',
  aqua: '#6fffe0',
  mint: '#48f0b2',
  green: '#24df8f',
  greenDeep: '#07965f',
  violet: '#8e8cff',
  white: '#f5fffd',
  soft: '#b4d0d7',
  muted: '#6f919c',
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (value: number) => {
  const v = clamp01(value);
  return v * v * (3 - 2 * v);
};

const phase = (time: number, start: number, end: number) =>
  smoothstep((time - start) / Math.max(0.0001, end - start));

const easeOutBack = (value: number) => {
  const v = clamp01(value);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2);
};

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const cubicPoint = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  value: number,
) => {
  const v = clamp01(value);
  const inverse = 1 - v;
  return (
    inverse * inverse * inverse * p0 +
    3 * inverse * inverse * v * p1 +
    3 * inverse * v * v * p2 +
    v * v * v * p3
  );
};

const formatAmount = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ambientDots = [
  {x: 88, y: 188, r: 2, seed: 0.2},
  {x: 214, y: 92, r: 3, seed: 1.1},
  {x: 360, y: 262, r: 2, seed: 2.4},
  {x: 526, y: 122, r: 2, seed: 0.8},
  {x: 704, y: 220, r: 3, seed: 2.8},
  {x: 884, y: 92, r: 2, seed: 1.7},
  {x: 1054, y: 170, r: 2, seed: 0.4},
  {x: 1234, y: 88, r: 3, seed: 2.1},
  {x: 1410, y: 206, r: 2, seed: 1.3},
  {x: 1588, y: 110, r: 2, seed: 2.9},
  {x: 1776, y: 238, r: 3, seed: 0.6},
  {x: 102, y: 842, r: 3, seed: 2.6},
  {x: 262, y: 958, r: 2, seed: 1.5},
  {x: 446, y: 836, r: 2, seed: 0.3},
  {x: 626, y: 974, r: 3, seed: 2.2},
  {x: 812, y: 854, r: 2, seed: 1.0},
  {x: 1002, y: 962, r: 2, seed: 2.7},
  {x: 1196, y: 842, r: 3, seed: 0.7},
  {x: 1386, y: 972, r: 2, seed: 1.9},
  {x: 1570, y: 834, r: 3, seed: 2.5},
  {x: 1764, y: 948, r: 2, seed: 1.2},
];

const AmbientBackground: React.FC<{
  time: number;
  success: number;
}> = ({time, success}) => {
  const drift = (time * 22) % 90;
  const breathe = 0.5 + Math.sin(time * 0.72) * 0.5;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 72% 42%, #103842 0%, #081c27 28%, #04111a 58%, #02070d 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 930,
          height: 930,
          left: 850,
          top: -250,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(68,242,189,0.14), rgba(63,206,220,0.055) 38%, rgba(1,8,13,0) 70%)',
          transform: `scale(${0.96 + breathe * 0.06 + success * 0.05})`,
          filter: 'blur(8px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          left: -190,
          top: 390,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(86,122,255,0.09), rgba(20,66,91,0.025) 47%, rgba(1,8,13,0) 72%)',
          transform: `translate(${Math.sin(time * 0.31) * 18}px, ${Math.cos(time * 0.27) * 12}px)`,
          filter: 'blur(10px)',
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="haloGridVertical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PALETTE.cyan} stopOpacity="0" />
            <stop offset="0.48" stopColor={PALETTE.cyan} stopOpacity="0.11" />
            <stop offset="1" stopColor={PALETTE.cyan} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="haloGridHorizontal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={PALETTE.aqua} stopOpacity="0" />
            <stop offset="0.5" stopColor={PALETTE.aqua} stopOpacity="0.1" />
            <stop offset="1" stopColor={PALETTE.aqua} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ambientDotGlow">
            <stop offset="0" stopColor={PALETTE.aqua} stopOpacity="0.72" />
            <stop offset="1" stopColor={PALETTE.aqua} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g opacity="0.42" transform={`translate(0 ${drift})`}>
          {Array.from({length: 17}).map((_, rawIndex) => {
            const index = rawIndex - 1;
            return (
              <line
                key={`grid-h-${index}`}
                x1="0"
                x2={WIDTH}
                y1={index * 90}
                y2={index * 90}
                stroke="url(#haloGridHorizontal)"
                strokeWidth="1"
              />
            );
          })}
        </g>
        <g opacity="0.26">
          {Array.from({length: 22}).map((_, index) => (
            <line
              key={`grid-v-${index}`}
              x1={index * 92}
              x2={index * 92}
              y1="0"
              y2={HEIGHT}
              stroke="url(#haloGridVertical)"
              strokeWidth="1"
            />
          ))}
        </g>

        {ambientDots.map((dot, index) => {
          const pulse = 0.5 + Math.sin(time * 1.4 + dot.seed * 4) * 0.5;
          return (
            <g key={`ambient-${index}`}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r={16 + pulse * 8}
                fill="url(#ambientDotGlow)"
                opacity={0.025 + pulse * 0.05 + success * 0.025}
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                fill={index % 4 === 0 ? PALETTE.aqua : PALETTE.cyan}
                opacity={0.14 + pulse * 0.18 + success * 0.08}
              />
            </g>
          );
        })}

        <g
          fill="none"
          stroke={PALETTE.aqua}
          opacity={0.055 + success * 0.035}
          transform={`rotate(${time * 2.4} 1060 510)`}
        >
          <ellipse cx="1060" cy="510" rx="820" ry="330" strokeWidth="1" />
          <ellipse
            cx="1060"
            cy="510"
            rx="630"
            ry="520"
            strokeWidth="1"
            transform="rotate(31 1060 510)"
          />
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.018) 4px)',
          mixBlendMode: 'overlay',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0.015) 24%, rgba(0,0,0,0.015) 76%, rgba(0,0,0,0.4))',
        }}
      />
    </AbsoluteFill>
  );
};

const GlassArchitecture: React.FC<{time: number}> = ({time}) => {
  const entrance = phase(time, 0.05, 1.05);
  const slowDrift = Math.sin(time * 0.38);
  const layers = [
    {left: 74, top: 128, width: 610, height: 790, rotate: -5.5, delay: 0},
    {left: 1160, top: 150, width: 620, height: 700, rotate: 5.5, delay: 0.12},
    {left: 636, top: 176, width: 650, height: 670, rotate: 0.7, delay: 0.24},
  ];

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {layers.map((layer, index) => {
        const local = easeOutBack(phase(time, 0.05 + layer.delay, 1.05 + layer.delay));
        return (
          <div
            key={`glass-layer-${index}`}
            style={{
              position: 'absolute',
              left: layer.left,
              top: layer.top,
              width: layer.width,
              height: layer.height,
              borderRadius: 54,
              opacity: local * (index === 2 ? 0.28 : 0.4),
              transform: `perspective(1300px) translate3d(${(1 - local) * (index === 0 ? -100 : 100)}px, ${(1 - local) * 90 + slowDrift * (index - 1) * 3}px, 0) rotateZ(${layer.rotate}deg) rotateY(${(index - 1) * 4}deg)`,
              background:
                index === 2
                  ? 'linear-gradient(140deg, rgba(95,229,238,0.045), rgba(12,53,67,0.05))'
                  : 'linear-gradient(145deg, rgba(155,245,242,0.06), rgba(12,48,60,0.025))',
              border: '1px solid rgba(170,244,240,0.12)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.055), 0 36px 100px rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 34,
                right: 34,
                top: 28,
                height: 1,
                background:
                  'linear-gradient(90deg, rgba(102,232,236,0), rgba(152,255,242,0.34), rgba(102,232,236,0))',
              }}
            />
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 790,
          width: 1580,
          height: 270,
          opacity: entrance * 0.38,
          transform: `perspective(900px) rotateX(68deg) translateY(${80 + slowDrift * 4}px)`,
          transformOrigin: '50% 0%',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(67,218,203,0.13), rgba(18,77,88,0.035) 42%, rgba(0,0,0,0) 72%)',
          borderTop: '1px solid rgba(104,245,222,0.09)',
          filter: 'blur(0.5px)',
        }}
      />
    </div>
  );
};

const ContactlessGlyph: React.FC<{
  size?: number;
  color?: string;
  pulse?: number;
}> = ({size = 52, color = PALETTE.white, pulse = 0}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx="17" cy="32" r="4.3" fill={color} opacity={0.9} />
    {[16, 26, 36].map((radius, index) => (
      <path
        key={`contactless-${radius}`}
        d={`M 21 ${32 - radius * 0.52} Q ${21 + radius * 0.82} 32 21 ${
          32 + radius * 0.52
        }`}
        fill="none"
        stroke={color}
        strokeWidth={3.6 - index * 0.25}
        strokeLinecap="round"
        opacity={0.35 + index * 0.2 + pulse * 0.1}
      />
    ))}
  </svg>
);

const CardChip: React.FC = () => (
  <svg width="72" height="56" viewBox="0 0 72 56">
    <defs>
      <linearGradient id="haloChipGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff1bd" />
        <stop offset="0.46" stopColor="#c7a04a" />
        <stop offset="1" stopColor="#ffefaa" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="70" height="54" rx="12" fill="url(#haloChipGold)" />
    <g fill="none" stroke="#7c632b" strokeWidth="1.8" opacity="0.7">
      <path d="M 25 1 V 55 M 47 1 V 55 M 1 20 H 71 M 1 37 H 71" />
      <rect x="25" y="20" width="22" height="17" rx="3" />
    </g>
  </svg>
);

const DigitalCard: React.FC<{
  time: number;
  entrance: number;
  transfer: number;
}> = ({time, entrance, transfer}) => {
  const enter = easeOutBack(entrance);
  const shimmer = ((Math.max(0, time - 0.8) * 0.32) % 1) * 580 - 110;
  const pulse = 0.5 + Math.sin(time * 4.2) * 0.5;

  return (
    <div
      style={{
        position: 'absolute',
        left: 45,
        top: 164,
        width: 386,
        height: 240,
        borderRadius: 31,
        overflow: 'hidden',
        opacity: clamp01(entrance),
        transformStyle: 'preserve-3d',
        transform: `translate3d(${(1 - enter) * -84 + transfer * 22}px, ${(1 - enter) * 70 - transfer * 8 + Math.sin(time * 0.95) * 3}px, ${enter * 82}px) rotateY(${(1 - enter) * 16 - 5}deg) rotateZ(${(1 - enter) * -6 + Math.sin(time * 0.72) * 0.5}deg)`,
        background:
          'linear-gradient(132deg, #173b56 0%, #0b2738 45%, #0c725f 100%)',
        border: '1px solid rgba(212,255,247,0.34)',
        boxShadow:
          '0 34px 70px rgba(0,0,0,0.46), 0 10px 36px rgba(34,224,177,0.11), inset 0 1px 0 rgba(255,255,255,0.22)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 290,
          height: 290,
          left: -116,
          top: -124,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(90,220,255,0.34), rgba(90,220,255,0) 69%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          right: -185,
          bottom: -245,
          borderRadius: '50%',
          border: '1px solid rgba(126,255,217,0.34)',
          boxShadow: '0 0 64px rgba(30,232,167,0.13)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: shimmer,
          top: -88,
          width: 72,
          height: 420,
          transform: 'rotate(17deg)',
          opacity: 0.42,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(212,255,247,0.36), rgba(255,255,255,0))',
          filter: 'blur(3px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 27,
          right: 24,
          top: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              color: '#eafffa',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2.7,
            }}
          >
            DIGITAL CARD
          </div>
          <div
            style={{
              marginTop: 5,
              color: 'rgba(226,255,249,0.55)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.8,
            }}
          >
            TOKENIZED PAYMENT
          </div>
        </div>
        <ContactlessGlyph size={48} pulse={pulse} />
      </div>
      <div style={{position: 'absolute', left: 27, top: 89}}>
        <CardChip />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 27,
          bottom: 49,
          color: PALETTE.white,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 5.2,
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 2px 14px rgba(0,0,0,0.35)',
        }}
      >
        ••••&nbsp;&nbsp;4827
      </div>
      <div
        style={{
          position: 'absolute',
          left: 28,
          bottom: 21,
          color: 'rgba(229,255,250,0.62)',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.1,
        }}
      >
        SECURE WALLET
      </div>
    </div>
  );
};

const Phone: React.FC<{
  time: number;
  entrance: number;
  transfer: number;
  success: number;
}> = ({time, entrance, transfer, success}) => {
  const enter = easeOutBack(entrance);
  const float = Math.sin(time * 0.75) * 4;
  const statusPulse = 0.5 + Math.sin(time * 3.5) * 0.5;
  const readyOpacity = 1 - phase(time, 4.35, 5.05);
  const processingOpacity =
    phase(time, 4.45, 5.08) * (1 - phase(time, 7.08, 7.7));
  const completeOpacity = phase(time, 7.35, 8.2);

  return (
    <div
      style={{
        position: 'absolute',
        left: 168,
        top: 178,
        width: 470,
        height: 720,
        opacity: entrance,
        transformStyle: 'preserve-3d',
        transform: `perspective(1500px) translate3d(${(1 - enter) * -150}px, ${(1 - enter) * 90 + float}px, 0) rotateY(${(1 - enter) * 14 + 5.5}deg) rotateX(${(1 - enter) * 4 - 1.5}deg) rotateZ(${-3.2 + Math.sin(time * 0.43) * 0.22}deg) scale(${0.92 + enter * 0.08})`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 14,
          right: -9,
          top: 24,
          bottom: -28,
          borderRadius: 82,
          background: 'rgba(0,0,0,0.47)',
          filter: 'blur(28px)',
          transform: 'translateZ(-80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 74,
          background:
            'linear-gradient(145deg, #2b4e5a 0%, #0a1820 17%, #02070c 70%, #183540 100%)',
          border: '1px solid rgba(218,255,250,0.26)',
          boxShadow:
            '0 42px 100px rgba(0,0,0,0.48), inset 0 2px 1px rgba(255,255,255,0.15), inset -8px -8px 20px rgba(0,0,0,0.34)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: 18,
          width: 434,
          height: 684,
          borderRadius: 60,
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 72% 34%, rgba(45,209,178,0.2), rgba(6,26,36,0) 42%), linear-gradient(160deg, #0c2735, #06131c 58%, #08252b)',
          border: '1px solid rgba(125,228,222,0.14)',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 151,
            top: 12,
            width: 132,
            height: 31,
            borderRadius: 20,
            background: '#02070b',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 24,
              top: 11,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#142a34',
              boxShadow: 'inset 0 0 4px rgba(92,220,255,0.32)',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 31,
            right: 31,
            top: 65,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: PALETTE.soft,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2.8,
              }}
            >
              MOBILE WALLET
            </div>
            <div
              style={{
                marginTop: 7,
                color: PALETTE.white,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.3,
              }}
            >
              Tap to pay
            </div>
          </div>
          <div
            style={{
              width: 43,
              height: 43,
              borderRadius: 15,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(84,230,203,0.09)',
              border: '1px solid rgba(120,255,226,0.17)',
            }}
          >
            <svg width="22" height="25" viewBox="0 0 22 25">
              <rect x="3" y="10" width="16" height="12" rx="4" fill="none" stroke={PALETTE.aqua} strokeWidth="2" />
              <path d="M7 10 V7 C7 1 15 1 15 7 V10" fill="none" stroke={PALETTE.aqua} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 32,
            right: 32,
            bottom: 82,
            height: 82,
            borderRadius: 23,
            display: 'flex',
            alignItems: 'center',
            gap: 17,
            padding: '0 20px',
            boxSizing: 'border-box',
            background: 'rgba(12,47,57,0.48)',
            border: '1px solid rgba(154,236,231,0.12)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: completeOpacity > 0.5 ? 'rgba(36,223,143,0.18)' : 'rgba(85,221,255,0.1)',
              border: `1px solid ${completeOpacity > 0.5 ? 'rgba(72,240,178,0.42)' : 'rgba(85,221,255,0.27)'}`,
              boxShadow: `0 0 ${10 + statusPulse * 10}px ${completeOpacity > 0.5 ? 'rgba(36,223,143,0.14)' : 'rgba(85,221,255,0.08)'}`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: completeOpacity > 0.5 ? PALETTE.green : PALETTE.cyan,
              }}
            />
          </div>
          <div style={{position: 'relative', height: 42, flex: 1}}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: readyOpacity,
                transform: `translateY(${-processingOpacity * 8}px)`,
              }}
            >
              <div style={{color: PALETTE.white, fontSize: 15, fontWeight: 700}}>Ready for contactless</div>
              <div style={{marginTop: 5, color: PALETTE.muted, fontSize: 10, fontWeight: 800, letterSpacing: 1.7}}>HOLD NEAR READER</div>
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: processingOpacity,
                transform: `translateY(${(1 - processingOpacity) * 10 - completeOpacity * 8}px)`,
              }}
            >
              <div style={{color: PALETTE.aqua, fontSize: 15, fontWeight: 700}}>Authorizing payment</div>
              <div style={{marginTop: 5, color: PALETTE.muted, fontSize: 10, fontWeight: 800, letterSpacing: 1.7}}>SECURE TOKEN EXCHANGE</div>
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: completeOpacity,
                transform: `translateY(${(1 - completeOpacity) * 10}px)`,
              }}
            >
              <div style={{color: PALETTE.mint, fontSize: 15, fontWeight: 700}}>Payment complete</div>
              <div style={{marginTop: 5, color: PALETTE.muted, fontSize: 10, fontWeight: 800, letterSpacing: 1.7}}>TOKEN VERIFIED</div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 32,
            right: 32,
            bottom: 49,
            display: 'flex',
            justifyContent: 'space-between',
            color: 'rgba(159,198,207,0.54)',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 1.8,
          }}
        >
          <span>ENCRYPTED</span>
          <span>NFC ACTIVE</span>
        </div>
      </div>
      <DigitalCard time={time} entrance={phase(time, 0.72, 1.72)} transfer={transfer} />

      <div
        style={{
          position: 'absolute',
          left: 143,
          bottom: 7,
          width: 184,
          height: 5,
          borderRadius: 4,
          background: 'rgba(209,255,247,0.26)',
          opacity: 0.48,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -8,
          top: 162,
          width: 8,
          height: 94,
          borderRadius: 6,
          background: 'linear-gradient(#355463, #0b1921)',
          boxShadow: 'inset 1px 0 rgba(255,255,255,0.12)',
        }}
      />
    </div>
  );
};

const TerminalKey: React.FC<{
  label?: string;
  accent?: 'red' | 'green';
}> = ({label, accent}) => {
  const accentColor =
    accent === 'green' ? PALETTE.green : accent === 'red' ? '#ff7f87' : PALETTE.soft;
  return (
    <div
      style={{
        width: 70,
        height: 45,
        borderRadius: 12,
        display: 'grid',
        placeItems: 'center',
        color: accentColor,
        fontSize: 13,
        fontWeight: 800,
        background: 'linear-gradient(145deg, #16313d, #091821)',
        border: '1px solid rgba(190,238,239,0.12)',
        boxShadow: '0 5px 10px rgba(0,0,0,0.24), inset 0 1px rgba(255,255,255,0.055)',
      }}
    >
      {accent === 'green' ? (
        <svg width="22" height="16" viewBox="0 0 22 16">
          <path d="M2 8 L8 14 L20 2" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : accent === 'red' ? (
        <svg width="17" height="17" viewBox="0 0 17 17">
          <path d="M2 2 L15 15 M15 2 L2 15" fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ) : (
        label
      )}
    </div>
  );
};

const TerminalScreen: React.FC<{
  time: number;
  impact: number;
  progress: number;
  success: number;
}> = ({time, impact, progress, success}) => {
  const idle = 1 - phase(time, 4.45, 5.0);
  const authorize = phase(time, 4.45, 5.1) * (1 - phase(time, 7.12, 7.72));
  const approved = phase(time, 7.18, 8.0);
  const sweep = ((Math.max(0, time - 4.5) * 0.44) % 1) * 330 - 48;

  return (
    <div
      style={{
        position: 'absolute',
        left: 35,
        top: 155,
        width: 320,
        height: 202,
        borderRadius: 25,
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 70% 20%, rgba(45,224,188,0.17), rgba(7,27,36,0) 45%), linear-gradient(155deg, #0a2531, #041018)',
        border: `1px solid rgba(130,240,224,${0.14 + impact * 0.25 + success * 0.16})`,
        boxShadow: `inset 0 0 36px rgba(0,0,0,0.3), 0 0 ${impact * 26}px rgba(70,238,203,0.12)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          top: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: PALETTE.muted,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 1.7,
        }}
      >
        <span>PAYMENT TERMINAL</span>
        <span style={{color: success > 0.5 ? PALETTE.green : PALETTE.cyan}}>
          {success > 0.5 ? 'APPROVED' : 'ONLINE'}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 60,
          textAlign: 'center',
          opacity: idle,
          transform: `translateY(${(1 - idle) * -9}px)`,
        }}
      >
        <div style={{margin: '0 auto', width: 54, height: 54}}>
          <ContactlessGlyph size={54} color={PALETTE.cyan} pulse={0.5 + Math.sin(time * 4) * 0.5} />
        </div>
        <div style={{marginTop: 10, color: PALETTE.soft, fontSize: 11, fontWeight: 800, letterSpacing: 2.1}}>READY TO TAP</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 67,
          textAlign: 'center',
          opacity: authorize,
          transform: `translateY(${(1 - authorize) * 9}px)`,
        }}
      >
        <div style={{color: PALETTE.white, fontSize: 15, fontWeight: 700}}>Authorizing payment</div>
        <div
          style={{
            width: 214,
            height: 5,
            margin: '21px auto 0',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(140,211,216,0.11)',
          }}
        >
          <div
            style={{
              width: `${Math.max(4, progress * 100)}%`,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(90deg, ${PALETTE.cyan}, ${PALETTE.aqua})`,
              boxShadow: '0 0 13px rgba(81,235,215,0.58)',
            }}
          />
        </div>
        <div style={{marginTop: 13, color: PALETTE.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1.8}}>SECURE TOKEN EXCHANGE</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 55,
          textAlign: 'center',
          opacity: approved,
          transform: `translateY(${(1 - approved) * 13}px)`,
        }}
      >
        <div
          style={{
            width: 55,
            height: 55,
            margin: '0 auto',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(36,223,143,0.16)',
            border: '1px solid rgba(72,240,178,0.38)',
            boxShadow: '0 0 24px rgba(36,223,143,0.17)',
          }}
        >
          <svg width="32" height="24" viewBox="0 0 32 24">
            <path d="M3 12 L12 21 L29 3" fill="none" stroke={PALETTE.mint} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{marginTop: 12, color: PALETTE.mint, fontSize: 12, fontWeight: 800, letterSpacing: 2.3}}>PAYMENT APPROVED</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: sweep,
          top: -40,
          width: 52,
          height: 290,
          opacity: authorize * 0.4,
          transform: 'rotate(13deg)',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(117,255,224,0.28), rgba(255,255,255,0))',
          filter: 'blur(2px)',
        }}
      />
    </div>
  );
};

const PaymentTerminal: React.FC<{
  time: number;
  entrance: number;
  impact: number;
  progress: number;
  success: number;
}> = ({time, entrance, impact, progress, success}) => {
  const enter = easeOutBack(entrance);
  const float = Math.sin(time * 0.69 + 1.2) * 4;
  const sensorPulse = 0.5 + Math.sin(time * 3.8) * 0.5;
  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      style={{
        position: 'absolute',
        left: 1324,
        top: 213,
        width: 390,
        height: 650,
        opacity: entrance,
        transformStyle: 'preserve-3d',
        transform: `perspective(1500px) translate3d(${(1 - enter) * 165}px, ${(1 - enter) * 96 + float}px, 0) rotateY(${(1 - enter) * -16 - 7}deg) rotateX(${(1 - enter) * 5 + 1.5}deg) rotateZ(${3.1 + Math.sin(time * 0.41) * 0.2}deg) scale(${0.91 + enter * 0.09 + impact * 0.012})`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: -10,
          top: 30,
          bottom: -30,
          borderRadius: 66,
          background: 'rgba(0,0,0,0.5)',
          filter: 'blur(28px)',
          transform: 'translateZ(-90px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '64px 64px 78px 78px',
          background:
            'linear-gradient(145deg, #294b58 0%, #122a35 12%, #08151d 58%, #17313b 100%)',
          border: '1px solid rgba(220,255,251,0.24)',
          boxShadow:
            '0 46px 100px rgba(0,0,0,0.5), inset 2px 2px 1px rgba(255,255,255,0.12), inset -7px -8px 20px rgba(0,0,0,0.34)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 133,
          top: 40,
          width: 124,
          height: 88,
          borderRadius: 32,
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(circle, rgba(52,223,190,0.17), rgba(10,32,41,0.3) 60%, rgba(5,18,25,0.8))',
          border: `1px solid rgba(99,241,213,${0.15 + impact * 0.42})`,
          boxShadow: `0 0 ${12 + impact * 38}px rgba(64,239,195,${0.05 + impact * 0.2})`,
        }}
      >
        {[0, 1, 2].map((index) => {
          const ripple = (Math.max(0, time - 3.9) * 0.7 + index / 3) % 1;
          return (
            <div
              key={`terminal-ripple-${index}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 62,
                height: 62,
                borderRadius: '50%',
                border: '1px solid rgba(81,247,205,0.44)',
                opacity: impact * (1 - ripple) * 0.6,
                transform: `translate(-50%, -50%) scale(${0.55 + ripple * 1.15})`,
              }}
            />
          );
        })}
        <ContactlessGlyph size={62} color={success > 0.5 ? PALETTE.green : PALETTE.aqua} pulse={sensorPulse + impact * 0.5} />
      </div>
      <TerminalScreen time={time} impact={impact} progress={progress} success={success} />

      <div
        style={{
          position: 'absolute',
          left: 50,
          right: 50,
          top: 387,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 70px)',
          justifyContent: 'space-between',
          gap: '13px 16px',
        }}
      >
        {keypad.map((label) => (
          <TerminalKey key={label} label={label} />
        ))}
        <TerminalKey accent="red" />
        <TerminalKey label="0" />
        <TerminalKey accent="green" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 101,
          bottom: 30,
          width: 188,
          height: 8,
          borderRadius: 8,
          background: '#03090e',
          boxShadow: 'inset 0 1px rgba(255,255,255,0.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          top: 10,
          height: 1,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(232,255,252,0.28), rgba(255,255,255,0))',
          opacity: 0.65,
        }}
      />
    </div>
  );
};

const TransferBridge: React.FC<{
  time: number;
  transfer: number;
  impact: number;
  fade: number;
}> = ({time, transfer, impact, fade}) => {
  const paths = [
    {d: 'M 598 501 C 790 388, 1010 365, 1360 341', yOffset: -20},
    {d: 'M 603 520 C 812 440, 1045 408, 1360 356', yOffset: 0},
    {d: 'M 598 539 C 802 493, 1042 460, 1360 371', yOffset: 20},
  ];
  const bridgeOpacity = transfer * (1 - fade * 0.9);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}
    >
      <defs>
        <linearGradient id="haloBridgeGradient" gradientUnits="userSpaceOnUse" x1="590" y1="0" x2="1370" y2="0">
          <stop offset="0" stopColor={PALETTE.cyan} stopOpacity="0.16" />
          <stop offset="0.45" stopColor={PALETTE.aqua} stopOpacity="0.95" />
          <stop offset="1" stopColor={PALETTE.green} stopOpacity="0.42" />
        </linearGradient>
        <filter id="haloBridgeGlow" x="-40%" y="-80%" width="180%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="haloImpactGlow">
          <stop offset="0" stopColor={PALETTE.mint} stopOpacity="0.62" />
          <stop offset="0.45" stopColor={PALETTE.green} stopOpacity="0.15" />
          <stop offset="1" stopColor={PALETTE.green} stopOpacity="0" />
        </radialGradient>
      </defs>

      {paths.map((path, index) => {
        const localReveal = phase(transfer, index * 0.09, 0.72 + index * 0.06);
        return (
          <g key={`bridge-path-${index}`} opacity={bridgeOpacity * (0.46 + index * 0.22)}>
            <path
              d={path.d}
              fill="none"
              stroke="rgba(116,221,229,0.12)"
              strokeWidth={index === 1 ? 13 : 8}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - localReveal}
            />
            <path
              d={path.d}
              fill="none"
              stroke="url(#haloBridgeGradient)"
              strokeWidth={index === 1 ? 3.4 : 2.1}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - localReveal}
              filter="url(#haloBridgeGlow)"
            />
          </g>
        );
      })}

      {Array.from({length: 13}).map((_, index) => {
        const travel = phase(time, 2.1 + index * 0.115, 4.62 + index * 0.115);
        const x = cubicPoint(603, 812, 1045, 1360, travel);
        const y = cubicPoint(520, 440, 408, 356, travel) + Math.sin(index * 2.1) * 13;
        const visible = phase(travel, 0.02, 0.14) * (1 - phase(travel, 0.88, 1));
        return (
          <g key={`transfer-particle-${index}`} opacity={visible * bridgeOpacity}>
            <circle cx={x} cy={y} r={13 + (index % 3) * 3} fill={PALETTE.aqua} opacity="0.08" />
            <circle cx={x} cy={y} r={index % 4 === 0 ? 4.1 : 2.7} fill={index % 3 === 0 ? PALETTE.white : PALETTE.aqua} />
          </g>
        );
      })}

      <circle cx="1360" cy="356" r={42 + impact * 115} fill="url(#haloImpactGlow)" opacity={impact * (1 - fade * 0.5)} />
      {[0, 1, 2].map((index) => {
        const ripple = phase(time, 4.28 + index * 0.12, 5.25 + index * 0.12);
        return (
          <circle
            key={`impact-ring-${index}`}
            cx="1360"
            cy="356"
            r={20 + ripple * 105}
            fill="none"
            stroke={index === 0 ? PALETTE.white : PALETTE.mint}
            strokeWidth={2.4 - index * 0.45}
            opacity={impact * (1 - ripple) * 0.72}
          />
        );
      })}
    </svg>
  );
};

const SuccessCheck: React.FC<{progress: number}> = ({progress}) => (
  <svg width="156" height="128" viewBox="0 0 156 128">
    <path
      d="M 18 67 L 58 105 L 139 22"
      fill="none"
      stroke={PALETTE.mint}
      strokeWidth="15"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      style={{filter: 'drop-shadow(0 0 13px rgba(72,240,178,0.48))'}}
    />
  </svg>
);

const VerificationHalo: React.FC<{
  time: number;
  entrance: number;
  progress: number;
  success: number;
}> = ({time, entrance, progress, success}) => {
  const enter = easeOutBack(entrance);
  const amount = 128.4 * phase(progress, 0.02, 0.9);
  const amountOut = phase(success, 0.02, 0.42);
  const check = phase(success, 0.3, 0.9);
  const title = phase(success, 0.46, 0.98);
  const micro = Math.sin(time * 1.12) * 0.006;
  const spin = time * 18;
  const rays = Array.from({length: 20});

  return (
    <div
      style={{
        position: 'absolute',
        left: 718,
        top: 224,
        width: 530,
        height: 590,
        opacity: entrance,
        transform: `translate3d(0, ${(1 - enter) * 38 + Math.sin(time * 0.83) * 3}px, 0) scale(${0.78 + enter * 0.22 + micro + success * 0.018})`,
        transformOrigin: '50% 48%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 38,
          top: 18,
          width: 454,
          height: 454,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(41,226,167,0.13), rgba(32,141,139,0.04) 46%, rgba(0,0,0,0) 71%)',
          opacity: 0.55 + success * 0.45,
          filter: 'blur(3px)',
        }}
      />

      <svg
        width="530"
        height="500"
        viewBox="0 0 530 500"
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="haloProgressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={PALETTE.cyan} />
            <stop offset="0.55" stopColor={PALETTE.aqua} />
            <stop offset="1" stopColor={PALETTE.green} />
          </linearGradient>
          <radialGradient id="haloCoreGlow">
            <stop offset="0" stopColor={PALETTE.green} stopOpacity="0.16" />
            <stop offset="1" stopColor={PALETTE.green} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="265" cy="248" r="222" fill="url(#haloCoreGlow)" opacity={success} />
        <circle cx="265" cy="248" r="190" fill="rgba(5,22,29,0.77)" stroke="rgba(142,237,230,0.1)" strokeWidth="2" />
        <circle cx="265" cy="248" r="165" fill="none" stroke="rgba(136,218,221,0.12)" strokeWidth="10" />
        <circle
          cx="265"
          cy="248"
          r="165"
          fill="none"
          stroke="url(#haloProgressGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          opacity={1 - success * 0.48}
          transform="rotate(-90 265 248)"
          style={{filter: 'drop-shadow(0 0 10px rgba(81,239,208,0.42))'}}
        />
        <circle
          cx="265"
          cy="248"
          r="165"
          fill="none"
          stroke={PALETTE.green}
          strokeWidth={7 + success * 3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - success}
          opacity={success}
          transform="rotate(-90 265 248)"
          style={{filter: 'drop-shadow(0 0 13px rgba(36,223,143,0.48))'}}
        />

        <g transform={`rotate(${spin} 265 248)`} opacity={0.25 + progress * 0.55 - success * 0.28}>
          <circle cx="265" cy="248" r="200" fill="none" stroke={PALETTE.cyan} strokeWidth="1.5" strokeDasharray="2 15 28 10" />
          <circle cx="265" cy="48" r="5" fill={PALETTE.white} />
        </g>
        <g transform={`rotate(${-spin * 0.58} 265 248)`} opacity={0.18 + progress * 0.35}>
          <circle cx="265" cy="248" r="181" fill="none" stroke={PALETTE.aqua} strokeWidth="1" strokeDasharray="1 12" />
        </g>

        <g transform="translate(265 248)" opacity={phase(success, 0.02, 0.35) * (1 - phase(success, 0.82, 1))}>
          {rays.map((_, index) => {
            const angle = (index / rays.length) * Math.PI * 2;
            const rayLength = index % 2 === 0 ? 62 : 38;
            const inner = 192 + success * 5;
            return (
              <line
                key={`halo-ray-${index}`}
                x1={Math.cos(angle) * inner}
                y1={Math.sin(angle) * inner}
                x2={Math.cos(angle) * (inner + rayLength * success)}
                y2={Math.sin(angle) * (inner + rayLength * success)}
                stroke={index % 3 === 0 ? PALETTE.cyan : PALETTE.mint}
                strokeWidth={index % 2 === 0 ? 2.2 : 1.2}
                strokeLinecap="round"
                opacity={0.28 + (index % 4) * 0.1}
              />
            );
          })}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 166,
          width: 370,
          height: 170,
          textAlign: 'center',
          opacity: 1 - amountOut,
          transform: `translateY(${-amountOut * 16}px) scale(${1 - amountOut * 0.06})`,
        }}
      >
        <div
          style={{
            color: PALETTE.muted,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 3.1,
          }}
        >
          TOTAL AMOUNT
        </div>
        <div
          style={{
            marginTop: 16,
            color: PALETTE.white,
            fontSize: 54,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: -1.2,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 30px rgba(94,235,217,0.16)',
          }}
        >
          ${formatAmount(amount)}
        </div>
        <div
          style={{
            marginTop: 20,
            color: PALETTE.aqua,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2.2,
          }}
        >
          {Math.round(progress * 100)}% VERIFIED
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 187,
          top: 181,
          width: 156,
          height: 128,
          opacity: success,
          transform: `translateY(${(1 - success) * 16}px) scale(${0.78 + success * 0.22})`,
        }}
      >
        <SuccessCheck progress={check} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: -65,
          right: -65,
          top: 474,
          textAlign: 'center',
          opacity: title,
          transform: `translateY(${(1 - title) * 24}px)`,
        }}
      >
        <div
          style={{
            color: PALETTE.white,
            fontSize: 42,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow: '0 12px 34px rgba(0,0,0,0.36)',
          }}
        >
          PAYMENT SUCCESSFUL
        </div>
        <div
          style={{
            marginTop: 14,
            color: PALETTE.mint,
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 2.5,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          $128.40&nbsp;&nbsp;•&nbsp;&nbsp;APPROVED
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{
  label: string;
  icon: 'lock' | 'wave' | 'bolt';
  time: number;
  delay: number;
}> = ({label, icon, time, delay}) => {
  const entrance = easeOutBack(phase(time, delay, delay + 0.65));
  return (
    <div
      style={{
        height: 40,
        padding: '0 15px 0 12px',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        opacity: clamp01(entrance),
        transform: `translateY(${(1 - entrance) * 20}px) scale(${0.84 + entrance * 0.16})`,
        background: 'rgba(13,48,56,0.48)',
        border: '1px solid rgba(119,246,217,0.15)',
        color: PALETTE.soft,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.75,
        boxShadow: 'inset 0 1px rgba(255,255,255,0.035)',
      }}
    >
      <svg width="19" height="19" viewBox="0 0 20 20">
        {icon === 'lock' ? (
          <>
            <rect x="4" y="9" width="12" height="9" rx="3" fill="none" stroke={PALETTE.mint} strokeWidth="1.8" />
            <path d="M7 9 V6 C7 2 13 2 13 6 V9" fill="none" stroke={PALETTE.mint} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : icon === 'wave' ? (
          <path d="M2 10 C5 5 7 5 10 10 C13 15 15 15 18 10" fill="none" stroke={PALETTE.mint} strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M11 1 L4 11 H9 L7 19 L16 8 H11 Z" fill={PALETTE.mint} />
        )}
      </svg>
      {label}
    </div>
  );
};

const FinalStatus: React.FC<{time: number; success: number}> = ({time, success}) => {
  const line = phase(time, 8.25, 9.0);
  return (
    <div
      style={{
        position: 'absolute',
        left: 690,
        top: 852,
        width: 600,
        height: 86,
        opacity: success,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 0,
          width: 520 * line,
          height: 1,
          transform: 'translateX(-50%)',
          background:
            'linear-gradient(90deg, rgba(82,232,214,0), rgba(112,255,224,0.36), rgba(82,232,214,0))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 27,
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <StatusBadge label="NFC VERIFIED" icon="wave" time={time} delay={8.35} />
        <StatusBadge label="TOKENIZED" icon="lock" time={time} delay={8.55} />
        <StatusBadge label="INSTANT" icon="bolt" time={time} delay={8.75} />
      </div>
    </div>
  );
};

const CornerInterface: React.FC<{time: number; success: number}> = ({
  time,
  success,
}) => {
  const entrance = phase(time, 0.35, 1.2);
  const pulse = 0.5 + Math.sin(time * 3.4) * 0.5;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 73,
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          opacity: entrance,
          transform: `translateX(${(1 - entrance) * -25}px)`,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: success > 0.5 ? PALETTE.green : PALETTE.cyan,
            boxShadow: `0 0 ${12 + pulse * 8}px ${success > 0.5 ? 'rgba(36,223,143,0.68)' : 'rgba(85,221,255,0.58)'}`,
          }}
        />
        <div style={{color: PALETTE.soft, fontSize: 11, fontWeight: 800, letterSpacing: 3.2}}>
          CONTACTLESS / PAYMENT GATEWAY
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 92,
          top: 73,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: entrance,
          color: PALETTE.muted,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.25,
        }}
      >
        <svg width="18" height="20" viewBox="0 0 18 20">
          <rect x="2" y="8" width="14" height="10" rx="4" fill="none" stroke={PALETTE.aqua} strokeWidth="1.7" />
          <path d="M5 8 V6 C5 1 13 1 13 6 V8" fill="none" stroke={PALETTE.aqua} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        ENCRYPTED SESSION
      </div>
    </>
  );
};

const Stage: React.FC<{
  time: number;
  outro: number;
}> = ({time, outro}) => {
  const phoneEntrance = phase(time, 0.22, 1.42);
  const terminalEntrance = phase(time, 1.08, 2.18);
  const transfer = phase(time, 1.78, 4.65);
  const impactRise = phase(time, 4.2, 4.72);
  const impactFall = 1 - phase(time, 5.08, 5.7);
  const impact = impactRise * impactFall;
  const haloEntrance = phase(time, 4.36, 5.28);
  const progress =
    phase(time, 4.75, 6.42) * 0.72 + phase(time, 6.56, 7.28) * 0.28;
  const success = phase(time, 7.15, 8.05);
  const bridgeFade = phase(time, 6.2, 7.7);

  const tracking = phase(time, 1.7, 4.75);
  const pushIn = phase(time, 4.75, 6.35) * (1 - phase(time, 8.05, 9.1));
  const dollyOut = phase(time, 8.15, 10.55);
  const cameraX = mix(34, -36, tracking) + dollyOut * 3;
  const cameraY = -pushIn * 7 + dollyOut * 10 + outro * 30;
  const cameraScale = 0.985 + pushIn * 0.05 - dollyOut * 0.055 - outro * 0.025;
  const cameraRoll = (1 - phase(time, 0.4, 2.3)) * -0.34 + Math.sin(time * 0.22) * 0.08;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transformStyle: 'preserve-3d',
        transform: `perspective(1800px) translate3d(${cameraX}px, ${cameraY}px, 0) scale(${cameraScale}) rotateZ(${cameraRoll}deg)`,
        transformOrigin: '50% 50%',
      }}
    >
      <GlassArchitecture time={time} />
      <Phone time={time} entrance={phoneEntrance} transfer={transfer} success={success} />
      <PaymentTerminal
        time={time}
        entrance={terminalEntrance}
        impact={impact}
        progress={progress}
        success={success}
      />
      <TransferBridge time={time} transfer={transfer} impact={impact} fade={bridgeFade} />
      <VerificationHalo
        time={time}
        entrance={haloEntrance}
        progress={progress}
        success={success}
      />
      <FinalStatus time={time} success={success} />
    </div>
  );
};

export const MotionFrame: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  // The animation is authored on a normalized 15-second timeline so every
  // interpolation remains valid when the host composition has another length.
  const normalizedFrame = frame / Math.max(1, durationInFrames - 1);
  const time = clamp01(normalizedFrame) * 15;
  const intro = phase(time, 0, 0.46);
  const outro = phase(time, 13.82, 15);
  const success = phase(time, 7.15, 8.05);
  const globalOpacity = intro * (1 - outro);

  return (
    <AbsoluteFill
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: PALETTE.ink,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <AmbientBackground time={time} success={success} />
      <Stage time={time} outro={outro} />
      <CornerInterface time={time} success={success} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 175px rgba(0,0,0,0.53)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 1 - globalOpacity,
          background: PALETTE.ink,
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return <MotionFrame frame={frame} durationInFrames={durationInFrames} />;
};
