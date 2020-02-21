/* eslint-disable no-underscore-dangle */

import { PHANTOM_URL, WIDGET_URL } from '../constants/config';
import { PhantomUser } from '../modules/phantom-mode/phantom-user';
import { TransactionsModule } from '../modules/widget-mode/transactions-module';
import { UserModule } from '../modules/widget-mode/user-module';
import { FmPayloadMethod, LoginWithMagicLinkConfiguration, WidgetModeConfiguration } from '../types';
import { emitFortmaticPayload } from '../util/emit-payload-promise';
import { createJsonRpcRequestPayload } from '../util/json-rpc-helpers';
import { FmProvider } from './fm-provider';
import { encodeQueryParameters, QueryParameters } from '../util/query-params';
import { name as sdkName, version as sdkVersion } from '../../package.json';
import { createMissingApiKeyError } from './sdk-exceptions';

/**
 * Base class for Fortmatic SDKs
 */
export abstract class SDK {
  private static __provider__: Map<string, FmProvider> = new Map();
  public readonly endpoint: string;
  public readonly encodedQueryParams: string;
  public readonly apiKey: string;

  constructor(options: { apiKey: string; ethNetwork?: QueryParameters['ETH_NETWORK']; endpoint: string }) {
    // Enforce API key parameter
    if (!options.apiKey) throw createMissingApiKeyError();

    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint;
    this.encodedQueryParams = encodeQueryParameters({
      API_KEY: this.apiKey,
      DOMAIN_ORIGIN: window.location ? window.location.origin : '',
      ETH_NETWORK: options.ethNetwork,
      host: new URL(this.endpoint).host,
      sdk: sdkName,
      version: sdkVersion,
    });
  }

  /**
   * Gets a Web3-compatible provider.
   */
  public getProvider(): FmProvider {
    if (!SDK.__provider__.has(this.encodedQueryParams)) {
      SDK.__provider__.set(
        this.encodedQueryParams,
        new FmProvider(this.endpoint, this.apiKey, this.encodedQueryParams),
      );
    }

    return SDK.__provider__.get(this.encodedQueryParams)!;
  }
}

/**
 * The entry-point to whitelabeled, headless Fortmatic APIs.
 */
export class PhantomMode extends SDK {
  public readonly user = new PhantomUser(this);

  constructor(apiKey: string, ethNetwork?: QueryParameters['ETH_NETWORK']) {
    super({ apiKey, ethNetwork, endpoint: PHANTOM_URL });
  }

  /**
   * Initiate the "magic link" login flow for a user.
   */
  public async loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    const { email, showUI = true } = configuration;
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_auth_login_with_magic_link, [
      { email, showUI },
    ]);
    await emitFortmaticPayload<void>(this.getProvider(), fmRequestPayload);
    return this.user;
  }
}

/**
 * The entry-point to core Fortmatic APIs.
 */
export class WidgetMode extends SDK {
  static readonly Phantom = PhantomMode;
  public readonly transactions = new TransactionsModule(this);
  public readonly user = new UserModule(this);

  constructor(apiKey: string, ethNetwork?: QueryParameters['ETH_NETWORK']) {
    super({ apiKey, ethNetwork, endpoint: WIDGET_URL });
  }

  /**
   * Apply configuration to customize Fortmatic's Ethereum functionality.
   */
  public configure(configuration: WidgetModeConfiguration = {}) {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_configure, [configuration]);
    return emitFortmaticPayload<boolean>(this.getProvider(), fmRequestPayload);
  }
}

export const Fortmatic = WidgetMode;
