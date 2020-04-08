/* eslint-disable no-underscore-dangle, @typescript-eslint/no-empty-function */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createMagicSDK } from '../../../lib/factories';
import { getPayloadIdStub } from '../../../lib/stubs';
import { BaseModule } from '../../../../src/modules/base-module';
import { Web3Module } from '../../../../src/modules/web3';
import { createSynchronousWeb3MethodWarning } from '../../../../src/core/sdk-exceptions';

test.beforeEach(t => {
  browserEnv.restore();
  (BaseModule as any).prototype.request = sinon.stub();
  (Web3Module as any).prototype.sendAsync = sinon.stub();
});

/**
 * Send asynchronously using payload method (as string).
 *
 * Action Must:
 * - Send with the supplied payload method.
 * - Use a fallback argument for `params` (empty array).
 */
test.serial('#01', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.web3.send('eth_call');

  const requestPayload = (magic.web3 as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, []);
});

/**
 * Send asynchronously using payload method (as string).
 *
 * Action Must:
 * - Send with the supplied payload method.
 * - Use the given argument for `params`.
 */
test.serial('#02', async t => {
  const magic = createMagicSDK();

  const idStub = getPayloadIdStub();
  idStub.returns(999);

  magic.web3.send('eth_call', ['hello world']);

  const requestPayload = (magic.web3 as any).request.args[0][0];
  t.is(requestPayload.id, 999);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, ['hello world']);
});

/**
 * Send asynchronously using RPC payload + callback
 *
 * Action Must:
 * - Send with the supplied payload.
 */
test.serial('#03', async t => {
  const magic = createMagicSDK();

  const onRequestComplete = () => {};
  magic.web3.send({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] }, onRequestComplete);

  const requestPayload = (magic.web3 as any).sendAsync.args[0][0];
  const expectedCallback = (magic.web3 as any).sendAsync.args[0][1];
  t.is(requestPayload.id, 1);
  t.is(requestPayload.method, 'eth_call');
  t.deepEqual(requestPayload.params, ['hello world']);
  t.is(onRequestComplete, expectedCallback);
});

/**
 * Send asynchronously using batch RPC payload + callback
 *
 * Action Must:
 * - Send with the supplied payloads.
 */
test.serial('#04', async t => {
  const magic = createMagicSDK();

  const onRequestComplete = () => {};
  const payload1 = { jsonrpc: '2.0', id: 1, method: 'first', params: ['hello world'] };
  const payload2 = { jsonrpc: '2.0', id: 2, method: 'second', params: ['goodbye world'] };
  magic.web3.send([payload1, payload2], onRequestComplete);

  const requestPayload = (magic.web3 as any).sendAsync.args[0][0];
  const expectedCallback = (magic.web3 as any).sendAsync.args[0][1];
  t.is(requestPayload[0].id, 1);
  t.is(requestPayload[0].method, 'first');
  t.deepEqual(requestPayload[0].params, ['hello world']);
  t.is(requestPayload[1].id, 2);
  t.is(requestPayload[1].method, 'second');
  t.deepEqual(requestPayload[1].params, ['goodbye world']);
  t.is(onRequestComplete, expectedCallback);
});

/**
 * Send synchronously (legacy behavior) using RPC payload and no callback.
 *
 * Action Must:
 * - Send with the supplied payload.
 * - Log a deprecation warning to the console.
 * - Return a JSON RPC reponse payload.
 */
test.serial('#05', async t => {
  const magic = createMagicSDK();

  const consoleWarnStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarnStub);

  const result = magic.web3.send({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: ['hello world'] });
  const expectedWarning = createSynchronousWeb3MethodWarning();

  t.is(result.jsonrpc, '2.0');
  t.is(result.id, 1);
  t.is(result.error.code, -32603);
  t.is(result.error.message, expectedWarning.rawMessage);
  t.true(consoleWarnStub.calledWith(expectedWarning.message));
});

// /**
//  * Send asynchronously using RPC payload + callback
//  *
//  * Action Must:
//  * - Send with the supplied payload
//  */
// test.serial('#02', t => {
//   /* Mocking and Stubbing */
//   const provider = createFmProvider();
//   const randomIdStub = getPayloadIdStub();
//   randomIdStub.returns(1);

//   /* Execution */
//   const cb = () => {};
//   provider.send(
//     {
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'eth_sendTransaction',
//       params: [],
//     },
//     cb,
//   );

//   /* Assertion */
//   t.deepEqual((provider as any).queue[0], {
//     payload: {
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'eth_sendTransaction',
//       params: [],
//     },
//     onRequestComplete: cb,
//   });
// });

// /**
//  * Send synchronously (legacy behavior) using RPC payload and no callback
//  *
//  * Action Must:
//  * - Send with the supplied payload
//  * - Return a JSON RPC reponse payload
//  */
// test.serial('#03', t => {
//   /* Mocking and Stubbing */
//   const provider = createFmProvider();
//   const randomIdStub = getPayloadIdStub();
//   randomIdStub.returns(1);

//   const consoleWarnStub = sinon.stub();
//   browserEnv.stub('console', {
//     warn: consoleWarnStub,
//   });

//   const expectedResults = {
//     net_version: 4,
//     eth_accounts: [],
//     eth_coinbase: null,
//     eth_uninstallFilter: true,
//     not_a_real_method: {}, // Should reach `default` case of switch
//   };

//   Object.keys(expectedResults).forEach(method => {
//     /* Execution */
//     const result = provider.send({
//       method,
//       jsonrpc: '2.0',
//       id: 1,
//       params: [],
//     });

//     /* Assertion */
//     t.deepEqual(result, {
//       jsonrpc: '2.0',
//       id: 1,
//       error: {
//         code: -32603,
//         message:
//           'Non-async web3 methods will be deprecated in web3 > 1.0 and are not supported by the Fortmatic provider. An async method is to be used instead.',
//       },
//       result: null,
//     });

//     t.true(
//       consoleWarnStub.calledWith(
//         'Fortmatic SDK Warning: [SYNC_WEB3_METHOD] Non-async web3 methods will be deprecated in web3 > 1.0 and are not supported by the Fortmatic provider. An async method is to be used instead.',
//       ),
//     );
//   });
// });
