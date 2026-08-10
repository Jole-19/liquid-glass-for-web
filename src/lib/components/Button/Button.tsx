/**
 * Button.
 *
 * A real `<button>` by default, so keyboard activation, form submission and
 * screen reader semantics come from the platform rather than being
 * reimplemented. `as="a"` swaps in an anchor for navigation, which is the one
 * case where the semantics genuinely differ.
 */
import { forwardRef } from 'react';
import type { ElementType, MouseEvent, ReactNode, Ref } from 'react';
import { GlassSurface } from '../../primitives/GlassSurface';
import type { GlassRadius } from '../../primitives/GlassSurface';
import { cx } from '../../utils/cx';
import type {
  PolymorphicComponent,
  PolymorphicProps,
} from '../../utils/polymorphic';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonOwnProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. Sized and centred by the component; pass a bare SVG. */
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * Swaps the horizontal padding for a square box. Requires an accessible name
   * from `aria-label`, since there is no text to read.
   */
  iconOnly?: boolean;
  /**
   * Shows a spinner and blocks activation. Kept distinct from `disabled`: the
   * button stays focusable and is announced as busy rather than unavailable,
   * so focus is not thrown to the body mid-submit.
   */
  loading?: boolean;
  disabled?: boolean;
  /** Stretches to the width of the container. */
  block?: boolean;
  radius?: GlassRadius;
  className?: string;
}

const DEFAULT_AS = 'button';

export const Button = forwardRef(function Button<
  E extends ElementType = typeof DEFAULT_AS,
>(
  {
    as,
    children,
    variant = 'secondary',
    size = 'md',
    startIcon,
    endIcon,
    iconOnly = false,
    loading = false,
    disabled = false,
    block = false,
    radius = 'md',
    className,
    ...rest
  }: PolymorphicProps<E, ButtonOwnProps>,
  ref: Ref<Element>,
) {
  const Component = (as ?? DEFAULT_AS) as ElementType;
  const isNativeButton = Component === 'button';
  const inert = disabled || loading;

  return (
    <GlassSurface
      {...rest}
      as={Component}
      ref={ref}
      interactive={!inert}
      radius={radius}
      elevation={variant === 'ghost' ? 'flat' : 'default'}
      className={cx('lg-button', 'lg-focusable', className)}
      data-variant={variant}
      data-size={size}
      data-icon-only={iconOnly ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
      data-block={block ? 'true' : undefined}
      // `disabled` only exists on the real element; on an anchor the equivalent
      // is removing it from the tab order and marking it disabled for AT.
      disabled={isNativeButton ? disabled : undefined}
      type={isNativeButton ? ((rest as { type?: string }).type ?? 'button') : undefined}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      tabIndex={!isNativeButton && inert ? -1 : (rest as { tabIndex?: number }).tabIndex}
      onClick={
        inert
          ? (event: MouseEvent) => event.preventDefault()
          : (rest as { onClick?: (event: MouseEvent) => void }).onClick
      }
    >
      {startIcon ? (
        <span className="lg-button__icon" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children != null ? (
        iconOnly ? (
          <span className="lg-button__icon" aria-hidden="true">
            {children}
          </span>
        ) : (
          <span className="lg-button__label">{children}</span>
        )
      ) : null}
      {endIcon ? (
        <span className="lg-button__icon" aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
      {loading ? <span className="lg-button__spinner" aria-hidden="true" /> : null}
    </GlassSurface>
  );
}) as PolymorphicComponent<typeof DEFAULT_AS, ButtonOwnProps>;

Button.displayName = 'Button';
