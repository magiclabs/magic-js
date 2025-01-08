import {
  MagicPayloadMethod,
  NFTCheckoutRequest,
  NFTCheckoutResponse,
  NFTCheckoutEvents,
  NFTPurchaseRequest,
  NFTPurchaseResponse,
  NFTTransferRequest,
  NFTTransferResponse,
  NftCheckoutIntermediaryEvents,
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
    const promiEvent = this.request<NFTCheckoutResponse, NFTCheckoutEvents>(requestPayload);

    if (isThirdPartyWalletConnected) {
      promiEvent.on(NftCheckoutIntermediaryEvents.Initiated, async (rawTransaction) => {
        try {
          const hash = await this.request({
            method: 'eth_sendTransaction',
            params: [rawTransaction],
          });
          this.createIntermediaryEvent(NftCheckoutIntermediaryEvents.Success, requestPayload.id as string)(hash);
        } catch (error) {
          this.createIntermediaryEvent(NftCheckoutIntermediaryEvents.Failure, requestPayload.id as string)();
        }
      });
      promiEvent.on(NftCheckoutIntermediaryEvents.Disconnect, () => {
        this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
        promiEvent.emit('disconnect');
      });
    }
    return promiEvent;
  }

  /* Start an NFT Transfer flow */
  public transfer(options: NFTTransferRequest) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.NFTTransfer, [options]);
    return this.request<NFTTransferResponse>(requestPayload);
  }
}
