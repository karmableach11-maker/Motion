import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION — "Digital Skull Alert | Cyber Threat Hologram"
 * 1920x1080 • 60 fps • 1200 frames (20 s) • SEAMLESS LOOP
 *
 * - Tengkorak hologram neon merah berputar penuh 360° pada sumbu Y tepat
 *   satu putaran per 20 s (CSS 3D perspective, tiga lapis kedalaman
 *   translateZ → terasa volumetrik tanpa Three.js). Loop otomatis mulus.
 * - Isi tengkorak bergaris scanline (pattern di-clip path); sapuan scan
 *   terang menyapu atas→bawah tiap 4 s (5× per loop).
 * - Hologram sesekali "rusak": slice glitch horizontal 2-3 frame pada
 *   jendela berjadwal, kedip mati-hidup singkat, flicker halus konstan.
 * - Kerucut cahaya proyektor dari bawah + ellipse basis berdenyut.
 * - Teks "MALWARE SIGNATURE FOUND" berdenyut + persentase scan merambat
 *   0→100% dan ter-reset tepat di titik loop.
 * - Latar sekeluarga Motion3/4/5 (dinding kode, partikel, beam, grain,
 *   scanline, vignette).
 *
 * ASET: siluet tengkorak dari Font Awesome Free 6 (ikon "skull", solid) —
 * lisensi ikon CC BY 4.0 (butuh atribusi; periksa kebijakan platform).
 * Halaman: https://fontawesome.com/icons/skull  •  Alternatif menarik:
 * game-icons.net (CC BY 3.0) mis. Dread Skull / Skull Crossed Bones —
 * tinggal ganti konstanta SKULL_PATH.
 *
 * Mandiri — hanya butuh 'remotion'.
 */

// ---------------------------------------------------------------------------
// Deterministic helpers (loop-safe)
// ---------------------------------------------------------------------------

const LOOP = 1200;
const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 43.7) * 43758.5453123);
const hash2 = (a: number, b: number) => hash(a * 57.31 + b * 911.7);
const TAU = Math.PI * 2;
const lsin = (f: number, k: number, phase = 0) =>
  Math.sin(TAU * (f / LOOP) * k + phase);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ---------------------------------------------------------------------------
// Palette & aset
// ---------------------------------------------------------------------------

const BG0 = '#0b1c2c';
const BG1 = '#16344e';
const BEAM = '#38b6e8';
const CODE_C = '#4a8cb2';
const PART_C = '#4fc3f0';
const NEON = '#ff2f5e';
const NEON_CORE = '#ffb3c4';
const MONO = "Consolas, 'Courier New', monospace";

// Font Awesome Free 6 "skull" (solid), viewBox 0 0 512 512 — CC BY 4.0
const SKULL_PATH =
  'M416 398.9c58.5-41.1 96-104.1 96-174.9C512 100.3 397.4 0 256 0S0 100.3 0 ' +
  '224c0 70.7 37.5 133.8 96 174.9c0 .4 0 .7 0 1.1l0 64c0 26.5 21.5 48 48 ' +
  '48l48 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 64 0 0-48c0-8.8 7.2-16 ' +
  '16-16s16 7.2 16 16l0 48 48 0c26.5 0 48-21.5 48-48l0-64c0-.4 0-.7 0-1.1zM96 ' +
  '256a64 64 0 1 1 128 0A64 64 0 1 1 96 256zm256-64a64 64 0 1 1 0 128 64 64 0 1 1 0-128z';

// Jendela slice-glitch (frame mulai, durasi) — jauh dari seam loop
const GLITCHES: Array<[number, number]> = [
  [210, 14], [462, 10], [700, 16], [934, 10], [1080, 12],
];

// ---------------------------------------------------------------------------
// Latar (keluarga seri ini)
// ---------------------------------------------------------------------------

const CODE_SNIPS = [
  'scan /sys/proc/*', 'sig=0xDEAD9F', 'quarantine(pid)', 'heuristic match 91%',
  'entropy spike @0x7C', 'hook detected', 'payload.bin found', 'CRC mismatch',
  'sandbox trace on', 'yara rule hit', 'root@ids:~$ tail', 'port 4444 open',
];

const CodeLayer: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill>
    {Array.from({length: 44}, (_, i) => {
      const txt = CODE_SNIPS[i % CODE_SNIPS.length];
      const x = 20 + hash(i * 3.1) * 1780;
      const y = 20 + hash(i * 7.7) * 1010;
      const k = 2 + Math.floor(hash(i * 5.3) * 4);
      const op = clamp01(0.16 + 0.5 * lsin(f, k, hash(i) * TAU)) * 0.8;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            fontFamily: MONO,
            fontSize: 13 + hash(i * 9.7) * 5,
            color: CODE_C,
            opacity: op,
            whiteSpace: 'pre',
          }}
        >
          {txt}
          {'\n'}
          {CODE_SNIPS[(i + 4) % CODE_SNIPS.length]}
        </div>
      );
    })}
  </AbsoluteFill>
);

const Particles: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill>
    {Array.from({length: 55}, (_, i) => {
      const x = hash(i * 11.3) * 1920;
      const y = hash(i * 17.9) * 1080;
      const s = 1.5 + hash(i * 23.1) * 3;
      const k = 3 + Math.floor(hash(i * 31.7) * 5);
      const tw = clamp01(0.15 + 0.85 * lsin(f, k, hash(i * 41.3) * TAU));
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y + 7 * lsin(f, 1, hash(i * 51.9) * TAU),
            width: s,
            height: s,
            background: PART_C,
            opacity: tw * 0.45,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Satu lapis tengkorak hologram (SVG 560×560, skull di-scale dari 512)
// ---------------------------------------------------------------------------

const SkullLayer: React.FC<{
  glow: number;
  sweepY: number; // 0..1 posisi sapuan scan
  bright?: boolean;
  idSuffix: string;
}> = ({glow, sweepY, bright = false, idSuffix}) => (
  <svg width={560} height={560} viewBox="-24 -24 560 560" style={{display: 'block'}}>
    <defs>
      <pattern id={`holo${idSuffix}`} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="rgba(255,47,94,0.10)" />
        <rect y="0" width="8" height="3.5" fill="rgba(255,47,94,0.30)" />
      </pattern>
      <linearGradient id={`sweep${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="rgba(255,180,200,0)" />
        <stop offset="0.5" stopColor="rgba(255,180,200,0.75)" />
        <stop offset="1" stopColor="rgba(255,180,200,0)" />
      </linearGradient>
      <clipPath id={`clip${idSuffix}`}>
        <path d={SKULL_PATH} />
      </clipPath>
    </defs>
    {/* isi scanline */}
    <path d={SKULL_PATH} fill={`url(#holo${idSuffix})`} />
    {/* outline neon */}
    <path
      d={SKULL_PATH}
      fill="none"
      stroke={NEON}
      strokeWidth={bright ? 10 : 7}
      opacity={0.9 * glow}
    />
    <path
      d={SKULL_PATH}
      fill="none"
      stroke={NEON_CORE}
      strokeWidth={bright ? 3.6 : 2.4}
      opacity={Math.min(1, glow)}
    />
    {/* sapuan scan terang, di-clip bentuk tengkorak */}
    <g clipPath={`url(#clip${idSuffix})`}>
      <rect x={-24} y={sweepY * 560 - 60} width={560} height={90} fill={`url(#sweep${idSuffix})`} />
    </g>
  </svg>
);

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const f = Math.floor((frame / durationInFrames) * LOOP) % LOOP;

  const epoch = Math.floor(f / 5);

  // Rotasi hologram: tepat satu putaran per loop
  const rotY = (f / LOOP) * 360;

  // Flicker & kedip mati-hidup singkat
  const flick = 1 + 0.07 * (hash(epoch * 4.3) - 0.5);
  const blackout = hash(epoch * 9.1) < 0.025 ? 0.25 : 1; // kedip langka
  const breathe = 0.9 + 0.1 * lsin(f, 3, 0.9);
  const glow = breathe * flick;
  const holoOp = 0.92 * blackout * flick;

  // Sapuan scan: 5 sapuan per loop (tiap 4 s), atas → bawah
  const sweepY = (f % 240) / 240;

  // Slice glitch berjadwal
  let glitchAmt = 0;
  for (const [gs, gd] of GLITCHES) {
    if (f >= gs && f < gs + gd) glitchAmt = 1 - Math.abs((f - gs) / gd - 0.5) * 2;
  }

  // Persentase scan: 0→100 linear, reset tepat di loop
  const pct = Math.floor((f / LOOP) * 100);

  // Denyut basis proyektor
  const basePulse = 0.75 + 0.25 * lsin(f, 5, 0.3);

  const holo = (
    <div
      style={{
        position: 'absolute',
        left: 960 - 280,
        top: 230,
        width: 560,
        height: 560,
        perspective: 1100,
        perspectiveOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotY}deg)`,
        }}
      >
        {/* Konstruksi BIDANG SILANG: dua bidang tegak lurus — saat satu
            bidang edge-on (rotasi 90°/270°), bidang lain frontal, sehingga
            tengkorak tidak pernah hilang selama rotasi penuh. */}
        {([0, 90] as const).map((planeRot, p) => (
          <div
            key={p}
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              transform: `rotateY(${planeRot}deg)`,
            }}
          >
            {/* lapis kedalaman → volumetrik */}
            {([-26, 0, 26] as const).map((z, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translateZ(${z}px)`,
                  opacity:
                    (z === 0 ? holoOp : holoOp * 0.32) * (p === 0 ? 1 : 0.75),
                  filter:
                    z === 0 && p === 0
                      ? `drop-shadow(0 0 14px ${NEON}) drop-shadow(0 0 40px ${NEON})`
                      : undefined,
                }}
              >
                <SkullLayer
                  glow={glow}
                  sweepY={sweepY}
                  bright={z === 0}
                  idSuffix={`${p}_${i}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{background: BG0}}>
      {/* Latar */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 95% at 50% 28%, ${BG1} 0%, ${BG0} 78%)`,
        }}
      />
      <CodeLayer f={f} />
      <Particles f={f} />
      <div
        style={{
          position: 'absolute',
          left: 960 - 560,
          top: -320,
          width: 1120,
          height: 780,
          background: `radial-gradient(ellipse at 50% 18%, ${BEAM}55 0%, ${BEAM}1c 42%, transparent 72%)`,
          opacity: 0.7 + 0.15 * lsin(f, 2, 0.4),
        }}
      />

      {/* Kerucut cahaya proyektor dari bawah */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 340,
          top: 300,
          width: 680,
          height: 600,
          background:
            'linear-gradient(0deg, rgba(255,47,94,0.20) 0%, rgba(255,47,94,0.05) 55%, transparent 100%)',
          clipPath: 'polygon(38% 100%, 62% 100%, 96% 0%, 4% 0%)',
          opacity: basePulse * 0.8,
        }}
      />
      {/* Ellipse basis */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 190,
          top: 862,
          width: 380,
          height: 46,
          borderRadius: '50%',
          border: `2px solid ${NEON}`,
          background: 'rgba(255,47,94,0.10)',
          boxShadow: `0 0 24px rgba(255,47,94,${0.5 * basePulse})`,
          opacity: 0.55 + 0.35 * basePulse,
        }}
      />

      {/* Hologram tengkorak (dengan slice glitch saat jendela aktif) */}
      {glitchAmt > 0.02 ? (
        <>
          {Array.from({length: 6}, (_, i) => {
            const top = 230 + hash2(Math.floor(f / 2), i) * 560;
            const h = 16 + hash2(Math.floor(f / 2) + 1, i) * 70;
            const dx = (hash2(Math.floor(f / 2) + 2, i) - 0.5) * 150 * glitchAmt;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  clipPath: `inset(${top}px 0 ${Math.max(0, 1080 - top - h)}px 0)`,
                  transform: `translateX(${dx}px)`,
                }}
              >
                {holo}
              </div>
            );
          })}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'inset(0 0 0 0)',
              opacity: 0.45,
            }}
          >
            {holo}
          </div>
        </>
      ) : (
        holo
      )}

      {/* Teks status */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 930,
          transform: 'translateX(-50%)',
          fontFamily: MONO,
          fontSize: 30,
          letterSpacing: 8,
          color: NEON_CORE,
          opacity: 0.7 + 0.3 * Math.abs(lsin(f, 10)),
          textShadow: `0 0 14px ${NEON}`,
        }}
      >
        MALWARE SIGNATURE FOUND
      </div>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 986,
          transform: 'translateX(-50%)',
          fontFamily: MONO,
          fontSize: 23,
          letterSpacing: 4,
          color: '#bfe6ee',
          opacity: 0.75,
        }}
      >
        DEEP SCAN {String(pct).padStart(2, '0')}% // THREAT LEVEL: CRITICAL
      </div>

      {/* Grain shimmer */}
      <svg
        width={1920}
        height={1080}
        style={{position: 'absolute', inset: 0, opacity: 0.2, mixBlendMode: 'screen'}}
      >
        <filter id="grain6">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.11"
            numOctaves="3"
            seed={Math.floor(f / 2) % 600}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.5" />
            <feFuncG type="linear" slope="0.55" />
            <feFuncB type="linear" slope="0.7" />
          </feComponentTransfer>
        </filter>
        <rect width={1920} height={1080} filter="url(#grain6)" />
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
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.42) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
