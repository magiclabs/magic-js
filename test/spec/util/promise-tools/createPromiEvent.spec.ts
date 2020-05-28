import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import test from 'ava';
import { createPromiEvent } from '../../../../src/util/promise-tools';
import { TypedEmitter } from '../../../../src/util/events';

const chainingEmitterMethods = ['on', 'once', 'addListener', 'off', 'removeListener', 'removeAllListeners'];
const nonChainingEmitterMethods = ['emit', 'eventNames', 'listeners', 'listenerCount'];
const typedEmitterMethods = [...chainingEmitterMethods, ...nonChainingEmitterMethods];
const promiseMethods = ['then', 'catch', 'finally'];

test.beforeEach(t => {
  browserEnv.restore();
});

test('Creates a native `Promise`', t => {
  const p = createPromiEvent(resolve => resolve());

  t.true(p instanceof Promise);
});

test('Attaches `TypedEmitter` methods to the initial value', t => {
  const p = createPromiEvent(resolve => resolve());

  typedEmitterMethods.forEach(method => {
    t.true(typeof p[method] === 'function');
  });
});

test('Attaches `TypedEmitter` methods to `Promise.then` result', t => {
  const p = createPromiEvent(resolve => resolve()).then();

  typedEmitterMethods.forEach(method => {
    t.true(typeof p[method] === 'function');
  });
});

test('Attaches `TypedEmitter` methods to `Promise.catch` result', t => {
  const p = createPromiEvent(resolve => resolve()).catch();

  typedEmitterMethods.forEach(method => {
    t.true(typeof p[method] === 'function');
  });
});

test('Attaches `TypedEmitter` methods to `Promise.finally` result', t => {
  const p = createPromiEvent(resolve => resolve()).catch();

  typedEmitterMethods.forEach(method => {
    t.true(typeof p[method] === 'function');
  });
});

test('Attaches `Promise` methods to `TypedEmitter` results', t => {
  chainingEmitterMethods.forEach(emitterMethod => {
    const emitterStub = sinon.stub(TypedEmitter.prototype, emitterMethod as any);
    const p = createPromiEvent(resolve => resolve())[emitterMethod]();

    promiseMethods.forEach(promiseMethod => {
      t.true(typeof p[promiseMethod] === 'function');
    });

    emitterStub.restore();
  });
});

test.cb('Emits "done" event upon Promise resolution', t => {
  createPromiEvent(resolve => resolve('hello')).on('done', result => {
    t.is(result, 'hello');
    t.end();
  });
});

test.cb('Emits "settled" event upon Promise resolution', t => {
  createPromiEvent(resolve => resolve()).on('settled', () => {
    t.end();
  });
});

test.cb('Emits "error" event upon Promise reject', t => {
  createPromiEvent((resolve, reject) => reject('goodbye'))
    .on('error', err => {
      t.is(err, 'goodbye' as any);
      t.end();
    })
    .catch(() => {});
});

test.cb('Emits "settled" event upon Promise reject', t => {
  createPromiEvent((resolve, reject) => reject())
    .on('settled', () => {
      t.end();
    })
    .catch(() => {});
});
