import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { createMagicSDK } from '../../../factories';

beforeEach(() => {
  browserEnv.restore();
});

test('Construct Encrypt Request with `magic_auth_encrypt_v1`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  const message = 'hello world';

  magic.user.encryptWithPrivateKey(message);

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(MagicPayloadMethod.EncryptV1);
  expect(requestPayload.params).toEqual([{ message }]);
});

test('Construct Decrypt Request with `magic_auth_decrypt_v1`', async () => {
  const magic = createMagicSDK();
  magic.user.request = jest.fn();

  const cipherText = 'XJD/1238t';

  magic.user.decryptWithPrivateKey(cipherText);

  const requestPayload = magic.user.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(MagicPayloadMethod.DecryptV1);
  expect(requestPayload.params).toEqual([{ cipherText }]);
});
