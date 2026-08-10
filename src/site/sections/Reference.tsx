import { GlassSurface } from '../../lib';
import { Section, Subsection } from '../components/Section';
import { CodeBlock } from '../components/CodeBlock';

const A11Y = [
  {
    title: 'Focus is never invisible',
    body: 'One ring for the whole library, drawn in two layers so it survives both light and dark backdrops. It replaces the shadow stack rather than stacking on top of it, because a ring competing with an ambient shadow reads as blurry at exactly the moment it matters most.',
  },
  {
    title: 'Keyboard parity',
    body: 'Tabs use a roving tab stop, the modal traps and restores focus, tooltips open on focus, and the switch is a real button. Nothing in the library is reachable only with a pointer.',
  },
  {
    title: 'Reduced motion',
    body: 'Transitions collapse to a near-instant crossfade rather than to zero. Keeping a few frames avoids the harsh state-popping a hard none produces, while removing all perceptible movement. Transforms are dropped outright.',
  },
  {
    title: 'Forced colors',
    body: 'Windows High Contrast drops backgrounds and shadows entirely, which would leave a glass panel as literally nothing. The material is abandoned and replaced with a system border, and the focus ring switches from a shadow to an outline so it does not silently vanish.',
  },
  {
    title: 'Increased contrast',
    body: 'prefers-contrast: more thickens the tint and takes the rim to a definite edge, so panels separate from a busy backdrop without giving up the material.',
  },
];

const FALLBACK = `/* No backdrop-filter means the panel is a transparent hole and any
   text on it is illegible, so the fallback trades the effect for an
   opaque-enough tint. The rim and noise still run, which keeps it
   recognisably the same component. */
@supports not ((-webkit-backdrop-filter: blur(1px)) or
               (backdrop-filter: blur(1px))) {
  .lg-surface {
    --lg-tint-alpha: 0.82;
    --lg-tint-light: 16%;
  }
}`;

const SUPPORT = [
  {
    feature: 'backdrop-filter',
    chrome: 'Yes',
    safari: 'Yes',
    firefox: 'Yes',
    note: 'Tier 1. Fallback tint below.',
  },
  {
    feature: '@property',
    chrome: 'Yes',
    safari: 'Yes',
    firefox: 'Yes',
    note: 'Only affects whether tint and blur animate.',
  },
  {
    feature: 'mask-composite',
    chrome: 'Yes',
    safari: 'Yes',
    firefox: 'Yes',
    note: 'Draws the rim light. Prefixed for WebKit.',
  },
  {
    feature: 'WebGL2',
    chrome: 'Yes',
    safari: 'Yes',
    firefox: 'Yes',
    note: 'Tier 2 only. Falls back to Tier 1.',
  },
  {
    feature: 'forced-colors',
    chrome: 'Yes',
    safari: 'No',
    firefox: 'Yes',
    note: 'Where unsupported the standard material renders.',
  },
];

export function Reference() {
  return (
    <>
      <Section
        id="accessibility"
        eyebrow="Reference"
        title="Accessibility"
        intro={
          <p>
            Translucency is an accessibility liability by default: low-contrast
            text over unpredictable backdrops, decorative motion, and focus
            indicators that disappear into a blur. Each of those has a
            deliberate answer rather than a hope.
          </p>
        }
      >
        <GlassSurface
          as="ul"
          className="pillars"
          radius="xl"
          elevation="raised"
          style={
            {
              '--lg-tint-alpha': '0',
              '--lg-body-gradient': 'none',
              '--lg-blur': '0px',
              '--lg-brightness': '100%',
              '--lg-saturate': '100%',
            } as React.CSSProperties
          }
        >
          {A11Y.map((item) => (
            <li className="pillars__item" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </GlassSurface>

        <div className="callout">
          <p>
            Contrast is still your responsibility. The library keeps its own
            text legible over its own tints, but it cannot know what you put
            behind the glass — that is what{' '}
            <a href="#adaptive">adaptive contrast</a> exists for.
          </p>
        </div>
      </Section>

      <Section
        id="support"
        eyebrow="Reference"
        title="Browser support"
        intro={
          <p>
            Every modern browser, desktop and mobile, with no flags. The
            features below are the ones the material actually depends on.
          </p>
        }
      >
        <div className="props" role="region" aria-label="Browser support" tabIndex={0}>
          <table className="props__table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Chromium</th>
                <th scope="col">Safari</th>
                <th scope="col">Firefox</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SUPPORT.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">
                    <code className="props__name">{row.feature}</code>
                  </th>
                  <td data-yes={row.chrome === 'Yes' || undefined}>{row.chrome}</td>
                  <td data-yes={row.safari === 'Yes' || undefined}>{row.safari}</td>
                  <td data-yes={row.firefox === 'Yes' || undefined}>{row.firefox}</td>
                  <td className="props__desc">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Subsection title="When backdrop-filter is missing">
          <CodeBlock code={FALLBACK} language="css" filename="surface.css" />
        </Subsection>
      </Section>
    </>
  );
}
