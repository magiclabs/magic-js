import { ViewController } from './view-controller';
import { PayloadTransport } from './payload-transport';
import { SDKBase } from './sdk';
import { WithExtensions } from '../modules/base-extension';

type ConstructorOf<C> = { new (...args: any[]): C };

/**
 * A data structure containing details about the current environment. This is
 * guaranteed to be populated before the SDK is instantiated.
 */
interface SDKEnvironment {
  sdkName: 'magic-sdk' | 'magic-sdk-rn';
  version: string;
  target: 'web' | 'react-native';
  defaultEndpoint: string;
  ViewController: ConstructorOf<ViewController>;
  PayloadTransport: ConstructorOf<PayloadTransport>;
  configureStorage: () => Promise<LocalForage>;
}

export const SDKEnvironment: SDKEnvironment = {} as any;

export function createSDK<SDK extends SDKBase>(
  SDKBaseCtor: ConstructorOf<SDK>,
  environment: SDKEnvironment,
): WithExtensions<SDK> {
  Object.assign(SDKEnvironment, environment);
  return SDKBaseCtor as any;
}
