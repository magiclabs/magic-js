import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../../../../src/core/json-rpc';
import { createExtensionNotInitializedError } from '../../../../src/core/sdk-exceptions';
import { ConcreteExtension, createMagicSDK } from '../../../factories';
import { BaseExtension, Extension } from '../../../../src/modules/base-extension';
import { BaseModule } from '../../../../src/modules/base-module';
import { createPromiEvent, encodeJSON, decodeJSON, isPromiEvent } from '../../../../src/util';

beforeEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

test('Initialize `Extension`', () => {
  // @ts-ignore TS2511
  const baseExtension = new BaseExtension();

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
  // @ts-ignore TS2511
  const baseExtension = new BaseExtension();

  const expectedErr = createExtensionNotInitializedError('sdk');
  expect(() => baseExtension.sdk).toThrow(expectedErr);

  baseExtension.init(sdk);
  expect(() => baseExtension.sdk).not.toThrow();
});

test('Disallows `Extension.request` access before extension is initialized', () => {
  const sdk = createMagicSDK();
  // @ts-ignore TS2511
  const baseExtension = new BaseExtension();

  const expectedErr = createExtensionNotInitializedError('request');
  expect(() => baseExtension.request).toThrow(expectedErr);

  baseExtension.init(sdk);
  expect(() => baseExtension.request).not.toThrow();
});

test('Disallows `Extension.overlay` access before extension is initialized', () => {
  const sdk = createMagicSDK();
  // @ts-ignore TS2511
  const baseExtension = new BaseExtension();

  const expectedErr = createExtensionNotInitializedError('overlay');
  expect(() => baseExtension.overlay).toThrow(expectedErr);

  baseExtension.init(sdk);
  expect(() => baseExtension.overlay).not.toThrow();
});
