export const IS_REACT_NATIVE = Boolean(process.env.IS_REACT_NATIVE);
export const MAGIC_URL = IS_REACT_NATIVE ? 'https://mgbox.io/' : process.env.MAGIC_URL || 'https://auth.magic.link/';
export const SDK_NAME = process.env.SDK_NAME!;
export const SDK_VERSION = process.env.SDK_VERSION!;
