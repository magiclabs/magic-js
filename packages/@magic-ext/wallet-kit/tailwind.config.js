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
  // Tailwind's default extractor treats `"` as a candidate boundary, so any
  // arbitrary-value utility containing quotes (e.g. `before:content-[""]`
  // used in @magiclabs/ui-components button recipe) gets dropped. Safelist
  // these explicitly so the rules ship in the bundle.
  safelist: ['before:content-[""]'],
};
