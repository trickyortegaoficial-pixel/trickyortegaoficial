/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        neon: "#39FF14",
        neonPink: "#FF00FF",
        neonBlue: "#00FFFF",
        neonPurple: "#9B30FF",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 8px #39FF14, 0 0 20px #39FF14",
        neonPink: "0 0 8px #FF00FF, 0 0 20px #FF00FF",
        neonBlue: "0 0 8px #00FFFF, 0 0 20px #00FFFF",
        neonPurple: "0 0 8px #9B30FF, 0 0 20px #9B30FF",
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
}