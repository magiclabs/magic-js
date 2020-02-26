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

export function createInvalidArgumentError(options: {
  functionName: string;
  argIndex: number;
  expected: string;
  received: string;
}) {
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
    ErrorCode.InvalidArgument,
    `Invalid ${ordinalSuffix(options.argIndex)} argument given to \`${options.functionName}\`.\n` +
      `  Expected: \`${options.expected}\`\n` +
      `  Received: \`${options.received}\``,
  );
}

// --- SDK Warning factories

export function createDuplicateIframeWarning() {
  return new MagicSDKWarning(WarningCode.DuplicateIframe, 'Duplicate iframes found.');
}
