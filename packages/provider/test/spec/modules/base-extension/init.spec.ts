/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import { Extension } from '../../../../src/modules/base-extension';
import { createMagicSDK } from '../../../factories';

test.beforeEach((t) => {
  browserEnv.restore();
});

test('`baseExtension.init` is no-op if already initialized', (t) => {
  const sdk = createMagicSDK();
  const baseExtension = new (Extension as any)();

  baseExtension.init(sdk);

  t.is(baseExtension.sdk, sdk);

  baseExtension.init('hello world');

  t.is(baseExtension.sdk, sdk);
});
