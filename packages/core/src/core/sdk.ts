/* eslint-disable no-underscore-dangle, no-param-reassign  */

import { EthNetworkConfiguration } from '@magic-sdk/types';
import { encodeQueryParameters } from '../util/query-params';
import { createMissingApiKeyError, createReactNativeEndpointConfigurationWarning } from './sdk-exceptions';
import { PayloadTransport } from './payload-transport';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { VERSION, MGBOX_URL, MAGIC_URL } from '../constants/config';
import { RPCProviderModule } from '../modules/rpc-provider';
import { ViewController } from './view-controller';
import { createURL } from '../util/url';
import { Extension, WithExtensions } from '../modules/base-extension';
import { isEmpty } from '../util/type-guards';

type ConstructorOf<C> = { new (...args: any[]): C };

interface SDKEnvironment {
  sdkName: string;
  target: 'web' | 'react-native';
  ViewController: ConstructorOf<ViewController>;
  PayloadTransport: ConstructorOf<PayloadTransport>;
}

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> } = any
> {
  endpoint?: string;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

export class SDKBase {
  private static environment: SDKEnvironment;

  private static readonly __transports__: Map<string, PayloadTransport> = new Map();
  private static readonly __overlays__: Map<string, ViewController> = new Map();

  public readonly endpoint: string;
  public readonly encodedQueryParams: string;

  /**
   * Contains methods for starting a Magic SDK authentication flow.
   */
  public readonly auth: AuthModule;

  /**
   * Contains methods for interacting with user data, checking login
   * status, generating cryptographically-secure ID tokens, and more.
   */
  public readonly user: UserModule;

  /**
   * Contains a Web3-compliant provider. Pass this module to your Web3/Ethers
   * instance for automatic compatibility with Ethereum methods.
   */
  public readonly rpcProvider: RPCProviderModule;

  /**
   * Creates an instance of Magic SDK.
   */
  constructor(public readonly apiKey: string, options?: MagicSDKAdditionalConfiguration) {
    if (!apiKey) throw createMissingApiKeyError();

    if (SDKBase.environment.target === 'react-native' && options?.endpoint) {
      createReactNativeEndpointConfigurationWarning().log();
    }

    const fallbackURL = SDKBase.environment.target === 'react-native' ? MGBOX_URL : MAGIC_URL;
    this.endpoint = createURL(options?.endpoint ?? fallbackURL).origin;

    // Assign API Modules
    this.auth = new AuthModule(this);
    this.user = new UserModule(this);
    this.rpcProvider = new RPCProviderModule(this);

    // Prepare Extensions
    const extensions: Extension<string>[] | { [key: string]: Extension<string> } = options?.extensions ?? [];
    const extConfig: any = {};

    if (Array.isArray(extensions)) {
      extensions.forEach(ext => {
        ext.init(this);
        (this as any)[ext.name] = ext;
        if (ext instanceof Extension.Internal) {
          if (!isEmpty(ext.config)) extConfig[ext.name] = ext.config;
        }
      });
    } else {
      Object.keys(extensions).forEach(name => {
        extensions[name].init(this);
        const ext = extensions[name];
        (this as any)[name] = ext;
        if (ext instanceof Extension.Internal) {
          if (!isEmpty(ext.config)) extConfig[extensions[name].name] = ext.config;
        }
      });
    }

    // Build query params for the current `ViewController`
    this.encodedQueryParams = encodeQueryParameters({
      API_KEY: this.apiKey,
      DOMAIN_ORIGIN: window.location ? window.location.origin : '',
      ETH_NETWORK: options?.network,
      host: createURL(this.endpoint).host,
      sdk: SDKBase.environment.sdkName,
      version: VERSION,
      ext: isEmpty(extConfig) ? undefined : extConfig,
    });
  }

  /**
   * Represents the JSON RPC payload message channel associated with this
   * `MagicSDK` instance.
   */
  protected get transport(): PayloadTransport {
    if (!SDKBase.__transports__.has(this.encodedQueryParams)) {
      SDKBase.__transports__.set(
        this.encodedQueryParams,
        new SDKBase.environment.PayloadTransport(this.endpoint, this.encodedQueryParams),
      );
    }

    return SDKBase.__transports__.get(this.encodedQueryParams)!;
  }

  /**
   * Represents the view controller associated with this `MagicSDK` instance.
   */
  protected get overlay(): ViewController {
    if (!SDKBase.__overlays__.has(this.encodedQueryParams)) {
      const controller = new SDKBase.environment.ViewController(this.transport, this.endpoint, this.encodedQueryParams);
      SDKBase.__overlays__.set(this.encodedQueryParams, controller);
    }

    return SDKBase.__overlays__.get(this.encodedQueryParams)!;
  }

  /**
   * Preloads the Magic view, allowing for faster initial requests in browser
   * environments. Awaiting the returned promise will signal when the Magic view
   * has completed loading and is ready for requests.
   */
  public async preload() {
    await this.overlay.ready;
  }
}

export function createSDKCtor<SDK extends SDKBase>(
  SDKBaseCtor: ConstructorOf<SDK>,
  config: SDKEnvironment,
): WithExtensions<SDK> {
  (SDKBase as any).environment = {
    target: config.target,
    sdkName: config.sdkName,
    PayloadTransport: config.PayloadTransport,
    ViewController: config.ViewController,
  };

  return SDKBaseCtor as any;
}
