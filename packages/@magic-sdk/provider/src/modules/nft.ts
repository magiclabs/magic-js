import {
  MagicPayloadMethod,
  NFTPurchaseRequest,
  NFTPurchaseResponse,
  NFTCheckoutRequest,
  NFTCheckoutResponse,
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
    const response = await this.request<NFTCheckoutResponse>(requestPayload);

    if (response?.viewInWallet) {
      const requestViewInWalletPayload = createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI, [
        {
          deeplink: 'collectible-details',
          params: {
            contractAddress: options.contractAddress,
            tokenId: options.tokenId,
          },
        },
      ]);
      await this.request<NFTCheckoutResponse>(requestViewInWalletPayload);
    }

    return response;
  }
}
