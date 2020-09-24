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

const originalSDKEnvironment: any = {};

export function mockSDKEnvironmentConstant(key: keyof typeof SDKEnvironment, value: any) {
  if (!originalSDKEnvironment[key]) originalSDKEnvironment[key] = SDKEnvironment[key];
  (SDKEnvironment as any)[key] = value;
}

export function restoreSDKEnvironmentConstants() {
  Object.keys(originalSDKEnvironment).forEach((key) => {
    (SDKEnvironment as any)[key] = originalSDKEnvironment[key];
  });
}
