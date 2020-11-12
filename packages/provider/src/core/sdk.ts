/* eslint-disable no-underscore-dangle, no-param-reassign  */

import { EthNetworkConfiguration, QueryParameters } from '@magic-sdk/types';
import semverSatisfies from 'semver/functions/satisfies';
import { encodeJSON } from '../util/base64-json';
import {
  createMissingApiKeyError,
  createReactNativeEndpointConfigurationWarning,
  createIncompatibleExtensionsError,
} from './sdk-exceptions';
import { PayloadTransport } from './payload-transport';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { RPCProviderModule } from '../modules/rpc-provider';
import { ViewController } from './view-controller';
import { createURL } from '../util/url';
import { Extension } from '../modules/base-extension';
import { isEmpty } from '../util/type-guards';
import { SDKEnvironment, sdkNameToEnvName } from './sdk-environment';

/**
 * Checks if the given `ext` is compatible with the platform & version of Magic
 * SDK currently in use.
 */
function checkExtensionCompat(ext: Extension<string>) {
  if (ext.compat) {
    // Check web compatibility
    if (SDKEnvironment.sdkName === 'magic-sdk') {
      return typeof ext.compat['magic-sdk'] === 'string'
        ? semverSatisfies(SDKEnvironment.version, ext.compat['magic-sdk'])
        : !!ext.compat['magic-sdk'];
    }

    // Check React Native compatibility
    /* istanbul ignore else */
    if (SDKEnvironment.sdkName === '@magic-sdk/react-native') {
      return typeof ext.compat['@magic-sdk/react-native'] === 'string'
        ? semverSatisfies(SDKEnvironment.version, ext.compat['@magic-sdk/react-native'])
        : !!ext.compat['@magic-sdk/react-native'];
    }

    // Else case should be impossible here...
  }

  // To gracefully support older extensions, we assume
  // compatibility when the `compat` field is missing.
  return true;
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
        (this as any)[ext.name] = ext;
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

export interface MagicSDKAdditionalConfiguration<
  TCustomExtName extends string = string,
  TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> } = any
> {
  endpoint?: string;
  locale?: 'en_US' | 'pl_PL';
  network?: EthNetworkConfiguration;
  extensions?: TExt;
}

export class SDKBase {
  private static readonly __transports__: Map<string, PayloadTransport> = new Map();
  private static readonly __overlays__: Map<string, ViewController> = new Map();

  private readonly endpoint: string;
  private readonly parameters: string;

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

    if (SDKEnvironment.platform === 'react-native' && options?.endpoint) {
      createReactNativeEndpointConfigurationWarning().log();
    }

    const { defaultEndpoint, version } = SDKEnvironment;
    this.endpoint = createURL(options?.endpoint ?? defaultEndpoint).origin;

    // Prepare built-in modules
    this.auth = new AuthModule(this);
    this.user = new UserModule(this);
    this.rpcProvider = new RPCProviderModule(this);

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
    });
  }

  /**
   * Represents the JSON RPC payload message channel associated with this
   * `MagicSDK` instance.
   */
  protected get transport(): PayloadTransport {
    if (!SDKBase.__transports__.has(this.parameters)) {
      SDKBase.__transports__.set(this.parameters, new SDKEnvironment.PayloadTransport(this.endpoint, this.parameters));
    }

    return SDKBase.__transports__.get(this.parameters)!;
  }

  /**
   * Represents the view controller associated with this `MagicSDK` instance.
   */
  protected get overlay(): ViewController {
    if (!SDKBase.__overlays__.has(this.parameters)) {
      const controller = new SDKEnvironment.ViewController(this.transport);
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
    await this.overlay.ready;
  }
}
