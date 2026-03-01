import { Extension } from '@magic-sdk/provider';
import {
  SmartAccountPayloadMethod,
  SmartAccountDelegateParams,
  SmartAccountDelegateResponse,
  SmartAccountSendTransactionParams,
  SmartAccountSendTransactionResponse,
} from './types';

export class SmartAccountExtension extends Extension.Internal<'smartAccount'> {
  name = 'smartAccount' as const;
  config = {};

  constructor() {
    super();
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
