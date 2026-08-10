import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/* ------------------------------------------------------------------ *
 *  NEON PARTICLE DRIFT — abstract bokeh background
 *  1920x1080 | 60fps | 15s | perfect loop
 *
 *  Motion model matched to the reference measurement: no global
 *  translation at all (residual 1.0) — every particle travels its own
 *  closed elliptical path at its own low integer frequency, so the
 *  field wanders organically, never scrolls, and loops seamlessly.
 *  All easing is pure sinusoid: continuous in position AND velocity,
 *  which is what reads as "smooth" rather than merely slow.
 * ------------------------------------------------------------------ */

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;

/* neon palette */
const HUE = ['#00E9FF', '#FF2BD6', '#7B5CFF', '#3A8BFF', '#FF6FA8'];
const HUE_W = [0.3, 0.26, 0.2, 0.16, 0.08];
const NH = HUE.length;

/* deterministic bake */
let _s = 0x7c1d93a5 >>> 0;
const rr = () => {
	_s = (Math.imul(_s, 1664525) + 1013904223) >>> 0;
	return _s / 4294967296;
};
const pickHue = () => {
	let r = rr();
	for (let i = 0; i < NH; i++) {
		r -= HUE_W[i];
		if (r <= 0) return i;
	}
	return 0;
};

/* particles cluster along an upper-right diagonal band, exactly like
   the reference: dense top-centre to right, sparse bottom-left */
const density = (x: number, y: number) => {
	const nx = x / W;
	const ny = y / H;
	const band = Math.exp(-Math.pow((ny - 0.30 - 0.30 * (1 - nx)) / 0.34, 2));
	const right = 0.16 + 0.84 * Math.pow(nx, 0.85);
	return Math.min(1, band * right + 0.04);
};
const place = () => {
	for (let k = 0; k < 40; k++) {
		const x = rr() * W;
		const y = rr() * H;
		if (rr() < density(x, y)) return [x, y];
	}
	return [rr() * W, rr() * H];
};

type P = {
	x: number;
	y: number;
	r: number;
	h: number;
	o: number;
	ax: number;
	ay: number;
	fx: number;
	fy: number;
	px: number;
	py: number;
	tf: number;
	tp: number;
	td: number;
};
const mk = (
	rMin: number,
	rMax: number,
	oMin: number,
	oMax: number,
	amp: number,
	twMin: number,
	twDep: number,
	fMax: number
): P => {
	const p = place();
	return {
		x: p[0],
		y: p[1],
		r: rMin + Math.pow(rr(), 1.6) * (rMax - rMin),
		h: pickHue(),
		o: oMin + rr() * (oMax - oMin),
		ax: amp * (0.35 + rr() * 0.65),
		ay: amp * (0.35 + rr() * 0.65),
		fx: 1 + Math.floor(rr() * fMax),
		fy: 1 + Math.floor(rr() * fMax),
		px: rr(),
		py: rr(),
		tf: 1 + Math.floor(rr() * 4),
		tp: rr(),
		td: twMin + rr() * twDep,
	};
};

/* four depth planes */
const FAR: P[] = Array.from({length: 1600}, () => mk(1, 4.4, 0.4, 1, 43, 0.15, 0.85, 4));
const MID: P[] = Array.from({length: 250}, () => mk(3, 13, 0.3, 0.8, 65, 0.32, 0.62, 3));
const BOK: P[] = Array.from({length: 74}, () => mk(26, 132, 0.07, 0.24, 95, 0.52, 0.44, 2));
const HAZE: P[] = Array.from({length: 15}, () => mk(160, 360, 0.028, 0.07, 120, 0.64, 0.36, 2));
const HERO: P[] = Array.from({length: 28}, () => mk(4.5, 11, 0.55, 1, 53, 0.28, 0.7, 3));

const NB = 5;

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const u = frame / durationInFrames;

	/* pre-computed phase helpers */
	const wob = (p: P) => {
		const dx = p.ax * Math.sin(TAU * (u * p.fx + p.px));
		const dy = p.ay * Math.cos(TAU * (u * p.fy + p.py));
		return [p.x + dx, p.y + dy];
	};
	const twk = (p: P) => p.o * (1 - p.td + p.td * (0.5 + 0.5 * Math.sin(TAU * (u * p.tf + p.tp))));

	/* ---- far plane: thousands of pinpoints, one path per hue+level ---- */
	const far: string[] = new Array(NH * NB).fill('');
	for (let i = 0; i < FAR.length; i++) {
		const p = FAR[i];
		const q = wob(p);
		const a = twk(p);
		let bi = ((a * (NB - 1) + 0.5) | 0) as number;
		if (bi < 0) bi = 0;
		else if (bi > NB - 1) bi = NB - 1;
		far[p.h * NB + bi] += 'M' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + 'h.01';
	}

	/* slow focus breathing on the out-of-focus planes */
	const foc = 1 + 0.07 * Math.sin(TAU * u);
	const foc2 = 1 + 0.1 * Math.sin(TAU * u + 1.9);

	/* drifting nebula centres */
	const g1x = 74 + 5 * Math.sin(TAU * u);
	const g1y = 16 + 4 * Math.cos(TAU * u);
	const g2x = 20 + 6 * Math.sin(TAU * u + 2.1);
	const g2y = 80 + 4 * Math.sin(TAU * u + 0.7);
	const g3x = 48 + 7 * Math.cos(TAU * u + 1.2);
	const g3y = 46 + 5 * Math.sin(TAU * u * 2 + 0.4);

	return (
		<AbsoluteFill style={{backgroundColor: '#020008'}}>
			{/* ---------------- nebula field ---------------- */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(58% 62% at ' + g1x.toFixed(2) + '% ' + g1y.toFixed(2) +
						'%, rgba(255,43,214,0.24) 0%, rgba(255,43,214,0.07) 42%, rgba(255,43,214,0) 72%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(56% 60% at ' + g2x.toFixed(2) + '% ' + g2y.toFixed(2) +
						'%, rgba(0,233,255,0.19) 0%, rgba(0,180,255,0.055) 44%, rgba(0,150,255,0) 74%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(72% 74% at ' + g3x.toFixed(2) + '% ' + g3y.toFixed(2) +
						'%, rgba(123,92,255,0.15) 0%, rgba(90,60,220,0.045) 48%, rgba(60,40,180,0) 78%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(30% 34% at ' + (g1x + 6).toFixed(2) + '% ' + (g1y - 6).toFixed(2) +
						'%, rgba(150,255,255,0.30) 0%, rgba(90,220,255,0.11) 38%, rgba(60,180,255,0) 70%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(212deg, rgba(0,233,255,0.09) 0%, rgba(255,43,214,0.045) 46%, rgba(2,0,8,0) 76%)',
				}}
			/>

			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					{HUE.map((c, i) => (
						<radialGradient key={'sd' + i} id={'sd' + i} cx="0.5" cy="0.5" r="0.5">
							<stop offset="0%" stopColor={c} stopOpacity="0.95" />
							<stop offset="42%" stopColor={c} stopOpacity="0.55" />
							<stop offset="100%" stopColor={c} stopOpacity="0" />
						</radialGradient>
					))}
					{HUE.map((c, i) => (
						<radialGradient key={'bk' + i} id={'bk' + i} cx="0.5" cy="0.5" r="0.5">
							<stop offset="0%" stopColor={c} stopOpacity="0.34" />
							<stop offset="52%" stopColor={c} stopOpacity="0.46" />
							<stop offset="80%" stopColor={c} stopOpacity="0.86" />
							<stop offset="93%" stopColor={c} stopOpacity="0.30" />
							<stop offset="100%" stopColor={c} stopOpacity="0" />
						</radialGradient>
					))}
					{HUE.map((c, i) => (
						<radialGradient key={'hz' + i} id={'hz' + i} cx="0.5" cy="0.5" r="0.5">
							<stop offset="0%" stopColor={c} stopOpacity="0.55" />
							<stop offset="64%" stopColor={c} stopOpacity="0.18" />
							<stop offset="100%" stopColor={c} stopOpacity="0" />
						</radialGradient>
					))}
				</defs>

				{/* deepest out-of-focus haze */}
				<g style={{mixBlendMode: 'screen'}}>
					{HAZE.map((p, i) => {
						const q = wob(p);
						return (
							<circle
								key={'hz' + i}
								cx={q[0].toFixed(1)}
								cy={q[1].toFixed(1)}
								r={(p.r * foc2).toFixed(1)}
								fill={'url(#hz' + p.h + ')'}
								opacity={twk(p).toFixed(3)}
							/>
						);
					})}
				</g>

				{/* bokeh discs */}
				<g style={{mixBlendMode: 'screen'}}>
					{BOK.map((p, i) => {
						const q = wob(p);
						return (
							<circle
								key={'bk' + i}
								cx={q[0].toFixed(1)}
								cy={q[1].toFixed(1)}
								r={(p.r * foc).toFixed(1)}
								fill={'url(#bk' + p.h + ')'}
								opacity={twk(p).toFixed(3)}
							/>
						);
					})}
				</g>

				{/* mid plane */}
				<g style={{mixBlendMode: 'screen'}}>
					{MID.map((p, i) => {
						const q = wob(p);
						return (
							<circle
								key={'md' + i}
								cx={q[0].toFixed(1)}
								cy={q[1].toFixed(1)}
								r={p.r.toFixed(1)}
								fill={'url(#sd' + p.h + ')'}
								opacity={twk(p).toFixed(3)}
							/>
						);
					})}
				</g>

				{/* hero glints */}
				<g style={{mixBlendMode: 'screen'}}>
					{HERO.map((p, i) => {
						const q = wob(p);
						const a = twk(p);
						return (
							<g key={'hr' + i}>
								<circle cx={q[0].toFixed(1)} cy={q[1].toFixed(1)} r={(p.r * 9).toFixed(1)} fill={'url(#hz' + p.h + ')'} opacity={(a * 0.4).toFixed(3)} />
								<circle cx={q[0].toFixed(1)} cy={q[1].toFixed(1)} r={(p.r * 3.2).toFixed(1)} fill={'url(#sd' + p.h + ')'} opacity={(a * 0.75).toFixed(3)} />
								<circle cx={q[0].toFixed(1)} cy={q[1].toFixed(1)} r={(p.r * 0.62).toFixed(1)} fill="#FFFFFF" opacity={(a * 0.85).toFixed(3)} />
							</g>
						);
					})}
				</g>

				{/* sharp far plane + bloom */}
				<g style={{mixBlendMode: 'screen'}}>
					<g style={{filter: 'blur(16px)'}} opacity={0.72}>
						{far.map((d, i) =>
							d && i % NB >= 3 ? (
								<path key={'fh' + i} d={d} stroke={HUE[(i / NB) | 0]} strokeWidth={13} strokeLinecap="round" fill="none" />
							) : null
						)}
					</g>
					<g style={{filter: 'blur(6px)'}} opacity={0.95}>
						{far.map((d, i) =>
							d && i % NB >= 2 ? (
								<path key={'fg' + i} d={d} stroke={HUE[(i / NB) | 0]} strokeWidth={5.6} strokeLinecap="round" fill="none" />
							) : null
						)}
					</g>
					{far.map((d, i) =>
						d ? (
							<path
								key={'f' + i}
								d={d}
								stroke={HUE[(i / NB) | 0]}
								strokeWidth={(1 + 2.4 * ((i % NB) / (NB - 1))).toFixed(2)}
								strokeLinecap="round"
								fill="none"
								opacity={(0.34 + 0.66 * ((i % NB) / (NB - 1))).toFixed(3)}
							/>
						) : null
					)}
				</g>
			</svg>

			{/* ---------------- grade ---------------- */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(84% 80% at 66% 30%, rgba(0,0,0,0) 34%, rgba(3,0,10,0.5) 70%, rgba(1,0,5,0.95) 100%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill style={{opacity: 0.045, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
				<svg width={W} height={H}>
					<filter id="grain35">
						<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={(frame % 12) + 1} />
					</filter>
					<rect width={W} height={H} filter="url(#grain35)" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Motion;
