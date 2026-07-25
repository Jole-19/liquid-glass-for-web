import { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  GlassSurface,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Navbar,
  NavbarActions,
  NavbarBrand,
  NavbarSpacer,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
} from '../lib';
import { IconArrowRight, IconSearch, IconSparkle } from './icons';
import { Refraction } from './Refraction';

export function App() {
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="demo-backdrop" aria-hidden="true" />

      <Navbar>
        <NavbarBrand>
          <IconSparkle />
          Liquid Glass
        </NavbarBrand>
        <NavbarSpacer />
        <NavbarActions>
          <Tooltip content="Scroll down — the bar frosts as content passes under it">
            <Button variant="ghost" size="sm">
              Docs
            </Button>
          </Tooltip>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
        </NavbarActions>
      </Navbar>

      <main className="demo-page">
        <header className="demo-hero">
          <h1>Liquid Glass</h1>
          <p>
            A glassmorphic React component library built on one portable CSS
            material, with an opt-in WebGL refraction tier for hero elements.
          </p>
        </header>

        <section className="demo-section">
          <h2>Surface</h2>
          <div className="demo-row">
            <GlassSurface className="demo-panel" radius="lg" elevation="flat">
              flat
            </GlassSurface>
            <GlassSurface className="demo-panel" radius="lg">
              default
            </GlassSurface>
            <GlassSurface className="demo-panel" radius="lg" elevation="raised">
              raised
            </GlassSurface>
            <GlassSurface
              className="demo-panel"
              radius="lg"
              elevation="overlay"
              interactive
            >
              overlay, interactive
            </GlassSurface>
          </div>
        </section>

        <section className="demo-section">
          <h2>Button</h2>
          <div className="demo-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" endIcon={<IconArrowRight />}>
              With icon
            </Button>
            <Tooltip content="Enhance" placement="bottom">
              <Button iconOnly aria-label="Enhance" startIcon={<IconSparkle />} />
            </Tooltip>
            <Button disabled>Disabled</Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => setLoading(false), 1800);
              }}
            >
              Submit
            </Button>
            <Button as="a" href="#top" variant="ghost">
              As a link
            </Button>
          </div>
          <div className="demo-row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Refraction />

        <section className="demo-section">
          <h2>Card</h2>
          <div className="demo-row demo-row--top">
            <Card className="demo-card">
              <CardHeader>
                <CardTitle>Two-tier material</CardTitle>
                <CardDescription>Portable CSS, opt-in WebGL</CardDescription>
              </CardHeader>
              <CardBody>
                Every component is the same surface at a different tint, so a
                button and a card side by side are demonstrably one material.
              </CardBody>
              <CardFooter>
                <Button size="sm" variant="primary">
                  Read more
                </Button>
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
              </CardFooter>
            </Card>

            <Card className="demo-card" interactive>
              <CardHeader>
                <CardTitle>Interactive</CardTitle>
                <CardDescription>Hover and press states</CardDescription>
              </CardHeader>
              <CardBody>
                Hover thickens the tint and deepens the blur; press pushes the
                pane half a pixel toward the surface and collapses the ambient
                shadow.
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="demo-section">
          <h2>Input &amp; Switch</h2>
          <div className="demo-row demo-row--top">
            <Input
              label="Search"
              placeholder="Type to filter…"
              startIcon={<IconSearch />}
              hint="Matches names and descriptions."
            />
            <Input
              label="Email"
              type="email"
              required
              defaultValue="not-an-email"
              error="Enter a valid email address."
            />
            <Input label="Disabled" placeholder="Unavailable" disabled />
          </div>
          <div className="demo-row">
            <Switch
              label="Notifications"
              checked={notify}
              onChange={setNotify}
            />
            <Switch label="Small" size="sm" defaultChecked />
            <Switch label="Large" size="lg" />
            <Switch label="Disabled" disabled defaultChecked />
          </div>
        </section>

        <section className="demo-section">
          <h2>Tooltip</h2>
          <div className="demo-row">
            {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
              <Tooltip
                key={placement}
                placement={placement}
                content={`Placed on the ${placement}, flipping if it does not fit`}
              >
                <Button variant="secondary">{placement}</Button>
              </Tooltip>
            ))}
          </div>
        </section>

        <section className="demo-section">
          <h2>Tabs</h2>
          <Tabs defaultValue="material">
            <TabList label="Library sections">
              <Tab value="material">Material</Tab>
              <Tab value="tokens">Tokens</Tab>
              <Tab value="refraction">Refraction</Tab>
              <Tab value="soon" disabled>
                Soon
              </Tab>
            </TabList>

            <TabPanel value="material">
              <GlassSurface className="demo-panel" radius="lg">
                One <code>.lg-surface</code> class assembles the tint, the
                asymmetric rim light, the inset specular, the noise
                microtexture and the layered shadows. Every component is that
                surface with different tokens.
              </GlassSurface>
            </TabPanel>

            <TabPanel value="tokens">
              <GlassSurface className="demo-panel" radius="lg">
                Light direction, blur, saturation, tint and shadow scales are
                all custom properties. Change <code>--lg-light-angle</code> on{' '}
                <code>:root</code> and every rim, highlight and shadow on the
                page moves together.
              </GlassSurface>
            </TabPanel>

            <TabPanel value="refraction">
              <GlassSurface className="demo-panel" radius="lg">
                The WebGL tier is still to come. It refracts real pixels rather
                than blurring them, and is reserved for one or two hero
                elements over imagery.
              </GlassSurface>
            </TabPanel>
          </Tabs>
        </section>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Focus is trapped in here"
        description="Tab cycles within the dialog, Escape closes it, and focus returns to the button that opened it."
      >
        <ModalBody>
          <p>
            The scrim is glass rather than a flat black wash, so the page stays
            recognisable behind the dialog. Scrolling is locked while it is
            open, with the scrollbar width compensated so the layout underneath
            does not shift.
          </p>
          <Input label="Try tabbing" placeholder="…then shift-tab past the start" />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
