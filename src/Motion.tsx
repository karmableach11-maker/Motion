/* eslint-disable */
/**
 * Motion27 — "CRITICAL SYSTEM BREACH · CYBER THREAT ALERT"
 * 1920x1080 · 60 fps · 1440 frames (24 s) · PERFECT LOOP
 *
 * Struktur:
 *   - Code wall 4 bidang paralaks (Canvas2D) yang scroll KE ATAS + flicker per-baris
 *   - Glitch engine: pita displacement, smear, static strip, chroma ghost
 *   - Hero: segitiga peringatan neon + HUD ring parsial + retikel
 *   - HUD telemetri + narasi 5 fase yang kembali ke keadaan awal di seam
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
import {noise2D, noise3D} from '@remotion/noise';

/* ═══════════════════════════════════════════════════════════ FONT */

const FONT_CSS = `
@font-face{font-family:'MxMono27';src:url(data:font/woff2;base64,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) format('woff2');font-weight:400;font-style:normal;font-display:block;}
@font-face{font-family:'MxTitle27';src:url(data:font/woff2;base64,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) format('woff2');font-weight:700;font-style:normal;font-display:block;}
`;

let fontsPromise: Promise<unknown> | null = null;
const ensureFonts = () => {
  if (fontsPromise) return fontsPromise;
  const st = document.createElement('style');
  st.textContent = FONT_CSS;
  document.head.appendChild(st);
  fontsPromise = Promise.all([
    (document as any).fonts.load("400 24px 'MxMono27'"),
    (document as any).fonts.load("700 24px 'MxTitle27'"),
  ]).catch(() => null);
  return fontsPromise;
};

const useEmbeddedFonts = () => {
  const [handle] = useState(() => delayRender('fonts-motion27'));
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
const FPS = 60;
const DUR_F = 1440; // 24 s
const DUR = DUR_F / FPS;

const CX = W / 2;
const CY = H / 2 - 18;

const MONO = "'MxMono27', 'Courier New', monospace";
const TITLE = "'MxTitle27', 'MxMono27', sans-serif";

/* ═════════════════════════════════════════════════ TEKS KODE POOL */

const CODE_POOL = [
  'public InetAddress resolveHost(String h) throws UnknownHostException {',
  'if (!session.isAuthenticated()) throw new SecurityException("access denied");',
  'const cipher = crypto.createDecipheriv(algo, key, iv);',
  'while ((n = read(fd, buf, sizeof buf)) > 0) { checksum ^= buf[n - 1]; }',
  'kernel: [ 4412.008] audit(1712449021.442:88): avc denied { write }',
  'DROP TABLE session_tokens WHERE expires_at < NOW() - INTERVAL 7 DAY;',
  'static inline void __attribute__((noreturn)) panic(const char *msg)',
  'for (let i = 0; i < payload.length; i += BLOCK) { queue.push(payload.slice(i, i + BLOCK)); }',
  'ERROR  handshake aborted: peer closed connection (fatal alert 0x28)',
  'ssh_exchange_identification: read: Connection reset by peer',
  'memcpy(dst + offset, src, len);  /* bounds not verified */',
  'export async function rotateKeys(scope: KeyScope): Promise<void> {',
  'iptables -A INPUT -s 10.44.219.0/24 -p tcp --dport 22 -j DROP',
  'Traceback (most recent call last):  File "core/auth.py", line 218',
  'assert digest == expected, f"integrity mismatch on chunk {idx}"',
  'unsigned long addr = (unsigned long)vmalloc(PAGE_SIZE << order);',
  'WARN  tls: certificate signed by unknown authority (depth 2)',
  '0x7ffd4a2c  48 89 e5 41 57 41 56 49 89 d6 41 55 41 54 4c 8d',
  '0x7ffd4a3c  25 f2 9b 20 00 55 48 89 fd 48 83 ec 38 64 48 8b',
  'INFO   node[07] heartbeat lost · failover to replica-03 in 2400ms',
  'router.use("/v2/admin", requireRole("root"), auditTrail(), handler);',
  'if (rc != 0) { log_error("bind() failed: %s", strerror(errno)); goto out; }',
  'SELECT user_id, token_hash FROM credentials WHERE revoked = 0 LIMIT 500;',
  'char *tmp = malloc(n + 1); strcpy(tmp, input); /* CWE-120 */',
  'FATAL  segmentation fault at 0x00000000 rip=0x7f2a91c4b3e0',
  'const sig = hmac("sha256", secret).update(body).digest("hex");',
  'docker exec -it node-edge-14 /bin/sh -c "cat /proc/net/tcp"',
  'DEBUG  tls_handshake: cipher=TLS_AES_256_GCM_SHA384 resumed=false',
  'listener.on("data", (chunk) => stream.write(transform(chunk)));',
  '#define SECRET_LEN 32 /* do not expose beyond enclave boundary */',
  'ALERT  privilege escalation attempt uid=1000 -> uid=0 pid=48213',
  'return jwt.verify(token, publicKey, {algorithms: ["RS256"]});',
  'nmap -sS -p- --min-rate 5000 10.44.219.7 -oX /tmp/scan.xml',
  'BEGIN; UPDATE accounts SET locked = 1 WHERE failed_logins > 5; COMMIT;',
  'panic: runtime error: index out of range [512] with length 512',
  'let mut buf = vec![0u8; 4096]; stream.read_exact(&mut buf)?;',
  'INFO   firewall rule 0x1f applied · 14 packets dropped · 0 accepted',
  'exports.handler = async (event) => { return audit(event, context); };',
  'ntpd: time reset -0.412188s · clock skew exceeds tolerance',
  '0x00404018  e8 3c ff ff ff 89 45 fc 83 7d fc 00 74 0e 8b 45',
  'systemd[1]: session-4412.scope: Consumed 2min 41.008s CPU time.',
  'if (buffer.indexOf(MAGIC) !== 0) return reject(new Error("bad frame"));',
  'TRACE  ingress 172.19.0.4:51244 -> 10.44.219.7:443 · flags [S]',
  'openssl s_client -connect edge-07.internal:8443 -tls1_3 -showcerts',
  'struct sk_buff *skb = alloc_skb(len + hh_len, GFP_ATOMIC);',
  'CRITICAL  vault seal broken · 3 of 5 unseal keys presented',
  'await db.query("INSERT INTO audit_log(actor, action) VALUES ($1,$2)");',
  'go func() { defer wg.Done(); pipeline <- scan(host, ports) }()',
  'WARN   entropy pool depleted (12 bits) · blocking on /dev/random',
  'grep -rn "PRIVATE KEY" /var/backups --include=*.pem 2>/dev/null',
  'const enc = new TextEncoder().encode(JSON.stringify(manifest));',
  'ld.so: object "libcrypt.so.2" cannot be preloaded · ignored',
  'HTTP/1.1 401 Unauthorized · WWW-Authenticate: Bearer realm="core"',
  'if (chmod(path, 0600) < 0) syslog(LOG_ERR, "perm hardening failed");',
  'INFO   replica set primary stepped down · election term 4412',
  'pipeline.stage("decrypt").then(verify).catch(quarantine);',
  'kill -9 $(lsof -ti :8443) && systemctl restart edge-gateway',
  'DEBUG  mmap(NULL, 0x21000, PROT_READ|PROT_WRITE, MAP_ANON, -1, 0)',
  'raise IntegrityError(f"chain broken at block {height}: {digest[:16]}")',
  'ALERT  10.44.219.7 flagged · 4412 auth failures in 60s window',
  'const proof = await circuit.prove(witness, provingKey);',
  'tcpdump -i eth0 -nn "tcp[tcpflags] & (tcp-syn) != 0" -c 500',
  'FATAL  quorum lost · 2/5 nodes reachable · entering read-only mode',
  'byte[] nonce = new byte[12]; SecureRandom.getInstanceStrong().nextBytes(nonce);',
  'INFO   container edge-07 OOMKilled · restarting (attempt 3/5)',
  'if err := tls.Handshake(); err != nil { return wrap(err, "tls") }',
  'MASK   ****-****-****-4412 · tokenized · vault ref 0x9c2a',
  'sudo: pam_unix(sudo:auth): authentication failure; user=svc-deploy',
  'WARN   deprecated cipher suite negotiated · downgrade suspected',
  'flush_tlb_range(vma, start, end); /* invalidate stale mappings */',
];

const HEX = '0123456789abcdef';
const GLYPH_CORR = '▓▒░#@$%&*!?/\\|<>=+~^';

const mkHex = (s: string) => {
  const n = 3 + Math.floor(random(s + 'hl') * 6);
  let out =
    '0x' +
    Array.from({length: 8}, (_, i) =>
      HEX[Math.floor(random(s + 'a' + i) * 16)]
    ).join('') +
    ' ';
  for (let i = 0; i < n * 2; i++) {
    out +=
      HEX[Math.floor(random(s + 'b' + i) * 16)] +
      HEX[Math.floor(random(s + 'c' + i) * 16)] +
      ' ';
  }
  return out;
};

const mkIp = (s: string) =>
  `${10 + Math.floor(random(s + 'i1') * 3)}.${Math.floor(
    random(s + 'i2') * 255
  )}.${Math.floor(random(s + 'i3') * 255)}.${Math.floor(
    random(s + 'i4') * 254
  )}:${1024 + Math.floor(random(s + 'i5') * 60000)}`;

const pickText = (seed: string) => {
  const r = random(seed + 'pk');
  if (r < 0.14) return mkHex(seed);
  if (r < 0.2)
    return `${['GET', 'POST', 'HEAD', 'DELETE'][Math.floor(random(seed + 'm') * 4)]} /v2/${
      ['auth', 'keys', 'nodes', 'audit', 'stream'][Math.floor(random(seed + 'p') * 5)]
    } ← ${mkIp(seed)}`;
  return CODE_POOL[Math.floor(random(seed + 'q') * CODE_POOL.length)];
};

const corrupt = (txt: string, seed: string) => {
  const arr = txt.split('');
  const k = 3 + Math.floor(random(seed + 'ck') * 10);
  for (let i = 0; i < k; i++) {
    const p = Math.floor(random(seed + 'cp' + i) * arr.length);
    arr[p] = GLYPH_CORR[Math.floor(random(seed + 'cg' + i) * GLYPH_CORR.length)];
  }
  return arr.join('');
};

/* ══════════════════════════════════════════════════════════ PALET */

const INK = [
  '#7d8794', // gray dominant
  '#7d8794',
  '#9aa4b2',
  '#5c6675',
  '#3fd18a', // green
  '#2fc2d6', // cyan
  '#9b6cff', // violet
  '#4d7dff', // blue
  '#ff9a3c', // amber
  '#ff4d4d', // red
  '#c9d3e0',
];
const INK_W = [22, 18, 14, 16, 6, 5, 4, 4, 4, 4, 3];
const INK_CUM: number[] = [];
(() => {
  let s = 0;
  for (const w of INK_W) {
    s += w;
    INK_CUM.push(s);
  }
})();
const TOT_W = INK_CUM[INK_CUM.length - 1];
const pickInk = (r: number) => {
  const x = r * TOT_W;
  for (let i = 0; i < INK_CUM.length; i++) if (x < INK_CUM[i]) return INK[i];
  return INK[0];
};

/* ═════════════════════════════════════════════════════ PLANE SPEC */

type PlaneSpec = {
  fs: number;
  lh: number;
  rows: number;
  cycles: number;
  alpha: number;
  blur: number;
  segs: number;
  scale: number;
  /** kedalaman kedip: 1 = padam total, 0 = tenang. Bidang jauh berkedip
   *  keras (churn data), bidang besar tetap tenang supaya tetap terbaca. */
  flick: number;
};

const PLANES: PlaneSpec[] = [
  {fs: 8.5, lh: 10.8, rows: 108, cycles: 1, alpha: 0.66, blur: 0.8, segs: 6, scale: 0, flick: 1},
  {fs: 12, lh: 15.4, rows: 76, cycles: 1, alpha: 0.9, blur: 0, segs: 6, scale: 0.006, flick: 0.9},
  {fs: 15.5, lh: 20, rows: 58, cycles: 2, alpha: 1, blur: 0, segs: 5, scale: 0.012, flick: 0.62},
  {fs: 21, lh: 27, rows: 44, cycles: 3, alpha: 1, blur: 0, segs: 4, scale: 0.02, flick: 0.3},
  {fs: 33, lh: 42, rows: 28, cycles: 4, alpha: 0.26, blur: 5.5, segs: 2, scale: 0.034, flick: 0.2},
];

type Line = {
  p: number;
  row: number;
  x: number;
  text: string;
  bad: string;
  ink: string;
  a: number;
  sd: number;
  grp: number;
  fq: number;
};

const buildLines = (): {lines: Line[]; corr: number[]; speed: number[]} => {
  const lines: Line[] = [];
  const corr: number[] = [];
  const speed: number[] = [];
  PLANES.forEach((sp, p) => {
    const C = sp.rows * sp.lh;
    corr.push(C);
    speed.push((C * sp.cycles) / DUR);
    const colN = 5 + p;
    for (let r = 0; r < sp.rows; r++) {
      const segs = 2 + Math.floor(random(`sg${p}-${r}`) * (sp.segs - 1));
      for (let s = 0; s < segs; s++) {
        const sd = `${p}-${r}-${s}`;
        const col = Math.floor(random(sd + 'co') * colN);
        const x =
          (col / colN) * (W + 620) -
          330 +
          random(sd + 'jx') * (W / colN) * 0.7;
        const txt = pickText(sd);
        lines.push({
          p,
          row: r,
          x: Math.round(x),
          text: txt,
          bad: corrupt(txt, sd),
          ink: pickInk(random(sd + 'ik')),
          a: 0.66 + random(sd + 'al') * 0.6,
          sd: random(sd + 'sd') * 900,
          grp: Math.floor(random(sd + 'gp') * 9),
          fq: 60 + random(sd + 'fq') * 210,
        });
      }
    }
  });
  return {lines, corr, speed};
};

/* ══════════════════════════════════════════════════════ GLITCH */

type Burst = {f: number; d: number; p: number};
const BURSTS: Burst[] = [
  {f: 36, d: 12, p: 0.35},
  {f: 118, d: 20, p: 0.62},
  {f: 190, d: 9, p: 0.28},
  {f: 268, d: 26, p: 0.8},
  {f: 340, d: 11, p: 0.34},
  {f: 402, d: 18, p: 0.55},
  {f: 470, d: 30, p: 0.94},
  {f: 545, d: 10, p: 0.3},
  {f: 604, d: 22, p: 0.7},
  {f: 660, d: 14, p: 0.45},
  {f: 712, d: 34, p: 1.0},
  {f: 790, d: 12, p: 0.4},
  {f: 846, d: 24, p: 0.78},
  {f: 910, d: 16, p: 0.52},
  {f: 968, d: 30, p: 0.95},
  {f: 1044, d: 12, p: 0.36},
  {f: 1102, d: 20, p: 0.6},
  {f: 1178, d: 14, p: 0.42},
  {f: 1252, d: 10, p: 0.3},
  {f: 1330, d: 8, p: 0.22},
  {f: 1392, d: 9, p: 0.18},
];

type GlitchState = {
  p: number;
  step: number;
  bi: number;
  bands: {y: number; h: number; dx: number; kind: number}[];
};

const computeGlitch = (F: number, esc: number): GlitchState => {
  let p = 0;
  let bi = -1;
  for (let i = 0; i < BURSTS.length; i++) {
    const b = BURSTS[i];
    if (F >= b.f && F < b.f + b.d) {
      const x = (F - b.f) / b.d;
      const env = Math.pow(1 - x, 1.35) * Math.min(1, x / 0.1 + 0.15);
      const v = b.p * env * (0.55 + 0.45 * esc);
      if (v > p) {
        p = v;
        bi = i;
      }
    }
  }
  const step = Math.floor(F / 2);
  const bands: GlitchState['bands'] = [];
  // micro-glitch ambient — referensi tidak pernah benar-benar bersih
  const na = 1 + Math.floor(random(`am${step}`) * 3);
  for (let i = 0; i < na; i++) {
    const sd = `amb${i}-${step}`;
    const h = 2 + random(sd + 'h') * 12;
    bands.push({
      y: random(sd + 'y') * (H - h),
      h,
      dx: (random(sd + 'x') - 0.5) * (18 + esc * 46),
      kind: random(sd + 'k') < 0.3 ? 1 : 0,
    });
  }
  if (p > 0.03) {
    const n = 2 + Math.floor(p * 13);
    for (let i = 0; i < n; i++) {
      const sd = `b${bi}-${i}-${step}`;
      const h = 6 + random(sd + 'h') * (26 + p * 150);
      const y = random(sd + 'y') * (H - h);
      const dx =
        (random(sd + 'x') - 0.5) * (60 + p * 620) * (random(sd + 'z') < 0.5 ? 1 : 0.25);
      const kind = random(sd + 'k') < 0.24 + p * 0.2 ? 1 : 0;
      bands.push({y, h, dx, kind});
    }
  }
  return {p, step, bi, bands};
};

/* ═════════════════════════════════════════════════════ CODE WALL */

const CodeWall: React.FC<{
  t: number;
  esc: number;
  g: GlitchState;
  ready: boolean;
}> = ({t, esc, g, ready}) => {
  const out = useRef<HTMLCanvasElement | null>(null);
  const bloom = useRef<HTMLCanvasElement | null>(null);
  const scratch = useRef<HTMLCanvasElement | null>(null);
  const tmp = useRef<HTMLCanvasElement | null>(null);
  const stat = useRef<HTMLCanvasElement | null>(null);

  const geo = useMemo(buildLines, []);

  if (typeof document !== 'undefined') {
    if (!scratch.current) {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      scratch.current = c;
    }
    if (!tmp.current) {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      tmp.current = c;
    }
    if (!stat.current) {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = 192;
      const cx = c.getContext('2d')!;
      const im = cx.createImageData(W, 192);
      let seed = 0x9e3779b9;
      for (let i = 0; i < W * 192; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const v = (seed >>> 24) * 0.86 + 18;
        const j = i * 4;
        im.data[j] = v;
        im.data[j + 1] = v;
        im.data[j + 2] = v;
        im.data[j + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      stat.current = c;
    }
  }

  useLayoutEffect(() => {
    const oc = out.current;
    const sc = scratch.current;
    const tc = tmp.current;
    if (!oc || !sc || !tc) return;
    const sx = sc.getContext('2d', {alpha: false})!;
    const ox = oc.getContext('2d', {alpha: false})!;
    const tx = tc.getContext('2d')!;

    /* ---------- 1. gambar code wall ke scratch ---------- */
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.filter = 'none';
    sx.globalAlpha = 1;
    sx.globalCompositeOperation = 'source-over';
    sx.fillStyle = '#05070c';
    sx.fillRect(0, 0, W, H);

    const ang = 2 * Math.PI * (t / DUR);
    const hot = g.bands.filter((b) => b.kind === 1);

    for (let p = 0; p < PLANES.length; p++) {
      const sp = PLANES[p];
      const C = geo.corr[p];
      const spd = geo.speed[p];
      const zoom = 1 + sp.scale * (0.5 - 0.5 * Math.cos(ang));
      // Bidang ber-blur digambar ke canvas terpisah lalu di-composite SEKALI
      // dengan filter. Memasang ctx.filter per fillText = ratusan pass blur.
      const dx = sp.blur > 0 ? tx : sx;
      if (sp.blur > 0) {
        tx.setTransform(1, 0, 0, 1, 0, 0);
        tx.clearRect(0, 0, W, H);
      }
      dx.setTransform(zoom, 0, 0, zoom, CX * (1 - zoom), CY * (1 - zoom));
      dx.filter = 'none';
      dx.font = `400 ${sp.fs}px ${MONO}`;
      dx.textBaseline = 'alphabetic';

      for (const ln of geo.lines) {
        if (ln.p !== p) continue;
        let y = ((ln.row * sp.lh - spd * t) % C + C) % C - sp.lh;
        if (y < -sp.lh * 1.2 || y > H + sp.lh) continue;

        // Kedip per-baris. Referensi terukur |Δframe| 23-58/255 → dinding
        // kodenya benar-benar berkedip cepat, bukan sekadar hanyut. Bidang
        // jauh dibuat padam-nyala penuh, bidang besar hanya bernapas.
        const fr = ln.fq;
        const n1 = noise3D(
          'flk',
          Math.cos(ang) * fr,
          Math.sin(ang) * fr,
          ln.sd * 0.011
        );
        const lo = 1 - sp.flick;
        let a = ln.a * sp.alpha * (lo + (1 - lo) * Math.max(0, Math.min(1, n1 * 1.55 + 0.62)));

        // korupsi karakter — laju tinggi supaya teks benar-benar berubah
        const n2 = noise3D(
          'cor',
          Math.cos(ang) * (fr * 0.8 + 40),
          Math.sin(ang) * (fr * 0.8 + 40),
          ln.sd * 0.007 + 40
        );
        const corThresh = 0.5 - esc * 0.3 - g.p * 0.22;
        const isCor = n2 > corThresh;

        let ink = ln.ink;
        if (isCor && n2 > corThresh + 0.26) {
          ink = n2 > corThresh + 0.34 ? '#ff2e2e' : '#28e6e6';
          a = Math.min(1, a * 1.8 + 0.18);
        }

        // pita panas glitch → baris jadi putih terang
        if (hot.length) {
          for (const b of hot) {
            if (y > b.y - 4 && y < b.y + b.h + 4) {
              ink = '#ffffff';
              a = Math.min(1, a * 2.4 + 0.45);
              break;
            }
          }
        }

        if (a < 0.04) continue;
        dx.globalAlpha = Math.min(1, a);
        dx.fillStyle = ink;
        dx.fillText(isCor ? ln.bad : ln.text, ln.x, y);
      }

      if (sp.blur > 0) {
        tx.setTransform(1, 0, 0, 1, 0, 0);
        tx.globalAlpha = 1;
        sx.setTransform(1, 0, 0, 1, 0, 0);
        sx.globalAlpha = 1;
        sx.filter = `blur(${sp.blur}px)`;
        sx.drawImage(tc, 0, 0);
        sx.filter = 'none';
      }
    }
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.filter = 'none';
    sx.globalAlpha = 1;

    /* ---------- 2. compose + glitch ke out ---------- */
    ox.setTransform(1, 0, 0, 1, 0, 0);
    ox.filter = 'none';
    ox.globalAlpha = 1;
    ox.globalCompositeOperation = 'source-over';
    ox.drawImage(sc, 0, 0);

    for (const b of g.bands) {
      const y = Math.round(b.y);
      const h = Math.round(b.h);
      const dx = Math.round(b.dx);
      // smear: satu baris piksel diregangkan setinggi pita
      ox.globalAlpha = 0.72;
      ox.drawImage(sc, 0, y, W, 1, 0, y, W, h);
      ox.globalAlpha = 1;
      // konten tergeser + wrap
      ox.drawImage(sc, 0, y, W, h, dx, y, W, h);
      if (dx > 0) ox.drawImage(sc, 0, y, W, h, dx - W, y, W, h);
      else if (dx < 0) ox.drawImage(sc, 0, y, W, h, dx + W, y, W, h);

      if (b.kind === 1 && stat.current) {
        ox.globalAlpha = 0.11 + g.p * 0.26;
        ox.globalCompositeOperation = 'lighter';
        ox.drawImage(stat.current, 0, y, W, Math.max(2, h));
        ox.globalCompositeOperation = 'source-over';
        ox.globalAlpha = 0.4 + g.p * 0.42;
        ox.fillStyle = '#e9f2ff';
        ox.fillRect(0, y + h - 1, W, 1);
        ox.globalAlpha = 1;
      }
    }

    // chroma ghost
    if (g.p > 0.12) {
      const off = 3 + g.p * 26;
      ox.globalCompositeOperation = 'lighter';
      ox.filter = 'saturate(6) hue-rotate(150deg) brightness(0.5)';
      ox.globalAlpha = 0.3 * g.p;
      ox.drawImage(sc, -off, 0);
      ox.filter = 'saturate(6) hue-rotate(-30deg) brightness(0.5)';
      ox.drawImage(sc, off, 0);
      ox.filter = 'none';
      ox.globalAlpha = 1;
      ox.globalCompositeOperation = 'source-over';
    }

    /* ---------- 3. bloom kecil ---------- */
    const bc = bloom.current;
    if (bc) {
      const bx = bc.getContext('2d', {alpha: false})!;
      bx.globalCompositeOperation = 'source-over';
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
          filter: 'blur(9px)',
          mixBlendMode: 'screen',
          opacity: 0.27 + esc * 0.14,
        }}
      />
    </>
  );
};

/* ══════════════════════════════════════════════════════════ HERO */

const roundedTri = (w: number, h: number, r: number) => {
  const pts: [number, number][] = [
    [0, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  let d = '';
  for (let i = 0; i < 3; i++) {
    const p0 = pts[(i + 2) % 3];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % 3];
    const v0 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l0 = Math.hypot(v0[0], v0[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const a = [p1[0] + (v0[0] / l0) * r, p1[1] + (v0[1] / l0) * r];
    const b = [p1[0] + (v2[0] / l2) * r, p1[1] + (v2[1] / l2) * r];
    d += (i === 0 ? `M${a[0].toFixed(2)},${a[1].toFixed(2)}` : `L${a[0].toFixed(2)},${a[1].toFixed(2)}`);
    d += ` Q${p1[0].toFixed(2)},${p1[1].toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
  }
  return d + 'Z';
};

const TRI_W = 566;
const TRI_H = 496;
const TRI_PATH = roundedTri(TRI_W, TRI_H, 46);
const TRI_PATH_IN = roundedTri(TRI_W - 74, TRI_H - 66, 36);
// batang seru: meruncing ke bawah, ujung membulat
const EXC_BAR =
  'M-11.5,-150 Q0,-158 11.5,-150 L7.2,54 Q0,60 -7.2,54 Z';

const arcPath = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [
    (r * Math.cos((a * Math.PI) / 180)).toFixed(2),
    (r * Math.sin((a * Math.PI) / 180)).toFixed(2),
  ];
  const s = p(a0);
  const e = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${s[0]},${s[1]} A${r},${r} 0 ${large} ${sweep} ${e[0]},${e[1]}`;
};

const Hero: React.FC<{
  t: number;
  esc: number;
  g: GlitchState;
  variant?: 'full' | 'lite' | 'bloom';
}> = ({t, esc, g, variant = 'full'}) => {
  const lite = variant !== 'full';
  const ang = 2 * Math.PI * (t / DUR);
  const pulse = 0.5 - 0.5 * Math.cos(2 * Math.PI * (t / DUR) * 8);
  const beat =
    Math.pow(0.5 - 0.5 * Math.cos(2 * Math.PI * (t / DUR) * 16), 3.2);
  const hb = 0.28 + 0.72 * (0.45 * pulse + 0.55 * beat);
  const intensity = 0.52 + 0.48 * esc;
  const core = 0.66 + 0.34 * intensity * hb + g.p * 0.34;

  const flick = 1 - g.p * 0.35 * (random(`tf${g.step}`) > 0.55 ? 1 : 0);

  // sapuan internal: fase periodik murni (12 lintasan / loop) → seam aman
  const sweepY = -TRI_H * 0.68 + (((t / DUR) * 12) % 1) * TRI_H * 1.36;
  const scanOff = (((t / DUR) * 34) % 1) * 19;

  const spokes = useMemo(() => {
    const a: {a: number; sd: number}[] = [];
    for (let i = 0; i < 72; i++) a.push({a: (i / 72) * 360, sd: random('sp' + i) * 100});
    return a;
  }, []);

  const gaugeSpan = Math.max(1.2, 60 * esc);

  return (
    <g transform={`translate(${CX},${CY})`} opacity={flick}>
      {/* halo belakang */}
      <ellipse
        cx={0}
        cy={30}
        rx={520 + 80 * hb}
        ry={470 + 70 * hb}
        fill="url(#gHalo)"
        opacity={(0.4 + 0.35 * intensity) * (variant === 'bloom' ? 0 : 1)}
      />

      {!lite && (
        <>
          {/* spokes energi */}
          <g opacity={0.1 + 0.42 * esc}>
            {spokes.map((s, i) => {
              const n = noise3D(
                'spk',
                Math.cos(ang) * 22,
                Math.sin(ang) * 22,
                s.sd * 0.05
              );
              const len = 12 + (0.5 + 0.5 * n) * (34 + esc * 62);
              const r0 = 372;
              const rad = (s.a * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={Math.cos(rad) * r0}
                  y1={Math.sin(rad) * r0}
                  x2={Math.cos(rad) * (r0 + len)}
                  y2={Math.sin(rad) * (r0 + len)}
                  stroke={i % 9 === 0 ? '#ff8f7a' : '#ff3b30'}
                  strokeWidth={i % 9 === 0 ? 3 : 1.6}
                  opacity={0.35 + 0.5 * (0.5 + 0.5 * n)}
                />
              );
            })}
          </g>

          {/* tick arc samping (kiri + kanan saja, bukan cincin penuh) */}
          <g
            transform={`rotate(${(t / DUR) * 360 * 1})`}
            opacity={0.4 + esc * 0.34}
          >
            {Array.from({length: 96}).map((_, i) => {
              const a = (i / 96) * 360;
              if (!((a > 122 && a < 238) || a > 302 || a < 58)) return null;
              const rad = (a * Math.PI) / 180;
              const big = i % 8 === 0;
              const r0 = 396;
              const l = big ? 19 : 8;
              return (
                <line
                  key={i}
                  x1={Math.cos(rad) * r0}
                  y1={Math.sin(rad) * r0}
                  x2={Math.cos(rad) * (r0 + l)}
                  y2={Math.sin(rad) * (r0 + l)}
                  stroke={big ? '#ff6f61' : '#b53c35'}
                  strokeWidth={big ? 2.4 : 1.2}
                />
              );
            })}
          </g>
          <g transform={`rotate(${-(t / DUR) * 360 * 2})`} opacity={0.44}>
            <path d={arcPath(432, -52, 30)} stroke="#ff4d43" strokeWidth={2.2} fill="none" strokeDasharray="30 10 5 10" />
            <path d={arcPath(432, 128, 210)} stroke="#ff4d43" strokeWidth={2.2} fill="none" strokeDasharray="30 10 5 10" />
          </g>
          {/* gauge ancaman: 4 busur simetris tumbuh dari sumbu horizontal */}
          <g>
            <path d={arcPath(462, -62, 62)} stroke="#2c1215" strokeWidth={6} fill="none" />
            <path d={arcPath(462, 118, 242)} stroke="#2c1215" strokeWidth={6} fill="none" />
            {[
              [0, -gaugeSpan],
              [0, gaugeSpan],
              [180, 180 - gaugeSpan],
              [180, 180 + gaugeSpan],
            ].map(([a0, a1], i) => (
              <path
                key={i}
                d={arcPath(462, a0, a1)}
                stroke="url(#gGauge)"
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                opacity={0.92}
              />
            ))}
          </g>
        </>
      )}

      {/* isi segitiga */}
      <path d={TRI_PATH} fill="url(#gFill)" opacity={0.14 + 0.2 * intensity} />
      <g clipPath="url(#clipTri)">
        <rect
          x={-TRI_W / 2}
          y={sweepY - 46}
          width={TRI_W}
          height={92}
          fill="url(#gSweep)"
          opacity={0.42 + 0.34 * esc}
        />
        {!lite &&
          Array.from({length: 28}).map((_, i) => (
            <rect
              key={i}
              x={-TRI_W / 2}
              y={-TRI_H / 2 - 19 + i * 19 + scanOff}
              width={TRI_W}
              height={1}
              fill="#ff6b5e"
              opacity={0.11}
            />
          ))}
      </g>

      {/* stroke segitiga: 4 lapis */}
      <path d={TRI_PATH} fill="none" stroke="#ff1a1a" strokeWidth={40} opacity={0.07 * core} strokeLinejoin="round" />
      <path d={TRI_PATH} fill="none" stroke="#ff2b20" strokeWidth={23} opacity={0.36 * core} strokeLinejoin="round" />
      <path d={TRI_PATH} fill="none" stroke="#ff4b3c" strokeWidth={8.5} opacity={0.92 * core} strokeLinejoin="round" />
      <path d={TRI_PATH} fill="none" stroke="#ffd9d2" strokeWidth={2.2} opacity={0.85 * core} strokeLinejoin="round" />
      <path d={TRI_PATH_IN} fill="none" stroke="#ff5a4a" strokeWidth={2.6} opacity={0.4 * core} strokeLinejoin="round" />

      {/* tanda seru — ramping & meruncing */}
      <g>
        <path d={EXC_BAR} fill="none" stroke="#ff4b3c" strokeWidth={17} opacity={0.2 * core} strokeLinejoin="round" />
        <path d={EXC_BAR} fill="url(#gBar)" stroke="#fff4f1" strokeWidth={1} opacity={0.95 * core} />
        <circle r={13.5} cy={112} fill="none" stroke="#ff4b3c" strokeWidth={17} opacity={0.22 * core} />
        <circle r={13.5} cy={112} fill="url(#gBar)" stroke="#fff4f1" strokeWidth={1} opacity={0.95 * core} />
      </g>
    </g>
  );
};

/* ═══════════════════════════════════════════════════════════ HUD */

const PHASES = [
  {t0: 0, t1: 5.4, label: 'SCANNING NETWORK PERIMETER', code: 'STATUS 0x00', col: '#ffb020'},
  {t0: 5.4, t1: 9.6, label: 'UNAUTHORIZED ACCESS DETECTED', code: 'ALERT 0x2F', col: '#ff5a3c'},
  {t0: 9.6, t1: 15.6, label: 'CRITICAL // SYSTEM BREACH', code: 'FATAL 0x8C', col: '#ff2d20'},
  {t0: 15.6, t1: 20.0, label: 'COUNTERMEASURE DEPLOYED', code: 'DEFEND 0x11', col: '#25d4c8'},
  {t0: 20.0, t1: 22.0, label: 'PERIMETER RESTORED', code: 'SECURE 0x01', col: '#3fd18a'},
  {t0: 22.0, t1: 24.0, label: 'SCANNING NETWORK PERIMETER', code: 'STATUS 0x00', col: '#ffb020'},
];

const PANEL_H = 168;
const PANEL_Y = H - 288;

const EVENTS = [
  {ts: '14:22:41.008', kind: 'PORT SCAN', src: '10.44.219.7', sev: 'MED', col: '#ffb020'},
  {ts: '14:22:44.312', kind: 'CRED STUFFING', src: '172.19.0.4', sev: 'HIGH', col: '#ff7a3c'},
  {ts: '14:22:47.980', kind: 'TLS DOWNGRADE', src: '10.44.219.7', sev: 'HIGH', col: '#ff7a3c'},
  {ts: '14:22:51.447', kind: 'PRIV ESCALATION', src: '10.44.219.7', sev: 'CRIT', col: '#ff2d20'},
  {ts: '14:22:55.126', kind: 'DATA EXFIL 4.2GB', src: '198.51.100.9', sev: 'CRIT', col: '#ff2d20'},
];

const Panel: React.FC<{w: number; h: number; col: string; title: string}> = ({w, h, col, title}) => (
  <g>
    <rect width={w} height={h} fill="#03050a" opacity={0.76} />
    <rect width={w} height={1.6} fill={col} opacity={0.6} />
    <rect y={h - 1.6} width={w} height={1.6} fill={col} opacity={0.22} />
    <rect x={0} y={0} width={3.5} height={h} fill={col} opacity={0.5} />
    <text x={22} y={30} fontSize={14} fill={col} letterSpacing={4.2}>
      {title}
    </text>
    <line x1={22} y1={40} x2={w - 22} y2={40} stroke={col} strokeWidth={1} opacity={0.22} />
  </g>
);

const Bracket: React.FC<{x: number; y: number; sx: number; sy: number; op: number; col: string}> = ({
  x,
  y,
  sx,
  sy,
  op,
  col,
}) => (
  <path
    d={`M${x + sx * 54},${y} L${x},${y} L${x},${y + sy * 54}`}
    stroke={col}
    strokeWidth={3}
    fill="none"
    opacity={op}
    strokeLinecap="square"
  />
);

const Hud: React.FC<{t: number; esc: number; g: GlitchState}> = ({t, esc, g}) => {
  const ang = 2 * Math.PI * (t / DUR);
  const u = t / DUR;

  let pi = PHASES.findIndex((p) => t >= p.t0 && t < p.t1);
  if (pi < 0) pi = PHASES.length - 1;
  const ph = PHASES[pi];
  // fase pertama & terakhir identik → JANGAN di-fade, supaya seam nol
  const phIn = pi === 0 ? 1 : Math.min(1, (t - ph.t0) / 0.42);
  const phOut = pi === PHASES.length - 1 ? 1 : Math.min(1, (ph.t1 - t) / 0.42);
  const phOp = Math.min(phIn, phOut);

  const packets = Math.round(48210 + 41000 * (0.5 - 0.5 * Math.cos(2 * ang)));
  const threat = Math.round(esc * 100);
  const nodes = 128 - Math.round(esc * 97);
  const lat = (2.4 + 46 * esc).toFixed(1);

  const bars = useMemo(
    () => Array.from({length: 42}, (_, i) => ({sd: random('bb' + i) * 100})),
    []
  );

  const jitter = g.p > 0.25 ? (random(`hj${g.step}`) - 0.5) * 22 * g.p : 0;

  return (
    <g fontFamily={MONO} opacity={0.94}>
      {/* retikel sudut sekitar hero */}
      <g opacity={0.5 + esc * 0.35}>
        {/* hanya dua siku ATAS — siku bawah bertabrakan dengan panel */}
        <Bracket x={CX - 496} y={CY - 392} sx={1} sy={1} op={1} col="#ff5a4a" />
        <Bracket x={CX + 496} y={CY - 392} sx={-1} sy={1} op={1} col="#ff5a4a" />
        {/* rule pengukur di bawah segitiga, aman di antara kedua panel */}
        <g transform={`translate(${CX},${CY + 300})`}>
          <line x1={-244} y1={0} x2={-16} y2={0} stroke="#ff5a4a" strokeWidth={1.4} opacity={0.6} />
          <line x1={16} y1={0} x2={244} y2={0} stroke="#ff5a4a" strokeWidth={1.4} opacity={0.6} />
          {[-232, -188, -144, -100, 144, 188, 232, 100].map((x, i) => (
            <line key={i} x1={x} y1={-5} x2={x} y2={5} stroke="#ff5a4a" strokeWidth={1.4} opacity={0.45} />
          ))}
          <path d="M0,-9 L9,0 L0,9 L-9,0 Z" fill="#ff5a4a" opacity={0.85} />
        </g>
      </g>

      {/* TOP LEFT */}
      <g transform={`translate(84,${86 + jitter * 0.3})`}>
        <rect x={-16} y={-31} width={6} height={74} fill="#ff3b30" opacity={0.95} />
        <text fontFamily={TITLE} fontSize={27} fill="#fff1ee" letterSpacing={5}>
          SEC-OPS INTRUSION MONITOR
        </text>
        <text y={31} fontSize={17} fill="#b9c3d1" letterSpacing={2.6}>
          NODE EDGE-07 · REGION AP-SOUTHEAST · SHIFT 04
        </text>
      </g>

      {/* TOP RIGHT chips */}
      <g transform={`translate(${W - 84},86)`} textAnchor="end">
        <text fontFamily={TITLE} fontSize={22} fill={ph.col} letterSpacing={4}>
          {ph.code}
        </text>
        <text y={31} fontSize={17} fill="#b9c3d1" letterSpacing={2.4}>
          {esc > 0.58 ? 'AES-256 ▸ COMPROMISED' : 'AES-256 ▸ ACTIVE'}
        </text>
        <g transform="translate(0,52)">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={-16 - i * 30}
              y={0}
              width={22}
              height={9}
              fill={i < Math.round(esc * 5) ? ph.col : '#2a1c1e'}
              opacity={0.95}
            />
          ))}
        </g>
      </g>

      {/* ── PANEL KIRI BAWAH: telemetri ── */}
      <g transform={`translate(84,${PANEL_Y})`}>
        <Panel w={580} h={PANEL_H} col="#ff3b30" title="LIVE TELEMETRY" />
        {[
          ['THREAT LEVEL', `${threat}%`, esc],
          ['PACKETS / SEC', `${packets}`, 0.22 + 0.78 * (0.5 - 0.5 * Math.cos(2 * ang))],
          ['NODES ONLINE', `${nodes} / 128`, nodes / 128],
          ['RESPONSE TIME', `${lat} ms`, esc * 0.9],
        ].map(([lab, val, v], i) => (
          <g key={i} transform={`translate(22,${52 + i * 27})`}>
            <text fontSize={14} fill="#a9b4c2" letterSpacing={2.4}>
              {lab as string}
            </text>
            <text x={286} fontSize={16} fill="#f4f8fd" letterSpacing={1.4} textAnchor="end">
              {val as string}
            </text>
            <rect x={302} y={-10} width={234} height={5} fill="#301b1e" />
            <rect
              x={302}
              y={-10}
              width={234 * Math.max(0.02, Math.min(1, v as number))}
              height={5}
              fill={i === 0 ? '#ff3b30' : '#d4635a'}
            />
          </g>
        ))}
      </g>

      {/* ── PANEL KANAN BAWAH: event ancaman ── */}
      <g transform={`translate(${W - 664},${PANEL_Y})`}>
        <Panel w={580} h={PANEL_H} col="#ff3b30" title="THREAT EVENT STREAM" />
        {EVENTS.map((e, i) => {
          const on = i < 1 + Math.round(esc * (EVENTS.length - 1));
          const n = noise3D('evt', Math.cos(ang) * 14, Math.sin(ang) * 14, i * 7 + 3);
          return (
            <g
              key={i}
              transform={`translate(22,${52 + i * 27})`}
              opacity={on ? 0.7 + 0.3 * (0.5 + 0.5 * n) : 0.17}
            >
              <text fontSize={14} fill="#8e99a7" letterSpacing={1.1}>
                {e.ts}
              </text>
              <text x={122} fontSize={14} fill="#e9eff7" letterSpacing={1.6}>
                {e.kind}
              </text>
              <text x={352} fontSize={14} fill="#8e99a7" letterSpacing={1.1}>
                {e.src}
              </text>
              <rect x={496} y={-11} width={9} height={9} fill={e.col} />
              <text x={512} fontSize={14} fill={e.col} letterSpacing={1.8}>
                {e.sev}
              </text>
            </g>
          );
        })}
      </g>

      {/* ── STATUS BAND paling bawah ── */}
      <g opacity={phOp}>
        <rect x={0} y={H - 106} width={W} height={82} fill="#070203" opacity={0.58} />
        <rect x={0} y={H - 106} width={W} height={2} fill={ph.col} opacity={0.55} />
        <rect
          x={0}
          y={H - 106}
          width={W * Math.max(0.04, esc)}
          height={2}
          fill={ph.col}
        />
        <g transform={`translate(${CX + jitter},${H - 66})`} textAnchor="middle">
          <text fontFamily={TITLE} fontSize={33} fill={ph.col} letterSpacing={9}>
            {ph.label}
          </text>
          <text y={29} fontSize={14} fill="#8b95a2" letterSpacing={4}>
            {`TRACE ${1088 + Math.round((0.5 - 0.5 * Math.cos(ang)) * 4412)} · 10.44.219.7 → EDGE-07:443 · TLS 1.3 · SESSION 0x${(
              4096 + Math.round((0.5 - 0.5 * Math.cos(2 * ang)) * 61000)
            )
              .toString(16)
              .toUpperCase()}`}
          </text>
        </g>
        <g transform={`translate(52,${H - 60})`}>
          {bars.slice(0, 22).map((b, i) => {
            const n = noise3D('bar', Math.cos(ang) * 26, Math.sin(ang) * 26, b.sd * 0.4);
            const h = 3 + (0.5 + 0.5 * n) * (8 + esc * 26);
            return (
              <rect key={i} x={i * 11} y={-h / 2} width={5} height={h} fill={i % 7 === 0 ? '#ff6b5e' : '#7e3a35'} />
            );
          })}
        </g>
        <g transform={`translate(${W - 52},${H - 60})`}>
          {bars.slice(0, 22).map((b, i) => {
            const n = noise3D('bar', Math.cos(ang) * 26, Math.sin(ang) * 26, b.sd * 0.4 + 11);
            const h = 3 + (0.5 + 0.5 * n) * (8 + esc * 26);
            return (
              <rect key={i} x={-i * 11 - 5} y={-h / 2} width={5} height={h} fill={i % 7 === 0 ? '#ff6b5e' : '#7e3a35'} />
            );
          })}
        </g>
      </g>
    </g>
  );
};

/* ════════════════════════════════════════════════════════ BOKEH */

const Bokeh: React.FC<{t: number; esc: number}> = ({t, esc}) => {
  const dots = useMemo(
    () =>
      Array.from({length: 46}, (_, i) => {
        const tier = i % 3;
        return {
          x: random('bx' + i) * (W + 200) - 100,
          y0: random('by' + i) * (H + 260),
          r: [16, 30, 54][tier] * (0.6 + random('br' + i) * 0.9),
          a: [0.72, 0.5, 0.3][tier],
          cyc: [1, 2, 3][tier],
          sq: random('bq' + i) < 0.4,
          sd: random('bs' + i) * 90,
        };
      }),
    []
  );
  const ang = 2 * Math.PI * (t / DUR);
  const CORR = H + 260;
  return (
    <g>
      {dots.map((d, i) => {
        const y = ((d.y0 - ((CORR * d.cyc) / DUR) * t) % CORR + CORR) % CORR - 130;
        const n = noise3D('bk', Math.cos(ang) * 9, Math.sin(ang) * 9, d.sd * 0.3);
        const op = d.a * (0.5 + 0.5 * (0.5 + 0.5 * n)) * (0.68 + 0.42 * esc);
        return d.sq ? (
          <rect
            key={i}
            x={d.x - d.r * 0.62}
            y={y - d.r * 0.62}
            width={d.r * 1.24}
            height={d.r * 1.24}
            fill="url(#gDot)"
            opacity={op}
            rx={d.r * 0.2}
          />
        ) : (
          <circle key={i} cx={d.x} cy={y} r={d.r} fill="url(#gDot)" opacity={op} />
        );
      })}
    </g>
  );
};

/* ═══════════════════════════════════════════════════════════ DEFS */

const Defs: React.FC = () => (
  <defs>
    <clipPath id="clipTri">
      <path d={TRI_PATH} />
    </clipPath>
    <radialGradient id="gHalo">
      <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.28" />
      <stop offset="42%" stopColor="#c41f18" stopOpacity="0.13" />
      <stop offset="100%" stopColor="#3d0806" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="gDot">
      <stop offset="0%" stopColor="#ff4d3d" stopOpacity="0.95" />
      <stop offset="55%" stopColor="#e02b22" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#8a1310" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ff2a1f" stopOpacity="0.06" />
      <stop offset="100%" stopColor="#ff2a1f" stopOpacity="0.42" />
    </linearGradient>
    <linearGradient id="gSweep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ff8f7a" stopOpacity="0" />
      <stop offset="50%" stopColor="#ffd9d2" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#ff8f7a" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="55%" stopColor="#ffd0c6" />
      <stop offset="100%" stopColor="#ff6a58" />
    </linearGradient>
    <linearGradient id="gGauge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#ff9040" />
      <stop offset="55%" stopColor="#ff3f26" />
      <stop offset="100%" stopColor="#ff1207" />
    </linearGradient>
    <radialGradient id="gVig">
      <stop offset="0%" stopColor="#000" stopOpacity="0" />
      <stop offset="52%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
    </radialGradient>
  </defs>
);

/* ══════════════════════════════════════════════════════════ MAIN */

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ready = useEmbeddedFonts();

  const F = ((frame % DUR_F) + DUR_F) % DUR_F;
  const t = F / fps;

  const esc = interpolate(
    t,
    [0, 2.6, 6.6, 10.2, 16.2, 20.4, 22.6, 24],
    [0.2, 0.2, 0.58, 1, 1, 0.46, 0.2, 0.2],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const g = computeGlitch(F, esc);

  const heroJx = g.p > 0.2 ? (random(`hx${g.step}`) - 0.5) * 34 * g.p : 0;
  const heroJy = g.p > 0.2 ? (random(`hy${g.step}`) - 0.5) * 16 * g.p : 0;
  const chroma = g.p * 20;

  const bands = g.bands.slice(0, 5);

  return (
    <AbsoluteFill style={{background: '#04060a', overflow: 'hidden'}}>
      {/* code wall */}
      <CodeWall t={t} esc={esc} g={g} ready={ready} />

      {/* wash merah */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 66% at 50% 47%, rgba(255,46,32,${(
            0.14 +
            0.17 * esc
          ).toFixed(3)}) 0%, rgba(168,18,12,${(0.07 + 0.09 * esc).toFixed(
            3
          )}) 40%, rgba(4,6,10,0) 76%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* bokeh */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, filter: 'blur(7px)'}}>
        <Defs />
        <Bokeh t={t} esc={esc} />
      </svg>

      {/* HERO + bloom */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${heroJx}px,${heroJy}px)`}}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{position: 'absolute', inset: 0}}
        >
          <Defs />
          <Hero t={t} esc={esc} g={g} />
        </svg>
        {/* chroma ghost cyan */}
        {chroma > 1.6 && (
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateX(${-chroma}px)`,
              filter: 'hue-rotate(158deg) saturate(3)',
              mixBlendMode: 'screen',
              opacity: 0.55 * g.p,
            }}
          >
            <Defs />
            <Hero t={t} esc={esc} g={g} variant="lite" />
          </svg>
        )}
        {/* pita hero tergeser */}
        {g.p > 0.3 &&
          bands.map((b, i) => (
            <svg
              key={i}
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(${b.y}px 0 ${H - b.y - b.h}px 0)`,
                transform: `translateX(${b.dx * 0.55}px)`,
              }}
            >
              <Defs />
              <Hero t={t} esc={esc} g={g} variant="lite" />
            </svg>
          ))}
        {/* bloom hero */}
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{
            position: 'absolute',
            inset: 0,
            filter: 'blur(24px)',
            mixBlendMode: 'screen',
            opacity: 0.4,
          }}
        >
          <Defs />
          <Hero t={t} esc={esc} g={g} variant="bloom" />
        </svg>
      </div>

      {/* scrim atas & bawah supaya HUD terbaca di atas code wall */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, rgba(2,3,6,0.9) 0%, rgba(2,3,6,0.5) 10%, rgba(2,3,6,0) 20%, rgba(2,3,6,0) 60%, rgba(2,3,6,0.42) 78%, rgba(2,3,6,0.86) 100%)',
        }}
      />

      {/* vignette — SEBELUM HUD supaya readout tidak ikut gelap */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <Defs />
        <rect width={W} height={H} fill="url(#gVig)" />
      </svg>

      {/* HUD */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <Defs />
        <Hud t={t} esc={esc} g={g} />
      </svg>

      {/* scanlines */}
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.26) 3px, rgba(0,0,0,0.26) 4px)',
          opacity: 0.4,
        }}
      />
      {/* rolling bar */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,220,214,0.055) 45%, rgba(255,255,255,0) 100%)`,
          transform: `translateY(${(((t / DUR) * 3) % 1) * (H + 460) - 230}px)`,
          height: 340,
          mixBlendMode: 'screen',
        }}
      />

      {/* flash putih pada puncak glitch */}
      {g.p > 0.72 && (
        <AbsoluteFill
          style={{
            background: '#ffffff',
            opacity: (g.p - 0.72) * 0.34,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default Motion;
