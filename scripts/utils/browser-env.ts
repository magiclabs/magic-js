"use strict";

const { JSDOM } = require('jsdom');

/**
 * Creates a browser environment using JSDOM for testing.
 * This is a direct replacement for @ikscodes/browser-env.
 */
function createBrowserEnv(options = {}) {
  const jsdom = new JSDOM('', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    ...options,
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

createBrowserEnv.stub = (path, value) => {
  const lastInPath = Array.isArray(path) ? path[path.length - 1] : path;
  if (typeof window !== 'undefined' && lastInPath) {
    try {
      window[lastInPath] = value;
    } catch (error) {
    }
  }
  return () => {}; // Restore function (no-op for simplicity)
};

createBrowserEnv.restore = () => window;

module.exports = createBrowserEnv;
