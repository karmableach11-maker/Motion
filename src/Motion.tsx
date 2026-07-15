import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#02070f',
  bgDeep: '#01040a',
  panel: '#06131f',
  panel2: '#081b2a',
  line: '#173a4c',
  cyan: '#2be7ff',
  mint: '#42f5b3',
  violet: '#9b7cff',
  amber: '#ffc75a',
  magenta: '#ff4d7d',
  coral: '#ff7a66',
  white: '#eafbff',
  muted: '#86a4b8',
  dim: '#547387',
};

const FONT = 'Arial, "Helvetica Neue", sans-serif';
const MONO = '"Courier New", monospace';
const TAU = Math.PI * 2;

type Point = {x: number; y: number};

const mod = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const cyclicPulse = (frame: number, period: number, offset = 0) => {
  const phase = (mod(frame + offset, period) / period) * TAU;
  return 0.5 + 0.5 * Math.sin(phase);
};

const quadPoint = (a: Point, b: Point, c: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
  };
};

const polar = (cx: number, cy: number, r: number, deg: number): Point => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
};

const arcPath = (
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) => {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const hexPoints = (cx: number, cy: number, r: number, rotation = 0) =>
  Array.from({length: 6}, (_, i) => {
    const p = polar(cx, cy, r, rotation + i * 60);
    return `${p.x},${p.y}`;
  }).join(' ');

const octPoints = (cx: number, cy: number, r: number, rotation = 22.5) =>
  Array.from({length: 8}, (_, i) => {
    const p = polar(cx, cy, r, rotation + i * 45);
    return `${p.x},${p.y}`;
  }).join(' ');

const backgroundNodes = Array.from({length: 110}, (_, i) => ({
  x: Math.round(random(`ai-command-bg-x-${i}`) * 1920),
  y: Math.round(random(`ai-command-bg-y-${i}`) * 1080),
  r: 0.55 + random(`ai-command-bg-r-${i}`) * 1.45,
  alpha: 0.12 + random(`ai-command-bg-a-${i}`) * 0.42,
  speed: [180, 225, 300][i % 3],
}));

const neuralNodes = Array.from({length: 46}, (_, i) => {
  const angle = random(`neural-angle-${i}`) * TAU;
  const radius = 42 + Math.sqrt(random(`neural-radius-${i}`)) * 108;
  return {
    x: 570 + Math.cos(angle) * radius,
    y: 348 + Math.sin(angle) * radius,
    r: 1.1 + random(`neural-size-${i}`) * 2.2,
    phase: random(`neural-phase-${i}`) * 300,
  };
});

const threatCards = [
  {
    code: 'ZT-472',
    title: 'CREDENTIAL REPLAY',
    meta: 'Identity edge / Region 04',
    status: 'BLOCKED',
    color: C.magenta,
    value: '1,284',
    trend: [23, 34, 26, 49, 43, 61, 38, 54, 31],
  },
  {
    code: 'ZT-188',
    title: 'TOKEN THEFT',
    meta: 'Session broker / Region 12',
    status: 'REVOKED',
    color: C.violet,
    value: '842',
    trend: [19, 27, 39, 31, 46, 35, 51, 44, 58],
  },
  {
    code: 'ZT-804',
    title: 'LATERAL MOVEMENT',
    meta: 'Workload mesh / Region 07',
    status: 'ISOLATED',
    color: C.cyan,
    value: '319',
    trend: [17, 30, 24, 42, 29, 37, 33, 49, 39],
  },
  {
    code: 'ZT-526',
    title: 'PRIVILEGE ESCALATION',
    meta: 'Policy engine / Region 16',
    status: 'CHALLENGED',
    color: C.amber,
    value: '127',
    trend: [22, 18, 31, 27, 40, 34, 45, 41, 52],
  },
];

const actionCards = [
  {title: 'VERIFY IDENTITY', id: 'ACT-091', score: '99.4%', color: C.cyan},
  {title: 'REVOKE SESSION', id: 'ACT-137', score: '98.9%', color: C.violet},
  {title: 'ISOLATE WORKLOAD', id: 'ACT-208', score: '97.8%', color: C.mint},
  {title: 'ROTATE CREDENTIALS', id: 'ACT-314', score: '96.6%', color: C.amber},
];

const stageLabels = [
  {label: 'OBSERVE', color: C.cyan},
  {label: 'DECIDE', color: C.violet},
  {label: 'ENFORCE', color: C.mint},
];

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  background:
    'linear-gradient(155deg, rgba(8,29,44,0.96) 0%, rgba(4,16,27,0.96) 58%, rgba(3,12,21,0.98) 100%)',
  border: '1px solid rgba(43,231,255,0.22)',
  borderRadius: 16,
  boxShadow:
    '0 24px 70px rgba(0,0,0,0.34), inset 0 1px rgba(234,251,255,0.035)',
  overflow: 'hidden',
};

const CornerMarks: React.FC<{inset?: number; color?: string}> = ({
  inset = 11,
  color = 'rgba(43,231,255,0.48)',
}) => {
  const common: React.CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    pointerEvents: 'none',
  };
  return (
    <>
      <div style={{...common, left: inset, top: inset, borderLeft: `1px solid ${color}`, borderTop: `1px solid ${color}`}} />
      <div style={{...common, right: inset, top: inset, borderRight: `1px solid ${color}`, borderTop: `1px solid ${color}`}} />
      <div style={{...common, left: inset, bottom: inset, borderLeft: `1px solid ${color}`, borderBottom: `1px solid ${color}`}} />
      <div style={{...common, right: inset, bottom: inset, borderRight: `1px solid ${color}`, borderBottom: `1px solid ${color}`}} />
    </>
  );
};

const SectionTitle: React.FC<{
  title: string;
  note?: string;
  color?: string;
}> = ({title, note, color = C.cyan}) => (
  <div
    style={{
      height: 54,
      padding: '0 17px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(43,231,255,0.12)',
      background: 'linear-gradient(90deg, rgba(43,231,255,0.055), transparent)',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: color,
          boxShadow: `0 0 15px ${color}`,
        }}
      />
      <span
        style={{
          fontFamily: FONT,
          fontSize: 17,
          lineHeight: 1,
          fontWeight: 750,
          letterSpacing: 0.8,
          color: C.white,
        }}
      >
        {title}
      </span>
    </div>
    {note ? (
      <span
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          fontWeight: 700,
          color,
          letterSpacing: 0.25,
        }}
      >
        {note}
      </span>
    ) : null}
  </div>
);

const MiniSparkline: React.FC<{
  values: number[];
  color: string;
  pulse: number;
}> = ({values, color, pulse}) => {
  const width = 96;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 3 - ((v - min) / Math.max(1, max - min)) * (height - 7);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.26 + pulse * 0.1} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${points} ${width},${height}`} fill={`url(#spark-${color.replace('#', '')})`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" opacity={0.72 + pulse * 0.28} />
    </svg>
  );
};

const ThreatCard: React.FC<{
  index: number;
  frame: number;
  card: (typeof threatCards)[number];
}> = ({index, frame, card}) => {
  const activeIndex = Math.floor(mod(frame, 900) / 225) % 4;
  const isActive = activeIndex === index;
  const pulse = cyclicPulse(frame, 180, index * 33);
  return (
    <div
      style={{
        position: 'relative',
        height: 126,
        borderRadius: 12,
        border: `1px solid ${isActive ? card.color : 'rgba(74,128,151,0.22)'}`,
        background: isActive
          ? `linear-gradient(100deg, ${card.color}16, rgba(6,18,29,0.96) 32%)`
          : 'rgba(4,15,25,0.78)',
        boxShadow: isActive ? `inset 3px 0 ${card.color}, 0 0 24px ${card.color}12` : 'none',
        padding: '14px 14px 12px 16px',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{fontFamily: MONO, color: C.muted, fontSize: 12.5, fontWeight: 700}}>{card.code}</span>
        <span
          style={{
            fontFamily: MONO,
            color: card.color,
            fontSize: 12.5,
            fontWeight: 800,
            letterSpacing: 0.35,
            padding: '3px 7px',
            borderRadius: 5,
            background: `${card.color}12`,
          }}
        >
          {card.status}
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT,
          color: C.white,
          fontSize: 15,
          fontWeight: 750,
          letterSpacing: 0.35,
          whiteSpace: 'nowrap',
        }}
      >
        {card.title}
      </div>
      <div style={{marginTop: 5, fontFamily: FONT, color: C.muted, fontSize: 12.5, lineHeight: 1.25}}>{card.meta}</div>
      <div style={{position: 'absolute', left: 16, right: 14, bottom: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
        <span style={{fontFamily: MONO, color: C.white, fontWeight: 800, fontSize: 21, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{card.value}</span>
        <MiniSparkline values={card.trend} color={card.color} pulse={pulse} />
      </div>
    </div>
  );
};

const ResponseActionCard: React.FC<{
  index: number;
  frame: number;
  action: (typeof actionCards)[number];
}> = ({index, frame, action}) => {
  const activeIndex = Math.floor(mod(frame, 900) / 225) % 4;
  const isActive = activeIndex === index;
  const progress = 0.72 + 0.22 * cyclicPulse(frame, 300, index * 47);
  return (
    <div
      style={{
        height: 91,
        borderRadius: 11,
        border: `1px solid ${isActive ? action.color : 'rgba(74,128,151,0.22)'}`,
        background: isActive
          ? `linear-gradient(95deg, ${action.color}16, rgba(4,15,25,0.94) 40%)`
          : 'rgba(4,15,25,0.78)',
        padding: '12px 13px',
        boxShadow: isActive ? `inset 3px 0 ${action.color}, 0 0 22px ${action.color}12` : 'none',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 9}}>
          <span style={{fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: action.color}}>{String(index + 1).padStart(2, '0')}</span>
          <span style={{fontFamily: FONT, fontSize: 14, fontWeight: 750, color: C.white, letterSpacing: 0.2}}>{action.title}</span>
        </span>
        <span style={{fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: action.color, fontVariantNumeric: 'tabular-nums'}}>{action.score}</span>
      </div>
      <div style={{marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontFamily: MONO, fontSize: 12.5, color: C.muted}}>{action.id}</span>
        <span style={{fontFamily: MONO, fontSize: 12.5, color: isActive ? C.mint : C.muted, fontWeight: 700}}>{isActive ? 'EXECUTING' : 'READY'}</span>
      </div>
      <div style={{marginTop: 9, height: 4, borderRadius: 99, background: 'rgba(75,127,149,0.18)', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${progress * 100}%`, borderRadius: 99, background: `linear-gradient(90deg, ${action.color}80, ${action.color})`, boxShadow: `0 0 10px ${action.color}80`}} />
      </div>
    </div>
  );
};

const ConfidenceGauge: React.FC<{frame: number}> = ({frame}) => {
  const pulse = cyclicPulse(frame, 300);
  const progress = 0.987;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={{height: 151, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 12px 0 15px'}}>
      <svg width="142" height="142" viewBox="0 0 142 142">
        <defs>
          <filter id="gauge-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="71" cy="71" r={radius} fill="rgba(3,13,22,0.84)" stroke="rgba(43,231,255,0.11)" strokeWidth="10" />
        <circle cx="71" cy="71" r={radius} fill="none" stroke={C.violet} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circumference * progress} ${circumference}`} strokeDashoffset={circumference * 0.25} filter="url(#gauge-glow)" opacity={0.8 + pulse * 0.2} />
        {Array.from({length: 20}, (_, i) => {
          const a = (i / 20) * TAU - Math.PI / 2;
          const p1 = {x: 71 + Math.cos(a) * 47, y: 71 + Math.sin(a) * 47};
          const p2 = {x: 71 + Math.cos(a) * 51, y: 71 + Math.sin(a) * 51};
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(234,251,255,0.28)" strokeWidth="1" />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 15, width: 142, top: 45, textAlign: 'center'}}>
        <div style={{fontFamily: MONO, color: C.white, fontSize: 28, fontWeight: 850, fontVariantNumeric: 'tabular-nums'}}>98.7%</div>
        <div style={{fontFamily: FONT, color: C.muted, fontSize: 12.5, fontWeight: 700, marginTop: 3}}>AI CONFIDENCE</div>
      </div>
      <div style={{flex: 1, paddingLeft: 4}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 15, fontWeight: 750}}>AUTONOMY LEVEL</div>
        <div style={{fontFamily: MONO, color: C.violet, fontSize: 18, fontWeight: 850, marginTop: 5}}>LEVEL 5</div>
        <div style={{fontFamily: FONT, color: C.muted, fontSize: 12.5, lineHeight: 1.45, marginTop: 8}}>Policy-approved<br />response execution</div>
      </div>
    </div>
  );
};

const ThreatIntakePanel: React.FC<{frame: number}> = ({frame}) => (
  <div style={{...panelStyle, left: 66, top: 166, width: 300, height: 678}}>
    <SectionTitle title="THREAT INTAKE" note="LIVE / 04" color={C.magenta} />
    <div style={{padding: '13px 13px 12px', display: 'grid', gap: 10}}>
      {threatCards.map((card, index) => <ThreatCard key={card.code} card={card} index={index} frame={frame} />)}
    </div>
    <CornerMarks color="rgba(255,77,125,0.34)" />
  </div>
);

const AutonomousActionsPanel: React.FC<{frame: number}> = ({frame}) => (
  <div style={{...panelStyle, left: 1554, top: 166, width: 300, height: 678}}>
    <SectionTitle title="AUTONOMOUS ACTIONS" note="04 READY" color={C.mint} />
    <ConfidenceGauge frame={frame} />
    <div style={{padding: '1px 13px 12px', display: 'grid', gap: 8}}>
      {actionCards.map((action, index) => <ResponseActionCard key={action.id} action={action} index={index} frame={frame} />)}
    </div>
    <CornerMarks color="rgba(66,245,179,0.34)" />
  </div>
);

type Route = {
  start: Point;
  control: Point;
  end: Point;
  offset: number;
  color: string;
};

const inboundRoutes: Route[] = [
  {start: {x: 14, y: 126}, control: {x: 280, y: 100}, end: {x: 397, y: 247}, offset: 0, color: C.magenta},
  {start: {x: 15, y: 505}, control: {x: 282, y: 574}, end: {x: 400, y: 448}, offset: 47, color: C.coral},
  {start: {x: 235, y: 666}, control: {x: 333, y: 538}, end: {x: 445, y: 507}, offset: 92, color: C.magenta},
  {start: {x: 902, y: 663}, control: {x: 817, y: 537}, end: {x: 699, y: 506}, offset: 121, color: C.coral},
  {start: {x: 1126, y: 514}, control: {x: 869, y: 574}, end: {x: 743, y: 448}, offset: 151, color: C.magenta},
  {start: {x: 1124, y: 127}, control: {x: 864, y: 103}, end: {x: 741, y: 247}, offset: 23, color: C.coral},
  {start: {x: 909, y: 18}, control: {x: 813, y: 160}, end: {x: 700, y: 188}, offset: 74, color: C.magenta},
  {start: {x: 229, y: 18}, control: {x: 326, y: 159}, end: {x: 442, y: 188}, offset: 136, color: C.coral},
];

const responseRoutes: Route[] = [
  {start: {x: 570, y: 348}, control: {x: 568, y: 172}, end: {x: 570, y: 91}, offset: 0, color: C.cyan},
  {start: {x: 570, y: 348}, control: {x: 790, y: 347}, end: {x: 961, y: 347}, offset: 58, color: C.violet},
  {start: {x: 570, y: 348}, control: {x: 568, y: 520}, end: {x: 570, y: 598}, offset: 113, color: C.mint},
  {start: {x: 570, y: 348}, control: {x: 345, y: 347}, end: {x: 176, y: 347}, offset: 164, color: C.amber},
];

const HeroCore: React.FC<{frame: number; duration: number}> = ({frame, duration}) => {
  const phase = (frame / duration) * TAU;
  const breathe = 1 + Math.sin(phase) * 0.008;
  const scan = mod(frame, 300) / 300;
  const scanAngle = scan * 360;
  const activePod = Math.floor(mod(frame, 900) / 225) % 4;
  return (
    <div style={{...panelStyle, left: 390, top: 166, width: 1140, height: 678}}>
      <SectionTitle title="AI POLICY DECISION CORE" note="SYNTHETIC TELEMETRY" color={C.violet} />
      <svg style={{position: 'absolute', inset: 0, top: 54}} width="1140" height="624" viewBox="0 0 1140 624">
        <defs>
          <radialGradient id="hero-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor={C.violet} stopOpacity="0.20" />
            <stop offset="0.46" stopColor={C.cyan} stopOpacity="0.09" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="core-fill" cx="42%" cy="36%" r="72%">
            <stop offset="0" stopColor="#1d3a63" />
            <stop offset="0.45" stopColor="#121f3a" />
            <stop offset="1" stopColor="#070d1d" />
          </radialGradient>
          <linearGradient id="iris-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.cyan} />
            <stop offset="0.48" stopColor={C.violet} />
            <stop offset="1" stopColor={C.mint} />
          </linearGradient>
          <linearGradient id="scan-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.cyan} stopOpacity="0" />
            <stop offset="0.72" stopColor={C.cyan} stopOpacity="0.36" />
            <stop offset="1" stopColor={C.white} stopOpacity="0.95" />
          </linearGradient>
          <filter id="core-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="9" result="wide" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="near" />
            <feMerge><feMergeNode in="wide" /><feMergeNode in="near" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="packet-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="micro-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(43,231,255,0.055)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1" fill="rgba(43,231,255,0.11)" />
          </pattern>
          <clipPath id="core-clip"><circle cx="570" cy="348" r="173" /></clipPath>
        </defs>

        <rect width="1140" height="624" fill="url(#micro-grid)" opacity="0.76" />
        <ellipse cx="570" cy="348" rx="390" ry="300" fill="url(#hero-aura)" opacity={0.82 + 0.14 * Math.sin(phase)} />
        <ellipse cx="570" cy="348" rx="310" ry="255" fill="none" stroke="rgba(43,231,255,0.07)" />
        <ellipse cx="570" cy="348" rx="374" ry="292" fill="none" stroke="rgba(155,124,255,0.06)" strokeDasharray="2 12" />

        {inboundRoutes.map((route, index) => {
          const d = `M ${route.start.x} ${route.start.y} Q ${route.control.x} ${route.control.y} ${route.end.x} ${route.end.y}`;
          return (
            <g key={`inbound-${index}`}>
              <path d={d} fill="none" stroke={route.color} strokeWidth="1.25" strokeOpacity="0.22" strokeDasharray="5 8" strokeDashoffset={-mod(frame + route.offset, 180) * 0.55} />
              {[0, 74].map((extra, packetIndex) => {
                const t = mod(frame + route.offset + extra, 180) / 180;
                const eased = Easing.inOut(Easing.cubic)(t);
                const p = quadPoint(route.start, route.control, route.end, eased);
                const opacity = interpolate(t, [0, 0.12, 0.78, 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
                return (
                  <g key={packetIndex} opacity={opacity} filter="url(#packet-glow)">
                    <circle cx={p.x} cy={p.y} r={packetIndex === 0 ? 4.2 : 2.8} fill={route.color} />
                    <circle cx={p.x} cy={p.y} r={packetIndex === 0 ? 9 : 6} fill="none" stroke={route.color} strokeOpacity="0.34" />
                  </g>
                );
              })}
              <polygon points={hexPoints(route.end.x, route.end.y, 12 + cyclicPulse(frame, 180, route.offset) * 4, 30)} fill="rgba(4,15,25,0.92)" stroke={route.color} strokeWidth="1.3" opacity="0.9" />
              <circle cx={route.end.x} cy={route.end.y} r="3" fill={C.white} />
            </g>
          );
        })}

        {responseRoutes.map((route, index) => {
          const d = `M ${route.start.x} ${route.start.y} Q ${route.control.x} ${route.control.y} ${route.end.x} ${route.end.y}`;
          const isActive = index === activePod;
          return (
            <g key={`response-${index}`}>
              <path d={d} fill="none" stroke={route.color} strokeWidth={isActive ? 2.4 : 1.2} strokeOpacity={isActive ? 0.55 : 0.2} strokeDasharray="3 7" strokeDashoffset={-frame * 0.55} />
              {[0, 52, 104].map((extra, packetIndex) => {
                const t = mod(frame + route.offset + extra, 180) / 180;
                const p = quadPoint(route.start, route.control, route.end, Easing.inOut(Easing.quad)(t));
                return <circle key={packetIndex} cx={p.x} cy={p.y} r={isActive ? 3.8 : 2.4} fill={route.color} opacity={isActive ? 0.96 : 0.55} filter="url(#packet-glow)" />;
              })}
            </g>
          );
        })}

        <g transform={`translate(570 348) scale(${breathe}) translate(-570 -348)`}>
          <circle cx="570" cy="348" r="270" fill="none" stroke="rgba(43,231,255,0.12)" strokeDasharray="2 11" transform={`rotate(${(frame / duration) * 360} 570 348)`} />
          <circle cx="570" cy="348" r="248" fill="rgba(4,15,25,0.34)" stroke="rgba(43,231,255,0.16)" strokeWidth="1" />
          <g transform={`rotate(${(frame / duration) * 360} 570 348)`}>
            {Array.from({length: 12}, (_, i) => (
              <path key={i} d={arcPath(570, 348, 244, i * 30 + 2, i * 30 + 20)} fill="none" stroke={i % 3 === 0 ? C.cyan : C.line} strokeWidth={i % 3 === 0 ? 2.6 : 1.25} strokeOpacity={i % 3 === 0 ? 0.68 : 0.65} />
            ))}
          </g>
          <g transform={`rotate(${-(frame / duration) * 720} 570 348)`}>
            {Array.from({length: 10}, (_, i) => (
              <path key={i} d={arcPath(570, 348, 211, i * 36 + 3, i * 36 + 26)} fill="none" stroke={i % 2 === 0 ? C.violet : C.cyan} strokeWidth={i % 2 === 0 ? 3 : 1} strokeOpacity={i % 2 === 0 ? 0.52 : 0.22} />
            ))}
          </g>
          <g transform={`rotate(${(frame / duration) * 1080} 570 348)`}>
            {Array.from({length: 8}, (_, i) => (
              <path key={i} d={arcPath(570, 348, 177, i * 45 + 5, i * 45 + 30)} fill="none" stroke={i % 2 === 0 ? C.mint : C.violet} strokeWidth="2" strokeOpacity={i % 2 === 0 ? 0.52 : 0.36} />
            ))}
          </g>

          {Array.from({length: 16}, (_, i) => {
            const p = polar(570, 348, 229, i * 22.5 + 11.25);
            const nodePulse = cyclicPulse(frame, 180, i * 13);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={5 + nodePulse * 2.4} fill="rgba(4,15,25,0.94)" stroke={i % 4 === 0 ? C.mint : C.cyan} strokeWidth="1.3" />
                <circle cx={p.x} cy={p.y} r="2" fill={i % 4 === 0 ? C.mint : C.cyan} />
              </g>
            );
          })}

          <circle cx="570" cy="348" r="174" fill="rgba(5,16,30,0.78)" stroke="rgba(155,124,255,0.35)" strokeWidth="1.2" />
          <g clipPath="url(#core-clip)">
            {neuralNodes.map((node, i) => {
              const pulse = cyclicPulse(frame, 225, node.phase);
              return <circle key={i} cx={node.x} cy={node.y} r={node.r + pulse * 0.6} fill={i % 5 === 0 ? C.violet : C.cyan} opacity={0.22 + pulse * 0.45} />;
            })}
            {neuralNodes.slice(0, 22).map((node, i) => {
              const next = neuralNodes[(i * 7 + 9) % neuralNodes.length];
              return <line key={`link-${i}`} x1={node.x} y1={node.y} x2={next.x} y2={next.y} stroke={i % 4 === 0 ? C.violet : C.cyan} strokeWidth="0.65" strokeOpacity="0.16" />;
            })}
            <line x1="570" y1="348" x2={570 + Math.cos((scanAngle - 90) * Math.PI / 180) * 172} y2={348 + Math.sin((scanAngle - 90) * Math.PI / 180) * 172} stroke="url(#scan-line)" strokeWidth="2" opacity="0.8" />
            <path d={arcPath(570, 348, 166, scanAngle - 25, scanAngle)} fill="none" stroke={C.cyan} strokeWidth="12" strokeOpacity="0.08" />
          </g>

          <polygon points={octPoints(570, 348, 121, 22.5)} fill="url(#core-fill)" stroke="url(#iris-stroke)" strokeWidth="2.6" filter="url(#core-glow)" />
          <polygon points={octPoints(570, 348, 98, 0)} fill="rgba(5,13,29,0.92)" stroke="rgba(234,251,255,0.17)" strokeWidth="1" />
          {Array.from({length: 8}, (_, i) => {
            const p1 = polar(570, 348, 99, i * 45);
            const p2 = polar(570, 348, 48, i * 45 + 20);
            return <polygon key={i} points={`570,348 ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={i % 2 === 0 ? 'rgba(43,231,255,0.075)' : 'rgba(155,124,255,0.07)'} />;
          })}
          <circle cx="570" cy="348" r={42 + 4 * cyclicPulse(frame, 300)} fill="rgba(8,25,48,0.95)" stroke={C.cyan} strokeWidth="1.5" opacity="0.95" />
          <circle cx="570" cy="348" r="22" fill={C.violet} opacity={0.16 + 0.15 * cyclicPulse(frame, 180)} filter="url(#core-glow)" />
          <circle cx="570" cy="348" r="8" fill={C.white} opacity="0.92" />
        </g>
      </svg>

      {stageLabels.map((stage, index) => {
        const pos = [
          {left: 527, top: 117},
          {left: 527, top: 177},
          {left: 527, top: 237},
        ][index];
        return (
          <div key={stage.label} style={{position: 'absolute', ...pos, width: 86, height: 28, borderRadius: 6, border: `1px solid ${stage.color}55`, background: 'rgba(3,12,22,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 13px ${stage.color}10`}}>
            <span style={{fontFamily: MONO, fontSize: 12.5, fontWeight: 800, color: stage.color, letterSpacing: 0.45}}>{stage.label}</span>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: 479, top: 338, width: 182, height: 89, borderRadius: 12, background: 'rgba(2,9,18,0.93)', border: '1px solid rgba(234,251,255,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 36px rgba(0,0,0,0.28)'}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 850, letterSpacing: 0.6}}>AI DEFENSE CORE</div>
        <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 7}}>
          <span style={{width: 7, height: 7, borderRadius: 99, background: C.mint, boxShadow: `0 0 12px ${C.mint}`}} />
          <span style={{fontFamily: MONO, color: C.mint, fontSize: 13, fontWeight: 800}}>ONLINE / AUTONOMOUS</span>
        </div>
      </div>

      {[
        {left: 455, top: 61, width: 230, title: 'VERIFY IDENTITY', detail: 'Continuous authentication', color: C.cyan, index: 0},
        {left: 903, top: 308, width: 209, title: 'REVOKE SESSION', detail: 'Token invalidation', color: C.violet, index: 1},
        {left: 455, top: 588, width: 230, title: 'ISOLATE WORKLOAD', detail: 'Micro-segment applied', color: C.mint, index: 2},
        {left: 28, top: 308, width: 219, title: 'ROTATE CREDENTIALS', detail: 'Secrets re-issued', color: C.amber, index: 3},
      ].map((pod) => {
        const isActive = activePod === pod.index;
        return (
          <div key={pod.title} style={{position: 'absolute', left: pod.left, top: pod.top, width: pod.width, height: 58, borderRadius: 10, border: `1px solid ${isActive ? pod.color : `${pod.color}55`}`, background: 'rgba(3,13,23,0.95)', padding: '10px 12px', boxShadow: isActive ? `0 0 24px ${pod.color}22, inset 3px 0 ${pod.color}` : 'none'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{fontFamily: FONT, color: C.white, fontSize: 14, fontWeight: 800, letterSpacing: 0.25}}>{pod.title}</span>
              <span style={{width: 7, height: 7, borderRadius: 99, background: pod.color, boxShadow: isActive ? `0 0 11px ${pod.color}` : 'none'}} />
            </div>
            <div style={{fontFamily: FONT, color: C.muted, fontSize: 12.5, marginTop: 5}}>{pod.detail}</div>
          </div>
        );
      })}

      <CornerMarks color="rgba(155,124,255,0.40)" />
    </div>
  );
};

const HeaderKpi: React.FC<{label: string; value: string; color: string}> = ({label, value, color}) => (
  <div style={{minWidth: 142, height: 47, padding: '7px 12px 6px', borderLeft: '1px solid rgba(43,231,255,0.14)'}}>
    <div style={{fontFamily: FONT, color: C.muted, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.35}}>{label}</div>
    <div style={{fontFamily: MONO, color, fontSize: 17, fontWeight: 850, marginTop: 4, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
  </div>
);

const Header: React.FC<{frame: number}> = ({frame}) => {
  const pulse = cyclicPulse(frame, 180);
  return (
    <div style={{position: 'absolute', left: 66, top: 38, width: 1788, height: 105, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(43,231,255,0.18)'}}>
      <div style={{width: 15, height: 15, borderRadius: 99, background: C.mint, boxShadow: `0 0 ${13 + pulse * 9}px ${C.mint}`, marginRight: 20}} />
      <div>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 33, fontWeight: 850, letterSpacing: 2.1, lineHeight: 1}}>AUTONOMOUS ZERO-TRUST COMMAND</div>
        <div style={{fontFamily: MONO, color: C.muted, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.5, marginTop: 12}}>AI-DRIVEN THREAT RESPONSE / SYNTHETIC LIVE TELEMETRY</div>
      </div>
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
        <HeaderKpi label="DECISION RATE" value="48.2K / SEC" color={C.cyan} />
        <HeaderKpi label="MEAN RESPONSE" value="8.4 MS" color={C.violet} />
        <HeaderKpi label="AI AGENTS" value="128 ACTIVE" color={C.mint} />
        <div style={{width: 136, height: 42, marginLeft: 14, borderRadius: 8, border: `1px solid ${C.mint}66`, background: `${C.mint}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <span style={{width: 7, height: 7, borderRadius: 99, background: C.mint, boxShadow: `0 0 10px ${C.mint}`}} />
          <span style={{fontFamily: MONO, fontSize: 13, color: C.mint, fontWeight: 850}}>PROTECTED</span>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC<{frame: number}> = ({frame}) => {
  const stages = ['SIGNAL', 'CONTEXT', 'POLICY', 'ACTION', 'VERIFY'];
  const playhead = Easing.inOut(Easing.cubic)(mod(frame, 225) / 225);
  const trackLeft = 55;
  const trackWidth = 900;
  return (
    <div style={{...panelStyle, left: 66, top: 868, width: 1788, height: 152}}>
      <div style={{position: 'absolute', left: 22, top: 18, fontFamily: FONT, fontSize: 15, fontWeight: 800, color: C.white, letterSpacing: 0.5}}>AUTONOMOUS RESPONSE PIPELINE</div>
      <div style={{position: 'absolute', left: 22, top: 50, width: 1010, height: 78}}>
        <svg width="1010" height="78" viewBox="0 0 1010 78" style={{position: 'absolute', inset: 0}}>
          <line x1={trackLeft} y1="28" x2={trackLeft + trackWidth} y2="28" stroke="rgba(43,231,255,0.16)" strokeWidth="2" />
          <line x1={trackLeft} y1="28" x2={trackLeft + playhead * trackWidth} y2="28" stroke={C.cyan} strokeWidth="2.5" opacity="0.7" />
          {stages.map((stage, i) => {
            const x = trackLeft + (i / (stages.length - 1)) * trackWidth;
            const passed = playhead >= i / (stages.length - 1);
            return (
              <g key={stage}>
                <circle cx={x} cy="28" r="11" fill="rgba(3,13,23,0.98)" stroke={passed ? C.mint : C.line} strokeWidth="2" />
                <circle cx={x} cy="28" r="4" fill={passed ? C.mint : C.dim} />
              </g>
            );
          })}
          <circle cx={trackLeft + playhead * trackWidth} cy="28" r="6" fill={C.white} filter="url(#footer-playhead-glow)" />
          <defs>
            <filter id="footer-playhead-glow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
        </svg>
        <div style={{position: 'absolute', left: trackLeft - 39, right: 1010 - (trackLeft + trackWidth) - 39, top: 47, display: 'flex', justifyContent: 'space-between'}}>
          {stages.map((stage) => <div key={stage} style={{width: 78, textAlign: 'center', fontFamily: MONO, color: C.white, fontSize: 12.5, fontWeight: 800, letterSpacing: 0.35}}>{stage}</div>)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 1060, right: 20, top: 19, bottom: 19, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid rgba(43,231,255,0.13)'}}>
        {[
          ['THREATS NEUTRALIZED', '19,482', C.mint],
          ['SESSIONS REVOKED', '3,914', C.violet],
          ['WORKLOADS ISOLATED', '286', C.cyan],
          ['MEAN RESPONSE', '8.4 MS', C.amber],
        ].map(([label, value, color], index) => (
          <div key={label} style={{padding: '19px 16px', borderRight: index < 3 ? '1px solid rgba(43,231,255,0.11)' : 'none'}}>
            <div style={{fontFamily: FONT, color: C.muted, fontSize: 12.5, fontWeight: 700, lineHeight: 1.25}}>{label}</div>
            <div style={{fontFamily: MONO, color, fontSize: 24, fontWeight: 850, marginTop: 13, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{value}</div>
            <div style={{marginTop: 10, fontFamily: MONO, color: C.mint, fontSize: 12.5, fontWeight: 700}}>STATUS NOMINAL</div>
          </div>
        ))}
      </div>
      <CornerMarks />
    </div>
  );
};

const Background: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(circle at 50% 43%, rgba(23,71,101,0.20) 0%, rgba(4,17,29,0.22) 31%, transparent 57%), radial-gradient(circle at 86% 26%, rgba(155,124,255,0.07), transparent 33%), linear-gradient(135deg, #030a13 0%, #02070f 58%, #01040a 100%)',
      overflow: 'hidden',
    }}
  >
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <defs>
        <pattern id="bg-grid" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(43,231,255,0.022)" strokeWidth="1" />
        </pattern>
        <linearGradient id="bg-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.cyan} stopOpacity="0" />
          <stop offset="0.5" stopColor={C.cyan} stopOpacity="0.065" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#bg-grid)" />
      <rect x={-520 + mod(frame, 900) * 2.8} y="0" width="330" height="1080" fill="url(#bg-beam)" transform="skewX(-18)" opacity="0.48" />
      {backgroundNodes.map((node, i) => {
        const pulse = cyclicPulse(frame, node.speed, i * 17);
        return <circle key={i} cx={node.x} cy={node.y} r={node.r + pulse * 0.35} fill={i % 11 === 0 ? C.violet : C.cyan} opacity={node.alpha * (0.42 + pulse * 0.58)} />;
      })}
      <path d="M 0 928 C 430 857 750 1009 1160 915 S 1730 882 1920 935" fill="none" stroke="rgba(43,231,255,0.035)" strokeWidth="1" />
    </svg>
    <div style={{position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(234,251,255,0.16) 4px)', backgroundSize: '100% 4px', mixBlendMode: 'screen'}} />
    <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 170px rgba(0,0,0,0.65)', pointerEvents: 'none'}} />
  </AbsoluteFill>
);

const TemporalDither: React.FC<{frame: number}> = ({frame}) => (
  <svg
    width="1920"
    height="1080"
    viewBox="0 0 1920 1080"
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      mixBlendMode: 'screen',
      opacity: 0.024,
    }}
  >
    <defs>
      <filter id="temporal-dither" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="1"
          seed={mod(frame, 100)}
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0.333 0.333 0.333 0 0
                  0.333 0.333 0.333 0 0
                  0.333 0.333 0.333 0 0
                  0     0     0     1 0"
        />
      </filter>
    </defs>
    <rect width="1920" height="1080" fill="#ffffff" filter="url(#temporal-dither)" />
  </svg>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.white, background: C.bgDeep}}>
      <Background frame={frame} />
      <Header frame={frame} />
      <ThreatIntakePanel frame={frame} />
      <HeroCore frame={frame} duration={durationInFrames} />
      <AutonomousActionsPanel frame={frame} />
      <Footer frame={frame} />
      <TemporalDither frame={frame} />
    </AbsoluteFill>
  );
};
