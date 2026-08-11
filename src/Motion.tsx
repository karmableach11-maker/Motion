import React, {useLayoutEffect, useRef} from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const TAU = Math.PI * 2;
const CAMERA_DISTANCE = 1850;
const COIN_RADIUS = 176;
const COIN_THICKNESS = 36;
const BASE_X = 946;
const GROUND_Y = 914;

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

type ProjectedPoint = Vec3;

type Pose = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
};

type CoinConfig = {
  start: number;
  contact: number;
  flat: number;
  settle: number;
  startX: number;
  finalX: number;
  finalY: number;
  entryRoll: number;
  contactRoll: number;
  restRoll: number;
  restPitch: number;
  restYaw: number;
  tone: number;
  phase: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const radians = (degrees: number) => (degrees * Math.PI) / 180;

const fract = (value: number) => value - Math.floor(value);

const hash = (index: number, salt: number) =>
  fract(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123);

const normalize = (point: Vec3): Vec3 => {
  const length = Math.hypot(point.x, point.y, point.z) || 1;
  return {
    x: point.x / length,
    y: point.y / length,
    z: point.z / length,
  };
};

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

const LIGHT = normalize({x: -0.58, y: -0.72, z: 0.82});
const HALF_VECTOR = normalize({x: LIGHT.x, y: LIGHT.y, z: LIGHT.z + 1});

const coinConfigs: CoinConfig[] = [
  {
    start: 24,
    contact: 38,
    flat: 40,
    settle: 62,
    startX: 894,
    finalX: 940,
    finalY: 823,
    entryRoll: -73,
    contactRoll: 165,
    restRoll: -0.2,
    restPitch: 68.2,
    restYaw: -0.6,
    tone: -1,
    phase: 0.13,
  },
  {
    start: 76,
    contact: 84,
    flat: 90,
    settle: 106,
    startX: 898,
    finalX: 963,
    finalY: 746,
    entryRoll: -31,
    contactRoll: 90,
    restRoll: 0.35,
    restPitch: 67.5,
    restYaw: 0.5,
    tone: 2,
    phase: 0.29,
  },
  {
    start: 104,
    contact: 112,
    flat: 118,
    settle: 134,
    startX: 864,
    finalX: 933,
    finalY: 682,
    entryRoll: -28,
    contactRoll: 91,
    restRoll: -0.25,
    restPitch: 68.7,
    restYaw: -0.7,
    tone: 0,
    phase: 0.41,
  },
  {
    start: 132,
    contact: 138,
    flat: 144,
    settle: 166,
    startX: 952,
    finalX: 976,
    finalY: 614,
    entryRoll: 0,
    contactRoll: 91,
    restRoll: 0.45,
    restPitch: 67.8,
    restYaw: 0.7,
    tone: -2,
    phase: 0.57,
  },
  {
    start: 176,
    contact: 182,
    flat: 188,
    settle: 210,
    startX: 936,
    finalX: 929,
    finalY: 541,
    entryRoll: 0,
    contactRoll: 91,
    restRoll: -0.35,
    restPitch: 68.4,
    restYaw: -0.4,
    tone: 1,
    phase: 0.68,
  },
  {
    start: 212,
    contact: 216,
    flat: 222,
    settle: 244,
    startX: 1000,
    finalX: 948,
    finalY: 456,
    entryRoll: 43,
    contactRoll: 90,
    restRoll: 0.3,
    restPitch: 67.3,
    restYaw: 0.8,
    tone: -1,
    phase: 0.82,
  },
  {
    start: 250,
    contact: 254,
    flat: 260,
    settle: 282,
    startX: 1040,
    finalX: 963,
    finalY: 375,
    entryRoll: 35,
    contactRoll: 91,
    restRoll: -0.2,
    restPitch: 68.0,
    restYaw: -0.7,
    tone: 2,
    phase: 0.94,
  },
  {
    start: 296,
    contact: 298,
    flat: 304,
    settle: 326,
    startX: 946,
    finalX: 914,
    finalY: 294,
    entryRoll: 31,
    contactRoll: 91,
    restRoll: 0.1,
    restPitch: 67.7,
    restYaw: 0.3,
    tone: 0,
    phase: 0.05,
  },
];

const rotatePoint = (point: Vec3, pose: Pose): Vec3 => {
  const rx = radians(pose.rx);
  const ry = radians(pose.ry);
  const rz = radians(pose.rz);
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);

  const sourceX = point.x * pose.scale;
  const sourceY = point.y * pose.scale;
  const sourceZ = point.z * pose.scale;

  const x1 = sourceX;
  const y1 = sourceY * cosX - sourceZ * sinX;
  const z1 = sourceY * sinX + sourceZ * cosX;
  const x2 = x1 * cosY + z1 * sinY;
  const y2 = y1;
  const z2 = -x1 * sinY + z1 * cosY;

  return {
    x: x2 * cosZ - y2 * sinZ,
    y: x2 * sinZ + y2 * cosZ,
    z: z2,
  };
};

const projectPoint = (point: Vec3, pose: Pose): ProjectedPoint => {
  const rotated = rotatePoint(point, pose);
  const perspective = CAMERA_DISTANCE / (CAMERA_DISTANCE - rotated.z);
  return {
    x: pose.x + rotated.x * perspective,
    y: pose.y + rotated.y * perspective,
    z: rotated.z,
  };
};

const projectedCircle = (
  pose: Pose,
  radius: number,
  localZ: number,
  segments = 96,
) =>
  Array.from({length: segments}, (_, index) => {
    const angle = (index / segments) * TAU;
    return projectPoint(
      {x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: localZ},
      pose,
    );
  });

const tracePoints = (
  context: CanvasRenderingContext2D,
  points: ProjectedPoint[],
  close = true,
) => {
  if (points.length === 0) {
    return;
  }
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x, points[index].y);
  }
  if (close) {
    context.closePath();
  }
};

const boundsOf = (points: ProjectedPoint[]) => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY};
};

const metallicColor = (lightness: number, hueShift = 0, saturation = 82) =>
  `hsl(${39 + hueShift} ${saturation}% ${clamp(lightness, 8, 88)}%)`;

const drawProjectedStroke = (
  context: CanvasRenderingContext2D,
  points: Vec3[],
  pose: Pose,
  color: string,
  width: number,
  close = false,
) => {
  const projected = points.map((point) => projectPoint(point, pose));
  tracePoints(context, projected, close);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
};

const drawEmboss = (
  context: CanvasRenderingContext2D,
  pose: Pose,
  faceZ: number,
  radius: number,
  coinIndex: number,
) => {
  const emblemZ = faceZ + 3.3;
  const origin = projectPoint({x: 0, y: 0, z: emblemZ}, pose);
  const xBasis = projectPoint({x: 1, y: 0, z: emblemZ}, pose);
  const yBasis = projectPoint({x: 0, y: 1, z: emblemZ}, pose);

  const drawDollarLayer = (
    offsetX: number,
    offsetY: number,
    color: string,
    curveWidth: number,
    stemWidth: number,
  ) => {
    context.save();
    context.translate(offsetX, offsetY);
    context.strokeStyle = color;
    context.lineCap = "butt";
    context.lineJoin = "round";

    context.lineWidth = stemWidth;
    context.beginPath();
    context.moveTo(0, -radius * 0.49);
    context.lineTo(0, radius * 0.49);
    context.stroke();

    context.lineWidth = curveWidth;
    context.beginPath();
    context.moveTo(radius * 0.19, -radius * 0.34);
    context.bezierCurveTo(
      radius * 0.1,
      -radius * 0.41,
      -radius * 0.2,
      -radius * 0.41,
      -radius * 0.23,
      -radius * 0.24,
    );
    context.bezierCurveTo(
      -radius * 0.26,
      -radius * 0.08,
      -radius * 0.07,
      -radius * 0.04,
      radius * 0.07,
      0,
    );
    context.bezierCurveTo(
      radius * 0.23,
      radius * 0.045,
      radius * 0.27,
      radius * 0.16,
      radius * 0.22,
      radius * 0.27,
    );
    context.bezierCurveTo(
      radius * 0.15,
      radius * 0.4,
      -radius * 0.12,
      radius * 0.41,
      -radius * 0.22,
      radius * 0.32,
    );
    context.stroke();
    context.restore();
  };

  context.save();
  context.transform(
    xBasis.x - origin.x,
    xBasis.y - origin.y,
    yBasis.x - origin.x,
    yBasis.y - origin.y,
    origin.x,
    origin.y,
  );
  drawDollarLayer(
    radius * 0.018,
    radius * 0.026,
    "rgba(65, 27, 1, 0.76)",
    radius * 0.13,
    radius * 0.074,
  );
  drawDollarLayer(
    -radius * 0.008,
    -radius * 0.011,
    "rgba(255, 207, 82, 0.9)",
    radius * 0.112,
    radius * 0.061,
  );
  drawDollarLayer(
    0,
    0,
    "rgba(126, 63, 4, 0.98)",
    radius * 0.098,
    radius * 0.052,
  );
  context.restore();

  for (let index = 0; index < 14; index += 1) {
    const angle = hash(index + coinIndex * 17, 6) * TAU;
    const distance = radius * (0.23 + hash(index + coinIndex * 19, 7) * 0.48);
    const length = radius * (0.018 + hash(index + coinIndex * 23, 8) * 0.07);
    const scratchAngle = angle + (hash(index, 9) - 0.5) * 0.5;
    const start = {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      z: faceZ + 2.3,
    };
    drawProjectedStroke(
      context,
      [
        start,
        {
          x: start.x + Math.cos(scratchAngle) * length,
          y: start.y + Math.sin(scratchAngle) * length,
          z: faceZ + 2.3,
        },
      ],
      pose,
      `rgba(92, 48, 3, ${0.035 + hash(index, 10) * 0.04})`,
      1.15,
    );
  }
};

const drawCoin = (
  context: CanvasRenderingContext2D,
  pose: Pose,
  coinIndex: number,
  alpha = 1,
) => {
  const config = coinConfigs[coinIndex];
  const halfThickness = COIN_THICKNESS / 2;
  const normal = normalize(rotatePoint({x: 0, y: 0, z: 1}, pose));
  const nearZ = normal.z >= 0 ? halfThickness : -halfThickness;
  const farZ = -nearZ;
  const faceLight = clamp(0.54 + Math.max(0, dot(normal, LIGHT)) * 0.34, 0.48, 0.94);

  context.save();
  context.globalAlpha *= alpha;

  const farFace = projectedCircle(pose, COIN_RADIUS, farZ, 96);
  tracePoints(context, farFace, true);
  context.fillStyle = metallicColor(27 + config.tone, -1, 80);
  context.fill();

  const sidePanels = Array.from({length: 72}, (_, index) => {
    const angle0 = (index / 72) * TAU;
    const angle1 = ((index + 1) / 72) * TAU;
    const localNormal = {x: Math.cos((angle0 + angle1) / 2), y: Math.sin((angle0 + angle1) / 2), z: 0};
    const worldNormal = normalize(rotatePoint(localNormal, pose));
    const points = [
      projectPoint({x: Math.cos(angle0) * COIN_RADIUS, y: Math.sin(angle0) * COIN_RADIUS, z: farZ}, pose),
      projectPoint({x: Math.cos(angle1) * COIN_RADIUS, y: Math.sin(angle1) * COIN_RADIUS, z: farZ}, pose),
      projectPoint({x: Math.cos(angle1) * COIN_RADIUS, y: Math.sin(angle1) * COIN_RADIUS, z: nearZ}, pose),
      projectPoint({x: Math.cos(angle0) * COIN_RADIUS, y: Math.sin(angle0) * COIN_RADIUS, z: nearZ}, pose),
    ];
    return {
      index,
      points,
      depth: points.reduce((sum, point) => sum + point.z, 0) / points.length,
      worldNormal,
    };
  }).sort((a, b) => a.depth - b.depth);

  for (const panel of sidePanels) {
    const diffuse = Math.max(0, dot(panel.worldNormal, LIGHT));
    const specular = Math.pow(Math.max(0, dot(panel.worldNormal, HALF_VECTOR)), 18);
    const reed = panel.index % 4 === 0 ? -10 : panel.index % 2 === 0 ? 5 : -2;
    const lightness = 24 + diffuse * 35 + specular * 28 + reed + config.tone;
    tracePoints(context, panel.points, true);
    context.fillStyle = metallicColor(lightness, panel.index % 7 === 0 ? -1.5 : 0, 84);
    context.fill();
    if (panel.index % 4 === 0) {
      context.strokeStyle = "rgba(70, 33, 2, 0.42)";
      context.lineWidth = 1.15;
      context.stroke();
    }
  }

  const face = projectedCircle(pose, COIN_RADIUS, nearZ, 120);
  const faceBounds = boundsOf(face);
  tracePoints(context, face, true);
  const faceGradient = context.createLinearGradient(
    faceBounds.minX,
    faceBounds.maxY,
    faceBounds.maxX,
    faceBounds.minY,
  );
  const faceOffset = (faceLight - 0.54) * 25;
  faceGradient.addColorStop(0, metallicColor(30 + faceOffset + config.tone));
  faceGradient.addColorStop(0.18, metallicColor(54 + faceOffset + config.tone));
  faceGradient.addColorStop(0.38, metallicColor(76 + faceOffset + config.tone, 1, 88));
  faceGradient.addColorStop(0.58, metallicColor(58 + faceOffset + config.tone));
  faceGradient.addColorStop(0.78, metallicColor(36 + faceOffset + config.tone));
  faceGradient.addColorStop(1, metallicColor(66 + faceOffset + config.tone, 1, 88));
  context.fillStyle = faceGradient;
  context.fill();

  context.save();
  tracePoints(context, face, true);
  context.clip();
  const radial = context.createRadialGradient(
    faceBounds.minX + faceBounds.width * 0.3,
    faceBounds.minY + faceBounds.height * 0.22,
    2,
    faceBounds.minX + faceBounds.width * 0.43,
    faceBounds.minY + faceBounds.height * 0.46,
    Math.max(faceBounds.width, faceBounds.height) * 0.72,
  );
  radial.addColorStop(0, "rgba(255, 250, 198, 0.68)");
  radial.addColorStop(0.28, "rgba(255, 225, 111, 0.18)");
  radial.addColorStop(0.72, "rgba(92, 44, 3, 0.1)");
  radial.addColorStop(1, "rgba(65, 28, 1, 0.32)");
  context.fillStyle = radial;
  context.fillRect(faceBounds.minX - 8, faceBounds.minY - 8, faceBounds.width + 16, faceBounds.height + 16);

  const shinePhase = 0.5 + 0.5 * Math.sin(radians(pose.rz * 1.45 + pose.ry * 3 + coinIndex * 37));
  const shineX = faceBounds.minX - faceBounds.width * 0.55 + shinePhase * faceBounds.width * 2.1;
  const shine = context.createLinearGradient(
    shineX - faceBounds.width * 0.24,
    faceBounds.maxY,
    shineX + faceBounds.width * 0.24,
    faceBounds.minY,
  );
  shine.addColorStop(0, "rgba(255,255,255,0)");
  shine.addColorStop(0.42, "rgba(255,246,183,0.04)");
  shine.addColorStop(0.5, "rgba(255,255,224,0.58)");
  shine.addColorStop(0.58, "rgba(255,234,143,0.08)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = shine;
  context.fillRect(faceBounds.minX - faceBounds.width, faceBounds.minY - faceBounds.height, faceBounds.width * 3, faceBounds.height * 3);
  context.restore();

  for (const ring of [
    {radius: 0.955, color: "rgba(255, 239, 146, 0.82)", width: 5.2},
    {radius: 0.895, color: "rgba(100, 52, 4, 0.72)", width: 5.6},
    {radius: 0.845, color: "rgba(255, 223, 108, 0.82)", width: 2.6},
  ]) {
    const points = projectedCircle(pose, COIN_RADIUS * ring.radius, nearZ + 0.8, 96);
    tracePoints(context, points, true);
    context.strokeStyle = ring.color;
    context.lineWidth = ring.width;
    context.stroke();
  }

  for (let index = 0; index < 48; index += 1) {
    const angle = (index / 48) * TAU;
    const innerRadius = COIN_RADIUS * 0.903;
    const outerRadius = COIN_RADIUS * 0.947;
    drawProjectedStroke(
      context,
      [
        {x: Math.cos(angle) * innerRadius, y: Math.sin(angle) * innerRadius, z: nearZ + 1.1},
        {x: Math.cos(angle) * outerRadius, y: Math.sin(angle) * outerRadius, z: nearZ + 1.1},
      ],
      pose,
      index % 2 === 0 ? "rgba(88, 44, 3, 0.38)" : "rgba(255, 238, 153, 0.46)",
      index % 4 === 0 ? 1.8 : 1.15,
    );
  }

  drawEmboss(context, pose, nearZ, COIN_RADIUS, coinIndex);

  tracePoints(context, face, true);
  context.strokeStyle = "rgba(82, 39, 2, 0.9)";
  context.lineWidth = 3.2;
  context.stroke();
  const outerHighlight = projectedCircle(pose, COIN_RADIUS - 2.5, nearZ + 1.2, 120);
  tracePoints(context, outerHighlight, true);
  context.strokeStyle = "rgba(255, 235, 137, 0.72)";
  context.lineWidth = 2.0;
  context.stroke();

  context.restore();
};

const settledY = (index: number) => coinConfigs[index].finalY;

const poseForFrame = (frame: number, index: number): Pose | null => {
  const config = coinConfigs[index];
  if (frame < config.start) {
    return null;
  }

  const finalY = settledY(index);
  const finalRoll = 180 + config.restRoll;

  if (frame <= config.contact) {
    const duration = Math.max(1, config.contact - config.start);
    const progress = clamp((frame - config.start) / duration);
    const descent = clamp(progress + 0.47 * progress * (1 - progress));
    const contactLift = index === 0 ? 22 : 176;
    const contactY = finalY - contactLift;
    return {
      x: lerp(config.startX, config.finalX + (index % 2 === 0 ? 4 : -4), easeOutCubic(progress)),
      y: lerp(-188, contactY, descent),
      rx:
        58 +
        Math.sin(progress * Math.PI) * 8 +
        (index % 3 - 1) * 1.6 +
        (index === 0 ? 4.5 * Math.pow(progress, 3) : 0),
      ry: Math.sin(progress * TAU + config.phase * TAU) * 7.5,
      rz: 180 + lerp(config.entryRoll, config.contactRoll, progress),
      scale: 1,
    };
  }

  if (frame <= config.flat) {
    const progress = clamp((frame - config.contact) / Math.max(1, config.flat - config.contact));
    const amount = easeOutCubic(progress);
    const contactLift = index === 0 ? 22 : 176;
    return {
      x: lerp(config.finalX + (index % 2 === 0 ? 4 : -4), config.finalX, amount),
      y: lerp(finalY - contactLift, finalY, amount),
      rx: lerp(
        58 + (index % 3 - 1) * 1.6 + (index === 0 ? 4.5 : 0),
        config.restPitch,
        amount,
      ),
      ry: lerp(Math.sin(config.phase * TAU) * 7.5, config.restYaw, amount),
      rz: 180 + lerp(config.contactRoll, finalRoll, amount),
      scale: 1,
    };
  }

  if (frame < config.settle) {
    const elapsed = frame - config.flat;
    const remaining = clamp(1 - elapsed / Math.max(1, config.settle - config.flat));
    const verticalBounce = -19 * Math.exp(-elapsed / 11) * Math.sin((elapsed / 11) * Math.PI);
    const rock = -10 * Math.exp(-elapsed / 13) * Math.sin((elapsed / 8) * Math.PI);
    const sway = 4.2 * Math.exp(-elapsed / 12) * Math.sin((elapsed / 9) * Math.PI + config.phase * 1.5);
    return {
      x: config.finalX + sway,
      y: finalY + verticalBounce,
      rx: config.restPitch + Math.sin(elapsed * 0.36) * 1.2 * remaining,
      ry: config.restYaw + Math.cos(elapsed * 0.31) * 1.5 * remaining,
      rz: 180 + finalRoll + rock,
      scale: 1,
    };
  }

  return {
    x: config.finalX,
    y: finalY,
    rx: config.restPitch,
    ry: config.restYaw,
    rz: 180 + finalRoll,
    scale: 1,
  };
};

const drawSoftEllipse = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  blur: number,
) => {
  context.save();
  context.filter = `blur(${blur}px)`;
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, TAU);
  context.fill();
  context.restore();
};

const drawStackShadow = (context: CanvasRenderingContext2D, frame: number) => {
  const visibility = easeOutCubic(clamp((frame - 24) / 18));
  if (visibility <= 0) {
    return;
  }
  drawSoftEllipse(
    context,
    BASE_X,
    GROUND_Y,
    190,
    23,
    `rgba(0, 72, 11, ${0.25 * visibility})`,
    15,
  );
  drawSoftEllipse(
    context,
    BASE_X,
    GROUND_Y - 3,
    154,
    13,
    `rgba(0, 54, 8, ${0.22 * visibility})`,
    6,
  );
};

const drawAirborneShadow = (
  context: CanvasRenderingContext2D,
  frame: number,
  index: number,
) => {
  const config = coinConfigs[index];
  if (frame < config.start || frame > config.flat) {
    return;
  }
  const pose = poseForFrame(frame, index);
  if (!pose) {
    return;
  }
  const progress = clamp((frame - config.start) / Math.max(1, config.flat - config.start));
  const proximity = easeOutCubic(progress);
  const radiusX = lerp(92, 154, proximity);
  const radiusY = lerp(15, 26, proximity);
  const blur = lerp(28, 8, proximity);
  const opacity = lerp(0.045, 0.16, proximity);
  drawSoftEllipse(
    context,
    lerp(pose.x, BASE_X, 0.22),
    GROUND_Y - 2,
    radiusX,
    radiusY,
    `rgba(0, 66, 10, ${opacity})`,
    blur,
  );
};

const drawContactOcclusion = (
  context: CanvasRenderingContext2D,
  pose: Pose,
  progress: number,
) => {
  const alpha = clamp(progress) * 0.22;
  if (alpha <= 0) {
    return;
  }
  context.save();
  context.filter = "blur(5px)";
  context.fillStyle = `rgba(63, 31, 1, ${alpha})`;
  context.beginPath();
  context.ellipse(pose.x, pose.y + 67, 137, 17, radians(pose.rz - 360) * 0.12, 0, TAU);
  context.fill();
  context.restore();
};

const renderScene = (
  context: CanvasRenderingContext2D,
  frame: number,
  canvasWidth: number,
  canvasHeight: number,
) => {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = "rgb(28, 255, 11)";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const scaleX = canvasWidth / DESIGN_WIDTH;
  const scaleY = canvasHeight / DESIGN_HEIGHT;
  context.save();
  context.scale(scaleX, scaleY);

  drawStackShadow(context, frame);
  for (let index = 0; index < coinConfigs.length; index += 1) {
    drawAirborneShadow(context, frame, index);
  }

  for (let index = 0; index < coinConfigs.length; index += 1) {
    const pose = poseForFrame(frame, index);
    if (!pose) {
      continue;
    }
    const config = coinConfigs[index];
    if (index > 0 && frame >= config.contact) {
      const contactProgress = easeOutCubic(
        clamp((frame - config.contact) / Math.max(1, config.flat - config.contact)),
      );
      drawContactOcclusion(context, pose, contactProgress);
    }

    if (frame < config.contact && config.contact - config.start >= 4) {
      for (let sample = 2; sample >= 1; sample -= 1) {
        const ghostPose = poseForFrame(frame - sample * 0.7, index);
        if (!ghostPose) {
          continue;
        }
        context.save();
        context.filter = `blur(${1.3 + sample * 0.7}px)`;
        drawCoin(
          context,
          ghostPose,
          index,
          sample === 1 ? 0.055 : 0.028,
        );
        context.restore();
      }
    }
    drawCoin(context, pose, index);
  }

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
    <AbsoluteFill style={{backgroundColor: "rgb(28, 255, 11)"}}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{width: "100%", height: "100%", display: "block"}}
      />
    </AbsoluteFill>
  );
};
