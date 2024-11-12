import { Extension } from '@magic-sdk/commons';
import {
  KadenaConfig,
  KadenaGetInfoResponse,
  KadenaPayloadMethod,
  KadenaSignTransactionResponse,
  LoginWithSpireKeyResponse,
} from './types';

export class KadenaExtension extends Extension.Internal<'kadena'> {
  name = 'kadena' as const;
  config = {};

  constructor(public kadenaConfig: KadenaConfig) {
    super();

    this.config = {
      chainType: 'KADENA',
      rpcUrl: kadenaConfig.rpcUrl,
      chainId: kadenaConfig.chainId,
      options: {
        network: kadenaConfig.network,
        networkId: kadenaConfig.networkId,
        createAccountsOnChain: Boolean(kadenaConfig.createAccountsOnChain),
      },
    };
  }

  public signTransaction(hash: string): Promise<KadenaSignTransactionResponse> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }

  public loginWithSpireKey(): Promise<LoginWithSpireKeyResponse> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaLoginWithSpireKey, []);
    return this.request<LoginWithSpireKeyResponse>(requestPayload);
  }

  public getInfo(): Promise<KadenaGetInfoResponse> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaGetInfo, []);
    return this.request<KadenaGetInfoResponse>(requestPayload);
  }
}
