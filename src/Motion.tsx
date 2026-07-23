import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const CENTER_X = DESIGN_WIDTH / 2;
const CENTER_Y = DESIGN_HEIGHT / 2;
const TAU = Math.PI * 2;

const fract = (value: number) => value - Math.floor(value);

const seeded = (index: number, salt = 0) =>
  fract(Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453123);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (from: number, to: number, value: number) => {
  const normalized = clamp01((value - from) / Math.max(0.00001, to - from));
  return normalized * normalized * (3 - 2 * normalized);
};

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const circlePath = (x: number, y: number, radius: number) => {
  const safeRadius = Math.max(0.12, radius);
  const diameter = safeRadius * 2;
  return `M ${x.toFixed(2)} ${y.toFixed(2)} m ${(-safeRadius).toFixed(
    2,
  )} 0 a ${safeRadius.toFixed(2)} ${safeRadius.toFixed(
    2,
  )} 0 1 0 ${diameter.toFixed(2)} 0 a ${safeRadius.toFixed(
    2,
  )} ${safeRadius.toFixed(2)} 0 1 0 ${(-diameter).toFixed(2)} 0`;
};

type NetworkNode = {
  x: number;
  y: number;
  radius: number;
  radial: number;
  depth: number;
  phase: number;
  ring: number;
};

type NetworkEdge = {
  from: number;
  to: number;
  radial: number;
  phase: number;
  accent: boolean;
};

const RING_COUNTS = [12, 16, 20, 24, 28];
const RING_RADII = [250, 385, 535, 705, 900];
const RING_OFFSETS: number[] = [];
const NETWORK_NODES: NetworkNode[] = [];

let nodeOffset = 0;
for (let ring = 0; ring < RING_COUNTS.length; ring++) {
  RING_OFFSETS.push(nodeOffset);
  const count = RING_COUNTS[ring];

  for (let position = 0; position < count; position++) {
    const index = nodeOffset + position;
    const angle =
      (position / count) * TAU +
      ring * 0.173 +
      (seeded(index, 3) - 0.5) * 0.18;
    const radius = RING_RADII[ring] * (0.93 + seeded(index, 4) * 0.14);
    const depth = 0.35 + ((Math.sin(angle) + 1) / 2) * 0.5 + seeded(index, 5) * 0.15;

    NETWORK_NODES.push({
      x: CENTER_X + Math.cos(angle) * radius + (seeded(index, 6) - 0.5) * 38,
      y:
        CENTER_Y +
        Math.sin(angle) * radius * 0.63 +
        (seeded(index, 7) - 0.5) * 34,
      radius: 1.6 + seeded(index, 8) * 4.2,
      radial: radius / RING_RADII[RING_RADII.length - 1],
      depth,
      phase: seeded(index, 9) * TAU,
      ring,
    });
  }

  nodeOffset += count;
}

const NETWORK_EDGES: NetworkEdge[] = [];

for (let ring = 0; ring < RING_COUNTS.length; ring++) {
  const count = RING_COUNTS[ring];
  const offset = RING_OFFSETS[ring];

  for (let position = 0; position < count; position++) {
    const from = offset + position;
    const around = offset + ((position + 1) % count);
    NETWORK_EDGES.push({
      from,
      to: around,
      radial: NETWORK_NODES[from].radial,
      phase: seeded(from, 40),
      accent: (from + ring) % 7 === 0,
    });

    if (ring < RING_COUNTS.length - 1) {
      const nextCount = RING_COUNTS[ring + 1];
      const nextOffset = RING_OFFSETS[ring + 1];
      const mapped =
        Math.round(
          (position / count) * nextCount + (seeded(from, 41) - 0.5) * 1.4,
        ) % nextCount;
      const to = nextOffset + (mapped + nextCount) % nextCount;

      NETWORK_EDGES.push({
        from,
        to,
        radial: Math.max(NETWORK_NODES[from].radial, NETWORK_NODES[to].radial),
        phase: seeded(from, 42),
        accent: (from + position) % 5 === 0,
      });

      if (position % 4 === ring % 4) {
        const fork = nextOffset + ((mapped + 2 + nextCount) % nextCount);
        NETWORK_EDGES.push({
          from,
          to: fork,
          radial: Math.max(
            NETWORK_NODES[from].radial,
            NETWORK_NODES[fork].radial,
          ),
          phase: seeded(from, 43),
          accent: false,
        });
      }
    }
  }
}

const NETWORK_BASE_PATH = NETWORK_EDGES.map((edge) => {
  const from = NETWORK_NODES[edge.from];
  const to = NETWORK_NODES[edge.to];
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} L ${to.x.toFixed(
    2,
  )} ${to.y.toFixed(2)}`;
}).join(" ");

const BACKGROUND_STARS = Array.from({length: 190}, (_, index) => ({
  x: seeded(index, 60) * DESIGN_WIDTH,
  y: seeded(index, 61) * DESIGN_HEIGHT,
  radius: 0.45 + seeded(index, 62) * 1.8,
  opacity: 0.12 + seeded(index, 63) * 0.46,
  phase: seeded(index, 64) * TAU,
  cycles: 1 + (index % 3),
  color: index % 13 === 0 ? "#8b6dff" : index % 7 === 0 ? "#35dfff" : "#b9d9ff",
}));

type SphereParticle = {
  sphereX: number;
  sphereY: number;
  sphereZ: number;
  scatterX: number;
  scatterY: number;
  size: number;
  delay: number;
  color: number;
  phase: number;
};

const SPHERE_PARTICLE_COUNT = 1500;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const SPHERE_PARTICLES: SphereParticle[] = Array.from(
  {length: SPHERE_PARTICLE_COUNT},
  (_, index) => {
    const sphereY = 1 - (2 * (index + 0.5)) / SPHERE_PARTICLE_COUNT;
    const ringRadius = Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
    const theta = index * GOLDEN_ANGLE + seeded(index, 72) * 0.24;
    const scatterAngle = seeded(index, 73) * TAU;
    const scatterRadius = 285 + seeded(index, 74) * 690;
    const scatterDepth = 0.48 + seeded(index, 75) * 0.52;

    return {
      sphereX: Math.cos(theta) * ringRadius,
      sphereY,
      sphereZ: Math.sin(theta) * ringRadius,
      scatterX:
        CENTER_X +
        Math.cos(scatterAngle) * scatterRadius +
        (seeded(index, 76) - 0.5) * 110,
      scatterY:
        CENTER_Y +
        Math.sin(scatterAngle) * scatterRadius * 0.58 +
        (seeded(index, 77) - 0.5) * 82,
      size: (0.55 + seeded(index, 78) * 1.75) * scatterDepth,
      delay: seeded(index, 79),
      color: index % 17 === 0 ? 2 : index % 5 === 0 ? 1 : 0,
      phase: seeded(index, 80) * TAU,
    };
  },
);

const CORONA_PARTICLES = Array.from({length: 220}, (_, index) => ({
  angle: seeded(index, 90) * TAU,
  radius: 190 + seeded(index, 91) * 285,
  ellipse: 0.36 + seeded(index, 92) * 0.34,
  size: 0.65 + seeded(index, 93) * 2.35,
  speed: (index % 2 === 0 ? 1 : -1) * (0.35 + seeded(index, 94) * 0.9),
  phase: seeded(index, 95) * TAU,
  color: index % 9 === 0 ? 2 : index % 4 === 0 ? 1 : 0,
}));

const TITLE_SLICES = Array.from({length: 14}, (_, index) => ({
  dx: (seeded(index, 110) - 0.5) * 250,
  dy: (seeded(index, 111) - 0.5) * 90,
  skew: (seeded(index, 112) - 0.5) * 16,
}));

const TITLE_DUST = Array.from({length: 260}, (_, index) => {
  const x = CENTER_X + (seeded(index, 120) - 0.5) * 1160;
  const y = CENTER_Y + (seeded(index, 121) - 0.5) * 112;
  const horizontalDirection = Math.sign(x - CENTER_X || 1);

  return {
    x,
    y,
    dx:
      horizontalDirection * (70 + seeded(index, 122) * 260) +
      (seeded(index, 123) - 0.5) * 100,
    dy: (seeded(index, 124) - 0.5) * 210,
    width: 1.2 + seeded(index, 125) * 8.5,
    height: 0.7 + seeded(index, 126) * 2.1,
    phase: seeded(index, 127) * TAU,
    color: index % 11 === 0 ? 2 : index % 4 === 0 ? 1 : 0,
  };
});

const PULSES = [
  {start: 0.285, duration: 0.22, strength: 0.48},
  {start: 0.43, duration: 0.21, strength: 0.72},
  {start: 0.565, duration: 0.24, strength: 1},
];

const CORE_COLORS = ["#53e7ff", "#5f82ff", "#9c62ff"];
const TITLE_DUST_COLORS = ["#eafcff", "#43e4ff", "#9a6cff"];

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames);
  const loopAngle = t * TAU;

  const designScale = Math.max(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const rootTransform = `translate(${width / 2}px, ${height / 2}px) scale(${designScale}) translate(${-CENTER_X}px, ${-CENTER_Y}px)`;

  const cameraBell = Math.pow(Math.sin(Math.PI * t), 2);
  const orbitEnvelope =
    smoothstep(0.34, 0.5, t) * (1 - smoothstep(0.69, 0.88, t));
  const cameraScale = 1 + cameraBell * 0.112;
  const cameraX = Math.sin((t - 0.36) * TAU) * orbitEnvelope * 24;
  const cameraY = Math.sin((t - 0.42) * TAU * 2) * orbitEnvelope * 9;
  const cameraRoll = Math.sin((t - 0.39) * TAU) * orbitEnvelope * 1.55;
  const sceneTransform = `translate(${cameraX.toFixed(2)} ${cameraY.toFixed(
    2,
  )}) rotate(${cameraRoll.toFixed(3)} ${CENTER_X} ${CENTER_Y}) translate(${CENTER_X} ${CENTER_Y}) scale(${cameraScale.toFixed(
    5,
  )}) translate(${-CENTER_X} ${-CENTER_Y})`;

  const particlePresence =
    smoothstep(0.035, 0.13, t) * (1 - smoothstep(0.91, 0.998, t));
  const coreStrength =
    smoothstep(0.115, 0.34, t) * (1 - smoothstep(0.79, 0.965, t));
  const networkEnergy =
    smoothstep(0.2, 0.59, t) * (1 - smoothstep(0.73, 0.96, t));
  const peakEnergy =
    smoothstep(0.49, 0.61, t) * (1 - smoothstep(0.69, 0.78, t));

  const rotationY = t * TAU * 1.58 + coreStrength * 0.72;
  const rotationX = Math.sin(t * Math.PI) * 0.3 + Math.sin(t * TAU * 1.5) * 0.08;
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);

  const particleBuckets = Array.from({length: 12}, () => [] as string[]);

  SPHERE_PARTICLES.forEach((particle, index) => {
    const inStart = 0.055 + particle.delay * 0.115;
    const inEnd = 0.235 + particle.delay * 0.085;
    const outStart = 0.775 + particle.delay * 0.045;
    const outEnd = 0.93 + particle.delay * 0.055;
    const formation =
      smoothstep(inStart, inEnd, t) * (1 - smoothstep(outStart, outEnd, t));

    const rotatedX = particle.sphereX * cosY + particle.sphereZ * sinY;
    const rotatedZ = -particle.sphereX * sinY + particle.sphereZ * cosY;
    const rotatedY = particle.sphereY * cosX - rotatedZ * sinX;
    const finalZ = particle.sphereY * sinX + rotatedZ * cosX;
    const perspective = 1 / (1.42 - finalZ * 0.29);
    const sphereX = CENTER_X + rotatedX * 305 * perspective;
    const sphereY = CENTER_Y + rotatedY * 305 * perspective;

    const spiral = Math.sin(formation * Math.PI) * (1 - formation);
    const spiralAngle = particle.phase + formation * TAU * (1.2 + particle.delay);
    const x =
      mix(particle.scatterX, sphereX, formation) +
      Math.cos(spiralAngle) * spiral * (38 + particle.delay * 65);
    const y =
      mix(particle.scatterY, sphereY, formation) +
      Math.sin(spiralAngle) * spiral * (24 + particle.delay * 42);

    const twinkle = 0.86 + Math.sin(loopAngle * (1 + (index % 3)) + particle.phase) * 0.14;
    const radius =
      particle.size *
      mix(0.42, 1.14, formation) *
      mix(0.88, 1.2, perspective) *
      twinkle;
    const depthBucket = Math.min(3, Math.max(0, Math.floor(((finalZ + 1) / 2) * 4)));
    const bucket = particle.color * 4 + depthBucket;
    particleBuckets[bucket].push(circlePath(x, y, radius));
  });

  const coronaBuckets = Array.from({length: 3}, () => [] as string[]);
  CORONA_PARTICLES.forEach((particle, index) => {
    const angle =
      particle.angle +
      t * TAU * particle.speed +
      Math.sin(loopAngle + particle.phase) * 0.08;
    const breathe = 1 + Math.sin(loopAngle * (1 + (index % 2)) + particle.phase) * 0.06;
    const x = CENTER_X + Math.cos(angle) * particle.radius * breathe;
    const y =
      CENTER_Y +
      Math.sin(angle) * particle.radius * particle.ellipse * breathe;
    coronaBuckets[particle.color].push(
      circlePath(x, y, particle.size * (0.75 + coreStrength * 0.45)),
    );
  });

  const titleScan = smoothstep(0.392, 0.485, t);
  const titleDissolve = smoothstep(0.7, 0.805, t);
  const titleLife = titleScan * (1 - titleDissolve);
  const titleDustLife =
    smoothstep(0.69, 0.745, t) * (1 - smoothstep(0.825, 0.91, t));
  const titleDustBuckets = Array.from({length: 3}, () => [] as string[]);

  TITLE_DUST.forEach((particle, index) => {
    const progress = titleDissolve;
    const turbulence = Math.sin(progress * Math.PI) * Math.sin(loopAngle * 2 + particle.phase);
    const x = particle.x + particle.dx * progress + turbulence * 14;
    const y = particle.y + particle.dy * progress + turbulence * 9;
    const widthNow = particle.width * (1 + progress * 1.3);
    const heightNow = particle.height * (1 - progress * 0.35);
    titleDustBuckets[particle.color].push(
      `M ${(x - widthNow / 2).toFixed(2)} ${(y - heightNow / 2).toFixed(
        2,
      )} h ${widthNow.toFixed(2)} v ${heightNow.toFixed(
        2,
      )} h ${(-widthNow).toFixed(2)} Z`,
    );
  });

  const scanBeamOpacity =
    Math.sin(Math.PI * titleScan) * (1 - titleDissolve) * 0.9;
  const scanBeamX = mix(CENTER_X - 650, CENTER_X + 650, titleScan);
  const ambientPulse = 0.88 + Math.sin(loopAngle * 2) * 0.12;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#02040b",
        fontFamily: '"Nimbus Sans", "DejaVu Sans", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transformOrigin: "0 0",
          transform: rootTransform,
          overflow: "hidden",
        }}
      >
        <svg
          width={DESIGN_WIDTH}
          height={DESIGN_HEIGHT}
          viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
          style={{position: "absolute", inset: 0}}
        >
          <defs>
            <radialGradient id="deep-space" cx="50%" cy="50%" r="72%">
              <stop offset="0" stopColor="#0a1c35" />
              <stop offset="0.34" stopColor="#061326" />
              <stop offset="0.72" stopColor="#030914" />
              <stop offset="1" stopColor="#010207" />
            </radialGradient>
            <radialGradient id="cyan-nebula" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#2bdfff" stopOpacity="0.23" />
              <stop offset="0.32" stopColor="#356dff" stopOpacity="0.1" />
              <stop offset="0.72" stopColor="#693cff" stopOpacity="0.035" />
              <stop offset="1" stopColor="#060712" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="core-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#f5feff" stopOpacity="0.96" />
              <stop offset="0.08" stopColor="#9ff5ff" stopOpacity="0.88" />
              <stop offset="0.24" stopColor="#35dfff" stopOpacity="0.52" />
              <stop offset="0.52" stopColor="#4e70ff" stopOpacity="0.18" />
              <stop offset="0.76" stopColor="#8b55ff" stopOpacity="0.07" />
              <stop offset="1" stopColor="#8b55ff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="edge-spectrum" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#32dcff" />
              <stop offset="0.52" stopColor="#5681ff" />
              <stop offset="1" stopColor="#9b5dff" />
            </linearGradient>
            <linearGradient id="title-rule" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#41e6ff" stopOpacity="0" />
              <stop offset="0.22" stopColor="#41e6ff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#e9fdff" stopOpacity="1" />
              <stop offset="0.78" stopColor="#8b6cff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#8b6cff" stopOpacity="0" />
            </linearGradient>
            <pattern id="micro-grid" width="72" height="72" patternUnits="userSpaceOnUse">
              <path
                d="M 72 0 L 0 0 0 72"
                fill="none"
                stroke="#6ebeff"
                strokeWidth="0.55"
                opacity="0.2"
              />
              <circle cx="0" cy="0" r="1.1" fill="#70dfff" opacity="0.22" />
            </pattern>
            <filter id="soft-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="wide-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="32" />
            </filter>
          </defs>

          <rect width={DESIGN_WIDTH} height={DESIGN_HEIGHT} fill="url(#deep-space)" />
          <ellipse
            cx={CENTER_X}
            cy={CENTER_Y}
            rx="980"
            ry="610"
            fill="url(#cyan-nebula)"
            opacity={0.58 + coreStrength * 0.42}
          />
          <rect
            x="-80"
            y="-80"
            width="2080"
            height="1240"
            fill="url(#micro-grid)"
            opacity={0.055 + networkEnergy * 0.035}
            transform={`rotate(-3 ${CENTER_X} ${CENTER_Y})`}
          />

          {BACKGROUND_STARS.map((star, index) => {
            const twinkle =
              0.65 + Math.sin(loopAngle * star.cycles + star.phase) * 0.35;
            return (
              <circle
                key={`star-${index}`}
                cx={star.x}
                cy={star.y}
                r={star.radius * (0.88 + twinkle * 0.12)}
                fill={star.color}
                fillOpacity={star.opacity * twinkle}
              />
            );
          })}

          <g transform={sceneTransform}>
            <path
              d={NETWORK_BASE_PATH}
              fill="none"
              stroke="#4a88b9"
              strokeWidth="0.8"
              strokeOpacity={0.08 + networkEnergy * 0.07}
            />

            {NETWORK_EDGES.map((edge, index) => {
              const from = NETWORK_NODES[edge.from];
              const to = NETWORK_NODES[edge.to];
              const activationStart = 0.245 + edge.radial * 0.22;
              const activation =
                smoothstep(activationStart, activationStart + 0.095, t) *
                (1 - smoothstep(0.72 + (1 - edge.radial) * 0.07, 0.95, t));
              const pulseHit = PULSES.reduce((maximum, pulse) => {
                const arrival = pulse.start + edge.radial * pulse.duration * 0.78;
                const distance = (t - arrival) / 0.032;
                return Math.max(maximum, Math.exp(-distance * distance) * pulse.strength);
              }, 0);
              const opacity =
                activation * (edge.accent ? 0.24 : 0.15) +
                pulseHit * (edge.accent ? 0.82 : 0.52);

              return (
                <line
                  key={`edge-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={edge.accent ? "#74efff" : "url(#edge-spectrum)"}
                  strokeWidth={edge.accent ? 1.5 : 1.05}
                  strokeOpacity={opacity}
                  strokeDasharray="2 94"
                  strokeDashoffset={-96 * (3 * t + edge.phase)}
                  filter={pulseHit > 0.45 && edge.accent ? "url(#soft-glow)" : undefined}
                />
              );
            })}

            {NETWORK_NODES.map((node, index) => {
              const activationStart = 0.245 + node.radial * 0.22;
              const activation =
                smoothstep(activationStart, activationStart + 0.09, t) *
                (1 - smoothstep(0.72 + (1 - node.radial) * 0.07, 0.955, t));
              const pulseHit = PULSES.reduce((maximum, pulse) => {
                const arrival = pulse.start + node.radial * pulse.duration * 0.8;
                const distance = (t - arrival) / 0.028;
                return Math.max(maximum, Math.exp(-distance * distance) * pulse.strength);
              }, 0);
              const twinkle =
                0.76 + Math.sin(loopAngle * (1 + (index % 3)) + node.phase) * 0.24;
              const size =
                node.radius *
                mix(0.78, 1.17, node.depth) *
                (1 + pulseHit * 0.95 + activation * 0.18);
              const opacity =
                (0.13 + activation * 0.58 + pulseHit * 0.78) * twinkle;

              return (
                <g key={`node-${index}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size * 3.8}
                    fill="#31dcff"
                    fillOpacity={(activation * 0.05 + pulseHit * 0.18) * twinkle}
                    filter={pulseHit > 0.42 && index % 4 === 0 ? "url(#wide-glow)" : undefined}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill={index % 9 === 0 ? "#a778ff" : index % 5 === 0 ? "#eaffff" : "#54e8ff"}
                    fillOpacity={opacity}
                  />
                  {node.radius > 4.2 ? (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={size * 2.25}
                      fill="none"
                      stroke="#65eaff"
                      strokeWidth="0.7"
                      strokeOpacity={activation * 0.3 + pulseHit * 0.48}
                    />
                  ) : null}
                </g>
              );
            })}

            {PULSES.map((pulse, index) => {
              const progress = (t - pulse.start) / pulse.duration;
              if (progress < 0 || progress > 1) {
                return null;
              }

              const eased = smoothstep(0, 1, progress);
              const opacity = Math.sin(progress * Math.PI) * pulse.strength;
              return (
                <ellipse
                  key={`pulse-${index}`}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  rx={205 + eased * 930}
                  ry={(205 + eased * 930) * 0.63}
                  fill="none"
                  stroke={index === 2 ? "#d6fbff" : index === 1 ? "#6b82ff" : "#37dfff"}
                  strokeWidth={1.4 + pulse.strength * 2.3}
                  strokeOpacity={opacity * 0.52}
                  filter="url(#soft-glow)"
                />
              );
            })}

            <ellipse
              cx={CENTER_X}
              cy={CENTER_Y}
              rx={300 + peakEnergy * 85}
              ry={300 + peakEnergy * 85}
              fill="url(#core-halo)"
              opacity={coreStrength * (0.58 + peakEnergy * 0.28) * ambientPulse}
              filter="url(#wide-glow)"
            />
            <ellipse
              cx={CENTER_X}
              cy={CENTER_Y}
              rx={232 + peakEnergy * 24}
              ry={(232 + peakEnergy * 24) * 0.34}
              fill="none"
              stroke="#54eaff"
              strokeWidth="1.5"
              strokeDasharray="8 18"
              strokeDashoffset={-78 * t}
              strokeOpacity={coreStrength * 0.45}
              transform={`rotate(${(t * 145).toFixed(3)} ${CENTER_X} ${CENTER_Y})`}
              filter="url(#soft-glow)"
            />
            <ellipse
              cx={CENTER_X}
              cy={CENTER_Y}
              rx={218 + peakEnergy * 28}
              ry={(218 + peakEnergy * 28) * 0.47}
              fill="none"
              stroke="#8f6dff"
              strokeWidth="1.05"
              strokeDasharray="3 16"
              strokeDashoffset={72 * t}
              strokeOpacity={coreStrength * 0.38}
              transform={`rotate(${(-58 - t * 110).toFixed(3)} ${CENTER_X} ${CENTER_Y})`}
            />

            {coronaBuckets.map((bucket, index) => (
              <path
                key={`corona-${index}`}
                d={bucket.join(" ")}
                fill={CORE_COLORS[index]}
                fillOpacity={coreStrength * (0.22 + index * 0.06)}
              />
            ))}

            {particleBuckets.map((bucket, index) => {
              const colorIndex = Math.floor(index / 4);
              const depthIndex = index % 4;
              return (
                <path
                  key={`core-particles-${index}`}
                  d={bucket.join(" ")}
                  fill={CORE_COLORS[colorIndex]}
                  fillOpacity={
                    particlePresence *
                    (0.12 + coreStrength * 0.48) *
                    (0.48 + depthIndex * 0.19)
                  }
                />
              );
            })}

            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={34 + peakEnergy * 12}
              fill="#edfeff"
              fillOpacity={coreStrength * (0.5 + peakEnergy * 0.35)}
              filter="url(#soft-glow)"
            />
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={8 + peakEnergy * 4}
              fill="#ffffff"
              fillOpacity={coreStrength * 0.96}
            />
          </g>

          {titleDustBuckets.map((bucket, index) => (
            <path
              key={`title-dust-${index}`}
              d={bucket.join(" ")}
              fill={TITLE_DUST_COLORS[index]}
              fillOpacity={titleDustLife * (0.68 + index * 0.1)}
              filter={index === 1 ? "url(#soft-glow)" : undefined}
            />
          ))}

          <rect
            x={scanBeamX - 2}
            y={CENTER_Y - 93}
            width="4"
            height="186"
            fill="#e8feff"
            opacity={scanBeamOpacity}
            filter="url(#soft-glow)"
          />
          <rect
            x={scanBeamX - 54}
            y={CENTER_Y - 91}
            width="108"
            height="182"
            fill="url(#title-rule)"
            opacity={scanBeamOpacity * 0.13}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            left: CENTER_X,
            top: CENTER_Y,
            width: 1480,
            height: 150,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {TITLE_SLICES.map((slice, index) => {
            const localReveal = smoothstep(
              0.392 + index * 0.0028,
              0.457 + index * 0.0028,
              t,
            );
            const localOut = smoothstep(
              0.7 + index * 0.0022,
              0.786 + index * 0.0012,
              t,
            );
            const top = (index / TITLE_SLICES.length) * 100;
            const bottom = 100 - ((index + 1) / TITLE_SLICES.length) * 100;
            const dissolveKick = Math.sin(Math.PI * localOut);

            return (
              <div
                key={`title-slice-${index}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  clipPath: `inset(${top}% ${100 - localReveal * 100}% ${bottom}% 0)`,
                  transform: `translate(${(slice.dx * localOut).toFixed(2)}px, ${(
                    slice.dy * localOut
                  ).toFixed(2)}px) skewX(${(slice.skew * dissolveKick).toFixed(2)}deg)`,
                  opacity: localReveal * (1 - localOut),
                  filter: `blur(${(localOut * 4.5).toFixed(2)}px)`,
                  color: "#f2fdff",
                  fontSize: 108,
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: 15,
                  whiteSpace: "nowrap",
                  textIndent: 15,
                  textShadow:
                    "-4px 0 0 rgba(49,223,255,0.30), 4px 0 0 rgba(139,92,246,0.24), 0 0 14px rgba(126,236,255,0.48), 0 0 38px rgba(54,126,255,0.24)",
                }}
              >
                NEURAL NETWORK
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            left: CENTER_X,
            top: CENTER_Y - 104,
            transform: `translateX(-50%) translateY(${((1 - titleScan) * 16).toFixed(
              2,
            )}px)`,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: titleLife * 0.88,
            color: "#8eeeff",
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 5.2,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "block",
              width: 92,
              height: 1,
              background: "linear-gradient(90deg, transparent, #43e7ff)",
            }}
          />
          SYNAPTIC ENGINE // CORE ONLINE
          <span
            style={{
              display: "block",
              width: 92,
              height: 1,
              background: "linear-gradient(90deg, #8c69ff, transparent)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: CENTER_X,
            top: CENTER_Y + 94,
            width: 1000,
            height: 2,
            transform: `translateX(-50%) scaleX(${titleLife.toFixed(4)})`,
            transformOrigin: "50% 50%",
            background:
              "linear-gradient(90deg, transparent 0%, #43e7ff 22%, #edfefe 50%, #8c69ff 78%, transparent 100%)",
            opacity: titleLife * 0.75,
            boxShadow: "0 0 18px rgba(56, 222, 255, 0.48)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: CENTER_X,
            top: CENTER_Y + 119,
            width: 780,
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "space-between",
            opacity: titleLife * 0.68,
            color: "#9dc7df",
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 3.2,
          }}
        >
          <span>NODE MATRIX 100%</span>
          <span style={{color: "#48e4ff"}}>●</span>
          <span>PULSE SYNC {Math.round(82 + peakEnergy * 18)}%</span>
          <span style={{color: "#9a73ff"}}>●</span>
          <span>LINK STATE ACTIVE</span>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.16,
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(157,232,255,0.10) 0px, rgba(157,232,255,0.10) 1px, transparent 1px, transparent 4px)",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 50% 50%, transparent 48%, rgba(1,3,10,0.28) 73%, rgba(0,1,5,0.88) 100%)",
            boxShadow:
              "inset 0 0 120px 22px rgba(0,2,10,0.64), inset 0 0 34px rgba(0,0,0,0.55)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
