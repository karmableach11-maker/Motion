import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  canvas: '#e8f0ed',
  surface: '#fbfdfc',
  ink: '#173f3c',
  muted: '#718d87',
  emerald: '#18b889',
  teal: '#087f78',
  mint: '#9cdec8',
  grid: '#dbe7e2',
  track: '#e1e9e6',
};

const easeProgress = (frame: number, fps: number, delay: number, duration: number) =>
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
}> = ({x, y, width, height, depth = 0, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      overflow: 'hidden',
      borderRadius: 24,
      background: C.surface,
      border: '1px solid rgba(255,255,255,0.96)',
      boxShadow:
        '18px 20px 34px rgba(69,101,91,0.18), -13px -13px 25px rgba(255,255,255,0.96), inset 0 1px 0 rgba(255,255,255,0.98)',
      transform: `translateZ(${depth}px)`,
      backfaceVisibility: 'hidden',
    }}
  >
    {children}
  </div>
);

const SectionTitle: React.FC<{title: string; subtitle: string}> = ({title, subtitle}) => (
  <div style={{position: 'absolute', left: 42, top: 31}}>
    <div
      style={{
        color: C.ink,
        fontFamily: 'Inter, Avenir Next, Helvetica, Arial, sans-serif',
        fontSize: 17,
        fontWeight: 790,
        letterSpacing: 2.4,
      }}
    >
      {title}
    </div>
    <div
      style={{
        marginTop: 7,
        color: C.muted,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        fontWeight: 650,
        letterSpacing: 1.1,
      }}
    >
      {subtitle}
    </div>
  </div>
);

const NavIcon: React.FC<{type: number}> = ({type}) => {
  const common = {
    fill: 'none',
    stroke: C.teal,
    strokeWidth: 2.05,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const icons = [
    <path key="energy" {...common} d="m13.5 2.5-7 11h5l-1 8 7-11h-5l1-8Z" />,
    <g key="emissions"><path {...common} d="M5.2 16.8h12.9a3.4 3.4 0 0 0 .3-6.8A6.2 6.2 0 0 0 6.5 8.7a4.1 4.1 0 0 0-1.3 8.1Z" /><path {...common} d="M8 20h8" /></g>,
    <g key="efficiency"><path {...common} d="M4 16.8a8.7 8.7 0 1 1 16 0" /><path {...common} d="m12 13 4.6-4.1M7.2 18.5h9.6" /></g>,
    <g key="water"><path {...common} d="M12 3.2s5.3 6.2 5.3 10.6a5.3 5.3 0 0 1-10.6 0C6.7 9.4 12 3.2 12 3.2Z" /><path {...common} d="M9.5 14.4c.3 1.4 1.2 2.2 2.6 2.4" /></g>,
    <g key="facility"><path {...common} d="M4 20V8l6 3V6l10 4v10H4Z" /><path {...common} d="M8 15h1M13 15h1M17 15h1" /></g>,
    <g key="target"><circle {...common} cx="12" cy="12" r="8.5" /><circle {...common} cx="12" cy="12" r="4.5" /><path {...common} d="M12 3.5V1M20.5 12H23" /></g>,
    <g key="report"><path {...common} d="M6 3.5h9l3 3v14H6zM15 3.5v4h3M9 12h6M9 16h6" /></g>,
    <g key="archive"><path {...common} d="M4 7h16v13H4zM3 4h18v4H3zM9 12h6" /></g>,
  ];

  return <svg width="25" height="25" viewBox="0 0 24 24">{icons[type]}</svg>;
};

const Sidebar: React.FC = () => {
  const items = ['Energy', 'Emissions', 'Efficiency', 'Water', 'Facilities', 'Targets', 'Reports', 'Archive'];

  return (
    <Card x={22} y={20} width={370} height={1430} depth={18}>
      <div
        style={{
          padding: '44px 42px',
          fontFamily: 'Inter, Avenir Next, Helvetica, Arial, sans-serif',
          color: C.ink,
        }}
      >
        <div style={{fontSize: 13, letterSpacing: 3.6, fontWeight: 820, color: C.muted, marginBottom: 55}}>
          SUSTAINABILITY
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 31}}>
          {items.map((item, index) => (
            <div key={item} style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <NavIcon type={index} />
              <div
                style={{
                  fontSize: 20,
                  fontWeight: index === 0 ? 780 : 650,
                  color: index === 0 ? C.emerald : C.teal,
                  letterSpacing: 1.65,
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
            paddingTop: 25,
            borderTop: `1px solid ${C.grid}`,
            color: C.muted,
            fontSize: 13,
            letterSpacing: 2.3,
          }}
        >
          ILLUSTRATIVE · 2020–2026
        </div>
      </div>
    </Card>
  );
};

const SearchBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const caret = 0.56 + Math.sin((frame / fps) * 2.1) * 0.16;

  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 62,
        width: 610,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        background: 'linear-gradient(90deg, rgba(156,222,200,0.78), rgba(215,243,233,0.48))',
        boxShadow: 'inset 0 2px 8px rgba(8,127,120,0.08)',
        color: '#557b74',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 18,
      }}
    >
      <span style={{paddingLeft: 16}}>Search metrics</span>
      <span style={{width: 2, height: 21, marginLeft: 5, background: `rgba(85,123,116,${caret})`}} />
      <svg style={{marginLeft: 'auto', marginRight: 18}} width="23" height="23" viewBox="0 0 24 24">
        <circle cx="10.7" cy="10.7" r="6.6" fill="none" stroke="#4e8178" strokeWidth="1.8" />
        <path d="m15.8 15.8 4.2 4.2" fill="none" stroke="#4e8178" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div style={{height: 27, width: 1, background: 'rgba(78,129,120,.23)', marginRight: 13}} />
      <div style={{fontSize: 22, lineHeight: 1, marginRight: 12, marginTop: -8}}>⋮</div>
    </div>
  );
};

const EnergyBars: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  const renewable = [42, 55, 68, 84, 103, 126, 148];
  const conventional = [142, 132, 118, 104, 90, 76, 62];
  const initialRenewable = [8, 48, 78, 32, 0, 0, 0];
  const initialConventional = [24, 151, 139, 92, 0, 0, 0];
  const baseline = 630;
  const plotHeight = 515;
  const max = 180;

  return (
    <svg viewBox="0 0 920 710" style={{position: 'absolute', left: 42, top: 246, width: 914, height: 720}}>
      <defs>
        <linearGradient id="renewableBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#19c18f" />
          <stop offset="1" stopColor="#089879" />
        </linearGradient>
        <linearGradient id="conventionalBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9e3cf" />
          <stop offset="1" stopColor="#7bcdb3" />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map((tick) => {
        const y = baseline - (tick / max) * plotHeight;
        return (
          <text
            key={tick}
            x="54"
            y={y + 6}
            textAnchor="end"
            fill={C.ink}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontWeight="680"
            fontSize="16"
          >
            {tick}
          </text>
        );
      })}
      <line x1="73" y1="92" x2="73" y2={baseline} stroke={C.ink} strokeWidth="1.1" />
      <line x1="73" y1={baseline} x2="900" y2={baseline} stroke={C.ink} strokeWidth="1.1" />
      {years.map((year, index) => {
        const fill = spring({frame, fps, delay: index * 29, config: {damping: 20, stiffness: 73, mass: 0.95}});
        const settle = easeProgress(frame, fps, 275 + index * 7, 175);
        const waveIn = easeProgress(frame, fps, 50 + index * 11, 100);
        const waveOut = easeProgress(frame, fps, 460, 100);
        const wave = Math.sin((frame / fps) * 1.45 + index * 0.76) * (5 + (index % 2) * 3) * waveIn * (1 - waveOut);
        const greenValue = initialRenewable[index] + (renewable[index] - initialRenewable[index]) * settle + wave;
        const mintValue = initialConventional[index] + (conventional[index] - initialConventional[index]) * settle - wave * 0.6;
        const greenHeight = Math.max(0, (greenValue / max) * plotHeight * fill);
        const mintHeight = Math.max(0, (mintValue / max) * plotHeight * fill);
        const x = 105 + index * 111;
        return (
          <g key={year}>
            <rect x={x} y={baseline - greenHeight} width="31" height={greenHeight} rx="2" fill="url(#renewableBar)" />
            <rect x={x + 39} y={baseline - mintHeight} width="25" height={mintHeight} rx="2" fill="url(#conventionalBar)" />
            <text
              x={x + 31}
              y={baseline + 35}
              textAnchor="middle"
              fill={C.ink}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontWeight="720"
              fontSize="13"
            >
              {year}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const PrimaryCard: React.FC = () => (
  <Card x={420} y={20} width={1000} height={1050} depth={30}>
    <SearchBar />
    <div style={{position: 'absolute', left: 72, top: 156}}>
      <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 2.6, color: C.ink}}>ENERGY TRANSITION</div>
      <div style={{marginTop: 7, fontSize: 13, color: C.muted, letterSpacing: 1.25}}>ANNUAL OUTPUT · GWh</div>
    </div>
    <div style={{position: 'absolute', right: 72, top: 166, display: 'flex', gap: 28, color: C.muted, fontSize: 12, fontWeight: 700, letterSpacing: 1.1}}>
      <span style={{display: 'flex', alignItems: 'center', gap: 8}}><i style={{width: 13, height: 13, background: C.emerald, borderRadius: 2}} />RENEWABLE</span>
      <span style={{display: 'flex', alignItems: 'center', gap: 8}}><i style={{width: 13, height: 13, background: C.mint, borderRadius: 2}} />CONVENTIONAL</span>
    </div>
    <EnergyBars />
  </Card>
);

const Ring: React.FC<{
  value: number;
  size: number;
  stroke: number;
  delay: number;
  duration: number;
  label?: boolean;
  segmented?: boolean;
}> = ({value, size, stroke, delay, duration, label = false, segmented = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = easeProgress(frame, fps, delay, duration);
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * 2 * radius;

  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.track} strokeWidth={stroke} />
          {segmented ? (
            <>
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.teal} strokeWidth={stroke} strokeDasharray={`${circumference * 0.32 * p} ${circumference}`} />
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.emerald} strokeWidth={stroke} strokeDasharray={`${circumference * 0.38 * p} ${circumference}`} strokeDashoffset={-circumference * 0.36} />
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.mint} strokeWidth={stroke} strokeDasharray={`${circumference * 0.20 * p} ${circumference}`} strokeDashoffset={-circumference * 0.78} />
            </>
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={C.emerald}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - (value * p) / 100)}
            />
          )}
        </g>
      </svg>
      {label ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.emerald,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 820,
            fontSize: size * 0.17,
          }}
        >
          {Math.round(value * p)}%
        </div>
      ) : null}
    </div>
  );
};

const SourceMixCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = easeProgress(frame, fps, 70, 260);

  return (
    <Card x={1440} y={20} width={850} height={410} depth={24}>
      <SectionTitle title="ENERGY SOURCES" subtitle="SOLAR · WIND · STORAGE" />
      <svg viewBox="0 0 580 310" style={{position: 'absolute', left: 18, top: 76, width: 590, height: 308}}>
        <defs>
          <clipPath id="sourceReveal"><rect x="62" y="0" width={475 * p} height="280" /></clipPath>
          <linearGradient id="solarArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9cdec8" stopOpacity="0.86" /><stop offset="1" stopColor="#79cdb1" stopOpacity="0.45" /></linearGradient>
          <linearGradient id="windArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18b889" stopOpacity="0.74" /><stop offset="1" stopColor="#087f78" stopOpacity="0.56" /></linearGradient>
        </defs>
        {[0, 20, 40, 60, 80, 100].map((tick) => <text key={tick} x="47" y={267 - tick * 2.2} textAnchor="end" fill={C.ink} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="650" fontSize="14">{tick}</text>)}
        <line x1="61" y1="35" x2="61" y2="270" stroke={C.ink} strokeWidth="1" />
        <line x1="61" y1="270" x2="542" y2="270" stroke={C.ink} strokeWidth="1" />
        <g clipPath="url(#sourceReveal)">
          <path d="M63 270 C90 226 116 199 146 218 C177 237 192 252 221 187 C249 123 278 137 307 203 C334 264 360 216 387 150 C414 84 445 118 466 186 C488 255 508 165 527 134 L527 270Z" fill="url(#solarArea)" />
          <path d="M63 270 C93 250 112 207 141 205 C169 203 184 258 214 242 C247 224 254 157 283 150 C316 142 327 239 354 227 C386 213 397 129 425 121 C459 111 473 232 501 217 C517 208 522 165 527 134 L527 270Z" fill="url(#windArea)" opacity="0.72" />
        </g>
      </svg>
      <div style={{position: 'absolute', right: 42, top: 100}}><Ring value={74} size={190} stroke={34} delay={165} duration={82} label /></div>
      <div style={{position: 'absolute', right: 59, bottom: 43, color: C.muted, fontSize: 12, fontWeight: 760, letterSpacing: 1.7}}>RENEWABLE SHARE</div>
    </Card>
  );
};

const EmissionsCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const draw = easeProgress(frame, fps, 42, 320);
  const targetDraw = easeProgress(frame, fps, 132, 260);
  const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

  return (
    <Card x={1440} y={450} width={500} height={560} depth={27}>
      <SectionTitle title="EMISSIONS INTENSITY" subtitle="kg CO₂e / MWh" />
      <div style={{position: 'absolute', right: 30, top: 42, display: 'flex', gap: 16, color: C.muted, fontSize: 10, fontWeight: 760, letterSpacing: 1}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 6}}><i style={{width: 16, height: 3, background: C.emerald}} />ACTUAL</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 6}}><i style={{width: 16, height: 3, background: C.mint}} />TARGET</span>
      </div>
      <svg viewBox="0 0 500 520" style={{position: 'absolute', inset: 14, width: 472, height: 520}}>
        <line x1="34" y1="438" x2="472" y2="438" stroke={C.teal} strokeWidth="2" />
        <path
          d="M38 152 L105 194 L174 221 L242 278 L310 302 L379 351 L455 382"
          fill="none"
          stroke={C.emerald}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d="M38 178 L105 218 L174 252 L242 289 L310 326 L379 362 L455 397"
          fill="none"
          stroke={C.mint}
          strokeWidth="2.5"
          strokeDasharray="8 9"
          pathLength={1}
          strokeDashoffset={1 - targetDraw}
          opacity="0.95"
        />
        {[38, 105, 174, 242, 310, 379, 455].map((x, index) => (
          <g key={years[index]}>
            <circle cx={x} cy={[152, 194, 221, 278, 302, 351, 382][index]} r="5" fill={C.surface} stroke={C.emerald} strokeWidth="3" opacity={draw} />
            <text x={x} y="472" textAnchor="middle" fill={C.ink} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="750" fontSize="14.5">{years[index]}</text>
          </g>
        ))}
      </svg>
    </Card>
  );
};

const EfficiencyCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const values = [58, 63, 69, 74, 80, 86, 92];

  return (
    <Card x={1960} y={450} width={400} height={560} depth={23}>
      <SectionTitle title="EFFICIENCY INDEX" subtitle="FACILITY PERFORMANCE" />
      <svg viewBox="0 0 370 500" style={{position: 'absolute', left: 14, top: 51, width: 370, height: 500}}>
        <line x1="52" y1="72" x2="52" y2="430" stroke={C.ink} strokeWidth="1.1" />
        <line x1="52" y1="430" x2="346" y2="430" stroke={C.ink} strokeWidth="1.1" />
        {values.map((value, index) => {
          const p = spring({frame, fps, delay: 118 + index * 29, config: {damping: 20, stiffness: 72, mass: 1}});
          const height = value * 3.2 * p;
          const x = 66 + index * 40;
          return (
            <g key={value}>
              <rect x={x} y={430 - height} width="25" height={height} rx="2" fill={index < 3 ? C.teal : C.emerald} opacity={0.84 + index * 0.022} />
              <text x={x + 12.5} y="456" textAnchor="middle" fill={C.ink} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="730" fontSize="12">{20 + index}</text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

const AnnualEfficiency: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    ['2026', 92],
    ['2025', 88],
    ['2024', 84],
    ['2023', 80],
    ['2022', 75],
    ['2021', 70],
    ['2020', 64],
  ] as const;

  return (
    <Card x={420} y={1090} width={1000} height={340} depth={20}>
      <div style={{position: 'absolute', left: 54, top: 26, color: C.ink, fontSize: 14, fontWeight: 800, letterSpacing: 2.1}}>ANNUAL EFFICIENCY</div>
      <div style={{position: 'absolute', left: 70, top: 63, right: 62}}>
        {rows.map(([year, value], index) => {
          const p = easeProgress(frame, fps, 340 + (rows.length - 1 - index) * 11, 140);
          return (
            <div key={year} style={{height: 36, display: 'grid', gridTemplateColumns: '70px 1fr 46px', alignItems: 'center', gap: 13, color: C.ink, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 16, fontWeight: 760}}>
              <span>{year}</span>
              <div style={{height: 15, position: 'relative', overflow: 'hidden', background: C.track}}>
                <div style={{position: 'absolute', inset: 0, width: `${value * p}%`, background: index < 2 ? C.emerald : index < 4 ? C.teal : C.mint}} />
              </div>
              <span style={{textAlign: 'right', color: C.muted}}>{Math.round(value * p)}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const EnergySavedCard: React.FC = () => (
  <Card x={1440} y={1050} width={430} height={380} depth={28}>
    <SectionTitle title="TRANSITION TARGET" subtitle="2026 PROGRAM PROGRESS" />
    <div style={{position: 'absolute', left: 77, top: 82}}><Ring value={86} size={275} stroke={52} delay={298} duration={82} label /></div>
  </Card>
);

const ResourceMixCard: React.FC = () => (
  <Card x={1890} y={1050} width={430} height={380} depth={28}>
    <SectionTitle title="RESOURCE MIX" subtitle="WIND 38 · SOLAR 32 · STORAGE 20 · GRID 10" />
    <div style={{position: 'absolute', left: 77, top: 82}}><Ring value={100} size={275} stroke={52} delay={328} duration={118} segmented /></div>
  </Card>
);

const Dashboard: React.FC = () => (
  <div style={{position: 'relative', width: 2400, height: 1490, background: C.canvas, transformStyle: 'preserve-3d'}}>
    <Sidebar />
    <PrimaryCard />
    <SourceMixCard />
    <EmissionsCard />
    <EfficiencyCard />
    <AnnualEfficiency />
    <EnergySavedCard />
    <ResourceMixCard />
  </div>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const end = Math.max(1, durationInFrames - 1);
  const phaseOne = Math.round(end * 0.15);
  const phaseTwo = Math.round(end * 0.32);
  const turn = Math.round(end * 0.63);
  const ease = Easing.inOut(Easing.cubic);
  const keys = [0, phaseOne, phaseTwo, turn, end];
  const cameraX = interpolate(frame, keys, [2, -248, -472, -515, -205], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const cameraY = interpolate(frame, keys, [-6, -28, -182, -510, -245], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const cameraScale = interpolate(frame, keys, [1.08, 1.1, 1.105, 1.1, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const rotateX = interpolate(frame, keys, [0.35, 0.65, 1.15, 1.65, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const rotateY = interpolate(frame, keys, [-0.75, -0.1, 0.8, 1.2, -0.7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const rotateZ = interpolate(frame, keys, [0.02, -0.08, -0.25, -0.4, 0.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const ambientX = interpolate(frame, [0, end], [36, -74], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: 'radial-gradient(circle at 76% 18%, rgba(255,255,255,0.98) 0%, rgba(239,246,243,0.96) 43%, #e4ece9 100%)',
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
          background: 'radial-gradient(circle, rgba(98,210,171,0.13), rgba(98,210,171,0) 68%)',
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
          opacity: 0.085,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(28,75,65,0.22) 0.65px, transparent 0.8px)',
          backgroundSize: '7px 7px',
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};
