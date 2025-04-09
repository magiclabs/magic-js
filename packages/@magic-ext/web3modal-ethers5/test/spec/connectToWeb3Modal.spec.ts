import { Web3ModalExtension } from '../../src/index';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { mockLocalStorage } from '../../../../@magic-sdk/provider/test/mocks';
import { isPromiEvent } from '../../../../@magic-sdk/commons';

jest.mock('@web3modal/ethers5', () => ({
  Web3Modal: jest.fn(),
  defaultConfig: jest.fn(),
  createWeb3Modal: () => {
    return {
      getIsConnected: jest.fn(),
      getAddress: jest.fn(() => '0x123'),
      getChainId: jest.fn(() => 1),
      subscribeProvider: jest.fn(),
      subscribeEvents: jest.fn(),
      open: jest.fn(),
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

test('connectToWeb3modal returns promiEvent', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  expect(isPromiEvent(magic.web3modal.connectToWeb3modal())).toBeTruthy();
});

test('connectToWeb3modal calls subscribeProvider', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.connectToWeb3modal();
  expect(magic.web3modal.modal.subscribeProvider).toBeCalled();
});

test('connectToWeb3modal calls subscribeEvents', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.connectToWeb3modal();
  expect(magic.web3modal.modal.subscribeEvents).toBeCalled();
});

test('connectToWeb3modal calls `open`', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.connectToWeb3modal();
  expect(magic.web3modal.modal.open).toBeCalled();
});
