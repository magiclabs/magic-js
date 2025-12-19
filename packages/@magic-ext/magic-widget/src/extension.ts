import { Extension, SDKBase } from '@magic-sdk/provider';
import { ClientConfig } from './types/client-config';

enum SiwePayloadMethod {
  GenerateNonce = 'magic_siwe_generate_nonce',
  Login = 'magic_auth_login_with_siwe',
}

enum OAuthPayloadMethod {
  Popup = 'magic_oauth_login_with_popup',
}

enum ClientPayloadMethod {
  GetConfig = 'magic_client_get_config',
}

export type OAuthProvider =
  | 'google'
  | 'facebook'
  | 'apple'
  | 'github'
  | 'bitbucket'
  | 'gitlab'
  | 'linkedin'
  | 'twitter'
  | 'discord'
  | 'twitch'
  | 'microsoft';

export interface OpenIDConnectUserInfo {
  name?: string;
  familyName?: string;
  givenName?: string;
  middleName?: string;
  nickname?: string;
  preferredUsername?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  emailVerified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  sub?: string;
  sources?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MagicUserMetadata {
  issuer: string | null;
  publicAddress: string | null;
  email: string | null;
  phoneNumber?: string | null;
  isMfaEnabled?: boolean;
  recoveryFactors?: Array<{ type: string; value: string }>;
}

export interface OAuthRedirectResult {
  oauth: {
    provider: OAuthProvider;
    scope: string[];
    userHandle: string;
    userInfo: OpenIDConnectUserInfo;
  };
  magic: {
    idToken: string;
    userMetadata: MagicUserMetadata;
  };
}

export interface OAuthRedirectError {
  provider: OAuthProvider;
  error: string;
  error_description?: string;
  error_uri?: string;
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

/**
 * Constructs a SIWE message string per EIP-4361 spec.
 * This is a lightweight implementation that doesn't require the 'siwe' package.
 */
function createSiweMessage(params: {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}): string {
  const { domain, address, statement, uri, version, chainId, nonce, issuedAt } = params;

  // EIP-4361 message format
  return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

let extensionInstance: MagicWidgetExtension | null = null;

/**
 * Get the initialized MagicWidgetExtension instance.
 * Used internally by React components to access SIWE methods.
 * @throws Error if extension hasn't been initialized yet
 */
export function getExtensionInstance(): MagicWidgetExtension {
  if (!extensionInstance) {
    throw new Error(
      'MagicWidgetExtension has not been initialized. Make sure to create a Magic instance with MagicWidgetExtension before rendering MagicWidget.',
    );
  }
  return extensionInstance;
}

export class MagicWidgetExtension extends Extension.Internal<'magicWidget'> {
  name = 'magicWidget' as const;
  config = {};

  private clientConfig: ClientConfig | null = null;
  private configPromise: Promise<ClientConfig> | null = null;

  constructor() {
    super();
  }

  /**
   * Called by Magic SDK when the extension is initialized.
   * We override to store a reference for internal React component access.
   */
  public init(sdk: SDKBase) {
    super.init(sdk);
    // Store singleton reference for internal use
    extensionInstance = this;
  }

  /**
   * Generate a nonce for SIWE message construction.
   * This calls the Magic backend to get a unique nonce.
   */
  public async generateNonce(params?: SiweGenerateNonceParams): Promise<string> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SiwePayloadMethod.GenerateNonce, [params]);
    return this.request<string>(requestPayload);
  }

  /**
   * Generate a complete SIWE message.
   * Fetches a nonce from the backend and constructs the message client-side.
   */
  public async generateMessage(params: SiweGenerateMessageParams): Promise<string> {
    const nonce = await this.generateNonce({ address: params.address });

    const message = createSiweMessage({
      domain: window.location.host,
      address: params.address,
      statement: params.statement || 'By signing, you are proving you own this wallet and logging in.',
      uri: window.location.origin,
      version: '1',
      chainId: params.chainId || 1,
      nonce,
      issuedAt: new Date().toISOString(),
    });

    return message;
  }

  /**
   * Login with SIWE message and signature.
   * Sends the signed message to Magic backend for verification and returns a DID token.
   */
  public async login(params: SiweLoginParams): Promise<string> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(SiwePayloadMethod.Login, [params]);
    return this.request<string>(requestPayload);
  }

  /**
   * Login with OAuth popup.
   * Opens a popup for the specified OAuth provider and returns the result.
   */
  public async loginWithPopup(provider: OAuthProvider): Promise<OAuthRedirectResult> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethod.Popup, [
      {
        provider,
        returnTo: window.location.href,
        apiKey: this.sdk.apiKey,
        platform: 'web',
      },
    ]);

    const result = await this.request<OAuthRedirectResult | OAuthRedirectError>(requestPayload);

    // Check if the result is an error
    if ((result as OAuthRedirectError).error) {
      const errorResult = result as OAuthRedirectError;
      throw new Error(errorResult.error_description || errorResult.error);
    }

    return result as OAuthRedirectResult;
  }

  /**
   * Fetch client configuration via RPC (proxied through embedded-wallet iframe).
   * This avoids CORS issues by having the iframe make the request.
   */
  public async fetchConfig(): Promise<ClientConfig> {
    // Return cached config if available
    if (this.clientConfig) return this.clientConfig;
    // Return in-flight promise if already fetching
    if (this.configPromise) return this.configPromise;

    const requestPayload = this.utils.createJsonRpcRequestPayload(ClientPayloadMethod.GetConfig, []);
    this.configPromise = this.request<ClientConfig>(requestPayload);

    this.clientConfig = await this.configPromise;
    return this.clientConfig;
  }

  /**
   * Get the cached client configuration (synchronous).
   * Returns null if config hasn't been fetched yet.
   */
  public getConfig(): ClientConfig | null {
    return this.clientConfig;
  }

  /**
   * Login with Email OTP
   */
  public loginWithEmailOTP(email: string) {
    return this.sdk.auth.loginWithEmailOTP({ email, showUI: false, deviceCheckUI: false });
  }
}
