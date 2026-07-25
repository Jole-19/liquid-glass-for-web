/**
 * Tier 2 configuration.
 *
 * A structural copy of `GlassConfig` from `@ybouane/liquidglass` rather than a
 * re-export of it. That package is an *optional* peer dependency -- Tier 1 is
 * the default and most consumers will never install it -- and a re-export would
 * put an unresolvable import in this library's public `.d.ts` for everyone who
 * did not. The implementation imports the real type internally, where it costs
 * nothing.
 *
 * Kept in sync by hand. If the upstream config gains a field, the worst case is
 * that it is not typed here; passing it through `raw` still works.
 */

export interface RefractionConfig {
  /** Background blur strength. 0 is sharp, 1 is maximum. */
  blurAmount: number;
  /** How much the glass bends the image behind it. */
  refraction: number;
  /** Colour fringing at the edges. */
  chromAberration: number;
  /** Inner glow / rim lighting intensity. */
  edgeHighlight: number;
  /** Blinn-Phong specular intensity. */
  specular: number;
  /** Fresnel reflection at grazing angles. */
  fresnel: number;
  /** Micro-distortion noise strength. */
  distortion: number;
  /** Corner radius in CSS pixels. */
  cornerRadius: number;
  /** Bevel depth. Set equal to `cornerRadius` with `bevelMode: 1` for a dome. */
  zRadius: number;
  opacity: number;
  /** -1 desaturated, 0 unchanged, 1 vivid. */
  saturation: number;
  tintStrength: number;
  /** -0.5 to 0.5. */
  brightness: number;
  shadowOpacity: number;
  shadowSpread: number;
  shadowOffsetY: number;
  /** Drag the panel around with a pointer. */
  floating: boolean;
  /** Hover and press states rendered in the shader. */
  button: boolean;
  /** 0 = biconvex pill, 1 = dome with a flat bottom. */
  bevelMode: number;
}

export type RefractionStatus =
  /** Not attempted: no glass children, or explicitly disabled. */
  | 'idle'
  /** Importing the renderer and compiling shaders. */
  | 'loading'
  /** Running. Tier 1 styling is suppressed on the panels. */
  | 'ready'
  /**
   * Failed, and the panels have stayed on Tier 1. Either the package is not
   * installed or WebGL is unavailable. Not an error state -- the fallback is a
   * perfectly good glass panel.
   */
  | 'unavailable';

/** The subset of the renderer instance this library depends on. */
export interface RefractionInstance {
  /**
   * Force a re-render of the glass sampling `element`, or of everything when
   * called bare.
   *
   * Needed more often than you would expect: the frame loop early-outs unless
   * something is explicitly dirty, so a `<canvas>` you just drew into, an
   * `<img>` you swapped, or a panel you moved with your own transform will all
   * keep showing a stale refraction until this is called.
   */
  markChanged(element?: HTMLElement): void;
  destroy(): void;
  readonly fps: number;
}
