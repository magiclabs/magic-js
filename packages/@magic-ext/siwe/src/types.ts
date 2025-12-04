export enum SiwePayloadMethod {
  GenerateNonce = 'magic_siwe_generate_nonce',
  GenerateMessage = 'magic_siwe_generate_message',
  Login = 'magic_auth_login_with_siwe',
}

export interface SiweGenerateNonceParams {
  address?: string;
}

export interface SiweGenerateMessageParams {
  address: string;
  chainId?: number;
  statement?: string;
}

export interface SiweLoginParams {
  message: string;
  signature: string;
}
