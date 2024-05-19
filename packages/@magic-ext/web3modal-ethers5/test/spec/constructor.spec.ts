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

test('constructor sets up modal and getIsConnected is false', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.getIsConnected.mockReturnValueOnce(false);
  expect(magic.web3modal.modal).toBeDefined();
  expect(magic.web3modal.modal.getIsConnected()).toBeFalsy();
});

test('constructor sets event listeners when getIsConnected is true', () => {
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
