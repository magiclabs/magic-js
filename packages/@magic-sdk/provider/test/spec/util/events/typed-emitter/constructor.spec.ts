import EventEmitter from 'eventemitter3';
import { TypedEmitter } from '../../../../../src/util/events';

test('Initialize `TypedEmitter`', () => {
  const emitter = new TypedEmitter();

  expect(emitter instanceof TypedEmitter).toBe(true);
  expect(emitter instanceof EventEmitter).toBe(true);
});
