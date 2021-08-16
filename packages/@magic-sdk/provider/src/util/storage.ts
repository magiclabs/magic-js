import { SDKEnvironment } from '../core/sdk-environment';

let lf: LocalForage;

/**
 * Proxies `localforage` methods with strong-typing.
 */
function proxyLocalForageMethod<TMethod extends keyof LocalForageDbMethods>(method: TMethod): LocalForage[TMethod] {
  return async (...args: any[]) => {
    /* istanbul ignore else */
    if (!lf) lf = await SDKEnvironment.configureStorage();
    await lf.ready();
    return (lf[method] as any)(...args);
  };
}

export const getItem = proxyLocalForageMethod('getItem');
export const setItem = proxyLocalForageMethod('setItem');
export const removeItem = proxyLocalForageMethod('removeItem');
export const clear = proxyLocalForageMethod('clear');
export const length = proxyLocalForageMethod('length');
export const key = proxyLocalForageMethod('key');
export const keys = proxyLocalForageMethod('keys');
export const iterate = proxyLocalForageMethod('iterate');
