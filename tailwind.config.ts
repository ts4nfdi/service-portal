import type {Config} from "tailwindcss";
import forms from '@tailwindcss/forms';
import flowbite from 'flowbite/plugin';

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx,css}",
        "./components/**/*.{js,ts,jsx,tsx,mdx,css}",
        "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
        "./node_modules/flowbite/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                'ts4nfdi-brand-color': "rgb(69,84,107)"
            },
        },
        screens: {
            sm: '1025px',
            md: '1025px',
            lg: '1280px',
            xl: '1536px',
        }
    },
    plugins: [
        forms,
        flowbite
    ],
} satisfies Config;
