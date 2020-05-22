/* eslint-disable global-require */

/**
 * This library is built to work seamlessly between Web & React Native
 * environments. To meet this requirement, certain dependencies should be
 * typed as `any` as they will be stripped completely from the bundled code.
 *
 * Dependencies registered in this dictionary are considered "noop" in Web
 * environments.
 */
export const webSafeImports = {
  rn: require('react-native'),
  rnwv: require('react-native-webview'),
  url: require('whatwg-url'),
};
