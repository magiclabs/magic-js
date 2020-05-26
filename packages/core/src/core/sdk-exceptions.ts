import { SDKErrorCode, SDKWarningCode, RPCErrorCode, JsonRpcError } from '@magic-sdk/types';
import { isJsonRpcErrorCode } from '../util/type-guards';
import { SDKEnvironment } from './sdk';

// --- Error/warning classes

export class MagicSDKError extends Error {
  __proto__ = Error;

  constructor(public code: SDKErrorCode, public rawMessage: string) {
    super(`Magic SDK Error: [${code}] ${rawMessage}`);
    Object.setPrototypeOf(this, MagicSDKError.prototype);
  }
}

export class MagicSDKWarning {
  public message: string;

  constructor(public code: SDKWarningCode, public rawMessage: string) {
    this.message = `Magic SDK Warning: [${code}] ${rawMessage}`;
  }

  public log() {
    console.warn(this.message);
  }
}

export class MagicRPCError extends Error {
  __proto__ = Error;

  public code: RPCErrorCode;
  public rawMessage: string;

  constructor(sourceError?: JsonRpcError | null) {
    super();

    const codeNormalized = Number(sourceError?.code);
    this.rawMessage = sourceError?.message || 'Internal error';
    this.code = isJsonRpcErrorCode(codeNormalized) ? codeNormalized : RPCErrorCode.InternalError;
    this.message = `Magic RPC Error: [${this.code}] ${this.rawMessage}`;

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

export function createExtensionNotInitializedError(member: string) {
  return new MagicSDKError(
    SDKErrorCode.ExtensionNotInitialized,
    `Extensions must be initialized with a Magic SDK instance before \`Extension.${member}\` can be accessed. Do not invoke \`Extension.${member}\` inside an extension constructor.`,
  );
}

export function createInvalidArgumentError(options: {
  procedure: string;
  argument: number;
  expected: string;
  received: string;
}) {
  /**
   * Parses the argument index (given by `argument`) to attach the correct ordinal suffix.
   * (i.e.: 1st, 2nd, 3rd, 4th, etc.)
   */
  const ordinalSuffix = (i: number) => {
    const iAdjusted = i + 1; // Argument is zero-indexed.
    const j = iAdjusted % 10;
    const k = iAdjusted % 100;
    if (j === 1 && k !== 11) return `${iAdjusted}st`;
    if (j === 2 && k !== 12) return `${iAdjusted}nd`;
    if (j === 3 && k !== 13) return `${iAdjusted}rd`;
    return `${iAdjusted}th`;
  };

  return new MagicSDKError(
    SDKErrorCode.InvalidArgument,
    `Invalid ${ordinalSuffix(options.argument)} argument given to \`${options.procedure}\`.\n` +
      `  Expected: \`${options.expected}\`\n` +
      `  Received: \`${options.received}\``,
  );
}

// --- SDK warning factories

export function createDuplicateIframeWarning() {
  return new MagicSDKWarning(SDKWarningCode.DuplicateIframe, 'Duplicate iframes found.');
}

export function createSynchronousWeb3MethodWarning() {
  return new MagicSDKWarning(
    SDKWarningCode.SyncWeb3Method,
    'Non-async web3 methods are deprecated in web3 > 1.0 and are not supported by the Magic web3 provider. Please use an async method instead.',
  );
}

export function createReactNativeEndpointConfigurationWarning() {
  return new MagicSDKWarning(
    SDKWarningCode.ReactNativeEndpointConfiguration,
    `CUSTOM DOMAINS ARE NOT SUPPORTED WHEN USING MAGIC SDK WITH REACT NATIVE! The \`endpoint\` parameter SHOULD NOT be provided. The Magic \`<iframe>\` is automatically wrapped by a WebView pointed at \`${SDKEnvironment.defaultEndpoint}\`. Changing this default behavior will lead to unexpected results and potentially security-threatening bugs.`,
  );
}
