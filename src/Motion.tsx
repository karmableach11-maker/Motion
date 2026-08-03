import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BG = '#08070B';
const INK = '#F7F0E7';
const MUTED = '#8D8792';
const AMBER = '#FFB454';
const GOLD = '#FFD48A';
const VIOLET = '#A779FF';
const MINT = '#9AF0CB';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const polar = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const bezierPoint = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
) => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  return {
    x: uu * u * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + tt * t * p3[0],
    y: uu * u * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + tt * t * p3[1],
  };
};

const TinyMark: React.FC<{complete: boolean}> = ({complete}) => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <path
      d={complete ? 'M5 11.4 9.2 15.2 17.2 6.8' : 'M11 4.5v9.2m0 0 3.3-3.3M11 13.7l-3.3-3.3M5.5 17.2h11'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HexBadge: React.FC<{
  x: number;
  y: number;
  label: string;
  index: number;
  progress: number;
  complete: boolean;
}> = ({x, y, label, index, progress, complete}) => {
  const local = interpolate(progress, [index / 6, (index + 0.72) / 6], [0, 1], clamp);
  const active = local > 0.02;
  const done = local >= 0.995;
  const color = complete ? MINT : index % 2 === 0 ? AMBER : VIOLET;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 -34 29 -17 29 17 0 34 -29 17 -29 -17Z"
        fill={active ? `${color}17` : '#121017'}
        stroke={active ? color : '#39333D'}
        strokeWidth={active ? 1.8 : 1}
        opacity={0.95}
      />
      <path
        d={done ? 'M-9 0 -2 7 11 -8' : 'M-8 7V-7M0 7V-2M8 7V-12'}
        fill="none"
        stroke={active ? color : '#5B5361'}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.45 + local * 0.55}
      />
      <text
        x="0"
        y="57"
        fill={active ? '#BEB4C3' : '#655E69'}
        fontFamily="Inter, Arial, sans-serif"
        fontSize="13"
        fontWeight="600"
        letterSpacing="2.3"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
};

const DataPacket: React.FC<{
  progress: number;
  delay: number;
  path: [[number, number], [number, number], [number, number], [number, number]];
  color: string;
}> = ({progress, delay, path, color}) => {
  const cycle = Math.max(0, progress * 5.4 - delay);
  const raw = cycle - Math.floor(cycle);
  const visible = progress > delay / 5.4 && progress < 0.99;
  const pos = bezierPoint(raw, path[0], path[1], path[2], path[3]);
  const trail = bezierPoint(Math.max(0, raw - 0.055), path[0], path[1], path[2], path[3]);
  return (
    <g opacity={visible ? Math.sin(Math.PI * raw) * 0.8 : 0}>
      <line
        x1={trail.x}
        y1={trail.y}
        x2={pos.x}
        y2={pos.y}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.58"
      />
      <rect
        x={pos.x - 5}
        y={pos.y - 5}
        width="10"
        height="10"
        rx="2.4"
        fill={color}
        transform={`rotate(45 ${pos.x} ${pos.y})`}
      />
    </g>
  );
};

const CoreGraphic: React.FC<{
  progress: number;
  entry: number;
  completion: number;
  settledFrame: number;
}> = ({progress, entry, completion, settledFrame}) => {
  const cx = 540;
  const cy = 515;
  const radius = 258;
  const segmentCount = 48;
  const circumference = Math.PI * 2 * 222;
  const complete = completion > 0.5;
  const displayPercent = progress >= 1 ? 100 : Math.min(99, Math.floor(progress * 100));
  const corePulse = complete
    ? 1 + Math.sin(settledFrame * 0.16) * 0.008 * (1 - completion)
    : 1 + Math.sin(settledFrame * 0.045) * 0.006;

  const nodes = [
    {angle: -42, label: 'SYSTEM'},
    {angle: 18, label: 'DRIVERS'},
    {angle: 78, label: 'SECURITY'},
    {angle: 138, label: 'KERNEL'},
    {angle: 198, label: 'SERVICES'},
    {angle: 258, label: 'INDEX'},
  ];

  return (
    <svg
      width="1080"
      height="1010"
      viewBox="0 0 1080 1010"
      style={{position: 'absolute', left: 32, top: 40, overflow: 'visible'}}
    >
      <defs>
        <radialGradient id="coreFace" cx="42%" cy="35%" r="70%">
          <stop offset="0" stopColor={complete ? '#2B4439' : '#2B2325'} />
          <stop offset="0.55" stopColor={complete ? '#10251E' : '#171118'} />
          <stop offset="1" stopColor="#09070B" />
        </radialGradient>
        <linearGradient id="progressStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={AMBER} />
          <stop offset="0.48" stopColor={GOLD} />
          <stop offset="1" stopColor={VIOLET} />
        </linearGradient>
        <linearGradient id="completeStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={MINT} />
          <stop offset="1" stopColor="#E1FFF0" />
        </linearGradient>
      </defs>

      <g opacity={0.24 * entry}>
        <path d="M88 140C202 167 256 257 330 346" fill="none" stroke={AMBER} strokeWidth="1.3" strokeDasharray="3 12" />
        <path d="M996 180C885 180 822 277 746 367" fill="none" stroke={VIOLET} strokeWidth="1.3" strokeDasharray="3 12" />
        <path d="M115 846C248 824 283 738 350 672" fill="none" stroke={VIOLET} strokeWidth="1.3" strokeDasharray="3 12" />
      </g>

      <g transform={`translate(${cx} ${cy}) scale(${entry * corePulse}) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r="309" fill="none" stroke="#2B252E" strokeWidth="1" strokeDasharray="2 10" opacity="0.72" />
        <circle cx={cx} cy={cy} r="273" fill="none" stroke="#17131A" strokeWidth="42" />
        <circle cx={cx} cy={cy} r="273" fill="none" stroke="#3B323B" strokeWidth="1.2" />

        {Array.from({length: segmentCount}).map((_, index) => {
          const angle = (index / segmentCount) * 360;
          const lit = progress * segmentCount >= index + 0.15;
          const segmentColor = complete ? MINT : index / segmentCount < 0.58 ? AMBER : VIOLET;
          return (
            <rect
              key={index}
              x={cx - 4}
              y={cy - radius - 12}
              width="8"
              height={lit ? 25 : 14}
              rx="4"
              fill={lit ? segmentColor : '#38313B'}
              opacity={lit ? 0.96 : 0.44}
              transform={`rotate(${angle} ${cx} ${cy})`}
            />
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r="222"
          fill="none"
          stroke={complete ? MINT : GOLD}
          strokeWidth="21"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity="0.105"
        />
        <circle
          cx={cx}
          cy={cy}
          r="222"
          fill="none"
          stroke="#332C34"
          strokeWidth="5"
          opacity="0.62"
        />
        <circle
          cx={cx}
          cy={cy}
          r="222"
          fill="none"
          stroke={complete ? 'url(#completeStroke)' : 'url(#progressStroke)'}
          strokeWidth="7"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity="0.94"
        />

        <circle cx={cx} cy={cy} r="181" fill="url(#coreFace)" stroke={complete ? '#7AE9B765' : '#D79B5F42'} strokeWidth="2" />
        <circle cx={cx} cy={cy} r="158" fill="none" stroke={complete ? '#8DEAC047' : '#FFD18A26'} strokeWidth="1" strokeDasharray="1 10" />
        <path d={`M${cx - 112} ${cy - 76} A136 136 0 0 1 ${cx + 83} ${cy - 106}`} fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.11" strokeLinecap="round" />

        {!complete && (
          <>
            <path d={`M${cx} ${cy - 128}V${cy - 72}M${cx} ${cy - 72}l-22-22M${cx} ${cy - 72}l22-22`} stroke={GOLD} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
            <path d={`M${cx - 36} ${cy - 52}V${cy - 40}H${cx + 36}V${cy - 52}`} stroke={GOLD} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.48" />
          </>
        )}

        {complete && (
          <g
            transform={`translate(${cx} ${cy - 86}) scale(${0.7 + completion * 0.3}) translate(${-cx} ${-(cy - 86)})`}
            opacity={completion}
          >
            <circle cx={cx} cy={cy - 86} r="42" fill="#86F2BF16" stroke={MINT} strokeWidth="2" />
            <path d={`M${cx - 21} ${cy - 87}l15 15 30-34`} fill="none" stroke={MINT} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        <text x={cx} y={cy + 46} textAnchor="middle" fill={INK} fontFamily="Inter, Arial, sans-serif" fontSize="82" fontWeight="600" letterSpacing="-3" style={{fontVariantNumeric: 'tabular-nums'}}>
          {displayPercent}%
        </text>
        <text x={cx} y={cy + 84} textAnchor="middle" fill={complete ? MINT : MUTED} fontFamily="Inter, Arial, sans-serif" fontSize="14" fontWeight="700" letterSpacing="4.2">
          {complete ? 'UPDATE COMPLETE' : 'CORE PACKAGE'}
        </text>
      </g>

      {nodes.map((node, index) => {
        const pos = polar(cx, cy, 366, node.angle);
        const inner = polar(cx, cy, 307, node.angle);
        const local = interpolate(progress, [index / 6, (index + 0.72) / 6], [0, 1], clamp);
        const connectionColor = complete ? MINT : index % 2 === 0 ? AMBER : VIOLET;
        return (
          <g key={node.label} opacity={entry}>
            <line x1={inner.x} y1={inner.y} x2={pos.x} y2={pos.y} stroke="#3D3540" strokeWidth="1.2" />
            <line x1={inner.x} y1={inner.y} x2={pos.x} y2={pos.y} stroke={connectionColor} strokeWidth="2" opacity={local * 0.8} strokeDasharray="5 6" />
            <HexBadge x={pos.x} y={pos.y} label={node.label} index={index} progress={progress} complete={complete} />
          </g>
        );
      })}

      <DataPacket progress={progress} delay={0.2} color={AMBER} path={[[90, 142], [260, 174], [266, 358], [378, 417]]} />
      <DataPacket progress={progress} delay={1.4} color={VIOLET} path={[[1000, 182], [828, 177], [825, 345], [704, 421]]} />
      <DataPacket progress={progress} delay={2.6} color={GOLD} path={[[120, 845], [273, 826], [283, 690], [382, 629]]} />
    </svg>
  );
};

const StatusPanel: React.FC<{
  progress: number;
  entry: number;
  completion: number;
}> = ({progress, entry, completion}) => {
  const complete = completion > 0.5;
  const phaseIndex = Math.min(5, Math.floor(progress * 6));
  const phases = ['SYSTEM', 'DRIVERS', 'SECURITY', 'KERNEL', 'SERVICES', 'INDEX'];
  const packageSize = progress >= 1 ? '2.84' : Math.min(2.83, progress * 2.84).toFixed(2);
  const integrity = progress >= 1 ? 100 : Math.min(99, Math.floor(91 + progress * 9));
  const panelY = interpolate(entry, [0, 1], [28, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        right: 126,
        top: 176,
        width: 538,
        height: 730,
        opacity: entry,
        transform: `translateY(${panelY}px)`,
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 13, color: complete ? MINT : AMBER, fontSize: 13, fontWeight: 800, letterSpacing: 4.8}}>
        <span style={{width: 8, height: 8, transform: 'rotate(45deg)', background: 'currentColor', boxShadow: '0 0 14px currentColor'}} />
        RELEASE CHANNEL / STABLE
      </div>

      <div style={{marginTop: 35, fontSize: 74, lineHeight: 0.97, fontWeight: 620, letterSpacing: -3.8, color: INK}}>
        Software<br />update
      </div>
      <div style={{marginTop: 28, width: 430, fontSize: 18, lineHeight: 1.58, color: '#98919D', letterSpacing: 0.15}}>
        Rebuilding the operating core with verified modules and hardened system services.
      </div>

      <div style={{marginTop: 50, borderTop: '1px solid #332D36', borderBottom: '1px solid #332D36'}}>
        {[
          ['CURRENT MODULE', complete ? 'ALL MODULES' : phases[phaseIndex]],
          ['PACKAGE STREAM', `${packageSize} / 2.84 GB`],
          ['INTEGRITY', `${integrity}.00%`],
        ].map(([label, value], index) => (
          <div
            key={label}
            style={{
              height: 78,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: index < 2 ? '1px solid #252128' : 'none',
            }}
          >
            <span style={{fontSize: 12, color: '#716A76', letterSpacing: 2.8, fontWeight: 700}}>{label}</span>
            <span style={{fontSize: 15, color: index === 0 ? (complete ? MINT : GOLD) : '#CFC6D2', letterSpacing: 1.5, fontWeight: 650, fontVariantNumeric: 'tabular-nums'}}>{value}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 34,
          height: 62,
          border: `1px solid ${complete ? '#72DFA45D' : '#B67B4155'}`,
          background: complete ? 'linear-gradient(90deg, #5FE1A417, #5FE1A405)' : 'linear-gradient(90deg, #EEA45013, #A87AFF09)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 14,
          color: complete ? MINT : GOLD,
        }}
      >
        <TinyMark complete={complete} />
        <span style={{fontSize: 13, fontWeight: 800, letterSpacing: 3.1}}>
          {complete ? 'SYSTEM READY' : 'INSTALLATION IN PROGRESS'}
        </span>
      </div>

      <div style={{marginTop: 23, display: 'flex', alignItems: 'center', gap: 12, color: '#5D5661', fontSize: 11, letterSpacing: 2.3, fontWeight: 700}}>
        <span>BUILD 12.8.4</span>
        <span style={{height: 1, flex: 1, background: '#29242C'}} />
        <span>SHA / 8F2C-A19D</span>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const settledFrame = Math.min(frame, 792);

  const entrySpring = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 92, mass: 0.85},
    durationInFrames: 72,
  });
  const entry = interpolate(entrySpring, [0, 1], [0.82, 1], clamp);
  const opacity = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: easeOut});
  const progress = interpolate(frame, [72, 690], [0, 1], {...clamp, easing: Easing.linear});
  const completionSpring = spring({
    frame: frame - 700,
    fps,
    config: {damping: 15, stiffness: 110, mass: 0.7},
    durationInFrames: 66,
  });
  const completion = interpolate(completionSpring, [0, 1], [0, 1], clamp);
  const ambient = Math.sin(settledFrame * 0.018);
  const sweepX = interpolate(progress, [0, 1], [-420, 2040], clamp);

  return (
    <AbsoluteFill style={{background: BG, color: INK, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 25% 44%, rgba(255,157,66,0.12), transparent 32%), radial-gradient(circle at 82% 22%, rgba(148,102,255,0.12), transparent 30%), linear-gradient(135deg, #0B090D 0%, #08070B 54%, #0D0910 100%)',
        }}
      />

      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.24}} aria-hidden="true">
        <defs>
          <pattern id="microGrid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" fill="none" stroke="#7C6B7E" strokeWidth="0.55" />
            <circle cx="0" cy="0" r="1.15" fill="#D1B2A1" />
          </pattern>
          <pattern id="microNoise" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="3" r="0.55" fill="#D8CBD9" opacity="0.18" />
            <circle cx="9" cy="8" r="0.45" fill="#8E7A8F" opacity="0.13" />
          </pattern>
          <linearGradient id="fadeGrid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.48" stopColor="white" stopOpacity="0.7" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="gridMask"><rect width="1920" height="1080" fill="url(#fadeGrid)" /></mask>
        </defs>
        <rect width="1920" height="1080" fill="url(#microGrid)" mask="url(#gridMask)" />
        <rect width="1920" height="1080" fill="url(#microNoise)" opacity="0.14" />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: -290,
          top: 110 + ambient * 14,
          width: 830,
          height: 830,
          background: 'radial-gradient(circle, rgba(255,144,54,0.13) 0%, rgba(255,144,54,0.04) 42%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -310,
          top: -110 - ambient * 10,
          width: 850,
          height: 850,
          background: 'radial-gradient(circle, rgba(142,94,255,0.13) 0%, rgba(142,94,255,0.04) 42%, transparent 70%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: sweepX,
          top: -220,
          width: 210,
          height: 1500,
          transform: 'rotate(19deg)',
          background: 'linear-gradient(90deg, transparent, rgba(255,211,148,0.025), transparent)',
          opacity: progress < 0.99 ? 1 : 0,
        }}
      />

      <div style={{opacity}}>
        <CoreGraphic progress={progress} entry={entry} completion={completion} settledFrame={settledFrame} />
        <StatusPanel progress={progress} entry={entry} completion={completion} />
      </div>

      <div style={{position: 'absolute', left: 78, top: 60, display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Inter, Arial, sans-serif', fontSize: 11, letterSpacing: 3.2, fontWeight: 800, color: '#6F6773', opacity}}>
        <span style={{width: 22, height: 1, background: AMBER}} />
        ORBITAL SYSTEMS / UPDATE CONSOLE
      </div>
      <div style={{position: 'absolute', right: 76, bottom: 55, fontFamily: 'Inter, Arial, sans-serif', fontSize: 10, letterSpacing: 2.7, color: '#4F4952', fontWeight: 700, opacity}}>
        VERIFIED DISTRIBUTION • 06 MODULES
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 190px rgba(0,0,0,0.72)',
        }}
      />
    </AbsoluteFill>
  );
};
