import { useState } from 'react';
import {
  Button,
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
} from '../../lib';
import { Example } from '../components/Example';
import { PropsTable } from '../components/PropsTable';
import { Section, Subsection } from '../components/Section';


/* ---- Switch -------------------------------------------------------------- */

const SWITCH_CODE = `{/* A <button role="switch">, not a styled checkbox. A checkbox is
    announced "checked / not checked", which is wrong for a control
    that takes effect immediately; role="switch" says "on / off". */}
<Switch label="Reduce transparency" defaultChecked />

<Switch
  label="Sync across devices"
  checked={synced}
  onChange={setSynced}
/>`;

/* ---- Tabs ---------------------------------------------------------------- */

const TABS_CODE = `<Tabs defaultValue="overview">
  <TabList label="Account settings">
    <Tab value="overview">Overview</Tab>
    <Tab value="security">Security</Tab>
    <Tab value="billing">Billing</Tab>
  </TabList>

  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="security">…</TabPanel>
  <TabPanel value="billing">…</TabPanel>
</Tabs>`;

const TABS_ROWS = [
  {
    name: 'value / defaultValue',
    type: 'string',
    default: "''",
    description: 'Controlled and uncontrolled respectively.',
  },
  {
    name: 'onValueChange',
    type: '(value: string) => void',
    default: '—',
    description: 'Fires on click and on arrow-key navigation in automatic mode.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Also decides which arrow keys move between tabs.',
  },
  {
    name: 'activation',
    type: "'automatic' | 'manual'",
    default: "'automatic'",
    description:
      'Automatic selects on focus, which is the ARIA default and right when panels are cheap. Switch to manual when showing a panel costs a fetch.',
  },
  {
    name: 'keepMounted',
    type: 'boolean',
    default: 'false',
    description:
      'On TabPanel. Preserves scroll position and form state across switches, at the cost of rendering every panel.',
  },
];

/* ---- Navbar -------------------------------------------------------------- */

const NAVBAR_CODE = `{/* Blur and tint come up as the page scrolls under the bar. The
    transition is one --lg-nav-progress custom property written per
    frame; every visual change is a calc() on that number in CSS. */}
<Navbar threshold={72}>
  <NavbarBrand>
    <img src="/logos/logo-black.png" alt="Liquid Glass" className="navdemo__logo--dark" height={48} />
    <img src="/logos/logo-white.png" alt="Liquid Glass" className="navdemo__logo--light" height={48} />
  </NavbarBrand>
  <NavbarSpacer />
  <NavbarActions>
    <Button variant="ghost" size="sm">Docs</Button>
    <Button variant="primary" size="sm">Sign in</Button>
  </NavbarActions>
</Navbar>`;

/* ---- Modal --------------------------------------------------------------- */

const MODAL_CODE = `<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Delete workspace"
  description="This cannot be undone."
  initialFocusRef={cancelRef}
>
  <ModalBody>…</ModalBody>
  <ModalFooter>
    <Button ref={cancelRef} onClick={close}>Cancel</Button>
    <Button variant="primary" onClick={confirm}>Delete</Button>
  </ModalFooter>
</Modal>`;

/* ---- Tooltip ------------------------------------------------------------- */

const TOOLTIP_CODE = `{/* The trigger is cloned rather than wrapped, so aria-describedby
    lands on the actual control and no extra element gets between it
    and its parent's layout. */}
<Tooltip content="Regenerates the shader cache" placement="top">
  <Button variant="ghost" size="sm">Rebuild</Button>
</Tooltip>`;

export function ComponentsInteractive() {
  const [synced, setSynced] = useState(true);
  const [tab, setTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Section
        id="switch"
        eyebrow="Components"
        title="Switch"
        intro={
          <p>
            A recessed track with a raised thumb — the two lighting treatments
            in the library used against each other, which is what makes the
            thumb read as sitting above the track rather than inside it.
          </p>
        }
      >
        <Example code={SWITCH_CODE} stack>
          <div className="switchgrid">
            <Switch label="Reduce transparency" defaultChecked />
            <Switch label="Sync across devices" checked={synced} onChange={setSynced} />
            <Switch label="Beta features" />
            <Switch label="Unavailable" disabled />
          </div>
          <div className="switchgrid">
            <Switch size="sm" label="Small" defaultChecked />
            <Switch size="md" label="Medium" defaultChecked />
            <Switch size="lg" label="Large" defaultChecked />
          </div>
        </Example>
      </Section>

      <Section
        id="tabs"
        eyebrow="Components"
        title="Tabs"
        intro={
          <p>
            Follows the WAI-ARIA pattern properly: one tab stop for the whole
            list, arrow keys between tabs, Home and End to the ends. The
            indicator is a pane of glass that slides between positions, measured
            from the DOM rather than assuming every tab is the same width.
          </p>
        }
      >
        <Example code={TABS_CODE} stack>
          <Tabs value={tab} onValueChange={setTab}>
            <TabList label="Account settings">
              <Tab value="overview">Overview</Tab>
              <Tab value="security">Security</Tab>
              <Tab value="billing">Billing</Tab>
              <Tab value="archived" disabled>
                Archived
              </Tab>
            </TabList>

            <TabPanel value="overview">
              <p>
                Try the arrow keys. Focus moves between tabs without leaving the
                list, and Tab jumps straight past it to the panel.
              </p>
            </TabPanel>
            <TabPanel value="security">
              <p>
                The indicator is measured with a ResizeObserver, so it stays put
                when a late-loading font changes the label widths.
              </p>
            </TabPanel>
            <TabPanel value="billing">
              <p>
                Panels are unmounted when hidden unless you pass{' '}
                <code>keepMounted</code>.
              </p>
            </TabPanel>
          </Tabs>
        </Example>

        <PropsTable label="Tabs props" rows={TABS_ROWS} />
      </Section>

      <Section
        id="navbar"
        eyebrow="Components"
        title="Navbar"
        intro={
          <p>
            At the top of a page there is usually nothing behind the bar worth
            blurring, and a fully frosted bar over a hero just looks like a bug.
            So the glass thickens as content slides underneath. The bar at the
            top of this page is the same component.
          </p>
        }
      >
        <Example code={NAVBAR_CODE} stack flush>
          <div className="navdemo">
            <Navbar sticky={false} alwaysSolid className="navdemo__bar">
              <NavbarBrand>
                <img src="/logos/logo-black.png" alt="Liquid Glass" className="navdemo__logo navdemo__logo--dark" height={48} />
                <img src="/logos/logo-white.png" alt="Liquid Glass" className="navdemo__logo navdemo__logo--light" height={48} />
              </NavbarBrand>
              <NavbarSpacer />
              <NavbarActions>
                <Button variant="ghost" size="sm">
                  Docs
                </Button>
                <Button variant="primary" size="sm">
                  Sign in
                </Button>
              </NavbarActions>
            </Navbar>
            <p className="navdemo__note">
              Pinned at full strength here so it can be seen out of context.
              Scroll the page to watch the real one come up from nothing.
            </p>
          </div>
        </Example>
      </Section>

      <Section
        id="modal"
        eyebrow="Components"
        title="Modal"
        intro={
          <>
            <p>
              A portal rather than <code>&lt;dialog&gt;</code>. The native
              element would hand over a focus trap and the top layer for free,
              but the top layer sits outside the page's stacking context in a
              way that breaks <code>backdrop-filter</code> sampling — which is
              the entire effect here.
            </p>
            <p>
              So the three things it would have given us are implemented: focus
              trap, focus restore, and reference-counted scroll lock that
              compensates for the scrollbar so the page does not jump.
            </p>
          </>
        }
      >
        <Example code={MODAL_CODE}>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open dialog
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Delete workspace"
            description="This removes every project inside it. It cannot be undone."
          >
            <ModalBody>
              <p>
                Tab around — focus cannot leave the dialog. Escape closes it,
                and focus returns to the button that opened it.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Delete
              </Button>
            </ModalFooter>
          </Modal>
        </Example>
      </Section>

      <Section
        id="tooltip"
        eyebrow="Components"
        title="Tooltip"
        intro={
          <p>
            Shows on hover <em>and</em> on keyboard focus, stays open while the
            pointer is over the tooltip itself, and hides on Escape. All three
            are required by WCAG 1.4.13 and all three are routinely missing.
          </p>
        }
      >
        <Example code={TOOLTIP_CODE}>
          <Tooltip content="Regenerates the shader cache">
            <Button variant="secondary">Hover or focus me</Button>
          </Tooltip>
          <Tooltip content="Flips to the other side near an edge" placement="right">
            <Button variant="ghost">Right</Button>
          </Tooltip>
          <Tooltip content="Below" placement="bottom">
            <Button variant="ghost">Bottom</Button>
          </Tooltip>
        </Example>

        <Subsection title="Positioning">
          <p className="prose">
            Placement is viewport-aware: it flips to the opposite side when
            there is not room, then shifts along the cross axis to stay on
            screen. The hook that does it, <code>useAnchoredPosition</code>, is
            exported — it is the reusable half of a popover.
          </p>
        </Subsection>
      </Section>
    </>
  );
}
