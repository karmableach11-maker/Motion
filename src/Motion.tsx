import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const TARGET_SCALE = 6.83;

type GlyphName =
  | 'attention'
  | 'bayes'
  | 'binary-loss'
  | 'chain-rule'
  | 'confusion'
  | 'contour'
  | 'cosine'
  | 'covariance'
  | 'decision'
  | 'distance'
  | 'eigen'
  | 'entropy'
  | 'expectation'
  | 'fourier'
  | 'gaussian'
  | 'gaussian-plot'
  | 'gradient'
  | 'heatmap'
  | 'hidden-layer'
  | 'kl'
  | 'linear'
  | 'loss-curve'
  | 'markov'
  | 'matrix'
  | 'metrics'
  | 'mse'
  | 'network'
  | 'norm'
  | 'regularization'
  | 'relu'
  | 'residual'
  | 'scatter'
  | 'sigmoid'
  | 'sigmoid-plot'
  | 'softmax'
  | 'svd'
  | 'variance'
  | 'vector'
  | 'venn';

type FormulaSpec = {
  id: string;
  glyph: GlyphName;
  offsetX: number;
  offsetY: number;
  depth: number;
  scale: number;
  rotation: number;
  opacity: number;
  accent?: boolean;
};

type CameraState = {
  scale: number;
  focusX: number;
  focusY: number;
  progress: number;
};

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const rgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha.toFixed(3) + ')';
};

const getCamera = (frame: number, durationInFrames: number): CameraState => {
  const finalFrame = Math.max(1, durationInFrames - 1);
  const activeFrame = Math.max(0, Math.min(frame, finalFrame));
  const rawProgress = activeFrame / finalFrame;
  const logarithmicRate = Math.log(TARGET_SCALE) / finalFrame;
  // Keep the reference-inspired radial push moving through the final frame.
  // The scale path stays monotonic and never resets, reverses, or eases to zero.
  const scale = Math.exp(logarithmicRate * activeFrame);

  const drift = Easing.inOut(Easing.cubic)(rawProgress);

  return {
    scale,
    focusX: mix(978, 986, drift),
    focusY: mix(562, 568, drift),
    progress: rawProgress,
  };
};

const NEAR_FORMULAS: FormulaSpec[] = [
  {id: 'near-bayes', glyph: 'bayes', offsetX: -720, offsetY: -355, depth: 0.74, scale: 1.08, rotation: -2, opacity: 1},
  {id: 'near-venn', glyph: 'venn', offsetX: -760, offsetY: 320, depth: 0.82, scale: 1.26, rotation: 2, opacity: 0.96},
  {id: 'near-gradient', glyph: 'gradient', offsetX: 680, offsetY: -255, depth: 0.86, scale: 1.02, rotation: 1, opacity: 1, accent: true},
  {id: 'near-gaussian', glyph: 'gaussian-plot', offsetX: 655, offsetY: 350, depth: 0.96, scale: 1.08, rotation: -2, opacity: 0.92},
  {id: 'near-linear', glyph: 'linear', offsetX: 330, offsetY: -500, depth: 0.92, scale: 0.92, rotation: -1, opacity: 0.88},
  {id: 'near-matrix', glyph: 'matrix', offsetX: -125, offsetY: 445, depth: 0.78, scale: 1.05, rotation: 2, opacity: 0.92},
  {id: 'near-sigmoid', glyph: 'sigmoid-plot', offsetX: 430, offsetY: 30, depth: 1.04, scale: 0.84, rotation: -1, opacity: 0.84},
  {id: 'near-distance', glyph: 'distance', offsetX: -130, offsetY: 150, depth: 1.12, scale: 0.86, rotation: 1, opacity: 0.82},
];

const MIDDLE_FORMULAS: FormulaSpec[] = [
  {id: 'mid-mse', glyph: 'mse', offsetX: -600, offsetY: -80, depth: 1.34, scale: 0.82, rotation: 1, opacity: 0.86},
  {id: 'mid-network', glyph: 'network', offsetX: 495, offsetY: -350, depth: 1.42, scale: 0.82, rotation: -2, opacity: 0.82, accent: true},
  {id: 'mid-softmax', glyph: 'softmax', offsetX: -585, offsetY: 255, depth: 1.54, scale: 0.82, rotation: -1, opacity: 0.86},
  {id: 'mid-entropy', glyph: 'entropy', offsetX: 20, offsetY: 245, depth: 1.62, scale: 0.88, rotation: 2, opacity: 0.88},
  {id: 'mid-relu', glyph: 'relu', offsetX: 20, offsetY: -160, depth: 1.72, scale: 0.82, rotation: -2, opacity: 0.82},
  {id: 'mid-scatter', glyph: 'scatter', offsetX: 145, offsetY: 370, depth: 1.78, scale: 0.84, rotation: 2, opacity: 0.8},
  {id: 'mid-eigen', glyph: 'eigen', offsetX: 335, offsetY: -130, depth: 1.9, scale: 0.82, rotation: 1, opacity: 0.8},
  {id: 'mid-cosine', glyph: 'cosine', offsetX: -350, offsetY: 95, depth: 1.98, scale: 0.82, rotation: -2, opacity: 0.78},
  {id: 'mid-fourier', glyph: 'fourier', offsetX: -300, offsetY: -200, depth: 2.08, scale: 0.78, rotation: 1, opacity: 0.76},
  {id: 'mid-variance', glyph: 'variance', offsetX: -455, offsetY: -60, depth: 2.18, scale: 0.78, rotation: 2, opacity: 0.74},
  {id: 'mid-contour', glyph: 'contour', offsetX: -45, offsetY: 300, depth: 2.24, scale: 0.84, rotation: -1, opacity: 0.74, accent: true},
  {id: 'mid-svd', glyph: 'svd', offsetX: 55, offsetY: -240, depth: 2.36, scale: 0.8, rotation: 1, opacity: 0.72},
  {id: 'mid-covariance', glyph: 'covariance', offsetX: 305, offsetY: 165, depth: 2.48, scale: 0.78, rotation: -2, opacity: 0.72},
  {id: 'mid-markov', glyph: 'markov', offsetX: -285, offsetY: -210, depth: 2.58, scale: 0.82, rotation: 2, opacity: 0.7},
];

const DEEP_FORMULAS: FormulaSpec[] = [
  {id: 'deep-residual', glyph: 'residual', offsetX: -330, offsetY: -230, depth: 2.72, scale: 0.74, rotation: -1, opacity: 0.72},
  {id: 'deep-hidden', glyph: 'hidden-layer', offsetX: 330, offsetY: -225, depth: 2.84, scale: 0.76, rotation: 1, opacity: 0.72},
  {id: 'deep-norm', glyph: 'norm', offsetX: -345, offsetY: 205, depth: 2.96, scale: 0.74, rotation: 2, opacity: 0.72},
  {id: 'deep-expectation', glyph: 'expectation', offsetX: 345, offsetY: 210, depth: 3.08, scale: 0.72, rotation: -2, opacity: 0.72},
  {id: 'deep-vector', glyph: 'vector', offsetX: -205, offsetY: -250, depth: 3.18, scale: 0.72, rotation: 1, opacity: 0.72},
  {id: 'deep-gaussian-formula', glyph: 'gaussian', offsetX: 205, offsetY: -255, depth: 3.28, scale: 0.72, rotation: -1, opacity: 0.72},
  {id: 'deep-chain', glyph: 'chain-rule', offsetX: -245, offsetY: 160, depth: 3.4, scale: 0.74, rotation: -1, opacity: 0.74},
  {id: 'deep-regularization', glyph: 'regularization', offsetX: 245, offsetY: 170, depth: 3.52, scale: 0.74, rotation: 2, opacity: 0.74},
  {id: 'deep-confusion', glyph: 'confusion', offsetX: -85, offsetY: -235, depth: 3.64, scale: 0.76, rotation: 1, opacity: 0.76},
  {id: 'deep-decision', glyph: 'decision', offsetX: 90, offsetY: 235, depth: 3.76, scale: 0.76, rotation: -2, opacity: 0.76},
  {id: 'deep-binary-loss', glyph: 'binary-loss', offsetX: 230, offsetY: -85, depth: 3.9, scale: 0.74, rotation: 1, opacity: 0.76},
  {id: 'deep-kl', glyph: 'kl', offsetX: -230, offsetY: 70, depth: 4.04, scale: 0.74, rotation: -1, opacity: 0.76},
  {id: 'deep-heatmap', glyph: 'heatmap', offsetX: -165, offsetY: -145, depth: 4.2, scale: 0.78, rotation: 2, opacity: 0.78, accent: true},
  {id: 'deep-sigmoid', glyph: 'sigmoid', offsetX: 170, offsetY: 145, depth: 4.34, scale: 0.76, rotation: -2, opacity: 0.78},
  {id: 'deep-loss', glyph: 'loss-curve', offsetX: 125, offsetY: -120, depth: 4.5, scale: 0.8, rotation: 1, opacity: 0.8},
  {id: 'deep-metrics', glyph: 'metrics', offsetX: -130, offsetY: 110, depth: 4.68, scale: 0.74, rotation: -1, opacity: 0.8},
  {id: 'deep-gaussian-plot', glyph: 'gaussian-plot', offsetX: -112, offsetY: -70, depth: 4.86, scale: 0.74, rotation: 2, opacity: 0.82},
  {id: 'deep-contour-final', glyph: 'contour', offsetX: 104, offsetY: 55, depth: 5.02, scale: 0.72, rotation: -2, opacity: 0.82, accent: true},
  {id: 'deep-network-final', glyph: 'network', offsetX: -110, offsetY: 55, depth: 5.38, scale: 0.62, rotation: 1, opacity: 0.84},
  {id: 'deep-metrics-final', glyph: 'metrics', offsetX: 116, offsetY: -4, depth: 5.28, scale: 0.62, rotation: -1, opacity: 0.82},
  {id: 'deep-loss-final', glyph: 'loss-curve', offsetX: 106, offsetY: -68, depth: 5.48, scale: 0.64, rotation: 1, opacity: 0.84},
  {id: 'deep-gaussian-final', glyph: 'gaussian', offsetX: 18, offsetY: -74, depth: 5.62, scale: 0.58, rotation: -1, opacity: 0.82},
  {id: 'deep-attention-hero', glyph: 'attention', offsetX: -1, offsetY: -18, depth: 5.92, scale: 0.88, rotation: 0, opacity: 1, accent: true},
  {id: 'deep-softmax-seed', glyph: 'softmax', offsetX: 30, offsetY: 58, depth: 6.24, scale: 0.58, rotation: 2, opacity: 0.8},
  {id: 'deep-entropy-seed', glyph: 'entropy', offsetX: -30, offsetY: 38, depth: 6.4, scale: 0.58, rotation: -2, opacity: 0.8},
  {id: 'micro-linear-a', glyph: 'linear', offsetX: -115, offsetY: -64, depth: 6.8, scale: 0.42, rotation: -2, opacity: 0.5},
  {id: 'micro-eigen-a', glyph: 'eigen', offsetX: 112, offsetY: -58, depth: 7.0, scale: 0.4, rotation: 2, opacity: 0.48},
  {id: 'micro-residual-a', glyph: 'residual', offsetX: -118, offsetY: 62, depth: 7.25, scale: 0.42, rotation: 1, opacity: 0.48},
  {id: 'micro-expectation-a', glyph: 'expectation', offsetX: 116, offsetY: 57, depth: 7.5, scale: 0.4, rotation: -1, opacity: 0.48},
  {id: 'micro-svd-a', glyph: 'svd', offsetX: -78, offsetY: -38, depth: 7.75, scale: 0.4, rotation: 2, opacity: 0.46},
  {id: 'micro-norm-a', glyph: 'norm', offsetX: 76, offsetY: 65, depth: 8.0, scale: 0.38, rotation: -2, opacity: 0.46},
  {id: 'micro-sigmoid-a', glyph: 'sigmoid', offsetX: -62, offsetY: 50, depth: 8.25, scale: 0.36, rotation: -1, opacity: 0.45},
  {id: 'micro-variance-a', glyph: 'variance', offsetX: 68, offsetY: -47, depth: 8.5, scale: 0.36, rotation: 1, opacity: 0.45},
  {id: 'micro-markov-a', glyph: 'markov', offsetX: -102, offsetY: -5, depth: 8.75, scale: 0.38, rotation: 2, opacity: 0.44},
  {id: 'micro-vector-a', glyph: 'vector', offsetX: 103, offsetY: 8, depth: 9.0, scale: 0.38, rotation: -2, opacity: 0.44},
  {id: 'micro-chain-a', glyph: 'chain-rule', offsetX: -73, offsetY: 16, depth: 9.25, scale: 0.35, rotation: -1, opacity: 0.43},
  {id: 'micro-regularization-a', glyph: 'regularization', offsetX: 78, offsetY: 20, depth: 9.5, scale: 0.35, rotation: 1, opacity: 0.43},
  {id: 'micro-confusion-a', glyph: 'confusion', offsetX: -49, offsetY: -69, depth: 9.75, scale: 0.4, rotation: 2, opacity: 0.42},
  {id: 'micro-decision-a', glyph: 'decision', offsetX: 52, offsetY: 70, depth: 10.0, scale: 0.38, rotation: -2, opacity: 0.42},
  {id: 'micro-cosine-a', glyph: 'cosine', offsetX: -23, offsetY: 63, depth: 10.25, scale: 0.34, rotation: 1, opacity: 0.4},
  {id: 'micro-fourier-a', glyph: 'fourier', offsetX: 28, offsetY: -66, depth: 10.5, scale: 0.34, rotation: -1, opacity: 0.4},
];

const serifStyle: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: 'italic',
  fontWeight: 500,
  letterSpacing: '-0.035em',
  lineHeight: 1.08,
  whiteSpace: 'nowrap',
};

const operatorStyle: React.CSSProperties = {
  fontStyle: 'normal',
  letterSpacing: '-0.02em',
};

const subStyle: React.CSSProperties = {
  fontSize: '0.56em',
  verticalAlign: 'sub',
  lineHeight: 0,
};

const superStyle: React.CSSProperties = {
  fontSize: '0.56em',
  verticalAlign: 'super',
  lineHeight: 0,
};

const Equation: React.FC<{
  children: React.ReactNode;
  size?: number;
  width?: number;
  center?: boolean;
}> = ({children, size = 72, width = 760, center = true}) => (
  <div
    style={{
      ...serifStyle,
      width,
      fontSize: size,
      textAlign: center ? 'center' : 'left',
    }}
  >
    {children}
  </div>
);

const Fraction: React.FC<{
  numerator: React.ReactNode;
  denominator: React.ReactNode;
}> = ({numerator, denominator}) => (
  <span
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      verticalAlign: 'middle',
      lineHeight: 0.95,
      margin: '0 0.15em',
      transform: 'translateY(-0.05em)',
    }}
  >
    <span style={{borderBottom: '0.055em solid currentColor', padding: '0 0.13em 0.06em'}}>
      {numerator}
    </span>
    <span style={{paddingTop: '0.06em'}}>{denominator}</span>
  </span>
);

const PlotFrame: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
}> = ({children, width = 460, height = 300}) => (
  <svg width={width} height={height} viewBox="0 0 460 300" fill="none">
    <path d="M54 24V248H426" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M54 24L46 40M54 24L62 40M426 248L410 240M426 248L410 256" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    {children}
  </svg>
);

const VennGlyph: React.FC = () => (
  <svg width="430" height="300" viewBox="0 0 430 300" fill="none">
    <circle cx="165" cy="145" r="100" stroke="currentColor" strokeWidth="6" />
    <circle cx="265" cy="145" r="100" stroke="currentColor" strokeWidth="6" />
    <path d="M215 64C183 82 165 112 165 145C165 179 184 209 215 226C246 209 265 179 265 145C265 112 247 82 215 64Z" fill="currentColor" opacity="0.12" />
    <path d="M197 80L236 210M178 96L220 230M215 66L253 198" stroke="currentColor" strokeWidth="3" opacity="0.55" />
    <text x="104" y="86" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="700">A</text>
    <text x="305" y="86" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="700">B</text>
    <text x="179" y="157" fill="currentColor" fontFamily="Georgia, serif" fontSize="29">P(A∩B)</text>
  </svg>
);

const NetworkGlyph: React.FC = () => {
  const left = [[55, 70], [55, 150], [55, 230]];
  const middle = [[220, 45], [220, 112], [220, 188], [220, 255]];
  const right = [[390, 102], [390, 202]];
  return (
    <svg width="450" height="300" viewBox="0 0 450 300" fill="none">
      {left.flatMap(([x1, y1], leftIndex) =>
        middle.map(([x2, y2], middleIndex) => (
          <line key={'lm-' + leftIndex + '-' + middleIndex} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2.5" opacity="0.42" />
        )),
      )}
      {middle.flatMap(([x1, y1], middleIndex) =>
        right.map(([x2, y2], rightIndex) => (
          <line key={'mr-' + middleIndex + '-' + rightIndex} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2.5" opacity="0.42" />
        )),
      )}
      {[...left, ...middle, ...right].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={index >= left.length && index < left.length + middle.length ? 17 : 15} fill="white" stroke="currentColor" strokeWidth="5" />
      ))}
      <text x="28" y="286" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">INPUT</text>
      <text x="181" y="286" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">FEATURES</text>
      <text x="354" y="286" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">OUTPUT</text>
    </svg>
  );
};

const GaussianPlot: React.FC = () => (
  <PlotFrame>
    <path d="M66 238C122 236 151 218 182 164C207 119 224 74 242 52C258 74 274 119 300 164C330 218 365 236 418 238" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M242 54V248" stroke="currentColor" strokeWidth="3" strokeDasharray="9 9" opacity="0.55" />
    <path d="M178 165V248M302 165V248" stroke="currentColor" strokeWidth="2.5" strokeDasharray="7 9" opacity="0.36" />
    <text x="230" y="280" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="28">μ</text>
    <text x="145" y="280" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="25">μ−σ</text>
    <text x="284" y="280" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="25">μ+σ</text>
  </PlotFrame>
);

const SigmoidPlot: React.FC = () => (
  <PlotFrame>
    <path d="M68 225C136 224 168 217 194 185C218 156 224 116 248 87C276 53 318 48 416 48" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M54 137H426" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 10" opacity="0.35" />
    <text x="18" y="57" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="24">1</text>
    <text x="10" y="146" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="24">0.5</text>
    <text x="271" y="110" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="30">σ(z)</text>
  </PlotFrame>
);

const ScatterGlyph: React.FC = () => {
  const points = [[88, 211], [112, 196], [139, 207], [166, 171], [194, 164], [217, 141], [252, 147], [278, 112], [304, 123], [332, 91], [362, 82], [391, 61]];
  return (
    <PlotFrame>
      <path d="M76 223L405 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      {points.map(([x, y], index) => (
        <React.Fragment key={index}>
          <circle cx={x} cy={y} r="8" fill="white" stroke="currentColor" strokeWidth="4" />
          {index % 3 === 1 ? <path d={'M' + x + ' ' + y + 'V' + (229 - x * 0.42)} stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity="0.45" /> : null}
        </React.Fragment>
      ))}
      <text x="286" y="186" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="28">ŷ = wᵀx + b</text>
    </PlotFrame>
  );
};

const ContourGlyph: React.FC = () => (
  <svg width="430" height="310" viewBox="0 0 430 310" fill="none">
    <ellipse cx="220" cy="158" rx="180" ry="118" stroke="currentColor" strokeWidth="4" />
    <ellipse cx="220" cy="158" rx="136" ry="88" stroke="currentColor" strokeWidth="4" opacity="0.8" />
    <ellipse cx="220" cy="158" rx="90" ry="57" stroke="currentColor" strokeWidth="4" opacity="0.65" />
    <ellipse cx="220" cy="158" rx="42" ry="27" stroke="currentColor" strokeWidth="4" opacity="0.5" />
    <path d="M82 74L123 101L160 116L194 139L220 158" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    {[[82, 74], [123, 101], [160, 116], [194, 139], [220, 158]].map(([x, y], index) => (
      <circle key={index} cx={x} cy={y} r={index === 4 ? 10 : 8} fill="white" stroke="currentColor" strokeWidth="5" />
    ))}
    <path d="M205 142L220 158L198 160" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <text x="238" y="174" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700">MIN J(θ)</text>
  </svg>
);

const HeatmapGlyph: React.FC = () => {
  const values = [
    0.18, 0.34, 0.56, 0.28, 0.14,
    0.24, 0.48, 0.82, 0.42, 0.2,
    0.16, 0.38, 0.94, 0.58, 0.27,
    0.12, 0.31, 0.69, 0.47, 0.22,
    0.09, 0.2, 0.4, 0.29, 0.13,
  ];
  return (
    <svg width="390" height="310" viewBox="0 0 390 310" fill="none">
      {values.map((value, index) => {
        const column = index % 5;
        const row = Math.floor(index / 5);
        return (
          <rect
            key={index}
            x={35 + column * 50}
            y={35 + row * 50}
            width="42"
            height="42"
            rx="6"
            fill="currentColor"
            opacity={value}
            stroke="currentColor"
            strokeWidth="2"
          />
        );
      })}
      <path d="M298 58H354M298 109H354M298 160H354M298 211H354M298 262H354" stroke="currentColor" strokeWidth="9" strokeLinecap="round" opacity="0.28" />
      <path d="M278 160H318" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M306 148L318 160L306 172" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <text x="34" y="22" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">WEIGHTS</text>
      <text x="295" y="22" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">OUTPUT</text>
    </svg>
  );
};

const ConfusionGlyph: React.FC = () => (
  <svg width="360" height="320" viewBox="0 0 360 320" fill="none">
    <path d="M72 50H322V286H72Z" stroke="currentColor" strokeWidth="5" />
    <path d="M197 50V286M72 168H322" stroke="currentColor" strokeWidth="4" />
    {[
      ['TP', 134, 118],
      ['FP', 260, 118],
      ['FN', 134, 238],
      ['TN', 260, 238],
    ].map(([label, x, y]) => (
      <text key={String(label)} x={Number(x)} y={Number(y)} textAnchor="middle" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="800">{label}</text>
    ))}
    <text x="190" y="30" textAnchor="middle" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">PREDICTED</text>
    <text x="30" y="172" textAnchor="middle" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" transform="rotate(-90 30 172)">ACTUAL</text>
  </svg>
);

const DecisionGlyph: React.FC = () => {
  const leftPoints = [[90, 210], [120, 235], [145, 190], [162, 224], [190, 205], [132, 157], [205, 168]];
  const rightPoints = [[270, 95], [300, 122], [328, 80], [350, 120], [288, 158], [365, 166], [325, 188]];
  return (
    <svg width="430" height="300" viewBox="0 0 430 300" fill="none">
      <path d="M60 258L384 36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      {leftPoints.map(([x, y], index) => <circle key={'a-' + index} cx={x} cy={y} r="9" fill="white" stroke="currentColor" strokeWidth="4" />)}
      {rightPoints.map(([x, y], index) => <path key={'b-' + index} d={'M' + (x - 8) + ' ' + (y - 8) + 'L' + (x + 8) + ' ' + (y + 8) + 'M' + (x + 8) + ' ' + (y - 8) + 'L' + (x - 8) + ' ' + (y + 8)} stroke="currentColor" strokeWidth="5" strokeLinecap="round" />)}
      <text x="210" y="75" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="27" transform="rotate(-34 210 75)">wᵀx + b = 0</text>
    </svg>
  );
};

const VectorGlyph: React.FC = () => (
  <svg width="420" height="300" viewBox="0 0 420 300" fill="none">
    <path d="M72 240L350 78" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M350 78L325 80M350 78L336 100" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M72 240L303 210" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M303 210L280 201M303 210L283 224" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M145 230C140 198 151 169 179 148" stroke="currentColor" strokeWidth="4" strokeDasharray="8 7" />
    <text x="184" y="192" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="32">θ</text>
    <text x="351" y="69" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="32">x</text>
    <text x="307" y="231" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="32">y</text>
  </svg>
);

const MarkovGlyph: React.FC = () => (
  <svg width="420" height="280" viewBox="0 0 420 280" fill="none">
    {[[82, 145, 'S₁'], [210, 62, 'S₂'], [338, 145, 'S₃'], [210, 228, 'S₄']].map(([x, y, label]) => (
      <React.Fragment key={String(label)}>
        <circle cx={Number(x)} cy={Number(y)} r="38" fill="white" stroke="currentColor" strokeWidth="6" />
        <text x={Number(x)} y={Number(y) + 9} textAnchor="middle" fill="currentColor" fontFamily="Georgia, serif" fontStyle="italic" fontSize="29">{label}</text>
      </React.Fragment>
    ))}
    <path d="M114 123L174 84M246 84L306 123M306 167L246 206M174 206L114 167" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M166 80L174 84L170 94M302 112L306 123L295 124M256 203L246 206L247 195M119 177L114 167L125 166" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const LossCurveGlyph: React.FC = () => (
  <PlotFrame>
    <path d="M70 55C121 102 145 160 194 192C246 226 318 228 414 231" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M70 78C123 118 163 169 215 191C278 218 337 210 414 202" stroke="currentColor" strokeWidth="4" strokeDasharray="11 9" strokeLinecap="round" opacity="0.62" />
    <text x="287" y="187" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">VALIDATION</text>
    <text x="305" y="259" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">TRAINING</text>
  </PlotFrame>
);

const MatrixGlyph: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 68, fontStyle: 'italic'}}>
    <span>A =</span>
    <div style={{position: 'relative', padding: '12px 30px'}}>
      <div style={{position: 'absolute', inset: 0, borderLeft: '6px solid currentColor', borderTop: '6px solid currentColor', borderBottom: '6px solid currentColor', width: 22}} />
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, borderRight: '6px solid currentColor', borderTop: '6px solid currentColor', borderBottom: '6px solid currentColor', width: 22}} />
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 74px)', gap: '13px 22px', textAlign: 'center', fontSize: 48}}>
        {['a₁₁', 'a₁₂', 'a₁₃', 'a₂₁', 'a₂₂', 'a₂₃', 'a₃₁', 'a₃₂', 'a₃₃'].map((value) => <span key={value}>{value}</span>)}
      </div>
    </div>
  </div>
);

const FormulaGlyph: React.FC<{name: GlyphName}> = ({name}) => {
  switch (name) {
    case 'attention':
      return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
          <Equation size={82} width={920}>
            A = <span style={operatorStyle}>softmax</span>
            <span style={{fontStyle: 'normal'}}>(</span>
            <Fraction numerator={<>QK<span style={superStyle}>T</span></>} denominator={<>√d<span style={subStyle}>k</span></>} />
            <span style={{fontStyle: 'normal'}}>)</span>V
          </Equation>
          <div style={{width: 690, height: 3, background: 'currentColor', opacity: 0.24}} />
          <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '0.22em', fontStyle: 'normal'}}>SCALED ATTENTION</div>
        </div>
      );
    case 'bayes':
      return (
        <Equation size={80} width={840}>
          P(A|B) = <Fraction numerator={<>P(B|A)P(A)</>} denominator={<>P(B)</>} />
        </Equation>
      );
    case 'binary-loss':
      return (
        <Equation size={64} width={880}>
          L = −[y <span style={operatorStyle}>log</span> p + (1−y) <span style={operatorStyle}>log</span>(1−p)]
        </Equation>
      );
    case 'chain-rule':
      return (
        <Equation size={67} width={820}>
          <Fraction numerator={<>∂L</>} denominator={<>∂w</>} /> =
          <Fraction numerator={<>∂L</>} denominator={<>∂ŷ</>} />
          <Fraction numerator={<>∂ŷ</>} denominator={<>∂w</>} />
        </Equation>
      );
    case 'confusion':
      return <ConfusionGlyph />;
    case 'contour':
      return <ContourGlyph />;
    case 'cosine':
      return (
        <Equation size={66} width={850}>
          <span style={operatorStyle}>cos</span> θ = <Fraction numerator={<>x·y</>} denominator={<>‖x‖<span style={subStyle}>2</span>‖y‖<span style={subStyle}>2</span></>} />
        </Equation>
      );
    case 'covariance':
      return (
        <Equation size={58} width={920}>
          <span style={operatorStyle}>Cov</span>(X,Y) = <Fraction numerator={<>1</>} denominator={<>n</>} /> Σ<span style={subStyle}>i</span>(x<span style={subStyle}>i</span>−x̄)(y<span style={subStyle}>i</span>−ȳ)
        </Equation>
      );
    case 'decision':
      return <DecisionGlyph />;
    case 'distance':
      return (
        <Equation size={69} width={800}>
          d(x,y) = √[Σ<span style={subStyle}>i</span>(x<span style={subStyle}>i</span>−y<span style={subStyle}>i</span>)<span style={superStyle}>2</span>]
        </Equation>
      );
    case 'eigen':
      return <Equation size={94} width={520}>Av = λv</Equation>;
    case 'entropy':
      return (
        <Equation size={72} width={690}>
          H(p) = −Σ<span style={subStyle}>i</span> p<span style={subStyle}>i</span> <span style={operatorStyle}>log</span> p<span style={subStyle}>i</span>
        </Equation>
      );
    case 'expectation':
      return (
        <Equation size={72} width={650}>
          E[X] = Σ<span style={subStyle}>i</span> x<span style={subStyle}>i</span>p<span style={subStyle}>i</span>
        </Equation>
      );
    case 'fourier':
      return (
        <Equation size={61} width={880}>
          X<span style={subStyle}>k</span> = Σ<span style={subStyle}>n=0</span><span style={superStyle}>N−1</span> x<span style={subStyle}>n</span>e<span style={superStyle}>−i2πkn/N</span>
        </Equation>
      );
    case 'gaussian':
      return (
        <Equation size={55} width={980}>
          p(x) = <Fraction numerator={<>1</>} denominator={<>σ√(2π)</>} /> e<span style={superStyle}>−(x−μ)²/(2σ²)</span>
        </Equation>
      );
    case 'gaussian-plot':
      return <GaussianPlot />;
    case 'gradient':
      return (
        <Equation size={74} width={900}>
          θ<span style={subStyle}>t+1</span> = θ<span style={subStyle}>t</span> − η∇J(θ<span style={subStyle}>t</span>)
        </Equation>
      );
    case 'heatmap':
      return <HeatmapGlyph />;
    case 'hidden-layer':
      return <Equation size={82} width={650}>h = φ(Wx + b)</Equation>;
    case 'kl':
      return (
        <Equation size={63} width={850}>
          D<span style={subStyle}>KL</span>(p‖q) = Σ<span style={subStyle}>i</span> p<span style={subStyle}>i</span> <span style={operatorStyle}>log</span>
          <Fraction numerator={<>p<span style={subStyle}>i</span></>} denominator={<>q<span style={subStyle}>i</span></>} />
        </Equation>
      );
    case 'linear':
      return <Equation size={92} width={620}>ŷ = w<span style={superStyle}>T</span>x + b</Equation>;
    case 'loss-curve':
      return <LossCurveGlyph />;
    case 'markov':
      return <MarkovGlyph />;
    case 'matrix':
      return <MatrixGlyph />;
    case 'metrics':
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          <Equation size={55} width={760}>P = <Fraction numerator={<>TP</>} denominator={<>TP+FP</>} /></Equation>
          <Equation size={55} width={760}>R = <Fraction numerator={<>TP</>} denominator={<>TP+FN</>} /></Equation>
          <Equation size={55} width={760}>F<span style={subStyle}>1</span> = <Fraction numerator={<>2PR</>} denominator={<>P+R</>} /></Equation>
        </div>
      );
    case 'mse':
      return (
        <Equation size={65} width={860}>
          J = <Fraction numerator={<>1</>} denominator={<>n</>} /> Σ<span style={subStyle}>i</span>(ŷ<span style={subStyle}>i</span>−y<span style={subStyle}>i</span>)<span style={superStyle}>2</span>
        </Equation>
      );
    case 'network':
      return <NetworkGlyph />;
    case 'norm':
      return (
        <Equation size={76} width={660}>
          ‖x‖<span style={subStyle}>2</span> = √[Σ<span style={subStyle}>i</span>x<span style={subStyle}>i</span><span style={superStyle}>2</span>]
        </Equation>
      );
    case 'regularization':
      return (
        <Equation size={66} width={820}>
          J<span style={subStyle}>reg</span> = J + λ‖w‖<span style={subStyle}>2</span><span style={superStyle}>2</span>
        </Equation>
      );
    case 'relu':
      return (
        <Equation size={75} width={680}>
          <span style={operatorStyle}>ReLU</span>(z) = <span style={operatorStyle}>max</span>(0,z)
        </Equation>
      );
    case 'residual':
      return (
        <Equation size={82} width={620}>
          e<span style={subStyle}>i</span> = y<span style={subStyle}>i</span> − ŷ<span style={subStyle}>i</span>
        </Equation>
      );
    case 'scatter':
      return <ScatterGlyph />;
    case 'sigmoid':
      return (
        <Equation size={72} width={750}>
          σ(z) = <Fraction numerator={<>1</>} denominator={<>1 + e<span style={superStyle}>−z</span></>} />
        </Equation>
      );
    case 'sigmoid-plot':
      return <SigmoidPlot />;
    case 'softmax':
      return (
        <Equation size={66} width={860}>
          p<span style={subStyle}>i</span> =
          <Fraction numerator={<>e<span style={superStyle}>zᵢ</span></>} denominator={<>Σ<span style={subStyle}>j</span> e<span style={superStyle}>zⱼ</span></>} />
        </Equation>
      );
    case 'svd':
      return <Equation size={92} width={620}>A = UΣV<span style={superStyle}>T</span></Equation>;
    case 'variance':
      return (
        <Equation size={67} width={770}>
          <span style={operatorStyle}>Var</span>(X) = E[(X−μ)<span style={superStyle}>2</span>]
        </Equation>
      );
    case 'vector':
      return <VectorGlyph />;
    case 'venn':
      return <VennGlyph />;
    default:
      return null;
  }
};

const FormulaSprite: React.FC<{
  spec: FormulaSpec;
  camera: CameraState;
  width: number;
  height: number;
}> = ({spec, camera, width, height}) => {
  const depthParallax = 1 + (1 / spec.depth - 0.35) * 0.025;
  const radialScale = Math.pow(camera.scale, depthParallax);
  const projection = camera.scale / spec.depth;
  const projectedScale = spec.scale * projection;
  const x = camera.focusX + spec.offsetX * radialScale;
  const y = camera.focusY + spec.offsetY * radialScale;
  const visibility = interpolate(
    projectedScale,
    [0.035, 0.08, 0.16, 0.38, 0.86, 1.65, 4.8],
    [0.01, 0.1, 0.26, 0.52, 0.86, 1, 0.82],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.quad),
    },
  );
  const opacity = Math.min(1, spec.opacity * visibility);
  const ink = spec.accent ? '#167F91' : '#1A2835';
  const color = rgba(ink, opacity);
  const margin = 1350;
  const potentiallyVisible =
    x > -margin &&
    x < width + margin &&
    y > -margin &&
    y < height + margin &&
    projectedScale > 0.035;

  if (!potentiallyVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        color,
        opacity,
        transform:
          'translate(-50%, -50%) scale(' +
          projectedScale.toFixed(5) +
          ') rotate(' +
          spec.rotation +
          'deg)',
        transformOrigin: 'center center',
        zIndex: Math.round(10000 / spec.depth),
        mixBlendMode: 'multiply',
        willChange: 'transform, opacity',
        pointerEvents: 'none',
      }}
    >
      <FormulaGlyph name={spec.glyph} />
    </div>
  );
};

const FormulaLayer: React.FC<{
  formulas: FormulaSpec[];
  camera: CameraState;
  width: number;
  height: number;
}> = ({formulas, camera, width, height}) => (
  <>
    {formulas.map((spec) => (
      <FormulaSprite
        key={spec.id}
        spec={spec}
        camera={camera}
        width={width}
        height={height}
      />
    ))}
  </>
);

const PaperBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#F7F5EF',
      backgroundImage:
        'radial-gradient(circle at 51% 52%, rgba(255,255,255,0.98) 0%, rgba(252,251,247,0.96) 42%, rgba(237,233,224,0.94) 100%), repeating-linear-gradient(0deg, rgba(32,45,54,0.018) 0px, rgba(32,45,54,0.018) 1px, transparent 1px, transparent 4px)',
    }}
  >
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(104deg, transparent 0%, rgba(255,255,255,0.35) 46%, transparent 69%)',
        opacity: 0.65,
      }}
    />
  </AbsoluteFill>
);

export const Motion: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const camera = getCamera(frame, durationInFrames);
  const designScale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const offsetX = (width - DESIGN_WIDTH * designScale) / 2;
  const offsetY = (height - DESIGN_HEIGHT * designScale) / 2;

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#F7F5EF'}}>
      <PaperBackground />
      <div
        style={{
          position: 'absolute',
          left: offsetX,
          top: offsetY,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: 'scale(' + designScale + ')',
          transformOrigin: 'top left',
          overflow: 'hidden',
        }}
      >
        <FormulaLayer formulas={DEEP_FORMULAS} camera={camera} width={DESIGN_WIDTH} height={DESIGN_HEIGHT} />
        <FormulaLayer formulas={MIDDLE_FORMULAS} camera={camera} width={DESIGN_WIDTH} height={DESIGN_HEIGHT} />
        <FormulaLayer formulas={NEAR_FORMULAS} camera={camera} width={DESIGN_WIDTH} height={DESIGN_HEIGHT} />
      </div>
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 160px rgba(35,48,55,0.10)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
