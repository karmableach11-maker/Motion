import React, {useLayoutEffect, useMemo, useRef} from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const RAIL_X = 390;
const RAIL_Y = 752;
const RAIL_WIDTH = 1120;
const TRACK_SECONDS = 180;
const WHITE = "#f7f9ff";
const ACCENT = "#91a9ff";

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.min(TRACK_SECONDS, seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
};

const drawLetterSpacedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) => {
  let cursor = x;
  for (const glyph of text) {
    context.fillText(glyph, cursor, y);
    cursor += context.measureText(glyph).width + spacing;
  }
};

const drawBackground = (context: CanvasRenderingContext2D) => {
  const gradient = context.createRadialGradient(960, 550, 0, 960, 550, 1030);
  gradient.addColorStop(0, "#0c1019");
  gradient.addColorStop(0.42, "#07090e");
  gradient.addColorStop(0.78, "#030406");
  gradient.addColorStop(1, "#010203");
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);
};

const drawEqualizer = (context: CanvasRenderingContext2D, frame: number) => {
  const speeds = [0.041, 0.054, 0.034, 0.047, 0.038, 0.052, 0.043];
  speeds.forEach((speed, index) => {
    const wave = Math.sin(frame * speed + index * 1.17);
    const crossWave = Math.sin(frame * speed * 0.53 + index * 0.62);
    const height = 24 + (wave * 0.5 + 0.5) * 41 + (crossWave * 0.5 + 0.5) * 8;
    context.globalAlpha = 0.58 + index * 0.045;
    context.fillStyle = index === 3 ? ACCENT : WHITE;
    roundedRect(context, 622 + index * 15, 504 - height / 2, 6, height, 3);
    context.fill();
  });
  context.globalAlpha = 1;
};

const drawHeart = (context: CanvasRenderingContext2D) => {
  context.save();
  context.translate(1482, 653);
  context.beginPath();
  context.moveTo(26, 42.2);
  context.bezierCurveTo(23.3, 39.4, 7, 27.6, 7, 16.8);
  context.bezierCurveTo(7, 10.5, 11.9, 6, 17.7, 6);
  context.bezierCurveTo(21.5, 6, 24.4, 8, 26, 10.8);
  context.bezierCurveTo(27.6, 8, 30.5, 6, 34.3, 6);
  context.bezierCurveTo(40.1, 6, 45, 10.5, 45, 16.8);
  context.bezierCurveTo(45, 27.6, 28.7, 39.4, 26, 42.2);
  context.closePath();
  context.fillStyle = WHITE;
  context.fill();
  context.restore();
};

const configureLine = (context: CanvasRenderingContext2D) => {
  context.strokeStyle = WHITE;
  context.lineWidth = 3.2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalAlpha = 0.88;
};

const drawRepeat = (context: CanvasRenderingContext2D) => {
  context.save();
  context.translate(664, 851);
  configureLine(context);
  context.beginPath();
  context.moveTo(36.5, 14.5);
  context.lineTo(15.8, 14.5);
  context.bezierCurveTo(11.5, 14.5, 8, 18, 8, 22.3);
  context.lineTo(8, 26);
  context.moveTo(30.5, 8.8);
  context.lineTo(36.7, 14.5);
  context.lineTo(30.5, 20.2);
  context.moveTo(11.5, 33.5);
  context.lineTo(32.2, 33.5);
  context.bezierCurveTo(36.5, 33.5, 40, 30, 40, 25.7);
  context.lineTo(40, 22);
  context.moveTo(17.5, 39.2);
  context.lineTo(11.3, 33.5);
  context.lineTo(17.5, 27.8);
  context.stroke();
  context.restore();
};

const drawPrevious = (context: CanvasRenderingContext2D) => {
  context.save();
  context.translate(795, 853);
  context.fillStyle = WHITE;
  context.globalAlpha = 0.96;
  roundedRect(context, 8, 10, 4, 24, 2);
  context.fill();
  context.beginPath();
  context.moveTo(35, 10.8);
  context.lineTo(35, 33.2);
  context.lineTo(15.5, 22);
  context.closePath();
  context.fill();
  context.restore();
};

const drawNext = (context: CanvasRenderingContext2D) => {
  context.save();
  context.translate(1081, 853);
  context.fillStyle = WHITE;
  context.globalAlpha = 0.96;
  roundedRect(context, 32, 10, 4, 24, 2);
  context.fill();
  context.beginPath();
  context.moveTo(9, 10.8);
  context.lineTo(9, 33.2);
  context.lineTo(28.5, 22);
  context.closePath();
  context.fill();
  context.restore();
};

const drawPause = (context: CanvasRenderingContext2D) => {
  context.save();
  context.globalAlpha = 0.035;
  context.fillStyle = WHITE;
  context.beginPath();
  context.arc(960, 875, 54, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  context.beginPath();
  context.arc(960, 875, 42, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#090b10";
  roundedRect(context, 948, 859, 8, 32, 2.4);
  context.fill();
  roundedRect(context, 964, 859, 8, 32, 2.4);
  context.fill();
  context.restore();
};

const drawShuffle = (context: CanvasRenderingContext2D) => {
  context.save();
  context.translate(1206, 851);
  configureLine(context);
  context.beginPath();
  context.moveTo(7, 13);
  context.lineTo(13.8, 13);
  context.bezierCurveTo(23.2, 13, 27.3, 35, 37.8, 35);
  context.lineTo(44, 35);
  context.moveTo(38, 29);
  context.lineTo(44.7, 35);
  context.lineTo(38, 41);
  context.moveTo(7, 35);
  context.lineTo(13.8, 35);
  context.bezierCurveTo(23.2, 35, 27.3, 13, 37.8, 13);
  context.lineTo(44, 13);
  context.moveTo(38, 7);
  context.lineTo(44.7, 13);
  context.lineTo(38, 19);
  context.stroke();
  context.restore();
};

const drawFrame = (
  context: CanvasRenderingContext2D,
  frame: number,
  progress: number,
  currentSeconds: number,
) => {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground(context);
  drawEqualizer(context, frame);

  context.fillStyle = WHITE;
  context.globalAlpha = 1;
  context.font = "300 68px Arial, sans-serif";
  drawLetterSpacedText(context, "DEEP FOCUS", 770, 511, 8);
  context.globalAlpha = 0.5;
  context.font = "500 22px Arial, sans-serif";
  drawLetterSpacedText(context, "AMBIENT PRODUCTIVITY SESSION", 772, 555, 6);
  context.globalAlpha = 1;

  drawHeart(context);

  context.globalAlpha = 0.15;
  context.fillStyle = WHITE;
  roundedRect(context, RAIL_X, RAIL_Y, RAIL_WIDTH, 8, 4);
  context.fill();
  const activeWidth = Math.max(0.01, progress * RAIL_WIDTH);
  const scrubberX = RAIL_X + activeWidth;
  context.globalAlpha = 1;
  roundedRect(context, RAIL_X, RAIL_Y, activeWidth, 8, 4);
  context.fill();
  context.globalAlpha = 0.05;
  context.beginPath();
  context.arc(scrubberX, RAIL_Y + 4, 17, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  context.beginPath();
  context.arc(scrubberX, RAIL_Y + 4, 10, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = WHITE;
  context.font = "650 28px Arial, sans-serif";
  context.textAlign = "left";
  context.fillText(formatTime(currentSeconds), 362, 809);
  context.textAlign = "right";
  context.fillText("03:00", 1558, 809);
  context.textAlign = "left";

  drawRepeat(context);
  drawPrevious(context);
  drawPause(context);
  drawNext(context);
  drawShuffle(context);
  context.globalAlpha = 1;
};

const PlayerCanvas: React.FC<{
  frame: number;
  progress: number;
  currentSeconds: number;
}> = ({frame, progress, currentSeconds}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintHandle = useMemo(
    () => delayRender(`wait-for-canvas-paint-${frame}`),
    [frame],
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      continueRender(paintHandle);
      return;
    }
    const context = canvas.getContext("2d", {alpha: false});
    if (!context) {
      continueRender(paintHandle);
      return;
    }
    drawFrame(context, frame, progress, currentSeconds);
    const animationFrame = window.requestAnimationFrame(() => continueRender(paintHandle));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentSeconds, frame, paintHandle, progress]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{position: "absolute", inset: 0, width: WIDTH, height: HEIGHT}}
    />
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentSeconds = Math.min(TRACK_SECONDS, Math.round(progress * TRACK_SECONDS));

  return (
    <AbsoluteFill style={{width: WIDTH, height: HEIGHT, overflow: "hidden"}}>
      <PlayerCanvas frame={frame} progress={progress} currentSeconds={currentSeconds} />
    </AbsoluteFill>
  );
};
