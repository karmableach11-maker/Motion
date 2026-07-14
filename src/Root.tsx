import React from 'react';
import {Composition} from 'remotion';
import {Motion} from './Motion7';

// 1920×1080 · 60 fps · 720 frames (12s) — matches the Motion7 design.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Motion7"
        component={Motion}
        durationInFrames={720}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
