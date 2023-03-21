import WalletConnectProvider from '@walletconnect/web3-provider';
import { CoinbaseWalletProvider, CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import {
  Errors,
  Events,
  MagicPayloadMethod,
  RequestUserInfoScope,
  UserEnv,
  UserInfo,
  WalletInfo,
  Wallets,
} from '@magic-sdk/types';

import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { clearKeys } from '../util/web-crypto';
import { setItem, getItem, removeItem } from '../util/storage';

export class WalletModule extends BaseModule {
  /* Prompt Magic's Login Form */
  public async connectWithUI() {
    // If within metamask wallet browser, auto-connect without any UI (if dapp has metamask enabled)
    if (this.isMetaMaskBrowser()) {
      try {
        const isMetaMaskEnabled = await this.isWalletEnabled(Wallets.MetaMask);
        if (isMetaMaskEnabled) {
          return this.autoConnectIfWalletBrowser(Wallets.MetaMask);
        }
        // If not enabled, continue with normal flow
      } catch (error) {
        console.error(error);
      }
    }
    // If within coinbase wallet browser, auto-connect without any UI (if dapp has coinbase enabled)
    if (this.isCoinbaseWalletBrowser()) {
      try {
        const isCoinbaseWalletEnabled = await this.isWalletEnabled(Wallets.CoinbaseWallet);
        if (isCoinbaseWalletEnabled) {
          return this.autoConnectIfWalletBrowser(Wallets.CoinbaseWallet);
        }
        // If not enabled, continue with normal flow
      } catch (error) {
        console.error(error);
      }
    }
    const userEnv = this.getUserEnv();
    const loginRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Login, [userEnv]);
    const loginRequest = this.request<string[]>(loginRequestPayload);
    loginRequest.on(Events.WalletSelected as any, (params) =>
      this.handleWalletSelected({ ...params, showModal: !!params.showModal, payloadId: loginRequestPayload.id }),
    );
    return loginRequest;
  }

  /* Returns the provider for the connected wallet */
  public async getProvider(): Promise<any> {
    const activeWallet = await getItem(this.localForageKey);
    switch (activeWallet) {
      case Wallets.MetaMask:
        return this.getMetaMaskProvider();
      case Wallets.WalletConnect:
        if (!this.sdk.thirdPartyWalletOptions?.walletConnect) {
          throw new Error(Errors.WalletConnectError);
        }
        return this.getWalletConnectProvider(false);
      case Wallets.CoinbaseWallet:
        if (!this.sdk.thirdPartyWalletOptions?.coinbaseWallet) {
          throw new Error(Errors.CoinbaseWalletError);
        }
        return this.getCoinbaseProvider().provider;
      default:
        return this.sdk.rpcProvider;
    }
  }

  /* Prompt Magic's Wallet UI (not available for users logged in with third party wallets) */
  public showUI(): Promise<boolean> {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI);
    return this.request<boolean>(requestPayload);
  }

  /* Get user info such as the wallet type they are logged in with */
  public async getInfo(): Promise<WalletInfo> {
    const activeWallet = await getItem(this.localForageKey);
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo, [{ walletType: activeWallet }]);
    return this.request<WalletInfo>(requestPayload);
  }

  /* Request email address from logged in user */
  public requestUserInfoWithUI(scope?: RequestUserInfoScope): Promise<UserInfo> {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestUserInfoWithUI, scope ? [scope] : []);
    return this.request<UserInfo>(requestPayload);
  }

  /* Logout user */
  public async disconnect(): Promise<boolean> {
    clearKeys();
    const activeWallet = await getItem(this.localForageKey);
    if (activeWallet === Wallets.WalletConnect) {
      const provider = await this.getWalletConnectProvider(false);
      provider.disconnect();
    }
    if (activeWallet === Wallets.CoinbaseWallet) {
      const coinbase = this.getCoinbaseProvider();
      coinbase.provider.disconnect();
    }
    removeItem(this.localForageKey);
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }

  /* Private methods */

  private localForageKey = 'mc_active_wallet';

  /* MetaMask */
  private isMetaMaskInstalled(): boolean {
    return (
      (window as any).ethereum?.isMetaMask ||
      !!(window as any).ethereum?.providers?.find((provider: any) => provider?.isMetaMask)
    );
  }

  private isMetaMaskBrowser(): boolean {
    return this.isMobile() && this.isMetaMaskInstalled();
  }

  private getMetaMaskProvider(): any {
    return (window as any).ethereum?.providers?.find((p: any) => p?.isMetaMask) || (window as any).ethereum;
  }

  private connectToMetaMask(): Promise<string[]> {
    // Redirect to MetaMask app if user selects MetaMask on mobile
    if (this.isMobile() && !this.isMetaMaskInstalled()) {
      const metaMaskDeepLink = `https://metamask.app.link/dapp/${window.location.href.replace(/(^\w+:|^)\/\//, '')}`;
      window.location.href = metaMaskDeepLink;
    }
    return this.getMetaMaskProvider().request({ method: 'eth_requestAccounts' });
  }

  /* Wallet Connect */
  private async getWalletConnectProvider(showModal: boolean): Promise<WalletConnectProvider> {
    const providerConfig = this.sdk.thirdPartyWalletOptions?.walletConnect;
    if (!providerConfig) {
      throw new Error(Errors.WalletConnectError);
    }
    const provider = new WalletConnectProvider({
      ...(providerConfig as any),
      qrcode: showModal,
    });
    const activeWallet = await getItem(this.localForageKey);
    const isConnected = localStorage.getItem('walletconnect');
    // Only enable Wallet Connect provider if wallet is still connected
    if (activeWallet && isConnected) {
      await provider.enable();
    }
    return provider;
  }

  private async connectToWalletConnect(payloadId: any, showModal?: boolean): Promise<string[]> {
    if (!this.sdk.thirdPartyWalletOptions?.walletConnect) {
      throw new Error(Errors.WalletConnectError);
    }
    const provider = await this.getWalletConnectProvider(!!showModal);
    provider.connector.on(Events.DisplayUri, (err, payload: any) => {
      if (!showModal) {
        const uri = payload.params[0];
        this.createIntermediaryEvent(Events.Uri as any, payloadId)(uri);
      }
    });
    return provider.enable();
  }

  /* Coinbase Wallet */
  private isCoinbaseWalletInstalled(): boolean {
    return (
      (window as any).ethereum?.isCoinbaseWallet ||
      !!(window as any).ethereum?.providers?.find((provider: any) => provider?.isCoinbaseWallet)
    );
  }

  private isCoinbaseWalletBrowser(): boolean {
    return !!(window as any).ethereum?.isCoinbaseBrowser;
  }

  private getCoinbaseProvider(): { provider: CoinbaseWalletProvider; qrCodeUrl: string | null } {
    const providerConfig = this.sdk.thirdPartyWalletOptions?.coinbaseWallet?.provider;
    const sdkConfig = this.sdk.thirdPartyWalletOptions?.coinbaseWallet?.sdk;
    if (!providerConfig || !sdkConfig) {
      throw new Error(Errors.CoinbaseWalletError);
    }
    const coinbaseWallet = new CoinbaseWalletSDK({
      ...(sdkConfig as any),
      overrideIsMetaMask: false,
      headlessMode: true,
    });
    const qrCodeUrl = coinbaseWallet.getQrUrl();
    const provider = coinbaseWallet.makeWeb3Provider(providerConfig.jsonRpcUrl, providerConfig.chainId);
    return { provider, qrCodeUrl };
  }

  private connectToCoinbaseWallet(payloadId: any): Promise<string[]> {
    // Redirect to Coinbase Wallet app if user selects Coinbase Wallet on mobile
    if (this.isMobile() && !this.isCoinbaseWalletBrowser()) {
      const coinbaseWalletDeepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
      window.location.href = coinbaseWalletDeepLink;
    }
    if (!this.sdk.thirdPartyWalletOptions?.coinbaseWallet) {
      throw new Error(Errors.CoinbaseWalletError);
    }
    const coinbase = this.getCoinbaseProvider();
    if (coinbase.qrCodeUrl) {
      this.createIntermediaryEvent(Events.Uri as any, payloadId)(coinbase.qrCodeUrl);
    }
    return coinbase.provider.request({ method: 'eth_requestAccounts' });
  }

  /* Helpers */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Silk|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  private getUserEnv(): UserEnv {
    return {
      env: {
        isMetaMaskInstalled: this.isMetaMaskInstalled(),
        isCoinbaseWalletInstalled: this.isCoinbaseWalletInstalled(),
      },
    };
  }

  private connectToThirdPartyWallet(provider: Wallets, payloadId: any, showModal?: boolean): Promise<any> {
    switch (provider) {
      case Wallets.MetaMask:
        return this.connectToMetaMask();
      case Wallets.WalletConnect:
        return this.connectToWalletConnect(payloadId, showModal);
      case Wallets.CoinbaseWallet:
        return this.connectToCoinbaseWallet(payloadId);
      default:
        throw new Error(
          `Invalid provider: ${provider}. Must be one of "metamask", "coinbase_wallet", or "wallet_connect".`,
        );
    }
  }

  private isWalletEnabled(wallet: Wallets): Promise<boolean> {
    const isWalletEnabled = createJsonRpcRequestPayload('mc_is_wallet_enabled', [{ wallet }]);
    return this.request<boolean>(isWalletEnabled);
  }

  /* Triggers connection to wallet, emits success/reject event back to iframe */
  private async handleWalletSelected(params: { wallet: Wallets; showModal: boolean; payloadId: number }) {
    try {
      const address = await this.connectToThirdPartyWallet(params.wallet, params.payloadId, params.showModal);
      await setItem(this.localForageKey, params.wallet);
      this.createIntermediaryEvent(Events.WalletConnected as any, params.payloadId as any)(address);
    } catch (error) {
      this.createIntermediaryEvent(Events.WalletRejected as any, params.payloadId as any)();
    }
  }

  private async autoConnectIfWalletBrowser(wallet: Wallets): Promise<string[]> {
    let address;
    if (wallet === Wallets.MetaMask) {
      address = await this.getMetaMaskProvider().request({ method: 'eth_requestAccounts' });
    }
    if (wallet === Wallets.CoinbaseWallet) {
      address = await this.getCoinbaseProvider().provider.request({ method: 'eth_requestAccounts' });
    }
    await setItem(this.localForageKey, wallet);
    const autoConnectPayload = createJsonRpcRequestPayload(MagicPayloadMethod.AutoConnect, [{ wallet, address }]);
    const autoConnectRequest = this.request<string[]>(autoConnectPayload);
    return autoConnectRequest;
  }
}
