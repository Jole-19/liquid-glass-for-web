import { useEffect, useState } from 'react';
import { ALL_SECTION_IDS, NAV } from '../nav';
import { cx } from '../../lib';

/**
 * Sidebar with a scroll spy.
 *
 * The naive version -- highlight whatever is intersecting -- flickers between
 * two entries whenever a short section is fully on screen alongside the next
 * one. This tracks every section's intersection state and then picks the
 * topmost one that is visible, so the highlight only advances when the previous
 * section has actually left.
 */
export function SideNav() {
  const [active, setActive] = useState<string>(ALL_SECTION_IDS[0] ?? '');

  useEffect(() => {
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const topmost = ALL_SECTION_IDS.find((id) => visible.has(id));
        if (topmost) setActive(topmost);
      },
      {
        // Ignores the top strip under the fixed header and the bottom two
        // thirds, which leaves a band just below the header as the thing that
        // decides -- close to where a reader's eye actually is.
        rootMargin: '-88px 0px -66% 0px',
        threshold: 0,
      },
    );

    for (const id of ALL_SECTION_IDS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sidenav" aria-label="Documentation sections">
      <div className="sidenav__inner">
        {NAV.map((group) => (
          <div className="sidenav__group" key={group.label}>
            <p className="sidenav__label">{group.label}</p>
            <ul className="sidenav__list">
              {group.items.map((item) => {
                const current = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={cx('sidenav__link', 'lg-focusable')}
                      data-active={current ? 'true' : undefined}
                      aria-current={current ? 'location' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
