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

// Read the CSS to inject
let cssContent = '';
try {
  cssContent = readFileSync('./dist/styles.css', 'utf-8');
  // Escape for JS string
  cssContent = cssContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
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
