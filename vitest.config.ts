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
            provider: 'v8',                     // Required: Tells Vitest which engine to use
            reporter: ['text', 'lcov'],         // 'lcov' is for Sonar, 'text' shows it in the console
            reportsDirectory: './coverage',
            all: true                           // Highly recommended: Includes untested files in the report
        },
    },
});