/** Third-party wallet signing method types */
export type ThirdPartyWalletSignMethod =
  | 'personal_sign'
  | 'eth_sign'
  | 'eth_signTypedData'
  | 'eth_signTypedData_v3'
  | 'eth_signTypedData_v4'
  | 'eth_signTransaction'
  | 'eth_sendTransaction';

/** Response structure for third-party wallet signing */
export interface ThirdPartyWalletSignResponse {
  /** Unique request ID to correlate with the request */
  requestId: string;
  /** The signature result if successful */
  result?: string;
  /** Error if the signing failed */
  error?: {
    code: number;
    message: string;
  };
}

export type ThirdPartyWalletSignHandler = (
  request: ThirdPartyWalletSignRequest,
) => Promise<ThirdPartyWalletSignResponse>;

/** Request structure for third-party wallet signing */
export interface ThirdPartyWalletSignRequest {
  /** Unique request ID to correlate request/response */
  requestId: string;
  /** The signing method being requested */
  method: ThirdPartyWalletSignMethod;
  /** The parameters for the signing method */
  params: any[];
}

interface SignRequest {
  requestId: string;
}

interface PersonalSignRequest extends SignRequest {
  method: 'personal_sign';
  params: {
    message: string;
    account?: string;
  };
}

interface EthSignRequest extends SignRequest {
  method: 'eth_sign';
  params: {
    address: string;
    message: string;
  };
}
