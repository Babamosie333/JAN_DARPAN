import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7F8F6",
        "bg-raised": "#FFFFFF",
        ink: "#17211B",
        "ink-soft": "#4C5750",
        "ink-faint": "#8A938C",
        line: "#E4E7E1",
        "line-soft": "#ECEEEA",

        saffron: "#F28C28",
        "saffron-ink": "#8a4c0e",
        "saffron-tint": "#FDF0DF",

        green: "#138A4B",
        "green-ink": "#0d5c33",
        "green-tint": "#E4F3EA",

        red: "#D94A4A",
        "red-tint": "#FBE7E7",

        orange: "#E89A3C",
        "orange-tint": "#FCF0DF",

        blue: "#3478C8",
        "blue-tint": "#E7F0FB",
      },
      fontFamily: {
        display: ["Manrope", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(23,33,27,0.06), 0 1px 1px rgba(23,33,27,0.04)",
        md: "0 8px 24px rgba(23,33,27,0.08), 0 2px 6px rgba(23,33,27,0.04)",
        lg: "0 20px 48px rgba(23,33,27,0.14), 0 4px 12px rgba(23,33,27,0.06)",
      },
      transitionTimingFunction: {
        civic: "cubic-bezier(.22,.61,.36,1)",
      },
    },
  },
  plugins: [],
};
export default config;
