import { ConnectWithUiEvents, ThirdPartyWalletEvents } from '@magic-sdk/types';
import { createPromiEvent } from '../../../../src/util';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Generate JSON RPC request payload with method `mc_login`', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(resolve => {
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
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(resolve => {
    resolve(['0x12345']);
  });
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  magic.thirdPartyWallets.enabledWallets = { web3modal: true };
  const handle = magic.wallet.connectWithUI({ autoPromptThirdPartyWallets: true });
  mockPromiEvent.emit('id-token-created', { idToken: '1234456' });
  await handle;
  const requestPayload = magic.wallet.request.mock.calls[0][0];
  expect(requestPayload.params).toEqual([{ autoPromptThirdPartyWallets: true, enabledWallets: { web3modal: true } }]);
});

const walletKeyByEvent: Record<ThirdPartyWalletEvents, string> = {
  [ThirdPartyWalletEvents.Web3ModalSelected]: 'web3modal',
  [ThirdPartyWalletEvents.MetaMaskSelected]: 'metamask',
  [ThirdPartyWalletEvents.CoinbaseSelected]: 'coinbase',
  [ThirdPartyWalletEvents.PhantomSelected]: 'phantom',
  [ThirdPartyWalletEvents.RabbySelected]: 'rabby',
  [ThirdPartyWalletEvents.WalletConnected]: 'connected',
  [ThirdPartyWalletEvents.WalletRejected]: 'rejected',
};

test.each([
  ThirdPartyWalletEvents.Web3ModalSelected,
  ThirdPartyWalletEvents.MetaMaskSelected,
  ThirdPartyWalletEvents.CoinbaseSelected,
  ThirdPartyWalletEvents.PhantomSelected,
  ThirdPartyWalletEvents.RabbySelected,
])('Calls event listener callback for %s', async eventName => {
  const mockCallback = jest.fn();
  const eventListeners = [{ event: eventName, callback: mockCallback }];
  const magic = createMagicSDK();
  magic.thirdPartyWallets.eventListeners = eventListeners;
  const walletKey = walletKeyByEvent[eventName];
  magic.thirdPartyWallets.enabledWallets = { [walletKey]: true } as any;
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>(resolve => resolve(['0x12345']));
  magic.wallet.request = jest.fn(() => mockPromiEvent);
  const handle = magic.wallet.connectWithUI();
  mockPromiEvent.emit(eventName);
  await handle;
  expect(mockCallback).toHaveBeenCalledTimes(1);
});

test('Catches the error', async () => {
  const magic = createMagicSDK();
  const mockPromiEvent = createPromiEvent<string[], ConnectWithUiEvents>((resolve, reject) => {
    reject(new Error('Error'));
  });

  magic.wallet.request = jest.fn(() => mockPromiEvent);

  try {
    await magic.wallet.connectWithUI();
  } catch (error) {
    expect(error).toEqual(new Error('Error'));
  }
});
