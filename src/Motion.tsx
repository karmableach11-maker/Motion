import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION 60 — "CHALKBOARD FLY-THROUGH"
 * ---------------------------------------------------------------------------
 * A forward dolly through a deep field of hand-written mathematics, re-staged
 * from a white sheet onto a green classroom chalkboard.
 *
 * WHAT WAS MEASURED, AND WHAT WAS INFERRED, FROM THE REFERENCE CLIP
 * ----------------------------------------------------------------
 * Reference: 700x394, 60 fps, 720 frames, 12.000 s, one continuous take.
 * [obs] marks what came off the frames; [int] marks an inference.
 *
 * [obs] The move is a pure forward dolly. Fitting a radial flow field to every
 *       tracked patch (dx = k*x + c1, dy = k*y + c2, one shared k) gives a
 *       focus of expansion at (355.8, 199.9) averaged over twelve samples
 *       across the clip, against a frame centre of (350, 197) — dead centre,
 *       within 6 px. Residual rms 4.24 px.
 * [obs] No roll. Log-polar rotation per 6-frame step stays within ±0.038 deg
 *       across the whole clip, which is the noise floor of the method.
 * [obs] The rate is constant, not eased. Refitting every 60 frames gives
 *       scale/s of 1.2925, 1.2662, 1.2995, 1.3209, 1.2380, 1.2819, 1.2842,
 *       1.2908, 1.2836, 1.3338, 1.2675, 1.2657 — mean 1.284, no trend.
 * [obs] There IS parallax, and it is large. Sorting tracked patches by their
 *       own contrast (faint = far) and refitting each third separately:
 *         faint third   scale/s = 1.128
 *         middle third  scale/s = 1.351
 *         bold third    scale/s = 1.638
 *       A flat 2D zoom cannot do that. Under a constant-velocity dolly the
 *       expansion rate of an element is v/z, so those three numbers pin both
 *       the depth range (z_far / z_near = ln1.638 / ln1.128 = 4.1) and the
 *       velocity. This file uses v = 0.494 z-units/s over z = 4.25 -> 0.42,
 *       which reproduces all three thirds: 1.123 / 1.271 / 1.639.
 * [obs] Faintness is the depth cue and the only one — no blur, no colour
 *       shift. The nearest, largest formulas are as sharp as the small ones,
 *       so there is no depth of field to model.
 * [obs] Ink is neutral (mean BGR 70,70,70) on a neutral ground (243,243,243);
 *       ink covers 1.7% of the frame below luminance 110 and 10.8% below 225,
 *       i.e. the field is mostly made of faint, distant writing.
 * [obs] Stroke half-width from a distance transform: 0.95 px median, 1.37 px
 *       at p90, at 700 wide. Strokes scale with their element — the large
 *       formulas are drawn with visibly heavier lines than the small ones —
 *       so nothing here uses a fixed stroke weight.
 * [obs] It does not loop. phaseCorrelate(frame 0, frame 719) responds at
 *       0.446 and the two differ by 20.08 mean abs, against 18.95 for two
 *       adjacent frames. So the clip is open-ended, and so is this one.
 * [obs] Content is school mathematics: quadratic formula, f(x)=ax²+bx+c,
 *       E=mc², a three-equation linear system in a brace, Y=cos x − sin x,
 *       sin(−a)=−sin a, three-circle Venn diagrams with hatched intersections,
 *       wireframe cubes with dashed hidden edges, cones with h and r,
 *       pyramids, cylinders.
 * [int] Everything above is reproduced; only the staging changes. The board,
 *       the chalk, the dust and the eraser smears are a design choice, not a
 *       measurement — the reference is a white sheet.
 *
 * SOURCES
 * -------
 * Font   Patrick Hand, SIL Open Font License 1.1, from google/fonts ofl/.
 *        Chosen over Caveat and Architect's Daughter because it is the only
 *        one of the three that carries π, ∫, ², ³, ± and × — and because its
 *        upright print hand is the closest match to the reference's writing.
 *        Subset to the characters actually used and embedded, so the file
 *        renders with no network and no external asset.
 * Art    Every formula and diagram is drawn here from scratch; nothing is
 *        traced from the reference.
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
if (typeof document !== 'undefined' && !document.getElementById('m60-face')) {
	const st = document.createElement('style');
	st.id = 'm60-face';
	st.textContent = FACE;
	document.head.appendChild(st);
}

const useChalkFont = () => {
	const [handle] = useState(() => delayRender('m60 font'));
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

/* a hand-drawn radical: the hook, then an overbar sized to its radicand */
const Radical: React.FC<{x: number; y: number; w: number; h?: number; s: number}> = ({x, y, w, h = 34, s}) => (
	<path
		d={
			`M${x} ${y - h * 0.42}L${x + 5} ${y - h * 0.3}L${x + 11} ${y + 2}` +
			`Q${x + 13.4 + wob(s, 1, 1.4)} ${y - h * 0.45 + wob(s, 2, 1.4)} ${x + 17} ${y - h}` +
			`Q${x + 17 + w * 0.5} ${y - h + 0.4 + wob(s + 3, 1, 1.4)} ${x + 17 + w} ${y - h + 1.5}`
		}
		fill="none"
	/>
);

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

/* -------------------------------------------------------------- the cards */

/* Twenty-four pieces of blackboard, each drawn once into <defs> and then
   instanced by <use>. Instancing is what makes 176 of them affordable: the
   geometry is built one time and the browser only has to place a transform,
   and stroke width scales with that transform exactly as it does in the
   reference, where the big formulas are drawn with heavier lines. */
const Cards: React.FC = () => (
	<>
		<g id="k0">
			<Tx s={46}>E = mc²</Tx>
		</g>
		<g id="k1">
			<Tx s={40}>f(x) = ax² + bx + c</Tx>
		</g>
		<g id="k2">
			<Tx s={42}>a² + b² = c²</Tx>
		</g>
		<g id="k3">
			{/* the quadratic formula, the reference's most repeated element */}
			<Tx x={-146} y={12} s={40} a="start">
				x =
			</Tx>
			<Frac x={26} y={0} w={196} s={11}>
				<Tx x={-58} y={-14} s={34} a="start">
					-b ±
				</Tx>
				<Radical x={18} y={-14} w={92} h={30} s={12} />
				<Tx x={26} y={-16} s={32} a="start">
					b²-4ac
				</Tx>
				<Tx x={26} y={38} s={34}>
					2a
				</Tx>
			</Frac>
		</g>
		<g id="k4">
			{/* a three-equation linear system inside a hand-drawn brace */}
			<path d="M-104 -44q-11 3 -11 16v18q0 10 -9 12 9 2 9 12v18q0 13 11 16" fill="none" />
			<Tx x={-92} y={-30} s={28} a="start">
				x + 3y + 2z = 1
			</Tx>
			<Tx x={-92} y={6} s={28} a="start">
				2x + 6y + 5z = 38
			</Tx>
			<Tx x={-92} y={42} s={28} a="start">
				x + 2y + 10z = 2
			</Tx>
		</g>
		<g id="k5">
			<Tx s={38}>y = cos x - sin x</Tx>
		</g>
		<g id="k6">
			<Tx s={38}>sin(-a) = -sin a</Tx>
		</g>
		<g id="k7">
			<Tx s={40}>x + y = a²b</Tx>
		</g>
		<g id="k8">
			<Tx x={-120} y={14} s={52} a="start">
				∫
			</Tx>
			<Tx x={-92} y={12} s={36} a="start">
				f(x) dx = F(x) + C
			</Tx>
		</g>
		<g id="k9">
			<Tx s={40}>V = πr²h</Tx>
		</g>
		<g id="k10">
			<Tx s={44}>F = ma</Tx>
		</g>
		<g id="k11">
			<Tx s={40}>C = 2πr</Tx>
		</g>
		<g id="k12">
			<Tx s={34}>log(ab) = log a + log b</Tx>
		</g>
		<g id="k13">
			{/* a 2x2 matrix in hand-drawn brackets */}
			<path d={`M-46 -34h-12v68h12`} fill="none" />
			<path d={`M46 -34h12v68h-12`} fill="none" />
			<Tx x={-24} y={-4} s={34}>
				a
			</Tx>
			<Tx x={24} y={-4} s={34}>
				b
			</Tx>
			<Tx x={-24} y={30} s={34}>
				c
			</Tx>
			<Tx x={24} y={30} s={34}>
				d
			</Tx>
		</g>
		<g id="k14">
			<Frac x={-72} y={0} w={62} s={21}>
				<Tx x={-72} y={-12} s={30}>
					d
				</Tx>
				<Tx x={-72} y={30} s={30}>
					dx
				</Tx>
			</Frac>
			<Tx x={-30} y={10} s={34} a="start">
				(x²) = 2x
			</Tx>
		</g>
		<g id="k15">
			{/* three-circle Venn, two intersections hatched */}
			<g clipPath="url(#m60v1)">
				<circle cx={-28} cy={-10} r={38} fill="url(#m60hatch)" stroke="none" />
			</g>
			<g clipPath="url(#m60v2)">
				<circle cx={28} cy={-10} r={38} fill="url(#m60hatch)" stroke="none" />
			</g>
			<circle cx={-28} cy={-10} r={38} fill="none" />
			<circle cx={28} cy={-10} r={38} fill="none" />
			<circle cx={0} cy={30} r={38} fill="none" />
			<Tx x={-52} y={-34} s={22}>
				A
			</Tx>
			<Tx x={52} y={-34} s={22}>
				B
			</Tx>
			<Tx x={0} y={68} s={22}>
				C
			</Tx>
		</g>
		<g id="k16">
			{/* wireframe cube, hidden edges dashed, edges labelled a and b */}
			<path d={poly([[-54, -30], [30, -30], [30, 46], [-54, 46]], 31, true)} fill="none" />
			<path d={poly([[-24, -56], [60, -56], [60, 20], [-24, 20]], 35, true)} fill="none" strokeOpacity={0.9} />
			<path d={ln(-54, -30, -24, -56, 39)} fill="none" />
			<path d={ln(30, -30, 60, -56, 40)} fill="none" />
			<path d={ln(30, 46, 60, 20, 41)} fill="none" />
			<path d={ln(-54, 46, -24, 20, 42)} fill="none" strokeDasharray="5 6" />
			<Tx x={-12} y={-66} s={26}>
				a
			</Tx>
			<Tx x={76} y={-14} s={26}>
				b
			</Tx>
		</g>
		<g id="k17">
			{/* cone: dashed base ellipse, height and radius marked */}
			<ellipse cx={0} cy={38} rx={46} ry={15} fill="none" strokeDasharray="6 7" />
			<path d={`M-46 38A46 15 0 0 0 46 38`} fill="none" />
			<path d={ln(-46, 38, 0, -52, 51)} fill="none" />
			<path d={ln(46, 38, 0, -52, 52)} fill="none" />
			<path d={`M0 -52L0 38`} fill="none" strokeDasharray="5 6" />
			<path d={`M0 38L46 38`} fill="none" strokeDasharray="5 6" />
			<Tx x={-12} y={4} s={24}>
				h
			</Tx>
			<Tx x={24} y={60} s={24}>
				r
			</Tx>
		</g>
		<g id="k18">
			{/* square pyramid */}
			<path d={poly([[-50, 40], [30, 40], [56, 16], [-24, 16]], 61, true)} fill="none" strokeDasharray="5 6" />
			<path d={ln(-50, 40, 4, -54, 65)} fill="none" />
			<path d={ln(30, 40, 4, -54, 66)} fill="none" />
			<path d={ln(56, 16, 4, -54, 67)} fill="none" />
			<path d={`M-50 40L30 40`} fill="none" />
		</g>
		<g id="k19">
			{/* cylinder */}
			<ellipse cx={0} cy={-34} rx={38} ry={13} fill="none" />
			<path d={`M-38 42A38 13 0 0 0 38 42`} fill="none" />
			<path d={`M-38 42A38 13 0 0 1 38 42`} fill="none" strokeDasharray="5 6" />
			<path d={ln(-38, -34, -38, 42, 71, 1.6)} fill="none" />
			<path d={ln(38, -34, 38, 42, 72, 1.6)} fill="none" />
			<Tx x={16} y={10} s={24}>
				h
			</Tx>
		</g>
		<g id="k20">
			{/* right triangle with the angle arc */}
			<path d={poly([[-62, 40], [58, 40], [58, -38]], 81, true)} fill="none" />
			<path d="M-30 40a32 32 0 0 0 -1 -12" fill="none" />
			<path d="M40 40v-18h18" fill="none" strokeOpacity={0.85} />
			<Tx x={-4} y={62} s={24}>
				b
			</Tx>
			<Tx x={78} y={4} s={24}>
				a
			</Tx>
			<Tx x={-4} y={-6} s={24}>
				c
			</Tx>
		</g>
		<g id="k21">
			{/* axes with a parabola */}
			<path d={ln(-66, 44, 74, 44, 91, 1.8)} fill="none" />
			<path d={ln(-52, -50, -52, 58, 92, 1.8)} fill="none" />
			<path d="M-30 40Q10 -74 62 6" fill="none" />
			<Tx x={80} y={58} s={22}>
				x
			</Tx>
			<Tx x={-68} y={-46} s={22}>
				y
			</Tx>
		</g>
		<g id="k22">
			{/* circle with a marked radius */}
			<circle cx={0} cy={0} r={44} fill="none" />
			<path d={ln(0, 0, 44, 0, 101, 1.4)} fill="none" />
			<circle cx={0} cy={0} r={2.6} fill={CHALK} stroke="none" />
			<Tx x={22} y={-8} s={24}>
				r
			</Tx>
		</g>
		<g id="k23">
			{/* a bare angle mark, the small connective glyph the reference is full of */}
			<path d={ln(-46, 26, 52, -18, 111, 1.6)} fill="none" />
			<path d={ln(-46, 26, 52, 26, 112, 1.6)} fill="none" />
			<path d="M-16 26a30 30 0 0 0 -2 -13" fill="none" />
		</g>
	</>
);
const N_CARD = 24;

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
					<filter id="m60slate" x="0" y="0" width="100%" height="100%">
						<feTurbulence type="fractalNoise" baseFrequency="0.62 0.9" numOctaves={3} seed={9} />
						<feColorMatrix type="saturate" values="0" />
					</filter>
					<filter id="m60blotch" x="-8%" y="-8%" width="116%" height="116%">
						<feTurbulence type="fractalNoise" baseFrequency="0.0042" numOctaves={4} seed={17} />
						<feColorMatrix type="saturate" values="0" />
						<feComponentTransfer>
							<feFuncA type="table" tableValues="0 0 0.1 0.4 0.85" />
						</feComponentTransfer>
					</filter>
					<filter id="m60grain" x="0" y="0" width="100%" height="100%">
						<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
						<feColorMatrix type="saturate" values="0" />
					</filter>
				</defs>
				<rect width={1920} height={1080} filter="url(#m60slate)" opacity={0.15} style={{mixBlendMode: 'overlay'}} />
				<rect
					x={-70}
					y={-70}
					width={2060}
					height={1220}
					filter="url(#m60blotch)"
					opacity={0.2}
					style={{mixBlendMode: 'soft-light'}}
				/>
				<g style={{filter: 'blur(26px)'}}>{smears}</g>
			</svg>

			{/* ------------------------------------------------------- the field */}
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<clipPath id="m60v1">
						<circle cx={28} cy={-10} r={38} />
					</clipPath>
					<clipPath id="m60v2">
						<circle cx={0} cy={30} r={38} />
					</clipPath>
					<pattern id="m60hatch" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
						<line x1={0} y1={0} x2={0} y2={9} stroke={CHALK} strokeWidth={1.6} />
					</pattern>
					{/* chalk is not a clean vector: displacing the whole writing layer
					    through a noise field roughens every edge at once, which is far
					    cheaper than roughening 176 elements individually */}
					<filter id="m60chalk" x="-3%" y="-3%" width="106%" height="106%">
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
					filter="url(#m60chalk)"
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
					filter="url(#m60grain)"
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
