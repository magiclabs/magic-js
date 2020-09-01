import {
  MagicPayloadMethod,
  LoginWithMagicLinkConfiguration,
  RegisterWithWebAuthnConfiguration,
  LoginWithWebAuthnConfiguration,
} from '@magic-sdk/types';
import { BaseModule } from '../base-module';
import { createJsonRpcRequestPayload } from '../../core/json-rpc';
import { transformNewAssertionForServer, transformAssertionForServer } from '../../util/webauthn';
import { createWebAuthCreateCredentialError, createWebAuthnNotSupportError } from '../../core/sdk-exceptions';
import { SDKEnvironment } from '../../core/sdk-environment';

type LoginWithMagicLinkEvents = {
  'email-sent': () => void;
  'email-not-deliverable': () => void;
  retry: () => void;
};

export class AuthModule extends BaseModule {
  /**
   * Initiate the "magic link" login flow for a user. If the flow is successful,
   * this method will return a Decentralized ID token (with a default lifespan
   * of 15 minutes).
   */
  public loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    const { email, showUI = true, redirectURI } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithMagicLink, [
      { email, showUI, redirectURI },
    ]);
    return this.request<string | null, LoginWithMagicLinkEvents>(requestPayload);
  }

  /**
   * Log a user in with a special one-time-use credential token. This is
   * currently used during magic link flows with a configured redirect to
   * hydrate the user session at the end of the flow.
   *
   * If no argument is provided, a credential is automatically parsed from
   * `window.location.search`.
   */
  public loginWithCredential(credential?: string) {
    let queryString: string | undefined;

    if (!credential && SDKEnvironment.target === 'web') {
      queryString = window.location.search;

      // Remove the query from the redirect callback as a precaution.
      const urlWithoutQuery = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', urlWithoutQuery);
    }

    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithCredential, [
      credential,
      queryString,
    ]);

    return this.request<string | null>(requestPayload);
  }

  public async registerWithWebAuthn(configuration: RegisterWithWebAuthnConfiguration) {
    if (!window.PublicKeyCredential) {
      throw createWebAuthnNotSupportError();
    }
    const { username, nickname = '' } = configuration;

    const options = await this.request<any>(
      createJsonRpcRequestPayload(MagicPayloadMethod.WebAuthnRegistrationStart, [{ username }]),
    );

    let credential;
    try {
      credential = (await navigator.credentials.create({
        publicKey: options.credential_options,
      })) as any;
    } catch (err) {
      throw createWebAuthCreateCredentialError(err);
    }

    return this.request<string | null>(
      createJsonRpcRequestPayload(MagicPayloadMethod.RegisterWithWebAuth, [
        {
          id: options.id,
          nickname,
          transport: credential.response.getTransports(),
          user_agent: navigator.userAgent,
          registration_response: transformNewAssertionForServer(credential),
        },
      ]),
    );
  }

  public async loginWithWebAuthn(configuration: LoginWithWebAuthnConfiguration) {
    if (!window.PublicKeyCredential) {
      throw createWebAuthnNotSupportError();
    }
    const { username } = configuration;

    const transformedCredentialRequestOptions = await this.request<any>(
      createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithWebAuthn, [{ username }]),
    );

    let assertion;
    try {
      assertion = (await navigator.credentials.get({
        publicKey: transformedCredentialRequestOptions,
      })) as any;
    } catch (err) {
      throw createWebAuthCreateCredentialError(err);
    }

    return this.request<string | null>(
      createJsonRpcRequestPayload(MagicPayloadMethod.WebAuthnLoginVerfiy, [
        {
          username,
          assertion_response: transformAssertionForServer(assertion),
        },
      ]),
    );
  }
}
