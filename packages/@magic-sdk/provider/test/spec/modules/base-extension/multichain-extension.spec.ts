import { MultichainExtension } from '../../../../src/modules/base-extension';
import { createMagicSDK } from '../../../factories';
import { MagicPayloadMethod } from '@magic-sdk/types';

class TestMultichainExtension extends MultichainExtension<'test'> {
  name = 'test' as const;
}

beforeEach(() => {
  jest.resetAllMocks();
});

test('Initializes MultichainExtension with config', () => {
  const config = { chainType: 'TEST', rpcUrl: 'http://test.com' };
  const extension = new TestMultichainExtension(config);

  expect(extension.config).toBe(config);
  expect(extension.chain).toBe('TEST');
  expect(extension.name).toBe('test');
});

test('getPublicAddress calls request with correct payload', async () => {
  const config = { chainType: 'TEST', rpcUrl: 'http://test.com' };
  const extension = new TestMultichainExtension(config);
  const sdk = createMagicSDK();

  // Initialize the extension
  extension.init(sdk);

  // Mock the request method
  const requestSpy = jest.spyOn(extension as any, 'request').mockResolvedValue('0x123');

  const result = await extension.getPublicAddress();

  expect(requestSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      method: MagicPayloadMethod.GetMultichainPublicAddress,
      params: [{ chain: 'TEST' }],
    }),
  );
  expect(result).toBe('0x123');
});

test('revealPrivateKey calls request with correct payload', async () => {
  const config = { chainType: 'TEST', rpcUrl: 'http://test.com' };
  const extension = new TestMultichainExtension(config);
  const sdk = createMagicSDK();

  // Initialize the extension
  extension.init(sdk);

  // Mock the request method
  const requestSpy = jest.spyOn(extension as any, 'request').mockResolvedValue(true);

  const result = await extension.revealPrivateKey();

  expect(requestSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      method: MagicPayloadMethod.RevealPK,
      params: [{ chain: 'TEST' }],
    }),
  );
  expect(result).toBe(true);
});

test('derives chain from config.chainType', () => {
  const config = { chainType: 'ETHEREUM', rpcUrl: 'http://test.com' };
  const extension = new TestMultichainExtension(config);

  expect(extension.chain).toBe('ETHEREUM');
});
