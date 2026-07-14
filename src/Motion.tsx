/**
 * Motion7.tsx — "AI NEURAL NETWORK — CONNECTED WORD NODES"
 * Composition: id "Motion" · 1920×1080 · 60 fps · 720 frames (12s)
 *
 * Direction: CLEAN
 * A knowledge-graph of AI terms on deep blue. "ARTIFICIAL INTELLIGENCE" is the
 * largest central hub; tiers of related terms ripple outward as glowing nodes,
 * each wired to its parent (plus a few cross-links) by thin luminous edges.
 * Nodes scale-pop in on a staggered schedule and then breathe; edges draw on,
 * then carry travelling pulses of light between nodes. Faint drifting particles
 * add depth. Original generic terminology — no logos / brands — microstock safe.
 */

import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';

const W = 1920;
const H = 1080;
const DURATION = 720;

const SANS =
  '"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif';

type Node = {l: string; x: number; y: number; r: number; tier: number; at: number; ph: number; sp: number};
type Edge = {a: number; b: number; k: number; at: number; ph: number; sp: number};

const NODES: Node[] = [
  {l:"ARTIFICIAL INTELLIGENCE",x:960,y:540,r:74,tier:0,at:20,ph:6.23,sp:0.085},
  {l:"MACHINE LEARNING",x:928,y:268,r:40,tier:1,at:62,ph:3.09,sp:0.089},
  {l:"NEURAL NETWORKS",x:1352,y:400,r:40,tier:1,at:76,ph:4.70,sp:0.066},
  {l:"COMPUTER VISION",x:1352,y:688,r:40,tier:1,at:90,ph:3.82,sp:0.089},
  {l:"NATURAL LANGUAGE",x:983,y:803,r:40,tier:1,at:104,ph:3.91,sp:0.063},
  {l:"ROBOTICS",x:570,y:675,r:40,tier:1,at:118,ph:1.07,sp:0.074},
  {l:"BIG DATA",x:554,y:425,r:40,tier:1,at:132,ph:5.82,sp:0.074},
  {l:"SUPERVISED",x:679,y:149,r:26,tier:2,at:170,ph:3.75,sp:0.071},
  {l:"CLUSTERING",x:923,y:163,r:26,tier:2,at:181,ph:0.65,sp:0.055},
  {l:"REGRESSION",x:1154,y:132,r:26,tier:2,at:192,ph:5.11,sp:0.104},
  {l:"DEEP LEARNING",x:1381,y:214,r:26,tier:2,at:203,ph:2.35,sp:0.098},
  {l:"TENSOR",x:1627,y:332,r:26,tier:2,at:214,ph:4.24,sp:0.113},
  {l:"GRADIENT",x:1656,y:477,r:26,tier:2,at:225,ph:6.02,sp:0.078},
  {l:"DETECTION",x:1576,y:693,r:26,tier:2,at:236,ph:6.21,sp:0.117},
  {l:"SEGMENTATION",x:1528,y:788,r:26,tier:2,at:247,ph:3.71,sp:0.112},
  {l:"SEMANTICS",x:1105,y:944,r:26,tier:2,at:258,ph:3.08,sp:0.076},
  {l:"GENERATIVE",x:847,y:944,r:26,tier:2,at:269,ph:1.55,sp:0.111},
  {l:"AUTONOMY",x:417,y:816,r:26,tier:2,at:280,ph:1.02,sp:0.055},
  {l:"SENSORS",x:221,y:687,r:26,tier:2,at:291,ph:5.06,sp:0.104},
  {l:"ANALYTICS",x:255,y:501,r:26,tier:2,at:302,ph:3.03,sp:0.109},
  {l:"DATASETS",x:243,y:371,r:26,tier:2,at:313,ph:0.33,sp:0.068},
  {l:"INFERENCE",x:485,y:252,r:26,tier:2,at:324,ph:1.82,sp:0.079},
];

const EDGES: Edge[] = [
  {a:0,b:1,k:0,at:68,ph:1.07,sp:0.97},
  {a:0,b:2,k:0,at:82,ph:2.12,sp:1.80},
  {a:0,b:3,k:0,at:96,ph:6.18,sp:1.65},
  {a:0,b:4,k:0,at:110,ph:3.01,sp:1.15},
  {a:0,b:5,k:0,at:124,ph:6.02,sp:1.43},
  {a:0,b:6,k:0,at:138,ph:4.58,sp:0.93},
  {a:1,b:7,k:1,at:176,ph:1.33,sp:1.74},
  {a:1,b:8,k:1,at:187,ph:4.99,sp:1.78},
  {a:1,b:9,k:1,at:198,ph:3.78,sp:1.33},
  {a:2,b:10,k:1,at:209,ph:3.65,sp:1.75},
  {a:2,b:11,k:1,at:220,ph:1.93,sp:1.43},
  {a:2,b:12,k:1,at:231,ph:1.73,sp:1.67},
  {a:3,b:13,k:1,at:242,ph:0.06,sp:1.59},
  {a:3,b:14,k:1,at:253,ph:5.99,sp:0.92},
  {a:4,b:15,k:1,at:264,ph:3.73,sp:1.54},
  {a:4,b:16,k:1,at:275,ph:5.35,sp:1.48},
  {a:5,b:17,k:1,at:286,ph:1.62,sp:1.31},
  {a:5,b:18,k:1,at:297,ph:6.02,sp:1.81},
  {a:6,b:19,k:1,at:308,ph:0.84,sp:0.99},
  {a:6,b:20,k:1,at:319,ph:0.59,sp:0.93},
  {a:6,b:21,k:1,at:330,ph:2.81,sp:1.04},
  {a:1,b:2,k:2,at:82,ph:5.45,sp:1.56},
  {a:3,b:4,k:2,at:110,ph:0.79,sp:1.44},
  {a:5,b:6,k:2,at:138,ph:2.04,sp:1.39},
  {a:2,b:3,k:2,at:96,ph:1.38,sp:1.07},
  {a:4,b:5,k:2,at:124,ph:1.16,sp:1.28},
  {a:6,b:1,k:2,at:138,ph:4.46,sp:1.45},
];

const spike = (v: number, c: number, w: number) =>
  Math.exp(-((v - c) * (v - c)) / (2 * w * w));

const fontFor = (tier: number) => (tier === 0 ? 30 : tier === 1 ? 20 : 15);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneIn = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const breathe = 1 + Math.sin(frame / 160) * 0.006;

  // live node centres (gentle drift once they appear)
  const nodePos = (n: Node) => {
    const live = frame > n.at ? 1 : 0;
    const dx = Math.sin(frame * n.sp + n.ph) * (n.tier === 0 ? 2 : 5) * live;
    const dy = Math.cos(frame * n.sp * 0.8 + n.ph) * (n.tier === 0 ? 2 : 5) * live;
    return {x: n.x + dx, y: n.y + dy};
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#030d1e', overflow: 'hidden'}}>
      {/* deep blue radial field */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(115% 120% at 50% 47%, #103972 0%, #0a2551 38%, #061a3a 66%, #030c1d 100%)',
        }}
      />

      {/* drifting particles */}
      <AbsoluteFill style={{opacity: 0.7}}>
        {Array.from({length: 40}).map((_, i) => {
          const a = random(`p${i}`);
          const b = random(`q${i}`);
          const c = random(`r${i}`);
          const x = ((a * W + frame * (0.1 + c * 0.35)) % (W + 60)) - 30;
          const y = 40 + b * (H - 80) + Math.sin(frame / 80 + i) * 10;
          const s = 1 + c * 2.4;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: s,
                height: s,
                borderRadius: '50%',
                background: '#7cc4ff',
                opacity: 0.15 + c * 0.3,
                boxShadow: '0 0 6px #4aa8ff',
              }}
            />
          );
        })}
      </AbsoluteFill>

      <AbsoluteFill style={{transform: `scale(${breathe})`, transformOrigin: '50% 48%', opacity: sceneIn}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <filter id="nGlow" x="-120%" y="-120%" width="340%" height="340%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="a" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="c" />
              <feMerge>
                <feMergeNode in="c" />
                <feMergeNode in="b" />
                <feMergeNode in="a" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="eGlow" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <radialGradient id="hubFill" cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#1b539c" />
              <stop offset="70%" stopColor="#0c2f63" />
              <stop offset="100%" stopColor="#08203f" />
            </radialGradient>
            <radialGradient id="nodeFill" cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#123f7d" />
              <stop offset="100%" stopColor="#08203f" />
            </radialGradient>
          </defs>

          {/* ── EDGES ─────────────────────────────────────────────── */}
          <g>
            {EDGES.map((e, i) => {
              const draw = interpolate(frame, [e.at, e.at + 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.out(Easing.cubic),
              });
              if (draw <= 0.001) return null;
              const A = nodePos(NODES[e.a]);
              const B = nodePos(NODES[e.b]);
              const ex = A.x + (B.x - A.x) * draw;
              const ey = A.y + (B.y - A.y) * draw;
              const cross = e.k === 2;
              const base = cross ? 0.16 : 0.4;
              const flow = 0.5 + 0.5 * Math.sin(frame * 0.06 * e.sp + e.ph);
              return (
                <g key={i}>
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={ex}
                    y2={ey}
                    stroke="#4aa6f2"
                    strokeWidth={cross ? 1 : 1.8}
                    opacity={(base + flow * 0.25) * draw}
                    filter="url(#eGlow)"
                  />
                  {/* travelling pulse */}
                  {draw >= 1 ? (
                    (() => {
                      const t = (frame * 0.012 * e.sp + e.ph / 6) % 1;
                      const px = A.x + (B.x - A.x) * t;
                      const py = A.y + (B.y - A.y) * t;
                      return (
                        <circle cx={px} cy={py} r={cross ? 2 : 3} fill="#bfe6ff" opacity={cross ? 0.5 : 0.85} filter="url(#eGlow)" />
                      );
                    })()
                  ) : null}
                </g>
              );
            })}
          </g>

          {/* ── NODES ─────────────────────────────────────────────── */}
          {NODES.map((n, i) => {
            const pop = interpolate(frame, [n.at, n.at + 22], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.back(2.2)),
            });
            if (pop <= 0.001) return null;
            const P = nodePos(n);
            const hub = n.tier === 0;
            const pulse = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(frame * n.sp * 1.4 + n.ph));
            const landFlash = spike(frame, n.at + 20, 5);
            const rr = n.r * pop;
            const f = fontFor(n.tier);

            return (
              <g key={i} opacity={Math.min(1, pop)}>
                {/* halo */}
                <circle
                  cx={P.x}
                  cy={P.y}
                  r={rr}
                  fill="none"
                  stroke={hub ? '#8ad4ff' : '#5ec8ff'}
                  strokeWidth={hub ? 3 : 2}
                  opacity={0.25 * pulse + landFlash * 0.6}
                  filter="url(#nGlow)"
                />
                {/* disc */}
                <circle cx={P.x} cy={P.y} r={rr} fill={hub ? 'url(#hubFill)' : 'url(#nodeFill)'} />
                <circle
                  cx={P.x}
                  cy={P.y}
                  r={rr}
                  fill="none"
                  stroke={hub ? '#9bd8ff' : '#5ec8ff'}
                  strokeWidth={hub ? 2.5 : 1.8}
                  opacity={0.85}
                />
                {/* specular */}
                <ellipse cx={P.x - rr * 0.32} cy={P.y - rr * 0.4} rx={rr * 0.34} ry={rr * 0.22} fill="#cfeaff" opacity={0.22} />
                {/* label */}
                <text
                  x={P.x}
                  y={P.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily={SANS}
                  fontSize={f * (0.6 + 0.4 * pop)}
                  fontWeight={hub ? 800 : 700}
                  fill="#eaf6ff"
                  opacity={interpolate(pop, [0.5, 1], [0, 1], {extrapolateLeft: 'clamp'})}
                  letterSpacing={hub ? 1 : 0.3}
                >
                  {n.l}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(125% 105% at 50% 50%, rgba(0,0,0,0) 55%, rgba(2,8,20,0.45) 80%, rgba(2,6,14,0.82) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
