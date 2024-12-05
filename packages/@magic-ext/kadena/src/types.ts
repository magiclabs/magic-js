export interface KadenaConfig {
  rpcUrl: string;
  chainId: ChainId;
  network: 'testnet' | 'mainnet';
  networkId: string;
  createAccountsOnChain?: boolean;
}

export enum KadenaPayloadMethod {
  KadenaLoginWithSpireKey = 'kda_loginWithSpireKey',
  KadenaGetUserInfo = 'kda_getUserInfo',
  KadenaSignTransaction = 'kda_signTransaction',
  KadenaSignTransactionWithSpireKey = 'kda_signTransactionWithSpireKey',
}

export interface SignatureWithPublicKey {
  sig: string;
  pubKey?: string;
}

export interface UnsignedCommand {
  cmd: string;
  hash: string;
  sigs: Array<
    | {
        sig: string;
        pubKey?: string;
      }
    | {
        pubKey: string;
        sig?: string;
      }
    | undefined
  >;
}
export interface SignedCommand {
  hash: string;
  cmd: string;
  sigs: {
    sig: string;
    pubKey?: string;
  }[];
}

export interface SignedTransactions {
  transactions: (UnsignedCommand | SignedCommand)[];
}

export interface KadenaUserMetadata {
  accountName: string;
  publicKey: string;
  loginType: string;
  isMfaEnabled: boolean;
  email?: string;
  phoneNumber?: string;
  spireKeyInfo?: Account;
}

type Guard = RefKeyset | Keyset;

type RefKeyset = {
  keysetref: {
    ns: string;
    ksn: string;
  };
};

type Keyset = {
  keys: string[];
  pred: string;
};

type Device = {
  domain: string;
  color: string;
  deviceType: string;
  ['credential-id']: string;
  guard: Keyset;
  pendingRegistrationTxs?: ITransactionDescriptor[];
  name?: string;
};

interface ITransactionDescriptor {
  requestKey: string;
  chainId: ChainId;
  networkId: string;
}

type QueuedTx = ITransactionDescriptor;

type RequestedFungible = {
  fungible: string;
  amount: number;
  target?: ChainId;
};

type Account = {
  alias: string;
  accountName: string;
  minApprovals: number;
  minRegistrationApprovals: number;
  balance: string;
  devices: Device[];
  guard?: Guard;
  keyset?: Keyset;
  networkId: string;
  chainIds: ChainId[];
  txQueue: QueuedTx[];
  requestedFungibles?: RequestedFungible[];
};

export type SpireKeyAccount = Account;

export type ChainId =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19';
