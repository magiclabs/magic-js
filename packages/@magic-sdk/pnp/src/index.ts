import { getScriptData } from './utils/script-data';

// PnP contexts
import { login } from './context/login';
import { logout } from './context/logout';
import { callback } from './context/callback';
import { settings } from './context/settings';

function main() {
  const { src } = getScriptData();

  switch (src.pathname) {
    case '/pnp/login':
      return login();

    case '/pnp/logout':
      return logout();

    case '/pnp/callback':
      return callback();

    case '/pnp/settings':
      return settings();

    default:
      return;
  }
}

if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
  main();
} else {
  window.addEventListener('load', main, true);
}
