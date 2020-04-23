import test from 'ava';
import { encodeQueryParameters } from '../../../src/util/query-params';

test('Encodes query parameters as compressed, URL-safe, Base64 JSON string', async t => {
  const result = encodeQueryParameters({
    API_KEY: 'test',
  });
  t.is(typeof result, 'string');
  t.is(result, 'eJyrVnIM8Iz3do1UslIqSS0uUaoFADMKBZ0%3D');
});
