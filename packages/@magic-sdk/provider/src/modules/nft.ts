import {
  MagicPayloadMethod,
  NFTCheckoutRequest,
  NFTCheckoutResponse,
  NFTPurchaseRequest,
  NFTPurchaseResponse,
  NFTTransferRequest,
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
  public checkout(options: NFTCheckoutRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTCheckout, [options]);
    return this.request<NFTCheckoutResponse>(requestPayload);
  }

  /* Start an NFT Transfer flow */
  public transfer(options: NFTTransferRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTTransfer, [options]);
    return this.request<NFTTransferResponse>(requestPayload);
  }
}
