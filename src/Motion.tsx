import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const FPS = 60;
const TOTAL_FRAMES = 20 * FPS;
const DISPLAY = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Helvetica Neue', Arial, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

const C = {
  ivory: "#f3f0e8",
  ivoryDeep: "#e8e3d8",
  paper: "#fffef9",
  ink: "#14263a",
  inkSoft: "#466075",
  inkFaint: "#8da0ad",
  cobalt: "#2f63ff",
  cobaltDeep: "#1642c7",
  cyan: "#31b7cf",
  emerald: "#0a9e72",
  emeraldDeep: "#087253",
  coral: "#e94f47",
  coralDeep: "#b72d31",
  gold: "#f1b844",
  white: "#ffffff",
};

type StageKey = "extract" | "identity" | "duplicate" | "vat" | "report";

type Stage = {
  key: StageKey;
  index: string;
  label: string;
  short: string;
  status: string;
  start: number;
  end: number;
  color: string;
};

const STAGES: Stage[] = [
  {
    key: "extract",
    index: "01",
    label: "DATA EXTRACTION",
    short: "EXTRACT",
    status: "INVOICE DATA EXTRACTED",
    start: 70,
    end: 335,
    color: C.cobalt,
  },
  {
    key: "identity",
    index: "02",
    label: "TAX ID VALIDATION",
    short: "VALIDATE",
    status: "TAX ID MATCHED",
    start: 300,
    end: 560,
    color: C.cyan,
  },
  {
    key: "duplicate",
    index: "03",
    label: "DUPLICATE CONTROL",
    short: "COMPARE",
    status: "DUPLICATE ISOLATED",
    start: 530,
    end: 790,
    color: C.coral,
  },
  {
    key: "vat",
    index: "04",
    label: "VAT RECONCILIATION",
    short: "RECONCILE",
    status: "VAT CALCULATION VERIFIED",
    start: 760,
    end: 1035,
    color: C.gold,
  },
  {
    key: "report",
    index: "05",
    label: "AUDIT REPORT",
    short: "REPORT",
    status: "TAX RECORD VERIFIED",
    start: 1000,
    end: 1199,
    color: C.emerald,
  },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smooth = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

const easeInOut = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const linear = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const windowOpacity = (
  frame: number,
  start: number,
  fadeInEnd: number,
  fadeOutStart: number,
  end: number,
) =>
  Math.min(
    smooth(frame, start, fadeInEnd),
    interpolate(frame, [fadeOutStart, end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }),
  );

const rgba = (hex: string, opacity: number) => {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const activeStage = (frame: number): Stage => {
  if (frame >= 1000) return STAGES[4];
  if (frame >= 760) return STAGES[3];
  if (frame >= 530) return STAGES[2];
  if (frame >= 300) return STAGES[1];
  return STAGES[0];
};

const invoiceXAt = (frame: number) =>
  -420 +
  1320 * smooth(frame, 70, 215) +
  1100 * smooth(frame, 330, 445) +
  1100 * smooth(frame, 555, 670) +
  1100 * smooth(frame, 785, 900) +
  800 * smooth(frame, 1040, 1145);

const CheckIcon: React.FC<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}> = ({size = 24, color = C.emerald, strokeWidth = 2.5}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="m4.4 12.5 4.5 4.4L19.6 6.7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScanIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = C.cobalt,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M5 11V5h6M21 5h6v6M27 21v6h-6M11 27H5v-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M8 16h16" stroke={color} strokeWidth="2.5" />
    <path d="M11 11h10M11 21h7" stroke={color} strokeWidth="1.5" />
  </svg>
);

const LinkIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = C.cyan,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M12.5 20.5 10 23a5.3 5.3 0 0 1-7.5-7.5l4.2-4.2a5.3 5.3 0 0 1 7.5 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="m19.5 11.5 2.5-2.5a5.3 5.3 0 1 1 7.5 7.5l-4.2 4.2a5.3 5.3 0 0 1-7.5 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="m11.2 20.8 9.6-9.6" stroke={color} strokeWidth="2.2" />
  </svg>
);

const CopyIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = C.coral,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="10" y="9" width="15" height="17" rx="2" stroke={color} strokeWidth="2" />
    <path
      d="M7 22H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M14 14h7M14 18h7M14 22h4" stroke={color} strokeWidth="1.5" />
  </svg>
);

const CalculatorIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = C.gold,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="5" y="3" width="22" height="26" rx="3" stroke={color} strokeWidth="2" />
    <rect x="9" y="7" width="14" height="5" rx="1" stroke={color} strokeWidth="1.5" />
    {[0, 1, 2].map((row) =>
      [0, 1, 2].map((col) => (
        <circle
          key={`${row}-${col}`}
          cx={10 + col * 6}
          cy={17 + row * 5}
          r="1.25"
          fill={color}
        />
      )),
    )}
  </svg>
);

const ArchiveIcon: React.FC<{size?: number; color?: string}> = ({
  size = 30,
  color = C.emerald,
}) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <path
      d="M4 9.5h26v19H4zM2.5 5h29v6h-29z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 16h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path
      d="m12 22 3.1 3 6.5-6.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Backdrop: React.FC<{frame: number; cameraX: number}> = ({
  frame,
  cameraX,
}) => {
  const intro = smooth(frame, 0, 85);
  const drift = (frame * 0.18 + cameraX * 0.035) % 48;
  const glow = 50 + Math.sin(frame / 150) * 2;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at ${glow}% 46%, rgba(47,99,255,.09), transparent 31%),
          radial-gradient(circle at 78% 62%, rgba(10,158,114,.07), transparent 27%),
          linear-gradient(135deg, ${C.ivory}, #f8f6f0 46%, ${C.ivoryDeep})
        `,
        opacity: intro,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.42,
          backgroundImage: `
            linear-gradient(rgba(20,38,58,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,38,58,.055) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          backgroundPosition: `${-cameraX * 0.08}px ${drift}px`,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 18%, black 84%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -80 - cameraX * 0.025,
          top: 232,
          width: 2250,
          height: 1,
          background: rgba(C.ink, 0.1),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -120 + cameraX * 0.018,
          bottom: 157,
          width: 2280,
          height: 1,
          background: rgba(C.ink, 0.11),
        }}
      />
      {Array.from({length: 22}).map((_, index) => {
        const x = ((index * 223 + 91) % 2000) - 40 - cameraX * 0.018;
        const y = 155 + ((index * 137) % 735);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: index % 4 === 0 ? 4 : 2,
              height: index % 4 === 0 ? 4 : 2,
              borderRadius: "50%",
              background: rgba(index % 3 === 0 ? C.cobalt : C.ink, 0.15),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Conveyor: React.FC<{frame: number}> = ({frame}) => {
  const beltOffset = (frame * 4.2) % 150;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: -350,
          top: 500,
          width: 6750,
          height: 300,
          background: "#d8d8d2",
          borderTop: `5px solid ${C.ink}`,
          borderBottom: `5px solid ${C.ink}`,
          boxShadow: "0 32px 58px rgba(20,38,58,.14)",
          transform: "skewX(-7deg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "20px 0",
            background: `
              repeating-linear-gradient(
                90deg,
                #ecebe5 0px,
                #ecebe5 114px,
                #c9cbc6 116px,
                #c9cbc6 121px,
                #ecebe5 124px,
                #ecebe5 150px
              )
            `,
            backgroundPositionX: beltOffset,
            borderTop: "1px solid rgba(20,38,58,.16)",
            borderBottom: "1px solid rgba(20,38,58,.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 145,
            height: 2,
            background: rgba(C.ink, 0.12),
          }}
        />
        {Array.from({length: 38}).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: index * 180 + 40 + beltOffset,
              top: 141,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.inkFaint,
              boxShadow: "0 0 0 4px rgba(255,255,255,.46)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: -300,
          top: 812,
          width: 6650,
          height: 36,
          background:
            "repeating-linear-gradient(90deg, #304a5e 0 36px, #20374b 36px 72px)",
          transform: "skewX(-7deg)",
          opacity: 0.78,
        }}
      />
      {Array.from({length: 28}).map((_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: index * 240,
            top: 835,
            width: 18,
            height: 142,
            background: C.ink,
            transform: "skewX(-7deg)",
            opacity: 0.72,
          }}
        />
      ))}
    </>
  );
};

const StationLabel: React.FC<{
  x: number;
  index: string;
  title: string;
  color: string;
  active: boolean;
}> = ({x, index, title, color, active}) => (
  <div
    style={{
      position: "absolute",
      left: x - 300,
      top: 205,
      width: 600,
      display: "flex",
      alignItems: "center",
      gap: 18,
      opacity: active ? 1 : 0.5,
      transform: `translateY(${active ? 0 : 7}px)`,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 13,
        display: "grid",
        placeItems: "center",
        background: active ? color : rgba(C.ink, 0.05),
        color: active ? C.white : C.inkSoft,
        fontFamily: MONO,
        fontSize: 17,
        fontWeight: 800,
        boxShadow: active ? `0 12px 26px ${rgba(color, 0.22)}` : undefined,
      }}
    >
      {index}
    </div>
    <div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 23,
          fontWeight: 850,
          letterSpacing: 1.8,
          color: C.ink,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 5,
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: active ? color : C.inkFaint,
        }}
      >
        {active ? "CONTROL ACTIVE" : "STANDBY"}
      </div>
    </div>
    <div
      style={{
        flex: 1,
        height: 2,
        background: `linear-gradient(90deg, ${rgba(color, active ? 0.75 : 0.16)}, transparent)`,
      }}
    />
  </div>
);

const ScanStation: React.FC<{frame: number}> = ({frame}) => {
  const active = frame >= 70 && frame < 335;
  const scan = linear(frame, 135, 300);
  const beamY = 455 + scan * 340;
  const reveal = smooth(frame, 38, 120);
  const dataOpacity = windowOpacity(frame, 145, 185, 300, 335);

  return (
    <>
      <StationLabel
        x={900}
        index="01"
        title="OCR DATA EXTRACTION"
        color={C.cobalt}
        active={active}
      />
      <div
        style={{
          position: "absolute",
          left: 642,
          top: 318,
          width: 516,
          height: 500,
          opacity: reveal,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 44,
            height: 482,
            borderRadius: "18px 18px 7px 7px",
            background: C.ink,
            boxShadow: "12px 14px 30px rgba(20,38,58,.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 44,
            height: 482,
            borderRadius: "18px 18px 7px 7px",
            background: C.ink,
            boxShadow: "12px 14px 30px rgba(20,38,58,.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 64,
            borderRadius: 18,
            background: C.ink,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            color: C.white,
            boxShadow: "0 18px 30px rgba(20,38,58,.15)",
          }}
        >
          <ScanIcon size={30} color={C.white} />
          <div
            style={{
              marginLeft: 13,
              fontFamily: DISPLAY,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            DOCUMENT CAPTURE
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: active ? C.cobalt : C.inkFaint,
              boxShadow: active ? `0 0 0 8px ${rgba(C.cobalt, 0.2)}` : undefined,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 610,
          top: beamY,
          width: 580,
          height: 7,
          opacity: active ? 0.9 : 0,
          background: C.cobalt,
          boxShadow: `0 0 18px 5px ${rgba(C.cobalt, 0.35)}, 0 0 58px 22px ${rgba(
            C.cobalt,
            0.14,
          )}`,
          transform: "skewX(-7deg)",
        }}
      />
      {["TAX ID", "INVOICE NO.", "NET", "VAT", "TOTAL"].map((label, index) => {
        const local = smooth(frame, 155 + index * 17, 190 + index * 17);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 1185 + index * 98,
              top: 370 - index * 24,
              minWidth: 98,
              height: 42,
              padding: "0 14px",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: C.white,
              border: `2px solid ${rgba(C.cobalt, 0.42)}`,
              boxShadow: "0 12px 24px rgba(20,38,58,.12)",
              color: C.cobaltDeep,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.9,
              opacity: dataOpacity * local,
              transform: `translate(${(1 - local) * -80}px, ${(1 - local) * 65}px) scale(${
                0.86 + local * 0.14
              })`,
            }}
          >
            {label}
          </div>
        );
      })}
    </>
  );
};

const IdentityStation: React.FC<{frame: number}> = ({frame}) => {
  const active = frame >= 300 && frame < 560;
  const reveal = smooth(frame, 320, 390);
  const match = smooth(frame, 440, 500);
  const pulse = 0.65 + Math.sin(frame / 8) * 0.14;

  return (
    <>
      <StationLabel
        x={2000}
        index="02"
        title="TAX ID VALIDATION"
        color={C.cyan}
        active={active}
      />
      <div
        style={{
          position: "absolute",
          left: 1585,
          top: 304,
          width: 830,
          height: 172,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: reveal,
        }}
      >
        {[
          {
            label: "INVOICE RECORD",
            value: "TX-91•••-4402",
            sub: "SUPPLIER SUBMISSION",
          },
          {
            label: "TAX REGISTRY",
            value: "TX-91•••-4402",
            sub: "ACTIVE · VERIFIED",
          },
        ].map((card, index) => (
          <div
            key={card.label}
            style={{
              width: 312,
              height: 150,
              borderRadius: 18,
              background: C.white,
              border: `2px solid ${rgba(index === 0 ? C.cobalt : C.cyan, 0.3)}`,
              boxShadow: "0 18px 36px rgba(20,38,58,.12)",
              padding: "24px 27px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.6,
                color: C.inkFaint,
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: MONO,
                fontSize: 25,
                fontWeight: 850,
                color: C.ink,
                letterSpacing: 0.6,
              }}
            >
              {card.value}
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: DISPLAY,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.3,
                color: index === 0 ? C.cobalt : C.emerald,
              }}
            >
              {card.sub}
            </div>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 352,
            top: 45,
            width: 126,
            height: 62,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 30,
              height: 3,
              background: `linear-gradient(90deg, ${C.cobalt}, ${C.cyan})`,
              transform: `scaleX(${match})`,
            }}
          />
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: 12 + index * 33,
                top: 24,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: index < 3 ? C.cobalt : C.cyan,
                opacity: index === 3 ? pulse : 0.88,
                transform: `scale(${match})`,
              }}
            />
          ))}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: C.white,
              border: `2px solid ${C.cyan}`,
              opacity: match,
              transform: `scale(${0.7 + match * 0.3})`,
              boxShadow: `0 0 0 10px ${rgba(C.cyan, 0.13)}`,
              zIndex: 2,
            }}
          >
            <LinkIcon size={28} />
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1780,
          top: 815,
          width: 440,
          height: 54,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: C.ink,
          color: C.white,
          fontFamily: DISPLAY,
          fontSize: 18,
          fontWeight: 850,
          letterSpacing: 2,
          opacity: match,
          transform: `translateY(${(1 - match) * 18}px)`,
          boxShadow: "0 16px 28px rgba(20,38,58,.16)",
        }}
      >
        <CheckIcon color={C.cyan} size={24} />
        TAX ID MATCH
      </div>
    </>
  );
};

const DuplicateStation: React.FC<{frame: number}> = ({frame}) => {
  const active = frame >= 530 && frame < 790;
  const reveal = smooth(frame, 550, 610);
  const compare = smooth(frame, 610, 680);
  const isolate = smooth(frame, 680, 755);
  const scanX = interpolate(frame % 90, [0, 89], [-80, 340]);

  return (
    <>
      <StationLabel
        x={3100}
        index="03"
        title="DUPLICATE CONTROL"
        color={C.coral}
        active={active}
      />
      <div
        style={{
          position: "absolute",
          left: 2745,
          top: 300,
          width: 710,
          height: 185,
          borderRadius: 22,
          background: rgba(C.white, 0.9),
          border: `2px solid ${rgba(C.coral, active ? 0.28 : 0.13)}`,
          boxShadow: "0 18px 38px rgba(20,38,58,.1)",
          opacity: reveal,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: scanX,
            top: 0,
            width: 90,
            bottom: 0,
            transform: "skewX(-18deg)",
            background: `linear-gradient(90deg, transparent, ${rgba(C.coral, 0.16)}, transparent)`,
            opacity: active ? 1 : 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 31,
            top: 28,
            width: 230,
            height: 126,
            borderRadius: 13,
            background: C.paper,
            border: `1px solid ${rgba(C.ink, 0.16)}`,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 800,
              color: C.inkFaint,
              letterSpacing: 1.2,
            }}
          >
            HERO RECORD
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 850,
              color: C.ink,
            }}
          >
            INV-2048-A
          </div>
          <div
            style={{
              marginTop: 12,
              width: 112,
              height: 7,
              borderRadius: 8,
              background: C.cobalt,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: 31,
            top: 28,
            width: 230,
            height: 126,
            borderRadius: 13,
            background: C.paper,
            border: `2px solid ${rgba(C.coral, 0.52)}`,
            padding: "18px 20px",
            transform: `translateX(${(1 - compare) * 45}px)`,
            opacity: compare,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 800,
              color: C.coral,
              letterSpacing: 1.2,
            }}
          >
            MATCH FOUND
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 850,
              color: C.coralDeep,
            }}
          >
            INV-2048-A
          </div>
          <div
            style={{
              marginTop: 12,
              width: 112,
              height: 7,
              borderRadius: 8,
              background: C.coral,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 286,
            top: 62,
            width: 138,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: C.coralDeep,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 900,
            opacity: compare,
          }}
        >
          <CopyIcon size={27} />
          100% MATCH
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 3230,
          top: 815,
          width: 430,
          height: 160,
          borderRadius: "0 0 26px 26px",
          border: `3px solid ${C.coral}`,
          borderTop: 0,
          background: rgba(C.coral, 0.07),
          transform: "skewX(-7deg)",
          opacity: smooth(frame, 610, 680),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 22,
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: 2,
            color: C.coralDeep,
          }}
        >
          DUPLICATE · REVIEW
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 3035,
          top: 820,
          width: 640,
          height: 6,
          background: `linear-gradient(90deg, ${rgba(C.coral, 0)}, ${C.coral}, ${rgba(
            C.coral,
            0,
          )})`,
          transform: `rotate(${isolate * 14}deg)`,
          transformOrigin: "50% 50%",
          opacity: isolate,
        }}
      />
    </>
  );
};

const VatStation: React.FC<{frame: number}> = ({frame}) => {
  const active = frame >= 760 && frame < 1035;
  const reveal = smooth(frame, 785, 850);
  const net = smooth(frame, 840, 890);
  const tax = smooth(frame, 880, 935);
  const total = smooth(frame, 925, 985);

  return (
    <>
      <StationLabel
        x={4200}
        index="04"
        title="VAT RECONCILIATION"
        color={C.gold}
        active={active}
      />
      <div
        style={{
          position: "absolute",
          left: 3790,
          top: 298,
          width: 820,
          height: 188,
          borderRadius: 22,
          background: C.ink,
          boxShadow: "0 22px 42px rgba(20,38,58,.2)",
          opacity: reveal,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 26,
            width: 48,
            height: 48,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            background: rgba(C.gold, 0.12),
          }}
        >
          <CalculatorIcon color={C.gold} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 95,
            top: 28,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.6,
            color: rgba(C.white, 0.56),
          }}
        >
          AUTOMATED VAT EQUATION
        </div>
        <div
          style={{
            position: "absolute",
            left: 94,
            top: 57,
            fontFamily: DISPLAY,
            fontSize: 23,
            fontWeight: 850,
            letterSpacing: 1.4,
            color: C.white,
          }}
        >
          NET + VAT = INVOICE TOTAL
        </div>
        {[
          {label: "NET", value: "12,500.00", left: 95, opacity: net},
          {label: "VAT 11%", value: "1,375.00", left: 315, opacity: tax},
          {label: "TOTAL", value: "13,875.00", left: 550, opacity: total},
        ].map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 ? (
              <div
                style={{
                  position: "absolute",
                  left: item.left - 35,
                  top: 116,
                  color: index === 1 ? C.gold : C.emerald,
                  fontFamily: MONO,
                  fontSize: 28,
                  fontWeight: 900,
                  opacity: item.opacity,
                }}
              >
                {index === 1 ? "+" : "="}
              </div>
            ) : null}
            <div
              style={{
                position: "absolute",
                left: item.left,
                top: 106,
                opacity: item.opacity,
                transform: `translateY(${(1 - item.opacity) * 15}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  color: index === 2 ? C.emerald : rgba(C.white, 0.45),
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  marginTop: 7,
                  fontFamily: MONO,
                  fontSize: 23,
                  fontWeight: 850,
                  color: index === 2 ? C.emerald : C.white,
                }}
              >
                {item.value}
              </div>
            </div>
          </React.Fragment>
        ))}
        <div
          style={{
            position: "absolute",
            right: 24,
            top: 24,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: total > 0.98 ? C.emerald : C.gold,
            boxShadow: `0 0 0 8px ${rgba(total > 0.98 ? C.emerald : C.gold, 0.15)}`,
          }}
        />
      </div>
    </>
  );
};

const ArchiveStation: React.FC<{frame: number}> = ({frame}) => {
  const active = frame >= 1000;
  const reveal = smooth(frame, 1000, 1060);
  const door = smooth(frame, 1070, 1130);

  return (
    <>
      <StationLabel
        x={5000}
        index="05"
        title="AUDIT REPORT"
        color={C.emerald}
        active={active}
      />
      <div
        style={{
          position: "absolute",
          left: 4728,
          top: 322,
          width: 544,
          height: 486,
          borderRadius: "28px 28px 10px 10px",
          background: C.ink,
          boxShadow: "0 26px 50px rgba(20,38,58,.2)",
          opacity: reveal,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 31,
            top: 28,
            width: 58,
            height: 58,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: rgba(C.emerald, 0.16),
          }}
        >
          <ArchiveIcon size={34} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 108,
            top: 34,
            fontFamily: DISPLAY,
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: 2,
            color: C.white,
          }}
        >
          VERIFIED LEDGER
        </div>
        <div
          style={{
            position: "absolute",
            left: 109,
            top: 69,
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: rgba(C.white, 0.48),
          }}
        >
          APPEND-ONLY AUDIT ARCHIVE
        </div>
        <div
          style={{
            position: "absolute",
            left: 41,
            right: 41,
            top: 128,
            height: 20,
            borderRadius: 11,
            background: "#07141f",
            boxShadow: `inset 0 0 0 2px ${rgba(C.emerald, 0.36)}`,
          }}
        />
        {Array.from({length: 6}).map((_, index) => {
          const row = smooth(frame, 1055 + index * 11, 1090 + index * 11);
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: 44,
                right: 44,
                top: 188 + index * 43,
                height: 31,
                display: "flex",
                alignItems: "center",
                padding: "0 13px",
                borderRadius: 7,
                background: index === 0 ? rgba(C.emerald, 0.14) : rgba(C.white, 0.05),
                color: C.white,
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                opacity: row,
                transform: `translateX(${(1 - row) * 25}px)`,
              }}
            >
              <span style={{color: index === 0 ? C.emerald : rgba(C.white, 0.45)}}>
                {String(2048 - index).padStart(6, "0")}
              </span>
              <span style={{marginLeft: 28}}>TX-{91 - index}•••-{4402 - index * 31}</span>
              <span style={{marginLeft: "auto", color: C.emerald}}>VERIFIED</span>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 108,
            background: `linear-gradient(180deg, transparent, ${rgba(C.emerald, 0.16)})`,
            transform: `translateY(${(1 - door) * 70}px)`,
          }}
        />
      </div>
    </>
  );
};

const InvoiceLines: React.FC<{
  frame: number;
  accent: string;
  compact?: boolean;
}> = ({frame, accent, compact = false}) => {
  const rows = compact ? 3 : 4;
  return (
    <>
      {Array.from({length: rows}).map((_, index) => {
        const row = smooth(frame, 115 + index * 13, 150 + index * 13);
        return (
          <div
            key={index}
            style={{
              height: compact ? 17 : 25,
              display: "grid",
              gridTemplateColumns: "1.7fr .55fr .65fr",
              alignItems: "center",
              borderBottom: `1px solid ${rgba(C.ink, 0.1)}`,
              fontFamily: MONO,
              fontSize: compact ? 6 : 9,
              fontWeight: 700,
              color: C.inkSoft,
              opacity: row,
              transform: `translateX(${(1 - row) * -16}px)`,
            }}
          >
            <span>
              {["CONSULTING SERVICE", "SOFTWARE LICENSE", "DATA PROCESSING", "SERVICE CREDIT"][index]}
            </span>
            <span style={{textAlign: "right"}}>{["5,000", "4,200", "3,600", "-300"][index]}</span>
            <span style={{textAlign: "right", color: index === rows - 1 ? accent : C.ink}}>
              {["5,550", "4,662", "3,996", "-333"][index]}
            </span>
          </div>
        );
      })}
    </>
  );
};

const HeroInvoice: React.FC<{frame: number; x: number}> = ({frame, x}) => {
  const entry = smooth(frame, 55, 155);
  const active = activeStage(frame);
  const scanHighlight = windowOpacity(frame, 130, 165, 290, 330);
  const taxHighlight = windowOpacity(frame, 360, 410, 525, 565);
  const duplicateHighlight = windowOpacity(frame, 585, 625, 750, 800);
  const vatHighlight = windowOpacity(frame, 805, 850, 1000, 1040);
  const stamp = smooth(frame, 1005, 1080);
  const archive = smooth(frame, 1080, 1160);
  const panelClearance = smooth(frame, 250, 330);
  const bob = Math.sin(frame / 22) * 3;
  const rotation = interpolate(
    frame,
    [0, 180, 390, 620, 850, 1080, 1199],
    [-5, -1.4, 0.8, -0.6, 0.7, -1.2, -1.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    },
  );
  const scale = 0.68 + entry * 0.16 - panelClearance * 0.04 - archive * 0.07;
  const lift = entry * -10 - archive * 24;
  const accent = active.color;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 310,
        top: 440 + bob + lift,
        width: 620,
        height: 376,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "50% 50%",
        opacity: entry,
        zIndex: 30,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          background: C.paper,
          border: `1px solid ${rgba(C.ink, 0.17)}`,
          boxShadow: "0 30px 54px rgba(20,38,58,.23), 0 7px 15px rgba(20,38,58,.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 16,
            background: accent,
            transition: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 38,
            right: 32,
            top: 24,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: DISPLAY,
                fontSize: 21,
                fontWeight: 900,
                letterSpacing: 2.2,
                color: C.ink,
              }}
            >
              E-TAX INVOICE
              <span
                style={{
                  padding: "4px 8px 3px",
                  borderRadius: 5,
                  background: rgba(accent, 0.12),
                  color: accent,
                  fontFamily: MONO,
                  fontSize: 8,
                  letterSpacing: 1,
                }}
              >
                AI AUDIT
              </span>
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: MONO,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: C.inkFaint,
              }}
            >
              SUPPLIER DOCUMENT · DIGITAL ORIGINAL
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              textAlign: "right",
              fontFamily: MONO,
              color: C.ink,
            }}
          >
            <div style={{fontSize: 8, color: C.inkFaint, fontWeight: 800}}>INVOICE NO.</div>
            <div style={{marginTop: 6, fontSize: 19, fontWeight: 900}}>INV-2048-A</div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 38,
            right: 32,
            top: 94,
            height: 68,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderTop: `1px solid ${rgba(C.ink, 0.14)}`,
            borderBottom: `1px solid ${rgba(C.ink, 0.14)}`,
          }}
        >
          {[
            ["SUPPLIER TAX ID", "TX-91•••-4402"],
            ["ISSUE DATE", "2026-07-27"],
            ["DUE DATE", "2026-08-26"],
          ].map(([label, value], index) => (
            <div
              key={label}
              style={{
                padding: "13px 17px",
                borderRight: index < 2 ? `1px solid ${rgba(C.ink, 0.1)}` : undefined,
                background:
                  index === 0 && taxHighlight > 0
                    ? rgba(C.cyan, taxHighlight * 0.13)
                    : index === 0 && scanHighlight > 0
                      ? rgba(C.cobalt, scanHighlight * 0.1)
                      : undefined,
                boxShadow:
                  index === 0 && taxHighlight > 0
                    ? `inset 0 -3px 0 ${rgba(C.cyan, taxHighlight)}`
                    : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 7,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: C.inkFaint,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 850,
                  color: index === 0 && taxHighlight > 0 ? C.cyan : C.ink,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 175,
            width: 366,
          }}
        >
          <div
            style={{
              height: 23,
              display: "grid",
              gridTemplateColumns: "1.7fr .55fr .65fr",
              alignItems: "center",
              borderBottom: `2px solid ${C.ink}`,
              fontFamily: MONO,
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: 0.7,
              color: C.inkFaint,
            }}
          >
            <span>DESCRIPTION</span>
            <span style={{textAlign: "right"}}>NET</span>
            <span style={{textAlign: "right"}}>GROSS</span>
          </div>
          <InvoiceLines frame={frame} accent={accent} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 32,
            top: 175,
            width: 155,
            borderRadius: 10,
            overflow: "hidden",
            border: `1px solid ${rgba(C.ink, 0.13)}`,
            background:
              vatHighlight > 0 ? rgba(C.gold, vatHighlight * 0.13) : C.white,
            boxShadow:
              vatHighlight > 0
                ? `inset 0 0 0 2px ${rgba(C.gold, vatHighlight * 0.66)}`
                : undefined,
          }}
        >
          {[
            ["NET", "12,500.00"],
            ["VAT 11%", "1,375.00"],
            ["TOTAL", "13,875.00"],
          ].map(([label, value], index) => (
            <div
              key={label}
              style={{
                height: index === 2 ? 58 : 47,
                padding: "10px 13px",
                borderBottom: index < 2 ? `1px solid ${rgba(C.ink, 0.1)}` : undefined,
                background: index === 2 ? C.ink : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 6,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: index === 2 ? rgba(C.white, 0.55) : C.inkFaint,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontFamily: MONO,
                  fontSize: index === 2 ? 16 : 13,
                  fontWeight: 900,
                  color: index === 2 ? C.white : C.ink,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 38,
            bottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 9,
            color:
              duplicateHighlight > 0
                ? C.coral
                : scanHighlight > 0
                  ? C.cobalt
                  : C.inkFaint,
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 850,
            letterSpacing: 0.8,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "currentColor",
            }}
          />
          {duplicateHighlight > 0
            ? "PRIMARY RECORD RETAINED"
            : scanHighlight > 0
              ? "MACHINE-READABLE SOURCE"
              : "AUDIT TRACE · 7F2A-91C8"}
        </div>
        <div
          style={{
            position: "absolute",
            right: 32,
            bottom: 20,
            width: 76,
            height: 30,
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 2,
            opacity: 0.58,
          }}
        >
          {Array.from({length: 24}).map((_, index) => (
            <div
              key={index}
              style={{
                background: (index * 7) % 5 < 2 ? C.ink : "transparent",
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            border: `3px solid ${rgba(accent, scanHighlight * 0.45)}`,
            borderRadius: 12,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 28,
          width: 190,
          height: 72,
          border: `4px solid ${C.emerald}`,
          color: C.emeraldDeep,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 19,
          fontWeight: 950,
          letterSpacing: 2,
          lineHeight: 1.05,
          transform: `rotate(-7deg) scale(${0.68 + stamp * 0.32})`,
          opacity: stamp,
          boxShadow: `inset 0 0 0 2px ${rgba(C.emerald, 0.18)}`,
        }}
      >
        TAX RECORD
        <br />
        VERIFIED
      </div>
    </div>
  );
};

const AmbientInvoice: React.FC<{
  frame: number;
  x: number;
  y: number;
  scale: number;
  tint: string;
  label: string;
}> = ({frame, x, y, scale, tint, label}) => {
  const bob = Math.sin(frame / 27 + x * 0.01) * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        width: 260,
        height: 164,
        borderRadius: 7,
        background: C.paper,
        border: `1px solid ${rgba(C.ink, 0.13)}`,
        boxShadow: "0 16px 28px rgba(20,38,58,.13)",
        transform: `rotate(-2deg) scale(${scale})`,
        opacity: 0.72,
        zIndex: 12,
        overflow: "hidden",
      }}
    >
      <div style={{height: 9, background: tint}} />
      <div
        style={{
          padding: "18px 20px",
          fontFamily: MONO,
          color: C.ink,
        }}
      >
        <div style={{fontSize: 8, fontWeight: 900, letterSpacing: 1.2}}>E-TAX INVOICE</div>
        <div style={{marginTop: 10, fontSize: 14, fontWeight: 900}}>{label}</div>
        <div style={{marginTop: 14}}>
          <InvoiceLines frame={1200} accent={tint} compact />
        </div>
      </div>
    </div>
  );
};

const DuplicatePacket: React.FC<{frame: number}> = ({frame}) => {
  const appear = windowOpacity(frame, 570, 620, 785, 830);
  const divert = smooth(frame, 665, 755);
  const left = 3100 - 130 + divert * 320;
  const top = 485 + divert * 245;
  const rotate = -5 + divert * 19;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 260,
        height: 164,
        borderRadius: 8,
        background: C.paper,
        border: `3px solid ${C.coral}`,
        boxShadow: `0 18px 32px ${rgba(C.coral, 0.2)}`,
        transform: `rotate(${rotate}deg) scale(${1 - divert * 0.17})`,
        opacity: appear,
        zIndex: 34,
        overflow: "hidden",
      }}
    >
      <div style={{height: 11, background: C.coral}} />
      <div style={{padding: "17px 20px"}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: C.coralDeep,
          }}
        >
          DUPLICATE INVOICE
        </div>
        <div
          style={{
            marginTop: 13,
            fontFamily: MONO,
            fontSize: 19,
            fontWeight: 900,
            color: C.ink,
          }}
        >
          INV-2048-A
        </div>
        <div
          style={{
            marginTop: 11,
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 800,
            color: C.coral,
            letterSpacing: 1,
          }}
        >
          IDENTICAL HASH · REVIEW
        </div>
      </div>
    </div>
  );
};

const WorldScene: React.FC<{frame: number; cameraX: number; invoiceX: number}> = ({
  frame,
  cameraX,
  invoiceX,
}) => {
  const worldScale = 1 + Math.sin(frame / 180) * 0.003;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 6200,
        height: 1080,
        transform: `translate3d(${-cameraX}px, 0, 0) scale(${worldScale})`,
        transformOrigin: `${cameraX + 960}px 540px`,
      }}
    >
      <Conveyor frame={frame} />
      <AmbientInvoice
        frame={frame}
        x={invoiceX - 1040}
        y={570}
        scale={0.76}
        tint={C.cyan}
        label="INV-2046-Q"
      />
      <AmbientInvoice
        frame={frame}
        x={invoiceX - 1540}
        y={590}
        scale={0.68}
        tint={C.gold}
        label="INV-2045-P"
      />
      <AmbientInvoice
        frame={frame}
        x={invoiceX + 920}
        y={604}
        scale={0.62}
        tint={C.emerald}
        label="INV-2049-B"
      />
      <ScanStation frame={frame} />
      <IdentityStation frame={frame} />
      <DuplicateStation frame={frame} />
      <VatStation frame={frame} />
      <ArchiveStation frame={frame} />
      <DuplicatePacket frame={frame} />
      <HeroInvoice frame={frame} x={invoiceX} />
    </div>
  );
};

const Header: React.FC<{frame: number; stage: Stage}> = ({frame, stage}) => {
  const reveal = smooth(frame, 22, 100);
  const processed = Math.min(13, Math.floor(linear(frame, 150, 1040) * 14));
  const verified = Math.min(12, Math.floor(linear(frame, 260, 1060) * 13));

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        top: 44,
        height: 116,
        display: "flex",
        alignItems: "flex-start",
        opacity: reveal,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: 14,
          height: 83,
          borderRadius: 7,
          background: stage.color,
          boxShadow: `0 10px 24px ${rgba(stage.color, 0.22)}`,
        }}
      />
      <div style={{marginLeft: 22}}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 47,
            fontWeight: 950,
            letterSpacing: 2.1,
            lineHeight: 0.92,
            color: C.ink,
          }}
        >
          AUTOMATED TAX INVOICE AUDIT
        </div>
        <div
          style={{
            marginTop: 15,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.7,
            color: C.inkSoft,
          }}
        >
          AI DOCUMENT CONTROL · E-INVOICE COMPLIANCE · BATCH TX-2048
        </div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          height: 78,
          display: "flex",
          alignItems: "center",
          gap: 34,
          padding: "0 26px",
          borderRadius: 18,
          background: rgba(C.white, 0.76),
          border: `1px solid ${rgba(C.ink, 0.11)}`,
          boxShadow: "0 14px 26px rgba(20,38,58,.08)",
          fontFamily: MONO,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: C.inkFaint,
            }}
          >
            PROCESSED
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 900,
              color: C.ink,
            }}
          >
            {String(processed).padStart(2, "0")}
          </div>
        </div>
        <div style={{width: 1, height: 40, background: rgba(C.ink, 0.12)}} />
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: C.inkFaint,
            }}
          >
            VERIFIED
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 900,
              color: C.emerald,
            }}
          >
            {String(verified).padStart(2, "0")}
          </div>
        </div>
        <div style={{width: 1, height: 40, background: rgba(C.ink, 0.12)}} />
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: C.inkFaint,
            }}
          >
            EXCEPTIONS
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 900,
              color: frame >= 680 ? C.coral : C.inkFaint,
            }}
          >
            {frame >= 680 ? "01" : "00"}
          </div>
        </div>
      </div>
    </div>
  );
};

const StageHero: React.FC<{frame: number; stage: Stage}> = ({frame, stage}) => {
  const stageStart = stage.start;
  const appear = smooth(frame, stageStart - 20, stageStart + 20);
  const finalHandoff =
    stage.key === "report" ? 1 - smooth(frame, 1050, 1100) : 1;
  const transitionBoundary = [300, 530, 760, 1000].find(
    (boundary) => Math.abs(frame - boundary) <= 16,
  );
  const transitionCover = transitionBoundary
    ? frame <= transitionBoundary
      ? smooth(frame, transitionBoundary - 16, transitionBoundary)
      : 1 - smooth(frame, transitionBoundary, transitionBoundary + 16)
    : 0;
  const settle =
    stage.key === "report"
      ? smooth(frame, 1030, 1090)
      : smooth(frame, stageStart + 55, stageStart + 105);
  const liveStatus =
    stage.key === "extract"
      ? frame < 205
        ? "READING INVOICE FIELDS"
        : "INVOICE DATA EXTRACTED"
      : stage.key === "identity"
        ? frame < 475
          ? "MATCHING SUPPLIER TAX ID"
          : "TAX ID MATCHED"
        : stage.key === "duplicate"
          ? frame < 705
            ? "DUPLICATE RECORD DETECTED"
            : "DUPLICATE ISOLATED"
          : stage.key === "vat"
            ? frame < 955
              ? "RECALCULATING VAT"
              : "VAT CALCULATION VERIFIED"
            : frame < 1065
              ? "WRITING AUDIT RECORD"
              : "TAX RECORD VERIFIED";

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 178,
        minWidth: 490,
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 15,
        opacity: appear * finalHandoff,
        transform: `translateY(${(1 - appear) * 12}px)`,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: stage.color,
          display: "grid",
          placeItems: "center",
          color: C.white,
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 900,
          boxShadow: `0 10px 22px ${rgba(stage.color, 0.22)}`,
        }}
      >
        {stage.index}
      </div>
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 850,
            letterSpacing: 1.7,
            color: C.inkFaint,
          }}
        >
          CURRENT CONTROL · {stage.label}
        </div>
        <div
          style={{
            marginTop: 5,
            fontFamily: DISPLAY,
            fontSize: stage.key === "report" ? 29 : 25,
            fontWeight: 950,
            letterSpacing: 1.6,
            color: settle > 0.35 ? stage.color : C.ink,
          }}
        >
          {liveStatus}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${transitionCover * 690}px`,
          height: 64,
          borderRadius: 12,
          background: C.ivory,
          borderTop: transitionCover > 0 ? `3px solid ${stage.color}` : undefined,
          boxShadow:
            transitionCover > 0
              ? `10px 0 18px ${rgba(stage.color, 0.08)}`
              : undefined,
          zIndex: 4,
        }}
      />
    </div>
  );
};

const ProcessRail: React.FC<{frame: number; stage: Stage}> = ({frame, stage}) => {
  const reveal = smooth(frame, 95, 165);
  const progress = clamp01(
    0.03 +
      0.21 * smooth(frame, 100, 285) +
      0.2 * smooth(frame, 300, 515) +
      0.2 * smooth(frame, 530, 745) +
      0.22 * smooth(frame, 760, 980) +
      0.14 * smooth(frame, 995, 1085),
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        bottom: 50,
        height: 116,
        borderRadius: 22,
        background: rgba(C.white, 0.84),
        border: `1px solid ${rgba(C.ink, 0.13)}`,
        boxShadow: "0 18px 42px rgba(20,38,58,.11)",
        opacity: reveal,
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 27,
          height: 5,
          borderRadius: 5,
          background: rgba(C.ink, 0.1),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 5,
            background: `linear-gradient(90deg, ${C.cobalt}, ${C.cyan} 33%, ${C.gold} 68%, ${C.emerald})`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 48,
          bottom: 18,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
        }}
      >
        {STAGES.map((item, index) => {
          const done = STAGES.findIndex((entry) => entry.key === stage.key) > index;
          const current = item.key === stage.key;
          return (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                paddingLeft: index === 0 ? 0 : 23,
                borderLeft: index > 0 ? `1px solid ${rgba(C.ink, 0.11)}` : undefined,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: done || current ? item.color : rgba(C.ink, 0.06),
                  color: done || current ? C.white : C.inkFaint,
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 900,
                }}
              >
                {done ? <CheckIcon size={19} color={C.white} /> : item.index}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: 1.2,
                    color: current ? item.color : done ? C.ink : C.inkFaint,
                  }}
                >
                  {item.short}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: MONO,
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: C.inkFaint,
                  }}
                >
                  {done ? "COMPLETE" : current ? "IN PROGRESS" : "QUEUED"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FinalSummary: React.FC<{frame: number}> = ({frame}) => {
  const visible = windowOpacity(frame, 1030, 1090, 1136, 1199);
  const line = smooth(frame, 1070, 1120);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 250,
        width: 830,
        height: 176,
        transform: `translateX(-50%) translateY(${(1 - visible) * 18}px)`,
        borderRadius: 24,
        background: C.ink,
        boxShadow: "0 30px 60px rgba(20,38,58,.24)",
        opacity: visible,
        zIndex: 140,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 14,
          background: C.emerald,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 33,
          width: 64,
          height: 64,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background: rgba(C.emerald, 0.15),
          border: `1px solid ${rgba(C.emerald, 0.45)}`,
        }}
      >
        <CheckIcon size={38} color={C.emerald} strokeWidth={2.8} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 132,
          top: 29,
          fontFamily: DISPLAY,
          fontSize: 39,
          fontWeight: 950,
          letterSpacing: 2.3,
          color: C.white,
        }}
      >
        TAX RECORD VERIFIED
      </div>
      <div
        style={{
          position: "absolute",
          left: 134,
          top: 85,
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.25,
          color: rgba(C.white, 0.55),
        }}
      >
        13 PROCESSED · 12 VERIFIED · 1 DUPLICATE ISOLATED
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          right: 44,
          bottom: 28,
          height: 3,
          borderRadius: 3,
          background: rgba(C.white, 0.1),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${line * 100}%`,
            height: "100%",
            background: C.emerald,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 37,
          top: 36,
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 1.3,
          color: C.emerald,
          textAlign: "right",
        }}
      >
        AUDIT HASH
        <br />
        7F2A-91C8-4402
      </div>
    </div>
  );
};

const Finish: React.FC<{frame: number}> = ({frame}) => {
  const out = smooth(frame, 1135, TOTAL_FRAMES - 1);
  const scan = (frame * 2.2) % 1080;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 48%, rgba(20,38,58,.08) 100%)",
          zIndex: 190,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scan,
          height: 1,
          background: rgba(C.cobalt, 0.1),
          zIndex: 191,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: C.ink,
          opacity: out,
          zIndex: 200,
        }}
      />
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const stage = activeStage(frame);
  const invoiceX = invoiceXAt(frame);
  const cameraX = Math.max(0, Math.min(4140, invoiceX - 780));
  const sceneReveal = smooth(frame, 0, 75);
  const sceneBlur = interpolate(frame, [0, 105], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outroBlur = smooth(frame, 1135, TOTAL_FRAMES - 1) * 9;

  return (
    <AbsoluteFill
      style={{
        background: C.ivory,
        fontFamily: BODY,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${outroBlur}px)`,
        }}
      >
        <Backdrop frame={frame} cameraX={cameraX} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: sceneReveal,
            filter: `blur(${sceneBlur}px)`,
          }}
        >
          <WorldScene frame={frame} cameraX={cameraX} invoiceX={invoiceX} />
        </div>
        <Header frame={frame} stage={stage} />
        <StageHero frame={frame} stage={stage} />
        <ProcessRail frame={frame} stage={stage} />
        <FinalSummary frame={frame} />
      </div>
      <Finish frame={frame} />
    </AbsoluteFill>
  );
};
