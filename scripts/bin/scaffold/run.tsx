#!/usr/bin/env ts-node-script

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import React from 'react';
import { Zombi, Template, Directory, scaffold } from 'zombi';
import execa from 'execa';
import path from 'path';
import { camelCase } from 'lodash';
import { environment } from '../../utils/environment';
import { runAsyncProcess } from '../../utils/run-async-process';

interface Props {
  platform?: 'hybrid' | 'web' | 'react-native';
  extName?: string;
  extDescription?: string;
  className?: string;
}

const template = (
  <Zombi<Props>
    name="create-magic-extension"
    templateRoot={path.resolve(__dirname, './template')}
    destinationRoot={path.resolve(__dirname, '../../../packages')}
    prompts={[
      {
        name: 'platform',
        message: 'What platform does the extension support?',
        type: 'select',
        choices: ['hybrid', 'web', 'react-native'],
      },

      {
        name: 'extName',
        message: 'What is the Extension name? (@magic-ext/[name])',
        type: 'input',
      },

      {
        name: 'extDescription',
        message: 'Please specify the description field for package.json',
        type: 'input',
      },

      {
        name: 'className',
        message: 'What is the exported Extension class name?',
        type: 'input',
      },
    ]}
  >
    {(props) => (
      <Directory name="@magic-ext">
        <Template
          name={props.extName}
          source={props.platform ?? 'hybrid'}
          data={{
            extNameCamelCase: camelCase(props.extName),
            cdnGlobalName: `Magic${props.className}`,
            magicSdkVersion: `^${environment.WEB_VERSION}`,
            magicSdkReactVersion: `^${environment.REACT_NATIVE_VERSION}`,
            magicSdkCommonsVersion: `^${require('../../../packages/@magic-sdk/commons/package.json').version}`,
          }}
        />
      </Directory>
    )}
  </Zombi>
);

async function main() {
  type ScaffoldData = { 'create-magic-extension': Props };
  await scaffold<ScaffoldData>(template);
  await execa('yarn', ['install'], { stdio: 'inherit' });
}

runAsyncProcess(main);
