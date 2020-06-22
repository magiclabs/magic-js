import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase, MagicSDKAdditionalConfiguration } from '../core/sdk';
import { createExtensionNotInitializedError, MagicExtensionError } from '../core/sdk-exceptions';
import { createPromiEvent, encodeQueryParameters, decodeQueryParameters } from '../util';

abstract class BaseExtension<TName extends string> extends BaseModule {
  public abstract readonly name: TName;

  private isInitialized = false;

  protected utils = {
    createPromiEvent,
    decodeQueryParameters,
    encodeQueryParameters,
    createJsonRpcRequestPayload,
    standardizeJsonRpcRequestPayload,
  };

  constructor() {
    super(undefined as any);

    const sdkAccessFields = ['request', 'transport', 'overlay', 'sdk'];

    // Dissallow SDK access before initialization.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (sdkAccessFields.includes(prop as string) && !this.isInitialized) {
          throw createExtensionNotInitializedError(prop as string);
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  /**
   * Registers a Magic SDK instance with this Extension.
   */
  public init(sdk: SDKBase) {
    if (this.isInitialized) return;

    (this.sdk as any) = sdk;
    this.isInitialized = true;
  }

  /**
   * Throws an error wrapped with a native Magic SDK error type. This enables
   * consistency in error handling for consumers of Magic SDK and this
   * Extension.
   */
  protected raiseError(code: string | number, message: string): void {
    throw new MagicExtensionError(this, code, message);
  }
}

abstract class InternalExtension<TName extends string, TConfig extends any = any> extends BaseExtension<TName> {
  public abstract readonly config: TConfig;
}

export abstract class Extension<TName extends string> extends BaseExtension<TName> {
  /**
   * This is a special constructor used to mark an extension as "official." Only
   * official extensions can interact with the iframe using custom JSON RPC
   * methods and business logic. This is intended for internal-use only and
   * provides no advantage to open-source extension developers.
   *
   * @internal
   */
  public static Internal = InternalExtension;
}

/**
 * These fields are exposed on the `Extension` type, but should be hidden from
 * the public interface.
 */
type HiddenExtensionFields = 'name' | 'init' | 'config';

/**
 * Gets the type contained in an array type.
 */
type UnwrapArray<T extends any[]> = T extends Array<infer P> ? P : never;

/**
 * Create a union type of Extension names from an array of Extension types given
 * by `TExt`.
 */
type ExtensionNames<TExt extends Extension<string>[]> = UnwrapArray<
  {
    [P in keyof TExt]: TExt[P] extends Extension<infer K> ? K : never;
  }
>;

/**
 * From the literal Extension name type given by `TExtName`, extract a
 * dictionary of Extension types.
 */
type GetExtensionFromName<TExt extends Extension<string>[], TExtName extends string> = {
  [P in TExtName]: Extract<UnwrapArray<TExt>, Extension<TExtName>>;
}[TExtName];

/**
 * Wraps a Magic SDK constructor with the necessary type information to support
 * a strongly-typed `Extension` interface.
 */
export type WithExtensions<SDK extends SDKBase> = {
  new <
    TCustomExtName extends string,
    TExt extends Extension<string>[] | { [P in TCustomExtName]: Extension<string> },
    TExtName extends string = TExt extends Extension<string>[] ? ExtensionNames<TExt> : keyof TExt
  >(
    apiKey: string,
    options?: MagicSDKAdditionalConfiguration<TCustomExtName, TExt>,
  ): SDK &
    {
      [P in TExtName]: TExt extends Extension<string>[]
        ? Omit<GetExtensionFromName<TExt, P>, HiddenExtensionFields>
        : TExt extends { [P in TExtName]: Extension<string> }
        ? Omit<TExt[P], HiddenExtensionFields>
        : never;
    };
};
