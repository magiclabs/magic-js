export interface UserInformation {
  email?: string;
}

export enum MagicConnectPayloadMethod {
  GetWalletType = 'mc_get_wallet_type',
  ShowWallet = 'mc_wallet',
  RequestUserInfo = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
}
