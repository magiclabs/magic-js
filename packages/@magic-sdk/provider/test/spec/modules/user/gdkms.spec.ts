import browserEnv from '@ikscodes/browser-env';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Encrypt `magic_auth_encrypt_v1`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  const message = 'hello world';

  magic.user.encryptWithPrivateKey(message);

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_encrypt_v1');
  expect(requestPayload.params).toEqual([{ message }]);
});

test('Decrypt `magic_auth_decrypt_v1`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  const cipherText = 'XJD/1238t';

  magic.user.decryptWithPrivateKey(cipherText);

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe('magic_auth_decrypt_v1');
  expect(requestPayload.params).toEqual([{ cipherText }]);
});
