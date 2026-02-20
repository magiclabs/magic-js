import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Extension } from '@magic-sdk/react-native-bare';
import {
  OAuthErrorData,
  OAuthPayloadMethods,
  OAuthRedirectConfiguration,
  OAuthRedirectError,
  OAuthRedirectResult,
  OAuthRedirectStartResult,
} from './types';
import { createCryptoChallenge } from './crypto';

export class OAuthExtension extends Extension.Internal<'oauth'> {
  name = 'oauth' as const;
  config = {};
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native-bare': '>=13.0.0',
    '@magic-sdk/react-native-expo': false,
    '@magic-sdk/react-native': false,
  };

  public loginWithPopup(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
      try {
        const { codeVerifier, codeChallenge, cryptoChallengeState } = createCryptoChallenge();

        const startPayload = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Start, [
          {
            ...configuration,
            apiKey: this.sdk.apiKey,
            platform: 'rn',
            codeChallenge,
            cryptoChallengeState,
            // codeVerifier is intentionally NOT sent here — it stays in the SDK closure.
          },
        ]);

        const result = await this.request<OAuthRedirectStartResult | OAuthRedirectError>(startPayload);
        const successResult = result as OAuthRedirectStartResult;
        const errorResult = result as OAuthRedirectError;

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

        const url = successResult.oauthAuthoriationURI;
        const res = await InAppBrowser.openAuth(url, configuration.redirectURI, {});

        if (res.type === 'success') {
          const queryString = new URL(res.url).search;
          // Build clientMetadata from closure — codeVerifier and pkceMetadata never left this scope.
          const clientMetadata = successResult.pkceMetadata
            ? { codeVerifier, ...successResult.pkceMetadata }
            : undefined;

          // State verification for the new PKCE path.
          // The extension generated the state, so it verifies it here — before any RPC call — as CSRF protection.
          // In the legacy path (no clientMetadata), embedded-wallet handles state verification itself.
          if (clientMetadata) {
            const returnedState = new URLSearchParams(queryString).get('state');
            if (!returnedState || returnedState !== clientMetadata.state) {
              reject(this.createError<object>('STATE_MISMATCH', 'OAuth state parameter mismatch — request may have been tampered with', {}));
              return;
            }
          }

          resolve(getResult.call(this, queryString.toString(), clientMetadata));
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

export function getResult(
  this: OAuthExtension,
  queryString: string,
  clientMetadata?: Record<string, string>,
) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.Verify, [
      {
        authorizationResponseParams: queryString,
        magicApiKey: this.sdk.apiKey,
        platform: 'rn',
        // Forward full metadata from closure (new PKCE path).
        // When absent, embedded-wallet falls back to its stored metadata (backward compat).
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
