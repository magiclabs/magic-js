// NOTE: This module is automatically included at the top of each test file.

import 'regenerator-runtime/runtime';

import browserEnv from '@ikscodes/browser-env';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { removeReactDependencies } from './mocks';
import { mockConsole } from '../../../../scripts/utils/mock-console';
import { Crypto } from '@peculiar/webcrypto';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

(global as any).crypto = new Crypto();

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
beforeEach(() => {
  mockConsole();
});
removeReactDependencies();
