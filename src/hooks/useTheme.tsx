import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		return (localStorage.getItem("theme") as Theme) || "light"; // Default to light
	});

	const [textSize, setTextSize] = useState<number>(() => {
		const savedSize = localStorage.getItem("textSize");
		return savedSize ? Number(savedSize) : 14; // Default to 14px
	});

	// Handle theme changes
	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			root.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [theme]);

	// Handle text size changes
	useEffect(() => {
		document.documentElement.style.fontSize = `${textSize}px`;
		localStorage.setItem("textSize", textSize.toString());
	}, [textSize]);

	const cycleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return { theme, cycleTheme, textSize, setTextSize };
}