import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * Internet icon source: Lucide Static v1.28.0
 * Asset pages: https://lucide.dev/icons/file-text
 *              https://lucide.dev/icons/clipboard-list
 *              https://lucide.dev/icons/file-chart-column-increasing
 *              https://lucide.dev/icons/file-check
 * License: ISC — https://lucide.dev/license
 *
 * ISC License
 * Copyright (c) 2026 Lucide Icons and Contributors
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES.
 */

type IconVariant = 'file' | 'clipboard' | 'chart' | 'approved';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (value: number) => number = Easing.linear,
) => interpolate(frame, [start, end], [0, 1], {...clamp, easing});

const drawStyle = (
  amount: number,
  opacity = 1,
): React.CSSProperties => ({
  strokeDasharray: 1,
  strokeDashoffset: 1 - amount,
  opacity,
});

const PremiumBackground: React.FC<{completion: number}> = ({completion}) => {
  const glow = interpolate(completion, [0, 1], [0.2, 0.82], clamp);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 50%, #10243a 0%, #091526 34%, #060b17 66%, #03050b 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.2,
          backgroundImage:
            'linear-gradient(rgba(119,198,220,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(119,198,220,0.08) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage:
            'radial-gradient(ellipse 68% 54% at 50% 50%, black 0%, transparent 76%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1280,
          height: 640,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse at center, rgba(10,229,180,0.19) 0%, rgba(14,173,182,0.09) 33%, rgba(4,9,20,0) 72%)',
          opacity: glow,
          filter: 'blur(24px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(118deg, transparent 0 25%, rgba(55,218,215,0.025) 25% 25.2%, transparent 25.2% 74%, rgba(106,240,186,0.02) 74% 74.2%, transparent 74.2%)',
        }}
      />

      <AbsoluteFill
        style={{
          boxShadow:
            'inset 0 0 220px 80px rgba(0,0,0,0.7), inset 0 0 48px rgba(0,0,0,0.42)',
        }}
      />
    </AbsoluteFill>
  );
};

const LucidePrimitive: React.FC<{
  variant: IconVariant;
  outline: number;
  detail: number;
}> = ({variant, outline, detail}) => {
  const baseProps = {
    pathLength: 1,
    style: drawStyle(outline),
  };
  const detailProps = {
    pathLength: 1,
    style: drawStyle(detail),
  };

  if (variant === 'clipboard') {
    return (
      <>
        <rect
          width="8"
          height="4"
          x="8"
          y="2"
          rx="1"
          ry="1"
          {...baseProps}
        />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" {...baseProps} />
        <path d="M12 11h4" {...detailProps} />
        <path d="M12 16h4" {...detailProps} />
        <path d="M8 11h.01" {...detailProps} />
        <path d="M8 16h.01" {...detailProps} />
      </>
    );
  }

  if (variant === 'chart') {
    return (
      <>
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" {...baseProps} />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" {...baseProps} />
        <path d="M8 18v-2" {...detailProps} />
        <path d="M12 18v-4" {...detailProps} />
        <path d="M16 18v-6" {...detailProps} />
      </>
    );
  }

  if (variant === 'approved') {
    return (
      <>
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" {...baseProps} />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" {...baseProps} />
        <path d="m9 15 2 2 4-4" {...detailProps} />
      </>
    );
  }

  return (
    <>
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" {...baseProps} />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" {...baseProps} />
      <path d="M10 9H8" {...detailProps} />
      <path d="M16 13H8" {...detailProps} />
      <path d="M16 17H8" {...detailProps} />
    </>
  );
};

const ApprovalBadge: React.FC<{
  frame: number;
  start: number;
}> = ({frame, start}) => {
  const scale = progress(
    frame,
    start,
    start + 18,
    Easing.bezier(0.18, 1.22, 0.34, 1),
  );
  const check = progress(
    frame,
    start + 12,
    start + 31,
    Easing.inOut(Easing.cubic),
  );
  const halo = progress(frame, start, start + 26, Easing.out(Easing.quad));

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: -104,
        width: 82,
        height: 82,
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: '50% 50%',
        borderRadius: '50%',
        background:
          'linear-gradient(145deg, #52f1a4 0%, #13db86 45%, #05a96b 100%)',
        boxShadow: `0 0 ${14 + halo * 26}px rgba(34,238,150,${0.22 + halo * 0.36}), inset 0 1px 1px rgba(255,255,255,0.45)`,
        opacity: scale,
      }}
    >
      <svg width="82" height="82" viewBox="0 0 68 68">
        <path
          d="M20 35 L29 44 L49 23"
          fill="none"
          stroke="#f4fff9"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={drawStyle(check)}
        />
      </svg>
    </div>
  );
};

const DocumentNode: React.FC<{
  frame: number;
  x: number;
  start: number;
  badgeStart: number;
  variant: IconVariant;
}> = ({frame, x, start, badgeStart, variant}) => {
  const entrance = progress(
    frame,
    start,
    start + 34,
    Easing.out(Easing.cubic),
  );
  const outline = progress(
    frame,
    start + 3,
    start + 58,
    Easing.inOut(Easing.cubic),
  );
  const detail = progress(
    frame,
    start + 38,
    start + 84,
    Easing.inOut(Easing.cubic),
  );
  const stack = progress(frame, start + 10, start + 48, Easing.out(Easing.cubic));
  const scale = interpolate(entrance, [0, 1], [0.7, 1], clamp);
  const lift = interpolate(entrance, [0, 1], [18, 0], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 232,
        height: 232,
        marginLeft: -116,
        marginTop: -116,
        transform: `translate(${x}px, ${lift}px) scale(${scale})`,
        opacity: entrance,
        filter: 'drop-shadow(0 0 15px rgba(55,213,229,0.18))',
      }}
    >
      <ApprovalBadge frame={frame} start={badgeStart} />

      <svg
        width="232"
        height="232"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#69d5e8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{overflow: 'visible'}}
      >
        <path
          d="M4.8 4.5H3.7a1.7 1.7 0 0 0-1.7 1.7v13.1A1.7 1.7 0 0 0 3.7 21h11.7"
          pathLength={1}
          style={drawStyle(stack, 0.52)}
          transform="translate(-0.5 1.1)"
        />
        <g style={{filter: 'drop-shadow(0 0 1.2px rgba(78,228,240,0.72))'}}>
          <LucidePrimitive variant={variant} outline={outline} detail={detail} />
        </g>
      </svg>
    </div>
  );
};

const CompletionCore: React.FC<{frame: number}> = ({frame}) => {
  const ring = progress(frame, 102, 189, Easing.inOut(Easing.cubic));
  const check = progress(frame, 171, 198, Easing.out(Easing.cubic));
  const centerGlow = progress(frame, 154, 224, Easing.out(Easing.quad));
  const ringLength = 0.82 * ring;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 396,
        height: 396,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -110,
          opacity: centerGlow,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(91,255,151,0.44) 0%, rgba(28,220,150,0.19) 27%, rgba(21,191,177,0.07) 50%, transparent 72%)',
          filter: 'blur(18px)',
        }}
      />

      <svg
        width="396"
        height="396"
        viewBox="0 0 360 360"
        style={{overflow: 'visible'}}
      >
        <defs>
          <linearGradient id="ringPremium" x1="40" y1="290" x2="306" y2="55">
            <stop offset="0" stopColor="#08b778" />
            <stop offset="0.52" stopColor="#21ee8d" />
            <stop offset="1" stopColor="#76ffb5" />
          </linearGradient>
          <linearGradient id="checkPremium" x1="95" y1="228" x2="280" y2="78">
            <stop offset="0" stopColor="#16d9ce" />
            <stop offset="0.55" stopColor="#42ece1" />
            <stop offset="1" stopColor="#87fff2" />
          </linearGradient>
          <filter id="ringGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="checkGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="180"
          cy="180"
          r="128"
          fill="none"
          stroke="rgba(87,224,209,0.08)"
          strokeWidth="29"
          opacity={ring * 0.5}
        />
        <circle
          cx="180"
          cy="180"
          r="128"
          fill="none"
          stroke="url(#ringPremium)"
          strokeWidth="29"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${ringLength} 1`}
          transform="rotate(-12.5 180 180)"
          filter="url(#ringGlow)"
          opacity={progress(frame, 102, 108, Easing.out(Easing.quad))}
        />

        <path
          d="M92 179 L151 232 L281 82"
          fill="none"
          stroke="url(#checkPremium)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          filter="url(#checkGlow)"
          style={drawStyle(check)}
        />
        <path
          d="M92 179 L151 232 L281 82"
          fill="none"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={drawStyle(check, check * 0.7)}
          transform="translate(-1 -2)"
        />
      </svg>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const completion = progress(frame, 154, 224, Easing.out(Easing.quad));
  const sceneScale = Math.min(width / 1920, height / 1080);

  return (
    <AbsoluteFill style={{backgroundColor: '#03050b'}}>
      <PremiumBackground completion={completion} />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${sceneScale})`,
          transformOrigin: '50% 50%',
        }}
      >
        <DocumentNode
          frame={frame}
          x={-620}
          start={84}
          badgeStart={246}
          variant="file"
        />
        <DocumentNode
          frame={frame}
          x={-350}
          start={12}
          badgeStart={162}
          variant="clipboard"
        />
        <DocumentNode
          frame={frame}
          x={350}
          start={16}
          badgeStart={168}
          variant="chart"
        />
        <DocumentNode
          frame={frame}
          x={620}
          start={92}
          badgeStart={252}
          variant="approved"
        />
        <CompletionCore frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
