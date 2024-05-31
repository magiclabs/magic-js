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
    console.log('HEY');
    // const promiEvent = createPromiEvent<any, NFTCheckoutEvents>((resolve) => {
    // How to tell if user is logged in with a third-party wallet

    // TODO: remove this line after testing
    // const isThirdPartyWalletConnected = true;
    const isThirdPartyWalletConnected = this.sdk.thirdPartyWallets.isConnected;

    console.log({ isThirdPartyWalletConnected });

    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTCheckout, [
      {
        ...options,
        // Indicating to iframe if third party wallet
        walletProvider: isThirdPartyWalletConnected ? 'web3modal' : 'magic',
      },
    ]);
    const req = this.request<NFTCheckoutResponse>(requestPayload);

    // Add intermediary event listener if user is purchasing with a third-party wallet
    if (isThirdPartyWalletConnected) {
      // Listen for `nft-checkout-initiated` event from iframe
      req.on(NftCheckoutEventOnReceived.Initiated as any, async (rawTransaction) => {
        try {
          console.log('RECEIVED', rawTransaction);
          // prompt third party wallet with transaction details
          const hash = await this.request({
            method: 'eth_sendTransaction',
            params: [rawTransaction],
          });

          console.log({ hash });
          // emit `nft-checkout-success` intermediary event to iframe if developer sent tx
          this.createIntermediaryEvent(NftCheckoutEventEmit.Success, requestPayload.id as string)(hash);
        } catch (error) {
          console.log('7:10');
          console.log(error);
          // if rejected, emit `nft-checkout-failure` intermediary event to iframe
          this.createIntermediaryEvent(NftCheckoutEventEmit.Failure, requestPayload.id as string)();
        }
      });
    }
    return req;
    //   resolve(req);
    // });
    // return promiEvent;
  }

  /* Start an NFT Transfer flow */
  public transfer(options: NFTTransferRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTTransfer, [options]);
    return this.request<NFTTransferResponse>(requestPayload);
  }
}
