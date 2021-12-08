import { Extension } from '@magic-sdk/commons';

/* eslint-disable no-param-reassign, array-callback-return */
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

  public sendAndConfirmTransaction = (transaction: any, options?: any) => {
    const { instructions } = transaction;

    instructions.map((instruction: any) => {
      instruction.programId = instruction.programId.toBase58();
    });

    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: SolanaPayloadMethod.SendTransaction,
      params: {
        instructions,
        options,
      },
    });
  };

  public signTransaction = (transaction: any, serializeConfig?: SerializeConfig) => {
    const { instructions } = transaction;

    const magicInstructions = instructions.map((i: any) => {
      return {
        ...i,
        keys: i.keys.map((k: any) => {
          return { ...k, pubkey: k.pubkey.toBase58() };
        }),
        programId: i.programId.toBase58(),
      };
    });

    const params = {
      feePayer: transaction.feePayer.toBase58(),
      instructions: magicInstructions,
      recentBlockhash: transaction.recentBlockhash,
      serializeConfig,
    };

    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: SolanaPayloadMethod.SignTransaction,
      params,
    });
  };
}
