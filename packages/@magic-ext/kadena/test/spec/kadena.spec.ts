import browserEnv from '@ikscodes/browser-env';
import { KadenaPayloadMethod } from '../../src/types';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { KadenaExtension } from '../../src';

beforeEach(() => {
  browserEnv.restore();
});

test('signTransaction - Sends params as payload', () => {
  const magic = createMagicSDKWithExtension({}, [
    new KadenaExtension({
      rpcUrl: '',
      chainId: '1',
      networkId: 'testnet04',
      network: 'testnet',
      createAccountsOnChain: true,
    }),
  ]);
  magic.kadena.request = jest.fn();

  const params = '0x123';

  magic.kadena.signTransaction(params);

  const requestPayload = magic.kadena.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(KadenaPayloadMethod.KadenaSignTransaction);
  expect(requestPayload.params).toEqual([{ hash: '0x123' }]);
});

test('signTransactionWithSpireKey - Sends params as payload', () => {
  const magic = createMagicSDKWithExtension({}, [
    new KadenaExtension({
      rpcUrl: '',
      chainId: '1',
      networkId: 'testnet04',
      network: 'testnet',
      createAccountsOnChain: true,
    }),
  ]);
  magic.kadena.request = jest.fn();

  const params = {
    hash: '0x123',
    cmd: '0x456',
    sigs: [undefined],
  };

  magic.kadena.signTransactionWithSpireKey(params);

  const requestPayload = magic.kadena.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(KadenaPayloadMethod.KadenaSignTransactionWithSpireKey);
  expect(requestPayload.params).toEqual([{ transaction: params }]);
});

test('Generate JSON RPC request payload with method `kda_loginWithSpireKey`', () => {
  const magic = createMagicSDKWithExtension({}, [
    new KadenaExtension({
      rpcUrl: '',
      chainId: '1',
      networkId: 'testnet04',
      network: 'testnet',
      createAccountsOnChain: true,
    }),
  ]);
  magic.kadena.request = jest.fn();

  magic.kadena.loginWithSpireKey();

  const requestPayload = magic.kadena.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(KadenaPayloadMethod.KadenaLoginWithSpireKey);
});

test('Generate JSON RPC request payload with method `kda_getInfo`', () => {
  const magic = createMagicSDKWithExtension({}, [
    new KadenaExtension({
      rpcUrl: '',
      chainId: '1',
      networkId: 'testnet04',
      network: 'testnet',
      createAccountsOnChain: true,
    }),
  ]);
  magic.kadena.request = jest.fn();

  magic.kadena.getInfo();

  const requestPayload = magic.kadena.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(KadenaPayloadMethod.KadenaGetInfo);
});
