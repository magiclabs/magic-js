import { encodeJSON, decodeJSON } from '../../../src/util/base64-json';

test('Encodes query parameters as Base64 JSON string', async () => {
  const result = encodeJSON({
    API_KEY: 'test',
  });
  expect(typeof result).toBe('string');
  expect(result).toBe('eyJBUElfS0VZIjoidGVzdCJ9');
});

test('Decodes query parameters from Base64 JSON string', async () => {
  const result = decodeJSON('eyJBUElfS0VZIjoidGVzdCJ9');
  expect(result).toEqual({ API_KEY: 'test' });
});
