import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type AlertKind = "error" | "warning" | "info";

type DialogSpec = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  appear: number;
  kind: AlertKind;
  titleIndex: number;
  messageIndex: number;
  buttonIndex: number;
  seed: number;
  direction: 1 | -1;
};

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const hash = (seed: number) => {
  const value = Math.sin(seed * 91.734 + 17.319) * 43758.5453;
  return value - Math.floor(value);
};

const TITLES = [
  "System Alert",
  "Runtime Failure",
  "Application Error",
  "Critical Process",
  "Device Warning",
  "Memory Exception",
  "Security Service",
  "Storage Error",
  "Network Failure",
  "Operation Failed",
  "Access Denied",
  "Error Details",
  "Kernel Notice",
  "Service Manager",
];

const MESSAGES = [
  "The requested operation could not be completed. Close the application and try again.",
  "A critical component stopped responding. Error code: 0xC004F21.",
  "The instruction referenced unavailable memory. The process will be terminated.",
  "Unable to initialize this service because a required system file is missing.",
  "An unexpected exception occurred while processing the current request.",
  "The device did not respond within the required time. Check the connection.",
  "System resources are critically low. Save your work before continuing.",
  "The selected volume cannot be accessed. Data integrity could not be verified.",
  "Connection to the remote service was interrupted. No response was received.",
  "The operation contains invalid parameters and cannot be completed safely.",
  "Permission was denied by the security service. Contact an administrator.",
  "The application encountered an unknown fault and must close immediately.",
  "Background protection could not start because a dependency has failed.",
  "The system detected conflicting instructions. Restart may be required.",
];

const BUTTONS = [
  ["OK"],
  ["Cancel", "Retry"],
  ["Ignore", "Close"],
  ["Abort", "Retry", "Ignore"],
  ["Details", "Close"],
  ["Wait", "End Task"],
];

const FIRST_DIALOGS: DialogSpec[] = [
  {id: "initial-01", x: 498, y: 573, width: 595, height: 222, appear: 0.24, kind: "error", titleIndex: 9, messageIndex: 3, buttonIndex: 0, seed: 11, direction: 1},
  {id: "initial-02", x: 1260, y: 548, width: 620, height: 170, appear: 0.48, kind: "warning", titleIndex: 0, messageIndex: 13, buttonIndex: 5, seed: 23, direction: -1},
  {id: "initial-03", x: 1012, y: 245, width: 675, height: 178, appear: 0.68, kind: "warning", titleIndex: 2, messageIndex: 2, buttonIndex: 0, seed: 31, direction: 1},
  {id: "initial-04", x: 120, y: 78, width: 760, height: 166, appear: 0.84, kind: "error", titleIndex: 7, messageIndex: 7, buttonIndex: 3, seed: 43, direction: -1},
  {id: "initial-05", x: 884, y: 78, width: 500, height: 154, appear: 1.08, kind: "error", titleIndex: 1, messageIndex: 11, buttonIndex: 0, seed: 59, direction: 1},
  {id: "initial-06", x: 102, y: 362, width: 500, height: 178, appear: 1.28, kind: "warning", titleIndex: 4, messageIndex: 6, buttonIndex: 2, seed: 67, direction: -1},
  {id: "initial-07", x: 690, y: 805, width: 700, height: 190, appear: 1.60, kind: "error", titleIndex: 1, messageIndex: 0, buttonIndex: 0, seed: 79, direction: 1},
  {id: "initial-08", x: 1320, y: 32, width: 610, height: 162, appear: 1.84, kind: "info", titleIndex: 6, messageIndex: 12, buttonIndex: 0, seed: 83, direction: -1},
  {id: "initial-09", x: 38, y: 768, width: 570, height: 220, appear: 2.16, kind: "info", titleIndex: 11, messageIndex: 4, buttonIndex: 0, seed: 97, direction: 1},
  {id: "initial-10", x: 660, y: 412, width: 610, height: 170, appear: 2.48, kind: "warning", titleIndex: 4, messageIndex: 9, buttonIndex: 2, seed: 101, direction: -1},
];

const GRID_ORDER = Array.from({length: 42}, (_, index) => index).sort(
  (a, b) => hash(a * 47 + 9) - hash(b * 47 + 9),
);

const GRID_DIALOGS: DialogSpec[] = GRID_ORDER.map((cellIndex, order) => {
  const col = cellIndex % 7;
  const row = Math.floor(cellIndex / 7);
  const seed = 200 + cellIndex * 31;
  const group = Math.floor(order / 3);
  const withinGroup = order % 3;
  const kindValue = hash(seed + 19);
  const kind: AlertKind =
    kindValue < 0.58 ? "error" : kindValue < 0.84 ? "warning" : "info";
  return {
    id: `grid-${String(cellIndex).padStart(2, "0")}`,
    x: col * (DESIGN_WIDTH / 7) - 86 + (hash(seed + 1) - 0.5) * 52,
    y: row * 180 - 34 + (hash(seed + 3) - 0.5) * 28,
    width: 448 + (hash(seed + 5) - 0.5) * 72,
    height: 216 + (hash(seed + 7) - 0.5) * 32,
    appear: 2.72 + group * 0.25 + withinGroup * 0.045,
    kind,
    titleIndex: Math.floor(hash(seed + 11) * TITLES.length),
    messageIndex: Math.floor(hash(seed + 13) * MESSAGES.length),
    buttonIndex: Math.floor(hash(seed + 17) * BUTTONS.length),
    seed,
    direction: hash(seed + 23) > 0.5 ? 1 : -1,
  };
});

// Once the base grid has covered the canvas, fresh alerts keep printing above
// it for the rest of the 15-second composition. The final alert starts on
// frame 889 and completes its 10-frame smear entrance on frame 899, avoiding
// the long static hold that the earlier 8-second schedule produced.
const OVERFLOW_DIALOG_COUNT = 58;
const OVERFLOW_START = 6.1;
const OVERFLOW_END = 14.82;

const OVERFLOW_DIALOGS: DialogSpec[] = Array.from(
  {length: OVERFLOW_DIALOG_COUNT},
  (_, index) => {
    const seed = 1800 + index * 73;
    const width = 430 + hash(seed + 3) * 245;
    const height = 158 + hash(seed + 5) * 82;
    const progress = index / (OVERFLOW_DIALOG_COUNT - 1);
    const kindValue = hash(seed + 19);
    const kind: AlertKind =
      kindValue < 0.67 ? "error" : kindValue < 0.9 ? "warning" : "info";

    return {
      id: `overflow-${String(index).padStart(2, "0")}`,
      x: -54 + hash(seed + 7) * (DESIGN_WIDTH - width + 108),
      y: -28 + hash(seed + 11) * (DESIGN_HEIGHT - height + 56),
      width,
      height,
      appear: OVERFLOW_START + (OVERFLOW_END - OVERFLOW_START) * progress,
      kind,
      titleIndex: Math.floor(hash(seed + 13) * TITLES.length),
      messageIndex: Math.floor(hash(seed + 17) * MESSAGES.length),
      buttonIndex: Math.floor(hash(seed + 23) * BUTTONS.length),
      seed,
      direction: hash(seed + 29) > 0.5 ? 1 : -1,
    };
  },
);

const DIALOGS = [...FIRST_DIALOGS, ...GRID_DIALOGS, ...OVERFLOW_DIALOGS];

const StatusIcon: React.FC<{kind: AlertKind; size: number}> = ({kind, size}) => {
  if (kind === "warning") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="warning-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe55a" />
            <stop offset="1" stopColor="#e0a900" />
          </linearGradient>
        </defs>
        <path d="M32 4 61 58H3L32 4Z" fill="url(#warning-gradient)" stroke="#a77800" strokeWidth="2" />
        <rect x="29" y="19" width="6" height="23" rx="2" fill="#282000" />
        <circle cx="32" cy="50" r="3.5" fill="#282000" />
      </svg>
    );
  }

  if (kind === "info") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="29" fill="#5255d5" stroke="#272b9e" strokeWidth="2" />
        <circle cx="32" cy="18" r="4" fill="white" />
        <rect x="28.5" y="27" width="7" height="23" rx="2" fill="white" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="error-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f54d54" />
          <stop offset="1" stopColor="#c31224" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="url(#error-gradient)" stroke="#9b0d1a" strokeWidth="2" />
      <path d="m18 18 28 28M46 18 18 46" stroke="white" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
};

const WindowSurface: React.FC<{spec: DialogSpec}> = ({spec}) => {
  const buttons = BUTTONS[spec.buttonIndex % BUTTONS.length];
  const iconSize = Math.min(64, Math.max(44, spec.height * 0.31));
  const bodyHeight = spec.height - 31;

  return (
    <div
      style={{
        width: spec.width,
        height: spec.height,
        overflow: "hidden",
        border: "2px solid #66699a",
        backgroundColor: "#e9e9ed",
        boxSizing: "border-box",
        boxShadow: "8px 9px 0 rgba(0, 0, 0, 0.48)",
        fontFamily: "Tahoma, Verdana, Arial, sans-serif",
        color: "#17171b",
      }}
    >
      <div
        style={{
          height: 29,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 10,
          boxSizing: "border-box",
          background: "linear-gradient(90deg, #3d43c7 0%, #5960df 68%, #3b3fb2 100%)",
          borderBottom: "1px solid #272c99",
          color: "white",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: 0.05,
          textShadow: "1px 1px 0 rgba(0,0,0,0.55)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8}}>
          {TITLES[spec.titleIndex % TITLES.length]}
        </span>
        <span
          style={{
            width: 27,
            height: 25,
            marginRight: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "white",
            fontSize: 20,
            lineHeight: 1,
            background: "linear-gradient(#ef555e, #b70b1d)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxSizing: "border-box",
            textShadow: "1px 1px 0 #690512",
          }}
        >
          ×
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: bodyHeight,
          display: "grid",
          gridTemplateColumns: `${iconSize + 28}px 1fr`,
          alignItems: "start",
          padding: "17px 18px 43px 16px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #f5f5f7 0%, #e1e1e6 100%)",
        }}
      >
        <div style={{display: "flex", justifyContent: "center", paddingTop: 1}}>
          <StatusIcon kind={spec.kind} size={iconSize} />
        </div>
        <div
          style={{
            padding: "1px 4px 0 4px",
            fontSize: 16,
            lineHeight: 1.28,
            maxHeight: Math.max(40, bodyHeight - 66),
            overflow: "hidden",
          }}
        >
          {MESSAGES[spec.messageIndex % MESSAGES.length]}
          <div style={{marginTop: 5, fontSize: 13, color: "#51515a"}}>
            Reference: SYS-{String(spec.seed * 17).slice(-5).padStart(5, "0")}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 17,
            bottom: 12,
            display: "flex",
            gap: 10,
          }}
        >
          {buttons.map((button) => (
            <div
              key={button}
              style={{
                minWidth: 82,
                height: 27,
                padding: "0 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                background: "linear-gradient(#f7f7f7, #c7c7cb)",
                borderTop: "2px solid white",
                borderLeft: "2px solid white",
                borderRight: "2px solid #74747a",
                borderBottom: "2px solid #74747a",
                fontSize: 13,
                color: "#1f1f23",
                whiteSpace: "nowrap",
              }}
            >
              {button}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DialogWindow: React.FC<{spec: DialogSpec; frame: number; order: number}> = ({
  spec,
  frame,
  order,
}) => {
  const appearFrame = Math.round(spec.appear * 60);
  const localFrame = frame - appearFrame;
  if (localFrame < 0) return null;

  const progress = clamp(localFrame / 10);
  const expansion = interpolate(
    progress,
    [0, 0.24, 0.58, 0.82, 1],
    [0.18, 0.72, 1.12, 0.96, 1],
    {easing: Easing.out(Easing.cubic)},
  );
  const horizontalTravel = (1 - progress) * spec.direction * 42;
  const sliceStep = Math.min(5, Math.floor(progress * 7));
  const verticalJitter =
    progress < 0.88 ? (hash(spec.seed + sliceStep * 17) - 0.5) * 12 : 0;
  const fragmentOpacity = clamp(1 - progress * 1.05);
  const origin = spec.direction > 0 ? "0% 50%" : "100% 50%";

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: spec.x,
          top: spec.y,
          width: spec.width,
          height: spec.height,
          zIndex: 100 + order,
          transform: `translate(${horizontalTravel}px, ${verticalJitter}px) scaleX(${expansion})`,
          transformOrigin: origin,
          filter:
            progress < 1
              ? `contrast(${1 + (1 - progress) * 0.42}) brightness(${1 + (1 - progress) * 0.12})`
              : "none",
          willChange: "transform, filter",
        }}
      >
        <WindowSurface spec={spec} />
      </div>

      {progress < 1 &&
        Array.from({length: 6}, (_, sliceIndex) => {
          const top = sliceIndex * (100 / 6);
          const bottom = 100 - (sliceIndex + 1) * (100 / 6);
          const offset =
            (hash(spec.seed * 7 + sliceIndex * 29 + sliceStep * 13) - 0.5) *
            (68 * (1 - progress) + 10);
          const sliceStretch = expansion * (0.94 + hash(spec.seed + sliceIndex) * 0.18);
          return (
            <div
              key={`${spec.id}-slice-${sliceIndex}`}
              style={{
                position: "absolute",
                left: spec.x,
                top: spec.y,
                width: spec.width,
                height: spec.height,
                zIndex: 2100 + order,
                clipPath: `inset(${top}% 0 ${bottom}% 0)`,
                transform: `translateX(${horizontalTravel + offset}px) scaleX(${sliceStretch})`,
                transformOrigin: origin,
                opacity: 0.36 + fragmentOpacity * 0.64,
                filter: `contrast(${1.18 + fragmentOpacity * 0.35}) saturate(${1.08 + fragmentOpacity * 0.35})`,
                pointerEvents: "none",
              }}
            >
              <WindowSurface spec={spec} />
            </div>
          );
        })}

      {progress < 0.92 &&
        Array.from({length: 10}, (_, streakIndex) => {
          const streakSeed = spec.seed * 41 + streakIndex * 23 + sliceStep * 5;
          const isTitle = streakIndex < 3;
          const streakWidth =
            (44 + hash(streakSeed + 3) * 155) * (1 - progress * 0.72);
          return (
            <div
              key={`${spec.id}-streak-${streakIndex}`}
              style={{
                position: "absolute",
                left:
                  spec.x +
                  (spec.direction > 0
                    ? -streakWidth * (0.18 + hash(streakSeed + 7) * 0.7)
                    : spec.width - streakWidth * (0.1 + hash(streakSeed + 7) * 0.28)),
                top: spec.y + 3 + hash(streakSeed + 11) * (spec.height - 8),
                width: streakWidth,
                height: 2 + Math.floor(hash(streakSeed + 17) * 5),
                zIndex: 2050 + order,
                opacity: fragmentOpacity * (0.44 + hash(streakSeed + 19) * 0.46),
                background: isTitle
                  ? "linear-gradient(90deg, transparent, #575fe4 26%, #d9d9f1 100%)"
                  : "linear-gradient(90deg, transparent, #f5f5f5 32%, #a9a9b6 100%)",
                boxShadow: isTitle ? "0 0 4px rgba(81, 88, 230, 0.8)" : "none",
                transform: `translateX(${spec.direction * (1 - progress) * 35}px)`,
                pointerEvents: "none",
              }}
            />
          );
        })}
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scaleX = width / DESIGN_WIDTH;
  const scaleY = height / DESIGN_HEIGHT;
  const activeCount = DIALOGS.reduce(
    (count, dialog) => count + (frame >= Math.round(dialog.appear * 60) ? 1 : 0),
    0,
  );
  const overload = clamp((activeCount - 38) / 14);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020204",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
          background:
            "radial-gradient(circle at 50% 48%, rgba(13,13,22,0.5) 0%, rgba(3,3,7,0.35) 42%, #010103 100%)",
        }}
      >
        {DIALOGS.map((dialog, index) => (
          <DialogWindow key={dialog.id} spec={dialog} frame={frame} order={index} />
        ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5000,
            pointerEvents: "none",
            opacity: overload * 0.12,
            background:
              "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)",
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
