import { RecencyCheckEventHandlers } from './auth-types';
import { DeepLinkPage } from '../core/deep-link-pages';

export interface GetIdTokenConfiguration {
  /**
   * The number of seconds until the generated ID token will expire.
   */
  lifespan?: number;
}

export interface GenerateIdTokenConfiguration extends GetIdTokenConfiguration {
  /**
   * An optional piece of data to sign with the token. Note, however, that the
   * unsigned data _will not_ be encoded in the token, only an encrypted
   * signature of the data.
   */
  attachment?: string;
}

export enum UserEventsEmit {
  ClosedByUser = 'closed-by-user',
}

export enum UserEventsOnReceived {
  ClosedByUser = 'closed-by-user-on-received',
}

export interface MagicUserMetadata {
  issuer: string | null;
  publicAddress: string | null;
  email: string | null;
  phoneNumber: string | null;
  isMfaEnabled: boolean;
  recoveryFactors: [RecoveryFactor];
}

export enum RecoveryFactorEventOnReceived {
  EnterNewPhoneNumber = 'enter-new-phone-number',
  EnterOtpCode = 'enter-otp-code',
  RecoveryFactorAlreadyExists = 'recovery-factor-already-exists',
  InvalidOtpCode = 'invalid-otp-code',
}

export enum RecoveryFactorEventEmit {
  SendNewPhoneNumber = 'send-new-phone-number',
  SendOtpCode = 'send-otp-code',
  StartEditPhoneNumber = 'start-edit-phone-number',
}

type RecoveryFactor = {
  type: RecoveryMethodType;
  value: string;
};

export type RecoveryFactorEventHandlers = {
  // Event Received
  [RecoveryFactorEventEmit.SendNewPhoneNumber]: (phone_number: string) => void;
  [RecoveryFactorEventEmit.SendOtpCode]: (otp: string) => void;
  [RecoveryFactorEventEmit.StartEditPhoneNumber]: () => void;

  // Event sent
  [RecoveryFactorEventOnReceived.EnterNewPhoneNumber]: () => void;
  [RecoveryFactorEventOnReceived.EnterOtpCode]: () => void;
  [RecoveryFactorEventOnReceived.RecoveryFactorAlreadyExists]: () => void;
  [RecoveryFactorEventOnReceived.InvalidOtpCode]: () => void;
} & RecencyCheckEventHandlers;

export enum RecoveryMethodType {
  PhoneNumber = 'phone_number',
}

export interface UpdateEmailConfiguration {
  /**
   * The new email address to update to
   */
  email: string;

  /**
   * When `true`, a pre-built pending modal interface will
   * guide the user to check their new, followed by old emails
   * for confirmation emails.
   */
  showUI?: boolean;
}

export interface UpdateWebAuthnInfoConfiguration {
  /**
   *  WebAuthn info id
   */
  id: string;

  /**
   *  nickname that user attempts to update to the webauth device associate to the id.
   */
  nickname: string;
}

export interface RecoverAccountConfiguration {
  /**
   * The email to recover
   */
  email: string;
}

export interface ShowSettingsConfiguration {
  /**
   * deep linking destination
   */
  page: DeepLinkPage;
  showUI?: boolean;
}
