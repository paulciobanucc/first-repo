import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#122117",
        pine: "#183d2c",
        mint: "#d8f3dc",
        sand: "#f7e6c7",
        coral: "#ff7f51",
        ocean: "#1f7a8c",
      },
      boxShadow: {
        deal: "0 20px 50px rgba(18, 33, 23, 0.12)",
      },
      fontFamily: {
        display: ["Bahnschrift", "Aptos Display", "Trebuchet MS", "sans-serif"],
        body: ["Aptos", "Segoe UI Variable", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

