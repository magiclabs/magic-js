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
   *
   * Input and output values are non-negative BTC amounts with at most eight
   * decimal places. Calculate fees and change in integer satoshis, then convert
   * to BTC for this method. Total outputs must not exceed total inputs; the
   * difference is the fee. There is no minimum or maximum
   * signing fee, and no dust threshold is enforced. The caller must check the
   * fee rate (sats/vB) and output amounts against the broadcasting node's
   * policy. Signing does not guarantee relay, confirmation, or UTXO availability.
   * Invalid transaction parameters reject with a MagicRPCError describing the
   * validation failure.
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
