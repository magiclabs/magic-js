import browserEnv from '@ikscodes/browser-env';
import test from 'ava';
import sinon from 'sinon';
import { createReactNativeWebViewController } from '../../../../factories';
import { MSG_TYPES, ENCODED_QUERY_PARAMS } from '../../../../constants';
import { mockConfigConstant, reactNativeStyleSheetStub } from '../../../../mocks';

test.beforeEach(t => {
  browserEnv();
  mockConfigConstant('IS_REACT_NATIVE', true);
  reactNativeStyleSheetStub();
});

test.cb('Receive MAGIC_HIDE_OVERLAY, call `hideOverlay` if present', t => {
  const overlay = createReactNativeWebViewController('asdf');
  const hideOverlayStub = sinon.stub();
  (overlay as any).container = {
    hideOverlay: hideOverlayStub,
  };

  (overlay as any).transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }),
    },
  });

  setTimeout(() => {
    t.true(hideOverlayStub.calledOnce);
    t.end();
  }, 0);
});

test.cb('Receive MAGIC_HIDE_OVERLAY, not call `hideOverlay` if nil', t => {
  const overlay = createReactNativeWebViewController('asdf');

  (overlay as any).transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: MSG_TYPES().MAGIC_HIDE_OVERLAY }),
    },
  });

  setTimeout(() => {
    t.end();
  }, 0);
});

test.cb('Receive MAGIC_SHOW_OVERLAY, call `showOverlay` if present', t => {
  const overlay = createReactNativeWebViewController('asdf');
  const showOverlayStub = sinon.stub();
  (overlay as any).container = {
    showOverlay: showOverlayStub,
  };

  (overlay as any).transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }),
    },
  });

  setTimeout(() => {
    t.true(showOverlayStub.calledOnce);
    t.end();
  }, 0);
});

test.cb('Receive MAGIC_SHOW_OVERLAY, not call `showOverlay` if nil', t => {
  const overlay = createReactNativeWebViewController('asdf');

  (overlay as any).transport.handleReactNativeWebViewMessage({
    nativeEvent: {
      url: `asdf/send/?params=${ENCODED_QUERY_PARAMS}`,
      data: JSON.stringify({ msgType: MSG_TYPES().MAGIC_SHOW_OVERLAY }),
    },
  });

  setTimeout(() => {
    t.end();
  }, 0);
});
