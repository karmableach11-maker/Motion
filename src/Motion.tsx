import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION — "System Failure | Virus Code Glitch • Cyber Attack Warning"
 * 1920x1080 • 60 fps • 1200 frames (20 s)
 *
 * Direkonstruksi dari analisa frame-by-frame video referensi (20 s, 30 fps):
 * - Fase 1 (0–3.5 s)  : terminal gelap penuh log compiler/error, progress bar
 *                       cyan naik 0%→100% dengan lompatan tidak rata.
 * - Fase 2 (3.55–4 s) : layar "meledak" kuning penuh dengan smear horizontal.
 * - Fase 3 (4–5.6 s)  : wash biru berat, lalu tenang sejenak.
 * - Fase 4 (5.65–20 s): badge WARNING! merah ber-panah terkunci di pusat,
 *                       terus di-glitch (jitter, flip warna, dobel), teks
 *                       besar samar CYBER ATTACK muncul di burst tertentu.
 * - Sistem glitch: slice horizontal tergeser + RGB split, bar warna solid,
 *   wash biru berpita. State berganti patah-patah ~15 Hz (bukan halus).
 *
 * Seluruh keacakan deterministik (hash seeded per-frame) — aman untuk
 * render multi-thread Remotion. Timeline dinormalisasi ke durasi komposisi,
 * jadi tetap benar bila durationInFrames diubah. Set komposisi ke 1200
 * frame @60fps untuk durasi 20 s sesuai referensi.
 */

// ---------------------------------------------------------------------------
// Deterministic pseudo-random
// ---------------------------------------------------------------------------

const fract = (x: number) => x - Math.floor(x);
const hash = (n: number) => fract(Math.sin(n * 127.1 + 43.7) * 43758.5453123);
const hash2 = (a: number, b: number) => hash(a * 57.31 + b * 911.7);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Palette & typography
// ---------------------------------------------------------------------------

const MONO = "Consolas, 'Courier New', Menlo, monospace";
const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const BG = '#04070a';
const CODE_DIM = '#8fa398';
const CODE_FAINT = '#5c6e64';
const C_ERROR = '#e0524a';
const C_WARN = '#e8c04a';
const C_PATH = '#6fd3c3';
const C_BUILD = '#5fdd7a';
const C_NOTE = '#7f9fe0';
const C_ADDR = '#b48fe0';
const C_MARK = '#3fe07f';

// ---------------------------------------------------------------------------
// Fake compiler / crash log (dekoratif, meniru gaya referensi)
// ---------------------------------------------------------------------------

type LogLine = {t: string; c: string};

const L = (t: string, c: string = CODE_DIM): LogLine => ({t, c});

const LOG: LogLine[] = [
  L('In file included from C:/Users/dev/projects/kernel_core/src/main.cpp:14:', CODE_FAINT),
  L('C:/Users/dev/projects/kernel_core/include/net/socket_layer.h:212:37: error: no member named', C_ERROR),
  L("      'bind_addr' in 'net::SocketConfig'; did you mean 'bound_addr'?", C_ERROR),
  L('      if (cfg.bind_addr && !cfg.reuse_port) {', CODE_DIM),
  L('          ~~~~~~~~~~~~~ ^~~~~~~~~~~~~~~~~~', C_MARK),
  L('C:/PROGRA~1/LLVM/include/c++/v1/type_traits:1523:8: note: candidate template ignored:', C_NOTE),
  L("      could not match 'integral_constant' against 'net::PacketHeader'", C_NOTE),
  L('  [ 47%] Building CXX object modules/CMakeFiles/payload.dir/src/inject_stub.cpp.obj', C_BUILD),
  L('warning C4996: strcpy: This function or variable may be unsafe. Consider strcpy_s.', C_WARN),
  L('  0x00007FFA3B2E19D4  ntdll!RtlRaiseException + 0x3d4', C_ADDR),
  L('  0x00007FFA3B1A88F1  KERNELBASE!UnhandledExceptionFilter + 0x1f1', C_ADDR),
  L('C:/Users/dev/projects/kernel_core/src/heap_guard.cpp:88:19: error: use of undeclared', C_ERROR),
  L("      identifier '__guard_page'; did you mean '__guard_zone'?", C_ERROR),
  L('    verify(__guard_page != nullptr && "heap guard missing");', CODE_DIM),
  L('           ^~~~~~~~~~~~', C_MARK),
  L('  [ 52%] Linking CXX shared library bin/libtelemetry_core.dll', C_BUILD),
  L('In file included from C:/Users/dev/projects/kernel_core/src/sched/ring.cpp:9:', CODE_FAINT),
  L('C:/Users/dev/projects/kernel_core/include/sched/ring.h:301:5: warning: field priority', C_WARN),
  L('      will be initialized after field quantum_ns [-Wreorder-ctor]', C_WARN),
  L('    ring_scheduler(uint32_t slots) : priority(0), quantum_ns(250000) {}', CODE_DIM),
  L('fatal error LNK1120: 3 unresolved externals -- target injector_svc', C_ERROR),
  L('==> BUILD FAILED: process exited with code 0xC0000005 (ACCESS_VIOLATION)', C_ERROR),
  L('Check dependencies: libcrypto-3-x64.dll not found in search PATH', C_WARN),
  L('Stack overflow detected in thread 0x1A44 -- dumping core to crash_1a44.dmp', C_ERROR),
  L('  #12 0x0000000140011F02 in packet_reassembler::flush(std::span<uint8_t>) ring.cpp:412', C_ADDR),
  L('  #13 0x000000014000C4B7 in event_pump::drain() event_pump.cpp:117', C_ADDR),
  L('C:/Users/dev/projects/kernel_core/src/crypto/chain.cpp:56:23: error: static assertion', C_ERROR),
  L("      failed: block size must be a power of two", C_ERROR),
  L('    static_assert((BLOCK & (BLOCK - 1)) == 0, "block size must be a power of two");', CODE_DIM),
  L('                  ^~~~~~~~~~~~~~~~~~~~~~~~~~', C_MARK),
  L('  [ 61%] Building CXX object modules/CMakeFiles/observer.dir/src/watchdog.cpp.obj', C_BUILD),
  L('note: in instantiation of member function hash_ring<64>::rebalance requested here', C_NOTE),
  L('  retrying handshake (2/5): ETIMEDOUT after 30000 ms -- peer 10.0.14.88:8443', C_WARN),
  L('  retrying handshake (3/5): ECONNRESET -- peer 10.0.14.88:8443', C_WARN),
  L('C:/Users/dev/projects/kernel_core/src/io/mmap_pool.cpp:174:9: error: cannot initialize', C_ERROR),
  L("      a member subobject of type 'std::atomic<page_state>' with an rvalue", C_ERROR),
  L('    : pages_{page_state::cold}, high_water_(limit) {', CODE_DIM),
  L('      ^~~~~~', C_MARK),
  L('  0x00007FFA39D144A0  ucrtbase!abort + 0x50', C_ADDR),
  L('  [ 64%] Building CXX object modules/CMakeFiles/net.dir/src/tls_shim.cpp.obj', C_BUILD),
  L('warning: unchecked cast from volatile uint8_t* to dma_descriptor* [-Wcast-qual]', C_WARN),
  L('==> WHILE NATIVE TARGET OF PROJECT block_tools WITH THE DEFAULT CONFIGURATION default ==', CODE_FAINT),
  L('verifying signature chain............FAILED (certificate revoked 2024-11-02)', C_ERROR),
  L('  #14 0x0000000140002E11 in main crt0.c:288', C_ADDR),
  L('In file included from C:/Users/dev/projects/kernel_core/src/svc/daemon.cpp:31:', CODE_FAINT),
  L('C:/Users/dev/projects/kernel_core/include/svc/daemon.h:77:14: warning: daemon_loop', C_WARN),
  L('      hides overloaded virtual function [-Woverloaded-virtual]', C_WARN),
  L('  [ 68%] Linking CXX executable bin/injector_svc.exe', C_BUILD),
];

// ---------------------------------------------------------------------------
// Burst schedule (detik referensi 0..20) — dari timeline bukti
// ---------------------------------------------------------------------------

type Burst = {s: number; e: number; v: number; c?: string};

const BURSTS: Burst[] = [
  {s: 0.85, e: 1.05, v: 0.5, c: 'blue'},
  {s: 1.05, e: 2.5, v: 0.85, c: 'blue'},
  {s: 2.9, e: 3.35, v: 0.55},
  {s: 3.55, e: 4.0, v: 1.0, c: 'yellow'},
  {s: 4.0, e: 4.45, v: 0.9, c: 'olive'},
  {s: 4.45, e: 5.0, v: 0.85, c: 'blue'},
  {s: 5.6, e: 5.9, v: 0.35},
  {s: 6.6, e: 7.1, v: 0.45},
  {s: 7.4, e: 7.75, v: 0.6, c: 'green'},
  {s: 8.05, e: 9.6, v: 0.85, c: 'blue'},
  {s: 9.9, e: 10.15, v: 0.45},
  {s: 10.4, e: 12.0, v: 0.9, c: 'blue'},
  {s: 12.55, e: 12.9, v: 0.5},
  {s: 13.6, e: 13.85, v: 0.5, c: 'magenta'},
  {s: 14.05, e: 14.6, v: 0.55, c: 'amber'},
  {s: 15.3, e: 16.0, v: 0.5, c: 'green'},
  {s: 16.55, e: 17.6, v: 0.8, c: 'blue'},
  {s: 17.9, e: 18.3, v: 0.7, c: 'blue'},
  {s: 19.15, e: 20.0, v: 0.9, c: 'blue'},
];

const EDGE = 0.12; // ramp masuk/keluar burst (detik)

const burstAt = (t: number): {lvl: number; color: string} => {
  let lvl = 0.06;
  let color = 'none';
  for (const b of BURSTS) {
    const env =
      smooth(b.s - EDGE, b.s + EDGE, t) * (1 - smooth(b.e - EDGE, b.e + EDGE, t));
    const v = b.v * env;
    if (v > lvl) {
      lvl = v;
      color = b.c ?? 'none';
    }
  }
  return {lvl, color};
};

// Progress bar: persentase per keyframe (detik, %) — lompatan tidak rata
const PCT: Array<[number, number]> = [
  [0, 0], [0.6, 0], [0.75, 7], [0.9, 19], [1.1, 24], [1.3, 33], [1.5, 38],
  [1.8, 46], [2.05, 49], [2.25, 57], [2.5, 64], [2.8, 71], [2.95, 82],
  [3.15, 89], [3.35, 96], [3.5, 100], [99, 100],
];

const pctAt = (t: number) => {
  let p = 0;
  for (const [kt, kv] of PCT) {
    if (t >= kt) p = kv;
    else break;
  }
  return p;
};

// Jendela kemunculan CYBER ATTACK (detik referensi)
const CYBER_WINDOWS: Array<[number, number]> = [
  [6.55, 7.15], [10.8, 11.35], [16.8, 17.35], [19.2, 19.95],
];

const WASH_COLORS: Record<string, string> = {
  blue: '#1f35e8',
  yellow: '#ffe81a',
  olive: '#9aa023',
  green: '#19c94f',
  magenta: '#ff2bd1',
  amber: '#ffb400',
};

// ---------------------------------------------------------------------------
// Content layers
// ---------------------------------------------------------------------------

const CodeWall: React.FC<{t: number; epoch: number}> = ({t, epoch}) => {
  // Log tampil hampir penuh sejak awal; sesekali "melompat" (scroll patah)
  const jump = hash(epoch * 7.13) < 0.12 ? Math.floor(hash(epoch * 3.7) * 6) : 0;
  const visible = Math.min(LOG.length, 34 + Math.floor(t * 1.2));
  return (
    <div
      style={{
        position: 'absolute',
        left: 46,
        top: 18 - jump * 23,
        fontFamily: MONO,
        fontSize: 17,
        lineHeight: '23px',
        whiteSpace: 'pre',
        opacity: 0.92,
      }}
    >
      {LOG.slice(0, visible).map((ln, i) => {
        const flick =
          hash2(epoch, i) < 0.04 ? 0.25 : 1; // baris sesekali redup
        return (
          <div key={i} style={{color: ln.c, opacity: flick}}>
            {ln.t}
          </div>
        );
      })}
    </div>
  );
};

const ProgressBar: React.FC<{t: number; lvl: number; epoch: number}> = ({
  t,
  lvl,
  epoch,
}) => {
  if (t > 4.15) return null;
  const pct = pctAt(t);
  const x = 320;
  const y = 238;
  const w = 900;
  const h = 18;
  const fills = ['#35e0d6', '#c8ff3d', '#ff4fd8', '#ffd23d'];
  const fill =
    lvl > 0.5 ? fills[Math.floor(hash(epoch * 5.21) * fills.length)] : fills[0];
  const isYellowPhase = t >= 3.55;
  const barColor = isYellowPhase ? '#ffffff' : fill;
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          border: '2px solid rgba(210,255,252,0.55)',
          background: 'rgba(16,34,38,0.55)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            bottom: 2,
            width: `${Math.max(0.5, pct * 0.99)}%`,
            background: barColor,
            boxShadow: `0 0 14px ${barColor}`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: x + w + 26,
          top: y - 8,
          fontFamily: MONO,
          fontSize: 28,
          fontWeight: 700,
          color: isYellowPhase ? '#ffffff' : '#dffcff',
        }}
      >
        {pct}%
      </div>
    </div>
  );
};

const Tri: React.FC<{dir: 1 | -1; color: string}> = ({dir, color}) => {
  const style: React.CSSProperties = {
    width: 0,
    height: 0,
    borderTop: '16px solid transparent',
    borderBottom: '16px solid transparent',
  };
  if (dir === 1) style.borderLeft = `26px solid ${color}`;
  else style.borderRight = `26px solid ${color}`;
  return <div style={style} />;
};

const WarningBadge: React.FC<{t: number; lvl: number; epoch: number}> = ({
  t,
  lvl,
  epoch,
}) => {
  if (t < 5.65) return null;
  const born = smooth(5.65, 6.05, t);
  const flicker =
    born < 1 ? (hash(epoch * 9.77) < 0.5 ? 0.15 : 1) : hash(epoch * 9.77) < 0.05 ? 0.3 : 1;
  const jx = lvl > 0.2 ? (hash(epoch * 3.31) - 0.5) * 60 * lvl : 0;
  const jy = lvl > 0.45 ? (hash(epoch * 8.17) - 0.5) * 26 * lvl : 0;
  const hues = [0, 300, 120, 185];
  const hue =
    lvl > 0.35 ? hues[Math.floor(hash(epoch * 2.71) * hues.length)] : 0;
  const doubled = lvl > 0.4 && hash(epoch * 6.43) < 0.3;

  const badge = (dy: number, op: number, key: string) => (
    <div
      key={key}
      style={{
        position: 'absolute',
        left: 960 + jx,
        top: 520 + dy + jy,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 34,
        opacity: op * flicker,
        filter: hue ? `hue-rotate(${hue}deg) saturate(1.3)` : undefined,
      }}
    >
      <Tri dir={1} color="#ff2222" />
      <div
        style={{
          border: '3px solid #ff2222',
          background: 'rgba(64,0,10,0.6)',
          color: '#ffe9e9',
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 6,
          padding: '14px 46px',
          textShadow: '0 0 18px rgba(255,40,40,0.9)',
          boxShadow: '0 0 26px rgba(255,30,30,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        WARNING!
      </div>
      <Tri dir={-1} color="#ff2222" />
    </div>
  );

  return (
    <div style={{position: 'absolute', inset: 0}}>
      {badge(0, 1, 'a')}
      {doubled ? badge(102, 0.65, 'b') : null}
    </div>
  );
};

const CyberAttack: React.FC<{t: number; lvl: number; epoch: number}> = ({
  t,
  lvl,
  epoch,
}) => {
  const inWindow = CYBER_WINDOWS.some(([s, e]) => t >= s && t <= e);
  const surprise = t > 6.4 && lvl > 0.75 && hash(epoch * 4.99) < 0.35;
  if (!inWindow && !surprise) return null;
  const op = 0.16 + 0.1 * hash(epoch * 1.37);
  const jx = (hash(epoch * 2.03) - 0.5) * 40;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 430,
    transform: `translateX(-50%) translateX(${jx}px)`,
    fontFamily: SANS,
    fontWeight: 900,
    fontSize: 168,
    letterSpacing: 34,
    whiteSpace: 'nowrap',
    color: 'rgba(205,220,255,0.09)',
    WebkitTextStroke: '2px rgba(205,225,255,0.30)',
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: op / 0.2}}>
      <div style={{...base, color: 'rgba(255,60,180,0.10)', transform: `translateX(-50%) translateX(${jx - 8}px)`}}>
        CYBER ATTACK
      </div>
      <div style={{...base, color: 'rgba(60,220,255,0.10)', transform: `translateX(-50%) translateX(${jx + 8}px)`}}>
        CYBER ATTACK
      </div>
      <div style={base}>CYBER ATTACK</div>
    </div>
  );
};

// Semua konten "layar" digabung — sumber untuk salinan slice/tint
const Content: React.FC<{t: number; lvl: number; epoch: number}> = ({
  t,
  lvl,
  epoch,
}) => (
  <AbsoluteFill style={{background: BG}}>
    <CodeWall t={t} epoch={epoch} />
    <CyberAttack t={t} lvl={lvl} epoch={epoch} />
    <ProgressBar t={t} lvl={lvl} epoch={epoch} />
    <WarningBadge t={t} lvl={lvl} epoch={epoch} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Glitch overlays
// ---------------------------------------------------------------------------

const BandedWash: React.FC<{color: string; lvl: number; epoch: number}> = ({
  color,
  lvl,
  epoch,
}) => {
  // Wash berpita horizontal: pita-pita dengan alpha berbeda (seeded)
  const bands = 14;
  const stops: string[] = [];
  for (let i = 0; i < bands; i++) {
    const a = 0.1 + hash2(epoch, i) * 0.85;
    const y0 = (i / bands) * 100;
    const y1 = ((i + 1) / bands) * 100;
    stops.push(`${hexA(color, a)} ${y0.toFixed(1)}% ${y1.toFixed(1)}%`);
  }
  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${stops.join(', ')})`,
          mixBlendMode: 'screen',
          opacity: Math.min(1, lvl * 1.05),
        }}
      />
      <AbsoluteFill
        style={{
          background: color,
          mixBlendMode: 'overlay',
          opacity: lvl * 0.55,
        }}
      />
    </>
  );
};

function hexA(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

const BAR_COLORS = [
  '#ff2bd1', '#00e0ff', '#ffe600', '#28ff5c', '#ff2d55', '#2743ff', '#ff8a00',
];

const BURST_BAR_HUES: Record<string, string> = {
  magenta: '#ff2bd1',
  amber: '#ffe600',
  green: '#28ff5c',
};

const ColorBars: React.FC<{lvl: number; epoch: number; burstColor: string}> = ({
  lvl,
  epoch,
  burstColor,
}) => {
  const hueLock = BURST_BAR_HUES[burstColor]; // burst berwarna = event bar, bukan wash
  const rare = lvl <= 0.3 && hash(epoch * 11.3) < 0.08; // streak tunggal langka
  let count =
    lvl > 0.45
      ? Math.round(lvl * 3 + hash(epoch * 1.91) * 1.5)
      : rare
        ? 1
        : 0;
  if (hueLock) count = Math.max(count, 2);
  if (count === 0) return null;
  return (
    <AbsoluteFill>
      {Array.from({length: count}, (_, i) => {
        const pick =
          hueLock && hash2(epoch * 9 + 4, i) < 0.6
            ? hueLock
            : BAR_COLORS[Math.floor(hash2(epoch * 3 + 1, i) * BAR_COLORS.length)];
        const top = hash2(epoch * 5 + 2, i) * 1030;
        const h = 5 + hash2(epoch * 7 + 3, i) * 42 * Math.max(lvl, 0.4);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              top,
              height: h,
              background: pick,
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 1px, transparent 1px 23px)',
              opacity: 0.92,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // Normalisasi ke "detik referensi" 0..20 agar timeline tetap benar
  // untuk durasi komposisi berapa pun.
  const t = (frame / durationInFrames) * 20;
  const epoch = Math.floor((frame / fps) * 15); // state glitch ~15 Hz

  const {lvl, color} = burstAt(t);
  // Hanya blue/yellow/olive yang menjadi wash layar penuh;
  // magenta/amber/green adalah event bar warna (sesuai referensi).
  const washColor =
    color === 'blue' || color === 'yellow' || color === 'olive'
      ? WASH_COLORS[color]
      : undefined;

  // Slice displacement — salinan konten terpotong & tergeser
  const sliceCount = lvl > 0.14 ? Math.round(2 + lvl * 8) : 0;
  const slices = Array.from({length: sliceCount}, (_, i) => {
    const s = epoch * 13.7 + i * 3.1;
    const top = hash(s + 0.1) * 1040;
    const h = 8 + hash(s + 0.2) * 110 * lvl;
    const dx = (hash(s + 0.3) - 0.5) * 320 * lvl;
    const hue = (hash(s + 0.4) - 0.5) * 90;
    return {top, h, dx, hue};
  });

  // Getar global + kedip kecerahan
  const gx = lvl > 0.25 ? (hash(epoch * 1.13) - 0.5) * 18 * lvl : 0;
  const gy = lvl > 0.5 && hash(epoch * 2.61) < 0.3 ? (hash(epoch * 3.3) - 0.5) * 56 * lvl : 0;
  const flicker = 1 + (hash(epoch * 4.47) - 0.5) * 0.06 * (1 + lvl);

  const content = <Content t={t} lvl={lvl} epoch={epoch} />;

  return (
    <AbsoluteFill style={{background: BG, filter: `brightness(${flicker})`}}>
      {/* Konten dasar */}
      <AbsoluteFill style={{transform: `translate(${gx}px, ${gy}px)`}}>
        {content}
      </AbsoluteFill>

      {/* Salinan slice tergeser (glitch utama) */}
      {slices.map((sl, i) => (
        <AbsoluteFill
          key={i}
          style={{
            transform: `translate(${gx + sl.dx}px, ${gy}px)`,
            clipPath: `inset(${sl.top}px 0 ${Math.max(0, 1080 - sl.top - sl.h)}px 0)`,
            filter: `hue-rotate(${sl.hue}deg) saturate(1.35)`,
          }}
        >
          {content}
        </AbsoluteFill>
      ))}

      {/* RGB split saat burst berat */}
      {lvl > 0.45 ? (
        <>
          <AbsoluteFill
            style={{
              transform: `translateX(${-11 * lvl}px)`,
              mixBlendMode: 'screen',
              opacity: 0.32,
              filter: 'sepia(1) saturate(7) hue-rotate(-45deg) brightness(1.05)',
            }}
          >
            {content}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `translateX(${11 * lvl}px)`,
              mixBlendMode: 'screen',
              opacity: 0.32,
              filter: 'sepia(1) saturate(7) hue-rotate(140deg) brightness(1.05)',
            }}
          >
            {content}
          </AbsoluteFill>
        </>
      ) : null}

      {/* Wash warna berpita */}
      {washColor && lvl > 0.2 ? (
        <BandedWash color={washColor} lvl={lvl} epoch={epoch} />
      ) : null}

      {/* Bar warna solid */}
      <ColorBars lvl={lvl} epoch={epoch} burstColor={color} />

      {/* Scanlines + vignette */}
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 4px)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
