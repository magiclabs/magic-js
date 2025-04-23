import { Extension } from '@magic-sdk/commons';
import { BitcoinConfig, BitcoinPayloadMethod } from './types';

export class BitcoinExtension extends Extension.Internal<'bitcoin', any> {
  name = 'bitcoin' as const;
  config: any = {};

  constructor(public bitcoinConfig: BitcoinConfig) {
    super();

    this.config = {
      rpcUrl: bitcoinConfig.rpcUrl,
      chainType: 'BITCOIN',
      options: {
        network: bitcoinConfig.network,
      },
    };
  }

  public async signTransaction(txn: string, inputIndex: number) {
    return this.request(
      this.utils.createJsonRpcRequestPayload(BitcoinPayloadMethod.BitcoinSignTransaction, [txn, inputIndex]),
    );
  }
}
