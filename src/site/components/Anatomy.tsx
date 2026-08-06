import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { GlassSurface, Switch } from '../../lib';
import { CodeBlock } from './CodeBlock';

/**
 * The material, taken apart.
 *
 * Every one of these layers is the difference between glass and frosted
 * plastic, and every one of them is invisible until you switch it off. So
 * rather than describing them, the panel below lets you remove them one at a
 * time from a live surface — which is the only way the argument for any of them
 * is actually convincing.
 *
 * Each toggle works by overriding the same custom property a consumer would
 * override. Nothing here reaches past the public token API.
 */

interface Layer {
  id: string;
  label: string;
  blurb: string;
  /** Token overrides that remove this layer. */
  off: Record<string, string>;
}

const LAYERS: Layer[] = [
  {
    id: 'backdrop',
    label: 'Saturated backdrop',
    blurb:
      'Blur plus saturate(180%). Blur alone is the flat, grey look — pushing saturation past 100% is what makes colour bloom through.',
    off: { '--lg-blur': '0px', '--lg-saturate': '100%', '--lg-brightness': '100%' },
  },
  {
    id: 'tint',
    label: 'Tint & body gradient',
    blurb:
      'A low-alpha fill with a gradient across it, brighter on the lit edge. Gives the pane body without hiding what is behind it.',
    off: { '--lg-tint': 'transparent', '--lg-body-gradient': 'none' },
  },
  {
    id: 'rim',
    label: 'Asymmetric rim light',
    blurb:
      'A gradient border, bright where the light hits and nearly dark opposite. A uniform 1px stroke is what makes glass read as a sticker.',
    off: {
      '--lg-rim-bright': 'transparent',
      '--lg-rim-mid': 'transparent',
      '--lg-rim-dark': 'transparent',
    },
  },
  {
    id: 'fringe',
    label: 'Chromatic fringe',
    blurb:
      'Complementary hues bled into the rim at very low alpha, faking dispersion. If you can name the colour, it is turned up too high.',
    off: { '--lg-fringe-alpha': '0' },
  },
  {
    id: 'specular',
    label: 'Specular & inner shadow',
    blurb:
      'An inset highlight on the lit edge and a soft shadow opposite. This is the whole reason the panel reads as having thickness.',
    off: { '--lg-inset': '0 0 0 0 transparent' },
  },
  {
    id: 'noise',
    label: 'Microtexture',
    blurb:
      'SVG fractal noise at 3.5%. Real glass is never a perfectly smooth gradient, and the banding you get without this is the loudest tell of all.',
    off: { '--lg-noise-opacity': '0' },
  },
  {
    id: 'shadow',
    label: 'Layered shadows',
    blurb:
      'A tight contact shadow that anchors the panel plus a wide ambient one. A single soft blur reads as a drop shadow from 2010.',
    off: { '--lg-shadow-current': '0 0 0 0 transparent' },
  },
];

export function Anatomy() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(LAYERS.map((layer) => [layer.id, true])),
  );

  const style = useMemo(() => {
    const overrides: Record<string, string> = {};
    for (const layer of LAYERS) {
      if (!enabled[layer.id]) Object.assign(overrides, layer.off);
    }
    return overrides as CSSProperties;
  }, [enabled]);

  const offCount = LAYERS.filter((layer) => !enabled[layer.id]).length;

  const css = useMemo(() => {
    const lines = LAYERS.filter((layer) => !enabled[layer.id]).flatMap((layer) =>
      Object.entries(layer.off).map(([key, value]) => `  ${key}: ${value};`),
    );
    if (lines.length === 0) {
      return '/* Every layer is on. This is the default material. */\n.panel {\n  /* nothing to override */\n}';
    }
    return `/* ${lines.length} override${lines.length === 1 ? '' : 's'} — this is what you have removed. */\n.panel {\n${lines.join('\n')}\n}`;
  }, [enabled]);

  return (
    <div className="anatomy">
      {/* The pane exists so that the stage inside it can be sticky. A sticky
          grid *item* is constrained to the grid container rather than to its
          own grid area, so as a direct child the stage slides down over the
          code block in the row beneath it. */}
      <div className="anatomy__pane">
        {/* The stage stays dark in light mode -- a glass panel over a white
            page demonstrates nothing -- so the panel inside it is pinned to
            the dark-backdrop theme rather than following the page. */}
        <div className="anatomy__stage lg-theme-dark">
          <GlassSurface
            className="anatomy__panel"
            radius="xl"
            elevation="raised"
            style={style}
          >
            <p className="anatomy__panel-title">
              {offCount === 0 ? 'Complete material' : `${offCount} layer${offCount === 1 ? '' : 's'} removed`}
            </p>
            <p className="anatomy__panel-body">
              Switch the layers off one at a time. The ones that seem least
              important are usually the ones doing the most work.
            </p>
          </GlassSurface>
        </div>
      </div>

      <ul className="anatomy__list">
        {LAYERS.map((layer) => (
          <li key={layer.id} className="anatomy__item" data-off={!enabled[layer.id] || undefined}>
            <Switch
              size="sm"
              label={layer.label}
              checked={enabled[layer.id] ?? true}
              onChange={(next) =>
                setEnabled((prev) => ({ ...prev, [layer.id]: next }))
              }
            />
            <p className="anatomy__blurb">{layer.blurb}</p>
          </li>
        ))}
      </ul>

      <div className="anatomy__code">
        <CodeBlock code={css} language="css" filename="overrides" />
      </div>
    </div>
  );
}
