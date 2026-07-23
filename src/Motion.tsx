import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const INK = '#070909';
const DEEP_INK = '#020303';
const PAPER = '#d8d7d1';
const BRIGHT = '#f1f0e9';
const MID = '#8f918c';
const WARM = '#a68c6b';
const CYAN = '#35dbe6';
const RED = '#ff355c';
const BLUE = '#4169ff';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const hash = (value: number) => {
  const sine = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return sine - Math.floor(sine);
};

type PageConfig = {
  masthead: string;
  section: string;
  issue: string;
  family: string;
  lineSize: number;
  lineWeight: number;
  italic?: boolean;
  accent: string;
  rows: [string, string, string, string];
  leadIn: string;
  leadOut: string;
  deck: string;
  byline: string;
  topics: [string, string, string, string];
};

type TitleVariant = {
  label: string;
  family: string;
  size: number;
  weight: number;
  italic?: boolean;
  tracking: string;
  scaleX: number;
  decoration?: 'rule' | 'double-rule' | 'small-caps';
};

const pages: PageConfig[] = [
  {
    masthead: 'Cyber Business',
    section: 'NEWS · ANALYSIS · REPORTS',
    issue: 'THURSDAY / VOL. 07 / NO. 24',
    family: 'Arial, Helvetica, sans-serif',
    lineSize: 48,
    lineWeight: 760,
    accent: '#628d8d',
    rows: [
      'INTELLIGENT SYSTEMS ARE REWRITING THE GLOBAL ECONOMY',
      'FROM RESEARCH LABS TO FACTORIES, A NEW ERA TAKES SHAPE',
      'HUMAN JUDGMENT REMAINS AT THE HEART OF RESPONSIBLE DESIGN',
      'DATA, SECURITY AND CULTURE NOW MOVE THROUGH ONE NETWORK',
    ],
    leadIn: 'THE RAPID RISE OF',
    leadOut: 'IS CHANGING HOW WE WORK',
    deck:
      'A field report on the models, people and institutions shaping the next industrial chapter.',
    byline: 'ANALYSIS DESK · GLOBAL TECHNOLOGY',
    topics: ['THE BIG PICTURE', 'WORK & INDUSTRY', 'TRUST & SAFETY', 'NEXT SIGNAL'],
  },
  {
    masthead: 'DIGITAL REPORT',
    section: 'VISION / LANGUAGE / COMPUTATION',
    issue: 'RESEARCH FILE 02 · SYSTEMS EDITION',
    family: 'Trebuchet MS, Arial, Helvetica, sans-serif',
    lineSize: 46,
    lineWeight: 700,
    accent: '#6e8487',
    rows: [
      'NEURAL SYSTEMS ANALYZE LANGUAGE, VISION AND COMPLEX DATA',
      'THE MACHINE LEARNS PATTERNS AT UNPRECEDENTED SCALE',
      'NEW CAPABILITIES MOVE FROM THE LAB INTO DAILY PRACTICE',
      'CLEAR GOVERNANCE TURNS COMPUTATION INTO USEFUL PROGRESS',
    ],
    leadIn: 'THE NEW LANGUAGE OF',
    leadOut: 'NOW CONNECTS EVERY FIELD',
    deck:
      'Inside the converging technologies that translate information into decisions, discoveries and tools.',
    byline: 'SYSTEMS EDITOR · MACHINE LEARNING',
    topics: ['LANGUAGE', 'COMPUTER VISION', 'REASONING', 'APPLICATIONS'],
  },
  {
    masthead: 'AI REPORT',
    section: 'MACHINE INTELLIGENCE / FIELD NOTES',
    issue: 'JOURNAL 07 · FUTURE SYSTEMS',
    family: 'Georgia, Times New Roman, serif',
    lineSize: 49,
    lineWeight: 500,
    italic: true,
    accent: WARM,
    rows: [
      'COMPLEX ENGINEERING TURNS INFORMATION INTO NEW KNOWLEDGE',
      'MODELS LEARN PATTERNS ACROSS LANGUAGE, SCIENCE AND DESIGN',
      'HUMAN QUESTIONS GUIDE THE NEXT GENERATION OF USEFUL TOOLS',
      'TRANSPARENT SYSTEMS MAKE AUTOMATED DECISIONS EASIER TO TRUST',
    ],
    leadIn: 'THE PUBLIC STORY OF',
    leadOut: 'IS STILL BEING WRITTEN',
    deck:
      'Researchers and communities define what intelligent tools should do, whom they serve and how they are judged.',
    byline: 'FIELD NOTES · SCIENCE & SOCIETY',
    topics: ['RESEARCH', 'PUBLIC LIFE', 'GOVERNANCE', 'DESIGN'],
  },
  {
    masthead: 'THE TECHNOLOGY REVIEW',
    section: 'RESEARCH · INDUSTRY · SOCIETY',
    issue: 'SPECIAL EDITION / JULY 2026',
    family: 'Georgia, Times New Roman, serif',
    lineSize: 47,
    lineWeight: 590,
    accent: '#9b8669',
    rows: [
      'HUMAN SYSTEMS EVOLVE AS COMPUTATION RESHAPES DECISIONS',
      'RESPONSIBLE MODELS TURN COMPLEX DATA INTO USEFUL INSIGHT',
      'SCIENCE, MEDICINE AND PRODUCTION ENTER A NEW DIGITAL ERA',
      'AUTOMATION AND HUMAN CREATIVITY MOVE FORWARD TOGETHER',
    ],
    leadIn: 'A PRACTICAL ERA OF',
    leadOut: 'HAS ALREADY BEGUN',
    deck:
      'Beyond the headline: how a general-purpose technology is becoming infrastructure for modern life.',
    byline: 'EDITORIAL BOARD · SPECIAL REPORT',
    topics: ['THE LAB', 'THE ECONOMY', 'THE HUMAN FACTOR', 'THE FUTURE'],
  },
  {
    masthead: 'NEW SYSTEMS INDEX',
    section: 'DATA / NETWORKS / AUTOMATION',
    issue: 'INDEX 05 · CONNECTED KNOWLEDGE',
    family: 'Courier New, Courier, monospace',
    lineSize: 43,
    lineWeight: 700,
    accent: '#718784',
    rows: [
      'CYBER · ROBOTICS · LANGUAGE · VISION · NEURAL NETWORKS',
      'SCIENCE · MEDICINE · ENERGY · BUSINESS · COMPUTATION',
      'ALGORITHMS · DATA · INDUSTRY 4.0 · DIGITAL CULTURE',
      'HUMAN DIRECTION · MACHINE SCALE · SHARED FUTURES',
    ],
    leadIn: 'THE ACTIVE INDEX OF',
    leadOut: 'EXPANDS IN REAL TIME',
    deck:
      'A live taxonomy of the disciplines, markets and public questions now converging around intelligent systems.',
    byline: 'SIGNAL INDEX · EDITION 05',
    topics: ['NETWORKS', 'KNOWLEDGE', 'AUTOMATION', 'CULTURE'],
  },
];

const titleVariants: TitleVariant[] = [
  {
    label: 'ARTIFICIAL INTELLIGENCE',
    family: 'Arial Black, Arial, Helvetica, sans-serif',
    size: 64,
    weight: 900,
    tracking: '-0.052em',
    scaleX: 0.84,
  },
  {
    label: 'ARTIFICIAL INTELLIGENCE',
    family: 'Trebuchet MS, Arial, Helvetica, sans-serif',
    size: 60,
    weight: 800,
    tracking: '-0.028em',
    scaleX: 0.91,
    decoration: 'rule',
  },
  {
    label: 'Artificial Intelligence',
    family: 'Times New Roman, Times, serif',
    size: 72,
    weight: 500,
    italic: true,
    tracking: '-0.047em',
    scaleX: 0.95,
  },
  {
    label: 'ARTIFICIAL INTELLIGENCE',
    family: 'Georgia, Times New Roman, serif',
    size: 61,
    weight: 700,
    tracking: '-0.047em',
    scaleX: 0.9,
    decoration: 'double-rule',
  },
  {
    label: 'ARTIFICIAL INTELLIGENCE',
    family: 'Courier New, Courier, monospace',
    size: 49,
    weight: 700,
    tracking: '-0.035em',
    scaleX: 1,
    decoration: 'small-caps',
  },
];

const storyCopy = [
  'Machine learning has moved from a specialist discipline into a general-purpose layer of modern production. The important story is no longer a single model, but the people, data and decisions surrounding every deployment.',
  'New systems can recognize patterns across language, images and complex streams of information. Their value depends on careful evaluation, clear limits and the expertise of the teams that put them to work.',
  'Public trust grows when automated decisions can be understood, questioned and improved. Governance is not separate from innovation; it is part of the engineering that makes useful systems durable.',
  'The next chapter will be measured by practical outcomes: better tools for science, medicine, education, security and creative work, guided by human judgment at every important boundary.',
];

const FineRule: React.FC<{
  color?: string;
  opacity?: number;
  vertical?: boolean;
}> = ({color = PAPER, opacity = 0.2, vertical = false}) => (
  <div
    style={{
      width: vertical ? 1 : '100%',
      height: vertical ? '100%' : 1,
      flexShrink: 0,
      backgroundColor: color,
      opacity,
    }}
  />
);

const MetaLabel: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  color?: string;
  opacity?: number;
}> = ({children, align = 'left', color = MID, opacity = 0.62}) => (
  <div
    style={{
      color,
      opacity,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '0.2em',
      lineHeight: 1.2,
      textAlign: align,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const PageHeader: React.FC<{pageIndex: number}> = ({pageIndex}) => {
  const page = pages[pageIndex];

  if (pageIndex === 0) {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 62,
            height: 142,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px',
            boxSizing: 'border-box',
            borderTop: '1px solid rgba(216,215,209,0.16)',
            borderBottom: '1px solid rgba(216,215,209,0.22)',
            background:
              'linear-gradient(90deg, rgba(216,215,209,0.035), rgba(216,215,209,0.105), rgba(216,215,209,0.035))',
          }}
        >
          <div
            style={{
              color: PAPER,
              opacity: 0.72,
              fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: '-0.06em',
            }}
          >
            {page.masthead}
          </div>
          <MetaLabel align="right">{page.section}</MetaLabel>
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, top: 224, display: 'flex', gap: 18}}>
          <MetaLabel color={page.accent}>{page.issue}</MetaLabel>
          <FineRule opacity={0.13} />
          <MetaLabel align="right">INDEPENDENT TECHNOLOGY JOURNAL</MetaLabel>
        </div>
      </>
    );
  }

  if (pageIndex === 1) {
    return (
      <>
        <div style={{position: 'absolute', left: 80, right: 80, top: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div>
            <MetaLabel color={page.accent}>EMERGING SYSTEMS</MetaLabel>
            <div style={{marginTop: 18}}>
              <MetaLabel>{page.issue}</MetaLabel>
            </div>
          </div>
          <div
            style={{
              color: PAPER,
              opacity: 0.7,
              fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: '-0.055em',
              lineHeight: 0.9,
            }}
          >
            {page.masthead}
          </div>
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, top: 204}}>
          <FineRule opacity={0.22} />
          <div style={{marginTop: 14, display: 'flex', justifyContent: 'space-between'}}>
            <MetaLabel>{page.section}</MetaLabel>
            <MetaLabel align="right">REPORT / 02</MetaLabel>
          </div>
        </div>
      </>
    );
  }

  if (pageIndex === 2) {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            right: 82,
            top: 75,
            color: PAPER,
            opacity: 0.72,
            textAlign: 'right',
            fontFamily: 'Georgia, Times New Roman, serif',
          }}
        >
          <div style={{fontSize: 91, lineHeight: 0.9, letterSpacing: '-0.057em'}}>{page.masthead}</div>
          <div style={{marginTop: 17}}>
            <MetaLabel align="right" color={page.accent}>{page.section}</MetaLabel>
          </div>
        </div>
        <div style={{position: 'absolute', left: 81, top: 85, height: 139, display: 'flex', gap: 18, alignItems: 'stretch'}}>
          <FineRule color={page.accent} opacity={0.44} vertical />
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <MetaLabel color={page.accent}>FIELD NOTES</MetaLabel>
            <MetaLabel>{page.issue}</MetaLabel>
            <MetaLabel>SCIENCE · CULTURE · POLICY</MetaLabel>
          </div>
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, top: 236}}><FineRule opacity={0.18} /></div>
      </>
    );
  }

  if (pageIndex === 3) {
    return (
      <>
        <div
          style={{
            position: 'absolute',
            left: 78,
            top: 75,
            color: PAPER,
            opacity: 0.72,
            fontFamily: 'Georgia, Times New Roman, serif',
            fontSize: 83,
            fontWeight: 600,
            letterSpacing: '-0.058em',
            whiteSpace: 'nowrap',
          }}
        >
          {page.masthead}
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, top: 197}}>
          <FineRule opacity={0.22} />
          <div style={{marginTop: 15, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24}}>
            <MetaLabel>{page.issue}</MetaLabel>
            <MetaLabel align="center" color={page.accent}>{page.section}</MetaLabel>
            <MetaLabel align="right">SPECIAL REPORT · 07</MetaLabel>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{position: 'absolute', left: 80, right: 80, top: 68, height: 129, display: 'grid', gridTemplateColumns: '1fr 170px 1fr', alignItems: 'center', borderTop: '1px solid rgba(216,215,209,0.18)', borderBottom: '1px solid rgba(216,215,209,0.2)'}}>
        <div>
          <MetaLabel color={page.accent}>SIGNAL / TAXONOMY / NEWSWIRE</MetaLabel>
          <div style={{marginTop: 17, color: PAPER, opacity: 0.67, fontFamily: 'Courier New, Courier, monospace', fontSize: 39, fontWeight: 700, letterSpacing: '-0.04em'}}>{page.masthead}</div>
        </div>
        <div style={{height: 82, borderLeft: '1px solid rgba(216,215,209,0.16)', borderRight: '1px solid rgba(216,215,209,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PAPER, opacity: 0.45, fontFamily: 'Georgia, serif', fontSize: 69}}>05</div>
        <div style={{textAlign: 'right'}}>
          <MetaLabel align="right">{page.issue}</MetaLabel>
          <div style={{marginTop: 19}}><MetaLabel align="right" color={page.accent}>{page.section}</MetaLabel></div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 220, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28}}>
        {page.topics.map((topic, index) => <MetaLabel key={topic} align={index === 0 ? 'left' : index === 3 ? 'right' : 'center'}>{`0${index + 1} · ${topic}`}</MetaLabel>)}
      </div>
    </>
  );
};

const EditorialLine: React.FC<{
  text: string;
  top: number;
  index: number;
  pageIndex: number;
  localFrame: number;
}> = ({text, top, index, pageIndex, localFrame}) => {
  const page = pages[pageIndex];
  const settle = interpolate(localFrame, [0, 6], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const direction = index % 2 === 0 ? -1 : 1;
  const offsets = [-54, 26, -22, 38];

  return (
    <div
      style={{
        position: 'absolute',
        left: offsets[index],
        top,
        width: 1920 - offsets[index] + 58,
        overflow: 'hidden',
        color: PAPER,
        opacity: (0.45 - index * 0.025) * (0.88 + settle * 0.12),
        fontFamily: page.family,
        fontSize: page.lineSize,
        fontWeight: page.lineWeight,
        fontStyle: page.italic && index % 2 === 1 ? 'italic' : 'normal',
        letterSpacing: pageIndex === 4 ? '-0.045em' : '-0.036em',
        lineHeight: 1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        transform: `translate3d(${direction * (1 - settle) * 15}px, 0, 0)`,
      }}
    >
      {text}
    </div>
  );
};

const InlineHeadline: React.FC<{
  pageIndex: number;
  localFrame: number;
}> = ({pageIndex, localFrame}) => {
  const page = pages[pageIndex];
  const variant = titleVariants[pageIndex];
  const settle = interpolate(localFrame, [0, 6], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        top: 540,
        height: 96,
        transform: 'translateY(-50%)',
        display: 'grid',
        gridTemplateColumns: '1fr 860px 1fr',
        columnGap: 18,
        alignItems: 'center',
        overflow: 'hidden',
        opacity: 0.9 + settle * 0.1,
      }}
    >
      <div
        style={{
          overflow: 'hidden',
          color: PAPER,
          opacity: 0.56,
          fontFamily: page.family,
          fontSize: pageIndex === 4 ? 28 : 34,
          fontWeight: page.lineWeight,
          fontStyle: page.italic ? 'italic' : 'normal',
          letterSpacing: pageIndex === 4 ? '-0.04em' : '-0.03em',
          lineHeight: 1,
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {page.leadIn}
      </div>

      <div
        style={{
          position: 'relative',
          height: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: BRIGHT,
          opacity: 0.94,
          overflow: 'visible',
        }}
      >
        {variant.decoration === 'rule' ? (
          <span style={{position: 'absolute', left: 116, right: 116, bottom: 10, height: 1, backgroundColor: page.accent, opacity: 0.52}} />
        ) : null}
        {variant.decoration === 'double-rule' ? (
          <>
            <span style={{position: 'absolute', left: 100, right: 100, top: 5, height: 1, backgroundColor: PAPER, opacity: 0.2}} />
            <span style={{position: 'absolute', left: 172, right: 172, bottom: 5, height: 1, backgroundColor: page.accent, opacity: 0.48}} />
          </>
        ) : null}
        {variant.decoration === 'small-caps' ? (
          <span style={{position: 'absolute', left: 58, right: 58, bottom: 7, borderBottom: `1px dotted ${page.accent}`, opacity: 0.46}} />
        ) : null}
        <span
          style={{
            display: 'inline-block',
            fontFamily: variant.family,
            fontSize: variant.size,
            fontWeight: variant.weight,
            fontStyle: variant.italic ? 'italic' : 'normal',
            fontVariantCaps: variant.decoration === 'small-caps' ? 'all-small-caps' : undefined,
            letterSpacing: variant.tracking,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            transform: `scaleX(${variant.scaleX}) scale(${1.012 - settle * 0.012})`,
            transformOrigin: '50% 50%',
          }}
        >
          {variant.label}
        </span>
      </div>

      <div
        style={{
          overflow: 'hidden',
          color: PAPER,
          opacity: 0.56,
          fontFamily: page.family,
          fontSize: pageIndex === 4 ? 28 : 34,
          fontWeight: page.lineWeight,
          fontStyle: page.italic ? 'italic' : 'normal',
          letterSpacing: pageIndex === 4 ? '-0.04em' : '-0.03em',
          lineHeight: 1,
          textAlign: 'left',
          whiteSpace: 'nowrap',
        }}
      >
        {page.leadOut}
      </div>
    </div>
  );
};

const CentralArticle: React.FC<{
  pageIndex: number;
  localFrame: number;
}> = ({pageIndex, localFrame}) => {
  const page = pages[pageIndex];
  const tops = [304, 382, 620, 696];

  return (
    <>
      {page.rows.map((row, index) => (
        <EditorialLine
          key={row}
          text={row}
          top={tops[index]}
          index={index}
          pageIndex={pageIndex}
          localFrame={localFrame}
        />
      ))}
      <InlineHeadline pageIndex={pageIndex} localFrame={localFrame} />
      <div
        style={{
          position: 'absolute',
          left: 360,
          right: 360,
          top: 580,
          color: PAPER,
          opacity: 0.42,
          fontFamily: page.family,
          fontSize: 18,
          fontStyle: page.italic ? 'italic' : 'normal',
          letterSpacing: '0.012em',
          lineHeight: 1.25,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {page.deck}
      </div>
      <div style={{position: 'absolute', left: 760, right: 760, top: 606}}>
        <FineRule color={page.accent} opacity={0.38} />
      </div>
    </>
  );
};

const StoryColumns: React.FC<{pageIndex: number}> = ({pageIndex}) => {
  const page = pages[pageIndex];

  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        top: 774,
        height: 206,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: 29,
        overflow: 'hidden',
      }}
    >
      {page.topics.map((topic, index) => (
        <div
          key={topic}
          style={{
            position: 'relative',
            paddingLeft: index === 0 ? 0 : 28,
            borderLeft: index === 0 ? 'none' : '1px solid rgba(216,215,209,0.14)',
            overflow: 'hidden',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <MetaLabel color={index === 0 ? page.accent : MID}>{`0${index + 1}`}</MetaLabel>
            <FineRule color={index === 0 ? page.accent : PAPER} opacity={index === 0 ? 0.38 : 0.13} />
          </div>
          <div
            style={{
              marginTop: 13,
              color: PAPER,
              opacity: 0.56,
              fontFamily: page.family,
              fontSize: 17,
              fontWeight: page.lineWeight,
              fontStyle: page.italic && index === 1 ? 'italic' : 'normal',
              letterSpacing: '-0.018em',
              lineHeight: 1.1,
            }}
          >
            {topic}
          </div>
          <div
            style={{
              marginTop: 10,
              color: PAPER,
              opacity: 0.33,
              fontFamily: pageIndex === 4 ? 'Georgia, Times New Roman, serif' : page.family,
              fontSize: 12.5,
              fontWeight: 400,
              fontStyle: 'normal',
              letterSpacing: '0.005em',
              lineHeight: 1.35,
              textAlign: 'justify',
            }}
          >
            {storyCopy[(pageIndex + index) % storyCopy.length]}
          </div>
        </div>
      ))}
    </div>
  );
};

const PageFurniture: React.FC<{pageIndex: number}> = ({pageIndex}) => {
  const page = pages[pageIndex];
  return (
    <>
      <div style={{position: 'absolute', left: 26, top: 270, bottom: 92, width: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <MetaLabel color={page.accent}>●</MetaLabel>
        <FineRule opacity={0.13} vertical />
        <div style={{color: MID, opacity: 0.42, fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>SIGNAL INDEX / 07</div>
      </div>
      <div style={{position: 'absolute', right: 26, top: 270, bottom: 92, width: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{color: MID, opacity: 0.38, fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', writingMode: 'vertical-rl'}}>INDEPENDENT REPORTING</div>
        <FineRule opacity={0.13} vertical />
        <MetaLabel>{`0${pageIndex + 1}`}</MetaLabel>
      </div>
      <div style={{position: 'absolute', left: 80, right: 80, bottom: 41, display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 20}}>
        <MetaLabel color={page.accent}>{page.byline}</MetaLabel>
        <FineRule opacity={0.16} />
        <MetaLabel align="right">{`${pageIndex + 1} / 05 · REAL-TIME EDITION`}</MetaLabel>
      </div>
    </>
  );
};

const PagePlate: React.FC<{
  pageIndex: number;
  localFrame: number;
}> = ({pageIndex, localFrame}) => (
  <AbsoluteFill>
    <PageHeader pageIndex={pageIndex} />
    <CentralArticle pageIndex={pageIndex} localFrame={localFrame} />
    <StoryColumns pageIndex={pageIndex} />
    <PageFurniture pageIndex={pageIndex} />
  </AbsoluteFill>
);

const PrintBase: React.FC<{frame: number}> = ({frame}) => {
  const sweepY = ((frame * 4.1) % 1240) - 90;
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 45%, #111615 0%, #090c0c 45%, #030404 88%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(216,215,209,0.18) 0.8px, transparent 0.9px)',
          backgroundSize: '6px 6px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: sweepY,
          height: 72,
          background:
            'linear-gradient(180deg, transparent, rgba(216,215,209,0.024), transparent)',
        }}
      />
    </>
  );
};

const PrintSurface: React.FC = () => (
  <AbsoluteFill style={{zIndex: 40, pointerEvents: 'none'}}>
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, opacity: 0.085, mixBlendMode: 'screen'}}
    >
      <filter id="editorial-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.64" numOctaves="3" seed="27" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.42" />
        </feComponentTransfer>
      </filter>
      <rect width="1920" height="1080" filter="url(#editorial-grain)" />
    </svg>
    <AbsoluteFill
      style={{
        opacity: 0.08,
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(241,240,233,0.12) 4px)',
        mixBlendMode: 'screen',
      }}
    />
    <AbsoluteFill
      style={{
        boxShadow:
          'inset 0 0 210px rgba(0,0,0,0.84), inset 0 0 48px rgba(0,0,0,0.58)',
      }}
    />
  </AbsoluteFill>
);

const GlitchTransition: React.FC<{
  frame: number;
  strength: number;
  phase: number;
  pageIndex: number;
  nextPageIndex: number;
  pageScale: number;
}> = ({frame, strength, phase, pageIndex, nextPageIndex, pageScale}) => {
  if (strength <= 0) {
    return null;
  }

  const tick = Math.floor(frame * 1.7);
  const reveal = interpolate(phase, [0.28, 0.94], [0, 1], clamp);
  const masks = [
    'repeating-linear-gradient(180deg, transparent 0px, transparent 29px, #000 29px, #000 45px, transparent 45px, transparent 82px)',
    'repeating-linear-gradient(180deg, transparent 0px, transparent 53px, #000 53px, #000 62px, transparent 62px, transparent 111px)',
    'repeating-linear-gradient(180deg, transparent 0px, transparent 18px, #000 18px, #000 23px, transparent 23px, transparent 57px)',
  ];
  const hues = [165, 332, 220];

  return (
    <AbsoluteFill style={{zIndex: 24, pointerEvents: 'none'}}>
      {masks.map((mask, index) => {
        const useNextPage = index > 0 || phase > 0.57;
        const direction = index % 2 === 0 ? 1 : -1;
        const shift = direction * (10 + hash(tick * 17 + index * 31) * 66) * strength;
        return (
          <div
            key={mask}
            style={{
              position: 'absolute',
              inset: -22,
              opacity: strength * (0.16 + reveal * (0.12 + index * 0.07)),
              transform: `translate3d(${shift}px, ${(hash(tick * 11 + index) - 0.5) * 8}px, 0) scale(${pageScale})`,
              transformOrigin: '50% 50%',
              filter: `sepia(1) saturate(${4.8 + strength * 3}) hue-rotate(${hues[index]}deg) contrast(${1.05 + strength * 0.42})`,
              WebkitMaskImage: mask,
              maskImage: mask,
              mixBlendMode: 'screen',
            }}
          >
            <PagePlate pageIndex={useNextPage ? nextPageIndex : pageIndex} localFrame={useNextPage ? 0 : 59} />
          </div>
        );
      })}

      {Array.from({length: 20}).map((_, index) => {
        const top = 12 + hash(tick * 47 + index * 23) * 1044;
        const height = 1 + Math.floor(hash(tick * 71 + index * 19) * 7);
        const width = 90 + hash(tick * 37 + index * 43) * 1820;
        const left = -70 + hash(tick * 29 + index * 17) * 560;
        const colors = [CYAN, RED, BLUE, BRIGHT];
        const color = colors[index % colors.length];
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              opacity: strength * (index % 6 === 0 ? 0.62 : 0.22),
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          opacity: strength * 0.13,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 7px, rgba(241,240,233,0.3) 8px, transparent 9px)',
          transform: `translateY(${(hash(tick * 91) - 0.5) * 12}px)`,
          mixBlendMode: 'screen',
        }}
      />

      {phase > 0.7 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 255 + hash(tick * 109) * 520,
            height: 5 + hash(tick * 113) * 13,
            backgroundColor: DEEP_INK,
            opacity: strength * 0.72,
            boxShadow: '0 -1px 0 rgba(53,219,230,0.3), 0 1px 0 rgba(255,53,92,0.28)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // The 10-second reference contains two seamless passes through five plates.
  // Each plate is readable for roughly 0.73 s, then glitches into the next one.
  const pageFrames = Math.max(1, Math.round(fps));
  const glitchFrames = Math.min(
    Math.max(1, pageFrames - 1),
    Math.max(8, Math.round(fps * 0.27)),
  );
  const absolutePage = Math.floor(frame / pageFrames);
  const pageIndex = absolutePage % pages.length;
  const nextPageIndex = (pageIndex + 1) % pages.length;
  const localFrame = frame - absolutePage * pageFrames;
  const glitchStart = pageFrames - glitchFrames;
  const glitchPhase = interpolate(
    localFrame,
    [glitchStart, Math.max(glitchStart + 1, pageFrames - 1)],
    [0, 1],
    clamp,
  );
  const glitchTick = Math.floor(frame * 1.7);
  const glitchPulse = 0.55 + hash(glitchTick * 5.7) * 0.45;
  const glitchStrength =
    localFrame >= glitchStart
      ? Math.min(1, (0.2 + glitchPhase * 0.9) * glitchPulse)
      : 0;

  const pageScale = interpolate(
    localFrame,
    [0, Math.max(1, pageFrames - 1)],
    [1.032, 1],
    clamp,
  );
  const settle = interpolate(localFrame, [0, Math.max(1, Math.round(fps * 0.075))], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const jitterX = glitchStrength > 0 ? (hash(glitchTick * 13) - 0.5) * 34 * glitchStrength : 0;
  const jitterY = glitchStrength > 0 ? (hash(glitchTick * 29) - 0.5) * 9 * glitchStrength : 0;
  const skew = glitchStrength > 0 ? (hash(glitchTick * 47) - 0.5) * 0.8 * glitchStrength : 0;

  const stageScale = Math.min(width / 1920, height / 1080);
  const stageLeft = (width - 1920 * stageScale) / 2;
  const stageTop = (height - 1080 * stageScale) / 2;

  return (
    <AbsoluteFill style={{backgroundColor: DEEP_INK, overflow: 'hidden'}}>
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
        <PrintBase frame={frame} />

        <div
          style={{
            position: 'absolute',
            inset: -22,
            opacity: 0.9 + settle * 0.1,
            filter: `blur(${(1 - settle) * 0.55}px) contrast(${1.01 + glitchStrength * 0.12})`,
            transform: `translate3d(${jitterX}px, ${jitterY}px, 0) scale(${pageScale}) skewX(${skew}deg)`,
            transformOrigin: '50% 50%',
            willChange: 'transform, filter, opacity',
          }}
        >
          <PagePlate pageIndex={pageIndex} localFrame={localFrame} />
        </div>

        <GlitchTransition
          frame={frame}
          strength={glitchStrength}
          phase={glitchPhase}
          pageIndex={pageIndex}
          nextPageIndex={nextPageIndex}
          pageScale={pageScale}
        />

        <PrintSurface />
      </div>
    </AbsoluteFill>
  );
};
