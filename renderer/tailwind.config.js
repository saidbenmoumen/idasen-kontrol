module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
    "./renderer/layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
        '32': 'repeat(32, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
};
