import { ErrorCode, WarningCode } from '../types';

// --- Base error/warning classes

export class FortmaticError extends Error {
  __proto__ = Error;

  constructor(public code: ErrorCode, message: string) {
    super(`Fortmatic Error: [${code}] ${message}`);
    Object.setPrototypeOf(this, FortmaticError.prototype);
  }
}

export class FortmaticWarning {
  public message: string;

  constructor(public code: WarningCode, message: string) {
    this.message = `Fortmatic Warning: [${code}] ${message}`;
  }

  public log() {
    console.warn(this.message);
  }
}

// --- SDK error factories

export function createMissingApiKeyError() {
  return new FortmaticError(
    ErrorCode.MissingApiKey,
    'Please provide a Fortmatic API key that you acquired from the developer dashboard.',
  );
}

export function createModalNotReadyError() {
  return new FortmaticError(ErrorCode.ModalNotReady, 'Modal is not ready.');
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

  return new FortmaticError(
    ErrorCode.InvalidArgument,
    `Invalid ${ordinalSuffix(options.argIndex)} argument given to \`${options.functionName}\`.\n` +
      `  Expected: \`${options.expected}\`\n` +
      `  Received: \`${options.received}\``,
  );
}

// --- SDK warning factories

export function createSynchronousWeb3MethodWarning() {
  return new FortmaticWarning(
    WarningCode.SyncWeb3Method,
    'Non-async web3 methods will be deprecated in web3 > 1.0 and are not supported by the Fortmatic provider. An async method is to be used instead.',
  );
}
