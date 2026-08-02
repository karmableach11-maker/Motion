import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const VIOLET = '#8d78ff';
const VIOLET_SOFT = '#b5a8ff';
const CHAMPAGNE = '#e3c580';
const IVORY = '#f7f1e5';
const MUTED = '#aaa8b7';
const CELL_COUNT = 8;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

type Dust = {
  x: number;
  y: number;
  r: number;
  depth: number;
  phase: number;
  warm: boolean;
};

const mono =
  '"SFMono-Regular", "Cascadia Mono", "Roboto Mono", "Liberation Mono", ui-monospace, monospace';

const Atmosphere: React.FC<{
  frame: number;
  duration: number;
  charge: number;
  complete: number;
}> = ({frame, duration, charge, complete}) => {
  const dust = useMemo<Dust[]>(
    () =>
      Array.from({length: 38}, (_, index) => ({
        x: (index * 37.73 + Math.sin(index * 2.11) * 19 + 100) % 100,
        y: (index * 61.27 + Math.cos(index * 1.37) * 23 + 100) % 100,
        r: 0.7 + ((index * 17) % 19) / 10,
        depth: 0.5 + (index % 5) * 0.18,
        phase: index * 0.83,
        warm: index % 7 === 0,
      })),
    [],
  );
  const loop = (frame / Math.max(1, duration - 1)) * Math.PI * 2;
  const energy = 0.55 + charge * 0.45 + complete * 0.28;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 55% 45%, #17122d 0%, #0b0a14 36%, #050507 72%, #020203 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate3d(${Math.sin(loop * 0.48) * 28}px, ${Math.cos(loop * 0.39) * 18}px, 0) scale(1.08)`,
          background:
            'radial-gradient(ellipse at 18% 72%, rgba(114,82,242,0.18), transparent 43%), radial-gradient(ellipse at 83% 24%, rgba(226,191,116,0.105), transparent 38%), radial-gradient(ellipse at 61% 58%, rgba(102,70,217,0.13), transparent 48%)',
          filter: 'blur(12px)',
          opacity: energy,
        }}
      />

      <AbsoluteFill
        style={{
          opacity: 0.42,
          transform: `perspective(1300px) rotateX(68deg) rotateZ(-8deg) translate3d(${Math.sin(loop * 0.34) * 32}px, ${76 + Math.cos(loop * 0.29) * 20}px, 0) scale(1.25)`,
          transformOrigin: '50% 70%',
          backgroundImage:
            'linear-gradient(rgba(157,139,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(157,139,255,0.055) 1px, transparent 1px)',
          backgroundSize: '84px 84px',
          maskImage:
            'radial-gradient(ellipse at 54% 54%, black 0%, rgba(0,0,0,0.8) 44%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 54% 54%, black 0%, rgba(0,0,0,0.8) 44%, transparent 78%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: -430 + charge * 1660,
          top: -550,
          width: 290,
          height: 2200,
          transform: 'rotate(31deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(137,112,255,0.045), rgba(215,196,255,0.14), rgba(234,201,132,0.055), transparent)',
          filter: 'blur(32px)',
          opacity: 0.36 + charge * 0.36,
          mixBlendMode: 'screen',
        }}
      />

      {dust.map((particle, index) => {
        const driftX =
          Math.sin(frame * (0.007 + particle.depth * 0.0018) + particle.phase) *
          38 *
          particle.depth;
        const driftY =
          Math.cos(frame * (0.005 + particle.depth * 0.0014) + particle.phase) *
          23 *
          particle.depth;
        const twinkle =
          0.12 +
          0.07 * Math.sin(frame * 0.035 + particle.phase) +
          (index % 11 === 0 ? complete * 0.25 : 0);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.r * 2,
              height: particle.r * 2,
              borderRadius: '50%',
              background: particle.warm ? CHAMPAGNE : VIOLET_SOFT,
              opacity: twinkle,
              transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${0.7 + particle.depth * 0.34})`,
              boxShadow: particle.warm
                ? '0 0 12px rgba(227,197,128,0.42)'
                : '0 0 12px rgba(141,120,255,0.42)',
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(116deg, rgba(255,255,255,0.02), transparent 24%, transparent 72%, rgba(223,191,122,0.018))',
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

const IncomingEnergy: React.FC<{
  frame: number;
  charge: number;
  complete: number;
}> = ({frame, charge, complete}) => {
  const reveal = smooth(charge / 0.18);
  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <linearGradient id="incoming-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5541bb" stopOpacity="0" />
          <stop offset="0.48" stopColor={VIOLET} stopOpacity="0.82" />
          <stop offset="1" stopColor={CHAMPAGNE} stopOpacity="0.96" />
        </linearGradient>
        <filter id="incoming-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0, 1, 2, 3].map((lane) => {
        const dash = 116 + lane * 21;
        const offset = -(frame * (4.8 + lane * 0.72) + lane * 87);
        const yShift = lane * 24 - 36;
        return (
          <path
            key={lane}
            d={`M -180 ${970 + yShift} C 180 ${880 + yShift}, 292 ${748 + yShift}, 463 ${674 + yShift} S 650 ${596 + yShift}, 758 ${560 + yShift}`}
            fill="none"
            stroke="url(#incoming-gradient)"
            strokeWidth={lane === 1 ? 4 : 2}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${245 - lane * 18}`}
            strokeDashoffset={offset}
            opacity={(0.18 + lane * 0.08) * reveal * (1 - complete * 0.65)}
            filter="url(#incoming-glow)"
          />
        );
      })}
      <circle
        cx={758}
        cy={560}
        r={12 + Math.sin(frame * 0.18) * 4}
        fill={CHAMPAGNE}
        opacity={reveal * (0.5 + Math.sin(frame * 0.15) * 0.18)}
        filter="url(#incoming-glow)"
      />
    </svg>
  );
};

const CircuitDetails: React.FC<{frame: number; charge: number}> = ({
  frame,
  charge,
}) => {
  return (
    <svg
      width="1540"
      height="520"
      viewBox="0 0 1540 520"
      style={{position: 'absolute', left: -60, top: -68, overflow: 'visible'}}
    >
      <g opacity={0.24 + charge * 0.2}>
        <path
          d="M110 82 H318 L354 118 H515"
          fill="none"
          stroke="rgba(181,168,255,0.48)"
          strokeWidth="1.4"
          strokeDasharray="7 14"
          strokeDashoffset={-frame * 0.8}
        />
        <path
          d="M1040 408 H1256 L1304 358 H1454"
          fill="none"
          stroke="rgba(227,197,128,0.48)"
          strokeWidth="1.4"
          strokeDasharray="7 14"
          strokeDashoffset={frame * 0.9}
        />
        <circle cx="100" cy="82" r="4" fill={VIOLET_SOFT} />
        <circle cx="1464" cy="358" r="4" fill={CHAMPAGNE} />
      </g>
    </svg>
  );
};

const BatteryCell: React.FC<{
  index: number;
  frame: number;
  charge: number;
  complete: number;
}> = ({index, frame, charge, complete}) => {
  const segmentStart = index / CELL_COUNT;
  const local = clamp((charge - segmentStart) * CELL_COUNT);
  const filled = smooth(local);
  const active = Math.sin(Math.min(1, local) * Math.PI);
  const cellComplete = charge >= (index + 1) / CELL_COUNT;
  const rise = 1 - filled;
  const wave = Math.sin(frame * 0.11 + index * 0.94);
  const glint = ((frame * 3.4 + index * 113) % 380) - 130;
  const surge = complete * (0.88 + Math.sin(frame * 0.16 + index) * 0.12);

  return (
    <div
      style={{
        position: 'relative',
        width: 146,
        height: 254,
        borderRadius: 20,
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.058), rgba(255,255,255,0.014) 47%, rgba(0,0,0,0.24))',
        border: `1px solid rgba(${cellComplete ? '226,199,137' : '174,166,209'},${0.18 + filled * 0.42})`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -26px 34px rgba(0,0,0,0.22), 0 0 ${18 + active * 34 + surge * 24}px rgba(126,99,255,${0.08 + active * 0.23 + surge * 0.16})`,
        transform: `translateY(${-active * 8 - surge * 2}px) scale(${1 + active * 0.018 + surge * 0.006})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 9,
          right: 9,
          top: 9,
          bottom: 9,
          borderRadius: 13,
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(83,60,164,0.07))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 100%',
            transform: `translateY(${rise * 100}%)`,
            background:
              'linear-gradient(180deg, rgba(246,224,172,0.96) 0%, rgba(200,169,255,0.92) 25%, rgba(125,99,244,0.9) 64%, rgba(75,52,175,0.95) 100%)',
            boxShadow:
              'inset 12px 0 24px rgba(255,255,255,0.12), inset -16px 0 28px rgba(41,21,108,0.28), 0 -12px 28px rgba(233,205,146,0.7)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -18,
              right: -18,
              top: -7 + wave * 2.8,
              height: 16,
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse at center, rgba(255,249,231,0.98), rgba(236,206,145,0.78) 32%, rgba(157,132,255,0.22) 70%, transparent)',
              filter: 'blur(1px)',
              boxShadow:
                '0 0 18px rgba(243,218,165,0.9), 0 0 38px rgba(146,117,255,0.75)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: glint,
              top: -40,
              width: 66,
              height: 340,
              transform: 'rotate(18deg)',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent)',
              filter: 'blur(5px)',
              opacity: 0.32,
            }}
          />
        </div>

        {Array.from({length: 5}, (_, marker) => (
          <div
            key={marker}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 22 + marker * 44,
              height: 1,
              background: 'rgba(255,255,255,0.09)',
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 11,
          textAlign: 'center',
          color: filled > 0.74 ? '#fff8e9' : 'rgba(215,209,229,0.46)',
          fontFamily: mono,
          fontSize: 12,
          letterSpacing: 2.2,
          textShadow: filled > 0.74 ? '0 0 10px rgba(250,225,173,0.8)' : 'none',
        }}
      >
        C{String(index + 1).padStart(2, '0')}
      </div>

      {active > 0.04 ? (
        <div
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 20,
            border: '1px solid rgba(244,218,166,0.76)',
            opacity: active * (0.58 + Math.sin(frame * 0.2) * 0.17),
            boxShadow:
              'inset 0 0 18px rgba(245,220,168,0.22), 0 0 28px rgba(139,111,255,0.42)',
          }}
        />
      ) : null}
    </div>
  );
};

const BatteryPack: React.FC<{
  frame: number;
  charge: number;
  complete: number;
}> = ({frame, charge, complete}) => {
  const activeCell = Math.min(CELL_COUNT - 1, Math.floor(charge * CELL_COUNT));
  const railDash = -(frame * 3.2);
  const completionRing = complete * (1 + Math.sin(frame * 0.12) * 0.025);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1510,
        height: 430,
      }}
    >
      <CircuitDetails frame={frame} charge={charge} />

      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 42,
          width: 1390,
          height: 340,
          borderRadius: 54,
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.072), rgba(255,255,255,0.016) 32%, rgba(0,0,0,0.19) 74%, rgba(225,195,127,0.035))',
          border: `1px solid rgba(218,211,232,${0.19 + charge * 0.12 + complete * 0.18})`,
          boxShadow: `inset 0 2px 0 rgba(255,255,255,0.09), inset 0 -34px 54px rgba(0,0,0,0.26), 0 34px 80px rgba(0,0,0,0.5), 0 0 ${38 + complete * 50}px rgba(130,101,255,${0.08 + complete * 0.12})`,
          backdropFilter: 'blur(5px)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 13,
            borderRadius: 43,
            border: '1px solid rgba(255,255,255,0.045)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 44,
            top: 42,
            display: 'flex',
            gap: 15,
          }}
        >
          {Array.from({length: CELL_COUNT}, (_, index) => (
            <React.Fragment key={index}>
              <BatteryCell
                index={index}
                frame={frame}
                charge={charge}
                complete={complete}
              />
              {index < CELL_COUNT - 1 ? (
                <div
                  style={{
                    position: 'relative',
                    alignSelf: 'center',
                    width: 10,
                    height: 58,
                    marginLeft: -10,
                    marginRight: -10,
                    borderRadius: 4,
                    background:
                      charge * CELL_COUNT > index + 0.94
                        ? 'linear-gradient(180deg, #f2ddad, #8f76ff)'
                        : 'rgba(194,187,215,0.13)',
                    boxShadow:
                      charge * CELL_COUNT > index + 0.94
                        ? '0 0 16px rgba(226,197,128,0.52)'
                        : 'none',
                    zIndex: 3,
                  }}
                />
              ) : null}
            </React.Fragment>
          ))}
        </div>

        <svg
          width="1296"
          height="26"
          viewBox="0 0 1296 26"
          style={{position: 'absolute', left: 46, bottom: 14, overflow: 'visible'}}
        >
          <defs>
            <linearGradient id="rail-gradient" x1="0" x2="1">
              <stop offset="0" stopColor={VIOLET} stopOpacity="0.45" />
              <stop offset="0.72" stopColor={VIOLET_SOFT} stopOpacity="0.9" />
              <stop offset="1" stopColor={CHAMPAGNE} stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M8 13 H1288"
            stroke="rgba(196,188,218,0.15)"
            strokeWidth="2"
          />
          <path
            d="M8 13 H1288"
            stroke="url(#rail-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray={`${charge} ${1 - charge}`}
            filter="drop-shadow(0 0 7px rgba(141,120,255,0.8))"
          />
          <path
            d="M8 13 H1288"
            stroke="rgba(252,231,189,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="18 120"
            strokeDashoffset={railDash}
            opacity={charge > 0.01 ? 0.74 : 0}
            style={{clipPath: `inset(0 ${100 - charge * 100}% 0 0)`}}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            left: 38 + activeCell * 161,
            bottom: -7,
            width: 178,
            height: 40,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, rgba(228,198,134,0.32), rgba(139,109,255,0.15) 44%, transparent 72%)',
            filter: 'blur(9px)',
            opacity: charge > 0.01 && complete < 0.8 ? 0.8 : 0,
            transition: 'none',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 9,
          top: 152,
          width: 66,
          height: 118,
          borderRadius: '0 22px 22px 0',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.13), rgba(116,90,190,0.2) 50%, rgba(228,196,126,0.12))',
          border: '1px solid rgba(228,216,236,0.2)',
          borderLeft: 0,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.13), 16px 0 38px rgba(130,99,255,${0.08 + complete * 0.25})`,
        }}
      />

      {complete > 0 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1540,
              height: 430,
              borderRadius: 90,
              border: '2px solid rgba(239,213,158,0.5)',
              transform: `translate(-50%, -50%) scale(${0.96 + completionRing * 0.09})`,
              opacity: (1 - complete) * 0.85,
              boxShadow:
                '0 0 44px rgba(235,207,150,0.3), inset 0 0 40px rgba(142,112,255,0.22)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1620,
              height: 510,
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(ellipse, rgba(249,226,176,0.22), rgba(134,103,255,0.13) 38%, transparent 70%)',
              filter: 'blur(18px)',
              opacity: complete * (1 - complete * 0.46),
              mixBlendMode: 'screen',
            }}
          />
        </>
      ) : null}
    </div>
  );
};

const Hud: React.FC<{
  frame: number;
  charge: number;
  complete: number;
  intro: number;
}> = ({frame, charge, complete, intro}) => {
  const percent = Math.min(100, Math.floor(charge * 100));
  const cursor = Math.floor(frame / 20) % 2 === 0;
  const pulse = 0.76 + Math.sin(frame * 0.11) * 0.18;
  const voltage = (342.6 + charge * 58.2).toFixed(1);
  const temperature = (24.8 + Math.sin(frame * 0.018) * 0.7 + charge * 2.3).toFixed(1);
  const completeLift = interpolate(complete, [0, 1], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: mono,
        color: IVORY,
        letterSpacing: 1.5,
        opacity: intro,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 126,
          top: 96,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: complete > 0.8 ? CHAMPAGNE : VIOLET,
            opacity: pulse,
            boxShadow:
              complete > 0.8
                ? '0 0 18px rgba(227,197,128,0.86)'
                : '0 0 18px rgba(141,120,255,0.86)',
          }}
        />
        <div style={{fontSize: 15, color: '#cbc6d8'}}>EV POWER SYSTEM</div>
        <div
          style={{
            width: 76,
            height: 1,
            background: 'linear-gradient(90deg, rgba(181,168,255,0.55), transparent)',
          }}
        />
        <div style={{fontSize: 13, color: '#817e8d'}}>UNIT // BMS-08</div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 126,
          top: 96,
          fontSize: 13,
          color: '#8e8a99',
          textAlign: 'right',
          lineHeight: 1.8,
        }}
      >
        <div>SECURE LINK // ACTIVE</div>
        <div style={{color: 'rgba(227,197,128,0.72)'}}>FW 08.42.16</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 126,
          bottom: 112,
          display: 'flex',
          gap: 54,
          color: MUTED,
          fontSize: 13,
        }}
      >
        <div>
          <div style={{fontSize: 10, color: '#6d6978', marginBottom: 10}}>PACK VOLTAGE</div>
          <span style={{fontSize: 20, color: '#d7d2de'}}>{voltage}</span>
          <span style={{marginLeft: 7, color: '#777381'}}>V</span>
        </div>
        <div>
          <div style={{fontSize: 10, color: '#6d6978', marginBottom: 10}}>CORE TEMP</div>
          <span style={{fontSize: 20, color: '#d7d2de'}}>{temperature}</span>
          <span style={{marginLeft: 7, color: '#777381'}}>°C</span>
        </div>
        <div>
          <div style={{fontSize: 10, color: '#6d6978', marginBottom: 10}}>CELL BALANCE</div>
          <span style={{fontSize: 20, color: '#d7d2de'}}>{charge > 0.96 ? 'SYNCED' : 'ACTIVE'}</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 126,
          bottom: 100,
          width: 580,
          textAlign: 'right',
          transform: `translateY(${completeLift}px)`,
        }}
      >
        <div
          style={{
            fontSize: complete > 0.25 ? 43 : 17,
            letterSpacing: complete > 0.25 ? 5.5 : 2.8,
            color: complete > 0.25 ? '#f5e7c7' : '#a7a2b3',
            textShadow:
              complete > 0.25
                ? '0 0 18px rgba(227,197,128,0.32), 0 10px 28px rgba(0,0,0,0.5)'
                : '0 0 12px rgba(141,120,255,0.22)',
            opacity: complete > 0.01 ? 0.55 + complete * 0.45 : pulse,
          }}
        >
          {complete > 0.25 ? 'UPDATE COMPLETE' : 'INSTALLING FIRMWARE'}
          {complete < 0.25 && cursor ? <span style={{color: VIOLET}}> _</span> : null}
        </div>

        <div
          style={{
            marginTop: complete > 0.25 ? 16 : 12,
            marginLeft: 'auto',
            width: complete > 0.25 ? 380 : 470,
            height: 2,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${charge * 100}%`,
              height: '100%',
              background:
                'linear-gradient(90deg, rgba(125,98,239,0.72), rgba(181,158,255,0.95), rgba(231,202,143,0.96))',
              boxShadow: '0 0 12px rgba(145,118,255,0.65)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 130,
          top: 188,
          minWidth: 260,
          textAlign: 'right',
          transform: `scale(${1 + Math.sin(frame * 0.08) * 0.004 + complete * 0.015})`,
          transformOrigin: '100% 50%',
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 300,
            letterSpacing: -1,
            fontVariantNumeric: 'tabular-nums',
            color: complete > 0.75 ? '#f6e6c2' : IVORY,
            textShadow:
              complete > 0.75
                ? '0 0 22px rgba(231,202,143,0.42)'
                : '0 0 18px rgba(163,143,255,0.24)',
          }}
        >
          {String(percent).padStart(3, '0')}
        </span>
        <span style={{fontSize: 19, marginLeft: 9, color: CHAMPAGNE}}>%</span>
      </div>
    </AbsoluteFill>
  );
};

const LensFinish: React.FC<{complete: number}> = ({complete}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at 52% 49%, transparent 0%, transparent 48%, rgba(0,0,0,0.3) 76%, rgba(0,0,0,0.82) 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        boxShadow:
          'inset 0 0 160px rgba(0,0,0,0.5), inset 0 0 420px rgba(0,0,0,0.28)',
        background: `linear-gradient(180deg, rgba(0,0,0,0.24), transparent 22%, transparent 76%, rgba(0,0,0,0.34)), radial-gradient(circle at 72% 56%, rgba(239,211,153,${complete * 0.035}), transparent 36%)`,
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const bootEnd = Math.round(durationInFrames * 0.05);
  const chargeEnd = Math.round(durationInFrames * 0.78);
  const completeStart = Math.round(durationInFrames * 0.79);
  const completeEnd = Math.round(durationInFrames * 0.87);

  const intro = interpolate(frame, [0, bootEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const charge = interpolate(frame, [bootEnd, chargeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const completionSpring = spring({
    frame: frame - completeStart,
    fps,
    config: {damping: 14, mass: 0.62, stiffness: 128},
    durationInFrames: Math.max(1, completeEnd - completeStart),
  });
  const complete = frame < completeStart ? 0 : clamp(completionSpring);

  const tracking = smooth(charge);
  const cameraX = interpolate(tracking, [0, 1], [94, -86]);
  const cameraY = interpolate(tracking, [0, 1], [58, -54]);
  const cameraScale = interpolate(tracking, [0, 1], [0.93, 1.075]);
  const cameraBreathe = Math.sin(frame * 0.012) * 0.006;
  const introLift = interpolate(intro, [0, 1], [74, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const completionKick = complete * 0.018;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#040405'}}>
      <Atmosphere
        frame={frame}
        duration={durationInFrames}
        charge={charge}
        complete={complete}
      />
      <IncomingEnergy frame={frame} charge={charge} complete={complete} />

      <div
        style={{
          position: 'absolute',
          left: 205,
          top: 318,
          width: 1510,
          height: 430,
          opacity: 0.42 + intro * 0.58,
          transformOrigin: '57% 53%',
          transform: `translate3d(${cameraX}px, ${cameraY + introLift}px, 0) perspective(1900px) rotateX(${-2.2 + tracking * 1.15}deg) rotateY(${-5.2 + tracking * 2.1}deg) rotateZ(${-7.6 + tracking * 2.4}deg) scale(${cameraScale + cameraBreathe + completionKick})`,
          filter: `blur(${(1 - intro) * 2}px)`,
        }}
      >
        <BatteryPack frame={frame} charge={charge} complete={complete} />
      </div>

      <Hud frame={frame} charge={charge} complete={complete} intro={intro} />
      <LensFinish complete={complete} />
    </AbsoluteFill>
  );
};
