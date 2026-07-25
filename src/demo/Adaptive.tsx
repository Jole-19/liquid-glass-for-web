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
import { GlassSurface, useAdaptiveContrast } from '../lib';

const WIDTH = 720;
const HEIGHT = 200;

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

export function Adaptive() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(12);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) paint(canvas);
  }, []);

  const { mode, luminance } = useAdaptiveContrast(panelRef, {
    source: canvasRef,
  });

  return (
    <section className="demo-section">
      <h2>Adaptive contrast</h2>
      <p className="demo-note">
        Drag the panel across the ramp. The hook samples the canvas pixels
        behind it and flips the entire token theme — foreground, tint, rim and
        specular — so the glass stays legible at both ends. Measured luminance:{' '}
        <code>{luminance === null ? '—' : luminance.toFixed(3)}</code>, theme:{' '}
        <code>{mode}</code>.
      </p>

      <div className="demo-adaptive">
        <canvas ref={canvasRef} className="demo-adaptive__canvas" aria-hidden="true" />
        <GlassSurface
          ref={panelRef}
          className="demo-adaptive__panel"
          radius="lg"
          elevation="raised"
          style={{ left: `${x}%` }}
        >
          <strong>Still readable</strong>
          <span>at either end</span>
        </GlassSurface>
      </div>

      <label className="demo-adaptive__control">
        Panel position
        <input
          type="range"
          min={0}
          max={72}
          value={x}
          onChange={(event) => setX(Number(event.target.value))}
        />
      </label>
    </section>
  );
}
