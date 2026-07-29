import React from "react";
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

const COLORS = [
	{main: "#18B7E8", light: "#4CD3F3", dark: "#087FAE"},
	{main: "#35C95B", light: "#68E17F", dark: "#168D38"},
	{main: "#FF9B28", light: "#FFBF55", dark: "#D96A08"},
	{main: "#F12382", light: "#FF5AA5", dark: "#B80B5B"},
] as const;

const COLUMN_CENTERS = [300, 740, 1180, 1620] as const;
const clamp = {
	extrapolateLeft: "clamp" as const,
	extrapolateRight: "clamp" as const,
};

const softEase = Easing.bezier(0.22, 0.82, 0.22, 1);
const smoothStep = Easing.inOut(Easing.cubic);

const OrbitalMark: React.FC<{
	color: string;
	frame: number;
	index: number;
}> = ({color, frame, index}) => {
	const turn = (frame * (0.16 + index * 0.015) + index * 90) % 360;
	const pulse = 1 + Math.sin(frame * 0.055 + index * 1.1) * 0.045;

	return (
		<svg
			viewBox="0 0 160 120"
			style={{
				width: 160,
				height: 120,
				overflow: "visible",
				transform: `scale(${pulse})`,
			}}
		>
			<defs>
				<radialGradient id={`orb-glow-${index}`}>
					<stop offset="0%" stopColor={color} stopOpacity="0.22" />
					<stop offset="100%" stopColor={color} stopOpacity="0" />
				</radialGradient>
			</defs>
			<circle cx="80" cy="60" r="58" fill={`url(#orb-glow-${index})`} />
			<circle
				cx="80"
				cy="60"
				r="34"
				fill="none"
				stroke={color}
				strokeOpacity="0.2"
				strokeWidth="2"
				strokeDasharray="5 8"
				style={{transformOrigin: "80px 60px", transform: `rotate(${turn}deg)`}}
			/>
			<circle
				cx="80"
				cy="60"
				r="20"
				fill={color}
				fillOpacity="0.1"
				stroke={color}
				strokeOpacity="0.32"
				strokeWidth="2"
			/>
			<circle cx="80" cy="60" r="7" fill={color} fillOpacity="0.76" />
			<g style={{transformOrigin: "80px 60px", transform: `rotate(${-turn * 0.72}deg)`}}>
				<circle cx="80" cy="25" r="4.5" fill={color} />
				<circle cx="110" cy="77" r="3.5" fill={color} fillOpacity="0.6" />
				<circle cx="50" cy="77" r="3.5" fill={color} fillOpacity="0.6" />
			</g>
		</svg>
	);
};

const IsometricCube: React.FC<{
	color: (typeof COLORS)[number];
	frame: number;
	index: number;
	visibility: number;
}> = ({color, frame, index, visibility}) => {
	const sweep = ((frame + index * 93) % 300) / 300;
	const sweepX = interpolate(sweep, [0, 1], [-150, 320]);
	const glow = 0.34 + Math.sin(frame * 0.047 + index * 1.7) * 0.08;

	return (
		<svg viewBox="0 0 240 250" style={{width: 240, height: 250, overflow: "visible"}}>
			<defs>
				<linearGradient id={`cube-top-${index}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={color.light} />
					<stop offset="100%" stopColor={color.main} />
				</linearGradient>
				<linearGradient id={`cube-left-${index}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={color.main} />
					<stop offset="100%" stopColor={color.dark} />
				</linearGradient>
				<linearGradient id={`cube-right-${index}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={color.light} />
					<stop offset="100%" stopColor={color.main} />
				</linearGradient>
				<linearGradient id={`cube-shine-${index}`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="white" stopOpacity="0" />
					<stop offset="50%" stopColor="white" stopOpacity="0.52" />
					<stop offset="100%" stopColor="white" stopOpacity="0" />
				</linearGradient>
				<clipPath id={`cube-clip-${index}`}>
					<polygon points="120,10 226,67 120,124 14,67" />
					<polygon points="14,67 120,124 120,235 14,178" />
					<polygon points="120,124 226,67 226,178 120,235" />
				</clipPath>
				<filter id={`cube-shadow-${index}`} x="-45%" y="-35%" width="190%" height="210%">
					<feDropShadow
						dx="0"
						dy="18"
						stdDeviation="16"
						floodColor={color.dark}
						floodOpacity="0.24"
					/>
				</filter>
			</defs>

			<ellipse
				cx="120"
				cy="232"
				rx="84"
				ry="18"
				fill={color.dark}
				opacity={glow * visibility}
				style={{
					transformOrigin: "120px 232px",
					transform: `scale(${1 + Math.sin(frame * 0.04 + index) * 0.07})`,
					filter: "blur(10px)",
				}}
			/>

			<g filter={`url(#cube-shadow-${index})`}>
				<polygon
					points="120,10 226,67 120,124 14,67"
					fill={`url(#cube-top-${index})`}
				/>
				<polygon
					points="14,67 120,124 120,235 14,178"
					fill={`url(#cube-left-${index})`}
				/>
				<polygon
					points="120,124 226,67 226,178 120,235"
					fill={`url(#cube-right-${index})`}
				/>
				<path
					d="M14 67L120 124L226 67M120 124V235"
					fill="none"
					stroke="white"
					strokeOpacity="0.19"
					strokeWidth="2"
				/>
				<path
					d="M120 10L226 67V178L120 235L14 178V67Z"
					fill="none"
					stroke={color.dark}
					strokeOpacity="0.22"
					strokeWidth="2"
				/>
				<g clipPath={`url(#cube-clip-${index})`}>
					<rect
						x={sweepX}
						y="-25"
						width="42"
						height="310"
						fill={`url(#cube-shine-${index})`}
						opacity={visibility * 0.38}
						transform="skewX(-23)"
					/>
				</g>
				<circle cx="120" cy="124" r="4" fill="white" fillOpacity="0.46" />
			</g>
		</svg>
	);
};

const EmptyCard: React.FC<{
	color: (typeof COLORS)[number];
	frame: number;
	index: number;
	visibility: number;
}> = ({color, frame, index, visibility}) => {
	const shimmerCycle = ((frame + index * 71) % 260) / 260;
	const shimmerX = interpolate(shimmerCycle, [0, 1], [-220, 500]);
	const breathe = 0.82 + Math.sin(frame * 0.04 + index * 1.4) * 0.1;

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				borderRadius: 28,
				overflow: "hidden",
				background:
					"linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(244,248,255,0.86) 100%)",
				border: "1px solid rgba(255,255,255,0.96)",
				boxShadow: `0 28px 65px rgba(37,51,84,0.14), 0 8px 22px ${color.main}1E, inset 0 1px 0 rgba(255,255,255,0.95)`,
				backdropFilter: "blur(18px)",
			}}
		>
			<div
				style={{
					position: "absolute",
					width: 240,
					height: 240,
					right: -92,
					top: -118,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${color.main}28 0%, ${color.main}00 72%)`,
					opacity: breathe,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: "50%",
					top: "48%",
					transform: "translate(-50%, -50%)",
				}}
			>
				<OrbitalMark color={color.main} frame={frame} index={index} />
			</div>
			<div
				style={{
					position: "absolute",
					top: -45,
					left: shimmerX,
					width: 72,
					height: 330,
					transform: "rotate(20deg)",
					background:
						"linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.58), rgba(255,255,255,0))",
					opacity: visibility * 0.52,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: 11,
					background: `linear-gradient(90deg, ${color.dark}, ${color.main}, ${color.light})`,
					boxShadow: `0 -4px 18px ${color.main}35`,
				}}
			/>
		</div>
	);
};

const Column: React.FC<{
	centerX: number;
	index: number;
}> = ({centerX, index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const color = COLORS[index];

	const cubeStart = 42 + index * 42;
	const lineStart = cubeStart + 42;
	const cardStart = cubeStart + 78;
	const outroStart = 772 + (3 - index) * 18;

	const cubeSpring = spring({
		frame: Math.max(0, frame - cubeStart),
		fps,
		durationInFrames: 58,
		config: {damping: 13, stiffness: 118, mass: 0.82},
	});
	const cardSpring = spring({
		frame: Math.max(0, frame - cardStart),
		fps,
		durationInFrames: 64,
		config: {damping: 15, stiffness: 104, mass: 0.9},
	});
	const lineProgress = interpolate(
		frame,
		[lineStart, lineStart + 48],
		[0, 1],
		{...clamp, easing: softEase},
	);
	const outro = interpolate(
		frame,
		[outroStart, outroStart + 66],
		[1, 0],
		{...clamp, easing: smoothStep},
	);

	const cubeVisibility =
		interpolate(frame, [cubeStart, cubeStart + 18], [0, 1], clamp) * outro;
	const cardVisibility =
		interpolate(frame, [cardStart, cardStart + 20], [0, 1], clamp) * outro;
	const lineVisibility =
		interpolate(frame, [lineStart, lineStart + 10], [0, 1], clamp) * outro;

	const floatY = Math.sin(frame * 0.046 + index * 1.28) * 9;
	const sway = Math.sin(frame * 0.023 + index * 0.9) * (index % 2 === 0 ? 1.3 : -1.3);
	const cubeScale = interpolate(cubeSpring, [0, 1], [0.58, 1]);
	const cubeLift = interpolate(cubeSpring, [0, 1], [-82, 0]);
	const cardLift = interpolate(cardSpring, [0, 1], [78, 0]);
	const cardScale = interpolate(cardSpring, [0, 1], [0.88, 1]);
	const lineLength = 244;
	const pulsePhase = ((frame - lineStart) % 112 + 112) % 112;
	const pulseT = pulsePhase / 112;
	const pulseY = interpolate(pulseT, [0, 1], [244, 476]);
	const pulseOpacity =
		lineProgress *
		outro *
		interpolate(pulseT, [0, 0.14, 0.82, 1], [0, 1, 1, 0], clamp);

	return (
		<div
			style={{
				position: "absolute",
				left: centerX - 180,
				top: 196,
				width: 360,
				height: 770,
			}}
		>
			<div
				style={{
					position: "absolute",
					left: 60,
					top: 0,
					width: 240,
					height: 250,
					opacity: cubeVisibility,
					transform: `translateY(${cubeLift + floatY}px) rotate(${sway}deg) scale(${cubeScale})`,
					transformOrigin: "50% 72%",
				}}
			>
				<IsometricCube
					color={color}
					frame={frame}
					index={index}
					visibility={cubeVisibility}
				/>
			</div>

			<svg
				viewBox="0 0 360 520"
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					width: 360,
					height: 520,
					overflow: "visible",
					opacity: lineVisibility,
				}}
			>
				<defs>
					<linearGradient
						id={`connector-${index}`}
						gradientUnits="userSpaceOnUse"
						x1="180"
						y1="240"
						x2="180"
						y2="484"
					>
						<stop offset="0%" stopColor={color.light} />
						<stop offset="100%" stopColor={color.main} />
					</linearGradient>
					<filter id={`line-glow-${index}`} x="-100%" y="-20%" width="300%" height="140%">
						<feGaussianBlur stdDeviation="4" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				<path
					d="M180 240 C180 300 180 382 180 484"
					fill="none"
					stroke={color.main}
					strokeOpacity="0.24"
					strokeWidth="11"
					strokeLinecap="round"
					strokeDasharray={lineLength}
					strokeDashoffset={lineLength * (1 - lineProgress)}
					filter={`url(#line-glow-${index})`}
				/>
				<path
					d="M180 240 C180 300 180 382 180 484"
					fill="none"
					stroke={`url(#connector-${index})`}
					strokeWidth="5"
					strokeLinecap="round"
					strokeDasharray={lineLength}
					strokeDashoffset={lineLength * (1 - lineProgress)}
				/>
				<circle
					cx="180"
					cy={pulseY}
					r="7"
					fill="white"
					stroke={color.main}
					strokeWidth="4"
					opacity={pulseOpacity}
					filter={`url(#line-glow-${index})`}
				/>
				<g
					style={{
						transformOrigin: "180px 484px",
						transform: `scale(${interpolate(lineProgress, [0.78, 1], [0, 1], clamp)})`,
					}}
				>
					<circle cx="180" cy="484" r="19" fill={color.main} fillOpacity="0.12" />
					<path
						d="M166 475 L180 490 L194 475"
						fill="none"
						stroke={color.main}
						strokeWidth="6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</svg>

			<div
				style={{
					position: "absolute",
					left: 0,
					top: 500,
					width: 360,
					height: 238,
					opacity: cardVisibility,
					transform: `translateY(${cardLift}px) scale(${cardScale})`,
					transformOrigin: "50% 0%",
				}}
			>
				<EmptyCard
					color={color}
					frame={frame}
					index={index}
					visibility={cardVisibility}
				/>
			</div>
		</div>
	);
};

const AmbientBackground: React.FC = () => {
	const frame = useCurrentFrame();
	const globalFade = interpolate(frame, [852, 899], [1, 0.18], {
		...clamp,
		easing: smoothStep,
	});
	const drift = Math.sin(frame * 0.012) * 24;
	const scan = ((frame % 420) / 420) * 2300 - 240;

	const dust = Array.from({length: 38}, (_, index) => {
		const x = (index * 337 + 91) % 1920;
		const y = (index * 223 + 67) % 1080;
		const size = 2 + (index % 4);
		const flicker = 0.15 + (Math.sin(frame * 0.025 + index * 0.88) + 1) * 0.1;
		return {x, y, size, flicker};
	});

	return (
		<AbsoluteFill style={{opacity: globalFade}}>
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"radial-gradient(circle at 50% 35%, #FFFFFF 0%, #F6F9FF 58%, #EDF2FA 100%)",
				}}
			/>

			<svg
				viewBox="0 0 1920 1080"
				style={{position: "absolute", inset: 0, width: "100%", height: "100%"}}
			>
				<defs>
					<linearGradient id="background-line" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#7E8DA9" stopOpacity="0" />
						<stop offset="50%" stopColor="#7E8DA9" stopOpacity="0.14" />
						<stop offset="100%" stopColor="#7E8DA9" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="ambient-scan" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
						<stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
						<stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
					</linearGradient>
					<filter id="ambient-blur">
						<feGaussianBlur stdDeviation="22" />
					</filter>
				</defs>

				<g opacity="0.4" transform={`translate(${drift} 0)`}>
					<path d="M-120 190 C270 10 500 10 860 190 S1440 370 2040 90" fill="none" stroke="url(#background-line)" strokeWidth="2" />
					<path d="M-90 880 C360 650 650 1030 1010 820 S1570 600 2050 860" fill="none" stroke="url(#background-line)" strokeWidth="2" />
					<path d="M280 -80 C70 270 190 470 20 750" fill="none" stroke="url(#background-line)" strokeWidth="2" />
					<path d="M1640 -100 C1810 210 1710 470 1940 690" fill="none" stroke="url(#background-line)" strokeWidth="2" />
				</g>

				<ellipse cx="960" cy="593" rx="724" ry="318" fill="none" stroke="#71809E" strokeOpacity="0.065" strokeWidth="2" strokeDasharray="7 16" />
				<ellipse cx="960" cy="593" rx="610" ry="256" fill="none" stroke="#71809E" strokeOpacity="0.04" strokeWidth="2" />

				{COLORS.map((color, index) => (
					<circle
						key={color.main}
						cx={COLUMN_CENTERS[index]}
						cy="318"
						r="150"
						fill={color.main}
						fillOpacity="0.07"
						filter="url(#ambient-blur)"
					/>
				))}

				<rect
					x={scan}
					y="-120"
					width="185"
					height="1320"
					fill="url(#ambient-scan)"
					opacity="0.34"
					transform={`rotate(16 ${scan + 92} 540)`}
				/>
			</svg>

			{dust.map((dot, index) => (
				<div
					key={index}
					style={{
						position: "absolute",
						left: dot.x,
						top: dot.y,
						width: dot.size,
						height: dot.size,
						borderRadius: "50%",
						background: index % 5 === 0 ? COLORS[index % 4].main : "#8190AA",
						opacity: dot.flicker,
						boxShadow: index % 5 === 0 ? `0 0 12px ${COLORS[index % 4].main}` : "none",
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const opening = interpolate(frame, [0, 30], [0, 1], {
		...clamp,
		easing: smoothStep,
	});
	const cameraScale = 1 + Math.sin(frame * 0.009) * 0.007;
	const cameraY = Math.sin(frame * 0.012) * 3;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "#F4F7FC",
				overflow: "hidden",
			}}
		>
			<AmbientBackground />

			<div
				style={{
					position: "absolute",
					inset: 0,
					opacity: opening,
					transform: `translateY(${cameraY}px) scale(${cameraScale})`,
					transformOrigin: "50% 50%",
				}}
			>
				{COLUMN_CENTERS.map((centerX, index) => (
					<Column key={centerX} centerX={centerX} index={index} />
				))}
			</div>

			<div
				style={{
					position: "absolute",
					left: "5%",
					right: "5%",
					bottom: 46,
					height: 1,
					background:
						"linear-gradient(90deg, rgba(119,132,158,0), rgba(119,132,158,0.16), rgba(119,132,158,0))",
					opacity: opening,
				}}
			/>
		</AbsoluteFill>
	);
};
