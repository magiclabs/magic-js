import { getPayloadId } from '../../../src/util/get-payload-id';
import { SDKEnvironment } from '../../../src/core/sdk-environment';

describe('getPayloadId - default (incremental)', () => {
  beforeEach(() => {
    // Reset to default SDK environment
    SDKEnvironment.sdkName = 'magic-sdk';
  });

  test('Returns an incremental, integer ID', async () => {
    const id = getPayloadId();
    expect(typeof id).toBe('number');
    expect(Number.isInteger(id)).toBe(true);
  });

  test('Does not have ID conflicts for at least 1,000,000 cycles', async () => {
    const allIds = new Set<number>();
    for (let i = 0; i < 1e6; i++) allIds.add(getPayloadId());
    expect(allIds.size).toBe(1e6);
  });
});

describe('getPayloadId - react-native-bare (random)', () => {
  beforeEach(() => {
    SDKEnvironment.sdkName = '@magic-sdk/react-native-bare';
  });

  test('Returns a random integer ID between 1 and 100000', async () => {
    const id = getPayloadId();
    expect(typeof id).toBe('number');
    expect(Number.isInteger(id)).toBe(true);
    expect(id).toBeGreaterThanOrEqual(1);
    expect(id).toBeLessThanOrEqual(100000);
  });

  test('Generates IDs within the expected range for multiple calls', async () => {
    for (let i = 0; i < 1000; i++) {
      const id = getPayloadId();
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(100000);
    }
  });
});

describe('getPayloadId - react-native-expo (random)', () => {
  beforeEach(() => {
    SDKEnvironment.sdkName = '@magic-sdk/react-native-expo';
  });

  test('Returns a random integer ID between 1 and 100000', async () => {
    const id = getPayloadId();
    expect(typeof id).toBe('number');
    expect(Number.isInteger(id)).toBe(true);
    expect(id).toBeGreaterThanOrEqual(1);
    expect(id).toBeLessThanOrEqual(100000);
  });

  test('Generates IDs within the expected range for multiple calls', async () => {
    for (let i = 0; i < 1000; i++) {
      const id = getPayloadId();
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(100000);
    }
  });
});
