import {Config} from '@remotion/cli/config';

// High-quality H.264
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCrf(16);

// WebGL backend for Three.js on GitHub's GPU-less runners.
// "angle" falls back to SwiftShader automatically. If 3D ever renders black,
// change this to "swangle".
Config.setChromiumOpenGlRenderer('angle');
