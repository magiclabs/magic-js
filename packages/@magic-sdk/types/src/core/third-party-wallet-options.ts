export interface ThirdPartyWalletOptions {
  coinbaseWallet?: {
    sdk: CoinbaseWalletSDKOptions;
    provider: {
      jsonRpcUrl?: string;
      chainId?: number;
    };
  };
  walletConnect?: WalletConnectSDKOptions;
}

export interface WalletConnectSDKOptions {
  bridge: string;
  qrcode: boolean;
  qrcodeModal: {
    open: (uri: string, cb: any, qrcodeModalOptions?: IQRCodeModalOptions | undefined) => void;
    close: () => void;
  };
  qrcodeModalOptions: IQRCodeModalOptions | undefined;
  rpc: IRPCMap | null;
  infuraId: string;
  http: any;
  wc: any;
  isConnecting: boolean;
  connected: boolean;
  connectCallbacks: any[];
  accounts: string[];
  chainId: number;
  rpcUrl: string;
}

interface IQRCodeModalOptions {
  registryUrl?: string;
  mobileLinks?: string[];
  desktopLinks?: string[];
}

interface IRPCMap {
  [chainId: number]: string;
}

/* Coinbase Wallet Types */
export interface CoinbaseWalletSDKOptions {
  /** Application name */
  appName: string;
  /** @optional Application logo image URL; favicon is used if unspecified */
  appLogoUrl?: string | null;
  /** @optional Use dark theme */
  darkMode?: boolean;
  /** @optional Coinbase Wallet link server URL; for most, leave it unspecified */
  linkAPIUrl?: string;
  /** @optional an implementation of WalletUI; for most, leave it unspecified */
  uiConstructor?: (options: any) => any;
  /** @optional an implementation of EventListener for debugging; for most, leave it unspecified  */
  /** @deprecated in favor of diagnosticLogger */
  eventListener?: EventListener;
  /** @optional a diagnostic tool for debugging; for most, leave it unspecified  */
  diagnosticLogger?: any;
  /** @optional whether wallet link provider should override the isMetaMask property. */
  overrideIsMetaMask?: boolean;
  /** @optional whether wallet link provider should override the isCoinbaseWallet property. */
  overrideIsCoinbaseWallet?: boolean;
  /** @optional whether coinbase wallet provider should override the isCoinbaseBrowser property. */
  overrideIsCoinbaseBrowser?: boolean;
  /** @optional whether or not onboarding overlay popup should be displayed */
  headlessMode?: boolean;
  /** @optional whether or not to reload dapp automatically after disconnect, defaults to true */
  reloadOnDisconnect?: boolean;
}
