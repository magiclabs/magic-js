import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Extension } from '@magic-sdk/react-native-bare';
import { getBundleId } from 'react-native-device-info';
import { createCryptoChallenge } from './crypto';
import {
  OAuthErrorData,
  OAuthPayloadMethods,
  OAuthRedirectConfiguration,
  OAuthRedirectError,
  OAuthRedirectResult,
} from './types';

export class OAuthExtension extends Extension.Internal<'oauth'> {
  name = 'oauth' as const;
  config = {};
  compat = {
    'magic-sdk': false,
    '@magic-sdk/react-native-bare': '>=13.0.0',
    '@magic-sdk/react-native-expo': false,
  };

  public loginWithPopup(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
      try {
        const { provider, query, redirectURI } = await createURI.call(this, configuration);
        const url = `https://auth.magic.link/v1/oauth2/${provider}/start?${query}`;

        /**
         * Response Type Inspired by:
         * https://docs.expo.io/versions/latest/sdk/webbrowser/#returns
         */
        const res = await InAppBrowser.openAuth(url, redirectURI, {});

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

const OAUTH_REDIRECT_METADATA_KEY = 'oauth_redirect_metadata';

export async function createURI(this: OAuthExtension, configuration: OAuthRedirectConfiguration) {
  // Bust any old, in-progress OAuth flows.
  await this.utils.storage.removeItem(OAUTH_REDIRECT_METADATA_KEY);

  // Unpack configuration, generate crypto values, and persist to storage.
  const { provider, redirectURI, scope, loginHint } = configuration;
  const { verifier, challenge, state } = await createCryptoChallenge();
  const bundleId = getBundleId();

  /* Stringify for RN Async storage */
  const storedData = JSON.stringify({
    verifier,
    state,
  });

  await this.utils.storage.setItem(OAUTH_REDIRECT_METADATA_KEY, storedData);

  // Formulate the initial redirect query to Magic's OAuth hub.
  // Required fields:
  //   - `magic_api_key`
  //   - `magic_challenge`
  //   - `state`
  //   - `redirect_uri`
  //   - `platform`
  // Optional fields:
  //   - `bundleId`

  const query = [
    `magic_api_key=${encodeURIComponent(this.sdk.apiKey)}`,
    `magic_challenge=${encodeURIComponent(challenge)}`,
    `state=${encodeURIComponent(state)}`,
    `platform=${encodeURIComponent('rn')}`,
    scope && `scope=${encodeURIComponent(scope.join(' '))}`,
    redirectURI && `redirect_uri=${encodeURIComponent(redirectURI)}`,
    loginHint && `login_hint=${encodeURIComponent(loginHint)}`,
    bundleId && `bundleId=${encodeURIComponent(bundleId)}`,
  ].reduce((prev, next) => (next ? `${prev}&${next}` : prev));

  return {
    query,
    provider,
    redirectURI,
  };
}

export function getResult(this: OAuthExtension, queryString: string) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const json: string = (await this.utils.storage.getItem(OAUTH_REDIRECT_METADATA_KEY)) || '';

    const { verifier, state } = JSON.parse(json);

    // Remove the save OAuth state from storage, it stays in memory now...
    this.utils.storage.removeItem(OAUTH_REDIRECT_METADATA_KEY);

    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.ParseRedirectResult, [
      queryString,
      verifier,
      state,
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
