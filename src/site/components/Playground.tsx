import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button, GlassSurface, Input, Switch } from '../../lib';
import { CodeBlock } from './CodeBlock';

/**
 * Token playground.
 *
 * The claim the library makes is that the whole material is reachable from a
 * handful of custom properties, and that a change to one of them propagates
 * everywhere consistently. That is only believable if you can watch a single
 * slider move the rim, the specular and the shadows together — which is what
 * `--lg-light-angle` does here.
 *
 * The generated CSS underneath is real: paste it on `:root` and the whole page
 * looks like the preview.
 */

interface Control {
  id: string;
  property: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  unit: string;
  hint?: string;
}

const CONTROLS: Control[] = [
  {
    id: 'angle',
    property: '--lg-light-angle',
    label: 'Light direction',
    min: 0,
    max: 360,
    step: 1,
    initial: 145,
    unit: 'deg',
    hint: 'Moves every rim, specular and shadow at once.',
  },
  {
    id: 'blur',
    property: '--lg-blur',
    label: 'Blur',
    min: 0,
    max: 48,
    step: 1,
    initial: 20,
    unit: 'px',
  },
  {
    id: 'saturate',
    property: '--lg-saturate',
    label: 'Saturation',
    min: 100,
    max: 300,
    step: 5,
    initial: 180,
    unit: '%',
    hint: 'The single biggest tell between real and fake.',
  },
  {
    id: 'tint',
    property: '--lg-tint-alpha',
    label: 'Tint strength',
    min: 0,
    max: 0.5,
    step: 0.01,
    initial: 0.1,
    unit: '',
  },
  {
    id: 'hue',
    property: '--lg-tint-hue',
    label: 'Glass hue',
    min: 0,
    max: 360,
    step: 1,
    initial: 220,
    unit: '',
  },
  {
    id: 'accent',
    property: '--lg-accent-hue',
    label: 'Accent hue',
    min: 0,
    max: 360,
    step: 1,
    initial: 220,
    unit: '',
  },
  {
    id: 'noise',
    property: '--lg-noise-opacity',
    label: 'Microtexture',
    min: 0,
    max: 0.12,
    step: 0.005,
    initial: 0.035,
    unit: '',
  },
  {
    id: 'radius',
    property: '--lg-radius-lg',
    label: 'Radius',
    min: 0,
    max: 40,
    step: 1,
    initial: 20,
    unit: 'px',
  },
];

const INITIAL = Object.fromEntries(
  CONTROLS.map((control) => [control.id, control.initial]),
);

export function Playground() {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);

  const { style, css, dirty } = useMemo(() => {
    const overrides: Record<string, string> = {};
    const lines: string[] = [];
    let changed = false;

    for (const control of CONTROLS) {
      const value = values[control.id] ?? control.initial;
      const formatted = `${control.step < 1 ? value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') : value}${control.unit}`;
      overrides[control.property] = formatted;
      if (value !== control.initial) {
        changed = true;
        lines.push(`  ${control.property}: ${formatted};`);
      }
    }

    return {
      style: overrides as CSSProperties,
      dirty: changed,
      css: changed
        ? `:root {\n${lines.join('\n')}\n}`
        : ':root {\n  /* Move a slider to see the overrides you would write. */\n}',
    };
  }, [values]);

  return (
    <div className="playground">
      <div className="playground__preview lg-theme-dark" style={style}>
        <GlassSurface className="playground__panel" radius="lg" elevation="raised">
          <h4>Live preview</h4>
          <p>
            Every component below reads the same tokens, so they move together
            rather than needing to be re-themed one by one.
          </p>
          <div className="playground__row">
            <Button variant="primary" size="sm">
              Primary
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
          </div>
          <div className="playground__row">
            <Input inputSize="sm" placeholder="Input" />
            <Switch defaultChecked size="sm" label="Switch" />
          </div>
        </GlassSurface>
      </div>

      <div className="playground__controls">
        <div className="playground__controls-head">
          <p className="playground__legend">Tokens</p>
          <button
            type="button"
            className="playground__reset lg-focusable"
            onClick={() => setValues(INITIAL)}
            disabled={!dirty}
          >
            Reset
          </button>
        </div>

        {CONTROLS.map((control) => {
          const value = values[control.id] ?? control.initial;
          return (
            <div className="playground__control" key={control.id}>
              <label htmlFor={`pg-${control.id}`}>
                <span className="playground__name">{control.label}</span>
                <code className="playground__value">
                  {control.step < 1 ? value.toFixed(3) : value}
                  {control.unit}
                </code>
              </label>
              <input
                id={`pg-${control.id}`}
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={value}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [control.id]: Number(event.target.value),
                  }))
                }
              />
              {control.hint ? (
                <p className="playground__hint">{control.hint}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="playground__code">
        <CodeBlock code={css} language="css" filename="your-theme.css" />
      </div>
    </div>
  );
}
