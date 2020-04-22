import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { ENCODED_QUERY_PARAMS } from '../../../constants';

test.beforeEach(t => {
  browserEnv();
  browserEnv.stub('addEventListener', sinon.stub());
});

test('Instantiate when no endpoint is passed', t => {
  /* Execution */
  const transport = new PayloadTransport(undefined, ENCODED_QUERY_PARAMS);

  /* Assertion */
  t.true(transport instanceof PayloadTransport);
  t.is((transport as any).endpoint, undefined);
});

test.serial('Instantiate with proper params', t => {
  /* Execution */
  const transport = new PayloadTransport('http://localhost/', ENCODED_QUERY_PARAMS);

  /* Assertion */
  t.true(transport instanceof PayloadTransport);
  t.is((transport as any).endpoint, 'http://localhost/');
});
