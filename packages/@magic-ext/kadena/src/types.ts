export interface KadenaConfig {
  rpcUrl: string;
  chainId: ChainId;
  network: 'testnet' | 'mainnet';
  networkId: string;
  createAccountsOnChain?: boolean;
}

export enum KadenaPayloadMethod {
  KadenaSignTransaction = 'kda_signTransaction',
  KadenaLoginWithSpireKey = 'kda_loginWithSpireKey',
  KadenaGetInfo = 'kda_getInfo',
}

export type KadenaSignTransactionResponse = ISignatureWithPublicKey | SignedTransactions;

export interface ISignatureWithPublicKey {
  sig: string;
  pubKey: string;
}

interface Sig {
  sig: string;
  pubKey: string;
}

export interface IUnsignedCommand {
  hash: string;
  cmd: string;
  sigs: [undefined];
}

interface ICommand {
  hash: string;
  cmd: string;
  sigs: Sig[];
}

export interface SignedTransactions {
  transactions: (IUnsignedCommand | ICommand)[];
}

export interface KadenaGetInfoResponse {
  email: string | undefined;
  issuer: string;
  accountName: string;
  publicKey: string;
  loginType: 'spire_key' | 'email_otp' | 'sms';
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

export type LoginWithSpireKeyResponse = Account & {
  isReady: () => Promise<Account>;
};

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
