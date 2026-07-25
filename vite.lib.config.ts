/**
 * Library build -- `pnpm build:lib`.
 *
 * React is external so consumers dedupe on their own copy; bundling it would
 * give them two Reacts and break hooks. CSS is emitted as a single file the
 * consumer imports separately (`liquid-glass-react/styles.css`) rather than
 * being injected by JS, so they control where it lands in their cascade.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    // `insertTypesEntry` emits a dist/index.d.ts that re-exports the per-file
    // declarations, which is all package.json `types` needs. The alternative,
    // `bundleTypes`, flattens everything into one file but pulls in
    // @microsoft/api-extractor, which pins the TypeScript versions it supports
    // and does not yet know about TS 7.
    dts({ include: ['src/lib'], insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'LiquidGlass',
      formats: ['es', 'cjs'],
      fileName: (format) => `liquid-glass.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        // Optional peer dependency, reached only through a dynamic import in
        // the WebGL tier. Bundling it would put ~100 kB of shader code into
        // the main entry for every consumer, including the majority who never
        // touch Tier 2.
        '@ybouane/liquidglass',
      ],
      output: {
        assetFileNames: 'liquid-glass.[ext]',
      },
    },
    // One stylesheet instead of a chunk per component, so consumers have a
    // single import and a predictable cascade order.
    cssCodeSplit: false,
    sourcemap: true,
  },
});
