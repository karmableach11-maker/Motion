import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';

/**
 * MOTION 71 — "SECURE VAULT · ENCRYPT & LOCK"
 * ---------------------------------------------------------------------------
 * Five files queue on the left. One at a time each flies to a gate ring in the
 * middle, is scrambled into a dark cipher block while a progress arc closes
 * around it, then drops into an open vault and settles onto the pile inside.
 * With the queue empty the iris sweeps shut, the bolts drive out, the dial
 * spins home and the badge turns green.
 *
 * Fourth piece in the same design system as MOTION 68, 69 and 70 — same plate,
 * panel chrome, footer, shadow language and file-card construction — so all
 * four cut together as a set.
 *
 * HOW IT IS BUILT
 * ---------------------------------------------------------------------------
 * [int] Original build, no reference clip. What follows is why each decision
 *       was made rather than what was measured off frames.
 *
 * [int] THREE STATIONS, LEFT TO RIGHT. Queue, gate, vault. The encryption is
 *       given its own station and its own 52-frame hold instead of happening
 *       in flight, because a transformation that occurs while an object is
 *       moving cannot be read — the eye is tracking position, not content. The
 *       card stops, the ring closes, the hex scrambles, and only then does it
 *       travel on.
 * [int] CADENCE. A file launches every 90 frames and each pipeline run takes
 *       140, so the gate is occupied from t+44 to t+96 and the next card does
 *       not arrive until t+134 — the two never share it, but there is always a
 *       second card in transit, which keeps the frame busy.
 * [int] The queue is a LIST, not a grid. The thumbnails fly away but the rows
 *       stay, each one turning to a green SEALED tag as its file lands. Emptying
 *       the left third entirely would kill a quarter of the frame for the last
 *       four seconds; leaving the ledger behind is what the piece is about
 *       anyway — a record that the files were processed.
 * [int] THE IRIS is six annular sectors whose inner radius runs from 178 to 0
 *       while the whole assembly counter-rotates 26 degrees. A real camera iris
 *       pivots each blade on the rim; that construction needs a per-blade
 *       inverse solve and, at this size, resolves to something visually
 *       identical to sectors. The sectors overlap by two degrees so no seam
 *       ever opens between neighbours mid-close, and alternate blades carry
 *       different gradients so the mechanism reads as separate plates rather
 *       than one shrinking disc. Below radius 0.6 the inner arc is replaced by
 *       a line to the origin — an SVG elliptical arc with a zero radius is
 *       undefined and drops the whole path.
 * [int] The hex on a cipher block is real text in the embedded mono face, not
 *       bars standing in for text. It re-rolls every three frames while the
 *       block is being encrypted and freezes on the frame it finishes, so the
 *       scramble has a clear end rather than fading out.
 * [int] Blocks land on an actual pile inside the vault — each one flies to its
 *       own slot in a five-wide fan on the cavity floor, so the vault visibly
 *       fills. Dissolving them at the mouth would have been cheaper and would
 *       have left the vault looking empty at the moment it seals.
 * [int] The throw from queue to gate carries a 150 px sine bulge, not the 60
 *       it started with. At 60 the card tracked straight across the list and
 *       sat on the filename of whatever row it was passing for about twenty
 *       frames; the taller arc lifts it clear of the type.
 * [int] Every shadow is a radial-gradient ellipse rather than a Gaussian
 *       filter, as in the other three pieces, so nothing in the frame depends
 *       on the renderer's filter resolution.
 */

/* ------------------------------------------------------------------ fonts */
const F_UI7 =
	'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';
const F_UI6 =
	'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';
const F_MO5 =
	'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';

const FACE = `
@font-face{font-family:'CuUI';src:url(data:font/woff2;base64,${F_UI6}) format('woff2');font-weight:600;font-style:normal;font-display:block}
@font-face{font-family:'CuUI';src:url(data:font/woff2;base64,${F_UI7}) format('woff2');font-weight:700;font-style:normal;font-display:block}
@font-face{font-family:'CuMono';src:url(data:font/woff2;base64,${F_MO5}) format('woff2');font-weight:500;font-style:normal;font-display:block}`;

if (typeof document !== 'undefined' && !document.getElementById('m71-faces')) {
	const st = document.createElement('style');
	st.id = 'm71-faces';
	st.textContent = FACE;
	document.head.appendChild(st);
}

const useFaces = () => {
	const [handle] = useState(() => delayRender('m71 fonts'));
	const done = useRef(false);
	useEffect(() => {
		const fin = () => {
			if (!done.current) {
				done.current = true;
				continueRender(handle);
			}
		};
		const d: any = typeof document === 'undefined' ? null : document;
		const ok =
			d && d.fonts && d.fonts.check
				? d.fonts.check("600 20px 'CuUI'") && d.fonts.check("700 20px 'CuUI'") && d.fonts.check("500 20px 'CuMono'")
				: false;
		if (ok) {
			fin();
			return;
		}
		if (d && d.fonts && d.fonts.load) {
			Promise.all([d.fonts.load("600 20px 'CuUI'"), d.fonts.load("700 20px 'CuUI'"), d.fonts.load("500 20px 'CuMono'")])
				.then(fin)
				.catch(fin);
		} else fin();
		const id = setTimeout(fin, 900);
		return () => {
			clearTimeout(id);
			fin();
		};
	}, [handle]);
};

/* ------------------------------------------------------------------ maths */
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const outQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const inCubic = (t: number) => t * t * t;
const outBack = (t: number) => {
	const c = 1.8;
	return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const ez = (f: number, a: number, b: number, c: (t: number) => number = inOutCubic) => c(seg(f, a, b));
const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};
const rr = (x: number, y: number, w: number, h: number, r: number) => {
	const q = Math.min(r, w / 2, h / 2);
	return (
		`M${x + q} ${y}H${x + w - q}A${q} ${q} 0 0 1 ${x + w} ${y + q}` +
		`V${y + h - q}A${q} ${q} 0 0 1 ${x + w - q} ${y + h}` +
		`H${x + q}A${q} ${q} 0 0 1 ${x} ${y + h - q}` +
		`V${y + q}A${q} ${q} 0 0 1 ${x + q} ${y}Z`
	);
};

/* ------------------------------------------------------------------ stage */
const W = 1920;
const H = 1080;

/* compact file card: x -64..64, y -81..81, top-right corner folded */
const CARD = 'M-64 -70A11 11 0 0 1 -53 -81H38L64 -55V70A11 11 0 0 1 53 81H-53A11 11 0 0 1 -64 70Z';

const QX = 250; /* queue column */
const QY = [320, 452, 584, 716, 848];
const QSC = 0.68; /* queue thumbnails ride small so five rows do not overlap */
const GX = 900; /* gate */
const GY = 560;
const VX = 1470; /* vault */
const VY = 560;
const R_BEZ = 246;
const R_APER = 196;
const R_PARK = 178; /* blade inner radius when the iris is open */

/* pile slot inside the vault */
const slot = (j: number): [number, number, number] => [VX + (j - 2) * 58, VY + 104 - Math.abs(j - 2) * 9, (j - 2) * 7];

/* ------------------------------------------------------------------ beats */
const F_QUEUE = 12;
const F_VAULT = 52;
const F_GATE = 96;
const F_Q0 = 140;
const STAG = 90;
const T_ARR = 44; /* reaches the gate */
const T_ENC = 96; /* encryption finished */
const T_DEP = 140; /* settled inside the vault */
const F_LAST = F_Q0 + 4 * STAG + T_DEP; /* 640 */
const F_SEAL0 = 658;
const F_SEAL1 = 728;
const F_BOLT = 716;
const F_LOCK = 754;
const F_DONE = 774;

const t0 = (i: number) => F_Q0 + i * STAG;

/* ------------------------------------------------------------------ files */
const FILES = [
	{name: 'CLIENT_DB', ext: 'SQL', size: '2.8 GB', col: '#2B7FFF'},
	{name: 'PAYROLL', ext: 'XLS', size: '0.6 GB', col: '#0FA862'},
	{name: 'CONTRACTS', ext: 'PDF', size: '1.4 GB', col: '#FF4D4F'},
	{name: 'ID_SCANS', ext: 'ZIP', size: '3.2 GB', col: '#F5811F'},
	{name: 'MASTER_KEY', ext: 'PEM', size: '0.1 GB', col: '#7C4DFF'},
];

/* palette */
const INK = '#16233A';
const INK2 = '#5D6C86';
const INK3 = '#96A3B8';
const LINE = '#DCE3EE';
const ACC = '#1D6BFF';
const OKC = '#12B26A';
const CIPH = '#5FE3A0';

const HEXCH = '0123456789ABCDEF';
const hx = (n: number) => HEXCH[Math.floor(hash(n) * 16)] + HEXCH[Math.floor(hash(n + 91.3) * 16)];
const hexRow = (i: number, r: number, sd: number) =>
	`${hx(i * 31 + r * 7 + sd * 3.1)} ${hx(i * 31 + r * 7 + sd * 3.1 + 1)} ${hx(i * 31 + r * 7 + sd * 3.1 + 2)} ${hx(i * 31 + r * 7 + sd * 3.1 + 3)}`;

/* ------------------------------------------------------------------ pieces */

const PlainCard: React.FC<{i: number}> = ({i}) => {
	const F = FILES[i];
	const chipW = F.ext.length * 10 + 22;
	return (
		<g>
			<path d={CARD} fill="#FFFFFF" />
			<path d={CARD} fill="url(#gCardV)" />
			<path d={CARD} fill="none" stroke="#E3E9F3" strokeWidth={1.8} />
			<path d="M38 -81L64 -55H38Z" fill="#D5E0EF" />
			<path d="M38 -81V-55H64" fill="none" stroke="#C3D1E4" strokeWidth={1.8} strokeLinejoin="round" />
			<path d={rr(-44, -60, 62, 9, 4.5)} fill={F.col} opacity={0.5} />
			{[0, 1, 2, 3].map((k) => (
				<path key={k} d={rr(-44, -38 + k * 18, [88, 74, 88, 62][k], 8, 4)} fill="#E5EBF5" />
			))}
			<path d={rr(-44, 44, chipW, 24, 7)} fill={F.col} opacity={0.15} />
			<text x={-44 + chipW / 2} y={61} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={13} letterSpacing={1.1} fill={F.col}>
				{F.ext}
			</text>
		</g>
	);
};

const CipherCard: React.FC<{i: number; sd: number; live: number}> = ({i, sd, live}) => (
	<g>
		<path d={CARD} fill="url(#gCipher)" />
		<path d={CARD} fill="none" stroke="#2E6BF0" strokeWidth={1.8} opacity={0.75} />
		<path d="M38 -81L64 -55H38Z" fill="#22314F" />
		<path d="M38 -81V-55H64" fill="none" stroke="#3C5480" strokeWidth={1.8} strokeLinejoin="round" />
		<path d="M-44 -64H18" stroke={CIPH} strokeWidth={3} strokeLinecap="round" opacity={0.75} />
		{[0, 1, 2, 3, 4].map((r) => (
			<text
				key={r}
				x={0}
				y={-42 + r * 19}
				textAnchor="middle"
				fontFamily="CuMono"
				fontWeight={500}
				fontSize={13}
				letterSpacing={0.6}
				fill={CIPH}
				opacity={0.5 + 0.45 * hash(i * 5 + r + sd)}
			>
				{hexRow(i, r, sd)}
			</text>
		))}
		<g transform="translate(-30 58)">
			<path d="M-7 -6V-10A7 7 0 0 1 7 -10V-6" fill="none" stroke={CIPH} strokeWidth={2.6} strokeLinecap="round" />
			<path d={rr(-10, -6, 20, 16, 3.5)} fill={CIPH} />
		</g>
		<text x={-12} y={64} fontFamily="CuUI" fontWeight={700} fontSize={12} letterSpacing={1.6} fill={CIPH} opacity={0.85}>
			AES-256
		</text>
		{live > 0.01 ? <path d={CARD} fill={CIPH} opacity={live * 0.22} /> : null}
	</g>
);

/* iris blade: annular sector centred on angle 0 */
const blade = (a: number, R: number, half: number) => {
	const c1 = Math.cos(-half);
	const s1 = Math.sin(-half);
	const c2 = Math.cos(half);
	const s2 = Math.sin(half);
	const head = `M${R * c1} ${R * s1}A${R} ${R} 0 0 1 ${R * c2} ${R * s2}`;
	if (a < 0.6) return `${head}L0 0Z`;
	return `${head}L${a * c2} ${a * s2}A${a} ${a} 0 0 0 ${a * c1} ${a * s1}Z`;
};

/* ------------------------------------------------------------------ main */
export const Motion: React.FC = () => {
	useFaces();
	const f = useCurrentFrame();

	const plate = ez(f, 0, 34, outCubic);
	const chrome = ez(f, 8, 46, outCubic);
	const vaultIn = ez(f, F_VAULT, F_VAULT + 44, outBack);
	const gateIn = ez(f, F_GATE, F_GATE + 34, outBack);

	/* ---------------- per-file pipeline ---------------- */
	const stage = (i: number) => {
		const t = f - t0(i);
		const encU = ez(f, t0(i) + T_ARR + 6, t0(i) + T_ENC - 4, inOutCubic);
		const sd = f < t0(i) + T_ENC - 4 ? Math.floor(f / 3) : Math.floor((t0(i) + T_ENC - 4) / 3);
		if (t < 0) return {x: QX, y: QY[i], rot: 0, sc: QSC, op: 1, enc: 0, sd, live: 0, at: 0};
		if (t < T_ARR) {
			const u = ez(f, t0(i), t0(i) + T_ARR, inOutCubic);
			return {
				x: lerp(QX, GX, u),
				y: lerp(QY[i], GY, u) - 150 * Math.sin(Math.PI * u),
				rot: 0,
				sc: lerp(QSC, 1.18, u),
				op: 1,
				enc: 0,
				sd,
				live: 0,
				at: 1,
			};
		}
		if (t < T_ENC) {
			const wob = Math.sin((f - t0(i)) * 0.6) * 1.6 * (1 - encU);
			return {x: GX + wob, y: GY, rot: 0, sc: 1.18, op: 1, enc: encU, sd, live: encU < 1 ? 1 - encU : 0, at: 2};
		}
		const [sxp, syp, srp] = slot(i);
		const u = ez(f, t0(i) + T_ENC, t0(i) + T_DEP, inOutCubic);
		return {
			x: lerp(GX, sxp, u),
			y: lerp(GY, syp, u) - 96 * Math.sin(Math.PI * u),
			rot: srp * u,
			sc: lerp(1.18, 0.4, u),
			op: 1,
			enc: 1,
			sd,
			live: 0,
			at: 3,
		};
	};

	const gateAt = FILES.findIndex((_x, i) => f >= t0(i) + T_ARR && f < t0(i) + T_ENC);
	const gateP = gateAt < 0 ? 0 : seg(f, t0(gateAt) + T_ARR + 6, t0(gateAt) + T_ENC - 4);
	const gateHot = gateAt < 0 ? 0 : ez(f, t0(gateAt) + T_ARR - 8, t0(gateAt) + T_ARR + 6, outCubic) * (1 - ez(f, t0(gateAt) + T_ENC - 8, t0(gateAt) + T_ENC, outCubic));
	const nDone = FILES.filter((_x, i) => f >= t0(i) + T_DEP).length;
	const prog = FILES.reduce((a, _x, i) => a + seg(f, t0(i) + T_ARR, t0(i) + T_DEP), 0) / 5;

	/* ---------------- vault mechanism ---------------- */
	const close = ez(f, F_SEAL0, F_SEAL1, inOutCubic);
	const aper = lerp(R_PARK, 0, close);
	const spin = lerp(0, 26, close);
	const bolt = ez(f, F_BOLT, F_BOLT + 40, outBack);
	const dial = ez(f, F_SEAL1 - 20, F_LOCK, inOutCubic);
	const lock = ez(f, F_LOCK, F_LOCK + 26, outCubic);
	const flash = ez(f, F_LOCK, F_LOCK + 8, outCubic) * (1 - ez(f, F_LOCK + 8, F_LOCK + 54, outQuint));

	/* ---------------- read-outs ---------------- */
	const chip = f >= F_LOCK ? 'SEALED' : f >= F_SEAL0 ? 'LOCKING' : f >= F_Q0 - 20 ? 'ENCRYPTING' : 'READY';
	const chipCol = f >= F_LOCK ? OKC : f >= F_Q0 - 20 ? ACC : INK3;
	const doneOp = ez(f, F_DONE, F_DONE + 30, outCubic);
	const doneY = lerp(32, 0, ez(f, F_DONE, F_DONE + 36, outQuint));
	const status =
		f >= F_LOCK
			? 'VAULT SEALED · KEYS DESTROYED'
			: f >= F_SEAL0
				? 'DRIVING BOLTS'
				: f >= F_Q0
					? `ENCRYPTING · ${Math.min(nDone + 1, 5)} OF 5`
					: 'AES-256 · RSA-4096 · READY';

	return (
		<AbsoluteFill style={{backgroundColor: '#EDF1F8'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display: 'block'}}>
				<defs>
					<linearGradient id="gPlate" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FAFCFF" />
						<stop offset="0.55" stopColor="#EFF3FA" />
						<stop offset="1" stopColor="#E1E7F3" />
					</linearGradient>
					<radialGradient id="gLift" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
						<stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.4" />
						<stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gShadow" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#22375C" stopOpacity="0.32" />
						<stop offset="0.55" stopColor="#22375C" stopOpacity="0.12" />
						<stop offset="1" stopColor="#22375C" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gAcc" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#2E7BFF" stopOpacity="0.5" />
						<stop offset="0.5" stopColor="#2E7BFF" stopOpacity="0.15" />
						<stop offset="1" stopColor="#2E7BFF" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gGrn" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#12B26A" stopOpacity="0.55" />
						<stop offset="0.5" stopColor="#12B26A" stopOpacity="0.16" />
						<stop offset="1" stopColor="#12B26A" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="gCardV" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="1" stopColor="#D8E1EF" stopOpacity="0.55" />
					</linearGradient>
					<linearGradient id="gCipher" x1="0" y1="0" x2="0.4" y2="1">
						<stop offset="0" stopColor="#1E2C49" />
						<stop offset="0.55" stopColor="#131E35" />
						<stop offset="1" stopColor="#0B1424" />
					</linearGradient>

					{/* steel */}
					<linearGradient id="gSteel" x1="0" y1="0" x2="0.55" y2="1">
						<stop offset="0" stopColor="#FDFEFF" />
						<stop offset="0.28" stopColor="#E4EAF4" />
						<stop offset="0.52" stopColor="#F6F9FD" />
						<stop offset="0.78" stopColor="#CBD6E6" />
						<stop offset="1" stopColor="#AFBED2" />
					</linearGradient>
					<linearGradient id="gSteel2" x1="0" y1="0" x2="0.6" y2="1">
						<stop offset="0" stopColor="#EFF4FA" />
						<stop offset="0.4" stopColor="#D3DDEB" />
						<stop offset="1" stopColor="#A9B9CF" />
					</linearGradient>
					<linearGradient id="gBladeA" x1="0" y1="0" x2="0.8" y2="1">
						<stop offset="0" stopColor="#F7FAFD" />
						<stop offset="0.55" stopColor="#DDE5F0" />
						<stop offset="1" stopColor="#B9C7DA" />
					</linearGradient>
					<linearGradient id="gBladeB" x1="0" y1="0" x2="0.8" y2="1">
						<stop offset="0" stopColor="#E9EFF7" />
						<stop offset="0.55" stopColor="#CDD8E8" />
						<stop offset="1" stopColor="#A7B7CD" />
					</linearGradient>
					<radialGradient id="gCav" cx="0.5" cy="0.36" r="0.72">
						<stop offset="0" stopColor="#243350" />
						<stop offset="0.55" stopColor="#16233C" />
						<stop offset="1" stopColor="#0A1120" />
					</radialGradient>
				</defs>

				{/* ============================================================ plate */}
				<rect width={W} height={H} fill="url(#gPlate)" />
				<ellipse cx={880} cy={340} rx={1220} ry={740} fill="url(#gLift)" opacity={plate} />
				<ellipse cx={VX} cy={VY} rx={520} ry={430} fill="url(#gAcc)" opacity={0.16 * plate} />

				{/* ============================================================ title */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-16, 0, chrome)})`}>
					<path d="M634 66H758" stroke={LINE} strokeWidth={2} />
					<path d="M1162 66H1286" stroke={LINE} strokeWidth={2} />
					<text x={960} y={73} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={5.6} fill={INK2}>
						SECURE VAULT · ENCRYPT &amp; LOCK
					</text>
				</g>

				{/* ============================================================ panel */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-22, 0, chrome)})`}>
					<ellipse cx={960} cy={200} rx={470} ry={26} fill="url(#gShadow)" opacity={0.5} />
					<path d={rr(480, 108, 960, 84, 20)} fill="#FFFFFF" />
					<path d={rr(480, 108, 960, 84, 20)} fill="none" stroke="#E4EAF4" strokeWidth={2} />

					<g transform="translate(524 150)">
						<path d="M0 -24L19 -15V1C19 14 10 22 0 26C-10 22 -19 14 -19 1V-15Z" fill={ACC} opacity={0.15} />
						<path d="M0 -24L19 -15V1C19 14 10 22 0 26C-10 22 -19 14 -19 1V-15Z" fill="none" stroke={ACC} strokeWidth={2.6} strokeLinejoin="round" />
						<circle cx={0} cy={-2} r={4.6} fill={ACC} />
						<path d="M0 2V10" stroke={ACC} strokeWidth={3} strokeLinecap="round" />
					</g>
					<text x={572} y={144} fontFamily="CuUI" fontWeight={700} fontSize={20} letterSpacing={2.6} fill={INK}>
						ENCRYPTION ENGINE
					</text>
					<text x={572} y={172} fontFamily="CuMono" fontWeight={500} fontSize={14} letterSpacing={1.6} fill={INK3}>
						{`${5 - nDone} PENDING · 8.1 GB`}
					</text>

					<g transform="translate(898 0)">
						<path d={rr(0, 134, chip.length * 12.2 + 40, 32, 16)} fill={chipCol} opacity={0.13} />
						<circle cx={20} cy={150} r={5} fill={chipCol} />
						<text x={36} y={156} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={chipCol}>
							{chip}
						</text>
					</g>

					<g transform="translate(1128 150)">
						{FILES.map((_x, i) => {
							const d = f >= t0(i) + T_DEP;
							const a = f >= t0(i) && !d;
							return (
								<g key={i}>
									<circle cx={i * 26} cy={0} r={9} fill="none" stroke={d ? OKC : a ? ACC : '#C3CFE0'} strokeWidth={2.2} />
									<circle cx={i * 26} cy={0} r={4.6} fill={d ? OKC : a ? ACC : '#C3CFE0'} opacity={d || a ? 1 : 0.5} />
								</g>
							);
						})}
					</g>

					<g transform="translate(1288 0)">
						<text x={0} y={141} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={INK2}>
							SEALED
						</text>
						<text x={132} y={141} textAnchor="end" fontFamily="CuMono" fontWeight={500} fontSize={15} letterSpacing={1} fill={prog > 0.995 ? OKC : INK}>
							{`${nDone}/5`}
						</text>
						<path d={rr(0, 152, 132, 8, 4)} fill="#E6EBF4" />
						<path d={rr(0, 152, Math.max(2, 132 * prog), 8, 4)} fill={prog > 0.995 ? OKC : ACC} />
					</g>
				</g>

				{/* ============================================================ queue list */}
				<g>
					{FILES.map((F, i) => {
						const born = F_QUEUE + i * 10;
						const inU = ez(f, born, born + 30, outBack);
						if (inU <= 0.002) return null;
						const gone = f >= t0(i);
						const sealed = f >= t0(i) + T_DEP;
						const st = sealed ? 'SEALED' : gone ? 'IN PROCESS' : 'QUEUED';
						const sc = sealed ? OKC : gone ? ACC : INK3;
						return (
							<g key={i} opacity={clamp(inU * 1.4)} transform={`translate(0 ${(1 - inU) * 34})`}>
								{gone ? (
									<g transform={`translate(${QX} ${QY[i]})`} opacity={ez(f, t0(i) + 10, t0(i) + 34, outCubic)}>
										<path d={rr(-44, -55, 88, 110, 10)} fill="#FFFFFF" opacity={0.5} />
										<path d={rr(-44, -55, 88, 110, 10)} fill="none" stroke="#CBD8E7" strokeWidth={2.2} strokeDasharray="9 9" strokeLinecap="round" />
										{sealed ? (
											<g transform="translate(0 -2)">
												<circle cx={0} cy={0} r={18} fill={OKC} opacity={0.12} />
												<circle cx={0} cy={0} r={18} fill="none" stroke={OKC} strokeWidth={2.4} />
												<path d="M-7 -7V-11A7 7 0 0 1 7 -11V-7" fill="none" stroke={OKC} strokeWidth={2.4} strokeLinecap="round" />
												<path d={rr(-10, -7, 20, 15, 3.5)} fill={OKC} />
											</g>
										) : null}
									</g>
								) : null}
								<text x={352} y={QY[i] - 6} fontFamily="CuUI" fontWeight={700} fontSize={20} letterSpacing={1.8} fill={sealed ? INK3 : INK}>
									{`${F.name}.${F.ext}`}
								</text>
								<text x={352} y={QY[i] + 24} fontFamily="CuMono" fontWeight={500} fontSize={15} letterSpacing={1.2} fill={INK3}>
									{F.size}
								</text>
								<g transform={`translate(624 ${QY[i]})`}>
									<path d={rr(-st.length * 5.9 - 32, -17, st.length * 11.8 + 64, 34, 17)} fill={sc} opacity={0.12} />
									<text x={0} y={6} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={14} letterSpacing={2} fill={sc}>
										{st}
									</text>
								</g>
							</g>
						);
					})}
				</g>

				{/* ============================================================ gate */}
				<g opacity={clamp(gateIn * 1.3) * (1 - 0.58 * ez(f, F_LAST - 24, F_LAST + 44, inOutCubic))} transform={`translate(${GX} ${GY}) scale(${lerp(0.86, 1, gateIn)}) translate(${-GX} ${-GY})`}>
					<ellipse cx={GX} cy={GY} rx={236} ry={236} fill="url(#gAcc)" opacity={0.16 + 0.3 * gateHot} />
					<circle cx={GX} cy={GY} r={168} fill="none" stroke={ACC} strokeWidth={2.4} strokeDasharray="18 14" strokeDashoffset={-f * 1.1} opacity={0.5} />
					<circle cx={GX} cy={GY} r={148} fill="none" stroke={ACC} strokeWidth={1.8} opacity={0.25} />
					{[0, 1, 2, 3].map((k) => (
						<path
							key={k}
							d={`M${GX - 132} ${GY - 132}h-26v26`}
							fill="none"
							stroke={ACC}
							strokeWidth={3}
							strokeLinecap="round"
							strokeLinejoin="round"
							opacity={0.6}
							transform={`rotate(${k * 90} ${GX} ${GY})`}
						/>
					))}
					{gateHot > 0.01 ? (
						<g opacity={gateHot}>
							<circle cx={GX} cy={GY} r={154} fill="none" stroke={ACC} strokeWidth={5.5} opacity={0.14} />
							<circle
								cx={GX}
								cy={GY}
								r={154}
								fill="none"
								stroke={ACC}
								strokeWidth={5.5}
								strokeLinecap="round"
								strokeDasharray={2 * Math.PI * 154}
								strokeDashoffset={2 * Math.PI * 154 * (1 - gateP)}
								transform={`rotate(-90 ${GX} ${GY})`}
							/>
							{[0, 1, 2].map((k) => (
								<circle
									key={k}
									cx={GX}
									cy={GY}
									r={186 + k * 12}
									fill="none"
									stroke={ACC}
									strokeWidth={2.4}
									strokeLinecap="round"
									strokeDasharray={`${60 + k * 20} ${2 * Math.PI * (186 + k * 12)}`}
									strokeDashoffset={-f * (2.4 + k * 1.3) * (k % 2 ? -1 : 1)}
									opacity={0.62}
								/>
							))}
							<rect x={GX - 92} y={GY - 96 + 192 * ((f * 2.2) % 100) / 100} width={184} height={3} rx={1.5} fill={ACC} opacity={0.5} />
						</g>
					) : null}
					<text x={GX} y={GY + 236} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={19} letterSpacing={3.2} fill={INK2}>
						{gateHot > 0.5 ? `ENCRYPTING · ${Math.round(gateP * 100)}%` : f >= F_LAST ? 'CIPHER GATE · IDLE' : 'CIPHER GATE'}
					</text>
				</g>

				{/* ============================================================ vault */}
				<g opacity={clamp(vaultIn * 1.3)} transform={`translate(${VX} ${VY}) scale(${lerp(0.88, 1, vaultIn)}) translate(${-VX} ${-VY})`}>
					<ellipse cx={VX} cy={VY + 268} rx={250} ry={38} fill="url(#gShadow)" opacity={0.85} />
					{/* bolts, drawn under the bezel so they emerge from it */}
					{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
						<g key={k} transform={`rotate(${k * 45} ${VX} ${VY})`}>
							<path d={rr(VX - 15, VY - R_BEZ - 6 - 30 * bolt, 30, 42, 8)} fill="url(#gSteel2)" />
							<path d={rr(VX - 15, VY - R_BEZ - 6 - 30 * bolt, 30, 42, 8)} fill="none" stroke="#93A5BE" strokeWidth={2} />
							<path d={rr(VX - 9, VY - R_BEZ - 2 - 30 * bolt, 18, 12, 5)} fill="#FFFFFF" opacity={0.7} />
						</g>
					))}
					{/* bezel */}
					<circle cx={VX} cy={VY} r={R_BEZ} fill="url(#gSteel)" />
					<circle cx={VX} cy={VY} r={R_BEZ} fill="none" stroke="#94A6BF" strokeWidth={3} />
					<circle cx={VX} cy={VY} r={R_BEZ - 22} fill="none" stroke="#B6C4D8" strokeWidth={2.4} />
					{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
						<circle
							key={k}
							cx={VX + Math.cos((k * Math.PI) / 4) * (R_BEZ - 11)}
							cy={VY + Math.sin((k * Math.PI) / 4) * (R_BEZ - 11)}
							r={7}
							fill="#C7D3E3"
							stroke="#9BAABF"
							strokeWidth={1.8}
						/>
					))}
					{/* cavity */}
					<circle cx={VX} cy={VY} r={R_APER} fill="url(#gCav)" />
					<g opacity={0.5}>
						{[-120, -60, 0, 60, 120].map((d, k) => (
							<path
								key={k}
								d={`M${VX - Math.sqrt(Math.max(0, R_APER * R_APER - d * d))} ${VY + d}h${2 * Math.sqrt(Math.max(0, R_APER * R_APER - d * d))}`}
								stroke="#3B5480"
								strokeWidth={1.4}
								opacity={0.5}
							/>
						))}
					</g>
					<circle cx={VX} cy={VY} r={R_APER} fill="none" stroke="#7E90AB" strokeWidth={4} />
				</g>

				{/* ============================================================ cards */}
				<g>
					{[...FILES.keys()]
						.sort((a, b) => (f >= t0(a) ? 1 : 0) - (f >= t0(b) ? 1 : 0) || a - b)
						.map((i) => {
							const p = stage(i);
							const born = F_QUEUE + i * 10;
							const inU = ez(f, born, born + 30, outBack);
							if (inU <= 0.002) return null;
							if (p.at === 0 && f >= t0(i)) return null;
							return (
								<g key={i} opacity={clamp(inU * 1.4)}>
									{p.at < 3 || p.sc > 0.4 ? (
										<ellipse cx={p.x} cy={p.y + 104 * p.sc} rx={64 * p.sc} ry={11 * p.sc} fill="url(#gShadow)" opacity={0.42 * (p.at === 0 ? 1 : 0.55)} />
									) : null}
									<g transform={`translate(${p.x} ${p.y + (1 - inU) * 46}) rotate(${p.rot}) scale(${p.sc * lerp(0.86, 1, inU)})`}>
										{p.enc < 0.999 ? (
											<g opacity={1 - p.enc}>
												<PlainCard i={i} />
											</g>
										) : null}
										{p.enc > 0.001 ? (
											<g opacity={p.enc}>
												<CipherCard i={i} sd={p.sd} live={p.live} />
											</g>
										) : null}
									</g>
								</g>
							);
						})}
					{/* settled pile inside the vault */}
					{FILES.map((_x, i) => {
						if (f < t0(i) + T_DEP) return null;
						const [sxp, syp, srp] = slot(i);
						return (
							<g key={'s' + i} transform={`translate(${sxp} ${syp}) rotate(${srp}) scale(0.34)`} opacity={1 - close * 0.6}>
								<CipherCard i={i} sd={Math.floor((t0(i) + T_ENC - 4) / 3)} live={0} />
							</g>
						);
					})}
				</g>

				{/* ============================================================ iris + hub */}
				<g opacity={clamp(vaultIn * 1.3)} transform={`translate(${VX} ${VY}) scale(${lerp(0.88, 1, vaultIn)})`}>
					<g transform={`rotate(${spin})`}>
						{[0, 1, 2, 3, 4, 5].map((k) => (
							<g key={k} transform={`rotate(${k * 60})`}>
								<path d={blade(aper, R_APER - 2, (31 * Math.PI) / 180)} fill={k % 2 ? 'url(#gBladeB)' : 'url(#gBladeA)'} stroke="#8FA1BA" strokeWidth={1.6} />
							</g>
						))}
					</g>
					{close > 0.55 ? (
						<g opacity={ez(f, F_SEAL1 - 30, F_SEAL1, outCubic)}>
							<circle cx={0} cy={0} r={70} fill="url(#gSteel)" stroke="#94A6BF" strokeWidth={3} />
							<circle cx={0} cy={0} r={52} fill="none" stroke="#B6C4D8" strokeWidth={2.2} />
							<g transform={`rotate(${dial * 300})`}>
								{[0, 1, 2, 3].map((k) => (
									<g key={k} transform={`rotate(${k * 90})`}>
										<path d={rr(-8, -62, 16, 52, 8)} fill="url(#gSteel2)" stroke="#93A5BE" strokeWidth={1.8} />
									</g>
								))}
								<circle cx={0} cy={0} r={19} fill="url(#gSteel2)" stroke="#93A5BE" strokeWidth={2} />
							</g>
						</g>
					) : null}
					{/* lock badge */}
					{lock > 0.01 ? (
						<g opacity={lock} transform={`translate(0 0) scale(${lerp(0.7, 1, lock)})`}>
							<circle cx={0} cy={0} r={128} fill="url(#gGrn)" opacity={0.55} />
							<circle cx={0} cy={0} r={44} fill="#FFFFFF" />
							<circle cx={0} cy={0} r={44} fill="none" stroke={OKC} strokeWidth={3.4} />
							<path d="M-15 -6V-16A15 15 0 0 1 15 -16V-6" fill="none" stroke={OKC} strokeWidth={4.4} strokeLinecap="round" />
							<path d={rr(-21, -6, 42, 32, 7)} fill={OKC} />
						</g>
					) : null}
					{flash > 0.001 ? (
						<circle cx={0} cy={0} r={R_APER + flash * 130} fill="none" stroke={OKC} strokeWidth={5 * (1 - flash)} opacity={(1 - flash) * 0.7} />
					) : null}
				</g>

				<text
					x={VX}
					y={VY + 316}
					textAnchor="middle"
					fontFamily="CuUI"
					fontWeight={700}
					fontSize={19}
					letterSpacing={3.2}
					fill={f >= F_LOCK ? OKC : INK2}
					opacity={clamp(vaultIn * 1.3)}
				>
					{f >= F_LOCK ? 'VAULT · LOCKED' : f >= F_SEAL0 ? 'VAULT · SEALING' : 'VAULT · OPEN'}
				</text>

				{/* ============================================================ completion */}
				{doneOp > 0.004 ? (
					<g opacity={doneOp} transform={`translate(0 ${doneY})`}>
						<ellipse cx={620} cy={1002 - 42} rx={300} ry={22} fill="url(#gShadow)" opacity={0.55} />
						<path d={rr(316, 894, 608, 76, 38)} fill="#FFFFFF" />
						<path d={rr(316, 894, 608, 76, 38)} fill="none" stroke="#E1E8F2" strokeWidth={2} />
						<circle cx={366} cy={932} r={19} fill={OKC} opacity={0.14} />
						<circle cx={366} cy={932} r={19} fill="none" stroke={OKC} strokeWidth={2.6} />
						<path
							d="M357 932.5L363.4 939L375.6 925.6"
							fill="none"
							stroke={OKC}
							strokeWidth={3.4}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={26}
							strokeDashoffset={26 * (1 - ez(f, F_DONE + 8, F_DONE + 34, outCubic))}
						/>
						<text x={400} y={940} fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={2.8} fill={INK}>
							VAULT SEALED
						</text>
						<path d="M644 912V952" stroke={LINE} strokeWidth={2} />
						<text x={670} y={940} fontFamily="CuMono" fontWeight={500} fontSize={19} letterSpacing={1.4} fill={OKC}>
							5 FILES · AES-256
						</text>
					</g>
				) : null}

				{/* ============================================================ footer */}
				<g opacity={chrome * 0.95}>
					<path d="M120 1002H1800" stroke={LINE} strokeWidth={2} />
					<text x={120} y={1040} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={3.4} fill={INK3}>
						ENCRYPT · SEAL · VERIFY
					</text>
					<text
						x={1800}
						y={1040}
						textAnchor="end"
						fontFamily="CuUI"
						fontWeight={700}
						fontSize={15}
						letterSpacing={3.4}
						fill={f >= F_LOCK ? OKC : INK3}
					>
						{status}
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
