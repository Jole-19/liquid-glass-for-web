import { useEffect } from 'react';
import { Button, Navbar, NavbarActions, NavbarBrand, NavbarSpacer } from '../../lib';
import { IconClose, IconGitHub, IconMenu, IconSparkle } from '../icons';
import { NAV } from '../nav';
import { REPO_URL } from '../config';

export interface TopBarProps {
  menuOpen: boolean;
  onMenuToggle: (open: boolean) => void;
}

/**
 * The site header, which is the library's own Navbar.
 *
 * On narrow screens the sidebar collapses into a sheet behind the menu button.
 * It is a plain overlay rather than the library's Modal: a navigation drawer
 * should not lock scrolling or trap focus the way a dialog does, and dismissing
 * it by tapping a link is the normal path rather than an escape hatch.
 */
export function TopBar({ menuOpen, onMenuToggle }: TopBarProps) {
  // Any hash change means a link was followed, which should close the sheet.
  useEffect(() => {
    const close = () => onMenuToggle(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, [onMenuToggle]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMenuToggle(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, onMenuToggle]);

  return (
    <>
      <Navbar className="topbar" aria-label="Site">
        <button
          type="button"
          className="topbar__menu lg-focusable"
          onClick={() => onMenuToggle(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        <NavbarBrand>
          <span className="topbar__mark" aria-hidden="true">
            <IconSparkle />
          </span>
          <a className="topbar__wordmark lg-focusable" href="#top">
            Liquid Glass
          </a>
          <span className="topbar__version">v0.1.0</span>
        </NavbarBrand>

        <NavbarSpacer />

        <NavbarActions>
          <Button as="a" href="#install" variant="ghost" size="sm">
            Install
          </Button>
          <Button
            as="a"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="sm"
            startIcon={<IconGitHub />}
          >
            GitHub
          </Button>
        </NavbarActions>
      </Navbar>

      <div
        className="mobilenav"
        id="mobile-nav"
        data-open={menuOpen ? 'true' : undefined}
        hidden={!menuOpen}
      >
        <div className="mobilenav__sheet lg-surface" data-elevation="overlay">
          {NAV.map((group) => (
            <div key={group.label} className="mobilenav__group">
              <p className="mobilenav__label">{group.label}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a className="lg-focusable" href={`#${item.id}`}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mobilenav__scrim"
          onClick={() => onMenuToggle(false)}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </>
  );
}
