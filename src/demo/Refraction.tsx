/**
 * Tier 1 vs Tier 2, side by side over the same backdrop.
 *
 * The comparison only means anything over imagery with hard edges and saturated
 * colour, because that is where refraction and blur visibly diverge: Tier 1
 * smears what is behind the panel, Tier 2 bends it, so straight lines crossing
 * the panel edge break and offset.
 *
 * The backdrop is a `<canvas>` rather than a photo. It keeps the repo free of
 * binary assets and licensing questions, and it also happens to be the fast
 * path in the renderer -- canvas, img and video go through `drawImage`, while
 * anything else behind the glass is rasterized with `html-to-image`.
 */
import { useEffect, useRef, useState } from 'react';
import {
  GlassPanel,
  GlassStage,
  GlassSurface,
  type RefractionStatus,
} from '../lib';

const SIZE = 720;

function paintBackdrop(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SIZE * dpr;
  canvas.height = Math.round(SIZE * 0.62) * dpr;
  ctx.scale(dpr, dpr);

  const h = SIZE * 0.62;

  const bg = ctx.createLinearGradient(0, 0, SIZE, h);
  bg.addColorStop(0, '#1b1140');
  bg.addColorStop(0.5, '#0b2a4a');
  bg.addColorStop(1, '#3d0f36');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, h);

  // A hard grid. Straight lines are the most legible test there is: under Tier
  // 1 they blur but stay straight, under Tier 2 they visibly bend at the rim.
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= SIZE; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(SIZE, y + 0.5);
    ctx.stroke();
  }

  const blobs: Array<[number, number, number, string]> = [
    [SIZE * 0.2, h * 0.3, 150, 'rgba(255,64,160,0.85)'],
    [SIZE * 0.78, h * 0.24, 130, 'rgba(64,220,255,0.8)'],
    [SIZE * 0.6, h * 0.8, 170, 'rgba(255,190,60,0.75)'],
    [SIZE * 0.34, h * 0.78, 120, 'rgba(120,90,255,0.8)'],
  ];
  for (const [x, y, r, color] of blobs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = '600 84px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'center';
  ctx.fillText('REFRACT', SIZE / 2, h * 0.56);
}

const STATUS_LABEL: Record<RefractionStatus, string> = {
  idle: 'not started',
  loading: 'compiling shaders…',
  ready: 'WebGL refraction active',
  unavailable: 'unavailable — showing the CSS material',
};

export function Refraction() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<RefractionStatus>('idle');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) paintBackdrop(canvas);
  }, []);

  return (
    <section className="demo-section">
      <h2>Tier 1 vs Tier 2</h2>
      <p className="demo-note">
        Both panels sit over the same canvas. The left one is{' '}
        <code>backdrop-filter</code>; the right one is WebGL refraction, and it
        is draggable. Watch the grid lines where they cross each rim — Tier 1
        blurs them, Tier 2 bends them. Status: {STATUS_LABEL[status]}.
      </p>

      <GlassStage className="demo-stage" onStatusChange={setStatus}>
        <canvas ref={canvasRef} className="demo-stage__canvas" aria-hidden="true" />

        <GlassSurface className="demo-stage__tier1" radius="lg" elevation="raised">
          <strong>Tier 1</strong>
          <span>backdrop-filter</span>
        </GlassSurface>

        <GlassPanel className="demo-stage__tier2" radius={24} button floating>
          <strong>Tier 2</strong>
          <span>WebGL — drag me</span>
        </GlassPanel>
      </GlassStage>
    </section>
  );
}
