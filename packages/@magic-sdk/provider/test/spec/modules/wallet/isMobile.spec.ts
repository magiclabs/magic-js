import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns true if navigator.userAgent includes a mobile user agent string', async () => {
  Object.defineProperty(window.navigator, 'userAgent', { value: 'iPhone', configurable: true });

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMobile();
  expect(response).toEqual(true);
});

test('Returns false if navigator.userAgent does not include a mobile user agent string', async () => {
  Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla', configurable: true });

  const magic = createMagicSDK();
  magic.wallet.request = jest.fn();

  const response = magic.wallet.isMobile();
  expect(response).toEqual(false);
});
