import { ComponentType } from 'react';

/**
 * Available third-party wallet providers.
 * Use these constants or pass string literals directly: 'metamask', 'coinbase', etc.
 */
export const ThirdPartyWallets = {
  METAMASK: 'metamask',
  WALLETCONNECT: 'walletconnect',
  COINBASE: 'coinbase',
  PHANTOM: 'phantom',
  RABBY: 'rabby',
} as const;

/** Type representing valid third-party wallet values */
export type ThirdPartyWallet = (typeof ThirdPartyWallets)[keyof typeof ThirdPartyWallets];

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
  BITBUCKET = 'bitbucket',
  DISCORD = 'discord',
  GITLAB = 'gitlab',
  TELEGRAM = 'telegram',
}

export type LoginProvider = OAuthProvider | ThirdPartyWallet;

export interface ProviderConfig {
  title: string;
  description: string;
  Icon: ComponentType<{ width?: number; height?: number; className?: string }>;
}

/**
 * OAuth user information returned from social login
 */
export interface OAuthUserInfo {
  /** The OAuth provider used (e.g., 'google', 'apple') */
  provider: string;
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}

/**
 * Result returned on successful email login
 */
export interface EmailLoginResult {
  method: 'email';
  /** The DID token for authentication */
  didToken: string;
}

/**
 * Result returned on successful OAuth login
 */
export interface OAuthLoginResult {
  method: 'oauth';
  /** The DID token for authentication */
  didToken: string;
  /** OAuth provider information */
  oauth: OAuthUserInfo;
}

/**
 * Result returned on successful wallet login
 */
export interface WalletLoginResult {
  method: 'wallet';
  /** The connected wallet address */
  walletAddress: string;
}

/**
 * Discriminated union of all login result types.
 * Check the `method` property to determine which fields are available.
 *
 * @example
 * onSuccess={(result) => {
 *   if (result.method === 'email' || result.method === 'oauth') {
 *     sendToBackend(result.didToken);
 *   } else {
 *     console.log('Wallet:', result.walletAddress);
 *   }
 * }}
 */
export type LoginResult = EmailLoginResult | OAuthLoginResult | WalletLoginResult;

/**
 * How the widget is displayed on the page.
 * - 'inline': Rendered in the document flow (default)
 * - 'modal': Positioned as a modal dialog, slightly above center
 */
export type DisplayMode = 'inline' | 'modal';

export interface MagicWidgetProps {
  /**
   * How the widget is displayed on the page. Defaults to 'inline'.
   * - 'inline': Rendered in the document flow
   * - 'modal': Positioned as a modal dialog with backdrop
   * @example displayMode="modal"
   */
  displayMode?: DisplayMode;

  /**
   * Whether the widget modal is open. Defaults to true.
   * @example isOpen={showLogin}
   */
  isOpen?: boolean;

  /**
   * Callback fired when the widget is closed (e.g., user clicks X button).
   * @example onClose={() => setShowLogin(false)}
   */
  onClose?: () => void;

  /**
   * Third-party wallets to display. None enabled by default.
   * Accepts constants or string literals: 'metamask', 'walletconnect', 'coinbase', 'phantom', 'rabby'
   * @example wallets={['metamask', 'coinbase']}
   * @example wallets={[ThirdPartyWallets.METAMASK, ThirdPartyWallets.COINBASE]}
   */
  wallets?: ThirdPartyWallet[];

  /**
   * Callback fired when login succeeds.
   * The result type varies by login method - check `result.method` to determine the shape.
   * @example
   * onSuccess={(result) => {
   *   if (result.method === 'email' || result.method === 'oauth') {
   *     authenticate(result.didToken);
   *   }
   * }}
   */
  onSuccess?: (result: LoginResult) => void;

  /**
   * Callback fired when login fails
   * @example onError={(error) => console.error(error.message)}
   */
  onError?: (error: Error) => void;
}
