import { Extension } from 'magic-sdk';
import { UserInformation } from './types';

export class ConnectExtension extends Extension.Internal<'connect', any> {
  name = 'connect' as const;
  config: any = {
    mc: true,
  };

  public showWallet() {
    const requestPayload = this.utils.createJsonRpcRequestPayload('mc_wallet');
    return this.request<boolean>(requestPayload);
  }

  public requestUserInfo() {
    const requestPayload = this.utils.createJsonRpcRequestPayload('mc_request_user_info');
    return this.request<boolean>(requestPayload);
  }

  public disconnect() {
    const requestPayload = this.utils.createJsonRpcRequestPayload('mc_disconnect');
    return this.request<boolean>(requestPayload);
  }
}

export * from './types';
