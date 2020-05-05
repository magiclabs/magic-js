/* eslint-disable no-underscore-dangle, no-param-reassign  */

import { encodeQueryParameters } from '../util/query-params';
import { createMissingApiKeyError } from './sdk-exceptions';
import { IframeController } from './views/iframe-controller';
import { PayloadTransport } from './payload-transport';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { MAGIC_URL, SDK_NAME, SDK_VERSION, IS_REACT_NATIVE, MGBOX_URL } from '../constants/config';
import { MagicSDKAdditionalConfiguration, MagicSDKReactNativeAdditionalConfiguration } from '../types';
import { WithExtensions } from '../types/core/extension-types';
import { RPCProviderModule } from '../modules/rpc-provider';
import { ViewController } from '../types/core/view-types';
import { ReactNativeWebViewController } from './views/react-native-webview-controller';
import { createURL } from '../util/url';
import { Extension } from '../modules/base-extension';
import { isEmpty } from '../util/type-guards';

export class SDKBase<TConfiguration extends MagicSDKAdditionalConfiguration = MagicSDKAdditionalConfiguration> {
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
  constructor(public readonly apiKey: string, options?: TConfiguration) {
    if (!apiKey) throw createMissingApiKeyError();

    const fallbackEndpoint = IS_REACT_NATIVE ? MGBOX_URL : MAGIC_URL;
    this.endpoint = createURL(options?.endpoint ?? fallbackEndpoint).origin;

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
      sdk: IS_REACT_NATIVE ? `${SDK_NAME}-rn` : SDK_NAME,
      version: SDK_VERSION,
      ext: isEmpty(extConfig) ? undefined : extConfig,
    });
  }

  /**
   * Represents the JSON RPC payload message channel associated with this
   * `MagicSDK` instance.
   */
  protected get transport(): PayloadTransport {
    if (!SDKBase.__transports__.has(this.encodedQueryParams)) {
      SDKBase.__transports__.set(this.encodedQueryParams, new PayloadTransport(this.endpoint, this.encodedQueryParams));
    }

    return SDKBase.__transports__.get(this.encodedQueryParams)!;
  }

  /**
   * Represents the view controller associated with this `MagicSDK` instance.
   */
  protected get overlay(): ViewController {
    if (!SDKBase.__overlays__.has(this.encodedQueryParams)) {
      const controller = IS_REACT_NATIVE
        ? new ReactNativeWebViewController(this.transport, this.endpoint, this.encodedQueryParams)
        : new IframeController(this.transport, this.endpoint, this.encodedQueryParams);
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

export class SDKBaseReactNative extends SDKBase<MagicSDKReactNativeAdditionalConfiguration> {
  public get Relayer() {
    return (this.overlay as ReactNativeWebViewController).Relayer;
  }
}

export const MagicSDK = (SDKBase as unknown) as WithExtensions<SDKBase>;
export const MagicSDKReactNative = (SDKBaseReactNative as unknown) as WithExtensions<SDKBaseReactNative>;
