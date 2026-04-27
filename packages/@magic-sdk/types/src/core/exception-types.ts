export enum SDKErrorCode {
  MissingApiKey = 'MISSING_API_KEY',
  ModalNotReady = 'MODAL_NOT_READY',
  ConnectionLost = 'CONNECTION_WAS_LOST',
  MalformedResponse = 'MALFORMED_RESPONSE',
  InvalidArgument = 'INVALID_ARGUMENT',
  ExtensionNotInitialized = 'EXTENSION_NOT_INITIALIZED',
  IncompatibleExtensions = 'INCOMPATIBLE_EXTENSIONS',
}

export enum SDKWarningCode {
  SyncWeb3Method = 'SYNC_WEB3_METHOD',
  DuplicateIframe = 'DUPLICATE_IFRAME',
  ReactNativeEndpointConfiguration = 'REACT_NATIVE_ENDPOINT_CONFIGURATION',
  DeprecationNotice = 'DEPRECATION_NOTICE',
  ProductAnnouncement = 'ANNOUNCEMENT',
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
  UserAlreadyLoggedIn = -10003,
  UpdateEmailFailed = -10004,
  UserRequestEditEmail = -10005,
  MagicLinkInvalidRedirectURL = -10006,
  InactiveRecipient = -10010,
  AccessDeniedToUser = -10011,
  UserRejectedAction = -10012,
  RequestCancelled = -10014,
  RedirectLoginComplete = -10015,
  SessionTerminated = -10016,
  PopupRequestOverriden = -10017,
  SanEmail = -10018,
  DpopInvalidated = -10019,
  MaxAttemptsReached = -10031,
  UserRequiredMfa = -10033,
}

export type ErrorCode = SDKErrorCode | RPCErrorCode;
export type WarningCode = SDKWarningCode;
