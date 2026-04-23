import { Extension } from '@magic-sdk/provider';
import {
  RegisterNewUserConfiguration,
  LoginWithWebAuthnConfiguration,
  MagicWebAuthnPayloadMethod,
  WebAuthnSDKErrorCode,
  UpdateWebAuthnInfoConfiguration,
} from './types';
import { transformAssertionForServer, transformRegistrationForServer } from './utils/webauthn.js';
import { PasskeyResult, PasskeyEventHandlers, PasskeyMFAEventEmit } from '@magic-sdk/types';

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
    const { username, nickname = '', skipDIDToken, lifespan } = configuration;

    const { registrationOptions, registrationToken } = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.RegisterPasskeyStart, [{ username }]),
    );

    let credential;
    try {
      credential = (await navigator.credentials.create({
        publicKey: registrationOptions,
      })) as any;
    } catch (err: any) {
      throw this.createWebAuthCreateCredentialError(err);
    }

    return this.request<string | null>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.RegisterPasskeyVerify, [
        {
          registrationToken,
          registrationResponse: transformRegistrationForServer(credential),
          nickname,
          transport: credential.response.getTransports(),
          userAgent: navigator.userAgent,
          skipDIDToken,
          lifespan,
        },
      ]),
    );
  }

  public async login(configuration: LoginWithWebAuthnConfiguration) {
    if (!window.PublicKeyCredential) {
      throw this.createWebAuthnNotSupportError();
    }
    const { username, showMfaModal, skipDIDToken, lifespan } = configuration;

    const { authenticationToken, authenticationOptions } = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.LoginWithPasskeyStart, [{ username }]),
    );

    let assertion;
    try {
      assertion = (await navigator.credentials.get({
        publicKey: authenticationOptions,
      })) as any;
    } catch (err: any) {
      throw this.createWebAuthCreateCredentialError(err);
    }

    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.LoginWithPasskeyVerify, [
      {
        authenticationToken,
        assertionResponse: transformAssertionForServer(assertion),
        showUI: showMfaModal,
        skipDIDToken,
        lifespan,
      },
    ]);

    const handle = this.request<PasskeyResult, PasskeyEventHandlers>(requestPayload);

    if (!showMfaModal) {
      handle.on(PasskeyMFAEventEmit.VerifyMFACode, (mfa: string) => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.VerifyMFACode, requestPayload.id as string)(mfa);
      });
      handle.on(PasskeyMFAEventEmit.LostDevice, () => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.LostDevice, requestPayload.id as string)();
      });
      handle.on(PasskeyMFAEventEmit.VerifyRecoveryCode, (recoveryCode: string) => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.VerifyRecoveryCode, requestPayload.id as string)(recoveryCode);
      });
      handle.on(PasskeyMFAEventEmit.Cancel, () => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.Cancel, requestPayload.id as any)();
      });
    }

    return handle;
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
          registration_response: transformRegistrationForServer(credential),
        },
      ]),
    );
  }

  public getMetadata() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.GetWebAuthnInfo, []);
    return this.request<any[]>(requestPayload);
  }
}
