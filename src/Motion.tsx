import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const C = {
  background: '#030a12',
  background2: '#071522',
  board: '#081722',
  panel: 'rgba(12, 31, 44, 0.88)',
  panelSoft: 'rgba(15, 38, 52, 0.76)',
  ink: '#f3faff',
  muted: '#8097a8',
  dim: '#536c7c',
  line: 'rgba(133, 181, 204, 0.14)',
  cyan: '#46ddf3',
  emerald: '#2ed6a1',
  gold: '#f0c76b',
  violet: '#9a8cff',
};

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
const REVENUE = [74.2, 82.8, 91.5, 105.4, 118.7, 132.9, 148.6] as const;
const EBITDA = [12.6, 15.4, 18.8, 23.5, 28.9, 34.1, 40.8] as const;
const MARGIN = [17.0, 18.6, 20.5, 22.3, 24.3, 25.7, 27.5] as const;
const CASH_FLOW = [8.4, 10.6, 12.9, 16.8, 21.3, 25.7, 31.4] as const;

const loopProgress = (
  timeline: number,
  enterStart: number,
  enterEnd: number,
  exitStart = 790,
  exitEnd = 900,
) => {
  const enter = interpolate(timeline, [enterStart, enterEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const exit = interpolate(timeline, [exitStart, exitEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  return Math.min(enter, exit);
};

const pop = (progress: number) =>
  progress + Math.sin(progress * Math.PI) * 0.075;

const valueAt = (data: readonly number[], progress: number) => {
  const p = Math.max(0, Math.min(0.99999, progress)) * (data.length - 1);
  const index = Math.floor(p);
  const local = p - index;
  return data[index] + (data[Math.min(index + 1, data.length - 1)] - data[index]) * local;
};

const svgPath = (
  data: readonly number[],
  left: number,
  top: number,
  width: number,
  height: number,
  max: number,
) =>
  data
    .map((value, index) => {
      const x = left + (index / (data.length - 1)) * width;
      const y = top + height - (value / max) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

const pointOnSeries = (
  data: readonly number[],
  progress: number,
  left: number,
  top: number,
  width: number,
  height: number,
  max: number,
) => {
  const p = Math.max(0, Math.min(0.99999, progress)) * (data.length - 1);
  const index = Math.floor(p);
  const local = p - index;
  const value = data[index] + (data[Math.min(index + 1, data.length - 1)] - data[index]) * local;
  return {
    x: left + (p / (data.length - 1)) * width,
    y: top + height - (value / max) * height,
  };
};

const money = (value: number) => `$${value.toFixed(1)}M`;

const GlassCard: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  reveal?: number;
  depth?: number;
  float?: number;
  children: React.ReactNode;
}> = ({x, y, width, height, reveal = 1, depth = 0, float = 0, children}) => (
  <div
    data-safe-object="true"
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      overflow: 'hidden',
      borderRadius: 20,
      background: C.panel,
      border: '1px solid rgba(133, 181, 204, 0.16)',
      boxShadow:
        '0 20px 45px rgba(0, 4, 10, 0.32), inset 0 1px 0 rgba(211, 240, 255, 0.055)',
      opacity: 0.82 + reveal * 0.18,
      transform: `translate3d(0, ${(1 - reveal) * 10 + float}px, ${depth}px) scale(${0.986 + reveal * 0.014})`,
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
      willChange: 'transform, opacity',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(132deg, rgba(255,255,255,.038), transparent 28%, transparent 74%, rgba(70,221,243,.018))',
        pointerEvents: 'none',
      }}
    />
    {children}
  </div>
);

const NavIcon: React.FC<{index: number; active: boolean}> = ({index, active}) => {
  const stroke = active ? C.cyan : '#7190a2';
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const icons = [
    <g key="overview"><rect {...common} x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect {...common} x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect {...common} x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect {...common} x="13.5" y="13.5" width="7" height="7" rx="1.5"/></g>,
    <g key="performance"><path {...common} d="M3.5 18.5 8.5 13l4 2.8 7.8-10"/><path {...common} d="M16 5.8h4.3v4.3"/></g>,
    <g key="revenue"><path {...common} d="M4 19V10M10 19V5M16 19v-7M22 19V3"/><path {...common} d="M2.5 20.5h21"/></g>,
    <g key="cash"><circle {...common} cx="12" cy="12" r="8.5"/><path {...common} d="M14.8 8.5c-.7-.6-1.6-.9-2.7-.9-1.5 0-2.7.8-2.7 2s1.1 1.7 2.7 2c1.7.3 2.8.9 2.8 2.3s-1.2 2.3-3 2.3c-1.2 0-2.3-.4-3.1-1.1M12 5.4v13.2"/></g>,
    <g key="forecast"><path {...common} d="M4 18 9 12.5l4 3 7-9"/><path {...common} d="M15.5 6.5H20V11"/><path {...common} d="M4 5.5h5"/></g>,
    <g key="reports"><path {...common} d="M6 3.5h9l3 3v14H6zM15 3.5v4h3M9 12h6M9 16h6"/></g>,
  ];
  return <svg width="23" height="23" viewBox="0 0 24 24">{icons[index]}</svg>;
};

const Sidebar: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = loopProgress(timeline, 0, 75, 835, 900);
  const items = ['Overview', 'Performance', 'Revenue', 'Cash Flow', 'Forecast', 'Reports'];
  return (
    <GlassCard x={24} y={24} width={218} height={792} reveal={reveal} depth={5} float={Math.sin(phase * 2) * 0.8}>
      <div style={{position: 'absolute', left: 25, right: 25, top: 28, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{position: 'relative', width: 34, height: 34, borderRadius: 11, border: '1px solid rgba(70,221,243,.35)', background: 'rgba(70,221,243,.08)'}}>
            <div style={{position: 'absolute', left: 8, right: 8, bottom: 8, height: 2, borderRadius: 2, background: C.cyan}}/>
            {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 9 + i * 6, bottom: 10, width: 3, height: 7 + i * 5, borderRadius: 2, background: i === 2 ? C.gold : C.cyan, opacity: .75 + i * .1}}/>)}
          </div>
          <div>
            <div style={{color: C.ink, fontSize: 17, fontWeight: 820, letterSpacing: 2.1}}>FINANCE</div>
            <div style={{marginTop: 4, color: C.muted, fontSize: 8.5, fontWeight: 720, letterSpacing: 1.6}}>EXECUTIVE VIEW</div>
          </div>
        </div>
        <div style={{height: 1, margin: '25px 0 27px', background: C.line}}/>
        <div style={{display: 'flex', flexDirection: 'column', gap: 13}}>
          {items.map((item, index) => {
            const itemReveal = loopProgress(timeline, 30 + index * 17, 92 + index * 17, 800 - index * 4, 885);
            const active = index === 0;
            return (
              <div key={item} style={{position: 'relative', height: 48, display: 'flex', alignItems: 'center', gap: 13, padding: '0 11px', borderRadius: 13, background: active ? 'rgba(70,221,243,.075)' : 'transparent', border: active ? '1px solid rgba(70,221,243,.14)' : '1px solid transparent', opacity: .34 + itemReveal * .66, transform: `translateX(${(1 - itemReveal) * 10}px)`}}>
                {active ? <div style={{position: 'absolute', left: -1, top: 12, width: 2, height: 24, borderRadius: 2, background: C.cyan, boxShadow: '0 0 14px rgba(70,221,243,.7)'}}/> : null}
                <NavIcon index={index} active={active}/>
                <span style={{color: active ? C.ink : '#9bb0be', fontSize: 13, fontWeight: active ? 760 : 630, letterSpacing: .5, whiteSpace: 'nowrap'}}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 25, right: 25, bottom: 25, paddingTop: 18, borderTop: `1px solid ${C.line}`, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, color: C.emerald, fontSize: 8.5, fontWeight: 800, letterSpacing: 1.1}}><span style={{width: 7, height: 7, borderRadius: '50%', background: C.emerald, boxShadow: '0 0 10px rgba(46,214,161,.65)'}}/>DATA CONNECTED</div>
        <div style={{marginTop: 9, color: C.dim, fontSize: 8.1, fontWeight: 680, lineHeight: 1.55, letterSpacing: .9}}>USD MILLIONS<br/>ILLUSTRATIVE DATA</div>
      </div>
    </GlassCard>
  );
};

const Header: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = loopProgress(timeline, 8, 82, 830, 900);
  const dataProgress = loopProgress(timeline, 95, 310, 775, 900);
  const revenueValue = valueAt(REVENUE, dataProgress);
  const pulse = .82 + (Math.sin(phase * 2) + 1) * .07;
  return (
    <GlassCard x={260} y={24} width={1364} height={88} reveal={reveal} depth={6} float={Math.sin(phase * 2 + .4) * .65}>
      <div style={{position: 'absolute', left: 25, top: 19, display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{position: 'relative', width: 39, height: 39, borderRadius: 13, display: 'grid', placeItems: 'center', border: '1px solid rgba(70,221,243,.22)', background: 'radial-gradient(circle, rgba(70,221,243,.13), rgba(70,221,243,.03))'}}>
          <svg width="25" height="25" viewBox="0 0 25 25"><path d="M3 18.5 8.2 13l4.1 2.7 8-10" fill="none" stroke={C.cyan} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 5.7h4.3V10" fill="none" stroke={C.gold} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{color: C.ink, fontSize: 21, fontWeight: 820, letterSpacing: 1.45}}>FINANCIAL PERFORMANCE · 2020–2026</div>
          <div style={{marginTop: 5, color: C.muted, fontSize: 9.2, fontWeight: 680, letterSpacing: 1.15}}>EXECUTIVE KPI OBSERVATORY · ILLUSTRATIVE USD MILLIONS</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 20, top: 16, display: 'flex', gap: 9, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {[
          ['2020 BASE', money(REVENUE[0]), C.muted],
          ['2026 OUTLOOK', money(revenueValue), C.cyan],
          ['6Y CAGR', `${(12.3 * dataProgress).toFixed(1)}%`, C.gold],
        ].map(([label, value, color], index) => (
          <div key={label} style={{width: index === 1 ? 142 : 119, height: 56, padding: '8px 12px', boxSizing: 'border-box', borderRadius: 12, border: `1px solid ${index === 1 ? 'rgba(70,221,243,.24)' : C.line}`, background: index === 1 ? `rgba(70,221,243,${.045 + pulse * .025})` : 'rgba(255,255,255,.018)'}}>
            <div style={{color: C.muted, fontSize: 7.6, fontWeight: 760, letterSpacing: 1}}>{label}</div>
            <div style={{marginTop: 6, color, fontSize: 15, fontWeight: 840, fontVariantNumeric: 'tabular-nums'}}>{value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const MiniSparkline: React.FC<{id: string; data: readonly number[]; color: string; progress: number; phase: number}> = ({id, data, color, progress, phase}) => {
  const max = Math.max(...data) * 1.08;
  const d = svgPath(data, 5, 6, 103, 39, max);
  const endY = 6 + 39 - (data[data.length - 1] / max) * 39;
  return (
    <svg viewBox="0 0 116 52" width="116" height="52">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop stopColor={color} stopOpacity=".25"/><stop offset="1" stopColor={color}/></linearGradient></defs>
      <path d="M5,46H108" fill="none" stroke={C.line} strokeWidth="1.2"/>
      <path d={d} fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" opacity=".12"/>
      <path d={d} fill="none" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress}/>
      <circle cx="108" cy={endY} r={(3.7 + (Math.sin(phase * 2) + 1) * .5) * pop(progress)} fill={C.board} stroke={color} strokeWidth="2" opacity={progress}/>
    </svg>
  );
};

const KPI_DATA = [
  {label: 'NET REVENUE', unit: '$', data: REVENUE, color: C.cyan, delta: '+11.8%', note: 'YOY GROWTH'},
  {label: 'EBITDA', unit: '$', data: EBITDA, color: C.emerald, delta: '+19.6%', note: 'YOY GROWTH'},
  {label: 'OPERATING MARGIN', unit: '', data: MARGIN, color: C.gold, delta: '+1.8 pp', note: 'VS 2025'},
  {label: 'FREE CASH FLOW', unit: '$', data: CASH_FLOW, color: C.violet, delta: '+22.2%', note: 'YOY GROWTH'},
] as const;

const KpiCard: React.FC<{index: number; timeline: number; phase: number}> = ({index, timeline, phase}) => {
  const item = KPI_DATA[index];
  const reveal = loopProgress(timeline, 55 + index * 27, 130 + index * 27, 808 - index * 5, 895);
  const dataProgress = loopProgress(timeline, 105 + index * 27, 315 + index * 25, 775 - index * 4, 900);
  const sparkProgress = loopProgress(timeline, 135 + index * 24, 305 + index * 24, 770, 900);
  const chipProgress = loopProgress(timeline, 245 + index * 24, 320 + index * 24, 768, 892);
  const value = valueAt(item.data, dataProgress);
  const isPercent = index === 2;
  const sheen = loopProgress(timeline, 575 + index * 18, 670 + index * 18, 718 + index * 6, 785 + index * 4);
  const sheenOpacity = Math.sin(sheen * Math.PI) * .24;
  return (
    <GlassCard x={260 + index * 344} y={130} width={330} height={132} reveal={reveal} depth={8 + index * .5} float={Math.sin(phase * 2 + index * .7) * 1.35 * reveal}>
      <div style={{position: 'absolute', left: 18, top: 16, display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <span style={{width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 14px ${item.color}88`}}/>
        <span style={{color: '#a6bac7', fontSize: 9.2, fontWeight: 760, letterSpacing: 1.05}}>{item.label}</span>
      </div>
      <div style={{position: 'absolute', left: 18, top: 45, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <span style={{color: C.ink, fontSize: 28, fontWeight: 840, letterSpacing: -.65, fontVariantNumeric: 'tabular-nums'}}>{item.unit}{value.toFixed(1)}{isPercent ? '%' : 'M'}</span>
        <div style={{marginTop: 6, display: 'flex', alignItems: 'center', gap: 7, opacity: .35 + chipProgress * .65, transform: `translateY(${(1 - chipProgress) * 4}px)`}}>
          <span style={{padding: '4px 7px', borderRadius: 7, color: item.color, background: `${item.color}14`, border: `1px solid ${item.color}28`, fontSize: 8.5, fontWeight: 820}}>{item.delta}</span>
          <span style={{color: C.dim, fontSize: 7.7, fontWeight: 720, letterSpacing: .8}}>{item.note}</span>
        </div>
      </div>
      <div style={{position: 'absolute', right: 13, bottom: 12}}><MiniSparkline id={`kpi-spark-${index}`} data={item.data} color={item.color} progress={sparkProgress} phase={phase + index * .5}/></div>
      <div style={{position: 'absolute', left: -70 + sheen * 470, top: -55, width: 58, height: 245, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)', filter: 'blur(4px)', opacity: sheenOpacity, pointerEvents: 'none'}}/>
    </GlassCard>
  );
};

const PerformanceChart: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = loopProgress(timeline, 105, 195, 820, 900);
  const plot = {left: 70, top: 68, width: 776, height: 260};
  const max = 160;
  const revenueProgress = loopProgress(timeline, 150, 415, 770, 900);
  const ebitdaProgress = loopProgress(timeline, 205, 455, 770, 900);
  const cashProgress = loopProgress(timeline, 245, 490, 770, 900);
  const forecastProgress = loopProgress(timeline, 410, 560, 770, 900);
  const railProgress = loopProgress(timeline, 260, 530, 770, 900);
  const scanProgress = loopProgress(timeline, 175, 560, 760, 900);
  const heroIn = interpolate(timeline, [575, 625], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const heroOut = interpolate(timeline, [760, 810], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const hero = Math.min(heroIn, heroOut);
  const scannerOpacity = Math.sin(scanProgress * Math.PI) * .48;
  const tracerProgress = ((timeline - 585) / 150 + 10) % 1;
  const tracer = pointOnSeries(REVENUE, tracerProgress, plot.left, plot.top, plot.width, plot.height, max);
  const revenuePath = svgPath(REVENUE, plot.left, plot.top, plot.width, plot.height, max);
  const ebitdaPath = svgPath(EBITDA, plot.left, plot.top, plot.width, plot.height, max);
  const cashPath = svgPath(CASH_FLOW, plot.left, plot.top, plot.width, plot.height, max);
  const revenueArea = `${revenuePath} L${plot.left + plot.width},${plot.top + plot.height} L${plot.left},${plot.top + plot.height} Z`;
  const x2025 = plot.left + (5 / 6) * plot.width;
  const y2025 = plot.top + plot.height - (REVENUE[5] / max) * plot.height;
  const x2026 = plot.left + plot.width;
  const y2026 = plot.top + plot.height - (REVENUE[6] / max) * plot.height;
  return (
    <GlassCard x={260} y={280} width={905} height={536} reveal={reveal} depth={6} float={Math.sin(phase * 2 + 1.6) * .9 * reveal}>
      <div style={{position: 'absolute', left: 24, top: 19, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{color: C.ink, fontSize: 14, fontWeight: 820, letterSpacing: 1.2}}>FINANCIAL PERFORMANCE 2020–2026</div>
        <div style={{marginTop: 5, color: C.muted, fontSize: 8.6, fontWeight: 660, letterSpacing: .9}}>ANNUAL TREND · USD MILLIONS</div>
      </div>
      <div style={{position: 'absolute', right: 23, top: 22, display: 'flex', alignItems: 'center', gap: 15, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {[
          ['NET REVENUE', C.cyan],
          ['EBITDA', C.emerald],
          ['FREE CASH FLOW', C.violet],
          ['2026 OUTLOOK', C.gold],
        ].map(([label, color]) => <span key={label} style={{display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 7.6, fontWeight: 760, letterSpacing: .65}}><i style={{width: 15, height: 3, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}44`}}/>{label}</span>)}
      </div>
      <svg viewBox="0 0 905 370" width="905" height="370" style={{position: 'absolute', left: 0, top: 54}}>
        <defs>
          <linearGradient id="revenue-area-finance" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.cyan} stopOpacity=".28"/><stop offset="1" stopColor={C.cyan} stopOpacity="0"/></linearGradient>
          <filter id="soft-data-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <clipPath id="revenue-area-clip"><rect x={plot.left} y={plot.top - 10} width={plot.width * revenueProgress} height={plot.height + 20}/></clipPath>
        </defs>
        <rect x={x2026 - 38} y={plot.top - 16} width="76" height={plot.height + 43} rx="12" fill={`rgba(240,199,107,${.025 + forecastProgress * .055})`} stroke={`rgba(240,199,107,${forecastProgress * .13})`}/>
        {[0, 40, 80, 120, 160].map((tick) => {
          const y = plot.top + plot.height - (tick / max) * plot.height;
          return <g key={tick}><line x1={plot.left} y1={y} x2={plot.left + plot.width} y2={y} stroke={tick === 0 ? 'rgba(143,180,199,.28)' : C.line} strokeWidth={tick === 0 ? 1.4 : 1.05}/><text x={plot.left - 15} y={y + 4} textAnchor="end" fill={C.dim} fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="650">{tick}</text></g>;
        })}
        <path d={revenueArea} fill="url(#revenue-area-finance)" opacity={.18 + revenueProgress * .82} clipPath="url(#revenue-area-clip)"/>
        {[
          {data: REVENUE, d: revenuePath, color: C.cyan, progress: revenueProgress, start: 150},
          {data: EBITDA, d: ebitdaPath, color: C.emerald, progress: ebitdaProgress, start: 205},
          {data: CASH_FLOW, d: cashPath, color: C.violet, progress: cashProgress, start: 245},
        ].map((series, seriesIndex) => (
          <g key={series.color}>
            <path d={series.d} fill="none" stroke={series.color} strokeWidth={seriesIndex === 0 ? 3.2 : 2.7} strokeLinecap="round" strokeLinejoin="round" opacity=".11"/>
            <path d={series.d} fill="none" stroke={series.color} strokeWidth={seriesIndex === 0 ? 3.2 : 2.7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - series.progress} filter={seriesIndex === 0 ? 'url(#soft-data-glow)' : undefined}/>
            {series.data.map((value, pointIndex) => {
              const markerProgress = loopProgress(timeline, series.start + pointIndex * 23, series.start + 54 + pointIndex * 23, 770, 900);
              const x = plot.left + (pointIndex / 6) * plot.width;
              const y = plot.top + plot.height - (value / max) * plot.height;
              const endpoint = pointIndex === 6;
              return <circle key={pointIndex} cx={x} cy={y} r={(endpoint ? 4.7 : 2.8) * pop(markerProgress)} fill={C.board} stroke={endpoint ? C.gold : series.color} strokeWidth={endpoint ? 2.2 : 1.6} opacity={.12 + markerProgress * .88}/>;
            })}
          </g>
        ))}
        <path d={`M${x2025},${y2025} L${x2026},${y2026}`} fill="none" stroke={C.gold} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="8 8" pathLength={1} strokeDashoffset={1 - forecastProgress} opacity={forecastProgress} filter="url(#soft-data-glow)"/>
        <line x1={plot.left + plot.width * scanProgress} y1={plot.top - 6} x2={plot.left + plot.width * scanProgress} y2={plot.top + plot.height + 8} stroke={C.cyan} strokeWidth="1.3" opacity={scannerOpacity}/>
        <circle cx={plot.left + plot.width * scanProgress} cy={plot.top - 6} r="3.3" fill={C.cyan} opacity={scannerOpacity}/>
        <circle cx={tracer.x} cy={tracer.y} r={4.2} fill={C.cyan} opacity={hero}/><circle cx={tracer.x} cy={tracer.y} r={9 + (Math.sin(phase * 3) + 1) * 1.3} fill="none" stroke={C.cyan} strokeWidth="1.3" opacity={hero * .36}/>
        {YEARS.map((year, index) => {
          const x = plot.left + (index / 6) * plot.width;
          return <text key={year} x={x} y={plot.top + plot.height + 28} textAnchor="middle" fill={year === 2026 ? C.gold : '#89a2b2'} fontFamily="Arial, Helvetica, sans-serif" fontSize="9.2" fontWeight={year === 2026 ? 820 : 650}>{year}</text>;
        })}
        <g opacity={forecastProgress} transform={`translate(${x2026 - 74} ${Math.max(26, y2026 - 55)}) scale(${.92 + pop(forecastProgress) * .08})`}>
          <rect width="77" height="39" rx="10" fill="rgba(240,199,107,.12)" stroke="rgba(240,199,107,.34)"/>
          <text x="38.5" y="16" textAnchor="middle" fill={C.gold} fontFamily="Arial, Helvetica, sans-serif" fontSize="8" fontWeight="750">2026 OUTLOOK</text>
          <text x="38.5" y="30" textAnchor="middle" fill={C.ink} fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="820">$148.6M</text>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 23, right: 23, bottom: 18, height: 82, borderRadius: 15, border: `1px solid ${C.line}`, background: 'rgba(4,16,25,.42)', fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{position: 'absolute', left: 31, right: 31, top: 38, height: 2, borderRadius: 2, background: 'rgba(133,181,204,.13)'}}/>
        <div style={{position: 'absolute', left: 31, top: 38, width: `${(838 - 62) * railProgress}px`, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.gold})`, boxShadow: '0 0 10px rgba(70,221,243,.22)'}}/>
        {[2020, 2022, 2024, 2026].map((year, index) => {
          const nodeProgress = loopProgress(timeline, 270 + index * 60, 325 + index * 60, 770, 900);
          const x = 31 + index * ((838 - 62) / 3);
          const labels = ['BASE YEAR', 'SCALE', 'EXPANSION', 'OUTLOOK'];
          return <div key={year} style={{position: 'absolute', left: x - 43, top: 8, width: 86, textAlign: 'center', opacity: .28 + nodeProgress * .72, transform: `translateY(${(1 - nodeProgress) * 3}px)`}}><div style={{color: year === 2026 ? C.gold : C.ink, fontSize: 9.5, fontWeight: 820}}>{year}</div><div style={{position: 'absolute', left: 37, top: 25, width: 12, height: 12, borderRadius: '50%', boxSizing: 'border-box', background: year <= 2024 ? C.cyan : C.gold, border: `2px solid ${year <= 2024 ? C.cyan : C.gold}`, boxShadow: year === 2026 ? '0 0 0 6px rgba(240,199,107,.1)' : 'none', transform: `scale(${pop(nodeProgress)})`}}/><div style={{marginTop: 31, color: C.dim, fontSize: 7.2, fontWeight: 730, letterSpacing: .8}}>{labels[index]}</div></div>;
        })}
      </div>
    </GlassCard>
  );
};

const AllocationCard: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = loopProgress(timeline, 225, 320, 805, 900);
  const donutProgress = loopProgress(timeline, 390, 590, 770, 900);
  const parts = [
    {label: 'Operations', value: 42, color: C.cyan},
    {label: 'Growth', value: 28, color: C.emerald},
    {label: 'Innovation', value: 18, color: C.gold},
    {label: 'Liquidity', value: 12, color: C.violet},
  ];
  let offset = 0;
  const glintAngle = -Math.PI / 2 + donutProgress * Math.PI * 2 + phase * .15;
  return (
    <GlassCard x={1179} y={280} width={445} height={242} reveal={reveal} depth={7} float={Math.sin(phase * 2 + 2.7) * 1.15 * reveal}>
      <div style={{position: 'absolute', left: 22, top: 18, fontFamily: 'Arial, Helvetica, sans-serif'}}><div style={{color: C.ink, fontSize: 13.5, fontWeight: 820, letterSpacing: 1.05}}>CAPITAL ALLOCATION 2026</div><div style={{marginTop: 5, color: C.muted, fontSize: 8.3, fontWeight: 660, letterSpacing: .8}}>PLANNED USE OF CAPITAL</div></div>
      <div style={{position: 'absolute', left: 20, top: 66, width: 160, height: 160}}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="59" fill="none" stroke="rgba(133,181,204,.11)" strokeWidth="20"/>
          <g transform="rotate(-90 80 80)">
            {parts.map((part, index) => {
              const currentOffset = offset;
              offset += part.value;
              const segmentProgress = loopProgress(timeline, 395 + index * 38, 505 + index * 38, 770, 900);
              return <circle key={part.label} cx="80" cy="80" r="59" fill="none" stroke={part.color} strokeWidth="20" strokeLinecap="butt" pathLength={100} strokeDasharray={`${part.value * segmentProgress} ${100 - part.value * segmentProgress}`} strokeDashoffset={-currentOffset} opacity={.2 + segmentProgress * .8}/>;
            })}
          </g>
          <circle cx={80 + Math.cos(glintAngle) * 59} cy={80 + Math.sin(glintAngle) * 59} r="3.2" fill="#fff" opacity={donutProgress * .8}/>
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif'}}><div style={{color: C.ink, fontSize: 24, fontWeight: 850, fontVariantNumeric: 'tabular-nums'}}>{Math.round(100 * donutProgress)}%</div><div style={{marginTop: 2, color: C.dim, fontSize: 7.5, fontWeight: 760, letterSpacing: 1}}>ALLOCATED</div></div>
      </div>
      <div style={{position: 'absolute', left: 201, right: 20, top: 65, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {parts.map((part, index) => {
          const rowProgress = loopProgress(timeline, 455 + index * 31, 520 + index * 31, 770 + index * 3, 890);
          return <div key={part.label} style={{height: 38, display: 'grid', gridTemplateColumns: '11px 1fr 38px', gap: 8, alignItems: 'center', borderBottom: index < parts.length - 1 ? `1px solid ${C.line}` : 'none', opacity: .3 + rowProgress * .7, transform: `translateX(${(1 - rowProgress) * 7}px)`}}><span style={{width: 7, height: 7, borderRadius: '50%', background: part.color, boxShadow: `0 0 8px ${part.color}55`}}/><span style={{color: '#a7bbc8', fontSize: 9.8, fontWeight: 660}}>{part.label}</span><span style={{color: part.color, textAlign: 'right', fontSize: 11, fontWeight: 820, fontVariantNumeric: 'tabular-nums'}}>{Math.round(part.value * donutProgress)}%</span></div>;
        })}
      </div>
    </GlassCard>
  );
};

const CashFlowCard: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = loopProgress(timeline, 300, 395, 805, 900);
  const summaryProgress = loopProgress(timeline, 460, 640, 770, 900);
  const max = 34;
  return (
    <GlassCard x={1179} y={540} width={445} height={276} reveal={reveal} depth={6} float={Math.sin(phase * 2 + 3.6) * 1.05 * reveal}>
      <div style={{position: 'absolute', left: 22, top: 18, fontFamily: 'Arial, Helvetica, sans-serif'}}><div style={{color: C.ink, fontSize: 13.5, fontWeight: 820, letterSpacing: 1.05}}>FREE CASH FLOW 2020–2026</div><div style={{marginTop: 5, color: C.muted, fontSize: 8.3, fontWeight: 660, letterSpacing: .8}}>CASH GENERATION · USD MILLIONS</div></div>
      <div style={{position: 'absolute', right: 21, top: 16, textAlign: 'right', fontFamily: 'Arial, Helvetica, sans-serif'}}><div style={{color: C.violet, fontSize: 19, fontWeight: 850, fontVariantNumeric: 'tabular-nums'}}>{money(valueAt(CASH_FLOW, summaryProgress))}</div><div style={{marginTop: 3, color: C.dim, fontSize: 7.4, fontWeight: 740, letterSpacing: .8}}>2026 OUTLOOK</div></div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 76, height: 133, borderBottom: '1px solid rgba(133,181,204,.18)'}}>
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: i * 43, height: 1, background: C.line}}/>)}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px'}}>
          {CASH_FLOW.map((value, index) => {
            const barProgress = loopProgress(timeline, 410 + index * 31, 500 + index * 31, 775, 900);
            const height = (value / max) * 121 * pop(barProgress);
            const isLast = index === 6;
            const shimmer = loopProgress(timeline, 650 + index * 5, 715 + index * 5, 745, 800);
            return <div key={YEARS[index]} style={{position: 'relative', width: 37, height: 121, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}><div style={{position: 'relative', width: 20, height, minHeight: 2, borderRadius: '6px 6px 2px 2px', overflow: 'hidden', background: isLast ? `linear-gradient(180deg, ${C.gold}, ${C.violet})` : `linear-gradient(180deg, ${C.violet}, rgba(154,140,255,.38))`, boxShadow: isLast ? '0 0 16px rgba(240,199,107,.22)' : '0 0 10px rgba(154,140,255,.12)'}}><div style={{position: 'absolute', left: -8, top: `${100 - shimmer * 155}%`, width: 36, height: 14, transform: 'rotate(-12deg)', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.42), transparent)', opacity: Math.sin(shimmer * Math.PI) * .7}}/></div></div>;
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 213, display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontFamily: 'Arial, Helvetica, sans-serif'}}>{YEARS.map((year, index) => <span key={year} style={{width: 37, textAlign: 'center', color: year === 2026 ? C.gold : C.dim, fontSize: 7.8, fontWeight: year === 2026 ? 820 : 650}}>{year}</span>)}</div>
      <div style={{position: 'absolute', left: 22, right: 22, bottom: 17, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px', borderRadius: 9, background: 'rgba(154,140,255,.055)', border: '1px solid rgba(154,140,255,.12)', fontFamily: 'Arial, Helvetica, sans-serif'}}><span style={{color: C.muted, fontSize: 7.8, fontWeight: 720, letterSpacing: .8}}>CASH CONVERSION</span><span style={{color: C.violet, fontSize: 11, fontWeight: 830, fontVariantNumeric: 'tabular-nums'}}>{Math.round(77 * summaryProgress)}%</span></div>
    </GlassCard>
  );
};

const Dashboard: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => (
  <div style={{position: 'relative', width: 1648, height: 840, borderRadius: 30, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(11,29,41,.98), rgba(5,17,26,.99))', border: '1px solid rgba(160,203,224,.16)', boxShadow: '0 42px 90px rgba(0,3,9,.48), inset 0 1px 0 rgba(255,255,255,.055)', transformStyle: 'preserve-3d'}}>
    <div style={{position: 'absolute', inset: 0, opacity: .18, backgroundImage: 'linear-gradient(rgba(85,139,164,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(85,139,164,.08) 1px, transparent 1px)', backgroundSize: '42px 42px'}}/>
    <div style={{position: 'absolute', right: -110, top: -180, width: 720, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,221,243,.085), rgba(70,221,243,0) 67%)', filter: 'blur(8px)'}}/>
    <Sidebar timeline={timeline} phase={phase}/>
    <Header timeline={timeline} phase={phase}/>
    {[0, 1, 2, 3].map((index) => <KpiCard key={index} index={index} timeline={timeline} phase={phase}/>)}
    <PerformanceChart timeline={timeline} phase={phase}/>
    <AllocationCard timeline={timeline} phase={phase}/>
    <CashFlowCard timeline={timeline} phase={phase}/>
  </div>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = (frame / durationInFrames) * 900;
  const phase = (frame / durationInFrames) * Math.PI * 2;
  const boardReveal = loopProgress(timeline, 0, 72, 835, 900);
  const cameraX = Math.sin(phase) * 28 + Math.sin(phase * 2 + .6) * 6;
  const cameraY = Math.sin(phase * 2 - .35) * 12 + Math.sin(phase + .8) * 4;
  const cameraScale = 1.002 + Math.sin(phase - .5) * .01 + Math.sin(phase * 2 + .25) * .004;
  const rotateX = Math.sin(phase + .7) * .38 + Math.sin(phase * 2) * .1;
  const rotateY = Math.cos(phase) * .62 + Math.sin(phase * 2 + .4) * .14;
  const rotateZ = Math.sin(phase - .4) * .08;
  const sweep = loopProgress(timeline, 555, 720, 746, 810);
  const sweepOpacity = Math.sin(sweep * Math.PI) * .12;
  const ambientX = 1160 + Math.sin(phase) * 170;
  const ambientY = 170 + Math.cos(phase) * 95;
  const particles = Array.from({length: 26}, (_, index) => ({
    x: 45 + ((index * 149 + 73) % 1830),
    y: 35 + ((index * 97 + 41) % 1010),
    size: 1 + (index % 3) * .55,
    opacity: .1 + ((index * 7) % 9) * .018,
  }));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(circle at 70% 18%, #10293a 0%, #071522 40%, #030a12 100%)', fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <div style={{position: 'absolute', inset: 0, opacity: .22, backgroundImage: 'linear-gradient(rgba(73,132,160,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(73,132,160,.08) 1px, transparent 1px)', backgroundSize: '72px 72px', transform: `translate(${Math.sin(phase) * 8}px, ${Math.cos(phase) * 6}px)`}}/>
      <div style={{position: 'absolute', left: ambientX - 420, top: ambientY - 330, width: 840, height: 660, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,221,243,.13), rgba(70,221,243,.025) 38%, transparent 70%)', filter: 'blur(22px)'}}/>
      <div style={{position: 'absolute', left: 110 + Math.cos(phase) * 70, bottom: -160 + Math.sin(phase) * 30, width: 720, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(154,140,255,.11), transparent 70%)', filter: 'blur(28px)'}}/>
      {particles.map((particle, index) => <div key={index} style={{position: 'absolute', left: particle.x + Math.sin(phase + index) * 5, top: particle.y + Math.cos(phase * 1.4 + index) * 4, width: particle.size, height: particle.size, borderRadius: '50%', background: index % 5 === 0 ? C.gold : C.cyan, opacity: particle.opacity * (.72 + Math.sin(phase * 2 + index) * .28), boxShadow: `0 0 ${4 + particle.size * 2}px currentColor`}}/>)}
      <div data-safe-object="board" style={{position: 'absolute', left: 136, top: 120, width: 1648, height: 840, transformOrigin: '50% 50%', transformStyle: 'preserve-3d', opacity: .84 + boardReveal * .16, willChange: 'transform, opacity', transform: `perspective(3600px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${cameraScale * (.978 + boardReveal * .022)})`}}>
        <Dashboard timeline={timeline} phase={phase}/>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 30, pointerEvents: 'none', transform: 'translateZ(28px)'}}><div style={{position: 'absolute', left: -250 + sweep * 2150, top: -150, width: 100, height: 1180, transform: 'rotate(15deg)', background: 'linear-gradient(90deg, transparent, rgba(215,244,255,.55), transparent)', filter: 'blur(7px)', opacity: sweepOpacity}}/></div>
      </div>
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .075, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(198,229,244,.44) .55px, transparent .75px)', backgroundSize: '6px 6px', mixBlendMode: 'soft-light'}}/>
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 56%, rgba(0,3,8,.42) 100%)'}}/>
    </AbsoluteFill>
  );
};
