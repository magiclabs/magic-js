/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '../../../../../../../scripts/utils/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
});

test('set authorization token', async () => {
  const magic = createMagicSDK();
  magic.auth.request = jest.fn().mockResolvedValue(true);

  const response = await magic.auth.setAuthorizationToken('hello-world');

  const requestPayload = magic.auth.request.mock.calls[0][0];
  expect(requestPayload.jsonrpc).toBe('2.0');
  expect(response).toBe(true);
});
