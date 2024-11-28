import browserEnv from '@ikscodes/browser-env';
import { createIframeController } from '../../factories';
import { IframeController } from '../../../src/iframe-controller';

beforeEach(() => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', jest.fn());
  browserEnv.stub('console.warn', jest.fn());
});

test('Change display style to `block`', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { visibility: 'hidden' },
      focus: () => {},
    };

    return Promise.resolve();
  };

  const overlay = createIframeController();

  await (overlay as any).showOverlay();

  expect((overlay as any).iframe.style.visibility).toBe('visible');
});

test('Calls `iframe.focus()`', async () => {
  const focusStub = jest.fn();

  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { display: 'none' },
      focus: focusStub,
    };

    return Promise.resolve();
  };

  const overlay = createIframeController();

  await (overlay as any).showOverlay();

  expect(focusStub).toBeCalledTimes(1);
});

test('Saves the current `document.activeElement`', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { display: 'none' },
      focus: () => {},
    };

    return Promise.resolve();
  };

  const overlay = createIframeController();

  browserEnv.stub('document.activeElement', 'qwertyqwerty');

  expect((overlay as any).activeElement).toBe(null);

  await (overlay as any).showOverlay();

  expect((overlay as any).activeElement).toBe('qwertyqwerty');
});
