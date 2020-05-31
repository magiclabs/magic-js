/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

import sinon from 'sinon';
import * as ConfigConstants from '../src/config';
import { getPayloadId } from '../src/util/get-payload-id';
import { SDKEnvironment } from '../src/core/sdk-environment';

export function getPayloadIdStub() {
  const stub = sinon.stub();
  (getPayloadId as any) = stub;
  return stub;
}

export function mockConfigConstant(key: keyof typeof ConfigConstants, value: any) {
  (ConfigConstants as any)[key] = value;
}

export function mockSDKEnvironmentConstant(key: keyof typeof SDKEnvironment, value: any) {
  (SDKEnvironment as any)[key] = value;
}
