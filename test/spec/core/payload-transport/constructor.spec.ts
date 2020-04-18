import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { PayloadTransport } from '../../../../src/core/payload-transport';
import { ENCODED_QUERY_PARAMS } from '../../../constants';

test.beforeEach(t => {
  browserEnv();
  browserEnv.stub('addEventListener', sinon.stub());
});

/**
 * Instantiate when no endpoint is passed
 *
 * Action Must:
 * - Build instance
 * - Not throw
 */
test('#01', t => {
  /* Execution */
  const transport = new PayloadTransport(undefined, ENCODED_QUERY_PARAMS);

  /* Assertion */
  t.true(transport instanceof PayloadTransport);
  t.is((transport as any).endpoint, undefined);
});

/**
 * Instantiate with proper params
 *
 * Action Must:
 * - Build instance
 */
test.serial('#02', t => {
  /* Execution */
  const transport = new PayloadTransport('http://localhost/', ENCODED_QUERY_PARAMS);

  /* Assertion */
  t.true(transport instanceof PayloadTransport);
  t.is((transport as any).endpoint, 'http://localhost/');
});
