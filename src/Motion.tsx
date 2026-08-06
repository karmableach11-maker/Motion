import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#05090E',
  panel: '#0A121B',
  panel2: '#0C1722',
  border: '#1A2A36',
  borderBright: '#253947',
  text: '#EAF8F5',
  muted: '#718492',
  dim: '#40515E',
  emerald: '#58F0B3',
  cyan: '#61C8FF',
  amber: '#FFB85D',
  coral: '#FF6B79',
  violet: '#9A87FF',
};

const font =
  'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const liveWave = (frame: number, phase = 0, speed = 0.018) =>
  Math.sin(frame * speed + phase);

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const formatValue = (
  value: number,
  progress: number,
  decimals = 0,
  prefix = '',
  suffix = '',
) => {
  const current = value * progress;
  const text = current.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${text}${suffix}`;
};

const TinyTrend: React.FC<{positive?: boolean; text: string}> = ({
  positive = true,
  text,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      color: positive ? C.emerald : C.coral,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.2,
    }}
  >
    <svg width="10" height="10" viewBox="0 0 10 10">
      <path
        d={positive ? 'M1 7.5 7.5 1M3 1h4.5v4.5' : 'M1 2.5 7.5 9M3 9h4.5V4.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {text}
  </div>
);

const LiveBadge: React.FC<{frame: number}> = ({frame}) => {
  const pulse = 0.52 + 0.48 * Math.sin(frame * 0.085) ** 2;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 999,
        background: 'rgba(88,240,179,0.07)',
        border: '1px solid rgba(88,240,179,0.18)',
        color: C.emerald,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.2,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: C.emerald,
          boxShadow: `0 0 ${5 + pulse * 9}px rgba(88,240,179,${0.32 + pulse * 0.45})`,
          opacity: 0.74 + pulse * 0.26,
        }}
      />
      LIVE DATA
    </div>
  );
};

const Card: React.FC<{
  title: string;
  eyebrow?: string;
  trend?: string;
  trendPositive?: boolean;
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  title,
  eyebrow,
  trend,
  trendPositive = true,
  accent = C.emerald,
  children,
  style,
}) => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 18,
      padding: '20px 20px 18px',
      background:
        'linear-gradient(145deg, rgba(15,27,39,0.97), rgba(8,16,24,0.98))',
      border: `1px solid ${C.border}`,
      boxShadow:
        '0 18px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.035)',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 24,
        right: 24,
        top: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}AA, transparent)`,
        opacity: 0.7,
      }}
    />
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
      }}
    >
      <div>
        <div
          style={{
            color: C.text,
            fontSize: 14,
            lineHeight: 1.2,
            fontWeight: 760,
            letterSpacing: -0.12,
          }}
        >
          {title}
        </div>
        {eyebrow ? (
          <div
            style={{
              marginTop: 5,
              color: C.muted,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.55,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
        ) : null}
      </div>
      {trend ? <TinyTrend positive={trendPositive} text={trend} /> : null}
    </div>
    {children}
  </div>
);

type MetricProps = {
  label: string;
  value: number;
  progress: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  trend: string;
  trendPositive?: boolean;
  accent?: string;
  frame: number;
  phase: number;
};

const MetricTile: React.FC<MetricProps> = ({
  label,
  value,
  progress,
  decimals = 0,
  prefix = '',
  suffix = '',
  trend,
  trendPositive = true,
  accent = C.emerald,
  frame,
  phase,
}) => (
  <div
    style={{
      height: 104,
      borderRadius: 15,
      padding: '15px 16px',
      background:
        'linear-gradient(145deg, rgba(16,29,41,0.98), rgba(9,17,26,0.98))',
      border: `1px solid ${C.border}`,
      boxShadow:
        '0 14px 34px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.035)',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 15,
        bottom: 15,
        width: 2,
        background: accent,
        boxShadow: `0 0 12px ${accent}80`,
      }}
    />
    <div
      style={{
        color: C.muted,
        fontSize: 9,
        fontWeight: 760,
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 11,
        gap: 8,
      }}
    >
      <div
        style={{
          color: C.text,
          fontSize: 24,
          fontWeight: 760,
          letterSpacing: -0.8,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {formatValue(
          value,
          progress * (1 + liveWave(frame, phase, 0.012) * 0.0035),
          decimals,
          prefix,
          suffix,
        )}
      </div>
      <TinyTrend positive={trendPositive} text={trend} />
    </div>
  </div>
);

const BarChart: React.FC<{
  values: number[];
  progress: number;
  frame: number;
  colors?: string[];
  labels?: string[];
}> = ({values, progress, frame, colors, labels}) => (
  <div
    style={{
      height: 160,
      position: 'relative',
      padding: '14px 4px 22px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${C.border}`,
      backgroundImage: `linear-gradient(${C.border}55 1px, transparent 1px)`,
      backgroundSize: '100% 38px',
    }}
  >
    {values.map((value, i) => {
      const local = clamp01((progress - i * 0.045) / (1 - i * 0.045));
      const col = colors?.[i] ?? (i > values.length - 3 ? C.emerald : C.cyan);
      const liveHeight = Math.min(
        98,
        value * local * (1 + liveWave(frame, i * 0.82, 0.016) * 0.026),
      );
      return (
        <div
          key={`${value}-${i}`}
          style={{
            flex: 1,
            maxWidth: 28,
            height: `${liveHeight}%`,
            minHeight: 2,
            position: 'relative',
            borderRadius: '5px 5px 2px 2px',
            background: `linear-gradient(180deg, ${col}, ${col}88)`,
            boxShadow: local > 0.7 ? `0 0 14px ${col}20` : 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background:
                'linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.18) 48%, transparent 92%)',
              transform: `translateY(${liveWave(frame, i * 0.7, 0.024) * 45}%)`,
              opacity: 0.22 + local * 0.2,
            }}
          />
          {labels ? (
            <span
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                color: C.dim,
                fontSize: 8,
                fontWeight: 700,
              }}
            >
              {labels[i]}
            </span>
          ) : null}
        </div>
      );
    })}
  </div>
);

const LineChart: React.FC<{
  progress: number;
  frame: number;
  id: string;
}> = ({progress, frame, id}) => {
  const length = 560;
  const path =
    'M0 128 C20 120 30 95 49 102 C67 108 73 76 94 80 C116 84 119 58 139 66 C162 75 168 42 190 48 C209 55 219 32 239 39 C260 45 269 19 300 24';
  const tracer = -((frame * 0.0022) % 1);
  return (
    <svg width="100%" height="168" viewBox="0 0 300 168" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cyan} stopOpacity="0.22" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.violet} />
          <stop offset="0.52" stopColor={C.cyan} />
          <stop offset="1" stopColor={C.emerald} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width={300 * progress} height="168" />
        </clipPath>
      </defs>
      {[36, 74, 112, 150].map((y) => (
        <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={C.border} strokeWidth="1" opacity="0.65" />
      ))}
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d="M0 128 C20 120 30 95 49 102 C67 108 73 76 94 80 C116 84 119 58 139 66 C162 75 168 42 190 48 C209 55 219 32 239 39 C260 45 269 19 300 24 L300 168 L0 168 Z"
          fill={`url(#${id}-area)`}
        />
        <path
          d={path}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - progress)}
        />
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.86)"
          strokeWidth="2.1"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.035 0.965"
          strokeDashoffset={tracer}
          opacity={0.3 + 0.24 * (liveWave(frame, 0.8, 0.022) + 1)}
        />
      </g>
      {progress > 0.98 ? (
        <circle cx="300" cy="24" r="4" fill={C.emerald} stroke={C.panel} strokeWidth="2" />
      ) : null}
    </svg>
  );
};

type DonutSegment = {value: number; color: string};

const Donut: React.FC<{
  segments: DonutSegment[];
  progress: number;
  frame: number;
  phase?: number;
  center: string;
  sub?: string;
}> = ({segments, progress, frame, phase = 0, center, sub}) => {
  const r = 48;
  const circumference = Math.PI * 2 * r;
  const rotation = frame * 0.014 + liveWave(frame, phase, 0.01) * 1.4;
  let offset = 0;
  return (
    <div style={{position: 'relative', width: 142, height: 142}}>
      <svg
        width="142"
        height="142"
        viewBox="0 0 120 120"
        style={{transform: `rotate(${rotation}deg)`, transformOrigin: '50% 50%'}}
      >
        <circle cx="60" cy="60" r={r} fill="none" stroke={C.border} strokeWidth="10" />
        {segments.map((segment, i) => {
          const value = Math.max(
            0,
            segment.value * progress *
              (1 + liveWave(frame, phase + i * 1.7, 0.014) * 0.009) -
              1.3,
          );
          const dash = (value / 100) * circumference;
          const node = (
            <circle
              key={`${segment.color}-${i}`}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={segment.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-(offset / 100) * circumference}
              transform="rotate(-90 60 60)"
            />
          );
          offset += segment.value;
          return node;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          transform: `scale(${1 + liveWave(frame, phase + 0.5, 0.016) * 0.008})`,
        }}
      >
        <div style={{color: C.text, fontSize: 24, fontWeight: 780, letterSpacing: -0.7}}>{center}</div>
        {sub ? <div style={{color: C.muted, fontSize: 9, marginTop: 2}}>{sub}</div> : null}
      </div>
    </div>
  );
};

const Legend: React.FC<{items: Array<{name: string; color: string; value: string}>}> = ({items}) => (
  <div style={{display: 'grid', gap: 9, flex: 1}}>
    {items.map((item) => (
      <div key={item.name} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 10}}>
          <span style={{width: 7, height: 7, borderRadius: 2, background: item.color, boxShadow: `0 0 8px ${item.color}30`}} />
          {item.name}
        </div>
        <span style={{color: C.text, fontSize: 10, fontWeight: 750}}>{item.value}</span>
      </div>
    ))}
  </div>
);

const ProgressList: React.FC<{
  items: Array<{name: string; value: number; note: string; color?: string}>;
  progress: number;
  frame: number;
}> = ({items, progress, frame}) => (
  <div style={{display: 'grid', gap: 12}}>
    {items.map((item, i) => {
      const local = clamp01((progress - i * 0.065) / (1 - i * 0.065));
      const color = item.color ?? (i < 2 ? C.cyan : C.violet);
      const liveWidth = Math.min(
        100,
        item.value * local * (1 + liveWave(frame, i * 0.9, 0.015) * 0.018),
      );
      return (
        <div key={item.name}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
            <span style={{color: C.muted, fontSize: 10, fontWeight: 650}}>{item.name}</span>
            <span style={{color: C.text, fontSize: 9, fontWeight: 720, fontVariantNumeric: 'tabular-nums'}}>{item.note}</span>
          </div>
          <div style={{height: 7, background: C.border, borderRadius: 99, overflow: 'hidden'}}>
            <div
              style={{
                width: `${liveWidth}%`,
                height: '100%',
                borderRadius: 99,
                background: `linear-gradient(90deg, ${color}88, ${color})`,
                boxShadow: `0 0 12px ${color}20`,
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

const ChannelStack: React.FC<{progress: number; frame: number}> = ({
  progress,
  frame,
}) => {
  const items = [
    {name: 'Enterprise', value: 842, color: C.emerald},
    {name: 'Product-led', value: 516, color: C.cyan},
    {name: 'Partners', value: 328, color: C.violet},
    {name: 'Expansion', value: 214, color: C.amber},
  ];
  return (
    <div style={{display: 'grid', gap: 9, paddingTop: 2}}>
      {items.map((item, i) => {
        const local = clamp01((progress - i * 0.07) / (1 - i * 0.07));
        return (
          <div
            key={item.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 34,
              padding: '0 11px',
              borderRadius: 9,
              color: C.text,
              fontSize: 10,
              background: `linear-gradient(90deg, ${item.color}22, rgba(255,255,255,0.02))`,
              border: `1px solid ${item.color}28`,
              transform: `translateX(${(1 - local) * 14 + liveWave(frame, i * 0.8, 0.014) * 1.8}px)`,
              opacity: 0.15 + local * 0.85,
            }}
          >
            <span style={{color: C.muted}}>{item.name}</span>
            <strong style={{fontSize: 13, fontVariantNumeric: 'tabular-nums'}}>
              {formatValue(item.value, local, 0, '$', 'K')}
            </strong>
          </div>
        );
      })}
    </div>
  );
};

const ScheduleCard: React.FC<{progress: number; frame: number}> = ({
  progress,
  frame,
}) => {
  const rows = [
    ['Intent scoring model', 91, '2 hrs', C.emerald],
    ['Expansion sequence', 78, 'Today', C.cyan],
    ['Renewal risk review', 66, '1 day', C.violet],
    ['Pricing experiment', 54, '3 days', C.amber],
    ['Board forecast pack', 82, '5 days', C.emerald],
  ] as const;
  return (
    <div style={{display: 'grid', gap: 11}}>
      {rows.map(([name, value, time, color], i) => {
        const local = clamp01((progress - i * 0.055) / (1 - i * 0.055));
        const liveWidth = Math.min(
          100,
          value * local * (1 + liveWave(frame, i * 0.72, 0.013) * 0.017),
        );
        return (
          <div key={name} style={{display: 'grid', gridTemplateColumns: '142px 1fr 42px', alignItems: 'center', gap: 12}}>
            <span style={{color: C.muted, fontSize: 10, whiteSpace: 'nowrap'}}>{name}</span>
            <div style={{height: 7, background: C.border, borderRadius: 99, overflow: 'hidden'}}>
              <div
                style={{
                  width: `${liveWidth}%`,
                  height: '100%',
                  borderRadius: 99,
                  background: `linear-gradient(90deg, ${color}77, ${color})`,
                }}
              />
            </div>
            <span style={{color: C.dim, fontSize: 9, textAlign: 'right'}}>{time}</span>
          </div>
        );
      })}
    </div>
  );
};

const DashboardPlane: React.FC<{
  frame: number;
  durationInFrames: number;
}> = ({frame, durationInFrames}) => {
  const reveal = interpolate(frame, [34, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const finalFrame = durationInFrames - 1;
  const travel = interpolate(frame, [80, finalFrame], [0, -908], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const data = (index = 0) => {
    const start = 38 + index * 10;
    const handoff = 184 + index * 11;
    const primary = interpolate(frame, [start, handoff], [0, 0.82], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
    const livingTail = interpolate(frame, [handoff, finalFrame], [0, 0.18], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sin),
    });
    return clamp01(primary + livingTail);
  };
  const metrics = [
    {label: 'Annual recurring revenue', value: 8.42, decimals: 2, prefix: '$', suffix: 'M', trend: '24.8%', accent: C.emerald},
    {label: 'Net revenue retention', value: 118.6, decimals: 1, suffix: '%', trend: '6.2%', accent: C.cyan},
    {label: 'Qualified pipeline', value: 2.18, decimals: 2, prefix: '$', suffix: 'M', trend: '18.4%', accent: C.violet},
    {label: 'Blended acquisition cost', value: 218, prefix: '$', trend: '12.1%', trendPositive: true, accent: C.amber},
    {label: 'Active accounts', value: 3842, trend: '16.9%', accent: C.cyan},
    {label: 'Forecast uplift', value: 27.4, decimals: 1, prefix: '+', suffix: '%', trend: '9.8%', accent: C.emerald},
  ];

  return (
    <div
      style={{
        position: 'absolute',
        width: 1344,
        height: 1858,
        left: '50%',
        top: 16,
        transform: `translate3d(-50%, ${travel}px, 0)`,
        opacity: reveal,
        fontFamily: font,
      }}
    >
      <div style={{height: 76, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 16}}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              border: `1px solid ${C.borderBright}`,
              background: 'linear-gradient(145deg, rgba(88,240,179,0.16), rgba(97,200,255,0.06))',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <svg width="19" height="19" viewBox="0 0 20 20">
              <path d="M3 14.8 8.2 9.6l3 3L17 6.8" fill="none" stroke={C.emerald} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.2 6.8H17v4.8" fill="none" stroke={C.cyan} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{color: C.text, fontSize: 22, fontWeight: 780, letterSpacing: -0.55, lineHeight: 1}}>AI Revenue Command Center</div>
            <div style={{marginTop: 9, color: C.muted, fontSize: 10.5, letterSpacing: 0.36}}>Realtime growth, customer health &amp; automation performance</div>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{textAlign: 'right'}}>
            <div style={{color: C.text, fontSize: 11, fontWeight: 760}}>Q3 PERFORMANCE</div>
            <div style={{color: C.dim, fontSize: 9, marginTop: 5}}>Updated 08:42 UTC</div>
          </div>
          <LiveBadge frame={frame} />
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12}}>
        {metrics.map((metric, i) => (
          <MetricTile
            key={metric.label}
            {...metric}
            progress={data(i % 3)}
            frame={frame}
            phase={i * 0.82}
          />
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '310px', gap: 16, marginTop: 16}}>
        <Card title="Revenue Momentum" eyebrow="Trailing 6 months" trend="+24.8%" accent={C.emerald}>
          <BarChart
            values={[46, 58, 54, 69, 76, 88]}
            labels={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']}
            progress={data(1)}
            frame={frame}
            colors={[C.violet, C.violet, C.cyan, C.cyan, C.emerald, C.emerald]}
          />
        </Card>

        <Card title="Customer Acquisition" eyebrow="Qualified accounts" trend="+18.4%" accent={C.cyan}>
          <BarChart
            values={[82, 76, 88, 67, 59, 71]}
            labels={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']}
            progress={data(2)}
            frame={frame}
            colors={[C.cyan, C.cyan, C.violet, C.cyan, C.emerald, C.emerald]}
          />
        </Card>

        <Card title="Revenue Channels" eyebrow="Pipeline contribution" trend="+11.2%" accent={C.violet}>
          <ChannelStack progress={data(3)} frame={frame} />
        </Card>

        <Card title="Conversion Signal" eyebrow="Weekly intent index" trend="+8.6%" accent={C.cyan}>
          <LineChart progress={data(4)} frame={frame} id="conversion-signal" />
        </Card>

        <Card title="Account Health" eyebrow="Portfolio coverage" accent={C.emerald}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 3}}>
            <Donut segments={[{value: 82, color: C.emerald}, {value: 18, color: C.borderBright}]} progress={data(4)} frame={frame} phase={0.2} center={formatValue(82, data(4), 0, '', '%')} sub="HEALTHY" />
            <Legend items={[{name: 'Healthy', color: C.emerald, value: '82%'}, {name: 'Watch', color: C.amber, value: '12%'}, {name: 'At risk', color: C.coral, value: '6%'}]} />
          </div>
        </Card>

        <Card title="Top Expansion Accounts" eyebrow="AI opportunity score" trend="+14.1%" accent={C.violet}>
          <ProgressList
            progress={data(5)}
            frame={frame}
            items={[
              {name: 'Northstar Labs', value: 91, note: '$184K'},
              {name: 'Helio Systems', value: 83, note: '$142K'},
              {name: 'Vertex Cloud', value: 76, note: '$119K'},
              {name: 'Atlas Works', value: 69, note: '$96K'},
            ]}
          />
        </Card>

        <Card title="Pipeline Mix" eyebrow="Qualified opportunity" accent={C.amber}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 3}}>
            <Donut
              segments={[
                {value: 44, color: C.emerald},
                {value: 31, color: C.cyan},
                {value: 25, color: C.amber},
              ]}
              progress={data(5)}
              frame={frame}
              phase={1.1}
              center={formatValue(2.18, data(5), 2, '$', 'M')}
              sub="PIPELINE"
            />
            <Legend items={[{name: 'Enterprise', color: C.emerald, value: '44%'}, {name: 'Mid-market', color: C.cyan, value: '31%'}, {name: 'Velocity', color: C.amber, value: '25%'}]} />
          </div>
        </Card>

        <Card title="Revenue Composition" eyebrow="Annual recurring revenue" accent={C.coral}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 3}}>
            <Donut
              segments={[
                {value: 54, color: C.coral},
                {value: 26, color: C.violet},
                {value: 20, color: C.cyan},
              ]}
              progress={data(6)}
              frame={frame}
              phase={2.2}
              center="8.42M"
              sub="ARR"
            />
            <Legend items={[{name: 'New logo', color: C.coral, value: '54%'}, {name: 'Expansion', color: C.violet, value: '26%'}, {name: 'Renewal', color: C.cyan, value: '20%'}]} />
          </div>
        </Card>

        <Card title="Sales Team Performance" eyebrow="Quota attainment" trend="+6.7%" accent={C.emerald}>
          <ProgressList
            progress={data(6)}
            frame={frame}
            items={[
              {name: 'Enterprise', value: 94, note: '94%', color: C.emerald},
              {name: 'Mid-market', value: 87, note: '87%', color: C.cyan},
              {name: 'Velocity', value: 81, note: '81%', color: C.violet},
              {name: 'Partners', value: 72, note: '72%', color: C.amber},
            ]}
          />
        </Card>

        <Card title="Forecast Confidence" eyebrow="AI weighted outlook" trend="+13.7%" accent={C.cyan}>
          <div style={{display: 'grid', placeItems: 'center', marginTop: -4}}>
            <Donut segments={[{value: 89, color: C.cyan}, {value: 11, color: C.borderBright}]} progress={data(6)} frame={frame} phase={3.3} center={formatValue(89, data(6), 0, '', '%')} sub="CONFIDENCE" />
          </div>
        </Card>

        <Card title="Automation Pipeline" eyebrow="AI growth workflows" trend="12 active" accent={C.violet} style={{gridColumn: 'span 2'}}>
          <ScheduleCard progress={data(7)} frame={frame} />
        </Card>

        <Card title="Monthly Conversion Velocity" eyebrow="Closed-won accounts" trend="+21.3%" accent={C.emerald}>
          <BarChart
            values={[57, 65, 61, 74, 79, 86]}
            labels={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']}
            progress={data(7)}
            frame={frame}
            colors={[C.cyan, C.cyan, C.emerald, C.emerald, C.emerald, C.emerald]}
          />
        </Card>

        <Card title="AI Agent Capacity" eyebrow="Revenue operations" trend="+9.1%" accent={C.violet}>
          <div style={{display: 'grid', placeItems: 'center', marginTop: -4}}>
            <Donut segments={[{value: 78, color: C.violet}, {value: 22, color: C.borderBright}]} progress={data(7)} frame={frame} phase={4.4} center={formatValue(78, data(7), 0, '', '%')} sub="UTILIZED" />
          </div>
        </Card>

        <Card title="Global Growth Index" eyebrow="Weighted market signal" trend="+17.6%" accent={C.emerald} style={{gridColumn: 'span 2'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 22, alignItems: 'center'}}>
            <LineChart progress={data(8)} frame={frame} id="growth-index" />
            <div style={{paddingRight: 4}}>
              <div style={{color: C.text, fontSize: 34, fontWeight: 780, letterSpacing: -1.2}}>{formatValue(92.4, data(8), 1)}</div>
              <div style={{color: C.muted, fontSize: 10, lineHeight: 1.55, marginTop: 7}}>Signal strength across enterprise, product-led and partner channels.</div>
              <div style={{height: 1, background: C.border, margin: '14px 0 12px'}} />
              <TinyTrend text="Above target" />
            </div>
          </div>
        </Card>

        <Card title="Retention Cohorts" eyebrow="Net revenue retention" trend="+6.2%" accent={C.cyan} style={{gridColumn: 'span 2', height: 366}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 7, marginTop: 18}}>
            {[92, 88, 84, 79, 73, 68, 62, 58, 89, 86, 82, 76, 71, 64, 59, 53, 84, 81, 77, 72, 66, 60, 55, 49].map((v, i) => {
              const local = clamp01((data(8) - i * 0.012) / (1 - i * 0.012));
              const pulse = 0.92 + 0.08 * (liveWave(frame, i * 0.48, 0.019) + 1) / 2;
              return <div key={i} style={{height: 29, borderRadius: 6, background: `rgba(88,240,179,${0.05 + (v / 100) * 0.38 * local * pulse})`, border: '1px solid rgba(88,240,179,0.08)'}} />;
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        overflow: 'hidden',
        fontFamily: font,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 27%, rgba(28,65,68,0.20), transparent 43%), radial-gradient(circle at 22% 76%, rgba(32,45,72,0.13), transparent 38%), linear-gradient(180deg, #071019 0%, #05090E 58%, #04070B 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage:
            'linear-gradient(rgba(97,200,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(97,200,255,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 0%, transparent 78%)',
        }}
      />

      <DashboardPlane frame={frame} durationInFrames={durationInFrames} />

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(5,9,14,0.44) 0%, transparent 6%, transparent 91%, rgba(5,9,14,0.58) 100%), linear-gradient(90deg, rgba(5,9,14,0.48) 0%, transparent 13%, transparent 87%, rgba(5,9,14,0.48) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
