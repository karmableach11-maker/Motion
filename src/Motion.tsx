import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  random,
} from "remotion";

/**
 * NEON FILE TRANSFER — folder to folder
 * Original, generic, IP-safe motion-graphics loop for microstock.
 * 1920x1080 · 60fps · seamless loop over the full duration.
 * Fully deterministic (frame / fps / seeded random only).
 */

/* ------------------------------------------------------------------ *
 *  Geometry & palette
 * ------------------------------------------------------------------ */

const GOLD: [number, number, number] = [255, 196, 92];
const CYAN: [number, number, number] = [86, 214, 255];
const STEEL: [number, number, number] = [120, 168, 214];

const LEFT = { x: 440, y: 648 };
const RIGHT = { x: 1480, y: 648 };

// Cubic-bezier transfer arc (source mouth -> up over -> destination mouth)
const P0 = { x: LEFT.x + 22, y: LEFT.y - 52 };
const P1 = { x: LEFT.x + 300, y: 252 };
const P2 = { x: RIGHT.x - 300, y: 252 };
const P3 = { x: RIGHT.x - 22, y: RIGHT.y - 52 };
const ARC_D = `M ${P0.x} ${P0.y} C ${P1.x} ${P1.y} ${P2.x} ${P2.y} ${P3.x} ${P3.y}`;

const NUM_DOCS = 5;
const DOC_PERIOD = 180; // frames for one document to cross (loops: total must be a multiple)
const NUM_SPARKS = 30;
const SPARK_PERIOD = 150;
const NUM_AMBIENT = 46;

/* ------------------------------------------------------------------ *
 *  Small math helpers
 * ------------------------------------------------------------------ */

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const frac = (v: number) => v - Math.floor(v);
const circDist = (a: number, b: number) => {
  const d = Math.abs(frac(a) - frac(b));
  return Math.min(d, 1 - d);
};
const rgb = (c: [number, number, number], a = 1) =>
  `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const mixC = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

const bez = (t: number) => {
  const u = 1 - t;
  const x =
    u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x;
  const y =
    u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y;
  return { x, y };
};
const bezAngle = (t: number) => {
  const u = 1 - t;
  const dx =
    3 * u * u * (P1.x - P0.x) + 6 * u * t * (P2.x - P1.x) + 3 * t * t * (P3.x - P2.x);
  const dy =
    3 * u * u * (P1.y - P0.y) + 6 * u * t * (P2.y - P1.y) + 3 * t * t * (P3.y - P2.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/* ------------------------------------------------------------------ *
 *  Neon shape helper — 3 stacked layers: wide halo, mid glow, white core
 * ------------------------------------------------------------------ */

type Layer = {
  stroke: string;
  strokeWidth: number;
  filter?: string;
  opacity: number;
  fill: string;
};

const NeonShape: React.FC<{
  color: [number, number, number];
  coreW: number;
  glowW: number;
  opacity?: number;
  render: (p: Layer) => React.ReactNode;
}> = ({ color, coreW, glowW, opacity = 1, render }) => (
  <g opacity={opacity}>
    {render({ stroke: rgb(color, 0.9), strokeWidth: glowW, filter: "url(#blurBig)", opacity: 0.55, fill: "none" })}
    {render({ stroke: rgb(color, 1), strokeWidth: coreW * 2, filter: "url(#blurSmall)", opacity: 0.85, fill: "none" })}
    {render({ stroke: "rgba(255,255,255,0.96)", strokeWidth: coreW, opacity: 0.96, fill: "none" })}
  </g>
);

/* ------------------------------------------------------------------ *
 *  Folder art
 * ------------------------------------------------------------------ */

// Clean open-folder outline (Lucide "folder-open" geometry, scaled & centered).
// Elegant diagonal tab, forward-tilted tapered front flap. No files inside.
const FOLDER_OPEN =
  "M -72,30 L -54,-4.8 A 24,24 0 0,1 -33.12,-18 L 96,-18 A 24,24 0 0,1 119.28,12 " +
  "L 100.8,84 A 24,24 0 0,1 77.4,102 L -96,102 A 24,24 0 0,1 -120,78 L -120,-78 " +
  "A 24,24 0 0,1 -96,-102 L -49.2,-102 A 24,24 0 0,1 -28.92,-91.2 L -19.2,-76.8 " +
  "A 24,24 0 0,0 0.84,-66 L 72,-66 A 24,24 0 0,1 96,-42 L 96,-18";

const Folder: React.FC<{
  cx: number;
  cy: number;
  color: [number, number, number];
  energy: number;
  breath: number;
  mirror?: boolean;
}> = ({ cx, cy, color, energy, breath, mirror }) => {
  const scale = 1 + 0.012 * breath + 0.018 * energy;
  const sx = (mirror ? -1 : 1) * scale;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* ambient bloom behind the folder, pulses with transfer energy */}
      <circle r={205} fill={rgb(color, 0.14 + 0.34 * energy)} filter="url(#blurHuge)" />
      <g transform={`scale(${sx} ${scale})`}>
        <NeonShape color={color} coreW={2.6} glowW={10} opacity={0.94 + 0.06 * energy}
          render={(p) => <path d={FOLDER_OPEN} strokeLinejoin="round" strokeLinecap="round" {...p} />} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ *
 *  Flying document
 * ------------------------------------------------------------------ */

const DOC_OUTLINE = `
  M -28 -42 Q -32 -42 -32 -38 L -32 38 Q -32 42 -28 42 L 28 42
  Q 32 42 32 38 L 32 -26 L 16 -42 L -28 -42 Z`;
const DOC_FOLD = `M 16 -42 L 16 -26 L 32 -26`;
const DOC_LINES = `
  M -20 -20 L 14 -20  M -20 -8 L 20 -8  M -20 4 L 20 4  M -20 16 L 6 16`;

const FlyingDoc: React.FC<{ t: number }> = ({ t }) => {
  const pos = bez(t);
  const angle = bezAngle(t) * 0.32;
  const lift = Math.sin(Math.PI * t); // 0..1..0
  const scale = (0.8 + 0.28 * lift) * 1.14;
  const fin = interpolate(t, [0, 0.09], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const fout = interpolate(t, [0.9, 1], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
  });
  const op = fin * fout;
  const col = mixC(GOLD, CYAN, interpolate(t, [0.15, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <g transform={`translate(${pos.x} ${pos.y}) rotate(${angle}) scale(${scale})`} opacity={op}>
      {/* soft trailing bloom */}
      <ellipse cx={-10 * lift} cy={0} rx={44} ry={30} fill={rgb(col, 0.14)} filter="url(#blurBig)" />
      {/* page body faint fill */}
      <path d={DOC_OUTLINE} fill={rgb(col, 0.07)} />
      {/* outline + fold */}
      <NeonShape color={col} coreW={1.8} glowW={6}
        render={(p) => <path d={`${DOC_OUTLINE} ${DOC_FOLD}`} strokeLinejoin="round" strokeLinecap="round" {...p} />} />
      {/* text lines */}
      <NeonShape color={col} coreW={1.2} glowW={3.2} opacity={0.92}
        render={(p) => <path d={DOC_LINES} strokeLinecap="round" {...p} />} />
    </g>
  );
};

/* ------------------------------------------------------------------ *
 *  Main composition
 * ------------------------------------------------------------------ */

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // All periodic motion is expressed as an INTEGER number of cycles across the
  // full duration, so the animation loops perfectly for any duration/fps.
  const D = durationInFrames;
  const cyc = (targetPeriod: number) => Math.max(1, Math.round(D / targetPeriod));
  const DOC_C = cyc(DOC_PERIOD);
  const SPARK_C = cyc(SPARK_PERIOD);
  const AMB_DY_C = cyc(300);
  const AMB_DX_C = cyc(420);
  const AMB_TW_C = cyc(180);
  const BREATH_C = cyc(450);
  const tau = Math.PI * 2;

  // document phases (evenly staggered along the arc)
  const phases: number[] = [];
  for (let k = 0; k < NUM_DOCS; k++) phases.push(frac((frame * DOC_C) / D + k / NUM_DOCS));

  // folder pulse energy driven by the stream (emit near p=0, absorb near p=1)
  let emit = 0;
  let absorb = 0;
  const w = 0.06;
  for (const p of phases) {
    emit += Math.exp(-Math.pow(circDist(p, 0.035) / w, 2));
    absorb += Math.exp(-Math.pow(circDist(p, 0.965) / w, 2));
  }
  emit = clamp01(emit);
  absorb = clamp01(absorb);

  const breathL = Math.sin(((frame * BREATH_C) / D) * tau);
  const breathR = Math.sin(((frame * BREATH_C) / D) * tau + Math.PI);

  // dashed guide flow (offset moves an integer number of dash periods over D)
  const dashOffset = -(frame / D) * 18 * 30;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* subtle central atmosphere — keeps the frame reading as black */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 50% 42%, rgba(30,54,86,0.22) 0%, rgba(8,14,26,0.10) 40%, rgba(0,0,0,0) 72%)",
        }}
      />

      {/* ambient depth particles */}
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="blurSmall" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="blurBig" x="-140%" y="-140%" width="380%" height="380%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id="blurHuge" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
        </defs>

        {Array.from({ length: NUM_AMBIENT }).map((_, i) => {
          const bx = random(`ax${i}`) * width;
          const by = 120 + random(`ay${i}`) * (height - 200);
          const dy = 16 * Math.sin(((frame * AMB_DY_C) / D) * tau + i);
          const dx = 12 * Math.sin(((frame * AMB_DX_C) / D) * tau + i * 1.7);
          const tw = 0.06 + 0.14 * (0.5 + 0.5 * Math.sin(((frame * AMB_TW_C) / D) * tau + i * 1.3));
          const r = 0.8 + random(`ar${i}`) * 1.6;
          return <circle key={i} cx={bx + dx} cy={by + dy} r={r} fill={rgb(STEEL, tw)} filter="url(#blurSmall)" />;
        })}
      </svg>

      {/* main neon layer */}
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        {/* guide path — faint solid + animated dashes */}
        <path d={ARC_D} fill="none" stroke={rgb(STEEL, 0.06)} strokeWidth={3} filter="url(#blurSmall)" />
        <path
          d={ARC_D}
          fill="none"
          stroke={rgb(STEEL, 0.5)}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="2 16"
          strokeDashoffset={dashOffset}
          opacity={0.24}
          filter="url(#blurSmall)"
        />

        {/* mouth flares at emit / absorb points */}
        <ellipse cx={P0.x} cy={P0.y} rx={26} ry={14} fill={rgb(GOLD, 0.18 + 0.55 * emit)} filter="url(#blurBig)" />
        <ellipse cx={P3.x} cy={P3.y} rx={26} ry={14} fill={rgb(CYAN, 0.18 + 0.55 * absorb)} filter="url(#blurBig)" />

        {/* folders */}
        <Folder cx={LEFT.x} cy={LEFT.y} color={GOLD} energy={emit} breath={breathL} />
        <Folder cx={RIGHT.x} cy={RIGHT.y} color={CYAN} energy={absorb} breath={breathR} mirror />

        {/* spark particles along the arc */}
        {Array.from({ length: NUM_SPARKS }).map((_, i) => {
          const ph = frac((frame * SPARK_C) / D + i / NUM_SPARKS + random(`sp${i}`) * 0.12);
          const p = bez(ph);
          const a = (bezAngle(ph) * Math.PI) / 180;
          const nrm = a + Math.PI / 2;
          const jitter = (random(`sj${i}`) - 0.5) * 24 * Math.sin(ph * Math.PI);
          const px = p.x + Math.cos(nrm) * jitter;
          const py = p.y + Math.sin(nrm) * jitter;
          const op = Math.pow(Math.sin(Math.PI * ph), 1.4) * (0.45 + 0.5 * random(`so${i}`));
          const size = 1.3 + 2.2 * random(`sr${i}`);
          const col = mixC(GOLD, CYAN, ph);
          return (
            <g key={i} opacity={op}>
              <circle cx={px} cy={py} r={size * 2.4} fill={rgb(col, 0.5)} filter="url(#blurSmall)" />
              <circle cx={px} cy={py} r={size} fill="rgba(255,255,255,0.95)" />
            </g>
          );
        })}

        {/* flying documents (front) */}
        {phases.map((t, i) => (
          <FlyingDoc key={i} t={t} />
        ))}
      </svg>

      {/* fine grain to prevent banding on the dark falloffs */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.05, pointerEvents: "none" }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.5  0 0 0 0 0.7  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* gentle vignette for depth */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 90% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
