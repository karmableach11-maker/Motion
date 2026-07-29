import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION = 900;
const IMPACT_FRAME = 518;
const OUTRO_FRAME = 704;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
const easeCrash = Easing.bezier(0.72, 0, 0.92, 0.42);

const progress = (
  frame: number,
  start: number,
  end: number,
  easing = easeInOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing,
  });

const seeded = (index: number) => {
  const value = Math.sin(index * 91.713 + 12.341) * 43758.5453;
  return value - Math.floor(value);
};

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const candleStart = (index: number, count: number) => {
  const wideGap = index * 14.5;
  const acceleration =
    (9.5 * index * Math.max(0, index - 1)) / (2 * Math.max(1, count - 1));
  return 58 + wideGap - acceleration;
};

const CLOSES = [
  55, 60, 58, 64, 62, 68, 72, 69, 75, 79, 76, 82, 86, 83, 89, 93, 90,
  96, 99, 95, 102, 98, 105, 109, 106, 112, 108, 115, 111, 118, 114, 121,
  118, 124, 120, 126, 121, 116, 108, 97, 82, 61, 39, 23,
] as const;

const CANDLE_SPACING = 84;
const CHART_START_X = 250;
const CRASH_INDEX = CLOSES.length - 1;
const CRASH_X = CHART_START_X + CRASH_INDEX * CANDLE_SPACING;

const priceY = (price: number) => 920 - price * 5.15;

const CANDLES = CLOSES.map((close, index) => {
  const previous = index === 0 ? close - 3 : CLOSES[index - 1];
  const crashWeight = Math.max(0, index - 36);
  const open =
    index >= 38
      ? previous + 2.5 + crashWeight * 0.7
      : previous + (seeded(index + 201) - 0.5) * 5;
  const high =
    Math.max(open, close) +
    2.4 +
    seeded(index + 421) * (index >= 38 ? 5.5 : 7);
  const low =
    Math.min(open, close) -
    2.4 -
    seeded(index + 647) * (index >= 38 ? 9.5 : 6);
  return {
    open,
    close,
    high,
    low,
    x: CHART_START_X + index * CANDLE_SPACING,
    start: candleStart(index, CLOSES.length),
  };
});

const closingLine = CANDLES.map(
  (candle, index) =>
    `${index === 0 ? "M" : "L"}${candle.x},${priceY(candle.close)}`,
).join(" ");

const Background: React.FC<{
  frame: number;
  parallaxX: number;
  tension: number;
}> = ({frame, parallaxX, tension}) => {
  const loopFrame = frame % (DURATION - 1);
  const scan = (loopFrame * 2.8) % (HEIGHT + 520) - 260;

  const dust = Array.from({length: 72}, (_, index) => {
    const x =
      (seeded(index + 4) * (WIDTH + 220) +
        loopFrame * (0.11 + seeded(index + 80) * 0.3)) %
        (WIDTH + 220) -
      110;
    const y =
      (seeded(index + 170) * HEIGHT +
        loopFrame * (0.18 + seeded(index + 251) * 0.46)) %
      HEIGHT;
    const red = index % 7 === 0 || (tension > 0.55 && index % 4 === 0);
    return (
      <line
        key={index}
        x1={x}
        x2={x + (red ? 1 : 0)}
        y1={y}
        y2={y + 7 + seeded(index + 341) * 26}
        stroke={red ? "#ff214e" : "#18c7d9"}
        strokeWidth={red ? 1.25 : 0.8}
        opacity={
          (0.07 + seeded(index + 409) * 0.22) *
          (0.72 + Math.sin(loopFrame / 21 + index) * 0.28) *
          (red ? 0.75 + tension * 0.7 : 1)
        }
      />
    );
  });

  const horizontalGrid = Array.from({length: 17}, (_, index) => {
    const ratio = index / 16;
    const y = 326 + Math.pow(ratio, 1.9) * 744;
    return (
      <line
        key={index}
        x1="-320"
        x2="2240"
        y1={y}
        y2={y}
        stroke={index % 4 === 0 ? "#116477" : "#0c3b49"}
        strokeWidth={index % 4 === 0 ? 1.3 : 0.8}
        opacity={0.11 + ratio * 0.18}
      />
    );
  });

  const verticalGrid = Array.from({length: 21}, (_, index) => {
    const bottomX = -280 + index * 124;
    const horizonX = 960 + (bottomX - 960) * 0.09;
    return (
      <line
        key={index}
        x1={horizonX}
        x2={bottomX}
        y1="326"
        y2="1080"
        stroke={index % 5 === 0 ? "#116477" : "#0b3a48"}
        strokeWidth={index % 5 === 0 ? 1.2 : 0.75}
        opacity=".16"
      />
    );
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 28%,rgba(8,54,66,.55),transparent 52%),radial-gradient(ellipse at 64% 72%,rgba(143,0,28,.18),transparent 42%),linear-gradient(180deg,#010609 0%,#020a0e 54%,#050307 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 55%,transparent 34%,rgba(0,0,0,.48) 86%,rgba(0,0,0,.82) 100%)",
        }}
      />

      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{position: "absolute", inset: 0}}
        aria-hidden
      >
        <defs>
          <linearGradient id="bg-horizon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#00d7eb" stopOpacity="0" />
            <stop offset=".48" stopColor="#48efff" stopOpacity=".45" />
            <stop offset=".74" stopColor="#ff1749" stopOpacity=".24" />
            <stop offset="1" stopColor="#ff1749" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bg-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8cf9ff" stopOpacity="0" />
            <stop offset=".5" stopColor="#8cf9ff" stopOpacity=".22" />
            <stop offset="1" stopColor="#8cf9ff" stopOpacity="0" />
          </linearGradient>
          <filter id="bg-soft">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <g transform={`translate(${parallaxX * 0.12} 0)`}>
          {horizontalGrid}
          {verticalGrid}
          <line
            x1="-120"
            x2="2040"
            y1="326"
            y2="326"
            stroke="url(#bg-horizon)"
            strokeWidth="2"
            opacity=".68"
          />
        </g>

        <rect
          x="0"
          y={scan}
          width={WIDTH}
          height="210"
          fill="url(#bg-scan)"
          opacity=".16"
          filter="url(#bg-soft)"
        />

        {dust}
      </svg>

      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: 20,
          height: 190,
          background:
            "radial-gradient(ellipse at center,rgba(255,18,58,.16),transparent 70%)",
          filter: "blur(30px)",
          opacity: 0.28 + tension * 0.52,
        }}
      />
    </AbsoluteFill>
  );
};

const AmbientHud: React.FC<{
  frame: number;
  opacity: number;
}> = ({frame, opacity}) => {
  const pulse = 0.66 + Math.sin(frame / 26) * 0.22;
  const sweep = (frame * 5.4) % 1260;

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{position: "absolute", inset: 0, opacity}}
      aria-hidden
    >
      <defs>
        <filter id="hud-cyan-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="hud-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#47f5ff" stopOpacity="0" />
          <stop offset=".5" stopColor="#b8fdff" stopOpacity=".9" />
          <stop offset="1" stopColor="#47f5ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g
        fill="none"
        stroke="#18dced"
        strokeLinecap="square"
        filter="url(#hud-cyan-glow)"
      >
        <path d="M92 188V108Q92 86 114 86H226" strokeWidth="2" />
        <path d="M1828 188V108Q1828 86 1806 86H1694" strokeWidth="2" />
        <path d="M92 892V972Q92 994 114 994H226" strokeWidth="2" />
        <path d="M1828 892V972Q1828 994 1806 994H1694" strokeWidth="2" />
        <path d="M112 148V116Q112 106 122 106H178" strokeWidth="1" opacity=".5" />
        <path
          d="M1808 148V116Q1808 106 1798 106H1742"
          strokeWidth="1"
          opacity=".5"
        />
      </g>

      <g fill="#6bf7ff" opacity={pulse}>
        <circle cx="226" cy="86" r="3" />
        <circle cx="1694" cy="86" r="3" />
        <circle cx="226" cy="994" r="3" />
        <circle cx="1694" cy="994" r="3" />
      </g>

      <g opacity=".26">
        {Array.from({length: 13}, (_, index) => (
          <rect
            key={index}
            x={330 + index * 98}
            y="83"
            width={index % 3 === 0 ? 42 : 18}
            height="2"
            fill={index % 4 === 0 ? "#ff315b" : "#1ed7e8"}
          />
        ))}
      </g>

      <rect
        x={330 + sweep}
        y="80"
        width="130"
        height="7"
        fill="url(#hud-sweep)"
        opacity=".34"
      />
    </svg>
  );
};

const LiquidityField: React.FC<{
  frame: number;
  visibility: number;
}> = ({frame, visibility}) => {
  const activation = progress(frame, 230, 390, easeOut);
  const collapse = progress(frame, 474, 548, easeCrash);
  const outro = 1 - progress(frame, OUTRO_FRAME + 20, 830);

  return (
    <g opacity={visibility * activation * outro}>
      {Array.from({length: 22}, (_, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        const y = 258 + index * 31 + seeded(index + 20) * 13;
        const baseX = CRASH_X - 920 + seeded(index + 50) * 820;
        const width = 240 + seeded(index + 92) * 570;
        const contraction = collapse * (0.65 + seeded(index + 130) * 0.35);
        const x = mix(baseX, CRASH_X - width * 0.1, contraction);
        const opacity =
          (0.08 + seeded(index + 171) * 0.16) *
          (0.76 + Math.sin(frame / 12 + index) * 0.24) *
          (1 - collapse * 0.58);
        const color =
          collapse > 0.48
            ? "#ff2452"
            : side > 0
              ? "#18d6e7"
              : "#b72cff";
        return (
          <g key={index} transform={`translate(${x} ${y})`}>
            <rect
              width={width * (1 - contraction * 0.72)}
              height={index % 4 === 0 ? 3 : 1.5}
              rx="1"
              fill={color}
              opacity={opacity}
            />
            <circle
              cx={width * (1 - contraction * 0.72)}
              cy={index % 4 === 0 ? 1.5 : 0.75}
              r={index % 4 === 0 ? 3 : 1.5}
              fill={color}
              opacity={opacity * 1.8}
            />
          </g>
        );
      })}
    </g>
  );
};

const Candle: React.FC<{
  frame: number;
  index: number;
  sceneVisibility: number;
}> = ({frame, index, sceneVisibility}) => {
  const candle = CANDLES[index];
  const enter = progress(frame, candle.start, candle.start + 28, easeOut);
  const reverseIndex = CANDLES.length - 1 - index;
  const exitStart = OUTRO_FRAME + reverseIndex * 3.2;
  const exit = 1 - progress(frame, exitStart, exitStart + 42, easeInOut);
  const visibility = enter * exit * sceneVisibility;

  const isUp = candle.close >= candle.open;
  const color = isUp ? "#22f2e5" : "#ff315b";
  const coreColor = isUp ? "#c7fffb" : "#fff2f5";
  const openY = priceY(candle.open);
  const closeY = priceY(candle.close);
  const highY = priceY(candle.high);
  const lowY = priceY(candle.low);
  const bodyTop = Math.min(openY, closeY);
  const bodyBottom = Math.max(openY, closeY);
  const bodyHeight = Math.max(7, bodyBottom - bodyTop);
  const currentTop = mix(openY, bodyTop, enter);
  const currentBottom = mix(openY, bodyBottom, enter);
  const currentHigh = mix(openY, highY, enter);
  const currentLow = mix(openY, lowY, enter);
  const flash =
    index >= 38
      ? 0.82 + Math.sin((frame - candle.start) / 3.5) * 0.18
      : 0.9 + Math.sin(frame / 17 + index) * 0.1;
  const width = index >= 40 ? 36 : 30;

  return (
    <g opacity={visibility * flash}>
      <line
        x1={candle.x}
        x2={candle.x}
        y1={currentHigh}
        y2={currentLow}
        stroke={color}
        strokeWidth={index >= 38 ? 4 : 2.5}
        filter={isUp ? "url(#green-glow)" : "url(#red-glow)"}
      />
      <rect
        x={candle.x - width / 2}
        y={currentTop}
        width={width}
        height={Math.max(1, currentBottom - currentTop)}
        rx="2"
        fill={isUp ? "url(#green-candle)" : "url(#red-candle)"}
        stroke={coreColor}
        strokeWidth={index >= 38 ? 1.8 : 1.15}
        filter={isUp ? "url(#green-glow)" : "url(#red-glow)"}
      />
      <line
        x1={candle.x - width * 0.2}
        x2={candle.x - width * 0.2}
        y1={currentTop + 4}
        y2={Math.min(currentBottom - 3, currentTop + bodyHeight * enter * 0.75)}
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity={isUp ? 0.54 : 0.74}
      />
      <ellipse
        cx={candle.x}
        cy={currentBottom + 8}
        rx={width * 0.92}
        ry="5"
        fill={color}
        opacity={0.11 + (index >= 38 ? 0.18 : 0.04)}
        filter="url(#wide-blur)"
      />
    </g>
  );
};

const VolumeBars: React.FC<{
  frame: number;
  visibility: number;
}> = ({frame, visibility}) => (
  <g opacity={visibility}>
    <line
      x1="90"
      x2={CRASH_X + 240}
      y1="969"
      y2="969"
      stroke="#1d6b75"
      strokeWidth="1"
      opacity=".3"
    />
    {CANDLES.map((candle, index) => {
      const enter = progress(frame, candle.start + 8, candle.start + 32, easeOut);
      const reverseIndex = CANDLES.length - 1 - index;
      const exit =
        1 -
        progress(
          frame,
          OUTRO_FRAME + reverseIndex * 3.2,
          OUTRO_FRAME + reverseIndex * 3.2 + 36,
        );
      const isUp = candle.close >= candle.open;
      const crashBoost = index >= 38 ? (index - 37) * 18 : 0;
      const volume =
        24 +
        Math.abs(candle.close - candle.open) * 3.2 +
        seeded(index + 720) * 44 +
        crashBoost;
      return (
        <rect
          key={index}
          x={candle.x - 15}
          y={969 - volume * enter}
          width="30"
          height={volume * enter}
          rx="2"
          fill={isUp ? "#16cfc5" : "#ff234f"}
          opacity={(index >= 38 ? 0.48 : 0.2) * exit}
          filter={index >= 40 ? "url(#red-soft)" : undefined}
        />
      );
    })}
  </g>
);

const PriceTrace: React.FC<{
  frame: number;
  visibility: number;
}> = ({frame, visibility}) => {
  const draw = progress(frame, 68, IMPACT_FRAME, Easing.linear);
  const erase = progress(frame, OUTRO_FRAME + 8, 850, easeInOut);
  const dashOffset = 7800 * (1 - draw) - 7800 * erase;
  return (
    <g opacity={visibility * 0.42}>
      <path
        d={closingLine}
        fill="none"
        stroke="#ff3159"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="7800"
        strokeDashoffset={dashOffset}
        opacity=".12"
        filter="url(#red-soft)"
      />
      <path
        d={closingLine}
        fill="none"
        stroke="url(#trace-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="7800"
        strokeDashoffset={dashOffset}
        opacity=".72"
      />
    </g>
  );
};

const ImpactWave: React.FC<{
  frame: number;
  visibility: number;
}> = ({frame, visibility}) => {
  const elapsed = frame - IMPACT_FRAME;
  const impact = progress(frame, IMPACT_FRAME - 5, IMPACT_FRAME + 12, easeOut);
  const impactOut = 1 - progress(frame, 655, 770);
  const centerY = priceY(CANDLES[CRASH_INDEX].low);

  if (elapsed < -10) {
    return null;
  }

  const fragments = Array.from({length: 112}, (_, index) => {
    const delay = seeded(index + 830) * 19;
    const local = Math.max(0, elapsed - delay);
    const life = 88 + seeded(index + 931) * 122;
    const t = Math.min(1, local / life);
    const angle =
      -Math.PI * 0.96 + seeded(index + 1020) * Math.PI * 1.92;
    const speed = 160 + seeded(index + 1117) * 650;
    const x =
      CRASH_X +
      Math.cos(angle) * speed * t +
      (seeded(index + 1201) - 0.5) * 85 * t;
    const y =
      centerY +
      Math.sin(angle) * speed * 0.58 * t +
      290 * t * t +
      (seeded(index + 1307) - 0.5) * 40;
    const tail =
      7 +
      seeded(index + 1429) * 26 +
      (index % 9 === 0 ? 22 : 0);
    const particleOpacity =
      progress(local, 0, 8, easeOut) *
      (1 - progress(local, life * 0.56, life)) *
      impactOut;
    const cyan = index % 13 === 0;
    return (
      <line
        key={index}
        x1={x}
        x2={x - Math.cos(angle) * tail}
        y1={y}
        y2={y - Math.sin(angle) * tail * 0.58}
        stroke={cyan ? "#7dfaff" : index % 4 === 0 ? "#fff2f5" : "#ff254f"}
        strokeWidth={index % 7 === 0 ? 3 : 1.4}
        strokeLinecap="round"
        opacity={particleOpacity * visibility}
        filter={index % 5 === 0 ? "url(#red-glow)" : undefined}
      />
    );
  });

  return (
    <g opacity={visibility}>
      {Array.from({length: 4}, (_, index) => {
        const delay = index * 10;
        const ringProgress = progress(
          frame,
          IMPACT_FRAME + delay,
          IMPACT_FRAME + 92 + delay,
          easeOut,
        );
        const ringOut =
          1 -
          progress(
            frame,
            IMPACT_FRAME + 34 + delay,
            IMPACT_FRAME + 102 + delay,
          );
        return (
          <ellipse
            key={index}
            cx={CRASH_X}
            cy={centerY}
            rx={38 + ringProgress * (230 + index * 76)}
            ry={18 + ringProgress * (86 + index * 29)}
            fill="none"
            stroke={index === 0 ? "#fff6f7" : "#ff2451"}
            strokeWidth={4 - index * 0.65}
            opacity={ringOut * (0.88 - index * 0.14)}
            filter="url(#red-glow)"
          />
        );
      })}

      <circle
        cx={CRASH_X}
        cy={centerY}
        r={28 + impact * 34}
        fill="url(#impact-radial)"
        opacity={impact * impactOut}
        filter="url(#red-soft)"
      />

      <path
        d={`M${CRASH_X - 230} ${centerY}H${CRASH_X + 260}`}
        stroke="#fff6f7"
        strokeWidth="2.5"
        strokeDasharray="10 18"
        strokeDashoffset={-elapsed * 7}
        opacity={impact * impactOut * 0.72}
        filter="url(#red-glow)"
      />

      {fragments}
    </g>
  );
};

const CrashRain: React.FC<{
  frame: number;
  visibility: number;
}> = ({frame, visibility}) => {
  const activation = progress(frame, IMPACT_FRAME + 5, IMPACT_FRAME + 72, easeOut);
  const fade = 1 - progress(frame, 672, 790);
  const localFrame = Math.max(0, frame - IMPACT_FRAME);

  return (
    <g opacity={activation * fade * visibility}>
      {Array.from({length: 76}, (_, index) => {
        const rangeX = 1380;
        const x =
          CRASH_X -
          980 +
          ((seeded(index + 1510) * rangeX +
            localFrame * (0.8 + seeded(index + 1597) * 2.4)) %
            rangeX);
        const y =
          120 +
          ((seeded(index + 1681) * 820 +
            localFrame * (3.8 + seeded(index + 1777) * 7.5)) %
            880);
        const length = 16 + seeded(index + 1871) * 78;
        return (
          <line
            key={index}
            x1={x}
            x2={x + 5 + seeded(index + 1911) * 10}
            y1={y}
            y2={y + length}
            stroke={index % 11 === 0 ? "#fff4f6" : "#ff234f"}
            strokeWidth={index % 8 === 0 ? 2.8 : 1.15}
            opacity={0.12 + seeded(index + 1997) * 0.52}
            filter={index % 6 === 0 ? "url(#red-glow)" : undefined}
          />
        );
      })}
    </g>
  );
};

const MarketWorld: React.FC<{
  frame: number;
  sceneVisibility: number;
}> = ({frame, sceneVisibility}) => {
  const tension = progress(frame, 270, IMPACT_FRAME, easeCrash);
  const lastY = priceY(CANDLES[CRASH_INDEX].close);
  const guideVisibility =
    progress(frame, 130, 260, easeOut) *
    (1 - progress(frame, 654, 786)) *
    sceneVisibility;

  return (
    <svg
      width={CRASH_X + 520}
      height={HEIGHT}
      viewBox={`0 0 ${CRASH_X + 520} ${HEIGHT}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id="green-candle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#087f86" />
          <stop offset=".45" stopColor="#2bf2e3" />
          <stop offset="1" stopColor="#bafff8" />
        </linearGradient>
        <linearGradient id="red-candle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#700018" />
          <stop offset=".45" stopColor="#ff244e" />
          <stop offset="1" stopColor="#ff9cad" />
        </linearGradient>
        <linearGradient id="trace-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1af3e4" />
          <stop offset=".72" stopColor="#b34eff" />
          <stop offset=".88" stopColor="#ff3159" />
          <stop offset="1" stopColor="#fff5f7" />
        </linearGradient>
        <radialGradient id="impact-radial">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".96" />
          <stop offset=".16" stopColor="#ffb0bd" stopOpacity=".9" />
          <stop offset=".48" stopColor="#ff214d" stopOpacity=".55" />
          <stop offset="1" stopColor="#ff0036" stopOpacity="0" />
        </radialGradient>
        <filter id="green-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="red-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="red-soft" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
        <filter id="wide-blur" x="-200%" y="-300%" width="500%" height="700%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <linearGradient id="guide-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff3159" stopOpacity="0" />
          <stop offset=".58" stopColor="#ff3159" stopOpacity=".1" />
          <stop offset="1" stopColor="#ff6e88" stopOpacity=".72" />
        </linearGradient>
      </defs>

      <LiquidityField frame={frame} visibility={sceneVisibility} />

      <g opacity={guideVisibility}>
        {Array.from({length: 8}, (_, index) => {
          const y = 300 + index * 81;
          return (
            <line
              key={index}
              x1="100"
              x2={CRASH_X + 220}
              y1={y}
              y2={y}
              stroke={index > 4 ? "#ff234f" : "#13a9b7"}
              strokeWidth="1"
              strokeDasharray="2 16"
              opacity={0.14 + index * 0.012}
            />
          );
        })}
      </g>

      <PriceTrace frame={frame} visibility={sceneVisibility} />
      <VolumeBars frame={frame} visibility={sceneVisibility} />

      {CANDLES.map((_, index) => (
        <Candle
          key={index}
          frame={frame}
          index={index}
          sceneVisibility={sceneVisibility}
        />
      ))}

      <line
        x1={CRASH_X - 700}
        x2={CRASH_X + 330}
        y1={lastY}
        y2={lastY}
        stroke="url(#guide-line)"
        strokeWidth="1.5"
        strokeDasharray="11 12"
        strokeDashoffset={-frame * (2 + tension * 7)}
        opacity={progress(frame, 430, 540, easeOut) * (1 - progress(frame, 690, 780))}
        filter="url(#red-glow)"
      />

      <CrashRain frame={frame} visibility={sceneVisibility} />
      <ImpactWave frame={frame} visibility={sceneVisibility} />
    </svg>
  );
};

const ChromaticCrashFlash: React.FC<{
  frame: number;
}> = ({frame}) => {
  const primary =
    progress(frame, IMPACT_FRAME - 3, IMPACT_FRAME + 4, easeOut) *
    (1 - progress(frame, IMPACT_FRAME + 4, IMPACT_FRAME + 24));
  const echo =
    progress(frame, IMPACT_FRAME + 28, IMPACT_FRAME + 36, easeOut) *
    (1 - progress(frame, IMPACT_FRAME + 36, IMPACT_FRAME + 62));
  const amount = primary + echo * 0.28;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: amount,
        background:
          "radial-gradient(circle at 63% 72%,rgba(255,255,255,.78) 0%,rgba(255,55,91,.34) 18%,rgba(255,0,46,.09) 42%,transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneIn = progress(frame, 28, 86, easeOut);
  const sceneOut = 1 - progress(frame, 760, 891, easeInOut);
  const sceneVisibility = sceneIn * sceneOut;

  const tracking = progress(frame, 70, IMPACT_FRAME, easeCrash);
  const cameraReturn = progress(frame, 706, 899, easeInOut);
  const trackedX = mix(0, 1125 - CRASH_X, tracking);
  const cameraX = mix(trackedX, 0, cameraReturn);

  const pushIn =
    progress(frame, 454, IMPACT_FRAME + 22, easeCrash) *
    (1 - progress(frame, 640, 738, easeInOut));
  const pullBack =
    progress(frame, 646, 758, easeOut) *
    (1 - progress(frame, 814, 899, easeInOut));
  const cameraScale = 1 + pushIn * 0.115 - pullBack * 0.14;
  const cameraY =
    -48 * progress(frame, 448, IMPACT_FRAME + 12, easeCrash) * (1 - cameraReturn);

  const shakeWindow =
    progress(frame, IMPACT_FRAME - 2, IMPACT_FRAME + 4, easeOut) *
    (1 - progress(frame, IMPACT_FRAME + 4, IMPACT_FRAME + 36));
  const shakeX =
    (Math.sin(frame * 2.63) * 12 + Math.sin(frame * 5.17) * 5) * shakeWindow;
  const shakeY =
    (Math.cos(frame * 2.19) * 8 + Math.sin(frame * 4.31) * 4) * shakeWindow;

  const tension =
    progress(frame, 280, IMPACT_FRAME + 20, easeCrash) *
    (1 - progress(frame, 678, 899, easeInOut));
  const hudOpacity =
    progress(frame, 18, 94, easeOut) * (1 - progress(frame, 770, 893));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#010609",
        overflow: "hidden",
      }}
    >
      <Background frame={frame} parallaxX={cameraX} tension={tension} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "960px 540px",
          transform: `translate3d(${cameraX + shakeX}px, ${cameraY + shakeY}px, 0) scale(${cameraScale})`,
        }}
      >
        <MarketWorld frame={frame} sceneVisibility={sceneVisibility} />
      </div>

      <AmbientHud frame={frame} opacity={hudOpacity} />
      <ChromaticCrashFlash frame={frame} />

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow:
            "inset 0 0 210px rgba(0,0,0,.92), inset 0 -110px 160px rgba(0,0,0,.58)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.13,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(255,255,255,.035) 4px)",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
