import { build as esbuild, Platform, Plugin, Format } from 'esbuild';
import path from 'path';
import fse from 'fs-extra';
import gzipSize from 'gzip-size';
import brotliSize from 'brotli-size';
import prettyBytes from 'pretty-bytes';
import execa from 'execa';
import chalk from 'chalk';
import { environment } from './environment';
import { existsAsync } from './exists-async';

interface ESBuildOptions {
  watch?: boolean;
  target?: Platform;
  format?: Format;
  output?: string;
  sourcemap?: boolean;
  name?: string;
  globals?: Record<string, string>;
  externals?: string[];
  aliases?: Record<string, string>;
}

export async function build(options: ESBuildOptions) {
  if (options.output) {
    try {
      await esbuild({
        bundle: true,
        minify: true,
        legalComments: 'none',
        // Use 'neutral' for ESM to avoid CJS require shim issues
        platform: options.format === 'esm' ? 'neutral' : (options.target ?? 'browser'),
        format: options.format ?? 'cjs',
        globalName: options.format === 'iife' ? options.name : undefined,
        entryPoints: [await getEntrypoint(options.format)],
        sourcemap: options.sourcemap,
        outfile: options.output,
        tsconfig: 'node_modules/.temp/tsconfig.build.json',
        external: options.externals,
        loader: { '.ts': 'ts', '.tsx': 'tsx' },
        // Prefer ESM versions of dependencies to avoid CJS require() issues
        mainFields: ['module', 'main'],
        define: Object.fromEntries(
          Object.entries(environment).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
        ),
        plugins: [
          ...globalsPlugin(options.globals || {}),
          ...aliasPlugin(options.aliases || {}),
          ...externalEsmPlugin(options.externals || [], options.format),
        ],

        // We need this footer because: https://github.com/evanw/esbuild/issues/1182
        footer:
          options.format === 'iife'
            ? {
                // This snippet replaces `window.{name}` with
                // `window.{name}.default`, with any additional named exports
                // assigned. Finally, it removes `window.{name}.default`.
                js: `if (${options.name} && ${options.name}.default != null) { ${options.name} = Object.assign(${options.name}.default, ${options.name}); delete ${options.name}.default; }`,
              }
            : undefined,
      });
      await printOutputSizeInfo(options);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

/**
 * Prints the size of the output file(s) produced by ESBuild.
 */
async function printOutputSizeInfo(options: ESBuildOptions) {
  if (options.output) {
    // Log the type and size of the output(s)...
    const outputPath = path.resolve(process.cwd(), options.output);
    const sizeInfo = await getSizeInfo((await fse.readFile(outputPath)).toString(), outputPath);
    console.log(chalk`Built {rgb(0,255,255) ${options.format}} to {gray ${path.dirname(options.output)}}`);
    console.log(sizeInfo);
  }
}

/**
 * Emits TypeScript typings for the current package.
 */
export async function emitTypes(watch?: boolean) {
  if (watch) {
    await execa('tsc', ['-w', '-p', 'node_modules/.temp/tsconfig.build.json']);
  } else {
    await execa('tsc', ['-p', 'node_modules/.temp/tsconfig.build.json']);
  }
}

/**
 * Resolves the entrypoint file for ESBuild,
 * based on the format and target platform.
 */
async function getEntrypoint(format?: Format) {
  const findEntrypoint = async (indexTarget?: string) => {
    if (format && (await existsAsync(path.resolve(process.cwd(), `./src/index.${indexTarget}.ts`)))) {
      return `src/index.${indexTarget}.ts`;
    }

    return 'src/index.ts';
  };

  switch (format) {
    case 'iife':
      return findEntrypoint('cdn');

    case 'esm':
      return findEntrypoint('es');

    case 'cjs':
    default:
      return findEntrypoint(format);
  }
}

/**
 * During the build step, we create an ephemeral "tsconfig.build.json" file
 * containing config overrides to resolve "packages/.../src" as the "rootDir".
 *
 * Why? This is our workaround to avoid tsconfig project references, which make
 * dependency association difficult to maintain in a repo this size. Using this
 * workaround, we can get the same benefits provided by tsconfig project
 * references using `paths` resolutions. However, this doesn't work when
 * actually building the libraries, so this corrects the behavior at build time.
 */
export async function createTemporaryTSConfigFile() {
  const baseTSConfigPath = path.resolve(__dirname, '../../tsconfig.settings.json');
  const tempTSConfigPath = path.join(process.cwd(), 'node_modules/.temp/tsconfig.build.json');
  const relativeBaseUrl = path.relative(path.dirname(tempTSConfigPath), process.cwd());

  const configuration = {
    extends: path.relative(path.dirname(tempTSConfigPath), baseTSConfigPath),
    compilerOptions: {
      rootDir: path.join(relativeBaseUrl, 'src'),
      noEmit: false,
      emitDeclarationOnly: true,
      baseUrl: undefined,
      declarationDir: path.join(relativeBaseUrl, 'dist/types'),
      // Discard what's configured for "paths" inside the root
      // "tsconfig.settings.json" file.
      paths: {},
    },
    include: [
      path.join(relativeBaseUrl, 'src/**/*.ts'),
      path.join(relativeBaseUrl, 'src/**/*.tsx'),
      path.join(relativeBaseUrl, 'src/**/*.js'),
    ],
  };

  await fse.ensureDir(path.dirname(tempTSConfigPath));
  await fse.writeJSON(tempTSConfigPath, configuration, { encoding: 'utf8' });
}

/**
 * Creates a list of plugins to replace
 * externalized packages with a global variable.
 */
function globalsPlugin(globals: Record<string, string>): Plugin[] {
  return Object.entries(globals).map(([packageName, globalVar]) => {
    const namespace = `globals-plugin:${packageName}`;
    return {
      name: namespace,
      setup(builder) {
        builder.onResolve({ filter: new RegExp(`^${packageName}$`) }, args => ({
          path: args.path,
          namespace,
        }));

        builder.onLoad({ filter: /.*/, namespace }, () => {
          const contents = `module.exports = ${globalVar}`;
          return { contents };
        });
      },
    };
  });
}

/**
 * Creates a plugin to resolve path aliases.
 * This is used to resolve @styled/* imports to styled-system/* paths.
 */
function aliasPlugin(aliases: Record<string, string>): Plugin[] {
  if (Object.keys(aliases).length === 0) return [];

  return [
    {
      name: 'alias-plugin',
      setup(builder) {
        // Handle @styled/* imports - match any import starting with @styled/
        builder.onResolve({ filter: /^@styled\// }, args => {
          // Convert @styled/css -> styled-system/css
          // Convert @styled/css/cx -> styled-system/css/cx
          // Convert @styled/jsx/flex -> styled-system/jsx/flex
          const importPath = args.path.replace('@styled/', 'styled-system/');

          // Check if it's a directory import (like @styled/css) or a file import (like @styled/css/cx)
          const fullPath = path.resolve(process.cwd(), importPath);

          // Try to resolve as a file first (with .js extension)
          const asFile = fullPath + '.js';
          if (fse.existsSync(asFile)) {
            return { path: asFile };
          }

          // Try as directory with index.js
          const asIndex = path.join(fullPath, 'index.js');
          if (fse.existsSync(asIndex)) {
            return { path: asIndex };
          }

          // Fallback to the path as-is (let esbuild handle the error)
          return { path: fullPath };
        });
      },
    },
  ];
}

/**
 * Creates a plugin to handle external packages in ESM format.
 * This prevents the "Dynamic require of X is not supported" error
 * by shimming require() calls for external packages.
 */
function externalEsmPlugin(externals: string[], format?: Format): Plugin[] {
  if (format !== 'esm' || externals.length === 0) return [];

  return [
    {
      name: 'external-esm-plugin',
      setup(builder) {
        // Mark externals as external
        externals.forEach(packageName => {
          const filter = new RegExp(`^${packageName}$|^${packageName}/`);
          builder.onResolve({ filter }, args => ({
            path: args.path,
            external: true,
          }));
        });
      },
    },
  ];
}

/**
 * Returns the GZIP and BROTLI sizes of the generated bundle.
 */
export async function getSizeInfo(code: string, filename: string) {
  const raw = code.length < 5000;

  const formatSize = (size: number, type: 'gz' | 'br') => {
    const pretty = raw ? `${size} B` : prettyBytes(size);
    const color = size < 5000 ? chalk.green : size > 40000 ? chalk.red : chalk.yellow;
    return `${color(pretty)}: ${chalk.white(path.basename(filename))}.${type}`;
  };

  const [gzip, brotli] = await Promise.all([gzipSize(code).catch(() => null), brotliSize(code).catch(() => null)]);

  const out = [formatSize(gzip!, 'gz'), formatSize(brotli!, 'br')].join('\n  ');
  return `  ${out}`;
}
