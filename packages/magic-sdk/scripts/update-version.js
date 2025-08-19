#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the package.json version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`Updating version to: ${version}`);

// Update index.ts
const indexTsPath = path.join(__dirname, '../src/index.ts');
let indexTsContent = fs.readFileSync(indexTsPath, 'utf8');

// Replace the version line with the current version
indexTsContent = indexTsContent.replace(
  /version:\s*['"][^'"]*['"],/,
  `version: '${version}',`
);

fs.writeFileSync(indexTsPath, indexTsContent);
console.log('Updated index.ts');

// Update index.cdn.ts
const indexCdnTsPath = path.join(__dirname, '../src/index.cdn.ts');
let indexCdnTsContent = fs.readFileSync(indexCdnTsPath, 'utf8');

// Replace the version line with the current version
indexCdnTsContent = indexCdnTsContent.replace(
  /version:\s*['"][^'"]*['"],/,
  `version: '${version}',`
);

fs.writeFileSync(indexCdnTsPath, indexCdnTsContent);
console.log('Updated index.cdn.ts');

console.log('Version update complete!');
