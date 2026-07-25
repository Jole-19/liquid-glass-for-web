/**
 * Modal.
 *
 * Built on a portal rather than `<dialog>`. The native element would hand us a
 * focus trap and the top layer for free, but its `::backdrop` cannot be styled
 * with the same tokens as the rest of the library, and the top layer sits
 * outside the page's stacking context in a way that breaks `backdrop-filter`
 * sampling of the content behind it -- which is the entire effect here.
 *
 * So the three things `<dialog>` would have given us are implemented:
 * focus trap, focus restore, and scroll lock. Each is the part that gets
 * skipped in hand-rolled modals, and each is why they are unusable by keyboard.
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { HTMLAttributes, ReactNode, Ref, RefObject } from 'react';
import { cx } from '../../utils/cx';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  /** Accessible name. Omit only if you render your own labelled heading. */
  title?: ReactNode;
  description?: ReactNode;
  size?: ModalSize;
  /** Escape closes the dialog. */
  closeOnEscape?: boolean;
  /** Clicking the scrim closes the dialog. */
  closeOnBackdropClick?: boolean;
  /**
   * Element to focus on open. Defaults to the first focusable child, falling
   * back to the dialog itself. Point this at the least destructive control in
   * a confirmation dialog so Enter cannot delete anything by reflex.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Where to portal. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    // `getClientRects` rather than `offsetParent`, which is null for
    // `position: fixed` elements even when they are perfectly visible.
    (el) => el.getClientRects().length > 0 && !el.hasAttribute('inert'),
  );
}

/**
 * Scroll lock, reference counted.
 *
 * Two modals open at once (a confirmation over a form, say) would otherwise
 * have the first one to close restore scrolling while the second is still up.
 */
let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

function lockScroll(): void {
  if (lockCount++ > 0) return;
  const { body, documentElement } = document;
  // Removing the scrollbar shifts the whole page left by its width. Padding the
  // body by that much keeps the layout still, which matters most for a sticky
  // navbar sitting behind the modal.
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  previousOverflow = body.style.overflow;
  previousPaddingRight = body.style.paddingRight;
  body.style.overflow = 'hidden';
  if (scrollbar > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + scrollbar}px`;
  }
}

function unlockScroll(): void {
  if (--lockCount > 0) return;
  lockCount = 0;
  document.body.style.overflow = previousOverflow;
  document.body.style.paddingRight = previousPaddingRight;
}

/** Longest animation or transition on the element, in ms. Read from the
 * computed style so the unmount delay tracks whatever the CSS actually says --
 * including the near-zero durations under `prefers-reduced-motion`. */
function exitDuration(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const parse = (value: string) =>
    value
      .split(',')
      .map((part) => {
        const trimmed = part.trim();
        const n = parseFloat(trimmed);
        if (Number.isNaN(n)) return 0;
        return trimmed.endsWith('ms') ? n : n * 1000;
      })
      .reduce((a, b) => Math.max(a, b), 0);

  return Math.max(
    parse(style.animationDuration) + parse(style.animationDelay),
    parse(style.transitionDuration) + parse(style.transitionDelay),
  );
}

export const Modal = forwardRef(function Modal(
  {
    open,
    onClose,
    children,
    title,
    description,
    size = 'md',
    closeOnEscape = true,
    closeOnBackdropClick = true,
    initialFocusRef,
    container,
    className,
    ...rest
  }: ModalProps,
  ref: Ref<HTMLDivElement>,
) {
  const autoId = useId();
  const titleId = `lg-modal-${autoId}-title`;
  const descriptionId = `lg-modal-${autoId}-description`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // `mounted` lags `open` on close so the exit animation can play. `visible`
  // drives the data-state attribute the CSS animates on.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      // One frame between mount and the state flip, so the browser has a
      // "closed" style to animate from. Setting both in the same commit would
      // start the element at its final style and play nothing.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const panel = panelRef.current;
    const delay = panel ? exitDuration(panel) : 0;
    if (delay === 0) {
      setMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), delay);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Scroll lock, tied to `mounted` rather than `open` so the page cannot scroll
  // behind a dialog that is still animating out.
  useEffect(() => {
    if (!mounted) return;
    lockScroll();
    return unlockScroll;
  }, [mounted]);

  // Focus management.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Deferred a frame: on the first commit the panel is still in its entry
    // state and, depending on the animation, may not be laid out yet, which
    // would make every child fail the visibility test.
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const explicit = initialFocusRef?.current;
      const target = explicit ?? focusableWithin(panel)[0] ?? panel;
      target.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frame);
      // Returning focus to where it came from is what makes a modal usable
      // with a keyboard; without it focus falls to the body and the user is
      // dropped back at the top of the document.
      const restore = restoreFocusRef.current;
      if (restore && document.contains(restore)) {
        restore.focus({ preventScroll: true });
      }
    };
  }, [initialFocusRef, open]);

  // Escape, and the tab trap.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = focusableWithin(panel);
      if (items.length === 0) {
        // Nothing to tab to, so keep focus on the panel rather than letting it
        // escape to the page behind.
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Capture phase so the trap sees Tab before anything inside the dialog can
    // stop its propagation.
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [closeOnEscape, onClose, open]);

  if (!mounted) return null;
  if (typeof document === 'undefined') return null;

  const state = visible ? 'open' : 'closed';

  return createPortal(
    <div className="lg-modal" data-state={state} data-size={size}>
      <div
        className="lg-modal__scrim"
        data-state={state}
        // Not a button, and not keyboard reachable: Escape is the keyboard
        // affordance for dismissal, and a focusable scrim would just be a
        // mystery tab stop.
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        {...rest}
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : rest['aria-labelledby']}
        aria-describedby={description ? descriptionId : rest['aria-describedby']}
        tabIndex={-1}
        data-state={state}
        className={cx('lg-surface', 'lg-modal__panel', className)}
        data-elevation="overlay"
        data-radius="xl"
      >
        {title || description ? (
          <div className="lg-modal__header">
            {title ? (
              <h2 className="lg-modal__title" id={titleId}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="lg-modal__description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>,
    container ?? document.body,
  );
});

Modal.displayName = 'Modal';

export type ModalSlotProps = HTMLAttributes<HTMLDivElement>;

export const ModalBody = forwardRef(function ModalBody(
  { className, ...rest }: ModalSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return <div {...rest} ref={ref} className={cx('lg-modal__body', className)} />;
});
ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef(function ModalFooter(
  { className, ...rest }: ModalSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div {...rest} ref={ref} className={cx('lg-modal__footer', className)} />
  );
});
ModalFooter.displayName = 'ModalFooter';
