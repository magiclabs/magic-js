import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { BaseModule } from '../../../../src/modules/base-module';
import { Extension } from '../../../../src/modules/base-extension';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { createExtensionNotInitializedError, MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { createMagicSDK } from '../../../factories';

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

test.serial('Disallows `Extension.sdk` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('sdk');
  const err: MagicSDKError = t.throws(() => baseExtension.sdk);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.sdk);
});

test.serial('Disallows `Extension.request` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('request');
  const err: MagicSDKError = t.throws(() => baseExtension.request);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.request);
});

test.serial('Disallows `Extension.transport` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('transport');
  const err: MagicSDKError = t.throws(() => baseExtension.transport);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.transport);
});

test.serial('Disallows `Extension.overlay` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('overlay');
  const err: MagicSDKError = t.throws(() => baseExtension.overlay);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.overlay);
});
