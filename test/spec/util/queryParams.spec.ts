import test from 'ava';
import { encodeQueryParameters, decodeQueryParameters } from '../../../src/util/query-params';

/**
 * Encodes query parameters
 *
 * Action Must:
 * - return a Base64-encoded JSON string.
 */
test('#01', async t => {
  const result = encodeQueryParameters({
    API_KEY: 'test',
  });
  t.is(typeof result, 'string');
  t.is(result, 'eyJBUElfS0VZIjoidGVzdCJ9');
});

/**
 * Decodes query parameters
 *
 * Action Must:
 * - return an object from a Base64-encoded JSON string.
 */
test('#02', async t => {
  const result = decodeQueryParameters('eyJBUElfS0VZIjoidGVzdCJ9');
  t.is(typeof result, 'object');
  t.deepEqual(result, { API_KEY: 'test' });
});
