#!/usr/bin/env ts-node-script

import { relative, join } from 'path';
import { existsSync } from 'fs';
import { runAsyncProcess } from '../utils/run-async-process';

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) args.push(''); // We need a minimum of one `args` element

  const root = join(__dirname, '..', '..');
  const absResults = args.map((a) => join(process.cwd(), a ?? ''));
  const relResults = absResults.map((a) => relative(root, a));

  relResults.forEach((result, i) => {
    if (existsSync(absResults[i])) console.log(result);
  });
}

runAsyncProcess(main);
