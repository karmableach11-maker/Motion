/*
 * Inline icon assets are adapted from Phosphor Icons Core 2.1.1:
 * head-circuit, gear, and share-network.
 * https://github.com/phosphor-icons/core
 *
 * MIT License
 * Copyright (c) 2023 Phosphor Icons
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BLACK = '#010405';
const DEEP_BLACK = '#000101';
const CYAN = '#18f3df';
const CYAN_BRIGHT = '#72fff4';
const ACID = '#79ff16';
const SIGNAL_RED = '#f3092b';
const MAGENTA = '#ff1d75';
const BLUE = '#18a8ff';
const PAPER = '#d8dfde';

const HEAD_FILL_PATH =
  'M120,72a8,8,0,1,1,8,8A8,8,0,0,1,120,72Zm24,64a8,8,0,1,0,8-8A8,8,0,0,0,144,136Zm48.5,35.47A88.32,88.32,0,0,0,224,101.89q0-1.1-.09-2.19a4,4,0,0,0-4-3.75H195.75L172.62,123.7a24,24,0,1,1-12.28-10.25l25.51-30.62A8,8,0,0,1,192,80h23.14a4,4,0,0,0,3.77-5.35C207.27,42,176.86,18,140.74,16.08l-.59,0a4,4,0,0,0-4.15,4V49.33a24,24,0,1,1-16,0v-27a4,4,0,0,0-4.89-3.91A88.16,88.16,0,0,0,48,102L25.55,145.14l-.22.45a16,16,0,0,0,7.51,20.7l.25.12L56,176.9v31a16,16,0,0,0,16,16h40v8a8,8,0,0,0,8,8h71.77a8.42,8.42,0,0,0,4.06-1,8,8,0,0,0,4.11-8Z';

const HEAD_REGULAR_PATH =
  'M192.5,171.47A88.34,88.34,0,0,0,224,101.93c-1-45.71-37.61-83.4-83.24-85.8A88,88,0,0,0,48,102L25.55,145.18c-.09.18-.18.36-.26.54a16,16,0,0,0,7.55,20.62l.25.11L56,176.94V208a16,16,0,0,0,16,16h48a8,8,0,0,0,0-16H72V171.81a8,8,0,0,0-4.67-7.28L40,152l23.07-44.34A7.9,7.9,0,0,0,64,104a72,72,0,0,1,56-70.21V49.38a24,24,0,1,0,16,0V32c1.3,0,2.6,0,3.9.1A72.26,72.26,0,0,1,203.84,80H184a8,8,0,0,0-6.15,2.88L152.34,113.5a24.06,24.06,0,1,0,12.28,10.25L187.75,96h19.79q.36,3.12.44,6.3a72.26,72.26,0,0,1-28.78,59.3,8,8,0,0,0-3.14,7.39l8,64a8,8,0,0,0,7.93,7,8.39,8.39,0,0,0,1-.06,8,8,0,0,0,6.95-8.93ZM128,80a8,8,0,1,1,8-8A8,8,0,0,1,128,80Zm16,64a8,8,0,1,1,8-8A8,8,0,0,1,144,144Z';

const GEAR_FILL_PATH =
  'M216,130.16q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z';

const SHARE_NETWORK_PATH =
  'M212,200a36,36,0,1,1-69.85-12.25l-53-34.05a36,36,0,1,1,0-51.4l53-34a36.09,36.09,0,1,1,8.67,13.45l-53,34.05a36,36,0,0,1,0,24.5l53,34.05A36,36,0,0,1,212,200Z';

const PROFILE_SILHOUETTE_PATH =
  'M184 458V386C154 346 140 295 145 235C154 137 227 65 320 55C407 46 476 100 490 178C496 211 489 238 477 259L519 301C532 315 526 336 509 343L481 354V390C481 423 458 443 425 443H392V458Z';

const HEAD_TRANSFORM = 'translate(550 22) scale(-1.76 1.76)';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const hash = (value: number) => {
  const sine = Math.sin(value * 12.9898 + 78.233) * 43758.5453123;
  return sine - Math.floor(sine);
};

type WordSpec = {
  text: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  family: 'sans' | 'serif' | 'mono';
  weight: number;
};

const words: WordSpec[] = [
  {text: 'system', x: -34, y: 86, size: 70, opacity: 0.18, family: 'serif', weight: 700},
  {text: 'network', x: 1450, y: 58, size: 62, opacity: 0.18, family: 'sans', weight: 600},
  {text: 'deep learning', x: 1014, y: 132, size: 39, opacity: 0.14, family: 'mono', weight: 700},
  {text: 'digital', x: 1720, y: 164, size: 28, opacity: 0.16, family: 'mono', weight: 700},
  {text: 'technology', x: 58, y: 250, size: 51, opacity: 0.14, family: 'sans', weight: 700},
  {text: 'computer', x: 1460, y: 278, size: 69, opacity: 0.17, family: 'serif', weight: 700},
  {text: 'AI', x: 285, y: 124, size: 30, opacity: 0.1, family: 'mono', weight: 700},
  {text: 'security', x: 304, y: 356, size: 31, opacity: 0.13, family: 'sans', weight: 600},
  {text: 'information', x: 1365, y: 414, size: 59, opacity: 0.2, family: 'sans', weight: 700},
  {text: 'code', x: -14, y: 446, size: 45, opacity: 0.13, family: 'mono', weight: 700},
  {text: 'protection', x: 1550, y: 518, size: 38, opacity: 0.14, family: 'serif', weight: 700},
  {text: 'cyber', x: 82, y: 600, size: 65, opacity: 0.2, family: 'mono', weight: 700},
  {text: 'machine', x: 1490, y: 638, size: 47, opacity: 0.12, family: 'sans', weight: 700},
  {text: 'data', x: 250, y: 720, size: 34, opacity: 0.13, family: 'mono', weight: 600},
  {text: 'chatbot', x: 1608, y: 750, size: 41, opacity: 0.15, family: 'serif', weight: 700},
  {text: 'robot', x: -24, y: 844, size: 46, opacity: 0.15, family: 'sans', weight: 700},
  {text: 'computing', x: 1260, y: 862, size: 57, opacity: 0.13, family: 'mono', weight: 600},
  {text: 'neural', x: 395, y: 938, size: 54, opacity: 0.11, family: 'serif', weight: 700},
  {text: 'access', x: 1640, y: 984, size: 36, opacity: 0.14, family: 'mono', weight: 700},
  {text: '01001010', x: 655, y: 178, size: 18, opacity: 0.1, family: 'mono', weight: 500},
  {text: '11000101', x: 1160, y: 570, size: 17, opacity: 0.1, family: 'mono', weight: 500},
  {text: 'cyber brain', x: 120, y: 1010, size: 28, opacity: 0.12, family: 'mono', weight: 500},
  {text: 'future', x: 775, y: 42, size: 25, opacity: 0.09, family: 'serif', weight: 600},
  {text: 'automation', x: 1040, y: 1005, size: 40, opacity: 0.12, family: 'sans', weight: 600},
];

const fontFamily = (family: WordSpec['family']) => {
  if (family === 'mono') {
    return '"Courier New", Courier, monospace';
  }
  if (family === 'serif') {
    return 'Georgia, "Times New Roman", serif';
  }
  return 'Arial, Helvetica, sans-serif';
};

const TechnologyBackdrop: React.FC<{
  frame: number;
  glitchStrength: number;
  slotIndex: number;
}> = ({frame, glitchStrength, slotIndex}) => {
  const flickerTick = Math.floor(frame / 3);
  const blockTick = Math.floor(frame / 4);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, #071312 0%, #030808 34%, #010303 67%, #000101 100%)',
        }}
      />

      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0, opacity: 0.09 + glitchStrength * 0.08}}
      >
        <g fill={CYAN}>
          {[
            {x: 182, y: 190, scale: 0.2, rotation: -16},
            {x: 1520, y: 170, scale: 0.27, rotation: 18},
            {x: 340, y: 760, scale: 0.16, rotation: 28},
            {x: 1430, y: 770, scale: 0.2, rotation: -12},
          ].map((item, index) => (
            <g
              key={index}
              opacity={0.22 + hash(slotIndex * 13 + index * 7) * 0.24}
              transform={`translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${item.scale})`}
            >
              <path d={SHARE_NETWORK_PATH} />
            </g>
          ))}
        </g>
        <g fill="none" stroke={CYAN} strokeWidth="1">
          <path d="M170 242 C430 140 594 188 770 316" opacity="0.13" />
          <path d="M1150 290 C1370 160 1570 264 1740 420" opacity="0.12" />
          <path d="M190 796 C430 882 608 840 760 712" opacity="0.1" />
          <path d="M1160 738 C1360 884 1600 860 1775 728" opacity="0.1" />
        </g>
      </svg>

      {words.map((word, index) => {
        const stepX = (hash(flickerTick * 43 + index * 101) - 0.5) * (2.6 + glitchStrength * 13);
        const stepY = (hash(flickerTick * 61 + index * 73) - 0.5) * (1.5 + glitchStrength * 5);
        const pulse = 0.56 + hash(flickerTick * 17 + index * 29) * 0.55;
        const dropout = hash(flickerTick * 19 + index * 37) < 0.035 ? 0.18 : 1;

        return (
          <div
            key={`${word.text}-${index}`}
            style={{
              position: 'absolute',
              left: word.x,
              top: word.y,
              color: PAPER,
              opacity: word.opacity * pulse * dropout,
              transform: `translate3d(${stepX}px, ${stepY}px, 0)`,
              fontFamily: fontFamily(word.family),
              fontSize: word.size,
              fontWeight: word.weight,
              letterSpacing: word.family === 'mono' ? '0.02em' : '-0.04em',
              lineHeight: 1,
              filter: 'blur(0.45px)',
              whiteSpace: 'nowrap',
            }}
          >
            {word.text}
          </div>
        );
      })}

      {Array.from({length: 46}).map((_, index) => {
        const cellX = Math.floor(hash(blockTick * 31 + index * 83) * 60);
        const cellY = Math.floor(hash(blockTick * 47 + index * 97) * 34);
        const wide = 1 + Math.floor(hash(index * 17 + slotIndex * 5) * 5);
        const tall = 1 + Math.floor(hash(index * 23 + slotIndex * 11) * 3);
        const bright = index % 9 === 0;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: cellX * 32,
              top: cellY * 32,
              width: wide * 32,
              height: tall * 18,
              opacity:
                (0.018 + hash(blockTick * 71 + index * 43) * 0.055) *
                (1 + glitchStrength * 2.6),
              backgroundColor: bright ? CYAN : PAPER,
              mixBlendMode: bright ? 'screen' : 'normal',
            }}
          />
        );
      })}

      {Array.from({length: 11}).map((_, index) => {
        const y = 95 + hash(slotIndex * 41 + index * 67) * 875;
        const left = -120 + hash(index * 29 + slotIndex * 17) * 720;
        const width = 170 + hash(index * 53 + flickerTick * 3) * 1420;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left,
              top: y,
              width,
              height: index % 4 === 0 ? 2 : 1,
              opacity: (0.035 + glitchStrength * 0.13) * (0.45 + hash(index * 7 + flickerTick) * 0.7),
              background: `linear-gradient(90deg, transparent, ${index % 3 === 0 ? CYAN : PAPER}, transparent)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const GearShape: React.FC<{
  x: number;
  y: number;
  scale: number;
  angle: number;
  color: string;
}> = ({x, y, scale, angle, color}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g transform={`rotate(${angle} 128 128)`}>
      <path d={GEAR_FILL_PATH} fill={color} />
    </g>
  </g>
);

const circuitTracks = [
  'M232 48 H196 L184 60 H151',
  'M242 61 H205 L193 73 H160',
  'M226 76 H205 L194 87 H164',
  'M236 92 H212 L202 102 H175',
  'M224 108 H204 L195 117 H176',
  'M218 126 H199 L190 135 H170',
  'M209 144 H190 L180 154 H164',
  'M194 163 H180 L168 175 H151',
];

const IconArt: React.FC<{
  variant: number;
  frame: number;
  color?: string;
  opacity?: number;
}> = ({variant, frame, color = CYAN, opacity = 1}) => {
  const gearTurn = frame * 0.55;
  const breathe = 1 + Math.sin(frame * 0.075) * 0.006;
  const dark = color === CYAN ? '#021110' : '#050206';
  const glow =
    color === SIGNAL_RED
      ? 'rgba(243,9,43,0.56)'
      : color === MAGENTA
        ? 'rgba(255,29,117,0.54)'
        : color === BLUE
          ? 'rgba(24,168,255,0.52)'
          : 'rgba(24,243,223,0.5)';

  const content = (() => {
    if (variant === 0) {
      return (
        <>
          <path d={PROFILE_SILHOUETTE_PATH} fill={color} />
          {Array.from({length: 13}).map((_, index) => (
            <rect
              key={index}
              x={176 + hash(index * 17) * 244}
              y={205 + hash(index * 31) * 172}
              width={12 + hash(index * 43) * 62}
              height={5 + hash(index * 59) * 20}
              fill={dark}
              opacity={0.12 + hash(index * 71) * 0.2}
            />
          ))}
          <GearShape x={185} y={48} scale={0.55} angle={gearTurn} color={dark} />
          <GearShape x={334} y={109} scale={0.38} angle={-gearTurn * 1.35} color={dark} />
          <GearShape x={257} y={196} scale={0.28} angle={gearTurn * 1.7} color={dark} />
          <GearShape x={363} y={216} scale={0.2} angle={-gearTurn * 2.05} color={dark} />
          <path
            d="M145 330 H242 L258 314 H322"
            fill="none"
            stroke={CYAN_BRIGHT}
            strokeWidth="2"
            opacity="0.42"
          />
        </>
      );
    }

    if (variant === 1) {
      return (
        <>
          <g transform={HEAD_TRANSFORM}>
            <path
              d={HEAD_REGULAR_PATH}
              fill={color}
              fillOpacity="0.045"
              stroke={color}
              strokeWidth="3.7"
              strokeLinejoin="round"
            />
            <g fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round">
              {circuitTracks.map((path, index) => (
                <path key={path} d={path} opacity={0.44 + index * 0.045} />
              ))}
            </g>
            <rect x="120" y="68" width="30" height="30" rx="2" fill={color} opacity="0.22" />
            <rect x="126" y="74" width="18" height="18" rx="1" fill={CYAN_BRIGHT} />
            {[0, 1, 2, 3].map((index) => (
              <circle
                key={index}
                cx={161 + index * 15}
                cy={index % 2 === 0 ? 73 : 117}
                r="3.2"
                fill={CYAN_BRIGHT}
              />
            ))}
          </g>
          <g stroke={color} strokeWidth="2" opacity="0.48">
            <path d="M118 151 H70" />
            <path d="M128 172 H48" />
            <path d="M120 193 H82" />
          </g>
        </>
      );
    }

    if (variant === 2) {
      return (
        <>
          {[0, 1, 2].map((index) => (
            <g
              key={index}
              transform={`translate(${-72 + index * 120} 30) scale(0.82)`}
              opacity={0.54 + index * 0.22}
            >
              <path
                d={PROFILE_SILHOUETTE_PATH}
                fill={index === 1 ? color : 'none'}
                fillOpacity={index === 1 ? 0.035 : 0}
                stroke={color}
                strokeWidth={4.4 - index * 0.35}
                strokeLinejoin="round"
              />
            </g>
          ))}
          <circle cx="310" cy="248" r="8" fill={color} opacity="0.62" />
          <circle cx="409" cy="248" r="8" fill={color} opacity="0.8" />
          <circle cx="507" cy="248" r="8" fill={color} />
          <path d="M82 410 H555" stroke={color} strokeWidth="2" opacity="0.22" />
        </>
      );
    }

    if (variant === 3) {
      return (
        <>
          <path
            d={PROFILE_SILHOUETTE_PATH}
            fill={color}
            fillOpacity="0.02"
            stroke={color}
            strokeWidth="5.2"
            strokeLinejoin="round"
          />
          <text
            x="307"
            y="229"
            fill={color}
            fontFamily="Arial Black, Arial, Helvetica, sans-serif"
            fontSize="126"
            fontWeight="900"
            letterSpacing="-0.09em"
            textAnchor="middle"
          >
            AI
          </text>
          <circle cx="455" cy="242" r="10" fill={color} />
          <path
            d="M198 272 H316 M199 292 H286 M199 312 H258"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.38"
          />
        </>
      );
    }

    if (variant === 4) {
      return (
        <>
          <path d={PROFILE_SILHOUETTE_PATH} fill={color} opacity="0.96" />
          {[
            'M145 125 H238 L258 145 H345',
            'M145 151 H223 L246 174 H332',
            'M145 178 H213 L233 198 H310',
            'M145 207 H199 L222 230 H300',
            'M151 237 H206 L228 259 H286',
            'M166 267 H215 L237 289 H278',
          ].map((path, index) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke={dark}
              strokeWidth={index % 3 === 0 ? 6 : 4}
              opacity={0.72}
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <rect
              key={index}
              x={190 + hash(index * 31) * 190}
              y={210 + hash(index * 47) * 150}
              width={20 + hash(index * 59) * 58}
              height={9 + hash(index * 67) * 24}
              fill={dark}
              opacity={0.12 + index * 0.045}
            />
          ))}
          <path d="M145 126 H89 M145 152 H62 M145 178 H98" stroke={color} strokeWidth="2" opacity="0.5" />
        </>
      );
    }

    return (
      <>
        <g transform={HEAD_TRANSFORM}>
          <path
            d={HEAD_REGULAR_PATH}
            fill={color}
            fillOpacity="0.025"
            stroke={color}
            strokeWidth="3.8"
            strokeLinejoin="round"
          />
        </g>
        <g transform="translate(205 76) scale(0.55)" fill={color} opacity="0.88">
          <path d={SHARE_NETWORK_PATH} />
        </g>
        <g fill={CYAN_BRIGHT}>
          {[
            [217, 108, 5],
            [287, 136, 6],
            [242, 218, 5],
            [352, 172, 6],
            [386, 110, 4],
            [404, 250, 5],
          ].map(([cx, cy, radius], index) => (
            <circle key={index} cx={cx} cy={cy} r={radius} />
          ))}
        </g>
        <g fill="none" stroke={color} strokeWidth="2.2" opacity="0.66">
          <path d="M217 108 L287 136 L352 172 L404 250" />
          <path d="M217 108 L242 218 L352 172 L386 110" />
          <path d="M287 136 L386 110" />
        </g>
        <rect x="304" y="191" width="38" height="38" rx="3" fill={color} opacity="0.22" />
        <rect x="314" y="201" width="18" height="18" rx="2" fill={CYAN_BRIGHT} />
      </>
    );
  })();

  return (
    <svg
      width="640"
      height="520"
      viewBox="0 0 640 520"
      style={{
        display: 'block',
        opacity,
        overflow: 'visible',
        transform: `scale(${breathe})`,
        transformOrigin: '50% 50%',
        filter: `drop-shadow(0 0 5px ${glow}) drop-shadow(0 0 15px rgba(24,243,223,0.12))`,
      }}
    >
      {content}
    </svg>
  );
};

const IconLayer: React.FC<{
  variant: number;
  frame: number;
  color?: string;
  opacity?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
}> = ({
  variant,
  frame,
  color = CYAN,
  opacity = 1,
  offsetX = 0,
  offsetY = 0,
  scale = 1.3,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 960,
      top: 470,
      width: 640,
      height: 520,
      transform: `translate(-50%, -50%) translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`,
      transformOrigin: '50% 50%',
      opacity,
    }}
  >
    <IconArt variant={variant} frame={frame} color={color} />
  </div>
);

const AnchoredTitle: React.FC<{
  opacity?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  monoTint?: string;
}> = ({
  opacity = 1,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  monoTint,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 960,
      top: 865,
      width: 900,
      height: 250,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `translate(-50%, -50%) translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`,
      transformOrigin: '50% 50%',
      opacity,
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700,
      fontSize: 122,
      lineHeight: 0.81,
      letterSpacing: '-0.055em',
      whiteSpace: 'nowrap',
      fontVariantLigatures: 'none',
      filter: 'contrast(1.08)',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        color: monoTint ?? ACID,
        textShadow: monoTint
          ? `0 0 8px ${monoTint}`
          : '0 2px 0 rgba(0,0,0,0.9), 0 0 11px rgba(121,255,22,0.28)',
      }}
    >
      artificial
    </div>
    <div
      style={{
        color: monoTint ?? SIGNAL_RED,
        textShadow: monoTint
          ? `0 0 8px ${monoTint}`
          : '0 2px 0 rgba(0,0,0,0.92), 0 0 12px rgba(243,9,43,0.3)',
      }}
    >
      intelligence
    </div>
  </div>
);

const SliceGlitch: React.FC<{
  frame: number;
  currentVariant: number;
  nextVariant: number;
  strength: number;
  phase: number;
}> = ({frame, currentVariant, nextVariant, strength, phase}) => {
  if (strength <= 0) {
    return null;
  }

  const tick = Math.floor(frame / 2);
  const palette = [CYAN, SIGNAL_RED, MAGENTA, BLUE, CYAN_BRIGHT];
  const titleReveal = interpolate(phase, [0.1, 0.82], [0.25, 1], clamp);

  return (
    <AbsoluteFill style={{zIndex: 15, pointerEvents: 'none'}}>
      {Array.from({length: 7}).map((_, index) => {
        const top = 10 + hash(tick * 31 + index * 73) * 78;
        const height = 2.2 + hash(tick * 47 + index * 29) * 8.5;
        const shift =
          (hash(tick * 61 + index * 97) - 0.5) *
          (70 + index * 12) *
          strength;
        const incoming = index >= 3 || phase > 0.62;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`,
              transform: `translate3d(${shift}px, 0, 0)`,
              opacity: 0.48 + strength * 0.4,
              mixBlendMode: index % 3 === 1 ? 'screen' : 'normal',
            }}
          >
            <IconLayer
              variant={incoming ? nextVariant : currentVariant}
              frame={frame}
              color={palette[index % palette.length]}
              opacity={incoming ? titleReveal : 0.8}
            />
            <AnchoredTitle
              opacity={0.42 + strength * 0.36}
              offsetX={(hash(index * 19 + tick) - 0.5) * 42}
              monoTint={palette[(index + 1) % palette.length]}
            />
          </div>
        );
      })}

      {Array.from({length: 24}).map((_, index) => {
        const y = hash(tick * 83 + index * 43) * 1075;
        const left = -120 + hash(tick * 29 + index * 71) * 610;
        const width = 120 + hash(tick * 101 + index * 37) * 1700;
        const height = 1 + Math.floor(hash(tick * 53 + index * 89) * 9);
        const bright = index % 6 === 0;
        const color = palette[index % palette.length];
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left,
              top: y,
              width,
              height,
              opacity: strength * (bright ? 0.66 : 0.24),
              background: bright
                ? `linear-gradient(90deg, transparent, ${color}, #f7ffff, ${color}, transparent)`
                : `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: bright ? `0 0 12px ${color}` : 'none',
              mixBlendMode: 'screen',
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          opacity: strength * 0.22,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 9px, rgba(255,255,255,0.33) 10px, transparent 11px)',
          transform: `translateY(${(hash(tick * 131) - 0.5) * 18}px)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

const Texture: React.FC<{frame: number; glitchStrength: number}> = ({
  frame,
  glitchStrength,
}) => {
  const scanY = ((frame * 8.4) % 1260) - 120;
  const tearY = ((Math.floor(frame / 3) * 83) % 1120) - 20;

  return (
    <>
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{position: 'absolute', inset: 0, opacity: 0.11, zIndex: 24}}
      >
        <filter id="motion4-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="3"
            seed="37"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.42" />
          </feComponentTransfer>
        </filter>
        <rect width="1920" height="1080" filter="url(#motion4-grain)" />
      </svg>

      <AbsoluteFill
        style={{
          zIndex: 25,
          opacity: 0.13 + glitchStrength * 0.08,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(228,255,252,0.14) 4px)',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          zIndex: 25,
          left: 0,
          right: 0,
          top: scanY,
          height: 84,
          opacity: 0.12,
          background:
            'linear-gradient(180deg, transparent, rgba(24,243,223,0.14), transparent)',
          mixBlendMode: 'screen',
        }}
      />

      {glitchStrength > 0 ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 25,
            left: 0,
            right: 0,
            top: tearY,
            height: 8 + glitchStrength * 18,
            opacity: glitchStrength * 0.56,
            backgroundColor: DEEP_BLACK,
            boxShadow:
              '0 -2px 0 rgba(24,243,223,0.42), 0 2px 0 rgba(243,9,43,0.36)',
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          zIndex: 27,
          boxShadow:
            'inset 0 0 245px rgba(0,0,0,0.94), inset 0 0 56px rgba(0,0,0,0.72)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

const ICON_SEQUENCE = [0, 1, 2, 4, 3, 5, 0, 2, 1, 4, 3, 0, 5, 2, 4];
const FLASH_AFTER = new Set([0, 5, 8, 10, 13, 14]);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // Fifteen 1/3-second plates form a five-second subloop at 60 fps.
  // The same five-second loop repeats cleanly in either a 10s or 15s composition.
  const slotFrames = Math.max(8, Math.round(fps / 3));
  const cycleFrames = slotFrames * ICON_SEQUENCE.length;
  const cycleFrame = ((frame % cycleFrames) + cycleFrames) % cycleFrames;
  const slotIndex = Math.floor(cycleFrame / slotFrames);
  const slotFrame = cycleFrame - slotIndex * slotFrames;
  const currentVariant = ICON_SEQUENCE[slotIndex];
  const nextVariant = ICON_SEQUENCE[(slotIndex + 1) % ICON_SEQUENCE.length];

  const glitchFrames = Math.max(3, Math.round(fps * 0.1));
  const glitchStart = Math.max(1, slotFrames - glitchFrames);
  const glitchPhase = interpolate(
    slotFrame,
    [glitchStart, Math.max(glitchStart + 1, slotFrames - 1)],
    [0, 1],
    clamp,
  );
  const glitchEnvelope = interpolate(
    glitchPhase,
    [0, 0.24, 0.72, 1],
    [0, 0.7, 1, 0.78],
    {...clamp, easing: Easing.out(Easing.quad)},
  );
  const glitchTick = Math.floor(cycleFrame / 2);
  const glitchStrength =
    slotFrame >= glitchStart
      ? glitchEnvelope * (0.72 + hash(glitchTick * 43 + slotIndex * 17) * 0.28)
      : 0;

  const flashStart = Math.max(glitchStart, slotFrames - 3);
  const flashLocal = slotFrame - flashStart;
  const flashPattern = [0.42, 0.97, 0.78];
  const flashOpacity =
    FLASH_AFTER.has(slotIndex) && flashLocal >= 0
      ? flashPattern[Math.min(flashPattern.length - 1, flashLocal)] ?? 0
      : 0;

  const stableSettle = interpolate(
    slotFrame,
    [0, Math.max(1, Math.round(fps * 0.045))],
    [0, 1],
    {...clamp, easing: Easing.out(Easing.cubic)},
  );
  const jitterX =
    glitchStrength > 0
      ? (hash(glitchTick * 71 + slotIndex * 19) - 0.5) * 25 * glitchStrength
      : 0;
  const jitterY =
    glitchStrength > 0
      ? (hash(glitchTick * 89 + slotIndex * 31) - 0.5) * 7 * glitchStrength
      : 0;
  const foregroundScale = 0.992 + stableSettle * 0.008;

  const stageScale = Math.min(width / 1920, height / 1080);
  const stageLeft = (width - 1920 * stageScale) / 2;
  const stageTop = (height - 1080 * stageScale) / 2;

  return (
    <AbsoluteFill style={{backgroundColor: BLACK, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: stageLeft,
          top: stageTop,
          width: 1920,
          height: 1080,
          overflow: 'hidden',
          transform: `scale(${stageScale})`,
          transformOrigin: 'top left',
          backgroundColor: BLACK,
        }}
      >
        <TechnologyBackdrop
          frame={cycleFrame}
          glitchStrength={glitchStrength}
          slotIndex={slotIndex}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 8,
            transform: `translate3d(${jitterX}px, ${jitterY}px, 0) scale(${foregroundScale})`,
            transformOrigin: '50% 50%',
            filter: `contrast(${1.03 + glitchStrength * 0.2}) saturate(${1 + glitchStrength * 0.16})`,
          }}
        >
          <IconLayer
            variant={currentVariant}
            frame={cycleFrame}
            opacity={0.78 + stableSettle * 0.22}
          />
          <AnchoredTitle opacity={0.84 + stableSettle * 0.16} />
        </div>

        <SliceGlitch
          frame={cycleFrame}
          currentVariant={currentVariant}
          nextVariant={nextVariant}
          strength={glitchStrength}
          phase={glitchPhase}
        />

        {flashOpacity > 0 ? (
          <AbsoluteFill
            style={{
              zIndex: 22,
              backgroundColor: '#ffffff',
              opacity: flashOpacity,
              mixBlendMode: 'screen',
              boxShadow: 'inset 0 0 160px rgba(206,255,250,0.44)',
            }}
          />
        ) : null}

        <Texture frame={cycleFrame} glitchStrength={glitchStrength} />

        <div
          style={{
            position: 'absolute',
            zIndex: 28,
            left: 3,
            top: 0,
            bottom: 0,
            width: 2,
            opacity: 0.12,
            background:
              'repeating-linear-gradient(180deg, #d8dfde 0 5px, transparent 5px 12px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            zIndex: 28,
            right: 4,
            top: 0,
            bottom: 0,
            width: 1,
            opacity: 0.08,
            backgroundColor: PAPER,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
