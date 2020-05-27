import { TypedEmitter, EventsDefinition } from './events';
import { MagicSDKError, MagicRPCError } from '../core/sdk-exceptions';

/**
 * A `Promise` and `EventEmitter` all in one!
 */
export type PromiEvent<TResult, TEvents extends EventsDefinition = void> = Promise<TResult> &
  {
    [P in keyof TypedEmitter]: TypedEmitter<
      TEvents extends void ? DefaultEvents<TResult> : TEvents & DefaultEvents<TResult>
    >[P];
  };

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
 * Create a native JavaScript `Promise` overloaded with strongly-typed methods
 * from `EventEmitter`.
 */
export function createPromiEvent<TResult, TEvents extends EventsDefinition = void>(
  executor: AsyncPromiseExecutor<TResult>,
): PromiEvent<TResult, TEvents extends void ? DefaultEvents<TResult> : TEvents & DefaultEvents<TResult>> {
  const promise = createAutoCatchingPromise(executor);
  const eventEmitter = new TypedEmitter<TEvents & DefaultEvents<TResult>>();
  let isUsingPromise = true;

  const createBoundEmitterMethod = (method: keyof typeof eventEmitter) => (...args: any[]) => {
    return (eventEmitter as any)[method].apply(eventEmitter, args);
  };

  const createChainingEmitterMethod = (method: keyof typeof eventEmitter) => (...args: any[]) => {
    isUsingPromise = false;
    return createBoundEmitterMethod(method)(...args);
  };

  const source = promise.then(
    resolved => {
      promiEvent.emit('done', resolved);
      promiEvent.emit('settled');
      return resolved;
    },

    err => {
      promiEvent.emit('error', err);
      promiEvent.emit('settled');
      if (isUsingPromise) throw err;
    },
  );

  const promiEvent = Object.assign(source, {
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

  return promiEvent as any;
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
