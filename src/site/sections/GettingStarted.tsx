import { Section, Subsection } from '../components/Section';
import { CodeBlock } from '../components/CodeBlock';
import { InstallTabs } from '../components/InstallTabs';
import { PACKAGE_NAME } from '../config';

const QUICK_START = `import { Button, Card, CardTitle, CardBody } from '${PACKAGE_NAME}';
import '${PACKAGE_NAME}/styles.css';

export function Panel() {
  return (
    <Card elevation="raised" radius="lg">
      <CardTitle>Approve transfer</CardTitle>
      <CardBody>
        The glass reads the page behind it, so this panel looks
        different over a photo than it does over a gradient.
      </CardBody>
      <Button variant="primary">Approve</Button>
    </Card>
  );
}`;

const THEMING = `/* Every visual decision in the library resolves through a token.
   Override on :root and the change reaches every component. */
:root {
  --lg-tint-hue: 280;
  --lg-blur: 28px;
  --lg-saturate: 200%;
  --lg-light-angle: 210deg;
  --lg-radius-lg: 26px;
}`;

const THEMING_LIGHT = `/* Glass over a bright page is a different material, not the same
   one with the text inverted: a white pane with real body, a dark
   shadow-side rim, and roughly double the shadow. */
<html class="lg-theme-light">

/* Or per subtree, wherever the backdrop under it is bright. */
<aside class="lg-theme-light">…</aside>

/* Both themes are built from the same two scalars, so retuning is
   two numbers rather than a second copy of the stylesheet. */
.lg-theme-light {
  --lg-tint-scale: 3.6;      /* multiplies every tint alpha */
  --lg-shadow-strength: 1.9; /* multiplies every shadow alpha */
}`;

const PILLARS = [
  {
    title: 'One material, not ten components',
    body: 'Every component is the same surface primitive with different geometry. A token change moves the rim, specular, shadow and fallback together, so nothing drifts out of step.',
  },
  {
    title: 'Portable CSS at the base',
    body: 'The stylesheet has no React in it. Tier 1 is plain classes and custom properties, so it works in Vue, Svelte, Astro or hand-written HTML.',
  },
  {
    title: 'Refraction only where it earns it',
    body: 'The WebGL tier is a separate optional peer dependency, dynamically imported. Ship nothing extra unless you actually render a GlassStage.',
  },
  {
    title: 'Degrades honestly',
    body: 'No backdrop-filter, forced colors, reduced motion and increased contrast each have a deliberate answer rather than a broken layout.',
  },
];

export function GettingStarted() {
  return (
    <>
      <Section
        id="overview"
        eyebrow="Getting started"
        title="Overview"
        intro={
          <>
            <p>
              Most glassmorphism on the web is one line —{' '}
              <code>backdrop-filter: blur(12px)</code> — and it always looks
              like one line. Real glass has a lit edge, a thickness, a surface
              that is not perfectly smooth, and it bends colour rather than
              only smearing it.
            </p>
            <p>
              This library treats that as a material problem rather than a
              styling problem. There is one surface, assembled from seven
              layers, and every component is that surface in a different shape.
            </p>
          </>
        }
      >
        <ul className="pillars">
          {PILLARS.map((pillar) => (
            <li className="pillars__item" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </li>
          ))}
        </ul>

        <Subsection title="Two tiers">
          <div className="tiers">
            <div className="tiers__card">
              <p className="tiers__tag">Tier 1</p>
              <h4>CSS material</h4>
              <p>
                A saturated backdrop filter under six hand-tuned layers. Runs
                everywhere, costs nothing beyond a stylesheet, and is what every
                component in the library is built from.
              </p>
              <p className="tiers__meta">Default · ~6.1 kB gzip · no JS required</p>
            </div>
            <div className="tiers__card" data-accent="true">
              <p className="tiers__tag">Tier 2</p>
              <h4>WebGL refraction</h4>
              <p>
                Real per-pixel refraction with chromatic dispersion, for the one
                or two hero elements on a page where it is worth the GPU. Opt in
                per element, loaded on demand.
              </p>
              <p className="tiers__meta">Optional · lazy loaded · graceful fallback</p>
            </div>
          </div>
        </Subsection>
      </Section>

      <Section
        id="install"
        eyebrow="Getting started"
        title="Installation"
        intro={
          <p>
            React 18 or 19 and a bundler that understands CSS imports. There are
            no runtime dependencies beyond React itself.
          </p>
        }
      >
        <InstallTabs />

        <Subsection title="Quick start">
          <p className="prose">
            Import the stylesheet once, at the root of your app. It is a plain
            file rather than injected styles, so you control where it lands in
            the cascade.
          </p>
          <CodeBlock code={QUICK_START} filename="Panel.tsx" />
        </Subsection>

        <Subsection title="Theming">
          <p className="prose">
            There is no theme provider and no configuration file. Overriding a
            custom property is the entire API — on <code>:root</code> for the
            whole app, or on any subtree for part of it.
          </p>
          <CodeBlock code={THEMING} language="css" filename="theme.css" />

          <p className="prose">
            The one thing that is not a free-form token override is the
            brightness of what sits behind the glass. A value tuned for a dark
            page is not slightly off on a light one, it is invisible — white rim
            on white, a shadow at 16%, grain in <code>overlay</code> that
            resolves to nothing as the backdrop approaches white. So there are
            two surround themes, and everything else derives from whichever one
            is in scope.
          </p>
          <CodeBlock code={THEMING_LIGHT} language="css" filename="light.css" />

          <div className="callout">
            <p>
              Try it live in the{' '}
              <a href="#tokens">token playground</a> further down — it generates
              exactly this block as you move the sliders.
            </p>
          </div>
        </Subsection>
      </Section>
    </>
  );
}
