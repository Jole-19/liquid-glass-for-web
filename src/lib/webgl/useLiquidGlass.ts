/**
 * Owns the lifecycle of a `@ybouane/liquidglass` instance.
 *
 * The renderer is loaded with a dynamic import, for two reasons. It is around
 * 100 kB, which is more than the rest of this library put together, and it is
 * an optional peer dependency -- so the import has to be allowed to fail, and
 * failing has to mean "stay on Tier 1" rather than "throw". Every path through
 * this hook that cannot produce a renderer ends in `unavailable`, which the CSS
 * reads as "leave the backdrop-filter alone".
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { devWarn } from '../utils/devWarn';
import type {
  RefractionConfig,
  RefractionInstance,
  RefractionStatus,
} from './types';

export interface UseLiquidGlassOptions {
  /**
   * The glass elements. Must all be direct children of the root; the renderer
   * silently drops any that are not, which is why `GlassStage` checks and warns
   * before it gets that far.
   */
  elements: HTMLElement[];
  /** Bumped by the caller when `elements` changes, to force a re-init. */
  revision: number;
  defaults?: Partial<RefractionConfig>;
  enabled?: boolean;
}

export interface UseLiquidGlassResult {
  status: RefractionStatus;
  instance: RefractionInstance | null;
  /** Safe to call in any status; a no-op when there is no renderer. */
  markChanged: (element?: HTMLElement) => void;
}

export function useLiquidGlass(
  rootRef: RefObject<HTMLElement | null>,
  { elements, revision, defaults, enabled = true }: UseLiquidGlassOptions,
): UseLiquidGlassResult {
  const [status, setStatus] = useState<RefractionStatus>('idle');
  const instanceRef = useRef<RefractionInstance | null>(null);

  // Read inside the effect rather than listed as a dependency: a caller passing
  // an inline object literal would otherwise tear down and recompile the
  // shaders on every render.
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root || elements.length === 0) {
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    void (async () => {
      let instance: RefractionInstance | null = null;
      try {
        const { LiquidGlass } = await import('@ybouane/liquidglass');
        // Awaiting twice means two chances to have been unmounted -- which
        // happens on literally every mount under StrictMode.
        if (cancelled) return;

        const created = await LiquidGlass.init({
          root,
          glassElements: elements,
          ...(defaultsRef.current
            ? { defaults: defaultsRef.current as never }
            : {}),
        });
        instance = created as unknown as RefractionInstance;

        if (cancelled) {
          instance.destroy();
          return;
        }

        instanceRef.current = instance;
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        instanceRef.current = null;
        setStatus('unavailable');
        devWarn(
          true,
          `The WebGL refraction tier could not start, so these panels are using the CSS material instead. Install the optional peer dependency with \`pnpm add @ybouane/liquidglass\`, or check that WebGL is available. Cause: ${String(error)}`,
        );
      }
    })();

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
      setStatus('idle');
    };
  }, [elements, enabled, revision, rootRef]);

  const markChanged = useCallback((element?: HTMLElement) => {
    instanceRef.current?.markChanged(element);
  }, []);

  return { status, instance: instanceRef.current, markChanged };
}
