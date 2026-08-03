import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const FONT =
  '"Segoe UI", "Helvetica Neue", Arial, ui-sans-serif, system-ui, sans-serif';

const TOTAL_FILES = 36480;
const PROGRESS_END = 780;

const PERSPECTIVE = 1800;
const PLANE_LEFT = -42;
const PLANE_TOP = -320;
const PERSPECTIVE_Y = 540;
const COS_Y = Math.cos((28 * Math.PI) / 180);
const SIN_Y = Math.sin((28 * Math.PI) / 180);

type Point = {x: number; y: number};

const project = (localX: number, localY: number): Point => {
  const scale = PERSPECTIVE / (PERSPECTIVE + SIN_Y * localX);
  return {
    x: (PLANE_LEFT + COS_Y * localX) * scale,
    y:
      PERSPECTIVE_Y +
      (PLANE_TOP + localY - PERSPECTIVE_Y) * scale,
  };
};

const polygonPath = (points: Point[]): string =>
  `${points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')} Z`;

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

const FileIcon: React.FC = () => (
  <svg
    width="48"
    height="78"
    viewBox="0 0 48 78"
    aria-hidden="true"
    style={{display: 'block', flex: '0 0 auto'}}
  >
    <path
      d="M7 3H29L41 15V75H7V3Z"
      fill="rgba(225,227,223,0.12)"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    <path
      d="M29 3V16H41"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
  </svg>
);

const getProgress = (frame: number): number =>
  interpolate(
    frame,
    [0, 42, 150, 300, 480, 630, 735, PROGRESS_END],
    [0, 0.018, 0.14, 0.38, 0.68, 0.86, 0.97, 1],
    {
      easing: Easing.inOut(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

const DeletionInterface: React.FC<{frame: number; progress: number}> = ({
  frame,
  progress,
}) => {
  const percent = frame >= PROGRESS_END ? 100 : Math.floor(progress * 100);
  const remainingItems =
    frame >= PROGRESS_END
      ? 0
      : Math.max(0, Math.ceil(TOTAL_FILES * (1 - progress)));
  const sweep = ((frame + 34) % 210) / 210;

  const plane = polygonPath([
    project(0, 0),
    project(5600, 0),
    project(5600, 1800),
    project(0, 1800),
  ]);

  const barLeftTop = project(350, 1070);
  const barLeftBottom = project(350, 1260);
  const barRightTop = project(5350, 1070);
  const barRightBottom = project(5350, 1260);
  const track = polygonPath([
    barLeftTop,
    barRightTop,
    barRightBottom,
    barLeftBottom,
  ]);

  const fillLocalX = 350 + 5000 * progress;
  const fillRightTop = project(fillLocalX, 1070);
  const fillRightBottom = project(fillLocalX, 1260);
  const fill = polygonPath([
    barLeftTop,
    fillRightTop,
    fillRightBottom,
    barLeftBottom,
  ]);

  const sheenX =
    barLeftTop.x +
    (fillRightTop.x - barLeftTop.x) * (-0.22 + sweep * 1.44);
  return (
    <>
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0}}
    >
      <defs>
        <linearGradient id="screen-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E1E3DF" />
          <stop offset="52%" stopColor="#D7D9D5" />
          <stop offset="83%" stopColor="#C6C9C5" />
          <stop offset="100%" stopColor="#AFB3AE" />
        </linearGradient>
        <linearGradient id="track-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD2CD" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#E0E4E0" stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D152" />
          <stop offset="48%" stopColor="#00C349" />
          <stop offset="100%" stopColor="#00A83A" />
        </linearGradient>
        <linearGradient
          id="bar-sheen"
          gradientUnits="userSpaceOnUse"
          x1={sheenX - 250}
          y1="0"
          x2={sheenX + 250}
          y2="0"
        >
          <stop offset="0%" stopColor="#D8FFE4" stopOpacity="0" />
          <stop offset="28%" stopColor="#CBFFDA" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#F1FFF5" stopOpacity="0.66" />
          <stop offset="76%" stopColor="#A6FFC2" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#A6FFC2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="far-haze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="78%" stopColor="#F2F3F0" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#AEB2AD" stopOpacity="0.24" />
        </linearGradient>
      </defs>

      <path d={plane} fill="url(#screen-gradient)" />

      <path d={track} fill="url(#track-gradient)" />
      {progress > 0 ? (
        <>
          <path d={fill} fill="url(#fill-gradient)" />
          <path d={fill} fill="url(#bar-sheen)" />
        </>
      ) : null}

      <path d={plane} fill="url(#far-haze)" />
    </svg>
      <div
        style={{
          position: 'absolute',
          left: 730,
          top: -23,
          color: '#34393A',
          fontFamily: FONT,
          fontSize: 58,
          fontWeight: 350,
          letterSpacing: '-0.02em',
          transform: 'rotate(3.7deg)',
          transformOrigin: '0 0',
          whiteSpace: 'nowrap',
        }}
      >
        Delete
      </div>
      <div
        style={{
          position: 'absolute',
          left: 251,
          top: 203,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          color: '#25292A',
          fontFamily: FONT,
          fontSize: 102,
          fontWeight: 370,
          letterSpacing: '-0.027em',
          lineHeight: 1,
          transform: 'rotate(3.7deg) scaleX(0.68)',
          transformOrigin: '0 0',
          whiteSpace: 'nowrap',
          textShadow:
            '-1px 0 rgba(26,130,212,0.15), 1px 0 rgba(219,45,78,0.10)',
        }}
      >
        <FileIcon />
        <span>
          Deleting {formatNumber(remainingItems)} items from{' '}
          <span style={{color: '#5D93A5'}}>Archive Drive (D:)</span>
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 245,
          top: 420,
          display: 'flex',
          alignItems: 'baseline',
          color: '#303536',
          fontFamily: FONT,
          lineHeight: 0.92,
          whiteSpace: 'nowrap',
          textShadow:
            '-1px 0 rgba(31,132,204,0.15), 1px 0 rgba(220,42,70,0.10)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            minWidth: 375,
            fontSize: 198,
            fontWeight: 280,
            letterSpacing: '-0.072em',
          }}
        >
          {percent}%
        </span>
        <span
          style={{
            marginLeft: percent === 100 ? 18 : 28,
            fontSize: 106,
            fontWeight: 280,
            letterSpacing: '-0.04em',
            color: '#4A4F50',
          }}
        >
          complete
        </span>
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const safeFrame = Math.min(frame, durationInFrames - 1);
  const progress = getProgress(safeFrame);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#020303'}}>
      <DeletionInterface frame={safeFrame} progress={progress} />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: 0.24,
          mixBlendMode: 'multiply',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(22,36,58,0.18) 0px, rgba(22,36,58,0.18) 1px, rgba(244,78,104,0.08) 1px, rgba(244,78,104,0.08) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(0deg, rgba(34,42,48,0.13) 0px, rgba(34,42,48,0.13) 1px, transparent 1px, transparent 4px)',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 84% 94% at 31% 49%, transparent 0%, transparent 55%, rgba(3,5,4,0.10) 74%, rgba(0,0,0,0.58) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
