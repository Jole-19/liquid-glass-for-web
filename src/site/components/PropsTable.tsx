import type { ReactNode } from 'react';

export interface PropRow {
  name: string;
  type: string;
  /** Omit for a required prop. */
  default?: string;
  description: ReactNode;
}

export interface PropsTableProps {
  rows: PropRow[];
  /** Names the table for screen readers, e.g. "Button props". */
  label: string;
}

export function PropsTable({ rows, label }: PropsTableProps) {
  return (
    <div className="props" role="region" aria-label={label} tabIndex={0}>
      <table className="props__table">
        <caption className="visually-hidden">{label}</caption>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code className="props__name">{row.name}</code>
              </th>
              <td>
                <code className="props__type">{row.type}</code>
              </td>
              <td>
                {row.default ? (
                  <code className="props__default">{row.default}</code>
                ) : (
                  <span className="props__required">required</span>
                )}
              </td>
              <td className="props__desc">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
