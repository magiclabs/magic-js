import test from 'ava';
import { encodeQueryParameters, decodeQueryParameters } from '../../../src/util/query-params';

test('Encodes query parameters as Base64 JSON string', async t => {
  const result = encodeQueryParameters({
    API_KEY: 'test',
  });
  t.is(typeof result, 'string');
  t.is(result, 'eyJBUElfS0VZIjoidGVzdCJ9');
});

test('Decodes query parameters from a Base64 JSON string', async t => {
  const result = decodeQueryParameters('eyJBUElfS0VZIjoidGVzdCJ9');
  t.is(typeof result, 'object');
  t.deepEqual(result, { API_KEY: 'test' });
});
