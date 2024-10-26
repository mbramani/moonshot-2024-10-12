import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
      colors: {
        "background-accent": "#E54065",
        "background-default": "#F4F5F9",
        "background-read": "#F2F2F2",
        "border-muted": "#CFD2DC",
        "text-default": "#636363",
        "background-filter": "#E1E4EA",
      },
    },
  },
  plugins: [],
};
export default config;
