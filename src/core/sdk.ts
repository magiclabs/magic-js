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
   * Creates an instance of Magic SDK.
   */
  constructor(public readonly apiKey: string, options?: MagicSDKAdditionalConfiguration) {
    if (!apiKey) throw createMissingApiKeyError();

    // --- Save some global information

    this.endpoint = options?.endpoint || MAGIC_URL;
    this.encodedQueryParams = encodeQueryParameters({
      API_KEY: this.apiKey,
      DOMAIN_ORIGIN: window.location ? window.location.origin : '',
      host: new URL(this.endpoint).host,
      sdk: sdkName,
      version: sdkVersion,
    });

    // Assign API Modules

    this.auth = new AuthModule(
      () => this.transport,
      () => this.overlay,
    );
    this.user = new UserModule(
      () => this.transport,
      () => this.overlay,
    );
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
}
