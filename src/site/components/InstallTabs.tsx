import { useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from '../../lib';
import { CodeBlock } from './CodeBlock';
import { PACKAGE_NAME, REPO_URL } from '../config';

/** Install instructions, dogfooding the library's own Tabs. */

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
              filename="install"
              code={`${m.add} ${PACKAGE_NAME}\n\n# The WebGL refraction tier is optional.\n# Skip it unless you are using <GlassStage>.\n${m.add} @ybouane/liquidglass`}
            />
          </TabPanel>
        ))}
      </Tabs>

      <p className="install__note">
        Install from{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer">npm</a>{' '}
        or straight from the repository. The optional WebGL peer
        dependency is only needed if you use <code>&lt;GlassStage&gt;</code>.
      </p>
    </div>
  );
}
