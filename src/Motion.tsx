import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#050b1b',
  bg2: '#09182d',
  panel: '#0d2038',
  panel2: '#102943',
  text: '#f4faff',
  muted: '#9eb5cc',
  dim: '#5f7892',
  line: '#244760',
  cyan: '#45e6ff',
  blue: '#4b7cff',
  violet: '#9a72ff',
  mint: '#4ff2b8',
  gold: '#ffd166',
  coral: '#ff7186',
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
const life = (frame: number, from: number, to: number, exitFrom = 848, exitTo = 900) =>
  p(frame, from, to) * (1 - p(frame, exitFrom, exitTo));

const rgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red},${green},${blue},${alpha})`;
};

const Glass: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  reveal: number;
  children: React.ReactNode;
  radius?: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({x, y, width, height, reveal, children, radius = 28, accent = C.cyan, style}) => (
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
      border: `1px solid ${rgba(accent, 0.18)}`,
      background: 'linear-gradient(145deg, rgba(15,40,65,.88), rgba(5,18,34,.95) 58%, rgba(4,12,25,.98))',
      boxShadow: '0 34px 92px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.055), inset 0 -1px 0 rgba(255,255,255,.016)',
      backdropFilter: 'blur(16px)',
      opacity: reveal,
      transform: `translate3d(0, ${(1 - reveal) * 20}px, 0) scale(${0.985 + reveal * 0.015})`,
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
        background: `linear-gradient(123deg, ${rgba(C.text, 0.045)}, transparent 28%, transparent 72%, ${rgba(accent, 0.03)})`,
      }}
    />
    {children}
  </div>
);

const Ambient: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const exit = 1 - p(timeline, 850, 900);
  const particles = Array.from({length: 62}, (_, index) => ({
    x: 28 + ((index * 181 + 47) % 1865),
    y: 25 + ((index * 113 + 61) % 1030),
    size: 0.8 + (index % 4) * 0.48,
  }));
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${37 + Math.sin(phase) * 2}% ${38 + Math.cos(phase) * 2}%, ${rgba(C.cyan, 0.13)}, transparent 34%), radial-gradient(circle at ${78 + Math.cos(phase) * 2}% ${34 + Math.sin(phase) * 2}%, ${rgba(C.violet, 0.11)}, transparent 31%), radial-gradient(circle at 61% 88%, ${rgba(C.blue, 0.1)}, transparent 33%), linear-gradient(145deg, ${C.bg}, ${C.bg2} 58%, #030714)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.11,
          backgroundImage:
            'linear-gradient(rgba(71,145,176,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(71,145,176,.18) 1px, transparent 1px)',
          backgroundSize: '76px 76px',
          transform: `translate(${Math.sin(phase) * 7}px, ${Math.cos(phase) * 5}px)`,
        }}
      />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, opacity: 0.28 * exit}}>
        <defs>
          <linearGradient id="ambient-route" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={C.cyan} stopOpacity=".2" />
            <stop offset=".5" stopColor={C.violet} stopOpacity=".08" />
            <stop offset="1" stopColor={C.blue} stopOpacity=".16" />
          </linearGradient>
          <filter id="ambient-haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
        </defs>
        {Array.from({length: 9}, (_, index) => {
          const y = 130 + index * 101 + Math.sin(phase + index * 0.72) * 7;
          return (
            <path
              key={index}
              d={`M-100 ${y} C300 ${y - 94} 535 ${y + 89} 900 ${y - 12} S1510 ${y - 73} 2020 ${y + 28}`}
              fill="none"
              stroke="url(#ambient-route)"
              strokeWidth={index % 3 === 0 ? 1 : 0.65}
              strokeDasharray={index % 2 === 0 ? '3 15' : undefined}
              strokeDashoffset={-timeline * (0.07 + index * 0.004)}
              opacity={0.15 + (index % 4) * 0.04}
            />
          );
        })}
        <ellipse cx={720 + Math.sin(phase) * 11} cy={540 + Math.cos(phase) * 8} rx="470" ry="350" fill={C.cyan} opacity=".028" filter="url(#ambient-haze)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: 0.032, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.2) 0, rgba(255,255,255,.2) 1px, transparent 1px, transparent 5px)', mixBlendMode: 'soft-light'}} />
      {particles.map((particle, index) => {
        const color = index % 11 === 0 ? C.mint : index % 9 === 0 ? C.violet : C.text;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: particle.x + Math.sin(phase * (0.7 + (index % 3) * 0.13) + index) * 7,
              top: particle.y + Math.cos(phase * (0.82 + (index % 4) * 0.1) + index) * 6,
              width: particle.size,
              height: particle.size,
              borderRadius: 8,
              background: color,
              opacity: (0.038 + (index % 5) * 0.013) * exit,
              boxShadow: index % 11 === 0 ? `0 0 9px ${color}` : undefined,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 170px rgba(0,0,0,.6)', pointerEvents: 'none'}} />
    </>
  );
};

const Header: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 8, 70, 850, 900);
  const success = p(timeline, 780, 825);
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top: 53, height: 92, opacity: reveal, transform: `translateY(${(1 - reveal) * -12}px)`, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 60, height: 60, borderRadius: 20, display: 'grid', placeItems: 'center', border: `1px solid ${rgba(C.cyan, 0.33)}`, background: `radial-gradient(circle at 36% 30%, ${rgba(C.text, 0.13)}, ${rgba(C.cyan, 0.08)} 42%, rgba(7,22,40,.82))`, boxShadow: `0 0 ${17 + Math.sin(phase * 2) * 3}px ${rgba(C.cyan, 0.11)}`}}>
          <svg width="38" height="38" viewBox="0 0 38 38">
            <path d="M8 24 C4 24 3 18 7 16 C7 10 13 6 18 9 C23 4 32 8 31 15 C36 17 35 24 30 24Z" fill="none" stroke={C.cyan} strokeWidth="1.5" />
            <path d="M13 26 L19 32 L27 22" fill="none" stroke={success > 0.8 ? C.mint : C.violet} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={0.45 + success * 0.55} />
            <circle cx="19" cy="19" r="16" fill="none" stroke={rgba(C.violet, 0.45)} strokeWidth=".8" strokeDasharray="3 5" strokeDashoffset={-timeline * 0.12} />
          </svg>
        </div>
        <div>
          <div style={{fontSize: 29, color: C.text, fontWeight: 900, letterSpacing: 0.95}}>SECURE CLOUD CONTINUITY</div>
          <div style={{marginTop: 7, fontSize: 12.5, color: C.muted, fontWeight: 730, letterSpacing: 0.76}}>ENCRYPTED TRANSFER ORCHESTRATION · ILLUSTRATIVE SYSTEM</div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 0, top: 8, display: 'flex', alignItems: 'center', gap: 11}}>
        <div style={{height: 42, padding: '0 15px', borderRadius: 13, display: 'flex', alignItems: 'center', border: `1px solid ${rgba(C.text, 0.1)}`, background: 'rgba(9,27,48,.66)', color: C.muted, fontSize: 11.5, fontWeight: 780, letterSpacing: 0.56}}>24 ASSETS</div>
        <div style={{height: 42, minWidth: 178, padding: '0 16px', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, border: `1px solid ${rgba(success > 0.9 ? C.mint : C.cyan, 0.27)}`, background: rgba(success > 0.9 ? C.mint : C.cyan, 0.055), color: success > 0.9 ? C.mint : C.cyan, fontSize: 11.5, fontWeight: 850, letterSpacing: 0.62}}>
          <span style={{width: 7, height: 7, borderRadius: 7, background: success > 0.9 ? C.mint : C.cyan, boxShadow: `0 0 ${8 + Math.sin(phase * 4) * 2}px ${success > 0.9 ? C.mint : C.cyan}`}} />
          {success > 0.9 ? 'SYNC COMPLETE' : 'SECURE SESSION'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: `linear-gradient(90deg, ${rgba(C.cyan, 0.28)}, ${rgba(C.violet, 0.16)}, transparent 76%)`}} />
    </div>
  );
};

const CloudCore: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 32, 132, 838, 900);
  const active = p(timeline, 145, 240);
  const success = p(timeline, 770, 825);
  const pulse = 0.5 + Math.sin(timeline * 0.08) * 0.12;
  const labelOpacity = 1 - p(timeline, 150, 220) * (1 - p(timeline, 735, 800));
  return (
    <div style={{position: 'absolute', left: 304, top: 46, width: 600, height: 308, opacity: reveal, transform: `translateY(${(1 - reveal) * -18}px) scale(${0.92 + reveal * 0.08 + success * 0.02})`}}>
      <svg width="600" height="308" viewBox="0 0 600 308" style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="cloud-shell" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={success > 0.85 ? C.mint : C.cyan} stopOpacity=".18" />
            <stop offset=".48" stopColor={C.blue} stopOpacity=".09" />
            <stop offset="1" stopColor={C.violet} stopOpacity=".16" />
          </linearGradient>
          <linearGradient id="cloud-ring" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={success > 0.85 ? C.mint : C.cyan} />
            <stop offset=".52" stopColor={C.blue} />
            <stop offset="1" stopColor={C.violet} />
          </linearGradient>
          <radialGradient id="cloud-core-glow">
            <stop stopColor={C.text} stopOpacity=".95" />
            <stop offset=".16" stopColor={success > 0.85 ? C.mint : C.cyan} stopOpacity=".76" />
            <stop offset=".56" stopColor={C.violet} stopOpacity=".12" />
            <stop offset="1" stopColor={C.violet} stopOpacity="0" />
          </radialGradient>
          <filter id="cloud-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="cloud-wide" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="24" /></filter>
        </defs>
        <ellipse cx="300" cy="160" rx={218 + Math.sin(phase) * 3} ry={101 + Math.cos(phase) * 2} fill={success > 0.8 ? C.mint : C.cyan} opacity={0.025 + active * 0.025 + success * 0.025} filter="url(#cloud-wide)" />
        <path d="M154 211 C104 211 83 181 98 149 C108 127 130 116 154 119 C158 78 192 54 228 63 C257 28 319 31 344 72 C387 54 433 82 437 125 C478 125 506 153 496 185 C489 205 471 211 445 211 Z" fill="url(#cloud-shell)" stroke="url(#cloud-ring)" strokeWidth="1.7" filter="url(#cloud-glow)" />
        <path d="M172 194 C135 194 119 174 130 153 C139 136 158 132 178 137 C185 105 213 91 239 100 C267 75 314 78 333 108 C366 94 401 114 405 146 C439 143 461 163 451 186" fill="none" stroke={success > 0.85 ? C.mint : C.cyan} strokeWidth="1" strokeDasharray="5 9" strokeDashoffset={-timeline * 0.15} opacity={0.32 + active * 0.28} />
        <ellipse cx="300" cy="157" rx="82" ry="57" fill="url(#cloud-core-glow)" opacity={0.54 + active * 0.22 + success * 0.18} filter="url(#cloud-wide)" />
        <circle cx="300" cy="157" r={55 + pulse * 3} fill={rgba(C.bg, 0.76)} stroke="url(#cloud-ring)" strokeWidth="1.5" filter="url(#cloud-glow)" />
        <path d="M300 116 L336 137 L336 178 L300 199 L264 178 L264 137Z" fill={rgba(success > 0.85 ? C.mint : C.cyan, 0.075)} stroke="url(#cloud-ring)" strokeWidth="1.2" />
        {success < 0.82 ? (
          <>
            <path d="M300 178 V139 M286 153 L300 139 L314 153" fill="none" stroke={C.text} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="281" y1="181" x2="319" y2="181" stroke={C.cyan} strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <path d="M278 158 L294 174 L324 140" fill="none" stroke={C.mint} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {Array.from({length: 12}, (_, index) => {
          const angle = index / 12 * Math.PI * 2 + phase * 0.45;
          const radiusX = 126 + (index % 2) * 31;
          const radiusY = 72 + (index % 2) * 18;
          const color = [C.cyan, C.violet, C.mint][index % 3];
          return (
            <g key={index} opacity={0.22 + active * 0.42 + success * 0.12}>
              <line x1={300 + Math.cos(angle) * 61} y1={157 + Math.sin(angle) * 38} x2={300 + Math.cos(angle) * radiusX} y2={157 + Math.sin(angle) * radiusY} stroke={color} strokeWidth=".6" opacity=".3" />
              <circle cx={300 + Math.cos(angle) * radiusX} cy={157 + Math.sin(angle) * radiusY} r={2.2 + (index % 3) * 0.5} fill={color} filter={index % 4 === 0 ? 'url(#cloud-glow)' : undefined} />
            </g>
          );
        })}
        <text x="300" y="267" textAnchor="middle" fill={success > 0.85 ? C.mint : C.text} fontFamily={FONT} fontSize="14" fontWeight="850" letterSpacing="1.2" opacity={labelOpacity}>{success > 0.85 ? 'CLOUD CORE VERIFIED' : 'CLOUD CORE'}</text>
        <text x="300" y="286" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="10.5" fontWeight="720" letterSpacing=".65" opacity={labelOpacity}>ENCRYPTED DESTINATION VAULT</text>
      </svg>
    </div>
  );
};

const Vault: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 72, 164, 836, 900);
  const open = p(timeline, 112, 185);
  const success = p(timeline, 770, 825);
  const remaining = Math.max(0, 24 - Math.round(24 * p(timeline, 150, 735, soft)));
  return (
    <div style={{position: 'absolute', left: 378, top: 570, width: 450, height: 178, opacity: reveal, transform: `translateY(${(1 - reveal) * 24}px) scale(${0.94 + reveal * 0.06})`, fontFamily: FONT}}>
      <svg width="450" height="142" viewBox="0 0 450 142" style={{overflow: 'visible'}}>
        <defs>
          <linearGradient id="vault-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor={C.cyan} stopOpacity=".16" /><stop offset="1" stopColor={C.violet} stopOpacity=".08" /></linearGradient>
          <linearGradient id="vault-front" x1="0" y1="0" x2="0" y2="1"><stop stopColor={C.panel2} /><stop offset="1" stopColor={C.bg} /></linearGradient>
          <filter id="vault-glow" x="-40%" y="-70%" width="180%" height="240%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <ellipse cx="225" cy="118" rx="176" ry="25" fill={C.cyan} opacity=".035" filter="url(#vault-glow)" />
        <path d={`M72 ${52 - open * 15} L378 ${52 - open * 15} L418 ${78 - open * 9} L32 ${78 - open * 9}Z`} fill="url(#vault-top)" stroke={success > 0.85 ? C.mint : C.cyan} strokeOpacity={0.28 + open * 0.28} strokeWidth="1.3" filter="url(#vault-glow)" />
        <path d="M32 78 L418 78 L390 128 L60 128Z" fill="url(#vault-front)" stroke={success > 0.85 ? C.mint : C.line} strokeWidth="1.3" />
        <path d="M74 90 L376 90 L361 115 L89 115Z" fill={rgba(C.bg, 0.72)} stroke={rgba(C.cyan, 0.18)} />
        {Array.from({length: 8}, (_, index) => {
          const color = [C.cyan, C.blue, C.violet, C.mint][index % 4];
          const lit = index >= Math.ceil(remaining / 3);
          return <g key={index}><rect x={96 + index * 34} y="98" width="22" height="8" rx="3" fill={lit ? color : rgba(C.dim, 0.22)} opacity={lit ? 0.82 : 0.46} /><circle cx={107 + index * 34} cy="102" r="2" fill={lit ? C.text : C.dim} opacity={lit ? 0.9 : 0.28} /></g>;
        })}
        <path d="M180 129 L270 129 L258 138 L192 138Z" fill={success > 0.85 ? rgba(C.mint, 0.22) : rgba(C.cyan, 0.14)} stroke={success > 0.85 ? C.mint : C.cyan} strokeOpacity=".5" />
        {success > 0.82 ? <path d="M211 103 L222 114 L242 91" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#vault-glow)" /> : null}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center'}}>
        <div style={{fontSize: 14, color: success > 0.85 ? C.mint : C.text, fontWeight: 850, letterSpacing: 1.15}}>{success > 0.85 ? 'DATA VAULT SECURED' : 'DATA VAULT'}</div>
        <div style={{marginTop: 6, fontSize: 10.5, color: C.muted, fontWeight: 720, letterSpacing: 0.6}}>{remaining > 0 ? `${remaining} PACKETS QUEUED` : 'LOCAL QUEUE CLEARED'}</div>
      </div>
      <div style={{position: 'absolute', left: 210, top: 12 + Math.sin(phase * 2) * 2, width: 30, height: 2, borderRadius: 4, background: success > 0.85 ? C.mint : C.cyan, boxShadow: `0 0 12px ${success > 0.85 ? C.mint : C.cyan}`, opacity: open}} />
    </div>
  );
};

type PacketInfo = {label: string; color: string; icon: 'image' | 'doc' | 'data' | 'media'};
const PACKETS: PacketInfo[] = [
  {label: 'IMAGE', color: C.cyan, icon: 'image'},
  {label: 'REPORT', color: C.violet, icon: 'doc'},
  {label: 'DATA', color: C.mint, icon: 'data'},
  {label: 'MEDIA', color: C.blue, icon: 'media'},
  {label: 'REPORT', color: C.gold, icon: 'doc'},
  {label: 'IMAGE', color: C.cyan, icon: 'image'},
  {label: 'DATA', color: C.mint, icon: 'data'},
  {label: 'MEDIA', color: C.violet, icon: 'media'},
  {label: 'IMAGE', color: C.blue, icon: 'image'},
  {label: 'REPORT', color: C.coral, icon: 'doc'},
  {label: 'DATA', color: C.mint, icon: 'data'},
  {label: 'MEDIA', color: C.cyan, icon: 'media'},
];

const PacketIcon: React.FC<{kind: PacketInfo['icon']; color: string}> = ({kind, color}) => {
  if (kind === 'image') {
    return <svg width="32" height="26" viewBox="0 0 32 26"><rect x="2" y="2" width="28" height="22" rx="5" fill={rgba(color, 0.08)} stroke={color} strokeWidth="1.2" /><circle cx="22" cy="8" r="3" fill={color} /><path d="M5 20 L12 13 L17 17 L21 13 L28 20" fill="none" stroke={C.text} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (kind === 'doc') {
    return <svg width="30" height="28" viewBox="0 0 30 28"><path d="M6 2 H20 L25 7 V26 H6Z" fill={rgba(color, 0.08)} stroke={color} strokeWidth="1.2" /><path d="M20 2 V8 H25" fill="none" stroke={color} /><line x1="10" y1="13" x2="21" y2="13" stroke={C.text} strokeWidth="1.2" /><line x1="10" y1="18" x2="21" y2="18" stroke={C.text} strokeWidth="1.2" /></svg>;
  }
  if (kind === 'data') {
    return <svg width="30" height="28" viewBox="0 0 30 28"><ellipse cx="15" cy="6" rx="10" ry="4" fill={rgba(color, 0.08)} stroke={color} strokeWidth="1.2" /><path d="M5 6 V21 C5 26 25 26 25 21 V6" fill="none" stroke={color} strokeWidth="1.2" /><path d="M5 13 C5 18 25 18 25 13 M5 19 C5 24 25 24 25 19" fill="none" stroke={C.text} strokeOpacity=".75" /></svg>;
  }
  return <svg width="30" height="28" viewBox="0 0 30 28"><rect x="3" y="3" width="24" height="22" rx="6" fill={rgba(color, 0.08)} stroke={color} strokeWidth="1.2" /><path d="M12 9 L21 14 L12 19Z" fill={C.text} /></svg>;
};

const DataPacket: React.FC<{packet: PacketInfo; index: number; timeline: number}> = ({packet, index, timeline}) => {
  const start = 152 + index * 46;
  const travel = p(timeline, start, start + 132, soft);
  const show = p(timeline, start, start + 17) * (1 - p(timeline, start + 112, start + 136));
  const envelope = Math.sin(Math.PI * travel);
  const twist = travel * Math.PI * 4 + (index % 2) * Math.PI;
  const x = 603 + Math.sin(twist) * 150 * envelope;
  const y = 608 - travel * 348;
  const scale = 0.78 + envelope * 0.22 - travel * 0.06;
  const rotateY = Math.sin(twist) * 17;
  const rotateZ = Math.sin(twist * 0.5) * 4;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 49,
        top: y - 36,
        width: 98,
        height: 72,
        zIndex: Math.round(y),
        opacity: show,
        transform: `perspective(850px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        transformOrigin: '50% 50%',
        filter: `drop-shadow(0 13px 16px rgba(0,0,0,.35)) drop-shadow(0 0 9px ${rgba(packet.color, 0.18)})`,
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${rgba(packet.color, 0.48)}`, background: 'linear-gradient(145deg, rgba(22,53,79,.94), rgba(6,20,38,.96))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: packet.color, boxShadow: `0 0 10px ${packet.color}`}} />
        <div style={{position: 'absolute', left: 11, top: 9}}><PacketIcon kind={packet.icon} color={packet.color} /></div>
        <div style={{position: 'absolute', left: 48, top: 13, color: C.text, fontSize: 10.5, fontWeight: 850, letterSpacing: 0.55}}>{packet.label}</div>
        <div style={{position: 'absolute', left: 48, top: 31, color: packet.color, fontSize: 8.5, fontWeight: 780, letterSpacing: 0.45}}>ENCRYPTED</div>
        <div style={{position: 'absolute', left: 11, right: 10, bottom: 8, height: 3, borderRadius: 3, background: rgba(packet.color, 0.1), overflow: 'hidden'}}><div style={{height: '100%', width: `${Math.min(1, travel * 1.3) * 100}%`, background: packet.color, boxShadow: `0 0 7px ${packet.color}`}} /></div>
      </div>
    </div>
  );
};

const TransferHelix: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 120, 190, 830, 900);
  const active = p(timeline, 145, 260);
  const success = p(timeline, 770, 825);
  return (
    <>
      <svg width="1210" height="768" viewBox="0 0 1210 768" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: reveal}}>
        <defs>
          <linearGradient id="helix-a" x1="0" y1="1" x2="0" y2="0"><stop stopColor={C.cyan} stopOpacity=".18" /><stop offset=".5" stopColor={C.cyan} stopOpacity=".62" /><stop offset="1" stopColor={success > 0.8 ? C.mint : C.violet} stopOpacity=".2" /></linearGradient>
          <linearGradient id="helix-b" x1="0" y1="1" x2="0" y2="0"><stop stopColor={C.violet} stopOpacity=".18" /><stop offset=".5" stopColor={C.violet} stopOpacity=".55" /><stop offset="1" stopColor={success > 0.8 ? C.mint : C.blue} stopOpacity=".2" /></linearGradient>
          <filter id="helix-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M603 618 C418 573 786 520 603 474 C420 428 786 374 603 323 C478 288 726 249 603 225" fill="none" stroke="url(#helix-a)" strokeWidth="1.6" strokeDasharray="5 10" strokeDashoffset={-timeline * 0.19} opacity={0.35 + active * 0.38} filter="url(#helix-glow)" />
        <path d="M603 618 C788 573 420 520 603 474 C786 428 420 374 603 323 C728 288 480 249 603 225" fill="none" stroke="url(#helix-b)" strokeWidth="1.6" strokeDasharray="4 11" strokeDashoffset={timeline * 0.18} opacity={0.32 + active * 0.34} filter="url(#helix-glow)" />
        <path d="M603 618 V225" stroke={success > 0.85 ? C.mint : C.cyan} strokeWidth="10" opacity={0.018 + active * 0.02} filter="url(#helix-glow)" />
        {Array.from({length: 34}, (_, index) => {
          const t = (index / 34 + timeline * 0.00052) % 1;
          const envelope = Math.sin(Math.PI * t);
          const angle = t * Math.PI * 4 + index * 0.27;
          const x = 603 + Math.sin(angle) * 154 * envelope;
          const y = 618 - t * 393;
          const color = index % 3 === 0 ? C.violet : index % 5 === 0 ? C.mint : C.cyan;
          return <g key={index} opacity={0.13 + active * 0.35}><circle cx={x} cy={y} r={1.7 + (index % 3) * 0.5} fill={color} /><circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth=".5" opacity=".18" /></g>;
        })}
      </svg>
      {PACKETS.map((packet, index) => <DataPacket key={`${packet.label}-${index}`} packet={packet} index={index} timeline={timeline} />)}
    </>
  );
};

const Stage: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 22, 88, 840, 900);
  const success = p(timeline, 770, 825);
  return (
    <Glass x={110} y={174} width={1210} height={768} reveal={reveal} radius={31} accent={success > 0.8 ? C.mint : C.cyan}>
      <div style={{position: 'absolute', left: 24, right: 24, top: 19, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, zIndex: 1000}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><span style={{width: 8, height: 8, borderRadius: 8, background: success > 0.8 ? C.mint : C.cyan, boxShadow: `0 0 ${8 + Math.sin(phase * 4) * 2}px ${success > 0.8 ? C.mint : C.cyan}`}} /><span style={{fontSize: 13.5, color: C.text, fontWeight: 850, letterSpacing: 0.72}}>CLOUD MIGRATION PIPELINE</span></div>
        <div style={{display: 'flex', gap: 9}}>
          <span style={{padding: '7px 10px', borderRadius: 9, border: `1px solid ${rgba(C.cyan, 0.17)}`, color: C.cyan, background: rgba(C.cyan, 0.04), fontSize: 9.5, fontWeight: 840, letterSpacing: 0.52}}>ENCRYPTED</span>
          <span style={{padding: '7px 10px', borderRadius: 9, border: `1px solid ${rgba(C.violet, 0.17)}`, color: C.violet, background: rgba(C.violet, 0.04), fontSize: 9.5, fontWeight: 840, letterSpacing: 0.52}}>LIVE SYNC</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 61, height: 1, background: `linear-gradient(90deg, ${rgba(C.cyan, 0.24)}, ${rgba(C.violet, 0.14)}, transparent)`}} />
      <TransferHelix timeline={timeline} phase={phase} />
      <CloudCore timeline={timeline} phase={phase} />
      <Vault timeline={timeline} phase={phase} />
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 19, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, zIndex: 1000}}>
        <span style={{fontSize: 10.5, color: C.muted, fontWeight: 740, letterSpacing: 0.59}}>SOURCE → ENCRYPTION TUNNEL → DESTINATION</span>
        <span style={{fontSize: 10.5, color: success > 0.9 ? C.mint : C.cyan, fontWeight: 830, letterSpacing: 0.58}}>{success > 0.9 ? 'ALL CHANNELS VERIFIED' : 'TRANSFER CHANNEL ACTIVE'}</span>
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, width: 120, left: `${-160 + ((timeline * 0.27) % 1500)}px`, background: `linear-gradient(90deg, transparent, ${rgba(C.text, 0.038)}, transparent)`, transform: 'skewX(-15deg)', opacity: reveal}} />
    </Glass>
  );
};

const ProgressRing: React.FC<{progress: number; success: number; phase: number; timeline: number}> = ({progress, success, phase, timeline}) => {
  const radius = 98;
  const circumference = 2 * Math.PI * radius;
  const color = success > 0.75 ? C.mint : progress > 0.58 ? C.violet : C.cyan;
  return (
    <svg width="270" height="270" viewBox="0 0 270 270">
      <defs>
        <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor={C.cyan} /><stop offset=".5" stopColor={C.blue} /><stop offset=".8" stopColor={C.violet} /><stop offset="1" stopColor={C.mint} /></linearGradient>
        <filter id="progress-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <circle cx="135" cy="135" r="113" fill={rgba(color, 0.025)} stroke={rgba(color, 0.11)} strokeWidth="1" />
      <circle cx="135" cy="135" r={107 + Math.sin(phase * 2) * 1.5} fill="none" stroke={rgba(C.text, 0.06)} strokeWidth="2" strokeDasharray="3 9" strokeDashoffset={-timeline * 0.12} />
      <circle cx="135" cy="135" r={radius} fill="none" stroke="rgba(80,119,145,.17)" strokeWidth="12" />
      <circle cx="135" cy="135" r={radius} fill="none" stroke="url(#progress-gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} transform="rotate(-90 135 135)" filter="url(#progress-glow)" />
      {Array.from({length: 16}, (_, index) => {
        const angle = index / 16 * Math.PI * 2 + phase * 0.32;
        return <circle key={index} cx={135 + Math.cos(angle) * 77} cy={135 + Math.sin(angle) * 77} r={1.5 + (index % 3) * 0.35} fill={index % 2 ? C.cyan : C.violet} opacity={0.26 + progress * 0.36} />;
      })}
      {success < 0.72 ? (
        <>
          <text x="135" y="135" textAnchor="middle" fill={C.text} fontFamily={FONT} fontSize="57" fontWeight="900" fontVariant="tabular-nums">{Math.round(progress * 100)}%</text>
          <text x="135" y="165" textAnchor="middle" fill={C.muted} fontFamily={FONT} fontSize="11" fontWeight="760" letterSpacing=".8">TRANSFER</text>
        </>
      ) : (
        <>
          <circle cx="135" cy="135" r={53 + Math.sin(phase * 3) * 2} fill={rgba(C.mint, 0.08)} stroke={C.mint} strokeWidth="1.4" filter="url(#progress-glow)" />
          <path d="M105 135 L127 157 L166 113" fill="none" stroke={C.mint} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#progress-glow)" />
        </>
      )}
    </svg>
  );
};

const StatusRow: React.FC<{label: string; value: string; color: string; reveal: number; verified: boolean}> = ({label, value, color, reveal, verified}) => (
  <div style={{height: 66, borderRadius: 15, border: `1px solid ${rgba(color, 0.14)}`, background: rgba(color, 0.028), opacity: reveal, transform: `translateY(${(1 - reveal) * 8}px)`, fontFamily: FONT, position: 'relative'}}>
    <div style={{position: 'absolute', left: 14, top: 15}}>
      <div style={{fontSize: 9.5, color: C.dim, fontWeight: 800, letterSpacing: 0.64}}>{label}</div>
      <div style={{marginTop: 7, fontSize: 13, color: C.text, fontWeight: 850, letterSpacing: 0.42}}>{value}</div>
    </div>
    <div style={{position: 'absolute', right: 14, top: 21, width: 24, height: 24, borderRadius: 9, display: 'grid', placeItems: 'center', border: `1px solid ${rgba(verified ? C.mint : color, 0.28)}`, background: rgba(verified ? C.mint : color, 0.05)}}>
      {verified ? <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7 L5.5 10.5 L12 3.5" fill="none" stroke={C.mint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span style={{width: 6, height: 6, borderRadius: 6, background: color, boxShadow: `0 0 6px ${color}`}} />}
    </div>
  </div>
);

const ProgressPanel: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 48, 118, 840, 900);
  const transfer = p(timeline, 135, 745, soft) * 0.92;
  const verify = p(timeline, 725, 805, soft);
  const progress = Math.min(1, transfer + verify * 0.08);
  const success = p(timeline, 770, 825);
  const packetCount = Math.min(24, Math.round(progress * 24));
  const phaseLabel = timeline < 250 ? 'SCANNING FILES' : timeline < 470 ? 'ENCRYPTING DATA' : timeline < 700 ? 'UPLOADING ASSETS' : timeline < 790 ? 'VERIFYING INTEGRITY' : 'TRANSFER COMPLETE';
  return (
    <Glass x={1350} y={174} width={460} height={768} reveal={reveal} radius={31} accent={success > 0.8 ? C.mint : C.violet}>
      <div style={{position: 'absolute', left: 24, right: 24, top: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
        <div>
          <div style={{fontSize: 16.5, color: C.text, fontWeight: 880, letterSpacing: 0.68}}>TRANSFER PROGRESS</div>
          <div style={{marginTop: 6, fontSize: 10.5, color: C.muted, fontWeight: 720, letterSpacing: 0.57}}>REAL-TIME CONTINUITY STATUS</div>
        </div>
        <div style={{padding: '8px 10px', borderRadius: 10, border: `1px solid ${rgba(success > 0.85 ? C.mint : C.violet, 0.19)}`, background: rgba(success > 0.85 ? C.mint : C.violet, 0.045), color: success > 0.85 ? C.mint : C.violet, fontSize: 9.5, fontWeight: 850, letterSpacing: 0.52}}>{success > 0.85 ? 'VERIFIED' : 'LIVE'}</div>
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 72, height: 1, background: `linear-gradient(90deg, ${rgba(C.violet, 0.25)}, ${rgba(C.cyan, 0.14)}, transparent)`}} />
      <div style={{position: 'absolute', left: 95, top: 91}}><ProgressRing progress={progress} success={success} phase={phase} timeline={timeline} /></div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 372, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 12, color: success > 0.85 ? C.mint : C.cyan, fontWeight: 860, letterSpacing: 0.95}}>{phaseLabel}</div>
        <div style={{marginTop: 8, fontSize: 13, color: C.text, fontWeight: 760}}>{packetCount} / 24 PACKETS</div>
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 432, display: 'grid', gap: 10}}>
        <StatusRow label="TRANSFER LAYER" value="END-TO-END ENCRYPTED" color={C.cyan} reveal={life(timeline, 160, 215, 830, 900)} verified={timeline > 330} />
        <StatusRow label="PACKET INTEGRITY" value="CHECKSUM MONITORED" color={C.violet} reveal={life(timeline, 265, 320, 830, 900)} verified={timeline > 730} />
        <StatusRow label="CLOUD MIRROR" value="DESTINATION PROTECTED" color={C.mint} reveal={life(timeline, 430, 485, 830, 900)} verified={timeline > 790} />
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 27, height: 60, borderRadius: 15, border: `1px solid ${rgba(success > 0.8 ? C.mint : C.cyan, 0.17)}`, background: rgba(success > 0.8 ? C.mint : C.cyan, 0.035), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: FONT}}>
        <span style={{width: 8, height: 8, borderRadius: 8, background: success > 0.8 ? C.mint : C.cyan, boxShadow: `0 0 ${8 + Math.sin(phase * 4) * 2}px ${success > 0.8 ? C.mint : C.cyan}`}} />
        <span style={{fontSize: 11, color: success > 0.8 ? C.mint : C.muted, fontWeight: 830, letterSpacing: 0.6}}>{success > 0.8 ? 'ALL DATA VERIFIED AND PROTECTED' : 'SECURE CHANNELS OPERATING'}</span>
      </div>
    </Glass>
  );
};

const Footer: React.FC<{timeline: number}> = ({timeline}) => {
  const reveal = life(timeline, 690, 755, 818, 900);
  return (
    <div style={{position: 'absolute', left: 110, right: 110, bottom: 42, height: 34, opacity: reveal, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT}}>
      <span style={{fontSize: 10.5, color: C.muted, fontWeight: 740, letterSpacing: 0.61}}>ILLUSTRATIVE CLOUD MIGRATION · GENERIC SECURE WORKFLOW</span>
      <span style={{fontSize: 10.5, color: C.mint, fontWeight: 840, letterSpacing: 0.61}}>24 FILES SECURED · 100% VERIFIED</span>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = (frame / durationInFrames) * 900;
  const phase = (frame / durationInFrames) * Math.PI * 2;
  const master = life(timeline, 0, 48, 850, 900);
  const successPush = p(timeline, 760, 810) * (1 - p(timeline, 810, 850));
  const cameraX = Math.sin(phase) * 3.6 + Math.sin(phase * 2 + 0.4) * 1.1;
  const cameraY = Math.cos(phase * 1.35) * 2.5 - successPush * 2;
  const rotateX = Math.sin(phase + 0.5) * 0.09;
  const rotateY = Math.cos(phase * 0.88) * 0.16;
  const scale = 0.977 + p(timeline, 0, 820) * 0.011 + successPush * 0.005;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.bg}}>
      <Ambient timeline={timeline} phase={phase} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: master,
          transform: `perspective(4400px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        <Header timeline={timeline} phase={phase} />
        <Stage timeline={timeline} phase={phase} />
        <ProgressPanel timeline={timeline} phase={phase} />
        <Footer timeline={timeline} />
      </div>
    </AbsoluteFill>
  );
};
