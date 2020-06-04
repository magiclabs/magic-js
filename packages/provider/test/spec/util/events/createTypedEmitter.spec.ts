import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import test from 'ava';
import { TypedEmitter, createTypedEmitter } from '../../../../src/util/events';

test.beforeEach(t => {
  browserEnv.restore();
});

test('Returns an object containing a `TypedEmitter` instance & two helper functions', t => {
  const { emitter, createBoundEmitterMethod, createChainingEmitterMethod } = createTypedEmitter();

  t.true(emitter instanceof TypedEmitter);
  t.is(typeof createBoundEmitterMethod, 'function');
  t.is(typeof createChainingEmitterMethod, 'function');
});

test('`createBoundEmitterMethod` helper creates a function that calls the underlying `TypedEmitter` method', t => {
  const { emitter, createBoundEmitterMethod } = createTypedEmitter();

  const emitStub = sinon.stub().returns('foobar');
  emitter.emit = emitStub;

  const testObj = {
    foo: createBoundEmitterMethod('emit'),
  };

  const result = testObj.foo('hello world');

  t.true(emitStub.calledWith('hello world'));
  t.is(result, 'foobar' as any);
});

test('`createChainingEmitterMethod` helper creates a function that calls the underlying `TypedEmitter` method', t => {
  const { emitter, createChainingEmitterMethod } = createTypedEmitter();

  const onStub = sinon.stub().returns('foobar');
  emitter.on = onStub;

  const testObj: any = {};
  testObj.foo = createChainingEmitterMethod('on', testObj);

  const result = testObj.foo('hello world');

  t.true(onStub.calledWith('hello world'));
  t.is(result, testObj);
});
