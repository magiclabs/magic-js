import {
  MagicPayloadMethod,
  NFTAirdropParams,
  NFTAirdropResponse,
  NFTPurchaseRequest,
  NFTPurchaseResponse,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';

export class NFTModule extends BaseModule {
  /* Start an NFT Purchase flow */
  public purchase(options: NFTPurchaseRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTPurchase, [options]);
    return this.request<NFTPurchaseResponse>(requestPayload);
  }

  public airdrop(params: NFTAirdropParams) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTAirdrop, [params]);
    return this.request<NFTAirdropResponse>(requestPayload);
  }
}
