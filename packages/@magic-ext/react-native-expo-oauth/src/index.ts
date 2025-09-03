import * as WebBrowser from 'expo-web-browser';
import { Extension } from '@magic-sdk/react-native-expo';
import {
  OAuthErrorData,
  OAuthPayloadMethods,
  OAuthRedirectConfiguration,
  OAuthRedirectError,
  OAuthRedirectResult,
  OAuthRedirectStartResult,
} from './types';

export class OAuthExtension extends Extension.Internal<'oauth'> {
  name = 'oauth' as const;
  config = {};
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native': false,
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': '>=13.0.0',
  };

  public loginWithPopup(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
      try {
        const startPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Start, [
          {
            ...configuration,
            apiKey: this.sdk.apiKey,
            platform: 'rn',
          },
        ]);

        const result = await this.request<OAuthRedirectStartResult | OAuthRedirectError>(startPayload);
        const successResult = result as OAuthRedirectStartResult;
        const errorResult = result as OAuthRedirectError;

        console.log('result: ', result);

        if (errorResult.error) {
          reject(
            this.createError<OAuthErrorData>(errorResult.error, errorResult.error_description ?? 'An error occurred.', {
              errorURI: errorResult.error_uri,
              provider: errorResult.provider,
            }),
          );
          return;
        }

        if (!successResult?.oauthAuthoriationURI) {
          reject(this.createError<object>('NO_AUTH_URI', 'No authorization URI was returned', {}));
          return;
        }

        const url = new URL(successResult.oauthAuthoriationURI, 'https://auth.magic.link/').href;
        const res = await WebBrowser.openAuthSessionAsync(url, configuration.redirectURI, {});

        if (res.type === 'success') {
          const queryString = new URL(res.url).search;
          resolve(getResult.call(this, queryString.toString()));
        } else {
          reject(this.createError<object>(res.type, 'User has cancelled the authentication', {}));
        }
      } catch (err: any) {
        reject(
          this.createError<object>(err.message, 'An error has occurred', {
            err,
          }),
        );
      }
    });
  }
}

export function getResult(this: OAuthExtension, queryString: string) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Verify, [
      {
        authorizationResponseParams: queryString,
        magicApiKey: this.sdk.apiKey,
        platform: 'rn',
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
