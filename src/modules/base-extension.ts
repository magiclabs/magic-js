import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase } from '../core/sdk';

abstract class BaseExtension<TName extends string> extends BaseModule {
  public abstract readonly name: TName;

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

/**
 * This is a special constructor used to mark an extension as "official." Only
 * official extensions can interact with the iframe using custom JSON RPC
 * methods and business logic. Configuration specified here is passed along to
 * the Magic overlay.
 */
abstract class InternalExtension<TName extends string, TConfig extends any = any> extends BaseExtension<TName> {
  public abstract readonly config: TConfig;
}

export abstract class Extension<TName extends string> extends BaseExtension<TName> {
  public static Internal = InternalExtension;
}
