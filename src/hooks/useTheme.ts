// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import type { Theme } from '../types';

const defaultTheme: Theme = {
    logo: '', // Will default to the SVG logo if empty
    primaryColor: '#a3e635',
    backgroundColor: '#111827',
    fontFamily: "'Barlow', sans-serif",
    headingFontFamily: "'Teko', sans-serif",
    baseFontSize: '16px',
};

const THEME_STORAGE_KEY = 'bci-app-theme';

export const useTheme = () => {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        try {
            const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            return storedTheme ? JSON.parse(storedTheme) : defaultTheme;
        } catch (error) {
            console.error('Failed to parse theme from localStorage', error);
            return defaultTheme;
        }
    });

    const applyTheme = React.useCallback((themeToApply: Theme) => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', themeToApply.primaryColor);
        root.style.setProperty('--background-color', themeToApply.backgroundColor);
        root.style.setProperty('--font-family', themeToApply.fontFamily);
        root.style.setProperty('--heading-font-family', themeToApply.headingFontFamily);
        root.style.setProperty('--base-font-size', themeToApply.baseFontSize);
    }, []);

    React.useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);

    const setTheme = (newTheme: Partial<Theme>) => {
        setThemeState(prevTheme => {
            const updatedTheme = { ...prevTheme, ...newTheme };
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updatedTheme));
            return updatedTheme;
        });
    };
    
    const resetTheme = () => {
        localStorage.removeItem(THEME_STORAGE_KEY);
        setThemeState(defaultTheme);
    };

    return { theme, setTheme, resetTheme };
};