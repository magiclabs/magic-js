import { Extension } from '@magic-sdk/commons';
import { CustomAuthPayloadMethod } from '@magic-ext/connect';

export class CustomAuth extends Extension.Internal<'customAuth', any> {
  name = 'customAuth' as const;
  config: any = {};

  public setAuthorizationJWT() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(CustomAuthPayloadMethod.SetAuthorizationJwt);
    return this.request<boolean>(requestPayload);
  }
}
