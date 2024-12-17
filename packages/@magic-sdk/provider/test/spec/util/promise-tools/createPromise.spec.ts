import { createPromise } from '../../../../src/util/promise-tools';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Creates a native `Promise`', () => {
  const promiEvent = createPromise(resolve => resolve(true));

  expect(promiEvent instanceof Promise).toBe(true);
});

test('Resolves the `Promise`', done => {
  createPromise(resolve => resolve(true)).then(() => {
    done();
  });
});

test('Rejects the `Promise`', done => {
  createPromise((resolve, reject) => reject()).catch(() => {
    done();
  });
});

test('Rejects the `Promise` if an async executor is given and throws', done => {
  createPromise(async () => {
    throw new Error('Oops');
  }).catch(err => {
    expect(err.message).toBe('Oops');
    done();
  });
});

test('Rejects the `Promise` if a sync executor is given and throws', done => {
  createPromise(() => {
    throw new Error('Oops');
  }).catch(err => {
    expect(err.message).toBe('Oops');
    done();
  });
});
