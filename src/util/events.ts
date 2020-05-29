import EventEmitter from 'eventemitter3';

export type EventsDefinition = { [K in string | symbol]: (...args: any[]) => void } | void;

/**
 * An extension of `EventEmitter` (provided by `eventemitter3`) with an adjusted
 * type interface that supports the unique structure of Magic SDK modules.
 */
export class TypedEmitter<Events extends EventsDefinition = void> extends EventEmitter<
  Events extends void ? string | symbol : Events
> {}

type ChainingMethods = 'on' | 'once' | 'addListener' | 'off' | 'removeListener' | 'removeAllListeners';
type NonChainingMethods = 'emit' | 'eventNames' | 'listeners' | 'listenerCount';

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (...a: Parameters<T>) => TNewReturn;

/**
 * Creates a `TypedEmitter` instance and returns helper functions for easily
 * mixing `TypedEmitter` methods into other objects.
 */
export function createTypedEmitter<Events extends EventsDefinition = void>() {
  const emitter = new TypedEmitter<Events>();

  const createChainingEmitterMethod = <T1 extends ChainingMethods, T2>(
    method: T1,
    source: T2,
  ): ReplaceReturnType<TypedEmitter[T1], T2> => {
    return (...args: any[]) => {
      (emitter as any)[method].apply(emitter, args);
      return source;
    };
  };

  const createBoundEmitterMethod = <T extends NonChainingMethods>(method: T): TypedEmitter[T] => {
    return (...args: any[]) => {
      return (emitter as any)[method].apply(emitter, args);
    };
  };

  return {
    emitter,
    createChainingEmitterMethod,
    createBoundEmitterMethod,
  };
}
