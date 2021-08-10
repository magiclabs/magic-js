import browserEnv from '@ikscodes/browser-env';
import sinon from 'sinon';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { ENCODED_QUERY_PARAMS } from '../../../constants';

beforeEach(() => {
  browserEnv();
  browserEnv.stub('addEventListener', sinon.stub());

  (PayloadTransport.prototype as any).init = sinon.stub();
});

test('Instantiate when no endpoint is passed', () => {
  /* Execution */
  const transport = new (PayloadTransport as any)(undefined, ENCODED_QUERY_PARAMS);

  /* Assertion */
  expect(transport instanceof PayloadTransport).toBe(true);
  expect(transport.endpoint).toBe(undefined);
  expect((PayloadTransport.prototype as any).init.calledOnce).toBe(true);
});

test('Instantiate with proper params', () => {
  /* Execution */
  const transport = new (PayloadTransport as any)('http://localhost/', ENCODED_QUERY_PARAMS);

  /* Assertion */
  expect(transport instanceof PayloadTransport).toBe(true);
  expect(transport.endpoint).toBe('http://localhost/');
  expect((PayloadTransport.prototype as any).init.calledOnce).toBe(true);
});
