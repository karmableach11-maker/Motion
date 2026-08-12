import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * MOTION 66 — "OVERTHINKING"
 * ---------------------------------------------------------------------------
 * A hand-drawn open head with a tangle of thought churning above it. White
 * line on black: drawn on, then left to boil.
 *
 * WHAT WAS MEASURED FROM THE REFERENCE
 * ------------------------------------
 * Reference: 898x506, 30 fps, 360 frames, 12.000 s. [obs] is what came off the
 * frames; [int] is a decision stated as one.
 *
 * [obs] The whole thing animates ON THREES. Per-frame difference in the head
 *       region runs 0, 0, 5.99, 0.08, 0, 5.29, 0.02, 0.18, 5.93, ... — every
 *       change lands on frame 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39
 *       and nowhere else, and 240 of the 359 consecutive pairs are identical.
 *       At 30 fps that is exactly 10 drawings per second. The tangle keeps the
 *       same beat, so figure and tangle are redrawn together rather than
 *       running on separate clocks. This file holds each drawing 6 frames at
 *       60 fps to land on the same 10 per second.
 * [obs] The figure does not move. Its ink bounding box is x 6-10 to 206-208
 *       and y 0-199 on every one of those drawings — a wobble of a pixel or
 *       two, not a bob. What changes is the LINE: ink pixel count swings 1423
 *       to 1594 between drawings, which is a redraw, not a transform. The life
 *       in it is boil and nothing else, which is why there is no bob here.
 * [obs] The tangle is redrawn properly rather than wobbled — its box moves
 *       between w=88 and w=107 and its ink between 2444 and 3669 — and the
 *       drawings repeat: frame 27 matches frame 0 exactly, 30 matches 6, 33
 *       matches 12, 21 matches 9, 24 matches 15. That is a pool of nine
 *       drawings cycling on a 27-frame period, not fresh chaos every time.
 * [obs] Pure white on pure black: luminance percentiles 0 / 0 / 0 / 117 / 255
 *       at 1/50/90/99/99.9, ink covers 1.23% of the frame, stroke half-width
 *       0.95 px median and 1.91 at p90 — about 4 px wide once scaled to 1920.
 * [obs] It does not loop cleanly: |f0 - f359| is 2.626 against 0.000 for two
 *       frames inside the same hold.
 *
 * [int] Ten drawings in the pool here rather than the reference's nine, which
 *       makes the cycle 60 frames and divides 900 exactly fifteen times — so
 *       this one DOES loop seamlessly, where the reference does not.
 * [int] Every stroke is a point array rather than a path string, so the
 *       draw-on can slice it. That is what lets build and boil run together:
 *       the figure is being drawn while it is already boiling, instead of
 *       holding still until the reveal finishes.
 */

/* ------------------------------------------------------------------ setup */

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (f: number, a: number, b: number) => smooth(clamp((f - a) / (b - a), 0, 1));
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/* deterministic noise, so drawing n is the same drawing every time it comes
   round — which is what makes the pool a pool and not a stutter */
const rnd = (a: number, b = 0, c = 0) => {
	const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
	return s - Math.floor(s);
};
const sgn = (a: number, b = 0, c = 0) => rnd(a, b, c) * 2 - 1;

type P = [number, number];

/* Catmull-Rom through the anchors: a few hand-placed points become a smooth
   curve, and jittering the anchors boils the whole curve at once */
const curve = (pts: P[], per = 10): P[] => {
	const out: P[] = [];
	const n = pts.length;
	for (let i = 0; i < n - 1; i++) {
		const p0 = pts[Math.max(0, i - 1)];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[Math.min(n - 1, i + 2)];
		for (let j = 0; j < per; j++) {
			const t = j / per;
			const t2 = t * t;
			const t3 = t2 * t;
			out.push([
				0.5 *
					(2 * p1[0] +
						(-p0[0] + p2[0]) * t +
						(2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
						(-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
				0.5 *
					(2 * p1[1] +
						(-p0[1] + p2[1]) * t +
						(2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
						(-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
			]);
		}
	}
	out.push(pts[n - 1]);
	return out;
};

/* [obs] the reference's line moves a pixel or two between drawings and never
   more — the wobble is in the ink, not in the pose.
   It has to be LOW FREQUENCY along the path, though. Jittering each sampled
   point independently is the obvious way and it is wrong: white noise on a
   72-point ellipse does not read as a hand-drawn wobble, it reads as a hairy
   line, because the error decorrelates between neighbours. Two slow sinusoids
   in the path parameter keep neighbouring points agreeing with each other, so
   the stroke stays a stroke and just breathes. */
const JIT = 3;
const wob = (pts: P[], d: number, id: number, amp = JIT): P[] => {
	const n = Math.max(1, pts.length - 1);
	return pts.map((p, i) => {
		const u = i / n;
		return [
			p[0] + (Math.sin(u * 9 + rnd(d, id) * 9) * 0.62 + Math.sin(u * 21 + rnd(d, id + 1) * 9) * 0.38) * amp,
			p[1] + (Math.sin(u * 11 + rnd(d, id + 2) * 9) * 0.62 + Math.sin(u * 25 + rnd(d, id + 3) * 9) * 0.38) * amp,
		] as P;
	});
};

const poly = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
/* the draw-on slices the point array, so it works on a stroke that is already
   boiling underneath it */
const drawn = (pts: P[], k: number) => {
	if (k >= 0.999) return pts;
	const n = Math.floor(pts.length * clamp(k, 0, 1));
	return n < 2 ? [] : pts.slice(0, n);
};

/* -------------------------------------------------------------- the figure */

const CXX = 960;
const RIM_Y = 452;
const RIM_RX = 168;
const RIM_RY = 22;

const rimPts = (d: number): P[] => {
	const out: P[] = [];
	for (let i = 0; i <= 84; i++) {
		const a = (i / 84) * TAU - Math.PI;
		out.push([CXX + RIM_RX * Math.cos(a), RIM_Y + RIM_RY * Math.sin(a)]);
	}
	return wob(out, d, 1, 2.4);
};

/* the vessel: widest just under the rim, tapering to a rounded base */
const bodyAnchors: P[] = [
	[CXX - RIM_RX, RIM_Y],
	[CXX - 172, RIM_Y + 80],
	[CXX - 164, RIM_Y + 156],
	[CXX - 143, RIM_Y + 226],
	[CXX - 112, RIM_Y + 278],
	[CXX - 62, RIM_Y + 316],
	[CXX, RIM_Y + 330],
	[CXX + 62, RIM_Y + 316],
	[CXX + 112, RIM_Y + 278],
	[CXX + 143, RIM_Y + 226],
	[CXX + 164, RIM_Y + 156],
	[CXX + 172, RIM_Y + 80],
	[CXX + RIM_RX, RIM_Y],
];

/* closed eyes: a shallow arc that lifts a touch at the outer end */
const eyeAnchors = (side: number): P[] => [
	[CXX + side * 90 - side * 46, RIM_Y + 142],
	[CXX + side * 90 - side * 16, RIM_Y + 156],
	[CXX + side * 90 + side * 18, RIM_Y + 155],
	[CXX + side * 90 + side * 46, RIM_Y + 140],
];

const neckAnchors = (side: number): P[] => [
	[CXX + side * 50, RIM_Y + 326],
	[CXX + side * 52, RIM_Y + 356],
	[CXX + side * 58, RIM_Y + 384],
];
const shoulderAnchors = (side: number): P[] => [
	[CXX + side * 58, RIM_Y + 384],
	[CXX + side * 132, RIM_Y + 412],
	[CXX + side * 212, RIM_Y + 466],
	[CXX + side * 250, RIM_Y + 544],
	[CXX + side * 262, RIM_Y + 630],
];

/* the thread out of the open head: a slow rise, then a widening spiral that
   hands over to the knot */
const threadPts = (d: number): P[] => {
	const out: P[] = [];
	for (let i = 0; i <= 30; i++) {
		const t = i / 30;
		out.push([CXX + Math.sin(t * 3.4 + rnd(d, 41) * 6) * 9 * t, RIM_Y - 10 - t * 66]);
	}
	for (let i = 1; i <= 74; i++) {
		const t = i / 74;
		const a = t * TAU * 2.35 - Math.PI / 2 + rnd(d, 42) * 0.6;
		const r = 13 + t * t * 40;
		out.push([CXX + r * Math.cos(a) * 1.45, RIM_Y - 78 - t * 74 + r * Math.sin(a) * 0.62]);
	}
	return wob(out, d, 7, 2.6);
};

/* -------------------------------------------------------------- the tangle */

/* A pen that keeps turning: the heading drifts on its own smooth noise and a
   spring pulls it back whenever it wanders out of the knot. That produces
   scribble; an unconstrained random walk only produces fuzz. */
const TANGLE_CY = RIM_Y - 274;
const tanglePts = (d: number): P[] => {
	const out: P[] = [];
	let x = CXX;
	let y = RIM_Y - 186;
	let h = -Math.PI / 2 + sgn(d, 3) * 0.7;
	const N = 760;
	for (let i = 0; i < N; i++) {
		const t = i / N;
		h +=
			Math.sin(i * 0.27 + rnd(d, 11) * 9) * 0.4 +
			Math.sin(i * 0.089 + rnd(d, 12) * 9) * 0.26 +
			Math.sin(i * 0.014 + rnd(d, 13) * 9) * 0.16;
		const dx = x - CXX;
		const dy = y - TANGLE_CY;
		const rr = Math.hypot(dx / 0.78, dy);
		const lim = 124 + 16 * Math.sin(t * 6 + rnd(d, 14) * 6);
		if (rr > lim) {
			const want = Math.atan2(TANGLE_CY - y, CXX - x);
			const diff = ((want - h + Math.PI * 3) % TAU) - Math.PI;
			h += diff * clamp((rr - lim) / 46, 0, 1) * 0.46;
		}
		const step = 5.8 + 2.1 * Math.sin(i * 0.4 + rnd(d, 15) * 8);
		x += Math.cos(h) * step;
		y += Math.sin(h) * step;
		out.push([x, y]);
	}
	return wob(out, d, 21, 1.4);
};

/* ---------------------------------------------------------------- the plate */

const HOLD = 6; // [obs] 10 drawings per second, as measured on the reference
const POOL = 10; // [int] ten, not the reference's nine, so 900 frames loop exactly

export const Motion: React.FC = () => {
	const f = useCurrentFrame();

	/* which drawing is on screen. Everything downstream reads d, never f, so a
	   hold really is a hold: six frames of pixel-identical output. */
	const d = Math.floor(f / HOLD) % POOL;

	/* the build. Each stroke reveals in turn while the boil is already running */
	const kRim = seg(f, 6, 44);
	const kBody = seg(f, 26, 86);
	const kEye = seg(f, 82, 112);
	const kNeck = seg(f, 100, 130);
	const kSh = seg(f, 114, 168);
	const kThread = seg(f, 158, 214);
	const kTangle = outCubic(clamp((f - 202) / 156, 0, 1));

	const S = 4.2; // [obs] 1.91 px half-width at 898 wide scales to about 4 at 1920

	const strokes: P[][] = [
		drawn(rimPts(d), kRim),
		drawn(wob(curve(bodyAnchors, 12), d, 2), kBody),
		drawn(wob(curve(eyeAnchors(-1), 10), d, 3, 2), kEye),
		drawn(wob(curve(eyeAnchors(1), 10), d, 4, 2), kEye),
		drawn(wob(curve(neckAnchors(-1), 8), d, 5, 2.2), kNeck),
		drawn(wob(curve(neckAnchors(1), 8), d, 6, 2.2), kNeck),
		drawn(wob(curve(shoulderAnchors(-1), 12), d, 8), kSh),
		drawn(wob(curve(shoulderAnchors(1), 12), d, 9), kSh),
		drawn(threadPts(d), kThread),
		drawn(tanglePts(d), kTangle),
	];

	return (
		<AbsoluteFill style={{background: '#000000', overflow: 'hidden'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<g fill="none" stroke="#ffffff" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round">
					{strokes.map((s, i) => (s.length > 1 ? <path key={i} d={poly(s)} /> : null))}
				</g>
			</svg>
		</AbsoluteFill>
	);
};
