/**
 * The material primitive.
 *
 * Every component in the library renders one of these rather than reaching for
 * `.lg-surface` directly, so there is exactly one place that decides how the
 * glass is assembled. Its props map onto tokens, not onto CSS -- a caller
 * adjusts `blur` or `tint` and the rim, specular and fallback all follow,
 * because they are all derived from the same custom properties.
 *
 * It renders a single element with no wrapper. The rim and noise pseudo-
 * elements paint above the content, which is correct: they model the front face
 * of the pane, and content laid on glass sits behind that face. Both are
 * `pointer-events: none`, and a component that genuinely needs to lift
 * something above them can use `.lg-surface__content`.
 */
import { forwardRef } from 'react';
import type { CSSProperties, ElementType, ReactNode, Ref } from 'react';
import { cx } from '../utils/cx';
import type {
  PolymorphicComponent,
  PolymorphicProps,
} from '../utils/polymorphic';

export type GlassElevation = 'flat' | 'default' | 'raised' | 'overlay';
export type GlassRadius = 'sm' | 'md' | 'lg' | 'xl' | 'pill';

export interface GlassSurfaceOwnProps {
  children?: ReactNode;
  /** Shadow depth. `flat` keeps the insets but drops the cast shadow. */
  elevation?: GlassElevation;
  radius?: GlassRadius;
  /**
   * Opts into the hover and press states. Purely visual -- it does not make the
   * element focusable or keyboard-operable, so use a real `button` or `a` for
   * anything actionable.
   */
  interactive?: boolean;
  /** Overrides `--lg-tint`. Any CSS colour. */
  tint?: string;
  /** Overrides `--lg-blur`. A bare number is read as pixels. */
  blur?: number | string;
  /** Overrides `--lg-noise-opacity`. 0 disables the microtexture. */
  noise?: number;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_AS = 'div';

function toLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export const GlassSurface = forwardRef(function GlassSurface<
  E extends ElementType = typeof DEFAULT_AS,
>(
  {
    as,
    children,
    elevation = 'default',
    radius = 'md',
    interactive = false,
    tint,
    blur,
    noise,
    className,
    style,
    ...rest
  }: PolymorphicProps<E, GlassSurfaceOwnProps>,
  ref: Ref<Element>,
) {
  const Component = (as ?? DEFAULT_AS) as ElementType;

  // Written as custom properties rather than concrete CSS so an override still
  // flows through every layer that reads the token, including the pseudo-
  // element rim and the no-backdrop-filter fallback.
  const tokenOverrides: Record<string, string> = {};
  if (tint !== undefined) tokenOverrides['--lg-tint'] = tint;
  if (blur !== undefined) tokenOverrides['--lg-blur'] = toLength(blur);
  if (noise !== undefined) tokenOverrides['--lg-noise-opacity'] = String(noise);

  return (
    <Component
      {...rest}
      ref={ref}
      className={cx('lg-surface', className)}
      data-elevation={elevation === 'default' ? undefined : elevation}
      data-radius={radius}
      data-interactive={interactive ? 'true' : undefined}
      style={{ ...tokenOverrides, ...style } as CSSProperties}
    >
      {children}
    </Component>
  );
}) as PolymorphicComponent<typeof DEFAULT_AS, GlassSurfaceOwnProps>;

GlassSurface.displayName = 'GlassSurface';
