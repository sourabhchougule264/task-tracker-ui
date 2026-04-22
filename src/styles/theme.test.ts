import { describe, it, expect } from 'vitest';
import { lightTheme, darkTheme } from './theme';

describe('Theme Configuration', () => {

    describe('Light Theme', () => {
        it('should have the correct palette mode', () => {
            expect(lightTheme.palette.mode).toBe('light');
        });

        it('should have the correct primary colors', () => {
            expect(lightTheme.palette.primary.main).toBe('#6366f1');
            expect(lightTheme.palette.primary.contrastText).toBe('#ffffff');
        });

        it('should have the correct background colors', () => {
            expect(lightTheme.palette.background.default).toBe('#f8fafc');
            expect(lightTheme.palette.background.paper).toBe('#ffffff');
        });

        it('should apply the correct border radius to the shape', () => {
            expect(lightTheme.shape.borderRadius).toBe(12);
        });
    });

    describe('Dark Theme', () => {
        it('should have the correct palette mode', () => {
            expect(darkTheme.palette.mode).toBe('dark');
        });

        it('should have the correct dark primary color', () => {
            expect(darkTheme.palette.primary.main).toBe('#818cf8');
        });

        it('should have the correct dark background colors', () => {
            expect(darkTheme.palette.background.default).toBe('#0f172a');
            expect(darkTheme.palette.background.paper).toBe('#1e293b');
        });
    });

    describe('Typography', () => {
        it('should have the correct font family string', () => {
            expect(lightTheme.typography.fontFamily).toContain('Roboto');
            expect(lightTheme.typography.fontFamily).toContain('Arial');
        });

        it('should have configured h1 styles correctly', () => {
            expect(lightTheme.typography.h1.fontSize).toBe('2.5rem');
            expect(lightTheme.typography.h1.fontWeight).toBe(700);
        });

        it('should disable uppercase for buttons', () => {
            expect(lightTheme.typography.button.textTransform).toBe('none');
        });
    });

    describe('Component Style Overrides', () => {
        it('should have specific MuiButton overrides', () => {
            const buttonOverrides = lightTheme.components?.MuiButton?.styleOverrides?.root;
            // We check if the overrides exist. Using any because styleOverrides
            // can be complex objects or functions in MUI types
            expect((buttonOverrides as any).borderRadius).toBe(8);
            expect((buttonOverrides as any).padding).toBe('10px 20px');
        });

        it('should have specific MuiCard overrides', () => {
            const cardOverrides = lightTheme.components?.MuiCard?.styleOverrides?.root;
            expect((cardOverrides as any).borderRadius).toBe(16);
        });

        it('should have specific MuiTextField overrides', () => {
            // Accessing nested style overrides for TextField
            const textFieldOverrides = lightTheme.components?.MuiTextField?.styleOverrides?.root;
            expect(textFieldOverrides).toBeDefined();
        });
    });

    describe('Shadows', () => {
        it('should have the custom shadow array initialized', () => {
            expect(lightTheme.shadows).toHaveLength(25); // MUI expects 25 shadow levels
            expect(lightTheme.shadows[0]).toBe('none');
            expect(lightTheme.shadows[1]).toBe('0px 2px 4px rgba(0,0,0,0.05)');
        });
    });
});