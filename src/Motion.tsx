import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION — "Hacker Attack Warning | Neon Glitch Triangle Loop"
 * 1920x1080 • 60 fps • 1200 frames (20 s) • SEAMLESS LOOP
 *
 * Direkonstruksi dari analisa + pengukuran video referensi (20 s, 30 fps):
 * - Semua gerak IN-PLACE (phase correlation dx=dy=0), energi sangat rendah
 *   (0.003–0.013) → ambient loop, tanpa kamera.
 * - Fokus: segitiga peringatan neon merah-pink gaya coretan tangan dengan
 *   tanda seru; garis "mendidih" (redraw ~12–15 Hz) dan berganti antara
 *   kondisi bersih ↔ varian terdistorsi (miring/meleleh/ekor) tiap 1–3 s,
 *   plus denyut kecerahan glow.
 * - Bracket sudut merah bergetar halus; latar digital biru-gelap: fragmen
 *   kode redup timbul-tenggelam, partikel cyan berkedip, berkas cahaya
 *   cyan atas-tengah yang bernapas.
 *
 * MODIFIKASI (diminta "sedikit modifikasi"):
 * 1. Baris terminal kecil mengetik-menghapus di bawah segitiga.
 * 2. Cincin radar tipis memancar dari pusat tiap 5 s.
 * 3. Dua burst RGB-split singkat (t≈7 s dan t≈15 s).
 * Semua periodik dengan siklus bulat terhadap 1200 frame → loop tetap mulus.
 */

// ---------------------------------------------------------------------------
// Deterministic helpers (loop-safe)
// ---------------------------------------------------------------------------

const LOOP = 1200; // frame

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 43.7) * 43758.5453123);
const hash2 = (a: number, b: number) => hash(a * 57.31 + b * 911.7);
const TAU = Math.PI * 2;

// sinus dengan k siklus bulat per loop → nilai & turunan sama di frame 0 dan 1200
const lsin = (f: number, k: number, phase = 0) => Math.sin(TAU * (f / LOOP) * k + phase);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const BG0 = '#0b1c2c';
const BG1 = '#16344e';
const BEAM = '#38b6e8';
const NEON = '#ff2f5e';
const NEON_CORE = '#ffb3c4';
const BRACKET = '#e01c48';
const CODE_C = '#4a8cb2';
const PART_C = '#4fc3f0';
const MONO = "Consolas, 'Courier New', monospace";

// ---------------------------------------------------------------------------
// Jadwal kondisi segitiga — meniru pergantian bersih↔distorsi referensi.
// Param: skew (deg), rot (deg), squashY, tail (0..1), boil (amplitudo px).
// Jumlah frame = 1200 tepat; awal & akhir 'clean' → seam loop aman.
// ---------------------------------------------------------------------------

type TriState = {
  f: number;
  skew: number;
  rot: number;
  squash: number;
  tail: number;
  boil: number;
  glow: number;
};

const S = (
  f: number, skew: number, rot: number, squash: number, tail: number,
  boil: number, glow: number,
): TriState => ({f, skew, rot, squash, tail, boil, glow});

const STATES: TriState[] = [
  S(90, 0, 0, 1.0, 0.0, 3.5, 1.0), // clean
  S(70, -6, -3, 0.96, 0.5, 6.0, 0.9), // mulai meleleh
  S(110, -13, -7, 0.88, 1.0, 8.0, 0.85), // distorsi A: miring kiri + ekor
  S(80, 0, 0, 1.0, 0.0, 3.5, 1.15), // clean terang
  S(90, 8, 4, 0.92, 0.3, 7.0, 0.9), // distorsi B: miring kanan
  S(110, 0, 0, 1.0, 0.0, 3.0, 1.0), // clean
  S(100, -10, -5, 0.85, 0.8, 8.5, 0.8), // distorsi A'
  S(70, 0, 0, 1.0, 0.0, 3.5, 1.25), // clean sangat terang (flash)
  S(100, -5, -2, 0.95, 0.4, 6.5, 0.95), // distorsi ringan
  S(90, 12, 5, 0.9, 0.6, 7.5, 0.85), // distorsi C: rebah kanan
  S(90, 0, 0, 1.0, 0.0, 4.0, 1.1), // clean
  S(90, -8, -4, 0.9, 0.7, 7.0, 0.9), // distorsi A''
  S(100, 0, 0, 1.0, 0.0, 3.5, 1.0), // clean (menyambung ke frame 0)
];
// total = 90+70+110+80+90+110+100+70+100+90+90+90+100 = 1200

const BLEND = 10; // frame transisi antar kondisi

const triAt = (f: number) => {
  let acc = 0;
  for (let i = 0; i < STATES.length; i++) {
    const st = STATES[i];
    if (f < acc + st.f) {
      const nxt = STATES[(i + 1) % STATES.length];
      const local = f - acc;
      const into = st.f - local; // sisa frame menuju kondisi berikut
      if (into <= BLEND) {
        const t = 1 - into / BLEND;
        const m = t * t * (3 - 2 * t);
        const mix = (a: number, b: number) => a + (b - a) * m;
        return {
          skew: mix(st.skew, nxt.skew), rot: mix(st.rot, nxt.rot),
          squash: mix(st.squash, nxt.squash), tail: mix(st.tail, nxt.tail),
          boil: mix(st.boil, nxt.boil), glow: mix(st.glow, nxt.glow),
        };
      }
      return st;
    }
    acc += st.f;
  }
  return STATES[0];
};

// ---------------------------------------------------------------------------
// Segitiga neon "boil" — outline dibangun dari titik-titik yang di-jitter
// per epoch (redraw 12 Hz, epoch wrap → loop). Smoothing kuadratik lewat
// titik tengah otomatis membulatkan sudut (gaya tabung neon coretan).
// ---------------------------------------------------------------------------

const TRI_PTS: Array<[number, number]> = (() => {
  // sampling tepi segitiga (pusat ~ (0,0), lebar ~340, tinggi ~300)
  const A: [number, number] = [0, -160];
  const B: [number, number] = [170, 140];
  const C: [number, number] = [-170, 140];
  const pts: Array<[number, number]> = [];
  const edge = (p: [number, number], q: [number, number], n: number) => {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  };
  edge(A, B, 8);
  edge(B, C, 8);
  edge(C, A, 8);
  return pts;
})();

const smoothPath = (pts: Array<[number, number]>, close: boolean) => {
  const n = pts.length;
  let d = '';
  const mid = (a: [number, number], b: [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number];
  const m0 = mid(pts[0], pts[1]);
  d += `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  const last = close ? n : n - 2;
  for (let i = 1; i <= last; i++) {
    const p = pts[i % n];
    const m = mid(p, pts[(i + 1) % n]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d;
};

const buildTriangle = (epoch: number, boil: number, tail: number) => {
  const e = epoch % 240; // 1200/5 → wrap bulat, loop aman
  const pts: Array<[number, number]> = TRI_PTS.map(([x, y], i) => [
    x + (hash2(e, i) - 0.5) * 2 * boil,
    y + (hash2(e + 0.5, i) - 0.5) * 2 * boil,
  ]);
  if (tail > 0.05) {
    // ekor: ujung goresan bawah-kanan memanjang keluar (khas frame distorsi)
    const k = 8; // titik sudut B (bawah-kanan)
    pts[k] = [pts[k][0] + 70 * tail, pts[k][1] + 18 * tail];
    pts[k + 1] = [pts[k + 1][0] + 30 * tail, pts[k + 1][1] + 8 * tail];
  }
  return smoothPath(pts, true);
};

const buildBang = (epoch: number, boil: number) => {
  const e = epoch % 240;
  const j = (i: number, amp: number) => (hash2(e + 7.7, i) - 0.5) * 2 * amp;
  const bar: Array<[number, number]> = [
    [0 + j(0, boil * 0.6), -78 + j(1, boil * 0.6)],
    [2 + j(2, boil * 0.6), -40 + j(3, boil * 0.6)],
    [-2 + j(4, boil * 0.6), 0 + j(5, boil * 0.6)],
    [0 + j(6, boil * 0.6), 38 + j(7, boil * 0.6)],
  ];
  const dotY = 78 + j(9, boil * 0.5);
  return {bar: smoothPath(bar, false), dotY};
};

// ---------------------------------------------------------------------------
// Latar: fragmen kode, partikel, beam — semua periodik bulat (loop-safe)
// ---------------------------------------------------------------------------

const CODE_SNIPS = [
  '#include <auth.h>', 'if (!verify(sig))', 'return 0xFF;', 'memcpy(dst, src, n);',
  'while (port_scan)', 'inject(payload);', 'sock.bind(0.0.0.0)', 'try { decrypt(k); }',
  '/* trace route */', 'for (i=0;i<n;i++)', 'root@sys:~$ ./run', 'xor eax, eax',
  'GET /admin HTTP/1.1', 'chmod 0777 /tmp/x',
];

const CodeLayer: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill>
    {Array.from({length: 60}, (_, i) => {
      const txt = CODE_SNIPS[i % CODE_SNIPS.length];
      const x = 20 + hash(i * 3.1) * 1780;
      const y = 20 + hash(i * 7.7) * 1010;
      const k = 2 + Math.floor(hash(i * 5.3) * 4); // 2..5 siklus per 20 s
      const op = clamp01(0.2 + 0.5 * lsin(f, k, hash(i) * TAU)) * 0.95;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            fontFamily: MONO,
            fontSize: 13 + hash(i * 9.7) * 6,
            color: CODE_C,
            opacity: op,
            whiteSpace: 'pre',
          }}
        >
          {txt}
          {'\n'}
          {CODE_SNIPS[(i + 5) % CODE_SNIPS.length]}
          {'\n'}
          {CODE_SNIPS[(i + 9) % CODE_SNIPS.length]}
        </div>
      );
    })}
  </AbsoluteFill>
);

const Particles: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill>
    {Array.from({length: 70}, (_, i) => {
      const x = hash(i * 11.3) * 1920;
      const y = hash(i * 17.9) * 1080;
      const s = 1.5 + hash(i * 23.1) * 3.5;
      const k = 3 + Math.floor(hash(i * 31.7) * 5);
      const tw = clamp01(0.15 + 0.85 * lsin(f, k, hash(i * 41.3) * TAU));
      const drift = 6 * lsin(f, 1, hash(i * 51.9) * TAU); // periodik → loop
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y + drift,
            width: s,
            height: s,
            background: PART_C,
            opacity: tw * 0.5,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Modifikasi 1: baris terminal mengetik-menghapus (siklus 600 frame ×2)
// ---------------------------------------------------------------------------

const TYPE_LINES = ['SYSTEM BREACH DETECTED', 'ACCESS LOCKED // TRACE 0x7F2E'];

const typedText = (f: number) => {
  const cyc = f % 600; // 2 siklus bulat per loop
  const line = TYPE_LINES[Math.floor(f / 600) % 2];
  const n = line.length;
  // 0-250: mengetik; 250-450: tahan; 450-520: hapus cepat; 520-600: kosong
  let count = 0;
  if (cyc < 250) count = Math.min(n, Math.floor((cyc / 250) * (n + 4)));
  else if (cyc < 450) count = n;
  else if (cyc < 520) count = Math.max(0, n - Math.floor(((cyc - 450) / 70) * (n + 2)));
  const cursor = Math.floor(f / 18) % 2 === 0 ? '█' : ' ';
  return line.slice(0, count) + cursor;
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const f = Math.floor((frame / durationInFrames) * LOOP) % LOOP;

  const st = triAt(f);
  const epoch = Math.floor(f / 5); // redraw boil 12 Hz
  const triPath = buildTriangle(epoch, st.boil, st.tail);
  const bang = buildBang(epoch, st.boil);

  // Denyut glow: kombinasi napas lambat + flicker halus (semua loop-safe)
  const breathe = 0.85 + 0.15 * lsin(f, 3, 1.1);
  const flick = 1 + 0.06 * (hash(epoch * 3.3) - 0.5);
  const glow = st.glow * breathe * flick;

  // Bracket jitter
  const bj = (i: number) => (hash2(epoch, i) - 0.5) * 4;
  const bracketOp = 0.75 + 0.25 * (hash(epoch * 7.1) > 0.12 ? 1 : 0.2);

  // Modifikasi 2: cincin radar — 4 siklus bulat per loop (tiap 300 frame)
  const ringT = (f % 300) / 300;
  const ringR = 150 + ringT * 380;
  const ringOp = 0.3 * (1 - ringT);

  // Modifikasi 3: burst RGB-split singkat (5 frame) di f=420 & f=900
  const inBurst = (f >= 420 && f < 425) || (f >= 900 && f < 905);
  const burstDx = inBurst ? 5 : 0;

  const Scene: React.FC<{tint?: string; dx?: number; op?: number}> = ({
    tint,
    dx = 0,
    op = 1,
  }) => (
    <AbsoluteFill
      style={{
        transform: dx ? `translateX(${dx}px)` : undefined,
        opacity: op,
        mixBlendMode: tint ? 'screen' : undefined,
        filter: tint,
      }}
    >
      {/* Latar digital */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 95% at 50% 28%, ${BG1} 0%, ${BG0} 78%)`,
        }}
      />
      {/* Panel mosaik samar (tekstur dinding digital) */}
      <AbsoluteFill>
        {Array.from({length: 26}, (_, i) => {
          const px = hash(i * 13.7) * 1860;
          const py = hash(i * 19.3) * 1030;
          const pw = 60 + hash(i * 29.1) * 220;
          const ph = 30 + hash(i * 37.7) * 140;
          const k = 1 + Math.floor(hash(i * 43.9) * 3);
          const op = clamp01(0.1 + 0.35 * lsin(f, k, hash(i * 7.7) * TAU)) * 0.6;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                width: pw,
                height: ph,
                background: '#1c3f5c',
                opacity: op,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <CodeLayer f={f} />
      <Particles f={f} />
      {/* Berkas cahaya atas-tengah, bernapas */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 560,
          top: -300,
          width: 1120,
          height: 760,
          background: `radial-gradient(ellipse at 50% 18%, ${BEAM}7a 0%, ${BEAM}26 42%, transparent 72%)`,
          opacity: 0.85 + 0.15 * lsin(f, 2, 0.4),
        }}
      />
      {/* Grain shimmer halus konstan (karakter ambient referensi) */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.2, mixBlendMode: 'screen'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="3" seed={Math.floor(f / 2) % 600} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="linear" slope="0.5" /><feFuncG type="linear" slope="0.55" /><feFuncB type="linear" slope="0.7" /></feComponentTransfer>
        </filter>
        <rect width={1920} height={1080} filter="url(#grain)" />
      </svg>
      {/* Scanline + vignette */}
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 4px)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.38) 100%)',
        }}
      />

      {/* Modifikasi: cincin radar */}
      <svg
        width={1920}
        height={1080}
        style={{position: 'absolute', left: 0, top: 0}}
      >
        <circle
          cx={960}
          cy={530}
          r={ringR}
          fill="none"
          stroke={NEON}
          strokeWidth={2}
          opacity={ringOp}
        />
      </svg>

      {/* Bracket sudut (capture frame) */}
      <svg
        width={1920}
        height={1080}
        style={{position: 'absolute', left: 0, top: 0, opacity: bracketOp}}
      >
        {([
          [690, 290, 1, 1], [1230, 290, -1, 1],
          [690, 770, 1, -1], [1230, 770, -1, -1],
        ] as const).map(([x, y, sx, sy], i) => (
          <path
            key={i}
            d={`M ${x + bj(i)} ${y + 34 * sy + bj(i + 4)} L ${x + bj(i)} ${y + bj(i + 4)} L ${x + 34 * sx + bj(i)} ${y + bj(i + 4)}`}
            fill="none"
            stroke={BRACKET}
            strokeWidth={5}
            opacity={0.9}
          />
        ))}
      </svg>

      {/* Segitiga neon boil */}
      <svg
        width={1920}
        height={1080}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          filter: `drop-shadow(0 0 ${13 * glow}px ${NEON}) drop-shadow(0 0 ${36 * glow}px ${NEON})`,
        }}
      >
        <g
          transform={`translate(960 530) rotate(${st.rot}) skewX(${st.skew}) scale(1.24 ${(1.24).toFixed(2)}) scale(1 ${st.squash})`}
        >
          <path d={triPath} fill="none" stroke={NEON} strokeWidth={11}
            strokeLinecap="round" opacity={0.85 * glow} />
          <path d={triPath} fill="none" stroke={NEON_CORE} strokeWidth={4.2}
            strokeLinecap="round" opacity={Math.min(1, glow)} />
          <path d={bang.bar} fill="none" stroke={NEON} strokeWidth={13}
            strokeLinecap="round" opacity={0.85 * glow} />
          <path d={bang.bar} fill="none" stroke={NEON_CORE} strokeWidth={5}
            strokeLinecap="round" opacity={Math.min(1, glow)} />
          <circle cx={0} cy={bang.dotY} r={9} fill={NEON_CORE} opacity={glow} />
          <circle cx={0} cy={bang.dotY} r={15} fill={NEON} opacity={0.55 * glow} />
        </g>
      </svg>

      {/* Modifikasi: baris terminal mengetik */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 800,
          transform: 'translateX(-50%)',
          fontFamily: MONO,
          fontSize: 27,
          letterSpacing: 3,
          color: '#ff5f7a',
          opacity: 0.85,
          textShadow: `0 0 12px ${NEON}`,
          whiteSpace: 'pre',
        }}
      >
        {typedText(f)}
      </div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{background: BG0}}>
      <Scene />
      {inBurst ? (
        <>
          <AbsoluteFill
            style={{
              transform: `translateX(${-burstDx}px)`,
              mixBlendMode: 'screen',
              opacity: 0.16,
              filter: 'sepia(1) saturate(6) hue-rotate(-45deg)',
            }}
          >
            <Scene />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `translateX(${burstDx}px)`,
              mixBlendMode: 'screen',
              opacity: 0.16,
              filter: 'sepia(1) saturate(6) hue-rotate(140deg)',
            }}
          >
            <Scene />
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export default Motion;
