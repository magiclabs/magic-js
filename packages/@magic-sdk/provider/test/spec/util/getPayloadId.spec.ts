import { getPayloadId } from '../../../src/util/get-payload-id';

test('Returns an incremental, integer ID', async () => {
  const id = getPayloadId();
  expect(typeof id).toBe('number');
  expect(Number.isInteger(id)).toBe(true);
});

test('Does not have ID conflicts for at least 1,000,000 cycles', async () => {
  const allIds = new Set<number>();
  for (let i = 0; i < 1e6; i++) allIds.add(getPayloadId());
  expect(allIds.size).toBe(1e6);
});
