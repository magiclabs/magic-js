export interface ThirdPartyWalletOptions {
  coinbaseWallet?: {
    sdk: any;
    provider: {
      jsonRpcUrl?: string;
      chainId?: number;
    };
  };
  walletConnect?: {
    modal: any;
    provider: any;
    connect: any;
  };
}
