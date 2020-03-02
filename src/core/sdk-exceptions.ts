import { SDKErrorCode, SDKWarningCode, RPCErrorCode, JsonRpcError } from '../types';
import { isJsonRpcErrorCode } from '../util/type-guards';

// --- Error/warning classes

export class MagicSDKError extends Error {
  __proto__ = Error;

  constructor(public code: SDKErrorCode, message: string) {
    super(`Magic SDK Error: [${code}] ${message}`);
    Object.setPrototypeOf(this, MagicSDKError.prototype);
  }
}

export class MagicSDKWarning {
  public message: string;

  constructor(public code: SDKWarningCode, message: string) {
    this.message = `Magic SDK Warning: [${code}] ${message}`;
  }

  public log() {
    console.warn(this.message);
  }
}

export class MagicRPCError extends Error {
  __proto__ = Error;

  public code: RPCErrorCode;

  constructor(sourceError?: JsonRpcError | null) {
    super();

    const codeNormalized = Number(sourceError?.code);
    const messageNormalized = sourceError?.message || 'Internal error';
    this.code = isJsonRpcErrorCode(codeNormalized) ? codeNormalized : RPCErrorCode.InternalError;
    this.message = `Magic RPC Error: [${this.code}] ${messageNormalized}`;

    Object.setPrototypeOf(this, MagicRPCError.prototype);
  }
}

// --- SDK error factories

export function createMissingApiKeyError() {
  return new MagicSDKError(
    SDKErrorCode.MissingApiKey,
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
}

export function createModalNotReadyError() {
  return new MagicSDKError(SDKErrorCode.ModalNotReady, 'Modal is not ready.');
}

export function createMalformedResponseError() {
  return new MagicSDKError(SDKErrorCode.MalformedResponse, 'Response from the Magic iframe is malformed.');
}

// --- SDK warning factories

export function createDuplicateIframeWarning() {
  return new MagicSDKWarning(SDKWarningCode.DuplicateIframe, 'Duplicate iframes found.');
}
