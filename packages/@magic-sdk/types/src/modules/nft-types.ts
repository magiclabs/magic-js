export type NFTResponseStatus = 'cancelled' | 'pending' | 'processed' | 'declined' | 'expired';

export type NFTResponse = {
  status: NFTResponseStatus;
};

export interface NFTPurchaseRequest {
  nft: {
    name: string;
    imageUrl: string;
    blockchainNftId: string;
    contractAddress: string;
    network: string;
    platform: string;
    type: string;
  };
  identityPrefill: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    emailAddress: string;
    phone: string;
    address: {
      street1: string;
      street2: string;
      city: string;
      regionCode: string;
      postalCode: string;
      countryCode: string;
    };
  };
}

export type NFTPurchaseResponse = NFTResponse & {
  errorMessage?: string;
};

export interface NFTCheckoutRequest {
  // given by magic / found in the developer dashboard in future
  contractId: string;
  // in contract, if ERC1155… for ERC721, use token ID = 0
  tokenId: string;
  name: string;
  imageUrl: string;
  quantity?: number; // default is 1
  walletAddress?: string; // default is user's wallet address
  // If enabled, the user will be able to pay with crypto. the default is false
  isCryptoCheckoutEnabled?: boolean;
}

export type NFTCheckoutResponse = NFTResponse;

export type NFTCheckoutEvents = {
  disconnect: () => void;
  'nft-checkout-initiated': (rawTransaction: string) => void;
};

export enum NftCheckoutIntermediaryEvents {
  Success = 'nft-checkout-success',
  Failure = 'nft-checkout-failure',
  Initiated = 'nft-checkout-initiated',
  Disconnect = 'disconnect',
}

export type NftCheckoutEventHandler = {
  [NftCheckoutIntermediaryEvents.Initiated]: (rawTransaction: string) => void;
  [NftCheckoutIntermediaryEvents.Success]: (signedTransaction: string) => void;
  [NftCheckoutIntermediaryEvents.Failure]: () => void;
};

export interface NFTTransferRequest {
  tokenId: string;
  contractAddress: string;
  quantity?: number;
  recipient?: string;
}

export type NFTTransferResponse = NFTResponse;
