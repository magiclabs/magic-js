import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error if incorrect params passed in', async () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: {},
  });

  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getWalletConnectProvider()).rejects.toThrow();
});

test('Throws error if incorrect params passed in', async () => {
  const magic = createMagicSDK({
    thirdPartyWalletOptions: undefined,
  });

  magic.wallet.request = jest.fn();

  expect(() => magic.wallet.getWalletConnectProvider()).rejects.toThrow();
});
