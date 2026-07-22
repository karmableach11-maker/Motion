import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 900;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const range = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const pulse = (frame: number, center: number, radius: number) => {
  const distance = Math.abs(frame - center);
  return distance >= radius ? 0 : Math.sin((1 - distance / radius) * Math.PI * 0.5);
};

const COLORS = {
  navy: '#061525',
  navyMid: '#0A2740',
  teal: '#0D5661',
  ivory: '#FFF3D5',
  gold: '#FFC857',
  goldLight: '#FFF0A8',
  coral: '#ED655E',
  coralLight: '#FF8A76',
  burgundy: '#7F1D3E',
  burgundyDark: '#3A102A',
  mint: '#7DE2D1',
};

type CoinSpec = {
  start: number;
  hit: number;
  deposit: number;
  startX: number;
  endX: number;
  size: number;
  direction: number;
  primary?: boolean;
};

const COINS: CoinSpec[] = [
  {start: 218, hit: 266, deposit: 276, startX: 150, endX: 180, size: 82, direction: 1},
  {start: 312, hit: 356, deposit: 366, startX: 470, endX: 460, size: 84, direction: -1},
  {start: 398, hit: 438, deposit: 448, startX: 235, endX: 260, size: 82, direction: 1},
  {start: 475, hit: 512, deposit: 522, startX: 410, endX: 380, size: 86, direction: -1},
  {
    start: 544,
    hit: 578,
    deposit: 588,
    startX: 320,
    endX: 320,
    size: 96,
    direction: 1,
    primary: true,
  },
];

const Background: React.FC<{frame: number; cameraY: number}> = ({frame, cameraY}) => {
  const loop = (frame / TOTAL_FRAMES) * Math.PI * 2;
  const specks = Array.from({length: 24}, (_, index) => {
    const side = index % 2 === 0 ? 1 : -1;
    const column = index % 4;
    const x = side > 0 ? 1460 + column * 92 : 460 - column * 92;
    const y = 150 + ((index * 137) % 730);
    const float = Math.sin(loop * (1 + (index % 3)) + index * 0.91) * (7 + (index % 4) * 2);
    const size = 4 + (index % 3) * 2;
    return {x, y, float, size, index};
  });

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 48%, #16445B 0%, #0A2B44 28%, #071B30 58%, #050F1D 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -120,
          transform: `translateY(${cameraY * 0.18}px)`,
          backgroundImage:
            'radial-gradient(circle at 50% 58%, rgba(125,226,209,0.12), transparent 34%), radial-gradient(circle at 17% 37%, rgba(255,200,87,0.07), transparent 22%), radial-gradient(circle at 83% 37%, rgba(237,101,94,0.08), transparent 23%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 410,
          top: 232 + cameraY * 0.1,
          width: 1100,
          height: 690,
          borderRadius: '50%',
          border: '1px solid rgba(125,226,209,0.12)',
          transform: `rotate(${Math.sin(loop) * 2.2}deg)`,
          boxShadow:
            '0 0 0 70px rgba(125,226,209,0.018), 0 0 0 150px rgba(255,255,255,0.012)',
        }}
      />

      {[0, 1].map((side) => {
        const left = side === 0 ? 92 : 1538;
        const direction = side === 0 ? 1 : -1;
        return (
          <div
            key={side}
            style={{
              position: 'absolute',
              left,
              top: 275 + Math.sin(loop + side * Math.PI) * 12,
              width: 290,
              height: 470,
              opacity: 0.7,
              transform: `rotate(${direction * (9 + Math.sin(loop * 2) * 2)}deg)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(125,226,209,0.16)',
                borderLeftColor: 'rgba(255,200,87,0.34)',
                filter: 'drop-shadow(0 0 12px rgba(125,226,209,0.18))',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 44,
                borderRadius: '50%',
                border: '1px dashed rgba(255,243,213,0.14)',
                transform: `rotate(${direction * frame * 0.12}deg)`,
              }}
            />
          </div>
        );
      })}

      {specks.map(({x, y, float, size, index}) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: x,
            top: y + float + cameraY * 0.08,
            width: size,
            height: size,
            borderRadius: index % 4 === 0 ? 1 : '50%',
            background: index % 3 === 0 ? COLORS.gold : COLORS.mint,
            opacity: 0.16 + (index % 5) * 0.045,
            transform: `rotate(${loop * 90 + index * 23}deg)`,
            boxShadow: `0 0 ${size * 2}px currentColor`,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          mixBlendMode: 'soft-light',
          backgroundImage:
            'repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.09) 0 0.6px, transparent 0.7px 4px)',
          backgroundSize: '11px 13px',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(2,8,17,0.42), transparent 18%, transparent 82%, rgba(2,8,17,0.42)), linear-gradient(0deg, rgba(2,8,17,0.46), transparent 27%)',
        }}
      />
    </AbsoluteFill>
  );
};

const LidSurface: React.FC<{
  side: 'outer' | 'inner';
  projected: number;
  openProgress: number;
  opacity: number;
  frame: number;
  snapPulse: number;
}> = ({side, projected, openProgress, opacity, frame, snapPulse}) => {
  const inner = side === 'inner';
  const widthProjection = 1 - Math.sin(openProgress * Math.PI) * 0.045;
  const lift = -Math.sin(openProgress * Math.PI) * 7;
  const snapPress = pulse(frame, 57, 9) * 0.15 + pulse(frame, 787, 11) * 0.12;
  const snapScale = 1 - snapPress + snapPulse * 0.05;
  const prefix = `purse-lid-${side}`;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 190,
        width: 640,
        height: 205,
        opacity,
        transformOrigin: '50% 0%',
        transform: `translateY(${lift}px) scaleX(${widthProjection}) scaleY(${projected})`,
      }}
    >
      <svg width="640" height="205" viewBox="0 0 640 205" style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id={`${prefix}-fill`} x1="0" y1="0" x2="0.86" y2="1">
            {inner ? (
              <>
                <stop offset="0" stopColor="#4C1834" />
                <stop offset="0.55" stopColor="#7F1D3E" />
                <stop offset="1" stopColor="#3A102A" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor={COLORS.coralLight} />
                <stop offset="0.5" stopColor={COLORS.coral} />
                <stop offset="1" stopColor="#B9364B" />
              </>
            )}
          </linearGradient>
          <linearGradient id={`${prefix}-metal`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF8D9" />
            <stop offset="0.35" stopColor="#FFD36B" />
            <stop offset="0.72" stopColor="#A75A1B" />
            <stop offset="1" stopColor="#FFE89B" />
          </linearGradient>
          <filter id={`${prefix}-shadow`} x="-25%" y="-25%" width="150%" height="170%">
            <feDropShadow dx="0" dy="9" stdDeviation="9" floodColor="#050A13" floodOpacity="0.35" />
          </filter>
        </defs>

        <path
          d="M58 1 Q320 38 582 1 L563 98 Q548 174 320 190 Q92 174 77 98 Z"
          fill={`url(#${prefix}-fill)`}
          stroke={inner ? '#A13A58' : '#FF9984'}
          strokeWidth="3"
          filter={`url(#${prefix}-shadow)`}
        />

        {inner ? (
          <>
            <path
              d="M82 10 Q320 42 558 10 L545 86 Q520 146 320 160 Q120 146 95 86 Z"
              fill="none"
              stroke="rgba(255,180,157,0.22)"
              strokeWidth="3"
            />
            <path
              d="M106 39 Q320 65 534 39"
              fill="none"
              stroke="rgba(255,243,213,0.10)"
              strokeWidth="2"
              strokeDasharray="8 12"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path
              d="M78 18 Q320 50 562 18"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M95 49 Q320 77 545 49 L534 89 Q507 141 320 156 Q133 141 106 89 Z"
              fill="rgba(116,17,50,0.08)"
            />
            <path
              d="M98 30 Q320 60 542 30 L528 92 Q504 140 320 153 Q136 140 112 92 Z"
              fill="none"
              stroke="rgba(255,224,185,0.58)"
              strokeWidth="3"
              strokeDasharray="7 10"
              strokeLinecap="round"
            />
          </>
        )}

        <g transform={`translate(320 130) scale(${snapScale})`}>
          <circle
            r="32"
            fill={inner ? '#42132D' : '#9B2D43'}
            stroke={inner ? '#D8786F' : '#FFAC8E'}
            strokeWidth="4"
          />
          <circle r="24" fill={`url(#${prefix}-metal)`} />
          <circle r="13" fill={inner ? '#6A2C3D' : '#F8BB4D'} />
          <path
            d="M-11 -10 Q0 -18 11 -10"
            fill="none"
            stroke="rgba(255,255,255,0.72)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

const PurseBody: React.FC<{
  openProgress: number;
  impactPulse: number;
  snapPulse: number;
  frame: number;
}> = ({openProgress, impactPulse, snapPulse, frame}) => {
  const mouth = range(openProgress, 0.08, 0.82, Easing.inOut(Easing.cubic));
  const bodySquashX = 1 + impactPulse * 0.012 + snapPulse * 0.009;
  const bodySquashY = 1 - impactPulse * 0.012 - snapPulse * 0.012;
  const bodyShift = impactPulse * 3 + snapPulse * 2;
  const loop = (frame / TOTAL_FRAMES) * Math.PI * 2;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 452,
          width: 560,
          height: 58,
          borderRadius: '50%',
          background: 'rgba(0,5,12,0.52)',
          filter: `blur(${20 + openProgress * 6}px)`,
          transform: `scaleX(${0.86 + openProgress * 0.13 + impactPulse * 0.02}) translateY(${impactPulse * 2}px)`,
        }}
      />

      <svg
        width="640"
        height="520"
        viewBox="0 0 640 520"
        style={{position: 'absolute', inset: 0, overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="purse-back-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A72E4A" />
            <stop offset="0.52" stopColor="#D84B55" />
            <stop offset="1" stopColor="#7C1B3B" />
          </linearGradient>
          <linearGradient id="purse-body-fill" x1="0.12" y1="0" x2="0.86" y2="1">
            <stop offset="0" stopColor="#FF8A76" />
            <stop offset="0.32" stopColor="#ED655E" />
            <stop offset="0.75" stopColor="#C33E51" />
            <stop offset="1" stopColor="#8E2442" />
          </linearGradient>
          <radialGradient id="purse-socket-fill" cx="35%" cy="25%" r="75%">
            <stop offset="0" stopColor="#FFF2BE" />
            <stop offset="0.3" stopColor="#FFC857" />
            <stop offset="0.72" stopColor="#A95B1B" />
            <stop offset="1" stopColor="#FFE18A" />
          </radialGradient>
          <filter id="purse-body-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="17" stdDeviation="17" floodColor="#030A14" floodOpacity="0.46" />
          </filter>
          <clipPath id="purse-body-clip">
            <path d="M62 205 Q320 241 578 205 L558 368 C548 455 456 498 320 502 C184 498 92 455 82 368 Z" />
          </clipPath>
        </defs>

        <g
          style={{
            transformOrigin: '320px 330px',
            transform: `translateY(${bodyShift}px) scale(${bodySquashX}, ${bodySquashY})`,
          }}
        >
          <path
            d="M68 211 Q320 159 572 211 L552 360 C536 439 448 474 320 480 C192 474 104 439 88 360 Z"
            fill="url(#purse-back-fill)"
            stroke="#FF8E75"
            strokeWidth="3"
            filter="url(#purse-body-shadow)"
          />

          <ellipse
            cx="320"
            cy="205"
            rx={250 + mouth * 15}
            ry={7 + mouth * 48}
            fill="#240B22"
            stroke="#FF917A"
            strokeWidth={3 + mouth * 2}
          />
          <ellipse
            cx="320"
            cy={202 + mouth * 3}
            rx={226 + mouth * 17}
            ry={3 + mouth * 33}
            fill="#100817"
            opacity={0.55 + mouth * 0.45}
          />
          <path
            d="M86 203 Q320 236 554 203"
            fill="none"
            stroke="rgba(255,212,185,0.42)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        <g
          style={{
            transformOrigin: '320px 330px',
            transform: `translateY(${bodyShift}px) scale(${bodySquashX}, ${bodySquashY})`,
          }}
        >
          <path
            d="M62 205 Q320 241 578 205 L558 368 C548 455 456 498 320 502 C184 498 92 455 82 368 Z"
            fill="url(#purse-body-fill)"
            stroke="#FF9A80"
            strokeWidth="4"
            filter="url(#purse-body-shadow)"
          />

          <g clipPath="url(#purse-body-clip)">
            <ellipse
              cx={232 + Math.sin(loop) * 10}
              cy="293"
              rx="190"
              ry="270"
              fill="rgba(255,255,255,0.075)"
              transform="rotate(18 232 293)"
            />
            <path
              d="M418 199 Q527 244 548 382 Q536 460 390 486"
              fill="none"
              stroke="rgba(77,8,43,0.22)"
              strokeWidth="46"
              strokeLinecap="round"
            />
            <path
              d="M97 323 Q320 371 543 323"
              fill="none"
              stroke="rgba(255,255,255,0.045)"
              strokeWidth="3"
            />
          </g>

          <path
            d="M86 227 Q320 257 554 227 L541 362 C529 434 444 472 320 478 C196 472 111 434 99 362 Z"
            fill="none"
            stroke="rgba(255,226,192,0.64)"
            strokeWidth="3"
            strokeDasharray="7 11"
            strokeLinecap="round"
          />

          <path
            d="M83 205 Q320 239 557 205"
            fill="none"
            stroke="#FFB08F"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M94 210 Q320 240 546 210"
            fill="none"
            stroke="rgba(89,14,48,0.44)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <g transform="translate(320 320)">
            <circle r="35" fill="#982C45" stroke="#FF9A7A" strokeWidth="4" />
            <circle r="25" fill="url(#purse-socket-fill)" />
            <circle r="13" fill="#6C2532" stroke="#F4B649" strokeWidth="3" />
            <path
              d="M-10 -11 Q0 -17 10 -11"
              fill="none"
              stroke="rgba(255,255,255,0.62)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </>
  );
};

const Coin: React.FC<{frame: number; spec: CoinSpec}> = ({frame, spec}) => {
  const {start, hit, deposit, startX, endX, size, direction, primary} = spec;
  if (frame < start - 7 || frame > deposit + 33) {
    return null;
  }

  const fall = range(frame, start, hit, Easing.in(Easing.cubic));
  const bounce = range(frame, hit, deposit, Easing.inOut(Easing.quad));
  const sink = range(frame, deposit, deposit + 26, Easing.in(Easing.cubic));
  const startY = primary ? -252 : -168;
  let y = startY + (156 - startY) * fall;
  if (frame >= hit) {
    y = 156 - Math.sin(bounce * Math.PI) * (primary ? 13 : 10) + bounce * 66;
  }
  if (frame >= deposit) {
    y = 222 + sink * 150;
  }

  const x = startX + (endX - startX) * fall + Math.sin(fall * Math.PI) * direction * 13;
  const reveal = range(frame, start - 6, start + 6, Easing.out(Easing.cubic));
  const vanish = range(frame, deposit + 18, deposit + 33, Easing.in(Easing.quad));
  const hitPulse = pulse(frame, hit, 6);
  const scaleX = 0.75 + reveal * 0.25 + hitPulse * 0.08;
  const scaleY = 0.75 + reveal * 0.25 - hitPulse * 0.1;
  const rotation = direction * (-18 + fall * 214 + bounce * 38 + sink * 24);
  const velocityGlow = clamp((fall - 0.35) / 0.65) * (1 - bounce);
  const prefix = `coin-${start}`;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: reveal * (1 - vanish),
        transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
        filter: `drop-shadow(0 12px 10px rgba(3,7,12,0.32)) drop-shadow(0 0 ${8 + velocityGlow * 18}px rgba(255,200,87,${0.18 + velocityGlow * 0.18}))`,
      }}
    >
      {velocityGlow > 0.02 && (
        <div
          style={{
            position: 'absolute',
            left: size * 0.44,
            top: -size * 0.7,
            width: size * 0.12,
            height: size * 0.62,
            borderRadius: 999,
            opacity: velocityGlow * 0.55,
            transform: `rotate(${-rotation}deg)`,
            background: 'linear-gradient(180deg, transparent, rgba(255,222,125,0.68))',
            filter: 'blur(3px)',
          }}
        />
      )}
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id={`${prefix}-face`} cx="31%" cy="23%" r="78%">
            <stop offset="0" stopColor="#FFF7BE" />
            <stop offset="0.34" stopColor="#FFD86C" />
            <stop offset="0.72" stopColor="#E89A28" />
            <stop offset="1" stopColor="#8E4917" />
          </radialGradient>
          <linearGradient id={`${prefix}-rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFF8C8" />
            <stop offset="0.5" stopColor="#E7A12C" />
            <stop offset="1" stopColor="#7C3C13" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill={`url(#${prefix}-rim)`} />
        <circle cx="50" cy="50" r="40" fill={`url(#${prefix}-face)`} stroke="#FFF0A0" strokeWidth="2" />
        <circle
          cx="50"
          cy="50"
          r="33"
          fill="none"
          stroke="rgba(143,74,23,0.35)"
          strokeWidth="2.5"
          strokeDasharray="3.2 4.2"
        />
        <path
          d="M33 23 Q50 15 68 24"
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="#8F4B19"
        >
          $
        </text>
      </svg>
    </div>
  );
};

const DepositEffects: React.FC<{frame: number}> = ({frame}) => (
  <>
    {COINS.map((spec, coinIndex) => {
      const age = frame - spec.deposit;
      if (age < 0 || age > 34) {
        return null;
      }
      const life = clamp(age / 34);
      const pop = Easing.out(Easing.cubic)(clamp(age / 12));
      const opacity = 1 - Easing.in(Easing.quad)(life);
      const radius = 18 + pop * 55;
      return (
        <React.Fragment key={spec.deposit}>
          <div
            style={{
              position: 'absolute',
              left: spec.endX - radius,
              top: 182 - radius * 0.28,
              width: radius * 2,
              height: radius * 0.62,
              borderRadius: '50%',
              border: `3px solid rgba(255,216,108,${opacity * 0.7})`,
              transform: `scale(${0.65 + pop * 0.45})`,
              filter: 'drop-shadow(0 0 8px rgba(255,200,87,0.35))',
            }}
          />
          {Array.from({length: 7}, (_, particle) => {
            const angle = (particle / 7) * Math.PI * 2 - Math.PI * 0.95;
            const spread = pop * (32 + (particle % 3) * 11);
            const px = spec.endX + Math.cos(angle) * spread;
            const py = 187 + Math.sin(angle) * spread * 0.65;
            const particleSize = 5 + ((particle + coinIndex) % 3) * 2;
            return (
              <div
                key={particle}
                style={{
                  position: 'absolute',
                  left: px - particleSize / 2,
                  top: py - particleSize / 2,
                  width: particleSize,
                  height: particleSize,
                  borderRadius: particle % 2 === 0 ? '50%' : 1,
                  opacity,
                  background: particle % 3 === 0 ? COLORS.ivory : COLORS.gold,
                  transform: `rotate(${particle * 31 + age * 5}deg)`,
                  boxShadow: '0 0 9px rgba(255,200,87,0.5)',
                }}
              />
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: spec.endX - 48,
              top: 145 - life * 34,
              width: 96,
              textAlign: 'center',
              opacity,
              transform: `scale(${0.74 + pop * 0.26})`,
              color: COLORS.goldLight,
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 0.4,
              textShadow: '0 4px 13px rgba(3,7,12,0.7)',
            }}
          >
            +$20
          </div>
        </React.Fragment>
      );
    })}
  </>
);

const Purse: React.FC<{
  frame: number;
  openProgress: number;
  impactPulse: number;
  snapPulse: number;
}> = ({frame, openProgress, impactPulse, snapPulse}) => {
  const projected = Math.cos(openProgress * Math.PI);
  const outerOpacity = clamp((projected + 0.1) / 0.2);
  const innerOpacity = clamp((-projected + 0.1) / 0.2);
  const edgeGlow = 1 - clamp(Math.abs(projected) / 0.12);
  const bodySquashX = 1 + impactPulse * 0.012 + snapPulse * 0.009;
  const bodySquashY = 1 - impactPulse * 0.012 - snapPulse * 0.012;
  const bodyShift = impactPulse * 3 + snapPulse * 2;

  return (
    <div
      style={{
        position: 'absolute',
        left: 640,
        top: 390,
        width: 640,
        height: 520,
        overflow: 'visible',
      }}
    >
      <LidSurface
        side="inner"
        projected={projected}
        openProgress={openProgress}
        opacity={innerOpacity}
        frame={frame}
        snapPulse={snapPulse}
      />

      <PurseBody
        openProgress={openProgress}
        impactPulse={impactPulse}
        snapPulse={snapPulse}
        frame={frame}
      />

      <div style={{position: 'absolute', inset: 0, zIndex: 2}}>
        {COINS.map((spec) => (
          <Coin key={spec.deposit} frame={frame} spec={spec} />
        ))}
      </div>

      <div style={{position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none'}}>
        <svg
          width="640"
          height="520"
          viewBox="0 0 640 520"
          style={{
            overflow: 'visible',
            transformOrigin: '320px 330px',
            transform: `translateY(${bodyShift}px) scale(${bodySquashX}, ${bodySquashY})`,
          }}
        >
          <defs>
            <linearGradient id="purse-front-overlay" x1="0.12" y1="0" x2="0.86" y2="1">
              <stop offset="0" stopColor="#FF8A76" />
              <stop offset="0.32" stopColor="#ED655E" />
              <stop offset="0.75" stopColor="#C33E51" />
              <stop offset="1" stopColor="#8E2442" />
            </linearGradient>
            <clipPath id="front-overlay-clip">
              <path d="M62 205 Q320 241 578 205 L558 368 C548 455 456 498 320 502 C184 498 92 455 82 368 Z" />
            </clipPath>
            <radialGradient id="purse-front-socket-fill" cx="35%" cy="25%" r="75%">
              <stop offset="0" stopColor="#FFF2BE" />
              <stop offset="0.3" stopColor="#FFC857" />
              <stop offset="0.72" stopColor="#A95B1B" />
              <stop offset="1" stopColor="#FFE18A" />
            </radialGradient>
          </defs>
          <path
            d="M62 205 Q320 241 578 205 L558 368 C548 455 456 498 320 502 C184 498 92 455 82 368 Z"
            fill="url(#purse-front-overlay)"
            stroke="#FF9A80"
            strokeWidth="4"
          />
          <g clipPath="url(#front-overlay-clip)">
            <ellipse cx="220" cy="300" rx="180" ry="270" fill="rgba(255,255,255,0.07)" transform="rotate(18 220 300)" />
            <path d="M420 201 Q533 249 552 390" fill="none" stroke="rgba(74,8,41,0.22)" strokeWidth="48" strokeLinecap="round" />
          </g>
          <path d="M83 205 Q320 239 557 205" fill="none" stroke="#FFB08F" strokeWidth="7" strokeLinecap="round" />
          <path d="M94 210 Q320 240 546 210" fill="none" stroke="rgba(89,14,48,0.44)" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M86 227 Q320 257 554 227 L541 362 C529 434 444 472 320 478 C196 472 111 434 99 362 Z"
            fill="none"
            stroke="rgba(255,226,192,0.64)"
            strokeWidth="3"
            strokeDasharray="7 11"
            strokeLinecap="round"
          />
          <g transform="translate(320 320)">
            <circle r="35" fill="#982C45" stroke="#FF9A7A" strokeWidth="4" />
            <circle r="25" fill="url(#purse-front-socket-fill)" />
            <circle r="13" fill="#6C2532" stroke="#F4B649" strokeWidth="3" />
            <path d="M-10 -11 Q0 -17 10 -11" fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <div style={{position: 'absolute', inset: 0, zIndex: 4}}>
        <LidSurface
          side="outer"
          projected={projected}
          openProgress={openProgress}
          opacity={outerOpacity}
          frame={frame}
          snapPulse={snapPulse}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 62,
          top: 186 - edgeGlow * 4,
          width: 516,
          height: 9 + edgeGlow * 3,
          borderRadius: 999,
          opacity: 0.42 + edgeGlow * 0.58,
          zIndex: 5,
          background: `linear-gradient(90deg, ${COLORS.burgundy}, ${COLORS.coralLight}, ${COLORS.burgundy})`,
          boxShadow: edgeGlow > 0.02 ? '0 0 13px rgba(255,138,118,0.45)' : 'none',
        }}
      />

      <div style={{position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none'}}>
        <DepositEffects frame={frame} />
      </div>

      {snapPulse > 0.001 && (
        <>
          {[0, 1].map((ring) => (
            <div
              key={ring}
              style={{
                position: 'absolute',
                left: 320 - 41 - ring * 16,
                top: 320 - 41 - ring * 16,
                width: 82 + ring * 32,
                height: 82 + ring * 32,
                borderRadius: '50%',
                border: `${ring === 0 ? 4 : 2}px solid rgba(255,225,137,${snapPulse * (0.7 - ring * 0.2)})`,
                transform: `scale(${0.72 + snapPulse * (0.55 + ring * 0.16)})`,
                zIndex: 7,
                boxShadow: '0 0 18px rgba(255,200,87,0.22)',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

const Counter: React.FC<{frame: number}> = ({frame}) => {
  const entrance = range(frame, 191, 211, Easing.out(Easing.back(1.35)));
  const exit = range(frame, 661, 688, Easing.in(Easing.cubic));
  const visible = entrance * (1 - exit);
  const deposited = COINS.filter((coin) => frame >= coin.deposit).length;
  const total = deposited * 20;
  const lastImpact = [...COINS].reverse().find((coin) => frame >= coin.deposit)?.deposit ?? -100;
  const age = frame - lastImpact;
  const numberPulse = age >= 0 && age <= 18 ? Math.sin((age / 18) * Math.PI) : 0;
  const glowPulse = Math.max(0, numberPulse);

  return (
    <div
      style={{
        position: 'absolute',
        left: 760,
        top: 142,
        width: 400,
        height: 146,
        opacity: visible,
        transform: `translateY(${(1 - entrance) * 24 - exit * 14}px) scale(${0.88 + entrance * 0.12 + numberPulse * 0.035})`,
        transformOrigin: '50% 50%',
        borderRadius: 42,
        background: 'linear-gradient(145deg, rgba(14,53,72,0.92), rgba(5,22,37,0.95))',
        border: `2px solid rgba(125,226,209,${0.32 + glowPulse * 0.28})`,
        boxShadow: `0 22px 44px rgba(0,5,12,0.34), inset 0 1px 0 rgba(255,255,255,0.11), 0 0 ${16 + glowPulse * 24}px rgba(125,226,209,${0.06 + glowPulse * 0.1})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
      }}
    >
      <div
        style={{
          width: 8,
          height: 68,
          borderRadius: 99,
          background: `linear-gradient(180deg, ${COLORS.mint}, ${COLORS.gold})`,
          boxShadow: '0 0 16px rgba(125,226,209,0.32)',
        }}
      />
      <div>
        <div
          style={{
            color: 'rgba(255,243,213,0.6)',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 4.8,
            marginBottom: 3,
          }}
        >
          SAVED
        </div>
        <div
          style={{
            color: COLORS.ivory,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 62,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: -1.5,
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 ${glowPulse * 22}px rgba(255,200,87,0.45)`,
          }}
        >
          ${String(total).padStart(3, '0')}
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const hingeEase = Easing.bezier(0.42, 0, 0.58, 1);
  const openIn = range(frame, 68, 168, hingeEase);
  const closeOut = range(frame, 690, 777, hingeEase);
  const openProgress = clamp(openIn - closeOut);

  const impacts = COINS.map((coin) => pulse(frame, coin.deposit, 14));
  const impactPulse = Math.min(1, Math.max(0, ...impacts));
  const snapRelease = pulse(frame, 61, 16);
  const snapLock = pulse(frame, 787, 17);
  const snapPulse = Math.max(snapRelease * 0.78, snapLock);

  const minorTrack = COINS.slice(0, 4).reduce((sum, coin) => {
    const local = range(frame, coin.start, coin.deposit, Easing.inOut(Easing.cubic));
    const release = range(frame, coin.deposit, coin.deposit + 18, Easing.out(Easing.cubic));
    return sum + (Math.sin(local * Math.PI) * 8 - release * 2) * (1 - release);
  }, 0);

  let primaryTrack = 0;
  if (frame >= 528 && frame < 544) {
    primaryTrack = interpolate(frame, [528, 544], [0, 38], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });
  } else if (frame >= 544 && frame < 588) {
    primaryTrack = interpolate(frame, [544, 588], [38, -10], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });
  } else if (frame >= 588 && frame < 620) {
    primaryTrack = interpolate(frame, [588, 620], [-10, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
  }

  const cameraY = primaryTrack + minorTrack;
  const zoomIn = range(frame, 218, 522, Easing.inOut(Easing.cubic)) * 0.025;
  const zoomOut = range(frame, 620, 720, Easing.inOut(Easing.cubic));
  const cameraScale = 1 + zoomIn * (1 - zoomOut) + impactPulse * 0.0025;
  const cameraRecoil = pulse(frame, 588, 11) * -4;

  // Keep the first and final hero poses visually identical for clean looping.
  const finalSettle = range(frame, 796, 832, Easing.out(Easing.cubic));
  const introHold = range(frame, 0, 36, Easing.inOut(Easing.cubic));
  const heroBreath =
    frame < 48
      ? Math.sin((introHold * Math.PI) / 2) * 0.002
      : frame > 832
        ? Math.sin((1 - finalSettle) * Math.PI * 0.5) * 0.002
        : 0;

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: 'hidden',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <Background frame={frame} cameraY={cameraY} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '50% 62%',
          transform: `translateY(${cameraY + cameraRecoil}px) scale(${cameraScale + heroBreath})`,
        }}
      >
        <Purse
          frame={frame}
          openProgress={openProgress}
          impactPulse={impactPulse}
          snapPulse={snapPulse}
        />
      </div>

      <Counter frame={frame} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 180,
          pointerEvents: 'none',
          background: 'linear-gradient(0deg, rgba(1,7,14,0.33), transparent)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 22,
          border: '1px solid rgba(255,255,255,0.025)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
