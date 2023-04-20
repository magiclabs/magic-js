import {
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
import { createDeprecationWarning } from '../core/sdk-exceptions';
import { setItem, getItem, removeItem } from '../util/storage';
import { ProductConsolidationMethodRemovalVersions } from './auth';

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
    // prettier-ignore
    loginRequest.on(Events.WalletSelected as any, (params: { wallet: Wallets }) => this.handleWalletSelected({ ...params, payloadId: loginRequestPayload.id as number }));
    return loginRequest;
  }

  /* Prompt Magic's Wallet UI (not available for users logged in with third party wallets) */
  public showUI() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.ShowUI);
    return this.request<boolean>(requestPayload);
  }

  /* Get user info such as the wallet type they are logged in with */
  // deprecating
  public async getInfo() {
    createDeprecationWarning({
      method: 'wallet.getInfo()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.getInfo()',
    }).log();
    const activeWallet = await getItem(this.localForageKey);
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetInfo, [{ walletType: activeWallet }]);
    return this.request<WalletInfo>(requestPayload);
  }

  /* Logout user */
  // deprecating
  public disconnect() {
    createDeprecationWarning({
      method: 'wallet.disconnect()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.logout()',
    }).log();
    clearKeys();
    removeItem(this.localForageKey);
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Disconnect);
    return this.request<boolean>(requestPayload);
  }

  /* Request email address from logged in user */
  // deprecating
  public requestUserInfoWithUI(scope?: RequestUserInfoScope) {
    createDeprecationWarning({
      method: 'wallet.requestUserInfoWithUI()',
      removalVersions: ProductConsolidationMethodRemovalVersions,
      useInstead: 'user.requestUserInfoWithUI()',
    }).log();
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.RequestUserInfoWithUI, scope ? [scope] : []);
    return this.request<UserInfo>(requestPayload);
  }

  /* Returns the provider for the connected wallet */
  public async getProvider(): Promise<any> {
    const activeWallet = await getItem(this.localForageKey);
    switch (activeWallet) {
      case Wallets.MetaMask:
        return this.getMetaMaskProvider();
      case Wallets.CoinbaseWallet:
        return this.getCoinbaseProvider();
      default:
        return this.sdk.rpcProvider;
    }
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

  private getCoinbaseProvider(): any {
    return (window as any).ethereum?.providers?.find((p: any) => p?.isCoinbaseWallet) || (window as any).ethereum;
  }

  private connectToCoinbaseWallet(): Promise<string[]> {
    // Redirect to Coinbase Wallet app if user selects Coinbase Wallet on mobile
    if (this.isMobile() && !this.isCoinbaseWalletBrowser()) {
      const coinbaseWalletDeepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
      window.location.href = coinbaseWalletDeepLink;
    }
    const provider = this.getCoinbaseProvider();
    return provider.request({ method: 'eth_requestAccounts' });
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

  private connectToThirdPartyWallet(provider: Wallets): Promise<any> {
    switch (provider) {
      case Wallets.MetaMask:
        return this.connectToMetaMask();
      case Wallets.CoinbaseWallet:
        return this.connectToCoinbaseWallet();
      default:
        throw new Error(`Invalid provider: ${provider}. Must be one of "metamask" or "coinbase_wallet".`);
    }
  }

  private isWalletEnabled(wallet: Wallets): Promise<boolean> {
    const isWalletEnabled = createJsonRpcRequestPayload('mc_is_wallet_enabled', [{ wallet }]);
    return this.request<boolean>(isWalletEnabled);
  }

  /* Triggers connection to wallet, emits success/reject event back to iframe */
  private async handleWalletSelected(params: { wallet: Wallets; payloadId: number }) {
    try {
      const address = await this.connectToThirdPartyWallet(params.wallet);
      await setItem(this.localForageKey, params.wallet);
      this.createIntermediaryEvent(Events.WalletConnected as any, params.payloadId as any)(address);
    } catch (error) {
      console.error(error);
      this.createIntermediaryEvent(Events.WalletRejected as any, params.payloadId as any)();
    }
  }

  private async autoConnectIfWalletBrowser(wallet: Wallets): Promise<string[]> {
    let address;
    if (wallet === Wallets.MetaMask) {
      address = await this.getMetaMaskProvider().request({ method: 'eth_requestAccounts' });
    }
    if (wallet === Wallets.CoinbaseWallet) {
      address = await this.getCoinbaseProvider().request({ method: 'eth_requestAccounts' });
    }
    await setItem(this.localForageKey, wallet);
    const autoConnectPayload = createJsonRpcRequestPayload(MagicPayloadMethod.AutoConnect, [{ wallet, address }]);
    const autoConnectRequest = this.request<string[]>(autoConnectPayload);
    return autoConnectRequest;
  }
}
