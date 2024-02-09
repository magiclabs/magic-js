/* eslint-disable no-param-reassign  */

import { EthNetworkConfiguration, QueryParameters, SupportedLocale } from '@magic-sdk/types';
import type { AbstractProvider } from 'web3-core';
import { coerce, satisfies } from '../util/semver';
import { encodeJSON } from '../util/base64-json';
import {
  createMissingApiKeyError,
  createReactNativeEndpointConfigurationWarning,
  createIncompatibleExtensionsError,
} from './sdk-exceptions';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { WalletModule } from '../modules/wallet';
import { RPCProviderModule } from '../modules/rpc-provider';
import { ViewController } from './view-controller';
import { createURL } from '../util/url';
import { Extension } from '../modules/base-extension';
import { isEmpty } from '../util/type-guards';
import { SDKEnvironment, sdkNameToEnvName } from './sdk-environment';
import { NFTModule } from '../modules/nft';

/**
 * Checks if the given `ext` is compatible with the platform & version of Magic
 * SDK currently in use.
 */
function checkExtensionCompat(ext: Extension<string>) {
  if (ext.compat && ext.compat[SDKEnvironment.sdkName] != null) {
    return typeof ext.compat[SDKEnvironment.sdkName] === 'string'
      ? satisfies(coerce(SDKEnvironment.version), ext.compat[SDKEnvironment.sdkName] as string)
      : !!ext.compat[SDKEnvironment.sdkName];
  }

  // To gracefully support older extensions, we assume
  // compatibility when the `compat` field is missing.
  return true;
}

/**
 * Generates a network hash of the SDK instance for persisting network specific
 * information on multichain setups
 */
function getNetworkHash(apiKey: string, network?: EthNetworkConfiguration, extConfig?: any) {
  if (!network && !extConfig) {
    return `${apiKey}_eth_mainnet`;
  }
  if (extConfig) {
    return `${apiKey}_${JSON.stringify(extConfig)}`;
  }
  if (network) {
    if (typeof network === 'string') {
      return `${apiKey}_eth_${network}`;
    }
    // Custom network, not necessarily eth.
    return `${apiKey}_${network.rpcUrl}_${network.chainId}_${network.chainType}`;
  }
  return `${apiKey}_unknown`;
}

/**
 * Initializes SDK extensions, checks for platform/version compatiblity issues,
 * then consolidates any global configurations provided by those extensions.
 */
function prepareExtensions(this: SDKBase, options?: MagicSDKAdditionalConfiguration): Record<string, any> {
  const extensions: Extension<string>[] | { [key: string]: Extension<string> } = options?.extensions ?? [];
  const extConfig: any = {};
  const incompatibleExtensions: Extension<string>[] = [];

  if (Array.isArray(extensions)) {
    extensions.forEach((ext) => {
      if (checkExtensionCompat(ext)) {
        ext.init(this);
        if (ext.name || ext.name !== Extension.Anonymous) {
          // Only apply extensions with a known, defined `name` parameter.
          (this as any)[ext.name] = ext;
        }
        if (ext instanceof Extension.Internal) {
          if (!isEmpty(ext.config)) extConfig[ext.name] = ext.config;
        }
      } else {
        incompatibleExtensions.push(ext);
      }
    });
  } else {
    Object.keys(extensions).forEach((name) => {
      if (checkExtensionCompat(extensions[name])) {
        extensions[name].init(this);
        const ext = extensions[name];
        (this as any)[name] = ext;
        if (ext instanceof Extension.Internal) {
          if (!isEmpty(ext.config)) extConfig[extensions[name].name] = ext.config;
        }
      } else {
        incompatibleExtensions.push(extensions[name]);
      }
    });
  }

  if (incompatibleExtensions.length) {
    throw createIncompatibleExtensionsError(incompatibleExtensions);
  }

  return extConfig;
}

export type MagicSDKExtensionsOption<TCustomExtName extends string = string> =
  | Extension<string>[]
  | { [P in TCustomExtName]: Extension<string> };

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends MagicSDKExtensionsOption<TCustomExtName> = any,
> {
  endpoint?: string;
  locale?: SupportedLocale;
  network?: EthNetworkConfiguration;
  extensions?: TExt;
  testMode?: boolean;
  deferPreload?: boolean;
  useStorageCache?: boolean;
  meta?: any; // Generic field for clients to add metadata
}

export class SDKBase {
  private static readonly __overlays__: Map<string, ViewController> = new Map();

  protected readonly endpoint: string;
  protected readonly parameters: string;
  protected readonly networkHash: string;
  public readonly testMode: boolean;
  public readonly useStorageCache: boolean;

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
   * Contains methods previously under the `ConnectExtension`, including
   * login, show wallet UI, request user info, and more.
   */
  public readonly wallet: WalletModule;

  /**
   * Contains methods for interacting with NFTs, including purchase.
   */
  public readonly nft: NFTModule;

  /**
   * Contains a Web3-compliant provider. Pass this module to your Web3/Ethers
   * instance for automatic compatibility with Ethereum methods.
   */
  public readonly rpcProvider: RPCProviderModule & AbstractProvider;

  /**
   * Creates an instance of Magic SDK.
   */
  constructor(public readonly apiKey: string, options?: MagicSDKAdditionalConfiguration) {
    if (!apiKey) throw createMissingApiKeyError();

    if (SDKEnvironment.platform === 'react-native' && options?.endpoint) {
      createReactNativeEndpointConfigurationWarning().log();
    }

    const { defaultEndpoint, version } = SDKEnvironment;
    this.testMode = !!options?.testMode;
    this.useStorageCache = !!options?.useStorageCache;
    this.endpoint = createURL(options?.endpoint ?? defaultEndpoint).origin;

    // Prepare built-in modules
    this.auth = new AuthModule(this);
    this.user = new UserModule(this);
    this.wallet = new WalletModule(this);
    this.nft = new NFTModule(this);
    this.rpcProvider = new RPCProviderModule(this) as any;

    // Prepare extensions
    const extConfig: any = prepareExtensions.call(this, options);

    // Encode parameters as base64-JSON
    this.parameters = encodeJSON<QueryParameters>({
      API_KEY: this.apiKey,
      DOMAIN_ORIGIN: window.location ? window.location.origin : '',
      ETH_NETWORK: options?.network,
      host: createURL(this.endpoint).host,
      sdk: sdkNameToEnvName[SDKEnvironment.sdkName],
      version,
      ext: isEmpty(extConfig) ? undefined : extConfig,
      locale: options?.locale || 'en_US',
      ...(SDKEnvironment.bundleId ? { bundleId: SDKEnvironment.bundleId } : {}),
      meta: options?.meta,
    });
    this.networkHash = getNetworkHash(this.apiKey, options?.network, isEmpty(extConfig) ? undefined : extConfig);
    if (!options?.deferPreload) this.preload();
  }

  /**
   * Represents the view controller associated with this `MagicSDK` instance.
   */
  protected get overlay(): ViewController {
    if (!SDKBase.__overlays__.has(this.parameters)) {
      const controller = new SDKEnvironment.ViewController(this.endpoint, this.parameters, this.networkHash);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - We don't want to expose this method to the user, but we
      // need to invoke in here so that the `ViewController` is ready for use.
      controller.init();

      SDKBase.__overlays__.set(this.parameters, controller);
    }

    return SDKBase.__overlays__.get(this.parameters)!;
  }

  /**
   * Preloads the Magic view, allowing for faster initial requests in browser
   * environments. Awaiting the returned promise will signal when the Magic view
   * has completed loading and is ready for requests.
   */
  public async preload() {
    await this.overlay.checkIsReadyForRequest;
  }
}
