import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';

/**
 * MOTION 69 — "CLOUD SYNC · UPLOAD BEAM"
 * ---------------------------------------------------------------------------
 * Six file cards queue on a clean light workspace. One by one they lift, arc
 * across to a glowing pad, and are drawn straight up a light beam into a cloud
 * node. The cloud counts up as each file lands; when the queue empties the
 * beam powers down and the panel reports the transfer.
 *
 * Same design system as MOTION 68 — same plate, panel chrome, footer, shadow
 * language — so the two cut together as a set.
 *
 * HOW IT IS BUILT
 * ---------------------------------------------------------------------------
 * [int] No reference clip for this one; it is an original build. What follows
 *       is why each decision was made rather than what was measured off frames.
 *
 * [int] TWO-STAGE TRANSPORT. A file does not fly diagonally into the cloud —
 *       it arcs to the pad first and only then rises. The diagonal version was
 *       tried and reads as a generic "thing moves to thing"; splitting it puts
 *       the beam at the centre of the idea and gives each file a beat of
 *       anticipation on the pad before it is taken. The arc is a straight lerp
 *       plus a 96 px sine bulge, which keeps the apex at the midpoint where a
 *       thrown object's apex belongs.
 * [int] The rise uses inCubic, not an ease-out. An object being pulled by a
 *       source above it accelerates the whole way; decelerating into the cloud
 *       would read as the file parking rather than being consumed.
 * [int] CADENCE. Files launch every 84 frames and each cycle runs 142 frames,
 *       so two are always in motion but only one is ever inside the beam
 *       (84 + 78 = 162 > 142). That was the point of choosing 84: the frame is
 *       busy without the beam ever carrying two cards at once, which would
 *       muddle the read.
 * [int] BEAM CONSTRUCTION. Three nested quads of the same silhouette at 100%,
 *       68% and 30% width, each with its own vertical gradient. Stacking
 *       hard-edged shapes at descending width is what produces a soft-edged
 *       column without a Gaussian filter — as in MOTION 68, nothing here
 *       depends on the renderer's filter resolution. Ticks and scan rings ride
 *       the same halfWidthAt() taper so nothing floats outside the light.
 * [int] The cloud is five circles and a rounded base sharing ONE gradient in
 *       userSpaceOnUse coordinates. Per-shape objectBoundingBox gradients give
 *       each circle its own ramp and the unions show as visible seams; a
 *       single user-space gradient makes the silhouette read as one solid.
 * [int] Progress accrues continuously from the moment a file launches rather
 *       than jumping on arrival, so the read-out is always moving and hits
 *       100% on the exact frame the last card enters the cloud.
 * [int] Cards in flight are re-sorted to the top of the draw order. Left in
 *       index order the first card slides BEHIND the third one as its arc
 *       passes over the top row, which reads as a glitch rather than depth. The six
 *       sizes are chosen to total 17.5 GB — the same figure MOTION 68 starts
 *       from, so the two pieces describe the same workspace.
 * [int] The cloud sits at y 356, not 300. At 300 its crown reached y 182 and
 *       its glow ellipse washed across the bottom-right corner of the panel
 *       bar, which bottoms out at 192 — the two read as one overlapping
 *       shape. Dropping it 56 px leaves 40 px of clear plate between them
 *       and puts the beam's mid-height on the same line as the grid's, so
 *       the move is a composition gain rather than a patch.
 * [int] No cursor. This is an automatic transfer, and an idle pointer sitting
 *       in frame for fifteen seconds would imply someone is driving it.
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

if (typeof document !== 'undefined' && !document.getElementById('m69-faces')) {
	const st = document.createElement('style');
	st.id = 'm69-faces';
	st.textContent = FACE;
	document.head.appendChild(st);
}

const useFaces = () => {
	const [handle] = useState(() => delayRender('m69 fonts'));
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
	const c = 1.85;
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

const COLX = [330, 620, 910];
const ROWY = [455, 750];
const CELL = (i: number): [number, number] => [COLX[i % 3], ROWY[Math.floor(i / 3)]];

/* card box: x -93..93, y -117..117, top-right corner folded */
const CARD =
	'M-93 -103A14 14 0 0 1 -79 -117H59L93 -83V103A14 14 0 0 1 79 117H-79A14 14 0 0 1 -93 103Z';

/* cloud + beam column */
const BX = 1460;
const CY = 356; /* cloud centre — kept clear of the panel bar above it */
const BEAM_TOP = CY + 66;
const PAD_Y = 890;
const BW_T = 108; /* beam half-width at the top */
const BW_B = 178; /* beam half-width at the pad */
const PAD_RX = 180;
const PAD_RY = 36;
const halfW = (y: number) => lerp(BW_B, BW_T, clamp((PAD_Y - y) / (PAD_Y - BEAM_TOP)));
const beamPath = (k: number) =>
	`M${BX - BW_T * k} ${BEAM_TOP}H${BX + BW_T * k}L${BX + BW_B * k} ${PAD_Y}H${BX - BW_B * k}Z`;

/* ------------------------------------------------------------------ beats */
const F_GRID = 12;
const F_CLOUD = 54;
const F_BEAM = 78;
const F_Q0 = 138; /* first launch */
const STAG = 84; /* launch interval */
const T_LIFT = 20;
const T_ARC0 = 16;
const T_ARC1 = 66;
const T_PAD = 78; /* enters the beam */
const T_ABS = 142; /* absorbed */
const F_LAST = F_Q0 + 5 * STAG + T_ABS; /* 700 */
const F_DONE = 748;
const F_PWR = 764; /* beam powers down */

const t0 = (i: number) => F_Q0 + i * STAG;

/* ------------------------------------------------------------------ files */
type Kind = 'img' | 'vid' | 'doc';
const FILES: {name: string; ext: string; size: string; col: string; kind: Kind}[] = [
	{name: 'CAMPAIGN', ext: 'PSD', size: '2.4 GB', col: '#2B7FFF', kind: 'img'},
	{name: 'PROMO_CUT', ext: 'MP4', size: '6.8 GB', col: '#7C4DFF', kind: 'vid'},
	{name: 'BRAND_KIT', ext: 'AI', size: '1.2 GB', col: '#FF8A2B', kind: 'img'},
	{name: 'REPORT_Q3', ext: 'PDF', size: '0.4 GB', col: '#FF4D4F', kind: 'doc'},
	{name: 'ASSETS', ext: 'ZIP', size: '5.9 GB', col: '#12B26A', kind: 'doc'},
	{name: 'CONTRACT', ext: 'DOC', size: '0.8 GB', col: '#1D6BFF', kind: 'doc'},
];

/* palette */
const INK = '#16233A';
const INK2 = '#5D6C86';
const INK3 = '#96A3B8';
const LINE = '#DCE3EE';
const ACC = '#1D6BFF';
const OKC = '#12B26A';

/* ------------------------------------------------------------------ pieces */

const FileCard: React.FC<{i: number; glow: number}> = ({i, glow}) => {
	const F = FILES[i];
	const chipW = F.ext.length * 12 + 26;
	return (
		<g>
			<ellipse cx={0} cy={132 + glow * 14} rx={82 + glow * 18} ry={13 + glow * 5} fill="url(#gShadow)" opacity={0.62 - glow * 0.24} />
			<path d={CARD} fill="#FFFFFF" />
			<path d={CARD} fill="url(#gCardV)" />
			<path d={CARD} fill="none" stroke="#E3E9F3" strokeWidth={2} />
			{/* folded corner */}
			<path d="M59 -117L93 -83H59Z" fill="#D5E0EF" />
			<path d="M59 -117L93 -83H59Z" fill="url(#gFoldSh)" />
			<path d="M59 -117V-83H93" fill="none" stroke="#C3D1E4" strokeWidth={2} strokeLinejoin="round" />
			{/* body */}
			{F.kind === 'doc' ? (
				<g>
					<path d={rr(-63, -86, 92, 12, 6)} fill={F.col} opacity={0.5} />
					{[0, 1, 2, 3, 4].map((k) => (
						<path key={k} d={rr(-63, -54 + k * 24, [126, 110, 126, 92, 118][k], 10, 5)} fill="#E5EBF5" />
					))}
				</g>
			) : (
				<g>
					<path d={rr(-69, -94, 138, 96, 11)} fill={`url(#gThumb${i})`} />
					{F.kind === 'vid' ? (
						<g>
							<circle cx={0} cy={-46} r={22} fill="#FFFFFF" opacity={0.9} />
							<path d="M-7 -57L13 -46L-7 -35Z" fill={F.col} />
						</g>
					) : (
						<g>
							<circle cx={34} cy={-72} r={11} fill="#FFFFFF" opacity={0.85} />
							<path d="M-69 -20L-24 -60L4 -36L30 -56L69 -20V-9A11 11 0 0 1 58 2H-58A11 11 0 0 1 -69 -9Z" fill="#FFFFFF" opacity={0.55} />
						</g>
					)}
					<path d={rr(-63, 16, 126, 10, 5)} fill="#E5EBF5" />
					<path d={rr(-63, 38, 96, 10, 5)} fill="#E5EBF5" />
				</g>
			)}
			{/* type chip + size */}
			<path d={rr(-63, 74, chipW, 30, 8)} fill={F.col} opacity={0.14} />
			<text x={-63 + chipW / 2} y={95} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={1.4} fill={F.col}>
				{F.ext}
			</text>
			<text x={63} y={95} textAnchor="end" fontFamily="CuMono" fontWeight={500} fontSize={15} letterSpacing={0.6} fill={INK3}>
				{F.size}
			</text>
			{/* upload halo while queued for transport */}
			{glow > 0.01 ? (
				<g opacity={glow}>
					<path d={rr(-104, -128, 208, 256, 20)} fill="none" stroke={ACC} strokeWidth={3} />
					<path d={rr(-104, -128, 208, 256, 20)} fill={ACC} opacity={0.05} />
				</g>
			) : null}
		</g>
	);
};

const Ghost: React.FC<{op: number; tick: number; live: number}> = ({op, tick, live}) => (
	<g opacity={op}>
		<path d={rr(-93, -117, 186, 234, 14)} fill="#FFFFFF" opacity={0.55} />
		<path d={rr(-93, -117, 186, 234, 14)} fill="none" stroke="#CBD8E7" strokeWidth={2.4} strokeDasharray="12 11" strokeLinecap="round" />
		{tick <= 0.002 ? (
			<g opacity={0.9}>
				<circle cx={0} cy={-8} r={22} fill="none" stroke={ACC} strokeWidth={2.6} strokeDasharray="8 9" strokeDashoffset={-live * 3} opacity={0.55} />
				<path d="M0 2V-14M-7 -7L0 -14L7 -7" fill="none" stroke={ACC} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
				<text x={0} y={46} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.6} fill={INK3}>
					IN TRANSIT
				</text>
			</g>
		) : (
			<g opacity={tick}>
				<circle cx={0} cy={-8} r={27} fill={OKC} opacity={0.12} />
				<circle cx={0} cy={-8} r={27} fill="none" stroke={OKC} strokeWidth={2.8} />
				<path
					d="M-12 -8L-3 1L13 -18"
					fill="none"
					stroke={OKC}
					strokeWidth={4}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray={38}
					strokeDashoffset={38 * (1 - tick)}
				/>
				<text x={0} y={46} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.6} fill={OKC}>
					SYNCED
				</text>
			</g>
		)}
	</g>
);

/* ------------------------------------------------------------------ main */
export const Motion: React.FC = () => {
	useFaces();
	const f = useCurrentFrame();

	const plate = ez(f, 0, 34, outCubic);
	const chrome = ez(f, 8, 46, outCubic);
	const beamOn = ez(f, F_BEAM, F_BEAM + 46, outCubic) * (1 - 0.62 * ez(f, F_PWR, F_PWR + 52, inOutCubic));
	const cloudIn = ez(f, F_CLOUD, F_CLOUD + 40, outBack);

	/* ---------------- per-file transport ---------------- */
	const pose = (i: number) => {
		const [cx, cy] = CELL(i);
		const t = f - t0(i);
		const lift = ez(f, t0(i), t0(i) + T_LIFT, outCubic) * (1 - ez(f, t0(i) + T_ARC0, t0(i) + T_ARC0 + 12, outCubic));
		if (t < T_ARC0) return {x: cx, y: cy - 20 * lift, sc: 1 + 0.05 * lift, op: 1, glow: ez(f, t0(i) - 22, t0(i), outCubic), beam: 0, wash: 0};
		if (t < T_PAD) {
			const u = ez(f, t0(i) + T_ARC0, t0(i) + T_ARC1, inOutCubic);
			const land = ez(f, t0(i) + T_ARC1, t0(i) + T_PAD, outQuint);
			return {
				x: lerp(cx, BX, u),
				y: lerp(cy - 20, PAD_Y - 130, u) - 150 * Math.sin(Math.PI * u) + 22 * land,
				sc: lerp(1, 0.86, u) * (1 - 0.05 * land * (1 - land) * 4),
				op: 1,
				glow: 1,
				beam: 0,
				wash: 0,
			};
		}
		const u = ez(f, t0(i) + T_PAD, t0(i) + T_ABS, inCubic);
		return {
			x: BX + Math.sin(u * 7.4 + i) * 9 * (1 - u),
			y: lerp(PAD_Y - 108, BEAM_TOP + 8, u),
			sc: lerp(0.86, 0.14, u),
			op: 1 - ez(f, t0(i) + T_ABS - 30, t0(i) + T_ABS, outCubic),
			glow: 1 - u,
			beam: 1,
			wash: u,
		};
	};

	/* progress accrues while a file is inside the beam */
	const prog = FILES.reduce((a, _u, i) => a + seg(f, t0(i) + 10, t0(i) + T_ABS), 0) / 6;
	const nDone = FILES.filter((_u, i) => f >= t0(i) + T_ABS).length;

	/* cloud reacts to each arrival */
	const flash = FILES.reduce((a, _u, i) => Math.max(a, 1 - ez(f, t0(i) + T_ABS - 6, t0(i) + T_ABS + 26, outCubic) * (f >= t0(i) + T_ABS - 6 ? 1 : 0)), 0);
	const arrive = FILES.reduce((a, _u, i) => {
		const w = ez(f, t0(i) + T_ABS - 8, t0(i) + T_ABS + 4, outCubic) * (1 - ez(f, t0(i) + T_ABS + 4, t0(i) + T_ABS + 40, outQuint));
		return Math.max(a, w);
	}, 0);
	const finale = ez(f, F_LAST, F_LAST + 26, outCubic) * (1 - ez(f, F_LAST + 26, F_LAST + 90, outQuint));
	const cloudSc = cloudIn * (1 + 0.035 * arrive + 0.05 * finale);

	/* pad impulses when a file lands */
	const padHit = FILES.map((_u, i) => ez(f, t0(i) + T_ARC1, t0(i) + T_ARC1 + 46, outQuint));

	/* ---------------- read-outs ---------------- */
	const chip = f >= F_LAST + 8 ? 'COMPLETE' : f >= F_Q0 - 24 ? 'UPLOADING' : 'READY';
	const chipCol = f >= F_LAST + 8 ? OKC : f >= F_Q0 - 24 ? ACC : INK3;
	const doneOp = ez(f, F_DONE, F_DONE + 30, outCubic);
	const doneY = lerp(32, 0, ez(f, F_DONE, F_DONE + 36, outQuint));
	const status =
		f >= F_LAST + 8
			? 'ALL FILES SYNCED'
			: f >= F_Q0
				? `UPLOADING ${Math.min(nDone + 1, 6)} OF 6`
				: 'ENCRYPTED CHANNEL · TLS 1.3';
	const rate = f >= F_LAST || f < F_Q0 ? 0 : 118 + Math.round(Math.sin(f * 0.11) * 9 + Math.sin(f * 0.043) * 14);

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
					<radialGradient id="gPool" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#A8C4F0" stopOpacity="0.55" />
						<stop offset="1" stopColor="#A8C4F0" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gShadow" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#22375C" stopOpacity="0.32" />
						<stop offset="0.55" stopColor="#22375C" stopOpacity="0.12" />
						<stop offset="1" stopColor="#22375C" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="gAcc" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#2E7BFF" stopOpacity="0.55" />
						<stop offset="0.5" stopColor="#2E7BFF" stopOpacity="0.16" />
						<stop offset="1" stopColor="#2E7BFF" stopOpacity="0" />
					</radialGradient>

					<linearGradient id="gCardV" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="1" stopColor="#D8E1EF" stopOpacity="0.55" />
					</linearGradient>
					<linearGradient id="gFoldSh" x1="0" y1="0" x2="0.4" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.6" />
						<stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
					</linearGradient>
					{FILES.map((F, i) =>
						F.kind === 'doc' ? null : (
							<linearGradient key={i} id={`gThumb${i}`} x1="0" y1="0" x2="0.7" y2="1">
								<stop offset="0" stopColor={F.col} stopOpacity="0.85" />
								<stop offset="1" stopColor={F.col} stopOpacity="0.45" />
							</linearGradient>
						)
					)}

					{/* beam */}
					<linearGradient id="gBeam1" x1="0" y1={BEAM_TOP} x2="0" y2={PAD_Y} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#3E86FF" stopOpacity="0.30" />
						<stop offset="0.55" stopColor="#3E86FF" stopOpacity="0.11" />
						<stop offset="1" stopColor="#3E86FF" stopOpacity="0.05" />
					</linearGradient>
					<linearGradient id="gBeam2" x1="0" y1={BEAM_TOP} x2="0" y2={PAD_Y} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#6BA6FF" stopOpacity="0.34" />
						<stop offset="0.6" stopColor="#6BA6FF" stopOpacity="0.13" />
						<stop offset="1" stopColor="#6BA6FF" stopOpacity="0.05" />
					</linearGradient>
					<linearGradient id="gBeam3" x1="0" y1={BEAM_TOP} x2="0" y2={PAD_Y} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.62" />
						<stop offset="0.5" stopColor="#DCEAFF" stopOpacity="0.28" />
						<stop offset="1" stopColor="#DCEAFF" stopOpacity="0.07" />
					</linearGradient>

					{/* cloud — one gradient in stage space so the union is seamless */}
					<linearGradient id="gCloud" x1={BX - 200} y1={CY - 110} x2={BX + 140} y2={CY + 90} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#8CBEFF" />
						<stop offset="0.5" stopColor="#4A8BF2" />
						<stop offset="1" stopColor="#2B63CE" />
					</linearGradient>
					<linearGradient id="gCloudHi" x1={BX} y1={CY - 120} x2={BX} y2={CY + 20} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
						<stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
					</linearGradient>

					<clipPath id="cpBeam">
						<path d={beamPath(1)} />
					</clipPath>
					<clipPath id="cpCloud">
						<g>
							<circle cx={BX - 100} cy={CY + 10} r={64} />
							<circle cx={BX - 26} cy={CY - 34} r={84} />
							<circle cx={BX + 58} cy={CY - 8} r={64} />
							<circle cx={BX + 124} cy={CY + 26} r={48} />
							<path d={rr(BX - 164, CY + 26, 336, 48, 24)} />
						</g>
					</clipPath>
				</defs>

				{/* ============================================================ plate */}
				<rect width={W} height={H} fill="url(#gPlate)" />
				<ellipse cx={760} cy={330} rx={1180} ry={720} fill="url(#gLift)" opacity={plate} />
				<ellipse cx={BX} cy={640} rx={560} ry={430} fill="url(#gPool)" opacity={0.5 * plate} />

				{/* ============================================================ title */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-16, 0, chrome)})`}>
					<path d="M610 66H752" stroke={LINE} strokeWidth={2} />
					<path d="M1168 66H1310" stroke={LINE} strokeWidth={2} />
					<text x={960} y={73} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={5.6} fill={INK2}>
						CLOUD SYNC · SECURE UPLOAD
					</text>
				</g>

				{/* ============================================================ panel */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-22, 0, chrome)})`}>
					<ellipse cx={960} cy={200} rx={470} ry={26} fill="url(#gShadow)" opacity={0.5} />
					<path d={rr(480, 108, 960, 84, 20)} fill="#FFFFFF" />
					<path d={rr(480, 108, 960, 84, 20)} fill="none" stroke="#E4EAF4" strokeWidth={2} />

					<g transform="translate(512 126)">
						<path
							d="M12 34A12 12 0 0 1 12 10A17 17 0 0 1 45 4A13 13 0 0 1 64 12A11 11 0 0 1 64 34Z"
							fill={ACC}
							opacity={0.15}
						/>
						<path
							d="M12 34A12 12 0 0 1 12 10A17 17 0 0 1 45 4A13 13 0 0 1 64 12A11 11 0 0 1 64 34Z"
							fill="none"
							stroke={ACC}
							strokeWidth={2.6}
							strokeLinejoin="round"
						/>
						<path d="M38 30V15M31 21L38 14L45 21" fill="none" stroke={ACC} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
					</g>
					<text x={596} y={144} fontFamily="CuUI" fontWeight={700} fontSize={20} letterSpacing={2.6} fill={INK}>
						SYNC QUEUE
					</text>
					<text x={596} y={172} fontFamily="CuMono" fontWeight={500} fontSize={14} letterSpacing={1.6} fill={INK3}>
						{`${6 - nDone} PENDING · 17.5 GB`}
					</text>

					<g transform="translate(790 0)">
						<path d={rr(0, 134, chip.length * 12.2 + 40, 32, 16)} fill={chipCol} opacity={0.13} />
						<circle cx={20} cy={150} r={5} fill={chipCol} />
						<text x={36} y={156} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={chipCol}>
							{chip}
						</text>
					</g>

					<g transform="translate(1032 150)">
						{FILES.map((_u, i) => {
							const done = f >= t0(i) + T_ABS;
							const act = f >= t0(i) && !done;
							return (
								<g key={i}>
									<circle cx={i * 34} cy={0} r={9} fill="none" stroke={done ? OKC : act ? ACC : '#C3CFE0'} strokeWidth={2.2} />
									<circle cx={i * 34} cy={0} r={4.6} fill={done ? OKC : act ? ACC : '#C3CFE0'} opacity={done || act ? 1 : 0.5} />
								</g>
							);
						})}
					</g>

					<g transform="translate(1250 0)">
						<text x={0} y={141} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={INK2}>
							UPLOADED
						</text>
						<text x={168} y={141} textAnchor="end" fontFamily="CuMono" fontWeight={500} fontSize={15} letterSpacing={1} fill={prog > 0.995 ? OKC : INK}>
							{Math.round(prog * 100) + '%'}
						</text>
						<path d={rr(0, 152, 168, 8, 4)} fill="#E6EBF4" />
						<path d={rr(0, 152, Math.max(2, 168 * prog), 8, 4)} fill={prog > 0.995 ? OKC : ACC} />
					</g>
				</g>

				{/* ============================================================ ghosts */}
				<g>
					{FILES.map((_u, i) => {
						const [cx, cy] = CELL(i);
						const op = ez(f, t0(i) + T_ARC0 + 10, t0(i) + T_ARC0 + 40, outCubic);
						if (op <= 0.004) return null;
						return (
							<g key={i} transform={`translate(${cx} ${cy})`}>
								<Ghost op={op} tick={ez(f, t0(i) + T_ABS, t0(i) + T_ABS + 24, outCubic)} live={f} />
							</g>
						);
					})}
				</g>

				{/* ============================================================ pad */}
				<g opacity={beamOn}>
					<ellipse cx={BX} cy={PAD_Y} rx={300} ry={78} fill="url(#gAcc)" opacity={0.5 + 0.3 * Math.max(...padHit.map((p) => (p > 0 && p < 1 ? 1 - p : 0)), 0)} />
					<ellipse cx={BX} cy={PAD_Y} rx={PAD_RX} ry={PAD_RY} fill="none" stroke={ACC} strokeWidth={3.4} opacity={0.7} />
					<ellipse
						cx={BX}
						cy={PAD_Y}
						rx={PAD_RX - 26}
						ry={PAD_RY - 6}
						fill="none"
						stroke={ACC}
						strokeWidth={2}
						strokeDasharray="10 12"
						strokeDashoffset={-f * 0.7}
						opacity={0.42}
					/>
					{padHit.map((p, i) =>
						p > 0.001 && p < 0.999 ? (
							<ellipse
								key={i}
								cx={BX}
								cy={PAD_Y}
								rx={PAD_RX + p * 150}
								ry={PAD_RY + p * 30}
								fill="none"
								stroke={ACC}
								strokeWidth={3.4 * (1 - p)}
								opacity={(1 - p) * 0.6}
							/>
						) : null
					)}
				</g>

				{/* ============================================================ beam */}
				<g opacity={beamOn}>
					<path d={beamPath(1)} fill="url(#gBeam1)" />
					<path d={beamPath(0.68)} fill="url(#gBeam2)" />
					<path d={beamPath(0.3)} fill="url(#gBeam3)" />
					<g clipPath="url(#cpBeam)">
						{/* rising ticks */}
						{Array.from({length: 30}, (_u, i) => {
							const sp = 2.1 + hash(i * 1.7) * 1.7;
							const span = PAD_Y - BEAM_TOP + 140;
							const y = PAD_Y + 60 - (((f * sp + hash(i * 3.3) * span) % span) + 0);
							const hw = halfW(y);
							const x = BX + (hash(i * 5.9) - 0.5) * 1.72 * hw;
							const wl = 10 + hash(i * 7.1) * 26;
							const a = clamp((PAD_Y + 40 - y) / 120) * clamp((y - BEAM_TOP + 10) / 120) * (0.3 + hash(i * 9.4) * 0.55);
							return <rect key={i} x={x - wl / 2} y={y} width={wl} height={3} rx={1.5} fill="#FFFFFF" opacity={a} />;
						})}
						{/* scan rings */}
						{[0, 1, 2].map((i) => {
							const span = PAD_Y - BEAM_TOP;
							const y = PAD_Y - ((f * 2.6 + (i * span) / 3) % span);
							const hw = halfW(y) * 0.92;
							return (
								<ellipse
									key={i}
									cx={BX}
									cy={y}
									rx={hw}
									ry={hw * 0.2}
									fill="none"
									stroke="#FFFFFF"
									strokeWidth={2.4}
									opacity={0.36 * clamp((y - BEAM_TOP) / 150) * clamp((PAD_Y - y) / 90)}
								/>
							);
						})}
					</g>
				</g>

				{/* ============================================================ files */}
				<g>
					{[...FILES.keys()]
						.sort((a, b) => (f >= t0(a) ? 1 : 0) - (f >= t0(b) ? 1 : 0) || a - b)
						.map((i) => {
						const p = pose(i);
						const born = F_GRID + i * 8;
						const inU = ez(f, born, born + 30, outBack);
						if (inU <= 0.002 || p.op <= 0.004) return null;
						const bob = Math.sin((f + i * 47) * 0.024) * 2.2 * (f < t0(i) ? 1 : 0);
						const nm = FILES[i].name;
						return (
							<g key={i} transform={`translate(${p.x} ${p.y + bob + (1 - inU) * 46}) scale(${p.sc * lerp(0.86, 1, inU)})`} opacity={p.op * clamp(inU * 1.4)}>
								<FileCard i={i} glow={p.glow} />
								{p.wash > 0.01 ? <path d={CARD} fill="#DCEBFF" opacity={p.wash * 0.75} /> : null}
								{p.beam < 0.5 ? (
									<g opacity={clamp(inU * 1.6) * (1 - p.glow * 0.55)}>
										<text x={0} y={158} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={19} letterSpacing={1.9} fill={INK}>
											{nm}
										</text>
									</g>
								) : null}
							</g>
						);
					})}
				</g>

				{/* ============================================================ cloud */}
				<g transform={`translate(${BX} ${CY}) scale(${cloudSc}) translate(${-BX} ${-CY})`} opacity={clamp(cloudIn * 1.5)}>
					<ellipse cx={BX} cy={CY + 10} rx={318} ry={172} fill="url(#gAcc)" opacity={0.35 + 0.3 * arrive + 0.35 * finale} />
					<g>
						<circle cx={BX - 100} cy={CY + 10} r={64} fill="url(#gCloud)" />
						<circle cx={BX - 26} cy={CY - 34} r={84} fill="url(#gCloud)" />
						<circle cx={BX + 58} cy={CY - 8} r={64} fill="url(#gCloud)" />
						<circle cx={BX + 124} cy={CY + 26} r={48} fill="url(#gCloud)" />
						<path d={rr(BX - 164, CY + 26, 336, 48, 24)} fill="url(#gCloud)" />
					</g>
					<g clipPath="url(#cpCloud)">
						<path d={rr(BX - 200, CY - 130, 400, 150, 0)} fill="url(#gCloudHi)" />
						<path d={rr(BX - 200, CY + 44, 400, 40, 0)} fill="#12305F" opacity={0.16} />
						{arrive > 0.01 ? <rect x={BX - 220} y={CY - 140} width={440} height={280} fill="#FFFFFF" opacity={arrive * 0.42} /> : null}
					</g>
					<text x={BX} y={CY + 18} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={62} letterSpacing={-1} fill="#FFFFFF">
						{Math.round(prog * 100) + '%'}
					</text>
					<text x={BX} y={CY + 50} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={14} letterSpacing={4.6} fill="#FFFFFF" opacity={0.72}>
						UPLOADED
					</text>
				</g>

				{/* pad label + rate */}
				<g opacity={Math.min(plate, ez(f, F_CLOUD + 6, F_CLOUD + 44, outCubic))}>
					<text x={BX} y={PAD_Y + 84} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={19} letterSpacing={3.2} fill={INK2}>
						{f >= F_LAST + 8 ? 'CLOUD STORAGE · SECURED' : 'CLOUD STORAGE'}
					</text>
					<text x={BX} y={PAD_Y + 112} textAnchor="middle" fontFamily="CuMono" fontWeight={500} fontSize={15} letterSpacing={1.4} fill={INK3}>
						{rate > 0 ? `${rate} MB/S · TLS 1.3` : 'IDLE · TLS 1.3'}
					</text>
				</g>

				{/* ============================================================ completion */}
				{doneOp > 0.004 ? (
					<g opacity={doneOp} transform={`translate(0 ${doneY})`}>
						<ellipse cx={620} cy={966} rx={300} ry={22} fill="url(#gShadow)" opacity={0.55} />
						<path d={rr(332, 894, 576, 76, 38)} fill="#FFFFFF" />
						<path d={rr(332, 894, 576, 76, 38)} fill="none" stroke="#E1E8F2" strokeWidth={2} />
						<circle cx={382} cy={932} r={19} fill={OKC} opacity={0.14} />
						<circle cx={382} cy={932} r={19} fill="none" stroke={OKC} strokeWidth={2.6} />
						<path
							d="M373 932.5L379.4 939L391.6 925.6"
							fill="none"
							stroke={OKC}
							strokeWidth={3.4}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={26}
							strokeDashoffset={26 * (1 - ez(f, F_DONE + 8, F_DONE + 34, outCubic))}
						/>
						<text x={416} y={940} fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={2.8} fill={INK}>
							SYNC COMPLETE
						</text>
						<path d="M672 912V952" stroke={LINE} strokeWidth={2} />
						<text x={698} y={940} fontFamily="CuMono" fontWeight={500} fontSize={19} letterSpacing={1.4} fill={OKC}>
							17.5 GB UPLOADED
						</text>
					</g>
				) : null}

				{/* ============================================================ footer */}
				<g opacity={chrome * 0.95}>
					<path d="M120 1002H1800" stroke={LINE} strokeWidth={2} />
					<text x={120} y={1040} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={3.4} fill={INK3}>
						QUEUE · UPLOAD · VERIFY
					</text>
					<text
						x={1800}
						y={1040}
						textAnchor="end"
						fontFamily="CuUI"
						fontWeight={700}
						fontSize={15}
						letterSpacing={3.4}
						fill={f >= F_LAST + 8 ? OKC : INK3}
					>
						{status}
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
