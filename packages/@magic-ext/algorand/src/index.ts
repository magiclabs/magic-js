import { Extension } from '@magic-sdk/commons';
import { AlgorandConfig, AlgorandPayloadMethod } from './types';

export class AlgorandExtension extends Extension.Internal<'algod', any> {
  name = 'algod' as const;
  config: any = {};

  constructor(public algorandConfig: AlgorandConfig) {
    super();

    this.config = {
      rpcUrl: algorandConfig.rpcUrl,
      chainType: 'ALOGD',
    };
  }

  public async signTransaction(txn: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(AlgorandPayloadMethod.AlgorandSignTransaction, txn));
  }

  public async signBid(txn: any) {
    return this.request(this.utils.createJsonRpcRequestPayload(AlgorandPayloadMethod.AlgorandSignBid, txn));
  }

  public async getWallet() {
    return this.request(this.utils.createJsonRpcRequestPayload(AlgorandPayloadMethod.AlgorandGetWallet, []));
  }

  public async signGroupTransaction(txns: any[]) {
    return this.request(
      this.utils.createJsonRpcRequestPayload(AlgorandPayloadMethod.AlgorandSignGroupTransaction, txns),
    );
  }

  public async signGroupTransactionV2(txns: any) {
    return this.request(
      this.utils.createJsonRpcRequestPayload(AlgorandPayloadMethod.AlgorandSignGroupTransactionV2, txns),
    );
  }
}
