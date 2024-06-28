import browserEnv from '@ikscodes/browser-env';
import { Web3ModalExtension } from '../../src/index';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { mockLocalStorage } from '../../../../@magic-sdk/provider/test/mocks';

jest.mock('@web3modal/ethers5', () => ({
  Web3Modal: jest.fn(),
  defaultConfig: jest.fn(),
  createWeb3Modal: jest.fn(() => {
    return {
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

test('initialize updates `enabledWallets`, `isConnected`, and `eventListeners`', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.initialize();
  expect(magic.thirdPartyWallets.enabledWallets.web3modal).toBeTruthy();
  expect(magic.thirdPartyWallets.isConnected).toBeFalsy();
  expect(magic.thirdPartyWallets.eventListeners.length).toEqual(1);
});
