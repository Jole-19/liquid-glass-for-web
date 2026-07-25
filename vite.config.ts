/**
 * Config for the documentation site -- `pnpm dev` and `pnpm build`.
 *
 * The library itself is built by vite.lib.config.ts. Two configs rather than one
 * with modes, because the two builds want genuinely different outputs: the site
 * is an app with hashed assets, the library is externalized ESM plus types.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Kept out of `dist`, which belongs to the library build.
    outDir: 'dist-site',
  },
});
