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

