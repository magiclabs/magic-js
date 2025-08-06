import { MultichainExtension } from '@magic-sdk/commons';
import { HarmonyPayloadMethod, HarmonyConfig } from './types';

export class HarmonyExtension extends MultichainExtension<'harmony'> {
  name = 'harmony' as const;

  constructor(public harmonyConfig: HarmonyConfig) {
    super(
      {
        rpcUrl: harmonyConfig.rpcUrl,
        chainType: 'HARMONY',
        options: {
          chainId: harmonyConfig.chainId,
        },
      },
      'HARMONY',
    );
  }

  public async sendTransaction(params: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(HarmonyPayloadMethod.HarmonySignTransaction, params));
  }
}
