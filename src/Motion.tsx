import React, {useLayoutEffect, useRef} from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

const TAU = Math.PI * 2;

type RGB = readonly [number, number, number];

type Rail = {
  x: number;
  phase: number;
  cycles: number;
  trail: number;
  width: number;
  intensity: number;
  depth: number;
  hot: boolean;
  wobble: number;
  wobbleCycles: number;
  anchored: boolean;
};

type Spark = {
  x: number;
  phase: number;
  span: number;
  radius: number;
  intensity: number;
  depth: number;
  flickerCycles: number;
  wobble: number;
  wobbleCycles: number;
  hot: boolean;
  activation?: number;
};

type HazeColumn = {
  x: number;
  width: number;
  height: number;
  opacity: number;
  phase: number;
  cycles: number;
};

const fract = (value: number) => value - Math.floor(value);

const hash = (index: number, salt: number) => {
  return fract(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123);
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;

const mixColor = (a: RGB, b: RGB, amount: number): RGB => [
  Math.round(mix(a[0], b[0], amount)),
  Math.round(mix(a[1], b[1], amount)),
  Math.round(mix(a[2], b[2], amount)),
];

const rgba = (color: RGB, alpha: number) => {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${clamp01(alpha)})`;
};

const VIOLET: RGB = [129, 45, 255];
const ULTRAVIOLET: RGB = [171, 79, 255];
const BLUE: RGB = [34, 112, 255];
const ELECTRIC_BLUE: RGB = [31, 174, 255];
const ICE: RGB = [206, 231, 255];

const colorAt = (x: number, hot = false): RGB => {
  const left = mixColor(VIOLET, ULTRAVIOLET, smoothstep(0.0, 0.44, x));
  const zoned = mixColor(left, BLUE, smoothstep(0.38, 0.70, x));
  const blueLift = mixColor(zoned, ELECTRIC_BLUE, smoothstep(0.62, 1.0, x) * 0.58);
  return hot ? mixColor(blueLift, ICE, 0.68) : blueLift;
};

const rails: Rail[] = Array.from({length: 120}, (_, index) => {
  const depth = hash(index, 1);
  return {
    x: 0.012 + hash(index, 2) * 0.976,
    phase: hash(index, 3),
    cycles: 2 + Math.floor(depth * 4),
    trail: 0.055 + Math.pow(hash(index, 5), 1.35) * 0.31,
    width: 2.0 + depth * 2.9,
    intensity: 0.42 + Math.pow(hash(index, 6), 0.7) * 0.72,
    depth,
    hot: hash(index, 7) > 0.87,
    wobble: (hash(index, 8) - 0.5) * 0.0035,
    wobbleCycles: 1 + Math.floor(hash(index, 9) * 3),
    anchored: hash(index, 10) > 0.57,
  };
});

const sparks: Spark[] = Array.from({length: 50}, (_, index) => {
  const depth = hash(index, 21);
  return {
    x: 0.008 + hash(index, 22) * 0.984,
    phase: hash(index, 23),
    span: 0.96 + depth * 0.42,
    radius: 2.50 + Math.pow(depth, 2.1) * 7.0,
    intensity: 0.36 + hash(index, 24) * 0.64,
    depth,
    flickerCycles: 37 + Math.floor(hash(index, 25) * 61),
    wobble: 0.001 + hash(index, 26) * 0.007,
    wobbleCycles: 1 + Math.floor(hash(index, 27) * 3),
    hot: hash(index, 28) > 0.84,
  };
});

const bokeh: Spark[] = Array.from({length: 14}, (_, index) => {
  const depth = 0.55 + hash(index, 41) * 0.45;
  return {
    x: 0.018 + hash(index, 42) * 0.964,
    phase: hash(index, 43),
    span: 1.12 + depth * 0.24,
    radius: 7.5 + Math.pow(depth, 1.7) * 16,
    intensity: 0.09 + hash(index, 44) * 0.19,
    depth,
    flickerCycles: 3 + Math.floor(hash(index, 45) * 7),
    wobble: 0.004 + hash(index, 46) * 0.012,
    wobbleCycles: 1 + Math.floor(hash(index, 47) * 2),
    hot: hash(index, 48) > 0.68,
  };
});

const makeTransientSparks = (count: number, salt: number): Spark[] => {
  return Array.from({length: count}, (_, index) => {
    const keyedIndex = index + salt * 997;
    const depth = hash(keyedIndex, 81);
    return {
      x: 0.008 + hash(keyedIndex, 82) * 0.984,
      phase: hash(keyedIndex, 83),
      span: 0.96 + depth * 0.42,
      radius: 3.8 + hash(keyedIndex, 90) * 0.45,
      intensity: 0.13 + hash(keyedIndex, 84) * 0.03,
      depth,
      flickerCycles: 0,
      wobble: 0.001 + hash(keyedIndex, 86) * 0.005,
      wobbleCycles: 1 + Math.floor(hash(keyedIndex, 87) * 3),
      hot: hash(keyedIndex, 88) > 0.89,
      activation: hash(keyedIndex, 89),
    };
  });
};

const densityBurstSparks = makeTransientSparks(360, 1);
const lateRenewalSparks = makeTransientSparks(150, 2);

const hazeColumns: HazeColumn[] = Array.from({length: 26}, (_, index) => ({
  x: -0.02 + hash(index, 61) * 1.04,
  width: 0.018 + Math.pow(hash(index, 62), 1.6) * 0.085,
  height: 0.13 + hash(index, 63) * 0.32,
  opacity: 0.035 + hash(index, 64) * 0.10,
  phase: hash(index, 65),
  cycles: 1 + Math.floor(hash(index, 66) * 3),
}));

const drawRadialGlow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: RGB,
  alpha: number,
) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(0.3, rgba(color, alpha * 0.52));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
};

const drawBackdrop = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
) => {
  const vertical = ctx.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, "#02000e");
  vertical.addColorStop(0.32, "#05001d");
  vertical.addColorStop(0.7, "#09002f");
  vertical.addColorStop(1, "#0b0749");
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, width, height);

  const breath = 0.94 + Math.sin(phase * TAU * 2) * 0.035;
  drawRadialGlow(ctx, width * 0.26, height * 0.87, width * 0.53, VIOLET, 0.28 * breath);
  drawRadialGlow(ctx, width * 0.74, height * 0.86, width * 0.55, BLUE, 0.30 * breath);
  drawRadialGlow(ctx, width * 0.56, height * 1.03, width * 0.43, ICE, 0.23 * breath);

  const base = ctx.createLinearGradient(0, height * 0.63, 0, height);
  base.addColorStop(0, "rgba(30, 18, 106, 0)");
  base.addColorStop(0.58, "rgba(86, 58, 255, 0.06)");
  base.addColorStop(0.84, "rgba(77, 132, 255, 0.22)");
  base.addColorStop(1, "rgba(212, 235, 255, 0.61)");
  ctx.fillStyle = base;
  ctx.fillRect(0, height * 0.60, width, height * 0.40);
};

const drawHaze = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const column of hazeColumns) {
    const color = colorAt(column.x);
    const pulse = 0.86 + 0.14 * Math.sin(TAU * (phase * column.cycles + column.phase));
    const columnHeight = column.height * height * pulse;
    const x = column.x * width;
    const columnWidth = column.width * width;
    const top = height - columnHeight;
    const gradient = ctx.createLinearGradient(0, top, 0, height);
    gradient.addColorStop(0, rgba(color, 0));
    gradient.addColorStop(0.52, rgba(color, column.opacity * 0.34));
    gradient.addColorStop(1, rgba(color, column.opacity));
    ctx.fillStyle = gradient;
    ctx.fillRect(x - columnWidth / 2, top, columnWidth, columnHeight);
  }
  ctx.restore();
};

const verticalVisibility = (y: number) => {
  const enter = smoothstep(1.1, 0.92, y);
  const leave = smoothstep(-0.12, 0.06, y);
  return enter * leave;
};

const openingShimmer = (phase: number) => {
  const seconds = phase * 29;
  if (seconds <= 0 || seconds >= 3.2) return 0;
  return Math.sin((Math.PI * seconds) / 3.2) ** 2;
};

const drawRails = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const rail of rails) {
    const travel = fract(rail.phase + phase * rail.cycles);
    const y = 1.12 - travel * 1.24;
    const visibility = verticalVisibility(y);
    if (visibility < 0.002) continue;

    const x = rail.x + Math.sin(TAU * (phase * rail.wobbleCycles + rail.phase)) * rail.wobble;
    const tipX = x * width;
    const tipY = y * height;
    const tailY = rail.anchored
      ? height * (1.005 + hash(Math.round(rail.phase * 10000), 77) * 0.018)
      : Math.min(height * 1.03, tipY + rail.trail * height * (0.74 + rail.depth * 0.42));
    const color = colorAt(x, rail.hot);
    const shimmer = openingShimmer(phase);
    const railFlickerCycles = 47 + Math.floor(rail.phase * 59);
    const railPulse = 1 + shimmer * 0.15 * Math.sin(TAU * (phase * railFlickerCycles + rail.phase * 2.3));
    const alpha = rail.intensity * visibility * railPulse;

    ctx.beginPath();
    ctx.moveTo(tipX, tailY);
    ctx.lineTo(tipX, tipY);
    ctx.lineWidth = rail.width * 4.8;
    ctx.strokeStyle = rgba(color, alpha * 0.055);
    ctx.stroke();

    const line = ctx.createLinearGradient(tipX, tailY, tipX, tipY);
    line.addColorStop(0, rgba(color, 0));
    line.addColorStop(0.48, rgba(color, alpha * 0.22));
    line.addColorStop(0.88, rgba(color, alpha * 0.64));
    line.addColorStop(1, rgba(rail.hot ? ICE : mixColor(color, ICE, 0.45), alpha));
    ctx.beginPath();
    ctx.moveTo(tipX, tailY);
    ctx.lineTo(tipX, tipY);
    ctx.lineWidth = rail.width;
    ctx.strokeStyle = line;
    ctx.stroke();

    const coreRadius = (3.50 + rail.depth * 3.50) * (width / 1920);
    const tipGlowRadius = coreRadius * 5.4;
    const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, tipGlowRadius);
    tipGlow.addColorStop(0, rgba(rail.hot ? ICE : mixColor(color, ICE, 0.62), Math.min(1, alpha * 1.55)));
    tipGlow.addColorStop(0.18, rgba(color, alpha * 0.32));
    tipGlow.addColorStop(0.52, rgba(color, alpha * 0.10));
    tipGlow.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = tipGlow;
    ctx.fillRect(tipX - tipGlowRadius, tipY - tipGlowRadius, tipGlowRadius * 2, tipGlowRadius * 2);
    ctx.beginPath();
    ctx.arc(tipX, tipY, coreRadius * 0.72, 0, TAU);
    ctx.fillStyle = rgba(rail.hot ? ICE : mixColor(color, ICE, 0.62), Math.min(1, alpha * 1.55));
    ctx.fill();
  }

  ctx.restore();
};

const drawSparkLayer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
  particles: Spark[],
  soft: boolean,
  layerOpacity = 1,
) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const particle of particles) {
    const travel = fract(particle.phase + phase);
    const y = 1.08 - travel * particle.span;
    const visibility = verticalVisibility(y);
    if (visibility < 0.002) continue;

    const x = particle.x + Math.sin(TAU * (phase * particle.wobbleCycles + particle.phase)) * particle.wobble;
    const px = x * width;
    const py = y * height;
    const shimmer = openingShimmer(phase);
    const flicker = 1 + shimmer * 0.20 * Math.sin(TAU * (phase * particle.flickerCycles + particle.phase * 3.7));
    const densityGate = particle.activation === undefined
      ? layerOpacity
      : smoothstep(particle.activation, Math.min(1, particle.activation + 0.055), layerOpacity);
    const alpha = particle.intensity * visibility * flicker * densityGate;
    const color = colorAt(x, particle.hot);
    const radius = particle.radius * (width / 1920);

    if (soft) {
      const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
      glow.addColorStop(0, rgba(particle.hot ? ICE : color, alpha * 0.62));
      glow.addColorStop(0.18, rgba(color, alpha * 0.32));
      glow.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
      continue;
    }

    const sparkGlowRadius = radius * 3.7;
    const sparkGlow = ctx.createRadialGradient(px, py, 0, px, py, sparkGlowRadius);
    sparkGlow.addColorStop(0, rgba(particle.hot ? ICE : mixColor(color, ICE, 0.52), Math.min(1, alpha * 1.7)));
    sparkGlow.addColorStop(0.20, rgba(color, alpha * 0.34));
    sparkGlow.addColorStop(0.56, rgba(color, alpha * 0.09));
    sparkGlow.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = sparkGlow;
    ctx.fillRect(px - sparkGlowRadius, py - sparkGlowRadius, sparkGlowRadius * 2, sparkGlowRadius * 2);
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.7, radius * 0.66), 0, TAU);
    ctx.fillStyle = rgba(particle.hot ? ICE : mixColor(color, ICE, 0.52), Math.min(1, alpha * 1.7));
    ctx.fill();
  }

  ctx.restore();
};

const drawHorizon = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const blooms = [
    {x: 0.08, radius: 0.20, color: VIOLET, phase: 0.12},
    {x: 0.28, radius: 0.25, color: ULTRAVIOLET, phase: 0.38},
    {x: 0.56, radius: 0.27, color: ICE, phase: 0.63},
    {x: 0.68, radius: 0.26, color: BLUE, phase: 0.84},
    {x: 0.90, radius: 0.20, color: ELECTRIC_BLUE, phase: 0.22},
  ] as const;

  for (const bloom of blooms) {
    const pulse = 0.91 + 0.09 * Math.sin(TAU * (phase * 2 + bloom.phase));
    drawRadialGlow(
      ctx,
      width * bloom.x,
      height * 1.015,
      width * bloom.radius,
      bloom.color,
      0.34 * pulse,
    );
  }

  const rim = ctx.createLinearGradient(0, height * 0.93, 0, height);
  rim.addColorStop(0, "rgba(139, 112, 255, 0)");
  rim.addColorStop(0.72, "rgba(126, 174, 255, 0.15)");
  rim.addColorStop(1, "rgba(229, 241, 255, 0.72)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, height * 0.92, width, height * 0.08);
  ctx.restore();
};

const drawVignette = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.72,
    width * 0.18,
    width * 0.5,
    height * 0.58,
    width * 0.74,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.72, "rgba(0, 0, 12, 0.08)");
  vignette.addColorStop(1, "rgba(0, 0, 12, 0.58)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const topShade = ctx.createLinearGradient(0, 0, 0, height * 0.40);
  topShade.addColorStop(0, "rgba(0, 0, 8, 0.47)");
  topShade.addColorStop(1, "rgba(0, 0, 8, 0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, width, height * 0.40);
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", {alpha: false});
    if (!ctx) return;

    const phase = frame / durationInFrames;
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawBackdrop(ctx, width, height, phase);
    drawHaze(ctx, width, height, phase);
    const seconds = phase * 29;
    const densityBurst = smoothstep(17.70, 18.70, seconds) * (1 - smoothstep(19.25, 20.60, seconds));
    const lateRenewal = smoothstep(23.60, 25.20, seconds) * (1 - smoothstep(27.10, 29.00, seconds));

    drawSparkLayer(ctx, width, height, phase, bokeh, true);
    drawRails(ctx, width, height, phase);
    drawSparkLayer(ctx, width, height, phase, sparks, false);
    drawSparkLayer(ctx, width, height, phase, densityBurstSparks, false, densityBurst);
    drawSparkLayer(ctx, width, height, phase, lateRenewalSparks, false, lateRenewal * 0.82);
    drawHorizon(ctx, width, height, phase);
    drawVignette(ctx, width, height);
  }, [durationInFrames, frame, height, width]);

  return (
    <AbsoluteFill style={{backgroundColor: "#02000e", overflow: "hidden"}}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{position: "absolute", inset: 0, width: "100%", height: "100%"}}
      />
    </AbsoluteFill>
  );
};
