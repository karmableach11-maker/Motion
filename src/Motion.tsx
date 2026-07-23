import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION — "Artificial Intelligence | Keyword Highlight News Titles"
 * 1920x1080 • 60 fps • 608 frames (10.13 s) — set durationInFrames={608}
 *
 * Direkonstruksi dari analisa frame-by-frame video referensi:
 * - Frasa "artificial intelligence" TERKUNCI di pusat frame sepanjang video.
 *   Marker highlight merah crimson menyapu dari kiri (0→penuh dalam ~4 s)
 *   lalu bertahan sampai akhir.
 * - Latar hitam: 6 desain halaman berita (word cloud, Technology Review,
 *   Digital Report, Cyber Business, AI Report) berganti lewat CROSS-DISSOLVE
 *   di tempat — 29 transisi teratur tiap 1/3 detik, dissolve ~0.16 s
 *   (hasil pengukuran motion_probe: phase correlation dx=dy=0, onion-skin
 *   menunjukkan superimposisi; BUKAN scroll vertikal).
 *   Keyword tertanam dalam kalimat tiap halaman, font mengikuti halamannya.
 * - Kamera push-in + roll perlahan sepanjang durasi (zoom ~1.3x, miring ~7°).
 * - Teks jauh dari pusat lebih redup & lembut (DOF + vignette).
 *
 * Mandiri — hanya butuh 'remotion'. Pengukuran teks pakai Canvas measureText.
 * Timeline dinormalisasi ke durasi komposisi.
 */

// ---------------------------------------------------------------------------
// Konstanta
// ---------------------------------------------------------------------------

const KW = 'artificial intelligence';
const CX = 960;
const CY = 540;
const REF_DUR = 10.13; // durasi referensi (detik)

const BG = '#0b0b0c';
const RED = '#d91a55';
const TXT = '#e6e6e6';
const TXT_DIM = '#b9b9b9';

const SANS = "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const GROT = 'Verdana, Geneva, Arial, sans-serif';
const SERIF_NEWS = "'Times New Roman', Times, Georgia, serif";
const SERIF_OLD = "Georgia, 'Times New Roman', serif";
const NBSP = ' ';

// ---------------------------------------------------------------------------
// Pengukur teks mandiri (Canvas 2D — tersedia di Chrome renderer Remotion)
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

const textW = (
  text: string,
  font: string,
  size: number,
  weight: string | number = 400,
): number => {
  const ctx = _getMeasureCtx();
  if (!ctx) return text.length * size * 0.5;
  ctx.font = `${weight} ${size}px ${font}`;
  return ctx.measureText(text).width;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Gaya per-baris: makin jauh dari pusat makin redup & lembut (DOF)
// ---------------------------------------------------------------------------

const lineStyle = (y: number): React.CSSProperties => {
  const d = Math.abs(y - CY) / CY; // 0 di pusat → 1 di tepi
  return {
    opacity: 0.95 - d * 0.5,
    filter: d > 0.55 ? 'blur(1.6px)' : d > 0.25 ? 'blur(0.7px)' : undefined,
  };
};

const Line: React.FC<{
  y: number;
  font: string;
  size: number;
  weight?: string | number;
  color?: string;
  dx?: number;
  children: React.ReactNode;
}> = ({y, font, size, weight = 400, color = TXT_DIM, dx = 0, children}) => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: y,
      transform: `translate(-50%, -50%) translateX(${dx}px)`,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight as never,
      color,
      whiteSpace: 'nowrap',
      ...lineStyle(y),
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Keyword adalah LAYER TERKUNCI di pusat (tidak ikut scroll) — bukti:
// frame mid-slide referensi menunjukkan keyword tetap di tengah & tajam.
// Halaman hanya merender kalimatnya dengan CELAH selebar keyword, sehingga
// pre/post "menjajarkan diri" ke keyword saat halaman settle.
// ---------------------------------------------------------------------------

type KwSpec = {
  font: string;
  size: number;
  weight: string | number;
  pre?: string;
  post?: string;
};

// Baris pre/post milik halaman: teks di kiri/kanan celah keyword
const PrePostLine: React.FC<{spec: KwSpec}> = ({spec}) => {
  const {font, size, weight, pre = '', post = ''} = spec;
  if (!pre && !post) return null;
  const kwW = textW(KW, font, size, weight);
  const preW = pre ? textW(pre, font, size, weight) : 0;
  const left = CX - preW - kwW / 2;
  const lineH = size * 1.25;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: CY - lineH / 2,
        height: lineH,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight as never,
        lineHeight: `${lineH}px`,
        whiteSpace: 'nowrap',
        color: TXT_DIM,
      }}
    >
      {pre}
      <span style={{display: 'inline-block', width: kwW}} />
      {post}
    </div>
  );
};

// Overlay keyword + marker merah, terkunci di (960, 540)
const KwOverlay: React.FC<{spec: KwSpec; sweep: number}> = ({spec, sweep}) => {
  const {font, size, weight} = spec;
  const kwW = textW(KW, font, size, weight);
  const pad = 20;
  const boxW = Math.max(0, sweep * (kwW + pad * 2));
  const lineH = size * 1.25;
  return (
    <div
      style={{
        position: 'absolute',
        left: CX - kwW / 2,
        top: CY - lineH / 2,
        height: lineH,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight as never,
        lineHeight: `${lineH}px`,
        whiteSpace: 'nowrap',
      }}
    >
      {/* Marker merah — di belakang teks, sedikit miring (gaya stabilo) */}
      {boxW > 1 ? (
        <div
          style={{
            position: 'absolute',
            left: -pad,
            top: -0.08 * size,
            width: boxW,
            height: lineH + 0.16 * size,
            background: RED,
            transform: 'rotate(-1.4deg)',
            boxShadow: '0 0 24px rgba(217,26,85,0.35)',
          }}
        />
      ) : null}
      <span style={{position: 'relative', color: '#ffffff'}}>{KW}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Enam desain halaman (1920x1080, latar hitam, teks bleed di tepi)
// ---------------------------------------------------------------------------

type PageProps = Record<string, never>;

// Spesifikasi keyword per desain (font mengikuti halaman aktif)
const KW_SPECS: KwSpec[] = [
  {font: SANS, size: 88, weight: 800}, // WordCloud — berdiri sendiri
  {font: SANS, size: 80, weight: 700, pre: `Does the${NBSP}`, post: `${NBSP}algorithms`}, // CyberBiz
  {font: SERIF_NEWS, size: 82, weight: 400, pre: `work with${NBSP}`, post: `${NBSP}decision`}, // TechReview
  {font: SERIF_OLD, size: 78, weight: 400, pre: `advanced${NBSP}`, post: `${NBSP}products`}, // AiReport
  {font: SANS, size: 88, weight: 800}, // WordCloud (muncul dua kali per siklus)
  {font: GROT, size: 74, weight: 700, pre: `levels of${NBSP}`, post: `${NBSP}and high`}, // DigitalReport
];

const PageWordCloud: React.FC<PageProps> = () => {
  const words: Array<
    [string, number, number, number, string, number]
  > = [
    // [kata, x, y, size, font, weight]
    ['energy', 120, 70, 46, SERIF_OLD, 400],
    ['cyber', 460, 62, 42, SANS, 700],
    ['advanced', 780, 58, 40, GROT, 400],
    ['modern', 1310, 48, 46, SERIF_NEWS, 400],
    ['new', 1120, 150, 40, SANS, 600],
    ['behavior', 1560, 130, 36, SERIF_OLD, 400],
    ['engineering', 90, 170, 44, SERIF_NEWS, 400],
    ['self-driving car', 430, 175, 42, SANS, 600],
    ['ai', 860, 180, 46, GROT, 700],
    ['algorithms', 1370, 210, 42, SERIF_OLD, 400],
    ['deep learning', 110, 290, 42, GROT, 400],
    ['neural networks', 560, 300, 48, SERIF_NEWS, 400],
    ['ChatBot', 1500, 320, 40, SANS, 700],
    ['cyber', 140, 400, 40, SERIF_OLD, 700],
    ['machine learning', 1090, 430, 44, SERIF_NEWS, 400],
    ['digital', 60, 500, 38, SANS, 400],
    ['industry 4.0', 500, 640, 50, GROT, 700],
    ['science', 60, 690, 38, SERIF_NEWS, 400],
    ['digital', 1330, 700, 62, SERIF_OLD, 700],
    ['business', 330, 780, 42, SANS, 600],
    ['technology', 830, 770, 46, SERIF_OLD, 400],
    ['automation', 120, 890, 42, GROT, 400],
    ['medicine', 620, 900, 38, SERIF_NEWS, 400],
    ['economy', 1130, 910, 44, SERIF_OLD, 400],
    ['data', 1650, 880, 40, SANS, 600],
  ];
  return (
    <>
      {words.map(([w, x, y, s, f, wt], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            fontFamily: f,
            fontSize: s,
            fontWeight: wt as never,
            color: TXT_DIM,
            whiteSpace: 'nowrap',
            ...lineStyle(y),
          }}
        >
          {w}
        </div>
      ))}
    </>
  );
};

const PageTechReview: React.FC<PageProps> = () => (
  <>
    <Line y={72} font={SERIF_NEWS} size={92} weight={700} color={TXT}>
      TECHNOLOGY REVIEW
    </Line>
    <Line y={172} font={SERIF_NEWS} size={30} color="#9a9a9a">
      ● business&nbsp;&nbsp;&nbsp;● industry&nbsp;&nbsp;&nbsp;● trade&nbsp;&nbsp;&nbsp;online information
    </Line>
    <PrePostLine spec={KW_SPECS[2]} />
    <Line y={700} font={SERIF_NEWS} size={78} dx={-60}>
      managing in the absence of all data of all
    </Line>
    <Line y={860} font={SERIF_NEWS} size={78} dx={40}>
      industry, trade, factory future of production
    </Line>
    <Line y={1010} font={SERIF_NEWS} size={78} dx={-30}>
      that and automation process neural nets
    </Line>
  </>
);

const PageDigitalReport: React.FC<PageProps> = () => (
  <>
    <Line y={50} font={GROT} size={88} weight={700} color={TXT}>
      DIGITAL REPORT
    </Line>
    <Line y={220} font={GROT} size={72} weight={700} dx={-50}>
      artificial neural networks and large scale
    </Line>
    <Line y={380} font={GROT} size={72} weight={700} dx={30}>
      speech recognition and natural language
    </Line>
    <PrePostLine spec={KW_SPECS[5]} />
    <Line y={700} font={GROT} size={72} weight={700} dx={-40}>
      machine learning and big data growth
    </Line>
    <Line y={860} font={GROT} size={72} weight={700} dx={50}>
      artificial general intelligence benefits
    </Line>
    <Line y={1010} font={GROT} size={72} weight={700} dx={-20}>
      for the corporation business and science
    </Line>
  </>
);

const PageCyberBiz: React.FC<PageProps> = () => (
  <>
    <Line y={66} font={SANS} size={80} weight={800} color={TXT}>
      Cyber business
    </Line>
    <Line y={158} font={SANS} size={32} color="#9a9a9a">
      news&nbsp;&nbsp;·&nbsp;&nbsp;analysis&nbsp;&nbsp;·&nbsp;&nbsp;reports&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;748,720
      followers&nbsp;&nbsp;&nbsp;information
    </Line>
    <PrePostLine spec={KW_SPECS[1]} />
    <Line y={700} font={SANS} size={76} weight={700} dx={-40}>
      technology and robotics in the near future
    </Line>
    <Line y={860} font={SANS} size={76} weight={700} dx={30}>
      impact on employment internet work
    </Line>
    <Line y={1010} font={SANS} size={76} weight={700} dx={-60}>
      evolution future of business and deep
    </Line>
  </>
);

const PageAiReport: React.FC<PageProps> = () => (
  <>
    <Line y={60} font={SERIF_OLD} size={84} weight={700} color={TXT}>
      AI REPORT
    </Line>
    <Line y={380} font={SERIF_OLD} size={74} dx={-50}>
      complex engineering, medicine, technology
    </Line>
    <PrePostLine spec={KW_SPECS[3]} />
    <Line y={700} font={SERIF_OLD} size={74} dx={40}>
      creating images illustrations and video
    </Line>
    <Line y={860} font={SERIF_OLD} size={74} dx={-30}>
      dialogue in the natural language models
    </Line>
    <Line y={1010} font={SERIF_OLD} size={74} dx={20}>
      generative networks for the industry
    </Line>
  </>
);

// Urutan siklus halaman (sesuai observasi referensi)
const CYCLE: Array<React.FC<PageProps>> = [
  PageWordCloud,
  PageCyberBiz,
  PageTechReview,
  PageAiReport,
  PageWordCloud,
  PageDigitalReport,
];

// ---------------------------------------------------------------------------
// Jadwal transisi — HASIL PENGUKURAN motion_probe.py pada referensi:
// 29 transisi teratur setiap 1/3 detik (pulsa pertama ±0.40 s), masing-
// masing berupa CROSS-DISSOLVE di tempat (phase correlation dx=dy=0,
// onion-skin = dua halaman bertumpuk) selama ~0.16 s, easing in-out.
// Bukan scroll vertikal — kesalahan versi sebelumnya.
// ---------------------------------------------------------------------------

// Terukur dari deret energi per-frame referensi (30 fps): dissolve mulai
// tepat di 1/3 + k/3 detik, lebar 0.10 s, laju KONSTAN (diff rata 3 frame
// beruntun = crossfade linear, bukan ease-in-out).
const TRANS_FIRST = 1 / 3;
const TRANS_INTERVAL = 1 / 3;
const TRANS_COUNT = 29;
const DISSOLVE = 0.1;

// Posisi halaman kontinu: floor = halaman aktif, pecahan = progres dissolve
const pagePos = (t: number): number => {
  let p = 0;
  for (let k = 0; k < TRANS_COUNT; k++) {
    const s = TRANS_FIRST + k * TRANS_INTERVAL;
    p += clamp01((t - s) / DISSOLVE); // linear — sesuai pengukuran
  }
  return p;
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Normalisasi ke detik referensi 0..10.13
  const t = (frame / durationInFrames) * REF_DUR;

  // Sapuan marker merah — kurva piecewise mengikuti bukti referensi:
  // t=1.0s ≈ 45% (menutup "artificial"), t=2.1s ≈ 62%, t=3.2s ≈ 88%, penuh di 3.9s
  const SWEEP_KF: Array<[number, number]> = [
    [0.2, 0], [1.0, 0.45], [2.1, 0.62], [3.2, 0.88], [3.9, 1],
  ];
  let sweep = 0;
  if (t <= SWEEP_KF[0][0]) sweep = 0;
  else if (t >= SWEEP_KF[SWEEP_KF.length - 1][0]) sweep = 1;
  else {
    for (let i = 1; i < SWEEP_KF.length; i++) {
      const [t1, v1] = SWEEP_KF[i];
      const [t0, v0] = SWEEP_KF[i - 1];
      if (t <= t1) {
        sweep = v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
        break;
      }
    }
  }

  // Posisi halaman: floor = aktif, pecahan = alpha dissolve (0..1)
  const p = pagePos(t);
  const cur = Math.floor(p);
  const alpha = p - cur; // 0 = halaman cur penuh, 1 = halaman cur+1 penuh

  // Kamera: push-in + roll perlahan sepanjang durasi
  const prog = t / REF_DUR;
  const camScale = 1.03 + 0.3 * prog;
  const camRot = -7.2 * prog;
  const camX = -34 * prog;

  // Font keyword mengikuti halaman yang dominan di layar
  const kwSpec = KW_SPECS[(alpha < 0.5 ? cur : cur + 1) % KW_SPECS.length];

  const PageA = CYCLE[cur % CYCLE.length];
  const PageB = CYCLE[(cur + 1) % CYCLE.length];

  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill
        style={{
          transform: `translateX(${camX}px) scale(${camScale}) rotate(${camRot}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        {/* CROSS-DISSOLVE di tempat — tanpa translasi, tanpa blur palsu
            (superimposisi dua halaman sudah terbaca sebagai "blur" alami,
            persis seperti frame tengah transisi referensi) */}
        <AbsoluteFill style={{background: BG}}>
          <PageA />
        </AbsoluteFill>
        {alpha > 0.001 ? (
          <AbsoluteFill style={{background: BG, opacity: alpha}}>
            <PageB />
          </AbsoluteFill>
        ) : null}

        {/* Keyword + marker TERKUNCI di pusat — tidak ikut transisi */}
        <KwOverlay spec={kwSpec} sweep={sweep} />
      </AbsoluteFill>

      {/* Vignette — tepi lebih gelap, pusat bersih */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 62% 58% at 50% 50%, transparent 46%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
