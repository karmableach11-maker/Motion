import React, {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

/* ------------------------------------------------------------------ *
 *  CODE APPROACH — panels fly out of the light and past the lens
 *  1920x1080 | 60fps | 15s | perfect loop
 *
 *  Every panel is a real 3D object at depth z, projected with
 *  k = FOC / z. The camera pushes forward at constant speed, so panels
 *  emerge tiny at the burst core, swell as they come, and sail out
 *  through the edges of the frame — the growth, the parallax and the
 *  order they overtake each other all fall out of the projection.
 *
 *  They keep typing the whole way in: typing progress is driven by the
 *  panel's own depth travel, not by a clock, so a panel that is still
 *  approaching is still writing. Depth of field follows the real lens
 *  law (blur from |1/z - 1/zFocus|), which is why the ones closest to
 *  the lens go soft rather than merely large.
 *
 *  Each panel makes exactly two passes per loop and alternates between
 *  two snippets, so at t = 15 s every panel is back at its own start
 *  depth showing the same code it started with.
 * ------------------------------------------------------------------ */

const FONT = 'JBMonoCode';
const F4 = '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';
const F7 = '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';
let fontRequested = false;
const ensureFont = () => {
	if (fontRequested || typeof document === 'undefined') return;
	fontRequested = true;
	const el = document.createElement('style');
	const face = (w: number, b: string) =>
		"@font-face{font-family:'" + FONT + "';font-style:normal;font-weight:" + w +
		';font-display:block;src:url(data:font/woff2;base64,' + b + ") format('woff2');}";
	el.textContent = face(400, F4) + face(700, F7);
	document.head.appendChild(el);
};

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;
const HY = 612; /* horizon */
const CXR = 884; /* burst core */

/* palette */
const COL = ['#9CC0E2', '#5CB0F0', '#63D6BE', '#B79BEE', '#3D5F84', '#BCE0FF'];
const RAY = '#3E8FE0';

let _s = 0x6d2f81b3 >>> 0;
const rr = () => {
	_s = (Math.imul(_s, 1664525) + 1013904223) >>> 0;
	return _s / 4294967296;
};

/* ================= code corpus ================= */
const SNIP: string[][] = [
	[
		'export const buildPipeline = (cfg) => {',
		'  const stages = cfg.stages ?? [];',
		'  const out = [];',
		'  for (const s of stages) {',
		'    if (!s.enabled) continue;',
		'    out.push(compile(s, cfg.target));',
		'  }',
		'  return freeze(out);',
		'};',
	],
	[
		'async function resolveGraph(root) {',
		'  const seen = new Set();',
		'  const queue = [root];',
		'  while (queue.length) {',
		'    const node = queue.shift();',
		'    if (seen.has(node.id)) continue;',
		'    seen.add(node.id);',
		'    queue.push(...node.edges);',
		'  }',
		'  return seen.size;',
		'}',
	],
	[
		'# normalise the incoming batch',
		'def normalise(batch, eps=1e-6):',
		'    mu = batch.mean(axis=0)',
		'    sd = batch.std(axis=0) + eps',
		'    return (batch - mu) / sd',
		'',
		'class Encoder:',
		'    def __init__(self, dim=512):',
		'        self.dim = dim',
		'        self.layers = []',
	],
	[
		'type Result<T> = {',
		'  ok: boolean;',
		'  value: T | null;',
		'  error: string;',
		'};',
		'',
		'export function unwrap(r) {',
		'  if (!r.ok) throw new Error(r.error);',
		'  return r.value;',
		'}',
	],
	[
		'const server = createServer({',
		'  port: 8443,',
		'  tls: true,',
		'  routes: registry.all(),',
		'});',
		'',
		'server.on("request", (req, res) => {',
		'  const t0 = now();',
		'  handle(req).then(() => log(now() - t0));',
		'});',
	],
	[
		'SELECT node_id, region, latency_ms',
		'  FROM cluster_metrics',
		' WHERE window > now() - 300',
		'   AND status = "healthy"',
		' ORDER BY latency_ms ASC',
		' LIMIT 64;',
		'',
		'-- 1284 rows scanned in 12 ms',
	],
	[
		'void kernel_step(float* buf, int n) {',
		'  for (int i = 0; i < n; i++) {',
		'    float v = buf[i] * 0.5f;',
		'    buf[i] = clamp(v, -1.0f, 1.0f);',
		'  }',
		'}',
		'',
		'// checksum 0x4A7F verified',
	],
	[
		'import { pack, verify } from "./crypto";',
		'',
		'export const sign = (payload, key) => {',
		'  const blob = pack(payload);',
		'  const mac = hmac(blob, key, "sha512");',
		'  return { blob, mac, ts: now() };',
		'};',
	],
];

const KW = new Set([
	'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
	'import', 'export', 'from', 'async', 'await', 'class', 'new', 'this', 'null',
	'true', 'false', 'def', 'self', 'try', 'catch', 'throw', 'type', 'void',
	'int', 'float', 'continue', 'of', 'in', 'SELECT', 'FROM', 'WHERE', 'AND',
	'ORDER', 'BY', 'ASC', 'LIMIT', 'boolean', 'string', 'number',
]);
type Tok = [string, number];
const tokenise = (line: string): Tok[] => {
	const out: Tok[] = [];
	const re = /(\/\/[^]*$|#[^]*$|--[^]*$|"[^"]*"|'[^']*'|\d+(?:\.\d+)?[a-z]*|[A-Za-z_$][\w$]*|\s+|[^\s\w])/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(line)) !== null) {
		const s = m[0];
		let c = 0;
		if (s[0] === '/' || s[0] === '#' || s.slice(0, 2) === '--') c = 4;
		else if (s[0] === '"' || s[0] === "'") c = 2;
		else if (s[0] >= '0' && s[0] <= '9') c = 3;
		else if (KW.has(s)) c = 1;
		else if (s[0] >= 'A' && s[0] <= 'Z') c = 5;
		out.push([s, c]);
		if (m.index === re.lastIndex) re.lastIndex++;
	}
	return out;
};
const TOKS = SNIP.map((s) => s.map(tokenise));
const LENS = SNIP.map((s) => s.map((l) => l.length));
const TOTAL = LENS.map((ls) => ls.reduce((a, b) => a + b + 1, 0));
const MAXL = SNIP.map((s) => s.reduce((m, l) => Math.max(m, l.length), 0));


/* ================= 3D panel field ================= */
const FOC = 900;
const ZN = 1.5;
const ZF = 21;
const SPZ = ZF - ZN;
const PASSES = 2;
const VEL = (SPZ * PASSES) / 15; /* exactly two traversals per loop */
const ZFOC = 6.6; /* focal plane */

type P = {
	x: number;
	y: number;
	z0: number;
	fs: number;
	kind: number; /* 0 code, 1 hex, 2 abstract bars */
	sa: number;
	sb: number;
	seed: number;
	rows: number;
	wpx: number;
};

const NP = 54;
const PANELS: P[] = Array.from({length: NP}, (_, i) => {
	/* keep a clear tube around the axis so nothing ploughs straight
	   through the middle of frame; panels always drift out to an edge */
	let ax = 0;
	let ay = 0;
	for (let k = 0; k < 30; k++) {
		ax = (rr() * 2 - 1) * 22;
		ay = (rr() * 2 - 1) * 12.6;
		if (Math.hypot(ax * 0.62, ay) > 1.6) break;
	}
	const u = rr();
	return {
		x: ax,
		y: ay,
		/* low-discrepancy depth phases keep the stream evenly spaced */
		z0: ((i * 0.6180339887) % 1) * SPZ,
		fs: 0.19 + rr() * 0.115,
		kind: u < 0.68 ? 0 : u < 0.84 ? 1 : 2,
		sa: Math.floor(rr() * SNIP.length),
		sb: Math.floor(rr() * SNIP.length),
		seed: Math.floor(rr() * 9973),
		rows: 3 + Math.floor(rr() * 7),
		wpx: 60 + rr() * 130,
	};
});

const HEXD = '0123456789ABCDEF';
const hexRow = (seed: number, n: number) => {
	let s = '';
	let v = (seed * 2654435761) >>> 0;
	for (let i = 0; i < n; i++) {
		v = (Math.imul(v, 1664525) + 1013904223) >>> 0;
		s +=
			HEXD[(v >>> 4) & 15] + HEXD[(v >>> 8) & 15] + HEXD[(v >>> 12) & 15] +
			HEXD[(v >>> 16) & 15] + (i < n - 1 ? '  ' : '');
	}
	return s;
};

/* ================= ray fan ================= */
const NRAY = 168;
const RAYS = Array.from({length: NRAY}, (_, i) => {
	const f = i / (NRAY - 1);
	const a = (4 + 172 * (f + (rr() - 0.5) * 0.012)) * (Math.PI / 180);
	return {a, len: 420 + rr() * 1180, w: 0.5 + Math.pow(rr(), 2.4) * 2.6, r0: 12 + rr() * 46};
});
const NDOT = 260;
const DOTS = Array.from({length: NDOT}, () => {
	const a = (4 + 172 * rr()) * (Math.PI / 180);
	const sp = 26 + rr() * 96;
	return {a, sp, span: sp * 15, d0: rr() * sp * 15, r: 0.8 + rr() * 2.2};
});

const wrap = (v: number, s: number) => ((v % s) + s) % s;

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const u = frame / durationInFrames;
	const t = u * 15;

	const [fh] = useState(() => delayRender('code-font'));
	useEffect(() => {
		let done = false;
		const fin = () => {
			if (done) return;
			done = true;
			continueRender(fh);
		};
		ensureFont();
		const id = setTimeout(fin, 2500);
		Promise.all([
			document.fonts.load('400 16px ' + FONT),
			document.fonts.load('700 16px ' + FONT),
		])
			.then(fin)
			.catch(fin);
		return () => clearTimeout(id);
	}, [fh]);

	/* ---------- ray fan ---------- */
	const rayPaths = ['', '', ''];
	for (let i = 0; i < NRAY; i++) {
		const R = RAYS[i];
		const ca = Math.cos(R.a);
		const sa = Math.sin(R.a);
		const bi = R.w < 1 ? 0 : R.w < 1.9 ? 1 : 2;
		rayPaths[bi] +=
			'M' + (CXR + ca * R.r0).toFixed(1) + ' ' + (HY + sa * R.r0).toFixed(1) +
			'L' + (CXR + ca * R.len).toFixed(1) + ' ' + (HY + sa * R.len).toFixed(1);
	}
	let dotPath = '';
	let dotPath2 = '';
	for (let i = 0; i < NDOT; i++) {
		const D = DOTS[i];
		const d = wrap(D.d0 + D.sp * t, D.span) + 30;
		if (d > 1500) continue;
		const s =
			'M' + (CXR + Math.cos(D.a) * d).toFixed(1) + ' ' +
			(HY + Math.sin(D.a) * d).toFixed(1) + 'h.01';
		if (D.r > 1.8) dotPath2 += s;
		else dotPath += s;
	}

	/* ---------- project the panel field ---------- */
	const vis = PANELS.map((p, pi) => {
		const trav = p.z0 + VEL * t;
		const pass = Math.floor(trav / SPZ);
		const pp = trav / SPZ - pass; /* 0 at the far plane, 1 at the lens */
		const z = ZF - pp * SPZ;
		const k = FOC / z;
		return {p, pi, pass, pp, z, k, X: CXR + p.x * k, Y: HY + p.y * k, fs: p.fs * k};
	})
		.filter((v) => {
			if (v.fs < 2.2) return false;
			const wEst = v.fs * 0.62 * 40;
			const hEst = v.fs * 1.5 * 11;
			return v.X > -wEst - 200 && v.X < W + 200 && v.Y > -hEst - 200 && v.Y < H + 200;
		})
		.sort((a, b) => b.z - a.z);

	return (
		<AbsoluteFill style={{backgroundColor: '#01030A', fontFamily: FONT}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(64% 46% at 46% 57%, rgba(22,64,124,0.5) 0%, rgba(10,30,64,0.22) 40%, rgba(2,8,20,0) 76%)',
				}}
			/>

			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<radialGradient id="rayG" gradientUnits="userSpaceOnUse" cx={CXR} cy={HY} r={980}>
						<stop offset="0%" stopColor="#EAF7FF" stopOpacity="0.95" />
						<stop offset="9%" stopColor="#B6E0FF" stopOpacity="0.8" />
						<stop offset="34%" stopColor={RAY} stopOpacity="0.42" />
						<stop offset="72%" stopColor="#1E4F92" stopOpacity="0.12" />
						<stop offset="100%" stopColor="#0B2246" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="coreG" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
						<stop offset="16%" stopColor="#CDEBFF" stopOpacity="0.6" />
						<stop offset="52%" stopColor="#4E9BE4" stopOpacity="0.18" />
						<stop offset="100%" stopColor="#1B4E90" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#8FC8F5" stopOpacity="0" />
						<stop offset="46%" stopColor="#EAF7FF" stopOpacity="1" />
						<stop offset="100%" stopColor="#8FC8F5" stopOpacity="0" />
					</linearGradient>
					<radialGradient id="bandG" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0%" stopColor="#DCF1FF" stopOpacity="0.75" />
						<stop offset="34%" stopColor="#5AA8EC" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#123A70" stopOpacity="0" />
					</radialGradient>
				</defs>

				<g style={{filter: 'blur(12px)'}} opacity={0.34}>
					<path d={rayPaths[2]} stroke="url(#rayG)" strokeWidth={7} fill="none" />
				</g>
				<path d={rayPaths[0]} stroke="url(#rayG)" strokeWidth={0.75} fill="none" opacity={0.42} />
				<path d={rayPaths[1]} stroke="url(#rayG)" strokeWidth={1.3} fill="none" opacity={0.52} />
				<path d={rayPaths[2]} stroke="url(#rayG)" strokeWidth={2.1} fill="none" opacity={0.62} />

				{dotPath ? <path d={dotPath} stroke="#BFE4FF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.5} /> : null}
				{dotPath2 ? <path d={dotPath2} stroke="#EAF7FF" strokeWidth={3.4} strokeLinecap="round" fill="none" opacity={0.72} /> : null}

				<ellipse cx={CXR} cy={HY} rx={880} ry={70} fill="url(#bandG)" opacity={0.62 + 0.08 * Math.sin(TAU * u * 2)} />
				<ellipse cx={CXR} cy={HY} rx={300} ry={190} fill="url(#coreG)" opacity={0.8} />
				<ellipse cx={CXR} cy={HY} rx={132} ry={74} fill="url(#coreG)" opacity={0.9} />
				<g style={{filter: 'blur(3px)'}}>
					<rect x={CXR - 430} y={HY - 1.2} width={860} height={2.4} fill="url(#lineG)" opacity={0.5} />
				</g>
			</svg>

			{/* ================= flying code panels ================= */}
			{vis.map((v) => {
				const p = v.p;
				/* real lens law: circle of confusion grows with |1/z - 1/zFocus| */
				const bl = Math.min(16, Math.abs(1 / v.z - 1 / ZFOC) * 26);
				const fadeIn = Math.min(1, v.pp / 0.09);
				const fadeOut = Math.min(1, (1 - v.pp) / 0.17);
				const alpha = Math.min(fadeIn, fadeOut) * Math.min(1, 0.44 + v.fs / 12);
				if (alpha < 0.02) return null;

				/* still typing while it flies in */
				const prog = Math.min(1, Math.max(0, v.pp * 1.75));
				const base: React.CSSProperties = {
					position: 'absolute',
					left: v.X,
					top: v.Y,
					opacity: alpha,
					filter: bl > 0.35 ? 'blur(' + bl.toFixed(1) + 'px)' : undefined,
					transformOrigin: '0 0',
					willChange: 'transform',
				};

				if (p.kind === 2 || v.fs < 4.2) {
					const rows: React.ReactNode[] = [];
					const shown = prog * p.rows;
					for (let r = 0; r < p.rows; r++) {
						const fr = Math.min(1, Math.max(0, shown - r));
						if (fr <= 0) break;
						rows.push(
							<div
								key={r}
								style={{
									width: v.fs * 0.62 * (14 + ((r * 37) % 24)) * fr,
									height: Math.max(1, v.fs * 0.46),
									marginBottom: Math.max(1.2, v.fs * 0.62),
									background:
										'linear-gradient(90deg, rgba(160,206,248,0.9), rgba(110,170,225,0.34))',
								}}
							/>
						);
					}
					return <div key={'p' + v.pi} style={base}>{rows}</div>;
				}

				if (p.kind === 1) {
					const nGroup = 4 + (v.pi % 5);
					const full = hexRow(p.seed + v.pass * 17, nGroup);
					const shown = full.slice(0, Math.round(full.length * prog));
					return (
						<div
							key={'p' + v.pi}
							style={{
								...base,
								fontSize: v.fs,
								letterSpacing: v.fs * 0.05,
								color: COL[0],
								whiteSpace: 'pre',
								textShadow: '0 0 ' + (v.fs * 0.9).toFixed(1) + 'px rgba(90,170,240,0.6)',
							}}
						>
							{shown}
							{prog < 1 ? <span style={{color: COL[5]}}>▌</span> : null}
						</div>
					);
				}

				/* alternating pair keeps the two-pass loop closed */
				const si = v.pass % 2 === 0 ? p.sa : p.sb;
				const lines = TOKS[si];
				const lens = LENS[si];
				let left = Math.round(TOTAL[si] * prog);
				const body: React.ReactNode[] = [];
				for (let li = 0; li < lines.length; li++) {
					if (left <= 0) break;
					const take = Math.min(left, lens[li]);
					const spans: React.ReactNode[] = [];
					let used = 0;
					for (let ti = 0; ti < lines[li].length; ti++) {
						const tk = lines[li][ti];
						if (used >= take) break;
						const cut = Math.min(tk[0].length, take - used);
						spans.push(
							<span key={ti} style={{color: COL[tk[1]], fontWeight: tk[1] === 1 ? 700 : 400}}>
								{tk[0].slice(0, cut)}
							</span>
						);
						used += cut;
					}
					const atHead = take < lens[li] || left <= lens[li] + 1;
					body.push(
						<div key={li} style={{height: v.fs * 1.5, whiteSpace: 'pre'}}>
							{spans}
							{atHead && prog < 1 ? <span style={{color: COL[5]}}>▌</span> : null}
						</div>
					);
					left -= lens[li] + 1;
				}
				/* the window frame is there from the moment the panel appears —
				   the code types into it, the way an editor pane behaves */
				const bw = MAXL[si] * v.fs * 0.6 + v.fs * 2.2;
				const bh = lines.length * v.fs * 1.5 + v.fs * 1.9;
				return (
					<div
						key={'p' + v.pi}
						style={{
							...base,
							width: bw,
							height: bh,
							padding: v.fs * 0.95 + 'px ' + v.fs * 1.1 + 'px',
							boxSizing: 'border-box',
							fontSize: v.fs,
							lineHeight: 1.5,
							letterSpacing: v.fs * 0.012,
							textShadow: '0 0 ' + (v.fs * 0.9).toFixed(1) + 'px rgba(80,160,235,0.6)',
							border: '1px solid rgba(112,178,238,0.3)',
							borderLeft: '2px solid rgba(150,205,250,0.5)',
							background:
								'linear-gradient(135deg, rgba(18,52,94,0.34) 0%, rgba(8,24,50,0.2) 60%, rgba(4,12,28,0.1) 100%)',
							boxShadow: 'inset 0 1px 0 rgba(170,215,255,0.1)',
						}}
					>
						{body}
					</div>
				);
			})}

			{/* ================= grade ================= */}
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(1,3,10,0.86) 0%, rgba(1,3,10,0) 14%, rgba(1,3,10,0) 80%, rgba(1,3,10,0.9) 100%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(80% 84% at 46% 54%, rgba(0,0,0,0) 36%, rgba(1,3,10,0.5) 74%, rgba(0,1,5,0.94) 100%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill style={{opacity: 0.045, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
				<svg width={W} height={H}>
					<filter id="grain40">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={(frame % 12) + 1} />
					</filter>
					<rect width={W} height={H} filter="url(#grain40)" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Motion;
