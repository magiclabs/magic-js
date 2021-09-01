import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK, createMagicSDKTestMode } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';
import { isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `magic_auth_generate_id_token`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.generateIdToken();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_generate_id_token');
  expect(requestPayload.params).toEqual([undefined]);
});

test('Accepts a `lifespan` parameter', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.generateIdToken({ lifespan: 900 });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_generate_id_token');
  expect(requestPayload.params).toEqual([{ lifespan: 900 }]);
});

test('Accepts an `attachment` parameter', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  magic.user.generateIdToken({ attachment: 'hello world' });

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_generate_id_token');
  expect(requestPayload.params).toEqual([{ attachment: 'hello world' }]);
});

test('If `testMode` is enabled, testing-specific RPC method is used', async () => {
  const magic = createMagicSDKTestMode();
  magic.user.request = jest.fn();

  magic.user.generateIdToken();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_generate_id_token_testing_mode');
  expect(requestPayload.params).toEqual([undefined]);
});

test('method should return a PromiEvent', () => {
  const magic = createMagicSDK();
  expect(isPromiEvent(magic.user.generateIdToken())).toBeTruthy();
});
