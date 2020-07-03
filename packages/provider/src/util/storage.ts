import localForage from 'localforage';
import { SDKEnvironment } from '../core/sdk-environment';

let configured: Promise<void>;

/**
 * Proxies `localforage` methods with strong-typing.
 */
function proxyLocalForageMethod<TMethod extends keyof LocalForageDbMethods>(method: TMethod): LocalForage[TMethod] {
  return async (...args: any[]) => {
    if (!configured) configured = SDKEnvironment.configureStorage();
    await configured;
    await localForage.ready();
    return (localForage[method] as any)(...args);
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
