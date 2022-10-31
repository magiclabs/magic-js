import { Extension } from 'magic-sdk';
import { MagicConnectPayloadMethod, WalletInfo } from './types';

export class ConnectExtension extends Extension.Internal<'connect', any> {
  name = 'connect' as const;
  config: any = {
    mc: true,
  };

  public getWalletInfo() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.GetWalletInfo);
    return this.request<WalletInfo>(requestPayload);
  }

  public showWallet() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.ShowWallet);
    return this.request<boolean>(requestPayload);
  }

  public requestUserInfo(options?: { isResponseRequired?: boolean }) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(
      MagicConnectPayloadMethod.RequestUserInfo,
      options ? [options] : [],
    );
    return this.request<boolean>(requestPayload);
  }

  public disconnect() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicConnectPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }
}

export * from './types';
