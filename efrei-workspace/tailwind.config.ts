import type { Config } from "tailwindcss";

const config: Config = {
    // Although Tailwind v4 is mainly configured in CSS, 
    // we provide this config to satisfy the explicit requirement 
    // for the "class" dark mode strategy.
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};

export default config;
