/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Extension } from '@magic-sdk/commons';
import {
  OAuthErrorData,
  OAuthPayloadMethods,
  OAuthRedirectError,
  OAuthRedirectResult,
  OAuthRedirectConfiguration,
} from './types';
import { createCryptoChallenge } from './crypto';

export class OAuthExtension extends Extension.Internal<'oauth'> {
  name = 'oauth' as const;
  config = {};
  compat = {
    'magic-sdk': '>=2.4.6',
    '@magic-sdk/react-native': false,
    '@magic-sdk/react-native-bare': false,
    '@magic-sdk/react-native-expo': false,
  };

  public loginWithRedirect(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<void>(async (resolve) => {
      const { provider, query } = await createURI.call(this, configuration);

      // @ts-ignore - this.sdk.endpoint is marked protected but we need to access it.
      window.location.href = new URL(`/v1/oauth2/${provider}/start?${query}`, this.sdk.endpoint).href;

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
}

const OAUTH_REDIRECT_METADATA_KEY = 'oauth_redirect_metadata';

async function createURI(this: OAuthExtension, configuration: OAuthRedirectConfiguration) {
  // Bust any old, in-progress OAuth flows.
  await this.utils.storage.removeItem(OAUTH_REDIRECT_METADATA_KEY);

  // Unpack configuration, generate crypto values, and persist to storage.
  const { provider, redirectURI, scope, loginHint } = configuration;
  const { verifier, challenge, state } = await createCryptoChallenge();

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

  const query = [
    `magic_api_key=${encodeURIComponent(this.sdk.apiKey)}`,
    `magic_challenge=${encodeURIComponent(challenge)}`,
    `state=${encodeURIComponent(state)}`,
    `platform=${encodeURIComponent('web')}`,
    scope && `scope=${encodeURIComponent(scope.join(' '))}`,
    redirectURI && `redirect_uri=${encodeURIComponent(redirectURI)}`,
    loginHint && `login_hint=${encodeURIComponent(loginHint)}`,
  ].reduce((prev, next) => (next ? `${prev}&${next}` : prev));

  return {
    query,
    provider,
    redirectURI,
  };
}

function getResult(this: OAuthExtension, queryString: string, lifespan?: number) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const json: string = (await this.utils.storage.getItem(OAUTH_REDIRECT_METADATA_KEY)) as string;

    const { verifier, state } = JSON.parse(json);

    // Remove the save OAuth state from storage, it stays in memory now...
    this.utils.storage.removeItem(OAUTH_REDIRECT_METADATA_KEY);

    const parseRedirectResult = this.utils.createJsonRpcRequestPayload(OAuthPayloadMethods.ParseRedirectResult, [
      queryString,
      verifier,
      state,
      lifespan,
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
