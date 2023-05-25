import { AptosAccount } from 'aptos';

export const isAptosAccount = (account: any): boolean => {
  return account instanceof AptosAccount;
};
