import { ComponentType } from 'react';

export enum ThirdPartyWallets {
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  PHANTOM = 'phantom',
  RABBY = 'rabby',
}

export interface ProviderMetadata {
  displayName: string;
  Icon: ComponentType<{ width?: number; height?: number; className?: string }>;
}

export enum RpcErrorMessage {
  MalformedEmail = 'Invalid params: Please provide a valid email address.',
  SanEmail = 'We are unable to create an account with that email.',
}

export enum OAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  MICROSOFT = 'microsoft',
  TWITCH = 'twitch',
  BITBUCLKET = 'bitbucket',
  DISCORD = 'discord',
  GITLAB = 'gitlab',
  TELEGRAM = 'telegram',
}

export type LoginProvider = OAuthProvider | ThirdPartyWallets;

export interface ProviderConfig {
  title: string;
  description: string;
  Icon: ComponentType<{ width?: number; height?: number; className?: string }>;
}
