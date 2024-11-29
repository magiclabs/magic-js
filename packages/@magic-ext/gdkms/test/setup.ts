// NOTE: This module is automatically included at the top of each test file.
import { Crypto } from '@peculiar/webcrypto';
import { mockConsole } from '../../../../scripts/utils/mock-console';

(window as any).crypto = new Crypto();

beforeEach(() => {
  mockConsole();
});
