export interface UserInformation {
  email?: string;
}

export enum MagicConnectPayloadMethod {
  ShowWallet = 'mc_wallet',
  RequestUserInfo = 'mc_request_user_info',
  Disconnect = 'mc_disconnect',
}
