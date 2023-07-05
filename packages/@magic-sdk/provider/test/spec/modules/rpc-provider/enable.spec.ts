import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { BaseModule } from '../../../../src/modules/base-module';

beforeEach(() => {
  browserEnv.restore();
  jest.restoreAllMocks();
  (BaseModule as any).prototype.request = jest.fn();
});

test('Generates a JSON RPC request payload with method `mc_login`', async () => {
  const magic = createMagicSDK();

  magic.rpcProvider.enable();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_login');
  expect(requestPayload.params).toEqual([]);
});
