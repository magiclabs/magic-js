import { createPromiEvent } from '../../../../src/util/promise-tools';
import { TypedEmitter } from '../../../../src/util/events';

type DefaultEvents<TResult> = {
  done: (result: TResult) => void;
  error: (reason: unknown) => void;
  settled: () => void;
};

type TypedEmitterMethods = keyof TypedEmitter<DefaultEvents<unknown>>;

const chainingEmitterMethods: TypedEmitterMethods[] = ['on', 'once', 'addListener', 'off', 'removeListener', 'removeAllListeners'];
const nonChainingEmitterMethods = ['emit', 'eventNames', 'listeners', 'listenerCount'];
const typedEmitterMethods = [...chainingEmitterMethods, ...nonChainingEmitterMethods];
const promiseMethods = ['then', 'catch', 'finally'];

beforeEach(() => {
  jest.resetAllMocks();
});

test('Creates a native `Promise`', () => {
  const promiEvent = createPromiEvent(resolve => resolve(true));

  expect(promiEvent instanceof Promise).toBe(true);
});

test('Attaches `TypedEmitter` methods to the initial value', () => {
  const promiEvent = createPromiEvent(resolve => resolve(true));

  typedEmitterMethods.forEach(method => {
    expect(typeof promiEvent[method as keyof typeof promiEvent] === 'function').toBe(true);
  });
});

test('Attaches `TypedEmitter` methods to `Promise.then` result', () => {
  const promiEvent = createPromiEvent(resolve => resolve(true)).then();

  typedEmitterMethods.forEach(method => {
    expect(typeof promiEvent[method as keyof typeof promiEvent] === 'function').toBe(true);
  });
});

test('Attaches `TypedEmitter` methods to `Promise.catch` result', () => {
  const promiEvent = createPromiEvent(resolve => resolve(true)).catch();

  typedEmitterMethods.forEach(method => {
    expect(typeof promiEvent[method as keyof typeof promiEvent] === 'function').toBe(true);
  });
});

test('Attaches `TypedEmitter` methods to `Promise.finally` result', () => {
  const promiEvent = createPromiEvent(resolve => resolve(true)).catch();

  typedEmitterMethods.forEach(method => {
    expect(typeof promiEvent[method as keyof typeof promiEvent] === 'function').toBe(true);
  });
});

test('Attaches `Promise` methods to `TypedEmitter` results', () => {
  chainingEmitterMethods.forEach(emitterMethod => {
    const emitterStub = jest.spyOn(TypedEmitter.prototype, emitterMethod as any).mockImplementation();
    const promiEvent = createPromiEvent(resolve => resolve(true))[emitterMethod]('done', () => { /* noop */ });

    promiseMethods.forEach(promiseMethod => {
      expect(typeof promiEvent[promiseMethod as keyof typeof promiEvent] === 'function').toBe(true);
    });

    emitterStub.mockReset();
    emitterStub.mockRestore();
  });
});

test('Emits "done" event upon Promise resolution', done => {
  createPromiEvent(resolve => resolve('hello')).on('done', result => {
    expect(result).toBe('hello');
    done();
  });
});

test('Emits "settled" event upon Promise resolution', done => {
  createPromiEvent(resolve => resolve(true)).on('settled', () => {
    done();
  });
});

test('Emits "error" event upon Promise reject', done => {
  createPromiEvent((resolve, reject) => reject('goodbye'))
    .on('error', err => {
      expect(err).toBe('goodbye' as any);
      done();
    })
    .catch(() => {
      /* noop */
    });
});

test('Emits "settled" event upon Promise reject', done => {
  createPromiEvent((resolve, reject) => reject())
    .on('settled', () => {
      done();
    })
    .catch(() => {
      /* noop */
    });
});
