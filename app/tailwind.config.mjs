// tailwind.config.mjs
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",      // if using Next.js 13
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",    // add this so Tailwind sees your modal
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
