/**
 * Dev-only warnings.
 *
 * Guarded by `process.env.NODE_ENV`, which every bundler replaces with a
 * literal, so the calls and their message strings drop out of a production
 * build entirely. `import.meta.env.DEV` would be the Vite-native choice, but it
 * survives into the published bundle and then throws for consumers whose
 * bundler does not define it.
 *
 * `process` is declared here rather than by pulling in `@types/node`, which
 * would put the whole Node global surface in scope for a browser library.
 */
declare const process: { env: Record<string, string | undefined> } | undefined;

const seen = new Set<string>();

export function devWarn(condition: boolean, message: string): void {
  if (typeof process !== 'undefined' && process.env['NODE_ENV'] === 'production') {
    return;
  }
  if (!condition) return;
  // Most of these fire from an effect that reruns on every render of the
  // offending component, and a warning repeated a thousand times buries the
  // rest of the console.
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(`[liquidglass-web] ${message}`);
}
