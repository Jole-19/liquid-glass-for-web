/**
 * Tabs.
 *
 * Follows the WAI-ARIA tabs pattern: one tab stop for the whole list, arrow
 * keys move between tabs, Home and End jump to the ends. That single tab stop
 * is the part most implementations get wrong -- making every tab tabbable turns
 * a ten-tab bar into ten presses to get past it.
 *
 * The selected tab is marked by a glass indicator that slides between
 * positions, measured from the DOM rather than assuming equal widths.
 */
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import { cx } from '../../utils/cx';
import { devWarn } from '../../utils/devWarn';

export type TabsOrientation = 'horizontal' | 'vertical';

/**
 * `automatic` selects a tab as soon as it receives focus, which is the ARIA
 * default and right when panels are cheap. Switch to `manual` when showing a
 * panel costs a fetch, so arrowing past it does not fire three requests.
 */
export type TabsActivation = 'automatic' | 'manual';

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  baseId: string;
  orientation: TabsOrientation;
  activation: TabsActivation;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }
  return context;
}

/** Stable ids so `aria-controls` and `aria-labelledby` can point at each other
 * across the two subtrees, which is what lets a screen reader announce the
 * panel's owning tab. */
const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`;
const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;

/* ---- Root ---------------------------------------------------------------- */

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activation?: TabsActivation;
}

export const Tabs = forwardRef(function Tabs(
  {
    children,
    value,
    defaultValue = '',
    onValueChange,
    orientation = 'horizontal',
    activation = 'automatic',
    className,
    id,
    ...rest
  }: TabsProps,
  ref: Ref<HTMLDivElement>,
) {
  const autoId = useId();
  const baseId = id ?? `lg-tabs-${autoId}`;

  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  const select = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider
      value={{ value: current, select, baseId, orientation, activation }}
    >
      <div
        {...rest}
        ref={ref}
        id={baseId}
        className={cx('lg-tabs', className)}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

/* ---- List ---------------------------------------------------------------- */

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Accessible name for the tab set. Strongly recommended. */
  label?: string;
}

export const TabList = forwardRef(function TabList(
  { children, label, className, onKeyDown, ...rest }: TabListProps,
  ref: Ref<HTMLDivElement>,
) {
  const { value, select, orientation, activation } = useTabsContext('TabList');
  const listRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

  // Measured rather than computed from a tab index, because tabs are sized by
  // their labels and a percentage-based indicator would drift on every set of
  // tabs that is not uniformly wide.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const move = () => {
      const active = list.querySelector<HTMLElement>('[data-selected="true"]');
      if (!active) {
        // No match means the value does not correspond to any <Tab>, which
        // renders a bar with nothing highlighted -- it reads as a styling bug,
        // so name the actual cause.
        devWarn(
          list.querySelector('[role="tab"]') !== null,
          `<Tabs> value ${JSON.stringify(value)} matches no <Tab value>. The tab list will render with nothing selected.`,
        );
        list.style.setProperty('--lg-tab-indicator-opacity', '0');
        return;
      }
      list.style.setProperty('--lg-tab-indicator-opacity', '1');
      list.style.setProperty('--lg-tab-x', `${active.offsetLeft}px`);
      list.style.setProperty('--lg-tab-y', `${active.offsetTop}px`);
      list.style.setProperty('--lg-tab-w', `${active.offsetWidth}px`);
      list.style.setProperty('--lg-tab-h', `${active.offsetHeight}px`);
    };

    move();

    // Fonts loading late and container resizes both reflow the tabs after the
    // initial measurement, leaving the indicator behind if we only measure once.
    const observer = new ResizeObserver(move);
    observer.observe(list);
    for (const child of Array.from(list.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const list = listRef.current;
      if (!list) return;

      const tabs = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      );
      if (tabs.length === 0) return;

      const activeIndex = tabs.findIndex((tab) => tab === document.activeElement);
      const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      let target = -1;
      if (event.key === next) {
        target = (activeIndex + 1) % tabs.length;
      } else if (event.key === prev) {
        target = (activeIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        target = 0;
      } else if (event.key === 'End') {
        target = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const node = tabs[target];
      if (!node) return;
      node.focus();
      if (activation === 'automatic') {
        const tabValue = node.dataset['value'];
        if (tabValue) select(tabValue);
      }
    },
    [activation, onKeyDown, orientation, select],
  );

  return (
    <div
      {...rest}
      ref={setRefs}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={cx('lg-surface', 'lg-tablist', className)}
      data-elevation="flat"
      data-radius="pill"
      onKeyDown={handleKeyDown}
    >
      <span className="lg-tablist__indicator" aria-hidden="true" />
      {children}
    </div>
  );
});

TabList.displayName = 'TabList';

/* ---- Tab ----------------------------------------------------------------- */

export interface TabProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'type'> {
  children?: ReactNode;
  value: string;
}

export const Tab = forwardRef(function Tab(
  { children, value, className, disabled, onClick, ...rest }: TabProps,
  ref: Ref<HTMLButtonElement>,
) {
  const context = useTabsContext('Tab');
  const selected = context.value === value;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      role="tab"
      id={tabId(context.baseId, value)}
      aria-selected={selected}
      aria-controls={panelId(context.baseId, value)}
      // The roving tab stop. Only the selected tab is reachable with Tab;
      // everything else is reached with the arrow keys.
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-selected={selected ? 'true' : undefined}
      className={cx('lg-tab', 'lg-focusable', className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        context.select(value);
      }}
    >
      {children}
    </button>
  );
});

Tab.displayName = 'Tab';

/* ---- Panel --------------------------------------------------------------- */

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  value: string;
  /**
   * Keep the panel mounted while hidden. Preserves scroll position and form
   * state across tab switches, at the cost of rendering every panel.
   */
  keepMounted?: boolean;
}

export const TabPanel = forwardRef(function TabPanel(
  { children, value, keepMounted = false, className, ...rest }: TabPanelProps,
  ref: Ref<HTMLDivElement>,
) {
  const context = useTabsContext('TabPanel');
  const selected = context.value === value;

  // A panel that is present but scrolled out of the a11y tree still needs to be
  // findable by `aria-controls`, so it stays in the DOM with `hidden` rather
  // than being conditionally rendered when `keepMounted` is set.
  if (!selected && !keepMounted) return null;

  return (
    <div
      {...rest}
      ref={ref}
      role="tabpanel"
      id={panelId(context.baseId, value)}
      aria-labelledby={tabId(context.baseId, value)}
      hidden={!selected}
      // Panels contain focusable content, so the panel itself is not a tab stop
      // unless it has none -- but making it always focusable is the safe
      // default the ARIA pattern recommends for scrollable regions.
      tabIndex={selected ? 0 : -1}
      className={cx('lg-tabpanel', className)}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';
