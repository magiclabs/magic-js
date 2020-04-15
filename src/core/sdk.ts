/* eslint-disable no-underscore-dangle */

import { encodeQueryParameters } from '../util/query-params';
import { name as sdkName, version as sdkVersion } from '../../package.json';
import { createMissingApiKeyError } from './sdk-exceptions';
import { IframeController } from './iframe-controller';
import { PayloadTransport } from './payload-transport';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { MAGIC_URL } from '../constants/config';
import { MagicSDKAdditionalConfiguration } from '../types';
import { RPCProviderModule } from '../modules/rpc-provider';

export class MagicSDK {
  private static readonly __transports__: Map<string, PayloadTransport> = new Map();
  private static readonly __overlays__: Map<string, IframeController> = new Map();

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

    this.endpoint = new URL(options?.endpoint ?? MAGIC_URL).origin;
    this.encodedQueryParams = encodeQueryParameters({
      API_KEY: this.apiKey,
      DOMAIN_ORIGIN: window.location ? window.location.origin : '',
      ETH_NETWORK: options?.network,
      host: new URL(this.endpoint).host,
      sdk: sdkName,
      version: sdkVersion,
    });

    /* istanbul ignore next */
    const getTransport = () => this.transport;
    /* istanbul ignore next */
    const getOverlay = () => this.overlay;

    // Assign API Modules
    this.auth = new AuthModule(getTransport, getOverlay);
    this.user = new UserModule(getTransport, getOverlay);
    this.rpcProvider = new RPCProviderModule(getTransport, getOverlay);
  }

  /**
   * Represents the JSON RPC payload message channel associated with this
   * `MagicSDK` instance.
   *
   * @internal
   */
  private get transport(): PayloadTransport {
    if (!MagicSDK.__transports__.has(this.encodedQueryParams)) {
      MagicSDK.__transports__.set(
        this.encodedQueryParams,
        new PayloadTransport(this.endpoint, this.encodedQueryParams),
      );
    }

    return MagicSDK.__transports__.get(this.encodedQueryParams)!;
  }

  /**
   * Represents the iframe controller associated with this `MagicSDK` instance.
   *
   * @internal
   */
  private get overlay(): IframeController {
    if (!MagicSDK.__overlays__.has(this.encodedQueryParams)) {
      MagicSDK.__overlays__.set(
        this.encodedQueryParams,
        new IframeController(this.transport, this.endpoint, this.encodedQueryParams),
      );
    }

    return MagicSDK.__overlays__.get(this.encodedQueryParams)!;
  }

  /**
   * Preloads the Magic `<iframe>` context, allowing for faster initial
   * requests. Awaiting the returned promise will signal when the `<iframe>` has
   * completed loading and is ready for requests.
   */
  public async preload() {
    await this.overlay.ready;
  }
}
