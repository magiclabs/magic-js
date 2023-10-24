import { Extension } from '@magic-sdk/commons';

/* eslint-disable no-param-reassign, array-callback-return */
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { SolanaConfig, SolanaPayloadMethod, SerializeConfig } from './type';

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

  public signTransaction = (transaction: Transaction | VersionedTransaction) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: SolanaPayloadMethod.SignTransaction,
      params: {
        type: transaction instanceof Transaction ? 'legacy' : 0,
        serialized: transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        }),
      },
    });
  };

  public signMessage = (message: any) => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: SolanaPayloadMethod.SignMessage,
      params: {
        message,
      },
    });
  };
}
