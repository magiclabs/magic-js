import { Extension } from '@magic-sdk/commons';

import { SerializeConfig, Transaction, VersionedTransaction } from '@solana/web3.js';
import { SolanaConfig } from './type';
import { SOLANA_PAYLOAD_METHODS } from './constants';

export class SolanaExtension extends Extension.Internal<'solana', any> {
  name = 'solana' as const;
  config: any = {};

  constructor(public solanaConfig: SolanaConfig) {
    super();

    this.config = {
      rpcUrl: solanaConfig.rpcUrl,
      chainType: 'SOLANA',
    };
  }

  public signTransaction = (transaction: Transaction | VersionedTransaction, serializeConfig?: SerializeConfig) => {
    return this.request<{ rawTransaction: Uint8Array }>({
      id: 42,
      jsonrpc: '2.0',
      method: SOLANA_PAYLOAD_METHODS.SIGN_TRANSACTION,
      params: {
        type: transaction instanceof Transaction ? 'legacy' : 0,
        serialized: transaction.serialize(serializeConfig),
        serializeConfig,
      },
    });
  };

  public signMessage = (message: string | Uint8Array) => {
    return this.request<Uint8Array>({
      id: 42,
      jsonrpc: '2.0',
      method: SOLANA_PAYLOAD_METHODS.SIGN_MESSAGE,
      params: {
        message,
      },
    });
  };

  public partialSignTransaction = (
    transaction: Transaction | VersionedTransaction,
    serializeConfig?: SerializeConfig,
  ) => {
    return this.request<{ rawTransaction: Uint8Array }>({
      id: 42,
      jsonrpc: '2.0',
      method: SOLANA_PAYLOAD_METHODS.PARTIAL_SIGN_TRANSACTION,
      params: {
        type: transaction instanceof Transaction ? 'legacy' : 0,
        serialized: transaction.serialize(serializeConfig),
        serializeConfig,
      },
    });
  };
}
