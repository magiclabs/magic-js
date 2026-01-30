import { SDKEnvironment } from '../core/sdk-environment';

function* createIntGenerator(): Generator<number, number, void> {
  let index = 0;

  while (true) {
    /* istanbul ignore else -- edge case: reset after MAX_SAFE_INTEGER, impractical to test */
    if (index < Number.MAX_SAFE_INTEGER) yield ++index;
    else index = 0;
  }
}

const intGenerator = createIntGenerator();

/**
 * Generate a random integer ID for react-native platforms.
 */
function getRandomId(): number {
  return Math.floor(Math.random() * 100000) + 1;
}

/**
 * Get an integer ID for attaching to a JSON RPC request payload.
 * Uses random ID generation for react-native bare or expo platforms,
 * otherwise uses sequential integer generation.
 */
export function getPayloadId(): number {
  const isReactNativeBareOrExpo =
    SDKEnvironment.sdkName === '@magic-sdk/react-native-bare' ||
    SDKEnvironment.sdkName === '@magic-sdk/react-native-expo';

  if (isReactNativeBareOrExpo) {
    return getRandomId();
  }

  return intGenerator.next().value;
}
