# Liquid Glass

A glassmorphic React component library built on one portable CSS material, with
an opt-in WebGL refraction tier for hero elements.

> **Status: in progress.** The material, the adaptive-contrast hook, and the
> Button, Input, Switch and Tabs components are built. Card, Navbar, Modal,
> Tooltip and the WebGL tier are not yet. See [`PLAN.md`](./PLAN.md) for the
> full milestone list.

## Why another glass library

Most glassmorphism is `backdrop-filter: blur()` and a 1px white border, which is
why most of it looks like frosted plastic. This library treats the material as
the hard part:

- **Saturation in the backdrop filter**, not just blur, so colour behind the
  panel blooms through it.
- **An asymmetric rim light** — a gradient border brighter on the lit edge,
  rather than a uniform stroke.
- **Inset specular and inner shadow**, so the panel reads as having thickness.
- **SVG noise microtexture** at 3.5%, which is what kills the plastic look.
- **Layered shadows** — a tight contact shadow plus a wide ambient one.
- **One light direction** for the whole page, enforced by a token rather than
  by per-component values.
- **A chromatic edge fringe** faking dispersion at the rim.
- **Adaptive contrast** — sample the backdrop's luminance and flip the theme so
  glass stays legible over arbitrary imagery.

## Install

```bash
pnpm add liquid-glass-react
```

```tsx
import { Button } from 'liquid-glass-react';
import 'liquid-glass-react/styles.css';

<Button variant="primary">Continue</Button>;
```

The stylesheet is a separate import rather than injected by JS, so you control
where it lands in your cascade.

## The two tiers

**Tier 1** is `backdrop-filter` glass. It is cheap, composes anywhere, and every
component uses it. This is the default and almost always what you want.

**Tier 2** is real WebGL refraction, reserved for one or two showpiece elements
over imagery. It is not built yet; see `PLAN.md` section 4 for the constraints
that shape its API.

## Theming

Everything resolves through custom properties. Override them on `:root` or on
any subtree:

```css
:root {
  --lg-light-angle: 145deg; /* moves every rim, specular and shadow */
  --lg-blur: 20px;
  --lg-saturate: 180%;
  --lg-tint-hue: 220;
  --lg-accent-hue: 220;
  --lg-noise-opacity: 0.035;
}
```

`src/lib/styles/tokens.css` is the full list, and it is commented.

For glass over a light backdrop, add `.lg-theme-light` — or let
`useAdaptiveContrast` decide:

```tsx
const panelRef = useRef<HTMLDivElement>(null);
const imageRef = useRef<HTMLImageElement>(null);

useAdaptiveContrast(panelRef, { source: imageRef });
```

It samples the pixels of the `img`, `canvas` or `video` behind the panel and
sets `data-lg-contrast` on it, with hysteresis so a backdrop sitting on the
threshold does not flip the theme every frame.

## Components

| Component      | Notes                                                           |
| -------------- | --------------------------------------------------------------- |
| `GlassSurface` | The material primitive. Everything else is built on it.          |
| `Button`       | `primary` / `secondary` / `ghost`, three sizes, icons, loading.  |
| `Input`        | Recessed glass, with label, hint and error wiring.               |
| `Switch`       | `role="switch"`, controlled or uncontrolled.                     |
| `Tabs`         | Full ARIA tabs pattern with a measured sliding indicator.        |

## Development

```bash
pnpm install
pnpm dev        # showcase app
pnpm build      # showcase app -> dist-demo
pnpm build:lib  # library -> dist (ESM + CJS + types + one stylesheet)
pnpm typecheck
```

The showcase in `src/demo` consumes `src/lib` directly, so the components are
always dogfooded rather than only existing in isolation.

## Licence

MIT
