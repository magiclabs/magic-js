/*
  eslint-disable

  global-require,
  @typescript-eslint/no-var-requires
 */

import sinon from 'sinon';
import { getPayloadId } from '../src/util/get-payload-id';
import { SDKEnvironment } from '../src/core/sdk-environment';
import { transformNewAssertionForServer, transformAssertionForServer } from '../src/util/webauthn';

export function getPayloadIdStub() {
  const stub = sinon.stub();
  (getPayloadId as any) = stub;
  return stub;
}

export function mockSDKEnvironmentConstant(key: keyof typeof SDKEnvironment, value: any) {
  (SDKEnvironment as any)[key] = value;
}

export function transformNewAssertionForServerStub() {
  const stub = sinon.stub();
  (transformNewAssertionForServer as any) = stub;
  return stub;
}

export function transformAssertionForServerStub() {
  const stub = sinon.stub();
  (transformAssertionForServer as any) = stub;
  return stub;
}
