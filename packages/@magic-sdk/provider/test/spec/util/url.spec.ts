import { createURL } from '../../../src/util/url';

test('Creates a URL object', async () => {
  const url = createURL('https://example.com');
  expect(url instanceof URL).toBe(true);
});

test('Creates a URL object with a base', async () => {
  const url = createURL('/test', 'https://example.com');
  expect(url instanceof URL).toBe(true);
  expect(url.pathname).toBe('/test');
});
