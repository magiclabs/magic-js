import browserEnv from '@ikscodes/browser-env';
import { createPromise } from '../../../../src/util/promise-tools';

beforeEach(() => {
  browserEnv.restore();
});

test('Creates a native `Promise`', () => {
  const p = createPromise((resolve) => resolve());

  expect(p instanceof Promise).toBe(true);
});

test('Resolves the `Promise`', (done) => {
  createPromise((resolve) => resolve()).then(() => {
    done();
  });
});

test('Rejects the `Promise`', (done) => {
  createPromise((resolve, reject) => reject()).catch(() => {
    done();
  });
});

test('Rejects the `Promise` if an async executor is given and throws', (done) => {
  createPromise(async () => {
    throw new Error('Oops');
  }).catch((err) => {
    expect(err.message).toBe('Oops');
    done();
  });
});

test('Rejects the `Promise` if a sync executor is given and throws', (done) => {
  createPromise(() => {
    throw new Error('Oops');
  }).catch((err) => {
    expect(err.message).toBe('Oops');
    done();
  });
});
