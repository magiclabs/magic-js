import browserEnv from '@ikscodes/browser-env';
import { ViewController } from '../../../../src/core/view-controller';

beforeEach(() => {
  browserEnv.restore();
});

test('Instantiates `ViewController`', async () => {
  const listenStub = jest.fn();
  const waitForReadyStub = jest.fn();

  (ViewController.prototype as any).listen = listenStub;
  (ViewController.prototype as any).waitForReady = waitForReadyStub;

  const overlay = new (ViewController as any)('testing123', 'qwerty');

  expect(overlay instanceof ViewController).toBe(true);
  expect(overlay.endpoint).toBe('testing123');
  expect(overlay.parameters).toBe('qwerty');
  expect(listenStub).toBeCalledTimes(1);
  expect(waitForReadyStub).toBeCalledTimes(1);
});
