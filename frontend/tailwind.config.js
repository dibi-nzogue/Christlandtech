/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: {
    backgroundImage: {
      'hero-service': "url('./src/assets/images/hero3.png')",
      'hero-about': "url('./src/assets/images/hero5.png')",
    },
    
  } },
  plugins: [],
}

// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        loaderSlide: {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(40%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        loaderSlide: "loaderSlide 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
