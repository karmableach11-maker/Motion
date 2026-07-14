import React from 'react';
import {Composition} from 'remotion';
import {Motion} from './Motion';

// 1920×1080 · 60 fps · 900 frames (15s) — matches the Motion design.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Motion"
        component={Motion}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
