#!/usr/bin/env ts-node-script

import chalk from 'chalk';
import execa from 'execa';

async function main() {
  console.log(chalk`\n{dim ❮❮❮} Running tests {dim ❯❯❯}\n`);
  const args = process.argv.slice(2);

  await execa(
    'yarn',
    ['--silent', 'wsrun', '--serial', `${process.env.INIT_CWD}/scripts/wsrun/test:unit.ts`, ...args],
    {
      stdio: 'inherit',
    },
  );
}

main();
