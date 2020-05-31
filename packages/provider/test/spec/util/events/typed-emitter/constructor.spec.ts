import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import EventEmitter from 'eventemitter3';
import { TypedEmitter } from '../../../../../src/util/events';

test.beforeEach(t => {
  browserEnv.restore();
});

test('Initialize `TypedEmitter`', t => {
  const emitter = new TypedEmitter();

  t.true(emitter instanceof TypedEmitter);
  t.true(emitter instanceof EventEmitter);
});
