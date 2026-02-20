import {
  MagicPayloadMethod,
  ConnectWithUIOptions,
  ConnectWithUiEvents,
  ShowUIPromiEvents,
  Sign7702AuthorizationRequest,
  Sign7702AuthorizationResponse,
  Send7702TransactionRequest,
  Send7702TransactionResponse,
} from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { createPromiEvent } from '../util';

type ShowUiConfig = {
  onramperParams?: { [key: string]: string };
};

export class WalletModule extends BaseModule {
  /* Prompt Magic's Login Form */
  public connectWithUI(options?: ConnectWithUIOptions) {
    const promiEvent = createPromiEvent<string[], ConnectWithUiEvents>(async (resolve, reject) => {
      try {
        const loginRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Login, [
          {
            enabledWallets: this.sdk.thirdPartyWallets.enabledWallets,
            ...options,
          },
        ]);

        const loginRequest = this.request<string[], ConnectWithUiEvents>(loginRequestPayload);

        this.sdk.thirdPartyWallets.eventListeners.forEach(({ event, callback }) => {
          loginRequest.on(event, () => callback(loginRequestPayload.id as string));
        });

        loginRequest.on('id-token-created' as any, (params: { idToken: string }) => {
          promiEvent.emit('id-token-created', params);
        });

        const result = await loginRequest;
        if ((result as any).error) reject(result);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    return promiEvent;
  }

  /* Prompt Magic's Wallet UI (not available for users logged in with third party wallets) */
  public showUI(config?: ShowUiConfig) {
    return this.request<boolean, ShowUIPromiEvents>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI, [config]));
  }

  public showAddress() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowAddress));
  }

  public showSendTokensUI() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowSendTokensUI));
  }

  public showOnRamp() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowOnRamp));
  }

  public showNFTs() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowNFTs));
  }

  public showBalances() {
    return this.request<boolean>(createJsonRpcRequestPayload(MagicPayloadMethod.ShowBalances));
  }

  /**
   * Sign an EIP-7702 authorization to delegate the EOA to a smart contract implementation.
   * This enables account abstraction features for externally owned accounts.
   *
   * @param params - The authorization parameters including contractAddress, chainId, and optional nonce
   * @returns Promise resolving to the signed authorization with signature components (v, r, s)
   *
   * @example
   * ```typescript
   * const authorization = await magic.wallet.sign7702Authorization({
   *   contractAddress: '0x000000004F43C49e93C970E84001853a70923B03',
   *   chainId: 1,
   *   nonce: 0
   * });
   * ```
   */
  public sign7702Authorization(params: Sign7702AuthorizationRequest) {
    return this.request<Sign7702AuthorizationResponse>(
      createJsonRpcRequestPayload(MagicPayloadMethod.Sign7702Authorization, [params]),
    );
  }

  /**
   * Send an EIP-7702 (Type-4) transaction with an authorization list.
   * This allows executing transactions with delegated smart contract implementations.
   *
   * @param params - The transaction parameters including to, value, data, gas settings, and authorizationList
   * @returns Promise resolving to the transaction hash
   *
   * @example
   * ```typescript
   * // First, sign the authorization
   * const auth = await magic.wallet.sign7702Authorization({
   *   contractAddress: '0x000000004F43C49e93C970E84001853a70923B03',
   *   chainId: 1,
   * });
   *
   * // Then, send the transaction with the authorization
   * const { transactionHash } = await magic.wallet.send7702Transaction({
   *   to: '0x...',
   *   data: '0x...',
   *   authorizationList: [auth],
   * });
   * ```
   */
  public send7702Transaction(params: Send7702TransactionRequest) {
    return this.request<Send7702TransactionResponse>(
      createJsonRpcRequestPayload(MagicPayloadMethod.Send7702Transaction, [params]),
    );
  }
}
