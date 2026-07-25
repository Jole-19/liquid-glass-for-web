/**
 * A very small syntax highlighter.
 *
 * Written rather than installed because Shiki and Prism are each larger than
 * the library this site documents, and the site would be embarrassing if its
 * own bundle were dominated by a dependency used to render twenty snippets.
 *
 * It is a single-pass scanner, not a stack of regex replacements. Chained
 * replacements are the usual approach and they break the moment a keyword
 * appears inside a string or a comment contains a quote -- which, in a page
 * full of prose-heavy code comments, is immediately.
 *
 * It is not a parser and does not try to be. It knows about comments, strings,
 * numbers, keywords, JSX tags, attributes and punctuation, which is everything
 * that carries meaning at a glance in a documentation snippet.
 */

export type TokenType =
  | 'plain'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'tag'
  | 'attr'
  | 'punctuation'
  | 'function';

export interface Token {
  type: TokenType;
  value: string;
}

export type Language = 'tsx' | 'css' | 'shell';

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'var', 'function',
  'return', 'if', 'else', 'for', 'while', 'new', 'await', 'async', 'class',
  'extends', 'interface', 'type', 'typeof', 'as', 'in', 'of', 'true', 'false',
  'null', 'undefined', 'this', 'void', 'throw', 'try', 'catch', 'finally',
  'switch', 'case', 'break', 'continue', 'do', 'delete', 'instanceof', 'yield',
]);

const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[A-Za-z0-9_$-]/;

function isIdentStart(ch: string): boolean {
  return IDENT_START.test(ch);
}

function push(tokens: Token[], type: TokenType, value: string): void {
  if (!value) return;
  const last = tokens[tokens.length - 1];
  // Coalescing runs of the same type keeps the DOM to a few dozen spans per
  // block rather than one per character.
  if (last && last.type === type) last.value += value;
  else tokens.push({ type, value });
}

function tokenizeCode(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  // Tracks whether we are inside a JSX tag, so `radius=` reads as an attribute
  // rather than as a bare identifier.
  let inTag = false;

  while (i < source.length) {
    const ch = source[i] as string;
    const next = source[i + 1];

    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i);
      const stop = end === -1 ? source.length : end;
      push(tokens, 'comment', source.slice(i, stop));
      i = stop;
      continue;
    }

    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      push(tokens, 'comment', source.slice(i, stop));
      i = stop;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2;
          continue;
        }
        if (source[j] === ch) {
          j += 1;
          break;
        }
        j += 1;
      }
      push(tokens, 'string', source.slice(i, j));
      i = j;
      continue;
    }

    if (ch === '<' && next !== undefined && /[A-Za-z/]/.test(next)) {
      inTag = true;
      let j = i + 1;
      if (source[j] === '/') j += 1;
      while (j < source.length && IDENT_PART.test(source[j] as string)) j += 1;
      // Includes the angle bracket in the tag token; a lone `<` coloured as
      // punctuation next to a coloured name looks like a mistake.
      push(tokens, 'tag', source.slice(i, j));
      i = j;
      continue;
    }

    if (inTag && (ch === '>' || (ch === '/' && next === '>'))) {
      const value = ch === '/' ? '/>' : '>';
      push(tokens, 'tag', value);
      inTag = false;
      i += value.length;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9._a-z%]/.test(source[j] as string)) j += 1;
      push(tokens, 'number', source.slice(i, j));
      i = j;
      continue;
    }

    if (isIdentStart(ch)) {
      let j = i;
      while (j < source.length && IDENT_PART.test(source[j] as string)) j += 1;
      const word = source.slice(i, j);

      // Look ahead past spaces for the character that decides what this is.
      let k = j;
      while (k < source.length && source[k] === ' ') k += 1;
      const following = source[k];

      if (KEYWORDS.has(word)) push(tokens, 'keyword', word);
      else if (inTag && following === '=') push(tokens, 'attr', word);
      else if (inTag) push(tokens, 'attr', word);
      else if (following === '(') push(tokens, 'function', word);
      else if (/^[A-Z]/.test(word)) push(tokens, 'tag', word);
      else push(tokens, 'plain', word);

      i = j;
      continue;
    }

    if (/[{}()[\];:,.=<>!&|?+\-*/%]/.test(ch)) {
      push(tokens, 'punctuation', ch);
      i += 1;
      continue;
    }

    push(tokens, 'plain', ch);
    i += 1;
  }

  return tokens;
}

function tokenizeCss(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i] as string;

    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end === -1 ? source.length : end + 2;
      push(tokens, 'comment', source.slice(i, stop));
      i = stop;
      continue;
    }

    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < source.length && source[j] !== ch) j += 1;
      push(tokens, 'string', source.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // Custom properties are the whole point of this library's CSS, so they get
    // their own colour rather than blending into the property names.
    if (ch === '-' && source[i + 1] === '-') {
      let j = i;
      while (j < source.length && IDENT_PART.test(source[j] as string)) j += 1;
      push(tokens, 'attr', source.slice(i, j));
      i = j;
      continue;
    }

    if (isIdentStart(ch) || ch === '.' || ch === '#' || ch === '@') {
      let j = i + 1;
      while (j < source.length && IDENT_PART.test(source[j] as string)) j += 1;
      const word = source.slice(i, j);
      if (ch === '@') push(tokens, 'keyword', word);
      else if (ch === '.' || ch === '#') push(tokens, 'tag', word);
      else push(tokens, 'plain', word);
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < source.length && /[0-9.a-z%]/.test(source[j] as string)) j += 1;
      push(tokens, 'number', source.slice(i, j));
      i = j;
      continue;
    }

    if (/[{}();:,]/.test(ch)) {
      push(tokens, 'punctuation', ch);
      i += 1;
      continue;
    }

    push(tokens, 'plain', ch);
    i += 1;
  }

  return tokens;
}

function tokenizeShell(source: string): Token[] {
  const tokens: Token[] = [];
  for (const line of source.split('\n')) {
    if (tokens.length) push(tokens, 'plain', '\n');
    if (line.trimStart().startsWith('#')) {
      push(tokens, 'comment', line);
      continue;
    }
    const [command, ...rest] = line.split(' ');
    push(tokens, 'function', command ?? '');
    if (rest.length) push(tokens, 'plain', ` ${rest.join(' ')}`);
  }
  return tokens;
}

export function highlight(source: string, language: Language): Token[] {
  if (language === 'css') return tokenizeCss(source);
  if (language === 'shell') return tokenizeShell(source);
  return tokenizeCode(source);
}
