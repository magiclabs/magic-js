import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { BaseModule } from '../../../../src/modules/base-module';
import { Extension } from '../../../../src/modules/base-extension';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `Extension`', t => {
  const baseExtension = new (Extension as any)();

  t.true(baseExtension instanceof Extension);
  t.true(baseExtension instanceof BaseModule);
  t.is(baseExtension.createJsonRpcRequestPayload, createJsonRpcRequestPayload);
  t.is(baseExtension.standardizeJsonRpcRequestPayload, standardizeJsonRpcRequestPayload);
});
