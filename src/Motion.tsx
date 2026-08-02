import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const WIDTH = 1920;
const HEIGHT = 1080;

type Severity = "critical" | "warning" | "info" | "security";

type DialogSpec = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  appear: number;
  title: string;
  message: string;
  code: string;
  severity: Severity;
  buttons: string[];
  direction: -1 | 1;
  z: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const accents: Record<Severity, {main: string; soft: string; icon: string}> = {
  critical: {main: "#ff5f7d", soft: "rgba(255,95,125,0.2)", icon: "×"},
  warning: {main: "#f4c761", soft: "rgba(244,199,97,0.19)", icon: "!"},
  info: {main: "#68d8ff", soft: "rgba(104,216,255,0.18)", icon: "i"},
  security: {main: "#9c83ff", soft: "rgba(156,131,255,0.19)", icon: "◆"},
};

const dialogs: DialogSpec[] = [
  {
    id: "central",
    x: 565,
    y: 394,
    width: 790,
    height: 292,
    appear: 264,
    title: "CORE SERVICE — INITIALIZATION FAILED",
    message: "A protected process stopped responding before the secure workspace was ready.",
    code: "EVENT 0xA17 · RUNTIME_STATE_INVALID",
    severity: "critical",
    buttons: ["DETAILS", "DISMISS"],
    direction: -1,
    z: 20,
  },
  {
    id: "tile-01",
    x: -34,
    y: -24,
    width: 535,
    height: 310,
    appear: 359,
    title: "SECURITY EVENT",
    message: "An unsigned task requested elevated access to a protected memory region.",
    code: "POLICY_GUARD · 8F21",
    severity: "security",
    buttons: ["BLOCK", "REVIEW"],
    direction: -1,
    z: 101,
  },
  {
    id: "tile-02",
    x: 458,
    y: -24,
    width: 526,
    height: 310,
    appear: 405,
    title: "NETWORK SERVICE",
    message: "The encrypted channel closed before the handshake could be verified.",
    code: "TLS_ROUTE_TIMEOUT · 04",
    severity: "warning",
    buttons: ["RETRY", "OFFLINE"],
    direction: 1,
    z: 102,
  },
  {
    id: "tile-03",
    x: 942,
    y: -24,
    width: 526,
    height: 310,
    appear: 455,
    title: "MEMORY LIMIT",
    message: "The active workload exceeded the reserved high-performance memory pool.",
    code: "HEAP_CAPACITY · 99.8%",
    severity: "critical",
    buttons: ["FREE SPACE", "IGNORE"],
    direction: -1,
    z: 103,
  },
  {
    id: "tile-04",
    x: 1425,
    y: -24,
    width: 529,
    height: 310,
    appear: 510,
    title: "AUTHORIZATION",
    message: "Identity verification expired while the operation was still running.",
    code: "SESSION_TOKEN · EXPIRED",
    severity: "security",
    buttons: ["VERIFY", "CANCEL"],
    direction: 1,
    z: 104,
  },
  {
    id: "tile-05",
    x: -34,
    y: 258,
    width: 535,
    height: 318,
    appear: 378,
    title: "PROCESS INTERRUPTED",
    message: "The scheduler paused a task after receiving an unexpected system signal.",
    code: "SIGNAL 0x09 · INTERRUPT",
    severity: "critical",
    buttons: ["RESUME", "END TASK"],
    direction: 1,
    z: 105,
  },
  {
    id: "tile-06",
    x: 458,
    y: 258,
    width: 526,
    height: 318,
    appear: 420,
    title: "DATA CONFLICT",
    message: "Two synchronized versions contain incompatible state information.",
    code: "SYNC_BRANCH · DIVERGED",
    severity: "warning",
    buttons: ["COMPARE", "RESTORE"],
    direction: -1,
    z: 106,
  },
  {
    id: "tile-07",
    x: 942,
    y: 258,
    width: 526,
    height: 318,
    appear: 470,
    title: "STACK OVERFLOW",
    message: "A recursive process exceeded the maximum safe execution depth.",
    code: "CALL_DEPTH · 65,536",
    severity: "critical",
    buttons: ["TRACE", "TERMINATE"],
    direction: 1,
    z: 107,
  },
  {
    id: "tile-08",
    x: 1425,
    y: 258,
    width: 529,
    height: 318,
    appear: 534,
    title: "REMOTE ACCESS",
    message: "A new endpoint is attempting to join the protected workspace.",
    code: "NODE 24-C · UNTRUSTED",
    severity: "security",
    buttons: ["DENY", "INSPECT"],
    direction: -1,
    z: 108,
  },
  {
    id: "tile-09",
    x: -34,
    y: 548,
    width: 535,
    height: 304,
    appear: 414,
    title: "STORAGE OFFLINE",
    message: "The high-speed volume was disconnected during a write operation.",
    code: "VOLUME 07 · UNAVAILABLE",
    severity: "warning",
    buttons: ["MOUNT", "ABORT"],
    direction: -1,
    z: 109,
  },
  {
    id: "tile-10",
    x: 458,
    y: 548,
    width: 526,
    height: 304,
    appear: 448,
    title: "CACHE CORRUPTION",
    message: "Integrity verification failed for the most recent application cache.",
    code: "CHECKSUM · MISMATCH",
    severity: "critical",
    buttons: ["REBUILD", "PURGE"],
    direction: 1,
    z: 110,
  },
  {
    id: "tile-11",
    x: 942,
    y: 548,
    width: 526,
    height: 304,
    appear: 492,
    title: "SYNC FAILED",
    message: "Cloud state could not be reconciled with the local encrypted copy.",
    code: "SYNC_CLOCK · 00:14:27",
    severity: "info",
    buttons: ["TRY AGAIN", "LOCAL COPY"],
    direction: -1,
    z: 111,
  },
  {
    id: "tile-12",
    x: 1425,
    y: 548,
    width: 529,
    height: 304,
    appear: 552,
    title: "DRIVER RESPONSE",
    message: "The graphics service stopped returning valid synchronization frames.",
    code: "FRAME_QUEUE · STALLED",
    severity: "warning",
    buttons: ["RESTART", "REPORT"],
    direction: 1,
    z: 112,
  },
  {
    id: "tile-13",
    x: -34,
    y: 820,
    width: 535,
    height: 300,
    appear: 462,
    title: "SCHEDULER ALERT",
    message: "Too many high-priority tasks are waiting for an execution window.",
    code: "QUEUE_DEPTH · 1,024",
    severity: "warning",
    buttons: ["OPTIMIZE", "PAUSE"],
    direction: 1,
    z: 113,
  },
  {
    id: "tile-14",
    x: 458,
    y: 820,
    width: 526,
    height: 300,
    appear: 505,
    title: "RUNTIME EXCEPTION",
    message: "The active service returned an unknown state and was isolated.",
    code: "EXCEPTION · FATAL",
    severity: "critical",
    buttons: ["DIAGNOSTICS", "CLOSE"],
    direction: -1,
    z: 114,
  },
  {
    id: "tile-15",
    x: 942,
    y: 820,
    width: 526,
    height: 300,
    appear: 562,
    title: "BACKUP INCOMPLETE",
    message: "The recovery image was interrupted before verification completed.",
    code: "RECOVERY_SET · PARTIAL",
    severity: "info",
    buttons: ["CONTINUE", "RESTART"],
    direction: 1,
    z: 115,
  },
  {
    id: "tile-16",
    x: 1425,
    y: 820,
    width: 529,
    height: 300,
    appear: 596,
    title: "SYSTEM OVERLOAD",
    message: "Available resources are below the minimum required operating threshold.",
    code: "CAPACITY · CRITICAL",
    severity: "critical",
    buttons: ["EMERGENCY MODE", "SHUT DOWN"],
    direction: -1,
    z: 116,
  },
  {
    id: "overlay-01",
    x: 82,
    y: 78,
    width: 670,
    height: 262,
    appear: 522,
    title: "ENCRYPTION SERVICE",
    message: "The key exchange returned a signature that could not be authenticated.",
    code: "KEYCHAIN · INVALID",
    severity: "security",
    buttons: ["REJECT", "NEW KEY"],
    direction: -1,
    z: 201,
  },
  {
    id: "overlay-02",
    x: 694,
    y: 102,
    width: 548,
    height: 286,
    appear: 546,
    title: "UNKNOWN SIGNAL",
    message: "A background process emitted an undocumented response pattern.",
    code: "SIGNAL_HASH · 7D40",
    severity: "info",
    buttons: ["CAPTURE", "ISOLATE"],
    direction: 1,
    z: 202,
  },
  {
    id: "overlay-03",
    x: 1195,
    y: 74,
    width: 646,
    height: 270,
    appear: 570,
    title: "APPLICATION HALTED",
    message: "The selected operation cannot continue in the current system state.",
    code: "STATE_LOCK · ACTIVE",
    severity: "critical",
    buttons: ["WAIT", "FORCE CLOSE"],
    direction: -1,
    z: 203,
  },
  {
    id: "overlay-04",
    x: 170,
    y: 366,
    width: 744,
    height: 286,
    appear: 594,
    title: "INFORMATION LOSS",
    message: "Unsaved workspace changes may be discarded if recovery is started now.",
    code: "WORKSPACE · UNSAVED",
    severity: "warning",
    buttons: ["SAVE COPY", "RECOVER"],
    direction: 1,
    z: 204,
  },
  {
    id: "overlay-05",
    x: 852,
    y: 382,
    width: 640,
    height: 294,
    appear: 618,
    title: "SERVICE UNAVAILABLE",
    message: "A required protection module is not accepting new requests.",
    code: "SERVICE 503 · LOCKED",
    severity: "critical",
    buttons: ["RECONNECT", "STATUS"],
    direction: -1,
    z: 205,
  },
  {
    id: "overlay-06",
    x: 42,
    y: 700,
    width: 688,
    height: 282,
    appear: 638,
    title: "RECOVERY MODE",
    message: "The system detected an unstable state and prepared a protected restore point.",
    code: "SAFE_STATE · READY",
    severity: "info",
    buttons: ["RESTORE", "CONTINUE"],
    direction: -1,
    z: 206,
  },
  {
    id: "overlay-07",
    x: 650,
    y: 720,
    width: 622,
    height: 264,
    appear: 658,
    title: "RESOURCE EXHAUSTED",
    message: "No additional execution slots are available for this request.",
    code: "WORKER_POOL · FULL",
    severity: "warning",
    buttons: ["QUEUE", "CANCEL"],
    direction: 1,
    z: 207,
  },
  {
    id: "overlay-08",
    x: 1192,
    y: 686,
    width: 684,
    height: 306,
    appear: 678,
    title: "CRITICAL EXCEPTION",
    message: "Multiple protected services entered an unrecoverable state simultaneously.",
    code: "SYSTEM_MATRIX · FAILED",
    severity: "critical",
    buttons: ["EXPORT LOG", "EMERGENCY RESET"],
    direction: -1,
    z: 208,
  },
];

const PremiumBackdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      overflow: "hidden",
      background:
        "radial-gradient(circle at 18% 12%, rgba(103,74,201,0.34) 0%, rgba(103,74,201,0.08) 24%, transparent 44%), radial-gradient(circle at 86% 82%, rgba(18,145,139,0.28) 0%, rgba(18,145,139,0.07) 28%, transparent 50%), linear-gradient(132deg, #03040b 0%, #071126 46%, #0b0d21 70%, #160819 100%)",
    }}
  >
    <AbsoluteFill
      style={{
        opacity: 0.34,
        backgroundImage:
          "linear-gradient(rgba(148,178,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,178,255,0.045) 1px, transparent 1px)",
        backgroundSize: "76px 76px",
        maskImage: "linear-gradient(135deg, transparent 2%, black 35%, black 74%, transparent 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -240,
        top: 178,
        width: 920,
        height: 3,
        transform: "rotate(-18deg)",
        background: "linear-gradient(90deg, transparent, rgba(196,174,255,0.52), transparent)",
        filter: "blur(1px)",
        opacity: 0.45,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -290,
        bottom: 150,
        width: 1040,
        height: 3,
        transform: "rotate(-18deg)",
        background: "linear-gradient(90deg, transparent, rgba(89,226,207,0.45), transparent)",
        filter: "blur(1px)",
        opacity: 0.36,
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.09,
        backgroundImage:
          "repeating-linear-gradient(117deg, transparent 0px, transparent 7px, rgba(255,255,255,0.06) 8px)",
        mixBlendMode: "soft-light",
      }}
    />
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(1,2,8,0.2) 67%, rgba(1,2,7,0.8) 100%)",
      }}
    />
  </AbsoluteFill>
);

const SeverityIcon: React.FC<{severity: Severity; size: number}> = ({severity, size}) => {
  const accent = accents[severity];
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: severity === "security" ? 14 : "50%",
        transform: severity === "security" ? "rotate(45deg)" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.34), ${accent.main} 66%, rgba(0,0,0,0.1) 100%)`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.24) inset, 0 0 28px ${accent.soft}`,
        color: "#fff",
        fontSize: size * 0.66,
        fontWeight: 540,
        lineHeight: 1,
      }}
    >
      <span style={{transform: severity === "security" ? "rotate(-45deg)" : undefined}}>
        {accent.icon}
      </span>
    </div>
  );
};

const DialogSurface: React.FC<{spec: DialogSpec}> = ({spec}) => {
  const accent = accents[spec.severity];
  const compact = spec.height < 280;
  const headerHeight = compact ? 43 : 48;
  const iconSize = compact ? 52 : 62;
  const bodyFont = compact ? 18 : 20;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: 15,
        color: "#eef3ff",
        background:
          "linear-gradient(146deg, rgba(26,34,57,0.975) 0%, rgba(11,16,31,0.965) 62%, rgba(8,12,25,0.985) 100%)",
        border: "1px solid rgba(169,190,255,0.32)",
        boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.055) inset, 0 0 42px ${accent.soft}`,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: `linear-gradient(180deg, ${accent.main}, ${accent.main}55 68%, transparent)`,
          boxShadow: `0 0 22px ${accent.main}`,
        }}
      />
      <div
        style={{
          height: headerHeight,
          padding: "0 17px 0 21px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(90deg, ${accent.soft}, rgba(19,27,49,0.88) 46%, rgba(11,16,31,0.58))`,
          borderBottom: "1px solid rgba(178,198,255,0.17)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 11, minWidth: 0}}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: accent.main,
              boxShadow: `0 0 14px ${accent.main}`,
            }}
          />
          <div
            style={{
              color: "rgba(237,243,255,0.92)",
              fontSize: compact ? 16 : 17,
              letterSpacing: 1.25,
              fontWeight: 650,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {spec.title}
          </div>
        </div>
        <div style={{display: "flex", gap: 7, marginLeft: 12}}>
          {["—", "□", "×"].map((glyph, index) => (
            <div
              key={`${spec.id}-control-${index}`}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: index === 2 ? "#ffdce3" : "rgba(225,234,255,0.58)",
                background: index === 2 ? "rgba(255,95,125,0.17)" : "rgba(255,255,255,0.045)",
                border: index === 2 ? "1px solid rgba(255,95,125,0.28)" : "1px solid rgba(255,255,255,0.07)",
                fontSize: 15,
              }}
            >
              {glyph}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          height: spec.height - headerHeight,
          boxSizing: "border-box",
          padding: compact ? "20px 22px 18px" : "24px 26px 21px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(110deg, rgba(255,255,255,0.045), transparent 42%), radial-gradient(circle at 90% 116%, rgba(98,126,211,0.12), transparent 45%)",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: compact ? 18 : 22, minHeight: 78}}>
          <SeverityIcon severity={spec.severity} size={iconSize} />
          <div style={{minWidth: 0}}>
            <div
              style={{
                color: "rgba(237,243,255,0.95)",
                fontSize: bodyFont,
                fontWeight: 480,
                lineHeight: 1.32,
                letterSpacing: 0.05,
              }}
            >
              {spec.message}
            </div>
            <div
              style={{
                marginTop: compact ? 8 : 10,
                color: accent.main,
                fontSize: compact ? 12 : 13,
                fontWeight: 680,
                letterSpacing: 1.35,
                opacity: 0.9,
              }}
            >
              {spec.code}
            </div>
          </div>
        </div>
        <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12}}>
          {spec.buttons.map((button, index) => (
            <div
              key={`${spec.id}-button-${button}`}
              style={{
                minWidth: compact ? 94 : 112,
                height: compact ? 33 : 36,
                padding: "0 15px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                color: index === spec.buttons.length - 1 ? "#f7f9ff" : "rgba(225,233,255,0.74)",
                background:
                  index === spec.buttons.length - 1
                    ? `linear-gradient(180deg, ${accent.main}52, ${accent.main}26)`
                    : "rgba(255,255,255,0.055)",
                border:
                  index === spec.buttons.length - 1
                    ? `1px solid ${accent.main}80`
                    : "1px solid rgba(183,201,255,0.14)",
                boxShadow:
                  index === spec.buttons.length - 1 ? `0 0 18px ${accent.soft}` : "0 1px 0 rgba(255,255,255,0.04) inset",
                fontSize: compact ? 12 : 13,
                letterSpacing: 0.85,
                fontWeight: 650,
              }}
            >
              {button}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)",
          opacity: 0.65,
        }}
      />
    </div>
  );
};

const SystemDialog: React.FC<{spec: DialogSpec; frame: number}> = ({spec, frame}) => {
  if (frame < spec.appear) return null;

  const local = frame - spec.appear;
  const entered = progress(frame, spec.appear, spec.appear + 15);
  const glitch = 1 - clamp(local / 12);
  const stepJitter = local < 3 ? spec.direction * 112 : local < 6 ? -spec.direction * 44 : local < 9 ? spec.direction * 17 : 0;
  const x = spec.x + stepJitter * glitch;
  const scaleX = 1 + glitch * (local < 5 ? 0.08 : 0.025);

  return (
    <>
      {glitch > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              left: spec.x - spec.direction * 76,
              top: spec.y + spec.height * 0.22,
              width: spec.width + 138,
              height: Math.max(7, spec.height * 0.07),
              clipPath: "polygon(0 0, 100% 12%, 97% 100%, 4% 82%)",
              background: `linear-gradient(90deg, transparent, ${accents[spec.severity].main}aa 16%, rgba(220,233,255,0.74) 48%, ${accents[spec.severity].main}88 79%, transparent)`,
              filter: "blur(2px)",
              opacity: glitch * 0.72,
              transform: `translateX(${spec.direction * glitch * 72}px)`,
              zIndex: spec.z - 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: spec.x + spec.direction * 30,
              top: spec.y + spec.height * 0.68,
              width: spec.width + 92,
              height: Math.max(4, spec.height * 0.035),
              background: `linear-gradient(90deg, transparent, ${accents[spec.severity].main}99, rgba(255,255,255,0.48), transparent)`,
              filter: "blur(1.5px)",
              opacity: glitch * 0.6,
              transform: `translateX(${-spec.direction * glitch * 48}px)`,
              zIndex: spec.z - 1,
            }}
          />
        </>
      )}
      <div
        style={{
          position: "absolute",
          left: x,
          top: spec.y,
          width: spec.width,
          height: spec.height,
          opacity: 0.22 + entered * 0.78,
          transform: `scaleX(${scaleX}) translateY(${(1 - entered) * 5}px)`,
          transformOrigin: spec.direction === 1 ? "left center" : "right center",
          filter: local < 5 ? `blur(${(1 - entered) * 2.8}px)` : undefined,
          zIndex: spec.z,
        }}
      >
        <DialogSurface spec={spec} />
      </div>
    </>
  );
};

const LoadingDialog: React.FC<{frame: number}> = ({frame}) => {
  if (frame > 280) return null;

  const load = interpolate(frame, [8, 232], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = progress(frame, 248, 280);
  const glitch = frame >= 248 ? 1 - Math.abs(exit * 2 - 1) : 0;
  const segments = 24;
  const left = 520;
  const top = 394;
  const width = 880;
  const height = 286;
  const xJitter = frame < 248 ? 0 : frame < 257 ? 42 : frame < 267 ? -24 : frame < 275 ? 12 : 0;

  return (
    <>
      {glitch > 0.02 && (
        <>
          <div
            style={{
              position: "absolute",
              left: left - 105,
              top: top + 58,
              width: width + 210,
              height: 24,
              background: "linear-gradient(90deg, transparent, rgba(105,218,255,0.58), rgba(184,161,255,0.82), transparent)",
              transform: `translateX(${xJitter * 1.8}px)`,
              filter: "blur(4px)",
              opacity: glitch * 0.8,
              zIndex: 15,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: left - 64,
              top: top + 190,
              width: width + 128,
              height: 13,
              background: "linear-gradient(90deg, transparent, rgba(244,199,97,0.55), rgba(255,255,255,0.72), transparent)",
              transform: `translateX(${-xJitter * 1.4}px)`,
              filter: "blur(2px)",
              opacity: glitch * 0.74,
              zIndex: 15,
            }}
          />
        </>
      )}
      <div
        style={{
          position: "absolute",
          left: left + xJitter,
          top,
          width,
          height,
          borderRadius: 18,
          overflow: "hidden",
          color: "#eff4ff",
          background: "linear-gradient(145deg, rgba(25,34,58,0.98), rgba(8,13,27,0.985))",
          border: "1px solid rgba(167,190,255,0.35)",
          boxShadow: "0 34px 110px rgba(0,0,0,0.62), 0 0 50px rgba(103,119,255,0.14), 0 1px 0 rgba(255,255,255,0.11) inset",
          opacity: 1 - exit * 0.78,
          transform: `scaleX(${1 + glitch * 0.08})`,
          filter: glitch > 0.3 ? `blur(${glitch * 1.8}px)` : undefined,
          zIndex: 16,
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            height: 54,
            padding: "0 20px 0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(90deg, rgba(111,91,222,0.32), rgba(16,27,52,0.88) 55%, rgba(12,17,31,0.66))",
            borderBottom: "1px solid rgba(182,198,255,0.18)",
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 12}}>
            <div style={{width: 9, height: 9, borderRadius: "50%", background: "#9d86ff", boxShadow: "0 0 18px #9d86ff"}} />
            <div style={{fontSize: 18, letterSpacing: 1.4, fontWeight: 680}}>SECURE WORKSPACE</div>
          </div>
          <div style={{display: "flex", gap: 8}}>
            {["—", "□", "×"].map((glyph) => (
              <div
                key={`loading-${glyph}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(232,238,255,0.62)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {glyph}
              </div>
            ))}
          </div>
        </div>
        <div style={{padding: "32px 36px 30px"}}>
          <div style={{fontSize: 30, fontWeight: 520, letterSpacing: -0.5}}>Preparing secure workspace…</div>
          <div style={{fontSize: 16, color: "rgba(211,222,246,0.6)", marginTop: 9, letterSpacing: 0.25}}>
            Verifying protected services and encrypted runtime modules
          </div>
          <div
            style={{
              height: 68,
              marginTop: 27,
              padding: 9,
              boxSizing: "border-box",
              display: "grid",
              gridTemplateColumns: `repeat(${segments}, 1fr)`,
              gap: 6,
              borderRadius: 12,
              background: "rgba(2,7,18,0.72)",
              border: "1px solid rgba(144,169,230,0.23)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.035) inset",
            }}
          >
            {Array.from({length: segments}, (_, index) => {
              const active = load * segments > index;
              return (
                <div
                  key={`segment-${index}`}
                  style={{
                    borderRadius: 5,
                    background: active
                      ? "linear-gradient(180deg, #d8fff3 0%, #59e3c0 38%, #18bca6 100%)"
                      : "linear-gradient(180deg, rgba(160,181,224,0.11), rgba(92,108,145,0.07))",
                    boxShadow: active ? "0 0 14px rgba(69,232,197,0.48), 0 1px 0 rgba(255,255,255,0.72) inset" : "none",
                    border: active ? "1px solid rgba(202,255,241,0.62)" : "1px solid rgba(153,178,229,0.08)",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scale = Math.min(width / WIDTH, height / HEIGHT);
  const offsetX = (width - WIDTH * scale) / 2;
  const offsetY = (height - HEIGHT * scale) / 2;

  return (
    <AbsoluteFill style={{backgroundColor: "#03040b", overflow: "hidden"}}>
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        <PremiumBackdrop />
        <LoadingDialog frame={frame} />
        {dialogs.map((spec) => (
          <SystemDialog key={spec.id} spec={spec} frame={frame} />
        ))}
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            zIndex: 500,
            boxShadow: "0 0 140px rgba(0,0,0,0.48) inset",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
