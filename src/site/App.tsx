import { useState } from 'react';
import { Hero } from './components/Hero';
import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';
import { GettingStarted } from './sections/GettingStarted';
import { Material } from './sections/Material';
import { AdaptiveSection } from './sections/AdaptiveSection';
import { RefractionSection } from './sections/RefractionSection';
import { ComponentsCore } from './sections/ComponentsCore';
import { ComponentsInteractive } from './sections/ComponentsInteractive';
import { Reference } from './sections/Reference';
import { REPO_URL } from './config';

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>

      {/* Fixed, never scrolls, and sits behind everything. The glass needs
          something with real colour and edges under it at every scroll
          position or the whole page is a demo of nothing. */}
      <div className="backdrop" aria-hidden="true" />

      <TopBar menuOpen={menuOpen} onMenuToggle={setMenuOpen} />

      <div className="shell">
        <Hero />

        <div className="layout">
          <SideNav />

          <main id="content" className="content">
            <GettingStarted />
            <Material />
            <AdaptiveSection />
            <RefractionSection />
            <ComponentsCore />
            <ComponentsInteractive />
            <Reference />
          </main>
        </div>

        <footer className="footer">
          <span>Liquid Glass · MIT</span>
          <span className="footer__spacer" />
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="#top">Back to top</a>
        </footer>
      </div>
    </>
  );
}
