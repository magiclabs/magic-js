import {
  MagicPayloadMethod,
  NFTPurchaseRequest,
  NFTPurchaseResponse,
  NFTCheckoutRequest,
  NFTCheckoutResponse,
  NFTTransferResponse,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';

export class NFTModule extends BaseModule {
  /* Start an NFT Purchase flow with Sardine */
  public purchase(options: NFTPurchaseRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTPurchase, [options]);
    return this.request<NFTPurchaseResponse>(requestPayload);
  }

  /* Start an NFT Checkout flow with Paypal */
  public async checkout(options: NFTCheckoutRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTCheckout, [options]);
    return this.request<NFTCheckoutResponse>(requestPayload);
  }

  /* Start an NFT Transfer flow with Paypal */
  public async transfer(options: NFTCheckoutRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTTransfer, [options]);
    return this.request<NFTTransferResponse>(requestPayload);
  }
}
