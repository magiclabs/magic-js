import '../../setup';

import test from 'ava';
import { getPayloadId } from '../../../src/util/get-payload-id';

/**
 * Returns a random number ID
 *
 * Action Must:
 * - Generate Int
 */
test('#01', async t => {
  const id = getPayloadId();
  t.is(typeof id, 'number');
  t.true(Number.isInteger(id));
});

/**
 * Does not have ID conflicts
 *
 * Action Must:
 * - For at least 1,000,000 cycles, it does not allow conflicts.
 */
test('#02', async t => {
  const allIds = new Set<number>();
  for (let i = 0; i < 1e6; i++) allIds.add(getPayloadId());
  t.is(allIds.size, 1e6);
});
