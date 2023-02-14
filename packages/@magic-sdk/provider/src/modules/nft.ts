import { MagicPayloadMethod, NFTAirdropParams, NFTCheckoutResponse } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';

export class NFTModule extends BaseModule {
  /* Start an NFT Checkout flow */
  public checkout() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTCheckout);
    return this.request<NFTCheckoutResponse>(requestPayload);
  }

  public airdrop(params: NFTAirdropParams) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTAirdrop, [params]);
    return this.request<boolean>(requestPayload);
  }
}
