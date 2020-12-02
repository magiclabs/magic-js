/* eslint-disable no-underscore-dangle */

import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase, MagicSDKAdditionalConfiguration } from '../core/sdk';
import { createExtensionNotInitializedError, MagicExtensionError, MagicExtensionWarning } from '../core/sdk-exceptions';
import { createPromiEvent, encodeJSON, decodeJSON, storage, isPromiEvent } from '../util';

interface BaseExtension<TName extends string> extends BaseModule {
  /**
   * A structure describing the platform and version compatiblity of this
   * extension.
   */
  compat?: {
    'magic-sdk': boolean | string;
    '@magic-sdk/react-native': boolean | string;
  };
}

const sdkAccessFields = ['request', 'transport', 'overlay', 'sdk'];

abstract class BaseExtension<TName extends string> extends BaseModule {
  public abstract readonly name: TName;

  private __sdk_access_field_descriptors__ = new Map<string, { descriptor: PropertyDescriptor; source: any }>();
  private __is_initialized__ = false;

  protected utils = {
    createPromiEvent,
    isPromiEvent,
    encodeJSON,
    decodeJSON,
    createJsonRpcRequestPayload,
    standardizeJsonRpcRequestPayload,
    storage,
  };

  constructor() {
    super(undefined as any);

    // Disallow SDK access before initialization.
    sdkAccessFields.forEach((prop) => {
      const allSources = [this, BaseExtension.prototype, BaseModule.prototype];
      const allDescriptors = allSources.map((source) => Object.getOwnPropertyDescriptor(source, prop));

      const sourceIndex = allDescriptors.findIndex((a: any) => !!a);
      const source = sourceIndex > 0 ? Object.getPrototypeOf(this) : this;
      const descriptor = allDescriptors[sourceIndex];

      /* istanbul ignore else */
      if (descriptor) {
        this.__sdk_access_field_descriptors__.set(prop, { descriptor, source });

        Object.defineProperty(source, prop, {
          configurable: true,
          get: () => {
            throw createExtensionNotInitializedError(prop);
          },
        });
      }
    });
  }

  /**
   * Registers a Magic SDK instance with this Extension.
   *
   * @internal
   */
  public init(sdk: SDKBase) {
    if (this.__is_initialized__) return;

    // Replace original property descriptors
    // for SDK access fields post-initialization.
    sdkAccessFields.forEach((prop) => {
      const { descriptor, source } = this.__sdk_access_field_descriptors__.get(prop)!;
      Object.defineProperty(source, prop, descriptor);
    });

    this.sdk = sdk;
    this.__is_initialized__ = true;
  }

  /**
   * Creates a deprecation warning wrapped with a native Magic SDK warning type.
   * Best practice is to warn users of upcoming deprecations at least one major
   * version before the change is implemented. You can use this method to
   * communicate deprecations in a manner consistent with Magic SDK core code.
   */
  protected createDeprecationWarning(options: {
    method: string;
    removalVersion: string;
    useInstead?: string;
  }): MagicExtensionWarning {
    const { method, removalVersion, useInstead } = options;

    const useInsteadSuffix = useInstead ? ` Use \`${useInstead}\` instead.` : '';
    const message = `\`${method}\` will be removed from this Extension in version \`${removalVersion}\`.${useInsteadSuffix}`;
    return new MagicExtensionWarning(this, 'DEPRECATION_NOTICE', message);
  }

  /**
   * Creates a warning wrapped with a native Magic SDK warning type. This
   * maintains consistency in warning messaging for consumers of Magic SDK and
   * this Extension.
   */
  protected createWarning(code: string | number, message: string): MagicExtensionWarning {
    return new MagicExtensionWarning(this, code, message);
  }

  /**
   * Creates an error wrapped with a native Magic SDK error type. This maintains
   * consistency in error handling for consumers of Magic SDK and this
   * Extension.
   */
  protected createError<TData = any>(code: string | number, message: string, data: TData): MagicExtensionError<TData> {
    return new MagicExtensionError<TData>(this, code, message, data);
  }
}

abstract class InternalExtension<TName extends string, TConfig extends any = any> extends BaseExtension<TName> {
  public abstract readonly config: TConfig;
}

/**
 * A base class representing "extensions" to the core Magic JS APIs. Extensions
 * enable new functionality by composing Magic endpoints methods together.
 */
export abstract class Extension<TName extends string> extends BaseExtension<TName> {
  /**
   * This is a special constructor used to mark "official" extensions. These
   * extensions are designed for special interaction with the Magic iframe using
   * custom JSON RPC methods, business logic, and global configurations. This is
   * intended for internal-use only (and provides no useful advantage to
   * open-source extension developers over the regular `Extension` class).
   *
   * @internal
   */
  public static Internal = InternalExtension;
}

/**
 * These fields are exposed on the `Extension` type,
 * but should be hidden from the public interface.
 */
type HiddenExtensionFields = 'name' | 'init' | 'config' | 'compat';

/**
 * Gets the type contained in an array type.
 */
type UnwrapArray<T extends any[]> = T extends Array<infer P> ? P : never;

/**
 * Create a union type of Extension names from an
 * array of Extension types given by `TExt`.
 */
type ExtensionNames<TExt extends Extension<string>[]> = UnwrapArray<
  {
    [P in keyof TExt]: TExt[P] extends Extension<infer K> ? K : never;
  }
>;

/**
 * From the literal Extension name type given by `TExtName`,
 * extract a dictionary of Extension types.
 */
type GetExtensionFromName<TExt extends Extension<string>[], TExtName extends string> = {
  [P in TExtName]: Extract<UnwrapArray<TExt>, Extension<TExtName>>;
}[TExtName];

/**
 * Wraps a Magic SDK constructor with the necessary type
 * information to support a strongly-typed `Extension` interface.
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
