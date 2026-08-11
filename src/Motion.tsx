import React, {useLayoutEffect, useRef} from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const FPS = 60;
const DURATION_SECONDS = 15;
const REFERENCE_EMISSION_END = 6.58;
const ACTIVE_SOURCE_END = DURATION_SECONDS;
const PARTICLES_PER_SECOND = 5000 / REFERENCE_EMISSION_END;
const TAU = Math.PI * 2;
const CENTER_X = DESIGN_WIDTH / 2;
const CENTER_Y = 535;
const PARTICLE_COUNT = Math.ceil(PARTICLES_PER_SECOND * DURATION_SECONDS);

type Point = {
  x: number;
  y: number;
};

type LateEnvelope = {
  xOffset: number;
  xScale: number;
  yOffset: number;
  yScale: number;
  left: number;
  right: number;
  top: number;
};

type ParticleKind = "dust" | "orb" | "glint" | "star";

type Particle = {
  persistent: boolean;
  birth: number;
  lifetime: number;
  x: number;
  y: number;
  tangentX: number;
  tangentY: number;
  radialX: number;
  radialY: number;
  scatterTangent: number;
  scatterRadial: number;
  tangentSpeed: number;
  radialSpeed: number;
  windX: number;
  downSpeed: number;
  residualFall: number;
  delayedFall: number;
  gravity: number;
  flutter: number;
  flutterRate: number;
  phase: number;
  flickerRate: number;
  size: number;
  baseAlpha: number;
  rotation: number;
  spin: number;
  color: number;
  kind: ParticleKind;
  depth: number;
};

const COLORS = [
  "rgb(255, 250, 220)",
  "rgb(255, 234, 160)",
  "rgb(255, 207, 92)",
  "rgb(244, 170, 54)",
  "rgb(211, 126, 33)",
] as const;

const RADIUS_TIMES = [
  0, 0.2, 0.4, 0.8, 1.0, 1.4, 1.6, 1.8, 2.0, 2.6, 3.2, 3.8,
  4.0, 4.2, 4.4, 4.6, 4.8, 5.0, 5.4, 5.8, 6.0, 6.2, 6.4, 6.6,
] as const;

const RADIUS_VALUES = [
  25, 58, 117, 115, 141, 162, 172, 206, 241, 246, 269, 265, 289, 325,
  362, 390, 397, 396, 389, 395, 390, 376, 370, 376,
] as const;

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.max(minimum, Math.min(maximum, value));

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const smoothstep = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

const smootherstep = (value: number) => {
  const progress = clamp(value);
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
};

const endpointVisibilityAt = (displayTime: number) =>
  clamp((DURATION_SECONDS - displayTime) * FPS);

const particleTimelineAt = (displayTime: number) =>
  clamp(displayTime, 0, DURATION_SECONDS);

const interpolateKeyframes = (
  time: number,
  times: readonly number[],
  values: readonly number[],
) => {
  if (time <= times[0]) {
    return values[0];
  }
  for (let index = 1; index < times.length; index += 1) {
    if (time <= times[index]) {
      const progress = smoothstep(
        (time - times[index - 1]) / (times[index] - times[index - 1]),
      );
      return lerp(values[index - 1], values[index], progress);
    }
  }
  return values[values.length - 1];
};

const lateEnvelopeAt = (time: number): LateEnvelope => {
  const times = [8.2, 8.5, 9.0, 9.5, 10] as const;
  return {
    xOffset: interpolateKeyframes(time, times, [0, -48, -20, 0, 0]),
    xScale: interpolateKeyframes(time, times, [1, 1, 1.1, 1, 1]),
    yOffset: interpolateKeyframes(time, times, [0, -65, 67, 0, 0]),
    yScale: interpolateKeyframes(time, times, [1, 1.09, 1.05, 1, 1]),
    left: interpolateKeyframes(time, times, [-80, 120, -80, 90, 500]),
    right: interpolateKeyframes(time, times, [2000, 845, 930, 920, 820]),
    top: interpolateKeyframes(time, times, [-80, -30, 150, 430, 450]),
  };
};

const fract = (value: number) => value - Math.floor(value);

const hash = (index: number, salt: number) =>
  fract(Math.sin(index * 127.1 + salt * 311.7 + 17.17) * 43758.5453123);

const signedHash = (index: number, salt: number) => hash(index, salt) * 2 - 1;

const radiusAt = (time: number) => {
  const target = clamp(time, RADIUS_TIMES[0], RADIUS_TIMES[RADIUS_TIMES.length - 1]);
  for (let index = 1; index < RADIUS_TIMES.length; index += 1) {
    if (target <= RADIUS_TIMES[index]) {
      const startTime = RADIUS_TIMES[index - 1];
      const endTime = RADIUS_TIMES[index];
      const progress = smoothstep((target - startTime) / (endTime - startTime));
      return lerp(RADIUS_VALUES[index - 1], RADIUS_VALUES[index], progress);
    }
  }
  return RADIUS_VALUES[RADIUS_VALUES.length - 1];
};

const angleAt = (time: number) => {
  const target = Math.max(0, time);
  const openingCorrection = -63 * Math.exp(-target / 0.18);
  const middleCorrection =
    -8 *
    smoothstep((target - 0.9) / 0.5) *
    (1 - smoothstep((target - 4.6) / 0.75));
  const endingCorrection = smoothstep((target - 5.65) / 0.95) * 4.5;
  const degrees =
    -44.87 -
    484.02 * Math.sqrt(target) +
    openingCorrection +
    middleCorrection +
    endingCorrection;
  return (degrees * Math.PI) / 180;
};

const emitterAt = (time: number): Point => {
  const angle = angleAt(time);
  const radius = radiusAt(time);
  return {
    x: CENTER_X + Math.cos(angle) * radius,
    y: CENTER_Y + Math.sin(angle) * radius,
  };
};

const directionAt = (time: number) => {
  const before = emitterAt(Math.max(0, time - 0.012));
  const after = emitterAt(Math.min(ACTIVE_SOURCE_END, time + 0.012));
  const distance = Math.hypot(after.x - before.x, after.y - before.y) || 1;
  return {
    x: (after.x - before.x) / distance,
    y: (after.y - before.y) / distance,
  };
};

const makeParticle = (index: number): Particle => {
  const birth = clamp(
    (index + 0.12 + hash(index, 1) * 0.76) / PARTICLES_PER_SECOND,
    0,
    DURATION_SECONDS,
  );
  const origin = emitterAt(birth);
  const tangent = directionAt(birth);
  const radialDistance = Math.hypot(origin.x - CENTER_X, origin.y - CENTER_Y) || 1;
  const radialX = (origin.x - CENTER_X) / radialDistance;
  const radialY = (origin.y - CENTER_Y) / radialDistance;
  const depth = hash(index, 2);
  const kindChance = hash(index, 3);
  const kind: ParticleKind =
    kindChance < 0.76
      ? "dust"
      : kindChance < 0.86
        ? "orb"
        : kindChance < 0.95
          ? "glint"
          : "star";
  const isWideSpark = hash(index, 4) > 0.82;
  const isPersistent =
    birth > 5.35 &&
    birth <= REFERENCE_EMISSION_END &&
    hash(index, 24) > 0.5;
  const fallMode = hash(index, 26);
  const kindSize =
    kind === "dust"
      ? lerp(1.35, 4.8, Math.pow(hash(index, 5), 1.65))
      : kind === "orb"
        ? lerp(2.6, 7.4, hash(index, 5))
        : kind === "glint"
          ? lerp(5.0, 14.0, hash(index, 5))
          : lerp(10.0, 30.0, hash(index, 5));
  const lateLifetimeBoost =
    isPersistent ? smoothstep((birth - 5.25) / 1.05) * 0.48 : 0;
  const earlyLifetimeBoost =
    (1 - smoothstep((birth - 1.0) / 1.4)) * 0.32;
  const persistenceBoost = isPersistent ? lerp(1.2, 2.0, hash(index, 25)) : 0;
  const lifetimeBase =
    lerp(2.66, 3.46, hash(index, 6)) +
    lateLifetimeBoost +
    earlyLifetimeBoost +
    persistenceBoost;

  return {
    persistent: isPersistent,
    birth,
    lifetime: lifetimeBase + (kind === "star" ? 0.22 : 0),
    x: origin.x,
    y: origin.y,
    tangentX: tangent.x,
    tangentY: tangent.y,
    radialX,
    radialY,
    scatterTangent: signedHash(index, 7) * lerp(4, 34, depth),
    scatterRadial: signedHash(index, 8) * lerp(5, 42, depth),
    tangentSpeed:
      signedHash(index, 9) * lerp(3, 22, hash(index, 10)) *
      (isWideSpark ? 1.8 : 1) *
      (isPersistent ? (fallMode < 0.4 ? 0.35 : 0.22) : 1),
    radialSpeed:
      lerp(9, 38, hash(index, 11)) * lerp(0.58, 1.22, depth) *
      (isWideSpark ? 3.4 : 1) *
      (radialX < -0.15 ? 1.72 : radialX > 0.15 ? 0.96 : 1.12) *
      (isPersistent
        ? fallMode < 0.4
          ? isWideSpark
            ? 0.4
            : 0.9
          : isWideSpark
            ? 0.2
            : 0.55
        : 1),
    windX:
      isPersistent
        ? fallMode < 0.4
          ? -8 + signedHash(index, 12) * 2
          : 10 + signedHash(index, 12) * 3
        : signedHash(index, 12) * (isWideSpark ? 25 : 8),
    downSpeed: isPersistent
      ? fallMode < 0.4
        ? lerp(5, 18, hash(index, 23))
        : lerp(55, 88, hash(index, 23))
      : lerp(18, isWideSpark ? 54 : 44, hash(index, 23)),
    residualFall: isPersistent ? (fallMode < 0.4 ? 10 : 78) : 35,
    delayedFall: isPersistent && fallMode < 0.4 ? 120 : 0,
    gravity:
      lerp(7, 27, hash(index, 13)) *
      lerp(0.45, 1.2, depth) *
      (isPersistent ? (fallMode < 0.4 ? 0.45 : 1.65) : 1.15),
    flutter: lerp(0.8, 6.5, hash(index, 14)) * (isWideSpark ? 1.6 : 1),
    flutterRate: lerp(0.7, 2.2, hash(index, 15)),
    phase: hash(index, 16) * TAU,
    flickerRate: lerp(1.4, 5.1, hash(index, 17)),
    size: kindSize * lerp(0.72, 1.18, depth),
    baseAlpha:
      (kind === "dust" ? lerp(0.44, 0.9, hash(index, 18)) : lerp(0.58, 0.98, hash(index, 18))) *
      lerp(0.72, 1, depth) *
      (isPersistent ? 0.85 : 1),
    rotation: hash(index, 19) * TAU,
    spin: signedHash(index, 20) * lerp(0.05, 0.42, hash(index, 21)),
    color:
      hash(index, 22) < 0.12
        ? 0
        : hash(index, 22) < 0.35
          ? 1
          : hash(index, 22) < 0.69
            ? 2
            : hash(index, 22) < 0.91
              ? 3
              : 4,
    kind,
    depth,
  };
};

const PARTICLES = Array.from({length: PARTICLE_COUNT}, (_, index) =>
  makeParticle(index),
).sort((a, b) => a.depth - b.depth);

const particleState = (
  particle: Particle,
  motionTime: number,
  displayTime: number,
  lateEnvelope: LateEnvelope,
) => {
  const age = motionTime - particle.birth;
  if (age < 0 || age > particle.lifetime) {
    return null;
  }
  const visualAge = displayTime - particle.birth;

  const birthFade = smootherstep(age / 0.12);
  const deathWindow = lerp(0.58, 0.98, particle.depth);
  const deathFade = smootherstep((particle.lifetime - age) / deathWindow);
  const oldTrailCull =
    particle.birth < 5.35
      ? 1 - 0.96 * smootherstep((motionTime - 7.05) / 1.15)
      : 1;
  const persistentFade = particle.persistent
    ? 1 -
      0.25 * smootherstep((motionTime - 8.65) / 0.35) -
      0.3 * smootherstep((motionTime - 9.05) / 0.45) -
      0.05 * smootherstep((motionTime - 9.55) / 0.4)
    : 1;
  const wave =
    0.78 +
    0.22 *
      Math.sin((displayTime * particle.flickerRate + particle.phase) * TAU);
  const heroGlint =
    particle.kind === "star"
      ? 0.64 +
        0.36 *
          Math.pow(
            Math.max(
              0,
              Math.sin((displayTime * 0.82 + particle.phase) * TAU),
            ),
            2,
          )
      : 1;
  const flutterOffset =
    (Math.sin(age * particle.flutterRate * TAU + particle.phase) -
      Math.sin(particle.phase)) *
    particle.flutter;
  const tangentTravel = particle.scatterTangent + particle.tangentSpeed * age;
  const radialTravel = particle.scatterRadial + particle.radialSpeed * age;
  const residualAge =
    particle.birth <= REFERENCE_EMISSION_END
      ? Math.max(0, motionTime - 6.55)
      : 0;
  const delayedResidualAge = Math.max(0, residualAge - 1.9);
  const delayedFall =
    particle.delayedFall > 0
      ? particle.delayedFall * Math.min(delayedResidualAge, 0.55) +
        255 * smootherstep((motionTime - 9.05) / 0.35)
      : 0;
  const baseX =
    particle.x +
    particle.tangentX * tangentTravel +
    particle.radialX * radialTravel +
    particle.windX * Math.pow(age, 1.18) -
    particle.radialY * flutterOffset +
    lateEnvelope.xOffset;
  const x = CENTER_X + (baseX - CENTER_X) * lateEnvelope.xScale;
  const baseY =
    particle.y +
    particle.tangentY * tangentTravel +
    particle.radialY * radialTravel +
    particle.radialX * flutterOffset +
    particle.downSpeed * age +
    particle.residualFall * residualAge +
    delayedFall +
    particle.gravity * age * age * 0.5 +
    lateEnvelope.yOffset;
  const y = CENTER_Y + (baseY - CENTER_Y) * lateEnvelope.yScale;
  const edgeFade = 50;
  const lateSpatialFade =
    smootherstep((x - lateEnvelope.left) / edgeFade) *
    smootherstep((lateEnvelope.right - x) / edgeFade) *
    smootherstep((y - lateEnvelope.top) / edgeFade);
  const terminalLift = particle.persistent
    ? 1 + 0.15 * smootherstep((motionTime - 9.7) / 0.3)
    : 1;
  const alpha = clamp(
    particle.baseAlpha *
      birthFade *
      deathFade *
      oldTrailCull *
      persistentFade *
      lateSpatialFade *
      terminalLift *
      wave *
      heroGlint *
      endpointVisibilityAt(displayTime),
  );
  const scale =
    0.82 +
    0.18 * smoothstep(age / 0.22) +
    (particle.kind === "star"
      ? 0.1 * Math.sin(visualAge * 1.7 + particle.phase)
      : 0);

  return {x, y, alpha, scale, age: visualAge};
};

const drawFourPointStar = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
) => {
  const inner = radius * 0.16;
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.beginPath();
  context.moveTo(0, -radius);
  context.lineTo(inner, -inner);
  context.lineTo(radius * 0.72, 0);
  context.lineTo(inner, inner);
  context.lineTo(0, radius);
  context.lineTo(-inner, inner);
  context.lineTo(-radius * 0.72, 0);
  context.lineTo(-inner, -inner);
  context.closePath();
  context.fill();
  context.restore();
};

const drawSixPointStar = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
) => {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.beginPath();
  for (let index = 0; index < 12; index += 1) {
    const pointRadius = index % 2 === 0 ? radius : radius * 0.34;
    const angle = -Math.PI / 2 + (index / 12) * TAU;
    const pointX = Math.cos(angle) * pointRadius;
    const pointY = Math.sin(angle) * pointRadius;
    if (index === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }
  context.closePath();
  context.fill();
  context.restore();
};

const drawBackground = (context: CanvasRenderingContext2D) => {
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  const base = context.createLinearGradient(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  base.addColorStop(0, "rgb(8, 11, 19)");
  base.addColorStop(0.48, "rgb(5, 7, 12)");
  base.addColorStop(1, "rgb(2, 3, 7)");
  context.fillStyle = base;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  const navySheen = context.createRadialGradient(
    1370,
    210,
    0,
    1370,
    210,
    980,
  );
  navySheen.addColorStop(0, "rgba(28, 39, 61, 0.26)");
  navySheen.addColorStop(0.48, "rgba(11, 17, 29, 0.10)");
  navySheen.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = navySheen;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  const warmCenter = context.createRadialGradient(
    CENTER_X,
    CENTER_Y,
    0,
    CENTER_X,
    CENTER_Y,
    760,
  );
  warmCenter.addColorStop(0, "rgba(75, 49, 20, 0.075)");
  warmCenter.addColorStop(0.46, "rgba(38, 25, 12, 0.032)");
  warmCenter.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = warmCenter;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  const vignette = context.createRadialGradient(
    CENTER_X,
    CENTER_Y * 0.96,
    280,
    CENTER_X,
    CENTER_Y * 0.96,
    1130,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.66, "rgba(0, 0, 0, 0.12)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.72)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
};

const drawSubjectAura = (
  context: CanvasRenderingContext2D,
  time: number,
) => {
  const build = smoothstep(time / 1.5);
  const alpha = build * endpointVisibilityAt(time) * 0.055;
  if (alpha <= 0.001) {
    return;
  }
  const aura = context.createRadialGradient(
    CENTER_X,
    CENTER_Y,
    80,
    CENTER_X,
    CENTER_Y,
    650,
  );
  aura.addColorStop(0, `rgba(255, 193, 74, ${alpha})`);
  aura.addColorStop(0.5, `rgba(205, 126, 35, ${alpha * 0.38})`);
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = aura;
  context.fillRect(250, 0, 1420, DESIGN_HEIGHT);
};

const drawParticleField = (
  context: CanvasRenderingContext2D,
  motionTime: number,
  displayTime: number,
) => {
  context.globalCompositeOperation = "screen";
  const lateEnvelope = lateEnvelopeAt(Math.min(motionTime, 8.2));

  for (const particle of PARTICLES) {
    const state = particleState(
      particle,
      motionTime,
      displayTime,
      lateEnvelope,
    );
    if (!state || state.alpha < 0.012) {
      continue;
    }
    if (
      state.x < -40 ||
      state.x > DESIGN_WIDTH + 40 ||
      state.y < -40 ||
      state.y > DESIGN_HEIGHT + 40
    ) {
      continue;
    }

    const radius = particle.size * state.scale;
    context.globalAlpha = state.alpha;
    context.fillStyle = COLORS[particle.color];
    if (particle.kind === "dust") {
      if (radius < 1.45) {
        context.fillRect(state.x - radius, state.y - radius, radius * 2, radius * 2);
      } else {
        context.beginPath();
        context.arc(state.x, state.y, radius, 0, TAU);
        context.fill();
      }
      continue;
    }

    if (particle.kind === "orb") {
      context.beginPath();
      context.arc(state.x, state.y, radius, 0, TAU);
      context.fill();
      context.globalAlpha = state.alpha * 0.72;
      context.fillStyle = "rgb(255, 252, 230)";
      context.beginPath();
      context.arc(
        state.x - radius * 0.2,
        state.y - radius * 0.2,
        Math.max(0.7, radius * 0.36),
        0,
        TAU,
      );
      context.fill();
      continue;
    }

    const rotation = particle.rotation + particle.spin * state.age;
    if (particle.kind === "glint") {
      drawFourPointStar(context, state.x, state.y, radius, rotation);
    } else {
      drawSixPointStar(context, state.x, state.y, radius, rotation);
      context.globalAlpha = state.alpha * 0.9;
      context.fillStyle = "rgb(255, 252, 226)";
      context.beginPath();
      context.arc(state.x, state.y, Math.max(1.2, radius * 0.17), 0, TAU);
      context.fill();
    }
  }
  context.globalAlpha = 1;
};

const drawCometHead = (
  context: CanvasRenderingContext2D,
  motionTime: number,
  displayTime: number,
) => {
  const fade = endpointVisibilityAt(displayTime);
  if (fade <= 0.001) {
    return;
  }
  const head = emitterAt(motionTime);
  const direction = directionAt(motionTime);
  const tailLength = lerp(76, 126, smoothstep(motionTime / 4.6));
  const tailX = head.x - direction.x * tailLength;
  const tailY = head.y - direction.y * tailLength;

  context.globalCompositeOperation = "lighter";
  const wakeGlow = context.createLinearGradient(tailX, tailY, head.x, head.y);
  wakeGlow.addColorStop(0, "rgba(201, 117, 29, 0)");
  wakeGlow.addColorStop(0.46, `rgba(255, 186, 58, ${0.09 * fade})`);
  wakeGlow.addColorStop(1, `rgba(255, 248, 209, ${0.54 * fade})`);
  context.strokeStyle = wakeGlow;
  context.lineCap = "round";
  context.lineWidth = 17;
  context.beginPath();
  context.moveTo(tailX, tailY);
  context.quadraticCurveTo(
    lerp(tailX, head.x, 0.62) - direction.y * 5,
    lerp(tailY, head.y, 0.62) + direction.x * 5,
    head.x,
    head.y,
  );
  context.stroke();

  context.globalAlpha = fade;
  const wakeCore = context.createLinearGradient(tailX, tailY, head.x, head.y);
  wakeCore.addColorStop(0, "rgba(255, 177, 43, 0)");
  wakeCore.addColorStop(0.68, "rgba(255, 215, 104, 0.26)");
  wakeCore.addColorStop(1, "rgba(255, 255, 238, 0.98)");
  context.strokeStyle = wakeCore;
  context.lineWidth = 3.2;
  context.beginPath();
  context.moveTo(tailX, tailY);
  context.lineTo(head.x, head.y);
  context.stroke();

  const halo = context.createRadialGradient(
    head.x,
    head.y,
    0,
    head.x,
    head.y,
    74,
  );
  halo.addColorStop(0, `rgba(255, 255, 237, ${0.86 * fade})`);
  halo.addColorStop(0.1, `rgba(255, 233, 160, ${0.5 * fade})`);
  halo.addColorStop(0.35, `rgba(255, 182, 58, ${0.16 * fade})`);
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = halo;
  context.beginPath();
  context.arc(head.x, head.y, 74, 0, TAU);
  context.fill();

  const horizontalFlare = context.createLinearGradient(
    head.x - 72,
    head.y,
    head.x + 72,
    head.y,
  );
  horizontalFlare.addColorStop(0, "rgba(255, 208, 90, 0)");
  horizontalFlare.addColorStop(0.45, `rgba(255, 226, 147, ${0.2 * fade})`);
  horizontalFlare.addColorStop(0.5, `rgba(255, 255, 240, ${0.94 * fade})`);
  horizontalFlare.addColorStop(0.55, `rgba(255, 226, 147, ${0.2 * fade})`);
  horizontalFlare.addColorStop(1, "rgba(255, 208, 90, 0)");
  context.strokeStyle = horizontalFlare;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(head.x - 72, head.y);
  context.lineTo(head.x + 72, head.y);
  context.stroke();

  const verticalFlare = context.createLinearGradient(
    head.x,
    head.y - 42,
    head.x,
    head.y + 42,
  );
  verticalFlare.addColorStop(0, "rgba(255, 222, 128, 0)");
  verticalFlare.addColorStop(0.5, `rgba(255, 255, 237, ${0.66 * fade})`);
  verticalFlare.addColorStop(1, "rgba(255, 222, 128, 0)");
  context.strokeStyle = verticalFlare;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(head.x, head.y - 42);
  context.lineTo(head.x, head.y + 42);
  context.stroke();

  context.globalAlpha = fade;
  context.fillStyle = "rgb(255, 255, 239)";
  context.beginPath();
  context.arc(head.x, head.y, 8.5, 0, TAU);
  context.fill();
  context.globalAlpha = 1;
};

const drawFinishingVignette = (context: CanvasRenderingContext2D) => {
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  const edge = context.createRadialGradient(
    CENTER_X,
    CENTER_Y,
    470,
    CENTER_X,
    CENTER_Y,
    1180,
  );
  edge.addColorStop(0, "rgba(0, 0, 0, 0)");
  edge.addColorStop(0.76, "rgba(0, 0, 0, 0.08)");
  edge.addColorStop(1, "rgba(0, 0, 0, 0.46)");
  context.fillStyle = edge;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  const topSheen = context.createLinearGradient(0, 0, 0, 190);
  topSheen.addColorStop(0, "rgba(91, 108, 142, 0.045)");
  topSheen.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = topSheen;
  context.fillRect(0, 0, DESIGN_WIDTH, 190);
};

const renderScene = (
  context: CanvasRenderingContext2D,
  frame: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const scaleX = canvasWidth / DESIGN_WIDTH;
  const scaleY = canvasHeight / DESIGN_HEIGHT;
  context.save();
  context.scale(scaleX, scaleY);

  const displayTime = frame / FPS;
  const particleTime = particleTimelineAt(displayTime);
  drawBackground(context);
  drawSubjectAura(context, displayTime);
  drawParticleField(context, particleTime, displayTime);
  drawCometHead(context, particleTime, displayTime);
  drawFinishingVignette(context);

  context.restore();
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d", {alpha: false});
    if (!context) {
      return;
    }
    renderScene(context, frame, width, height);
  }, [frame, width, height]);

  return (
    <AbsoluteFill style={{backgroundColor: "rgb(2, 3, 7)"}}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{width: "100%", height: "100%", display: "block"}}
      />
    </AbsoluteFill>
  );
};
