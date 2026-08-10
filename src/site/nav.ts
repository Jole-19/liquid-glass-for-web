/**
 * The site's table of contents.
 *
 * One list, consumed by both the floating navbar and the scroll spy, so a
 * section can never exist in the nav without existing on the page or the
 * other way round.
 */

export interface NavItem {
  id: string;
  label: string;
}

export interface NavGroup {
  /** Short label shown in the navbar. */
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Docs',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'install', label: 'Installation' },
    ],
  },
  {
    label: 'Material',
    items: [
      { id: 'anatomy', label: 'Anatomy' },
      { id: 'tokens', label: 'Tokens' },
      { id: 'adaptive', label: 'Adaptive contrast' },
      { id: 'refraction', label: 'WebGL tier' },
    ],
  },
  {
    label: 'Components',
    items: [
      { id: 'surface', label: 'GlassSurface' },
      { id: 'button', label: 'Button' },
      { id: 'input', label: 'Input' },
      { id: 'switch', label: 'Switch' },
      { id: 'tabs', label: 'Tabs' },
      { id: 'navbar', label: 'Navbar' },
      { id: 'modal', label: 'Modal' },
      { id: 'tooltip', label: 'Tooltip' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { id: 'accessibility', label: 'Accessibility' },
      { id: 'support', label: 'Browser support' },
    ],
  },
];

export const ALL_SECTION_IDS = NAV.flatMap((group) =>
  group.items.map((item) => item.id),
);
