import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { TypedEmitter, createTypedEmitter } from '../../../../src/util/events';

beforeEach(() => {
  browserEnv.restore();
});

test('Returns an object containing a `TypedEmitter` instance & two helper functions', () => {
  const { emitter, createBoundEmitterMethod, createChainingEmitterMethod } = createTypedEmitter();

  expect(emitter instanceof TypedEmitter).toBe(true);
  expect(typeof createBoundEmitterMethod).toBe('function');
  expect(typeof createChainingEmitterMethod).toBe('function');
});

test('`createBoundEmitterMethod` helper creates a function that calls the underlying `TypedEmitter` method', () => {
  const { emitter, createBoundEmitterMethod } = createTypedEmitter();

  const emitStub = sinon.stub().returns('foobar');
  emitter.emit = emitStub;

  const testObj = {
    foo: createBoundEmitterMethod('emit'),
  };

  const result = testObj.foo('hello world');

  expect(emitStub.calledWith('hello world')).toBe(true);
  expect(result).toBe('foobar' as any);
});

test('`createChainingEmitterMethod` helper creates a function that calls the underlying `TypedEmitter` method', () => {
  const { emitter, createChainingEmitterMethod } = createTypedEmitter();

  const onStub = sinon.stub().returns('foobar');
  emitter.on = onStub;

  const testObj: any = {};
  testObj.foo = createChainingEmitterMethod('on', testObj);

  const result = testObj.foo('hello world');

  expect(onStub.calledWith('hello world')).toBe(true);
  expect(result).toBe(testObj);
});
