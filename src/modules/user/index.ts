import { BaseModule } from '../base-module';
import { GetIdTokenConfiguration, MagicPayloadMethod, MagicUserMetadata } from '../../types';
import { createJsonRpcRequestPayload } from '../../core/json-rpc';

export class UserModule extends BaseModule {
  /** */
  public getIdToken(configuration?: GetIdTokenConfiguration) {
    const fmRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetAccessToken, [configuration]);
    return this.request<string>(fmRequestPayload);
  }

  /** */
  public getMetadata() {
    const fmRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetMetadata);
    return this.request<MagicUserMetadata>(fmRequestPayload);
  }

  /** */
  public isLoggedIn() {
    const fmRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.IsLoggedIn);
    return this.request<boolean>(fmRequestPayload);
  }

  /** */
  public logout() {
    const fmRequestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Logout);
    return this.request<boolean>(fmRequestPayload);
  }
}
