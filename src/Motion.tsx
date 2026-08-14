/* eslint-disable */
/**
 * Motion29 — "SIGNAL PROCESSING · SENSOR ARRAY TELEMETRY"
 * 1920x1080 · 60 fps · 1200 frames (20 s) · PERFECT LOOP
 *
 * Pola loop (idle → populate → live → clear-down → idle):
 *   chrome + widget selalu hidup; hanya isi tabel yang dibangun lalu dibersihkan,
 *   sehingga frame 1200 identik dengan frame 0.
 *
 * Semua digambar di Canvas2D (teks + vektor) → satu pass, cepat, dan
 * memungkinkan glow blur per-sel seperti referensi.
 */
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {noise3D} from '@remotion/noise';

/* ═══════════════════════════════════════════════════════════ FONT */

const FONT_CSS = `
@font-face{font-family:'MxMono29';src:url(data:font/woff2;base64,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) format('woff2');font-weight:400;font-style:normal;font-display:block;}
@font-face{font-family:'MxTitle29';src:url(data:font/woff2;base64,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) format('woff2');font-weight:700;font-style:normal;font-display:block;}
`;

let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () => {
  if (fontsPromise) return fontsPromise;
  const st = document.createElement('style');
  st.textContent = FONT_CSS;
  document.head.appendChild(st);
  fontsPromise = Promise.all([
    (document as any).fonts.load("400 24px 'MxMono29'"),
    (document as any).fonts.load("700 24px 'MxTitle29'"),
  ]).catch(() => null);
  return fontsPromise;
};

const useEmbeddedFonts = () => {
  const [handle] = useState(() => delayRender('fonts-motion29'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
      continueRender(handle);
    };
    const to = setTimeout(finish, 2500);
    ensureFonts().then(finish, finish);
    return () => clearTimeout(to);
  }, [handle]);
  return ready;
};

/* ═══════════════════════════════════════════════════════ KONSTANTA */

const W = 1920;
const H = 1080;
const DUR_F = 1200; // 20 s
const DUR = DUR_F / 60;

const MG = 76; // margin kiri/kanan
const RX = W - MG; // tepi kanan

const MONO = "'MxMono29', 'Courier New', monospace";
const TITLE = "'MxTitle29', 'MxMono29', sans-serif";

// palet terukur dari referensi
const C_BG0 = '#01080d';
const C_BG1 = '#04141a';
const C_TEAL = '#4ff3ec';
const C_TEAL_HI = '#dffdff';
const C_TEAL_MID = '#2bb3ad';
const C_TEAL_DIM = '#15585e';
const C_FILL = '#1fd3c8';
const C_ORANGE = '#ff9a3c';
const C_ORANGE_DIM = '#a35f22';
const C_WARN = '#ffcc4d';

/* ═════════════════════════════════════════════════════ TATA LETAK */

const Y_CHROME = 30;
const WT_Y = 58; // widget atas
const WT_H = 140;
const Y_TITLE = 272;
const Y_HEAD = 342;
const Y_RULE = 360;
const ROW0 = 400;
const ROW_P = 56;
const NROW = 8;
const WB_Y = 830; // widget bawah
const WB_H = 126;
const Y_STATUS = 1014;

const COLS = [
  {k: 'id', label: 'NODE ID', x: MG + 20, w: 160},
  {k: 'temp', label: 'TEMP.', x: MG + 218, w: 130},
  {k: 'unit', label: 'UNIT ID', x: MG + 388, w: 150},
  {k: 'pres', label: 'PRESSURE', x: MG + 578, w: 150},
  {k: 'poll', label: 'POLLING SPEED', x: MG + 768, w: 240},
  {k: 'vol', label: 'VOLUME', x: MG + 1048, w: 150},
  {k: 'sig', label: 'SIGNAL', x: MG + 1238, w: 130},
  {k: 'port', label: 'PORT', x: MG + 1408, w: 220},
  {k: 'st', label: 'STATUS', x: MG + 1636, w: 130},
];

/* ═══════════════════════════════════════════════════════════ DATA */

const UNITS = ['RX1S', 'AB37', '8G5M', 'D25M', 'MK07', 'C7G3', '6QA7', 'PL42'];
const STATES = [
  {t: 'ONLINE', c: C_FILL},
  {t: 'SYNC', c: C_TEAL},
  {t: 'ONLINE', c: C_FILL},
  {t: 'CALIB', c: C_ORANGE},
  {t: 'ONLINE', c: C_FILL},
  {t: 'ONLINE', c: C_FILL},
  {t: 'WARN', c: C_WARN},
  {t: 'ONLINE', c: C_FILL},
];

type Row = {
  id: string;
  temp: number;
  unit: string;
  pres: number;
  poll: number;
  vol: number;
  port: string;
  st: number;
  sd: number;
};

const ROWS: Row[] = Array.from({length: NROW}, (_, i) => ({
  id: `S-0${i + 1}`,
  temp: 29.4 + random('tp' + i) * 2.4,
  unit: UNITS[i],
  pres: 11.8 + random('pr' + i) * 3.6,
  poll: 1040 + random('pl' + i) * 340,
  vol: Math.round(9800 + random('vl' + i) * 84000),
  port: `${'NRGULZBP'[i]}:POS.${Math.round(1000 + random('pt' + i) * 8999)}${'MKLRSFWD'[i]}`,
  st: i,
  sd: random('sd' + i) * 100,
}));

const GLYPH = '0123456789ABCDEFXZ#%*/\\|<>+=';
const scramble = (txt: string, p: number, seed: string) => {
  if (p >= 1) return txt;
  const n = txt.length;
  const settled = Math.floor(n * p);
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = txt[i];
    if (i < settled || ch === ' ' || ch === '.' || ch === ':' || ch === '-') {
      out += ch;
    } else {
      out += GLYPH[Math.floor(random(seed + i + '_' + Math.floor(p * 44)) * GLYPH.length)];
    }
  }
  return out;
};

/* ═══════════════════════════════════════════════════════════ HELP */

type Ctx = CanvasRenderingContext2D;

const txt = (
  c: Ctx,
  s: string,
  x: number,
  y: number,
  size: number,
  col: string,
  a = 1,
  ls = 0,
  align: 'left' | 'right' | 'center' = 'left',
  fam = MONO,
  weight = '400'
) => {
  c.font = `${weight} ${size}px ${fam}`;
  (c as any).letterSpacing = `${ls}px`;
  c.textAlign = align;
  c.globalAlpha = a;
  c.fillStyle = col;
  c.fillText(s, x, y);
  c.globalAlpha = 1;
  (c as any).letterSpacing = '0px';
  c.textAlign = 'left';
};

const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string, a = 1) => {
  c.globalAlpha = a;
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
  c.globalAlpha = 1;
};

const line = (c: Ctx, x1: number, y1: number, x2: number, y2: number, col: string, lw = 1, a = 1) => {
  c.globalAlpha = a;
  c.strokeStyle = col;
  c.lineWidth = lw;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
  c.globalAlpha = 1;
};

/* ═════════════════════════════════════════════════════════ SCENE */

const Scene: React.FC<{F: number; t: number}> = ({F, t}) => {
  const out = useRef<HTMLCanvasElement | null>(null);
  const bloom = useRef<HTMLCanvasElement | null>(null);

  const deco = useMemo(() => {
    return {
      dots: Array.from({length: 96}, (_, i) => random('dt' + i)),
      spec: Array.from({length: 46}, (_, i) => random('sp' + i) * 100),
      barsA: Array.from({length: 20}, (_, i) => random('ba' + i)),
      rings: Array.from({length: 9}, (_, i) => random('rg' + i)),
    };
  }, []);

  useLayoutEffect(() => {
    const oc = out.current;
    if (!oc) return;
    const c = oc.getContext('2d', {alpha: false})!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.filter = 'none';
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.textBaseline = 'alphabetic';

    const ang = 2 * Math.PI * (t / DUR);
    const per = (freq: number, ph = 0) => Math.sin(ang * freq + ph);
    const n01 = (k: number, fr: number) =>
      0.5 + 0.5 * noise3D('w', Math.cos(ang) * fr, Math.sin(ang) * fr, k);

    /* ── fase ── */
    // populate: baris i terungkap berurutan; clear-down: dihapus dari bawah
    const buildOf = (i: number) =>
      Math.max(0, Math.min(1, (t - (0.75 + i * 0.6)) / 0.62));
    const clearOf = (i: number) =>
      Math.max(0, Math.min(1, (t - (16.2 + (NROW - 1 - i) * 0.2)) / 0.32));
    const rowOn = (i: number) => buildOf(i) * (1 - clearOf(i));
    const live = Math.max(0, Math.min(1, (t - 5.9) / 0.5)) * (1 - Math.max(0, Math.min(1, (t - 16.2) / 0.5)));

    /* ── latar ── */
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, C_BG1);
    g.addColorStop(0.45, C_BG0);
    g.addColorStop(1, '#020e14');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // grid halus
    c.strokeStyle = '#0d3b44';
    c.lineWidth = 1;
    c.globalAlpha = 0.16;
    c.beginPath();
    for (let x = 0; x <= W; x += 48) {
      c.moveTo(x + 0.5, 0);
      c.lineTo(x + 0.5, H);
    }
    for (let y = 0; y <= H; y += 48) {
      c.moveTo(0, y + 0.5);
      c.lineTo(W, y + 0.5);
    }
    c.stroke();
    c.globalAlpha = 1;
    // kilau radial lembut
    const rg = c.createRadialGradient(W * 0.5, 430, 60, W * 0.5, 430, 1180);
    rg.addColorStop(0, 'rgba(31,211,200,0.09)');
    rg.addColorStop(1, 'rgba(31,211,200,0)');
    c.fillStyle = rg;
    c.fillRect(0, 0, W, H);

    /* ── chrome atas ── */
    line(c, MG, Y_CHROME, RX, Y_CHROME, C_TEAL_DIM, 1.4, 0.6);
    for (let i = 0; i < 44; i++) {
      const x = MG + 30 + i * 40;
      if (x > RX - 30) break;
      const hgt = i % 5 === 0 ? 9 : 4;
      rect(c, x, Y_CHROME - hgt, 1.6, hgt, C_TEAL_DIM, 0.55);
    }
    txt(c, 'SET.CORD. TRACK', MG, Y_CHROME - 12, 14, C_TEAL_MID, 0.9, 3);
    txt(
      c,
      `PROCESSING DATA 0X${(4096 + Math.round((0.5 - 0.5 * Math.cos(2 * ang)) * 61000))
        .toString(16)
        .toUpperCase()}`,
      W / 2,
      Y_CHROME - 12,
      14,
      C_TEAL_MID,
      0.9,
      3,
      'center'
    );
    txt(c, `CORE/00${234 + Math.round(n01(3, 26) * 40)}.043`, RX, Y_CHROME - 12, 14, C_TEAL_MID, 0.9, 3, 'right');

    /* ── widget atas ── */
    rect(c, MG, WT_Y, RX - MG, 1.2, C_TEAL_DIM, 0.42);
    rect(c, MG, WT_Y + WT_H, RX - MG, 1.2, C_TEAL_DIM, 0.42);
    txt(c, 'DATA MATRIX 01', MG + 4, WT_Y + 24, 14, C_TEAL, 0.95, 3.4);

    // kartu 1: grup bar horizontal
    {
      const x0 = MG + 4;
      for (let k = 0; k < 5; k++) {
        const y = WT_Y + 46 + k * 17;
        const wmax = 128;
        const v = n01(k + 1, 22 + k * 4);
        rect(c, x0, y, wmax, 3, C_TEAL_DIM, 0.35);
        rect(c, x0, y, 22 + v * (wmax - 22), 3, k === 3 ? C_ORANGE : C_TEAL, 0.95);
      }
    }
    // kartu 2: dot matrix
    {
      const x0 = MG + 178;
      for (let i = 0; i < 96; i++) {
        const cx = x0 + (i % 24) * 9;
        const cy = WT_Y + 46 + Math.floor(i / 24) * 11;
        const on = n01(i * 0.37 + 9, 30) > 0.42 + deco.dots[i] * 0.3;
        rect(c, cx, cy, 6, 6, on ? C_TEAL : C_TEAL_DIM, on ? 0.95 : 0.3);
      }
      txt(c, 'ARRAY MAP 24x4', x0, WT_Y + 118, 12, C_TEAL_MID, 0.75, 2.4);
    }
    // kartu 3: waveform bergulir
    {
      const x0 = MG + 428;
      const wv = 260;
      const hh = 44;
      const yc = WT_Y + 68;
      line(c, x0, yc, x0 + wv, yc, C_TEAL_DIM, 1, 0.35);
      c.beginPath();
      for (let i = 0; i <= 130; i++) {
        const u = i / 130;
        const ph = u * 9 - (t / DUR) * 6 * Math.PI * 2;
        const v =
          Math.sin(ph * 2.1) * 0.42 +
          Math.sin(ph * 5.3 + 1.1) * 0.24 +
          Math.sin(ph * 11.7 + 2.3) * 0.12;
        const y = yc - v * hh;
        if (i === 0) c.moveTo(x0 + u * wv, y);
        else c.lineTo(x0 + u * wv, y);
      }
      c.strokeStyle = C_TEAL;
      c.lineWidth = 1.8;
      c.globalAlpha = 0.95;
      c.stroke();
      c.globalAlpha = 1;
      txt(c, 'WAVE SYNC', x0, WT_Y + 118, 12, C_TEAL_MID, 0.75, 2.4);
    }
    // kartu 4: tiga gauge radial
    {
      const x0 = MG + 736;
      for (let k = 0; k < 3; k++) {
        const cx = x0 + k * 84 + 32;
        const cy = WT_Y + 66;
        const v = n01(k * 3 + 17, 18);
        c.strokeStyle = C_TEAL_DIM;
        c.lineWidth = 4;
        c.globalAlpha = 0.4;
        c.beginPath();
        c.arc(cx, cy, 26, -Math.PI * 0.78, Math.PI * 0.78);
        c.stroke();
        c.strokeStyle = k === 1 ? C_ORANGE : C_TEAL;
        c.globalAlpha = 1;
        c.beginPath();
        c.arc(cx, cy, 26, -Math.PI * 0.78, -Math.PI * 0.78 + v * Math.PI * 1.56);
        c.stroke();
        txt(c, `${Math.round(v * 100)}`, cx, cy + 6, 16, C_TEAL_HI, 0.95, 0, 'center');
        txt(c, ['CPU', 'I/O', 'MEM'][k], cx, WT_Y + 118, 12, C_TEAL_MID, 0.75, 2.4, 'center');
      }
    }
    // kartu 5: enam kotak numerik
    {
      const x0 = RX - 356;
      for (let k = 0; k < 6; k++) {
        const bx = x0 + (k % 3) * 120;
        const by = WT_Y + 38 + Math.floor(k / 3) * 44;
        rect(c, bx, by, 108, 34, '#0a2b31', 0.85);
        rect(c, bx, by, 108, 1.4, C_TEAL, 0.5);
        const v = 700 + n01(k * 5 + 31, 20) * 99;
        txt(c, v.toFixed(1), bx + 98, by + 24, 17, k === 4 ? C_ORANGE : C_TEAL_HI, 0.95, 1, 'right');
        txt(c, ['LR01', 'LR02', 'LR03', 'LR04', 'LR05', 'LR06'][k], bx + 8, by + 24, 12, C_TEAL_MID, 0.8, 1.6);
      }
      txt(c, 'LIQUID LEVEL SENSOR ARRAY', RX, WT_Y + 128, 12, C_TEAL_MID, 0.75, 2.4, 'right');
    }

    /* ── judul ── */
    txt(c, 'SIGNAL PROCESSING', MG, Y_TITLE, 52, C_TEAL, 1, 3.4, 'left', TITLE, '700');
    txt(c, 'SENSOR ARRAY · REAL-TIME TELEMETRY', MG + 4, Y_TITLE + 30, 15, C_TEAL_MID, 0.9, 5.2);
    txt(c, 'EXPAND', RX - 26, Y_TITLE - 8, 15, C_TEAL, 0.9, 3.4, 'right');
    // panah expand
    c.strokeStyle = C_TEAL;
    c.lineWidth = 2;
    c.globalAlpha = 0.9;
    c.beginPath();
    c.moveTo(RX - 18, Y_TITLE - 8);
    c.lineTo(RX - 2, Y_TITLE - 24);
    c.moveTo(RX - 12, Y_TITLE - 24);
    c.lineTo(RX - 2, Y_TITLE - 24);
    c.lineTo(RX - 2, Y_TITLE - 14);
    c.stroke();
    c.globalAlpha = 1;

    /* ── header tabel ── */
    for (const col of COLS) {
      txt(c, col.label, col.x, Y_HEAD, 17, C_TEAL_HI, 0.95, 2.6);
    }
    rect(c, MG, Y_RULE, RX - MG, 1.6, C_TEAL, 0.55);

    /* ── baris tabel ── */
    // rangka kosong: selalu ada supaya keadaan idle tidak terbaca "rusak"
    for (let i = 0; i < NROW; i++) {
      const yc = ROW0 + i * ROW_P;
      const skel = 1 - rowOn(i);
      if (skel <= 0.01) continue;
      const puls = 0.55 + 0.45 * (0.5 + 0.5 * per(4, i * 0.7));
      if (i % 2 === 1) rect(c, MG, yc - 21, RX - MG, 34, '#071d22', 0.5 * skel);
      txt(c, ROWS[i].id, COLS[0].x, yc + 6, 20, C_TEAL_DIM, 0.7 * skel * puls, 1.6);
      for (let k = 1; k < COLS.length; k++) {
        const wdt = k === 6 ? 96 : Math.min(COLS[k].w - 24, 118);
        rect(c, COLS[k].x, yc - 1, wdt, 2, C_TEAL_DIM, 0.4 * skel * puls);
      }
      line(c, MG, yc + 15, RX, yc + 15, C_TEAL_DIM, 1, 0.16 * skel);
    }

    for (let i = 0; i < NROW; i++) {
      const r = ROWS[i];
      const yc = ROW0 + i * ROW_P;
      const on = rowOn(i);
      if (on <= 0.001) continue;

      const bp = buildOf(i);
      const cp = clearOf(i);

      // sorotan: subset ber-hash berganti tiap 0,5 s (hanya saat live)
      const stepH = Math.floor(t / 0.5);
      const hl =
        live *
        (random(`hl${stepH}_${i}`) < 0.42 ? 1 : 0) *
        Math.min(1, (t - 5.9) / 0.6);
      const hlSoft = hl * (0.6 + 0.4 * (0.5 + 0.5 * per(24, i)));

      // wipe masuk / keluar
      const wipe = cp > 0 ? 1 - cp : Math.min(1, bp * 1.35);
      const rw = (RX - MG) * wipe;

      if (hlSoft > 0.02) {
        rect(c, MG, yc - 21, rw, 34, C_FILL, 0.72 * hlSoft);
        rect(c, MG, yc - 21, rw, 34, C_TEAL_HI, 0.1 * hlSoft);
      } else if (i % 2 === 1) {
        rect(c, MG, yc - 21, rw, 34, '#0a2429', 0.5);
      }

      const fg = hlSoft > 0.45 ? '#02171a' : C_TEAL_HI;
      const fg2 = hlSoft > 0.45 ? '#03272b' : C_TEAL_MID;
      const a = Math.min(1, bp * 1.6) * (1 - cp);

      // wobble nilai saat live
      const wob = (k: number, amp: number) => amp * (n01(i * 7 + k, 34) - 0.5) * live;
      const dec = Math.min(1, bp * 1.25);
      const seed = `r${i}_${Math.floor(t * 12)}`;

      txt(c, r.id, COLS[0].x, yc + 6, 20, fg, a, 1.6);
      txt(c, scramble((r.temp + wob(1, 0.14)).toFixed(2), dec, seed + 'a'), COLS[1].x, yc + 6, 20, fg, a, 1.2);
      txt(c, scramble(r.unit, dec, seed + 'b'), COLS[2].x, yc + 6, 20, fg, a, 1.2);
      txt(c, scramble((r.pres + wob(2, 0.1)).toFixed(2), dec, seed + 'c'), COLS[3].x, yc + 6, 20, fg, a, 1.2);
      txt(
        c,
        scramble((r.poll + wob(3, 4.4)).toFixed(2), dec, seed + 'd'),
        COLS[4].x + 150,
        yc + 6,
        20,
        fg2,
        a,
        1.2,
        'right'
      );
      txt(c, scramble(String(r.vol + Math.round(wob(4, 42))), dec, seed + 'e'), COLS[5].x, yc + 6, 20, fg, a, 1.2);

      // sparkline SIGNAL
      for (let k = 0; k < 9; k++) {
        const v = n01(i * 11 + k * 1.7 + 50, 40);
        const hgt = 3 + v * 20;
        rect(
          c,
          COLS[6].x + k * 11,
          yc + 8 - hgt,
          6,
          hgt,
          hlSoft > 0.45 ? '#04343a' : k === 8 ? C_ORANGE : C_TEAL,
          a * (0.55 + 0.45 * v)
        );
      }

      txt(c, scramble(r.port, dec, seed + 'f'), COLS[7].x, yc + 6, 20, fg, a, 1.2);

      // chip status
      const stt = STATES[r.st];
      const chipW = 116;
      const cx0 = COLS[8].x;
      rect(c, cx0, yc - 13, chipW, 26, hlSoft > 0.45 ? '#04343a' : stt.c, a * (hlSoft > 0.45 ? 0.9 : 0.16));
      rect(c, cx0, yc - 13, 3, 26, stt.c, a);
      txt(c, stt.t, cx0 + 12, yc + 6, 16, hlSoft > 0.45 ? '#02171a' : stt.c, a, 2);

      // garis pemisah
      if (hlSoft <= 0.02) line(c, MG, yc + 15, MG + rw, yc + 15, C_TEAL_DIM, 1, 0.22 * a);
    }

    /* ── glow refresh per-sel (blur, seperti referensi) ── */
    if (live > 0.1) {
      c.filter = 'blur(7px)';
      c.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 4; k++) {
        const st = Math.floor(t * 2.4) + k * 37;
        const ri = Math.floor(random('gr' + st) * NROW);
        const ci = Math.floor(random('gc' + st) * 6);
        const ph = (t * 2.4) % 1;
        const aa = Math.sin(Math.PI * ph) * 0.7 * live * rowOn(ri);
        if (aa < 0.02) continue;
        const yc = ROW0 + ri * ROW_P;
        const col = COLS[ci];
        c.globalAlpha = aa;
        c.fillStyle = C_TEAL;
        c.fillRect(col.x - 10, yc - 17, col.w, 26);
      }
      c.globalAlpha = 1;
      c.filter = 'none';
      c.globalCompositeOperation = 'source-over';
    }

    /* ── scan bar saat populate ── */
    const scanU = (t - 0.55) / 5.3;
    if (scanU > 0 && scanU < 1.04) {
      const y = ROW0 - 30 + scanU * (NROW * ROW_P + 8);
      const sg = c.createLinearGradient(0, y - 26, 0, y + 26);
      sg.addColorStop(0, 'rgba(79,243,236,0)');
      sg.addColorStop(0.5, 'rgba(79,243,236,0.34)');
      sg.addColorStop(1, 'rgba(79,243,236,0)');
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = sg;
      c.fillRect(MG, y - 26, RX - MG, 52);
      rect(c, MG, y - 1, RX - MG, 2, C_TEAL_HI, 0.85);
      c.globalCompositeOperation = 'source-over';
    }

    /* ── widget bawah ── */
    rect(c, MG, WB_Y, RX - MG, 1.2, C_TEAL_DIM, 0.42);
    txt(c, 'DATA MATRIX 02', MG + 4, WB_Y + 24, 14, C_TEAL, 0.95, 3.4);
    // lingkaran
    {
      const x0 = MG + 10;
      for (let k = 0; k < 9; k++) {
        const cx = x0 + (k % 3) * 26 + 12;
        const cy = WB_Y + 52 + Math.floor(k / 3) * 24;
        const v = n01(k * 2.3 + 70, 26);
        c.strokeStyle = v > 0.55 ? C_TEAL : C_TEAL_DIM;
        c.globalAlpha = v > 0.55 ? 0.95 : 0.4;
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(cx, cy, 8, 0, 6.2832);
        c.stroke();
        c.globalAlpha = 1;
      }
    }
    // grup bar
    {
      const x0 = MG + 130;
      for (let grp = 0; grp < 3; grp++) {
        for (let k = 0; k < 4; k++) {
          const y = WB_Y + 40 + k * 16;
          const v = n01(grp * 9 + k + 80, 24);
          rect(c, x0 + grp * 160, y, 120, 3, C_TEAL_DIM, 0.32);
          rect(c, x0 + grp * 160, y, 26 + v * 94, 3, grp === 1 && k === 2 ? C_ORANGE : C_TEAL, 0.9);
        }
      }
    }
    // glyph teknis: silang, heliks, retikel
    {
      const x0 = MG + 660;
      for (let g2 = 0; g2 < 6; g2++) {
        const cx = x0 + g2 * 78 + 30;
        const cy = WB_Y + 62;
        const ph = (t / DUR) * Math.PI * 2 * 3 + g2;
        c.strokeStyle = g2 % 3 === 1 ? C_ORANGE_DIM : C_TEAL_MID;
        c.lineWidth = 1.5;
        c.globalAlpha = 0.85;
        if (g2 % 3 === 0) {
          // heliks ganda
          c.beginPath();
          for (let i = 0; i <= 40; i++) {
            const u = i / 40;
            const x = cx - 28 + u * 56;
            const y = cy + Math.sin(u * Math.PI * 2 + ph) * 16;
            i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
          }
          c.stroke();
          c.beginPath();
          for (let i = 0; i <= 40; i++) {
            const u = i / 40;
            const x = cx - 28 + u * 56;
            const y = cy - Math.sin(u * Math.PI * 2 + ph) * 16;
            i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
          }
          c.stroke();
        } else if (g2 % 3 === 1) {
          // retikel berputar
          c.beginPath();
          c.arc(cx, cy, 18, 0, 6.2832);
          c.stroke();
          c.save();
          c.translate(cx, cy);
          c.rotate(ph * 0.6);
          c.beginPath();
          c.moveTo(-24, 0);
          c.lineTo(-8, 0);
          c.moveTo(8, 0);
          c.lineTo(24, 0);
          c.moveTo(0, -24);
          c.lineTo(0, -8);
          c.moveTo(0, 8);
          c.lineTo(0, 24);
          c.stroke();
          c.restore();
        } else {
          // bar mini
          for (let k = 0; k < 7; k++) {
            const v = n01(g2 * 5 + k + 90, 36);
            const hgt = 5 + v * 28;
            rect(c, cx - 24 + k * 8, cy + 16 - hgt, 5, hgt, C_TEAL, 0.5 + 0.5 * v);
          }
        }
        c.globalAlpha = 1;
      }
    }
    // spektrum kanan
    {
      const x0 = RX - 300;
      for (let k = 0; k < 46; k++) {
        const v = n01(deco.spec[k] * 0.5 + 100, 44);
        const hgt = 4 + v * 60;
        rect(c, x0 + k * 6.5, WB_Y + 96 - hgt, 4, hgt, k % 8 === 0 ? C_ORANGE : C_TEAL, 0.45 + 0.55 * v);
      }
      txt(c, 'SPECTRUM ANALYZER', RX, WB_Y + 118, 12, C_TEAL_MID, 0.75, 2.4, 'right');
    }

    /* ── status bar ── */
    line(c, MG, Y_STATUS, RX, Y_STATUS, C_TEAL_DIM, 1.4, 0.55);
    const chipOn = 0.55 + 0.45 * (per(6) > 0 ? 1 : 0.5);
    rect(c, MG, Y_STATUS + 12, 128, 24, C_FILL, 0.18 * chipOn);
    rect(c, MG, Y_STATUS + 12, 3, 24, C_FILL, chipOn);
    txt(c, 'SYSTEM ONLINE', MG + 12, Y_STATUS + 29, 14, C_FILL, chipOn, 2.4);
    txt(
      c,
      `KQC50 ${45 + Math.round(n01(7, 16) * 9)} 59 Q74 307 D0${64 + Math.round(n01(8, 12) * 30)}`,
      MG + 176,
      Y_STATUS + 29,
      14,
      C_TEAL_MID,
      0.85,
      2.4
    );
    txt(c, `ACTIVE MEMORY SYNC ${live > 0.5 ? 'ON' : 'IDLE'}`, W / 2, Y_STATUS + 29, 14, C_TEAL_MID, 0.85, 2.4, 'center');
    txt(
      c,
      `NODES ${Math.round(NROW * live * 0 + ROWS.filter((_, i) => rowOn(i) > 0.5).length)}/${NROW} · DATA MODE`,
      RX,
      Y_STATUS + 29,
      14,
      C_TEAL_MID,
      0.85,
      2.4,
      'right'
    );

    /* ── siku sudut ── */
    const brk = (x: number, y: number, sx: number, sy: number) => {
      c.strokeStyle = C_TEAL;
      c.lineWidth = 2.4;
      c.globalAlpha = 0.75;
      c.beginPath();
      c.moveTo(x + sx * 34, y);
      c.lineTo(x, y);
      c.lineTo(x, y + sy * 34);
      c.stroke();
      c.globalAlpha = 1;
    };
    brk(MG - 26, 16, 1, 1);
    brk(RX + 26, 16, -1, 1);
    brk(MG - 26, H - 16, 1, -1);
    brk(RX + 26, H - 16, -1, -1);

    /* ── bloom ── */
    const bc = bloom.current;
    if (bc) {
      const bx = bc.getContext('2d', {alpha: false})!;
      bx.fillStyle = '#000';
      bx.fillRect(0, 0, 480, 270);
      bx.drawImage(oc, 0, 0, 480, 270);
    }
  });

  return (
    <>
      <canvas
        ref={out}
        width={W}
        height={H}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      />
      <canvas
        ref={bloom}
        width={480}
        height={270}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: 'blur(10px)',
          mixBlendMode: 'screen',
          opacity: 0.36,
        }}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════ MAIN */

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  useEmbeddedFonts();

  const F = ((frame % DUR_F) + DUR_F) % DUR_F;
  const t = F / fps;

  return (
    <AbsoluteFill style={{background: C_BG0, overflow: 'hidden'}}>
      <Scene F={F} t={t} />

      {/* scanline CRT halus */}
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 4px)',
          opacity: 0.4,
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 74% 76% at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
