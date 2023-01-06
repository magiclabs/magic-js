import { createJsonRpcRequestPayload, standardizeJsonRpcRequestPayload } from '../core/json-rpc';
import { BaseModule } from './base-module';
import { SDKBase, MagicSDKAdditionalConfiguration, MagicSDKExtensionsOption } from '../core/sdk';
import { createExtensionNotInitializedError, MagicExtensionError, MagicExtensionWarning } from '../core/sdk-exceptions';
import { createPromiEvent, encodeJSON, decodeJSON, storage, isPromiEvent } from '../util';

type AnonymousExtension = 'anonymous extension';

interface BaseExtension<TName extends string = AnonymousExtension> extends BaseModule {
  /**
   * A structure describing the platform and version compatiblity of this
   * extension.
   */
  compat?: {
    'magic-sdk': boolean | string;
    '@magic-sdk/react-native': boolean | string;
    '@magic-sdk/react-native-bare': boolean | string;
    '@magic-sdk/react-native-expo': boolean | string;
  };
}

const sdkAccessFields = ['request', 'overlay', 'sdk'];

/**
 * From the `BaseExtension`-derived instance, get the prototype
 * chain up to and including the `BaseModule` class.
 */
function getPrototypeChain<T extends BaseExtension<string>>(instance: T) {
  let currentProto = Object.getPrototypeOf(instance);
  const protos = [currentProto];

  while (currentProto !== BaseModule.prototype) {
    currentProto = Object.getPrototypeOf(currentProto);
    protos.push(currentProto);
  }

  return protos;
}

abstract class BaseExtension<TName extends string = AnonymousExtension> extends BaseModule {
  public abstract readonly name: TName;

  private __sdk_access_field_descriptors__ = new Map<
    string,
    { descriptor: PropertyDescriptor; isPrototypeField: boolean }
  >();
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

    // Disallow SDK access before initialization...

    const allSources = [this, ...getPrototypeChain(this)];

    sdkAccessFields.forEach((prop) => {
      const allDescriptors = allSources.map((source) => Object.getOwnPropertyDescriptor(source, prop));
      const sourceIndex = allDescriptors.findIndex((x) => !!x);
      const isPrototypeField = sourceIndex > 0;
      const descriptor = allDescriptors[sourceIndex];

      /* istanbul ignore else */
      if (descriptor) {
        this.__sdk_access_field_descriptors__.set(prop, { descriptor, isPrototypeField });

        Object.defineProperty(this, prop, {
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
      /* istanbul ignore else */
      if (this.__sdk_access_field_descriptors__.has(prop)) {
        const { descriptor, isPrototypeField } = this.__sdk_access_field_descriptors__.get(prop)!;

        if (isPrototypeField) {
          // For prototype fields, we just need the `delete` operator so that
          // the instance will fallback to the prototype chain itself.
          delete this[prop as keyof this];
        } else {
          Object.defineProperty(this, prop, descriptor);
        }
      }
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
export abstract class Extension<TName extends string = AnonymousExtension> extends BaseExtension<TName> {
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
  public static Anonymous: AnonymousExtension = 'anonymous extension';
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
type ExtensionNames<TExt extends Extension<string>[]> = UnwrapArray<TExt> extends Extension<infer R> ? R : never;

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
  new <TCustomExtName extends string, TExt extends MagicSDKExtensionsOption<TCustomExtName>>(
    apiKey: string,
    options?: MagicSDKAdditionalConfiguration<TCustomExtName, TExt>,
  ): InstanceWithExtensions<SDK, TExt>;
};

export type InstanceWithExtensions<SDK extends SDKBase, TExt extends MagicSDKExtensionsOption> = SDK &
  {
    [P in Exclude<
      TExt extends Extension<string>[] ? ExtensionNames<TExt> : keyof TExt,
      number | AnonymousExtension
    >]: TExt extends Extension<string>[]
      ? Omit<GetExtensionFromName<TExt, P>, HiddenExtensionFields>
      : TExt extends {
          [P in Exclude<
            TExt extends Extension<string>[] ? ExtensionNames<TExt> : keyof TExt,
            number | AnonymousExtension
          >]: Extension<string>;
        }
      ? Omit<TExt[P], HiddenExtensionFields>
      : never;
  };
