import { MultichainExtension } from '@magic-sdk/provider';
import {
  BitcoinConfig,
  BitcoinPayloadMethod,
  BitcoinSignedTransaction,
  BitcoinTransactionInput,
  BitcoinTransactionOutput,
} from './types';

export * from './types';

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

  /**
   * Signs a Bitcoin transaction in the TEE. The caller supplies fully-formed
   * inputs (the UTXOs to spend, each with its value) and outputs; coin selection,
   * fee, and change are the caller's responsibility. Resolves with the
   * broadcast-ready signed transaction.
   */
  public async signTransaction(
    inputs: BitcoinTransactionInput[],
    outputs: BitcoinTransactionOutput[],
  ): Promise<BitcoinSignedTransaction> {
    return this.request<BitcoinSignedTransaction>(
      this.utils.createJsonRpcRequestPayload(BitcoinPayloadMethod.BitcoinSignTransaction, [{ inputs, outputs }]),
    );
  }
}
