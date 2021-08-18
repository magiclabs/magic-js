import browserEnv from '@ikscodes/browser-env';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { ENCODED_QUERY_PARAMS } from '../../../constants';

beforeEach(() => {
  browserEnv();
  browserEnv.stub('addEventListener', jest.fn());
  (PayloadTransport.prototype as any).init = jest.fn();
});

test('Instantiate when no endpoint is passed', () => {
  /* Execution */
  const transport = new (PayloadTransport as any)(undefined, ENCODED_QUERY_PARAMS);

  /* Assertion */
  expect(transport instanceof PayloadTransport).toBe(true);
  expect(transport.endpoint).toBe(undefined);
  expect((PayloadTransport.prototype as any).init).toBeCalledTimes(1);
});

test('Instantiate with proper params', () => {
  /* Execution */
  const transport = new (PayloadTransport as any)('http://localhost/', ENCODED_QUERY_PARAMS);

  /* Assertion */
  expect(transport instanceof PayloadTransport).toBe(true);
  expect(transport.endpoint).toBe('http://localhost/');
  expect((PayloadTransport.prototype as any).init).toBeCalledTimes(1);
});
