import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#07070b',
  bgWarm: '#121018',
  panel: '#11131a',
  panelWarm: '#191721',
  ivory: '#f4f0e8',
  muted: '#a6a4ad',
  dim: '#666776',
  line: '#34313d',
  gold: '#e6b86a',
  coral: '#ff776d',
  violet: '#a98cff',
  mint: '#7ae7c4',
  cyan: '#66d9ef',
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
const life = (frame: number, from: number, to: number, exitFrom = 840, exitTo = 900) =>
  p(frame, from, to) * (1 - p(frame, exitFrom, exitTo));

const rgba = (hex: string, alpha: number) => {
  const raw = hex.replace('#', '');
  const red = Number.parseInt(raw.slice(0, 2), 16);
  const green = Number.parseInt(raw.slice(2, 4), 16);
  const blue = Number.parseInt(raw.slice(4, 6), 16);
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
}> = ({x, y, width, height, reveal, children, radius = 26, accent = C.gold, style}) => (
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
      background:
        'linear-gradient(145deg, rgba(29,27,36,.92), rgba(12,13,19,.96) 58%, rgba(8,9,14,.98))',
      boxShadow:
        '0 34px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.065), inset 0 -1px 0 rgba(255,255,255,.018)',
      opacity: reveal,
      transform: `translate3d(0, ${(1 - reveal) * 20}px, 0) scale(${0.984 + reveal * 0.016})`,
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
        background: `linear-gradient(125deg, ${rgba(C.ivory, 0.045)}, transparent 28%, transparent 72%, ${rgba(accent, 0.035)})`,
      }}
    />
    {children}
  </div>
);

const Ambient: React.FC<{phase: number; timeline: number}> = ({phase, timeline}) => {
  const exit = 1 - p(timeline, 850, 900);
  const particles = Array.from({length: 46}, (_, index) => ({
    x: 44 + ((index * 173 + 79) % 1830),
    y: 36 + ((index * 107 + 61) % 1005),
    radius: 0.8 + (index % 4) * 0.42,
  }));
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${18 + Math.sin(phase) * 2}% ${35 + Math.cos(phase) * 2}%, ${rgba(C.coral, 0.11)}, transparent 33%), radial-gradient(circle at ${74 + Math.cos(phase * 0.8) * 2}% ${28 + Math.sin(phase) * 2}%, ${rgba(C.violet, 0.13)}, transparent 36%), radial-gradient(circle at 64% 82%, ${rgba(C.gold, 0.08)}, transparent 34%), linear-gradient(142deg, ${C.bg}, ${C.bgWarm} 54%, #050509)`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0, opacity: 0.32 * exit}}
      >
        <defs>
          <linearGradient id="terrain-line" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={C.coral} stopOpacity=".24" />
            <stop offset=".48" stopColor={C.violet} stopOpacity=".1" />
            <stop offset="1" stopColor={C.gold} stopOpacity=".2" />
          </linearGradient>
          <filter id="ambient-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        {Array.from({length: 12}, (_, index) => {
          const y = 126 + index * 72 + Math.sin(phase + index * 0.54) * 9;
          return (
            <path
              key={index}
              d={`M-90 ${y} C280 ${y - 118 + index * 2} 530 ${y + 110} 890 ${y - 18} S1510 ${y - 96} 2020 ${y + 28}`}
              fill="none"
              stroke="url(#terrain-line)"
              strokeWidth={index % 3 === 0 ? 1.2 : 0.7}
              strokeDasharray={index % 2 === 0 ? '3 13' : undefined}
              strokeDashoffset={-timeline * (0.08 + index * 0.002)}
              opacity={0.18 + (index % 4) * 0.035}
            />
          );
        })}
        <ellipse
          cx={860 + Math.sin(phase) * 10}
          cy={540 + Math.cos(phase) * 7}
          rx="390"
          ry="250"
          fill="none"
          stroke={C.violet}
          strokeOpacity=".08"
          strokeWidth="30"
          filter="url(#ambient-blur)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,.28) 0, rgba(255,255,255,.28) 1px, transparent 1px, transparent 5px)',
          mixBlendMode: 'soft-light',
        }}
      />
      {particles.map((particle, index) => {
        const color = index % 11 === 0 ? C.gold : index % 9 === 0 ? C.violet : C.ivory;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: particle.x + Math.sin(phase * (0.7 + (index % 3) * 0.16) + index) * 7,
              top: particle.y + Math.cos(phase * (0.8 + (index % 4) * 0.12) + index) * 6,
              width: particle.radius,
              height: particle.radius,
              borderRadius: 10,
              background: color,
              opacity: (0.045 + (index % 5) * 0.014) * exit,
              boxShadow: index % 11 === 0 ? `0 0 10px ${color}` : undefined,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 160px rgba(0,0,0,.58)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

const Header: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 8, 68, 850, 900);
  const ready = p(timeline, 680, 735);
  return (
    <div
      style={{
        position: 'absolute',
        left: 92,
        right: 92,
        top: 52,
        height: 82,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * -12}px)`,
        fontFamily: FONT,
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 15}}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            border: `1px solid ${rgba(C.gold, 0.35)}`,
            background: `radial-gradient(circle at 35% 28%, ${rgba(C.ivory, 0.16)}, ${rgba(C.gold, 0.08)} 42%, rgba(15,13,18,.8))`,
            boxShadow: `0 0 ${18 + Math.sin(phase * 2) * 3}px ${rgba(C.gold, 0.12)}`,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <path d="M16 3 L20 12 L29 16 L20 20 L16 29 L12 20 L3 16 L12 12Z" fill="none" stroke={C.gold} strokeWidth="1.5" />
            <circle cx="16" cy="16" r="4" fill={C.ivory} />
            <circle cx="16" cy="16" r="9.5" fill="none" stroke={C.violet} strokeWidth=".8" strokeDasharray="3 4" strokeDashoffset={-timeline * 0.1} />
          </svg>
        </div>
        <div>
          <div style={{fontSize: 22, color: C.ivory, fontWeight: 880, letterSpacing: 1.15}}>
            AI DECISION CASCADE
          </div>
          <div style={{marginTop: 7, fontSize: 12, color: C.muted, fontWeight: 720, letterSpacing: 0.76}}>
            STRATEGY SYNTHESIS · MULTI-SIGNAL RESPONSE
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 0, top: 7, display: 'flex', alignItems: 'center', gap: 12}}>
        <div
          style={{
            height: 40,
            padding: '0 15px',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            borderRadius: 13,
            border: `1px solid ${rgba(C.ivory, 0.1)}`,
            background: 'rgba(16,16,22,.58)',
            color: C.muted,
            fontSize: 11.5,
            fontWeight: 760,
            letterSpacing: 0.62,
          }}
        >
          PRIVATE SESSION
        </div>
        <div
          style={{
            height: 40,
            minWidth: 170,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            borderRadius: 13,
            border: `1px solid ${rgba(ready > 0.95 ? C.mint : C.gold, 0.26)}`,
            background: rgba(ready > 0.95 ? C.mint : C.gold, 0.055),
            color: ready > 0.95 ? C.mint : C.gold,
            fontSize: 11.5,
            fontWeight: 830,
            letterSpacing: 0.66,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 7,
              background: ready > 0.95 ? C.mint : C.gold,
              boxShadow: `0 0 ${8 + Math.sin(phase * 4) * 2}px ${ready > 0.95 ? C.mint : C.gold}`,
            }}
          />
          {ready > 0.95 ? 'SYNTHESIS READY' : 'ENGINE ONLINE'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: `linear-gradient(90deg, ${rgba(C.gold, 0.26)}, ${rgba(C.violet, 0.12)}, transparent 78%)`}} />
    </div>
  );
};

const SourceChip: React.FC<{label: string; color: string; index: number; timeline: number}> = ({label, color, index, timeline}) => {
  const reveal = life(timeline, 112 + index * 18, 158 + index * 18, 838, 900);
  const activity = 0.45 + Math.sin(timeline * 0.025 + index * 1.4) * 0.14;
  return (
    <div
      style={{
        height: 38,
        padding: '0 13px',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        border: `1px solid ${rgba(color, 0.2)}`,
        background: rgba(color, 0.045),
        color: C.ivory,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 8}px)`,
        fontSize: 11.5,
        fontWeight: 780,
        letterSpacing: 0.55,
      }}
    >
      <span style={{width: 7, height: 7, borderRadius: 7, background: color, boxShadow: `0 0 ${6 + activity * 5}px ${rgba(color, 0.8)}`}} />
      {label}
    </div>
  );
};

const SubmitButton: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const hover = p(timeline, 254, 286);
  const pressIn = p(timeline, 286, 298, soft);
  const pressOut = p(timeline, 298, 319, ease);
  const pressed = pressIn * (1 - pressOut);
  const submitted = p(timeline, 300, 330);
  const ripple = p(timeline, 300, 356, soft);
  const spinner = timeline > 315 && timeline < 370;
  const done = p(timeline, 365, 392);
  const scale = 1 + hover * 0.035 - pressed * 0.1 + pressOut * 0.025 - submitted * 0.015;
  return (
    <div style={{position: 'absolute', right: 34, bottom: 34, width: 92, height: 92}}>
      {[0, 1].map((index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: 46,
            top: 46,
            width: 86,
            height: 86,
            marginLeft: -43,
            marginTop: -43,
            borderRadius: 50,
            border: `1.5px solid ${rgba(index ? C.violet : C.gold, (1 - ripple) * 0.6)}`,
            opacity: ripple,
            transform: `scale(${0.75 + ripple * (1.35 + index * 0.42)})`,
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
          background: `radial-gradient(circle at 35% 25%, ${rgba(C.ivory, 0.24)}, ${rgba(C.gold, 0.22 + hover * 0.08)} 35%, ${rgba(C.coral, 0.09)} 100%)`,
          border: `1px solid ${rgba(done > 0.9 ? C.mint : C.gold, 0.5 + hover * 0.22)}`,
          boxShadow: `0 0 ${18 + hover * 26 + submitted * 18}px ${rgba(done > 0.9 ? C.mint : C.gold, 0.14 + hover * 0.12)}, inset 0 1px 0 rgba(255,255,255,.13)`,
          transform: `scale(${scale})`,
        }}
      >
        {!spinner && done < 0.85 ? (
          <svg width="38" height="38" viewBox="0 0 38 38">
            <path d="M8 19 H28 M21 11 L29 19 L21 27" fill="none" stroke={C.ivory} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
        {spinner ? (
          <svg width="42" height="42" viewBox="0 0 42 42" style={{transform: `rotate(${timeline * 2.8}deg)`}}>
            <circle cx="21" cy="21" r="14" fill="none" stroke={rgba(C.gold, 0.17)} strokeWidth="3" />
            <path d="M21 7 A14 14 0 0 1 35 21" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : null}
        {done >= 0.85 ? (
          <svg width="36" height="36" viewBox="0 0 36 36">
            <path d="M9 18 L15 24 L28 11" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          left: -50,
          top: 108,
          width: 190,
          textAlign: 'center',
          color: done > 0.9 ? C.mint : C.muted,
          fontSize: 11.5,
          fontWeight: 790,
          letterSpacing: 0.7,
          opacity: 0.9,
        }}
      >
        {done > 0.9 ? 'REQUEST SENT' : spinner ? 'SYNTHESIZING' : 'SUBMIT BRIEF'}
      </div>
      <div
        style={{
          position: 'absolute',
          left: interpolate(p(timeline, 246, 286), [0, 1], [-220, 34]),
          top: interpolate(p(timeline, 246, 286), [0, 1], [132, 57]),
          width: 34,
          height: 42,
          opacity: life(timeline, 238, 258, 320, 340),
          transform: `translate(${pressed * 3}px, ${pressed * 3}px) scale(${0.96 - pressed * 0.08})`,
          filter: 'drop-shadow(0 5px 8px rgba(0,0,0,.48))',
        }}
      >
        <svg width="34" height="42" viewBox="0 0 34 42">
          <path d="M4 3 L29 24 L18 26 L12 38 Z" fill={C.ivory} stroke="#24222a" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const PromptPanel: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 34, 104, 838, 900);
  const typing = p(timeline, 78, 258);
  const prompt = 'Build a resilient growth plan from these signals';
  const typed = prompt.slice(0, Math.floor(prompt.length * typing));
  const cursorVisible = typing < 0.995 && Math.floor(timeline / 17) % 2 === 0;
  const submitted = p(timeline, 298, 338);
  return (
    <Glass x={92} y={166} width={640} height={758} reveal={reveal} radius={30} accent={C.gold}>
      <div style={{position: 'absolute', left: 34, right: 34, top: 30, fontFamily: FONT}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div>
            <div style={{fontSize: 13, color: C.gold, fontWeight: 850, letterSpacing: 1.12}}>STRATEGY REQUEST</div>
            <div style={{marginTop: 7, fontSize: 11.5, color: C.muted, fontWeight: 690, letterSpacing: 0.52}}>SYNTHESIZE A DECISION-READY RESPONSE</div>
          </div>
          <div style={{padding: '8px 11px', borderRadius: 10, border: `1px solid ${rgba(C.ivory, 0.1)}`, color: C.dim, fontSize: 10.5, fontWeight: 760, letterSpacing: 0.55}}>NEW BRIEF</div>
        </div>
        <div style={{display: 'flex', gap: 9, marginTop: 27}}>
          <SourceChip label="FINANCE" color={C.gold} index={0} timeline={timeline} />
          <SourceChip label="CUSTOMER" color={C.violet} index={1} timeline={timeline} />
          <SourceChip label="OPERATIONS" color={C.mint} index={2} timeline={timeline} />
        </div>
        <div style={{marginTop: 34, fontSize: 11, color: C.dim, fontWeight: 820, letterSpacing: 0.9}}>YOUR BRIEF</div>
        <div
          style={{
            marginTop: 18,
            width: 540,
            minHeight: 150,
            color: C.ivory,
            fontSize: 34,
            lineHeight: 1.34,
            fontWeight: 660,
            letterSpacing: -0.38,
          }}
        >
          {typed}
          <span
            style={{
              display: 'inline-block',
              marginLeft: 5,
              width: 2,
              height: 35,
              verticalAlign: -6,
              borderRadius: 3,
              background: C.gold,
              opacity: cursorVisible ? 1 : 0.2,
              boxShadow: `0 0 10px ${C.gold}`,
            }}
          />
        </div>
        <div style={{marginTop: 20, height: 1, background: `linear-gradient(90deg, ${rgba(C.gold, 0.25)}, ${rgba(C.violet, 0.13)}, transparent)`}} />
        <div style={{marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
          {[
            ['TIME HORIZON', '90 DAYS', C.gold],
            ['RESPONSE MODE', '4 PRIORITIES', C.violet],
            ['SIGNALS READY', '18 SOURCES', C.mint],
            ['CONFIDENCE GATE', 'ENABLED', C.cyan],
          ].map(([label, value, color], index) => {
            const itemReveal = life(timeline, 155 + index * 14, 205 + index * 14, 835, 900);
            return (
              <div
                key={label}
                style={{
                  height: 65,
                  padding: '13px 14px',
                  boxSizing: 'border-box',
                  borderRadius: 14,
                  border: `1px solid ${rgba(color, 0.13)}`,
                  background: rgba(color, 0.027),
                  opacity: itemReveal,
                  transform: `translateY(${(1 - itemReveal) * 8}px)`,
                }}
              >
                <div style={{fontSize: 9.8, color: C.dim, fontWeight: 790, letterSpacing: 0.68}}>{label}</div>
                <div style={{marginTop: 7, fontSize: 13, color, fontWeight: 850, letterSpacing: 0.56}}>{value}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 34,
          bottom: 47,
          color: submitted > 0.9 ? C.mint : C.dim,
          fontFamily: FONT,
          fontSize: 11.5,
          fontWeight: 760,
          letterSpacing: 0.66,
        }}
      >
        {submitted > 0.9 ? 'BRIEF DELIVERED TO AI ENGINE' : 'REVIEW SIGNALS, THEN SEND'}
      </div>
      <SubmitButton timeline={timeline} phase={phase} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 120,
          left: `${-150 + ((timeline * 0.28) % 920)}px`,
          background: `linear-gradient(90deg, transparent, ${rgba(C.gold, 0.045)}, transparent)`,
          transform: 'skewX(-14deg)',
          opacity: reveal,
        }}
      />
    </Glass>
  );
};

const PrismCore: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 250, 350, 832, 900);
  const active = p(timeline, 302, 375);
  const complete = p(timeline, 670, 730);
  const coreY = 520 + Math.sin(phase * 1.2) * 3;
  return (
    <div style={{position: 'absolute', left: 748, top: 174, width: 154, height: 744, opacity: reveal, fontFamily: FONT}}>
      <svg width="154" height="744" viewBox="0 0 154 744" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="prism-column" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={C.gold} stopOpacity="0" />
            <stop offset=".28" stopColor={C.gold} stopOpacity=".7" />
            <stop offset=".52" stopColor={C.violet} stopOpacity=".88" />
            <stop offset=".76" stopColor={C.mint} stopOpacity=".64" />
            <stop offset="1" stopColor={C.mint} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="prism-orb">
            <stop stopColor={C.ivory} stopOpacity=".95" />
            <stop offset=".18" stopColor={complete > 0.8 ? C.mint : C.gold} stopOpacity=".9" />
            <stop offset=".55" stopColor={C.violet} stopOpacity=".22" />
            <stop offset="1" stopColor={C.violet} stopOpacity="0" />
          </radialGradient>
          <filter id="prism-glow" x="-100%" y="-50%" width="300%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="prism-wide" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
        </defs>
        <line x1="77" y1="52" x2="77" y2="692" stroke="url(#prism-column)" strokeWidth={1.5 + active * 1.4} opacity={0.34 + active * 0.42} />
        <line x1="77" y1="86" x2="77" y2="664" stroke={C.ivory} strokeWidth="10" opacity={0.012 + active * 0.022} filter="url(#prism-wide)" />
        {Array.from({length: 9}, (_, index) => {
          const y = 74 + index * 74;
          const pulse = 0.4 + Math.sin(phase * 3 + index * 0.9) * 0.18;
          return (
            <g key={index} opacity={0.3 + active * 0.48}>
              <circle cx="77" cy={y} r={index === 4 ? 7 : 3.5} fill={index % 3 === 0 ? C.gold : index % 3 === 1 ? C.violet : C.mint} filter="url(#prism-glow)" />
              <circle cx="77" cy={y} r={12 + pulse * 3} fill="none" stroke={index % 3 === 0 ? C.gold : index % 3 === 1 ? C.violet : C.mint} strokeWidth=".7" opacity=".22" />
            </g>
          );
        })}
        <circle cx="77" cy={coreY - 174} r={54 + Math.sin(phase * 2) * 2} fill="url(#prism-orb)" opacity={0.72 + active * 0.25} filter="url(#prism-wide)" />
        <circle cx="77" cy={coreY - 174} r="42" fill={rgba(C.bg, 0.68)} stroke={complete > 0.8 ? C.mint : C.gold} strokeWidth="1.4" filter="url(#prism-glow)" />
        <path d={`M77 ${coreY - 204} L104 ${coreY - 189} L104 ${coreY - 159} L77 ${coreY - 144} L50 ${coreY - 159} L50 ${coreY - 189}Z`} fill={rgba(C.violet, 0.08)} stroke={C.ivory} strokeOpacity=".6" strokeWidth="1" />
        <circle cx="77" cy={coreY - 174} r="18" fill={complete > 0.8 ? rgba(C.mint, 0.16) : rgba(C.gold, 0.16)} stroke={complete > 0.8 ? C.mint : C.gold} strokeWidth="1" />
        {Array.from({length: 6}, (_, index) => {
          const angle = index / 6 * Math.PI * 2 + phase * 0.6;
          return <circle key={index} cx={77 + Math.cos(angle) * 30} cy={coreY - 174 + Math.sin(angle) * 30} r="2.4" fill={index % 2 ? C.violet : C.gold} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: -24, right: -24, top: 532, textAlign: 'center'}}>
        <div style={{fontSize: 11.5, color: complete > 0.9 ? C.mint : C.gold, fontWeight: 860, letterSpacing: 0.95}}>
          {complete > 0.9 ? '4 PRIORITIES READY' : 'AI ENGINE'}
        </div>
        <div style={{marginTop: 7, fontSize: 10.5, color: C.dim, fontWeight: 720, letterSpacing: 0.55}}>
          {complete > 0.9 ? 'SYNTHESIS COMPLETE' : active > 0.8 ? 'ROUTING SIGNALS' : 'AWAITING BRIEF'}
        </div>
      </div>
    </div>
  );
};

type Answer = {
  title: string;
  body: string;
  tag: string;
  color: string;
};

const ANSWERS: Answer[] = [
  {
    title: 'PROTECT RECURRING REVENUE',
    body: 'Focus on retention, renewal health, and high-value accounts.',
    tag: 'RETENTION',
    color: C.gold,
  },
  {
    title: 'EXPAND EFFICIENT CHANNELS',
    body: 'Scale acquisition where payback remains predictable.',
    tag: 'PAYBACK',
    color: C.coral,
  },
  {
    title: 'AUTOMATE CORE WORKFLOWS',
    body: 'Reduce cycle time while preserving quality controls.',
    tag: 'EFFICIENCY',
    color: C.violet,
  },
  {
    title: 'REBALANCE INVESTMENT',
    body: 'Move capital toward resilient, measurable opportunities.',
    tag: 'ALLOCATION',
    color: C.mint,
  },
];

const AnswerCard: React.FC<{
  answer: Answer;
  index: number;
  timeline: number;
  phase: number;
  start: number;
}> = ({answer, index, timeline, phase, start}) => {
  const reveal = life(timeline, start, start + 70, 826, 900);
  const content = p(timeline, start + 22, start + 92);
  const verified = p(timeline, start + 76, start + 122);
  const x = 912 + index * 18;
  const y = 172 + index * 168;
  const width = 880 - index * 18;
  const height = 142;
  const sheenX = -180 + ((timeline * 0.43 + index * 120) % (width + 300));
  return (
    <Glass
      x={x}
      y={y}
      width={width}
      height={height}
      reveal={reveal}
      radius={22}
      accent={answer.color}
      style={{
        clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0 round 22px)`,
        transform: `translate3d(${(1 - reveal) * 28}px, ${(1 - reveal) * 10}px, 0) scale(${0.99 + reveal * 0.01})`,
        boxShadow: `0 24px 70px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.055), 0 0 42px ${rgba(answer.color, 0.035)}`,
      }}
    >
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: `linear-gradient(180deg, ${answer.color}, ${rgba(answer.color, 0.2)})`, boxShadow: `0 0 16px ${rgba(answer.color, 0.38)}`}} />
      <div
        style={{
          position: 'absolute',
          left: 25,
          top: 31,
          width: 54,
          height: 54,
          borderRadius: 18,
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${rgba(answer.color, 0.32)}`,
          background: rgba(answer.color, 0.07),
          color: answer.color,
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          opacity: content,
          transform: `scale(${0.82 + content * 0.18}) rotate(${(1 - content) * -8}deg)`,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{position: 'absolute', left: 102, top: 25, right: 178, fontFamily: FONT, opacity: content, transform: `translateY(${(1 - content) * 10}px)`}}>
        <div style={{fontSize: 23, lineHeight: 1.1, color: C.ivory, fontWeight: 860, letterSpacing: 0.24}}>{answer.title}</div>
        <div style={{marginTop: 11, fontSize: 16.5, lineHeight: 1.25, color: C.muted, fontWeight: 560, letterSpacing: 0.05, whiteSpace: 'nowrap'}}>{answer.body}</div>
      </div>
      <div style={{position: 'absolute', right: 24, top: 25, width: 126, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 13, fontFamily: FONT, opacity: content}}>
        <div style={{padding: '7px 10px', borderRadius: 9, border: `1px solid ${rgba(answer.color, 0.2)}`, background: rgba(answer.color, 0.045), color: answer.color, fontSize: 10, fontWeight: 830, letterSpacing: 0.65}}>{answer.tag}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 7, color: verified > 0.92 ? C.mint : C.dim, fontSize: 10.5, fontWeight: 780, letterSpacing: 0.5}}>
          <span style={{width: 7, height: 7, borderRadius: 7, background: verified > 0.92 ? C.mint : C.dim, boxShadow: verified > 0.92 ? `0 0 ${8 + Math.sin(phase * 4 + index) * 2}px ${C.mint}` : undefined}} />
          {verified > 0.92 ? 'VERIFIED' : 'ANALYZING'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 102, right: 178, bottom: 18, height: 3, borderRadius: 3, background: rgba(answer.color, 0.08), overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${verified * 100}%`, background: `linear-gradient(90deg, ${answer.color}, ${rgba(answer.color, 0.34)})`, boxShadow: `0 0 10px ${rgba(answer.color, 0.48)}`}} />
      </div>
      <div style={{position: 'absolute', left: sheenX, top: -40, width: 110, height: 230, background: `linear-gradient(90deg, transparent, ${rgba(C.ivory, 0.045)}, transparent)`, transform: 'rotate(13deg)', opacity: reveal}} />
    </Glass>
  );
};

const Connectors: React.FC<{timeline: number}> = ({timeline}) => {
  const reveal = life(timeline, 306, 368, 827, 900);
  const answerStarts = [360, 444, 528, 612];
  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: reveal}}>
      <defs>
        <filter id="connector-glow" x="-40%" y="-80%" width="180%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d="M704 825 C760 825 775 735 825 695 C848 675 857 640 857 548" fill="none" stroke={C.gold} strokeWidth="1.4" strokeDasharray="4 10" strokeDashoffset={-timeline * 0.2} opacity=".45" />
      {ANSWERS.map((answer, index) => {
        const y = 243 + index * 168;
        const local = p(timeline, answerStarts[index] - 26, answerStarts[index] + 46);
        const x0 = 825;
        const x1 = 912 + index * 18;
        const travel = (timeline * 0.004 + index * 0.21) % 1;
        const particleX = x0 + (x1 - x0) * travel;
        const particleY = 520 + (y - 520) * travel + Math.sin(travel * Math.PI) * (index < 2 ? -22 : 22);
        return (
          <g key={answer.title} opacity={local}>
            <path d={`M${x0} 520 C${860 + index * 8} 520 ${870 + index * 14} ${y} ${x1} ${y}`} fill="none" stroke={answer.color} strokeWidth="1.25" strokeDasharray="3 8" strokeDashoffset={-timeline * 0.14} opacity=".42" />
            <circle cx={particleX} cy={particleY} r="3.8" fill={C.ivory} stroke={answer.color} strokeWidth="1.2" filter="url(#connector-glow)" />
          </g>
        );
      })}
    </svg>
  );
};

const Footer: React.FC<{timeline: number; phase: number}> = ({timeline, phase}) => {
  const reveal = life(timeline, 690, 755, 820, 900);
  const stages = [
    ['01', 'BRIEF CAPTURED', C.gold],
    ['02', 'SIGNALS ROUTED', C.violet],
    ['03', '4 PRIORITIES READY', C.mint],
  ];
  return (
    <div style={{position: 'absolute', left: 92, right: 92, bottom: 45, height: 56, opacity: reveal, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 12, height: 1, background: `linear-gradient(90deg, transparent, ${rgba(C.gold, 0.24)}, ${rgba(C.violet, 0.24)}, ${rgba(C.mint, 0.24)}, transparent)`}} />
      <div style={{position: 'absolute', left: 460, right: 460, top: 0, display: 'flex', justifyContent: 'space-between'}}>
        {stages.map(([number, label, color], index) => (
          <div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 170}}>
            <div style={{width: 25, height: 25, borderRadius: 25, display: 'grid', placeItems: 'center', background: C.bg, border: `1px solid ${rgba(color, 0.56)}`, color, fontSize: 9, fontWeight: 900, boxShadow: `0 0 ${10 + Math.sin(phase * 3 + index) * 2}px ${rgba(color, 0.2)}`}}>{number}</div>
            <div style={{marginTop: 8, color: C.muted, fontSize: 10.5, fontWeight: 790, letterSpacing: 0.62}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const timeline = (frame / durationInFrames) * 900;
  const phase = (frame / durationInFrames) * Math.PI * 2;
  const master = life(timeline, 0, 48, 850, 900);
  const clickPush = p(timeline, 276, 315) * (1 - p(timeline, 315, 390));
  const cameraX = Math.sin(phase) * 3.2 + clickPush * 3;
  const cameraY = Math.cos(phase * 1.4) * 2.3;
  const rotateX = Math.sin(phase + 0.5) * 0.07;
  const rotateY = Math.cos(phase * 0.9) * 0.11;
  const scale = 0.974 + p(timeline, 0, 810) * 0.012 + clickPush * 0.006;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.bg}}>
      <Ambient phase={phase} timeline={timeline} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: master,
          transform: `perspective(4200px) translate3d(${cameraX}px, ${cameraY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformOrigin: '50% 50%',
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        <Header timeline={timeline} phase={phase} />
        <PromptPanel timeline={timeline} phase={phase} />
        <Connectors timeline={timeline} />
        <PrismCore timeline={timeline} phase={phase} />
        {ANSWERS.map((answer, index) => (
          <AnswerCard
            key={answer.title}
            answer={answer}
            index={index}
            timeline={timeline}
            phase={phase}
            start={360 + index * 84}
          />
        ))}
        <Footer timeline={timeline} phase={phase} />
      </div>
    </AbsoluteFill>
  );
};
