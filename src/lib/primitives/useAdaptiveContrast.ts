/**
 * Keeps glass legible over an arbitrary backdrop.
 *
 * Glassmorphism looks great in a screenshot and falls apart in production the
 * moment the thing behind the panel changes brightness: white text over a
 * white sky, dark text over a night photo. This hook samples the backdrop
 * beneath an element and sets `data-lg-contrast` on it, which flips the token
 * theme in tokens.css.
 *
 * It samples a real pixel source -- an `img`, `canvas` or `video` -- rather
 * than the DOM. There is no way to read the rendered pixels of a page from
 * script, so the honest options are "sample the media that is actually behind
 * the panel" or "rasterize the DOM", and the second costs what Tier 2 costs.
 * Callers point `source` at the backdrop image; if they do not, the hook
 * reports the fallback and does nothing.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type ContrastMode = 'light-fg' | 'dark-fg';

export type ContrastSource =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement;

export interface AdaptiveContrastOptions {
  /**
   * The element whose pixels are behind the target. Usually the backdrop
   * `<img>`. A ref is accepted so the source can mount after the target.
   */
  source?: ContrastSource | RefObject<ContrastSource | null> | null;
  /** Set false to freeze the current mode without unmounting the hook. */
  enabled?: boolean;
  /**
   * Luminance (0-1) above which the backdrop counts as light and the hook
   * switches to dark foreground text.
   *
   * Below the 0.5 you might expect, because the measurement is of the raw
   * backdrop but the text sits on tinted glass over it, and the tint lifts the
   * composited luminance. Flipping at the midpoint leaves a band where the
   * backdrop is still nominally dark but the panel is already too bright for
   * white text.
   */
  threshold?: number;
  /**
   * Dead zone around the threshold, in luminance units. A backdrop hovering
   * exactly at the boundary -- a slow gradient scrolling past, a video fading
   * -- would otherwise flip the entire theme every frame. The mode only
   * changes once luminance clears the threshold by this much in one direction.
   */
  hysteresis?: number;
  /**
   * Edge length of the downsample buffer. The browser's own image scaler does
   * the averaging, so this is a quality/cost dial, not an accuracy one; 48 is
   * enough to keep a small bright detail from swinging the average.
   */
  resolution?: number;
  /** Mode used before the first successful sample, or if sampling fails. */
  fallback?: ContrastMode;
  /** Re-sample continuously. Needed for `<video>` backdrops; costs a rAF. */
  live?: boolean;
}

export interface AdaptiveContrastResult {
  /** Which foreground the backdrop calls for. */
  mode: ContrastMode;
  /** Mean relative luminance of the sampled region, or null before first read. */
  luminance: number | null;
  /** Re-sample now. Call after swapping the backdrop image, for instance. */
  resample: () => void;
}

const DEFAULTS = {
  enabled: true,
  threshold: 0.42,
  hysteresis: 0.06,
  resolution: 48,
  fallback: 'light-fg' as ContrastMode,
  live: false,
};

/** sRGB channel to linear light. The curve matters: a naive (r+g+b)/3 rates
 * saturated blue and saturated yellow as equally bright, and text over the
 * blue then comes out unreadable. */
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function resolveSource(
  source: AdaptiveContrastOptions['source'],
): ContrastSource | null {
  if (!source) return null;
  return 'current' in source ? source.current : source;
}

/** Intrinsic pixel dimensions, which differ from layout size for all three
 * source types and are what `drawImage`'s source rectangle is measured in. */
function intrinsicSize(el: ContrastSource): { w: number; h: number } {
  if (el instanceof HTMLVideoElement) {
    return { w: el.videoWidth, h: el.videoHeight };
  }
  if (el instanceof HTMLCanvasElement) {
    return { w: el.width, h: el.height };
  }
  return { w: el.naturalWidth, h: el.naturalHeight };
}

export function useAdaptiveContrast(
  targetRef: RefObject<HTMLElement | null>,
  options: AdaptiveContrastOptions = {},
): AdaptiveContrastResult {
  const {
    source,
    enabled = DEFAULTS.enabled,
    threshold = DEFAULTS.threshold,
    hysteresis = DEFAULTS.hysteresis,
    resolution = DEFAULTS.resolution,
    fallback = DEFAULTS.fallback,
    live = DEFAULTS.live,
  } = options;

  const [mode, setMode] = useState<ContrastMode>(fallback);
  const [luminance, setLuminance] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  // A tainted canvas throws on every getImageData, so remember the failure and
  // stop trying rather than throwing once per frame for the page's lifetime.
  const blockedRef = useRef(false);
  const modeRef = useRef<ContrastMode>(fallback);
  modeRef.current = mode;

  const sample = useCallback(() => {
    if (!enabled || blockedRef.current) return;

    const target = targetRef.current;
    const src = resolveSource(source);
    if (!target || !src) return;

    const { w: srcW, h: srcH } = intrinsicSize(src);
    if (!srcW || !srcH) return; // not decoded yet

    const targetRect = target.getBoundingClientRect();
    const srcRect = src.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) return;
    if (!srcRect.width || !srcRect.height) return;

    // Map the target's viewport rect into the source's intrinsic pixel space.
    // This is where a `background-size: cover` source would need its own
    // transform; an `<img>` laid out to the same box is the supported case and
    // the ratio below is exact for it.
    const scaleX = srcW / srcRect.width;
    const scaleY = srcH / srcRect.height;

    let sx = (targetRect.left - srcRect.left) * scaleX;
    let sy = (targetRect.top - srcRect.top) * scaleY;
    let sw = targetRect.width * scaleX;
    let sh = targetRect.height * scaleY;

    // Clamp to the source. A panel hanging off the edge of the backdrop would
    // otherwise sample transparent pixels and read as pitch black.
    sx = Math.max(0, Math.min(sx, srcW - 1));
    sy = Math.max(0, Math.min(sy, srcH - 1));
    sw = Math.max(1, Math.min(sw, srcW - sx));
    sh = Math.max(1, Math.min(sh, srcH - sy));

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = resolution;
      canvasRef.current.height = resolution;
      ctxRef.current = canvasRef.current.getContext('2d', {
        willReadFrequently: true,
      });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    try {
      ctx.clearRect(0, 0, resolution, resolution);
      ctx.drawImage(src, sx, sy, sw, sh, 0, 0, resolution, resolution);
      const { data } = ctx.getImageData(0, 0, resolution, resolution);

      let total = 0;
      let weight = 0;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = (data[i + 3] ?? 0) / 255;
        if (alpha === 0) continue;
        total +=
          relativeLuminance(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0) *
          alpha;
        weight += alpha;
      }
      if (weight === 0) return;

      const mean = total / weight;
      setLuminance(mean);

      const current = modeRef.current;
      // Only cross the boundary with room to spare, so a backdrop sitting on
      // the threshold holds its current theme instead of oscillating.
      const next: ContrastMode =
        current === 'light-fg'
          ? mean > threshold + hysteresis
            ? 'dark-fg'
            : 'light-fg'
          : mean < threshold - hysteresis
            ? 'light-fg'
            : 'dark-fg';

      if (next !== current) setMode(next);
    } catch {
      // Cross-origin source without CORS headers taints the canvas. Nothing to
      // do but keep the fallback theme; warning every frame would be worse.
      blockedRef.current = true;
    }
  }, [enabled, hysteresis, resolution, source, targetRef, threshold]);

  // Re-sample when the target moves or resizes, coalesced to one rAF so a
  // scroll does not run the read on every event.
  useEffect(() => {
    if (!enabled) return;
    const target = targetRef.current;
    if (!target) return;

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sample();
      });
    };

    schedule();

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(target);

    const src = resolveSource(source);
    if (src) {
      resizeObserver.observe(src);
      // An <img> that has not decoded yet has zero intrinsic size, so the first
      // sample above is a no-op and this is the one that counts.
      if (src instanceof HTMLImageElement && !src.complete) {
        src.addEventListener('load', schedule);
      }
    }

    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      if (src instanceof HTMLImageElement) {
        src.removeEventListener('load', schedule);
      }
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [enabled, sample, source, targetRef]);

  // Continuous sampling, for a backdrop whose pixels change without any DOM
  // event to hang off -- a playing video, a canvas animation.
  useEffect(() => {
    if (!enabled || !live) return;
    let frame = 0;
    const tick = () => {
      sample();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, live, sample]);

  // Written to the DOM rather than returned as a class, so a caller can use the
  // hook on an element it does not render (a portal root, the document body).
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    target.setAttribute('data-lg-contrast', mode);
    return () => target.removeAttribute('data-lg-contrast');
  }, [mode, targetRef]);

  return { mode, luminance, resample: sample };
}
