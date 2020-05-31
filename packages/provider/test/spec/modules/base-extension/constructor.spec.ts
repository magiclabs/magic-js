/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { createExtensionNotInitializedError, MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { createMagicSDK } from '../../../factories';

/**
 * We have a circular dependency breaking test code when referencing
 * constructors extending `BaseModule`. Rather than refactor the SDK code, it
 * was quicker to fix the issue with JS getters.
 */
const ModuleCtors = {
  get Extension() {
    return (require('../../../../src/modules/base-extension') as typeof import('../../../../src/modules/base-extension'))
      .Extension;
  },

  get BaseModule() {
    return (require('../../../../src/modules/base-module') as typeof import('../../../../src/modules/base-module'))
      .BaseModule;
  },
};

test.beforeEach(t => {
  browserEnv.restore();
});

test.serial('Initialize `Extension`', t => {
  const baseExtension = new (ModuleCtors.Extension as any)();

  t.true(baseExtension instanceof ModuleCtors.Extension);
  t.true(baseExtension instanceof ModuleCtors.BaseModule);
  t.is(baseExtension.createJsonRpcRequestPayload, createJsonRpcRequestPayload);
  t.is(baseExtension.standardizeJsonRpcRequestPayload, standardizeJsonRpcRequestPayload);
});

test.serial('Disallows `Extension.sdk` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (ModuleCtors.Extension as any)();

  const expectedErr = createExtensionNotInitializedError('sdk');
  const err: MagicSDKError = t.throws(() => baseExtension.sdk);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.sdk);
});

test.serial('Disallows `Extension.request` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (ModuleCtors.Extension as any)();

  const expectedErr = createExtensionNotInitializedError('request');
  const err: MagicSDKError = t.throws(() => baseExtension.request);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.request);
});

test.serial('Disallows `Extension.transport` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (ModuleCtors.Extension as any)();

  const expectedErr = createExtensionNotInitializedError('transport');
  const err: MagicSDKError = t.throws(() => baseExtension.transport);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.transport);
});

test.serial('Disallows `Extension.overlay` access before extension is initialized', t => {
  const sdk = createMagicSDK();
  const baseExtension = new (ModuleCtors.Extension as any)();

  const expectedErr = createExtensionNotInitializedError('overlay');
  const err: MagicSDKError = t.throws(() => baseExtension.overlay);
  t.is(err.code, expectedErr.code);
  t.is(err.message, expectedErr.message);

  baseExtension.init(sdk);

  t.notThrows(() => baseExtension.overlay);
});
