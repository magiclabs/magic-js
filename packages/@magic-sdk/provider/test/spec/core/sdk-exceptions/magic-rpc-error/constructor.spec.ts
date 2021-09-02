import browserEnv from '@ikscodes/browser-env';
import { MagicRPCError } from '../../../../../src/core/sdk-exceptions';

beforeEach(() => {
  browserEnv.restore();
});

test('Initialize `MagicRPCError` with object argument', () => {
  const err = new MagicRPCError({
    code: -32603,
    message: 'hello world',
  });

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] hello world');
  expect(err.rawMessage).toBe('hello world');
});

test('Initialize MagicRPCError with `null` argument', () => {
  const err = new MagicRPCError(null);

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] Internal error');
  expect(err.rawMessage).toBe('Internal error');
});

test('Initialize MagicRPCError with `undefined` argument', () => {
  const err = new MagicRPCError();

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] Internal error');
  expect(err.rawMessage).toBe('Internal error');
});

test('Initialize MagicRPCError with unknown error code argument', () => {
  const err = new MagicRPCError({
    code: 1,
    message: 'hello world',
  });

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] hello world');
  expect(err.rawMessage).toBe('hello world');
});
