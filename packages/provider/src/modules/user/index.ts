import {
  GetIdTokenConfiguration,
  MagicPayloadMethod,
  MagicUserMetadata,
  GenerateIdTokenConfiguration,
  UpdateEmailConfiguration,
  UpdateWebAuthnInfoConfiguration,
} from '@magic-sdk/types';
import { BaseModule } from '../base-module';
import { createJsonRpcRequestPayload } from '../../core/json-rpc';
import { transformNewAssertionForServer } from '../../util/webauthn';
import { createWebAuthCreateCredentialError, createWebAuthnNotSupportError } from '../..';

type UpdateEmailEvents = {
  'email-sent': () => void;
  'email-not-deliverable': () => void;
  'old-email-confirmed': () => void;
  'new-email-confirmed': () => void;
  retry: () => void;
};

export class UserModule extends BaseModule {
  /** */
  public getIdToken(configuration?: GetIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetIdToken, [configuration]);
    return this.request<string>(requestPayload);
  }

  /** */
  public generateIdToken(configuration?: GenerateIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GenerateIdToken, [configuration]);
    return this.request<string>(requestPayload);
  }

  /** */
  public getMetadata() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetMetadata);
    return this.request<MagicUserMetadata>(requestPayload);
  }

  /** */
  public updateEmail(configuration: UpdateEmailConfiguration) {
    const { email, showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.UpdateEmail, [{ email, showUI }]);
    return this.request<string | null, UpdateEmailEvents>(requestPayload);
  }

  /** */
  public isLoggedIn() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.IsLoggedIn);
    return this.request<boolean>(requestPayload);
  }

  /** */
  public logout() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Logout);
    return this.request<boolean>(requestPayload);
  }

  public getWebAuthnInfo() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetWebAuthnInfo, []);
    return this.request<any[]>(requestPayload);
  }

  public updateWebAuthnInfo(configuration: UpdateWebAuthnInfoConfiguration) {
    const { id, nickname } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.UpdateWebAuthnInfo, [
      {
        webAuthnCredentialsId: id,
        nickname,
      },
    ]);
    return this.request<any[]>(requestPayload);
  }

  public unregisterWebAuthnDevice(id: string) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.UnregisterWebAuthDevice, [
      {
        webAuthnCredentialsId: id,
      },
    ]);

    return this.request<any>(requestPayload);
  }

  public async registerWebAuthnDevice(nickname = '') {
    if (!window.PublicKeyCredential) {
      throw createWebAuthnNotSupportError();
    }
    const options = await this.request<any>(
      createJsonRpcRequestPayload(MagicPayloadMethod.RegisterWebAuthDeviceStart, []),
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
      createJsonRpcRequestPayload(MagicPayloadMethod.RegisterWebAuthDevice, [
        {
          nickname,
          transport: credential.response.getTransports(),
          user_agent: navigator.userAgent,
          registration_response: transformNewAssertionForServer(credential),
        },
      ]),
    );
  }
}
