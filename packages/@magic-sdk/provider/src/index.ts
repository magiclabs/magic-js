/* istanbul ignore file */

export { SDKBase, sdkInitializationTimeout30s, sdkInitializationTimeout60s } from './core/sdk';
export type { MagicSDKAdditionalConfiguration, MagicSDKExtensionsOption } from './core/sdk';
export { createSDK } from './core/sdk-environment';
export { ViewController } from './core/view-controller';
export * from './core/sdk-exceptions';
export { Extension } from './modules/base-extension';
export type { WithExtensions, InstanceWithExtensions } from './modules/base-extension';
export * from './util';
export { logger } from './util/dd-tracker';
