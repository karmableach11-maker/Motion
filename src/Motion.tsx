import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type RiskKind = 'phishing' | 'spam' | 'suspicious';

type Message = {
  kind: RiskKind;
  label: string;
  subject: string;
  time: string;
  emphasized: boolean;
};

const messages: Message[] = [
  {
    kind: 'suspicious',
    label: 'Unverified Sender',
    subject: 'Unusual mailbox rule created automatically',
    time: '08:12  MAY 14',
    emphasized: false,
  },
  {
    kind: 'spam',
    label: 'Spam Warning',
    subject: 'Exclusive loyalty reward waiting for confirmation',
    time: '08:26  MAY 14',
    emphasized: false,
  },
  {
    kind: 'phishing',
    label: 'Phishing Alert',
    subject: 'Password reset requested from an unknown device',
    time: '08:41  MAY 14',
    emphasized: true,
  },
  {
    kind: 'suspicious',
    label: 'Unverified Sender',
    subject: 'Shared cloud document expires at midnight',
    time: '08:57  MAY 14',
    emphasized: false,
  },
  {
    kind: 'spam',
    label: 'Spam Warning',
    subject: 'Tax refund approved — claim your transfer now',
    time: '09:04  MAY 14',
    emphasized: true,
  },
  {
    kind: 'phishing',
    label: 'Phishing Alert',
    subject: 'Payroll profile requires immediate verification',
    time: '09:18  MAY 14',
    emphasized: true,
  },
  {
    kind: 'suspicious',
    label: 'Unverified Sender',
    subject: 'Encrypted voicemail attachment could not be scanned',
    time: '09:32  MAY 14',
    emphasized: false,
  },
  {
    kind: 'spam',
    label: 'Spam Warning',
    subject: 'Executive request: purchase gift cards before noon',
    time: '09:47  MAY 14',
    emphasized: true,
  },
  {
    kind: 'phishing',
    label: 'Phishing Alert',
    subject: 'Delivery failed — confirm your home address',
    time: '10:03  MAY 14',
    emphasized: false,
  },
  {
    kind: 'suspicious',
    label: 'Unverified Sender',
    subject: 'New vendor bank details included in invoice',
    time: '10:19  MAY 14',
    emphasized: true,
  },
  {
    kind: 'spam',
    label: 'Spam Warning',
    subject: 'Storage quota exceeded — upgrade without charge',
    time: '10:34  MAY 14',
    emphasized: false,
  },
  {
    kind: 'phishing',
    label: 'Phishing Alert',
    subject: 'One-time access code requested from a new location',
    time: '10:51  MAY 14',
    emphasized: true,
  },
  {
    kind: 'suspicious',
    label: 'Unverified Sender',
    subject: 'E-signature request expires in two hours',
    time: '11:06  MAY 14',
    emphasized: false,
  },
  {
    kind: 'spam',
    label: 'Spam Warning',
    subject: 'Crypto bonus reserved for your account',
    time: '11:22  MAY 14',
    emphasized: true,
  },
  {
    kind: 'phishing',
    label: 'Phishing Alert',
    subject: 'Account recovery email was changed',
    time: '11:39  MAY 14',
    emphasized: true,
  },
  {
    kind: 'suspicious',
    label: 'Unverified Sender',
    subject: 'Secure file transfer invitation expires tonight',
    time: '11:55  MAY 14',
    emphasized: false,
  },
];

const ROW_HEIGHT = 183;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const hermite = (
  x: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  slope0: number,
  slope1: number,
) => {
  const width = x1 - x0;
  const u = (x - x0) / width;
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return h00 * y0 + h10 * width * slope0 + h01 * y1 + h11 * width * slope1;
};

const cameraProgress = (progress: number) => {
  const xs = [0, 0.333, 0.6, 0.8, 1];
  const ys = [0, 0.255, 0.635, 0.855, 1];
  const slopes = [0.14, 1, 1.22, 0.88, 0.12];

  for (let index = 0; index < xs.length - 1; index++) {
    if (progress <= xs[index + 1]) {
      return hermite(
        progress,
        xs[index],
        xs[index + 1],
        ys[index],
        ys[index + 1],
        slopes[index],
        slopes[index + 1],
      );
    }
  }

  return 1;
};

const CheckBox: React.FC = () => (
  <span
    style={{
      width: 51,
      height: 51,
      border: '5px solid #4D535B',
      borderRadius: 3,
      boxSizing: 'border-box',
      display: 'block',
      boxShadow: '0 0 0 1px rgba(20, 25, 31, 0.08)',
    }}
  />
);

const RiskIcon: React.FC<{kind: RiskKind}> = ({kind}) => {
  if (kind === 'phishing') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <path
          d="M28 5.5 47 12v13.3c0 12.2-7.1 20.8-19 25.2C16.1 46.1 9 37.5 9 25.3V12Z"
          fill="#E62C75"
        />
        <path d="M28 10.3v34.5c8.6-3.8 13.7-10.4 13.7-19.3V16Z" fill="#F34788" />
        <path d="M28 12.2v29.9c-7.9-3.6-12.3-9.3-12.3-17.1v-8.7Z" fill="#D91D66" />
        <path d="M28 14.6v25.2" stroke="#FFF" strokeWidth="3.2" opacity="0.92" />
      </svg>
    );
  }

  if (kind === 'spam') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <path
          d="M19 5.8h18L50.2 19v18L37 50.2H19L5.8 37V19Z"
          fill="#EE3D42"
        />
        <rect x="25.2" y="14" width="5.6" height="20" rx="2.8" fill="#FFF" />
        <circle cx="28" cy="41" r="3.4" fill="#FFF" />
      </svg>
    );
  }

  return (
    <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
      <path
        d="M29 6.5 53 49H5Z"
        fill="none"
        stroke="#F1A51C"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect x="26.4" y="20" width="5.2" height="15.5" rx="2.6" fill="#F1A51C" />
      <circle cx="29" cy="42" r="3" fill="#F1A51C" />
    </svg>
  );
};

const MessageRow: React.FC<{message: Message}> = ({message}) => (
  <div
    style={{
      height: ROW_HEIGHT,
      display: 'grid',
      gridTemplateColumns: '280px 120px minmax(0, 1fr) 190px',
      alignItems: 'center',
      borderBottom: '2px solid rgba(104, 116, 130, 0.19)',
      boxSizing: 'border-box',
      color: '#16191E',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <CheckBox />
    </div>
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <RiskIcon kind={message.kind} />
    </div>
    <div
      style={{
        minWidth: 0,
        paddingRight: 30,
        fontFamily: 'Arial Narrow, Helvetica Neue, Arial, sans-serif',
        fontSize: 40,
        fontWeight: message.emphasized ? 760 : 450,
        letterSpacing: message.emphasized ? -1.25 : -1.05,
        lineHeight: 1.22,
        whiteSpace: 'normal',
      }}
    >
      <span style={{fontWeight: message.emphasized ? 780 : 500}}>
        [*** {message.label} ***]
      </span>{' '}
      <span>{message.subject}</span>
    </div>
    <div
      style={{
        justifySelf: 'end',
        paddingRight: 28,
        whiteSpace: 'nowrap',
        color: '#AEB4BC',
        fontFamily: 'Arial Narrow, Helvetica Neue, Arial, sans-serif',
        fontSize: 20,
        fontWeight: 650,
        letterSpacing: 0.3,
      }}
    >
      {message.time}
    </div>
  </div>
);

const InboxRows: React.FC = () => (
  <>
    {messages.map((message, index) => (
      <MessageRow key={`${message.subject}-${index}`} message={message} />
    ))}
  </>
);

const InboxPlane: React.FC<{
  transform: string;
  blurred?: boolean;
}> = ({transform, blurred = false}) => (
  <div
    style={{
      position: 'absolute',
      left: 50,
      top: 0,
      width: 1870,
      minHeight: messages.length * ROW_HEIGHT + 220,
      background:
        'linear-gradient(104deg, #F5F6F8 0%, #FAFAFB 45%, #F3F5F7 100%)',
      transform,
      transformOrigin: '50% 0%',
      transformStyle: 'preserve-3d',
      willChange: 'transform',
      filter: blurred ? 'blur(2.35px)' : undefined,
      WebkitMaskImage: blurred
        ? 'radial-gradient(ellipse 67% 72% at 35% 55%, transparent 0%, transparent 42%, rgba(0,0,0,0.15) 60%, #000 96%)'
        : undefined,
      maskImage: blurred
        ? 'radial-gradient(ellipse 67% 72% at 35% 55%, transparent 0%, transparent 42%, rgba(0,0,0,0.15) 60%, #000 96%)'
        : undefined,
    }}
  >
    <InboxRows />
  </div>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const normalized = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const travel = cameraProgress(normalized);

  const planeY = interpolate(travel, [0, 1], [-203, -1170], clamp);
  const planeScale = interpolate(
    frame,
    [0, 305],
    [1.08, 0.95],
    {...clamp, easing: Easing.out(Easing.cubic)},
  );
  const planeX = interpolate(travel, [0, 1], [-8, -25], clamp);
  const transform = `translate3d(${planeX}px, ${planeY}px, 0) rotateX(2.4deg) rotateY(1.25deg) rotateZ(0.9deg) scale(${planeScale})`;

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: '#F3F5F7',
        perspective: 2700,
        perspectiveOrigin: '52% 48%',
      }}
    >
      <InboxPlane transform={transform} />
      <InboxPlane transform={transform} blurred />

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 72% 80% at 35% 54%, transparent 0%, transparent 48%, rgba(147,157,168,0.10) 78%, rgba(113,124,137,0.22) 115%)',
          boxShadow:
            'inset 0 0 110px rgba(98,108,120,0.10), inset -70px 0 100px rgba(132,141,151,0.08)',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: 0.22,
          background:
            'linear-gradient(114deg, rgba(255,255,255,0.42) 0%, transparent 24%, transparent 72%, rgba(218,223,229,0.18) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
