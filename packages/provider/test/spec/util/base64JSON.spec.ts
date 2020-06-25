import test from 'ava';
import { encodeJSON, decodeJSON } from '../../../src/util/base64-json';

test('Encodes query parameters as Base64 JSON string', async (t) => {
  const result = encodeJSON({
    API_KEY: 'test',
  });
  t.is(typeof result, 'string');
  t.is(result, 'eyJBUElfS0VZIjoidGVzdCJ9');
});

test('Decodes query parameters from Base64 JSON string', async (t) => {
  const result = decodeJSON('eyJBUElfS0VZIjoidGVzdCJ9');
  t.deepEqual(result, { API_KEY: 'test' });
});
