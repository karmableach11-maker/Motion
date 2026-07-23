import React, {type CSSProperties} from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

type LayoutVariant =
  | "lead-serif"
  | "nav-sans"
  | "center-sans"
  | "tool-rail"
  | "chip-serif"
  | "data-grid"
  | "minimal-serif"
  | "nav-serif"
  | "split-report"
  | "wide-sans"
  | "sectioned-serif";

type Article = {
  section: string;
  date: string;
  headline: string;
  deck: string;
  body: readonly string[];
  tags: readonly string[];
  variant: LayoutVariant;
  nav: readonly string[];
  panX?: number;
  panY?: number;
  zoom?: number;
  origin?: string;
};

const FPS = 60;
const BEAT_FRAMES = 7;
const PAPER = "#fbfaf7";
const INK = "#11110f";
const MUTED = "#66645e";
const RULE = "#22221f";
const SERIF = 'Georgia, "Times New Roman", Times, serif';
const SANS = 'Arial, Helvetica, "Nimbus Sans L", sans-serif';

type FocusTypography = {
  fontFamily: string;
  fontSize: number;
  fontStyle?: CSSProperties["fontStyle"];
  fontWeight: CSSProperties["fontWeight"];
  letterSpacing: number;
  opticalShiftX: number;
  scaleX: number;
};

const FOCUS_TYPOGRAPHY: readonly FocusTypography[] = [
  {
    fontFamily: SERIF,
    fontSize: 126,
    fontWeight: 700,
    letterSpacing: -5.2,
    opticalShiftX: -4,
    scaleX: 0.998,
  },
  {
    fontFamily: SANS,
    fontSize: 120,
    fontWeight: 900,
    letterSpacing: -6.2,
    opticalShiftX: -4,
    scaleX: 1.082,
  },
  {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: 132,
    fontWeight: 500,
    letterSpacing: -3.2,
    opticalShiftX: -4,
    scaleX: 1.022,
  },
  {
    fontFamily: SANS,
    fontSize: 116,
    fontWeight: 700,
    letterSpacing: -4.4,
    opticalShiftX: -3,
    scaleX: 1.095,
  },
  {
    fontFamily: SERIF,
    fontSize: 122,
    fontWeight: 500,
    letterSpacing: -3.8,
    opticalShiftX: -4,
    scaleX: 1.12,
  },
  {
    fontFamily: '"Arial Black", Arial, Helvetica, sans-serif',
    fontSize: 112,
    fontWeight: 900,
    letterSpacing: -5.8,
    opticalShiftX: -4,
    scaleX: 1.16,
  },
  {
    fontFamily: SERIF,
    fontSize: 124,
    fontStyle: "italic",
    fontWeight: 500,
    letterSpacing: -4.4,
    opticalShiftX: -12,
    scaleX: 1.089,
  },
  {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: 128,
    fontWeight: 700,
    letterSpacing: -4.8,
    opticalShiftX: -4,
    scaleX: 0.976,
  },
  {
    fontFamily: SANS,
    fontSize: 118,
    fontWeight: 500,
    letterSpacing: -3.2,
    opticalShiftX: -4,
    scaleX: 1.205,
  },
  {
    fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
    fontSize: 126,
    fontWeight: 800,
    letterSpacing: -6.8,
    opticalShiftX: -4,
    scaleX: 1.034,
  },
  {
    fontFamily: SERIF,
    fontSize: 120,
    fontWeight: 600,
    letterSpacing: -3.6,
    opticalShiftX: -4,
    scaleX: 1.03,
  },
] as const;

const NAV_A = [
  "ADVANCES",
  "ETHICS & POLICY",
  "INTERVIEWS",
  "OPINION & ANALYSIS",
  "GUIDES",
] as const;

const NAV_B = [
  "RESEARCH",
  "CASE STUDIES",
  "APPLICATIONS",
  "CULTURE",
  "HEALTH",
] as const;

const NAV_C = [
  "SYSTEMS",
  "STARTUPS",
  "PRODUCT REVIEWS",
  "CYBERSECURITY",
  "TECH POLICY",
] as const;

const ARTICLES: readonly Article[] = [
  {
    section: "Climate & Systems",
    date: "JUNE 24 · 08:30 GMT",
    headline: "Climate Intelligence Through Deep Learning",
    deck:
      "Learning systems connect weather, infrastructure, and energy data to reveal risk before it becomes disruption.",
    body: [
      "Forecasting is shifting from isolated models to connected systems that compare many weak signals at once. The result is a clearer view of how local changes travel through a wider network.",
      "Researchers are pairing physical models with adaptive computation so every prediction retains context. Confidence ranges remain visible, making uncertainty part of the decision rather than a hidden footnote.",
      "The practical goal is not perfect foresight. It is enough time for communities, operators, and planners to choose a safer path while options are still open.",
    ],
    tags: ["EARTH DATA", "FORECASTING", "RESILIENCE"],
    variant: "lead-serif",
    nav: NAV_A,
    panX: -138,
    panY: 10,
    zoom: 1.06,
    origin: "46% 43%",
  },
  {
    section: "Frontier Models",
    date: "JUNE 24 · 09:10 GMT",
    headline: "Efficient Infrastructure for Deep Learning",
    deck:
      "Efficient models are changing where intelligence can run—and who can benefit from it.",
    body: [
      "A new generation of compact networks can operate close to the source of information. This shortens response times while reducing the amount of sensitive data that must travel.",
      "The architecture is becoming modular: a small local model handles immediate context while larger systems support demanding analysis. That balance is redefining the modern compute stack.",
    ],
    tags: ["MODELS", "HARDWARE", "EDGE AI"],
    variant: "nav-sans",
    nav: NAV_A,
    panX: -250,
    zoom: 1.08,
    origin: "48% 40%",
  },
  {
    section: "Technology & Health",
    date: "JUNE 24 · 10:00 GMT",
    headline: "Deep Learning in Drug Discovery",
    deck:
      "Pattern discovery helps researchers connect molecular evidence with a patient’s changing clinical picture.",
    body: [
      "Teams are combining laboratory measurements, medical images, and treatment history to identify relationships that would be difficult to see in isolation.",
      "The most useful tools support specialists instead of replacing them. They make evidence easier to compare, document, and question at every stage.",
    ],
    tags: ["DISCOVERY", "HEALTH", "BIOLOGY"],
    variant: "center-sans",
    nav: NAV_B,
    zoom: 0.99,
    origin: "50% 48%",
  },
  {
    section: "AI & Automation",
    date: "JUNE 24 · 10:40 GMT",
    headline: "Deep Learning for Autonomous Systems",
    deck:
      "Shared context lets vehicles read movement, weather, and street conditions as one changing system.",
    body: [
      "Navigation is no longer only a question of mapping a route. Intelligent mobility must interpret intent, predict interactions, and recognize when familiar rules do not fit.",
      "Better simulation exposes systems to rare situations before they encounter them in public space. Every scenario becomes a test of perception, planning, and restraint.",
    ],
    tags: ["MOBILITY", "ROBOTICS", "SAFETY"],
    variant: "tool-rail",
    nav: NAV_C,
    panX: 70,
    zoom: 1.02,
    origin: "55% 48%",
  },
  {
    section: "Security & Privacy",
    date: "JUNE 24 · 11:15 GMT",
    headline: "Deep Learning for Cybersecurity",
    deck:
      "Security models are learning to recognize behavior, not merely signatures left by yesterday’s attacks.",
    body: [
      "Modern networks change too quickly for a fixed catalog of warnings. Behavioral analysis compares sequences, relationships, and timing to detect activity that does not fit the surrounding system.",
      "Human review remains essential. Analysts need evidence trails, interpretable alerts, and controls that make escalation deliberate rather than automatic.",
    ],
    tags: ["INDUSTRY NEWS", "APPLICATIONS", "SECURITY", "PRIVACY"],
    variant: "chip-serif",
    nav: NAV_B,
    panX: 190,
    zoom: 1.08,
    origin: "54% 48%",
  },
  {
    section: "Decision Science",
    date: "JUNE 24 · 12:00 GMT",
    headline: "Decisions Built on Deep Learning",
    deck:
      "The next advantage is not more data. It is a clearer path from evidence to responsible action.",
    body: [
      "Organizations collect more measurements than any team can inspect directly. Learning systems reduce that volume into patterns, exceptions, and questions that deserve attention.",
      "The strongest workflows reveal how a recommendation was formed and what could change it. That transparency lets people compare alternatives instead of accepting a score without context.",
      "Good prediction is only the beginning. The real measure is whether the resulting decision remains useful, fair, and reversible when conditions evolve.",
    ],
    tags: ["ANALYTICS", "STRATEGY", "OPERATIONS"],
    variant: "data-grid",
    nav: NAV_C,
    panX: -70,
    zoom: 1.04,
    origin: "44% 44%",
  },
  {
    section: "People & Technology",
    date: "JUNE 24 · 13:10 GMT",
    headline: "Collaboration Shaped by Deep Learning",
    deck:
      "New interfaces turn intelligent systems into visible partners for exploration, critique, and iteration.",
    body: [
      "The emerging interaction model is conversational but not passive. People can expose assumptions, branch an idea, compare evidence, and return to earlier decisions without losing the thread.",
      "Designers are focusing on agency: the ability to understand what a system changed, why it changed, and how to intervene when the direction is wrong.",
    ],
    tags: ["INTERFACES", "WORK", "DESIGN"],
    variant: "minimal-serif",
    nav: NAV_A,
    panX: -240,
    panY: 20,
    zoom: 1.08,
    origin: "43% 50%",
  },
  {
    section: "Vision & Language",
    date: "JUNE 24 · 14:20 GMT",
    headline: "Image and Speech with Deep Learning",
    deck:
      "Image, speech, and text are converging into a shared layer of machine understanding.",
    body: [
      "When information arrives through several channels, context becomes richer and ambiguity can be reduced. A gesture, a spoken phrase, and a visual detail may support one another.",
      "The challenge is preserving provenance. Useful systems must distinguish what was observed, what was inferred, and what remains uncertain.",
    ],
    tags: ["COMPUTER VISION", "SPEECH", "LANGUAGE"],
    variant: "nav-serif",
    nav: NAV_B,
    panX: -300,
    zoom: 1.12,
    origin: "42% 46%",
  },
  {
    section: "Predictive Systems",
    date: "JUNE 24 · 15:00 GMT",
    headline: "Energy Forecasting Through Deep Learning",
    deck:
      "Forecasts respond to weather, movement, and local generation in near real time.",
    body: [
      "Energy networks increasingly depend on flexible demand. Predictive tools help operators see where pressure is building and which resources can respond without disrupting essential services.",
      "The same models can help buildings and communities plan their own use. Local decisions become part of a larger balancing system.",
    ],
    tags: ["ENERGY", "FORECASTING", "INFRASTRUCTURE"],
    variant: "split-report",
    nav: NAV_C,
    panX: -120,
    zoom: 1.06,
    origin: "46% 50%",
  },
  {
    section: "Urban Intelligence",
    date: "JUNE 24 · 16:25 GMT",
    headline: "Smart Cities Powered by Deep Learning",
    deck:
      "Urban intelligence works best when sensors, services, and public priorities share a common frame.",
    body: [
      "City systems create a constant stream of information about movement, air, water, and energy. The opportunity is to connect those signals without turning daily life into a black box.",
      "Open standards and clear governance make the technology accountable. A responsive city should explain what it measures and whose needs shape the response.",
    ],
    tags: ["SMART CITIES", "PUBLIC REALM", "SYSTEMS"],
    variant: "wide-sans",
    nav: NAV_C,
    panX: -330,
    zoom: 1.1,
    origin: "40% 43%",
  },
  {
    section: "Data & Research",
    date: "JUNE 24 · 17:10 GMT",
    headline: "Responsible Testing with Deep Learning",
    deck:
      "Carefully generated examples reveal edge cases while protecting sensitive information.",
    body: [
      "Real-world datasets rarely contain every condition a system will face. Synthetic examples let teams explore unusual combinations and measure failure before deployment.",
      "Quality depends on discipline. Generated data must be audited for unrealistic shortcuts, hidden bias, and gaps that could create false confidence.",
      "Used well, simulation becomes a laboratory for better questions—not a substitute for evidence from the world.",
    ],
    tags: ["DATA", "SIMULATION", "MODEL SAFETY"],
    variant: "sectioned-serif",
    nav: NAV_A,
    panX: 110,
    zoom: 1.04,
    origin: "55% 45%",
  },
] as const;

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const NavigationBar: React.FC<{
  items: readonly string[];
  dark?: boolean;
  label?: string;
}> = ({items, dark = true, label = "FIELD NOTES / 24"}) => {
  return (
    <div
      style={{
        height: 60,
        padding: "0 72px",
        display: "flex",
        alignItems: "center",
        gap: 46,
        backgroundColor: dark ? INK : "transparent",
        color: dark ? PAPER : INK,
        borderBottom: dark ? "none" : `2px solid ${INK}`,
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 0.6,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{fontWeight: 900, letterSpacing: 1.8, marginRight: 20}}>
        {label}
      </div>
      {items.map((item) => (
        <div key={item} style={{opacity: 0.82}}>
          {item}
        </div>
      ))}
    </div>
  );
};

const Metadata: React.FC<{
  article: Article;
  align?: "left" | "center";
}> = ({article, align = "left"}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "center",
        gap: 16,
        color: MUTED,
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: 0.7,
        textTransform: "uppercase",
      }}
    >
      <span>{article.date}</span>
      <span style={{width: 38, height: 1, background: MUTED}} />
      <span>{article.section}</span>
    </div>
  );
};

const TagRow: React.FC<{
  tags: readonly string[];
  centered?: boolean;
}> = ({tags, centered = false}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: centered ? "center" : "flex-start",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {tags.map((tag) => (
        <div
          key={tag}
          style={{
            padding: "8px 15px 7px",
            borderRadius: 18,
            color: PAPER,
            background: INK,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.45,
          }}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

const BodyGrid: React.FC<{
  body: readonly string[];
  columns?: number;
  width?: number | string;
  fontSize?: number;
}> = ({body, columns = 3, width = "100%", fontSize = 17}) => {
  return (
    <div
      style={{
        width,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 42,
        color: "#292925",
        fontFamily: SANS,
        fontSize,
        lineHeight: 1.42,
      }}
    >
      {body.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 28)}-${index}`} style={{margin: 0}}>
          {paragraph}
        </p>
      ))}
    </div>
  );
};

const ToolRail: React.FC = () => {
  const iconStyle: CSSProperties = {
    width: 34,
    height: 34,
    stroke: INK,
    strokeWidth: 1.8,
    fill: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <svg viewBox="0 0 32 32" style={iconStyle}>
        <circle cx="8" cy="16" r="3" />
        <circle cx="23" cy="7" r="3" />
        <circle cx="23" cy="25" r="3" />
        <path d="M10.6 14.5 20.3 8.7M10.6 17.5l9.7 5.8" />
      </svg>
      <svg viewBox="0 0 32 32" style={iconStyle}>
        <path d="M9 5.5h14v21l-7-4.5-7 4.5z" />
      </svg>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          lineHeight: 1,
          color: INK,
        }}
      >
        Aa
      </div>
    </div>
  );
};

const HeadlineRule: React.FC<{width?: number | string}> = ({
  width = "100%",
}) => (
  <div
    style={{
      width,
      height: 3,
      marginTop: 28,
      background: RULE,
      transformOrigin: "left center",
    }}
  />
);

const LeadSerif: React.FC<{article: Article}> = ({article}) => (
  <div style={{padding: "104px 104px 70px", width: 2160}}>
    <Metadata article={article} />
    <h1
      style={{
        width: 1780,
        margin: "52px 0 22px",
        color: INK,
        fontFamily: SERIF,
        fontSize: 106,
        lineHeight: 0.97,
        fontWeight: 700,
        letterSpacing: -3.2,
      }}
    >
      {article.headline}
    </h1>
    <div
      style={{
        width: 1480,
        color: "#3b3a36",
        fontFamily: SANS,
        fontSize: 25,
        lineHeight: 1.32,
      }}
    >
      {article.deck}
    </div>
    <HeadlineRule width={1700} />
    <div style={{marginTop: 42}}>
      <BodyGrid body={article.body} width={1640} />
    </div>
  </div>
);

const NavSans: React.FC<{article: Article}> = ({article}) => (
  <>
    <NavigationBar items={article.nav} />
    <div style={{padding: "86px 90px 70px", width: 2290}}>
      <Metadata article={article} />
      <h1
        style={{
          width: 2040,
          margin: "42px 0 18px",
          color: INK,
          fontFamily: SANS,
          fontSize: 118,
          lineHeight: 0.91,
          fontWeight: 900,
          letterSpacing: -5.4,
        }}
      >
        {article.headline}
      </h1>
      <div
        style={{
          width: 1660,
          color: "#393833",
          fontFamily: SANS,
          fontSize: 27,
          fontWeight: 700,
          lineHeight: 1.28,
        }}
      >
        {article.deck}
      </div>
      <div style={{marginTop: 50}}>
        <BodyGrid body={article.body} columns={2} width={1760} fontSize={18} />
      </div>
    </div>
  </>
);

const CenterSans: React.FC<{article: Article}> = ({article}) => (
  <div
    style={{
      height: "100%",
      padding: "120px 120px 80px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: SANS,
        fontSize: 21,
        fontWeight: 800,
        letterSpacing: 0.7,
      }}
    >
      {article.section}
    </div>
    <h1
      style={{
        width: 1260,
        margin: "38px 0 32px",
        color: INK,
        fontFamily: SANS,
        fontSize: 100,
        lineHeight: 0.98,
        fontWeight: 900,
        letterSpacing: -4.2,
      }}
    >
      {article.headline}
    </h1>
    <div
      style={{
        width: 1040,
        color: "#3a3935",
        fontFamily: SERIF,
        fontSize: 27,
        fontStyle: "italic",
        lineHeight: 1.35,
      }}
    >
      {article.deck}
    </div>
    <div
      style={{
        width: 110,
        height: 2,
        margin: "34px 0 22px",
        background: INK,
      }}
    />
    <div
      style={{
        color: MUTED,
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: 0.8,
      }}
    >
      {article.date}
    </div>
  </div>
);

const ToolRailLayout: React.FC<{article: Article}> = ({article}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 328,
        top: 342,
      }}
    >
      <ToolRail />
    </div>
    <div style={{padding: "120px 100px 80px 420px", width: 1880}}>
      <Metadata article={article} />
      <div
        style={{
          marginTop: 36,
          color: INK,
          fontFamily: SANS,
          fontSize: 23,
          fontWeight: 800,
        }}
      >
        {article.section}
      </div>
      <h1
        style={{
          width: 1380,
          margin: "30px 0 28px",
          color: INK,
          fontFamily: SANS,
          fontSize: 96,
          lineHeight: 0.98,
          fontWeight: 900,
          letterSpacing: -3.8,
        }}
      >
        {article.headline}
      </h1>
      <div
        style={{
          width: 1320,
          color: "#3b3a36",
          fontFamily: SANS,
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.32,
        }}
      >
        {article.deck}
      </div>
      <div style={{marginTop: 42}}>
        <BodyGrid body={article.body} columns={2} width={1320} />
      </div>
    </div>
  </>
);

const ChipSerif: React.FC<{article: Article}> = ({article}) => (
  <div
    style={{
      padding: "132px 96px 70px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    <TagRow tags={article.tags} centered />
    <h1
      style={{
        width: 1390,
        margin: "46px 0 26px",
        color: INK,
        fontFamily: SERIF,
        fontSize: 104,
        lineHeight: 0.98,
        fontWeight: 500,
        letterSpacing: -3.8,
      }}
    >
      {article.headline}
    </h1>
    <div
      style={{
        width: 1170,
        color: "#4a4944",
        fontFamily: SERIF,
        fontSize: 26,
        lineHeight: 1.35,
      }}
    >
      {article.deck}
    </div>
    <div style={{marginTop: 28}}>
      <Metadata article={article} align="center" />
    </div>
  </div>
);

const DataGrid: React.FC<{article: Article}> = ({article}) => (
  <div style={{padding: "88px 96px 70px", width: 2060}}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: 1660,
        alignItems: "center",
      }}
    >
      <Metadata article={article} />
      <div
        style={{
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 2.2,
        }}
      >
        SIGNAL / REPORT 06
      </div>
    </div>
    <h1
      style={{
        width: 1700,
        margin: "48px 0 18px",
        color: INK,
        fontFamily: SERIF,
        fontSize: 108,
        lineHeight: 0.95,
        fontWeight: 700,
        letterSpacing: -3.4,
      }}
    >
      {article.headline}
    </h1>
    <div
      style={{
        width: 1500,
        color: "#3e3d38",
        fontFamily: SANS,
        fontSize: 25,
        lineHeight: 1.3,
      }}
    >
      {article.deck}
    </div>
    <HeadlineRule width={1660} />
    <div style={{marginTop: 34}}>
      <BodyGrid body={article.body} width={1660} />
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 18,
        width: 1120,
        marginTop: 44,
      }}
    >
      {[
        ["12×", "faster review"],
        ["3", "evidence layers"],
        ["01", "human decision"],
      ].map(([number, label]) => (
        <div
          key={label}
          style={{
            borderTop: `2px solid ${INK}`,
            paddingTop: 12,
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            fontFamily: SANS,
          }}
        >
          <span style={{fontSize: 36, fontWeight: 900}}>{number}</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const MinimalSerif: React.FC<{article: Article}> = ({article}) => (
  <div style={{padding: "160px 90px 80px", width: 2230}}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        color: INK,
        fontFamily: SANS,
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: 0.6,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          border: `2px solid ${INK}`,
          borderRadius: "50%",
        }}
      />
      {article.section.toUpperCase()}
    </div>
    <h1
      style={{
        width: 2020,
        margin: "72px 0 34px",
        color: INK,
        fontFamily: SERIF,
        fontSize: 116,
        lineHeight: 0.92,
        fontWeight: 500,
        letterSpacing: -5.2,
      }}
    >
      {article.headline}
    </h1>
    <div
      style={{
        display: "flex",
        width: 1640,
        alignItems: "flex-start",
        gap: 60,
      }}
    >
      <div
        style={{
          width: 900,
          color: "#3f3e39",
          fontFamily: SERIF,
          fontSize: 27,
          lineHeight: 1.35,
        }}
      >
        {article.deck}
      </div>
      <div style={{paddingTop: 6}}>
        <Metadata article={article} />
      </div>
    </div>
  </div>
);

const NavSerif: React.FC<{article: Article}> = ({article}) => (
  <>
    <NavigationBar items={article.nav} />
    <div style={{padding: "96px 80px 70px", width: 2300}}>
      <h1
        style={{
          width: 2140,
          margin: 0,
          color: INK,
          fontFamily: SERIF,
          fontSize: 112,
          lineHeight: 0.96,
          fontWeight: 500,
          letterSpacing: -4.6,
        }}
      >
        {article.headline}
      </h1>
      <div
        style={{
          width: 1840,
          marginTop: 25,
          color: "#4a4944",
          fontFamily: SERIF,
          fontSize: 27,
          lineHeight: 1.3,
        }}
      >
        {article.deck}
      </div>
      <HeadlineRule width={2020} />
      <div style={{marginTop: 36}}>
        <BodyGrid body={article.body} columns={2} width={1810} fontSize={18} />
      </div>
    </div>
  </>
);

const SplitReport: React.FC<{article: Article}> = ({article}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1.25fr 0.75fr",
      height: "100%",
      width: 2160,
    }}
  >
    <div
      style={{
        padding: "116px 76px 80px 96px",
        borderRight: `3px solid ${INK}`,
      }}
    >
      <Metadata article={article} />
      <h1
        style={{
          width: 1280,
          margin: "48px 0 24px",
          color: INK,
          fontFamily: SANS,
          fontSize: 98,
          lineHeight: 0.95,
          fontWeight: 800,
          letterSpacing: -4.1,
        }}
      >
        {article.headline}
      </h1>
      <div
        style={{
          width: 1120,
          color: "#41403b",
          fontFamily: SERIF,
          fontSize: 27,
          fontStyle: "italic",
          lineHeight: 1.35,
        }}
      >
        {article.deck}
      </div>
    </div>
    <div style={{padding: "120px 58px"}}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 124,
          lineHeight: 0.8,
          fontWeight: 900,
          letterSpacing: -6,
        }}
      >
        24
      </div>
      <div
        style={{
          marginTop: 24,
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: 1.6,
        }}
      >
        HOUR FORECAST
      </div>
      <div style={{marginTop: 70}}>
        <BodyGrid body={article.body} columns={1} width={620} fontSize={18} />
      </div>
    </div>
  </div>
);

const WideSans: React.FC<{article: Article}> = ({article}) => (
  <>
    <NavigationBar items={article.nav} dark={false} label="URBAN SYSTEMS" />
    <div style={{padding: "98px 70px 80px", width: 2470}}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 19,
          fontWeight: 900,
          letterSpacing: 1,
        }}
      >
        {article.section.toUpperCase()}
      </div>
      <h1
        style={{
          width: 2220,
          margin: "36px 0 24px",
          color: INK,
          fontFamily: SANS,
          fontSize: 124,
          lineHeight: 0.9,
          fontWeight: 900,
          letterSpacing: -6.2,
        }}
      >
        {article.headline}
      </h1>
      <div
        style={{
          width: 1680,
          color: "#42413c",
          fontFamily: SANS,
          fontSize: 26,
          lineHeight: 1.28,
        }}
      >
        {article.deck}
      </div>
      <div style={{marginTop: 55}}>
        <BodyGrid body={article.body} columns={2} width={1760} />
      </div>
    </div>
  </>
);

const SectionedSerif: React.FC<{article: Article}> = ({article}) => (
  <>
    <NavigationBar items={article.nav} />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        width: 1900,
        height: 1020,
      }}
    >
      <div
        style={{
          padding: "86px 48px",
          borderRight: `2px solid ${INK}`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: 1.2,
          }}
        >
          CONTENTS / 06
        </div>
        <div style={{marginTop: 48}}>
          <TagRow tags={article.tags} />
        </div>
        <div
          style={{
            marginTop: 88,
            color: MUTED,
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          A FIELD REPORT ON DATA, SIMULATION, AND RESPONSIBLE MODEL TESTING.
        </div>
      </div>
      <div style={{padding: "84px 74px"}}>
        <Metadata article={article} />
        <h1
          style={{
            width: 1390,
            margin: "48px 0 26px",
            color: INK,
            fontFamily: SERIF,
            fontSize: 106,
            lineHeight: 0.95,
            fontWeight: 500,
            letterSpacing: -4,
          }}
        >
          {article.headline}
        </h1>
        <div
          style={{
            width: 1190,
            color: "#43423d",
            fontFamily: SERIF,
            fontSize: 27,
            lineHeight: 1.34,
          }}
        >
          {article.deck}
        </div>
        <div style={{marginTop: 48}}>
          <BodyGrid body={article.body} columns={2} width={1280} />
        </div>
      </div>
    </div>
  </>
);

const ArticleContent: React.FC<{article: Article}> = ({article}) => {
  switch (article.variant) {
    case "lead-serif":
      return <LeadSerif article={article} />;
    case "nav-sans":
      return <NavSans article={article} />;
    case "center-sans":
      return <CenterSans article={article} />;
    case "tool-rail":
      return <ToolRailLayout article={article} />;
    case "chip-serif":
      return <ChipSerif article={article} />;
    case "data-grid":
      return <DataGrid article={article} />;
    case "minimal-serif":
      return <MinimalSerif article={article} />;
    case "nav-serif":
      return <NavSerif article={article} />;
    case "split-report":
      return <SplitReport article={article} />;
    case "wide-sans":
      return <WideSans article={article} />;
    case "sectioned-serif":
      return <SectionedSerif article={article} />;
  }
};

const StoryDeck: React.FC<{
  article: Article;
  style?: CSSProperties;
}> = ({article, style}) => (
  <div
    style={{
      color: "#3c3b36",
      fontFamily: SANS,
      fontSize: 24,
      lineHeight: 1.32,
      ...style,
    }}
  >
    {article.deck}
  </div>
);

const EditorialScaffold: React.FC<{
  article: Article;
  articleIndex: number;
}> = ({article, articleIndex}) => {
  const reportLabel = `FIELD REPORT ${String(articleIndex + 1).padStart(
    2,
    "0",
  )}`;

  switch (article.variant) {
    case "lead-serif":
      return (
        <>
          <div style={{position: "absolute", left: 84, top: 58}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 84,
              top: 58,
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            {reportLabel}
          </div>
          <div
            style={{
              position: "absolute",
              left: 84,
              right: 84,
              top: 214,
              height: 2,
              background: INK,
            }}
          />
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 84,
              top: 720,
              width: 1500,
            }}
          />
          <div style={{position: "absolute", left: 84, top: 820}}>
            <BodyGrid body={article.body} width={1750} fontSize={16} />
          </div>
        </>
      );

    case "nav-sans":
      return (
        <>
          <NavigationBar items={article.nav} label="NEURAL SYSTEMS / 02" />
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 116,
              fontFamily: SANS,
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 1.1,
              textTransform: "uppercase",
            }}
          >
            {article.section}
          </div>
          <div style={{position: "absolute", right: 86, top: 118}}>
            <Metadata article={article} />
          </div>
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 86,
              top: 718,
              width: 1540,
              fontSize: 27,
              fontWeight: 700,
            }}
          />
          <div style={{position: "absolute", left: 86, top: 824}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1680}
              fontSize={17}
            />
          </div>
        </>
      );

    case "center-sans":
      return (
        <>
          <div
            style={{
              position: "absolute",
              top: 100,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: SANS,
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 0.8,
            }}
          >
            {article.section}
          </div>
          <div style={{position: "absolute", top: 150, left: 0, right: 0}}>
            <Metadata article={article} align="center" />
          </div>
          <div
            style={{
              position: "absolute",
              top: 220,
              left: "50%",
              width: 116,
              height: 2,
              background: INK,
              transform: "translateX(-50%)",
            }}
          />
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: "50%",
              top: 716,
              width: 1200,
              textAlign: "center",
              transform: "translateX(-50%)",
              fontFamily: SERIF,
              fontSize: 27,
              fontStyle: "italic",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 826,
              transform: "translateX(-50%)",
            }}
          >
            <BodyGrid
              body={article.body}
              columns={2}
              width={1420}
              fontSize={16}
            />
          </div>
        </>
      );

    case "tool-rail":
      return (
        <>
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 84,
              bottom: 72,
              width: 2,
              background: INK,
            }}
          />
          <div style={{position: "absolute", left: 82, top: 420}}>
            <ToolRail />
          </div>
          <div style={{position: "absolute", left: 224, top: 82}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 82,
              top: 84,
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 1.8,
            }}
          >
            AUTONOMY / CITY LAB
          </div>
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 224,
              top: 716,
              width: 1450,
              fontWeight: 700,
              fontSize: 26,
            }}
          />
          <div style={{position: "absolute", left: 224, top: 824}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1500}
              fontSize={17}
            />
          </div>
        </>
      );

    case "chip-serif":
      return (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 78,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TagRow tags={article.tags} centered />
          </div>
          <div style={{position: "absolute", left: 0, right: 0, top: 144}}>
            <Metadata article={article} align="center" />
          </div>
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: "50%",
              top: 714,
              width: 1360,
              textAlign: "center",
              transform: "translateX(-50%)",
              fontFamily: SERIF,
              fontSize: 26,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 820,
              transform: "translateX(-50%)",
            }}
          >
            <BodyGrid
              body={article.body}
              columns={2}
              width={1500}
              fontSize={16}
            />
          </div>
        </>
      );

    case "data-grid":
      return (
        <>
          <div style={{position: "absolute", left: 84, top: 58}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 84,
              top: 58,
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 2.2,
            }}
          >
            SIGNAL / DECISION 06
          </div>
          <div
            style={{
              position: "absolute",
              left: 84,
              right: 84,
              top: 214,
              height: 2,
              background: INK,
            }}
          />
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 84,
              top: 700,
              width: 1500,
              fontSize: 25,
            }}
          />
          <div style={{position: "absolute", left: 84, top: 790}}>
            <BodyGrid body={article.body} width={1750} fontSize={16} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 84,
              right: 84,
              bottom: 42,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              fontFamily: SANS,
            }}
          >
            {[
              ["12×", "FASTER REVIEW"],
              ["03", "EVIDENCE LAYERS"],
              ["01", "HUMAN DECISION"],
            ].map(([number, label]) => (
              <div
                key={label}
                style={{
                  borderTop: `2px solid ${INK}`,
                  paddingTop: 10,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <span style={{fontSize: 31, fontWeight: 900}}>{number}</span>
                <span
                  style={{
                    color: MUTED,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      );

    case "minimal-serif":
      return (
        <>
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 76,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                border: `2px solid ${INK}`,
                borderRadius: "50%",
              }}
            />
            {article.section.toUpperCase()}
          </div>
          <div style={{position: "absolute", right: 86, top: 82}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 86,
              top: 218,
              width: 560,
              height: 2,
              background: INK,
            }}
          />
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 86,
              top: 716,
              width: 1340,
              fontFamily: SERIF,
              fontSize: 27,
            }}
          />
          <div style={{position: "absolute", left: 86, top: 828}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1570}
              fontSize={17}
            />
          </div>
        </>
      );

    case "nav-serif":
      return (
        <>
          <NavigationBar items={article.nav} label="VISION / LANGUAGE" />
          <div style={{position: "absolute", left: 84, top: 112}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 84,
              top: 112,
              fontFamily: SERIF,
              fontSize: 18,
              fontStyle: "italic",
            }}
          >
            Multimodal systems field note
          </div>
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 84,
              top: 700,
              width: 1550,
              fontFamily: SERIF,
              fontSize: 27,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 84,
              right: 84,
              top: 790,
              height: 2,
              background: INK,
            }}
          />
          <div style={{position: "absolute", left: 84, top: 830}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1720}
              fontSize={16}
            />
          </div>
        </>
      );

    case "split-report":
      return (
        <>
          <div style={{position: "absolute", left: 84, top: 74}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 1535,
              top: 52,
              bottom: 52,
              width: 2,
              background: INK,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 1585,
              top: 76,
              fontFamily: SANS,
              fontSize: 124,
              lineHeight: 0.8,
              fontWeight: 900,
              letterSpacing: -6,
            }}
          >
            24
          </div>
          <div
            style={{
              position: "absolute",
              left: 1590,
              top: 190,
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            HOUR FORECAST
          </div>
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 84,
              top: 716,
              width: 1320,
              fontFamily: SERIF,
              fontSize: 27,
              fontStyle: "italic",
            }}
          />
          <div style={{position: "absolute", left: 84, top: 828}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1390}
              fontSize={16}
            />
          </div>
          <div style={{position: "absolute", left: 1590, top: 340}}>
            <BodyGrid
              body={article.body}
              columns={1}
              width={260}
              fontSize={15}
            />
          </div>
        </>
      );

    case "wide-sans":
      return (
        <>
          <NavigationBar
            items={article.nav}
            dark={false}
            label="URBAN SYSTEMS / 10"
          />
          <div
            style={{
              position: "absolute",
              left: 82,
              top: 112,
              fontFamily: SANS,
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {article.section}
          </div>
          <div style={{position: "absolute", right: 82, top: 112}}>
            <Metadata article={article} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 82,
              right: 82,
              top: 214,
              height: 3,
              background: INK,
            }}
          />
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 82,
              top: 704,
              width: 1530,
              fontSize: 26,
              fontWeight: 700,
            }}
          />
          <div style={{position: "absolute", left: 82, top: 816}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1740}
              fontSize={17}
            />
          </div>
        </>
      );

    case "sectioned-serif":
      return (
        <>
          <NavigationBar items={article.nav} label="DATA / RESEARCH" />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 60,
              bottom: 0,
              width: 286,
              borderRight: `2px solid ${INK}`,
              padding: "62px 38px",
            }}
          >
            <div
              style={{
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 1.2,
              }}
            >
              CONTENTS / 11
            </div>
            <div style={{marginTop: 44}}>
              <TagRow tags={article.tags} />
            </div>
            <div
              style={{
                marginTop: 70,
                color: MUTED,
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              DATA, SIMULATION, AND RESPONSIBLE MODEL TESTING.
            </div>
          </div>
          <div style={{position: "absolute", left: 336, top: 112}}>
            <Metadata article={article} />
          </div>
          <StoryDeck
            article={article}
            style={{
              position: "absolute",
              left: 336,
              top: 710,
              width: 1370,
              fontFamily: SERIF,
              fontSize: 27,
            }}
          />
          <div style={{position: "absolute", left: 336, top: 824}}>
            <BodyGrid
              body={article.body}
              columns={2}
              width={1430}
              fontSize={16}
            />
          </div>
        </>
      );
  }
};

const IntegratedHeadline: React.FC<{
  article: Article;
  articleIndex: number;
}> = ({article, articleIndex}) => {
  const typography =
    FOCUS_TYPOGRAPHY[articleIndex % FOCUS_TYPOGRAPHY.length] ??
    FOCUS_TYPOGRAPHY[0];
  const [prefix = "", suffix = ""] = article.headline.split("Deep Learning");
  const anchorHalfWidth = 488;
  const contextGap = 32;
  const centerOffsetX = typography.opticalShiftX;
  const sharedTextStyle: CSSProperties = {
    color: INK,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontStyle: typography.fontStyle ?? "normal",
    fontWeight: typography.fontWeight,
    letterSpacing: typography.letterSpacing,
    lineHeight: 1,
    textRendering: "geometricPrecision",
    whiteSpace: "nowrap",
  };

  return (
    <h1
      aria-label={article.headline}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        margin: 0,
        pointerEvents: "none",
      }}
    >
      {prefix.trim().length > 0 ? (
        <span
          style={{
            ...sharedTextStyle,
            position: "absolute",
            right: `calc(50% + ${
              anchorHalfWidth + contextGap - centerOffsetX
            }px)`,
            top: "calc(50% - 10px)",
            transform: `translateY(-50%) scaleX(${typography.scaleX})`,
            transformOrigin: "right center",
          }}
        >
          {prefix.trim()}
        </span>
      ) : null}

      <span
        style={{
          ...sharedTextStyle,
          position: "absolute",
          left: `calc(50% + ${centerOffsetX}px)`,
          top: "calc(50% - 10px)",
          transform: `translate(-50%, -50%) scaleX(${typography.scaleX})`,
          transformOrigin: "center center",
        }}
      >
        Deep Learning
      </span>

      {suffix.trim().length > 0 ? (
        <span
          style={{
            ...sharedTextStyle,
            position: "absolute",
            left: `calc(50% + ${
              anchorHalfWidth + contextGap + centerOffsetX
            }px)`,
            top: "calc(50% - 10px)",
            transform: `translateY(-50%) scaleX(${typography.scaleX})`,
            transformOrigin: "left center",
          }}
        >
          {suffix.trim()}
        </span>
      ) : null}
    </h1>
  );
};

const ArticlePage: React.FC<{
  article: Article;
  articleIndex: number;
}> = ({article, articleIndex}) => {
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: PAPER,
        color: INK,
      }}
    >
      <EditorialScaffold article={article} articleIndex={articleIndex} />
      <IntegratedHeadline article={article} articleIndex={articleIndex} />
      <div
        style={{
          position: "absolute",
          right: 34,
          bottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#77756e",
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.4,
        }}
      >
        <span style={{width: 42, height: 1, background: "#77756e"}} />
        {String(articleIndex + 1).padStart(2, "0")} / FIELD REPORTS
      </div>
    </AbsoluteFill>
  );
};

const PaperTexture: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      mixBlendMode: "multiply",
      opacity: 0.13,
    }}
  >
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      <filter id="paper-grain" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.74"
          numOctaves="3"
          seed="24"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.32
                  0 0 0 0 0.31
                  0 0 0 0 0.28
                  0 0 0 0.12 0"
        />
      </filter>
      <rect width="1920" height="1080" filter="url(#paper-grain)" />
    </svg>
  </AbsoluteFill>
);

const RadialStreaks: React.FC<{
  intensity: number;
  origin: string;
}> = ({intensity, origin}) => {
  if (intensity < 0.025) {
    return null;
  }

  const [originXText = "50%", originYText = "48%"] = origin.split(" ");
  const originX = (Number.parseFloat(originXText) / 100) * 1920;
  const originY = (Number.parseFloat(originYText) / 100) * 1080;
  const endpoints = [
    [0, 0],
    [180, 0],
    [380, 0],
    [620, 0],
    [860, 0],
    [1100, 0],
    [1340, 0],
    [1580, 0],
    [1780, 0],
    [1920, 0],
    [1920, 150],
    [1920, 340],
    [1920, 540],
    [1920, 760],
    [1920, 980],
    [1920, 1080],
    [1680, 1080],
    [1420, 1080],
    [1160, 1080],
    [900, 1080],
    [640, 1080],
    [380, 1080],
    [120, 1080],
    [0, 1080],
    [0, 850],
    [0, 620],
    [0, 400],
    [0, 180],
  ] as const;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: intensity,
        mixBlendMode: "multiply",
      }}
    >
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <filter id="ray-soften">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <g filter="url(#ray-soften)">
          {endpoints.map(([x, y], index) => (
            <line
              key={`${x}-${y}`}
              x1={originX}
              y1={originY}
              x2={x}
              y2={y}
              stroke={INK}
              strokeWidth={index % 4 === 0 ? 3 : 1.5}
              strokeOpacity={index % 3 === 0 ? 0.05 : 0.022}
              strokeDasharray={index % 2 === 0 ? "54 72" : "84 104"}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const burstLevelForBeat = (beat: number): number => {
  const time = (beat * BEAT_FRAMES) / FPS;
  const cluster =
    time < 0.95 ||
    (time >= 3.16 && time < 4.86) ||
    (time >= 7.64 && time < 8.77);

  const clusterPattern = [
    0.96, 0.72, 0.86, 0.66, 1, 0.78, 0.7, 0.9, 0.76, 0.84, 0.68,
  ];

  // The reference contains 63 one-frame blur transitions and 12 hard cuts.
  // One deliberate cut every six beats preserves almost the same ratio.
  if (beat % 6 === 1) {
    return 0;
  }

  if (cluster) {
    return clusterPattern[beat % clusterPattern.length] ?? 0.7;
  }

  const steadyPattern = [0.62, 0.54, 0.68, 0.58, 0.72];
  return steadyPattern[beat % steadyPattern.length] ?? 0.6;
};

const ZoomSmear: React.FC<{
  article: Article;
  articleIndex: number;
  intensity: number;
}> = ({article, articleIndex, intensity}) => {
  const echoes = [1, 2, 3, 4, 5, 6];
  const origin = "50% 50%";

  return (
    <AbsoluteFill style={{overflow: "hidden", backgroundColor: PAPER}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1 + intensity * 0.045})`,
          transformOrigin: origin,
          filter: `blur(${intensity * 1.9}px)`,
        }}
      >
        <ArticlePage article={article} articleIndex={articleIndex} />
      </div>

      {intensity > 0.025
        ? echoes.map((echo) => {
            const normalized = echo / echoes.length;
            const scale = 1 + intensity * (0.035 + normalized * 0.21);
            const opacity =
              intensity * (0.17 - normalized * 0.085) * (1 - normalized * 0.08);

            return (
              <div
                key={echo}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity,
                  transform: `scale(${scale})`,
                  transformOrigin: origin,
                  filter: `blur(${1.2 + normalized * intensity * 7}px)`,
                  mixBlendMode: "multiply",
                }}
              >
                <ArticlePage article={article} articleIndex={articleIndex} />
              </div>
            );
          })
        : null}

      <RadialStreaks intensity={intensity * 0.9} origin={origin} />
    </AbsoluteFill>
  );
};

const EditorialFinish: React.FC<{frame: number}> = ({frame}) => {
  const pulse =
    0.01 +
    interpolate(frame % 9, [0, 4, 8], [0, 0.008, 0], {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    });

  return (
    <>
      <PaperTexture />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: "inset 0 0 120px rgba(25, 24, 20, 0.035)",
          background: `rgba(28, 27, 24, ${pulse})`,
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = Math.floor(frame / BEAT_FRAMES);
  const localFrame = frame % BEAT_FRAMES;
  const isFinalHold = frame >= 525;
  const articleIndex = isFinalHold ? 5 : beat % ARTICLES.length;
  const article = ARTICLES[articleIndex] ?? ARTICLES[0];
  const transitionLevel = isFinalHold ? 0 : burstLevelForBeat(beat);

  const exitProgress = interpolate(localFrame, [4, 6], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });
  const intensity = transitionLevel * exitProgress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER,
        overflow: "hidden",
      }}
    >
      <ZoomSmear
        article={article}
        articleIndex={articleIndex}
        intensity={intensity}
      />
      <EditorialFinish frame={frame} />
    </AbsoluteFill>
  );
};
