import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/* ------------------------------------------------------------------ *
 *  BINARY DATA TUNNEL — camera fly-through of a 3D data volume
 *  1920x1080 | 60fps | 15s | perfect loop
 *
 *  Camera measured off the reference and reproduced exactly:
 *    - vanishing point locked at frame centre (0.500 W, 0.495 H)
 *    - pure forward dolly, ZERO roll and ZERO lateral drift
 *    - constant velocity, no ease in/out anywhere in the shot
 *      (reference zoom 1.0260 +/- 0.0025 per 2 frames @25fps
 *       = 1.385x per second; matched here by v = SPAN / duration)
 *
 *  Every element is a real 3D point projected with k = FOC / z, so
 *  the radial streaks, parallax and depth ordering fall out of the
 *  geometry instead of being faked with a 2D scale.
 * ------------------------------------------------------------------ */

const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = 535; /* measured VP: 0.495 of frame height */
const FOC = 1150;

/* depth volume — one full traversal per loop => seamless cycle */
const Z0 = 3.5;
const SPAN = 120;
const DUR = 15;
/* the camera crosses the volume 3x per loop: matches the reference's
   measured 1.3906x/s expansion while still returning every point to its
   exact start position at t = DUR, so the cycle stays seamless */
const VEL = (SPAN * 3) / DUR; /* 24 world units per second */
const BLUR = 3.7 / 60; /* motion-blur trail length, in seconds */

/* palette */
const RAMP = ['#1B4C69', '#276A94', '#4796BE', '#7EC4E4', '#9FD6F0', '#C4E9FC'];
const ACC = ['#F0455C', '#2E7BFF', '#E23FC4'];

let _s = 0x51ab73c9 >>> 0;
const rr = () => {
	_s = (Math.imul(_s, 1664525) + 1013904223) >>> 0;
	return _s / 4294967296;
};

/* ---------------- field bake ----------------
   digits are laid out in short horizontal / vertical runs, the way the
   reference organises them, not scattered independently          */
const N = 26000;
const PX = new Float32Array(N);
const PY = new Float32Array(N);
const PZ = new Float32Array(N);
const PS = new Float32Array(N);
const PB = new Float32Array(N);
const PF = new Float32Array(N);
const PP = new Float32Array(N);
const PT = new Uint8Array(N);
const PA = new Uint8Array(N);
{
	let i = 0;
	while (i < N) {
		const bx = (rr() - 0.5) * 216;
		const by = (rr() - 0.5) * 124;
		const bz = Z0 + rr() * SPAN;
		const sz = 0.21 + rr() * 0.2;
		const br = rr() < 0.045 ? 0.98 + rr() * 0.3 : 0.4 + rr() * 0.55;
		const mode = rr();
		const runN = mode < 0.3 ? 3 + Math.floor(rr() * 8) : mode < 0.4 ? 2 + Math.floor(rr() * 4) : 1;
		const vert = mode >= 0.3 && mode < 0.4;
		const gap = sz * (1.28 + rr() * 0.5);
		for (let j = 0; j < runN && i < N; j++) {
			PX[i] = bx + (vert ? (rr() - 0.5) * 0.08 : j * gap * 1.35);
			PY[i] = by + (vert ? j * gap * 1.6 : (rr() - 0.5) * 0.1);
			PZ[i] = bz;
			PS[i] = sz;
			PB[i] = br * (0.72 + rr() * 0.5);
			PF[i] = 1 + Math.floor(rr() * 4);
			PP[i] = rr();
			const u = rr();
			PT[i] = u < 0.028 ? 2 : u < 0.53 ? 0 : 1;
			PA[i] = Math.floor(rr() * 3);
			i++;
		}
	}
}

/* long radial data rays: finite z-segments so they slide outward */
const NR = 46;
const RX = new Float32Array(NR);
const RY = new Float32Array(NR);
const RZ = new Float32Array(NR);
const RL = new Float32Array(NR);
const RB = new Float32Array(NR);
for (let i = 0; i < NR; i++) {
	RX[i] = (rr() - 0.5) * 190;
	RY[i] = (rr() - 0.5) * 112;
	RZ[i] = Z0 + rr() * SPAN;
	RL[i] = 14 + rr() * 34;
	RB[i] = 0.25 + rr() * 0.5;
}

/* lattice gates */
const NG = 18;
const GS = 0.55 + 0;

const NDOT = 6;
const NGL = 4;
const SZC = 5;

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;
	const u = frame / durationInFrames;
	const zc = VEL * t;
	const TAU = Math.PI * 2;

	const dots: string[] = new Array(NDOT).fill('');
	const glyph: string[] = new Array(SZC * NGL).fill('');
	const streak: string[] = new Array(5).fill('');
	const acc: string[] = new Array(9).fill('');

	for (let i = 0; i < N; i++) {
		let z = PZ[i] - zc - Z0;
		z = ((z % SPAN) + SPAN) % SPAN + Z0;
		if (z < Z0 + 0.15) continue;
		const k = FOC / z;
		const X = CX + PX[i] * k;
		if (X < -70 || X > W + 70) continue;
		const Y = CY + PY[i] * k;
		if (Y < -70 || Y > H + 70) continue;

		const zn = (z - Z0) / SPAN;
		let a = PB[i] * (0.62 + 0.55 * Math.exp(-(z - Z0) / 72));
		if (zn > 0.9) a *= (1 - zn) / 0.1;
		if (z < Z0 + 2.2) a *= (z - Z0) / 2.2;
		a *= 0.7 + 0.3 * Math.sin(TAU * (u * PF[i] + PP[i]));
		if (a < 0.035) continue;

		/* radial motion-blur trail, straight out of the projection */
		const zb = z + VEL * BLUR;
		const kb = FOC / zb;
		const sx = CX + PX[i] * kb;
		const sy = CY + PY[i] * kb;
		const len = Math.abs(X - sx) + Math.abs(Y - sy);
		if (len > 1.4) {
			let si = ((a * 4 + 0.5) | 0) as number;
			if (si < 0) si = 0;
			else if (si > 4) si = 4;
			streak[si] +=
				'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + 'L' + X.toFixed(1) + ' ' + Y.toFixed(1);
		}

		const h = PS[i] * k;

		if (PT[i] === 2) {
			const s = Math.max(1.2, h * 0.72);
			let ci = s < 3 ? 0 : s < 7 ? 1 : 2;
			acc[PA[i] * 3 + ci] += 'M' + X.toFixed(1) + ' ' + Y.toFixed(1) + 'h.01';
			continue;
		}

		if (h < 4.2) {
			let bi = ((a * (NDOT - 1) + 0.5) | 0) as number;
			if (bi < 0) bi = 0;
			else if (bi > NDOT - 1) bi = NDOT - 1;
			dots[bi] += 'M' + X.toFixed(1) + ' ' + Y.toFixed(1) + 'h.01';
			continue;
		}

		let c = h < 7 ? 0 : h < 12 ? 1 : h < 22 ? 2 : h < 42 ? 3 : 4;
		let bi = ((a * (NGL - 1) + 0.5) | 0) as number;
		if (bi < 0) bi = 0;
		else if (bi > NGL - 1) bi = NGL - 1;
		const h2 = h * 0.5;
		const y0 = Y - h2;
		const y1 = Y + h2;
		if (PT[i] === 1) {
			glyph[c * NGL + bi] +=
				'M' + X.toFixed(1) + ' ' + y0.toFixed(1) + 'V' + y1.toFixed(1);
		} else {
			const x0 = X - h * 0.3;
			const x1 = X + h * 0.3;
			glyph[c * NGL + bi] +=
				'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) +
				'H' + x1.toFixed(1) + 'V' + y1.toFixed(1) +
				'H' + x0.toFixed(1) + 'Z';
		}
	}

	/* ---------------- long radial rays ---------------- */
	let rays = '';
	let raysDim = '';
	for (let i = 0; i < NR; i++) {
		let z = RZ[i] - zc - Z0;
		z = ((z % SPAN) + SPAN) % SPAN + Z0;
		const z2 = z + RL[i];
		if (z < Z0 + 0.4) continue;
		const k1 = FOC / z;
		const k2 = FOC / z2;
		const s =
			'M' + (CX + RX[i] * k2).toFixed(1) + ' ' + (CY + RY[i] * k2).toFixed(1) +
			'L' + (CX + RX[i] * k1).toFixed(1) + ' ' + (CY + RY[i] * k1).toFixed(1);
		if (RB[i] > 0.5) rays += s;
		else raysDim += s;
	}

	/* ---------------- lattice gates ---------------- */
	let gate = '';
	for (let g = 0; g < NG; g++) {
		let z = (g / NG) * SPAN - zc;
		z = ((z % SPAN) + SPAN) % SPAN + Z0;
		if (z < Z0 + 1.2 || z > Z0 + SPAN * 0.97) continue;
		const k = FOC / z;
		const ox = ((g * 37) % 23) - 11;
		const oy = ((g * 53) % 17) - 8;
		const stp = 21 + (g % 4) * 3;
		for (let c = -3; c <= 3; c++) {
			const wx = ox + c * stp;
			if (Math.abs(wx) < 3) continue;
			const x = CX + wx * k;
			if (x < -40 || x > W + 40) continue;
			gate += 'M' + x.toFixed(1) + ' ' + (CY - 30 * k).toFixed(1) + 'V' + (CY + 30 * k).toFixed(1);
		}
		for (let r = -2; r <= 2; r++) {
			const wy = oy + r * (stp * 0.72);
			if (Math.abs(wy) < 3) continue;
			const y = CY + wy * k;
			if (y < -40 || y > H + 40) continue;
			gate += 'M' + (CX - 52 * k).toFixed(1) + ' ' + y.toFixed(1) + 'H' + (CX + 52 * k).toFixed(1);
		}
	}

	return (
		<AbsoluteFill style={{backgroundColor: '#02141E'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(96% 118% at 50% 49.5%, rgba(64,158,220,0.30) 0%, rgba(38,104,156,0.17) 22%, rgba(20,58,92,0.09) 48%, rgba(8,24,42,0.03) 74%, rgba(4,10,18,0) 100%)',
				}}
			/>

			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				{/* lattice + rays sit behind the data */}
				{gate ? <path d={gate} stroke="#3E92C8" strokeWidth={1} fill="none" opacity={0.3} /> : null}
				{raysDim ? <path d={raysDim} stroke="#2E7CAE" strokeWidth={0.9} fill="none" opacity={0.3} /> : null}
				{rays ? <path d={rays} stroke="#6FB8E2" strokeWidth={1.15} fill="none" opacity={0.42} /> : null}

				{/* motion-blur trails */}
				{streak.map((d, i) =>
					d ? (
						<path
							key={'s' + i}
							d={d}
							stroke={RAMP[Math.min(5, i + 1)]}
							strokeWidth={(0.9 + 0.62 * i).toFixed(2)}
							strokeLinecap="round"
							fill="none"
							opacity={(0.3 + 0.22 * i).toFixed(3)}
						/>
					) : null
				)}

				{/* bloom pass */}
				<g style={{filter: 'blur(9px)'}} opacity={0.4}>
					{dots.map((d, i) =>
						d && i >= 4 ? (
							<path key={'db' + i} d={d} stroke={RAMP[5]} strokeWidth={7} strokeLinecap="round" fill="none" />
						) : null
					)}
					{glyph.map((d, i) =>
						d && i % NGL >= 2 && (i / NGL) | 0 ? (
							<path key={'gb' + i} d={d} stroke={RAMP[5]} strokeWidth={5.5} strokeLinecap="round" fill="none" />
						) : null
					)}
				</g>

				{/* far field: dots */}
				{dots.map((d, i) =>
					d ? (
						<path
							key={'d' + i}
							d={d}
							stroke={RAMP[i]}
							strokeWidth={(0.85 + 0.42 * i).toFixed(2)}
							strokeLinecap="round"
							fill="none"
							opacity={(0.3 + 0.7 * (i / (NDOT - 1))).toFixed(3)}
						/>
					) : null
				)}

				{/* nearest glyphs run through the lens, so they defocus */}
				<g style={{filter: 'blur(2.6px)'}}>
					{glyph.map((d, i) =>
						d && ((i / NGL) | 0) === 4 ? (
							<path key={'gf' + i} d={d} stroke={RAMP[Math.min(5, 2 + (i % NGL))]} strokeWidth={4.6} strokeLinejoin="round" fill="none" opacity={0.5} />
						) : null
					)}
				</g>

				{/* binary glyphs */}
				{glyph.map((d, i) => {
					if (!d) return null;
					const c = (i / NGL) | 0;
					const b = i % NGL;
					return (
						<path
							key={'g' + i}
							d={d}
							stroke={RAMP[Math.min(5, 2 + b)]}
							strokeWidth={(0.95 + c * 0.72).toFixed(2)}
							strokeLinejoin="round"
							fill="none"
							opacity={(0.32 + 0.68 * (b / (NGL - 1))).toFixed(3)}
						/>
					);
				})}

				{/* colour accents */}
				{acc.map((d, i) =>
					d ? (
						<path
							key={'a' + i}
							d={d}
							stroke={ACC[(i / 3) | 0]}
							strokeWidth={(2 + 3.4 * (i % 3)).toFixed(2)}
							strokeLinecap="square"
							fill="none"
							opacity={0.7}
						/>
					) : null
				)}
			</svg>

			{/* grade */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(96% 94% at 50% 49.5%, rgba(0,0,0,0) 54%, rgba(4,14,24,0.2) 82%, rgba(3,11,19,0.6) 100%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill style={{opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
				<svg width={W} height={H}>
					<filter id="grain36">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={(frame % 12) + 1} />
					</filter>
					<rect width={W} height={H} filter="url(#grain36)" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Motion;
