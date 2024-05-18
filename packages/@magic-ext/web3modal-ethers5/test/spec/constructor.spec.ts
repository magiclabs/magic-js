import browserEnv from '@ikscodes/browser-env';
import { Web3ModalExtension } from '../../src/index';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { mockLocalStorage } from '../../../../@magic-sdk/provider/test/mocks';

jest.mock('@web3modal/ethers5', () => ({
  Web3Modal: jest.fn(),
  defaultConfig: jest.fn(),
  createWeb3Modal: jest.fn(() => {
    return {
      getIsConnected: jest.fn(),
      getAddress: jest.fn(() => '0x123'),
      getChainId: jest.fn(() => 1),
      subscribeProvider: jest.fn(),
    };
  }),
}));

beforeEach(() => {
  browserEnv.restore();
  jest.useFakeTimers();
  mockLocalStorage();
});

const web3modalParams = {
  configOptions: {},
  modalOptions: {
    projectId: '123',
    chains: [],
    ethersConfig: { metadata: { name: 'test', description: 'test', url: 'test', icons: [] } },
  },
};

test('constructor sets up modal and getIsConnected is false', async () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.getIsConnected.mockReturnValueOnce(false);
  expect(magic.web3modal.modal).toBeDefined();
  expect(magic.web3modal.modal.getIsConnected()).toBeFalsy();
});

test('constructor sets event listeners when getIsConnected is true', async () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.getIsConnected = jest.fn().mockReturnValue(true);
  const setIsConnectedSpy = jest.spyOn(magic.web3modal, 'setIsConnected').mockImplementation(() => Promise.resolve({}));
  const setEip1193EventListenersSpy = jest
    .spyOn(magic.web3modal, 'setEip1193EventListeners')
    .mockImplementation(() => Promise.resolve({}));
  jest.runAllTimers();
  expect(setIsConnectedSpy).toBeCalled();
  expect(setEip1193EventListenersSpy).toBeCalled();
});

// test('setIsConnected', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   magic.web3modal.setIsConnected();
//   expect(localStorage.getItem('3pw_provider')).toEqual('web3modal');
//   expect(localStorage.getItem('3pw_address')).toEqual('0x123');
//   expect(localStorage.getItem('3pw_chainId')).toEqual('1');
//   expect(magic.thirdPartyWallet.isConnected).toBeTruthy();
// });

// test('initialize', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   magic.web3modal.initialize();
//   expect(magic.thirdPartyWallet.enabledWallets.web3modal).toBeTruthy();
//   expect(magic.thirdPartyWallet.isConnected).toBeFalsy();
//   expect(magic.thirdPartyWallet.eventListeners.length).toEqual(1);
// });

// // this one is triggering the callback console.log
// test('setEip1193EventListeners calls subscribeProvider', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   magic.web3modal.setEip1193EventListeners();
//   expect(magic.web3modal.modal.subscribeProvider).toBeCalled();
// });

// test('setEip1193EventListeners emits accountsChanged', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   magic.web3modal.modal.subscribeProvider = jest.fn(
//     (callback: (provider: { address: string; chainId: number }) => void) => {
//       callback({ address: '0x123', chainId: 1 });
//     },
//   );
//   const emitSpy = jest.spyOn(magic.rpcProvider, 'emit').mockImplementation(() => Promise.resolve({}));
//   magic.web3modal.setEip1193EventListeners();
//   expect(emitSpy).toBeCalledWith('accountsChanged', ['0x123']);
// });

// test('setEip1193EventListeners emits chainChanged', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   localStorage.setItem('3pw_address', '0x123');
//   magic.web3modal.modal.subscribeProvider = jest.fn(
//     (callback: (provider: { address: string; chainId: number }) => void) => {
//       callback({ address: '0x123', chainId: 1 });
//     },
//   );
//   const emitSpy = jest.spyOn(magic.rpcProvider, 'emit').mockImplementation(() => Promise.resolve({}));
//   magic.web3modal.setEip1193EventListeners();
//   expect(magic.web3modal.modal.subscribeProvider).toBeCalled();
//   expect(emitSpy).toBeCalledWith('chainChanged', [1]);
// });

// test('setEip1193EventListeners does not set listeners if they were already set', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   magic.web3modal.eventsListenerAdded = true;
//   const subscribeProviderSpy = jest.spyOn(magic.web3modal.modal, 'subscribeProvider');
//   magic.web3modal.setEip1193EventListeners();
//   expect(subscribeProviderSpy).toBeCalledTimes(0);
// });

// test('calls subscribeProvider callback', async () => {
//   const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
//   const callback = jest.fn();
//   magic.web3modal.eventsListenerAdded = false;
//   jest.spyOn(magic.web3modal.modal, 'subscribeProvider').mockImplementation(callback);
//   magic.web3modal.setEip1193EventListeners();
//   expect(callback).toBeCalled();
// });
