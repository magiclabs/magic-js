import localForage from 'localforage';
import { ViewController } from './view-controller';
import { PayloadTransport } from './payload-transport';
import { SDKBase } from './sdk';
import { WithExtensions } from '../modules/base-extension';

type ConstructorOf<C> = { new (...args: any[]): C };

/**
 * A structure containing details about the current environment.
 * This is guaranteed to be populated before the SDK is instantiated.
 */
interface SDKEnvironment {
  sdkName: 'magic-sdk' | '@magic-sdk/react-native';
  version: string;
  platform: 'web' | 'react-native';
  defaultEndpoint: string;
  ViewController: ConstructorOf<ViewController>;
  PayloadTransport: ConstructorOf<PayloadTransport>;
  configureStorage: () => Promise<typeof localForage>;
}

export const SDKEnvironment: SDKEnvironment = {} as any;

export function createSDK<SDK extends SDKBase>(
  SDKBaseCtor: ConstructorOf<SDK>,
  environment: SDKEnvironment,
): WithExtensions<SDK> {
  Object.assign(SDKEnvironment, environment);
  return SDKBaseCtor as any;
}

export const sdkNameToEnvName = {
  'magic-sdk': 'magic-sdk' as const,
  '@magic-sdk/react-native': 'magic-sdk-rn' as const,
};
