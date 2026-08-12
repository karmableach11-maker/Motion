import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/* ------------------------------------------------------------------ *
 *  VIRUS PARTICLES — medical / microbiology background
 *  1920x1080 | 60fps | 15s
 *
 *  The virion is built procedurally, not imported: a translucent
 *  envelope, granular surface proteins, and club-headed spike
 *  glycoproteins placed on a Fibonacci sphere so they stay evenly
 *  spaced from every viewing angle. Each particle carries its own
 *  3D rotation matrix and is projected by hand, so the spikes on the
 *  far hemisphere really do sit behind the envelope.
 *
 *  Motion matched to the reference measurement: per-element parallax
 *  (residual 1.0 — every particle drifts on its own vector, there is
 *  no rigid pan), 18-55 px/s drift and ~5 deg/s tumble.
 * ------------------------------------------------------------------ */

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;

/* palette */
const C_HI = '#EBF9FF';
const C_MID = '#8FCDEC';
const C_LOW = '#3E7FA8';
const C_DEEP = '#1B4A70';

let _s = 0x3ad9f157 >>> 0;
const rr = () => {
	_s = (Math.imul(_s, 1664525) + 1013904223) >>> 0;
	return _s / 4294967296;
};

/* ---------------- virion geometry ---------------- */
const fib = (n: number) => {
	const out: number[][] = [];
	const ga = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < n; i++) {
		const y = 1 - (i / (n - 1)) * 2;
		const r = Math.sqrt(Math.max(0, 1 - y * y));
		const th = i * ga;
		out.push([Math.cos(th) * r, y, Math.sin(th) * r]);
	}
	return out;
};
const NSPIKE = 86;
const NGRAN = 230;
const SPIKE = fib(NSPIKE);
const SPLEN = SPIKE.map(() => 0.24 + rr() * 0.08);
const SPKNB = SPIKE.map(() => 0.048 + rr() * 0.028);
const GRAN = fib(NGRAN).map((d) => [d[0], d[1], d[2], 0.86 + rr() * 0.12]);

/* ---------------- particle instances ---------------- */
type V = {
	x: number;
	y: number;
	r: number;
	blur: number;
	op: number;
	vx: number;
	vy: number;
	ax: number;
	ay: number;
	az: number;
	wx: number;
	wy: number;
	wz: number;
};
/* Particles live on a wrap torus larger than the frame. Seeding them on a
   jittered grid across that WHOLE torus (not just the visible frame) is what
   keeps on-screen density constant: uniform translation preserves an evenly
   spaced set forever, so the frame never empties out as the drift carries
   the first batch away. ~8 of the 20 are in shot at any moment, matching
   the reference's population. */
const MG = 420;
const SPX = W + 2 * MG;
const SPY = H + 2 * MG;
const GCOL = 5;
const GROW = 4;
const RSET = [286, 176, 104, 230, 66, 142, 198, 84, 252, 116, 158, 52, 128, 92, 176, 74, 212, 58, 148, 98];
const VIR: V[] = Array.from({length: GCOL * GROW}, (_, i) => {
	const cxi = i % GCOL;
	const cyi = (i / GCOL) | 0;
	const R = RSET[i];
	/* focal plane sits on the mid-size virions; everything nearer or
	   further defocuses, which is what gives the shot its depth */
	const bl = Math.min(21, Math.max(0, ((Math.abs(R - 168) - 42) / 110) * 20));
	/* measured on the reference by correlation-gated tracking of isolated
	   virions: 30 px/s at 700w => ~82 px/s at this width */
	const sp = 58 + rr() * 52;
	const dir = (i / (GCOL * GROW)) * TAU + (rr() - 0.5) * 0.55;
	return {
		x: -MG + (cxi + 0.5 + (rr() - 0.5) * 0.7) * (SPX / GCOL),
		y: -MG + (cyi + 0.5 + (rr() - 0.5) * 0.7) * (SPY / GROW),
		r: R,
		blur: bl < 0.9 ? 0 : bl,
		op: 1 - bl * 0.028,
		vx: Math.cos(dir) * sp,
		vy: Math.sin(dir) * sp * 0.72,
		ax: rr() * TAU,
		ay: rr() * TAU,
		az: rr() * TAU,
		/* reference tumble measured at ~15 deg/s */
		wx: (rr() - 0.5) * 0.19,
		wy: 0.23 + rr() * 0.1,
		wz: (rr() - 0.5) * 0.14,
	};
});

/* ---------------- dust ---------------- */
const ND = 300;
const DX = new Float32Array(ND);
const DY = new Float32Array(ND);
const DR = new Float32Array(ND);
const DB = new Float32Array(ND);
const DV = new Float32Array(ND);
const DU = new Float32Array(ND);
const DF = new Float32Array(ND);
const DP = new Float32Array(ND);
for (let i = 0; i < ND; i++) {
	DX[i] = rr() * (W + 200) - 100;
	DY[i] = rr() * (H + 200) - 100;
	DR[i] = 0.8 + Math.pow(rr(), 2.2) * 5.5;
	DB[i] = 0.25 + rr() * 0.7;
	const d = rr() * TAU;
	const s = 16 + rr() * 40;
	DV[i] = Math.cos(d) * s;
	DU[i] = Math.sin(d) * s;
	DF[i] = 1 + Math.floor(rr() * 3);
	DP[i] = rr();
}

const NBK = 22;
const BK = Array.from({length: NBK}, () => ({
	x: rr() * (W + 300) - 150,
	y: rr() * (H + 300) - 150,
	r: 26 + rr() * 96,
	o: 0.03 + rr() * 0.07,
	vx: (rr() - 0.5) * 12,
	vy: (rr() - 0.5) * 9,
}));

const wrap = (v: number, lo: number, hi: number) => {
	const s = hi - lo;
	return ((((v - lo) % s) + s) % s) + lo;
};

const NB = 4;

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;
	const u = frame / durationInFrames;

	/* ---------- dust ---------- */
	let dustA = '';
	let dustB = '';
	let dustC = '';
	for (let i = 0; i < ND; i++) {
		const x = wrap(DX[i] + DV[i] * t, -100, W + 100);
		const y = wrap(DY[i] + DU[i] * t, -100, H + 100);
		const b = DB[i] * (0.55 + 0.45 * Math.sin(TAU * (u * DF[i] + DP[i])));
		const s = 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'h.01';
		if (DR[i] > 3.4) dustC += s;
		else if (b > 0.55) dustA += s;
		else dustB += s;
	}

	/* ---------- virions ---------- */
	const parts = VIR.map((v, vi) => {
		const X = wrap(v.x + v.vx * t, -MG, W + MG);
		const Y = wrap(v.y + v.vy * t, -MG, H + MG);
		const R = v.r;

		/* rotation matrix: Rz * Ry * Rx */
		const ax = v.ax + v.wx * t;
		const ay = v.ay + v.wy * t;
		const az = v.az + v.wz * t;
		const cx = Math.cos(ax);
		const sx = Math.sin(ax);
		const cy = Math.cos(ay);
		const sy = Math.sin(ay);
		const cz = Math.cos(az);
		const sz = Math.sin(az);
		const m00 = cz * cy;
		const m01 = cz * sy * sx - sz * cx;
		const m02 = cz * sy * cx + sz * sx;
		const m10 = sz * cy;
		const m11 = sz * sy * sx + cz * cx;
		const m12 = sz * sy * cx - cz * sx;
		const m20 = -sy;
		const m21 = cy * sx;
		const m22 = cy * cx;

		const stalkF: string[] = new Array(NB).fill('');
		const stalkB: string[] = new Array(NB).fill('');
		const knobF: string[] = new Array(NB).fill('');
		const knobB: string[] = new Array(NB).fill('');
		let knobR = 0;

		for (let i = 0; i < NSPIKE; i++) {
			const d = SPIKE[i];
			const px = m00 * d[0] + m01 * d[1] + m02 * d[2];
			const py = m10 * d[0] + m11 * d[1] + m12 * d[2];
			const pz = m20 * d[0] + m21 * d[1] + m22 * d[2];
			const l0 = 0.93;
			const l1 = 1 + SPLEN[i];
			const lk = l1 + SPKNB[i] * 0.55;
			const front = pz >= 0;
			const sh = 0.34 + 0.66 * (0.5 + 0.5 * pz);
			let bi = ((sh * (NB - 1) + 0.4) | 0) as number;
			if (bi < 0) bi = 0;
			else if (bi > NB - 1) bi = NB - 1;
			const s =
				'M' + (X + px * R * l0).toFixed(1) + ' ' + (Y - py * R * l0).toFixed(1) +
				'L' + (X + px * R * l1).toFixed(1) + ' ' + (Y - py * R * l1).toFixed(1);
			const kb =
				'M' + (X + px * R * lk).toFixed(1) + ' ' + (Y - py * R * lk).toFixed(1) + 'h.01';
			if (front) {
				stalkF[bi] += s;
				knobF[bi] += kb;
			} else {
				stalkB[bi] += s;
				knobB[bi] += kb;
			}
			knobR += SPKNB[i];
		}
		knobR = (knobR / NSPIKE) * R * 1.55;

		const gran: string[] = new Array(NB).fill('');
		for (let i = 0; i < NGRAN; i++) {
			const d = GRAN[i];
			const px = m00 * d[0] + m01 * d[1] + m02 * d[2];
			const py = m10 * d[0] + m11 * d[1] + m12 * d[2];
			const pz = m20 * d[0] + m21 * d[1] + m22 * d[2];
			if (pz < -0.25) continue;
			const sh = (0.3 + 0.7 * (0.35 + 0.65 * pz)) * d[3];
			let bi = ((sh * (NB - 1) + 0.4) | 0) as number;
			if (bi < 0) bi = 0;
			else if (bi > NB - 1) bi = NB - 1;
			gran[bi] +=
				'M' + (X + px * R * 0.9).toFixed(1) + ' ' + (Y - py * R * 0.9).toFixed(1) + 'h.01';
		}

		return {X, Y, R, vi, blur: v.blur, op: v.op, stalkF, stalkB, knobF, knobB, gran, knobR};
	});
	/* far particles first so the sharp mid-ground reads on top */
	parts.sort((a, b) => a.R - b.R);

	const SW = (R: number) => Math.max(0.7, R * 0.017);

	return (
		<AbsoluteFill style={{backgroundColor: '#04101F'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(84% 92% at 38% 28%, #16436D 0%, #0C2A4C 34%, #05172C 64%, #020A14 100%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(38% 44% at ' + (30 + 4 * Math.sin(TAU * u)).toFixed(2) + '% ' +
						(22 + 3 * Math.cos(TAU * u)).toFixed(2) +
						'%, rgba(86,180,235,0.22) 0%, rgba(50,130,190,0.08) 46%, rgba(20,70,120,0) 78%)',
				}}
			/>

			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<radialGradient id="env" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0%" stopColor="#8FD4F5" stopOpacity="0.1" />
						<stop offset="58%" stopColor="#7EC8EE" stopOpacity="0.16" />
						<stop offset="86%" stopColor="#C8ECFF" stopOpacity="0.3" />
						<stop offset="100%" stopColor="#DCF3FF" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="core" cx="0.42" cy="0.36" r="0.62">
						<stop offset="0%" stopColor="#BFE6FC" stopOpacity="0.28" />
						<stop offset="100%" stopColor="#1C4E78" stopOpacity="0.03" />
					</radialGradient>
					<radialGradient id="bok" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0%" stopColor="#A9DCF7" stopOpacity="0.5" />
						<stop offset="70%" stopColor="#7CC0E8" stopOpacity="0.2" />
						<stop offset="100%" stopColor="#5AA6D8" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* soft depth haze */}
				<g>
					{BK.map((b, i) => (
						<circle
							key={'bk' + i}
							cx={wrap(b.x + b.vx * t, -150, W + 150).toFixed(1)}
							cy={wrap(b.y + b.vy * t, -150, H + 150).toFixed(1)}
							r={b.r}
							fill="url(#bok)"
							opacity={b.o}
						/>
					))}
				</g>

				{dustC ? <path d={dustC} stroke="#BEE4FA" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.16} /> : null}
				{dustB ? <path d={dustB} stroke="#9FD2F0" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.4} /> : null}
				{dustA ? <path d={dustA} stroke="#E6F7FF" strokeWidth={2.1} strokeLinecap="round" fill="none" opacity={0.8} /> : null}

				{parts.map((p) => (
					<g key={'v' + p.vi} style={p.blur ? {filter: 'blur(' + p.blur + 'px)'} : undefined} opacity={p.op}>
						{/* spikes on the far hemisphere, seen through the envelope */}
						{p.stalkB.map((d, i) =>
							d ? (
								<path key={'sb' + i} d={d} stroke={[C_DEEP, C_LOW, C_MID, C_HI][i]} strokeWidth={SW(p.R)} strokeLinecap="round" fill="none" opacity={0.16 + 0.1 * i} />
							) : null
						)}
						{p.knobB.map((d, i) =>
							d ? (
								<path key={'kb' + i} d={d} stroke={[C_DEEP, C_LOW, C_MID, C_HI][i]} strokeWidth={p.knobR} strokeLinecap="round" fill="none" opacity={0.2 + 0.12 * i} />
							) : null
						)}

						{/* envelope */}
						<circle cx={p.X} cy={p.Y} r={p.R * 0.94} fill="url(#core)" />
						<circle cx={p.X} cy={p.Y} r={p.R * 0.96} fill="url(#env)" />

						{/* surface proteins */}
						{p.gran.map((d, i) =>
							d ? (
								<path key={'gr' + i} d={d} stroke={[C_DEEP, C_LOW, C_MID, C_HI][i]} strokeWidth={Math.max(1.1, p.R * 0.034)} strokeLinecap="round" fill="none" opacity={0.44 + 0.2 * i} />
							) : null
						)}

						{/* spikes on the near hemisphere */}
						{p.stalkF.map((d, i) =>
							d ? (
								<path key={'sf' + i} d={d} stroke={[C_DEEP, C_LOW, C_MID, C_HI][i]} strokeWidth={SW(p.R)} strokeLinecap="round" fill="none" opacity={0.44 + 0.2 * i} />
							) : null
						)}
						<g style={{filter: 'blur(' + Math.max(2, p.R * 0.028).toFixed(1) + 'px)'}} opacity={0.5}>
							{p.knobF.map((d, i) =>
								d && i >= 2 ? (
									<path key={'kg' + i} d={d} stroke="#FFFFFF" strokeWidth={p.knobR * 1.5} strokeLinecap="round" fill="none" />
								) : null
							)}
						</g>
						{p.knobF.map((d, i) =>
							d ? (
								<path key={'kf' + i} d={d} stroke={[C_DEEP, C_LOW, C_MID, '#FFFFFF'][i]} strokeWidth={p.knobR} strokeLinecap="round" fill="none" opacity={0.68 + 0.11 * i} />
							) : null
						)}

						{/* rim light */}
						<circle cx={p.X} cy={p.Y} r={p.R * 0.95} fill="none" stroke="#CDEEFF" strokeWidth={Math.max(0.8, p.R * 0.012)} opacity={0.22} />
					</g>
				))}
			</svg>

			<AbsoluteFill
				style={{
					background:
						'radial-gradient(86% 84% at 42% 34%, rgba(0,0,0,0) 38%, rgba(3,12,25,0.5) 74%, rgba(1,6,13,0.95) 100%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill style={{opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
				<svg width={W} height={H}>
					<filter id="grain37">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={(frame % 12) + 1} />
					</filter>
					<rect width={W} height={H} filter="url(#grain37)" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Motion;
