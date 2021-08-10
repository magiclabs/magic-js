/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { createExtensionNotInitializedError, MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { createMagicSDK } from '../../../factories';
import { Extension } from '../../../../src/modules/base-extension';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPromiEvent, encodeJSON, decodeJSON, isPromiEvent } from '../../../../src/util';

test.beforeEach((t) => {
  browserEnv.restore();
});

test.serial('Initialize `Extension`', (t) => {
  const baseExtension = new (Extension as any)();

  t.true(baseExtension instanceof Extension);
  t.true(baseExtension instanceof BaseModule);
  t.is(baseExtension.utils.createJsonRpcRequestPayload, createJsonRpcRequestPayload);
  t.is(baseExtension.utils.standardizeJsonRpcRequestPayload, standardizeJsonRpcRequestPayload);
  t.is(baseExtension.utils.createPromiEvent, createPromiEvent);
  t.is(baseExtension.utils.isPromiEvent, isPromiEvent);
  t.is(baseExtension.utils.decodeJSON, decodeJSON);
  t.is(baseExtension.utils.encodeJSON, encodeJSON);
});

test.serial('Disallows `Extension.sdk` access before extension is initialized', (t) => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('sdk');
  const err: MagicSDKError = t.throws(() => baseExtension.sdk);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.sdk);
});

test.serial('Disallows `Extension.request` access before extension is initialized', (t) => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('request');
  const err: MagicSDKError = t.throws(() => baseExtension.request);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.request);
});

test.serial('Disallows `Extension.transport` access before extension is initialized', (t) => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('transport');
  const err: MagicSDKError = t.throws(() => baseExtension.transport);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.transport);
});

test.serial('Disallows `Extension.overlay` access before extension is initialized', (t) => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('overlay');
  const err: MagicSDKError = t.throws(() => baseExtension.overlay);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.overlay);
});
