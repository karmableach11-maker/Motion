import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";

/* =====================================================================
   AI PROMPT BAR — "ASK ANYTHING" WITH TYPING  (Motion.tsx • Motion2.tsx)
   A sleek AI assistant input bar on black with a flowing cyan→purple
   neon border + colour-shifting halo.  User activity: a caret types a
   prompt, sends it, the assistant "thinks", then streams an answer.
   100% original, deterministic, renders offline.
   ===================================================================== */

/* ----------------------------- helpers ----------------------------- */
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bump = (x: number, a: number, b: number, c: number) => {
  if (x <= a || x >= c) return 0;
  return x < b ? smoothstep(a, b, x) : 1 - smoothstep(b, c, x);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const FONT =
  "'Arial','Liberation Sans','Helvetica Neue',Helvetica,Arial,sans-serif";

/* flowing neon gradient — teal dominant with a travelling purple/pink zone */
const conic = (ang: number) =>
  `conic-gradient(from ${ang}deg at 50% 50%, ` +
  "#17e6d2 0deg, #1fd6e6 55deg, #2bb0ff 110deg, #5a72ff 165deg, " +
  "#a94dff 205deg, #ff5cd6 240deg, #7d7bff 285deg, #1fcfe4 330deg, #17e6d2 360deg)";

const PROMPT = "Create a marketing plan for my brand";
const ANSWER = [
  "Define your ideal target audience",
  "Share valuable content every week",
  "Track results, then refine & scale",
];

/* ------------------------------- icons ----------------------------- */
const PlusIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
const MicIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={c} />
    <path d="M6 11a6 6 0 0 0 12 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12" y2="21" stroke={c} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const WaveIcon: React.FC<{ s: number; c: string; t: number }> = ({ s, c, t }) => {
  const bars = [0, 1, 2, 3].map((i) => 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i)));
  return (
    <svg width={s} height={s} viewBox="0 0 24 24">
      {bars.map((h, i) => (
        <rect key={i} x={4 + i * 5} y={12 - h * 8} width="2.4" height={h * 16}
          rx="1.2" fill={c} />
      ))}
    </svg>
  );
};
const SendIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="19" x2="12" y2="6" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M6.5 11.5 L12 5.5 L17.5 11.5" stroke={c} strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const SparkIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <path d="M12 2 L13.6 9.2 L21 11 L13.6 12.8 L12 20 L10.4 12.8 L3 11 L10.4 9.2 Z" fill={c} />
    <circle cx="19" cy="4.5" r="1.4" fill={c} />
  </svg>
);

/* ============================ COMPONENT ============================= */
export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width: W, height: H, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const D = durationInFrames / fps;
  const p = frame / durationInFrames;
  const sc = H / 1080;

  /* -------- timeline (fractions) -------- */
  const pFade = 0.06;
  const pTypeA = 0.14;
  const pTypeB = 0.46;
  const pSend = 0.51;
  const pThinkA = 0.53;
  const pThinkB = 0.63;
  const pRespA = 0.63;
  const pRespB = 0.9;

  const appear = smoothstep(0, pFade, p);

  /* -------- typing -------- */
  const typeProg = clamp((p - pTypeA) / (pTypeB - pTypeA), 0, 1);
  const nChars = Math.floor(typeProg * PROMPT.length);
  const typed = PROMPT.slice(0, nChars);
  const isTyping = p >= pTypeA && p < pTypeB;
  const hasText = nChars > 0;
  // caret blinks; solid while actively typing
  const caretBlink = isTyping ? 1 : (t * 1.6) % 1 < 0.55 ? 1 : 0;
  const caretOn = p < pSend ? caretBlink : 0;
  // per-keystroke shimmer
  const charPhase = typeProg * PROMPT.length;
  const keyPulse = isTyping ? Math.max(0, 1 - (charPhase - Math.floor(charPhase))) * 0.5 : 0;

  /* -------- send / think / response -------- */
  const sendFlash = bump(p, pSend - 0.02, pSend + 0.015, pSend + 0.09);
  const thinking = smoothstep(pThinkA, pThinkA + 0.02, p) * (1 - smoothstep(pThinkB - 0.02, pThinkB, p));
  const respShow = smoothstep(pRespA, pRespA + 0.03, p);
  const shimmerFade = 1 - smoothstep(pRespB - 0.04, pRespB + 0.03, p);

  /* -------- border rotation + energy -------- */
  const baseSpin = 46; // deg per second
  const ang = (t * baseSpin) % 360;
  const energy = 0.55 + 0.2 * Math.sin(t * 1.4) + sendFlash * 0.9 +
    thinking * 0.35 + keyPulse * 0.4;
  const ringBloom = clamp(energy, 0, 1.9);

  /* -------- gentle float -------- */
  const floatY = Math.sin(t * 0.7) * 5 * sc;

  /* -------- geometry (px @1080) -------- */
  const barW = 1080 * sc;
  const barH = 140 * sc;
  const rad = barH / 2;
  const ringW = 2.6 * sc;
  const barCX = W / 2;
  const barCY = H * 0.42 + floatY;

  const barStyleBase: React.CSSProperties = {
    position: "absolute",
    left: barCX,
    top: barCY,
    width: barW,
    height: barH,
    transform: "translate(-50%,-50%)",
    borderRadius: rad,
  };

  /* -------- sparkles -------- */
  const sparks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: random(`sx${i}`),
        y: random(`sy${i}`),
        r: 0.6 + random(`sr${i}`) * 1.7,
        ph: random(`sp${i}`) * Math.PI * 2,
        sp: 0.5 + random(`ss${i}`) * 1.4,
      })),
    [],
  );

  /* -------- response measure -------- */
  const respLeft = barCX - barW / 2 + 8 * sc;
  const respTop = barCY + barH / 2 + 66 * sc;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", overflow: "hidden" }}>
      {/* faint sparkles */}
      {sparks.map((s, i) => {
        const tw = 0.15 + 0.5 * Math.pow(Math.max(0, Math.sin(t * s.sp + s.ph)), 3);
        return (
          <div key={`spk${i}`} style={{
            position: "absolute", left: `${s.x * 100}%`, top: `${s.y * 100}%`,
            width: s.r * 2 * sc, height: s.r * 2 * sc, borderRadius: "50%",
            background: "rgba(150,220,255,0.9)",
            boxShadow: `0 0 ${6 * sc}px rgba(120,200,255,0.9)`,
            opacity: tw * appear * 0.8, transform: "translate(-50%,-50%)",
          }} />
        );
      })}

      <AbsoluteFill style={{ opacity: appear }}>
        {/* ---- big colour halo (blurred rotating gradient) ---- */}
        <div style={{
          ...barStyleBase,
          width: barW * 1.02,
          height: barH * 2.9,
          top: barCY + barH * 0.32,
          background: conic(ang),
          filter: `blur(${70 * sc}px)`,
          opacity: 0.42 * (0.7 + 0.5 * ringBloom),
        }} />

        {/* ---- outer bloom of the border ---- */}
        <div style={{
          ...barStyleBase,
          background: conic(ang),
          filter: `blur(${16 * sc}px)`,
          opacity: 0.55 + 0.4 * ringBloom,
        }} />

        {/* ---- crisp neon ring ---- */}
        <div style={{ ...barStyleBase, background: conic(ang) }}>
          {/* dark face inset by ring width */}
          <div style={{
            position: "absolute", inset: ringW,
            borderRadius: rad - ringW,
            background:
              "linear-gradient(180deg, rgba(10,14,20,0.92), rgba(4,6,10,0.96))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center",
            padding: `0 ${26 * sc}px 0 ${34 * sc}px`, gap: 18 * sc,
            overflow: "hidden",
          }}>
            {/* + icon */}
            <div style={{ flex: "0 0 auto", opacity: 0.9 }}>
              <PlusIcon s={30 * sc} c="#7ff0ea" />
            </div>

            {/* text / placeholder + caret */}
            <div style={{
              flex: 1, position: "relative", height: "100%",
              display: "flex", alignItems: "center", overflow: "hidden",
              fontFamily: FONT, fontSize: 38 * sc, fontWeight: 500,
              letterSpacing: "0.01em", whiteSpace: "nowrap",
            }}>
              {hasText ? (
                <span style={{ color: "#f2fbff" }}>{typed}</span>
              ) : (
                <span style={{ color: "rgba(130,220,225,0.72)" }}>Ask anything</span>
              )}
              <span style={{
                display: "inline-block", width: 2.5 * sc, height: 44 * sc,
                marginLeft: 3 * sc, background: "#8ff3ec",
                boxShadow: `0 0 ${8 * sc}px rgba(120,240,230,0.9)`,
                opacity: caretOn, transform: "translateY(1px)",
              }} />
            </div>

            {/* right icons */}
            <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 16 * sc }}>
              <div style={{ opacity: 0.85 }}><MicIcon s={30 * sc} c="#7ff0ea" /></div>
              <div style={{
                width: 52 * sc, height: 52 * sc, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: hasText
                  ? "linear-gradient(150deg, #2ad0ff, #7a5cff)"
                  : "rgba(120,200,220,0.12)",
                boxShadow: hasText
                  ? `0 0 ${(10 + sendFlash * 34) * sc}px rgba(90,180,255,${0.5 + sendFlash * 0.5})`
                  : "none",
                transform: `scale(${1 + sendFlash * 0.18})`,
              }}>
                {hasText
                  ? <SendIcon s={28 * sc} c="#ffffff" />
                  : <WaveIcon s={30 * sc} c="#7ff0ea" t={t} />}
              </div>
            </div>
          </div>
        </div>

        {/* ---- send ripple ---- */}
        {sendFlash > 0.01 && (
          <div style={{
            ...barStyleBase,
            borderRadius: rad,
            border: `${2 * sc}px solid rgba(140,220,255,${sendFlash * 0.6})`,
            transform: `translate(-50%,-50%) scale(${1 + (1 - sendFlash) * 0.14})`,
            opacity: sendFlash,
          }} />
        )}

        {/* ================= THINKING dots ================= */}
        {thinking > 0.01 && (
          <div style={{
            position: "absolute", left: barCX, top: respTop + 6 * sc,
            transform: "translate(-50%,-50%)",
            display: "flex", gap: 14 * sc, opacity: thinking,
          }}>
            {[0, 1, 2].map((i) => {
              const b = 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * 5 - i * 0.9)), 2);
              return (
                <div key={i} style={{
                  width: 14 * sc, height: 14 * sc, borderRadius: "50%",
                  background: "#7ee6ff",
                  boxShadow: `0 0 ${10 * sc}px rgba(120,220,255,${b})`,
                  opacity: b,
                }} />
              );
            })}
          </div>
        )}

        {/* ================= RESPONSE ================= */}
        {respShow > 0.01 && (
          <div style={{
            position: "absolute", left: respLeft, top: respTop,
            width: barW - 16 * sc, opacity: respShow, fontFamily: FONT,
          }}>
            {/* heading */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12 * sc,
              marginBottom: 22 * sc,
            }}>
              <div style={{ filter: `drop-shadow(0 0 ${8 * sc}px rgba(150,120,255,0.9))` }}>
                <SparkIcon s={30 * sc} c="#b98cff" />
              </div>
              <span style={{
                fontSize: 26 * sc, fontWeight: 700, letterSpacing: "0.02em",
                color: "#dfe8ff",
              }}>
                Your marketing plan
              </span>
            </div>
            {/* answer lines (stream in staggered) */}
            {ANSWER.map((line, i) => {
              const la = pRespA + 0.05 + i * 0.07;
              const lp = smoothstep(la, la + 0.06, p);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16 * sc,
                  marginBottom: 20 * sc,
                  opacity: lp,
                  transform: `translateY(${(1 - easeOut(lp)) * 16 * sc}px)`,
                }}>
                  <div style={{
                    flex: "0 0 auto",
                    width: 30 * sc, height: 30 * sc, borderRadius: "50%",
                    background: "linear-gradient(150deg, rgba(40,210,255,0.25), rgba(120,90,255,0.25))",
                    border: "1px solid rgba(120,200,255,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8ff3ec", fontSize: 15 * sc, fontWeight: 800,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 27 * sc, fontWeight: 500, color: "#dae4f7" }}>
                    {line}
                  </span>
                </div>
              );
            })}

            {/* shimmer sweep while generating */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 12 * sc,
              overflow: "hidden", pointerEvents: "none",
              opacity: shimmerFade * respShow * 0.6,
            }}>
              <div style={{
                position: "absolute", top: 0, bottom: 0, width: "40%",
                left: `${lerp(-40, 100, (t * 0.5) % 1)}%`,
                background:
                  "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(160,220,255,0.28) 50%, rgba(255,255,255,0) 100%)",
                filter: `blur(${6 * sc}px)`,
              }} />
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* subtle vignette */}
      <AbsoluteFill style={{
        background:
          "radial-gradient(120% 120% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
