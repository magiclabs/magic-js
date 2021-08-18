import browserEnv from '@ikscodes/browser-env';
import { createPromiEvent } from '../../../../src/util/promise-tools';
import { TypedEmitter } from '../../../../src/util/events';

const chainingEmitterMethods = ['on', 'once', 'addListener', 'off', 'removeListener', 'removeAllListeners'];
const nonChainingEmitterMethods = ['emit', 'eventNames', 'listeners', 'listenerCount'];
const typedEmitterMethods = [...chainingEmitterMethods, ...nonChainingEmitterMethods];
const promiseMethods = ['then', 'catch', 'finally'];

beforeEach(() => {
  browserEnv.restore();
});

test('Creates a native `Promise`', () => {
  const p = createPromiEvent((resolve) => resolve());

  expect(p instanceof Promise).toBe(true);
});

test('Attaches `TypedEmitter` methods to the initial value', () => {
  const p = createPromiEvent((resolve) => resolve());

  typedEmitterMethods.forEach((method) => {
    expect(typeof p[method] === 'function').toBe(true);
  });
});

test('Attaches `TypedEmitter` methods to `Promise.then` result', () => {
  const p = createPromiEvent((resolve) => resolve()).then();

  typedEmitterMethods.forEach((method) => {
    expect(typeof p[method] === 'function').toBe(true);
  });
});

test('Attaches `TypedEmitter` methods to `Promise.catch` result', () => {
  const p = createPromiEvent((resolve) => resolve()).catch();

  typedEmitterMethods.forEach((method) => {
    expect(typeof p[method] === 'function').toBe(true);
  });
});

test('Attaches `TypedEmitter` methods to `Promise.finally` result', () => {
  const p = createPromiEvent((resolve) => resolve()).catch();

  typedEmitterMethods.forEach((method) => {
    expect(typeof p[method] === 'function').toBe(true);
  });
});

test('Attaches `Promise` methods to `TypedEmitter` results', () => {
  chainingEmitterMethods.forEach((emitterMethod) => {
    const emitterStub = jest.spyOn(TypedEmitter.prototype, emitterMethod as any).mockImplementation();
    const p = createPromiEvent((resolve) => resolve())[emitterMethod]();

    promiseMethods.forEach((promiseMethod) => {
      expect(typeof p[promiseMethod] === 'function').toBe(true);
    });

    emitterStub.mockReset();
    emitterStub.mockRestore();
  });
});

test('Emits "done" event upon Promise resolution', (done) => {
  createPromiEvent((resolve) => resolve('hello')).on('done', (result) => {
    expect(result).toBe('hello');
    done();
  });
});

test('Emits "settled" event upon Promise resolution', (done) => {
  createPromiEvent((resolve) => resolve()).on('settled', () => {
    done();
  });
});

test('Emits "error" event upon Promise reject', (done) => {
  createPromiEvent((resolve, reject) => reject('goodbye'))
    .on('error', (err) => {
      expect(err).toBe('goodbye' as any);
      done();
    })
    .catch(() => {});
});

test('Emits "settled" event upon Promise reject', (done) => {
  createPromiEvent((resolve, reject) => reject())
    .on('settled', () => {
      done();
    })
    .catch(() => {});
});
