import { Extension, MagicPayloadMethod } from '@magic-sdk/commons';

export class GDKMSExtension extends Extension.Internal<'gdkms', any> {
  name = 'gdkms' as const;
  config: any = {};

  public encryptWithPrivateKey(message: string, opts = {}) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicPayloadMethod.EncryptV1, [{ message }]);
    return this.request<string>(requestPayload);
  }

  public decryptWithPrivateKey(ciphertext: string, opts = {}) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicPayloadMethod.DecryptV1, [{ ciphertext }]);
    return this.request<string>(requestPayload);
  }
}
