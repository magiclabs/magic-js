import { Extension } from '@magic-sdk/provider';
import {
  RegisterNewUserConfiguration,
  MagicPasskeyPayloadMethod,
  PasskeySDKErrorCode,
  LoginWithPasskeyConfiguration,
} from './types';
import {
  PasskeyResult,
  PasskeyEventHandlers,
  PasskeyMFAEventEmit,
  PasskeyMFAEventOnReceived,
  PasskeyMetadata,
} from '@magic-sdk/types';
import { toJSON } from './utils/polyfills';

export class PasskeyExtension extends Extension.Internal<'passkey', any> {
  name = 'passkey' as const;
  config: any = {};

  private createPasskeyNotSupportError() {
    this.createError(PasskeySDKErrorCode.PasskeyNotSupported, 'Passkey is not supported in this device.', {});
  }

  private createPasskeyCreateCredentialError(message: string) {
    this.createError(PasskeySDKErrorCode.PasskeyRegisterError, `Error creating credential: ${message}`, {});
  }

  public async registerNewUser(configuration?: RegisterNewUserConfiguration) {
    if (!window.PublicKeyCredential) {
      throw this.createPasskeyNotSupportError();
    }
    const { username, nickname = '', skipDIDToken, lifespan } = configuration ?? {};

    const { registrationOptions, registrationToken } = await this.request<any>(
      this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.RegisterPasskeyStart, [{ username }]),
    );

    let credential;
    try {
      credential = (await navigator.credentials.create({
        publicKey: registrationOptions,
      })) as any;
    } catch (err: any) {
      throw this.createPasskeyCreateCredentialError(err);
    }

    return this.request<PasskeyResult>(
      this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.RegisterPasskeyVerify, [
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

  public login(configuration?: LoginWithPasskeyConfiguration) {
    const { username, showMfaModal, skipDIDToken, lifespan } = configuration ?? {};

    let verifyPayloadId: string;

    const promiEvent = this.utils.createPromiEvent<PasskeyResult, PasskeyEventHandlers>(async (resolve, reject) => {
      if (!window.PublicKeyCredential) {
        return reject(this.createPasskeyNotSupportError());
      }

      const { authenticationToken, authenticationOptions } = await this.request<any>(
        this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.LoginWithPasskeyStart, [{ username }]),
      );

      let assertion;
      try {
        assertion = (await navigator.credentials.get({
          publicKey: authenticationOptions,
        })) as any;
      } catch (err: any) {
        return reject(this.createPasskeyCreateCredentialError(err));
      }

      const requestPayload = this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.LoginWithPasskeyVerify, [
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

  public getMetadata() {
    const requestPayload = this.utils.createJsonRpcRequestPayload(MagicPasskeyPayloadMethod.GetPasskeyInfo, []);
    return this.request<PasskeyMetadata>(requestPayload);
  }
}
