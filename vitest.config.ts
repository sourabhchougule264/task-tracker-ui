import { defineConfig } from 'vitest/config';
// @ts-ignore
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        css: true,
        coverage: {
            reporter: ['text', 'lcov'], // 'lcov' is the one SonarCloud needs
            reportsDirectory: './coverage'
        },
    },
});