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

test('onThirdPartyWalletRequest stores the handler', () => {
  const listenStub = jest.fn();
  (ViewController.prototype as any).listen = listenStub;

  const overlay = new (ViewController as any)('testing123', 'qwerty');
  const handler = jest.fn();

  ViewController.prototype.onThirdPartyWalletRequest.call(overlay, handler);

  expect((overlay as any).thirdPartyWalletRequestHandler).toBe(handler);
});
