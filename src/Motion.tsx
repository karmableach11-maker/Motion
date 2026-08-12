import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION 65 — "AI AGENT WORKSTATION"
 * ---------------------------------------------------------------------------
 * A glass console assembles itself around a floating pod robot: metrics and a
 * loss curve on the left, a live agent loop and its tool calls on the right,
 * a task queue below, and real code drifting behind all of it.
 *
 * WHAT WAS MEASURED FROM THE REFERENCE
 * ------------------------------------
 * Reference: 700x394, 60 fps, 720 frames, 12.000 s, one continuous take, no
 * camera move at all. [obs] is what came off the frames; [int] is a decision.
 *
 * [obs] The whole clip is one build-on. Counting pixels above luminance 60:
 *       1.2% flat until t=0.90, then 1.9 / 6.2 / 8.0 / 9.8 / 10.4 / 10.7 /
 *       13.0 / 14.4 / 15.2 / 17.8 / 21.7 / 24.0 / 25.8 / 26.9 / 27.3 at
 *       quarter-second steps, and from t=4.75 it sits at 27.4-29.2 for the
 *       remaining 7.4 s. So: 3.6 s of assembly, then a long hold that only
 *       breathes. The schedule below is built to that shape.
 *       Per-frame motion energy backs it up — 0.006 during the build, 0.001 to
 *       0.002 for the whole hold.
 * [obs] Order of arrival, read off the frames: main window at t=1.30, the
 *       robot and its label at t=1.95, the left gear cluster at t=2.60, the
 *       right document panel at t=3.25, the chart and the tall code panel at
 *       t=3.90, the progress bar and side chips at t=4.55.
 * [obs] Palette: background #030911 at centre lifting to #00172f in the
 *       corners; panel fill #0a2c5a; panel edge and glow #1b7ac9; title bar
 *       #011933; the robot reads #1d7ed6 against white; labels #a6bacc.
 *       Luminance percentiles 5 / 10 / 19 / 72 / 173 / 228 — a dark plate with
 *       a bright console sitting in it.
 * [obs] The camera never moves and nothing rotates; the only motion after the
 *       build is a slow float on the panels.
 *
 * [int] The robot is the user's own pod mascot, ported from their file: fused
 *       pod body, big visor, lagging antenna, mitt arms, hover thruster. Its
 *       choreography is kept — idle hover, wave, look-around with a wink, a
 *       double hop with squash and stretch, a cheer — but retimed from 600 to
 *       900 frames and re-cued to the console instead of running on its own.
 *       Now it looks at the panel that is arriving, waves as the loop starts,
 *       and cheers on the last task completing, so the performance reads as
 *       the agent working rather than as a mascot idling in front of a HUD.
 * [int] The brief asked for the background text to carry commercial weight, so
 *       none of it is lorem. The code panel runs a real embed-and-plan agent
 *       loop against a real model name, the tool panel shows a real-shaped
 *       tool-call envelope with latency and token counts, and the drifting
 *       background is the same language. Buyers in this category are searching
 *       for machine-learning, LLM and agent visuals; legible torch and
 *       transformer code is the difference between a generic tech plate and
 *       one that lands on those searches.
 *
 * SOURCES
 * -------
 * Fonts  Orbitron (display) and JetBrains Mono (code), SIL Open Font License
 *        1.1, from google/fonts ofl/ and the JetBrains Mono project; Inter
 *        (UI), SIL OFL 1.1. All three subset to the characters used and
 *        embedded, so the file renders with no network and no external asset.
 */

const FONT_DISP =
	'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' +
	'UCAA==';

const FONT_MONO =
	'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';

const FONT_UI =
	'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' +
	'knxX+dMdtMQgXNChBbcB';


/* ------------------------------------------------------------------ setup */

const TAU = Math.PI * 2;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (x: number) => x * x * (3 - 2 * x);
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const inOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ease = (f: number, a: number, b: number, c: (n: number) => number = outCubic) =>
	c(clamp((f - a) / (b - a), 0, 1));
/* the mascot's own window envelope: 0 -> 1 across (a..b), hold, -> 0 across (c..d) */
const win = (f: number, a: number, b: number, c: number, d: number) =>
	ease(f, a, b, outCubic) * (1 - ease(f, c, d, inOutCubic));
const hash = (n: number) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

const FACE = `
@font-face{font-family:'AgtDisp';src:url(data:font/woff2;base64,${FONT_DISP}) format('woff2');font-weight:800;font-style:normal;font-display:block}
@font-face{font-family:'AgtMono';src:url(data:font/woff2;base64,${FONT_MONO}) format('woff2');font-weight:400;font-style:normal;font-display:block}
@font-face{font-family:'AgtUI';src:url(data:font/woff2;base64,${FONT_UI}) format('woff2');font-weight:500;font-style:normal;font-display:block}`;
if (typeof document !== 'undefined' && !document.getElementById('m65-faces')) {
	const st = document.createElement('style');
	st.id = 'm65-faces';
	st.textContent = FACE;
	document.head.appendChild(st);
}
const useConsoleFonts = () => {
	const [handle] = useState(() => delayRender('m65 fonts'));
	const done = useRef(false);
	useEffect(() => {
		const fin = () => {
			if (!done.current) {
				done.current = true;
				continueRender(handle);
			}
		};
		const d: any = typeof document === 'undefined' ? null : document;
		const ok =
			d && d.fonts && d.fonts.check
				? d.fonts.check("800 40px 'AgtDisp'") && d.fonts.check("400 20px 'AgtMono'") && d.fonts.check("500 20px 'AgtUI'")
				: false;
		if (ok) {
			fin();
			return;
		}
		if (d && d.fonts && d.fonts.load) {
			Promise.all([
				d.fonts.load("800 40px 'AgtDisp'"),
				d.fonts.load("400 20px 'AgtMono'"),
				d.fonts.load("500 20px 'AgtUI'"),
			])
				.then(fin)
				.catch(fin);
		} else fin();
		const id = setTimeout(fin, 800);
		return () => {
			clearTimeout(id);
			fin();
		};
	}, [handle]);
};

/* ------------------------------------------------------------- the palette */
/* [obs] straight off the reference: #030911 centre lifting to #00172f in the
   corners, panel fill #0a2c5a, edge and glow #1b7ac9, title bar #011933,
   labels #a6bacc */
const C = {
	edge: '#2f9bdd',
	glow: '#57c8ff',
	fill0: '#0d3a6e',
	label: '#dbeeff',
	dim: '#9fc9e8',
	key: '#8fcaff',
	str: '#7ee0a0',
	com: '#6b9ec4',
	fn: '#ffd479',
	num: '#ff9f6e',
	white: '#ffffff',
	outline: '#0d2036',
	cyan: '#5ee9ff',
	violet: '#8f7bff',
	aqua: '#3fd6ff',
	cheek: '#ff9db0',
	good: '#4ee39a',
};

/* --------------------------------------------------------- the code itself */
/* [int] not lorem. A real embed-and-plan agent loop against a real model, so
   the plate reads to anyone searching for LLM, agent or torch visuals. */
type Tok = [string, string];
const CODE: Tok[][] = [
	[['from ', C.key], ['transformers ', C.label], ['import ', C.key], ['AutoModel, AutoTokenizer', C.label]],
	[['import ', C.key], ['torch, json, time', C.label]],
	[],
	[['MODEL ', C.label], ['= ', C.key], ['"all-MiniLM-L6-v2"', C.str]],
	[['tok  ', C.label], ['= ', C.key], ['AutoTokenizer', C.fn], ['.from_pretrained(MODEL)', C.label]],
	[['net  ', C.label], ['= ', C.key], ['AutoModel', C.fn], ['.from_pretrained(MODEL).eval()', C.label]],
	[],
	[['def ', C.key], ['embed', C.fn], ['(batch: list[str]) -> Tensor:', C.label]],
	[['    enc ', C.label], ['= ', C.key], ['tok(batch, padding=', C.label], ['True', C.num], [')', C.label]],
	[['    with ', C.key], ['torch.no_grad():', C.label]],
	[['        h ', C.label], ['= ', C.key], ['net(**enc).last_hidden_state', C.label]],
	[['    m ', C.label], ['= ', C.key], ['enc.attention_mask.unsqueeze(-', C.label], ['1', C.num], [')', C.label]],
	[['    return ', C.key], ['(h * m).sum(', C.num], ['1', C.num], [') / m.sum(', C.label], ['1', C.num], [')', C.label]],
	[],
	[['class ', C.key], ['Agent', C.fn], [':', C.label]],
	[['    def ', C.key], ['step', C.fn], ['(self, prompt: str) -> dict:', C.label]],
	[['        # route, call tools, then answer', C.com]],
	[['        plan ', C.label], ['= ', C.key], ['self.llm.plan(prompt, self.tools)', C.label]],
	[['        for ', C.key], ['call ', C.label], ['in ', C.key], ['plan.calls:', C.label]],
	[['            fn ', C.label], ['= ', C.key], ['self.tools[call.name]', C.label]],
	[['            call.result ', C.label], ['= ', C.key], ['fn(**call.args)', C.label]],
	[['            self.trace.append(call)', C.label]],
	[['        return ', C.key], ['self.llm.answer(plan, self.trace)', C.label]],
	[],
	[['agent ', C.label], ['= ', C.key], ['Agent', C.fn], ['(tools=[search, sql, chart])', C.label]],
	[['out ', C.label], ['= ', C.key], ['agent.step(', C.label], ['"summarise Q3 revenue"', C.str], [')', C.label]],
];

const TOOLCALL: Tok[][] = [
	[['{', C.label]],
	[['  "tool"', C.key], [': ', C.label], ['"vector_search"', C.str], [',', C.label]],
	[['  "args"', C.key], [': {', C.label], ['"q"', C.key], [': ', C.label], ['"Q3 revenue"', C.str], [', ', C.label], ['"k"', C.key], [': ', C.label], ['8', C.num], ['},', C.label]],
	[['  "hits"', C.key], [': ', C.label], ['8', C.num], [', ', C.label], ['"latency_ms"', C.key], [': ', C.label], ['42', C.num], [',', C.label]],
	[['  "tokens"', C.key], [': ', C.label], ['1834', C.num], [', ', C.label], ['"cached"', C.key], [': ', C.label], ['true', C.num]],
	[['}', C.label]],
];

const TASKS: [string, number][] = [
	['parse documents', 0],
	['build vector index', 1],
	['rank candidates', 2],
	['generate answer', 3],
];

const CHIPS: [string, string][] = [
	['LATENCY', '42 ms'],
	['THROUGHPUT', '1.8k tok/s'],
	['COST', '$0.004 / req'],
];

/* the drifting backdrop: the same language, one long ribbon */
const BG_CODE = [
	'for step, batch in enumerate(loader):',
	'    loss = criterion(model(batch.x), batch.y)',
	'    loss.backward(); opt.step(); opt.zero_grad()',
	'    if step % 50 == 0: log({"loss": loss.item()})',
	'emb = embed(["quarterly report", "revenue"])',
	'idx = faiss.IndexFlatIP(emb.shape[-1])',
	'idx.add(emb.cpu().numpy().astype("float32"))',
	'scores, ids = idx.search(q_emb, k=8)',
	'ctx = "\\n".join(docs[i] for i in ids[0])',
	'msg = [{"role": "system", "content": SYSTEM},',
	'       {"role": "user", "content": prompt}]',
	'resp = client.chat(model=MODEL, messages=msg,',
	'                   temperature=0.2, tools=TOOLS)',
	'if resp.tool_calls: dispatch(resp.tool_calls)',
	'cache.put(key, resp, ttl=3600)',
	'metrics.observe("tokens", resp.usage.total)',
	'assert f1 > 0.95, "regression on eval set"',
	'torch.save(model.state_dict(), "ckpt.pt")',
];

/* ---------------------------------------------------------- the pod robot */

/* Ported from the user's mascot file and re-cued to the console. The rig is
   theirs: fused pod, big visor, antenna that lags every move, mitt arms,
   hover thruster, squash and stretch that preserves volume. What changed is
   the timing (600 -> 900 frames) and the motivation — each beat is now tied
   to something happening on the console rather than running on its own. */

const hopY = (d: number) => {
	if (d < 0 || d > 52) return 0;
	if (d < 12) return 10 * Math.sin((Math.PI * d) / 12); // anticipation crouch
	if (d < 40) return -74 * Math.sin((Math.PI * (d - 12)) / 28); // airborne
	return 0;
};
const hopSquash = (d: number) => {
	if (d >= 0 && d < 12) return 0.13 * Math.sin((Math.PI * d) / 12);
	if (d >= 40 && d < 52) return 0.15 * Math.sin((Math.PI * (d - 40)) / 12);
	return 0;
};
const hopStretch = (d: number) => (d >= 12 && d < 40 ? 0.09 * Math.abs(Math.cos((Math.PI * (d - 12)) / 28)) : 0);
const HOPS = [516, 566];

const Robot: React.FC<{f: number; born: number}> = ({f, born}) => {
	const phi = (TAU * f) / 900;

	const bob = Math.sin(3.2 * phi * 3) * 9;
	const swayIdle = Math.sin(2.1 * phi * 3) * 2;

	/* blink / wink */
	const blinkAt = (t: number) => 1 - ease(f, t, t + 4, inOutCubic) * (1 - ease(f, t + 4, t + 9, inOutCubic));
	const eyeOpen = clamp(blinkAt(210) * blinkAt(345) * blinkAt(470) * blinkAt(700) * blinkAt(830), 0, 1);
	const winkL = 1 - win(f, 452, 458, 466, 474);
	const eyeLS = Math.max(0.08, eyeOpen * winkL);
	const eyeRS = Math.max(0.08, eyeOpen);

	/* [int] the look beat is aimed at the panels as they land, so the eyes are
	   doing the same job the build is */
	const lookWin = win(f, 396, 416, 476, 496);
	const lookX = Math.sin(2 * phi * 3 + 0.6) * 3 + lookWin * Math.sin((f - 396) * 0.055) * 10;

	/* wave: fires as the agent loop starts on the right */
	const wWave = win(f, 262, 292, 356, 390);
	const wag = Math.sin((f - 292) * 0.34) * 15 * wWave;

	let jumpY = 0;
	let squash = 0;
	let stretch = 0;
	for (const t0 of HOPS) {
		const d = f - t0;
		jumpY += hopY(d);
		squash += hopSquash(d);
		stretch += hopStretch(d);
	}
	const airK = clamp(-jumpY / 74, 0, 1);
	const mouthO = win(f, 512, 522, 606, 618);

	/* cheer: fires when the last task ticks green */
	const wCheer = win(f, 648, 678, 740, 772);
	const cheerWagR = Math.sin((f - 678) * 0.3) * 12 * wCheer;
	const cheerWagL = Math.sin((f - 678) * 0.3 + 0.9) * 12 * wCheer;
	const wiggle = Math.sin((f - 648) * 0.28) * 4 * wCheer;

	/* SVG y-down: negative flares the RIGHT arm out, positive the LEFT */
	const armR = -6 + Math.sin(2 * phi * 3 + 0.4) * 4 - 144 * wWave + wag - 148 * wCheer + cheerWagR - 34 * airK;
	const armL = 6 + Math.sin(2 * phi * 3 + 2.1) * 4 + 148 * wCheer + cheerWagL + 34 * airK;

	const headTilt = wWave * -5 + wiggle * 0.8 + Math.sin(2 * phi * 3 + 1.2) * 1.5;
	/* the antenna lags behind everything — the whole reason the rig feels alive */
	const antA =
		Math.sin(4 * phi * 3 + 0.7) * 6 + wag * 0.55 + cheerWagR * 0.6 - airK * 16 - headTilt * 0.8;

	const smileK = 0.55 + 0.45 * wCheer + 0.15 * wWave;
	const happy = wCheer;
	const thrPulse = 0.5 + 0.22 * Math.sin(6 * phi * 3) + 0.45 * airK;

	const grow = ease(f, born, born + 34, outCubic);
	const sx = (1 + squash - stretch * 0.62) * lerp(0.86, 1, grow);
	const sy = (1 - squash + stretch) * lerp(0.86, 1, grow);

	return (
		<g
			transform={`translate(960 ${548 + bob + jumpY}) rotate(${swayIdle + wiggle}) scale(1.02)`}
			opacity={grow}
		>
			<g transform={`translate(0 148) scale(${sx} ${sy}) translate(0 -148)`}>
				{/* thruster */}
				<ellipse cx={0} cy={186} rx={70} ry={26} fill="url(#m65thr)" opacity={thrPulse} filter="url(#m65soft)" />
				{[0, 1].map((i) => {
					const p = (f / 50 + i * 0.5) % 1;
					return (
						<ellipse
							key={i}
							cx={0}
							cy={178 + p * 34}
							rx={26 + p * 44}
							ry={7 + p * 9}
							fill="none"
							stroke={C.cyan}
							strokeWidth={3.5 * (1 - p)}
							opacity={0.5 * (1 - p) * (0.6 + 0.4 * airK)}
						/>
					);
				})}

				{/* arms */}
				<g transform={`rotate(${armL} -112 -6)`}>
					<rect x={-132} y={-18} width={40} height={112} rx={20} fill="url(#m65shell)" stroke={C.outline} strokeWidth={6} strokeLinejoin="round" />
					<circle cx={-112} cy={102} r={24} fill="url(#m65shell)" stroke={C.outline} strokeWidth={6} />
					<rect x={-124} y={-2} width={10} height={64} rx={5} fill="#ffffff" opacity={0.5} />
				</g>
				<g transform={`rotate(${armR} 112 -6)`}>
					<rect x={92} y={-18} width={40} height={112} rx={20} fill="url(#m65shell)" stroke={C.outline} strokeWidth={6} strokeLinejoin="round" />
					<circle cx={112} cy={102} r={24} fill="url(#m65shell)" stroke={C.outline} strokeWidth={6} />
					<rect x={100} y={-2} width={10} height={64} rx={5} fill="#ffffff" opacity={0.5} />
				</g>

				{/* antenna */}
				<g transform={`rotate(${antA} 0 -140)`}>
					<line x1={0} y1={-140} x2={0} y2={-186} stroke={C.outline} strokeWidth={7} strokeLinecap="round" />
					<circle cx={0} cy={-196} r={13} fill="url(#m65irid)" stroke={C.outline} strokeWidth={5} filter="url(#m65glow)" />
				</g>

				{/* fused pod */}
				<path
					d="M 0 -140 C 80 -140 114 -86 114 -6 C 114 92 66 148 0 148 C -66 148 -114 92 -114 -6 C -114 -86 -80 -140 0 -140 Z"
					fill="url(#m65shell)"
					stroke={C.outline}
					strokeWidth={6}
					strokeLinejoin="round"
				/>
				<ellipse cx={-52} cy={-52} rx={26} ry={62} fill="#ffffff" opacity={0.55} transform="rotate(-14 -52 -52)" />

				<rect x={-72} y={56} width={144} height={15} rx={7.5} fill="url(#m65irid)" opacity={0.95} filter="url(#m65glow)" />
				<circle cx={0} cy={98} r={15 + Math.sin(6 * phi * 3) * 2 + airK * 3} fill={C.cyan} opacity={0.9} filter="url(#m65core)" />
				<circle cx={0} cy={98} r={11} fill="url(#m65irid)" stroke={C.outline} strokeWidth={4.5} />

				{/* head */}
				<g transform={`rotate(${headTilt} 0 -60)`}>
					<rect x={-88} y={-116} width={176} height={120} rx={46} fill="url(#m65visor)" stroke={C.outline} strokeWidth={6} strokeLinejoin="round" />
					<ellipse cx={-38} cy={-96} rx={40} ry={16} fill="#bfeff0" opacity={0.14} />
					<circle cx={0} cy={-56} r={62} fill="#5ff0ff" opacity={0.2} filter="url(#m65glow)" />

					<g transform={`translate(${lookX} 0)`}>
						<g opacity={1 - happy} filter="url(#m65glow)">
							<g transform={`translate(-36 -62) scale(1 ${eyeLS})`}>
								<rect x={-14} y={-22} width={28} height={44} rx={14} fill="url(#m65eye)" />
							</g>
							<g transform={`translate(36 -62) scale(1 ${eyeRS})`}>
								<rect x={-14} y={-22} width={28} height={44} rx={14} fill="url(#m65eye)" />
							</g>
						</g>
						<g opacity={happy} filter="url(#m65glow)">
							<path d="M -50 -56 Q -36 -76 -22 -56" fill="none" stroke="url(#m65eye)" strokeWidth={9} strokeLinecap="round" />
							<path d="M 22 -56 Q 36 -76 50 -56" fill="none" stroke="url(#m65eye)" strokeWidth={9} strokeLinecap="round" />
						</g>
						<circle cx={-42} cy={-74} r={4} fill="#ffffff" opacity={0.85 * (1 - happy) * eyeLS} />
						<circle cx={30} cy={-74} r={4} fill="#ffffff" opacity={0.85 * (1 - happy) * eyeRS} />
					</g>

					<g opacity={1 - mouthO}>
						<path
							d={`M ${-13 - smileK * 6} -22 Q 0 ${-22 + 10 + smileK * 10} ${13 + smileK * 6} -22`}
							fill="none"
							stroke="url(#m65eye)"
							strokeWidth={6.5}
							strokeLinecap="round"
							filter="url(#m65glow)"
						/>
					</g>
					<ellipse cx={0} cy={-19} rx={10} ry={12} fill="url(#m65eye)" opacity={mouthO} filter="url(#m65glow)" />

					<circle cx={-102} cy={-30} r={7} fill={C.cheek} opacity={0.75} filter="url(#m65soft)" />
					<circle cx={102} cy={-30} r={7} fill={C.cheek} opacity={0.75} filter="url(#m65soft)" />
				</g>
			</g>
		</g>
	);
};

/* ------------------------------------------------------------- the panels */

/* Every panel arrives the same way — a short slide from its own outward
   direction plus a scale-up — because the reference's panels do, and because
   a shared arrival is what makes eight separate elements read as one console
   assembling rather than eight things appearing. */
const Panel: React.FC<{
	x: number;
	y: number;
	w: number;
	h: number;
	k: number;
	dx?: number;
	dy?: number;
	r?: number;
	bar?: boolean;
	children?: React.ReactNode;
}> = ({x, y, w, h, k, dx = 0, dy = 0, r = 14, bar, children}) => {
	if (k <= 0.001) return null;
	const s = lerp(0.9, 1, k);
	const ox = dx * (1 - k);
	const oy = dy * (1 - k);
	return (
		<g opacity={clamp(k * 1.15, 0, 1)} transform={`translate(${x + w / 2 + ox} ${y + h / 2 + oy}) scale(${s}) translate(${-(x + w / 2)} ${-(y + h / 2)})`}>
			<rect x={x} y={y} width={w} height={h} rx={r} fill="url(#m65panel)" stroke={C.edge} strokeWidth={1.6} />
			<rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke={C.glow} strokeWidth={3} opacity={0.16} filter="url(#m65soft)" />
			{bar ? (
				<>
					<path d={`M${x} ${y + 18}a18 18 0 0 1 18-18h${w - 36}a18 18 0 0 1 18 18v34H${x}z`} fill="url(#m65bar)" />
					{[0, 1, 2].map((i) => (
						<circle key={i} cx={x + 26 + i * 22} cy={y + 26} r={6} fill="#ffffff" opacity={0.9} />
					))}
				</>
			) : null}
			{children}
		</g>
	);
};

const Mono: React.FC<{x: number; y: number; s: number; toks: Tok[]; op?: number}> = ({x, y, s, toks, op = 1}) => {
	let cx = x;
	return (
		<>
			{toks.map((t, i) => {
				/* xml:space matters here: without it SVG collapses the leading
				   whitespace and every indent in the listing disappears, which is
				   the one thing that makes code read as code */
				const el = (
					<text
						key={i}
						x={cx}
						y={y}
						xmlSpace="preserve"
						fontFamily="AgtMono, monospace"
						fontSize={s}
						fill={t[1]}
						opacity={op}
					>
						{t[0]}
					</text>
				);
				cx += t[0].length * s * 0.6;
				return el;
			})}
		</>
	);
};

/* ---------------------------------------------------------------- the plate */

export const Motion: React.FC = () => {
	useConsoleFonts();
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = f / 60;

	/* [obs] the reference's arrival order, rescaled from its 12 s to this 15:
	   window 1.30, robot 1.95, left cluster 2.60, right document 3.25, chart
	   and tall code 3.90, progress and chips 4.55 */
	const kWin = ease(f, 56, 116, outCubic);
	const kBot = ease(f, 100, 150, outCubic);
	const kLab = ease(f, 132, 176, outCubic);
	const kMetric = ease(f, 150, 206, outCubic);
	const kCode = ease(f, 196, 256, outCubic);
	const kTool = ease(f, 244, 300, outCubic);
	const kDonut = ease(f, 292, 348, outCubic);
	const kChips = ease(f, 336, 392, outCubic);
	const kTasks = ease(f, 380, 440, outCubic);

	/* the hold only breathes, exactly as the reference's does */
	const float = (i: number) => Math.sin(t * (0.5 + i * 0.11) + i * 1.7) * (2.4 + i * 0.5);

	/* the task queue ticks over one by one; the last one is what the robot
	   cheers at, so the two are cued off the same numbers */
	const taskDone = (i: number) => ease(f, 470 + i * 44, 500 + i * 44, outCubic);

	/* a caret runs down the code panel as if the loop were being written */
	const typed = clamp(Math.floor(ease(f, 210, 620, (x) => x) * CODE.length + 0.001), 0, CODE.length);

	const lossPts = Array.from({length: 46}, (_, i) => {
		const u = i / 45;
		const v = Math.exp(-u * 2.6) * 0.86 + 0.06 + Math.sin(i * 1.9) * 0.022 * (1 - u);
		return [286 + u * 236, 470 - v * 74] as [number, number];
	});
	const lossK = ease(f, 200, 470, (x) => x);
	const lossShown = lossPts.slice(0, Math.max(2, Math.floor(lossK * lossPts.length)));

	return (
		<AbsoluteFill style={{background: '#030911', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(80% 94% at 50% 46%, #0b2a48 0%, #06192c 42%, #03101d 74%, #010a14 100%)',
				}}
			/>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<linearGradient id="m65panel" x1="0" y1="0" x2="0.3" y2="1">
						<stop offset="0" stopColor="#2273c4" stopOpacity="0.97" />
						<stop offset="0.5" stopColor="#14539c" stopOpacity="0.95" />
						<stop offset="1" stopColor="#0d3a76" stopOpacity="0.96" />
					</linearGradient>
					<linearGradient id="m65bar" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#4db4ee" />
						<stop offset="1" stopColor="#2483d4" />
					</linearGradient>
					<linearGradient id="m65shell" x1="0" y1="0" x2="0.25" y2="1">
						<stop offset="0" stopColor="#ffffff" />
						<stop offset="0.52" stopColor="#eef2fb" />
						<stop offset="1" stopColor="#c3cee6" />
					</linearGradient>
					<radialGradient id="m65visor" cx="34%" cy="28%" r="92%">
						<stop offset="0" stopColor="#1d4a5e" />
						<stop offset="0.46" stopColor="#11283f" />
						<stop offset="1" stopColor="#0a1424" />
					</radialGradient>
					<linearGradient id="m65eye" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#b6fbff" />
						<stop offset="1" stopColor={C.aqua} />
					</linearGradient>
					<linearGradient id="m65irid" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor={C.cyan} />
						<stop offset="1" stopColor={C.violet} />
					</linearGradient>
					<radialGradient id="m65thr" cx="50%" cy="30%" r="70%">
						<stop offset="0" stopColor="#aef6ff" stopOpacity="0.9" />
						<stop offset="0.55" stopColor={C.cyan} stopOpacity="0.4" />
						<stop offset="1" stopColor={C.cyan} stopOpacity="0" />
					</radialGradient>
					<filter id="m65soft" x="-60%" y="-60%" width="220%" height="220%">
						<feGaussianBlur stdDeviation="3" />
					</filter>
					<filter id="m65glow" x="-80%" y="-80%" width="260%" height="260%">
						<feGaussianBlur stdDeviation="4" result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<filter id="m65core" x="-150%" y="-150%" width="400%" height="400%">
						<feGaussianBlur stdDeviation="14" />
					</filter>
					<clipPath id="m65codeclip">
						<rect x={1176} y={318} width={410} height={548} rx={12} />
					</clipPath>
				</defs>

				{/* ---------------------------------------- the drifting backdrop */}
				<g opacity={0.42 * ease(f, 0, 60, outCubic)}>
					{BG_CODE.concat(BG_CODE).map((s, i) => {
						const y = ((i * 38 - t * 15) % (BG_CODE.length * 38 * 2) + BG_CODE.length * 38 * 2) % (BG_CODE.length * 38 * 2) - 40;
						return (
							<text key={i} x={44} y={y} fontFamily="AgtMono, monospace" fontSize={14} fill="#1e6c9e" opacity={0.66}>
								{s}
							</text>
						);
					})}
					{BG_CODE.concat(BG_CODE).map((s, i) => {
						const y = ((i * 38 + 700 - t * 11) % (BG_CODE.length * 38 * 2) + BG_CODE.length * 38 * 2) % (BG_CODE.length * 38 * 2) - 40;
						return (
							<text key={`r${i}`} x={1418} y={y} fontFamily="AgtMono, monospace" fontSize={13} fill="#1a5c86" opacity={0.55}>
								{s}
							</text>
						);
					})}
				</g>

				{/* circuit traces, as in the reference */}
				<g opacity={0.55 * ease(f, 0, 50, outCubic)} stroke="#1a6d9f" strokeWidth={1.6} fill="none">
					<path d="M0 150h420l70-70h360" />
					<path d="M1920 210h-330l-64 64h-250" />
					<path d="M0 930h300l84 84h420" />
					<path d="M1920 880h-260l-70-70h-330" />
					<path d="M170 0v96l60 60v130" />
					<path d="M1760 1080v-140l-70-70v-120" />
				</g>
				<g opacity={0.6 * ease(f, 0, 50, outCubic)} fill="#1a6f9e">
					{[[490, 80], [1527, 274], [384, 1014], [1590, 810], [230, 156], [1690, 870]].map((p, i) => (
						<rect key={i} x={p[0] - 4} y={p[1] - 4} width={8} height={8} />
					))}
				</g>
				{/* corner brackets */}
				<g opacity={0.7 * ease(f, 20, 80, outCubic)} stroke={C.edge} strokeWidth={2.4} fill="none">
					<path d="M120 250v-90h110" />
					<path d="M1800 250v-90h-110" />
					<path d="M120 830v90h110" />
					<path d="M1800 830v90h-110" />
				</g>

				{/* --------------------------------------------- the main console */}
				<Panel x={470} y={228} w={980} h={620} k={kWin} dy={26} r={18} bar>
					<text x={620} y={266} fontFamily="AgtUI, sans-serif" fontSize={17} fill="#cfe6ff" opacity={0.75} letterSpacing={3}>
						agent-runtime v2.4 — session 8f21
					</text>
					<g opacity={kLab}>
						<text x={960} y={806} textAnchor="middle" fontFamily="AgtDisp, sans-serif" fontWeight={800} fontSize={46} fill="#ffffff" letterSpacing={10}>
							AI AGENT
						</text>
						<text x={960} y={836} textAnchor="middle" fontFamily="AgtUI, sans-serif" fontSize={16} fill={C.dim} letterSpacing={7}>
							AUTONOMOUS REASONING
						</text>
					</g>
				</Panel>

				{/* ------------------------------------------------ left: metrics */}
				<g transform={`translate(0 ${float(0)})`}>
					<Panel x={252} y={330} w={300} h={188} k={kMetric} dx={-70}>
						<text x={276} y={362} fontFamily="AgtUI, sans-serif" fontSize={15} fill={C.dim} letterSpacing={3}>
							EVAL / LOSS
						</text>
						<polyline
							points={lossShown.map((p) => `${p[0]},${p[1]}`).join(' ')}
							fill="none"
							stroke={C.glow}
							strokeWidth={2.6}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						{lossShown.length > 1 ? (
							<circle cx={lossShown[lossShown.length - 1][0]} cy={lossShown[lossShown.length - 1][1]} r={4.5} fill="#ffffff" />
						) : null}
						<text x={276} y={498} fontFamily="AgtMono, monospace" fontSize={15} fill={C.label}>
							loss 0.041
						</text>
						<text x={420} y={498} fontFamily="AgtMono, monospace" fontSize={15} fill={C.good}>
							f1 0.962
						</text>
					</Panel>
				</g>

				{/* -------------------------------------------- left: gpu / tokens */}
				<g transform={`translate(0 ${float(1)})`}>
					<Panel x={264} y={532} w={286} h={176} k={kDonut} dx={-64} dy={34}>
						{(() => {
							const p = 0.74 * ease(f, 300, 470, outCubic);
							const R = 44;
							const cx = 336;
							const cy = 620;
							const a = -Math.PI / 2 + p * TAU;
							const big = p > 0.5 ? 1 : 0;
							return (
								<>
									<circle cx={cx} cy={cy} r={R} fill="none" stroke="#12406f" strokeWidth={13} />
									<path
										d={`M${cx} ${cy - R}A${R} ${R} 0 ${big} 1 ${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)}`}
										fill="none"
										stroke={C.glow}
										strokeWidth={13}
										strokeLinecap="round"
									/>
									<text x={cx} y={cy + 7} textAnchor="middle" fontFamily="AgtDisp, sans-serif" fontWeight={800} fontSize={22} fill="#ffffff">
										{Math.round(p * 100)}%
									</text>
								</>
							);
						})()}
						<text x={402} y={590} fontFamily="AgtUI, sans-serif" fontSize={14} fill={C.dim} letterSpacing={2}>
							GPU LOAD
						</text>
						<text x={402} y={622} fontFamily="AgtMono, monospace" fontSize={16} fill={C.label}>
							1.24M tok
						</text>
						<text x={402} y={652} fontFamily="AgtMono, monospace" fontSize={16} fill={C.label}>
							ctx 128k
						</text>
					</Panel>
				</g>

				{/* -------------------------------------------------- bottom: tasks */}
				<g transform={`translate(0 ${float(2)})`}>
					<Panel x={286} y={716} w={366} h={150} k={kTasks} dy={44}>
						<text x={310} y={746} fontFamily="AgtUI, sans-serif" fontSize={15} fill={C.dim} letterSpacing={3}>
							TASK QUEUE
						</text>
						{TASKS.map(([name, i]) => {
							const d = taskDone(i);
							const y = 772 + i * 24;
							return (
								<g key={name}>
									<circle cx={320} cy={y} r={7} fill="none" stroke={d > 0.5 ? C.good : '#2a6a9e'} strokeWidth={2} />
									<path
										d={`M316 ${y}l3 3.4 5.6-6`}
										fill="none"
										stroke={C.good}
										strokeWidth={2.4}
										strokeLinecap="round"
										strokeLinejoin="round"
										opacity={d}
									/>
									<text x={340} y={y + 5} fontFamily="AgtMono, monospace" fontSize={15} fill={d > 0.5 ? C.label : C.dim} opacity={0.55 + 0.45 * d}>
										{name}
									</text>
								</g>
							);
						})}
					</Panel>
				</g>

				{/* --------------------------------------------- right: agent loop */}
				<g transform={`translate(0 ${float(3)})`}>
					<Panel x={1176} y={318} w={410} h={548} k={kCode} dx={78} r={12}>
						<text x={1198} y={350} fontFamily="AgtUI, sans-serif" fontSize={15} fill={C.dim} letterSpacing={3}>
							agent_loop.py
						</text>
						<g clipPath="url(#m65codeclip)">
							{CODE.slice(0, typed).map((toks, i) => (
								<Mono key={i} x={1198} y={380 + i * 18.4} s={11.7} toks={toks} />
							))}
							{typed < CODE.length ? (
								<rect
									x={1198}
									y={370 + typed * 18.4}
									width={7}
									height={13}
									fill={C.glow}
									opacity={f % 30 < 16 ? 0.9 : 0.15}
								/>
							) : null}
						</g>
					</Panel>
				</g>

				{/* ------------------------------------------ top right: tool call */}
				<g transform={`translate(0 ${float(4)})`}>
					<Panel x={1358} y={186} w={392} h={172} k={kTool} dx={74} dy={-34} r={12}>
						<text x={1382} y={216} fontFamily="AgtUI, sans-serif" fontSize={15} fill={C.dim} letterSpacing={3}>
							TOOL CALL
						</text>
						{TOOLCALL.map((toks, i) => (
							<Mono key={i} x={1382} y={244 + i * 18} s={12} toks={toks} />
						))}
					</Panel>
				</g>

				{/* --------------------------------------------------- right: chips */}
				<g transform={`translate(0 ${float(5)})`}>
					{CHIPS.map(([k, v], i) => (
						<Panel key={k} x={1596} y={430 + i * 74} w={228} h={60} k={ease(f, 336 + i * 26, 392 + i * 26, outCubic)} dx={70} r={10}>
							<text x={1616} y={454 + i * 74} fontFamily="AgtUI, sans-serif" fontSize={12} fill={C.dim} letterSpacing={2}>
								{k}
							</text>
							<text x={1616} y={478 + i * 74} fontFamily="AgtMono, monospace" fontSize={17} fill="#ffffff">
								{v}
							</text>
						</Panel>
					))}
				</g>

				{/* ------------------------------------------------------ the robot */}
				<Robot f={f} born={100} />

				{/* a scan sweep across the console once the build lands */}
				{(() => {
					const p = ((t - 8.2) % 6) / 6;
					if (t < 8.2 || p < 0 || p > 1) return null;
					const x = 430 + p * 1080;
					return (
						<g opacity={0.5 * Math.sin(Math.PI * p)}>
							<rect x={x} y={228} width={2.5} height={620} fill={C.glow} />
							<rect x={x - 26} y={228} width={26} height={620} fill="url(#m65bar)" opacity={0.12} />
						</g>
					);
				})()}
			</svg>

			<AbsoluteFill
				style={{
					background:
						'radial-gradient(84% 80% at 50% 48%, rgba(0,0,0,0) 54%, rgba(1,7,14,0.4) 82%, rgba(0,4,9,0.8) 100%)',
				}}
			/>
			<AbsoluteFill style={{background: '#01060d', opacity: 1 - ease(f, 0, 26, outCubic) + ease(f, durationInFrames - 26, durationInFrames, (x) => x)}} />
		</AbsoluteFill>
	);
};
