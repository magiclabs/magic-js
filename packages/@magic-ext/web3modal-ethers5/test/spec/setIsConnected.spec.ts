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

test('setIsConnected sets localStorage values', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.setIsConnected();
  expect(localStorage.getItem('magic_3pw_provider')).toEqual('web3modal');
  expect(localStorage.getItem('magic_3pw_address')).toEqual('0x123');
  expect(localStorage.getItem('magic_3pw_chainId')).toEqual('1');
  expect(magic.thirdPartyWallet.isConnected).toBeTruthy();
});
