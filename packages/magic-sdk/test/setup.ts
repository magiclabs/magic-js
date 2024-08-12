// NOTE: This module is automatically included at the top of each test file.

import 'regenerator-runtime/runtime';

import browserEnv from '@ikscodes/browser-env';
import { mockConsole } from '../../../scripts/utils/mock-console';

browserEnv();

beforeEach(() => {
  mockConsole();
});
