import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const COLORS = {
  obsidian: '#05030B',
  deepPlum: '#12081F',
  rail: '#21122F',
  lavenderCode: '#E0C1FF',
  mintCode: '#AEFFE9',
  orchid: '#A855F7',
  magenta: '#E84BCB',
  mint: '#78FFD6',
  champagne: '#FFD166',
  champagneSoft: '#FFF1B8',
  warmWhite: '#FFF7ED',
};

const STATUS_FONT = 'Arial, Helvetica, sans-serif';

const HUD = {
  x: 455,
  y: 310,
  width: 1010,
  height: 463,
  radius: 58,
};

const RAIL = {
  x: 562,
  y: 498,
  width: 798,
  height: 94,
  inset: 7,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (value: number) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};

const triangularPulse = (frame: number, center: number, radius: number) =>
  clamp01(1 - Math.abs(frame - center) / radius);

const getGlitch = (frame: number) => {
  const centers = [15, 43, 61, 76, 151, 231, 318, 421, 527, 586, 615];
  return Math.max(
    ...centers.map((center, index) =>
      triangularPulse(frame, center, index % 3 === 0 ? 4 : 2.5),
    ),
  );
};

const CODE_LINES = [
  'import telemetry',
  'import runtime',
  'from core.sync import handshake',
  '',
  '# Luminous Runtime Interface',
  'def stream_status(packet, latency=0.04):',
  '    for byte in packet:',
  '        bus.write(byte)',
  '        bus.flush()',
  '        clock.wait(latency)',
  '',
  '# Integrity Handshake',
  'def verify_signature(payload):',
  '    token = matrix.encode(payload)',
  '    checksum = digest(token)',
  '    return checksum == expected',
  '',
  '# Memory Allocation',
  'def allocate_shards(count=16):',
  '    shards = [Node(i) for i in range(count)]',
  '    routes = topology.resolve(shards)',
  '    return routes',
  '',
  '# Secure Channel',
  'def open_channel(endpoint, protocol="v4"):',
  '    session = negotiate(endpoint)',
  '    session.attach(protocol)',
  '    return session',
  '',
  '# Main Sequence',
  'def initialize():',
  '    status.emit("Booting runtime...")',
  '    status.emit("Mapping modules...")',
  '    status.emit("Checking integrity...")',
  '',
  'while active:',
  '    frame = queue.next()',
  '    result = stream_status(frame)',
  '    monitor.push(result)',
  '    if result.ready:',
  '        monitor.commit()',
  '',
  'for sector in mesh.sectors:',
  '    sector.calibrate()',
  '    sector.pulse(rate=0.08)',
  '    sector.report()',
  '',
  'runtime.lock_state()',
  'telemetry.flush()',
  'handshake.confirm()',
  'return SYSTEM_STABLE',
];

const CODE_LINE_HEIGHT = 35;
const CODE_BLOCK_HEIGHT = CODE_LINES.length * CODE_LINE_HEIGHT;
const CODE_SPEED = 128;

type CodeColumnProps = {
  left: number;
  width: number;
  frame: number;
  fps: number;
  columnIndex: number;
};

const CodeColumn: React.FC<CodeColumnProps> = ({
  left,
  width,
  frame,
  fps,
  columnIndex,
}) => {
  const time = frame / fps;
  const scroll = (time * CODE_SPEED) % CODE_BLOCK_HEIGHT;
  const offsets = [-CODE_BLOCK_HEIGHT - scroll, -scroll, CODE_BLOCK_HEIGHT - scroll];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {offsets.map((top, blockIndex) => (
        <div
          key={`${columnIndex}-${blockIndex}`}
          style={{
            position: 'absolute',
            left,
            top,
            width,
            height: CODE_BLOCK_HEIGHT,
          }}
        >
          {CODE_LINES.map((line, lineIndex) => {
            const isComment = line.startsWith('#');
            const isSignal =
              line.includes('return') ||
              line.includes('emit') ||
              line.includes('confirm') ||
              line.includes('commit');
            const softPulse =
              0.78 + 0.28 * Math.sin(frame * 0.054 + lineIndex * 1.17);
            const color = isSignal
              ? COLORS.mintCode
              : isComment
                ? COLORS.champagne
                : COLORS.lavenderCode;
            const opacity =
              (isComment ? 0.88 : isSignal ? 0.94 : 0.86) * softPulse;

            return (
              <div
                key={`${blockIndex}-${lineIndex}`}
                style={{
                  height: CODE_LINE_HEIGHT,
                  lineHeight: `${CODE_LINE_HEIGHT}px`,
                  color,
                  opacity,
                  whiteSpace: 'pre',
                  overflow: 'hidden',
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: 0.08,
                  textShadow: `0 0 4px ${color}DD, 0 0 11px ${color}88`,
                  transform: `translateX(${Math.sin(
                    frame * 0.012 + lineIndex * 0.91 + columnIndex,
                  ) * 1.2}px)`,
                }}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const CodeSmears: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const time = frame / fps;
  const smears = useMemo(
    () =>
      Array.from({length: 24}, (_, index) => ({
        column: index % 2,
        baseY: (index * 197 + 61) % 1490,
        leftInset: 18 + ((index * 73) % 170),
        width: 190 + ((index * 89) % 360),
        height: 5 + (index % 4) * 3,
        speed: 0.91 + (index % 3) * 0.045,
        phase: index * 0.83,
        color: index % 5 === 0 ? COLORS.mint : COLORS.magenta,
      })),
    [],
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', mixBlendMode: 'screen'}}>
      {smears.map((smear, index) => {
        const y =
          ((smear.baseY - time * CODE_SPEED * smear.speed + 1560) % 1560) - 90;
        const columnLeft = smear.column === 0 ? 0 : 1088;
        const horizontalDrift = Math.sin(frame * 0.08 + smear.phase) * 42;
        const visibility =
          0.25 + 0.75 * Math.pow(Math.max(0, Math.sin(frame * 0.11 + smear.phase)), 4);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: columnLeft + smear.leftInset + horizontalDrift,
              top: y,
              width: smear.width,
              height: smear.height,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${smear.color}, transparent)`,
              opacity: 0.035 + visibility * 0.085,
              filter: `blur(${8 + (index % 3) * 5}px)`,
              boxShadow: `0 0 24px ${smear.color}66`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Background: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 48%, rgba(117,45,142,0.22) 0%, rgba(62,19,86,0.10) 34%, rgba(5,3,11,0) 66%), linear-gradient(135deg, #05030B 0%, #0A0412 46%, #140720 100%)',
      }}
    >
      <CodeColumn left={14} width={804} frame={frame} fps={fps} columnIndex={0} />
      <CodeColumn left={1100} width={806} frame={frame} fps={fps} columnIndex={1} />
      <CodeSmears frame={frame} fps={fps} />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(5,3,11,0.08) 0%, rgba(5,3,11,0) 24%, rgba(5,3,11,0.42) 45%, rgba(5,3,11,0.42) 55%, rgba(5,3,11,0) 76%, rgba(5,3,11,0.08) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const HudFrame: React.FC<{frame: number}> = ({frame}) => {
  const glitch = getGlitch(frame);
  const bloomPulse = 0.91 + 0.09 * Math.sin(frame * 0.037);
  const edgeFlash = Math.pow(Math.max(0, Math.sin(frame * 0.19 + 0.8)), 12);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          <linearGradient id="panel-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1C0A28" stopOpacity="0.33" />
            <stop offset="48%" stopColor="#08040F" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#24102E" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="hud-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.orchid} />
            <stop offset="48%" stopColor={COLORS.magenta} />
            <stop offset="76%" stopColor={COLORS.orchid} />
            <stop offset="100%" stopColor={COLORS.mint} />
          </linearGradient>
          <filter id="blur-heavy" x="-30%" y="-45%" width="160%" height="190%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="blur-medium" x="-20%" y="-35%" width="140%" height="170%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="edge-blur" x="-30%" y="-300%" width="160%" height="700%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <clipPath id="hud-inner-clip">
            <rect
              x={HUD.x + 5}
              y={HUD.y + 5}
              width={HUD.width - 10}
              height={HUD.height - 10}
              rx={HUD.radius - 4}
            />
          </clipPath>
        </defs>

        <rect
          x={HUD.x}
          y={HUD.y}
          width={HUD.width}
          height={HUD.height}
          rx={HUD.radius}
          fill="url(#panel-fill)"
          stroke="none"
        />

        <g clipPath="url(#hud-inner-clip)" opacity="0.18">
          {Array.from({length: 18}, (_, index) => (
            <line
              key={index}
              x1={HUD.x + 8}
              x2={HUD.x + HUD.width - 8}
              y1={HUD.y + 13 + index * 26}
              y2={HUD.y + 13 + index * 26}
              stroke={index % 5 === 0 ? COLORS.mint : COLORS.orchid}
              strokeWidth={index % 5 === 0 ? 1.25 : 0.65}
              opacity={index % 5 === 0 ? 0.13 : 0.055}
            />
          ))}
        </g>

        <rect
          x={HUD.x}
          y={HUD.y}
          width={HUD.width}
          height={HUD.height}
          rx={HUD.radius}
          fill="none"
          stroke="url(#hud-stroke)"
          strokeWidth="12"
          opacity={0.26 * bloomPulse}
          filter="url(#blur-heavy)"
        />
        <rect
          x={HUD.x}
          y={HUD.y}
          width={HUD.width}
          height={HUD.height}
          rx={HUD.radius}
          fill="none"
          stroke="url(#hud-stroke)"
          strokeWidth="7"
          opacity={0.72 * bloomPulse}
          filter="url(#blur-medium)"
        />
        <rect
          x={HUD.x}
          y={HUD.y}
          width={HUD.width}
          height={HUD.height}
          rx={HUD.radius}
          fill="none"
          stroke="url(#hud-stroke)"
          strokeWidth="3.4"
          opacity={0.95 * bloomPulse}
        />

        <g
          strokeLinecap="round"
          filter="url(#edge-blur)"
          opacity={0.16 + edgeFlash * 0.25 + glitch * 0.12}
        >
          <path d="M 456 310 H 250" stroke={COLORS.orchid} strokeWidth="7" />
          <path d="M 1464 310 H 1690" stroke={COLORS.mint} strokeWidth="6" />
          <path d="M 456 773 H 210" stroke={COLORS.magenta} strokeWidth="8" />
          <path d="M 1464 773 H 1735" stroke={COLORS.orchid} strokeWidth="7" />
        </g>
        <g
          strokeLinecap="round"
          opacity={0.11 + edgeFlash * 0.17 + glitch * 0.08}
          transform={`translate(${glitch * 22} 0)`}
        >
          <path d="M 456 310 H 318" stroke={COLORS.champagne} strokeWidth="2" />
          <path d="M 1464 310 H 1642" stroke={COLORS.mint} strokeWidth="2" />
          <path d="M 456 773 H 286" stroke={COLORS.magenta} strokeWidth="2" />
          <path d="M 1464 773 H 1678" stroke={COLORS.champagne} strokeWidth="2" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const ProgressAssembly: React.FC<{
  frame: number;
  fps: number;
  progress: number;
}> = ({frame, fps, progress}) => {
  const innerWidth = RAIL.width - RAIL.inset * 2;
  const fillWidth = Math.max(4, innerWidth * progress);
  const shimmerX = ((frame * 9.5) % (innerWidth + 220)) - 140;
  const headX = Math.min(innerWidth - 2, fillWidth);
  const completion = interpolate(progress, [0.985, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const pulse = 0.88 + 0.12 * Math.sin((frame / fps) * Math.PI * 2 * 1.1);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: RAIL.x,
          top: RAIL.y,
          width: RAIL.width,
          height: RAIL.height,
          clipPath: 'polygon(2.6% 0%, 100% 0%, 97.4% 100%, 0% 100%)',
          background: `linear-gradient(90deg, ${COLORS.orchid}, ${COLORS.magenta} 52%, ${COLORS.mint})`,
          opacity: 0.94,
          filter: `drop-shadow(0 0 7px ${COLORS.orchid}) drop-shadow(0 0 22px ${COLORS.magenta}88)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: RAIL.inset,
            top: RAIL.inset,
            width: innerWidth,
            height: RAIL.height - RAIL.inset * 2,
            clipPath: 'polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)',
            background: `linear-gradient(180deg, #160B20 0%, ${COLORS.rail} 53%, #0B0610 100%)`,
            boxShadow: 'inset 0 0 22px rgba(2,1,5,0.95)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: fillWidth,
              height: '100%',
              background: `linear-gradient(90deg, ${COLORS.champagne} 0%, ${COLORS.champagneSoft} 68%, ${COLORS.warmWhite} 100%)`,
              boxShadow: `0 0 18px ${COLORS.champagne}, 0 0 42px ${COLORS.champagne}88`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: shimmerX,
                top: -28,
                width: 116,
                height: 140,
                transform: 'skewX(-18deg)',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                filter: 'blur(8px)',
                opacity: 0.72,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '5px 4px auto 4px',
                height: 3,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.72)',
                filter: 'blur(0.5px)',
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: headX - 5,
              top: 2,
              width: 10,
              height: RAIL.height - RAIL.inset * 2 - 4,
              borderRadius: 99,
              background: COLORS.mint,
              boxShadow: `0 0 12px ${COLORS.mint}, 0 0 30px ${COLORS.mint}`,
              opacity: progress <= 0.002 ? 0 : pulse,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: RAIL.x + 13,
          top: RAIL.y + 18,
          width: RAIL.width - 28,
          height: RAIL.height - 36,
          borderRadius: 999,
          boxShadow: `0 0 ${26 + completion * 30}px ${COLORS.champagne}`,
          opacity: 0.04 + completion * 0.13,
          transform: `scaleX(${0.98 + completion * 0.02})`,
        }}
      />
    </AbsoluteFill>
  );
};

const StatusTypography: React.FC<{
  frame: number;
  progressLabel: number;
}> = ({frame, progressLabel}) => {
  const titleReveal = interpolate(frame, [33, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const glitch = getGlitch(frame);
  const dotCount = Math.floor(((frame + 11) % 80) / 20);
  const dots = '.'.repeat(dotCount);
  const title = `Loading System${dots}`;
  const titleBlur = (1 - titleReveal) * 15 + glitch * 1.7;
  const titleShift = (1 - titleReveal) * 20;
  const titleOpacity = titleReveal * (1 - glitch * 0.13);
  const percentPulse = 1 + 0.018 * Math.sin(frame * 0.085);

  const commonTitleStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 385,
    width: '100%',
    height: 78,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'pre',
    fontFamily: STATUS_FONT,
    fontSize: 58,
    fontWeight: 520,
    letterSpacing: 0.15 + (1 - titleReveal) * 4.5,
    color: COLORS.warmWhite,
    textShadow: `0 0 9px ${COLORS.champagne}AA, 0 0 25px ${COLORS.orchid}88`,
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          ...commonTitleStyle,
          opacity: titleOpacity,
          filter: `blur(${titleBlur}px)`,
          transform: `translateX(${titleShift}px)`,
        }}
      >
        {title}
      </div>

      {glitch > 0.01 && (
        <>
          <div
            style={{
              ...commonTitleStyle,
              opacity: titleReveal * glitch * 0.72,
              color: COLORS.mint,
              clipPath: 'inset(8% 0 57% 0)',
              transform: `translateX(${glitch * 25}px)`,
              filter: 'blur(0.8px)',
              mixBlendMode: 'screen',
            }}
          >
            {title}
          </div>
          <div
            style={{
              ...commonTitleStyle,
              opacity: titleReveal * glitch * 0.64,
              color: COLORS.magenta,
              clipPath: 'inset(62% 0 13% 0)',
              transform: `translateX(${-glitch * 18}px)`,
              filter: 'blur(1px)',
              mixBlendMode: 'screen',
            }}
          >
            {title}
          </div>
        </>
      )}

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 617,
          width: '100%',
          height: 82,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: STATUS_FONT,
          fontSize: 67,
          lineHeight: 1,
          fontWeight: 500,
          letterSpacing: -1.1,
          color: COLORS.champagne,
          textShadow: `0 0 10px ${COLORS.champagne}AA, 0 0 26px ${COLORS.orchid}88`,
          opacity: 1 - glitch * 0.1,
          transform: `translateX(${glitch * 2}px) scale(${percentPulse})`,
          filter: `blur(${glitch * 0.7}px)`,
        }}
      >
        {progressLabel}%
      </div>

      {glitch > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 617,
            width: '100%',
            height: 82,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: STATUS_FONT,
            fontSize: 67,
            fontWeight: 500,
            letterSpacing: -1.1,
            color: COLORS.mint,
            textShadow: `0 0 16px ${COLORS.mint}`,
            opacity: glitch * 0.48,
            clipPath: 'inset(45% 0 27% 0)',
            transform: `translateX(${-glitch * 17}px)`,
            mixBlendMode: 'screen',
          }}
        >
          {progressLabel}%
        </div>
      )}
    </AbsoluteFill>
  );
};

const FinishingPass: React.FC<{frame: number}> = ({frame}) => {
  const scanOffset = (frame * 0.16) % 5;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 5px)',
          backgroundPosition: `0 ${scanOffset}px`,
          opacity: 0.28,
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 37%, rgba(3,1,7,0.23) 68%, rgba(2,1,5,0.78) 100%), linear-gradient(180deg, rgba(0,0,0,0.20), transparent 12%, transparent 88%, rgba(0,0,0,0.27))',
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const elapsedSeconds = frame / fps;
  const progress = smoothstep(elapsedSeconds / 9.99);
  const earlyLabelBias = interpolate(
    elapsedSeconds,
    [1.25, 1.55, 1.85],
    [0, 0.55, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    },
  );
  const progressLabel = Math.round(progress * 100 + earlyLabelBias);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.obsidian,
        overflow: 'hidden',
      }}
    >
      <Background frame={frame} fps={fps} />
      <HudFrame frame={frame} />
      <ProgressAssembly frame={frame} fps={fps} progress={progress} />
      <StatusTypography frame={frame} progressLabel={progressLabel} />
      <FinishingPass frame={frame} />
    </AbsoluteFill>
  );
};
