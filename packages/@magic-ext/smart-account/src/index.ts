import { Extension } from '@magic-sdk/provider';
import {
  SmartAccountPayloadMethod,
  SmartAccountConfig,
  SmartAccountDelegateParams,
  SmartAccountDelegateResponse,
  SmartAccountSendTransactionParams,
  SmartAccountSendTransactionResponse,
} from './types';

export class SmartAccountExtension extends Extension.Internal<'smartAccount', SmartAccountConfig> {
  name = 'smartAccount' as const;
  config: SmartAccountConfig;

  constructor(config: SmartAccountConfig) {
    super();
    this.config = config;
  }

  public delegate(params?: SmartAccountDelegateParams): Promise<SmartAccountDelegateResponse> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SmartAccountPayloadMethod.Delegate, [params]);
    return this.request<SmartAccountDelegateResponse>(requestPayload);
  }

  public sendTransaction(params: SmartAccountSendTransactionParams): Promise<SmartAccountSendTransactionResponse> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SmartAccountPayloadMethod.SendTransaction, [params]);
    return this.request<SmartAccountSendTransactionResponse>(requestPayload);
  }
}

export * from './types';
