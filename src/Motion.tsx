/* eslint-disable */
/**
 * Motion28 — "AI FIREWALL · REAL-TIME THREAT NEUTRALIZATION"
 * 1920x1080 · 60 fps · 1560 frames (26 s) · PERFECT LOOP
 *
 * Struktur:
 *   - Perisai Goldberg (dual icosphere, 642 sel heksagonal) diproyeksikan
 *     pinhole di Canvas2D, rim-lit Fresnel, berputar 360 derajat per loop
 *   - Inti AI: bola panas + kandang ikosahedral + 3 cincin orbit
 *   - Ancaman komet merah datang dari luar; node AI mengunci lalu menembak,
 *     sebagian menghantam perisai dan diblokir dengan riak geodesik
 *   - HUD: rail kiri (telemetri), rail kanan (log intersepsi), status band
 *   - Semua counter dikali (1 - clear) sehingga kembali NOL di seam
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
@font-face{font-family:'MxMono28';src:url(data:font/woff2;base64,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) format('woff2');font-weight:400;font-style:normal;font-display:block;}
@font-face{font-family:'MxTitle28';src:url(data:font/woff2;base64,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) format('woff2');font-weight:700;font-style:normal;font-display:block;}
`;

let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () => {
  if (fontsPromise) return fontsPromise;
  const st = document.createElement('style');
  st.textContent = FONT_CSS;
  document.head.appendChild(st);
  fontsPromise = Promise.all([
    (document as any).fonts.load("400 24px 'MxMono28'"),
    (document as any).fonts.load("700 24px 'MxTitle28'"),
  ]).catch(() => null);
  return fontsPromise;
};

const useEmbeddedFonts = () => {
  const [handle] = useState(() => delayRender('fonts-motion28'));
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
const DUR_F = 1560; // 26 s
const FPS = 60;
const DUR = DUR_F / FPS;

const CX = W / 2;
const CYS = H / 2 - 26; // pusat bola

const DIST = 2700;
const FOCAL = 2700; // FOCAL = DIST → skala di z=0 tepat 1,0
const R = 336; // radius perisai (px di z=0)

const MONO = "'MxMono28', 'Courier New', monospace";
const TITLE = "'MxTitle28', 'MxMono28', sans-serif";

const CYAN = '#22d3ee';
const CYAN_HI = '#a5f3fc';
const CYAN_DIM = '#0e7490';
const RED = '#ff3324';
const AMBER = '#ffb020';

/* ═══════════════════════════════════════════ GEOMETRI GOLDBERG */

type V3 = [number, number, number];
const nrm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

type Cell = {n: V3; poly: V3[]; node: boolean; grp: number; sd: number};

const buildShell = (sub: number): {cells: Cell[]; cage: [V3, V3][]} => {
  const T = (1 + Math.sqrt(5)) / 2;
  let verts: V3[] = (
    [
      [-1, T, 0],
      [1, T, 0],
      [-1, -T, 0],
      [1, -T, 0],
      [0, -1, T],
      [0, 1, T],
      [0, -1, -T],
      [0, 1, -T],
      [T, 0, -1],
      [T, 0, 1],
      [-T, 0, -1],
      [-T, 0, 1],
    ] as V3[]
  ).map(nrm);
  let faces: number[][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  // kandang ikosahedral (level 1) disimpan untuk inti
  let cage: [V3, V3][] = [];
  const edgeSet = new Set<string>();
  faces.forEach((f) => {
    for (let i = 0; i < 3; i++) {
      const a = f[i];
      const b = f[(i + 1) % 3];
      const k = Math.min(a, b) + '-' + Math.max(a, b);
      if (!edgeSet.has(k)) {
        edgeSet.add(k);
        cage.push([verts[a], verts[b]]);
      }
    }
  });

  for (let s = 0; s < sub; s++) {
    const cache = new Map<number, number>();
    const mid = (a: number, b: number) => {
      const key = Math.min(a, b) * 100000 + Math.max(a, b);
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const p = nrm([
        verts[a][0] + verts[b][0],
        verts[a][1] + verts[b][1],
        verts[a][2] + verts[b][2],
      ]);
      verts.push(p);
      const idx = verts.length - 1;
      cache.set(key, idx);
      return idx;
    };
    const nf: number[][] = [];
    for (const f of faces) {
      const a = mid(f[0], f[1]);
      const b = mid(f[1], f[2]);
      const c = mid(f[2], f[0]);
      nf.push([f[0], a, c], [f[1], b, a], [f[2], c, b], [a, b, c]);
    }
    faces = nf;
  }

  // dual → satu sel per vertex (heksagon; pentagon di 12 vertex asli)
  const adj: number[][] = verts.map(() => []);
  faces.forEach((f, fi) => f.forEach((v) => adj[v].push(fi)));
  const cent: V3[] = faces.map((f) =>
    nrm([
      verts[f[0]][0] + verts[f[1]][0] + verts[f[2]][0],
      verts[f[0]][1] + verts[f[1]][1] + verts[f[2]][1],
      verts[f[0]][2] + verts[f[1]][2] + verts[f[2]][2],
    ])
  );

  const cells: Cell[] = verts.map((v, vi) => {
    const up: V3 = Math.abs(v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const e1 = nrm(cross3(up, v));
    const e2 = cross3(v, e1);
    const poly = adj[vi]
      .map((fi) => ({c: cent[fi], a: Math.atan2(dot3(cent[fi], e2), dot3(cent[fi], e1))}))
      .sort((p, q) => p.a - q.a)
      // inset 0,84 → ada celah antar pelat, terbaca sebagai perisai berpelat
      .map((o) =>
        nrm([
          v[0] + (o.c[0] - v[0]) * 0.84,
          v[1] + (o.c[1] - v[1]) * 0.84,
          v[2] + (o.c[2] - v[2]) * 0.84,
        ])
      );
    return {
      n: v,
      poly,
      node: random('nd' + vi) < 0.046,
      grp: Math.floor(random('gp' + vi) * 11),
      sd: random('sd' + vi) * 120,
    };
  });

  return {cells, cage};
};

/* ══════════════════════════════════════════════ TRANSFORMASI 3D */

const objToView = (
  p: V3, cy: number, sy: number, cp: number, sp: number
): V3 => {
  const x1 = p[0] * cy + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy;
  return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
};

const viewToObj = (
  v: V3, cy: number, sy: number, cp: number, sp: number
): V3 => {
  const y1 = v[1] * cp + v[2] * sp;
  const z1 = -v[1] * sp + v[2] * cp;
  return [v[0] * cy - z1 * sy, y1, v[0] * sy + z1 * cy];
};

/* ═════════════════════════════════════════════ JADWAL ANCAMAN */

type Threat = {
  t0: number;
  dur: number;
  dir: V3; // arah TIBA di RUANG PANDANG (tetap terhadap kamera)
  perp: V3; // sumbu lengkung lintasan
  spin: number; // sudut awal lintasan spiral (rad)
  kind: 0 | 1; // 0 = dicegat beam di luar perisai, 1 = menghantam perisai
  lock: number; // fraksi perjalanan saat node mengunci
  sd: number;
  ip: string;
  vec: string;
};

const VECTORS = [
  'DDoS AMPLIFY',
  'SQL INJECTION',
  'ZERO-DAY RCE',
  'CRED STUFFING',
  'PORT SWEEP',
  'RANSOM PAYLOAD',
  'DNS TUNNEL',
  'BOTNET C2',
  'XSS PROBE',
  'BRUTE FORCE',
  'MITM RELAY',
  'SUPPLY CHAIN',
];

const buildThreats = (): Threat[] => {
  const groups = [
    {from: 44, to: 300, n: 3},
    {from: 300, to: 690, n: 8},
    {from: 690, to: 1130, n: 19},
    {from: 1130, to: 1330, n: 5},
  ];
  const out: Threat[] = [];
  let k = 0;
  for (const g of groups) {
    const step = (g.to - g.from) / g.n;
    for (let i = 0; i < g.n; i++, k++) {
      const t0 = Math.round(g.from + (i + 0.45 * random('tj' + k)) * step);
      const dur = Math.round(62 + random('td' + k) * 46);
      // arah condong ke hemisfer depan supaya benturan terlihat
      const zc = -0.12 + 0.74 * Math.pow(random('tz' + k), 0.7);
      const rr = Math.sqrt(Math.max(0, 1 - zc * zc));
      const a = random('ta' + k) * Math.PI * 2;
      const dir: V3 = [rr * Math.cos(a), rr * Math.sin(a), Math.min(0.99, zc)];
      const anyv: V3 = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const p1 = nrm(cross3(anyv, dir));
      const p2 = cross3(dir, p1);
      const roll = random('tr' + k) * Math.PI * 2;
      const perp: V3 = [
        p1[0] * Math.cos(roll) + p2[0] * Math.sin(roll),
        p1[1] * Math.cos(roll) + p2[1] * Math.sin(roll),
        p1[2] * Math.cos(roll) + p2[2] * Math.sin(roll),
      ];
      out.push({
        t0,
        dur,
        dir,
        perp,
        spin: 0.62 + random('tp' + k) * 0.55,
        kind: random('tk' + k) < 0.68 ? 0 : 1,
        lock: 0.5 + random('tl' + k) * 0.14,
        sd: random('ts' + k) * 100,
        ip: `${[45, 91, 103, 185, 198][Math.floor(random('ti' + k) * 5)]}.${Math.floor(
          random('ti2' + k) * 255
        )}.${Math.floor(random('ti3' + k) * 255)}.${Math.floor(random('ti4' + k) * 254)}`,
        vec: VECTORS[Math.floor(random('tv' + k) * VECTORS.length)],
      });
    }
  }
  return out.sort((a, b) => a.t0 - b.t0);
};

const THREATS = buildThreats();

/** posisi ancaman pada fraksi perjalanan u — spiral masuk, tiba tepat di th.dir */
const threatAt = (th: Threat, u: number): V3 => {
  const endR = th.kind === 0 ? 1.42 : 1.0;
  const rr = (2.5 + (endR - 2.5) * Math.pow(u, 1.2)) * R;
  const a = th.spin * Math.pow(1 - u, 1.35);
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return [
    (th.dir[0] * ca + th.perp[0] * sa) * rr,
    (th.dir[1] * ca + th.perp[1] * sa) * rr,
    (th.dir[2] * ca + th.perp[2] * sa) * rr,
  ];
};

/* ══════════════════════════════════════════════════════ SCENE */

type Impact = {objDir: V3; age: number; power: number; kind: 0 | 1};

const Scene: React.FC<{F: number; t: number; esc: number; clear: number}> = ({
  F,
  t,
  esc,
  clear,
}) => {
  const out = useRef<HTMLCanvasElement | null>(null);
  const bloom = useRef<HTMLCanvasElement | null>(null);
  const geo = useMemo(() => buildShell(3), []);

  const stars = useMemo(
    () =>
      Array.from({length: 260}, (_, i) => ({
        x: random('sx' + i) * (W + 300) - 150,
        y0: random('sy' + i) * (H + 300),
        r: 0.5 + random('sr' + i) * 1.9,
        a: 0.12 + random('sa' + i) * 0.5,
        cyc: 1 + Math.floor(random('sc' + i) * 3),
        sd: random('ss' + i) * 80,
      })),
    []
  );

  useLayoutEffect(() => {
    const oc = out.current;
    if (!oc) return;
    const c = oc.getContext('2d', {alpha: false})!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.filter = 'none';

    const ang = 2 * Math.PI * (t / DUR);

    /* ---------- latar ---------- */
    const bg = c.createRadialGradient(CX, CYS, 40, CX, CYS, 1120);
    bg.addColorStop(0, '#071c2b');
    bg.addColorStop(0.42, '#050f1c');
    bg.addColorStop(1, '#02050b');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // bintang paralaks
    const CORR = H + 300;
    for (const s of stars) {
      const y = ((s.y0 - ((CORR * s.cyc) / DUR) * t) % CORR + CORR) % CORR - 150;
      const n = noise3D('st', Math.cos(ang) * 24, Math.sin(ang) * 24, s.sd * 0.3);
      c.globalAlpha = s.a * (0.4 + 0.6 * (0.5 + 0.5 * n));
      c.fillStyle = s.r > 1.6 ? '#bfe9f7' : '#7fb6cc';
      c.beginPath();
      c.arc(s.x, y, s.r, 0, 6.2832);
      c.fill();
    }
    c.globalAlpha = 1;

    /* ---------- kamera ---------- */
    const yaw = ang; // satu putaran penuh per loop
    const pitch = -0.19 + 0.05 * Math.sin(2 * ang);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const dolly = DIST + 46 * (0.5 - 0.5 * Math.cos(ang));

    const proj = (v: V3) => {
      const zc = dolly - v[2];
      const s = FOCAL / zc;
      return [CX + v[0] * s, CYS - v[1] * s, s] as [number, number, number];
    };

    /* ---------- kumpulkan benturan aktif ---------- */
    const impacts: Impact[] = [];
    const beams: {from: V3; to: V3; a: number}[] = [];
    const comets: {th: Threat; life: number}[] = [];

    for (const th of THREATS) {
      const age = F - th.t0;
      if (age < -1) continue;
      const u = age / th.dur;
      if (u >= 0 && u <= 1) {
        comets.push({th, life: u});
        // beam pengunci
        if (u > th.lock && u < th.lock + 0.18) {
          const bu = (u - th.lock) / 0.18;
          const objDir = viewToObj(th.dir, cy, sy, cp, sp);
          let best = geo.cells[0];
          let bd = -2;
          for (const cell of geo.cells) {
            if (!cell.node) continue;
            const d = dot3(cell.n, objDir);
            if (d > bd) {
              bd = d;
              best = cell;
            }
          }
          const nv = objToView(best.n, cy, sy, cp, sp);
          beams.push({
            from: [nv[0] * R, nv[1] * R, nv[2] * R],
            to: threatAt(th, u),
            a: Math.sin(Math.PI * bu),
          });
        }
      }

      // riak setelah dinetralkan
      const hitAge = age - th.dur;
      if (hitAge >= 0 && hitAge < 82) {
        impacts.push({
          objDir: viewToObj(th.dir, cy, sy, cp, sp),
          age: hitAge,
          power: th.kind === 1 ? 1 : 0.55,
          kind: th.kind,
        });
      }
    }

    /* ---------- sel perisai ---------- */
    const scanY = Math.sin(2 * Math.PI * ((t / DUR) * 3) - Math.PI / 2); // -1..1
    type Draw = {z: number; f: () => void};
    const list: Draw[] = [];

    for (let ci = 0; ci < geo.cells.length; ci++) {
      const cell = geo.cells[ci];
      const nv = objToView(cell.n, cy, sy, cp, sp);
      const front = nv[2] > 0;
      const fres = Math.pow(1 - Math.abs(nv[2]), 2.3);

      // aktivitas: riak benturan
      let act = 0;
      let hot = 0;
      for (const im of impacts) {
        const d = Math.acos(Math.max(-1, Math.min(1, dot3(cell.n, im.objDir))));
        const w = im.age / 60; // kecepatan riak (rad)
        const g = Math.exp(-Math.pow((d - w * 1.9) / 0.19, 2));
        const decay = Math.max(0, 1 - im.age / 82);
        act = Math.max(act, g * decay * im.power);
        if (im.kind === 1 && d < 0.16) {
          hot = Math.max(hot, Math.max(0, 1 - im.age / 26));
        }
      }

      // kedip halus per-sel (grup ber-hash, bukan modulo indeks)
      const shim = noise3D(
        'sh',
        Math.cos(ang) * 14,
        Math.sin(ang) * 14,
        cell.sd * 0.09 + cell.grp
      );
      // pita pemindai lintang
      const band = Math.exp(-Math.pow((cell.n[1] - scanY) / 0.1, 2));

      const pts = cell.poly.map((p) =>
        proj(objToView([p[0] * R, p[1] * R, p[2] * R] as V3, cy, sy, cp, sp))
      );

      const base = front ? 1 : 0.3;
      const lit = act * 1.45 + hot * 2.2 + band * 0.34 + esc * 0.1;
      const fillA =
        (0.02 + 0.055 * fres + 0.026 * (0.5 + 0.5 * shim)) * base + lit * 0.42;
      const strokeA = (0.235 + 0.46 * fres) * base + lit * 0.72;

      const col =
        hot > 0.04
          ? `rgba(255,${Math.round(70 + 170 * hot)},${Math.round(45 + 150 * hot)},`
          : act > 0.06
          ? `rgba(${Math.round(160 - 60 * act)},250,255,`
          : `rgba(34,211,238,`;

      list.push({
        z: nv[2],
        f: () => {
          c.beginPath();
          c.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
          c.closePath();
          c.fillStyle = col + Math.min(0.95, fillA).toFixed(3) + ')';
          c.fill();
          c.lineWidth = front ? 1.25 + lit * 2.2 : 0.9;
          c.strokeStyle = col + Math.min(1, strokeA).toFixed(3) + ')';
          c.stroke();
          if (cell.node && front) {
            const p = proj(objToView([cell.n[0] * R, cell.n[1] * R, cell.n[2] * R] as V3, cy, sy, cp, sp));
            const np = 0.5 + 0.5 * Math.sin(2 * Math.PI * ((t / DUR) * 12) + cell.sd);
            c.globalAlpha = (0.5 + 0.5 * np) * (0.45 + 0.55 * Math.max(0, nv[2]));
            c.fillStyle = CYAN_HI;
            c.beginPath();
            c.arc(p[0], p[1], 2.6 + np * 1.6, 0, 6.2832);
            c.fill();
            c.globalAlpha = 0.32 * (0.4 + 0.6 * np);
            c.strokeStyle = CYAN;
            c.lineWidth = 1.2;
            c.beginPath();
            c.arc(p[0], p[1], 9 + np * 5, 0, 6.2832);
            c.stroke();
            c.globalAlpha = 1;
          }
        },
      });
    }
    list.sort((a, b) => a.z - b.z);

    // sel belakang
    c.globalCompositeOperation = 'lighter';
    let i = 0;
    for (; i < list.length && list[i].z <= 0; i++) list[i].f();

    /* ---------- inti AI ---------- */
    const pulse =
      0.5 - 0.5 * Math.cos(2 * Math.PI * ((t / DUR) * 8));
    const fire = beams.length ? 1 : 0;
    const coreR = 62 + pulse * 6 + fire * 8;

    const cg = c.createRadialGradient(CX, CYS, 2, CX, CYS, coreR * 2.0);
    cg.addColorStop(0, 'rgba(240,254,255,1)');
    cg.addColorStop(0.1, 'rgba(190,248,255,0.72)');
    cg.addColorStop(0.3, 'rgba(34,211,238,0.26)');
    cg.addColorStop(0.62, 'rgba(20,140,175,0.09)');
    cg.addColorStop(1, 'rgba(14,116,144,0)');
    c.fillStyle = cg;
    c.beginPath();
    c.arc(CX, CYS, coreR * 2.0, 0, 6.2832);
    c.fill();

    // kandang ikosahedral inti
    c.strokeStyle = 'rgba(165,243,252,0.5)';
    c.lineWidth = 1.4;
    for (const [a, b] of geo.cage) {
      const av = proj(objToView([a[0] * 132, a[1] * 132, a[2] * 132] as V3, cy, sy, cp, sp));
      const bv = proj(objToView([b[0] * 132, b[1] * 132, b[2] * 132] as V3, cy, sy, cp, sp));
      c.globalAlpha = 0.42 + 0.4 * pulse;
      c.beginPath();
      c.moveTo(av[0], av[1]);
      c.lineTo(bv[0], bv[1]);
      c.stroke();
    }
    c.globalAlpha = 1;

    // cincin orbit inti
    for (let k = 0; k < 3; k++) {
      const tilt = 0.5 + k * 0.72;
      const rr = 176 + k * 30;
      c.beginPath();
      for (let s = 0; s <= 72; s++) {
        const a = (s / 72) * Math.PI * 2;
        const p: V3 = [
          Math.cos(a) * rr,
          Math.sin(a) * rr * Math.sin(tilt),
          Math.sin(a) * rr * Math.cos(tilt),
        ];
        const q = proj(objToView(p, cy, sy, cp, sp));
        if (s === 0) c.moveTo(q[0], q[1]);
        else c.lineTo(q[0], q[1]);
      }
      c.globalAlpha = 0.42;
      c.strokeStyle = k === 1 ? CYAN_HI : CYAN;
      c.lineWidth = 1.5;
      c.stroke();
      // paket data mengorbit
      const pa = 2 * Math.PI * ((t / DUR) * (4 + k) + k * 0.31);
      const pp: V3 = [
        Math.cos(pa) * rr,
        Math.sin(pa) * rr * Math.sin(tilt),
        Math.sin(pa) * rr * Math.cos(tilt),
      ];
      const pq = proj(objToView(pp, cy, sy, cp, sp));
      c.globalAlpha = 0.95;
      c.fillStyle = CYAN_HI;
      c.beginPath();
      c.arc(pq[0], pq[1], 3.4, 0, 6.2832);
      c.fill();
    }
    c.globalAlpha = 1;

    /* ---------- komet ancaman ---------- */
    for (const cm of comets) {
      const TR = 26;
      const pts: [number, number, number][] = [];
      for (let s = 0; s < TR; s++) {
        const uu = Math.max(0, cm.life - s * 0.016);
        pts.push(proj(objToView(threatAt(cm.th, uu), cy, sy, cp, sp)));
      }
      const fade = Math.min(1, cm.life * 9) * Math.min(1, (1 - cm.life) * 12 + 0.4);
      // tiga lapis stroke = glow tanpa filter
      // ekor meruncing: gradien sepanjang tali busur kepala → ujung
      const passes: [number, string, number][] = [
        [26, '255,51,36', 0.09],
        [11, '255,70,44', 0.3],
        [4.4, '255,132,96', 0.72],
        [1.7, '255,238,232', 1],
      ];
      for (const [lw, rgb, a0] of passes) {
        const gr = c.createLinearGradient(
          pts[0][0], pts[0][1], pts[TR - 1][0], pts[TR - 1][1]
        );
        gr.addColorStop(0, `rgba(${rgb},${a0})`);
        gr.addColorStop(0.34, `rgba(${rgb},${(a0 * 0.6).toFixed(3)})`);
        gr.addColorStop(1, `rgba(${rgb},0)`);
        c.beginPath();
        c.moveTo(pts[0][0], pts[0][1]);
        for (let s = 1; s < TR; s++) c.lineTo(pts[s][0], pts[s][1]);
        c.strokeStyle = gr;
        c.lineWidth = lw;
        c.globalAlpha = fade;
        c.lineCap = 'round';
        c.stroke();
      }
      // kepala
      const hr = 30 + 20 * cm.life;
      const hg = c.createRadialGradient(pts[0][0], pts[0][1], 0, pts[0][0], pts[0][1], hr);
      hg.addColorStop(0, 'rgba(255,250,246,1)');
      hg.addColorStop(0.16, 'rgba(255,140,96,0.7)');
      hg.addColorStop(0.42, 'rgba(255,60,36,0.32)');
      hg.addColorStop(1, 'rgba(255,40,20,0)');
      c.fillStyle = hg;
      c.globalAlpha = fade;
      c.beginPath();
      c.arc(pts[0][0], pts[0][1], hr, 0, 6.2832);
      c.fill();
      c.globalAlpha = 1;
    }

    /* ---------- beam intersepsi ---------- */
    for (const b of beams) {
      const a = proj(b.from);
      const z = proj(b.to);
      const passes: [number, string][] = [
        [30, 'rgba(34,211,238,0.12)'],
        [12, 'rgba(34,211,238,0.34)'],
        [5, 'rgba(103,232,249,0.7)'],
        [1.9, 'rgba(240,254,255,1)'],
      ];
      for (const [lw, col] of passes) {
        c.beginPath();
        c.moveTo(a[0], a[1]);
        c.lineTo(z[0], z[1]);
        c.strokeStyle = col;
        c.lineWidth = lw;
        c.globalAlpha = b.a;
        c.lineCap = 'round';
        c.stroke();
      }
      c.globalAlpha = 1;
    }

    /* ---------- ledakan netralisasi ---------- */
    for (const im of impacts) {
      if (im.age > 26) continue;
      const vv = objToView(im.objDir, cy, sy, cp, sp);
      const rr = im.kind === 0 ? 1.42 : 1.0;
      const p = proj([vv[0] * rr * R, vv[1] * rr * R, vv[2] * rr * R] as V3);
      const u = im.age / 26;
      const rad = 14 + u * 118;
      c.globalAlpha = Math.pow(1 - u, 2.5);
      c.strokeStyle = im.kind === 1 ? 'rgba(255,132,74,1)' : 'rgba(103,232,249,1)';
      c.lineWidth = 6 * (1 - u) + 0.8;
      c.beginPath();
      c.arc(p[0], p[1], rad, 0, 6.2832);
      c.stroke();
      const fg = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad * 0.9);
      fg.addColorStop(0, im.kind === 1 ? 'rgba(255,228,210,1)' : 'rgba(214,252,255,1)');
      fg.addColorStop(0.34, im.kind === 1 ? 'rgba(255,110,60,0.5)' : 'rgba(34,211,238,0.5)');
      fg.addColorStop(1, 'rgba(34,211,238,0)');
      c.fillStyle = fg;
      c.beginPath();
      c.arc(p[0], p[1], rad * 0.9, 0, 6.2832);
      c.fill();
      c.globalAlpha = 1;
    }

    // sel depan
    for (; i < list.length; i++) list[i].f();
    c.globalCompositeOperation = 'source-over';

    /* ---------- vignette ---------- */
    const vg = c.createRadialGradient(CX, CYS, 320, CX, CYS, 1180);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.78)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);

    /* ---------- bloom ---------- */
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
          filter: 'blur(13px)',
          mixBlendMode: 'screen',
          opacity: 0.5 + esc * 0.16,
        }}
      />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════ HUD */

const PHASES = [
  {t0: 0, t1: 4.6, label: 'MONITORING PERIMETER', code: 'IDLE 0x00', col: CYAN},
  {t0: 4.6, t1: 11.0, label: 'INBOUND THREATS DETECTED', code: 'ALERT 0x2C', col: AMBER},
  {t0: 11.0, t1: 18.6, label: 'MASS INTRUSION · AUTO-MITIGATION', code: 'DEFEND 0x9F', col: RED},
  {t0: 18.6, t1: 23.4, label: 'ALL THREATS NEUTRALIZED', code: 'CLEAR 0x01', col: '#3fd18a'},
  {t0: 23.4, t1: 26.0, label: 'MONITORING PERIMETER', code: 'IDLE 0x00', col: CYAN},
];

const Rail: React.FC<{x: number; y: number; w: number; h: number; title: string; anchor: 'start' | 'end'}> = ({
  x, y, w, h, title, anchor,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#02070e" opacity={0.66} />
    <rect x={anchor === 'start' ? x : x + w - 3} y={y} width={3} height={h} fill={CYAN} opacity={0.55} />
    <rect x={x} y={y} width={w} height={1.4} fill={CYAN} opacity={0.45} />
    <text
      x={anchor === 'start' ? x + 20 : x + w - 20}
      y={y + 29}
      textAnchor={anchor}
      fontSize={14}
      fill={CYAN}
      letterSpacing={4}
    >
      {title}
    </text>
    <line x1={x + 20} y1={y + 40} x2={x + w - 20} y2={y + 40} stroke={CYAN} strokeWidth={1} opacity={0.2} />
  </g>
);

const Hud: React.FC<{F: number; t: number; esc: number; clear: number}> = ({F, t, esc, clear}) => {
  const ang = 2 * Math.PI * (t / DUR);
  const keep = 1 - clear;

  let pi = PHASES.findIndex((p) => t >= p.t0 && t < p.t1);
  if (pi < 0) pi = PHASES.length - 1;
  const ph = PHASES[pi];
  const phIn = pi === 0 ? 1 : Math.min(1, (t - ph.t0) / 0.4);
  const phOut = pi === PHASES.length - 1 ? 1 : Math.min(1, (ph.t1 - t) / 0.4);
  const phOp = Math.min(phIn, phOut);

  // event yang sudah dinetralkan
  const done = THREATS.filter((th) => F >= th.t0 + th.dur);
  const blocked = Math.round(done.length * keep);
  const inFlight = THREATS.filter((th) => F >= th.t0 && F < th.t0 + th.dur).length;
  const log = done.slice(-6).reverse();

  const wob = (k: number, amp: number) =>
    amp * noise3D('wb', Math.cos(ang) * 34, Math.sin(ang) * 34, k * 17);
  const conf = (97.4 + 2.2 * (0.5 - 0.5 * Math.cos(2 * ang)) + wob(1, 0.35)).toFixed(1);
  const thru = (18.4 + 26 * esc + wob(2, 2.4)).toFixed(1);

  const bars = useMemo(
    () => Array.from({length: 26}, (_, i) => ({sd: random('hb' + i) * 100})),
    []
  );

  return (
    <g fontFamily={MONO}>
      {/* judul tengah atas */}
      <g textAnchor="middle">
        <text x={CX} y={88} fontFamily={TITLE} fontSize={38} fill="#eafcff" letterSpacing={13}>
          AI FIREWALL
        </text>
        <text x={CX} y={121} fontSize={16} fill={CYAN} letterSpacing={7.5}>
          REAL-TIME THREAT NEUTRALIZATION
        </text>
        <line x1={CX - 560} y1={78} x2={CX - 250} y2={78} stroke={CYAN} strokeWidth={1.2} opacity={0.4} />
        <line x1={CX + 250} y1={78} x2={CX + 560} y2={78} stroke={CYAN} strokeWidth={1.2} opacity={0.4} />
        <path d={`M${CX - 240},78 L${CX - 252},70 L${CX - 252},86 Z`} fill={CYAN} opacity={0.6} />
        <path d={`M${CX + 240},78 L${CX + 252},70 L${CX + 252},86 Z`} fill={CYAN} opacity={0.6} />
      </g>

      <text x={84} y={80} fontSize={15} fill="#8ea6b6" letterSpacing={3}>
        NODE FW-CORE-02
      </text>
      <text x={84} y={104} fontSize={15} fill="#8ea6b6" letterSpacing={3}>
        REGION AP-SOUTHEAST
      </text>
      <g textAnchor="end">
        <text x={W - 84} y={80} fontFamily={TITLE} fontSize={20} fill={ph.col} letterSpacing={4}>
          {ph.code}
        </text>
        <text x={W - 84} y={106} fontSize={15} fill="#8ea6b6" letterSpacing={3}>
          MODEL SENTINEL-7 · INFERENCE ON
        </text>
      </g>

      {/* rail kiri — telemetri */}
      <Rail x={84} y={318} w={392} h={318} title="DEFENSE TELEMETRY" anchor="start" />
      <g transform="translate(104,318)">
        {[
          ['THREATS BLOCKED', `${blocked}`, Math.min(1, blocked / 35)],
          ['ACTIVE INBOUND', `${inFlight}`, Math.min(1, inFlight / 6)],
          ['THROUGHPUT', `${thru} Gb/s`, Math.min(1, Number(thru) / 46)],
          ['MODEL CONFIDENCE', `${conf}%`, Number(conf) / 100],
          ['MITIGATION LATENCY', `${(0.8 + 1.9 * esc + wob(3, 0.22)).toFixed(2)} ms`, 0.2 + esc * 0.7],
        ].map(([lab, val, v], i) => (
          <g key={i} transform={`translate(0,${76 + i * 50})`}>
            <text fontSize={14} fill="#9fb3c2" letterSpacing={2.4}>
              {lab as string}
            </text>
            <text x={352} y={-1} fontSize={20} fill="#eafcff" letterSpacing={1.4} textAnchor="end">
              {val as string}
            </text>
            <rect y={9} width={352} height={4} fill="#0d2430" />
            <rect y={9} width={352 * Math.max(0.02, Math.min(1, v as number))} height={4} fill={i === 0 ? CYAN : CYAN_DIM} />
          </g>
        ))}
      </g>

      {/* rail kanan — log intersepsi */}
      <Rail x={W - 476} y={318} w={392} h={318} title="INTERCEPT LOG" anchor="end" />
      {(log.length === 0 || keep < 0.15) && (
        <g transform={`translate(${W - 456},318)`}>
          <text y={78} fontSize={14} fill="#5d7382" letterSpacing={3}>
            AWAITING EVENTS
          </text>
          <text y={104} fontSize={13} fill="#41535f" letterSpacing={2.2}>
            PERIMETER CLEAN · 0 ACTIVE INCIDENTS
          </text>
        </g>
      )}
      <g transform={`translate(${W - 456},318)`} opacity={keep}>
        {log.map((th, i) => {
          const age = F - (th.t0 + th.dur);
          const fresh = Math.max(0, 1 - age / 40);
          return (
            <g key={th.t0} transform={`translate(0,${74 + i * 40})`}>
              <rect x={-4} y={-17} width={360} height={30} fill={CYAN} opacity={0.09 * fresh} />
              <text fontSize={14} fill={th.kind === 1 ? '#ff9d86' : CYAN_HI} letterSpacing={1.6}>
                {th.kind === 1 ? 'SHIELD BLOCK' : 'INTERCEPTED'}
              </text>
              <text x={352} fontSize={14} fill="#9fb3c2" letterSpacing={1.2} textAnchor="end">
                {th.ip}
              </text>
              <text y={17} fontSize={13} fill="#7d93a3" letterSpacing={1.8}>
                {th.vec}
              </text>
              <text x={352} y={17} fontSize={13} fill="#3fd18a" letterSpacing={1.8} textAnchor="end">
                NEUTRALIZED
              </text>
            </g>
          );
        })}
      </g>

      {/* cincin HUD sekitar bola */}
      <g transform={`translate(${CX},${CYS})`} opacity={0.6 + esc * 0.3}>
        <g transform={`rotate(${(t / DUR) * 360})`}>
          {Array.from({length: 120}).map((_, i) => {
            const a = (i / 120) * 360;
            if (!((a > 128 && a < 232) || a > 308 || a < 52)) return null;
            const rad = (a * Math.PI) / 180;
            const big = i % 10 === 0;
            const r0 = 404;
            const l = big ? 18 : 7;
            return (
              <line
                key={i}
                x1={Math.cos(rad) * r0}
                y1={Math.sin(rad) * r0}
                x2={Math.cos(rad) * (r0 + l)}
                y2={Math.sin(rad) * (r0 + l)}
                stroke={big ? CYAN_HI : CYAN}
                strokeWidth={big ? 2.6 : 1.3}
              />
            );
          })}
        </g>
        <g transform={`rotate(${-(t / DUR) * 360 * 2})`} opacity={0.5}>
          <path
            d={`M${440 * Math.cos(-0.9)},${440 * Math.sin(-0.9)} A440,440 0 0 1 ${440 * Math.cos(0.5)},${440 * Math.sin(0.5)}`}
            stroke={CYAN}
            strokeWidth={2.2}
            fill="none"
            strokeDasharray="26 9 5 9"
          />
          <path
            d={`M${440 * Math.cos(2.24)},${440 * Math.sin(2.24)} A440,440 0 0 1 ${440 * Math.cos(3.64)},${440 * Math.sin(3.64)}`}
            stroke={CYAN}
            strokeWidth={2.2}
            fill="none"
            strokeDasharray="26 9 5 9"
          />
        </g>
      </g>

      {/* status band */}
      <g opacity={phOp}>
        <rect x={0} y={H - 112} width={W} height={86} fill="#02070e" opacity={0.66} />
        <rect x={0} y={H - 112} width={W} height={2} fill={ph.col} opacity={0.5} />
        <rect x={0} y={H - 112} width={W * Math.max(0.04, esc)} height={2} fill={ph.col} />
        <g transform={`translate(${CX},${H - 70})`} textAnchor="middle">
          <text fontFamily={TITLE} fontSize={31} fill={ph.col} letterSpacing={8}>
            {ph.label}
          </text>
          <text y={30} fontSize={14} fill="#7d93a3" letterSpacing={4}>
            {`SHIELD INTEGRITY ${(100 - 6 * esc).toFixed(1)}% · ${642} CELLS ACTIVE · POLICY AUTO-ADAPTIVE · SESSION 0x${(
              4096 + Math.round((0.5 - 0.5 * Math.cos(2 * ang)) * 61000)
            )
              .toString(16)
              .toUpperCase()}`}
          </text>
        </g>
        <g transform={`translate(56,${H - 64})`}>
          {bars.map((b, i) => {
            const n = noise3D('bar', Math.cos(ang) * 28, Math.sin(ang) * 28, b.sd * 0.4);
            const h = 3 + (0.5 + 0.5 * n) * (8 + esc * 24);
            return <rect key={i} x={i * 11} y={-h / 2} width={5} height={h} fill={i % 6 === 0 ? CYAN_HI : CYAN_DIM} />;
          })}
        </g>
        <g transform={`translate(${W - 56},${H - 64})`}>
          {bars.map((b, i) => {
            const n = noise3D('bar', Math.cos(ang) * 28, Math.sin(ang) * 28, b.sd * 0.4 + 9);
            const h = 3 + (0.5 + 0.5 * n) * (8 + esc * 24);
            return <rect key={i} x={-i * 11 - 5} y={-h / 2} width={5} height={h} fill={i % 6 === 0 ? CYAN_HI : CYAN_DIM} />;
          })}
        </g>
      </g>
    </g>
  );
};

/* ══════════════════════════════════════════════════════════ MAIN */

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  useEmbeddedFonts();

  const F = ((frame % DUR_F) + DUR_F) % DUR_F;
  const t = F / fps;

  const esc = interpolate(
    t,
    [0, 3.2, 7.4, 11.6, 18.2, 21.4, 24.2, 26],
    [0.1, 0.1, 0.5, 1, 1, 0.42, 0.1, 0.1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  // clear: mengembalikan seluruh readout ke NOL sebelum seam
  const clear = interpolate(t, [23.6, 25.0], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{background: '#02050b', overflow: 'hidden'}}>
      <Scene F={F} t={t} esc={esc} clear={clear} />

      {/* scrim atas & bawah */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, rgba(2,5,11,0.82) 0%, rgba(2,5,11,0.36) 11%, rgba(2,5,11,0) 21%, rgba(2,5,11,0) 66%, rgba(2,5,11,0.4) 84%, rgba(2,5,11,0.84) 100%)',
        }}
      />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <Hud F={F} t={t} esc={esc} clear={clear} />
      </svg>

      {/* scanline halus */}
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 4px)',
          opacity: 0.34,
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
