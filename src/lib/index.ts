/**
 * Public API.
 *
 * The stylesheet is imported here only so the build has it in the module
 * graph. With `cssCodeSplit: false` the library build extracts it to
 * `dist/liquid-glass.css` and strips the import from the emitted JS, so
 * consumers still get a file they import themselves
 * (`liquidglass-web/styles.css`) rather than styles injected at runtime --
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

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  CardMedia,
} from './components/Card';
export type { CardOwnProps, CardSlotProps } from './components/Card';

export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { Modal, ModalBody, ModalFooter } from './components/Modal';
export type {
  ModalProps,
  ModalSize,
  ModalSlotProps,
} from './components/Modal';

export {
  Navbar,
  NavbarBrand,
  NavbarSpacer,
  NavbarActions,
} from './components/Navbar';
export type { NavbarProps, NavbarSlotProps } from './components/Navbar';

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

export { Tooltip } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';

export { useAnchoredPosition } from './primitives/useAnchoredPosition';
export type {
  AnchoredPosition,
  AnchoredPositionOptions,
  Placement,
} from './primitives/useAnchoredPosition';

export { GlassStage, GlassPanel, useGlassStage } from './webgl';
export type {
  GlassStageProps,
  GlassPanelProps,
  RefractionConfig,
  RefractionInstance,
  RefractionStatus,
  UseLiquidGlassOptions,
  UseLiquidGlassResult,
} from './webgl';
export { useLiquidGlass } from './webgl';

export { cx } from './utils/cx';
export type { ClassValue } from './utils/cx';
export type {
  PolymorphicProps,
  PolymorphicComponent,
} from './utils/polymorphic';
