/**
 * Tier 2: real WebGL refraction.
 *
 * The renderer requires that every glass element be a **direct child** of the
 * root it is given. A nested one is dropped with nothing but a `console.warn`
 * from deep inside the library, so `refraction` cannot be a prop on a
 * `<Button>` buried three levels down -- the structural requirement has to be
 * in the shape of the API. Hence a `<GlassStage>` that owns the root and a
 * `<GlassPanel>` that must be its direct child, with a dev-time check that says
 * so in terms of the components rather than the DOM.
 *
 * Reserve this for one or two showpiece elements over imagery. Cost is per
 * element per frame and scales with area times DPR squared, and anything behind
 * the glass that is not an `img`, `canvas` or `video` gets rasterized through
 * `html-to-image` on every subtree mutation.
 *
 * Panels render the Tier 1 material as well, and the stage only suppresses it
 * once the renderer is actually running. A missing package, a machine without
 * WebGL, or a failed shader compile therefore degrades to a normal glass panel
 * rather than to a transparent hole.
 */
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../utils/cx';
import { devWarn } from '../utils/devWarn';
import { useLiquidGlass } from './useLiquidGlass';
import type { RefractionConfig, RefractionStatus } from './types';

/**
 * Registration is deliberately a separate context from renderer state.
 *
 * A panel registers in an effect keyed on the context it reads, so if that
 * context also carried `status` the two would drive each other: registering
 * re-inits the renderer, re-initialising moves the status, a new status is a
 * new context value, and the panel re-registers. The renderer tears itself
 * down and recompiles for as long as the page is open. Splitting the volatile
 * half off is what breaks the cycle -- both members here are stable for the
 * lifetime of the stage, so the registration effect runs exactly once.
 */
interface StageRegistry {
  rootRef: React.RefObject<HTMLDivElement | null>;
  register: (element: HTMLElement) => () => void;
}

interface StageState {
  markChanged: (element?: HTMLElement) => void;
  status: RefractionStatus;
}

const RegistryContext = createContext<StageRegistry | null>(null);
const StateContext = createContext<StageState | null>(null);

/** Renderer state and the manual invalidation hook, for panels and their
 * children. Returns null outside a `<GlassStage>`. */
export function useGlassStage(): StageState | null {
  return useContext(StateContext);
}

export interface GlassStageProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Config applied to every panel, before each panel's own props. */
  defaults?: Partial<RefractionConfig>;
  /** Skips the renderer entirely and leaves every panel on Tier 1. */
  disabled?: boolean;
  onStatusChange?: (status: RefractionStatus) => void;
}

export const GlassStage = forwardRef(function GlassStage(
  {
    children,
    defaults,
    disabled = false,
    onStatusChange,
    className,
    ...rest
  }: GlassStageProps,
  ref: Ref<HTMLDivElement>,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const registeredRef = useRef<Set<HTMLElement>>(new Set());

  // Panels register imperatively on mount. `revision` is what actually drives
  // the re-init; `elements` is derived from it so the array identity only
  // changes when the membership does.
  const [revision, setRevision] = useState(0);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

  const register = useCallback((element: HTMLElement) => {
    registeredRef.current.add(element);
    setRevision((n) => n + 1);
    return () => {
      registeredRef.current.delete(element);
      setRevision((n) => n + 1);
    };
  }, []);

  // Ordered by document position. The renderer composites in child order, and
  // a set iterated in registration order would put a panel that remounted at
  // the wrong depth in the stack.
  const elements = useMemo(() => {
    void revision;
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(registeredRef.current).sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
  }, [revision]);

  const { status, markChanged } = useLiquidGlass(rootRef, {
    elements,
    revision,
    ...(defaults ? { defaults } : {}),
    enabled: !disabled,
  });

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  // Both are documented footguns worth catching at the point of use: a video
  // anywhere under the root forces every glass element to re-render every
  // frame, and non-media DOM behind a panel goes through html-to-image.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || status !== 'ready') return;
    devWarn(
      root.querySelector('video, [data-dynamic]') !== null,
      'A <video> or [data-dynamic] element inside <GlassStage> forces every glass panel to re-render on every frame. That is by design in the renderer, but it is the most expensive thing you can do here -- keep the stage small if you need it.',
    );
  }, [status, revision]);

  const registry = useMemo<StageRegistry>(
    () => ({ rootRef, register }),
    [register],
  );

  const state = useMemo<StageState>(
    () => ({ markChanged, status }),
    [markChanged, status],
  );

  return (
    <RegistryContext.Provider value={registry}>
      <StateContext.Provider value={state}>
        <div
          {...rest}
          ref={setRefs}
          className={cx('lg-stage', className)}
          data-refraction={status}
        >
          {children}
        </div>
      </StateContext.Provider>
    </RegistryContext.Provider>
  );
});

GlassStage.displayName = 'GlassStage';

export interface GlassPanelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  /**
   * Corner radius in CSS pixels. A number rather than a token because the
   * shader needs the actual pixel value to build the bevel, and cannot read a
   * custom property.
   */
  radius?: number;
  /** Bevel depth. Defaults to 40% of the radius, which reads as thick glass. */
  depth?: number;
  /** Hover and press states rendered in the shader. Free -- the renderer
   * already wires the pointer listeners and animates `zRadius` on press. */
  button?: boolean;
  /** Makes the panel draggable. */
  floating?: boolean;
  /** Escape hatch for any config field not surfaced as a prop. */
  config?: Partial<RefractionConfig>;
}

export const GlassPanel = forwardRef(function GlassPanel(
  {
    children,
    radius = 24,
    depth,
    button = false,
    floating = false,
    config,
    className,
    style,
    ...rest
  }: GlassPanelProps,
  ref: Ref<HTMLDivElement>,
) {
  const registry = useContext(RegistryContext);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

  devWarn(
    registry === null,
    '<GlassPanel> renders outside a <GlassStage> and will only ever show the CSS material. The WebGL renderer needs a root that owns the panel, which is what <GlassStage> provides.',
  );

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !registry) return;

    // The check the renderer would otherwise make silently, phrased in terms of
    // the components rather than the DOM. Skipping registration keeps the panel
    // on Tier 1 instead of letting it look broken.
    if (node.parentElement !== registry.rootRef.current) {
      devWarn(
        true,
        '<GlassPanel> must be a *direct* child of <GlassStage>. This one is nested inside another element, so the renderer would drop it; it has been left on the CSS material instead. Move the panel up, or move the wrapper inside the panel.',
      );
      return;
    }

    return registry.register(node);
  }, [registry]);

  const glassConfig: Partial<RefractionConfig> = {
    cornerRadius: radius,
    zRadius: depth ?? Math.round(radius * 0.4),
    button,
    floating,
    ...config,
  };

  return (
    <div
      {...rest}
      ref={setRefs}
      // Read by the renderer, which caches on the string and re-parses only
      // when it changes.
      data-config={JSON.stringify(glassConfig)}
      className={cx('lg-surface', 'lg-glass-panel', className)}
      data-radius="lg"
      data-interactive={button ? 'true' : undefined}
      style={{ borderRadius: `${radius}px`, ...style }}
    >
      {children}
    </div>
  );
});

GlassPanel.displayName = 'GlassPanel';
