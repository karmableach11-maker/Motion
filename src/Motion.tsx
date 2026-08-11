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
  const random = makeRandom(61084217);
  return Array.from({length: 620}, (_, index) => {
	const position = placeOnTunnelShell(random);
	const rareColor = random();
	const color: 0 | 1 | 2 = rareColor > 0.986 ? 2 : rareColor > 0.78 ? 1 : 0;
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
  const random = makeRandom(42701683);
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
  const random = makeRandom(99182731);
  return Array.from({length: 72000}, () => {
	const position = placeOnTunnelShell(random);
	const colorPick = random();
	const color: 0 | 1 | 2 = colorPick > 0.991 ? 2 : colorPick > 0.82 ? 1 : 0;
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
  const random = makeRandom(30517629);
  return Array.from({length: 3250}, () => {
	const position = placeOnTunnelShell(random);
	const axisPick = random();
	const axis: 0 | 1 | 2 = axisPick < 0.38 ? 2 : axisPick < 0.69 ? 0 : 1;
	const colorPick = random();
	const color: 0 | 1 | 2 = colorPick > 0.994 ? 2 : colorPick > 0.82 ? 1 : 0;
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

const CIPHER_GLYPHS = ['0', '1', 'A', 'F', '7', 'C'] as const;

const colorFor = (color: 0 | 1 | 2, alpha: number): string => {
  if (color === 2) {
	return `rgba(255, 42, 126, ${alpha})`;
  }
  if (color === 1) {
	return `rgba(154, 88, 255, ${alpha})`;
  }
  return `rgba(76, 239, 224, ${alpha})`;
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

const coreClarityGain = (
  x: number,
  y: number,
  width: number,
  height: number,
): number => {
  const normalizedX = (x - width * 0.5) / (width * 0.5);
  const normalizedY = (y - height * 0.5) / (height * 0.5);
  const screenRadius = Math.hypot(normalizedX, normalizedY);
  return 0.10 + 0.90 * smoothstep(0.18, 0.62, screenRadius);
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
  background.addColorStop(0, '#05051a');
  background.addColorStop(0.27, '#080b25');
  background.addColorStop(0.68, '#11103b');
  background.addColorStop(1, '#02030d');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const horizon = context.createLinearGradient(0, centerY - height * 0.2, 0, centerY + height * 0.2);
  horizon.addColorStop(0, 'rgba(25, 16, 72, 0)');
  horizon.addColorStop(0.48, 'rgba(93, 52, 181, 0.13)');
  horizon.addColorStop(0.52, 'rgba(24, 131, 149, 0.08)');
  horizon.addColorStop(1, 'rgba(11, 8, 44, 0)');
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
	context.strokeStyle = `rgba(112, 92, 244, ${alpha})`;
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
		context.strokeStyle = 'rgba(71, 223, 214, 0.105)';
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
		context.strokeStyle = 'rgba(139, 89, 241, 0.095)';
		context.lineWidth = 1.08;
		context.stroke();
	  }
	}
  }

  context.restore();
};

const drawPolicyBoundaries = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
): void => {
  context.save();
  context.globalCompositeOperation = 'lighter';

  const spacing = 11.4;
  const first = Math.ceil((cameraZ + NEAR + 1.4) / spacing) * spacing;
  const count = Math.ceil(FAR / spacing) + 1;

  for (let index = count - 1; index >= 0; index--) {
	const worldZ = first + index * spacing;
	const z = worldZ - cameraZ;
	if (z <= NEAR || z > FAR) {
	  continue;
	}

	const corners = [
	  project({x: -11.35, y: -6.25, z: worldZ}, cameraZ, width, height),
	  project({x: 11.35, y: -6.25, z: worldZ}, cameraZ, width, height),
	  project({x: 11.35, y: 6.25, z: worldZ}, cameraZ, width, height),
	  project({x: -11.35, y: 6.25, z: worldZ}, cameraZ, width, height),
	];
	if (corners.some((point) => point === null)) {
	  continue;
	}

	const points = corners as ProjectedPoint[];
	const depth = 1 - z / FAR;
	const alpha = (0.035 + depth * 0.16) * visibleDepthAlpha(z);
	const accent = index % 3 === 0
	  ? `rgba(93, 241, 221, ${alpha})`
	  : `rgba(156, 88, 255, ${alpha})`;

	context.strokeStyle = accent;
	context.lineWidth = 0.8 + depth * 2.1;
	context.setLineDash([
	  Math.max(4, 15 + depth * 24),
	  Math.max(5, 24 - depth * 7),
	]);
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	context.lineTo(points[1].x, points[1].y);
	context.lineTo(points[2].x, points[2].y);
	context.lineTo(points[3].x, points[3].y);
	context.closePath();
	context.stroke();
	context.setLineDash([]);

	const nodeSize = clamp(0.015 * points[0].scale, 1.2, 9.5);
	context.fillStyle = accent;
	for (const point of points) {
	  context.fillRect(
		point.x - nodeSize * 0.5,
		point.y - nodeSize * 0.5,
		nodeSize,
		nodeSize,
	  );
	}
  }

  context.setLineDash([]);
  context.restore();
};

const drawShieldToken = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  color: string,
  verified: boolean,
): void => {
  context.save();
  context.translate(x, y);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = clamp(size * 0.07, 1, 12);
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.shadowColor = color;
  context.shadowBlur = clamp(size * 0.18, 2, 34);

  context.beginPath();
  context.moveTo(0, -size * 0.44);
  context.lineTo(size * 0.34, -size * 0.27);
  context.lineTo(size * 0.29, size * 0.12);
  context.quadraticCurveTo(size * 0.19, size * 0.34, 0, size * 0.45);
  context.quadraticCurveTo(-size * 0.19, size * 0.34, -size * 0.29, size * 0.12);
  context.lineTo(-size * 0.34, -size * 0.27);
  context.closePath();
  context.stroke();

  context.shadowBlur = 0;
  context.beginPath();
  if (verified) {
	context.moveTo(-size * 0.16, size * 0.01);
	context.lineTo(-size * 0.035, size * 0.14);
	context.lineTo(size * 0.18, -size * 0.13);
  } else {
	context.moveTo(-size * 0.13, -size * 0.12);
	context.lineTo(size * 0.13, size * 0.14);
	context.moveTo(size * 0.13, -size * 0.12);
	context.lineTo(-size * 0.13, size * 0.14);
  }
  context.stroke();
  context.restore();
};

const drawLockToken = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  color: string,
): void => {
  context.save();
  context.translate(x, y);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = clamp(size * 0.07, 1, 12);
  context.lineJoin = 'round';
  context.shadowColor = color;
  context.shadowBlur = clamp(size * 0.2, 2, 36);

  const bodyWidth = size * 0.62;
  const bodyHeight = size * 0.49;
  context.strokeRect(-bodyWidth * 0.5, -size * 0.02, bodyWidth, bodyHeight);
  context.beginPath();
  context.arc(0, -size * 0.04, size * 0.22, Math.PI, 0);
  context.stroke();

  context.shadowBlur = 0;
  context.beginPath();
  context.arc(0, size * 0.17, size * 0.045, 0, Math.PI * 2);
  context.fill();
  context.fillRect(-size * 0.025, size * 0.17, size * 0.05, size * 0.13);
  context.restore();
};

const drawCipherToken = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  color: string,
  value: string,
): void => {
  context.save();
  context.translate(x, y);
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = clamp(size * 0.055, 1, 10);
  context.lineJoin = 'round';
  context.shadowColor = color;
  context.shadowBlur = clamp(size * 0.16, 2, 28);
  context.beginPath();
  context.moveTo(-size * 0.29, -size * 0.34);
  context.lineTo(size * 0.29, -size * 0.34);
  context.lineTo(size * 0.40, 0);
  context.lineTo(size * 0.29, size * 0.34);
  context.lineTo(-size * 0.29, size * 0.34);
  context.lineTo(-size * 0.40, 0);
  context.closePath();
  context.stroke();
  context.shadowBlur = 0;
  context.font = `600 ${clamp(size * 0.34, 4, 62)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(value, 0, size * 0.015);
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

	if (box.width > 1.15 && box.height > 0.64 && front < 28 && alpha > 0.025) {
	  const center = project(
		{
		  x: box.x + box.width * 0.5,
		  y: box.y + box.height * 0.5,
		  z: worldFront,
		},
		cameraZ,
		width,
		height,
	  );
	  if (center) {
		const iconSize = clamp(
		  Math.min(box.width, box.height) * center.scale * 0.42,
		  4,
		  52,
		);
		const iconColor = box.color === 2
		  ? 'rgb(255, 42, 126)'
		  : box.color === 1
			? 'rgb(164, 105, 255)'
			: 'rgb(84, 242, 224)';
		if (box.color === 1) {
		  drawLockToken(context, center.x, center.y, iconSize, alpha * 0.7, iconColor);
		} else {
		  drawShieldToken(
			context,
			center.x,
			center.y,
			iconSize,
			alpha * 0.65,
			iconColor,
			box.color !== 2,
		  );
		}
	  }
	}
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
	const alpha =
	  trace.alpha *
	  visibleDepthAlpha(relativeZ) *
	  (0.27 + depth * 1.16) *
	  coreClarityGain(startPoint.x, startPoint.y, width, height);
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
		seededPulse *
		coreClarityGain(point.x, point.y, width, height);
	  if (alpha < 0.018) {
		continue;
	  }

	  const glyph = CIPHER_GLYPHS[
		Math.abs(stream.seed + index * 17) % CIPHER_GLYPHS.length
	  ];
	  const violetCipher = (stream.seed + index * 13) % 9 < 2;
	  if (fontSize < 3.35) {
		const size = clamp(fontSize * 0.52, 0.7, 2.7);
		context.fillStyle = violetCipher
		  ? `rgba(156, 102, 255, ${alpha * 0.72})`
		  : `rgba(91, 240, 224, ${alpha * 0.78})`;
		context.fillRect(point.x - size * 0.5, point.y - size * 0.5, size, size);
		continue;
	  }

	  context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
	  if (point.z < 7.5) {
		context.shadowColor = violetCipher
		  ? 'rgba(155, 87, 255, 0.94)'
		  : 'rgba(55, 239, 222, 0.94)';
		context.shadowBlur = clamp((8 - point.z) * 3.1, 0, 18);
	  } else {
		context.shadowBlur = 0;
	  }
	  context.fillStyle = violetCipher
		? `rgba(189, 151, 255, ${alpha})`
		: `rgba(143, 255, 238, ${alpha})`;
	  context.fillText(glyph, point.x, point.y);
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
	const coreGain = coreClarityGain(point.x, point.y, width, height);
	const alpha = Math.min(
	  1,
	  spark.alpha *
	  visibleDepthAlpha(point.z) *
	  (0.42 + depth * 1.1) *
	  pulse *
	  coreGain,
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
	if (spark.color === 2) {
	  context.beginPath();
	  context.moveTo(point.x - size * 0.5, point.y - size * 0.5);
	  context.lineTo(point.x + size * 0.5, point.y + size * 0.5);
	  context.moveTo(point.x + size * 0.5, point.y - size * 0.5);
	  context.lineTo(point.x - size * 0.5, point.y + size * 0.5);
	  context.strokeStyle = colorFor(spark.color, alpha);
	  context.lineWidth = Math.max(1, size * 0.25);
	  context.stroke();
	} else if (spark.color === 1) {
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
  smoothstep(NEAR + 0.22, NEAR + 0.43, z) *
  (1 - smoothstep(farStart, farStart + 1.45, z));

const drawHorizontalGate = (
  context: CanvasRenderingContext2D,
  cameraZ: number,
  width: number,
  height: number,
  worldZ: number,
  variant: number,
): void => {
  const z = worldZ - cameraZ;
  const alphaWindow = gateAlpha(z, 1.8);
  if (alphaWindow <= 0.002) {
	return;
  }

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let index = -7; index <= 7; index++) {
	const x = index * 0.37 + Math.sin(index * 1.41 + variant) * 0.07;
	const y = 0.53 + Math.cos(index * 0.62 + variant * 0.3) * 0.12;
	const localZ = worldZ + Math.abs(index) * 0.17 + ((index * index + variant) % 3) * 0.035;
	const point = project({x, y, z: localZ}, cameraZ, width, height);
	const tail = project({x, y, z: localZ + 0.46}, cameraZ, width, height);
	if (!point) {
	  continue;
	}
	const fontSize = clamp(0.32 * point.scale, 15, 194);
	const local = 0.7 + 0.3 * Math.sin(index * 1.93 + variant * 2.1);
	const hierarchy = Math.abs(index) <= 1 ? 1 : 0.38;
	const alpha = alphaWindow * local * hierarchy;

	const denied = (index + variant * 2 + 17) % 11 === 0;
	const encrypted = (index + variant + 19) % 4 === 0;
	const tokenColor = denied
	  ? 'rgb(255, 45, 126)'
	  : encrypted
		? 'rgb(167, 105, 255)'
		: 'rgb(104, 252, 232)';

	if (tail) {
	  context.beginPath();
	  context.moveTo(tail.x, tail.y);
	  context.lineTo(point.x, point.y);
	  context.strokeStyle = denied
		? `rgba(255, 45, 126, ${alpha * 0.42})`
		: encrypted
		  ? `rgba(154, 92, 255, ${alpha * 0.42})`
		  : `rgba(69, 236, 218, ${alpha * 0.42})`;
	  context.lineWidth = clamp(fontSize * 0.08, 1.2, 15);
	  context.stroke();
	}

	const tokenSize = fontSize * 0.78;
	const tokenKind = Math.abs(index + variant * 2) % 3;
	if (tokenKind === 0) {
	  drawShieldToken(
		context,
		point.x,
		point.y,
		tokenSize,
		alpha * 0.96,
		tokenColor,
		!denied,
	  );
	} else if (tokenKind === 1) {
	  drawLockToken(
		context,
		point.x,
		point.y,
		tokenSize,
		alpha * 0.96,
		tokenColor,
	  );
	} else {
	  const glyph = CIPHER_GLYPHS[(index + variant * 3 + 24) % CIPHER_GLYPHS.length];
	  drawCipherToken(
		context,
		point.x,
		point.y,
		tokenSize,
		alpha * 0.96,
		tokenColor,
		glyph,
	  );
	}
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
  const alphaWindow = gateAlpha(z, 1.1);
  if (alphaWindow <= 0.002) {
	return;
  }

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let index = -2; index <= 2; index++) {
	const y = index * 0.65 + 0.18;
	const xOffsets = [-0.18, -0.10, -0.08, 0.28, 0.12] as const;
	const x = xOffsets[index + 2] + Math.sin(index * 0.8 + variant) * 0.025;
	const depthOffsets = [1.2, 0.7, 0, 0.08, 1.0] as const;
	const localZ = worldZ + depthOffsets[index + 2];
	const point = project({x, y, z: localZ}, cameraZ, width, height);
	const tail = project({x, y, z: localZ + 0.52}, cameraZ, width, height);
	if (!point) {
	  continue;
	}
	const fontSize = clamp(0.39 * point.scale, 18, 218);
	const local = 0.68 + 0.32 * Math.cos(index * 1.37 + variant);
	const alpha = alphaWindow * local;

	const denied = (index + variant + 9) % 7 === 0;
	const tokenColor = denied
	  ? 'rgb(255, 45, 126)'
	  : index % 2 === 0
		? 'rgb(177, 116, 255)'
		: 'rgb(106, 252, 231)';

	if (tail) {
	  context.beginPath();
	  context.moveTo(tail.x, tail.y);
	  context.lineTo(point.x, point.y);
	  context.strokeStyle = denied
		? `rgba(255, 45, 126, ${alpha * 0.5})`
		: index % 2 === 0
		  ? `rgba(158, 92, 255, ${alpha * 0.5})`
		  : `rgba(66, 236, 217, ${alpha * 0.5})`;
	  context.lineWidth = clamp(fontSize * 0.09, 1.4, 19);
	  context.stroke();
	}

	const tokenSize = fontSize * 1.42;
	if ((index + variant) % 2 === 0) {
	  drawShieldToken(
		context,
		point.x,
		point.y,
		tokenSize,
		alpha,
		tokenColor,
		!denied,
	  );
	} else {
	  drawLockToken(
		context,
		point.x,
		point.y,
		tokenSize,
		alpha,
		tokenColor,
	  );
	}
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
  const horizontalPeakDepth = 1.32;
  const verticalPeakDepth = 1.32;

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
  vignette.addColorStop(0, 'rgba(4, 4, 22, 0.02)');
  vignette.addColorStop(0.62, 'rgba(3, 3, 18, 0.04)');
  vignette.addColorStop(1, 'rgba(1, 1, 9, 0.62)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  const random = makeRandom(610006 + frame * 977);
  const grainCount = Math.round((width * height) / 3600);
  context.fillStyle = 'rgba(165, 143, 255, 0.052)';
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
  drawPolicyBoundaries(context, cameraZ, width, height);
  drawWireBoxes(context, cameraZ, width, height);
  drawDataTraces(context, cameraZ, width, height);
  drawDataStreams(context, cameraZ, width, height, frame);
  drawSparks(context, cameraZ, width, height, frame);
  drawForegroundPasses(context, cameraZ, width, height);
  drawBloom(context, width, height);
  drawFinishing(context, width, height, frame);
};

const ZeroTrustTunnelCanvas: React.FC = () => {
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
		backgroundColor: '#03030f',
		overflow: 'hidden',
	  }}
	>
	  <ZeroTrustTunnelCanvas />
	</AbsoluteFill>
  );
};
