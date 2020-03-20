import { BaseModule } from '../base-module';
import {
  GetIdTokenConfiguration,
  MagicPayloadMethod,
  MagicUserMetadata,
  GenerateIdTokenConfiguration,
} from '../../types';
import { createJsonRpcRequestPayload } from '../../core/json-rpc';

export class UserModule extends BaseModule {
  /** */
  public getIdToken(configuration?: GetIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetIdToken, [configuration]);
    return this.request<string>(requestPayload);
  }

  /** */
  public generateIdToken(configuration?: GenerateIdTokenConfiguration) {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GenerateIdToken, [configuration]);
    return this.request<string>(requestPayload);
  }

  /** */
  public getMetadata() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.GetMetadata);
    return this.request<MagicUserMetadata>(requestPayload);
  }

  /** */
  public isLoggedIn() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.IsLoggedIn);
    return this.request<boolean>(requestPayload);
  }

  /** */
  public logout() {
    const requestPayload = createJsonRpcRequestPayload(MagicPayloadMethod.Logout);
    return this.request<boolean>(requestPayload);
  }
}
