/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.ejs"],
  theme: {
    screens : {
      showingAside: {max : '580px'}
    },
    extend: {},
  },
  plugins: [],
}

