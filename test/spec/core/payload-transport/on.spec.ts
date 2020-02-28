import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { MagicIncomingWindowMessage } from '../../../../src/types';
import { createPayloadTransport } from '../../../lib/factories';
import { MSG_TYPES } from '../../../lib/constants';

test.beforeEach(t => {
  browserEnv();
});

/**
 * Adds the event listener callback to the internal state.
 *
 * Action Must:
 * - Increase the size of the underlying `Set` by 1.
 */
test('#01', t => {
  const transport = createPayloadTransport();
  const onHandlerStub = sinon.stub();

  t.is((transport as any).messageHandlers.size, 0);
  transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  t.is((transport as any).messageHandlers.size, 1);
});

/**
 * Removes the event listener callback from internal state.
 *
 * Action Must:
 * - Increase the size of the underlying `Set` by 1
 * - Then... decrease the size of the underlying `Set` by 1
 */
test('#02', t => {
  const transport = createPayloadTransport();
  const onHandlerStub = sinon.stub();

  t.is((transport as any).messageHandlers.size, 0);
  const remove = transport.on(MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE, onHandlerStub);
  t.is((transport as any).messageHandlers.size, 1);
  remove();
  t.is((transport as any).messageHandlers.size, 0);
});
