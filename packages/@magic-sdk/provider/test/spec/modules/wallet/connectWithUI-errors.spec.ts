import browserEnv from '@ikscodes/browser-env';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createMagicSDK } from '../../../factories';

jest.mock('@coinbase/wallet-sdk');

beforeEach(() => {
  browserEnv({ url: 'http://localhost' });
  browserEnv.restore();
});

test('Throws error auto-connecting to coinbase wallet', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
    };
  });

  magic.wallet.isCoinbaseWalletBrowser = jest.fn(() => true);

  jest.mock('@magic-sdk/provider/src/core/json-rpc.ts', () => {
    return {
      createJsonRpcRequestPayload: () => {
        throw new Error('error');
      },
    };
  });

  expect(() => magic.wallet.connectWithUI()).rejects.toThrow();
});

test('Throws error auto-connecting to metamask', async () => {
  const magic = createMagicSDK();
  magic.wallet.request = jest.fn(() => {
    return {
      on: () => null,
    };
  });

  magic.wallet.isMetaMaskBrowser = jest.fn(() => true);

  jest.mock('@magic-sdk/provider/src/core/json-rpc.ts', () => {
    return {
      createJsonRpcRequestPayload: () => {
        throw new Error('error');
      },
    };
  });

  expect(() => magic.wallet.connectWithUI()).rejects.toThrow();
});
