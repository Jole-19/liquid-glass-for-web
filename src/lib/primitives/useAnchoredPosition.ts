/**
 * Positions a floating element against an anchor, and keeps it on screen.
 *
 * Shared by Tooltip and Popover. Deliberately not Floating UI: that library is
 * excellent and considerably more capable, but it is larger than this entire
 * package, and the two behaviours that actually matter -- flip when the
 * preferred side does not fit, shift along the cross axis to stay in the
 * viewport -- are the ones implemented here.
 *
 * Everything is in viewport coordinates and applied with `position: fixed`, so
 * the result is unaffected by whatever transformed or scrolled ancestor the
 * anchor happens to live in. That single decision removes the entire class of
 * bugs where a popover drifts inside a scroll container.
 */
import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface AnchoredPositionOptions {
  placement?: Placement;
  /** Gap between the anchor and the floating element, in pixels. */
  offset?: number;
  /** Minimum distance to keep from the viewport edge. */
  padding?: number;
  /** Skip measuring entirely while closed. */
  enabled?: boolean;
}

export interface AnchoredPosition {
  x: number;
  y: number;
  /** The placement actually used, which may differ from the request. */
  placement: Placement;
  /**
   * Distance from the floating element's leading edge to the anchor's centre,
   * along the cross axis. An arrow uses this to stay pointed at the anchor
   * after the element has been shifted away from it.
   */
  arrow: number;
  /** False until the first measurement, so the caller can avoid a flash at 0,0. */
  ready: boolean;
}

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const INITIAL: AnchoredPosition = {
  x: 0,
  y: 0,
  placement: 'top',
  arrow: 0,
  ready: false,
};

function compute(
  anchor: DOMRect,
  floating: DOMRect,
  placement: Placement,
  offset: number,
  padding: number,
): Omit<AnchoredPosition, 'ready'> {
  const viewportW = document.documentElement.clientWidth;
  const viewportH = document.documentElement.clientHeight;

  const fits = (side: Placement): boolean => {
    switch (side) {
      case 'top':
        return anchor.top - floating.height - offset >= padding;
      case 'bottom':
        return anchor.bottom + floating.height + offset <= viewportH - padding;
      case 'left':
        return anchor.left - floating.width - offset >= padding;
      case 'right':
        return anchor.right + floating.width + offset <= viewportW - padding;
    }
  };

  // Flip only if the opposite side is genuinely better. Flipping into a side
  // that also does not fit just makes the element jump for no benefit.
  let final = placement;
  if (!fits(placement) && fits(OPPOSITE[placement])) {
    final = OPPOSITE[placement];
  }

  const vertical = final === 'top' || final === 'bottom';

  let x: number;
  let y: number;

  if (vertical) {
    x = anchor.left + anchor.width / 2 - floating.width / 2;
    y =
      final === 'top'
        ? anchor.top - floating.height - offset
        : anchor.bottom + offset;
  } else {
    y = anchor.top + anchor.height / 2 - floating.height / 2;
    x =
      final === 'left'
        ? anchor.left - floating.width - offset
        : anchor.right + offset;
  }

  // Shift along the cross axis to stay in view. `Math.max` after `Math.min`
  // so that an element wider than the viewport pins to the leading edge rather
  // than the trailing one, which is the readable failure.
  const unshifted = vertical ? x : y;
  if (vertical) {
    x = Math.max(padding, Math.min(x, viewportW - floating.width - padding));
  } else {
    y = Math.max(padding, Math.min(y, viewportH - floating.height - padding));
  }
  const shift = (vertical ? x : y) - unshifted;

  // The arrow starts centred and moves back by however far the body shifted,
  // then is clamped inside the element's own corners.
  const extent = vertical ? floating.width : floating.height;
  const arrow = Math.max(
    padding,
    Math.min(extent / 2 - shift, extent - padding),
  );

  return { x: Math.round(x), y: Math.round(y), placement: final, arrow };
}

export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: AnchoredPositionOptions = {},
): AnchoredPosition & { update: () => void } {
  const {
    placement = 'top',
    offset = 8,
    padding = 8,
    enabled = true,
  } = options;

  const [position, setPosition] = useState<AnchoredPosition>(INITIAL);

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const next = compute(
      anchor.getBoundingClientRect(),
      floating.getBoundingClientRect(),
      placement,
      offset,
      padding,
    );

    // Bail on an unchanged result. This runs from a scroll handler, and a
    // setState per frame on a fixed element that has not moved would rerender
    // the whole floating subtree for nothing.
    setPosition((prev) =>
      prev.ready &&
      prev.x === next.x &&
      prev.y === next.y &&
      prev.placement === next.placement &&
      prev.arrow === next.arrow
        ? prev
        : { ...next, ready: true },
    );
  }, [anchorRef, floatingRef, offset, padding, placement]);

  useEffect(() => {
    if (!enabled) {
      setPosition((prev) => (prev.ready ? INITIAL : prev));
      return;
    }

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();

    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    const observer = new ResizeObserver(schedule);
    if (anchor) observer.observe(anchor);
    if (floating) observer.observe(floating);

    // Capture phase, because the anchor may sit inside a scroll container whose
    // scroll events do not bubble to the window.
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [anchorRef, enabled, floatingRef, update]);

  return { ...position, update };
}
