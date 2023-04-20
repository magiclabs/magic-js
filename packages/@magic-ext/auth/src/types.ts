export interface UserInfo {
  email?: string;
}

export interface WalletInfo {
  walletType: 'magic' | 'metamask' | 'coinbase_wallet' | 'wallet_connect';
}
