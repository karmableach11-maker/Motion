import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

// ============================================================================
// MOTION3 — "WARNING" Cyber Attack Glitch Alert
// 15 s • 60 fps • 1920×1080 • loop mulus
//
// Direkayasa-balik dari referensi (bukti terukur, bukan tebakan):
// - 1 scene statis: judul WARNING (font pixel) dalam kotak garis-ganda,
//   latar hitam-merah penuh fragmen kode digital yang berkedip.
// - motion_probe: ~1 burst glitch/detik, durasi 0,23–0,7 s, in-place
//   (dx=dy=0 → bukan slide), easing linear → pergantian state DISKRIT
//   per 2–3 frame, bukan tween halus.
// - Onion-skin: judul tetap terkunci di tempat; latar ber-shimmer per frame.
// State glitch yang terobservasi: slice-shift, ghost/double, box terisi
// penuh (invers), underline-only + stretch, dim flicker.
// ============================================================================

const W = 1920;
const H = 1080;

// ---------------------------------------------------------------------------
// Palet (aproksimasi dari frame referensi, bt709 merah tunggal)
// ---------------------------------------------------------------------------
const PAL = {
  bg: '#060000',
  titleRed: '#ff2d2d',
  titleDark: '#2a0303',
  boxRed: '#e42222',
  fillRed: '#c41919',
  ghostRed: '#a81414',
  frag: ['#571010', '#7c1515', '#a51e1e', '#d42a2a', '#ff4040'],
};

// ---------------------------------------------------------------------------
// Font pixel 5×7 untuk "WARNING" (gaya VCR/terminal seperti referensi)
// ---------------------------------------------------------------------------
const GLYPHS: Record<string, string[]> = {
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
};

const WORD = 'WARNING';
const CELL_W = 13;
const CELL_H = 15;
const TEXT_W = (WORD.length * 6 - 1) * CELL_W; // 41 kolom
const TEXT_H = 7 * CELL_H;

const BOX_W = 660;
const BOX_H = 184;
const SVG_W = 900;
const SVG_H = 300;

// ---------------------------------------------------------------------------
// Judul inti: teks pixel + kotak garis ganda, dalam satu SVG
// ---------------------------------------------------------------------------
type BoxMode = 'outline' | 'filled' | 'none';

const TitleCore: React.FC<{
  textFill: string;
  boxMode: BoxMode;
  underline?: boolean;
  scaleX?: number;
}> = ({textFill, boxMode, underline = false, scaleX = 1}) => {
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const textX = cx - TEXT_W / 2;
  const textY = cy - TEXT_H / 2;

  const pixels: React.ReactNode[] = [];
  WORD.split('').forEach((ch, li) => {
    const g = GLYPHS[ch];
    g.forEach((row, r) => {
      row.split('').forEach((bit, c) => {
        if (bit === '1') {
          pixels.push(
            <rect
              key={`${li}-${r}-${c}`}
              x={textX + (li * 6 + c) * CELL_W}
              y={textY + r * CELL_H}
              width={CELL_W - 2}
              height={CELL_H - 2}
              fill={textFill}
            />,
          );
        }
      });
    });
  });

  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scaleX(${scaleX})`,
      }}
    >
      {boxMode === 'filled' && (
        <rect
          x={cx - BOX_W / 2}
          y={cy - BOX_H / 2}
          width={BOX_W}
          height={BOX_H}
          fill={PAL.fillRed}
        />
      )}
      {boxMode === 'outline' && (
        <>
          <rect
            x={cx - BOX_W / 2}
            y={cy - BOX_H / 2}
            width={BOX_W}
            height={BOX_H}
            fill="none"
            stroke={PAL.boxRed}
            strokeWidth={3}
          />
          <rect
            x={cx - BOX_W / 2 + 8}
            y={cy - BOX_H / 2 + 8}
            width={BOX_W - 16}
            height={BOX_H - 16}
            fill="none"
            stroke={PAL.boxRed}
            strokeWidth={2}
          />
        </>
      )}
      {underline && (
        <rect
          x={cx - (TEXT_W * 1.22) / 2}
          y={textY + TEXT_H + 16}
          width={TEXT_W * 1.22}
          height={11}
          fill={PAL.boxRed}
        />
      )}
      {pixels}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Pembungkus slice: memotong judul jadi 5 pita horizontal dengan offset X
// (mekanisme glitch utama yang terlihat di referensi t≈3,9 s / 6,6–7,1 s)
// ---------------------------------------------------------------------------
const Sliced: React.FC<{offsets: number[]; children: React.ReactNode}> = ({
  offsets,
  children,
}) => (
  <>
    {offsets.map((o, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(${i * 20}% 0 ${(offsets.length - 1 - i) * 20}% 0)`,
          transform: `translateX(${o}px)`,
        }}
      >
        {children}
      </div>
    ))}
  </>
);

// ---------------------------------------------------------------------------
// Jadwal burst glitch — fraksi durasi agar ritme terjaga bila durasi diubah.
// Kerapatan ≈1 burst/dtk (referensi: 27 jendela gerak / 20 s, banyak yang
// bersambungan). Awal & akhir timeline bersih → loop mulus.
// ---------------------------------------------------------------------------
const BURSTS: {f: number; len: number}[] = [
  {f: 30 / 900, len: 16},
  {f: 80 / 900, len: 12},
  {f: 135 / 900, len: 20},
  {f: 190 / 900, len: 14},
  {f: 250 / 900, len: 24},
  {f: 300 / 900, len: 12},
  {f: 360 / 900, len: 18},
  {f: 415 / 900, len: 14},
  {f: 470 / 900, len: 20},
  {f: 530 / 900, len: 12},
  {f: 585 / 900, len: 16},
  {f: 640 / 900, len: 14},
  {f: 700 / 900, len: 26},
  {f: 750 / 900, len: 46}, // periode aktif panjang (ref. 17,4–19,1 s)
  {f: 820 / 900, len: 14},
  {f: 860 / 900, len: 12},
];

type GlitchState =
  | 'normal'
  | 'slices'
  | 'ghost'
  | 'filled'
  | 'underline'
  | 'stretch'
  | 'dim';

const STATE_POOL: GlitchState[] = [
  'slices',
  'ghost',
  'filled',
  'underline',
  'slices',
  'dim',
  'normal',
  'stretch',
];

// ---------------------------------------------------------------------------
// Fragmen kode latar — deterministik penuh via random(seed) Remotion
// ---------------------------------------------------------------------------
type Frag = {
  x: number;
  y: number;
  type: 'txt' | 'dash' | 'dot';
  len: number;
  size: number;
  color: string;
  bright: boolean;
  blur: number;
  period: number;
  phase: number;
  duty: number;
  seed: number;
};

const makeFrags = (): Frag[] => {
  const arr: Frag[] = [];
  let id = 0;
  const push = (x: number, y: number, forceTxt = false) => {
    const r = (k: string) => random(`fr${id}-${k}`);
    const t = r('t');
    const type: Frag['type'] = forceTxt
      ? 'txt'
      : t < 0.5
        ? 'txt'
        : t < 0.82
          ? 'dash'
          : 'dot';
    const b = r('b');
    const color =
      b < 0.35
        ? PAL.frag[0]
        : b < 0.6
          ? PAL.frag[1]
          : b < 0.8
            ? PAL.frag[2]
            : b < 0.94
              ? PAL.frag[3]
              : PAL.frag[4];
    arr.push({
      x,
      y,
      type,
      len: 4 + Math.floor(r('l') * 10),
      size: 11 + Math.floor(r('sz') * 7),
      color,
      bright: b >= 0.94,
      blur: r('bl') < 0.16 ? 1 + r('bl2') * 1.5 : 0,
      // ~35% fragmen berkedip cepat (baseline shimmer tinggi di referensi)
      period: r('fast') < 0.26 ? 2 + Math.floor(r('p') * 5) : 8 + Math.floor(r('p') * 30),
      phase: Math.floor(r('ph') * 40),
      duty: 0.5 + r('d') * 0.4,
      seed: id,
    });
    id++;
  };

  // Sebaran acak — lebih padat di tepi kiri/kanan seperti referensi
  for (let i = 0; i < 270; i++) {
    const rs = (k: string) => random(`sc${i}-${k}`);
    const side = rs('s') < 0.62;
    const x = side
      ? rs('h') < 0.5
        ? rs('x') * 0.34
        : 0.66 + rs('x') * 0.34
      : 0.05 + rs('x') * 0.9;
    push(x, 0.02 + rs('y') * 0.96);
  }
  // Klaster kolom bertumpuk (blok kode di sisi kanan/kiri referensi)
  for (let c = 0; c < 16; c++) {
    const rc = (k: string) => random(`cl${c}-${k}`);
    const cx = rc('s') < 0.5 ? rc('x') * 0.3 : 0.68 + rc('x') * 0.28;
    const cy = 0.05 + rc('y') * 0.75;
    const rows = 3 + Math.floor(rc('n') * 6);
    for (let rr = 0; rr < rows; rr++) {
      push(cx + (rc(`ox${rr}`) - 0.5) * 0.02, cy + rr * 0.028, true);
    }
  }
  return arr;
};

const CHARSET = '0123456789';

const fragText = (f: Frag, cycle: number): string => {
  let s = '';
  for (let j = 0; j < f.len; j++) {
    const v = random(`ch${f.seed}-${cycle}-${j}`);
    s += CHARSET[Math.floor(v * CHARSET.length)];
  }
  return s;
};

// Blob merah besar out-of-focus (tekstur kedalaman di latar referensi)
type Blob = {x: number; y: number; w: number; h: number; k: number; ph: number; op: number};
const makeBlobs = (): Blob[] =>
  new Array(7).fill(0).map((_, i) => {
    const r = (k: string) => random(`bl${i}-${k}`);
    return {
      x: r('x') * 100,
      y: 45 + r('y') * 55,
      w: 220 + r('w') * 320,
      h: 120 + r('h') * 220,
      k: 2 + Math.floor(r('k') * 3),
      ph: r('p') * Math.PI * 2,
      op: 0.1 + r('o') * 0.14,
    };
  });

// ============================================================================
// KOMPOSISI UTAMA
// ============================================================================
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const frags = useMemo(makeFrags, []);
  const blobs = useMemo(makeBlobs, []);

  const tw = frame / durationInFrames; // 0..1, untuk sinus loop-sempurna

  // ------ status glitch judul --------------------------------------------
  let state: GlitchState = 'normal';
  let stateSeed = '';
  let burstIdx = -1;
  for (let i = 0; i < BURSTS.length; i++) {
    const start = Math.round(BURSTS[i].f * durationInFrames);
    if (frame >= start && frame < start + BURSTS[i].len) {
      burstIdx = i;
      const step = Math.floor((frame - start) / 4);
      stateSeed = `st-${i}-${step}`;
      state = STATE_POOL[Math.floor(random(stateSeed) * STATE_POOL.length)];
      break;
    }
  }
  // Blip idle 1–2 frame di antara burst (kedip halus referensi)
  if (burstIdx === -1) {
    const bc = Math.floor(frame / 29);
    if (random(`blip${bc}`) < 0.15 && frame - bc * 29 < 2) {
      state = 'dim';
      stateSeed = `blip${bc}`;
    }
  }

  // Jitter posisi judul hanya saat burst (in-place, amplitudo kecil)
  const jx =
    burstIdx >= 0 ? (random(`${stateSeed}-jx`) - 0.5) * 10 : 0;
  const jy =
    burstIdx >= 0 ? (random(`${stateSeed}-jy`) - 0.5) * 6 : 0;

  // Flicker kecerahan mikro — frekuensi bilangan bulat → loop mulus
  const flick =
    0.96 +
    0.04 * Math.sin(2 * Math.PI * 47 * tw) +
    0.035 * Math.sin(2 * Math.PI * 89 * tw + 1.7);

  // Napas ambient lambat (3 siklus / durasi → loop mulus)
  const breath = 0.86 + 0.14 * Math.sin(2 * Math.PI * 3 * tw + 0.6);

  // ------ bangun judul sesuai state ---------------------------------------
  let title: React.ReactNode;
  const normalCore = (
    <TitleCore textFill={PAL.titleRed} boxMode="outline" />
  );
  switch (state) {
    case 'slices': {
      const offsets = [0, 1, 2, 3, 4].map((i) => {
        const centerBias = 1 - Math.abs(i - 2) / 2.5;
        return (
          (random(`${stateSeed}-sl${i}`) - 0.5) * 2 * (6 + 20 * centerBias)
        );
      });
      title = <Sliced offsets={offsets}>{normalCore}</Sliced>;
      break;
    }
    case 'ghost':
      title = (
        <>
          <div style={{position: 'absolute', inset: 0, transform: 'translateX(-11px)', opacity: 0.45}}>
            <TitleCore textFill={PAL.ghostRed} boxMode="outline" />
          </div>
          <div style={{position: 'absolute', inset: 0, transform: 'translateX(11px)', opacity: 0.45}}>
            <TitleCore textFill={PAL.ghostRed} boxMode="outline" />
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: 0.9}}>{normalCore}</div>
        </>
      );
      break;
    case 'filled':
      title = (
        <div style={{position: 'absolute', inset: 0, opacity: 0.85}}>
          <TitleCore textFill={PAL.titleDark} boxMode="filled" />
        </div>
      );
      break;
    case 'underline':
      title = (
        <TitleCore
          textFill={PAL.titleRed}
          boxMode="none"
          underline
          scaleX={1.12}
        />
      );
      break;
    case 'stretch':
      title = (
        <div style={{position: 'absolute', inset: 0, opacity: 0.92}}>
          <TitleCore textFill={PAL.titleRed} boxMode="outline" scaleX={1.3} />
        </div>
      );
      break;
    case 'dim':
      title = (
        <div style={{position: 'absolute', inset: 0, opacity: 0.5}}>
          {normalCore}
        </div>
      );
      break;
    default:
      title = normalCore;
  }

  // ------ streak horizontal (muncul terutama saat burst) ------------------
  const streaks: React.ReactNode[] = [];
  if (burstIdx >= 0) {
    const n = 2 + Math.floor(random(`${stateSeed}-sn`) * 3);
    for (let i = 0; i < n; i++) {
      const sy = random(`${stateSeed}-sy${i}`) * H;
      const sw = (0.25 + random(`${stateSeed}-sw${i}`) * 0.5) * W;
      const sx = random(`${stateSeed}-sx${i}`) * (W - sw);
      streaks.push(
        <div
          key={`b${i}`}
          style={{
            position: 'absolute',
            left: sx,
            top: sy,
            width: sw,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, rgba(255,70,70,0.55), transparent)',
          }}
        />,
      );
    }
  } else {
    const sc = Math.floor(frame / 45);
    if (random(`ist${sc}`) < 0.3 && frame - sc * 45 < 4) {
      const sy = random(`isty${sc}`) * H;
      streaks.push(
        <div
          key="idle"
          style={{
            position: 'absolute',
            left: W * 0.15,
            top: sy,
            width: W * 0.7,
            height: 1.5,
            background:
              'linear-gradient(90deg, transparent, rgba(230,50,50,0.35), transparent)',
          }}
        />,
      );
    }
  }

  // Pita lebar translusen saat burst (band displacement di referensi)
  const bands: React.ReactNode[] = [];
  if (burstIdx >= 0) {
    for (let i = 0; i < 2; i++) {
      const by = random(`${stateSeed}-by${i}`) * H;
      const bh = 18 + random(`${stateSeed}-bh${i}`) * 50;
      bands.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: by,
            width: '100%',
            height: bh,
            background: 'rgba(255,35,35,0.05)',
          }}
        />,
      );
    }
  }

  const grainSeed = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{backgroundColor: PAL.bg, overflow: 'hidden'}}>
      {/* Ambient merah: vignette tengah + bloom atas-tengah */}
      <AbsoluteFill style={{opacity: breath}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 72% 62% at 50% 48%, rgba(150,15,15,0.55), transparent 80%)',
          }}
        />
      </AbsoluteFill>

      {/* Blob kedalaman out-of-focus */}
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.w,
            height: b.h,
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(ellipse, rgba(170,22,22,0.55), transparent 70%)',
            filter: 'blur(26px)',
            opacity: b.op * (0.7 + 0.3 * Math.sin(2 * Math.PI * b.k * tw + b.ph)),
          }}
        />
      ))}

      {/* Medan fragmen kode digital */}
      <AbsoluteFill>
        {frags.map((f) => {
          const cycle = Math.floor((frame + f.phase) / f.period);
          if (random(`v${f.seed}-${cycle}`) > f.duty) return null;
          const dx = (random(`dx${f.seed}-${cycle}`) - 0.5) * 5;
          const op =
            0.45 +
            random(`op${f.seed}-${cycle}`) * 0.5;
          const common: React.CSSProperties = {
            position: 'absolute',
            left: f.x * W + dx,
            top: f.y * H,
            opacity: op,
            filter: f.blur ? `blur(${f.blur}px)` : undefined,
          };
          if (f.type === 'txt') {
            return (
              <div
                key={f.seed}
                style={{
                  ...common,
                  color: f.color,
                  fontFamily: "'Courier New', monospace",
                  fontSize: f.size,
                  fontWeight: 700,
                  letterSpacing: 2,
                  whiteSpace: 'nowrap',
                  textShadow: f.bright
                    ? '0 0 7px rgba(255,64,64,0.9)'
                    : undefined,
                }}
              >
                {fragText(f, cycle)}
              </div>
            );
          }
          if (f.type === 'dash') {
            return (
              <div
                key={f.seed}
                style={{
                  ...common,
                  width: 8 + f.len * 7,
                  height: 2.5,
                  background: f.color,
                }}
              />
            );
          }
          return (
            <div
              key={f.seed}
              style={{
                ...common,
                width: 3,
                height: 3,
                background: f.color,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {bands}
      {streaks}

      {/* Judul WARNING — terkunci di tengah, glow + flicker mikro */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '47.5%',
          width: SVG_W,
          height: SVG_H,
          transform: `translate(-50%, -50%) translate(${jx}px, ${jy}px)`,
          filter: `drop-shadow(0 0 12px rgba(255,35,35,0.85)) drop-shadow(0 0 46px rgba(255,0,0,0.4)) brightness(${flick})`,
        }}
      >
        {title}
      </div>

      {/* Grain per-2-frame (shimmer terukur pada kurva energi referensi) */}
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="m3grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves={2}
              seed={grainSeed}
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0.85 0 0 0 0  0.12 0 0 0 0  0.1 0 0 0 0  0 0 0 0.5 0"
            />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#m3grain)',
          mixBlendMode: 'screen',
          opacity: 0.38,
        }}
      />

      {/* Scanline halus */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 6px)',
          opacity: 0.3,
        }}
      />

      {/* Vignette tepi gelap */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Bloom cahaya atas-tengah — DI ATAS vignette agar tetap terang */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: breath,
          background:
            'radial-gradient(ellipse 34% 24% at 50% -2%, rgba(255,40,35,0.5), transparent 65%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: breath,
          background:
            'radial-gradient(ellipse 10% 6% at 50% 0%, rgba(255,120,95,0.9), transparent 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
