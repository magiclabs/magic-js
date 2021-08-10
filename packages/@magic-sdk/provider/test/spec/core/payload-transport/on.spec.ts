import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { MagicIncomingWindowMessage } from '@magic-sdk/types';
import { createPayloadTransport } from '../../../factories';

beforeEach(() => {
  browserEnv();
});

test('Adds the event listener callback to the internal state', () => {
  const transport = createPayloadTransport();
  const onHandlerStub = sinon.stub();

  expect((transport as any).messageHandlers.size).toBe(0);
  transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  expect((transport as any).messageHandlers.size).toBe(1);
});

test('Removes the event listener callback from internal state', () => {
  const transport = createPayloadTransport();
  const onHandlerStub = sinon.stub();

  expect((transport as any).messageHandlers.size).toBe(0);
  const remove = transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  expect((transport as any).messageHandlers.size).toBe(1);
  remove();
  expect((transport as any).messageHandlers.size).toBe(0);
});
