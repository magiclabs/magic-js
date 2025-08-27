import { MultichainExtension } from '@magic-sdk/provider';
import { IconConfig } from './type';

export class IconExtension extends MultichainExtension<'icon'> {
  name = 'icon' as const;

  constructor(public iconConfig: IconConfig) {
    super({
      rpcUrl: iconConfig.rpcUrl,
      chainType: 'ICON',
    });
  }

  public sendTransaction = (txObj: any): Promise<string> => {
    const params = { ...txObj };

    if (params.stepLimit) params.stepLimit.toString();
    if (params.nid) params.nid.toString();
    if (params.nonce) params.nonce.toString();
    if (params.version) params.version.toString();
    if (params.value) params.value.toString();

    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'icx_sendTransaction',
      params,
    });
  };

  public signTransaction = (txObj: any): Promise<any> => {
    const params = { ...txObj };

    if (params.stepLimit) params.stepLimit.toString();
    if (params.nid) params.nid.toString();
    if (params.nonce) params.nonce.toString();
    if (params.version) params.version.toString();
    if (params.value) params.value.toString();

    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'icx_signTransaction',
      params,
    });
  };

  public getAccount = (): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: 'icx_getAccount',
      params: [],
    });
  };
}
