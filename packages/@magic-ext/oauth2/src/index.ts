import { Extension } from '@magic-sdk/commons';
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
      const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Start, [
        {
          ...configuration,
          apiKey: this.sdk.apiKey,
          platform: 'web',
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

  public getRedirectResult(configuration: OAuthVerificationConfiguration) {
    const queryString = configuration.optionalQueryString || window.location.search;

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
        apiKey: this.sdk.apiKey,
        platform: 'web',
      },
    ]);

    return this.request<OAuthRedirectResult | OAuthRedirectError>(requestPayload);
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
          // Silent error when verifying telegram data
        }
      };
    } catch (seamlessLoginError) {
      // Silent error when loading telegram-web-app script
    }
  }
}

function getResult(this: OAuthExtension, configuration: OAuthVerificationConfiguration, queryString: string) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Verify, [
      {
        authorizationResponseParams: queryString,
        magicApiKey: this.sdk.apiKey,
        platform: 'web',
        ...configuration,
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
