import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';

/**
 * MOTION 70 — "AI FILE SORTER · AUTO ORGANIZE"
 * ---------------------------------------------------------------------------
 * Twelve files land in a messy pile on a clean light workspace. A scan line
 * sweeps left to right; as it touches each file the engine tags it with a
 * category, and the file launches on an arc into the matching folder below.
 * The four folder counters climb, the pile empties, and the panel reports the
 * sort.
 *
 * Third piece in the same design system as MOTION 68 and MOTION 69 — same
 * plate, panel chrome, footer, shadow language and folder construction — so
 * all three cut together as a set.
 *
 * HOW IT IS BUILT
 * ---------------------------------------------------------------------------
 * [int] Original build, no reference clip. What follows is why each decision
 *       was made rather than what was measured off frames.
 *
 * [int] THE SCAN DRIVES EVERYTHING. Tag times are not authored — each file's
 *       tag frame is solved from its own x against the sweep, so the beam can
 *       never pass a file without lighting it or light one it has not reached.
 *       Move a card in the pile and its whole cue shifts with it. The twelve
 *       pile positions were then chosen to have twelve DISTINCT x values about
 *       100 px apart, which spaces the tags roughly 34 frames apart at the
 *       sweep's 2.94 px/frame — close enough that two files are always in the
 *       air, far enough apart that each tag reads as its own event.
 * [int] The categories cycle IMAGES / VIDEO / DOCS / ARCHIVE down the sorted-by-x
 *       order rather than being grouped, so consecutive flights cross the frame
 *       in different directions instead of stacking into one corridor. That
 *       crossing is most of what sells "sorting" rather than "moving".
 * [int] Each file waits 18 frames between tag and launch. Without that beat the
 *       detection box has no time to read and the sort looks like a reflex; with
 *       it, the engine appears to decide.
 * [int] Files insert BEHIND the folder flap. All four folder backs are drawn,
 *       then every file in flight, then all four flaps — so a card is in front
 *       of the folder as it descends and hidden the instant it drops past the
 *       flap's top edge, without any per-file clipping.
 * [int] The folders are the MOTION 68 folder, re-tinted per category from one
 *       shared path pair at 0.78 scale. Same construction: back panel with tab,
 *       paper sheets, front flap carrying its own sheen and bottom shade, and a
 *       radial-gradient contact shadow rather than a Gaussian filter — nothing
 *       in the frame depends on the renderer's filter resolution.
 * [int] Unscanned files sit at 0.94 opacity and lift to full when tagged. It is
 *       a small difference, but it is what makes the swept region read as
 *       "already processed" without adding a tint wash over half the plate.
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

if (typeof document !== 'undefined' && !document.getElementById('m70-faces')) {
	const st = document.createElement('style');
	st.id = 'm70-faces';
	st.textContent = FACE;
	document.head.appendChild(st);
}

const useFaces = () => {
	const [handle] = useState(() => delayRender('m70 fonts'));
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

/* folder, inherited from MOTION 68 */
const FLAP =
	'M-118 -18H118Q125 -18 125.6 -11.2L114 59Q112.4 71.6 99.8 71.6H-99.8Q-112.4 71.6 -114 59L-125.6 -11.2Q-125 -18 -118 -18Z';
const BACKP =
	'M-115 -44V-64A13 13 0 0 1 -102 -77H-44A13 13 0 0 1 -33.6 -71.8L-21 -55A13 13 0 0 0 -10.6 -49.8H101A13 13 0 0 1 114 -36.8V58A13 13 0 0 1 101 71H-102A13 13 0 0 1 -115 58Z';

const FSC = 0.78; /* folder scale */
const FOLDER_Y = 800;
const FOLDER_X = [480, 800, 1120, 1440];

/* scan sweep */
const SX0 = 250;
const SX1 = 1720;
const F_SCAN0 = 160;
const F_SCAN1 = 660;
const SCAN_TOP = 266;
const SCAN_BOT = 714;
const scanX = (f: number) => lerp(SX0, SX1, seg(f, F_SCAN0, F_SCAN1));

/* cue offsets */
const D_LAUNCH = 18;
const D_FLY = 56;
const D_INSERT = 15; /* final frames of the flight, spent dropping behind the flap */

/* ------------------------------------------------------------------ files */
type Cat = 0 | 1 | 2 | 3;
const CATS = [
	{key: 'IMAGES', col: '#2B7FFF', b0: '#5291F4', b1: '#2A5EC2', f0: '#86B7FF', f1: '#4F8DF4', f2: '#2C68D8', hi: '#B8D5FF'},
	{key: 'VIDEO', col: '#7C4DFF', b0: '#9878FF', b1: '#5A32D2', f0: '#B9A0FF', f1: '#8A5CFF', f2: '#6435D8', hi: '#DCCDFF'},
	{key: 'DOCS', col: '#F5811F', b0: '#FFA45A', b1: '#D3690F', f0: '#FFC38C', f1: '#FF9440', f2: '#E0761A', hi: '#FFDCBB'},
	{key: 'ARCHIVE', col: '#0FA862', b0: '#3ACB8B', b1: '#0A8850', f0: '#6FE0AE', f1: '#20BB77', f2: '#0D9558', hi: '#B6F0D6'},
];

type FileDef = {p: [number, number]; rot: number; cat: Cat; name: string; ext: string; thumb: 0 | 1 | 2};
const FILES: FileDef[] = [
	{p: [360, 390], rot: -11, cat: 0, name: 'SHOT_01', ext: 'JPG', thumb: 1},
	{p: [400, 620], rot: 9, cat: 2, name: 'BRIEF', ext: 'PDF', thumb: 0},
	{p: [520, 505], rot: -5, cat: 1, name: 'CLIP_A', ext: 'MP4', thumb: 2},
	{p: [640, 620], rot: 14, cat: 3, name: 'BACKUP', ext: 'ZIP', thumb: 0},
	{p: [690, 390], rot: 6, cat: 0, name: 'HERO', ext: 'PNG', thumb: 1},
	{p: [850, 505], rot: -13, cat: 2, name: 'NOTES', ext: 'DOC', thumb: 0},
	{p: [960, 620], rot: 4, cat: 1, name: 'REEL', ext: 'MOV', thumb: 2},
	{p: [1010, 390], rot: -8, cat: 3, name: 'ASSETS', ext: 'RAR', thumb: 0},
	{p: [1170, 505], rot: 12, cat: 0, name: 'LOGO', ext: 'SVG', thumb: 1},
	{p: [1290, 620], rot: -6, cat: 2, name: 'SHEET', ext: 'XLS', thumb: 0},
	{p: [1330, 390], rot: 10, cat: 1, name: 'TEASER', ext: 'MP4', thumb: 2},
	{p: [1490, 505], rot: -10, cat: 3, name: 'OLD', ext: '7Z', thumb: 0},
];

/* every cue is solved from the sweep, never authored */
const TAG: number[] = FILES.map((F) => F_SCAN0 + ((F.p[0] - SX0) / (SX1 - SX0)) * (F_SCAN1 - F_SCAN0));
const LAUNCH = TAG.map((t) => t + D_LAUNCH);
const LAND = LAUNCH.map((t) => t + D_FLY);
const F_LAST = Math.max(...LAND);
const F_DONE = 736;

/* palette */
const INK = '#16233A';
const INK2 = '#5D6C86';
const INK3 = '#96A3B8';
const LINE = '#DCE3EE';
const ACC = '#1D6BFF';
const OKC = '#12B26A';

/* ------------------------------------------------------------------ pieces */

const FileCard: React.FC<{i: number; tag: number}> = ({i, tag}) => {
	const F = FILES[i];
	const C = CATS[F.cat];
	const chipW = F.ext.length * 10 + 22;
	return (
		<g>
			<ellipse cx={0} cy={94} rx={64} ry={11} fill="url(#gShadow)" opacity={0.5} />
			<path d={CARD} fill="#FFFFFF" />
			<path d={CARD} fill="url(#gCardV)" />
			<path d={CARD} fill="none" stroke="#E3E9F3" strokeWidth={1.8} />
			<path d="M38 -81L64 -55H38Z" fill="#D5E0EF" />
			<path d="M38 -81V-55H64" fill="none" stroke="#C3D1E4" strokeWidth={1.8} strokeLinejoin="round" />
			{F.thumb === 0 ? (
				<g>
					<path d={rr(-44, -60, 62, 9, 4.5)} fill={C.col} opacity={0.5} />
					{[0, 1, 2, 3].map((k) => (
						<path key={k} d={rr(-44, -38 + k * 18, [88, 74, 88, 62][k], 8, 4)} fill="#E5EBF5" />
					))}
				</g>
			) : (
				<g>
					<path d={rr(-47, -64, 94, 52, 8)} fill={`url(#gT${i})`} />
					{F.thumb === 2 ? (
						<g>
							<circle cx={0} cy={-38} r={13} fill="#FFFFFF" opacity={0.92} />
							<path d="M-4.5 -45L8 -38L-4.5 -31Z" fill={C.col} />
						</g>
					) : (
						<g>
							<circle cx={24} cy={-50} r={6.5} fill="#FFFFFF" opacity={0.85} />
							<path d="M-47 -25L-19 -47L-2 -33L14 -45L47 -25V-20A8 8 0 0 1 39 -12H-39A8 8 0 0 1 -47 -20Z" fill="#FFFFFF" opacity={0.55} />
						</g>
					)}
					<path d={rr(-44, -2, 88, 8, 4)} fill="#E5EBF5" />
					<path d={rr(-44, 14, 66, 8, 4)} fill="#E5EBF5" />
				</g>
			)}
			<path d={rr(-44, 44, chipW, 24, 7)} fill={C.col} opacity={0.15} />
			<text x={-44 + chipW / 2} y={61} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={13} letterSpacing={1.1} fill={C.col}>
				{F.ext}
			</text>
			{/* detection frame */}
			{tag > 0.004 ? (
				<g opacity={tag}>
					<path d={rr(-76, -93, 152, 186, 14)} fill={C.col} opacity={0.06} />
					<path d={rr(-76, -93, 152, 186, 14)} fill="none" stroke={C.col} strokeWidth={2.6} />
					{[
						[-76, -93],
						[76, -93],
						[-76, 93],
						[76, 93],
					].map(([hx, hy], k) => (
						<rect key={k} x={hx - 4.5} y={hy - 4.5} width={9} height={9} rx={2} fill="#FFFFFF" stroke={C.col} strokeWidth={2.2} />
					))}
				</g>
			) : null}
		</g>
	);
};

const FolderBack: React.FC<{c: number}> = ({c}) => (
	<g>
		<ellipse cx={0} cy={96} rx={104} ry={15} fill="url(#gShadow)" opacity={0.6} />
		<path d={BACKP} fill={`url(#gB${c})`} />
		<path d={rr(-88, -40, 176, 96, 7)} fill="#FFFFFF" />
		<path d={rr(-88, -40, 176, 96, 7)} fill="url(#gPaper)" />
		<path d={rr(-79, -30, 158, 86, 6)} fill="#F3F7FC" />
		<path d="M-68 -16H34" stroke="#D7E2F2" strokeWidth={4.5} strokeLinecap="round" />
		<path d="M-68 -1H12" stroke="#E3EBF7" strokeWidth={4.5} strokeLinecap="round" />
	</g>
);

const FolderFront: React.FC<{c: number}> = ({c}) => (
	<g>
		<path d={FLAP} fill={`url(#gF${c})`} />
		<path d={FLAP} fill="url(#gSheen)" />
		<path d={FLAP} fill="url(#gFlapShade)" />
		<path d="M-115 -15.6H115" stroke={CATS[c].hi} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
	</g>
);

/* ------------------------------------------------------------------ main */
export const Motion: React.FC = () => {
	useFaces();
	const f = useCurrentFrame();

	const plate = ez(f, 0, 34, outCubic);
	const chrome = ez(f, 8, 46, outCubic);
	const beamOn = ez(f, F_SCAN0 - 22, F_SCAN0 + 10, outCubic) * (1 - ez(f, F_SCAN1, F_SCAN1 + 40, inOutCubic));
	const sx = scanX(f);

	/* ---------------- per-file transport ---------------- */
	const pose = (i: number) => {
		const F = FILES[i];
		const C = FILES[i].cat;
		const tagU = ez(f, TAG[i], TAG[i] + 9, outBack) * (1 - ez(f, LAUNCH[i], LAUNCH[i] + 8, outCubic));
		if (f < LAUNCH[i]) {
			const pop = ez(f, TAG[i], TAG[i] + 10, outBack) * (1 - ez(f, TAG[i] + 10, LAUNCH[i], outCubic));
			return {
				x: F.p[0],
				y: F.p[1] - 12 * pop,
				rot: F.rot * (1 - 0.25 * pop),
				sc: 1 + 0.06 * pop,
				op: f >= TAG[i] ? 1 : 0.94,
				tag: tagU,
				done: 0,
			};
		}
		const u = ez(f, LAUNCH[i], LAND[i] - D_INSERT, inOutCubic);
		const ins = ez(f, LAND[i] - D_INSERT, LAND[i], inCubic);
		const tx = FOLDER_X[C];
		return {
			x: lerp(F.p[0], tx, u),
			y: lerp(F.p[1], FOLDER_Y - 96, u) - 150 * Math.sin(Math.PI * u) + ins * 108,
			rot: F.rot * (1 - u),
			sc: lerp(1, 0.58, u) * (1 - 0.42 * ins),
			op: 1,
			tag: tagU,
			done: ins,
		};
	};

	const countOf = (c: number) => FILES.filter((F, i) => F.cat === c && f >= LAND[i]).length;
	const nDone = FILES.filter((_x, i) => f >= LAND[i]).length;
	const nTag = FILES.filter((_x, i) => f >= TAG[i]).length;
	const prog = nDone / 12;

	const chip = f >= F_LAST + 8 ? 'ORGANIZED' : f >= F_SCAN0 - 20 ? (nTag > nDone ? 'SORTING' : 'SCANNING') : 'READY';
	const chipCol = f >= F_LAST + 8 ? OKC : f >= F_SCAN0 - 20 ? ACC : INK3;
	const doneOp = ez(f, F_DONE, F_DONE + 30, outCubic);
	const doneY = lerp(32, 0, ez(f, F_DONE, F_DONE + 36, outQuint));
	const status =
		f >= F_LAST + 8
			? 'ALL FILES ORGANIZED'
			: f >= F_SCAN0
				? `CLASSIFYING · ${nTag} OF 12 ANALYZED`
				: 'NEURAL CLASSIFIER · READY';

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
					<linearGradient id="gCardV" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="1" stopColor="#D8E1EF" stopOpacity="0.55" />
					</linearGradient>
					<linearGradient id="gPaper" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="1" stopColor="#C9D7EA" stopOpacity="0.9" />
					</linearGradient>
					<linearGradient id="gSheen" x1="0.06" y1="0" x2="0.72" y2="1">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity="0.34" />
						<stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0.04" />
						<stop offset="0.36" stopColor="#FFFFFF" stopOpacity="0.19" />
						<stop offset="0.58" stopColor="#FFFFFF" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="gFlapShade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0.62" stopColor="#0B2A5E" stopOpacity="0" />
						<stop offset="1" stopColor="#0B2A5E" stopOpacity="0.2" />
					</linearGradient>
					{CATS.map((C, c) => (
						<React.Fragment key={c}>
							<linearGradient id={`gB${c}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0" stopColor={C.b0} />
								<stop offset="1" stopColor={C.b1} />
							</linearGradient>
							<linearGradient id={`gF${c}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0" stopColor={C.f0} />
								<stop offset="0.5" stopColor={C.f1} />
								<stop offset="1" stopColor={C.f2} />
							</linearGradient>
							<radialGradient id={`gG${c}`} cx="0.5" cy="0.5" r="0.5">
								<stop offset="0" stopColor={C.col} stopOpacity="0.5" />
								<stop offset="1" stopColor={C.col} stopOpacity="0" />
							</radialGradient>
						</React.Fragment>
					))}
					{FILES.map((F, i) =>
						F.thumb === 0 ? null : (
							<linearGradient key={i} id={`gT${i}`} x1="0" y1="0" x2="0.7" y2="1">
								<stop offset="0" stopColor={CATS[F.cat].col} stopOpacity="0.85" />
								<stop offset="1" stopColor={CATS[F.cat].col} stopOpacity="0.45" />
							</linearGradient>
						)
					)}
					<linearGradient id="gScanTrail" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#2E7BFF" stopOpacity="0" />
						<stop offset="1" stopColor="#2E7BFF" stopOpacity="0.13" />
					</linearGradient>
					<linearGradient id="gScanV" x1="0" y1={SCAN_TOP} x2="0" y2={SCAN_BOT} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#2E7BFF" stopOpacity="0" />
						<stop offset="0.16" stopColor="#2E7BFF" stopOpacity="1" />
						<stop offset="0.84" stopColor="#2E7BFF" stopOpacity="1" />
						<stop offset="1" stopColor="#2E7BFF" stopOpacity="0" />
					</linearGradient>
				</defs>

				{/* ============================================================ plate */}
				<rect width={W} height={H} fill="url(#gPlate)" />
				<ellipse cx={900} cy={340} rx={1220} ry={740} fill="url(#gLift)" opacity={plate} />

				{/* ============================================================ title */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-16, 0, chrome)})`}>
					<path d="M620 66H756" stroke={LINE} strokeWidth={2} />
					<path d="M1164 66H1300" stroke={LINE} strokeWidth={2} />
					<text x={960} y={73} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={5.6} fill={INK2}>
						AI FILE SORTER · AUTO ORGANIZE
					</text>
				</g>

				{/* ============================================================ panel */}
				<g opacity={chrome} transform={`translate(0 ${lerp(-22, 0, chrome)})`}>
					<ellipse cx={960} cy={200} rx={470} ry={26} fill="url(#gShadow)" opacity={0.5} />
					<path d={rr(480, 108, 960, 84, 20)} fill="#FFFFFF" />
					<path d={rr(480, 108, 960, 84, 20)} fill="none" stroke="#E4EAF4" strokeWidth={2} />

					{/* sparkle glyph */}
					<g transform="translate(524 150)">
						<path d="M0 -22L5.4 -6.2L21 -1L5.4 4.2L0 20L-5.4 4.2L-21 -1L-5.4 -6.2Z" fill={ACC} opacity={0.9} />
						<path d="M20 -20L22.6 -13.4L29 -11L22.6 -8.6L20 -2L17.4 -8.6L11 -11L17.4 -13.4Z" fill={ACC} opacity={0.55} />
					</g>
					<text x={572} y={144} fontFamily="CuUI" fontWeight={700} fontSize={20} letterSpacing={2.6} fill={INK}>
						SORTING ENGINE
					</text>
					<text x={572} y={172} fontFamily="CuMono" fontWeight={500} fontSize={14} letterSpacing={1.6} fill={INK3}>
						12 FILES · 4 CATEGORIES
					</text>

					<g transform="translate(818 0)">
						<path d={rr(0, 134, chip.length * 12.2 + 40, 32, 16)} fill={chipCol} opacity={0.13} />
						<circle cx={20} cy={150} r={5} fill={chipCol} />
						<text x={36} y={156} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={chipCol}>
							{chip}
						</text>
					</g>

					<g transform="translate(1050 150)">
						{FILES.map((F, i) => {
							const landed = f >= LAND[i];
							const seen = f >= TAG[i];
							return (
								<circle
									key={i}
									cx={i * 20}
									cy={0}
									r={landed ? 6.4 : 5.4}
									fill={landed ? CATS[F.cat].col : seen ? ACC : '#C7D2E2'}
									opacity={landed ? 1 : seen ? 0.75 : 0.55}
								/>
							);
						})}
					</g>

					<g transform="translate(1288 0)">
						<text x={0} y={141} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={2.2} fill={INK2}>
							SORTED
						</text>
						<text x={132} y={141} textAnchor="end" fontFamily="CuMono" fontWeight={500} fontSize={15} letterSpacing={1} fill={prog > 0.995 ? OKC : INK}>
							{`${nDone}/12`}
						</text>
						<path d={rr(0, 152, 132, 8, 4)} fill="#E6EBF4" />
						<path d={rr(0, 152, Math.max(2, 132 * prog), 8, 4)} fill={prog > 0.995 ? OKC : ACC} />
					</g>
				</g>

				{/* ============================================================ scan */}
				{beamOn > 0.004 ? (
					<g opacity={beamOn}>
						<rect x={sx - 300} y={SCAN_TOP} width={300} height={SCAN_BOT - SCAN_TOP} fill="url(#gScanTrail)" />
						<rect x={sx - 26} y={SCAN_TOP} width={52} height={SCAN_BOT - SCAN_TOP} fill="url(#gScanV)" opacity={0.1} />
						<rect x={sx - 11} y={SCAN_TOP} width={22} height={SCAN_BOT - SCAN_TOP} fill="url(#gScanV)" opacity={0.22} />
						<rect x={sx - 2.2} y={SCAN_TOP} width={4.4} height={SCAN_BOT - SCAN_TOP} fill="url(#gScanV)" opacity={0.95} />
						{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
							const y = SCAN_TOP + 24 + ((f * 3.4 + k * 62) % (SCAN_BOT - SCAN_TOP - 48));
							return <rect key={k} x={sx - 16} y={y} width={32} height={2.4} rx={1.2} fill="#FFFFFF" opacity={0.5} />;
						})}
						<g transform={`translate(${sx} ${SCAN_BOT})`}>
							<path d="M0 24L12 12L0 0L-12 12Z" fill={ACC} />
							<path d="M-30 12H-18M18 12H30" stroke={ACC} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
						</g>
					</g>
				) : null}

				{/* ============================================================ folder backs */}
				<g>
					{CATS.map((C, c) => {
						const inU = ez(f, 56 + c * 8, 56 + c * 8 + 34, outBack);
						if (inU <= 0.002) return null;
						const last = FILES.reduce((a, F, i) => (F.cat === c && f >= LAND[i] ? Math.max(a, LAND[i]) : a), -999);
						const hit = ez(f, last, last + 10, outCubic) * (1 - ez(f, last + 10, last + 44, outQuint));
						return (
							<g key={c} transform={`translate(${FOLDER_X[c]} ${FOLDER_Y + (1 - inU) * 60}) scale(${FSC * lerp(0.86, 1, inU)} ${FSC * lerp(0.86, 1, inU) * (1 - 0.06 * hit)})`} opacity={clamp(inU * 1.4)}>
								<ellipse cx={0} cy={20} rx={150} ry={110} fill={`url(#gG${c})`} opacity={0.16 + 0.34 * hit} />
								<FolderBack c={c} />
							</g>
						);
					})}
				</g>

				{/* ============================================================ files */}
				<g>
					{[...FILES.keys()]
						.sort((a, b) => (f >= LAUNCH[a] ? 1 : 0) - (f >= LAUNCH[b] ? 1 : 0) || a - b)
						.map((i) => {
							const p = pose(i);
							const born = 12 + i * 6;
							const inU = ez(f, born, born + 30, outBack);
							if (inU <= 0.002 || p.op <= 0.004) return null;
							if (f >= LAND[i]) return null;
							return (
								<g
									key={i}
									transform={`translate(${p.x} ${p.y + (1 - inU) * 52}) rotate(${p.rot}) scale(${p.sc * lerp(0.86, 1, inU)})`}
									opacity={p.op * clamp(inU * 1.4)}
								>
									<FileCard i={i} tag={p.tag} />
								</g>
							);
						})}
				</g>

				{/* detection labels sit above the pile, unrotated */}
				<g>
					{FILES.map((F, i) => {
						const a = ez(f, TAG[i] + 2, TAG[i] + 11, outCubic) * (1 - ez(f, LAUNCH[i], LAUNCH[i] + 8, outCubic));
						if (a <= 0.004) return null;
						const C = CATS[F.cat];
						const label = `${F.name}.${F.ext}`;
						const wl = label.length * 11.4 + C.key.length * 11.4 + 108;
						return (
							<g key={i} opacity={a} transform={`translate(${F.p[0]} ${F.p[1] - 100 - 10 * a})`}>
								<path d={rr(-wl / 2, -19, wl, 38, 19)} fill="#FFFFFF" />
								<path d={rr(-wl / 2, -19, wl, 38, 19)} fill="none" stroke={C.col} strokeWidth={2.2} />
								<text x={-wl / 2 + 20} y={6} fontFamily="CuUI" fontWeight={700} fontSize={16} letterSpacing={1.5} fill={INK}>
									{label}
								</text>
								<text x={wl / 2 - 20} y={6} textAnchor="end" fontFamily="CuUI" fontWeight={700} fontSize={16} letterSpacing={1.5} fill={C.col}>
									{`→ ${C.key}`}
								</text>
							</g>
						);
					})}
				</g>

				{/* ============================================================ folder fronts */}
				<g>
					{CATS.map((C, c) => {
						const inU = ez(f, 56 + c * 8, 56 + c * 8 + 34, outBack);
						if (inU <= 0.002) return null;
						const last = FILES.reduce((a, F, i) => (F.cat === c && f >= LAND[i] ? Math.max(a, LAND[i]) : a), -999);
						const hit = ez(f, last, last + 10, outCubic) * (1 - ez(f, last + 10, last + 44, outQuint));
						const n = countOf(c);
						return (
							<g key={c} opacity={clamp(inU * 1.4)}>
								<g transform={`translate(${FOLDER_X[c]} ${FOLDER_Y + (1 - inU) * 60}) scale(${FSC * lerp(0.86, 1, inU)} ${FSC * lerp(0.86, 1, inU) * (1 - 0.06 * hit)})`}>
									<FolderFront c={c} />
								</g>
								<g transform={`translate(${FOLDER_X[c]} ${FOLDER_Y + (1 - inU) * 60})`}>
									<text x={0} y={118} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={19} letterSpacing={2.6} fill={INK}>
										{C.key}
									</text>
									<g transform={`translate(-8 154) scale(${1 + 0.3 * hit})`}>
										<text x={0} y={0} textAnchor="end" fontFamily="CuUI" fontWeight={700} fontSize={28} fill={C.col}>
											{n}
										</text>
									</g>
									<text x={4} y={154} fontFamily="CuUI" fontWeight={700} fontSize={14} letterSpacing={2.4} fill={INK3}>
										FILES
									</text>
									{hit > 0.01 ? (
										<text x={98} y={150 - 26 * (1 - hit)} textAnchor="middle" fontFamily="CuUI" fontWeight={700} fontSize={19} fill={C.col} opacity={hit}>
											+1
										</text>
									) : null}
								</g>
							</g>
						);
					})}
				</g>

				{/* ============================================================ completion */}
				{doneOp > 0.004 ? (
					<g opacity={doneOp} transform={`translate(0 ${doneY})`}>
						<ellipse cx={960} cy={472} rx={320} ry={24} fill="url(#gShadow)" opacity={0.55} />
						<path d={rr(624, 400, 672, 76, 38)} fill="#FFFFFF" />
						<path d={rr(624, 400, 672, 76, 38)} fill="none" stroke="#E1E8F2" strokeWidth={2} />
						<circle cx={674} cy={438} r={19} fill={OKC} opacity={0.14} />
						<circle cx={674} cy={438} r={19} fill="none" stroke={OKC} strokeWidth={2.6} />
						<path
							d="M665 438.5L671.4 445L683.6 431.6"
							fill="none"
							stroke={OKC}
							strokeWidth={3.4}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={26}
							strokeDashoffset={26 * (1 - ez(f, F_DONE + 8, F_DONE + 34, outCubic))}
						/>
						<text x={708} y={446} fontFamily="CuUI" fontWeight={700} fontSize={21} letterSpacing={2.8} fill={INK}>
							WORKSPACE ORGANIZED
						</text>
						<path d="M1044 418V458" stroke={LINE} strokeWidth={2} />
						<text x={1070} y={446} fontFamily="CuMono" fontWeight={500} fontSize={19} letterSpacing={1.4} fill={OKC}>
							12 FILES SORTED
						</text>
					</g>
				) : null}

				{/* ============================================================ footer */}
				<g opacity={chrome * 0.95}>
					<path d="M120 1002H1800" stroke={LINE} strokeWidth={2} />
					<text x={120} y={1040} fontFamily="CuUI" fontWeight={700} fontSize={15} letterSpacing={3.4} fill={INK3}>
						SCAN · CLASSIFY · FILE
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
