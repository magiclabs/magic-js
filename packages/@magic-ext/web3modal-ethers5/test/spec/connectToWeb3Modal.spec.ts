import browserEnv from '@ikscodes/browser-env';
import { Web3ModalExtension } from '../../src/index';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { mockLocalStorage } from '../../../../@magic-sdk/provider/test/mocks';
import { isPromiEvent } from '../../../../@magic-sdk/commons';

jest.mock('@web3modal/ethers5', () => ({
  Web3Modal: jest.fn(),
  defaultConfig: jest.fn(),
  createWeb3Modal: jest.fn(() => {
    return {
      getIsConnected: jest.fn(),
      getAddress: jest.fn(() => '0x123'),
      getChainId: jest.fn(() => 1),
      subscribeProvider: jest.fn(),
      subscribeEvents: jest.fn(),
      open: jest.fn(),
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

// skip because it does not like calling the unsubscribe function
test.skip('connectToWeb3modal emits wallet_rejected event on subscribeProvider error', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.subscribeProvider = jest.fn((callback: (provider: { error: boolean }) => void) => {
    callback({ error: true });
  });
  const createIntermediaryEventFn = jest.fn();
  magic.web3modal.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);
  magic.web3modal.connectToWeb3modal();
  const rejectedEvent = magic.web3modal.createIntermediaryEvent.mock.calls[0];
  expect(rejectedEvent[0]).toBe('wallet_rejected');
});

// skip because it does not like calling the unsubscribe function
test.skip('connectToWeb3modal emits wallet_connected event on `address` event', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.subscribeProvider = jest.fn((callback: (provider: { address: string }) => void) => {
    callback({ address: '0x123' });
  });
  const setIsConnectedSpy = jest.spyOn(magic.web3modal, 'setIsConnected').mockImplementation(() => Promise.resolve({}));
  const setEip1193EventListenersSpy = jest
    .spyOn(magic.web3modal, 'setEip1193EventListeners')
    .mockImplementation(() => Promise.resolve({}));

  const createIntermediaryEventFn = jest.fn();
  magic.web3modal.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);
  magic.web3modal.connectToWeb3modal();
  const connectedEvent = magic.web3modal.createIntermediaryEvent.mock.calls[0];
  expect(connectedEvent[0]).toBe('wallet_connected');
  expect(setIsConnectedSpy).toBeCalled();
  expect(setEip1193EventListenersSpy).toBeCalled();
});

// skip because it does not like calling the unsubscribe function
test.skip('connectToWeb3modal emits wallet_rejected event on "MODAL_CLOSE" event', () => {
  const magic = createMagicSDKWithExtension({}, [new Web3ModalExtension(web3modalParams)]);
  magic.web3modal.modal.subscribeEvents = jest.fn(
    (
      callback: (provider: {
        data: {
          event: string;
        };
      }) => void,
    ) => {
      callback({ data: { event: 'MODAL_CLOSE' } });
    },
  );
  const createIntermediaryEventFn = jest.fn();
  magic.web3modal.createIntermediaryEvent = jest.fn().mockImplementation(() => createIntermediaryEventFn);
  magic.web3modal.connectToWeb3modal();
  const rejectedEvent = magic.web3modal.createIntermediaryEvent.mock.calls[0];
  expect(rejectedEvent[0]).toBe('wallet_rejected');
});
