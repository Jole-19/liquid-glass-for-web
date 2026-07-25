/**
 * Navbar.
 *
 * A sticky bar whose glass thickens as the page scrolls under it. At the top of
 * a page there is usually nothing behind the bar worth blurring, and a fully
 * frosted bar over a hero just looks like a bug; as content slides underneath,
 * the blur and tint come up to keep the links legible.
 *
 * The transition is driven by a `--lg-nav-progress` custom property written
 * from a scroll handler, and every visual change is a `calc()` on that one
 * number in CSS. Interpolating in CSS rather than JS means one property write
 * per frame instead of five, and the whole effect can be retuned or disabled by
 * a consumer without touching the component.
 */
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode, Ref, RefObject } from 'react';
import { cx } from '../../utils/cx';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /**
   * Scroll distance, in pixels, over which the glass reaches full strength.
   * Roughly the height of the bar is a good default -- long enough not to snap,
   * short enough that the bar is solid before the user has read anything.
   */
  threshold?: number;
  /**
   * Scrollable ancestor to watch. Defaults to the window. Pass a ref when the
   * bar sits inside an `overflow: auto` panel rather than the page.
   */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Pins the bar with `position: sticky`. */
  sticky?: boolean;
  /** Freezes the glass at full strength, skipping the scroll listener. */
  alwaysSolid?: boolean;
}

export const Navbar = forwardRef(function Navbar(
  {
    children,
    threshold = 72,
    scrollContainer,
    sticky = true,
    alwaysSolid = false,
    className,
    ...rest
  }: NavbarProps,
  ref: Ref<HTMLElement>,
) {
  const innerRef = useRef<HTMLElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    },
    [ref],
  );

  useEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    if (alwaysSolid) {
      node.style.setProperty('--lg-nav-progress', '1');
      return;
    }

    const target = scrollContainer?.current ?? null;
    let frame = 0;
    let last = -1;

    const read = () =>
      target ? target.scrollTop : (window.scrollY ?? document.documentElement.scrollTop);

    const update = () => {
      frame = 0;
      const progress = Math.min(Math.max(read() / threshold, 0), 1);
      // Quantized to 1/100. The visual difference below that is invisible, and
      // skipping the write avoids invalidating style on every scroll event once
      // the bar has reached full strength.
      const rounded = Math.round(progress * 100) / 100;
      if (rounded === last) return;
      last = rounded;
      node.style.setProperty('--lg-nav-progress', String(rounded));
      node.dataset['scrolled'] = rounded > 0.02 ? 'true' : 'false';
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();

    const source: HTMLElement | Window = target ?? window;
    source.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      source.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [alwaysSolid, scrollContainer, threshold]);

  return (
    <nav
      {...rest}
      ref={setRefs}
      className={cx('lg-surface', 'lg-navbar', className)}
      data-elevation="flat"
      data-sticky={sticky ? 'true' : undefined}
    >
      {children}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export type NavbarSlotProps = HTMLAttributes<HTMLDivElement>;

export const NavbarBrand = forwardRef(function NavbarBrand(
  { className, ...rest }: NavbarSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return <div {...rest} ref={ref} className={cx('lg-navbar__brand', className)} />;
});
NavbarBrand.displayName = 'NavbarBrand';

/** Pushes everything after it to the far edge. */
export const NavbarSpacer = forwardRef(function NavbarSpacer(
  { className, ...rest }: NavbarSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div
      {...rest}
      ref={ref}
      aria-hidden="true"
      className={cx('lg-navbar__spacer', className)}
    />
  );
});
NavbarSpacer.displayName = 'NavbarSpacer';

export const NavbarActions = forwardRef(function NavbarActions(
  { className, ...rest }: NavbarSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div {...rest} ref={ref} className={cx('lg-navbar__actions', className)} />
  );
});
NavbarActions.displayName = 'NavbarActions';
