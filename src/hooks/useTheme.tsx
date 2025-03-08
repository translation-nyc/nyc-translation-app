import {useEffect, useState} from 'react';

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
        
        // Set the base font size on the html element
        // This will allow everything sized in rem to scale proportionally
        document.documentElement.style.fontSize = `${size}px`;
        
        // Also keep the CSS variable for backward compatibility
        document.documentElement.style.setProperty('--dynamic-text-size', `${size}px`);
        
        // Set a scaling factor for non-text elements
        const scaleFactor = size / 16;
        document.documentElement.style.setProperty('--scale-factor', scaleFactor.toString());
    };

    // Apply theme and initial text size
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        // Ensure text size is applied on initial render
        updateTextSize(textSize);
    }, [theme, textSize]);

    return {
        theme, 
        cycleTheme, 
        textSize, 
        setTextSize: updateTextSize
    };
}
