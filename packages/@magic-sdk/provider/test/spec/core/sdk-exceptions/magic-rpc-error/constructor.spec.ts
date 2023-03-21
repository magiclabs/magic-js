import browserEnv from '@ikscodes/browser-env';
import { MagicRPCError } from '../../../../../src/core/sdk-exceptions';

const exampleData =
  '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011555345525f554e52454749535445524544000000000000000000000000000000';

beforeEach(() => {
  browserEnv.restore();
});

test('Initialize `MagicRPCError` with object argument', () => {
  const err = new MagicRPCError({
    code: -32603,
    message: 'hello world',
    data: exampleData,
  });

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] hello world');
  expect(err.rawMessage).toBe('hello world');
  expect(err.data).toBe(exampleData);
});

test('Initialize MagicRPCError with `null` argument', () => {
  const err = new MagicRPCError(null);

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] Internal error');
  expect(err.rawMessage).toBe('Internal error');
  expect(err.data).toBe(undefined);
});

test('Initialize MagicRPCError with `undefined` argument', () => {
  const err = new MagicRPCError();

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] Internal error');
  expect(err.rawMessage).toBe('Internal error');
  expect(err.data).toBe(undefined);
});

test('Initialize MagicRPCError with unknown error code argument', () => {
  const err = new MagicRPCError({
    // @ts-ignore
    code: 1,
    message: 'hello world',
    data: exampleData,
  });

  expect(err instanceof MagicRPCError).toBe(true);
  expect(err.code).toBe(-32603);
  expect(err.message).toBe('Magic RPC Error: [-32603] hello world');
  expect(err.rawMessage).toBe('hello world');
  expect(err.data).toBe(exampleData);
});
