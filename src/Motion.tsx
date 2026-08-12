import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/* ------------------------------------------------------------------ *
 *  BLOOD CELL FLOW — erythrocytes and leukocytes inside a vessel
 *  1920x1080 | 60fps | 15s | perfect loop
 *
 *  Erythrocytes are modelled as real biconcave discs carrying a 3D
 *  normal, so a cell face-on projects to a circle with its central
 *  depression visible, and the same cell edge-on collapses to the
 *  familiar dumbbell sliver — the shape changes because the geometry
 *  changes, not because a sprite was swapped.
 *
 *  Flow follows a parabolic (Poiseuille) profile: fastest along the
 *  vessel axis, slowest against the wall, which is what real laminar
 *  flow does and what makes the stream read as liquid rather than as
 *  a scrolling layer. Key light sits off to the left, so every cell
 *  carries a rim highlight computed from its own outward normal.
 * ------------------------------------------------------------------ */

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;
const DUR = 15;

/* vessel */
const AXIS = H * 0.52;
const LUMEN = H * 0.44;

/* palette */
const RBC_CORE = '#C8202B';
const WBC_CORE = '#EBDCE0';

let _s = 0x1f6b93d7 >>> 0;
const rr = () => {
	_s = (Math.imul(_s, 1664525) + 1013904223) >>> 0;
	return _s / 4294967296;
};

/* ---------------- cell instances ---------------- */
type C = {
	kind: number; /* 0 erythrocyte, 1 leukocyte, 2 platelet */
	x0: number;
	y: number;
	z: number;
	r: number;
	sp: number;
	span: number;
	bl: number;
	br: number;
	nx: number;
	ny: number;
	nz: number;
	wx: number;
	wy: number;
	wob: number;
	wf: number;
	ph: number;
	lump: number[];
};

const MG = 320;
const VIS = W + 2 * MG;

const mkCell = (kind: number, z: number, y: number, seq: number): C => {
	const sc = 0.42 + 0.92 * z;
	/* parabolic laminar profile: fastest on the axis, slowest at the wall */
	const rel = Math.min(1, Math.abs(y - AXIS) / LUMEN);
	const prof = 0.62 + 0.38 * (1 - rel * rel);
	/* speed floor is chosen so even the slowest cell travels further than the
	   wrap window in one loop; span is then exactly that travel distance, so
	   every cell returns to its own start position at t = DUR */
	const sp = (300 + 320 * z) * prof;
	const span = sp * DUR;
	const base = kind === 1 ? 96 : kind === 2 ? 24 : 74;
	const a = rr() * TAU;
	const b = Math.acos(2 * rr() - 1);
	return {
		kind,
		/* low-discrepancy phase so cells stay evenly spread along the vessel
		   instead of clumping the way pure random seeding does */
		x0: (((seq * 0.6180339887) % 1) + (rr() - 0.5) * 0.05) * span,
		y,
		z,
		r: base * sc * (kind === 2 ? 0.7 + rr() * 0.7 : 0.86 + rr() * 0.3),
		sp,
		span,
		bl: Math.min(20, Math.abs(z - 0.63) * 30),
		br: 0.42 + 0.58 * z,
		nx: Math.sin(b) * Math.cos(a),
		ny: Math.sin(b) * Math.sin(a),
		nz: Math.cos(b),
		/* tumble and wobble are whole numbers of turns per loop, so the cell
		   is in exactly the same pose at t = 0 and t = DUR */
		wx: (rr() < 0.5 ? -1 : 1) * (1 + Math.floor(rr() * 2)),
		wy: (rr() < 0.5 ? -1 : 1) * (1 + Math.floor(rr() * 2)),
		wob: 6 + rr() * 14,
		wf: 1 + Math.floor(rr() * 3),
		ph: rr(),
		lump: [rr() * TAU, rr() * TAU, rr() * TAU, 0.05 + rr() * 0.05, 0.03 + rr() * 0.04],
	};
};

const CELLS: C[] = [];
for (let i = 0; i < 106; i++) {
	const z = i / 105;
	const gy = ((i * 0.7548776662) % 1) * 2 - 1;
	const yy = AXIS + (gy + (rr() - 0.5) * 0.16) * LUMEN * 0.98;
	CELLS.push(mkCell(0, z * 0.98 + rr() * 0.02, yy, i));
}
for (let i = 0; i < 5; i++) {
	const gy = ((i * 0.7548776662 + 0.31) % 1) * 2 - 1;
	CELLS.push(mkCell(1, 0.24 + (i / 4) * 0.66, AXIS + gy * LUMEN * 0.82, i * 11 + 3));
}
for (let i = 0; i < 30; i++) {
	const gy = ((i * 0.7548776662 + 0.62) % 1) * 2 - 1;
	CELLS.push(mkCell(2, rr(), AXIS + gy * LUMEN, i * 7 + 5));
}
CELLS.sort((a, b) => a.z - b.z);

/* plasma streaks */
const NS = 46;
const STR = Array.from({length: NS}, () => {
	const z = rr();
	const y = AXIS + (rr() * 2 - 1) * LUMEN * 1.05;
	const rel = Math.min(1, Math.abs(y - AXIS) / LUMEN);
	const sp = (300 + 320 * z) * (0.62 + 0.38 * (1 - rel * rel));
	const span = sp * DUR;
	return {
		x0: rr() * span,
		y,
		sp,
		span,
		len: 60 + rr() * 320,
		th: 1 + rr() * 5,
		o: 0.04 + rr() * 0.12,
	};
});

/* wall texture blobs */
const NWT = 60;
const WT = Array.from({length: NWT}, () => ({
	x: rr() * 2880,
	t: rr() < 0.5 ? 0 : 1,
	d: rr(),
	r: 18 + rr() * 84,
	o: 0.05 + rr() * 0.13,
}));

const wrap = (v: number, s: number) => ((v % s) + s) % s;

/* rotated-ellipse outline */
const ell = (
	cx: number, cy: number, a: number, b: number, ang: number, n: number
) => {
	const ca = Math.cos(ang);
	const sa = Math.sin(ang);
	let d = '';
	for (let i = 0; i < n; i++) {
		const th = (i / n) * TAU;
		const ex = a * Math.cos(th);
		const ey = b * Math.sin(th);
		d +=
			(i ? 'L' : 'M') + (cx + ex * ca - ey * sa).toFixed(1) + ' ' +
			(cy + ex * sa + ey * ca).toFixed(1);
	}
	return d + 'Z';
};

/* the arc of an ellipse whose outward normal faces the key light */
const rim = (
	cx: number, cy: number, a: number, b: number, ang: number, n: number
) => {
	const ca = Math.cos(ang);
	const sa = Math.sin(ang);
	let d = '';
	let on = false;
	for (let i = 0; i <= n; i++) {
		const th = (i / n) * TAU;
		const ex = a * Math.cos(th);
		const ey = b * Math.sin(th);
		const gx = (Math.cos(th) / a) * ca - (Math.sin(th) / b) * sa;
		const gy = (Math.cos(th) / a) * sa + (Math.sin(th) / b) * ca;
		const m = Math.hypot(gx, gy) || 1;
		if (gx / m > -0.12) {
			on = false;
			continue;
		}
		d +=
			(on ? 'L' : 'M') + (cx + ex * ca - ey * sa).toFixed(1) + ' ' +
			(cy + ex * sa + ey * ca).toFixed(1);
		on = true;
	}
	return d;
};

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;
	const u = frame / durationInFrames;

	/* ---------- vessel wall boundaries (period 2880 px, 192 px/s) ---------- */
	const wallOff = 192 * t;
	const wallY = (x: number, top: boolean) => {
		const p = (x + (top ? 0 : 940) - wallOff) / 2880;
		const s =
			Math.sin(TAU * p) * 1 +
			Math.sin(TAU * 2 * p + 1.3) * 0.52 +
			Math.sin(TAU * 3 * p + 2.6) * 0.3 +
			Math.sin(TAU * 5 * p + 0.4) * 0.16;
		return top ? H * 0.055 + s * 44 : H * 0.945 + s * 46;
	};
	let wallTop = 'M-20 -20L' + (W + 20) + ' -20';
	let wallBot = 'M-20 ' + (H + 20) + 'L' + (W + 20) + ' ' + (H + 20);
	for (let i = 0; i <= 48; i++) {
		const x = -20 + (i / 48) * (W + 40);
		wallTop = i === 0 ? 'M' + x.toFixed(1) + ' ' + wallY(x, true).toFixed(1) : wallTop + 'L' + x.toFixed(1) + ' ' + wallY(x, true).toFixed(1);
	}
	wallTop += 'L' + (W + 20) + ' -40L-20 -40Z';
	for (let i = 0; i <= 48; i++) {
		const x = -20 + (i / 48) * (W + 40);
		wallBot = i === 0 ? 'M' + x.toFixed(1) + ' ' + wallY(x, false).toFixed(1) : wallBot + 'L' + x.toFixed(1) + ' ' + wallY(x, false).toFixed(1);
	}
	wallBot += 'L' + (W + 20) + ' ' + (H + 40) + 'L-20 ' + (H + 40) + 'Z';

	/* ---------- plasma ---------- */
	let plasma = '';
	const plasmaEls = STR.map((s, i) => {
		const x = wrap(s.x0 + s.sp * t, s.span) - MG;
		return {x, y: s.y, len: s.len, th: s.th, o: s.o, i};
	}).filter((s) => s.x > -520 && s.x < W + 120);

	/* ---------- cells ---------- */
	type Draw = {bl: number; el: React.ReactNode};
	const draws: Draw[] = [];

	for (let ci = 0; ci < CELLS.length; ci++) {
		const c = CELLS[ci];
		const x = wrap(c.x0 + c.sp * t, c.span) - MG;
		if (x < -300 || x > W + 300) continue;
		const y = c.y + Math.sin(TAU * (u * c.wf + c.ph)) * c.wob;
		const R = c.r;
		const bl = Math.round(c.bl / 3.5) * 3.5;

		if (c.kind === 1) {
			/* ---- leukocyte: lumpy, translucent, lobed nucleus ---- */
			const n = 46;
			let d = '';
			for (let i = 0; i < n; i++) {
				const th = (i / n) * TAU;
				const rad =
					R *
					(1 +
						c.lump[3] * Math.sin(3 * th + c.lump[0] + TAU * u) +
						c.lump[4] * Math.sin(5 * th + c.lump[1] - TAU * u * 2) +
						0.028 * Math.sin(8 * th + c.lump[2]));
				d +=
					(i ? 'L' : 'M') + (x + Math.cos(th) * rad).toFixed(1) + ' ' +
					(y + Math.sin(th) * rad).toFixed(1);
			}
			d += 'Z';
			let vil = '';
			for (let i = 0; i < 40; i++) {
				const th = (i / 40) * TAU + c.lump[0];
				const rad = R * (1 + c.lump[3] * Math.sin(3 * th + c.lump[0] + TAU * u));
				const l = rad * (1.05 + 0.1 * Math.sin(i * 2.7 + TAU * u * 2));
				vil +=
					'M' + (x + Math.cos(th) * rad * 0.98).toFixed(1) + ' ' + (y + Math.sin(th) * rad * 0.98).toFixed(1) +
					'L' + (x + Math.cos(th) * l).toFixed(1) + ' ' + (y + Math.sin(th) * l).toFixed(1);
			}
			let nuc = '';
			for (let k = 0; k < 4; k++) {
				const a = c.lump[0] + k * 1.7 + TAU * u;
				nuc += ell(
					x + Math.cos(a) * R * 0.3,
					y + Math.sin(a) * R * 0.26,
					R * 0.36,
					R * 0.29,
					a * 0.7,
					20
				);
			}
			draws.push({
				bl,
				el: (
					<g key={'c' + ci} opacity={c.br}>
						<path d={vil} stroke="#F6E9EC" strokeWidth={Math.max(1, R * 0.03)} fill="none" opacity={0.62} />
						<path d={d} fill="url(#wbcS)" />
						<path d={d} fill="none" stroke="url(#wrimG)" strokeWidth={Math.max(1.4, R * 0.075)} />
						<path d={nuc} fill="#6E3C74" opacity={0.62} />
						<path d={nuc} fill="none" stroke="#C79ACA" strokeWidth={Math.max(0.9, R * 0.024)} opacity={0.62} />

					</g>
				),
			});
			continue;
		}

		/* ---- erythrocyte / platelet: oriented biconcave disc ---- */
		const r1 = TAU * u * c.wx;
		const r2 = TAU * u * c.wy;
		const ax = c.nx * Math.cos(r1) - c.nz * Math.sin(r1);
		const az = c.nx * Math.sin(r1) + c.nz * Math.cos(r1);
		const ay2 = c.ny * Math.cos(r2) - az * Math.sin(r2);
		const az2 = c.ny * Math.sin(r2) + az * Math.cos(r2);
		const m = Math.hypot(ax, ay2, az2) || 1;
		const nx = ax / m;
		const ny = ay2 / m;
		const nz = az2 / m;

		const TH = c.kind === 2 ? 0.42 : 0.3;
		const a = R;
		const b = R * Math.sqrt(nz * nz + TH * TH);
		const ang = Math.atan2(-ny, nx) + Math.PI / 2;
		const face = Math.min(1, Math.max(0, (Math.abs(nz) - 0.3) / 0.6));

		draws.push({
			bl,
			el: (
				<g key={'c' + ci} opacity={c.br}>
					<path d={ell(x, y, a, b, ang, 36)} fill={c.kind === 2 ? 'url(#pltS)' : 'url(#rbcS)'} />
					{face > 0.03 && c.kind === 0 ? (
						<>
							<path
								d={ell(x, y, a * 0.68, b * 0.68, ang, 30)}
								fill="none"
								stroke="url(#torG)"
								strokeWidth={Math.max(1.4, R * 0.26)}
								opacity={face * 0.7}
							/>
							<path
								d={ell(x, y, a * 0.5, b * 0.5, ang, 26)}
								fill="url(#dipG)"
								opacity={face * 0.95}
							/>
						</>
					) : null}
					<path
						d={ell(x, y, a * 0.97, b * 0.97, ang, 44)}
						fill="none"
						stroke="url(#rimG)"
						strokeWidth={Math.max(1.2, R * 0.085)}
					/>
				</g>
			),
		});
	}

	/* group by blur so depth of field costs one filter per band */
	const bands = new Map<number, React.ReactNode[]>();
	for (const d of draws) {
		const k = d.bl;
		if (!bands.has(k)) bands.set(k, []);
		(bands.get(k) as React.ReactNode[]).push(d.el);
	}
	const bandKeys = Array.from(bands.keys()).sort((p, q) => q - p);

	return (
		<AbsoluteFill style={{backgroundColor: '#160106'}}>
			{/* ---------------- vessel interior ---------------- */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(96% 108% at 26% 50%, #961A22 0%, #6A0F18 30%, #430710 60%, #240309 100%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(36% 62% at ' + (6 + 3 * Math.sin(TAU * u)).toFixed(2) +
						'% 44%, rgba(255,132,96,0.30) 0%, rgba(224,64,52,0.12) 44%, rgba(140,20,24,0) 76%)',
				}}
			/>

			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<radialGradient id="rbcS" cx="0.5" cy="0.5" r="0.64" fx="0.27" fy="0.25">
						<stop offset="0%" stopColor="#FF8E70" />
						<stop offset="26%" stopColor="#EE4A48" />
						<stop offset="58%" stopColor="#BC1C28" />
						<stop offset="86%" stopColor="#7A0A18" />
						<stop offset="100%" stopColor="#4A030E" />
					</radialGradient>
					<radialGradient id="pltS" cx="0.5" cy="0.5" r="0.64" fx="0.28" fy="0.26">
						<stop offset="0%" stopColor="#FFE2C2" />
						<stop offset="42%" stopColor="#EE9A80" />
						<stop offset="100%" stopColor="#8A2428" />
					</radialGradient>
					<linearGradient id="rimG" x1="0" y1="0.18" x2="1" y2="0.86">
						<stop offset="0%" stopColor="#FFD6C2" stopOpacity="0.92" />
						<stop offset="22%" stopColor="#FFAE92" stopOpacity="0.6" />
						<stop offset="48%" stopColor="#FF8E70" stopOpacity="0.16" />
						<stop offset="66%" stopColor="#FF8E70" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="torG" x1="0" y1="0.1" x2="1" y2="0.9">
						<stop offset="0%" stopColor="#FF9C7E" stopOpacity="0.6" />
						<stop offset="40%" stopColor="#E4444A" stopOpacity="0.34" />
						<stop offset="78%" stopColor="#B01A26" stopOpacity="0" />
					</linearGradient>
					<radialGradient id="dipG" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0%" stopColor="#4A0410" stopOpacity="0.92" />
						<stop offset="52%" stopColor="#7C0C1A" stopOpacity="0.66" />
						<stop offset="100%" stopColor="#B01A26" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="wbcS" cx="0.5" cy="0.5" r="0.64" fx="0.28" fy="0.24">
						<stop offset="0%" stopColor="#FFF8F4" />
						<stop offset="34%" stopColor="#EDD9DC" />
						<stop offset="70%" stopColor="#BE9098" />
						<stop offset="100%" stopColor="#6A4048" />
					</radialGradient>
					<linearGradient id="wrimG" x1="0" y1="0.18" x2="1" y2="0.86">
						<stop offset="0%" stopColor="#FFFDFB" stopOpacity="0.9" />
						<stop offset="26%" stopColor="#FFEDE6" stopOpacity="0.5" />
						<stop offset="56%" stopColor="#FFE0D4" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#2A0208" />
						<stop offset="70%" stopColor="#5E0C16" />
						<stop offset="100%" stopColor="#8A1A22" />
					</linearGradient>
					<linearGradient id="wallG2" x1="0" y1="1" x2="0" y2="0">
						<stop offset="0%" stopColor="#2A0208" />
						<stop offset="70%" stopColor="#5E0C16" />
						<stop offset="100%" stopColor="#8A1A22" />
					</linearGradient>
					<linearGradient id="plasG" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#FFC9A8" stopOpacity="0" />
						<stop offset="52%" stopColor="#FFD8BC" stopOpacity="1" />
						<stop offset="100%" stopColor="#FFC9A8" stopOpacity="0" />
					</linearGradient>
				</defs>

				{/* plasma streaks behind the cells */}
				<g style={{filter: 'blur(7px)'}}>
					{plasmaEls.map((s) => (
						<rect
							key={'p' + s.i}
							x={s.x}
							y={s.y - s.th / 2}
							width={s.len}
							height={s.th}
							rx={s.th / 2}
							fill="url(#plasG)"
							opacity={s.o}
						/>
					))}
				</g>

				{/* cells, far bands first */}
				{bandKeys.map((k) => (
					<g key={'b' + k} style={{filter: 'blur(' + Math.max(1.1, k).toFixed(1) + 'px)'}}>
						{bands.get(k)}
					</g>
				))}

				{/* vessel wall, in front of everything */}
				<g style={{filter: 'blur(9px)'}}>
					<path d={wallTop} fill="url(#wallG)" opacity={0.96} />
					<path d={wallBot} fill="url(#wallG2)" opacity={0.96} />
					{WT.map((b, i) => {
						const x = wrap(b.x - wallOff, 2880) - 480;
						if (x < -160 || x > W + 160) return null;
						const y = b.t
							? wallY(x, true) - b.r * 0.5 * b.d
							: wallY(x, false) + b.r * 0.5 * b.d;
						return <ellipse key={'wt' + i} cx={x} cy={y} rx={b.r * 1.5} ry={b.r * 0.55} fill="#B02630" opacity={b.o} />;
					})}
				</g>
			</svg>

			{/* ---------------- grade ---------------- */}
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(96deg, rgba(255,150,110,0.10) 0%, rgba(255,110,80,0.03) 30%, rgba(20,1,4,0) 62%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(92% 90% at 34% 48%, rgba(0,0,0,0) 46%, rgba(26,2,7,0.4) 78%, rgba(12,0,3,0.88) 100%)',
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill style={{opacity: 0.045, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
				<svg width={W} height={H}>
					<filter id="grain38">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={(frame % 12) + 1} />
					</filter>
					<rect width={W} height={H} filter="url(#grain38)" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Motion;
