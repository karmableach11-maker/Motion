import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * MOTION — "Spam Inbox | Phishing Threat Scroll Loop"
 * 1920x1080 • 60 fps • 1200 frames (20 s) • SEAMLESS LOOP
 *
 * Direkonstruksi dari analisa + pengukuran video referensi:
 * - Daftar email inbox putih (gaya webmail) bergulir ke atas dengan
 *   kecepatan KONSTAN LINEAR (phase correlation dy = -1px/frame konsisten,
 *   easing linear, tanpa percepatan) — murni scroll, tidak ada gerak lain.
 * - Tiap baris: checkbox, bintang outline, ikon amplop, badge merah "SPAM!",
 *   nama pengirim (tebal), subjek spam (tebal) + preview (abu-abu).
 * - Seluruh daftar sedikit miring + perspektif ringan (kesan mengambang).
 *
 * MODIFIKASI diminta: NAMA-NAMA ORANG BERBEDA dari referensi.
 *
 * Loop: scroll menempuh tepat satu siklus penuh data baris (ROWS.length ×
 * ROW_H) selama LOOP → frame pertama & terakhir identik. Deterministik,
 * mandiri (hanya 'remotion').
 */

const LOOP = 1200;
const ROW_H = 96;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ---------------------------------------------------------------------------
// Data baris — NAMA BARU (berbeda dari referensi) + subjek/preview spam
// ---------------------------------------------------------------------------

type Row = {name: string; subject: string; preview: string};

const NAMES = [
  'Olivia', 'Benjamin', 'Sophia', 'Lucas', 'Emma', 'Nathan', 'Isabella',
  'Daniel', 'Mia', 'Ethan', 'Charlotte', 'Oliver', 'Amelia', 'Henry',
  'Ava', 'Sebastian', 'Grace', 'Julian', 'Chloe', 'Leo',
];

const SPAM = [
  {subject: 'Breaking news!', preview: 'Urgent payment confirmation needed…'},
  {subject: 'Buy 2 get 1 FREE!', preview: 'You can save more thru ordering on our site…'},
  {subject: 'Greetings to you!', preview: 'Dear Sir or Madam, how are you today?'},
  {subject: 'Verify Your Account and grab your prize!', preview: 'Today we announce the lucky…'},
  {subject: 'Congratulations! You have won $100', preview: 'Please get back to me ASAP…'},
  {subject: 'Congratulations! You WIN!', preview: 'Text AGREE to confirm consent for saving…'},
  {subject: 'Hi my darling!', preview: 'Please I urgently need you to help me…'},
  {subject: 'Get 30% off for 3 days only', preview: 'Hi! Just wanted to make sure you saw…'},
  {subject: 'Final notice: account suspended', preview: 'Click here within 24 hours to restore…'},
  {subject: 'You have (3) pending rewards', preview: 'Confirm your details to claim now…'},
];

const ROWS: Row[] = NAMES.map((name, i) => ({
  name,
  subject: SPAM[i % SPAM.length].subject,
  preview: SPAM[i % SPAM.length].preview,
}));

// ---------------------------------------------------------------------------
// Ikon
// ---------------------------------------------------------------------------

const Checkbox: React.FC = () => (
  <div
    style={{
      width: 26,
      height: 26,
      border: '2px solid #c2c6cc',
      borderRadius: 5,
    }}
  />
);

const Star: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24">
    <path
      d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.9 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
      fill="none"
      stroke="#c2c6cc"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
);

const Envelope: React.FC = () => (
  <svg width={44} height={44} viewBox="0 0 48 48">
    <rect x={5} y={12} width={38} height={26} rx={4} fill="#f4b73f" stroke="#e09e2a" strokeWidth={1.5} />
    <path d="M6 14 L24 28 L42 14" fill="none" stroke="#fff5dd" strokeWidth={2.4} />
    <path d="M6 14 L24 28 L42 14" fill="none" stroke="#e09e2a" strokeWidth={1.2} opacity={0.5} />
  </svg>
);

const SpamBadge: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 128,
      height: 46,
      borderRadius: 23,
      background: 'linear-gradient(180deg,#f5333f 0%,#d81420 100%)',
      color: '#ffffff',
      fontFamily: "'Arial Black', Arial, sans-serif",
      fontWeight: 900,
      fontSize: 27,
      letterSpacing: 1,
      boxShadow: '0 3px 8px rgba(200,20,30,0.35)',
    }}
  >
    SPAM!
  </div>
);

// ---------------------------------------------------------------------------
// Satu baris
// ---------------------------------------------------------------------------

const InboxRow: React.FC<{row: Row; y: number}> = ({row, y}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: y,
      width: 1920,
      height: ROW_H,
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #eceef1',
      background: '#ffffff',
      paddingLeft: 150,
      paddingRight: 90,
      boxSizing: 'border-box',
    }}
  >
    <div style={{width: 46}}>
      <Checkbox />
    </div>
    <div style={{width: 52}}>
      <Star />
    </div>
    <div style={{width: 66}}>
      <Envelope />
    </div>
    <div style={{width: 156}}>
      <SpamBadge />
    </div>
    <div
      style={{
        width: 210,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontWeight: 700,
        fontSize: 30,
        color: '#202124',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {row.name}
    </div>
    <div
      style={{
        flex: 1,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: 29,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <span style={{fontWeight: 700, color: '#202124'}}>{row.subject}</span>
      <span style={{color: '#9aa0a6'}}> &nbsp;{row.preview}</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const f = (frame / durationInFrames) * LOOP;

  const cycle = ROWS.length * ROW_H; // jarak scroll satu siklus penuh
  const scroll = (f / LOOP) * cycle; // linear, konstan → loop mulus

  // Rentang baris yang terlihat (buffer atas/bawah)
  const firstIdx = Math.floor(scroll / ROW_H) - 1;
  const count = Math.ceil(1080 / ROW_H) + 3;

  const rows = [];
  for (let k = 0; k < count; k++) {
    const idx = firstIdx + k;
    const y = idx * ROW_H - scroll;
    const data = ROWS[((idx % ROWS.length) + ROWS.length) % ROWS.length];
    rows.push(<InboxRow key={k} row={data} y={y} />);
  }

  return (
    <AbsoluteFill style={{background: '#eceef1'}}>
      {/* Daftar bergulir, dengan sedikit miring + perspektif (kesan mengambang) */}
      <AbsoluteFill
        style={{
          perspective: 1600,
          perspectiveOrigin: '50% 42%',
        }}
      >
        <AbsoluteFill
          style={{
            transform: 'rotateX(11deg) rotateZ(-2.6deg) scale(1.14)',
            transformOrigin: '50% 50%',
          }}
        >
          {rows}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Watermark-free: sedikit vignette lembut agar tepi tidak keras */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 62%, rgba(120,130,140,0.18) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Gradasi halus atas & bawah (fade scroll) */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(236,238,241,0.9) 0%, transparent 12%, transparent 88%, rgba(236,238,241,0.9) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default Motion;
