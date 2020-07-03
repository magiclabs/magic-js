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
    const { email, showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithMagicLink, [{ email, showUI }]);
    return this.request<string | null, LoginWithMagicLinkEvents>(requestPayload);
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
