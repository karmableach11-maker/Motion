import React, {type CSSProperties} from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const UI_FONT = '"Inter", "Segoe UI", Arial, sans-serif';
const MONO_FONT = '"SFMono-Regular", "Roboto Mono", Consolas, monospace';

const COLORS = {
	ink: '#06111f',
	panel: '#08192d',
	panelDeep: '#061323',
	card: 'rgba(12, 32, 56, 0.86)',
	line: 'rgba(128, 192, 222, 0.18)',
	text: '#f4fbff',
	muted: '#84a7bb',
	cyan: '#45d9ff',
	blue: '#4588ff',
	mint: '#55f0b5',
	lime: '#b7f56b',
	amber: '#ffc868',
	coral: '#ff718b',
};

const FLIP_START = 166;
const FLIP_MID = 183;
const FLIP_END = 200;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const softProgress = (frame: number, start: number, end: number) =>
	interpolate(frame, [start, end], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

const linearProgress = (frame: number, start: number, end: number) =>
	interpolate(frame, [start, end], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

const revealStyle = (
	frame: number,
	start: number,
	end: number,
	distance = 18,
): CSSProperties => {
	const progress = softProgress(frame, start, end);
	return {
		opacity: progress,
		transform: `translateY(${(1 - progress) * distance}px) scale(${
			0.985 + progress * 0.015
		})`,
		filter: `blur(${(1 - progress) * 7}px)`,
	};
};

const Card: React.FC<{
	children: React.ReactNode;
	style?: CSSProperties;
	accent?: string;
}> = ({children, style, accent = COLORS.cyan}) => {
	return (
		<div
			style={{
				position: 'relative',
				overflow: 'hidden',
				border: `1px solid ${COLORS.line}`,
				borderRadius: 22,
				background:
					'linear-gradient(145deg, rgba(16,42,70,0.92), rgba(6,20,37,0.94))',
				boxShadow:
					'0 18px 46px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.045)',
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 26,
					right: 26,
					top: 0,
					height: 1,
					background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
					opacity: 0.65,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					right: -70,
					top: -75,
					width: 190,
					height: 190,
					borderRadius: '50%',
					background: accent,
					filter: 'blur(72px)',
					opacity: 0.075,
				}}
			/>
			{children}
		</div>
	);
};

const SmallCaps: React.FC<{
	children: React.ReactNode;
	color?: string;
	style?: CSSProperties;
}> = ({children, color = COLORS.muted, style}) => (
	<div
		style={{
			fontFamily: MONO_FONT,
			fontWeight: 700,
			fontSize: 14,
			letterSpacing: '0.16em',
			color,
			...style,
		}}
	>
		{children}
	</div>
);

const BrandMark: React.FC = () => (
	<div
		style={{
			width: 48,
			height: 48,
			borderRadius: 15,
			display: 'grid',
			placeItems: 'center',
			background:
				'linear-gradient(145deg, rgba(69,217,255,0.22), rgba(69,136,255,0.13))',
			border: '1px solid rgba(94,221,255,0.42)',
			boxShadow: '0 0 28px rgba(69,217,255,0.15)',
		}}
	>
		<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
			<path
				d="M14 2.7 23.7 8.3v11.3L14 25.3l-9.7-5.7V8.3L14 2.7Z"
				stroke={COLORS.cyan}
				strokeWidth="1.7"
			/>
			<circle cx="14" cy="14" r="3.6" fill={COLORS.mint} />
			<path
				d="M14 6.6v3.7M7.6 10.3l3.2 1.8m6.4 3.8 3.2 1.8M7.6 17.7l3.2-1.8m6.4-3.8 3.2-1.8M14 17.7v3.7"
				stroke="#d8f8ff"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	</div>
);

const LivePill: React.FC<{frame: number}> = ({frame}) => {
	const pulse = 0.5 + 0.5 * Math.sin(frame * 0.16);
	return (
		<div
			style={{
				height: 46,
				padding: '0 19px',
				borderRadius: 999,
				display: 'flex',
				alignItems: 'center',
				gap: 11,
				background: 'rgba(85,240,181,0.075)',
				border: '1px solid rgba(85,240,181,0.27)',
				color: '#aefad9',
				fontFamily: MONO_FONT,
				fontSize: 14,
				fontWeight: 800,
				letterSpacing: '0.09em',
			}}
		>
			<div
				style={{
					width: 9,
					height: 9,
					borderRadius: '50%',
					background: COLORS.mint,
					boxShadow: `0 0 ${10 + pulse * 10}px rgba(85,240,181,0.75)`,
				}}
			/>
			LIVE ORCHESTRATION
		</div>
	);
};

const CheckIcon: React.FC<{color?: string; size?: number}> = ({
	color = COLORS.mint,
	size = 20,
}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none">
		<circle cx="10" cy="10" r="8.5" fill={`${color}18`} stroke={`${color}80`} />
		<path
			d="m6 10.1 2.55 2.55L14.4 7.1"
			stroke={color}
			strokeWidth="1.9"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const motionEnvelope = (
	progress: number,
	fadeInStart: number,
	fadeInEnd: number,
	fadeOutStart: number,
	fadeOutEnd: number,
) =>
	softProgress(progress, fadeInStart, fadeInEnd) *
	(1 - softProgress(progress, fadeOutStart, fadeOutEnd));

const NovaMascot: React.FC<{
	frame: number;
	opacity: number;
	instance: string;
	compact?: boolean;
}> = ({frame, opacity, instance, compact = false}) => {
	const {durationInFrames, fps} = useVideoConfig();
	const duration = Math.max(2, durationInFrames);
	const progress = clamp01(frame / (duration - 1));
	const seconds = frame / fps;
	const tau = Math.PI * 2;

	// These gesture windows are normalized against the composition duration.
	// The same character therefore remains animated when the video duration is
	// changed in Root.tsx instead of becoming static after a fixed frame count.
	const greet = motionEnvelope(progress, 0.015, 0.055, 0.16, 0.215);
	const think = motionEnvelope(progress, 0.18, 0.235, 0.355, 0.425);
	const celebrate = motionEnvelope(progress, 0.49, 0.57, 0.77, 0.84);
	const proud = softProgress(progress, 0.72, 0.82);
	const activeJoy = Math.max(greet * 0.72, celebrate, proud * 0.48);

	const hopA = Math.sin(softProgress(progress, 0.075, 0.155) * Math.PI);
	const hopB = Math.sin(softProgress(progress, 0.555, 0.665) * Math.PI);
	const hop = Math.max(0, hopA) * greet + Math.max(0, hopB) * celebrate;
	const idleBob =
		Math.sin(progress * tau * 3) * (compact ? 2.5 : 4.5) +
		Math.sin(progress * tau * 7 + 0.4) * (compact ? 0.7 : 1.2);
	const floatY = idleBob - hop * (compact ? 5 : 13);
	const sway =
		Math.sin(progress * tau * 2 + 0.5) * 1.35 -
		think * 2.6 +
		celebrate * Math.sin(progress * tau * 9) * 1.9;
	const squash = hop * 0.045;

	const blinkCenters = [0.105, 0.29, 0.535, 0.735, 0.915];
	const blinkClose = Math.max(
		...blinkCenters.map((center) =>
			clamp01(1 - Math.abs(progress - center) / 0.012),
		),
	);
	const eyeOpen = Math.max(0.08, 1 - blinkClose);
	const eyeScale = 1 + celebrate * 0.12;
	const eyeLookX = -think * 6 + Math.sin(seconds * 1.65) * 1.2;
	const eyeLookY = -think * 7 + Math.cos(seconds * 1.35) * 0.7;
	const happyEyes = clamp01(activeJoy * (1 - blinkClose));

	const leftArm =
		7 +
		Math.sin(seconds * 2.1 + 1.2) * 2.2 +
		greet * (23 + Math.sin(seconds * 11) * 11) +
		think * 25 +
		celebrate * 33;
	const rightArm =
		-7 +
		Math.sin(seconds * 2.1 + 0.1) * 2.2 -
		greet * 8 -
		think * 4 -
		celebrate * 33;
	const headTilt =
		Math.sin(seconds * 1.75) * 1.2 -
		think * 7 +
		greet * Math.sin(seconds * 4.5) * 1.5;
	const antennaTilt =
		Math.sin(seconds * 3.2 + 0.8) * 5 -
		headTilt * 0.72 -
		hop * 8;
	const ringSpin = frame * (compact ? 0.18 : 0.28);
	const thrusterPulse =
		0.55 + 0.16 * Math.sin(seconds * 5.3) + hop * 0.22 + celebrate * 0.12;
	const chestSweep = ((frame * 2.15) % 164) - 82;
	const sparkleOpacity = compact ? celebrate + proud * 0.55 : celebrate * 0.6;
	const width = compact ? 132 : 304;
	const height = compact ? 142 : 286;
	const svgId = (name: string) => `${instance}-${name}`;

	return (
		<div
			style={{
				position: 'relative',
				width,
				height,
				opacity,
				transform: `translateY(${compact ? 1 : 0}px)`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: compact ? 17 : 38,
					top: compact ? 18 : 28,
					width: compact ? 98 : 228,
					height: compact ? 98 : 228,
					borderRadius: '50%',
					background:
						'radial-gradient(circle, rgba(69,217,255,0.18), rgba(69,136,255,0.05) 52%, transparent 73%)',
					boxShadow: compact
						? '0 0 30px rgba(69,217,255,0.1)'
						: '0 0 74px rgba(69,217,255,0.11)',
				}}
			/>
			<svg
				width={width}
				height={height}
				viewBox="-175 -220 350 440"
				style={{position: 'absolute', inset: 0, overflow: 'visible'}}
			>
				<defs>
					<linearGradient id={svgId('shell')} x1="0" y1="0" x2="0.28" y2="1">
						<stop offset="0" stopColor="#ffffff" />
						<stop offset="0.48" stopColor="#eef5ff" />
						<stop offset="1" stopColor="#b9c9e4" />
					</linearGradient>
					<linearGradient id={svgId('arm')} x1="0" y1="0" x2="0.35" y2="1">
						<stop offset="0" stopColor="#ffffff" />
						<stop offset="0.62" stopColor="#dce8f7" />
						<stop offset="1" stopColor="#aebed9" />
					</linearGradient>
					<radialGradient id={svgId('visor')} cx="0.34" cy="0.25" r="0.94">
						<stop offset="0" stopColor="#1d4d63" />
						<stop offset="0.48" stopColor="#102b42" />
						<stop offset="1" stopColor="#071626" />
					</radialGradient>
					<linearGradient id={svgId('eye')} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#c6fdff" />
						<stop offset="1" stopColor={COLORS.cyan} />
					</linearGradient>
					<linearGradient id={svgId('iridescent')} x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor={COLORS.cyan} />
						<stop offset="0.52" stopColor="#6bcbff" />
						<stop offset="1" stopColor="#9b79ff" />
					</linearGradient>
					<radialGradient id={svgId('thruster')} cx="0.5" cy="0.3" r="0.7">
						<stop offset="0" stopColor="#bafaff" stopOpacity="0.9" />
						<stop offset="0.5" stopColor={COLORS.cyan} stopOpacity="0.42" />
						<stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
					</radialGradient>
					<filter id={svgId('glow')} x="-100%" y="-100%" width="300%" height="300%">
						<feGaussianBlur stdDeviation="4" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<filter id={svgId('soft')} x="-100%" y="-100%" width="300%" height="300%">
						<feGaussianBlur stdDeviation="7" />
					</filter>
					<clipPath id={svgId('chest-clip')}>
						<rect x="-72" y="56" width="144" height="16" rx="8" />
					</clipPath>
				</defs>

				<ellipse
					cx="0"
					cy="177"
					rx={98 - hop * 14}
					ry={18 - hop * 3}
					fill="rgba(69,217,255,0.12)"
					filter={`url(#${svgId('soft')})`}
					opacity={0.7 - hop * 0.18}
				/>
				<ellipse
					cx="0"
					cy="177"
					rx={77 - hop * 10}
					ry={11 - hop * 2}
					fill="none"
					stroke="rgba(69,217,255,0.38)"
					strokeWidth="2"
					strokeDasharray="15 10"
					transform={`rotate(${ringSpin} 0 177)`}
				/>
				<ellipse
					cx="0"
					cy="177"
					rx={47 - hop * 6}
					ry={7 - hop}
					fill="none"
					stroke="rgba(155,121,255,0.42)"
					strokeWidth="1.6"
					strokeDasharray="7 9"
					transform={`rotate(${-ringSpin * 0.72} 0 177)`}
				/>

				<g
					transform={`translate(0 ${floatY}) rotate(${sway}) scale(${
						1 + squash
					} ${1 - squash})`}
				>
					<ellipse
						cx="0"
						cy="176"
						rx="64"
						ry="24"
						fill={`url(#${svgId('thruster')})`}
						opacity={thrusterPulse}
						filter={`url(#${svgId('soft')})`}
					/>

					<g transform={`rotate(${antennaTilt} 0 -140)`}>
						<line
							x1="0"
							y1="-140"
							x2="0"
							y2="-184"
							stroke="#10223b"
							strokeWidth="7"
							strokeLinecap="round"
						/>
						<circle
							cx="0"
							cy="-195"
							r="13"
							fill={`url(#${svgId('iridescent')})`}
							stroke="#10223b"
							strokeWidth="5"
							filter={`url(#${svgId('glow')})`}
						/>
						<circle cx="-4" cy="-199" r="3.5" fill="#ffffff" opacity="0.8" />
					</g>

					<g transform={`rotate(${leftArm} -112 -7)`}>
						<rect
							x="-132"
							y="-22"
							width="40"
							height="114"
							rx="20"
							fill={`url(#${svgId('arm')})`}
							stroke="#10223b"
							strokeWidth="6"
						/>
						<circle
							cx="-112"
							cy="101"
							r="24"
							fill={`url(#${svgId('arm')})`}
							stroke="#10223b"
							strokeWidth="6"
						/>
						<rect
							x="-123"
							y="-5"
							width="9"
							height="64"
							rx="5"
							fill="#ffffff"
							opacity="0.55"
						/>
					</g>
					<g transform={`rotate(${rightArm} 112 -7)`}>
						<rect
							x="92"
							y="-22"
							width="40"
							height="114"
							rx="20"
							fill={`url(#${svgId('arm')})`}
							stroke="#10223b"
							strokeWidth="6"
						/>
						<circle
							cx="112"
							cy="101"
							r="24"
							fill={`url(#${svgId('arm')})`}
							stroke="#10223b"
							strokeWidth="6"
						/>
						<rect
							x="100"
							y="-5"
							width="9"
							height="64"
							rx="5"
							fill="#ffffff"
							opacity="0.55"
						/>
					</g>

					<path
						d="M0-140C80-140 114-86 114-6 114 92 66 148 0 148S-114 92-114-6c0-80 34-134 114-134Z"
						fill={`url(#${svgId('shell')})`}
						stroke="#10223b"
						strokeWidth="6"
						strokeLinejoin="round"
					/>
					<path
						d="M-77-92C-97-57-96 20-72 72c13 28 34 46 55 52-35-8-66-49-66-122 0-43 10-75 28-94 8-8 16-13 25-17-18 1-35 6-47 17Z"
						fill="#ffffff"
						opacity="0.48"
					/>
					<path
						d="M55 117c23-16 37-48 42-82"
						fill="none"
						stroke="#9baecc"
						strokeWidth="5"
						strokeLinecap="round"
						opacity="0.35"
					/>

					<rect
						x="-72"
						y="56"
						width="144"
						height="16"
						rx="8"
						fill={`url(#${svgId('iridescent')})`}
						opacity="0.9"
						filter={`url(#${svgId('glow')})`}
					/>
					<g clipPath={`url(#${svgId('chest-clip')})`}>
						<rect
							x={chestSweep}
							y="52"
							width="30"
							height="24"
							transform="skewX(-22)"
							fill="rgba(255,255,255,0.76)"
							filter={`url(#${svgId('soft')})`}
						/>
					</g>
					<circle
						cx="0"
						cy="99"
						r={16 + Math.sin(seconds * 4.2) * 1.4 + celebrate * 2}
						fill="rgba(69,217,255,0.28)"
						filter={`url(#${svgId('soft')})`}
					/>
					<circle
						cx="0"
						cy="99"
						r="11"
						fill={`url(#${svgId('iridescent')})`}
						stroke="#10223b"
						strokeWidth="4.5"
					/>
					<circle cx="-3.5" cy="95.5" r="2.7" fill="#ffffff" opacity="0.75" />

					<g transform={`rotate(${headTilt} 0 -59)`}>
						<rect
							x="-88"
							y="-116"
							width="176"
							height="120"
							rx="46"
							fill={`url(#${svgId('visor')})`}
							stroke="#10223b"
							strokeWidth="6"
						/>
						<path
							d="M-63-96C-42-110 8-111 46-102"
							fill="none"
							stroke="#c7fbff"
							strokeWidth="9"
							strokeLinecap="round"
							opacity="0.1"
						/>
						<ellipse
							cx="0"
							cy="-57"
							rx="61"
							ry="48"
							fill="rgba(69,217,255,0.12)"
							filter={`url(#${svgId('glow')})`}
						/>

						<g transform={`translate(${eyeLookX} ${eyeLookY})`}>
							<g
								opacity={1 - happyEyes * 0.92}
								filter={`url(#${svgId('glow')})`}
							>
								<g
									transform={`translate(-36 -62) scale(${eyeScale} ${
										eyeOpen * eyeScale
									})`}
								>
									<rect
										x="-14"
										y="-22"
										width="28"
										height="44"
										rx="14"
										fill={`url(#${svgId('eye')})`}
									/>
								</g>
								<g
									transform={`translate(36 -62) scale(${eyeScale} ${
										eyeOpen * eyeScale
									})`}
								>
									<rect
										x="-14"
										y="-22"
										width="28"
										height="44"
										rx="14"
										fill={`url(#${svgId('eye')})`}
									/>
								</g>
								<circle
									cx="-41"
									cy="-74"
									r="4"
									fill="#ffffff"
									opacity={0.82 * eyeOpen}
								/>
								<circle
									cx="31"
									cy="-74"
									r="4"
									fill="#ffffff"
									opacity={0.82 * eyeOpen}
								/>
							</g>
							<g opacity={happyEyes} filter={`url(#${svgId('glow')})`}>
								<path
									d="M-50-57Q-36-77-22-57"
									fill="none"
									stroke={`url(#${svgId('eye')})`}
									strokeWidth="9"
									strokeLinecap="round"
								/>
								<path
									d="M22-57Q36-77 50-57"
									fill="none"
									stroke={`url(#${svgId('eye')})`}
									strokeWidth="9"
									strokeLinecap="round"
								/>
							</g>
						</g>

						<path
							d={`M${-14 - activeJoy * 5}-23Q0${
								-11 + activeJoy * 5
							}${14 + activeJoy * 5}-23`}
							fill="none"
							stroke={`url(#${svgId('eye')})`}
							strokeWidth="6.5"
							strokeLinecap="round"
							opacity={1 - think * 0.86}
							filter={`url(#${svgId('glow')})`}
						/>
						<path
							d="M-7-18 14-23"
							fill="none"
							stroke={`url(#${svgId('eye')})`}
							strokeWidth="6"
							strokeLinecap="round"
							opacity={think}
							filter={`url(#${svgId('glow')})`}
						/>
						<circle
							cx="-102"
							cy="-30"
							r="7"
							fill="#ff9db0"
							opacity={0.68 + activeJoy * 0.24}
							filter={`url(#${svgId('soft')})`}
						/>
						<circle
							cx="102"
							cy="-30"
							r="7"
							fill="#ff9db0"
							opacity={0.68 + activeJoy * 0.24}
							filter={`url(#${svgId('soft')})`}
						/>
					</g>

					{think > 0.01 ? (
						<g opacity={think}>
							{[0, 1, 2].map((index) => {
								const local = (seconds * 0.52 + index * 0.31) % 1;
								return (
									<circle
										key={index}
										cx={-105 - index * 25 - local * 8}
										cy={-150 - local * 48}
										r={6 + index * 4}
										fill="rgba(6,17,31,0.88)"
										stroke={COLORS.cyan}
										strokeWidth="4"
										opacity={Math.sin(local * Math.PI) * 0.9}
									/>
								);
							})}
						</g>
					) : null}

					{sparkleOpacity > 0.01 ? (
						<g
							fill="none"
							stroke={COLORS.mint}
							strokeWidth="5"
							strokeLinecap="round"
							opacity={sparkleOpacity}
							filter={`url(#${svgId('glow')})`}
						>
							<path d="M-137-96v24M-149-84h24" />
							<path d="M132-34v19M122-24h20" />
							<path d="M105-141v14M98-134h14" />
						</g>
					) : null}
				</g>
			</svg>
		</div>
	);
};

const WorkflowNode: React.FC<{
	index: string;
	label: string;
	detail: string;
	progress: number;
	active?: boolean;
	frame: number;
}> = ({index, label, detail, progress, active = false, frame}) => {
	const sweep = ((frame * 2.6 + Number(index) * 57) % 250) - 48;
	return (
		<div
			style={{
				position: 'relative',
				height: 105,
				padding: '18px 19px',
				borderRadius: 17,
				border: active
					? '1px solid rgba(69,217,255,0.43)'
					: '1px solid rgba(128,192,222,0.13)',
				background: active
					? 'linear-gradient(100deg, rgba(69,217,255,0.105), rgba(69,136,255,0.035))'
					: 'rgba(4,17,32,0.48)',
				overflow: 'hidden',
			}}
		>
			{active ? (
				<div
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: sweep,
						width: 48,
						transform: 'skewX(-17deg)',
						background:
							'linear-gradient(90deg, transparent, rgba(69,217,255,0.16), transparent)',
					}}
				/>
			) : null}
			<div style={{display: 'flex', alignItems: 'center', gap: 13}}>
				<div
					style={{
						width: 34,
						height: 34,
						borderRadius: 10,
						display: 'grid',
						placeItems: 'center',
						background: active
							? 'rgba(69,217,255,0.15)'
							: 'rgba(104,157,187,0.08)',
						border: `1px solid ${
							active ? 'rgba(69,217,255,0.32)' : 'rgba(128,192,222,0.15)'
						}`,
						color: active ? COLORS.cyan : COLORS.muted,
						fontFamily: MONO_FONT,
						fontWeight: 800,
						fontSize: 13,
					}}
				>
					{index}
				</div>
				<div style={{flex: 1, minWidth: 0}}>
					<div
						style={{
							fontSize: 19,
							lineHeight: 1.15,
							fontWeight: 750,
							color: COLORS.text,
							letterSpacing: '-0.015em',
						}}
					>
						{label}
					</div>
					<div
						style={{
							marginTop: 5,
							fontFamily: MONO_FONT,
							fontSize: 12,
							color: COLORS.muted,
							letterSpacing: '0.04em',
						}}
					>
						{detail}
					</div>
				</div>
				{progress >= 0.999 ? (
					<CheckIcon size={24} />
				) : (
					<div
						style={{
							fontFamily: MONO_FONT,
							fontSize: 13,
							fontWeight: 800,
							color: active ? COLORS.cyan : COLORS.muted,
						}}
					>
						{Math.round(progress * 100)}%
					</div>
				)}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 66,
					right: 19,
					bottom: 14,
					height: 3,
					borderRadius: 9,
					background: 'rgba(126,177,202,0.1)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${progress * 100}%`,
						borderRadius: 9,
						background: active
							? `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan})`
							: 'linear-gradient(90deg, #497c99, #74a7bd)',
						boxShadow: active ? '0 0 13px rgba(69,217,255,0.56)' : undefined,
					}}
				/>
			</div>
		</div>
	);
};

const WorldNetwork: React.FC<{frame: number}> = ({frame}) => {
	const routeOffset = -(frame * 0.0045);
	const nodePulse = (offset: number) =>
		0.72 + 0.28 * Math.sin(frame * 0.1 + offset);

	const nodes = [
		{x: 176, y: 151, label: 'NA', delay: 0},
		{x: 361, y: 125, label: 'EU', delay: 1.3},
		{x: 466, y: 197, label: 'MEA', delay: 2.4},
		{x: 618, y: 177, label: 'APAC', delay: 3.8},
		{x: 688, y: 284, label: 'OC', delay: 5.2},
		{x: 278, y: 287, label: 'LATAM', delay: 6.1},
	];

	return (
		<div style={{position: 'absolute', inset: 0}}>
			<svg width="100%" height="100%" viewBox="0 0 780 500" fill="none">
				<defs>
					<linearGradient id="mapFill" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#2ba2c6" stopOpacity="0.23" />
						<stop offset="1" stopColor="#316ed7" stopOpacity="0.07" />
					</linearGradient>
					<radialGradient id="mapNode" cx="0.5" cy="0.5" r="0.5">
						<stop offset="0" stopColor="#e7fdff" />
						<stop offset="0.2" stopColor="#55f0b5" />
						<stop offset="1" stopColor="#55f0b5" stopOpacity="0" />
					</radialGradient>
					<filter id="mapGlow" x="-80%" y="-80%" width="260%" height="260%">
						<feGaussianBlur stdDeviation="4" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<pattern id="mapGrid" width="37" height="37" patternUnits="userSpaceOnUse">
						<path
							d="M37 0H0V37"
							fill="none"
							stroke="rgba(96,189,226,0.08)"
							strokeWidth="1"
						/>
					</pattern>
				</defs>
				<rect x="0" y="0" width="780" height="500" fill="url(#mapGrid)" />
				<ellipse
					cx="390"
					cy="245"
					rx="354"
					ry="175"
					fill="none"
					stroke="rgba(69,217,255,0.09)"
				/>
				<ellipse
					cx="390"
					cy="245"
					rx="354"
					ry="97"
					fill="none"
					stroke="rgba(69,217,255,0.065)"
				/>
				<path
					d="M71 133 91 92l64-24 64 6 42 24 40-6 25 27-31 23-26 8-23 31-28-4-16 23-24-14-18 17-15-30-39-8-15-32Z"
					fill="url(#mapFill)"
					stroke="rgba(95,210,244,0.34)"
					strokeWidth="1.2"
				/>
				<path
					d="m243 222 38 8 28 30-2 34-20 28-9 48-21 29-13-32-4-38-17-29 6-34-13-27Z"
					fill="url(#mapFill)"
					stroke="rgba(95,210,244,0.34)"
					strokeWidth="1.2"
				/>
				<path
					d="m344 104 32-20 37 9 29-11 56 7 32-12 66 13 47-7 56 31-21 27 30 20-11 24-47 3-29 28-29-9-31 18-41-1-12-32-26 3-21-26-41 11-22-21-41 4-22-19Z"
					fill="url(#mapFill)"
					stroke="rgba(95,210,244,0.34)"
					strokeWidth="1.2"
				/>
				<path
					d="m390 193 56-13 40 24 11 49-24 23-16 55-35 29-27-39-24-28 7-39-18-35Z"
					fill="url(#mapFill)"
					stroke="rgba(95,210,244,0.34)"
					strokeWidth="1.2"
				/>
				<path
					d="m635 288 51-18 47 21 5 34-30 28-58-9-22-28Z"
					fill="url(#mapFill)"
					stroke="rgba(95,210,244,0.34)"
					strokeWidth="1.2"
				/>
				<path
					d="m118 51 30-23 48 3 15 21-28 15-43-3Z"
					fill="rgba(74,163,205,0.13)"
					stroke="rgba(95,210,244,0.25)"
				/>

				{[
					'M176 151C250 86 294 91 361 125',
					'M361 125C426 108 560 109 618 177',
					'M361 125C391 169 428 184 466 197',
					'M466 197C534 224 599 231 688 284',
					'M176 151C191 218 217 263 278 287',
					'M278 287C371 333 528 345 688 284',
				].map((path, index) => (
					<path
						key={path}
						d={path}
						fill="none"
						stroke={index === 1 ? COLORS.mint : COLORS.cyan}
						strokeOpacity={index === 1 ? 0.56 : 0.33}
						strokeWidth={index === 1 ? 2 : 1.4}
						pathLength="1"
						strokeDasharray={index === 1 ? '0.06 0.035' : '0.035 0.055'}
						strokeDashoffset={routeOffset - index * 0.06}
					/>
				))}

				{nodes.map((node) => (
					<g key={node.label}>
						<circle
							cx={node.x}
							cy={node.y}
							r={20}
							fill="url(#mapNode)"
							opacity={nodePulse(node.delay) * 0.5}
						/>
						<circle
							cx={node.x}
							cy={node.y}
							r={5.5 + nodePulse(node.delay) * 1.4}
							fill={COLORS.mint}
							stroke="#dffff6"
							strokeWidth="1"
							filter="url(#mapGlow)"
						/>
						<circle
							cx={node.x}
							cy={node.y}
							r={11 + nodePulse(node.delay) * 5}
							fill="none"
							stroke="rgba(85,240,181,0.28)"
							strokeWidth="1"
						/>
						<text
							x={node.x + 14}
							y={node.y - 13}
							fill="#91b7c9"
							fontFamily={MONO_FONT}
							fontSize="11"
							letterSpacing="1.4"
						>
							{node.label}
						</text>
					</g>
				))}
			</svg>
		</div>
	);
};

const MiniBars: React.FC<{frame: number}> = ({frame}) => {
	const heights = [18, 29, 23, 40, 34, 50, 42, 58, 47, 64, 57, 72, 66, 81];
	return (
		<div
			style={{
				height: 78,
				display: 'flex',
				alignItems: 'flex-end',
				gap: 7,
			}}
		>
			{heights.map((height, index) => {
				const wave = Math.sin(frame * 0.07 + index * 0.7) * 4;
				return (
					<div
						key={`${height}-${index}`}
						style={{
							width: 9,
							height: Math.max(8, height + wave),
							borderRadius: '5px 5px 2px 2px',
							background:
								index > 9
									? `linear-gradient(180deg, ${COLORS.mint}, rgba(85,240,181,0.18))`
									: `linear-gradient(180deg, ${COLORS.cyan}, rgba(69,136,255,0.15))`,
							opacity: 0.48 + index * 0.034,
						}}
					/>
				);
			})}
		</div>
	);
};

const FrontDashboard: React.FC<{frame: number; contentOpacity: number}> = ({
	frame,
	contentOpacity,
}) => {
	// The dashboard wrapper already fades at the flip. Keeping the mascot at
	// full local opacity prevents it from disappearing before the panel reaches
	// its edge-on state.
	const mascotOpacity = 1;
	const activeProgress = 0.56 + 0.18 * (0.5 + 0.5 * Math.sin(frame * 0.025));
	const processed = 12840 + Math.floor(frame * 2.7);
	const intro = 1;

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				opacity: contentOpacity * intro,
				fontFamily: UI_FONT,
				color: COLORS.text,
			}}
		>
			<header
				style={{
					height: 104,
					display: 'flex',
					alignItems: 'center',
					padding: '0 40px',
					borderBottom: `1px solid ${COLORS.line}`,
					background:
						'linear-gradient(90deg, rgba(11,35,61,0.82), rgba(6,20,37,0.35))',
				}}
			>
				<BrandMark />
				<div style={{marginLeft: 17}}>
					<SmallCaps color={COLORS.cyan}>NEXUS AI / CONTROL PLANE</SmallCaps>
					<div
						style={{
							fontSize: 31,
							lineHeight: 1.18,
							fontWeight: 780,
							letterSpacing: '-0.025em',
							marginTop: 4,
						}}
					>
						Agentic AI Operations
					</div>
				</div>
				<div style={{flex: 1}} />
				<div
					style={{
						textAlign: 'right',
						marginRight: 22,
						borderRight: `1px solid ${COLORS.line}`,
						paddingRight: 22,
					}}
				>
					<SmallCaps>WORKSPACE</SmallCaps>
					<div
						style={{
							marginTop: 5,
							fontSize: 17,
							fontWeight: 650,
							color: '#c7e5f2',
						}}
					>
						Global Revenue Systems
					</div>
				</div>
				<LivePill frame={frame} />
			</header>

			<div
				style={{
					position: 'absolute',
					left: 30,
					right: 30,
					top: 126,
					bottom: 123,
					display: 'grid',
					gridTemplateColumns: '384px 430px 1fr',
					gap: 20,
				}}
			>
				<Card accent={COLORS.cyan} style={{padding: '25px 24px 22px'}}>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<div>
							<SmallCaps>PRIMARY AGENT</SmallCaps>
							<div
								style={{
									fontSize: 23,
									fontWeight: 760,
									letterSpacing: '-0.02em',
									marginTop: 7,
								}}
							>
								Nova / AI Operator
							</div>
						</div>
						<div
							style={{
								height: 31,
								padding: '0 11px',
								display: 'flex',
								alignItems: 'center',
								gap: 7,
								borderRadius: 999,
								background: 'rgba(85,240,181,0.09)',
								border: '1px solid rgba(85,240,181,0.19)',
								color: COLORS.mint,
								fontFamily: MONO_FONT,
								fontSize: 12,
								fontWeight: 800,
							}}
						>
							<span
								style={{
									width: 6,
									height: 6,
									borderRadius: '50%',
									background: COLORS.mint,
								}}
							/>
							ONLINE
						</div>
					</div>
					<div
						style={{
							height: 305,
							marginTop: 4,
							display: 'grid',
							placeItems: 'center',
						}}
					>
							<NovaMascot
								frame={frame}
								opacity={mascotOpacity}
								instance="nova-front"
							/>
					</div>
					<div
						style={{
							marginTop: 2,
							padding: '17px 18px',
							borderRadius: 16,
							background: 'rgba(3,16,30,0.54)',
							border: '1px solid rgba(120,189,221,0.12)',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'baseline',
							}}
						>
							<SmallCaps>AGENT CAPACITY</SmallCaps>
							<div
								style={{
									fontFamily: MONO_FONT,
									fontSize: 19,
									fontWeight: 800,
									color: COLORS.mint,
								}}
							>
								78.4%
							</div>
						</div>
						<div
							style={{
								height: 6,
								marginTop: 12,
								borderRadius: 999,
								background: 'rgba(110,166,193,0.12)',
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									width: '78.4%',
									height: '100%',
									borderRadius: 999,
									background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan}, ${COLORS.mint})`,
									boxShadow: '0 0 14px rgba(69,217,255,0.44)',
								}}
							/>
						</div>
					</div>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: 10,
							marginTop: 11,
						}}
					>
						{[
							['CONTEXT', '24.8M'],
							['CONFIDENCE', '97.2%'],
						].map(([label, value]) => (
							<div
								key={label}
								style={{
									padding: '12px 13px',
									borderRadius: 13,
									background: 'rgba(7,22,40,0.62)',
									border: '1px solid rgba(128,192,222,0.1)',
								}}
							>
								<SmallCaps style={{fontSize: 10}}>{label}</SmallCaps>
								<div
									style={{
										fontFamily: MONO_FONT,
										fontSize: 20,
										fontWeight: 800,
										marginTop: 5,
									}}
								>
									{value}
								</div>
							</div>
						))}
					</div>
				</Card>

				<Card accent={COLORS.blue} style={{padding: '25px 24px'}}>
					<div style={{display: 'flex', alignItems: 'flex-end'}}>
						<div>
							<SmallCaps>AUTONOMOUS WORKFLOW</SmallCaps>
							<div
								style={{
									fontSize: 23,
									fontWeight: 760,
									letterSpacing: '-0.02em',
									marginTop: 7,
								}}
							>
								Execution Pipeline
							</div>
						</div>
						<div style={{flex: 1}} />
						<div
							style={{
								fontFamily: MONO_FONT,
								fontSize: 12,
								color: COLORS.cyan,
								letterSpacing: '0.08em',
							}}
						>
							RUN 08:14:32
						</div>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 11,
							marginTop: 23,
						}}
					>
						<WorkflowNode
							index="01"
							label="Observe market signals"
							detail="312 SOURCES SYNTHESIZED"
							progress={1}
							frame={frame}
						/>
						<WorkflowNode
							index="02"
							label="Plan revenue actions"
							detail="8 GOALS · 24 CONSTRAINTS"
							progress={1}
							frame={frame}
						/>
						<WorkflowNode
							index="03"
							label="Execute optimized playbook"
							detail="18 CHANNELS ACTIVE"
							progress={activeProgress}
							active
							frame={frame}
						/>
						<WorkflowNode
							index="04"
							label="Verify business outcome"
							detail="WAITING FOR ATTRIBUTION"
							progress={0.18}
							frame={frame}
						/>
					</div>
				</Card>

				<Card accent={COLORS.mint}>
					<div
						style={{
							position: 'absolute',
							left: 25,
							right: 25,
							top: 24,
							zIndex: 2,
							display: 'flex',
							alignItems: 'flex-end',
						}}
					>
						<div>
							<SmallCaps>GLOBAL DATA FABRIC</SmallCaps>
							<div
								style={{
									fontSize: 23,
									fontWeight: 760,
									letterSpacing: '-0.02em',
									marginTop: 7,
								}}
							>
								Cross-region intelligence
							</div>
						</div>
						<div style={{flex: 1}} />
						<div
							style={{
								display: 'flex',
								gap: 8,
								alignItems: 'center',
								fontFamily: MONO_FONT,
								fontSize: 12,
								color: COLORS.mint,
							}}
						>
							<span
								style={{
									width: 7,
									height: 7,
									borderRadius: '50%',
									background: COLORS.mint,
									boxShadow: '0 0 12px rgba(85,240,181,0.65)',
								}}
							/>
							42 NODES SYNCED
						</div>
					</div>
					<div style={{position: 'absolute', inset: '74px 4px 100px 4px'}}>
						<WorldNetwork frame={frame} />
					</div>
					<div
						style={{
							position: 'absolute',
							left: 25,
							right: 25,
							bottom: 22,
							height: 100,
							display: 'grid',
							gridTemplateColumns: '1fr 178px',
							gap: 15,
							padding: '14px 17px',
							borderRadius: 16,
							background: 'rgba(3,16,30,0.68)',
							border: '1px solid rgba(128,192,222,0.13)',
						}}
					>
						<div>
							<div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
								<div
									style={{
										fontFamily: MONO_FONT,
										fontSize: 34,
										fontWeight: 850,
										color: COLORS.text,
										letterSpacing: '-0.04em',
									}}
								>
									184
								</div>
								<SmallCaps color={COLORS.mint}>ACTIONS / MIN</SmallCaps>
							</div>
							<div
								style={{
									marginTop: 7,
									fontFamily: MONO_FONT,
									fontSize: 12,
									color: COLORS.muted,
								}}
							>
								Latency 42ms · Uptime 99.98%
							</div>
						</div>
						<MiniBars frame={frame} />
					</div>
				</Card>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 30,
					right: 30,
					bottom: 25,
					height: 78,
					display: 'grid',
					gridTemplateColumns: '1.15fr 1fr 1fr 1fr',
					borderRadius: 18,
					overflow: 'hidden',
					background: 'rgba(6,22,40,0.88)',
					border: `1px solid ${COLORS.line}`,
				}}
			>
				{[
					['TASKS PROCESSED', processed.toLocaleString('en-US'), COLORS.cyan],
					['ACTIVE AGENTS', '24 / 24', COLORS.mint],
					['AVG. RESPONSE', '1.42 sec', COLORS.amber],
					['POLICY COMPLIANCE', '100%', COLORS.lime],
				].map(([label, value, color], index) => (
					<div
						key={label}
						style={{
							display: 'flex',
							alignItems: 'center',
							padding: '0 24px',
							borderLeft: index ? `1px solid ${COLORS.line}` : undefined,
						}}
					>
						<div
							style={{
								width: 9,
								height: 38,
								borderRadius: 6,
								background: color,
								opacity: 0.66,
								boxShadow: `0 0 17px ${color}55`,
							}}
						/>
						<div style={{marginLeft: 15}}>
							<SmallCaps style={{fontSize: 10}}>{label}</SmallCaps>
							<div
								style={{
									fontFamily: MONO_FONT,
									fontSize: 21,
									fontWeight: 800,
									marginTop: 5,
									letterSpacing: '-0.02em',
								}}
							>
								{value}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const KpiIcon: React.FC<{
	type: 'saving' | 'time' | 'success' | 'roi';
	color: string;
}> = ({type, color}) => {
	const common = {
		stroke: color,
		strokeWidth: 1.8,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
	};
	return (
		<div
			style={{
				width: 48,
				height: 48,
				borderRadius: 15,
				display: 'grid',
				placeItems: 'center',
				background: `${color}13`,
				border: `1px solid ${color}3b`,
			}}
		>
			<svg width="27" height="27" viewBox="0 0 27 27" fill="none">
				{type === 'saving' ? (
					<>
						<path d="M4.4 9.2h18.2v12.2H4.4z" {...common} />
						<path d="M4.4 12.4h18.2M18.2 17h1.9" {...common} />
						<path d="M8.2 9.2V6h10.6v3.2" {...common} />
					</>
				) : null}
				{type === 'time' ? (
					<>
						<circle cx="13.5" cy="14.2" r="9.1" {...common} />
						<path d="M13.5 8.7v6l4.2 2.2M10 2.8h7" {...common} />
					</>
				) : null}
				{type === 'success' ? (
					<>
						<path d="m4.4 13.6 5.4 5.2L22.7 6.6" {...common} />
						<path d="M21.3 13.6a8.2 8.2 0 1 1-5.4-7.7" {...common} opacity="0.55" />
					</>
				) : null}
				{type === 'roi' ? (
					<>
						<path d="M4.5 21.5 10 16l3.6 3.6L22.8 9" {...common} />
						<path d="M16.4 9h6.4v6.4" {...common} />
					</>
				) : null}
			</svg>
		</div>
	);
};

const KpiCard: React.FC<{
	frame: number;
	start: number;
	label: string;
	value: string;
	delta: string;
	type: 'saving' | 'time' | 'success' | 'roi';
	color: string;
}> = ({frame, start, label, value, delta, type, color}) => {
	const progress = softProgress(frame, start, start + 20);
	const numberReveal = softProgress(frame, start + 7, start + 27);
	return (
		<Card
			accent={color}
			style={{
				height: 228,
				padding: '22px 23px',
				opacity: progress,
				transform: `translateY(${(1 - progress) * 25}px) scale(${
					0.965 + progress * 0.035
				})`,
				filter: `blur(${(1 - progress) * 8}px)`,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between'}}>
				<KpiIcon type={type} color={color} />
				<div
					style={{
						height: 29,
						padding: '0 10px',
						display: 'flex',
						alignItems: 'center',
						borderRadius: 999,
						background: `${color}10`,
						border: `1px solid ${color}30`,
						color,
						fontFamily: MONO_FONT,
						fontSize: 11,
						fontWeight: 800,
						letterSpacing: '0.06em',
					}}
				>
					{delta}
				</div>
			</div>
			<SmallCaps style={{marginTop: 22}}>{label}</SmallCaps>
			<div
				style={{
					marginTop: 9,
					fontFamily: UI_FONT,
					fontSize: value.length > 6 ? 49 : 58,
					lineHeight: 0.96,
					fontWeight: 840,
					letterSpacing: '-0.055em',
					color: COLORS.text,
					opacity: numberReveal,
					transform: `translateY(${(1 - numberReveal) * 8}px)`,
					textShadow: `0 0 28px ${color}15`,
				}}
			>
				{value}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 23,
					right: 23,
					bottom: 19,
					height: 4,
					borderRadius: 999,
					background: 'rgba(126,180,204,0.09)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: `${55 + numberReveal * 41}%`,
						height: '100%',
						borderRadius: 999,
						background: `linear-gradient(90deg, ${color}55, ${color})`,
						boxShadow: `0 0 12px ${color}77`,
					}}
				/>
			</div>
		</Card>
	);
};

const RoiStatusPill: React.FC<{frame: number}> = ({frame}) => {
	const verified = softProgress(frame, 312, 334);
	const calculating = 1 - verified;
	return (
		<div
			style={{
				position: 'relative',
				width: 310,
				height: 48,
				flex: '0 0 310px',
				borderRadius: 999,
				overflow: 'hidden',
				background: `rgba(${verified > 0.5 ? '85,240,181' : '69,217,255'},0.08)`,
				border: `1px solid ${
					verified > 0.5
						? 'rgba(85,240,181,0.30)'
						: 'rgba(69,217,255,0.27)'
				}`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 10,
					opacity: calculating,
					transform: `translateY(${-verified * 11}px)`,
					color: COLORS.cyan,
					fontFamily: MONO_FONT,
					fontSize: 13,
					fontWeight: 850,
					letterSpacing: '0.11em',
				}}
			>
				<span
					style={{
						width: 8,
						height: 8,
						borderRadius: '50%',
						background: COLORS.cyan,
						boxShadow: '0 0 12px rgba(69,217,255,0.7)',
					}}
				/>
				CALCULATING
			</div>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 10,
					opacity: verified,
					transform: `translateY(${(1 - verified) * 11}px)`,
					color: COLORS.mint,
					fontFamily: MONO_FONT,
					fontSize: 13,
					fontWeight: 850,
					letterSpacing: '0.1em',
				}}
			>
				<CheckIcon color={COLORS.mint} size={20} />
				ROI VERIFIED
			</div>
		</div>
	);
};

const ValueChart: React.FC<{frame: number}> = ({frame}) => {
	const reveal = softProgress(frame, 248, 274);
	const draw = softProgress(frame, 270, 334);
	const barReveal = softProgress(frame, 290, 334);
	const linePath =
		'M70 369 C113 348 143 359 181 325 C225 286 258 306 298 269 C337 233 372 250 414 205 C454 172 496 198 534 161 C574 134 618 151 666 120';
	const gridYs = [75, 150, 225, 300, 375];

	return (
		<Card
			accent={COLORS.mint}
			style={{
				height: 486,
				opacity: reveal,
				transform: `translateX(${(1 - reveal) * 24}px)`,
				filter: `blur(${(1 - reveal) * 7}px)`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 25,
					right: 25,
					top: 22,
					display: 'flex',
					alignItems: 'flex-start',
					zIndex: 2,
				}}
			>
				<div>
					<SmallCaps>VALUE CREATION INDEX</SmallCaps>
					<div
						style={{
							marginTop: 7,
							fontSize: 23,
							fontWeight: 760,
							letterSpacing: '-0.02em',
						}}
					>
						Attributed business impact
					</div>
				</div>
				<div style={{flex: 1}} />
				<div style={{textAlign: 'right'}}>
					<div
						style={{
							fontFamily: MONO_FONT,
							fontSize: 31,
							lineHeight: 1,
							fontWeight: 850,
							color: COLORS.mint,
							letterSpacing: '-0.04em',
						}}
					>
						+38.6%
					</div>
					<SmallCaps color={COLORS.mint} style={{fontSize: 10, marginTop: 7}}>
						VS. BASELINE
					</SmallCaps>
				</div>
			</div>
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 760 486"
				style={{position: 'absolute', inset: 0}}
			>
				<defs>
					<linearGradient id="valueArea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={COLORS.mint} stopOpacity="0.28" />
						<stop offset="0.55" stopColor={COLORS.cyan} stopOpacity="0.08" />
						<stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
					</linearGradient>
					<linearGradient id="valueLine" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor={COLORS.blue} />
						<stop offset="0.5" stopColor={COLORS.cyan} />
						<stop offset="1" stopColor={COLORS.mint} />
					</linearGradient>
					<filter id="chartGlow" x="-30%" y="-50%" width="160%" height="200%">
						<feGaussianBlur stdDeviation="3.5" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<clipPath id="chartReveal">
						<rect x="50" y="48" width={640 * draw} height="354" />
					</clipPath>
				</defs>
				{gridYs.map((y, index) => (
					<g key={y}>
						<path
							d={`M55 ${y + 35}H704`}
							stroke="rgba(135,190,214,0.11)"
							strokeWidth="1"
							strokeDasharray={index === 4 ? undefined : '4 8'}
						/>
						<text
							x="718"
							y={y + 39}
							fill="#658ba0"
							fontFamily={MONO_FONT}
							fontSize="10"
						>
							{`${120 - index * 20}`}
						</text>
					</g>
				))}
				<g clipPath="url(#chartReveal)">
					<path
						d={`${linePath} L666 400 L70 400 Z`}
						fill="url(#valueArea)"
						opacity={0.8 * draw}
					/>
					<path
						d={linePath}
						fill="none"
						stroke="rgba(85,240,181,0.18)"
						strokeWidth="10"
						filter="url(#chartGlow)"
					/>
					<path
						d={linePath}
						fill="none"
						stroke="url(#valueLine)"
						strokeWidth="4"
						strokeLinecap="round"
					/>
					{[
						[70, 369],
						[181, 325],
						[298, 269],
						[414, 205],
						[534, 161],
						[666, 120],
					].map(([x, y], index) => (
						<g key={`${x}-${y}`} opacity={softProgress(draw, index / 7, (index + 1) / 7)}>
							<circle
								cx={x}
								cy={y}
								r="10"
								fill="rgba(85,240,181,0.12)"
								stroke="rgba(85,240,181,0.22)"
							/>
							<circle cx={x} cy={y} r="4" fill={COLORS.mint} />
						</g>
					))}
				</g>
				{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((month, index) => (
					<text
						key={month}
						x={70 + index * 119}
						y="435"
						textAnchor="middle"
						fill="#6f94a8"
						fontFamily={MONO_FONT}
						fontSize="11"
						letterSpacing="1.5"
					>
						{month}
					</text>
				))}
				<g opacity={barReveal}>
					{[33, 48, 42, 62, 70, 88].map((height, index) => (
						<rect
							key={`${height}-${index}`}
							x={62 + index * 119}
							y={400 - height * barReveal}
							width="16"
							height={height * barReveal}
							rx="5"
							fill="rgba(69,136,255,0.16)"
						/>
					))}
				</g>
			</svg>
		</Card>
	);
};

const BackDashboard: React.FC<{frame: number}> = ({frame}) => {
	// The compact assistant begins the handoff as soon as the reverse face is
	// visible; the analytical modules then build around it.
	const headerReveal = revealStyle(frame, 188, 211, 12);
	const footerReveal = softProgress(frame, 292, 334);
	const assistantGuideOpacity = softProgress(frame, 176, 194);

	return (
		<div
				style={{
					position: 'absolute',
					inset: 0,
					fontFamily: UI_FONT,
					color: COLORS.text,
			}}
		>
			<header
				style={{
					height: 104,
					display: 'flex',
					alignItems: 'center',
					padding: '0 40px',
					borderBottom: `1px solid ${COLORS.line}`,
					background:
						'linear-gradient(90deg, rgba(10,37,57,0.86), rgba(6,20,37,0.38))',
					...headerReveal,
				}}
			>
				<BrandMark />
				<div style={{marginLeft: 17}}>
					<SmallCaps color={COLORS.mint}>NEXUS AI / VALUE INTELLIGENCE</SmallCaps>
					<div
						style={{
							fontSize: 31,
							lineHeight: 1.18,
							fontWeight: 780,
							letterSpacing: '-0.025em',
							marginTop: 4,
						}}
					>
						AI Business ROI Command Center
					</div>
				</div>
				<div style={{flex: 1}} />
				<div
					style={{
						marginRight: 22,
						paddingRight: 22,
						borderRight: `1px solid ${COLORS.line}`,
						textAlign: 'right',
					}}
				>
					<SmallCaps>ATTRIBUTION WINDOW</SmallCaps>
					<div
						style={{
							marginTop: 5,
							fontFamily: MONO_FONT,
							fontSize: 16,
							fontWeight: 700,
							color: '#c7e5f2',
						}}
					>
						Q2 · LIVE MODEL
					</div>
				</div>
					<RoiStatusPill frame={frame} />
				</header>

				<div
					style={{
						position: 'absolute',
						right: 48,
						bottom: 117,
						width: 132,
						height: 142,
						zIndex: 6,
						opacity: assistantGuideOpacity,
						transform: `translateY(${
							(1 - softProgress(frame, 176, 194)) * 14
						}px)`,
					}}
				>
					<NovaMascot
						frame={frame}
						opacity={1}
						instance="nova-guide"
						compact
					/>
				</div>

				<div
					style={{
					position: 'absolute',
					left: 30,
					right: 30,
					top: 126,
					height: 486,
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 2.03fr',
					gridTemplateRows: '1fr 1fr',
					gap: 20,
				}}
			>
				<KpiCard
					frame={frame}
					start={218}
					label="COST SAVED"
					value="$428K"
					delta="+24.8%"
					type="saving"
					color={COLORS.mint}
				/>
				<KpiCard
					frame={frame}
					start={230}
					label="TIME SAVED"
					value="2,840 h"
					delta="+612 HRS"
					type="time"
					color={COLORS.cyan}
				/>
				<div style={{gridColumn: 3, gridRow: '1 / span 2'}}>
					<ValueChart frame={frame} />
				</div>
				<KpiCard
					frame={frame}
					start={242}
					label="SUCCESS RATE"
					value="96.8%"
					delta="+8.2 PTS"
					type="success"
					color={COLORS.lime}
				/>
				<KpiCard
					frame={frame}
					start={254}
					label="RETURN ON AI"
					value="4.7×"
					delta="+1.3×"
					type="roi"
					color={COLORS.amber}
				/>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 30,
					right: 30,
					bottom: 25,
					height: 238,
					display: 'grid',
					gridTemplateColumns: '1.28fr 0.72fr',
					gap: 20,
					opacity: footerReveal,
					transform: `translateY(${(1 - footerReveal) * 20}px)`,
					filter: `blur(${(1 - footerReveal) * 7}px)`,
				}}
			>
				<Card accent={COLORS.cyan} style={{padding: '21px 24px'}}>
					<div style={{display: 'flex', alignItems: 'center'}}>
						<div>
							<SmallCaps>VALUE ATTRIBUTION</SmallCaps>
							<div
								style={{
									marginTop: 6,
									fontSize: 21,
									fontWeight: 750,
									letterSpacing: '-0.02em',
								}}
							>
								Measured impact by business function
							</div>
						</div>
						<div style={{flex: 1}} />
						<div
							style={{
								fontFamily: MONO_FONT,
								fontSize: 12,
								color: COLORS.muted,
							}}
						>
							CONFIDENCE 98.2%
						</div>
					</div>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(4, 1fr)',
							gap: 18,
							marginTop: 24,
						}}
					>
						{[
							['REVENUE', 88, COLORS.mint, '$182K'],
							['OPERATIONS', 74, COLORS.cyan, '$119K'],
							['SERVICE', 61, COLORS.blue, '$78K'],
							['RISK', 47, COLORS.amber, '$49K'],
						].map(([label, amount, color, value]) => {
							const width =
								Number(amount) * softProgress(frame, 306, 339);
							return (
								<div key={String(label)}>
									<div
										style={{
											display: 'flex',
											alignItems: 'baseline',
											justifyContent: 'space-between',
										}}
									>
										<SmallCaps style={{fontSize: 10}}>{label}</SmallCaps>
										<div
											style={{
												fontFamily: MONO_FONT,
												fontSize: 16,
												fontWeight: 800,
												color: String(color),
											}}
										>
											{value}
										</div>
									</div>
									<div
										style={{
											marginTop: 11,
											height: 8,
											borderRadius: 999,
											background: 'rgba(126,180,204,0.09)',
											overflow: 'hidden',
										}}
									>
										<div
											style={{
												width: `${width}%`,
												height: '100%',
												borderRadius: 999,
												background: `linear-gradient(90deg, ${String(
													color,
												)}55, ${String(color)})`,
											}}
										/>
									</div>
								</div>
							);
						})}
					</div>
					<div
						style={{
							marginTop: 23,
							paddingTop: 17,
							borderTop: `1px solid ${COLORS.line}`,
							display: 'flex',
							gap: 26,
						}}
					>
						{[
							['MODEL', 'Causal uplift v4.2'],
							['BASELINE', 'Human-led workflow'],
							['UPDATED', '4 sec ago'],
						].map(([label, value]) => (
							<div key={label} style={{display: 'flex', gap: 9}}>
								<SmallCaps style={{fontSize: 10}}>{label}</SmallCaps>
								<div
									style={{
										fontFamily: MONO_FONT,
										fontSize: 11,
										color: '#bfd9e5',
									}}
								>
									{value}
								</div>
							</div>
						))}
					</div>
				</Card>

				<Card
					accent={COLORS.mint}
					style={{
						padding: '22px 24px',
						background:
							'linear-gradient(145deg, rgba(18,55,61,0.83), rgba(7,27,39,0.95))',
					}}
					>
						<SmallCaps color={COLORS.mint}>EXECUTIVE SUMMARY</SmallCaps>
						<div
							style={{
								fontSize: 24,
								fontWeight: 770,
								lineHeight: 1.25,
								letterSpacing: '-0.025em',
								marginTop: 11,
								maxWidth: 370,
							}}
						>
							AI automation is generating measurable enterprise value.
						</div>
						<div
						style={{
							position: 'absolute',
							left: 24,
							right: 24,
							bottom: 21,
							height: 61,
							display: 'flex',
							alignItems: 'center',
							padding: '0 17px',
							borderRadius: 15,
							background: 'rgba(85,240,181,0.085)',
							border: '1px solid rgba(85,240,181,0.21)',
						}}
					>
						<CheckIcon color={COLORS.mint} size={27} />
						<div style={{marginLeft: 12}}>
							<div
								style={{
									fontFamily: MONO_FONT,
									fontSize: 12,
									fontWeight: 850,
									color: COLORS.mint,
									letterSpacing: '0.1em',
								}}
							>
								BUSINESS CASE VALIDATED
							</div>
							<div
								style={{
									fontSize: 12,
									color: COLORS.muted,
									marginTop: 4,
								}}
							>
								All KPI thresholds exceeded
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

const Background: React.FC<{frame: number}> = ({frame}) => {
	const driftX = Math.sin(frame * 0.007) * 24;
	const driftY = Math.cos(frame * 0.006) * 18;
	const particleData = [
		[8, 17, 0.4],
		[15, 72, 1.1],
		[26, 34, 2.6],
		[39, 83, 4.2],
		[52, 21, 5.8],
		[61, 65, 3.4],
		[72, 38, 0.9],
		[84, 77, 5.1],
		[91, 27, 2.2],
		[96, 58, 4.8],
	];

	return (
		<AbsoluteFill
			style={{
				overflow: 'hidden',
				background:
					'radial-gradient(circle at 50% 38%, #102b47 0%, #071523 44%, #030a12 100%)',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: -100,
					transform: `translate(${driftX}px, ${driftY}px)`,
					backgroundImage:
						'linear-gradient(rgba(86,169,205,0.038) 1px, transparent 1px), linear-gradient(90deg, rgba(86,169,205,0.038) 1px, transparent 1px)',
					backgroundSize: '64px 64px',
					maskImage:
						'radial-gradient(ellipse at center, black 10%, rgba(0,0,0,0.68) 50%, transparent 83%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 760,
					height: 760,
					left: -260 + driftX,
					top: -300 + driftY,
					borderRadius: '50%',
					background: 'rgba(69,136,255,0.13)',
					filter: 'blur(130px)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 660,
					height: 660,
					right: -220 - driftX,
					bottom: -260 - driftY,
					borderRadius: '50%',
					background: 'rgba(85,240,181,0.09)',
					filter: 'blur(140px)',
				}}
			/>
			{particleData.map(([x, y, phase], index) => {
				const twinkle = 0.22 + 0.28 * (0.5 + 0.5 * Math.sin(frame * 0.04 + phase));
				return (
					<div
						key={`${x}-${y}`}
						style={{
							position: 'absolute',
							left: `${x}%`,
							top: `${y}%`,
							width: index % 3 === 0 ? 3 : 2,
							height: index % 3 === 0 ? 3 : 2,
							borderRadius: '50%',
							background: index % 2 ? COLORS.cyan : COLORS.mint,
							opacity: twinkle,
							boxShadow: `0 0 12px ${
								index % 2 ? 'rgba(69,217,255,0.5)' : 'rgba(85,240,181,0.45)'
							}`,
						}}
					/>
				);
			})}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'linear-gradient(120deg, transparent 12%, rgba(105,209,244,0.025) 39%, transparent 63%)',
					transform: `translateX(${((frame * 1.3) % 1200) - 600}px) skewX(-12deg)`,
					mixBlendMode: 'screen',
				}}
			/>
		</AbsoluteFill>
	);
};

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const isFront = frame <= FLIP_MID;
	const flipProgress = interpolate(
		frame,
		[FLIP_START, FLIP_END],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.inOut(Easing.cubic),
		},
	);
	// Switching from +90deg to -90deg exactly at edge-on keeps the reverse
	// content upright while preserving one continuous visual turn.
	const rotationY =
		flipProgress <= 0.5
			? flipProgress * 180
			: flipProgress * 180 - 180;
	const faceWidth = Math.abs(Math.cos(flipProgress * Math.PI));
	const edgeAmount = 1 - faceWidth;
	const edgeFx = clamp01((edgeAmount - 0.46) / 0.54);
	const panelScale = 1 - edgeAmount * 0.035;
	const panelX = -11 * Math.sin(flipProgress * Math.PI);
	const frontContentOpacity = interpolate(frame, [172, 182], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.cubic),
	});
	// The reference opens on a fully established dashboard. Keep the first
	// frame immediately useful instead of spending the opening on an empty fade.
	const panelEntrance = 1;
	const seconds = frame / fps;

	return (
		<AbsoluteFill
			style={{
				width: 1920,
				height: 1080,
				background: COLORS.ink,
				fontFamily: UI_FONT,
				overflow: 'hidden',
			}}
		>
			<Background frame={frame} />

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 31,
					textAlign: 'center',
					fontFamily: MONO_FONT,
					fontSize: 11,
					fontWeight: 700,
					letterSpacing: '0.2em',
					color: 'rgba(139,190,213,0.38)',
					opacity: panelEntrance,
				}}
			>
				AI VALUE SYSTEM · SESSION {String(Math.floor(seconds * 10)).padStart(4, '0')}
			</div>

			<div
				style={{
					position: 'absolute',
					left: 128,
					top: 90,
					width: 1664,
					height: 900,
					perspective: 1800,
					opacity: panelEntrance,
					transform: `translateY(${(1 - panelEntrance) * 20}px) scale(${
						0.985 + panelEntrance * 0.015
					})`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: 30,
						overflow: 'hidden',
						background: `linear-gradient(145deg, ${COLORS.panel}, ${COLORS.panelDeep})`,
						border: '1px solid rgba(128,206,237,0.22)',
						boxShadow: `0 52px 120px rgba(0,0,0,0.5),
							0 0 ${28 + edgeAmount * 44}px rgba(69,217,255,${
								0.08 + edgeAmount * 0.1
							}),
							inset 0 1px 0 rgba(255,255,255,0.055)`,
						transformOrigin: '50% 50%',
						transformStyle: 'preserve-3d',
						transform: `translateX(${panelX}px) rotateY(${rotationY}deg) scale(${panelScale})`,
						filter: `blur(${edgeFx * 1.6}px)`,
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background:
								'linear-gradient(115deg, rgba(255,255,255,0.03), transparent 25%, transparent 73%, rgba(69,217,255,0.025))',
							pointerEvents: 'none',
							zIndex: 20,
						}}
					/>
					{isFront ? (
						<FrontDashboard
							frame={frame}
							contentOpacity={frontContentOpacity}
						/>
					) : (
						<BackDashboard frame={frame} />
					)}
				</div>

				<div
					style={{
						position: 'absolute',
						left: 120,
						right: 120,
						bottom: -35,
						height: 45,
						borderRadius: '50%',
						background: 'rgba(5,13,21,0.62)',
						filter: `blur(${18 + edgeAmount * 6}px)`,
						transform: `scaleX(${0.56 + faceWidth * 0.44})`,
						opacity: 0.82,
					}}
				/>
			</div>

			{edgeFx > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: 960 + panelX - 2,
						top: 132,
						width: 4 + edgeFx * 9,
						height: 816,
						borderRadius: 999,
						background:
							'linear-gradient(180deg, transparent, rgba(127,231,255,0.7), rgba(69,136,255,0.38), transparent)',
						filter: `blur(${1 + edgeFx * 3}px)`,
						opacity: edgeFx * 0.75,
						boxShadow: '0 0 30px rgba(69,217,255,0.36)',
					}}
				/>
			) : null}

			<div
				style={{
					position: 'absolute',
					left: 128,
					right: 128,
					bottom: 37,
					display: 'flex',
					justifyContent: 'space-between',
					fontFamily: MONO_FONT,
					fontSize: 10,
					fontWeight: 700,
					letterSpacing: '0.14em',
					color: 'rgba(139,190,213,0.31)',
					opacity: panelEntrance,
				}}
			>
				<span>ENTERPRISE AI OBSERVABILITY</span>
				<span>FRAME {String(frame).padStart(3, '0')} · 60 FPS</span>
			</div>

			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					background:
						'radial-gradient(ellipse at center, transparent 56%, rgba(0,3,8,0.38) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
