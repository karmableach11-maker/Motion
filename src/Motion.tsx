import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const FOCUS_Y = 583;
const FOCUS_GUTTER = 28;

const BLACK = '#030404';
const DEEP_BLACK = '#010202';
const PAPER = '#d8d8d2';
const BRIGHT = '#f2f1eb';
const MID = '#777a76';
const DIM = '#484b49';
const WARM = '#9f8264';

const SERIF = 'Georgia, "Times New Roman", Times, serif';
const DISPLAY_SERIF = '"Times New Roman", Times, Georgia, serif';
const SANS = 'Arial, Helvetica, sans-serif';
const HEAVY_SANS = '"Arial Black", Arial, Helvetica, sans-serif';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type SoftLineProps = {
  text: string;
  top: number;
  left?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  opacity?: number;
  blur?: number;
  style: React.CSSProperties;
};

const SoftLine: React.FC<SoftLineProps> = ({
  text,
  top,
  left = -180,
  width = 2280,
  align = 'center',
  opacity = 0.34,
  blur = 0.9,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      color: PAPER,
      opacity,
      filter: `blur(${blur}px)`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textAlign: align,
      lineHeight: 1,
      ...style,
    }}
  >
    {text}
  </div>
);

type InlineFocusLineProps = {
  lead: string;
  tail: string;
  centerY?: number;
  sideOpacity?: number;
  sideBlur?: number;
  style: React.CSSProperties;
};

/**
 * The bright phrase is the geometric anchor. Supporting copy is positioned
 * from its measured edges, so long lead/tail strings cannot be clipped by a
 * grid track or paint beneath the focus phrase.
 */
const InlineFocusLine: React.FC<InlineFocusLineProps> = ({
  lead,
  tail,
  centerY = FOCUS_Y,
  sideOpacity = 0.36,
  sideBlur = 0.72,
  style,
}) => {
  const shared: React.CSSProperties = {
    color: PAPER,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: centerY,
        display: 'inline-block',
        width: 'max-content',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span
        style={{
          ...shared,
          position: 'absolute',
          right: `calc(100% + ${FOCUS_GUTTER}px)`,
          top: 0,
          width: 1600,
          textAlign: 'right',
          opacity: sideOpacity,
          filter: `blur(${sideBlur}px)`,
        }}
      >
        {lead}
      </span>
      <span
        style={{
          ...shared,
          display: 'inline-block',
          color: BRIGHT,
          opacity: 0.98,
          textShadow: '0 0 13px rgba(242,241,235,0.055)',
        }}
      >
        artificial intelligence
      </span>
      <span
        style={{
          ...shared,
          position: 'absolute',
          left: `calc(100% + ${FOCUS_GUTTER}px)`,
          top: 0,
          width: 1600,
          textAlign: 'left',
          opacity: sideOpacity,
          filter: `blur(${sideBlur}px)`,
        }}
      >
        {tail}
      </span>
    </div>
  );
};

const Rule: React.FC<{
  top: number;
  left?: number;
  right?: number;
  opacity?: number;
  color?: string;
}> = ({
  top,
  left = 0,
  right = 0,
  opacity = 0.18,
  color = PAPER,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      right,
      top,
      height: 1,
      backgroundColor: color,
      opacity,
    }}
  />
);

const Meta: React.FC<{
  children: React.ReactNode;
  left?: number;
  right?: number;
  top: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
  opacity?: number;
}> = ({
  children,
  left,
  right,
  top,
  align = 'left',
  color = MID,
  opacity = 0.52,
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      right,
      top,
      color,
      opacity,
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.18em',
      lineHeight: 1,
      textAlign: align,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const TechnologyReviewPage: React.FC = () => (
  <AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        left: 12,
        top: 25,
        color: PAPER,
        opacity: 0.45,
        fontFamily: DISPLAY_SERIF,
        fontSize: 102,
        fontWeight: 700,
        letterSpacing: '-0.055em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      SIGNAL REVIEW
    </div>

    <Meta left={4} top={118}>RESEARCH</Meta>
    <Meta left={132} top={118}>BUSINESS</Meta>
    <Meta left={273} top={118}>SOCIETY</Meta>
    <Meta right={42} top={118} align="right">INDEPENDENT SYSTEMS JOURNAL</Meta>
    <Rule top={154} opacity={0.16} />

    <div
      style={{
        position: 'absolute',
        right: 260,
        top: 183,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        color: WARM,
        opacity: 0.48,
        fontFamily: SERIF,
        fontSize: 22,
      }}
    >
      <span>●</span>
      <span style={{color: PAPER, opacity: 0.56}}>business</span>
      <span>●</span>
      <span style={{color: PAPER, opacity: 0.56}}>industry</span>
      <span>●</span>
      <span style={{color: PAPER, opacity: 0.56}}>science</span>
    </div>

    <InlineFocusLine
      lead="people now work with"
      tail="to shape responsible decisions"
      style={{
        fontFamily: SERIF,
        fontSize: 92,
        fontWeight: 700,
        letterSpacing: '-0.046em',
      }}
    />

    <SoftLine
      top={690}
      text="engineering in the presence of incomplete data and fast-changing conditions"
      left={-250}
      width={2410}
      style={{
        fontFamily: SERIF,
        fontSize: 85,
        fontWeight: 500,
        letterSpacing: '-0.041em',
      }}
      opacity={0.31}
      blur={1.2}
    />

    <SoftLine
      top={812}
      text="science, medicine, industry and culture enter a new digital chapter"
      style={{
        fontFamily: SERIF,
        fontSize: 85,
        fontWeight: 600,
        letterSpacing: '-0.038em',
      }}
      opacity={0.27}
      blur={1.35}
    />

    <SoftLine
      top={930}
      text="automation and human creativity move forward together"
      style={{
        fontFamily: SERIF,
        fontSize: 84,
        fontWeight: 600,
        fontStyle: 'italic',
        letterSpacing: '-0.042em',
      }}
      opacity={0.23}
      blur={1.55}
    />
  </AbsoluteFill>
);

const AIReportPage: React.FC = () => (
  <AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        right: 128,
        top: 39,
        color: PAPER,
        opacity: 0.47,
        fontFamily: DISPLAY_SERIF,
        fontSize: 90,
        fontWeight: 600,
        letterSpacing: '-0.052em',
        lineHeight: 1,
      }}
    >
      AI REPORT
    </div>
    <Meta right={132} top={132} align="right">MACHINE INTELLIGENCE · FIELD NOTES</Meta>

    <SoftLine
      top={344}
      text="complex engineering, medicine, technology and culture converge"
      left={-105}
      width={2220}
      style={{
        fontFamily: SERIF,
        fontSize: 82,
        fontWeight: 500,
        letterSpacing: '-0.032em',
      }}
      opacity={0.28}
      blur={1.15}
    />

    <InlineFocusLine
      lead="advanced"
      tail="production is transforming every field"
      style={{
        fontFamily: SERIF,
        fontSize: 90,
        fontWeight: 700,
        letterSpacing: '-0.044em',
      }}
      sideOpacity={0.34}
    />

    <SoftLine
      top={752}
      text="creating images, scientific models, useful tools and new discoveries"
      left={-170}
      width={2250}
      style={{
        fontFamily: SERIF,
        fontSize: 82,
        fontWeight: 500,
        letterSpacing: '-0.036em',
      }}
      opacity={0.29}
      blur={1.1}
    />

    <SoftLine
      top={934}
      text="dialogue in natural language connects people with complex information"
      style={{
        fontFamily: SERIF,
        fontSize: 80,
        fontWeight: 500,
        fontStyle: 'italic',
        letterSpacing: '-0.04em',
      }}
      opacity={0.24}
      blur={1.35}
    />
  </AbsoluteFill>
);

const DigitalReportPage: React.FC = () => {
  const lineStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 78,
    fontWeight: 760,
    letterSpacing: '-0.048em',
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 214,
          top: 58,
          color: PAPER,
          opacity: 0.5,
          fontFamily: HEAVY_SANS,
          fontSize: 70,
          fontWeight: 900,
          letterSpacing: '-0.065em',
          lineHeight: 1,
        }}
      >
        DIGITAL REPORT
      </div>
      <Meta right={218} top={125} align="right">VISION · LANGUAGE · COMPUTATION</Meta>

      <SoftLine
        top={250}
        text="artificial neural networks analyze language, vision and complex data"
        left={-130}
        width={2240}
        style={lineStyle}
        opacity={0.28}
        blur={1.2}
      />
      <SoftLine
        top={392}
        text="speech recognition and natural language systems connect ideas"
        left={-210}
        width={2350}
        style={lineStyle}
        opacity={0.3}
        blur={1}
      />

      <InlineFocusLine
        lead="new levels of"
        tail="extend human capability"
        style={{
          ...lineStyle,
          fontSize: 85,
          fontWeight: 850,
        }}
        sideOpacity={0.37}
        sideBlur={0.65}
      />

      <SoftLine
        top={680}
        text="machine learning and big data turn patterns into practical tools"
        left={-85}
        width={2160}
        style={lineStyle}
        opacity={0.31}
        blur={1}
      />
      <SoftLine
        top={824}
        text="general systems bring measurable benefits to science and industry"
        left={-220}
        width={2350}
        style={lineStyle}
        opacity={0.27}
        blur={1.25}
      />
      <SoftLine
        top={966}
        text="for the corporation, the community and the public interest"
        style={{
          ...lineStyle,
          fontStyle: 'italic',
        }}
        opacity={0.23}
        blur={1.45}
      />
    </AbsoluteFill>
  );
};

type CloudWord = {
  text: string;
  left: number;
  top: number;
  size: number;
  opacity: number;
  family: string;
  weight: number;
  italic?: boolean;
  blur?: number;
};

const cloudWords: CloudWord[] = [
  {text: 'energy', left: 184, top: 135, size: 45, opacity: 0.34, family: SERIF, weight: 700},
  {text: 'cyber', left: 405, top: 122, size: 44, opacity: 0.32, family: SERIF, weight: 500},
  {text: 'advanced', left: 633, top: 128, size: 39, opacity: 0.29, family: SERIF, weight: 400},
  {text: 'models', left: 1216, top: 119, size: 43, opacity: 0.31, family: SERIF, weight: 700, italic: true},
  {text: 'engineering', left: 155, top: 246, size: 38, opacity: 0.27, family: SANS, weight: 700},
  {text: 'self-driving car', left: 540, top: 237, size: 47, opacity: 0.36, family: SERIF, weight: 400},
  {text: 'ai', left: 1032, top: 266, size: 44, opacity: 0.48, family: SERIF, weight: 700},
  {text: 'new', left: 1294, top: 210, size: 46, opacity: 0.37, family: SERIF, weight: 700, italic: true},
  {text: 'algorithms', left: 1440, top: 286, size: 39, opacity: 0.28, family: SERIF, weight: 400},
  {text: 'deep learning', left: 215, top: 388, size: 40, opacity: 0.29, family: SERIF, weight: 600},
  {text: 'neural networks', left: 684, top: 377, size: 52, opacity: 0.42, family: SERIF, weight: 600},
  {text: 'ChatBot', left: 1436, top: 427, size: 38, opacity: 0.3, family: SERIF, weight: 600},
  {text: 'cyber', left: 268, top: 535, size: 43, opacity: 0.33, family: SERIF, weight: 700},
  {text: 'digital', left: 66, top: 642, size: 38, opacity: 0.25, family: SERIF, weight: 500, italic: true},
  {text: 'industry 4.0', left: 304, top: 681, size: 59, opacity: 0.32, family: SERIF, weight: 700},
  {text: 'machine learning', left: 1161, top: 648, size: 43, opacity: 0.3, family: SERIF, weight: 500},
  {text: 'science', left: 79, top: 801, size: 38, opacity: 0.26, family: SERIF, weight: 600, italic: true},
  {text: 'business', left: 543, top: 814, size: 47, opacity: 0.36, family: SERIF, weight: 600},
  {text: 'technology', left: 937, top: 808, size: 46, opacity: 0.34, family: SERIF, weight: 500},
  {text: 'digital', left: 1420, top: 780, size: 58, opacity: 0.31, family: SERIF, weight: 700},
  {text: 'automation', left: 185, top: 929, size: 39, opacity: 0.29, family: SERIF, weight: 700, italic: true},
  {text: 'medicine', left: 705, top: 942, size: 41, opacity: 0.3, family: SERIF, weight: 400},
  {text: 'economy', left: 1283, top: 928, size: 40, opacity: 0.27, family: SERIF, weight: 600, italic: true},
];

const WordCloudPage: React.FC = () => (
  <AbsoluteFill>
    {cloudWords.map((word, index) => {
      const expandedLeft = 960 + (word.left - 960) * 1.1;
      const expandedTop = FOCUS_Y + (word.top - FOCUS_Y) * 1.08;

      return (
        <div
          key={`${word.text}-${index}`}
          style={{
            position: 'absolute',
            left: expandedLeft,
            top: expandedTop,
            color: PAPER,
            opacity: word.opacity,
            filter: `blur(${word.blur ?? 0.75}px)`,
            fontFamily: word.family,
            fontSize: word.size * 1.24,
            fontWeight: word.weight,
            fontStyle: word.italic ? 'italic' : 'normal',
            letterSpacing: '-0.035em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {word.text}
        </div>
      );
    })}

    <InlineFocusLine
      lead=""
      tail=""
      style={{
        fontFamily: SERIF,
        fontSize: 88,
        fontWeight: 700,
        letterSpacing: '-0.046em',
      }}
      sideOpacity={0.24}
      sideBlur={1}
    />
  </AbsoluteFill>
);

const CyberBusinessPage: React.FC = () => (
  <AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 185,
        borderBottom: '1px solid rgba(216,216,210,0.16)',
        background:
          'linear-gradient(90deg, rgba(216,216,210,0.035), rgba(216,216,210,0.11), rgba(216,216,210,0.035))',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: 216,
        top: 28,
        color: PAPER,
        opacity: 0.57,
        fontFamily: HEAVY_SANS,
        fontSize: 90,
        fontWeight: 900,
        letterSpacing: '-0.06em',
        lineHeight: 1,
      }}
    >
      Future business
    </div>
    <Meta right={221} top={205} align="right">INFORMATION · SYSTEMS · MARKETS</Meta>
    <Rule top={248} opacity={0.17} />
    <Meta left={7} top={292}>NEWS · ANALYSIS · REPORTS</Meta>
    <Meta right={18} top={292} align="right">GLOBAL TECHNOLOGY DESK</Meta>

    <InlineFocusLine
      lead="does the rise of"
      tail="reshape the modern economy"
      style={{
        fontFamily: SANS,
        fontSize: 82,
        fontWeight: 800,
        letterSpacing: '-0.047em',
      }}
      sideOpacity={0.37}
      sideBlur={0.68}
    />

    <SoftLine
      top={680}
      text="technology and robotics are moving from research into daily work"
      left={-155}
      width={2270}
      style={{
        fontFamily: SANS,
        fontSize: 78,
        fontWeight: 740,
        letterSpacing: '-0.046em',
      }}
      opacity={0.3}
      blur={1.05}
    />

    <SoftLine
      top={828}
      text="the impact on employment, culture and the connected internet"
      left={-90}
      width={2160}
      style={{
        fontFamily: SANS,
        fontSize: 77,
        fontWeight: 740,
        fontStyle: 'italic',
        letterSpacing: '-0.047em',
      }}
      opacity={0.27}
      blur={1.25}
    />

    <SoftLine
      top={974}
      text="a practical evolution of business, science and public life"
      style={{
        fontFamily: SANS,
        fontSize: 77,
        fontWeight: 760,
        fontStyle: 'italic',
        letterSpacing: '-0.05em',
      }}
      opacity={0.24}
      blur={1.45}
    />
  </AbsoluteFill>
);

const pages: React.FC[] = [
  TechnologyReviewPage,
  AIReportPage,
  DigitalReportPage,
  WordCloudPage,
  CyberBusinessPage,
];

const EditorialSurface: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', zIndex: 20}}>
    <AbsoluteFill
      style={{
        opacity: 0.035,
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(216,216,210,0.12) 4px)',
        mixBlendMode: 'screen',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 50% 53%, transparent 22%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0.56) 100%)',
        boxShadow: 'inset 0 0 90px rgba(0,0,0,0.36)',
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  /*
   * The source changes cards every 11 frames at 30 fps. We choose the nearest
   * whole number of five-card cycles that fits the host composition, keeping
   * the cadence close to the reference while making the final hard cut match
   * every internal Cyber Business -> Signal Review cut.
   */
  const referenceCycleFrames = fps * (55 / 30);
  const cycleCount = Math.max(
    1,
    Math.round(durationInFrames / referenceCycleFrames),
  );
  const totalCards = cycleCount * pages.length;
  const cardPosition = (frame * totalCards) / durationInFrames;
  const absoluteCard = Math.min(
    totalCards - 1,
    Math.floor(cardPosition),
  );
  const pageIndex = absoluteCard % pages.length;
  const localProgress = cardPosition - absoluteCard;
  const pageScale = interpolate(
    localProgress,
    [0, 1],
    [1, 1.04],
    clamp,
  );

  const ActivePage = pages[pageIndex];
  const stageScale = Math.min(
    width / DESIGN_WIDTH,
    height / DESIGN_HEIGHT,
  );
  const stageLeft = (width - DESIGN_WIDTH * stageScale) / 2;
  const stageTop = (height - DESIGN_HEIGHT * stageScale) / 2;

  return (
    <AbsoluteFill style={{backgroundColor: DEEP_BLACK, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: stageLeft,
          top: stageTop,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse at 50% 53%, #0a0d0c 0%, #060807 48%, #020303 100%)',
          transform: `scale(${stageScale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            transform: `scale(${pageScale})`,
            transformOrigin: '50% 50%',
            willChange: 'transform',
          }}
        >
          <AbsoluteFill style={{backgroundColor: BLACK}} />
          <ActivePage />
        </div>
        <EditorialSurface />
      </div>
    </AbsoluteFill>
  );
};
