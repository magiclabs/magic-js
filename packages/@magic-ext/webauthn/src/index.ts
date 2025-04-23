import { Extension } from '@magic-sdk/commons';
import {
  RegisterNewUserConfiguration,
  LoginWithWebAuthnConfiguration,
  MagicWebAuthnPayloadMethod,
  WebAuthnSDKErrorCode,
  UpdateWebAuthnInfoConfiguration,
} from './types';
import { transformAssertionForServer, transformNewAssertionForServer } from './utils/webauthn.js';

export class WebAuthnExtension extends Extension.Internal<'webauthn', any> {
  name = 'webauthn' as const;
  config: any = {};

  private createWebAuthnNotSupportError() {
    this.createError(WebAuthnSDKErrorCode.WebAuthnNotSupported, 'WebAuthn is not supported in this device.', {});
  }

  private createWebAuthCreateCredentialError(message: string) {
    this.createError(WebAuthnSDKErrorCode.WebAuthnCreateCredentialError, `Error creating credential: ${message}`, {});
  }

  public async registerNewUser(configuration: RegisterNewUserConfiguration) {
    if (!window.PublicKeyCredential) {
      throw this.createWebAuthnNotSupportError();
    }
    const { username, nickname = '' } = configuration;

    const options = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.WebAuthnRegistrationStart, [{ username }]),
    );

    let credential;
    try {
      credential = (await navigator.credentials.create({
        publicKey: options.credential_options,
      })) as any;
    } catch (err: any) {
      throw this.createWebAuthCreateCredentialError(err);
    }

    return this.request<string | null>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.RegisterWithWebAuth, [
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

  public async login(configuration: LoginWithWebAuthnConfiguration) {
    if (!window.PublicKeyCredential) {
      throw this.createWebAuthnNotSupportError();
    }
    const { username } = configuration;

    const transformedCredentialRequestOptions = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.LoginWithWebAuthn, [{ username }]),
    );

    let assertion;
    try {
      assertion = (await navigator.credentials.get({
        publicKey: transformedCredentialRequestOptions,
      })) as any;
    } catch (err: any) {
      throw this.createWebAuthCreateCredentialError(err);
    }

    return this.request<string | null>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.WebAuthnLoginVerify, [
        {
          username,
          assertion_response: transformAssertionForServer(assertion),
        },
      ]),
    );
  }

  public updateInfo(configuration: UpdateWebAuthnInfoConfiguration) {
    const { id, nickname } = configuration;
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.UpdateWebAuthnInfo, [
      {
        webAuthnCredentialsId: id,
        nickname,
      },
    ]);
    return this.request<any[]>(requestPayload);
  }

  public unregisterDevice(id: string) {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.UnregisterWebAuthDevice, [
      {
        webAuthnCredentialsId: id,
      },
    ]);

    return this.request<any>(requestPayload);
  }

  public async registerNewDevice(nickname = '') {
    if (!window.PublicKeyCredential) {
      throw this.createWebAuthnNotSupportError();
    }
    const options = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.RegisterWebAuthDeviceStart, []),
    );

    let credential;
    try {
      credential = (await navigator.credentials.create({
        publicKey: options.credential_options,
      })) as any;
    } catch (err: any) {
      throw this.createWebAuthCreateCredentialError(err);
    }

    return this.request<string | null>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.RegisterWebAuthDevice, [
        {
          nickname,
          transport: credential.response.getTransports(),
          user_agent: navigator.userAgent,
          registration_response: transformNewAssertionForServer(credential),
        },
      ]),
    );
  }

  public getMetadata() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.GetWebAuthnInfo, []);
    return this.request<any[]>(requestPayload);
  }
}
