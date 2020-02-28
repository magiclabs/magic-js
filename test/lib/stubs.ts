import sinon from 'sinon';
import { getPayloadId } from '../../src/util/get-payload-id';

/**
 * Stubs the `createRandomId` util.
 */
export function getPayloadIdStub() {
  const stub = sinon.stub();
  (getPayloadId as any) = stub;
  return stub;
}
