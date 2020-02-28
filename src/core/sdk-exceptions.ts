import { ErrorCode, WarningCode } from '../types';

// --- Base error/warning classes

export class MagicSDKError extends Error {
  __proto__ = Error;

  constructor(public code: ErrorCode, message: string) {
    super(`Magic SDK Error: [${code}] ${message}`);
    Object.setPrototypeOf(this, MagicSDKError.prototype);
  }
}

export class MagicSDKWarning {
  public message: string;

  constructor(public code: WarningCode, message: string) {
    this.message = `Magic SDK Warning: [${code}] ${message}`;
  }

  public log() {
    console.warn(this.message);
  }
}

// --- SDK error factories

export function createMissingApiKeyError() {
  return new MagicSDKError(
    ErrorCode.MissingApiKey,
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
}

export function createModalNotReadyError() {
  return new MagicSDKError(ErrorCode.ModalNotReady, 'Modal is not ready.');
}

export function createMalformedResponseError() {
  return new MagicSDKError(ErrorCode.MalformedResponse, 'Response from the Magic iframe is malformed.');
}

// --- SDK Warning factories

export function createDuplicateIframeWarning() {
  return new MagicSDKWarning(WarningCode.DuplicateIframe, 'Duplicate iframes found.');
}
