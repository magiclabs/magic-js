import execa from 'execa';
import path from 'path';
import fse from 'fs-extra';
import { environment } from './environment';
import { existsAsync } from './exists-async';

type MicrobundleFormat = 'modern' | 'es' | 'cjs' | 'iife';

interface MicrobundleOptions {
  target?: string;
  format?: MicrobundleFormat;
  output?: string;
  sourcemap?: boolean;
  name?: string;
  globals?: Record<string, string>;
  externals?: string[];
  alias?: Record<string, string>;
}

export async function build(options?: MicrobundleOptions) {
  await microbundle('build', options);
}

async function microbundle(command: 'build' | 'watch', options: MicrobundleOptions = {}) {
  if (options.output) {
    /* eslint-disable prettier/prettier */
    const args = [
      command, await getEntrypoint(options.format, options.output),
      '--tsconfig', 'node_modules/.temp/tsconfig.build.json',
      '--target', options.target ?? 'web',
      '--jsx', 'React.createElement',
      '--format', options.format ?? 'cjs',
      '--sourcemap', options.sourcemap ? 'true' : 'false',
      options.externals && options.externals.length && '--external', options.externals?.join(','),
      '--output', options.output,
      options.globals && '--globals', options.globals && Object.entries(options.globals).map(([key, value]) => `${key}=${value}`).join(','),
      options.alias && '--alias', options.alias && Object.entries(options.alias).map(([key, value]) => `${key}=${value}`).join(','),
      '--define', Object.entries(environment).map(([key, value]) => `process.env.${key}=${value}`).join(','),
      options.name && '--name', options.name,
    ].filter(Boolean);
    /* eslint-enable prettier/prettier */

    await execa('microbundle', args as any, { stdio: 'inherit' });
  }
}

async function getEntrypoint(format?: MicrobundleFormat, output?: string) {
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

    case 'modern':
    case 'es':
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

  const configuration = {
    extends: path.relative(path.dirname(tempTSConfigPath), baseTSConfigPath),
    compilerOptions: {
      rootDir: path.join(path.relative(path.dirname(tempTSConfigPath), process.cwd()), 'src'),
      // Discard what's configured for "paths" inside the root
      // "tsconfig.settings.json" file.
      paths: {},
    },
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js'],
  };

  await fse.ensureDir(path.dirname(tempTSConfigPath));
  await fse.writeJSON(tempTSConfigPath, configuration, { encoding: 'utf8' });
}
