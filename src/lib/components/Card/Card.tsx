/**
 * Card.
 *
 * Split into slots rather than taking `title` / `footer` props, because the
 * moment a caller wants a badge next to the title, a prop-based API forces
 * either a new prop or a `ReactNode` that defeats the point. The slots are
 * plain layout components with no context between them, so they can be
 * reordered, omitted or wrapped freely.
 *
 * `CardMedia` is the one that earns its keep: it bleeds to the card's edges and
 * inherits the corner radius, which is fiddly to get right by hand and wrong in
 * most hand-rolled versions.
 */
import { forwardRef } from 'react';
import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { GlassSurface } from '../../primitives/GlassSurface';
import type {
  GlassElevation,
  GlassRadius,
} from '../../primitives/GlassSurface';
import { cx } from '../../utils/cx';
import type {
  PolymorphicComponent,
  PolymorphicProps,
} from '../../utils/polymorphic';

export interface CardOwnProps {
  children?: ReactNode;
  elevation?: GlassElevation;
  radius?: GlassRadius;
  /** Hover and press states. Pair with `as="button"` or `as="a"` if clickable. */
  interactive?: boolean;
  /**
   * Removes the built-in padding, for a card whose children handle their own
   * spacing -- typically one that leads with `CardMedia`.
   */
  flush?: boolean;
  className?: string;
}

const DEFAULT_AS = 'div';

export const Card = forwardRef(function Card<
  E extends ElementType = typeof DEFAULT_AS,
>(
  {
    as,
    children,
    elevation = 'raised',
    radius = 'lg',
    interactive = false,
    flush = false,
    className,
    ...rest
  }: PolymorphicProps<E, CardOwnProps>,
  ref: Ref<Element>,
) {
  return (
    <GlassSurface
      {...rest}
      as={(as ?? DEFAULT_AS) as ElementType}
      ref={ref}
      elevation={elevation}
      radius={radius}
      interactive={interactive}
      className={cx('lg-card', className)}
      data-flush={flush ? 'true' : undefined}
    >
      {children}
    </GlassSurface>
  );
}) as PolymorphicComponent<typeof DEFAULT_AS, CardOwnProps>;

Card.displayName = 'Card';

export type CardSlotProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef(function CardHeader(
  { className, ...rest }: CardSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return <div {...rest} ref={ref} className={cx('lg-card__header', className)} />;
});
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(function CardTitle(
  { className, ...rest }: HTMLAttributes<HTMLHeadingElement>,
  ref: Ref<HTMLHeadingElement>,
) {
  // h3 by default because a card is almost never the top of a document
  // outline; override with `as`-style composition by rendering your own
  // heading inside CardHeader when the level matters.
  return <h3 {...rest} ref={ref} className={cx('lg-card__title', className)} />;
});
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(function CardDescription(
  { className, ...rest }: HTMLAttributes<HTMLParagraphElement>,
  ref: Ref<HTMLParagraphElement>,
) {
  return (
    <p {...rest} ref={ref} className={cx('lg-card__description', className)} />
  );
});
CardDescription.displayName = 'CardDescription';

export const CardBody = forwardRef(function CardBody(
  { className, ...rest }: CardSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return <div {...rest} ref={ref} className={cx('lg-card__body', className)} />;
});
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef(function CardFooter(
  { className, ...rest }: CardSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return <div {...rest} ref={ref} className={cx('lg-card__footer', className)} />;
});
CardFooter.displayName = 'CardFooter';

export const CardMedia = forwardRef(function CardMedia(
  { className, ...rest }: CardSlotProps,
  ref: Ref<HTMLDivElement>,
) {
  return <div {...rest} ref={ref} className={cx('lg-card__media', className)} />;
});
CardMedia.displayName = 'CardMedia';
