import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const fract = (value: number) => value - Math.floor(value);

const seeded = (index: number, salt = 0) =>
  fract(Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const TOKENS = [
  "101",
  "742",
  "197",
  "011",
  "NET",
  "7F",
  "128",
  "0101",
  "AI",
  "64",
  "ML",
  "∞",
];

const lanes = Array.from({length: 22}, (_, index) => ({
  y: -120 + index * 67,
  width: 0.7 + seeded(index, 1) * 2.2,
  opacity: 0.09 + seeded(index, 2) * 0.28,
  speed: 2.4 + seeded(index, 3) * 7.6,
  dash: 70 + seeded(index, 4) * 330,
  gap: 55 + seeded(index, 5) * 180,
  phase: seeded(index, 6) * 900,
  color: index % 5 === 0 ? "#ef2477" : index % 3 === 0 ? "#8b5cff" : "#58b9ff",
}));

const particles = Array.from({length: 118}, (_, index) => ({
  x: seeded(index, 11) * 2300 - 190,
  y: seeded(index, 12) * 1350 - 135,
  radius: 0.8 + seeded(index, 13) * 3.6,
  opacity: 0.15 + seeded(index, 14) * 0.68,
  depth: 0.25 + seeded(index, 15) * 1.2,
  phase: seeded(index, 16) * Math.PI * 2,
}));

const glyphs = Array.from({length: 54}, (_, index) => ({
  x: seeded(index, 21) * 2260 - 170,
  y: seeded(index, 22) * 1240 - 80,
  size: 14 + seeded(index, 23) * 34,
  opacity: 0.16 + seeded(index, 24) * 0.55,
  speed: 0.18 + seeded(index, 25) * 0.72,
  phase: seeded(index, 26) * Math.PI * 2,
  token: TOKENS[Math.floor(seeded(index, 27) * TOKENS.length)],
}));

const boxes = Array.from({length: 44}, (_, index) => ({
  x: seeded(index, 31) * 2280 - 180,
  y: seeded(index, 32) * 1280 - 100,
  size: 7 + seeded(index, 33) * 20,
  opacity: 0.22 + seeded(index, 34) * 0.62,
  speed: 0.35 + seeded(index, 35) * 1.25,
  phase: seeded(index, 36) * Math.PI * 2,
  nested: seeded(index, 37) > 0.62,
}));

const hexagons = Array.from({length: 21}, (_, index) => ({
  x: seeded(index, 41) * 2240 - 160,
  y: seeded(index, 42) * 1260 - 90,
  radius: 17 + seeded(index, 43) * 52,
  opacity: 0.08 + seeded(index, 44) * 0.26,
  speed: 0.08 + seeded(index, 45) * 0.22,
  phase: seeded(index, 46) * Math.PI * 2,
}));

const circuitSegments = Array.from({length: 18}, (_, index) => ({
  x: seeded(index, 51) * 1900 - 100,
  y: seeded(index, 52) * 1120 - 20,
  length: 90 + seeded(index, 53) * 320,
  step: 16 + seeded(index, 54) * 45,
  opacity: 0.05 + seeded(index, 55) * 0.16,
}));

const hexPoints = (x: number, y: number, radius: number, rotation: number) =>
  Array.from({length: 6}, (_, index) => {
    const angle = rotation + (Math.PI * 2 * index) / 6;
    return `${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`;
  }).join(" ");

const SubtitleSlices: React.FC<{
  frame: number;
  fps: number;
  reveal: number;
}> = ({frame, fps, reveal}) => {
  const sliceCount = 8;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 104,
        marginTop: 22,
      }}
    >
      {Array.from({length: sliceCount}, (_, index) => {
        const localReveal = interpolate(
          frame,
          [fps * 0.94 + index * 1.25, fps * 1.36 + index * 1.1],
          [0, 1],
          {
            ...clamp,
            easing: Easing.bezier(0.16, 0.84, 0.22, 1),
          },
        );
        const top = (index / sliceCount) * 100;
        const bottom = 100 - ((index + 1) / sliceCount) * 100;
        const direction = index % 2 === 0 ? -1 : 1;
        const burst = Math.sin(frame * (0.72 + index * 0.09) + index * 1.7);
        const offset = direction * (1 - localReveal) * (190 + index * 19) + burst * (1 - reveal) * 11;

        return (
          <React.Fragment key={index}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                clipPath: `inset(${top}% 0 ${bottom}% 0)`,
                transform: `translateX(${offset + 15}px)`,
                opacity: (1 - reveal) * 0.68,
                color: "#f01862",
                fontSize: 80,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -1.7,
                whiteSpace: "nowrap",
                textShadow: "0 0 22px rgba(255, 18, 104, 0.86)",
              }}
            >
              (ARTIFICIAL INTELLIGENCE)
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                clipPath: `inset(${top}% 0 ${bottom}% 0)`,
                transform: `translateX(${offset}px)`,
                opacity: localReveal,
                color: "#fbfbff",
                fontSize: 80,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -1.7,
                whiteSpace: "nowrap",
                textShadow:
                  "0 3px 0 rgba(72, 26, 108, 0.42), 0 0 24px rgba(255, 255, 255, 0.18)",
              }}
            >
              (ARTIFICIAL INTELLIGENCE)
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();

  const designScale = Math.max(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const cycle = frame / Math.max(1, durationInFrames);
  const backgroundIn = interpolate(frame, [fps * 0.12, fps * 0.78], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const reveal = interpolate(frame, [fps * 0.86, fps * 1.48], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.15, 0.88, 0.22, 1),
  });
  const titleSpring = spring({
    frame: frame - fps * 0.83,
    fps,
    config: {damping: 15, stiffness: 125, mass: 0.7},
    durationInFrames: Math.round(fps * 0.9),
  });
  const titleScale = interpolate(titleSpring, [0, 1], [1.23, 1], clamp);
  const titleY = interpolate(titleSpring, [0, 1], [46, 0], clamp);
  const fieldX = Math.sin(cycle * Math.PI * 2) * 22;
  const fieldY = Math.cos(cycle * Math.PI * 2) * 11;
  const cameraScale = 1.025 + cycle * 0.035 + Math.sin(frame / (fps * 1.9)) * 0.004;
  const energy = 0.78 + Math.sin(frame / (fps * 0.43)) * 0.12;
  const glitchWindow = interpolate(
    frame,
    [fps * 0.86, fps * 1.02, fps * 1.34, fps * 1.52],
    [0, 1, 0.42, 0],
    clamp,
  );
  const titleJitter = glitchWindow * Math.sin(frame * 2.87) * 8;
  const titlePulse = 1 + Math.sin(frame / (fps * 0.82)) * 0.006 * reveal;
  const glowPulse = 0.84 + Math.sin(frame / (fps * 0.31)) * 0.1;

  const rootTransform = `translate(${width / 2}px, ${height / 2}px) scale(${designScale}) translate(${-DESIGN_WIDTH / 2}px, ${-DESIGN_HEIGHT / 2}px)`;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#03021f",
        fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transformOrigin: "0 0",
          transform: rootTransform,
        }}
      >
        <svg
          width={DESIGN_WIDTH}
          height={DESIGN_HEIGHT}
          viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
          style={{position: "absolute", inset: 0}}
        >
          <defs>
            <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#02011d" />
              <stop offset="0.38" stopColor="#0b0649" />
              <stop offset="0.72" stopColor="#11105b" />
              <stop offset="1" stopColor="#030225" />
            </linearGradient>
            <radialGradient id="magentaHaze">
              <stop offset="0" stopColor="#e01967" stopOpacity="0.55" />
              <stop offset="0.34" stopColor="#8e176d" stopOpacity="0.26" />
              <stop offset="1" stopColor="#25074e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blueHaze">
              <stop offset="0" stopColor="#344eff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#15115e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4a42ff" stopOpacity="0" />
              <stop offset="0.28" stopColor="#5f83ff" stopOpacity="0.75" />
              <stop offset="0.52" stopColor="#ff277f" stopOpacity="0.95" />
              <stop offset="0.76" stopColor="#88c9ff" stopOpacity="0.58" />
              <stop offset="1" stopColor="#5328df" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#6721ff" stopOpacity="0" />
              <stop offset="0.38" stopColor="#ed1e6d" stopOpacity="0.18" />
              <stop offset="0.5" stopColor="#ff2b74" stopOpacity="0.72" />
              <stop offset="0.62" stopColor="#7d3aff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#2514a2" stopOpacity="0" />
            </linearGradient>
            <pattern id="microGrid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#92b9ff" strokeWidth="0.65" opacity="0.2" />
              <circle cx="0" cy="0" r="1.5" fill="#9cd8ff" opacity="0.42" />
            </pattern>
            <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="bloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <filter id="grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="17" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.07" />
              </feComponentTransfer>
            </filter>
          </defs>

          <rect width={DESIGN_WIDTH} height={DESIGN_HEIGHT} fill="url(#background)" />
          <ellipse
            cx={1050 + Math.sin(frame / (fps * 3.1)) * 55}
            cy={600 + Math.cos(frame / (fps * 2.7)) * 24}
            rx="800"
            ry="570"
            fill="url(#magentaHaze)"
            opacity={backgroundIn * glowPulse}
          />
          <ellipse
            cx={390 + Math.cos(frame / (fps * 2.4)) * 45}
            cy={310 + Math.sin(frame / (fps * 2.8)) * 32}
            rx="670"
            ry="480"
            fill="url(#blueHaze)"
            opacity={backgroundIn * 0.92}
          />

          <g
            opacity={backgroundIn}
            transform={`translate(${fieldX} ${fieldY}) rotate(-10.8 960 540) scale(${cameraScale})`}
            style={{transformOrigin: "960px 540px"}}
          >
            <rect x="-240" y="-180" width="2400" height="1440" fill="url(#microGrid)" opacity="0.12" />

            <rect x="-360" y="230" width="2680" height="118" fill="url(#beam)" opacity={0.13 + energy * 0.06} />
            <rect x="-360" y="710" width="2680" height="82" fill="url(#beam)" opacity={0.12 + energy * 0.05} />
            <rect x="-360" y="470" width="2680" height="210" fill="url(#heroBeam)" opacity={0.22 + reveal * 0.2} />

            {lanes.map((lane, index) => (
              <line
                key={`lane-${index}`}
                x1="-340"
                x2="2300"
                y1={lane.y}
                y2={lane.y}
                stroke={lane.color}
                strokeWidth={lane.width}
                strokeOpacity={lane.opacity * energy}
                strokeDasharray={`${lane.dash} ${lane.gap}`}
                strokeDashoffset={-frame * lane.speed - lane.phase}
                filter={index % 7 === 0 ? "url(#softGlow)" : undefined}
              />
            ))}

            {circuitSegments.map((segment, index) => {
              const pulse = 0.65 + Math.sin(frame / 19 + index * 0.8) * 0.35;
              return (
                <path
                  key={`circuit-${index}`}
                  d={`M ${segment.x} ${segment.y} h ${segment.length * 0.35} l ${segment.step} ${segment.step} h ${segment.length * 0.65}`}
                  fill="none"
                  stroke={index % 4 === 0 ? "#ff4f9a" : "#72b8ff"}
                  strokeWidth="1.2"
                  strokeOpacity={segment.opacity * pulse}
                  strokeDasharray="9 11"
                  strokeDashoffset={-frame * (0.65 + index * 0.025)}
                />
              );
            })}

            {glyphs.map((glyph, index) => {
              const x = ((glyph.x + frame * glyph.speed + 220) % 2380) - 220;
              const y = glyph.y + Math.sin(frame * 0.018 + glyph.phase) * 10;
              const flicker = 0.68 + Math.sin(frame * 0.11 + glyph.phase) * 0.32;
              return (
                <text
                  key={`glyph-${index}`}
                  x={x}
                  y={y}
                  fill={index % 6 === 0 ? "#ff77b4" : "#b5d8ff"}
                  fillOpacity={glyph.opacity * flicker}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
                  fontSize={glyph.size}
                  fontWeight={index % 5 === 0 ? 700 : 400}
                >
                  {glyph.token}
                </text>
              );
            })}

            {hexagons.map((hexagon, index) => {
              const x = ((hexagon.x + frame * hexagon.speed + 180) % 2300) - 180;
              const y = hexagon.y + Math.cos(frame * 0.012 + hexagon.phase) * 13;
              return (
                <polygon
                  key={`hex-${index}`}
                  points={hexPoints(x, y, hexagon.radius, frame * 0.0015 * (index % 2 === 0 ? 1 : -1))}
                  fill="none"
                  stroke={index % 4 === 0 ? "#f157a4" : "#739dff"}
                  strokeWidth={1 + (index % 3) * 0.35}
                  strokeOpacity={hexagon.opacity * (0.76 + Math.sin(frame * 0.045 + index) * 0.24)}
                />
              );
            })}

            {boxes.map((box, index) => {
              const x = ((box.x + frame * box.speed + 190) % 2380) - 190;
              const y = box.y + Math.sin(frame * 0.024 + box.phase) * 12;
              const flicker = 0.66 + Math.sin(frame * 0.17 + box.phase) * 0.34;
              return (
                <g key={`box-${index}`} opacity={box.opacity * flicker}>
                  <rect
                    x={x - box.size / 2}
                    y={y - box.size / 2}
                    width={box.size}
                    height={box.size}
                    fill={index % 8 === 0 ? "#ff5da7" : "none"}
                    stroke={index % 8 === 0 ? "#ff7bb8" : "#b5ddff"}
                    strokeWidth={1.4}
                  />
                  {box.nested ? (
                    <rect
                      x={x - box.size * 0.18}
                      y={y - box.size * 0.18}
                      width={box.size * 0.36}
                      height={box.size * 0.36}
                      fill="#dff2ff"
                    />
                  ) : null}
                </g>
              );
            })}

            {particles.map((particle, index) => {
              const x = ((particle.x + frame * particle.depth * 0.42 + 190) % 2380) - 190;
              const y = particle.y + Math.sin(frame * 0.025 * particle.depth + particle.phase) * 8;
              const twinkle = 0.55 + Math.sin(frame * 0.12 + particle.phase) * 0.45;
              return (
                <circle
                  key={`particle-${index}`}
                  cx={x}
                  cy={y}
                  r={particle.radius}
                  fill={index % 9 === 0 ? "#ff7eb9" : "#c8e4ff"}
                  fillOpacity={particle.opacity * twinkle}
                />
              );
            })}
          </g>

          <ellipse
            cx="960"
            cy="585"
            rx={320 + reveal * 150}
            ry={145 + reveal * 42}
            fill="#f21b65"
            opacity={reveal * 0.19 * glowPulse}
            filter="url(#bloom)"
            transform="rotate(-10.8 960 585)"
          />
          <rect width={DESIGN_WIDTH} height={DESIGN_HEIGHT} filter="url(#grain)" opacity="0.75" />
        </svg>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "53%",
            width: 1540,
            height: 470,
            transform: `translate(-50%, -50%) rotate(-10.8deg) translate(${titleJitter}px, ${titleY}px) scale(${titleScale * titlePulse})`,
            transformOrigin: "50% 50%",
            opacity: reveal,
            filter: `blur(${(1 - reveal) * 7}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 205,
              width: 1290,
              height: 5,
              transform: `translateX(-50%) scaleX(${reveal})`,
              transformOrigin: "50% 50%",
              background:
                "linear-gradient(90deg, transparent 0%, #6e5cff 16%, #ff2a76 48%, #78bdff 82%, transparent 100%)",
              boxShadow: "0 0 26px rgba(247, 37, 116, 0.72)",
              opacity: 0.72,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 5,
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 17,
              color: "#abd8ff",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 6,
              whiteSpace: "nowrap",
              opacity: interpolate(reveal, [0.45, 1], [0, 0.82], clamp),
            }}
          >
            <span style={{width: 74, height: 1, background: "#f04b9a"}} />
            NEURAL SYSTEM // MACHINE LEARNING
            <span style={{width: 74, height: 1, background: "#6fbfff"}} />
          </div>

          <div
            style={{
              position: "absolute",
              top: 50,
              left: "50%",
              height: 190,
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              color: "#fcfbff",
              fontSize: 258,
              lineHeight: 0.75,
              fontWeight: 900,
              letterSpacing: -28,
              textShadow:
                "15px 9px 0 rgba(232, 21, 91, 0.62), -4px -2px 0 rgba(84, 137, 255, 0.22), 0 0 46px rgba(255,255,255,0.12)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateX(${interpolate(reveal, [0, 1], [-105, 0], clamp)}px) rotate(${interpolate(
                  reveal,
                  [0, 1],
                  [-8, 0],
                  clamp,
                )}deg)`,
              }}
            >
              A
            </span>
            <span
              style={{
                display: "inline-block",
                transform: `translateX(${interpolate(reveal, [0, 1], [112, 0], clamp)}px) rotate(${interpolate(
                  reveal,
                  [0, 1],
                  [7, 0],
                  clamp,
                )}deg)`,
              }}
            >
              I
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 202,
              width: 1420,
              transform: "translateX(-50%)",
            }}
          >
            <SubtitleSlices frame={frame} fps={fps} reveal={reveal} />
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 356,
              width: 880,
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "rgba(196, 223, 255, 0.76)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 4.2,
              opacity: interpolate(reveal, [0.72, 1], [0, 1], clamp),
            }}
          >
            <span>DEEP LEARNING</span>
            <span style={{width: 7, height: 7, border: "1px solid #ff5c9f", transform: "rotate(45deg)"}} />
            <span>AUTOMATION</span>
            <span style={{width: 7, height: 7, border: "1px solid #68baff", transform: "rotate(45deg)"}} />
            <span>DATA NETWORK</span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 86,
              top: 257,
              width: 58,
              height: 15,
              background: "#ec236d",
              boxShadow: "0 0 16px rgba(236,35,109,0.68)",
              transform: `scaleX(${reveal})`,
              transformOrigin: "right center",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 86,
              top: 304,
              width: 58,
              height: 5,
              background: "#72c4ff",
              boxShadow: "0 0 15px rgba(114,196,255,0.65)",
              transform: `scaleX(${reveal})`,
              transformOrigin: "left center",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow:
              "inset 0 0 170px 54px rgba(1, 1, 23, 0.88), inset 0 0 45px 8px rgba(2, 2, 28, 0.82)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(3,2,31,0.26) 0%, transparent 18%, transparent 82%, rgba(3,2,31,0.38) 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
