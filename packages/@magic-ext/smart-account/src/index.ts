import { Extension } from '@magic-sdk/provider';
import {
  SmartAccountPayloadMethod,
  SmartAccountConfig,
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

  public sendTransaction(params: SmartAccountSendTransactionParams): Promise<SmartAccountSendTransactionResponse> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SmartAccountPayloadMethod.SendTransaction, [params]);
    return this.request<SmartAccountSendTransactionResponse>(requestPayload);
  }
}

export * from './types';
