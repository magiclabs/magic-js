import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BCS } from 'aptos';
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
}
