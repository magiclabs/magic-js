export interface UserInformation {
  email?: string;
}

export interface WalletInfo {
  walletType: 'magic' | 'metamask' | 'coinbase_wallet' | 'wallet_connect';
}

export enum MagicConnectPayloadMethod {
  GetWalletInfo = 'mc_get_wallet_info',
  ShowWallet = 'mc_wallet',
  RequestUserInfo = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
}
