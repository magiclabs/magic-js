import { BaseExtension } from '../../../../src/modules/base-extension';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  jest.resetAllMocks();
});

test('`baseExtension.init` is no-op if already initialized', () => {
  const sdk = createMagicSDK();
  // @ts-ignore
  const baseExtension = new BaseExtension();

  baseExtension.init(sdk);
  expect(baseExtension.sdk).toBe(sdk);

  baseExtension.init('hello world');
  expect(baseExtension.sdk).toBe(sdk);
});
