/** @type {import('tailwindcss').Config} */
import preset from '@magiclabs/ui-components/tailwind-preset';

export default {
  presets: [preset],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@magiclabs/ui-components/dist/es/**/*.js',
  ],
  important: '#magic-widget-container',
  corePlugins: {
    preflight: false,
  },
  darkMode: ['selector', '[data-color-mode=dark]'],
};
