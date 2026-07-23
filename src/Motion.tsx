import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const INK = '#000000';
const PAPER = '#eef4f3';
const MUTED = '#8f9b9c';
const ACCENT = '#88d9e7';
const WARM = '#b79a78';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type SceneProps = {
  localFrame: number;
  sceneFrames: number;
  sceneIndex: number;
};

const FineRule: React.FC<{
  width?: number | string;
  opacity?: number;
  color?: string;
}> = ({width = '100%', opacity = 0.24, color = PAPER}) => (
  <div
    style={{
      width,
      height: 1,
      backgroundColor: color,
      opacity,
    }}
  />
);

const Soft: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  blur?: number;
  style?: React.CSSProperties;
}> = ({children, opacity = 0.3, blur = 1.6, style}) => (
  <span
    style={{
      display: 'inline-block',
      color: PAPER,
      opacity,
      filter: `blur(${blur}px)`,
      ...style,
    }}
  >
    {children}
  </span>
);

const Focus: React.FC<{
  children?: React.ReactNode;
  compact?: boolean;
  underline?: boolean;
  style?: React.CSSProperties;
}> = ({
  children = 'ARTIFICIAL INTELLIGENCE',
  compact = false,
  underline = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const glow = 0.15 + Math.sin(frame * 0.11) * 0.04;

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        color: '#fbffff',
        fontWeight: 650,
        letterSpacing: compact ? '-0.02em' : '-0.025em',
        margin: compact ? 0 : '0 0.09em',
        filter: `drop-shadow(0 0 18px rgba(136,217,231,${glow}))`,
        zIndex: 2,
        ...style,
      }}
    >
      {children}
      {underline ? (
        <span
          style={{
            position: 'absolute',
            left: '3%',
            right: '3%',
            height: 2,
            bottom: -10,
            background:
              'linear-gradient(90deg, transparent, rgba(136,217,231,0.72), transparent)',
            boxShadow: '0 0 12px rgba(136,217,231,0.28)',
          }}
        />
      ) : null}
    </span>
  );
};

const EdgeData: React.FC<{sceneIndex: number}> = ({sceneIndex}) => {
  const labels = [
    'SYSTEMS / SOCIETY',
    'RESEARCH / MODELS',
    'LANGUAGE / VISION',
    'DATA / NETWORKS',
    'SECURITY / BUSINESS',
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 46,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          color: MUTED,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.2em',
          opacity: 0.6,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: ACCENT,
            boxShadow: '0 0 12px rgba(136,217,231,0.55)',
          }}
        />
        SIGNAL INDEX 07
      </div>
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 46,
          color: MUTED,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.19em',
          opacity: 0.52,
        }}
      >
        {labels[sceneIndex]}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          bottom: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          color: MUTED,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.18em',
          opacity: 0.5,
        }}
      >
        <span>VOL. 07</span>
        <FineRule />
        <span style={{whiteSpace: 'nowrap'}}>AI / DATA / AUTOMATION</span>
      </div>
    </>
  );
};

const EditorialScene: React.FC<SceneProps> = () => (
  <div style={{position: 'absolute', inset: 0}}>
    <div
      style={{
        position: 'absolute',
        left: 76,
        top: 116,
        color: PAPER,
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: 93,
        fontWeight: 600,
        letterSpacing: '-0.055em',
        opacity: 0.72,
        whiteSpace: 'nowrap',
      }}
    >
      THE INTELLIGENCE REVIEW
    </div>
    <div
      style={{
        position: 'absolute',
        left: 78,
        right: 78,
        top: 240,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <FineRule />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: MUTED,
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: 18,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          opacity: 0.56,
        }}
      >
        <span style={{color: WARM}}>●</span> RESEARCH
        <span style={{color: WARM}}>●</span> INDUSTRY
        <span style={{color: WARM}}>●</span> SOCIETY
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: -560,
        top: 358,
        width: 2220,
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: 72,
        lineHeight: 1.38,
        letterSpacing: '-0.035em',
        whiteSpace: 'nowrap',
      }}
    >
      <div>
        <Soft>HUMAN SYSTEMS EVOLVE AS </Soft>
        <Focus>ARTIFICIAL INTELLIGENCE</Focus>
        <Soft> RESHAPES DECISIONS</Soft>
      </div>
      <div style={{transform: 'translateX(-46px)'}}>
        <Soft opacity={0.22}>ACROSS SCIENCE, MEDICINE AND MODERN PRODUCTION</Soft>
      </div>
      <div style={{transform: 'translateX(42px)'}}>
        <Soft opacity={0.18} blur={2.2}>
          RESPONSIBLE MODELS TURN COMPLEX DATA INTO USEFUL INSIGHT
        </Soft>
      </div>
      <div style={{transform: 'translateX(-20px)'}}>
        <Soft opacity={0.14} blur={2.6} style={{fontStyle: 'italic'}}>
          AUTOMATION AND HUMAN CREATIVITY MOVE FORWARD TOGETHER
        </Soft>
      </div>
    </div>
  </div>
);

const ReportScene: React.FC<SceneProps> = () => (
  <div style={{position: 'absolute', inset: 0}}>
    <div
      style={{
        position: 'absolute',
        right: 82,
        top: 118,
        textAlign: 'right',
        fontFamily: 'Georgia, Times New Roman, serif',
        color: PAPER,
      }}
    >
      <div
        style={{
          fontSize: 88,
          lineHeight: 0.88,
          letterSpacing: '-0.045em',
          opacity: 0.66,
        }}
      >
        AI REPORT
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.24em',
          color: ACCENT,
          opacity: 0.72,
        }}
      >
        MACHINE INTELLIGENCE / FIELD NOTES
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: -70,
        top: 310,
        width: 2120,
        textAlign: 'center',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: 76,
        lineHeight: 1.45,
        letterSpacing: '-0.035em',
        whiteSpace: 'nowrap',
      }}
    >
      <div>
        <Soft opacity={0.2} blur={2.1}>
          COMPLEX ENGINEERING, MEDICINE, TECHNOLOGY
        </Soft>
      </div>
      <div>
        <Soft>ADVANCED </Soft>
        <Focus>ARTIFICIAL INTELLIGENCE</Focus>
        <Soft> PRODUCTS</Soft>
      </div>
      <div>
        <Soft opacity={0.22}>CREATING IMAGES, FORECASTS AND NEW TOOLS</Soft>
      </div>
      <div>
        <Soft opacity={0.17} blur={2.4} style={{fontStyle: 'italic'}}>
          DIALOGUE IN THE NATURAL LANGUAGE
        </Soft>
      </div>
    </div>
    <div style={{position: 'absolute', left: 460, right: 460, top: 850}}>
      <FineRule opacity={0.16} />
    </div>
  </div>
);

const DigitalScene: React.FC<SceneProps> = () => (
  <div style={{position: 'absolute', inset: 0}}>
    <div
      style={{
        position: 'absolute',
        left: 78,
        right: 78,
        top: 118,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div>
        <div
          style={{
            color: ACCENT,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.28em',
            opacity: 0.68,
          }}
        >
          EMERGING SYSTEMS
        </div>
        <div
          style={{
            color: MUTED,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            marginTop: 16,
            opacity: 0.52,
          }}
        >
          VISION / LANGUAGE / COMPUTATION
        </div>
      </div>
      <div
        style={{
          color: PAPER,
          fontSize: 74,
          fontWeight: 800,
          letterSpacing: '-0.055em',
          lineHeight: 0.85,
          opacity: 0.66,
        }}
      >
        DIGITAL REPORT
      </div>
    </div>
    <div style={{position: 'absolute', left: 78, right: 78, top: 230}}>
      <FineRule opacity={0.22} />
    </div>
    <div
      style={{
        position: 'absolute',
        left: -115,
        top: 310,
        width: 2200,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 66,
        fontWeight: 760,
        lineHeight: 1.34,
        letterSpacing: '-0.035em',
        whiteSpace: 'nowrap',
      }}
    >
      <div>
        <Soft opacity={0.2}>NEURAL NETWORKS ANALYZE LARGE DATA STREAMS</Soft>
      </div>
      <div style={{transform: 'translateX(-34px)'}}>
        <Soft opacity={0.23}>SPEECH RECOGNITION AND NATURAL LANGUAGE</Soft>
      </div>
      <div style={{transform: 'translateX(72px)'}}>
        <Soft>NEW LEVELS OF </Soft>
        <Focus style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
          ARTIFICIAL INTELLIGENCE
        </Focus>
      </div>
      <div style={{transform: 'translateX(-18px)'}}>
        <Soft opacity={0.22}>MACHINE LEARNING AND RESPONSIBLE DATA GROWTH</Soft>
      </div>
      <div style={{transform: 'translateX(32px)'}}>
        <Soft opacity={0.16} blur={2.5}>
          NEW CAPABILITIES FOR BUSINESS, SCIENCE AND CULTURE
        </Soft>
      </div>
    </div>
  </div>
);

const cloudWords = [
  {text: 'ENERGY', x: 170, y: 218, size: 35, opacity: 0.27, serif: true},
  {text: 'CYBER', x: 420, y: 170, size: 43, opacity: 0.38, serif: true},
  {text: 'ADVANCED', x: 670, y: 205, size: 31, opacity: 0.3, serif: false},
  {text: 'MODERN', x: 1490, y: 174, size: 38, opacity: 0.34, serif: true},
  {text: 'ENGINEERING', x: 98, y: 342, size: 34, opacity: 0.29, serif: false},
  {text: 'SELF-DRIVING', x: 420, y: 310, size: 48, opacity: 0.37, serif: true},
  {text: 'NEW', x: 1208, y: 290, size: 42, opacity: 0.37, serif: false},
  {text: 'ALGORITHMS', x: 1480, y: 324, size: 39, opacity: 0.27, serif: true},
  {text: 'DEEP LEARNING', x: 130, y: 462, size: 39, opacity: 0.31, serif: true},
  {text: 'NEURAL NETWORKS', x: 560, y: 410, size: 58, opacity: 0.47, serif: true},
  {text: 'CHATBOT', x: 1510, y: 448, size: 41, opacity: 0.3, serif: true},
  {text: 'DIGITAL', x: 160, y: 680, size: 36, opacity: 0.29, serif: false},
  {text: 'INDUSTRY 4.0', x: 410, y: 720, size: 54, opacity: 0.38, serif: true},
  {text: 'MACHINE LEARNING', x: 1160, y: 692, size: 41, opacity: 0.31, serif: true},
  {text: 'SCIENCE', x: 126, y: 820, size: 36, opacity: 0.24, serif: true},
  {text: 'BUSINESS', x: 670, y: 846, size: 43, opacity: 0.38, serif: true},
  {text: 'TECHNOLOGY', x: 1040, y: 824, size: 47, opacity: 0.34, serif: true},
  {text: 'AUTOMATION', x: 320, y: 930, size: 34, opacity: 0.27, serif: true},
  {text: 'MEDICINE', x: 910, y: 945, size: 35, opacity: 0.27, serif: true},
  {text: 'ECONOMY', x: 1480, y: 900, size: 39, opacity: 0.27, serif: true},
];

const CloudScene: React.FC<SceneProps> = ({localFrame}) => (
  <div style={{position: 'absolute', inset: 0}}>
    {cloudWords.map((word, index) => {
      const drift = Math.sin(localFrame * 0.1 + index * 1.71) * 3;
      return (
        <div
          key={word.text}
          style={{
            position: 'absolute',
            left: word.x,
            top: word.y,
            transform: `translate3d(${drift}px, ${-drift * 0.35}px, 0)`,
            color: PAPER,
            opacity: word.opacity,
            filter: 'blur(0.8px)',
            fontFamily: word.serif
              ? 'Georgia, Times New Roman, serif'
              : 'Arial, Helvetica, sans-serif',
            fontSize: word.size,
            fontWeight: word.serif ? 500 : 730,
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          {word.text}
        </div>
      );
    })}
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: 560,
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: 82,
        zIndex: 4,
      }}
    >
      <Focus>ARTIFICIAL INTELLIGENCE</Focus>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 553,
        top: 653,
        width: 814,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: ACCENT,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.23em',
        opacity: 0.54,
      }}
    >
      <FineRule color={ACCENT} opacity={0.54} />
      <span style={{whiteSpace: 'nowrap'}}>CONNECTED KNOWLEDGE</span>
      <FineRule color={ACCENT} opacity={0.54} />
    </div>
  </div>
);

const BusinessScene: React.FC<SceneProps> = () => (
  <div style={{position: 'absolute', inset: 0}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 104,
        height: 116,
        background:
          'linear-gradient(90deg, rgba(238,244,243,0.06), rgba(238,244,243,0.17), rgba(238,244,243,0.06))',
        borderTop: '1px solid rgba(238,244,243,0.15)',
        borderBottom: '1px solid rgba(238,244,243,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 80px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          color: PAPER,
          fontSize: 74,
          fontWeight: 820,
          letterSpacing: '-0.055em',
          opacity: 0.67,
        }}
      >
        Cyber Business
      </div>
      <div
        style={{
          color: MUTED,
          fontSize: 13,
          fontWeight: 750,
          letterSpacing: '0.2em',
          opacity: 0.54,
        }}
      >
        INFORMATION / SECURITY / MARKETS
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: 252,
        color: MUTED,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 16,
        fontWeight: 760,
        letterSpacing: '0.16em',
        opacity: 0.5,
      }}
    >
      NEWS · ANALYSIS · REPORTS
    </div>
    <div
      style={{
        position: 'absolute',
        left: -32,
        top: 374,
        width: 2050,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 61,
        fontWeight: 760,
        lineHeight: 1.37,
        letterSpacing: '-0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      <div>
        <Soft>HOW WILL </Soft>
        <Focus style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
          ARTIFICIAL INTELLIGENCE
        </Focus>
        <Soft> CHANGE</Soft>
      </div>
      <div style={{transform: 'translateX(54px)'}}>
        <Soft opacity={0.24}>TECHNOLOGY AND ROBOTICS IN THE NEXT DECADE?</Soft>
      </div>
      <div style={{transform: 'translateX(-40px)'}}>
        <Soft opacity={0.2} blur={2}>
          IMPACT ON WORK, SECURITY AND DIGITAL TRADE
        </Soft>
      </div>
      <div style={{transform: 'translateX(80px)'}}>
        <Soft opacity={0.15} blur={2.5} style={{fontStyle: 'italic'}}>
          THE FUTURE OF BUSINESS MOVES IN REAL TIME
        </Soft>
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        right: 84,
        bottom: 125,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        color: ACCENT,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.2em',
        opacity: 0.56,
      }}
    >
      REAL-TIME SIGNAL <span style={{fontSize: 18}}>↗</span>
    </div>
  </div>
);

const scenes: Array<React.FC<SceneProps>> = [
  EditorialScene,
  ReportScene,
  DigitalScene,
  CloudScene,
  BusinessScene,
];

const Texture: React.FC<{frame: number; progress: number}> = ({
  frame,
  progress,
}) => {
  const sweepY = ((frame * 7.4) % 1250) - 100;
  const glintX = ((frame * 3.1) % 2240) - 160;

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 51%, rgba(38,55,59,0.35) 0%, rgba(8,13,15,0.48) 42%, rgba(3,4,6,0.96) 88%)',
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0, opacity: 0.11}}
      >
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="3"
            seed="17"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.52" />
          </feComponentTransfer>
        </filter>
        <rect width="1920" height="1080" filter="url(#paper-grain)" />
      </svg>
      <AbsoluteFill
        style={{
          opacity: 0.11,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(220,246,248,0.16) 4px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: sweepY,
          height: 90,
          background:
            'linear-gradient(180deg, transparent, rgba(136,217,231,0.035), transparent)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: glintX,
          top: 0,
          bottom: 0,
          width: 180,
          transform: 'skewX(-13deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(238,244,243,0.018), transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 70,
          bottom: 76,
          width: 1780,
          height: 1,
          backgroundColor: 'rgba(238,244,243,0.1)',
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background:
              'linear-gradient(90deg, rgba(136,217,231,0.15), rgba(136,217,231,0.6))',
            boxShadow: '0 0 10px rgba(136,217,231,0.28)',
          }}
        />
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();

  // The reference cuts to a new typography plate every 11 frames at 30 fps.
  // Keeping this cadence proportional makes the rhythm identical at 60 fps.
  const sceneFrames = Math.max(1, fps * (11 / 30));
  const absoluteScene = Math.floor(frame / sceneFrames);
  const sceneIndex = absoluteScene % scenes.length;
  const localFrame = frame - absoluteScene * sceneFrames;
  const Scene = scenes[sceneIndex];

  const sharpnessFrames = Math.min(4, sceneFrames * 0.22);
  const sharpness = interpolate(
    localFrame,
    [0, sharpnessFrames],
    [0, 1],
    {...clamp, easing: Easing.out(Easing.cubic)},
  );
  const pageScale = interpolate(
    localFrame,
    [0, Math.max(1, sceneFrames - 1)],
    [1, 1.04],
    clamp,
  );
  const pageBlur = interpolate(sharpness, [0, 1], [2.6, 0.4], clamp);
  const progress = durationInFrames <= 1 ? 1 : frame / (durationInFrames - 1);

  const stageScale = Math.min(width / 1920, height / 1080);
  const stageLeft = (width - 1920 * stageScale) / 2;
  const stageTop = (height - 1080 * stageScale) / 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: stageLeft,
          top: stageTop,
          width: 1920,
          height: 1080,
          overflow: 'hidden',
          transform: `scale(${stageScale})`,
          transformOrigin: 'top left',
          backgroundColor: INK,
        }}
      >
        <Texture frame={frame} progress={progress} />

        <div
          style={{
            position: 'absolute',
            inset: -30,
            opacity: 0.86 + sharpness * 0.14,
            filter: `blur(${pageBlur}px) contrast(${1.02 + sharpness * 0.06})`,
            transform: `scale(${pageScale})`,
            transformOrigin: '50% 52%',
            willChange: 'transform, filter, opacity',
          }}
        >
          <Scene
            localFrame={localFrame}
            sceneFrames={sceneFrames}
            sceneIndex={sceneIndex}
          />
          <EdgeData sceneIndex={sceneIndex} />
        </div>

        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            boxShadow:
              'inset 0 0 190px rgba(0,0,0,0.82), inset 0 0 45px rgba(0,0,0,0.58)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
