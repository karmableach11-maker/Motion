import React from "react";
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from "remotion";

const clamp = {
	extrapolateLeft: "clamp" as const,
	extrapolateRight: "clamp" as const,
};

const smooth = Easing.bezier(0.22, 0.78, 0.22, 1);
const softInOut = Easing.inOut(Easing.cubic);

const STEPS = [
	{
		x: 330,
		accent: "#156CF7",
		accentSoft: "#64B5FF",
		accentDark: "#093B9B",
		start: 18,
		exit: 825,
		badgeSide: "top" as const,
		icon: "discover" as const,
	},
	{
		x: 750,
		accent: "#7658FF",
		accentSoft: "#B39BFF",
		accentDark: "#4324B7",
		start: 144,
		exit: 780,
		badgeSide: "bottom" as const,
		icon: "strategy" as const,
	},
	{
		x: 1170,
		accent: "#00B8D9",
		accentSoft: "#69E8F5",
		accentDark: "#007487",
		start: 270,
		exit: 735,
		badgeSide: "top" as const,
		icon: "build" as const,
	},
	{
		x: 1590,
		accent: "#19BF84",
		accentSoft: "#76E8BC",
		accentDark: "#08734E",
		start: 396,
		exit: 690,
		badgeSide: "bottom" as const,
		icon: "growth" as const,
	},
] as const;

const NODE_Y = 540;

const reveal = (frame: number, start: number, duration: number) =>
	interpolate(frame, [start, start + duration], [0, 1], {
		...clamp,
		easing: smooth,
	});

const hide = (frame: number, start: number, duration: number) =>
	interpolate(frame, [start, start + duration], [1, 0], {
		...clamp,
		easing: softInOut,
	});

const BusinessGlyph: React.FC<{
	type: (typeof STEPS)[number]["icon"];
	x: number;
	y: number;
	color: string;
	progress: number;
}> = ({type, x, y, color, progress}) => {
	const draw = 1 - progress;
	const common = {
		fill: "none",
		stroke: color,
		strokeWidth: 7,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
		pathLength: 1,
		strokeDasharray: 1,
		strokeDashoffset: draw,
	};

	if (type === "discover") {
		return (
			<g>
				<circle
					cx={x}
					cy={y}
					r={42}
					{...common}
					strokeWidth={5}
					opacity={0.34 + progress * 0.25}
				/>
				<path
					d={`M ${x - 24} ${y + 22} L ${x - 9} ${y - 9} L ${x + 25} ${y - 24} L ${x + 10} ${y + 9} Z`}
					{...common}
				/>
				<circle cx={x} cy={y} r={8} fill={color} opacity={progress} />
				<path d={`M ${x} ${y - 58} V ${y - 48}`} {...common} strokeWidth={5} />
				<path d={`M ${x + 49} ${y - 35} L ${x + 41} ${y - 29}`} {...common} strokeWidth={5} />
			</g>
		);
	}

	if (type === "strategy") {
		return (
			<g>
				<path
					d={`M ${x - 32} ${y + 22} L ${x} ${y - 30} L ${x + 37} ${y + 19} M ${x - 32} ${y + 22} L ${x + 37} ${y + 19}`}
					{...common}
				/>
				{[
					{x: x, y: y - 34},
					{x: x - 37, y: y + 27},
					{x: x + 42, y: y + 24},
				].map((point, index) => (
					<g key={index}>
						<circle
							cx={point.x}
							cy={point.y}
							r={15}
							fill="white"
							stroke={color}
							strokeWidth={6}
							opacity={progress}
						/>
						<circle cx={point.x} cy={point.y} r={5} fill={color} opacity={progress} />
					</g>
				))}
			</g>
		);
	}

	if (type === "build") {
		return (
			<g>
				<path
					d={`M ${x} ${y - 52} L ${x + 48} ${y - 25} L ${x} ${y + 2} L ${x - 48} ${y - 25} Z`}
					{...common}
				/>
				<path
					d={`M ${x - 48} ${y - 6} L ${x} ${y + 21} L ${x + 48} ${y - 6}`}
					{...common}
					opacity={0.76}
				/>
				<path
					d={`M ${x - 48} ${y + 14} L ${x} ${y + 41} L ${x + 48} ${y + 14}`}
					{...common}
					opacity={0.46}
				/>
				<circle cx={x} cy={y - 25} r={7} fill={color} opacity={progress} />
			</g>
		);
	}

	return (
		<g>
			<path
				d={`M ${x - 49} ${y + 39} V ${y + 14} H ${x - 28} V ${y + 39} M ${x - 13} ${y + 39} V ${y - 3} H ${x + 8} V ${y + 39} M ${x + 23} ${y + 39} V ${y - 22} H ${x + 44} V ${y + 39}`}
				{...common}
			/>
			<path
				d={`M ${x - 47} ${y - 21} L ${x - 12} ${y - 42} L ${x + 12} ${y - 31} L ${x + 49} ${y - 58} M ${x + 33} ${y - 58} H ${x + 49} V ${y - 42}`}
				{...common}
			/>
		</g>
	);
};

const Connector: React.FC<{
	path: string;
	start: number;
	exit: number;
	colorA: string;
	colorB: string;
	index: number;
	frame: number;
}> = ({path, start, exit, colorA, colorB, index, frame}) => {
	const enter = reveal(frame, start, 84);
	const leave = hide(frame, exit, 62);
	const progress = enter * leave;
	const highlight = reveal(frame, start + 18, 68) * leave;

	return (
		<g opacity={progress}>
			<path
				d={path}
				fill="none"
				stroke={colorA}
				strokeWidth={28}
				strokeLinecap="round"
				opacity={0.1}
				filter="url(#connector-blur)"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - progress}
			/>
			<path
				d={path}
				fill="none"
				stroke={`url(#connector-gradient-${index})`}
				strokeWidth={11}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - progress}
			/>
			<path
				d={path}
				fill="none"
				stroke="white"
				strokeWidth={2.4}
				strokeLinecap="round"
				opacity={0.64}
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - highlight}
			/>
			<defs>
				<linearGradient
					id={`connector-gradient-${index}`}
					gradientUnits="userSpaceOnUse"
					x1="0"
					y1={NODE_Y}
					x2="1920"
					y2={NODE_Y}
				>
					<stop offset="0%" stopColor={colorA} />
					<stop offset="100%" stopColor={colorB} />
				</linearGradient>
			</defs>
		</g>
	);
};

const ProcessNode: React.FC<{
	step: (typeof STEPS)[number];
	index: number;
	frame: number;
	fps: number;
	pulseX: number;
	holdVisibility: number;
}> = ({step, index, frame, fps, pulseX, holdVisibility}) => {
	const {x, start, exit, accent, accentSoft, accentDark, badgeSide, icon} = step;
	const intro = spring({
		frame: Math.max(0, frame - (start + 24)),
		fps,
		durationInFrames: 68,
		config: {damping: 17, stiffness: 118, mass: 0.86},
	});
	const enterOpacity = reveal(frame, start + 10, 36);
	const leave = hide(frame, exit, 64);
	const life = enterOpacity * leave;
	const ringProgress = reveal(frame, start + 20, 82) * leave;
	const centerProgress = reveal(frame, start + 46, 48) * leave;
	const badgeProgress = reveal(frame, start + 55, 58) * leave;
	const iconProgress = reveal(frame, start + 72, 54) * leave;
	const exitBurst = interpolate(frame, [exit, exit + 54], [0, 1], clamp);
	const pulseBoost =
		Math.max(0, 1 - Math.abs(pulseX - x) / 125) * holdVisibility * leave;
	const badgeY = badgeSide === "top" ? 244 : 836;
	const stemStartY = badgeSide === "top" ? NODE_Y - 112 : NODE_Y + 112;
	const stemEndY = badgeSide === "top" ? badgeY + 50 : badgeY - 50;
	const stemDrawY = interpolate(
		badgeProgress,
		[0, 1],
		[stemStartY, stemEndY],
		clamp,
	);
	const scale = (0.78 + intro * 0.22) * (1 - exitBurst * 0.06);
	const ringTurn = frame * (index % 2 === 0 ? 0.075 : -0.065) + index * 24;
	const haloBreath = 0.88 + Math.sin(frame * 0.045 + index * 1.3) * 0.08;
	const badgeFloat = Math.sin(frame * 0.037 + index * 1.8) * 4 * badgeProgress;

	return (
		<g opacity={life}>
			<path
				d={`M ${x} ${stemStartY} L ${x} ${stemEndY}`}
				fill="none"
				stroke={accent}
				strokeWidth={10}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - badgeProgress}
				filter="url(#soft-glow)"
				opacity={0.22}
			/>
			<path
				d={`M ${x} ${stemStartY} L ${x} ${stemEndY}`}
				fill="none"
				stroke={`url(#badge-stem-${index})`}
				strokeWidth={6}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - badgeProgress}
			/>

			<g
				style={{
					transformOrigin: `${x}px ${NODE_Y}px`,
					transform: `scale(${scale})`,
				}}
			>
				<circle
					cx={x}
					cy={NODE_Y}
					r={142}
					fill={accent}
					opacity={(0.055 + pulseBoost * 0.12) * haloBreath}
					filter="url(#large-blur)"
				/>
				<circle
					cx={x}
					cy={NODE_Y}
					r={119}
					fill="none"
					stroke={accent}
					strokeWidth={3}
					opacity={0.13 * ringProgress}
				/>
				<g
					style={{
						transformOrigin: `${x}px ${NODE_Y}px`,
						transform: `rotate(${ringTurn}deg)`,
					}}
				>
					<circle
						cx={x}
						cy={NODE_Y}
						r={124}
						fill="none"
						stroke={`url(#ring-gradient-${index})`}
						strokeWidth={9}
						strokeLinecap="round"
						pathLength={1}
						strokeDasharray="0.31 0.055 0.14 0.07 0.26 0.165"
						strokeDashoffset={1 - ringProgress}
						filter="url(#soft-glow)"
					/>
					<circle
						cx={x}
						cy={NODE_Y}
						r={136}
						fill="none"
						stroke={accent}
						strokeWidth={3}
						strokeLinecap="round"
						pathLength={1}
						strokeDasharray="0.018 0.044"
						strokeDashoffset={1 - ringProgress}
						opacity={0.42}
					/>
				</g>

				<ellipse
					cx={x}
					cy={NODE_Y + 104}
					rx={78}
					ry={18}
					fill={accentDark}
					opacity={0.14 * centerProgress}
					filter="url(#shadow-blur)"
				/>
				<circle
					cx={x}
					cy={NODE_Y}
					r={101}
					fill={`url(#glass-${index})`}
					stroke="rgba(255,255,255,0.95)"
					strokeWidth={3}
					filter="url(#node-shadow)"
					opacity={centerProgress}
				/>
				<circle
					cx={x}
					cy={NODE_Y}
					r={88}
					fill={`url(#inner-glow-${index})`}
					opacity={(0.72 + pulseBoost * 0.28) * centerProgress}
				/>
				<path
					d={`M ${x - 63} ${NODE_Y - 60} A 86 86 0 0 1 ${x + 47} ${NODE_Y - 69}`}
					fill="none"
					stroke="white"
					strokeWidth={8}
					strokeLinecap="round"
					opacity={0.62 * centerProgress}
				/>
				<BusinessGlyph
					type={icon}
					x={x}
					y={NODE_Y}
					color={accent}
					progress={iconProgress}
				/>
			</g>

			<line
				x1={x}
				y1={stemStartY}
				x2={x}
				y2={stemDrawY}
				stroke={accent}
				strokeWidth={7}
				strokeLinecap="round"
				opacity={0.9 * badgeProgress}
			/>
			<line
				x1={x}
				y1={stemStartY}
				x2={x}
				y2={stemDrawY}
				stroke="white"
				strokeWidth={2}
				strokeLinecap="round"
				opacity={0.55 * badgeProgress}
			/>

			<g
				opacity={badgeProgress}
				style={{
					transformOrigin: `${x}px ${badgeY}px`,
					transform: `translateY(${badgeFloat}px) scale(${0.74 + badgeProgress * 0.26})`,
				}}
			>
				<circle
					cx={x}
					cy={badgeY}
					r={60}
					fill={accent}
					opacity={0.17}
					filter="url(#soft-glow)"
				/>
				<circle
					cx={x}
					cy={badgeY}
					r={49}
					fill={`url(#badge-gradient-${index})`}
					stroke="white"
					strokeWidth={3}
					filter="url(#badge-shadow)"
				/>
				<circle
					cx={x}
					cy={badgeY}
					r={39}
					fill="none"
					stroke="white"
					strokeWidth={1.5}
					opacity={0.36}
				/>
				<ellipse
					cx={x - 12}
					cy={badgeY - 16}
					rx={18}
					ry={10}
					fill="white"
					opacity={0.2}
					transform={`rotate(-22 ${x - 12} ${badgeY - 16})`}
				/>
				<text
					x={x}
					y={badgeY + 10}
					fill="white"
					fontFamily="Arial, Helvetica, sans-serif"
					fontSize={30}
					fontWeight={700}
					letterSpacing={1}
					textAnchor="middle"
				>
					{String(index + 1).padStart(2, "0")}
				</text>
			</g>

			{[0, 1, 2, 3, 4, 5].map((particle) => {
				const angle = particle * 1.047 + index * 0.62;
				const radius = 122 + exitBurst * (70 + particle * 9);
				const px = x + Math.cos(angle) * radius;
				const py = NODE_Y + Math.sin(angle) * radius;
				const particleOpacity =
					ringProgress *
					(0.24 + (particle % 3) * 0.11) *
					(1 - exitBurst) *
					leave;
				return (
					<circle
						key={particle}
						cx={px}
						cy={py}
						r={particle % 2 === 0 ? 4.5 : 3}
						fill={particle % 2 === 0 ? accentSoft : accent}
						opacity={particleOpacity}
					/>
				);
			})}

			<defs>
				<linearGradient id={`ring-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={accentSoft} />
					<stop offset="48%" stopColor={accent} />
					<stop offset="100%" stopColor={accentDark} />
				</linearGradient>
				<radialGradient id={`glass-${index}`} cx="35%" cy="25%" r="80%">
					<stop offset="0%" stopColor="white" stopOpacity="0.98" />
					<stop offset="58%" stopColor="#F9FCFF" stopOpacity="0.94" />
					<stop offset="100%" stopColor={accentSoft} stopOpacity="0.18" />
				</radialGradient>
				<radialGradient id={`inner-glow-${index}`} cx="50%" cy="50%" r="62%">
					<stop offset="0%" stopColor={accentSoft} stopOpacity="0.2" />
					<stop offset="62%" stopColor={accent} stopOpacity="0.07" />
					<stop offset="100%" stopColor={accent} stopOpacity="0" />
				</radialGradient>
				<linearGradient id={`badge-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor={accentSoft} />
					<stop offset="45%" stopColor={accent} />
					<stop offset="100%" stopColor={accentDark} />
				</linearGradient>
				<linearGradient id={`badge-stem-${index}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={accentSoft} />
					<stop offset="100%" stopColor={accent} />
				</linearGradient>
			</defs>
		</g>
	);
};

const Background: React.FC<{frame: number}> = ({frame}) => {
	const driftX = Math.sin(frame * 0.005) * 26;
	const driftY = Math.cos(frame * 0.004) * 18;
	const orbPulse = 0.9 + Math.sin(frame * 0.018) * 0.08;

	return (
		<AbsoluteFill
			style={{
				background:
					"radial-gradient(circle at 50% 43%, #FFFFFF 0%, #F8FBFF 48%, #EEF5FF 100%)",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					width: 760,
					height: 760,
					borderRadius: "50%",
					left: -320 + driftX,
					top: -280 + driftY,
					background:
						"radial-gradient(circle, rgba(21,108,247,0.13) 0%, rgba(21,108,247,0) 70%)",
					filter: "blur(34px)",
					transform: `scale(${orbPulse})`,
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: 840,
					height: 840,
					borderRadius: "50%",
					right: -390 - driftX,
					bottom: -350 - driftY,
					background:
						"radial-gradient(circle, rgba(25,191,132,0.12) 0%, rgba(25,191,132,0) 72%)",
					filter: "blur(38px)",
					transform: `scale(${1.02 - (orbPulse - 0.9)})`,
				}}
			/>
			<svg width="100%" height="100%" viewBox="0 0 1920 1080">
				<defs>
					<pattern id="micro-grid" width="48" height="48" patternUnits="userSpaceOnUse">
						<circle cx="2" cy="2" r="1.4" fill="#6E88AD" opacity="0.13" />
					</pattern>
					<linearGradient id="horizon-fade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="white" stopOpacity="0" />
						<stop offset="42%" stopColor="white" stopOpacity="0.8" />
						<stop offset="58%" stopColor="white" stopOpacity="0.8" />
						<stop offset="100%" stopColor="white" stopOpacity="0" />
					</linearGradient>
					<mask id="grid-mask">
						<rect width="1920" height="1080" fill="url(#horizon-fade)" />
					</mask>
				</defs>
				<g
					mask="url(#grid-mask)"
					style={{transform: `translate(${driftX * 0.12}px, ${driftY * 0.12}px)`}}
				>
					<rect x="-60" y="-60" width="2040" height="1200" fill="url(#micro-grid)" />
				</g>
				<path
					d="M 110 540 H 1810"
					stroke="#8FA5C3"
					strokeWidth="1.5"
					strokeDasharray="3 16"
					opacity="0.13"
				/>
			</svg>
		</AbsoluteFill>
	);
};

export const Motion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const holdVisibility =
		reveal(frame, 500, 45) * hide(frame, 675, 42);
	const pulseCycle = ((frame - 510) % 210 + 210) % 210;
	const pulseProgress = interpolate(pulseCycle, [0, 210], [0, 1]);
	const pulseX = interpolate(pulseProgress, [0, 1], [116, 1804]);
	const pulseFade =
		holdVisibility *
		interpolate(pulseProgress, [0, 0.08, 0.9, 1], [0, 1, 1, 0], clamp);
	const cameraScale = interpolate(
		frame,
		[0, 520, 675, 900],
		[1, 1.018, 1.022, 1],
		{...clamp, easing: softInOut},
	);
	const cameraY = interpolate(frame, [0, 560, 900], [6, -4, 6], {
		...clamp,
		easing: softInOut,
	});
	const globalIn = reveal(frame, 0, 18);
	const globalOut = hide(frame, 872, 22);

	const connectorPaths = [
		{
			path: "M 112 540 H 192",
			start: 8,
			exit: 840,
			colorA: "#84BFFF",
			colorB: STEPS[0].accent,
		},
		{
			path: "M 452 540 C 515 540 559 540 628 540",
			start: 112,
			exit: 798,
			colorA: STEPS[0].accent,
			colorB: STEPS[1].accent,
		},
		{
			path: "M 872 540 C 935 540 979 540 1048 540",
			start: 238,
			exit: 753,
			colorA: STEPS[1].accent,
			colorB: STEPS[2].accent,
		},
		{
			path: "M 1292 540 C 1355 540 1399 540 1468 540",
			start: 364,
			exit: 708,
			colorA: STEPS[2].accent,
			colorB: STEPS[3].accent,
		},
		{
			path: "M 1712 540 H 1808",
			start: 490,
			exit: 688,
			colorA: STEPS[3].accent,
			colorB: "#86E8C8",
		},
	];

	return (
		<AbsoluteFill
			style={{
				fontFamily: "Arial, Helvetica, sans-serif",
				backgroundColor: "#F5F9FF",
			}}
		>
			<Background frame={frame} />
			<div
				style={{
					position: "absolute",
					inset: 0,
					opacity: globalIn * globalOut,
					transform: `translateY(${cameraY}px) scale(${cameraScale})`,
					transformOrigin: "50% 50%",
				}}
			>
				<svg width="1920" height="1080" viewBox="0 0 1920 1080">
					<defs>
						<filter id="connector-blur" x="-20%" y="-80%" width="140%" height="260%">
							<feGaussianBlur stdDeviation="12" />
						</filter>
						<filter id="large-blur" x="-80%" y="-80%" width="260%" height="260%">
							<feGaussianBlur stdDeviation="30" />
						</filter>
						<filter id="shadow-blur" x="-80%" y="-160%" width="260%" height="420%">
							<feGaussianBlur stdDeviation="16" />
						</filter>
						<filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
							<feGaussianBlur stdDeviation="4" result="blurred" />
							<feMerge>
								<feMergeNode in="blurred" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter id="node-shadow" x="-60%" y="-60%" width="220%" height="240%">
							<feDropShadow
								dx="0"
								dy="20"
								stdDeviation="19"
								floodColor="#36547D"
								floodOpacity="0.18"
							/>
							<feDropShadow
								dx="0"
								dy="3"
								stdDeviation="4"
								floodColor="#FFFFFF"
								floodOpacity="0.9"
							/>
						</filter>
						<filter id="badge-shadow" x="-100%" y="-100%" width="300%" height="320%">
							<feDropShadow
								dx="0"
								dy="13"
								stdDeviation="12"
								floodColor="#1E3F70"
								floodOpacity="0.24"
							/>
						</filter>
						<radialGradient id="energy-pulse" cx="35%" cy="25%" r="75%">
							<stop offset="0%" stopColor="white" />
							<stop offset="38%" stopColor="#8AF8FF" />
							<stop offset="100%" stopColor="#1675FF" />
						</radialGradient>
					</defs>

					{connectorPaths.map((connector, index) => (
						<Connector
							key={index}
							{...connector}
							index={index}
							frame={frame}
						/>
					))}

					{STEPS.map((step, index) => (
						<ProcessNode
							key={step.x}
							step={step}
							index={index}
							frame={frame}
							fps={fps}
							pulseX={pulseX}
							holdVisibility={holdVisibility}
						/>
					))}

					{[
						{
							x1: 468,
							x2: 612,
							colorA: STEPS[0].accent,
							colorB: STEPS[1].accent,
							start: 112,
							exit: 798,
						},
						{
							x1: 888,
							x2: 1032,
							colorA: STEPS[1].accent,
							colorB: STEPS[2].accent,
							start: 238,
							exit: 753,
						},
						{
							x1: 1308,
							x2: 1452,
							colorA: STEPS[2].accent,
							colorB: STEPS[3].accent,
							start: 364,
							exit: 708,
						},
					].map((bridge, index) => {
						const bridgeProgress =
							reveal(frame, bridge.start, 84) *
							hide(frame, bridge.exit, 62);
						const bridgeX = interpolate(
							bridgeProgress,
							[0, 1],
							[bridge.x1, bridge.x2],
							clamp,
						);
						return (
							<g key={`bridge-${index}`} opacity={bridgeProgress}>
								<defs>
									<linearGradient
										id={`foreground-bridge-${index}`}
										gradientUnits="userSpaceOnUse"
										x1={bridge.x1}
										y1={NODE_Y}
										x2={bridge.x2}
										y2={NODE_Y}
									>
										<stop offset="0%" stopColor={bridge.colorA} />
										<stop offset="100%" stopColor={bridge.colorB} />
									</linearGradient>
								</defs>
								<line
									x1={bridge.x1}
									y1={NODE_Y}
									x2={bridgeX}
									y2={NODE_Y}
									stroke={bridge.colorA}
									strokeWidth={24}
									strokeLinecap="round"
									opacity={0.12}
									filter="url(#connector-blur)"
								/>
								<line
									x1={bridge.x1}
									y1={NODE_Y}
									x2={bridgeX}
									y2={NODE_Y}
									stroke={`url(#foreground-bridge-${index})`}
									strokeWidth={8}
									strokeLinecap="round"
								/>
								<line
									x1={bridge.x1}
									y1={NODE_Y - 1.5}
									x2={bridgeX}
									y2={NODE_Y - 1.5}
									stroke="white"
									strokeWidth={2}
									strokeLinecap="round"
									opacity={0.58}
								/>
							</g>
						);
					})}

					<g opacity={pulseFade} filter="url(#soft-glow)">
						{[0, 1, 2, 3].map((trail) => (
							<circle
								key={trail}
								cx={pulseX - trail * 22}
								cy={NODE_Y}
								r={trail === 0 ? 11 : 7 - trail}
								fill={trail === 0 ? "url(#energy-pulse)" : "#61DDF1"}
								opacity={1 - trail * 0.23}
							/>
						))}
					</g>
				</svg>
			</div>
			<div
				style={{
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					background:
						"linear-gradient(115deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.16))",
				}}
			/>
		</AbsoluteFill>
	);
};
