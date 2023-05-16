import { Extension } from '@magic-sdk/commons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { AptosAccount, AptosAccountObject } from 'aptos';
import { AptosConfig, ConfigType, AptosPayloadMethod } from './type';

export class AptosExtension extends Extension.Internal<'aptos', any> {
  name = 'aptos' as const;
  config: ConfigType;

  constructor(public aptosConfig: AptosConfig) {
    super();

    this.config = {
      nodeUrl: aptosConfig.nodeUrl,
      chainType: 'APTOS',
    };
  }

  getAccount = async () => {
    const accountObject = await this.request<AptosAccountObject>(
      this.utils.createJsonRpcRequestPayload(AptosPayloadMethod.AptosGetAccount, []),
    );

    const aptosAccount = AptosAccount.fromAptosAccountObject(accountObject);
    return aptosAccount;
  };
}
