import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from '../../lib';
import { CodeBlock } from './CodeBlock';
import { REPO_SLUG, REPO_URL } from '../config';

/**
 * Install instructions.
 *
 * The package is not on npm yet, and pretending otherwise would hand people a
 * command that fails. So the working install -- straight from the GitHub repo,
 * which every one of these clients supports -- is the one shown, with the npm
 * form listed next to it as what it will become.
 *
 * Dogfoods the library's own Tabs, which is the point of building the docs site
 * with the thing it documents.
 */

const MANAGERS = [
  { id: 'pnpm', label: 'pnpm', add: 'pnpm add' },
  { id: 'npm', label: 'npm', add: 'npm install' },
  { id: 'yarn', label: 'yarn', add: 'yarn add' },
  { id: 'bun', label: 'bun', add: 'bun add' },
] as const;

export function InstallTabs() {
  const [manager, setManager] = useState<string>('pnpm');

  return (
    <div className="install">
      <Tabs value={manager} onValueChange={setManager}>
        <TabList label="Package manager">
          {MANAGERS.map((m) => (
            <Tab key={m.id} value={m.id}>
              {m.label}
            </Tab>
          ))}
        </TabList>

        {MANAGERS.map((m) => (
          <TabPanel key={m.id} value={m.id}>
            <CodeBlock
              language="shell"
              filename="install from GitHub"
              code={`${m.add} ${REPO_SLUG}\n\n# The WebGL refraction tier is optional.\n# Skip it unless you are using <GlassStage>.\n${m.add} @ybouane/liquidglass`}
            />
          </TabPanel>
        ))}
      </Tabs>

      <p className="install__note">
        Not on npm yet — installing from{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          the repository
        </a>{' '}
        is the supported route for now. Once it is published the command becomes{' '}
        <code>pnpm add liquid-glass-react</code>, and nothing else changes.
      </p>
    </div>
  );
}
