import { Extension } from '@magic-sdk/commons';

// @ts-ignore
import { AptosClient, BCS, TxnBuilderTypes, Types, getAddressFromAccountOrAddress } from 'aptos';
import { AccountInfo, SignMessagePayload, SignMessageResponse } from '@aptos-labs/wallet-adapter-core';
import { AptosConfig, AptosPayloadMethod } from './type';
import { APTOS_PAYLOAD_TYPE } from './constants';

export { MagicAptosWallet } from './MagicAptosWallet';
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

  private serializeRawTransaction = (rawTransaction: TxnBuilderTypes.RawTransaction) => {
    const s = new BCS.Serializer();
    rawTransaction.serialize(s);
    return s.getBytes();
  };

  private generateRawTransactionWihtTypedPayload = async (
    address: string,
    transaction: Types.TransactionPayload,
    options?: any,
  ) => {
    const client = new AptosClient(this.config.options.nodeUrl);

    if (transaction.type === APTOS_PAYLOAD_TYPE.ENTRY_FUCNTION_PAYLOAD) {
      const rawTransaction = await client.generateTransaction(
        address,
        transaction as Types.EntryFunctionPayload,
        options,
      );
      return rawTransaction;
    }

    throw new Error(`[${transaction.type}] is not supported`);
  };

  getAccount = () => {
    return this.request<string>(this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []));
  };

  signTransaction = async (address: string, transaction: Types.TransactionPayload) => {
    const rawTransaction = await this.generateRawTransactionWihtTypedPayload(address, transaction);
    const transactionBytes = this.serializeRawTransaction(rawTransaction);

    return this.request<Uint8Array>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignTransaction, [
        {
          address,
          transactionBytes,
        },
      ]),
    );
  };

  getAccountInfo = async (): Promise<AccountInfo> => {
    const address = await this.request<string>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []),
    );

    return this.request<AccountInfo>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccountInfo, [{ address }]),
    );
  };

  signAndSubmitTransaction = async (
    address: string,
    transaction: Types.TransactionPayload,
    options?: any,
  ): Promise<{ hash: Types.HexEncodedBytes }> => {
    const rawTransaction = await this.generateRawTransactionWihtTypedPayload(address, transaction, options);
    const transactionBytes = this.serializeRawTransaction(rawTransaction);

    return this.request<{ hash: Types.HexEncodedBytes }>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignAndSubmitTransaction, [
        {
          address,
          transactionBytes,
        },
      ]),
    );
  };

  signAndSubmitBCSTransaction = async (address: string, transaction: TxnBuilderTypes.TransactionPayload) => {
    const client = new AptosClient(this.config.options.nodeUrl);
    const addressHex = getAddressFromAccountOrAddress(address);

    const rawTransaction = await client.generateRawTransaction(addressHex, transaction);
    const transactionBytes = this.serializeRawTransaction(rawTransaction);

    return this.request<{ hash: Types.HexEncodedBytes }>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignAndSubmitBCSTransaction, [
        {
          address,
          transactionBytes,
        },
      ]),
    );
  };

  signMessage = async (address: string, message: SignMessagePayload): Promise<SignMessageResponse> => {
    return this.request<SignMessageResponse>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignMessage, [
        {
          address,
          message,
        },
      ]),
    );
  };

  signMessageAndVerify = async (address: string, message: SignMessagePayload): Promise<boolean> => {
    return this.request<boolean>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosSignMessageAndVerify, [
        {
          address,
          message,
        },
      ]),
    );
  };
}
