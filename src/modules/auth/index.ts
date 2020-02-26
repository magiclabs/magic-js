import { BaseModule } from '../base-module';
import { MagicPayloadMethod, LoginWithMagicLinkConfiguration } from '../../types';
import { createJsonRpcRequestPayload } from '../../core/json-rpc';

export class AuthModule extends BaseModule {
  /**
   * Initiate the "magic link" login flow for a user.
   */
  public async loginWithMagicLink(configuration: LoginWithMagicLinkConfiguration) {
    const { email, showUI = true } = configuration;
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.LoginWithMagicLink, [{ email, showUI }]);
    return this.request<void>(requestPayload);
  }
}
