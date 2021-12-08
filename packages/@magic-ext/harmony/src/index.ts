import { Extension } from '@magic-sdk/commons';
import { HarmonyPayloadMethod, HarmonyConfig } from './types';

export class HarmonyExtension extends Extension.Internal<'harmony', any> {
  name = 'harmony' as const;
  config: any = {};

  constructor(public harmonyConfig: HarmonyConfig) {
    super();

    this.config = {
      rpcUrl: harmonyConfig.rpcUrl,
      chainType: 'HARMONY',
      options: {
        chainId: harmonyConfig.chainId,
      },
    };
  }

  public async sendTransaction(params: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(HarmonyPayloadMethod.HarmonySignTransaction, params));
  }
}
