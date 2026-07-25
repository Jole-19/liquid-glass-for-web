/**
 * Public API.
 *
 * The stylesheet is imported here only so the build has it in the module
 * graph. With `cssCodeSplit: false` the library build extracts it to
 * `dist/liquid-glass.css` and strips the import from the emitted JS, so
 * consumers still get a file they import themselves
 * (`liquid-glass-react/styles.css`) rather than styles injected at runtime --
 * which would land in the cascade wherever the bundle happened to execute.
 */
import './styles/index.css';

export { GlassSurface } from './primitives/GlassSurface';
export type {
  GlassSurfaceOwnProps,
  GlassElevation,
  GlassRadius,
} from './primitives/GlassSurface';

export { useAdaptiveContrast } from './primitives/useAdaptiveContrast';
export type {
  AdaptiveContrastOptions,
  AdaptiveContrastResult,
  ContrastMode,
  ContrastSource,
} from './primitives/useAdaptiveContrast';

export { Button } from './components/Button';
export type {
  ButtonOwnProps,
  ButtonVariant,
  ButtonSize,
} from './components/Button';

export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { Switch } from './components/Switch';
export type { SwitchProps, SwitchSize } from './components/Switch';

export { Tabs, TabList, Tab, TabPanel } from './components/Tabs';
export type {
  TabsProps,
  TabListProps,
  TabProps,
  TabPanelProps,
  TabsOrientation,
  TabsActivation,
} from './components/Tabs';

export { cx } from './utils/cx';
export type { ClassValue } from './utils/cx';
export type {
  PolymorphicProps,
  PolymorphicComponent,
} from './utils/polymorphic';
