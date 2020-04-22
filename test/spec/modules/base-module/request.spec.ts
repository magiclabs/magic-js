import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { JsonRpcResponse } from '../../../../src/core/json-rpc';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPayloadTransport, createIframeController } from '../../../factories';
import { JsonRpcRequestPayload } from '../../../../src/types';
import { MagicRPCError, MagicSDKError } from '../../../../src/core/sdk-exceptions';

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
  // Silence the "duplicate iframes" warning.
  browserEnv.stub('console.warn', () => {});
});

test.serial('Resolves with a successful response', async t => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyResult('hello world');

  postStub.returns(response);

  const result = await baseModule.request(requestPayload);

  t.is(result, 'hello world');
});

test.serial('Rejects with a `MagicRPCError` upon request failed', async t => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload).applyError({ code: -32603, message: 'hello world' });

  postStub.returns(response);

  const err: MagicRPCError = await t.throwsAsync(baseModule.request(requestPayload));
  t.true(err instanceof MagicRPCError);
  t.is(err.code, -32603);
  t.is(err.message, 'Magic RPC Error: [-32603] hello world');
});

test.serial('Rejects with `MALFORMED_RESPONSE` error if response cannot be parsed correctly', async t => {
  const { baseModule, postStub } = createBaseModule();

  const response = new JsonRpcResponse(requestPayload);

  postStub.returns(response);

  const err: MagicSDKError = await t.throwsAsync(baseModule.request(requestPayload));
  t.true(err instanceof MagicSDKError);
  t.is(err.code, 'MALFORMED_RESPONSE');
  t.is(err.message, 'Magic SDK Error: [MALFORMED_RESPONSE] Response from the Magic iframe is malformed.');
});
