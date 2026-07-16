import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  bg: '#030711',
  bgDeep: '#01030a',
  panel: '#071423',
  cyan: '#37e8ff',
  blue: '#2d8cff',
  violet: '#8c7bff',
  mint: '#42f5bd',
  amber: '#ffb13b',
  coral: '#ff526c',
  white: '#f4fbff',
  muted: '#8faabd',
  line: '#17354c',
};

const FONT = 'Arial, "Helvetica Neue", sans-serif';
const MONO = '"Courier New", monospace';
const TAU = Math.PI * 2;

type Point = {x: number; y: number};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothRange = (value: number, input: [number, number]) =>
  interpolate(value, input, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

const cubicRange = (value: number, input: [number, number]) =>
  interpolate(value, input, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

const cubicPoint = (
  from: Point,
  controlA: Point,
  controlB: Point,
  to: Point,
  t: number,
): Point => {
  const a = 1 - t;
  return {
    x:
      a * a * a * from.x +
      3 * a * a * t * controlA.x +
      3 * a * t * t * controlB.x +
      t * t * t * to.x,
    y:
      a * a * a * from.y +
      3 * a * a * t * controlA.y +
      3 * a * t * t * controlB.y +
      t * t * t * to.y,
  };
};

const LEFT_ROUTE = {
  from: {x: 490, y: 590},
  controlA: {x: 640, y: 385},
  controlB: {x: 790, y: 410},
  to: {x: 900, y: 520},
};

const RIGHT_ROUTE = {
  from: {x: 1020, y: 520},
  controlA: {x: 1140, y: 405},
  controlB: {x: 1310, y: 385},
  to: {x: 1445, y: 590},
};

const routePoint = (value: number): Point => {
  const t = clamp(value);
  if (t <= 0.46) {
    const local = t / 0.46;
    return cubicPoint(
      LEFT_ROUTE.from,
      LEFT_ROUTE.controlA,
      LEFT_ROUTE.controlB,
      LEFT_ROUTE.to,
      local,
    );
  }
  if (t < 0.54) {
    const local = (t - 0.46) / 0.08;
    return {
      x: lerp(900, 1020, local),
      y: 520 - Math.sin(local * Math.PI) * 10,
    };
  }
  const local = (t - 0.54) / 0.46;
  return cubicPoint(
    RIGHT_ROUTE.from,
    RIGHT_ROUTE.controlA,
    RIGHT_ROUTE.controlB,
    RIGHT_ROUTE.to,
    local,
  );
};

const routeAngle = (value: number) => {
  const before = routePoint(clamp(value - 0.002));
  const after = routePoint(clamp(value + 0.002));
  return (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
};

const hexPoints = (radius: number) =>
  Array.from({length: 6}, (_, index) => {
    const angle = -Math.PI / 2 + (index * TAU) / 6;
    return (
      (Math.cos(angle) * radius).toFixed(2) +
      ',' +
      (Math.sin(angle) * radius).toFixed(2)
    );
  }).join(' ');

const pulseAt = (frame: number, center: number, width: number) =>
  Math.exp(-Math.pow((frame - center) / width, 2));

const STARS = Array.from({length: 92}, (_, index) => ({
  x: Math.round(random('m23-star-x-' + index) * 1920),
  y: Math.round(random('m23-star-y-' + index) * 900),
  size: 0.7 + random('m23-star-s-' + index) * 1.8,
  opacity: 0.15 + random('m23-star-o-' + index) * 0.45,
  phase: random('m23-star-p-' + index) * TAU,
}));

const TRANSFERS = [
  {start: 160, duration: 245, accent: C.cyan, priority: false},
  {start: 220, duration: 238, accent: C.violet, priority: false},
  {start: 282, duration: 232, accent: C.cyan, priority: false},
  {start: 432, duration: 225, accent: C.amber, priority: true},
  {start: 500, duration: 218, accent: C.cyan, priority: false},
  {start: 566, duration: 214, accent: C.violet, priority: false},
];

const DataCard: React.FC<{
  x: number;
  y: number;
  scale: number;
  angle: number;
  opacity: number;
  accent: string;
  index: number;
  priority?: boolean;
}> = ({x, y, scale, angle, opacity, accent, index, priority = false}) => {
  return (
    <g
      opacity={opacity}
      transform={
        'translate(' +
        x +
        ' ' +
        y +
        ') rotate(' +
        angle +
        ') scale(' +
        scale +
        ')'
      }
      filter="url(#m23-card-shadow)"
    >
      <rect
        x={-43}
        y={-57}
        width={86}
        height={114}
        rx={9}
        fill="url(#m23-card-fill)"
        stroke={accent}
        strokeOpacity={0.75}
        strokeWidth={1.5}
      />
      <path
        d="M20 -57 L43 -34 L20 -34 Z"
        fill={accent}
        opacity={0.28}
      />
      <path
        d="M20 -57 L20 -34 L43 -34"
        fill="none"
        stroke={accent}
        strokeOpacity={0.75}
        strokeWidth={1.3}
      />
      <rect x={-28} y={-35} width={31} height={5} rx={2.5} fill={accent} />
      <rect
        x={-28}
        y={-19}
        width={54}
        height={3}
        rx={1.5}
        fill={C.muted}
        opacity={0.64}
      />
      <rect
        x={-28}
        y={-8}
        width={45}
        height={3}
        rx={1.5}
        fill={C.muted}
        opacity={0.42}
      />
      <rect
        x={-28}
        y={3}
        width={58}
        height={3}
        rx={1.5}
        fill={C.muted}
        opacity={0.48}
      />
      <rect
        x={-28}
        y={19}
        width={23}
        height={19}
        rx={3}
        fill={accent}
        opacity={0.15}
        stroke={accent}
        strokeOpacity={0.5}
      />
      <path
        d="M-22 28 L-17 33 L-9 23"
        fill="none"
        stroke={accent}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={30}
        y={38}
        textAnchor="end"
        fill={C.white}
        opacity={0.8}
        fontFamily={MONO}
        fontSize={11}
        fontWeight={700}
      >
        {priority ? 'P-01' : 'D-' + String(index + 1).padStart(2, '0')}
      </text>
    </g>
  );
};

const Vault: React.FC<{
  x: number;
  y: number;
  accent: string;
  side: 'SOURCE' | 'DESTINATION';
  presence: number;
  verified: number;
  frame: number;
}> = ({
  x,
  y,
  accent,
  side,
  presence,
  verified,
  frame,
}) => {
  const direction = side === 'SOURCE' ? -1 : 1;
  const bob = Math.sin((frame / 180) * TAU + direction * 0.6) * 4;
  const scale = 0.88 + presence * 0.12;
  const label = side === 'SOURCE' ? 'SOURCE VAULT' : 'DESTINATION VAULT';
  const leaveProgress = TRANSFERS.map((transfer) =>
    smoothRange(frame, [transfer.start - 28, transfer.start]),
  );
  const receiveProgress = TRANSFERS.map((transfer) =>
    smoothRange(frame, [
      transfer.start + transfer.duration,
      transfer.start + transfer.duration + 28,
    ]),
  );
  const departedCount = leaveProgress.reduce((sum, value) => sum + value, 0);
  const receivedCount = receiveProgress.reduce((sum, value) => sum + value, 0);
  const sourceCount = TRANSFERS.filter((transfer) => frame < transfer.start).length;
  const destinationCount = TRANSFERS.filter(
    (transfer) => frame >= transfer.start + transfer.duration,
  ).length;
  const inventoryCount = side === 'SOURCE' ? sourceCount : destinationCount;
  const inventoryStatus =
    inventoryCount +
    ' FILE' +
    (inventoryCount === 1 ? '' : 'S') +
    (side === 'SOURCE' ? ' QUEUED' : ' RECEIVED');
  const inventoryCards = TRANSFERS.map((transfer, index) => {
    const leaving = leaveProgress[index];
    const receiving = receiveProgress[index];
    const sourceStackCount = Math.max(1, TRANSFERS.length - departedCount);
    const sourceRank = TRANSFERS.length - 1 - index;
    const sourceX = (sourceRank - (sourceStackCount - 1) / 2) * 32;
    const destinationStackCount = Math.max(1, receivedCount);
    const destinationRank = index;
    const destinationX =
      (destinationRank - (destinationStackCount - 1) / 2) * 32;
    const sourceArc = Math.min(1, Math.abs(sourceX) / 100);
    const destinationArc = Math.min(1, Math.abs(destinationX) / 100);
    const sourceY = -92 - (1 - sourceArc) * 27;
    const destinationY = -92 - (1 - destinationArc) * 27;
    const cardX =
      side === 'SOURCE'
        ? lerp(sourceX, 118, leaving)
        : lerp(-118, destinationX, receiving);
    const cardY =
      side === 'SOURCE'
        ? lerp(sourceY, -5, leaving)
        : lerp(-5, destinationY, receiving);
    const cardScale =
      side === 'SOURCE'
        ? lerp(0.58, 0.44, leaving)
        : lerp(0.44, 0.58, receiving);
    const cardAngle =
      side === 'SOURCE'
        ? lerp(sourceX / 7.5, 0, leaving)
        : lerp(0, -destinationX / 7.5, receiving);
    const cardOpacity =
      side === 'SOURCE'
        ? 1 - smoothRange(leaving, [0.66, 1])
        : smoothRange(receiving, [0, 0.36]);

    return (
      <DataCard
        key={side + '-inventory-' + index}
        x={cardX}
        y={cardY}
        scale={cardScale}
        angle={cardAngle}
        opacity={cardOpacity}
        accent={transfer.accent}
        index={index}
        priority={transfer.priority}
      />
    );
  });
  const orderedInventoryCards =
    side === 'SOURCE' ? [...inventoryCards].reverse() : inventoryCards;

  return (
    <g
      opacity={presence}
      transform={
        'translate(' +
        x +
        ' ' +
        (y + bob + (1 - presence) * 34) +
        ') scale(' +
        scale +
        ')'
      }
    >
      <ellipse
        cx={0}
        cy={105}
        rx={205}
        ry={42}
        fill={accent}
        opacity={0.1 + verified * 0.12}
        filter="url(#m23-soft-glow)"
      />
      <ellipse
        cx={0}
        cy={98}
        rx={168}
        ry={28}
        fill="#00030a"
        opacity={0.75}
      />

      <path
        d="M-154 -40 L-61 -40 L-29 -12 L148 -12 L164 77 L-154 77 Z"
        fill="url(#m23-vault-back)"
        stroke={accent}
        strokeOpacity={0.5}
        strokeWidth={1.5}
      />
      <path
        d="M-140 -27 L-54 -27 L-24 -1 L145 -1"
        fill="none"
        stroke={accent}
        strokeOpacity={0.35}
        strokeWidth={2}
      />

      {orderedInventoryCards}

      <path
        d="M-176 -3 L166 -3 L139 99 L-147 99 Z"
        fill={side === 'SOURCE' ? 'url(#m23-source-front)' : 'url(#m23-dest-front)'}
        stroke={accent}
        strokeOpacity={0.8}
        strokeWidth={1.8}
      />
      <path
        d="M-165 9 L154 9"
        stroke={C.white}
        strokeOpacity={0.22}
        strokeWidth={1}
      />
      <path
        d="M-138 72 L128 72"
        stroke={accent}
        strokeOpacity={0.28}
        strokeWidth={1}
      />
      <rect
        x={-61}
        y={33}
        width={122}
        height={28}
        rx={14}
        fill="#03101a"
        stroke={accent}
        strokeOpacity={0.55}
      />
      <circle cx={-43} cy={47} r={4} fill={accent} filter="url(#m23-hard-glow)" />
      <text
        x={-31}
        y={52}
        fill={C.white}
        fontFamily={MONO}
        fontSize={12}
        fontWeight={700}
      >
        {String(inventoryCount).padStart(2, '0') +
          (side === 'SOURCE' ? ' READY' : ' SYNCED')}
      </text>

      {side === 'DESTINATION' && (
        <g opacity={verified}>
          <circle
            cx={0}
            cy={25}
            r={104 + verified * 18}
            fill="none"
            stroke={C.mint}
            strokeWidth={2}
            strokeOpacity={0.45 * (1 - verified * 0.35)}
          />
          <circle
            cx={0}
            cy={25}
            r={132 + verified * 20}
            fill="none"
            stroke={C.mint}
            strokeWidth={1}
            strokeOpacity={0.2 * (1 - verified * 0.5)}
            strokeDasharray="4 10"
          />
        </g>
      )}

      <text
        x={0}
        y={147}
        textAnchor="middle"
        fill={C.white}
        fontFamily={FONT}
        fontSize={21}
        fontWeight={800}
        letterSpacing={2.2}
      >
        {label}
      </text>
      <text
        x={0}
        y={175}
        textAnchor="middle"
        fill={verified > 0.45 && side === 'DESTINATION' ? C.mint : C.muted}
        fontFamily={MONO}
        fontSize={13}
        fontWeight={700}
        letterSpacing={1.2}
      >
        {inventoryStatus}
      </text>
    </g>
  );
};

const TransferItem: React.FC<{
  frame: number;
  start: number;
  duration: number;
  accent: string;
  index: number;
  priority: boolean;
  sceneOpacity: number;
}> = ({
  frame,
  start,
  duration,
  accent,
  index,
  priority,
  sceneOpacity,
}) => {
  const active =
    smoothRange(frame, [start, start + 20]) *
    (1 - smoothRange(frame, [start + duration - 24, start + duration]));
  const t = cubicRange(frame, [start, start + duration]);
  const point = routePoint(t);
  const angle = routeAngle(t);
  const beforeCard = 1 - smoothRange(t, [0.36, 0.47]);
  const afterCard = smoothRange(t, [0.63, 0.76]);
  const packetMode =
    smoothRange(t, [0.31, 0.45]) * (1 - smoothRange(t, [0.69, 0.83]));
  const scale = priority ? 1.02 : 0.82;

  return (
    <g opacity={sceneOpacity}>
      <DataCard
        x={point.x}
        y={point.y}
        scale={scale * (0.9 + Math.sin(t * Math.PI) * 0.1)}
        angle={angle}
        opacity={active * beforeCard}
        accent={accent}
        index={index}
        priority={priority}
      />

      {Array.from({length: priority ? 16 : 11}, (_, packetIndex) => {
        const lag = packetIndex * (priority ? 0.007 : 0.009);
        const packetT = clamp(t - lag);
        const packetPoint = routePoint(packetT);
        const packetAngle = routeAngle(packetT);
        const spread =
          (random('m23-packet-y-' + index + '-' + packetIndex) - 0.5) *
          (priority ? 48 : 34) *
          Math.sin(clamp(packetT * 1.6) * Math.PI);
        const size =
          4.5 +
          random('m23-packet-s-' + index + '-' + packetIndex) *
            (priority ? 7 : 5);
        const opacity =
          active *
          packetMode *
          (0.45 +
            random('m23-packet-o-' + index + '-' + packetIndex) * 0.5);
        return (
          <rect
            key={'packet-' + packetIndex}
            x={packetPoint.x - size / 2}
            y={packetPoint.y + spread - size / 2}
            width={size * 1.5}
            height={size}
            rx={1.5}
            fill={packetIndex % 4 === 0 ? C.white : accent}
            opacity={opacity}
            transform={
              'rotate(' +
              packetAngle +
              ' ' +
              packetPoint.x +
              ' ' +
              (packetPoint.y + spread) +
              ')'
            }
            filter={packetIndex % 3 === 0 ? 'url(#m23-hard-glow)' : undefined}
          />
        );
      })}

      <DataCard
        x={point.x}
        y={point.y}
        scale={scale * (0.88 + afterCard * 0.12)}
        angle={angle}
        opacity={active * afterCard}
        accent={priority ? C.mint : accent}
        index={index}
        priority={priority}
      />
    </g>
  );
};

const EncryptionGate: React.FC<{
  frame: number;
  presence: number;
  activity: number;
  verified: number;
}> = ({frame, presence, activity, verified}) => {
  const spin = (frame / 900) * 360;
  const pulse = 1 + activity * 0.055;
  const accent = verified > 0.35 ? C.mint : C.violet;
  return (
    <g
      opacity={presence}
      transform={'translate(960 520) scale(' + pulse + ')'}
    >
      <circle
        r={137}
        fill={C.cyan}
        opacity={0.03 + activity * 0.07}
        filter="url(#m23-soft-glow)"
      />
      <g transform={'rotate(' + spin + ')'}>
        <circle
          r={126}
          fill="none"
          stroke={C.cyan}
          strokeOpacity={0.28}
          strokeWidth={1.4}
          strokeDasharray="3 12"
        />
        <circle cx={0} cy={-126} r={5} fill={C.cyan} filter="url(#m23-hard-glow)" />
        <circle cx={109} cy={63} r={4} fill={C.violet} />
        <circle cx={-109} cy={63} r={4} fill={C.violet} />
      </g>
      <g transform={'rotate(' + -spin * 0.66 + ')'}>
        <polygon
          points={hexPoints(101)}
          fill="none"
          stroke={accent}
          strokeWidth={2}
          strokeOpacity={0.55}
          strokeDasharray="22 8"
          filter="url(#m23-hard-glow)"
        />
      </g>
      <polygon
        points={hexPoints(76)}
        fill="url(#m23-gate-fill)"
        stroke={accent}
        strokeWidth={2}
        strokeOpacity={0.86}
      />
      <polygon
        points={hexPoints(59)}
        fill="#061527"
        stroke={C.cyan}
        strokeWidth={1}
        strokeOpacity={0.35}
      />
      <path
        d="M0 -32 L29 -20 L25 17 C21 37 8 49 0 54 C-8 49 -21 37 -25 17 L-29 -20 Z"
        fill={accent}
        fillOpacity={0.12}
        stroke={accent}
        strokeWidth={2}
      />
      {verified > 0.35 ? (
        <path
          d="M-15 7 L-3 19 L19 -8"
          fill="none"
          stroke={C.mint}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#m23-hard-glow)"
        />
      ) : (
        <g>
          <rect
            x={-17}
            y={0}
            width={34}
            height={27}
            rx={6}
            fill={C.cyan}
            fillOpacity={0.16}
            stroke={C.cyan}
            strokeWidth={2}
          />
          <path
            d="M-10 0 V-9 C-10 -23 10 -23 10 -9 V0"
            fill="none"
            stroke={C.cyan}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={0} cy={13} r={3.5} fill={C.white} />
        </g>
      )}
      <line
        x1={-58}
        y1={-44 + ((frame * 3) % 88)}
        x2={58}
        y2={-44 + ((frame * 3) % 88)}
        stroke={accent}
        strokeOpacity={0.28 + activity * 0.28}
        strokeWidth={2}
        filter="url(#m23-hard-glow)"
      />
      <text
        x={0}
        y={154}
        textAnchor="middle"
        fill={C.white}
        fontFamily={FONT}
        fontSize={18}
        fontWeight={800}
        letterSpacing={2.1}
      >
        {verified > 0.45 ? 'RELAY VERIFIED' : 'ENCRYPTION GATE'}
      </text>
      <text
        x={0}
        y={179}
        textAnchor="middle"
        fill={verified > 0.45 ? C.mint : C.muted}
        fontFamily={MONO}
        fontSize={12}
        fontWeight={700}
        letterSpacing={1.2}
      >
        {verified > 0.45 ? 'CHECKSUM MATCH' : 'ZERO-TRUST CHECKPOINT'}
      </text>
    </g>
  );
};

const ThreatRejection: React.FC<{
  frame: number;
  opacity: number;
}> = ({frame, opacity}) => {
  const centerPulse = pulseAt(frame, 488, 27);
  return (
    <g opacity={opacity}>
      {Array.from({length: 9}, (_, index) => {
        const start = 392 + index * 9;
        const t = cubicRange(frame, [start, start + 112]);
        const angle = -2.75 + index * 0.69;
        const approach = t < 0.68 ? t / 0.68 : 1;
        const reject = t > 0.68 ? (t - 0.68) / 0.32 : 0;
        const distance = lerp(265, 104, approach) + reject * 74;
        const x = 960 + Math.cos(angle) * distance;
        const y = 520 + Math.sin(angle) * distance * 0.64;
        const localOpacity =
          smoothRange(frame, [start, start + 12]) *
          (1 - smoothRange(frame, [start + 88, start + 112]));
        return (
          <g key={'threat-' + index} opacity={localOpacity}>
            <circle
              cx={x}
              cy={y}
              r={index % 3 === 0 ? 5 : 3.5}
              fill={C.coral}
              filter="url(#m23-coral-glow)"
            />
            <line
              x1={x - Math.cos(angle) * 24}
              y1={y - Math.sin(angle) * 15}
              x2={x}
              y2={y}
              stroke={C.coral}
              strokeWidth={1.2}
              strokeOpacity={0.5}
            />
          </g>
        );
      })}
      <circle
        cx={960}
        cy={520}
        r={104 + centerPulse * 45}
        fill="none"
        stroke={C.coral}
        strokeWidth={2.5}
        strokeOpacity={centerPulse * 0.78}
        filter="url(#m23-coral-glow)"
      />
      <g opacity={centerPulse}>
        <circle cx={1083} cy={438} r={18} fill="#250a18" stroke={C.coral} />
        <path
          d="M1076 431 L1090 445 M1090 431 L1076 445"
          stroke={C.coral}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <text
          x={1110}
          y={444}
          fill={C.coral}
          fontFamily={MONO}
          fontSize={13}
          fontWeight={800}
          letterSpacing={1}
        >
          ACCESS BLOCKED
        </text>
      </g>
    </g>
  );
};

const ProcessFooter: React.FC<{
  frame: number;
  opacity: number;
  progress: number;
  verified: number;
}> = ({frame, opacity, progress, verified}) => {
  const active =
    frame < 210 ? 0 : frame < 390 ? 1 : frame < 808 ? 2 : 3;
  const stages = ['CONNECT', 'ENCRYPT', 'TRANSFER', 'VERIFY'];
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        bottom: 40,
        height: 94,
        opacity,
        borderTop: '1px solid rgba(93,155,190,0.25)',
        fontFamily: FONT,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{width: 330}}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: 1.7,
          }}
        >
          RELAY SESSION
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 17,
            fontWeight: 800,
            color: verified > 0.5 ? C.mint : C.white,
            letterSpacing: 1.2,
          }}
        >
          {verified > 0.5 ? 'TRANSFER VERIFIED' : 'SECURE LINK ACTIVE'}
        </div>
      </div>

      <div style={{flex: 1, padding: '0 44px'}}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: 'rgba(95,151,184,0.16)',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(93,155,190,0.12)',
          }}
        >
          <div
            style={{
              width: progress * 100 + '%',
              height: '100%',
              borderRadius: 2,
              background:
                verified > 0.45
                  ? 'linear-gradient(90deg,' + C.cyan + ',' + C.mint + ')'
                  : 'linear-gradient(90deg,' +
                    C.amber +
                    ',' +
                    C.coral +
                    ',' +
                    C.violet +
                    ',' +
                    C.cyan +
                    ')',
              boxShadow: '0 0 16px rgba(55,232,255,0.75)',
            }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            marginTop: 13,
            gap: 18,
          }}
        >
          {stages.map((stage, index) => (
            <div
              key={stage}
              style={{
                color:
                  index < active
                    ? C.mint
                    : index === active
                      ? C.white
                      : C.muted,
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.35,
                textAlign: index === 0 ? 'left' : index === 3 ? 'right' : 'center',
                opacity: index > active ? 0.48 : 1,
              }}
            >
              <span style={{color: index <= active ? C.cyan : C.line}}>
                {index < active || (index === 3 && verified > 0.5) ? '● ' : '○ '}
              </span>
              {stage}
            </div>
          ))}
        </div>
      </div>

      <div style={{width: 330, textAlign: 'right'}}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            color: C.muted,
            letterSpacing: 1.7,
          }}
        >
          PAYLOAD INTEGRITY
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: MONO,
            fontSize: 18,
            fontWeight: 800,
            color: verified > 0.5 ? C.mint : C.cyan,
            letterSpacing: 1.1,
          }}
        >
          {verified > 0.5
            ? 'CHECKSUM MATCH'
            : String(Math.round(progress * 100)).padStart(2, '0') + '% VERIFIED'}
        </div>
      </div>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const sceneEnter = smoothRange(frame, [0, 42]);
  const sceneOpacity = sceneEnter;
  const headerOpacity = smoothRange(frame, [18, 68]);
  const vaultPresence = smoothRange(frame, [42, 112]);
  const gatePresence = smoothRange(frame, [82, 142]);
  const verified = smoothRange(frame, [808, 838]);
  const threatOpacity =
    smoothRange(frame, [372, 410]) *
    (1 - smoothRange(frame, [540, 584])) *
    sceneOpacity;
  const progress = cubicRange(frame, [94, 808]);
  const gateActivity = clamp(
    TRANSFERS.reduce(
      (sum, transfer) =>
        sum +
        pulseAt(
          frame,
          transfer.start + transfer.duration * 0.5,
          transfer.priority ? 31 : 24,
        ),
      0,
    ) +
      pulseAt(frame, 488, 34) * 0.8,
  );
  const cameraPush =
    smoothRange(frame, [402, 520]) *
    (1 - smoothRange(frame, [720, 816]));
  const cameraScale = 1 + cameraPush * 0.032;
  const trackDashOffset = -(frame / durationInFrames) * 96;
  const verificationRing = smoothRange(frame, [808, 850]) * (1 - verified * 0.18);

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        color: C.white,
        overflow: 'hidden',
        fontFamily: FONT,
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <linearGradient id="m23-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#020610" />
            <stop offset="0.48" stopColor="#071326" />
            <stop offset="1" stopColor="#02040b" />
          </linearGradient>
          <radialGradient id="m23-halo" cx="50%" cy="46%" r="56%">
            <stop offset="0" stopColor="#113f66" stopOpacity="0.52" />
            <stop offset="0.44" stopColor="#09213c" stopOpacity="0.31" />
            <stop offset="1" stopColor="#02040b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="m23-card-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4fbff" stopOpacity="0.98" />
            <stop offset="0.52" stopColor="#b7d6e7" stopOpacity="0.95" />
            <stop offset="1" stopColor="#6a91ab" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="m23-vault-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#112a3d" stopOpacity="0.96" />
            <stop offset="1" stopColor="#06101c" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="m23-source-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6e3c09" />
            <stop offset="0.45" stopColor="#b96d14" />
            <stop offset="1" stopColor="#3e2107" />
          </linearGradient>
          <linearGradient id="m23-dest-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#07516b" />
            <stop offset="0.48" stopColor="#087f95" />
            <stop offset="1" stopColor="#042938" />
          </linearGradient>
          <radialGradient id="m23-gate-fill" cx="50%" cy="44%" r="70%">
            <stop offset="0" stopColor="#183155" />
            <stop offset="0.55" stopColor="#0d1630" />
            <stop offset="1" stopColor="#050917" />
          </radialGradient>
          <linearGradient id="m23-track-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.amber} />
            <stop offset="0.48" stopColor={C.violet} />
            <stop offset="0.52" stopColor={C.violet} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
          <filter id="m23-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
          <filter id="m23-hard-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="m23-coral-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feFlood floodColor={C.coral} floodOpacity="0.8" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="m23-card-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000" floodOpacity="0.62" />
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={C.cyan} floodOpacity="0.16" />
          </filter>
          <pattern id="m23-noise" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="2" r="0.45" fill="#8fdcff" opacity="0.12" />
            <circle cx="5" cy="6" r="0.35" fill="#ffffff" opacity="0.07" />
          </pattern>
        </defs>

        <rect width={1920} height={1080} fill="url(#m23-bg)" />
        <rect width={1920} height={1080} fill="url(#m23-halo)" />
        <ellipse
          cx={960}
          cy={535}
          rx={720}
          ry={380}
          fill={C.cyan}
          opacity={0.035 * sceneOpacity}
          filter="url(#m23-soft-glow)"
        />
        <ellipse
          cx={960}
          cy={545}
          rx={390}
          ry={300}
          fill={C.violet}
          opacity={(0.028 + gateActivity * 0.025) * sceneOpacity}
          filter="url(#m23-soft-glow)"
        />

        <g opacity={sceneOpacity}>
          {STARS.map((star, index) => (
            <circle
              key={'star-' + index}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill={index % 7 === 0 ? C.violet : C.cyan}
              opacity={
                star.opacity *
                (0.62 + Math.sin((frame / 150) * TAU + star.phase) * 0.25)
              }
            />
          ))}
        </g>

        <g
          opacity={0.22 * sceneOpacity}
          stroke={C.cyan}
          strokeWidth={1}
        >
          {Array.from({length: 15}, (_, index) => {
            const bottomX = 80 + index * 126;
            const topX = 610 + index * 50;
            return (
              <line
                key={'grid-v-' + index}
                x1={bottomX}
                y1={932}
                x2={topX}
                y2={618}
                strokeOpacity={0.08 + index % 3 * 0.03}
              />
            );
          })}
          {Array.from({length: 7}, (_, index) => {
            const y = 650 + index * 43;
            return (
              <line
                key={'grid-h-' + index}
                x1={240 - index * 25}
                y1={y}
                x2={1680 + index * 25}
                y2={y}
                strokeOpacity={0.16 - index * 0.012}
              />
            );
          })}
        </g>

        <g
          transform={
            'translate(960 540) scale(' +
            cameraScale +
            ') translate(-960 -540)'
          }
        >
          <g opacity={gatePresence * sceneOpacity}>
            <path
              d="M490 590 C640 385 790 410 900 520"
              fill="none"
              stroke="#07111f"
              strokeWidth={20}
              strokeLinecap="round"
            />
            <path
              d="M1020 520 C1140 405 1310 385 1445 590"
              fill="none"
              stroke="#07111f"
              strokeWidth={20}
              strokeLinecap="round"
            />
            <path
              d="M490 590 C640 385 790 410 900 520"
              fill="none"
              stroke="url(#m23-track-gradient)"
              strokeWidth={2.4}
              strokeOpacity={0.78}
              strokeLinecap="round"
              filter="url(#m23-hard-glow)"
            />
            <path
              d="M1020 520 C1140 405 1310 385 1445 590"
              fill="none"
              stroke="url(#m23-track-gradient)"
              strokeWidth={2.4}
              strokeOpacity={0.78}
              strokeLinecap="round"
              filter="url(#m23-hard-glow)"
            />
            <path
              d="M490 590 C640 385 790 410 900 520"
              fill="none"
              stroke={C.white}
              strokeWidth={1.2}
              strokeOpacity={0.52}
              strokeDasharray="3 13"
              strokeDashoffset={trackDashOffset}
            />
            <path
              d="M1020 520 C1140 405 1310 385 1445 590"
              fill="none"
              stroke={C.white}
              strokeWidth={1.2}
              strokeOpacity={0.52}
              strokeDasharray="3 13"
              strokeDashoffset={trackDashOffset}
            />
            <path
              d="M490 610 C660 730 790 718 896 594"
              fill="none"
              stroke={C.amber}
              strokeWidth={1}
              strokeOpacity={0.2}
              strokeDasharray="4 14"
            />
            <path
              d="M1024 594 C1140 718 1310 730 1445 610"
              fill="none"
              stroke={C.cyan}
              strokeWidth={1}
              strokeOpacity={0.2}
              strokeDasharray="4 14"
            />
          </g>

          <Vault
            x={338}
            y={590}
            accent={C.amber}
            side="SOURCE"
            presence={vaultPresence * sceneOpacity}
            verified={0}
            frame={frame}
          />
          <Vault
            x={1582}
            y={590}
            accent={verified > 0.35 ? C.mint : C.cyan}
            side="DESTINATION"
            presence={vaultPresence * sceneOpacity}
            verified={verified}
            frame={frame}
          />

          {TRANSFERS.map((transfer, index) => (
            <TransferItem
              key={'transfer-' + index}
              frame={frame}
              start={transfer.start}
              duration={transfer.duration}
              accent={transfer.accent}
              index={index}
              priority={transfer.priority}
              sceneOpacity={sceneOpacity}
            />
          ))}

          <ThreatRejection frame={frame} opacity={threatOpacity} />
          <EncryptionGate
            frame={frame}
            presence={gatePresence * sceneOpacity}
            activity={gateActivity}
            verified={verified}
          />

          <g opacity={verificationRing * sceneOpacity}>
            <ellipse
              cx={1582}
              cy={613}
              rx={206 + verificationRing * 55}
              ry={92 + verificationRing * 24}
              fill="none"
              stroke={C.mint}
              strokeWidth={2}
              strokeOpacity={0.38 * (1 - verificationRing * 0.4)}
              filter="url(#m23-hard-glow)"
            />
            <ellipse
              cx={1582}
              cy={613}
              rx={244 + verificationRing * 74}
              ry={111 + verificationRing * 31}
              fill="none"
              stroke={C.mint}
              strokeWidth={1}
              strokeOpacity={0.2 * (1 - verificationRing * 0.55)}
              strokeDasharray="5 13"
            />
          </g>
        </g>

        <rect
          width={1920}
          height={1080}
          fill="url(#m23-noise)"
          opacity={0.23}
          style={{mixBlendMode: 'soft-light'}}
        />
        <rect
          x={1}
          y={1}
          width={1918}
          height={1078}
          fill="none"
          stroke={C.cyan}
          strokeOpacity={0.04}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 50,
          right: 72,
          height: 100,
          opacity: headerOpacity,
          transform: 'translateY(' + (1 - headerOpacity) * -18 + 'px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(93,155,190,0.22)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: C.cyan,
                boxShadow: '0 0 18px ' + C.cyan,
              }}
            />
            <div
              style={{
                fontSize: 36,
                lineHeight: 1,
                fontWeight: 850,
                letterSpacing: 2.4,
                color: C.white,
              }}
            >
              SECURE DATA RELAY
            </div>
          </div>
          <div
            style={{
              marginLeft: 29,
              marginTop: 12,
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: '#9bc8e3',
            }}
          >
            ENCRYPTED NODE-TO-NODE TRANSFER
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderRadius: 24,
            background: 'rgba(3,16,28,0.76)',
            border: '1px solid rgba(66,245,189,0.42)',
            boxShadow: '0 0 30px rgba(66,245,189,0.07)',
            fontFamily: MONO,
            color: verified > 0.45 ? C.mint : C.white,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1.1,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: C.mint,
              boxShadow: '0 0 12px ' + C.mint,
            }}
          />
          {verified > 0.45 ? 'TRANSFER VERIFIED' : 'ZERO-TRUST LINK'}
        </div>
      </div>

      <ProcessFooter
        frame={frame}
        opacity={smoothRange(frame, [70, 128])}
        progress={progress}
        verified={verified}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow:
            'inset 0 0 170px rgba(0,0,0,0.78), inset 0 -90px 140px rgba(0,0,0,0.42)',
        }}
      />
    </AbsoluteFill>
  );
};
