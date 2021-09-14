#!/usr/bin/env ts-node-script

import path from 'path';
import { existsSync } from 'fs';
import { runAsyncProcess } from '../../utils/run-async-process';

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) args.push(''); // We need a minimum of one `args` element

  const root = path.join(__dirname, '..', '..', '..');
  const absResults = args.map((a) => path.join(process.cwd(), a ?? ''));
  const relResults = absResults.map((a) => path.relative(root, a));

  relResults.forEach((result, i) => {
    if (existsSync(absResults[i])) console.log(result);
  });
}

runAsyncProcess(main);
