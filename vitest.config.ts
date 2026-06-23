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
            provider: 'v8',
            reporter: ['text', 'lcov'],
            reportsDirectory: './coverage',
            all: true,
            exclude: [
                'src/setupTests.ts',
                'src/reportWebVitals.ts',
                'src/main.tsx',
                'src/index.tsx',
                'src/**/*.d.ts',
                'src/types/**',
                'src/assets/**'
            ]
        },
    },
});