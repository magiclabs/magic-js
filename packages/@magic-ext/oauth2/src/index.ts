import { createPromiEvent, Extension } from '@magic-sdk/provider';
import {
  OAuthErrorData,
  OAuthRedirectError,
  OAuthRedirectResult,
  OAuthRedirectConfiguration,
  OAuthPayloadMethods,
  OAuthRedirectStartResult,
  OAuthPopupConfiguration,
  OAuthVerificationConfiguration,
} from './types';
import {
  OAuthMFAEventEmit,
  OAuthMFAEventOnReceived,
  OAuthPopupEventEmit,
  OAuthPopupEventHandlers,
  OAuthPopupEventOnReceived,
  OAuthGetResultEventHandlers,
} from '@magic-sdk/types';
import { createCryptoChallenge } from './crypto';
import { storageWrite, storageRead, storageRemove } from './storage';
import { logger } from './logger';

const PKCE_STORAGE_KEY = 'magic_oauth_pkce_verifier';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
      };
    };
  }
}

export class OAuthExtension extends Extension.Internal<'oauth2'> {
  name = 'oauth2' as const;
  config = {};
  compat = {
    'magic-sdk': '>=2.4.6',
    '@magic-sdk/react-native': false,
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': false,
  };

  constructor() {
    super();
    this.seamlessTelegramLogin();
  }

  public loginWithRedirect(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<null | string>(async (resolve, reject) => {
      const { codeVerifier, codeChallenge, cryptoChallengeState } = createCryptoChallenge();

      const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Start, [
        {
          ...configuration,
          apiKey: this.sdk.apiKey,
          platform: 'web',
          codeChallenge,
          cryptoChallengeState,
          // codeVerifier is intentionally NOT sent here — it stays in the SDK.
        },
      ]);

      const result = await this.request<OAuthRedirectStartResult | OAuthRedirectError>(parseRedirectResult);
      const successResult = result as OAuthRedirectStartResult;
      const errorResult = result as OAuthRedirectError;

      if (errorResult.error) {
        reject(
          this.createError<OAuthErrorData>(errorResult.error, errorResult.error_description ?? 'An error occurred.', {
            errorURI: errorResult.error_uri,
            provider: errorResult.provider,
          }),
        );
      }

      if (successResult?.pkceMetadata) {
        // New path: store codeVerifier + all OAuth metadata at the SDK (parent page) level.
        // Written to sessionStorage, localStorage, and IndexedDB for maximum durability.
        const writeResult = await storageWrite(
          PKCE_STORAGE_KEY,
          JSON.stringify({ codeVerifier, ...successResult.pkceMetadata }),
        );

        const logPayload = {
          pkce: {
            provider: configuration.provider,
            storageLayers: writeResult,
          },
        };
        logger.info('oauth2.pkce.stored', logPayload);
      }

      if (successResult?.oauthAuthoriationURI) {
        const redirectURI = successResult.useMagicServerCallback
          ? // @ts-ignore - this.sdk.endpoint is marked protected but we need to access it.
            new URL(successResult.oauthAuthoriationURI, this.sdk.endpoint).href
          : successResult.oauthAuthoriationURI;

        if (successResult?.shouldReturnURI) {
          resolve(redirectURI);
        } else {
          window.location.href = redirectURI;
        }
      }
      resolve(null);
    });
  }

  public getRedirectResult(configuration: OAuthVerificationConfiguration = {}) {
    const queryString = configuration?.optionalQueryString || window.location.search;

    // Remove the query from the redirect callback as a precaution to prevent
    // malicious parties from parsing it before we have a chance to use it.
    const urlWithoutQuery = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', urlWithoutQuery);

    return this.getResult(configuration, queryString);
  }

  public loginWithPopup(configuration: OAuthPopupConfiguration) {
    const { showMfaModal } = configuration;
    const requestPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Popup, [
      {
        ...configuration,
        showUI: showMfaModal,
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

        /**
         * Attach Event listeners
         */
        const redirectEvent = (event: MessageEvent) => {
          this.createIntermediaryEvent(OAuthPopupEventEmit.PopupEvent, requestPayload.id as string)(event.data);
        };

        if (configuration.shouldReturnURI && oauthPopupRequest) {
          oauthPopupRequest.on(OAuthPopupEventOnReceived.PopupUrl, popupUrl => {
            window.addEventListener('message', redirectEvent);
            promiEvent.emit(OAuthPopupEventOnReceived.PopupUrl, popupUrl);
          });
        }

        if (!showMfaModal) {
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
        }

        const result = await oauthPopupRequest;
        window.removeEventListener('message', redirectEvent);

        const maybeResult = result as OAuthRedirectResult;
        const maybeError = result as OAuthRedirectError;

        if (maybeError.error) {
          reject(
            this.createError<OAuthErrorData>(maybeError.error, maybeError.error_description ?? 'An error occurred.', {
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

    if (!showMfaModal && promiEvent) {
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

  private getResult(configuration: OAuthVerificationConfiguration, queryString: string) {
    const { showMfaModal } = configuration;
    // requestPayload is assigned inside the async callback once PKCE metadata is retrieved.
    // It is only accessed by the MFA intermediary closures below, which cannot fire until
    // the server sends an MFA challenge — always after requestPayload has been assigned.
    let requestPayload: ReturnType<typeof this.utils.createJsonRpcRequestPayload>;

    const promiEvent = this.utils.createPromiEvent<OAuthRedirectResult, OAuthGetResultEventHandlers>(
      async (resolve, reject) => {
        const { hasStateMismatch, clientMetadata } = await this.retrievePKCEMetadata(queryString);

        if (!clientMetadata) {
          return reject(
            this.createError<object>(
              'MISSING_PKCE_METADATA',
              'OAuth session metadata not found — the session may have expired or storage was cleared',
              {},
            ),
          );
        }

        if (hasStateMismatch) {
          return reject(
            this.createError<object>(
              'STATE_MISMATCH',
              'OAuth state parameter mismatch — request may have been tampered with',
              {},
            ),
          );
        }

        requestPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Verify, [
          {
            authorizationResponseParams: queryString,
            magicApiKey: this.sdk.apiKey,
            platform: 'web',
            showUI: showMfaModal,
            ...configuration,
            clientMetadata,
          },
        ]);

        const getResultRequest = this.request<OAuthRedirectResult | OAuthRedirectError, OAuthGetResultEventHandlers>(
          requestPayload,
        );

        if (!showMfaModal) {
          getResultRequest.on(OAuthMFAEventOnReceived.MfaSentHandle, () => {
            promiEvent.emit(OAuthMFAEventOnReceived.MfaSentHandle);
          });
          getResultRequest.on(OAuthMFAEventOnReceived.InvalidMfaOtp, () => {
            promiEvent.emit(OAuthMFAEventOnReceived.InvalidMfaOtp);
          });
          getResultRequest.on(OAuthMFAEventOnReceived.RecoveryCodeSentHandle, () => {
            promiEvent.emit(OAuthMFAEventOnReceived.RecoveryCodeSentHandle);
          });
          getResultRequest.on(OAuthMFAEventOnReceived.InvalidRecoveryCode, () => {
            promiEvent.emit(OAuthMFAEventOnReceived.InvalidRecoveryCode);
          });
          getResultRequest.on(OAuthMFAEventOnReceived.RecoveryCodeSuccess, () => {
            promiEvent.emit(OAuthMFAEventOnReceived.RecoveryCodeSuccess);
          });
        }

        // Parse the result, which may contain an OAuth-formatted error.
        const resultOrError = await getResultRequest;
        const maybeResult = resultOrError as OAuthRedirectResult;
        const maybeError = resultOrError as OAuthRedirectError;

        if (maybeError.error) {
          reject(
            this.createError<OAuthErrorData>(maybeError.error, maybeError.error_description ?? 'An error occurred.', {
              errorURI: maybeError.error_uri,
              provider: maybeError.provider,
            }),
          );
        }

        resolve(maybeResult);
      },
    );

    if (!showMfaModal && promiEvent) {
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

  protected seamlessTelegramLogin() {
    try {
      const hash = window.location.hash.toString();
      if (!hash.includes('#tgWebAppData')) return;

      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      document.head.prepend(script);

      script.onload = async () => {
        try {
          const userData = window.Telegram?.WebApp.initData;
          const requestPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.VerifyTelegramData, [
            { userData, isMiniApp: true },
          ]);

          await this.request<string | null>(requestPayload);
        } catch (verificationError) {
          console.log('Error while verifying telegram data', verificationError);
        }
      };
    } catch (seamlessLoginError) {
      console.log('Error while loading telegram-web-app script', seamlessLoginError);
    }
  }

  private async retrievePKCEMetadata(queryString: string): Promise<{
    clientMetadata?: Record<string, string>;
    hasStateMismatch: boolean;
  }> {
    let hasStateMismatch = false;
    // Retrieve and immediately clear the full PKCE metadata stored at SDK level.
    // Reads from sessionStorage → localStorage → IndexedDB (first non-null wins).
    const { value: stored, source: storageSource } = await storageRead(PKCE_STORAGE_KEY);
    await storageRemove(PKCE_STORAGE_KEY);

    // clientMetadata contains { codeVerifier, state, redirectUri, appID, provider }.
    // Forwarding it lets the embedded-wallet verify handler skip its iframe storage entirely.
    // When absent (old embedded-wallet path), the handler falls back to its stored metadata.
    const clientMetadata = stored ? (JSON.parse(stored) as Record<string, string>) : undefined;

    if (!clientMetadata) {
      logger.error('oauth2.pkce.missing', {
        pkce: {
          storageSource,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        },
      });
    } else {
      logger.info('oauth2.pkce.retrieved', {
        pkce: {
          storageSource,
          provider: clientMetadata.provider,
        },
      });
    }

    // State verification for the new PKCE path.
    // The extension generated the state, so it verifies it here — before any RPC call — as CSRF protection.
    // In the legacy path (no clientMetadata), embedded-wallet handles state verification itself.
    if (clientMetadata) {
      const returnedState = new URLSearchParams(queryString).get('state');
      if (!returnedState || returnedState !== clientMetadata.state) {
        hasStateMismatch = true;
        logger.error('oauth2.pkce.state_mismatch', {
          pkce: {
            storageSource,
            provider: clientMetadata.provider,
            hasReturnedState: !!returnedState,
          },
        });
      }
    }

    return { clientMetadata, hasStateMismatch };
  }
}

export * from './types';
