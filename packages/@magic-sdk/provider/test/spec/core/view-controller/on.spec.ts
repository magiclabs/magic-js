import browserEnv from '@ikscodes/browser-env';
import { MagicIncomingWindowMessage } from '@magic-sdk/types';
import { createViewController } from '../../../factories';

beforeEach(() => {
  browserEnv();
});

/**
 * We start with 3 listeners whenever a `ViewController` is created.
 */
const baselineListeners = 4;

test('Adds the event listener callback to the internal state', () => {
  const viewController = createViewController();
  const onHandlerStub = jest.fn();

  expect((viewController as any).messageHandlers.size).toBe(baselineListeners);
  viewController.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  expect((viewController as any).messageHandlers.size).toBe(baselineListeners + 1);
});

test('Removes the event listener callback from internal state', () => {
  const viewController = createViewController();
  const onHandlerStub = jest.fn();

  expect((viewController as any).messageHandlers.size).toBe(baselineListeners);
  const remove = viewController.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  expect((viewController as any).messageHandlers.size).toBe(baselineListeners + 1);
  remove();
  expect((viewController as any).messageHandlers.size).toBe(baselineListeners);
});
