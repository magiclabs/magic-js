import { Extension } from '@magic-sdk/commons';
import { MagicOpenIdConnectPayloadMethod, LoginWithOpenIdParams } from './types';

export class OpenIdExtension extends Extension.Internal<'openid', any> {
  name = 'openid' as const;
  config: any = {};

  public loginWithOIDC(params: LoginWithOpenIdParams) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicOpenIdConnectPayloadMethod.LoginWithOIDC, [
      params,
    ]);
    return this.request<string>(requestPayload);
  }
}

export * from './types';
