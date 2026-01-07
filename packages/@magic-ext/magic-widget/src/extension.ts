import { Extension, MagicRPCError, SDKBase, ViewController } from '@magic-sdk/provider';
import {
  JsonRpcRequestPayload,
  LocalStorageKeys,
  MagicOutgoingWindowMessage,
  MagicPayloadMethod,
  RPCErrorCode,
} from '@magic-sdk/types';
import { getAccount, GetAccountReturnType, getConnectorClient, reconnect, watchAccount } from '@wagmi/core';
import { ClientConfig } from './types/client-config';
import { wagmiConfig } from './wagmi/config';

enum SiwePayloadMethod {
  GenerateNonce = 'magic_siwe_generate_nonce',
  Login = 'magic_auth_login_with_siwe',
}

export const MAGIC_WIDGET_PROVIDER = 'magic-widget';

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
  private eventsListenerAdded = false;
  private reconnectPromise: Promise<void> | null = null;

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

    // Check if already connected from localStorage
    const storedProvider = localStorage.getItem(LocalStorageKeys.PROVIDER);

    if (storedProvider === MAGIC_WIDGET_PROVIDER) {
      this.sdk.thirdPartyWallets.isConnected = true;
      this.restoreWalletConnection();
    }
  }

  private async restoreWalletConnection(): Promise<void> {
    if (this.reconnectPromise) {
      return this.reconnectPromise;
    }

    const account = getAccount(wagmiConfig);

    if (account.isConnected) {
      this.setupEip1193EventListeners();
      return;
    }

    const storedProvider = localStorage.getItem(LocalStorageKeys.PROVIDER);
    if (storedProvider !== MAGIC_WIDGET_PROVIDER) {
      return;
    }

    // Trigger wagmi reconnection
    this.reconnectPromise = (async () => {
      try {
        await reconnect(wagmiConfig);

        // After reconnect, check if we're connected
        const newAccount = getAccount(wagmiConfig);
        if (newAccount.isConnected) {
          this.setupEip1193EventListeners();
        }
        // Don't reset state here
        // the wallet extension might need user interaction
      } catch (error) {
        console.error('Failed to reconnect wagmi wallet:', error);
        // Don't reset state on error - the wallet might still be available
      }
    })();

    return this.reconnectPromise;
  }

  /**
   * Set up the connected state after successful SIWE login.
   * This enables RPC request routing through the 3rd party wallet.
   */
  public setConnectedState(address: string, chainId: number = 1) {
    localStorage.setItem(LocalStorageKeys.PROVIDER, MAGIC_WIDGET_PROVIDER);
    localStorage.setItem(LocalStorageKeys.ADDRESS, address);
    localStorage.setItem(LocalStorageKeys.CHAIN_ID, chainId.toString());
    this.sdk.thirdPartyWallets.isConnected = true;

    this.setupEip1193EventListeners();
  }

  /**
   * Clear the connected state (called on logout/disconnect).
   */
  public clearConnectedState() {
    // Clean up the watcher
    if ((this as any)._cleanupWatcher) {
      (this as any)._cleanupWatcher();
    }
    this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
  }

  /**
   * Get the current wallet provider from wagmi.
   * Returns null if not connected.
   */
  public async getWalletProvider(): Promise<any | null> {
    try {
      // First, ensure wagmi is reconnected (handles page refresh scenario)
      await this.restoreWalletConnection();

      const account = getAccount(wagmiConfig);
      if (!account.isConnected || !account.connector) {
        return null;
      }

      const client = await getConnectorClient(wagmiConfig);
      return client;
    } catch (error) {
      console.error('Failed to get wallet provider:', error);
      return null;
    }
  }

  /**
   * Execute an RPC request through the connected 3rd party wallet.
   * This is called by ThirdPartyWalletsModule for magic-widget provider.
   */
  public async walletRequest<T = unknown>(payload: Partial<JsonRpcRequestPayload>): Promise<T> {
    const client = await this.getWalletProvider();
    if (!client) {
      throw new MagicRPCError({
        code: RPCErrorCode.InternalError,
        message: 'No wallet connected. Please connect a wallet first.',
      });
    }

    return client.request({
      method: payload.method,
      params: payload.params,
    } as any);
  }

  /**
   * Set up event listeners for account and chain changes.
   */
  private setupEip1193EventListeners() {
    if (this.eventsListenerAdded) return;
    this.eventsListenerAdded = true;

    // Watch for account/chain changes using wagmi's watchAccount
    const unwatch = watchAccount(wagmiConfig, {
      onChange: (account, prevAccount) => {
        const storedAddress = localStorage.getItem(LocalStorageKeys.ADDRESS);
        const storedChainId = localStorage.getItem(LocalStorageKeys.CHAIN_ID);

        // If user disconnected
        if (!account.isConnected && storedAddress) {
          this.handleWalletDisconnect();
          this.eventsListenerAdded = false;
          unwatch();
          return;
        }

        // Account changed
        if (account.address && account.address !== storedAddress) {
          localStorage.setItem(LocalStorageKeys.ADDRESS, account.address);
          this.sdk.rpcProvider.emit('accountsChanged', [account.address]);
          this.postWalletUpdate(account);
        }

        // Chain changed
        if (account.chainId && account.chainId.toString() !== storedChainId) {
          localStorage.setItem(LocalStorageKeys.CHAIN_ID, account.chainId.toString());
          this.sdk.rpcProvider.emit('chainChanged', account.chainId);
          this.postWalletUpdate(account);
        }
      },
    });

    // Store cleanup function (called on disconnect/logout)
    (this as any)._cleanupWatcher = () => {
      unwatch();
      this.eventsListenerAdded = false;
    };
  }

  /**
   * Handle wallet disconnect - clear SDK state AND invalidate Magic iframe session.
   * Called when user disconnects wallet via wallet extension UI.
   */
  private async handleWalletDisconnect(): Promise<void> {
    this.sdk.thirdPartyWallets.resetThirdPartyWalletState();
    this.sdk.rpcProvider.emit('accountsChanged', []);
    try {
      const logoutPayload = this.utils.createJsonRpcRequestPayload(MagicPayloadMethod.Logout, []);
      await this.request(logoutPayload);
    } catch (error) {
      console.error('Failed to invalidate Magic session after wallet disconnect:', error);
    }
  }

  private async postWalletUpdate(account: GetAccountReturnType) {
    try {
      ((this.sdk as any).overlay as ViewController).postThirdPartyWalletUpdate({
        account: account.address,
        chainId: account.chainId,
      });
    } catch (error) {
      console.error('Failed to post third party wallet event:', error);
    }
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
