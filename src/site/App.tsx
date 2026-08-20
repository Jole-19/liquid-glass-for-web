import { useState } from 'react';
import { Hero } from './components/Hero';
import { FloatingNav } from './components/FloatingNav';
import { GettingStarted } from './sections/GettingStarted';
import { Material } from './sections/Material';
import { AdaptiveSection } from './sections/AdaptiveSection';
import { RefractionSection } from './sections/RefractionSection';
import { ComponentsCore } from './sections/ComponentsCore';
import { ComponentsInteractive } from './sections/ComponentsInteractive';
import { Reference } from './sections/Reference';
import { REPO_URL } from './config';
import { useTheme } from './theme';

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>

      {/* Fixed, never scrolls, and sits behind everything. The glass needs
          something with real colour and edges under it at every scroll
          position or the whole page is a demo of nothing. */}
      <div className="backdrop" aria-hidden="true" />

      <FloatingNav
        menuOpen={menuOpen}
        onMenuToggle={setMenuOpen}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <div className="shell">
        <Hero />

        <main id="content" className="content">
          <GettingStarted />
          <Material />
          <AdaptiveSection />
          <RefractionSection />
          <ComponentsCore />
          <ComponentsInteractive />
          <Reference />
        </main>

        <footer className="footer">
          <span>Liquid Glass for Web · MIT</span>
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
