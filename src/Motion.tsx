import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  pearl: '#eef2ed',
  paper: '#f8faf6',
  sage: '#dce7df',
  ink: '#10181a',
  graphite: '#172123',
  graphite2: '#0e1618',
  muted: '#687476',
  line: '#cbd5ce',
  emerald: '#2f9f78',
  mint: '#62d4a7',
  blue: '#3878d8',
  sky: '#69b9ee',
  amber: '#d99836',
  coral: '#e66d58',
  white: '#ffffff',
};

const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const soft = Easing.bezier(0.4, 0, 0.2, 1);
const p = (frame: number, from: number, to: number, easing = ease) =>
  clamp(
    interpolate(frame, [from, to], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing,
    }),
  );
const life = (frame: number, from: number, to: number, exitFrom = 846, exitTo = 900) =>
  p(frame, from, to) * (1 - p(frame, exitFrom, exitTo));

const rgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
};

const LightPanel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  reveal: number;
  children: React.ReactNode;
  radius?: number;
  style?: React.CSSProperties;
}> = ({x, y, width, height, reveal, children, radius = 24, style}) => (
  <div
    data-safe-object="true"
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      boxSizing: 'border-box',
      overflow: 'hidden',
      borderRadius: radius,
      border: '1px solid rgba(35,66,57,.12)',
      background: 'linear-gradient(145deg, rgba(255,255,255,.91), rgba(245,249,244,.83))',
      boxShadow: '0 24px 72px rgba(32,55,45,.11), inset 0 1px 0 rgba(255,255,255,.9)',
      opacity: reveal,
      transform: `translate3d(0, ${(1 - reveal) * 18}px, 0) scale(${0.987 + reveal * 0.013})`,
      transformOrigin: '50% 50%',
      willChange: 'transform, opacity',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(122deg, rgba(255,255,255,.5), transparent 29%, transparent 72%, rgba(74,145,114,.035))',
      }}
    />
    {children}
  </div>
);

const Ambient: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const exit = 1 - p(timeline, 850, 900);
  const dots = Array.from({length: 48}, (_, index) => ({
    x: 35 + ((index * 179 + 53) % 1850),
    y: 28 + ((index * 109 + 71) % 1020),
    size: 1 + (index % 4) * 0.5,
  }));
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${18 + Math.sin(phase) * 2}% ${21 + Math.cos(phase) * 2}%, rgba(255,255,255,.96), transparent 30%), radial-gradient(circle at ${82 + Math.cos(phase) * 2}% ${24 + Math.sin(phase) * 2}%, ${rgba(C.sky, 0.15)}, transparent 34%), radial-gradient(circle at 48% 94%, ${rgba(C.mint, 0.17)}, transparent 37%), linear-gradient(145deg, ${C.pearl}, ${C.sage} 58%, #e8eee8)`,
        }}
      />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: 0.46 * exit}}>
        <defs>
          <linearGradient id="ambient-contour" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={C.emerald} stopOpacity=".2" />
            <stop offset=".5" stopColor={C.blue} stopOpacity=".11" />
            <stop offset="1" stopColor={C.amber} stopOpacity=".16" />
          </linearGradient>
          <filter id="ambient-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        {Array.from({length: 11}, (_, index) => {
          const y = 110 + index * 83 + Math.sin(phase + index * 0.62) * 8;
          return (
            <path
              key={index}
              d={`M-120 ${y} C260 ${y - 106} 490 ${y + 112} 870 ${y - 18} S1490 ${y - 80} 2050 ${y + 36}`}
              fill="none"
              stroke="url(#ambient-contour)"
              strokeWidth={index % 3 === 0 ? 1.1 : 0.7}
              strokeDasharray={index % 2 === 0 ? '3 14' : undefined}
              strokeDashoffset={-timeline * (0.07 + index * 0.003)}
              opacity={0.16 + (index % 4) * 0.045}
            />
          );
        })}
        <ellipse cx={1460 + Math.sin(phase) * 12} cy={515 + Math.cos(phase) * 8} rx="390" ry="250" fill={C.sky} opacity=".035" filter="url(#ambient-soft)" />
        <ellipse cx={430 + Math.cos(phase) * 10} cy={780 + Math.sin(phase) * 8} rx="330" ry="210" fill={C.mint} opacity=".04" filter="url(#ambient-soft)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.032,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(18,41,34,.38) 0, rgba(18,41,34,.38) 1px, transparent 1px, transparent 5px)',
          mixBlendMode: 'multiply',
        }}
      />
      {dots.map((dot, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: dot.x + Math.sin(phase * (0.7 + (index % 3) * 0.12) + index) * 5,
            top: dot.y + Math.cos(phase * (0.9 + (index % 4) * 0.09) + index) * 4,
            width: dot.size,
            height: dot.size,
            borderRadius: 8,
            background: index % 10 === 0 ? C.blue : index % 8 === 0 ? C.emerald : C.ink,
            opacity: (0.04 + (index % 5) * 0.01) * exit,
          }}
        />
      ))}
      <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 120px rgba(48,77,63,.08)', pointerEvents: 'none'}} />
    </>
  );
};

const Header: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 8, 68, 850, 900);
  const complete = p(timeline, 730, 790);
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        top: 45,
        height: 83,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * -12}px)`,
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 15}}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 20,
            display: 'grid',
            placeItems: 'center',
            border: `1px solid ${rgba(C.emerald, 0.26)}`,
            background: 'linear-gradient(145deg, rgba(255,255,255,.95), rgba(219,235,224,.75))',
            boxShadow: '0 12px 32px rgba(37,82,62,.12), inset 0 1px 0 white',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="13" fill="none" stroke={C.emerald} strokeWidth="1.5" />
            <path d="M9 23 L14 18 L19 20 L27 10" fill="none" stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="27" cy="10" r="3" fill={C.amber} />
            <circle cx="18" cy="18" r="16" fill="none" stroke={rgba(C.blue, 0.32)} strokeWidth=".8" strokeDasharray="3 5" strokeDashoffset={-timeline * 0.1} />
          </svg>
        </div>
        <div>
          <div style={{fontSize: 27, color: C.ink, fontWeight: 900, letterSpacing: 0.9}}>AI INVESTMENT COPILOT</div>
          <div style={{marginTop: 7, fontSize: 12.5, color: C.muted, fontWeight: 730, letterSpacing: 0.72}}>PORTFOLIO SCENARIO LAB · ILLUSTRATIVE DATA</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 0, top: 8, display: 'flex', alignItems: 'center', gap: 11}}>
        <div style={{height: 41, padding: '0 15px', borderRadius: 13, display: 'flex', alignItems: 'center', border: `1px solid ${rgba(C.ink, 0.1)}`, background: 'rgba(255,255,255,.62)', color: C.muted, fontSize: 11.5, fontWeight: 790, letterSpacing: 0.56}}>SIMULATION MODE</div>
        <div
          style={{
            height: 41,
            minWidth: 178,
            padding: '0 16px',
            borderRadius: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            border: `1px solid ${rgba(complete > 0.9 ? C.emerald : C.blue, 0.25)}`,
            background: rgba(complete > 0.9 ? C.emerald : C.blue, 0.06),
            color: complete > 0.9 ? C.emerald : C.blue,
            fontSize: 11.5,
            fontWeight: 850,
            letterSpacing: 0.6,
          }}
        >
          <span style={{width: 7, height: 7, borderRadius: 7, background: complete > 0.9 ? C.emerald : C.blue, boxShadow: `0 0 ${7 + Math.sin(phase * 4) * 2}px ${complete > 0.9 ? C.emerald : C.blue}`}} />
          {complete > 0.9 ? 'PLAN READY' : 'COPILOT ONLINE'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: `linear-gradient(90deg, ${rgba(C.emerald, 0.28)}, ${rgba(C.blue, 0.16)}, transparent 78%)`}} />
    </div>
  );
};

const PromptChip: React.FC<{label: string; color: string; index: number; timeline: number}> = ({label, color, index, timeline}) => {
  const reveal = life(timeline, 126 + index * 15, 168 + index * 15, 840, 900);
  return (
    <div
      style={{
        height: 31,
        padding: '0 11px',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        border: `1px solid ${rgba(color, 0.17)}`,
        background: rgba(color, 0.045),
        color: C.ink,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 7}px)`,
        fontFamily: FONT,
        fontSize: 10.5,
        fontWeight: 820,
        letterSpacing: 0.54,
      }}
    >
      <span style={{width: 6, height: 6, borderRadius: 7, background: color}} />
      {label}
    </div>
  );
};

const GenerateButton: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const hover = p(timeline, 246, 275);
  const pressIn = p(timeline, 276, 288, soft);
  const pressOut = p(timeline, 288, 310, ease);
  const press = pressIn * (1 - pressOut);
  const ripple = p(timeline, 288, 346, soft);
  const processing = timeline >= 307 && timeline < 365;
  const done = p(timeline, 360, 390);
  const cursorMove = p(timeline, 232, 274);
  const scale = 1 + hover * 0.03 - press * 0.12 + pressOut * 0.018;
  return (
    <div style={{position: 'absolute', right: 18, top: 17, width: 92, height: 92}}>
      {[0, 1].map((index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: 46,
            top: 46,
            width: 82,
            height: 82,
            marginLeft: -41,
            marginTop: -41,
            borderRadius: 50,
            border: `1.5px solid ${rgba(index ? C.sky : C.emerald, (1 - ripple) * 0.62)}`,
            opacity: ripple,
            transform: `scale(${0.76 + ripple * (1.28 + index * 0.42)})`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 30,
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(145deg, ${done > 0.9 ? C.emerald : C.graphite}, ${done > 0.9 ? '#257f63' : C.graphite2})`,
          border: `1px solid ${rgba(done > 0.9 ? C.emerald : C.blue, 0.42 + hover * 0.18)}`,
          boxShadow: `0 16px 34px rgba(18,44,37,.2), 0 0 ${14 + hover * 18}px ${rgba(done > 0.9 ? C.emerald : C.blue, 0.13)}, inset 0 1px 0 rgba(255,255,255,.12)`,
          transform: `scale(${scale})`,
        }}
      >
        {!processing && done < 0.82 ? (
          <svg width="38" height="38" viewBox="0 0 38 38">
            <path d="M8 19 H28 M21 11 L29 19 L21 27" fill="none" stroke={C.white} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        {processing ? (
          <svg width="42" height="42" viewBox="0 0 42 42" style={{transform: `rotate(${timeline * 3}deg)`}}>
            <circle cx="21" cy="21" r="14" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="3" />
            <path d="M21 7 A14 14 0 0 1 35 21" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : null}
        {done >= 0.82 ? (
          <svg width="36" height="36" viewBox="0 0 36 36">
            <path d="M8 18 L15 25 L28 11" fill="none" stroke={C.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: interpolate(cursorMove, [0, 1], [-236, 34]),
          top: interpolate(cursorMove, [0, 1], [128, 57]),
          width: 34,
          height: 42,
          opacity: life(timeline, 224, 244, 306, 330),
          transform: `translate(${press * 3}px, ${press * 3}px) scale(${0.96 - press * 0.08})`,
          filter: 'drop-shadow(0 5px 7px rgba(18,34,29,.32))',
        }}
      >
        <svg width="34" height="42" viewBox="0 0 34 42">
          <path d="M4 3 L29 24 L18 26 L12 38 Z" fill={C.white} stroke={C.ink} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const PromptBar: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 28, 92, 842, 900);
  const typing = p(timeline, 70, 230);
  const prompt = 'Build a resilient 5-year investment strategy';
  const typed = prompt.slice(0, Math.floor(prompt.length * typing));
  const cursor = typing < 0.995 && Math.floor(timeline / 18) % 2 === 0;
  const submitted = p(timeline, 292, 340);
  const scenariosReady = p(timeline, 492, 552);
  return (
    <LightPanel x={72} y={147} width={1776} height={128} reveal={reveal} radius={27}>
      <div style={{position: 'absolute', left: 24, top: 23, width: 64, height: 64, borderRadius: 21, display: 'grid', placeItems: 'center', border: `1px solid ${rgba(C.emerald, 0.18)}`, background: `radial-gradient(circle at 35% 30%, ${C.white}, ${rgba(C.mint, 0.16)})`}}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <path d="M18 4 L21 14 L31 18 L21 21 L18 31 L15 21 L5 18 L15 14Z" fill={C.emerald} opacity=".9" />
          <circle cx="27" cy="9" r="3" fill={C.blue} />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 109, top: 18, right: 132, height: 50, display: 'flex', alignItems: 'center', fontFamily: FONT}}>
        <span style={{fontSize: 29, color: C.ink, fontWeight: 670, letterSpacing: -0.25}}>{typed}</span>
        <span style={{display: 'inline-block', marginLeft: 5, width: 2, height: 31, borderRadius: 3, background: C.emerald, opacity: cursor ? 1 : typing < 0.995 ? 0.18 : 0}} />
      </div>
      <div style={{position: 'absolute', left: 109, top: 77, display: 'flex', gap: 9}}>
        <PromptChip label="HORIZON 5 YEARS" color={C.blue} index={0} timeline={timeline} />
        <PromptChip label="RISK MODERATE" color={C.amber} index={1} timeline={timeline} />
        <PromptChip label="LIQUIDITY HIGH" color={C.emerald} index={2} timeline={timeline} />
      </div>
      <div style={{position: 'absolute', right: 128, top: 86, color: submitted > 0.9 ? C.emerald : C.muted, fontFamily: FONT, fontSize: 10.5, fontWeight: 820, letterSpacing: 0.64}}>
        {scenariosReady > 0.9 ? 'SCENARIOS READY' : submitted > 0.9 ? 'MODELING 3 SCENARIOS' : 'GENERATE SCENARIOS'}
      </div>
      <GenerateButton timeline={timeline} phase={phase} />
      <div style={{position: 'absolute', top: 0, bottom: 0, width: 110, left: `${-150 + ((timeline * 0.34) % 2050)}px`, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent)', transform: 'skewX(-16deg)', opacity: reveal * 0.45}} />
    </LightPanel>
  );
};

type Scenario = {
  title: string;
  returnValue: number;
  volatility: number;
  liquidity: number;
  color: string;
};

const SCENARIOS: Scenario[] = [
  {title: 'CAPITAL PRESERVATION', returnValue: 4.2, volatility: 5.8, liquidity: 92, color: C.sky},
  {title: 'BALANCED GROWTH', returnValue: 7.6, volatility: 10.9, liquidity: 84, color: C.emerald},
  {title: 'ACCELERATED GROWTH', returnValue: 10.8, volatility: 17.4, liquidity: 72, color: C.amber},
];

const ForecastChart: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 304, 370, 832, 900);
  const draw = [p(timeline, 330, 470), p(timeline, 352, 492), p(timeline, 374, 514)];
  const select = p(timeline, 492, 552);
  const scan = p(timeline, 430, 555);
  const scanX = 92 + scan * 906;
  const lines = [
    {d: 'M92 305 C250 289 396 269 555 246 S838 213 1000 184', band: 'M92 318 C250 302 396 282 555 259 S838 226 1000 197 L1000 170 C838 199 713 214 555 233 S250 276 92 292 Z', color: C.sky},
    {d: 'M92 305 C248 276 392 236 553 203 S836 142 1000 112', band: 'M92 321 C248 292 392 252 553 219 S836 158 1000 128 L1000 94 C836 124 713 148 553 187 S248 260 92 289 Z', color: C.emerald},
    {d: 'M92 305 C247 264 390 207 552 161 S834 88 1000 59', band: 'M92 325 C247 284 390 227 552 181 S834 108 1000 79 L1000 38 C834 67 710 98 552 141 S247 244 92 285 Z', color: C.amber},
  ];
  return (
    <svg width="1138" height="458" viewBox="0 0 1138 458" style={{position: 'absolute', inset: 0, opacity: reveal}}>
      <defs>
        <linearGradient id="chart-panel" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={C.graphite} />
          <stop offset="1" stopColor={C.graphite2} />
        </linearGradient>
        <linearGradient id="band-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.sky} stopOpacity=".18" /><stop offset="1" stopColor={C.sky} stopOpacity=".015" /></linearGradient>
        <linearGradient id="band-emerald" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.mint} stopOpacity={0.2 + select * 0.13} /><stop offset="1" stopColor={C.emerald} stopOpacity=".02" /></linearGradient>
        <linearGradient id="band-amber" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.amber} stopOpacity=".17" /><stop offset="1" stopColor={C.amber} stopOpacity=".015" /></linearGradient>
        <filter id="chart-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <clipPath id="chart-clip"><rect x="62" y="34" width="976" height="302" rx="10" /></clipPath>
      </defs>
      <rect x="0" y="0" width="1138" height="458" rx="25" fill="url(#chart-panel)" />
      <rect x="1" y="1" width="1136" height="456" rx="24" fill="none" stroke="rgba(255,255,255,.08)" />
      <text x="34" y="41" fill={C.white} fontFamily={FONT} fontSize="17" fontWeight="850" letterSpacing=".65">PROJECTED PORTFOLIO RANGE</text>
      <text x="34" y="62" fill="rgba(225,237,231,.52)" fontFamily={FONT} fontSize="10.5" fontWeight="720" letterSpacing=".62">FIVE-YEAR SIMULATED OUTLOOK</text>
      <g fontFamily={FONT} fontSize="10.5" fontWeight="760">
        {SCENARIOS.map((scenario, index) => (
          <g key={scenario.title} transform={`translate(${708 + index * 133}, 30)`} opacity={0.72 + (index === 1 ? select * 0.28 : 0)}>
            <circle cx="0" cy="0" r="4" fill={scenario.color} />
            <text x="10" y="4" fill={index === 1 && select > 0.6 ? C.white : 'rgba(225,237,231,.68)'}>{['PRESERVE', 'BALANCED', 'GROWTH'][index]}</text>
          </g>
        ))}
      </g>
      <g clipPath="url(#chart-clip)">
        {[105, 167, 229, 291].map((y) => <line key={y} x1="68" y1={y} x2="1030" y2={y} stroke="rgba(207,229,216,.09)" strokeDasharray="3 8" />)}
        {[92, 274, 456, 638, 820, 1000].map((x) => <line key={x} x1={x} y1="82" x2={x} y2="324" stroke="rgba(207,229,216,.065)" />)}
        {lines.map((line, index) => (
          <g key={line.d} opacity={draw[index]}>
            <path d={line.band} fill={`url(#${['band-sky', 'band-emerald', 'band-amber'][index]})`} />
            <path d={line.d} fill="none" stroke={line.color} strokeWidth={index === 1 ? 2.8 + select * 0.9 : 2.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw[index]} filter={index === 1 && select > 0.4 ? 'url(#chart-glow)' : undefined} opacity={index === 1 ? 0.82 + select * 0.18 : 0.72 - select * 0.14} />
            <circle cx="1000" cy={[184, 112, 59][index]} r={4 + (index === 1 ? select * 2 : 0)} fill={C.white} stroke={line.color} strokeWidth="2" filter="url(#chart-glow)" />
          </g>
        ))}
        <rect x={scanX} y="78" width="2" height="250" fill={C.white} opacity={(1 - Math.abs(scan - 0.5) * 1.5) * 0.38} />
        <rect x={scanX - 28} y="78" width="58" height="250" fill="url(#band-emerald)" opacity={0.12} />
      </g>
      <line x1="68" y1="336" x2="1030" y2="336" stroke="rgba(225,237,231,.22)" />
      {['2026', '2027', '2028', '2029', '2030', '2031'].map((year, index) => (
        <text key={year} x={92 + index * 181.6} y="361" textAnchor="middle" fill="rgba(225,237,231,.48)" fontFamily={FONT} fontSize="10.5" fontWeight="720">{year}</text>
      ))}
      <g transform="translate(34 390)" fontFamily={FONT}>
        <text x="0" y="0" fill="rgba(225,237,231,.46)" fontSize="10.5" fontWeight="750" letterSpacing=".62">AI MODEL FIT</text>
        <text x="0" y="27" fill={C.mint} fontSize="25" fontWeight="900">{Math.round(91 * select)}%</text>
        <text x="118" y="27" fill={C.white} fontSize="14" fontWeight="820">BALANCED GROWTH</text>
        <text x="118" y="46" fill="rgba(225,237,231,.5)" fontSize="10.5" fontWeight="700">RISK · RETURN · LIQUIDITY ALIGNMENT</text>
      </g>
      <g transform="translate(900 396)" fontFamily={FONT}>
        <text x="0" y="0" fill="rgba(225,237,231,.46)" fontSize="10.5" fontWeight="750" letterSpacing=".58">SELECTED OUTLOOK</text>
        <text x="0" y="31" fill={C.white} fontSize="28" fontWeight="900">{(7.6 * select).toFixed(1)}%</text>
        <text x="91" y="29" fill={C.mint} fontSize="11" fontWeight="800">EST. / YEAR</text>
      </g>
      <circle cx={1030} cy={112} r={9 + Math.sin(phase * 3) * 1.2} fill="none" stroke={C.mint} strokeWidth="1" opacity={select * 0.48} />
    </svg>
  );
};

const ForecastPanel: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 295, 360, 834, 900);
  return (
    <div
      data-safe-object="true"
      style={{
        position: 'absolute',
        left: 72,
        top: 304,
        width: 1138,
        height: 458,
        borderRadius: 25,
        overflow: 'hidden',
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px) scale(${0.988 + reveal * 0.012})`,
        boxShadow: '0 32px 86px rgba(28,48,40,.2)',
      }}
    >
      <ForecastChart timeline={timeline} phase={phase} />
    </div>
  );
};

const ScenarioCard: React.FC<{scenario: Scenario; index: number; timeline: number}> = ({scenario, index, timeline}) => {
  const reveal = life(timeline, 325 + index * 24, 385 + index * 24, 832, 900);
  const select = index === 1 ? p(timeline, 492, 552) : 0;
  const count = p(timeline, 342 + index * 24, 470 + index * 24);
  const y = 78 + index * 116;
  const selectedInk = select > 0.58 ? C.white : C.ink;
  const selectedMuted = select > 0.58 ? 'rgba(255,255,255,.68)' : C.muted;
  return (
    <div
      style={{
        position: 'absolute',
        left: 22,
        right: 22,
        top: y,
        height: 98,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${rgba(scenario.color, 0.18 + select * 0.42)}`,
        background: `linear-gradient(135deg, ${rgba(index === 1 ? C.emerald : C.white, index === 1 ? select : 0.82)}, ${rgba(index === 1 ? '#24795e' : scenario.color, index === 1 ? select : 0.035)})`,
        boxShadow: select > 0.2 ? `0 17px 34px ${rgba(C.emerald, 0.18 * select)}` : '0 8px 22px rgba(34,64,52,.055)',
        opacity: reveal,
        transform: `translateX(${(1 - reveal) * 24}px) scale(${1 + select * 0.018})`,
        transformOrigin: '50% 50%',
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: scenario.color}} />
      <div style={{position: 'absolute', left: 20, top: 15, right: 176}}>
        <div style={{fontSize: 14.5, color: selectedInk, fontWeight: 860, letterSpacing: 0.38}}>{scenario.title}</div>
        <div style={{marginTop: 8, display: 'flex', gap: 20}}>
          <div><span style={{fontSize: 20, color: selectedInk, fontWeight: 900}}>{(scenario.returnValue * count).toFixed(1)}%</span><span style={{marginLeft: 6, fontSize: 9.5, color: selectedMuted, fontWeight: 760}}>RETURN</span></div>
          <div><span style={{fontSize: 15, color: selectedInk, fontWeight: 850}}>{(scenario.volatility * count).toFixed(1)}%</span><span style={{marginLeft: 6, fontSize: 9.5, color: selectedMuted, fontWeight: 760}}>VOLATILITY</span></div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 16, top: 15, width: 142, textAlign: 'right'}}>
        {index === 1 ? (
          <div style={{display: 'inline-flex', height: 24, padding: '0 8px', borderRadius: 8, alignItems: 'center', gap: 6, border: `1px solid ${select > 0.58 ? 'rgba(255,255,255,.24)' : rgba(C.emerald, 0.2)}`, color: select > 0.58 ? C.white : C.emerald, fontSize: 8.4, fontWeight: 880, letterSpacing: 0.42, whiteSpace: 'nowrap'}}>
            <span style={{width: 6, height: 6, borderRadius: 6, background: select > 0.58 ? C.white : C.emerald}} />
            AI RECOMMENDED
          </div>
        ) : (
          <div style={{display: 'inline-flex', height: 24, padding: '0 8px', borderRadius: 8, alignItems: 'center', border: `1px solid ${rgba(scenario.color, 0.18)}`, color: scenario.color, fontSize: 9, fontWeight: 840, letterSpacing: 0.52}}>SCENARIO {index + 1}</div>
        )}
        <div style={{marginTop: 12, fontSize: 10, color: selectedMuted, fontWeight: 760}}>LIQUIDITY</div>
        <div style={{marginTop: 3, fontSize: 15, color: selectedInk, fontWeight: 880}}>{Math.round(scenario.liquidity * count)}%</div>
      </div>
      <div style={{position: 'absolute', left: 20, right: 20, bottom: 9, height: 3, borderRadius: 3, background: select > 0.58 ? 'rgba(255,255,255,.16)' : rgba(scenario.color, 0.08), overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${count * 100}%`, background: select > 0.58 ? C.white : scenario.color, opacity: 0.68}} />
      </div>
    </div>
  );
};

const ScenarioRail: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 300, 365, 834, 900);
  const selected = p(timeline, 492, 552);
  return (
    <LightPanel x={1234} y={304} width={614} height={458} reveal={reveal} radius={25}>
      <div style={{position: 'absolute', left: 22, right: 22, top: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
        <div>
          <div style={{fontSize: 16.5, color: C.ink, fontWeight: 880, letterSpacing: 0.58}}>SCENARIO COMPARISON</div>
          <div style={{marginTop: 5, fontSize: 10.5, color: C.muted, fontWeight: 720, letterSpacing: 0.55}}>RETURN · VOLATILITY · LIQUIDITY</div>
        </div>
        <div style={{height: 29, padding: '0 10px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${rgba(selected > 0.9 ? C.emerald : C.blue, 0.19)}`, background: rgba(selected > 0.9 ? C.emerald : C.blue, 0.04), color: selected > 0.9 ? C.emerald : C.blue, fontSize: 9.5, fontWeight: 850, letterSpacing: 0.53}}>
          <span style={{width: 6, height: 6, borderRadius: 6, background: selected > 0.9 ? C.emerald : C.blue, boxShadow: `0 0 ${6 + Math.sin(phase * 4) * 2}px ${selected > 0.9 ? C.emerald : C.blue}`}} />
          {selected > 0.9 ? 'BEST FIT FOUND' : 'COMPARING'}
        </div>
      </div>
      {SCENARIOS.map((scenario, index) => <ScenarioCard key={scenario.title} scenario={scenario} index={index} timeline={timeline} />)}
      <div style={{position: 'absolute', left: 22, right: 22, bottom: 17, height: 1, background: `linear-gradient(90deg, ${rgba(C.emerald, 0.24)}, ${rgba(C.blue, 0.13)}, transparent)`}} />
    </LightPanel>
  );
};

type Recommendation = {
  title: string;
  body: string;
  timing: string;
  color: string;
};

const RECOMMENDATIONS: Recommendation[] = [
  {title: 'ESTABLISH RESERVE', body: 'Set aside a 12% liquidity buffer.', timing: 'MONTH 0–3', color: C.sky},
  {title: 'BUILD THE CORE', body: 'Deploy 48% into a diversified core.', timing: 'MONTH 1–6', color: C.emerald},
  {title: 'ADD GROWTH', body: 'Allocate 30% across growth opportunities.', timing: 'MONTH 4–12', color: C.amber},
  {title: 'REVIEW & REBALANCE', body: 'Review quarterly when allocation drift exceeds 5%.', timing: 'ONGOING', color: C.coral},
];

const RecommendationCard: React.FC<{item: Recommendation; index: number; timeline: number; phase: number}> = ({item, index, timeline, phase}) => {
  const start = 545 + index * 61;
  const reveal = life(timeline, start, start + 58, 824, 900);
  const verified = p(timeline, start + 35, start + 92);
  const x = 24 + index * 436;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 71,
        width: 420,
        height: 124,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${rgba(item.color, 0.2)}`,
        background: 'linear-gradient(145deg, rgba(255,255,255,.94), rgba(244,248,243,.86))',
        boxShadow: `0 12px 30px rgba(38,72,57,.07), 0 0 26px ${rgba(item.color, 0.025)}`,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px) scale(${0.985 + reveal * 0.015})`,
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: item.color}} />
      <div style={{position: 'absolute', left: 19, top: 16, width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', border: `1px solid ${rgba(item.color, 0.23)}`, background: rgba(item.color, 0.055), color: item.color, fontSize: 14, fontWeight: 900}}>{String(index + 1).padStart(2, '0')}</div>
      <div style={{position: 'absolute', left: 75, top: 15, right: 18}}>
        <div style={{fontSize: 16.5, color: C.ink, fontWeight: 880, letterSpacing: 0.28}}>{item.title}</div>
        <div style={{marginTop: 7, minHeight: 36, fontSize: 14.2, lineHeight: 1.28, color: C.muted, fontWeight: 570}}>{item.body}</div>
      </div>
      <div style={{position: 'absolute', left: 19, right: 18, bottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontSize: 9.5, color: item.color, fontWeight: 850, letterSpacing: 0.63}}>{item.timing}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, color: verified > 0.9 ? C.emerald : C.muted, fontSize: 9.5, fontWeight: 830, letterSpacing: 0.52}}>
          <span style={{width: 6, height: 6, borderRadius: 6, background: verified > 0.9 ? C.emerald : C.line, boxShadow: verified > 0.9 ? `0 0 ${6 + Math.sin(phase * 4 + index) * 1.5}px ${C.emerald}` : undefined}} />
          {verified > 0.9 ? 'VERIFIED' : 'ANALYZING'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 19, right: 18, bottom: 0, height: 3, background: rgba(item.color, 0.07)}}>
        <div style={{height: '100%', width: `${verified * 100}%`, background: item.color}} />
      </div>
    </div>
  );
};

const RecommendationStrip: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 510, 570, 828, 900);
  const complete = p(timeline, 735, 795);
  return (
    <LightPanel x={72} y={788} width={1776} height={218} reveal={reveal} radius={25}>
      <div style={{position: 'absolute', left: 24, right: 24, top: 17, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 9, height: 9, borderRadius: 9, background: C.emerald, boxShadow: `0 0 ${8 + Math.sin(phase * 4) * 2}px ${C.emerald}`}} />
          <span style={{fontSize: 16.5, color: C.ink, fontWeight: 890, letterSpacing: 0.54}}>AI RECOMMENDATION PATH</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{fontSize: 10.5, color: C.muted, fontWeight: 760, letterSpacing: 0.55}}>BALANCED GROWTH SELECTED</span>
          <span style={{height: 29, padding: '0 10px', borderRadius: 9, display: 'flex', alignItems: 'center', border: `1px solid ${rgba(C.emerald, 0.2)}`, background: rgba(C.emerald, 0.045), color: C.emerald, fontSize: 9.8, fontWeight: 860, letterSpacing: 0.56}}>{complete > 0.9 ? '4 STEPS READY' : 'GENERATING'}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 57, height: 1, background: `linear-gradient(90deg, ${rgba(C.emerald, 0.24)}, ${rgba(C.blue, 0.13)}, ${rgba(C.amber, 0.14)}, transparent)`}} />
      {RECOMMENDATIONS.map((item, index) => <RecommendationCard key={item.title} item={item} index={index} timeline={timeline} phase={phase} />)}
    </LightPanel>
  );
};

const DataPulse: React.FC<{timeline: number}> = ({timeline}) => {
  const reveal = life(timeline, 305, 370, 830, 900);
  const first = p(timeline, 512, 560);
  const second = p(timeline, 630, 678);
  const y = 775;
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: reveal}}>
      <defs>
        <filter id="pulse-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d={`M938 762 C938 ${y} 980 ${y} 980 788`} fill="none" stroke={C.emerald} strokeWidth="1.2" strokeDasharray="3 8" strokeDashoffset={-timeline * 0.16} opacity={first * 0.45} />
      <circle cx={938 + ((timeline * 0.8) % 42)} cy={y} r="3.6" fill={C.white} stroke={C.emerald} strokeWidth="1" opacity={first} filter="url(#pulse-glow)" />
      <path d="M1210 534 C1222 534 1228 534 1234 534" fill="none" stroke={C.blue} strokeWidth="1.2" strokeDasharray="2 6" strokeDashoffset={-timeline * 0.18} opacity={second * 0.36} />
    </svg>
  );
};

const Disclaimer: React.FC<{timeline: number}> = ({timeline}) => {
  const reveal = life(timeline, 680, 748, 815, 900);
  return (
    <div style={{position: 'absolute', left: 72, right: 72, bottom: 31, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: reveal, fontFamily: FONT}}>
      <div style={{fontSize: 10.5, color: C.muted, fontWeight: 760, letterSpacing: 0.68}}>ILLUSTRATIVE DATA ONLY · NOT FINANCIAL ADVICE · RETURNS ARE NOT GUARANTEED</div>
      <div style={{fontSize: 10.5, color: C.emerald, fontWeight: 850, letterSpacing: 0.67}}>SIMULATION COMPLETE · 2026–2031</div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = (frame / durationInFrames) * 900;
  const phase = (frame / durationInFrames) * Math.PI * 2;
  const master = life(timeline, 0, 48, 850, 900);
  const clickPush = p(timeline, 270, 302) * (1 - p(timeline, 302, 382));
  const cameraX = Math.sin(phase) * 2.8 + clickPush * 2.2;
  const cameraY = Math.cos(phase * 1.25) * 2;
  const rotateX = Math.sin(phase + 0.4) * 0.06;
  const rotateY = Math.cos(phase * 0.9) * 0.09;
  const scale = 0.976 + p(timeline, 0, 820) * 0.011 + clickPush * 0.004;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.pearl}}>
      <Ambient timeline={timeline} phase={phase} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: master,
          transform: `perspective(4600px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        <Header timeline={timeline} phase={phase} />
        <PromptBar timeline={timeline} phase={phase} />
        <ForecastPanel timeline={timeline} phase={phase} />
        <ScenarioRail timeline={timeline} phase={phase} />
        <DataPulse timeline={timeline} />
        <RecommendationStrip timeline={timeline} phase={phase} />
        <Disclaimer timeline={timeline} />
      </div>
    </AbsoluteFill>
  );
};
