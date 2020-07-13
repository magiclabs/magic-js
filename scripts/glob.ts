#!/usr/bin/env ts-node-script

import { resolve } from 'path';
import glob from 'glob';

const dir = process.cwd();
const pattern = process.argv.slice(2)[0];

if (!pattern) process.exit(0);

const matches = glob.sync(String(pattern), { cwd: dir });

if (!matches?.length) process.exit(0);

matches.forEach((match) => {
  const path = resolve(dir, match);
  process.stdout.write(`${path}\n`);
});
