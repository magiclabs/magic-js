import '../../../setup';

import test from 'ava';
import { standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { getPayloadIdStub } from '../../../lib/stubs';

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Mutate the payload object given as the argument.
 */
test('#01', t => {
  const originalPayload = {};
  const finalPayload = standardizeJsonRpcRequestPayload(originalPayload);
  t.is(originalPayload, finalPayload);
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, preserving the current value of
 *   `payload.jsonrpc`.
 */
test('#02', t => {
  const payload = standardizeJsonRpcRequestPayload({ jsonrpc: 'hello world' });
  t.is(payload.jsonrpc, 'hello world');
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, replacing the missing value of
 *   `payload.jsonrpc`.
 */
test('#03', t => {
  const payload = standardizeJsonRpcRequestPayload({});
  t.is(payload.jsonrpc, '2.0');
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, replacing the value of `payload.id`.
 */
test('#04', t => {
  const randomIdStub = getPayloadIdStub();
  randomIdStub.returns(999);

  const payload = standardizeJsonRpcRequestPayload({ jsonrpc: '2.0', method: 'test', params: ['hello world'] });

  const expectedPayload = {
    jsonrpc: '2.0',
    id: 999,
    method: 'test',
    params: ['hello world'],
  };

  t.deepEqual(payload, expectedPayload);
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, preserving the current value of
 *   `payload.method`.
 */
test('#05', t => {
  const payload = standardizeJsonRpcRequestPayload({ method: 'test' });
  t.is(payload.method, 'test');
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, replacing the missing value of
 *   `payload.method`.
 */
test('#06', t => {
  const payload = standardizeJsonRpcRequestPayload({});
  t.is(payload.method, 'noop');
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, preserving the current value of
 *   `payload.params`.
 */
test('#07', t => {
  const payload = standardizeJsonRpcRequestPayload({ params: ['test'] });
  t.deepEqual(payload.params, ['test']);
});

/**
 * `standardizeJsonRpcRequestPayload`
 *
 * Action must:
 * - Create a JSON RPC payload, replacing the missing value of
 *   `payload.params`.
 */
test('#08', t => {
  const payload = standardizeJsonRpcRequestPayload({});
  t.deepEqual(payload.params, []);
});
