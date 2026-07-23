import React, {type CSSProperties} from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TAU = Math.PI * 2;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smootherStep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

type Palette = {
  face: string;
  highlight: string;
  shadow: string;
  glow: string;
  accent: string;
};

const PALETTES: readonly Palette[] = [
  {
    face: "#F13A87",
    highlight: "#FF8FC2",
    shadow: "#74163F",
    glow: "rgba(255, 40, 145, 0.66)",
    accent: "#FF5AA5",
  },
  {
    face: "#9BF044",
    highlight: "#D8FF82",
    shadow: "#365F16",
    glow: "rgba(137, 255, 55, 0.56)",
    accent: "#B3FF50",
  },
  {
    face: "#6379F5",
    highlight: "#B8C3FF",
    shadow: "#273379",
    glow: "rgba(80, 103, 255, 0.62)",
    accent: "#6C8BFF",
  },
  {
    face: "#F2F7FF",
    highlight: "#FFFFFF",
    shadow: "#546176",
    glow: "rgba(202, 225, 255, 0.48)",
    accent: "#D9E9FF",
  },
  {
    face: "#FFC928",
    highlight: "#FFF19A",
    shadow: "#87520A",
    glow: "rgba(255, 184, 25, 0.64)",
    accent: "#FFE23D",
  },
  {
    face: "#ED347F",
    highlight: "#FF8AC0",
    shadow: "#73163F",
    glow: "rgba(244, 42, 136, 0.62)",
    accent: "#FF4FA0",
  },
] as const;

const WORD_COLORS = [
  "#6A7EFF",
  "#F03B8A",
  "#93F04A",
  "#EAF4FF",
  "#43DFFF",
  "#FFD33D",
] as const;

type Wave = {
  words: readonly string[];
  palette: number;
  slotRotation: number;
  turn: number;
  grid: number;
};

const WAVES: readonly Wave[] = [
  {
    words: [
      "MACHINE",
      "ROBOT",
      "COMPUTER",
      "DEEP LEARNING",
      "NEURAL NETWORKS",
      "INFORMATION",
      "BRAIN",
      "DIGITAL",
      "CYBER",
    ],
    palette: 0,
    slotRotation: 0,
    turn: -1,
    grid: 0.08,
  },
  {
    words: [
      "ROBOT",
      "DEEP LEARNING",
      "MACHINE",
      "BRAIN",
      "INFORMATION",
      "CYBER",
      "COMPUTER",
      "NEURAL NETWORKS",
      "DIGITAL",
    ],
    palette: 1,
    slotRotation: 2,
    turn: 1,
    grid: 0.12,
  },
  {
    words: [
      "INFORMATION",
      "MACHINE",
      "DIGITAL",
      "ROBOT",
      "CYBER",
      "NEURAL NETWORKS",
      "DEEP LEARNING",
      "BRAIN",
      "COMPUTER",
    ],
    palette: 2,
    slotRotation: 5,
    turn: -1,
    grid: 0.16,
  },
  {
    words: [
      "COMPUTER",
      "NEURAL NETWORKS",
      "BRAIN",
      "DIGITAL",
      "MACHINE",
      "INFORMATION",
      "CYBER",
      "ROBOT",
      "DEEP LEARNING",
    ],
    palette: 3,
    slotRotation: 7,
    turn: 1,
    grid: 0.22,
  },
  {
    words: [
      "MACHINE",
      "INFORMATION",
      "COMPUTER",
      "CYBER",
      "BRAIN",
      "ROBOT",
      "DIGITAL",
      "DEEP LEARNING",
      "NEURAL NETWORKS",
    ],
    palette: 4,
    slotRotation: 4,
    turn: -1,
    grid: 1,
  },
  {
    words: [
      "NEURAL NETWORKS",
      "DIGITAL",
      "ROBOT",
      "INFORMATION",
      "DEEP LEARNING",
      "MACHINE",
      "BRAIN",
      "COMPUTER",
      "CYBER",
    ],
    palette: 5,
    slotRotation: 1,
    turn: 1,
    grid: 0.18,
  },
] as const;

type Slot = {
  x: number;
  y: number;
  width: number;
  rotation: number;
  align: CSSProperties["textAlign"];
  size: number;
  depth: number;
  enterX: number;
  enterY: number;
  opacity: number;
};

const SLOTS: readonly Slot[] = [
  {
    x: 400,
    y: 144,
    width: 670,
    rotation: -4,
    align: "left",
    size: 1.08,
    depth: 0.25,
    enterX: -250,
    enterY: -70,
    opacity: 0.9,
  },
  {
    x: 960,
    y: 112,
    width: 780,
    rotation: 2,
    align: "center",
    size: 0.96,
    depth: -0.2,
    enterX: 50,
    enterY: -210,
    opacity: 0.78,
  },
  {
    x: 1520,
    y: 168,
    width: 690,
    rotation: -5,
    align: "right",
    size: 1.04,
    depth: 0.15,
    enterX: 260,
    enterY: -90,
    opacity: 0.86,
  },
  {
    x: 88,
    y: 535,
    width: 650,
    rotation: -90,
    align: "center",
    size: 0.94,
    depth: -0.1,
    enterX: -220,
    enterY: 40,
    opacity: 0.72,
  },
  {
    x: 1832,
    y: 540,
    width: 650,
    rotation: 90,
    align: "center",
    size: 0.92,
    depth: 0.05,
    enterX: 220,
    enterY: -40,
    opacity: 0.7,
  },
  {
    x: 400,
    y: 846,
    width: 690,
    rotation: 4,
    align: "left",
    size: 1.08,
    depth: 0.3,
    enterX: -250,
    enterY: 110,
    opacity: 0.9,
  },
  {
    x: 960,
    y: 956,
    width: 810,
    rotation: -2,
    align: "center",
    size: 0.95,
    depth: -0.25,
    enterX: -30,
    enterY: 220,
    opacity: 0.76,
  },
  {
    x: 1520,
    y: 852,
    width: 700,
    rotation: -4,
    align: "right",
    size: 1.06,
    depth: 0.2,
    enterX: 250,
    enterY: 120,
    opacity: 0.88,
  },
  {
    x: 960,
    y: 294,
    width: 720,
    rotation: 0,
    align: "center",
    size: 0.82,
    depth: -0.35,
    enterX: 0,
    enterY: -160,
    opacity: 0.68,
  },
] as const;

const keywordSize = (word: string, slot: Slot) => {
  const base = word.length > 15 ? 43 : word.length > 10 ? 50 : 64;
  return Math.round(base * slot.size);
};

const titleShadow = (palette: Palette) => {
  const extrusion = Array.from({length: 12}, (_, index) => {
    const step = index + 1;
    return `${(step * 0.72).toFixed(1)}px ${(step * 1.18).toFixed(1)}px 0 ${palette.shadow}`;
  });

  return [
    `0 -1px 0 ${palette.highlight}`,
    ...extrusion,
    `0 18px 34px ${palette.glow}`,
    `0 34px 66px rgba(0, 0, 0, 0.78)`,
  ].join(", ");
};

const BackgroundAtmosphere: React.FC<{
  phase: number;
  currentPalette: Palette;
  nextPalette: Palette;
  blend: number;
}> = ({phase, currentPalette, nextPalette, blend}) => {
  const driftX = Math.sin(phase * TAU) * 8;
  const driftY = Math.cos(phase * TAU) * 5;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 50%, #0B1830 0%, #050B18 42%, #01040B 100%)",
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 1 - blend,
          transform: `translate3d(${driftX}%, ${driftY}%, 0) scale(1.18)`,
          background: `radial-gradient(circle at 36% 42%, ${currentPalette.glow} 0%, transparent 38%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: blend,
          transform: `translate3d(${-driftY}%, ${driftX * 0.55}%, 0) scale(1.2)`,
          background: `radial-gradient(circle at 65% 56%, ${nextPalette.glow} 0%, transparent 40%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.32,
          backgroundImage:
            "linear-gradient(115deg, transparent 0%, rgba(75, 130, 255, 0.05) 42%, rgba(77, 225, 255, 0.1) 50%, rgba(244, 45, 143, 0.05) 58%, transparent 100%)",
          transform: `translateX(${Math.sin(phase * TAU) * 7}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const GridWorld: React.FC<{
  phase: number;
  intensity: number;
  transitionEnergy: number;
}> = ({phase, intensity, transitionEnergy}) => {
  const gridX = Math.sin(phase * TAU) * 90;
  const gridY = Math.cos(phase * TAU) * 60;
  const pitch = 54 + Math.sin(phase * TAU) * 4 + transitionEnergy * 8;
  const yaw = -7 + Math.sin(phase * TAU * 2) * 1.8;
  const scale = 1.08 + transitionEnergy * 0.12;
  const scanX = 50 + Math.sin(phase * TAU) * 43;

  return (
    <AbsoluteFill
      style={{
        perspective: 1500,
        perspectiveOrigin: "50% 50%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 2850,
          height: 1900,
          transformOrigin: "50% 50%",
          transform: `translate(-50%, -50%) rotateX(${pitch}deg) rotateZ(${yaw}deg) scale(${scale})`,
          backgroundImage:
            "linear-gradient(rgba(55, 223, 255, 0.26) 1px, transparent 1px), linear-gradient(90deg, rgba(55, 223, 255, 0.26) 1px, transparent 1px), linear-gradient(rgba(255, 46, 146, 0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 46, 146, 0.13) 1px, transparent 1px)",
          backgroundSize: "110px 110px, 110px 110px, 550px 550px, 550px 550px",
          backgroundPosition: `${gridX}px ${gridY}px, ${gridX}px ${gridY}px, ${gridX * 0.5}px ${gridY * 0.5}px, ${gridX * 0.5}px ${gridY * 0.5}px`,
          opacity: 0.13 + intensity * 0.24,
          filter: `drop-shadow(0 0 ${10 + intensity * 16}px rgba(50, 218, 255, 0.18))`,
          WebkitMaskImage:
            "radial-gradient(ellipse at center, #000 18%, rgba(0,0,0,.9) 48%, transparent 84%)",
          maskImage:
            "radial-gradient(ellipse at center, #000 18%, rgba(0,0,0,.9) 48%, transparent 84%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${scanX}%`,
          width: 3,
          opacity: intensity * 0.42,
          background:
            "linear-gradient(180deg, transparent, rgba(80, 235, 255, .9), transparent)",
          boxShadow: "0 0 24px rgba(70, 220, 255, .65)",
          transform: "skewX(-11deg)",
        }}
      />
    </AbsoluteFill>
  );
};

const GHOST_TERMS = [
  "MACHINE",
  "ARTIFICIAL INTELLIGENCE",
  "DEEP LEARNING",
  "COMPUTER",
  "ROBOT",
  "INFORMATION",
  "NEURAL NETWORKS",
  "DIGITAL",
  "CYBER",
  "BRAIN",
] as const;

const GhostPlane: React.FC<{
  phase: number;
  transitionEnergy: number;
}> = ({phase, transitionEnergy}) => {
  const turn = -7 + Math.sin(phase * TAU) * 2.2;
  const travel = Math.sin(phase * TAU) * 76;

  return (
    <AbsoluteFill
      style={{
        perspective: 1500,
        overflow: "hidden",
        opacity: 0.58,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 2660,
          height: 1560,
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) translateY(${travel}px) rotateX(${46 + transitionEnergy * 12}deg) rotateZ(${turn}deg) scale(${1.04 + transitionEnergy * 0.16})`,
          WebkitMaskImage:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,.2) 24%, #000 62%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,.2) 24%, #000 62%, transparent 100%)",
        }}
      >
        {Array.from({length: 30}, (_, index) => {
          const column = index % 6;
          const row = Math.floor(index / 6);
          const word = GHOST_TERMS[(index * 3 + row) % GHOST_TERMS.length];
          const color = WORD_COLORS[(index + row * 2) % WORD_COLORS.length];
          const x = 70 + column * 500 + Math.sin(phase * TAU + index) * 24;
          const y = 100 + row * 330 + Math.cos(phase * TAU + index * 0.7) * 18;
          const rotation = ((index % 5) - 2) * 4;

          return (
            <div
              key={`${word}-${index}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                color,
                fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
                fontSize: 22 + (index % 4) * 4,
                fontWeight: 700,
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
                opacity: 0.1 + (index % 3) * 0.025,
                transform: `rotate(${rotation}deg) translateZ(${(index % 4) * -70}px)`,
                textShadow: `0 0 12px ${color}`,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const AmbientStreaks: React.FC<{phase: number}> = ({phase}) => (
  <AbsoluteFill style={{overflow: "hidden", opacity: 0.5}}>
    {Array.from({length: 24}, (_, index) => {
      const angle = -10 + (index % 5) * 2.4;
      const left =
        ((index * 193) % 1900) + Math.sin(phase * TAU + index * 0.72) * 86;
      const top =
        ((index * 127) % 1080) + Math.cos(phase * TAU + index * 0.51) * 38;
      const width = 42 + (index % 6) * 34;
      const color = WORD_COLORS[index % WORD_COLORS.length];

      return (
        <div
          key={index}
          style={{
            position: "absolute",
            left,
            top,
            width,
            height: index % 4 === 0 ? 3 : 2,
            borderRadius: 999,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            opacity: 0.08 + (index % 3) * 0.025,
            transform: `rotate(${angle}deg)`,
            filter: `blur(${index % 4 === 0 ? 0 : 0.6}px)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const KineticWordLayer: React.FC<{
  wave: Wave;
  opacity: number;
  blend: number;
  incoming: boolean;
  phase: number;
  transitionEnergy: number;
}> = ({wave, opacity, blend, incoming, phase, transitionEnergy}) => {
  const transitionOffset = incoming ? 1 - blend : blend;
  const travelDirection = incoming ? -1 : 1;

  return (
    <AbsoluteFill
      style={{
        perspective: 1350,
        transformStyle: "preserve-3d",
        opacity,
      }}
    >
      {wave.words.map((word, index) => {
        const slot = SLOTS[(index + wave.slotRotation) % SLOTS.length];
        const driftX =
          Math.sin(phase * TAU + index * 1.17 + wave.slotRotation) *
          (11 + Math.abs(slot.depth) * 24);
        const driftY =
          Math.cos(phase * TAU + index * 0.83 + wave.slotRotation) *
          (7 + Math.abs(slot.depth) * 18);
        const rush = transitionEnergy * slot.depth * 120 * wave.turn;
        const x =
          slot.x +
          driftX +
          travelDirection * slot.enterX * transitionOffset +
          rush;
        const y =
          slot.y +
          driftY +
          travelDirection * slot.enterY * transitionOffset +
          rush * 0.28;
        const z =
          slot.depth * 220 +
          travelDirection * transitionOffset * 280 +
          transitionEnergy * slot.depth * 180;
        const rotation =
          slot.rotation +
          Math.sin(phase * TAU + index) * 0.9 +
          transitionEnergy * wave.turn * (2 + Math.abs(slot.depth) * 6);
        const scale =
          1 + slot.depth * 0.055 + transitionEnergy * (0.04 + Math.abs(slot.depth) * 0.12);
        const blur = transitionOffset * 11 + transitionEnergy * 1.8;
        const color =
          WORD_COLORS[(index + wave.palette * 2 + wave.slotRotation) % WORD_COLORS.length];

        return (
          <div
            key={`${wave.palette}-${word}-${index}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: slot.width,
              color,
              fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
              fontSize: keywordSize(word, slot),
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "0.075em",
              textAlign: slot.align,
              whiteSpace: "nowrap",
              opacity: slot.opacity,
              transformOrigin: "50% 50%",
              transform: `translate(-50%, -50%) translateZ(${z}px) rotateZ(${rotation}deg) scale(${scale})`,
              filter: `blur(${blur.toFixed(2)}px) drop-shadow(0 0 15px ${color}55)`,
              textShadow: `0 2px 0 rgba(0,0,0,.72), 0 0 18px ${color}44`,
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const TitleLayer: React.FC<{
  palette: Palette;
  opacity: number;
}> = ({palette, opacity}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      color: palette.face,
      WebkitTextStroke: `1.2px ${palette.highlight}`,
      textShadow: titleShadow(palette),
      filter: `drop-shadow(0 0 22px ${palette.glow})`,
    }}
  >
    <div style={{fontSize: 114, lineHeight: 0.86}}>ARTIFICIAL</div>
    <div style={{fontSize: 121, lineHeight: 0.88}}>INTELLIGENCE</div>
  </div>
);

const TransitionEchoes: React.FC<{
  palette: Palette;
  energy: number;
  turn: number;
}> = ({palette, energy, turn}) => {
  if (energy < 0.001) {
    return null;
  }

  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 1280,
            textAlign: "center",
            color: palette.face,
            fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
            fontWeight: 900,
            fontSize: 106,
            lineHeight: 0.88,
            letterSpacing: "0.025em",
            whiteSpace: "nowrap",
            opacity: energy * (0.075 / index),
            filter: `blur(${index * 2.2}px)`,
            transform: `translate(-50%, -50%) rotate(${turn * index * energy * 1.2}deg) scale(${1 + index * energy * 0.075})`,
            textShadow: `0 0 24px ${palette.glow}`,
          }}
        >
          ARTIFICIAL
          <br />
          INTELLIGENCE
        </div>
      ))}
    </AbsoluteFill>
  );
};

const CentralTitle: React.FC<{
  phase: number;
  currentPalette: Palette;
  nextPalette: Palette;
  blend: number;
  transitionEnergy: number;
  turn: number;
}> = ({
  phase,
  currentPalette,
  nextPalette,
  blend,
  transitionEnergy,
  turn,
}) => {
  const breathe = 1 + Math.sin(phase * TAU) * 0.008;
  const scale = breathe + transitionEnergy * 0.045;
  const tilt = -1.4 + Math.sin(phase * TAU) * 0.55 + transitionEnergy * turn * 2.2;
  const pitch = 8 + transitionEnergy * 4;
  const bracketPulse = 0.55 + Math.sin(phase * TAU * 2) * 0.12;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 190,
          top: "50%",
          width: 260,
          height: 2,
          opacity: bracketPulse,
          background:
            "linear-gradient(90deg, transparent, rgba(92,220,255,.75))",
          boxShadow: "0 0 16px rgba(74,216,255,.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 190,
          top: "50%",
          width: 260,
          height: 2,
          opacity: bracketPulse,
          background:
            "linear-gradient(90deg, rgba(92,220,255,.75), transparent)",
          boxShadow: "0 0 16px rgba(74,216,255,.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1280,
          height: 282,
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) perspective(1500px) rotateX(${pitch}deg) rotateZ(${tilt}deg) scale(${scale})`,
          transformOrigin: "50% 50%",
          fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
          fontWeight: 900,
          letterSpacing: "0.025em",
          textAlign: "center",
          whiteSpace: "nowrap",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <TitleLayer palette={currentPalette} opacity={1 - blend} />
        <TitleLayer palette={nextPalette} opacity={blend} />
      </div>
    </>
  );
};

const EdgeLabels: React.FC<{phase: number}> = ({phase}) => {
  const opacity = 0.22 + Math.sin(phase * TAU) * 0.04;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 42,
          bottom: 36,
          color: "#65CFFF",
          opacity,
          fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.24em",
        }}
      >
        MACHINE · DIGITAL · INFORMATION
      </div>
      <div
        style={{
          position: "absolute",
          right: 42,
          top: 36,
          color: "#FF4A9C",
          opacity,
          fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.24em",
          textAlign: "right",
        }}
      >
        NEURAL NETWORKS · DEEP LEARNING
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Duplicating the first visual state on the final frame guarantees a clean loop.
  const normalizedFrame = frame >= durationInFrames - 1 ? 0 : frame;
  const phase = normalizedFrame / Math.max(1, durationInFrames - 1);
  const wavePosition = phase * WAVES.length;
  const wholeWave = Math.floor(wavePosition);
  const localWave = wavePosition - wholeWave;
  const currentIndex = wholeWave % WAVES.length;
  const nextIndex = (currentIndex + 1) % WAVES.length;
  const blend = smootherStep(0.64, 1, localWave);
  const transitionEnergy = Math.sin(blend * Math.PI);
  const currentWave = WAVES[currentIndex];
  const nextWave = WAVES[nextIndex];
  const currentPalette = PALETTES[currentWave.palette];
  const nextPalette = PALETTES[nextWave.palette];
  const gridIntensity =
    currentWave.grid * (1 - blend) + nextWave.grid * blend;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#01040B",
      }}
    >
      <BackgroundAtmosphere
        phase={phase}
        currentPalette={currentPalette}
        nextPalette={nextPalette}
        blend={blend}
      />
      <GridWorld
        phase={phase}
        intensity={gridIntensity}
        transitionEnergy={transitionEnergy}
      />
      <GhostPlane phase={phase} transitionEnergy={transitionEnergy} />
      <AmbientStreaks phase={phase} />

      <KineticWordLayer
        wave={currentWave}
        opacity={1 - blend}
        blend={blend}
        incoming={false}
        phase={phase}
        transitionEnergy={transitionEnergy}
      />
      <KineticWordLayer
        wave={nextWave}
        opacity={blend}
        blend={blend}
        incoming
        phase={phase}
        transitionEnergy={transitionEnergy}
      />

      <TransitionEchoes
        palette={nextPalette}
        energy={transitionEnergy}
        turn={nextWave.turn}
      />
      <CentralTitle
        phase={phase}
        currentPalette={currentPalette}
        nextPalette={nextPalette}
        blend={blend}
        transitionEnergy={transitionEnergy}
        turn={nextWave.turn}
      />
      <EdgeLabels phase={phase} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0, 3, 12, .2) 68%, rgba(0, 2, 9, .76) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          opacity: 0.12,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(115, 190, 255, .08) 4px)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
