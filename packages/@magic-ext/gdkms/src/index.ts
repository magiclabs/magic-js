import { MagicExtension, MagicPayloadMethod } from '@magic-sdk/commons';

export class GDKMSExtension extends MagicExtension<'gdkms', any> {
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
