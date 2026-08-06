import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const P = {
  bg: '#060811',
  bgLift: '#0A0E1A',
  panel: '#0C1220',
  panelLift: '#10192A',
  border: '#202B3E',
  borderSoft: '#182236',
  text: '#F7F9FC',
  muted: '#8997AB',
  dim: '#516077',
  blue: '#62A7FF',
  lime: '#B8F66C',
  gold: '#FFD078',
  violet: '#A993FF',
  rose: '#FF7794',
};

const font =
  'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const reveal = (frame: number, start: number, duration = 56) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const wave = (frame: number, phase = 0, speed = 0.018) =>
  Math.sin(frame * speed + phase);

const longRise = (frame: number, durationInFrames: number) => {
  const t = clamp(frame / Math.max(1, durationInFrames - 1));
  return 0.58 + 0.42 * (0.74 * t + 0.26 * Easing.out(Easing.quad)(t));
};

const formatNumber = (
  value: number,
  decimals = 0,
  prefix = '',
  suffix = '',
) =>
  `${prefix}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;

type Point = {x: number; y: number};

const pointOnPolyline = (points: Point[], progress: number): Point => {
  if (points.length === 0) return {x: 0, y: 0};
  if (points.length === 1) return points[0];
  const lengths = points.slice(1).map((point, index) => {
    const previous = points[index];
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let target = clamp(progress) * total;
  for (let index = 0; index < lengths.length; index++) {
    if (target <= lengths[index]) {
      const local = lengths[index] === 0 ? 0 : target / lengths[index];
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * local,
        y: points[index].y + (points[index + 1].y - points[index].y) * local,
      };
    }
    target -= lengths[index];
  }
  return points[points.length - 1];
};

const Icon: React.FC<{
  name: 'spark' | 'target' | 'forecast' | 'agents' | 'bolt' | 'grid';
  color?: string;
  size?: number;
}> = ({name, color = P.blue, size = 18}) => {
  const paths = {
    spark: 'M10 1.5 12.3 7.7 18.5 10l-6.2 2.3L10 18.5l-2.3-6.2L1.5 10l6.2-2.3Z',
    target: 'M10 2a8 8 0 1 0 8 8M10 5.5A4.5 4.5 0 1 0 14.5 10M10 10l7-7M14 3h3v3',
    forecast: 'M2 16.5h16M3.5 14l3.8-4.1 3 2.2 5.8-7M13.5 5h2.6v2.7',
    agents: 'M6.2 9a3.2 3.2 0 1 0 0 -6.4 3.2 3.2 0 0 0 0 6.4ZM1.5 17.5c0.5 -3.3 2 -5 4.7 -5s4.2 1.7 4.7 5M14 9.5a2.6 2.6 0 1 0 0 -5.2M12.8 12.4c3 -0.3 4.8 1.4 5.2 4.6',
    bolt: 'M11.4 1.8 3.8 11h5.1l-.3 7.2 7.6-9.4h-5.1Z',
    grid: 'M2.5 2.5h6v6h-6zM11.5 2.5h6v6h-6zM2.5 11.5h6v6h-6zM11.5 11.5h6v6h-6z',
  } as const;
  const filled = name === 'spark' || name === 'bolt';
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path
        d={paths[name]}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.55}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  frame?: number;
}> = ({children, color = P.lime, frame = 0}) => {
  const pulse = 0.5 + 0.5 * wave(frame, 0.4, 0.065);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 30,
        padding: '0 11px',
        borderRadius: 999,
        border: `1px solid ${color}36`,
        background: `${color}0E`,
        color,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.15,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 ${6 + pulse * 9}px ${color}A0`,
          opacity: 0.72 + pulse * 0.28,
        }}
      />
      {children}
    </div>
  );
};

const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}> = ({children, style, accent = P.blue}) => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${P.border}`,
      borderRadius: 24,
      background:
        'linear-gradient(145deg, rgba(17,25,42,0.97), rgba(8,13,24,0.99))',
      boxShadow:
        '0 26px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.045)',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 48,
        width: 170,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}D0, transparent)`,
      }}
    />
    {children}
  </div>
);

const PanelHeading: React.FC<{
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}> = ({title, subtitle, right}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 20,
      marginBottom: 22,
    }}
  >
    <div>
      <div
        style={{
          color: P.text,
          fontWeight: 760,
          fontSize: 17,
          letterSpacing: -0.25,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: P.muted,
          fontSize: 10,
          fontWeight: 650,
          letterSpacing: 0.8,
          marginTop: 7,
          textTransform: 'uppercase',
        }}
      >
        {subtitle}
      </div>
    </div>
    {right}
  </div>
);

type Metric = {
  label: string;
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  delta: string;
  accent: string;
  icon: 'spark' | 'target' | 'forecast' | 'agents';
  spark: number[];
};

const MetricCard: React.FC<{
  item: Metric;
  index: number;
  frame: number;
  durationInFrames: number;
}> = ({item, index, frame, durationInFrames}) => {
  const enter = reveal(frame, 38 + index * 11, 62);
  const rise = longRise(frame, durationInFrames);
  const live = 1 + wave(frame, index * 1.13, 0.0095 + index * 0.0005) * 0.0022;
  const current = item.value * rise * live;
  const points = item.spark.map((value, pointIndex) => ({
    x: pointIndex * 24,
    y: 34 - value * (0.95 + wave(frame, index + pointIndex * 0.45, 0.014) * 0.025),
  }));
  const path = points
    .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');
  const tracer = pointOnPolyline(points, (frame * 0.00145 + index * 0.19) % 1);

  return (
    <Panel
      accent={item.accent}
      style={{
        height: 142,
        padding: '20px 21px',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
        <div>
          <div
            style={{
              color: P.muted,
              fontSize: 10,
              letterSpacing: 1.05,
              fontWeight: 760,
              textTransform: 'uppercase',
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              marginTop: 13,
            }}
          >
            <div
              style={{
                color: P.text,
                fontSize: 31,
                lineHeight: 1,
                fontWeight: 750,
                letterSpacing: -1.25,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatNumber(current, item.decimals, item.prefix, item.suffix)}
            </div>
            <div
              style={{
                color: P.lime,
                fontSize: 10,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              ↗ {item.delta}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            borderRadius: 12,
            border: `1px solid ${item.accent}30`,
            background: `${item.accent}0D`,
            transform: `rotate(${wave(frame, index, 0.01) * 2.5}deg)`,
          }}
        >
          <Icon name={item.icon} color={item.accent} size={17} />
        </div>
      </div>
      <svg
        width="100%"
        height="37"
        viewBox="0 0 168 37"
        preserveAspectRatio="none"
        style={{position: 'absolute', left: 20, right: 20, bottom: 10, width: 'calc(100% - 40px)'}}
      >
        <path
          d={`${path} L168 37 L0 37 Z`}
          fill={item.accent}
          opacity="0.055"
        />
        <path
          d={path}
          fill="none"
          stroke={item.accent}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.88 0.12"
          strokeDashoffset={-(frame * 0.0015)}
          opacity="0.8"
        />
        <circle
          cx={tracer.x}
          cy={tracer.y}
          r="2.5"
          fill={P.text}
          stroke={item.accent}
          strokeWidth="1.5"
        />
      </svg>
    </Panel>
  );
};

const revenuePoints: Point[] = [
  {x: 20, y: 220},
  {x: 88, y: 202},
  {x: 160, y: 211},
  {x: 232, y: 169},
  {x: 304, y: 181},
  {x: 376, y: 134},
  {x: 448, y: 148},
  {x: 520, y: 104},
  {x: 592, y: 116},
  {x: 664, y: 79},
  {x: 736, y: 91},
  {x: 808, y: 51},
  {x: 880, y: 62},
];

const revenuePath =
  'M20 220 C48 219 62 198 88 202 C120 208 135 218 160 211 C190 203 204 165 232 169 C260 173 278 188 304 181 C334 173 350 130 376 134 C404 138 420 155 448 148 C478 140 493 101 520 104 C550 107 566 120 592 116 C622 111 637 76 664 79 C694 82 710 96 736 91 C766 86 781 48 808 51 C835 54 853 67 880 62';

const RevenueChart: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  const enter = reveal(frame, 78, 70);
  const t = clamp(frame / (durationInFrames - 1));
  const draw = 0.075 + t * 0.925;
  const tracerProgress = ((frame * 0.0017 + 0.03) % 1) * draw;
  const tracer = pointOnPolyline(revenuePoints, tracerProgress);
  const barValues = [42, 55, 49, 68, 59, 74, 66, 82, 76, 88, 80, 94];
  const barLabels = ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];

  return (
    <Panel
      accent={P.blue}
      style={{
        height: 446,
        padding: '27px 30px 22px',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 22}px)`,
      }}
    >
      <PanelHeading
        title="Revenue trajectory"
        subtitle="Actual + AI weighted forecast"
        right={
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{textAlign: 'right'}}>
              <div style={{color: P.text, fontSize: 19, fontWeight: 760, fontVariantNumeric: 'tabular-nums'}}>
                {formatNumber(18.64 * longRise(frame, durationInFrames), 2, '$', 'M')}
              </div>
              <div style={{color: P.lime, fontSize: 9, fontWeight: 800, marginTop: 4}}>94.2% CONFIDENCE</div>
            </div>
            <Tag frame={frame} color={P.blue}>FORECASTING</Tag>
          </div>
        }
      />
      <div style={{height: 292, position: 'relative'}}>
        <svg width="100%" height="100%" viewBox="0 0 900 292" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revenue-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={P.violet} />
              <stop offset="0.52" stopColor={P.blue} />
              <stop offset="1" stopColor={P.lime} />
            </linearGradient>
            <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={P.blue} stopOpacity="0.24" />
              <stop offset="1" stopColor={P.blue} stopOpacity="0" />
            </linearGradient>
            <clipPath id="revenue-reveal">
              <rect x="0" y="0" width={900 * draw} height="292" />
            </clipPath>
          </defs>
          {[38, 93, 148, 203, 258].map((y, index) => (
            <g key={y}>
              <line x1="0" y1={y} x2="900" y2={y} stroke={P.border} strokeWidth="1" opacity="0.7" />
              <text x="0" y={y - 7} fill={P.dim} fontSize="8" fontFamily={font} fontWeight="700">
                ${(20 - index * 4).toFixed(0)}M
              </text>
            </g>
          ))}
          {barValues.map((value, index) => {
            const x = 24 + index * 72;
            const liveHeight = value * 1.65 * (0.74 + draw * 0.26) * (1 + wave(frame, index * 0.76, 0.015) * 0.032);
            const active = index / barValues.length < draw + 0.05;
            return (
              <g key={barLabels[index]} opacity={active ? 1 : 0.2}>
                <rect x={x} y={270 - liveHeight} width="22" height={liveHeight} rx="5" fill={P.blue} opacity="0.1" />
                <rect x={x + 5} y={270 - liveHeight * 0.74} width="12" height={liveHeight * 0.74} rx="4" fill={index > 8 ? P.lime : P.blue} opacity="0.28" />
                <text x={x + 11} y="290" textAnchor="middle" fill={P.dim} fontSize="8" fontFamily={font} fontWeight="750">
                  {barLabels[index]}
                </text>
              </g>
            );
          })}
          <g clipPath="url(#revenue-reveal)">
            <path
              d={`${revenuePath} L880 272 L20 272 Z`}
              fill="url(#revenue-area)"
              opacity="0.62"
            />
            <path
              d={revenuePath}
              fill="none"
              stroke="url(#revenue-stroke)"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - draw}
            />
            <path
              d={revenuePath}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2.2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.024 0.976"
              strokeDashoffset={-(frame * 0.00175)}
              opacity="0.75"
            />
          </g>
          <circle cx={tracer.x} cy={tracer.y} r="11" fill={P.blue} opacity="0.09" />
          <circle cx={tracer.x} cy={tracer.y} r="4.5" fill={P.text} stroke={P.blue} strokeWidth="2.5" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: `${(tracer.x / 900) * 100}%`,
            top: `${(tracer.y / 292) * 100}%`,
            transform: 'translate(-50%, -145%)',
            padding: '6px 8px',
            borderRadius: 7,
            border: `1px solid ${P.blue}35`,
            background: 'rgba(7,12,22,0.92)',
            color: P.text,
            fontSize: 8,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
          }}
        >
          +{(17 + tracerProgress * 12).toFixed(1)}% MOMENTUM
        </div>
      </div>
    </Panel>
  );
};

const PipelineFlow: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  const enter = reveal(frame, 96, 72);
  const stages = [
    {label: 'Qualified', value: 128, amount: 4.82, width: 94, color: P.blue},
    {label: 'Discovery', value: 86, amount: 3.64, width: 76, color: P.violet},
    {label: 'Proposal', value: 52, amount: 2.47, width: 61, color: P.gold},
    {label: 'Negotiation', value: 31, amount: 1.92, width: 47, color: P.lime},
  ];
  return (
    <Panel
      accent={P.lime}
      style={{
        height: 446,
        padding: '27px 27px 23px',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      <PanelHeading
        title="Live opportunity flow"
        subtitle="AI prioritized pipeline"
        right={<Tag frame={frame} color={P.lime}>AUTO-RANKED</Tag>}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingBottom: 18,
          borderBottom: `1px solid ${P.borderSoft}`,
        }}
      >
        <div>
          <div style={{color: P.muted, fontSize: 9, fontWeight: 760, letterSpacing: 0.9}}>PIPELINE VELOCITY</div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 7}}>
            <div style={{color: P.text, fontSize: 29, fontWeight: 760, letterSpacing: -1}}>
              {(3.62 * longRise(frame, durationInFrames)).toFixed(2)}×
            </div>
            <div style={{color: P.lime, fontSize: 10, fontWeight: 800}}>+18.7%</div>
          </div>
        </div>
        <div style={{color: P.dim, fontSize: 9, lineHeight: 1.65, textAlign: 'right'}}>
          297 ACTIVE DEALS<br />12 MOVED TODAY
        </div>
      </div>
      <div style={{display: 'grid', gap: 17, marginTop: 22}}>
        {stages.map((stage, index) => {
          const local = reveal(frame, 125 + index * 16, 80);
          const breathe = 1 + wave(frame, index * 1.32, 0.014) * 0.018;
          const railWidth = clamp(stage.width * local * breathe, 0, 100);
          const dotPosition = ((frame * (0.00085 + index * 0.00005) + index * 0.17) % 1) * railWidth;
          return (
            <div key={stage.label} style={{opacity: 0.25 + local * 0.75}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
                  <span style={{width: 7, height: 7, borderRadius: 2, background: stage.color, boxShadow: `0 0 9px ${stage.color}70`}} />
                  <span style={{color: P.muted, fontSize: 10, fontWeight: 700}}>{stage.label}</span>
                  <span style={{color: P.dim, fontSize: 9}}>{stage.value}</span>
                </div>
                <span style={{color: P.text, fontSize: 11, fontWeight: 760, fontVariantNumeric: 'tabular-nums'}}>
                  ${(stage.amount * longRise(frame, durationInFrames)).toFixed(2)}M
                </span>
              </div>
              <div style={{height: 9, borderRadius: 999, background: P.borderSoft, position: 'relative', overflow: 'hidden'}}>
                <div
                  style={{
                    width: `${railWidth}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${stage.color}50, ${stage.color})`,
                    boxShadow: `0 0 16px ${stage.color}22`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 1,
                    left: `${dotPosition}%`,
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: P.text,
                    boxShadow: `0 0 11px ${stage.color}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 27,
          right: 27,
          bottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: P.dim,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.5,
        }}
      >
        <span>MODEL REFRESH • {String(Math.floor(frame / 60) + 1).padStart(2, '0')}S</span>
        <span style={{color: P.blue}}>NEXT BEST ACTION ACTIVE</span>
      </div>
    </Panel>
  );
};

type DonutSegment = {label: string; value: number; color: string};

const Donut: React.FC<{
  segments: DonutSegment[];
  frame: number;
  progress: number;
}> = ({segments, frame, progress}) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div style={{position: 'relative', width: 184, height: 184}}>
      <svg
        width="184"
        height="184"
        viewBox="0 0 160 160"
        style={{
          transform: `rotate(${-90 + frame * 0.032 + wave(frame, 0.6, 0.009) * 1.2}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        <circle cx="80" cy="80" r={radius} fill="none" stroke={P.borderSoft} strokeWidth="13" />
        {segments.map((segment, index) => {
          const breathing = 1 + wave(frame, index * 1.6, 0.012) * 0.012;
          const dash = circumference * (segment.value / 100) * progress * breathing - 5;
          const element = (
            <circle
              key={segment.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, dash)} ${circumference}`}
              strokeDashoffset={-(offset / 100) * circumference}
            />
          );
          offset += segment.value;
          return element;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeContent: 'center',
          textAlign: 'center',
          transform: `scale(${1 + wave(frame, 0.4, 0.012) * 0.008})`,
        }}
      >
        <div style={{color: P.text, fontSize: 28, fontWeight: 770, letterSpacing: -1.1}}>34.8%</div>
        <div style={{color: P.muted, fontSize: 9, fontWeight: 750, marginTop: 4}}>WIN RATE</div>
      </div>
    </div>
  );
};

const TerritoryMix: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  const enter = reveal(frame, 154, 70);
  const segments: DonutSegment[] = [
    {label: 'North America', value: 43, color: P.blue},
    {label: 'Europe', value: 29, color: P.violet},
    {label: 'APAC', value: 18, color: P.lime},
    {label: 'LATAM', value: 10, color: P.gold},
  ];
  const progress = 0.48 + 0.52 * clamp(frame / (durationInFrames - 1));
  return (
    <Panel
      accent={P.violet}
      style={{
        height: 384,
        padding: '25px 27px',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 22}px)`,
      }}
    >
      <PanelHeading title="Territory mix" subtitle="Weighted pipeline share" />
      <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 4}}>
        <Donut segments={segments} frame={frame} progress={progress} />
        <div style={{display: 'grid', gap: 13, flex: 1}}>
          {segments.map((segment, index) => (
            <div key={segment.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 9}}>
                <span style={{width: 7, height: 7, borderRadius: 2, background: segment.color, boxShadow: `0 0 8px ${segment.color}50`}} />
                <span style={{color: P.muted, fontSize: 10}}>{segment.label}</span>
              </div>
              <span style={{color: P.text, fontSize: 11, fontWeight: 760, fontVariantNumeric: 'tabular-nums'}}>
                {(segment.value * longRise(frame, durationInFrames)).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          marginTop: 19,
          paddingTop: 15,
          borderTop: `1px solid ${P.borderSoft}`,
          display: 'flex',
          justifyContent: 'space-between',
          color: P.dim,
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        <span>STRONGEST MOMENTUM</span>
        <span style={{color: P.lime}}>APAC +27.4%</span>
      </div>
    </Panel>
  );
};

const ForecastEngine: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  const enter = reveal(frame, 168, 74);
  const rows = [
    {label: 'Commit', value: 86, amount: '$12.8M', color: P.lime},
    {label: 'Best case', value: 72, amount: '$15.6M', color: P.blue},
    {label: 'Upside', value: 58, amount: '$18.6M', color: P.violet},
    {label: 'Coverage', value: 93, amount: '3.4×', color: P.gold},
  ];
  return (
    <Panel
      accent={P.gold}
      style={{
        height: 384,
        padding: '25px 27px',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      <PanelHeading
        title="Forecast engine"
        subtitle="Continuously calibrated confidence"
        right={<Icon name="forecast" color={P.gold} size={20} />}
      />
      <div style={{display: 'grid', gap: 19, marginTop: 5}}>
        {rows.map((row, index) => {
          const local = reveal(frame, 184 + index * 14, 82);
          const breathing = 1 + wave(frame, index * 1.22, 0.0125) * 0.018;
          const width = clamp(row.value * local * breathing, 0, 100);
          const scan = ((frame * 0.0012 + index * 0.2) % 1) * width;
          return (
            <div key={row.label}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                <span style={{color: P.muted, fontSize: 10, fontWeight: 680}}>{row.label}</span>
                <span style={{color: P.text, fontSize: 11, fontWeight: 760, fontVariantNumeric: 'tabular-nums'}}>
                  {row.amount}
                </span>
              </div>
              <div style={{height: 10, borderRadius: 999, background: P.borderSoft, overflow: 'hidden', position: 'relative'}}>
                <div
                  style={{
                    width: `${width}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${row.color}48, ${row.color})`,
                    borderRadius: 999,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${scan}%`,
                    top: 1,
                    width: 3,
                    height: 8,
                    borderRadius: 999,
                    background: P.text,
                    boxShadow: `0 0 9px ${row.color}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 27,
          right: 27,
          bottom: 21,
          height: 42,
          borderRadius: 12,
          border: `1px solid ${P.lime}22`,
          background: `${P.lime}08`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 13px',
        }}
      >
        <span style={{color: P.muted, fontSize: 9, fontWeight: 720}}>MODEL ACCURACY</span>
        <strong style={{color: P.lime, fontSize: 13, fontVariantNumeric: 'tabular-nums'}}>
          {(94.2 * longRise(frame, durationInFrames)).toFixed(1)}%
        </strong>
      </div>
    </Panel>
  );
};

const AutomatedPlays: React.FC<{frame: number}> = ({frame}) => {
  const enter = reveal(frame, 182, 74);
  const plays = [
    {name: 'High-intent enterprise', action: 'Route to AE', color: P.lime, score: 96},
    {name: 'Expansion signal', action: 'Launch sequence', color: P.blue, score: 89},
    {name: 'Stalled proposal', action: 'Add executive', color: P.gold, score: 82},
    {name: 'Renewal risk', action: 'Create recovery', color: P.rose, score: 76},
  ];
  const sweep = ((frame * 0.0011) % 1) * 100;
  return (
    <Panel
      accent={P.lime}
      style={{
        height: 384,
        padding: '25px 27px',
        opacity: enter,
        transform: `translateY(${(1 - enter) * 26}px)`,
      }}
    >
      <PanelHeading
        title="AI sales plays"
        subtitle="Next best actions in motion"
        right={<Tag frame={frame} color={P.lime}>12 ACTIVE</Tag>}
      />
      <div style={{display: 'grid', gap: 11, position: 'relative'}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${sweep}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${P.lime}80, transparent)`,
            boxShadow: `0 0 12px ${P.lime}35`,
            zIndex: 2,
          }}
        />
        {plays.map((play, index) => {
          const local = reveal(frame, 206 + index * 17, 64);
          return (
            <div
              key={play.name}
              style={{
                height: 50,
                display: 'grid',
                gridTemplateColumns: '30px 1fr 102px 34px',
                alignItems: 'center',
                gap: 10,
                padding: '0 11px',
                borderRadius: 13,
                border: `1px solid ${P.borderSoft}`,
                background: 'rgba(255,255,255,0.018)',
                transform: `translateX(${(1 - local) * 18 + wave(frame, index, 0.011) * 1.2}px)`,
                opacity: 0.2 + local * 0.8,
              }}
            >
              <span
                style={{
                  width: 25,
                  height: 25,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 9,
                  background: `${play.color}12`,
                  border: `1px solid ${play.color}26`,
                }}
              >
                <Icon name="bolt" color={play.color} size={12} />
              </span>
              <span style={{color: P.text, fontSize: 10, fontWeight: 700}}>{play.name}</span>
              <span style={{color: P.muted, fontSize: 9}}>{play.action}</span>
              <strong style={{color: play.color, fontSize: 10, textAlign: 'right'}}>{play.score}</strong>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 27,
          right: 27,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: P.dim,
          fontSize: 9,
          fontWeight: 700,
        }}
      >
        <span>LAST DECISION • {Math.max(1, 7 - Math.floor((frame % 420) / 70))}S AGO</span>
        <span style={{color: P.blue}}>98.6% SLA</span>
      </div>
    </Panel>
  );
};

const Background: React.FC<{frame: number}> = ({frame}) => {
  const scanY = -240 + ((frame * 0.72) % 1500);
  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 16% 12%, rgba(98,167,255,0.12), transparent 33%), radial-gradient(circle at 87% 65%, rgba(169,147,255,0.085), transparent 34%), linear-gradient(180deg, #070A13 0%, #05070D 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage:
            `linear-gradient(${P.border} 1px, transparent 1px), linear-gradient(90deg, ${P.border} 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(90deg, transparent, black 20%, black 80%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: scanY,
          height: 180,
          background: `linear-gradient(180deg, transparent, ${P.blue}08, transparent)`,
          transform: 'skewY(-3deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: 999,
          left: -160 + wave(frame, 0, 0.004) * 28,
          top: 620 + wave(frame, 1.2, 0.0045) * 20,
          background: 'rgba(184,246,108,0.035)',
          filter: 'blur(90px)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const entrance = reveal(frame, 0, 76);
  const t = clamp(frame / (durationInFrames - 1));
  const cameraY = 34 - 186 * t + wave(frame, 0.35, 0.0075) * 3.4;
  const metrics: Metric[] = [
    {
      label: 'Pipeline created',
      value: 8.42,
      decimals: 2,
      prefix: '$',
      suffix: 'M',
      delta: '24.8%',
      accent: P.blue,
      icon: 'spark',
      spark: [26, 23, 19, 21, 14, 17, 9, 12],
    },
    {
      label: 'Win rate',
      value: 34.8,
      decimals: 1,
      suffix: '%',
      delta: '6.2%',
      accent: P.lime,
      icon: 'target',
      spark: [27, 25, 26, 20, 18, 16, 13, 8],
    },
    {
      label: 'ARR forecast',
      value: 18.64,
      decimals: 2,
      prefix: '$',
      suffix: 'M',
      delta: '18.1%',
      accent: P.gold,
      icon: 'forecast',
      spark: [30, 27, 29, 22, 21, 15, 12, 10],
    },
    {
      label: 'AI-sourced revenue',
      value: 62.4,
      decimals: 1,
      suffix: '%',
      delta: '31.6%',
      accent: P.violet,
      icon: 'agents',
      spark: [31, 29, 26, 28, 20, 18, 13, 6],
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: P.bg,
        color: P.text,
        fontFamily: font,
        overflow: 'hidden',
      }}
    >
      <Background frame={frame} />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 30,
          width: 1712,
          transform: `translateX(-50%) translateY(${cameraY}px) scale(${0.985 + entrance * 0.015})`,
          opacity: entrance,
          transformOrigin: '50% 0%',
        }}
      >
        <div
          style={{
            height: 82,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            padding: '0 6px',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div
              style={{
                width: 48,
                height: 48,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 16,
                background: `linear-gradient(145deg, ${P.blue}22, ${P.violet}12)`,
                border: `1px solid ${P.blue}38`,
                boxShadow: `0 14px 36px ${P.blue}12`,
                transform: `rotate(${wave(frame, 0.5, 0.008) * 2}deg)`,
              }}
            >
              <Icon name="spark" color={P.lime} size={21} />
            </div>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <span style={{fontSize: 24, fontWeight: 770, letterSpacing: -0.8}}>Revenue Autopilot</span>
                <span style={{color: P.dim, fontSize: 10, fontWeight: 800, letterSpacing: 1.2}}>CONTROL ROOM</span>
              </div>
              <div style={{color: P.muted, fontSize: 11, marginTop: 7, letterSpacing: 0.15}}>
                AI Sales Operations • Global Revenue Workspace
              </div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                height: 38,
                padding: '0 15px',
                borderRadius: 12,
                border: `1px solid ${P.border}`,
                background: 'rgba(12,18,32,0.72)',
                color: P.muted,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              <span>GLOBAL</span>
              <span style={{width: 1, height: 13, background: P.border}} />
              <span>Q3 OPERATING VIEW</span>
            </div>
            <Tag frame={frame} color={P.lime}>LIVE SIGNALS</Tag>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16}}>
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              item={metric}
              index={index}
              frame={frame}
              durationInFrames={durationInFrames}
            />
          ))}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1116px 580px', gap: 16, marginTop: 16}}>
          <RevenueChart frame={frame} durationInFrames={durationInFrames} />
          <PipelineFlow frame={frame} durationInFrames={durationInFrames} />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '500px 558px 622px', gap: 16, marginTop: 16}}>
          <TerritoryMix frame={frame} durationInFrames={durationInFrames} />
          <ForecastEngine frame={frame} durationInFrames={durationInFrames} />
          <AutomatedPlays frame={frame} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 70,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent, rgba(5,7,13,0.74))',
        }}
      />
    </AbsoluteFill>
  );
};
