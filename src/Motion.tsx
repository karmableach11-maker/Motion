import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION — "Access Granted / Access Denied | Neon Terminal Loop"
 * 1920x1080 • 60 fps • 1200 frames (20 s) • SEAMLESS LOOP
 *
 * Struktur: 4 blok × 300 frame — DENIED → GRANTED → DENIED → GRANTED → loop.
 * Setiap pergantian (60 frame terakhir tiap blok):
 *   1. Antisipasi: gembok neon di atas teks bergetar makin cepat (~0.5 s).
 *   2. Satu flash putih redup (4 frame).
 *   3. Teks lama pecah — huruf rontok jatuh dengan rotasi & fade.
 *   4. Teks baru menyala huruf per huruf seperti tabung neon dinyalakan
 *      (flicker dulu, lalu stabil), menjalar sampai awal blok berikutnya.
 * Rona seluruh latar merambat pelan (merah-gelap ↔ hijau-teal), bracket
 * sudut ikut berganti warna, gembok terbuka saat GRANTED.
 *
 * Latar sekeluarga dengan Motion3 (dinding kode redup, panel mosaik,
 * partikel cyan, beam bernapas, grain shimmer, scanline, vignette).
 * Semua deterministik & periodik bulat terhadap 1200 frame → loop mulus.
 * Mandiri — hanya butuh 'remotion'.
 */

// ---------------------------------------------------------------------------
// Deterministic helpers (loop-safe)
// ---------------------------------------------------------------------------

const LOOP = 1200;
const CYCLE = 300; // satu blok state
const HOLD = 240; // sisa 60 frame = jendela transisi
const FLASH_AT = 270; // frame lokal saat flash (kelahiran teks berikutnya)

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 43.7) * 43758.5453123);
const hash2 = (a: number, b: number) => hash(a * 57.31 + b * 911.7);
const TAU = Math.PI * 2;
const lsin = (f: number, k: number, phase = 0) =>
  Math.sin(TAU * (f / LOOP) * k + phase);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth01 = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const BG0 = '#0b1c2c';
const BG1 = '#16344e';
const BEAM = '#38b6e8';
const CODE_C = '#4a8cb2';
const PART_C = '#4fc3f0';
const MONO = "Consolas, 'Courier New', monospace";
const HEAVY = "'Arial Black', 'Segoe UI', Arial, sans-serif";

type Scheme = {
  neon: string;
  core: string;
  wash: string;
  glowRgb: string;
};

const DENIED: Scheme = {
  neon: '#ff2f5e',
  core: '#ffb3c4',
  wash: 'rgba(255,40,80,0.10)',
  glowRgb: '255,47,94',
};
const GRANTED: Scheme = {
  neon: '#23e07c',
  core: '#b8ffd9',
  wash: 'rgba(35,224,140,0.10)',
  glowRgb: '35,224,124',
};

const TEXTS = ['ACCESS DENIED', 'ACCESS GRANTED'];
const SCHEMES = [DENIED, GRANTED];

// ---------------------------------------------------------------------------
// Latar (keluarga Motion3)
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
      const k = 2 + Math.floor(hash(i * 5.3) * 4);
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
      const drift = 6 * lsin(f, 1, hash(i * 51.9) * TAU);
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

const Panels: React.FC<{f: number}> = ({f}) => (
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
);

// ---------------------------------------------------------------------------
// Gembok neon (SVG) — tertutup saat DENIED, terbuka saat GRANTED
// ---------------------------------------------------------------------------

const Padlock: React.FC<{
  scheme: Scheme;
  openProg: number; // 0 tertutup .. 1 terbuka
  shake: number; // px
  epoch: number;
  glow: number;
}> = ({scheme, openProg, shake, epoch, glow}) => {
  const j = (i: number, amp = 1.6) => (hash2(epoch, i) - 0.5) * 2 * amp;
  const sx = (hash(epoch * 3.7) - 0.5) * 2 * shake;
  const shackleRot = -46 * smooth01(openProg);
  const shackleLift = -10 * smooth01(openProg);
  return (
    <svg
      width={260}
      height={220}
      style={{
        position: 'absolute',
        left: 960 - 130 + sx,
        top: 208,
        filter: `drop-shadow(0 0 ${8 * glow}px ${scheme.neon}) drop-shadow(0 0 ${20 * glow}px ${scheme.neon})`,
      }}
    >
      <g transform={`translate(130 128)`}>
        {/* shackle — pivot di kaki kiri */}
        <g
          transform={`translate(-30 ${-34 + shackleLift + j(9, 1)}) rotate(${shackleRot}) translate(30 0)`}
        >
          <path
            d={`M -30 ${j(0)} C -30 ${-46 + j(1)}, 30 ${-46 + j(2)}, 30 ${j(3)}`}
            fill="none"
            stroke={scheme.neon}
            strokeWidth={11}
            strokeLinecap="round"
            opacity={0.85 * glow}
          />
          <path
            d={`M -30 ${j(0)} C -30 ${-46 + j(1)}, 30 ${-46 + j(2)}, 30 ${j(3)}`}
            fill="none"
            stroke={scheme.core}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={Math.min(1, glow)}
          />
        </g>
        {/* badan */}
        <rect
          x={-52 + j(4, 1)}
          y={-6 + j(5, 1)}
          width={104}
          height={78}
          rx={14}
          fill="rgba(255,255,255,0.02)"
          stroke={scheme.neon}
          strokeWidth={9}
          opacity={0.85 * glow}
        />
        <rect
          x={-52 + j(4, 1)}
          y={-6 + j(5, 1)}
          width={104}
          height={78}
          rx={14}
          fill="none"
          stroke={scheme.core}
          strokeWidth={3.4}
          opacity={Math.min(1, glow)}
        />
        {/* lubang kunci */}
        <circle cx={j(6, 1)} cy={26 + j(7, 1)} r={9} fill={scheme.core} opacity={glow} />
        <rect x={-3 + j(6, 1)} y={30 + j(7, 1)} width={6} height={18} fill={scheme.core} opacity={glow} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Teks neon per-huruf
// ---------------------------------------------------------------------------

type LetterPhase =
  | {kind: 'steady'}
  | {kind: 'ignite'; tOn: number}
  | {kind: 'break'; tDie: number};

const NeonText: React.FC<{
  text: string;
  scheme: Scheme;
  phase: LetterPhase;
  epoch: number;
  glow: number;
  shake: number;
}> = ({text, scheme, phase, epoch, glow, shake}) => {
  const letters = text.split('');
  return (
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: 540,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        whiteSpace: 'pre',
      }}
    >
      {letters.map((ch, i) => {
        let op = 1;
        let dy = 0;
        let rot = 0;
        // boil halus per huruf
        const bx = (hash2(epoch, i * 2.1) - 0.5) * 2.4;
        const by = (hash2(epoch, i * 3.3) - 0.5) * 2.4;
        const flickBase = hash2(epoch, i * 5.7) < 0.04 ? 0.55 : 1;

        if (phase.kind === 'ignite') {
          const igniteAt = 4 + i * 3 + hash(i * 7.9) * 5;
          const dt = phase.tOn - igniteAt;
          if (dt < 0) op = 0;
          else if (dt < 14) {
            // flicker tabung menyala
            op = hash2(Math.floor(dt / 2), i * 9.1) < 0.55 ? 1 : 0.12;
          }
        } else if (phase.kind === 'break') {
          const startAt = hash(i * 11.7) * 6;
          const dt = Math.max(0, phase.tDie - startAt);
          dy = dt * dt * 0.42;
          rot = (hash(i * 13.3) - 0.5) * 2 * dt * 2.2;
          op = clamp01(1 - dt / 22);
        }

        const sx = shake > 0 ? (hash2(epoch, i * 17.3) - 0.5) * 2 * shake : 0;
        const g = glow * flickBase;
        return (
          <span
            key={i}
            style={{
              fontFamily: HEAVY,
              fontWeight: 900,
              fontSize: 128,
              letterSpacing: 20,
              color: scheme.core,
              opacity: op,
              transform: `translate(${bx + sx}px, ${by + dy}px) rotate(${rot}deg)`,
              textShadow:
                op > 0.05
                  ? `0 0 8px ${scheme.core}, 0 0 22px ${scheme.neon}, 0 0 48px rgba(${scheme.glowRgb},${0.85 * g}), 0 0 90px rgba(${scheme.glowRgb},${0.45 * g})`
                  : 'none',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const f = Math.floor((frame / durationInFrames) * LOOP) % LOOP;

  const block = Math.floor(f / CYCLE); // 0..3
  const local = f % CYCLE;
  const stateIdx = block % 2; // 0 DENIED, 1 GRANTED
  const nextIdx = (block + 1) % 2;

  const epoch = Math.floor(f / 5); // 12 Hz boil (wrap 240 → loop aman)

  // Usia teks aktif sejak flash kelahirannya (flash blok sebelumnya)
  const tOn = local + (CYCLE - FLASH_AT); // local 0 → sudah 30 frame menyala
  const inTrans = local >= HOLD;
  const tAnt = clamp01((local - HOLD) / (FLASH_AT - HOLD)); // antisipasi 0..1
  const tDie = local - FLASH_AT; // >0 setelah flash: teks lama rontok

  // Fase teks aktif (lahir → ignite → steady → break)
  const curPhase: LetterPhase =
    tDie >= 0
      ? {kind: 'break', tDie}
      : tOn < 70
        ? {kind: 'ignite', tOn}
        : {kind: 'steady'};

  // Teks berikutnya mulai menyala tepat saat flash
  const nextPhase: LetterPhase | null =
    tDie >= 0 ? {kind: 'ignite', tOn: tDie} : null;

  // Rona latar merambat 80 frame, dimulai TEPAT saat flash sehingga
  // kontinu melewati batas blok (tDie 0..29 → tOn 30..109 di blok baru)
  const curScheme = SCHEMES[stateIdx];
  const washPrev = tDie >= 0 ? SCHEMES[stateIdx] : SCHEMES[nextIdx];
  const washCur = tDie >= 0 ? SCHEMES[nextIdx] : SCHEMES[stateIdx];
  const washMix = tDie >= 0 ? smooth01(tDie / 80) : smooth01(tOn / 80);

  // Gembok: terbuka saat GRANTED; getar naik selama antisipasi
  const lockOpen =
    tDie >= 0
      ? nextIdx === 1
        ? tDie / 30
        : 1 - tDie / 30
      : stateIdx === 1
        ? 1
        : 0;
  const shake = inTrans && tDie < 0 ? 7 * tAnt * tAnt : 0;

  // Glow bernapas + flicker
  const breathe = 0.88 + 0.12 * lsin(f, 4, 0.7);
  const flick = 1 + 0.05 * (hash(epoch * 4.3) - 0.5);
  const glow = breathe * flick;

  // Flash putih 4 frame setelah FLASH_AT
  const flashOp =
    tDie >= 0 && tDie < 4 ? 0.16 * (1 - tDie / 4) : 0;

  // Skema untuk elemen aksen (bracket, gembok) mengikuti campuran
  const accent = washMix < 0.5 ? washPrev : washCur;
  // Gembok mengikuti state teks langsung (bukan campuran) agar tidak
  // berkedip balik warna saat melewati batas blok
  const lockScheme = SCHEMES[tDie >= 0 ? nextIdx : stateIdx];

  const bj = (i: number) => (hash2(epoch, i) - 0.5) * 4;

  return (
    <AbsoluteFill style={{background: BG0}}>
      {/* Latar digital */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 120% 95% at 50% 28%, ${BG1} 0%, ${BG0} 78%)`,
        }}
      />
      <Panels f={f} />
      <CodeLayer f={f} />
      <Particles f={f} />
      {/* Beam atas bernapas */}
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

      {/* Rona state merambat (crossfade merah ↔ hijau) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${washPrev.wash} 0%, transparent 75%)`,
          opacity: 1 - washMix,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${washCur.wash} 0%, transparent 75%)`,
          opacity: washMix,
        }}
      />

      {/* Grain shimmer */}
      <svg
        width={1920}
        height={1080}
        style={{position: 'absolute', inset: 0, opacity: 0.2, mixBlendMode: 'screen'}}
      >
        <filter id="grain4">
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
        <rect width={1920} height={1080} filter="url(#grain4)" />
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

      {/* Bracket sudut mengikuti warna state */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {([
          [520, 300, 1, 1], [1400, 300, -1, 1],
          [520, 780, 1, -1], [1400, 780, -1, -1],
        ] as const).map(([x, y, sxx, syy], i) => (
          <path
            key={i}
            d={`M ${x + bj(i)} ${y + 36 * syy + bj(i + 4)} L ${x + bj(i)} ${y + bj(i + 4)} L ${x + 36 * sxx + bj(i)} ${y + bj(i + 4)}`}
            fill="none"
            stroke={accent.neon}
            strokeWidth={5}
            opacity={0.8 + 0.2 * (hash(epoch * 7.1) > 0.12 ? 1 : 0.2)}
          />
        ))}
      </svg>

      {/* Gembok */}
      <Padlock
        scheme={lockScheme}
        openProg={clamp01(lockOpen)}
        shake={shake}
        epoch={epoch}
        glow={glow}
      />

      {/* Teks aktif (steady / ignite / break) */}
      <NeonText
        text={TEXTS[stateIdx]}
        scheme={curScheme}
        phase={curPhase}
        epoch={epoch}
        glow={glow}
        shake={shake * 0.35}
      />
      {/* Teks berikutnya menyala saat teks lama rontok */}
      {nextPhase ? (
        <NeonText
          text={TEXTS[nextIdx]}
          scheme={SCHEMES[nextIdx]}
          phase={nextPhase}
          epoch={epoch}
          glow={glow}
          shake={0}
        />
      ) : null}

      {/* Baris status kecil di bawah */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 796,
          transform: 'translateX(-50%)',
          fontFamily: MONO,
          fontSize: 24,
          letterSpacing: 4,
          color: accent.core,
          opacity: 0.7,
          textShadow: `0 0 10px ${accent.neon}`,
        }}
      >
        {stateIdx === 1 && tDie < 0 ? 'SECURITY CLEARANCE // LEVEL 4' : 'AUTHORIZATION REQUIRED'}
      </div>

      {/* Flash putih */}
      {flashOp > 0 ? (
        <AbsoluteFill style={{background: '#ffffff', opacity: flashOp}} />
      ) : null}
    </AbsoluteFill>
  );
};

export default Motion;
