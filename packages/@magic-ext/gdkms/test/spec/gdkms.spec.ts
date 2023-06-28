import browserEnv from '@ikscodes/browser-env';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { createMagicSDKWithExtension } from '../../../../@magic-sdk/provider/test/factories';
import { GDKMSExtension } from '../../src';

beforeEach(() => {
  browserEnv.restore();
});

test('Construct Encrypt Request with `magic_auth_encrypt_v1`', async () => {
  const magic = createMagicSDKWithExtension({}, [new GDKMSExtension()]);
  magic.gdkms.request = jest.fn();

  const message = 'hello world';

  magic.gdkms.encryptWithPrivateKey(message);

  const requestPayload = magic.gdkms.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(MagicPayloadMethod.EncryptV1);
  expect(requestPayload.params).toEqual([{ message }]);
});

test('Construct Decrypt Request with `magic_auth_decrypt_v1`', async () => {
  const magic = createMagicSDKWithExtension({}, [new GDKMSExtension()]);
  magic.gdkms.request = jest.fn();

  const ciphertext = 'XJD/1238t';

  magic.gdkms.decryptWithPrivateKey(ciphertext);

  const requestPayload = magic.gdkms.request.mock.calls[0][0];
  expect(requestPayload.method).toBe(MagicPayloadMethod.DecryptV1);
  expect(requestPayload.params).toEqual([{ ciphertext }]);
});
