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
import { createCryptoChallenge } from './crypto';
import { OAuthPopupEventEmit, OAuthPopupEventHandlers, OAuthPopupEventOnReceived } from '@magic-sdk/types';

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
        // sessionStorage persists across same-tab redirects but never enters the iframe.
        sessionStorage.setItem(
          PKCE_STORAGE_KEY,
          JSON.stringify({ codeVerifier, ...successResult.pkceMetadata }),
        );
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

    return getResult.call(this, configuration, queryString);
  }

  public loginWithPopup(configuration: OAuthPopupConfiguration) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Popup, [
      {
        ...configuration,
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

        const redirectEvent = (event: MessageEvent) => {
          this.createIntermediaryEvent(OAuthPopupEventEmit.PopupEvent, requestPayload.id as string)(event.data);
        };

        if (configuration.shouldReturnURI) {
          oauthPopupRequest.on(OAuthPopupEventOnReceived.PopupUrl, popupUrl => {
            window.addEventListener('message', redirectEvent);
            promiEvent.emit(OAuthPopupEventOnReceived.PopupUrl, popupUrl);
          });
        }

        const result = await oauthPopupRequest;
        window.removeEventListener('message', redirectEvent);

        if ((result as OAuthRedirectError).error) {
          reject(result);
        } else {
          resolve(result as OAuthRedirectResult);
        }
      } catch (error) {
        reject(error);
      }
    });

    promiEvent.on(OAuthPopupEventEmit.Cancel, () => {
      this.createIntermediaryEvent(OAuthPopupEventEmit.Cancel, requestPayload.id as string)();
    });

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
}

function getResult(this: OAuthExtension, configuration: OAuthVerificationConfiguration, queryString: string) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    // Retrieve and immediately clear the full PKCE metadata stored at SDK level.
    const stored = sessionStorage.getItem(PKCE_STORAGE_KEY);
    sessionStorage.removeItem(PKCE_STORAGE_KEY);
    // clientMetadata contains { codeVerifier, state, redirectUri, appID, provider }.
    // Forwarding it lets the embedded-wallet verify handler skip its iframe storage entirely.
    // When absent (old embedded-wallet path), the handler falls back to its stored metadata.
    const clientMetadata = stored ? (JSON.parse(stored) as Record<string, string>) : undefined;

    // State verification for the new PKCE path.
    // The extension generated the state, so it verifies it here — before any RPC call — as CSRF protection.
    // In the legacy path (no clientMetadata), embedded-wallet handles state verification itself.
    if (clientMetadata) {
      const returnedState = new URLSearchParams(queryString).get('state');
      if (!returnedState || returnedState !== clientMetadata.state) {
        return reject(
          this.createError<object>('STATE_MISMATCH', 'OAuth state parameter mismatch — request may have been tampered with', {}),
        );
      }
    }

    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Verify, [
      {
        authorizationResponseParams: queryString,
        magicApiKey: this.sdk.apiKey,
        platform: 'web',
        ...configuration,
        ...(clientMetadata ? { clientMetadata } : {}),
      },
    ]);

    // Parse the result, which may contain an OAuth-formatted error.
    const resultOrError = await this.request<OAuthRedirectResult | OAuthRedirectError>(parseRedirectResult);
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
  });
}

export * from './types';
