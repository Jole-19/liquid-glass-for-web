/**
 * Tooltip.
 *
 * Shows on hover *and* on keyboard focus, and hides on Escape. All three are
 * required by WCAG 1.4.13 and all three are routinely missing, which is what
 * makes most tooltips invisible to keyboard users and impossible to dismiss for
 * anyone using magnification.
 *
 * The trigger is cloned rather than wrapped, so `aria-describedby` lands on the
 * actual control and no extra element gets between it and its parent's layout.
 * That means the child must accept a `ref` -- every host element does, and so
 * does every component in this library.
 */
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement, ReactNode, Ref } from 'react';
import { useAnchoredPosition } from '../../primitives/useAnchoredPosition';
import type { Placement } from '../../primitives/useAnchoredPosition';
import { cx } from '../../utils/cx';
import { devWarn } from '../../utils/devWarn';

export interface TooltipProps {
  /** The tooltip text. A tooltip is not a container -- keep it to a phrase. */
  content: ReactNode;
  /** Exactly one element, which must accept a ref. */
  children: ReactElement;
  placement?: Placement;
  offset?: number;
  /**
   * Hover delay before showing. Long enough that moving the pointer across a
   * toolbar does not strobe every tooltip on the way past.
   */
  openDelay?: number;
  /**
   * Delay before hiding. Mostly there so moving between two adjacent triggers
   * does not flicker.
   */
  closeDelay?: number;
  disabled?: boolean;
  className?: string;
}

interface RefCarrier {
  ref?: Ref<HTMLElement>;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  offset = 8,
  openDelay = 400,
  closeDelay = 80,
  disabled = false,
  className,
}: TooltipProps) {
  const id = `lg-tooltip-${useId()}`;
  const [open, setOpen] = useState(false);

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const position = useAnchoredPosition(anchorRef, floatingRef, {
    placement,
    offset,
    enabled: open,
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(
    (delay: number) => {
      if (disabled) return;
      clearTimer();
      if (delay === 0) {
        setOpen(true);
        return;
      }
      timerRef.current = window.setTimeout(() => setOpen(true), delay);
    },
    [clearTimer, disabled],
  );

  const hide = useCallback(
    (delay: number) => {
      clearTimer();
      if (delay === 0) {
        setOpen(false);
        return;
      }
      timerRef.current = window.setTimeout(() => setOpen(false), delay);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  // Escape must dismiss without moving focus, so it is a document listener
  // rather than something on the trigger -- the pointer may be hovering a
  // trigger that is not focused.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide(0);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hide, open]);

  devWarn(
    !isValidElement(children),
    'Tooltip expects a single React element as its child. Wrap plain text in a <span>.',
  );

  if (!isValidElement(children)) return children as unknown as ReactElement;

  const childProps = children.props as Record<string, unknown> & RefCarrier;
  const childRef = childProps.ref;

  const setAnchor = (node: HTMLElement | null) => {
    anchorRef.current = node;
    if (typeof childRef === 'function') childRef(node);
    else if (childRef) {
      (childRef as { current: HTMLElement | null }).current = node;
    }
  };

  const call = (name: string, event: unknown) => {
    const handler = childProps[name];
    if (typeof handler === 'function') {
      (handler as (e: unknown) => void)(event);
    }
  };

  const trigger = cloneElement(children, {
    ref: setAnchor,
    // Describes rather than labels: the trigger keeps its own accessible name,
    // and the tooltip is supplementary. Using aria-labelledby here would
    // silently replace the button's label with its own hint text.
    'aria-describedby': open ? id : childProps['aria-describedby'],
    onPointerEnter: (event: unknown) => {
      call('onPointerEnter', event);
      show(openDelay);
    },
    onPointerLeave: (event: unknown) => {
      call('onPointerLeave', event);
      hide(closeDelay);
    },
    // No delay on focus. The delay exists to filter out incidental pointer
    // movement, and there is no such thing as incidentally tabbing to a control.
    onFocus: (event: unknown) => {
      call('onFocus', event);
      show(0);
    },
    onBlur: (event: unknown) => {
      call('onBlur', event);
      hide(0);
    },
    // A tap should not leave a tooltip stranded on screen with no way to
    // dismiss it on a device that has no Escape key.
    onPointerDown: (event: unknown) => {
      call('onPointerDown', event);
      hide(0);
    },
  } as Record<string, unknown>);

  const floating =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={floatingRef}
            id={id}
            role="tooltip"
            className={cx('lg-surface', 'lg-tooltip', className)}
            data-elevation="overlay"
            data-radius="sm"
            data-placement={position.placement}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
              // Hidden for the first frame, before the element has been
              // measured -- otherwise it flashes at the top-left corner.
              visibility: position.ready ? 'visible' : 'hidden',
              ['--lg-tooltip-arrow' as string]: `${position.arrow}px`,
            }}
          >
            {content}
            <span className="lg-tooltip__arrow" aria-hidden="true" />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {trigger}
      {floating}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
