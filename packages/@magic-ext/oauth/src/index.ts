/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Extension } from '@magic-sdk/commons';
import {
  OAuthErrorData,
  OAuthPayloadMethods,
  OAuthRedirectError,
  OAuthRedirectResult,
  OAuthRedirectConfiguration,
  OAuthPopupConfiguration,
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

      // REVERT BACK THIS IS JUST A TEST
      // @ts-ignore - this.sdk.endpoint is marked protected but we need to access it.
      window.location.href = new URL(`/v1/oauth2/${provider}/start?${query}`, 'http://localhost:3014').href;

      resolve();
    });
  }

  public loginWithRedirectV2(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<void>(async (resolve) => {
      console.log('loginWithRedirectV2', configuration);

      const parseRedirectResult = this.utils.createJsonRpcRequestPayload('magic_oauth_login_with_redirect_start', [
        {
          ...configuration,
          apiKey: this.sdk.apiKey,
          platform: 'web',
        },
      ]);

      console.log('loginWithRedirectV2: rpc payload', parseRedirectResult);

      const result = await this.request<any>(parseRedirectResult);

      console.log('loginWithRedirectV2: rpc resultsss', result);

      // TODO: handle error like allowlist not matching

      if (result?.oauthAuthoriationURI) {
        window.location.href = result.oauthAuthoriationURI;
      }

      resolve();
    });
  }

  public loginWithRedirectV2_2(configuration: OAuthRedirectConfiguration) {
    return this.utils.createPromiEvent<void>(async (resolve) => {
      console.log('loginWithRedirectV2_2', configuration);

      // @ts-ignore - this.sdk.endpoint is marked protected but we need to access it.
      window.open(`${this.sdk.endpoint}/rpc/magic/oauth-login-with-redirect-start-2`, '_blank');

      resolve();
    });
  }

  public loginWithPopup(configuration: OAuthPopupConfiguration) {
    console.log('loginWithPopup', configuration);
    // @ts-ignore - this.sdk.endpoint is marked protected but we need to access it.
    window.open(`${this.sdk.endpoint}/v1/oauth2/popup/${configuration.provider}/start`, '_blank');
  }

  public getRedirectResult() {
    const queryString = window.location.search;

    // Remove the query from the redirect callback as a precaution to prevent
    // malicious parties from parsing it before we have a chance to use it.
    const urlWithoutQuery = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', urlWithoutQuery);

    return getResult.call(this, queryString);
  }

  public getRedirectResultV2() {
    console.log('getRedirectResultV2');
    const queryString = window.location.search;

    console.log('getRedirectResultV2 ', queryString);

    // Remove the query from the redirect callback as a precaution to prevent
    // malicious parties from parsing it before we have a chance to use it.
    const urlWithoutQuery = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', urlWithoutQuery);

    return getResultV2.call(this, queryString);
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

function getResult(this: OAuthExtension, queryString: string) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const json: string = (await this.utils.storage.getItem(OAUTH_REDIRECT_METADATA_KEY)) as string;

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

function getResultV2(this: OAuthExtension, queryString: string) {
  return this.utils.createPromiEvent<OAuthRedirectResult>(async (resolve, reject) => {
    const parseRedirectResult = this.utils.createJsonRpcRequestPayload('magic_oauth_parse_redirect_verify', [
      {
        authorizationResponseParams: queryString,
        magicApiKey: this.sdk.apiKey,
        platform: 'web',
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
