import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';
import { mockLocalForage } from '../../../mocks';
import * as storage from '../../../../src/util/storage';

beforeEach(() => {
  browserEnv.restore();

  mockLocalForage();
});

test('Generate JSON RPC request payload with method `magic_get_info` and the active wallet', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  await storage.setItem('mc_active_wallet', 'metamask');

  await magic.wallet.getInfo();

  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_get_info');
  expect(requestPayload.params).toEqual([{ walletType: 'metamask' }]);
});

test('Generate JSON RPC request payload with method `magic_get_info`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  await storage.setItem('mc_active_wallet', 'metamask');

  await magic.user.getInfo();

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_get_info');
  expect(requestPayload.params).toEqual([{ walletType: 'metamask' }]);
});
