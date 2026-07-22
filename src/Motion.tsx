import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const FRAMES_PER_SCENE = 60;

const COLORS = {
  ink: '#030509',
  paper: '#F5F7FF',
  muted: '#647083',
  cyan: '#58E8FF',
  blue: '#4C76FF',
  violet: '#8B73FF',
  lime: '#A4FF82',
  magenta: '#FF4FD8',
  red: '#FF4B5F',
};

const CLAMP = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const sans = 'Inter, Aptos, Helvetica Neue, Arial, sans-serif';
const serif = 'Georgia, Times New Roman, serif';
const mono = 'IBM Plex Mono, SFMono-Regular, Consolas, monospace';

const range = (
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
) =>
  interpolate(
    value,
    [inputStart, inputEnd],
    [outputStart, outputEnd],
    CLAMP,
  );

const seeded = (seed: string, min: number, max: number) =>
  min + random(seed) * (max - min);

const ARTICLE_LINES = [
  'Machine perception reshapes the language of modern industry',
  'Neural systems learn patterns across an expanding data universe',
  'Robotics and automation accelerate the next digital chapter',
  'Human insight meets computational speed in connected workflows',
  'Responsible models transform research design and communication',
  'Intelligent tools reveal signals hidden inside complex information',
  'New interfaces bring machine reasoning closer to everyday work',
  'Vision language and prediction converge across the global network',
];

const CODE_LINES = [
  'MODEL.STATUS      TRAINING_COMPLETE',
  'VISION.STREAM     08 CHANNELS ACTIVE',
  'TOKEN.CONTEXT     128K / OPTIMIZED',
  'DATA.PIPELINE     SIGNAL VERIFIED',
  'NEURAL.LAYERS     024 / SYNCHRONIZED',
  'INFERENCE.NODE    LATENCY 018.4 MS',
  'SAFETY.CHECK      ALIGNMENT ONLINE',
  'ROBOTICS.CORE     MOTION PLAN READY',
];

const CLOUD_WORDS = [
  'NEURAL NETWORKS',
  'ROBOTICS',
  'COMPUTER VISION',
  'LANGUAGE MODELS',
  'AUTOMATION',
  'DATA SCIENCE',
  'MACHINE LEARNING',
  'PREDICTION',
  'DEEP LEARNING',
  'ALGORITHMS',
  'GENERATIVE SYSTEMS',
  'RESEARCH',
  'FUTURE',
  'SYNTHESIS',
  'INDUSTRY 4.0',
  'PATTERN RECOGNITION',
];

const cloudPlacements = [
  {x: 120, y: 120, size: 38},
  {x: 540, y: 95, size: 25},
  {x: 1110, y: 115, size: 33},
  {x: 1510, y: 145, size: 45},
  {x: 225, y: 280, size: 26},
  {x: 695, y: 260, size: 45},
  {x: 1270, y: 275, size: 24},
  {x: 1580, y: 330, size: 32},
  {x: 115, y: 700, size: 42},
  {x: 485, y: 790, size: 28},
  {x: 1030, y: 770, size: 39},
  {x: 1510, y: 725, size: 25},
  {x: 170, y: 930, size: 24},
  {x: 680, y: 925, size: 36},
  {x: 1190, y: 940, size: 27},
  {x: 1580, y: 900, size: 39},
];

const meshNodes = Array.from({length: 38}, (_, index) => {
  let x = seeded(`mesh-x-${index}`, 105, 1815);
  let y = seeded(`mesh-y-${index}`, 105, 975);

  if (x > 500 && x < 1420 && y > 390 && y < 690) {
    y = y < 540 ? seeded(`mesh-up-${index}`, 190, 360) : seeded(`mesh-down-${index}`, 720, 900);
  }

  return {
    x,
    y,
    radius: seeded(`mesh-r-${index}`, 2.3, 6.8),
    depth: seeded(`mesh-d-${index}`, 0.25, 1),
  };
});

const BaseAtmosphere: React.FC<{frame: number}> = ({frame}) => {
  const driftX = Math.sin((frame / 900) * Math.PI * 2) * 38;
  const driftY = Math.cos((frame / 450) * Math.PI * 2) * 22;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: COLORS.ink}}>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background: `radial-gradient(circle at ${50 + driftX / 32}% ${48 + driftY / 24}%, rgba(76,118,255,0.15), transparent 36%), radial-gradient(circle at 12% 78%, rgba(255,79,216,0.07), transparent 28%), radial-gradient(circle at 88% 18%, rgba(88,232,255,0.08), transparent 30%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          backgroundImage:
            'linear-gradient(rgba(102,132,178,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(102,132,178,0.06) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          backgroundPosition: `${(frame * 0.14) % 96}px ${(frame * 0.08) % 96}px`,
          maskImage: 'radial-gradient(circle at center, black, transparent 82%)',
        }}
      />
    </AbsoluteFill>
  );
};

const SceneHeader: React.FC<{
  eyebrow: string;
  title: string;
  align?: 'left' | 'right';
  serifTitle?: boolean;
  accent: string;
  slot: number;
}> = ({eyebrow, title, align = 'left', serifTitle = false, accent, slot}) => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 58,
        left: align === 'left' ? 88 : undefined,
        right: align === 'right' ? 88 : undefined,
        textAlign: align,
        fontFamily: mono,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 4,
        color: accent,
        opacity: 0.82,
      }}
    >
      {eyebrow} / {String(slot + 1).padStart(2, '0')}
    </div>
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: align === 'left' ? 84 : undefined,
        right: align === 'right' ? 84 : undefined,
        textAlign: align,
        fontFamily: serifTitle ? serif : sans,
        fontSize: serifTitle ? 57 : 52,
        fontWeight: serifTitle ? 600 : 790,
        letterSpacing: serifTitle ? -2 : -1,
        color: COLORS.paper,
        opacity: 0.7,
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </div>
    <div
      style={{
        position: 'absolute',
        top: 151,
        left: 84,
        right: 84,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}88 18%, rgba(255,255,255,0.15) 50%, ${accent}55 82%, transparent)`,
      }}
    />
  </>
);

const CyberScene: React.FC<{frame: number; variant: number; slot: number}> = ({
  frame,
  variant,
  slot,
}) => {
  const local = frame % FRAMES_PER_SCENE;
  const drift = range(local, 0, 59, 0, -42 - variant * 8);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SceneHeader
        eyebrow="ANALYSIS · REPORTS"
        title={variant === 0 ? 'CYBER BUSINESS' : variant === 1 ? 'INTELLIGENT SYSTEMS' : 'FUTURE NETWORK'}
        accent={COLORS.cyan}
        slot={slot}
      />
      {[0, 1, 2].map((column) => (
        <div
          key={column}
          style={{
            position: 'absolute',
            top: 188,
            bottom: 170,
            left: 62 + column * 616,
            width: 566,
            borderLeft: '1px solid rgba(129,155,196,0.12)',
            borderRight: '1px solid rgba(129,155,196,0.07)',
            background: column === 1 ? 'rgba(18,26,40,0.15)' : 'transparent',
          }}
        />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((row) => {
        const y = 202 + row * 114;
        const item = ARTICLE_LINES[(row + variant * 2) % ARTICLE_LINES.length];
        return (
          <div
            key={row}
            style={{
              position: 'absolute',
              top: y,
              left: -120 + drift * (row % 2 === 0 ? 1 : -0.65),
              width: 2260,
              height: 78,
              borderBottom: '1px solid rgba(125,151,190,0.11)',
              fontFamily: sans,
              fontSize: 51 + (row % 3) * 4,
              lineHeight: '72px',
              fontWeight: row % 3 === 1 ? 720 : 540,
              letterSpacing: -1.3,
              color: row % 2 === 0 ? '#6B7585' : '#414A58',
              opacity: 0.48,
              whiteSpace: 'nowrap',
            }}
          >
            {item} &nbsp; — &nbsp; {ARTICLE_LINES[(row + 3) % ARTICLE_LINES.length]}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          bottom: 84,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: mono,
          fontSize: 15,
          letterSpacing: 2.8,
          color: COLORS.muted,
        }}
      >
        <span>GLOBAL SIGNAL / {83 + variant * 4}.7%</span>
        <span>CONNECTED INDUSTRY · AUTOMATION · RESEARCH</span>
      </div>
    </AbsoluteFill>
  );
};

const DigitalScene: React.FC<{frame: number; variant: number; slot: number}> = ({
  frame,
  variant,
  slot,
}) => {
  const local = frame % FRAMES_PER_SCENE;
  const pulse = 0.5 + Math.sin(frame * 0.12) * 0.5;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SceneHeader
        eyebrow="LIVE DATA · MODEL HEALTH"
        title={variant === 0 ? 'DIGITAL REPORT' : variant === 1 ? 'SYSTEM MONITOR' : 'MACHINE INDEX'}
        align="right"
        accent={COLORS.lime}
        slot={slot}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 190,
          width: 485,
          bottom: 116,
          padding: '30px 30px',
          border: '1px solid rgba(164,255,130,0.16)',
          background: 'linear-gradient(145deg, rgba(11,17,28,0.8), rgba(4,7,12,0.15))',
        }}
      >
        <div style={{fontFamily: mono, color: COLORS.lime, fontSize: 15, letterSpacing: 3}}>CORE TELEMETRY</div>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} style={{marginTop: 26}}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: mono,
                fontSize: 13,
                color: '#758297',
              }}
            >
              <span>{CODE_LINES[(index + variant) % CODE_LINES.length].split('     ')[0]}</span>
              <span>{String(76 + ((index * 7 + variant * 5) % 23)).padStart(2, '0')}%</span>
            </div>
            <div style={{height: 4, marginTop: 8, background: '#151D29', overflow: 'hidden'}}>
              <div
                style={{
                  height: '100%',
                  width: `${42 + ((index * 13 + variant * 11) % 53)}%`,
                  background: `linear-gradient(90deg, ${COLORS.blue}, ${index % 2 ? COLORS.lime : COLORS.cyan})`,
                  transform: `translateX(${range(local, 0, 18, -28, 0)}px)`,
                  boxShadow: `0 0 16px ${COLORS.cyan}55`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 82,
          top: 202,
          width: 1100,
          height: 260,
          borderTop: '1px solid rgba(88,232,255,0.22)',
          borderBottom: '1px solid rgba(88,232,255,0.12)',
        }}
      >
        <svg width="1100" height="260" viewBox="0 0 1100 260">
          <path
            d={`M0 190 ${Array.from({length: 24}, (_, i) => {
              const x = i * 48;
              const y = 130 + Math.sin(i * 0.72 + frame * 0.065) * (42 + variant * 8) + Math.sin(i * 1.9) * 18;
              return `L${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth="3"
            opacity="0.72"
          />
          <path
            d={`M0 214 ${Array.from({length: 24}, (_, i) => {
              const x = i * 48;
              const y = 154 + Math.cos(i * 0.6 + frame * 0.045) * 34;
              return `L${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke={COLORS.violet}
            strokeWidth="2"
            opacity="0.48"
          />
          {Array.from({length: 12}, (_, i) => (
            <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="260" stroke="#647083" strokeOpacity="0.1" />
          ))}
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 24,
            top: 20,
            fontFamily: mono,
            fontSize: 13,
            color: COLORS.cyan,
            opacity: 0.6 + pulse * 0.35,
            letterSpacing: 2,
          }}
        >
          SIGNAL FLOW / ACTIVE
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 630,
          right: 82,
          bottom: 110,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}
      >
        {['VISION', 'LANGUAGE', 'PLANNING', 'ROBOTICS'].map((label, index) => (
          <div
            key={label}
            style={{
              height: 178,
              padding: 20,
              border: '1px solid rgba(126,145,178,0.13)',
              background: 'rgba(10,15,24,0.56)',
            }}
          >
            <div style={{fontFamily: mono, fontSize: 13, letterSpacing: 2.5, color: '#748196'}}>{label}</div>
            <div style={{fontFamily: sans, marginTop: 16, fontSize: 48, fontWeight: 760, color: COLORS.paper}}>
              {84 + ((index * 4 + variant * 3) % 15)}<span style={{fontSize: 18, color: COLORS.cyan}}>%</span>
            </div>
            <div style={{fontFamily: mono, fontSize: 11, color: COLORS.muted, marginTop: 16}}>STATUS / NOMINAL</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const NeuralScene: React.FC<{frame: number; variant: number; slot: number}> = ({
  frame,
  variant,
  slot,
}) => {
  const sweep = (frame * 5.8 + variant * 140) % 2200 - 140;

  const positions = meshNodes.map((node, index) => ({
    ...node,
    x: node.x + Math.sin(frame * 0.025 + index * 1.7) * (5 + node.depth * 9),
    y: node.y + Math.cos(frame * 0.021 + index * 1.3) * (4 + node.depth * 7),
  }));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SceneHeader
        eyebrow="SYNAPTIC MAP · LIVE INFERENCE"
        title={variant === 0 ? 'AI LAB REPORT' : variant === 1 ? 'NEURAL ATLAS' : 'COGNITIVE SYSTEMS'}
        align="right"
        serifTitle
        accent={COLORS.violet}
        slot={slot}
      />
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="nodeGlow">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.35" stopColor={COLORS.cyan} />
            <stop offset="1" stopColor={COLORS.blue} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweepLine" x1="0" x2="1">
            <stop offset="0" stopColor={COLORS.cyan} stopOpacity="0" />
            <stop offset="0.5" stopColor={COLORS.cyan} stopOpacity="0.75" />
            <stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
          </linearGradient>
        </defs>
        {positions.map((node, index) => {
          const target = positions[(index * 7 + 5) % positions.length];
          return (
            <line
              key={`line-a-${index}`}
              x1={node.x}
              y1={node.y}
              x2={target.x}
              y2={target.y}
              stroke={index % 3 === 0 ? COLORS.violet : COLORS.cyan}
              strokeWidth={0.7 + node.depth * 0.8}
              strokeOpacity={0.08 + node.depth * 0.15}
            />
          );
        })}
        {positions.filter((_, index) => index % 2 === 0).map((node, index) => {
          const target = positions[(index * 5 + 13) % positions.length];
          return (
            <line
              key={`line-b-${index}`}
              x1={node.x}
              y1={node.y}
              x2={target.x}
              y2={target.y}
              stroke={COLORS.blue}
              strokeWidth="1"
              strokeDasharray="4 10"
              strokeOpacity="0.2"
            />
          );
        })}
        {positions.map((node, index) => {
          const flare = 0.72 + Math.sin(frame * 0.11 + index) * 0.28;
          return (
            <g key={`node-${index}`}>
              <circle cx={node.x} cy={node.y} r={node.radius * 4.2} fill="url(#nodeGlow)" opacity={0.14 * flare} />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={index % 5 === 0 ? COLORS.paper : index % 2 ? COLORS.cyan : COLORS.violet}
                opacity={0.42 + node.depth * 0.48}
              />
            </g>
          );
        })}
        <rect x={sweep} y="155" width="170" height="820" fill="url(#sweepLine)" opacity="0.11" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 84,
          top: 202,
          width: 255,
          fontFamily: mono,
          fontSize: 13,
          lineHeight: 2.15,
          letterSpacing: 1.3,
          color: '#6D7B90',
        }}
      >
        {CODE_LINES.slice(0, 6).map((line, index) => (
          <div key={line} style={{opacity: 0.45 + ((index + variant) % 3) * 0.16}}>{line}</div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 84,
          bottom: 84,
          width: 440,
          textAlign: 'right',
          fontFamily: mono,
          fontSize: 13,
          lineHeight: 1.8,
          color: COLORS.muted,
          letterSpacing: 1.5,
        }}
      >
        {positions.length} NODES / {positions.length * 2 - 1} CONNECTIONS<br />
        CONFIDENCE {(94.2 + variant * 1.7).toFixed(1)} / LATENCY 018 MS
      </div>
    </AbsoluteFill>
  );
};

const ReviewScene: React.FC<{frame: number; variant: number; slot: number}> = ({
  frame,
  variant,
  slot,
}) => {
  const local = frame % FRAMES_PER_SCENE;
  const offset = range(local, 0, 59, 0, variant % 2 === 0 ? -22 : 22);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SceneHeader
        eyebrow="SCIENCE · SOCIETY · DESIGN"
        title={variant === 0 ? 'TECHNOLOGY REVIEW' : variant === 1 ? 'RESEARCH QUARTERLY' : 'THE MACHINE ERA'}
        serifTitle
        accent={COLORS.magenta}
        slot={slot}
      />
      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          top: 192,
          height: 174,
          display: 'grid',
          gridTemplateColumns: '1.3fr 0.7fr 1fr',
          gap: 32,
        }}
      >
        {[
          ['01', 'Machines that learn from the world around them'],
          ['02', 'Designing trust into tomorrow’s intelligent tools'],
          ['03', 'A new creative language built from data and insight'],
        ].map(([number, copy], index) => (
          <div key={number} style={{borderTop: `3px solid ${index === variant ? COLORS.magenta : '#394253'}`, paddingTop: 18}}>
            <div style={{fontFamily: mono, fontSize: 13, color: COLORS.magenta, letterSpacing: 2}}>{number} / FIELD NOTE</div>
            <div style={{fontFamily: serif, fontSize: 31, lineHeight: 1.13, marginTop: 12, color: '#9CA5B4', opacity: 0.7}}>{copy}</div>
          </div>
        ))}
      </div>
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          style={{
            position: 'absolute',
            top: 696 + row * 76,
            left: -80 + offset * (row % 2 ? -1 : 1),
            width: 2200,
            height: 68,
            borderBottom: '1px solid rgba(154,164,181,0.11)',
            fontFamily: serif,
            fontSize: 48 + (row % 2) * 5,
            lineHeight: '62px',
            fontWeight: row % 2 ? 700 : 400,
            letterSpacing: -1.1,
            color: row === variant ? '#7F8794' : '#535B68',
            opacity: row === variant ? 0.62 : 0.4,
            whiteSpace: 'nowrap',
          }}
        >
          {ARTICLE_LINES[(row + 4 + variant) % ARTICLE_LINES.length]} &nbsp; ◆ &nbsp; {ARTICLE_LINES[(row + 1) % ARTICLE_LINES.length]}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: 82,
          bottom: 55,
          display: 'flex',
          gap: 10,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <div key={dot} style={{width: 7, height: 7, borderRadius: 10, background: dot === variant ? COLORS.magenta : '#4A5260'}} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CloudScene: React.FC<{frame: number; variant: number; slot: number}> = ({
  frame,
  variant,
  slot,
}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <SceneHeader
      eyebrow="EMERGING FIELDS · KEYWORD MAP"
      title={variant === 0 ? 'FUTURE INDEX' : variant === 1 ? 'MACHINE CULTURE' : 'INTELLIGENCE MAP'}
      align={variant % 2 ? 'right' : 'left'}
      accent={COLORS.cyan}
      slot={slot}
    />
    {cloudPlacements.map((placement, index) => {
      const word = CLOUD_WORDS[(index + variant * 5) % CLOUD_WORDS.length];
      const floatX = Math.sin(frame * 0.025 + index * 1.8) * (4 + (index % 3) * 3);
      const floatY = Math.cos(frame * 0.021 + index * 1.25) * (3 + (index % 4) * 2);
      const isBright = (index + variant) % 5 === 0;
      return (
        <div
          key={`${placement.x}-${word}`}
          style={{
            position: 'absolute',
            left: placement.x,
            top: placement.y,
            transform: `translate(${floatX}px, ${floatY}px)`,
            fontFamily: index % 4 === 0 ? serif : sans,
            fontSize: placement.size,
            fontWeight: index % 3 === 0 ? 760 : 520,
            letterSpacing: index % 4 === 0 ? -1 : 1.2,
            color: isBright ? COLORS.paper : index % 2 ? '#697386' : '#414A59',
            opacity: isBright ? 0.74 : 0.42,
            whiteSpace: 'nowrap',
          }}
        >
          {word}
        </div>
      );
    })}
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{position: 'absolute', inset: 0, opacity: 0.2}}>
      <ellipse cx="960" cy="540" rx="700" ry="340" fill="none" stroke={COLORS.cyan} strokeWidth="1" strokeDasharray="6 18" />
      <ellipse cx="960" cy="540" rx="520" ry="250" fill="none" stroke={COLORS.violet} strokeWidth="1" strokeDasharray="2 20" />
    </svg>
  </AbsoluteFill>
);

const ChangingScene: React.FC<{frame: number; slot: number}> = ({frame, slot}) => {
  const scene = slot % 5;
  const variant = Math.floor(slot / 5);

  if (scene === 0) return <CyberScene frame={frame} variant={variant} slot={slot} />;
  if (scene === 1) return <DigitalScene frame={frame} variant={variant} slot={slot} />;
  if (scene === 2) return <NeuralScene frame={frame} variant={variant} slot={slot} />;
  if (scene === 3) return <ReviewScene frame={frame} variant={variant} slot={slot} />;
  return <CloudScene frame={frame} variant={variant} slot={slot} />;
};

const RobotMascot: React.FC<{frame: number; slot: number}> = ({frame, slot}) => {
  const orbit = (frame / 900) * Math.PI * 2;
  const x = WIDTH / 2 + Math.cos(orbit) * 725;
  const y = HEIGHT / 2 + Math.sin(orbit) * 338 + Math.sin(frame * 0.07) * 6;
  const tilt = Math.sin(frame * 0.055) * 3.5;
  const blinkPhase = (frame + 17) % 174;
  const eyeHeight = blinkPhase > 165 ? 3 : 15;
  const local = frame % FRAMES_PER_SCENE;
  const wave = Math.sin(range(local, 10, 48, 0, Math.PI * 2));
  const leftArm = slot % 2 === 0 ? -18 + wave * 16 : -2 + wave * 5;
  const rightArm = slot % 2 === 1 ? 18 - wave * 16 : 3 - wave * 5;
  const antenna = Math.sin(frame * 0.14) * 4;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 110,
        top: y - 142,
        width: 220,
        height: 284,
        transform: `rotate(${tilt}deg)`,
        transformOrigin: '50% 60%',
        filter: 'drop-shadow(0 22px 28px rgba(0,0,0,0.5)) drop-shadow(0 0 18px rgba(88,232,255,0.16))',
        zIndex: 24,
      }}
    >
      <svg width="220" height="284" viewBox="0 0 240 310" overflow="visible">
        <defs>
          <linearGradient id="robotShell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F7FBFF" />
            <stop offset="0.5" stopColor="#DCE8F7" />
            <stop offset="1" stopColor="#8FA3BF" />
          </linearGradient>
          <linearGradient id="robotVisor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#172942" />
            <stop offset="1" stopColor="#07111F" />
          </linearGradient>
          <radialGradient id="robotGlow">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.3" stopColor={COLORS.cyan} />
            <stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`rotate(${antenna}, 120, 38)`}>
          <line x1="120" y1="49" x2="120" y2="19" stroke="#6E829F" strokeWidth="7" strokeLinecap="round" />
          <circle cx="120" cy="14" r="13" fill="url(#robotGlow)" opacity={0.85 + Math.sin(frame * 0.16) * 0.12} />
          <circle cx="120" cy="14" r="5" fill={COLORS.cyan} />
        </g>

        <g transform={`rotate(${leftArm}, 72, 201)`}>
          <rect x="43" y="190" width="37" height="81" rx="18" fill="#7185A1" />
          <circle cx="61" cy="273" r="19" fill="url(#robotShell)" />
          <circle cx="61" cy="273" r="7" fill={COLORS.cyan} opacity="0.72" />
        </g>
        <g transform={`rotate(${rightArm}, 168, 201)`}>
          <rect x="160" y="190" width="37" height="81" rx="18" fill="#7185A1" />
          <circle cx="179" cy="273" r="19" fill="url(#robotShell)" />
          <circle cx="179" cy="273" r="7" fill={COLORS.cyan} opacity="0.72" />
        </g>

        <rect x="72" y="175" width="96" height="104" rx="36" fill="url(#robotShell)" stroke="#FFFFFF" strokeOpacity="0.48" strokeWidth="2" />
        <rect x="92" y="200" width="56" height="42" rx="16" fill="#142339" />
        <path d="M106 221h28" stroke={COLORS.cyan} strokeWidth="5" strokeLinecap="round" opacity="0.9" />
        <circle cx="120" cy="255" r="6" fill={COLORS.violet} />

        <rect x="79" y="265" width="31" height="38" rx="14" fill="#667B98" />
        <rect x="130" y="265" width="31" height="38" rx="14" fill="#667B98" />
        <rect x="72" y="293" width="45" height="13" rx="7" fill="#DDE8F6" />
        <rect x="123" y="293" width="45" height="13" rx="7" fill="#DDE8F6" />

        <rect x="25" y="50" width="190" height="137" rx="59" fill="url(#robotShell)" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="3" />
        <rect x="48" y="73" width="144" height="91" rx="39" fill="url(#robotVisor)" />
        <path d="M64 97c25-19 78-25 112-2" fill="none" stroke="#8AB8E6" strokeOpacity="0.24" strokeWidth="7" strokeLinecap="round" />
        <rect x="78" y={111 + (15 - eyeHeight) / 2} width="21" height={eyeHeight} rx="8" fill={COLORS.cyan} />
        <rect x="141" y={111 + (15 - eyeHeight) / 2} width="21" height={eyeHeight} rx="8" fill={COLORS.cyan} />
        <circle cx="66" cy="145" r="8" fill="#FF8295" opacity="0.72" />
        <circle cx="174" cy="145" r="8" fill="#FF8295" opacity="0.72" />
        <path d="M104 143c10 8 22 8 32 0" fill="none" stroke="#BDEFFF" strokeWidth="4" strokeLinecap="round" />
        <rect x="16" y="91" width="17" height="51" rx="8" fill="#6E829F" />
        <rect x="207" y="91" width="17" height="51" rx="8" fill="#6E829F" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -28,
          width: 126,
          height: 10,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)',
          filter: 'blur(7px)',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
};

const GlitchOverlay: React.FC<{frame: number; slot: number}> = ({frame, slot}) => {
  const local = frame % FRAMES_PER_SCENE;
  const incoming = range(local, 0, 15, 1, 0);
  const outgoing = range(local, 52, 59, 0, 0.92);
  const burstCenter = 31 + ((slot * 7) % 12);
  const internalBurst = [3, 7, 12].includes(slot)
    ? Math.max(
        range(local, burstCenter - 2, burstCenter, 0, 0.58),
        range(local, burstCenter, burstCenter + 3, 0.58, 0),
      )
    : 0;
  const strength = Math.max(incoming, outgoing, internalBurst);
  const quantizedFrame = Math.floor(frame / 2);
  const jitter = seeded(`jitter-${quantizedFrame}`, -1, 1) * strength;

  if (strength < 0.015) return null;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 28,
        opacity: 0.98,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${jitter * 11}px)`,
          opacity: strength * 0.24,
          background: `repeating-linear-gradient(0deg, transparent 0 12px, ${COLORS.cyan} 13px 14px, transparent 15px 26px, ${COLORS.magenta}55 27px 29px, transparent 30px 45px)`,
          mixBlendMode: 'screen',
        }}
      />
      {Array.from({length: 18}, (_, index) => {
        const seed = `glitch-${quantizedFrame}-${index}`;
        const top = seeded(`${seed}-top`, 38, 1035);
        const height = seeded(`${seed}-height`, 2, 30);
        const left = seeded(`${seed}-left`, -130, 650);
        const width = seeded(`${seed}-width`, 360, 1640);
        const move = seeded(`${seed}-move`, -120, 120) * strength;
        const palette = [COLORS.cyan, COLORS.blue, COLORS.magenta, COLORS.lime, COLORS.red];
        const color = palette[index % palette.length];
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: left + move,
              width,
              height,
              background:
                index % 4 === 0
                  ? 'rgba(0,0,0,0.92)'
                  : `linear-gradient(90deg, transparent, ${color} 8%, rgba(245,247,255,0.7) 48%, ${color} 78%, transparent)`,
              opacity: strength * seeded(`${seed}-opacity`, 0.16, 0.7),
              boxShadow: index % 3 === 0 ? `8px 0 0 ${COLORS.red}66, -8px 0 0 ${COLORS.cyan}66` : undefined,
              filter: index % 5 === 0 ? 'blur(1px)' : undefined,
            }}
          />
        );
      })}
      {Array.from({length: 8}, (_, index) => (
        <div
          key={`copy-${index}`}
          style={{
            position: 'absolute',
            top: 80 + index * 125 + seeded(`copy-${quantizedFrame}-${index}`, -22, 22),
            left: -80 + seeded(`copy-x-${quantizedFrame}-${index}`, -50, 80) * strength,
            width: 2200,
            height: 28,
            overflow: 'hidden',
            fontFamily: index % 2 ? serif : sans,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 2,
            color: index % 3 === 0 ? COLORS.cyan : COLORS.paper,
            opacity: strength * 0.18,
            whiteSpace: 'nowrap',
            transform: `translateX(${seeded(`copy-shift-${quantizedFrame}-${index}`, -130, 130) * strength}px)`,
          }}
        >
          NEURAL SYSTEMS / MACHINE LEARNING / DATA / INTELLIGENCE / AUTOMATION / VISION / LANGUAGE
        </div>
      ))}
    </AbsoluteFill>
  );
};

const FrameFurniture: React.FC<{frame: number; slot: number}> = ({frame, slot}) => (
  <AbsoluteFill style={{pointerEvents: 'none', zIndex: 35}}>
    <div style={{position: 'absolute', left: 34, top: 34, width: 70, height: 70, borderLeft: '2px solid rgba(151,170,202,0.36)', borderTop: '2px solid rgba(151,170,202,0.36)'}} />
    <div style={{position: 'absolute', right: 34, top: 34, width: 70, height: 70, borderRight: '2px solid rgba(151,170,202,0.36)', borderTop: '2px solid rgba(151,170,202,0.36)'}} />
    <div style={{position: 'absolute', left: 34, bottom: 34, width: 70, height: 70, borderLeft: '2px solid rgba(151,170,202,0.36)', borderBottom: '2px solid rgba(151,170,202,0.36)'}} />
    <div style={{position: 'absolute', right: 34, bottom: 34, width: 70, height: 70, borderRight: '2px solid rgba(151,170,202,0.36)', borderBottom: '2px solid rgba(151,170,202,0.36)'}} />
    <div
      style={{
        position: 'absolute',
        right: 55,
        bottom: 43,
        fontFamily: mono,
        fontSize: 12,
        letterSpacing: 2.5,
        color: '#778296',
      }}
    >
      FRAME {String(frame).padStart(3, '0')} / SCENE {String(slot + 1).padStart(2, '0')}
    </div>
  </AbsoluteFill>
);

const CenterReadabilityVeil: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 1470,
      height: 188,
      transform: 'translate(-50%, -50%)',
      zIndex: 40,
      background:
        'linear-gradient(90deg, transparent 0%, rgba(3,5,9,0.82) 10%, rgba(3,5,9,0.97) 27%, rgba(3,5,9,0.99) 73%, rgba(3,5,9,0.82) 90%, transparent 100%)',
      borderTop: '1px solid rgba(136,155,190,0.15)',
      borderBottom: '1px solid rgba(136,155,190,0.15)',
      boxShadow: '0 0 75px rgba(0,0,0,0.72)',
      pointerEvents: 'none',
    }}
  />
);

const CenterLockedTitle: React.FC = () => (
  <AbsoluteFill
    style={{
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        width: 1330,
        height: 126,
        borderLeft: `3px solid ${COLORS.cyan}`,
        borderRight: `3px solid ${COLORS.violet}`,
        opacity: 0.68,
      }}
    />
    <div
      style={{
        fontFamily: sans,
        fontSize: 74,
        lineHeight: 1,
        fontWeight: 820,
        letterSpacing: 5.5,
        color: COLORS.paper,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        textShadow: '0 2px 0 rgba(255,255,255,0.08), 0 0 26px rgba(88,232,255,0.15), 0 8px 32px rgba(0,0,0,0.92)',
      }}
    >
      ARTIFICIAL INTELLIGENCE
    </div>
    <div
      style={{
        position: 'absolute',
        top: 'calc(50% + 70px)',
        fontFamily: mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 7,
        color: COLORS.cyan,
        opacity: 0.72,
        whiteSpace: 'nowrap',
      }}
    >
      MACHINE PERCEPTION · REASONING · CREATION
    </div>
  </AbsoluteFill>
);

const TextureOverlay: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none', zIndex: 60, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.18,
        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: -40,
        opacity: 0.055,
        transform: `translate(${(frame * 17) % 31}px, ${(frame * 11) % 29}px)`,
        backgroundImage:
          'radial-gradient(circle, white 0 0.7px, transparent 0.9px), radial-gradient(circle, white 0 0.6px, transparent 0.8px)',
        backgroundPosition: '0 0, 13px 17px',
        backgroundSize: '23px 19px, 29px 31px',
        mixBlendMode: 'screen',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.18) 72%, rgba(0,0,0,0.76) 110%)',
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const slotCount = Math.max(1, Math.round(durationInFrames / FRAMES_PER_SCENE));
  const slot = Math.min(slotCount - 1, Math.floor(frame / FRAMES_PER_SCENE));
  const local = frame % FRAMES_PER_SCENE;
  const sceneJitter = seeded(`scene-jitter-${Math.floor(frame / 2)}`, -1, 1);
  const glitchIn = range(local, 0, 12, 1, 0);
  const glitchOut = range(local, 53, 59, 0, 1);
  const sceneShake = Math.max(glitchIn, glitchOut) * sceneJitter * 7;
  const breathe = 1.008 + Math.sin((frame / 300) * Math.PI * 2) * 0.006;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink, overflow: 'hidden'}}>
      <BaseAtmosphere frame={frame} />
      <div
        style={{
          position: 'absolute',
          inset: -10,
          transform: `translateX(${sceneShake}px) scale(${breathe})`,
          transformOrigin: '50% 50%',
          zIndex: 10,
        }}
      >
        <ChangingScene frame={frame} slot={slot} />
      </div>
      <RobotMascot frame={frame} slot={slot} />
      <GlitchOverlay frame={frame} slot={slot} />
      <FrameFurniture frame={frame} slot={slot} />
      <CenterReadabilityVeil />
      <CenterLockedTitle />
      <TextureOverlay frame={frame} />
    </AbsoluteFill>
  );
};
