export interface KadenaConfig {
  rpcUrl: string;
  chainId: ChainId;
  network: 'testnet' | 'mainnet';
  networkId: string;
  createAccountsOnChain?: boolean;
}

export enum KadenaPayloadMethod {
  KadenaLoginWithSpireKey = 'kda_loginWithSpireKey',
  KadenaGetInfo = 'kda_getInfo',
  KadenaSignTransaction = 'kda_signTransaction',
  KadenaSignTransactionWithSpireKey = 'kda_signTransactionWithSpireKey',
}

export interface SignTransactionResponse {
  sig: string;
  pubKey: string;
}

export interface IUnsignedCommand {
  hash: string;
  cmd: string;
  sigs: [undefined];
}

export interface Sig {
  sig: string;
  pubKey?: string;
}

export interface ICommand {
  hash: string;
  cmd: string;
  sigs: Sig[];
}

export interface SignTransactionWithSpireKeyResponse {
  transactions: (IUnsignedCommand | ICommand)[];
}

export interface KadenaGetInfoResponse {
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

export type LoginWithSpireKeyResponse = Account;

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
