import test from 'ava';
import { createURL } from '../../../src/util/url';

test('Creates a URL variable using native URL', async t => {
  const url = createURL('https://example.com');
  t.true(url instanceof URL);
});
