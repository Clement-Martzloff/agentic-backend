import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // ... other test options
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
