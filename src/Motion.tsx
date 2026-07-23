import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';

/**
 * MOTION — "Deep Learning Headlines | Fast News Sequence"
 * 1920x1080 • 60 fps • 900 frames (15 s) • seamless loop
 *
 * Prinsip utama (dari analisa frame-by-frame referensi):
 * - Kata kunci "Deep Learning" TERKUNCI di pusat frame (960, 520) di SEMUA
 *   halaman. Teks di sekitarnya, layout, font, dan ketebalan berganti cepat,
 *   tetapi keyword tidak pernah berpindah — inilah focal point video.
 *   Posisi dihitung presisi dengan measureText, jadi akurat di font apa pun.
 * - Hard cut setiap ~0.2–0.9 s dengan "zoom-blur burst" vertikal-radial
 *   yang berpusat DI keyword, sehingga keyword tetap semi-terbaca saat blur.
 * - Push-in sangat halus selama hold, juga berpusat di keyword.
 * - Shot pertama masuk dari blur, shot terakhir keluar ke blur → loop mulus.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KW = 'Deep Learning';
const ANCHOR_X = 960;
const ANCHOR_Y = 520; // ≈48% tinggi frame, sesuai referensi
const ORIGIN = `${(ANCHOR_X / 1920) * 100}% ${(ANCHOR_Y / 1080) * 100}%`;

const INK = '#0d0d0d';
const INK_SOFT = '#2e2e2e';
const GREY = '#555555';
const GREY_LIGHT = '#8a8a8a';
const PAPER = '#ffffff';
const NAV_BG = '#3b3b3b';

const SANS = "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF_OLD = "Georgia, 'Times New Roman', serif";
const SERIF_NEWS = "'Times New Roman', Times, Georgia, serif";
const ROUND = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";
const GROT = 'Verdana, Geneva, Arial, sans-serif';
const FAT = "'Cooper Black', 'Arial Rounded MT Bold', Georgia, serif";

const NBSP = ' ';

// ---------------------------------------------------------------------------
// Pengukur teks mandiri (tanpa @remotion/layout-utils).
// Remotion me-render di dalam Chrome, jadi Canvas 2D measureText tersedia
// dan deterministik antar-frame. Ada fallback aman bila document tak ada.
// ---------------------------------------------------------------------------

const _getMeasureCtx = (() => {
  let ctx: CanvasRenderingContext2D | null | undefined;
  return (): CanvasRenderingContext2D | null => {
    if (ctx !== undefined) return ctx;
    ctx =
      typeof document !== 'undefined'
        ? document.createElement('canvas').getContext('2d')
        : null;
    return ctx;
  };
})();

const measureText = ({
  text,
  fontFamily,
  fontSize,
  fontWeight = 400,
}: {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: string | number;
}): {width: number} => {
  const ctx = _getMeasureCtx();
  if (!ctx) {
    // Perkiraan kasar bila kanvas tak tersedia (mis. saat SSR).
    return {width: text.length * fontSize * 0.5};
  }
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return {width: ctx.measureText(text).width};
};

// ---------------------------------------------------------------------------
// Keyword anchoring — hitung offset agar substring "Deep Learning"
// selalu berpusat tepat di (ANCHOR_X, ANCHOR_Y)
// ---------------------------------------------------------------------------

type KwFont = {
  font: string;
  size: number;
  weight: number | string;
  lh: number;
};

const kwLayout = (cfg: KwFont, pre = '') => {
  const opts = {
    fontFamily: cfg.font,
    fontSize: cfg.size,
    fontWeight: String(cfg.weight),
  };
  const kwW = measureText({text: KW, ...opts}).width;
  const preW = pre ? measureText({text: pre, ...opts}).width : 0;
  const lineH = cfg.size * cfg.lh;
  return {
    left: ANCHOR_X - preW - kwW / 2, // tepi kiri baris yang memuat keyword
    top: ANCHOR_Y - lineH / 2, // tepi atas baris keyword
    lineH,
    kwW,
    preW,
  };
};

const lineWidth = (cfg: KwFont, text: string) =>
  measureText({
    text,
    fontFamily: cfg.font,
    fontSize: cfg.size,
    fontWeight: String(cfg.weight),
  }).width;

const HLine: React.FC<{
  left: number;
  top: number;
  cfg: KwFont;
  color?: string;
  children: React.ReactNode;
}> = ({left, top, cfg, color = INK, children}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      fontFamily: cfg.font,
      fontSize: cfg.size,
      fontWeight: cfg.weight as never,
      lineHeight: cfg.lh,
      color,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const NavBar: React.FC<{
  items: string[];
  top: number;
  font?: string;
  italic?: boolean;
  fontSize?: number;
  offsetX?: number;
}> = ({items, top, font = SANS, italic = false, fontSize = 30, offsetX = 0}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: -200,
      width: 2400,
      height: 96,
      background: NAV_BG,
      display: 'flex',
      alignItems: 'center',
      gap: 90,
      paddingLeft: 260 + offsetX,
      fontFamily: font,
      fontStyle: italic ? 'italic' : 'normal',
      fontWeight: 700,
      fontSize,
      color: '#f2f2f2',
      whiteSpace: 'nowrap',
    }}
  >
    {items.map((it) => (
      <span key={it}>{it}</span>
    ))}
  </div>
);

const Chip: React.FC<{label: string}> = ({label}) => (
  <span
    style={{
      background: '#333333',
      color: '#f5f5f5',
      fontFamily: SERIF_OLD,
      fontSize: 30,
      padding: '10px 26px',
      borderRadius: 6,
      marginRight: 26,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

const Body: React.FC<{
  text: string;
  width: number;
  fontSize?: number;
  font?: string;
  color?: string;
  justify?: boolean;
  lineHeight?: number;
}> = ({
  text,
  width,
  fontSize = 25,
  font = SANS,
  color = INK_SOFT,
  justify = false,
  lineHeight = 1.55,
}) => (
  <div
    style={{
      width,
      fontFamily: font,
      fontSize,
      lineHeight,
      color,
      textAlign: justify ? 'justify' : 'left',
    }}
  >
    {text}
  </div>
);

const ShareRail: React.FC<{left: number; top: number}> = ({left, top}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      display: 'flex',
      flexDirection: 'column',
      gap: 44,
      color: GREY,
    }}
  >
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="18" cy="5" r="3" stroke={GREY} strokeWidth="1.8" />
      <circle cx="6" cy="12" r="3" stroke={GREY} strokeWidth="1.8" />
      <circle cx="18" cy="19" r="3" stroke={GREY} strokeWidth="1.8" />
      <path d="M8.6 10.6l6.8-4.1M8.6 13.4l6.8 4.1" stroke={GREY} strokeWidth="1.8" />
    </svg>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12v18l-6-4.5L6 21V3z" stroke={GREY} strokeWidth="1.8" />
    </svg>
    <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 600}}>
      A<span style={{fontSize: 20}}>a</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Article pages — setiap halaman meletakkan "Deep Learning" tepat di anchor,
// teks lain mengalir dari posisi itu dan boleh bleed keluar frame
// ---------------------------------------------------------------------------

const LOREM_TECH =
  'Deep learning has become a driving force in advancing modern technology, greatly improving accuracy and reliability across industries. These innovations are powering everything from personal assistants to real-time analysis tools, revolutionizing how humans and machines interact. By training on large, unstructured datasets, neural networks learn to recognize patterns through successive layers of data processing, distinguishing subtle differences that traditional methods routinely miss.';

const LOREM_DATA =
  'Deep learning is fundamentally changing the way predictions are made across various sectors. Traditional analytics relied on linear models and structured data, often limited in their ability to capture complexity. Deep learning, however, thrives on vast amounts of unstructured data and can identify intricate patterns that were previously difficult to uncover.';

// --- 1. Modern sans, kw membuka baris pertama dari 3 baris -----------------

const PageDrugDiscovery: React.FC = () => {
  const cfg: KwFont = {font: SANS, size: 108, weight: 800, lh: 1.18};
  const L = kwLayout(cfg);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top - 96,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 36,
          color: INK_SOFT,
        }}
      >
        Technology &amp; Health
      </div>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        {KW}
      </HLine>
      <HLine left={L.left} top={L.top + L.lineH} cfg={cfg}>
        in Drug Discovery:
      </HLine>
      <HLine left={L.left} top={L.top + 2 * L.lineH} cfg={cfg}>
        Medical Innovations
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 6,
          top: L.top + 3 * L.lineH + 44,
          fontFamily: SANS,
          fontStyle: 'italic',
          fontSize: 32,
          color: GREY,
        }}
      >
        June 4, 2024
      </div>
    </AbsoluteFill>
  );
};

// --- 2. Sans bold + share rail, kw membuka baris pertama -------------------

const PageAutonomous: React.FC = () => {
  const cfg: KwFont = {font: SANS, size: 100, weight: 700, lh: 1.2};
  const L = kwLayout(cfg);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top - 208,
          fontFamily: SANS,
          fontSize: 26,
          color: GREY,
        }}
      >
        06-02-24 | 10:00 AM
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top - 132,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 34,
          color: INK_SOFT,
        }}
      >
        AI &amp; Automation
      </div>
      <ShareRail left={L.left - 118} top={L.top + 24} />
      <HLine left={L.left} top={L.top} cfg={cfg}>
        {KW}
        {NBSP}for
      </HLine>
      <HLine left={L.left} top={L.top + L.lineH} cfg={cfg}>
        Autonomous Systems:
      </HLine>
      <HLine left={L.left} top={L.top + 2 * L.lineH} cfg={cfg}>
        Revolutionizing Technology
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top + 3 * L.lineH + 40,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 34,
          color: '#444444',
          whiteSpace: 'nowrap',
        }}
      >
        The integration of deep learning in self-driving cars, industrial
        automation and human-machine collaboration.
      </div>
    </AbsoluteFill>
  );
};

// --- 3. Rounded bold, kw di tengah satu baris sangat panjang ---------------

const PageIntersection: React.FC = () => {
  const cfg: KwFont = {font: ROUND, size: 118, weight: 800, lh: 1.2};
  const L = kwLayout(cfg, `Intersection of${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <NavBar
        top={L.top - 250}
        font={SANS}
        fontSize={31}
        items={[
          'Advances',
          'Ethics & Policy',
          'Interviews',
          'Opinion & Analysis',
          'Tutorials & Guides',
        ]}
        offsetX={-60}
      />
      <HLine left={L.left} top={L.top} cfg={cfg}>
        Intersection of{NBSP}
        {KW} and Humanity
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: ANCHOR_X,
          top: L.top + L.lineH + 40,
          transform: 'translateX(-50%)',
          fontFamily: ROUND,
          fontWeight: 700,
          fontSize: 40,
          color: INK_SOFT,
          whiteSpace: 'nowrap',
        }}
      >
        As learning algorithms evolve, the boundaries between artificial
        intelligence and human creativity continue to blur.
      </div>
    </AbsoluteFill>
  );
};

// --- 4. Serif old-style + chips, kw membuka baris pertama ------------------

const PageCyber: React.FC = () => {
  const cfg: KwFont = {font: SERIF_OLD, size: 106, weight: 400, lh: 1.26};
  const L = kwLayout(cfg);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top - 122,
          whiteSpace: 'nowrap',
        }}
      >
        <Chip label="Industry News" />
        <Chip label="Applications" />
        <Chip label="Security & Privacy" />
        <Chip label="Development" />
        <Chip label="Insights" />
      </div>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        {KW}
        {NBSP}for
      </HLine>
      <HLine left={L.left} top={L.top + L.lineH} cfg={cfg}>
        Cybersecurity: Safeguarding Data
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top + 2 * L.lineH + 56,
          fontFamily: SERIF_OLD,
          fontSize: 40,
          color: INK_SOFT,
          whiteSpace: 'nowrap',
        }}
      >
        As cyber threats evolve, deep learning models are enhancing the defense
        of critical systems.
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + 2 * L.lineH + 170,
          fontFamily: SANS,
          fontSize: 27,
          color: GREY,
        }}
      >
        06-03-24 | 08:00 AM
      </div>
    </AbsoluteFill>
  );
};

// --- 5. Grotesque bold + nav terang, kw menutup baris kedua ----------------

const PageSmartCities: React.FC = () => {
  const cfg: KwFont = {font: GROT, size: 98, weight: 700, lh: 1.24};
  const L = kwLayout(cfg, `Powered by${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -100,
          width: 2200,
          height: 68,
          borderBottom: '2px solid #d9d9d9',
          display: 'flex',
          alignItems: 'center',
          gap: 70,
          paddingLeft: 120,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 25,
          color: INK_SOFT,
          whiteSpace: 'nowrap',
        }}
      >
        <span>Apps &amp; Devices</span>
        <span>Startups &amp; Innovation</span>
        <span>Product Reviews</span>
        <span>Opinion &amp; Analysis</span>
        <span>Cybersecurity</span>
        <span>Tech Policy</span>
      </div>
      <HLine left={L.left} top={L.top - L.lineH} cfg={cfg}>
        Future of Smart Cities
      </HLine>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        Powered by{NBSP}
        {KW}
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top + L.lineH + 44,
          fontFamily: GROT,
          fontSize: 33,
          color: '#454545',
          whiteSpace: 'nowrap',
        }}
      >
        Leveraging deep learning to optimize energy usage and traffic
        management.
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.left + 2,
          top: L.top + L.lineH + 150,
        }}
      >
        <Body
          text={
            'Urban infrastructure is rapidly evolving, and deep learning is playing a critical role in this transformation. By using advanced models that process vast amounts of data in real time, cities can optimize energy usage, traffic flow and public safety. This technology allows urban systems to be more efficient and responsive, adapting to the needs of citizens as they change.'
          }
          width={1240}
          fontSize={26}
          font={GROT}
          color={GREY}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- 6. Serif koran + nav italic, kw menutup baris kedua -------------------

const PageImageSpeech: React.FC = () => {
  const cfg: KwFont = {font: SERIF_NEWS, size: 106, weight: 400, lh: 1.32};
  const L = kwLayout(cfg, `Recognition with${NBSP}`);
  const line1W = lineWidth(cfg, 'Revolutionizing Image and Speech');
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <NavBar
        top={0}
        font={SERIF_NEWS}
        italic
        fontSize={30}
        items={[
          'Privacy',
          'Case Studies',
          'Applications',
          'Opinion & Analysis',
          'Art & Culture',
          'Health & Society',
        ]}
        offsetX={-90}
      />
      <HLine left={ANCHOR_X - line1W / 2} top={L.top - L.lineH} cfg={cfg}>
        Revolutionizing Image and Speech
      </HLine>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        Recognition with{NBSP}
        {KW}
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: ANCHOR_X,
          top: L.top + L.lineH + 48,
          transform: 'translateX(-50%)',
          fontFamily: SERIF_NEWS,
          fontSize: 38,
          color: INK_SOFT,
          whiteSpace: 'nowrap',
        }}
      >
        Deep learning is pushing the boundaries of image and speech
        recognition, making machines see and listen.
      </div>
      <div
        style={{
          position: 'absolute',
          left: ANCHOR_X,
          top: L.top + L.lineH + 180,
          transform: 'translateX(-50%)',
        }}
      >
        <Body
          text={LOREM_TECH}
          width={2050}
          fontSize={28}
          font={SERIF_NEWS}
          justify
          color={INK_SOFT}
          lineHeight={1.5}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- 7. Serif bold editorial, kw di tengah baris kedua ---------------------

const PageDataDecisions: React.FC = () => {
  const cfg: KwFont = {font: SERIF_OLD, size: 102, weight: 700, lh: 1.34};
  const L = kwLayout(cfg, `How${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top - L.lineH - 84,
          fontFamily: SANS,
          fontSize: 27,
          color: GREY,
        }}
      >
        06-04-24 | 6:00 AM
      </div>
      <HLine left={L.left} top={L.top - L.lineH} cfg={cfg}>
        From Data to Decisions:
      </HLine>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        How{NBSP}
        {KW} is Revolutionizing Analytics
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + L.lineH + 40,
          fontFamily: SANS,
          fontSize: 33,
          color: '#3f3f3f',
          whiteSpace: 'nowrap',
        }}
      >
        Deep learning has transformed how organizations harness data, offering
        new ways to analyze and act.
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + L.lineH + 160,
        }}
      >
        <Body text={LOREM_DATA} width={1560} fontSize={25} color={GREY} />
        <div style={{marginTop: 26}}>
          <Body
            text={
              'By training on large datasets, deep learning algorithms continuously improve their accuracy, making predictions sharper with every iteration and turning raw information into confident business decisions.'
            }
            width={1560}
            fontSize={25}
            color={GREY}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- 8. Fat slab + nav serif, kw di tengah satu baris panjang --------------

const PageAlgorithms: React.FC = () => {
  const cfg: KwFont = {font: FAT, size: 104, weight: 900, lh: 1.25};
  const L = kwLayout(cfg, `Data Security with${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <NavBar
        top={0}
        font={SERIF_OLD}
        fontSize={29}
        items={[
          'Education & Learning',
          'Environment & Sustainability',
          'Startups & Investment',
          'World & Politics',
        ]}
        offsetX={-160}
      />
      <HLine left={L.left} top={L.top} cfg={cfg}>
        Data Security with{NBSP}
        {KW} Algorithms
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: ANCHOR_X,
          top: L.top + L.lineH + 66,
          transform: 'translateX(-50%)',
        }}
      >
        <Body
          text={
            'Deep learning is quickly becoming a vital tool in safeguarding sensitive information across industries. With its ability to process vast patterns, deep learning algorithms are making significant strides in detecting anomalies and preventing potential breaches. Conventional methods of data security often fall short in identifying sophisticated attacks, but deep learning provides a more adaptive protection. Anomaly detection is one of the key applications where deep learning shines. By analyzing behavior patterns in data systems, models flag activity that may signal a threat, such as unauthorized access or suspicious transactions.'
          }
          width={2300}
          fontSize={29}
          font={SERIF_OLD}
          justify
          color={INK_SOFT}
          lineHeight={1.6}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- 9. Light sans, kw di awal-tengah satu baris panjang -------------------

const PagePredictive: React.FC = () => {
  const cfg: KwFont = {font: SANS, size: 96, weight: 300, lh: 1.25};
  const L = kwLayout(cfg, `Power of${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top - 92,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 30,
          color: GREY,
        }}
      >
        AI Development
      </div>
      <HLine left={L.left} top={L.top} cfg={cfg} color="#1a1a1a">
        Power of{NBSP}
        {KW} for Predictive Analytics
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + L.lineH + 36,
          fontFamily: SANS,
          fontStyle: 'italic',
          fontSize: 32,
          color: GREY,
          whiteSpace: 'nowrap',
        }}
      >
        Empowering industries to predict outcomes more accurately, from market
        trends to patient care.
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + L.lineH + 150,
        }}
      >
        <Body
          text={
            'Deep learning is a powerful tool for predictive analytics, enabling industries to forecast outcomes with greater precision. This is achieved by processing enormous amounts of data and identifying patterns that traditional models might miss. By applying complex algorithms, systems analyze datasets in real time, offering insights that help organizations anticipate trends and make informed decisions. In finance, deep learning models are used to predict market fluctuations, allowing businesses to manage risk more effectively.'
          }
          width={1800}
          fontSize={26}
          color={GREY}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- 10. Serif bold, kw di tengah satu baris panjang -----------------------

const PageClimate: React.FC = () => {
  const cfg: KwFont = {font: SERIF_OLD, size: 100, weight: 700, lh: 1.26};
  const L = kwLayout(cfg, `Potential of${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top - 100,
          fontFamily: SANS,
          fontSize: 25,
          color: GREY_LIGHT,
          whiteSpace: 'nowrap',
        }}
      >
        06-01-24 8:30 AM GMT +2 &nbsp;-&nbsp; Last Updated 5 hours ago
      </div>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        Potential of{NBSP}
        {KW} in Climate Modeling
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + L.lineH + 34,
          fontFamily: SANS,
          fontSize: 30,
          color: '#454545',
          whiteSpace: 'nowrap',
        }}
      >
        Using deep learning to process climate data and make more accurate
        predictions of environmental changes.
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + L.lineH + 148,
        }}
      >
        <Body
          text={
            'Deep learning is revolutionizing climate modeling by offering more accurate predictions of future environmental changes. Traditional climate models, while effective, often struggle with the immense complexity and volume of data needed to predict long-term shifts. Deep learning provides a solution by processing vast datasets, such as atmospheric readings, satellite imagery and ocean temperatures, at unprecedented speed.'
          }
          width={1600}
          fontSize={28}
          color={GREY}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- 11. Serif koran ringan, kw di tengah baris pertama --------------------

const PageHci: React.FC = () => {
  const cfg: KwFont = {font: SERIF_NEWS, size: 100, weight: 400, lh: 1.32};
  const L = kwLayout(cfg, `Role of${NBSP}`);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <HLine left={L.left} top={L.top} cfg={cfg}>
        Role of{NBSP}
        {KW} in
      </HLine>
      <HLine left={L.left} top={L.top + L.lineH} cfg={cfg}>
        Human-Computer Interaction
      </HLine>
      <div
        style={{
          position: 'absolute',
          left: L.left + 4,
          top: L.top + 2 * L.lineH + 52,
          fontFamily: SERIF_NEWS,
          fontSize: 36,
          lineHeight: 1.5,
          color: INK_SOFT,
          width: 1900,
        }}
      >
        From virtual assistants to voice recognition, deep learning is creating
        more intuitive and natural interactions between humans and machines.
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Shot list — ritme meniru referensi: hold pembuka panjang -> klaster
// rapid-fire -> hold sedang -> klaster lagi. Total = 900 frame tepat.
// ---------------------------------------------------------------------------

const PAGES: Record<string, React.FC> = {
  climate: PageClimate,
  intersection: PageIntersection,
  drug: PageDrugDiscovery,
  autonomous: PageAutonomous,
  datadec: PageDataDecisions,
  smart: PageSmartCities,
  imgspeech: PageImageSpeech,
  predictive: PagePredictive,
  algorithms: PageAlgorithms,
  cyber: PageCyber,
  hci: PageHci,
};

// ---------------------------------------------------------------------------
// Timeline HASIL PENGUKURAN motion_probe/frame-diff pada referensi (25 fps):
// - Halaman bertahan 1–3 frame sumber (0.04–0.12 s) — jauh lebih cepat dari
//   perkiraan still-sampling — dan BENAR-BENAR statis selama tampil
//   (diff antar frame duplikat ≈ 0.001; tidak ada push-in).
// - Transisi = SATU frame blur zoom radial pada halaman keluar (0.04 s);
//   sebagian cut adalah hard cut tanpa blur.
// - Pola makro berulang ±1.4 s (12 halaman/siklus):
//   [L·B·S·B]×2·L → [M·B]×6·M   (L=3f, M=2f, S=1f, B=1f blur @25fps)
// Diskalakan ke 15 s @60 fps (rasio 15/8.84) dengan ritme relatif terjaga:
//   L=12, M=8, S=4, B=4 frame → siklus 140 frame, ±6.4 siklus per 900 frame.
// ---------------------------------------------------------------------------

const F_L = 12; // hold panjang
const F_M = 8; // hold sedang
const F_S = 4; // hold kilat
const F_B = 4; // frame blur transisi

type Seg = {kind: 'page' | 'blur'; p: keyof typeof PAGES; v: number; f: number};

// Urutan halaman: semua desain dirotasi tanpa pengulangan berdekatan
const PAGE_ORDER: Array<keyof typeof PAGES> = [
  'climate', 'intersection', 'drug', 'autonomous', 'datadec', 'smart',
  'imgspeech', 'predictive', 'algorithms', 'cyber', 'hci',
];

const buildSegments = (total: number): Seg[] => {
  // satu siklus terukur: hold (frame) + apakah diikuti frame blur
  const CYCLE: Array<{h: number; blur: boolean}> = [
    {h: F_L, blur: true}, {h: F_S, blur: true},
    {h: F_L, blur: true}, {h: F_S, blur: true},
    {h: F_L, blur: false}, // hard cut (terukur: "3 2" tanpa frame blur)
    {h: F_M, blur: true}, {h: F_M, blur: true}, {h: F_M, blur: true},
    {h: F_M, blur: true}, {h: F_M, blur: true}, {h: F_M, blur: true},
    {h: F_M, blur: false}, // hard cut ke awal siklus berikutnya
  ];
  const segs: Seg[] = [];
  let acc = 0;
  let pi = 0;
  outer: for (let cycle = 0; ; cycle++) {
    for (const u of CYCLE) {
      const p = PAGE_ORDER[pi % PAGE_ORDER.length];
      const v = Math.floor(pi / PAGE_ORDER.length);
      pi++;
      segs.push({kind: 'page', p, v, f: u.h});
      acc += u.h;
      if (acc >= total) break outer;
      if (u.blur) {
        segs.push({kind: 'blur', p, v, f: F_B});
        acc += F_B;
        if (acc >= total) break outer;
      }
    }
  }
  // pangkas segmen terakhir agar total tepat
  const over = acc - total;
  if (over > 0) segs[segs.length - 1].f -= over;
  return segs;
};

const TOTAL = 900;
const SEGMENTS = buildSegments(TOTAL);

// Variasi framing HANYA lewat scale di sekitar anchor — keyword tidak
// pernah bergeser dari pusat, hanya sedikit lebih besar/kecil per shot.
const VARIANTS = [1.0, 1.12, 1.05, 1.18];

// ---------------------------------------------------------------------------
// Fake radial/vertical zoom blur — tumpukan salinan yang diskalakan
// (dominan vertikal) berpusat di keyword, meniru streak pada referensi.
// Saat blur = 0 hanya render 1 salinan (murah selama hold).
// ---------------------------------------------------------------------------

const ZoomBlur: React.FC<{blur: number; children: React.ReactNode}> = ({
  blur,
  children,
}) => {
  if (blur < 0.005) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  // 22 salinan rapat + fusi blur(2px) agar ghost menyatu jadi smear
  // kontinu; 'multiply' membuat putih netral sehingga tinta terakumulasi
  // GELAP seperti frame blur referensi. Hanya aktif 4 frame per transisi.
  const copies = 22;
  const layers = Array.from({length: copies}, (_, i) => {
    const t = i / (copies - 1);
    return {
      sx: 1 + blur * t * 0.55, // streak horizontal, lebih lembut
      sy: 1 + blur * t, // streak vertikal, dominan (sesuai observasi)
      o: i === 0 ? 0.8 : 0.34 / (1 + 1.4 * t),
    };
  });
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <AbsoluteFill style={{filter: 'blur(2px)'}}>
        {layers
          .slice()
          .reverse()
          .map((l, i) => (
            <AbsoluteFill
              key={i}
              style={{
                transform: `scale(${l.sx}, ${l.sy})`,
                transformOrigin: ORIGIN,
                opacity: l.o,
                mixBlendMode: 'multiply',
              }}
            >
              {children}
            </AbsoluteFill>
          ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame % TOTAL; // loop mulus meski durasi > TOTAL

  // Cari segmen aktif
  let acc = 0;
  let seg = SEGMENTS[0];
  let local = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (f < acc + SEGMENTS[i].f) {
      seg = SEGMENTS[i];
      local = f - acc;
      break;
    }
    acc += SEGMENTS[i].f;
  }

  // Halaman STATIS selama tampil (terukur: diff antar frame duplikat ≈0).
  // Frame blur: halaman keluar diberi zoom-blur radial — intensitas naik
  // cepat lalu tertahan, meniru satu frame blur kuat 0.04 s referensi.
  let blur = 0;
  let burst = 1;
  if (seg.kind === 'blur') {
    const p = interpolate(local, [0, Math.max(1, seg.f - 1)], [0.55, 1], {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    blur = 0.62 * p;
    burst = 1 + 0.42 * p;
  }

  const scale = burst * VARIANTS[seg.v % VARIANTS.length];
  const Page = PAGES[seg.p];

  return (
    <AbsoluteFill style={{background: PAPER}}>
      <ZoomBlur blur={blur}>
        <AbsoluteFill
          style={{
            background: PAPER,
            transform: `scale(${scale})`,
            transformOrigin: ORIGIN,
          }}
        >
          <Page />
        </AbsoluteFill>
      </ZoomBlur>
    </AbsoluteFill>
  );
};

export default Motion;
