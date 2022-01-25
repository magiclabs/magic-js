import { build as esbuild, Platform, Plugin } from 'esbuild';
import path from 'path';
import fse from 'fs-extra';
import gzipSize from 'gzip-size';
import brotliSize from 'brotli-size';
import prettyBytes from 'pretty-bytes';
import chalk from 'chalk';
import execa from 'execa';
import { environment } from './environment';
import { existsAsync } from './exists-async';

type ESBuildFormat = 'esm' | 'modern' | 'cjs' | 'iife';

interface ESBuildOptions {
  target?: Platform;
  format?: ESBuildFormat;
  output?: string;
  sourcemap?: boolean;
  name?: string;
  globals?: Record<string, string>;
  externals?: string[];
}

export async function build(options: ESBuildOptions) {
  if (options.output) {
    try {
      await esbuild({
        bundle: true,
        minify: true,
        legalComments: 'none',
        platform: options.target ?? 'browser',
        format: getFormat(options.format) ?? 'cjs',
        globalName: options.format === 'iife' ? options.name : undefined,
        entryPoints: [await getEntrypoint(options.format, options.output)],
        sourcemap: options.sourcemap,
        outfile: options.output,
        tsconfig: 'node_modules/.temp/tsconfig.build.json',
        external: options.externals,
        loader: { '.ts': 'ts', '.tsx': 'tsx' },
        define: Object.fromEntries(
          Object.entries(environment).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
        ),
        plugins: [...globalsPlugin(options.globals || {})],

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

      // Log the type and size of the output(s)...
      const outputPath = path.resolve(process.cwd(), options.output);
      const sizeInfo = await getSizeInfo((await fse.readFile(outputPath)).toString(), outputPath);
      console.log(chalk`Built {rgb(0,255,255) ${options.format}} to {gray ${path.dirname(options.output)}}`);
      console.log(sizeInfo);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

/**
 * Emits TypeScript typings for the current package.
 */
export async function emitTypes() {
  try {
    await execa('tsc', ['-p', 'node_modules/.temp/tsconfig.build.json']);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function getFormat(format?: ESBuildFormat): Exclude<ESBuildFormat, 'modern'> | undefined {
  switch (format) {
    case 'modern':
      return 'esm';

    default:
      return format;
  }
}

async function getEntrypoint(format?: ESBuildFormat, output?: string) {
  const findEntrypoint = async (indexTarget?: string) => {
    if (format && (await existsAsync(path.resolve(process.cwd(), `./src/index.${indexTarget}.ts`)))) {
      return `src/index.${indexTarget}.ts`;
    }

    return 'src/index.ts';
  };

  if (output === 'react-native') {
    return findEntrypoint('native');
  }

  switch (format) {
    case 'iife':
      return findEntrypoint('cdn');

    case 'esm':
    case 'modern':
      return findEntrypoint('es');

    case 'cjs':
    default:
      return findEntrypoint(format);
  }
}

/**
 * During the build step, we create an ephermeral "tsconfig.build.json" file
 * containing confierrides to resolve "packages/.../src" as the "rootDir".
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
        builder.onResolve({ filter: new RegExp(`^${packageName}$`) }, (args) => ({
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
 * Returns the GZIP and BROTLI sizes of the generated bundle.
 */
export async function getSizeInfo(code: string, filename: string) {
  const raw = code.length < 5000;

  const formatSize = (size: number, type: 'gz' | 'br') => {
    const pretty = raw ? `${size} B` : prettyBytes(size);
    // eslint-disable-next-line no-nested-ternary
    const color = size < 5000 ? chalk.green : size > 40000 ? chalk.red : chalk.yellow;
    return `${color(pretty)}: ${chalk.white(path.basename(filename))}.${type}`;
  };

  const [gzip, brotli] = await Promise.all([gzipSize(code).catch(() => null), brotliSize(code).catch(() => null)]);

  const out = [formatSize(gzip!, 'gz'), formatSize(brotli!, 'br')].join('\n  ');
  return `  ${out}`;
}
