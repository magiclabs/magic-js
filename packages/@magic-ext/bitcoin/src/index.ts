import { MultichainExtension } from '@magic-sdk/provider';
import { BitcoinConfig, BitcoinPayloadMethod } from './types';

export class BitcoinExtension extends MultichainExtension<'bitcoin'> {
  name = 'bitcoin' as const;

  constructor(public bitcoinConfig: BitcoinConfig) {
    super({
      rpcUrl: bitcoinConfig.rpcUrl,
      chainType: 'BITCOIN',
      options: {
        network: bitcoinConfig.network,
      },
    });
  }

  public async signTransaction(txn: string, inputIndex: number) {
    return this.request(
      this.utils.createJsonRpcRequestPayload(BitcoinPayloadMethod.BitcoinSignTransaction, [txn, inputIndex]),
    );
  }
}
