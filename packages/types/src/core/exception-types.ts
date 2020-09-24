export enum SDKErrorCode {
  MissingApiKey = 'MISSING_API_KEY',
  ModalNotReady = 'MODAL_NOT_READY',
  MalformedResponse = 'MALFORMED_RESPONSE',
  InvalidArgument = 'INVALID_ARGUMENT',
  ExtensionNotInitialized = 'EXTENSION_NOT_INITIALIZED',
  WebAuthnNotSupported = 'WEBAUTHN_NOT_SUPPORTED',
  IncompatibleExtensions = 'INCOMPATIBLE_EXTENSIONS',
  WebAuthnCreateCredentialError = 'WEBAUTHN_CREATE_CREDENTIAL_ERROR',
}

export enum SDKWarningCode {
  SyncWeb3Method = 'SYNC_WEB3_METHOD',
  DuplicateIframe = 'DUPLICATE_IFRAME',
  ReactNativeEndpointConfiguration = 'REACT_NATIVE_ENDPOINT_CONFIGURATION',
  DeprecationNotice = 'DEPRECATION_NOTICE',
}

export enum RPCErrorCode {
  // Standard JSON RPC 2.0 Error Codes
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,

  // Custom RPC Error Codes
  MagicLinkFailedVerification = -10000,
  MagicLinkExpired = -10001,
  MagicLinkRateLimited = -10002,
  MagicLinkInvalidRedirectURL = -10006,
  UserAlreadyLoggedIn = -10003,
  UpdateEmailFailed = -10004,
  UserRequestEditEmail = -10005,
}

export type ErrorCode = SDKErrorCode | RPCErrorCode;
export type WarningCode = SDKWarningCode;
