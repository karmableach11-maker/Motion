import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const PANEL = {x: 568, y: 401, width: 862, height: 271};
const COMPLETE_FRAME = 807;

type Theme = {
  accent: string;
  bright: string;
  core: string;
  deep: string;
  glass: string;
  fog: string;
};

const GREEN: Theme = {
  accent: "#00ff66",
  bright: "#5dff9c",
  core: "#e4ffed",
  deep: "#006b30",
  glass: "rgba(0, 20, 11, 0.86)",
  fog: "rgba(0, 255, 102, 0.15)",
};

const RED: Theme = {
  accent: "#ff123f",
  bright: "#ff5574",
  core: "#fff0f3",
  deep: "#7b001e",
  glass: "rgba(27, 0, 7, 0.88)",
  fog: "rgba(255, 18, 63, 0.16)",
};

type GlitchEvent = {
  start: number;
  end: number;
  from: Theme;
  to: Theme;
};

const GLITCH_EVENTS: GlitchEvent[] = [
  {start: 0, end: 40, from: GREEN, to: GREEN},
  {start: 171, end: 211, from: GREEN, to: RED},
  {start: 353, end: 393, from: RED, to: GREEN},
  {start: 537, end: 582, from: GREEN, to: RED},
  {start: 739, end: 784, from: RED, to: GREEN},
];

const codeStatements = [
  "private String neuralAddress;",
  "private String accessToken;",
  "private String nodeSignature;",
  "public CoreNode(String id, String key) {",
  "  this.nodeId = id;",
  "  this.sessionKey = key;",
  "  this.status = ACTIVE;",
  "  this.signal = validate(hash);",
  "}",
  "public String getCipherState() {",
  "  return cipherState;",
  "}",
  "public void setRoute(String route) {",
  "  this.route = sanitize(route);",
  "}",
  "// integrity and system checks",
  "public void verifyPacket() {",
  "  checksum = stream.getHash();",
  "  if (checksum != null) commit();",
  "}",
  "private boolean authorize(int level) {",
  "  return level <= clearance;",
  "}",
  "public void syncNeuralCache() {",
  "  memory.merge(activeIndex);",
  "  gateway.broadcast(SYNC);",
  "}",
  "@Override",
  "public String toString() {",
  "  return nodeId + status;",
  "}",
  "public void updateVector(float[] v) {",
  "  engine.normalize(v);",
  "}",
  "private long timestamp = clock.now();",
  "public boolean isSecure() {",
  "  return firewall.isVerified();",
  "}",
  "// encrypted transport layer",
  "packet.route(primaryGateway);",
  "monitor.watch(systemState);",
  "buffer.flushOnComplete();",
  "return Response.accepted();",
];

const seeded = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const themeForFrame = (frame: number): Theme => {
  if (frame >= 739) return GREEN;
  if (frame >= 537) return RED;
  if (frame >= 353) return GREEN;
  if (frame >= 171) return RED;
  return GREEN;
};

const activeGlitch = (frame: number) => {
  const event = GLITCH_EVENTS.find((item) => frame >= item.start && frame <= item.end);
  if (!event) return null;
  const duration = Math.max(1, event.end - event.start);
  const phase = (frame - event.start) / duration;
  const envelope = Math.sin(Math.PI * Math.min(1, Math.max(0, phase)));
  const chatter = 0.44 + 0.56 * Math.abs(Math.sin(phase * Math.PI * 8.2 + 0.8));
  return {event, phase, strength: Math.min(1, envelope * chatter + (phase < 0.08 ? 0.2 : 0))};
};

const rgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const MatrixCodeField: React.FC<{theme: Theme}> = ({theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rowHeight = 36;
  const scroll = ((frame / fps) * 113) % (rowHeight * codeStatements.length);
  const columns = [
    {x: 64, width: 730, seed: 3, opacity: 0.76},
    {x: 1125, width: 720, seed: 17, opacity: 0.72},
  ];

  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      {columns.map((column, columnIndex) => (
        <div
          key={column.x}
          style={{
            position: "absolute",
            left: column.x,
            top: -rowHeight * codeStatements.length - scroll,
            width: column.width,
            fontFamily: '"Courier New", "Lucida Console", monospace',
            fontSize: 24,
            lineHeight: `${rowHeight}px`,
            fontWeight: 900,
            letterSpacing: 0.25,
            color: theme.bright,
            opacity:
              column.opacity *
              (0.9 + 0.1 * Math.sin(frame * 0.41 + columnIndex * 1.7) ** 2),
            filter: "blur(0.45px)",
            textShadow: `0 0 7px ${rgba(theme.accent, 0.72)}, 0 0 18px ${rgba(theme.accent, 0.22)}`,
            transform: `translateY(${rowHeight * codeStatements.length}px)`,
          }}
        >
          {[0, 1, 2].flatMap((cycle) =>
            codeStatements.map((line, index) => {
              const number = ((index + cycle * codeStatements.length + columnIndex * 3) % 97) + 1;
              const opacity = 0.52 + seeded(index * 9 + cycle * 31 + column.seed) * 0.48;
              const flickerSample = seeded(
                index * 83 +
                  cycle * 149 +
                  column.seed * 17 +
                  Math.floor(frame / 4) * 271,
              );
              const temporalOpacity = flickerSample < 0.05 ? 0.02 : flickerSample < 0.1 ? 0.28 : 1;
              const indent = seeded(index * 13 + column.seed) > 0.76 ? 34 : 0;
              return (
                <div
                  key={`${cycle}-${index}`}
                  style={{
                    height: rowHeight,
                    whiteSpace: "nowrap",
                    opacity: opacity * temporalOpacity,
                    transform: `translateX(${indent}px)`,
                  }}
                >
                  <span style={{display: "inline-block", width: 48, opacity: 0.66}}>
                    {String(number).padStart(2, "0")}
                  </span>
                  {line}
                </div>
              );
            }),
          )}
        </div>
      ))}

      {Array.from({length: 13}).map((_, index) => {
        const speed = 0.5 + seeded(index + 20) * 0.9;
        const baseY = seeded(index + 51) * HEIGHT;
        const y = (baseY - frame * speed + HEIGHT + 140) % (HEIGHT + 140) - 70;
        const left = index % 2 === 0 ? 30 : 1040;
        const width = 180 + seeded(index + 81) * 680;
        const breathe = 0.45 + 0.55 * Math.sin(frame * 0.045 + index * 1.7) ** 2;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left,
              top: y,
              width,
              height: 8 + seeded(index + 91) * 18,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${rgba(theme.accent, 0.22 * breathe)}, transparent)`,
              filter: `blur(${8 + seeded(index + 101) * 13}px)`,
              opacity: 0.42,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const AtmosphericStreaks: React.FC<{theme: Theme}> = ({theme}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: "hidden", mixBlendMode: "screen"}}>
      {Array.from({length: 11}).map((_, index) => {
        const width = 130 + seeded(index + 231) * 520;
        const xBase = seeded(index + 241) * (WIDTH + width) - width;
        const speed = 1.1 + seeded(index + 251) * 2.4;
        const x = ((xBase + frame * speed) % (WIDTH + width * 1.8)) - width;
        const y = 45 + seeded(index + 261) * 990;
        const flash = Math.pow(Math.max(0, Math.sin(frame * 0.031 + index * 2.37)), 8);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width,
              height: index % 3 === 0 ? 4 : 2,
              background: `linear-gradient(90deg, transparent, ${rgba(theme.bright, 0.16 + flash * 0.2)}, transparent)`,
              boxShadow: `0 0 15px ${rgba(theme.accent, 0.16 + flash * 0.18)}`,
              opacity: 0.54,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ProgressSystem: React.FC<{theme: Theme; progress: number; dim?: number}> = ({
  theme,
  progress,
  dim = 1,
}) => {
  const frame = useCurrentFrame();
  const completed = progress >= 100;
  const dots = ".".repeat(((Math.floor(frame / 25) % 3) + 1));
  const pulse = 0.78 + 0.22 * Math.sin(frame * 0.067) ** 2;
  const fillWidth = Math.max(0, Math.min(100, progress));

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 45,
          left: 0,
          right: 0,
          textAlign: "center",
          color: theme.core,
          fontFamily: 'Inter, Arial, Helvetica, sans-serif',
          fontSize: 34,
          lineHeight: 1,
          fontWeight: 650,
          letterSpacing: 1.8,
          opacity: dim,
          textShadow: `0 0 5px ${theme.core}, 0 0 14px ${theme.accent}, 0 0 34px ${rgba(theme.accent, 0.68)}`,
        }}
      >
        SYSTEM UPDATE{dots}
      </div>

      <div
        style={{
          position: "absolute",
          left: 101,
          top: 126,
          width: 670,
          height: 45,
          padding: 5,
          border: `2px solid ${theme.core}`,
          background: "rgba(0,0,0,0.68)",
          boxShadow: `0 0 5px ${theme.core}, inset 0 0 12px ${rgba(theme.accent, 0.38)}, 0 0 16px ${rgba(theme.accent, 0.65)}`,
          opacity: dim,
          overflow: "hidden",
        }}
      >
        {fillWidth > 0 && (
          <div
            style={{
              height: "100%",
              width: `${fillWidth}%`,
              position: "relative",
              background: `linear-gradient(90deg, ${theme.deep} 0%, ${theme.accent} 30%, ${theme.bright} 76%, ${theme.core} 100%)`,
              boxShadow: `0 0 5px ${theme.core}, 0 0 14px ${theme.accent}, 0 0 34px ${rgba(theme.accent, 0.82)}, inset 0 0 11px ${theme.core}`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(100deg, transparent 0%, ${rgba(theme.core, 0.86)} 47%, transparent 58%)`,
                transform: `translateX(${((frame * 8.2) % 420) - 210}px)`,
                opacity: 0.65,
              }}
            />
            {!completed && (
              <div
                style={{
                  position: "absolute",
                  right: -4,
                  top: -5,
                  width: 11,
                  height: 42,
                  backgroundColor: theme.core,
                  boxShadow: `0 0 7px ${theme.core}, 0 0 20px ${theme.accent}, 0 0 42px ${theme.accent}`,
                  opacity: pulse,
                }}
              />
            )}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 197,
          left: 0,
          right: 0,
          textAlign: "center",
          color: theme.core,
          fontFamily: 'Inter, Arial, Helvetica, sans-serif',
          fontSize: 29,
          fontWeight: 800,
          letterSpacing: 1.4,
          lineHeight: 1,
          opacity: dim,
          textShadow: `0 0 5px ${theme.core}, 0 0 13px ${theme.accent}, 0 0 30px ${rgba(theme.accent, 0.74)}`,
        }}
      >
        {Math.floor(progress)}%
      </div>
    </>
  );
};

const UpdateHud: React.FC<{theme: Theme; progress: number; opacity?: number}> = ({
  theme,
  progress,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const breath = 0.77 + 0.23 * Math.sin(frame * 0.038 + 0.4) ** 2;

  return (
    <div
      style={{
        position: "absolute",
        left: PANEL.x,
        top: PANEL.y,
        width: PANEL.width,
        height: PANEL.height,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -42,
          background: `radial-gradient(ellipse at center, ${rgba(theme.accent, 0.17 * breath)} 0%, ${rgba(theme.accent, 0.055)} 45%, transparent 72%)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${rgba(theme.accent, 0.035)}, ${theme.glass})`,
          border: `3px solid ${theme.core}`,
          boxShadow: `0 0 5px ${theme.core}, 0 0 15px ${theme.accent}, 0 0 42px ${rgba(theme.accent, 0.74 * breath)}, inset 0 0 34px ${rgba(theme.accent, 0.15)}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 3,
          right: 3,
          top: 3,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.core}, transparent)`,
          opacity: 0.78,
        }}
      />
      <ProgressSystem theme={theme} progress={progress} />
    </div>
  );
};

const GlitchSlices: React.FC<{
  glitch: NonNullable<ReturnType<typeof activeGlitch>>;
  progress: number;
}> = ({glitch, progress}) => {
  const frame = useCurrentFrame();
  const {event, phase, strength} = glitch;
  const slices = [
    {top: 325, height: 34, direction: -1, gain: 0.42},
    {top: 359, height: 27, direction: 1, gain: 0.78},
    {top: 386, height: 31, direction: -1, gain: 0.94},
    {top: 417, height: 39, direction: 1, gain: 0.68},
    {top: 456, height: 30, direction: -1, gain: 1},
    {top: 486, height: 48, direction: 1, gain: 0.88},
    {top: 534, height: 36, direction: -1, gain: 0.71},
    {top: 570, height: 43, direction: 1, gain: 0.96},
    {top: 613, height: 35, direction: -1, gain: 0.63},
    {top: 648, height: 38, direction: 1, gain: 0.48},
  ];
  const chatter = Math.sin(frame * 5.13) >= 0 ? 1 : -1;

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {slices.map((slice, index) => {
        const offset =
          slice.direction *
          chatter *
          strength *
          slice.gain *
          (22 + seeded(index + event.start) * 76);
        const useIncoming = index % 3 !== 0 || phase > 0.55;
        const sliceTheme = useIncoming ? event.to : event.from;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `inset(${slice.top}px 0 ${HEIGHT - slice.top - slice.height}px 0)`,
              transform: `translateX(${offset}px)`,
              opacity: 0.46 + strength * 0.54,
              filter: index % 4 === 0 ? `blur(${0.6 + strength * 1.4}px)` : undefined,
              mixBlendMode: "screen",
            }}
          >
            <UpdateHud theme={sliceTheme} progress={progress} />
          </div>
        );
      })}

      {Array.from({length: 18}).map((_, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        const lane = index % 9;
        const x = PANEL.x - 68 + seeded(index + event.start * 2) * (PANEL.width + 136);
        const y = PANEL.y - 35 + lane * 38 + seeded(index + 31) * 13;
        const dashWidth = 14 + seeded(index + 44) * 116;
        const theme = index % 4 === 0 ? event.from : event.to;
        const shift = direction * strength * (18 + seeded(index + 62) * 92);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x + shift,
              top: y,
              width: dashWidth,
              height: index % 5 === 0 ? 5 : 3,
              background: theme.core,
              boxShadow: `0 0 5px ${theme.core}, 0 0 13px ${theme.accent}`,
              opacity: Math.min(1, strength * (0.55 + seeded(index + 72) * 0.65)),
            }}
          />
        );
      })}

      {Array.from({length: 5}).map((_, index) => {
        const y = PANEL.y + 22 + index * 49 + seeded(index + event.start) * 15;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: PANEL.x - 40 - strength * (30 + index * 7),
              top: y,
              width: PANEL.width + 80 + strength * (64 + index * 9),
              height: 5 + (index % 2) * 4,
              background: `linear-gradient(90deg, transparent 0%, ${rgba(event.to.accent, 0.78)} 17%, ${event.to.core} 49%, ${rgba(event.from.accent, 0.72)} 80%, transparent 100%)`,
              filter: `blur(${1 + index * 0.45}px)`,
              opacity: strength * (0.18 + seeded(index + 5) * 0.42),
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ScanFinish: React.FC<{theme: Theme}> = ({theme}) => {
  const frame = useCurrentFrame();
  const scanY = ((frame * 3.05) % (HEIGHT + 260)) - 130;
  const opacity = 0.2 + 0.13 * Math.sin(frame * 0.027 + 0.7) ** 2;
  return (
    <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 110,
          background: `linear-gradient(180deg, transparent, ${rgba(theme.accent, 0.06)}, transparent)`,
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px, transparent 2px, transparent 5px)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 52% 50%, transparent 24%, rgba(0,0,0,0.27) 65%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = themeForFrame(frame);
  const glitch = activeGlitch(frame);
  const progress = interpolate(frame, [0, COMPLETE_FRAME], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const glitchStrength = glitch?.strength ?? 0;
  const panelOpacity = 1 - glitchStrength * 0.27;
  const globalFlash = glitchStrength * (0.08 + 0.08 * Math.abs(Math.sin(frame * 2.31)));

  return (
    <AbsoluteFill
      style={{
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: "#010504",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at 52% 50%, ${theme.fog} 0%, transparent 48%),
            linear-gradient(112deg, #010302 0%, ${rgba(theme.deep, 0.2)} 52%, #010304 100%)
          `,
        }}
      />
      <MatrixCodeField theme={theme} />
      <AtmosphericStreaks theme={theme} />

      <div
        style={{
          position: "absolute",
          left: 790,
          top: -40,
          width: 340,
          height: 1160,
          background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.56), transparent)",
          filter: "blur(26px)",
        }}
      />

      <UpdateHud theme={theme} progress={progress} opacity={panelOpacity} />
      {glitch && <GlitchSlices glitch={glitch} progress={progress} />}

      {glitch && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${rgba(glitch.event.to.accent, globalFlash)} 43%, transparent 62%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
      <ScanFinish theme={theme} />
    </AbsoluteFill>
  );
};
