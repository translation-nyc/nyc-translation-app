import {useEffect, useState} from "react";

// Type for available themes
export type ThemeName = "system" | "light" | "dark" | "cupcake" | "cyberpunk" | "corporate" | "forest" | "aqua";

function isDarkMode(): boolean {
    return matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
    const [theme, setThemeState] = useState<ThemeName>(() => {
        // Check local storage or default to light theme
        const savedTheme = localStorage.getItem("app-theme") as ThemeName | null;
        return savedTheme || "system";
    });

    const [textSize, setTextSize] = useState<number>(() => {
        // Check local storage or default to 16
        const savedTextSize = localStorage.getItem("app-text-size");
        return savedTextSize ? Number(savedTextSize) : 16;
    });

    // Set theme and persist to local storage
    function setTheme(newTheme: ThemeName) {
        setThemeState(newTheme);
        localStorage.setItem("app-theme", newTheme);
    }

    // Update text size and persist to local storage
    function updateTextSize(size: number) {
        setTextSize(size);
        localStorage.setItem("app-text-size", size.toString());
        
        // Set the base font size on the html element
        document.documentElement.style.fontSize = `${size}px`;
        
        // Set a scaling factor for non-text elements
        const scaleFactor = size / 16;
        document.documentElement.style.setProperty("--scale-factor", scaleFactor.toString());
    }

    // Apply theme and initial text size
    useEffect(() => {
        let newTheme: ThemeName;
        if (theme === "system") {
            newTheme = isDarkMode() ? "dark" : "light";
        } else {
            newTheme = theme;
        }
        document.documentElement.setAttribute("data-theme", newTheme);

        function updateSystemTheme(event: MediaQueryListEvent) {
            if (theme === "system") {
                const newTheme = event.matches ? "dark" : "light";
                document.documentElement.setAttribute("data-theme", newTheme);
            }
        }

        if (matchMedia) {
            const darkModeMatchMedia = matchMedia("(prefers-color-scheme: dark)");
            darkModeMatchMedia.addEventListener("change", updateSystemTheme);
            return () => darkModeMatchMedia.removeEventListener("change", updateSystemTheme);
        }
    }, [theme]);

    useEffect(() => updateTextSize(textSize), [textSize]);

    return {
        theme,
        setTheme,
        textSize,
        setTextSize: updateTextSize
    };
}
