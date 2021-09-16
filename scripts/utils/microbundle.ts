import execa from 'execa';
import { environment } from './environment';

type MicrobundleFormat = 'modern' | 'es' | 'cjs' | 'umd' | 'iife';

export async function microbundle(
  cmd: 'build' | 'watch',
  options: {
    source?: string;
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
      cmd, options.source ?? 'src/index.ts',
      '--tsconfig', 'tsconfig.json',
      '--target', options.target ?? 'web',
      '--jsx', 'React.createElement',
      '--format', options.format ?? 'cjs',
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
