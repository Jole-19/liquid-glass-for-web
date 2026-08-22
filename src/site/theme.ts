/**
 * Light and dark mode.
 *
 * The chosen theme lives on `<html>` as `data-theme`, alongside the library's
 * own `.lg-theme-light` class so the components flip with the page. The initial
 * value is applied by a blocking script in index.html rather than here --
 * waiting for React to mount would mean a frame of the wrong theme, which on a
 * dark-to-light change is a full-screen white flash.
 *
 * This module only has to keep up with what that script already decided.
 */
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'lg-theme';

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.dataset['theme'] = theme;
  root.classList.toggle('lg-theme-light', theme === 'light');
}

function read(): Theme {
  const attribute = document.documentElement.dataset['theme'];
  if (attribute === 'light' || attribute === 'dark') return attribute;
  return 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(read);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Not being able to remember the choice is survivable; refusing to
        // honour it for this session would not be.
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
