import execa from 'execa';
import path from 'path';
import { environment } from './environment';
import { existsAsync } from './exists-async';

type MicrobundleFormat = 'modern' | 'es' | 'cjs' | 'cdn';

export async function build(
  options: {
    target?: string;
    format?: MicrobundleFormat;
    output?: string;
    sourcemap?: boolean;
    name?: string;
    external?: string;
  } = {},
) {
  if (options.output) {
    /* eslint-disable prettier/prettier */
    const args = [
      'build', await getFormatSpecificEntrypoint(options.format),
      '--tsconfig', 'tsconfig.json',
      '--target', options.target ?? 'web',
      '--jsx', 'React.createElement',
      '--format', getFormatForMicrobundle(options.format),
      '--sourcemap', options.sourcemap ? 'true' : 'false',
      options.external && '--external', options.external,
      '--output', options.output,
      '--define', Object.entries(environment).map(([key, value]) => `process.env.${key}=${value}`).join(','),
      options.name && '--name', options.name,
    ].filter(Boolean);
    /* eslint-enable prettier/prettier */

    await execa('microbundle', args as any, { stdio: 'inherit' });
  }
}

async function getFormatSpecificEntrypoint(format?: MicrobundleFormat) {
  if (await existsAsync(path.resolve(process.cwd(), `./src/index.${format}.ts`))) {
    return `src/index.${format}.ts`;
  }

  return 'src/index.ts';
}

function getFormatForMicrobundle(format?: MicrobundleFormat) {
  switch (format) {
    case 'cdn':
      return 'iife';

    case 'modern':
    case 'es':
    case 'cjs':
    default:
      return format ?? 'cjs';
  }
}
