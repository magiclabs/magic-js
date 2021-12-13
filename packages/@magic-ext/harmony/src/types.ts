export enum HarmonyPayloadMethod {
  HarmonySignTransaction = 'hmy_sendTransaction',
}

export interface HarmonyConfig {
  rpcUrl: string;
  chainId: string;
  chainType: string;
}
