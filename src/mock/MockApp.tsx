import { useState, useRef } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
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

/* ---- Inline SVG icons ---------------------------------------------------- */

const I = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function IconBell() {
  return (
    <svg {...I}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg {...I}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg {...I}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg {...I}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg {...I}>
      <path d="M21 8V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
      <path d="M23 4H1v4h22Z" />
      <path d="M10 12h4" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg {...I}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg {...I}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg {...I}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg {...I}>
      <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9z" />
      <path d="M18.5 3.5v3M20 5h-3" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg {...I}>
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg {...I}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg {...I}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg {...I}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/* ---- Theme toggle -------------------------------------------------------- */

function useTheme(): ['light' | 'dark', () => void] {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.dataset['theme'] as 'light' | 'dark') ?? 'dark';
  });
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset['theme'] = next;
    document.documentElement.classList.toggle('lg-theme-light', next === 'light');
    try {
      localStorage.setItem('lg-theme', next);
    } catch {}
  };
  return [theme, toggle];
}

/* ---- Stats data ---------------------------------------------------------- */

const STATS = [
  { label: 'Revenue', value: '$48.2k', change: '+12.4%', up: true },
  { label: 'Users', value: '2,847', change: '+8.1%', up: true },
  { label: 'Conversion', value: '3.24%', change: '-0.6%', up: false },
  { label: 'Avg. Order', value: '$67.50', change: '+2.3%', up: true },
];

const PROJECTS = [
  { name: 'Aurora Dashboard', status: 'Active', progress: 78, colour: 'var(--lg-accent)' },
  { name: 'Nebula API', status: 'Review', progress: 92, colour: 'hsl(160 70% 55%)' },
  { name: 'Prism Mobile', status: 'Draft', progress: 34, colour: 'hsl(280 60% 65%)' },
];

const ACTIVITY = [
  { user: 'Alice', action: 'deployed v2.4.1 to production', time: '2 min ago' },
  { user: 'Bob', action: 'opened a pull request on Nebula API', time: '18 min ago' },
  { user: 'Carol', action: 'resolved 3 critical issues', time: '1 hr ago' },
  { user: 'Dave', action: 'updated the design tokens', time: '3 hr ago' },
];

/* ========================================================================== */

export function MockApp() {
  const [theme, toggleTheme] = useTheme();
  const [tab, setTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const openDelete = (name: string) => {
    setDeleteTarget(name);
    setModalOpen(true);
  };

  return (
    <>
      {/* ---- backdrop ---------------------------------------------------- */}
      <div className="mock-backdrop" aria-hidden="true" />

      {/* ---- Navbar ------------------------------------------------------ */}
      <Navbar threshold={40}>
        <NavbarBrand>
          <span className="mock-brand-icon" aria-hidden="true">
            <IconSparkle />
          </span>
          Cosmos
        </NavbarBrand>
        <NavbarSpacer />
        <NavbarActions>
          <Input
            placeholder="Search…"
            inputSize="sm"
            startIcon={<IconSearch />}
            className="mock-search"
          />
          <Tooltip content="Notifications">
            <Button variant="ghost" size="sm" iconOnly aria-label="Notifications">
              <IconBell />
            </Button>
          </Tooltip>
          <Tooltip content={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </Button>
          </Tooltip>
          <Tooltip content="Account">
            <Button variant="ghost" size="sm" iconOnly aria-label="Account">
              <IconUser />
            </Button>
          </Tooltip>
        </NavbarActions>
      </Navbar>

      {/* ---- Main shell -------------------------------------------------- */}
      <div className="mock-shell">
        <header className="mock-header">
          <div>
            <h1 className="mock-title">Dashboard</h1>
            <p className="mock-subtitle">Welcome back — here's what's happening today.</p>
          </div>
          <Button variant="primary" startIcon={<IconPlus />}>
            New project
          </Button>
        </header>

        {/* ---- Stat cards ------------------------------------------------ */}
        <div className="mock-stats">
          {STATS.map((s) => (
            <GlassSurface key={s.label} className="mock-stat" radius="lg" interactive>
              <span className="mock-stat__icon">
                <IconTrend />
              </span>
              <span className="mock-stat__label">{s.label}</span>
              <span className="mock-stat__value">{s.value}</span>
              <span className={'mock-stat__change' + (s.up ? ' up' : ' down')}>
                {s.change}
              </span>
            </GlassSurface>
          ))}
        </div>

        {/* ---- Tabs ------------------------------------------------------ */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabList label="Dashboard sections" className="mock-tablist">
            <Tab value="overview">Overview</Tab>
            <Tab value="projects">Projects</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>

          {/* ---- Overview panel ------------------------------------------ */}
          <TabPanel value="overview">
            <div className="mock-grid">
              {/* Activity feed */}
              <Card className="mock-feed" radius="lg">
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>What your team has been up to</CardDescription>
                </CardHeader>
                <CardBody>
                  <ul className="mock-activity">
                    {ACTIVITY.map((a, i) => (
                      <li key={i} className="mock-activity__item">
                        <span className="mock-activity__avatar">{a.user[0]}</span>
                        <div>
                          <span className="mock-activity__user">{a.user}</span>{' '}
                          {a.action}
                          <span className="mock-activity__time">{a.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              {/* Quick actions card */}
              <Card className="mock-actions-card" radius="lg">
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="mock-quick-actions">
                    <Button variant="secondary" block startIcon={<IconFolder />}>
                      Browse files
                    </Button>
                    <Button variant="secondary" block startIcon={<IconBox />}>
                      View packages
                    </Button>
                    <Button variant="secondary" block startIcon={<IconSettings />}>
                      Team settings
                    </Button>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button variant="ghost" size="sm">
                    View all →
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabPanel>

          {/* ---- Projects panel ------------------------------------------ */}
          <TabPanel value="projects">
            <div className="mock-projects">
              {PROJECTS.map((p) => (
                <Card key={p.name} className="mock-project" radius="lg" interactive>
                  <CardMedia>
                    <div
                      className="mock-project__art"
                      style={{ '--project-colour': p.colour } as React.CSSProperties}
                      aria-hidden="true"
                    />
                  </CardMedia>
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.status} · {p.progress}% complete</CardDescription>
                  </CardHeader>
                  <CardBody>
                    <div className="mock-progress">
                      <div
                        className="mock-progress__bar"
                        style={{
                          width: `${p.progress}%`,
                          background: p.colour,
                        }}
                      />
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button variant="primary" size="sm" startIcon={<IconCheck />}>
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      startIcon={<IconTrash />}
                      onClick={() => openDelete(p.name)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabPanel>

          {/* ---- Settings panel ------------------------------------------ */}
          <TabPanel value="settings">
            <Card radius="lg" className="mock-settings">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customise your workspace experience</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="mock-settings__grid">
                  <Input
                    label="Display name"
                    placeholder="Your name"
                    defaultValue="Alex Chen"
                    block
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="alex@acme.com"
                    defaultValue="alex@cosmos.io"
                    block
                  />
                  <Input
                    label="API Key"
                    hint="Used for programmatic access."
                    defaultValue="sk-xxxx-xxxx-xxxx"
                    block
                  />
                  <Input
                    label="Webhook URL"
                    placeholder="https://..."
                    error="This URL returned a 404."
                    block
                  />
                  <div className="mock-settings__switches">
                    <Switch
                      label="Push notifications"
                      checked={notifications}
                      onChange={setNotifications}
                    />
                    <Switch
                      label="Auto-save drafts"
                      checked={autoSave}
                      onChange={setAutoSave}
                    />
                    <Switch
                      label="Compact mode"
                      checked={compactMode}
                      onChange={setCompactMode}
                    />
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="primary" loading>
                  Save changes
                </Button>
                <Button variant="ghost">Reset</Button>
              </CardFooter>
            </Card>
          </TabPanel>
        </Tabs>
      </div>

      {/* ---- Delete modal ------------------------------------------------ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Delete ${deleteTarget}`}
        description="This action cannot be undone. All files and deployments will be permanently removed."
        initialFocusRef={cancelRef}
      >
        <ModalBody>
          <p>
            Are you sure you want to delete <strong>{deleteTarget}</strong>? This will
            remove all associated data, deployments and team access.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button ref={cancelRef} onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
