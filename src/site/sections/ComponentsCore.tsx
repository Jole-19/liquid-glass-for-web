import {
  Button,
  GlassSurface,
  Input,
} from '../../lib';
import { Example } from '../components/Example';
import { PropsTable } from '../components/PropsTable';
import { Section, Subsection } from '../components/Section';
import { IconArrowRight, IconLock, IconSearch } from '../icons';

/* ---- GlassSurface -------------------------------------------------------- */

const SURFACE_CODE = `<GlassSurface radius="lg" elevation="raised">
  Raised
</GlassSurface>

<GlassSurface radius="lg" elevation="flat" interactive>
  Flat and interactive
</GlassSurface>

{/* Props map onto tokens, not onto CSS. Override blur and the
    rim, specular and no-backdrop-filter fallback all follow. */}
<GlassSurface radius="pill" blur={40} tint="hsl(280 60% 70% / 0.18)">
  Retinted
</GlassSurface>`;

const SURFACE_ROWS = [
  {
    name: 'as',
    type: 'ElementType',
    default: "'div'",
    description:
      'Renders a different element. Props are typed against whatever you pass.',
  },
  {
    name: 'elevation',
    type: "'flat' | 'default' | 'raised' | 'overlay'",
    default: "'default'",
    description: 'Cast shadow depth. flat keeps the insets and drops the shadow.',
  },
  {
    name: 'radius',
    type: "'sm' | 'md' | 'lg' | 'xl' | 'pill'",
    default: "'md'",
    description: 'Picks from the radius scale rather than taking a length.',
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'false',
    description:
      'Hover and press states only. It does not make the element focusable — use a real button or anchor for anything actionable.',
  },
  {
    name: 'tint',
    type: 'string',
    default: '—',
    description: 'Overrides --lg-tint. Any CSS colour.',
  },
  {
    name: 'blur',
    type: 'number | string',
    default: '—',
    description: 'Overrides --lg-blur. A bare number is read as pixels.',
  },
  {
    name: 'noise',
    type: 'number',
    default: '—',
    description: 'Overrides --lg-noise-opacity. 0 disables the microtexture.',
  },
];

/* ---- Button -------------------------------------------------------------- */

const BUTTON_CODE = `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

<Button variant="primary" loading>Saving</Button>
<Button disabled>Disabled</Button>

{/* as="a" swaps in an anchor, which is the one case where the
    semantics genuinely differ from a button. */}
<Button as="a" href="/docs" endIcon={<IconArrowRight />}>
  Read the docs
</Button>`;

const BUTTON_ROWS = [
  {
    name: 'variant',
    type: "'primary' | 'secondary' | 'ghost'",
    default: "'secondary'",
    description: 'Ghost drops the cast shadow and the tint until hovered.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Sets height, padding, font size and icon size together.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description:
      'Shows a spinner and blocks activation. Deliberately not disabled: the button stays focusable and is announced busy, so focus is not thrown to the body mid-submit.',
  },
  {
    name: 'startIcon / endIcon',
    type: 'ReactNode',
    default: '—',
    description: 'Sized and centred by the component. Pass a bare SVG.',
  },
  {
    name: 'iconOnly',
    type: 'boolean',
    default: 'false',
    description: 'Square box. Requires an aria-label, since there is no text to read.',
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    description: 'Stretches to the width of the container.',
  },
];

/* ---- Input --------------------------------------------------------------- */

const INPUT_CODE = `<Input
  label="Workspace"
  placeholder="acme-inc"
  hint="Lowercase letters and dashes."
  startIcon={<IconSearch />}
/>

{/* Any truthy error marks the field invalid, replaces the hint and
    announces itself. The id, aria-describedby and aria-invalid
    wiring is the part everyone skips, so the component owns it. */}
<Input label="Recovery key" error="That key has expired." />`;

const INPUT_ROWS = [
  {
    name: 'label',
    type: 'ReactNode',
    default: '—',
    description: 'Rendered as a real <label for>, not a placeholder.',
  },
  {
    name: 'hint',
    type: 'ReactNode',
    default: '—',
    description: 'Helper text below the field. Hidden while an error is showing.',
  },
  {
    name: 'error',
    type: 'ReactNode',
    default: '—',
    description:
      'Any truthy value marks the field invalid, replaces the hint and is announced as an alert.',
  },
  {
    name: 'inputSize',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Named inputSize because size is already an HTML attribute.',
  },
  {
    name: 'block',
    type: 'boolean',
    default: 'false',
    description: 'Fills the container width.',
  },
  {
    name: 'className / inputClassName',
    type: 'string',
    default: '—',
    description: 'The wrapper and the input element respectively.',
  },
];

export function ComponentsCore() {
  return (
    <>
      <Section
        id="surface"
        eyebrow="Components"
        title="GlassSurface"
        intro={
          <p>
            The primitive everything else is built from. It renders a single
            element with no wrapper, and its props map onto tokens rather than
            onto CSS — so an override reaches the rim, the specular and the
            fallback, not just the one declaration you changed.
          </p>
        }
      >
        <Example code={SURFACE_CODE}>
          <GlassSurface className="swatch" radius="lg" elevation="raised">
            Raised
          </GlassSurface>
          <GlassSurface className="swatch" radius="lg" elevation="flat" interactive>
            Flat · interactive
          </GlassSurface>
          <GlassSurface
            className="swatch"
            radius="pill"
            blur={40}
            tint="hsl(280 60% 70% / 0.18)"
          >
            Retinted
          </GlassSurface>
        </Example>

        <PropsTable label="GlassSurface props" rows={SURFACE_ROWS} />
      </Section>

      <Section
        id="button"
        eyebrow="Components"
        title="Button"
        intro={
          <p>
            A real <code>&lt;button&gt;</code> by default, so keyboard
            activation, form submission and screen reader semantics come from
            the platform. Press collapses the ambient half of the shadow and
            nudges the element half a pixel down, which is what reads as
            contact rather than as the button shrinking.
          </p>
        }
      >
        <Example code={BUTTON_CODE} defaultOpen>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button disabled>Disabled</Button>
          <Button as="a" href="#button" endIcon={<IconArrowRight />}>
            As a link
          </Button>
        </Example>

        <Example
          title="Sizes and icons"
          code={`<Button size="sm" startIcon={<IconLock />}>Small</Button>
<Button size="md" startIcon={<IconLock />}>Medium</Button>
<Button size="lg" startIcon={<IconLock />}>Large</Button>
<Button iconOnly aria-label="Search"><IconSearch /></Button>`}
        >
          <Button size="sm" startIcon={<IconLock />}>
            Small
          </Button>
          <Button size="md" startIcon={<IconLock />}>
            Medium
          </Button>
          <Button size="lg" startIcon={<IconLock />}>
            Large
          </Button>
          <Button iconOnly aria-label="Search">
            <IconSearch />
          </Button>
        </Example>

        <PropsTable label="Button props" rows={BUTTON_ROWS} />
      </Section>

      <Section
        id="input"
        eyebrow="Components"
        title="Input"
        intro={
          <p>
            The glass here is <em>recessed</em>: the specular runs along the
            bottom edge and the inner shadow along the top, inverting the
            surface's default lighting. That inversion is the whole reason a
            field reads as something you type into rather than something you
            press.
          </p>
        }
      >
        <Example code={INPUT_CODE} stack>
          <div className="fieldgrid">
            <Input
              label="Workspace"
              placeholder="acme-inc"
              hint="Lowercase letters and dashes."
              startIcon={<IconSearch />}
              block
            />
            <Input
              label="Recovery key"
              defaultValue="expired-key-8842"
              error="That key has expired."
              startIcon={<IconLock />}
              block
            />
            <Input label="Disabled" placeholder="Unavailable" disabled block />
          </div>
        </Example>

        <Subsection title="Sizes">
          <Example
            code={`<Input inputSize="sm" placeholder="Small" />
<Input inputSize="md" placeholder="Medium" />
<Input inputSize="lg" placeholder="Large" />`}
          >
            <Input inputSize="sm" placeholder="Small" />
            <Input inputSize="md" placeholder="Medium" />
            <Input inputSize="lg" placeholder="Large" />
          </Example>
        </Subsection>

        <PropsTable label="Input props" rows={INPUT_ROWS} />
      </Section>
    </>
  );
}
