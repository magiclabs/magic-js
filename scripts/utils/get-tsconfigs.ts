import ora from 'ora';
import execa from 'execa';
import path from 'path';
import chalk from 'chalk';
import { handleError } from './handle-script-error';

type TSConfigType = 'cjs' | 'cdn';
type TSConfigPattern = `tsconfig.json` | `tsconfig.${TSConfigType}.json`;

/**
 * Returns a list of relative paths to the given `tsconfig.*.json` files for the
 * packages specified by the `PKG` environment variable.
 */
export async function getTSConfigs(targets: TSConfigPattern[]) {
  const spinner = ora('Determining TypeScript projects to build for development...').start();

  const tsconfigs = await execa('yarn', ['--silent', 'wsrun:paths', ...targets])
    .then((subprocess) => {
      spinner.succeed('Found TypeScript projects to build for development!');
      return subprocess.stdout.split('\n');
    })
    .catch(handleError(spinner, 'Failed to discover TypeScript project to build.'));

  const packages = tsconfigs.map((tsconfig) => {
    const re = new RegExp(`\\/(${targets.map(escapeRegExp).join('|')})$`);
    return tsconfig.replace(re, '');
  });

  return { tsconfigs, packages };
}

/**
 * Logs a list of TypeScript projects to the console, prettified.
 *
 * @param tsconfigs A list of relative paths to the `tsconfig.*.json` files.
 */
export function logTSConfigs(tsconfigs: string[]) {
  console.log(
    tsconfigs
      .slice()
      .sort()
      .map((cfgPath) => {
        const prefix = 'packages/';
        const basename = `/${path.basename(cfgPath)}`;
        return cfgPath.replace(prefix, chalk`{gray ${prefix}}`).replace(basename, chalk`{gray ${basename}}`);
      })
      .reduce((prev, next) => chalk`${prev}\n    {gray -} ${next}`, ''),
    '\n',
  );
}

/**
 * Escapes a string for use in a regular expression.
 */
function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
