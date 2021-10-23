// TODO: setup optimized build script and configure purge

module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.ts',
    './src/**/*.tsx',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
