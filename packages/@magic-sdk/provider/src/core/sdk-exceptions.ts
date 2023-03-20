import { JsonRpcError, RPCErrorCode, SDKErrorCode, SDKWarningCode } from '@magic-sdk/types';
import { isJsonRpcErrorCode } from '../util/type-guards';
import { SDKEnvironment } from './sdk-environment';
import { Extension } from '../modules/base-extension';

// --- Error/warning classes

/**
 * This error type represents internal SDK errors. This could be developer
 * mistakes (or Magic's mistakes), or execution errors unrelated to standard
 * JavaScript exceptions.
 */
export class MagicSDKError extends Error {
  __proto__ = Error;

  constructor(public code: SDKErrorCode, public rawMessage: string) {
    super(`Magic SDK Error: [${code}] ${rawMessage}`);
    Object.setPrototypeOf(this, MagicSDKError.prototype);
  }
}

/**
 * This error type communicates exceptions that occur during execution in the
 * Magic `<iframe>` context.
 */
export class MagicRPCError extends Error {
  __proto__ = Error;

  public code: RPCErrorCode | number;
  public rawMessage: string;
  public data: any;

  constructor(sourceError?: JsonRpcError | null) {
    super();

    const codeNormalized = Number(sourceError?.code);
    this.rawMessage = sourceError?.message || 'Internal error';
    this.code = isJsonRpcErrorCode(codeNormalized) ? codeNormalized : RPCErrorCode.InternalError;
    this.message = `Magic RPC Error: [${this.code}] ${this.rawMessage}`;
    this.data = sourceError?.data || undefined;

    Object.setPrototypeOf(this, MagicRPCError.prototype);
  }
}

/**
 * In contrast to `SDKError` objects, this "warning" type communicates important
 * context that does not rise to the level of an exception. These should be
 * logged rather than thrown.
 */
export class MagicSDKWarning {
  public message: string;

  constructor(public code: SDKWarningCode, public rawMessage: string) {
    this.message = `Magic SDK Warning: [${code}] ${rawMessage}`;
  }

  /**
   * Logs this warning to the console.
   */
  public log() {
    console.warn(this.message);
  }
}

/**
 * This error type is reserved for communicating errors that arise during
 * execution of Magic SDK Extension methods. Compare this to the `SDKError`
 * type, specifically in context of Extensions.
 */
export class MagicExtensionError<TData = any> extends Error {
  __proto__ = Error;

  constructor(ext: Extension<string>, public code: string | number, public rawMessage: string, public data: TData) {
    super(`Magic Extension Error (${ext.name}): [${code}] ${rawMessage}`);
    Object.setPrototypeOf(this, MagicExtensionError.prototype);
  }
}

/**
 * In contrast to `MagicExtensionError` objects, this "warning" type
 * communicates important context that does not rise to the level of an
 * exception. These should be logged rather than thrown.
 */
export class MagicExtensionWarning {
  public message: string;

  constructor(ext: Extension<string>, public code: string | number, public rawMessage: string) {
    this.message = `Magic Extension Warning (${ext.name}): [${code}] ${rawMessage}`;
  }

  /**
   * Logs this warning to the console.
   */
  public log() {
    console.warn(this.message);
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

export function createIncompatibleExtensionsError(extensions: Extension<string>[]) {
  let msg = `Some extensions are incompatible with \`${SDKEnvironment.sdkName}@${SDKEnvironment.version}\`:`;

  extensions
    .filter((ext) => typeof ext.compat !== 'undefined' && ext.compat !== null)
    .forEach((ext) => {
      const compat = ext.compat![SDKEnvironment.sdkName];

      /* istanbul ignore else */
      if (typeof compat === 'string') {
        msg += `\n  - Extension \`${ext.name}\` supports version(s) \`${compat}\``;
      } else if (!compat) {
        msg += `\n  - Extension \`${ext.name}\` does not support ${SDKEnvironment.platform} environments.`;
      }

      // Else case is irrelevant here here
      // (we filter out extensions with missing `compat` field)
    });

  return new MagicSDKError(SDKErrorCode.IncompatibleExtensions, msg);
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

export function createDeprecationWarning(options: {
  method: string;
  removalVersions: {
    [P in
      | 'magic-sdk'
      | '@magic-sdk/react-native'
      | '@magic-sdk/react-native-bare'
      | '@magic-sdk/react-native-expo']: string;
  };
  useInstead?: string;
}) {
  const { method, removalVersions, useInstead } = options;

  const removalVersion = removalVersions[SDKEnvironment.sdkName];
  const useInsteadSuffix = useInstead ? ` Use \`${useInstead}\` instead.` : '';
  const message = `\`${method}\` will be removed from \`${SDKEnvironment.sdkName}\` in version \`${removalVersion}\`.${useInsteadSuffix}`;

  return new MagicSDKWarning(SDKWarningCode.DeprecationNotice, message);
}
