/* eslint-env node */
/* global process */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve as pathResolve, join } from 'path';
import { execSync } from 'child_process';

// Ensure dist directory exists
if (!existsSync('./dist')) {
  mkdirSync('./dist', { recursive: true });
}

// Generate CSS first
try {
  execSync('./node_modules/.bin/panda cssgen --outfile dist/styles.css', { stdio: 'inherit' });
} catch {
  // CSS generation failed, using existing CSS
}

// Read the CSS to inject
let cssContent = '';
try {
  cssContent = readFileSync('./dist/styles.css', 'utf-8');

  // CRITICAL: Remove @layer wrappers - they lower specificity and lose to Tailwind's preflight
  function stripLayers(css) {
    // Remove @layer declarations like "@layer reset, base, tokens;"
    css = css.replace(/@layer\s+[\w\s,]+;/g, '');

    // Find and unwrap @layer blocks
    let result = '';
    let i = 0;
    while (i < css.length) {
      // Check for @layer
      if (css.slice(i, i + 6) === '@layer') {
        // Skip past @layer and optional name until {
        let j = i + 6;
        while (j < css.length && css[j] !== '{') j++;
        if (j < css.length) {
          j++; // skip the {
          // Now find the matching }
          let braceCount = 1;
          let start = j;
          while (j < css.length && braceCount > 0) {
            if (css[j] === '{') braceCount++;
            else if (css[j] === '}') braceCount--;
            j++;
          }
          // Extract content without the outer braces
          result += css.slice(start, j - 1);
          i = j;
        } else {
          result += css[i];
          i++;
        }
      } else {
        result += css[i];
        i++;
      }
    }
    return result;
  }

  // Strip layers multiple times to handle nesting
  cssContent = stripLayers(cssContent);
  cssContent = stripLayers(cssContent);
  cssContent = stripLayers(cssContent);

  // Escape for JS string
  cssContent = cssContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
} catch {
  // Could not read CSS file
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// External dependencies - not bundled by us, resolved by consumer's bundler
const external = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  '@magic-sdk/provider',
  // Wagmi stack - too complex to bundle, consumer's bundler handles it
  'wagmi',
  'viem',
  '@wagmi/core',
  '@tanstack/react-query',
  '@reown/appkit',
  '@reown/appkit/networks',
  '@reown/appkit-adapter-wagmi',
];

// Alias for @styled/* paths
const aliasPlugin = {
  name: 'styled-alias',
  resolveId(source) {
    if (source.startsWith('@styled/')) {
      // Convert @styled/css -> styled-system/css
      // Convert @styled/css/cx -> styled-system/css/cx
      const relativePath = source.replace('@styled/', 'styled-system/');
      const absolutePath = pathResolve(process.cwd(), relativePath);

      // Try with .js extension
      if (existsSync(absolutePath + '.js')) {
        return absolutePath + '.js';
      }

      // Try as directory with index.js
      if (existsSync(join(absolutePath, 'index.js'))) {
        return join(absolutePath, 'index.js');
      }

      // Return as-is and let resolve plugin handle it
      return absolutePath;
    }
    return null;
  },
};

const plugins = [
  aliasPlugin,
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
    declaration: false,
  }),
];

export default [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    external,
    plugins,
    onwarn(warning, warn) {
      // Suppress circular dependency warnings from third-party libs
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      // Suppress "this" rewrite warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning);
    },
  },
  // CJS build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    external,
    plugins: [
      aliasPlugin,
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
        declaration: true,
        declarationDir: './dist/types',
      }),
    ],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      warn(warning);
    },
  },
];
