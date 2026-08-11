export interface BitcoinConfig {
  rpcUrl: string;
  network: string;
}

export enum BitcoinPayloadMethod {
  BitcoinSignTransaction = 'btc_signTransaction',
}

/**
 * A UTXO to spend. `value` is in BTC (not satoshis) and is required: the enclave
 * needs each input's value to compute its segwit (BIP143) sighash. `tx_num` is
 * the output index (vout) of the UTXO within its source transaction.
 */
export interface BitcoinTransactionInput {
  txid: string;
  tx_num: number;
  value: number;
  address?: string;
}

/** A transaction output. `value` is in BTC (not satoshis). */
export interface BitcoinTransactionOutput {
  address: string;
  value: number;
}

export interface BitcoinSignedTransaction {
  /** The broadcast-ready, fully-signed transaction as hex. */
  signedTransaction: string;
  /** The transaction hash (txid). */
  transactionHash: string;
}
