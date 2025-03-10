import {useEffect, useState} from 'react';

// Type for available themes
type ThemeName = 'light' | 'dark' | 'cupcake' | 'cyberpunk' | 'corporate' | 'forest' | 'aqua';

export function useTheme() {
    const [theme, setThemeState] = useState<ThemeName>(() => {
        // Check local storage or default to light theme
        const savedTheme = localStorage.getItem('app-theme');
        return (savedTheme as ThemeName) || 'light';
    });

    const [textSize, setTextSize] = useState<number>(() => {
        // Check local storage or default to 16
        const savedTextSize = localStorage.getItem('app-text-size');
        return savedTextSize ? Number(savedTextSize) : 16;
    });

    // Set theme and persist to local storage
    const setTheme = (newTheme: string) => {
        setThemeState(newTheme as ThemeName);
        localStorage.setItem('app-theme', newTheme);
    };

    // Update text size and persist to local storage
    const updateTextSize = (size: number) => {
        setTextSize(size);
        localStorage.setItem('app-text-size', size.toString());
        
        // Set the base font size on the html element
        document.documentElement.style.fontSize = `${size}px`;
        
        // Also keep the CSS variable for backward compatibility
        document.documentElement.style.setProperty('--dynamic-text-size', `${size}px`);
        
        // Set a scaling factor for non-text elements
        const scaleFactor = size / 16;
        document.documentElement.style.setProperty('--scale-factor', scaleFactor.toString());
    };

    // Apply theme and initial text size
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        updateTextSize(textSize);
    }, [theme, textSize]);

    return {
        theme, 
        setTheme,
        textSize, 
        setTextSize: updateTextSize
    };
}