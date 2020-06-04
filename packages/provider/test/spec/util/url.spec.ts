import test from 'ava';
import { createURL } from '../../../src/util/url';

test('Creates a URL object', async t => {
  const url = createURL('https://example.com');
  t.true(url instanceof URL);
});

test('Creates a URL object with a base', async t => {
  const url = createURL('/test', 'https://example.com');
  t.true(url instanceof URL);
  t.is(url.pathname, '/test');
});
