export default {
  content: [
    "./index.html",
    "./Pages/**/*.{html,js}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
 theme: {
  extend: {
    colors: {
      /* Backgrounds */
      'bg-main': '#0B0E14',
      'bg-surface': '#151A23',

      /* Brand / Accents */
      'accent': '#00F5D4',        // neon mint
      'accent-alt': '#7F5AF0',    // violet
      'danger': '#FF5470',

      /* Text */
      'text-main': '#EAEAEA',
      'text-muted': '#9BA4B5',
    },
  },
},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
