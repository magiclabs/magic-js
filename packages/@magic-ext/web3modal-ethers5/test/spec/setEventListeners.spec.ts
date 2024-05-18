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

test('setEip1193EventListeners calls subscribeProvider', async () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.setEip1193EventListeners();
  expect(magic.web3modal.modal.subscribeProvider).toBeCalled();
});

test('setEip1193EventListeners does not set listeners if they were already set', async () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.eventsListenerAdded = true;
  const subscribeProviderSpy = jest.spyOn(magic.web3modal.modal, 'subscribeProvider');
  magic.web3modal.setEip1193EventListeners();
  expect(subscribeProviderSpy).toBeCalledTimes(0);
});
