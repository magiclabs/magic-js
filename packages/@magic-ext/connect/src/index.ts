import { Extension } from 'magic-sdk';
import { MagicConnectPayloadMethod } from './types';

export class ConnectExtension extends Extension.Internal<'connect', any> {
  name = 'connect' as const;
  config: any = {
    mc: true,
  };

  public getWalletType() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.GetWalletType);
    return this.request<boolean>(requestPayload);
  }

  public showWallet() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.ShowWallet);
    return this.request<boolean>(requestPayload);
  }

  public requestUserInfo() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.RequestUserInfo);
    return this.request<boolean>(requestPayload);
  }

  public disconnect() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }
}

export * from './types';
