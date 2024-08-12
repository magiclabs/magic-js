// NOTE: This module is automatically included at the top of each test file.
import browserEnv from '@ikscodes/browser-env';
import { Crypto } from '@peculiar/webcrypto';
import { mockConsole } from '../../../../scripts/utils/mock-console';

browserEnv();
(window as any).crypto = new Crypto();

beforeEach(() => {
  mockConsole();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers(); // Runs any pending timers
  jest.useRealTimers(); // Switch back to real timers
});
