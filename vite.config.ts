import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
});
