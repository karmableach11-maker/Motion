import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const C = {
  background: '#e9efec',
  board: '#edf3f0',
  surface: '#fbfdfc',
  ink: '#183a35',
  muted: '#71877f',
  grid: '#d8e4df',
  track: '#e2eae6',
  scope1: '#0b6b66',
  scope2: '#28ae91',
  scope3: '#9acb69',
  graphite: '#31443f',
};

const YEARS = Array.from({length: 11}, (_, index) => 2020 + index);
const SCOPE_1 = [30, 29, 27, 25, 23, 20, 17, 14, 11, 8, 5];
const SCOPE_2 = [25, 24, 22, 20, 18, 15, 12, 9, 7, 5, 3];
const SCOPE_3 = [45, 43, 41, 38, 35, 32, 28, 24, 20, 16, 12];

const linePoints = (
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
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

const Card: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
  depth?: number;
}> = ({x, y, width, height, children, depth = 0}) => (
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
      background: C.surface,
      border: '1px solid rgba(255,255,255,0.94)',
      boxShadow:
        '11px 13px 24px rgba(65,92,82,0.14), -9px -9px 20px rgba(255,255,255,0.88), inset 0 1px 0 rgba(255,255,255,0.96)',
      transform: `translateZ(${depth}px)`,
      backfaceVisibility: 'hidden',
    }}
  >
    {children}
  </div>
);

const MiniIcon: React.FC<{type: number}> = ({type}) => {
  const common = {
    fill: 'none',
    stroke: C.scope1,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const shapes = [
    <g key="overview"><rect {...common} x="4" y="4" width="6" height="6" rx="1" /><rect {...common} x="14" y="4" width="6" height="6" rx="1" /><rect {...common} x="4" y="14" width="6" height="6" rx="1" /><rect {...common} x="14" y="14" width="6" height="6" rx="1" /></g>,
    <g key="scopes"><circle {...common} cx="6" cy="12" r="3" /><circle {...common} cx="18" cy="6" r="3" /><circle {...common} cx="18" cy="18" r="3" /><path {...common} d="m8.7 10.7 6.5-3.4M8.7 13.3l6.5 3.4" /></g>,
    <g key="roadmap"><path {...common} d="M4 18 9 12l4 3 7-9" /><path {...common} d="M15.5 6H20v4.5" /></g>,
    <g key="levers"><path {...common} d="M5 6h14M5 12h14M5 18h14" /><circle cx="9" cy="6" r="2" fill={C.surface} stroke={C.scope1} strokeWidth="1.8" /><circle cx="15" cy="12" r="2" fill={C.surface} stroke={C.scope1} strokeWidth="1.8" /><circle cx="11" cy="18" r="2" fill={C.surface} stroke={C.scope1} strokeWidth="1.8" /></g>,
    <g key="removals"><path {...common} d="M12 21V10" /><path {...common} d="M12 13C6 13 4 9 4 5c6 0 8 3 8 8ZM12 16c6 0 8-4 8-8-6 0-8 3-8 8Z" /></g>,
    <g key="reports"><path {...common} d="M6 3.5h9l3 3v14H6zM15 3.5v4h3M9 12h6M9 16h6" /></g>,
  ];

  return <svg width="23" height="23" viewBox="0 0 24 24">{shapes[type]}</svg>;
};

const Sidebar: React.FC = () => {
  const items = ['Overview', 'Scopes 1–3', 'Roadmap', 'Levers', 'Removals', 'Reports'];

  return (
    <Card x={28} y={28} width={212} height={784} depth={5}>
      <div style={{padding: '30px 25px', fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{color: C.ink, fontSize: 17, fontWeight: 820, letterSpacing: 2.2}}>NET ZERO</div>
        <div style={{marginTop: 7, color: C.muted, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.55}}>PATHWAY 2030</div>
        <div style={{height: 1, margin: '24px 0 28px', background: C.grid}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
          {items.map((item, index) => (
            <div key={item} style={{display: 'flex', alignItems: 'center', gap: 13}}>
              <MiniIcon type={index} />
              <span style={{color: index === 0 ? C.scope2 : C.scope1, fontSize: 14, fontWeight: index === 0 ? 800 : 670, letterSpacing: 0.8, whiteSpace: 'nowrap'}}>{item}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 25,
            right: 25,
            bottom: 27,
            paddingTop: 18,
            borderTop: `1px solid ${C.grid}`,
            color: C.muted,
            fontSize: 9.5,
            fontWeight: 700,
            lineHeight: 1.65,
            letterSpacing: 1.25,
          }}
        >
          ILLUSTRATIVE PATHWAY
          <br />FIGURES NOT AUDITED
        </div>
      </div>
    </Card>
  );
};

const Header: React.FC<{phase: number}> = ({phase}) => {
  const badgePulse = 0.9 + Math.sin(phase) * 0.06;

  return (
    <Card x={258} y={28} width={1354} height={94} depth={6}>
      <div style={{position: 'absolute', left: 30, top: 22, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
          <svg width="29" height="29" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r="10.5" fill="none" stroke={C.scope2} strokeWidth="2" />
            <circle cx="15" cy="15" r="4" fill="none" stroke={C.scope1} strokeWidth="2" />
            <path d="M15 1.5v6M15 22.5v6M1.5 15h6M22.5 15h6" stroke={C.scope1} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div>
            <div style={{color: C.ink, fontSize: 24, fontWeight: 820, letterSpacing: 2.1}}>NET-ZERO ROADMAP 2030</div>
            <div style={{marginTop: 4, color: C.muted, fontSize: 11, fontWeight: 650, letterSpacing: 1.35}}>ILLUSTRATIVE EMISSIONS PATHWAY · 2020–2030</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 24, top: 20, display: 'flex', gap: 10, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {[
          ['2020 BASELINE', '100 kt'],
          ['2026 PATHWAY', '57 kt'],
          ['2030 NET TARGET', '0 kt'],
        ].map(([label, value], index) => (
          <div
            key={label}
            style={{
              width: index === 2 ? 152 : 132,
              height: 54,
              padding: '9px 13px',
              borderRadius: 12,
              background: index === 2 ? `rgba(40,174,145,${0.11 * badgePulse})` : '#f2f6f4',
              border: `1px solid ${index === 2 ? 'rgba(40,174,145,.26)' : C.grid}`,
              boxSizing: 'border-box',
            }}
          >
            <div style={{color: C.muted, fontSize: 8.5, fontWeight: 750, letterSpacing: 1}}>{label}</div>
            <div style={{marginTop: 5, color: index === 2 ? C.scope2 : C.ink, fontSize: 16, fontWeight: 820}}>{value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const MiniSparkline: React.FC<{data: readonly number[]; color: string; phase: number}> = ({data, color, phase}) => {
  const points = linePoints(data, 4, 6, 98, 35, Math.max(...data) * 1.05);
  const endY = 6 + 35 - (data[data.length - 1] / (Math.max(...data) * 1.05)) * 35;
  const pulse = 4.2 + (Math.sin(phase * 2) + 1) * 0.8;

  return (
    <svg viewBox="0 0 106 48" width="106" height="48">
      <line x1="4" y1="42" x2="102" y2="42" stroke={C.grid} strokeWidth="1" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="102" cy={endY} r={pulse} fill={C.surface} stroke={color} strokeWidth="2" />
    </svg>
  );
};

const ScopeCard: React.FC<{
  x: number;
  number: number;
  title: string;
  subtitle: string;
  value: number;
  change: number;
  color: string;
  data: readonly number[];
  phase: number;
}> = ({x, number, title, subtitle, value, change, color, data, phase}) => (
  <Card x={x} y={140} width={284} height={162} depth={7}>
    <div style={{position: 'absolute', left: 22, top: 19, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11, color, background: `${color}18`, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 12, fontWeight: 820}}>
      0{number}
    </div>
    <div style={{position: 'absolute', left: 67, top: 18, fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <div style={{color: C.ink, fontSize: 14, fontWeight: 810, letterSpacing: 0.8}}>{title}</div>
      <div style={{marginTop: 5, color: C.muted, fontSize: 9.5, fontWeight: 650, letterSpacing: 0.8}}>{subtitle}</div>
    </div>
    <div style={{position: 'absolute', left: 22, bottom: 20, fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 5}}>
        <span style={{color: C.ink, fontSize: 31, fontWeight: 830, letterSpacing: -0.5}}>{value}</span>
        <span style={{color: C.muted, fontSize: 10, fontWeight: 720}}>ktCO₂e</span>
      </div>
      <div style={{marginTop: 2, color, fontSize: 10.5, fontWeight: 800}}>{change}% vs 2020</div>
    </div>
    <div style={{position: 'absolute', right: 19, bottom: 24}}><MiniSparkline data={data.slice(0, 7)} color={color} phase={phase + number * 0.6} /></div>
    <div style={{position: 'absolute', right: 18, top: 20, color: C.muted, fontSize: 8.5, fontWeight: 730, letterSpacing: 0.8}}>2026 PLAN</div>
  </Card>
);

const TargetCard: React.FC<{phase: number}> = ({phase}) => {
  const glow = 0.16 + (Math.sin(phase) + 1) * 0.035;

  return (
    <Card x={1164} y={140} width={448} height={162} depth={8}>
      <div style={{position: 'absolute', left: 23, top: 20, color: C.ink, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, fontWeight: 820, letterSpacing: 1}}>2030 NET TARGET</div>
      <div style={{position: 'absolute', left: 23, top: 44, color: C.muted, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 9.5, fontWeight: 650, letterSpacing: 0.8}}>RESIDUAL EMISSIONS MINUS PERMANENT REMOVALS</div>
      <div style={{position: 'absolute', left: 23, bottom: 22, display: 'flex', alignItems: 'center', gap: 13, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {[
          ['20', 'GROSS'],
          ['−20', 'REMOVALS'],
          ['0', 'NET'],
        ].map(([value, label], index) => (
          <React.Fragment key={label}>
            <div style={{width: 91, height: 57, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: index === 2 ? `rgba(40,174,145,${glow})` : '#f2f6f4', border: `1px solid ${index === 2 ? 'rgba(40,174,145,.28)' : C.grid}`}}>
              <div style={{color: index === 2 ? C.scope2 : C.ink, fontSize: 22, fontWeight: 850}}>{value}</div>
              <div style={{marginTop: 2, color: C.muted, fontSize: 8.3, fontWeight: 760, letterSpacing: 1}}>{label}</div>
            </div>
            {index < 2 ? <div style={{color: C.muted, fontSize: 20, fontWeight: 500}}>{index === 0 ? '−' : '='}</div> : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{position: 'absolute', right: 20, top: 18, padding: '6px 10px', borderRadius: 10, color: C.scope1, background: '#edf6f2', fontSize: 8.5, fontWeight: 800, letterSpacing: 1}}>ktCO₂e</div>
    </Card>
  );
};

const MainRoadmap: React.FC<{phase: number}> = ({phase}) => {
  const plotLeft = 57;
  const plotTop = 75;
  const plotWidth = 786;
  const plotHeight = 220;
  const pulse = 0.72 + (Math.sin(phase * 2) + 1) * 0.11;
  const milestoneYears = [2020, 2023, 2026, 2028, 2030];
  const milestoneLabels = ['BASELINE', 'OPERATIONS', 'TRANSITION', 'SCALE-UP', 'NET TARGET'];

  return (
    <Card x={258} y={320} width={888} height={492} depth={6}>
      <div style={{position: 'absolute', left: 24, top: 19, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{color: C.ink, fontSize: 15, fontWeight: 820, letterSpacing: 1.25}}>SCOPE PATHWAY 2020–2030</div>
        <div style={{marginTop: 5, color: C.muted, fontSize: 9.5, fontWeight: 650, letterSpacing: 0.9}}>ILLUSTRATIVE GROSS EMISSIONS · ktCO₂e</div>
      </div>
      <div style={{position: 'absolute', right: 23, top: 23, display: 'flex', gap: 16, fontFamily: 'Arial, Helvetica, sans-serif'}}>
        {[
          ['SCOPE 1', C.scope1, 'solid'],
          ['SCOPE 2', C.scope2, 'solid'],
          ['SCOPE 3', C.scope3, 'solid'],
        ].map(([label, color]) => (
          <span key={label} style={{display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 9, fontWeight: 760, letterSpacing: 0.8}}>
            <i style={{display: 'block', width: 17, height: 3, borderRadius: 2, background: color}} />{label}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 888 330" style={{position: 'absolute', left: 0, top: 55, width: 888, height: 330}}>
        <rect x={plotLeft + plotWidth - 35} y={plotTop - 12} width="70" height={plotHeight + 35} rx="10" fill={`rgba(40,174,145,${0.045 + pulse * 0.02})`} />
        {[0, 10, 20, 30, 40, 50].map((tick) => {
          const y = plotTop + plotHeight - (tick / 50) * plotHeight;
          return (
            <g key={tick}>
              <line x1={plotLeft} y1={y} x2={plotLeft + plotWidth} y2={y} stroke={tick === 0 ? C.muted : C.grid} strokeWidth={tick === 0 ? 1.1 : 0.8} />
              <text x={plotLeft - 13} y={y + 4} textAnchor="end" fill={C.muted} fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="650">{tick}</text>
            </g>
          );
        })}
        {[SCOPE_1, SCOPE_2, SCOPE_3].map((data, index) => {
          const color = [C.scope1, C.scope2, C.scope3][index];
          return (
            <g key={color}>
              <polyline points={linePoints(data, plotLeft, plotTop, plotWidth, plotHeight, 50)} fill="none" stroke={color} strokeWidth={index === 2 ? 3.2 : 3} strokeLinecap="round" strokeLinejoin="round" opacity={0.92 + pulse * 0.06} />
              {data.map((value, pointIndex) => {
                const x = plotLeft + (pointIndex / (data.length - 1)) * plotWidth;
                const y = plotTop + plotHeight - (value / 50) * plotHeight;
                const endpoint = pointIndex === data.length - 1;
                return <circle key={pointIndex} cx={x} cy={y} r={endpoint ? 4.5 + pulse : 2.6} fill={C.surface} stroke={color} strokeWidth={endpoint ? 2.4 : 1.6} />;
              })}
            </g>
          );
        })}
        {YEARS.map((year, index) => {
          const x = plotLeft + (index / (YEARS.length - 1)) * plotWidth;
          return <text key={year} x={x} y={plotTop + plotHeight + 27} textAnchor="middle" fill={year === 2030 ? C.scope2 : C.ink} fontFamily="Arial, Helvetica, sans-serif" fontSize="9.2" fontWeight={year === 2030 ? 820 : 680}>{year}</text>;
        })}
        <text x={plotLeft + plotWidth} y={plotTop - 20} textAnchor="middle" fill={C.scope2} fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fontWeight="820" letterSpacing="1">TARGET</text>
      </svg>
      <div style={{position: 'absolute', left: 25, right: 25, bottom: 20, height: 82, borderRadius: 14, background: '#f3f7f5', border: `1px solid ${C.grid}`}}>
        <div style={{position: 'absolute', left: 42, right: 42, top: 36, height: 2, background: C.grid}} />
        <div style={{position: 'absolute', left: 42, top: 36, width: '58%', height: 2, background: C.scope2}} />
        {milestoneYears.map((year, index) => {
          const x = 42 + (index / (milestoneYears.length - 1)) * 752;
          const current = year === 2026;
          const nodeScale = current ? 1 + (Math.sin(phase * 2) + 1) * 0.08 : 1;
          return (
            <div key={year} style={{position: 'absolute', left: x - 36, top: 8, width: 72, textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif'}}>
              <div style={{color: current ? C.scope2 : C.ink, fontSize: 10, fontWeight: 820}}>{year}</div>
              <div style={{position: 'absolute', left: 30, top: 23, width: 12, height: 12, borderRadius: '50%', background: year <= 2026 ? C.scope2 : C.surface, border: `2px solid ${year <= 2026 ? C.scope2 : C.muted}`, transform: `scale(${nodeScale})`, boxSizing: 'border-box'}} />
              <div style={{marginTop: 29, color: C.muted, fontSize: 7.7, fontWeight: 760, letterSpacing: 0.55}}>{milestoneLabels[index]}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const ProgressRing: React.FC<{phase: number}> = ({phase}) => {
  const size = 135;
  const stroke = 21;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * 2 * radius;
  const progress = 0.54;
  const highlight = 0.8 + (Math.sin(phase * 2) + 1) * 0.09;

  return (
    <div style={{position: 'relative', width: size, height: size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.track} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.scope2} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} opacity={highlight} />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, Helvetica, sans-serif'}}>
        <div style={{color: C.scope2, fontSize: 27, fontWeight: 850}}>54%</div>
        <div style={{marginTop: 2, color: C.muted, fontSize: 7.8, fontWeight: 780, letterSpacing: 0.9}}>DELIVERED</div>
      </div>
    </div>
  );
};

const ProgressCard: React.FC<{phase: number}> = ({phase}) => (
  <Card x={1164} y={320} width={448} height={237} depth={7}>
    <div style={{position: 'absolute', left: 22, top: 18, color: C.ink, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, fontWeight: 820, letterSpacing: 1}}>2030 GROSS REDUCTION</div>
    <div style={{position: 'absolute', left: 22, top: 40, color: C.muted, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 9.3, fontWeight: 650, letterSpacing: 0.75}}>PROGRESS AGAINST 80 kt PLANNED ABATEMENT</div>
    <div style={{position: 'absolute', left: 25, top: 76}}><ProgressRing phase={phase} /></div>
    <div style={{position: 'absolute', left: 193, top: 78, right: 22, fontFamily: 'Arial, Helvetica, sans-serif'}}>
      {[
        ['2026 GROSS', '57 kt'],
        ['CUT VS 2020', '−43%'],
        ['2030 GROSS', '20 kt'],
      ].map(([label, value], index) => (
        <div key={label} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40, borderBottom: index < 2 ? `1px solid ${C.grid}` : 'none'}}>
          <span style={{color: C.muted, fontSize: 9.3, fontWeight: 740, letterSpacing: 0.85}}>{label}</span>
          <span style={{color: index === 1 ? C.scope2 : C.ink, fontSize: 16, fontWeight: 830}}>{value}</span>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', right: 22, bottom: 17, color: C.muted, fontSize: 8.2, fontWeight: 680, letterSpacing: 0.65}}>REMOVALS TRACKED SEPARATELY</div>
  </Card>
);

const LeversCard: React.FC<{phase: number}> = ({phase}) => {
  const levers = [
    ['Operations', 25, C.scope1],
    ['Renewable power', 22, C.scope2],
    ['Supplier transition', 20, C.scope3],
    ['Low-carbon logistics', 8, C.scope2],
    ['Circular materials', 5, C.scope3],
  ] as const;

  return (
    <Card x={1164} y={575} width={448} height={237} depth={6}>
      <div style={{position: 'absolute', left: 22, top: 18, color: C.ink, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, fontWeight: 820, letterSpacing: 1}}>REDUCTION LEVERS</div>
      <div style={{position: 'absolute', right: 21, top: 20, color: C.muted, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 9, fontWeight: 720, letterSpacing: 0.8}}>80 kt TOTAL</div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 53}}>
        {levers.map(([label, value, color], index) => {
          const pulse = 0.986 + ((Math.sin(phase * 2 + index * 0.7) + 1) / 2) * 0.014;
          return (
            <div key={label} style={{height: 34, display: 'grid', gridTemplateColumns: '128px 1fr 35px', gap: 10, alignItems: 'center', fontFamily: 'Arial, Helvetica, sans-serif'}}>
              <span style={{color: C.ink, fontSize: 10.5, fontWeight: 680}}>{label}</span>
              <div style={{height: 10, borderRadius: 5, overflow: 'hidden', background: C.track}}>
                <div style={{width: `${(value / 25) * 100 * pulse}%`, height: '100%', borderRadius: 5, background: color}} />
              </div>
              <span style={{color, textAlign: 'right', fontSize: 10.5, fontWeight: 820}}>{value} kt</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 22, bottom: 12, color: C.muted, fontSize: 7.8, fontWeight: 680, letterSpacing: 0.65}}>GROSS ABATEMENT ONLY · EXCLUDES 20 kt REMOVALS</div>
    </Card>
  );
};

const Dashboard: React.FC<{phase: number}> = ({phase}) => (
  <div
    style={{
      position: 'relative',
      width: 1640,
      height: 840,
      borderRadius: 30,
      background: C.board,
      border: '1px solid rgba(255,255,255,0.72)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)',
      transformStyle: 'preserve-3d',
    }}
  >
    <Sidebar />
    <Header phase={phase} />
    <ScopeCard x={258} number={1} title="SCOPE 1" subtitle="DIRECT EMISSIONS" value={17} change={-43} color={C.scope1} data={SCOPE_1} phase={phase} />
    <ScopeCard x={560} number={2} title="SCOPE 2" subtitle="PURCHASED ENERGY" value={12} change={-52} color={C.scope2} data={SCOPE_2} phase={phase} />
    <ScopeCard x={862} number={3} title="SCOPE 3" subtitle="VALUE CHAIN" value={28} change={-38} color={C.scope3} data={SCOPE_3} phase={phase} />
    <TargetCard phase={phase} />
    <MainRoadmap phase={phase} />
    <ProgressCard phase={phase} />
    <LeversCard phase={phase} />
  </div>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const phase = (frame / durationInFrames) * Math.PI * 2;
  const cameraX = Math.sin(phase) * 14;
  const cameraY = Math.sin(phase * 2 - 0.35) * 8;
  const cameraScale = 1.002 + Math.sin(phase - 0.5) * 0.013;
  const rotateX = Math.sin(phase + 0.7) * 0.3;
  const rotateY = Math.cos(phase) * 0.42;
  const rotateZ = Math.sin(phase - 0.4) * 0.08;
  const ambientX = 310 + Math.sin(phase) * 85;
  const ambientY = 90 + Math.cos(phase) * 35;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: 'radial-gradient(circle at 72% 18%, #f8fbf9 0%, #edf3f0 48%, #e4ebe8 100%)',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: ambientX,
          top: ambientY,
          width: 900,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(40,174,145,0.11), rgba(40,174,145,0) 68%)',
          filter: 'blur(16px)',
        }}
      />
      <div
        data-safe-object="board"
        style={{
          position: 'absolute',
          left: 140,
          top: 120,
          width: 1640,
          height: 840,
          transformOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transform: `perspective(3200px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${cameraScale})`,
        }}
      >
        <Dashboard phase={phase} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.075,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(35,74,64,0.22) 0.6px, transparent 0.8px)',
          backgroundSize: '7px 7px',
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};
