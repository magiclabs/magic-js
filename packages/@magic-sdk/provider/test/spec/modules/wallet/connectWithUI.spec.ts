import browserEnv from '@ikscodes/browser-env';
import { ConnectWithUiEvents } from '@magic-sdk/types';
import { createPromiEvent } from '../../../../src/util';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Generate JSON RPC request payload with method `mc_login`', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
    resolve(['0x12345']);
  });
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  const handle = magic.wallet.connectWithUI();
  mockPromiEvent.emit('id-token-created', { idToken: '1234456' });
  await handle;
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('mc_login');
});

test('Generate JSON RPC request payload with params', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
    resolve(['0x12345']);
  });
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  magic.thirdPartyWallet.enabledWallets = { web3modal: true };
  const handle = magic.wallet.connectWithUI({ autoPromptThirdPartyWallet: true });
  mockPromiEvent.emit('id-token-created', { idToken: '1234456' });
  await handle;
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.params).toEqual([{ autoPromptThirdPartyWallet: true, enabledWallets: { web3modal: true } }]);
});

test('Calls event listener callback', async () => {
  const mockCallback = jest.fn();
  const eventListeners = [{ event: 'web3modal_selected', callback: mockCallback }];
  const magic = createMagicSDK();
  magic.thirdPartyWallet.eventListeners = eventListeners;
  magic.thirdPartyWallet.enabledWallets = { web3modal: true };
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve) => resolve(['0x12345']));
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  const handle = magic.wallet.connectWithUI();
  // @ts-ignore
  mockPromiEvent.emit('web3modal_selected');
  await handle;
  expect(mockCallback).toHaveBeenCalledTimes(1);
});

test('Catches the error', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
    reject(new Error('Error'));
  });

  magic.wallet.request = jest.fn(() => mockPromiEvent);

  try {
    await magic.wallet.connectWithUI();
  } catch (error) {
    expect(error).toEqual(new Error('Error'));
  }
});
