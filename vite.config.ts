import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import {gzipSync} from 'node:zlib';

const INITIAL_BUNDLE_GZIP_BUDGET_BYTES = 560 * 1024;

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/.private-worktrees/**', '.private-worktrees/**'],
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['.private-worktrees/**', 'node_modules/**'],
    globals: true,
  },
  plugins: [
    react(),
    {
      name: 'initial-bundle-budget',
      generateBundle(_, bundle) {
        const entries = Object.values(bundle).filter((asset) => asset.type === 'chunk' && asset.isEntry);
        const entry = entries.sort((left, right) => (right.type === 'chunk' ? right.code.length : 0) - (left.type === 'chunk' ? left.code.length : 0))[0];
        if (!entry || entry.type !== 'chunk') return;
        const compressedBytes = gzipSync(entry.code).byteLength;
        if (compressedBytes > INITIAL_BUNDLE_GZIP_BUDGET_BYTES) {
          this.error(`Initial bundle is ${formatKiB(compressedBytes)} KiB gzip; budget is ${formatKiB(INITIAL_BUNDLE_GZIP_BUDGET_BYTES)} KiB.`);
        }
      },
    },
  ],
});

function formatKiB(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}
