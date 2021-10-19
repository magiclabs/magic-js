/* eslint-disable no-useless-return */
/* eslint-disable consistent-return */

import { getScriptData } from './utils';
import { login } from './context/login';
import { logout } from './context/logout';
import { callback } from './context/callback';

function main() {
  const { src } = getScriptData();

  switch (src.pathname) {
    case '/pnp/login':
      return login();

    case '/pnp/logout':
      return logout();

    case '/pnp/callback':
      return callback();

    default:
      return;
  }
}

if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
  main();
} else {
  window.addEventListener('load', main, true);
}
