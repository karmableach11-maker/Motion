import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const map = (
  frame: number,
  input: readonly number[],
  output: readonly number[],
  easing?: (value: number) => number,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const COLORS = {
  ink: '#05070c',
  panel: '#111620',
  panelLight: '#1a2230',
  bevelLight: '#44516a',
  bevelDark: '#03050a',
  white: '#eef7ff',
  muted: '#8995a9',
  cyan: '#69f7ff',
  violet: '#8b72ff',
  green: '#5dffd2',
};

const PixelCorners: React.FC<{color: string; inset?: number}> = ({
  color,
  inset = 0,
}) => {
  const corner: React.CSSProperties = {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: color,
    opacity: 0.78,
  };

  return (
    <>
      <div
        style={{
          ...corner,
          left: inset,
          top: inset,
          borderLeft: `3px solid ${color}`,
          borderTop: `3px solid ${color}`,
        }}
      />
      <div
        style={{
          ...corner,
          right: inset,
          top: inset,
          borderRight: `3px solid ${color}`,
          borderTop: `3px solid ${color}`,
        }}
      />
      <div
        style={{
          ...corner,
          left: inset,
          bottom: inset,
          borderLeft: `3px solid ${color}`,
          borderBottom: `3px solid ${color}`,
        }}
      />
      <div
        style={{
          ...corner,
          right: inset,
          bottom: inset,
          borderRight: `3px solid ${color}`,
          borderBottom: `3px solid ${color}`,
        }}
      />
    </>
  );
};

const DarkBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 50% 48%, #151a2c 0%, #090c15 39%, #04060b 74%, #020307 100%)',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage:
            'linear-gradient(rgba(112,132,190,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(112,132,190,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(circle at center, black 0%, rgba(0,0,0,0.72) 44%, transparent 82%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 5px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '51%',
          width: 1120,
          height: 760,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse at center, rgba(102,82,255,0.13), rgba(44,222,255,0.045) 46%, transparent 71%)',
          filter: 'blur(28px)',
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 190px rgba(0,0,0,0.88)',
        }}
      />
    </AbsoluteFill>
  );
};

type PixelButtonProps = {
  label: string;
  primary?: boolean;
  hovered?: boolean;
  pressed?: boolean;
  completed?: boolean;
  opacity?: number;
};

const PixelButton: React.FC<PixelButtonProps> = ({
  label,
  primary = false,
  hovered = false,
  pressed = false,
  completed = false,
  opacity = 1,
}) => {
  const accent = completed ? COLORS.green : COLORS.cyan;

  return (
    <div
      style={{
        position: 'relative',
        width: 300,
        height: 96,
        opacity,
        transform: `translate(${pressed ? 5 : 0}px, ${pressed ? 5 : 0}px)`,
        background: primary
          ? completed
            ? 'linear-gradient(180deg, #18352f 0%, #0c201e 100%)'
            : 'linear-gradient(180deg, #202d42 0%, #111825 100%)'
          : 'linear-gradient(180deg, #1d2330 0%, #0d1119 100%)',
        border: `3px solid ${primary ? accent : '#657086'}`,
        boxShadow: pressed
          ? `inset 6px 6px 0 ${COLORS.bevelDark}, inset -3px -3px 0 rgba(122,145,175,0.18), 0 0 0 3px #020409`
          : `inset 5px 5px 0 rgba(115,137,171,0.34), inset -6px -6px 0 ${COLORS.bevelDark}, 0 0 0 3px #020409${
              primary && hovered
                ? `, 0 0 24px ${completed ? 'rgba(93,255,210,0.28)' : 'rgba(105,247,255,0.22)'}`
                : ''
            }`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 10,
          border: `2px dotted ${
            primary && hovered ? accent : 'rgba(164,179,203,0.62)'
          }`,
          opacity: primary ? 0.95 : 0.66,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${pressed ? 3 : -1}px)`,
          color: primary ? COLORS.white : '#b7c0cf',
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: label.length > 6 ? 28 : 34,
          fontWeight: 700,
          letterSpacing: 2,
          textShadow: primary
            ? `0 0 12px ${completed ? 'rgba(93,255,210,0.5)' : 'rgba(105,247,255,0.38)'}`
            : 'none',
        }}
      >
        {label}
      </div>
    </div>
  );
};

const PixelCursor: React.FC<{x: number; y: number; press: number}> = ({
  x,
  y,
  press,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x + press * 3,
        top: y + press * 6,
        width: 50,
        height: 72,
        zIndex: 20,
        filter:
          'drop-shadow(5px 7px 0 rgba(0,0,0,0.86)) drop-shadow(0 0 8px rgba(105,247,255,0.18))',
      }}
    >
      <svg
        width="50"
        height="72"
        viewBox="0 0 58 78"
        style={{display: 'block', shapeRendering: 'crispEdges'}}
      >
        <path
          d="M4 3V57L17 44L29 73L41 68L29 39H52L4 3Z"
          fill="#05070b"
          stroke="#05070b"
          strokeWidth="8"
          strokeLinejoin="miter"
        />
        <path
          d="M4 3V57L17 44L29 73L41 68L29 39H52L4 3Z"
          fill="#f3f8ff"
          stroke="#d8e7f7"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        <path
          d="M10 15V45L17 38L31 64L34 63L22 33H40L10 15Z"
          fill="#ffffff"
          opacity="0.62"
        />
      </svg>
    </div>
  );
};

const ClickRipple: React.FC<{progress: number; energy: number}> = ({
  progress,
  energy,
}) => {
  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const stepped = Math.floor(progress * 12) / 12;
  const opacity = (1 - progress) * 0.78;

  return (
    <>
      {[0, 1].map((ring) => {
        const delayed = clamp(stepped - ring * 0.13, 0, 1);
        const width = 54 + delayed * 260;
        const height = 38 + delayed * 142;
        return (
          <div
            key={ring}
            style={{
              position: 'absolute',
              left: 750 - width / 2,
              top: 716 - height / 2,
              width,
              height,
              border: `${ring === 0 ? 4 : 2}px solid ${COLORS.green}`,
              opacity: opacity * (ring === 0 ? 1 : 0.58),
              boxShadow: `0 0 ${20 + energy * 30}px rgba(93,255,210,${
                0.16 + energy * 0.16
              })`,
              zIndex: 13,
            }}
          />
        );
      })}
    </>
  );
};

const IdleContent: React.FC<{opacity: number}> = ({opacity}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 115,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 92,
          height: 92,
          marginBottom: 34,
          border: '3px solid #53627e',
          background:
            'linear-gradient(135deg, rgba(139,114,255,0.18), rgba(105,247,255,0.05))',
          boxShadow: 'inset 0 0 0 9px #0c111a, 0 0 30px rgba(139,114,255,0.11)',
        }}
      >
        <PixelCorners color="#7687a8" inset={8} />
        <div
          style={{
            position: 'absolute',
            left: 33,
            top: 33,
            width: 22,
            height: 22,
            background: COLORS.violet,
            boxShadow: `0 0 0 5px #151c29, 0 0 20px rgba(139,114,255,0.54)`,
          }}
        />
      </div>
      <div
        style={{
          color: COLORS.white,
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontWeight: 700,
          fontSize: 31,
          letterSpacing: 3,
          textAlign: 'center',
          textShadow: '0 0 18px rgba(139,114,255,0.22)',
        }}
      >
        EXECUTE SYSTEM ACTION?
      </div>
      <div
        style={{
          marginTop: 17,
          color: COLORS.muted,
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: 18,
          letterSpacing: 2,
          textAlign: 'center',
        }}
      >
        REQUEST_024 // SECURE MODE
      </div>
    </div>
  );
};

const SuccessContent: React.FC<{reveal: number; pulse: number}> = ({
  reveal,
  pulse,
}) => {
  const dash = 150 * (1 - reveal);
  const blockOpacity = map(reveal, [0.25, 0.65], [0, 0.72]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 102,
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        clipPath: `inset(0 ${100 - reveal * 100}% 0 0)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 114,
          height: 114,
          marginBottom: 25,
          border: `4px solid ${COLORS.green}`,
          background: '#0a1918',
          boxShadow: `inset 0 0 0 10px #0d1219, 0 0 ${28 + pulse * 18}px rgba(93,255,210,${
            0.25 + pulse * 0.12
          })`,
        }}
      >
        <PixelCorners color={COLORS.green} inset={8} />
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          style={{position: 'absolute', left: 11, top: 11, shapeRendering: 'crispEdges'}}
        >
          <path
            d="M18 45L36 63L70 25"
            fill="none"
            stroke={COLORS.white}
            strokeWidth="10"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeDasharray="150"
            strokeDashoffset={dash}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: -24,
            top: 25,
            width: 10,
            height: 10,
            background: COLORS.green,
            opacity: blockOpacity,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -34,
            bottom: 18,
            width: 16,
            height: 16,
            border: `3px solid ${COLORS.green}`,
            opacity: blockOpacity * 0.7,
          }}
        />
      </div>
      <div
        style={{
          color: COLORS.white,
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontWeight: 700,
          fontSize: 37,
          letterSpacing: 5,
          textAlign: 'center',
          textShadow: '0 0 20px rgba(93,255,210,0.42)',
        }}
      >
        ACTION COMPLETE
      </div>
      <div
        style={{
          marginTop: 14,
          color: COLORS.green,
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 3,
          textAlign: 'center',
        }}
      >
        STATUS 200 // VERIFIED
      </div>
    </div>
  );
};

const RetroDialog: React.FC<{
  frame: number;
  press: number;
  success: number;
  successPulse: number;
}> = ({frame, press, success, successPulse}) => {
  const hovered = frame >= 365;
  const completed = success > 0.55;
  const idleOpacity = map(frame, [592, 616], [1, 0]);
  const successGlow = success * 0.24 + successPulse * 0.08;
  const titleFlash = map(frame, [585, 592, 618], [0, 1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 936,
        height: 640,
        transform: 'translate(-50%, -50%)',
        background: `linear-gradient(180deg, ${COLORS.panelLight} 0%, ${COLORS.panel} 28%, #0e131c 100%)`,
        border: '5px solid #06080e',
        outline: '3px solid #69758d',
        boxShadow: `inset 7px 7px 0 rgba(126,145,175,0.34), inset -8px -8px 0 #03050a, 0 30px 95px rgba(0,0,0,0.68), 0 0 ${
          54 + success * 44
        }px rgba(93,255,210,${successGlow}), 0 0 0 1px rgba(111,129,193,0.42)`,
        overflow: 'hidden',
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 10,
          right: 10,
          top: 10,
          height: 74,
          background:
            'linear-gradient(90deg, #241c69 0%, #3a4e9b 43%, #54799a 78%, #6e89a5 100%)',
          border: '3px solid #080b13',
          boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.17), inset -4px -4px 0 rgba(3,5,12,0.62)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #183b5b 0%, #126e73 52%, #16977e 100%)',
            opacity: success,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: COLORS.green,
            opacity: titleFlash * 0.18,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 22,
            top: 18,
            color: '#f4f7ff',
            fontFamily: '"Courier New", "Lucida Console", monospace',
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 3,
            textShadow: '3px 3px 0 rgba(0,0,0,0.48)',
          }}
        >
          {completed ? 'SYSTEM // VERIFIED' : 'SYSTEM // CONFIRM'}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 10,
            width: 50,
            height: 50,
            background: '#9aa5b3',
            border: '3px solid #090b10',
            boxShadow: 'inset 4px 4px 0 #d7dde6, inset -5px -5px 0 #4d5665',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 22,
              width: 26,
              height: 3,
              background: '#151820',
              transform: 'rotate(45deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 22,
              width: 26,
              height: 3,
              background: '#151820',
              transform: 'rotate(-45deg)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 27,
          right: 27,
          top: 103,
          bottom: 28,
          border: '2px solid rgba(111,126,153,0.18)',
          background:
            'linear-gradient(180deg, rgba(27,35,49,0.48), rgba(8,11,17,0.08))',
        }}
      />

      <IdleContent opacity={idleOpacity} />
      <SuccessContent reveal={success} pulse={successPulse} />

      <div
        style={{
          position: 'absolute',
          left: 108,
          right: 108,
          bottom: 84,
          height: 96,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <PixelButton
          label={completed ? 'DONE' : 'OK'}
          primary
          hovered={hovered}
          pressed={press > 0.2}
          completed={completed}
        />
        <PixelButton
          label={completed ? 'CLOSE' : 'CANCEL'}
          opacity={completed ? 0.34 : 1}
        />
      </div>
      <PixelCorners color={completed ? COLORS.green : '#74829c'} inset={14} />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const sceneScale = Math.min(width / 1920, height / 1080);

  const cursorTravel = map(
    frame,
    [146, 365],
    [0, 1],
    Easing.bezier(0.28, 0.08, 0.2, 1),
  );
  const entryTravel = map(frame, [126, 146], [0, 1], Easing.out(Easing.cubic));
  const cursorVisible = frame >= 126;

  const cursorX =
    frame < 146
      ? map(entryTravel, [0, 1], [1370, 1270])
      : map(cursorTravel, [0, 1], [1270, 746]);
  const cursorY =
    frame < 146
      ? map(entryTravel, [0, 1], [1120, 948])
      : map(cursorTravel, [0, 1], [948, 704]);

  const press = map(frame, [580, 586, 592], [0, 1, 0], Easing.inOut(Easing.quad));
  const rippleProgress = map(frame, [585, 650], [0, 1]);
  const clickEnergy = Math.sin(clamp(rippleProgress, 0, 1) * Math.PI);
  const success = map(frame, [598, 670], [0, 1], Easing.out(Easing.cubic));
  const successPulse =
    success > 0.99 ? 0.5 + 0.5 * Math.sin((frame - 670) * 0.045) : clickEnergy;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${sceneScale})`,
          transformOrigin: 'center center',
        }}
      >
        <DarkBackground />
        <RetroDialog
          frame={frame}
          press={press}
          success={success}
          successPulse={successPulse}
        />
        <ClickRipple progress={rippleProgress} energy={clickEnergy} />
        {cursorVisible ? (
          <PixelCursor x={cursorX} y={cursorY} press={press} />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
