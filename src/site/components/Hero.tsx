import { Button } from '../../lib';
import { IconArrowRight, IconGitHub } from '../icons';
import { REPO_URL } from '../config';

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
        <h1 className="hero__title">
          A Component Library For Web,
          <br className="hero__br" />
          Built on Real Glass Physics.
        </h1>

        <p className="hero__lede">
          Built on one portable CSS material: saturated backdrop, asymmetric rim
          light, inset specular, and real microtexture. An opt-in WebGL tier
          refracts pixels instead of blurring them.
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
              6.1<span>kB gzip</span>
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

      <div className="hero__stage">
        {/* Glass G logo mark — the hero's visual anchor, sitting behind
            the code panel in z-order. */}
        <img
          className="hero__mark"
          src="/logos/hero-img.png"
          alt=""
          aria-hidden="true"
        />


      </div>
    </header>
  );
}
