import { createIframeController } from '../../factories';
import { IframeController } from '../../../src/iframe-controller';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(global, 'addEventListener').mockImplementation(jest.fn());
  jest.spyOn(console, 'log').mockImplementation(jest.fn());
});

test('Change display style to `none` and opacity to 0', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { display: 'none' },
    };

    return Promise.resolve();
  };

  const overlay = createIframeController();

  await (overlay as any).hideOverlay();

  expect((overlay as any).iframe).toEqual({
    style: { display: 'none', opacity: '0', zIndex: '-1' },
  });
});

test('If `activeElement` exists and can be focused, calls `activeElement.focus()`', async () => {
  (IframeController.prototype as any).init = function () {
    this.iframe = {
      style: { display: 'block' },
    };

    return Promise.resolve();
  };

  const overlay = createIframeController();

  const focusStub = jest.fn();
  (overlay as any).activeElement = {
    focus: focusStub,
  };

  await (overlay as any).hideOverlay();

  expect(focusStub).toBeCalledTimes(1);
  expect((overlay as any).activeElement).toBe(null);
});
