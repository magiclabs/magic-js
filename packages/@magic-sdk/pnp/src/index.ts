import { initiatePNPLogin } from './login';

if (['loaded', 'interactive', 'complete'].includes(document.readyState)) {
  initiatePNPLogin();
} else {
  window.addEventListener('load', initiatePNPLogin, true);
}
