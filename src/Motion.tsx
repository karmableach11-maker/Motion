import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Lane = "top" | "bottom" | "left" | "right";

type Palette = {
  background: string;
  primary: string;
  secondary: string;
  glow: string;
};

type WordSlot = {
  lane: Lane;
  x: number;
  y: number;
  size: number;
  width: number;
  align: "left" | "center" | "right";
  rotation?: number;
  opacity: number;
};

const LOOP_FRAMES = 540;
const PHASE_FRAMES = 60;
const CENTER_SAFE = {
  left: 430,
  top: 330,
  width: 1060,
  height: 420,
};

const WORDS = [
  "MACHINE",
  "ROBOT",
  "DEEP LEARNING",
  "INFORMATION",
  "COMPUTER",
  "NEURAL NETWORKS",
  "BRAIN",
  "DIGITAL",
  "CYBER",
  "INTELLIGENCE",
] as const;

const PALETTES: readonly Palette[] = [
  {background: "#03070a", primary: "#f1f6f8", secondary: "#7b8790", glow: "#c8f4ff"},
  {background: "#00150c", primary: "#b9ff72", secondary: "#28b96d", glow: "#62ffae"},
  {background: "#210014", primary: "#ff83c1", secondary: "#9c2b67", glow: "#ff4ca6"},
  {background: "#03070a", primary: "#f5f7f8", secondary: "#737c84", glow: "#d9f5ff"},
  {background: "#00142b", primary: "#75d3ff", secondary: "#1676b7", glow: "#28aaff"},
  {background: "#240013", primary: "#ff73bb", secondary: "#a32464", glow: "#ff3f9d"},
  {background: "#211b00", primary: "#ffea52", secondary: "#a98f16", glow: "#ffe21d"},
  {background: "#200013", primary: "#ff58a9", secondary: "#9b1959", glow: "#ff2c8c"},
  {background: "#00160b", primary: "#8dff6f", secondary: "#21a957", glow: "#54ff93"},
] as const;

// All secondary words live in four clipped rails. None of these rectangles can
// enter CENTER_SAFE, including while entering or exiting the frame.
const SLOTS: readonly WordSlot[] = [
  {lane: "top", x: 58, y: 52, size: 70, width: 540, align: "left", opacity: 0.72},
  {lane: "top", x: 670, y: 190, size: 38, width: 520, align: "center", opacity: 0.52},
  {lane: "top", x: 1350, y: 74, size: 58, width: 510, align: "right", opacity: 0.66},
  {lane: "bottom", x: 62, y: 822, size: 48, width: 530, align: "left", opacity: 0.54},
  {lane: "bottom", x: 645, y: 938, size: 68, width: 650, align: "center", opacity: 0.72},
  {lane: "bottom", x: 1390, y: 824, size: 42, width: 470, align: "right", opacity: 0.5},
  {lane: "left", x: 118, y: 366, size: 48, width: 270, align: "left", opacity: 0.66},
  {lane: "left", x: 118, y: 638, size: 36, width: 270, align: "left", opacity: 0.46},
  {lane: "left", x: 54, y: 350, size: 40, width: 350, align: "left", rotation: 90, opacity: 0.56},
  {lane: "right", x: 1534, y: 366, size: 44, width: 260, align: "right", opacity: 0.58},
  {lane: "right", x: 1536, y: 642, size: 38, width: 258, align: "right", opacity: 0.48},
  {lane: "right", x: 1870, y: 350, size: 40, width: 350, align: "left", rotation: 90, opacity: 0.54},
] as const;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const phaseWord = (slotIndex: number, phase: number) =>
  WORDS[(slotIndex + phase * 3) % WORDS.length];

const laneEntry = (lane: Lane, amount: number) => {
  if (lane === "top") return `translateY(${-amount}px)`;
  if (lane === "bottom") return `translateY(${amount}px)`;
  if (lane === "left") return `translateX(${-amount}px)`;
  return `translateX(${amount}px)`;
};

const BackgroundTexture: React.FC<{
  phase: number;
  localFrame: number;
  palette: Palette;
}> = ({phase, localFrame, palette}) => {
  const scan = (localFrame * 14 + phase * 97) % 1080;
  const gridOpacity = phase === 6 ? 0.22 : 0.09;
  const ringScale = 0.86 + 0.08 * Math.sin((localFrame / PHASE_FRAMES) * Math.PI * 2);

  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${palette.secondary}55 1px, transparent 1px), linear-gradient(90deg, ${palette.secondary}55 1px, transparent 1px)`,
          backgroundSize: phase === 6 ? "96px 96px" : "160px 160px",
          opacity: gridOpacity,
          transform: `perspective(900px) rotateX(${phase === 7 ? 9 : 0}deg) scale(1.08)`,
        }}
      />

      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: 960 - (390 + index * 190),
            top: 540 - (390 + index * 190),
            width: (390 + index * 190) * 2,
            height: (390 + index * 190) * 2,
            border: `1px solid ${palette.secondary}`,
            borderRadius: "50%",
            opacity: phase === 8 ? 0.16 - index * 0.03 : 0.035,
            transform: `scale(${ringScale + index * 0.015})`,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: scan,
          width: "100%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${palette.glow}, transparent)`,
          boxShadow: `0 0 22px ${palette.glow}`,
          opacity: phase === 4 || phase === 8 ? 0.28 : 0.1,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 5px)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

const PeripheralWords: React.FC<{
  phase: number;
  localFrame: number;
  palette: Palette;
}> = ({phase, localFrame, palette}) => {
  const phaseIn = interpolate(localFrame, [2, 13], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const phaseOut = interpolate(localFrame, [47, 57], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{overflow: "hidden", zIndex: 2}}>
      {SLOTS.map((slot, index) => {
        const word = phaseWord(index, phase);
        const fittedSize = Math.min(slot.size, (slot.width - 12) / (word.length * 0.6));
        const delayedFrame = Math.max(0, localFrame - ((index * 3) % 12));
        const entrance = spring({
          frame: delayedFrame,
          fps: 60,
          durationInFrames: 22,
          config: {damping: 18, mass: 0.72, stiffness: 150},
        });
        const drift = Math.sin((localFrame + index * 13 + phase * 17) * 0.075) * 5;
        const entryAmount = (1 - entrance) * 82;
        const exitAmount = phaseOut * 42;
        const laneShift = laneEntry(slot.lane, entryAmount + exitAmount);
        const rotation = slot.rotation ?? ((index + phase) % 3 - 1) * 1.2;
        const scale = phase === 8 ? 0.96 + entrance * 0.04 : 1;

        return (
          <div
            key={`${phase}-${index}`}
            style={{
              position: "absolute",
              left: slot.x,
              top: slot.y,
              width: slot.width,
              color: index % 3 === 0 ? palette.primary : palette.secondary,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: index % 3 === 0 ? 700 : 500,
              fontSize: fittedSize,
              lineHeight: 1,
              letterSpacing: index % 2 === 0 ? 1.5 : 3,
              textAlign: slot.align,
              whiteSpace: "nowrap",
              overflow: "hidden",
              opacity: phaseIn * (1 - phaseOut) * slot.opacity,
              textShadow: `0 0 10px ${palette.glow}26`,
              transformOrigin: "left top",
              transform: `${laneShift} translate(${slot.lane === "top" || slot.lane === "bottom" ? drift : 0}px, ${slot.lane === "left" || slot.lane === "right" ? drift : 0}px) rotate(${rotation}deg) scale(${scale})`,
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const HeroWords: React.FC<{
  palette: Palette;
  localFrame: number;
  phase: number;
  ghost?: "cyan" | "magenta";
  clipTop?: number;
  clipBottom?: number;
}> = ({palette, localFrame, phase, ghost, clipTop = 0, clipBottom = 0}) => {
  const boundaryDistance = Math.min(localFrame, PHASE_FRAMES - localFrame);
  const glitch = interpolate(boundaryDistance, [0, 3], [1, 0], clamp);
  const ghostShift = ghost === "cyan" ? -6 : ghost === "magenta" ? 6 : 0;
  const ghostColor = ghost === "cyan" ? "#39ddff" : "#ff3d9f";

  return (
    <div
      style={{
        position: "absolute",
        left: CENTER_SAFE.left,
        top: CENTER_SAFE.top,
        width: CENTER_SAFE.width,
        height: CENTER_SAFE.height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        overflow: "hidden",
        clipPath: `inset(${clipTop}% 0 ${clipBottom}% 0)`,
        color: ghost ? ghostColor : palette.primary,
        opacity: ghost ? glitch * 0.16 : 1,
        transform: `translateX(${ghostShift * glitch}px)`,
        zIndex: ghost ? 5 : 6,
      }}
    >
      <div
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 128,
          fontWeight: 800,
          lineHeight: 0.98,
          letterSpacing: 8,
          whiteSpace: "nowrap",
          textShadow: ghost ? "none" : `0 0 18px ${palette.glow}26`,
        }}
      >
        ARTIFICIAL
      </div>
      <div
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 116,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: 6,
          whiteSpace: "nowrap",
          textShadow: ghost ? "none" : `0 0 18px ${palette.glow}26`,
        }}
      >
        INTELLIGENCE
      </div>
      {!ghost && (
        <div
          style={{
            position: "absolute",
            left: 118,
            right: 118,
            bottom: 58,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
            opacity: 0.58 + Math.sin((localFrame + phase * 11) * 0.1) * 0.12,
          }}
        />
      )}
    </div>
  );
};

const TransitionSlices: React.FC<{
  localFrame: number;
  palette: Palette;
  phase: number;
}> = ({localFrame, palette, phase}) => {
  const boundaryDistance = Math.min(localFrame, PHASE_FRAMES - localFrame);
  const strength = interpolate(boundaryDistance, [0, 5], [1, 0], clamp);

  if (strength <= 0) return null;

  return (
    <AbsoluteFill style={{zIndex: 10, pointerEvents: "none", overflow: "hidden"}}>
      {Array.from({length: 7}).map((_, index) => {
        const top = 112 + index * 136 + ((phase * 29 + index * 17) % 44);
        const width = 440 + ((phase * 137 + index * 211) % 980);
        const left = ((phase * 191 + index * 277) % 1540) - 80;
        const height = 2 + ((index + phase) % 3) * 2;
        const direction = index % 2 === 0 ? 1 : -1;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              background: index % 2 === 0 ? palette.primary : palette.glow,
              boxShadow: `0 0 12px ${palette.glow}`,
              opacity: strength * (0.18 + index * 0.025),
              transform: `translateX(${direction * strength * (18 + index * 6)}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const loopFrame = ((frame % LOOP_FRAMES) + LOOP_FRAMES) % LOOP_FRAMES;
  const phase = Math.floor(loopFrame / PHASE_FRAMES);
  const localFrame = loopFrame % PHASE_FRAMES;
  const palette = PALETTES[phase];
  const slowPush = interpolate(localFrame, [0, PHASE_FRAMES], [1.015, 1.035], clamp);
  const pulse = 0.72 + 0.05 * Math.sin((frame / fps) * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.background,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -30,
          transform: `scale(${slowPush})`,
          transformOrigin: "center",
        }}
      >
        <BackgroundTexture phase={phase} localFrame={localFrame} palette={palette} />
        <PeripheralWords phase={phase} localFrame={localFrame} palette={palette} />
      </div>

      <div
        style={{
          position: "absolute",
          left: CENTER_SAFE.left - 145,
          top: CENTER_SAFE.top - 90,
          width: CENTER_SAFE.width + 290,
          height: CENTER_SAFE.height + 180,
          background: `radial-gradient(ellipse at center, ${palette.background} 0%, ${palette.background}f0 46%, ${palette.background}70 70%, transparent 82%)`,
          opacity: pulse,
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      <HeroWords palette={palette} localFrame={localFrame} phase={phase} />
      <HeroWords
        palette={palette}
        localFrame={localFrame}
        phase={phase}
        ghost="cyan"
        clipTop={12}
        clipBottom={72}
      />
      <HeroWords
        palette={palette}
        localFrame={localFrame}
        phase={phase}
        ghost="magenta"
        clipTop={67}
        clipBottom={13}
      />

      <TransitionSlices localFrame={localFrame} palette={palette} phase={phase} />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.18) 68%, rgba(0,0,0,0.74) 100%)",
          zIndex: 12,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
