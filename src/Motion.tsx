import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const C = {
  bg: '#020711',
  bg2: '#071827',
  panel: '#0a2030',
  panel2: '#0e2a3c',
  text: '#f5fcff',
  muted: '#88a9b8',
  dim: '#476779',
  line: '#244a5e',
  cyan: '#39e6ff',
  blue: '#478dff',
  violet: '#8f7cff',
  mint: '#70f5c3',
  amber: '#ffbe62',
  coral: '#ff6f70',
};

const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = Easing.bezier(.22, 1, .36, 1);
const progress = (frame: number, from: number, to: number) => clamp(interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: smooth}));
const lifecycle = (frame: number, from: number, to: number, exitFrom = 842, exitTo = 900) => progress(frame, from, to) * (1 - progress(frame, exitFrom, exitTo));
const rgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const Glass: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  reveal: number;
  children: React.ReactNode;
  radius?: number;
  depth?: number;
  style?: React.CSSProperties;
}> = ({x, y, width, height, reveal, children, radius = 25, depth = 0, style}) => (
  <div data-safe-object="true" style={{
    position: 'absolute', left: x, top: y, width, height, boxSizing: 'border-box', overflow: 'hidden',
    borderRadius: radius, border: '1px solid rgba(78,192,218,.2)',
    background: 'linear-gradient(145deg, rgba(10,35,51,.88), rgba(3,15,28,.93))',
    boxShadow: '0 30px 80px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.055)',
    backdropFilter: 'blur(16px)',
    opacity: reveal,
    transform: `translate3d(0, ${(1 - reveal) * 18}px, ${depth}px) scale(${.982 + reveal * .018})`,
    transformOrigin: '50% 50%', transformStyle: 'preserve-3d', willChange: 'transform, opacity',
    ...style,
  }}>
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(125deg, rgba(255,255,255,.04), transparent 27%, transparent 74%, rgba(57,230,255,.025))'}}/>
    {children}
  </div>
);

const Ambient: React.FC<{phase: number}> = ({phase}) => {
  const particles = Array.from({length: 52}, (_, index) => ({
    x: (index * 181 + 43) % 1920,
    y: (index * 113 + 67) % 1080,
    size: .8 + (index % 4) * .45,
  }));
  return <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${50 + Math.sin(phase) * 2.5}% ${45 + Math.cos(phase) * 2}%, rgba(57,230,255,.14), transparent 37%), radial-gradient(circle at ${17 + Math.cos(phase) * 2}% ${72 + Math.sin(phase * 2) * 2}%, rgba(143,124,255,.1), transparent 31%), radial-gradient(circle at 83% 73%, rgba(112,245,195,.07), transparent 29%), linear-gradient(145deg, ${C.bg}, ${C.bg2} 55%, #02050c)`}}/>
    <div style={{position: 'absolute', inset: 0, opacity: .075, backgroundImage: 'linear-gradient(rgba(77,148,172,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(77,148,172,.12) 1px, transparent 1px)', backgroundSize: '72px 72px', transform: `translate(${Math.sin(phase) * 8}px, ${Math.cos(phase) * 6}px)`}}/>
    <div style={{position: 'absolute', inset: 0, opacity: .031, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.2) 0, rgba(255,255,255,.2) 1px, transparent 1px, transparent 4px)', mixBlendMode: 'soft-light'}}/>
    {particles.map((particle, index) => <div key={index} style={{position: 'absolute', left: particle.x + Math.sin(phase + index) * 6, top: particle.y + Math.cos(phase * 1.25 + index) * 5, width: particle.size, height: particle.size, borderRadius: particle.size, background: index % 9 === 0 ? C.mint : index % 7 === 0 ? C.violet : '#a5cad7', opacity: .045 + (index % 5) * .014 + Math.sin(phase * 2 + index) * .012, boxShadow: index % 9 === 0 ? `0 0 8px ${C.mint}` : 'none'}}/>)}
  </>;
};

const EngineHeader: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = lifecycle(timeline, 5, 72, 846, 900);
  return <div style={{position: 'absolute', left: 250, right: 250, top: 50, height: 52, opacity: reveal, transform: `translateY(${(1 - reveal) * -10}px)`, fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle, rgba(57,230,255,.18), rgba(71,141,255,.035))', border: '1px solid rgba(57,230,255,.34)'}}>
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="8" fill="none" stroke={C.cyan} strokeWidth="1.2"/>
          <circle cx="14" cy="14" r="3" fill={C.text} stroke={C.cyan} strokeWidth="1"/>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = index / 6 * Math.PI * 2 + phase;
            return <g key={index}><line x1={14 + Math.cos(angle) * 4} y1={14 + Math.sin(angle) * 4} x2={14 + Math.cos(angle) * 10} y2={14 + Math.sin(angle) * 10} stroke={index % 2 ? C.violet : C.cyan} strokeWidth=".9"/><circle cx={14 + Math.cos(angle) * 11} cy={14 + Math.sin(angle) * 11} r="1.6" fill={index % 2 ? C.violet : C.cyan}/></g>;
          })}
        </svg>
      </div>
      <div>
        <div style={{fontSize: 20, color: C.text, fontWeight: 860, letterSpacing: 1.05}}>AI INSIGHT SYNTHESIS</div>
        <div style={{marginTop: 6, fontSize: 10.8, color: C.muted, fontWeight: 740, letterSpacing: .72}}>ENTERPRISE ANALYTICS · MULTI-SOURCE INTELLIGENCE</div>
      </div>
    </div>
    <div style={{position: 'absolute', right: 0, top: 8, display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{fontSize: 10.5, color: C.muted, fontWeight: 760, letterSpacing: .58}}>SECURE SESSION</div>
      <div style={{height: 30, padding: '0 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${rgba(C.mint, .24)}`, background: rgba(C.mint, .055), color: C.mint, fontSize: 10.5, fontWeight: 830, letterSpacing: .55}}><span style={{width: 7, height: 7, borderRadius: 7, background: C.mint, boxShadow: `0 0 ${8 + Math.sin(phase * 4) * 2}px ${C.mint}`}}/>ONLINE</div>
    </div>
  </div>;
};

const NeuralHalo: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = lifecycle(timeline, 28, 145, 830, 900);
  const active = progress(timeline, 285, 390);
  const scan = timeline * .38;
  return <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: reveal, overflow: 'visible'}}>
    <defs>
      <radialGradient id="halo-fog"><stop stopColor={C.cyan} stopOpacity={.12 + active * .08}/><stop offset=".42" stopColor={C.violet} stopOpacity=".035"/><stop offset="1" stopColor={C.bg} stopOpacity="0"/></radialGradient>
      <linearGradient id="halo-ring" x1="0" y1="0" x2="1" y2="1"><stop stopColor={C.cyan}/><stop offset=".48" stopColor={C.violet}/><stop offset="1" stopColor={C.mint}/></linearGradient>
      <filter id="halo-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="halo-wide" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <ellipse cx="960" cy="540" rx={430 + Math.sin(phase) * 4} ry={300 + Math.cos(phase) * 3} fill="url(#halo-fog)" opacity={.5 + active * .5}/>
    {[0, 1, 2].map((index) => <ellipse key={index} cx="960" cy="540" rx={235 + index * 74} ry={145 + index * 47} fill="none" stroke={index === 0 ? C.cyan : index === 1 ? C.violet : C.mint} strokeWidth={index === 0 ? 1.4 : 1} strokeDasharray={index === 0 ? '3 9' : index === 1 ? '12 10' : '2 12'} strokeDashoffset={(index % 2 ? 1 : -1) * scan * (1 + index * .22)} opacity={.11 + active * .14} transform={`rotate(${[-12, 18, 39][index] + Math.sin(phase + index) * 2} 960 540)`}/>) }
    <circle cx="960" cy="540" r={114 + Math.sin(phase * 2) * 2} fill="none" stroke="url(#halo-ring)" strokeWidth="2" strokeDasharray="10 8" strokeDashoffset={-timeline * .13} opacity={.16 + active * .44} filter="url(#halo-glow)"/>
    <circle cx="960" cy="540" r={74 + Math.cos(phase * 2) * 2} fill="none" stroke={C.cyan} strokeWidth="8" opacity={.035 + active * .06} filter="url(#halo-wide)"/>
    {Array.from({length: 28}, (_, index) => {
      const angle = index / 28 * Math.PI * 2 + phase * (index % 2 ? .45 : -.35);
      const radius = 118 + (index % 4) * 47;
      const squeeze = .67 + (index % 3) * .04;
      const x = 960 + Math.cos(angle) * radius;
      const y = 540 + Math.sin(angle) * radius * squeeze;
      const color = [C.cyan, C.violet, C.mint][index % 3];
      return <g key={index} opacity={.13 + active * .45}>
        <line x1="960" y1="540" x2={x} y2={y} stroke={color} strokeWidth=".55" opacity=".16"/>
        <circle cx={x} cy={y} r={1.8 + (index % 3) * .7} fill={color} filter={index % 5 === 0 ? 'url(#halo-glow)' : undefined}/>
      </g>;
    })}
  </svg>;
};

const PromptConsole: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = lifecycle(timeline, 45, 125, 838, 900);
  const typing = progress(timeline, 86, 272);
  const prompt = 'Analyze global business performance';
  const typed = prompt.slice(0, Math.floor(prompt.length * typing));
  const submitted = progress(timeline, 276, 338);
  const cursorVisible = typing < .995 && Math.floor(timeline / 18) % 2 === 0;
  return <Glass x={250} y={122} width={1420} height={112} reveal={reveal} radius={28} depth={24}>
    <div style={{position: 'absolute', left: 22, top: 24, width: 62, height: 62, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle, rgba(57,230,255,.15), rgba(143,124,255,.04))', border: '1px solid rgba(57,230,255,.26)'}}>
      <svg width="34" height="34" viewBox="0 0 34 34">
        <path d="M17 3 L19.6 11.4 L28 14 L19.6 16.6 L17 25 L14.4 16.6 L6 14 L14.4 11.4Z" fill={C.cyan} opacity=".86" filter="url(#prompt-glow)"/>
        <path d="M26 21 L27.4 25.6 L32 27 L27.4 28.4 L26 33 L24.6 28.4 L20 27 L24.6 25.6Z" fill={C.violet}/>
        <defs><filter id="prompt-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      </svg>
    </div>
    <div style={{position: 'absolute', left: 106, top: 22, right: 116, height: 66, display: 'flex', alignItems: 'center', fontFamily: FONT}}>
      <span style={{fontSize: 26, color: C.text, fontWeight: 650, letterSpacing: .15, whiteSpace: 'nowrap'}}>{typed}</span>
      <span style={{display: 'inline-block', marginLeft: 4, width: 2, height: 29, borderRadius: 2, background: C.cyan, opacity: cursorVisible ? 1 : .18, boxShadow: `0 0 9px ${C.cyan}`}}/>
    </div>
    <div style={{position: 'absolute', right: 20, top: 20, width: 72, height: 72, borderRadius: 23, display: 'grid', placeItems: 'center', background: `radial-gradient(circle, ${rgba(C.cyan, .22 + submitted * .18)}, ${rgba(C.blue, .06)})`, border: `1px solid ${rgba(C.cyan, .4 + submitted * .3)}`, boxShadow: `0 0 ${15 + submitted * 24}px ${rgba(C.cyan, .23 + submitted * .2)}`, transform: `scale(${1 + Math.sin(phase * 3) * .015 + submitted * .04})`}}>
      <svg width="30" height="30" viewBox="0 0 30 30"><path d="M7 15 H22 M17 9 L23 15 L17 21" fill="none" stroke={C.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="15" cy="15" r="13" fill="none" stroke={C.cyan} strokeWidth=".8" strokeDasharray="4 5" strokeDashoffset={-timeline * .16}/></svg>
    </div>
    <div style={{position: 'absolute', left: 104, right: 112, bottom: 15, height: 3, borderRadius: 3, background: 'rgba(93,159,181,.1)', overflow: 'hidden'}}><div style={{height: '100%', width: `${Math.min(1, typing + submitted * .12) * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.mint})`, boxShadow: `0 0 12px ${rgba(C.cyan, .55)}`}}/></div>
  </Glass>;
};

type InsightKind = 'growth' | 'risk' | 'confidence';

const Sparkline: React.FC<{draw: number; phase: number}> = ({draw, phase}) => {
  const values = [36, 40, 38, 47, 52, 49, 61, 67, 64, 76, 82, 88];
  const points = values.map((value, index) => `${18 + index * 25},${83 - (value - 30) * .72}`).join(' ');
  return <svg width="320" height="98" viewBox="0 0 320 98">
    <defs><linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.cyan} stopOpacity=".22"/><stop offset="1" stopColor={C.cyan} stopOpacity="0"/></linearGradient><filter id="growth-glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {[26, 50, 74].map((y) => <line key={y} x1="14" y1={y} x2="306" y2={y} stroke="rgba(94,157,178,.12)" strokeDasharray="3 7"/>) }
    <polygon points={`${points} 293,90 18,90`} fill="url(#growth-fill)" opacity={draw}/>
    <polyline points={points} fill="none" stroke={C.cyan} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} filter="url(#growth-glow)"/>
    <circle cx="293" cy={83 - (88 - 30) * .72} r={4 + Math.sin(phase * 3) * .5} fill={C.text} stroke={C.cyan} strokeWidth="1.5" opacity={draw}/>
  </svg>;
};

const RiskGauge: React.FC<{draw: number; phase: number}> = ({draw, phase}) => {
  const circumference = 2 * Math.PI * 45;
  return <svg width="140" height="130" viewBox="0 0 140 130">
    <defs><linearGradient id="risk-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor={C.mint}/><stop offset="1" stopColor={C.cyan}/></linearGradient><filter id="risk-glow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <circle cx="65" cy="63" r="45" fill="none" stroke="rgba(93,159,181,.13)" strokeWidth="9"/>
    <circle cx="65" cy="63" r="45" fill="none" stroke="url(#risk-gradient)" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - .28 * draw)} transform="rotate(-90 65 63)" filter="url(#risk-glow)"/>
    <circle cx="65" cy="63" r={32 + Math.sin(phase * 2) * .7} fill={rgba(C.mint, .035)} stroke={rgba(C.mint, .12)}/>
    <text x="65" y="61" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="25" fontWeight="880">{Math.round(28 * draw)}</text>
    <text x="65" y="77" textAnchor="middle" fill={C.mint} fontFamily={FONT} fontSize="8.5" fontWeight="830" letterSpacing=".7">LOW</text>
  </svg>;
};

const ConfidenceDial: React.FC<{draw: number; phase: number}> = ({draw, phase}) => {
  const circumference = 2 * Math.PI * 39;
  return <svg width="118" height="108" viewBox="0 0 118 108">
    <defs><linearGradient id="confidence-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor={C.violet}/><stop offset="1" stopColor={C.cyan}/></linearGradient><filter id="confidence-glow"><feGaussianBlur stdDeviation="2.3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <circle cx="54" cy="52" r="39" fill="none" stroke="rgba(93,159,181,.13)" strokeWidth="7"/>
    <circle cx="54" cy="52" r="39" fill="none" stroke="url(#confidence-gradient)" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - .92 * draw)} transform="rotate(-90 54 52)" filter="url(#confidence-glow)"/>
    {Array.from({length: 8}, (_, index) => {const a = index / 8 * Math.PI * 2 + phase * .25; return <circle key={index} cx={54 + Math.cos(a) * 26} cy={52 + Math.sin(a) * 26} r="1.5" fill={index % 2 ? C.cyan : C.violet} opacity={draw}/>;})}
  </svg>;
};

const InsightCard: React.FC<{kind: InsightKind; timeline: number; phase: number; x: number; y: number; width: number; height: number; start: number; depth: number}> = ({kind, timeline, phase, x, y, width, height, start, depth}) => {
  const reveal = lifecycle(timeline, start, start + 108, 822, 900);
  const draw = progress(timeline, start + 42, start + 190);
  const settings = {
    growth: {title: 'GROWTH FORECAST', subtitle: '12-MONTH OUTLOOK', color: C.cyan},
    risk: {title: 'RISK SIGNAL', subtitle: 'STABLE EXPOSURE', color: C.mint},
    confidence: {title: 'CONFIDENCE', subtitle: 'MULTI-SOURCE MATCH', color: C.violet},
  }[kind];
  return <Glass x={x} y={y} width={width} height={height} reveal={reveal} radius={20} depth={depth} style={{border: `1px solid ${rgba(settings.color, .24)}`, boxShadow: `0 28px 70px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05), 0 0 32px ${rgba(settings.color, .035)}`}}>
    <div style={{position: 'absolute', left: 18, right: 18, top: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 9}}><span style={{width: 9, height: 9, borderRadius: 9, background: settings.color, boxShadow: `0 0 9px ${settings.color}`}}/><span style={{fontSize: 13, color: C.text, fontWeight: 850, letterSpacing: .72}}>{settings.title}</span></div>
      <span style={{fontSize: 9.8, color: settings.color, fontWeight: 820, letterSpacing: .55}}>VERIFIED</span>
    </div>
    <div style={{position: 'absolute', left: 18, right: 18, top: 47, height: 1, background: rgba(settings.color, .15)}}/>
    {kind === 'growth' ? <>
      <div style={{position: 'absolute', left: 18, top: 62, fontFamily: FONT}}><div style={{fontSize: 39, lineHeight: 1, color: C.text, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>+{(18.4 * draw).toFixed(1)}%</div><div style={{marginTop: 8, fontSize: 10.5, color: C.muted, fontWeight: 760, letterSpacing: .58}}>{settings.subtitle}</div></div>
      <div style={{position: 'absolute', left: 18, right: 18, bottom: 6}}><Sparkline draw={draw} phase={phase}/></div>
    </> : null}
    {kind === 'risk' ? <>
      <div style={{position: 'absolute', left: 18, top: 68, fontFamily: FONT}}><div style={{fontSize: 37, lineHeight: 1, color: C.mint, fontWeight: 900}}>LOW</div><div style={{marginTop: 9, fontSize: 10.5, color: C.muted, fontWeight: 760, letterSpacing: .58}}>{settings.subtitle}</div><div style={{marginTop: 22, fontSize: 10, color: C.mint, fontWeight: 820}}>↓ 12 PTS VS BASELINE</div></div>
      <div style={{position: 'absolute', right: 10, top: 58}}><RiskGauge draw={draw} phase={phase}/></div>
    </> : null}
    {kind === 'confidence' ? <>
      <div style={{position: 'absolute', left: 20, top: 58, fontFamily: FONT}}><div style={{fontSize: 38, lineHeight: 1, color: C.text, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{Math.round(92 * draw)}%</div><div style={{marginTop: 8, fontSize: 10.5, color: C.muted, fontWeight: 760, letterSpacing: .58}}>{settings.subtitle}</div></div>
      <div style={{position: 'absolute', right: 8, top: 43}}><ConfidenceDial draw={draw} phase={phase}/></div>
    </> : null}
    <div style={{position: 'absolute', top: 0, bottom: 0, width: 72, left: `${-18 + ((timeline * .24 + start) % (width + 90))}px`, background: `linear-gradient(90deg, transparent, ${rgba(settings.color, .055)}, transparent)`, transform: 'skewX(-18deg)', opacity: reveal}}/>
  </Glass>;
};

const DataStream: React.FC<{timeline: number; phase: number; d: string; from: [number, number]; c1: [number, number]; c2: [number, number]; to: [number, number]; color: string; offset: number; reveal: number}> = ({timeline, d, from, c1, c2, to, color, offset, reveal}) => {
  const t = (timeline * .0022 + offset) % 1;
  const u = 1 - t;
  const x = u * u * u * from[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0];
  const y = u * u * u * from[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1];
  return <g opacity={reveal}>
    <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="4 9" strokeDashoffset={-timeline * .16} opacity=".35"/>
    <path d={d} fill="none" stroke={color} strokeWidth="7" opacity=".035"/>
    <circle cx={x} cy={y} r="4" fill={C.text} stroke={color} strokeWidth="1.2" filter="url(#stream-glow)"/>
    <circle cx={x} cy={y} r="10" fill="none" stroke={color} strokeWidth=".7" opacity=".24"/>
  </g>;
};

const ResponseCanvas: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = lifecycle(timeline, 300, 410, 826, 900);
  const core = progress(timeline, 320, 445);
  const answerCount = (timeline >= 432 ? 1 : 0) + (timeline >= 494 ? 1 : 0) + (timeline >= 556 ? 1 : 0);
  const complete = progress(timeline, 570, 650);
  return <>
    <Glass x={220} y={300} width={1480} height={604} reveal={reveal} radius={28} depth={8} style={{clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0 round 28px)`}}>
      <div style={{position: 'absolute', left: 22, right: 22, top: 18, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 11}}><span style={{width: 9, height: 9, borderRadius: 9, background: C.cyan, boxShadow: `0 0 ${9 + Math.sin(phase * 4) * 2}px ${C.cyan}`}}/><span style={{fontSize: 14, color: C.text, fontWeight: 850, letterSpacing: .78}}>INSIGHT MATRIX · {answerCount} VERIFIED SIGNALS</span></div>
        <div style={{display: 'flex', gap: 9}}><span style={{padding: '7px 10px', borderRadius: 9, color: complete > .95 ? C.mint : C.cyan, border: `1px solid ${rgba(complete > .95 ? C.mint : C.cyan, .2)}`, background: rgba(complete > .95 ? C.mint : C.cyan, .05), fontSize: 9.8, fontWeight: 820, letterSpacing: .52}}>{complete > .95 ? 'SYNTHESIS COMPLETE' : 'ANALYSIS ACTIVE'}</span><span style={{padding: '7px 10px', borderRadius: 9, color: C.muted, border: '1px solid rgba(93,159,181,.15)', background: 'rgba(2,14,25,.46)', fontSize: 9.8, fontWeight: 780}}>24 SOURCES</span></div>
      </div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 61, height: 1, background: 'linear-gradient(90deg, rgba(57,230,255,.25), rgba(143,124,255,.15), rgba(112,245,195,.25))'}}/>
      <div style={{position: 'absolute', left: 608, top: 136, width: 264, height: 264, borderRadius: 264, background: `radial-gradient(circle, ${rgba(C.cyan, .12 * core)}, ${rgba(C.violet, .035 * core)} 50%, transparent 72%)`, border: `1px solid ${rgba(C.cyan, .19 * core)}`, boxShadow: `0 0 ${50 + core * 42}px ${rgba(C.cyan, .07 * core)}`, transform: `scale(${.86 + core * .14})`}}>
        <svg width="264" height="264" viewBox="0 0 264 264">
          <defs><linearGradient id="core-ring" x1="0" y1="0" x2="1" y2="1"><stop stopColor={C.cyan}/><stop offset=".5" stopColor={C.violet}/><stop offset="1" stopColor={C.mint}/></linearGradient><filter id="core-glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {[105, 82, 59].map((radius, index) => <circle key={radius} cx="132" cy="132" r={radius} fill="none" stroke={index === 0 ? 'url(#core-ring)' : index === 1 ? C.cyan : C.violet} strokeWidth={index === 0 ? 1.6 : 1} strokeDasharray={index === 0 ? '4 9' : index === 1 ? '12 8' : '2 7'} strokeDashoffset={(index % 2 ? 1 : -1) * timeline * (.12 + index * .04)} opacity={.35 + core * .35}/>) }
          <path d="M132 78 L179 105 L179 159 L132 186 L85 159 L85 105Z" fill={rgba(C.cyan, .055)} stroke="url(#core-ring)" strokeWidth="1.5" filter="url(#core-glow)"/>
          <circle cx="132" cy="132" r={24 + Math.sin(phase * 2) * 1.5} fill={rgba(C.cyan, .12)} stroke={C.cyan} strokeWidth="1.3"/>
          <path d="M120 132 L128 140 L145 122" fill="none" stroke={C.text} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          {Array.from({length: 12}, (_, index) => {const a = index / 12 * Math.PI * 2 + phase * .4; return <g key={index}><line x1={132 + Math.cos(a) * 31} y1={132 + Math.sin(a) * 31} x2={132 + Math.cos(a) * 48} y2={132 + Math.sin(a) * 48} stroke={index % 3 === 0 ? C.mint : C.cyan} strokeWidth=".7"/><circle cx={132 + Math.cos(a) * 52} cy={132 + Math.sin(a) * 52} r="2" fill={index % 3 === 0 ? C.mint : C.cyan}/></g>;})}
          <text x="132" y="223" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="9.5" fontWeight="780" letterSpacing="1">SYNTHESIS CORE</text>
        </svg>
      </div>
    </Glass>

    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <defs><filter id="stream-glow"><feGaussianBlur stdDeviation="2.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <DataStream timeline={timeline} phase={phase} d="M960 562 C820 540 740 560 646 585" from={[960, 562]} c1={[820, 540]} c2={[740, 560]} to={[646, 585]} color={C.cyan} offset={.1} reveal={reveal}/>
      <DataStream timeline={timeline} phase={phase} d="M960 562 C1100 540 1190 560 1274 585" from={[960, 562]} c1={[1100, 540]} c2={[1190, 560]} to={[1274, 585]} color={C.mint} offset={.42} reveal={reveal}/>
      <DataStream timeline={timeline} phase={phase} d="M960 602 C960 660 960 700 960 728" from={[960, 602]} c1={[960, 660]} c2={[960, 700]} to={[960, 728]} color={C.violet} offset={.73} reveal={reveal}/>
      <path d="M960 234 C960 270 960 286 960 330" fill="none" stroke={C.cyan} strokeWidth="1.5" strokeDasharray="4 9" strokeDashoffset={-timeline * .18} opacity={reveal * .48}/>
      <circle cx="960" cy={310 + Math.sin(phase * 2) * 4} r="4" fill={C.text} stroke={C.cyan} filter="url(#stream-glow)" opacity={reveal}/>
    </svg>

    <InsightCard kind="growth" timeline={timeline} phase={phase} x={286} y={462} width={360} height={242} start={432} depth={22}/>
    <InsightCard kind="risk" timeline={timeline} phase={phase} x={1274} y={462} width={360} height={242} start={494} depth={20}/>
    <InsightCard kind="confidence" timeline={timeline} phase={phase} x={780} y={730} width={360} height={148} start={556} depth={26}/>
  </>;
};

const ProcessingRibbon: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = lifecycle(timeline, 270, 352, 825, 900);
  const done = progress(timeline, 340, 470);
  return <div style={{position: 'absolute', left: 670, top: 255, width: 580, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 12, opacity: reveal, fontFamily: FONT, background: 'linear-gradient(90deg, transparent, rgba(5,27,40,.8), transparent)'}}>
    <span style={{width: 8, height: 8, borderRadius: 8, background: done > .95 ? C.mint : C.cyan, boxShadow: `0 0 ${9 + Math.sin(phase * 5) * 2}px ${done > .95 ? C.mint : C.cyan}`}}/>
    <span style={{fontSize: 10.8, color: done > .95 ? C.mint : C.muted, fontWeight: 820, letterSpacing: .78}}>{done > .95 ? 'SYNTHESIS VERIFIED' : 'ANALYZING MULTI-SOURCE DATA'}</span>
    <div style={{width: 120, height: 4, borderRadius: 4, background: 'rgba(95,159,181,.13)', overflow: 'hidden'}}><div style={{height: '100%', width: `${done * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.mint})`, boxShadow: `0 0 8px ${C.cyan}`}}/></div>
  </div>;
};

const Footer: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = lifecycle(timeline, 625, 720, 815, 900);
  return <div style={{position: 'absolute', left: 250, right: 250, bottom: 50, height: 38, opacity: reveal, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', fontFamily: FONT}}>
    <div style={{height: 1, background: 'linear-gradient(90deg, transparent, rgba(57,230,255,.25))'}}/>
    <div style={{margin: '0 18px', display: 'flex', alignItems: 'center', gap: 18}}>
      {[['24 SOURCES', C.cyan], ['3 SIGNALS', C.violet], ['92% CONFIDENCE', C.mint]].map(([label, color], index) => <div key={label} style={{display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, color: C.muted, fontWeight: 780, letterSpacing: .55}}><span style={{width: 6, height: 6, borderRadius: 6, background: color, boxShadow: index === 2 ? `0 0 ${7 + Math.sin(phase * 4) * 2}px ${color}` : 'none'}}/>{label}</div>)}
    </div>
    <div style={{height: 1, background: 'linear-gradient(90deg, rgba(112,245,195,.25), transparent)'}}/>
  </div>;
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = frame / durationInFrames * 900;
  const phase = frame / durationInFrames * Math.PI * 2;
  const master = lifecycle(timeline, 0, 54, 848, 900);
  const cameraX = Math.sin(phase) * 3.5 + Math.sin(phase * 2 + .4) * 1.1;
  const cameraY = Math.sin(phase * 2 - .2) * 2.6;
  const rotateX = Math.sin(phase + .55) * .11;
  const rotateY = Math.cos(phase) * .16;
  const scale = .987 + progress(timeline, 0, 800) * .014 + Math.sin(phase - .3) * .0015;
  return <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.bg}}>
    <Ambient phase={phase}/>
    <NeuralHalo timeline={timeline} phase={phase}/>
    <div style={{position: 'absolute', inset: 0, opacity: master, transform: `perspective(4400px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale * (.988 + master * .012)})`, transformOrigin: '50% 50%', transformStyle: 'preserve-3d', willChange: 'transform, opacity'}}>
      <EngineHeader timeline={timeline} phase={phase}/>
      <PromptConsole timeline={timeline} phase={phase}/>
      <ProcessingRibbon timeline={timeline} phase={phase}/>
      <ResponseCanvas timeline={timeline} phase={phase}/>
      <Footer timeline={timeline} phase={phase}/>
    </div>
  </AbsoluteFill>;
};
