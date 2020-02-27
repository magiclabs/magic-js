import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { JsonRpcResponse, JsonRpcErrorWrapper } from '../../../../src/core/json-rpc';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPayloadTransport, createIframeController } from '../../../lib/factories';
import { JsonRpcRequestPayload } from '../../../../src/types';

function createBaseModule() {
  const payloadTransport = createPayloadTransport();
  const iframeController = createIframeController();

  const postStub = sinon.stub();

  (payloadTransport as any).post = postStub;

  const baseModule: any = new (BaseModule as any)(
    () => payloadTransport,
    () => iframeController,
  );

  return { baseModule, postStub };
}

const requestPayload: JsonRpcRequestPayload = {
  jsonrpc: '2.0',
  id: 1,
  params: [],
  method: 'test',
};

test.beforeEach(t => {
  browserEnv.restore();
});

/**
 * `BaseModule.request`
 *
 * Action Must:
 * - Execute `BaseModule.request`
 * - Resolve with response
 */
test.serial('#01', async t => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(response);

  const result = await baseModule.request(requestPayload);

  t.is(result, 'hello world');
});

/**
 * `BaseModule.request`
 *
 * Action Must:
 * - Execute `BaseModule.request`
 * - Reject with `JsonRpcErrorWrapper`
 */
test.serial('#02', async t => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyError({ code: 1, message: 'hello world' });

  postStub.returns(response);

  const err: JsonRpcErrorWrapper = await t.throwsAsync(baseModule.request(requestPayload));
  t.is(err.code, 1);
  t.is(err.message, 'hello world');
});

/**
 * `BaseModule.request`
 *
 * Action Must:
 * - Execute `BaseModule.request`
 * - Reject with `MALFORMED_RESPONSE` error
 */
test.serial('#03', async t => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload);

  postStub.returns(response);

  const err: JsonRpcErrorWrapper = await t.throwsAsync(baseModule.request(requestPayload));
  t.is(err.code, 'MALFORMED_RESPONSE');
  t.is(err.message, 'Magic SDK Error: [MALFORMED_RESPONSE] Response from the Magic iframe is malformed.');
});
