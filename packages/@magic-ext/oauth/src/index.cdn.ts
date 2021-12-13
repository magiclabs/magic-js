import { OAuthExtension } from './index';
import * as types from './types';

Object.assign(OAuthExtension, {
  ...types,
});

export type { OAuthExtension as default };
module.exports = OAuthExtension;
