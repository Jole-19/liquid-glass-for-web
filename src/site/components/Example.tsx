import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';

export interface ExampleProps {
  /** The thing itself, rendered live. */
  children: ReactNode;
  /** The source that produced it. Kept honest by hand. */
  code: string;
  title?: string;
  description?: ReactNode;
  /** Start with the source open. Use for examples where the API is the point. */
  defaultOpen?: boolean;
  /** Lays the preview out as a column, for wide or stacked demos. */
  stack?: boolean;
  /** Removes the preview padding, for demos that manage their own box. */
  flush?: boolean;
}

export function Example({
  children,
  code,
  title,
  description,
  defaultOpen = false,
  stack = false,
  flush = false,
}: ExampleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `example-${useId()}`;

  return (
    <figure className="example">
      {title || description ? (
        <figcaption className="example__caption">
          {title ? <h4 className="example__title">{title}</h4> : null}
          {description ? <p className="example__desc">{description}</p> : null}
        </figcaption>
      ) : null}

      <div
        className="example__preview"
        data-stack={stack ? 'true' : undefined}
        data-flush={flush ? 'true' : undefined}
      >
        {children}
      </div>

      <div className="example__footer">
        <button
          type="button"
          className="example__toggle lg-focusable"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          {open ? 'Hide code' : 'Show code'}
        </button>
      </div>

      {/* Unmounted rather than hidden. These blocks tokenize on mount, and
          keeping every collapsed snippet on the page would do that work for
          the dozens of examples nobody expands. */}
      {open ? (
        <div className="example__code" id={panelId}>
          <CodeBlock code={code} />
        </div>
      ) : null}
    </figure>
  );
}
