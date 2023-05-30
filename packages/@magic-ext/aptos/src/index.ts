import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AptosClient, BCS, TransactionBuilder, TransactionBuilderABI, TxnBuilderTypes, Types } from 'aptos';
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

  account = async (): Promise<AccountInfo> => {
    const address = await this.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []),
    );

    return this.request<AccountInfo>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccountInfo, [
        {
          address,
        },
      ]),
    );
  };

  signAndSubmitTransaction = (
    address: string,
    transaction: Types.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> => {
    throw new Error('Method not implemented.');
    // const client = new AptosClient(this.config.nodeUrl);

    // client.generateSignSubmitTransaction();

    // return this.request<{ hash: Types.HexEncodedBytes }>(
    //   this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignAndSubmitTransaction, [
    //     {
    //       transaction,
    //       options,
    //     },
    //   ]),
    // );
  };

  signAndSubmitBCSTransaction = async (
    address: string,
    transaction: TxnBuilderTypes.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> => {
    const s = new BCS.Serializer();
    transaction.serialize(s);
    const transactionBytes = s.getBytes();

    return this.request<{ hash: Types.HexEncodedBytes }>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignAndSubmitBCSTransaction, [
        { address, transaction: transactionBytes, options },
      ]),
    );
  };

  signMessage = async (address: string, message: SignMessagePayload): Promise<SignMessageResponse> => {
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(JSON.stringify(message));

    const response = await this.request<Uint8Array>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, [
        {
          address,
          messageBytes,
        },
      ]),
    );

    const decoder = new TextDecoder();
    const signedMessage = decoder.decode(response);

    const parsed = JSON.parse(signedMessage) as SignMessageResponse;
    return parsed;
  };
}
