import { Wallets } from '../core/json-rpc-types';

export type ConnectWithUiEvents = {
  'id-token-created': (params: { idToken: string }) => void;
  wallet_selected: (params: { wallet: Wallets }) => any;
};
