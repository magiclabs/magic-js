import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase } from '../core/sdk';

export abstract class Extension<TName extends string, TConfig extends any = any> extends BaseModule {
  public abstract readonly name: TName;
  public abstract readonly config: TConfig;

  protected createJsonRpcRequestPayload = createJsonRpcRequestPayload;
  protected standardizeJsonRpcRequestPayload = standardizeJsonRpcRequestPayload;

  constructor() {
    // `BaseModule.sdk` is supplied via the `Extension.init` method.
    super(undefined as any);
  }

  public init(sdk: SDKBase) {
    (this.sdk as any) = sdk;
  }
}
