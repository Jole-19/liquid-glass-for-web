import { Button, GlassSurface } from '../../lib';
import { IconArrowRight, IconGitHub } from '../icons';
import { PACKAGE_NAME, REPO_URL } from '../config';

/**
 * The hero doubles as the first proof.
 *
 * Rather than a screenshot of the material, the panel floating over the
 * backdrop *is* the material, at the largest size anywhere on the page. If the
 * glass does not hold up here it does not hold up anywhere, which is a useful
 * thing to be forced to look at on every page load.
 */
export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero__body">
        <p className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          React + TypeScript · no dependencies beyond React
        </p>

        <h1 className="hero__title">
          Glass that behaves
          <br />
          like glass.
        </h1>

        <p className="hero__lede">
          A component library built on one portable CSS material — saturated
          backdrop, asymmetric rim light, inset specular and real
          microtexture — with an opt-in WebGL tier that refracts pixels instead
          of blurring them.
        </p>

        <div className="hero__actions">
          <Button
            as="a"
            href="#install"
            variant="primary"
            size="lg"
            endIcon={<IconArrowRight />}
          >
            Get started
          </Button>
          <Button
            as="a"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="lg"
            startIcon={<IconGitHub />}
          >
            View source
          </Button>
        </div>

        {/* Measured from `pnpm build:lib`, not estimated. Worth re-checking
            here whenever the library build output changes. */}
        <dl className="hero__stats">
          <div>
            <dt>JavaScript</dt>
            <dd>
              9.5<span>kB gzip</span>
            </dd>
          </div>
          <div>
            <dt>Stylesheet</dt>
            <dd>
              5.8<span>kB gzip</span>
            </dd>
          </div>
          <div>
            <dt>Components</dt>
            <dd>9</dd>
          </div>
          <div>
            <dt>Dependencies</dt>
            <dd>0</dd>
          </div>
        </dl>
      </div>

      <GlassSurface className="hero__panel" radius="xl" elevation="overlay">
        <div className="hero__panel-row">
          <span className="hero__panel-dot" data-tone="a" aria-hidden="true" />
          <span className="hero__panel-dot" data-tone="b" aria-hidden="true" />
          <span className="hero__panel-dot" data-tone="c" aria-hidden="true" />
        </div>
        <pre className="hero__snippet">
          <code>
            <span className="tk tk--keyword">import</span>
            <span className="tk tk--punctuation"> {'{ '}</span>
            <span className="tk tk--tag">Button</span>
            <span className="tk tk--punctuation">{' } '}</span>
            <span className="tk tk--keyword">from</span>{' '}
            <span className="tk tk--string">{`'${PACKAGE_NAME}'`}</span>
            <span className="tk tk--punctuation">;</span>
            {'\n'}
            <span className="tk tk--keyword">import</span>{' '}
            <span className="tk tk--string">{`'${PACKAGE_NAME}/styles.css'`}</span>
            <span className="tk tk--punctuation">;</span>
            {'\n\n'}
            <span className="tk tk--tag">{'<Button'}</span>{' '}
            <span className="tk tk--attr">variant</span>
            <span className="tk tk--punctuation">=</span>
            <span className="tk tk--string">"primary"</span>
            <span className="tk tk--tag">{'>'}</span>
            {'Continue'}
            <span className="tk tk--tag">{'</Button>'}</span>
          </code>
        </pre>
        <div className="hero__panel-actions">
          <Button variant="primary" size="sm">
            Continue
          </Button>
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      </GlassSurface>
    </header>
  );
}
