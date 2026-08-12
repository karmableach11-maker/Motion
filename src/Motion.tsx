import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * MOTION 63 — "DEVICE TRIO CHROMA"
 * ---------------------------------------------------------------------------
 * Laptop, tablet and phone on a white studio sweep. The laptop opens, then all
 * three panels come up as clean chroma keys eight frames apart, while the
 * camera dollies steadily in.
 *
 * WHERE THE CAMERA COMES FROM
 * ---------------------------
 * The dolly, the elevation and the lid are not invented here. They were fitted
 * to a single-laptop reference (700x394, 25 fps, 375 frames, 15.000 s, one
 * continuous take) and are carried over unchanged. [obs] is what came off that
 * clip; [int] is an inference stated as such.
 *
 * [obs] The push-in is a constant-velocity dolly, not a zoom. Fitting the
 *       eighteen measured screen widths from t=1.20 to t=14.80:
 *           1/w = -2.032734e-4 * t + 4.942581e-3
 *       reproduces every one to 0.89 px rms across widths 211..517. A straight
 *       line through the widths themselves is 24x worse at 21.42 px rms.
 *       Reciprocal-linear IS constant velocity, since apparent size goes as
 *       1/z. R(t) below is that fit.
 * [obs] The panel measures 1.598:1 at t=1.20 and 1.601:1 at t=14.80, and its
 *       width is dead constant down every row of every frame. A panel that
 *       never foreshortens is a panel normal to the view axis — which is what
 *       fixes the lid's resting angle, and the lean of the other two, at
 *       exactly 90 deg plus the camera's own elevation.
 * [obs] The screen's centre sits at (349.5, 195.5) at t=1.20 and (349.5,
 *       194.5) at t=14.80 against a frame centre of (350, 197): the dolly runs
 *       straight down the panel's own axis and never drifts.
 * [obs] Deck geometry, as three ratios against the panel width at t=6.00: the
 *       lid measures 1.0669, the deck's front edge 1.3309, the deck stands
 *       0.1524 tall. Elevation and camera distance are degenerate against
 *       those — 400 units of deck depth at 7.30 deg fits as well as 760 at
 *       3.85 — so the deck was fixed at a real machine's proportion and the
 *       camera solved from there: 3.98 deg, 3712 units out at t=6.00.
 * [obs] The lid opens between t=0.085 and t=0.765, its top edge travelling
 *       y=280 to y=119. Against those eleven samples the best of fourteen
 *       easing families is smoothstep^0.72 at 0.0072 rms — but that fits the
 *       TRAVEL, not the angle, and the two are not interchangeable. See the
 *       note at the lid below.
 * [obs] Panels do not cut on, they ramp: black through f27, then (30,57,31),
 *       (52,108,51), (74,161,73) and full at (96,212,95) on f31 — a straight
 *       four-frame ramp from black over 0.16 s.
 * [obs] The sweep runs #eae7eb at top left to #bcb9bd at right and bottom, a
 *       cool neutral with blue a shade over red; deck and palmrest #ccccCF,
 *       keys #434144.
 * [int] Three devices will not fit the reference's framing, so the camera is
 *       pulled back by 2.15 — R(t) scaled, nothing else. The dolly stays
 *       constant-velocity and the panels stay normal to the axis; what changes
 *       is that depth-over-distance drops from 0.389 to 0.181 at the end, so
 *       the shot is flatter than the reference. The flanking devices then sit
 *       outside the lid's own half-width, so nothing crowds the hero panel:
 *       at the closest point the tablet's inner edge clears the lid by 157 px. That is simply what happens
 *       when you back up to fit more in, and it is stated rather than hidden.
 * [int] The reference's panel is #5ad15b — a soft grass green carrying red and
 *       blue near 90 of 255, which is a lot of off-channel energy for a keyer.
 *       All three panels here are #06d24e: same luminance band, red and blue
 *       down to 6 and 78. The spill onto bezels and sweep is deliberately
 *       tight for the same reason — green that creeps past a bezel is what
 *       tears holes in a matte.
 */

/* ------------------------------------------------------------------ setup */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const seg = (f: number, a: number, b: number) => clamp((f - a) / (b - a), 0, 1);

/* ------------------------------------------------------------- the camera */

const CAM_EL = (3.98 * Math.PI) / 180;
const SA = Math.sin(CAM_EL);
const CA = Math.cos(CAM_EL);

/* every panel in the shot leans back by exactly the camera's own elevation,
   which is what keeps all three unforeshortened and square to the keyer */
const PHI_OPEN = Math.PI / 2 + CAM_EL;

const FOC = 2735.3;
const PULL = 2.15; // [int] backed off so three devices fit; see the note above
const R0 = FOC * 1000 * 1.801896e-3 * PULL;
const RV = FOC * 1000 * 7.41063e-5 * PULL;

const CX = 960;
/* A laptop carries its mass below its panel — deck, keyboard, palmrest — and
   the two flanking devices hang below theirs as well, so a trio centred on the
   hero panel sits about 70 px low. The frame is lifted once, statically: a
   fixed offset re-centres the GROUP without reintroducing any drift, which is
   the one thing the reference is emphatic about. */
const CY = 500;

type P3 = [number, number, number];
type P2 = [number, number];

const makeProj = (R: number) => {
	const cy = R * SA;
	const cz = R * CA;
	return (p: P3): P2 => {
		const vy = p[1] - cy;
		const vz = p[2] - cz;
		const yc = vy * CA - vz * SA;
		const zc = -(vy * SA + vz * CA);
		const k = FOC / Math.max(zc, 1);
		return [CX + p[0] * k, CY - yc * k];
	};
};
const path = (pts: P2[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join('') + 'Z';

/* a rounded rectangle in a device's own (across, up-from-its-base) plane —
   rounded BEFORE projection, so the corners stay round through perspective */
const roundRect = (w: number, h: number, r: number, v0 = 0): [number, number][] => {
	const hw = w / 2;
	const out: [number, number][] = [];
	const arc = (cu: number, cv: number, a0: number, a1: number) => {
		for (let i = 0; i <= 5; i++) {
			const a = a0 + ((a1 - a0) * i) / 5;
			out.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
		}
	};
	arc(-hw + r, v0 + r, Math.PI, Math.PI * 1.5);
	arc(hw - r, v0 + r, Math.PI * 1.5, Math.PI * 2);
	arc(hw - r, v0 + h - r, 0, Math.PI * 0.5);
	arc(-hw + r, v0 + h - r, Math.PI * 0.5, Math.PI);
	return out;
};

/* ------------------------------------------------------------- the laptop */

const SCR_W = 1000;
const SCR_H = 625; // [obs] 16:10
const BEZ_X = 34; // [obs] 0.0351 / 0.0376 of the panel width
const BEZ_T = 47.5; // [obs] 0.0760 of the panel height
const CHIN = 48.75; // [obs] 0.078 of the panel height
const LID_W = SCR_W + BEZ_X * 2;
const LID_H = BEZ_T + SCR_H + CHIN;
const LID_T = 15;
const DECK_D = 735;
const DECK_T = 22;
const LID_OUT = roundRect(LID_W, LID_H, 30);

/* the hinge, placed so the OPEN panel's centre lands on the world origin and
   therefore never moves on screen */
const HINGE_D = CHIN + SCR_H / 2;
const HY = -HINGE_D * Math.sin(PHI_OPEN);
const HZ = -HINGE_D * Math.cos(PHI_OPEN);
const FLOOR = HY - DECK_T;

/* ------------------------------------------- the tablet and the phone */

/* Both stand on the same table as the laptop and lean back by the same angle.
   They sit just FORWARD of the laptop's deck — d greater than DECK_D — so the
   draw order is unambiguous: whatever is nearer is simply painted later, and
   no depth sorting is needed for a scene this shallow. */
type Slab = {
	x: number;
	d: number;
	w: number;
	h: number;
	t: number;
	r: number;
	bez: number;
	back: string;
	on: [number, number];
};
const TABLET: Slab = {x: -754, d: 780, w: 400, h: 519, t: 13, r: 22, bez: 22, back: '#d7d7dc', on: [73, 82.4]};
const PHONE: Slab = {x: 825, d: 850, w: 190, h: 391, t: 10, r: 22, bez: 9, back: '#3a3a41', on: [81, 90.4]};

/* --------------------------------------------------------------- the look */

const FRAME_FILL = 'url(#m63frame)';
const GREEN = 'url(#m63green)';

export const Motion: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 60;

	const R = R0 - RV * t;
	const proj = makeProj(R);

	/* THE LID.
	   The reference gives up the top edge's travel down the frame, and
	   smoothstep^0.72 fits those eleven samples at 0.0072 rms. Travel is not
	   angle, though: the edge rises as sin(phi) and then perspective moves it
	   again. Handing that curve to the angle directly opens the lid far too
	   fast early. Inverting it per frame is worse and fails silently — the
	   projected top edge is NOT monotonic in the angle, it bottoms out near
	   86 deg and climbs back about 18 px as the lid passes vertical and its top
	   tips away from the lens, so a root-find for the final value locks onto an
	   earlier root and parks the lid 21 deg short. That shows up as a panel
	   tapering from 1593 px at the top to 1411 at the bottom instead of holding
	   the reference's dead-constant width on every row.
	   So the easing is refitted in the angle domain: phi = PHI_OPEN * u^1.36
	   re-projects onto the reference's own travel samples at 0.0123 rms and
	   lands exactly on PHI_OPEN, which is what keeps the panel a true
	   rectangle. */
	const openP = Math.pow(seg(f, 5.1, 45.9), 1.36);
	const phi = openP * PHI_OPEN;
	const sp = Math.sin(phi);
	const cp = Math.cos(phi);

	const lid = (u: number, v: number, o = 0): P3 => [u, HY + v * sp - o * cp, HZ + v * cp + o * sp];
	const deck = (x: number, z: number, y = 0): P3 => [x, HY + y, HZ + z];
	const pl = (u: number, v: number, o = 0) => proj(lid(u, v, o));
	const pd = (x: number, z: number, y = 0) => proj(deck(x, z, y));

	/* below the camera's own elevation the lid is still showing us its back */
	const screenSide = -cp * SA + sp * CA > 0.008;

	/* [obs] four frames from black at 25 fps; here eight at 60, and the trio
	   fires laptop, tablet, phone eight frames apart */
	const powL = seg(f, 65, 74.4);
	const powT = seg(f, TABLET.on[0], TABLET.on[1]);
	const powP = seg(f, PHONE.on[0], PHONE.on[1]);

	const dhw = LID_W / 2;
	const outF = LID_OUT.map(([u, v]) => pl(u, v, 0));
	const outB = LID_OUT.map(([u, v]) => pl(u, v, -LID_T));
	const scr: P2[] = [
		pl(-SCR_W / 2, CHIN),
		pl(SCR_W / 2, CHIN),
		pl(SCR_W / 2, CHIN + SCR_H),
		pl(-SCR_W / 2, CHIN + SCR_H),
	];

	const dTop: P2[] = [pd(-dhw, 0), pd(dhw, 0), pd(dhw, DECK_D), pd(-dhw, DECK_D)];
	const dFront: P2[] = [pd(-dhw, DECK_D), pd(dhw, DECK_D), pd(dhw, DECK_D, -DECK_T), pd(-dhw, DECK_D, -DECK_T)];
	const dLeft: P2[] = [pd(-dhw, 0), pd(-dhw, DECK_D), pd(-dhw, DECK_D, -DECK_T), pd(-dhw, 0, -DECK_T)];
	const dRight: P2[] = [pd(dhw, 0), pd(dhw, DECK_D), pd(dhw, DECK_D, -DECK_T), pd(dhw, 0, -DECK_T)];

	const KX = 472;
	const KZ0 = 26;
	const KZ1 = 292;
	const well: P2[] = [pd(-KX, KZ0), pd(KX, KZ0), pd(KX, KZ1), pd(-KX, KZ1)];
	const keys: React.ReactNode[] = [];
	const ROWS = 6;
	const COLS = 17;
	for (let r = 0; r < ROWS; r++) {
		const z0 = KZ0 + 8 + ((KZ1 - KZ0 - 16) * r) / ROWS;
		const z1 = z0 + (KZ1 - KZ0 - 16) / ROWS - 6;
		if (r === ROWS - 1) {
			keys.push(<path key="sp" d={path([pd(-300, z0), pd(300, z0), pd(300, z1), pd(-300, z1)])} />);
			keys.push(<path key="spl" d={path([pd(-KX + 12, z0), pd(-320, z0), pd(-320, z1), pd(-KX + 12, z1)])} />);
			keys.push(<path key="spr" d={path([pd(320, z0), pd(KX - 12, z0), pd(KX - 12, z1), pd(320, z1)])} />);
			continue;
		}
		for (let c = 0; c < COLS; c++) {
			const x0 = -KX + 12 + ((KX * 2 - 24) * c) / COLS;
			const x1 = x0 + (KX * 2 - 24) / COLS - 7;
			keys.push(<path key={`${r}_${c}`} d={path([pd(x0, z0), pd(x1, z0), pd(x1, z1), pd(x0, z1)])} />);
		}
	}
	const pad: P2[] = [pd(-158, 386), pd(158, 386), pd(158, 616), pd(-158, 616)];

	/* --- a standing slab, built the same way the lid is ------------------- */
	const slab = (s: Slab, power: number) => {
		const P = (u: number, v: number, o = 0): P3 => [
			s.x + u,
			FLOOR + v * CA + o * SA,
			HZ + s.d - v * SA + o * CA,
		];
		const ps = (u: number, v: number, o = 0) => proj(P(u, v, o));
		const body = roundRect(s.w, s.h, s.r).map(([u, v]) => ps(u, v, 0));
		const backs = roundRect(s.w, s.h, s.r).map(([u, v]) => ps(u, v, -s.t));
		const sw = s.w - s.bez * 2;
		const sh = s.h - s.bez * 2;
		const sq: P2[] = [
			ps(-sw / 2, s.bez),
			ps(sw / 2, s.bez),
			ps(sw / 2, s.bez + sh),
			ps(-sw / 2, s.bez + sh),
		];
		/* where it meets the table, and the sliver of its own bottom edge that
		   makes it read as standing rather than pasted on */
		const b0 = ps(-s.w / 2, 0);
		const b1 = ps(s.w / 2, 0);
		const foot: P2[] = [
			ps(-s.w / 2 + s.r, 0),
			ps(s.w / 2 - s.r, 0),
			ps(s.w / 2 - s.r, 0, -s.t),
			ps(-s.w / 2 + s.r, 0, -s.t),
		];
		return {body, backs, sq, b0, b1, foot};
	};
	const T = slab(TABLET, powT);
	const P = slab(PHONE, powP);

	/* contact shadows, taken from where each body actually meets the sweep */
	const sB = pd(-dhw, DECK_D, -DECK_T);
	const sR = pd(dhw, DECK_D, -DECK_T);
	const sK = pd(0, 0, -DECK_T);
	const shX = (sB[0] + sR[0]) / 2;
	const shY = (sB[1] + sK[1]) / 2;
	const shW = (sR[0] - sB[0]) / 2;

	const Shadow: React.FC<{a: P2; b: P2; k?: number}> = ({a, b, k = 1}) => {
		const w = (b[0] - a[0]) / 2;
		const cx = (a[0] + b[0]) / 2;
		const cy = (a[1] + b[1]) / 2;
		return (
			<>
				<ellipse
					cx={cx + w * 0.42}
					cy={cy + 4}
					rx={w * 1.7 * k}
					ry={w * 0.26 * k}
					fill="url(#m63shadow)"
					style={{filter: `blur(${Math.max(10, w * 0.16)}px)`}}
				/>
				<ellipse
					cx={cx}
					cy={cy}
					rx={w * 1.04}
					ry={Math.max(3, w * 0.13)}
					fill="#6d6971"
					opacity={0.28}
					style={{filter: `blur(${Math.max(5, w * 0.07)}px)`}}
				/>
			</>
		);
	};

	/* a lit panel, plus the tight halo that says "emitting" without polluting
	   the surround a keyer has to hold */
	const Panel: React.FC<{q: P2[]; power: number}> = ({q, power}) => (
		<>
			{power < 0.999 ? <path d={path(q)} fill="url(#m63off)" /> : null}
			{power > 0.004 ? <path d={path(q)} fill={GREEN} opacity={power} /> : null}
			{power > 0.02 ? (
				<path
					d={path(q)}
					fill="none"
					stroke="#2bff7a"
					strokeWidth={4}
					opacity={power * 0.17}
					style={{filter: 'blur(6px)', mixBlendMode: 'screen'}}
				/>
			) : null}
		</>
	);

	return (
		<AbsoluteFill style={{background: '#e2dfe3', overflow: 'hidden'}}>
			{/* [obs] the sweep: #eae7eb top-left to #bcb9bd right and bottom */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(126% 108% at 24% 16%, #edeaee 0%, #e4e1e5 34%, #d2cfd3 66%, #bebbc0 100%)',
				}}
			/>
			<AbsoluteFill
				style={{background: 'linear-gradient(180deg, rgba(255,255,255,0) 46%, rgba(150,146,152,0.22) 100%)'}}
			/>

			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<linearGradient id="m63deck" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#e6e6ea" />
						<stop offset="0.55" stopColor="#d5d5da" />
						<stop offset="1" stopColor="#c2c2c8" />
					</linearGradient>
					<linearGradient id="m63lidback" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#dedee2" />
						<stop offset="1" stopColor="#c6c6cc" />
					</linearGradient>
					<linearGradient id="m63frame" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#17171b" />
						<stop offset="0.5" stopColor="#0e0e12" />
						<stop offset="1" stopColor="#141418" />
					</linearGradient>
					{/* [int] #06d24e against the reference's #5ad15b: same luminance,
					    far less off-channel red and blue, so it keys cleanly. The sheen
					    is held to 4% so the panel still reads as one flat key colour. */}
					<linearGradient id="m63green" x1="0" y1="0" x2="0.18" y2="1">
						<stop offset="0" stopColor="#12dc5a" />
						<stop offset="0.42" stopColor="#06d24e" />
						<stop offset="1" stopColor="#04c848" />
					</linearGradient>
					{/* an unlit panel is glass, not paint */}
					<linearGradient id="m63off" x1="0.1" y1="0" x2="0.75" y2="1">
						<stop offset="0" stopColor="#2b2d31" />
						<stop offset="0.38" stopColor="#191b1f" />
						<stop offset="0.62" stopColor="#101216" />
						<stop offset="1" stopColor="#1b1d22" />
					</linearGradient>
					<linearGradient id="m63refl" x1="0" y1="0" x2="0.22" y2="1">
						<stop offset="0" stopColor="#8d939d" stopOpacity="0" />
						<stop offset="0.34" stopColor="#8d939d" stopOpacity="0.5" />
						<stop offset="0.58" stopColor="#7b818b" stopOpacity="0.62" />
						<stop offset="0.86" stopColor="#5f646d" stopOpacity="0.16" />
						<stop offset="1" stopColor="#5f646d" stopOpacity="0" />
					</linearGradient>
					<radialGradient id="m63shadow">
						<stop offset="0" stopColor="#5f5b62" stopOpacity="0.46" />
						<stop offset="0.55" stopColor="#6a666d" stopOpacity="0.2" />
						<stop offset="1" stopColor="#6a666d" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="m63spill">
						<stop offset="0" stopColor="#2bff7a" stopOpacity="0.5" />
						<stop offset="0.5" stopColor="#22ee6c" stopOpacity="0.18" />
						<stop offset="1" stopColor="#1adf60" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* shadows first, all three on the same sweep */}
				<ellipse
					cx={shX + shW * 0.34}
					cy={shY + 8}
					rx={shW * 1.5}
					ry={shW * 0.2}
					fill="url(#m63shadow)"
					style={{filter: 'blur(24px)'}}
				/>
				<ellipse cx={shX} cy={shY} rx={shW * 1.02} ry={shW * 0.1} fill="#6d6971" opacity={0.3} style={{filter: 'blur(9px)'}} />
				<Shadow a={T.b0} b={T.b1} />
				<Shadow a={P.b0} b={P.b1} />

				{/* --------------------------------------------------- the laptop */}
				<g>
					<path d={path(dLeft)} fill="#bfbfc6" />
					<path d={path(dRight)} fill="#bfbfc6" />
					<path d={path(dFront)} fill="#cdcdd3" />
					<path d={path(dTop)} fill="url(#m63deck)" />
					<path d={path(well)} fill="#1b1b1f" />
					<g fill="#3a3a3f">{keys}</g>
					<path d={path(pad)} fill="#d3d3d8" stroke="#bcbcc2" strokeWidth={1.4} />
				</g>
				{screenSide && powL > 0.01 ? (
					<ellipse
						cx={(dTop[0][0] + dTop[1][0]) / 2}
						cy={dTop[0][1] + 4}
						rx={(dTop[1][0] - dTop[0][0]) * 0.62}
						ry={Math.max(8, (well[3][1] - well[0][1]) * 1.5)}
						fill="url(#m63spill)"
						opacity={powL * 0.5}
						style={{mixBlendMode: 'screen', filter: 'blur(14px)'}}
					/>
				) : null}
				<g>
					{screenSide ? <path d={path(outB)} fill="url(#m63lidback)" /> : null}
					{screenSide ? (
						<>
							<path d={path(outF)} fill={FRAME_FILL} />
							<Panel q={scr} power={powL} />
							{powL < 0.999 ? (
								<path d={path(scr)} fill="url(#m63refl)" opacity={(1 - powL) * (1 - openP * 0.82)} />
							) : null}
						</>
					) : (
						/* closed, the machine shows us the lid's outside, not its panel */
						<>
							<path d={path(outF)} fill="#3a3a40" />
							<path d={path(outB)} fill="url(#m63lidback)" />
						</>
					)}
				</g>

				{/* ------------------------------------- the tablet, then the phone */}
				{[
					{s: TABLET, g: T, p: powT},
					{s: PHONE, g: P, p: powP},
				].map(({s, g, p}, i) => (
					<g key={i}>
						<path d={path(g.backs)} fill={s.back} />
						<path d={path(g.foot)} fill="#8e8e96" />
						<path d={path(g.body)} fill={FRAME_FILL} />
						<Panel q={g.sq} power={p} />
						{p < 0.999 ? <path d={path(g.sq)} fill="url(#m63refl)" opacity={(1 - p) * 0.55} /> : null}
					</g>
				))}

				{/* the panels throw a little light back onto the sweep */}
				{powL > 0.01 ? (
					<ellipse
						cx={CX}
						cy={(scr[0][1] + scr[2][1]) / 2}
						rx={(scr[1][0] - scr[0][0]) * 0.72}
						ry={(scr[2][1] - scr[0][1]) * 0.66}
						fill="url(#m63spill)"
						opacity={powL * 0.085}
						style={{mixBlendMode: 'screen', filter: 'blur(52px)'}}
					/>
				) : null}
			</svg>

			<AbsoluteFill
				style={{
					background:
						'radial-gradient(88% 84% at 44% 40%, rgba(0,0,0,0) 58%, rgba(96,92,99,0.12) 84%, rgba(84,80,87,0.26) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
