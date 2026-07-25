import { Anatomy } from '../components/Anatomy';
import { Playground } from '../components/Playground';
import { PropsTable } from '../components/PropsTable';
import { Section, Subsection } from '../components/Section';

const TOKEN_ROWS = [
  {
    name: '--lg-light-angle',
    type: '<angle>',
    default: '145deg',
    description:
      'Where the light comes from. Every rim, specular and shadow in the library derives its geometry from this, which is what keeps a page of components looking like one physical material.',
  },
  {
    name: '--lg-blur',
    type: '<length>',
    default: '20px',
    description: 'Backdrop blur radius. Registered with @property so it can animate.',
  },
  {
    name: '--lg-saturate',
    type: '<percentage>',
    default: '180%',
    description:
      'Backdrop saturation. Pushing past 100% is the difference between glass and grey plastic.',
  },
  {
    name: '--lg-tint-hue',
    type: '<number>',
    default: '220',
    description: 'Hue of the glass body. Also drives the shadow and inner-shadow colour.',
  },
  {
    name: '--lg-tint-alpha',
    type: '<number>',
    default: '0.1',
    description: 'Tint strength. Animated on hover and press.',
  },
  {
    name: '--lg-noise-opacity',
    type: '<number>',
    default: '0.035',
    description: 'Microtexture strength. Usable range is roughly 0.02 to 0.04.',
  },
  {
    name: '--lg-accent-hue',
    type: '<number>',
    default: '220',
    description: 'Drives the primary button, focus ring and selection states.',
  },
  {
    name: '--lg-radius-sm | md | lg | xl',
    type: '<length>',
    default: '8 / 14 / 20 / 28px',
    description: 'The radius scale every component picks from.',
  },
  {
    name: '--lg-shadow-raised',
    type: '<shadow>',
    default: '3 layers',
    description:
      'Cast shadow for the raised elevation. Also --lg-shadow and --lg-shadow-overlay.',
  },
  {
    name: '--lg-ease-spring',
    type: '<easing>',
    default: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    description:
      'The house curve for anything that should feel physical. Overshoots slightly.',
  },
];

export function Material() {
  return (
    <>
      <Section
        id="anatomy"
        eyebrow="The material"
        title="Anatomy"
        intro={
          <>
            <p>
              A glass panel here is three stacked layers on a single element:
              the element itself carries the tint, body gradient, backdrop
              filter, insets and shadows; <code>::before</code> draws the rim
              light and chromatic fringe; <code>::after</code> lays down the
              microtexture.
            </p>
            <p>
              Individually none of them look like much. The argument for each
              one only becomes obvious when you take it away.
            </p>
          </>
        }
      >
        <Anatomy />
      </Section>

      <Section
        id="tokens"
        eyebrow="The material"
        title="Tokens"
        intro={
          <p>
            Roughly sixty custom properties, all named{' '}
            <code>--lg-&lt;group&gt;-&lt;name&gt;</code>. The ones below are the
            handful you are actually likely to touch.
          </p>
        }
      >
        <Playground />

        <Subsection title="Reference">
          <PropsTable label="Design tokens" rows={TOKEN_ROWS} />
          <div className="callout">
            <p>
              Tokens a component overrides locally read through an
              indirection — <code>--lg-tint</code> defaults from{' '}
              <code>--lg-tint-base</code> — so a component can set the near
              token without clobbering your theme.
            </p>
          </div>
        </Subsection>
      </Section>
    </>
  );
}
