import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../../lib';
import {
  IconClose,
  IconGitHub,
  IconMenu,
  IconMoon,
  IconSun,
} from '../icons';
import { NAV } from '../nav';
import { REPO_URL } from '../config';
import type { Theme } from '../theme';

/* ---- Chevron icon for dropdown triggers --------------------------------- */

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="fnav__chevron"
      data-open={open ? 'true' : undefined}
    >
      <path d="M2.5 3.75 5 6.25 7.5 3.75" />
    </svg>
  );
}

/* ---- Props -------------------------------------------------------------- */

export interface FloatingNavProps {
  menuOpen: boolean;
  onMenuToggle: (open: boolean) => void;
  theme: Theme;
  onThemeToggle: () => void;
}

/**
 * Floating pill-shaped glass navbar that replaces the old TopBar + SideNav.
 *
 * The bar is a real `lg-surface` with the library's own rim light, specular
 * highlight, and microtexture. Dropdowns open as their own glass panels. The
 * whole thing is pinned to `position: fixed` so it floats over the page
 * content, and uses Space Grotesk for all typography.
 */
export function FloatingNav({
  menuOpen,
  onMenuToggle,
  theme,
  onThemeToggle,
}: FloatingNavProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(0 as unknown as ReturnType<typeof setTimeout>);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!openGroup) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [openGroup]);

  /* Close dropdown on Escape */
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openGroup]);

  /* Close dropdown on hash change (link followed) */
  useEffect(() => {
    const close = () => {
      setOpenGroup(null);
      onMenuToggle(false);
    };
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, [onMenuToggle]);

  /* Close mobile menu on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMenuToggle(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, onMenuToggle]);

  const handleGroupEnter = useCallback(
    (label: string) => {
      clearTimeout(closeTimeout.current);
      setOpenGroup(label);
    },
    [],
  );

  const handleGroupLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => {
      setOpenGroup(null);
    }, 180);
  }, []);

  const handleGroupClick = useCallback(
    (label: string) => {
      setOpenGroup((prev) => (prev === label ? null : label));
    },
    [],
  );

  return (
    <>
      <nav
        ref={navRef}
        className="fnav lg-surface"
        aria-label="Site"
        data-elevation="raised"
        data-radius="pill"
      >
        {/* ---- Brand ---- */}
        <a className="fnav__brand lg-focusable" href="#top">
          <img
            className="fnav__logo-img"
            src={theme === 'dark' ? '/logos/logo-black.png' : '/logos/logo-white.png'}
            alt="Liquid Glass"
            width="140"
            height="28"
          />
        </a>

        {/* ---- Divider ---- */}
        <span className="fnav__divider" aria-hidden="true" />

        {/* ---- Nav items (desktop) ---- */}
        <div className="fnav__links">
          {NAV.map((group) => (
            <div
              key={group.label}
              className="fnav__group"
              onMouseEnter={() => handleGroupEnter(group.label)}
              onMouseLeave={handleGroupLeave}
            >
              <button
                type="button"
                className="fnav__trigger lg-focusable"
                onClick={() => handleGroupClick(group.label)}
                aria-expanded={openGroup === group.label}
                aria-haspopup="true"
              >
                {group.label}
                <IconChevron open={openGroup === group.label} />
              </button>

              {openGroup === group.label && (
                <div
                  className="fnav__dropdown lg-surface"
                  data-elevation="overlay"
                  data-radius="lg"
                  onMouseEnter={() => handleGroupEnter(group.label)}
                  onMouseLeave={handleGroupLeave}
                >
                  <ul className="fnav__dropdown-list">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <a
                          className="fnav__dropdown-link lg-focusable"
                          href={`#${item.id}`}
                          onClick={() => setOpenGroup(null)}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---- Spacer ---- */}
        <div className="fnav__spacer" aria-hidden="true" />

        {/* ---- Actions ---- */}
        <div className="fnav__actions">
          <Button
            type="button"
            className="fnav__theme"
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            variant="secondary"
            size="sm"
            iconOnly
            radius="pill"
            startIcon={theme === 'dark' ? <IconSun /> : <IconMoon />}
          />
          <Button
            as="a"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="sm"
            startIcon={<IconGitHub />}
            className="fnav__github"
          >
            GitHub
          </Button>
        </div>

        {/* ---- Mobile hamburger ---- */}
        <button
          type="button"
          className="fnav__hamburger lg-focusable"
          onClick={() => onMenuToggle(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {/* ---- Mobile drawer ---- */}
      <div
        className="fnav-mobile"
        id="mobile-nav"
        data-open={menuOpen ? 'true' : undefined}
        hidden={!menuOpen}
      >
        <div className="fnav-mobile__sheet lg-surface" data-elevation="overlay" data-radius="lg">
          {NAV.map((group) => (
            <div key={group.label} className="fnav-mobile__group">
              <p className="fnav-mobile__label">{group.label}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      className="lg-focusable"
                      href={`#${item.id}`}
                      onClick={() => onMenuToggle(false)}
                    >
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
          className="fnav-mobile__scrim"
          onClick={() => onMenuToggle(false)}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </>
  );
}
