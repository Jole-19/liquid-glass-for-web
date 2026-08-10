/**
 * Adaptive contrast, demonstrated by moving a panel across a backdrop that goes
 * from black to white.
 *
 * A slider rather than an animation, because the point being made is about a
 * threshold: you want to be able to stop right at the crossover and see that
 * the theme holds rather than strobing. That is the hysteresis doing its job,
 * and it is invisible in anything that moves on its own.
 */
import { useEffect, useRef, useState } from 'react';
import { GlassSurface, useAdaptiveContrast } from '../../lib';
import { Section } from '../components/Section';
import { CodeBlock } from '../components/CodeBlock';

const WIDTH = 720;
const HEIGHT = 220;

const USAGE = `const panelRef = useRef<HTMLDivElement>(null);
const { mode, luminance } = useAdaptiveContrast(panelRef, {
  // Sample a specific element rather than painting the whole page.
  source: canvasRef,
});

// The hook writes data-lg-contrast on the panel. Every token
// downstream of it — foreground, tint, rim, specular, focus ring —
// re-resolves from the stylesheet. Nothing else to wire up.
<GlassSurface ref={panelRef}>Still readable</GlassSurface>`;

function paint(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;
  ctx.scale(dpr, dpr);

  const ramp = ctx.createLinearGradient(0, 0, WIDTH, 0);
  ramp.addColorStop(0, '#05050a');
  ramp.addColorStop(0.42, '#2b2f6b');
  ramp.addColorStop(0.62, '#c8a0e8');
  ramp.addColorStop(1, '#fdfdff');
  ctx.fillStyle = ramp;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Some structure, so the sampled average is not a single flat value and the
  // hook is doing real averaging rather than reading one pixel.
  for (let i = 0; i < 40; i += 1) {
    const x = (i / 40) * WIDTH;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(x, 0, WIDTH / 80, HEIGHT);
  }
}

export function AdaptiveSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) paint(canvas);
  }, []);

  const { mode, luminance, resample } = useAdaptiveContrast(panelRef, {
    source: canvasRef,
  });

  useEffect(() => {
    resample();
  }, [x, resample]);

  // Smooth font color transition: maps luminance to the HSL values
  // of the light and dark tokens so the text fades smoothly over a distance.
  const l = luminance ?? 0;
  const t = Math.max(0, Math.min(1, (l - 0.05) / 0.7));
  
  const fg = `hsl(${228 * t} ${24 * t}% ${100 - 82 * t}% / ${0.94 + 0.06 * t})`;
  const fgMuted = `hsl(${228 * t} ${14 * t}% ${100 - 58 * t}% / ${0.66 + 0.34 * t})`;

  return (
    <Section
      id="adaptive"
      eyebrow="The material"
      title="Adaptive contrast"
      intro={
        <p>
          Translucency has a legibility problem that no amount of tuning fixes:
          the same panel sits over a black sky in one scroll position and a
          white wall in the next. The hook samples what is actually behind the
          element and flips the entire token theme when it needs to.
        </p>
      }
    >
      <div className="ramp">
        <canvas ref={canvasRef} className="ramp__canvas" aria-hidden="true" />
        <GlassSurface
          ref={panelRef}
          className="ramp__panel"
          radius="lg"
          elevation="raised"
          style={
            {
              left: `${x}%`,
              transform: `translate(-${x}%, -50%)`,
              '--lg-fg': fg,
              '--lg-fg-muted': fgMuted,
            } as React.CSSProperties
          }
        >
          <strong>Still readable</strong>
          <span>at either end</span>
        </GlassSurface>
      </div>

      <div className="ramp__controls">
        <label className="ramp__slider">
          <span>Panel position</span>
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(event) => setX(Number(event.target.value))}
            aria-describedby="adaptive-readout"
          />
        </label>

        <dl className="readout" id="adaptive-readout">
          <div>
            <dt>Luminance</dt>
            {/* Politely announced: it changes continuously while dragging, and
                an assertive region would interrupt on every frame. */}
            <dd aria-live="polite">
              {luminance === null ? '—' : luminance.toFixed(3)}
            </dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd aria-live="polite">{mode}</dd>
          </div>
        </dl>
      </div>

      <CodeBlock code={USAGE} filename="adaptive.tsx" />
    </Section>
  );
}
