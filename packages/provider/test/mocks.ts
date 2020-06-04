/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

import sinon from 'sinon';
import { getPayloadId } from '../src/util/get-payload-id';
import { SDKEnvironment } from '../src/core/sdk-environment';

export function getPayloadIdStub() {
  const stub = sinon.stub();
  (getPayloadId as any) = stub;
  return stub;
}

export function mockSDKEnvironmentConstant(key: keyof typeof SDKEnvironment, value: any) {
  (SDKEnvironment as any)[key] = value;
}
