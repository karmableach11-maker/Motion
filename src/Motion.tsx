import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const COLORS = {
  canvas: '#e9eef5',
  surface: '#f9fbfd',
  ink: '#10264b',
  muted: '#7890a6',
  cyan: '#08b7d3',
  cyanDark: '#038eb8',
  cyanSoft: '#93e4ef',
  grid: '#dce5ee',
  track: '#e4e9ee',
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const reveal = (frame: number, fps: number, delay: number, duration: number) =>
  interpolate((frame / fps) * 60, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

const Card: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  depth?: number;
  children: React.ReactNode;
}> = ({x, y, width, height, depth = 0, children}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: 24,
        overflow: 'hidden',
        background: COLORS.surface,
        border: '1px solid rgba(255,255,255,0.94)',
        boxShadow:
          '18px 20px 34px rgba(80,99,127,0.20), -13px -13px 25px rgba(255,255,255,0.94), inset 0 1px 0 rgba(255,255,255,0.98)',
        transform: `translateZ(${depth}px)`,
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

const TinyIcon: React.FC<{type: number}> = ({type}) => {
  const common = {
    fill: 'none',
    stroke: COLORS.cyanDark,
    strokeWidth: 2.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (type === 0) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <path {...common} d="M3.5 11.5 12 4l8.5 7.5" />
        <path {...common} d="M6.5 10.5v9h11v-9M10 19.5v-5h4v5" />
      </svg>
    );
  }

  if (type === 1) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <circle {...common} cx="6" cy="17" r="2.2" />
        <circle {...common} cx="18" cy="6" r="2.2" />
        <circle {...common} cx="15.5" cy="18" r="2.2" />
        <path {...common} d="m7.9 15.8 8.2-8.4M8.1 17.4l5.2.5" />
      </svg>
    );
  }

  if (type === 2) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <path {...common} d="M4 8.5h16v10H4zM7.5 8.5V6h9v2.5" />
        <path {...common} d="M4 12h16" />
      </svg>
    );
  }

  if (type === 3) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <circle {...common} cx="12" cy="12" r="8.5" />
        <path {...common} d="M12 7.5v5M12 16.5h.01" />
      </svg>
    );
  }

  if (type === 4) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <path {...common} d="M4 19V9M9 19V5M14 19v-7M19 19V3M3 19.5h18" />
      </svg>
    );
  }

  if (type === 5) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <path {...common} d="m4 13 15-7-4.5 15-3.2-6.1L4 13Z" />
        <path {...common} d="m11.3 14.9 3.3-3.5" />
      </svg>
    );
  }

  if (type === 6) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24">
        <rect {...common} x="3" y="5.5" width="18" height="13" rx="1.8" />
        <path {...common} d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg width="25" height="25" viewBox="0 0 24 24">
      <circle {...common} cx="12" cy="12" r="8.5" />
      <path {...common} d="M3.8 12h16.4M12 3.5c2.4 2.3 3.7 5.2 3.7 8.5s-1.3 6.2-3.7 8.5M12 3.5C9.6 5.8 8.3 8.7 8.3 12s1.3 6.2 3.7 8.5" />
    </svg>
  );
};

const Sidebar: React.FC = () => {
  const items = ['Overview', 'Analytics', 'Projects', 'Support', 'Statistics', 'Insights', 'Messages', 'Archive'];

  return (
    <Card x={22} y={20} width={370} height={1430} depth={18}>
      <div
        style={{
          padding: '44px 42px',
          fontFamily: 'Inter, Avenir Next, Helvetica, Arial, sans-serif',
          color: COLORS.ink,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 55}}>
          <div style={{fontSize: 13, letterSpacing: 4.2, fontWeight: 800, color: COLORS.muted}}>
            DASHBOARD
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 31}}>
          {items.map((item, index) => (
            <div key={item} style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <TinyIcon type={index} />
              <div
                style={{
                  fontSize: 20,
                  fontWeight: index === 0 ? 760 : 650,
                  color: index === 0 ? COLORS.cyanDark : '#1b6682',
                  letterSpacing: 1.8,
                  whiteSpace: 'nowrap',
                }}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 42,
            right: 42,
            bottom: 48,
            borderTop: `1px solid ${COLORS.grid}`,
            paddingTop: 25,
            color: COLORS.muted,
            fontSize: 13,
            letterSpacing: 2.5,
          }}
        >
          LIVE DATA · 2026
        </div>
      </div>
    </Card>
  );
};

const SearchBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = 0.58 + Math.sin((frame / fps) * Math.PI * 0.7) * 0.08;

  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 64,
        width: 610,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(90deg, rgba(147,228,239,0.72), rgba(209,246,249,0.40))',
        borderRadius: 3,
        boxShadow: 'inset 0 2px 8px rgba(17,153,181,0.09)',
        color: '#49718b',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 19,
        letterSpacing: 0.4,
      }}
    >
      <span style={{paddingLeft: 16}}>Search data</span>
      <span
        style={{
          display: 'inline-block',
          width: 2,
          height: 21,
          marginLeft: 5,
          background: `rgba(73,113,139,${pulse})`,
        }}
      />
      <svg style={{marginLeft: 'auto', marginRight: 18}} width="23" height="23" viewBox="0 0 24 24">
        <circle cx="10.7" cy="10.7" r="6.6" fill="none" stroke="#4a849a" strokeWidth="1.8" />
        <path d="m15.8 15.8 4.2 4.2" fill="none" stroke="#4a849a" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div style={{height: 27, width: 1, background: 'rgba(74,132,154,.25)', marginRight: 13}} />
      <div style={{fontSize: 22, lineHeight: 1, marginRight: 12, marginTop: -8}}>⋮</div>
    </div>
  );
};

const MainBars: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const primary = [62, 35, 42, 57, 77, 91, 104, 132, 146];
  const secondary = [31, 24, 35, 18, 42, 29, 22, 16, 8];
  const max = 180;
  const baseline = 665;
  const plotHeight = 565;

  return (
    <svg
      viewBox="0 0 920 740"
      style={{position: 'absolute', left: 43, top: 210, width: 914, height: 760, overflow: 'visible'}}
    >
      <defs>
        <linearGradient id="mainBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04b5d2" />
          <stop offset="1" stopColor="#079fca" />
        </linearGradient>
        <linearGradient id="softBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a7edf3" />
          <stop offset="1" stopColor="#77d9e8" />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map((tick) => {
        const y = baseline - (tick / max) * plotHeight;
        return (
          <g key={tick}>
            <text
              x="54"
              y={y + 6}
              textAnchor="end"
              fill={COLORS.ink}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight="650"
              fontSize="17"
            >
              {tick}
            </text>
          </g>
        );
      })}
      <line x1="73" y1="78" x2="73" y2={baseline} stroke={COLORS.ink} strokeWidth="1.15" />
      <line x1="73" y1={baseline} x2="895" y2={baseline} stroke={COLORS.ink} strokeWidth="1.15" />
      {primary.map((value, index) => {
        const firstState = [10, 158, 154, 118, 56, 8, 0, 0, 0][index];
        const fillIn = spring({
          frame,
          fps,
          delay: index * 28,
          config: {damping: 19, stiffness: 72, mass: 0.95},
        });
        const settle = reveal(frame, fps, 280 + index * 7, 180);
        const waveIn = reveal(frame, fps, 55 + index * 11, 100);
        const waveOut = reveal(frame, fps, 455, 105);
        const wave = Math.sin((frame / fps) * 1.5 + index * 0.83) * (7 + (index % 3) * 2) * waveIn * (1 - waveOut);
        const stagedValue = firstState + (value - firstState) * settle + wave;
        const height = (stagedValue / max) * plotHeight * fillIn;
        const secondaryHeight = (secondary[index] / max) * plotHeight * fillIn;
        const x = 102 + index * 86;
        return (
          <g key={index}>
            <rect x={x} y={baseline - height} width="26" height={height} rx="2" fill="url(#mainBar)" />
            <rect
              x={x + 34}
              y={baseline - secondaryHeight}
              width="20"
              height={secondaryHeight}
              rx="2"
              fill="url(#softBar)"
              opacity="0.93"
            />
          </g>
        );
      })}
    </svg>
  );
};

const PrimaryCard: React.FC = () => {
  return (
    <Card x={420} y={20} width={1000} height={1050} depth={30}>
      <SearchBar />
      <MainBars />
    </Card>
  );
};

const Donut: React.FC<{
  value: number;
  size: number;
  stroke: number;
  delay: number;
  centerLabel?: boolean;
  segments?: boolean;
  duration?: number;
}> = ({value, size, stroke, delay, centerLabel = false, segments = false, duration = 240}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = reveal(frame, fps, delay, duration);
  const animatedValue = value * progress;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * 2 * radius;

  if (segments) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={COLORS.track} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.cyanDark}
            strokeWidth={stroke}
            strokeDasharray={`${circumference * 0.34 * progress} ${circumference}`}
            strokeDashoffset={0}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={stroke}
            strokeDasharray={`${circumference * 0.36 * progress} ${circumference}`}
            strokeDashoffset={-circumference * 0.39}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.cyanSoft}
            strokeWidth={stroke}
            strokeDasharray={`${circumference * 0.20 * progress} ${circumference}`}
            strokeDashoffset={-circumference * 0.78}
          />
        </g>
      </svg>
    );
  }

  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={COLORS.track} strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - animatedValue / 100)}
          />
        </g>
      </svg>
      {centerLabel ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.cyan,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 800,
            fontSize: size * 0.17,
            letterSpacing: 1,
          }}
        >
          {Math.round(animatedValue)}%
        </div>
      ) : null}
    </div>
  );
};

const AreaAndDonut: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = reveal(frame, fps, 72, 270);

  return (
    <Card x={1440} y={20} width={850} height={410} depth={24}>
      <svg viewBox="0 0 580 320" style={{position: 'absolute', left: 20, top: 49, width: 590, height: 320}}>
        <defs>
          <clipPath id="areaReveal">
            <rect x="62" y="0" width={470 * progress} height="275" />
          </clipPath>
          <linearGradient id="areaOne" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#85dceb" stopOpacity="0.83" />
            <stop offset="1" stopColor="#5ebcd8" stopOpacity="0.52" />
          </linearGradient>
          <linearGradient id="areaTwo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#25bfda" stopOpacity="0.75" />
            <stop offset="1" stopColor="#078dbd" stopOpacity="0.67" />
          </linearGradient>
        </defs>
        {[0, 20, 40, 60, 80, 100].map((tick) => {
          const y = 270 - tick * 2.25;
          return (
            <text
              key={tick}
              x="47"
              y={y + 5}
              textAnchor="end"
              fill={COLORS.ink}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight="650"
              fontSize="14"
            >
              {tick}
            </text>
          );
        })}
        <line x1="61" y1="36" x2="61" y2="270" stroke={COLORS.ink} strokeWidth="1" />
        <line x1="61" y1="270" x2="542" y2="270" stroke={COLORS.ink} strokeWidth="1" />
        <g clipPath="url(#areaReveal)">
          <path
            d="M63 270 C88 200 120 194 151 224 C178 251 199 250 226 177 C251 113 280 144 304 204 C329 263 353 221 376 151 C400 83 430 103 448 184 C469 277 492 130 525 154 L525 270 Z"
            fill="url(#areaOne)"
          />
          <path
            d="M63 270 C92 254 113 201 139 203 C167 204 184 261 211 242 C239 223 247 146 278 149 C308 151 315 240 344 228 C371 218 384 120 411 121 C450 122 462 232 488 219 C510 208 516 154 525 151 L525 270 Z"
            fill="url(#areaTwo)"
            opacity="0.72"
          />
        </g>
      </svg>
      <div style={{position: 'absolute', right: 50, top: 100}}>
        <Donut value={100} size={190} stroke={35} delay={165} duration={82} segments />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 18,
          top: 78,
          width: 225,
          height: 230,
          color: COLORS.ink,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        <span style={{position: 'absolute', right: 3, top: 55}}>37%</span>
        <span style={{position: 'absolute', right: 52, bottom: 2}}>35%</span>
        <span style={{position: 'absolute', left: 2, top: 58}}>21%</span>
        <span style={{position: 'absolute', left: 78, top: 0}}>7%</span>
      </div>
    </Card>
  );
};

const LineChart: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = reveal(frame, fps, 38, 330);
  const ghostDraw = reveal(frame, fps, 135, 270);
  const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

  return (
    <Card x={1440} y={450} width={500} height={560} depth={27}>
      <svg viewBox="0 0 500 520" style={{position: 'absolute', inset: 14, width: 472, height: 520}}>
        <line x1="34" y1="438" x2="472" y2="438" stroke={COLORS.cyanDark} strokeWidth="2" />
        <path
          d="M35 352 L79 284 L114 337 L147 236 L179 384 L216 274 L251 341 L290 248 L326 335 L368 250 L409 343 L455 172"
          fill="none"
          stroke={COLORS.cyan}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d="M35 392 L79 338 L114 301 L147 361 L179 300 L216 346 L251 285 L290 349 L326 302 L368 325 L409 281 L455 264"
          fill="none"
          stroke="#bfeef3"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.82"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ghostDraw}
        />
        {years.map((year, index) => (
          <text
            key={year}
            x={38 + index * 69}
            y="472"
            textAnchor="middle"
            fill={COLORS.ink}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontWeight="750"
            fontSize="14.5"
          >
            {year}
          </text>
        ))}
      </svg>
    </Card>
  );
};

const RisingBars: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const values = [44, 72, 108, 127, 139];

  return (
    <Card x={1960} y={450} width={400} height={560} depth={23}>
      <svg viewBox="0 0 370 520" style={{position: 'absolute', inset: 16, width: 368, height: 520}}>
        <line x1="52" y1="66" x2="52" y2="447" stroke={COLORS.ink} strokeWidth="1.1" />
        <line x1="52" y1="447" x2="345" y2="447" stroke={COLORS.ink} strokeWidth="1.1" />
        {values.map((value, index) => {
          const p = spring({
            frame,
            fps,
            delay: 120 + index * 32,
            config: {damping: 20, stiffness: 70, mass: 1},
          });
          const height = value * 2.35 * p;
          return (
            <rect
              key={value}
              x={78 + index * 51}
              y={447 - height}
              width="34"
              height={height}
              rx="2"
              fill={index < 2 ? COLORS.cyanDark : '#149eb5'}
              opacity={0.88 + index * 0.02}
            />
          );
        })}
      </svg>
    </Card>
  );
};

const YearProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    ['2026', 92],
    ['2025', 79],
    ['2024', 62],
    ['2023', 48],
    ['2022', 35],
    ['2021', 25],
    ['2020', 14],
  ] as const;

  return (
    <Card x={420} y={1090} width={1000} height={340} depth={20}>
      <div style={{position: 'absolute', left: 88, top: 34, right: 78, bottom: 28}}>
        {rows.map(([year, value], index) => {
          const p = reveal(frame, fps, 350 + (rows.length - 1 - index) * 13, 175);
          return (
            <div
              key={year}
              style={{
                height: 38,
                display: 'grid',
                gridTemplateColumns: '78px 1fr',
                alignItems: 'center',
                gap: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 18,
                fontWeight: 750,
                color: COLORS.ink,
              }}
            >
              <span>{year}</span>
              <div style={{height: 16, position: 'relative', background: COLORS.track, overflow: 'hidden'}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${value * p}%`,
                    background: index === 0 ? COLORS.cyan : index < 3 ? COLORS.cyanDark : COLORS.cyanSoft,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const DonutCard: React.FC<{x: number; value: number; delay: number; segmented?: boolean}> = ({
  x,
  value,
  delay,
  segmented = false,
}) => {
  return (
    <Card x={x} y={1050} width={430} height={380} depth={28}>
      <div style={{position: 'absolute', left: 77, top: 48}}>
        <Donut
          value={value}
          size={275}
          stroke={52}
          delay={delay}
          duration={segmented ? 118 : 82}
          centerLabel={!segmented}
          segments={segmented}
        />
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: 2400,
        height: 1490,
        background: COLORS.canvas,
        transformStyle: 'preserve-3d',
      }}
    >
      <Sidebar />
      <PrimaryCard />
      <AreaAndDonut />
      <LineChart />
      <RisingBars />
      <YearProgress />
      <DonutCard x={1440} value={80} delay={298} />
      <DonutCard x={1890} value={100} delay={328} segmented />
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const end = Math.max(1, durationInFrames - 1);
  const phaseOne = Math.round(end * 0.15);
  const phaseTwo = Math.round(end * 0.32);
  const turn = Math.round(end * 0.63);
  const ease = Easing.inOut(Easing.cubic);

  const cameraX = interpolate(frame, [0, phaseOne, phaseTwo, turn, end], [2, -248, -472, -515, -205], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const cameraY = interpolate(frame, [0, phaseOne, phaseTwo, turn, end], [-6, -28, -182, -510, -245], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const cameraScale = interpolate(frame, [0, phaseOne, phaseTwo, turn, end], [1.08, 1.1, 1.105, 1.1, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const rotateX = interpolate(frame, [0, phaseOne, phaseTwo, turn, end], [0.35, 0.65, 1.15, 1.65, 0.75], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const rotateY = interpolate(frame, [0, phaseOne, phaseTwo, turn, end], [-0.75, -0.1, 0.8, 1.2, -0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const rotateZ = interpolate(frame, [0, phaseOne, phaseTwo, turn, end], [0.02, -0.08, -0.25, -0.4, 0.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const ambientX = interpolate(clamp(frame / end), [0, 1], [34, -76]);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 76% 18%, rgba(255,255,255,0.98) 0%, rgba(239,244,249,0.96) 43%, #e6ecf3 100%)',
        fontFamily: 'Inter, Avenir Next, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: ambientX,
          top: -220,
          width: 1180,
          height: 1180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,225,238,0.12), rgba(123,225,238,0) 68%)',
          filter: 'blur(14px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 0,
          width: 2400,
          height: 1490,
          transformOrigin: '0 0',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transform: `perspective(2600px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${cameraScale})`,
        }}
      >
        <Dashboard />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.09,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(27,61,88,0.23) 0.65px, transparent 0.8px)',
          backgroundSize: '7px 7px',
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};
