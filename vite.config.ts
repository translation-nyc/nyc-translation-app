import {defineConfig, UserConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    define: {
        global: {},
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./tests/setup.ts",
    },
} as UserConfig);
