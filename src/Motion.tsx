import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

// Internet asset source: Google Material Symbols, icons "man" (Rounded)
// and "person" (Rounded, filled): https://fonts.google.com/icons
// License: Apache License 2.0, documented by Google at:
// https://developers.google.com/fonts/docs/material_symbols#licensing
const MAN_PATH =
  "M420-110v-250h-50q-12.75 0-21.37-8.63Q340-377.25 340-390v-223q0-24.75 17.63-42.38Q375.25-673 400-673h160q24.75 0 42.38 17.62Q620-637.75 620-613v223q0 12.75-8.62 21.37Q602.75-360 590-360h-50v250q0 12.75-8.65 21.37Q522.71-80 509.93-80h-60.15Q437-80 428.5-88.63 420-97.25 420-110Zm60.08-624q-30.08 0-51.58-21.42t-21.5-51.5q0-30.08 21.42-51.58t51.5-21.5q30.08 0 51.58 21.42t21.5 51.5q0 30.08-21.42 51.58t-51.5 21.5Z";

const PERSON_PATH =
  "M372-523q-42-42-42-108t42-108q42-42 108-42t108 42q42 42 42 108t-42 108q-42 42-108 42t-108-42ZM160-220v-34q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5T731-360q31 14 50 41t19 65v34q0 25-17.5 42.5T740-160H220q-25 0-42.5-17.5T160-220Z";

type ThemeName = "obsidian" | "pearl" | "midnight";
type IconKind = "full" | "business";

type Theme = {
  background: string;
  stage: string;
  stageBorder: string;
  grid: string;
  inactive: string;
  inactiveEdge: string;
  activeA: string;
  activeB: string;
  activeC: string;
  text: string;
  textMuted: string;
  shadow: string;
  vignette: string;
  arc: string;
  highlight: string;
};

const THEMES: Record<ThemeName, Theme> = {
  obsidian: {
    background:
      "radial-gradient(circle at 50% 42%, #183144 0%, #0a1723 32%, #03080e 70%, #010306 100%)",
    stage:
      "linear-gradient(145deg, rgba(34,68,87,0.30), rgba(6,16,24,0.56) 54%, rgba(2,7,11,0.78))",
    stageBorder: "rgba(150,220,242,0.20)",
    grid: "rgba(91,184,215,0.085)",
    inactive: "rgba(100,129,145,0.30)",
    inactiveEdge: "rgba(164,199,214,0.18)",
    activeA: "#f7fcff",
    activeB: "#a7f3ff",
    activeC: "#4ddfff",
    text: "#f5fbff",
    textMuted: "rgba(189,218,230,0.42)",
    shadow: "rgba(33,223,255,0.34)",
    vignette: "rgba(0,0,0,0.68)",
    arc: "rgba(95,215,245,0.20)",
    highlight: "rgba(202,246,255,0.46)",
  },
  pearl: {
    background:
      "radial-gradient(circle at 50% 40%, #ffffff 0%, #eef4f7 42%, #d9e2e7 75%, #c9d2d9 100%)",
    stage:
      "linear-gradient(145deg, rgba(255,255,255,0.82), rgba(237,244,248,0.78) 58%, rgba(211,223,230,0.72))",
    stageBorder: "rgba(75,108,128,0.18)",
    grid: "rgba(56,102,132,0.065)",
    inactive: "rgba(110,126,126,0.28)",
    inactiveEdge: "rgba(88,105,108,0.17)",
    activeA: "#7be7ff",
    activeB: "#189cff",
    activeC: "#0868d9",
    text: "#17313e",
    textMuted: "rgba(31,66,82,0.35)",
    shadow: "rgba(15,131,226,0.32)",
    vignette: "rgba(58,80,94,0.14)",
    arc: "rgba(16,132,208,0.17)",
    highlight: "rgba(255,255,255,0.95)",
  },
  midnight: {
    background:
      "radial-gradient(circle at 50% 42%, #193a42 0%, #091c25 35%, #031016 72%, #01070b 100%)",
    stage:
      "linear-gradient(145deg, rgba(30,72,79,0.34), rgba(6,25,31,0.60) 54%, rgba(2,12,16,0.82))",
    stageBorder: "rgba(132,236,221,0.21)",
    grid: "rgba(69,192,178,0.08)",
    inactive: "rgba(95,129,131,0.28)",
    inactiveEdge: "rgba(145,190,188,0.16)",
    activeA: "#ecfff9",
    activeB: "#73f5cf",
    activeC: "#29c9be",
    text: "#edfff9",
    textMuted: "rgba(181,224,215,0.40)",
    shadow: "rgba(53,236,202,0.34)",
    vignette: "rgba(0,0,0,0.68)",
    arc: "rgba(80,228,205,0.19)",
    highlight: "rgba(201,255,245,0.44)",
  },
};

const STAGES = [
  {
    start: 3,
    progressEnd: 257,
    end: 270,
    theme: "obsidian" as const,
    icon: "full" as const,
  },
  {
    start: 291,
    progressEnd: 548,
    end: 565,
    theme: "pearl" as const,
    icon: "full" as const,
  },
  {
    start: 593,
    progressEnd: 850,
    end: 899,
    theme: "midnight" as const,
    icon: "business" as const,
  },
] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const getBackdropTheme = (frame: number): ThemeName => {
  if (frame < 291) return "obsidian";
  if (frame < 568) return "pearl";
  return "midnight";
};

const PremiumBackdrop: React.FC<{themeName: ThemeName}> = ({themeName}) => {
  const theme = THEMES[themeName];

  return (
    <AbsoluteFill style={{background: theme.background, overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          maskImage:
            "radial-gradient(ellipse 60% 54% at 50% 48%, #000 0%, rgba(0,0,0,0.64) 57%, transparent 91%)",
          opacity: 0.82,
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
      >
        <defs>
          <linearGradient id={`arc-${themeName}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={theme.arc} stopOpacity="0" />
            <stop offset="0.48" stopColor={theme.arc} stopOpacity="1" />
            <stop offset="1" stopColor={theme.arc} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`floor-${themeName}`}>
            <stop offset="0" stopColor={theme.activeB} stopOpacity="0.16" />
            <stop offset="0.55" stopColor={theme.activeC} stopOpacity="0.055" />
            <stop offset="1" stopColor={theme.activeC} stopOpacity="0" />
          </radialGradient>
          <filter id={`blur-${themeName}`} x="-40%" y="-100%" width="180%" height="300%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>

        <ellipse
          cx="960"
          cy="775"
          rx="700"
          ry="155"
          fill={`url(#floor-${themeName})`}
          filter={`url(#blur-${themeName})`}
        />
        <path
          d="M245 540 C395 245 1525 245 1675 540"
          fill="none"
          stroke={`url(#arc-${themeName})`}
          strokeWidth="1.2"
        />
        <path
          d="M335 590 C470 340 1450 340 1585 590"
          fill="none"
          stroke={`url(#arc-${themeName})`}
          strokeWidth="1"
          opacity="0.62"
        />
        <path
          d="M290 778 C590 832 1330 832 1630 778"
          fill="none"
          stroke={`url(#arc-${themeName})`}
          strokeWidth="1"
          opacity="0.52"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 300,
          top: 185,
          width: 1320,
          height: 700,
          borderRadius: 46,
          border: `1px solid ${theme.stageBorder}`,
          background: theme.stage,
          boxShadow: `inset 0 1px 0 ${theme.highlight}, inset 0 -1px 0 rgba(0,0,0,0.20), 0 38px 120px rgba(0,0,0,0.20)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -240,
            top: -310,
            width: 1150,
            height: 590,
            transform: "rotate(-14deg)",
            background:
              "linear-gradient(115deg, transparent 26%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0.025) 62%, transparent 78%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 86,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.stageBorder}, transparent)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            bottom: 86,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${theme.stageBorder}, transparent)`,
          }}
        />

        {[0, 1, 2, 3].map((corner) => (
          <div
            key={corner}
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              left: corner % 2 === 0 ? 28 : undefined,
              right: corner % 2 === 1 ? 28 : undefined,
              top: corner < 2 ? 28 : undefined,
              bottom: corner >= 2 ? 28 : undefined,
              borderLeft: corner % 2 === 0 ? `2px solid ${theme.stageBorder}` : undefined,
              borderRight: corner % 2 === 1 ? `2px solid ${theme.stageBorder}` : undefined,
              borderTop: corner < 2 ? `2px solid ${theme.stageBorder}` : undefined,
              borderBottom: corner >= 2 ? `2px solid ${theme.stageBorder}` : undefined,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 220px ${theme.vignette}`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

const MaterialPersonIcon: React.FC<{
  kind: IconKind;
  fill: string;
  stroke?: string;
  style?: React.CSSProperties;
}> = ({kind, fill, stroke, style}) => (
  <svg
    viewBox={kind === "full" ? "300 -930 360 870" : "120 -820 720 700"}
    style={{display: "block", overflow: "visible", ...style}}
    aria-hidden="true"
  >
    <path
      d={kind === "full" ? MAN_PATH : PERSON_PATH}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 8 : 0}
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const ICON_WIDTH = 110;
const ICON_GAP = 45;
const ROW_WIDTH = ICON_WIDTH * 6 + ICON_GAP * 5;

const IconRow: React.FC<{
  kind: IconKind;
  fill: string;
  edge?: string;
  active?: boolean;
  theme: Theme;
}> = ({kind, fill, edge, active = false, theme}) => {
  const iconHeight = kind === "full" ? 224 : 170;
  const iconTop = kind === "full" ? 0 : 18;
  const iconWidth = kind === "full" ? ICON_WIDTH : 140;
  const iconLeft = (ICON_WIDTH - iconWidth) / 2;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        gap: ICON_GAP,
        alignItems: "flex-start",
      }}
    >
      {Array.from({length: 6}).map((_, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            width: ICON_WIDTH,
            height: 244,
            flex: `0 0 ${ICON_WIDTH}px`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              bottom: 0,
              height: 14,
              borderRadius: "50%",
              background: active ? theme.activeB : theme.inactive,
              opacity: active ? 0.19 : 0.13,
              filter: "blur(10px)",
            }}
          />
          <MaterialPersonIcon
            kind={kind}
            fill={fill}
            stroke={edge}
            style={{
              position: "absolute",
              left: iconLeft,
              top: iconTop,
              width: iconWidth,
              height: iconHeight,
              filter: active
                ? `drop-shadow(0 0 12px ${theme.shadow}) drop-shadow(0 16px 24px rgba(0,0,0,0.18))`
                : "drop-shadow(0 12px 18px rgba(0,0,0,0.16))",
            }}
          />
        </div>
      ))}
    </div>
  );
};

const ProgressStage: React.FC<{
  frame: number;
  start: number;
  progressEnd: number;
  themeName: ThemeName;
  icon: IconKind;
}> = ({frame, start, progressEnd, themeName, icon}) => {
  const theme = THEMES[themeName];
  const progress = clamp01((frame - start) / (progressEnd - start));
  const percentage = progress >= 1 ? 100 : Math.floor(progress * 100);
  const completion = interpolate(
    frame,
    [progressEnd, progressEnd + 5, progressEnd + 12],
    [0, 1, 0.18],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const rowTop = 510;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 290,
          width: 520,
          height: 190,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.shadow} 0%, transparent 68%)`,
            filter: "blur(34px)",
            opacity: 0.12 + completion * 0.24,
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 152,
            lineHeight: 1,
            fontWeight: 300,
            letterSpacing: -7,
            fontVariantNumeric: "tabular-nums",
            color: theme.text,
            textShadow: `0 2px 0 rgba(255,255,255,0.08), 0 18px 55px ${theme.shadow}`,
          }}
        >
          {percentage}%
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: rowTop,
          width: ROW_WIDTH,
          height: 244,
          transform: "translateX(-50%)",
        }}
      >
        <IconRow
          kind={icon}
          fill={theme.inactive}
          edge={theme.inactiveEdge}
          theme={theme}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: progress * ROW_WIDTH,
            height: 244,
            overflow: "hidden",
          }}
        >
          <div style={{position: "absolute", left: 0, top: 0, width: ROW_WIDTH, height: 244}}>
            <svg width="0" height="0" style={{position: "absolute"}} aria-hidden="true">
              <defs>
                <linearGradient id={`active-${themeName}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={theme.activeA} />
                  <stop offset="0.48" stopColor={theme.activeB} />
                  <stop offset="1" stopColor={theme.activeC} />
                </linearGradient>
              </defs>
            </svg>
            <IconRow
              kind={icon}
              fill={`url(#active-${themeName})`}
              active
              theme={theme}
            />
          </div>
        </div>

        {progress > 0 && progress < 1 ? (
          <div
            style={{
              position: "absolute",
              left: progress * ROW_WIDTH - 1,
              top: icon === "full" ? 15 : 48,
              width: 2,
              height: icon === "full" ? 195 : 130,
              background: theme.activeA,
              boxShadow: `0 0 9px ${theme.activeA}, 0 0 24px ${theme.shadow}`,
              opacity: 0.52,
            }}
          />
        ) : null}

        {completion > 0 ? (
          <div
            style={{
              position: "absolute",
              left: -70,
              right: -70,
              top: icon === "full" ? -35 : -12,
              height: icon === "full" ? 290 : 220,
              borderRadius: "50%",
              border: `1px solid ${theme.activeB}`,
              opacity: completion * 0.34,
              boxShadow: `0 0 70px ${theme.shadow}, inset 0 0 50px ${theme.shadow}`,
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: icon === "full" ? 780 : 750,
          width: 1060,
          height: 1,
          transform: "translateX(-50%)",
          background: `linear-gradient(90deg, transparent, ${theme.textMuted} 14%, ${theme.highlight} 50%, ${theme.textMuted} 86%, transparent)`,
          opacity: 0.58,
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const backdropTheme = getBackdropTheme(frame);
  const activeStage = STAGES.find(
    (stage) => frame >= stage.start && frame <= stage.end,
  );

  return (
    <AbsoluteFill style={{backgroundColor: "#02060a", overflow: "hidden"}}>
      <PremiumBackdrop themeName={backdropTheme} />
      {activeStage ? (
        <ProgressStage
          frame={frame}
          start={activeStage.start}
          progressEnd={activeStage.progressEnd}
          themeName={activeStage.theme}
          icon={activeStage.icon}
        />
      ) : null}
    </AbsoluteFill>
  );
};
