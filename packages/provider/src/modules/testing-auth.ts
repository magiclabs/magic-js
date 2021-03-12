import { LoginWithMagicLinkConfiguration, MagicPayloadMethod } from '@magic-sdk/types';
import { BaseModule } from './base-module';
import { createJsonRpcRequestPayload } from '../core/json-rpc';
import { SDKEnvironment } from '../core/sdk-environment';

type LoginWithMagicLinkEvents = {
  'email-sent': () => void;
  'email-not-deliverable': () => void;
  retry: () => void;
};

export class TestingAuthModule extends BaseModule {
  public loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    const { email, showUI = true, redirectURI } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithMagicLinkTestMode, [
      { email, showUI, redirectURI },
    ]);
    return this.request<string | null, LoginWithMagicLinkEvents>(requestPayload);
  }

  public loginWithCredential(credentialOrQueryString?: string) {
    let credentialResolved = credentialOrQueryString ?? '';

    if (!credentialOrQueryString && SDKEnvironment.platform === 'web') {
      credentialResolved = window.location.search;

      // Remove the query from the redirect callback as a precaution.
      const urlWithoutQuery = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', urlWithoutQuery);
    }

    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithCredentialTestMode, [
      credentialResolved,
    ]);

    return this.request<string | null>(requestPayload);
  }
}
