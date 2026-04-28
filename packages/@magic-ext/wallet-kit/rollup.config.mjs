/* eslint-env node */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

// Ensure dist directory exists
if (!existsSync('./dist')) {
  mkdirSync('./dist', { recursive: true });
}

// Generate CSS with Tailwind, scanning both src and @magiclabs/ui-components dist
try {
  execSync('./node_modules/.bin/tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify', { stdio: 'inherit' });
} catch {
  // CSS generation failed, using existing CSS
}

// Extract CSS variable rules (`:root`, `[data-color-mode=light/dark]`) from
// @magiclabs/ui-components — these define the theme tokens our utilities use,
// and the Tailwind preset doesn't inject them on its own.
function extractVariableRules(css) {
  let out = '';
  let depth = 0;
  let start = 0;
  let selectorEnd = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      if (depth === 0) selectorEnd = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const selector = css.slice(start, selectorEnd).trim();
        const body = css.slice(selectorEnd + 1, i);
        const isThemeSelector =
          (selector.includes(':root') || /\[data-color-mode=(light|dark)\]\s*$/.test(selector) || /^\[data-color-mode=(light|dark)\]$/.test(selector)) &&
          !selector.includes('[data-color-mode=dark] *') &&
          !selector.includes('[data-color-mode=dark],[data-color-mode=dark] *');
        if (isThemeSelector && body.includes('--color-')) {
          out += `${selector}{${body}}`;
        }
        start = i + 1;
      }
    }
  }
  return out;
}

let cssContent = '';
try {
  const ourCss = readFileSync('./dist/styles.css', 'utf-8');
  let themeVars = '';
  try {
    const uiCss = readFileSync('./node_modules/@magiclabs/ui-components/dist/styles.css', 'utf-8');
    themeVars = extractVariableRules(uiCss);
  } catch {
    // ui-components styles.css missing — theme vars won't be inlined
  }
  cssContent = themeVars + ourCss;
  // Don't pre-escape backslashes — the replace() plugin runs JSON.stringify
  // on this value, and double-escaping breaks every Tailwind selector with
  // `\:` / `\[` / `\]` (the rule silently drops at parse time).
} catch {
  // Could not read CSS file
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// External dependencies - not bundled by us, resolved by consumer's bundler
const external = id => {
  if (
    id === 'react' ||
    id === 'react-dom' ||
    id === 'react-dom/client' ||
    id === 'react/jsx-runtime' ||
    id === '@magic-sdk/provider' ||
    id === 'wagmi' ||
    id.startsWith('wagmi/') ||
    id === 'viem' ||
    id === '@wagmi/core' ||
    id === '@tanstack/react-query' ||
    id === '@reown/appkit' ||
    id === '@reown/appkit/networks' ||
    id === '@reown/appkit-adapter-wagmi' ||
    id === '@walletconnect/ethereum-provider' ||
    id.startsWith('@walletconnect/')
  ) {
    return true;
  }
  return false;
};

const plugins = [
  replace({
    preventAssignment: true,
    values: {
      MAGIC_WIDGET_CSS: JSON.stringify(cssContent),
    },
  }),
  resolve({
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
  }),
  commonjs({
    transformMixedEsModules: true,
  }),
  typescript({
    tsconfig: './tsconfig.json',
  }),
  terser(),
];

export default {
  input: 'src/index.ts',
  output: {
    file: pkg.module,
    format: 'esm',
    sourcemap: false,
    inlineDynamicImports: true,
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
  },
};
