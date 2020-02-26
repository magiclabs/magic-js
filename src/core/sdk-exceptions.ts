import { ErrorCode, WarningCode } from '../types';

// --- Base error/warning classes

export class MagicError extends Error {
  __proto__ = Error;

  constructor(public code: ErrorCode, message: string) {
    super(`Magic SDK Error: [${code}] ${message}`);
    Object.setPrototypeOf(this, MagicError.prototype);
  }
}

export class MagicWarning {
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
  return new MagicError(
    ErrorCode.MissingApiKey,
    'Please provide an API key that you acquired from the Magic developer dashboard.',
  );
}

export function createModalNotReadyError() {
  return new MagicError(ErrorCode.ModalNotReady, 'Modal is not ready.');
}

export function createMalformedResponseError() {
  return new MagicError(ErrorCode.MalformedResponse, 'Response from the Magic iframe is malformed.');
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

  return new MagicError(
    ErrorCode.InvalidArgument,
    `Invalid ${ordinalSuffix(options.argIndex)} argument given to \`${options.functionName}\`.\n` +
      `  Expected: \`${options.expected}\`\n` +
      `  Received: \`${options.received}\``,
  );
}

// --- SDK Warning factories

export function createDuplicateIframeWarning() {
  return new MagicWarning(WarningCode.DuplicateIframe, 'Duplicate iframes found.');
}
