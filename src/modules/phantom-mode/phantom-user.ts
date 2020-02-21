import { FmPayloadMethod, GetIdTokenConfiguration, PhantomModeUserMetadata } from '../../types';
import { emitFortmaticPayload } from '../../util/emit-payload-promise';
import { createJsonRpcRequestPayload } from '../../util/json-rpc-helpers';
import { BaseModule } from '../base-module';

/**
 * A stateless object representing the current Fortmatic Auth user.
 */
export class PhantomUser extends BaseModule {
  /** */
  public getIdToken(configuration?: GetIdTokenConfiguration) {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_auth_get_access_token, [configuration]);
    return emitFortmaticPayload<string>(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public getMetadata() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_auth_get_metadata);
    return emitFortmaticPayload<PhantomModeUserMetadata>(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public isLoggedIn() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_is_logged_in);
    return emitFortmaticPayload<boolean>(this.sdk.getProvider(), fmRequestPayload);
  }

  /** */
  public logout() {
    const fmRequestPayload = createJsonRpcRequestPayload(FmPayloadMethod.fm_auth_logout);
    return emitFortmaticPayload<boolean>(this.sdk.getProvider(), fmRequestPayload);
  }
}
