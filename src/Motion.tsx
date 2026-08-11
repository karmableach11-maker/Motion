/*
 * Atom icon geometry: Lucide Icons, `atom`, lucide-static v1.31.0.
 * Source: https://lucide.dev/icons/atom
 *
 * ISC License
 * Copyright (c) 2026 Lucide Icons and Contributors
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const WIDTH = 1920;
const HEIGHT = 1080;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const TAU = Math.PI * 2;

const COLORS = {
  background: '#03040B',
  backgroundWarm: '#16070F',
  backgroundCool: '#07121A',
  guide: '#C7D9D6',
  gold: '#FFC85A',
  goldHot: '#FFF3CD',
  coral: '#FF507D',
  coralHot: '#FFE0E9',
  aqua: '#45E8D3',
  aquaHot: '#DDFFFA',
  white: '#FFFFFF',
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const fract = (value: number) => value - Math.floor(value);

const seeded = (index: number, salt = 0) =>
  fract(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123);

type OrbitSpec = {
  id: 'gold' | 'coral' | 'aqua';
  color: string;
  hot: string;
  rx: number;
  ry: number;
  rotation: number;
  period: number;
  phase: number;
  direction: 1 | -1;
  depthPhase: number;
  trailCount: number;
  trailSpacing: number;
  electronRadius: number;
  dashSpeed: number;
  secondaryOffset: number;
};

type OrbitPoint = {
  x: number;
  y: number;
  z: number;
};

type DepthSide = 'back' | 'front';

const ORBITS: OrbitSpec[] = [
  {
    id: 'gold',
    color: COLORS.gold,
    hot: COLORS.goldHot,
    rx: 760,
    ry: 390,
    rotation: 32,
    period: 30,
    phase: 0.02,
    direction: 1,
    depthPhase: 0.25,
    trailCount: 76,
    trailSpacing: 0.034,
    electronRadius: 11,
    dashSpeed: 0.5,
    secondaryOffset: Math.PI * 1.08,
  },
  {
    id: 'coral',
    color: COLORS.coral,
    hot: COLORS.coralHot,
    rx: 690,
    ry: 280,
    rotation: -70,
    period: 23.5,
    phase: 0.78,
    direction: 1,
    depthPhase: -0.5,
    trailCount: 64,
    trailSpacing: 0.04,
    electronRadius: 9.5,
    dashSpeed: 0.66,
    secondaryOffset: Math.PI * 0.92,
  },
  {
    id: 'aqua',
    color: COLORS.aqua,
    hot: COLORS.aquaHot,
    rx: 560,
    ry: 175,
    rotation: 10,
    period: 15.2,
    phase: 0.18,
    direction: 1,
    depthPhase: 0.9,
    trailCount: 58,
    trailSpacing: 0.048,
    electronRadius: 10,
    dashSpeed: 0.84,
    secondaryOffset: Math.PI * 1.03,
  },
];

const orbitAngle = (spec: OrbitSpec, frame: number, fps: number, offset = 0) =>
  spec.phase +
  offset +
  spec.direction * (frame / fps) * (TAU / spec.period);

const pointOnOrbit = (spec: OrbitSpec, angle: number): OrbitPoint => {
  const localX = Math.cos(angle) * spec.rx;
  const localY = Math.sin(angle) * spec.ry;
  const rotation = (spec.rotation * Math.PI) / 180;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return {
    x: CX + localX * cos - localY * sin,
    y: CY + localX * sin + localY * cos,
    z: Math.sin(angle + spec.depthPhase),
  };
};

const isOnSide = (z: number, side: DepthSide) =>
  side === 'front' ? z >= 0 : z < 0;

const StaticBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      overflow: 'hidden',
      backgroundColor: COLORS.background,
      backgroundImage: [
        'radial-gradient(circle at 50% 50%, rgba(34,42,49,0.52) 0%, rgba(9,11,19,0.76) 36%, rgba(3,4,11,0.98) 74%)',
        'radial-gradient(circle at 18% 20%, rgba(255,80,125,0.085) 0%, rgba(255,80,125,0) 32%)',
        'radial-gradient(circle at 84% 78%, rgba(255,200,90,0.075) 0%, rgba(255,200,90,0) 30%)',
        'linear-gradient(122deg, rgba(69,232,211,0.025), rgba(22,7,15,0.08) 56%, rgba(0,0,0,0.2))',
      ].join(', '),
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.11,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)',
        mixBlendMode: 'soft-light',
      }}
    />
  </AbsoluteFill>
);

const SvgDefs: React.FC = () => (
  <defs>
    <filter id="atom-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="13" />
    </filter>
    <filter id="atom-wide-glow" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
    <filter id="atom-line-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="atom-hot-glow" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="atom-core-glass" cx="36%" cy="30%" r="72%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.38" />
      <stop offset="25%" stopColor="#FFE0E9" stopOpacity="0.19" />
      <stop offset="58%" stopColor="#45E8D3" stopOpacity="0.08" />
      <stop offset="100%" stopColor="#050610" stopOpacity="0.92" />
    </radialGradient>
    <radialGradient id="atom-core-energy" cx="45%" cy="42%" r="65%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
      <stop offset="20%" stopColor="#FFF3CD" stopOpacity="0.86" />
      <stop offset="55%" stopColor="#FF507D" stopOpacity="0.38" />
      <stop offset="100%" stopColor="#FF507D" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="atom-mark-gradient" x1="0" y1="0" x2="24" y2="24">
      <stop offset="0%" stopColor="#FFF3CD" />
      <stop offset="48%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#45E8D3" />
    </linearGradient>
  </defs>
);

const PolarGuides: React.FC = () => {
  const rings = [112, 168, 228, 302, 386, 480, 574];
  const ticks = Array.from({length: 48});

  return (
    <g aria-hidden="true">
      <circle
        cx={CX}
        cy={CY}
        r={545}
        fill="none"
        stroke={COLORS.aqua}
        strokeOpacity={0.12}
        strokeWidth={1.5}
      />
      {rings.map((radius, index) => (
        <circle
          key={radius}
          cx={CX}
          cy={CY}
          r={radius}
          fill="none"
          stroke={index % 2 === 0 ? COLORS.aqua : COLORS.guide}
          strokeOpacity={index < 3 ? 0.09 : 0.045}
          strokeWidth={index < 2 ? 1.2 : 1}
          strokeDasharray={index % 3 === 0 ? '2 9' : undefined}
        />
      ))}
      <line
        x1={110}
        y1={CY}
        x2={WIDTH - 110}
        y2={CY}
        stroke={COLORS.guide}
        strokeOpacity={0.032}
        strokeWidth={1}
      />
      <line
        x1={CX}
        y1={48}
        x2={CX}
        y2={HEIGHT - 48}
        stroke={COLORS.guide}
        strokeOpacity={0.032}
        strokeWidth={1}
      />
      {ticks.map((_, index) => {
        const angle = (index / ticks.length) * TAU;
        const inner = 510 + (index % 4 === 0 ? -8 : 0);
        const outer = inner + (index % 4 === 0 ? 18 : 9);
        return (
          <line
            key={index}
            x1={CX + Math.cos(angle) * inner}
            y1={CY + Math.sin(angle) * inner}
            x2={CX + Math.cos(angle) * outer}
            y2={CY + Math.sin(angle) * outer}
            stroke={COLORS.guide}
            strokeOpacity={index % 4 === 0 ? 0.11 : 0.045}
            strokeWidth={index % 4 === 0 ? 1.4 : 1}
          />
        );
      })}
    </g>
  );
};

const OrbitBase: React.FC<{
  spec: OrbitSpec;
  frame: number;
}> = ({spec, frame}) => {
  const transform = `rotate(${spec.rotation} ${CX} ${CY})`;
  const dashOffset = -frame * spec.dashSpeed;

  return (
    <g aria-hidden="true">
      <ellipse
        cx={CX}
        cy={CY}
        rx={spec.rx}
        ry={spec.ry}
        transform={transform}
        fill="none"
        stroke={spec.color}
        strokeOpacity={0.055}
        strokeWidth={1.2}
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx={spec.rx}
        ry={spec.ry}
        transform={transform}
        fill="none"
        stroke={spec.color}
        strokeOpacity={0.36}
        strokeWidth={2.75}
        strokeDasharray={spec.id === 'gold' ? '3 17 1 24' : spec.id === 'coral' ? '2 20 7 28' : '10 18 2 15'}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx={spec.rx}
        ry={spec.ry}
        transform={transform}
        fill="none"
        stroke={spec.color}
        strokeOpacity={0.115}
        strokeWidth={9.5}
        strokeDasharray={spec.id === 'aqua' ? '54 210' : '38 280'}
        strokeDashoffset={dashOffset * 0.72}
        strokeLinecap="round"
        filter="url(#atom-soft-glow)"
      />
    </g>
  );
};

const MovingElectron: React.FC<{
  spec: OrbitSpec;
  frame: number;
  fps: number;
  side: DepthSide;
  offset?: number;
  size?: number;
  trailScale?: number;
  soft?: boolean;
}> = ({
  spec,
  frame,
  fps,
  side,
  offset = 0,
  size = 1,
  trailScale = 1,
  soft = false,
}) => {
  const headAngle = orbitAngle(spec, frame, fps, offset);
  const trailCount = Math.max(10, Math.round(spec.trailCount * trailScale));
  const trail = Array.from({length: trailCount});
  const head = pointOnOrbit(spec, headAngle);
  const headFrontness = clamp((head.z + 1) / 2);
  const headDepthScale = 0.72 + headFrontness * 0.46;
  const headRadius = spec.electronRadius * size * headDepthScale;

  return (
    <g aria-hidden="true">
      {trail.map((_, index) => {
        const progress = index / Math.max(1, trailCount - 1);
        const angle =
          headAngle -
          spec.direction * index * spec.trailSpacing * (0.92 + trailScale * 0.08);
        const point = pointOnOrbit(spec, angle);
        if (!isOnSide(point.z, side)) {
          return null;
        }

        const nextAngle =
          headAngle -
          spec.direction *
            (index + 1) *
            spec.trailSpacing *
            (0.92 + trailScale * 0.08);
        const nextPoint = pointOnOrbit(spec, nextAngle);

        const frontness = clamp((point.z + 1) / 2);
        const falloff = Math.pow(1 - progress, 1.55);
        const rhythm = 0.62 + 0.38 * Math.sin(index * 2.14 + spec.phase * 8) ** 2;
        const radius =
          spec.electronRadius *
          size *
          (0.12 + falloff * 0.42) *
          (0.68 + frontness * 0.35) *
          rhythm;
        const opacity =
          falloff *
          (0.16 + frontness * 0.78) *
          (index % 7 === 0 ? 1 : 0.76);

        const segmentVisible =
          index < trailCount - 1 &&
          isOnSide(nextPoint.z, side) &&
          index % 10 !== 7 &&
          index % 10 !== 8;
        const segmentWidth = Math.max(
          1,
          spec.electronRadius *
            size *
            (0.16 + falloff * 0.58) *
            (0.7 + frontness * 0.4),
        );

        return (
          <g key={index}>
            {segmentVisible ? (
              <line
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                stroke={index < 5 ? spec.hot : spec.color}
                strokeOpacity={opacity * 0.96}
                strokeWidth={segmentWidth * 1.12}
                strokeLinecap="round"
                filter={index < 18 ? 'url(#atom-line-glow)' : undefined}
              />
            ) : null}
            {index % 3 !== 1 || index < 8 ? (
              <circle
                cx={point.x}
                cy={point.y}
                r={Math.max(0.55, radius * 0.78)}
                fill={index < 4 ? spec.hot : spec.color}
                fillOpacity={opacity}
                filter={index < 10 ? 'url(#atom-line-glow)' : undefined}
              />
            ) : null}
          </g>
        );
      })}

      {isOnSide(head.z, side) ? (
        <g>
          <circle
            cx={head.x}
            cy={head.y}
            r={headRadius * (soft ? 5.6 : 4.2)}
            fill={spec.color}
            fillOpacity={soft ? 0.17 : 0.12 + headFrontness * 0.08}
            filter="url(#atom-wide-glow)"
          />
          <circle
            cx={head.x}
            cy={head.y}
            r={headRadius * (soft ? 2.35 : 1.65)}
            fill={spec.color}
            fillOpacity={soft ? 0.2 : 0.88}
            filter={soft ? 'url(#atom-wide-glow)' : 'url(#atom-hot-glow)'}
          />
          {!soft ? (
            <>
              <circle
                cx={head.x}
                cy={head.y}
                r={headRadius}
                fill={spec.hot}
                fillOpacity={0.96}
                filter="url(#atom-line-glow)"
              />
              <circle
                cx={head.x - headRadius * 0.18}
                cy={head.y - headRadius * 0.2}
                r={headRadius * 0.43}
                fill={COLORS.white}
                fillOpacity={0.98}
              />
            </>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

const OrbitMotion: React.FC<{
  spec: OrbitSpec;
  frame: number;
  fps: number;
  side: DepthSide;
}> = ({spec, frame, fps, side}) => (
  <g>
    <MovingElectron spec={spec} frame={frame} fps={fps} side={side} />
    <MovingElectron
      spec={spec}
      frame={frame}
      fps={fps}
      side={side}
      offset={spec.secondaryOffset}
      size={0.46}
      trailScale={0.34}
    />
    {spec.id === 'aqua' ? (
      <MovingElectron
        spec={spec}
        frame={frame}
        fps={fps}
        side={side}
        offset={Math.PI * 1.58}
        size={1.62}
        trailScale={0.22}
        soft
      />
    ) : null}
  </g>
);

type MoteSpec = {
  color: string;
  radius: number;
  rx: number;
  ry: number;
  rotation: number;
  period: number;
  phase: number;
  blur: boolean;
};

const MOTE_SPECS: MoteSpec[] = Array.from({length: 16}, (_, index) => {
  const palette = [COLORS.gold, COLORS.coral, COLORS.aqua];
  const large = index < 3;
  return {
    color: palette[index % palette.length],
    radius: large ? 21 + seeded(index, 3) * 18 : 2 + seeded(index, 4) * 4,
    rx: 310 + seeded(index, 5) * 390,
    ry: 160 + seeded(index, 6) * 250,
    rotation: -78 + seeded(index, 7) * 156,
    period: 18 + seeded(index, 8) * 25,
    phase: seeded(index, 9) * TAU,
    blur: large,
  };
});

const pointOnMoteOrbit = (mote: MoteSpec, angle: number): OrbitPoint => {
  const localX = Math.cos(angle) * mote.rx;
  const localY = Math.sin(angle) * mote.ry;
  const rotation = (mote.rotation * Math.PI) / 180;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    x: CX + localX * cos - localY * sin,
    y: CY + localX * sin + localY * cos,
    z: Math.sin(angle + mote.phase * 0.17),
  };
};

const AtomMotes: React.FC<{
  frame: number;
  fps: number;
  side: DepthSide;
}> = ({frame, fps, side}) => (
  <g aria-hidden="true">
    {MOTE_SPECS.map((mote, index) => {
      const angle = mote.phase + (frame / fps) * (TAU / mote.period);
      const point = pointOnMoteOrbit(mote, angle);
      if (!isOnSide(point.z, side)) {
        return null;
      }
      const frontness = clamp((point.z + 1) / 2);
      const size = mote.radius * (0.65 + frontness * 0.85);
      const opacity = mote.blur
        ? 0.07 + frontness * 0.16
        : 0.18 + frontness * 0.48;
      return (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={size}
          fill={mote.color}
          fillOpacity={opacity}
          filter={mote.blur ? 'url(#atom-wide-glow)' : 'url(#atom-line-glow)'}
        />
      );
    })}
  </g>
);

const EnergyStreaks: React.FC<{
  frame: number;
  fps: number;
}> = ({frame, fps}) => {
  const seconds = frame / fps;
  return (
    <g aria-hidden="true">
      {Array.from({length: 38}, (_, index) => {
        const baseAngle = seeded(index, 12) * TAU;
        const angularSpeed = (seeded(index, 13) - 0.5) * 0.016;
        const angle = baseAngle + seconds * angularSpeed;
        const baseRadius = 88 + seeded(index, 14) * 360;
        const speed = 2.2 + seeded(index, 15) * 4.8;
        const radius = baseRadius + seconds * speed;
        const length = 12 + seeded(index, 16) * 48;
        const palette = [COLORS.gold, COLORS.coral, COLORS.aqua];
        const color = palette[index % palette.length];
        const opacity =
          (0.11 + seeded(index, 17) * 0.22) *
          (0.62 + 0.38 * Math.sin(seconds * 0.8 + index * 1.31) ** 2);
        const tangent = angle + Math.PI / 2;
        const x = CX + Math.cos(angle) * radius;
        const y = CY + Math.sin(angle) * radius * 0.72;
        return (
          <line
            key={index}
            x1={x - Math.cos(tangent) * length * 0.42}
            y1={y - Math.sin(tangent) * length * 0.42}
            x2={x + Math.cos(tangent) * length * 0.58}
            y2={y + Math.sin(tangent) * length * 0.58}
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth={0.8 + seeded(index, 18) * 1.4}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const Nucleus: React.FC<{
  frame: number;
  fps: number;
}> = ({frame, fps}) => {
  const seconds = frame / fps;
  const pulse = 1 + Math.sin(seconds * TAU / 3.6) * 0.018;
  const rotation = seconds * 7.5;
  const dashOffset = -frame * 0.32;

  return (
    <g
      transform={`translate(${CX} ${CY}) scale(${pulse}) translate(${-CX} ${-CY})`}
      aria-hidden="true"
    >
      <circle
        cx={CX}
        cy={CY}
        r={138}
        fill={COLORS.coral}
        fillOpacity={0.055}
        filter="url(#atom-wide-glow)"
      />
      <circle
        cx={CX}
        cy={CY}
        r={104}
        fill="none"
        stroke={COLORS.gold}
        strokeOpacity={0.16}
        strokeWidth={1.2}
        strokeDasharray="2 10 22 16"
        strokeDashoffset={dashOffset}
      />
      <circle
        cx={CX}
        cy={CY}
        r={87}
        fill="none"
        stroke={COLORS.aqua}
        strokeOpacity={0.24}
        strokeWidth={1.4}
        strokeDasharray="36 18 3 12"
        strokeDashoffset={-dashOffset * 1.24}
      />
      <g transform={`rotate(${rotation} ${CX} ${CY})`}>
        {Array.from({length: 12}, (_, index) => {
          const angle = (index / 12) * TAU;
          const inner = 70;
          const outer = index % 3 === 0 ? 96 : 86;
          return (
            <line
              key={index}
              x1={CX + Math.cos(angle) * inner}
              y1={CY + Math.sin(angle) * inner}
              x2={CX + Math.cos(angle) * outer}
              y2={CY + Math.sin(angle) * outer}
              stroke={index % 2 === 0 ? COLORS.gold : COLORS.aqua}
              strokeOpacity={0.32}
              strokeWidth={index % 3 === 0 ? 2 : 1.2}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle
        cx={CX}
        cy={CY}
        r={66}
        fill="url(#atom-core-glass)"
        stroke={COLORS.white}
        strokeOpacity={0.17}
        strokeWidth={1.3}
      />
      <circle
        cx={CX}
        cy={CY}
        r={48}
        fill="url(#atom-core-energy)"
        fillOpacity={0.42}
        filter="url(#atom-soft-glow)"
      />

      <svg
        x={CX - 48}
        y={CY - 48}
        width={96}
        height={96}
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#atom-mark-gradient)"
        strokeWidth={1.28}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#atom-hot-glow)"
      >
        <circle cx="12" cy="12" r="1" fill={COLORS.white} stroke="none" />
        <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" />
        <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />
      </svg>
      <circle
        cx={CX}
        cy={CY}
        r={5.4}
        fill={COLORS.white}
        filter="url(#atom-hot-glow)"
      />
    </g>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.background, overflow: 'hidden'}}>
      <StaticBackground />
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={{position: 'absolute', inset: 0}}
      >
        <SvgDefs />
        <PolarGuides />
        <EnergyStreaks frame={frame} fps={fps} />

        {ORBITS.map((spec) => (
          <OrbitBase key={spec.id} spec={spec} frame={frame} />
        ))}

        <AtomMotes frame={frame} fps={fps} side="back" />
        {ORBITS.map((spec) => (
          <OrbitMotion
            key={`back-${spec.id}`}
            spec={spec}
            frame={frame}
            fps={fps}
            side="back"
          />
        ))}

        <Nucleus frame={frame} fps={fps} />

        {ORBITS.map((spec) => (
          <OrbitMotion
            key={`front-${spec.id}`}
            spec={spec}
            frame={frame}
            fps={fps}
            side="front"
          />
        ))}
        <AtomMotes frame={frame} fps={fps} side="front" />
      </svg>
    </AbsoluteFill>
  );
};
