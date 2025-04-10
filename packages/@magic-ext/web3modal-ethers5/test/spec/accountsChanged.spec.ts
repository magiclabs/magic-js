import { Web3ModalExtension } from '../../src/index';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { mockLocalStorage } from '../../../../@magic-sdk/provider/test/mocks';

jest.mock('@web3modal/ethers5', () => ({
  Web3Modal: jest.fn(),
  defaultConfig: jest.fn(),
  createWeb3Modal: () => {
    return {
      getIsConnected: jest.fn(),
      getAddress: jest.fn(() => '0x123'),
      getChainId: jest.fn(() => 1),
      subscribeProvider: jest.fn(),
    };
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
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

test('setEip1193EventListeners emits accountsChanged', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.subscribeProvider = jest.fn(
    (callback: (provider: { address: string; chainId: number }) => void) => {
      callback({ address: '0x123', chainId: 1 });
    },
  );
  const emitSpy = jest.spyOn(magic.rpcProvider, 'emit').mockImplementation(() => Promise.resolve({}));
  magic.web3modal.setEip1193EventListeners();
  expect(emitSpy).toBeCalledWith('accountsChanged', ['0x123']);
});
