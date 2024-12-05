import { Extension } from '@magic-sdk/commons';
import {
  UnsignedCommand,
  KadenaConfig,
  KadenaPayloadMethod,
  KadenaUserMetadata,
  SpireKeyAccount,
  SignatureWithPublicKey,
  SignedTransactions,
} from './types';

export class KadenaExtension extends Extension.Internal<'kadena'> {
  name = 'kadena' as const;
  config = {};

  constructor(public kadenaConfig: KadenaConfig) {
    super();

    this.config = {
      chainType: 'KADENA',
      rpcUrl: kadenaConfig.rpcUrl,
      chainId: kadenaConfig.chainId,
      options: {
        network: kadenaConfig.network,
        networkId: kadenaConfig.networkId,
        createAccountsOnChain: Boolean(kadenaConfig.createAccountsOnChain),
      },
    };
  }

  public signTransaction(hash: string): Promise<SignatureWithPublicKey> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }

  public async signTransactionWithSpireKey(transaction: UnsignedCommand): Promise<SignedTransactions> {
    const signedTransaction = await this.request(
      this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransactionWithSpireKey, [{ transaction }]),
    );
    return signedTransaction;
  }

  public loginWithSpireKey(): Promise<SpireKeyAccount> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaLoginWithSpireKey, []);
    return this.request<SpireKeyAccount>(requestPayload);
  }

  public getUserInfo(): Promise<KadenaUserMetadata> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaGetUserInfo, []);
    return this.request<KadenaUserMetadata>(requestPayload);
  }
}
