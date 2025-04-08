import { JSDOM } from 'jsdom';

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
  
  const win = jsdom.window as unknown as Window & typeof globalThis;
  
  Object.assign(global, {
    window: win,
    document: win.document,
    navigator: win.navigator,
    location: win.location,
    history: win.history,
    localStorage: win.localStorage,
    sessionStorage: win.sessionStorage,
    
    HTMLElement: win.HTMLElement,
    Element: win.Element,
    Node: win.Node,
    Event: win.Event,
    
    atob: win.atob,
    btoa: win.btoa,
    fetch: win.fetch,
    
    addEventListener: win.addEventListener,
    removeEventListener: win.removeEventListener,
  });
  
  return win;
}

createBrowserEnv.stub = (path: string | string[], value: any) => {
  const lastInPath = Array.isArray(path) ? path[path.length - 1] : path;
  if (typeof window !== 'undefined' && lastInPath) {
    try {
      (window as any)[lastInPath] = value;
    } catch (error) {
    }
  }
  return () => {}; // Restore function (no-op for simplicity)
};

createBrowserEnv.restore = () => window;

export default createBrowserEnv;
