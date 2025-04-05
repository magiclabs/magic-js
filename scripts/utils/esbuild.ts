import * as esbuild from 'esbuild';
import path from 'path';
import fse from 'fs-extra';
import gzipSize from 'gzip-size';
import brotliSize from 'brotli-size';
import prettyBytes from 'pretty-bytes';
import chalk from 'chalk';
import execa from 'execa';
import { environment } from './environment';
import { existsAsync } from './exists-async';

interface ESBuildOptions {
  watch?: boolean;
  target?: esbuild.Platform;
  format?: esbuild.Format;
  output?: string;
  sourcemap?: boolean;
  name?: string;
  globals?: Record<string, string>;
  externals?: string[];
}

export async function build(options: ESBuildOptions) {
  if (options.output) {
    const buildOptions: esbuild.BuildOptions = {
      bundle: true,
      minify: true,
      treeShaking: true,
      drop: ['debugger', 'console'],
      legalComments: 'none',
      platform: options.target ?? 'browser',
      format: options.format ?? 'cjs',
      globalName: options.format === 'iife' ? options.name : undefined,
      entryPoints: [await getEntrypoint(options.format)],
      sourcemap: options.sourcemap,
      outfile: options.output,
      tsconfig: 'node_modules/.temp/tsconfig.build.json',
      external: options.externals,
      loader: { '.ts': 'ts', '.tsx': 'tsx' },
      define: Object.fromEntries(
        Object.entries(environment).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
      plugins: [...globalsPlugin(options.globals || {})],
      
      mangleProps: /^_/,
      ignoreAnnotations: false,
      metafile: true, // Generate metafile for size analysis

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
    };
    
    if (options.watch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
    } else {
      await esbuild.build(buildOptions);
      await printOutputSizeInfo(options);
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
    await getSizeInfo((await fse.readFile(outputPath)).toString(), outputPath);
  }
}

/**
 * Returns a function that can be used to handle rebuild events from ESBuild.
 */
function onRebuildFactory(options: ESBuildOptions) {
  return async (error: esbuild.BuildFailure | null, _result: esbuild.BuildResult | null) => {
    if (error) {
    } else {
      await printOutputSizeInfo(options);
    }
  };
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
async function getEntrypoint(format?: esbuild.Format) {
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
 * During the build step, we create an ephermeral "tsconfig.build.json" file
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
function globalsPlugin(globals: Record<string, string>): esbuild.Plugin[] {
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
    return `${pretty}: ${path.basename(filename)}.${type}`;
  };

  const [gzip, brotli] = await Promise.all([gzipSize(code).catch(() => null), brotliSize(code).catch(() => null)]);

  const out = [formatSize(gzip!, 'gz'), formatSize(brotli!, 'br')].join('\n  ');
  return `  ${out}`;
}
