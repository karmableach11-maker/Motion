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

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const FRAME = {
  truckInStart: 24,
  truckInEnd: 36,
  truckSettleEnd: 102,
  labelInStart: 48,
  labelInEnd: 72,
  railInStart: 72,
  railInEnd: 114,
  percentInStart: 108,
  progressStart: 120,
  progressEnd: 810,
  truckOutStart: 807,
  truckOutEnd: 870,
} as const;

const ProgressBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse 52% 56% at 50% 42%, #14202C 0%, #09111A 38%, #05090E 66%, #020407 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 85,
          width: 1120,
          height: 760,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(68, 150, 207, 0.115) 0%, rgba(22, 70, 106, 0.045) 45%, transparent 72%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.19,
          backgroundImage:
            'linear-gradient(rgba(127, 194, 232, 0.105) 1px, transparent 1px), linear-gradient(90deg, rgba(127, 194, 232, 0.105) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 51% 53% at 50% 48%, black 0%, rgba(0,0,0,0.7) 48%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 51% 53% at 50% 48%, black 0%, rgba(0,0,0,0.7) 48%, transparent 82%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 540,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 14%, rgba(91, 184, 235, 0.12) 36%, rgba(150, 221, 255, 0.24) 50%, rgba(91, 184, 235, 0.12) 64%, transparent 86%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 603,
          width: 1060,
          height: 310,
          transform: 'translateX(-50%) perspective(700px) rotateX(72deg)',
          transformOrigin: '50% 0%',
          opacity: 0.12,
          backgroundImage:
            'linear-gradient(rgba(116, 192, 235, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(116, 192, 235, 0.12) 1px, transparent 1px)',
          backgroundSize: '62px 48px',
          maskImage: 'linear-gradient(to bottom, black, transparent 88%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 88%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 843,
          width: 760,
          height: 100,
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(ellipse at center, rgba(45, 162, 224, 0.095), transparent 69%)',
        }}
      />

      <AbsoluteFill
        style={{
          boxShadow:
            'inset 0 0 180px rgba(0, 0, 0, 0.82), inset 0 0 520px rgba(0, 0, 0, 0.42)',
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Material Symbols Rounded `local_shipping`, weight 400.
 * Source: @material-symbols/svg-400 0.45.10 / Google Material Symbols.
 * License: Apache-2.0.
 */
const TruckIcon: React.FC<{frame: number}> = ({frame}) => {
  const entry = interpolate(
    frame,
    [FRAME.truckInStart - 1, FRAME.truckInEnd],
    [0, 1],
    {...clamp, easing: easeOut},
  );
  const slide = interpolate(
    frame,
    [FRAME.truckInStart, FRAME.truckInEnd],
    [-166, 0],
    {...clamp, easing: easeOut},
  );
  const settleT = interpolate(
    frame,
    [FRAME.truckInEnd, FRAME.truckSettleEnd],
    [0, 1],
    clamp,
  );
  const overshoot =
    frame >= FRAME.truckInEnd && frame <= FRAME.truckSettleEnd
      ? Math.sin(Math.PI * settleT) * 20
      : 0;
  const exit = interpolate(
    frame,
    [FRAME.truckOutStart, FRAME.truckOutEnd],
    [0, 1240],
    {...clamp, easing: Easing.bezier(0.25, 0.1, 0.65, 1)},
  );
  const departureStretch = interpolate(
    frame,
    [FRAME.truckOutStart, FRAME.truckOutStart + 14, FRAME.truckOutEnd],
    [1, 1.025, 1],
    clamp,
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 332,
        width: 306,
        height: 182,
        opacity: entry,
        transform: `translateX(-50%) translateX(${slide + overshoot + exit}px) scaleX(${departureStretch})`,
        transformOrigin: '70% 58%',
        filter: 'drop-shadow(0 18px 27px rgba(69, 190, 255, 0.22))',
      }}
    >
      <svg
        width="306"
        height="182"
        viewBox="40 -800 880 639"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="truckBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.56" stopColor="#E8F7FF" />
            <stop offset="1" stopColor="#9ADAF8" />
          </linearGradient>
        </defs>
        <path
          fill="url(#truckBody)"
          d="M140.5-195.5Q106-230 106-279H40v-461q0-24 18-42t42-18h579v167h105l136 181v173h-71q0 49-34.5 83.5T731-161q-49 0-83.5-34.5T613-279H342q0 49-34.5 83.5T224-161q-49 0-83.5-34.5ZM265-238q17-17 17-41t-17-41q-17-17-41-17t-41 17q-17 17-17 41t17 41q17 17 41 17t41-17Zm507 0q17-17 17-41t-17-41q-17-17-41-17t-41 17q-17 17-17 41t17 41q17 17 41 17t41-17Zm-93-187h186L754-573h-75v148Z"
        />
      </svg>
    </div>
  );
};

const StatusLabel: React.FC<{frame: number}> = ({frame}) => {
  const reveal = interpolate(
    frame,
    [FRAME.labelInStart, FRAME.labelInEnd],
    [0, 1],
    {...clamp, easing: Easing.linear},
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 549,
        width: 650,
        height: 40,
        transform: 'translateX(-50%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`,
          color: '#DCEAF2',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 30,
          fontWeight: 500,
          lineHeight: '40px',
          letterSpacing: 2.25,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          textShadow: '0 0 22px rgba(100, 199, 243, 0.16)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transform: 'translateY(1px) scaleX(1.14) scaleY(1.23)',
          }}
        >
          ORDER SUCCESSFULLY SHIPPED
        </span>
      </div>
    </div>
  );
};

const ProgressRail: React.FC<{frame: number; progress: number}> = ({
  frame,
  progress,
}) => {
  const outline = interpolate(
    frame,
    [FRAME.railInStart, FRAME.railInEnd],
    [0, 1],
    {...clamp, easing: Easing.linear},
  );
  const fillWidth = progress <= 0 ? 0 : 28 + progress * 660;
  const trailX = Math.max(6, 6 + fillWidth - 166);

  return (
    <svg
      width="700"
      height="40"
      viewBox="0 0 700 40"
      style={{
        position: 'absolute',
        left: '50%',
        top: 630,
        transform: 'translateX(-50%)',
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="railStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#718A98" />
          <stop offset="0.5" stopColor="#D9EDF7" />
          <stop offset="1" stopColor="#7894A3" />
        </linearGradient>
        <linearGradient id="fillBase" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#368ED9" />
          <stop offset="0.52" stopColor="#52BDE3" />
          <stop offset="1" stopColor="#68E4C2" />
        </linearGradient>
        <linearGradient id="fillHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.48" />
          <stop offset="0.38" stopColor="#FFFFFF" stopOpacity="0.14" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="integratedTrail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="2"
        width="696"
        height="36"
        rx="18"
        fill="rgba(4, 10, 15, 0.72)"
        stroke="rgba(97, 157, 187, 0.13)"
        strokeWidth="7"
        opacity={outline}
      />

      {progress > 0 ? (
        <g opacity={outline}>
          <rect x="6" y="6" width={fillWidth} height="28" rx="14" fill="url(#fillBase)" />
          <rect x="6" y="6" width={fillWidth} height="15" rx="7.5" fill="url(#fillHighlight)" />
          <rect
            x={trailX}
            y="6"
            width={Math.min(166, fillWidth)}
            height="28"
            rx="14"
            fill="url(#integratedTrail)"
          />
        </g>
      ) : null}

      <rect
        x="2"
        y="2"
        width="696"
        height="36"
        rx="18"
        fill="none"
        stroke="url(#railStroke)"
        strokeWidth="2.4"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - outline}
        transform="translate(700 0) scale(-1 1)"
      />
    </svg>
  );
};

const Percentage: React.FC<{frame: number; value: number}> = ({frame, value}) => {
  const entry = interpolate(
    frame,
    [FRAME.percentInStart, FRAME.progressStart],
    [0, 1],
    {...clamp, easing: easeInOut},
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 704,
        width: 250,
        height: 54,
        transform: `translateX(-50%) translateY(${(1 - entry) * 10}px) scale(${0.82 + entry * 0.18})`,
        opacity: entry,
        color: '#F3FAFE',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 38,
        fontWeight: 700,
        lineHeight: '54px',
        letterSpacing: 0.4,
        textAlign: 'center',
        fontVariantNumeric: 'tabular-nums',
        textShadow: '0 0 24px rgba(94, 197, 240, 0.16)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transform: 'translateY(1px) scaleX(1.14) scaleY(1.2)',
        }}
      >
        {value}%
      </span>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [FRAME.progressStart, FRAME.progressEnd],
    [0, 1],
    {...clamp, easing: Easing.linear},
  );
  const percentage = Math.round(progress * 100);

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#020407',
        overflow: 'hidden',
      }}
    >
      <ProgressBackground />
      <TruckIcon frame={frame} />
      <StatusLabel frame={frame} />
      <ProgressRail frame={frame} progress={progress} />
      <Percentage frame={frame} value={percentage} />
    </AbsoluteFill>
  );
};
