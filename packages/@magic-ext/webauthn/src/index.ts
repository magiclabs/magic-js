import { Extension } from '@magic-sdk/provider';
import {
  RegisterNewUserConfiguration,
  LoginWithWebAuthnConfiguration,
  MagicWebAuthnPayloadMethod,
  WebAuthnSDKErrorCode,
  UpdateWebAuthnInfoConfiguration,
} from './types';
import {
  PasskeyResult,
  PasskeyEventHandlers,
  PasskeyMFAEventEmit,
  PasskeyMFAEventOnReceived,
} from '@magic-sdk/types';
import { toJSON } from './utils/polyfills';

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
          registrationResponse: toJSON(credential),
          nickname,
          transport: credential.response.getTransports(),
          userAgent: navigator.userAgent,
          skipDIDToken,
          lifespan,
        },
      ]),
    );
  }

  public login(configuration: LoginWithWebAuthnConfiguration) {
    const { username, showMfaModal, skipDIDToken, lifespan } = configuration;

    let verifyPayloadId: string;

    const promiEvent = this.utils.createPromiEvent<PasskeyResult, PasskeyEventHandlers>(async (resolve, reject) => {
      if (!window.PublicKeyCredential) {
        return reject(this.createWebAuthnNotSupportError());
      }

      const { authenticationToken, authenticationOptions } = await this.request<any>(
        this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.LoginWithPasskeyStart, [{ username }]),
      );

      let assertion;
      try {
        assertion = (await navigator.credentials.get({
          publicKey: authenticationOptions,
        })) as any;
      } catch (err: any) {
        return reject(this.createWebAuthCreateCredentialError(err));
      }

      const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.LoginWithPasskeyVerify, [
        {
          authenticationToken,
          assertionResponse: toJSON(assertion),
          showUI: showMfaModal,
          skipDIDToken,
          lifespan,
        },
      ]);

      verifyPayloadId = requestPayload.id as string;

      const loginRequest = this.request<PasskeyResult, PasskeyEventHandlers>(requestPayload);

      if (!showMfaModal) {
        loginRequest.on(PasskeyMFAEventOnReceived.MfaSentHandle, () => {
          promiEvent.emit(PasskeyMFAEventOnReceived.MfaSentHandle);
        });
        loginRequest.on(PasskeyMFAEventOnReceived.InvalidMfaOtp, () => {
          promiEvent.emit(PasskeyMFAEventOnReceived.InvalidMfaOtp);
        });
        loginRequest.on(PasskeyMFAEventOnReceived.RecoveryCodeSentHandle, () => {
          promiEvent.emit(PasskeyMFAEventOnReceived.RecoveryCodeSentHandle);
        });
        loginRequest.on(PasskeyMFAEventOnReceived.InvalidRecoveryCode, () => {
          promiEvent.emit(PasskeyMFAEventOnReceived.InvalidRecoveryCode);
        });
        loginRequest.on(PasskeyMFAEventOnReceived.RecoveryCodeSuccess, () => {
          promiEvent.emit(PasskeyMFAEventOnReceived.RecoveryCodeSuccess);
        });
      }

      try {
        const result = await loginRequest;
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    if (!showMfaModal && promiEvent) {
      promiEvent.on(PasskeyMFAEventEmit.VerifyMFACode, (mfa: string) => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.VerifyMFACode, verifyPayloadId)(mfa);
      });
      promiEvent.on(PasskeyMFAEventEmit.LostDevice, () => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.LostDevice, verifyPayloadId)();
      });
      promiEvent.on(PasskeyMFAEventEmit.VerifyRecoveryCode, (recoveryCode: string) => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.VerifyRecoveryCode, verifyPayloadId)(recoveryCode);
      });
      promiEvent.on(PasskeyMFAEventEmit.Cancel, () => {
        this.createIntermediaryEvent(PasskeyMFAEventEmit.Cancel, verifyPayloadId)();
      });
    }

    return promiEvent;
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
          registration_response: toJSON(credential),
        },
      ]),
    );
  }

  public getMetadata() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicWebAuthnPayloadMethod.GetWebAuthnInfo, []);
    return this.request<any[]>(requestPayload);
  }
}
