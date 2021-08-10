import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicIncomingWindowMessage } from '@magic-sdk/types';
import { createPayloadTransport } from '../../../factories';

test.beforeEach((t) => {
  browserEnv();
});

test('Adds the event listener callback to the internal state', (t) => {
  const transport = createPayloadTransport();
  const onHandlerStub = sinon.stub();

  t.is((transport as any).messageHandlers.size, 0);
  transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  t.is((transport as any).messageHandlers.size, 1);
});

test('Removes the event listener callback from internal state', (t) => {
  const transport = createPayloadTransport();
  const onHandlerStub = sinon.stub();

  t.is((transport as any).messageHandlers.size, 0);
  const remove = transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  t.is((transport as any).messageHandlers.size, 1);
  remove();
  t.is((transport as any).messageHandlers.size, 0);
});
