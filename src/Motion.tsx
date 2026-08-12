import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

/* ------------------------------------------------------------------ *
 *  PHONE MOCKUP — chroma-key screen on black
 *  1920x1080 | 60fps | 15s
 *
 *  The handset is a real extruded solid, not a flat card: fourteen
 *  rounded slices stacked along Z inside a preserve-3d container, so
 *  the side rail appears by itself when the phone turns and the
 *  rounded corners wrap correctly instead of leaving gaps.
 *
 *  The display is pure #00FF00 with red corner-pin markers and nothing
 *  layered over it — no reflection, no gloss, no vignette — because a
 *  gradient across the key is what makes a screen replacement crawl.
 *  Every highlight lives on the bezel ring, outside the fill.
 *
 *  Reveal timing taken from the reference: the phone clears the lower
 *  edge over ~1.1 s, arrives yawed and leaning, then unwinds to
 *  face-on across the next few seconds and holds.
 * ------------------------------------------------------------------ */

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;

/* handset geometry (measured off the reference: body aspect 1.98) */
const PH = 862;
const PW = 436;
const BEZ = 24;
const TH = 42; /* body thickness */
const NSL = 14; /* extrusion slices */
const RAD = 60;
const SRAD = 42;
const KEY = '#00FF00';

const EASE = Easing.bezier(0.16, 0.86, 0.22, 1);
const EASE_R = Easing.bezier(0.22, 0.9, 0.3, 1);

/* corner-pin markers: four corners plus centre */
const MARK = [
	[0.14, 0.085],
	[0.86, 0.085],
	[0.5, 0.5],
	[0.14, 0.915],
	[0.86, 0.915],
];

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	const at = (s: number, d: number, e = EASE) =>
		interpolate(t, [s, s + d], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: e,
		});

	/* ---- reveal ---- */
	const rise = at(0.42, 1.18);
	const settle = at(1.15, 3.9, EASE_R);
	const idle = at(4.6, 1.2);

	const yaw = interpolate(settle, [0, 1], [27, 0]) + idle * 1.9 * Math.sin(TAU * (t - 4.6) * 0.085);
	const roll = interpolate(settle, [0, 1], [10.5, 0]) + idle * 0.7 * Math.sin(TAU * (t - 4.6) * 0.062 + 1.1);
	const pitch = interpolate(settle, [0, 1], [-6.5, 0]) + idle * 0.9 * Math.sin(TAU * (t - 4.6) * 0.07 + 2.2);
	const py =
		interpolate(rise, [0, 1], [980, 0]) +
		idle * 7 * Math.sin(TAU * (t - 4.6) * 0.075) -
		Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 1.1) / 0.9))) * 14;
	const sc = interpolate(settle, [0, 1], [0.945, 1]);

	/* light rig: key from upper left, so the lit rail is the left edge
	   until the phone turns past face-on */
	const lit = Math.max(0, Math.cos((yaw - 26) * (Math.PI / 180)));
	const glow = 0.1 + 0.14 * rise;

	const slices = [];
	for (let i = 0; i < NSL; i++) {
		const f = i / (NSL - 1);
		const z = -TH + (TH * i) / (NSL - 1);
		/* rail shading: bright at the outer edges, dark in the middle of
		   the extrusion, which is how an anodised frame catches light */
		const shade = 0.24 + 0.76 * Math.pow(Math.abs(f - 0.44) * 2, 1.5);
		const c = Math.round(26 + 118 * shade * (0.55 + 0.45 * lit));
		slices.push(
			<div
				key={'s' + i}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: PW,
					height: PH,
					borderRadius: RAD,
					transform: 'translateZ(' + z.toFixed(2) + 'px)',
					background:
						'linear-gradient(102deg, rgb(' + Math.round(c * 1.5) + ',' + Math.round(c * 1.5) + ',' +
						Math.round(c * 1.62) + ') 0%, rgb(' + c + ',' + c + ',' + Math.round(c * 1.1) + ') 26%, rgb(' +
						Math.round(c * 0.5) + ',' + Math.round(c * 0.5) + ',' + Math.round(c * 0.56) +
						') 62%, rgb(' + Math.round(c * 1.25) + ',' + Math.round(c * 1.25) + ',' + Math.round(c * 1.35) + ') 100%)',
				}}
			/>
		);
	}

	return (
		<AbsoluteFill style={{backgroundColor: '#000000'}}>
			{/* the only thing on the black: a soft bed so the dark rail
			    separates from the background instead of merging into it */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(30% 42% at 50% 52%, rgba(150,170,205,' + (0.055 * rise).toFixed(3) +
						') 0%, rgba(70,86,120,' + (0.02 * rise).toFixed(3) + ') 40%, rgba(0,0,0,0) 70%)',
				}}
			/>

			{/* contact glow under the handset */}
			<div
				style={{
					position: 'absolute',
					left: W / 2 - 340,
					top: H / 2 + 372 + py * 0.35,
					width: 680,
					height: 130,
					borderRadius: '50%',
					background:
						'radial-gradient(50% 50% at 50% 50%, rgba(140,160,195,' + (0.12 * rise).toFixed(3) +
						') 0%, rgba(60,72,100,0.04) 46%, rgba(0,0,0,0) 76%)',
					filter: 'blur(14px)',
				}}
			/>

			<AbsoluteFill style={{perspective: 2300, perspectiveOrigin: '50% 48%'}}>
				<div
					style={{
						position: 'absolute',
						left: W / 2 - PW / 2,
						top: H / 2 - PH / 2,
						width: PW,
						height: PH,
						transformStyle: 'preserve-3d',
						transform:
							'translate3d(0px,' + py.toFixed(2) + 'px,0px) scale(' + sc.toFixed(4) +
							') rotateZ(' + roll.toFixed(3) + 'deg) rotateY(' + yaw.toFixed(3) +
							'deg) rotateX(' + pitch.toFixed(3) + 'deg)',
					}}
				>
					{slices}

					{/* front face */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: PW,
							height: PH,
							borderRadius: RAD,
							transform: 'translateZ(0.6px)',
							background: '#0A0A0C',
							boxShadow:
								'inset 0 0 0 1.4px rgba(196,206,228,' + (0.3 + 0.35 * lit).toFixed(3) +
								'), inset 0 0 0 5px rgba(10,10,12,1), 0 0 70px rgba(150,170,205,' + glow.toFixed(3) + ')',
							padding: BEZ,
							boxSizing: 'border-box',
						}}
					>
						{/* the keyable display — flat, nothing on top of it */}
						<div
							style={{
								position: 'relative',
								width: PW - BEZ * 2,
								height: PH - BEZ * 2,
								borderRadius: SRAD,
								backgroundColor: KEY,
								overflow: 'hidden',
							}}
						>
							{/* dynamic island: part of the handset, deliberately not green */}
							<div
								style={{
									position: 'absolute',
									left: (PW - BEZ * 2) / 2 - 62,
									top: 16,
									width: 124,
									height: 35,
									borderRadius: 18,
									background: '#08080A',
								}}
							/>
							{MARK.map((m, i) => {
								const cx = m[0] * (PW - BEZ * 2);
								const cy = m[1] * (PH - BEZ * 2);
								const s = 17;
								return (
									<svg
										key={'mk' + i}
										width={s * 2}
										height={s * 2}
										style={{position: 'absolute', left: cx - s, top: cy - s}}
									>
										<path
											d={'M' + s + ' 2V' + (s * 2 - 2) + 'M2 ' + s + 'H' + (s * 2 - 2)}
											stroke="#FF1E1E"
											strokeWidth={4}
										/>
									</svg>
								);
							})}
						</div>
					</div>

					{/* side buttons ride on the rail, never over the display */}
					<div
						style={{
							position: 'absolute',
							left: -3,
							top: PH * 0.24,
							width: 4,
							height: 54,
							borderRadius: 3,
							background: 'linear-gradient(180deg,#7A7A84,#3A3A42)',
							transform: 'translateZ(' + (-TH / 2).toFixed(1) + 'px)',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: -3,
							top: PH * 0.335,
							width: 4,
							height: 92,
							borderRadius: 3,
							background: 'linear-gradient(180deg,#7A7A84,#3A3A42)',
							transform: 'translateZ(' + (-TH / 2).toFixed(1) + 'px)',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: PW - 1,
							top: PH * 0.3,
							width: 4,
							height: 116,
							borderRadius: 3,
							background: 'linear-gradient(180deg,#7A7A84,#3A3A42)',
							transform: 'translateZ(' + (-TH / 2).toFixed(1) + 'px)',
						}}
					/>
				</div>
			</AbsoluteFill>

			{/* grain stays off the key: it is confined to the outer frame */}
			<AbsoluteFill style={{opacity: 0.03, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
				<svg width={W} height={H}>
					<filter id="grain42">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={(frame % 12) + 1} />
					</filter>
					<rect width={W} height={H} filter="url(#grain42)" />
				</svg>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export default Motion;
