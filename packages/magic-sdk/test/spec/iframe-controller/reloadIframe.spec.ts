import browserEnv from '@ikscodes/browser-env';
import { createIframeController } from '../../factories';
import { IframeController } from '../../../src/iframe-controller';

beforeEach(() => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('console.warn', jest.fn());
});

test('Reloads the iframe when it is ready', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { visibility: 'hidden' },
      focus: () => {},
      contentWindow: {
        location: { reload: jest.fn() },
      },
    };

    return Promise.resolve();
  };
  const src = 'http://example.com';
  const overlay = createIframeController() as any;

  overlay.iframe.src = src;

  await overlay.reloadIframe();

  expect(overlay.iframe.src).toBe(src);
});

test('Throws error when iframe is not ready.', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {};

    return Promise.resolve();
  };
  const src = 'http://example.com';
  const overlay = createIframeController() as any;

  overlay.iframe.src = src;

  await expect(overlay.reloadIframe()).rejects.toThrow('Magic SDK Error: [MODAL_NOT_READY] Modal is not ready.');
});

test('Calls reloadIframe when it is ready', async () => {
  const reloadMock = jest.fn();

  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { visibility: 'hidden' },
      focus: () => {},
      contentWindow: {
        location: { reload: reloadMock },
      },
    };

    return Promise.resolve();
  };

  const overlay = createIframeController() as any;

  overlay.iframe.src = 'http://example.com';

  await overlay.reloadIframe();

  expect(reloadMock).toHaveBeenCalled();
});
