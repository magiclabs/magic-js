/* eslint-disable no-underscore-dangle */

import { encodeQueryParameters } from '../util/query-params';
import { name as sdkName, version as sdkVersion } from '../../package.json';
import { createMissingApiKeyError } from './sdk-exceptions';
import { IframeController } from './iframe-controller';
import { PayloadTransport } from './payload-transport';
import { AuthModule } from '../modules/auth';
import { UserModule } from '../modules/user';
import { MAGIC_URL } from '../constants/config';

/**
 * Base class for Fortmatic SDKs
 */
export class Magic {
  private static readonly __transports__: Map<string, PayloadTransport> = new Map();
  private readonly overlay: IframeController;

  public readonly endpoint: string;
  public readonly encodedQueryParams: string;

  /** API endpoints for Magic SDK authentication flows. */
  public readonly auth = new AuthModule(this.transport);

  /** API endpoints for Magic SDK user actions. */
  public readonly user = new UserModule(this.transport);

  /**
   * Creates an instance of Magic SDK.
   *
   * @param apiKey
   * @param options.endpoint -
   */
  constructor(public readonly apiKey: string, options?: { endpoint?: string }) {
    if (!apiKey) throw createMissingApiKeyError();

    this.endpoint = options?.endpoint || MAGIC_URL;
    this.encodedQueryParams = encodeQueryParameters({
      API_KEY: this.apiKey,
      DOMAIN_ORIGIN: window.location ? window.location.origin : '',
      host: new URL(this.endpoint).host,
      sdk: sdkName,
      version: sdkVersion,
    });
    this.overlay = new IframeController(this.transport, this.endpoint, this.encodedQueryParams);
  }

  /**
   * The underlying JSON RPC payload transport.
   */
  private get transport(): PayloadTransport {
    if (!Magic.__transports__.has(this.encodedQueryParams)) {
      Magic.__transports__.set(
        this.encodedQueryParams,
        new PayloadTransport(this.overlay, this.endpoint, this.encodedQueryParams),
      );
    }

    return Magic.__transports__.get(this.encodedQueryParams)!;
  }
}
