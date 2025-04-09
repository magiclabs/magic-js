import { ViewController } from '../../../../src/core/view-controller';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Instantiates `ViewController`', async () => {
  const listenStub = jest.fn();

  (ViewController.prototype as any).listen = listenStub;

  const overlay = new (ViewController as any)('testing123', 'qwerty');

  expect(overlay instanceof ViewController).toBe(true);
  expect(overlay.endpoint).toBe('testing123');
  expect(overlay.parameters).toBe('qwerty');
  expect(listenStub).toBeCalledTimes(1);
});
