import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { createPromise } from '../../../../src/util/promise-tools';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('Creates a native `Promise`', (t) => {
  const p = createPromise((resolve) => resolve());

  t.true(p instanceof Promise);
});

test.cb('Resolves the `Promise`', (t) => {
  createPromise((resolve) => resolve()).then(() => {
    t.end();
  });
});

test.cb('Rejects the `Promise`', (t) => {
  createPromise((resolve, reject) => reject()).catch(() => {
    t.end();
  });
});

test.cb('Rejects the `Promise` if an async executor is given and throws', (t) => {
  createPromise(async () => {
    throw new Error('Oops');
  }).catch((err) => {
    t.is(err.message, 'Oops');
    t.end();
  });
});

test.cb('Rejects the `Promise` if a sync executor is given and throws', (t) => {
  createPromise(() => {
    throw new Error('Oops');
  }).catch((err) => {
    t.is(err.message, 'Oops');
    t.end();
  });
});
