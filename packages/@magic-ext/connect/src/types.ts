export interface UserInformation {
  email?: string;
}

export enum MagicConnectPayloadMethod {
  GetWalletInfo = 'mc_get_wallet_info',
  ShowWallet = 'mc_wallet',
  RequestUserInfo = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
}
