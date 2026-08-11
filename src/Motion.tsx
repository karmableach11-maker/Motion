import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

type WorldPoint = {
  x: number;
  y: number;
  z: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
  scale: number;
};

type WireBox = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  alpha: number;
  color: 0 | 1 | 2;
};

type DataStream = {
  x: number;
  y: number;
  z: number;
  axis: 0 | 1 | 2;
  count: number;
  spacing: number;
  fontWorld: number;
  alpha: number;
  phase: number;
  seed: number;
};

type DataSpark = {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  color: 0 | 1 | 2;
  phase: number;
};

type DataTrace = {
  x: number;
  y: number;
  z: number;
  axis: 0 | 1 | 2;
  length: number;
  alpha: number;
  color: 0 | 1 | 2;
};

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const CAMERA_SPEED = 10;
const NEAR = 0.72;
const FAR = 78;
const FOCAL_DESIGN = 860;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const makeRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const placeOnTunnelShell = (
  random: () => number,
): {x: number; y: number} => {
  const side = Math.floor(random() * 10);

  if (side <= 1) {
    return {x: -12.2 + random() * 1.8, y: -6.6 + random() * 13.2};
  }

  if (side <= 3) {
    return {x: 10.4 + random() * 1.8, y: -6.6 + random() * 13.2};
  }

  if (side <= 5) {
    return {x: -12.2 + random() * 24.4, y: -7.0 + random() * 1.6};
  }

  if (side <= 7) {
    return {x: -12.2 + random() * 24.4, y: 5.4 + random() * 1.6};
  }

  let x = -10.5 + random() * 21;
  let y = -5.8 + random() * 11.6;
  if (Math.abs(x) < 2.5 && Math.abs(y) < 1.5) {
    x += x < 0 ? -2.6 : 2.6;
    y += y < 0 ? -1.4 : 1.4;
  }
  return {x, y};
};

const createBoxes = (): WireBox[] => {
  const random = makeRandom(208192454);
  return Array.from({length: 620}, (_, index) => {
    const position = placeOnTunnelShell(random);
    const rareColor = random();
    const color: 0 | 1 | 2 = rareColor > 0.982 ? 2 : rareColor > 0.93 ? 1 : 0;
    const large = random() > 0.91;
    return {
      x: position.x,
      y: position.y,
      z: 1.5 + random() * 184 + (index % 7) * 0.17,
      width: large ? 1.05 + random() * 2.2 : 0.09 + random() * 1.08,
      height: large ? 0.62 + random() * 1.1 : 0.07 + random() * 0.68,
      depth: large ? 1.1 + random() * 4.2 : 0.18 + random() * 2.45,
      alpha: 0.10 + random() * 0.39,
      color,
    };
  }).sort((a, b) => b.z - a.z);
};

const createStreams = (): DataStream[] => {
  const random = makeRandom(74129311);
  return Array.from({length: 980}, (_, index) => {
    const position = placeOnTunnelShell(random);
    const axisPick = random();
    const axis: 0 | 1 | 2 = axisPick < 0.42 ? 2 : axisPick < 0.72 ? 0 : 1;
    return {
      x: position.x,
      y: position.y,
      z: 1.4 + random() * 186 + (index % 9) * 0.11,
      axis,
      count: 5 + Math.floor(random() * 10),
      spacing: 0.20 + random() * 0.51,
      fontWorld: 0.13 + random() * 0.14,
      alpha: 0.30 + random() * 0.65,
      phase: random() * Math.PI * 2,
      seed: Math.floor(random() * 1000000),
    };
  }).sort((a, b) => b.z - a.z);
};

const createSparks = (): DataSpark[] => {
  const random = makeRandom(89027113);
  return Array.from({length: 48000}, () => {
    const position = placeOnTunnelShell(random);
    const colorPick = random();
    const color: 0 | 1 | 2 = colorPick > 0.974 ? 2 : colorPick > 0.91 ? 1 : 0;
    return {
      x: position.x + (random() - 0.5) * 0.75,
      y: position.y + (random() - 0.5) * 0.55,
      z: 1.2 + random() * 188,
      size: 0.018 + random() * 0.058,
      alpha: 0.15 + random() * 0.57,
      color,
      phase: random() * Math.PI * 2,
    };
  }).sort((a, b) => b.z - a.z);
};

const createTraces = (): DataTrace[] => {
  const random = makeRandom(63749121);
  return Array.from({length: 3250}, () => {
    const position = placeOnTunnelShell(random);
    const axisPick = random();
    const axis: 0 | 1 | 2 = axisPick < 0.38 ? 2 : axisPick < 0.69 ? 0 : 1;
    const colorPick = random();
    const color: 0 | 1 | 2 = colorPick > 0.989 ? 2 : colorPick > 0.955 ? 1 : 0;
    return {
      x: position.x,
      y: position.y,
      z: 1.3 + random() * 188,
      axis,
      length: axis === 2 ? 0.65 + random() * 5.8 : 0.12 + random() * 1.42,
      alpha: 0.07 + random() * 0.34,
      color,
    };
  }).sort((a, b) => b.z - a.z);
};

const BOXES = createBoxes();
const STREAMS = createStreams();
const SPARKS = createSparks();
const TRACES = createTraces();

const colorFor = (color: 0 | 1 | 2, alpha: number): string => {
  if (color === 2) {
    return `rgba(255, 44, 88, ${alpha})`;
  }
  if (color === 1) {
    return `rgba(38, 126, 255, ${alpha})`;
  }
  return `rgba(86, 218, 255, ${alpha})`;
};

const project = (
  point: WorldPoint,
  cameraZ: number,
  width: number,
  height: number,
): ProjectedPoint | null => {
  const z = point.z - cameraZ;
  if (z <= NEAR || z > FAR) {
    return null;
  }
  const layoutScale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const focal = FOCAL_DESIGN * layoutScale;
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  return {
    x: centerX + (point.x * focal) / z,
    y: centerY + (point.y * focal) / z,
    z,
    scale: focal / z,
  };
};

const visibleDepthAlpha = (z: number): number => {
  const farFade = 1 - smoothstep(FAR - 18, FAR, z);
  const nearFade = smoothstep(NEAR, NEAR + 0.72, z);
  return farFade * nearFade;
};

const drawSegment = (
  context: CanvasRenderingContext2D,
  a: WorldPoint,
  b: WorldPoint,
  cameraZ: number,
  width: number,
  height: number,
): boolean => {
  const pa = project(a, cameraZ, width, height);
  const pb = project(b, cameraZ, width, height);
  if (!pa || !pb) {
    return false;
  }
  context.moveTo(pa.x, pa.y);
  context.lineTo(pb.x, pb.y);
  return true;
};

const drawAtmosphere = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const background = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.max(width, height) * 0.72,
  );
  background.addColorStop(0, '#020c13');
  background.addColorStop(0.27, '#03141d');
  background.addColorStop(0.68, '#062431');
  background.addColorStop(1, '#01090f');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const horizon = context.createLinearGradient(0, centerY - height * 0.2, 0, centerY + height * 0.2);
  horizon.addColorStop(0, 'rgba(6, 39, 51, 0)');
  horizon.addColorStop(0.48, 'rgba(17, 85, 105, 0.11)');
  horizon.addColorStop(0.52, 'rgba(12, 61, 78, 0.09)');
  horizon.addColorStop(1, 'rgba(4, 29, 41, 0)');
  context.fillStyle = horizon;
  context.fillRect(0, centerY - height * 0.22, width, height * 0.44);
};

const drawTunnelGrid = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';

  const ringSpacing = 2.12;
  const firstRing = Math.ceil((cameraZ + NEAR + 0.35) / ringSpacing) * ringSpacing;
  const ringCount = Math.ceil(FAR / ringSpacing) + 1;

  for (let index = ringCount - 1; index >= 0; index--) {
    const worldZ = firstRing + index * ringSpacing;
    const z = worldZ - cameraZ;
    if (z <= NEAR || z > FAR) {
      continue;
    }
    const depth = 1 - z / FAR;
    const alpha = (0.035 + depth * 0.17) * visibleDepthAlpha(z);
    const leftTop = project({x: -12.8, y: -7.15, z: worldZ}, cameraZ, width, height);
    const rightTop = project({x: 12.8, y: -7.15, z: worldZ}, cameraZ, width, height);
    const rightBottom = project({x: 12.8, y: 7.15, z: worldZ}, cameraZ, width, height);
    const leftBottom = project({x: -12.8, y: 7.15, z: worldZ}, cameraZ, width, height);
    if (!leftTop || !rightTop || !rightBottom || !leftBottom) {
      continue;
    }
    context.beginPath();
    context.moveTo(leftTop.x, leftTop.y);
    context.lineTo(rightTop.x, rightTop.y);
    context.lineTo(rightBottom.x, rightBottom.y);
    context.lineTo(leftBottom.x, leftBottom.y);
    context.closePath();
    context.strokeStyle = `rgba(52, 192, 227, ${alpha})`;
    context.lineWidth = 0.78 + depth * 1.72;
    context.stroke();
  }

  const nearZ = cameraZ + NEAR + 0.5;
  const farZ = cameraZ + FAR - 1;

  for (let x = -12; x <= 12.01; x += 1.05) {
    for (const y of [-7.0, 7.0]) {
      context.beginPath();
      const drawn = drawSegment(
        context,
        {x, y, z: nearZ},
        {x, y, z: farZ},
        cameraZ,
        width,
        height,
      );
      if (drawn) {
        context.strokeStyle = 'rgba(45, 174, 213, 0.095)';
        context.lineWidth = 1.12;
        context.stroke();
      }
    }
  }

  for (let y = -6.25; y <= 6.26; y += 0.9) {
    for (const x of [-12.6, 12.6]) {
      context.beginPath();
      const drawn = drawSegment(
        context,
        {x, y, z: nearZ},
        {x, y, z: farZ},
        cameraZ,
        width,
        height,
      );
      if (drawn) {
        context.strokeStyle = 'rgba(45, 174, 213, 0.085)';
        context.lineWidth = 1.08;
        context.stroke();
      }
    }
  }

  context.restore();
};

const drawWireBoxes = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';

  for (const box of BOXES) {
    let front = box.z - cameraZ;
    const back = front + box.depth;
    if (back <= NEAR || front > FAR) {
      continue;
    }
    front = Math.max(front, NEAR + 0.06);
    const worldFront = cameraZ + front;
    const worldBack = cameraZ + Math.min(back, FAR);
    const x0 = box.x;
    const x1 = box.x + box.width;
    const y0 = box.y;
    const y1 = box.y + box.height;
    const corners: WorldPoint[] = [
      {x: x0, y: y0, z: worldFront},
      {x: x1, y: y0, z: worldFront},
      {x: x1, y: y1, z: worldFront},
      {x: x0, y: y1, z: worldFront},
      {x: x0, y: y0, z: worldBack},
      {x: x1, y: y0, z: worldBack},
      {x: x1, y: y1, z: worldBack},
      {x: x0, y: y1, z: worldBack},
    ];
    const projected = corners.map((corner) => project(corner, cameraZ, width, height));
    if (projected.some((point) => point === null)) {
      continue;
    }
    const points = projected as ProjectedPoint[];
    const depth = 1 - clamp((front + back) * 0.5 / FAR, 0, 1);
    const alpha = box.alpha * (0.2 + Math.pow(depth, 1.15) * 0.92) * visibleDepthAlpha(front);
    if (alpha < 0.01) {
      continue;
    }
    const edgePairs: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    context.beginPath();
    for (const [from, to] of edgePairs) {
      context.moveTo(points[from].x, points[from].y);
      context.lineTo(points[to].x, points[to].y);
    }
    context.strokeStyle = colorFor(box.color, alpha);
    context.lineWidth = 0.74 + depth * 2.18;
    context.stroke();
  }

  context.restore();
};

const drawDataTraces = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';

  for (const trace of TRACES) {
    const relativeZ = trace.z - cameraZ;
    if (relativeZ <= NEAR || relativeZ > FAR) {
      continue;
    }

    const end: WorldPoint =
      trace.axis === 0
        ? {x: trace.x + trace.length, y: trace.y, z: trace.z}
        : trace.axis === 1
          ? {x: trace.x, y: trace.y + trace.length, z: trace.z}
          : {x: trace.x, y: trace.y, z: trace.z + trace.length};
    const startPoint = project(trace, cameraZ, width, height);
    const endPoint = project(end, cameraZ, width, height);
    if (!startPoint || !endPoint) {
      continue;
    }

    const depth = 1 - relativeZ / FAR;
    const alpha = trace.alpha * visibleDepthAlpha(relativeZ) * (0.27 + depth * 1.16);
    if (alpha < 0.009) {
      continue;
    }
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.strokeStyle = colorFor(trace.color, alpha);
    context.lineWidth = 0.68 + depth * (trace.axis === 2 ? 1.82 : 1.34);
    context.stroke();

    if (trace.color !== 0 || (trace.axis === 2 && relativeZ < 12)) {
      const nodeSize = clamp(0.017 * startPoint.scale, 0.65, 5.5);
      context.fillStyle = colorFor(trace.color, alpha * 1.25);
      context.fillRect(
        startPoint.x - nodeSize * 0.5,
        startPoint.y - nodeSize * 0.5,
        nodeSize,
        nodeSize,
      );
    }
  }

  context.restore();
};

const streamGlyphPosition = (stream: DataStream, index: number): WorldPoint => {
  const offset = (index - (stream.count - 1) * 0.5) * stream.spacing;
  if (stream.axis === 0) {
    return {x: stream.x + offset, y: stream.y, z: stream.z};
  }
  if (stream.axis === 1) {
    return {x: stream.x, y: stream.y + offset, z: stream.z};
  }
  return {x: stream.x, y: stream.y, z: stream.z + index * stream.spacing};
};

const drawDataStreams = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
  frame: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (const stream of STREAMS) {
    const baseZ = stream.z - cameraZ;
    if (baseZ < NEAR - stream.spacing * stream.count || baseZ > FAR) {
      continue;
    }
    const oscillation = 0.5 + 0.5 * Math.sin(frame * 0.105 + stream.phase);
    const flicker = 0.52 + 0.48 * smoothstep(0.12, 0.86, oscillation);

    for (let index = 0; index < stream.count; index++) {
      const world = streamGlyphPosition(stream, index);
      const point = project(world, cameraZ, width, height);
      if (!point) {
        continue;
      }
      const fontSize = clamp(stream.fontWorld * point.scale, 2.2, 56);
      const depth = 1 - point.z / FAR;
      const seededPulse = 0.72 + 0.28 * Math.sin(frame * 0.073 + stream.phase + index * 1.91);
      const alpha =
        stream.alpha *
        visibleDepthAlpha(point.z) *
        (0.34 + Math.pow(depth, 1.16) * 1.08) *
        flicker *
        seededPulse;
      if (alpha < 0.018) {
        continue;
      }

      const bit = ((stream.seed + index * 17) & 3) === 0 ? '1' : '0';
      if (fontSize < 3.35) {
        const size = clamp(fontSize * 0.52, 0.7, 2.7);
        context.fillStyle = `rgba(100, 223, 248, ${alpha * 0.76})`;
        context.fillRect(point.x - size * 0.5, point.y - size * 0.5, size, size);
        continue;
      }

      context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      if (point.z < 7.5) {
        context.shadowColor = 'rgba(47, 204, 255, 0.92)';
        context.shadowBlur = clamp((8 - point.z) * 3.1, 0, 18);
      } else {
        context.shadowBlur = 0;
      }
      context.fillStyle = `rgba(137, 231, 250, ${alpha})`;
      context.fillText(bit, point.x, point.y);
    }
  }

  context.shadowBlur = 0;
  context.restore();
};

const drawSparks = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
  frame: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';

  for (const spark of SPARKS) {
    const relativeZ = spark.z - cameraZ;
    if (relativeZ > FAR) {
      continue;
    }
    if (relativeZ <= NEAR) {
      break;
    }
    const point = project(spark, cameraZ, width, height);
    if (!point) {
      continue;
    }
    const depth = 1 - point.z / FAR;
    const pulse = 0.60 + 0.40 * Math.pow(0.5 + 0.5 * Math.sin(frame * 0.13 + spark.phase), 2);
    const alpha = Math.min(
      1,
      spark.alpha * visibleDepthAlpha(point.z) * (0.42 + depth * 1.1) * pulse,
    );
    if (alpha < 0.018) {
      continue;
    }
    const size = clamp(spark.size * point.scale, 3.8, spark.color === 2 ? 10.5 : 8.8);

    if (point.z < 8.5 && size > 1.8) {
      const tail = project(
        {x: spark.x, y: spark.y, z: spark.z + 0.72},
        cameraZ,
        width,
        height,
      );
      if (tail) {
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = colorFor(spark.color, alpha * 0.4);
        context.lineWidth = Math.max(0.7, size * 0.45);
        context.stroke();
      }
    }

    context.fillStyle = colorFor(spark.color, alpha);
    if (spark.color === 2 || spark.color === 1) {
      context.fillRect(point.x - size * 0.5, point.y - size * 0.5, size, size);
    } else if (Math.sin(spark.phase * 1.7) > 0) {
      context.fillRect(point.x - size * 0.5, point.y - size * 0.33, size, Math.max(1.4, size * 0.66));
    } else {
      context.fillRect(point.x - size * 0.33, point.y - size * 0.5, Math.max(1.4, size * 0.66), size);
    }
  }

  context.restore();
};

const gateAlpha = (z: number, farStart: number): number =>
  smoothstep(NEAR + 0.03, NEAR + 0.82, z) * (1 - smoothstep(farStart, farStart + 1.45, z));

const drawHorizontalGate = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
  worldZ: number,
  variant: number,
): void => {
  const z = worldZ - cameraZ;
  const alphaWindow = gateAlpha(z, 4.2);
  if (alphaWindow <= 0.002) {
    return;
  }

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let index = -7; index <= 7; index++) {
    const x = index * 0.37 + Math.sin(index * 1.41 + variant) * 0.07;
    const y = 0.80 + Math.cos(index * 0.62 + variant * 0.3) * 0.075;
    const localZ = worldZ + Math.abs(index) * 0.17 + ((index * index + variant) % 3) * 0.035;
    const point = project({x, y, z: localZ}, cameraZ, width, height);
    const tail = project({x, y, z: localZ + 0.46}, cameraZ, width, height);
    if (!point) {
      continue;
    }
    const fontSize = clamp(0.32 * point.scale, 15, 194);
    const local = 0.7 + 0.3 * Math.sin(index * 1.93 + variant * 2.1);
    const alpha = alphaWindow * local;

    if (tail) {
      context.beginPath();
      context.moveTo(tail.x, tail.y);
      context.lineTo(point.x, point.y);
      context.strokeStyle = `rgba(46, 196, 255, ${alpha * 0.42})`;
      context.lineWidth = clamp(fontSize * 0.08, 1.2, 15);
      context.stroke();
    }

    context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    context.shadowColor = 'rgba(74, 211, 255, 0.96)';
    context.shadowBlur = clamp(fontSize * 0.26, 10, 48);
    context.fillStyle = `rgba(188, 247, 255, ${alpha * 0.96})`;
    const bit = ((index + variant * 3) & 3) === 0 ? '1' : '0';
    context.fillText(bit, point.x, point.y);
  }

  context.shadowBlur = 0;
  context.restore();
};

const drawVerticalGate = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
  worldZ: number,
  variant: number,
): void => {
  const z = worldZ - cameraZ;
  const alphaWindow = gateAlpha(z, 4.9);
  if (alphaWindow <= 0.002) {
    return;
  }

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let index = -2; index <= 2; index++) {
    const y = index * 0.65 + 0.18;
    const x = -0.32 - index * 0.032 + Math.sin(index * 0.8 + variant) * 0.035;
    const localZ = worldZ + Math.abs(index) * 0.21;
    const point = project({x, y, z: localZ}, cameraZ, width, height);
    const tail = project({x, y, z: localZ + 0.52}, cameraZ, width, height);
    if (!point) {
      continue;
    }
    const fontSize = clamp(0.39 * point.scale, 18, 218);
    const local = 0.68 + 0.32 * Math.cos(index * 1.37 + variant);
    const alpha = alphaWindow * local;

    if (tail) {
      context.beginPath();
      context.moveTo(tail.x, tail.y);
      context.lineTo(point.x, point.y);
      context.strokeStyle = `rgba(40, 183, 255, ${alpha * 0.5})`;
      context.lineWidth = clamp(fontSize * 0.09, 1.4, 19);
      context.stroke();
    }

    context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    context.shadowColor = 'rgba(51, 189, 255, 1)';
    context.shadowBlur = clamp(fontSize * 0.3, 12, 56);
    context.fillStyle = `rgba(176, 238, 255, ${alpha})`;
    const bit = ((index * 5 + variant) & 2) === 0 ? '0' : '1';
    context.fillText(bit, point.x, point.y);
  }

  context.shadowBlur = 0;
  context.restore();
};

const drawForegroundPasses = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
): void => {
  const horizontalPeakDepth = 1.82;
  const verticalPeakDepth = 2.02;

  for (let cycle = 0; cycle < 2; cycle++) {
    const offset = cycle * CAMERA_SPEED * 5;
    drawHorizontalGate(
      context,
      cameraZ,
      width,
      height,
      CAMERA_SPEED * 4.15 + horizontalPeakDepth + offset,
      cycle,
    );
    drawVerticalGate(
      context,
      cameraZ,
      width,
      height,
      CAMERA_SPEED * 4.67 + verticalPeakDepth + offset,
      cycle + 2,
    );
  }
};

const drawBloom = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.globalAlpha = 0.14;
  context.filter = 'blur(3px)';
  context.drawImage(context.canvas, 0, 0, width, height);
  context.filter = 'none';
  context.restore();
};

const drawFinishing = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'source-over';

  const vignette = context.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.13,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.68,
  );
  vignette.addColorStop(0, 'rgba(0, 9, 15, 0.03)');
  vignette.addColorStop(0.62, 'rgba(0, 8, 14, 0.03)');
  vignette.addColorStop(1, 'rgba(0, 4, 8, 0.58)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  const random = makeRandom(930011 + frame * 977);
  const grainCount = Math.round((width * height) / 3600);
  context.fillStyle = 'rgba(127, 218, 236, 0.055)';
  for (let index = 0; index < grainCount; index++) {
    const x = random() * width;
    const y = random() * height;
    const size = random() > 0.93 ? 1.3 : 0.65;
    context.fillRect(x, y, size, size);
  }

  context.restore();
};

const renderFrame = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  fps: number,
): void => {
  const seconds = frame / fps;
  const cameraZ = seconds * CAMERA_SPEED;
  context.clearRect(0, 0, width, height);
  drawAtmosphere(context, width, height);
  drawTunnelGrid(context, cameraZ, width, height);
  drawWireBoxes(context, cameraZ, width, height);
  drawDataTraces(context, cameraZ, width, height);
  drawDataStreams(context, cameraZ, width, height, frame);
  drawSparks(context, cameraZ, width, height, frame);
  drawForegroundPasses(context, cameraZ, width, height);
  drawBloom(context, width, height);
  drawFinishing(context, width, height, frame);
};

const DigitalTunnelCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext('2d', {alpha: false});
    if (!context) {
      return;
    }
    renderFrame(context, width, height, frame, fps);
  }, [frame, fps, height, width]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export const Motion: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#020b11',
        overflow: 'hidden',
      }}
    >
      <DigitalTunnelCanvas />
    </AbsoluteFill>
  );
};
