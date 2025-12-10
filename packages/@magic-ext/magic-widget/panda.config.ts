import { magicPreset } from '@magiclabs/ui-components/presets';
import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,
  // Minify the generated css
  minify: true,
  // Hash all classnames
  hash: true,
  // Clean the output directory before generating the css
  clean: true,

  importMap: '@styled',

  // Where to look for your css declarations
  include: [
    './node_modules/@magiclabs/ui-components/dist/panda.buildinfo.json',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  // Files to exclude
  exclude: [],

  // Styling conditions / modes
  conditions: {
    light: '[data-color-mode=light] &',
    dark: '[data-color-mode=dark] &',
  },

  presets: ['@pandacss/dev/presets', magicPreset],

  // Useful for theme customization
  theme: {
    extend: {},
  },

  // The output directory for your css system
  outdir: 'styled-system',

  // Output extension impacting build
  outExtension: 'js',

  // The JSX framework to use
  jsxFramework: 'react',

  globalCss: {
    html: {
      '--primary': 'black',
    },
  },
});

