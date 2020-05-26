import { TypedEmitter, EventsDefinition } from './events';
import { MagicSDKError, MagicRPCError } from '../core/sdk-exceptions';

/**
 * An exact replication of the `Promise` interface with an updated return type
 * for each chaining method.
 */
interface EventedPromiseChain<T, TEvents extends EventsDefinition> extends Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): PromiEvent<TResult1 | TResult2, TEvents>;

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): PromiEvent<T | TResult, TEvents>;

  finally(onfinally?: (() => void) | undefined | null): PromiEvent<T, TEvents>;
}

/**
 * A `Promise` and `EventEmitter` all in one!
 */
export type PromiEvent<TResult, TEvents extends EventsDefinition = void> = EventedPromiseChain<
  TResult,
  TEvents extends void ? DefaultEvents<TResult> : TEvents & DefaultEvents<TResult>
> &
  TypedEmitter<TEvents extends void ? DefaultEvents<TResult> : TEvents & DefaultEvents<TResult>>;

/**
 * Default events attached to every `PromiEvent`.
 */
type DefaultEvents<TResult> = {
  done: (result: TResult) => void;
  error: (err: MagicSDKError | MagicRPCError) => void;
  settled: () => void;
};

/**
 * A `Promise` executor with can be optionally asynchronous.
 */
type AsyncPromiseExecutor<TResult> = (
  resolve: (value?: TResult | PromiseLike<TResult>) => void,
  reject: (reason?: any) => void,
) => void | Promise<void>;

/**
 * Clone a `Promise` object by calling `promise.then()`
 */
function clonePromise<T extends Promise<any>>(promise: T): T {
  return promise.then() as T;
}

/**
 * Create a native JavaScript `Promise` overloaded with strongly-typed methods
 * from `EventEmitter`.
 */
export function createPromiEvent<TResult, TEvents extends EventsDefinition = void>(
  executor: AsyncPromiseExecutor<TResult>,
): PromiEvent<TResult, TEvents & DefaultEvents<TResult>> {
  const promise = createAutoCatchingPromise(executor);
  const eventEmitter = new TypedEmitter<TEvents & DefaultEvents<TResult>>();

  const promiEvent = () => {
    return Object.assign(clonePromise(promise), {
      then: createChainingPromiseMethod('then'),
      catch: createChainingPromiseMethod('catch'),
      finally: createChainingPromiseMethod('finally'),

      addListener: createChainingEmitterMethod('addListener'),
      on: createChainingEmitterMethod('on'),
      once: createChainingEmitterMethod('once'),

      off: createChainingEmitterMethod('off'),
      removeAllListeners: createChainingEmitterMethod('removeAllListeners'),
      removeListener: createChainingEmitterMethod('removeListener'),

      emit: createBoundEmitterMethod('emit'),
      eventNames: createBoundEmitterMethod('eventNames'),
      listeners: createBoundEmitterMethod('listeners'),
      listenerCount: createBoundEmitterMethod('listenerCount'),
    });
  };

  const createChainingPromiseMethod = (method: keyof typeof promise) => (...args: any[]) => {
    (promise as any)[method].apply(promise, args);
    return promiEvent();
  };

  const createChainingEmitterMethod = (method: keyof typeof eventEmitter) => (...args: any[]) => {
    (eventEmitter as any)[method].apply(eventEmitter, args);
    return promiEvent();
  };

  const createBoundEmitterMethod = (method: keyof typeof eventEmitter) => (...args: any[]) => {
    return (eventEmitter as any)[method].apply(eventEmitter, args);
  };

  const result = promiEvent();

  result.then(resolved => {
    result.emit('done', resolved);
    if (!promise.finally) result.emit('settled');
  });

  result.catch(err => {
    result.emit('error', err);
    if (!promise.finally) result.emit('settled');
  });

  if ((promise as any).finally) result.finally(() => result.emit('settled'));

  return result as any;
}

/**
 * Creates a `Promise` with an **async executor** that automatically catches
 * errors occurring within the executor. Nesting promises in this way is usually
 * deemed an _anti-pattern_, but it's useful and clean when promisifying the
 * event-based code that's inherent to JSON RPC.
 *
 * So, here we solve the issue of nested promises by ensuring that no errors
 * mistakenly go unhandled!
 */
export function createAutoCatchingPromise<TResult>(executor: AsyncPromiseExecutor<TResult>) {
  return new Promise<TResult>((resolve, reject) => {
    const result = executor(resolve, reject);
    Promise.resolve(result).catch(reject);
  });
}
