import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const COLORS = {
  background: '#070910',
  panel: '#c7c3b7',
  panelLight: '#f4f1e9',
  panelMidLight: '#d9d5cb',
  panelDark: '#6d6964',
  panelMidDark: '#9c9890',
  ink: '#11100e',
  titleLeft: '#172b74',
  titleMid: '#566b9d',
  titleRight: '#8b9dbd',
  progress: '#0c256f',
};

const FONT = '"MS Sans Serif", Tahoma, Arial, sans-serif';

const WINDOW = {
  left: 384,
  top: 154,
  width: 1152,
  height: 772,
};

const COMPLETE_FRAME = 436;
const WINDOW_CLOSE_FRAME = 718;
const POINTER_START_FRAME = 542;
const POINTER_SETTLE_FRAME = 681;
const PRESS_START_FRAME = 683;
const PRESS_END_FRAME = 715;

const raisedBevel = [
  `inset 6px 6px 0 ${COLORS.panelLight}`,
  `inset -6px -6px 0 ${COLORS.panelDark}`,
  `inset 12px 12px 0 ${COLORS.panelMidLight}`,
  `inset -12px -12px 0 ${COLORS.panelMidDark}`,
].join(', ');

const pressedBevel = [
  `inset 7px 7px 0 #34322f`,
  `inset -7px -7px 0 ${COLORS.panelLight}`,
  `inset 13px 13px 0 ${COLORS.panelDark}`,
  `inset -13px -13px 0 ${COLORS.panelMidLight}`,
].join(', ');

const InsetRail: React.FC<{progress: number}> = ({progress}) => {
  const innerWidth = 1000;

  return (
    <div
      style={{
        position: 'absolute',
        left: 62,
        top: 354,
        width: 1028,
        height: 111,
        backgroundColor: COLORS.panel,
        boxShadow: [
          `inset 7px 7px 0 ${COLORS.panelDark}`,
          `inset -7px -7px 0 ${COLORS.panelLight}`,
          `inset 13px 13px 0 ${COLORS.panelMidDark}`,
          `inset -13px -13px 0 ${COLORS.panelMidLight}`,
        ].join(', '),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 14,
          width: innerWidth,
          height: 83,
          overflow: 'hidden',
          backgroundColor: COLORS.panel,
        }}
      >
        <div
          style={{
            width: Math.max(0, innerWidth * progress),
            height: '100%',
            backgroundColor: COLORS.progress,
          }}
        />
      </div>
    </div>
  );
};

const WindowControl: React.FC<{kind: 'minimize' | 'close'; right: number}> = ({
  kind,
  right,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        right,
        top: 10,
        width: 84,
        height: 84,
        backgroundColor: COLORS.panel,
        boxShadow: raisedBevel,
      }}
    >
      {kind === 'minimize' ? (
        <div
          style={{
            position: 'absolute',
            left: 22,
            bottom: 20,
            width: 42,
            height: 7,
            backgroundColor: COLORS.panelDark,
          }}
        />
      ) : (
        <svg
          viewBox="0 0 84 84"
          width="84"
          height="84"
          style={{position: 'absolute', inset: 0}}
        >
          <path
            d="M25 23L60 59M59 23L24 59"
            stroke={COLORS.panelDark}
            strokeWidth="4"
            shapeRendering="crispEdges"
          />
        </svg>
      )}
    </div>
  );
};

const ActionButton: React.FC<{pressed: boolean; complete: boolean}> = ({
  pressed,
  complete,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 60,
        bottom: 64,
        width: 374,
        height: 116,
        backgroundColor: '#d1cdc3',
        boxShadow: pressed ? pressedBevel : raisedBevel,
        color: COLORS.ink,
        fontFamily: FONT,
        fontSize: complete ? 58 : 55,
        letterSpacing: -3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: pressed ? 8 : 0,
        paddingLeft: pressed ? 8 : 0,
        boxSizing: 'border-box',
      }}
    >
      {complete ? 'Ok' : 'Cancel'}
    </div>
  );
};

const RetroWindow: React.FC<{
  progress: number;
  complete: boolean;
  pressed: boolean;
  dots: number;
}> = ({progress, complete, pressed, dots}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: WINDOW.left,
        top: WINDOW.top,
        width: WINDOW.width,
        height: WINDOW.height,
        backgroundColor: COLORS.panel,
        boxShadow: raisedBevel,
        imageRendering: 'pixelated',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 28,
          width: WINDOW.width - 48,
          height: 104,
          background: `linear-gradient(90deg, ${COLORS.titleLeft} 0%, ${COLORS.titleMid} 57%, ${COLORS.titleRight} 100%)`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: 9,
            color: '#f5f7fb',
            fontFamily: FONT,
            fontSize: 65,
            lineHeight: 1.25,
            letterSpacing: -3,
            whiteSpace: 'nowrap',
          }}
        >
          Loading
        </div>
        <WindowControl kind="minimize" right={102} />
        <WindowControl kind="close" right={10} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 158,
          color: COLORS.ink,
          fontFamily: FONT,
          fontSize: 58,
          lineHeight: 1,
          letterSpacing: -3,
          whiteSpace: 'nowrap',
        }}
      >
        {complete ? 'Complete' : `Please wait${'.'.repeat(dots)}`}
      </div>

      <InsetRail progress={progress} />
      <ActionButton complete={complete} pressed={pressed} />
    </div>
  );
};

const Pointer: React.FC<{frame: number}> = ({frame}) => {
  if (frame < POINTER_START_FRAME) {
    return null;
  }

  const travel = interpolate(
    frame,
    [POINTER_START_FRAME, POINTER_SETTLE_FRAME],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const x = interpolate(travel, [0, 1], [1546, 1402]);
  const y = interpolate(travel, [0, 1], [1094, 796]);

  return (
    <svg
      width="84"
      height="108"
      viewBox="0 0 84 108"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        overflow: 'visible',
        imageRendering: 'pixelated',
      }}
    >
      <path
        d="M6 5L6 82L25 64L43 101L58 94L40 58L72 58Z"
        fill="#f8f8f2"
        stroke="#0b0b0a"
        strokeWidth="6"
        strokeLinejoin="miter"
        shapeRendering="crispEdges"
      />
    </svg>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const progress = interpolate(
    frame,
    [0, 46, 58, 69, 115, 173, 231, 289, 346, 404, 439],
    [0, 0.004, 0.036, 0.067, 0.191, 0.339, 0.476, 0.659, 0.843, 0.961, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const complete = frame >= COMPLETE_FRAME;
  const pressed = frame >= PRESS_START_FRAME && frame <= PRESS_END_FRAME;
  const dots = Math.floor(frame / 39) % 4;
  const scale = Math.min(width / 1920, height / 1080);
  const offsetX = (width - 1920 * scale) / 2;
  const offsetY = (height - 1080 * scale) / 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: offsetX,
          top: offsetY,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {frame < WINDOW_CLOSE_FRAME ? (
          <RetroWindow
            progress={progress}
            complete={complete}
            pressed={pressed}
            dots={dots}
          />
        ) : null}
        <Pointer frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

