/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090B12",
        panel: "#151A27",
        card: "#191E2B",
        mangaRed: "#E94350",
        flare: "#E94350",
        paper: "#F1EDE7",
        muted: "#A5A7B0",
        gold: "#F3B65B",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
