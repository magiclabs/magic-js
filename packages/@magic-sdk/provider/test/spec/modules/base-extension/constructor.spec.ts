/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { createExtensionNotInitializedError, MagicSDKError } from '../../../../src/core/sdk-exceptions';
import { createMagicSDK } from '../../../factories';
import { Extension } from '../../../../src/modules/base-extension';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPromiEvent, encodeJSON, decodeJSON, isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  browserEnv.restore();
});

test('Initialize `Extension`', () => {
  const baseExtension = new (Extension as any)();

  expect(baseExtension instanceof Extension).toBe(true);
  expect(baseExtension instanceof BaseModule).toBe(true);
  expect(baseExtension.utils.createJsonRpcRequestPayload).toBe(createJsonRpcRequestPayload);
  expect(baseExtension.utils.standardizeJsonRpcRequestPayload).toBe(standardizeJsonRpcRequestPayload);
  expect(baseExtension.utils.createPromiEvent).toBe(createPromiEvent);
  expect(baseExtension.utils.isPromiEvent).toBe(isPromiEvent);
  expect(baseExtension.utils.decodeJSON).toBe(decodeJSON);
  expect(baseExtension.utils.encodeJSON).toBe(encodeJSON);
});

test('Disallows `Extension.sdk` access before extension is initialized', () => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('sdk');
  const err: MagicSDKError = expect(() => baseExtension.sdk).toThrow();
  expect(err.code).toBe(expectedErr.code);
  expect(err.message).toBe(expectedErr.message);

  baseExtension.init(sdk);

  expect(() => baseExtension.sdk).not.toThrow();
});

test('Disallows `Extension.request` access before extension is initialized', () => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('request');
  const err: MagicSDKError = expect(() => baseExtension.request).toThrow();
  expect(err.code).toBe(expectedErr.code);
  expect(err.message).toBe(expectedErr.message);

  baseExtension.init(sdk);

  expect(() => baseExtension.request).not.toThrow();
});

test('Disallows `Extension.transport` access before extension is initialized', () => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('transport');
  const err: MagicSDKError = expect(() => baseExtension.transport).toThrow();
  expect(err.code).toBe(expectedErr.code);
  expect(err.message).toBe(expectedErr.message);

  baseExtension.init(sdk);

  expect(() => baseExtension.transport).not.toThrow();
});

test('Disallows `Extension.overlay` access before extension is initialized', () => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  const expectedErr = createExtensionNotInitializedError('overlay');
  const err: MagicSDKError = expect(() => baseExtension.overlay).toThrow();
  expect(err.code).toBe(expectedErr.code);
  expect(err.message).toBe(expectedErr.message);

  baseExtension.init(sdk);

  expect(() => baseExtension.overlay).not.toThrow();
});
