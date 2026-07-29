import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Icon source: Phosphor Icons Core 2.1.1, Duotone weight.
// https://phosphoricons.com/ — MIT License.
type Side = "left" | "right";
type IconName = "bulb" | "head" | "target" | "briefcase" | "cloud" | "chart";

type Item = {
  side: Side;
  row: number;
  order: number;
  color: string;
  dark: string;
  icon: IconName;
  cardX: number;
  nodeX: number;
  y: number;
};

const ITEMS: Item[] = [
  {
    side: "left",
    row: 0,
    order: 0,
    color: "#12AEB1",
    dark: "#078C91",
    icon: "bulb",
    cardX: 145,
    nodeX: 710,
    y: 282,
  },
  {
    side: "left",
    row: 1,
    order: 2,
    color: "#258BA4",
    dark: "#176F8A",
    icon: "head",
    cardX: 65,
    nodeX: 650,
    y: 540,
  },
  {
    side: "left",
    row: 2,
    order: 4,
    color: "#285A72",
    dark: "#1E465D",
    icon: "target",
    cardX: 145,
    nodeX: 710,
    y: 798,
  },
  {
    side: "right",
    row: 0,
    order: 1,
    color: "#6987B8",
    dark: "#536F9D",
    icon: "briefcase",
    cardX: 1275,
    nodeX: 1210,
    y: 282,
  },
  {
    side: "right",
    row: 1,
    order: 3,
    color: "#465975",
    dark: "#37485F",
    icon: "cloud",
    cardX: 1355,
    nodeX: 1270,
    y: 540,
  },
  {
    side: "right",
    row: 2,
    order: 5,
    color: "#263440",
    dark: "#1B2731",
    icon: "chart",
    cardX: 1275,
    nodeX: 1210,
    y: 798,
  },
];

const COLORS = ITEMS.map((item) => item.color);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const smooth = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input, output, {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

const PHOSPHOR_PATHS: Record<
  IconName,
  {duotone: string; body: string}
> = {
  bulb: {
    duotone:
      "M208,104a79.86,79.86,0,0,1-30.59,62.92A24.29,24.29,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6a24.11,24.11,0,0,0-9.3-19A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24A80,80,0,0,1,208,104Z",
    body:
      "M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.5C39.74,56.83,78.26,17.15,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.64,71.64,0,0,0,27.64,56.3h0A32,32,0,0,1,96,186v6h24V147.31L90.34,117.66a8,8,0,0,1,11.32-11.32L128,132.69l26.34-26.35a8,8,0,0,1,11.32,11.32L136,147.31V192h24v-6a32.12,32.12,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z",
  },
  head: {
    duotone:
      "M240,124a48,48,0,0,1-32,45.27h0V176a40,40,0,0,1-80,0,40,40,0,0,1-80,0v-6.73h0a48,48,0,0,1,0-90.54V72a40,40,0,0,1,80,0,40,40,0,0,1,80,0v6.73A48,48,0,0,1,240,124Z",
    body:
      "M248,124a56.11,56.11,0,0,0-32-50.61V72a48,48,0,0,0-88-26.49A48,48,0,0,0,40,72v1.39a56,56,0,0,0,0,101.2V176a48,48,0,0,0,88,26.49A48,48,0,0,0,216,176v-1.41A56.09,56.09,0,0,0,248,124ZM88,208a32,32,0,0,1-31.81-28.56A55.87,55.87,0,0,0,64,180h8a8,8,0,0,0,0-16H64A40,40,0,0,1,50.67,86.27,8,8,0,0,0,56,78.73V72a32,32,0,0,1,64,0v68.26A47.8,47.8,0,0,0,88,128a8,8,0,0,0,0,16,32,32,0,0,1,0,64Zm104-44h-8a8,8,0,0,0,0,16h8a55.87,55.87,0,0,0,7.81-.56A32,32,0,1,1,168,144a8,8,0,0,0,0-16,47.8,47.8,0,0,0-32,12.26V72a32,32,0,0,1,64,0v6.73a8,8,0,0,0,5.33,7.54A40,40,0,0,1,192,164Zm16-52a8,8,0,0,1-8,8h-4a36,36,0,0,1-36-36V80a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4A8,8,0,0,1,208,112ZM60,120H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,84V80a8,8,0,0,1,16,0v4A36,36,0,0,1,60,120Z",
  },
  target: {
    duotone:
      "M176,128a48,48,0,1,1-48-48A48,48,0,0,1,176,128Z",
    body:
      "M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z",
  },
  briefcase: {
    duotone:
      "M224,118.31V200a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V118.31h0A191.14,191.14,0,0,0,128,144,191.08,191.08,0,0,0,224,118.31Z",
    body:
      "M104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112ZM232,72V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56H80V48a24,24,0,0,1,24-24h48a24,24,0,0,1,24,24v8h40A16,16,0,0,1,232,72ZM96,56h64V48a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8ZM40,72v41.62A184.07,184.07,0,0,0,128,136a184,184,0,0,0,88-22.39V72ZM216,200V131.63A200.25,200.25,0,0,1,128,152a200.19,200.19,0,0,1-88-20.36V200H216Z",
  },
  cloud: {
    duotone:
      "M240,128a80,80,0,0,1-80,80H72A56,56,0,1,1,85.92,97.74l0,.1A80,80,0,0,1,240,128Z",
    body:
      "M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z",
  },
  chart: {
    duotone: "M208,40V208H152V40Z",
    body:
      "M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z",
  },
};

const IconArt: React.FC<{
  name: IconName;
  accent: string;
  progress: number;
  activity: number;
  localFrame: number;
}> = ({name, accent, progress, activity, localFrame}) => {
  const pulse = (Math.sin(localFrame / 9) * 0.5 + 0.5) * activity;
  const motionByIcon: Record<IconName, string> = {
    bulb: `translate(128 128) scale(${1 + pulse * 0.055}) translate(-128 -128)`,
    head: `rotate(${Math.sin(localFrame / 16) * activity * 2.2} 128 128)`,
    target: `translate(${pulse * 2.4} ${-pulse * 2.4})`,
    briefcase: `translate(0 ${-pulse * 4})`,
    cloud: `translate(${Math.sin(localFrame / 13) * activity * 4} ${
      Math.cos(localFrame / 17) * activity * 2
    })`,
    chart: `translate(0 ${-pulse * 2.6})`,
  };
  const paths = PHOSPHOR_PATHS[name];
  const svgStyle: React.CSSProperties = {
    opacity: progress,
    transform: `scale(${0.72 + progress * 0.28 + activity * 0.035})`,
    transformOrigin: "50% 50%",
    filter: `drop-shadow(0 3px 2px rgba(255,255,255,.9)) drop-shadow(0 0 ${
      activity * 7
    }px ${accent}66)`,
  };

  return (
    <svg viewBox="0 0 256 256" width="86" height="86" style={svgStyle}>
      <circle
        cx="128"
        cy="128"
        r={102 + pulse * 5}
        fill={accent}
        opacity={0.035 + activity * (1 - pulse) * 0.035}
      />
      <circle
        cx="128"
        cy="128"
        r={104 + pulse * 8}
        fill="none"
        stroke={accent}
        strokeWidth="3"
        opacity={activity * (1 - pulse) * 0.24}
      />
      <g transform={motionByIcon[name]}>
        <path
          d={paths.duotone}
          fill={accent}
          opacity={0.2 + activity * 0.08}
        />
        <path d={paths.body} fill="#30434E" />
      </g>
    </svg>
  );
};

const Connector: React.FC<{
  item: Item;
  progress: number;
  activity: number;
  globalPulse: number;
}> = ({item, progress, activity, globalPulse}) => {
  const cardInnerX = item.side === "left" ? item.cardX + 526 : item.cardX - 26;
  const targetX = item.side === "left" ? item.nodeX - 19 : item.nodeX + 19;
  const lineLeft = Math.min(cardInnerX, targetX);
  const lineWidth = Math.abs(cardInnerX - targetX);
  const origin = item.side === "left" ? "left center" : "right center";
  const pulseX =
    item.side === "left"
      ? interpolate(globalPulse, [0, 1], [cardInnerX, targetX], clamp)
      : interpolate(globalPulse, [0, 1], [cardInnerX, targetX], clamp);

  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          left: lineLeft,
          top: item.y - 2.5,
          width: lineWidth,
          height: 5,
          borderRadius: 4,
          opacity: progress,
          background: `linear-gradient(90deg, ${item.dark}, ${item.color})`,
          transform: `scaleX(${progress})`,
          transformOrigin: origin,
          boxShadow: `0 0 ${5 + activity * 8}px ${item.color}66`,
        }}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 4,
          left: pulseX - 5,
          top: item.y - 5,
          width: 10,
          height: 10,
          borderRadius: "50%",
          opacity: activity * Math.sin(globalPulse * Math.PI),
          background: "#FFFFFF",
          boxShadow: `0 0 8px 3px ${item.color}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 5,
          left: item.nodeX - 19,
          top: item.y - 19,
          width: 38,
          height: 38,
          borderRadius: "50%",
          opacity: progress,
          transform: `scale(${0.62 + progress * 0.38 + activity * 0.09})`,
          background: "#F9FBFB",
          border: `5px solid ${item.color}`,
          boxShadow: `0 5px 12px rgba(34,49,59,.18), 0 0 ${activity * 18}px ${
            item.color
          }77`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 7,
            borderRadius: "50%",
            background: item.dark,
            opacity: 0.92,
          }}
        />
      </div>
    </>
  );
};

const Pill: React.FC<{item: Item}> = ({item}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enterStart = 62 + item.order * 48;
  const inRaw = spring({
    frame: frame - enterStart,
    fps,
    durationInFrames: 64,
    config: {damping: 15, stiffness: 118, mass: 0.72},
  });
  const entrance = interpolate(inRaw, [0, 1], [0, 1], clamp);
  const iconRaw = spring({
    frame: frame - enterStart - 18,
    fps,
    durationInFrames: 54,
    config: {damping: 13, stiffness: 142, mass: 0.6},
  });
  const iconIn = interpolate(iconRaw, [0, 1], [0, 1], clamp);

  const reverseOrder = ITEMS.length - 1 - item.order;
  const exit = smooth(frame, [730 + reverseOrder * 24, 784 + reverseOrder * 24], [0, 1]);
  const visible = entrance * (1 - exit);
  const activityStart = 348 + item.order * 30;
  const activity = smooth(
    frame,
    [activityStart - 22, activityStart + 18, 638, 705],
    [0, 1, 1, 0],
  );
  const localFrame = frame - activityStart;
  const floatY = Math.sin((frame + item.order * 19) / 35) * 2.2 * activity;
  const slideX =
    (1 - entrance) * (item.side === "left" ? -115 : 115) +
    exit * (item.side === "left" ? -74 : 74);
  const pillScale = 0.93 + entrance * 0.07 - exit * 0.025;
  const iconScale = (0.62 + iconIn * 0.38) * (1 + activity * 0.025);
  const pulsePhase = ((frame - activityStart) % 96 + 96) / 96;
  const connectorProgress = interpolate(
    frame,
    [enterStart + 15, enterStart + 58],
    [0, 1],
    {...clamp, easing: Easing.out(Easing.cubic)},
  ) * (1 - exit);
  return (
    <>
      <Connector
        item={item}
        progress={connectorProgress}
        activity={activity}
        globalPulse={pulsePhase}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 6,
          left: item.cardX,
          top: item.y - 77,
          width: 500,
          height: 154,
          opacity: visible,
          transform: `translate(${slideX}px, ${floatY}px) scale(${pillScale})`,
          transformOrigin: item.side === "left" ? "right center" : "left center",
          willChange: "transform, opacity",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: 82,
            background: `linear-gradient(135deg, ${item.color} 0%, ${item.dark} 100%)`,
            boxShadow: `0 17px 23px rgba(30,44,55,.20), inset 0 2px 2px rgba(255,255,255,.16), inset 0 -2px 2px rgba(0,0,0,.08), 0 0 ${
              activity * 24
            }px ${item.color}45`,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              left: item.side === "left" ? -105 : 310,
              top: -116,
              border: "2px solid rgba(255,255,255,.07)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 210,
              height: 52,
              left: -70 + ((frame - enterStart) * 5.2) % 680,
              top: -15,
              opacity: 0.15,
              transform: "rotate(-17deg)",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            [item.side === "left" ? "right" : "left"]: -38,
            width: 0,
            height: 0,
            borderTop: "77px solid transparent",
            borderBottom: "77px solid transparent",
            [item.side === "left" ? "borderLeft" : "borderRight"]: `49px solid ${item.dark}`,
          }}
        />

        <div
          style={{
            position: "absolute",
            zIndex: 2,
            top: 18,
            [item.side === "left" ? "right" : "left"]: 28,
            width: 118,
            height: 118,
            borderRadius: "50%",
            transform: `scale(${iconScale}) rotate(${(1 - iconIn) * (item.side === "left" ? -14 : 14)}deg)`,
            background:
              "radial-gradient(circle at 35% 29%, #FFFFFF 0%, #FAFBFA 48%, #E5E9E8 100%)",
            border: "2px solid rgba(255,255,255,.82)",
            boxShadow:
              "0 13px 19px rgba(20,31,39,.30), inset 0 3px 3px rgba(255,255,255,.96), inset 0 -4px 7px rgba(84,97,104,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconArt
            name={item.icon}
            accent={item.color}
            progress={iconIn * (1 - exit)}
            activity={activity}
            localFrame={localFrame}
          />
        </div>

      </div>
    </>
  );
};

const DottedOrbit: React.FC<{progress: number; active: number}> = ({
  progress,
  active,
}) => {
  const frame = useCurrentFrame();
  const circumference = Math.PI * 2 * 338;
  return (
    <svg
      viewBox="0 0 1920 1080"
      width="1920"
      height="1080"
      style={{position: "absolute", inset: 0, overflow: "visible"}}
    >
      <defs>
        <linearGradient id="orbit-gradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#12AEB1" />
          <stop offset="45%" stopColor="#9AA3A9" />
          <stop offset="100%" stopColor="#465975" />
        </linearGradient>
      </defs>
      <circle
        cx="960"
        cy="540"
        r="338"
        fill="none"
        stroke="url(#orbit-gradient)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="1 17"
        opacity={0.72 * progress}
        strokeDashoffset={circumference * (1 - progress) - frame * active * 0.16}
        style={{filter: "drop-shadow(0 2px 2px rgba(46,61,69,.12))"}}
      />
      <circle
        cx="960"
        cy="540"
        r="352"
        fill="none"
        stroke="#A4ADB1"
        strokeWidth="1.5"
        strokeDasharray="2 28"
        opacity={0.22 * progress * active}
        strokeDashoffset={frame * 0.24}
      />
    </svg>
  );
};

const CenterDisc: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rawIn = spring({
    frame: frame - 18,
    fps,
    durationInFrames: 88,
    config: {damping: 17, stiffness: 92, mass: 0.9},
  });
  const entrance = interpolate(rawIn, [0, 1], [0, 1], clamp);
  const exit = smooth(frame, [790, 892], [0, 1]);
  const visible = entrance * (1 - exit);
  const active = smooth(frame, [320, 390, 650, 724], [0, 1, 1, 0]);
  const breathe = 1 + Math.sin(frame / 43) * 0.008 * active;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 4,
        left: 960,
        top: 540,
        width: 478,
        height: 478,
        opacity: visible,
        transform: `translate(-50%, -50%) scale(${
          (0.78 + entrance * 0.22 - exit * 0.08) * breathe
        }) rotate(${(1 - entrance) * -7 + exit * 4}deg)`,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 34% 27%, #FFFFFF 0%, #F7F9F9 46%, #E8EDEC 100%)",
        border: "2px solid rgba(255,255,255,.92)",
        boxShadow:
          "13px 19px 22px rgba(36,49,57,.22), 0 5px 0 rgba(173,181,182,.44), inset 0 4px 4px rgba(255,255,255,.95), inset 0 -4px 7px rgba(122,132,134,.10)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 42,
          borderRadius: "50%",
          border: "1px solid rgba(135,146,151,.10)",
          boxShadow: "inset 0 0 40px rgba(132,145,149,.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          display: "flex",
          gap: 28,
          transform: "translate(-50%, -50%)",
        }}
      >
        {COLORS.map((color, index) => {
          const dotIn = smooth(frame, [278 + index * 20, 310 + index * 20], [0, 1]);
          const pulse =
            1 + Math.sin((frame - index * 8) / 12) * 0.12 * active;
          return (
            <div
              key={color}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                opacity: dotIn * (1 - exit),
                transform: `scale(${dotIn * pulse})`,
                background: color,
                boxShadow: `0 4px 7px rgba(31,48,58,.18), 0 0 ${
                  active * 12
                }px ${color}77`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          width: 170,
          height: 620,
          left: -140 + ((frame - 18) * 2.8) % 780,
          top: -65,
          transform: "rotate(20deg)",
          opacity: 0.26 * visible,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.9), transparent)",
        }}
      />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const orbitIn = smooth(frame, [20, 190], [0, 1]);
  const orbitOut = smooth(frame, [748, 875], [0, 1]);
  const systemActive = smooth(frame, [325, 405, 648, 730], [0, 1, 1, 0]);
  const cameraScale = smooth(
    frame,
    [0, 315, 490, 635, 760, 899],
    [1, 1, 1.018, 1.026, 1, 1],
  );
  const cameraX = smooth(
    frame,
    [0, 305, 455, 575, 700, 825, 899],
    [0, 0, -7, 7, 0, 0, 0],
  );
  const cameraY = smooth(frame, [0, 390, 580, 760, 899], [0, 0, -4, 0, 0]);
  const ambient = smooth(frame, [0, 330, 570, 780, 899], [0.04, 0.11, 0.16, 0.06, 0.04]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#F7F8F7",
        backgroundImage:
          "radial-gradient(circle at 50% 47%, #FFFFFF 0%, #FAFBFA 49%, #F1F3F2 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -100,
          opacity: ambient,
          transform: `translate(${Math.sin((frame / 899) * Math.PI * 2) * 12}px, ${
            Math.sin((frame / 899) * Math.PI * 2) * -6
          }px)`,
          background:
            "radial-gradient(circle at 22% 24%, #74D5D3 0%, transparent 28%), radial-gradient(circle at 78% 72%, #7D95B9 0%, transparent 28%)",
          filter: "blur(28px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        <DottedOrbit progress={orbitIn * (1 - orbitOut)} active={systemActive} />
        {ITEMS.map((item) => (
          <Pill key={`${item.side}-${item.row}`} item={item} />
        ))}
        <CenterDisc />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 110px rgba(75,90,99,.07)",
        }}
      />
    </AbsoluteFill>
  );
};
