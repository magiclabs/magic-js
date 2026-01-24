#!/usr/bin/env ts-node-script

import inquirer from 'inquirer';
import execa from 'execa';
import path from 'path';
import fs from 'fs-extra';
import { camelCase } from 'lodash';
import ejs from 'ejs';
import { environment } from '../../utils/environment';
import { runAsyncProcess } from '../../utils/run-async-process';

interface Props {
  platform: 'hybrid' | 'web' | 'react-native';
  extName: string;
  extDescription: string;
  className: string;
}

async function processTemplate(
  sourcePath: string,
  destPath: string,
  data: Record<string, any>,
): Promise<void> {
  const stat = await fs.stat(sourcePath);

  if (stat.isDirectory()) {
    await fs.ensureDir(destPath);
    const entries = await fs.readdir(sourcePath);

    for (const entry of entries) {
      const sourceEntryPath = path.join(sourcePath, entry);
      const destEntryPath = path.join(destPath, entry);
      await processTemplate(sourceEntryPath, destEntryPath, data);
    }
  } else {
    const content = await fs.readFile(sourcePath, 'utf-8');
    const processed = ejs.render(content, data, {
      filename: sourcePath,
    });
    await fs.writeFile(destPath, processed, 'utf-8');
  }
}

async function main() {
  const answers = await inquirer.prompt<Props>([
    {
      name: 'platform',
      message: 'What platform does the extension support?',
      type: 'list',
      choices: ['hybrid', 'web', 'react-native'],
    },
    {
      name: 'extName',
      message: 'What is the Extension name? (@magic-ext/[name])',
      type: 'input',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Extension name is required';
        }
        return true;
      },
    },
    {
      name: 'extDescription',
      message: 'Please specify the description field for package.json',
      type: 'input',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Description is required';
        }
        return true;
      },
    },
    {
      name: 'className',
      message: 'What is the exported Extension class name?',
      type: 'input',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Class name is required';
        }
        return true;
      },
    },
  ]);

  const templateRoot = path.resolve(__dirname, './template');
  const destinationRoot = path.resolve(__dirname, '../../../packages');
  const templateSource = path.join(templateRoot, answers.platform);
  const templateDest = path.join(destinationRoot, '@magic-ext', answers.extName);

  // Check if destination already exists
  if (await fs.pathExists(templateDest)) {
    throw new Error(`Extension @magic-ext/${answers.extName} already exists!`);
  }

  const templateData = {
    extName: answers.extName,
    extNameCamelCase: camelCase(answers.extName),
    className: answers.className,
    cdnGlobalName: `Magic${answers.className}`,
    extDescription: answers.extDescription,
    magicSdkVersion: `^${environment.WEB_VERSION}`,
    magicSdkReactVersion: `^${environment.BARE_REACT_NATIVE_VERSION}`,
    magicSdkProviderVersion: `^${require('../../../packages/@magic-sdk/provider/package.json').version}`,
  };

  await processTemplate(templateSource, templateDest, templateData);
  await execa('yarn', ['install'], { stdio: 'inherit' });
}

runAsyncProcess(main);
