import { createIframeController } from '../../factories';
import { IframeController } from '../../../src/iframe-controller';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(global, 'addEventListener').mockImplementation(jest.fn());
  jest.spyOn(console, 'warn').mockImplementation(jest.fn());
});

test('Change display style to `block`', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { display: 'block' },
      focus: () => {},
    };

    return Promise.resolve();
  };

  const overlay = createIframeController();

  await (overlay as any).showOverlay();

  expect((overlay as any).iframe.style.display).toBe('block');
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
  const mockElement = document.createElement('div');

  jest.spyOn(document, 'activeElement', 'get').mockReturnValue(mockElement);

  expect((overlay as any).activeElement).toBe(null);

  await (overlay as any).showOverlay();

  expect((overlay as any).activeElement).toBe(mockElement);
});
