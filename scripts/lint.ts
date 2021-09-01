#!/usr/bin/env ts-node-script

import chalk from 'chalk';
import execa from 'execa';

async function main() {
  console.log(chalk`\n{dim ❮❮❮} Linting TypeScripts {dim ❯❯❯}\n`);
  await execa('yarn', ['--silent', 'wsrun', '--stages', 'eslint', '--fix', '.'], { stdio: 'inherit' });
}

main();
