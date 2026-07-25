import type { ReactNode } from 'react';

export interface SectionProps {
  id: string;
  /** Small label above the heading, for grouping. */
  eyebrow?: string;
  title: string;
  /** Standfirst under the heading. Prose, not a caption. */
  intro?: ReactNode;
  children?: ReactNode;
}

export function Section({ id, eyebrow, title, intro, children }: SectionProps) {
  return (
    <section className="section" id={id} aria-labelledby={`${id}-heading`}>
      <header className="section__head">
        {eyebrow ? <p className="section__eyebrow">{eyebrow}</p> : null}
        <h2 className="section__title" id={`${id}-heading`}>
          {/* An anchor on the heading rather than a hover-only link icon, so it
              is reachable by keyboard and readable as a permalink. */}
          <a className="section__anchor" href={`#${id}`} aria-label={`Link to ${title}`}>
            {title}
          </a>
        </h2>
        {intro ? <div className="section__intro">{intro}</div> : null}
      </header>
      {children}
    </section>
  );
}

export interface SubsectionProps {
  id?: string;
  title: string;
  children?: ReactNode;
}

export function Subsection({ id, title, children }: SubsectionProps) {
  return (
    <div className="subsection" id={id}>
      <h3 className="subsection__title">{title}</h3>
      {children}
    </div>
  );
}
