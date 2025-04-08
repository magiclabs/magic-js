// NOTE: This module is automatically included at the top of each test file.

import 'regenerator-runtime/runtime';
import { JSDOM } from 'jsdom';
import { mockConsole } from '../../../scripts/utils/mock-console';

function setupBrowserEnv() {
  const jsdom = new JSDOM('', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });
  
  const win = jsdom.window;
  
  global.window = win;
  global.document = win.document;
  global.navigator = win.navigator;
  global.location = win.location;
  global.history = win.history;
  global.localStorage = win.localStorage;
  global.sessionStorage = win.sessionStorage;
  
  global.HTMLElement = win.HTMLElement;
  global.Element = win.Element;
  global.Node = win.Node;
  global.Event = win.Event;
  
  global.atob = win.atob;
  global.btoa = win.btoa;
  global.fetch = win.fetch;
  
  global.addEventListener = win.addEventListener;
  global.removeEventListener = win.removeEventListener;
  
  return win;
}

setupBrowserEnv();

global.browserEnv = {
  stub: (path, value) => {
    const lastInPath = Array.isArray(path) ? path[path.length - 1] : path;
    if (typeof window !== 'undefined' && lastInPath) {
      try {
        window[lastInPath] = value;
      } catch (error) {
        /* Silently ignore errors */
      }
    }
    return () => {}; // Restore function (no-op for simplicity)
  },
  restore: () => window,
};

beforeEach(() => {
  mockConsole();
});
