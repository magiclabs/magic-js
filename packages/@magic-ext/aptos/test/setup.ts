// NOTE: This module is automatically included at the top of each test file.
import { mockConsole } from '../../../../scripts/utils/mock-console';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for @aptos-labs/ts-sdk
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock Aptos API responses
const mockAptosApiResponse = (url: string) => {
  // Mock account response
  if (url.includes('/accounts/')) {
    return {
      sequence_number: '0',
      authentication_key: '0x8293d5e05544c6e53c47fc19ae071c26a60e0ccbd8a12eb5b2c9d348c85227b6',
    };
  }
  // Mock modules response
  if (url.includes('/modules')) {
    return [];
  }
  // Default response
  return {};
};

// Polyfill fetch for jsdom environment
global.fetch = jest.fn((url: string) =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(mockAptosApiResponse(url)),
    text: () => Promise.resolve(JSON.stringify(mockAptosApiResponse(url))),
  } as Response),
);

beforeEach(() => {
  mockConsole();
  jest.clearAllMocks();
});
