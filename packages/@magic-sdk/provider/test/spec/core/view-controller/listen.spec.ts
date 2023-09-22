import browserEnv from '@ikscodes/browser-env';
import { createViewController } from '../../../factories';
import { MSG_TYPES } from '../../../constants';
import { createDeprecationWarning } from '../../../../src/core/sdk-exceptions';
import { UniversalWalletRemovalVersions } from '../../../../src/core/view-controller';

beforeEach(() => {
  browserEnv();
});

jest.mock('../../../../src/core/sdk-exceptions', () => ({
  ...jest.requireActual('../../../../src/core/sdk-exceptions'),
  createDeprecationWarning: jest.fn(),
}));

test('Receive MAGIC_HIDE_OVERLAY, call `hideOverlay`', (done) => {
  const overlay = createViewController('');
  const hideOverlayStub = jest.fn();
  overlay.hideOverlay = hideOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }, '*');

  setTimeout(() => {
    expect(hideOverlayStub).toBeCalledTimes(1);
    done();
  }, 0);
});

test('Receive MAGIC_SHOW_OVERLAY, call `showOverlay`', (done) => {
  const overlay = createViewController('');
  const showOverlayStub = jest.fn();
  overlay.showOverlay = showOverlayStub;

  window.postMessage({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }, '*');

  setTimeout(() => {
    expect(showOverlayStub).toBeCalledTimes(1);
    done();
  }, 0);
});

test('Receive MAGIC_SEND_PRODUCT_TYPE with product_type "connect", call `createDeprecationWarning`', (done) => {
  const overlay = createViewController('');

  // Cast the imported function to its mocked version
  const mockCreateDeprecationWarning = createDeprecationWarning as jest.Mock;

  // Mock the return value
  mockCreateDeprecationWarning.mockReturnValue({
    log: jest.fn(),
  });

  window.postMessage(
    {
      msgType: MSG_TYPES().MAGIC_SEND_PRODUCT_TYPE,
      response: {
        product_type: 'connect',
      },
    },
    '*',
  );

  setTimeout(() => {
    expect(mockCreateDeprecationWarning).toBeCalledWith({
      method: 'Usage of Universal Wallet API Keys',
      removalVersions: UniversalWalletRemovalVersions,
      useInstead: 'Dedicated Wallet API Key',
    });
    done();
  }, 0);
});
