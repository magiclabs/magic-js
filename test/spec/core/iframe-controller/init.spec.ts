/* eslint-disable @typescript-eslint/no-empty-function */

import '../../../setup';

import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { IframeController } from '../../../../src/core/iframe-controller';
import { ENCODED_QUERY_PARAMS, MAGIC_RELAYER_FULL_URL } from '../../../lib/constants';
import { createIframeController } from '../../../lib/factories';

function createOverlayElementsStub() {
  const classListAddStub = sinon.stub();
  const createElementStub = sinon.stub();
  createElementStub.withArgs('iframe').returns({
    className: null,
    src: null,
    classList: { add: classListAddStub },
    dataset: {},
    style: { display: 'none' },
  });
  createElementStub.withArgs('img').returns({ src: null, style: {} });

  return {
    classListAddStub,
    createElementStub,
  };
}

test.beforeEach(t => {
  browserEnv.restore();
  browserEnv.stub('addEventListener', sinon.stub());
  browserEnv.stub('removeEventListener', sinon.stub());
  (IframeController.prototype as any).listen = sinon.stub();
});

/**
 * Initialization
 *
 * Action Must:
 * - Append header with style
 * - Append body with iframe
 * - resolve an iframe object
 */
test.serial('#01', async t => {
  const { classListAddStub, createElementStub } = createOverlayElementsStub();
  const appendChildStub = sinon.stub();

  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'loaded');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  const overlay = createIframeController();
  const iframe = await overlay.iframe;

  t.is(
    (appendChildStub.args[0][0] as HTMLIFrameElement).src,
    `${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`,
  );
  t.true(classListAddStub.calledWith('magic-iframe'));
  t.deepEqual(iframe.dataset, { magicIframeLabel: 'auth.magic.link' });
  t.is(iframe.src, `${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`);
});

/**
 * Duplicate Instance
 *
 * Action Must:
 * - Display error in console
 */
test.serial('#02', async t => {
  const { createElementStub } = createOverlayElementsStub();

  browserEnv.stub('document.querySelectorAll', () => [{ src: ENCODED_QUERY_PARAMS }]);
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'loaded');

  const consoleWarnStub = sinon.stub();
  browserEnv.stub('console.warn', consoleWarnStub);

  createIframeController();

  t.is(consoleWarnStub.args[0][0], 'Magic SDK Warning: [DUPLICATE_IFRAME] Duplicate iframes found.');
});

/**
 * Document is not ready
 *
 * Action Must:
 * - addEventListener to 'load'
 */
test.serial('#03', t => {
  const { createElementStub } = createOverlayElementsStub();

  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'initializing');

  createIframeController();

  t.is((window as any).addEventListener.args[1][0], 'load');
});

/**
 * iframe src is `undefined`
 *
 * Action Must:
 * - Assume iframe is not yet initialized.
 */
test.serial('#04', async t => {
  const { classListAddStub, createElementStub } = createOverlayElementsStub();
  const appendChildStub = sinon.stub();

  browserEnv.stub('document.querySelectorAll', () => ({ length: 0 }));
  browserEnv.stub('document.createElement', createElementStub);
  browserEnv.stub('document.readyState', 'loaded');
  browserEnv.stub('document.body.appendChild', appendChildStub);

  const overlay = createIframeController();
  const iframe = await overlay.iframe;

  t.is(
    (appendChildStub.args[0][0] as HTMLIFrameElement).src,
    `${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`,
  );
  t.true(classListAddStub.calledWith('magic-iframe'));
  t.deepEqual(iframe.dataset, { magicIframeLabel: 'auth.magic.link' });
  t.is(iframe.src, `${MAGIC_RELAYER_FULL_URL}/send?params=${ENCODED_QUERY_PARAMS}`);
});
