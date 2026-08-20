# Liquid Glass for Web

[![License](https://img.shields.io/github/license/Jole-19/liquid-glass-for-web?style=flat-square&color=6b7cff)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/Jole-19/liquid-glass-for-web?style=flat-square&color=6b7cff)](https://github.com/Jole-19/liquid-glass-for-web/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/Jole-19/liquid-glass-for-web?style=flat-square&color=6b7cff)](https://github.com/Jole-19/liquid-glass-for-web/commits)
![JS](https://img.shields.io/badge/js-9.5%20kB%20gzip-6b7cff?style=flat-square)
![CSS](https://img.shields.io/badge/css-6.1%20kB%20gzip-6b7cff?style=flat-square)

A glassmorphic React component library built on one portable CSS material, with
an opt-in WebGL refraction tier for hero elements.

Run `pnpm dev` for the documentation site — an interactive breakdown of the
material, a live token playground, and every component with its source.

## Why another glass library

Most glassmorphism is `backdrop-filter: blur()` and a 1px white border, which is
why most of it looks like frosted plastic. This library treats the material as
the hard part:

- **Saturation in the backdrop filter**, not just blur, so colour behind the
  panel blooms through it. This is the single biggest tell between real and fake.
- **An asymmetric rim light** — a gradient border brighter on the lit edge,
  rather than a uniform stroke. A flat 1px `rgba` border reads as a sticker.
- **Inset specular and inner shadow**, so the panel reads as having thickness.
- **SVG noise microtexture** at 3.5%. Removing the perfectly smooth gradient is
  what kills the plastic look.
- **Layered shadows** — a tight contact shadow that anchors the element plus a
  wide ambient one, rather than a single soft blur.
- **One light direction** for the whole page, enforced by a token rather than by
  per-component values.
- **A chromatic edge fringe** faking dispersion at the rim.
- **Adaptive contrast** — sample the backdrop's luminance and flip the theme so
  glass stays legible over arbitrary imagery.

## Install

```bash
npm install liquidglass-web
# pnpm add liquidglass-web
# yarn add liquidglass-web
# bun add liquidglass-web
```

```tsx
import { Button } from 'liquidglass-web';
import 'liquidglass-web/styles.css';

<Button variant="primary">Continue</Button>;
```

The stylesheet is a separate import rather than injected by JS, so you control
where it lands in your cascade.

## Components

| Component      | Notes                                                            |
| -------------- | ---------------------------------------------------------------- |
| `GlassSurface` | The material primitive. Everything else is built on it.          |
| `Button`       | `primary` / `secondary` / `ghost`, three sizes, icons, loading.  |
| `Card`         | Slot-based, with media that bleeds to the corners.               |
| `Input`        | Recessed glass, with label, hint and error wiring.               |
| `Switch`       | `role="switch"`, controlled or uncontrolled.                     |
| `Tabs`         | Full ARIA tabs pattern with a measured sliding indicator.        |
| `Navbar`       | Sticky, with glass that thickens as the page scrolls under it.   |
| `Modal`        | Focus trap, focus restore, scroll lock, glass scrim.             |
| `Tooltip`      | Hover and focus, Escape to dismiss, flips at viewport edges.     |
| `GlassStage`   | Tier 2 root. See below.                                          |

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

For glass over a light backdrop, add `.lg-theme-light` — or let the hook decide:

```tsx
const panelRef = useRef<HTMLDivElement>(null);
const imageRef = useRef<HTMLImageElement>(null);

useAdaptiveContrast(panelRef, { source: imageRef });
```

It samples the pixels of the `img`, `canvas` or `video` behind the panel and
sets `data-lg-contrast` on it, which flips the whole token theme. Luminance is
computed in linear light rather than as a channel average, because a naive mean
rates saturated blue and saturated yellow as equally bright and puts unreadable
text over the blue. There is hysteresis around the threshold, so a backdrop
sitting right on the boundary holds its theme instead of flipping every frame.

## The two tiers

**Tier 1** is `backdrop-filter` glass. It is cheap, composes anywhere, scales to
hundreds of elements, and every component uses it. This is the default and
almost always what you want.

**Tier 2** is real WebGL refraction — it bends the pixels behind the panel
rather than blurring them. It needs the optional peer dependency:

```bash
pnpm add @ybouane/liquidglass
```

```tsx
<GlassStage>
  <img src="/hero.jpg" alt="" />
  <GlassPanel radius={24} button floating>
    Refracting
  </GlassPanel>
</GlassStage>
```

`GlassPanel` **must be a direct child of `GlassStage`**. That is not a style
preference: the renderer silently drops any glass element that is not a direct
child of its root, so the constraint is built into the component API and checked
at mount with a dev-time warning.

Things worth knowing before reaching for it:

- **Reserve it for one or two showpiece elements.** Cost is per element, per
  frame, and scales with area times DPR squared. Nothing in the config reduces
  per-pixel work — the shader always takes six texture samples per pixel and
  always evaluates its noise, whatever `chromAberration` or `blurAmount` say.
  Area is the only real lever.
- **Use it over media.** Anything behind a panel that is not a `canvas`, `img`
  or `video` is rasterized through `html-to-image` and re-captured on any
  subtree mutation. Over live text or lists it is impractical; over imagery it
  takes a fast `drawImage` path.
- **A `<video>` or `[data-dynamic]` anywhere inside the stage forces every glass
  panel to re-render every frame.**
- **Moving a panel yourself does not trigger a re-render.** The frame loop
  early-outs unless something is explicitly dirty. Move a panel with your own
  transform and the stale texture rides along with it; call `markChanged` from
  `useGlassStage()` after you do.

If the package is missing, WebGL is unavailable, or a shader fails to compile,
panels stay on the Tier 1 material rather than becoming transparent holes. The
renderer is loaded with a dynamic import and marked external in the build, so
none of its ~100 kB reaches consumers who never use it.

## Accessibility

- One focus ring across the library, layered so it is visible over both light
  and dark backdrops.
- `prefers-reduced-motion` cuts transitions to a single frame and drops
  transforms. The button spinner pulses in place rather than disappearing.
- `forced-colors` abandons the material entirely for system colours and a plain
  border, and swaps the shadow-based focus ring for an `outline` — shadows are
  not rendered in that mode, so the indicator would otherwise vanish.
- `prefers-contrast: more` thickens the tint and rim.
- `@supports not (backdrop-filter)` falls back to an opaque-enough tint rather
  than leaving text over an unblurred backdrop.

## Development

```bash
pnpm install
pnpm dev        # documentation site
pnpm build      # documentation site -> dist-site
pnpm build:lib  # library -> dist (ESM + CJS + types + one stylesheet)
pnpm typecheck
```

The site in `src/site` consumes `src/lib` directly — its navbar, tabs, switches
and cards are the real components, so the documentation cannot drift from what
it documents.

## Licence

MIT
