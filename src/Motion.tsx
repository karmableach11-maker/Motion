import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION 61 — "CHALKBOARD FLY-THROUGH · CHEMISTRY"
 * ---------------------------------------------------------------------------
 * A forward dolly through a deep field of hand-written chemistry on a green
 * classroom board. Companion piece to the mathematics plate: identical camera,
 * identical board, twenty-four different cards.
 *
 * WHAT WAS MEASURED, AND WHAT WAS INFERRED
 * ----------------------------------------
 * The camera is not invented. It was fitted to a reference fly-through
 * (700x394, 60 fps, 720 frames, 12.000 s, one continuous take) and every
 * constant below is carried over unchanged from that fit. [obs] marks what
 * came off the frames; [int] marks an inference.
 *
 * [obs] The move is a pure forward dolly. Fitting a radial flow field to every
 *       tracked patch (dx = k*x + c1, dy = k*y + c2, one shared k) put the
 *       focus of expansion at (355.8, 199.9) averaged over twelve samples
 *       across the clip, against a frame centre of (350, 197) — dead centre,
 *       within 6 px. Residual rms 4.24 px.
 * [obs] No roll. Log-polar rotation per 6-frame step stayed within ±0.038 deg,
 *       which is the noise floor of the method.
 * [obs] The rate is constant, not eased: refitting every 60 frames gave
 *       scale/s of 1.2925, 1.2662, 1.2995, 1.3209, 1.2380, 1.2819, 1.2842,
 *       1.2908, 1.2836, 1.3338, 1.2675, 1.2657 — mean 1.284, no trend.
 * [obs] There IS parallax, and it is large. Sorting tracked patches by their
 *       own contrast (faint = far) and refitting each third separately gave
 *       1.128 / 1.351 / 1.638 per second. A flat 2D zoom cannot do that.
 *       Under a constant-velocity dolly an element's expansion rate is v/z,
 *       so those three numbers pin the depth ratio at ln1.638/ln1.128 = 4.1
 *       and the velocity at 0.494 z-units/s.
 * [obs] Faintness is the depth cue and the only one — no blur, no colour
 *       shift. The nearest, largest formulas are as sharp as the small ones,
 *       so there is no depth of field here either.
 * [obs] Ink covered 1.7% of the reference frame below luminance 110 and 10.8%
 *       below 225: a deep, populous haze of faint distant writing with only a
 *       few bold pieces near the lens. That ratio is what sets the pool size
 *       and the depth-dimming curve below.
 * [obs] Stroke half-width from a distance transform: 0.95 px median, 1.37 px
 *       at p90, at 700 wide — roughly 2 px far against 5-6 px near, a 2.7x
 *       spread across a 4.9x size range. Pen weight therefore grows
 *       sub-linearly with the element, which is why stroke width is
 *       pre-divided by s^0.38 before the transform scales it.
 * [obs] It does not loop: phaseCorrelate(frame 0, frame 719) responded at
 *       0.446 and the two differed by 20.08 mean abs against 18.95 for two
 *       adjacent frames. So the reference is open-ended, and so is this.
 * [int] The board, the chalk, the dust and the eraser smears are a design
 *       choice, not a measurement — the reference is a white sheet.
 *
 * VERIFICATION OF THE MATHEMATICS PLATE THIS INHERITS FROM
 * -------------------------------------------------------
 * Re-running the reference's own measurements on the finished render gave
 * scale/s = 1.3137 (sd 0.045) against the reference's 1.284 (sd 0.026), a
 * focus of expansion 3.6 px right and 28.6 px above frame centre — inside the
 * reference's own ±68 px scatter — and parallax thirds of 1.107 / 1.246 /
 * 1.536 against 1.128 / 1.351 / 1.638.
 *
 * SOURCES
 * -------
 * Font   Patrick Hand, SIL Open Font License 1.1, from google/fonts ofl/.
 *        Chosen over Caveat and Architect's Daughter because it is the only
 *        one of the three that carries π, ², ³, ± and × — and because its
 *        upright print hand is the closest match to the reference's writing.
 *        Subset to the characters actually used and embedded, so the file
 *        renders with no network and no external asset.
 * Art    Every formula, structure and vessel is drawn here from scratch.
 *        Reaction arrows, the equilibrium pair, the delta and the radical
 *        hooks are paths rather than glyphs — no handwriting face carries
 *        them, and a drawn one matches the chalk better in any case.
 */

const FONT_HAND =
	'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';

/* ------------------------------------------------------------------ setup */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => smooth(clamp((f - a) / (b - a), 0, 1));
const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

const FACE = `@font-face{font-family:'ChalkHand';src:url(data:font/woff2;base64,${FONT_HAND}) format('woff2');font-weight:400;font-style:normal;font-display:block}`;
if (typeof document !== 'undefined' && !document.getElementById('m61-face')) {
	const st = document.createElement('style');
	st.id = 'm61-face';
	st.textContent = FACE;
	document.head.appendChild(st);
}

const useChalkFont = () => {
	const [handle] = useState(() => delayRender('m61 font'));
	const done = useRef(false);
	useEffect(() => {
		const fin = () => {
			if (!done.current) {
				done.current = true;
				continueRender(handle);
			}
		};
		const d: any = typeof document === 'undefined' ? null : document;
		if (d && d.fonts && d.fonts.check && d.fonts.check("400 40px 'ChalkHand'")) {
			fin();
			return;
		}
		if (d && d.fonts && d.fonts.load) d.fonts.load("400 40px 'ChalkHand'").then(fin).catch(fin);
		else fin();
		const id = setTimeout(fin, 700);
		return () => {
			clearTimeout(id);
			fin();
		};
	}, [handle]);
};

/* --------------------------------------------------------- the depth field */

/* [obs] the three contrast thirds of the reference expand at 1.128 / 1.351 /
   1.638 per second. Under a constant-velocity dolly an element's expansion
   rate is v/z, so those three numbers fix the whole camera: a depth range of
   about 4.1:1 travelled at v = 0.494 z-units per second. Check:
     z=4.25 -> e^(0.494/4.25) = 1.123      (faint third, measured 1.128)
     z=2.06 -> e^(0.494/2.06) = 1.271      (whole frame,  measured 1.284)
     z=1.00 -> e^(0.494/1.00) = 1.639      (bold third,   measured 1.638)   */
/* The depth RATIO is fixed by the parallax measurement — ln(1.638)/ln(1.128) =
   4.1 between the bold and faint thirds. Where that window sits along z is not,
   and it is what sets the overall rate: rendering a first pass at z = 4.5..0.92
   measured 1.15/s against the reference's 1.284/s, because the visible
   population of a frustum skews far (an element only stays in frame while its
   spawn radius times Z_FAR/z is inside it, so the far ones are over-represented
   by (z/Z_FAR)^2). The visibility-weighted mean depth there was 3.40; the
   reference's global rate implies 1.98. So the whole window slides in by
   1.98/3.40 = 0.5815, ratio untouched. */
const Z_FAR = 2.617;
const Z_CUT = 0.535;
const VEL = 0.494 / 60; // z-units per frame
const T_CYCLE = (Z_FAR - Z_CUT) / VEL; // 252.8 frames for one traverse
const SBASE = 0.5525; // z-units -> px, shared by size and position so the field stays rigid
const CX = 960;
const CY = 540;
/* Of a pool this size only ~41% are inside the frustum at any moment — objects
   enter across the whole far plane and the ones off-axis have spread past the
   frame edge long before they reach the near plane. The pool has to be this
   large for the frame to carry the ~90 the reference does — and because the
   biggest elements are the rare ones that entered near the axis and survived
   the whole traverse, a bigger pool is the only way to get more of them. */
const N_EL = 720;
/* [obs] stroke half-width in the reference is 0.95 px median / 1.37 px at p90
   at 700 wide, i.e. roughly 2 px far and 5-6 px near at 1920 — a 2.7x spread
   across a 4.9x size range. Pen weight therefore grows sub-linearly with the
   element, so the width is pre-divided by s^0.38 before the transform scales
   it, landing on s^0.62. */
const SW = 5.95;

const CHALK = '#f4f8f0';

/* ---------------------------------------------------------- drawing helpers */

/* nothing here is allowed to be machine-straight: every line gets a midpoint
   nudge, seeded off its own index so the wobble is the same on every frame */
const wob = (seed: number, i: number, amp: number) => (hash(seed * 31.7 + i * 7.3) - 0.5) * amp;
const ln = (x1: number, y1: number, x2: number, y2: number, s: number, amp = 2.6) =>
	`M${x1} ${y1}Q${(x1 + x2) / 2 + wob(s, 1, amp)} ${(y1 + y2) / 2 + wob(s, 2, amp)} ${x2} ${y2}`;
const poly = (pts: number[][], s: number, close = false, amp = 2.6) => {
	let d = '';
	for (let i = 0; i < pts.length - 1; i++) d += ln(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], s + i, amp);
	if (close) d += ln(pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1], s + 99, amp);
	return d;
};

type TP = {x?: number; y?: number; s?: number; a?: 'start' | 'middle' | 'end'; i?: boolean};
const Tx: React.FC<TP & {children: React.ReactNode}> = ({x = 0, y = 0, s = 40, a = 'middle', i, children}) => (
	<text
		x={x}
		y={y}
		fontFamily="ChalkHand, sans-serif"
		fontSize={s}
		textAnchor={a}
		fill={CHALK}
		stroke="none"
		fontStyle={i ? 'italic' : undefined}
	>
		{children}
	</text>
);

/* --------------------------------------------------- chemistry helpers */

/* Subscripts and superscripts — the thing every chemical formula needs and no
   handwriting face provides. '_' marks the next character as a subscript, '^'
   as a superscript. Each tspan carries only the DELTA of the baseline shift,
   so a run returns to the line by itself and consecutive subscripts (the 12 in
   C₆H₁₂O₆) cost nothing. */
const Fm: React.FC<{t: string; s: number; x?: number; y?: number; a?: 'start' | 'middle' | 'end'}> = ({
	t,
	s,
	x = 0,
	y = 0,
	a = 'middle',
}) => {
	const segs: {t: string; k: number}[] = [];
	let buf = '';
	for (let i = 0; i < t.length; i++) {
		const c = t[i];
		if ((c === '_' || c === '^') && i + 1 < t.length) {
			if (buf) {
				segs.push({t: buf, k: 0});
				buf = '';
			}
			segs.push({t: t[i + 1], k: c === '_' ? 1 : -1});
			i++;
		} else buf += c;
	}
	if (buf) segs.push({t: buf, k: 0});
	let prev = 0;
	return (
		<text
			x={x}
			y={y}
			fontFamily="ChalkHand, sans-serif"
			fontSize={s}
			textAnchor={a}
			fill={CHALK}
			stroke="none"
		>
			{segs.map((g, i) => {
				const shift = g.k === 1 ? s * 0.26 : g.k === -1 ? -s * 0.38 : 0;
				const dy = shift - prev;
				prev = shift;
				return (
					<tspan key={i} fontSize={g.k ? s * 0.64 : s} dy={dy}>
						{g.t}
					</tspan>
				);
			})}
		</text>
	);
};

/* A reaction is laid out around its arrow rather than around its own centre:
   the left half is end-anchored and the right half start-anchored, so neither
   side needs its width measured. */
const Arrow: React.FC<{x: number; y: number; w: number; s: number}> = ({x, y, w, s}) => (
	<>
		<path d={ln(x, y, x + w - 12, y, s, 1.6)} fill="none" />
		<path d={`M${x + w} ${y}L${x + w - 17} ${y - 8}L${x + w - 17} ${y + 8}z`} fill={CHALK} stroke="none" />
	</>
);
const Equil: React.FC<{x: number; y: number; w: number; s: number}> = ({x, y, w, s}) => (
	<>
		<path d={ln(x, y - 6, x + w, y - 6, s, 1.4)} fill="none" />
		<path d={`M${x + w + 3} ${y - 6}L${x + w - 11} ${y - 12}L${x + w - 11} ${y - 6}z`} fill={CHALK} stroke="none" />
		<path d={ln(x + w, y + 7, x, y + 7, s + 1, 1.4)} fill="none" />
		<path d={`M${x - 3} ${y + 7}L${x + 11} ${y + 13}L${x + 11} ${y + 7}z`} fill={CHALK} stroke="none" />
	</>
);

const hex = (r: number, cx = 0, cy = 0, rot = 0) =>
	Array.from({length: 6}, (_, i) => {
		const a = rot + (i * Math.PI) / 3;
		return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
	});

/* the inner stroke of a double bond: inset along the edge, then pushed toward
   the ring centre by the normal */
const inner = (p: number[], q: number[], cx: number, cy: number, d: number) => {
	const ax = p[0] + (q[0] - p[0]) * 0.18;
	const ay = p[1] + (q[1] - p[1]) * 0.18;
	const bx = p[0] + (q[0] - p[0]) * 0.82;
	const by = p[1] + (q[1] - p[1]) * 0.82;
	const mx = (p[0] + q[0]) / 2 - cx;
	const my = (p[1] + q[1]) / 2 - cy;
	const L = Math.hypot(mx, my) || 1;
	return `M${ax - (mx / L) * d} ${ay - (my / L) * d}L${bx - (mx / L) * d} ${by - (my / L) * d}`;
};

/* a fraction: rule, numerator, denominator */
const Frac: React.FC<{x: number; y: number; w: number; s: number; children: React.ReactNode}> = ({
	x,
	y,
	w,
	s,
	children,
}) => (
	<>
		<path d={ln(x - w / 2, y, x + w / 2, y, s, 2.2)} fill="none" />
		{children}
	</>
);

const Delta: React.FC<{x: number; y: number; h: number; s: number}> = ({x, y, h, s}) => (
	<path
		d={poly([[x, y - h], [x - h * 0.62, y + h * 0.44], [x + h * 0.62, y + h * 0.44]], s, true, 1.2)}
		fill="none"
	/>
);

/* -------------------------------------------------------------- the cards */

/* Twenty-four pieces of blackboard, each drawn once into <defs> and then
   instanced by <use>. Instancing is what makes 720 of them affordable: the
   geometry is built one time and the browser only has to place a transform,
   and stroke width scales with that transform exactly as it does in the
   reference, where the big formulas are drawn with heavier lines. */
const Cards: React.FC = () => (
	<>
		<g id="k0">
			<Fm t="H_2O" s={54} />
		</g>
		<g id="k1">
			<Fm t="CO_2" s={48} />
		</g>
		<g id="k2">
			<Fm t="2H_2 + O_2" s={34} x={-36} a="end" />
			<Arrow x={-30} y={-10} w={58} s={201} />
			<Fm t="2H_2O" s={34} x={34} a="start" />
		</g>
		<g id="k3">
			<Fm t="CH_4 + 2O_2" s={30} x={-36} a="end" />
			<Arrow x={-30} y={-9} w={56} s={205} />
			<Fm t="CO_2 + 2H_2O" s={30} x={32} a="start" />
		</g>
		<g id="k4">
			<Fm t="N_2 + 3H_2" s={32} x={-38} a="end" />
			<Equil x={-32} y={-10} w={62} s={209} />
			<Fm t="2NH_3" s={32} x={36} a="start" />
		</g>
		<g id="k5">
			<Fm t="C_6H_1_2O_6" s={44} />
		</g>
		<g id="k6">
			<Fm t="PV = nRT" s={44} />
		</g>
		<g id="k7">
			<Fm t="pH = -log[H^+]" s={34} />
		</g>
		<g id="k8">
			<Fm t="n =" s={38} x={-74} a="end" />
			<Frac x={-24} y={0} w={54} s={213}>
				<Fm t="m" s={32} x={-24} y={-12} />
				<Fm t="M" s={32} x={-24} y={30} />
			</Frac>
		</g>
		<g id="k9">
			<Fm t="1s^2 2s^2 2p^6" s={34} />
		</g>
		<g id="k10">
			<Fm t="NaCl" s={32} x={-34} a="end" />
			<Arrow x={-28} y={-10} w={54} s={217} />
			<Fm t="Na^+ + Cl^-" s={32} x={32} a="start" />
		</g>
		<g id="k11">
			<Delta x={-88} y={-8} h={17} s={221} />
			<Fm t="H = -286 kJ" s={34} x={-72} a="start" />
		</g>
		<g id="k12">
			{/* benzene, delocalised ring */}
			<path d={poly(hex(46), 231, true)} fill="none" />
			<circle cx={0} cy={0} r={28} fill="none" />
		</g>
		<g id="k13">
			{/* the same ring drawn Kekule, alternating double bonds */}
			<path d={poly(hex(46), 241, true)} fill="none" />
			{[0, 2, 4].map((i) => {
				const p = hex(46);
				return <path key={i} d={inner(p[i], p[(i + 1) % 6], 0, 0, 9)} fill="none" />;
			})}
		</g>
		<g id="k14">
			{/* phenol: a ring with a hydroxyl */}
			<path d={poly(hex(40), 251, true)} fill="none" />
			{[1, 3, 5].map((i) => {
				const p = hex(40);
				return <path key={i} d={inner(p[i], p[(i + 1) % 6], 0, 0, 8)} fill="none" />;
			})}
			<path d={ln(20, -34.6, 46, -56, 255, 1.4)} fill="none" />
			<Fm t="OH" s={24} x={66} y={-52} a="start" />
		</g>
		<g id="k15">
			{/* naphthalene: two rings fused on a shared vertical edge */}
			<path d={poly(hex(40, -34.6, 0, Math.PI / 6), 261, true)} fill="none" />
			<path d={poly(hex(40, 34.6, 0, Math.PI / 6), 265, true)} fill="none" />
		</g>
		<g id="k16">
			{/* methane: two bonds in plane, one wedge forward, one hashed back */}
			<path d={ln(-13, -3, -50, -22, 271, 1.4)} fill="none" />
			<path d={ln(13, -3, 50, -22, 272, 1.4)} fill="none" />
			<path d="M-4 -12L4 -12L1 -44L-1 -44z" fill={CHALK} stroke="none" />
			<path d="M-3 20h6M-4.5 30h9M-6 40h12" fill="none" />
			<circle cx={0} cy={0} r={14} fill="none" />
			<Fm t="C" s={20} x={0} y={7} />
			<circle cx={-56} cy={-25} r={10} fill="none" />
			<circle cx={56} cy={-25} r={10} fill="none" />
			<circle cx={0} cy={-52} r={10} fill="none" />
			<circle cx={0} cy={50} r={10} fill="none" />
		</g>
		<g id="k17">
			{/* water: the bent molecule and its angle */}
			<path d={ln(-12, -8, -40, 22, 281, 1.4)} fill="none" />
			<path d={ln(12, -8, 40, 22, 282, 1.4)} fill="none" />
			<circle cx={0} cy={-18} r={16} fill="none" />
			<Fm t="O" s={22} x={0} y={-10} />
			<circle cx={-48} cy={30} r={11} fill="none" />
			<Fm t="H" s={17} x={-48} y={36} />
			<circle cx={48} cy={30} r={11} fill="none" />
			<Fm t="H" s={17} x={48} y={36} />
			<path d="M-19 6a26 26 0 0 0 38 0" fill="none" />
			<Fm t="105°" s={16} x={0} y={30} />
		</g>
		<g id="k18">
			{/* Bohr model: nucleus and two shells */}
			<ellipse cx={0} cy={0} rx={58} ry={22} fill="none" transform="rotate(28)" />
			<ellipse cx={0} cy={0} rx={58} ry={22} fill="none" transform="rotate(-28)" />
			<circle cx={0} cy={0} r={12} fill={CHALK} stroke="none" />
			<circle cx={49} cy={28} r={5} fill={CHALK} stroke="none" />
			<circle cx={-49} cy={28} r={5} fill={CHALK} stroke="none" />
			<circle cx={-14} cy={-30} r={5} fill={CHALK} stroke="none" />
		</g>
		<g id="k19">
			{/* Erlenmeyer flask */}
			<path d={ln(-13, -58, -13, -24, 291, 1.2)} fill="none" />
			<path d={ln(13, -58, 13, -24, 292, 1.2)} fill="none" />
			<path d={ln(-13, -58, 13, -58, 293, 1.2)} fill="none" />
			<path d={ln(-13, -24, -50, 44, 294, 1.8)} fill="none" />
			<path d={ln(13, -24, 50, 44, 295, 1.8)} fill="none" />
			<path d={ln(-50, 44, 50, 44, 296, 1.6)} fill="none" />
			<g clipPath="url(#m61flask)">
				<rect x={-52} y={8} width={104} height={40} fill="url(#m61hatch)" stroke="none" />
			</g>
			<path d={ln(-30, 10, 30, 10, 297, 2.2)} fill="none" />
			<circle cx={-12} cy={26} r={4} fill="none" />
			<circle cx={8} cy={34} r={3} fill="none" />
		</g>
		<g id="k20">
			{/* graduated beaker */}
			<path d={poly([[-38, -40], [-38, 46], [38, 46], [38, -40]], 301, false, 1.6)} fill="none" />
			<path d={ln(-38, -40, -47, -36, 305, 1.0)} fill="none" />
			<g clipPath="url(#m61beaker)">
				<rect x={-40} y={6} width={80} height={44} fill="url(#m61hatch)" stroke="none" />
			</g>
			<path d={ln(-38, 6, 38, 6, 306, 2.2)} fill="none" />
			<path d="M22 -22h16M22 -6h16M22 10h16" fill="none" />
		</g>
		<g id="k21">
			{/* test tube */}
			<path d={`M-15 -54L-15 26A15 15 0 0 0 15 26L15 -54`} fill="none" />
			<path d={ln(-15, -54, 15, -54, 311, 1.2)} fill="none" />
			<g clipPath="url(#m61tube)">
				<rect x={-16} y={-6} width={32} height={52} fill="url(#m61hatch)" stroke="none" />
			</g>
			<path d={ln(-15, -6, 15, -6, 312, 1.8)} fill="none" />
			<circle cx={-5} cy={8} r={3.4} fill="none" />
			<circle cx={6} cy={18} r={2.6} fill="none" />
		</g>
		<g id="k22">
			{/* one cell out of the periodic table */}
			<path d={poly([[-38, -42], [38, -42], [38, 42], [-38, 42]], 321, true, 1.4)} fill="none" />
			<Fm t="6" s={17} x={-29} y={-21} a="start" />
			<Fm t="C" s={44} x={0} y={12} />
			<Fm t="12.01" s={13} x={0} y={33} />
		</g>
		<g id="k24">
			<Fm t="H_2SO_4" s={42} />
		</g>
		<g id="k25">
			<Fm t="2Na + Cl_2" s={30} x={-36} a="end" />
			<Arrow x={-30} y={-9} w={56} s={341} />
			<Fm t="2NaCl" s={30} x={32} a="start" />
		</g>
		<g id="k26">
			<Delta x={-112} y={-8} h={16} s={351} />
			<Fm t="G =" s={32} x={-98} a="start" />
			<Delta x={-30} y={-8} h={16} s={352} />
			<Fm t="H - T" s={32} x={-16} a="start" />
			<Delta x={68} y={-8} h={16} s={353} />
			<Fm t="S" s={32} x={82} a="start" />
		</g>
		<g id="k27">
			{/* titration curve with its equivalence point */}
			<path d={ln(-62, 46, 74, 46, 361, 1.6)} fill="none" />
			<path d={ln(-56, -50, -56, 56, 362, 1.6)} fill="none" />
			<path d="M-48 38Q-6 32 4 -6Q12 -42 62 -46" fill="none" />
			<path d="M4 -6m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" fill="none" />
			<path d="M-56 -6L-2 -6" fill="none" strokeDasharray="5 6" />
			<Fm t="pH" s={18} x={-72} y={-44} a="start" />
		</g>
		<g id="k23">
			{/* orbital box diagram: paired and unpaired spins */}
			<path d={ln(-52, 26, -14, 26, 331, 1.2)} fill="none" />
			<path d={ln(-6, 26, 32, 26, 332, 1.2)} fill="none" />
			<path d={ln(-52, -18, -14, -18, 333, 1.2)} fill="none" />
			<path d="M-38 20v-18l-4 5m4 -5l4 5" fill="none" />
			<path d="M-24 8v18l-4 -5m4 5l4 -5" fill="none" />
			<path d="M8 20v-18l-4 5m4 -5l4 5" fill="none" />
			<path d="M-38 -24v-18l-4 5m4 -5l4 5" fill="none" />
			<Fm t="2p" s={18} x={44} y={32} a="start" />
			<Fm t="3s" s={18} x={44} y={-12} a="start" />
		</g>
	</>
);
const N_CARD = 28;


/* --------------------------------------------------------------- the plate */

export const Motion: React.FC = () => {
	useChalkFont();
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const f = frame;
	const T = f / 60;

	/* [obs] the reference's focus of expansion sits on the frame centre, but
	   its twelve fits scatter over ±20 px, so the operator was not locked off.
	   A drift of that size, far below the expansion itself, keeps the move from
	   reading as a mechanical zoom. */
	const fx = CX + 26 * Math.sin(T * 0.29) + 12 * Math.sin(T * 0.71 + 1.4);
	const fy = CY + 20 * Math.sin(T * 0.34 + 2.1) + 9 * Math.sin(T * 0.83);

	const items: React.ReactNode[] = [];
	for (let i = 0; i < N_EL; i++) {
		const u = ((hash(i * 1.7) + f / T_CYCLE) % 1 + 1) % 1;
		const z = Z_FAR - u * (Z_FAR - Z_CUT);
		const k = SBASE / z;

		/* world position, stored as where the element would land on screen at the
		   moment it enters at the back — that keeps the spawn spread even */
		/* a mild pull toward the axis: elements that enter off-centre are gone
		   within a fraction of their traverse, so a flat spread starves the
		   frame of the large near elements the reference clearly has */
		const bx = hash(i * 3.1 + 11) * 2 - 1;
		const by = hash(i * 5.3 + 29) * 2 - 1;
		const sx0 = Math.sign(bx) * Math.pow(Math.abs(bx), 1.28) * 1020;
		const sy0 = Math.sign(by) * Math.pow(Math.abs(by), 1.28) * 600;
		const X = (sx0 * Z_FAR) / SBASE;
		const Y = (sy0 * Z_FAR) / SBASE;
		const px = fx + X * k;
		const py = fy + Y * k;

		const m = 0.76 + hash(i * 7.9 + 3) * 0.6; // per-instance size spread
		const s = k * m;
		const reach = 240 * s + 220;
		if (px < -reach || px > 1920 + reach || py < -reach || py > 1080 + reach) continue;

		/* [obs] faintness is the depth cue and the only one: the reference's ink
		   sits at 10.8% coverage below luminance 225 but only 1.7% below 110, so
		   the field is mostly distant, low-contrast writing with a few bold
		   pieces near the lens. */
		const depth = clamp(0.24 + 0.76 * Math.pow((Z_FAR - z) / (Z_FAR - Z_CUT), 0.85), 0, 1);
		const fade = smooth(clamp(u / 0.09, 0, 1)) * smooth(clamp((1 - u) / 0.2, 0, 1));
		const op = depth * fade;
		if (op < 0.012) continue;

		const card = Math.floor(hash(i * 11.3 + 7) * N_CARD) % N_CARD;
		const rot = (hash(i * 13.7 + 5) - 0.5) * 5;
		items.push(
			<use
				key={i}
				href={`#k${card}`}
				transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)})`}
				opacity={op.toFixed(3)}
				strokeWidth={(SW * Math.pow(s, -0.38)).toFixed(3)}
			/>,
		);
	}

	/* eraser smears: the board was wiped, and the wipe is what makes a painted
	   rectangle read as a real board. They drift a little so the board is not
	   a frozen backdrop behind a moving field. */
	const smears: React.ReactNode[] = [];
	for (let i = 0; i < 12; i++) {
		const a = hash(i * 2.3) * Math.PI;
		smears.push(
			<ellipse
				key={i}
				cx={200 + hash(i * 4.1) * 1520 + Math.sin(T * 0.11 + i) * 14}
				cy={90 + hash(i * 6.7) * 930 + Math.cos(T * 0.09 + i) * 10}
				rx={190 + hash(i * 8.9) * 300}
				ry={38 + hash(i * 3.3) * 54}
				transform={`rotate(${((a * 180) / Math.PI - 90) * 0.16} 960 540)`}
				fill="#9dbfa8"
				opacity={0.022 + hash(i * 9.1) * 0.03}
			/>,
		);
	}

	const gx = (hash(f) - 0.5) * 90;
	const gy = (hash(f + 700) - 0.5) * 90;

	return (
		<AbsoluteFill style={{background: '#16302a', overflow: 'hidden'}}>
			{/* ------------------------------------------------------- the board */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(118% 96% at 47% 42%, #2f5847 0%, #274839 38%, #1d3a2e 68%, #132720 100%)',
				}}
			/>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<filter id="m61slate" x="0" y="0" width="100%" height="100%">
						<feTurbulence type="fractalNoise" baseFrequency="0.62 0.9" numOctaves={3} seed={9} />
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<filter id="m61blotch" x="-8%" y="-8%" width="116%" height="116%">
						<feTurbulence type="fractalNoise" baseFrequency="0.0042" numOctaves={4} seed={17} />
						<feColorMatrix type="saturate" values="0" />
						<feComponentTransfer>
							<feFuncA type="table" tableValues="0 0 0.1 0.4 0.85" />
						</feComponentTransfer>
					</filter>
					<filter id="m61grain" x="0" y="0" width="100%" height="100%">
						<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
						<feColorMatrix type="saturate" values="0" />
					</filter>
				</defs>
				<rect width={1920} height={1080} filter="url(#m61slate)" opacity={0.15} style={{mixBlendMode: 'overlay'}} />
				<rect
					x={-70}
					y={-70}
					width={2060}
					height={1220}
					filter="url(#m61blotch)"
					opacity={0.2}
					style={{mixBlendMode: 'soft-light'}}
				/>
				<g style={{filter: 'blur(26px)'}}>{smears}</g>
			</svg>

			{/* ------------------------------------------------------- the field */}
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<clipPath id="m61flask">
						<path d="M-13 -24L-50 44L50 44L13 -24z" />
					</clipPath>
					<clipPath id="m61beaker">
						<rect x={-38} y={-40} width={76} height={86} />
					</clipPath>
					<clipPath id="m61tube">
						<path d="M-15 -54L-15 26A15 15 0 0 0 15 26L15 -54z" />
					</clipPath>
					<pattern id="m61hatch" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
						<line x1={0} y1={0} x2={0} y2={9} stroke={CHALK} strokeWidth={1.6} />
					</pattern>
					{/* chalk is not a clean vector: displacing the whole writing layer
					    through a noise field roughens every edge at once, which is far
					    cheaper than roughening 176 elements individually */}
					<filter id="m61chalk" x="-3%" y="-3%" width="106%" height="106%">
						<feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves={3} seed={23} result="n" />
						<feDisplacementMap
							in="SourceGraphic"
							in2="n"
							scale={2.9}
							xChannelSelector="R"
							yChannelSelector="G"
						/>
					</filter>
					<Cards />
				</defs>
				{/* the dust halo: the same field, blown out and blurred, sitting under
				    the strokes — chalk always leaves a bloom on a dark board */}
				<g
					stroke={CHALK}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
					opacity={0.4}
					style={{filter: 'blur(4.5px)'}}
				>
					{items}
				</g>
				<g
					stroke={CHALK}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
					filter="url(#m61chalk)"
				>
					{items}
				</g>
			</svg>

			{/* -------------------------------------------------------- finish */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(78% 72% at 50% 48%, rgba(0,0,0,0) 50%, rgba(4,14,10,0.26) 80%, rgba(2,9,6,0.6) 100%)',
				}}
			/>
			<svg
				width={1920}
				height={1080}
				viewBox="0 0 1920 1080"
				style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'overlay', opacity: 0.1}}
			>
				<rect
					x={-70}
					y={-70}
					width={2060}
					height={1220}
					filter="url(#m61grain)"
					transform={`translate(${gx} ${gy})`}
				/>
			</svg>
			<AbsoluteFill
				style={{
					background: '#0a1712',
					opacity: 1 - seg(f, 0, 34) + seg(f, durationInFrames - 40, durationInFrames),
				}}
			/>
		</AbsoluteFill>
	);
};
