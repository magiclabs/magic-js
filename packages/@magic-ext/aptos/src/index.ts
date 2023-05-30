import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BCS, TxnBuilderTypes, Types } from 'aptos';
import { AccountInfo, NetworkInfo, SignMessagePayload, SignMessageResponse } from '@aptos-labs/wallet-adapter-core';
import { AptosConfig, AptosPayloadMethod } from './type';

export class AptosExtension extends Extension.Internal<'aptos', any> {
  name = 'aptos' as const;
  config: any = {};

  constructor(public aptosConfig: AptosConfig) {
    super();

    this.config = {
      rpcUrl: '',
      chainType: 'APTOS',
      options: {
        nodeUrl: aptosConfig.nodeUrl,
      },
    };
  }

  private serializeRawTranasction = (rawTranasction: any) => {
    try {
      const s = new BCS.Serializer();
      rawTranasction.serialize(s);
      return s.getBytes();
    } catch (e) {
      console.error(
        'Invalid transaction. Please generate transaction with generateTransaction method of aptos sdk.',
        e,
      );
      throw e;
    }
  };

  getAccount = () => {
    return this.request<string>(this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []));
  };

  signTransaction = (rawTransaction: any) => {
    const serialized = this.serializeRawTranasction(rawTransaction);
    return this.request<Uint8Array>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignTransaction, [serialized]),
    );
  };

  connect = (): Promise<AccountInfo> => {
    throw new Error('Method not implemented.');
  };

  account = (): Promise<AccountInfo> => {
    throw new Error('Method not implemented.');
  };

  disconnect = (): Promise<void> => {
    throw new Error('Method not implemented.');
  };

  signAndSubmitTransaction = (
    transaction: Types.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> => {
    throw new Error('Method not implemented.');
  };

  signAndSubmitBCSTransaction = (
    transaction: TxnBuilderTypes.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> => {
    throw new Error('Method not implemented.');
  };

  signMessage = (message: SignMessagePayload): Promise<SignMessageResponse> => {
    throw new Error('Method not implemented.');
  };

  network = (): Promise<NetworkInfo> => {
    throw new Error('Method not implemented.');
  };

  onNetworkChange = (callback: any): Promise<void> => {
    throw new Error('Method not implemented.');
  };

  onAccountChange = (callback: any): Promise<void> => {
    throw new Error('Method not implemented.');
  };
}
