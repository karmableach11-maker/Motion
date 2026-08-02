import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FILL_END = 884;
const HUD_WIDTH = 1006;
const HUD_HEIGHT = 454;
const TRACK_WIDTH = 782;
const TRACK_HEIGHT = 78;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const codeBlocks = [
  [
    "import neural_core",
    "import secure_runtime",
    "from quantum.mesh import Signal",
    "",
    "# Initialize inference gateway",
    "async def boot_gateway(nodes=64):",
    "    mesh = await Signal.connect(nodes)",
    "    await mesh.verify_integrity()",
    "    return mesh",
    "",
    "class ThreatMonitor:",
    "    def __init__(self, threshold=0.92):",
    "        self.threshold = threshold",
    "        self.events = []",
    "",
    "    def inspect(self, packet):",
    "        vector = encode(packet.payload)",
    "        score = model.predict(vector)",
    "        return score < self.threshold",
    "",
    "# Deploy encrypted model shards",
    "for region in ACTIVE_REGIONS:",
    "    deploy(model, region, mode='secure')",
    "    telemetry.sync(region)",
    "",
    "while gateway.is_online:",
    "    packet = await gateway.receive()",
    "    if monitor.inspect(packet):",
    "        await gateway.route(packet)",
    "    else:",
    "        quarantine(packet.signature)",
  ],
  [
    "const pipeline = createPipeline({",
    "  mode: 'real-time',",
    "  encryption: 'post-quantum',",
    "  replicas: 12,",
    "});",
    "",
    "// Authenticate distributed nodes",
    "for (const node of cluster.nodes) {",
    "  await node.exchangeKeys();",
    "  await node.attest(runtime.hash);",
    "}",
    "",
    "function optimize(signal) {",
    "  const normalized = tensor(signal);",
    "  const result = engine.infer(normalized);",
    "  return result.confidence > 0.96;",
    "}",
    "",
    "pipeline.on('data', async (event) => {",
    "  const valid = await verify(event);",
    "  if (!valid) return isolate(event);",
    "  await pipeline.commit(event);",
    "});",
    "",
    "export async function activate() {",
    "  await pipeline.calibrate();",
    "  await pipeline.start();",
    "  return { status: 'ready' };",
    "}",
  ],
  [
    "use ai_orchestrator::runtime;",
    "use ai_orchestrator::cipher;",
    "",
    "// Adaptive compute scheduler",
    "fn allocate(workload: Tensor) -> Result {",
    "    let profile = runtime::analyze(workload);",
    "    let shard = cipher::seal(profile);",
    "    cluster::dispatch(shard)",
    "}",
    "",
    "struct SecureSession {",
    "    token: QuantumKey,",
    "    latency_ms: f32,",
    "    confidence: f32,",
    "}",
    "",
    "impl SecureSession {",
    "    fn validate(&self) -> bool {",
    "        self.token.valid() &&",
    "        self.confidence >= 0.98",
    "    }",
    "}",
    "",
    "loop {",
    "    let signal = stream::next();",
    "    let result = allocate(signal);",
    "    ledger::commit(result.hash);",
    "}",
  ],
];

const codeColors = ["#B974FF", "#F05BFF", "#CF76FF", "#9A5ED6"];

const CodeColumn: React.FC<{
  column: number;
  x: number;
  width: number;
  scroll: number;
}> = ({column, x, width, scroll}) => {
  const source = codeBlocks[column];
  const repeated = [...source, "", ...source, "", ...source];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: -210,
        width,
        transform: `translateY(${scroll}px)`,
        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
        fontSize: 19,
        fontWeight: 500,
        lineHeight: "27px",
        letterSpacing: -0.35,
        whiteSpace: "pre",
        opacity: column === 1 ? 0.42 : 0.58,
        filter: column === 1 ? "blur(0.35px)" : undefined,
      }}
    >
      {repeated.map((line, index) => {
        const isComment = line.trim().startsWith("#") || line.trim().startsWith("//");
        const color = isComment ? "#FF49D7" : codeColors[(index + column) % codeColors.length];
        return (
          <div
            key={`${column}-${index}`}
            style={{
              height: 27,
              color,
              opacity: line ? 0.72 + ((index * 13 + column * 7) % 23) / 100 : 0,
              textShadow: `0 0 5px ${color}, 0 0 15px rgba(172,51,255,0.32)`,
            }}
          >
            {line || " "}
          </div>
        );
      })}
    </div>
  );
};

const ScanStreaks: React.FC<{frame: number}> = ({frame}) => {
  const streaks = [72, 188, 332, 468, 612, 754, 904, 1018];
  return (
    <AbsoluteFill style={{overflow: "hidden", opacity: 0.64}}>
      {streaks.map((seed, index) => {
        const y = ((seed - frame * (0.72 + (index % 3) * 0.11) + 120) % 1220 + 1220) % 1220 - 70;
        const xShift = Math.sin(frame / (51 + index * 3) + index * 1.7) * 140;
        const phase = 0.5 + 0.5 * Math.sin(frame / (17 + index * 2) + index);
        return (
          <div
            key={seed}
            style={{
              position: "absolute",
              left: -180 + xShift,
              top: y,
              width: 2280,
              height: 7 + (index % 3) * 3,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(113,31,255,0.05) 8%, rgba(219,40,255,0.46) 28%, rgba(255,95,222,0.72) 48%, rgba(126,34,255,0.36) 71%, transparent 100%)",
              filter: `blur(${7 + (index % 2) * 5}px)`,
              opacity: 0.2 + phase * 0.23,
              transform: `scaleX(${0.86 + phase * 0.14})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const CodeField: React.FC<{frame: number}> = ({frame}) => {
  const scroll = interpolate(frame, [0, 899], [0, -905], {
    easing: Easing.linear,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ambient = 0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 0.78);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 50%, #170522 0%, #08000f 28%, #020005 64%, #000000 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -120,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(184,41,255,0.12) 0%, rgba(255,37,198,0.035) 38%, transparent 68%)",
          filter: `blur(${26 + ambient * 8}px)`,
          opacity: 0.8 + ambient * 0.12,
        }}
      />
      <CodeColumn column={0} x={28} width={655} scroll={scroll} />
      <CodeColumn column={1} x={684} width={590} scroll={scroll * 0.93 - 42} />
      <CodeColumn column={2} x={1268} width={636} scroll={scroll * 1.04 - 92} />
      <ScanStreaks frame={frame} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 32%, rgba(0,0,0,0.45) 79%, rgba(0,0,0,0.88) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(255,255,255,0.055) 4px)",
        }}
      />
    </AbsoluteFill>
  );
};

const HudFrame: React.FC<{pulse: number; children: React.ReactNode}> = ({
  pulse,
  children,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50.2%",
        width: HUD_WIDTH,
        height: HUD_HEIGHT,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: 42,
          border: "4px solid #B13CFF",
          opacity: 0.34 + pulse * 0.08,
          filter: `blur(${18 + pulse * 4}px)`,
          boxShadow:
            "0 0 48px rgba(152,45,255,0.92), 0 0 92px rgba(255,30,198,0.52), inset 0 0 34px rgba(213,71,255,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 38,
          background:
            "linear-gradient(180deg, rgba(27,5,39,0.72) 0%, rgba(5,0,11,0.52) 45%, rgba(13,1,24,0.76) 100%)",
          border: "2px solid rgba(255,223,255,0.98)",
          boxShadow: `0 0 ${8 + pulse * 2}px rgba(255,255,255,0.88), 0 0 ${24 + pulse * 7}px rgba(170,58,255,0.98), 0 0 ${58 + pulse * 13}px rgba(255,33,203,0.62), inset 0 0 22px rgba(211,80,255,0.46), inset 0 -30px 70px rgba(79,10,119,0.18)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 82,
            right: 82,
            top: -1,
            height: 3,
            background:
              "linear-gradient(90deg, transparent, #9B4CFF 13%, #FFF3FF 50%, #FF4EDC 87%, transparent)",
            filter: "blur(0.4px)",
            opacity: 0.88,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 112,
            right: 112,
            bottom: -5,
            height: 11,
            background:
              "linear-gradient(90deg, transparent, rgba(140,52,255,0.55), rgba(255,102,225,0.95), rgba(140,52,255,0.55), transparent)",
            filter: "blur(7px)",
            opacity: 0.6 + pulse * 0.14,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(112deg, rgba(255,255,255,0.035) 0%, transparent 25%, transparent 67%, rgba(255,63,220,0.04) 100%)",
          }}
        />
        {children}
      </div>
    </div>
  );
};

const ProgressTrack: React.FC<{
  progress: number;
  pulse: number;
  frame: number;
}> = ({progress, pulse, frame}) => {
  const capOpacity = interpolate(progress, [0, 0.008, 1], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shimmerX = ((frame * 4.2) % (TRACK_WIDTH + 360)) - 230;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 184,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        transform: "translateX(-50%)",
        border: "2px solid rgba(255,236,255,0.94)",
        background: "rgba(16,1,25,0.72)",
        boxShadow: `0 0 6px rgba(255,255,255,0.74), 0 0 ${18 + pulse * 5}px rgba(153,58,255,0.76), inset 0 0 18px rgba(130,28,218,0.5)`,
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 8,
          overflow: "hidden",
          background: "rgba(24,4,35,0.92)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            overflow: "hidden",
            background:
              "linear-gradient(90deg, #E8D8FF 0%, #FFF6FF 16%, #FFFFFF 53%, #FFE8FA 78%, #FFCBF4 100%)",
            boxShadow:
              "0 0 14px rgba(255,255,255,0.96), 0 0 34px rgba(184,64,255,0.98), 0 0 64px rgba(255,35,199,0.88)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: shimmerX,
              top: -25,
              width: 205,
              height: 110,
              transform: "skewX(-24deg)",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.88), transparent)",
              filter: "blur(7px)",
              opacity: 0.68,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          width: Math.max(0, (TRACK_WIDTH - 16) * progress),
          height: TRACK_HEIGHT - 16,
          background:
            "linear-gradient(90deg, rgba(128,36,255,0.56), rgba(255,42,205,0.8))",
          filter: `blur(${12 + pulse * 3}px)`,
          opacity: 0.42 + pulse * 0.1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 8 + (TRACK_WIDTH - 16) * progress - 8,
          top: 5,
          width: 16,
          height: TRACK_HEIGHT - 10,
          background: "#FFF8FF",
          filter: `blur(${3 + pulse}px)`,
          boxShadow:
            "0 0 13px #FFFFFF, 0 0 32px #D645FF, 0 0 58px #FF2AC9",
          opacity: capOpacity,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

const StatusCopy: React.FC<{
  frame: number;
  percentage: number;
  pulse: number;
}> = ({frame, percentage, pulse}) => {
  const dots = ".".repeat((Math.floor(frame / 18) % 5) + 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 84,
          textAlign: "center",
          color: "#FFF9FF",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 38,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: -0.7,
          textShadow: `0 0 5px rgba(255,255,255,0.85), 0 0 ${13 + pulse * 3}px rgba(225,113,255,0.7)`,
        }}
      >
        Loading System<span style={{display: "inline-block", width: 83, textAlign: "left"}}>{dots}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 304,
          textAlign: "center",
          color: "#FFF9FF",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 56,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: -1.8,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 5px rgba(255,255,255,0.92), 0 0 ${14 + pulse * 4}px rgba(222,98,255,0.74), 0 0 ${30 + pulse * 7}px rgba(255,33,198,0.32)`,
        }}
      >
        {percentage}%
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = clamp(
    interpolate(frame, [0, FILL_END], [0, 1], {
      easing: Easing.linear,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    0,
    1,
  );
  const percentage = frame >= FILL_END ? 100 : Math.min(99, Math.floor(progress * 100));
  const pulse = 0.5 + 0.5 * Math.sin((frame / 60) * Math.PI * 0.92);
  const completionPulse = interpolate(
    frame,
    [FILL_END - 2, FILL_END, Math.min(durationInFrames - 1, FILL_END + 15)],
    [0, 1, 0.45],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const livePulse = clamp(pulse * 0.72 + completionPulse * 0.28, 0, 1);

  return (
    <AbsoluteFill style={{backgroundColor: "#000", color: "white", overflow: "hidden"}}>
      <CodeField frame={frame} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1240,
          height: 620,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(168,44,255,0.14) 0%, rgba(255,28,202,0.055) 43%, transparent 74%)",
          filter: `blur(${31 + livePulse * 7}px)`,
          opacity: 0.72 + livePulse * 0.12,
        }}
      />
      <HudFrame pulse={livePulse}>
        <StatusCopy frame={frame} percentage={percentage} pulse={livePulse} />
        <ProgressTrack progress={progress} pulse={livePulse} frame={frame} />
      </HudFrame>
    </AbsoluteFill>
  );
};
