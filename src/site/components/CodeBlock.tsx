import { useCallback, useMemo, useState } from 'react';
import { highlight } from '../lib/highlight';
import type { Language } from '../lib/highlight';

export interface CodeBlockProps {
  code: string;
  language?: Language;
  /** Shown in the block's header strip. Usually a file path. */
  filename?: string;
  /** Caps the height and lets the block scroll, for long listings. */
  maxHeight?: number;
}

export function CodeBlock({
  code,
  language = 'tsx',
  filename,
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const source = code.trim();
  const tokens = useMemo(() => highlight(source, language), [source, language]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is unavailable over plain HTTP and in some embedded views.
      // The code is selectable either way, so there is nothing to recover from.
    }
  }, [source]);

  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__name">{filename ?? language}</span>
        <button
          type="button"
          className="code__copy lg-focusable"
          onClick={copy}
          // The label changes rather than only the icon, so the confirmation is
          // announced instead of being purely visual.
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="code__pre"
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        <code>
          {tokens.map((token, index) => (
            <span key={index} className={`tk tk--${token.type}`}>
              {token.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
