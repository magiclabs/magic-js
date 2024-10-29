/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Extension, MagicIncomingWindowMessage } from '@magic-sdk/commons';
import {
  OAuthErrorData,
  OAuthRedirectError,
  OAuthRedirectResult,
  OAuthRedirectConfiguration,
  OAuthPayloadMethods,
  OAuthRedirectStartResult,
  OAuthPopupConfiguration,
} from './types';

export class OAuthExtension extends Extension.Internal<'oauth2'> {
  name = 'oauth2' as const;
  config = {};
  compat = {
    'magic-sdk': '>=2.4.6',
    '@magic-sdk/react-native': false,
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': false,
  };

  public loginWithRedirect(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<void>(async (resolve, reject) => {
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
        window.location.href = successResult.useMagicServerCallback
          ? // @ts-ignore - this.sdk.endpoint is marked protected but we need to access it.
            new URL(successResult.oauthAuthoriationURI, this.sdk.endpoint).href
          : successResult.oauthAuthoriationURI;
      }

      resolve();
    });
  }

  public getRedirectResult(lifespan?: number) {
    const queryString = window.location.search;

    // Remove the query from the redirect callback as a precaution to prevent
    // malicious parties from parsing it before we have a chance to use it.
    const urlWithoutQuery = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', urlWithoutQuery);

    return getResult.call(this, queryString, lifespan);
  }

  public loginWithPopup(configuration: OAuthPopupConfiguration) {
    let popup: Window | null = null;
    const width = 448;
    const height = 568;
    const left = window.screenLeft + (window.outerWidth / 2 - width / 2);
    const top = window.screenTop + window.outerHeight * 0.15;

    return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
      // Reject if popup already exists to prevent multiple instances
      if (popup) {
        reject(new Error('Popup window already exists'));
        return;
      }

      const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Start, [
        {
          ...configuration,
          apiKey: this.sdk.apiKey,
          platform: 'web',
          loginWithPopup: true,
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
      if (!successResult?.oauthAuthoriationURI) {
        reject(new Error('Internal error'));
      }

      popup = window.open(
        successResult.oauthAuthoriationURI,
        '_blank',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!popup) {
        reject(new Error('Failed to open popup window'));
        return;
      }

      const checkPopupClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopupClosed);
          reject(new Error('User denied action'));
        }
      }, 1000);

      const messageListener = async (event: MessageEvent) => {
        if (event.data.msgType !== MagicIncomingWindowMessage.MAGIC_POPUP_RESPONSE || event.source !== popup) return;

        if (event.data.method === MagicIncomingWindowMessage.MAGIC_POPUP_OAUTH_VERIFY_RESPONSE) {
          window.removeEventListener('message', messageListener);
          clearInterval(checkPopupClosed);

          if (event.data.payload.authorizationResponseParams) {
            try {
              const verificationResult = await getResult.call(this, event.data.payload.authorizationResponseParams);
              resolve(verificationResult);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('Internal error: Missing authorization response'));
          }
        }
      };

      window.addEventListener('message', messageListener);
    });
  }
}

function getResult(this: OAuthExtension, queryString: string, lifespan?: number) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Verify, [
      {
        authorizationResponseParams: queryString,
        magicApiKey: this.sdk.apiKey,
        platform: 'web',
        lifespan,
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
