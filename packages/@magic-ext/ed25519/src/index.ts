import { Extension } from '@magic-sdk/commons';
import { Ed25519PayloadMethod } from './types';

export class Ed25519Extension extends Extension.Internal<'ed', any> {
  name = 'ed' as const;
  config: any = {};

  constructor() {
    super();

    this.config = {
      chainType: 'ED',
    };
  }

  public getPublicKey = (): Promise<string> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: Ed25519PayloadMethod.GetPublicKey,
      params: [],
    });
  };

  public sign = (payload: Uint8Array): Promise<Uint8Array> => {
    return this.request({
      id: 42,
      jsonrpc: '2.0',
      method: Ed25519PayloadMethod.Sign,
      params: payload,
    });
  };
}
