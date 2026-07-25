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
import { GlassPanel, GlassStage, GlassSurface } from '../../lib';
import type { RefractionStatus } from '../../lib';
import { Section, Subsection } from '../components/Section';
import { CodeBlock } from '../components/CodeBlock';
import { PACKAGE_NAME } from '../config';

const SIZE = 720;

const USAGE = `import { GlassStage, GlassPanel } from '${PACKAGE_NAME}';

// The renderer is dynamically imported the first time a stage mounts,
// so the shader code never lands in the bundle of an app that does
// not use it.
<GlassStage onStatusChange={setStatus}>
  {/* Panels must be direct children — the renderer reads their
      geometry relative to the stage. */}
  <video src="/reel.mp4" autoPlay muted loop />

  <GlassPanel radius={24} floating button>
    Play
  </GlassPanel>
</GlassStage>`;

const STATUS_LABEL: Record<RefractionStatus, string> = {
  idle: 'not started',
  loading: 'compiling shaders…',
  ready: 'active',
  unavailable: 'unavailable — showing the CSS material',
};

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

export function RefractionSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<RefractionStatus>('idle');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) paintBackdrop(canvas);
  }, []);

  return (
    <Section
      id="refraction"
      eyebrow="The material"
      title="The WebGL tier"
      intro={
        <>
          <p>
            <code>backdrop-filter</code> can only smear the pixels behind an
            element. It cannot bend them, which means it can never produce the
            edge distortion that makes real glass read as a lens rather than a
            translucent card.
          </p>
          <p>
            Tier 2 does. It is a separate optional peer dependency, dynamically
            imported the first time a stage mounts, and it falls back to the CSS
            material if WebGL is unavailable.
          </p>
        </>
      }
    >
      <div className="stagewrap">
        <div className="stagewrap__head">
          <p className="stagewrap__hint">
            Both panels sit over the same canvas. Watch the grid lines where
            they cross each rim — the left panel blurs them, the right one bends
            them. Drag the right panel around.
          </p>
          <p className="stagewrap__status" data-status={status}>
            <span className="stagewrap__pip" aria-hidden="true" />
            WebGL {STATUS_LABEL[status]}
          </p>
        </div>

        <GlassStage className="stage" onStatusChange={setStatus}>
          <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />

          <GlassSurface className="stage__tier1" radius="lg" elevation="raised">
            <strong>Tier 1</strong>
            <span>backdrop-filter</span>
          </GlassSurface>

          <GlassPanel className="stage__tier2" radius={24} button floating>
            <strong>Tier 2</strong>
            <span>WebGL — drag me</span>
          </GlassPanel>
        </GlassStage>
      </div>

      <Subsection title="When to reach for it">
        <div className="prose">
          <p>
            Rarely. Refraction is convincing in proportion to how much structure
            there is behind it, so it earns its cost over video, photography and
            dense imagery, and it is close to invisible over a flat background —
            which is most of a typical interface.
          </p>
          <ul>
            <li>
              <strong>Worth it:</strong> a media player's controls, a hero
              element over a reel, a single showpiece card.
            </li>
            <li>
              <strong>Not worth it:</strong> buttons, form fields, navigation.
              Anything you have twenty of on a page.
            </li>
          </ul>
        </div>
        <div className="callout" data-tone="warn">
          <p>
            Non-media children are rasterized with <code>html-to-image</code> on
            every change, which is expensive. Keep animated DOM out from behind
            a stage, or put a canvas, image or video there instead.
          </p>
        </div>
      </Subsection>

      <CodeBlock code={USAGE} filename="player.tsx" />
    </Section>
  );
}
