import { MultichainExtension } from '@magic-sdk/provider';
import { ConfluxPayloadMethod, ConfluxConfig } from './types';

export class ConfluxExtension extends MultichainExtension<'conflux'> {
  name = 'conflux' as const;

  constructor(public confluxConfig: ConfluxConfig) {
    super({
      chainType: 'CONFLUX',
      options: {
        rpcUrl: confluxConfig.rpcUrl,
        networkId: confluxConfig.networkId,
      },
    });
  }

  public async sendTransaction(txObject: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(ConfluxPayloadMethod.ConfluxSendTransaction, txObject));
  }
}
