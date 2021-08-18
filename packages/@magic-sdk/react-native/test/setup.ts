// NOTE: This module is automatically included at the top of each test file.

import 'regenerator-runtime/runtime';

import browserEnv from '@ikscodes/browser-env';
import { removeReactDependencies } from './mocks';

browserEnv([
  'setTimeout',
  'clearTimeout',
  'postMessage',
  'addEventListener',
  'removeEventListener',
  'document',
  'console',
  'window',
]);
removeReactDependencies();
