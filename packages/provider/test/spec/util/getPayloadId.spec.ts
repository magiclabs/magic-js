import test from 'ava';
import { getPayloadId } from '../../../src/util/get-payload-id';

test('Returns an incremental, integer ID', async t => {
  const id = getPayloadId();
  t.is(typeof id, 'number');
  t.true(Number.isInteger(id));
});

test('Does not have ID conflicts for at least 1,000,000 cycles', async t => {
  const allIds = new Set<number>();
  for (let i = 0; i < 1e6; i++) allIds.add(getPayloadId());
  t.is(allIds.size, 1e6);
});
