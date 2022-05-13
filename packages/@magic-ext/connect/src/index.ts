import { Extension } from 'magic-sdk';
import { UserInformation } from './types';

export class ConnectExtension extends Extension.Internal<'connect', any> {
  name = 'connect' as const;
  config: any = {
    mc: true,
  };

  public showWallet() {
    const requestPayload = this.utils.createJsonRpcRequestPayload('magic_auth_settings');
    return this.request<boolean>(requestPayload);
  }

  public async promptUserForInformation(): Promise<UserInformation> {
    // implement me
    return {} as UserInformation;
  }

  public disconnect(): void {
    // implement me
  }
}

export * from './types';
