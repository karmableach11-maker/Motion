import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * MOTION 62 — "LAPTOP CHROMA PLATE"
 * ---------------------------------------------------------------------------
 * A laptop opens on a white studio sweep and the panel comes up as a clean
 * chroma key, while the camera dollies steadily in until the screen carries
 * three quarters of the frame width.
 *
 * WHAT WAS MEASURED, AND WHAT WAS INFERRED, FROM THE REFERENCE CLIP
 * ----------------------------------------------------------------
 * Reference: 700x394, 25 fps, 375 frames, 15.000 s, one continuous take, no
 * cuts. [obs] marks what came off the frames; [int] marks an inference.
 *
 * [obs] The screen's centre sits at (349.5, 195.5) at t=1.20 and at
 *       (349.5, 194.5) at t=14.80, against a frame centre of (350, 197). It
 *       does not drift: the dolly runs straight down the screen's own axis,
 *       so the world origin here IS the open screen's centre and the camera
 *       always looks at it.
 * [obs] The panel measures 1.598 : 1 at t=1.20 and 1.601 : 1 at t=14.80 —
 *       16:10, and constant. A panel that never foreshortens is a panel
 *       perpendicular to the view axis, which is what fixes the lid's resting
 *       angle below rather than leaving it to taste.
 * [obs] The push-in is a constant-velocity dolly, not a zoom. Fitting the
 *       eighteen measured screen widths from t=1.20 to t=14.80:
 *           1/w = -2.032734e-4 * t + 4.942581e-3
 *       reproduces every one of them to 0.89 px rms across widths 211..517.
 *       A straight-line fit on the widths themselves is 24x worse, at 21.42 px
 *       rms. Reciprocal-linear IS constant velocity, since apparent size goes
 *       as 1/z; extrapolated, the camera would reach the screen plane at
 *       t = 24.31 s. R(t) below is that fit, rescaled to 1920.
 * [obs] The lid opens between t=0.085 and t=0.765. Its top edge travels from
 *       y=280 to y=119, and against that eleven-sample curve the best of
 *       fourteen easing families is smoothstep^0.72 at 0.0072 rms. That fits
 *       the TRAVEL, though, not the angle — see the note at the lid itself for
 *       why the angle needs its own refit, and why inverting the travel per
 *       frame silently parks the lid 21 deg short.
 * [obs] The panel does not cut on, it ramps. Sampling the screen centre:
 *       black through f27, then (30,57,31), (52,108,51), (74,161,73) and full
 *       at (96,212,95) on f31 — a straight four-frame ramp from black over
 *       0.16 s, ending t=1.24.
 * [obs] Deck geometry, taken at t=6.00 as three ratios against the panel
 *       width: the lid measures 1.0669, the deck's front edge 1.3309, and the
 *       deck stands 0.1524 tall. Elevation and camera distance are degenerate
 *       against those — 400 units of deck depth at 7.30 deg fits as well as
 *       760 at 3.85 — so the deck is fixed at a real machine's proportion and
 *       the camera solved from there: 3.98 deg, 3712 units out.
 * [obs] Bezel, as a fraction of the panel: 0.0351 left, 0.0376 right, 0.0760
 *       top, and a chin of 0.088 of the panel height.
 * [obs] Palette: deck and palmrest #ccccCF, lid seen edge-on #626162, keys
 *       #434144. The sweep runs #eae7eb at top left to #bcb9bd at right and
 *       bottom — a cool neutral, blue very slightly over red.
 * [int] The reference's panel is #5ad15b, which is a soft grass green: red
 *       and blue both sit near 90 of 255, and that is a lot of off-channel
 *       energy for a keyer to pull. The brief asked for the green to read
 *       more clearly, so the panel here is #06d24e — same luminance band,
 *       red and blue dropped to 6 and 78, which is both visibly more vivid
 *       and materially easier to key. The spill onto the bezel, deck and
 *       sweep is added for the same reason: a panel that throws light reads
 *       as lit rather than painted.
 */

/* ------------------------------------------------------------------ setup */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const seg = (f: number, a: number, b: number) => clamp((f - a) / (b - a), 0, 1);

/* --------------------------------------------------------------- the body */

/* Everything is in units of the panel's own width, so the numbers below can be
   read straight off the measured fractions. */
const SCR_W = 1000;
const SCR_H = 625; // [obs] 16:10, measured at 1.598 and 1.601
const BEZ_X = 34; // [obs] 0.0351 / 0.0376 of the panel width
const BEZ_T = 47.5; // [obs] 0.0760 of the panel height
const CHIN = 48.75; // [obs] 0.078 of the panel height
const LID_W = SCR_W + BEZ_X * 2;
const LID_H = BEZ_T + SCR_H + CHIN;
const LID_T = 15;
const DECK_D = 735; // 0.688 of the deck width, the proportion of a real 15in machine
const DECK_T = 22;

/* Elevation and camera distance are not independently observable — a shallower
   angle seen from closer produces the same picture as a steeper one from
   further away. What IS observable, at t=6.00, is three ratios against the
   panel width: the lid measures 1.0669, the deck's front edge 1.3309, and the
   deck stands 0.1524 tall. Fixing the deck's depth at a real machine's
   proportion and solving those three leaves exactly one camera:
       elevation 3.98 deg, distance 3712 units, giving 1.0680 / 1.3309 / 0.1525.
   The degeneracy is real — 400 and 760 deep fit equally well at 7.30 and 3.85
   deg — so the deck's proportion is the free choice here, not the fit. */
const CAM_EL = (3.98 * Math.PI) / 180;
const SA = Math.sin(CAM_EL);
const CA = Math.cos(CAM_EL);

/* [obs] the panel never foreshortens, so at rest the lid is exactly normal to
   the view axis — 90 deg plus the camera's own elevation, and not a degree
   chosen by eye */
const PHI_OPEN = Math.PI / 2 + CAM_EL;

/* the hinge, placed so that the OPEN panel's centre lands on the world origin
   and therefore never moves on screen */
const HINGE_D = CHIN + SCR_H / 2;
const HY = -HINGE_D * Math.sin(PHI_OPEN);
const HZ = -HINGE_D * Math.cos(PHI_OPEN);

/* [obs] 1/w = -2.032734e-4 t + 4.942581e-3 at 700 wide. At 1920 that is
   1/w' = -7.41063e-5 t + 1.801896e-3, and with a 1000-unit panel,
   R = F*1000/w' — a straight line in t, which is what "constant velocity"
   means. F is then whatever puts the camera 3712 units out at t=6.00, the
   distance the deck ratios solved for. */
const FOC = 2735.3;
const R0 = FOC * 1000 * 1.801896e-3; // 4928.70
const RV = FOC * 1000 * 7.41063e-5; // 202.7019

const CX = 960;
const CY = 540;

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

/* the lid outline in its own (across, along-from-hinge) coordinates, corners
   rounded before projection so the rounding survives the perspective */
const lidOutline = (): [number, number][] => {
	const hw = LID_W / 2;
	const rT = 30;
	const rB = 12;
	const out: [number, number][] = [];
	const arc = (cx: number, cv: number, r: number, a0: number, a1: number) => {
		for (let i = 0; i <= 5; i++) {
			const a = a0 + ((a1 - a0) * i) / 5;
			out.push([cx + r * Math.cos(a), cv + r * Math.sin(a)]);
		}
	};
	arc(-hw + rB, rB, rB, Math.PI, Math.PI * 1.5);
	arc(hw - rB, rB, rB, Math.PI * 1.5, Math.PI * 2);
	arc(hw - rT, LID_H - rT, rT, 0, Math.PI * 0.5);
	arc(-hw + rT, LID_H - rT, rT, Math.PI * 0.5, Math.PI);
	return out;
};
const LID_OUTLINE = lidOutline();

export const Motion: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 60;

	/* [obs] the dolly, straight off the reciprocal fit */
	const R = R0 - RV * t;
	const proj = makeProj(R);

	/* THE LID.
	   What the reference gives up is the top edge's travel down the frame, and
	   the best of fourteen families against those eleven samples is
	   smoothstep^0.72 at 0.0072 rms. But travel is not angle: the edge rises as
	   sin(phi) and then perspective moves it again, so that curve cannot be
	   handed to the angle directly — doing so opens the lid far too fast early.
	   Inverting it per frame is also wrong, and subtly so: the projected top
	   edge is NOT monotonic in the angle. It bottoms out near 86 deg and comes
	   back up about 18 px as the lid passes vertical and its top tips away from
	   the lens, so a root-find for the final value finds an earlier root and
	   parks the lid 21 deg short — which shows up as a panel that tapers 1593 px
	   at the top to 1411 at the bottom instead of holding the reference's
	   dead-constant 516 px on every row.
	   So the easing is refitted in the angle domain instead: driving
	   phi = PHI_OPEN * u^1.36 and re-projecting reproduces the reference's own
	   travel samples to 0.0123 rms, and lands exactly on PHI_OPEN, which is what
	   keeps the panel a true rectangle. */
	const openP = Math.pow(seg(f, 5.1, 45.9), 1.36);
	const phi = openP * PHI_OPEN;
	const sp = Math.sin(phi);
	const cp = Math.cos(phi);

	/* a point on the lid: u across, v along from the hinge, o out along the
	   panel's own normal */
	const lid = (u: number, v: number, o = 0): P3 => [u, HY + v * sp - o * cp, HZ + v * cp + o * sp];
	const deck = (x: number, z: number, y = 0): P3 => [x, HY + y, HZ + z];

	const pl = (u: number, v: number, o = 0) => proj(lid(u, v, o));
	const pd = (x: number, z: number, y = 0) => proj(deck(x, z, y));

	/* which way the panel faces: below the camera's own elevation the lid is
	   still showing us its back */
	const faceUp = -cp * SA + sp * CA; // panel normal against the view ray
	const screenSide = faceUp > 0.008;

	/* [obs] the panel ramps up from black over four frames at 25 fps, full at
	   t=1.24 */
	const power = seg(f, 65, 74.4);

	const hw = LID_W / 2;
	const dhw = LID_W / 2;

	const outF = LID_OUTLINE.map(([u, v]) => pl(u, v, 0));
	const outB = LID_OUTLINE.map(([u, v]) => pl(u, v, -LID_T));

	const scr: P2[] = [
		pl(-SCR_W / 2, CHIN),
		pl(SCR_W / 2, CHIN),
		pl(SCR_W / 2, CHIN + SCR_H),
		pl(-SCR_W / 2, CHIN + SCR_H),
	];

	/* deck: top, front lip and the two flanks */
	const dTop: P2[] = [pd(-dhw, 0), pd(dhw, 0), pd(dhw, DECK_D), pd(-dhw, DECK_D)];
	const dFront: P2[] = [pd(-dhw, DECK_D), pd(dhw, DECK_D), pd(dhw, DECK_D, -DECK_T), pd(-dhw, DECK_D, -DECK_T)];
	const dLeft: P2[] = [pd(-dhw, 0), pd(-dhw, DECK_D), pd(-dhw, DECK_D, -DECK_T), pd(-dhw, 0, -DECK_T)];
	const dRight: P2[] = [pd(dhw, 0), pd(dhw, DECK_D), pd(dhw, DECK_D, -DECK_T), pd(dhw, 0, -DECK_T)];

	/* keyboard well and keys */
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
			// space bar row
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

	/* the contact shadow, taken from where the deck actually meets the sweep */
	const sB = pd(-dhw, DECK_D, -DECK_T);
	const sR = pd(dhw, DECK_D, -DECK_T);
	const sK = pd(0, 0, -DECK_T);
	const shX = (sB[0] + sR[0]) / 2;
	const shY = (sB[1] + sK[1]) / 2;
	const shW = (sR[0] - sB[0]) / 2;

	/* [obs] the sweep is a cool neutral: #eae7eb top-left to #bcb9bd right and
	   bottom, blue a shade over red at every sample */
	return (
		<AbsoluteFill style={{background: '#e2dfe3', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(126% 108% at 24% 16%, #edeaee 0%, #e4e1e5 34%, #d2cfd3 66%, #bebbc0 100%)',
				}}
			/>
			<AbsoluteFill
				style={{
					background: 'linear-gradient(180deg, rgba(255,255,255,0) 46%, rgba(150,146,152,0.22) 100%)',
				}}
			/>

			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<linearGradient id="m62deck" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#e6e6ea" />
						<stop offset="0.55" stopColor="#d5d5da" />
						<stop offset="1" stopColor="#c2c2c8" />
					</linearGradient>
					<linearGradient id="m62lidback" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#dedee2" />
						<stop offset="1" stopColor="#c6c6cc" />
					</linearGradient>
					<linearGradient id="m62frame" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#17171b" />
						<stop offset="0.5" stopColor="#0e0e12" />
						<stop offset="1" stopColor="#141418" />
					</linearGradient>
					{/* [int] the brief asked for a clearer green: #06d24e against the
					    reference's #5ad15b — same luminance, far less off-channel red
					    and blue, so it keys cleanly. The sheen is held to 4% so the
					    panel still reads as one flat key colour. */}
					<linearGradient id="m62green" x1="0" y1="0" x2="0.18" y2="1">
						<stop offset="0" stopColor="#12dc5a" />
						<stop offset="0.42" stopColor="#06d24e" />
						<stop offset="1" stopColor="#04c848" />
					</linearGradient>
					{/* an unlit panel is glass, not paint — the reference shows the
					    keyboard reflected across it */}
					<linearGradient id="m62off" x1="0.1" y1="0" x2="0.75" y2="1">
						<stop offset="0" stopColor="#2b2d31" />
						<stop offset="0.38" stopColor="#191b1f" />
						<stop offset="0.62" stopColor="#101216" />
						<stop offset="1" stopColor="#1b1d22" />
					</linearGradient>
					{/* the sweep, caught in the glass. It is broadest while the lid is
					    still low — which is exactly when the reference shows it — and
					    swings off the panel as the lid comes up to vertical. */}
					<linearGradient id="m62refl" x1="0" y1="0" x2="0.22" y2="1">
						<stop offset="0" stopColor="#8d939d" stopOpacity="0" />
						<stop offset="0.34" stopColor="#8d939d" stopOpacity="0.5" />
						<stop offset="0.58" stopColor="#7b818b" stopOpacity="0.62" />
						<stop offset="0.86" stopColor="#5f646d" stopOpacity="0.16" />
						<stop offset="1" stopColor="#5f646d" stopOpacity="0" />
					</linearGradient>
					<radialGradient id="m62shadow">
						<stop offset="0" stopColor="#5f5b62" stopOpacity="0.5" />
						<stop offset="0.55" stopColor="#6a666d" stopOpacity="0.22" />
						<stop offset="1" stopColor="#6a666d" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="m62spill">
						<stop offset="0" stopColor="#2bff7a" stopOpacity="0.5" />
						<stop offset="0.5" stopColor="#22ee6c" stopOpacity="0.18" />
						<stop offset="1" stopColor="#1adf60" stopOpacity="0" />
					</radialGradient>
				</defs>

				{/* the shadow the machine casts on the sweep */}
				<ellipse
					cx={shX + shW * 0.34}
					cy={shY + 8}
					rx={shW * 1.5}
					ry={shW * 0.2}
					fill="url(#m62shadow)"
					style={{filter: 'blur(26px)'}}
				/>
				<ellipse cx={shX} cy={shY} rx={shW * 1.02} ry={shW * 0.1} fill="#6d6971" opacity={0.3} style={{filter: 'blur(9px)'}} />

				{/* ------------------------------------------------------ the deck */}
				<g>
					<path d={path(dLeft)} fill="#bfbfc6" />
					<path d={path(dRight)} fill="#bfbfc6" />
					<path d={path(dFront)} fill="#cdcdd3" />
					<path d={path(dTop)} fill="url(#m62deck)" />
					<path d={path(well)} fill="#1b1b1f" />
					<g fill="#3a3a3f">{keys}</g>
					<path d={path(pad)} fill="#d3d3d8" stroke="#bcbcc2" strokeWidth={1.4} />
				</g>

				{/* the panel throws light onto the deck below it */}
				{screenSide && power > 0.01 ? (
					<ellipse
						cx={(dTop[0][0] + dTop[1][0]) / 2}
						cy={dTop[0][1] + 4}
						rx={(dTop[1][0] - dTop[0][0]) * 0.62}
						ry={Math.max(10, (well[3][1] - well[0][1]) * 1.5)}
						fill="url(#m62spill)"
						opacity={power * 0.5}
						style={{mixBlendMode: 'screen', filter: 'blur(16px)'}}
					/>
				) : null}

				{/* ------------------------------------------------------- the lid */}
				<g>
					{/* the back shell, projected one thickness behind the face, so the
					    sliver that shows around the edge IS the lid's thickness */}
					{screenSide ? <path d={path(outB)} fill="url(#m62lidback)" /> : null}
					{screenSide ? (
						<>
							<path d={path(outF)} fill="url(#m62frame)" />
							<path
								d={path(scr)}
								fill="url(#m62green)"
								opacity={power}
								style={{filter: power > 0.02 ? 'saturate(1.06)' : undefined}}
							/>
							{/* the panel's own glow, spilling onto its bezel */}
							{/* Held deliberately tight. A soft green halo looks pretty, but
							    this plate exists to be keyed, and green that creeps past the
							    bezel onto the sweep is exactly what tears holes in a matte.
							    Enough to read as an emitting panel, not enough to pollute
							    the surround. */}
							{power > 0.02 ? (
								<path
									d={path(scr)}
									fill="none"
									stroke="#2bff7a"
									strokeWidth={4}
									opacity={power * 0.17}
									style={{filter: 'blur(6px)', mixBlendMode: 'screen'}}
								/>
							) : null}
						</>
					) : (
						/* closed, the machine shows us the lid's outside, not its panel */
						<>
							<path d={path(outF)} fill="#3a3a40" />
							<path d={path(outB)} fill="url(#m62lidback)" />
						</>
					)}
					{screenSide && power < 0.999 ? (
						<>
							<path d={path(scr)} fill="url(#m62off)" opacity={1 - power} />
							<path d={path(scr)} fill="url(#m62refl)" opacity={(1 - power) * (1 - openP * 0.82)} />
						</>
					) : null}
				</g>

				{/* the panel throws light onto the sweep behind it too */}
				{screenSide && power > 0.01 ? (
					<ellipse
						cx={CX}
						cy={(scr[0][1] + scr[2][1]) / 2}
						rx={(scr[1][0] - scr[0][0]) * 0.72}
						ry={(scr[2][1] - scr[0][1]) * 0.66}
						fill="url(#m62spill)"
						opacity={power * 0.085}
						style={{mixBlendMode: 'screen', filter: 'blur(52px)'}}
					/>
				) : null}
			</svg>

			{/* the studio's own falloff, last so it sits over everything */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(88% 84% at 44% 40%, rgba(0,0,0,0) 58%, rgba(96,92,99,0.12) 84%, rgba(84,80,87,0.26) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
