import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        // Check local storage or default to light theme
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme === 'dark' ? 'dark' : 'light';
    });

    const [textSize, setTextSize] = useState<number>(() => {
        // Check local storage or default to 16
        const savedTextSize = localStorage.getItem('app-text-size');
        return savedTextSize ? Number(savedTextSize) : 16;
    });

    // Cycle through themes
    const cycleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('app-theme', newTheme);
    };

    // Update text size and persist to local storage
    const updateTextSize = (size: number) => {
        setTextSize(size);
        localStorage.setItem('app-text-size', size.toString());
        
        // Optional: Apply text size to root element for global scaling
        document.documentElement.style.setProperty('--dynamic-text-size', `${size}px`);
    };

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return {
        theme, 
        cycleTheme, 
        textSize, 
        setTextSize: updateTextSize
    };
}