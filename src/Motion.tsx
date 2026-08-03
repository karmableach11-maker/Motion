import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type FolderKey = 'mail' | 'spam' | 'draft' | 'sent' | 'archive';

type Message = {
  initials: string;
  sender: string;
  subject: string;
  preview: string;
  color: string;
  tint: string;
  meta: string;
};

type Folder = {
  key: FolderKey;
  label: string;
  count: number;
  totalLabel: string;
  messages: Message[];
};

const BLUE = '#2f78ed';
const BLUE_DARK = '#1762d8';
const INK = '#1d2738';
const MUTED = '#8993a6';
const SHELL = '#f8f9fc';
const PANEL = '#ffffff';

const FOLDERS: Folder[] = [
  {
    key: 'mail',
    label: 'Mail',
    count: 128,
    totalLabel: '128 emails',
    messages: [
      {
        initials: 'MC',
        sender: 'Maya Chen',
        subject: 'Q3 strategy review tomorrow',
        preview: 'Agenda, growth metrics, and key decisions for the morning session.',
        color: '#f49a32',
        tint: '#fff8ee',
        meta: '09:42',
      },
      {
        initials: 'CS',
        sender: 'Creative Studio',
        subject: 'Design handoff is ready',
        preview: 'The final interface package and motion notes are ready to review.',
        color: '#8758e8',
        tint: '#faf7ff',
        meta: '08:18',
      },
      {
        initials: 'AA',
        sender: 'Atlas Analytics',
        subject: 'Weekly performance report',
        preview: 'Traffic, conversion, and retention improved across every channel.',
        color: '#2f7eea',
        tint: '#f3f8ff',
        meta: 'Yesterday',
      },
      {
        initials: 'PL',
        sender: 'Product Lab',
        subject: 'Prototype feedback collected',
        preview: 'Twelve new insights were added to the research summary.',
        color: '#38b979',
        tint: '#f2fcf7',
        meta: 'Yesterday',
      },
    ],
  },
  {
    key: 'spam',
    label: 'Spam',
    count: 24,
    totalLabel: '24 suspicious emails',
    messages: [
      {
        initials: 'PC',
        sender: 'Prize Center',
        subject: 'You have been selected',
        preview: 'Unverified reward notification blocked by your mail protection.',
        color: '#ef5f62',
        tint: '#fff3f3',
        meta: '10:06',
      },
      {
        initials: 'US',
        sender: 'Unknown Sender',
        subject: 'Urgent account action',
        preview: 'This message contains an untrusted link and unusual sender details.',
        color: '#d19a26',
        tint: '#fffaeb',
        meta: '08:52',
      },
      {
        initials: 'DB',
        sender: 'Discount Blast',
        subject: 'Limited-time offer inside',
        preview: 'Promotional content moved here automatically by smart filtering.',
        color: '#c95adf',
        tint: '#fdf5ff',
        meta: 'Monday',
      },
      {
        initials: 'AN',
        sender: 'Automated Notice',
        subject: 'Unverified delivery update',
        preview: 'Sender authentication failed and tracking details were removed.',
        color: '#6d7f96',
        tint: '#f5f7fa',
        meta: 'Sunday',
      },
    ],
  },
  {
    key: 'draft',
    label: 'Draft',
    count: 6,
    totalLabel: '6 draft emails',
    messages: [
      {
        initials: 'UP',
        sender: 'Untitled Proposal',
        subject: 'Add launch timeline and scope',
        preview: 'The commercial plan still needs milestones, owners, and budget.',
        color: '#e8a439',
        tint: '#fff9ee',
        meta: 'Edited 2m',
      },
      {
        initials: 'PF',
        sender: 'Partnership Follow-up',
        subject: 'Great meeting with your team',
        preview: 'Hi Jordan, thank you for the thoughtful discussion this morning…',
        color: '#4f8de8',
        tint: '#f4f8ff',
        meta: 'Edited 1h',
      },
      {
        initials: 'TO',
        sender: 'Team Offsite Notes',
        subject: 'Ideas for the September session',
        preview: 'Workshop topics, travel options, and the final attendee list…',
        color: '#42b889',
        tint: '#f2fbf7',
        meta: 'Friday',
      },
      {
        initials: 'NR',
        sender: 'Newsletter Review',
        subject: 'August product highlights',
        preview: 'Finalize the opening paragraph and confirm the release date…',
        color: '#8c61df',
        tint: '#faf7ff',
        meta: 'Thursday',
      },
    ],
  },
  {
    key: 'sent',
    label: 'Sent',
    count: 48,
    totalLabel: '48 sent emails',
    messages: [
      {
        initials: 'MC',
        sender: 'To: Maya Chen',
        subject: 'Q3 strategy review',
        preview: 'Sharing the updated agenda and metrics before tomorrow morning.',
        color: '#f49a32',
        tint: '#fff8ee',
        meta: '10:21',
      },
      {
        initials: 'DT',
        sender: 'To: Design Team',
        subject: 'Final campaign files attached',
        preview: 'The approved exports and delivery checklist are included here.',
        color: '#ef5a58',
        tint: '#fff4f3',
        meta: '09:11',
      },
      {
        initials: 'FN',
        sender: 'To: Finance',
        subject: 'Budget approval requested',
        preview: 'Please review the revised forecast and confirm the next step.',
        color: '#397fe0',
        tint: '#f2f7ff',
        meta: 'Yesterday',
      },
      {
        initials: 'OP',
        sender: 'To: Operations',
        subject: 'Launch checklist complete',
        preview: 'All critical owners have confirmed readiness for deployment.',
        color: '#3faf7c',
        tint: '#f1fbf6',
        meta: 'Yesterday',
      },
    ],
  },
  {
    key: 'archive',
    label: 'Archive',
    count: 91,
    totalLabel: '91 archived emails',
    messages: [
      {
        initials: 'TT',
        sender: 'Talent Team',
        subject: 'Onboarding completed',
        preview: 'All documents are signed and the first-week plan is confirmed.',
        color: '#44b783',
        tint: '#f1fbf6',
        meta: 'Aug 12',
      },
      {
        initials: 'CC',
        sender: 'Cloud Console',
        subject: 'Monthly usage report',
        preview: 'Your workspace remained healthy with optimized resource usage.',
        color: '#4384df',
        tint: '#f3f7ff',
        meta: 'Aug 08',
      },
      {
        initials: 'AS',
        sender: 'Aurora Studio',
        subject: 'Campaign assets delivered',
        preview: 'The complete brand-safe media package is stored in your workspace.',
        color: '#8f5ede',
        tint: '#faf6ff',
        meta: 'Jul 29',
      },
      {
        initials: 'RS',
        sender: 'Research Summary',
        subject: 'Customer study closed',
        preview: 'Final findings and recommendations were archived for the team.',
        color: '#ea8d35',
        tint: '#fff8ef',
        meta: 'Jul 18',
      },
    ],
  },
];

const CLICK_FRAMES = [48, 180, 360, 540, 720];

const clampInterpolate = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = Easing.linear,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

const selectionPosition = (frame: number) => {
  let value = 0;
  for (let i = 1; i < CLICK_FRAMES.length; i++) {
    const click = CLICK_FRAMES[i];
    if (frame >= click) {
      value = clampInterpolate(
        frame,
        [click, click + 14],
        [i - 1, i],
        Easing.inOut(Easing.cubic),
      );
    }
  }
  return value;
};

const currentFolderIndex = (frame: number) => {
  let active = 0;
  for (let i = 1; i < CLICK_FRAMES.length; i++) {
    if (frame >= CLICK_FRAMES[i]) active = i;
  }
  return active;
};

const cursorPointForIndex = (index: number) => ({
  x: 302 + index * 21,
  y: 338 + index * 140,
});

const cursorPosition = (frame: number) => {
  const initial = {x: 1520, y: 900};
  const first = cursorPointForIndex(0);
  if (frame <= 42) {
    const p = clampInterpolate(frame, [0, 42], [0, 1], Easing.inOut(Easing.cubic));
    return {
      x: initial.x + (first.x - initial.x) * p,
      y: initial.y + (first.y - initial.y) * p,
    };
  }

  let point = first;
  for (let i = 1; i < CLICK_FRAMES.length; i++) {
    const click = CLICK_FRAMES[i];
    const from = cursorPointForIndex(i - 1);
    const to = cursorPointForIndex(i);
    const moveStart = click - 54;
    const moveEnd = click - 8;
    if (frame >= moveStart && frame <= moveEnd) {
      const p = clampInterpolate(
        frame,
        [moveStart, moveEnd],
        [0, 1],
        Easing.inOut(Easing.cubic),
      );
      return {x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p};
    }
    if (frame > moveEnd) point = to;
  }
  return point;
};

const clickPulse = (frame: number) => {
  for (const click of CLICK_FRAMES) {
    if (frame >= click - 4 && frame <= click + 20) {
      const local = frame - click;
      return {
        scale:
          local < 0
            ? clampInterpolate(local, [-4, 0], [1, 0.86], Easing.out(Easing.cubic))
            : clampInterpolate(local, [0, 10], [0.86, 1], Easing.out(Easing.cubic)),
        ripple: clampInterpolate(local, [0, 20], [0, 1], Easing.out(Easing.cubic)),
      };
    }
  }
  return {scale: 1, ripple: -1};
};

const Sidebar: React.FC<{position: number}> = ({position}) => {
  const selectedIndex = Math.max(0, Math.min(4, Math.round(position)));
  const activeTop = 300 + position * 140;
  const activeLeft = 120 + position * 15;
  const activeWidth = 890 + position * 5;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 156,
          top: 50,
          width: 772,
          height: 160,
          borderRadius: 88,
          background: `linear-gradient(135deg, ${BLUE} 0%, #3a83f1 100%)`,
          boxShadow: '0 8px 18px rgba(31, 101, 214, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 48,
          fontWeight: 500,
          letterSpacing: -0.6,
        }}
      >
        Compose
      </div>

      <div
        style={{
          position: 'absolute',
          left: activeLeft,
          top: activeTop,
          width: activeWidth,
          height: 132,
          background: `linear-gradient(90deg, ${BLUE_DARK} 0%, ${BLUE} 100%)`,
          clipPath: 'polygon(0 2%, 98.4% 0, 100% 100%, 2.1% 100%)',
          boxShadow: '0 5px 15px rgba(31, 105, 222, 0.12)',
        }}
      />

      {FOLDERS.map((folder, index) => {
        const y = 321 + index * 140;
        const x = 174 + index * 21;
        const active = index === selectedIndex;
        const countX = 922 + index * 20;
        return (
          <React.Fragment key={folder.key}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                height: 88,
                display: 'flex',
                alignItems: 'center',
                color: active ? '#ffffff' : INK,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 57,
                fontWeight: active ? 500 : 400,
                letterSpacing: -1.1,
              }}
            >
              <span>{folder.label}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                left: countX,
                top: y + 24,
                color: active ? '#ffd0c8' : '#ef6f6b',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 32,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {folder.count}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

const MessageRow: React.FC<{
  message: Message;
  index: number;
  translateY: number;
  opacity: number;
}> = ({message, index, translateY, opacity}) => {
  const top = 342 + index * 205;
  const left = 1015 + top * 0.11;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: top + translateY,
        width: 1040,
        height: 194,
        opacity,
        background: `linear-gradient(90deg, ${message.tint} 0%, rgba(255,255,255,0.92) 82%)`,
        borderLeft: `8px solid ${BLUE}`,
        borderBottom: '1px solid #edf0f5',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 46,
          top: 50,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: message.color,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 0.2,
          boxShadow: '0 3px 8px rgba(31,45,72,0.09)',
        }}
      >
        {message.initials}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 145,
          top: 26,
          width: 760,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'clip',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: INK,
        }}
      >
        <div style={{fontSize: 31, lineHeight: 1.25, fontWeight: 500, letterSpacing: -0.25}}>
          {message.sender}
        </div>
        <div style={{fontSize: 39, lineHeight: 1.34, fontWeight: 600, letterSpacing: -0.65}}>
          {message.subject}
        </div>
        <div style={{fontSize: 28, lineHeight: 1.35, color: MUTED, fontWeight: 400}}>
          {message.preview}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 28,
          top: 34,
          color: '#9ba4b4',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 25,
          fontWeight: 500,
        }}
      >
        {message.meta}
      </div>
    </div>
  );
};

const Rows: React.FC<{
  messages: Message[];
  opacity: number;
  translateY: number;
  frame: number;
}> = ({messages, opacity, translateY}) => (
  <>
    {messages.map((message, index) => (
      <MessageRow
        key={`${message.initials}-${message.subject}`}
        message={message}
        index={index}
        translateY={translateY + index * Math.max(0, translateY * 0.025)}
        opacity={opacity}
      />
    ))}
  </>
);

const MessageViewport: React.FC<{frame: number}> = ({frame}) => {
  let eventIndex = -1;
  for (let i = 0; i < CLICK_FRAMES.length; i++) {
    if (frame >= CLICK_FRAMES[i]) eventIndex = i;
  }

  // Mail is already open at the beginning. Clicking the active Mail folder is
  // intentionally idempotent: the same rows remain visible with no refresh.
  if (eventIndex <= 0) {
    return <Rows messages={FOLDERS[0].messages} opacity={1} translateY={0} frame={frame} />;
  }

  const click = CLICK_FRAMES[eventIndex];
  const local = frame - click;
  const previous = FOLDERS[eventIndex - 1].messages;
  const current = FOLDERS[eventIndex].messages;
  const oldOpacity = clampInterpolate(local, [0, 5], [1, 0], Easing.in(Easing.cubic));
  const oldY = clampInterpolate(local, [0, 5], [0, 145], Easing.in(Easing.cubic));
  const newOpacity = clampInterpolate(local, [7, 18], [0, 1], Easing.out(Easing.cubic));
  const newY = clampInterpolate(local, [7, 18], [130, 0], Easing.out(Easing.cubic));

  return (
    <>
      {local <= 6 ? <Rows messages={previous} opacity={oldOpacity} translateY={oldY} frame={frame} /> : null}
      {local >= 7 ? (
        <Rows
          messages={current}
          opacity={newOpacity}
          translateY={newY}
          frame={frame}
        />
      ) : null}
    </>
  );
};

const Toolbar: React.FC<{folderIndex: number}> = ({folderIndex}) => {
  const title = FOLDERS[folderIndex].totalLabel;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 1048,
          top: 0,
          width: 872,
          height: 187,
          background: 'rgba(255,255,255,0.82)',
          borderBottom: '2px solid #e7ebf2',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 18,
          gap: 78,
          boxSizing: 'border-box',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 29,
          fontWeight: 500,
          color: '#4d82d1',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span>Archive</span>
        <span>Delete</span>
        <span>Mark as spam</span>
        <span>Move to</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1063,
          top: 235,
          color: '#8c96a7',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 34,
          fontWeight: 400,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </div>
    </>
  );
};

const Cursor: React.FC<{frame: number}> = ({frame}) => {
  const point = cursorPosition(frame);
  const pulse = clickPulse(frame);
  const visible = clampInterpolate(frame, [0, 10], [0, 1], Easing.out(Easing.cubic));
  return (
    <div
      style={{
        position: 'absolute',
        left: point.x,
        top: point.y,
        width: 94,
        height: 110,
        transform: `scale(${pulse.scale})`,
        transformOrigin: '6px 6px',
        opacity: visible,
        filter: 'drop-shadow(0 7px 8px rgba(29,39,56,0.22))',
        zIndex: 50,
      }}
    >
      {pulse.ripple >= 0 ? (
        <div
          style={{
            position: 'absolute',
            left: -34 - pulse.ripple * 34,
            top: -34 - pulse.ripple * 34,
            width: 68 + pulse.ripple * 68,
            height: 68 + pulse.ripple * 68,
            borderRadius: '50%',
            border: `5px solid rgba(47,120,237,${0.62 * (1 - pulse.ripple)})`,
            boxSizing: 'border-box',
          }}
        />
      ) : null}
      <svg width="94" height="110" viewBox="0 0 94 110" fill="none">
        <path
          d="M9 7L79 65L48 70L66 99L47 109L30 78L9 99V7Z"
          fill="#172337"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const scale = Math.min(width / 1920, height / 1080);
  const folderIndex = currentFolderIndex(frame);
  const position = selectionPosition(frame);

  return (
    <AbsoluteFill
      style={{
        background: '#f3f5fa',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: (width - 1920 * scale) / 2,
          top: (height - 1080 * scale) / 2,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          overflow: 'hidden',
          background: PANEL,
          boxShadow: 'inset 0 0 90px rgba(40,57,90,0.035)',
        }}
      >
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', inset: 0}}
        >
          <rect width="1920" height="1080" fill={PANEL} />
          <path d="M0 0H958L1113 1080H0V0Z" fill={SHELL} />
          <path d="M958 0L1113 1080" stroke="#dfe4ed" strokeWidth="3" />
          <path d="M962 0L1117 1080" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
        </svg>

        <Sidebar position={position} />
        <Toolbar folderIndex={folderIndex} />
        <MessageViewport frame={frame} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, transparent 0%, transparent 82%, rgba(255,255,255,0.42) 100%), linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 18%, transparent 90%, rgba(245,247,251,0.20) 100%)',
          }}
        />
        <Cursor frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
