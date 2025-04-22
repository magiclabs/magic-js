import { MagicExtension } from '@magic-sdk/commons';
import { SuiConfig, SuiPayloadMethod } from './types';

export class SuiExtension extends MagicExtension<'sui', any> {
  name = 'sui' as const;
  config: any = {};

  constructor(public suiConfig: SuiConfig) {
    super();
    this.config = {
      rpcUrl: suiConfig.rpcUrl,
      chainType: 'SUI',
    };
  }

  public signAndSendTransaction(params: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(SuiPayloadMethod.SuiSignAndSendTransaction, params));
  }
}
