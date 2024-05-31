import {
  MagicPayloadMethod,
  NFTCheckoutRequest,
  NFTCheckoutResponse,
  NFTPurchaseRequest,
  NFTPurchaseResponse,
  NFTTransferRequest,
  NFTTransferResponse,
  NftCheckoutEventEmit,
  NftCheckoutEventOnReceived,
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
    const isThirdPartyWalletConnected = this.sdk.thirdPartyWallets.isConnected;

    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTCheckout, [
      {
        ...options,
        walletProvider: isThirdPartyWalletConnected ? 'web3modal' : 'magic',
      },
    ]);
    const req = this.request<NFTCheckoutResponse>(requestPayload);

    // Add intermediary event listener if user is purchasing with a third-party wallet
    if (isThirdPartyWalletConnected) {
      req.on(NftCheckoutEventOnReceived.Initiated as any, async (rawTransaction) => {
        try {
          // prompt third party wallet with transaction details
          const hash = await this.request({
            method: 'eth_sendTransaction',
            params: [rawTransaction],
          });

          console.log('hash from sdk', hash);
          this.createIntermediaryEvent(NftCheckoutEventEmit.Success, requestPayload.id as string)(hash);
        } catch (error) {
          console.error('error from sdk', error);
          this.createIntermediaryEvent(NftCheckoutEventEmit.Failure, requestPayload.id as string)();
        }
      });
    }
    return req;
  }

  /* Start an NFT Transfer flow */
  public transfer(options: NFTTransferRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTTransfer, [options]);
    return this.request<NFTTransferResponse>(requestPayload);
  }
}
