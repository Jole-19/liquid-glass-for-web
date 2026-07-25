/**
 * Types for components that accept an `as` prop.
 *
 * The pattern exists so `<Button as="a" href="/x">` type-checks `href` while
 * `<Button onClick>` still does -- without it every polymorphic component ends
 * up taking `any` extra props, which is where wrong-element bugs hide.
 */
import type { ComponentPropsWithRef, ElementType, JSX } from 'react';

/** Props of `E`, minus anything the component declares itself. */
export type PolymorphicProps<
  E extends ElementType,
  OwnProps,
> = OwnProps & { as?: E } & Omit<
    ComponentPropsWithRef<E>,
    keyof OwnProps | 'as'
  >;

/**
 * Call signature for the value returned by `forwardRef`.
 *
 * `forwardRef` erases generics from its return type, so a polymorphic component
 * has to be cast back to a signature like this one to keep `as` inference. The
 * cast is confined to the component's last line rather than leaking to callers.
 */
export interface PolymorphicComponent<DefaultAs extends ElementType, OwnProps> {
  <E extends ElementType = DefaultAs>(
    props: PolymorphicProps<E, OwnProps>,
  ): JSX.Element | null;
  displayName?: string;
}
