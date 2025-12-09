import { NativeModules, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

interface NativeModuleCheck {
  name: string;
  nativeModuleName: string;
  packageName: string;
  isExpoModule: boolean;
}

const REQUIRED_NATIVE_MODULES: NativeModuleCheck[] = [
  {
    name: 'expo-secure-store',
    nativeModuleName: 'ExpoSecureStore',
    packageName: 'expo-secure-store',
    isExpoModule: true,
  },
  {
    name: 'react-native-device-crypto',
    nativeModuleName: 'DeviceCrypto',
    packageName: 'react-native-device-crypto',
    isExpoModule: false,
  },
];

// Track if warning has been shown to avoid spamming
let hasWarned = false;

/**
 * Checks if all required native modules are properly installed and linked.
 * Logs a warning if any native module is missing.
 *
 * Note: Some native modules (like react-native-device-crypto) require hardware
 * features (e.g., Secure Enclave) that are not available in simulators/emulators.
 * The SDK will continue to work but certain security features may be degraded.
 */
export const checkNativeModules = (): void => {
  if (hasWarned) return;

  const missingModules: NativeModuleCheck[] = [];

  for (const module of REQUIRED_NATIVE_MODULES) {
    if (module.isExpoModule) {
      if (!requireOptionalNativeModule(module.nativeModuleName)) {
        missingModules.push(module);
      }
    } else {
      if (!NativeModules[module.nativeModuleName]) {
        missingModules.push(module);
      }
    }
  }

  if (missingModules.length > 0) {
    hasWarned = true;

    const platform = Platform.OS;
    const moduleList = missingModules.map(m => `  - ${m.packageName}`).join('\n');
    const installCommands = missingModules.map(m => `npx expo install ${m.packageName}`).join('\n');

    const iosInstructions =
      platform === 'ios'
        ? `
For iOS, run:
  npx expo run:ios
`
        : '';

    const androidInstructions =
      platform === 'android'
        ? `
For Android, run:
  npx expo run:android
`
        : '';

    console.warn(
      `@magic-sdk/react-native-expo: Missing native modules detected.

The following native modules are not linked:
${moduleList}

The SDK will continue to work, but some security features may not function properly.

Note: If you're running in a simulator/emulator, some native modules (like react-native-device-crypto) 
require hardware features (Secure Enclave) that are only available on physical devices.

If you're on a physical device and see this warning, please ensure the packages are installed and linked:

1. Install the missing packages:
${installCommands}

2. Rebuild your app:
${iosInstructions}${androidInstructions}
`,
    );
  }
};
