import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { MagicSDKError, MagicRPCError } from '../core/sdk-exceptions';

export type EventsDefinition<EventName extends string = string> = {
  [P in EventName]: (...args: any[]) => void;
};

export type PromiEvent<TResult, TEvents extends EventsDefinition> = Promise<TResult> & TypedEmitter<TEvents>;

type DefaultEvents<TResult> = {
  done: (result: TResult) => void;
  error: (err: MagicSDKError | MagicRPCError) => void;
  settled: () => void;
};

type AsyncPromiseExecutor<TResult> = (
  resolve: (value?: TResult | PromiseLike<TResult>) => void,
  reject: (reason?: any) => void,
) => void | Promise<void>;

/**
 * Create a native JavaScript `Promise` overloaded with strongly-typed methods
 * from `EventEmitter`.
 */
export function createPromiEvent<TResult, TEvents extends EventsDefinition = {}>(
  executor: AsyncPromiseExecutor<TResult>,
): PromiEvent<TResult, TEvents & DefaultEvents<TResult>> {
  const promise = createAutoCatchingPromise(executor);
  const eventEmitter = new EventEmitter() as TypedEmitter<TEvents & DefaultEvents<TResult>>;
  const promiEvent = Object.assign(promise, eventEmitter);

  promiEvent.then(result => {
    promiEvent.emit('done', result);
    if (!promiEvent.finally) promiEvent.emit('settled');
  });

  promiEvent.catch(err => {
    promiEvent.emit('error', err);
    if (!promiEvent.finally) promiEvent.emit('settled');
  });

  if (promiEvent.finally) promiEvent.finally(() => promiEvent.emit('settled'));

  return promiEvent;
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
