// Shim for CJS require() in ESM bundle
// This handles external packages that use require() internally
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJSXRuntime from 'react/jsx-runtime';

const modules = {
  'react': React,
  'react-dom': ReactDOM,
  'react/jsx-runtime': ReactJSXRuntime,
};

// Override the require function that esbuild generates
if (typeof globalThis !== 'undefined') {
  globalThis.__cjs_require__ = function(id) {
    if (modules[id]) return modules[id];
    throw new Error('Cannot find module: ' + id);
  };
}

