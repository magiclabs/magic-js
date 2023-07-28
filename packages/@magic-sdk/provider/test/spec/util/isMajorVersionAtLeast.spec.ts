import { isMajorVersionAtLeast } from '../../../src/util/version-check';

describe('isMajorVersionAtLeast', () => {
  it('should return true when the major version is greater than the required major version', () => {
    expect(isMajorVersionAtLeast('2.1.0', 1)).toBe(true);
    expect(isMajorVersionAtLeast('3.0.0', 2)).toBe(true);
  });

  it('should return true when the major version is equal to the required major version', () => {
    expect(isMajorVersionAtLeast('2.0.0', 2)).toBe(true);
    expect(isMajorVersionAtLeast('1.2.3', 1)).toBe(true);
  });

  it('should return false when the major version is less than the required major version', () => {
    expect(isMajorVersionAtLeast('1.1.1', 2)).toBe(false);
    expect(isMajorVersionAtLeast('0.9.8', 1)).toBe(false);
  });

  it('should handle single-digit version strings correctly', () => {
    expect(isMajorVersionAtLeast('3', 2)).toBe(true);
    expect(isMajorVersionAtLeast('1', 1)).toBe(true);
    expect(isMajorVersionAtLeast('0', 1)).toBe(false);
  });

  it('should handle non-standard version strings correctly', () => {
    expect(isMajorVersionAtLeast('1.beta', 1)).toBe(true);
    expect(isMajorVersionAtLeast('1.alpha', 2)).toBe(false);
  });

  it('should return false when the version string is empty', () => {
    expect(isMajorVersionAtLeast('', 1)).toBe(false);
  });
});
