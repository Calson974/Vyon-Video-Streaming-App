export default {
  content: [
    "./index.html",
    "./Pages/**/*.{html,js}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-obsidian': '#121212',
        'electric-mint': '#00F5D4',
        'cyber-violet': '#7F5AF0',
        'radical-red': '#FF2E63',
        'cool-grey': '#94A1B2',
        'crisp-white': '#FFFFFF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
