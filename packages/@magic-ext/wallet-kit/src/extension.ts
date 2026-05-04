import { createPromiEvent, Extension, MagicRPCError, SDKBase, ViewController } from '@magic-sdk/provider';
import {
  FarcasterLoginEventEmit,
  JsonRpcRequestPayload,
  LocalStorageKeys,
  MagicPayloadMethod,
  MagicThirdPartyWalletUpdate,
  OAuthMFAEventEmit,
  OAuthMFAEventOnReceived,
  OAuthPopupEventEmit,
  OAuthPopupEventHandlers,
  PasskeyEventHandlers,
  PasskeyMFAEventEmit,
  PasskeyMFAEventOnReceived,
  PasskeyResult,
  RPCErrorCode,
} from '@magic-sdk/types';
import { getAccount, getConnectorClient, reconnect, signMessage, watchAccount } from '@wagmi/core';
import type { Config } from '@wagmi/core';
import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ClientConfig } from './types/client-config';
import { createWagmiConfig } from './wagmi/config';
import { toJSON } from './utils/polyfills';
import { generateRandomUsername } from './lib/generate-username';

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

enum FarcasterPayloadMethod {
  FarcasterShowQR = 'farcaster_show_QR',
}

enum MagicPasskeyPayloadMethod {
  RegisterPasskeyStart = 'magic_auth_register_passkey_start',
  RegisterPasskeyVerify = 'magic_auth_register_passkey_verify',
  LoginWithPasskeyStart = 'magic_auth_login_with_passkey_start',
  LoginWithPasskeyVerify = 'magic_auth_login_with_passkey_verify',
}

export interface CreateChannelAPIResponse {
  channelToken: string;
  url: string;
  nonce: string;
}

type Hex = `0x${string}`;

export interface StatusAPIResponse {
  state: 'pending' | 'completed';
  nonce: string;
  url: string;
  message?: string;
  signature?: Hex;
  fid?: number;
  username?: string;
  bio?: string;
  displayName?: string;
  pfpUrl?: string;
  verifications?: Hex[];
  custody?: Hex;
}

interface AuthClientErrorOpts {
  message: string;
  cause: Error | AuthClientError;
  presentable: boolean;
}

type AuthClientErrorCode =
  | 'unauthenticated'
  | 'unauthorized'
  | 'bad_request'
  | 'bad_request.validation_failure'
  | 'not_found'
  | 'not_implemented'
  | 'unavailable'
  | 'unknown';

declare class AuthClientError extends Error {
  readonly errCode: AuthClientErrorCode;
  readonly presentable: boolean;
  constructor(errCode: AuthClientErrorCode, context: Partial<AuthClientErrorOpts> | string | Error);
}

const FarcasterLoginEventOnReceived = {
  OpenChannel: 'channel',
  Success: 'success',
  Failed: 'failed',
} as const;

export type FarcasterLoginEventHandlers = {
  [FarcasterLoginEventOnReceived.OpenChannel]: (channel: CreateChannelAPIResponse) => void;
  [FarcasterLoginEventOnReceived.Success]: (data: StatusAPIResponse) => void;
  [FarcasterLoginEventOnReceived.Failed]: (error: AuthClientError) => void;
  [FarcasterLoginEventEmit.Cancel]: () => void;
};

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

let extensionInstance: WalletKitExtension | null = null;

/**
 * Get the initialized WalletKitExtension instance.
 * Used internally by React components to access SIWE methods.
 * @throws Error if extension hasn't been initialized yet
 */
export function getExtensionInstance(): WalletKitExtension {
  if (!extensionInstance) {
    throw new Error(
      'WalletKitExtension has not been initialized. Make sure to create a Magic instance with WalletKitExtension before rendering MagicWidget.',
    );
  }
  return extensionInstance;
}

export interface WalletKitExtensionOptions {
  /** Reown (WalletConnect) project ID. Uses a default if not provided. */
  projectId?: string;
}

/** Shape passed to the onAccountChanged callback. */
type AccountChangedResult = { method: 'wallet'; walletAddress: string };

export class WalletKitExtension extends Extension.Internal<'walletKit'> {
  name = 'walletKit' as const;
  config = {};

  public readonly projectId: string;
  public readonly wagmiConfig: Config;
  public readonly wagmiAdapter: WagmiAdapter;

  private clientConfig: ClientConfig | null = null;
  private configPromise: Promise<ClientConfig> | null = null;
  private eventsListenerAdded = false;
  private reconnectPromise: Promise<void> | null = null;
  private isReauthInProgress = false;
  private onAccountChangedCallback?: (result: AccountChangedResult) => void;
  private onAccountChangedErrorCallback?: (error: Error) => void;

  constructor(options?: WalletKitExtensionOptions) {
    super();
    const { projectId, wagmiAdapter, wagmiConfig } = createWagmiConfig(options?.projectId);
    this.projectId = projectId;
    this.wagmiAdapter = wagmiAdapter;
    this.wagmiConfig = wagmiConfig;
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

    const account = getAccount(this.wagmiConfig);

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
        await reconnect(this.wagmiConfig);

        // After reconnect, check if we're connected
        const newAccount = getAccount(this.wagmiConfig);
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

      const account = getAccount(this.wagmiConfig);
      if (!account.isConnected || !account.connector) {
        return null;
      }

      const client = await getConnectorClient(this.wagmiConfig);
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
    const unwatch = watchAccount(this.wagmiConfig, {
      onChange: account => {
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
          this.dispatchWalletUpdate({
            chain: account.chain,
            address: account.address,
            addresses: account.addresses,
            updatedField: 'address',
          });
          // Re-run SIWE for the new address so the Magic session stays in sync.
          // This triggers the wallet's native signing prompt without Magic UI.
          this.performSilentReauth(account.address, account.chainId ?? 1);
        }

        // Chain changed
        if (account.chainId && account.chainId.toString() !== storedChainId) {
          localStorage.setItem(LocalStorageKeys.CHAIN_ID, account.chainId.toString());
          this.sdk.rpcProvider.emit('chainChanged', account.chainId);
          this.dispatchWalletUpdate({
            chain: account.chain,
            address: account.address,
            addresses: account.addresses,
            updatedField: 'chain',
          });
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

  private async dispatchWalletUpdate(details: MagicThirdPartyWalletUpdate['details']) {
    try {
      ((this.sdk as any).overlay as ViewController).postThirdPartyWalletUpdate(details);
    } catch (error) {
      console.error('Failed to post third party wallet event:', error);
    }
  }

  /**
   * Silently re-runs the SIWE flow for a new wallet address without any UI changes.
   * Called when the user switches accounts in their wallet while already signed in.
   * The wallet's native signing prompt will appear to the user.
   */
  public setAccountChangedCallbacks(
    onAccountChanged?: (result: AccountChangedResult) => void,
    onError?: (error: Error) => void,
  ) {
    this.onAccountChangedCallback = onAccountChanged;
    this.onAccountChangedErrorCallback = onError;
  }

  private async performSilentReauth(address: string, chainId: number): Promise<void> {
    if (this.isReauthInProgress) return;
    this.isReauthInProgress = true;
    try {
      const message = await this.generateMessage({ address, chainId });
      const signature = await signMessage(this.wagmiConfig, { message });
      await this.login({ message, signature });
      this.onAccountChangedCallback?.({ method: 'wallet', walletAddress: address });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err), { cause: err });
      console.error('SIWE re-auth failed for new account:', error);
      this.onAccountChangedErrorCallback?.(error);
    } finally {
      this.isReauthInProgress = false;
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
   * Opens a popup for the specified OAuth provider and returns a PromiEvent handle.
   * The handle emits MFA events when the user has MFA enabled.
   */
  public loginWithPopup(provider: OAuthProvider) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethod.Popup, [
      {
        provider,
        showUI: false,
        returnTo: window.location.href,
        apiKey: this.sdk.apiKey,
        platform: 'web',
      },
    ]);

    const promiEvent = createPromiEvent<OAuthRedirectResult, OAuthPopupEventHandlers>(async (resolve, reject) => {
      try {
        const oauthPopupRequest = this.request<OAuthRedirectResult | OAuthRedirectError, OAuthPopupEventHandlers>(
          requestPayload,
        );

        oauthPopupRequest.on(OAuthMFAEventOnReceived.MfaSentHandle, () => {
          promiEvent.emit(OAuthMFAEventOnReceived.MfaSentHandle);
        });
        oauthPopupRequest.on(OAuthMFAEventOnReceived.InvalidMfaOtp, () => {
          promiEvent.emit(OAuthMFAEventOnReceived.InvalidMfaOtp);
        });
        oauthPopupRequest.on(OAuthMFAEventOnReceived.RecoveryCodeSentHandle, () => {
          promiEvent.emit(OAuthMFAEventOnReceived.RecoveryCodeSentHandle);
        });
        oauthPopupRequest.on(OAuthMFAEventOnReceived.InvalidRecoveryCode, () => {
          promiEvent.emit(OAuthMFAEventOnReceived.InvalidRecoveryCode);
        });
        oauthPopupRequest.on(OAuthMFAEventOnReceived.RecoveryCodeSuccess, () => {
          promiEvent.emit(OAuthMFAEventOnReceived.RecoveryCodeSuccess);
        });

        const result = await oauthPopupRequest;

        const maybeResult = result as OAuthRedirectResult;
        const maybeError = result as OAuthRedirectError;

        if (maybeError.error) {
          reject(
            this.createError(maybeError.error, maybeError.error_description ?? 'An error occurred.', {
              errorURI: maybeError.error_uri,
              provider: maybeError.provider,
            }),
          );
        } else {
          resolve(maybeResult);
        }
      } catch (error) {
        reject(error);
      }
    });

    if (promiEvent) {
      promiEvent.on(OAuthMFAEventEmit.VerifyMFACode, (mfa: string) => {
        this.createIntermediaryEvent(OAuthMFAEventEmit.VerifyMFACode, requestPayload.id as string)(mfa);
      });
      promiEvent.on(OAuthMFAEventEmit.LostDevice, () => {
        this.createIntermediaryEvent(OAuthMFAEventEmit.LostDevice, requestPayload.id as string)();
      });
      promiEvent.on(OAuthMFAEventEmit.VerifyRecoveryCode, (recoveryCode: string) => {
        this.createIntermediaryEvent(OAuthMFAEventEmit.VerifyRecoveryCode, requestPayload.id as string)(recoveryCode);
      });
      promiEvent.on(OAuthMFAEventEmit.Cancel, () => {
        this.createIntermediaryEvent(OAuthMFAEventEmit.Cancel, requestPayload.id as string)();
      });
    }

    return promiEvent;
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

  /**
   * Login with SMS OTP
   */
  public loginWithSMS(phoneNumber: string) {
    return this.sdk.auth.loginWithSMS({ phoneNumber, showUI: false });
  }

  /**
   * Login with Farcaster (whitelabel mode - no built-in UI).
   * Returns a PromiEvent that emits 'channel', 'success', and 'failed' events.
   */
  public loginWithFarcaster() {
    const payload = this.utils.createJsonRpcRequestPayload(FarcasterPayloadMethod.FarcasterShowQR, [
      {
        data: {
          showUI: false,
          domain: window.location.host,
          siweUri: window.location.origin,
        },
      },
    ]);

    const handle = this.request<string, FarcasterLoginEventHandlers>(payload);

    handle.on(FarcasterLoginEventEmit.Cancel, () => {
      this.createIntermediaryEvent(FarcasterLoginEventEmit.Cancel, payload.id as string)();
    });

    return handle;
  }

  public loginWithPasskey() {
    let verifyPayloadId: string;

    const promiEvent = this.utils.createPromiEvent<PasskeyResult, PasskeyEventHandlers>(async (resolve, reject) => {
      if (!window.PublicKeyCredential) {
        const error = this.createError('PASSKEY_NOT_SUPPORTED', 'Passkey is not supported in this device.', {});
        return reject(error);
      }

      const { authenticationToken, authenticationOptions } = await this.request<any>(
        this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.LoginWithPasskeyStart),
      );

      let assertion;
      try {
        assertion = (await navigator.credentials.get({
          publicKey: authenticationOptions,
        })) as any;
      } catch (err: any) {
        const error = this.createError('PASSKEY_NOT_SUPPORTED', 'Passkey is not supported in this device.', {});
        return reject(error);
      }

      const requestPayload = this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.LoginWithPasskeyVerify, [
        {
          authenticationToken,
          assertionResponse: toJSON(assertion),
          showUI: false,
        },
      ]);

      verifyPayloadId = requestPayload.id as string;

      const loginRequest = this.request<PasskeyResult, PasskeyEventHandlers>(requestPayload);

      loginRequest.on(PasskeyMFAEventOnReceived.MfaSentHandle, () => {
        promiEvent.emit(PasskeyMFAEventOnReceived.MfaSentHandle);
      });
      loginRequest.on(PasskeyMFAEventOnReceived.InvalidMfaOtp, () => {
        promiEvent.emit(PasskeyMFAEventOnReceived.InvalidMfaOtp);
      });
      loginRequest.on(PasskeyMFAEventOnReceived.RecoveryCodeSentHandle, () => {
        promiEvent.emit(PasskeyMFAEventOnReceived.RecoveryCodeSentHandle);
      });
      loginRequest.on(PasskeyMFAEventOnReceived.InvalidRecoveryCode, () => {
        promiEvent.emit(PasskeyMFAEventOnReceived.InvalidRecoveryCode);
      });
      loginRequest.on(PasskeyMFAEventOnReceived.RecoveryCodeSuccess, () => {
        promiEvent.emit(PasskeyMFAEventOnReceived.RecoveryCodeSuccess);
      });

      try {
        const result = await loginRequest;
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    if (promiEvent) {
      promiEvent.on(PasskeyMFAEventEmit.VerifyMFACode, (mfa: string) => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.VerifyMFACode, verifyPayloadId)(mfa);
      });
      promiEvent.on(PasskeyMFAEventEmit.LostDevice, () => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.LostDevice, verifyPayloadId)();
      });
      promiEvent.on(PasskeyMFAEventEmit.VerifyRecoveryCode, (recoveryCode: string) => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.VerifyRecoveryCode, verifyPayloadId)(recoveryCode);
      });
      promiEvent.on(PasskeyMFAEventEmit.Cancel, () => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.Cancel, verifyPayloadId)();
      });
    }

    return promiEvent;
  }

  public async registerWithPasskey() {
    if (!window.PublicKeyCredential) {
      const error = this.createError('PASSKEY_NOT_SUPPORTED', 'Passkey is not supported in this device.', {});
      throw error;
    }

    const username = generateRandomUsername();

    const { registrationOptions, registrationToken } = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.RegisterPasskeyStart, [{ username }]),
    );

    let credential;
    try {
      credential = (await navigator.credentials.create({
        publicKey: registrationOptions,
      })) as any;
    } catch (err: any) {
      const error = this.createError('PASSKEY_REGISTRATION_ERROR', `Error creating credential: ${err.message}`, {});
      throw error;
    }

    return this.request<string | null>(
      this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.RegisterPasskeyVerify, [
        {
          registrationToken,
          registrationResponse: toJSON(credential),
          transport: credential.response.getTransports(),
          userAgent: navigator.userAgent,
        },
      ]),
    );
  }
}
