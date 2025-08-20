import { MultichainExtension } from '@magic-sdk/commons';
import { SuiConfig, SuiPayloadMethod } from './types';

export class SuiExtension extends MultichainExtension<'sui'> {
  name = 'sui' as const;

  constructor(public suiConfig: SuiConfig) {
    super({
      rpcUrl: suiConfig.rpcUrl,
      chainType: 'SUI',
    });
  }

  public signAndSendTransaction(params: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(SuiPayloadMethod.SuiSignAndSendTransaction, params));
  }
}
